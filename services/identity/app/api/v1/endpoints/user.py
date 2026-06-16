from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_db, get_owned_user
from app.models.user import User
from app.services import token_service, user_service

router = APIRouter()


@router.post(
    "",
    response_model=schemas.TokenPair,
    status_code=status.HTTP_201_CREATED,
    operation_id="registerUser",
    summary="Register a new user",
)
async def register_user(
    user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)
):
    user = await user_service.register_user(db, user_in)
    return await token_service.mint_for_user(db, user)


@router.get(
    "/{user_id}",
    response_model=schemas.UserOut,
    operation_id="getUser",
    summary="Get a user by id (own account only)",
)
async def get_user(user: User = Depends(get_owned_user)):
    # get_owned_user enforces user_id == token.sub. Map User.sub → contract
    # `id` (UUID); the internal autoincrement PK never leaves the service.
    return schemas.UserOut(
        id=user.sub,
        email=user.email,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        totp_enabled=user.twofa_secret is not None,
        has_password=user.password is not None,
    )


@router.put(
    "/{user_id}/password",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="setPassword",
    summary="Set a password on a password-less (OAuth) account",
)
async def set_password(
    body: schemas.SetPasswordIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_owned_user),
):
    await user_service.set_password(db, user=user, password=body.password)
    return None


@router.put(
    "/{user_id}/role",
    response_model=schemas.TokenPair,
    operation_id="setRole",
    summary="Set the role on a role-less (OAuth) account; returns a fresh token pair",
)
async def set_role(
    body: schemas.SetRoleIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_owned_user),
):
    # Re-mint so the new token carries the role claim (the onboarding token had
    # none). The web BFF swaps the cookies with the returned pair.
    await user_service.set_role(db, user=user, role=body.role)
    return await token_service.mint_for_user(db, user)
