"""add active column to inquiries

Revision ID: a1c2e3f4a5b6
Revises: 3faac93f4f00
Create Date: 2026-06-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1c2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = '3faac93f4f00'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'inquiries',
        sa.Column('active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('inquiries', 'active')
