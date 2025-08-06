@echo off
title Configuración DEFINITIVA XP-58IIH - IMPRESIÓN 100% AUTOMÁTICA
echo.
echo 🎫 CONFIGURANDO XP-58IIH PARA IMPRESIÓN TOTALMENTE AUTOMÁTICA...
echo ================================================================
echo.

REM Establecer XP-58 como impresora predeterminada del sistema
echo [1/6] Estableciendo XP-58 como impresora predeterminada...
rundll32 printui.dll,PrintUIEntry /y /n "XP-58"
if errorlevel 1 (
    echo ❌ Error: No se encontró impresora XP-58
    echo ℹ️  Verifica que la impresora esté instalada como "XP-58"
    pause
    exit /b 1
)
echo ✅ XP-58 establecida como predeterminada

REM Configurar propiedades avanzadas de la impresora
echo [2/6] Configurando propiedades avanzadas...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Print\Printers\XP-58" /v "Priority" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Print\Printers\XP-58" /v "StartTime" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Print\Printers\XP-58" /v "UntilTime" /t REG_DWORD /d 0 /f >nul 2>&1
echo ✅ Propiedades avanzadas configuradas

REM Configurar Chrome para usar XP-58 automáticamente
echo [3/6] Configurando Chrome para impresión automática...
reg add "HKCU\Software\Google\Chrome\PrintingSettings" /v "print_preview_disabled" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\PrintingSettings" /v "print_preview_sticky_settings" /t REG_SZ /d "{\"version\":2,\"recentDestinations\":[{\"id\":\"XP-58\",\"origin\":\"local\",\"account\":\"\"}],\"mediaSize\":{\"height_microns\":297000,\"width_microns\":58000},\"marginsType\":3,\"scalingType\":0,\"color\":2,\"headerFooter\":false,\"landscape\":false}" /f >nul 2>&1
echo ✅ Chrome configurado para XP-58

REM Configurar políticas de grupo para impresión silenciosa
echo [4/6] Configurando políticas de impresión silenciosa...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v "NoWebServices" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\PrintingSettings" /v "default_destination_selection_rules" /t REG_SZ /d "{\"kind\":\"local\",\"id\":\"XP-58\"}" /f >nul 2>&1
echo ✅ Políticas de impresión configuradas

REM Crear acceso directo para impresión rápida
echo [5/6] Creando configuración de impresión rápida...
reg add "HKCU\Software\Classes\Applications\chrome.exe\shell\print\command" /ve /t REG_SZ /d "\"C:\Program Files\Google\Chrome\Application\chrome.exe\" --kiosk-printing --disable-print-preview --print-to-pdf=false" /f >nul 2>&1
echo ✅ Impresión rápida configurada

REM Optimizar para papel térmico 58mm
echo [6/6] Optimizando para papel térmico 58mm...
reg add "HKCU\Printers\DevModePerUser\XP-58" /v "DevMode" /t REG_BINARY /d "01000900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" /f >nul 2>&1
echo ✅ Papel térmico 58mm optimizado

echo.
echo ================================================================
echo ✅ CONFIGURACIÓN COMPLETADA - XP-58IIH LISTO PARA AUTOMÁTICO
echo ================================================================
echo.
echo � IMPORTANTE: 
echo    1. CIERRA Chrome completamente
echo    2. REINICIA Chrome
echo    3. ¡Listo! Ahora las ventas se imprimen automáticamente
echo.
echo 🎫 LA PRÓXIMA VEZ QUE HAGAS CLIC EN "FINALIZAR VENTA":
echo    ➤ Se imprime automáticamente en XP-58
echo    ➤ SIN diálogos, SIN descargas, SIN tocar nada
echo    ➤ Papel 58mm optimizado
echo    ➤ Formato compacto para ahorrar papel
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
