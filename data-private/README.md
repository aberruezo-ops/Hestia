# Zona privada del repo (NO publicada en la web)

Esta carpeta vive **fuera de `docs/`**, por lo que **GitHub Pages NO la
sirve**. Los archivos de aquí solo son accesibles vía la API de GitHub
con un token (PAT con permiso `contents:write` sobre el repo).

Si el repo es público en GitHub, cualquiera puede ver estos archivos
clonándolo. Para máxima privacidad, **el repo debe ser privado**.

## Archivos

- **`reservas.json`** — snapshot de la hoja "Hestía - Reservas" en Google
  Drive. Lo lee y escribe la pestaña 🗓️ Reservas de `/p-edit.html`
  usando el mismo PAT que ya usas para `prices.json` y `reviews.json`.

## Sincronización con Google Sheets

El snapshot inicial lo hace Claude vía MCP. Para refresco en vivo desde
el navegador, ver `SETUP-SHEETS-SYNC.md`.
