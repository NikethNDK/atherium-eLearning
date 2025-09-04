"""Create withdrawal requests and bank details tables

Revision ID: withdrawal_requests_001
Revises: 634151053176
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'withdrawal_requests_001'
down_revision = '634151053176'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create withdrawal_requests table
    op.create_table('withdrawal_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('instructor_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', name='withdrawalstatus'), nullable=False),
        sa.Column('admin_feedback', sa.Text(), nullable=True),
        sa.Column('admin_id', sa.Integer(), nullable=True),
        sa.Column('requested_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['instructor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_withdrawal_requests_id'), 'withdrawal_requests', ['id'], unique=False)

    # Create bank_details table
    op.create_table('bank_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('instructor_id', sa.Integer(), nullable=False),
        sa.Column('account_holder_name', sa.String(length=255), nullable=False),
        sa.Column('account_number', sa.String(length=50), nullable=False),
        sa.Column('ifsc_code', sa.String(length=20), nullable=False),
        sa.Column('branch_name', sa.String(length=255), nullable=False),
        sa.Column('bank_name', sa.String(length=255), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['instructor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_details_id'), 'bank_details', ['id'], unique=False)


def downgrade() -> None:
    # Drop tables
    op.drop_index(op.f('ix_bank_details_id'), table_name='bank_details')
    op.drop_table('bank_details')
    op.drop_index(op.f('ix_withdrawal_requests_id'), table_name='withdrawal_requests')
    op.drop_table('withdrawal_requests')
    
    # Drop enum
    op.execute('DROP TYPE IF EXISTS withdrawalstatus')
