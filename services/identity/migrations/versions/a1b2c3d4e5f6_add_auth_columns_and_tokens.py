"""add auth columns to users and tokens table

Revision ID: a1b2c3d4e5f6
Revises: 93221fa5a287
Create Date: 2026-04-19 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "93221fa5a287"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users: password (hash), google_id, twofa_secret
    op.add_column("users", sa.Column("password", sa.String(), nullable=True))
    op.add_column("users", sa.Column("google_id", sa.String(), nullable=True))
    op.add_column("users", sa.Column("twofa_secret", sa.String(), nullable=True))
    op.create_index(
        "ix_users_google_id_unique", "users", ["google_id"], unique=True
    )

    # tokens: refresh-token ledger (revocable, rotatable)
    op.create_table(
        "tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("jti", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tokens_jti_unique", "tokens", ["jti"], unique=True)
    op.create_index(
        "ix_tokens_user_revoked", "tokens", ["user_id", "revoked_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_tokens_user_revoked", table_name="tokens")
    op.drop_index("ix_tokens_jti_unique", table_name="tokens")
    op.drop_table("tokens")
    op.drop_index("ix_users_google_id_unique", table_name="users")
    op.drop_column("users", "twofa_secret")
    op.drop_column("users", "google_id")
    op.drop_column("users", "password")
