# Backend Requirements

This document reflects the current frontend server action prototypes in `web/src/actions/*`.
It does not describe an idealized API. If the action code and this file disagree, the action
code is the source of truth.

Several actions are still incomplete or partially mocked. Those gaps are called out explicitly
so the team can distinguish between current API shape and unfinished implementation details.

---

## Service Base URLs

The frontend currently expects these backend service environment variables:

- `IDENTITY_URL`
- `INTERACTION_URL`
- `LEDGER_URL`
- `SEMANTIC_URL`

---

## Authentication

Source: [`src/actions/auth.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/actions/auth.ts:1)

### Login

| Action  | Method | Endpoint       | Request Body          | Current frontend behavior                                                         |
| ------- | ------ | -------------- | --------------------- | --------------------------------------------------------------------------------- |
| Sign in | `POST` | `/users/login` | `{ email, password }` | On success, sets `jwt_token` cookie to `"mock-jwt"` and redirects to `/dashboard` |

Notes:

- The action currently calls `${IDENTITY_URL}/users/login`.
- On non-OK response, the action returns `response.json()`.
- The token returned by the backend is not yet read from the response body.
- Middleware currently expects a real JWT, so the temporary `"mock-jwt"` cookie is not compatible with the current middleware implementation.

### Signup

| Action  | Method | Endpoint | Intended Request Body                                      | Current frontend behavior                                               |
| ------- | ------ | -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Sign up | `POST` | `/users` | Intended: `{ email, password, firstName, lastName, role }` | Action reads form fields but does not yet send them in the request body |

Notes:

- The action currently calls `${IDENTITY_URL}/users`.
- `firstName`, `lastName`, `email`, and `password` are read from `FormData`.
- The signup page also sends `role`, but `src/actions/auth.ts` does not currently read it.
- The request body is still unfinished in the action prototype.
- There is no redirect or cookie-write flow implemented yet after signup.

### Current session storage assumptions

Related files:

- [`web/middleware.ts`](/home/fireframes/projects/42/ft_transcendence/web/middleware.ts:1)
- [`src/lib/auth.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/lib/auth.ts:1)
- [`src/lib/mock-role.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/lib/mock-role.ts:1)

Current assumptions in the frontend:

- Auth/session cookie name: `jwt_token`
- Middleware verifies `jwt_token` as a signed JWT using `process.env.JWT_SECRET`
- `getCurrentUser()` currently only checks whether `jwt_token` exists and redirects to `/login` if missing
- Role-specific UI is still driven separately by `user-role` in `mock-role.ts`

This means auth/session handling is currently split across two cookie models:

- `jwt_token` for middleware/session presence
- `user-role` for UI theme/role selection

That split is temporary and not yet normalized.

---

## Orders

Source: [`src/actions/orders.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/actions/orders.ts:1)

### Create order

| Action           | Method | Endpoint  | Request Body      | Current frontend behavior           |
| ---------------- | ------ | --------- | ----------------- | ----------------------------------- |
| Submit new order | `POST` | `/orders` | `{ title, text }` | Revalidates `/orders` after request |

Notes:

- The action currently calls `${INTERACTION_URL}/orders`.
- There is no explicit error handling yet.
- Auth attachment is not implemented yet.
- The commented code suggests the action is expected to use current user/session later.

### Get order insights

| Action                 | Method | Endpoint    | Query Params | Current frontend behavior          |
| ---------------------- | ------ | ----------- | ------------ | ---------------------------------- |
| Get insights for order | `GET`  | `/insights` | `orderId`    | Returns `response.json()` directly |

Notes:

- The action currently calls `${INTERACTION_URL}/insights?orderId=${orderId}`.
- This is the current prototype shape, even though it differs from the older doc structure.

---

## Matches

Source: [`src/actions/matches.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/actions/matches.ts:1)

### List matches

| Action      | Method | Endpoint   | Query Params | Current frontend behavior                       |
| ----------- | ------ | ---------- | ------------ | ----------------------------------------------- |
| Get matches | `GET`  | `/matches` | `userId`     | Throws on non-OK, otherwise returns parsed JSON |

Notes:

- The action currently calls `${INTERACTION_URL}/matches?userId=${userId}`.
- The current prototype requires `userId` as an explicit action argument.
- The commented code suggests this may later derive from session instead.

### Submit match insight

| Action         | Method | Endpoint    | Request Body                       | Current frontend behavior                                          |
| -------------- | ------ | ----------- | ---------------------------------- | ------------------------------------------------------------------ |
| Submit insight | `POST` | `/insights` | `{ userId, matchId, text, price }` | Throws on non-OK, revalidates `/dashboard?role=insider` on success |

Notes:

- The action currently calls `${INTERACTION_URL}/insights`.
- The current prototype sends both `userId` and `matchId` in the JSON body.

---

## Wallet / Transactions

Source: [`src/actions/transactions.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/actions/transactions.ts:1)

### Get balance

| Action      | Prototype backend shape                                  | Current frontend behavior |
| ----------- | -------------------------------------------------------- | ------------------------- |
| Get balance | Intended commented prototype: `GET /balances?userId=...` | Returns hardcoded `1200`  |

Notes:

- The commented fetch target is `${LEDGER_URL}/balances?userId=${userId}`.
- The action is currently mocked and does not call the backend.

### Get transactions

| Action           | Prototype backend shape                                      | Current frontend behavior           |
| ---------------- | ------------------------------------------------------------ | ----------------------------------- |
| Get transactions | Intended commented prototype: `GET /transactions?userId=...` | Returns hardcoded transaction array |

Notes:

- The commented fetch target is `${LEDGER_URL}/transactions?userId=${userId}`.
- The action is currently mocked and does not call the backend.

### Submit purchase

| Action          | Method | Endpoint     | Request Body            | Current frontend behavior                           |
| --------------- | ------ | ------------ | ----------------------- | --------------------------------------------------- |
| Submit purchase | `POST` | `/purchases` | `{ insightId, userId }` | Returns backend JSON, including on non-OK responses |

Notes:

- The action currently calls `${LEDGER_URL}/purchases`.
- `userId` currently comes from `getCurrentUser()`, but that helper currently returns the raw `jwt_token` cookie object rather than a parsed user object or ID.
- There is a comment noting a possible `500` insufficient balance case.

---

## Insider Legend

Source: [`src/actions/legend.ts`](/home/fireframes/projects/42/ft_transcendence/web/src/actions/legend.ts:1)

### Save legend

| Action     | Method | Endpoint | Request Body | Current frontend behavior                                |
| ---------- | ------ | -------- | ------------ | -------------------------------------------------------- |
| Set legend | `POST` | `/souls` | `{ legend }` | Returns backend JSON on non-OK, otherwise returns `true` |

Notes:

- The action currently calls `${SEMANTIC_URL}/souls`.
- The commented code suggests a future `userId` may be attached later, but it is not sent now.

---

## Current Frontend Gaps

These are not proposed API changes. They are mismatches or unfinished parts in the current frontend implementation:

- `signup()` does not yet send the actual payload it gathers from the form.
- `signup()` does not yet read or store any backend response.
- `login()` ignores any backend token and always writes `"mock-jwt"`.
- Middleware expects a real JWT and therefore conflicts with the current login mock.
- Session role is still read from `user-role`, not from `jwt_token`.
- Read-side wallet actions are still mocked locally.
- Several actions do not yet attach auth headers or derive user identity consistently.

---

## Endpoint Index From Current Action Prototypes

| Domain      | Method | Endpoint                   | Used by                 |
| ----------- | ------ | -------------------------- | ----------------------- |
| Identity    | `POST` | `/users/login`             | `login()`               |
| Identity    | `POST` | `/users`                   | `signup()`              |
| Interaction | `POST` | `/orders`                  | `submitNewOrder()`      |
| Interaction | `GET`  | `/insights?orderId=...`    | `getInsightsForOrder()` |
| Interaction | `GET`  | `/matches?userId=...`      | `getMatches()`          |
| Interaction | `POST` | `/insights`                | `submitMatchInsight()`  |
| Ledger      | `GET`  | `/balances?userId=...`     | `getBalance()`          |
| Ledger      | `GET`  | `/transactions?userId=...` | `getTransactions()`     |
| Ledger      | `POST` | `/purchases`               | `submitPurchase()`      |
| Semantic    | `POST` | `/souls`                   | `setLegend()`           |
