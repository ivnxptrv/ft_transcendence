from typing import Annotated
from fastapi import APIRouter, Depends

# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.crud import balance as crud
from app.schemas.balance import BalanceResponse
from decimal import Decimal

router = APIRouter()


@router.get("/{user_id}", response_model=BalanceResponse)
async def get_balance(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: str,
):
    balance = await crud.get_balance(db, user_id)
    return BalanceResponse(user_id=user_id, balance=Decimal(str(balance)))
