@echo off
cd /d "%~dp0"
set PORT=8777
set URL=http://127.0.0.1:%PORT%/

echo Serveur local du site Concours BAC
echo %URL%
echo Ferme cette fenetre pour arreter le serveur.
echo.

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  python -m http.server %PORT% --bind 127.0.0.1
  goto end
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  py -m http.server %PORT% --bind 127.0.0.1
  goto end
)

where npx >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  npx --yes http-server -p %PORT% -a 127.0.0.1 -c-1
  goto end
)

echo Aucun serveur disponible : installe Python ou Node.js.
pause

:end
