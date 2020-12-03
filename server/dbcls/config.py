import os
from pathlib import Path


class ConfigBase:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://dbcls_user:yy0T3s3YY4@127.0.0.1:3308/dbcls_dev?charset=utf8mb4'
    SECRET_KEY = b'+I%\xe4?I\x01\xfb\xa3\xd2\xabc\xfc\x94\xa9v>\xc6\x9f?\xb2\xac\xfa\xec'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
    }

    REDIS = {
        'host': '127.0.0.1',
        'port': 6379,
        'db': 0,
        'decode_responses': True,
    }

    GOOGLE_CREDENTIALS_PATH = Path(
        './firebase-config.json'
    ).resolve().as_posix()


class DevelopmentConfig(ConfigBase):
    DEBUG = True
    REDIS = {
        'host': '127.0.0.1',
        'port': 26379,
        'db': 0,
        'decode_responses': True,
    }


class TestConfig(DevelopmentConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://dbcls_tester:rjIHxE8qQT@127.0.0.1:3308/dbcls_test?charset=utf8mb4'
    GOOGLE_CREDENTIALS_PATH = Path('~/firebase_credential_does_not_exist.json').expanduser().as_posix()
    REDIS = {
        'host': '127.0.0.1',
        'port': 26379,
        'db': 4,
        'decode_responses': True,
    }


class CircleciConfig(TestConfig):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://dbcls_tester:AW8loEjqcY@127.0.0.1:3306/dbcls_test?charset=utf8mb4'
    REDIS = {
        'host': '127.0.0.1',
        'port': 6379,
        'db': 0,
        'decode_responses': True,
    }


class ProductionConfig(ConfigBase):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://umaka_v:glnyUnLiybsaE968Z7@mysql:3306/dbcls_production?charset=utf8mb4'
    GOOGLE_CREDENTIALS_PATH = Path('/app/adminsdk.json').as_posix()
    REDIS = {
        'host': 'redis',
        'port': 6379,
        'db': 0,
        'decode_responses': True,
    }
