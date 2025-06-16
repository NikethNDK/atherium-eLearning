"""Change phone_number to BIGINT

Revision ID: 6cdb23141464
Revises: c874cee95495
Create Date: 2025-06-11 00:43:10.374901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6cdb23141464'
down_revision: Union[str, None] = 'c874cee95495'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
   op.alter_column('users', 'phone_number', existing_type=sa.INTEGER(), type_=sa.BIGINT(), existing_nullable=True) 


def downgrade() -> None:
    op.alter_column('users', 'phone_number', existing_type=sa.BIGINT(), type_=sa.INTEGER(), existing_nullable=True)
