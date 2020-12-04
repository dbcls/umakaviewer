#!/bin/sh

update() {
    cd $HOME/repos/umakaviewer
    git pull origin main
}

rebuild() {
    cd $HOME/repos/umakaviewer
    $HOME/local/bin/docker-compose build
}

start() {
    cd $HOME/repos/umakaviewer
    $HOME/local/bin/docker-compose up -d
}

stop() {
    cd $HOME/repos/umakaviewer
    $HOME/local/bin/docker-compose down
}

restart() {
    cd $HOME/repos/umakaviewer
    $HOME/local/bin/docker-compose restart
}

ps() {
    cd $HOME/repos/umakaviewer
    $HOME/local/bin/docker-compose ps
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
