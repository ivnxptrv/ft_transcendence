"""API key lifecycle — bootstrap surface for the public API.

These endpoints are authenticated with the normal user access token (JWT):
a logged-in user mints, lists, and revokes the keys they then use to call the
public API. The public API itself is authenticated by the key (X-API-Key),
not the JWT — see endpoints/public.py.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.api_key import ApiKeyCreate, ApiKeyIssued, ApiKeyOut
from app.services import apikey_service

router = APIRouter()


@router.post(
    "",
    response_model=ApiKeyIssued,
    status_code=status.HTTP_201_CREATED,
    summary="Issue a new API key (plaintext shown once)",
)
async def create_api_key(
    body: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row, plaintext = await apikey_service.create(
        db, owner_sub=current_user.sub, name=body.name
    )
    return ApiKeyIssued(key=plaintext, **ApiKeyOut.model_validate(row).model_dump())


@router.get(
    "",
    response_model=list[ApiKeyOut],
    summary="List my API keys (metadata only)",
)
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await apikey_service.list_for_owner(db, current_user.sub)


@router.delete(
    "/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke one of my API keys",
)
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await apikey_service.revoke(db, key_id=key_id, owner_sub=current_user.sub)
