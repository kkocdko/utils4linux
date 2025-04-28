#!/bin/sh
export PATH="/data/local/tmp:$PATH"
cd /sdcard/Download/_shell
killall shell-ttyd-9556 && echo exited && exit
[ -e ttyd ] || curl -o ttyd -L https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.aarch64
install -Dm777 ttyd /data/local/tmp/ttyd
exec -a shell-ttyd-9556 ttyd --port 9556 --cwd . --writable sh
