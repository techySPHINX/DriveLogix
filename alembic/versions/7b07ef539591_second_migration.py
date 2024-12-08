"""second  migration

Revision ID: 7b07ef539591
Revises: 3c6dddab1496
Create Date: 2024-12-05 16:37:22.381774

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision: str = '7b07ef539591'
down_revision: Union[str, None] = '3c6dddab1496'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define the ENUM type for trip status
trip_status_enum = sa.Enum('PENDING', 'ASSIGNED', 'IN_ROUTE',
                           'COMPLETED', 'CANCELED', name='tripstatus', create_type=False)


def upgrade() -> None:
    conn = op.get_bind()

    # Check if the ENUM type 'tripstatus' exists, and create it if not
    result = conn.execute(
        text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tripstatus');")
    )
    enum_exists = result.scalar()

    if not enum_exists:
        # Create the ENUM type for trip status
        trip_status_enum.create(conn)

    # Create the vehicles table
    op.create_table(
        'vehicles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_number', sa.String(length=50), nullable=False),
        sa.Column('total_tonnage', sa.Float(), nullable=False),
        sa.Column('remaining_tonnage', sa.Float(), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ['driver_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('vehicle_number'),
    )
    op.create_index(op.f('ix_vehicles_driver_id'),
                    'vehicles', ['driver_id'], unique=False)
    op.create_index(op.f('ix_vehicles_id'), 'vehicles', ['id'], unique=False)

    # Create the trips table with the 'status' column as ENUM 'tripstatus'
    op.create_table(
        'trips',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('admin_id', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('destination', sa.String(length=100), nullable=False),
        sa.Column('expected_arrival', sa.DateTime(), nullable=True),
        sa.Column('next_halt', sa.String(), nullable=True),
        sa.Column('safety_info', sa.String(), nullable=True),
        sa.Column('tonnage', sa.Float(), nullable=False),
        sa.Column('upvotes', sa.Integer(), nullable=True),
        sa.Column('downvotes', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ['admin_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(
            ['driver_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(
            ['vehicle_id'], ['vehicles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_trips_admin_id'), 'trips',
                    ['admin_id'], unique=False)
    op.create_index(op.f('ix_trips_driver_id'), 'trips',
                    ['driver_id'], unique=False)
    op.create_index(op.f('ix_trips_id'), 'trips', ['id'], unique=False)
    op.create_index(op.f('ix_trips_vehicle_id'), 'trips',
                    ['vehicle_id'], unique=False)
    
    op.add_column('trips', sa.Column('status', trip_status_enum,
                  nullable=False, server_default='PENDING'))

    # Create the delay_reports table
    op.create_table(
        'delay_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('trip_id', sa.Integer(), nullable=True),
        sa.Column('reason', sa.String(length=255), nullable=False),
        sa.Column('custom_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ['driver_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_delay_reports_driver_id'),
                    'delay_reports', ['driver_id'], unique=False)
    op.create_index(op.f('ix_delay_reports_id'),
                    'delay_reports', ['id'], unique=False)
    op.create_index(op.f('ix_delay_reports_trip_id'),
                    'delay_reports', ['trip_id'], unique=False)

    # Create the intermediate_destinations table
    op.create_table(
        'intermediate_destinations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('trip_id', sa.Integer(), nullable=True),
        sa.Column('destination', sa.String(length=100), nullable=False),
        sa.Column('sequence', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_intermediate_destinations_id'),
                    'intermediate_destinations', ['id'], unique=False)
    op.create_index(op.f('ix_intermediate_destinations_trip_id'),
                    'intermediate_destinations', ['trip_id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()

    # Drop the tables in reverse order
    op.drop_index(op.f('ix_intermediate_destinations_trip_id'),
                  table_name='intermediate_destinations')
    op.drop_index(op.f('ix_intermediate_destinations_id'),
                  table_name='intermediate_destinations')
    op.drop_table('intermediate_destinations')
    op.drop_index(op.f('ix_delay_reports_trip_id'), table_name='delay_reports')
    op.drop_index(op.f('ix_delay_reports_id'), table_name='delay_reports')
    op.drop_index(op.f('ix_delay_reports_driver_id'),
                  table_name='delay_reports')
    op.drop_table('delay_reports')
    op.drop_index(op.f('ix_trips_vehicle_id'), table_name='trips')
    op.drop_index(op.f('ix_trips_id'), table_name='trips')
    op.drop_index(op.f('ix_trips_driver_id'), table_name='trips')
    op.drop_index(op.f('ix_trips_admin_id'), table_name='trips')
    op.drop_table('trips')
    op.drop_index(op.f('ix_vehicles_id'), table_name='vehicles')
    op.drop_index(op.f('ix_vehicles_driver_id'), table_name='vehicles')
    op.drop_table('vehicles')

    # Check if the ENUM type 'tripstatus' exists, and drop it if it does
    result = conn.execute(
        text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tripstatus');")
    )
    enum_exists = result.scalar()

    if enum_exists:
        trip_status_enum.drop(conn)
