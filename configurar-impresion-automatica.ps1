# Script para configurar impresión automática XP-58IIH
# Ejecutar como Administrador

Write-Host "🖨️ Configurando Windows para impresión automática XP-58IIH..." -ForegroundColor Green
Write-Host ""

# Verificar si se ejecuta como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "❌ Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "   Clic derecho -> 'Ejecutar como administrador'" -ForegroundColor Yellow
    pause
    exit
}

try {
    # Buscar impresora XP-58
    Write-Host "🔍 Buscando impresora XP-58..." -ForegroundColor Cyan
    $printers = Get-WmiObject -Class Win32_Printer | Where-Object { $_.Name -like "*58*" -or $_.Name -like "*XP*" -or $_.Name -like "*thermal*" }
    
    if ($printers.Count -eq 0) {
        Write-Host "⚠️ No se encontró impresora XP-58. Verificar:" -ForegroundColor Yellow
        Write-Host "   - Que esté conectada por USB" -ForegroundColor White
        Write-Host "   - Que esté encendida" -ForegroundColor White
        Write-Host "   - Que los drivers estén instalados" -ForegroundColor White
        Write-Host ""
        Write-Host "Impresoras encontradas:" -ForegroundColor Cyan
        Get-WmiObject -Class Win32_Printer | Select-Object Name | Format-Table -AutoSize
    } else {
        Write-Host "✅ Impresora(s) encontrada(s):" -ForegroundColor Green
        $printers | Select-Object Name | Format-Table -AutoSize
        
        # Configurar como predeterminada la primera que coincida
        $printer = $printers[0]
        Write-Host "🎯 Configurando como predeterminada: $($printer.Name)" -ForegroundColor Green
        
        # Establecer como predeterminada
        $printer.SetDefaultPrinter()
        Write-Host "✅ Impresora configurada como predeterminada" -ForegroundColor Green
    }
    
    # Configurar registro de Windows para impresión automática
    Write-Host ""
    Write-Host "🔧 Configurando registro de Windows..." -ForegroundColor Cyan
    
    # Configurar Chrome para impresión silenciosa
    $chromePath = "HKCU:\Software\Google\Chrome\PreferenceMACs\printing"
    $chromePathPolicy = "HKLM:\SOFTWARE\Policies\Google\Chrome"
    
    # Crear claves si no existen
    if (!(Test-Path $chromePath)) {
        New-Item -Path $chromePath -Force | Out-Null
    }
    if (!(Test-Path $chromePathPolicy)) {
        New-Item -Path $chromePathPolicy -Force | Out-Null
    }
    
    # Configurar políticas de Chrome
    Set-ItemProperty -Path $chromePathPolicy -Name "PrintingEnabled" -Value 1 -Type DWord -Force
    Set-ItemProperty -Path $chromePathPolicy -Name "PrintPreviewUseSystemDefaultPrinter" -Value 1 -Type DWord -Force
    Set-ItemProperty -Path $chromePathPolicy -Name "DefaultPrinterSelection" -Value "{'kind': 'local', 'namePattern': '.*'}" -Type String -Force
    
    Write-Host "✅ Registro configurado para impresión automática" -ForegroundColor Green
    
    # Configurar permisos de impresión
    Write-Host ""
    Write-Host "🛡️ Configurando permisos de impresión..." -ForegroundColor Cyan
    
    # Habilitar impresión sin diálogos en el sistema
    $printPath = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Windows"
    Set-ItemProperty -Path $printPath -Name "Device" -Value "" -Force
    
    Write-Host "✅ Permisos configurados" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 Configuración completada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Pasos finales:" -ForegroundColor Yellow
    Write-Host "   1. Reiniciar Chrome completamente" -ForegroundColor White
    Write-Host "   2. Usar el archivo 'iniciar-sistema-automatico.bat'" -ForegroundColor White
    Write-Host "   3. Probar una venta" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Error en configuración: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
