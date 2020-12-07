alembic -n production upgrade head
APP_ENV=production python manage.py runserver --host 0.0.0.0
