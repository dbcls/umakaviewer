from flask_restful import Resource, reqparse
from firebase_admin import auth as firebase_auth

from dbcls import db
from dbcls.models import User


parser = reqparse.RequestParser()
parser.add_argument('firebase_uid', type=str, required=True, nullable=False)
parser.add_argument('display_name', type=str, required=True, nullable=False)


class SignUp(Resource):
    def post(self):
        # firebaseに登録されているか
        args = parser.parse_args()
        firebase_uid = args['firebase_uid']
        try:
            firebase_auth.get_user(firebase_uid)
        except (ValueError, firebase_auth.AuthError) as e:
            return {'message': f'{e}'}, 400

        # DBにUserが保存されているか
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if user:
            return {'message': f'already exists'}, 400

        display_name = args.get('display_name', '')
        user = User(firebase_uid=firebase_uid, display_name=display_name)
        db.session.add(user)
        db.session.commit()

        custom_token = firebase_auth.create_custom_token(firebase_uid)
        return {'custom_token': custom_token.decode()}, 201
