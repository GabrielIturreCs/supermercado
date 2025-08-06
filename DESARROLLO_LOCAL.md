# Guía de Desarrollo Local

## Configuración para desarrollo local

### Backend (Puerto 3000)

1. **Navegar al directorio del backend:**
   ```bash
   cd c:\Users\gabriel\Desktop\supermeercadoapp\backend
   ```

2. **Instalar dependencias (si no están instaladas):**
   ```bash
   npm install
   ```

3. **Ejecutar el backend localmente:**
   ```bash
   # Para Windows (recomendado)
   npm run dev:win
   
   # O alternativamente
   npm run local
   
   # Para Linux/Mac
   npm run dev
   ```

4. **Verificar que funciona:**
   - Abrir en navegador: http://localhost:3000/health
   - Debería mostrar: `{"status":"OK","timestamp":"...","uptime":...}`

### Frontend (Puerto 4200)

1. **Navegar al directorio del frontend:**
   ```bash
   cd c:\Users\gabriel\Desktop\supermeercadoapp\frontend
   ```

2. **Instalar dependencias (si no están instaladas):**
   ```bash
   npm install
   ```

3. **Ejecutar el frontend:**
   ```bash
   npm start
   # o
   ng serve
   ```

4. **Acceder a la aplicación:**
   - Abrir en navegador: http://localhost:4200

## Configuración actual

- **Backend local:** http://localhost:3000/api
- **Frontend local:** http://localhost:4200
- **Base de datos:** MongoDB Atlas (compartida con producción)

## Troubleshooting

### Si el backend no funciona:
1. Verificar que el puerto 3000 esté libre
2. Revisar que el archivo `.env` exista en `/backend`
3. Verificar la conexión a MongoDB en los logs

### Si hay errores de CORS:
- El backend está configurado para aceptar requests desde localhost:4200
- Si usas otro puerto, actualizar la configuración CORS en `server.js`

### Para production:
- Backend: Render (automático)
- Frontend: Render (automático)
- Variables de entorno gestionadas por Render
