from app.schemas import OrderRead
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud, schemas, models

router = APIRouter()

# Temp hardcoded
client_id = "an3js0cdc73bf"


@router.post("/", response_model=OrderRead)
async def create_order(
    db: Annotated[AsyncSession, Depends(get_db)],
    order_in: schemas.OrderCreate,
):
    order = await crud.create_order(db, order_in, client_id)
    return order
