"""add sub, first_name, last_name to users

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-19 21:00:00.000000

"""
import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("sub", sa.String(), nullable=True))
    op.add_column("users", sa.Column("first_name", sa.String(), nullable=True))
    op.add_column("users", sa.Column("last_name", sa.String(), nullable=True))

    # Backfill sub for any existing rows so the NOT NULL + UNIQUE constraints
    # apply cleanly. Done in Python to stay portable across dialects (no
    # dependency on pgcrypto's gen_random_uuid()).
    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id FROM users WHERE sub IS NULL")).fetchall()
    for row in rows:
        bind.execute(
            sa.text("UPDATE users SET sub = :s WHERE id = :id"),
            {"s": str(uuid.uuid4()), "id": row[0]},
        )

    op.alter_column("users", "sub", nullable=False)
    op.create_index("ix_users_sub_unique", "users", ["sub"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_sub_unique", table_name="users")
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")
    op.drop_column("users", "sub")
