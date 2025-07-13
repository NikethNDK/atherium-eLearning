"""three_add_values_to_content_type_enums

Revision ID: 736095d593f4
Revises: 2b3af57b5cc8
Create Date: 2025-07-08 16:38:59.895499

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '736095d593f4'
down_revision: Union[str, None] = '2b3af57b5cc8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE contenttype ADD VALUE IF NOT EXISTS 'TEXT'")
    op.execute("ALTER TYPE contenttype ADD VALUE IF NOT EXISTS 'PDF'")
    op.execute("ALTER TYPE contenttype ADD VALUE IF NOT EXISTS 'ASSESSMENT'")
    op.execute("ALTER TYPE contenttype ADD VALUE IF NOT EXISTS 'REFERENCE_LINK'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
