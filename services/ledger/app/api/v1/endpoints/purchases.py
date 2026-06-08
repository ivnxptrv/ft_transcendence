import httpx
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, INTERACTION_URL
from app.schemas.purchase import PurchaseCreate, PurchaseRead
from app.schemas.transaction import TransactionCreate
from app import crud

router = APIRouter()

@router.post("/")
async def create_purchase(data: PurchaseCreate, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Insight price
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{INTERACTION_URL}/api/v1/insights/{data.insight_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Insight not found")
        price = resp.json().get("price")

    # 2. Validate Balance
    balance = await crud.transaction.calculate_balance(db, data.user_id)
    
    # NEW: Specific error handling for insufficient balance
    if balance < price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "insufficient balance",
                "error_code": "INSUFFICIENT_FUNDS",
                "current_balance": balance,
                "required_amount": price
            }
        )

    # 3. Create Transaction (as a debit)
    new_tx = await crud.transaction.create(db, TransactionCreate(user_id=data.user_id, amount=-price))

    # 4. Create Purchase (linking to transaction)
    new_purchase = await crud.purchase.create(db, data.user_id, data.insight_id, new_tx.transaction_id)

    # 5. Patch Interaction Service
    async with httpx.AsyncClient() as client:
        await client.patch(
            f"{INTERACTION_URL}/api/v1/insights/{data.insight_id}",
            json={"transaction_id": new_tx.transaction_id, "is_paid": True}
        )

    await db.commit()
    return {"status": "success", "purchase_id": new_purchase.purchase_id}
@router.get("/", response_model=List[PurchaseRead])
async def list_purchases(user_id: str, skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    return await crud.purchase.get_all(db, user_id, skip, limit)

@router.get("/{purchase_id}", response_model=PurchaseRead)
async def get_purchase(purchase_id: int, db: AsyncSession = Depends(get_db)):
    purchase = await crud.purchase.get_by_id(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase
