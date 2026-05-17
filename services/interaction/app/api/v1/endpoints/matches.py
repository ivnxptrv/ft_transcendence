from app.schemas import MatchRead
from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud

router = APIRouter()

# Temp hardcoded
insider_id = "fj89s9dnfbfb7sv7n2xb3cnn27x3n40"


@router.get("/", response_model=list[MatchRead])
async def get_matches(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    matches = await crud.get_matches(db, insider_id, limit, offset)
    return matches
