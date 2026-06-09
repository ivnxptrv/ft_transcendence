"""Public API — a secured gateway over the database (subject IV.1, Major).

Every endpoint here is authenticated by an `X-API-Key` header and rate-limited
per key (see dependencies.get_api_key_owner). The actual data lives in peer
services, so identity forwards each call to the service that owns the resource:

    orders     → interaction
    inquiries  → semantic
    users      → identity (local)

≥5 endpoints across all four verbs: GET, POST, PUT, DELETE.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config import settings
from app.dependencies import get_api_key_owner, get_db
from app.services import gateway, user_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

_INTERACTION = settings.INTERACTION_URL
_SEMANTIC = settings.SEMANTIC_URL


# --- request bodies (validated here, identity-side, before forwarding) ---


class OrderCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    text: str = Field(min_length=1)


class OrderReplaceIn(BaseModel):
    # PUT = full replace, so both fields are required.
    title: str = Field(min_length=1, max_length=120)
    text: str = Field(min_length=1)


class InquiryCreateIn(BaseModel):
    inquiry_text: str = Field(min_length=1)
    uid: str = Field(min_length=1)
    order_id: str = Field(min_length=1)


# --- orders (→ interaction) ---


@router.get("/orders/{order_id}", summary="Get one order")
async def get_order(order_id: int, owner: str = Depends(get_api_key_owner)):
    return await gateway.forward("GET", f"{_INTERACTION}/api/v1/orders/{order_id}")


@router.post("/orders", status_code=status.HTTP_201_CREATED, summary="Create an order")
async def create_order(
    body: OrderCreateIn, owner: str = Depends(get_api_key_owner)
):
    return await gateway.forward(
        "POST", f"{_INTERACTION}/api/v1/orders/", json=body.model_dump()
    )


@router.put("/orders/{order_id}", summary="Replace an order")
async def replace_order(
    order_id: int, body: OrderReplaceIn, owner: str = Depends(get_api_key_owner)
):
    # interaction exposes update as PATCH; a full-body PUT maps cleanly onto it.
    return await gateway.forward(
        "PATCH", f"{_INTERACTION}/api/v1/orders/{order_id}", json=body.model_dump()
    )


# --- inquiries (→ semantic) ---


@router.post(
    "/inquiries",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit an inquiry for matching",
)
async def create_inquiry(
    body: InquiryCreateIn, owner: str = Depends(get_api_key_owner)
):
    # semantic mounts inquiries at the host root, not under /api/v1.
    return await gateway.forward(
        "POST", f"{_SEMANTIC}/inquiries", json=body.model_dump()
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
    # Self-service: a key can only delete its own owner's account.
    if user_id != owner:
        raise HTTPException(
            status_code=403, detail="Can only delete your own account"
        )
    deleted = await user_service.delete_by_sub(db, sub=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
