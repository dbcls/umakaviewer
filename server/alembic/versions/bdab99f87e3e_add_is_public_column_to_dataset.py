"""Add is_public column to DataSet

Revision ID: bdab99f87e3e
Revises: a310b12dbee7
Create Date: 2019-07-29 12:10:29.239228

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bdab99f87e3e'
down_revision = 'a310b12dbee7'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('data_sets', sa.Column('is_public', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('data_sets', 'is_public')
    # ### end Alembic commands ###
