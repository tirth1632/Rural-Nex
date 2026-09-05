@echo off
echo Setting up Rural-Nex Local Environment...

:: Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH. Please install Python 3.10+.
    exit /b 1
)

:: Create Virtual Environment if it doesn't exist
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
)

:: Activate Virtual Environment and install requirements
echo Activating virtual environment and installing dependencies...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt

:: Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH. Please install Node.js 18+.
    exit /b 1
)

:: Install Frontend Dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo Setup complete! 
echo Note: Native backend execution requires GDAL/GEOS libraries installed and configured.
echo If they are not configured, please use Docker for execution.
