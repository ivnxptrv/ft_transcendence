from datetime import datetime

from pydantic import BaseModel, Field, model_validator


# Fields accepted by API
class OrderCreate(BaseModel):
    client_id: str
    title: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


# Fields returned by API
class OrderRead(BaseModel):
    id: int
    title: str
    text: str
    client_id: str
    inquiry_id: int | None = None
    status: str
    created_at: datetime

    # For returning ORM objects:
    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    title: str | None = None
    text: str | None = None

    @model_validator(mode="before")
    @classmethod
    def reject_null_fields(cls, data):
        if isinstance(data, dict):
            for field in ("title", "text"):
                if field in data and data[field] is None:
                    raise ValueError(f"{field} cannot be null")
        return data
