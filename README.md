# Resend + Vite — Guía paso a paso (en español)

Este proyecto es un ejemplo mínimo que muestra cómo enviar correos usando la API de Resend a través de un backend en Node.js (Express) y un frontend con Vite.

---

## 📋 Resumen rápido
- **Frontend:** `src/main.js` — formulario para enviar correos (hace POST a `/api/send`).
- **Backend:** `server.js` — endpoint `POST /api/send` que llama a `https://api.resend.com/emails` usando `RESEND_API_KEY`.
- **Proxy de desarrollo:** `vite.config.js` — redirige `/api` a `http://localhost:3000`.

---

## 1) Preparar variables de entorno (obligatorio)
1. Copia `.env.example` a `.env`:
   - Windows (PowerShell): `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
2. Rellena los valores dentro de `.env`:

```
RESEND_API_KEY=tu_api_key_real_aqui
SENDER_EMAIL=tu_remitente_verificado@example.com
RECIPIENT_EMAIL=destinatario@example.com  # opcional: valor por defecto
PORT=3000
```

---

## 2) Instalar dependencias
- Recomendado (usa `pnpm` si lo tienes):
  - `pnpm install`
- Alternativa con npm:
  - `npm install`

---

## 3) Ejecutar la aplicación en desarrollo
1. En una terminal arrancar el backend:
   - `npm start` (ejecuta `node server.js`)
2. En otra terminal arrancar Vite (frontend):
   - `pnpm dev` o `npm run dev`
   - O usa el script único que arranca backend + frontend: `npm run dev:all` (usa `concurrently`).

> ⚠️ Si al arrancar `npm run dev:all` ves un error `EADDRINUSE: address already in use` significa que el puerto (por defecto `3000`) ya está en uso. Soluciones:
>
> - Parar procesos Node existentes (PowerShell):
>   - `Get-Process node | Stop-Process -Force`
> - Cambiar el puerto editando `.env` (por ejemplo `PORT=3001`) y reiniciar `npm run dev:all`.
> - Alternativa (PowerShell) para ejecutar en otro puerto temporalmente:
>   - `$env:PORT=3001; npm run dev:all`

3. Abrir el navegador en `http://localhost:5173` y usar el formulario para enviar correos.

---

## 4) Cómo probar el envío (curl / Postman)
- Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/api/send \
  -H 'Content-Type: application/json' \
  -d '{"to":"destino@example.com","subject":"Asunto","html":"<p>Hola desde Resend</p>"}'
```

- El backend espera un JSON con estas propiedades (solo `to` es obligatorio):
  - `to` (string) — dirección del destinatario
  - `subject` (string) — asunto (opcional)
  - `html` (string) — cuerpo HTML (opcional)

- Respuesta (éxito): JSON con `success: true` y `data` con la respuesta de Resend.
- En caso de error el endpoint devuelve el JSON de error tal como lo devuelve Resend.

---

## 5) ¿Cómo funciona internamente? 🔧
1. El frontend envía un POST a `/api/send` con `{ to, subject, html }`.
2. `server.js` lee `RESEND_API_KEY` y `SENDER_EMAIL` desde las variables de entorno.
3. El servidor construye el payload y hace una petición POST a `https://api.resend.com/emails` con `Authorization: Bearer <RESEND_API_KEY>`.
4. Resend procesa el envío y devuelve la respuesta que `server.js` reenvía al cliente.

---

## 6) Solución de problemas (tips) ⚠️
- Error `RESEND_API_KEY not configured` o `SENDER_EMAIL not configured`: verifica `.env` y reinicia el servidor.
- Resend devuelve error 4xx/5xx: revisa el JSON de error que devuelve el endpoint para detalles (dominios rechazados, remitente no verificado, etc.).
- Si el correo no llega: comprueba la carpeta de spam del destinatario y el panel de Resend para eventos y rechazos.
- **Comprobación rápida:** la app expone `GET /api/health` que devuelve `{ status: 'ok', uptime, timestamp }`. Puedes comprobarlo con:

```bash
curl -s http://localhost:3000/api/health
```

- Validación: ahora hay validación **cliente** (UI) y **servidor** para el formato de la dirección `to` — el servidor devuelve 400 si el formato es inválido.
- Problemas de CORS: en desarrollo Vite usa proxy; si despliegas el servidor en producción, asegúrate de configurar CORS/HTTPS correctamente.

---

## 7) Seguridad y buenas prácticas 🔒
- NUNCA pongas la `RESEND_API_KEY` en código cliente o en repositorios públicos.
- Verifica que `SENDER_EMAIL` esté autorizado o verificado en tu cuenta de Resend si es necesario.
- Registra y monitorea los envíos y errores en tu cuenta de Resend.

---

## 8) Siguientes pasos recomendados
- Añadir validación de correo en el frontend para evitar enviar valores mal formados.
- Añadir una ruta `GET /api/health` para comprobar el estado del servidor.
- Añadir pruebas automatizadas y logs más detallados en producción.

---


