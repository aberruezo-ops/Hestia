// sync-rating.mjs
//
// Recalcula el aggregateRating (ratingValue + reviewCount) del JSON-LD a partir
// de docs/data/reviews.json y lo escribe en las páginas. Normaliza las escalas a
// /10: Booking ya viene en /10; Airbnb, Google y "web" vienen en /5 y se
// multiplican por 2. Así la valoración estructurada es coherente con las reseñas
// reales y no se desfasa cada vez que se publican nuevas.
//
// Uso:  node scripts/sync-rating.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const REVIEWS = 'docs/data/reviews.json';
const TEN_SCALE = new Set(['booking']);   // fuentes que ya puntúan sobre 10

// Página -> apartamento (null = total del sitio).
const PAGES = {
  'docs/index.html':    null,
  'docs/mar.html':      'vm',
  'docs/thalassa.html': 'vt',
  'docs/salinas.html':  'vs',
};

const raw = JSON.parse(readFileSync(REVIEWS, 'utf8'));
const items = (raw.items || raw).filter(r => r.status === 'published' && typeof r.rating === 'number');
const norm = r => (TEN_SCALE.has(r.source) ? r.rating : r.rating * 2);

function agg(list) {
  if (!list.length) return null;
  const sum = list.reduce((a, r) => a + norm(r), 0);
  return { value: (sum / list.length).toFixed(2), count: list.length };
}

let changed = 0;
for (const [file, apt] of Object.entries(PAGES)) {
  const list = apt ? items.filter(r => r.apt === apt) : items;
  const a = agg(list);
  if (!a) { console.log(`${file}: sin reseñas, omitido`); continue; }
  let html = readFileSync(file, 'utf8');
  const before = html;
  html = html
    .replace(/("ratingValue":\s*")[0-9.]+(")/, `$1${a.value}$2`)
    .replace(/("reviewCount":\s*")[0-9]+(")/, `$1${a.count}$2`);
  if (html !== before) { writeFileSync(file, html); changed++; console.log(`${file}: ${a.value} / ${a.count} ✓`); }
  else console.log(`${file}: sin cambios (${a.value} / ${a.count})`);
}
console.log(`\n${changed} página(s) actualizada(s).`);
