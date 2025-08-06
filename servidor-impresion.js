const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { ESC_POS_COMMANDS, generarTicketESCPOS } = require('./escpos-config.js');
const { generarTicketRAW, imprimirDirectoRAW, imprimirConNotepadCompacto } = require('./impresion-raw.js');
const { imprimirPorNombreImpresora } = require('./imprimir-directo.js');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

/**
 * Endpoint para imprimir directo en XP-58IIH
 */
app.post('/print', (req, res) => {
  try {
    const { content, printer = 'XP-58' } = req.body;
    
    console.log('🎫 Recibida petición de impresión para:', printer);
    
    // Crear archivo temporal
    const tempFile = path.join(os.tmpdir(), `ticket_${Date.now()}.txt`);
    
    // Escribir contenido del ticket
    fs.writeFileSync(tempFile, content, 'utf8');
    
    // Comando para imprimir directo
    const printCommand = `print /d:"${printer}" "${tempFile}"`;
    
    // Ejecutar múltiples métodos de impresión
    imprimirConMultiplesMetodos(tempFile, printer, content)
      .then(resultado => {
        // Limpiar archivo temporal
        try { fs.unlinkSync(tempFile); } catch (e) {}
        
        console.log('✅ Impresión exitosa:', printer);
        res.json(resultado);
      })
      .catch(error => {
        // Limpiar archivo temporal
        try { fs.unlinkSync(tempFile); } catch (e) {}
        
        console.error('❌ Error en todos los métodos:', error.message);
        res.status(500).json({ 
          success: false, 
          error: 'Error en impresión',
          message: error.message 
        });
      });
    
  } catch (error) {
    console.error('Error procesando impresión:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

/**
 * NUEVO: Endpoint 58mm automático SIN diálogos
 */
app.post('/imprimir-58mm-auto', (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 AUTOMÁTICO 58MM: Procesando ticket...');
    
    // Generar ticket en formato RAW binario (máximo control)
    const ticketRAW = generarTicketRAW(venta, items);
    
    console.log('� Ticket RAW binario generado - Sin interpretación Windows');
    
    // IMPRESIÓN DIRECTA RAW BINARIA (control total del formato)
    imprimirDirectoRAW(ticketRAW, 'USB001')
      .then(resultado => {
        console.log('✅ TICKET RAW BINARIO ENVIADO - Formato exacto');
        res.json({ 
          success: true, 
          message: 'Ticket impreso con formato RAW exacto',
          method: 'RAW Binary Direct' 
        });
      })
      .catch(error => {
        console.error('❌ Error en impresión RAW, probando USB002...');
        
        // Intentar con USB002
        imprimirDirectoRAW(ticketRAW, 'USB002')
          .then(resultado => {
            console.log('✅ TICKET RAW ENVIADO (USB002)');
            res.json({ success: true, message: 'Ticket impreso (USB002)' });
          })
          .catch(error2 => {
            console.error('❌ Error en USB002, probando LPT1...');
            
            // Intentar con LPT1
            imprimirDirectoRAW(ticketRAW, 'LPT1')
              .then(resultado => {
                console.log('✅ TICKET RAW ENVIADO (LPT1)');
                res.json({ success: true, message: 'Ticket impreso (LPT1)' });
              })
              .catch(error3 => {
                console.error('❌ RAW falló en todos los puertos, usando notepad compacto...');
                
                // ÚLTIMO RECURSO: Notepad con formato ultra compacto
                imprimirConNotepadCompacto(venta, items)
                  .then(resultado => {
                    console.log('✅ TICKET NOTEPAD COMPACTO ENVIADO');
                    res.json({ success: true, message: 'Ticket impreso (formato compacto)' });
                  })
                  .catch(error4 => {
                    console.error('❌ Error en todos los métodos:', error4);
                    res.status(500).json({ success: false, error: 'Error en impresión compacta' });
                  });
              });
          });
      });
    
  } catch (error) {
    console.error('❌ Error en endpoint automático:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint de salud
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de impresión XP-58IIH funcionando',
    timestamp: new Date().toISOString()
  });
});

/**
 * Imprimir directamente con comandos ESC/POS RAW
 */
async function imprimirDirectoESCPOS(contenidoRaw, printerName) {
  return new Promise((resolve, reject) => {
    // Crear archivo temporal con contenido ESC/POS
    const tempFile = path.join(os.tmpdir(), `escpos-${Date.now()}.txt`);
    
    try {
      // Escribir contenido RAW (incluyendo códigos ESC/POS)
      fs.writeFileSync(tempFile, contenidoRaw, 'binary');
      
      // Comando para imprimir RAW sin interpretación
      const rawPrintCommand = `copy /b "${tempFile}" "${printerName}"`;
      
      console.log('🖨️ IMPRESIÓN RAW ESC/POS:', rawPrintCommand);
      
      exec(rawPrintCommand, (error, stdout, stderr) => {
        // Limpiar archivo temporal
        try { fs.unlinkSync(tempFile); } catch (e) {}
        
        if (error) {
          console.error('❌ Error en impresión RAW:', error.message);
          reject(new Error(`Error impresión RAW: ${error.message}`));
        } else {
          console.log('✅ Impresión RAW exitosa');
          resolve({ 
            success: true, 
            method: 'ESC/POS RAW',
            message: 'Impresión directa ESC/POS completada'
          });
        }
      });
    } catch (writeError) {
      reject(new Error(`Error escribiendo archivo RAW: ${writeError.message}`));
    }
  });
}

/**
 * Endpoint para listar impresoras disponibles
 */
app.get('/printers', (req, res) => {
  exec('wmic printer get name', (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: 'Error obteniendo impresoras' });
      return;
    }
    
    const printers = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line !== 'Name')
      .filter(line => !line.includes('===='));
    
    res.json({ printers });
  });
});

// Iniciar servidor
app.listen(PORT, 'localhost', () => {
  console.log('🖨️  ========================================');
  console.log('🖨️  SERVIDOR DE IMPRESIÓN XP-58IIH INICIADO');
  console.log('🖨️  ========================================');
  console.log(`🖨️  Puerto: ${PORT}`);
  console.log(`🖨️  URL: http://localhost:${PORT}`);
  console.log('🖨️  Estado: LISTO para recibir tickets');
  console.log('🖨️  ========================================');
  console.log('');
  console.log('✅ Ahora las ventas se imprimirán automáticamente');
  console.log('📋 Mantén esta ventana abierta mientras uses el sistema');
  console.log('');
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

// Manejo de cierre graceful
/**
 * Función DEFINITIVA - SOLO usar el método que FUNCIONA
 */
async function imprimirConMultiplesMetodos(tempFile, impresora, contenido) {
  return new Promise((resolve, reject) => {
    
    // Crear contenido simple y limpio
    const contenidoLimpio = contenido.replace(/[\x00-\x1F\x7F]/g, '') + '\n\n\n'; // Líneas extra para corte
    
    // Escribir archivo con contenido limpio
    fs.writeFileSync(tempFile, contenidoLimpio, 'utf8');
    
    // USAR SOLO NOTEPAD /P - EL ÚNICO QUE SABEMOS QUE FUNCIONA
    const comando = `cmd /c "notepad /p "${tempFile}""`;
    
    console.log('🎫 Usando notepad /p para imprimir (método confirmado que funciona)');
    
    exec(comando, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error con notepad /p:', error.message);
        reject(new Error(`Error en impresión: ${error.message}`));
      } else {
        console.log('✅ Impresión enviada con notepad /p');
        resolve({ success: true, method: 'notepad-confirmed' });
      }
    });
  });
}

/**
 * Genera ticket ULTRA compacto para 58mm (48+ caracteres)
 */
function generarTicket58mmCompacto(venta, items) {
  const fecha = new Date().toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const hora = new Date().toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const numeroVenta = venta.numero || Math.floor(Math.random() * 10000);

  let ticket = '';
  
  // Encabezado ULTRA COMPACTO (48 caracteres completos)
  ticket += '                  SUPERMERCADO\n';
  ticket += `${fecha} ${hora}              #${numeroVenta}\n`;
  ticket += '------------------------------------------------\n';
  
  // Items ULTRA compactos - usar TODO el ancho
  items.forEach(item => {
    // Nombre más largo (hasta 38 caracteres)
    const nombre = item.nombre.length > 38 ? item.nombre.substring(0, 36) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Línea producto - formato ULTRA compacto
    ticket += `${nombre}\n`;
    ticket += `${item.cantidad}x${item.precio.toFixed(0)}`.padEnd(30) + `$${total}`.padStart(18) + '\n';
  });
  
  // Total y cierre - usar TODO el ancho
  ticket += '------------------------------------------------\n';
  ticket += `TOTAL:`.padEnd(40) + `$${venta.total.toFixed(0)}`.padStart(8) + '\n';
  ticket += `${formatearMetodoPago(venta.metodoPago)}\n`;
  ticket += '------------------------------------------------\n';
  ticket += '                 ¡GRACIAS!\n';
  ticket += '\n\n'; // SOLO 2 espacios para corte
  
  return ticket;
}

/**
 * Formatea método de pago
 */
function formatearMetodoPago(metodo) {
  switch (metodo) {
    case 'efectivo': return 'Efectivo';
    case 'tarjeta': return 'Tarjeta';
    case 'transferencia': return 'Transferencia';
    case 'mixto': return 'Mixto';
    default: return metodo;
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor de impresión...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor de impresión...');
  process.exit(0);
});
