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
 * GENERAR TICKET IDÉNTICO AL QUE FUNCIONA EN PRUEBAS
 * Usando EXACTAMENTE el mismo formato que las pruebas manuales
 */
function generarTicketIgualQuePruebas(venta, items) {
  // EXACTAMENTE igual que test_compacto.txt que funciona
  let ticket = '';
  
  ticket += '================== SUPERMERCADO ==================\n';
  
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  ticket += `${fecha} ${hora}                                    #${numero}\n`;
  ticket += '==================================================\n';
  
  // Items con EXACTAMENTE el mismo formato que funciona
  items.forEach(item => {
    const nombre = item.nombre.length > 35 ? item.nombre.substring(0, 33) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Formato EXACTO de las pruebas que funcionan
    const cantidad = `x${item.cantidad}`;
    const espacios = 50 - nombre.length - cantidad.length - total.length - 1;
    const linea = nombre + ' ' + cantidad + ' '.repeat(Math.max(0, espacios)) + '$' + total;
    
    ticket += linea + '\n';
  });
  
  // Total con formato exacto
  ticket += '==================================================\n';
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 50 - 6 - totalStr.length;
  ticket += 'TOTAL:' + ' '.repeat(Math.max(0, espaciosTotal)) + '$' + totalStr + '\n';
  
  // Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  ticket += metodoPago + '\n';
  
  // Pie exacto
  ticket += '==================================================\n';
  ticket += '                    GRACIAS\n';
  
  return ticket;
}

/**
 * IMPRESIÓN EXACTA - Igual que las pruebas que funcionan
 */
async function imprimirExactoComoPruebas(contenido, nombreImpresora = 'XP-58') {
  return new Promise((resolve, reject) => {
    // Usar la misma ubicación y método que las pruebas
    const tempFile = path.join(process.cwd(), `ticket_app_${Date.now()}.txt`);
    
    try {
      // Escribir con la misma codificación que funciona
      fs.writeFileSync(tempFile, contenido, 'utf8');
      
      console.log(`🖨️ IMPRIMIENDO EXACTO COMO PRUEBAS`);
      console.log(`📄 Archivo: ${tempFile}`);
      
      // EXACTAMENTE el mismo comando que funciona
      const comando = `notepad /p "${tempFile}"`;
      
      console.log(`⚡ Comando exacto: ${comando}`);
      
      exec(comando, (error, stdout, stderr) => {
        // Limpiar después del mismo tiempo que las pruebas
        setTimeout(() => {
          try { fs.unlinkSync(tempFile); } catch (e) {}
        }, 3000);
        
        if (error) {
          console.error('❌ Error:', error.message);
          reject(error);
        } else {
          console.log('✅ IMPRESO EXACTO COMO PRUEBAS');
          resolve({ success: true, method: 'Formato Exacto Pruebas' });
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * ENDPOINT EXACTO - Reproduce el formato que funciona
 */
app.post('/imprimir-58mm-auto', async (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 IMPRESIÓN EXACTA COMO PRUEBAS');
    console.log('📋 Total:', venta.total, '- Items:', items.length);
    
    // Generar EXACTAMENTE igual que las pruebas que funcionan
    const contenido = generarTicketIgualQuePruebas(venta, items);
    
    console.log('📝 Contenido generado:');
    console.log('─'.repeat(50));
    console.log(contenido);
    console.log('─'.repeat(50));
    
    // Imprimir con el método EXACTO que funciona
    const resultado = await imprimirExactoComoPruebas(contenido, 'XP-58');
    
    console.log('✅ TICKET ENVIADO CON FORMATO EXACTO');
    res.json({ 
      success: true, 
      message: 'Ticket impreso con formato exacto de pruebas',
      method: resultado.method 
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error en impresión exacta',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🖨️  ==========================================');
  console.log('🖨️  SERVIDOR FORMATO EXACTO - COMO PRUEBAS');
  console.log('🖨️  ==========================================');
  console.log(`🖨️  Puerto: ${PORT}`);
  console.log(`🖨️  URL: http://localhost:${PORT}`);
  console.log('🖨️  ==========================================');
  console.log('');
  console.log('✅ Generando tickets EXACTOS como las pruebas');
  console.log('📋 El formato será idéntico al que funciona');
});
