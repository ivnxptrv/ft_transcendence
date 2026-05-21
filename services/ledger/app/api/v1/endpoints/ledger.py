# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, func
# from app.database import get_db
# from app.models.transaction import Transaction
# from app.schemas import TransactionCreate
# from app import schemas
# from datetime import datetime

# router = APIRouter()

# @router.post("/transactions")
# async def create_transaction(data: TransactionCreate, db: AsyncSession = Depends(get_db)):
#     # Case: Prevent Duplicates (Idempotency)
#     existing = await db.execute(select(Transaction).where(Transaction.request_id == data.request_id))
#     if existing.scalar():
#         raise HTTPException(status_code=400, detail="Duplicate transaction (request_id already exists)")

#     new_tx = Transaction(**data.dict())
#     db.add(new_tx)
#     await db.commit()
#     await db.refresh(new_tx)
#     return new_tx

# @router.get("/balances/{account_id}", response_model=schemas.BalanceResponse)
# async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(
#         select(func.sum(Transaction.amount)).where(Transaction.account_id == account_id)
#     )
#     balance = result.scalar() or 0.0
#     return {"account_id": account_id, "balance": balance}

# @router.get("/balances/{account_id}") # Ensure it's plural 'balances' based on your successful test!
# async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):

# # 1. Construct the query to SUM the amount column
#     # SQL equivalent: SELECT sum(amount) FROM transactions WHERE account_id = 'user123';
#     query = select(func.sum(Transaction.amount)).where(Transaction.account_id == account_id)
    
#     # 2. Execute the query
#     result = await db.execute(query)
    
#     # 3. Scalar() gets the first column of the first row
#     total_balance = result.scalar()
    
#     # 4. Handle cases where the user has no transactions (sum will be None)
#     if total_balance is None:
#         total_balance = 0.0
        
#     return {
#         "account_id": account_id,
#         "balance": float(total_balance)
#     }

# # @router.get("/transactions/{account_id}")
# # async def get_transactions(account_id: str, db: AsyncSession = Depends(get_db)):
# #     # Query all rows for this user
# #     query = select(Transaction).where(Transaction.account_id == account_id)
# #     result = await db.execute(query)
    
# #     # .scalars().all() converts the database rows into a list of Python objects
# #     transactions = result.scalars().all()
    
# #     # Return the list (it will be empty [] if no transactions exist)
# #     return transactions

# @router.get("/transactions/{tx_id}")
# async def get_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Transaction).where(Transaction.id == tx_id))
#     tx = result.scalar_one_or_none()
#     if not tx:
#         raise HTTPException(status_code=404, detail="Transaction not found")
#     return tx

# @router.delete("/transactions/{tx_id}")
# async def delete_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Transaction).where(Transaction.id == tx_id))
#     tx = result.scalar_one_or_none()
#     if not tx:
#          raise HTTPException(status_code=404, detail="Transaction not found")
    
#     await db.delete(tx)
#     await db.commit()
#     return {"detail": "Transaction deleted successfully"}

# # @router.get("/balances/{account_id}")
# # async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):
# #     # Sum all transactions for this user
# #     query = select(func.sum(Transaction.amount)).where(Transaction.account_id == account_id)
# #     result = await db.execute(query)
# #     current_balance = result.scalar() or 0.0

# #     # Handle Case: What if the balance goes negative?
# #     # We return the balance regardless, but you can add a flag
# #     is_overdrawn = current_balance < 0
    
# #     return {
# #         "account_id": account_id, 
# #         "balance": current_balance,
# #         "status": "overdrawn" if is_overdrawn else "healthy"
# #     }

# @router.get("/balances/{account_id}")
# async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):
#     # Check if user has any transactions (existence check)
#     count_query = await db.execute(select(func.count(Transaction.id)).where(Transaction.account_id == account_id))
#     if count_query.scalar() == 0:
#         raise HTTPException(status_code=404, detail="User/Account does not exist")

#     # Summing logic
#     query = select(func.sum(Transaction.amount)).where(Transaction.account_id == account_id)
#     result = await db.execute(query)
#     current_balance = result.scalar() or 0.0

#     # Case: Handle negative balance status
#     status = "overdrawn" if current_balance < 0 else "active"

#     return {
#         "account_id": account_id,
#         "balance": current_balance,
#         "status": status
#     }

# @router.post("/transactions")
# async def create_transaction(data: TransactionCreate, db: AsyncSession = Depends(get_db)):
#     # 1. Handle zero or negative amount if business rules forbid it
#     if data.amount == 0:
#         raise HTTPException(status_code=400, detail="Amount cannot be zero")
    
#     # 2. Check for Duplicate Submission (Idempotency)
#     # Using a 'request_id' sent by the frontend to prevent double-charging
#     existing = await db.execute(select(Transaction).where(Transaction.request_id == data.request_id))
#     if existing.scalar_one_or_none():
#         raise HTTPException(status_code=409, detail="Transaction already processed")

#     new_tx = Transaction(**data.dict())
#     db.add(new_tx)
#     await db.commit()
#     return new_tx

# @router.get("/transactions")
# async def list_transactions(
#     account_id: str = None, 
#     start_date: datetime = None, 
#     tx_type: str = None, 
#     db: AsyncSession = Depends(get_db)
# ):
#     query = select(Transaction)
#     if account_id:
#         query = query.where(Transaction.account_id == account_id)
#     if start_date:
#         query = query.where(Transaction.created_at >= start_date)
#     if tx_type:
#         query = query.where(Transaction.transaction_type == tx_type)
    
#     result = await db.execute(query)
#     return result.scalars().all()
    
# @router.get("/balances/{account_id}")
# async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):
#     # Sum all transactions for this user
#     query = select(func.sum(Transaction.amount)).where(Transaction.account_id == account_id)
#     result = await db.execute(query)
#     current_balance = result.scalar() or 0.0

#     # Handle Case: What if the balance goes negative?
#     # We return the balance regardless, but you can add a flag
#     is_overdrawn = current_balance < 0
    
#     return {
#         "account_id": account_id, 
#         "balance": current_balance,
#         "status": "overdrawn" if is_overdrawn else "healthy"
#     }

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.database import get_db
from app.models.transaction import Transaction, Purchase
from app import schemas

router = APIRouter()

# --- TRANSACTIONS ---

INSIGHT_SERVICE_URL = "http://insight_service_container:8000/api/v1/insights"

class PurchaseCreate(BaseModel):
    purchase_id: int
    insight_id: int
    transaction_id: int
    is_synced: bool
    amount: float
    user_id: str

@router.post("/purchases", response_model=None)
async def create_purchase(
    purchase_in: PurchaseCreate, 
    db: AsyncSession = Depends(get_db)
):
    async with db.begin():
        # Create Transaction record
        new_tx = Transaction(
            amount=purchase_in.amount,
            account_id=purchase_in.user_id,
            transaction_type="debit",
            request_id=f"pur_{purchase_in.insight_id}" # Example unique ID
        )
        db.add(new_tx)
        await db.flush() # Gets the ID without committing yet
        
        # Create Purchase record
        new_purchase = Purchase(transaction_id=new_tx.id, insight_id=purchase_in.insight_id, is_synced=False)
        db.add(new_purchase)
    # Database is committed here

    # Trigger Interaction Service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"http://interaction:8000/insights/{new_purchase.insight_id}", 
                json={"isPaid": True},
                timeout=5.0
            )
            if response.status_code == 200:
                # Update flag to True
                new_purchase.is_synced = True
                await db.commit()
        except Exception as e:
            print(f"Sync failed, cron will retry later: {e}")


@router.post("/transactions", response_model=schemas.Transaction)
async def create_transaction(data: schemas.TransactionCreate, db: AsyncSession = Depends(get_db)):
    # Logic Check: Zero Amount
    if data.amount == 0:
        raise HTTPException(status_code=400, detail="Amount cannot be zero")
    
    # Case: Prevent Duplicates (Idempotency)
    existing = await db.execute(
        select(Transaction).where(Transaction.request_id == data.request_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Transaction already processed (Duplicate request_id)")

    new_tx = Transaction(**data.model_dump())
    db.add(new_tx)
    await db.commit()
    await db.refresh(new_tx)
    return new_tx

@router.get("/transactions", response_model=List[schemas.Transaction])
async def list_transactions(
    account_id: Optional[str] = None, 
    start_date: Optional[datetime] = None, 
    tx_type: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Transaction)
    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if start_date:
        query = query.where(Transaction.created_at >= start_date)
    if tx_type:
        query = query.where(Transaction.transaction_type == tx_type)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/transactions/{tx_id}", response_model=schemas.Transaction)
async def get_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).where(Transaction.id == tx_id))
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.delete("/transactions/{tx_id}")
async def delete_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).where(Transaction.id == tx_id))
    tx = result.scalar_one_or_none()
    if not tx:
         raise HTTPException(status_code=404, detail="Transaction not found")
    
    await db.delete(tx)
    await db.commit()
    return {"detail": "Transaction deleted successfully"}

# --- BALANCES ---

@router.get("/balances/{account_id}", response_model=schemas.BalanceResponse)
async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):
    # Existence check: Handle "What if the user doesn't exist?"
    count_check = await db.execute(
        select(func.count(Transaction.id)).where(Transaction.account_id == account_id)
    )
    if count_check.scalar() == 0:
        raise HTTPException(status_code=404, detail="Account not found")

    # Calculate balance
    query = select(func.sum(Transaction.amount)).where(Transaction.account_id == account_id)
    result = await db.execute(query)
    total_balance = result.scalar() or 0.0
    
    # Status logic: Handle "What if the balance goes negative?"
    status = "overdrawn" if total_balance < 0 else "active"
        
    return {
        "account_id": account_id,
        "balance": float(total_balance),
        "status": status
    }
    