from datetime import date, timedelta
from app.schemas import OrderUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.order import Order
from app.models.insight import Insight
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
    status: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    sort: str = "date_desc",
):
    insight_count_subq = (
        select(func.count(Insight.id))
        .where(Insight.order_id == Order.id)
        .correlate(Order)
        .scalar_subquery()
    )

    # Same filters drive both the page and its total count so the pager stays
    # accurate. date_to is inclusive of the whole day (< next midnight).
    conditions = [Order.client_id == client_id]
    if status:
        conditions.append(Order.status == status)
    if date_from:
        conditions.append(Order.created_at >= date_from)
    if date_to:
        conditions.append(Order.created_at < date_to + timedelta(days=1))

    total = await db.scalar(
        select(func.count()).select_from(Order).where(*conditions)
    )

    order_by = Order.created_at.asc() if sort == "date_asc" else Order.created_at.desc()
    result = await db.execute(
        select(Order, insight_count_subq.label("insight_count"))
        .where(*conditions)
        .order_by(order_by)
        .limit(limit)
        .offset(offset)
    )

    orders = []
    for order, count in result.all():
        order.insight_count = count or 0
        orders.append(order)
    return orders, total or 0


async def get_order_by_id(db: AsyncSession, order_id: int, client_id: str):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.client_id == client_id)
    )
    return result.scalars().one_or_none()


async def complete_order(db: AsyncSession, order_id: int, client_id: str):
    # Client closes an Order: status flips to "completed" and the matching
    # Inquiry is deactivated in Semantic so no further Insiders get matched.
    order = await get_order_by_id(db, order_id, client_id)
    if order is None:
        return None

    order.status = "completed"
    db.add(order)
    await db.commit()
    await db.refresh(order)

    if order.inquiry_id is not None:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{SEMANTIC_URL}/api/v1/inquiries/{order.inquiry_id}",
                    timeout=10.0,
                )
            if response.status_code not in (200, 202):
                print(
                    f"Failed to deactivate inquiry {order.inquiry_id} in Semantic: "
                    f"{response.status_code}"
                )
        except Exception as e:
            print(f"Failed to notify Semantic on order completion: {e}")

    return order


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
