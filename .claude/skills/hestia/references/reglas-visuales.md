# Reglas visuales de Hestía

Detalle de las reglas de marca. El resumen con los «nunca» vive en `CLAUDE.md`; aquí está el desarrollo completo. Léelo antes de tocar estilos, componentes, iconos, logos o recursos gráficos, y pasa el subagente `revisor-marca` antes de publicar cambios visibles.

## Fondo de la web · cal viva que respira (regla siempre)

El fondo claro de la marca es **cal viva**: un blanco de cal casi neutro, apenas cálido (matiz 40°, saturación ~9 %). Decisión del propietario, nov 2026, tras probar el blanco azulado «sal y mar» y la arena / beis (ambos descartados; la arena se leía a plantilla de IA). Tokens:

- `--crema` **#F6F5F4** (fondo de página y texto claro sobre oscuro) · `--arena` **#E6E4DF** · `--arena-dk` **#D7D3CB**. Los nombres no cambian; el valor base es la cal.
- **El tono respira con el scroll**: `docs/assets/color-scroll.js` (cargado antes de `styles.css` en cada HTML) recalcula el matiz de los 8 tokens de cal (`--crema`, `--arena`, `--arena-dk`, `--crema-alba/dawn/noon/dusk/warm`) según los píxeles desplazados (0,07° por píxel, vuelta completa cada ~5.100 px; arriba del todo es la cal base, matiz 40°; después greige, salvia, bruma, azul pizarra, lila, rosa palo), con saturación baja (0,12) y luminosidad intacta, así el contraste no cambia. `styles.css` los registra con `@property` y un `transition` de 0,45 s en `:root` para suavizar el paso. Con `prefers-reduced-motion` no se mueve y queda la cal base. Los PDF, las páginas estáticas generadas y los valores base citados aquí son la cal fija. En CSS nuevo usa siempre los tokens, no un hex de cal, para que acompañe el cambio.
- La cabecera de día es plana: `--crema` sin degradado, sin brillos dorados ni cobre, con un filete turquesa fino abajo. **Nunca** mezclar arena, oro o cobre en el fondo de la cabecera ni de una sección clara.
- Los tonos `--crema-alba/dawn/noon/dusk/warm` (secciones de día) son variaciones de luminosidad de la misma cal, sin cambiar de matiz.
- **Nunca** volver a la arena / beis ni al blanco azulado o gris frío como fondo claro de página, tarjeta, PDF o gráfico nuevo. Si necesitas un tono claro nuevo, deriva uno de la cal (matiz 40°, saturación baja) con la misma luminosidad.
- Excepción: los vídeos ya publicados (`docs/assets/hestia-*.mp4` y `docs/assets/video/`) conservan su fondo azulado a propuesta del propietario; los nuevos que se hagan, en cal viva.
- Los fondos de aviso (`--warn-bg` #F5E8D4 y #FFF3CD) siguen cálidos y más saturados, para que un aviso se distinga de un fondo de página.
- Las paredes del plano 3D son materiales del piso real y conservan su tono; el fondo de la escena es #EDECE9.

## Recursos gráficos «de IA» · prohibidos (regla siempre)

Además del filo de color sobre tarjetas (ver «Marca de tarjeta»), **ninguna caja, aviso, cita ni tarjeta lleva raya de acento a un lado** (`border-left` de 2 px o más, o barra `::before` lateral), ni siquiera en avisos, errores, citas, KPI o el panel de admin. Un aviso se distingue por su fondo tintado y su texto, no por una barra. Tampoco: bordes de gradiente, texto con degradado, tarjetas de cristal con brillo, iconos dentro de círculo de color, emojis de adorno, ni cifras gigantes con subtítulo en mayúsculas. Si dudas de si algo «se lee a plantilla», no lo pongas.

## Color por Hestía · identidad (regla siempre)

Cada Hestía tiene SU color y debe llevarlo **siempre que se le nombre o represente**, para que el usuario asocie el color al apartamento:

- **Mar** = olivo `--vm` (#6B7A3A · dk `--vm-dk` · claro `--vm2`)
- **Thalassa** = cobre `--vt` (#B86A3C · dk `--vt-dk` · claro `--vt2`)
- **Salinas** = dorado `--vs` (#D4A84A · dk `--vs-dk` · claro `--vs2`)

Cómo aplicarlo, según el fondo (respeta la regla de contraste):
- **Sobre fondo claro**: tinta el nombre/acento con el color del apartamento (`color: var(--vm|--vt|--vs)`), o su variante `-dk` si el color base no contrasta.
- **Sobre fondo oscuro o cuando teñir el texto arriesga contraste**: usa el marcador `<span className="apt-dot" data-apt="vm|vt|vs"/>` junto al nombre (primitiva en styles.css, visible en cualquier fondo). Nunca uses un color de apartamento como texto sobre un fondo con el que no contraste.

Siempre que añadas una zona que liste, enlace o compare los tres (footer, tabla, selector, alternativas, guía), cada uno lleva su color. Fuente única de los tokens: `styles.css` (`--vm/--vt/--vs`) y `_ALT_APTS` en `shared.jsx`.

**Logo**: solo en seis versiones: blanco, teal del día (`--sol`), berenjena de noche (`--ber-dk`) y el color de cada Hestía (Mar, Thalassa, Salinas). Ficheros en `docs/assets/`: `logo-blanco.png`, `logo-teal-transparent.png`, `logo-berenjena.png`, `logo-mar.png`, `logo-thalassa.png`, `logo-salinas.png`. Ningún otro color, ni filtros que lo cambien. El ciclo animado de cabecera y pie (18 s) funde estos mismos PNG (`logo-*-160.png` en pequeño): teal, berenjena de noche (blanco si el fondo es oscuro), Thalassa, Salinas, Mar; nunca `hue-rotate`.

**Marca de agua de las fotos de apartamento**: logo pequeño del color de cada Hestía (`logo-mar-160.png`, `logo-thalassa-160.png`, `logo-salinas-160.png`) con un halo crema fino para que se lea sobre cualquier foto, puesto con CSS, no horneado en los ficheros. Arriba a la derecha en la cabecera de la ficha, en el mosaico y en el visor; abajo a la derecha en las tarjetas de la portada (arriba está el chip de disponibilidad). El Indalo, abajo a la izquierda en la cabecera de la ficha. Mismo tamaño y mismo sitio en cada tipo de contenedor.

## Iconografía · gramática "Sello" (regla siempre)

Todos los iconos de la web salen del sprite propio (`IconSprite` en `shared.jsx`) y se pintan con `<HiIcon name="…"/>`. Gramática única:

- **Trazo fino (1,5)** en `currentColor` y **esquina asimétrica de la marca** (sup-izq e inf-der redondeadas) en toda forma rectangular.
- **Segunda tinta**: la masa principal del icono en color plano, desplazada 2 px (`.hi-plate`), como un sello impreso fuera de registro. En iconos de solo trazo abierto, el trazo desplazado (`.hi-plate-ln`).
- **El color de marca vive en la placa, nunca en el trazo.** La placa usa `--hi-accent`, que sigue al apartamento si el contenedor define `--apt-accent`; para forzarlo en un sitio, `--hi-tint`. El trazo va en color de texto (tinta sobre claro, crema sobre oscuro). Trazo y placa del mismo tono = mancha: es un bug.
- **Sin fichas ni círculos de fondo** detrás del icono: el sello ya es su soporte.
- **Nada de emojis ni glifos (`✓ ✦ ★ ✗`) haciendo de icono** en la interfaz: usa `check`, `spark` (tesela), `star-fill`, `ban`… Solo quedan como texto donde no se puede pintar un icono (mensajes de WhatsApp, asuntos de email) y en controles tipográficos (`✕` de cerrar).
- Dentro del `<symbol>`, estilos solo por clase sin selector de ancestro (`.hi-plate`, `.hi-ln`, `.hi-fi`): los selectores anidados no alcanzan el contenido de un `<use>`.
- Excepciones: logos de plataformas (Booking, Airbnb, Google, WhatsApp, redes) y piezas de marca (logo, Indalo), que conservan su dibujo.

## Marca de tarjeta · el «horizonte» (regla siempre)

**Prohibido el filo de color sobre las tarjetas** (`border-top` de 2 a 3 px, barras `::before` arriba, rayas de acento en un lado): se lee a plantilla de IA. La marca de una tarjeta es el **horizonte**: una línea nítida de oleaje y dos de eco casi fantasma por el borde superior, en el color de la Hestía (o del acento de la tarjeta), que se desvanecen hacia la izquierda (menos líneas y más transparencia es siempre mejor que más). Es el mar de fondo del Levante, no un adorno suelto: sutil, sin curvas gruesas, con el texto a salvo. Primitiva al final de `styles.css` ("HORIZONTE"): añade el selector de la tarjeta a las listas `:is(...)`, fija `--ola-c` (color) y deja al menos 46 px de relleno superior. La forma es una máscara SVG que encaja consigo misma cada 420 px, con tres variantes que alternan entre hermanas (`:nth-child`), generadas con `scripts/lib/ola-mask.mjs`; quieta en reposo, al pasar el ratón por la tarjeta las olas fluyen despacio (bucle pausado, no reiniciado, para que al salir se queden donde estaban); en las páginas estáticas es `.apt-nota` (`scripts/lib/pagina-estatica.mjs`). Las tarjetas grandes de apartamento (`.as-body`) llevan además la «orilla»: dos olas finísimas al pie que avanzan despacio y suben un poco al pasar el ratón (todo el movimiento se apaga con `prefers-reduced-motion`; en táctil no hay ratón, así que las olas quedan quietas). Una marca por tarjeta; nunca hojas, sellos ni rayas.

## Contraste · regla preventiva (fondos oscuros)

> El contraste oscuro-sobre-oscuro ha sido un fallo recurrente. Para que no vuelva a pasar:

- **Toda sección con fondo oscuro lleva la clase `on-dark`** (en `styles.css`: fija el color de texto por defecto en claro, `--crema`). Así, si un elemento olvida declarar su color, hereda claro (legible), no el oscuro de página.
- **Contrapartida obligatoria**: toda superficie clara anidada (tarjeta blanca, input, píldora clara) sobre un fondo oscuro **declara su propio color de texto oscuro** (`color: var(--ink)`), para no heredar claro-sobre-blanco.
- **Nunca** uses `--ink`, `--ink-soft` ni un acento oscuro (de marca) para texto que va directo sobre un fondo oscuro. Usa los tonos crema (`--crema`, `rgba(230,228,223,...)`).
- **Cubre todos los estados**, no solo el inicial: `:hover`, `:focus`, `:disabled`, vacío, cargando y "no disponible". El audit de contraste solo recorre el estado inicial de cada página, así que los estados que aparecen tras interactuar (resultados, no disponible, desplegables) no los caza: revísalos a mano.
