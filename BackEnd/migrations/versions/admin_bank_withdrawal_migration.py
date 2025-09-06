"""Add admin bank details and withdrawal tables

Revision ID: admin_bank_withdrawal_001
Revises: 
Create Date: 2025-01-04 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'admin_bank_withdrawal_001'
down_revision = None  # Update this to the latest revision
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create admin_bank_details table
    op.create_table('admin_bank_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('account_holder_name', sa.String(length=255), nullable=False),
        sa.Column('account_number', sa.String(length=20), nullable=False),
        sa.Column('ifsc_code', sa.String(length=11), nullable=False),
        sa.Column('branch_name', sa.String(length=255), nullable=False),
        sa.Column('bank_name', sa.String(length=255), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_bank_details_id'), 'admin_bank_details', ['id'], unique=False)

    # Create admin_withdrawal_requests table
    op.create_table('admin_withdrawal_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', name='withdrawalstatus'), nullable=False),
        sa.Column('bank_details_id', sa.Integer(), nullable=False),
        sa.Column('requested_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['bank_details_id'], ['admin_bank_details.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_withdrawal_requests_id'), 'admin_withdrawal_requests', ['id'], unique=False)


def downgrade() -> None:
    # Drop admin_withdrawal_requests table
    op.drop_index(op.f('ix_admin_withdrawal_requests_id'), table_name='admin_withdrawal_requests')
    op.drop_table('admin_withdrawal_requests')
    
    # Drop admin_bank_details table
    op.drop_index(op.f('ix_admin_bank_details_id'), table_name='admin_bank_details')
    op.drop_table('admin_bank_details')
