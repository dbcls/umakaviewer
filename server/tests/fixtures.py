from datetime import datetime, timedelta
import json
from random import randint
from pathlib import Path
import tempfile

import pytest

from dbcls import app, db, redis_client
from dbcls.models import User, DataSet, Tag, UserRole, UserRoleTypes
from dbcls.tasks import UmakaparserState


@pytest.fixture
def client(mocker):
    mocker.patch('firebase_admin.initialize_app')

    yield app.test_client()

    for d in DataSet.query.all():
        db.session.delete(d)
    for t in Tag.query.all():
        db.session.delete(t)
    for u in User.query.all():
        db.session.delete(u)
    for r in UserRole.query.all():
        db.session.delete(r)
    db.session.commit()

    redis_client.flushdb()


@pytest.fixture
def users():
    user_attrs = [
        {'firebase_uid': 'dummy_firebase_uid1', 'display_name': 'John Doe'},
        {'firebase_uid': 'dummy_firebase_uid2', 'display_name': '糖質太郎'},
        {'firebase_uid': 'dummy_firebase_uid3', 'display_name': '管理者'},
    ]
    created_users = []
    for attrs in user_attrs:
        user = User(**attrs)
        db.session.add(user)
        created_users.append(user)
    db.session.commit()
    return created_users


@pytest.fixture
def user_roles(users):
    roles = []
    for role_type in UserRoleTypes:
        role = UserRole(role_type=role_type.value)
        db.session.add(role)
        roles.append(role)
    # 管理者に追加
    roles[0].users.append(users[0])
    roles[0].users.append(users[2])
    db.session.commit()
    return roles


@pytest.fixture
def data_sets(users):
    content = {
        'meta_data': {
            'properties': 30,
            'triples': 5142698,
            'classes': 13147,
            'endpoint': 'http://navi.first.lifesciencedb.jp/fanavi/sparql',
            'crawl_date': '2015/12/31 14:18:17'
        }
    }
    now = datetime.utcnow()

    john = users[0]
    taro = users[1]
    data_sets_attributes = [
        {'title': 'タンパク質', 'user': john},
        {'title': '炭水化物', 'user': john},
        {'title': 'ミネラル', 'user': taro},
        {'title': 'ビタミン', 'user': taro},
        {'title': '脂質', 'user': john},
    ]
    created_data_sets = []
    for idx, attributes in enumerate(data_sets_attributes):
        data_set = DataSet(path=f'path{idx}', content=content, upload_at=now + timedelta(seconds=idx), **attributes)
        db.session.add(data_set)
        created_data_sets.append(data_set)
    db.session.commit()
    return created_data_sets


@pytest.fixture
def authorized_john(users, mocker):
    user = users[0]
    decoded_token_mock = {'uid': user.firebase_uid}
    mocker.patch('firebase_admin.auth.verify_id_token').return_value = decoded_token_mock
    return user


@pytest.fixture
def authorized_taro(users, mocker):
    user = users[1]
    decoded_token_mock = {'uid': user.firebase_uid}
    mocker.patch('firebase_admin.auth.verify_id_token').return_value = decoded_token_mock
    return user


@pytest.fixture
def taros_data_set(users):
    user = users[1]
    return DataSet.query.filter_by(user=user).first()


@pytest.fixture
def public_data_sets(users):
    tag2x = Tag(name='タグ2x')
    tag3x = Tag(name='タグ3x')
    tag_title24 = Tag(name='タイトル24')
    db.session.add(tag2x)
    db.session.add(tag3x)
    db.session.add(tag_title24)

    now = datetime.utcnow()
    john = users[0]
    for i in range(30):
        content = {
            'meta_data': {
                'properties': randint(1, 100),
                'triples': randint(5000000, 6000000),
                'classes': randint(10000, 20000),
                'endpoint': 'http://navi.first.lifesciencedb.jp/fanavi/sparql',
                'crawl_date': '2015/12/31 14:18:17'
            }
        }
        data_set = DataSet(
            path=f'path{i}', content=content, upload_at=now + timedelta(seconds=i),
            title=f'タイトル{i}', user=john, is_public=True
        )
        db.session.add(data_set)
        # タグ設定
        if i > 0 and i % 2 == 0:
            tag2x.data_sets.append(data_set)
        if i > 0 and i % 3 == 0:
            tag3x.data_sets.append(data_set)
        if i == 24:
            tag_title24.data_sets.append(data_set)
    db.session.commit()


def ttl_path(filename):
    origin = Path(Path(__file__).parent, filename)
    _, temp_ttl = tempfile.mkstemp(suffix=origin.suffix)
    with open(temp_ttl, 'w') as f_out, open(origin, 'r') as f_in:
        f_out.write(f_in.read())
    yield temp_ttl
    path = Path(temp_ttl)
    if path.exists():
        path.unlink()


@pytest.fixture
def ontology_path():
    yield from ttl_path('ontology.ttl')


@pytest.fixture
def sbm_path():
    yield from ttl_path('sbm.ttl')


@pytest.fixture
def task_properties_list(users, data_sets):
    redis_client.set('task_id_pending', json.dumps({
        'state': UmakaparserState.PENDING.value,
        'user': users[0].id,
    }))
    redis_client.set('task_id_failure', json.dumps({
        'state': UmakaparserState.FAILURE.value,
        'user': users[0].id,
        'message': 'file is invalid',
    }))
    redis_client.set('task_id_taro_success', json.dumps({
        'state': UmakaparserState.SUCCESS.value,
        'user': users[1].id,
        'pid': 99999999,
        'data_set_id': data_sets[2].id
    }))
    redis_client.set('task_id_started', json.dumps({
        'state': UmakaparserState.STARTED.value,
        'user': users[0].id,
        'pid': 99999999,
    }))
    redis_client.set('task_id_success', json.dumps({
        'state': UmakaparserState.SUCCESS.value,
        'user': users[0].id,
        'pid': 99999999,
        'data_set_id': data_sets[-1].id
    }))


REQUEST_HEADERS = {'Authorization': 'Bearer dummy-token'}
