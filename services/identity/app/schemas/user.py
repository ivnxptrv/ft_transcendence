from typing import Literal, Optional

from pydantic import BaseModel


Role = Literal["client", "insider"]


class UserBase(BaseModel):
    email: Optional[str] = None


class UserCreate(UserBase):
    email: str
    password: str
    role: Role
    first_name: Optional[str] = None
    last_name: Optional[str] = None


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
    role: Role
    first_name: Optional[str] = None
    last_name: Optional[str] = None
