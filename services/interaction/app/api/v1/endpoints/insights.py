from app.schemas import InsightUpdate
from starlette.status import HTTP_204_NO_CONTENT
from fastapi import Query
from fastapi import HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from typing import Annotated
from app.schemas import InsightCreate, InsightRead
from app.dependencies import get_db
from app import crud


router = APIRouter()


@router.post("/", response_model=InsightRead)
async def create_insight(
    db: Annotated[AsyncSession, Depends(get_db)],
    insight_in: InsightCreate,
):
    insight = await crud.create_insight(db, insight_in)
    if insight is None:
        raise HTTPException(status_code=404, detail="Match not found")

    return insight


@router.get("/", response_model=list[InsightRead])
async def get_insights(
    db: Annotated[AsyncSession, Depends(get_db)],
    order_id: int,
    limit: Annotated[int,Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    insights = await crud.get_insights(db, order_id, limit, offset)
    return insights


@router.get("/{insight_id}", response_model=InsightRead)
async def get_insight_by_id(
    db: Annotated[AsyncSession, Depends(get_db)],
    insight_id: int,
):
    insight = await crud.get_insight_by_id(db, insight_id)
    if insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    return insight


@router.patch("/{insight_id}", status_code=HTTP_204_NO_CONTENT)
async def update_insight(
    db: Annotated[AsyncSession, Depends(get_db)],
    insight_in: InsightUpdate,
    insight_id: int,
):
    insight = await crud.update_insight(db, insight_in, insight_id)
    if insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    return
