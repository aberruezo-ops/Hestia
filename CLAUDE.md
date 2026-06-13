# CLAUDE.md — Hestía

Instrucciones de proyecto para Claude. Léelas al inicio de cada sesión y aplícalas en TODO el código que generes.

---

## Arquitectura · contexto rápido

Hestía es un sitio estático (GitHub Pages, sirviendo desde `docs/`) con:

- **Frontend público**: HTML + JSX compilado a JS, sin bundler ni framework runtime. Los `.jsx` viven en `docs/components/` y se compilan a `.js` con `node scripts/build-jsx.js`.
- **Datos**: JSON en `docs/data/` (precios, reseñas) editables vía `/p-edit.html` con un PAT de GitHub (zona pública del repo). Datos sensibles (reservas con datos de huéspedes) en `data-private/` — fuera de `docs/`, no servidos por Pages.
- **PDFs**: generados con `node scripts/build-pdf.mjs` desde el mismo árbol de componentes.
- **Backend**: hay UN Cloudflare Worker (analytics) — el resto es estático.

**No hay backend con base de datos.** No hay endpoints. No hay autenticación de usuarios finales. Las reglas de seguridad clásicas de apps fullstack se aplican parcialmente.

---

## Reglas de negocio · INVARIANTES (cosas que NO pueden ocurrir)

> Catálogo de verdades del negocio que SIEMPRE deben cumplirse. Antes de tocar precios,
> calendario, disponibilidad, reservas o copy comercial, repasa esta lista. Si un cambio
> contradice una regla, es un bug. Mantenla actualizada cuando cambien las premisas.
> Cada regla lleva [dónde se aplica] para localizar el código.

### Estancias largas
- **NO existen estancias largas con check-in en julio ni en agosto.** Solo de septiembre a junio. [estancias-largas-page · reservas-page `isLsStay` · sections-1 `_isLongStayGap` · shared `_calcLsTotal`]
- **Mínimo 29 noches** para considerarse estancia larga. Por debajo, es estancia normal.
- Tarifa **mensual desde `prices.json` → longStayConfig.monthlyRates** (hoy baja 1.490 · media 1.590 · alta 1.850 €/mes). NUNCA hardcodear el "desde X€/mes" (ni en HTML/meta/JSON-LD).
- Noches de **Navidad (23 dic–6 ene)** y **Semana Santa** → tarifa plana `specialNightFlat` (hoy 80 €/noche), no la mensual prorrateada.
- En el calendario, una fecha se bloquea **solo si los TRES apartamentos están ocupados** esa noche (basta uno libre para poder seleccionar).

### Disponibilidad y reservas
- **No se aceptan reservas por debajo de la estancia mínima**: `minNights` (hoy 3) general; `criticalSeasonMinNights` (hoy 7) en temporada crítica; ventana inminente `imminentDays` (hoy 7). [prices.json `rules` · `_calcStay` · DateRangePicker `too-soon`]
- **No se puede reservar una fecha ya ocupada** (availability.json iCal + `manual_blocks` de prices.json). Ambas fuentes cuentan.
- El precio que ve el huésped SIEMPRE sale de **`_calcStay` / prices.json** (fuente única). NUNCA calcular o hardcodear precios en un componente. [shared `_calcStay`]
- **Huecos cortos (2–5 noches)**: las ofertas se recalculan solas (last-minute por temporada); las **ofertas manuales no se pisan** ni se borran si el hueco no cambió. [scripts/recalc-gap-offers.mjs]

### Mascotas y huéspedes
- **Mascotas: permitidas en los 3 Hestías**, con petición previa y suplemento (hoy 10 €/noche, máx 50 €). Nunca vetos ni tarifas abusivas. [prices.json `petPerNight`/`petMax`]
- No exceder la **capacidad de cada apartamento** (huésped extra: `extraGuestPerNight`, hoy 5 €/noche). Todos los huéspedes que pernoctan van en el contrato (parte SES).

### Reserva directa (copy comercial — debe ser coherente en TODA la web)
- Ahorro: **"hasta un 10% aprox."** (no un número fijo distinto). [shared `DIRECT_PERKS`/`DIRECT_RIBBON`]
- Promesa de precio: **"no solo igualamos, mejoramos"** + **0% comisiones**. No prometer otra cosa.
- Pago: **señal ~20%** al firmar el contrato, **resto a la llegada**. Respuesta humana **≤1 h** (normalmente minutos).

### Datos y secretos (ver también sección Seguridad)
- **JAMÁS** datos personales de huéspedes (nombre+contacto, DNI, teléfono, importes) dentro de `docs/` ni en commits públicos. Van en el repo privado `hestia-data` / `data-private/`.
- **JAMÁS** PATs, API keys ni secretos en el código.

---

## Seguridad — reglas de obligado cumplimiento

Aplica estas medidas a TODO el código nuevo y revisa lo existente cuando lo toques.

### 1. Variables de entorno y secretos

- **NUNCA** escribas API keys, tokens, contraseñas o secretos directamente en el código (incluido el JSX que se compila a `docs/components/*.js` y se publica en la web).
- Los **PATs de GitHub** del admin viven SOLO en memoria del navegador durante la sesión de `/p-edit.html`. NUNCA los guardes en `localStorage`, `sessionStorage`, cookies, ni los envíes a ningún endpoint que no sea `api.github.com` con HTTPS.
- Para Workers de Cloudflare, usa **variables secretas** (`wrangler secret put`), no constantes en el código del worker.
- Si necesitas una variable nueva, documenta su existencia (no su valor) en un `.env.example` o en el README del worker correspondiente.
- Cualquier ID o token "no secreto" pero identificador (account ID, site tag) puede ir en el código del navegador SOLO si no permite acciones destructivas por sí mismo. Si das acceso a datos sensibles, hazlo vía Worker con secreto.

### 2. Validación de inputs

- **Frontend admin (`/p-edit`)**: valida formularios antes de enviar a la API de GitHub. Schema en JS (puede ser un objeto simple con tipos esperados); rechaza y muestra error si no encaja.
- **Forms públicos (contacto, opiniones)**: ya validan client-side con sanitización básica (escapar tags HTML, longitudes máximas). Mantén este patrón.
- Si añades un Worker que reciba input externo: valida con una librería tipo `zod` o equivalente; rechaza con `400` y loggea (sin contenido del input bruto si pudiera contener secretos).
- **JAMÁS** uses `dangerouslySetInnerHTML` con contenido del usuario sin sanitizar (usar DOMPurify si fuera imprescindible). React escapa por defecto — mantén esa garantía.

### 3. Rate limiting

- Aplica rate limiting en CUALQUIER Worker de Cloudflare que añadas que reciba peticiones del navegador.
  - **API general**: 100 req/IP/15 min.
  - **Endpoints sensibles** (escritura, acciones admin): 10 req/IP/15 min.
  - Devuelve `429 Too Many Requests` con mensaje claro y `Retry-After` header.
- Usa `@upstash/ratelimit` con Cloudflare KV o el bucket de Cloudflare Rate Limiting Rules (panel CF).

### 4. Headers de seguridad

- Si añades un Worker que sirva HTML, configura como mínimo:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Content-Security-Policy: default-src 'self'; …` (ajustar según assets)
  - `Referrer-Policy: strict-origin-when-cross-origin`
- Para el sitio estático en GitHub Pages: configura los headers via `_headers` (si pasamos a Cloudflare Pages) o documenta la limitación.

### 5. Datos sensibles · zona privada

- Los datos con info de huéspedes (nombre, teléfono, DNI, importes) viven en `data-private/` (fuera de `docs/`).
- Si el repo es **público en GitHub**, los archivos de `data-private/` siguen siendo visibles para cualquiera que clone. **El repo debe ser privado** para que esa carpeta proteja realmente los datos.
- Nunca añadas datos personales en `docs/` ni en commits que se publiquen (incluido en mensajes de commit o nombres de archivo).
- Si tienes que mover datos privados a otro sitio (Supabase, Firestore, etc.), documenta la migración aquí.

### 6. Autenticación

- El admin se autentica con un PAT de GitHub introducido por el usuario en cada sesión.
- NO se persiste. NO se loggea. NO se envía a ningún endpoint que no sea `api.github.com`.
- Si en el futuro añadimos auth de usuarios finales: usar OAuth con proveedor (Google/GitHub), tokens en cookies `httpOnly + Secure + SameSite=Lax`, CSRF protection para formularios POST.

### 7. Logging

- En el sitio estático: solo telemetría agregada de Cloudflare Web Analytics (no recoge IPs ni datos personales).
- En Workers: loggea con `console.log` (queda en Cloudflare logs) — pero NUNCA loggees el contenido bruto de PATs, tokens, contraseñas ni datos personales de huéspedes (nombre, DNI, teléfono).
- Loggea: peticiones rechazadas por rate limit, validación fallida, errores 5xx, intentos de auth fallidos. SIN incluir el input bruto sensible.

### 8. Dependencias

- Antes de añadir una dependencia, verifica que está mantenida (commits recientes), tiene 0 vulnerabilidades conocidas (`npm audit`) y es la mínima necesaria.
- Prefiere implementar lo que necesites en JS plano si son <50 líneas, en vez de tirar de paquete.

### 9. Commits

- NUNCA hagas commit de:
  - `.env`, `.env.local`, `*.pem`, `*.key`, JSONs de service accounts de GCP
  - PATs, API keys, tokens en cualquier formato
  - Datos de huéspedes con nombre + contacto en archivos dentro de `docs/`
- `.gitignore` ya cubre los archivos típicos. Si añades un nuevo tipo de secreto, actualiza `.gitignore` antes del primer commit.
- Antes de un `git push`, verifica `git diff --stat` para no subir nada sospechoso.

---

## Estilo de código

- **Sin comentarios redundantes**: el código autoexplicativo no necesita comentarios. Solo comenta WHY no obvio (restricciones, workarounds, decisiones de negocio).
- **Sin emojis** salvo que se pidan explícitamente (esta guía es la excepción porque listamos categorías visuales del sitio).
- **Brevedad sobre brillantez**: 3 líneas claras > una elegante de 1.
- **Edita lo existente** antes de crear archivos nuevos. Pregunta antes de añadir un módulo si no es estrictamente necesario.
- **Sin backwards-compat** por defecto: si renombras o eliminas algo, hazlo limpio.

## Tests y verificación

- No hay suite de tests automatizada aún. Cuando toques algo crítico:
  - **Compila**: `node scripts/build-jsx.js`
  - **Build PDFs si tocas la guía**: `node scripts/build-pdf.mjs`
  - **Verifica localmente** abriendo `docs/index.html` o `docs/p-edit.html` antes de pushear.

---

Este archivo es la fuente de verdad para reglas de seguridad y estilo del proyecto. Actualízalo cuando cambien las premisas.
