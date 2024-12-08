"""Third Migration

Revision ID: fed54c5ee8f1
Revises: 7b07ef539591
Create Date: 2024-12-08 13:11:36.888202

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fed54c5ee8f1'
down_revision: Union[str, None] = '7b07ef539591'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
