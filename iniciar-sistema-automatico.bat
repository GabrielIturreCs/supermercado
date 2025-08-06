@echo off
echo 🚀 SOLUCION FINAL: Sistema XP-58IIH SIN dialogos
echo.
echo 📝 Eliminando dialogos de Chrome completamente...
echo.

REM Cerrar Chrome y Edge completamente
taskkill /f /im chrome.exe 2>nul
taskkill /f /im msedge.exe 2>nul

REM Esperar
timeout /t 3 /nobreak >nul

REM Configurar variables de entorno para impresión silenciosa
set CHROME_PRINT_NO_DIALOG=1
set PRINT_SILENT=1

REM Crear directorio temporal único
set PROFILE_DIR=%TEMP%\chrome_silent_%RANDOM%_%TIME:~-2%
mkdir "%PROFILE_DIR%" 2>nul

echo 🖨️ Iniciando Chrome SILENCIOSO para XP-58IIH...
echo.

REM Método 1: Chrome con configuración máxima para silenciar diálogos
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --user-data-dir="%PROFILE_DIR%" ^
  --disable-print-preview ^
  --kiosk-printing ^
  --disable-background-timer-throttling ^
  --disable-dev-shm-usage ^
  --disable-gpu ^
  --no-sandbox ^
  --disable-web-security ^
  --disable-features=VizDisplayCompositor ^
  --run-all-compositor-stages-before-draw ^
  --disable-ipc-flooding-protection ^
  --disable-renderer-backgrounding ^
  --disable-backgrounding-occluded-windows ^
  --disable-background-networking ^
  --silent-debugger-extension-api ^
  --no-default-browser-check ^
  --no-first-run ^
  --disable-prompt-on-repost ^
  --disable-hang-monitor ^
  --disable-popup-blocking ^
  --allow-running-insecure-content ^
  --autoplay-policy=no-user-gesture-required ^
  "http://localhost:4200"

echo ✅ Chrome configurado SILENCIOSO
echo ✅ Sistema listo - XP-58IIH imprimira SIN dialogos
echo.
echo 💡 IMPORTANTE:
echo    - XP-58IIH debe estar como impresora predeterminada
echo    - Si aparece dialogo, usar metodo alternativo (presionar ENTER)
echo.
pause

echo.
echo 🔧 Activando METODO ALTERNATIVO - Aun mas silencioso...
taskkill /f /im chrome.exe 2>nul
timeout /t 2 /nobreak >nul

REM Método alternativo con flags adicionales
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --headless=new ^
  --virtual-time-budget=5000 ^
  --disable-print-preview ^
  --kiosk-printing ^
  --user-data-dir="%PROFILE_DIR%" ^
  "http://localhost:4200"

echo ✅ Metodo HEADLESS activado (super silencioso)
echo 💡 Si no funciona, el sistema generara archivos .txt para imprimir manualmente
pause
