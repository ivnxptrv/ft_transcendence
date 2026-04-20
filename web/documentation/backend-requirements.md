# Backend Requirements

This document maps every button, form, and data fetch in the frontend to the backend endpoint and payload it needs. All endpoints require a valid auth token (JWT in `Authorization: Bearer <token>` header) unless marked public.

---

## Authentication

| Action | Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| Check email exists | `POST` | `/auth/check-email` | `{ email }` | `{ exists: boolean }` |
| Sign in | `POST` | `/auth/login` | `{ email, password }` | `{ token, user: UserPayload }` |
| Sign up | `POST` | `/auth/register` | `{ email, firstName, lastName, password, role }` | `{ token, user: UserPayload }` |
| Google OAuth | `GET` | `/auth/google` | — | Redirect to Google consent screen |
| Google OAuth callback | `GET` | `/auth/google/callback` | — | Sets JWT cookie, redirects to `/dashboard` |
| Forgot password | `POST` | `/auth/forgot-password` | `{ email }` | `{ message: "email sent" }` |
| Sign out | `POST` | `/auth/logout` | — | Clears session on server |
| Get current user | `GET` | `/auth/me` | — | `{ id, name, email, role }` |

**Frontend files:** `src/app/login/page.tsx`, `src/app/settings/_components/SettingsClient.tsx`

---

## Orders (Client)

| Action | Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| List orders | `GET` | `/orders` | — | `Order[]` |
| Get order detail | `GET` | `/orders/:id` | — | `Order` |
| Create order | `POST` | `/orders` | `{ title, query }` | `Order` |
| Get responses for order | `GET` | `/orders/:id/responses` | — | `ResponseCard[]` (insights hidden if `isUnlocked: false`) |
| Unlock a response | `POST` | `/orders/:orderId/responses/:responseId/unlock` | — | `{ insiderInsight: string }` — deducts `price` from wallet |

**Frontend files:** `src/app/dashboard/_components/NewOrderButton.tsx`, `src/app/orders/[id]/page.tsx`, `src/app/orders/_components/ResponseCardView.tsx`

---

## Matches (Insider)

| Action | Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| List matches | `GET` | `/matches` | — | `Match[]` |
| Get match detail | `GET` | `/matches/:id` | — | `Match` (with optional `insight`) |
| Submit response | `POST` | `/matches/:id/respond` | `{ text, price }` | `{ insight: Insight, match: Match }` — sets `match.status = "responded"` |
| Skip match | `POST` | `/matches/:id/skip` | — | `{ match: Match }` — removes from active list |

**Frontend files:** `src/app/matches/[id]/page.tsx`, `src/app/matches/_components/MatchResponseForm.tsx`

---

## Wallet

| Action | Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| Get balance | `GET` | `/wallet` | — | `{ balance: number }` |
| Get transactions | `GET` | `/wallet/transactions` | — | `Transaction[]` |
| Top up | `POST` | `/wallet/topup` | `{ amount }` | `{ balance: number, transaction: Transaction }` |
| Withdraw | `POST` | `/wallet/withdraw` | `{ amount }` | `{ balance: number, transaction: Transaction }` — error if `amount > balance` |

**Frontend files:** `src/app/wallet/page.tsx`, `src/app/wallet/_components/WalletBalanceCard.tsx`

---

## Insider Profile

| Action | Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| Get legend | `GET` | `/profile/legend` | — | `{ legend: string }` |
| Save legend | `PATCH` | `/profile/legend` | `{ legend }` | `{ legend: string }` |
| Get profile stats | `GET` | `/profile/stats` | — | `{ credibilityScore, totalEarnings, totalResponses, avgRating }` |

**Frontend files:** `src/app/legend/page.tsx`, `src/app/dashboard/_components/InsiderDashboard.tsx`

---

## Settings

| Action | Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| Change email | `PATCH` | `/profile/email` | `{ newEmail, currentPassword }` | `{ email: string }` |
| Change password | `PATCH` | `/profile/password` | `{ currentPassword, newPassword }` | `200 OK` |
| List API keys | `GET` | `/api-keys` | — | `ApiKey[]` — values masked, one-time reveal on create |
| Generate API key | `POST` | `/api-keys` | `{ label? }` | `{ key: string }` — only time full value is returned |
| Delete API key | `DELETE` | `/api-keys/:id` | — | `204 No Content` |
| Copy API key | (client-side only) | — | — | Copies the stored/displayed key via `navigator.clipboard` |

**Frontend files:** `src/app/settings/_components/SettingsClient.tsx`

---

## Shared Data Types

```typescript
type UserPayload = { userId: string; accessToken: string; role: Role; name: string; email: string; }
type Order       = { id; title; query; status: "pending"|"has_responses"|"completed"; createdAt; responseCount; }
type ResponseCard = { id; orderId; insiderLegend; price; credibilityScore; insiderInsight?; isUnlocked; }
type Match       = { id; orderId; query; insiderId; status: "new"|"responded"|"purchased"|"rated"; matchScore; receivedAt; insight?: Insight; }
type Insight     = { id; matchId; text; price; }
type Transaction = { id; description; amount; date; }  // positive = credit, negative = debit
type ApiKey      = { id; label; maskedKey; createdAt; }
```

---

## Hardcoded Values to Replace

| Location | Hardcoded Value | Replace With |
|---|---|---|
| `ClientDashboard.tsx:31` | `"Priya Mehta"` | `GET /auth/me → name` |
| `InsiderDashboard.tsx:55` | `"Karn Srisuk"` | `GET /auth/me → name` |
| `wallet/page.tsx:9` | `MOCK_BALANCE = 1200` | `GET /wallet → balance` |
| `mock-data.ts` | 3 static orders | `GET /orders` |
| `mock-data.ts` | 4 static matches | `GET /matches` |
| `mock-data.ts` | 3 static responses | `GET /orders/:id/responses` |
| `mock-data.ts` | 3 static transactions | `GET /wallet/transactions` |
| `mock-data.ts` | insider profile stats | `GET /profile/stats` |

---

## Mock Getter Functions to Replace

All functions in `src/lib/mock-data.ts` are fake async wrappers returning static arrays. Each maps directly to a real endpoint:

| Mock getter | Real endpoint |
|---|---|
| `getOrders()` | `GET /orders` |
| `getOrderById(id)` | `GET /orders/:id` |
| `getResponsesForOrder(orderId)` | `GET /orders/:orderId/responses` |
| `getMatches()` | `GET /matches` |
| `getMatchById(id)` | `GET /matches/:id` |
| `getInsiderProfile(userId)` | `GET /profile/stats` |
| `getTransactions()` | `GET /wallet/transactions` |
| `getMockRole()` in `mock-role.ts` | `GET /auth/me → role` |
