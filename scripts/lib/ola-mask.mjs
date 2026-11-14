// Máscaras SVG de la marca de tarjeta "Horizonte" (ver .claude/skills/hestia/references/reglas-visuales.md, "Marca de tarjeta").
// La máscara da la forma (líneas de oleaje) y el color lo pone `background: var(--ola-c)`.
// El patrón encaja consigo mismo en 420 px (cada onda tiene un número entero de periodos),
// así que se puede desplazar en bucle sin costura: al pasar el ratón las olas fluyen.
// styles.css lleva las variantes ya generadas: si cambias esto, regenera con
// `node scripts/lib/ola-mask.mjs` y pega la salida en el bloque HORIZONTE de styles.css.

function rng(a) {
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const uri = svg => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/'/g, '%27')}")`;
const TAU = Math.PI * 2;

// Una línea nítida de oleaje y dos de eco casi fantasma por el borde superior, en baldosa de 420 x 44.
export function horizonte(seed) {
  const r = rng(seed);
  const K1 = [2, 3, 2], K2 = [5, 6, 7];
  const OP = [0.9, 0.28, 0.16], SW = [1.2, 0.9, 0.9];
  let g = '';
  for (let i = 0; i < 3; i++) {
    const ph = r() * TAU, ph2 = r() * TAU;
    let d = '';
    for (let x = 0; x <= 420; x += 5) {
      const y = 9 + i * 8.5 + 2.6 * Math.sin(TAU * K1[i] * x / 420 + ph) + 1.3 * Math.sin(TAU * K2[i] * x / 420 + ph2);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    g += `<path d='${d}' stroke='#fff' stroke-width='${SW[i]}' fill='none' stroke-linecap='butt' opacity='${OP[i]}'/>`;
  }
  return uri(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='44' viewBox='0 0 420 44'>${g}</svg>`);
}

// Dos olas finísimas que encajan en baldosa de 220 px (para el pie de las tarjetas grandes).
export function orilla() {
  const wave = (amp, period, y, ph) => {
    let d = '';
    for (let x = 0; x <= 220; x += 4) d += (x ? 'L' : 'M') + x + ' ' + (y + amp * Math.sin((x / period) * TAU + ph)).toFixed(1);
    return d;
  };
  return uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 40'><path d='${wave(3.2, 220, 24, 0)}' stroke='#fff' stroke-width='1' fill='none' opacity='.5'/><path d='${wave(3.6, 110, 31, 2)}' stroke='#fff' stroke-width='1' fill='none' opacity='.9'/></svg>`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  [7, 19, 31].forEach((s, i) => console.log(`--ola-m${i + 1}: ${horizonte(s)};`));
  console.log(`--ola-orilla: ${orilla()};`);
}
