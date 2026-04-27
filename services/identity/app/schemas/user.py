from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    email: Optional[str] = None


class UserCreate(UserBase):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserRead(UserBase):
    id: int
    sub: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True
