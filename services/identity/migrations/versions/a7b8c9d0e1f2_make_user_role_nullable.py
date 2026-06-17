"""make users.role nullable (OAuth signups choose role post-login)

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-06-16 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # A freshly provisioned OAuth user has no role until they pick one in the
    # onboarding step, so role is now nullable (null = not yet chosen).
    op.alter_column("users", "role", existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.execute("UPDATE users SET role = 'client' WHERE role IS NULL")
    op.alter_column("users", "role", existing_type=sa.String(), nullable=False)
