# TODO

## 1. Smoke-test all backend services

- [ ] `curl http://localhost:4010/health` — identity
- [ ] `curl http://localhost:4011/health` — ledger
- [ ] `curl http://localhost:4012/health` — semantic
- [ ] `curl http://localhost:4013/health` — interaction
- [ ] Register a user on identity (`POST /api/v1/users`)
- [ ] Login / get tokens (`POST /api/v1/tokens`)
- [ ] Create API key (`POST /api/v1/api-keys`)
- [ ] Fetch account via public endpoint (`GET /api/v1/public/account`)
- [ ] Create an order through identity → interaction → semantic chain

## 2. Remove mock data from web frontend

### 2a. Add missing server actions

- [x] Add `getOrderById(orderId)` to `web/src/actions/orders.ts`
- [x] Add `getMatchById(matchId)` to `web/src/actions/matches.ts`

### 2b. Switch page imports from mock-data → real actions

- [x] `web/src/app/dashboard/page.tsx` — replace mock getters with real actions + `getUserProfile()`
- [x] `web/src/app/orders/[id]/page.tsx` — replace mock `getOrderById` / `getInsightsForOrder`
- [x] `web/src/app/matches/[id]/page.tsx` — replace mock `getMatchById`
- [ ] `web/src/app/legend/page.tsx` — remove `MOCK_INSIDER_PROFILE` import, wire `setLegend`

### 2c. Fix type mismatches (PRIORITY — see docs/type-mismatch-analysis.md)

- [ ] Rewrite `lib/types.ts` — align types with backend wire shapes:
  - `Order`: drop `insightCount`
  - `Match`: `matchScore` → `score`; drop `query`, `status`, `receivedAt`, `insight`
  - `InsightCard`: `insiderInsight` → `text`; `isUnlocked` → `isPaid`; drop `insiderLegend`, `credibilityScore`
  - `Transaction`: `id` → `transactionId`; drop `description`, `date`
  - Drop `InsiderProfile` (unused)
- [ ] Fix `WalletBalanceCard` — receives `Balance` object but types prop as `number`
- [ ] Rewrite `ClientDashboard.tsx` — use `score` not `matchScore`, drop `query`/`receivedAt`/`status`/`insight` from match display
- [ ] Rewrite `InsiderDashboard.tsx` — use `score` not `matchScore`, drop `query`/`receivedAt`/`status`/`insight` from match display
- [ ] Rewrite `InsightCardView.tsx` — use `text`/`isPaid` not `insiderInsight`/`isUnlocked`, drop `insiderLegend`/`credibilityScore`
- [ ] Rewrite `matches/[id]/page.tsx` — use `score` not `matchScore`, drop `query`
- [ ] Rewrite `WalletBalanceCard.tsx` — use `transactionId` not `id`, drop `description`/`date`
- [ ] Fix `orders/[id]/page.tsx` — derive insight count from `insights.length`, not from order field

### 2d. Fix client components

- [x] `InsiderDashboard.tsx` — replace hardcoded "Karn Srisuk" with real name from `UserProfile`
- [ ] `ClientDashboard.tsx` — replace hardcoded "Priya Mehta" with real name from `UserProfile`
- [ ] `NewOrderButton.tsx` — uncomment/connect `submitNewOrder(title, text)`
- [ ] `InsightCardView.tsx` — uncomment/connect `submitPurchase(card.id)`
- [ ] `MatchInsightForm.tsx` — uncomment/connect `submitMatchInsight(...)` + derive `userId` from session

### 2e. Clean up

- [ ] Delete `web/src/lib/mock-data.ts`
- [ ] Remove commented-out mock import in `web/src/actions/orders.ts`
- [ ] Run `npx tsc --noEmit` — fix any type errors

