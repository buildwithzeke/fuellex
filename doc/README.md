# FuelLex — Project Documentation

> Community-driven fuel price map for Nigeria. Find nearby stations, compare live prices, and report what you pay at the pump.

---

## Table of Contents

1. [What is FuelLex?](#what-is-fuellex)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [Default Credentials](#default-credentials)
8. [Documentation Index](#documentation-index)

---

## What is FuelLex?

FuelLex is a full-stack web application that solves a real problem in Nigeria: **knowing which fuel station near you has fuel, and at what price**.

Fuel scarcity and price volatility are common. FuelLex lets drivers:

- View all fuel stations on an interactive map
- See the latest crowdsourced price for PMS (Petrol), AGO (Diesel), DPK (Kerosene), and LPG (Gas)
- Filter stations by fuel type, availability, max price, and radius
- Submit a price report after visiting a station
- Add stations that are missing from the map

Admins get a separate analytics dashboard with station counts, price trends over 7 days, and availability charts.

The app is built mobile-first. On phones, a bottom sheet shows nearby station cards and the map fills the screen. On desktop, a sidebar list sits beside a full-height map.

---

## Tech Stack

### Frontend (client/)

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP client | Axios |
| Map | Leaflet + react-leaflet |
| Icons | Lucide React |
| Font | Inter Variable |
| State | React Context + local `useState` (no Redux) |

### Backend (server/)

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| Framework | Express 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL (hosted on Supabase) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod |
| Config | dotenv |
| Image upload | Cloudinary (planned, not yet active) |

---

## Project Structure

```
fuellex/
├── client/                  # React frontend
│   ├── public/              # Static assets (favicon)
│   ├── src/
│   │   ├── components/      # Reusable UI pieces
│   │   │   ├── auth/        # Auth shell layout
│   │   │   ├── dashboard/   # Admin charts and tables
│   │   │   ├── layout/      # Navbar, bottom nav, FAB, AppShell
│   │   │   ├── map/         # Leaflet map, pins, popups, legend
│   │   │   ├── report/      # Price report form
│   │   │   ├── station/     # Station cards, list, filters, add form
│   │   │   └── ui/          # Design system primitives
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (API client, formatters, geo, fuel)
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # Thin API call wrappers
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx         # App entry point + provider tree
│   ├── .env                 # Local environment variables
│   └── package.json
│
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed script (admin + 6 stations)
│   ├── src/
│   │   ├── config/          # DB client, JWT helpers, Cloudinary
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/       # Auth guards, validation, error handler
│   │   ├── routes/          # Express route registrations
│   │   ├── utils/           # JWT sign/verify helpers
│   │   ├── validators/      # Zod schemas
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # HTTP server entry point
│   ├── .env                 # Local environment variables
│   └── package.json
│
└── doc/                     # This documentation
```

---

## Getting Started

You need **Node.js 18+**, **npm**, and a **PostgreSQL** database (local or Supabase).

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Copy the example files and fill in your values.

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

See the [Environment Variables](#environment-variables) section for what each key means.

### 3. Set up the database

```bash
cd server

# Push the schema to your database
npx prisma db push

# (Optional) Seed with admin account + sample stations
npx prisma db seed
```

### 4. Run the development servers

Open two terminals:

```bash
# Terminal 1 — backend (port 7000)
cd server
npm run dev

# Terminal 2 — frontend (port 5173)
cd client
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `7000` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | — | Secret key used to sign JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token validity period |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origin (set to your frontend URL in production) |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary account name (planned feature) |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key (planned feature) |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret (planned feature) |

### Client (`client/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:7000` | Full URL of the backend API |

In production, set `VITE_API_URL` to your deployed server URL (e.g., `https://api.fuellex.app`).

---

## Available Scripts

### Server

```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start without hot reload
npx prisma studio  # Open Prisma database GUI
npx prisma db seed # Run the seed file
```

### Client

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## Default Credentials

After running the seed script, these credentials are available:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fuellex.app` | `Admin@1234` |

> **Note:** Public registration (`/register`) always creates a `USER` account. `ADMIN` accounts can only be created via the seed script or by directly updating the database.

---

## Documentation Index

| File | What it covers |
|---|---|
| [architecture.md](./architecture.md) | System design, data flow, folder structure deep-dive |
| [api-reference.md](./api-reference.md) | Every HTTP endpoint — method, path, auth, request body, response |
| [frontend.md](./frontend.md) | All pages, components, hooks, context providers, and utility libs |
| [database.md](./database.md) | Prisma schema, models, enums, relations, and seed data |
| [auth.md](./auth.md) | Full authentication and authorization flow, client and server |
| [design-system.md](./design-system.md) | Tailwind tokens, UI component props, theming, dark mode |
