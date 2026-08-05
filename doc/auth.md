
# FuelLex — Authentication & Authorization

End-to-end guide covering how identity works from the moment a user submits their password to the moment a protected controller runs.

---

## Table of Contents

1. [Overview](#overview)
2. [Registration Flow](#registration-flow)
3. [Login Flow](#login-flow)
4. [Token Storage & Persistence](#token-storage--persistence)
5. [Session Restoration on Page Load](#session-restoration-on-page-load)
6. [Authenticated Requests](#authenticated-requests)
7. [Server-side Token Verification](#server-side-token-verification)
8. [Role-based Authorization](#role-based-authorization)
9. [Logout](#logout)
10. [Token Expiry & 401 Handling](#token-expiry--401-handling)
11. [Validation Layer](#validation-layer)
12. [Error Handling](#error-handling)
13. [Security Notes](#security-notes)

---

## Overview

FuelLex uses **JWT (JSON Web Token)** authentication with **bcrypt** password hashing.

- Tokens are signed on the server, stored in `localStorage` on the client, and sent as a `Bearer` header on every protected request.
- There are two roles: `USER` (default for all registrations) and `ADMIN` (seeded only).
- Authorization is enforced server-side via middleware — the client-side checks are only for UI gating (hiding/showing elements), not security.

```
Client                              Server
  │                                   │
  │── POST /api/auth/login ──────────►│
  │   { email, password }             │  1. Validate body (Zod)
  │                                   │  2. Find user by email
  │                                   │  3. bcrypt.compare(password, hash)
  │                                   │  4. jwt.sign({ id, role }, secret, 7d)
  │◄── { token, user } ───────────────│
  │                                   │
  │  Store token in localStorage      │
  │                                   │
  │── GET /api/stations (protected) ──►│
  │   Authorization: Bearer <token>   │  1. Extract token from header
  │                                   │  2. jwt.verify(token, secret)
  │                                   │  3. prisma.user.findUnique({ id })
  │                                   │  4. Attach req.user
  │◄── { stations[] } ────────────────│
```

---

## Registration Flow

**Endpoint:** `POST /api/auth/register`

### Step by step

1. Client sends `{ name, email, password }`.
2. `validate(registerSchema)` middleware runs Zod parsing:
   - `name`: minimum 2 characters
   - `email`: valid email format
   - `password`: minimum 6 characters
   - Schema uses `.strict()` — any extra fields cause a 400 error.
3. Controller normalises the email to lowercase and trims whitespace.
4. `prisma.user.findUnique({ where: { email } })` checks for duplicates. Returns 400 if found.
5. `bcrypt.hash(password, 10)` hashes the password with a cost factor of 10 (≈100ms on a modern CPU).
6. `prisma.user.create(...)` inserts the new `USER` account.
7. Response 201 with the user object — **password field excluded**.

> The register endpoint does **not** issue a token. The `AuthContext.register()` method on the client immediately calls `login()` after a successful registration so the user gets a token without a second manual step.

### Client-side (`AuthContext.register`)

```js
const register = async (name, email, password) => {
  await authService.register(name, email, password)    // POST /api/auth/register
  const { token, user } = await authService.login(email, password)  // POST /api/auth/login
  setToken(token)
  setStoredUser(user)
  setTokenState(token)
  setUser(user)
  return user
}
```

---

## Login Flow

**Endpoint:** `POST /api/auth/login`

### Step by step

1. Client sends `{ email, password }`.
2. `validate(loginSchema)` middleware checks email format and that password is non-empty.
3. Controller normalises email to lowercase.
4. `prisma.user.findUnique({ where: { email } })` — if no user found, returns 401 with a generic message (does not reveal whether the email exists).
5. `bcrypt.compare(password, user.password)` — if mismatch, returns 401 with the same generic message.
6. `generateToken({ id: user.id, role: user.role })` — signs a JWT with:
   - **Payload:** `{ id, role, iat, exp }`
   - **Secret:** `JWT_SECRET` env var
   - **Expiry:** `JWT_EXPIRES_IN` env var (default `"7d"`)
7. Response 200 with `{ token, user }` — **password excluded** from user object.

### `generateToken` / `verifyToken` (`server/src/utils/jwt.js`)

```js
// Sign
jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

// Verify
jwt.verify(token, JWT_SECRET)  // throws if invalid or expired
```

---

## Token Storage & Persistence

After a successful login, the client stores two items in `localStorage`:

| Key | Value |
|---|---|
| `fuellex_token` | Raw JWT string |
| `fuellex_user` | JSON-serialised user object (without password) |

Helper functions in `src/lib/api.js`:

```js
getToken()        // localStorage.getItem('fuellex_token')
setToken(token)   // localStorage.setItem('fuellex_token', token)
clearToken()      // removes both fuellex_token and fuellex_user
getStoredUser()   // JSON.parse(localStorage.getItem('fuellex_user'))
setStoredUser(u)  // localStorage.setItem('fuellex_user', JSON.stringify(u))
```

`localStorage` persists across browser tabs and survives page reloads, so the user stays logged in until the token expires or they log out.

---

## Session Restoration on Page Load

When the app first loads, `AuthContext` checks whether a token already exists in `localStorage`. If one does, it calls `GET /api/auth/profile` to re-validate it against the server.

```js
// AuthContext.jsx — runs once on mount
useEffect(() => {
  const storedToken = getToken()
  if (!storedToken) return           // No token → unauthenticated, stop here

  authService.getProfile()
    .then((profile) => {
      setUser(profile)               // Token valid → update user state
      setStoredUser(profile)
    })
    .catch(() => {
      clearToken()                   // Token invalid/expired → clear and log out
      setUser(null)
    })
    .finally(() => setLoading(false))
}, [])
```

The `loading` flag starts as `true` when a token is present and flips to `false` once the profile check resolves. Pages that need auth can wait for `loading === false` before deciding whether to redirect, preventing a flash of the login page on a valid session.

---

## Authenticated Requests

The Axios instance in `src/lib/api.js` uses a **request interceptor** to automatically attach the token to every outgoing request:

```js
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

This means all `services/` functions (getStations, createReport, etc.) automatically send the token without any extra code. Unauthenticated requests simply have no `Authorization` header.

---

## Server-side Token Verification

Every protected route runs the `protect` middleware before the controller.

**File:** `server/src/middleware/auth.js`

```
Request arrives
    │
    ├─ No Authorization header?  → 401 "not logged in"
    │
    ├─ jwt.verify(token) throws? → 401 "invalid or expired token"
    │
    ├─ prisma.user.findUnique({ id: decoded.id }) returns null?
    │                             → 401 "user no longer exists"
    │
    └─ Attach req.user (without password) → next()
```

The DB lookup in `protect` is intentional: it ensures that if an admin account is deleted, its token is immediately rejected on the next request — even if the token has not expired yet.

---

## Role-based Authorization

After `protect` sets `req.user`, the optional `restrictTo(...roles)` middleware gate checks the role:

```js
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      })
    }
    next()
  }
}
```

### Where `restrictTo` is used

| Route | Middleware chain |
|---|---|
| `GET /api/users` | `protect` → `restrictTo('ADMIN')` |

### Partial role enforcement in controllers

Some routes use `protect` without `restrictTo` but apply role checks inside the controller logic:

- `PUT /api/stations/:id` — any authenticated user can update a station's name/address/etc., but only `ADMIN` can flip `isVerified`. A non-admin request that includes `isVerified` has it silently stripped:

```js
if (updateData.isVerified !== undefined && req.user.role !== "ADMIN") {
  delete updateData.isVerified
}
```

### Client-side role gating

`AuthContext` exposes `isAdmin` (`user?.role === 'ADMIN'`) and `isAuthenticated` for UI-level checks. These only show or hide elements — the server enforces the real boundaries.

```js
// DashboardPage — renders a gate if not admin, makes no API calls
if (!isAdmin) {
  return <EmptyState title="Admins only" ... />
}
```

```js
// ProfilePage — shows Dashboard link only to admins
{isAdmin && <Link to="/dashboard">View Dashboard</Link>}
```

---

## Logout

Logout is purely client-side. There is no server-side token revocation or blocklist.

```js
// AuthContext
const logout = () => {
  clearToken()        // removes fuellex_token + fuellex_user from localStorage
  setTokenState(null)
  setUser(null)
}
```

After `logout()`, the user's state is null, `isAuthenticated` becomes false, and the Axios interceptor stops sending the Authorization header. The old JWT is still cryptographically valid until its expiry, but without it in storage it cannot be used.

The `ProfilePage` calls `logout()` then navigates to `/`:

```js
<Button onClick={() => { logout(); navigate('/') }}>
  Log out
</Button>
```

---

## Token Expiry & 401 Handling

The Axios **response interceptor** handles 401s globally:

```js
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken()    // Stale/expired token — clear it immediately
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong.'
    const normalized = new Error(message)
    normalized.status = error.response?.status || 0
    return Promise.reject(normalized)
  }
)
```

When a 401 arrives and a token is present in storage (meaning the token has expired or been revoked), it is cleared immediately. The next page load will show the unauthenticated state. Individual pages that catch the error can redirect to `/login` themselves.

There is currently **no refresh token** mechanism. When a 7-day token expires the user must log in again.

---

## Validation Layer

All auth-related request bodies are validated by Zod before they reach the controller.

**`server/src/validators/auth.validator.js`**

```js
// Registration
registerSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
}).strict()   // rejects any extra fields

// Login
loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})
```

The `validate(schema)` middleware calls `schema.safeParse(req.body)`. On failure it calls `next(zodError)`, which the global error handler catches and converts to a 400 with a human-readable message.

On success, `req.body` is **replaced** with the parsed output — meaning the controller always receives clean, type-coerced data.

---

## Error Handling

Authentication errors return consistent JSON in the standard envelope:

```json
{ "success": false, "message": "..." }
```

| Scenario | Status | Message |
|---|---|---|
| Missing Authorization header | 401 | `You are not logged in. Please log in to gain access.` |
| Malformed or expired token | 401 | `Invalid or expired token. Please log in again.` |
| Token valid but user deleted | 401 | `The user belonging to this token no longer exists.` |
| Wrong password or unknown email | 401 | `Invalid email or password` |
| Email already registered | 400 | `Email is already registered` |
| Zod validation failure | 400 | Field-level message (e.g. `password: String must contain at least 6 character(s)`) |
| Insufficient role | 403 | `You do not have permission to perform this action.` |

Login and "user not found" both return 401 with the same wording — this is deliberate to prevent **email enumeration** (an attacker cannot determine whether an email is registered by observing the error message).

---

## Security Notes

**What is secure:**
- Passwords are never stored in plaintext — bcrypt cost 10 is used consistently.
- Passwords are never included in any API response.
- JWT payloads only contain `{ id, role }` — no sensitive data.
- The DB lookup in `protect` means deleted users' tokens are immediately rejected.
- Email enumeration is prevented by returning identical errors for "user not found" and "wrong password".

**Known trade-offs:**
- **localStorage vs HttpOnly cookies.** LocalStorage is readable by JavaScript, making it theoretically vulnerable to XSS. HttpOnly cookies would prevent this but require same-origin deployment and CSRF protection. For a community data app, this trade-off is acceptable. If the app ever handles financial transactions, migrating to HttpOnly cookies would be advisable.
- **No refresh tokens.** Users must re-authenticate every 7 days. Implementing a refresh token flow would improve UX but adds complexity.
- **No token revocation.** Logging out only clears the client-side token. If the same token exists in another tab or device, it remains valid until expiry. A blocklist (e.g. Redis set of revoked JTIs) would address this.
- **`JWT_SECRET` default fallback.** `utils/jwt.js` has a hardcoded fallback secret for when `JWT_SECRET` is not set. This must never be relied upon in production — always set a strong, random `JWT_SECRET` in the server environment.
