# Service Wiring Backlog

## Wired (done)
- Interaction → Semantic: order creation triggers inquiry
- Semantic → Interaction: matches posted as list to `/api/v1/matches/`
- `getInsightsForOrder`: correct URL + param name
- `submitNewOrder`: `client_id` in body
- `submitPurchase`: `client_id` + `Number(insightId)`
- `getBalance`: wired to real endpoint (missing `/` fix needed)
- `getTransactions`: wired (but backend endpoint doesn't exist yet)
- `setLegend`: `insider_id` + `text` sent correctly

## Still broken
- `middleware.ts` — `proxy.ts` exists but Next.js never loads it, no route protection
- `GET /api/v1/transactions` — ledger endpoint documented but not implemented
- `GET /api/v1/purchases` — ledger endpoint documented but not implemented
- Root `devenv.nix` — only starts identity + ledger, not interaction/semantic/web
- No JWT verification on downstream services (interaction, ledger, semantic)
