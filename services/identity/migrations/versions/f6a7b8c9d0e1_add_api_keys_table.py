"""add api_keys table for the public API

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-06-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "api_keys",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("owner_sub", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("key_hash", sa.String(), nullable=False),
        sa.Column("prefix", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_api_keys_key_hash_unique", "api_keys", ["key_hash"], unique=True
    )
    op.create_index("ix_api_keys_owner_sub", "api_keys", ["owner_sub"])


def downgrade() -> None:
    op.drop_index("ix_api_keys_owner_sub", table_name="api_keys")
    op.drop_index("ix_api_keys_key_hash_unique", table_name="api_keys")
    op.drop_table("api_keys")
