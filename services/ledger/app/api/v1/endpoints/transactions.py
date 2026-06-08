from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.crud import transaction as crud
from typing import List
from app.schemas.transaction import TransactionCreate, TransactionRead

router = APIRouter()

@router.post("/", response_model=TransactionRead)
async def create_transaction(data: TransactionCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create(db, data)

@router.get("/", response_model=List[TransactionRead])
async def list_transactions(user_id: str, skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    return await crud.get_all(db, user_id, skip, limit)

@router.get("/{transaction_id}", response_model=TransactionRead)
async def get_transaction(transaction_id: int, db: AsyncSession = Depends(get_db)):
    tx = await crud.get_by_id(db, transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
