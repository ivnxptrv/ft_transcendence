from starlette.status import HTTP_204_NO_CONTENT
from app.schemas.match import MatchCreate
from app.schemas import MatchRead
from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud

router = APIRouter()


@router.post("/", status_code=HTTP_204_NO_CONTENT)
async def create_matches(
    db: Annotated[AsyncSession, Depends(get_db)], match_in: list[MatchCreate]
):
    await crud.create_matches(db, match_in)
    return


@router.get("/", response_model=list[MatchRead])
async def get_matches(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Query(max_length=50)],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    matches = await crud.get_matches(db, user_id, limit, offset)
    return matches
