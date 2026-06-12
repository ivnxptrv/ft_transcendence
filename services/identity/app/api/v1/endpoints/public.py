"""Public API — a secured gateway over the database (subject IV.1, Major).

Every endpoint here is authenticated by an `X-API-Key` header and rate-limited
per key (see dependencies.get_api_key_owner). The actual data lives in peer
services, so identity forwards each call to the service that owns the resource:

    orders     → interaction
    purchases  → ledger
    account    → identity (local)

The key's owner (`sub`) is the caller's identity. Self resources (account,
purchases) carry no id in the URL — the caller can't know its own `sub`, so
identity uses the owner resolved from the key. Order ids are real resource ids
the caller learns from the create response, so those stay in the path.

5 endpoints: POST/GET orders, GET/DELETE account, GET purchases.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.config import settings
from app.dependencies import get_api_key_owner, get_db
from app.services import gateway, user_service

router = APIRouter()

_INTERACTION = settings.INTERACTION_URL
_LEDGER = settings.LEDGER_URL


# --- request bodies (validated identity-side before forwarding) ---
# The caller never sends its own id: identity stamps the key owner onto writes.


class OrderCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    text: str = Field(min_length=1)


# --- orders (→ interaction) ---


@router.post("/orders", status_code=status.HTTP_201_CREATED, summary="Create an order")
async def create_order(body: OrderCreateIn, owner: str = Depends(get_api_key_owner)):
    return await gateway.forward(
        "POST",
        f"{_INTERACTION}/api/v1/orders/",
        json={"client_id": owner, **body.model_dump()},
    )


@router.get("/orders/{order_id}", summary="Get one of your orders")
async def get_order(order_id: int, owner: str = Depends(get_api_key_owner)):
    # Scoped to the key owner: interaction filters by client_id, so a key can
    # only read its own orders (no enumerating other clients' integer ids).
    return await gateway.forward(
        "GET",
        f"{_INTERACTION}/api/v1/orders/{order_id}",
        params={"client_id": owner},
    )


# --- account (local) ---
# No id in the URL: identity uses the owner resolved from the key.


@router.get(
    "/account",
    response_model=schemas.UserOut,
    summary="Get your account info",
)
async def get_account(
    owner: str = Depends(get_api_key_owner),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_sub(db, sub=owner)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut(
        id=user.sub,
        email=user.email,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        totp_enabled=user.twofa_secret is not None,
    )


@router.delete(
    "/account",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete your account",
)
async def delete_account(
    owner: str = Depends(get_api_key_owner),
    db: AsyncSession = Depends(get_db),
):
    deleted = await user_service.delete_by_sub(db, sub=owner)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")


# --- purchases (→ ledger) ---


@router.get("/purchases", summary="List your purchases")
async def get_purchases(owner: str = Depends(get_api_key_owner)):
    return await gateway.forward("GET", f"{_LEDGER}/api/v1/purchases/{owner}")
