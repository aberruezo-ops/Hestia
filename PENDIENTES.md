# Pendientes

Decisiones y tareas que se han aplazado a propósito, con el motivo por el
que no se hicieron en el momento en que surgieron. No es un backlog de
ideas, es solo lo que se decidió dejar para después.

---

## Actualizar React 18 → 19

**Surgió:** revisión de versiones de lo que usa la web en vivo (octubre
2026). **Actualizado:** intento real de hacerlo (octubre 2026) descubrió
un bloqueo de arquitectura, no solo de versión.

**Estado actual:** React 18.3.1 + ReactDOM 18.3.1 (última versión de la
rama 18.x, cargadas por CDN desde unpkg con fallback local en
`docs/assets/react.development.js` / `react-dom.development.js`).

**Por qué no se hizo ya, y por qué ya no es un simple cambio de pin:**
desde React 19 (confirmado con `19.3.0`, la versión estable real),
**el propio equipo de React dejó de publicar builds UMD**
(`unpkg.com/react@19/umd/...` da 404; el tarball de npm no tiene carpeta
`umd/`). El sitio entero depende de ese formato: cada HTML carga React
por `<script src="unpkg.com/react@18.3.1/umd/...">` con fallback local en
el mismo formato, y todo el JSX compilado usa el global `React.createElement`
sin imports. Sin build UMD, cambiar solo el número de versión deja
`window.React`/`window.ReactDOM` sin definir y pone en blanco **todo el
sitio** (home, los 3 apartamentos, reservas, admin). No es un bug a
arreglar sobre la marcha: es una decisión de arquitectura.

**Qué hace falta para hacerlo (elegir una vía primero, no solo ejecutar):**
1. **Migrar a ESM vía CDN** (ej. `esm.sh/react@19` + `esm.sh/react-dom@19/client`, `<script type="module">` + import maps) y adaptar `scripts/build-jsx.js` para que el JSX compile a imports en vez de depender del global `React` (cambia el preset de Babel de `runtime: 'classic'` a `runtime: 'automatic'`). Es la vía que React 19 sí soporta oficialmente, pero toca el pipeline de build y las ~25 páginas HTML, no solo un número de versión.
2. **Quedarse en React 18.3.1** (sigue soportada, con builds UMD) hasta que haya tiempo para decidir y ejecutar la migración a ESM como proyecto propio.
3. Descartado por riesgo: fabricar un wrapper UMD casero a partir del build CJS de React 19. No es un build oficial, no está probado por el equipo de React, y firmarlo como "la copia de React 19" en un sitio en producción sería un apaño poco fiable, no una solución.
4. Una vez migrado (vía 1): repasar visualmente las páginas clave (home, los 3 apartamentos, /reservas, /p-edit) en desktop y móvil, con el smoke test (`node scripts/smoke-test.cjs`) como mínimo, no como único control. Vigilar especialmente el calendario de reservas, el panel de admin y cualquier uso de `ReactDOM.createPortal` (lightbox, modales).

**Cuándo tiene sentido retomarlo:** cuando el usuario decida explícitamente
entre migrar a ESM (opción 1) o quedarse en React 18 por ahora (opción 2).
No tiene sentido reintentarlo como "bump de versión" suelto: la próxima
vez que se toque, ya hay que entrar sabiendo que es un cambio de pipeline
de build, no solo de dependencia.

---

## Google Analytics 4 (GA4)

**Surgió:** `strategy/01-estrategia-marca-y-flujo-recurrente.md` §13 (bloqueo
de lanzamiento, mayo 2026); revisión de limbo (octubre 2026).

**Estado actual:** el snippet de `gtag` está en `docs/contacto.html` y
`docs/cookies.html`, comentado, con el placeholder literal `G-XXXXXXXXXX`.
GSC sí está verificado (meta tag en `index.html` y `estancias-largas.html`)
y el dominio propio ya está en producción (`docs/CNAME` →
`www.hestiayourhome.com`), así que esos dos bloqueos de la lista original
ya están resueltos. GA4 es el único que sigue sin dato real.

**Por qué no se hizo ya:** necesita que el usuario cree la propiedad GA4 y
pase el Measurement ID real; no es algo que se pueda inventar ni dejar a
medias sin mandar datos falsos a una cuenta que no existe.

**Qué hace falta para hacerlo:** el usuario crea la propiedad en Google
Analytics (Admin → Flujos de datos → su dominio) y pasa el
`G-XXXXXXXXXX` real. Con eso: descomentar y sustituir el ID en
`contacto.html` y `cookies.html`, y decidir si se añade también al resto
de páginas (hoy solo esas dos lo tienen preparado) para tener analítica
completa del sitio, no solo de esas dos.

**Cuándo tiene sentido retomarlo:** en cuanto el usuario tenga el ID a mano.

---

## CSV de huéspedes anteriores (para email de lanzamiento y CRM)

**Surgió:** `strategy/01-estrategia-marca-y-flujo-recurrente.md` §6 y §8
(mayo 2026).

**Estado actual:** no existe en el repo (ni en `data-private/`). No hay
ninguna lista de emails de huéspedes anteriores cargada.

**Por qué no se hizo ya:** depende de que el usuario reúna y entregue esos
datos (nombre/email/apartamento/fechas) desde sus propios canales
(WhatsApp, Booking, Airbnb, contratos firmados). Son datos personales de
huéspedes: si se entregan, van directos a `data-private/` o a un servicio
externo de email marketing, nunca a `docs/`.

**Qué hace falta para hacerlo:** el usuario exporta/recopila el CSV
(email + apartamento + fecha de estancia, consentimiento implícito o
explícito para contacto comercial). Con eso se puede: (1) enviar la
"Oleada 1" de lanzamiento descrita en §8 de la estrategia (email a
huéspedes anteriores con descuento de reserva directa), y (2) alimentar el
lifecycle de 10 emails automatizados de §6, que hoy no existe en ninguna
parte (no hay cuenta de Mailchimp/Brevo configurada, ni plantillas, ni
automatización).

**Cuándo tiene sentido retomarlo:** cuando el usuario decida que quiere
activar el canal de email, que la propia estrategia marca como pilar de
"flujo recurrente sin esfuerzo continuo" junto con el SEO.

---

## Plan de redes sociales (cadencia, Pinterest, lanzamiento coordinado)

**Surgió:** `strategy/01-estrategia-marca-y-flujo-recurrente.md` §7-8
(mayo 2026); kit instalado en `strategy/redes/` (sistema para generar
posts con Claude Projects).

**Estado actual:** existe la infraestructura para generar contenido
puntual (`docs/data/social-drafts.json`, el kit `strategy/redes/` con
`system-prompt.md`/`hechos-y-ventajas.md`/`ejemplos-captions.md`, y este
mismo chat ya ha redactado posts sueltos para Instagram). Lo que NO existe
es la ejecución sistemática que describe la estrategia: cadencia semanal
de Instagram, Pinterest arrancado desde cero (objetivo: 20 pins/semana,
50K visitas/mes a 6 meses), ni las "3 oleadas" de comunicación coordinada
del lanzamiento de marca (§8: email a huéspedes anteriores, posts
antes/después en IG, mención en el welcome message de Booking/Airbnb,
newsletter con la guía en PDF).

**Por qué no se hizo ya:** generar un post puntual cuando se pide es
trabajo reactivo; mantener una cadencia semanal con objetivos de alcance
es trabajo continuo que requiere que el usuario (o alguien en su equipo)
lo sostenga semana a semana, no algo que se resuelva en una sesión.
Pinterest, además, no se ha ni empezado (no hay cuenta, no hay pins).

**Qué hace falta para hacerlo:** decidir si de verdad se quiere sostener
la cadencia (20 pins/semana en Pinterest es el ítem de mayor ROI según la
propia estrategia pero exige constancia). Si sí: crear la cuenta de
Pinterest, usar el kit de `strategy/redes/` para generar lotes semanales,
y ejecutar la oleada de lanzamiento de §8 (esto último probablemente ya
no tiene sentido tal cual está escrita, porque el dominio lleva tiempo en
producción de forma silenciosa, no como "estreno" coordinado: decidir si
se relanza igualmente el mensaje o se descarta esa oleada concreta).

**Cuándo tiene sentido retomarlo:** cuando el usuario quiera convertir el
kit ya instalado en un hábito semanal real, en vez de posts puntuales a
demanda.

---

## `nuevo-portal-de-hestia/` — resuelto, carpeta eliminada (octubre 2026)

**Surgió:** añadido por un commit automático (`0c31323`, 2026-09-22) como
paquete de entrega de Claude Design (claude.ai/design); revisión de limbo
y decisión (octubre 2026).

**Qué era:** un rediseño completo del Home ("Noche Mediterránea", Lora +
Poppins) con mucho más peso narrativo que el sitio actual: manifiesto,
tabla comparativa de los tres apartamentos y una sección de guía de marca
embebida en el propio Home. Usaba datos reales de Hestía (licencias VFT,
teléfonos, direcciones, email), no inventados.

**Decisión del usuario:** no lo reconocía como algo pedido a propósito
(llegó solo por el commit automático), y además no comparte el enfoque:
el Home debe priorizar conversión (visita → solicitud de reserva), y el
contenido narrativo, que solo interesa a una minoría de visitantes, debe
vivir en otro sitio, no competir por espacio ahí. Se pidió rescatar lo
aprovechable y borrar el resto.

**Resultado de la revisión de "lo rescatable":** no había nada nuevo que
rescatar. Se comprobó punto por punto contra el sitio en producción:
- El manifiesto ("esto no se alquila, se comparte") ya existe en
  `/nosotros.html` (`shared.jsx` `manifest_p1`-`manifest_p4`), con una
  redacción más alineada con `VOZ-DE-MARCA.md` que la del paquete (invita
  en vez de ordenar: "agradecemos que repongas lo que uses" en vez de "si
  lo usas, lo repones").
- La tabla comparativa de los tres apartamentos ya existe (`const
  Compare` en `docs/components/sections-1.jsx`).
- La sección de equipo (Alex y Fran) ya existe en `/nosotros.html`.
- Los contadores animados y las valoraciones de plataformas (Booking,
  Airbnb, Google) ya existen en el home actual.
- Los datos reales del paquete (licencias, teléfonos, dirección, email)
  coinciden con los que ya usa la producción: no faltaba nada que
  trasladar.

En resumen: el paquete repackaging contenido y datos que ya estaban en
producción, con otra tipografía y más peso narrativo en el sitio
equivocado. Por eso se eliminó la carpeta entera en vez de extraer nada.

---

## Auditoría de diseño (`$impeccable` · `.impeccable/critique/`)

**Surgió:** dos auditorías de diseño guardadas (2026-09-21 y 2026-09-25)
sobre `docs/index.html` y páginas clave; revisión de limbo (octubre 2026).

**Estado actual:** verificado en esta revisión que los hallazgos **P0**
más graves de ambas auditorías ya están corregidos en el código actual:
la promesa absoluta "sin excepciones" en el FAQ de `reservas.html` ya no
existe, y la discrepancia −30% (hardcodeado) vs −40% (calculado) entre
`DIRECT_PERKS`/`DIRECT_RIBBON` y `LongStayStrip` ya está resuelta (el
propio código de `shared.jsx:3252` lo documenta: "Antes '−30%' fijo aquí y
calculado en vivo (distinto) en LongStayStrip"). Las celdas de calendario
ya tienen `min-height: 44px` para objetivo táctil. Quedan sin verificar
uno por uno, y probablemente aún pendientes, los hallazgos **P2/P3** de
pulido: nav de escritorio con 10 enlaces simultáneos antes del hero, la
promesa de reserva directa repetida hasta 4 veces en una sola carga de
home, dos widgets de "comprobar disponibilidad" independientes en la
misma página (el del hero y `HomeSearch`), jerarquía de encabezados que
salta de h2 a h5, y varios textos funcionales por debajo de 11px.

**Por qué no se hizo ya:** los P0/P1 (bugs de contraste invisible,
solapes del banner de cookies, datos contradictorios) se priorizaron y ya
se atendieron en sesiones anteriores. Los P2/P3 son pulido de UX/diseño,
no bugs, y requieren decisiones de composición (qué recortar del nav, qué
repetición del mensaje de reserva directa quitar) que no se han pedido
explícitamente.

**Qué hace falta para hacerlo:** decidir si merece la pena una pasada de
pulido (`$impeccable layout` / `$impeccable distill` / `$impeccable
typeset`, según el hallazgo) para los ítems P2/P3 que sigan vigentes, o
dejarlos como están porque el sitio ya puntúa "Bueno" (29/40) en ambas
auditorías.

**Cuándo tiene sentido retomarlo:** la próxima vez que se toque el
home o el flujo de reservas de forma sustancial, aprovechar para revisar
si estos ítems de pulido siguen aplicando.

---

## Backlinks y plantillas de respuesta a reseñas de Google

**Surgió:** pregunta del usuario "¿Cómo se controla?" sobre palancas de
SEO fuera del repo (octubre 2026); ofrecido entonces, no solicitado.

**Estado actual:** no se ha redactado nada todavía.

**Por qué no se hizo ya:** se ofreció como posibilidad tras explicar qué
factores de posicionamiento (Google Business Profile, antigüedad de
dominio, backlinks, CTR) quedan fuera del propio código del sitio; el
usuario no lo ha pedido explícitamente.

**Qué hace falta para hacerlo:** que el usuario pida (1) plantillas de
respuesta a reseñas de Google (buenas y malas) y/o (2) un email de
contacto a guías y blogs locales de la zona pidiendo enlaces hacia la web.

**Cuándo tiene sentido retomarlo:** si el usuario decide que quiere
trabajar activamente el off-page SEO.
