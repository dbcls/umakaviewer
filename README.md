# Umaka Viewer: A data visualizer for Sparql Builder
[**Website**](https://umaka-viewer.dbcls.jp)
| **Docs** ([ja](https://gist.github.com/sasaujp/477aec502cad993e560c))
| **Manual** ([ja](https://gist.github.com/sasaujp/237268602237bc1d97ef))

## Requirement
* Docker (Docker Desktop on macOS)
* Python 3.8 (same as `server/Dockerfile`)
  * Poetry
  * On Apple Silicon, Python 3.10 is recommended for local development (see notes below)
* Node.js 12
  * Node.js 12.22.12 x86_64 is known to work on Apple Silicon via Rosetta 2
  * Yarn 1.22.x
* MySQL 8.0 and Redis (provided by `docker/docker-compose.yml`)

## Installation

1. Clone repository and update submodule

```sh
$ git clone https://github.com/dbcls/umakaviewer.git
$ cd umakaviewer
$ git submodule update --init
```

2. Start MySQL and Redis (required by the migration in the next step)

```sh
$ docker compose -f docker/docker-compose.yml up -d dbcls_mysql dbcls_redis
```

3. Install packages of Python and run migrations

```sh
$ cd server
$ make bootstrap
```

> **Note for recent macOS (Apple Silicon)**
>
> Some locked dependencies are old and are incompatible with recent Python
> versions. In particular, `grpcio` 1.43.0 provides prebuilt macOS wheels only
> up to Python 3.10 (`cp36`-`cp39` for x86_64 only, `cp310` as `universal2`).
> With Python 3.11 or later it falls back to a source build, which fails on
> recent macOS / Xcode.
>
> Two configurations have been confirmed to work.
>
> **Option A (recommended): Python 3.10 with pyenv**
>
> Python 3.10 runs natively on arm64 and installs the `universal2` wheel of
> `grpcio`, so neither Rosetta nor a source build is needed:
>
> ```sh
> $ pyenv install 3.10.21
> $ cd server
> $ pyenv local 3.10.21
> $ python --version
> Python 3.10.21
> ```
>
> This project uses Poetry primarily for dependency management rather than as
> an installable Python package. If Poetry reports:
>
> ```text
> Error: The current project could not be installed:
> No file/folder found for package server
> ```
>
> install the dependencies without installing the project itself:
>
> ```sh
> $ poetry install --no-root
> $ APP_ENV=development poetry run alembic upgrade head
> ```
>
> `make bootstrap` already runs `poetry install --no-root`.
>
> **Option B: Python 3.8 x86_64 with uv and Rosetta**
>
> To match `server/Dockerfile` (Python 3.8) exactly, use a prebuilt x86_64
> Python, for which a prebuilt `grpcio` wheel is available. (Building Python 3.8
> with pyenv may fail on recent macOS.)
>
> ```sh
> $ softwareupdate --install-rosetta --agree-to-license   # if not installed yet
> $ cd server
> $ uv python install cpython-3.8-macos-x86_64
> $ uv venv --python cpython-3.8-macos-x86_64 --seed .venv
> $ poetry self add poetry-plugin-export
> $ poetry export -f requirements.txt --with dev --without-hashes -o /tmp/umaka-req.txt
> $ uv pip install --python .venv -r /tmp/umaka-req.txt
> $ APP_ENV=development poetry run alembic upgrade head
> ```
>
> Poetry uses `server/.venv` automatically once it exists.

4. Install packages of Node.js

```sh
$ cd node
$ yarn install --frozen-lockfile
```

> **Recommended setup on Apple Silicon: Node.js 12 x86_64 with Rosetta**
>
> The dependency tree contains the old native `grpc` 1.23.3 module through
> Firebase/Firestore. Recent Node.js versions are not compatible with this
> dependency. A confirmed working configuration on Apple Silicon is:
>
> ```text
> Node.js 12.22.12
> architecture: x64
> Yarn 1.22.22
> ```
>
> Install Rosetta 2 if necessary:
>
> ```sh
> $ softwareupdate --install-rosetta --agree-to-license
> ```
>
> Install and configure `nvm`, then start an x86_64 shell:
>
> ```sh
> $ arch -x86_64 zsh
> ```
>
> If `nvm` is not available in the new shell, load it explicitly:
>
> ```sh
> $ export NVM_DIR="$HOME/.nvm"
> $ [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
> ```
>
> Then install/select Node.js 12.22.12:
>
> ```sh
> $ nvm install 12.22.12
> $ nvm use 12.22.12
> $ node --version
> v12.22.12
> $ node -p 'process.arch'
> x64
> ```
>
> Install the dependencies:
>
> ```sh
> $ cd node
> $ yarn install --frozen-lockfile
> ```
>
> `node -p 'process.arch'` must report `x64`. Node.js 12 predates native
> Apple Silicon support.
>
> To make `nvm` available in newly opened zsh sessions, add the following to
> `~/.zshrc`:
>
> ```sh
> export NVM_DIR="$HOME/.nvm"
> [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
> ```
>
> **Alternative for recent Node.js versions**
>
> The native `grpc` module pulled in by the Firebase SDK cannot be built
> normally with recent Node.js versions. Since it is not needed for the
> browser bundle, the frontend can still be built with recent Node.js
> (confirmed with Node.js 20 and 22) by combining two workarounds:
>
> ```sh
> $ yarn install --ignore-scripts
> $ NODE_OPTIONS=--openssl-legacy-provider yarn build
> ```
>
> Using Node.js 12.22.12 x64 is preferable when reproducing the original
> dependency environment without suppressing package installation scripts.

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

```sh
$ docker compose -f docker/docker-compose.yml up -d
```

> **Note:** `docker-compose.yml` at the repository root is for the production server
> (it relies on paths under `/opt/services/...`). Do not start it locally: its `api` service
> occupies port 5000, which conflicts with the local Flask server (`Address already in use`).
> If it is running, stop it with `docker compose down` at the repository root.

2. Start Flask

Use a native arm64 shell for the Python/Flask server on Apple Silicon:

```sh
$ arch
arm64
$ cd server
$ make run-development
```

> **Note for Apple Silicon**
>
> Do not run the Flask development server from the Rosetta/x86_64 shell used
> for Node.js 12. On recent macOS, an x86_64 process may fail when invoking
> the arm64-only Command Line Tools, for example:
>
> ```text
> xcrun: error: unable to load libxcrun
> ... missing compatible architecture ... need 'x86_64'
> ```
>
> Exit the Rosetta shell before starting the backend:
>
> ```sh
> $ exit
> $ arch
> arm64
> ```

3. Build Webpack

On Apple Silicon, use the Node.js 12.22.12 x64 environment described above:

```sh
$ arch -x86_64 zsh
$ export NVM_DIR="$HOME/.nvm"
$ [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
$ nvm use 12.22.12
$ node --version
v12.22.12
$ node -p 'process.arch'
x64
$ cd node
$ yarn build
```

> **Note for Node.js 17+**
>
> If `yarn build` is accidentally run with a recent Node.js version, webpack
> 5.16 may fail with:
>
> ```text
> Error: error:0308010C:digital envelope routines::unsupported
> code: 'ERR_OSSL_EVP_UNSUPPORTED'
> ```
>
> For this project, first check:
>
> ```sh
> $ node --version
> $ node -p 'process.arch'
> ```
>
> and use Node.js 12.22.12 x64 as described above.
>
> `NODE_OPTIONS=--openssl-legacy-provider` works around this OpenSSL error,
> but the old native `grpc` dependency additionally requires
> `yarn install --ignore-scripts` (see "Alternative for recent Node.js versions"
> above). Node.js 12.22.12 x64 remains the recommended environment for
> reproducing this legacy frontend without these workarounds.

4. Go to "http://localhost" in your browser

## Testing in a local environment

1. Create database and user in MySQL

```sh
$ mysqladmin create dbcls_test -u root -h127.0.0.1 -P3308 --default-character-set=utf8mb4
$ mysql -u root -h127.0.0.1 -P3308
mysql> CREATE USER 'dbcls_tester'@'127.0.0.1' IDENTIFIED BY 'rjIHxE8qQT';
mysql> GRANT ALL ON dbcls_test.* TO 'dbcls_tester'@'127.0.0.1' WITH GRANT OPTION;
mysql> flush privileges;
$ APP_ENV=test poetry run alembic -n test upgrade head
```

2. Run tests

```sh
$ cd server
$ APP_ENV=test poetry run pytest tests
```
