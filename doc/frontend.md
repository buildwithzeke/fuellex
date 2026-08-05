
# FuelLex — Frontend Reference

Complete guide to every page, component, hook, context, and utility in the React client.

---

## Table of Contents

1. [Entry Point & Provider Tree](#entry-point--provider-tree)
2. [Pages](#pages)
3. [Layout Components](#layout-components)
4. [Map Components](#map-components)
5. [Station Components](#station-components)
6. [Report Component](#report-component)
7. [Dashboard Components](#dashboard-components)
8. [Auth Components](#auth-components)
9. [UI Primitives](#ui-primitives)
10. [Context Providers](#context-providers)
11. [Custom Hooks](#custom-hooks)
12. [Services](#services)
13. [Utility Libraries](#utility-libraries)

---

## Entry Point & Provider Tree

**`src/main.jsx`** bootstraps the app. It wraps everything in four nested providers:

```
ThemeProvider          ← light/dark mode, persisted to localStorage
  ToastProvider        ← global notification queue
    AuthProvider       ← JWT session management
      BrowserRouter    ← React Router
        App            ← route definitions
```

The order is deliberate. `AuthProvider` sits inside `ToastProvider` so auth actions
(login success, token expiry) can fire toasts. All providers are available to every
component in the tree via their respective `use*` hooks.

**`src/App.jsx`** declares all routes with React Router `<Routes>`:

| Path | Component | Auth |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/explore` | `ExplorePage` | Public |
| `/station/:id` | `StationDetailPage` | Public |
| `/report` | `ReportPage` | Auth required (redirects) |
| `/reports` | `ReportsPage` | Public |
| `/profile` | `ProfilePage` | Auth required (redirects) |
| `/dashboard` | `DashboardPage` | Admin required (gate UI) |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `*` | `NotFoundPage` | Public |

A `<ScrollToTop>` component inside `App` listens to `pathname` changes and calls
`window.scrollTo(0, 0)` to reset scroll position on every navigation.

---

## Pages

### LandingPage — `/`

**File:** `src/pages/LandingPage.jsx`

The marketing home page. Four sections stacked vertically:

1. **Hero** — gradient background, tagline, search form that redirects to `/explore?search=`, two CTA buttons (Find Nearby → `/explore`, Report Price → `/report`), three feature badges.
2. **Features** — grid of three `Card` components highlighting fuel types, pin color system, and community updates.
3. **CTA band** — primary-blue full-width strip with a "Report a price" button.
4. **Developer bio** — `Avatar`, social icon links (Twitter/X, GitHub, LinkedIn, Instagram), WhatsApp chat link. Built by Ezekiel Ayebidun.

No data fetching. Pure presentational.

---

### ExplorePage — `/explore`

**File:** `src/pages/ExplorePage.jsx`

The primary screen. Map-first layout with adaptive desktop/mobile behavior.

**State managed locally:**

| State | Type | Purpose |
|---|---|---|
| `filters` | object | `{ fuelType, inStockOnly, maxPrice, radius }` |
| `location` | object | `{ lat, lng, located }` — user's GPS or Lagos fallback |
| `activeId` | string | ID of the currently selected station pin |
| `filterOpen` | boolean | Controls filter panel visibility |
| `addOpen` | boolean | Controls Add Station modal |
| `adding` | boolean | Submission loading state |
| `addError` | string | Error message from station creation |

**Data flow:**

1. On mount, `resolveLocation()` tries the browser Geolocation API (6 s timeout), falls back to Lagos center `{lat: 6.5244, lng: 3.3792}`.
2. `useStations({ lat, lng, radius, search })` fetches stations from the server whenever location or search changes.
3. A `useMemo` block client-side filters the result by `fuelType`, `inStockOnly`, and `maxPrice` → `visible[]`.
4. A second `useMemo` computes `average` price across `visible[]` for pin colour coding.

**Desktop layout:** fixed-width sidebar (340px / 380px xl) on the left with `StationList`, full-height `StationMap` filling the rest.

**Mobile layout:** `StationMap` fills the screen; a bottom sheet (fixed, above the tab bar) shows a horizontal-scroll strip of `StationCard` components. Filters render in a full-height slide-up sheet instead of a modal.

**Add Station flow:**
- Authenticated users click "Add Station" → `AddStationForm` opens in a `Modal`.
- Unauthenticated users are redirected to `/login` with `state.from = '/explore?add=true'`.
- The `?add=true` query param also triggers the modal on return from login.

---

### StationDetailPage — `/station/:id`

**File:** `src/pages/StationDetailPage.jsx`

Single station view. Fetches the full station (with all reports) from `GET /api/stations/:id`.

**Layout:**
- Header: station name, verified star badge, address, Directions button (opens Google Maps).
- Price panel (`Card`): `SegmentedControl` for fuel type, large price display, availability `Tag`, last updated time.
- Bottom grid (2 cols on large screens):
  - Left: Google Maps embedded `<iframe>` + report count + average + "Report Price" button.
  - Right: `ReportsTable` with full report history.

**State:** `fuelType` (default `PMS`) drives which report's data is shown in the price panel. A `tick` counter triggers a manual refetch when `refetch()` is called.

---

### ReportPage — `/report`

**File:** `src/pages/ReportPage.jsx`

Redirects to `/login` immediately if the user is not authenticated (using `<Navigate>`).

On mount, fetches all stations via `getStations()` to populate the station dropdown. Reads `?station=<id>` from the URL to pre-select a station.

On submit, calls `createReport(payload)`. On success:
- Fires a success toast with the price and fuel type.
- Navigates admin users to `/dashboard`, regular users to `/reports`.

---

### ReportsPage — `/reports`

**File:** `src/pages/ReportsPage.jsx`

Displays all recent community price reports. Uses the `useReports` hook.

Five fuel-type filter pills at the top (`All`, `PMS`, `AGO`, `DPK`, `LPG`). Selecting a pill re-fetches reports filtered by that fuel type. Each report card links to the station detail page.

---

### ProfilePage — `/profile`

**File:** `src/pages/ProfilePage.jsx`

Redirects to `/login` if not authenticated. Shows:
- `Avatar` with initials
- Name, email, role `Tag` (Administrator / Contributor)
- Joined date
- "View Dashboard" button (admin only)
- "Report a Price" button
- "Log out" button (calls `logout()` then navigates to `/`)

---

### LoginPage — `/login`

**File:** `src/pages/LoginPage.jsx`

Email + password form inside `AuthShell`. Reads `location.state.from` to redirect back to the page the user tried to visit. Admin users are always redirected to `/dashboard` after login regardless of `from`.

---

### RegisterPage — `/register`

**File:** `src/pages/RegisterPage.jsx`

Name + email + password form inside `AuthShell`. Calls `AuthContext.register()` which internally creates the account then immediately logs in (so a token is issued). Redirects to `location.state.from` on success.

---

### DashboardPage — `/dashboard`

**File:** `src/pages/DashboardPage.jsx`

Admin-only analytics. Renders a gate `EmptyState` for unauthenticated or non-admin visitors without making any API calls.

Fetches `getStations({ radius: 200 })` and `getReports()` in parallel on mount.

**Derived stats (all `useMemo`):**

| Stat | Calculation |
|---|---|
| `stationCount` | `stations.length` |
| `reportCount` | `reports.length` |
| `newStationsThisWeek` | stations with `createdAt >= now - 7d` |
| `reportsThisWeek` | reports with `createdAt >= now - 7d` |
| `avgPms` | average of latest PMS report per station |
| `inStockPct` | % of stations whose latest report is `available: true` |
| `days[7]` | average PMS price per calendar day for the bar chart |

**Renders:** 4× `StatCard`, `PriceChart` (7-day bar), `DonutChart` (in-stock ratio), `ReportsTable` (latest 10).

---

## Layout Components

### AppShell

**File:** `src/components/layout/AppShell.jsx`

Wraps every page that is not the map. Renders `Navbar` at the top, a `<main>` that grows to fill available height, and `MobileBottomNav` at the bottom. Adds `pb-20 md:pb-8` to main so content is never hidden behind the fixed tab bar on mobile.

Props: `children`, `className`, `withBottomNav` (default `true`).

---

### Navbar

**File:** `src/components/layout/Navbar.jsx`

Sticky, frosted-glass top bar. Adapts layout between mobile and desktop.

- **Mobile:** logo mark + search input + theme toggle + avatar/sign-in. A second row below has "Add Station" and "Report Price" quick action buttons.
- **Desktop:** full logo + wide search input + action buttons + theme toggle + avatar/sign-in.

Search navigates to `/explore?search=<query>`. The "Add Station" button redirects unauthenticated users to `/login` with `state.from = '/explore?add=true'`.

---

### MobileBottomNav

**File:** `src/components/layout/MobileBottomNav.jsx`

Fixed tab bar visible only on mobile (`md:hidden`). Four tabs: Home (`/explore`), Add (`/report`), Reports (`/reports`), Profile (`/profile`). Uses `NavLink` with `isActive` to bold the active icon. Respects `safe-area-inset-bottom` for notched phones.

---

### Fab

**File:** `src/components/layout/Fab.jsx`

Floating action button, mobile-only. Fixed at `bottom-[92px] right-[18px]` so it sits above the tab bar. Navigates to `/report` by default. Has a blue gradient background and a hover lift + scale animation.

Props: `to` (default `/report`), `className`, `label`.

---

## Map Components

### StationMap

**File:** `src/components/map/StationMap.jsx`

The Leaflet map wrapper. Renders inside a `MapContainer` from react-leaflet.

**Tile layers** switch automatically based on the current theme:
- Light: CARTO Voyager
- Dark: CARTO Dark Matter

**`MapController`** is an internal component that calls `map.flyTo()` when the `center` or `flyToTarget` props change, without remounting the whole map.

**Pin coloring:** computes the average price of all visible stations, then passes `tone` (green/blue/orange/red) to each `MapPin` based on `pinTone(price, average)`.

Props:

| Prop | Type | Description |
|---|---|---|
| `stations` | array | Filtered station list |
| `center` | `{ lat, lng }` | Map center (flies to on change) |
| `initialZoom` | number | Default `12` |
| `activeStationId` | string | ID of selected station (pin renders larger) |
| `fuelType` | string | Which fuel type to use for price/tone |
| `onSelect` | function | Called with the station object when a pin is clicked |
| `flyToTarget` | `{ lat, lng }` | Animate the map to this position at zoom 14 |
| `located` | boolean | Whether GPS resolved |
| `onLocate` | function | Re-triggers geolocation lookup |

---

### MapPin

**File:** `src/components/map/MapPin.jsx`

Renders a single Leaflet `Marker` with a custom `L.divIcon` — a CSS teardrop shape (`.fl-pin`). The label inside the pin shows the station name and price. The active pin renders with the `.fl-pin--active` class (slightly larger).

Tone-to-class mapping: `fl-pin--green`, `fl-pin--blue`, `fl-pin--orange`, `fl-pin--red`. Clicking the pin calls `onSelect(station)`. Each pin also contains a `PinPopup`.

Props: `station`, `tone`, `active`, `fuelType`, `onSelect`.

---

### PinPopup

**File:** `src/components/map/PinPopup.jsx`

A Leaflet `Popup` that opens when a pin is clicked. Shows station name, current price, availability, distance, and two action buttons: "Directions" (Google Maps link) and "Report" (link to `/report?station=<id>`).

Props: `station`, `fuelType`.

---

### MapLegend

**File:** `src/components/map/MapLegend.jsx`

Floating frosted panel (top-left of the map) explaining the four pin colours. Stateless, pure presentational.

Props: `className`, `items` (defaults to the four standard tiers).

---

## Station Components

### StationCard

**File:** `src/components/station/StationCard.jsx`

Full-size card used in the desktop sidebar and mobile horizontal scroll strip. Shows station name, address, verified badge, latest price, distance, fuel type tag, availability tag, price-vs-average trend tag, and last-updated time. Two action buttons: "Directions" and "Report Price".

Clicking the card navigates to `/station/:id` (or calls `onSelect` if provided).

Props:

| Prop | Type | Description |
|---|---|---|
| `station` | object | Station with embedded reports |
| `fuelType` | string | Default `PMS` |
| `average` | number \| null | Average price for trend calculation |
| `onSelect` | function | Optional override for click behaviour |
| `showActions` | boolean | Default `true` — hides buttons if false |
| `className` | string | Extra Tailwind classes |

---

### StationCardCompact

**File:** `src/components/station/StationCardCompact.jsx`

A narrower horizontal card (icon + name + time left, price right). Used in compact list contexts. Clicking navigates to `/station/:id`.

Props: `station`, `fuelType`, `className`.

---

### StationList

**File:** `src/components/station/StationList.jsx`

Renders a vertical list of `StationCard` components. Handles three states internally: loading (3 skeleton cards), error (`ErrorState` with retry), empty (`EmptyState`). Used in the desktop sidebar.

Props: `stations`, `loading`, `error`, `average`, `fuelType`, `onRetry`.

---

### FilterPanel

**File:** `src/components/station/FilterPanel.jsx`

Full filter form. Changes are **staged locally** — they only apply when the user clicks "Apply". This prevents the map from re-fetching on every slider tick.

Four controls:
1. **Fuel Type** — pill buttons for PMS / AGO / DPK / LPG
2. **Availability** — custom checkbox for "In-stock only"
3. **Max Price** — `Slider` from ₦600 to ₦1,200
4. **Distance** — `Slider` from 1 km to 20 km

On desktop renders inside a `Modal`. On mobile renders in a full-height slide-up sheet.

Props: `value`, `onApply`, `onReset`, `onClose`, `resultCount`.

---

### FilterChips

**File:** `src/components/station/FilterChips.jsx`

Renders active filters as dismissible chip buttons using `Tag`. Each chip has an `×` icon; clicking it calls `onChange` with the filter cleared back to its default. Only renders chips for non-default values (e.g. `maxPrice < 1200`, `radius < 20`).

Props: `filters`, `onChange`.

---

### AddStationForm

**File:** `src/components/station/AddStationForm.jsx`

Form for adding a community-listed station. Fields: name, brand (optional), city, state, address, latitude, longitude. A "Use my location" button calls `resolveLocation()` to auto-fill coordinates.

Client-side validation runs on every render; errors only show after the relevant field has been touched (blur/submit). Calls `onSubmit(payload)` with a clean object. New stations are always created with `isVerified: false`.

Props: `initialLocation`, `onSubmit`, `submitting`, `error`, `onCancel`.

---

## Report Component

### ReportForm

**File:** `src/components/report/ReportForm.jsx`

The price report card. Rendered by `ReportPage`. Fields:

- **Station** — `Select` dropdown populated with all stations from the API
- **Fuel Type** — `SegmentedControl` with all four types
- **Price per litre** — number `Field` with ₦ prefix
- **Availability** — `SegmentedControl` toggle (In stock / Out), colour changes to green/red based on selection

Pre-fills the station from `initialStationId` (passed from the `?station=` query param). Validates on submit and shows touched-field errors. Calls `onSubmit({ stationId, fuelType, price, available })`.

Props: `stations`, `initialStationId`, `onSubmit`, `submitting`, `error`.

---

## Dashboard Components

### StatCard

**File:** `src/components/dashboard/StatCard.jsx`

KPI card with an icon, a large numeric/string value, a label, and an optional delta string.

Props:

| Prop | Type | Description |
|---|---|---|
| `icon` | Lucide component | Rendered in a coloured circle |
| `value` | string \| number | Big number displayed prominently |
| `label` | string | Descriptor below the value |
| `delta` | string | Optional trend text |
| `deltaTone` | `success` \| `danger` \| `muted` | Colour of the delta text |

---

### PriceChart

**File:** `src/components/dashboard/PriceChart.jsx`

A pure-CSS 7-day bar chart — no chart library. Each bar is a `<span>` whose height is calculated as `(value / max) * 100%`. The bar with the highest value receives a red gradient (`from-danger`) to highlight the peak price day.

Props: `data` (array of `{ value, bad, tooltip }`), `labels` (day-name strings), `title`, `badge`.

---

### DonutChart

**File:** `src/components/dashboard/DonutChart.jsx`

A CSS `conic-gradient` donut showing in-stock vs out-of-stock ratio. The centre hole is a white/surface circle with the percentage number.

Props: `title`, `inStockPercent` (0–100), `inStockLabel`, `outLabel`.

---

### ReportsTable

**File:** `src/components/dashboard/ReportsTable.jsx`

Responsive HTML table of price reports. Columns: Station, Fuel, Price, Status, Time, Reported By. Time and "Reported by" columns are hidden on mobile with `sm:table-cell`. Renders an empty-state card when `reports` is empty.

Props: `reports`, `className`.

---

## Auth Components

### AuthShell

**File:** `src/components/auth/AuthShell.jsx`

Centred card layout used by both `LoginPage` and `RegisterPage`. Renders the FuelLex `Logo`, a title, a subtitle, the form children, and a footer slot (for the "New here? / Already have an account?" link).

Props: `title`, `subtitle`, `children`, `footer`.

---

## UI Primitives

All UI primitives live in `src/components/ui/`. They have no data-fetching logic and accept only props.

### Button

Variants: `primary` (default), `secondary`, `ghost`, `success`, `danger`, `outline-danger`.
Sizes: `xs`, `sm`, `md` (default), `lg`.
Extra props: `icon` (Lucide component renders left of label), `block` (full width), `loading` (shows `Spinner`, disables the button).

### Field

Labeled form input. Props: `label`, `error` (red message below), `hint` (grey hint below), `prefix` (text inside left edge), `suffix` (text inside right edge), `required`. Passes all other props to the underlying `<input>`.

### Select

Labeled native `<select>` with a custom chevron icon overlay. Props: `label`, `options` (array of `{ value, label }`), `placeholder`, `error`, standard `<select>` attrs.

### Modal

Portal-based overlay. Traps focus, closes on Escape key and backdrop click, locks body scroll while open. Props: `open`, `onClose`, `title`, `children`.

### Tag

Inline badge with tone variants:

| Tone | Use |
|---|---|
| `fuel` | Fuel type label |
| `avail` | Available (green) |
| `oos` | Out of stock (red) |
| `price` | Price comparison |
| `brand` | Station brand / filter chip |
| `neutral` | Default grey |

`dot` prop adds a coloured bullet before the label.

### Card

White/surface rounded box with border and shadow. `hoverable` prop adds cursor-pointer and a subtle lift on hover.

### Avatar

Renders a coloured circle with the user's initials (derived from `name`). `size` can be a number (px) or `"sm"`. Falls back to `"?"` if name is empty.

### Badge

Small pill counter, used beside section headings to show result counts.

### Skeleton

Shimmer loading placeholder. Apply `className` for dimensions. Uses the `.fl-skeleton` animation defined in `index.css`.

### Spinner

Animated spinning circle. Props: `size` (default 20), `className`.

### SegmentedControl

Pill-style tab switcher. Props: `options` (array of `{ value, label }`), `value`, `onChange`, `activeTone` (overrides active colour for the availability toggle — `success` or `danger`).

### Slider

Range input styled with `accent-color: primary`. Props: `min`, `max`, `value`, `onChange`.

### BottomSheet

Slide-up overlay for mobile panels. Animates in with `.fl-sheet-up`. Props: `open`, `onClose`, `children`.

### EmptyState

Centred empty-state layout. Props: `icon` (Lucide), `title`, `description`, `action` (optional button/link).

### ErrorState

Centred error layout. Props: `title`, `message`, `onRetry` (optional retry callback).

### IconButton

Circular icon-only button with a tooltip (`aria-label`). Props: `label`, `size`, `onClick`, `children`.

### Logo

FuelLex wordmark + mark. Props: `markSize`, `className`.

---

## Context Providers

### AuthContext

**File:** `src/context/AuthContext.jsx`

Manages the JWT session. Persists token and user to `localStorage`.

**Exposed via `useAuth()`:**

| Value | Type | Description |
|---|---|---|
| `user` | object \| null | Current user (without password) |
| `token` | string \| null | Raw JWT string |
| `loading` | boolean | True while the profile is being restored on first load |
| `isAuthenticated` | boolean | `true` when both token and user exist |
| `isAdmin` | boolean | `true` when `user.role === 'ADMIN'` |
| `login(email, password)` | async fn | Calls API, stores token + user, returns user |
| `register(name, email, password)` | async fn | Creates account then auto-logs in |
| `logout()` | fn | Clears localStorage, nulls state |

On mount, if a token exists in localStorage, `GET /api/auth/profile` is called to re-validate the session. If the token is expired or invalid, it is cleared and the user is logged out.

---

### ThemeContext

**File:** `src/context/ThemeContext.jsx`

Manages light/dark mode. Persists preference to `localStorage` under `fuellex_theme`. On first load, falls back to the OS preference (`prefers-color-scheme`). Applies the `.dark` class to `<html>` to activate Tailwind's dark mode overrides.

**Exposed via `useTheme()`:** `{ theme: 'light' | 'dark', toggle: () => void }`

---

### ToastContext

**File:** `src/context/ToastContext.jsx`

Global notification queue. Toasts auto-dismiss after 4 seconds. Maximum 4 toasts displayed at a time (oldest is dropped when a 5th arrives). Rendered into a fixed portal at the top-right of the screen.

**Exposed via `useToast()`:** `{ success(msg), error(msg), info(msg) }`

---

## Custom Hooks

### `useStations(params)`

**File:** `src/hooks/useStations.js`

Fetches stations from the API whenever `params` changes. Uses a `tick` counter to support manual re-fetching.

```js
const { stations, loading, error, refetch } = useStations({
  lat: 6.5244,
  lng: 3.3792,
  radius: 15,
  search: 'Mobil'
})
```

The effect fires immediately on mount and on every `params` change. An `active` flag prevents stale state updates if the component unmounts mid-request.

---

### `useReports({ fuelType, available, stationId })`

**File:** `src/hooks/useReports.js`

Fetches reports. If `stationId` is provided it calls `getReportsByStation(stationId)`, otherwise calls `getReports({ fuelType, available })`. Returns the same `{ reports, loading, error, refetch }` shape.

---

### `useMediaQuery(query)` / `useIsDesktop()` / `useIsMobile()`

**File:** `src/hooks/useMediaQuery.js`

Subscribes to a CSS media query using `window.matchMedia`. Returns `true` when the query matches and updates reactively when the viewport changes.

```js
const isDesktop = useIsDesktop()   // true when viewport >= 768px
const isMobile  = useIsMobile()    // true when viewport <= 639px
```

---

## Services

Thin async wrappers around the Axios API instance. Each function returns the unwrapped `data` payload from the server envelope. All live in `src/services/`.

### `services/auth.js`

| Function | Method | Path |
|---|---|---|
| `login(email, password)` | POST | `/api/auth/login` |
| `register(name, email, password)` | POST | `/api/auth/register` |
| `getProfile()` | GET | `/api/auth/profile` |

### `services/stations.js`

| Function | Method | Path |
|---|---|---|
| `getStations(params)` | GET | `/api/stations` |
| `getStation(id)` | GET | `/api/stations/:id` |
| `createStation(data)` | POST | `/api/stations` |
| `updateStation(id, data)` | PUT | `/api/stations/:id` |
| `deleteStation(id)` | DELETE | `/api/stations/:id` |

### `services/reports.js`

| Function | Method | Path |
|---|---|---|
| `getReports(params)` | GET | `/api/reports` |
| `getReportsByStation(stationId)` | GET | `/api/reports/station/:id` |
| `createReport(data)` | POST | `/api/reports` |

---

## Utility Libraries

### `lib/api.js`

The shared Axios instance. Base URL from `VITE_API_URL` (default `http://localhost:7000`).

- **Request interceptor:** reads `fuellex_token` from localStorage and attaches `Authorization: Bearer <token>`.
- **Response interceptor:** on success, returns `response.data` directly (unwraps the envelope). On error, normalises the message and clears the token on 401.

Helper functions also exported: `getToken`, `setToken`, `clearToken`, `getStoredUser`, `setStoredUser`.

---

### `lib/format.js`

Pure formatting helpers — no side effects.

| Function | Example output |
|---|---|
| `cx(...classes)` | Joins truthy class strings |
| `formatNaira(897)` | `₦897` |
| `formatNairaNumber(897)` | `897` |
| `formatDistance(2.4)` | `2.4 km` / `350 m` |
| `timeAgo(date)` | `3 mins ago` / `2 hrs ago` / `5d ago` |
| `formatDate(date)` | `Mon 12 Jan` |
| `formatTime(date)` | `14:05` |
| `initials("Ada Obi")` | `AO` |

---

### `lib/fuel.js`

Domain constants and helpers for fuel-related logic.

- **`FUEL_TYPES`** — array of `{ value, label, full }` for all four fuel types.
- **`fuelLabel(type)`** — returns the short label for a fuel type code (e.g. `'PMS'` → `'PMS'`).
- **`latestReport(station, fuelType)`** — finds the most recent report for the given fuel type. Falls back to the newest overall report if no match.
- **`latestPrice(station, fuelType)`** — returns the price number from `latestReport`, or `null`.
- **`AVAILABILITY`** — `{ true: { label, tone }, false: { label, tone } }` map for availability display.
- **`pinTone(price, average)`** — returns `'green'` (≤ -2% avg), `'orange'` (≥ +2% avg), or `'blue'` (within ±2%).
- **`pinColor(tone)`** — maps tone string to a hex colour for direct CSS use.
- **`priceTrend(price, reference)`** — returns `{ direction: 'up'|'down', amount }` if the difference is ≥ ₦1, otherwise `null`.

---

### `lib/geo.js`

- **`distanceKm(lat1, lng1, lat2, lng2)`** — Haversine formula, returns distance in km.
- **`LAGOS_CENTER`** — `{ lat: 6.5244, lng: 3.3792 }` — default map center.
- **`resolveLocation()`** — returns a Promise that resolves to `{ lat, lng, located: boolean }`. Tries the browser Geolocation API with a 6-second timeout and falls back to `LAGOS_CENTER` if permission is denied or unavailable.
