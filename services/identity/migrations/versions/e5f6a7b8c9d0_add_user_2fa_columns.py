"""add 2fa recovery codes and enrolled_at to users

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-05-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # sa.JSON maps to JSONB on Postgres and JSON on SQLite, so the same
    # migration runs under both prod and the test fixture.
    op.add_column(
        "users",
        sa.Column("recovery_codes_hashed", sa.JSON(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("twofa_enrolled_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "twofa_enrolled_at")
    op.drop_column("users", "recovery_codes_hashed")
