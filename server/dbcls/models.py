from enum import Enum
import json
import codecs
import datetime
import os
from flask import url_for
from sqlalchemy.orm import deferred
from sqlalchemy.schema import FetchedValue
from dbcls import app, db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(30), default='', nullable=False)
    contact_uri = db.Column(db.String(255), default='', nullable=False)

    def __repr__(self):
        return f'<User id={self.id} firebase_uid={self.firebase_uid}>'


user_role_association_table = db.Table(
    'user_role_association',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('user_role_id', db.Integer, db.ForeignKey('user_roles.id')),
    db.UniqueConstraint('user_id', 'user_role_id', name='uniq_user_role_assoc')
)


class UserRoleTypes(Enum):
    ADMIN = 1


class UserRole(db.Model):
    __tablename__ = 'user_roles'

    id = db.Column(db.Integer, primary_key=True)
    role_type = db.Column(db.SmallInteger, unique=True, nullable=False)

    users = db.relationship(
        'User',
        secondary=user_role_association_table,
        backref=db.backref('user_roles', lazy='select'),
        lazy='select'
    )


tag_association_table = db.Table(
    'data_set_tag_association',
    db.Column('data_set_id', db.Integer, db.ForeignKey('data_sets.id')),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id')),
    db.UniqueConstraint('data_set_id', 'tag_id', name='uniq_tag_assoc')
)


class DataSet(db.Model):
    __tablename__ = 'data_sets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(32), default='', nullable=False)
    path = db.Column(db.String(255), unique=True, nullable=False)
    content = deferred(db.Column(db.JSON))
    upload_at = db.Column(db.DateTime, nullable=False)
    is_public = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship('User', backref=db.backref('data_sets', cascade='all,delete'), enable_typechecks=False)
    tags = db.relationship(
        'Tag',
        secondary=tag_association_table,
        backref=db.backref('data_sets', lazy='select'),
        lazy='select'
    )

    # jsonのデータでindexを作るためのVirtualカラム
    meta_data_classes = db.Column(db.Integer, server_default=FetchedValue())
    meta_data_properties = db.Column(db.Integer, server_default=FetchedValue())

    __table_args__ = (
        db.Index('public_upload_idx', 'is_public', 'upload_at'),
        db.Index('search_upload_idx', 'is_public', 'title', 'upload_at'),
        db.Index('public_classes_idx', 'is_public', 'meta_data_classes'),
        db.Index('search_classes_idx', 'is_public', 'title', 'meta_data_classes'),
        db.Index('public_properties_idx', 'is_public', 'meta_data_properties'),
        db.Index('search_properties_idx', 'is_public', 'title', 'meta_data_properties'),
    )

    @classmethod
    def create(cls, user, file):
        # base64url 192bit
        path = codecs.encode(os.urandom(24), 'base64').decode()
        path = path.translate(path.maketrans('+/', '-_', '\n'))
        title, ext = os.path.splitext(file.filename)
        content = json.load(file.stream)
        upload_at = datetime.datetime.utcnow()

        return cls(user=user, title=title[:32], path=path, content=content, upload_at=upload_at)

    @property
    def visualization_url(self):
        return url_for('visualization', data_set_path=self.path, _external=True, _scheme='https')

    def __repr__(self):
        return f'<DataSet id={self.id} title={self.title} path={self.path}>'


class Tag(db.Model):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)

    def __repr__(self):
        return f'<Tag id={self.id} name={self.name}>'
