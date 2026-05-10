# Hestía Your Home

Sitio estático servido desde GitHub Pages (`docs/`).

## Stack

- React 18 UMD + ReactDOM UMD (CDN unpkg, fallback local en `docs/assets/`).
- Componentes en JSX dentro de `docs/components/`.
- Estilos en `docs/assets/styles.css` (un único archivo, ~10 K líneas).
- Datos editables en `docs/data/prices.json` y `docs/data/reviews.json` vía panel de admin `/p-edit`.

## Build de los componentes JSX

Los componentes JSX se **precompilan localmente** a JavaScript plano antes de pushear (no se transforman en el cliente). Esto elimina la dependencia de Babel standalone (~3 MB) en el navegador del huésped.

### Comando

```bash
# Una vez (instala deps locales — gitignored)
npm install --no-save @babel/core @babel/preset-react

# Cada vez que toques un .jsx
node scripts/build-jsx.js
```

El script lee `docs/components/*.jsx` y escribe `docs/components/*.js` con el mismo nombre. Los `.jsx` son la fuente de verdad. Los `.js` son artefactos generados pero **se commitean** porque los HTML los cargan directamente.

### Flujo

1. Edita el `.jsx` que toca.
2. `node scripts/build-jsx.js`.
3. `git add` (incluye `.jsx` y `.js`).
4. Commit y push.

### Si olvidas hacer build

Los HTML cargan `.js`, no `.jsx`. Si pusheas `.jsx` cambiado pero `.js` viejo, el navegador verá el código antiguo. Siempre pasa por `node scripts/build-jsx.js` antes de commitear.

## Sincronización iCal (Booking + Airbnb)

GitHub Action en `.github/workflows/sync-availability.yml` corre cada 4 h y escribe `docs/assets/availability.json`. Las URLs iCal de Booking viven en GitHub Secrets (`ICAL_VM_BOOKING`, `ICAL_VT_BOOKING`, `ICAL_VS_BOOKING`). Las de Airbnb están en el workflow.

## Admin

`/p-edit.html` (no indexable) tiene dos pestañas:
- **Pricing**: edita `docs/data/prices.json`.
- **Reviews**: edita `docs/data/reviews.json`.

Login con GitHub PAT (permiso `contents: write` sobre el repo). El token vive sólo en memoria del navegador.
