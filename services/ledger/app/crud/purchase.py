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
