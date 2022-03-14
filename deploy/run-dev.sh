#!/bin/sh

BASE = $HOME/dev

update() {
    cd $BASE/repos/umakaviewer
    git pull origin develop
}

rebuild() {
    cd $BASE/repos/umakaviewer
    docker-compose -p umakaviewer build
}

start() {
    cd $BASE/repos/umakaviewer
    docker-compose -p umakaviewer up -d
}

stop() {
    cd $BASE/repos/umakaviewer
    docker-compose -p umakaviewer down
}

restart() {
    cd $BASE/repos/umakaviewer
    docker-compose -p umakaviewer restart
}

ps() {
    cd $BASE/repos/umakaviewer
    docker-compose -p umakaviewer ps
}

main() {
    case $1 in
        "update" ) update ;;
        "rebuild" ) rebuild ;;
        "start" ) start ;;
        "stop" ) stop ;;
        "restart" ) restart ;;
        "ps" ) ps ;;
    esac
}

main $1
