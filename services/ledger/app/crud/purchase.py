from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.purchase import Purchase

async def get_by_id(db: AsyncSession, purchase_id: int):
    return await db.get(Purchase, purchase_id)

async def get_all(db: AsyncSession, user_id: str, skip: int, limit: int):
    result = await db.execute(
        select(Purchase).where(Purchase.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, user_id: str, insight_id: int, transaction_id: int):
    db_obj = Purchase(user_id=user_id, insight_id=insight_id, transaction_id=transaction_id)
    db.add(db_obj)
    await db.flush()
    return db_obj