const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🖨️  SERVIDOR DE IMPRESIÓN LOCAL INICIANDO...');
console.log('🎯 Este servidor recibe tickets de Render e imprime en XP-58');

/**
 * Envío directo con PowerShell - IGUAL QUE EL BACKEND PRINCIPAL
 */
async function enviarConPowerShellDirecto(contenido) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `local_print_${Date.now()}.txt`);
    
    try {
      fs.writeFileSync(tempFile, contenido, 'binary');
      
      console.log('🔥 IMPRIMIENDO DESDE SERVIDOR LOCAL');
      console.log('📄 Archivo temporal:', tempFile);
      
      const psScript = `
        try {
          $bytes = [System.IO.File]::ReadAllBytes("${tempFile.replace(/\\/g, '\\\\')}")
          
          try {
            $port = New-Object System.IO.Ports.SerialPort("COM1", 9600)
            $port.Open()
            $port.Write($bytes, 0, $bytes.Length)
            $port.Close()
            Write-Output "SUCCESS:COM1"
            exit 0
          } catch {
            try {
              Add-Type -AssemblyName System.Drawing
              Add-Type -AssemblyName System.Windows.Forms
              
              $printDoc = New-Object System.Drawing.Printing.PrintDocument
              $printDoc.PrinterSettings.PrinterName = "XP-58"
              $printDoc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)
              
              $printDoc.add_PrintPage({
                param($sender, $e)
                $content = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($bytes)
                $font = New-Object System.Drawing.Font("Courier New", 8)
                $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
                $e.Graphics.DrawString($content, $font, $brush, 0, 0)
                $e.HasMorePages = $false
              })
              
              $printDoc.Print()
              Write-Output "SUCCESS:PrintDocument"
              exit 0
              
            } catch {
              try {
                Copy-Item "${tempFile.replace(/\\/g, '\\\\')}" -Destination "\\\\localhost\\XP-58" -Force
                Write-Output "SUCCESS:Copy"
                exit 0
              } catch {
                Write-Output "ERROR:Todos los métodos fallaron"
                exit 1
              }
            }
          }
        } catch {
          Write-Output "ERROR:$($_.Exception.Message)"
          exit 1
        }
      `;
      
      const child = spawn('powershell', ['-Command', psScript], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
        
        console.log('📤 PowerShell Local Output:', output.trim());
        if (errorOutput) console.log('⚠️  PowerShell Local Error:', errorOutput.trim());
        
        if (code === 0 && output.includes('SUCCESS:')) {
          const method = output.replace('SUCCESS:', '').trim();
          console.log(`✅ IMPRESO LOCALMENTE: ${method}`);
          resolve({ success: true, method: `Local-${method}` });
        } else {
          console.log('❌ Impresión local falló');
          reject(new Error(`Impresión local falló: ${output || errorOutput}`));
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * ENDPOINT PARA RECIBIR TICKETS DE RENDER
 */
app.post('/print', async (req, res) => {
  try {
    const { ticket, venta, items, timestamp } = req.body;
    
    console.log('📡 =================================================');
    console.log('📡 TICKET RECIBIDO DESDE RENDER PARA IMPRESIÓN');
    console.log('📡 =================================================');
    console.log('📋 Datos:', { 
      venta: !!venta, 
      items: items?.length || 0, 
      ticketLength: ticket?.length || 0,
      timestamp 
    });
    
    if (!ticket) {
      return res.status(400).json({
        success: false,
        error: 'Ticket requerido para impresión'
      });
    }
    
    console.log('🖨️  INICIANDO IMPRESIÓN LOCAL DESDE RENDER...');
    
    try {
      const resultado = await enviarConPowerShellDirecto(ticket);
      
      console.log('✅ TICKET IMPRESO LOCALMENTE DESDE RENDER');
      console.log(`🎯 Método: ${resultado.method}`);
      
      const successResponse = {
        success: true,
        message: `Ticket impreso localmente desde Render - ${resultado.method}`,
        method: resultado.method,
        servidor: 'Local Print Server',
        timestamp: new Date().toISOString(),
        renderPrint: true
      };
      
      res.json(successResponse);
      
    } catch (printError) {
      console.error('❌ ERROR IMPRESIÓN LOCAL:', printError.message);
      
      res.status(500).json({
        success: false,
        error: 'Error en impresión local',
        details: printError.message,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ ERROR SERVIDOR LOCAL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno servidor local',
      details: error.message
    });
  }
});

/**
 * ENDPOINT DE ESTADO
 */
app.get('/status', (req, res) => {
  res.json({
    servicio: 'Servidor de Impresión Local para Render',
    estado: 'Activo ✅',
    puerto: PORT,
    plataforma: process.platform,
    proposito: 'Recibir tickets de Render e imprimir en XP-58 local',
    endpoints: [
      'POST /print - Recibir e imprimir ticket',
      'GET /status - Estado del servidor'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * INICIAR SERVIDOR
 */
app.listen(PORT, () => {
  console.log('🚀 =================================================');
  console.log('🚀 SERVIDOR DE IMPRESIÓN LOCAL INICIADO');
  console.log('🚀 =================================================');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('🖨️  Listo para recibir tickets de Render');
  console.log('🎯 Render puede enviar a: http://localhost:3001/print');
  console.log('⚠️  IMPORTANTE: Mantén este servidor ejecutándose');
  console.log('⚠️  para que Render pueda imprimir en tu XP-58');
  console.log('🚀 =================================================');
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
