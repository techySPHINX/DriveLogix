"""First migration

Revision ID: 3c6dddab1496
Revises: 
Create Date: 2024-12-05 14:18:57.565620
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import enum
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = '3c6dddab1496'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define the ENUM type
user_role_enum = sa.Enum('DRIVER', 'ADMIN', name='userrole', create_type=False)


def upgrade() -> None:
    conn = op.get_bind()

    # Check if the ENUM type exists, if not create it
    result = conn.execute(
        text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole');")
    )
    enum_exists = result.scalar()

    if not enum_exists:
        # Create the ENUM type
        user_role_enum.create(conn)

    # Create the users table first
    op.create_table('users',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=100), nullable=False),
                    sa.Column('email', sa.String(length=100), nullable=False),
                    sa.Column('phone_number', sa.String(
                        length=15), nullable=True),
                    sa.Column('password', sa.String(
                        length=128), nullable=False),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('phone_number')
                    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Add the 'role' column to the users table after the table is created
    op.add_column('users', sa.Column('role', user_role_enum,
                  nullable=False, server_default='DRIVER'))

    # Create other tables
    op.create_table('geofences',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('latitude', sa.Float(), nullable=False),
                    sa.Column('longitude', sa.Float(), nullable=False),
                    sa.Column('radius', sa.Float(), nullable=False),
                    sa.Column('time_limit_minutes',
                              sa.Integer(), nullable=False),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_geofences_id'), 'geofences', ['id'], unique=False)

    op.create_table('driver_locations',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('driver_id', sa.Integer(), nullable=True),
                    sa.Column('latitude', sa.Float(), nullable=False),
                    sa.Column('longitude', sa.Float(), nullable=False),
                    sa.Column('timestamp', sa.DateTime(), nullable=True),
                    sa.ForeignKeyConstraint(
                        ['driver_id'], ['users.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_driver_locations_driver_id'),
                    'driver_locations', ['driver_id'], unique=False)
    op.create_index(op.f('ix_driver_locations_id'),
                    'driver_locations', ['id'], unique=False)

    op.create_table('notifications',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('driver_id', sa.Integer(), nullable=True),
                    sa.Column('message', sa.String(
                        length=255), nullable=False),
                    sa.Column('timestamp', sa.DateTime(), nullable=True),
                    sa.Column('is_read', sa.Boolean(), nullable=True),
                    sa.Column('admin_id', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(
                        ['admin_id'], ['users.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(
                        ['driver_id'], ['users.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_notifications_admin_id'),
                    'notifications', ['admin_id'], unique=False)
    op.create_index(op.f('ix_notifications_driver_id'),
                    'notifications', ['driver_id'], unique=False)
    op.create_index(op.f('ix_notifications_id'),
                    'notifications', ['id'], unique=False)

    # Create other tables as you already have them...


def downgrade() -> None:
    # Drop the column and tables in reverse order
    op.drop_column('users', 'role')

    # Drop the ENUM type only if it exists
    conn = op.get_bind()
    result = conn.execute(
        text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole');")
    )
    enum_exists = result.scalar()

    if enum_exists:
        user_role_enum.drop(conn)

    # Drop tables and indices in reverse order...
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
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_driver_id'),
                  table_name='notifications')
    op.drop_index(op.f('ix_notifications_admin_id'),
                  table_name='notifications')
    op.drop_table('notifications')
    op.drop_index(op.f('ix_driver_locations_id'),
                  table_name='driver_locations')
    op.drop_index(op.f('ix_driver_locations_driver_id'),
                  table_name='driver_locations')
    op.drop_table('driver_locations')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_geofences_id'), table_name='geofences')
    op.drop_table('geofences')

    # ### end Alembic commands ###
