# hestia-traveler-registry

Backend del **registro de viajeros** (RD 933/2021 · SES.HOSPEDAJES). Recibe los
datos que rellena el huésped en `/registro.html`, los **cifra** (AES-GCM) y los
guarda en Cloudflare KV. Solo se leen desde `/p-edit` con un secreto.

## Privacidad

- Los datos son **personales de identificación**: NO viven en el repo público ni
  en `localStorage`. Solo aquí, cifrados.
- Doble cifrado: en reposo (Cloudflare KV) + AES-GCM con clave derivada de
  `ENCRYPT_KEY`. Si alguien vaciara el KV, sin la clave los datos son ilegibles.
- Retención automática ~3 años (`RETENTION_DAYS`), como marca la ley; luego el
  registro expira solo en KV.
- CORS restringido a los dominios de Hestía. Rate limit por IP.

## Despliegue

```bash
cd workers/traveler-registry
wrangler kv namespace create REG_KV     # copia el id en wrangler.toml
wrangler secret put READ_SECRET         # clave larga y aleatoria (la usarás en /p-edit)
wrangler secret put ENCRYPT_KEY         # frase larga distinta (cifra los datos)
wrangler deploy
```

Al terminar, copia la URL del Worker en:

- `docs/components/registro-page.jsx` → `TRAVELER_WORKER_URL`
- La pestaña **Registro de viajeros** de `/p-edit` (constante `TRAVELER_WORKER_URL`).

## Rutas

| Método | Ruta | Quién | Qué |
|--------|------|-------|-----|
| POST | `/submit` | huésped | Guarda la ficha. Body `{ token, lang, travelers[] }` |
| GET | `/list?key=SECRET` | admin | Todas las fichas descifradas |
| GET | `/reg?key=SECRET&token=…` | admin | Una ficha |
| POST | `/prefill` | admin | Guarda el prefill de una reserva. Body `{ key, token, prefill }` |
| GET | `/prefill?token=…` | huésped | Devuelve el prefill (token largo = credencial) |

`token` = identificador de la reserva (uno por enlace enviado al huésped).

## Dos tipos de enlace (desde /p-edit → editor de reserva)

- **"Enlace registro"** → `registro.html?r=…&n=…&tel=…` : va directo al formulario con
  el Viajero 1 relleno (datos en la URL; la página no los filtra a terceros).
- **"Enlace acceso"** → `mar.html?acceso=<token>` : abre **la guía sin PIN** y, al pulsar
  "Rellenar mis datos", el formulario pide el prefill a `/prefill?token=` (los datos NO
  van en la URL; se guardan cifrados aquí). El token es largo e imposible de adivinar,
  así que la lectura del prefill es segura (el PIN de 4 cifras no valdría: sería
  enumerable). El nº de soporte y el documento nunca se prerrellenan.

## Enlace por reserva

El anfitrión comparte `https://www.hestiayourhome.com/registro.html?r=<token>`
por WhatsApp/email. El `token` puede ser cualquier cadena única por reserva
(p. ej. `vm-2026-07-10-esther`). Al enviar, la ficha queda guardada bajo ese
token y aparece en `/p-edit`.

## SES.HOSPEDAJES

Fase 1: en `/p-edit` se genera el fichero para subir **manualmente** a
SES.HOSPEDAJES. La automatización (envío directo por el servicio web de SES al
inicio de la estancia) es una fase posterior y requiere el alta del
establecimiento en SES con sus credenciales/certificado.
