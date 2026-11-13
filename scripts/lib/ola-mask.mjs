// Máscaras SVG de la marca de tarjeta "Horizonte" (ver CLAUDE.md, "Marca de tarjeta").
// La máscara da la forma (líneas de oleaje) y el color lo pone `background: var(--ola-c)`.
// styles.css lleva las tres variantes ya generadas: si cambias esto, regenera con
// `node scripts/lib/ola-mask.mjs` y pega la salida en el bloque HORIZONTE de styles.css.

function rng(a) {
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const uri = svg => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/'/g, '%27')}")`;

// Cuatro líneas de oleaje por el borde superior, que se desvanecen hacia la izquierda.
export function horizonte(seed) {
  const r = rng(seed);
  let g = '';
  for (let i = 0; i < 4; i++) {
    const ph = r() * 6;
    let d = '';
    for (let x = 0; x <= 420; x += 5) {
      const y = 9 + i * 8.5 + 2.6 * Math.sin(x * 0.022 + ph + i * 0.7) + 1.3 * Math.sin(x * 0.06 + ph * 2);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    g += `<path d='${d}' stroke='url(#f)' stroke-width='${i === 1 ? 1.4 : 1}' fill='none' stroke-linecap='round' opacity='${[0.95, 0.8, 0.6, 0.4][i]}'/>`;
  }
  return uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 44' preserveAspectRatio='none'><defs><linearGradient id='f' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='420' y2='0'><stop offset='.06' stop-color='#fff' stop-opacity='0'/><stop offset='.72' stop-color='#fff'/></linearGradient></defs>${g}</svg>`);
}

// Dos olas finísimas que encajan en baldosa de 220 px (para el pie de las tarjetas grandes).
export function orilla() {
  const wave = (amp, period, y, ph) => {
    let d = '';
    for (let x = 0; x <= 220; x += 4) d += (x ? 'L' : 'M') + x + ' ' + (y + amp * Math.sin((x / period) * Math.PI * 2 + ph)).toFixed(1);
    return d;
  };
  return uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 40'><path d='${wave(3.2, 220, 24, 0)}' stroke='#fff' stroke-width='1' fill='none' opacity='.5'/><path d='${wave(3.6, 110, 31, 2)}' stroke='#fff' stroke-width='1' fill='none' opacity='.9'/></svg>`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  [7, 19, 31].forEach((s, i) => console.log(`--ola-m${i + 1}: ${horizonte(s)};`));
  console.log(`--ola-orilla: ${orilla()};`);
}
