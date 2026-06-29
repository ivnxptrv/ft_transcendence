"""Admin user management — advanced permissions system (subject IV.2, Major).

Every endpoint is gated by `require_admin`: the caller must have the admin role
(checked against the DB, not the token claim). Internal (Bearer-authed, not in
the public schema) — the web admin console calls these with the admin's token.

    GET    /admin/users            list all users (paginated)
    GET    /admin/users/{sub}      one user
    POST   /admin/users            create a user (any role)
    PUT    /admin/users/{sub}      edit a user's profile (name)
    PUT    /admin/users/{sub}/role assign a role
    DELETE /admin/users/{sub}      delete a user

An admin cannot change their own role or delete their own account — either would
let the last admin lock the system out of itself. The role-change data-stranding
guard (a client with orders, an insider with a legend) is enforced by the web
BFF, which owns the reads into interaction and semantic.
"""
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_db, require_admin
from app.models.user import User
from app.services import user_service

router = APIRouter()


def _to_out(user: User) -> schemas.AdminUserOut:
    return schemas.AdminUserOut(
        id=user.sub,
        email=user.email,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        totp_enabled=user.twofa_secret is not None,
        has_password=user.password is not None,
    )


@router.get("/users", response_model=list[schemas.AdminUserOut])
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    users = await user_service.list_users(db, limit=limit, offset=offset)
    return [_to_out(u) for u in users]


@router.post(
    "/users",
    response_model=schemas.AdminUserOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    body: schemas.AdminUserCreate = Body(...),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.admin_create_user(
        db,
        email=body.email,
        password=body.password,
        role=body.role,
        first_name=body.first_name,
        last_name=body.last_name,
    )
    return _to_out(user)


@router.get("/users/{sub}", response_model=schemas.AdminUserOut)
async def get_user(
    sub: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_sub(db, sub=sub)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_out(user)


@router.put("/users/{sub}", response_model=schemas.AdminUserOut)
async def update_user(
    sub: str,
    body: schemas.AdminUpdateIn = Body(...),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_sub(db, sub=sub)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await user_service.admin_update_user(
        db, user=user, first_name=body.first_name, last_name=body.last_name
    )
    return _to_out(user)


@router.put("/users/{sub}/role", response_model=schemas.AdminUserOut)
async def set_user_role(
    sub: str,
    body: schemas.AdminSetRoleIn = Body(...),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if sub == admin.sub and body.role != "admin":
        raise HTTPException(
            status_code=400, detail="Admins cannot change their own role"
        )
    user = await user_service.get_by_sub(db, sub=sub)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await user_service.admin_set_role(db, user=user, role=body.role)
    return _to_out(user)


@router.delete("/users/{sub}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    sub: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if sub == admin.sub:
        raise HTTPException(
            status_code=400, detail="Admins cannot delete their own account"
        )
    # Removes the auth record only. The user's `sub` is referenced by peer
    # services (interaction/semantic/ledger); that data is left in place —
    # cross-service cascade is out of scope here.
    deleted = await user_service.delete_by_sub(db, sub=sub)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return None
