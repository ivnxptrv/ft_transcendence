"""Public API — a secured gateway over the database (subject IV.1, Major).

Every endpoint here is authenticated by an `X-API-Key` header and rate-limited
per key (see dependencies.get_api_key_owner). The actual data lives in peer
services, so identity forwards each call to the service that owns the resource:

    orders    → interaction
    insights  → interaction
    users     → identity (local)

The key's owner (`sub`) is the identity of the caller: order writes/reads are
stamped/scoped to it, and a key may only delete its own owner's account.

5 endpoints: GET/POST orders, GET/POST insights, DELETE user.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_api_key_owner, get_db
from app.services import gateway, user_service

router = APIRouter()

_INTERACTION = settings.INTERACTION_URL


# --- request bodies (validated identity-side before forwarding) ---
# The caller never sends its own id: identity stamps the key owner onto writes.


class OrderCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    text: str = Field(min_length=1)


class InsightCreateIn(BaseModel):
    match_id: int
    text: str = Field(min_length=1)
    price: int = Field(ge=0)


# --- orders (→ interaction) ---


@router.get("/orders/{order_id}", summary="Get one of your orders")
async def get_order(order_id: int, owner: str = Depends(get_api_key_owner)):
    # Scoped to the key owner: interaction filters by client_id, so a key can
    # only read its own orders (no enumerating other clients' integer ids).
    return await gateway.forward(
        "GET",
        f"{_INTERACTION}/api/v1/orders/{order_id}",
        params={"client_id": owner},
    )


@router.post("/orders", status_code=status.HTTP_201_CREATED, summary="Create an order")
async def create_order(body: OrderCreateIn, owner: str = Depends(get_api_key_owner)):
    return await gateway.forward(
        "POST",
        f"{_INTERACTION}/api/v1/orders/",
        json={"client_id": owner, **body.model_dump()},
    )


# --- insights (→ interaction) ---


@router.get("/insights/{insight_id}", summary="Get one insight")
async def get_insight(insight_id: int, owner: str = Depends(get_api_key_owner)):
    return await gateway.forward(
        "GET", f"{_INTERACTION}/api/v1/insights/{insight_id}"
    )


@router.post(
    "/insights", status_code=status.HTTP_201_CREATED, summary="Create an insight"
)
async def create_insight(body: InsightCreateIn, owner: str = Depends(get_api_key_owner)):
    # The key owner is the insider authoring the insight.
    return await gateway.forward(
        "POST",
        f"{_INTERACTION}/api/v1/insights/",
        json={"insider_id": owner, **body.model_dump()},
    )


# --- users (local) ---


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user",
)
async def delete_user(
    user_id: str,
    owner: str = Depends(get_api_key_owner),
    db: AsyncSession = Depends(get_db),
):
    # Self-service: a key may only delete its own owner's account.
    if user_id != owner:
        raise HTTPException(status_code=403, detail="Can only delete your own account")
    deleted = await user_service.delete_by_sub(db, sub=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
