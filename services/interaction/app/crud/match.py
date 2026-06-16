from app.schemas.match import MatchCreate
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
# pyrefly: ignore [missing-import]
from sqlalchemy import select
from app.models.match import Match
import httpx
import os
# async def create_matches(db: AsyncSession, match_in: list[MatchCreate]):
#     """
#     data for Match objects comes from Semantic service with POST req
#     Match does not exist before that request
#     """
#     db_matches = []

#     for match in match_in:
#         db_matches.append(
#             Match(
#                 order_id=match.order_id,
#                 insider_id=match.insider_id,
#                 score=match.score,
#                 score_id=match.score_id,
#             )
#         )

#     db.add_all(db_matches)
#     await db.commit()
#     return

SEMANTIC_URL = os.getenv("SEMANTIC_URL", "http://localhost:8001")

async def create_matches(db: AsyncSession, match_in: MatchCreate) -> Match:
    """
    data for Match objects comes from Semantic service with POST req
    Match does not exist before that request
    """
    db_match = Match(
        order_id=match_in.order_id,
        insider_id=match_in.insider_id,
        score=match_in.score,
    )

    db.add(db_match)
    await db.commit()
    await db.refresh(db_match)
    return db_match


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


async def get_match_by_id(db: AsyncSession, match_id: int, insider_id: str):
    result = await db.execute(
        select(Match).where(Match.id == match_id, Match.insider_id == insider_id)
    )
    return result.scalars().one_or_none()
