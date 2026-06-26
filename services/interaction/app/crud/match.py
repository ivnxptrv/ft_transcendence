import os

from sqlalchemy import select, func, and_
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


def _status_condition(status: str | None):
    # Match status is derived from its insight, not stored — so a status filter
    # translates to a predicate over the outer-joined Insight row.
    if status == "pending":
        return Insight.id.is_(None)
    if status == "submitted":
        return and_(Insight.id.is_not(None), Insight.is_paid.is_(False))
    if status == "completed":
        return Insight.is_paid.is_(True)
    return None


async def get_matches(
    db: AsyncSession,
    insider_id: str,
    limit: int = 20,
    offset: int = 0,
    status: str | None = None,
    sort: str = "score_desc",
    score_min: float | None = None,
    score_max: float | None = None,
):
    # Same filters drive the page and its count. The status predicate needs the
    # Insight join, so the count query joins too. score_* are fractions (0..1).
    conditions = [Match.insider_id == insider_id]
    status_cond = _status_condition(status)
    if status_cond is not None:
        conditions.append(status_cond)
    if score_min is not None:
        conditions.append(Match.score >= score_min)
    if score_max is not None:
        conditions.append(Match.score <= score_max)

    total = await db.scalar(
        select(func.count())
        .select_from(Match)
        .outerjoin(Insight, Insight.match_id == Match.id)
        .where(*conditions)
    )

    order_by = Match.score.asc() if sort == "score_asc" else Match.score.desc()
    result = await db.execute(
        select(Match, Order.text, Insight.id, Insight.is_paid)
        .join(Order, Match.order_id == Order.id)
        .outerjoin(Insight, Insight.match_id == Match.id)
        .where(*conditions)
        .order_by(order_by)
        .limit(limit)
        .offset(offset)
    )
    matches = [
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
    return matches, total or 0


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
