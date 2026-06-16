"""Google OAuth provisioning — internal, service-to-service.

Web runs the browser-facing OAuth flow (it holds the Google credentials and is
the only externally reachable service), then POSTs the verified profile here.
This endpoint provisions/links the account and returns the same JWT pair as the
password grant.
"""
from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_db
from app.services import token_service, user_service

router = APIRouter()


@router.post(
    "/google",
    response_model=schemas.TokenPair,
    operation_id="googleAuth",
    summary="Provision/link a Google-authenticated user and issue tokens",
)
async def google_auth(
    body: schemas.GoogleAuthIn = Body(...), db: AsyncSession = Depends(get_db)
):
    user = await user_service.upsert_google_user(
        db,
        google_id=body.google_id,
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
    )
    return await token_service.mint_for_user(db, user)
