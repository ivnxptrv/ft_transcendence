"""Public API — a secured gateway over the database (subject IV.1, Major).

Every endpoint here is authenticated by an `X-API-Key` header and rate-limited
per key (see dependencies.get_api_key_owner). The actual data lives in peer
services, so identity forwards each call to the service that owns the resource:

    orders     → interaction
    matches    → interaction
    balance    → ledger
    account    → identity (local)

The key's owner (`sub`) is the caller's identity. Every resource is scoped to
that owner: orders are filtered by `client_id`, matches by `insider_id`,
account/balance by `sub`. No resource id appears in the URL — a key can only
list its own data, never enumerate another caller's.

5 endpoints: GET orders, GET matches, GET/DELETE account, GET balance.
"""
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_api_key_owner, get_db
from app.schemas.user import Role
from app.services import gateway, user_service

router = APIRouter()

_INTERACTION = settings.INTERACTION_URL
_LEDGER = settings.LEDGER_URL


# --- public response schemas ---
# Explicit allowlists: only these fields reach the public caller. The peer
# services return more (the caller's own client_id/insider_id/user_id, internal
# links like inquiry_id, sync flags like is_synced) — response_model drops every
# field not declared here on serialization.


class OrderOut(BaseModel):
    id: int
    title: str
    text: str
    status: str
    created_at: datetime


class MatchOut(BaseModel):
    id: int
    order_id: int
    score: float


class BalanceOut(BaseModel):
    balance: Decimal


class AccountOut(BaseModel):
    # No `id`: the caller's `sub` is the same value hidden as client_id/insider_id
    # elsewhere, and no public endpoint needs the caller to know its own id.
    email: str
    role: Role | None = None
    first_name: str
    last_name: str | None = None
    totp_enabled: bool = False


# Route order drives the /docs ordering: orders, matches, balance, then the
# account block last. GET and DELETE share the /account path, so Swagger groups
# them — keeping /account last puts the destructive delete at the very bottom.


# --- orders (→ interaction) ---


@router.get(
    "/orders",
    response_model=list[OrderOut],
    summary="List your orders (for client account)",
)
async def list_orders(
    owner: str = Depends(get_api_key_owner),
    limit: Annotated[int, Query(ge=1, le=20)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    # Scoped to the key owner: interaction filters by client_id, so a key only
    # ever sees its own orders.
    return await gateway.forward(
        "GET",
        f"{_INTERACTION}/api/v1/orders",
        params={"client_id": owner, "limit": limit, "offset": offset},
    )


# --- matches (→ interaction) ---


@router.get(
    "/matches",
    response_model=list[MatchOut],
    summary="List your matches (for insider account)",
)
async def list_matches(
    owner: str = Depends(get_api_key_owner),
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    # The key owner is an insider here: interaction filters by insider_id, so a
    # key only ever sees matches surfaced to that insider.
    return await gateway.forward(
        "GET",
        f"{_INTERACTION}/api/v1/matches",
        params={"insider_id": owner, "limit": limit, "offset": offset},
    )


# --- balance (→ ledger) ---


@router.get("/balance", response_model=BalanceOut, summary="Get your account balance")
async def get_balance(owner: str = Depends(get_api_key_owner)):
    return await gateway.forward("GET", f"{_LEDGER}/api/v1/balances/{owner}")


# --- account (local) ---
# No id in the URL: identity uses the owner resolved from the key. Kept last so
# the /account block — and its destructive DELETE — renders at the bottom.


@router.get(
    "/account",
    response_model=AccountOut,
    summary="Get your account info",
)
async def get_account(
    owner: str = Depends(get_api_key_owner),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_sub(db, sub=owner)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return AccountOut(
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
