# pyrefly: ignore [missing-import]
from sqlalchemy import select, func

# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction


async def get_balance(db: AsyncSession, user_id: str) -> float:
    result = await db.execute(
        select(func.sum(Transaction.amount)).where(Transaction.user_id == user_id)
    )
    return result.scalar() or 0.0
