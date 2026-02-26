@echo off
REM ==========================================
REM  BANF PWA - One-Click Deploy
REM  Run this after making any code changes.
REM  The website will update automatically.
REM ==========================================

cd /d "%~dp0"

echo.
echo  ==============================
echo   BANF PWA - Deploying Changes
echo  ==============================
echo.

REM Check for changes
git status --short
echo.

REM Stage all changes
git add .

REM Prompt for commit message (with default)
set /p MSG="Commit message (press Enter for default): "
if "%MSG%"=="" set MSG=Update BANF PWA

REM Commit and push
git commit -m "%MSG%"
git push origin master

echo.
echo  ==============================
echo   DONE! Changes will be live at:
echo   https://banfjax-hash.github.io/banf-pwa/
echo   (takes about 30-60 seconds)
echo  ==============================
echo.
pause
