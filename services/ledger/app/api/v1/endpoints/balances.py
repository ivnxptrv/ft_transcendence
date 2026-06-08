from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import schemas, crud

router = APIRouter()

@router.get("/balances/{account_id}", response_model=schemas.BalanceResponse)
async def get_balance(account_id: str, db: AsyncSession = Depends(get_db)):
    if not await crud.transaction.account_has_history(db, account_id):
        raise HTTPException(status_code=404, detail="Account not found")

    total_balance = await crud.transaction.calculate_balance(db, account_id)
    return {
        "account_id": account_id,
        "balance": total_balance,
        "status": "active" 
    }