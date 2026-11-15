# Vídeo UGC: terraza de Thalassa al atardecer

Pieza vertical de 8 s generada con IA a partir de una foto real de la terraza de Thalassa (IMG_1874). Una persona ficticia, de espaldas, sentada en el sillón con una copa de vino.

- Modelo: Higgsfield `seedance_2_0_mini`, 9:16, 8 s, 8 créditos. Trabajo `d767a9b4-b970-43f4-9056-d823c136373e`.
- Fotograma de partida: recorte 9:16 de la foto (el sillón de primer plano, el pilar y la vista).
- Prompt: estilo UGC de móvil, pulso de cámara natural; mujer de treinta y tantos, pelo ondulado oscuro y camisa de lino crema, de espaldas, levanta la copa de vino tinto, la mueve y bebe; el cielo pasa de naranja a morado y rojo; se conservan terraza, muebles, cojines, barandilla, planta y vista.
- Audio: lo genera el modelo (-24 LUFS, pico -12 dBFS); no se ha oído.

## Para publicar
- La persona no existe: es contenido generado con IA. Meta puede exigir la etiqueta «generado con IA». No presentarlo como una huésped ni como reseña real.
- Salida en `renders/` (ignorada por git).

## Versión de 15 s en un solo plano (sin cortes)
- Un único clip de Higgsfield `seedance_2_0_mini`, 9:16, 15 s, 720p, 15 créditos, trabajo `44708207-05a5-4968-9f67-a4b37e05dc3d` (`assets/video/ugc15.mp4`). Los montajes anteriores con dos partes (escena 1 + 2, y A + C) se descartaron: el corte se notaba.
- Entradas: `start_image` con la copa en primer plano contra el sol (`assets/images/start-copa.jpg`) e `image_references` con la mujer y la terraza (`assets/images/ref-mujer.jpg`), ambas fotogramas de generaciones anteriores.
- Prompt: plano continuo con pulso de móvil muy suave; empieza en primer plano de la copa, la cámara se aleja y descubre a la mujer de espaldas, que se acomoda en el sillón, bebe un sorbo y se queda mirando el horizonte; el cielo pasa de atardecer rojo y morado a violeta, azul profundo y noche con estrellas, se encienden las luces del pueblo y la lámpara.
- Montaje con HyperFrames (`index.html`): el clip y el logo blanco de Hestía abajo a la derecha (150 px, a 44 px del borde derecho y 120 px del inferior), con aparición suave. Render 1080x1920 y recodificado para Instagram (crf 19), audio a -16 LUFS.
- La persona no existe: es contenido generado con IA. Meta puede exigir la etiqueta «generado con IA». No presentarlo como huésped ni como reseña real.
- Audio: el generado por el modelo; no se ha oído.
- El logo queda en la zona donde Instagram dibuja los botones de la derecha y el texto del pie; si se tapa, subirlo o llevarlo a la izquierda.
