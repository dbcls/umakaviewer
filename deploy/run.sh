#!/bin/sh

API_DIR=/opt/services/umaka_v/api_server

update_repo() {
    cd $HOME/repos/dbcls
    git fetch origin --prune
    latest_tag=`git describe --tags \`git rev-list --tags --max-count=1\``
    git checkout -b ${latest_tag} refs/tags/${latest_tag}
}

update_libs() {
    cd ${API_DIR}
    poetry install --no-dev
}

update_static() {
    docker exec dbcls_yarn /bin/sh -c "cd dbcls && yarn build:visualizer && yarn && yarn build:production"
    if [ $? == 0 ]; then
        printf "\e[32;1m********** build static files success **********\n\e[m"
        cp $HOME/repos/dbcls/public/index.html /opt/services/umaka_v/public/index.html
        cp -r $HOME/repos/dbcls/public/static /opt/services/umaka_v/public/.
    else
        printf "\e[31;1m********** build static files failure **********\n\e[m"
    fi
}

migrate() {
    cd ${API_DIR}
    poetry run alembic -n production upgrade head
}

restart_app() {
    kill -s HUP $( cat /opt/services/umaka_v/uwsgi/uwsgi.pid )
    if [ $? == 0 ]; then
        printf "\e[32;1m********** app graceful restart success **********\n\e[m"
    else
        printf "\e[31;1m********** app graceful restart failure **********\n\e[m"
    fi
}

restart_nginx() {
    $HOME/local/nginx/sbin/nginx -t -c /opt/services/umaka_v/etc/nginx/nginx.conf
    if [ $? == 0 ]; then
        kill -s HUP $( cat $HOME/local/nginx/nginx.pid )
        printf "\e[32;1m********** nginx graceful restart success **********\n\e[m"
    else
        printf "\e[31;1m********** nginx configuration file error **********\n\e[m"
    fi
}

main() {
    case $1 in
        "update_repo" ) update_repo ;;
        "update_libs" ) update_libs ;;
        "update_static" ) update_static ;;
        "migrate" ) migrate ;;
        "restart_app" ) restart_app ;;
        "restart_nginx" ) restart_nginx ;;
    esac
}

main $1
