from typing import Literal, Optional

from pydantic import BaseModel


Role = Literal["client", "insider"]


class UserBase(BaseModel):
    email: Optional[str] = None


class UserCreate(UserBase):
    email: str
    password: str
    role: Role
    # first_name is required; last_name is optional.
    first_name: str
    last_name: Optional[str] = None


class SetPasswordIn(BaseModel):
    password: str


class SetRoleIn(BaseModel):
    role: Role


class UserRead(UserBase):
    id: int
    sub: str
    role: Role
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True


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
