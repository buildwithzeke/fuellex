# FuelLex — Architecture

This document describes how FuelLex is structured at a system level: how the client and server relate to each other, how a request travels through the stack, and how each major layer is organized.

---

## Table of Contents

1. [Big Picture](#big-picture)
2. [Client Architecture](#client-architecture)
3. [Server Architecture](#server-architecture)
4. [Request Lifecycle](#request-lifecycle)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Key Design Decisions](#key-design-decisions)

---

## Big Picture

```
┌─────────────────────────────────────┐
│           Browser (React)           │
│                                     │
│  Pages → Components → Services      │
│               │                     │
│           Axios (lib/api.js)        │
│               │                     │
└───────────────┼─────────────────────┘
                │ HTTPS (JSON)
                ▼
┌─────────────────────────────────────┐
│         Express Server              │
│                                     │
│  Routes → Middleware → Controllers  │
│               │                     │
│           Prisma ORM                │
│               │                     │
└───────────────┼─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│       PostgreSQL (Supabase)         │
│                                     │
│  users, fuel_stations, fuel_reports │
└─────────────────────────────────────┘
```

The frontend and backend are **completely separate applications** that communicate over HTTP. They can be deployed independently. In development, they run on different ports (5173 for the client, 7000 for the server).

There is no server-side rendering. The client is a Single Page Application (SPA) — the browser downloads the React bundle once and all routing happens client-side.

---

## Client Architecture

### Entry Point and Provider Tree

`main.jsx` mounts the React app and wraps everything in a layered provider tree:

```
ThemeProvider
  └── ToastProvider
        └── AuthProvider
              └── BrowserRouter
                    └── App (routes)
```

Order matters here. `AuthProvider` sits inside `ToastProvider` so the auth logic can fire toasts. `BrowserRouter` is the outermost router so context providers can call `useNavigate` if needed.

### Routing

All routes are declared in `App.jsx` using React Router v7:

```
/             → LandingPage        (public marketing page)
/explore      → ExplorePage        (map + station list — the main screen)
/station/:id  → StationDetailPage  (single station, prices, history)
/report       → ReportPage         (submit a price report — auth required)
/reports      → ReportsPage        (browse all recent reports)
/profile      → ProfilePage        (account info + logout)
/dashboard    → DashboardPage      (admin analytics — admin required)
/login        → LoginPage
/register     → RegisterPage
*             → NotFoundPage
```

There is no programmatic route protection wrapper (no `<PrivateRoute>`). Instead, each page that needs auth checks `useAuth()` at the top and redirects or renders a gate UI itself. This keeps the routing file clean and makes per-page behavior explicit.

### Layer Responsibilities

```
pages/          Route-level components. Orchestrate data fetching,
                local state, and composition of smaller components.
                One file per route.

components/     Reusable pieces. Never fetch data directly — they
                receive everything via props. Subdivided by domain:
                  auth/      Layout shell for login/register pages
                  dashboard/ Stat cards, charts, reports table
                  layout/    Navbar, mobile bottom nav, FAB, AppShell
                  map/       Leaflet map, custom pins, popups, legend
                  report/    Price report form
                  station/   Station cards, list, filter panel
                  ui/        Design system primitives (Button, Modal, etc.)

services/       Thin async functions, one per API resource.
                Each function calls lib/api.js and returns the
                unwrapped data payload. No component-level fetch logic.

hooks/          Stateful data-fetching hooks (useStations, useReports)
                and utility hooks (useMediaQuery, useIsDesktop).

context/        Three providers:
                  AuthContext   → user session + JWT
                  ThemeContext  → light/dark mode
                  ToastContext  → notification queue

lib/            Pure utility functions with no side effects:
                  api.js     Axios instance + interceptors
                  format.js  Currency, distance, date formatters
                  fuel.js    Fuel-domain helpers and constants
                  geo.js     Haversine distance, geolocation
```

### State Management

FuelLex does not use Redux, Zustand, or any external state library. State is managed with three mechanisms:

1. **React Context** — for cross-cutting concerns that many components need: auth session, theme, toasts.
2. **Local `useState`** — for page-level state like filters, modal open/close, form values.
3. **Custom hooks** — `useStations` and `useReports` encapsulate fetch state (loading, error, data, refetch) and are used directly in pages.

This works well at the current scale. If the app grows significantly, migrating to a server-state library like React Query would be a natural next step.

---

## Server Architecture

### Entry Points

```
server.js   Imports app.js, starts the HTTP listener on process.env.PORT.
app.js      Creates the Express app, registers global middleware, mounts
            all four route groups, and attaches the error handler.
```

### Layer Stack (per request)

```
Incoming HTTP Request
        │
        ▼
    CORS middleware          (express cors — allows all origins by default)
    Body parser              (express.json + urlencoded)
        │
        ▼
    Route matching           (/api/auth, /api/stations, /api/reports, /api/users)
        │
        ▼
    Route-specific middleware
      protect                (verifies JWT, loads req.user from DB)
      restrictTo('ADMIN')    (role gate, used on admin-only routes)
      validate(zodSchema)    (validates req.body / req.query; 400 on failure)
        │
        ▼
    Controller function      (queries Prisma, builds response)
        │
        ▼
    Global error handler     (catches thrown errors, maps to HTTP status codes)
        │
        ▼
    HTTP Response (JSON)
```

### Controllers

Each controller file handles one resource:

| File | Resource | Operations |
|---|---|---|
| `auth.controller.js` | User auth | register, login, getProfile |
| `station.controller.js` | Fuel stations | getStations, getStationById, createStation, updateStation, deleteStation |
| `report.controller.js` | Fuel reports | getReports, createReport, getReportsByStation |
| `user.controller.js` | Users | getUsers (admin only) |

Controllers always follow the same pattern:
1. Destructure what they need from `req.body`, `req.params`, or `req.query`
2. Interact with Prisma
3. Send a structured JSON response
4. Pass unexpected errors to `next(error)`

### Response Envelope

Every API response uses a consistent shape:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { ... }
}
```

Error responses follow the same shape with `success: false` and no `data` field:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

The Axios response interceptor on the client (`lib/api.js`) automatically unwraps this envelope so service functions just receive the `data` payload directly.

### Error Handler

`middleware/errorHandler.js` is the last middleware in the chain. It handles:

| Error type | HTTP status | Trigger |
|---|---|---|
| Zod validation error | 400 | Invalid request body |
| Prisma P2002 | 400 | Unique constraint violation (duplicate email, etc.) |
| Prisma P2025 | 404 | Record not found |
| All others | 500 | Unexpected server error |

---

## Request Lifecycle

Here is a complete trace of what happens when a logged-in user submits a price report.

### Step-by-step

```
1. User fills out ReportForm and clicks "Submit"

2. ReportPage calls createReport({ stationId, fuelType, price, available })
   from services/reports.js

3. services/reports.js calls api.post('/api/reports', payload)
   via the shared Axios instance in lib/api.js

4. lib/api.js request interceptor runs:
   → reads fuellex_token from localStorage
   → attaches "Authorization: Bearer <token>" header

5. HTTP POST /api/reports hits the Express server

6. CORS and body-parser middleware process the request

7. Route matching: report.routes.js handles POST /

8. protect middleware runs:
   → extracts token from Authorization header
   → calls verifyToken(token) — checks JWT signature + expiry
   → looks up user in PostgreSQL via Prisma
   → attaches user object to req.user
   → calls next()

9. validate(createReportSchema) middleware runs:
   → Zod parses req.body
   → if invalid: immediately returns 400 JSON error
   → if valid: calls next()

10. createReport controller runs:
    → calls prisma.fuelReport.create({ data: { ...payload, userId: req.user.id } })
    → returns 201 JSON with the new report

11. lib/api.js response interceptor unwraps the { success, message, data } envelope
    → resolves the promise with just the data payload

12. ReportPage receives the new report object
    → shows a success toast
    → navigates to /dashboard (admin) or /reports (regular user)
```

### What happens on auth failure

If the JWT is missing, expired, or the user no longer exists in the database:

- Server returns `401 Unauthorized`
- `lib/api.js` response interceptor catches the 401, clears the token from localStorage
- The error propagates as a normalized `Error` object to the calling component
- The component displays an error state or redirects to `/login`

---

## Data Flow Diagrams

### Explore Page — station loading

```
ExplorePage mounts
    │
    ├── resolveLocation() [geo.js]
    │       calls browser Geolocation API (6s timeout)
    │       falls back to Lagos center if denied/unavailable
    │       → sets location state { lat, lng, located }
    │
    └── useStations({ lat, lng, radius, search }) [hooks/useStations.js]
            debounces params (300ms)
            calls GET /api/stations?lat=&lng=&radius=&search=
                │
                Server bounding-box query (Prisma)
                    ↓
                Haversine filter + sort by distance
                    ↓
                Returns station array with embedded reports[]
            → sets { stations, loading, error }

    Client-side filtering (useMemo):
        stations → filtered by fuelType, availability, maxPrice
        → visible[]

    visible[] rendered in:
        ├── StationMap    (Leaflet pins, color-coded by price vs average)
        └── StationList   (desktop sidebar) / horizontal cards (mobile)
```

### Dashboard — admin analytics

```
DashboardPage mounts
    │
    isAdmin check → if false, render gate UI (no API calls)
    │
    Promise.all([
        getStations({ radius: 200 }),    ← wide radius to capture all stations
        getReports()                     ← all reports (no filter)
    ])
    │
    useMemo derives:
        stationCount, reportCount
        newStationsThisWeek, reportsThisWeek   ← filter by createdAt >= 7 days ago
        avgPms                                  ← average of latest PMS report per station
        inStockPct                              ← % of stations with available=true
        days[7]                                 ← daily average PMS prices for bar chart

    Rendered as:
        4× StatCard
        PriceChart  (7-day bar chart)
        DonutChart  (in-stock ratio)
        ReportsTable (latest 10 reports)
```

---

## Key Design Decisions

### Why no server-side rendering?
FuelLex is an interactive map application. Almost every meaningful action requires the user's geolocation or a live API call. SSR would add complexity without meaningful benefit for this use case.

### Why client-side filtering instead of server-side for fuel type / price?
The station list is already scoped to a small geographic radius (default 15 km). The result set is small enough (~20–50 stations) that filtering by fuel type, availability, and max price in the browser is instant and avoids extra round trips. This also means the map can re-filter instantly as the user moves sliders, with no network delay.

### Why JWT in localStorage instead of HttpOnly cookies?
The API is designed to be consumed by multiple clients (web, potential future mobile apps). LocalStorage is the simplest cross-origin credential store for this case. The trade-off is XSS vulnerability — this is acceptable for a community data app but should be revisited if the app ever handles sensitive financial data.

### Why Prisma over raw SQL or another ORM?
Prisma's type-safe query builder eliminates an entire class of bugs (wrong column names, bad joins) and the schema file serves as living documentation for the database. Migration tracking is built in. For a solo or small team, the developer experience benefit outweighs the abstraction overhead.

### Why Zod for validation?
Zod schemas are defined once and enforce the exact shape of incoming request bodies. Errors produce human-readable messages that flow straight through the error handler to the client. The same Zod schema can also be used to infer TypeScript types if the project migrates to TypeScript.

### Why no Redux / Zustand?
At the current scale (one user session, one active page at a time), React Context + local state is sufficient. Adding a global store would introduce indirection without solving a real problem. The `useStations` and `useReports` hooks co-locate fetch logic with the components that own it.
