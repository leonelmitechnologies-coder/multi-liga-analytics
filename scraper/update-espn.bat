@echo off
:: Liga Analytics - Quick ESPN Update (every 15 min)
:: Only fetches from ESPN (free, unlimited)
:: Skips API-Football, BSD, and injuries for speed

cd /d "%~dp0"

:: Check for lock file to avoid concurrent runs
if exist ".update-lock" (
    echo [SKIP] Another update is already running ^(lock file exists^)
    exit /b 0
)

:: Create lock file
echo espn-quick-%date% %time% > ".update-lock"

echo ============================================
echo  Liga Analytics - Quick ESPN Update
echo  %date% %time%
echo ============================================

:: Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH
    del ".update-lock" 2>nul
    exit /b 1
)

:: Run ESPN-only update for all leagues
echo Starting ESPN-only scraper for all leagues...
node index.js --league all --skip-apifootball --skip-bsd --skip-injuries --skip-footballdata

if %errorlevel% equ 0 (
    echo.
    echo [OK] Quick update completed successfully
) else (
    echo.
    echo [ERROR] Scraper exited with code %errorlevel%
)

:: Remove lock file
del ".update-lock" 2>nul

echo.
echo Quick update finished at %time%
