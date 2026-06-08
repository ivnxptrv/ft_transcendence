# 1. Prerequisites

Docker and Docker Compose.

# 2. Installation & Launch

docker-compose up --build

# 3. Accessing the API

Interactive Documentation (Swagger): $LEDGER_URL

API Base URL: http://localhost:8000/api/v1

API Reference

## Transactions

- POST /transactions/: Create a new debit or credit.

- GET /transactions/: List all transactions with optional filters for account_id.

- GET / transactions/{tx_id}: Get the exact transaction with the transaction_id

## Balances

- GET /balances/{account_id}: Retrieve the net balance and current status (active/overdrawn) for a specific account.

- POST /purchases/ : Create a new purchase and if successful it will triger the isPaid to True in insight, interaction_service

- GET /purchases/ : List all the purchases done by the certain user

- GET / purchases/ {purchase_id} : Get the detail of the purchases with the purchase_id

# 4. Attributes

## Transaction

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **account_id** | `String` | The unique identifier for the user or ledger account |
| **request_id** | `String` | Unique Identifier used for idempotency Prevents the same transaction from being processed twice. |
| **amount** | `Float` | The value of the transaction. Positive for credit, negative for debit |
| **transaction_type** | `String` | Categorization (e.g., credit, debit, refund). Often used for filtering |
| **created_at** | `DateTime` | Timestamp of when the transaction was committed to the ledger 

- As soon as the transaction has been made, it will generate an transaction id.

## Balance

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **account_id** | `String` | Confirms the ID of the account being queried |
| **balance** | `Float` | The net sum of all amount values associated with the account_id |
| **status** | `Literal` | "Returns ""active"" if the balance is ≥0 and ""overdrawn"" if the balance is <0." |

**How does the balance calculated?**

- Balance is calculated by adding all the transaction of the individual user, if the transaction_type is credit, the amount will be positive, and if the transaction_type is debit, the amount will be negative. Later all the transaction will be added and voila, here comes the

## Purchase

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **insight_id** | integer | Confirms the ID of the purchase that will be made which is got from interaction_service |
| **amount** | `Float` | The amount of money that is needed to be debit from the user |
| **user_id** | `String` | Confirms the user ID that will make a purchase |

**How are purchased made?**

- If the interaction_service requests a purchase along with the insight_id, the transaction attribute will be created, and the insight_id will be the request_id in the transaction, and this will prevent the duplicate purchases. If the balance is not enough, it will return an error along with the code 400. If the balance is enough, it will trigger the tag isPaid which is created in the interaction_service to True.

From devenv.nix

## processes
  processes = {
    # identity.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
    # interaaction.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p $LEDGER_PORT";
    ledger = {
      exec = ''
      while ! pg_isready -d $DB_NAME -p 5433 > /dev/null 2>&1; do
        echo "Waiting for Postgres at localhost:5433..."
        sleep 1
      done

      export PYTHONPAHT=$PYTHONPATH
      sleep 3
      
      alembic upgrade head && uvicorn app.main:app --reload --port $LEDGER_PORT
    '';
    };
    # semantic.exec = "uvicorn main:app --reload --port ${config.env.SEMANTIC_PORT}";
  };