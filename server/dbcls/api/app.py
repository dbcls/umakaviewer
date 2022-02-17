import os

from flask import Blueprint, request, g, abort
from flask_restful import Api, Resource
import firebase_admin
from firebase_admin import auth as firebase_auth
from google.auth.exceptions import TransportError

from dbcls import app
from dbcls.api.resources.proxy import Proxy
from dbcls.models import User, UserRole, UserRoleTypes
from dbcls.api.resources.signup import SignUp
from dbcls.api.resources.authenticate import Authenticate
from dbcls.api.resources.data_set import (
    DataSetList, VisualizedDataSet, DataSetDetail, PublicDataSetList, DataSetGenerator,
    DataSetGenerateProcessStatus
)
from dbcls.api.resources.user import Me, MyCustomToken
from dbcls.api.resources.admin import AdminDataSetList, AdminDataSetDetail


@app.before_first_request
def before_first_request():
    # firebase初期化
    VARIABEL_GOOGLE_CREDENTIALS = 'GOOGLE_APPLICATION_CREDENTIALS'
    if VARIABEL_GOOGLE_CREDENTIALS not in os.environ:
        os.environ[VARIABEL_GOOGLE_CREDENTIALS] = app.config['GOOGLE_CREDENTIALS_PATH']
    firebase_admin.initialize_app()


class Healthy(Resource):
    def get(self):
        return {'ok': True}


def verify_authentication():
    # トークンを検証
    authorization = request.headers.get('Authorization')
    if not authorization:
        abort(401)
    try:
        token = authorization.replace('Bearer ', '')
        decoded_token = firebase_auth.verify_id_token(token)
        g.user = User.query.filter_by(firebase_uid=decoded_token['uid']).first()
    except (ValueError, firebase_auth.AuthError, TransportError) as e:
        abort(401)

    if not g.user:
        abort(401)


# user
api_v1_bp = Blueprint('api_v1', __name__, url_prefix='/api/v1')
api_v1 = Api(api_v1_bp)
api_v1.add_resource(Healthy, '/healthy', endpoint='healthy')
api_v1.add_resource(SignUp, '/signup', endpoint='signup')
api_v1.add_resource(Authenticate, '/auth', endpoint='auth')
api_v1.add_resource(DataSetList, '/data_sets')
api_v1.add_resource(Proxy, '/proxy', endpoint='proxy')
api_v1.add_resource(DataSetDetail, '/data_sets/<int:id>')
api_v1.add_resource(DataSetGenerator, '/data_sets/generate')
api_v1.add_resource(DataSetGenerateProcessStatus, '/data_sets/generate/<task_id>')
api_v1.add_resource(VisualizedDataSet, '/visualize/<path>', endpoint='visualize')
api_v1.add_resource(PublicDataSetList, '/public_data_sets', endpoint='public_data_sets')
api_v1.add_resource(Me, '/me')
api_v1.add_resource(MyCustomToken, '/me/custom_token')


NOT_NEED_AUTHORIZATION_ENDPOINTS = [
    f'{api_v1_bp.name}.{endpoint}'
    for endpoint in ('healthy', 'signup', 'auth', 'public_data_sets', 'visualize', 'proxy')
]


@api_v1_bp.before_request
def is_authorized():
    if request.method == 'OPTIONS':
        return
    if request.endpoint in NOT_NEED_AUTHORIZATION_ENDPOINTS:
        return

    verify_authentication()


# admin
admin_api_v1_bp = Blueprint('admin_api_v1', __name__, url_prefix='/api/v1/admin')
admin_api_v1 = Api(admin_api_v1_bp)
admin_api_v1.add_resource(AdminDataSetList, '/data_sets')
admin_api_v1.add_resource(AdminDataSetDetail, '/data_sets/<int:id>')


@admin_api_v1_bp.before_request
def has_admin_role():
    if request.method == 'OPTIONS':
        return

    verify_authentication()

    admin_role = (
        UserRole.query
        .filter(
            UserRole.role_type==UserRoleTypes.ADMIN.value,
            UserRole.users.contains(g.user)
        )
        .first()
    )
    if not admin_role:
        abort(404)


app.register_blueprint(api_v1_bp)
app.register_blueprint(admin_api_v1_bp)
