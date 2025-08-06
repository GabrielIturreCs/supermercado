const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3001;

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
 * ENVÍO DIRECTO AL PUERTO - SIN NOTEPAD
 * Esta función envía los bytes directamente al puerto USB/Serie
 */
async function enviarDirectoAlPuerto(contenidoBinario) {
  return new Promise((resolve, reject) => {
    // Crear archivo temporal binario
    const tempFile = path.join(process.env.TEMP || 'C:\\temp', `direct_${Date.now()}.bin`);
    
    try {
      // Escribir en formato binario puro
      fs.writeFileSync(tempFile, contenidoBinario);
      
      console.log('🔥 ENVIANDO DIRECTO AL PUERTO - SIN NOTEPAD');
      console.log('📄 Archivo binario:', tempFile);
      
      // MÉTODO 1: Intentar con copy /b al puerto USB001
      console.log('🔄 Probando USB001...');
      
      const comando1 = `copy /b "${tempFile}" USB001:`;
      
      const child1 = spawn('cmd', ['/c', comando1], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true 
      });
      
      child1.on('close', (code1) => {
        if (code1 === 0) {
          try { fs.unlinkSync(tempFile); } catch (e) {}
          console.log('✅ ENVIADO DIRECTO A USB001');
          resolve({ success: true, method: 'USB001 Directo', port: 'USB001' });
          return;
        }
        
        console.log('❌ USB001 falló, probando LPT1...');
        
        // MÉTODO 2: Intentar con LPT1
        const comando2 = `copy /b "${tempFile}" LPT1:`;
        
        const child2 = spawn('cmd', ['/c', comando2], { 
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true 
        });
        
        child2.on('close', (code2) => {
          if (code2 === 0) {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            console.log('✅ ENVIADO DIRECTO A LPT1');
            resolve({ success: true, method: 'LPT1 Directo', port: 'LPT1' });
            return;
          }
          
          console.log('❌ LPT1 falló, probando impresora por nombre...');
          
          // MÉTODO 3: Usar la impresora por nombre con NET USE
          const comando3 = `net use LPT2: "\\\\localhost\\XP-58" && copy /b "${tempFile}" LPT2: && net use LPT2: /delete`;
          
          const child3 = spawn('cmd', ['/c', comando3], { 
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true 
          });
          
          child3.on('close', (code3) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            
            if (code3 === 0) {
              console.log('✅ ENVIADO DIRECTO VIA NET USE');
              resolve({ success: true, method: 'NET USE Directo', port: 'LPT2' });
            } else {
              console.log('❌ Todos los métodos directos fallaron');
              reject(new Error(`Falló envío directo: USB001(${code1}), LPT1(${code2}), NET USE(${code3})`));
            }
          });
        });
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generar ticket binario con comandos ESC/POS reales
 */
function generarTicketBinarioReal(venta, items) {
  const buffers = [];
  
  // 1. INICIALIZAR IMPRESORA
  buffers.push(Buffer.from([0x1B, 0x40])); // ESC @ - Reset
  
  // 2. CONFIGURAR FONT B (9x17) - LA MÁS PEQUEÑA
  buffers.push(Buffer.from([0x1B, 0x4D, 0x01])); // ESC M 1 - Font B
  
  // 3. ACTIVAR MODO CONDENSADO (17 CPI)
  buffers.push(Buffer.from([0x0F])); // SI - Condensado ON
  
  // 4. ESPACIADO MÍNIMO
  buffers.push(Buffer.from([0x1B, 0x33, 0x00])); // ESC 3 0 - Línea mínima
  buffers.push(Buffer.from([0x1B, 0x20, 0x00])); // ESC SP 0 - Char mínimo
  
  // 5. SIN MÁRGENES
  buffers.push(Buffer.from([0x1D, 0x4C, 0x00, 0x00])); // GS L 0 0 - Margen 0
  
  // 6. CONTENIDO DEL TICKET
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  // Font B + Condensado = hasta 56 caracteres
  buffers.push(Buffer.from('                        SUPERMERCADO\n'));
  buffers.push(Buffer.from(`${fecha} ${hora}                            #${numero}\n`));
  buffers.push(Buffer.from('========================================================\n'));
  
  // Items con máximo aprovechamiento
  items.forEach(item => {
    const nombre = item.nombre.length > 42 ? item.nombre.substring(0, 40) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Producto
    buffers.push(Buffer.from(`${nombre}\n`));
    
    // Cantidad y precio alineado a la derecha
    const lineaCantidad = `${item.cantidad}x${item.precio.toFixed(0)}`;
    const espacios = 56 - lineaCantidad.length - total.length - 1;
    const lineaCompleta = lineaCantidad + ' '.repeat(Math.max(0, espacios)) + '$' + total + '\n';
    
    buffers.push(Buffer.from(lineaCompleta));
  });
  
  // Total
  buffers.push(Buffer.from('========================================================\n'));
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 56 - 6 - totalStr.length - 1;
  const lineaTotal = 'TOTAL:' + ' '.repeat(Math.max(0, espaciosTotal)) + '$' + totalStr + '\n';
  buffers.push(Buffer.from(lineaTotal));
  
  // Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  buffers.push(Buffer.from(`${metodoPago}\n`));
  
  // Pie
  buffers.push(Buffer.from('========================================================\n'));
  buffers.push(Buffer.from('                       ¡GRACIAS!\n'));
  buffers.push(Buffer.from('\n\n'));
  
  // 7. COMANDO DE CORTE
  buffers.push(Buffer.from([0x1D, 0x56, 0x42, 0x00])); // GS V B 0 - Corte parcial
  
  return Buffer.concat(buffers);
}

/**
 * ENDPOINT PRINCIPAL - ENVÍO DIRECTO REAL
 */
app.post('/imprimir-58mm-auto', async (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 IMPRESIÓN DIRECTA REAL - SIN NOTEPAD');
    console.log('📋 Total:', venta.total, '- Items:', items.length);
    console.log('🔥 Generando comandos binarios ESC/POS...');
    
    // Generar ticket binario con Font B + Condensado
    const ticketBinario = generarTicketBinarioReal(venta, items);
    
    console.log('📏 Ticket binario generado:', ticketBinario.length, 'bytes');
    console.log('🔤 Font B (9x17) + Condensado = 56 caracteres por línea');
    console.log('🚀 Enviando directo al puerto...');
    
    // Enviar directamente al puerto
    const resultado = await enviarDirectoAlPuerto(ticketBinario);
    
    console.log('✅ IMPRESIÓN DIRECTA EXITOSA');
    console.log('🎯 Usado:', resultado.method, 'en puerto', resultado.port);
    
    res.json({ 
      success: true, 
      message: `Ticket enviado directo al puerto ${resultado.port}`,
      method: resultado.method,
      port: resultado.port,
      caracteresPorLinea: 56
    });
    
  } catch (error) {
    console.error('❌ ERROR EN ENVÍO DIRECTO:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error en envío directo al puerto',
      details: error.message 
    });
  }
});

/**
 * Endpoint para detectar puertos disponibles
 */
app.get('/detectar-puertos', async (req, res) => {
  try {
    console.log('🔍 DETECTANDO PUERTOS DISPONIBLES...');
    
    const puertos = ['USB001', 'USB002', 'LPT1', 'LPT2', 'COM1', 'COM2'];
    const resultados = [];
    
    for (const puerto of puertos) {
      try {
        const tempFile = path.join(process.env.TEMP, `test_${puerto}.txt`);
        fs.writeFileSync(tempFile, 'TEST');
        
        const comando = `copy /b "${tempFile}" ${puerto}: 2>nul`;
        
        await new Promise((resolve) => {
          const child = spawn('cmd', ['/c', comando], { stdio: 'pipe' });
          child.on('close', (code) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            
            if (code === 0) {
              resultados.push({ puerto, disponible: true });
              console.log(`✅ ${puerto}: DISPONIBLE`);
            } else {
              resultados.push({ puerto, disponible: false });
              console.log(`❌ ${puerto}: No disponible`);
            }
            resolve();
          });
        });
        
      } catch (error) {
        resultados.push({ puerto, disponible: false, error: error.message });
      }
    }
    
    res.json({ puertos: resultados });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🖨️  =================================================');
  console.log('🖨️  SERVIDOR ENVÍO DIRECTO - SIN NOTEPAD');
  console.log('🖨️  =================================================');
  console.log(`🖨️  Puerto: ${PORT}`);
  console.log(`🖨️  URL: http://localhost:${PORT}`);
  console.log('🖨️  =================================================');
  console.log('🔥 Envío DIRECTO al puerto USB/LPT/COM');
  console.log('🔤 Font B (9x17) + Condensado = 56 caracteres');
  console.log('❌ NO usa notepad (ignora comandos ESC/POS)');
  console.log('✅ Envía bytes directos al puerto de impresora');
  console.log('📋 GET /detectar-puertos para ver puertos disponibles');
});
