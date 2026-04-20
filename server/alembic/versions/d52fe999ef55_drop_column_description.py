"""drop column description

Revision ID: d52fe999ef55
Revises: 602249b1997c
Create Date: 2026-04-08 15:29:19.778595

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import Column, String


# revision identifiers, used by Alembic.
revision: str = 'd52fe999ef55'
down_revision: Union[str, Sequence[str], None] = '602249b1997c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('cases', 'description')
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('cases', Column('description', String))
    pass
