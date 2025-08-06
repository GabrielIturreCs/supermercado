@echo off
echo ==========================================
echo    CONFIGURACION DE RED PARA IMPRESION
echo ==========================================
echo.
echo Esta es la informacion de red de tu PC:
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo IP Local: %%a
)

echo.
echo ==========================================
echo    PASOS PARA CONFIGURAR:
echo ==========================================
echo.
echo 1. ANOTA tu IP local (ejemplo: 192.168.1.100)
echo.
echo 2. EJECUTA: iniciar-servidor-impresion-local.bat
echo.
echo 3. MODIFICA el backend de Render para incluir tu IP:
echo    En el archivo: backend/src/routes/impresion.js
echo    Buscar: 'http://192.168.1.100:3001'
echo    Cambiar por tu IP real
echo.
echo 4. HACER git push para actualizar Render
echo.
echo 5. PROBAR desde cualquier PC usando la web de Render
echo.
pause
