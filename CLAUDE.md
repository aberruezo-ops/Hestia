# CLAUDE.md — Hestía

Instrucciones de proyecto para Claude. Léelas al inicio de cada sesión y aplícalas en TODO el código que generes.

---

## Arquitectura · contexto rápido

Hestía es un sitio estático (GitHub Pages, sirviendo desde `docs/`) con:

- **Frontend público**: HTML + JSX compilado a JS, sin bundler ni framework runtime. Los `.jsx` viven en `docs/components/` y se compilan a `.js` con `node scripts/build-jsx.js`.
- **Datos**: JSON en `docs/data/` (precios, reseñas) editables vía `/p-edit.html` con un PAT de GitHub (zona pública del repo). Datos sensibles (reservas y prereservas con datos de huéspedes) en el **repo privado `aberruezo-ops/hestia-data`** (`reservas.json`, `prereservas.json`), que `/p-edit` lee y escribe por la API de GitHub. `data-private/` sigue en `.gitignore` como salvaguarda local.
- **PDFs**: generados con `node scripts/build-pdf.mjs` desde el mismo árbol de componentes.
- **Backend**: 8 Cloudflare Workers en `workers/` (`agent-content`, `analytics-proxy`, `guide-access`, `pago`, `reviews-submit`, `sheets-sync`, `social-publish`, `traveler-registry`), cada uno con su `wrangler.toml`. El resto es estático.

**No hay backend con base de datos propia** (los Workers que guardan datos usan KV de Cloudflare). Los Workers son los únicos endpoints. No hay autenticación de usuarios finales. Las reglas de seguridad clásicas de apps fullstack se aplican parcialmente.

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

### Datos de cada Hestía (fuente: propietario, oct 2026)
- **Mar** (desde 2016, 10 años): piscina, jacuzzi y parque infantil comunitarios. El más cercano a la playa.
- **Thalassa** (8 años): ático. Dos piscinas exteriores (norte y sur), jardines, parques, pistas de pádel y tenis y **SPA comunitario** (nunca "privado"): piscina climatizada, jacuzzi, sauna, pediluvio, gimnasio y zona de relax.
- **Salinas** (6 años): **el más grande, 87 m²** (`apartment-page.jsx` `area`). Piscina, pistas de pádel y tenis y grandes jardines con riachuelos. Sin gimnasio, sin sauna, sin "tres piscinas".
- **Bañera en los tres.** Ninguno es "el único con bañera".
- **Pádel y tenis** en Thalassa y Salinas (siempre juntos: "pistas de pádel y tenis"). Mar no tiene pistas.
- **Llegada**: autónoma por defecto. Presencial sin coste de 15:00 a 19:00; fuera de ese horario con coste (`rules.extras` `lateCheckin23`/`lateCheckin00`, hoy 20 € de 19:00 a 23:00 y 40 € de 23:00 a 00:00) y sujeta a disponibilidad. Texto único: `_arrivalPolicy` (shared), usado en normas, guía PDF y contratos.
- Alex y Fran **no viven en Vera Playa** (están unidos a Almería). No escribir "vivimos aquí".
- **Reseñas**: nunca inventar ni reatribuir. Una cita destacada debe ser el texto literal de una reseña de `reviews.json` con su autor.

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

- Los datos con info de huéspedes (nombre, teléfono, DNI, importes) viven en el **repo privado `aberruezo-ops/hestia-data`**, nunca en este repo (que sirve `docs/` en público). Las fichas de viajeros (registro SES) van cifradas en el KV del Worker `traveler-registry`.
- `data-private/` está en `.gitignore`: si alguna vez se usa como copia local, no se commitea.
- La guía de marca (`docs/guia-de-marca.html`) está **cifrada** con PIN (AES-GCM, descifra el navegador). El origen legible vive en `hestia-data/guia-marca/` (ver su README); nunca subas aquí el HTML en claro ni los PIN. Para regenerarla: `GUIA_PINS="..." python3 guia-marca/build.py` desde `hestia-data`.
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

- **PROHIBIDO el guion largo / raya (`—`, em dash U+2014) en TODO el texto visible de la web** (copy, meta, JSON-LD, datos). Suena "a IA". Usa la puntuación que pida la gramática de cada frase: **coma** (apósito), **dos puntos** (introducir explicación o lista), **paréntesis** (inciso), **punto y coma** o **punto** (unir oraciones). El guion corto `–` (en dash, U+2013) sí es válido para rangos (fechas, "23 dic–6 ene"). Nunca generes un `—`.
- **Sin comentarios redundantes**: el código autoexplicativo no necesita comentarios. Solo comenta WHY no obvio (restricciones, workarounds, decisiones de negocio).
- **Sin emojis** salvo que se pidan explícitamente (esta guía es la excepción porque listamos categorías visuales del sitio).
- **Brevedad sobre brillantez**: 3 líneas claras > una elegante de 1.
- **Edita lo existente** antes de crear archivos nuevos. Pregunta antes de añadir un módulo si no es estrictamente necesario.
- **Sin backwards-compat** por defecto: si renombras o eliminas algo, hazlo limpio.

### Color por Hestía · identidad (regla siempre)

Cada Hestía tiene SU color y debe llevarlo **siempre que se le nombre o represente**, para que el usuario asocie el color al apartamento:

- **Mar** = olivo `--vm` (#6B7A3A · dk `--vm-dk` · claro `--vm2`)
- **Thalassa** = cobre `--vt` (#B86A3C · dk `--vt-dk` · claro `--vt2`)
- **Salinas** = dorado `--vs` (#D4A84A · dk `--vs-dk` · claro `--vs2`)

Cómo aplicarlo, según el fondo (respeta la regla de contraste):
- **Sobre fondo claro**: tinta el nombre/acento con el color del apartamento (`color: var(--vm|--vt|--vs)`), o su variante `-dk` si el color base no contrasta.
- **Sobre fondo oscuro o cuando teñir el texto arriesga contraste**: usa el marcador `<span className="apt-dot" data-apt="vm|vt|vs"/>` junto al nombre (primitiva en styles.css, visible en cualquier fondo). Nunca uses un color de apartamento como texto sobre un fondo con el que no contraste.

Siempre que añadas una zona que liste, enlace o compare los tres (footer, tabla, selector, alternativas, guía), cada uno lleva su color. Fuente única de los tokens: `styles.css` (`--vm/--vt/--vs`) y `_ALT_APTS` en `shared.jsx`.

### Iconografía · gramática "Sello" (regla siempre)

Todos los iconos de la web salen del sprite propio (`IconSprite` en `shared.jsx`) y se pintan con `<HiIcon name="…"/>`. Gramática única:

- **Trazo fino (1,5)** en `currentColor` y **esquina asimétrica de la marca** (sup-izq e inf-der redondeadas) en toda forma rectangular.
- **Segunda tinta**: la masa principal del icono en color plano, desplazada 2 px (`.hi-plate`), como un sello impreso fuera de registro. En iconos de solo trazo abierto, el trazo desplazado (`.hi-plate-ln`).
- **El color de marca vive en la placa, nunca en el trazo.** La placa usa `--hi-accent`, que sigue al apartamento si el contenedor define `--apt-accent`; para forzarlo en un sitio, `--hi-tint`. El trazo va en color de texto (tinta sobre claro, crema sobre oscuro). Trazo y placa del mismo tono = mancha: es un bug.
- **Sin fichas ni círculos de fondo** detrás del icono: el sello ya es su soporte.
- **Nada de emojis ni glifos (`✓ ✦ ★ ✗`) haciendo de icono** en la interfaz: usa `check`, `spark` (tesela), `star-fill`, `ban`… Solo quedan como texto donde no se puede pintar un icono (mensajes de WhatsApp, asuntos de email) y en controles tipográficos (`✕` de cerrar).
- Dentro del `<symbol>`, estilos solo por clase sin selector de ancestro (`.hi-plate`, `.hi-ln`, `.hi-fi`): los selectores anidados no alcanzan el contenido de un `<use>`.
- Excepciones: logos de plataformas (Booking, Airbnb, Google, WhatsApp, redes) y piezas de marca (logo, Indalo), que conservan su dibujo.

### Contraste · regla preventiva (fondos oscuros)

> El contraste oscuro-sobre-oscuro ha sido un fallo recurrente. Para que no vuelva a pasar:

- **Toda sección con fondo oscuro lleva la clase `on-dark`** (en `styles.css`: fija el color de texto por defecto en claro, `--crema`). Así, si un elemento olvida declarar su color, hereda claro (legible), no el oscuro de página.
- **Contrapartida obligatoria**: toda superficie clara anidada (tarjeta blanca, input, píldora clara) sobre un fondo oscuro **declara su propio color de texto oscuro** (`color: var(--ink)`), para no heredar claro-sobre-blanco.
- **Nunca** uses `--ink`, `--ink-soft` ni un acento oscuro (de marca) para texto que va directo sobre un fondo oscuro. Usa los tonos crema (`--crema`, `rgba(240,232,213,...)`).
- **Cubre todos los estados**, no solo el inicial: `:hover`, `:focus`, `:disabled`, vacío, cargando y "no disponible". El audit de contraste solo recorre el estado inicial de cada página, así que los estados que aparecen tras interactuar (resultados, no disponible, desplegables) no los caza: revísalos a mano.

## Tests y verificación

- Dependencias de desarrollo fijadas en `package.json` (`npm install`). Comandos: `npm run build` (JSX → JS), `npm run test:pricing` (invariantes de precio + consistencia), `npm run test:smoke` y `npm run test:contrast` (requieren `docs/` servido en local), `npm run pdf`.
- La CI (`.github/workflows/checks.yml`) en cada push/PR: **bloquea** si fallan las invariantes de precio (`test-pricing.mjs`), los tests de los Workers (`workers/*/test.mjs`, con KV simulado) o el smoke test (errores JS, pantalla en blanco, enlaces internos rotos); **reporta** sin bloquear la consistencia de precio, el desfase JSX/JS y el contraste WCAG.
- Cuando toques algo crítico, además: compila, construye los PDFs si tocas la guía y **verifica en el navegador** antes de pushear (Playwright MCP, ver abajo).


---

## Claude Code en este proyecto

- **Publicación**: tras cada cambio, commit en la rama de trabajo, push y **fusión directa en `main` sin preguntar** (decisión del propietario). La skill `/publicar` hace el ritual completo.
- **Hooks** (`.claude/settings.json`, scripts en `scripts/claude-hooks/`):
  - Antes de editar: `pre-edit-secrets.mjs` bloquea ficheros de secretos (`.env`, `.dev.vars`, `.pem`/`.key`) y tokens (GitHub, Anthropic, AWS, claves privadas).
  - Después de editar: `post-edit.mjs` compila el JSX (y avisa si falla), sube `styles.css?v=` en los HTML y avisa si el texto nuevo de `docs/` trae un guion largo.
  - Los hooks solo ven ediciones hechas con Edit/Write: si cambias JSX o CSS por script, compila y sube la versión del CSS a mano.
- **Subagente `revisor-marca`** (`.claude/agents/`): revisa voz, color por apartamento, iconografía "Sello" y contraste antes de publicar cambios visibles.
- **MCP** (`.mcp.json`): Playwright para verificar en el navegador; Cloudflare (observabilidad y bindings) para logs y KV de los Workers, con login de Cloudflare.
- **GateGuard** (plugin ECC): exime `/tmp/**` y no frena el Bash rutinario; el control de comandos destructivos sigue activo.

---

Este archivo es la fuente de verdad para reglas de seguridad y estilo del proyecto. Actualízalo cuando cambien las premisas.
