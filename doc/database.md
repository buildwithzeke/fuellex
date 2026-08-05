
# FuelLex — Database Reference

The database is PostgreSQL, managed through Prisma ORM. The schema file at `server/prisma/schema.prisma` is the single source of truth.

---

## Table of Contents

1. [Technology Choices](#technology-choices)
2. [Connection](#connection)
3. [Enums](#enums)
4. [Models](#models)
5. [Relations](#relations)
6. [Prisma Client Usage](#prisma-client-usage)
7. [Migrations](#migrations)
8. [Seed Data](#seed-data)
9. [Useful Prisma Commands](#useful-prisma-commands)

---

## Technology Choices

| Tool | Version | Purpose |
|---|---|---|
| PostgreSQL | Any modern version | Relational data store |
| Supabase | — | Managed PostgreSQL host (recommended) |
| Prisma ORM | 6.x | Schema management, migrations, type-safe queries |
| `@prisma/client` | 6.x | Auto-generated query client used in controllers |

Prisma was chosen because its schema file doubles as living documentation, the generated client eliminates a whole class of column-name bugs, and `prisma studio` provides a visual database browser with zero extra tooling.

---

## Connection

The database URL is read from the `DATABASE_URL` environment variable in `server/.env`:

```
DATABASE_URL="postgresql://user:password@host:5432/fuellex?schema=public"
```

For Supabase, copy the **connection string** (not the pooler) from the Supabase dashboard → Settings → Database → Connection String.

`server/src/config/db.js` exports a single `PrismaClient` instance that is reused across all controllers:

```js
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
export default prisma
```

Using a singleton avoids exhausting the connection pool in development with hot-reload.

---

## Enums

### Role

Controls what a user account can do.

| Value | Description |
|---|---|
| `USER` | Default for all public registrations. Can read stations, submit reports, add new stations. |
| `ADMIN` | Elevated access. Can set `isVerified` on stations, access the `/dashboard`, and list all users. Only created via the seed script. |

### FuelType

The four fuel products tracked in Nigeria.

| Value | Full name | Description |
|---|---|---|
| `PMS` | Premium Motor Spirit | Regular petrol (most reported) |
| `AGO` | Automotive Gas Oil | Diesel |
| `DPK` | Dual-Purpose Kerosene | Kerosene |
| `LPG` | Liquefied Petroleum Gas | Cooking gas |

---

## Models

### User

Represents a registered account.

```prisma
model User {
  id        String       @id @default(uuid())
  name      String
  email     String       @unique
  password  String
  role      Role         @default(USER)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  reports   FuelReport[]
}
```

| Column | Type | Notes |
|---|---|---|
| `id` | UUID string | Auto-generated, primary key |
| `name` | string | Display name, minimum 2 chars (enforced by Zod) |
| `email` | string | Unique, normalised to lowercase before saving |
| `password` | string | bcrypt hash (cost 10), **never returned** in any API response |
| `role` | `Role` enum | Defaults to `USER`; only `ADMIN` via seed |
| `createdAt` | DateTime | Set on insert |
| `updatedAt` | DateTime | Auto-updated by Prisma on every write |
| `reports` | relation | All `FuelReport` rows submitted by this user |

---

### FuelStation

Represents a physical fuel station on the map.

```prisma
model FuelStation {
  id         String       @id @default(uuid())
  name       String
  brand      String?
  address    String
  state      String
  city       String
  latitude   Float
  longitude  Float
  isVerified Boolean      @default(false)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  reports    FuelReport[]
}
```

| Column | Type | Notes |
|---|---|---|
| `id` | UUID string | Auto-generated, primary key |
| `name` | string | Station name (e.g. "Mobil Lekki Phase 1") |
| `brand` | string? | Optional brand (e.g. "Mobil", "NNPC"). `null` for independent stations |
| `address` | string | Street address or landmark description |
| `state` | string | Nigerian state (e.g. "Lagos") |
| `city` | string | City or area (e.g. "Lekki") |
| `latitude` | Float | WGS84 latitude, -90 to 90 |
| `longitude` | Float | WGS84 longitude, -180 to 180 |
| `isVerified` | Boolean | `false` by default. Only `ADMIN` can set `true` via `PUT /api/stations/:id` |
| `createdAt` | DateTime | Set on insert |
| `updatedAt` | DateTime | Auto-updated on every write |
| `reports` | relation | All `FuelReport` rows for this station |

**Indexing note:** Latitude and longitude do not have a PostGIS spatial index. The server uses a bounding-box range query (`WHERE latitude BETWEEN` / `longitude BETWEEN`) for proximity filtering, which PostgreSQL can satisfy with a composite B-tree index on `(latitude, longitude)` if performance becomes a concern at large scale.

---

### FuelReport

A single crowdsourced price submission. Immutable once created — there is no update or delete endpoint for reports.

```prisma
model FuelReport {
  id        String      @id @default(uuid())
  stationId String
  station   FuelStation @relation(fields: [stationId], references: [id], onDelete: Cascade)
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  fuelType  FuelType
  price     Float
  available Boolean     @default(true)
  createdAt DateTime    @default(now())
}
```

| Column | Type | Notes |
|---|---|---|
| `id` | UUID string | Auto-generated, primary key |
| `stationId` | UUID string | Foreign key → `FuelStation.id` |
| `userId` | UUID string | Foreign key → `User.id` |
| `fuelType` | `FuelType` enum | One of PMS / AGO / DPK / LPG |
| `price` | Float | Price per litre in Nigerian Naira (₦) |
| `available` | Boolean | `true` = fuel is in stock; `false` = out of stock. Defaults to `true` |
| `createdAt` | DateTime | Timestamp of the report submission; used for sorting and analytics |

Note there is no `updatedAt` on `FuelReport` — reports are append-only by design. The latest report for a station/fuel-type combination represents the current state.

---

## Relations

```
User ──< FuelReport >── FuelStation
```

- One `User` can submit many `FuelReport` records (`User` 1→N `FuelReport`)
- One `FuelStation` can have many `FuelReport` records (`FuelStation` 1→N `FuelReport`)
- `FuelReport` is a join-like entity that connects a user action to a station

**Cascade deletes:**
- Deleting a `FuelStation` cascades and deletes all its `FuelReport` rows.
- Deleting a `User` cascades and deletes all their submitted `FuelReport` rows.

This means `DELETE /api/stations/:id` permanently removes all price history for that station — it is not a soft delete.

---

## Prisma Client Usage

All database queries go through the singleton client imported from `src/config/db.js`:

```js
import prisma from "../config/db.js"
```

### Common query patterns used in the codebase

**Find unique by field:**
```js
prisma.user.findUnique({ where: { email: normalizedEmail } })
```

**Create with nested data:**
```js
prisma.user.create({ data: { name, email, password, role: "USER" } })
```

**List with include + order + take:**
```js
prisma.fuelStation.findMany({
  where,
  include: {
    reports: { orderBy: { createdAt: "desc" }, take: 10 }
  }
})
```

**Upsert (seed script):**
```js
prisma.user.upsert({
  where: { email: "admin@fuellex.app" },
  update: {},
  create: { name, email, password, role: "ADMIN" }
})
```

**Dynamic `where` object** (station search):
The station controller builds a `where` object incrementally based on which query params are present, then passes it to `findMany`. This pattern avoids writing separate query branches for every filter combination.

---

## Migrations

For production, use migrations to track schema changes:

```bash
cd server

# Create a new migration (prompts for a name)
npx prisma migrate dev --name add_some_field

# Apply all pending migrations in production
npx prisma migrate deploy
```

For development and initial setup, `prisma db push` syncs the schema directly without creating migration files:

```bash
npx prisma db push
```

> `db push` is destructive if you remove or rename fields — use `migrate dev` once the schema is stable and you have real data.

---

## Seed Data

Run `npx prisma db seed` (or `npm run db:seed` in the server directory) to populate the database with:

### Admin account

| Field | Value |
|---|---|
| Email | `admin@fuellex.app` |
| Password | `Admin@1234` |
| Role | `ADMIN` |

The seed uses `upsert` so it is safe to run multiple times — it will not create duplicate admin accounts.

### Sample stations (all in Lagos, all `isVerified: true`)

| Station | Brand | City | PMS (₦) | Other fuel |
|---|---|---|---|---|
| Mobil — Lekki Phase 1 | Mobil | Lekki | 915 ✓ | AGO 1210 ✓ |
| Total — Victoria Island | TotalEnergies | Victoria Island | 925 ✓ | LPG 750 ✓ |
| NNPC — Ajah Roundabout | NNPC | Ajah | 890 ✗ (out) | DPK 1105 ✓ |
| Oando — Gbagada | Oando | Gbagada | 935 ✓ | AGO 1225 ✓ |
| Conoil — Ikeja | Conoil | Ikeja | 905 ✓ | LPG 735 ✓ |
| Eterna — Yaba | Eterna | Yaba | 960 ✓ | DPK 1120 ✗ (out) |

Each station is created with `isVerified: true` and seeded with 2 initial `FuelReport` rows attributed to the admin account.

---

## Useful Prisma Commands

```bash
# Open the visual database browser
npx prisma studio

# Sync schema to database (development)
npx prisma db push

# Create and apply a migration (production workflow)
npx prisma migrate dev --name <migration-name>

# Apply migrations without creating new ones (CI/production)
npx prisma migrate deploy

# Re-generate the Prisma client after schema changes
npx prisma generate

# Run the seed script
npx prisma db seed
```
