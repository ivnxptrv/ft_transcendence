from starlette.status import HTTP_201_CREATED
from app.schemas import TransactionRead
from app import crud
from app.schemas import TransactionCreate
from app.database import get_db
from typing import Annotated
from fastapi import Depends
from fastapi import APIRouter

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
