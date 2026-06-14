# Type Mismatch Analysis

Frontend type fields used in components vs backend response shapes. After `toCamelCase()`, backend snake_case becomes camelCase, but field names, types, and existence gaps remain.

---

## Order

| Frontend field | Backend source (`OrderRead`) | Match? |
|---|---|---|
| `id` | `id: int → string` | String mismatch (int→string fine via coercion) |
| `title` | `title: string` | OK |
| `text` | `text: string` | OK |
| `status` | `status: str` (e.g. "pending") | OK |
| `createdAt` | `created_at: datetime → string` | OK (string works for `.toLocaleDateString()`) |
| `insightCount` | **NOT PROVIDED** | MISSING |

Used in: `ClientDashboard.tsx:48-69`, `orders/[id]/page.tsx:37-46`

---

## Match

| Frontend field | Backend source (`MatchRead`) | Match? |
|---|---|---|
| `id` | `id: int → string` | OK (coerced) |
| `orderId` | `order_id: int → string` | OK (coerced) |
| `insiderId` | `insider_id: string` | OK |
| `query` | **NOT PROVIDED** | MISSING (need to fetch order text separately) |
| `status` | **NOT PROVIDED** | MISSING (backend has no status field on Match) |
| `matchScore` | `score: float` | RENAME to `score` |
| `receivedAt` | **NOT PROVIDED** | MISSING |
| `insight` | **NOT PROVIDED** | MISSING (no nested insight on MatchRead) |

Used in: `InsiderDashboard.tsx:58-82`, `matches/[id]/page.tsx:40-44`, `MatchInsightForm.tsx:9-23`

---

## InsightCard (vs backend `InsightRead`)

| Frontend field | Backend source (`InsightRead`) | Match? |
|---|---|---|
| `id` | `id: int → string` | OK |
| `orderId` | `order_id: int → string` | OK (but components don't use this) |
| `price` | `price: int` | OK |
| `insiderLegend` | **NOT PROVIDED** | MISSING (stored in Semantic `/souls`) |
| `credibilityScore` | **NOT PROVIDED** | MISSING (no such field in any backend) |
| `insiderInsight` | `text: string` | RENAME to `text` |
| `isUnlocked` | `isPaid: bool` | RENAME to `isPaid` |

Backend fields not in frontend type: `matchId`, `insiderId`, `transactionId` (nullable)

Used in: `InsightCardView.tsx:7-70`, `orders/[id]/page.tsx:61`

---

## Transaction

| Frontend field | Backend source (`TransactionRead`) | Match? |
|---|---|---|
| `id` | `transaction_id: int → transactionId` | RENAME `id` → `transactionId` |
| `description` | **NOT PROVIDED** | MISSING |
| `amount` | `amount: Decimal → number` | Type coercion fine |
| `date` | **NOT PROVIDED** | MISSING |

Backend also has `user_id → userId` (not used by frontend).

Used in: `WalletBalanceCard.tsx:44-63`

---

## Balance

| Frontend field | Backend source (`BalanceResponse`) | Match? |
|---|---|---|
| `userId` | `user_id: str → userId` | OK |
| `balance` | `balance: Decimal → number` | OK |

**Bug**: `WalletBalanceCard` expects `balance: number` prop but receives the full `Balance` object from `getBalance()`. Needs `{balance.balance}` or action should unwrap.

Used in: `WalletBalanceCard.tsx:27`

---

## UserProfile

| Frontend field | Backend source (Identity `/users/{user_id}`) | Match? |
|---|---|---|
| `id` | `id` | OK |
| `email` | `email` | OK |
| `role` | `role` | OK |
| `first_name` | `first_name` | OK |
| `last_name` | `last_name` | OK |
| `totp_enabled` | `totp_enabled` | OK |

No gaps. Used in: `InsiderDashboard.tsx:29`, `settings/page.tsx:17-42`

---

## InsiderProfile

**Not used by any component** (InsiderDashboard switched to UserProfile, legend page still references MOCK_INSIDER_PROFILE but commented out). Safe to delete.

---

## Summary of Changes Needed

### Renames (field-level)
- `Match.matchScore` → `score`
- `InsightCard.insiderInsight` → `text`
- `InsightCard.isUnlocked` → `isPaid`
- `Transaction.id` → `transactionId`

### Drops
- `Order.insightCount` (or derive from `insights.length`)
- `Match.query` (fetch via separate action or accept missing)
- `Match.status` (not in backend at all)
- `Match.receivedAt` (not in backend)
- `Match.insight` (not nested in MatchRead)
- `InsightCard.insiderLegend` (stored in Semantic, needs separate fetch)
- `InsightCard.credibilityScore` (doesn't exist)
- `InsiderProfile` entire type
- `Transaction.description` (not in backend)
- `Transaction.date` (not in backend)

### Bugs
- `WalletBalanceCard` receives `Balance` object but types prop as `number` — fix destructuring
