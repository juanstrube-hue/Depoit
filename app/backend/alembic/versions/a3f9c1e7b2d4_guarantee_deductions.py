"""guarantee_deductions module

Revision ID: a3f9c1e7b2d4
Revises: 5a15cdbed18b
Create Date: 2026-06-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3f9c1e7b2d4'
down_revision: Union[str, Sequence[str], None] = '5a15cdbed18b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'guarantee_deductions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('contract_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('requested_amount', sa.Integer(), nullable=False),
        sa.Column('agreed_amount', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_guarantee_deductions_id', 'guarantee_deductions', ['id'])
    op.create_index('ix_guarantee_deductions_contract_id', 'guarantee_deductions', ['contract_id'])
    op.create_index('ix_guarantee_deductions_status', 'guarantee_deductions', ['status'])
    op.create_index('ix_guarantee_deductions_created_by', 'guarantee_deductions', ['created_by'])

    op.create_table(
        'guarantee_deduction_files',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('deduction_id', sa.Integer(), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['deduction_id'], ['guarantee_deductions.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_guarantee_deduction_files_id', 'guarantee_deduction_files', ['id'])
    op.create_index('ix_guarantee_deduction_files_deduction_id', 'guarantee_deduction_files', ['deduction_id'])

    op.create_table(
        'guarantee_deduction_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('deduction_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('previous_amount', sa.Integer(), nullable=True),
        sa.Column('proposed_amount', sa.Integer(), nullable=True),
        sa.Column('comment', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['deduction_id'], ['guarantee_deductions.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_guarantee_deduction_events_id', 'guarantee_deduction_events', ['id'])
    op.create_index('ix_guarantee_deduction_events_deduction_id', 'guarantee_deduction_events', ['deduction_id'])


def downgrade() -> None:
    op.drop_index('ix_guarantee_deduction_events_deduction_id', table_name='guarantee_deduction_events')
    op.drop_index('ix_guarantee_deduction_events_id', table_name='guarantee_deduction_events')
    op.drop_table('guarantee_deduction_events')

    op.drop_index('ix_guarantee_deduction_files_deduction_id', table_name='guarantee_deduction_files')
    op.drop_index('ix_guarantee_deduction_files_id', table_name='guarantee_deduction_files')
    op.drop_table('guarantee_deduction_files')

    op.drop_index('ix_guarantee_deductions_created_by', table_name='guarantee_deductions')
    op.drop_index('ix_guarantee_deductions_status', table_name='guarantee_deductions')
    op.drop_index('ix_guarantee_deductions_contract_id', table_name='guarantee_deductions')
    op.drop_index('ix_guarantee_deductions_id', table_name='guarantee_deductions')
    op.drop_table('guarantee_deductions')
