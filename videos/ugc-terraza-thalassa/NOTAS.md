# Vídeo UGC: terraza de Thalassa al atardecer

Pieza vertical de 8 s generada con IA a partir de una foto real de la terraza de Thalassa (IMG_1874). Una persona ficticia, de espaldas, sentada en el sillón con una copa de vino.

- Modelo: Higgsfield `seedance_2_0_mini`, 9:16, 8 s, 8 créditos. Trabajo `d767a9b4-b970-43f4-9056-d823c136373e`.
- Fotograma de partida: recorte 9:16 de la foto (el sillón de primer plano, el pilar y la vista).
- Prompt: estilo UGC de móvil, pulso de cámara natural; mujer de treinta y tantos, pelo ondulado oscuro y camisa de lino crema, de espaldas, levanta la copa de vino tinto, la mueve y bebe; el cielo pasa de naranja a morado y rojo; se conservan terraza, muebles, cojines, barandilla, planta y vista.
- Audio: lo genera el modelo (-24 LUFS, pico -12 dBFS); no se ha oído.

## Para publicar
- La persona no existe: es contenido generado con IA. Meta puede exigir la etiqueta «generado con IA». No presentarlo como una huésped ni como reseña real.
- Salida en `renders/` (ignorada por git).

## Versión de 15 s (escena 1 + copa en primer plano + logo)
- Escena 2: Higgsfield `seedance_2_0_mini`, 9:16, 7 s, 7 créditos, trabajo `19e49301-27fa-437b-bb0a-c25fa8383966`. Parte del fotograma de los 2,0 s de la escena 1 (copa levantada) y hace un empuje hasta un primer plano de la copa.
- Montaje con HyperFrames (`index.html`): escena 1 (8,04 s), corte con fundido de audio de 0,25 s y escena 2 (7 s). Logo blanco de Hestía abajo a la derecha (150 px, a 44 px del borde derecho y 120 px del inferior), con aparición suave.
- Audio: el generado por el modelo, normalizado a -16 LUFS; no se ha oído.
- El logo queda en la zona donde Instagram dibuja los botones de la derecha y el texto del pie; si se tapa, subirlo o llevarlo a la izquierda.
- Costes en créditos: 8 + 7 = 15.
