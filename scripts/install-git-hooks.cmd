@echo off
git config core.hooksPath .githooks
if errorlevel 1 (
  echo Failed to set git hooks path.
  exit /b 1
)

echo Git hooks installed.
git config --get core.hooksPath
