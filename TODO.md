# TODO

## 1. Smoke-test all backend services

- [x] `curl http://localhost:4010/health` — identity
- [x] `curl http://localhost:4011/health` — ledger
- [x] `curl http://localhost:4012/health` — semantic
- [x] `curl http://localhost:4013/health` — interaction
- [x] Register a user on identity (`POST /api/v1/users`)
- [x] Login / get tokens (`POST /api/v1/tokens`)
- [x] Create API key (`POST /api/v1/api-keys`)
- [x] Fetch account via public endpoint (`GET /api/v1/public/account`)
- [x] Create an order through identity → interaction → semantic chain

## 2. Remove mock data from web frontend

### 2a. Add missing server actions

- [x] Add `getOrderById(orderId)` to `web/src/actions/orders.ts`
- [x] Add `getMatchById(matchId)` to `web/src/actions/matches.ts`

### 2b. Switch page imports from mock-data → real actions

- [x] `web/src/app/dashboard/page.tsx` — replace mock getters with real actions + `getUserProfile()`
- [x] `web/src/app/orders/[id]/page.tsx` — replace mock `getOrderById` / `getInsightsForOrder`
- [x] `web/src/app/matches/[id]/page.tsx` — replace mock `getMatchById`
- [x] `web/src/app/legend/page.tsx` — remove ` finally {
  }` import, wire `setLegend`

### 2c. Fix type mismatches (PRIORITY — see docs/type-mismatch-analysis.md)

- [x] Rewrite `lib/types.ts` — align types with backend wire shapes:
  - `Order`: drop `insightCount`
  - `Match`: `score` → `score`; drop `query`, `status`, `receivedAt`, `insight`
  - `InsightCard`: `insiderInsight` → `text`; `isUnlocked` → `isPaid`; drop `insiderLegend`, `credibilityScore`
  - ~~`Transaction`: `id` → `transactionId`; drop `description`, `date`~~ (kept `id` intentionally)
  - Drop `InsiderProfile` (unused)
- [v] Fix `WalletBalanceCard` — receives `Balance` object but types prop as `number`
- [x] ~~Rewrite `ClientDashboard.tsx` — use `score` not `score`, drop `query`/`receivedAt`/`status`/`insight` from match display~~ (doesn't display matches; name fixed in 2d)
- [x] ~~Rewrite `InsiderDashboard.tsx` — use `score` not `score`, drop `query`/`receivedAt`/`status`/`insight` from match display~~ (already clean)
- [x] ~~Rewrite `InsightCardView.tsx` — use `text`/`isPaid` not `insiderInsight`/`isUnlocked`, drop `insiderLegend`/`credibilityScore`~~ (already clean)
- [x] ~~Rewrite `matches/[id]/page.tsx` — use `score` not `score`, drop `query`~~ (fixed)
- [x] ~~Fix `orders/[id]/page.tsx` — derive insight count from `insights.length`, not from order field~~ (fixed)

### 2d. Fix client components

- [x] `InsiderDashboard.tsx` — replace hardcoded "Karn Srisuk" with real name from `UserProfile`
- [x] `ClientDashboard.tsx` — replace hardcoded "Priya Mehta" with real name from `UserProfile`
- [x] `NewOrderButton.tsx` — uncomment/connect `submitNewOrder(title, text)`
- [x] `InsightCardView.tsx` — uncomment/connect `submitPurchase(card.id)`
- [x] `MatchInsightForm.tsx` — uncomment/connect `submitMatchInsight(...)` + derive `userId` from session

### 2e. Clean up

- [x] Delete `web/src/lib/mock-data.ts`
- [ ] Remove commented-out mock import in `web/src/actions/orders.ts`
- [ ] Run `npx tsc --noEmit` — fix any type errors

### 3. Tests

### 4. i8l

### 5. Chrome+Firefox

### 6. Visualize data
