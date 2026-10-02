bootstrap:
	poetry install --no-root
	APP_ENV=development poetry run alembic upgrade head

run-development:
	APP_ENV=development poetry run python manage.py runserver

run:
	APP_ENV=production poetry run python manage.py runserver
