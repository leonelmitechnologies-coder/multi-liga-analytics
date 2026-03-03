@echo off
:: Liga Analytics - Full Auto Update Script
:: Runs all league scrapers (ESPN + API-Football + BSD) to refresh match data
:: Designed for Windows Task Scheduler (daily 6:00 AM)

cd /d "%~dp0"

:: Check for lock file to avoid concurrent runs with quick updates
if exist ".update-lock" (
    echo [SKIP] Another update is already running ^(lock file exists^)
    exit /b 0
)

:: Create lock file
echo full-update-%date% %time% > ".update-lock"

echo ============================================
echo  Liga Analytics - Full Data Update
echo  %date% %time%
echo ============================================

:: Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH
    del ".update-lock" 2>nul
    exit /b 1
)

:: Load API keys from .env.bat (gitignored)
if exist ".env.bat" (
    call ".env.bat"
) else (
    echo [WARN] .env.bat not found — BSD and API-Football will be skipped
)

:: Run the multi-league scraper
echo Starting scraper for all leagues...
node index.js --league all

if %errorlevel% equ 0 (
    echo.
    echo [OK] All leagues updated successfully
) else (
    echo.
    echo [ERROR] Scraper exited with code %errorlevel%
)

:: Remove lock file
del ".update-lock" 2>nul

echo.
echo Update finished at %time%
