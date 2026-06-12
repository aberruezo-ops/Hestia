// scripts/contrast-audit.cjs
// Guardarraíl de contraste: carga cada página pública (móvil + escritorio),
// ejecuta la regla WCAG color-contrast de axe-core y reporta cualquier fallo.
// Uso:  (servir docs/ en :8123)  &&  node scripts/contrast-audit.cjs
// Sale con código 1 si hay fallos (apto para CI / pre-push).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const AXE = fs.readFileSync('/tmp/axe/node_modules/axe-core/axe.min.js', 'utf8');
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
            const d = (node.any && node.any[0] && node.any[0].data) || {};
            if (d.contrastRatio == null) continue; // indeterminado (bg imagen) — se ignora
            totalFails++;
            report.push({
              page: slug, vp: vp.name,
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

  // salida
  const fails = report.filter(r => r.ratio != null);
  if (fails.length === 0) {
    console.log('✓ CONTRASTE OK — sin fallos WCAG color-contrast en', PAGES.length, 'páginas (móvil + escritorio).');
  } else {
    console.log(`✗ ${fails.length} FALLOS de contraste:\n`);
    for (const r of fails.sort((a,b)=>a.ratio-b.ratio)) {
      console.log(`  [${r.page} · ${r.vp}] ratio ${r.ratio} (necesita ${r.need}) — ${r.fg} sobre ${r.bg} · ${r.size}px${r.weight>=700?' bold':''}`);
      console.log(`      ${r.sel}`);
      console.log(`      ${r.text}`);
    }
  }
  const errs = report.filter(r => r.error);
  if (errs.length) { console.log('\n(errores de carga:'); errs.forEach(e=>console.log(`  ${e.page}/${e.vp}: ${e.error}`)); console.log(')'); }
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(2); });
