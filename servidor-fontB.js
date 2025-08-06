const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
 * COMANDOS ESC/POS ESPECÍFICOS PARA XP-58IIH
 * Basado en especificaciones técnicas oficiales
 */
const ESC_POS_XP58 = {
  // Inicialización
  INIT: '\x1B\x40',                    // ESC @ - Inicializar impresora
  
  // FUENTE B (9x17) - LA MÁS PEQUEÑA según especificaciones
  FONT_B: '\x1B\x4D\x01',             // ESC M 1 - Seleccionar Font B (9x17)
  FONT_A: '\x1B\x4D\x00',             // ESC M 0 - Font A (12x24) por defecto
  
  // Modo condensado para máximo aprovechamiento
  CONDENSED_ON: '\x1B\x0F',           // ESC SI - Modo condensado ON
  CONDENSED_OFF: '\x1B\x12',          // ESC DC2 - Modo condensado OFF
  
  // Espaciado mínimo
  LINE_SPACING_MIN: '\x1B\x33\x00',   // ESC 3 0 - Espaciado de línea mínimo
  CHAR_SPACING_MIN: '\x1B\x20\x00',   // ESC SP 0 - Espaciado de caracteres mínimo
  
  // Márgenes
  LEFT_MARGIN_MIN: '\x1D\x4C\x00\x00', // GS L 0 0 - Margen izquierdo mínimo
  
  // Corte de papel
  CUT_PAPER: '\x1D\x56\x42\x00',      // GS V B 0 - Corte parcial
  
  // Salto de línea
  LF: '\x0A',
  CR: '\x0D'
};

/**
 * Generar ticket con Font B (9x17) - LA MÁS PEQUEÑA
 */
function generarTicketFontB(venta, items) {
  let ticket = '';
  
  // 1. Inicializar e configurar Font B (9x17)
  ticket += ESC_POS_XP58.INIT;           // Reset
  ticket += ESC_POS_XP58.FONT_B;         // Font B (9x17) - MÁS PEQUEÑA
  ticket += ESC_POS_XP58.CONDENSED_ON;   // Modo condensado
  ticket += ESC_POS_XP58.LINE_SPACING_MIN; // Espaciado mínimo
  ticket += ESC_POS_XP58.CHAR_SPACING_MIN; // Sin espacio extra
  ticket += ESC_POS_XP58.LEFT_MARGIN_MIN;  // Margen cero
  
  // 2. Contenido - Font B permite más caracteres
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  // Font B (9x17) + condensado = ~48 caracteres por línea
  ticket += '                    SUPERMERCADO\n';
  ticket += `${fecha} ${hora}                        #${numero}\n`;
  ticket += '================================================\n';
  
  // Items con Font B
  items.forEach(item => {
    const nombre = item.nombre.length > 35 ? item.nombre.substring(0, 33) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Producto
    ticket += `${nombre}\n`;
    
    // Cantidad x precio = total (alineado)
    const lineaCantidad = `${item.cantidad}x${item.precio.toFixed(0)}`;
    const espacios = 48 - lineaCantidad.length - total.length - 1;
    ticket += lineaCantidad + ' '.repeat(Math.max(0, espacios)) + '$' + total + '\n';
  });
  
  // Total
  ticket += '================================================\n';
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 48 - 6 - totalStr.length - 1;
  ticket += 'TOTAL:' + ' '.repeat(Math.max(0, espaciosTotal)) + '$' + totalStr + '\n';
  
  // Método pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  ticket += `${metodoPago}\n`;
  
  // Pie
  ticket += '================================================\n';
  ticket += '                   ¡GRACIAS!\n';
  ticket += '\n';
  
  // Corte automático
  ticket += ESC_POS_XP58.CUT_PAPER;
  
  return ticket;
}

/**
 * Escribir archivo con comandos ESC/POS para Font B
 */
async function imprimirConFontB(venta, items) {
  return new Promise((resolve, reject) => {
    const contenidoFontB = generarTicketFontB(venta, items);
    const tempFile = path.join(os.tmpdir(), `fontB_${Date.now()}.txt`);
    
    try {
      // Escribir archivo con comandos Font B
      fs.writeFileSync(tempFile, contenidoFontB, 'binary');
      
      console.log('🔤 IMPRIMIENDO CON FONT B (9x17) - MÁS PEQUEÑA');
      console.log('📄 Archivo:', tempFile);
      console.log('📏 Con comandos ESC/POS para Font B');
      
      // Comando notepad que debe respetar los códigos ESC/POS
      const comando = `notepad /p "${tempFile}"`;
      
      exec(comando, (error, stdout, stderr) => {
        // Limpiar después de 3 segundos
        setTimeout(() => {
          try { fs.unlinkSync(tempFile); } catch (e) {}
        }, 3000);
        
        if (error) {
          console.error('❌ Error Font B:', error.message);
          reject(error);
        } else {
          console.log('✅ IMPRESO CON FONT B (9x17)');
          resolve({ success: true, method: 'Font B (9x17)' });
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * ENDPOINT con Font B específica para XP-58IIH
 */
app.post('/imprimir-58mm-auto', async (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 XP-58IIH FONT B (9x17) - MÁS PEQUEÑA');
    console.log('📋 Total:', venta.total, '- Items:', items.length);
    console.log('🔤 Usando Font B según especificaciones técnicas');
    
    // Imprimir con Font B (9x17)
    const resultado = await imprimirConFontB(venta, items);
    
    console.log('✅ TICKET IMPRESO CON FONT B');
    res.json({ 
      success: true, 
      message: 'Ticket impreso con Font B (9x17) - letra más pequeña',
      method: resultado.method 
    });
    
  } catch (error) {
    console.error('❌ ERROR Font B:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error imprimiendo con Font B',
      details: error.message 
    });
  }
});

// Endpoint para probar Font A vs Font B
app.post('/test-fonts', async (req, res) => {
  try {
    console.log('🧪 PRUEBA COMPARATIVA FONT A vs FONT B');
    
    // Crear archivo de prueba con ambas fuentes
    let pruebaFonts = '';
    
    // Font A (por defecto - grande)
    pruebaFonts += ESC_POS_XP58.INIT;
    pruebaFonts += ESC_POS_XP58.FONT_A;
    pruebaFonts += 'FONT A (12x24) - GRANDE:\n';
    pruebaFonts += 'Esta es la fuente por defecto\n';
    pruebaFonts += '1234567890123456789012345678\n';
    pruebaFonts += '\n';
    
    // Font B (pequeña)
    pruebaFonts += ESC_POS_XP58.FONT_B;
    pruebaFonts += ESC_POS_XP58.CONDENSED_ON;
    pruebaFonts += 'FONT B (9x17) + CONDENSADO - PEQUEÑA:\n';
    pruebaFonts += 'Esta es la fuente más pequeña disponible\n';
    pruebaFonts += '123456789012345678901234567890123456789012345678\n';
    pruebaFonts += ESC_POS_XP58.CUT_PAPER;
    
    const tempFile = path.join(os.tmpdir(), `test_fonts_${Date.now()}.txt`);
    fs.writeFileSync(tempFile, pruebaFonts, 'binary');
    
    const comando = `notepad /p "${tempFile}"`;
    
    exec(comando, (error) => {
      setTimeout(() => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
      }, 3000);
      
      if (error) {
        res.status(500).json({ success: false, error: error.message });
      } else {
        res.json({ success: true, message: 'Prueba de fuentes enviada' });
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🖨️  =============================================');
  console.log('🖨️  SERVIDOR XP-58IIH - FONT B (9x17)');
  console.log('🖨️  =============================================');
  console.log(`🖨️  Puerto: ${PORT}`);
  console.log(`🖨️  URL: http://localhost:${PORT}`);
  console.log('🖨️  =============================================');
  console.log('🔤 Font A (defecto): 12x24 - GRANDE');
  console.log('🔤 Font B (pequeña): 9x17 - PEQUEÑA ← USANDO ESTA');
  console.log('📏 + Modo condensado = ~48 caracteres por línea');
  console.log('✅ Basado en especificaciones técnicas oficiales');
  console.log('📋 Prueba: POST /test-fonts para comparar fuentes');
});
