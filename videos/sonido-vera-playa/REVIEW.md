# Revisión: «Sube el volumen», tres Hestías

Reel vertical 1080x1920, 30 fps, 23,4 s, con sonido ambiente de mar y sin música.

## Decisiones
- Una terraza animada de cada Hestía, cada una pasando de la luz de día a la noche: Mar (`apt-vm-gallery-12`, parte de cielo de día y llega a la noche con las velas), Thalassa (`apt-vt-gallery-01`, del atardecer dorado a la noche estrellada, con las luces del pueblo) y Salinas (`apt-vs-gallery-13`, de la luz de día a la noche, con el farol y las ventanas encendidas). Cada clip nuevo sube desde la línea del horizonte.
- Los clips son animaciones de IA hechas con Higgsfield (Seedance 2.0 mini, 9:16, 5 s) a partir de las fotos reales, con la orden de conservar el mobiliario y las vistas. Coste: 15 créditos. Dos intentos de Salinas con otra foto fueron rechazados por el detector de propiedad intelectual y se reembolsaron; el definitivo usa el mismo texto que ya había funcionado en horizontal. Se reproducen a cámara lenta suave (0,63 a 0,75) para llenar cada escena.
- Texto mínimo y solo con datos de CLAUDE.md: Mar, la playa a 300–400 m; Thalassa, el ático con SPA comunitario; Salinas, el más grande, 87 m². Cierre: «Tres casas en Vera Playa» y la web. Gancho en el fotograma 0: «Sube el volumen.». Punto de color por Hestia junto al nombre. Un velo local detrás del texto garantiza la lectura sobre cielo claro.
- Thalassa no empieza a pleno día: el modelo arranca ya en luz dorada. Un amanecer de verdad habría exigido una foto de partida de amanecer.

## Sonido: lo que hay que saber
- No existe en el repo ninguna grabación de ambiente de las casas. Se ha usado `docs/assets/sea-ambient.mp3`, el sonido de mar del botón de sonido del Home: bucle de 18 s enlazado con fundido cruzado, normalizado a −16 LUFS (medido −17,8 tras los fundidos) y con fundidos de entrada y salida.
- Es un mismo ambiente de mar para las tres escenas, no el sonido de cada sitio.
- **No consta el origen ni la licencia** de `sea-ambient.mp3`. Está ya publicado en la web, pero conviene confirmarlo antes de publicar el reel en redes.
- Como las terrazas están animadas con IA, Meta puede pedir la etiqueta de contenido generado con IA al publicar.
- El intento de usar sonido de librería (Openverse) no funcionó desde este entorno.

## Medido y no medido
- `check`: 0 errores y 0 avisos (zona segura de Reels, TikTok y Shorts cumplida). Fotogramas del MP4 real revisados en cada escena; audio medido en el MP4.
- No se ha oído el resultado: no sé cómo suena tras subir unos 24 dB el original, que estaba muy bajo (puede notarse el ruido de fondo).

## Punto más débil
El sonido: es un bucle genérico de mar. Con 20 s grabadas en cada terraza y piscina sería la pieza que pedía la idea.

## v2 (19 nov 2026): cinemagraph y transiciones con velocidad igualada

- Gancho en cinemagraph: la terraza de Mar queda congelada (`assets/images/mar-f0.jpg`, fotograma 0 del clip) y solo el cielo evoluciona a través de una ventana con borde difuminado (máscara en `#m1`, variable `--cg`). La ventana baja entre 1,8 y 3,4 s hasta abrir el plano completo, y el clip sigue desde ahí.
- Las tres uniones (Mar a Thalassa a 7,2 s, Thalassa a Salinas a 13,2 s y Salinas a cierre a 19,4 s) son «cut the curve» hacia la izquierda, estampadas con `seam-stamp.mjs` de la skill `motion-doctrine` desde `ledger.json`: la escena que sale acelera con `power3.in` y la que entra recoge el movimiento con `power4.out`, sin disolver. Sustituyen la subida desde la línea del horizonte (recorte con `clip-path`).
- El cierre va dentro del contenedor `#cw` porque la regla de lint no deja animar `autoAlpha` sobre un clip.
- `seam-gate.mjs verify` falla en las tres uniones porque no ve la línea de tiempo en este entorno (la sonda no detecta ningún movimiento aunque el render sí lo tiene). La verificación se hizo con `hyperframes snapshot` y con fotogramas del render final alrededor de cada corte.
- Velo del gancho subido a 0,68 para que «Sube el volumen.» mantenga contraste sobre el cielo claro del cinemagraph.
- Audio sin cambios: el mismo ambiente de mar (−17,9 LUFS medido). Pendiente: la procedencia de `sea-ambient.mp3`.
- Salida: `renders/sonido-vera-playa-v2-ig.mp4` (1080x1920, 23,4 s, crf 19).
