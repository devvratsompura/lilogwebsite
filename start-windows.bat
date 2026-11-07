@echo off
rem Double-click to run the site at http://localhost:4321 (needs Node.js from nodejs.org)
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org and try again. & pause & exit /b 1)
start "" http://localhost:4321/film.html
node serve.js
pause
