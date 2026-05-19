from fastapi import Query
from fastapi import HTTPException
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
    user_id: Annotated[str, Query(max_length=50)],
):
    insight = await crud.create_insight(db, insight_in, user_id)
    if insight is None:
        raise HTTPException(status_code=404, detail="Match not found")

    return insight


# get - Web client
# patch - for Ledge
