@echo off
echo ==========================================
echo    INICIANDO SERVIDOR DE IMPRESION LOCAL
echo ==========================================
echo.
echo Este servidor permite imprimir desde Render
echo a tu impresora local XP-58
echo.
echo Instrucciones:
echo 1. Asegurate que la impresora XP-58 este conectada
echo 2. Este servidor se ejecutara en puerto 3001
echo 3. Configurar IP de esta PC en el backend de Render
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

cd /d "%~dp0"
node servidor-impresion-local.js

pause
