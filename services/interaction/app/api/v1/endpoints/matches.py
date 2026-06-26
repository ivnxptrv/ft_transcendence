from starlette.status import HTTP_204_NO_CONTENT, HTTP_201_CREATED
from app.schemas.match import MatchCreate
from app.schemas import MatchRead
from typing import Annotated
from fastapi import APIRouter, Depends, Query, Response

# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud

router = APIRouter()


@router.post("", status_code=HTTP_201_CREATED)
async def create_matches(
    db: Annotated[AsyncSession, Depends(get_db)], match_in: MatchCreate
):
    await crud.create_matches(db, match_in)
    return


@router.get("", response_model=list[MatchRead])
async def get_matches(
    db: Annotated[AsyncSession, Depends(get_db)],
    response: Response,
    insider_id: Annotated[str, Query(max_length=50)],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    status: Annotated[str | None, Query(max_length=16)] = None,
    sort: Annotated[str, Query(max_length=16)] = "score_desc",
    score_min: Annotated[float | None, Query(ge=0, le=1)] = None,
    score_max: Annotated[float | None, Query(ge=0, le=1)] = None,
):
    matches, total = await crud.get_matches(
        db, insider_id, limit, offset, status, sort, score_min, score_max
    )
    response.headers["X-Total-Count"] = str(total)
    return matches


@router.get("/{match_id}", response_model=MatchRead)
async def get_matches(
    db: Annotated[AsyncSession, Depends(get_db)],
    match_id: int,
    insider_id: Annotated[str, Query(max_length=50)],
):
    matches = await crud.get_match_by_id(db, match_id, insider_id)
    return matches
