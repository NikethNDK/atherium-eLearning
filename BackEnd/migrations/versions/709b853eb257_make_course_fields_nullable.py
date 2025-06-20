"""Make course fields nullable

Revision ID: 709b853eb257
Revises: dfb5a0dc5824
Create Date: 2025-06-19 23:07:55.236302

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '709b853eb257'
down_revision: Union[str, None] = 'dfb5a0dc5824'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
