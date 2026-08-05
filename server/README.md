# FuelLex — Backend API

REST API for the FuelLex community fuel-station finder. Drivers can find nearby stations, compare current fuel prices, check availability, and submit real-time price reports.

## Tech Stack

| Layer      | Choice                              |
| ---------- | ----------------------------------- |
| Runtime    | Node.js (ESM)                       |
| Framework  | Express.js 5                        |
| Database   | PostgreSQL                          |
| ORM        | Prisma 6                            |
| Auth       | JWT (Bearer token)                  |
| Validation | Zod                                 |
| Hashing    | bcrypt                              |
| Config     | dotenv                              |
| Uploads    | Cloudinary (planned, later phase)   |

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client singleton
│   │   └── cloudinary.js      # Placeholder for file uploads
│   ├── controllers/           # auth, station, report, user
│   ├── middleware/            # auth, validate, errorHandler
│   ├── routes/                # auth, station, report, user
│   ├── services/              # (reserved for future business logic)
│   ├── utils/                 # jwt helpers
│   ├── validators/            # Zod schemas
│   ├── app.js                 # Express app
│   ├── server.js              # Entry point (starts DB + listener)
│   └── api_test.js            # Integration test suite
├── prisma/
│   ├── schema.prisma
│   └── seed.js                # Admin + Lagos stations + reports
├── .env.example
└── package.json
```

## Prerequisites

- Node.js 18+
- PostgreSQL (running locally or remotely)

## Setup

```bash
cd server
npm install
```

> The project uses Yarn in development (`yarn.lock` is committed). You can use
> `yarn install` or `npm install` — both work.

### 1. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your real credentials:

```
PORT=7000
NODE_ENV=development

# REQUIRED — the app will not start without a valid value
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fuellex?schema=public"

JWT_SECRET="generate-a-long-random-string"
JWT_EXPIRES_IN="7d"

CORS_ORIGIN="http://localhost:5173"
```

> **Important:** the committed `.env` file currently contains a **placeholder**
> `DATABASE_URL`. The running dev server may still be using the credentials it
> loaded at startup, but after any restart you **must** replace the placeholder
> with your real connection string, or the server will fail to boot.

### 2. Create the database schema

If the tables do not exist yet:

```bash
# Option A — create and run a migration
npx prisma migrate dev --name init

# Option B — sync the schema directly (no migration history)
npx prisma db push
```

### 3. Seed sample data (optional)

```bash
npm run db:seed
```

Seeds one admin account plus 6 Lagos fuel stations with fuel price reports.

| Field     | Value                        |
| --------- | ---------------------------- |
| Email     | `admin@fuellex.app`          |
| Password  | `Admin@1234`                 |

### 4. Start the server

```bash
npm run dev      # nodemon — development with auto-reload
npm start        # plain node
```

The API listens on `http://localhost:7000` (or `PORT`).

## Available Scripts

| Script               | Command                    | Purpose                              |
| -------------------- | -------------------------- | ------------------------------------ |
| `npm run dev`        | `nodemon src/server.js`    | Dev server with hot reload           |
| `npm start`          | `node src/server.js`       | Production start                     |
| `npm run db:seed`    | `node prisma/seed.js`      | Seed admin + sample data             |
| `npm run db:studio`  | `prisma studio`            | Browse the database in a browser     |
| `npm run db:migrate` | `prisma migrate dev`       | Create/apply migrations              |
| `npm run test:api`   | `node src/api_test.js`     | Run the integration suite (server up)|

## API Reference

Base URL: `http://localhost:7000/api`

### Response Format

Successful:

```json
{ "success": true, "message": "Station created successfully", "data": {} }
```

Error:

```json
{ "success": false, "message": "Station not found" }
```

### Authentication

`POST /auth/register` — create an account

```json
{
  "name": "Jane Driver",
  "email": "jane@example.com",
  "password": "secret123"
}
```

> Public registration always creates a **USER** account. A client-supplied
> `role` field is rejected (400). **ADMIN** accounts are bootstrapped via
> `npm run db:seed` or directly through Prisma.

`POST /auth/login` — log in, returns a JWT

```json
{ "email": "jane@example.com", "password": "secret123" }
```

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "name": "Jane Driver", "email": "jane@example.com", "role": "USER" }
  }
}
```

`GET /auth/profile` — current user (requires `Authorization: Bearer <token>`)

### Stations

| Method | Endpoint             | Auth          | Description                                |
| ------ | -------------------- | ------------- | ------------------------------------------ |
| GET    | `/stations`          | —             | List stations (with filters, see below)    |
| GET    | `/stations/:id`      | —             | Single station + its reports               |
| POST   | `/stations`          | User          | Create a station                           |
| PUT    | `/stations/:id`      | User          | Update (only ADMIN can change isVerified)  |
| DELETE | `/stations/:id`      | User/Admin    | Delete a station (ADMIN only enforced)     |

`GET /stations` query params:

| Param       | Example                     | Purpose                          |
| ----------- | --------------------------- | -------------------------------- |
| `search`    | `?search=mobil`             | Match name / brand / address     |
| `state`     | `?state=Lagos`              | Filter by state                  |
| `city`      | `?city=Lekki`               | Filter by city                   |
| `brand`     | `?brand=Oando`              | Filter by brand                  |
| `isVerified`| `?isVerified=true`          | Filter by verification status    |
| `lat` `lng` | `?lat=6.51&lng=3.37`        | Center point for "near me"       |
| `radius`    | `?radius=5`                 | Max distance in km (default 10)  |

When `lat`/`lng` are provided, each station gains a `distance` field (km,
Haversine) and results are sorted nearest-first.

### Reports

| Method | Endpoint                  | Auth | Description                        |
| ------ | ------------------------- | ---- | ---------------------------------- |
| GET    | `/reports`                | —    | List reports (`?fuelType=`, `?available=`) |
| POST   | `/reports`                | User | Submit a fuel price report         |
| GET    | `/reports/station/:id`    | —    | All reports for one station        |

`POST /reports` body:

```json
{
  "stationId": "uuid-of-station",
  "fuelType": "PMS",
  "price": 915.0,
  "available": true
}
```

`fuelType` is one of `PMS`, `AGO`, `DPK`, `LPG`.

### Users

| Method | Endpoint   | Auth          | Description                          |
| ------ | ---------- | ------------- | ------------------------------------ |
| GET    | `/users`   | Admin         | List all users                       |

## Authentication Flow

```
Register → bcrypt.hash(password) → save user
Login    → bcrypt.compare(password) → sign JWT { id, role }
Protected routes → verify Bearer token → load user → req.user
```

## Running the Integration Tests

Start the server (with a valid `DATABASE_URL`), then run:

```bash
npm run test:api
```

The suite in `src/api_test.js` exercises: root route, user registration,
login, profile, station creation, station list, geolocation query, fuel report
submission, station reports, admin-only users endpoint, station verification,
and station deletion.

Because public registration is locked to `USER` accounts, the suite
bootstraps its own admin directly via Prisma (so a valid `DATABASE_URL` in
`.env` is required when running it), and asserts that self-registration as
`ADMIN` through the API is rejected.

## Security Notes

- Passwords are hashed with bcrypt (10 rounds) and never returned by the API.
- Public registration is locked to the `USER` role — the `role` field is
  rejected by the validator and the controller always creates `USER`.
  Admin accounts are bootstrapped via `npm run db:seed`.
- `JWT_SECRET` must be a long random string in production.
- `CORS_ORIGIN` restricts which frontend origins may call the API.
