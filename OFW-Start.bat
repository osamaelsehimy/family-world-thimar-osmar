@echo off
title OFW - Our Family World
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8787
  py -3 -m http.server 8787
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8787
  python -m http.server 8787
  goto :eof
)
echo Python was not found.
echo Please install Python 3 from https://www.python.org/downloads/
echo Then double-click OFW-Start.bat again.
pause
