import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match
from app.models.order import Order
from app.models.insight import Insight
from app.schemas.match import MatchCreate, MatchRead


def _match_status(insight_id: int | None, is_paid: bool | None) -> str:
    # Insider lifecycle derived from this match's insight: none -> pending,
    # submitted but unpaid -> submitted, paid -> completed.
    if insight_id is None:
        return "pending"
    return "completed" if is_paid else "submitted"

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
        select(Match, Order.text, Insight.id, Insight.is_paid)
        .join(Order, Match.order_id == Order.id)
        .outerjoin(Insight, Insight.match_id == Match.id)
        .where(Match.insider_id == insider_id)
        .order_by(Match.score.desc())
        .limit(limit)
        .offset(offset)
    )
    return [
        {
            "id": match.id,
            "order_id": match.order_id,
            "insider_id": match.insider_id,
            "score": match.score,
            "is_synced": match.is_synced,
            "text": text,
            "status": _match_status(insight_id, is_paid),
        }
        for match, text, insight_id, is_paid in result.all()
    ]


async def get_match_by_id(
    db: AsyncSession, match_id: int, insider_id: str
) -> MatchRead | None:
    result = await db.execute(
        select(Match, Order.text, Insight.id, Insight.is_paid)
        .join(Order, Match.order_id == Order.id)
        .outerjoin(Insight, Insight.match_id == Match.id)
        .where(Match.id == match_id, Match.insider_id == insider_id)
    )
    row = result.one_or_none()
    if row is None:
        return None
    match, text, insight_id, is_paid = row
    return MatchRead(
        id=match.id,
        order_id=match.order_id,
        insider_id=match.insider_id,
        score=match.score,
        is_synced=match.is_synced,
        text=text,
        status=_match_status(insight_id, is_paid),
    )
