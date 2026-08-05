# FuelLex

Community-driven fuel price map for Nigeria. Find nearby stations, compare live prices for PMS, AGO, DPK and LPG, check availability, and submit crowdsourced price reports — all on one interactive map.

---

## Quick Start

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure environment
cp server/.env.example server/.env    # add DATABASE_URL and JWT_SECRET
cp client/.env.example client/.env    # set VITE_API_URL

# 3. Set up the database
cd server
npx prisma db push
npx prisma db seed          # seeds admin account + 6 Lagos stations

# 4. Run both servers
cd server && npm run dev    # API on http://localhost:7000
cd client && npm run dev    # App on http://localhost:5173
```

Default admin login after seeding: `admin@fuellex.app` / `Admin@1234`

---

## Stack

| Side | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7, Leaflet |
| Backend | Node.js, Express 5, Prisma 6, PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Database host | Supabase (PostgreSQL) |

---

## Documentation

Full documentation lives in the [`/doc`](./doc) folder.

| Document | What it covers |
|---|---|
| [doc/README.md](./doc/README.md) | Full project overview, env vars, scripts, folder structure |
| [doc/architecture.md](./doc/architecture.md) | System design, data flow, request lifecycle |
| [doc/api-reference.md](./doc/api-reference.md) | Every API endpoint with request/response examples |
| [doc/frontend.md](./doc/frontend.md) | All pages, components, hooks, contexts, and utilities |
| [doc/database.md](./doc/database.md) | Schema, models, relations, seed data |
| [doc/auth.md](./doc/auth.md) | Authentication & authorization end-to-end |
| [doc/design-system.md](./doc/design-system.md) | Tailwind tokens, UI components, dark mode, animations |

---

## Project Structure

```
fuellex/
├── client/       # React SPA (Vite + Tailwind)
├── server/       # Express API (Prisma + PostgreSQL)
└── doc/          # Full project documentation
```

---

Built by [Ezekiel Ayebidun](https://github.com/buildwithzeke).
