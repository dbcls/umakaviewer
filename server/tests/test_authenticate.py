import json

from firebase_admin.auth import AuthError

from dbcls.models import User
from .fixtures import client, users


class TestAuthenticate:
    def test_auth_ok(self, client, users, mocker):
        decoded_token_mock = {'uid': 'dummy_firebase_uid1'}
        mocker.patch('firebase_admin.auth.verify_id_token').return_value = decoded_token_mock
        custom_token_mock = mocker.Mock()
        custom_token_mock.decode.return_value = 'dummy_custom_token'
        mocker.patch('firebase_admin.auth.create_custom_token').return_value = custom_token_mock

        with client:
            data = json.dumps({'token': 'dummy_id_token'})
            res = client.post('/api/v1/auth', data=data, content_type='application/json')
            assert res.status_code == 200
            assert res.get_json() == {
                'custom_token': custom_token_mock.decode(),
                'display_name': 'John Doe',
                'contact_uri': '',
                'roles': [],
            }

    def test_invalid_id_token(self, client, users, mocker):
        get_user_mock = mocker.patch('firebase_admin.auth.verify_id_token')
        get_user_mock.side_effect = AuthError(222, 'id token is invalid')

        with client:
            data = json.dumps({'token': 'dummy_id_token'})
            res = client.post('/api/v1/auth', data=data, content_type='application/json')
            assert res.status_code == 400
            assert res.get_json() == {'message': 'id token is invalid'}

    def test_user_not_found(self, client, users, mocker):
        decoded_token_mock = {'uid': 'dummy_firebase_uid9999'}
        mocker.patch('firebase_admin.auth.verify_id_token').return_value = decoded_token_mock

        with client:
            data = json.dumps({'token': 'dummy_id_token'})
            res = client.post('/api/v1/auth', data=data, content_type='application/json')
            assert res.status_code == 400
            assert res.get_json() == {'message': 'user not found. You have to sign up.'}
