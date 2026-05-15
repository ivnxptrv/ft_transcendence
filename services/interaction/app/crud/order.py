from app.schemas import OrderRead
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.order import Order
from app.schemas.order import OrderCreate


async def get_order_by_id(db: AsyncSession, order_id: int):
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalars().first()


async def create_order(db: AsyncSession, order_in: OrderCreate, client_id: str):
    db_order = Order(title=order_in.title, text=order_in.text, client_id=client_id)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order
