---
workflow: general-video
flow: automation
storyboard: no
message: "Así es Hestía Salinas, contado por Alex y Fran con lo que dice la web: albero, tres piscinas, dos terrazas, el mar a 900 metros; reserva directa sin comisiones"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: huéspedes pasados y seguidores dormidos de Hestía (1.124), familias y parejas que ya conocen Vera Playa
length: 24s
angle: carta-de-los-anfitriones
---

## Intent

Reel vertical de Hestía Salinas para Instagram y Facebook. Concepto elegido: **la carta de Alex y Fran**: una nota que se escribe en pantalla, línea a línea, como si la tecleara uno de los anfitriones ("Hola, esto es lo que te espera en Salinas en septiembre…"), y cada línea revela detrás una foto real del apartamento y del entorno. Cierra con la promesa de reserva directa. Tiene que sonar a personas, no a agencia: es la razón por la que se descartaron los 32 reels genéricos anteriores. Tono: cercano, cálido, primera persona del plural, sin exageraciones ni precios. Sin guion largo (em dash). Español de España; una sola línea en inglés al final.

## Assets

- assets/images/salinas-27.jpg — terraza principal, nubes encendidas al atardecer; apertura.
- assets/images/salinas-19.jpg — terraza pérgola, desayuno sin reloj.
- assets/images/salinas-20.jpg — desayuno Hestía en la terraza, primer regalo del día.
- assets/images/salinas-32.jpg — piscina comunitaria, rosa de atardecer en el agua.
- assets/images/salinas-31.jpg — piscina comunitaria, palmeras arriba.
- assets/images/salinas-1.jpg — salón comedor, luz de día sobre albero.
- assets/images/salinas-23.jpg — dormitorio principal, de la cama a la terraza.
- assets/images/salinas-25.jpg — terraza principal de noche, la urbanización se enciende; cierre.
- assets/images/salinas-13.jpg, salinas-2.jpg — reserva.
- assets/audio/salinas-walkthrough-music.m4a — pista de música del vídeo de recorrido oficial (81 s, -6,9 dB medio); candidata a cama a bajo volumen.
- Descartados: el vídeo de recorrido (848x480 horizontal, con rótulos y marca de agua incrustados: no aguanta un recorte vertical) y reel-vs.mp4 (recorte borroso con texto quemado).

## Customizations

- Texto que se teclea con cursor (blueprint typewriter-reveal, regla discrete-text-sequence): el motor del reel.
- Fotos con movimiento lento (Ken Burns sobre un wrapper interior), una por línea de la carta.
- Enlaces con utm_campaign=voz-2026-09 en el pie del post (fuera del vídeo).

## Notes

- Marca Hestía como verdad de diseño (styles.css y pago.html): berenjena #2A0F2E / #3D1A35, crema #FFFCF6 / #F0E8D5, cobre #C87A45, y el color propio de Salinas, dorado #D4A84A (oscuro #7A5E1A). Tipografía Fraunces (display) + Hanken Grotesk (cuerpo). Bordes asimétricos 10px 0 10px 0.
- Hechos permitidos: solo los de strategy/redes/hechos-y-ventajas.md y la Voz de septiembre 2026 (docs/data/noticias/2026-09.json). Nada de precios ni disponibilidad.
- El reel es el borrador "voz-2026-09" / "guion-2026-09" de docs/data/social-drafts.json llevado a vídeo; el texto del post sale del borrador voz.
- Segunda ronda de Alex: la carta no decía nada y "te lo enseñamos en persona" no es cierto. Texto reescrito solo con la ficha de Salinas de la web (concepto "albero del amanecer, cerca de las salinas", tres piscinas, dos terrazas, mar a 900 m, el más grande de los tres, 6 plazas + bebé, luz dorada de la tarde). La H del logo es la real (logo-teal-transparent.png) recoloreada a albero, en la cabecera y en el cierre.
- Cambio confirmado por Alex tras el primer render: sin tarjeta crema; la carta se escribe en crema directamente sobre las fotos, con velo berenjena inferior y sombra de texto, para que se vean las imágenes.
- Sin banner de estado de móvil ni teclado falso. Zona segura inferior de Instagram (últimos ~300 px) libre de texto importante.
