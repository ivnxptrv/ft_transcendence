from app.schemas import InsightCreate
from app.crud import get_match_by_id
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Insight


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
