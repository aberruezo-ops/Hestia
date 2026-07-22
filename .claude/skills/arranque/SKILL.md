---
name: arranque
description: >-
  Manual para arrancar un proyecto nuevo del usuario (Alex, Hestía) desde cero.
  Úsala cuando diga "empecemos un proyecto nuevo", "arranca esto", "monta el
  scaffold", "creamos una web/app nueva", "de cero", "primer commit", "setup
  inicial", o cuando estés a punto de escribir el primer archivo de un repo
  vacío o casi vacío. Enseña qué decidir ANTES de teclear (problema, quién,
  primera cosa visible), a elegir un stack mínimo y reversible anotando el
  porqué, el día 1 no negociable (git + commit + CLAUDE.md + estructura
  explicada + deploy temprano), a no sobre-ingeniar, y un checklist de salida
  del arranque construido sobre las cicatrices reales del proyecto Hestía.
---

# Arranque de proyecto · manual de Alex

Cómo arrancar el PRÓXIMO proyecto sin repetir lo que dolió en el anterior. No
es teoría: cada regla de aquí es una cicatriz de Hestía, el proyecto previo.

## Por qué existe este manual (autopsia honesta de Hestía)

Reconstruido desde los artefactos del repo, no desde arqueología de commits
(el historial que tengo es *shallow*, 70 commits; no vi el commit 1 real).
Aun así, las cicatrices están escritas en el propio código:

**Lo que ayudó desde temprano (repetir):**
- **Deploy trivial**: sitio estático en GitHub Pages, `deploy = git push`. Cero
  infra, reversible al instante. Publicar nunca fue el cuello de botella.
- **Stack aburrido**: React por CDN sin bundler, JSX precompilado a `.js`. Sin
  webpack, sin framework runtime. Fácil de entender, fácil de servir.
- **Altura correcta del backend**: empezó 100% estático; los 6 Cloudflare
  Workers (`workers/pago`, `traveler-registry`, …) se añadieron UNO A UNO solo
  cuando un secreto, un pago o PII lo obligaron. Nunca hubo un "backend por si
  acaso".
- **Fuente única para el dinero**: precios en `docs/data/prices.json` +
  `_calcStay`. Un solo sitio manda.
- **CLAUDE.md como memoria institucional**: el artefacto de mayor palanca del
  repo.

**Lo que faltó al inicio y dolió después (evitar):**
- **El génesis fue una maqueta, no un "por qué".** Nació de un handoff de
  Claude Design (`nuevo-portal-de-hestia/README.md`): un mockup HTML/CSS/JS
  para implementar. Había un "qué" visual clarísimo, pero el "qué problema /
  para quién" y las **reglas de negocio** se escribieron TARDE, a golpes.
- **Los guardarraíles son todos reactivos.** Cada regla de `CLAUDE.md` y cada
  check de CI nació de un incidente: el contraste oscuro-sobre-oscuro ("fallo
  recurrente"), `price-consistency.mjs` (un precio se hardcodeó y descuadró),
  `smoke-test.cjs` ("habría cazado la pantalla en blanco" → hubo pantalla en
  blanco en producción), las invariantes de estancia larga (alguien rompió
  "no hay check-in en julio/agosto"). Todo esto costaba minutos el día 1 y
  costó incidentes como retrofit.
- **Un footgun permanente por diseño**: compilas JSX y **commiteas el `.js`**.
  Si editas `.jsx` y olvidas `node scripts/build-jsx.js`, el navegador sirve
  código viejo. La "solución" fue una sección en el README ("Si olvidas hacer
  build") — documentación en vez de automatización. **No hay pre-commit hook**
  que lo evite; el smoke test de CI es la red, y llegó tras el susto.
- **Ficheros que nunca se partieron**: `styles.css` tiene **23.982 líneas**;
  `apartment-guide.jsx`, 5.938; `shared.jsx`, 3.810. Pragmático al principio,
  hoy es un pajar. Ninguna frontera de módulo se puso a tiempo.
- **Restos de la reescritura**: el portal viejo sigue en el árbol
  (`nuevo-portal-de-hestia/`) como peso muerto.
- **Sigue sin suite de tests.** Los checks de CI (smoke/contraste/precio) son
  el sustituto.

El patrón: **lo barato el día 1 (git, CLAUDE.md, un guard automático, una
frontera de módulo, escribir el porqué) se volvió caro como parche.** Este
manual mueve esas cosas al día 1.

---

## El manual

### Paso 0 · Antes de escribir una línea de código

Responde por escrito, en 3 frases, en el futuro `CLAUDE.md`:
1. **Qué problema resuelve.** Una frase. Si no cabe en una, aún no lo entiendes.
2. **Quién lo usa.** Concreto (Alex y Fran; el huésped; el admin). No "usuarios".
3. **La primera cosa visible que demuestra que funciona.** El "hola" mínimo que
   se pueda VER en producción. En Hestía sería "la home carga y muestra los 3
   apartamentos". No una arquitectura: una pantalla.

Aunque arranques de una maqueta de Claude Design (como Hestía), la maqueta es
el "qué", no el "por qué". Escribe el por qué igualmente.

### Paso 1 · Stack mínimo y aburrido, reversible, con el porqué anotado

- Elige lo **más aburrido que funcione**. Una decisión reversible tomada hoy
  vale más que la "perfecta" tomada en tres días.
- **Anota el porqué de cada elección** en `CLAUDE.md` (una línea). El porqué es
  lo que permite revertir sin miedo después.
- **Por defecto, cuando dudes, el stack de Hestía** (es el que conoces y
  despliega en un push):
  - Sitio estático en `docs/`, **GitHub Pages** (`.nojekyll`, deploy = push).
  - **React 18 UMD por CDN** con fallback local en `docs/assets/`; **sin
    bundler**. JSX en `docs/components/*.jsx`.
  - Precompilación: `node scripts/build-jsx.js` (`.jsx` → `.js`).
  - **Backend solo si un secreto/pago/PII lo obliga** → un **Cloudflare
    Worker** por función, secretos con `wrangler secret put` (nunca en
    `wrangler.toml`).
  - Datos en JSON versionado; lo sensible, fuera de `docs/` y cifrado.
- Si el próximo proyecto NO es un sitio de marketing (tiene BD, auth de
  usuarios, servidor), **no fuerces este stack**: aplica los mismos principios
  (aburrido, reversible, porqué anotado) al stack que el problema pida, y
  **pregúntame** si dudas del stack.

### Paso 2 · El día 1 no negociable

Nada de esto es opcional, y todo cuesta minutos:

1. **git desde el primer archivo.**
   ```bash
   git init && git add -A && git commit -m "Arranque: esqueleto + CLAUDE.md + deploy hola"
   ```
2. **CLAUDE.md** en la raíz, con:
   - Los 3 puntos del Paso 0 (problema / quién / primera cosa visible).
   - **Comandos reales**: cómo se compila, se sirve en local y se despliega.
   - **Convenciones**: estilo, dónde va cada cosa, qué NO hacer.
   - **Invariantes de negocio desde ya** (aunque sean 2): las verdades que
     nunca pueden romperse, con `[dónde se aplica]`. En Hestía esto llegó
     tarde; aquí va el día 1.
3. **Estructura explicada**: un árbol de carpetas con una línea por carpeta
   diciendo qué vive ahí. Si no lo puedes explicar en una línea, la estructura
   está mal.
4. **Deploy temprano, aunque sea un "hola".** Publica la pantalla mínima del
   Paso 0 el primer día. En Hestía el deploy fue barato y por eso nunca
   estorbó: hazlo pronto para que "publicar" no sea nunca el problema.
   ```bash
   # patrón Hestía: servir en local antes de pushear
   cd docs && python3 -m http.server 8123   # abre http://localhost:8123
   ```
5. **Si hay paso de build que genera artefactos versionados, automatiza el
   guard el día 1.** No lo dejes en "acuérdate de compilar". Un pre-commit hook
   que recompila y falla si el `.js` quedó desincronizado mata el footgun que
   Hestía arrastra:
   ```bash
   # .git/hooks/pre-commit (chmod +x)
   node scripts/build-jsx.js && git add docs/components/*.js
   ```
   O un check en CI que rechaza el push si `build` deja diff.

### Paso 3 · Cero sobre-ingeniería

- **No construyas capas para problemas que aún no existen.** Sin base de datos
  hasta que haya un dato que de verdad no cabe en JSON. Sin auth de usuarios
  hasta que haya usuarios. Sin cola, cache ni microservicio "por si escala".
- Hestía acertó aquí: fue estático hasta que un pago obligó a un Worker. Copia
  ese reflejo — **cada pieza de infra tiene que estar justificada por un
  problema presente, no futuro.**
- Si una abstracción no te ahorra código HOY, es deuda, no diseño.

### Paso 4 · Checklist de salida del arranque

No consideres "arrancado" hasta que TODO esto sea cierto:

- [ ] `CLAUDE.md` responde: problema, quién, primera cosa visible.
- [ ] `CLAUDE.md` lista los comandos reales de build / serve / deploy.
- [ ] `CLAUDE.md` tiene al menos 2 invariantes de negocio con `[dónde se aplica]`.
- [ ] Primer commit hecho; el repo tiene historial desde el archivo 1.
- [ ] La estructura de carpetas está explicada (1 línea por carpeta).
- [ ] La pantalla mínima ("hola") está **desplegada y visible** en producción.
- [ ] **Fuente única para los datos críticos** (dinero, fechas, disponibilidad)
      definida desde ya: un solo sitio manda, nada de duplicar/hardcodear.
      *(cicatriz: `price-consistency.mjs`)*
- [ ] **Si hay build que commitea artefactos**, hay un guard automático
      (hook o CI), no una nota en el README. *(cicatriz: drift de `.js`)*
- [ ] **Un smoke test mínimo** que cargue la pantalla principal y falle si hay
      error de consola o no renderiza. *(cicatriz: pantalla en blanco)*
- [ ] **Datos sensibles separados desde el diseño** si va a haberlos: fuera del
      árbol público, cifrados, secretos por gestor de secretos nunca en el
      código. *(cicatriz: PII de RD 933/2021 en `traveler-registry`)*
- [ ] **`.gitignore` cubre secretos y datos privados** antes del primer commit.
- [ ] Regla de "cuándo partir un módulo" acordada (p. ej. ningún `.css` o
      componente pasa de ~1.000 líneas sin trocearse). *(cicatriz: `styles.css`
      de 24k líneas)*
- [ ] Si esto sustituye a algo anterior, **el proyecto viejo se borra o sale
      del repo**, no se queda de peso muerto. *(cicatriz:
      `nuevo-portal-de-hestia/`)*

Si algún punto no aplica al proyecto, escríbelo en `CLAUDE.md` con el porqué.
Un checklist con excepciones justificadas es honesto; uno saltado en silencio,
no.
