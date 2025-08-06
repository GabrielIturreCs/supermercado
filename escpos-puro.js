const fs = require('fs');
const { spawn } = require('child_process');

/**
 * IMPRESIÓN ESC/POS PURA - FUERZA LETRA PEQUEÑA
 * Este método envía comandos binarios directos a la impresora
 */

// Comandos ESC/POS en bytes para forzar formato
const ESC = 0x1B;    // Escape
const GS = 0x1D;     // Group Separator
const SI = 0x0F;     // Shift In (modo condensado)
const LF = 0x0A;     // Line Feed
const CR = 0x0D;     // Carriage Return

/**
 * Crear comandos ESC/POS binarios para letra ultra pequeña
 */
function crearComandosESCPOS() {
  const comandos = [];
  
  // 1. Inicializar impresora
  comandos.push(ESC, 0x40);  // ESC @ - Reset
  
  // 2. Configurar letra ULTRA pequeña
  comandos.push(GS, 0x21, 0x00);    // GS ! 0 - Tamaño normal (más pequeño)
  comandos.push(SI);                  // SI - Modo condensado (17 CPI)
  comandos.push(ESC, 0x21, 0x00);   // ESC ! 0 - Estilo normal pequeño
  
  // 3. Configurar espaciado mínimo
  comandos.push(ESC, 0x33, 0x00);   // ESC 3 0 - Espaciado línea mínimo
  comandos.push(ESC, 0x20, 0x00);   // ESC SP 0 - Espaciado carácter mínimo
  
  // 4. Configurar márgenes
  comandos.push(GS, 0x4C, 0x00, 0x00); // GS L 0 0 - Margen izquierdo = 0
  
  return Buffer.from(comandos);
}

/**
 * Generar ticket con comandos ESC/POS integrados
 */
function generarTicketESCPOSPuro(venta, items) {
  const buffers = [];
  
  // Comandos iniciales
  buffers.push(crearComandosESCPOS());
  
  // Contenido del ticket
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  // Encabezado - Modo condensado permite hasta 42 caracteres
  buffers.push(Buffer.from('                 SUPERMERCADO\n'));
  buffers.push(Buffer.from(`${fecha} ${hora}                 #${numero}\n`));
  buffers.push(Buffer.from('==========================================\n'));
  
  // Items
  items.forEach(item => {
    const nombre = item.nombre.length > 30 ? item.nombre.substring(0, 28) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    buffers.push(Buffer.from(`${nombre}\n`));
    
    const lineaCantidad = `${item.cantidad}x${item.precio.toFixed(0)}`;
    const espacios = 40 - lineaCantidad.length - total.length - 1;
    const lineaCompleta = lineaCantidad + ' '.repeat(Math.max(0, espacios)) + '$' + total + '\n';
    
    buffers.push(Buffer.from(lineaCompleta));
  });
  
  // Total
  buffers.push(Buffer.from('==========================================\n'));
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 40 - 6 - totalStr.length - 1;
  const lineaTotal = 'TOTAL:' + ' '.repeat(Math.max(0, espaciosTotal)) + '$' + totalStr + '\n';
  buffers.push(Buffer.from(lineaTotal));
  
  // Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  buffers.push(Buffer.from(`${metodoPago}\n`));
  
  // Pie
  buffers.push(Buffer.from('==========================================\n'));
  buffers.push(Buffer.from('                ¡GRACIAS!\n\n'));
  
  // Comandos de corte
  buffers.push(Buffer.from([GS, 0x56, 0x42, 0x00])); // Corte parcial
  
  return Buffer.concat(buffers);
}

/**
 * Enviar datos binarios directamente al puerto de impresora
 */
async function enviarESCPOSDirecto(ticketBuffer) {
  return new Promise((resolve, reject) => {
    const tempFile = `C:\\temp\\escpos_${Date.now()}.bin`;
    
    try {
      // Crear directorio si no existe
      if (!fs.existsSync('C:\\temp')) {
        fs.mkdirSync('C:\\temp', { recursive: true });
      }
      
      // Escribir datos binarios
      fs.writeFileSync(tempFile, ticketBuffer);
      
      console.log('🔥 ENVIANDO ESC/POS PURO - LETRA FORZADA PEQUEÑA');
      
      // Intentar múltiples puertos
      const puertos = ['USB001', 'LPT1', 'COM1'];
      
      async function probarPuerto(index) {
        if (index >= puertos.length) {
          // Si fallan todos los puertos, usar método de impresora por nombre
          console.log('🔄 Puertos directos fallaron, usando impresora por nombre...');
          
          const comando = `copy /b "${tempFile}" "\\\\localhost\\XP-58"`;
          
          const child = spawn('cmd', ['/c', comando], { stdio: 'pipe' });
          
          child.on('close', (code) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            
            if (code === 0) {
              console.log('✅ ESC/POS ENVIADO (impresora por nombre)');
              resolve({ success: true, method: 'ESC/POS Named Printer' });
            } else {
              reject(new Error('Falló impresión por nombre'));
            }
          });
          
          return;
        }
        
        const puerto = puertos[index];
        const comando = `copy /b "${tempFile}" ${puerto}:`;
        
        console.log(`🔄 Probando puerto ${puerto}...`);
        
        const child = spawn('cmd', ['/c', comando], { stdio: 'pipe' });
        
        child.on('close', (code) => {
          if (code === 0) {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            console.log(`✅ ESC/POS ENVIADO (${puerto})`);
            resolve({ success: true, method: `ESC/POS ${puerto}` });
          } else {
            console.log(`❌ Puerto ${puerto} falló`);
            probarPuerto(index + 1);
          }
        });
      }
      
      probarPuerto(0);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Función principal para imprimir con ESC/POS puro
 */
async function imprimirESCPOSPuro(venta, items) {
  try {
    console.log('🎫 GENERANDO TICKET ESC/POS PURO...');
    
    const ticketBuffer = generarTicketESCPOSPuro(venta, items);
    
    console.log('📏 Ticket generado:', ticketBuffer.length, 'bytes con comandos ESC/POS');
    
    const resultado = await enviarESCPOSDirecto(ticketBuffer);
    
    console.log('✅ IMPRESIÓN ESC/POS EXITOSA');
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en ESC/POS puro:', error.message);
    throw error;
  }
}

module.exports = {
  imprimirESCPOSPuro,
  generarTicketESCPOSPuro,
  crearComandosESCPOS
};
