from starlette.status import HTTP_204_NO_CONTENT
from fastapi import HTTPException
from app.schemas import OrderRead
from typing import Annotated
from fastapi import APIRouter, Depends, Query

# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app import crud, schemas

router = APIRouter()


@router.post("/", response_model=OrderRead)
async def create_order(
    db: Annotated[AsyncSession, Depends(get_db)],
    order_in: schemas.OrderCreate,
):
    order = await crud.create_order(db, order_in)

    return order


@router.get("/", response_model=list[OrderRead])
async def get_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    client_id: Annotated[str, Query(max_length=50)],
    limit: Annotated[int, Query(ge=1, le=20)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    orders = await crud.get_orders(db, client_id, limit, offset)
    return orders


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    db: Annotated[AsyncSession, Depends(get_db)],
    order_id: int,
    client_id: Annotated[str, Query(max_length=50)],
):
    order = await crud.get_order_by_id(db, order_id, client_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# @router.delete("/{order_id}", status_code=HTTP_204_NO_CONTENT)
# async def delete_order(
#     db: Annotated[AsyncSession, Depends(get_db)],
#     order_id: int,
#     user_id: Annotated[str, Query(max_length=50)],
# ):
#     deleted = await crud.delete_order(db, order_id, user_id)
#     if not deleted:
#         raise HTTPException(status_code=404, detail="Order not found")
#     return


# @router.patch("/{order_id}", response_model=OrderRead)
# async def update_order(
#     db: Annotated[AsyncSession, Depends(get_db)],
#     order_in: schemas.OrderUpdate,
#     order_id: int,
#     user_id: Annotated[str, Query(max_length=50)],
# ):
#     order = await crud.update_order(db, order_in, order_id, user_id)
#     if not order:
#         raise HTTPException(status_code=404, detail="Order not found")
#     return order
