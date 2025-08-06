/**
 * COMANDOS ESC/POS PARA XP-58IIH - LETRA ULTRA PEQUEÑA
 * Configuración específica para máximo aprovechamiento de papel
 */

// Códigos ESC/POS para XP-58IIH
const ESC_POS_COMMANDS = {
  // Inicialización
  INIT: '\x1B\x40',                    // ESC @ - Inicializar impresora
  
  // Tamaño de letra ULTRA PEQUEÑO
  FONT_ULTRA_SMALL: '\x1D\x21\x00',   // GS ! 0 - Letra más pequeña posible
  FONT_CONDENSED: '\x1B\x0F',         // ESC SI - Modo condensado (más caracteres por línea)
  
  // Densidad de impresión
  PRINT_DENSITY_MAX: '\x1D\x7C\x00',  // Máxima densidad
  
  // Espaciado mínimo
  LINE_SPACING_MIN: '\x1B\x33\x00',   // ESC 3 0 - Espaciado de línea mínimo
  CHAR_SPACING_MIN: '\x1B\x20\x00',   // ESC SP 0 - Espaciado de caracteres mínimo
  
  // Márgenes mínimos
  LEFT_MARGIN_MIN: '\x1D\x4C\x00\x00', // GS L 0 0 - Margen izquierdo mínimo
  
  // Corte de papel
  CUT_PAPER: '\x1D\x56\x42\x00',      // GS V B 0 - Corte parcial
  
  // Reset
  RESET: '\x1B\x40'                    // ESC @ - Reset final
};

/**
 * Genera ticket con comandos ESC/POS para máximo aprovechamiento
 */
function generarTicketESCPOS(venta, items) {
  let ticket = '';
  
  // Inicializar impresora con configuración ultra compacta
  ticket += ESC_POS_COMMANDS.INIT;
  ticket += ESC_POS_COMMANDS.FONT_ULTRA_SMALL;
  ticket += ESC_POS_COMMANDS.FONT_CONDENSED;
  ticket += ESC_POS_COMMANDS.PRINT_DENSITY_MAX;
  ticket += ESC_POS_COMMANDS.LINE_SPACING_MIN;
  ticket += ESC_POS_COMMANDS.CHAR_SPACING_MIN;
  ticket += ESC_POS_COMMANDS.LEFT_MARGIN_MIN;
  
  const fecha = new Date().toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const hora = new Date().toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const numeroVenta = venta.numero || Math.floor(Math.random() * 10000);

  // Contenido del ticket - MÁXIMO ancho (hasta 56 caracteres con modo condensado)
  ticket += '                      SUPERMERCADO\n';
  ticket += `${fecha} ${hora}                        #${numeroVenta}\n`;
  ticket += '--------------------------------------------------------\n';
  
  // Items ultra compactos
  items.forEach(item => {
    // Nombres hasta 45 caracteres
    const nombre = item.nombre.length > 45 ? item.nombre.substring(0, 43) + '..' : item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    
    ticket += `${nombre}\n`;
    ticket += `${item.cantidad}x${item.precio.toFixed(0)}`.padEnd(40) + `$${total}`.padStart(16) + '\n';
  });
  
  // Total
  ticket += '--------------------------------------------------------\n';
  ticket += `TOTAL:`.padEnd(48) + `$${venta.total.toFixed(0)}`.padStart(8) + '\n';
  ticket += `${formatearMetodoPago(venta.metodoPago)}\n`;
  ticket += '--------------------------------------------------------\n';
  ticket += '                     ¡GRACIAS!\n';
  
  // Corte automático
  ticket += ESC_POS_COMMANDS.CUT_PAPER;
  
  return ticket;
}

/**
 * Formatear método de pago
 */
function formatearMetodoPago(metodo) {
  if (!metodo) return 'EFECTIVO';
  return metodo.toUpperCase();
}

module.exports = {
  ESC_POS_COMMANDS,
  generarTicketESCPOS
};
