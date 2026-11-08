@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8787
  py -m http.server 8787
) else (
  echo Python 3 is required. Install it from python.org and enable Add Python to PATH.
  pause
)
