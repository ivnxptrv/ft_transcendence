from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.purchase import Purchase
from decimal import Decimal


async def create_purchase(
    db: AsyncSession,
    client_id: str,
    insider_id: str,
    insight_id: int,
    amount: Decimal,
    transaction_id: int,
) -> Purchase:
    db_purchase = Purchase(
        client_id=client_id,
        insider_id=insider_id,
        insight_id=insight_id,
        amount=amount,
        transaction_id=transaction_id,
    )
    db.add(db_purchase)
    await db.flush()
    return db_purchase


# For puplic API
async def get_purchases_by_user(db: AsyncSession, user_id: str) -> list[Purchase]:
    result = await db.execute(
        select(Purchase)
        .where(Purchase.client_id == user_id)
        .order_by(Purchase.purchase_id.desc())
    )
    return list(result.scalars().all())
