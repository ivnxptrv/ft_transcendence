from starlette.status import HTTP_201_CREATED
from app.schemas import TransactionRead
from app import crud
from app.schemas import TransactionCreate
from app.database import get_db
from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException

# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/", status_code=HTTP_201_CREATED, response_model=TransactionRead)
async def create_transaction(
    db: Annotated[AsyncSession, Depends(get_db)], transaction_in: TransactionCreate
):
    transaction = await crud.create_transaction(db, transaction_in)
    await db.commit()
    await db.refresh(transaction)
    return transaction


@router.get("/", response_model=TransactionRead)
async def get_transactions(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: str,
    limit: Annotated[int, Query(ge=1, le=20)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    txns = await crud.get_transactions(db, user_id, limit, offset)
    if txns is None:
        raise HTTPException(status_code=404, detail="Transcations not found")
    return txns
