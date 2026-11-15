# Revisión: «Sube el volumen», tres Hestías

Reel vertical 1080x1920, 30 fps, 23,4 s, con sonido ambiente de mar y sin música.

## Decisiones
- Una foto real de cada Hestía, del día al atardecer: terraza de Mar (`apt-vm-gallery-12`), terraza del ático de Thalassa (`apt-vt-gallery-01`) y piscina de Salinas al atardecer (`apt-vs-gallery-32`). Cada foto nueva sube desde la línea del horizonte.
- Texto mínimo y solo con datos de CLAUDE.md: Mar, la playa a 300–400 m; Thalassa, el ático con SPA comunitario; Salinas, el más grande, 87 m². Cierre: «Tres casas en Vera Playa» y la web. Gancho en el fotograma 0: «Sube el volumen.».
- Un punto de color por Hestía junto al nombre (olivo, cobre, dorado), como pide la marca.

## Sonido: lo que hay que saber
- No existe en el repo ninguna grabación de ambiente de las casas. Se ha usado `docs/assets/sea-ambient.mp3`, el sonido de mar del botón de sonido del Home: bucle de 18 s enlazado con fundido cruzado, normalizado a −16 LUFS (medido −17,8 tras los fundidos) y con fundidos de entrada y salida.
- Es un mismo ambiente de mar para las tres escenas, no el sonido de cada sitio.
- **No consta el origen ni la licencia** de `sea-ambient.mp3`. Está ya publicado en la web, pero conviene confirmarlo antes de publicar el reel en redes.
- El intento de usar sonido de librería (Openverse) no funcionó desde este entorno.

## Medido y no medido
- `check`: 0 errores y 0 avisos (zona segura de Reels, TikTok y Shorts cumplida). Fotogramas del render revisados; audio medido en el MP4.
- No se ha oído el resultado: no sé cómo suena tras subir unos 24 dB el original, que estaba muy bajo (puede notarse el ruido de fondo).

## Punto más débil
El sonido: es un bucle genérico de mar. Con 20 s grabadas en cada terraza y piscina sería la pieza que pedía la idea.
