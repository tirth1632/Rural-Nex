@echo off
title Starting RuralNex Application

echo ========================================================
echo             Starting RuralNex Application
echo ========================================================
echo.

echo Starting Django Backend Server (Port 8000)...
start "RuralNex Backend Server" cmd /k "call backend\venv\Scripts\activate.bat && python backend\manage.py runserver 127.0.0.1:8000"

timeout /t 2 /nobreak >nul

echo Starting React Vite Frontend Server (Port 5173)...
start "RuralNex Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo RuralNex Backend:  http://127.0.0.1:8000/
echo RuralNex Frontend: http://localhost:5173/
echo ========================================================
echo.
pause
