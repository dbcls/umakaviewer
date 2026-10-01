# Umaka Viewer: A data visualizer for Sparql Builder
[**Website**](https://umaka-viewer.dbcls.jp)
| **Docs** ([ja](https://gist.github.com/sasaujp/477aec502cad993e560c))
| **Manual** ([ja](https://gist.github.com/sasaujp/237268602237bc1d97ef))

## Requirement
* Docker (Docker Desktop on macOS)
* Python 3.8 (same as `server/Dockerfile`)
  * Poetry
* Node.js (tested with 12 and 20; see notes below for Node.js 17+)
* MySQL 8.0 and Redis (provided by `docker/docker-compose.yml`)

## Installation

1. Clone repository and update submodule
```
$ git clone https://github.com/dbcls/umakaviewer.git
$ cd umakaviewer
$ git submodule update --init
```

2. Start MySQL and Redis (required by the migration in the next step)
```
$ docker compose -f docker/docker-compose.yml up -d dbcls_mysql dbcls_redis
```

3. Install packages of Python and run migrations
```
$ cd server
$ make bootstrap
```

> **Note for recent macOS (Apple Silicon)**
> Some locked dependencies (e.g. `grpcio` 1.43.0) do not build on Python 3.12 or on
> arm64, and building Python 3.8 with pyenv may fail on recent macOS.
> A workaround is to use a prebuilt x86_64 Python 3.8 (via Rosetta) with [uv](https://docs.astral.sh/uv/):
> ```
> $ softwareupdate --install-rosetta --agree-to-license   # if not installed yet
> $ cd server
> $ uv python install cpython-3.8-macos-x86_64
> $ uv venv --python cpython-3.8-macos-x86_64 --seed .venv
> $ poetry self add poetry-plugin-export
> $ poetry export -f requirements.txt --with dev --without-hashes -o /tmp/umaka-req.txt
> $ uv pip install --python .venv -r /tmp/umaka-req.txt
> $ APP_ENV=development poetry run alembic upgrade head
> ```
> Poetry uses `server/.venv` automatically once it exists.

4. Install packages of Node.js
```
$ cd node
$ yarn install
```

> **Note for Node.js 16+**
> The native `grpc` module pulled in by the Firebase SDK cannot be built on recent Node.js.
> It is not needed for the browser bundle, so skip install scripts:
> ```
> $ yarn install --ignore-scripts
> ```

## Firebase setup for local development

Authentication uses Firebase. The API server needs a service account key, and it must belong to
the same Firebase project as the one configured in the frontend build. Without the key, the API
itself starts, but sign-up and login fail with HTTP 500 (`DefaultCredentialsError`).

Use a dedicated Firebase project for local development rather than the production one,
so that test accounts are not registered in the production Firebase Authentication.

1. Create a project in the [Firebase console](https://console.firebase.google.com/)
2. In Authentication > Sign-in method, enable **Google**, and make sure `localhost` is listed in
   Authentication > Settings > Authorized domains
3. In Project settings > General, add a web app and copy its `firebaseConfig` values into the
   `development` case of `FIREBASE_CONFIG` in `node/webpack.config.js` (do not commit this change)
4. In Project settings > Service accounts, generate a new private key and save it as
   `server/firebase-config.json` (already listed in `.gitignore`; never commit it)

The local database starts empty, so **sign up** first; afterwards you can log in.

## Start Servers at localhost

1. Start Docker containers (MySQL, Redis and nginx)
```
$ docker compose -f docker/docker-compose.yml up -d
```

> **Note:** `docker-compose.yml` at the repository root is for the production server
> (it relies on paths under `/opt/services/...`). Do not start it locally: its `api` service
> occupies port 5000, which conflicts with the local Flask server (`Address already in use`).
> If it is running, stop it with `docker compose down` at the repository root.

2. Start Flask
```
(another session)
$ cd server
$ make run-development
```

3. Build Webpack
```
$ cd node
$ yarn build
```

> **Note for Node.js 17+**
> webpack 5.16 uses a hash function that OpenSSL 3 disables by default. Run:
> ```
> $ NODE_OPTIONS=--openssl-legacy-provider yarn build
> ```

4. Go to "http://localhost" in your browser

## Testing in a local environment

1. Create database and user in MySQL
```
$ mysqladmin create dbcls_test -u root -h127.0.0.1 -P3308 --default-character-set=utf8mb4
$ mysql -u root -h127.0.0.1 -P3308
mysql> CREATE USER 'dbcls_tester'@'127.0.0.1' IDENTIFIED BY 'rjIHxE8qQT';
mysql> GRANT ALL ON dbcls_test.* TO 'dbcls_tester'@'127.0.0.1' WITH GRANT OPTION;
mysql> flush privileges;
$ APP_ENV=test poetry run alembic -n test upgrade head
```

2. Run tests
```
$ cd server
$ APP_ENV=test poetry run pytest tests
```
