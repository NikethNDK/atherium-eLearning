"""Merge three migration branches

Revision ID: 950e0d7853c1
Revises: admin_bank_withdrawal_001, lesson_comments_migration, withdrawal_requests_001
Create Date: 2025-09-08 14:48:17.702294

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '950e0d7853c1'
down_revision: Union[str, None] = ('admin_bank_withdrawal_001', 'lesson_comments_migration', 'withdrawal_requests_001')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
