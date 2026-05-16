# Sincronización Google Sheets ↔ /p-edit Reservas

## Estado actual

- ✅ **Snapshot inicial**: `data-private/reservas.json` poblado por Claude leyendo la hoja "Hestía - Reservas" (file ID `1dWJPG-GxAyHWbRPbSLpp3mTe11bYVA1VaJhKEytUygg`).
- ✅ **Lectura + edición + escritura del JSON**: la pestaña 🗓️ Reservas de `/p-edit.html` lee y escribe `data-private/reservas.json` vía la API de GitHub con tu PAT (igual que `prices.json`).
- ⚠️ **Live sync con Google Sheets**: pendiente de configurar (instrucciones abajo).

Mientras no configures el live-sync, el flujo es:
1. Editas reservas en `/p-edit` → se guardan en `data-private/reservas.json`.
2. Cuando quieras volcarlas al Sheet, las copias a mano o me pides a Claude que lo haga vía MCP.
3. Cuando alguien edite el Sheet (Fran, Booking sync, etc.), me pides snapshot fresco.

## Live sync — receta

Requiere 3 cosas:

### 1. Service Account en Google Cloud

1. Entra a [console.cloud.google.com](https://console.cloud.google.com) → crea un proyecto "hestia-sheets-sync".
2. **APIs & Services → Library** → busca "Google Sheets API" → activa.
3. **APIs & Services → Credentials → + Create credentials → Service account** → nombre `hestia-sheets-bot`.
4. En la fila del nuevo service account: **Keys → Add key → Create new key → JSON** → descarga el `.json`.
5. Copia el `client_email` del JSON (algo como `hestia-sheets-bot@hestia-sheets-sync.iam.gserviceaccount.com`).
6. En Google Drive abre la hoja "Hestía - Reservas" → botón **Compartir** → pega ese email → permiso **Editor**.

### 2. Cloudflare Worker (proxy)

Crea un nuevo worker en tu cuenta de Cloudflare (ya tienes uno para analytics). Código base:

```js
// hestia-sheets-proxy worker
import { GoogleAuth } from 'google-auth-library';  // o JWT manual

const SHEET_ID = '1dWJPG-GxAyHWbRPbSLpp3mTe11bYVA1VaJhKEytUygg';
const RANGE = "'2026'!A1:AC100";  // ajusta a la pestaña real

export default {
  async fetch(req, env) {
    // Auth con service account (env.GCP_SA_KEY = JSON pegado)
    const sa = JSON.parse(env.GCP_SA_KEY);
    const token = await getAccessToken(sa);
    if (req.method === 'GET') {
      const r = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return new Response(await r.text(), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
      });
    }
    if (req.method === 'PUT') {
      const body = await req.text();
      const r = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?valueInputOption=USER_ENTERED`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body }
      );
      return new Response(await r.text(), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
      });
    }
    return new Response('Method not allowed', { status: 405 });
  }
};

async function getAccessToken(sa) {
  // Implementar JWT firmado con sa.private_key, scope:
  // https://www.googleapis.com/auth/spreadsheets
  // ... (~30 líneas, se puede copiar de any GCP SA worker example)
}
```

3. **Variables → secretos del worker**: añade `GCP_SA_KEY` con el contenido entero del JSON descargado.
4. Despliega y anota la URL (algo como `https://hestia-sheets-proxy.tu-cuenta.workers.dev`).

### 3. Conectar /p-edit

En `docs/components/admin-page.jsx`, en `ReservasTab`, añade el botón "🔁 Sincronizar con Sheets" que llama al worker:

```js
const SHEETS_WORKER_URL = 'https://hestia-sheets-proxy.tu-cuenta.workers.dev';
// GET → lee el sheet en vivo
// PUT → escribe el JSON (convertido a array de arrays) de vuelta al sheet
```

Cuando lo tengas operativo, dímelo y conecto las dos vías.

## Por qué no se puede hacer sin esto

- El navegador no puede llamar directamente a Google Sheets API sin OAuth o un API key visible (mal).
- El service account necesita firmar JWTs con su clave privada — eso debe pasar en un servidor (el worker), no en el navegador.
- El worker hace de intermediario y mantiene el secreto.
