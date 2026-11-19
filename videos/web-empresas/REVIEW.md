# Vídeo web de /empresas.html (28 s, 1920x1080, sin audio)

Mismo método que los reels (ver `../reel-mar/REVIEW.md` y `../sonido-vera-playa/REVIEW.md`): gancho en cinemagraph, uniones «cut the curve» a la izquierda estampadas desde `ledger.json`, cierre con logo. Clips ya generados (0 créditos): terraza, salón, dormitorio y urbanización.

- Dos idiomas: `index.html` (es) y `index.en.html` (en). Para renderizar el inglés hay que usarlo como `index.html` en una carpeta aparte con enlace a `assets/` (HyperFrames renderiza solo `index.html`).
- Salida en la web: `docs/assets/empresas-video.mp4` y `empresas-video-en.mp4` (crf 25, sin audio) con sus pósters. Se incrusta con `PageVideo` (`docs/components/shared.jsx`) en `empresas-page.jsx`.
- Sin audio a propósito: no hay música con licencia documentada. El texto va dentro del vídeo, y la página lo ofrece también como texto oculto (`aria-describedby`).
- La nota bajo el vídeo dice que los clips están animados con IA a partir de fotos reales; la luz y el movimiento son generados.
- Hechos de los rótulos: cocina, lavadora e independencia; hasta 6 personas y dos dormitorios; tres apartamentos cerca entre sí; llegada autónoma, factura y contrato; respuesta en menos de 2 horas, de 9:00 a 22:00. Sin precios.
