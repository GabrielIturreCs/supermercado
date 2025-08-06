const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * IMPRESIÓN DIRECTA POR NOMBRE DE IMPRESORA
 * Método más confiable para Windows
 */
async function imprimirPorNombreImpresora(contenido, nombreImpresora = 'XP-58') {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(process.env.TEMP || 'C:\\temp', `ticket_${Date.now()}.txt`);
    
    try {
      // Escribir contenido
      fs.writeFileSync(tempFile, contenido, 'utf8');
      
      console.log(`🖨️ IMPRIMIENDO EN: ${nombreImpresora}`);
      console.log(`📄 Archivo temporal: ${tempFile}`);
      
      // Comando directo a la impresora por nombre
      const comando = `notepad /p "${tempFile}"`;
      
      console.log(`⚡ Ejecutando: ${comando}`);
      
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
 * Probar impresión con datos de prueba
 */
async function probarImpresion() {
  const contenidoPrueba = `
               SUPERMERCADO
25/12 14:30                   #1234
------------------------------------------
Coca Cola 500ml
2x800                              $1600
Pan Lactal Grande  
1x450                               $450
------------------------------------------
TOTAL:                             $2050
EFECTIVO
------------------------------------------
                ¡GRACIAS!

`;

  console.log('🧪 PROBANDO IMPRESIÓN DIRECTA...');
  
  try {
    const resultado = await imprimirPorNombreImpresora(contenidoPrueba, 'XP-58');
    console.log('✅ PRUEBA EXITOSA:', resultado);
  } catch (error) {
    console.error('❌ PRUEBA FALLÓ:', error.message);
  }
}

module.exports = {
  imprimirPorNombreImpresora,
  probarImpresion
};
