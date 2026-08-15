# Guardar las entrevistas en Google Sheets (gratis)

La app funciona **100% local (offline)** aunque no configures nada. Esto es **opcional** y hace que
todas las entrevistas de todos los teléfonos caigan en **una misma hoja de cálculo tuya**.

Patrón: **offline-first + sync** — guarda local al instante y, cuando hay conexión, envía a tu Sheet.

---

## 1. Crear la hoja y el script

1. Crea una **Google Sheet** nueva (hoja en blanco) en tu Google Drive.
2. Menú **Extensiones → Apps Script**.
3. Borra el código que aparece y **pega todo el contenido de `google-apps-script.gs`**.
4. Guarda (💾).

## 2. Publicar como Web App

1. En Apps Script: botón **Implementar → Nueva implementación**.
2. Tipo (⚙️ engranaje): **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** **Cualquier usuario**
4. **Implementar** → autoriza con tu cuenta Google (te pedirá permiso para editar la hoja; acepta).
5. Copia la **URL de la aplicación web** (termina en **`/exec`**).

> Para probar que quedó bien: abre esa URL `/exec` en el navegador. Debe responder
> `{"ok":true,"service":"guia-tuua"}`.

## 3. Pegar la URL en la app

Abre `index.html` y edita esta línea (cerca de la línea 560):

```js
const SHEETS_URL = 'https://script.google.com/macros/s/AKfy..../exec';
```

Guarda y vuelve a desplegar. En el panel **⋯** verás *"Todo enviado a Google Sheets ✓"*.

---

## Cómo se comporta

- Cada entrevista se guarda local **al instante** (funciona sin señal).
- Con conexión, se envía sola a tu Sheet (a los ~1.5 s de cada cambio y al abrir el panel ⋯).
- Sin señal: queda en cola local y sube cuando vuelve el internet, o al tocar **"Sincronizar ahora"**.
- Cada entrevista tiene un `id` único → si se envía dos veces, **actualiza** la misma fila (no duplica).
- La hoja `Entrevistas` tendrá columnas: id, inicio, fin, país origen/destino, conexión, camino,
  fricción, respuestas (legible) y `raw` (JSON completo por si acaso).

## Notas

- La app usa envío `no-cors`: el dato llega a tu Sheet, pero el navegador no puede leer la respuesta.
  Por eso la primera vez **verifica** que aparezca una fila de prueba en la hoja.
- Tu **respaldo siempre disponible** es el botón **Exportar CSV/JSON** (datos del teléfono),
  aunque falle el internet o el script.
- Si cambias el código del script, crea una **nueva implementación** (o "Administrar implementaciones"
  → editar → nueva versión) para que tome los cambios.
