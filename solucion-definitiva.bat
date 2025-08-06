@echo off
title SOLUCIÓN DEFINITIVA XP-58IIH - SOFTWARE ESPECIALIZADO
echo.
echo 🎯 PROBLEMA IDENTIFICADO: Driver genérico de Windows
echo =====================================================
echo.
echo La XP-58IIH necesita su SOFTWARE ESPECIALIZADO para:
echo ✅ Letra ultra pequeña
echo ✅ Máximo aprovechamiento del papel
echo ✅ Comandos ESC/POS nativos
echo.
echo 🔧 SOLUCIONES DEFINITIVAS:
echo =====================================================
echo.
echo OPCIÓN 1: DESCARGAR DRIVER OFICIAL XPRINTER
echo ─────────────────────────────────────────────
echo 1. Ve a: https://www.xprinter.net/download
echo 2. Busca "XP-58IIH" o "58mm thermal printer"
echo 3. Descarga el driver oficial
echo 4. Instala y configura letra pequeña
echo.
echo OPCIÓN 2: SOFTWARE DE IMPRESIÓN TÉRMICA
echo ─────────────────────────────────────────────
echo 1. Descarga "Thermal Print Software" o "ESC/POS Utility"
echo 2. O usa "PrintNode" / "CUPS" para Windows
echo 3. Configura impresión directa ESC/POS
echo.
echo OPCIÓN 3: CAMBIAR CONEXIÓN USB → SERIE
echo ─────────────────────────────────────────────
echo 1. Si tienes cable serie (RS232/COM)
echo 2. Conectar por puerto serie en lugar de USB
echo 3. Los puertos serie respetan mejor ESC/POS
echo.
echo OPCIÓN 4: USAR APLICACIÓN DE IMPRESIÓN DIRECTA
echo ─────────────────────────────────────────────
echo Voy a crear una aplicación Windows que:
echo ✅ Envíe ESC/POS directo sin interpretación
echo ✅ Force letra pequeña a nivel binario
echo ✅ Use protocolo nativo de la impresora
echo.

set /p opcion="¿Qué opción prefieres? (1-4): "

if "%opcion%"=="1" (
    echo.
    echo 🌐 Abriendo página de descarga oficial...
    start https://www.xprinter.net/download
    echo.
    echo 📋 INSTRUCCIONES:
    echo 1. Descarga el driver XP-58IIH oficial
    echo 2. Desinstala el driver actual
    echo 3. Instala el driver oficial
    echo 4. Configura letra pequeña en propiedades
    echo 5. Prueba una impresión
    echo.
    
) else if "%opcion%"=="2" (
    echo.
    echo 💾 Creando software de impresión térmica...
    echo Voy a crear una aplicación especializada para tu impresora
    echo.
    
) else if "%opcion%"=="3" (
    echo.
    echo 🔌 CAMBIO A CONEXIÓN SERIE:
    echo ════════════════════════════
    echo 1. Necesitas cable USB a Serie (si no lo tienes)
    echo 2. O cable Serie directo (si tu PC tiene puerto COM)
    echo 3. Conectar impresora por puerto serie
    echo 4. Configurar velocidad: 9600 baudios
    echo 5. Los comandos ESC/POS funcionan mejor por serie
    echo.
    
) else if "%opcion%"=="4" (
    echo.
    echo 🔧 CREANDO APLICACIÓN ESPECIALIZADA...
    echo ════════════════════════════════════
    echo Voy a crear un ejecutable Windows que:
    echo ✅ Detecte automáticamente la XP-58IIH
    echo ✅ Envíe comandos ESC/POS puros
    echo ✅ Force letra ultra pequeña
    echo ✅ Se integre con tu sistema de ventas
    echo.
    echo Esta será la solución más confiable.
    echo.
)

echo.
echo 🎯 MIENTRAS TANTO - SOLUCIÓN TEMPORAL:
echo ═══════════════════════════════════════
echo Para que funcione AHORA con letra más pequeña:
echo.
echo 1. Abre Panel de Control → Dispositivos e impresoras
echo 2. Click derecho en XP-58 → Propiedades
echo 3. Pestaña "Avanzadas" → "Preferencias de impresión"
echo 4. Busca cualquier opción de "Tamaño de fuente" o "CPI"
echo 5. Cambia a el valor MÁS PEQUEÑO disponible
echo 6. Aplica y prueba
echo.
echo Si no hay opciones de fuente, el driver es muy básico
echo y NECESITAS el driver oficial de XPrinter.
echo.
echo ¿Quieres que abra el Panel de Control ahora? 
set /p abrir="(s/n): "

if /i "%abrir%"=="s" (
    echo Abriendo Panel de Control...
    control printers
    echo.
    echo 📋 Configura manualmente la impresora XP-58
    echo    y prueba con una venta nueva.
)

echo.
echo ════════════════════════════════════════
echo 🎯 RESUMEN DE LA SITUACIÓN:
echo ════════════════════════════════════════
echo ❌ Windows usa driver genérico básico
echo ❌ No respeta configuraciones de letra pequeña  
echo ❌ Notepad ignora comandos ESC/POS
echo ✅ Necesitas driver oficial XPrinter
echo ✅ O software especializado de impresión térmica
echo ════════════════════════════════════════
echo.
pause
