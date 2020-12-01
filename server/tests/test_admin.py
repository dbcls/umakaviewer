from dbcls.models import DataSet
from .fixtures import (
    client, users, data_sets, authorized_john, user_roles, REQUEST_HEADERS,
    authorized_taro
)


class TestAdminDataSetList:
    def test_get(self, client, users, user_roles, data_sets, authorized_john):
        with client:
            res = client.get('/api/v1/admin/data_sets', headers=REQUEST_HEADERS)
            assert res.status_code == 200
            response_data = res.get_json()
            # 全部見えている
            assert response_data['count'] == DataSet.query.count()
            # 自分のDataSet以外も見えている
            assert response_data['count'] > DataSet.query.filter_by(user=authorized_john).count()


class TestHasNoAdminRole:
    def test_get_data_sets(self, client, users, user_roles, data_sets, authorized_taro):
        with client:
            res = client.get('/api/v1/admin/data_sets', headers=REQUEST_HEADERS)
            assert res.status_code == 404


class TestDataSetDetail:
    def test_delete(self, client, users, user_roles, data_sets, authorized_john):
        with client:
            previous_count = DataSet.query.count()
            data_set = (
                DataSet.query
                .filter(DataSet.user != authorized_john)
                .first()
            )
            res = client.delete(f'/api/v1/admin/data_sets/{data_set.id}', headers=REQUEST_HEADERS)
            assert res.status_code == 204
            assert DataSet.query.count() == previous_count - 1

    def test_not_found(self, client, users, user_roles, data_sets, authorized_john):
        with client:
            res = client.delete('/api/v1/admin/data_sets/0', headers=REQUEST_HEADERS)
            assert res.status_code == 404
            assert res.get_json() == {'message': 'not found'}
