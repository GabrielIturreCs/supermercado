/**
 * SERVIDOR DE IMPRESIÓN TÉRMICA 58MM
 * Maneja impresión con dimensiones exactas
 */
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Directorio temporal para archivos de impresión
const tempDir = path.join(__dirname, 'temp-print');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

/**
 * ENDPOINT: Impresión Térmica 58mm con dimensiones exactas
 */
app.post('/imprimir-58mm', async (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 BACKEND 58MM: Procesando ticket...');
    
    // Generar HTML con CSS para 58mm exacto
    const htmlContent = generarHTML58mmExacto(venta, items);
    
    // Crear archivo temporal
    const timestamp = Date.now();
    const htmlFile = path.join(tempDir, `ticket-58mm-${timestamp}.html`);
    
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    console.log('📄 Archivo HTML 58mm creado:', htmlFile);
    
    // MÉTODO AUTOMÁTICO: Crear archivo .txt y enviarlo directo a impresora
    const txtContent = generarTexto58mmPlano(venta, items);
    const txtFile = path.join(tempDir, `ticket-${timestamp}.txt`);
    
    fs.writeFileSync(txtFile, txtContent, 'utf8');
    console.log('📄 Archivo TXT 58mm creado:', txtFile);
    
    // IMPRESIÓN DIRECTA sin diálogos usando COPY comando
    const printCommand = `copy "${txtFile}" "\\\\localhost\\XP-58" /B`;
    
    exec(printCommand, (error, stdout, stderr) => {
      if (error) {
        console.warn('⚠️ Método COPY falló, probando notepad...');
        
        // BACKUP: Usar notepad con /p
        const backupCommand = `notepad /p "${txtFile}"`;
        exec(backupCommand, (err2) => {
          if (err2) {
            console.error('❌ Ambos métodos fallaron');
          } else {
            console.log('✅ Impresión enviada vía notepad');
          }
        });
        
      } else {
        console.log('✅ Impresión directa vía COPY exitosa');
      }
    });
    
    // Limpiar archivo después de 30 segundos
    setTimeout(() => {
      try {
        fs.unlinkSync(htmlFile);
        console.log('🗑️ Archivo temporal eliminado');
      } catch (e) {
        console.warn('⚠️ No se pudo eliminar archivo temporal');
      }
    }, 30000);
    
    res.json({ success: true, message: 'Ticket 58mm enviado a impresión' });
    
  } catch (error) {
    console.error('❌ Error en servidor 58mm:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Genera HTML con CSS exacto para papel térmico 58mm
 */
function generarHTML58mmExacto(venta, items) {
  const fecha = new Date().toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const hora = new Date().toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const numeroVenta = venta.numero || Math.floor(Math.random() * 10000);

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket ${numeroVenta} - 58mm</title>
    <style>
        @media print {
            @page {
                size: 58mm auto;  /* EXACTO: 58mm ancho */
                margin: 0;        /* SIN márgenes */
                padding: 0;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Courier New', monospace;
                font-size: 6px;      /* ULTRA pequeño */
                line-height: 1.0;    /* Sin espaciado extra */
                width: 58mm;         /* Usar TODO el ancho */
                background: white;
                color: black;
                padding: 1mm;        /* Mínimo padding */
            }
            
            .header {
                text-align: center;
                font-weight: bold;
                font-size: 8px;
                margin-bottom: 1mm;
            }
            
            .info {
                text-align: center;
                font-size: 6px;
                margin-bottom: 0.5mm;
            }
            
            .separator {
                width: 100%;
                border-top: 1px solid black;
                margin: 1mm 0;
            }
            
            .item {
                font-size: 6px;
                display: table;
                width: 100%;
                margin-bottom: 0.5mm;
            }
            
            .item-name {
                display: table-cell;
                width: 70%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .item-qty {
                display: table-cell;
                width: 15%;
                text-align: center;
            }
            
            .item-price {
                display: table-cell;
                width: 15%;
                text-align: right;
                font-weight: bold;
            }
            
            .total {
                text-align: right;
                font-weight: bold;
                font-size: 8px;
                margin-top: 1mm;
            }
            
            .footer {
                text-align: center;
                font-size: 6px;
                margin-top: 1mm;
            }
        }
        
        /* Vista previa */
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 250px;
            margin: 10px;
            border: 1px solid #ccc;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">SUPERMERCADO</div>
    <div class="info">${fecha} ${hora}</div>
    <div class="info">Ticket #${numeroVenta}</div>
    
    <div class="separator"></div>
    
    ${items.map(item => {
      const nombre = item.nombre.length > 25 ? item.nombre.substring(0, 23) + '..' : item.nombre;
      const precio = (item.precio * item.cantidad).toFixed(0);
      
      return `<div class="item">
        <div class="item-name">${nombre}</div>
        <div class="item-qty">${item.cantidad}</div>
        <div class="item-price">$${precio}</div>
      </div>`;
    }).join('')}
    
    <div class="separator"></div>
    
    <div class="total">TOTAL: $${venta.total.toFixed(0)}</div>
    <div class="info">${formatearMetodoPago(venta.metodoPago)}</div>
    
    <div class="separator"></div>
    
    <div class="footer">¡GRACIAS POR SU COMPRA!</div>
</body>
</html>`;
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

/**
 * Genera texto plano optimizado para 58mm (48 caracteres)
 */
function generarTexto58mmPlano(venta, items) {
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
  
  // Encabezado centrado
  ticket += '================================================\n';
  ticket += '                 SUPERMERCADO                  \n';
  ticket += '================================================\n';
  ticket += `${fecha} ${hora}        Ticket #${numeroVenta}\n`;
  ticket += '------------------------------------------------\n';
  
  // Items con formato compacto
  items.forEach(item => {
    const nombre = item.nombre.length > 30 ? item.nombre.substring(0, 28) + '..' : item.nombre;
    const cantidad = item.cantidad;
    const precio = item.precio;
    const total = (precio * cantidad).toFixed(0);
    
    // Línea del producto
    ticket += `${nombre.padEnd(30)}\n`;
    ticket += `${cantidad}x $${precio.toFixed(0)}`.padEnd(20) + `$${total}`.padStart(28) + '\n';
  });
  
  ticket += '------------------------------------------------\n';
  ticket += `TOTAL:`.padEnd(40) + `$${venta.total.toFixed(0)}`.padStart(8) + '\n';
  ticket += `${formatearMetodoPago(venta.metodoPago)}`.padEnd(48) + '\n';
  ticket += '================================================\n';
  ticket += '            ¡GRACIAS POR SU COMPRA!            \n';
  ticket += '================================================\n';
  ticket += '\n\n\n'; // Espacios para corte
  
  return ticket;
}

/**
 * ENDPOINT: Estado del servidor
 */
app.get('/status', (req, res) => {
  res.json({ 
    status: 'active', 
    message: 'Servidor de impresión térmica 58mm funcionando',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log('🖨️ ========================================');
  console.log('🎫 SERVIDOR IMPRESIÓN TÉRMICA 58MM EXACTO');
  console.log('🖨️ ========================================');
  console.log(`📡 Puerto: ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`📄 Endpoint: POST /imprimir-58mm`);
  console.log('✅ Servidor listo para imprimir tickets');
  console.log('🖨️ ========================================');
});

module.exports = app;
