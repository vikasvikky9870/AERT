@echo off
TITLE AERT 3.0 Emergency Response Platform - Srikakulam District
COLOR 0B

echo =========================================================================
echo       AERT 3.0: AI EMERGENCY RESPONSE & DIGITAL TWIN OPERATING SYSTEM
echo       Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking environment & dependencies...
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Python virtualenv not found at backend\venv!
    echo Please install Python and setup venv in backend directory.
    pause
    exit /b 1
)

echo [2/3] Launching FastAPI Backend on http://127.0.0.1:8000...
start "AERT Backend (Port 8000)" /min cmd /c "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [3/3] Launching Frontend Interface on http://localhost:5173...
start "AERT Frontend (Port 5173)" /min cmd /c "cd /d "%~dp0frontend" && npm run dev -- --host"

timeout /t 3 /nobreak >nul

echo.
echo Opening Google Maps EOC Tactical Command Center...
start http://localhost:5173

echo.
echo =========================================================================
echo       AERT 3.0 IS RUNNING LIVE IN COMMAND MODE!
echo       - Web Dashboard:  http://localhost:5173
echo       - API & Swagger:  http://127.0.0.1:8000/docs
echo       - Citizen SOS:    http://localhost:5173/phone.html
echo =========================================================================
echo Press any key to stop all AERT services and exit...
echo.
pause >nul

echo Shutting down services...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo All services stopped cleanly.
