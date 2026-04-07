from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud, schemas

router = APIRouter()


@router.post("/", response_model=schemas.UserRead)
async def register_user(
    user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)
):
    user = await crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="User already registered")
    return await crud.create_user(db=db, user_in=user_in)
