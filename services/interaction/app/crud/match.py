from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.match import Match


async def get_matches(
    db: AsyncSession,
    insider_id: str,
    limit: int = 20,
    offset: int = 0,
):
    result = await db.execute(
        select(Match)
        .where(Match.insider_id == insider_id)
        .order_by(Match.score.desc())
        .limit(limit)
        .offset(offset)
    )

    return result.scalars().all()
