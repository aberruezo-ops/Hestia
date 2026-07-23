---
name: indexacion-google
description: >-
  Diagnosticar y arreglar por qué páginas de Hestía no se indexan en Google, y
  optimizar la indexación en general. Úsala cuando Alex diga "no sale en
  Google", "no indexa", "por qué no aparece", "mejorar el SEO técnico",
  "Search Console dice…", "página descubierta pero no indexada", "excluida por
  noindex", "rastreada pero no indexada", o antes de publicar una página nueva
  que deba salir en buscadores. Enseña a auditar robots.txt, meta robots,
  canonical, sitemap, hreflang y el problema nº1 de ESTE proyecto: el contenido
  se pinta con React en cliente y el HTML inicial va casi vacío. NO la uses
  para copy/keywords de marketing; es SEO técnico de rastreo e indexación.
---

# Indexación en Google · Hestía

Manual para que las páginas que DEBEN indexar, indexen; y las que no, se queden
fuera a propósito. Diagnóstico anclado a la arquitectura real de Hestía.

## La causa nº1 aquí: el HTML inicial va vacío (render en cliente)

Esto explica la mayoría de "no indexa" en este proyecto. Cada página es un
cascarón:

```html
<body>
  <div id="root"></div>          <!-- vacío -->
  <script src="…react…"></script> <!-- el contenido lo pinta React después -->
</body>
```

Compruébalo: `grep -c "<a href" docs/mar.html` devuelve **1** (solo el
skip-link). Todo el texto, los enlaces internos y los `<h1>` los inyecta React
al ejecutarse.

**Qué significa para Google:**
- Googlebot SÍ ejecuta JS, pero en una **segunda pasada diferida** (render
  budget). Con React UMD por CDN (`unpkg`), si el CDN tarda o falla en el
  momento del render, Google indexa un `<div id="root">` vacío → "**Rastreada,
  actualmente no indexada**" o "**Descubierta, no indexada**" en Search
  Console. Es el síntoma clásico de este stack.
- Sin `<a href>` en el HTML inicial, el **descubrimiento de enlaces** depende
  100% del sitemap. Si una página no está en `sitemap.xml`, puede que Google
  no la encuentre nunca.

**Mitigaciones (de más barata a más cara):**
1. **Sitemap completo y fresco** (ver abajo) — es el sustituto del enlazado
   interno que Google no ve. Lo más barato y lo primero.
2. **`<title>`, `<meta description>`, canonical, OG y JSON-LD estáticos en el
   `<head>`** — esto SÍ está en el HTML sin ejecutar JS. Asegúrate de que cada
   página tiene su title/description únicos (Google indexa el head aunque el
   body tarde). Hestía ya lo hace: mantenlo.
3. **`<noscript>` con el contenido esencial** (h1 + párrafo + enlaces clave) en
   cada página indexable. Barato y ayuda al descubrimiento.
4. Prerender / SSG del body si algún día el problema persiste — caro, cambia el
   stack, NO hacerlo sin que 1-3 hayan fallado de verdad.

## Auditoría técnica · orden de revisión

Corre esto para ver el estado real de todas las páginas de una vez:

```bash
# meta robots + canonical de cada página
for f in docs/*.html; do
  n=$(basename $f)
  r=$(grep -oE '<meta name="robots" content="[^"]*"' $f | head -1 | sed 's/.*content="//;s/"//')
  c=$(grep -oE '<link rel="canonical" href="[^"]*"' $f | head -1 | sed 's|.*href="https://www.hestiayourhome.com||;s/"//')
  echo "$n | robots: ${r:-SIN META} | canonical: ${c:-SIN CANONICAL}"
done
```

### 1. `<meta name="robots">` — la causa directa de exclusión
`noindex` = Google NO indexa, a propósito. Repasa que cada página esté en el
lado correcto. Estado actual de Hestía (correcto):

- **DEBEN indexar** (`index, follow`): `index`, `mar`, `thalassa`, `salinas`,
  `reservas`, `opiniones`, `nosotros`, `porque-hestia`, `estancias-largas`,
  `empresas`, `noticias`, `contacto`.
- **NO deben indexar** (`noindex`) y está bien así: `p-edit` (admin),
  `escribir-opinion`, `mapa`, `registro`, `cookies`, `privacidad`, `404`,
  `pago`, `pago-prototipo`, `fix-pins`, `territorio`.

Regla: si una página no aparece en Google, **lo primero** es mirar su meta
robots. Un `noindex` olvidado es la explicación más común y más tonta.

### 2. `sitemap.xml` — el descubrimiento depende de él
Como el body va vacío, el sitemap es casi la única vía de descubrimiento.

```bash
grep -oE "<loc>[^<]+" docs/sitemap.xml            # qué páginas lista
grep -oE "<lastmod>[^<]+" docs/sitemap.xml | sort | uniq -c   # frescura
```

Verifica:
- **Que estén TODAS las indexables y NINGUNA `noindex`.** Meter una `noindex`
  en el sitemap manda señal contradictoria (Google lo marca en SC).
- **`<lastmod>` real.** Hoy casi todo está en `2026-06-13`: si el contenido
  cambió y el lastmod no, Google recrawlea menos. Actualízalo cuando cambie la
  página de verdad.
- **Coherencia**: sitemap actual lista 12 = las 12 indexables. Si añades una
  página indexable nueva, **hay que meterla aquí a mano** (no se genera solo).

### 3. `canonical` — evitar duplicados y señales cruzadas
```bash
grep -L 'rel="canonical"' docs/*.html   # páginas indexables SIN canonical = riesgo
```
- Cada página indexable debe apuntar a su URL con `www` y absoluta
  (`https://www.hestiayourhome.com/...`). Hestía ya lo hace.
- **Duplicado github.io vs dominio**: existe `docs/CNAME` (`www.hestiayourhome.com`),
  así que el sitio vive en el dominio. Pero `aberruezo-ops.github.io` puede
  seguir sirviendo copia. El canonical absoluto a `www` es lo que evita que
  Google indexe la versión `github.io` como duplicado. No lo quites.

### 4. `hreflang` — ES/EN en la misma URL
Hestía sirve ES y EN en la MISMA URL (cambia en cliente), con
`hreflang="es"`, `"en"` y `"x-default"` apuntando todos a la misma URL. Es
válido, pero Google solo verá un idioma en el HTML. No es causa de no-indexado;
no lo toques salvo que separes idiomas por URL.

### 5. `robots.txt` — que no bloquee de más
```bash
cat docs/robots.txt
```
Hoy: `Allow: /` + disallow de 3 JSON privados + sitemap declarado. Correcto.
Ojo: `Disallow` en robots.txt **impide el rastreo**, no el indexado — una URL
bloqueada puede salir en Google sin descripción. Para excluir de verdad, usa
`noindex` en la página (no `Disallow`), y no bloquees en robots.txt una página
que además tiene `noindex` (si la bloqueas, Google no puede leer el `noindex`).

## Por qué "hay muchas páginas que no indexan" — respuesta directa

De 23 HTML, **solo 12 deben indexar**; las otras 11 llevan `noindex` a
propósito (admin, legales, formularios, pago, utilidades). Así que "muchas sin
indexar" es, en gran parte, **diseño correcto**, no un fallo.

De las 12 que sí deben, si Search Console muestra "Descubierta/Rastreada, no
indexada", la causa más probable en este stack es **el render en cliente**: el
HTML que Google ve primero está vacío y el contenido llega por JS desde un CDN.
El orden de ataque es: (1) sitemap completo y con lastmod real, (2) head
estático único por página —ya está—, (3) `<noscript>` con lo esencial, y solo
si eso falla, prerender.

## Verificación

```bash
node scripts/build-jsx.js                     # si tocas componentes
cd docs && python3 -m http.server 8123        # servir
node scripts/smoke-test.cjs                   # que ninguna página pete
# manual: en Search Console → Inspección de URL → "Probar URL publicada"
#         y ver "HTML renderizado" vs "HTML de origen" para confirmar el gap.
```
Y siempre: al añadir/renombrar/borrar una página indexable, actualiza
`sitemap.xml` a mano en el mismo commit.

## Checklist al publicar una página que DEBE indexar

- [ ] `<meta name="robots" content="index, follow">`
- [ ] `<link rel="canonical">` absoluto con `www`
- [ ] `<title>` y `<meta description>` únicos, en el `<head>` (no por JS)
- [ ] Añadida a `docs/sitemap.xml` con `<lastmod>` de hoy
- [ ] hreflang es/en/x-default si aplica
- [ ] `node scripts/smoke-test.cjs` pasa
- [ ] (recomendado) `<noscript>` con h1 + resumen + enlaces clave
