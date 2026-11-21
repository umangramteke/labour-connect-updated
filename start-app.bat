@echo off
echo ========================================================
echo        Starting Labour Connect (Full Stack)
echo ========================================================

:: 1. Check MongoDB
echo [1/3] Checking MongoDB service...
sc query MongoDB | findstr /I "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Starting MongoDB Windows Service...
    net start MongoDB >nul 2>&1
)

:: 2. Start Backend (Port 8081)
echo [2/3] Launching Node.js Backend on port 8081...
start "Labour Connect - Backend (Port 8081)" cmd /k "cd /d %~dp0backend && npm start"

:: 3. Start Frontend (Port 5173)
echo [3/3] Launching React Frontend on port 5173...
start "Labour Connect - Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application started!
echo Frontend URL: http://localhost:5173
echo Backend API:  http://localhost:8081/api/v1
echo.
echo Opening web browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
