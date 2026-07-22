#!/usr/bin/env node
/**
 * scripts/refresh-ratings.mjs
 *
 * Actualiza el campo `rating` de cada PLACE de apartment-guide.jsx
 * con la valoración en vivo de Google Maps. Solo procesa categorías
 * restaurant / bar / celiac (las playas/lugares culturales ya llevan
 * su rating fijado a mano cuando aplica).
 *
 * Uso:
 *   node scripts/refresh-ratings.mjs              (todos)
 *   node scripts/refresh-ratings.mjs --only=magoga,la-mala  (solo IDs)
 *   node scripts/refresh-ratings.mjs --dry-run    (sin escribir, sí scrapea)
 *   node scripts/refresh-ratings.mjs --list       (solo imprime qué procesaría, sin red)
 *   node scripts/refresh-ratings.mjs --headed     (ver el navegador)
 *
 * Requisitos:
 *   - Conexión libre a google.com (no funciona en sandboxes con allowlist)
 *   - Playwright + Chromium ya instalados (ya están en el proyecto)
 *
 * Estrategia:
 *   1. Parse PLACES con regex (extrae id, name, lat, lng, rating, cat).
 *   2. Para cada entrada elegible, abre Google Maps con la query
 *      "<name> @lat,lng,17z" y espera el primer resultado.
 *   3. Extrae rating del aria-label "X,X estrellas" o "X.X stars".
 *   4. Aplica las actualizaciones al .jsx (solo cambia el número, no
 *      reordena ni toca otros campos). Crea backup .bak.
 *
 * Throttle: 2.5-4s random entre queries. ~4 min para 66 sitios.
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const FILE = path.join(ROOT, 'docs/components/apartment-guide.jsx');

const ARGS = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));
const ONLY = typeof ARGS.only === 'string' ? new Set(ARGS.only.split(',')) : null;
const DRY  = !!ARGS['dry-run'];
const LIST = !!ARGS.list;
const HEADED = !!ARGS.headed;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jitter = (min, max) => Math.floor(min + Math.random() * (max - min));

// --- Parseo de PLACES -----------------------------------------------------
async function parsePlaces() {
  const src = await fs.readFile(FILE, 'utf8');
  const placesMatch = src.match(/const PLACES = \[([\s\S]*?)^\];/m);
  if (!placesMatch) throw new Error('No encuentro const PLACES = [...]');
  const block = placesMatch[1];

  const lines = block.split('\n');
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/\{\s*id:\s*'([^']+)'/);
    if (!m) continue;
    const id = m[1];
    // Captura "..." o '...' respetando el otro tipo de comilla en el contenido
    const nameM = line.match(/name:\s*"([^"]+)"/) ||
                  line.match(/name:\s*'([^']+)'/) ||
                  line.match(/name:\s*`([^`]+)`/);
    const catM  = line.match(/cat:\s*'([^']+)'/);
    const latM  = line.match(/lat:\s*([-\d.]+)/);
    const lngM  = line.match(/lng:\s*([-\d.]+)/);
    const ratM  = line.match(/rating:\s*([\d.]+)/);
    if (!nameM || !catM || !latM || !lngM) continue;

    items.push({
      id,
      name: nameM[1],
      cat: catM[1],
      lat: parseFloat(latM[1]),
      lng: parseFloat(lngM[1]),
      currentRating: ratM ? parseFloat(ratM[1]) : null,
      lineIndex: i,         // posición relativa dentro del bloque
      lineText: line,
    });
  }
  return { src, items };
}

// --- Extracción del rating en Google Maps --------------------------------
function parseRatingFromText(text) {
  // Acepta "4,7" (es), "4.7" (en), "4,7 estrellas", "4.7 stars"
  if (!text) return null;
  const m = text.match(/(\d[.,]\d)\s*(estrellas?|stars?)/i)
         || text.match(/^(\d[.,]\d)$/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  if (!isFinite(n) || n < 1 || n > 5) return null;
  return n;
}

async function fetchRating(page, place) {
  // Construimos query muy específica: nombre + coords muy cerca,
  // así el primer resultado es siempre el sitio real.
  const q = encodeURIComponent(place.name);
  const url = `https://www.google.com/maps/search/${q}/@${place.lat},${place.lng},17z?hl=es`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // Aceptar consentimiento si aparece
    try {
      const consent = page.locator('button:has-text("Aceptar todo"), button:has-text("Accept all"), button[aria-label*="Aceptar"]').first();
      if (await consent.isVisible({ timeout: 2000 })) {
        await consent.click();
        await sleep(800);
      }
    } catch {}

    await sleep(2000); // dejar renderizar resultados

    // Estrategia 1: aria-label "X,X estrellas" en role=img
    const r1 = await page.evaluate(() => {
      const nodes = document.querySelectorAll('[role="img"][aria-label*="estrellas"], [role="img"][aria-label*="stars"]');
      for (const n of nodes) {
        const lbl = n.getAttribute('aria-label') || '';
        const m = lbl.match(/(\d[.,]\d)\s*(estrellas?|stars?)/i);
        if (m) return parseFloat(m[1].replace(',', '.'));
      }
      return null;
    });
    if (r1) return r1;

    // Estrategia 2: span con clase MW4etd (clase interna actual de Google)
    const r2 = await page.evaluate(() => {
      const el = document.querySelector('.MW4etd, [class*="MW4etd"]');
      if (!el) return null;
      const m = el.textContent.match(/(\d[.,]\d)/);
      return m ? parseFloat(m[1].replace(',', '.')) : null;
    });
    if (r2) return r2;

    // Estrategia 3: fallback agresivo — primer número X,X en el panel
    const r3 = await page.evaluate(() => {
      const panel = document.querySelector('[role="feed"], [role="main"]');
      if (!panel) return null;
      const text = panel.textContent.slice(0, 3000);
      const m = text.match(/(\d[.,]\d)\s*\(/); // "4,7 (123 reseñas)"
      return m ? parseFloat(m[1].replace(',', '.')) : null;
    });
    return r3;
  } catch (e) {
    return null;
  }
}

// --- Aplicar updates al .jsx --------------------------------------------
async function applyUpdates(src, updates) {
  let out = src;
  for (const u of updates) {
    if (u.oldRating === u.newRating) continue;
    const idEsc = u.id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Buscamos la línea concreta de ese id
    const lineRe = new RegExp(`(\\{[^\\n]*id:\\s*'${idEsc}'[^\\n]*\\})`, 'm');
    const m = out.match(lineRe);
    if (!m) {
      console.warn(`  ⚠️  ${u.id}: no encontré la línea para actualizar`);
      continue;
    }
    let line = m[1];
    if (/rating:\s*[\d.]+/.test(line)) {
      // sustituir rating existente
      line = line.replace(/rating:\s*[\d.]+/, `rating: ${u.newRating}`);
    } else {
      // insertar rating después de cat: '...'
      line = line.replace(/(cat:\s*'[^']+',?)/, (full) => `${full} rating: ${u.newRating},`);
    }
    out = out.replace(m[1], line);
  }
  return out;
}

// --- Main ---------------------------------------------------------------
(async () => {
  const { src, items } = await parsePlaces();
  const eligible = items.filter(p => ['restaurant', 'bar', 'celiac'].includes(p.cat))
                         .filter(p => !ONLY || ONLY.has(p.id));
  console.log(`📍 ${eligible.length} sitios a procesar (de ${items.length} totales)`);

  if (LIST) {
    for (const p of eligible) {
      console.log(`  ${p.id.padEnd(22)} ${p.cat.padEnd(11)} ${(p.currentRating ?? '—').toString().padStart(3)} ★  ${p.name}`);
    }
    return;
  }

  if (DRY) console.log('🧪 DRY-RUN: no se escribirá el archivo');

  const browser = await chromium.launch({
    headless: !HEADED,
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--lang=es-ES', '--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    locale: 'es-ES',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();

  const updates = [];
  const skipped = [];
  let i = 0;
  for (const p of eligible) {
    i++;
    const prefix = `[${i}/${eligible.length}] ${p.id.padEnd(20)}`;
    const rating = await fetchRating(page, p);
    if (rating == null) {
      console.log(`${prefix} ❌  no se pudo extraer rating (${p.currentRating ?? '—'} se mantiene)`);
      skipped.push(p);
    } else {
      const arrow = (p.currentRating == null) ? '➕' :
                    (rating > p.currentRating)  ? '⬆️ ' :
                    (rating < p.currentRating)  ? '⬇️ ' : '✓';
      console.log(`${prefix} ${arrow} ${p.currentRating ?? '—'} → ${rating}`);
      updates.push({ id: p.id, oldRating: p.currentRating, newRating: rating });
    }
    await sleep(jitter(2500, 4000));
  }

  await browser.close();

  console.log(`\n📊 Resumen: ${updates.length} ratings actualizados · ${skipped.length} no se pudieron obtener`);

  if (DRY || updates.length === 0) {
    console.log('✋ Sin cambios al disco.');
    return;
  }

  await fs.writeFile(FILE + '.bak', src);
  const out = await applyUpdates(src, updates);
  await fs.writeFile(FILE, out);
  console.log(`✅ Escrito ${FILE} (backup en ${FILE}.bak)`);
})();
