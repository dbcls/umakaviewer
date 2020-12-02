import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import redis
from .datetimeformat import datetimeformat

app = Flask(__name__)
config_name = os.getenv("APP_ENV").capitalize()
app.config.from_object(f'dbcls.config.{config_name}Config')
app.jinja_env.filters['datetimeformat'] = datetimeformat

db = SQLAlchemy(app)

CORS(app)

redis_client = redis.Redis(**app.config['REDIS'])

import dbcls.api.app  # noqa
