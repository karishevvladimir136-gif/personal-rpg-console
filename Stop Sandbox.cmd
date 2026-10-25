@echo off
setlocal
cd /d "%~dp0"
set "NODE=node"
where node >nul 2>nul || (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if exist "%ProgramFiles%\nodejs\node.exe" set "NODE=%ProgramFiles%\nodejs\node.exe"
  if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
)
"%NODE%" "%~dp0scripts\sandbox-start.mjs" --stop %*
if errorlevel 1 (
  echo.
  echo Press any key to close this window.
  pause >nul
)
