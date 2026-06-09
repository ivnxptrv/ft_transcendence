from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


async def create_transaction(
    db: AsyncSession, transaction_in: TransactionCreate
) -> Transaction:
    db_transaction = Transaction(**transaction_in.model_dump())
    db.add(db_transaction)
    await db.flush()
    return db_transaction
