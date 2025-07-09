@echo off
echo ========================================
echo    DFashion Frontend Quick Start
echo ========================================
echo.

echo 🔍 Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found!
echo.

echo 🔍 Checking Angular CLI...
ng version --skip-git
if %errorlevel% neq 0 (
    echo ⚠️  Angular CLI not found. Installing globally...
    npm install -g @angular/cli
)

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🚀 Starting DFashion Frontend...
echo.
echo ========================================
echo    Frontend will start on port 4200
echo    Main App: http://localhost:4200
echo    Admin Panel: http://localhost:4200/admin
echo ========================================
echo.
echo ⚠️  IMPORTANT: Make sure backend is running first!
echo    Run quick-start.bat in the backend folder
echo.
echo 📋 ADMIN LOGIN CREDENTIALS:
echo.
echo 🔴 SUPER ADMIN (Full Access):
echo    Email: superadmin@dfashion.com
echo    Password: SuperAdmin123!
echo.
echo 🟡 ADMIN (Limited Access):
echo    Email: admin@dfashion.com
echo    Password: Admin123!
echo.
echo 🟢 CUSTOMER (No Admin Access):
echo    Email: customer@dfashion.com
echo    Password: Customer123!
echo.
echo ========================================
echo.

ng serve --open
