@echo off
echo ========================================================
echo        Stopping Labour Connect Application
echo ========================================================

echo Stopping processes running on Port 8081 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes running on Port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All Labour Connect servers (Backend & Frontend) have been stopped.
timeout /t 3 >nul
