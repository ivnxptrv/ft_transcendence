# Web (Vekko Frontend)

## What it is

The user-facing web app for **Vekko** — a marketplace where clients post questions ("orders") and insiders-experts reply with paid, credibility-scored answers ("insights"). This service is the Next.js application that the browser talks to.

## Why it exists

The project splits concerns into a frontend app, an auth service, and several domain microservices. The web app is the only service that lives in the browser's address bar; everything else sits behind it. It owns:

- Login / signup pages and the cookie-based session
- The client dashboard (list of orders, order detail, insight cards, unlock flow)
- The insider dashboard (list of matched orders, insight reply form)
- A wallet view, settings view, and a "legend" (insider bio) editor
- The single source of truth for client-side UI state and navigation

It is **not** a public API gateway. It does not authenticate other services, and it does not own business data. Other services hold the data; the web app calls them.

## Tech stack

- **Next.js 16** (App Router, React 19, server components + server actions)
- **TypeScript** (strict)
- **Tailwind CSS 4** for styling
- **jose** for JWT verification
- **ESLint** + **Prettier**

## High-level architecture inside the app

```
Browser  ──HTTP──▶  Next.js (this service)
                       │
                       ├── Server Actions   (form submissions → backend APIs)
                       ├── proxy.ts         (Edge middleware: route protection)
                       ├── Server Components (SSR data fetching)
                       └── lib/auth.ts      (server-side session helpers)
```

### Layers in this service

| Path                                            | What lives there                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/app/`                                      | Route definitions. `(auth)` group for login/signup; top-level routes for the app.                      |
| `src/app/(auth)/login`, `src/app/(auth)/signup` | Login + signup pages, form posts to `actions/auth.ts`.                                                 |
| `src/app/dashboard`                             | Role-aware dashboard. Renders `ClientDashboard` or `InsiderDashboard` based on the JWT's `role` claim. |
| `src/app/orders/[id]`                           | Order detail page. Loads order + insight cards.                                                        |
| `src/app/matches/[id]`                          | Insider match detail page. Reply form submits an insight.                                              |
| `src/app/wallet`                                | Balance + transaction history.                                                                         |
| `src/app/settings`                              | Profile + session controls.                                                                            |
| `src/app/legend`                                | Insider "legend" (bio) editor.                                                                         |
| `src/actions/`                                  | Server actions. The only place the browser-side code calls backend services.                           |
| `src/lib/auth.ts`                               | Server-side `getCurrentUser()` — verifies the JWT and returns `{ userId, role }`.                      |
| `src/lib/auth-shared.ts`                        | Edge-safe primitives: cookie names, JWKS verifier, refresh helper, `IDENTITY_URL`.                     |
| `src/lib/types.ts`                              | Wire types shared by server and client components.                                                     |
| `src/lib/mock-data.ts`                          | Local fixtures used while real APIs are being wired.                                                   |
| `src/proxy.ts`                                  | Edge middleware. Gates `/dashboard`, `/orders`, `/matches`, `/settings`, `/wallet`.                    |

## How a request flows through the app

### Sign-in

1. User submits `/login` form.
2. `actions/auth.ts:login` calls `IDENTITY_URL/login_endpoint` (discovered from `/.well-known/auth-config`).
3. Identity returns `{ access_token, refresh_token, expires_in }`.
4. The action sets two HttpOnly cookies: `jwt_access_token` and `jwt_refresh_token`, then `redirect("/dashboard")`.

### Authenticated page load

1. `proxy.ts` runs at the edge. It reads both cookies.
2. If the access token is valid (`jose` + JWKS from Identity), the request proceeds and `x-user-id` / `x-user-role` headers are attached.
3. If the access token is missing or expired, it tries the refresh token against `IDENTITY_URL/refresh_endpoint`, swaps in the new pair, and proceeds.
4. If neither works, it redirects to `/login`.
5. The page's server component calls `getCurrentUser()` from `lib/auth.ts`, which re-verifies the cookie and returns the trusted `{ userId, role }`.

### Submitting an order (client)

1. Client opens the "New order" bottom sheet on the dashboard.
2. On publish, `actions/orders.ts:submitNewOrder` calls `POST INTERACTION_URL/api/v1/orders?user_id=<userId>` with `{ title, text }`.
3. `revalidatePath("/orders")` invalidates the order list cache.

### Submitting an insight (insider)

1. Insider opens `/matches/<id>` and types a reply + price.
2. `actions/insights.ts:submitMatchInsight` calls `POST INTERACTION_URL/api/v1/insights?user_id=<userId>` with `{ matchId, text, price }`.

### Unlocking an insight (client)

1. Client clicks "Unlock" on an insight card.
2. (Wired but mocked) `actions/transactions.ts:submitPurchase` calls `POST LEDGER_URL/purchases` with `{ insightId, userId }`.

## How the web app talks to other services

The web app is a **BFF-style proxy**, not a peer. It calls each backend service over plain HTTP using URLs from environment variables.

| Variable          | Default                 | Used by                                            |
| ----------------- | ----------------------- | -------------------------------------------------- |
| `IDENTITY_URL`    | `http://localhost:4010` | Login, signup, logout, `/me`, JWKS                 |
| `INTERACTION_URL` | `http://localhost:4013` | Orders, matches, insights                          |
| `LEDGER_URL`      | `http://localhost:4011` | Balances, transactions, purchases (mostly stubbed) |
| `SEMANTIC_URL`    | `http://localhost:4012` | Insider "soul" (legend) save                       |

The app does **not** trust anything coming from the browser as identity. The access token is verified twice — once at the edge in `proxy.ts` and again in the Node runtime via `lib/auth.ts:getCurrentUser()` — and the resulting `userId` is what's used to call downstream services.

## Environment

Copy `.env.example` (or use the existing `.env.local`) and provide:

```bash
IDENTITY_URL=http://localhost:4010
INTERACTION_URL=http://localhost:4013
LEDGER_URL=http://localhost:4011
SEMANTIC_URL=http://localhost:4012
WEB_URL=http://localhost:4009
JWT_SECRET=...   # only needed for the temporary local-JWT dev fallback
```

## Running locally

```bash
npm install
npm run dev          # next dev on port 4009 (per .env)
npm run build        # production build, standalone output
npm run start        # serve the production build
npm run lint         # eslint
npm run format       # prettier
```

The Dockerfile builds a standalone Next.js image and exposes port 3000.

## Current status

- Login and signup pages are real; the auth flow talks to Identity.
- The dashboard, order detail, match detail, wallet, settings, and legend pages render real server components.
- A subset of the data layer is still served from `lib/mock-data.ts` (the insider profile, the transactions list, the balance). Server actions for those calls exist in `src/actions/` and are commented in or partially wired.
- `actions/transactions.ts:submitPurchase` returns the backend response without checking for the "insufficient balance" 500 documented in the action's TODO.
- `actions/legend.ts:submitLegend` posts without a `userId` — left as a TODO for when Semantic's auth contract lands.

## Things that are intentionally not in this service

- No API gateway / no nginx config (lives in `infra/nginx`).
- No database (Identity, Interaction, Ledger, Semantic own theirs).
- No auth crypto (Identity owns keys and JWT signing; this app only verifies).
