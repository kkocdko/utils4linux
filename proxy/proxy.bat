@echo off
title sing-box
fltmc>nul || echo Please run as administrator && pause && exit
cd /d %~dp0
curl -o config.jsonc -L "https://1.1.1.1:1111/dav/proxy/config.jsonc"
sing-box version
sing-box run -c config.jsonc -D . --disable-color
