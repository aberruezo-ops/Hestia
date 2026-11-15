# Vídeo UGC: terraza de Thalassa al atardecer

Pieza vertical de 8 s generada con IA a partir de una foto real de la terraza de Thalassa (IMG_1874). Una persona ficticia, de espaldas, sentada en el sillón con una copa de vino.

- Modelo: Higgsfield `seedance_2_0_mini`, 9:16, 8 s, 8 créditos. Trabajo `d767a9b4-b970-43f4-9056-d823c136373e`.
- Fotograma de partida: recorte 9:16 de la foto (el sillón de primer plano, el pilar y la vista).
- Prompt: estilo UGC de móvil, pulso de cámara natural; mujer de treinta y tantos, pelo ondulado oscuro y camisa de lino crema, de espaldas, levanta la copa de vino tinto, la mueve y bebe; el cielo pasa de naranja a morado y rojo; se conservan terraza, muebles, cojines, barandilla, planta y vista.
- Audio: lo genera el modelo (-24 LUFS, pico -12 dBFS); no se ha oído.

## Para publicar
- La persona no existe: es contenido generado con IA. Meta puede exigir la etiqueta «generado con IA». No presentarlo como una huésped ni como reseña real.
- Salida en `renders/` (ignorada por git).

## Versión de 15 s (copa en primer plano, plano que se aleja, atardecer a noche, logo)
- Parte A (0 a 7,04 s): la escena 2 original (empuje hasta la copa) montada del revés con ffmpeg (`reverse`/`areverse`). Empieza con la copa en primer plano contra el sol y se aleja hasta mostrar a la mujer de espaldas (`assets/video/escenaA.mp4`).
- Parte C (7,04 a 15,04 s): Higgsfield `seedance_2_0_mini`, 9:16, 8 s, 8 créditos, trabajo `1898e5e3-6a71-4a52-85fb-559d7afd5ab2`. Parte del último fotograma de A para que no haya salto; time-lapse del cielo de morado y rojo a azul profundo y noche con estrellas, con la mujer mirando el horizonte (`assets/video/escenaC.mp4`).
- Montaje con HyperFrames (`index.html`): A, C y el logo blanco de Hestía abajo a la derecha (150 px, a 44 px del borde derecho y 120 px del inferior), con aparición suave. Render a 1080x1920 y recodificado para Instagram (crf 19), audio a -16,9 LUFS.
- Audio: el generado por el modelo; no se ha oído.
- El logo queda en la zona donde Instagram dibuja los botones de la derecha y el texto del pie; si se tapa, subirlo o llevarlo a la izquierda.
- Costes en créditos de esta versión: 8 (C). La escena 2 de la versión anterior (7) ya estaba generada.
