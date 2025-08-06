@echo off
echo =====================================================
echo    CONFIGURACION IMPRESION REMOTA DESDE RENDER
echo =====================================================
echo.
echo Este script configura tu PC para recibir tickets
echo de impresion desde Render y imprimirlos en XP-58
echo.

REM Verificar si ngrok está instalado
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ NGROK NO ENCONTRADO
    echo.
    echo Instalando ngrok...
    echo Descarga ngrok desde: https://ngrok.com/download
    echo.
    echo 1. Descarga ngrok.exe
    echo 2. Coloca ngrok.exe en esta carpeta
    echo 3. Ejecuta este script nuevamente
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok encontrado
echo.

REM Iniciar servidor de impresión local
echo 🖨️  Iniciando servidor de impresión local...
start "Servidor Impresión Local" node servidor-impresion-local.js

REM Esperar a que el servidor inicie
timeout /t 3 /nobreak >nul

REM Crear túnel público con ngrok
echo 🌐 Creando túnel público con ngrok...
echo.
echo IMPORTANTE: Copia la URL que aparece (algo como https://xxxxx.ngrok.io)
echo Esta URL debes agregarla como variable de entorno en Render:
echo LOCAL_PRINT_SERVER=https://xxxxx.ngrok.io/print
echo.
start "Ngrok Tunnel" ngrok http 3001

echo.
echo =====================================================
echo    CONFIGURACION COMPLETADA
echo =====================================================
echo.
echo 1. ✅ Servidor local ejecutándose en puerto 3001
echo 2. ✅ Túnel ngrok creado para acceso público
echo 3. 📝 Agrega la URL de ngrok a Render como:
echo    LOCAL_PRINT_SERVER=https://xxxxx.ngrok.io/print
echo.
echo MANTÉN AMBAS VENTANAS ABIERTAS PARA QUE FUNCIONE
echo.
pause
