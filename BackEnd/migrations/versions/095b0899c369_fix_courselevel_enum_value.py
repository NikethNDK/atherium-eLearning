"""Fix CourseLevel enum value

Revision ID: 095b0899c369
Revises: 02112667813b
Create Date: 2025-06-19 19:18:39.233823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '095b0899c369'
down_revision: Union[str, None] = '02112667813b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


new_courselevel = sa.Enum(
    "Beginner", "Intermediate", "Expert", "All Levels",
    name="courselevel_new"
)

# Step 2: Define old wrong enum name
old_enum_name = "courselevel"


def upgrade():
    # Create new enum type
    new_courselevel.create(op.get_bind(), checkfirst=True)

    # Alter the column to use new enum
    op.execute("ALTER TABLE courses ALTER COLUMN level TYPE courselevel_new USING level::text::courselevel_new")

    # Drop the old enum
    op.execute("DROP TYPE courselevel")

    # Rename the new enum to the old name
    op.execute("ALTER TYPE courselevel_new RENAME TO courselevel")


def downgrade():
    # If downgrading, you must reverse these steps
    # Add downgrade logic if needed
    pass