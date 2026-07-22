// scripts/contrast-audit.cjs
// Guardarraíl de contraste: carga cada página pública (móvil + escritorio),
// ejecuta la regla WCAG color-contrast de axe-core y reporta cualquier fallo.
// Uso:  (servir docs/ en :8123)  &&  node scripts/contrast-audit.cjs
// Sale con código 1 si hay fallos (apto para CI / pre-push).
const fs = require('fs');
const path = require('path');
// playwright y axe-core: desde node_modules (CI) o, si no, desde la ruta del entorno local.
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const _axePath = (() => { try { return require.resolve('axe-core/axe.min.js'); } catch { return '/tmp/axe/node_modules/axe-core/axe.min.js'; } })();
const AXE = fs.readFileSync(_axePath, 'utf8');
const BASE = process.env.BASE || 'http://localhost:8123';
const DOCS = path.join(__dirname, '..', 'docs');
const PAGES = (process.env.PAGES ? process.env.PAGES.split(',') :
  fs.readdirSync(DOCS).filter(f => f.endsWith('.html') && f !== 'p-edit.html' && f !== '404.html'))
  .map(f => f.replace(/\.html$/, ''));
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'desktop', width: 1280, height: 900 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let totalFails = 0;
  const report = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile });
    const page = await ctx.newPage();
    // unpkg da error de cert en el sandbox; servimos el React local (mismo que el
    // fallback onerror del sitio) para que React cargue EN ORDEN y la app renderice
    // de verdad (si no, axe no ve nada y da un falso OK). Fuentes → sistema.
    const reactJs = fs.readFileSync(path.join(DOCS, 'assets', 'react.development.js'), 'utf8');
    const reactDomJs = fs.readFileSync(path.join(DOCS, 'assets', 'react-dom.development.js'), 'utf8');
    await page.route('**/*', r => {
      const u = r.request().url();
      if (u.includes('unpkg.com') && u.includes('react-dom')) return r.fulfill({ contentType: 'application/javascript', body: reactDomJs });
      if (u.includes('unpkg.com') && u.includes('/react@')) return r.fulfill({ contentType: 'application/javascript', body: reactJs });
      if (u.includes('unpkg.com') || u.includes('fonts.googleapis') || u.includes('fonts.gstatic') || u.includes('cloudflareinsights') || u.includes('cdnjs')) return r.abort();
      return r.continue();
    });
    for (const slug of PAGES) {
      try {
        await page.goto(`${BASE}/${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(2500); // que React renderice
        const rootKids = await page.evaluate(() => (document.getElementById('root')?.children.length ?? document.body.children.length));
        if (!rootKids) { report.push({ page: slug, vp: vp.name, error: 'la página no renderizó (React no cargó?)' }); continue; }
        await page.evaluate(AXE);
        const res = await page.evaluate(async () => {
          return await window.axe.run(document, {
            runOnly: ['color-contrast'],
            resultTypes: ['violations', 'passes'],
          });
        });
        if ((res.violations.length + res.passes.length) === 0) {
          report.push({ page: slug, vp: vp.name, error: 'axe no evaluó texto (render vacío)' }); continue;
        }
        for (const v of res.violations) {
          for (const node of v.nodes) {
            const sel = node.target.join(' ');
            // Elementos deshabilitados/inactivos (días pasados del calendario, pasos
            // bloqueados del formulario): WCAG los exime. Se omiten del guardarraíl.
            if (/\.past\b|\.is-locked\b/.test(sel)) continue;
            const d = (node.any && node.any[0] && node.any[0].data) || {};
            if (d.contrastRatio == null) continue; // indeterminado (bg imagen) — se ignora
            totalFails++;
            // clave normalizada (sin nth-child ni atributos href/target) para el ratchet
            const key = `${slug}|${sel.replace(/:nth-child\(\d+\)/g, '').replace(/\[[^\]]*\]/g, '')}`;
            report.push({
              page: slug, vp: vp.name, key,
              ratio: d.contrastRatio, need: d.expectedContrastRatio,
              fg: d.fgColor, bg: d.bgColor,
              size: d.fontSize, weight: d.fontWeight,
              sel: node.target.join(' '),
              text: (node.html || '').replace(/\s+/g, ' ').slice(0, 70),
            });
          }
        }
      } catch (e) {
        report.push({ page: slug, vp: vp.name, error: e.message.slice(0, 80) });
      }
    }
    await ctx.close();
  }
  await browser.close();

  // salida — ratchet: la baseline (scripts/contrast-baseline.json) lista los fallos
  // tolerados (borderline/heredados). El gate BLOQUEA solo fallos NUEVOS (regresiones).
  const fails = report.filter(r => r.ratio != null);
  const errs = report.filter(r => r.error);
  const BASE_FILE = path.join(__dirname, 'contrast-baseline.json');
  const curKeys = [...new Set(fails.map(r => r.key))].sort();

  if (process.argv.includes('--update-baseline')) {
    fs.writeFileSync(BASE_FILE, JSON.stringify(curKeys, null, 2) + '\n');
    console.log(`Baseline de contraste actualizada: ${curKeys.length} selectores tolerados → scripts/contrast-baseline.json`);
    process.exit(errs.length ? 1 : 0);
  }

  const baseline = fs.existsSync(BASE_FILE) ? new Set(JSON.parse(fs.readFileSync(BASE_FILE, 'utf8'))) : new Set();
  const isNew = r => !baseline.has(r.key);
  const newFails = fails.filter(isNew);
  const knownFails = fails.length - newFails.length;

  if (newFails.length === 0 && errs.length === 0) {
    console.log(`✓ CONTRASTE OK — sin regresiones. ${knownFails} fallos tolerados en baseline (borderline/heredados).`);
  }
  if (newFails.length) {
    console.log(`✗ ${newFails.length} REGRESIÓN(es) de contraste NUEVA(s) (no estaban en baseline):\n`);
    for (const r of newFails.sort((a, b) => a.ratio - b.ratio)) {
      console.log(`  [${r.page} · ${r.vp}] ratio ${r.ratio} (necesita ${r.need}) — ${r.fg} sobre ${r.bg} · ${r.size}px${r.weight >= 700 ? ' bold' : ''}`);
      console.log(`      ${r.sel}\n      ${r.text}`);
    }
    console.log('\nArréglalo, o si es intencionado: node scripts/contrast-audit.cjs --update-baseline');
  }
  if (errs.length) { console.log(`\n✗ ${errs.length} ERROR(es) de carga/render:`); errs.forEach(e => console.log(`  ${e.page}/${e.vp}: ${e.error}`)); }
  process.exit((newFails.length || errs.length) ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(2); });
