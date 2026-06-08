import os
import time
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.models.transaction import Transaction
from app import crud

router = APIRouter()

class PurchaseCreate(BaseModel):
    insight_id: int
    amount: float
    user_id: str

@router.get("/")
async def list_purchases(user_id: str = None, db: AsyncSession = Depends(get_db)):
    return await crud.purchase.list_all(db, user_id)

@router.post("/")
async def create_purchase(purchase_in: PurchaseCreate, db: AsyncSession = Depends(get_db)):
    if purchase_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Purchase amount must be greater than zero")

    current_balance = await crud.transaction.calculate_balance(db, purchase_in.user_id)
    if current_balance < purchase_in.amount:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient funds. Required: {purchase_in.amount}, Available: {current_balance}"
        )

    # 🛑 1. REMOVED: async with db.begin():
    # Directly use the transaction provided by get_db
    new_tx = Transaction(
        amount=purchase_in.amount,
        account_id=purchase_in.user_id,
        transaction_type="debit",
        request_id=f"pur_{purchase_in.insight_id}_{int(time.time())}"
    )
    db.add(new_tx)
    await db.flush() # Forces Postgres to generate an ID for new_tx right now
    
    new_purchase = await crud.purchase.create(db, transaction_id=new_tx.id, insight_id=purchase_in.insight_id)
    await db.flush() # Forces Postgres to finalize the primary key for the purchase object
    await db.refresh(new_purchase)

    interaction_base_url = os.getenv("INTERACTION_URL", "http://localhost:8080")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{interaction_base_url}/interactions/{new_purchase.insight_id}", 
                json={"isPaid": True},
                timeout=5.0
            )
            if response.status_code == 200:
                # 🛑 2. REMOVED: async with db.begin():
                # Since the object is already tracked in this active request transaction, 
                # you can mutate the property directly and flush it safely!
                new_purchase.is_synced = True 
                await db.flush()
        except Exception as e:
            print(f"Downstream Interaction Sync failed gracefully: {e}")
            
    return {"status": "success", "purchase_id": new_purchase.id}

@router.get("/{purchase_id}")
async def get_purchase(purchase_id: int, db: AsyncSession = Depends(get_db)):
    purchase = await crud.purchase.get_by_id(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase