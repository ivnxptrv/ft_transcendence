from pydantic import BaseModel, EmailStr
from typing import Optional


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str


# Properties to return via API
class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True
