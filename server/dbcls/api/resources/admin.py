import urllib.parse

from flask import request
from flask_restful import Resource, reqparse

from dbcls import db
from dbcls.utils import localize_as_jst
from dbcls.models import DataSet, User


parser = reqparse.RequestParser()
parser.add_argument('page', type=int, location='args', default=1)
SIZE_PER_PAGE = 50


class AdminDataSetList(Resource):
    def _parse_args(self):
        args = parser.parse_args()
        page = args['page']
        if page <= 0:
            page = 1

        offset = 0
        if page > 1:
            offset = SIZE_PER_PAGE * (page - 1)

        return {
            'page': page,
            'offset': offset,
        }

    def get(self):
        args = self._parse_args()
        query = DataSet.query.join(DataSet.user).with_entities(DataSet.id, DataSet.title, DataSet.path, DataSet.is_public, DataSet.upload_at, User.display_name, User.contact_uri).order_by(DataSet.upload_at.desc())
        count = query.count()
        query = query.offset(args['offset']).limit(SIZE_PER_PAGE)
        # 前ページ
        previousUrl = None
        if args['offset'] >= 1:
            params = {'page': args['page'] - 1}
            params_string = urllib.parse.urlencode(params)
            previousUrl = f'{request.path}?{params_string}'

        # 次ページ
        nextUrl = None
        if args['offset'] + SIZE_PER_PAGE < count:
            params = {'page': args['page'] + 1}
            params_string = urllib.parse.urlencode(params)
            nextUrl = f'{request.path}?{params_string}'
        return {
            'count': count,
            'previous': previousUrl,
            'next': nextUrl,
            'data': [
                {
                    'id': data_set.id,
                    'title': data_set.title,
                    'path': data_set.path,
                    'is_public': data_set.is_public,
                    'upload_at': (
                        localize_as_jst(data_set.upload_at).isoformat()
                    ),
                    'user': {
                        'display_name': data_set.display_name,
                        'contact_uri': data_set.contact_uri,
                    }
                }
                for data_set in query
            ]
        }


class AdminDataSetDetail(Resource):
    def delete(self, id):
        data_set = DataSet.query.get(id)
        if not data_set:
            return {'message': 'not found'}, 404

        db.session.delete(data_set)
        db.session.commit()
        return '', 204
