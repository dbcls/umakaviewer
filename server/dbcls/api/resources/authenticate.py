from flask_restful import Resource, reqparse
from firebase_admin import auth as firebase_auth

from dbcls.models import User


parser = reqparse.RequestParser()
parser.add_argument('token', type=str, required=True, nullable=False)


class Authenticate(Resource):
    def post(self):
        try:
            args = parser.parse_args()
            decoded_token = firebase_auth.verify_id_token(args['token'])
        except (ValueError, firebase_auth.AuthError) as e:
            return {'message': f'{e}'}, 400

        firebase_uid = decoded_token['uid']
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return {'message': 'user not found. You have to sign up.'}, 400

        custom_token = firebase_auth.create_custom_token(firebase_uid)
        return {
            'custom_token': custom_token.decode(),
            'display_name': user.display_name,
            'contact_uri': user.contact_uri,
            'roles': [role.role_type for role in user.user_roles],
        }
