#!/usr/bin/env node
/**
 * scripts/scrape-photos.mjs
 *
 * Descarga todas las fotos de los 3 Hestía desde www.hestiayourhome.com
 * usando Playwright (necesario para sitios con JS / lazy-load).
 *
 * Uso:
 *   npm install playwright
 *   npx playwright install chromium
 *   node scripts/scrape-photos.mjs
 *
 * Output:
 *   docs/assets/scraped/vm/{1..N}.jpg
 *   docs/assets/scraped/vt/{1..N}.jpg
 *   docs/assets/scraped/vs/{1..N}.jpg
 *
 * Si quieres ver lo que hace en vivo, cambia HEADLESS = false abajo.
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');

const BASE_URL = 'https://www.hestiayourhome.com';
const OUT_DIR  = path.join(ROOT, 'docs/assets/scraped');
const HEADLESS = true;            // false para ver el navegador
const MIN_SIZE = 50 * 1024;       // mínimo 50KB para descartar iconos/logos
const SCROLL_PAUSE = 600;          // ms entre scrolls para lazy-load

// Posibles rutas de cada Hestía (probamos varias hasta encontrar)
const APT_HINTS = {
  vm: ['mar', 'hestia-mar', 'hestia-vera-mar', 'vera-mar'],
  vt: ['thalassa', 'hestia-thalassa', 'hestia-vera-thalassa', 'vera-thalassa'],
  vs: ['salinas', 'hestia-salinas', 'hestia-vera-salinas', 'vera-salinas'],
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
async function ensureDir(d) {
  if (!existsSync(d)) await fs.mkdir(d, { recursive: true });
}

async function downloadImage(page, url, outPath) {
  try {
    const response = await page.context().request.get(url);
    if (!response.ok()) return { ok: false, reason: `HTTP ${response.status()}` };
    const buf = await response.body();
    if (buf.length < MIN_SIZE) return { ok: false, reason: `${(buf.length/1024).toFixed(0)}KB < ${MIN_SIZE/1024}KB` };
    await fs.writeFile(outPath, buf);
    return { ok: true, size: buf.length };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// Auto-scroll para forzar lazy-load
async function autoScroll(page) {
  await page.evaluate(async (pause) => {
    await new Promise((resolve) => {
      let total = 0;
      const distance = 600;
      const timer = setInterval(() => {
        const h = document.body.scrollHeight;
        window.scrollBy(0, distance);
        total += distance;
        if (total >= h + 1000) {
          clearInterval(timer);
          resolve();
        }
      }, pause);
    });
  }, SCROLL_PAUSE);
}

// Recolecta TODAS las URLs de imágenes en una página (incluyendo
// srcset, lazy-load placeholders y background-image en estilos inline).
async function collectImageUrls(page) {
  const urls = await page.evaluate(() => {
    const out = new Set();
    // <img> con src y srcset
    document.querySelectorAll('img').forEach(img => {
      if (img.src && !img.src.startsWith('data:')) out.add(img.src);
      if (img.dataset.src) out.add(img.dataset.src);
      if (img.dataset.lazySrc) out.add(img.dataset.lazySrc);
      if (img.srcset) {
        img.srcset.split(',').forEach(s => {
          const u = s.trim().split(' ')[0];
          if (u) out.add(u);
        });
      }
    });
    // <source> dentro de <picture>
    document.querySelectorAll('source').forEach(s => {
      if (s.srcset) {
        s.srcset.split(',').forEach(ss => {
          const u = ss.trim().split(' ')[0];
          if (u) out.add(u);
        });
      }
    });
    // background-image en estilos inline
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
      const m = el.style.backgroundImage.match(/url\(['"]?([^'")]+)/);
      if (m) out.add(m[1]);
    });
    return Array.from(out);
  });
  // Resolver URLs relativas
  return urls.map(u => {
    try { return new URL(u, page.url()).toString(); }
    catch { return null; }
  }).filter(Boolean);
}

// Encuentra los enlaces a las 3 Hestías en la home
async function findAptUrls(page) {
  return await page.evaluate((hints) => {
    const found = {};
    const links = Array.from(document.querySelectorAll('a[href]'));
    for (const [apt, candidates] of Object.entries(hints)) {
      for (const link of links) {
        const href = link.getAttribute('href').toLowerCase();
        const text = (link.textContent || '').toLowerCase();
        const hit = candidates.some(c => href.includes(c) || text.includes(c));
        if (hit) { found[apt] = link.href; break; }
      }
    }
    return found;
  }, APT_HINTS);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  await ensureDir(OUT_DIR);
  for (const apt of Object.keys(APT_HINTS)) await ensureDir(path.join(OUT_DIR, apt));

  console.log(`→ Abriendo navegador (headless=${HEADLESS})…`);
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log(`→ Cargando ${BASE_URL}…`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });

  console.log(`→ Buscando enlaces a los Hestías…`);
  const aptUrls = await findAptUrls(page);
  console.log(`  Encontrados:`, aptUrls);

  if (Object.keys(aptUrls).length === 0) {
    console.log(`\n⚠️  No se encontraron enlaces a las Hestías por nombre. Voy a recolectar imágenes de la home y luego puedes ajustar los selectores.`);
    aptUrls.vm = BASE_URL;
  }

  const allDownloaded = { vm: 0, vt: 0, vs: 0 };

  for (const [apt, url] of Object.entries(aptUrls)) {
    console.log(`\n→ ${apt.toUpperCase()}: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    console.log(`  Scroll para activar lazy-load…`);
    await autoScroll(page);
    await page.waitForTimeout(2000);

    const urls = await collectImageUrls(page);
    console.log(`  ${urls.length} URLs candidatas encontradas`);

    // Filtra duplicados (mismo path sin query)
    const seen = new Set();
    const unique = urls.filter(u => {
      const key = u.split('?')[0];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`  ${unique.length} URLs únicas`);

    let i = 0;
    for (const imgUrl of unique) {
      // Saltar SVGs, gifs, iconos pequeños obvios
      if (/\.(svg|gif|ico)(\?|$)/i.test(imgUrl)) continue;
      if (/logo|icon|favicon|sprite|avatar/i.test(imgUrl)) continue;
      i++;
      const ext = (imgUrl.match(/\.(jpe?g|png|webp)(\?|$)/i) || [null,'jpg'])[1].replace(/^jpeg$/i,'jpg');
      const outPath = path.join(OUT_DIR, apt, `${String(i).padStart(3,'0')}.${ext.toLowerCase()}`);
      process.stdout.write(`  [${apt}] ${i}/${unique.length} ${path.basename(imgUrl).slice(0,60)}… `);
      const res = await downloadImage(page, imgUrl, outPath);
      if (res.ok) {
        allDownloaded[apt]++;
        process.stdout.write(`✓ ${(res.size/1024).toFixed(0)}KB\n`);
      } else {
        process.stdout.write(`✗ ${res.reason}\n`);
        // Borrar el archivo placeholder si se llegó a crear
        try { await fs.unlink(outPath); } catch (_) {}
      }
    }
  }

  console.log(`\n✓ Hecho.`);
  console.log(`  vm: ${allDownloaded.vm} fotos en ${path.relative(ROOT, path.join(OUT_DIR, 'vm'))}`);
  console.log(`  vt: ${allDownloaded.vt} fotos en ${path.relative(ROOT, path.join(OUT_DIR, 'vt'))}`);
  console.log(`  vs: ${allDownloaded.vs} fotos en ${path.relative(ROOT, path.join(OUT_DIR, 'vs'))}`);

  await browser.close();
}

main().catch(e => {
  console.error('\n✗ Error:', e);
  process.exit(1);
});
