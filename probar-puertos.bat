@echo off
echo ====================================================
echo PROBANDO PUERTOS DE IMPRESION DIRECTA RAW
echo ====================================================

REM Crear archivo de prueba simple
echo PRUEBA FORMATO RAW > prueba_puerto.txt
echo Letra pequeña directa >> prueba_puerto.txt
echo 12345678901234567890 >> prueba_puerto.txt
echo ==================== >> prueba_puerto.txt

echo Probando USB001...
copy /b prueba_puerto.txt USB001: >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ USB001 FUNCIONA
) else (
    echo ❌ USB001 no disponible
)

echo Probando USB002...
copy /b prueba_puerto.txt USB002: >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ USB002 FUNCIONA  
) else (
    echo ❌ USB002 no disponible
)

echo Probando LPT1...
copy /b prueba_puerto.txt LPT1: >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ LPT1 FUNCIONA
) else (
    echo ❌ LPT1 no disponible
)

REM Probar con nombre de impresora directa
echo Probando impresora XP-58 directa...
copy /b prueba_puerto.txt "\\localhost\XP-58" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ XP-58 DIRECTA FUNCIONA
) else (
    echo ❌ XP-58 directa no disponible
)

REM Limpiar
del prueba_puerto.txt >nul 2>&1

echo ====================================================
echo Si algún puerto imprimió, ese es el correcto para RAW
echo ====================================================
pause
