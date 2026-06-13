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

- [ ] Add `getOrderById(orderId)` to `web/src/actions/orders.ts`
- [ ] Add `getMatchById(matchId)` to `web/src/actions/matches.ts`

### 2b. Switch page imports from mock-data → real actions

- [ ] `web/src/app/dashboard/page.tsx` — replace mock getters with real actions + `getUserProfile()`
- [ ] `web/src/app/orders/[id]/page.tsx` — replace mock `getOrderById` / `getInsightsForOrder`
- [ ] `web/src/app/matches/[id]/page.tsx` — replace mock `getMatchById`
- [ ] `web/src/app/legend/page.tsx` — remove `MOCK_INSIDER_PROFILE` import, wire `setLegend`

### 2c. Fix client components

- [ ] `InsiderDashboard.tsx` — replace hardcoded "Karn Srisuk" with real `displayName` prop
- [ ] `ClientDashboard.tsx` — replace hardcoded "Priya Mehta" with real `displayName` prop
- [ ] `NewOrderButton.tsx` — uncomment/connect `submitNewOrder(title, text)`
- [ ] `InsightCardView.tsx` — uncomment/connect `submitPurchase(card.id)`
- [ ] `MatchInsightForm.tsx` — uncomment/connect `submitMatchInsight(...)` + receive `userId` prop

### 2d. Clean up

- [ ] Delete `web/src/lib/mock-data.ts`
- [ ] Remove commented-out mock import in `web/src/actions/orders.ts`
- [ ] Run `npx tsc --noEmit` — fix any type errors
- [ ] Update types in `lib/types.ts` if real API shape differs (snake_case fields, etc.)
