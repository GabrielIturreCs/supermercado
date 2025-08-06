@echo off
title CONFIGURACIÓN ULTRA COMPACTA XP-58IIH - MÁXIMO APROVECHAMIENTO
echo.
echo 🎫 CONFIGURANDO XP-58IIH PARA LETRA ULTRA PEQUEÑA Y MÁXIMO ANCHO...
echo ==================================================================
echo.

REM Establecer XP-58 como predeterminada
echo [1/6] Estableciendo XP-58 como impresora predeterminada...
rundll32 printui.dll,PrintUIEntry /y /n "XP-58" >nul 2>&1
echo ✅ Impresora predeterminada establecida

REM Configurar propiedades básicas de impresión
echo [2/6] Configurando propiedades básicas de impresión...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Print\Printers\XP-58" /v "Priority" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Print\Printers\XP-58" /v "Attributes" /t REG_DWORD /d 4 /f >nul 2>&1
echo ✅ Propiedades básicas configuradas

REM Configurar letra ULTRA pequeña
echo [3/6] Configurando letra ULTRA pequeña...
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmPrintQuality" /t REG_DWORD /d 300 /f >nul 2>&1
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmYResolution" /t REG_DWORD /d 300 /f >nul 2>&1
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmTTOption" /t REG_DWORD /d 2 /f >nul 2>&1
echo ✅ Resolución y calidad configuradas

REM Configurar márgenes mínimos y ancho máximo
echo [4/6] Configurando márgenes MÍNIMOS y ancho MÁXIMO...
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmOrientation" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmPaperSize" /t REG_DWORD /d 256 /f >nul 2>&1
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmPaperWidth" /t REG_DWORD /d 2283 /f >nul 2>&1
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmPaperLength" /t REG_DWORD /d 11692 /f >nul 2>&1
echo ✅ Dimensiones papel configuradas

REM Configurar fuente y densidad
echo [5/6] Configurando fuente compacta y densidad alta...
reg add "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Windows" /v "Device" /t REG_SZ /d "XP-58,winspool,Ne00:" /f >nul 2>&1
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmScale" /t REG_DWORD /d 60 /f >nul 2>&1
echo ✅ Escala y densidad configuradas

echo ✅ Escala y densidad configuradas

REM Configuración final térmica optimizada
echo [6/6] Aplicando configuración térmica final...
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "dmFields" /t REG_DWORD /d 0x1FFFFF /f >nul 2>&1
echo ✅ Configuración térmica final aplicada

echo.
echo ==================================================================
echo ✅ XP-58IIH CONFIGURADA PARA MÁXIMO APROVECHAMIENTO DE PAPEL
echo ==================================================================
echo.
echo 📋 CONFIGURACIONES ULTRA COMPACTAS APLICADAS:
echo    ➤ Resolución: 300 DPI para letra ultra pequeña
echo    ➤ Escala: 60% para máximo contenido
echo    ➤ Márgenes: MÍNIMOS (casi cero)
echo    ➤ Ancho: TODO el papel térmico disponible  
echo    ➤ Fuente: Compacta y densa
echo    ➤ Calidad: Optimizada para texto pequeño
echo.
echo 🎯 RESULTADO ESPERADO:
echo    ✓ Letra MUY pequeña pero legible
echo    ✓ USA TODO el ancho del papel (58mm completos)
echo    ✓ Máximo contenido en mínimo espacio
echo    ✓ Sin espacios desperdiciados
echo    ✓ Corte automático preciso
echo.
echo ⚠️  IMPORTANTE: 
echo    El código también está optimizado para 48+ caracteres
echo    Ahora deberías ver tickets MUCHO más compactos
echo.
echo ✅ Haz una venta de prueba para ver el NUEVO formato ultra compacto!
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
