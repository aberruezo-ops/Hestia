---
name: chequeo-seguridad
description: >-
  Chequeo de seguridad del proyecto Hestía. Úsala cuando te pidan "revisa la
  seguridad", "haz un security review", "audita esto", "¿hay algún hallazgo de
  seguridad?", antes de un deploy de cualquier Worker, o siempre que toques
  algo sensible de ESTE repo: los Workers de workers/*, el admin /p-edit
  (admin-page.jsx), el registro de viajeros (PII, RD 933/2021), los pagos
  (Stripe/PayPal en workers/pago), los datos privados (data-private/, repo
  hestia-data), CORS, secretos o wrangler.toml. Enseña a hacer el chequeo
  exactamente como en este proyecto: hallazgos con archivo, línea, severidad y
  cómo se explotan; falsear cada hallazgo antes de reportarlo; y decir con
  honestidad qué NO se revisó.
---

# Chequeo de seguridad · Hestía

Manual para auditar la seguridad de ESTE repo. No es teoría genérica: son los
archivos, comandos y puntos débiles reales de Hestía. Sigue el orden. No
inventes hallazgos: la regla de oro (más abajo) manda sobre todo lo demás.

## Lo que tienes que saber del proyecto antes de empezar

- **Sitio estático** en `docs/`, servido por **GitHub Pages**. El repo
  `aberruezo-ops/hestia` es **PÚBLICO**: todo lo que entre en `docs/` o se
  committee es visible para el mundo al instante. Esto sube a **crítico**
  cualquier PII en `docs/` o cualquier secreto committeado.
- **JSX → JS**: los `.jsx` de `docs/components/` se compilan con
  `node scripts/build-jsx.js`. El navegador carga los `.js`. Todo el JS
  compilado es **público**: nada que esté ahí es secreto (ni los PIN de guía).
- **6 Cloudflare Workers** en `workers/*` (el único backend real):
  | Worker | Qué toca | Secretos | Sensibilidad |
  |---|---|---|---|
  | `traveler-registry` | PII de viajeros (DNI, pasaporte) cifrada AES-GCM en KV, RD 933/2021 | `READ_SECRET`, `ENCRYPT_KEY` | **máxima** |
  | `pago` | Stripe + PayPal + escribe a Google Sheets | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_*`, `GCP_SA_KEY` | **máxima** |
  | `sheets-sync` | Vuelca reservas a Google Sheets | `GCP_SA_KEY` | alta |
  | `social-publish` | Publica en IG/FB (Meta Graph) | `META_TOKEN`, `PUBLISH_SECRET`, `IG_USER_ID`, `FB_PAGE_ID` | alta |
  | `guide-access` | Registra accesos a la guía (sin PII) | `READ_SECRET` | media |
  | `analytics-proxy` | Proxy del beacon de CF Web Analytics | ninguno | baja |
- **Admin `/p-edit`** (`docs/components/admin-page.jsx`): login con **PAT de
  GitHub** que vive SOLO en memoria (`const REPO = 'aberruezo-ops/hestia'`,
  `const PRIVATE_REPO = 'aberruezo-ops/hestia-data'`). Lee/escribe la reserva
  con datos de huésped desde el **repo privado** `hestia-data`.
- **Datos**: `docs/data/*.json` (precios, reseñas) son públicos y editables.
  La PII real vive en (a) el repo privado `hestia-data`, (b) el KV cifrado de
  `traveler-registry`. `data-private/` está en `.gitignore` y no debe existir
  en `docs/`.
- **Formularios públicos** (contacto, opinión, reservas, empresas) envían a
  **Web3Forms** con un `access_key` que es **público por diseño** (solo enruta
  a un email, no da acceso destructivo). No lo trates como secreto filtrado.

## Orden del chequeo

Hazlo en este orden. Cada paso trae el comando real y el patrón concreto a
buscar en este repo.

### 1. Secretos expuestos o committeados

Lo primero, porque en repo público es lo más caro.

```bash
# Secretos reales en fuentes (excluye bundles CDN y .js compilado, que son ruido)
git grep -nE "sk_live|sk_test|whsec_|ghp_|github_pat_|xox[baprs]-|-----BEGIN [A-Z ]*PRIVATE KEY" -- \
  ':(exclude)docs/assets/react*.js' ':(exclude)docs/assets/babel*.js' \
  ':(exclude)docs/components/*.js' ':(exclude)*.min.js'

# Ningún secreto inline en la config de los Workers (deben ir por `wrangler secret put`)
grep -iE "secret|token|password|private_key|api.?key" workers/*/wrangler.toml

# Nada de PII ni claves en el árbol público en el último cambio
git diff --stat origin/main..HEAD -- docs/ data-private/
```

- **Esperado sano**: los únicos aciertos son *placeholders* (`github_pat_…` en
  el input de login, `sk_test_...` en comentarios de `workers/pago/index.js`).
  Cualquier `sk_live_`, `whsec_`, `ghp_`, JSON de service account o clave
  privada real fuera de comentario es hallazgo **crítico**.
- Verifica que `data-private/` sigue en `.gitignore` y que **no** aparece
  bajo `docs/`. Un `.json` de huéspedes servido por Pages = crítico.
- Recuerda: los PIN de guía (`APT_GUIDE_PIN` en `apartment-guide.jsx`,
  `HVM2016`/`HVT2019`/`HVS2021`) están en el JS **público**. No son secreto:
  no los reportes como "secreto filtrado", pero sí ten claro que **no
  protegen nada** (solo separan la guía del resto de la web).

### 2. Validación de lo que entra por cada formulario y endpoint

Recorre CADA ruta de CADA Worker y pregúntate: ¿valida tipo, longitud y forma
antes de usar el dato?

- `workers/traveler-registry/index.js`: `cleanTraveler()` recorta a
  `MAX_FIELD_LEN` (200) y a `FIELDS` conocidos; `token` se filtra a
  `[A-Za-z0-9_-]` y `MAX_TRAVELERS` (12). Comprueba que ningún campo nuevo
  entre sin pasar por `cleanTraveler`.
- `workers/pago/index.js` → `handleIntent`: el **anti-tampering del 20 %**
  (`const expected = Math.round(total * 0.20)`, tolerancia ±2 €) es la defensa
  contra que el cliente mande `amount: 1`. Si tocas el cálculo del depósito,
  este check tiene que seguir cuadrando o abres un agujero de precio.
- `workers/sheets-sync/index.js`: valida `apt ∈ {vm,vt,vs}`, longitudes y topes
  (`> 2000` reservas, `> 512KB` payload). 
- `workers/social-publish/index.js`: `imageUrl`/`videoUrl` se validan con
  regex `^https://…\.(jpg|png|mp4|mov)`. Un `http://` o un esquema raro debe
  rebotar con 400.
- **Forms públicos** (`escribir-opinion-page.jsx`, `empresas-page.jsx`,
  `chrome.jsx` contacto): deben escapar tags y limitar longitudes en cliente.
  React escapa por defecto: confirma que **no** hay `dangerouslySetInnerHTML`
  con dato de usuario (`git grep -n dangerouslySetInnerHTML -- 'docs/components/*.jsx'`
  debe salir vacío).

### 3. Quién puede TOCAR qué dato (no solo quién puede entrar)

Esto es lo que más se escapa. No basta con "hay un secreto que lo protege":
pregúntate qué puede hacer quien tenga ese secreto o ese token.

- **`READ_SECRET`** protege `/list` y `/reg` de `traveler-registry`, que
  devuelven PII **descifrada**. En el admin, ese secreto se guarda en
  `sessionStorage` (`sessionStorage.setItem('hestia-acc-secret', …)` en
  `admin-page.jsx`, `IntelligenciaTab`). Distinto del PAT (que es solo en
  memoria). Valora: un XSS en `/p-edit` exfiltraría esa clave y con ella toda
  la PII. Hoy `/p-edit` no renderiza contenido de usuario con innerHTML, así
  que el vector está cerrado; si eso cambia, el `sessionStorage` sube de
  severidad. Documenta el supuesto, no lo des por sentado.
- **`/prefill` GET es público** (solo pide el token largo, ≥16 chars, como
  *capability URL*) y devuelve nombre/apellidos/teléfono/email/documento de la
  reserva. Es un diseño deliberado (token de alta entropía = la autorización).
  Verifica que sigue exigiendo `token.length >= 16` y que tiene rate-limit
  (hoy 40/IP/15min). Si alguien baja ese mínimo o quita el rate-limit, se
  vuelve enumerable → alto.
- **CORS**: cada Worker tiene su `ALLOWED_ORIGINS`. `pago` y `sheets-sync`
  además rechazan con 403 orígenes no permitidos (salvo localhost). Comprueba
  que un origen nuevo no se cuele y que el fallback
  `ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]` no refleje
  un `Origin` arbitrario.
- **Comparación de secretos**: debe ser `safeEqual()` (tiempo casi constante),
  no `===`. Ojo: en `pago`, `verifyStripeSignature` termina en
  `computed === v1` (comparación no constante de la firma). Es un *timing leak*
  de bajo impacto sobre un HMAC ya calculado; anótalo como bajo si lo tocas,
  pero no lo infles.

### 4. Inyección

- **No hay SQL** (no hay base de datos). El vector de inyección aquí es:
  - **Google Sheets**: `valueInputOption=USER_ENTERED` en `sheets-sync` y
    `pago` interpreta fórmulas. Un `responsable` que empiece por `=`, `+`, `-`
    o `@` es una **CSV/Sheets formula injection**. Comprueba si se neutraliza;
    si no, es hallazgo real (medio) con vector claro.
  - **HTML/JSX**: cubierto por React salvo `dangerouslySetInnerHTML` (ver
    paso 2).
  - **Reflected**: que ningún Worker devuelva el input crudo en un mensaje de
    error que luego se pinte sin escapar.

### 5. Datos sensibles en logs o respuestas

- `console.error(...)` en los Workers: revisa que loguean **el mensaje**, no
  el body crudo ni el secreto (p. ej. `console.error('Stripe intent error:',
  e.message)` es correcto; loguear `body` o `env.STRIPE_SECRET_KEY` no).
- Respuestas de error: no deben devolver secretos ni PII. Un `500` con el
  `e.message` de Google/Stripe suele ser aceptable; uno que refleje el token
  no.
- El beacon de `analytics-proxy` reenvía IP real (`X-Forwarded-For`) a
  Cloudflare: es intencionado y va a CF, no a un tercero. No es fuga.

### 6. Dependencias con agujeros conocidos

Este repo **no** tiene `package.json` committeado (está en `.gitignore`); las
deps de build son efímeras (`npm install --no-save @babel/core …`). Por eso:

- Los Workers tienen **cero dependencias** (Web Crypto puro). No hay superficie
  de supply-chain ahí.
- Front público: React y Leaflet por CDN con **versión fijada**
  (`react@18.3.1`, `leaflet@1.9.4`). Comprueba que las versiones pinneadas no
  tengan CVE conocido y que el `onerror` de fallback apunte a los locales
  (`docs/assets/react*.js`), no a otro CDN.
- Único `package.json` real: `remotion-video/`. Si vas a tocar ahí:
  `cd remotion-video && npm audit`.

## Regla de oro (esto manda)

Cada hallazgo lleva **archivo:línea**, **severidad** y **cómo se explota en una
frase**. Si no puedes escribir la frase de explotación, **no es un hallazgo, es
una opinión**: fuera del informe (como mucho, "nota").

> Ejemplo válido: `workers/pago/index.js:100` · alto · "un cliente que edite el
> body puede mandar `amount:1` con `total:2000` y pagar 1 € de señal si el
> check del 20 % no cuadra".
>
> Ejemplo que NO es hallazgo: "el manejo de errores podría mejorarse" → sin
> vector, es opinión.

## Falsear antes de reportar

Antes de escribir cada hallazgo, intenta **tumbarlo tú mismo**:

1. ¿Hay ya una defensa que no vi? (rate-limit, `safeEqual`, validación aguas
   arriba, CORS, el check del 20 %…). Vuelve a leer la función entera.
2. ¿El "secreto" lo es de verdad, o es público por diseño (Web3Forms
   `access_key`, PIN de guía, `SHEET_ID`, IDs de Meta)?
3. ¿El vector es alcanzable por un atacante real, o requiere que ya tenga el
   PAT / el `READ_SECRET` / acceso al repo privado?
4. Escribe la frase de explotación. Si no sale concreta, cae.

Solo sobreviven los que resisten estos cuatro golpes. Un informe de 3 hallazgos
sólidos vale más que 10 dudosos.

## Formato de salida

```
## Chequeo de seguridad · Hestía · <fecha>

### Críticos
- [archivo:línea] Título. Severidad: crítica.
  Explotación: <una frase>.
  Arreglo: <cambio concreto, idealmente el diff o la línea a tocar>.

### Altos
  …

### Medios / Bajos
  …

### Notas (sin vector — NO son hallazgos)
- <observaciones que no pasaron la regla de oro>

### NO revisado (lista honesta)
- <qué quedó fuera y por qué: p.ej. "no probé los Workers en vivo, solo el
  código"; "no verifiqué la config real de secretos en el panel de Cloudflare";
  "no audité remotion-video/"; "no confirmé la visibilidad actual del repo en
  GitHub">
```

La sección **NO revisado** es obligatoria. Un chequeo que no dice sus límites
miente por omisión.

## Comandos de verificación del proyecto

Para comprobar que un arreglo no rompe nada:

```bash
# Compilar JSX tras tocar componentes (obligatorio antes de commitear)
npm install --no-save @babel/core @babel/preset-react   # si node_modules no está
node scripts/build-jsx.js

# Servir y pasar el smoke test (bloquea si una página peta o tiene enlace roto)
cd docs && python3 -m http.server 8123 &
node scripts/smoke-test.cjs

# Los Workers no tienen suite; se validan leyendo el código y, si hace falta,
# con `wrangler dev` en la carpeta del worker (no committear secretos de prueba).
```
