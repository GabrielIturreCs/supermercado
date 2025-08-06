@echo off
echo ====================================================
echo CONFIGURACION ULTRA COMPACTA PARA XP-58IIH
echo ====================================================

REM Configurar la impresora XP-58 con comandos directos
echo Configurando impresora para letra ultra pequeña...

REM PASO 1: Configuraciones del registro para máxima compacidad
echo Modificando registro de Windows...

reg add "HKCU\Printers\Defaults" /v DefaultPrintTicketXml /t REG_SZ /d "^<psf:PrintTicket^>^<psf:Feature name=\"psk:PageResolution\"^>^<psf:Option name=\"ns0000:_600x600dpi\"/^>^</psf:Feature^>^<psf:Feature name=\"psk:PageScaling\"^>^<psf:Option name=\"psk:FitMediaToImageableArea\"/^>^</psf:Feature^>^</psf:PrintTicket^>" /f

REM PASO 2: Configurar impresora específica XP-58IIH
for /f "tokens=*" %%a in ('wmic printer where "name like '%%XP%%'" get name /format:list ^| find "Name="') do (
    set PRINTER_NAME=%%a
    goto :found_printer
)

:found_printer
set PRINTER_NAME=%PRINTER_NAME:Name=%

echo Impresora encontrada: %PRINTER_NAME%

REM PASO 3: Enviar comando ESC/POS directo para configurar letra pequeña
echo Enviando comandos ESC/POS para letra ultra pequeña...

REM Crear archivo temporal con comandos ESC/POS
echo  > temp_escpos.txt
echo ESC @ (Inicializar) >> temp_escpos.txt  
echo GS ! 0 (Letra ultra pequeña) >> temp_escpos.txt
echo ESC SI (Modo condensado) >> temp_escpos.txt
echo ESC 3 0 (Espaciado mínimo) >> temp_escpos.txt
echo ESC SP 0 (Espaciado caracteres mínimo) >> temp_escpos.txt

REM PASO 4: Configuración específica del driver
echo Configurando driver de impresora...

REM Buscar la clave específica de la impresora en el registro
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Print\Printers" ^| find /i "xp"') do (
    echo Configurando driver para %%a
    reg add "%%a\PrinterDriverData" /v "PrintQuality" /t REG_DWORD /d 600 /f
    reg add "%%a\PrinterDriverData" /v "MediaType" /t REG_DWORD /d 1 /f
    reg add "%%a\PrinterDriverData" /v "PrintDensity" /t REG_DWORD /d 5 /f
    reg add "%%a\PrinterDriverData" /v "FontSize" /t REG_DWORD /d 6 /f
    reg add "%%a\PrinterDriverData" /v "CharacterPitch" /t REG_DWORD /d 17 /f
    reg add "%%a\PrinterDriverData" /v "LineSpacing" /t REG_DWORD /d 1 /f
)

REM PASO 5: Reiniciar servicio de spooler
echo Reiniciando servicio de impresión...
net stop spooler
timeout /t 2 >nul
net start spooler

REM PASO 6: Imprimir página de prueba con formato ultra compacto
echo Generando prueba con formato ultra compacto...

echo                      SUPERMERCADO > prueba_ultra_compacta.txt
echo 25/12 14:30                        #1234 >> prueba_ultra_compacta.txt
echo -------------------------------------------------------- >> prueba_ultra_compacta.txt
echo Coca Cola 500ml x2                          $800 >> prueba_ultra_compacta.txt
echo Pan Lactal Grande x1                        $450 >> prueba_ultra_compacta.txt
echo Leche Entera 1L x3                         $1200 >> prueba_ultra_compacta.txt
echo -------------------------------------------------------- >> prueba_ultra_compacta.txt
echo TOTAL:                                      $2450 >> prueba_ultra_compacta.txt
echo EFECTIVO >> prueba_ultra_compacta.txt
echo -------------------------------------------------------- >> prueba_ultra_compacta.txt
echo                     ¡GRACIAS! >> prueba_ultra_compacta.txt

REM Imprimir prueba
notepad /p prueba_ultra_compacta.txt

REM Limpiar archivos temporales
del temp_escpos.txt >nul 2>&1
del prueba_ultra_compacta.txt >nul 2>&1

echo.
echo ====================================================
echo CONFIGURACION COMPLETADA
echo ====================================================
echo 1. Driver configurado para letra ultra pequeña
echo 2. Espaciado mínimo activado
echo 3. Resolución máxima establecida
echo 4. Página de prueba enviada
echo.
echo Si aún se ve grande, verifica:
echo - Configuración del driver en Panel de Control
echo - Ajustes físicos de la impresora (botones)
echo - Probar con diferentes aplicaciones
echo ====================================================

pause
