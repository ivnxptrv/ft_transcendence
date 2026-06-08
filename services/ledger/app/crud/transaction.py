from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate

async def create(db: AsyncSession, data: TransactionCreate):
    new_transaction = Transaction(**data.dict())
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    
    return new_transaction

async def calculate_balance(db: AsyncSession, user_id: str) -> float:
    result = await db.execute(
        select(func.sum(Transaction.amount)).where(Transaction.user_id == user_id)
    )
    return result.scalar() or 0.0

async def get_by_id(db: AsyncSession, transaction_id: int):
    return await db.get(Transaction, transaction_id)

async def get_all(db: AsyncSession, user_id: str, skip: int, limit: int):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()