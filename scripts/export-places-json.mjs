/**
 * Extrae el array PLACES de apartment-guide.jsx y lo guarda en
 * docs/data/places.json para que fix-pins.html lo consuma.
 *
 * Uso: node scripts/export-places-json.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__dir, '..');
const SRC    = join(ROOT, 'docs/components/apartment-guide.jsx');
const OUT    = join(ROOT, 'docs/data/places.json');

const src = readFileSync(SRC, 'utf8');

// Extrae el bloque PLACES con regex ligera — no se necesita eval
const entryRe = /\{[^{}]*?id\s*:\s*'([^']+)'[^{}]*?name\s*:\s*'([^']+)'[^{}]*?cat\s*:\s*'([^']+)'[^{}]*?lat\s*:\s*([\d.-]+)[^{}]*?lng\s*:\s*([\d.-]+)[^{}]*?\}/gs;

const places = [];
for (const m of src.matchAll(entryRe)) {
  places.push({ id: m[1], name: m[2], cat: m[3], lat: parseFloat(m[4]), lng: parseFloat(m[5]) });
}

writeFileSync(OUT, JSON.stringify(places, null, 2), 'utf8');
console.log(`✓ ${places.length} lugares exportados → ${OUT}`);
