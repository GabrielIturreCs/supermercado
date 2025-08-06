# 🖨️ Configuración Automática XPrinter XP-58IIH

## 📋 PASOS PARA CONFIGURACIÓN AUTOMÁTICA

### 1️⃣ Configurar Windows (IMPORTANTE)

1. **Conectar la XP-58IIH por USB**
   - Conectar el cable USB a la computadora
   - Encender la impresora
   - Windows debería detectarla automáticamente

2. **Instalar drivers si es necesario**
   - Descargar drivers desde: https://www.xprinter.net/download
   - O usar drivers genéricos de Windows para impresoras térmicas

3. **Configurar como impresora predeterminada**
   - Ir a `Panel de Control` > `Dispositivos e impresoras`
   - Clic derecho en XP-58IIH > `Establecer como impresora predeterminada`
   - ✅ Esto es CRUCIAL para la impresión automática

4. **Configurar propiedades de impresión**
   - Clic derecho en XP-58IIH > `Propiedades de impresora`
   - En `Preferencias de impresión`:
     - Tamaño de papel: **Custom** (58mm x 297mm)
     - Orientación: **Vertical**
     - Calidad: **Borrador** (más rápido)
     - Márgenes: **0mm** en todos los lados

### 2️⃣ Configurar Chrome para Impresión Automática

#### Método A: Acceso directo con parámetros (RECOMENDADO)

1. **Crear acceso directo especial de Chrome:**
   - Clic derecho en el escritorio > `Nuevo` > `Acceso directo`
   - Ubicación: 
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --disable-print-preview --enable-print-browser
   ```
   - Nombre: "Chrome Impresión Automática"

2. **Usar este acceso directo** para abrir tu sistema de ventas

#### Método B: Configurar Chrome permanentemente

1. **Cerrar Chrome completamente**
2. **Ejecutar desde PowerShell:**
   ```
   Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--kiosk-printing", "--disable-print-preview"
   ```

### 3️⃣ Configuración Adicional de Chrome

1. **Ir a `chrome://settings/printing`**
2. **Configurar:**
   - Impresora predeterminada: **XP-58IIH**
   - Mostrar vista previa: **Desactivado**
   - Imprimir usando diálogo del sistema: **Activado**

### 4️⃣ Para tu Sistema Web

El código ya está optimizado para funcionar con estos parámetros. No necesitas cambiar nada en la aplicación.

## ⚠️ IMPORTANTE

- **SIEMPRE usar el acceso directo especial** de Chrome
- **Configurar XP-58IIH como predeterminada**
- **Reiniciar Chrome** después de cambios de configuración

## 🧪 Prueba

1. Abre Chrome con el acceso directo especial
2. Ve a tu sistema de ventas
3. Realiza una venta
4. ¡Debería imprimir automáticamente sin diálogos!

---

Con esta configuración, tu XP-58IIH imprimirá automáticamente cada ticket sin mostrar ningún diálogo de confirmación. ✅
