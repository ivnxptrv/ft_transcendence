# System Architecture — Vekko

## 1. Frontend → Gateway

```
Frontend
  └── Gateway
        ├── TLS / HTTPS
        └── Rate Limiting
```

---

## 2. Gateway → Backend

```
Gateway
  └── Backend
        ├── JWT Verification
        ├── Authorization
        └── Endpoints:
              /profile
              /wallet
              /orders
              /orders/:id
              /settings
              /insights
              /insights/:id
              /matches
              /matches/:id
              /signin
              /signup
              /auth
```

---

## 3. Services

### Identity Service
```
Users Table:
  - id
  - sub
  - first_name
  - last_name
  - email
  - password
  - google_id
  - 2fa_secret
```

### Interaction Service
```
Endpoints: /users, /insights, /inquiries, /scores
Modules: JWT Casting · Semantic

Tables:
  insights         orders           matches
  - id             - id             - id
  - order_id       - text           - order_id
  - match_id       - client_id      - insider_id
  - insider_id     - inquiry_id     - score_id
  - text           - title
  - price
  - transaction_id (nullable)
  - isPaid

  inquiries        scores           tokens
  - id             - id             - id
  - text (order)   - inquiry_id     - user_id
  - embedding      - soul_id
  - user_id        - value (score)

  Route: /orders?user_id=123
  Auth:  api-key → /tokens
```

### Ledger Service
```
Endpoints: /souls, /transactions, /balances

Tables:
  souls            transactions     balances
  - text (legend)  - id             - id
  - embedding      - amount         - amount
  - user_id        - user_id        - user_id
```

---

## Data Flow Summary

```
Frontend
  → Gateway (TLS, Rate-limit)
    → Backend (JWT Verify, Auth)
      ├── Identity Service  →  users
      ├── Interaction Service  →  insights, orders, matches,
      │                           inquiries, scores, tokens
      └── Ledger Service  →  souls, transactions, balances
```