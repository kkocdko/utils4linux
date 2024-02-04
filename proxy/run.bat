@echo off
cd /d %~dp0
curl -o config.jsonc -L "https://1.1.1.1:1111/dav/proxy/config.jsonc"
start "sing-box" sing-box run -c config.jsonc -D . --disable-color
