#!/bin/sh

update() {
    cd $HOME/repos/umakaviewer
    git pull origin main
}

rebuild() {
    cd $HOME/repos/umakaviewer
    docker-compose -p umakaviewer build
}

start() {
    cd $HOME/repos/umakaviewer
    docker-compose -p umakaviewer up -d --remove-orphans
}

stop() {
    cd $HOME/repos/umakaviewer
    docker-compose -p umakaviewer down
}

restart() {
    cd $HOME/repos/umakaviewer
    docker-compose -p umakaviewer restart
}

ps() {
    cd $HOME/repos/umakaviewer
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
