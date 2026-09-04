---
format: 1080x1920
duration: 30s
message: "Así es Hestía Salinas, contado por Alex y Fran: la marca, el detalle real del Parque Natural de las Salinas de Puerto Rey, y lo que hay dentro de casa; reserva directa sin comisiones"
arc: Saludo y marca → Vera Playa, esto es Salinas → el detalle de las Salinas de Puerto Rey (clímax) → piscinas y terrazas → la casa y la firma → cierre de marca
audience: huéspedes pasados y seguidores dormidos de Hestía; familias y parejas que ya conocen Vera Playa
mode: autonomous
current: LEFT
---

Una sola composición monolítica (`index.html`): la carta se teclea de forma continua en crema directamente sobre las fotos, con velo berenjena inferior (blueprint `typewriter-reveal`, variante Hook, regla `discrete-text-sequence`), mientras la capa de fotos cambia debajo con cortes velocity-matched. Las fotos no son escenas: son el fondo que la carta va revelando. Ruta de movimiento sostenido de cada fase: **staged reveals** (el texto sigue llegando carácter a carácter) + **camera with intent** (empuje/retirada de escala real más paneo en cada foto, no solo un barrido; el plano del clímax lleva el empuje más marcado). Cada corte de foto coincide con el arranque de una frase nueva: la imagen y el texto avanzan juntos. Sin música: Instagram la pone; lo dice el guion del mes.

## Frame 1 — Saludo y marca · salón con la pared "Hestía"

- scene: Chip de marca arriba (waterfall-entry) y la H del logo en albero; se teclea "Hola, somos Alex y Fran. Esto es Hestía:" con un error corregido al escribir "Hestía" (0→backspace), para que se note una mano
- duration: 5.5s
- transition_in: cut
- status: animated
- src: index.html
- photo: assets/images/salinas-1.jpg (salón, letras "HESTÍA VERA" en la pared dorada)
- blueprint: typewriter-reveal (Hook) · rules: discrete-text-sequence, waterfall-entry, camera-with-intent

Apertura de marca: la propia pared del salón dice "Hestía" mientras la carta la nombra.

## Frame 2 — Vera Playa, esto es Salinas

- scene: Terraza chill-out; "Tres casas en Vera Playa: esta es Salinas."
- duration: 3.9s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-13.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 3 — El detalle de las Salinas de Puerto Rey (clímax)

- scene: Terraza al atardecer, cielo dorado; "Junto a las Salinas de Puerto Rey: flamencos y amaneceres dorados." Empuje de cámara más marcado que en el resto del reel.
- duration: 5.6s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-27.jpg
- rules: discrete-text-sequence, cut-the-curve §3, camera-with-intent (empuje acentuado)

El único dato exclusivo de Salinas frente a Mar y Thalassa: el Parque Natural, con flamencos y luz dorada.

## Frame 4 — Piscinas y terrazas

- scene: Piscina comunitaria con palmeras; "Tres piscinas, dos terrazas, la playa a 900 metros."
- duration: 4.6s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-31.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 5 — La casa y la firma

- scene: Terraza pérgola, desayuno; "El más grande y luminoso de los tres: sitio de sobra para 6 y un bebé." y firma "Alex y Fran"
- duration: 6.63s
- transition_in: cut-the-curve LEFT
- status: animated
- src: index.html
- photo: assets/images/salinas-19.jpg
- rules: discrete-text-sequence, cut-the-curve §3

## Frame 6 — Cierre de marca

- scene: La carta se retira (pull, encogiendo) y llega el panel berenjena con "Hestía Salinas", regla dibujada, ventajas en cascada y hestiayourhome.com sobre la piscina rosa
- duration: 3.77s
- transition_in: inverse zoom-through (arrival)
- status: animated
- src: index.html
- photo: assets/images/salinas-32.jpg
- rules: cut-the-curve §2 (inverse zoom-through), waterfall-entry (ventajas), ambient-glow-bloom (halo dorado tras el lockup)

Vector reservado gastado con causa: la carta termina (fin del capítulo) y "algo más grande" llega: la marca.
