from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.transaction import Transaction
from app.models.purchase import Purchase

async def get_by_id(db: AsyncSession, purchase_id: int) -> Optional[Purchase]:
    result = await db.execute(select(Purchase).where(Purchase.id == purchase_id))
    return result.scalar_one_or_none()

async def list_all(db: AsyncSession, user_id: Optional[str] = None) -> List[Purchase]:
    query = select(Purchase)
    if user_id:
        query = query.join(Transaction).where(Transaction.account_id == user_id)
    
    result = await db.execute(query)
    return list(result.scalars().all())

async def create(db: AsyncSession, transaction_id: int, insight_id: int) -> Purchase:
    new_purchase = Purchase(
        transaction_id=transaction_id, 
        insight_id=insight_id, 
        is_synced=False
    )
    db.add(new_purchase)
    return new_purchase