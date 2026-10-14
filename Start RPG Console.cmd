@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\local-start.ps1"
if errorlevel 1 (
  echo.
  echo Startup stopped. Press any key to close this window.
  pause >nul
)
