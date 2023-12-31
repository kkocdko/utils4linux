@echo off
cd /d %~dp0
:: curl -o config.jsonc -L http://example.com
:: please set "compatibility > run as administrator" for sing-box.exe in file attribute dialog
start "sing-box" sing-box run -c config.jsonc -D . --disable-color
