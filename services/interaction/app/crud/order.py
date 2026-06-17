from app.schemas import OrderUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.order import Order
from app.schemas.order import OrderCreate
import httpx
import os

SEMANTIC_URL = os.getenv("SEMANTIC_URL")


async def create_order(db: AsyncSession, order_in: OrderCreate):

    db_order = Order(
        client_id=order_in.client_id, title=order_in.title, text=order_in.text
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    try:
        payload = {
            "text": db_order.text,
            "client_id": db_order.client_id,
            "order_id": db_order.id,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SEMANTIC_URL}/api/v1/inquiries", json=payload
            )

        inquiry_id = response.json()["id"]
        db_order.inquiry_id = inquiry_id
        await db.commit()
        await db.refresh(db_order)

    except Exception as e:
        print(f"Failed to notify Semantic: {e}")

    return db_order


async def get_orders(
    db: AsyncSession,
    client_id: str,
    limit: int = 20,
    offset: int = 0,
):
    result = await db.execute(
        select(Order)
        .where(Order.client_id == client_id)
        .order_by(Order.created_at.asc())
        .limit(limit)
        .offset(offset)
    )

    return result.scalars().all()


async def get_order_by_id(db: AsyncSession, order_id: int, client_id: str):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.client_id == client_id)
    )
    return result.scalars().one_or_none()


# async def update_order(
#     db: AsyncSession, order_in: OrderUpdate, order_id: int, client_id: str
# ):
#     order = await get_order_by_id(db, order_id, client_id)
#     if not order:
#         return None

#     update = order_in.model_dump(exclude_unset=True)
#     for key, value in update.items():
#         setattr(order, key, value)

#     await db.commit()
#     await db.refresh(order)

#     return order


# async def delete_order(db: AsyncSession, order_id: int, client_id: str):
#     order = await get_order_by_id(db, order_id, client_id)
#     if order is None:
#         return False

#     await db.delete(order)
#     await db.commit()
#     return True
