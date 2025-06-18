"""Add course related tables

Revision ID: 0e920d29ace1
Revises: 6cdb23141464
Create Date: 2025-06-18 23:37:35.479709

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e920d29ace1'
down_revision: Union[str, None] = '6cdb23141464'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
