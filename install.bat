@echo off
REM Animation Curves CEP Extension - Windows Install Script

echo Animation Curves - Installation (Windows)
echo ==========================================
echo.

set "CEP_DIR=%APPDATA%\..\Roaming\Adobe\CEP\extensions"
set "EXTENSION_DIR=%CEP_DIR%\com.animationcurves.panel"

REM Check for --dev flag
set "MODE=copy"
if "%1"=="--dev" set "MODE=symlink"

echo Mode: %MODE%
echo.

REM Step 1: Enable debug mode
echo [1/3] Enabling CEP debug mode...
echo Please enable debug mode manually:
echo   1. Open Registry Editor (regedit)
echo   2. Navigate to: HKEY_CURRENT_USER\Software\Adobe\CSXS.11
echo   3. Create DWORD 'PlayerDebugMode' with value 1
echo.
pause

REM Step 2: Create extensions directory
echo.
echo [2/3] Preparing extensions directory...
if not exist "%CEP_DIR%" mkdir "%CEP_DIR%"

REM Remove old installation
if exist "%EXTENSION_DIR%" (
    echo Removing old installation...
    rmdir /s /q "%EXTENSION_DIR%"
)

REM Step 3: Install
echo.
echo [3/3] Installing...
if "%MODE%"=="symlink" (
    mklink /D "%EXTENSION_DIR%" "%~dp0"
    echo Symlinked to: %~dp0
) else (
    mkdir "%EXTENSION_DIR%"
    xcopy /E /I /Y "%~dp0CSXS" "%EXTENSION_DIR%\CSXS"
    xcopy /E /I /Y "%~dp0client" "%EXTENSION_DIR%\client"
    xcopy /E /I /Y "%~dp0host" "%EXTENSION_DIR%\host"
    if exist "%~dp0.debug" copy /Y "%~dp0.debug" "%EXTENSION_DIR%\"
    echo Copied to: %EXTENSION_DIR%
)

echo.
echo ==========================================
echo Done! Restart After Effects, then open:
echo   Window ^> Extensions ^> Animation Curves
echo.
if "%MODE%"=="copy" (
    echo Tip: use 'install.bat --dev' for development mode.
)
pause
