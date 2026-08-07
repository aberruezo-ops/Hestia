// scripts/check-external-links.cjs
// Comprueba en vivo los enlaces EXTERNOS del sitio (Google Maps, webs de
// restaurantes/servicios, redes sociales…), que smoke-test.cjs deja fuera
// a propósito (solo vigila los internos, ver su cabecera).
//
// Recolecta los <a href> de:
//   1) todas las páginas públicas (pasada de escritorio, como smoke-test.cjs)
//   2) la guía de huéspedes de un apartamento, desbloqueada sin PIN via el
//      flag de sessionStorage que ya usa GuestAccessModal — si no se abre,
//      los varios cientos de enlaces del directorio de lugares (PLACES) nunca se
//      renderizan y quedan fuera del barrido.
//
// Cada URL única se comprueba con HEAD (GET de respaldo si el servidor
// no acepta HEAD), con timeout y una reintentada, en paralelo limitado.
// No bloquea el merge (ver checks.yml): sitios de terceros caen o van
// lentos por su cuenta; esto es un REPORTE, no un gate duro.
//
// Uso: (servir docs/ en :8123) && node scripts/check-external-links.cjs
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const BASE = process.env.BASE || 'http://localhost:8123';
const DOCS = path.join(__dirname, '..', 'docs');
const PAGES = fs.readdirSync(DOCS).filter(f => f.endsWith('.html') && f !== '404.html')
  .map(f => f.replace(/\.html$/, ''));
const GUIDE_APT = process.env.GUIDE_APT || 'vm';   // id interno (vm/vt/vs); PLACES es compartido entre los 3 Hestías
const CONCURRENCY = 10;
const TIMEOUT_MS = 12000;

const reactJs = fs.readFileSync(path.join(DOCS, 'assets', 'react.development.js'), 'utf8');
const reactDomJs = fs.readFileSync(path.join(DOCS, 'assets', 'react-dom.development.js'), 'utf8');
const route = p => p.route('**/*', r => {
  const u = r.request().url();
  if (u.includes('unpkg.com') && u.includes('react-dom')) return r.fulfill({ contentType: 'application/javascript', body: reactDomJs });
  if (u.includes('unpkg.com') && u.includes('/react@')) return r.fulfill({ contentType: 'application/javascript', body: reactJs });
  if (u.includes('unpkg.com') || u.includes('fonts.g') || u.includes('cloudflareinsights') || u.includes('cdnjs') || u.includes('open-meteo.com')) return r.abort();
  return r.continue();
});

// href -> Set de páginas donde aparece, para poder señalar dónde arreglarlo.
const linkSources = new Map();
const addLink = (href, source) => {
  if (!linkSources.has(href)) linkSources.set(href, new Set());
  linkSources.get(href).add(source);
};

async function harvest() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await route(p);

  for (const slug of PAGES) {
    try {
      await p.goto(`${BASE}/${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await p.waitForTimeout(2000);
      const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
      hrefs.forEach(h => addLink(h, slug));
    } catch (e) {
      console.log(`  aviso: ${slug} no cargó para recolectar enlaces (${e.message.slice(0, 60)})`);
    }
  }

  // La guía de huéspedes (PLACES: varios cientos de enlaces) solo se renderiza tras
  // desbloquearla. Mismo flag que usa GuestAccessModal tras validar el PIN.
  try {
    await p.addInitScript((apt) => { sessionStorage.setItem(`hestia-guide-unlock-${apt}`, '1'); }, GUIDE_APT);
    const slug = { vm: 'mar', vt: 'thalassa', vs: 'salinas' }[GUIDE_APT] || 'mar';
    await p.goto(`${BASE}/${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    const guideHrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
    guideHrefs.forEach(h => addLink(h, `guía-${GUIDE_APT}`));
  } catch (e) {
    console.log(`  aviso: no se pudo abrir la guía de ${GUIDE_APT} para recolectar enlaces (${e.message.slice(0, 60)})`);
  }

  await browser.close();
}

async function checkUrl(url) {
  const attempt = async (method) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HestiaLinkCheck/1.0)' } });
      return res.status;
    } finally { clearTimeout(t); }
  };
  try {
    const status = await attempt('HEAD');
    if (status === 405 || status === 403) return await attempt('GET');   // algunos servidores bloquean HEAD
    return status;
  } catch (e) {
    try { return await attempt('GET'); }   // reintento con GET por si el fallo fue específico de HEAD
    catch (e2) { return `error: ${e2.message.slice(0, 80)}`; }
  }
}

async function checkAll(urls) {
  const results = new Map();
  let i = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (i < urls.length) {
      const idx = i++; const url = urls[idx];
      results.set(url, await checkUrl(url));
    }
  });
  await Promise.all(workers);
  return results;
}

(async () => {
  await harvest();

  // wa.me se excluye igual que en smoke-test.cjs: es un deep-link a WhatsApp,
  // no una página, siempre responde 200 sin validar el número. Comprobarlo
  // no detecta nada real (si Alex/Fran cambian de móvil, esto no lo cazaría).
  const external = [...linkSources.keys()].filter(h =>
    /^https?:\/\//.test(h) && !h.includes('hestiayourhome.com') && !h.includes('localhost') && !h.includes('wa.me'));
  const unique = [...new Set(external)];

  console.log(`Enlaces externos recolectados: ${unique.length} únicos (de ${PAGES.length} páginas + guía de ${GUIDE_APT})`);
  if (!unique.length) { console.log('Nada que comprobar.'); return; }

  const results = await checkAll(unique);
  const broken = [];
  for (const [url, status] of results) {
    const ok = typeof status === 'number' && status >= 200 && status < 400;
    if (!ok) broken.push({ url, status, sources: [...linkSources.get(url)] });
  }

  console.log(`\nComprobados: ${unique.length} · rotos: ${broken.length}`);
  broken.forEach(b => console.log(`  ✗ [${b.status}] ${b.url}\n      en: ${b.sources.join(', ')}`));
  if (!broken.length) console.log('✓ Todos los enlaces externos responden.');
  // Informativo: no bloquea el merge (ver checks.yml), sitios de terceros
  // fallan por su cuenta. Exit code igualmente refleja el resultado por si
  // se quiere usar como gate en el futuro.
  process.exitCode = broken.length ? 1 : 0;
})().catch(e => { console.error('FATAL', e); process.exitCode = 2; });
