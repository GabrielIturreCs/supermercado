@echo off
title FORZAR LETRA PEQUEÑA XP-58IIH - MÉTODO DIRECTO
echo.
echo 🔥 FORZANDO CONFIGURACIÓN ULTRA COMPACTA...
echo ==================================================

REM PASO 1: Configurar XP-58 específicamente para letra pequeña
echo [1/4] Configurando driver específico...

REM Abrir propiedades de impresora directamente
echo Abriendo configuración de impresora...
rundll32 printui.dll,PrintUIEntry /p /n "XP-58"

echo.
echo 🎯 INSTRUCCIONES MANUALES:
echo ==================================================
echo 1. En la ventana que se abrió:
echo    - Haz clic en "Preferencias de impresión"
echo    - Busca "Calidad de impresión" → Selecciona "Borrador" o "Rápido"
echo    - Busca "Papel" o "Tamaño" → Selecciona el más pequeño disponible
echo    - Busca "Escala" → Cambia a 50% o el mínimo
echo    - Busca "Márgenes" → Ponlos en 0 o mínimo
echo.
echo 2. Si hay pestaña "Configuración avanzada":
echo    - Densidad de impresión: Máxima
echo    - Velocidad: Rápida
echo    - Caracteres por pulgada: 17 CPI o el máximo
echo.
echo 3. Haz clic en "Aplicar" y "OK"
echo.
echo ⚠️  IMPORTANTE: Deja esta ventana abierta y configura manualmente
echo    La configuración automática no funciona para todas las impresoras
echo.

pause

REM PASO 2: Crear test con caracteres específicos
echo [2/4] Creando archivo de prueba optimizado...

echo ================== SUPERMERCADO ================== > test_compacto.txt
echo 05/08 15:30                                    #1234 >> test_compacto.txt
echo ================================================== >> test_compacto.txt
echo Coca Cola 500ml x2                          $1600 >> test_compacto.txt
echo Pan Lactal Grande x1                         $450 >> test_compacto.txt
echo Leche Entera 1L x3                         $1200 >> test_compacto.txt
echo ================================================== >> test_compacto.txt
echo TOTAL:                                      $3250 >> test_compacto.txt
echo EFECTIVO >> test_compacto.txt
echo ================================================== >> test_compacto.txt
echo                    GRACIAS                        >> test_compacto.txt

REM PASO 3: Imprimir prueba
echo [3/4] Imprimiendo archivo de prueba...
notepad /p test_compacto.txt

REM PASO 4: Verificar resultado
echo [4/4] Verificando resultado...
echo.
echo 🔍 VERIFICA LA IMPRESIÓN:
echo ==================================================
echo ✅ Si salió MUY compacto: ¡Perfecto! Ya está configurado
echo ❌ Si salió igual de grande: Necesitamos otro método
echo.
echo 💡 Si la letra sigue grande, vamos a:
echo    1. Usar comando ESC/POS directo
echo    2. Cambiar driver de impresora
echo    3. Usar software específico de impresión térmica
echo.

set /p resultado="¿La impresión salió compacta? (s/n): "

if /i "%resultado%"=="s" (
    echo ✅ ¡EXCELENTE! La configuración funcionó
    echo    Ahora las ventas se imprimirán compactas
) else (
    echo ❌ La configuración manual no funcionó
    echo    Presiona cualquier tecla para probar método ESC/POS...
    pause >nul
    
    REM Crear archivo con comandos ESC/POS puros
    echo [EXTRA] Creando comandos ESC/POS directos...
    
    REM ESC/POS: Inicializar + letra pequeña + condensado
    echo|set /p="^[^@^[^!^0^[^SI" > escpos_test.txt
    echo                SUPERMERCADO >> escpos_test.txt
    echo 05/08 15:30              #1234 >> escpos_test.txt
    echo ============================= >> escpos_test.txt
    echo Coca Cola 500ml x2      $1600 >> escpos_test.txt
    echo Pan Lactal x1            $450 >> escpos_test.txt
    echo ============================= >> escpos_test.txt
    echo TOTAL:                  $2050 >> escpos_test.txt
    echo ============================= >> escpos_test.txt
    echo|set /p="^[^d^3" >> escpos_test.txt
    
    echo Enviando comandos ESC/POS directos...
    copy /b escpos_test.txt con >nul 2>&1
    
    del escpos_test.txt >nul 2>&1
)

REM Limpiar
del test_compacto.txt >nul 2>&1

echo.
echo ====================================================
echo 🎯 CONFIGURACIÓN MANUAL COMPLETADA
echo ====================================================
echo Si la impresión sigue grande, el problema está en:
echo 1. Driver de la impresora (necesita actualización)
echo 2. Firmware de la XP-58IIH
echo 3. Puerto de conexión (USB vs Serie)
echo.
pause
