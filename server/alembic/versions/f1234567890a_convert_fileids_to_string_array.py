"""convert fileIds to string array for R2 keys

Revision ID: f1234567890a
Revises: e602d7c5f25d
Create Date: 2026-05-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1234567890a'
down_revision: Union[str, Sequence[str], None] = 'e602d7c5f25d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - convert fileIds from UUID array to String array."""
    op.alter_column('steps', 'fileIds',
                    existing_type=sa.ARRAY(sa.UUID()),
                    type_=sa.ARRAY(sa.String()),
                    existing_nullable=True)


def downgrade() -> None:
    """Downgrade schema - convert fileIds from String array back to UUID array."""
    op.alter_column('steps', 'fileIds',
                    existing_type=sa.ARRAY(sa.String()),
                    type_=sa.ARRAY(sa.UUID()),
                    existing_nullable=True)
