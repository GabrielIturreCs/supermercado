# Configuración de Impresora XPrinter para Tickets

## 📋 Instrucciones de Configuración

### 1. Conexión de la Impresora
- Conecta tu XPrinter via USB al ordenador
- Verifica que Windows detecte la impresora correctamente
- La impresora debe aparecer en "Dispositivos e impresoras"

### 2. Configuración del Navegador (Chrome/Edge)
Para usar la Web Serial API que permite comunicación directa con la impresora:

1. **Habilitar Web Serial API:**
   - Abre Chrome/Edge
   - Ve a: `chrome://flags/#enable-experimental-web-platform-features`
   - Habilita: "Experimental Web Platform features"
   - Reinicia el navegador

2. **Permisos de Serial:**
   - Ve a: `chrome://settings/content/serialPorts`
   - Asegúrate de que esté habilitado para tu sitio

### 3. Uso del Sistema de Impresión

#### 🎯 **Impresión Automática**
- Cada vez que finalices una venta, se imprimirá automáticamente un ticket
- Si hay error de impresión, la venta se completa normalmente

#### 🧪 **Prueba de Impresora**
- Usa el botón "Probar impresora" en el carrito
- Esto imprimirá un ticket de prueba para verificar conectividad

#### 📄 **Formato del Ticket**
```
================================
         SUPERMERCADO           
================================

Fecha: 04/08/2025 10:30:25
Ticket: V00000123
Vendedor: Usuario

================================
DETALLE DE COMPRA
================================
Producto 1
  2 x $1.500,00 = $3.000,00
  Código: 123456789
--------------------------------
Producto 2
  1 x $800,00 = $800,00
  Código: 987654321
--------------------------------

SUBTOTAL:           $3.800,00
================================
TOTAL:              $3.800,00
================================

Método de pago: Efectivo

¡Gracias por su compra!
www.supermercado.com

================================
```

### 4. Modos de Impresión

#### 🔗 **Modo Directo (Web Serial API)**
- Comunicación directa con impresora USB
- Comandos ESC/POS nativos
- Mejor compatibilidad con impresoras térmicas

#### 🖨️ **Modo Fallback (window.print)**
- Si Web Serial API no está disponible
- Abre ventana de impresión del navegador
- Compatible con cualquier impresora

### 5. Comandos ESC/POS Implementados
- **ESC @** - Inicializar impresora
- **ESC a** - Alineación (izquierda, centro)
- **ESC E** - Negrita ON/OFF  
- **GS !** - Tamaño de texto
- **GS V** - Cortar papel

### 6. Solución de Problemas

#### ❌ **Error: "No se pudo conectar con la impresora"**
- Verifica conexión USB
- Reinicia la impresora
- Recarga la página web
- Verifica permisos del navegador

#### ❌ **El ticket no imprime**
- Verifica que la impresora tenga papel
- Comprueba que esté encendida
- Usa el botón "Probar impresora"

#### ❌ **Caracteres extraños en el ticket**
- La impresora podría no soportar todos los caracteres
- Los comandos ESC/POS están optimizados para español

### 7. Especificaciones Técnicas
- **Ancho de papel soportado:** 58mm y 80mm
- **Velocidad de comunicación:** 9600 baud
- **Encoding:** UTF-8 con fallback a ASCII
- **Comandos:** Estándar ESC/POS

### 8. Compatibilidad
- ✅ Chrome 89+
- ✅ Edge 89+
- ⚠️ Firefox (solo modo fallback)
- ⚠️ Safari (solo modo fallback)

---

## 🚀 Uso Rápido
1. Conecta XPrinter por USB
2. Habilita Web Serial API en Chrome
3. Haz una venta de prueba
4. ¡El ticket se imprime automáticamente!

## 📞 Soporte
Si tienes problemas, revisa la consola del navegador (F12) para ver mensajes de debug.
