@echo off
REM GigShield AI+ - Quick Start Script (Windows)
REM Copy this to your project root and run: quickstart.bat

echo.
echo ====================================
echo 🛡️ GigShield AI+ - Quick Start
echo ====================================
echo.

REM Check for Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found. Install from https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Install Backend
echo 📦 Installing backend dependencies...
cd server
call npm install
echo ✅ Backend dependencies installed
echo.

REM Install Frontend
echo 📦 Installing frontend dependencies...
cd ..\client
call npm install
echo ✅ Frontend dependencies installed
echo.

REM Create .env
echo 🔧 Setting up environment variables...
if not exist ..\server\.env (
    (
        echo MONGO_URI=mongodb://localhost:27017/gigshield
        echo PORT=5000
        echo JWT_SECRET=gigshield_secret_key_2024
        echo NODE_ENV=development
    ) > ..\server\.env
    echo ✅ Created .env file
) else (
    echo ℹ️  .env file already exists
)
echo.

echo 🚀 SETUP COMPLETE!
echo.
echo To start the application:
echo.
echo Command 1 - Backend:
echo   cd server
echo   npm start
echo.
echo Command 2 - Frontend:
echo   cd client
echo   npm start
echo.
echo Then visit: http://localhost:3000
echo.
echo Demo credentials:
echo   Email: demo@gigshield.com
echo   Password: demo123
echo.
pause
