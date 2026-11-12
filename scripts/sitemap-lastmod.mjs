// Pone en cada <lastmod> de sitemap.xml la fecha del último commit que cambió el
// contenido real de esa página. El HTML de las páginas con React no cuenta: el
// build lo re-sella cada vez (cv) y marcaría todo como modificado.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SITEMAP = 'docs/sitemap.xml';
const C = f => `docs/components/${f}.jsx`;
const PAGES = {
  '': [C('sections-1'), C('sections-2'), C('home-search')],
  'mar.html': [C('apartment-page'), 'docs/data/prices.json'],
  'thalassa.html': [C('apartment-page'), 'docs/data/prices.json'],
  'salinas.html': [C('apartment-page'), 'docs/data/prices.json'],
  'reservas.html': [C('reservas-page'), 'docs/data/prices.json'],
  'opiniones.html': [C('opiniones-page'), 'docs/data/reviews.json'],
  'nosotros.html': [C('nosotros-page'), C('porque-sections')],
  'estancias-largas.html': [C('estancias-largas-page'), 'docs/data/prices.json'],
  'empresas.html': [C('empresas-page')],
  'noticias.html': [C('noticias-page'), 'docs/data/noticias-historico.json'],
  'contacto.html': [C('contacto-page')],
  'normas.html': [C('legal-page')],
};

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const today = new Date().toISOString().slice(0, 10);
const lastChange = files => files
  .map(f => git('status', '--porcelain', '--', f) ? today : git('log', '-1', '--format=%cs', '--', f))
  .filter(Boolean).sort().pop();

let xml = readFileSync(SITEMAP, 'utf8');
xml = xml.replace(/(<loc>https:\/\/www\.hestiayourhome\.com\/([^<]*)<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>)/g, (m, a, path, b) => {
  const files = path.startsWith('guia-vera/') ? [`docs/${path}index.html`] : PAGES[path];
  const d = files && lastChange(files);
  return d ? a + d + b : m;
});
writeFileSync(SITEMAP, xml);
