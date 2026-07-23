---
name: fable-plan
description: >-
  Planear una función o cambio nuevo en el proyecto Hestía ANTES de escribir
  código. Úsala cuando el usuario diga "quiero añadir…", "planea…", "cómo
  harías…", "necesito una función para…", "podríamos…", o pida cualquier mejora
  no trivial a la web, la guía, el admin /p-edit, los precios/calendario o los
  Workers. Enseña a no proponer sin explorar (qué leer primero según la zona),
  las preguntas obligatorias antes de teclear, un plan en pasos pequeños y
  reversibles cada uno con su verificación real, y la regla de qué se pregunta
  antes y qué se decide y se anota. NO la uses para bugs de una línea obvios ni
  para cambios de copy triviales; sí para cualquier cosa que toque lógica,
  varios archivos o datos sensibles.
---

# Planear una función nueva · Hestía

Cómo planear un cambio en Hestía como lo haría yo: explorar antes de proponer,
hacer las preguntas que pueden mover el plan, y entregar pasos pequeños con su
verificación. Un plan sin exploración es una adivinanza con formato.

## Regla nº1: nunca propongas sin haber leído

Antes de escribir una sola línea de plan, lee los archivos de la zona que vas a
tocar. Mapa de zonas → qué leer primero:

| Vas a tocar… | Lee primero |
|---|---|
| **Precios, calendario, disponibilidad, estancia larga** | `CLAUDE.md` (sección INVARIANTES) → `docs/components/shared.jsx` (`_calcStay`, `_calcLsTotal`, `DateRangePicker`) → `docs/data/prices.json` |
| **Una página pública** (home, apto, reservas, empresas…) | el `*-page.jsx` de esa página + `docs/components/chrome.jsx` (nav/footer) + qué `COMPONENT_FILES` carga su `.html` |
| **La guía del huésped** | `docs/components/apartment-guide.jsx` (es de ~6k líneas: usa `grep -n` para tu sección, no la leas entera) |
| **El admin** | `docs/components/admin-page.jsx` + `docs/p-edit.html`. Login por PAT en memoria. |
| **Un Worker / pagos / PII / secretos** | el `workers/<x>/index.js` entero + su `wrangler.toml`. **Activa antes la skill `chequeo-seguridad`.** |
| **Estilos / color / contraste** | `docs/assets/styles.css` (24k líneas: `grep -n` la clase) + la regla `on-dark` de `CLAUDE.md` |
| **Iconos, voz de marca, layout** | la skill `hestia` (guía maestra) y `VOZ-DE-MARCA.md` |

Comandos de exploración típicos:
```bash
grep -n "loQueBusco" docs/components/shared.jsx      # localiza sin leer 4k líneas
grep -rn "COMPONENT_FILES" docs/mar.html             # qué componentes usa una página
```

Convenciones que ya existen y hay que respetar (no reinventar):
- **Fuente única de precios/negocio**: todo sale de `prices.json` + `_calcStay`.
  NUNCA hardcodees un precio en un componente.
- **Registro global**: un componente/func nuevo se expone al final del archivo
  con `Object.assign(window, { … })` (así lo ven los demás, no hay imports).
- **Sin guion largo `—`** en texto visible; **sin comentarios redundantes**;
  fondos oscuros llevan clase `on-dark`. (Todo en `CLAUDE.md`.)
- Los `.jsx` son la fuente; los `.js` se compilan y **se commitean**.

## Las preguntas obligatorias (antes de escribir el plan)

Respóndelas todas, por escrito, en el plan:

1. **¿Cuál es el problema real detrás del pedido?** No lo que pide, lo que
   necesita. "Quiero un banner" puede ser "quiero que reserven directo".
2. **¿Qué es lo más pequeño que lo resuelve?** El MVP que se pueda ver
   funcionando. Si hay una versión de 1 archivo, esa es la candidata.
3. **¿Qué se rompe con este cambio AQUÍ?** Concreto de Hestía: ¿toca una
   INVARIANTE de negocio? ¿un componente que se registra en `window` y usan
   otros? ¿el `_calcStay` que consume el admin y las 3 páginas de apto? ¿el
   contraste sobre fondo oscuro?
4. **¿Qué casos límite aplican?** Los de este dominio: julio/agosto sin
   estancia larga, Navidad/Semana Santa con tarifa plana, mínimo de noches,
   fecha ya ocupada, mascota, huésped extra, ES/EN, móvil, `prefers-reduced-motion`.
5. **¿Cómo verificamos que quedó — con los comandos reales?** (ver abajo).
6. **¿Qué NO vamos a hacer y por qué?** El alcance que se queda fuera, anotado.

## La regla: preguntar antes o decidir y anotar

- Si una pregunta **puede cambiar el plan** (afecta alcance, rompe una
  invariante, elige entre dos diseños incompatibles) → **se pregunta al usuario
  ANTES** de escribir el plan.
- Si **no lo cambia** (un default razonable, un detalle reversible) → **se
  decide, se anota la decisión y el porqué**, y se sigue. No se paraliza el
  plan por cosas triviales.

## Formato del plan: pasos pequeños y reversibles

Cada paso: un cambio atómico + cómo se verifica + cómo se revierte si falla.

```
### Plan: <título>
Problema real: …
Lo más pequeño que lo resuelve: …
No haremos (y por qué): …
Riesgos aquí / invariantes tocadas: …

Paso 1 — <cambio atómico>
  Archivos: docs/components/<x>.jsx (+ .js al compilar)
  Verificar: <comando real> → <qué debe pasar>
  Revertir: git checkout -- <archivo>

Paso 2 — …
```

## Verificación con los comandos REALES de Hestía

Elige según lo que tocaste:
```bash
# 1. SIEMPRE que toques un .jsx — compila (o el navegador sirve .js viejo)
node scripts/build-jsx.js        # necesita: npm install --no-save @babel/core @babel/preset-react

# 2. Servir en local para mirar con ojo humano
cd docs && python3 -m http.server 8123    # o :8731

# 3. Smoke test — falla si una página peta, no renderiza o hay enlace roto
node scripts/smoke-test.cjs               # (con docs/ servido en :8123)

# 4. Si tocaste precios/calendario/estancia larga
node scripts/price-consistency.mjs        # verifica que _calcStay no cambió sin querer
#   intencionado? → node scripts/price-consistency.mjs --update

# 5. Si tocaste color/contraste/fondos oscuros
node scripts/contrast-audit.cjs           # (con docs/ servido en :8123)

# 6. Si tocaste la guía del huésped y sus PDFs
node scripts/build-pdf.mjs

# 7. Ojo humano de verdad (estados hover/vacío/no-disponible que el audit no caza)
#    → usa la skill `agent-browser` para cargar la página y hacer captura
```
El gate duro de CI (`.github/workflows/checks.yml`) es **smoke + precio**;
contraste reporta pero no bloquea. Un cambio no está "verificado" solo porque
compila: hay que **verlo cargar** (smoke o navegador) y, si toca dinero o
fechas, pasar `price-consistency`.

## Skills hermanas

- **`hestia`**: guía maestra (diseño, CSS, colores, arquitectura). Consúltala
  antes de escribir CSS de color/tipografía o tocar layout.
- **`agent-browser`**: para el ojo humano (cargar página, captura, probar
  estados).
- **`chequeo-seguridad`**: obligatoria si el plan toca Workers, PII, pagos o
  secretos.
