from typing import Literal, Optional

from pydantic import BaseModel


# Full role set. `admin` is an operator role, mutually exclusive with the
# marketplace roles (a user is one of these, never client-and-admin).
Role = Literal["client", "insider", "admin"]

# Roles a user may assign to themselves at signup / OAuth onboarding. `admin` is
# intentionally excluded: it is granted only by another admin or the boot seed,
# never self-served — that is the privilege boundary.
SignupRole = Literal["client", "insider"]


class UserBase(BaseModel):
    email: Optional[str] = None


class UserCreate(UserBase):
    email: str
    password: str
    role: SignupRole
    # first_name is required; last_name is optional.
    first_name: str
    last_name: Optional[str] = None


class SetPasswordIn(BaseModel):
    password: str


class SetRoleIn(BaseModel):
    role: SignupRole


class UserRead(UserBase):
    id: int
    sub: str
    role: Role
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Admin (advanced permissions, subject IV.2) ---


class AdminUserCreate(BaseModel):
    # Admin-provisioned account. Unlike self-signup, the admin may set any role
    # (including admin). Validated like a normal signup (email/password rules).
    email: str
    password: str
    role: Role
    first_name: str
    last_name: Optional[str] = None


class AdminUpdateIn(BaseModel):
    # Admin edit of a user's profile. Name only; role is changed via the separate
    # /role endpoint (it has a data-stranding guard), email is left immutable.
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class AdminSetRoleIn(BaseModel):
    role: Role


class AdminUserOut(BaseModel):
    """Admin view of any user. `id` is the stable external `sub`; the
    autoincrement PK never leaves the service."""
    id: str
    email: str
    role: Optional[Role] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    totp_enabled: bool = False
    has_password: bool = False


class UserOut(BaseModel):
    """Public user view (matches the contract `User` schema).

    `id` is the stable external identifier (UUID), exposed as `User.sub` —
    the autoincrement PK never leaves the service.
    """
    id: str
    email: str
    # None until the user picks one (OAuth accounts before onboarding).
    role: Optional[Role] = None
    # first_name is required; last_name is optional.
    first_name: str
    last_name: Optional[str] = None
    totp_enabled: bool = False
    # False for OAuth-only accounts (no password set) — drives the web
    # "set password" affordance.
    has_password: bool = False
