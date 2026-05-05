## Identity Service — Auth Plan

### Architecture fit (per system-logic-vekko)
- **Gateway**: terminates TLS/HTTPS, applies rate-limit. Identity never sees plain HTTP and does not rate-limit itself.
- **Backend (Next.js)**: exposes `/auth`, performs **JWT verification** on every inbound request, forwards to services.
- **Identity (FastAPI)**: **JWT casting** only. Owns `users` and `tokens` tables. Exposes `/users`, `/tokens`, and api-key issuance.
- **Signing**: RS256 asymmetric. Identity holds the private key; Backend + other services hold only the public key. No shared secret across services.

### 1. Registration
```
POST /users (via Backend → Identity)
  → validate input (frontend AND backend: email format, password policy)
  → check email not taken
  → hash password with bcrypt (salt built in, cost ≥ 12)
  → insert into users (sub = user_id)
  → issue access + refresh JWT (see §3)
```

### 2. Login
```
POST /auth (Backend) → Identity /tokens
  → find user by email
  → bcrypt.compare(password, hash)
  → if 2fa_secret set → go to §6 BEFORE issuing tokens
  → else → issue access + refresh JWT
```

### 3. Token issuance & storage
- **Access token**: short-lived (~15 min), signed RS256, claims: `sub`, `email`, `roles`, `exp`, `iat`, `jti`.
- **Refresh token**: long-lived (~7–30 days). Row inserted in `tokens` (id, user_id) so we can **revoke** on logout / password change / 2FA reset.
- Rotation: each refresh mints a new refresh token and invalidates the old `tokens` row.

### 4. JWT Verification (Backend, per request)
```
Bearer token in Authorization header
  → verify signature with Identity's public key
  → verify exp, iat, iss, aud
  → attach sub + claims to request context
  → forward to target service
```

### 5. Google OAuth (uses `google_id`)
```
Click "Login with Google"
  → redirect to Google (PKCE + state)
  → exchange code for profile
  → lookup: google_id match → login
           else email match → link account (set google_id, require password re-auth once)
           else → create new user with google_id (password NULL)
  → issue JWT as in §3
```

### 6. 2FA (uses `2fa_secret`)
**Enrollment** (authenticated user, before any secret exists):
```
POST /users/me/2fa/setup
  → generate TOTP secret, return otpauth URI + QR
  → user submits first TOTP code → verify → persist 2fa_secret
```
**Verification on login** (called from §2):
```
After password OK, if 2fa_secret present
  → issue short-lived "pre-auth" challenge token (no access claims)
  → prompt TOTP → verify against 2fa_secret
  → only then issue real access + refresh JWT
```

### 7. Public API — api-key flow
Subject IV.1 major: public API needs a secured api-key + rate-limit + ≥5 endpoints.
- Identity issues api-keys scoped to a user; stored hashed at rest.
- Backend validates api-key on `/api/*` routes (in addition to or instead of JWT).
- Rate-limit bucket keyed on api-key at the Gateway.

### Security checklist vs. subject
- [x] HTTPS everywhere (terminated at Gateway, per design).
- [x] Passwords hashed + salted (bcrypt).
- [x] Input validation on frontend AND backend (subject III.3).
- [x] Secrets (JWT private key, OAuth client secret, DB creds) in `.env` / Vault — never committed.
- [x] Refresh tokens revocable via `tokens` table.
- [x] 2FA optional module (subject IV.3 minor).
- [x] OAuth optional module (subject IV.3 minor).

### Stack
- Identity: **FastAPI** + bcrypt + PyJWT (RS256) + pyotp (TOTP) + Authlib (Google OAuth)
- Backend: **Next.js** (verifies JWT via public key)
- DB for Identity: per design — `users`, `tokens` tables
