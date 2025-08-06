@echo off
title BACKEND COMPLETO CON IMPRESIÓN INTEGRADA
echo.
echo 🚀 INICIANDO BACKEND COMPLETO...
echo =====================================
echo.

cd /d "%~dp0backend"

echo 📡 Puerto 3000 - Backend principal
echo 🖨️  Impresión integrada en /api/impresion  
echo 🔗 Endpoints disponibles:
echo    ➤ POST /api/impresion/58mm-auto
echo    ➤ GET /api/impresion/status
echo.

echo ✅ Iniciando servidor...
node index.js

echo.
echo Presiona cualquier tecla para continuar...
pause >nul
