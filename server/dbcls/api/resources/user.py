from flask import g
from flask_restful import Resource, abort, reqparse
from firebase_admin import auth as firebase_auth

from dbcls import db


parser = reqparse.RequestParser()
parser.add_argument('display_name', type=str, required=False, nullable=False)
parser.add_argument('contact_uri', type=str, required=False, nullable=False)


class Me(Resource):
    def get(self):
        return {
            'display_name': g.user.display_name,
            'contact_uri': g.user.contact_uri,
            'roles': [role.role_type for role in g.user.user_roles],
        }

    def patch(self):
        args = parser.parse_args()
        if 'display_name' in args and args['display_name'] is not None:
            g.user.display_name = args['display_name'][:30]
        if 'contact_uri' in args and args['contact_uri'] is not None:
            g.user.contact_uri = args['contact_uri'][:255]
        db.session.add(g.user)
        db.session.commit()
        return {
            'display_name': g.user.display_name,
            'contact_uri': g.user.contact_uri,
            'roles': [role.role_type for role in g.user.user_roles],
        }

    def delete(self):
        db.session.delete(g.user)
        db.session.commit()
        return '', 204


class MyCustomToken(Resource):
    def get(self):
        try:
            firebase_auth.get_user(g.user.firebase_uid)
        except (ValueError, firebase_auth.AuthError) as e:
            return {'message': f'{e}'}, 400

        custom_token = firebase_auth.create_custom_token(g.user.firebase_uid)
        return {'custom_token': custom_token.decode()}
