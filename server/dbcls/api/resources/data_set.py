from enum import Enum
import json
import urllib.parse
import subprocess
import shutil
import tempfile
from multiprocessing import Process
from pathlib import Path
from uuid import uuid4

from flask import g, request
from flask_restful import Resource, reqparse
from firebase_admin import auth as firebase_auth
from sqlalchemy import func, or_
from werkzeug.datastructures import FileStorage

from dbcls import db, app, redis_client
from dbcls.constants import TASK_PROPERTIES_EXPIRE
from dbcls.utils import localize_as_jst
from dbcls.models import DataSet, Tag
from dbcls.tasks import generate_by_umakaparser, UmakaparserState


parser = reqparse.RequestParser()
parser.add_argument('file', type=FileStorage, required=True, nullable=False, location='files')


META_DATA_ATTRIBUTES = {
    'properties': int,
    'triples': int,
    'classes': int,
    'endpoint': str,
    'crawl_date': str,
}


class DataSetList(Resource):
    def _to_json(self, data_set):
        return {
            'id': data_set.id,
            'title': data_set.title,
            'path': data_set.path,
            'upload_at': localize_as_jst(data_set.upload_at).isoformat(),
            'is_public': data_set.is_public,
        }

    def _validate_file(self):
        args = parser.parse_args()
        data_set_file = args['file']

        # jsonファイルであることを確認
        try:
            content = json.load(data_set_file.stream)
            data_set_file.stream.seek(0)
        except (UnicodeDecodeError, json.decoder.JSONDecodeError) as e:
            return {'ok': False, 'message': f'{e}'}

        # meta_dataがあるのを確認
        if 'meta_data' not in content:
            return {'ok': False, 'message': 'meta_data does not exist'}

        # meta_dataに必要なデータを確認
        meta_data = content['meta_data']
        for key, meta_type in META_DATA_ATTRIBUTES.items():
            if key not in meta_data:
                return {'ok': False, 'message': f'{key} does not exist'}
            if not isinstance(meta_data[key], meta_type):
                return {'ok': False, 'message': f'{key} is invalid type'}

        return {'ok': True}

    def get(self):
        data_sets = [
            self._to_json(d)
            for d in DataSet.query.filter_by(user_id=g.user.id).all()
        ]
        return {'data': data_sets}

    def post(self):
        result = self._validate_file()
        if not result['ok']:
            return {'message': f'{result["message"]}'}, 400

        args = parser.parse_args()
        data_set_file = args['file']
        data_set = DataSet.create(g.user, data_set_file)
        db.session.add(data_set)
        db.session.commit()
        return self._to_json(data_set), 201


generator_parser = reqparse.RequestParser()
generator_parser.add_argument('ontology', type=FileStorage, required=False, nullable=True, location='files')
generator_parser.add_argument('sbm', type=FileStorage, required=True, nullable=False, location='files')


class DataSetGenerator(Resource):
    def post(self):
        args = generator_parser.parse_args()
        # それぞれ一時ファイルに保存
        file_types = ['sbm', 'ontology']
        temp_files = {
            file_type: tempfile.mkstemp(suffix=Path(args[file_type].filename).suffix)
            for file_type in file_types if args[file_type]
        }
        for file_type in temp_files:
            with open(temp_files[file_type][1], 'wb') as f:
                shutil.copyfileobj(args[file_type], f)
        # DataSet生成プロセス
        task_id = str(uuid4())
        pipe = redis_client.pipeline()
        pipe.set(task_id, json.dumps({'user': g.user.id, 'state': UmakaparserState.PENDING.value}))
        pipe.expire(task_id, TASK_PROPERTIES_EXPIRE)
        pipe.execute()
        # umakaparserを実行するプロセスではconnectionを持ち越せないので、2番目の方法を採用
        # https://docs.sqlalchemy.org/en/13/faq/connections.html#how-do-i-use-engines-connections-sessions-with-python-multiprocessing-or-os-fork
        db.session.close()
        db.engine.dispose()

        sbm_file = temp_files[file_types[0]][1]
        ontology_file = temp_files[file_types[1]][1] if file_types[1] in temp_files else None
        process = Process(
            target=generate_by_umakaparser,
            args=(g.user.id, sbm_file, ontology_file, task_id)
        )
        process.start()
        return {'task_id': task_id}, 201


class DataSetGenerateProcessStatus(Resource):
    def get(self, task_id):
        task_properties = redis_client.get(task_id)
        if not task_properties:
            return {'message': 'task not found'}, 404

        task_properties = json.loads(task_properties)
        if task_properties['user'] != g.user.id:
            return {'message': 'task not found'}, 404

        if task_properties['state'] == UmakaparserState.PENDING.value:
            return '', 202

        if task_properties['state'] == UmakaparserState.FAILURE.value:
            redis_client.delete(task_id)
            return {'message': task_properties['message']}, 400

        if task_properties['state'] == UmakaparserState.STARTED.value:
            # プロセスが終了していたらキャッチできなかったエラーで終了している
            pid = task_properties['pid']
            p = subprocess.run([f'ps -o command= {pid}'], stdout=subprocess.PIPE)
            if p.returncode != 0:
                redis_client.delete(task_id)
                return {'message': 'raised unknown error'}, 400
            return '', 204

        redis_client.delete(task_id)
        data_set = DataSet.query.get(task_properties['data_set_id'])
        return {
            'id': data_set.id,
            'title': data_set.title,
            'path': data_set.path,
            'upload_at': localize_as_jst(data_set.upload_at).isoformat(),
            'is_public': data_set.is_public,
        }, 200


class VisualizedDataSet(Resource):
    def get(self, path):
        data_set = DataSet.query.filter_by(path=path).first()
        if not data_set:
            return {'message': 'not found'}, 404

        return {
            'id': data_set.id,
            'title': data_set.title,
            'content': data_set.content
        }


update_parser = reqparse.RequestParser()
update_parser.add_argument('title', type=str, required=False, nullable=False)
update_parser.add_argument('is_public', type=bool, required=False, nullable=False)
update_parser.add_argument('comma_separated_tag_name', type=str, required=False, nullable=False)


class DataSetDetail(Resource):
    def _get_data_set(self, id):
        return DataSet.query.filter_by(user_id=g.user.id, id=id).first()

    def get(self, id):
        data_set = self._get_data_set(id)
        if not data_set:
            return {'message': 'not found'}, 404

        return {
            'id': data_set.id,
            'title': data_set.title,
            'is_public': data_set.is_public,
            'tags': [{'id': t.id, 'name': t.name} for t in data_set.tags],
        }

    def delete(self, id):
        data_set = self._get_data_set(id)
        if not data_set:
            return {'message': 'not found'}, 404

        db.session.delete(data_set)
        db.session.commit()
        return '', 204

    def patch(self, id):
        data_set = self._get_data_set(id)
        if not data_set:
            return {'message': 'not found'}, 404

        args = update_parser.parse_args()

        # タグ設定
        if args.get('comma_separated_tag_name') is not None:
            comma_separated_tag_name = args['comma_separated_tag_name']
            # 空白と重複を取り除く
            tag_names = set([
                t.strip()
                for t in comma_separated_tag_name.split(',')
                if t.strip() != ''
            ])
            # タグをすべて外さない場合はタグ名を確認
            if comma_separated_tag_name != '' and len(tag_names) == 0:
                return {'message': 'no tags'}, 400
            data_set.tags.clear()
            for tag_name in tag_names:
                # タグとDataSetを紐付ける
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                tag.data_sets.append(data_set)
                db.session.add(tag)

        # DataSet更新
        if args.get('title') is not None:
            data_set.title = args['title'][:64]
        if args.get('is_public') is not None:
            data_set.is_public = args['is_public']
        db.session.add(data_set)
        db.session.commit()
        return {
            'id': data_set.id,
            'title': data_set.title,
            'is_public': data_set.is_public,
            'tags': [{'id': t.id, 'name': t.name} for t in data_set.tags],
        }


class SortBy(Enum):
    CLASSES_DESC = 1
    CLASSES_ASC = 2
    PROPERTIES_DESC = 3
    PROPERTIES_ASC = 4
    UPLOAD_AT_DESC = 5
    UPLOAD_AT_ASC = 6


SORT_VALUES = set(e.value for e in SortBy)
SORT_UNARY_EXPRESSIONS = {
    SortBy.CLASSES_DESC.value: DataSet.meta_data_classes.desc(),
    SortBy.CLASSES_ASC.value: DataSet.meta_data_classes.asc(),
    SortBy.PROPERTIES_DESC.value: DataSet.meta_data_properties.desc(),
    SortBy.PROPERTIES_ASC.value: DataSet.meta_data_properties.asc(),
    SortBy.UPLOAD_AT_DESC.value: DataSet.upload_at.desc(),
    SortBy.UPLOAD_AT_ASC.value: DataSet.upload_at.asc(),
}


public_parser = reqparse.RequestParser()
public_parser.add_argument('size', type=int, location='args', default=4)
public_parser.add_argument('page', type=int, location='args', default=1)
public_parser.add_argument('sort', type=int, location='args', default=SortBy.CLASSES_DESC.value)
public_parser.add_argument('search', type=str, location='args', default='')


class PublicDataSetList(Resource):
    def _parse_args(self):
        args = public_parser.parse_args()
        size = args['size']
        if size <= 0:
            size = 1

        page = args['page']
        if page <= 0:
            page = 1

        offset = 0
        if page > 1:
            offset = size * (page - 1)

        sort = args['sort'] if args['sort'] in SORT_VALUES else SortBy.CLASSES_DESC.value

        return {
            'size': size,
            'page': page,
            'offset': offset,
            'sort': sort,
            'search': args['search']
        }

    def get(self):
        args = self._parse_args()
        public_query = DataSet.query.filter_by(is_public=True)
        query = (
            public_query
            .order_by(SORT_UNARY_EXPRESSIONS[args['sort']])
            .add_columns(func.json_extract(DataSet.content, '$.meta_data').label('meta_data'))
        )
        if args['search']:
            query = (
                query
                .filter(
                    or_(
                        DataSet.title == args['search'],
                        DataSet.tags.any(Tag.name == args['search'])
                    )
                )
            )
        # 全体の個数を取得したいのでoffsetとlimitの前に実行
        count = query.count()
        query = query.offset(args['offset']).limit(args['size'])

        # 前ページ
        previousUrl = None
        if args['offset'] >= 1:
            params = {'size': args['size'], 'page': args['page'] - 1, 'sort': args['sort']}
            if args['search']:
                params.update({'search': args['search']})
            params_string = urllib.parse.urlencode(params)
            previousUrl = f'{request.path}?{params_string}'
        # 次ページ
        nextUrl = None
        if args['offset'] + args['size'] < count:
            params = {'size': args['size'], 'page': args['page'] + 1, 'sort': args['sort']}
            if args['search']:
                params.update({'search': args['search']})
            params_string = urllib.parse.urlencode(params)
            nextUrl = f'{request.path}?{params_string}'

        return {
            'count': count,
            'previous': previousUrl,
            'next': nextUrl,
            'data': [
                {
                    'id': result.DataSet.id,
                    'title': result.DataSet.title,
                    'path': result.DataSet.path,
                    'upload_at': (
                        localize_as_jst(result.DataSet.upload_at).isoformat()
                    ),
                    'meta_data': json.loads(result.meta_data),
                    'user': {
                        'display_name': result.DataSet.user.display_name,
                        'contact_uri': result.DataSet.user.contact_uri,
                    },
                    'tags': [{'id': t.id, 'name': t.name} for t in result.DataSet.tags],
                }
                for result in query
            ]
        }
