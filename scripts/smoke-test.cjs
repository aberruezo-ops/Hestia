// scripts/smoke-test.cjs
// Smoke test de todo el sitio: carga cada página pública (móvil + escritorio),
// renderiza React de verdad y FALLA si encuentra:
//   · un error de JavaScript (pageerror) o console.error  → habría cazado la
//     "pantalla en blanco" (un ReferenceError al elegir apartamento).
//   · una página que no renderiza (#root vacío).
//   · un enlace interno roto (href a un .html que no existe).
// Uso: (servir docs/ en :8123) && node scripts/smoke-test.cjs   (exit 1 si falla)
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const BASE = process.env.BASE || 'http://localhost:8123';
const DOCS = path.join(__dirname, '..', 'docs');
const PAGES = (process.env.PAGES ? process.env.PAGES.split(',') :
  fs.readdirSync(DOCS).filter(f => f.endsWith('.html') && f !== '404.html'))
  .map(f => f.replace(/\.html$/, ''));
const VIEWPORTS = [{ n: 'mobile', w: 390, h: 844, m: true }, { n: 'desktop', w: 1280, h: 900, m: false }];
const IGNORE = /Failed to load resource|net::ERR|favicon|the server responded with a status/i;

const reactJs = fs.readFileSync(path.join(DOCS, 'assets', 'react.development.js'), 'utf8');
const reactDomJs = fs.readFileSync(path.join(DOCS, 'assets', 'react-dom.development.js'), 'utf8');
const route = p => p.route('**/*', r => {
  const u = r.request().url();
  if (u.includes('unpkg.com') && u.includes('react-dom')) return r.fulfill({ contentType: 'application/javascript', body: reactDomJs });
  if (u.includes('unpkg.com') && u.includes('/react@')) return r.fulfill({ contentType: 'application/javascript', body: reactJs });
  if (u.includes('unpkg.com') || u.includes('fonts.g') || u.includes('cloudflareinsights') || u.includes('cdnjs')) return r.abort();
  return r.continue();
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const jsErrors = [], renderFails = [], links = new Set(), broken = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.m });
    const p = await ctx.newPage(); await route(p);
    const errs = [];
    p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 120)));
    p.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
    for (const slug of PAGES) {
      errs.length = 0;
      try {
        await p.goto(`${BASE}/${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await p.waitForTimeout(2500);
        const kids = await p.evaluate(() => document.getElementById('root')?.children.length ?? document.body.children.length);
        if (!kids) renderFails.push(`${slug}/${vp.n}`);
        if (errs.length) jsErrors.push({ pg: `${slug}/${vp.n}`, errs: [...new Set(errs)] });
        if (vp.n === 'desktop') (await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')))).forEach(h => links.add(h));
      } catch (e) { renderFails.push(`${slug}/${vp.n}: ${e.message.slice(0, 60)}`); }
    }
    await ctx.close();
  }
  await browser.close();

  for (const h of links) {
    if (!h || /^(https?:|mailto:|tel:|#|javascript:|data:|wa\.me)/.test(h)) continue;
    const clean = h.split('#')[0].split('?')[0].replace(/^\.?\//, '');
    if (!clean) continue;
    const target = clean.endsWith('/') ? clean + 'index.html' : (clean.includes('.') ? clean : clean + '.html');
    if (!fs.existsSync(path.join(DOCS, target))) broken.push(`${h} → ${target}`);
  }

  console.log(`Smoke test — ${PAGES.length} páginas × móvil+escritorio`);
  console.log(`  errores JS/consola: ${jsErrors.length} · sin render: ${renderFails.length} · enlaces rotos: ${broken.length} (de ${links.size} hrefs)`);
  jsErrors.forEach(e => { console.log(`  ✗ ${e.pg}`); e.errs.forEach(x => console.log(`      ${x}`)); });
  renderFails.forEach(x => console.log(`  ✗ no renderiza: ${x}`));
  broken.forEach(x => console.log(`  ✗ enlace roto: ${x}`));
  const fail = jsErrors.length + renderFails.length + broken.length;
  if (!fail) console.log('✓ Todo carga sin errores JS, renderiza y sin enlaces rotos.');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
