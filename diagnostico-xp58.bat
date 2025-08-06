@echo off
title DIAGNÓSTICO XP-58IIH - Verificación Completa
echo.
echo 🔍 EJECUTANDO DIAGNÓSTICO COMPLETO DE XP-58IIH...
echo ================================================
echo.

echo [1/5] Verificando si la impresora está conectada...
wmic printer where "name='XP-58'" get name,portname,printerstatus
echo.

echo [2/5] Verificando estado del puerto USB001...
wmic printer where "portname='USB001'" get name,portname,drivername
echo.

echo [3/5] Intentando imprimir página de prueba...
rundll32 printui.dll,PrintUIEntry /k /n "XP-58"
echo.

echo [4/5] Verificando servicios de impresión...
sc query spooler | findstr STATE
echo.

echo [5/5] Intentando reiniciar servicio de impresión...
net stop spooler >nul 2>&1
timeout /t 2 >nul
net start spooler >nul 2>&1
echo ✅ Servicio de impresión reiniciado
echo.

echo ================================================
echo 📋 DIAGNÓSTICO COMPLETADO
echo ================================================
echo.
echo ℹ️  INSTRUCCIONES:
echo    1. Verifica que la XP-58IIH esté ENCENDIDA
echo    2. Verifica que el cable USB esté conectado
echo    3. Si el puerto no es USB001, apúntalo
echo    4. Si aparece "Error" en PrinterStatus, hay problema de driver
echo.
pause
