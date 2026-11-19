# Reel de Hestía Mar (22,2 s, 1080x1920)

Mismo tratamiento que «Sube el volumen» v2 (ver `../sonido-vera-playa/REVIEW.md`), solo con Mar.

- Escenas: terraza de Mar (día a noche), salón con la cocina abierta, piscina y jacuzzi de noche, y cierre con logo, nombre y web. Clips reutilizados (0 créditos): terraza (`assets/video/terraza.mp4`, del reel del sonido) y el resto de `assets/video/`.
- Piscina: clip nuevo de Higgsfield `seedance_2_0_mini`, 9:16, 5 s, 5 créditos, trabajo `2291abfe-6a6d-4978-8231-34ebf1a3c3c7`, a partir de un recorte vertical de la foto real `apt-vm-gallery-4.jpg` (`assets/images/piscina-vertical.jpg`). Empuje suave sobre el agua y el jacuzzi iluminados, sin personas.
- Gancho en cinemagraph: terraza congelada (`assets/images/terraza-f0.jpg`) y solo el cielo evoluciona por una ventana con borde difuminado que baja hasta abrir el plano completo (1,8 a 3,4 s).
- Uniones «cut the curve» hacia la izquierda, estampadas desde `ledger.json` con `seam-stamp.mjs` (skill `motion-doctrine`). El comprobador `seam-gate.mjs` no ve la línea de tiempo en este entorno; se verificó con `hyperframes snapshot` y fotogramas del render final alrededor de cada corte.
- Datos de los rótulos: solo de CLAUDE.md y de la ficha del apartamento (playa a 300–400 m en Mar; dos terrazas, 900 m de la playa, 87 m² y pistas de pádel y tenis en Salinas).
- Audio: el ambiente de mar de `../sonido-vera-playa` (`sea-ambient.mp3`, procedencia y licencia sin documentar). Sin oír el audio del modelo en los clips, que van mudos.
- Salida: `renders/reel-mar-ig.mp4` (ignorada por git), recodificada con crf 19.
