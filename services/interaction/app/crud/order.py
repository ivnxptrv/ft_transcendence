from app.schemas import OrderUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.order import Order
from app.schemas.order import OrderCreate


async def create_order(db: AsyncSession, order_in: OrderCreate, client_id: str):
    db_order = Order(title=order_in.title, text=order_in.text, client_id=client_id)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def get_orders(
    db: AsyncSession,
    client_id: str,
    limit: int = 50,
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


async def delete_order(db: AsyncSession, order_id: int, client_id: str):
    order = await get_order_by_id(db, order_id, client_id)
    if order is None:
        return False

    await db.delete(order)
    await db.commit()
    return True


async def update_order(
    db: AsyncSession, order_in: OrderUpdate, order_id: int, client_id: str
):
    order = await get_order_by_id(db, order_id, client_id)
    if not order:
        return None

    update = order_in.model_dump(exclude_unset=True)
    for key, value in update.items():
        setattr(order, key, value)

    await db.commit()
    await db.refresh(order)

    return order
