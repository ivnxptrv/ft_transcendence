## What is it?

- Ledger is a microservice which manages user balances, processes financial transactions and tracks the purchases.

## API Reference

### Transactions

- `POST /api/v1/transactions/` : Create a new transaction record

- `GET api/v1/transactions/` : List all transactions with optional filters for account_id.

- `GET / transactions/{tx_id}` : Get the exact transaction with the transaction_id

### Balances

- `GET /api/v1/balances/{user_id}` : Retrieve the net balance computed from all historical ledger adjustment.

### Purchases

- `POST api/v1/purchases/` : Create a new purchase and validates funds, flags payment on the interaction microservice, create a local transaction (debiting client/ crediting insider) 

- `GET api/v1/purchases/{user_id}` : Get the detail of the purchases with the purchase_id

### System Health

- `GET /health` : Exposes application health status

## Work Flow
```text
[Client Request] 
      |
      ▼
1. Fetch price & insider_id from Interaction Service ──► [GET /api/v1/insights/{id}]
       │
       ▼
2. Calculate user's current balance (Sum of all Txns) 
       │
       ▼ (Check: Balance >= Price?)
       ├───► [No] ──► Raise 409 Conflict (Insufficient Funds)
       │
       ▼ [Yes]
3. Optimistically reserve the insight ──────────────────► [PATCH /api/v1/insights/{id}]
       │                                                   (is_paid: True, tx_id: None)
       ▼
4. Local DB Operations (Staged with db.flush()):
       ├──► Create Debit Transaction (Negative amount for client)
       ├──► Create Credit Transaction (Positive amount for insider)
       └──► Create Purchase Record (Links client, insider, and transaction ID)
       │
       ▼
5. Local DB Commit (db.commit()) ──► State saved permanently in Postgres!
       │
       ▼
6. Finalize transaction mapping on Interaction Service ─► [PATCH /api/v1/insights/{id}]
                                                           (is_paid: True, tx_id: txn_id)
```
## Database Schemas

### Transaction

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **transaction_id** | `int` | Primary Key. Auto-incrementing unique identifier. |
| **user_id** | `varchar` | Unique UUID of the user from Identity. (Indexed) |
| **amount** | `numeric(10,2)` | Financial precision value representing debits (negative) or credits (positive). |
| **created_at** | `timestamptz` | Native server timezone-aware timestamp, defaults to `now()`. |

- As soon as the transaction has been made, it will generate an transaction id.


### Purchase

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **purchase_id** | `int` | Primary Key. Auto-incrementing unique identifier. |
| **client_id** | `varchar` | The acquiring client's unique UUID from Identity. (Indexed) |
| **insider_id** | `varchar` | The providing insider's unique UUID from Identity. (Indexed) |
| **insight_id** | `int` | Reference to the target insight asset inside the Interaction service. (Indexed) |
| **amount** | `numeric(10,2)` | Cost record copied at the precise moment of settlement. |
| **transaction_id** | `int` | Foreign Key pointing to `transactions.transaction_id`. ||

**How does the balance calculated?**

- Balance is calculated by summing all the transaction of the individual user. Credits are written as positive entries while debits are recorded as negative entries.


**How are purchased made?**

- The ledger service sends a `GET` request to the `interaction` service to get the `price` and the associated provicer's indentity (`insider_id`). The systen computes the current total balance of the user (`client_id`). If the user does not have enough funds to cover the price, the request stops immediately and raises a `409 Conflict` (insufficient Funds) error. Then the service make a `PATCH` request to the `interaction` service, setting `is_paid` to `True` for the asset.

## Tech stack

- **Python 3.11** (per `devenv.nix`) / **Python 3.12** (runtime fallback)
- **FastAPI** with async route handlers
- **SQLAlchemy 2.0** (async, `asyncpg` driver) with `Mapped[...]` typed ORM models
- **Alembic** for schema migrations
- **Pydantic v2** for request/response schemas
- **uvicorn** as the ASGI server
- **PostgreSQL 16** (one DB per service, named `ledger`)
