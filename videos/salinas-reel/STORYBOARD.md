---
format: 1080x1920
duration: 24s
message: "Esto es lo que te espera en Hestía Salinas en septiembre, escrito por Alex y Fran; reserva directo y te lo enseñamos en persona"
arc: Saludo → Mar → Terraza y piscina → La casa → La promesa → Cierre de marca
audience: huéspedes pasados y seguidores dormidos de Hestía; familias y parejas que ya conocen Vera Playa
mode: autonomous
current: LEFT
---

Una sola composición monolítica (`index.html`): la carta se teclea de forma continua en una tarjeta crema (blueprint `typewriter-reveal`, variante Hook, regla `discrete-text-sequence`), mientras la capa de fotos cambia debajo con cortes velocity-matched. Las fotos no son escenas: son el fondo que la carta va revelando. Ruta de movimiento sostenido de cada fase: **staged reveals** (el texto sigue llegando carácter a carácter) + **camera with intent** (paneo lento de cada foto, receta Ken Burns sobre el wrapper interior). Sin música: Instagram la pone; lo dice el guion del mes.

## Frame 1 — Saludo · terraza al atardecer

- scene: Chip de marca arriba (waterfall-entry); la tarjeta crema aparece y teclea "Hola, esto te espera en Salinas en septiembre:"
- duration: 4.6s
- transition_in: cut
- status: animated
- src: index.html
- photo: assets/images/salinas-27.jpg (terraza principal, nubes encendidas)
- blueprint: typewriter-reveal (Hook) · rules: discrete-text-sequence, waterfall-entry, Ken Burns (creator-editing-recipes)

Apertura cálida: la foto más reconocible de Salinas y la primera línea de la carta.

## Frame 2 — El mar · pérgola

- scene: Foto de la pérgola entra por cut-the-curve LEFT; se teclea "El mar guarda el calor del verano." con un error corregido ("veran0" → backspace) para que se note una mano
- duration: 4.2s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-19.jpg
- rules: discrete-text-sequence (backspace-and-retype), cut-the-curve §3

## Frame 3 — Desayuno y piscina

- scene: Piscina con palmeras; "Desayuno en la terraza, piscina a media mañana."
- duration: 3.8s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-31.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 4 — La casa

- scene: Salón albero con luz de día; "El más luminoso de los tres, junto al Parque Natural."
- duration: 3.8s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-1.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 5 — La promesa

- scene: Terraza de noche; "Reserva directo: te lo enseñamos en persona." y firma "Alex y Fran"
- duration: 5.1s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-25.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 6 — Cierre de marca

- scene: La carta se retira (pull, encogiendo) y llega el panel berenjena con "Hestía Salinas", ventajas en cascada y hestiayourhome.com sobre la piscina rosa
- duration: 2.5s
- transition_in: inverse zoom-through (arrival)
- status: animated
- src: index.html
- photo: assets/images/salinas-32.jpg
- rules: cut-the-curve §2 (inverse zoom-through), waterfall-entry (ventajas), ambient-glow-bloom (halo dorado tras el lockup)

Vector reservado gastado con causa: la carta termina (fin del capítulo) y "algo más grande" llega: la marca.
