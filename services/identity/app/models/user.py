import uuid
from typing import Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _new_sub() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Stable external identifier placed in JWT `sub` claim. Decoupled from the
    # autoincrement PK so we can export user references without leaking row
    # counts or enabling enumeration.
    sub: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False, default=_new_sub
    )
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    twofa_secret: Mapped[Optional[str]] = mapped_column(String, nullable=True)
