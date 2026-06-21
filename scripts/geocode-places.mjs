/**
 * Geocodifica los lugares de apartment-guide.jsx via Nominatim (OSM).
 * Lee las entradas de PLACES, construye queries por nombre+zona y
 * actualiza las coordenadas cuando la confianza es alta.
 *
 * Uso:
 *   node scripts/geocode-places.mjs [--dry-run] [--min-score=0.6]
 *
 * Flags:
 *   --dry-run     Solo imprime las sugerencias, no modifica el .jsx
 *   --min-score   Umbral mínimo de confianza (0-1) para aplicar el cambio
 *
 * Nominatim tiene rate limit de 1 req/s. El script respeta eso.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__dir, '..');
const TARGET = join(ROOT, 'docs/components/apartment-guide.jsx');

const DRY_RUN   = process.argv.includes('--dry-run');
const MIN_SCORE = parseFloat(process.argv.find(a => a.startsWith('--min-score='))?.split('=')[1] ?? '0.55');

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const HEADERS   = { 'User-Agent': 'hestia-geocoder/1.0 (admin@hestiayourhome.com)' };

// Zonas conocidas para afinar las búsquedas (nombre Nominatim → bbox)
// Se elige la zona más cercana al contexto del lugar
const ZONE_CONTEXTS = {
  'vera playa':   'Vera Playa, Almería, España',
  'vera':         'Vera, Almería, España',
  'garrucha':     'Garrucha, Almería, España',
  'mojácar':      'Mojácar, Almería, España',
  'mojacar':      'Mojácar, Almería, España',
  'almería':      'Almería, España',
  'cartagena':    'Cartagena, Murcia, España',
  'águilas':      'Águilas, Murcia, España',
  'lorca':        'Lorca, Murcia, España',
  'murcia':       'Murcia, España',
  'san josé':     'San José, Cabo de Gata, Almería, España',
  'rodalquilar':  'Rodalquilar, Almería, España',
  'villaricos':   'Villaricos, Almería, España',
  'huércal':      'Huércal-Overa, Almería, España',
};

// Estas entradas no deben tocarse (coords verificadas manualmente)
const SKIP_IDS = new Set([
  'hestia-mar', 'hestia-thalassa', 'hestia-salinas',
]);

// Expresión que extrae el bloque PLACES del .jsx
const PLACES_RE = /const PLACES\s*=\s*\[[\s\S]*?\];/;

// Extrae los objetos de PLACES como texto para preservar el formato
function extractPlaceEntries(src) {
  const match = src.match(PLACES_RE);
  if (!match) throw new Error('No se encontró PLACES en el .jsx');
  return match[0];
}

// Parsea las entradas de lugar de forma ligera (regex, no eval)
function parsePlaces(src) {
  const block = extractPlaceEntries(src);
  const rows = [];
  // Captura id, name, (optional desc), lat, lng
  const entryRe = /\{[^{}]*?id\s*:\s*'([^']+)'[^{}]*?name\s*:\s*'([^']+)'[^{}]*?lat\s*:\s*([\d.-]+)[^{}]*?lng\s*:\s*([\d.-]+)[^{}]*?\}/gs;
  for (const m of block.matchAll(entryRe)) {
    rows.push({ id: m[1], name: m[2], lat: parseFloat(m[3]), lng: parseFloat(m[4]) });
  }
  return rows;
}

// Infiere la zona de búsqueda a partir del nombre del lugar
function inferZone(name) {
  const lower = name.toLowerCase();
  for (const [key, ctx] of Object.entries(ZONE_CONTEXTS)) {
    if (lower.includes(key)) return ctx;
  }
  return 'Almería, España'; // fallback
}

// Nombre de búsqueda limpio (quita parentéticos como "(Vera Playa)")
function cleanName(name) {
  return name
    .replace(/\s*\(.*?\)/g, '')   // elimina (Vera Playa), (Garrucha), etc.
    .replace(/\s+/g, ' ')
    .trim();
}

// Distancia haversine en km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Calcula puntuación de confianza:
//  - Si la distancia al punto actual es < 200m → la actual ya es buena
//  - Si el resultado de Nominatim está muy lejos (>50km) → desconfianza
//  - importance de Nominatim (0-1) pondera la confianza
function score(result, currentLat, currentLng) {
  const rLat = parseFloat(result.lat);
  const rLng = parseFloat(result.lon);
  const dist = haversine(currentLat, currentLng, rLat, rLng);
  if (dist < 0.2) return { score: 1, skip: true, dist };  // ya está bien
  const imp = parseFloat(result.importance ?? 0.5);
  // Penaliza resultados muy lejanos (>30km)
  const distPenalty = dist > 30 ? 0.3 : dist > 10 ? 0.6 : 1;
  return { score: imp * distPenalty, skip: false, dist };
}

async function geocode(name, zone) {
  const q = `${name}, ${zone}`;
  const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  const data = await res.json();
  return data[0] ?? null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const src = readFileSync(TARGET, 'utf8');
  const places = parsePlaces(src);

  console.log(`Geocodificando ${places.length} lugares (min-score=${MIN_SCORE})…\n`);

  const updates = [];
  const skipped = [];
  const unchanged = [];
  const failed = [];

  for (const p of places) {
    if (SKIP_IDS.has(p.id)) continue;

    const zone   = inferZone(p.name);
    const qname  = cleanName(p.name);
    await sleep(1100); // respetar rate limit Nominatim (1 req/s)

    let result;
    try {
      result = await geocode(qname, zone);
    } catch (e) {
      failed.push({ id: p.id, name: p.name, reason: e.message });
      continue;
    }

    if (!result) {
      failed.push({ id: p.id, name: p.name, reason: 'sin resultado' });
      continue;
    }

    const { score: sc, skip, dist } = score(result, p.lat, p.lng);

    if (skip) {
      unchanged.push({ id: p.id, name: p.name, dist: dist.toFixed(0) + 'm' });
      continue;
    }

    if (sc >= MIN_SCORE) {
      updates.push({
        id: p.id, name: p.name,
        oldLat: p.lat, oldLng: p.lng,
        newLat: parseFloat(parseFloat(result.lat).toFixed(5)),
        newLng: parseFloat(parseFloat(result.lon).toFixed(5)),
        dist: dist.toFixed(1) + 'km', score: sc.toFixed(2),
        displayName: result.display_name,
      });
    } else {
      skipped.push({ id: p.id, name: p.name, dist: dist.toFixed(1) + 'km', score: sc.toFixed(2) });
    }
  }

  // ── Informe ──────────────────────────────────────────────────────────────
  console.log(`\n✔ Coordenadas ya correctas: ${unchanged.length}`);
  console.log(`↑ Actualizaciones propuestas: ${updates.length}`);
  console.log(`✗ Sin resultado suficiente:   ${skipped.length}`);
  console.log(`! Errores de consulta:        ${failed.length}\n`);

  if (updates.length) {
    console.log('── Actualizaciones ─────────────────────────────────────────');
    for (const u of updates) {
      console.log(`  [${u.id}] ${u.name}`);
      console.log(`    (${u.oldLat}, ${u.oldLng}) → (${u.newLat}, ${u.newLng})  dist=${u.dist}  score=${u.score}`);
    }
  }

  if (skipped.length) {
    console.log('\n── Baja confianza (no aplicados) ───────────────────────────');
    for (const s of skipped) {
      console.log(`  [${s.id}] ${s.name}  dist=${s.dist}  score=${s.score}`);
    }
  }

  if (failed.length) {
    console.log('\n── Sin resultado ────────────────────────────────────────────');
    for (const f of failed) console.log(`  [${f.id}] ${f.name}: ${f.reason}`);
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] No se modifica el .jsx.');
    return;
  }

  if (!updates.length) {
    console.log('\nNada que actualizar.');
    return;
  }

  // ── Aplicar actualizaciones al .jsx ───────────────────────────────────
  let newSrc = src;
  for (const u of updates) {
    // Reemplaza lat y lng en la línea que contiene el id
    const lineRe = new RegExp(
      `(id\\s*:\\s*'${u.id}'[^\\n]*?lat\\s*:\\s*)([\\d.-]+)([^\\n]*?lng\\s*:\\s*)([\\d.-]+)`,
      'g',
    );
    newSrc = newSrc.replace(lineRe, (_, pre, _lat, mid, _lng) =>
      `${pre}${u.newLat}${mid}${u.newLng}`
    );
  }

  writeFileSync(TARGET, newSrc, 'utf8');
  console.log(`\n✓ ${updates.length} coordenadas actualizadas en ${TARGET}`);
  console.log('  Recuerda compilar: node scripts/build-jsx.js');
}

main().catch(err => { console.error(err); process.exit(1); });
