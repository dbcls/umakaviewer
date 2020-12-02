#! /usr/bin/env python
from flask_script import Manager
from dbcls import app, db

manager = Manager(app)

if __name__ == '__main__':
    manager.run()
