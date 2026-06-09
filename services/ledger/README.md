# LEDGER SERVICE

### The ledger service mainly focus on transactions, balances and purchases. Whenever you need to credit your balance, the ledger will take care of it. You would like to know your current balance? Voila, the service will provide you immediately. Do you have enough money to make a purchase? Don't worry! Just purchase it, and if you don't have enough money, the ledger won't let you make a transaction. As long as you have enough money, your purchasing process will be easy peasy.

## Transactions

- POST /transactions/: Create a new transaction including credit & debit depend on sign (+,-) of the amount.

- GET /transactions/: List all transactions with optional filters for account_id.

- GET / transactions/{tx_id}: Get the exact transaction with the transaction_id

## Balances

- GET /balances/{account_id}: Retrieve the net balance

- POST /purchases/ : Create a new purchase and if successful it will triger the isPaid to True in insight, interaction_service

- GET /purchases/ : List all the purchases done by the certain user

- GET / purchases/ {purchase_id} : Get the detail of the purchases with the purchase_id

# Attributes

## Transaction

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **user_id** | `String` | The unique id for the user |
| **amount** | `Float` | The value of the transaction. Positive for credit, negative for debit |
| **transaction_id** | `Integer` | The specific number for a transaction |

- The amount will get from the insight_attribute from interaction
- As soon as the transaction has been made, it will generate an transaction id.

## Balance

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **account_id** | `String` | Confirms the ID of the account |
| **balance** | `Float` | The net sum of all amount values associated with the user_id |

**How does the balance calculated?**

- Balance is calculated by adding all the transaction of the individual user, the credit transaction will be positive and the debit transaction will be negative. Later all the transaction will be added and voila, here comes the balance

## Purchase

| Attribute | Type | Description |
| :--- | :--- | :--- |
| **insight_id** | integer | Confirms the ID of the purchase that will be made which is got from interaction_service |
| **amount** | `Float` | The amount of money that is needed to be debit from the user |
| **user_id** | `String` | Confirms the user ID that will make a purchase |

**How are purchased made?**

- If the interaction_service requests a purchase along with the insight_id, the transaction attribute will be created. If the balance is not enough, it will return an error along with the code 400. If the balance is enough, the amount of money will be converted to negative and make a transaction, and it will trigger the tag isPaid which is created in the interaction_service to True along with a transaction_id.

<!-- From devenv.nix -->

<!-- ## processes
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
  }; -->