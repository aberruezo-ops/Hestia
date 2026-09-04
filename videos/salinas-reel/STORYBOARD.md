---
format: 1080x1920
duration: 24s
message: "Así es Hestía Salinas, contado por Alex y Fran con lo que dice la web: albero, tres piscinas, dos terrazas, el mar a 900 metros; reserva directa sin comisiones"
arc: Saludo → Mar → Terraza y piscina → La casa → La promesa → Cierre de marca
audience: huéspedes pasados y seguidores dormidos de Hestía; familias y parejas que ya conocen Vera Playa
mode: autonomous
current: LEFT
---

Una sola composición monolítica (`index.html`): la carta se teclea de forma continua en crema directamente sobre las fotos, con velo berenjena inferior (blueprint `typewriter-reveal`, variante Hook, regla `discrete-text-sequence`), mientras la capa de fotos cambia debajo con cortes velocity-matched. Las fotos no son escenas: son el fondo que la carta va revelando. Ruta de movimiento sostenido de cada fase: **staged reveals** (el texto sigue llegando carácter a carácter) + **camera with intent** (paneo lento de cada foto, receta Ken Burns sobre el wrapper interior). Sin música: Instagram la pone; lo dice el guion del mes.

## Frame 1 — Saludo · terraza al atardecer

- scene: Chip de marca arriba (waterfall-entry) y la H del logo en albero; se teclea "Hola, así es Hestía Salinas, en Vera Playa:"
- duration: 4.6s
- transition_in: cut
- status: animated
- src: index.html
- photo: assets/images/salinas-27.jpg (terraza principal, nubes encendidas)
- blueprint: typewriter-reveal (Hook) · rules: discrete-text-sequence, waterfall-entry, Ken Burns (creator-editing-recipes)

Apertura cálida: la foto más reconocible de Salinas y la primera línea de la carta.

## Frame 2 — El mar · pérgola

- scene: Foto de la pérgola entra por cut-the-curve LEFT; se teclea "Albero del amanecer, junto a las salinas." con un error corregido ("Alber0" → backspace) para que se note una mano
- duration: 4.2s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-19.jpg
- rules: discrete-text-sequence (backspace-and-retype), cut-the-curve §3

## Frame 3 — Desayuno y piscina

- scene: Piscina con palmeras; "Tres piscinas, dos terrazas, el mar a 900 metros."
- duration: 3.8s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-31.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 4 — La casa

- scene: Salón albero con luz de día; "El más grande de los tres, para 6 y un bebé."
- duration: 3.8s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-1.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 5 — La promesa

- scene: Terraza de noche; "Y la luz dorada de la tarde en cada habitación." y firma "Alex y Fran"
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
