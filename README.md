# Umaka Viewer: A data visualizer for Sparql Builder
[**Website**](https://umaka-viewer.dbcls.jp)
| **Docs** ([ja](https://gist.github.com/sasaujp/477aec502cad993e560c))
| **Manual** ([ja](https://gist.github.com/sasaujp/237268602237bc1d97ef))

## Requirement
* Docker
* Python 3.6.11
  * poetry 1.1.3 
* Node.js 12.18.4
* MySQL 8.0.22

## Installation

1. Clone repository and update submodule
```
$ git clone https://github.com/dbcls/umakaviewer.git
$ git submodule update --init
```

2. Install packages of Node.js 
```
$ yarn install
```

3. Install packages of Python
```
$ cd server
$ make bootstrap
```

## Start Servers at localhost

1. Start Docker
```
$ docker-compose -f docker/docker-compose.yml up
```

2. Start Flask
```
(another session)
$ cd server
$ make run-development
```

3. Build Webpack
```
$ yarn build 
```

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
