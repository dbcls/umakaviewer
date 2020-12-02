import json
from io import BytesIO
from pathlib import Path

from firebase_admin.auth import AuthError

from dbcls import redis_client
from dbcls.utils import localize_as_jst
from dbcls.models import User, DataSet, Tag
from dbcls.tasks import UmakaparserState
from .fixtures import (
    client, users, data_sets, authorized_john, taros_data_set, public_data_sets,
    ontology_path, sbm_path, task_properties_list
)


HEADERS = {'Authorization': 'Bearer dummy-token'}


class TestDataSetList:
    def test_get(self, client, users, data_sets, authorized_john):
        with client:
            res = client.get('/api/v1/data_sets', headers=HEADERS)
            assert res.status_code == 200
            expected_data = {
                'data': [
                    {
                        'id': d.id,
                        'title': d.title,
                        'path': d.path,
                        'upload_at': d.upload_at,
                        'is_public': d.is_public,
                    }
                    for d in DataSet.query.filter_by(user=authorized_john).order_by(DataSet.id.asc())
                ]
            }
            for d in expected_data['data']:
                d['upload_at'] = localize_as_jst(d['upload_at']).isoformat()
            assert res.get_json() == expected_data

    def test_post(self, client, users, data_sets, authorized_john):
        with client:
            johns_data_sets = DataSet.query.filter_by(user=authorized_john)
            before_count = johns_data_sets.count()
            json_file = json.dumps({
                'meta_data': {
                    'properties': 11,
                    'triples': 22,
                    'classes': 33,
                    'endpoint': 'https://~',
                    'crawl_date': '2019/08/20 15:44:00'
                }
            }).encode()
            data = {'file': (BytesIO(json_file), 'test.json')}
            res = client.post(
                '/api/v1/data_sets',
                data=data,
                headers=HEADERS,
                content_type='multipart/form-data'
            )
            assert res.status_code == 201
            response_data = res.get_json()
            assert response_data['title'] == 'test'
            assert response_data['is_public'] is False
            assert johns_data_sets.count() == before_count + 1

    def test_post_not_ok(self, client, users, data_sets, authorized_john):
        with client:
            # JSONじゃない
            data = {'file': (BytesIO(b'hoge'), 'test.json')}
            res = client.post(
                '/api/v1/data_sets',
                data=data,
                headers=HEADERS,
                content_type='multipart/form-data'
            )
            assert res.status_code == 400

            # meta_dataがない
            json_file = json.dumps({
                'properties': 11,
                'triples': 22,
                'classes': 33,
                'endpoint': 'https://~',
                'crawl_date': '2019/08/20 15:44:00'
            }).encode()
            data = {'file': (BytesIO(json_file), 'test.json')}
            res = client.post(
                '/api/v1/data_sets',
                data=data,
                headers=HEADERS,
                content_type='multipart/form-data'
            )
            assert res.status_code == 400
            assert res.get_json() == {'message': 'meta_data does not exist'}

            # meta_dataが不正
            json_file = json.dumps({
                'meta_data': {
                    'properties': 11,
                    'triples': 22,
                    'classes': '33',
                    'endpoint': 'https://~',
                    'crawl_date': '2019/08/20 15:44:00'
                }
            }).encode()
            data = {'file': (BytesIO(json_file), 'test.json')}
            res = client.post(
                '/api/v1/data_sets',
                data=data,
                headers=HEADERS,
                content_type='multipart/form-data'
            )
            assert res.status_code == 400
            assert res.get_json() == {'message': 'classes is invalid type'}


class TestDataSetDetail:
    def test_get(self, client, users, data_sets, authorized_john):
        """ 自分のDataSetを取得 """
        data_set = DataSet.query.filter_by(user=authorized_john).first()
        with client:
            res = client.get(f'/api/v1/data_sets/{data_set.id}', headers=HEADERS)
            assert res.status_code == 200
            assert res.get_json() == {
                'id': data_set.id,
                'title': data_set.title,
                'is_public': data_set.is_public,
                'tags': [{'id': t.id, 'name': t.name} for t in data_set.tags],
            }

    def test_cannot_get(self, client, users, data_sets, authorized_john, taros_data_set):
        """ 他人のDataSetを取得できない """
        with client:
            res = client.get(f'/api/v1/data_sets/{taros_data_set.id}', headers=HEADERS)
            assert res.status_code == 404
            assert res.get_json() == {'message': 'not found'}

    def test_delete(self, client, users, data_sets, authorized_john):
        """ 自分のDataSetを削除 """
        johns_data_sets = DataSet.query.filter_by(user=authorized_john)
        data_set = johns_data_sets.first()
        with client:
            before_count = johns_data_sets.count()
            res = client.delete(f'/api/v1/data_sets/{data_set.id}', headers=HEADERS)
            assert res.status_code == 204
            assert johns_data_sets.count() == before_count - 1

    def test_cannot_delete(self, client, users, data_sets, authorized_john, taros_data_set):
        """ 他人のDataSetを削除できない """
        with client:
            before_count = DataSet.query.count()
            res = client.delete(f'/api/v1/data_sets/{taros_data_set.id}', headers=HEADERS)
            assert res.status_code == 404
            assert DataSet.query.count() == before_count

    def test_update(self, client, users, data_sets, authorized_john):
        """ 自分のDataSetを更新 """
        data_set = DataSet.query.filter_by(user=authorized_john).first()
        with client:
            before_is_public = data_set.is_public
            data = {
                'title': '食物繊維',
                'is_public': not before_is_public,
            }
            res = client.patch(f'/api/v1/data_sets/{data_set.id}', data=data, headers=HEADERS)
            assert res.status_code == 200
            assert res.get_json() == {
                'id': data_set.id,
                'title': '食物繊維',
                'is_public': not before_is_public,
                'tags': [{'id': t.id, 'name': t.name} for t in data_set.tags],
            }

            # タグを変更
            tag_query = Tag.query.filter(Tag.data_sets.contains(data_set))
            assert tag_query.count() == 0
            data = {
                'comma_separated_tag_name': 'おにぎり,ラーメン'
            }
            res = client.patch(f'/api/v1/data_sets/{data_set.id}', data=data, headers=HEADERS)
            assert res.status_code == 200
            assert tag_query.count() == 2
            for tag in tag_query.all():
                assert data_set.id in [d.id for d in tag.data_sets]

    def test_cannot_update(self, client, users, data_sets, authorized_john, taros_data_set):
        with client:
            data = {
                'title': '食物繊維',
                'is_public': True,
            }
            res = client.patch(f'/api/v1/data_sets/{taros_data_set.id}', data=data, headers=HEADERS)
            assert res.status_code == 404


class TestVisualize:
    def test_ok(self, client, users, data_sets):
        with client:
            data_set = DataSet.query.first()
            res = client.get(f'/api/v1/visualize/{data_set.path}')
            assert res.status_code == 200
            assert res.get_json() == {
                'id': data_set.id,
                'title': data_set.title,
                'content': data_set.content,
            }

    def test_not_found(self, client, users, data_sets):
        with client:
            res = client.get('/api/v1/visualize/path_not_found')
            assert res.status_code == 404
            assert res.get_json() == {'message': 'not found'}


class TestPublic:
    def test_default(self, client, users, public_data_sets):
        with client:
            res = client.get('/api/v1/public_data_sets')
            assert res.status_code == 200
            response_data = res.get_json()
            assert response_data['count'] == 30
            assert response_data['previous'] is None
            assert response_data['next'] == '/api/v1/public_data_sets?size=4&page=2&sort=1'
            assert len(response_data['data']) == 4
            previous_classes = 0
            for i, d in enumerate(response_data['data']):
                if i > 0:
                    assert previous_classes >= d['meta_data']['classes']
                previous_classes = d['meta_data']['classes']

            # 最後のページ
            res = client.get('/api/v1/public_data_sets?page=8')
            assert res.status_code == 200
            response_data = res.get_json()
            assert len(response_data['data']) == 2
            assert response_data['next'] is None

    def test_sort(self, client, users, public_data_sets):
        with client:
            # sort by classes asc
            res = client.get('/api/v1/public_data_sets?sort=2')
            assert res.status_code == 200
            response_data = res.get_json()
            assert len(response_data['data']) == 4
            previous_classes = 0
            for i, d in enumerate(response_data['data']):
                if i > 0:
                    assert previous_classes <= d['meta_data']['classes']
                previous_classes = d['meta_data']['classes']

            # sort by properties desc
            res = client.get('/api/v1/public_data_sets?sort=3')
            assert res.status_code == 200
            response_data = res.get_json()
            assert len(response_data['data']) == 4
            previous_properties = 0
            for i, d in enumerate(response_data['data']):
                if i > 0:
                    assert previous_properties >= d['meta_data']['properties']
                previous_properties = d['meta_data']['properties']

            # sort by properties asc
            res = client.get('/api/v1/public_data_sets?sort=4')
            assert res.status_code == 200
            response_data = res.get_json()
            assert len(response_data['data']) == 4
            previous_properties = 0
            for i, d in enumerate(response_data['data']):
                if i > 0:
                    assert previous_properties <= d['meta_data']['properties']
                previous_properties = d['meta_data']['properties']

    def test_size(self, client, users, public_data_sets):
        with client:
            res = client.get('/api/v1/public_data_sets?size=50')
            assert res.status_code == 200
            response_data = res.get_json()
            assert len(response_data['data']) == 30
            assert response_data['previous'] is None
            assert response_data['next'] is None

    def test_search(self, client, users, public_data_sets):
        with client:
            # タイトルで絞り込み
            res = client.get('/api/v1/public_data_sets?search=タイトル13')
            assert res.status_code == 200
            response_data = res.get_json()
            assert len(response_data['data']) == 1

            # タグで絞り込み
            res = client.get('/api/v1/public_data_sets?search=タグ2x')
            assert res.status_code == 200
            response_data = res.get_json()
            assert response_data['count'] == 14

            res = client.get('/api/v1/public_data_sets?search=タグ3x')
            assert res.status_code == 200
            response_data = res.get_json()
            assert response_data['count'] == 9

            # タイトルとタグが同じ
            res = client.get('/api/v1/public_data_sets?search=タイトル24')
            assert res.status_code == 200
            response_data = res.get_json()
            assert response_data['count'] == 1


class TestDataSetGenerator:
    def test_post(self, client, users, data_sets, authorized_john, ontology_path, sbm_path, mocker):
        mocker.patch('dbcls.api.resources.data_set.Process')

        with client:
            johns_data_set_query = DataSet.query.filter_by(user=authorized_john)
            previous_count = johns_data_set_query.count()

            data = {
                'ontology': (BytesIO(Path(ontology_path).read_bytes()), 'ontology.ttl'),
                'sbm': (BytesIO(Path(sbm_path).read_bytes()), 'sbm.ttl'),
            }
            res = client.post(
                '/api/v1/data_sets/generate',
                data=data,
                headers=HEADERS,
                content_type='multipart/form-data'
            )
            assert res.status_code == 201
            data = res.get_json()
            assert 'task_id' in data
            task_properties = json.loads(redis_client.get(data['task_id']))
            assert task_properties['state'] == UmakaparserState.PENDING.value


class TestDataSetGenerateProcessStatus:
    def test_task_success(self, client, users, data_sets, authorized_john, task_properties_list):
        with client:
            task_id = 'task_id_success'
            assert redis_client.get(task_id) is not None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 200
            expected_data_set = data_sets[-1]
            assert res.get_json() == {
                'id': expected_data_set.id,
                'title': expected_data_set.title,
                'path': expected_data_set.path,
                'upload_at': localize_as_jst(expected_data_set.upload_at).isoformat(),
                'is_public': expected_data_set.is_public,
            }
            assert redis_client.get(task_id) is None

    def test_task_started(self, client, users, data_sets, authorized_john, task_properties_list, mocker):
        process_mock = mocker.Mock()
        process_mock.returncode = 0
        mocker.patch('dbcls.api.resources.data_set.subprocess.run').return_value = process_mock

        with client:
            task_id = 'task_id_started'
            assert redis_client.get(task_id) is not None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 204
            assert redis_client.get(task_id) is not None

    def test_task_unknown_error(self, client, users, data_sets, authorized_john, task_properties_list, mocker):
        process_mock = mocker.Mock()
        process_mock.returncode = 1
        mocker.patch('dbcls.api.resources.data_set.subprocess.run').return_value = process_mock

        with client:
            task_id = 'task_id_started'
            assert redis_client.get(task_id) is not None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 400
            assert res.get_json() == {'message': 'raised unknown error'}
            assert redis_client.get(task_id) is None

    def test_task_pending(self, client, users, data_sets, authorized_john, task_properties_list):
        with client:
            task_id = 'task_id_pending'
            assert redis_client.get(task_id) is not None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 202
            assert redis_client.get(task_id) is not None

    def test_task_failure(self, client, users, data_sets, authorized_john, task_properties_list):
        with client:
            task_id = 'task_id_failure'
            assert redis_client.get(task_id) is not None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 400
            assert res.get_json() == {'message': 'file is invalid'}
            assert redis_client.get(task_id) is None

    def test_task_not_found(self, client, users, data_sets, authorized_john):
        with client:
            task_id = 'task_id_dummy'
            assert redis_client.get(task_id) is None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 404
            assert res.get_json() == {'message': 'task not found'}
            assert redis_client.get(task_id) is None

    def test_task_taro_success(self, client, users, data_sets, authorized_john, task_properties_list):
        with client:
            task_id = 'task_id_taro_success'
            assert redis_client.get(task_id) is not None
            res = client.get(f'/api/v1/data_sets/generate/{task_id}', headers=HEADERS)
            assert res.status_code == 404
            assert res.get_json() == {'message': 'task not found'}
            assert redis_client.get(task_id) is not None
