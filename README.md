# Guía de campo TUUA — PWA

App móvil (PWA) tipo árbol de decisión para conducir entrevistas de intercept a pasajeros
en el Aeropuerto Jorge Chávez sobre el pago de la **TUUA de Transferencia**.

## Qué incluye

- **Pantalla de bienvenida**: presentación de la guía con dos accesos — *Nueva entrevista* y *Ver respuestas*.
- **Pantalla de contexto** (antes del árbol): País de origen, País de destino y Tiempo de conexión,
  en campos apilados uno bajo otro (mobile-first). Opcionales, sin identificar a la persona.
- **Árbol de decisión completo** (ramas Digital / Presencial / Caso especial → Caminos A, B, D, E, cierre)
  con las 5 sondas del Camino B y sus capturas embebidas. Colores por camino intactos.
- **PWA instalable + offline**: `manifest.json`, service worker (`sw.js`) con precache del app-shell
  y cache-first para todo (incluidas las Google Fonts al primer uso con conexión).
- **Captura de respuestas** por entrevista:
  - Nota rápida (texto libre) en cada pregunta.
  - Escala **1–5** automática en las preguntas que la piden.
  - País de origen, país de destino y tiempo de conexión (opcional) en la pantalla de contexto.
  - Se registra: hora de inicio/fin, camino recorrido (A/B/D/E) y pantalla de fricción.
  - Todo en `localStorage` del equipo (funciona offline). Nada de datos personales del pasajero.
- **Exportación** desde el botón **⋯** (arriba a la derecha): CSV (una fila por entrevista) o JSON completo.
  El badge verde muestra cuántas entrevistas van guardadas en la jornada.

## Archivos

```
index.html        App completa (lógica + capturas base64 + captura de datos)
manifest.json     Metadatos de instalación PWA
sw.js             Service worker (offline)
icons/            Íconos de la app (192/512, maskable y apple-touch)
```

## Probar localmente

```bash
cd "guia tuua"
python3 -m http.server 8137
```
Abrir `http://localhost:8137/` en el navegador. `localhost` cuenta como contexto seguro,
así que el service worker se registra y puedes probar el modo offline (DevTools → Network → Offline).

## Guardado en la nube (opcional, Google Sheets)

La app es **offline-first**: guarda local siempre y, si lo configuras, además envía cada
entrevista a **una Google Sheet tuya** (todas las entrevistadoras a la misma hoja).
Ver **`SETUP-SHEETS.md`** para los pasos (crear la hoja, pegar `google-apps-script.gs`,
publicar como Web App y pegar la URL en `index.html`).

## Desplegar

El service worker **requiere HTTPS** (o `localhost`). Sube la carpeta a cualquier hosting estático con HTTPS:
GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc. No hay build step: son archivos estáticos.

**Vercel (recomendado aquí):**
1. Sube esta carpeta a un repo de GitHub.
2. En vercel.com → **Add New → Project** → importa el repo.
3. Framework Preset: **Other** (es estático, sin build). Deploy.
4. Te da una URL `https://...vercel.app`. Cada push al repo redepliega solo.
   *(Alternativa sin repo: `npm i -g vercel` y corre `vercel` dentro de la carpeta.)*

**Instalar en el celular** (una vez desplegado, con conexión la primera vez):
- **Android/Chrome**: menú ⋮ → "Agregar a la pantalla principal" / "Instalar app".
- **iOS/Safari**: Compartir → "Agregar a inicio". Luego funciona offline como ícono.

## Notas de mantenimiento

- Si editas `index.html` u otros assets, sube el número de versión del cache en `sw.js`
  (`const CACHE = 'tuua-guia-v1'` → `v2`) para que los equipos reciban la actualización.
- Para agregar/editar preguntas, modifica el objeto `NODES` dentro de `index.html`.
  La escala 1–5 aparece sola si el texto de la pregunta contiene "1 al 5"
  (o puedes forzarla con `scale:true` en ese item de `ask`).
