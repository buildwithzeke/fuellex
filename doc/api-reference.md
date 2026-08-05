# FuelLex — API Reference

All API endpoints are served from the Express backend. In development the base URL is `http://localhost:7000`. Every response uses the same JSON envelope:

```json
{
  "success": true | false,
  "message": "Human-readable string",
  "data": { ... }      // present on success only
}
```

The client's Axios interceptor automatically unwraps this envelope, so service functions receive only the `data` value.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Stations](#stations)
3. [Reports](#reports)
4. [Users](#users)
5. [Error Responses](#error-responses)
6. [Auth Header](#auth-header)

---

## Authentication

Base path: `/api/auth`

---

### POST /api/auth/register

Create a new user account. Public — no token required. Always creates a `USER` role account. `ADMIN` accounts can only be created via the seed script.

**Request body**

```json
{
  "name": "Ade Bello",
  "email": "ade@example.com",
  "password": "secret123"
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | minimum 2 characters |
| `email` | string | valid email format |
| `password` | string | minimum 6 characters |

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Ade Bello",
    "email": "ade@example.com",
    "role": "USER",
    "createdAt": "2026-08-04T10:00:00.000Z",
    "updatedAt": "2026-08-04T10:00:00.000Z"
  }
}
```

> The password is never returned. The `data` object is the new user without the `password` field.

**Error responses**

| Status | Message |
|---|---|
| 400 | `Email is already registered` |
| 400 | Zod validation error (e.g. `password too short`) |

---

### POST /api/auth/login

Authenticate with email and password. Returns a JWT token.

**Request body**

```json
{
  "email": "ade@example.com",
  "password": "secret123"
}
```

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Ade Bello",
      "email": "ade@example.com",
      "role": "USER",
      "createdAt": "2026-08-04T10:00:00.000Z",
      "updatedAt": "2026-08-04T10:00:00.000Z"
    }
  }
}
```

The `token` is a JWT signed with `JWT_SECRET`, valid for `JWT_EXPIRES_IN` (default 7 days). Store it and send it as `Authorization: Bearer <token>` on subsequent requests.

**Error responses**

| Status | Message |
|---|---|
| 401 | `Invalid email or password` |
| 400 | Zod validation error |

---

### GET /api/auth/profile

Return the currently authenticated user's profile. Requires a valid token.

**Headers**

```
Authorization: Bearer <token>
```

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Ade Bello",
    "email": "ade@example.com",
    "role": "USER",
    "createdAt": "2026-08-04T10:00:00.000Z",
    "updatedAt": "2026-08-04T10:00:00.000Z"
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 401 | `You are not logged in. Please log in to gain access.` |
| 401 | `Invalid or expired token. Please log in again.` |

---

## Stations

Base path: `/api/stations`

Stations represent physical fuel stations. The `reports` array embedded in each station contains the most recent price reports for that station.

---

### GET /api/stations

List fuel stations. Supports full-text search, field filters, and geolocation-based proximity search. Public — no token required.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Full-text search across name, brand, address, city, state |
| `city` | string | Exact match on city (case-insensitive) |
| `state` | string | Exact match on state (case-insensitive) |
| `brand` | string | Exact match on brand (case-insensitive) |
| `isVerified` | `"true"` \| `"false"` | Filter by verification status |
| `lat` | number | Latitude of the search center point |
| `lng` | number | Longitude of the search center point |
| `radius` | number | Search radius in km (default: 10) |

**How proximity search works**

When `lat` and `lng` are provided:

1. A bounding box is computed (±`radius` km) and applied as a database filter — this is fast because it uses indexed range queries.
2. After the DB query, the exact Haversine distance is calculated for each result.
3. Results outside the radius are removed.
4. The array is sorted by distance (nearest first).
5. Each station object gets a `distance` field (km, float).

When `search` is also provided alongside `lat`/`lng`, the bounding box is skipped (so results from any location matching the text come back) but distance is still calculated and results are still sorted.

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Stations retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Mobil Lekki",
      "brand": "Mobil",
      "address": "1 Admiralty Way",
      "state": "Lagos",
      "city": "Lekki",
      "latitude": 6.4281,
      "longitude": 3.4219,
      "isVerified": true,
      "createdAt": "2026-07-01T00:00:00.000Z",
      "updatedAt": "2026-08-01T00:00:00.000Z",
      "distance": 2.4,
      "reports": [
        {
          "id": "uuid",
          "stationId": "uuid",
          "userId": "uuid",
          "fuelType": "PMS",
          "price": 897,
          "available": true,
          "createdAt": "2026-08-04T08:00:00.000Z"
        }
      ]
    }
  ]
}
```

> `distance` is only present when `lat` and `lng` query params are supplied.
> The `reports` array is limited to the **10 most recent** reports per station in this listing endpoint.

---

### GET /api/stations/:id

Get a single station by its UUID, including its complete report history. Public — no token required.

**URL parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The station's unique identifier |

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Station retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Mobil Lekki",
    "brand": "Mobil",
    "address": "1 Admiralty Way",
    "state": "Lagos",
    "city": "Lekki",
    "latitude": 6.4281,
    "longitude": 3.4219,
    "isVerified": true,
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-08-01T00:00:00.000Z",
    "reports": [ ...all reports, newest first... ]
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 404 | `Station not found` |

---

### POST /api/stations

Create a new fuel station. Requires authentication. The `isVerified` field defaults to `false` — a station must be verified by an admin before the verified badge appears.

**Headers**

```
Authorization: Bearer <token>
```

**Request body**

```json
{
  "name": "Total Victoria Island",
  "brand": "TotalEnergies",
  "address": "10 Adeola Odeku Street",
  "state": "Lagos",
  "city": "Victoria Island",
  "latitude": 6.4281,
  "longitude": 3.4219
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | required |
| `brand` | string | optional |
| `address` | string | required |
| `state` | string | required |
| `city` | string | required |
| `latitude` | number | required, -90 to 90 |
| `longitude` | number | required, -180 to 180 |

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Station created successfully",
  "data": {
    "id": "new-uuid",
    "name": "Total Victoria Island",
    "brand": "TotalEnergies",
    "address": "10 Adeola Odeku Street",
    "state": "Lagos",
    "city": "Victoria Island",
    "latitude": 6.4281,
    "longitude": 3.4219,
    "isVerified": false,
    "createdAt": "2026-08-04T12:00:00.000Z",
    "updatedAt": "2026-08-04T12:00:00.000Z"
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 401 | Not authenticated |
| 400 | Zod validation error |

---

### PUT /api/stations/:id

Update an existing station. Requires authentication. All fields are optional — only provided fields are updated.

**Special rule:** Only `ADMIN` users can set `isVerified: true`. If a regular `USER` includes `isVerified` in the request body, it is silently removed before the update runs.

**Headers**

```
Authorization: Bearer <token>
```

**Request body** (all fields optional)

```json
{
  "name": "Updated Station Name",
  "brand": "NewBrand",
  "address": "New Address",
  "state": "Lagos",
  "city": "Ikeja",
  "latitude": 6.601,
  "longitude": 3.351,
  "isVerified": true
}
```

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Station updated successfully",
  "data": { ...updated station object... }
}
```

**Error responses**

| Status | Message |
|---|---|
| 401 | Not authenticated |
| 404 | Station not found (Prisma P2025) |
| 400 | Zod validation error |

---

### DELETE /api/stations/:id

Delete a station and all its associated reports (cascade). Requires authentication.

**Headers**

```
Authorization: Bearer <token>
```

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Station deleted successfully",
  "data": { ...deleted station object... }
}
```

**Error responses**

| Status | Message |
|---|---|
| 401 | Not authenticated |
| 404 | Station not found |

---

## Reports

Base path: `/api/reports`

A report is a single price submission by a user for a specific station and fuel type. Reports are immutable once created — there is no update or delete endpoint for reports.

---

### GET /api/reports

List all fuel reports across all stations. Supports optional filtering. Public — no token required.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `fuelType` | `PMS` \| `AGO` \| `DPK` \| `LPG` | Filter by fuel type |
| `available` | `"true"` \| `"false"` | Filter by availability |

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "stationId": "uuid",
      "userId": "uuid",
      "fuelType": "PMS",
      "price": 897,
      "available": true,
      "createdAt": "2026-08-04T08:00:00.000Z",
      "station": {
        "id": "uuid",
        "name": "Mobil Lekki",
        "city": "Lekki",
        "state": "Lagos"
      },
      "user": {
        "id": "uuid",
        "name": "Ade Bello"
      }
    }
  ]
}
```

---

### POST /api/reports

Submit a new price report for a station. Requires authentication.

**Headers**

```
Authorization: Bearer <token>
```

**Request body**

```json
{
  "stationId": "uuid-of-the-station",
  "fuelType": "PMS",
  "price": 897,
  "available": true
}
```

| Field | Type | Rules |
|---|---|---|
| `stationId` | UUID string | required, must reference an existing station |
| `fuelType` | string | required, one of: `PMS`, `AGO`, `DPK`, `LPG` |
| `price` | number | required, must be a positive number |
| `available` | boolean | optional, defaults to `true` |

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": "new-uuid",
    "stationId": "uuid",
    "userId": "uuid-of-authenticated-user",
    "fuelType": "PMS",
    "price": 897,
    "available": true,
    "createdAt": "2026-08-04T12:30:00.000Z"
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 401 | Not authenticated |
| 400 | Zod validation error (invalid fuelType, price not positive, etc.) |
| 404 | Station not found (if stationId does not exist) |

---

### GET /api/reports/station/:stationId

Get all reports for a specific station, ordered newest first. Public — no token required.

**URL parameter**

| Parameter | Type | Description |
|---|---|---|
| `stationId` | UUID string | The station's unique identifier |

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "stationId": "uuid",
      "userId": "uuid",
      "fuelType": "AGO",
      "price": 1150,
      "available": true,
      "createdAt": "2026-08-04T08:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "Ade Bello"
      }
    }
  ]
}
```

---

## Users

Base path: `/api/users`

User management endpoints. Currently only accessible to admins.

---

### GET /api/users

List all registered users. Requires authentication **and** `ADMIN` role.

**Headers**

```
Authorization: Bearer <token>   (must belong to an ADMIN user)
```

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Ade Bello",
      "email": "ade@example.com",
      "role": "USER",
      "createdAt": "2026-08-04T10:00:00.000Z",
      "updatedAt": "2026-08-04T10:00:00.000Z"
    }
  ]
}
```

> Passwords are never included in any user response.

**Error responses**

| Status | Message |
|---|---|
| 401 | Not authenticated |
| 403 | `You do not have permission to perform this action.` |

---

## Error Responses

All errors follow the same envelope format:

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

### Standard HTTP status codes used

| Code | Meaning | Common triggers |
|---|---|---|
| 400 | Bad Request | Validation failure, duplicate email |
| 401 | Unauthorized | Missing token, expired token, wrong password |
| 403 | Forbidden | Authenticated but insufficient role (e.g. non-admin on admin route) |
| 404 | Not Found | Unknown route, record not in database |
| 500 | Internal Server Error | Unexpected exception in a controller |

### Validation errors (400)

Zod validation failures return a 400 with a human-readable message listing what was wrong:

```json
{
  "success": false,
  "message": "password: String must contain at least 6 character(s)"
}
```

---

## Auth Header

For every protected endpoint, include the JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The client's Axios instance (`lib/api.js`) attaches this header automatically from the token stored in `localStorage` under the key `fuellex_token`. You only need to manage this manually if you are calling the API from outside the React app (e.g. Postman, a script, another service).

### Token lifecycle

| Event | Effect |
|---|---|
| Successful login | Token stored in `localStorage` |
| Successful register | Auto-login, token stored in `localStorage` |
| 401 response received | Token cleared from `localStorage` automatically by Axios interceptor |
| User calls logout | Token and user cleared from `localStorage` |
| Token expiry | Server returns 401 on next protected request; client clears and redirects |

Tokens are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN` (default 7 days). There is no refresh token mechanism — users must re-authenticate after expiry.
