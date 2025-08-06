const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { imprimirESCPOSPuro } = require('./escpos-puro.js');

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
 * IMPRESIÓN DIRECTA POR NOMBRE DE IMPRESORA
 */
async function imprimirDirecto(contenido, nombreImpresora = 'XP-58') {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `ticket_${Date.now()}.txt`);
    
    try {
      // Escribir contenido
      fs.writeFileSync(tempFile, contenido, 'utf8');
      
      console.log(`🖨️ IMPRIMIENDO EN: ${nombreImpresora}`);
      
      // Comando directo a la impresora por nombre
      const comando = `notepad /p "${tempFile}"`;
      
      exec(comando, (error, stdout, stderr) => {
        // Limpiar archivo después de 3 segundos
        setTimeout(() => {
          try { fs.unlinkSync(tempFile); } catch (e) {}
        }, 3000);
        
        if (error) {
          console.error('❌ Error en notepad /p:', error.message);
          
          // Método alternativo: comando print directo
          const comandoPrint = `print /d:"${nombreImpresora}" "${tempFile}"`;
          console.log(`🔄 Probando comando print: ${comandoPrint}`);
          
          exec(comandoPrint, (error2, stdout2, stderr2) => {
            if (error2) {
              console.error('❌ Error en comando print:', error2.message);
              reject(new Error(`Error en ambos métodos: notepad(${error.message}) y print(${error2.message})`));
            } else {
              console.log('✅ IMPRESIÓN EXITOSA con comando print');
              resolve({ success: true, method: 'Print Command' });
            }
          });
        } else {
          console.log('✅ IMPRESIÓN EXITOSA con notepad /p');
          resolve({ success: true, method: 'Notepad Print' });
        }
      });
      
    } catch (error) {
      reject(new Error(`Error creando archivo: ${error.message}`));
    }
  });
}

/**
 * Generar ticket ultra compacto
 */
function generarTicketCompacto(venta, items) {
  let ticket = '';
  
  // Encabezado compacto
  ticket += '               SUPERMERCADO\n';
  
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  ticket += `${fecha} ${hora}                   #${numero}\n`;
  ticket += '------------------------------------------\n';
  
  // Items ultra compactos
  items.forEach(item => {
    const nombre = item.nombre.length > 32 ? item.nombre.substring(0, 30) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Producto en una línea
    ticket += `${nombre}\n`;
    
    // Cantidad y precio en la siguiente línea, alineado a la derecha
    const lineaCantidad = `${item.cantidad}x${item.precio.toFixed(0)}`;
    const espacios = 42 - lineaCantidad.length - total.length - 1;
    ticket += lineaCantidad + ' '.repeat(Math.max(0, espacios)) + '$' + total + '\n';
  });
  
  // Total
  ticket += '------------------------------------------\n';
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 42 - 6 - totalStr.length - 1;
  ticket += 'TOTAL:' + ' '.repeat(Math.max(0, espaciosTotal)) + '$' + totalStr + '\n';
  
  // Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  ticket += `${metodoPago}\n`;
  
  // Pie
  ticket += '------------------------------------------\n';
  ticket += '                ¡GRACIAS!\n';
  ticket += '\n';
  
  return ticket;
}

/**
 * ENDPOINT PRINCIPAL - 58mm automático con ESC/POS PURO
 */
app.post('/imprimir-58mm-auto', async (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 TICKET AUTOMÁTICO 58MM - ESC/POS PURO');
    console.log('📋 Total:', venta.total, '- Items:', items.length);
    
    // MÉTODO 1: ESC/POS PURO (fuerza letra pequeña)
    console.log('🔥 Intentando ESC/POS puro (letra forzada pequeña)...');
    
    try {
      const resultado = await imprimirESCPOSPuro(venta, items);
      
      console.log('✅ TICKET ESC/POS PURO IMPRESO');
      res.json({ 
        success: true, 
        message: 'Ticket impreso con ESC/POS puro (letra pequeña forzada)',
        method: resultado.method 
      });
      return;
      
    } catch (errorESCPOS) {
      console.error('❌ ESC/POS puro falló:', errorESCPOS.message);
      console.log('🔄 Usando método fallback...');
    }
    
    // FALLBACK: Método tradicional
    const contenido = generarTicketCompacto(venta, items);
    
    console.log('📝 Enviando a impresora XP-58 (método tradicional)...');
    
    const resultado = await imprimirDirecto(contenido, 'XP-58');
    
    console.log('✅ TICKET IMPRESO (método fallback)');
    res.json({ 
      success: true, 
      message: 'Ticket impreso (método fallback)',
      method: resultado.method 
    });
    
  } catch (error) {
    console.error('❌ ERROR EN TODOS LOS MÉTODOS:', error.message);
    
    // Último intento con copia de impresora
    try {
      const { venta, items } = req.body;
      const contenido = generarTicketCompacto(venta, items);
      
      console.log('🔄 Último intento con XP-58 (copy 1)...');
      const resultado = await imprimirDirecto(contenido, 'XP-58 (copy 1)');
      
      console.log('✅ TICKET IMPRESO (copy 1)');
      res.json({ success: true, message: 'Ticket impreso (copy 1)' });
      
    } catch (error2) {
      console.error('❌ ERROR FINAL:', error2.message);
      res.status(500).json({ 
        success: false, 
        error: 'No se pudo imprimir el ticket con ningún método',
        details: error2.message 
      });
    }
  }
});

/**
 * Endpoint para listar impresoras
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
app.listen(PORT, () => {
  console.log('🖨️  ========================================');
  console.log('🖨️  SERVIDOR IMPRESIÓN XP-58IIH OPTIMIZADO');
  console.log('🖨️  ========================================');
  console.log(`🖨️  Puerto: ${PORT}`);
  console.log(`🖨️  URL: http://localhost:${PORT}`);
  console.log('🖨️  Estado: LISTO para tickets');
  console.log('🖨️  ========================================');
  console.log('');
  console.log('✅ Sistema de impresión automática activado');
  console.log('📋 Mantén esta ventana abierta');
});
