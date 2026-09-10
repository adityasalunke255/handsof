@echo off
echo ====================================================
echo   Business Saathi - AI Product Studio Service Runner
echo ====================================================
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10 or higher from https://www.python.org/downloads/
    echo Make sure to check "Add python.exe to PATH" during installation.
    pause
    exit /b 1
)

echo [1/3] Checking Python virtual environment...
if not exist "venv" (
    echo Creating virtual environment venv...
    python -m venv venv
)

echo [2/3] Activating virtual environment & installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt

echo.
echo [3/3] Starting AI Product Studio FastAPI Service on http://localhost:8000 ...
python app.py

pause
