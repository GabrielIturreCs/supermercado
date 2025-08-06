const fs = require('fs');
const { spawn } = require('child_process');

/**
 * IMPRESIÓN DIRECTA RAW PARA XP-58IIH
 * Evita la interpretación de Windows y envía datos binarios directos
 */

// Comandos ESC/POS en hexadecimal para máximo control
const ESCPOS_HEX = {
  INIT: Buffer.from([0x1B, 0x40]),                    // ESC @ - Inicializar
  FONT_SMALL: Buffer.from([0x1D, 0x21, 0x00]),        // GS ! 0 - Letra pequeña
  CONDENSED: Buffer.from([0x0F]),                      // SI - Modo condensado (17 cpi)
  LINE_SPACING_MIN: Buffer.from([0x1B, 0x33, 0x00]),  // ESC 3 0 - Espaciado mínimo
  CHAR_SPACING_MIN: Buffer.from([0x1B, 0x20, 0x00]),  // ESC SP 0 - Sin espacio extra
  LEFT_MARGIN_ZERO: Buffer.from([0x1D, 0x4C, 0x00, 0x00]), // GS L 0 0 - Margen cero
  CUT_PAPER: Buffer.from([0x1D, 0x56, 0x42, 0x00]),   // GS V B 0 - Corte
  LF: Buffer.from([0x0A]),                             // Line Feed
  CR: Buffer.from([0x0D])                              // Carriage Return
};

/**
 * Genera ticket en formato binario RAW pero también como texto plano
 */
function generarTicketRAWTextoPlano(venta, items) {
  let ticket = '';
  
  // Encabezado compacto - 42 caracteres máximo
  ticket += '               SUPERMERCADO\n';
  
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  ticket += `${fecha} ${hora}                   #${numero}\n`;
  ticket += '------------------------------------------\n';
  
  // Items ultra compactos - SIN ESPACIOS EXTRA
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
  ticket += '\n'; // Línea extra para corte
  
  return ticket;
}

/**
 * Imprime con notepad pero con formato ultra compacto
 */
async function imprimirConNotepadCompacto(venta, items) {
  return new Promise((resolve, reject) => {
    const textoCompacto = generarTicketRAWTextoPlano(venta, items);
    const tempFile = `C:\\temp\\ticket_compacto_${Date.now()}.txt`;
    
    try {
      // Crear directorio temporal si no existe
      if (!fs.existsSync('C:\\temp')) {
        fs.mkdirSync('C:\\temp', { recursive: true });
      }
      
      // Escribir texto ultra compacto
      fs.writeFileSync(tempFile, textoCompacto, 'utf8');
      
      console.log('📝 IMPRESIÓN NOTEPAD COMPACTA - Formato optimizado');
      
      // Usar notepad /p con el texto optimizado
      const comando = `notepad /p "${tempFile}"`;
      
      const child = spawn('cmd', ['/c', comando], { 
        stdio: 'pipe',
        shell: true 
      });
      
      // Dar tiempo para que notepad procese
      setTimeout(() => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
      }, 3000);
      
      child.on('close', (code) => {
        console.log('✅ IMPRESIÓN NOTEPAD COMPACTA ENVIADA');
        resolve({ success: true, method: 'Notepad Compacto' });
      });
      
      child.on('error', (error) => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}
function generarTicketRAW(venta, items) {
  const buffers = [];
  
  // 1. Inicializar impresora
  buffers.push(ESCPOS_HEX.INIT);
  buffers.push(ESCPOS_HEX.FONT_SMALL);
  buffers.push(ESCPOS_HEX.CONDENSED);
  buffers.push(ESCPOS_HEX.LINE_SPACING_MIN);
  buffers.push(ESCPOS_HEX.CHAR_SPACING_MIN);
  buffers.push(ESCPOS_HEX.LEFT_MARGIN_ZERO);
  
  // 2. Encabezado - modo condensado permite ~42 caracteres
  buffers.push(Buffer.from('               SUPERMERCADO'));
  buffers.push(ESCPOS_HEX.LF);
  
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  buffers.push(Buffer.from(`${fecha} ${hora}                   #${numero}`));
  buffers.push(ESCPOS_HEX.LF);
  buffers.push(Buffer.from('------------------------------------------'));
  buffers.push(ESCPOS_HEX.LF);
  
  // 3. Items - formato ultra compacto
  items.forEach(item => {
    const nombre = item.nombre.length > 32 ? item.nombre.substring(0, 30) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Línea del producto
    buffers.push(Buffer.from(nombre));
    buffers.push(ESCPOS_HEX.LF);
    
    // Línea cantidad x precio = total (alineada a la derecha)
    const lineaCantidad = `${item.cantidad}x${item.precio.toFixed(0)}`;
    const espacios = 42 - lineaCantidad.length - total.length - 1;
    const lineaCompleta = lineaCantidad + ' '.repeat(Math.max(0, espacios)) + '$' + total;
    
    buffers.push(Buffer.from(lineaCompleta));
    buffers.push(ESCPOS_HEX.LF);
  });
  
  // 4. Total
  buffers.push(Buffer.from('------------------------------------------'));
  buffers.push(ESCPOS_HEX.LF);
  
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 42 - 6 - totalStr.length - 1; // "TOTAL:" + "$" + número
  const lineaTotal = 'TOTAL:' + ' '.repeat(Math.max(0, espaciosTotal)) + '$' + totalStr;
  
  buffers.push(Buffer.from(lineaTotal));
  buffers.push(ESCPOS_HEX.LF);
  
  // 5. Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  buffers.push(Buffer.from(metodoPago));
  buffers.push(ESCPOS_HEX.LF);
  
  // 6. Pie y corte
  buffers.push(Buffer.from('------------------------------------------'));
  buffers.push(ESCPOS_HEX.LF);
  buffers.push(Buffer.from('                ¡GRACIAS!'));
  buffers.push(ESCPOS_HEX.LF);
  buffers.push(ESCPOS_HEX.LF);
  
  // 7. Corte automático
  buffers.push(ESCPOS_HEX.CUT_PAPER);
  
  return Buffer.concat(buffers);
}

/**
 * Imprime directamente al puerto USB/LPT usando múltiples métodos
 */
async function imprimirDirectoRAW(ticketBuffer, puerto = 'USB001') {
  return new Promise((resolve, reject) => {
    const tempFile = `C:\\temp\\ticket_raw_${Date.now()}.bin`;
    
    try {
      // Crear directorio temporal si no existe
      if (!fs.existsSync('C:\\temp')) {
        fs.mkdirSync('C:\\temp', { recursive: true });
      }
      
      // Escribir datos binarios
      fs.writeFileSync(tempFile, ticketBuffer);
      
      console.log('🔥 IMPRESIÓN RAW DIRECTA - Probando múltiples métodos');
      
      // MÉTODO 1: Intentar con copy /b directo al puerto
      const comando1 = `copy /b "${tempFile}" ${puerto}:`;
      
      const child1 = spawn('cmd', ['/c', comando1], { 
        stdio: 'pipe',
        shell: true 
      });
      
      child1.on('close', (code) => {
        if (code === 0) {
          try { fs.unlinkSync(tempFile); } catch (e) {}
          console.log('✅ IMPRESIÓN RAW EXITOSA (Método directo)');
          resolve({ success: true, method: 'RAW Binary Direct' });
          return;
        }
        
        // MÉTODO 2: Si falla, intentar con NET USE
        console.log('🔄 Método directo falló, probando con NET USE...');
        
        const comando2 = `net use ${puerto}: /d && net use ${puerto}: \\\\localhost\\XP-58 && copy /b "${tempFile}" ${puerto}:`;
        
        const child2 = spawn('cmd', ['/c', comando2], { 
          stdio: 'pipe',
          shell: true 
        });
        
        child2.on('close', (code2) => {
          if (code2 === 0) {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            console.log('✅ IMPRESIÓN RAW EXITOSA (Método NET USE)');
            resolve({ success: true, method: 'RAW Binary NET USE' });
            return;
          }
          
          // MÉTODO 3: Usar PRINT directamente
          console.log('🔄 NET USE falló, probando comando PRINT...');
          
          const comando3 = `print /d:"XP-58" "${tempFile}"`;
          
          const child3 = spawn('cmd', ['/c', comando3], { 
            stdio: 'pipe',
            shell: true 
          });
          
          child3.on('close', (code3) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            
            if (code3 === 0) {
              console.log('✅ IMPRESIÓN RAW EXITOSA (Método PRINT)');
              resolve({ success: true, method: 'RAW Binary PRINT' });
            } else {
              reject(new Error(`Todos los métodos RAW fallaron: directo(${code}), net use(${code2}), print(${code3})`));
            }
          });
          
          child3.on('error', (error) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            reject(error);
          });
        });
        
        child2.on('error', (error) => {
          try { fs.unlinkSync(tempFile); } catch (e) {}
          reject(error);
        });
      });
      
      child1.on('error', (error) => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generarTicketRAW,
  generarTicketRAWTextoPlano,
  imprimirDirectoRAW,
  imprimirConNotepadCompacto,
  ESCPOS_HEX
};
