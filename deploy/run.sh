#!/bin/sh

update_repo() {
    cd $HOME/repos/umakaviewer
    git pull origin main
}

rebuild() {
    $HOME/local/bin/docker-compose build
}

start_app() {
    $HOME/local/bin/docker-compose up -d
}

stat() {
    $HOME/local/bin/docker-compose ps
}

main() {
    case $1 in
        "update_repo" ) update_repo ;;
        "rebuild" ) rebuild ;;
        "start_app" ) start_app ;;
        "stat" ) stat ;;
    esac
}

main $1
