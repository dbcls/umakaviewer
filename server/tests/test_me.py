import json

from firebase_admin.auth import AuthError

from dbcls.models import User, DataSet, UserRoleTypes
from .fixtures import client, users, data_sets, authorized_john, user_roles


HEADERS = {'Authorization': 'Bearer dummy-token'}


class TestMe:
    def test_get(self, client, users, user_roles, data_sets, authorized_john):
        with client:
            res = client.get('/api/v1/me', headers=HEADERS)
            assert res.status_code == 200
            assert res.get_json() == {
                'display_name': 'John Doe',
                'contact_uri': '',
                'roles': [UserRoleTypes.ADMIN.value],
            }

    def test_patch(self, client, users, user_roles, data_sets, authorized_john):
        with client:
            previous_display_name = authorized_john.display_name
            previous_contact_uri = authorized_john.contact_uri

            # 最大文字数を超えて変更
            data = json.dumps({'display_name': 'Jack' * 20, 'contact_uri': '12345' * 100})
            res = client.patch('/api/v1/me', data=data, headers=HEADERS, content_type='application/json')

            json_data = json.loads(data)
            assert res.status_code == 200
            assert res.get_json() == {
                'display_name': json_data['display_name'][:30],
                'contact_uri': json_data['contact_uri'][:255],
                'roles': [UserRoleTypes.ADMIN.value],
            }
            user = User.query.get(authorized_john.id)
            assert user.display_name != previous_display_name
            assert user.contact_uri != previous_contact_uri

            # 空文字にする
            previous_display_name = user.display_name
            previous_contact_uri = user.contact_uri
            data = json.dumps({'display_name': '', 'contact_uri': ''})
            res = client.patch('/api/v1/me', data=data, headers=HEADERS, content_type='application/json')

            assert res.status_code == 200
            assert res.get_json() == {
                'display_name': '',
                'contact_uri': '',
                'roles': [UserRoleTypes.ADMIN.value],
            }
            user = User.query.get(authorized_john.id)
            assert user.display_name != previous_display_name
            assert user.contact_uri != previous_contact_uri

    def test_patch_no_change(self, client, users, data_sets, authorized_john):
        with client:
            previous_display_name = authorized_john.display_name
            previous_contact_uri = authorized_john.contact_uri

            # 何も変更しない
            data = json.dumps({})
            res = client.patch('/api/v1/me', data=data, headers=HEADERS, content_type='application/json')

            json_data = json.loads(data)
            assert res.status_code == 200
            assert res.get_json() == {
                'display_name': previous_display_name,
                'contact_uri': previous_contact_uri,
                'roles': [],
            }
            user = User.query.get(authorized_john.id)
            assert user.display_name == previous_display_name
            assert user.contact_uri == previous_contact_uri

    def test_delete(self, client, users, data_sets, authorized_john):
        with client:
            # アカウント削除前
            previous_user_count = User.query.count()
            johns_data_set_query = DataSet.query.filter_by(user=authorized_john)
            assert johns_data_set_query.count() > 0
            res = client.get('/api/v1/me', headers=HEADERS)
            assert res.status_code == 200

            res = client.delete('/api/v1/me', headers=HEADERS)
            assert res.status_code == 204
            assert User.query.count() == previous_user_count - 1
            assert johns_data_set_query.count() == 0

            # 削除したので自分の情報は見れない
            res = client.get('/api/v1/me', headers=HEADERS)
            assert res.status_code == 401


class TestMyCustomToken:
    def test_get(self, client, users, data_sets, authorized_john, mocker):
        mocker.patch('firebase_admin.auth.get_user')
        custom_token_mock = mocker.Mock()
        custom_token_mock.decode.return_value = 'dummy_my_custom_token'
        mocker.patch('firebase_admin.auth.create_custom_token').return_value = custom_token_mock

        with client:
            res = client.get('/api/v1/me/custom_token', headers=HEADERS)
            assert res.status_code == 200
            assert res.get_json() == {'custom_token': 'dummy_my_custom_token'}

    def test_get_error(self, client, users, data_sets, authorized_john, mocker):
        get_user_mock = mocker.patch('firebase_admin.auth.get_user')
        get_user_mock.side_effect = AuthError(111, 'user not found on firebase')
        with client:
            res = client.get('/api/v1/me/custom_token', headers=HEADERS)
            assert res.status_code == 400
            assert res.get_json() == {'message': 'user not found on firebase'}

        get_user_mock.side_effect = ValueError('firebase uid is invalid')
        with client:
            res = client.get('/api/v1/me/custom_token', headers=HEADERS)
            assert res.status_code == 400
            assert res.get_json() == {'message': 'firebase uid is invalid'}
