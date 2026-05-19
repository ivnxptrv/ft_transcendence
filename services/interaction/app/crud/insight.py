from app.schemas import InsightUpdate
from app.models import Order
from app.schemas import InsightCreate
from app.crud import get_match_by_id
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Insight

"""
Conceptually:

  Insight is created when client sends POST request to Interaction

  Insight belongs to Order
  Insight belongs to Match
  Insight is written by Insider
  Insight may later connect to Ledger transaction
  
"""


async def create_insight(db: AsyncSession, insight_in: InsightCreate, insider_id: str):
    match = await get_match_by_id(db, insight_in.match_id, insider_id)
    if match is None:
        return None
    order_id = match.order_id

    db_insight = Insight(
        order_id=order_id,
        match_id=insight_in.match_id,
        insider_id=insider_id,
        text=insight_in.text,
        price=insight_in.price,
    )
    db.add(db_insight)
    await db.commit()
    await db.refresh(db_insight)
    return db_insight


async def get_insights(db: AsyncSession, order_id: int, client_id: str):
    insights = await db.execute(
        select(Insight)
        .join(Order, Insight.order_id == Order.id)
        .where(
            Insight.order_id == order_id,
            Order.client_id == client_id,
        )
    )
    return insights.scalars().all()


async def get_insight_by_id(db: AsyncSession, insight_id: int, client_id: str):
    insights = await db.execute(
        select(Insight)
        .join(Order, Insight.order_id == Order.id)
        .where(Insight.id == insight_id, Order.client_id == client_id)
    )
    return insights.scalars().one_or_none()


async def update_insight(db: AsyncSession, insight_in: InsightUpdate, insight_id: int):
    db_insight = await db.execute(select(Insight).where(Insight.id == insight_id))
    insight = db_insight.scalars().one_or_none()
    if not insight:
        return None

    insight.transaction_id = insight_in.transaction_id
    insight.is_paid = True

    await db.commit()
    await db.refresh(insight)

    return insight
