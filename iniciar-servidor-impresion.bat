@echo off
title Servidor de Impresión XP-58IIH - IMPRESIÓN AUTOMÁTICA
cls
echo.
echo 🖨️  ========================================
echo 🖨️  INICIANDO SERVIDOR DE IMPRESIÓN XP-58IIH
echo 🖨️  ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo 📋 SOLUCIÓN:
    echo    1. Descarga Node.js desde: https://nodejs.org
    echo    2. Instala Node.js
    echo    3. Reinicia esta ventana
    echo.
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm init -y >nul 2>&1
    npm install express >nul 2>&1
    echo ✅ Dependencias instaladas
    echo.
)

echo 🚀 Iniciando servidor de impresión...
echo.
echo ⚠️  IMPORTANTE: 
echo    - Mantén esta ventana ABIERTA mientras uses el sistema
echo    - Cada venta se imprimirá AUTOMÁTICAMENTE en XP-58IIH
echo    - NO cierres esta ventana hasta terminar de trabajar
echo.
echo ================================================================
echo.

REM Iniciar el servidor
node servidor-impresion.js

echo.
echo 🛑 Servidor de impresión detenido
pause
