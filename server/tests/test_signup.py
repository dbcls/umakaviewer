import json

from firebase_admin.auth import AuthError

from dbcls.models import User
from .fixtures import client, users


class TestSignUp:
    def test_signup_ok(self, client, users, mocker):
        mocker.patch('firebase_admin.auth.get_user')
        custom_token_mock = mocker.Mock()
        custom_token_mock.decode.return_value = 'dummy_custom_token'
        mocker.patch('firebase_admin.auth.create_custom_token').return_value = custom_token_mock

        with client:
            before_count = User.query.count()
            data = json.dumps({
                'firebase_uid': 'aabbccdd',
                'display_name': 'タピ岡',
            })
            res = client.post('/api/v1/signup', data=data, content_type='application/json')
            assert res.status_code == 201
            assert res.get_json() == {'custom_token': custom_token_mock.decode()}
            assert User.query.count() == before_count + 1

    def test_signup_not_found_on_firebase(self, client, mocker):
        get_user_mock = mocker.patch('firebase_admin.auth.get_user')
        get_user_mock.side_effect = AuthError(111, 'user not found on firebase')

        with client:
            data = json.dumps({
                'firebase_uid': 'aabbccdd',
                'display_name': 'タピ岡',
            })
            res = client.post('/api/v1/signup', data=data, content_type='application/json')
            assert res.status_code == 400
            assert res.get_json() == {'message': 'user not found on firebase'}

    def test_signup_already_exist(self, client, users, mocker):
        mocker.patch('firebase_admin.auth.get_user')

        with client:
            user = User.query.first()
            data = json.dumps({
                'firebase_uid': user.firebase_uid,
                'display_name': 'タピ岡',
            })
            res = client.post('/api/v1/signup', data=data, content_type='application/json')
            assert res.status_code == 400
            assert res.get_json() == {'message': 'already exists'}
