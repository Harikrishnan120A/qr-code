@echo off
REM Lab Login System - Windows Deployment Script
REM This script builds and deploys the application on Windows

echo 🚀 Lab Login System - Windows Deployment Script
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js detected: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo [SUCCESS] npm detected:
npm --version

REM Check environment file
if not exist "lab-login-app\.env.production" (
    echo [WARNING] .env.production not found. Creating from template...
    copy "lab-login-app\.env.production.template" "lab-login-app\.env.production"
    echo [WARNING] Please edit lab-login-app\.env.production with your production settings.
    echo Press any key to continue after editing the environment file...
    pause >nul
)

echo [SUCCESS] Environment file checked

echo.
echo [INFO] Starting build process...
echo.

REM Install server dependencies
echo [INFO] Installing server dependencies...
cd lab-login-app\server
call npm ci --only=production
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Server dependencies installed
cd ..\..

REM Install client dependencies
echo [INFO] Installing client dependencies...
cd lab-login-app\client
call npm ci --only=production
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Client dependencies installed
cd ..\..

REM Generate Prisma client
echo [INFO] Generating Prisma client...
cd lab-login-app\server
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated
cd ..\..

REM Build server
echo [INFO] Building server...
cd lab-login-app\server
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build server
    pause
    exit /b 1
)
echo [SUCCESS] Server built successfully
cd ..\..

REM Build client
echo [INFO] Building client...
cd lab-login-app\client
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build client
    pause
    exit /b 1
)
echo [SUCCESS] Client built successfully
cd ..\..

REM Create deployment directory
echo [INFO] Creating production package...
if exist "deploy" rmdir /s /q deploy
mkdir deploy\lab-login-app

REM Copy server files
xcopy /E /I "lab-login-app\server\dist" "deploy\lab-login-app\dist"
xcopy /E /I "lab-login-app\server\node_modules" "deploy\lab-login-app\node_modules"
copy "lab-login-app\server\package.json" "deploy\lab-login-app\"
xcopy /E /I "lab-login-app\server\prisma" "deploy\lab-login-app\prisma"

REM Copy client files
xcopy /E /I "lab-login-app\client\dist" "deploy\lab-login-app\public"

REM Copy environment file
copy "lab-login-app\.env.production" "deploy\lab-login-app\.env"

echo [SUCCESS] Production package created in .\deploy directory

echo.
echo 🎉 [SUCCESS] Deployment completed successfully!
echo.
echo [INFO] Next steps:
echo 1. Review the production package in .\deploy directory
echo 2. Deploy using your preferred platform:
echo    - Docker: docker build -t lab-login-app .
echo    - Railway: railway up
echo    - Vercel: vercel --prod
echo    - Manual: Upload .\deploy contents to your server
echo.
echo [INFO] Production deployment options:
echo - Docker: Use the provided Dockerfile and docker-compose.yml
echo - Railway: Configure with railway.toml
echo - Vercel: Use vercel.json configuration
echo - Render: Use render.yaml configuration
echo.

echo Press any key to exit...
pause >nul