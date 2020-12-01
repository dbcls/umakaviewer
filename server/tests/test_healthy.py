import pytest

from .fixtures import client


def test_healthy(client):
    with client:
        res = client.get('/api/v1/healthy')
        assert res.status_code == 200
        assert res.get_json() == {'ok': True}
