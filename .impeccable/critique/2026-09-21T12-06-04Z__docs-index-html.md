---
target: docs/index.html
total_score: 26
max_score: 36
na_heuristics: 7
p0_count: 1
p1_count: 2
timestamp: 2026-09-21T12-06-04Z
slug: docs-index-html
---
# Crítica de diseño — Hestía Your Home, página de inicio

## Design Health Score

| # | Heurística | Puntuación | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3/4 | El formulario de fechas del hero no da ningún feedback si la fecha de salida es anterior a la de entrada. |
| 2 | Correspondencia con el mundo real | 4/4 | Copy natural en los dos idiomas, sin jerga, flujo lógico. |
| 3 | Control y libertad del usuario | 3/4 | Cookies reabribles; el menú móvil no cierra con Escape. |
| 4 | Consistencia y estándares | 3/4 | Disciplina de color por Hestía real, pero −30% hardcodeado vs −40% calculado para el mismo ahorro de estancia larga. |
| 5 | Prevención de errores | 2/4 | Rango de fechas inválido se ignora en silencio. |
| 6 | Reconocimiento antes que recuerdo | 3/4 | WidgetStack flotante es solo icono hasta el hover. |
| 7 | Flexibilidad y eficiencia de uso | n/a | Superficie Persuade; no aplica. |
| 8 | Diseño estético y minimalista | 3/4 | Muy cuidado, pero ver el hallazgo de contraste P0. |
| 9 | Recuperación de errores | 2/4 | Mismo fallo silencioso de fechas. |
| 10 | Ayuda y documentación | 3/4 | FAQ y guía de huésped con contenido real. |
| **Total** | | **26/36 (n/a en #7)** | **72% → Bueno** |

## Veredicto de especificidad de diseño

Contenido muy específico de Hestía (propietarios con nombre/foto/WhatsApp propios, apartamentos atados a lugares reales, ilustración original del indalo, precio/disponibilidad reales, color por Hestía aplicado con disciplina real en todo el sitio). Composición de plantilla estándar del sector (hero de vídeo + buscador, carrusel de apartamentos, comparativa, contadores, testimonios, marquesina, equipo, footer — mismo orden que cualquier plantilla boutique de alquiler).

Confirmación cruzada: 46% de los hallazgos brutos del detector (ai-color-palette, 66/143) resultaron ser los tokens de marca documentados (--sol/--sol-lt) usados con consistencia real — el propio "falso positivo" es evidencia de un sistema de diseño aplicado, no genérico. Igual con kicker-above-heading y border-accent-on-rounded, ambos documentados en CLAUDE.md/SKILL.md.

Grieta real: SKILL.md documenta Playfair Display/Lora como tipografía de marca; producción carga y usa Fraunces + Hanken Grotesk.

## Lo que funciona

1. Identidad de color por Hestía ejecutada con disciplina real en cada punto de contacto (tarjetas, footer, tabla comparativa, tarjetas móvil).
2. Narrativa de reserva directa reforzada de forma consistente (0% comisiones, "no solo igualamos, mejoramos", ≤1h) en hero, tarjetas y modal dedicado.
3. Sección de equipo con nombres y fotos reales, WhatsApp individual por idioma, colocada a media página.

## Problemas prioritarios

**[P0] Texto literalmente invisible en "Tres atmósferas, una misma casa" y en la puerta de la guía**
Qué falla: `.apt-guide-gate-title` y su lista: `color: rgb(42,15,46)` sobre background efectivo `rgb(42,15,46)` — ratio 1.0:1. Tarjetas de apartamento (`.apt-num`, `.apt-tag`, `.apt-corner`, `.apt-avail-hint`): texto crema sobre el `--arena` claro real de `.apartments-scroll` (no la foto oscura que el componente asume) — ratio 1.0–1.1:1. `styles.css:2859` confirma en su propio comentario que el componente se diseñó para un fondo oscuro que aquí no está.
Por qué importa: es la "REGLA CRÍTICA: Contraste texto/fondo" que CLAUDE.md ya documenta como error #1 recurrente, capturado en vivo con las tres marcas de color explícitamente prohibidas.
Arreglo: override de contraste con scope al contexto claro, siguiendo el patrón que CLAUDE.md ya prescribe.
Comando sugerido: $impeccable harden

**[P1] El aviso de cookies tapa el CTA principal en los tres momentos de mayor intención de compra**
Qué falla: el banner cubre las miniaturas de apartamento en el hero, la zona CTA de las tarjetas, y el botón "RESERVAR AHORA" del DirectBookingModal.
Por qué importa: le pasa a todo visitante nuevo, en los momentos de más conversión; contradice el propio comentario del código.
Arreglo: banner anclado arriba o toast en esquina que nunca se solape con un CTA.
Comando sugerido: $impeccable harden

**[P1] Dos cifras distintas para la misma promesa de ahorro en estancias largas**
Qué falla: DIRECT_RIBBON/DIRECT_PERKS hardcodean −30% (shared.jsx:3169,3194); LongStayStrip calcula en vivo y da −40% (sections-1.jsx:919).
Por qué importa: exactamente lo que CLAUDE.md prohíbe explícitamente; corrosivo para la confianza en un sitio cuya propuesta de valor es la transparencia de precio.
Arreglo: calcular el stat de DIRECT_PERKS/DIRECT_RIBBON con la misma lógica que ya usa LongStayStrip.
Comando sugerido: $impeccable harden

**[P2] El formulario de fechas del hero ignora en silencio un rango inválido**
Qué falla: goReservas (sections-1.jsx:87-94) sale sin hacer nada si hcOut <= hcIn.
Por qué importa: heurísticas 1 y 9 fallan a la vez en el primer formulario de la página.
Arreglo: deshabilitar el envío y/o mensaje inline cuando el rango no es válido.
Comando sugerido: $impeccable harden

**[P2] Objetivos táctiles por debajo de 44px en el flujo de reserva**
Qué falla: hero-af-btn (342×36), hero-cta-anim (266×38), chips de apartamento (~32px alto), celdas del calendario (39×40).
Por qué importa: es precisamente el flujo de elegir fechas y reservar.
Arreglo: subir a 44×44 mínimo, empezando por las celdas del calendario.
Comando sugerido: $impeccable adapt

**[P2] Cabecera + hero superan el límite de carga cognitiva antes de leer nada**
Qué falla: 4 de 8 ítems del checklist de carga cognitiva fallan; 10 destinos de nav + selector de idioma + CTA, más 2 campos de fecha + botón + segundo CTA + 3 miniaturas, todo en la primera pantalla.
Por qué importa: marca boutique "solo dos propietarios"; una cabecera densa va en contra de esa intimidad.
Arreglo: bajar la cabecera a ≤5 ítems de primer nivel; el hero con una sola acción dominante.
Comando sugerido: $impeccable clarify

**[P3] Selector de idioma cortado y con objetivo táctil pequeño en móvil**
Qué falla: borde derecho de .topbar .lang en x=399px sobre un viewport de 390px (9px fuera); botones de 35×21 / 37×21.
Por qué importa: es el selector de idioma de un sitio bilingüe para turismo internacional.
Arreglo: ajustar padding de la topbar o reducir el combo emoji+texto en móvil.
Comando sugerido: $impeccable polish

## Alertas por perfil de usuario

**Jordan (primeriza)**: banner de cookies tapa las miniaturas de apartamento; fecha invertida no da feedback; iconos del WidgetStack sin etiqueta visible hasta el hover.

**Riley (que pone a prueba el sitio)**: `#apartamentos` en carga en frío no hace scroll (React monta después del salto de ancla); −30% en el modal vs −40% en la franja de estancia larga; Escape funciona en los modales pero no en el menú móvil.

**Casey (móvil, con una mano)**: banner de cookies en su zona de pulgar; toggle "EN" físicamente cortado en el borde; comparar apartamentos en móvil exige deslizar tres tarjetas largas en vez de una tabla compacta.

## Observaciones menores

- Bridge y Gallery completamente construidos pero no renderizados en ningún sitio de docs/.
- Animación de contadores (2.2s) puede pillarse a media carrera con scroll rápido.
- En móvil, las tarjetas de equipo muestran cita/contacto antes que la foto, orden inverso al de escritorio.
- Color del CTA de LongStayStrip (--accent, #C87A45) cercano al cobre de Thalassa (--vt) en una sección agnóstica de apartamento.
- Jerarquía de encabezados rota: h2 salta directo a h5.
- Varios textos funcionales por debajo de 11px.
- 19 botones con sombra difusa + borde 1px ("glow"); colores on-brand pero técnica típica de "IA genérica", decisión legítima que merece revisión de intención.

## Preguntas para pensar

1. El hero ofrece tres caminos que compiten (fecha / explorar apartamento / comparar) — ¿"elige tus fechas" es de verdad el primer movimiento más fuerte, o convertiría mejor "qué Hestía es la tuya"?
2. El aviso de cookies tapa el CTA del que más orgullosa está la marca en tres puntos distintos — ¿cómo sería un consentimiento diseñado para no competir nunca con una decisión de compra?
3. Si el sistema de diseño está tan bien documentado y aplicado, ¿por qué la tipografía real en producción no coincide con la que documenta el propio proyecto? ¿Cuál de las dos se quiere de verdad?
