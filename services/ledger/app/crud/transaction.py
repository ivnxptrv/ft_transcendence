from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate
from sqlalchemy import select


async def create_transaction(
    db: AsyncSession, transaction_in: TransactionCreate
) -> Transaction:
    db_transaction = Transaction(**transaction_in.model_dump())
    db.add(db_transaction)
    await db.flush()
    return db_transaction


async def get_transactions(
    db: AsyncSession, user_id: str, limit: int, offset: int
) -> list[Transaction]:

    txns = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.asc())
        .limit(limit)
        .offset(offset)
    )
    return txns.scalars().all()
