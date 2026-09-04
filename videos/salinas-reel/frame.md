---
name: Hestía Your Home · Salinas
source: docs/assets/styles.css, docs/pago.html, CLAUDE.md (verdad de marca del repo)
colors:
  berenjena: "#2A0F2E"
  berenjena-dk: "#1A0820"
  berenjena-lt: "#3D1540"
  ink: "#3D1A35"
  ink-soft: "#7A5A72"
  crema: "#FFFCF6"
  arena: "#F0E8D5"
  cobre: "#C87A45"
  cobre-dk: "#A85E2E"
  salinas: "#D4A84A"
  salinas-dk: "#7A5E1A"
  salinas-lt: "#E8C476"
typography:
  display: "Fraunces"
  display-weights: [500, 600]
  body: "Hanken Grotesk"
  body-weights: [400, 600, 700]
  files: assets/fonts/*.ttf (embebidas, sin red en el render)
corners: "10px 0 10px 0 (asimétrico: esquinas opuestas). Variante grande 24px 0 24px 0. Nunca 50% salvo puntos y avatares."
depth: "plano: sin sombras de web; un solo halo cobre o dorado a ≤ 0.35 de opacidad cuando el foco lo pide"
spacing: "vídeo vertical 1080x1920: paddings 48-64 px, márgenes seguros de Instagram (arriba 220 px, abajo 380 px, derecha 120 px)"
---

## Overview

Marca autoral, cálida, de personas (Alex y Fran), no de agencia. La berenjena es el suelo; la crema es el papel; el cobre es el acento de la marca; **cada Hestía lleva su color siempre que se le nombra**: Salinas es dorado (`#D4A84A`, oscuro `#7A5E1A` sobre claro).

## The Frame

Fondo de escenario siempre opaco en berenjena. Fotos reales a sangre con movimiento lento. Texto sobre superficies propias (tarjeta crema para la carta, panel berenjena para el cierre), nunca directamente sobre foto salvo un chip pequeño con fondo.

## Composition Rules

- Display en Fraunces 500/600 para la voz de los anfitriones; Hanken Grotesk para etiquetas y datos, mayúsculas con tracking 0.14em en tamaños pequeños.
- Sobre crema: texto en `ink`; sobre berenjena: texto en `crema`/`arena`, nunca `ink`.
- Salinas se nombra en dorado (`salinas-dk` sobre crema, `salinas` sobre berenjena).

## Do

- Puntuación real: coma, dos puntos, punto. Guion corto solo para rangos.
- Hechos del repo (strategy/redes/hechos-y-ventajas.md) y nada más.

## Don't

- Guion largo (em dash) en cualquier texto visible.
- Precios, disponibilidad o promesas que no estén en el archivo de hechos.
- Degradados a pantalla completa sobre fondo oscuro (bandas en H.264).
- Emojis en pantalla.
