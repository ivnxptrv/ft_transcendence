"""add role to users

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-27 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(), nullable=True))

    # Backfill existing rows so we can flip to NOT NULL without breaking
    # historical signups (which had no role).
    op.execute("UPDATE users SET role = 'client' WHERE role IS NULL")

    op.alter_column("users", "role", nullable=False)


def downgrade() -> None:
    op.drop_column("users", "role")
