from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.crud import transaction as crud

router = APIRouter()

@router.get("/{user_id}")
async def get_balance(user_id: str, db: AsyncSession = Depends(get_db)):
    balance = await crud.calculate_balance(db, user_id)
    return {"user_id": user_id, "balance": balance}