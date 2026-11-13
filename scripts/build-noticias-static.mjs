/**
 * build-noticias-static.mjs
 *
 * Publica el blog (Noticias & Blog) como páginas estáticas con URL propia, en
 * español y en inglés, para que Google las rastree sin ejecutar React:
 *
 *   /noticias/                         archivo de ediciones (ES)   · /noticias/en/
 *   /noticias/2026-11/                 una edición                 · /noticias/en/2026-11/
 *   /noticias/2026-11/<slug>/          un artículo                 · /noticias/en/2026-11/<slug>/
 *
 * Fuente: la edición vigente (const NOTICIAS de noticias-page.jsx) más
 * docs/data/noticias-historico.json. La página dinámica /noticias.html sigue
 * siendo la portada del blog; esto es la capa rastreable y el archivo.
 *
 * También reescribe el bloque `noticias` de docs/sitemap.xml (entre marcadores).
 * Lo ejecuta gen-noticias-mes.mjs tras instalar una edición nueva.
 *
 * Uso:  node scripts/build-noticias-static.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cabecera as cabeceraBase, hero as heroBase, pie as pieBase, cta, migas, migasHtml, esc, clip, localize } from './lib/pagina-estatica.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const OUT = join(DOCS, 'noticias');
const BASE = 'https://www.hestiayourhome.com';
const SITEMAP = join(DOCS, 'sitemap.xml');
const START = '<!-- noticias:start -->';
const END = '<!-- noticias:end -->';

const MONTHS = [
  ['Enero', 'January'], ['Febrero', 'February'], ['Marzo', 'March'], ['Abril', 'April'],
  ['Mayo', 'May'], ['Junio', 'June'], ['Julio', 'July'], ['Agosto', 'August'],
  ['Septiembre', 'September'], ['Octubre', 'October'], ['Noviembre', 'November'], ['Diciembre', 'December'],
];
const APT_CLASS = { 'Hestía Mar': 'vm', 'Hestía Thalassa': 'vt', 'Hestía Salinas': 'vs' };
const APT_COLOR = { vm: '#6B7A3A', vt: '#B86A3C', vs: '#B08A24' };

const T = {
  es: {
    htmlLang: 'es', ogLocale: 'es_ES', inicio: 'Inicio', blog: 'Noticias & Blog',
    navBlog: 'Noticias', navApts: 'Los apartamentos', navAcceso: 'Acceso huésped', navReserva: 'Reservar',
    eyebrow: 'Noticias & Blog',
    hubH1: 'Archivo del blog de Hestía: Vera Playa y alrededores mes a mes',
    hubIntro: 'Cada mes escribimos qué pasa en Vera Playa, Almería y Murcia: fiestas, planes y rincones, con lo que recomendamos desde cada Hestía. Aquí están todas las ediciones.',
    hubTitle: 'Blog de Vera Playa y alrededores, mes a mes · Hestía',
    hubDesc: 'Todas las ediciones del blog de Hestía: fiestas, planes y recomendaciones en Vera Playa, Almería y Murcia, mes a mes.',
    editionWord: 'Edición', articlesN: n => `${n} ${n === 1 ? 'artículo' : 'artículos'}`,
    live: 'Ver la edición del mes, con mapa y filtros',
    edH1: (m, y) => `Qué hacer en Vera Playa y alrededores en ${m.toLowerCase()} de ${y}`,
    edIntro: (m, y) => `Fiestas, planes y rincones de ${m.toLowerCase()} de ${y} en Vera Playa, Almería y Murcia, con la curiosidad y la recomendación del mes desde cada Hestía.`,
    edTitle: (m, y) => `Qué hacer en Vera Playa en ${m.toLowerCase()} de ${y} · Hestía`,
    edDesc: (m, y, titles) => `Noticias y planes de ${m.toLowerCase()} de ${y} en Vera Playa y alrededores: ${titles}.`,
    fromHestia: 'Desde cada Hestía este mes', curiosity: 'Curiosidad del mes', reco: 'Recomendación Hestía',
    inMonth: 'Este mes en la zona', read: 'Leer', prev: 'Edición anterior', next: 'Edición siguiente',
    allEditions: 'Todas las ediciones', thisEdition: 'Edición de', moreThisMonth: 'Más de este mes',
    monthFigures: 'El mes en cifras',
    climate: (m, mx, mn) => `En ${m.toLowerCase()}, las máximas rondan los ${mx}°C y las mínimas los ${mn}°C (media histórica orientativa de la costa de Almería).`,
    byline: 'Escrito por Alex y Fran, que llevan los tres Hestía en Vera Playa desde 2016.',
    ctaRibbon: 'Reserva directa',
    ctaH2: 'Tres casas en Vera Playa, llevadas por nosotros',
    ctaP: 'Reservas directo con Alex y Fran, sin comisiones de plataforma y con respuesta humana en menos de 2 horas, de 9:00 a 22:00. Mascotas bienvenidas en los tres, con petición previa.',
    apts: [['Hestía Mar', 'Terraza esquinera, a 300–400 m de la playa'], ['Hestía Thalassa', 'Ático con vistas panorámicas y SPA comunitario'], ['Hestía Salinas', 'El más grande, con grandes jardines']],
    pieP1: 'Blog escrito por Alex y Fran, que llevan en persona los tres apartamentos de <a href="/">Hestía Your Home</a> en Vera Playa (Almería) desde 2016. Licencias VFT/AL/01580, VFT/AL/05535 y VFT/AL/07056.',
    pieNav: '<a href="/">Inicio</a> · <a href="/noticias.html">Noticias</a> · <a href="/guia-vera/">Extracto Guía</a> · <a href="/reservas.html">Reservas</a> · <a href="/opiniones.html">Opiniones</a> · <a href="/nosotros.html">Nosotros</a> · <a href="/contacto.html">Contacto</a>',
    pieLegal: '<a href="/privacidad.html">Privacidad</a> · <a href="/cookies.html">Cookies</a>',
    publisher: 'Hestía Your Home',
  },
  en: {
    htmlLang: 'en', ogLocale: 'en_GB', inicio: 'Home', blog: 'News & Blog',
    navBlog: 'News', navApts: 'The apartments', navAcceso: 'Guest access', navReserva: 'Book',
    eyebrow: 'News & Blog',
    hubH1: 'Hestía blog archive: Vera Playa and around, month by month',
    hubIntro: 'Every month we write about what is on in Vera Playa, Almería and Murcia: festivals, plans and hidden corners, with what we recommend from each Hestía. Every edition is here.',
    hubTitle: 'Vera Playa and around, month by month · Hestía blog',
    hubDesc: 'Every edition of the Hestía blog: festivals, plans and recommendations in Vera Playa, Almería and Murcia, month by month.',
    editionWord: 'Edition', articlesN: n => `${n} ${n === 1 ? 'article' : 'articles'}`,
    live: 'See this month\'s edition, with map and filters',
    edH1: (m, y) => `What to do in Vera Playa and around in ${m} ${y}`,
    edIntro: (m, y) => `Festivals, plans and corners for ${m} ${y} in Vera Playa, Almería and Murcia, with the curiosity and the recommendation of the month from each Hestía.`,
    edTitle: (m, y) => `What to do in Vera Playa in ${m} ${y} · Hestía`,
    edDesc: (m, y, titles) => `News and plans for ${m} ${y} in Vera Playa and around: ${titles}.`,
    fromHestia: 'From each Hestía this month', curiosity: 'This month\'s curiosity', reco: 'Hestía recommendation',
    inMonth: 'This month in the area', read: 'Read', prev: 'Previous edition', next: 'Next edition',
    allEditions: 'All editions', thisEdition: 'Edition of', moreThisMonth: 'More from this month',
    monthFigures: 'The month in numbers',
    climate: (m, mx, mn) => `In ${m}, highs hover around ${mx}°C and lows around ${mn}°C (indicative historical average for the Almería coast).`,
    byline: 'Written by Alex and Fran, who have run the three Hestía apartments in Vera Playa since 2016.',
    ctaRibbon: 'Direct booking',
    ctaH2: 'Three homes in Vera Playa, run by us',
    ctaP: 'Book direct with Alex and Fran: no platform commissions and a human reply within 2 hours, from 9:00 to 22:00. Pets welcome in all three, with prior request.',
    apts: [['Hestía Mar', 'Corner terrace, 300–400 m from the beach'], ['Hestía Thalassa', 'Penthouse with panoramic views and shared spa'], ['Hestía Salinas', 'The largest, with large gardens']],
    pieP1: 'Blog written by Alex and Fran, who personally run the three <a href="/">Hestía Your Home</a> apartments in Vera Playa (Almería) since 2016. Licences VFT/AL/01580, VFT/AL/05535 and VFT/AL/07056.',
    pieNav: '<a href="/">Home</a> · <a href="/noticias.html">News</a> · <a href="/guia-vera/en/">Guide extract</a> · <a href="/reservas.html">Booking</a> · <a href="/opiniones.html">Reviews</a> · <a href="/nosotros.html">About us</a> · <a href="/contacto.html">Contact</a>',
    pieLegal: '<a href="/privacidad.html">Privacy</a> · <a href="/cookies.html">Cookies</a>',
    publisher: 'Hestía Your Home',
  },
};

const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/^(.{1,70})(-.*)?$/, '$1');
const prefix = lang => (lang === 'en' ? '/noticias/en' : '/noticias');
const monthName = (key, lang) => MONTHS[Number(key.slice(5)) - 1][lang === 'en' ? 1 : 0];

// ── datos ────────────────────────────────────────────────────────────────
function readNoticiasBlock(txt) {
  const i = txt.indexOf('const NOTICIAS = ');
  let k = txt.indexOf('{', i), depth = 0, inStr = false, esc_ = false;
  const bs = k;
  for (; k < txt.length; k++) {
    const c = txt[k];
    if (inStr) { if (esc_) esc_ = false; else if (c === '\\') esc_ = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '{') depth++; else if (c === '}' && --depth === 0) break;
  }
  return JSON.parse(txt.slice(bs, k + 1));
}
const keyFromLabel = label => {
  const m = String(label || '').match(/^(\p{L}+)\s+(\d{4})$/u);
  const idx = m ? MONTHS.findIndex(([es]) => es.toLowerCase() === m[1].toLowerCase()) : -1;
  return idx < 0 ? null : `${m[2]}-${String(idx + 1).padStart(2, '0')}`;
};

const live = readNoticiasBlock(readFileSync(join(DOCS, 'components/noticias-page.jsx'), 'utf8'));
const hist = JSON.parse(readFileSync(join(DOCS, 'data/noticias-historico.json'), 'utf8'));
const climate = JSON.parse(readFileSync(join(DOCS, 'data/climate-monthly.json'), 'utf8'));

const byKey = new Map();
for (const e of hist.editions) byKey.set(e.key, e);
byKey.set(keyFromLabel(live.edition.es), { key: keyFromLabel(live.edition.es), ...live });
const EDITIONS = [...byKey.values()].sort((a, b) => b.key.localeCompare(a.key));
const LIVE_KEY = keyFromLabel(live.edition.es);

// Mismas reglas que valida gen-noticias-mes.mjs. Las ediciones antiguas se escribieron
// antes: lo que no las cumple (p. ej. precios de entradas de terceros, ya caducados) no
// se publica como página indexable, aunque siga en el archivo de la página dinámica.
const TEXT_RULES = [/—/, /\d\s?€|€\s?\d/, /\bdesde\s+\d/i, /\[[^\]]*\]/];
const limpio = a => ['titulo', 'cuerpo', 'tag'].every(f => ['es', 'en'].every(l => !TEXT_RULES.some(r => r.test(a[f][l]))));

for (const ed of EDITIONS) {
  const used = new Set();
  ed.items = [];
  for (const cat of ed.territorio) for (const a of cat.articles.filter(limpio)) {
    let slug = slugify(a.titulo.es) || 'articulo';
    while (used.has(slug)) slug += '-2';
    used.add(slug);
    ed.items.push({ slug, cat, a });
  }
}
EDITIONS.splice(0, EDITIONS.length, ...EDITIONS.filter(e => e.items.length));

// ── plantilla ────────────────────────────────────────────────────────────
const urlOf = (lang, key, slug) => `${BASE}${prefix(lang)}/${key ? key + '/' : ''}${slug ? slug + '/' : ''}`;

const cabecera = o => cabeceraBase({ ...o, navHref: `${prefix(o.lang)}/`, navLabel: T[o.lang].navBlog });
const hero = (lang, h1, intro) => heroBase(lang, h1, intro, T[lang].eyebrow);
const pie = lang => pieBase(lang, T[lang].pieP1);

function escribe(rel, html) {
  html = localize(html, rel.startsWith('en/') || rel === 'en' ? 'en' : 'es');
  const dir = join(OUT, rel);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

const entries = []; // para el sitemap

// ── generación ───────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });

for (const lang of ['es', 'en']) {
  const t = T[lang], other = lang === 'es' ? 'en' : 'es';
  const rel = k => (lang === 'en' ? 'en/' : '') + (k || '');

  // Archivo
  {
    const url = urlOf(lang), alt = urlOf(other);
    const lista = EDITIONS.map(ed => {
      const m = monthName(ed.key, lang), y = ed.key.slice(0, 4);
      const titulos = ed.items.map(i => `<li><a href="${prefix(lang)}/${ed.key}/${i.slug}/">${esc(i.a.titulo[lang])}</a></li>`).join('');
      return `
<article class="ficha">
  <div class="f-cuerpo">
    <h3><a href="${prefix(lang)}/${ed.key}/">${esc(`${m} ${y}`)}</a></h3>
    <ul style="margin:0 0 12px 18px;color:var(--ink-soft);font-size:15px;">${titulos}</ul>
  </div>
  <span class="dist">${esc(t.articlesN(ed.items.length))}</span>
</article>`;
    }).join('');
    const html = cabecera({ lang, title: t.hubTitle, desc: t.hubDesc, canonical: url, altHref: alt,
      jsonld: [migas(lang, [[t.inicio, `${BASE}/`], [t.blog, url]]), {
        '@context': 'https://schema.org', '@type': 'ItemList', name: t.hubH1, numberOfItems: EDITIONS.length,
        itemListElement: EDITIONS.map((ed, i) => ({ '@type': 'ListItem', position: i + 1, url: urlOf(lang, ed.key), name: `${monthName(ed.key, lang)} ${ed.key.slice(0, 4)}` })) }] })
      + hero(lang, t.hubH1, t.hubIntro)
      + `\n<div class="wrap libro">\n${migasHtml([[t.inicio, '/'], [t.blog, `${prefix(lang)}/`]])}
<p style="margin:22px 0 0;"><a href="/noticias.html" style="color:var(--sol-txt);">${esc(t.live)} →</a></p>
<section class="grupo"><div class="rejilla">${lista}</div></section>${cta(lang)}${pie(lang)}`;
    escribe(rel(''), html);
    entries.push({ lang, loc: url, alt, last: `${EDITIONS[0].key}-01`, prio: '0.7' });
  }

  for (let n = 0; n < EDITIONS.length; n++) {
    const ed = EDITIONS[n], key = ed.key, y = key.slice(0, 4), mo = Number(key.slice(5));
    const m = monthName(key, lang), mes = `${m} ${y}`;
    const url = urlOf(lang, key), alt = urlOf(other, key);
    const newer = EDITIONS[n - 1], older = EDITIONS[n + 1];
    const clim = (climate.months || []).find(c => c.m === mo);

    // Edición
    {
      const titles = clip(ed.items.slice(0, 3).map(i => i.a.titulo[lang]).join('; '), 110);
      const voz = ed.voz.map(v => {
        const c = APT_CLASS[v.apt] || 'vm';
        return `<div class="apt-nota" style="--ola-c:${APT_COLOR[c]}">
  <h3 style="color:${APT_COLOR[c]}">${esc(v.apt)}</h3>
  <span class="k">${esc(t.curiosity)}</span><p>${esc(v.curiosidad[lang])}</p>
  <span class="k">${esc(t.reco)}</span><p>${esc(v.reco[lang])}</p>
</div>`;
      }).join('');
      const porCat = ed.territorio.filter(c => c.articles.some(limpio)).map((cat, ci) => `
<section class="grupo">
  <div class="grupo-head"><span class="grupo-n">${String(ci + 1).padStart(2, '0')}</span><h2>${esc(cat.cat[lang])}</h2></div>
  <div class="rejilla">${cat.articles.filter(limpio).map(a => {
      const it = ed.items.find(i => i.a === a);
      return `
<article class="ficha">
  <div class="f-cuerpo">
    <h3><a href="${prefix(lang)}/${key}/${it.slug}/">${esc(a.titulo[lang])}</a></h3>
    <p>${esc(a.cuerpo[lang])}</p>
  </div>
  <span class="dist">${esc(a.tag[lang])}</span>
</article>`;
    }).join('')}</div>
</section>`).join('');
      const pager = `<div class="pager"><span>${older ? `<a href="${prefix(lang)}/${older.key}/">← ${esc(t.prev)}: ${esc(monthName(older.key, lang))} ${older.key.slice(0, 4)}</a>` : ''}</span>
<a href="${prefix(lang)}/">${esc(t.allEditions)}</a>
<span>${newer ? `<a href="${prefix(lang)}/${newer.key}/">${esc(t.next)}: ${esc(monthName(newer.key, lang))} ${newer.key.slice(0, 4)} →</a>` : ''}</span></div>`;
      const trail = [[t.inicio, `${BASE}/`], [t.blog, urlOf(lang)], [mes, url]];
      const html = cabecera({ lang, title: t.edTitle(m, y), desc: clip(t.edDesc(m, y, titles), 158), canonical: url, altHref: alt,
        jsonld: [migas(lang, trail), {
          '@context': 'https://schema.org', '@type': 'ItemList', name: t.edH1(m, y), numberOfItems: ed.items.length,
          itemListElement: ed.items.map((i, k) => ({ '@type': 'ListItem', position: k + 1, url: urlOf(lang, key, i.slug), name: i.a.titulo[lang] })) }] })
        + hero(lang, t.edH1(m, y), t.edIntro(m, y))
        + `\n<div class="wrap libro">\n${migasHtml(trail.map(([a, b]) => [a, b.replace(BASE, '')]))}
<section class="grupo"><div class="grupo-head"><span class="grupo-n">00</span><h2>${esc(t.fromHestia)}</h2></div>${voz}</section>
${porCat}
<p class="autor">${esc(t.byline)}</p>${pager}${cta(lang)}${pie(lang)}`;
      escribe(rel(key), html);
      entries.push({ lang, loc: url, alt, last: `${key}-01`, prio: key === LIVE_KEY ? '0.8' : '0.6' });
    }

    // Artículos
    for (const it of ed.items) {
      const { a, cat, slug } = it;
      const url2 = urlOf(lang, key, slug), alt2 = urlOf(other, key, slug);
      const trail = [[t.inicio, `${BASE}/`], [t.blog, urlOf(lang)], [mes, url], [a.titulo[lang], url2]];
      const title = a.titulo[lang].length > 56 ? a.titulo[lang] : `${a.titulo[lang]} · Hestía`;
      const otros = ed.items.filter(o => o !== it).map(o => `<article class="ficha">
  <div class="f-cuerpo"><h3><a href="${prefix(lang)}/${key}/${o.slug}/">${esc(o.a.titulo[lang])}</a></h3></div>
  <span class="dist">${esc(o.a.tag[lang])}</span>
</article>`).join('');
      const html = cabecera({ lang, title, desc: clip(a.cuerpo[lang], 158), canonical: url2, altHref: alt2,
        jsonld: [migas(lang, trail), {
          '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.titulo[lang], description: a.cuerpo[lang],
          inLanguage: lang, datePublished: `${key}-01`, dateModified: `${key}-01`,
          articleSection: cat.cat[lang], mainEntityOfPage: url2, image: `${BASE}/assets/og-hestia.jpg`,
          author: { '@type': 'Organization', name: t.publisher, url: `${BASE}/` },
          publisher: { '@type': 'Organization', name: t.publisher, url: `${BASE}/`, logo: { '@type': 'ImageObject', url: `${BASE}/assets/logo-teal-transparent.png` } } }] })
        + hero(lang, a.titulo[lang], `${a.tag[lang]} · ${cat.cat[lang]} · ${mes}`)
        + `\n<div class="wrap libro">\n${migasHtml(trail.map(([x, y2]) => [x, y2.replace(BASE, '')]))}
<p class="cuerpo">${esc(a.cuerpo[lang])}</p>
${clim ? `<div class="datos"><b>${esc(t.monthFigures)}.</b> ${esc(t.climate(m, clim.max, clim.min))}</div>` : ''}
<p class="autor">${esc(t.byline)}</p>
${otros ? `<section class="grupo"><div class="grupo-head"><h2>${esc(t.moreThisMonth)}</h2></div><div class="rejilla">${otros}</div></section>` : ''}
<div class="pager"><a href="${prefix(lang)}/${key}/">← ${esc(t.thisEdition)} ${esc(mes)}</a><a href="${prefix(lang)}/">${esc(t.allEditions)}</a></div>${cta(lang)}${pie(lang)}`;
      escribe(rel(`${key}/${slug}`), html);
      entries.push({ lang, loc: url2, alt: alt2, last: `${key}-01`, prio: '0.5' });
    }
  }
}

// ── sitemap ──────────────────────────────────────────────────────────────
const block = entries.map(e => {
  const es = e.lang === 'es' ? e.loc : e.alt, en = e.lang === 'en' ? e.loc : e.alt;
  return `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.last}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>
    <changefreq>monthly</changefreq>
    <priority>${e.prio}</priority>
  </url>
`;
}).join('\n');
let sm = readFileSync(SITEMAP, 'utf8');
const wrapped = `  ${START}\n${block}  ${END}\n`;
if (sm.includes(START)) sm = sm.replace(new RegExp(`  ${START}[\\s\\S]*?${END}\\n`), wrapped);
else sm = sm.replace('</urlset>', `${wrapped}\n</urlset>`);
writeFileSync(SITEMAP, sm);


// ── texto rastreable de /noticias.html ───────────────────────────────────
// La página dinámica pinta la edición con React; este bloque (el que Google ve
// antes de ejecutar JS) lleva la edición vigente y los enlaces al archivo.
{
  const file = join(DOCS, 'noticias.html');
  const cur = EDITIONS.find(e => e.key === LIVE_KEY) || EDITIONS[0];
  const mes = `${monthName(cur.key, 'es')} ${cur.key.slice(0, 4)}`;
  const arts = cur.items.map(i => `    <li><a href="/noticias/${cur.key}/${i.slug}/">${esc(i.a.titulo.es)}</a>. ${esc(i.a.cuerpo.es)}</li>`).join('\n');
  const fb = `<div class="container seo-fallback">
  <h1>Noticias & Blog · Hestía Your Home · Vera Playa, Almería</h1>
  <p>Qué pasa en Vera, Mojácar, Garrucha, Almería y Murcia: fiestas, planes y rincones de la zona, con lo que recomendamos desde cada Hestía. Publicamos una edición cada mes.</p>
  <h2>Edición de ${mes}</h2>
  <ul>
${arts}
  </ul>
  <p><a href="/noticias/${cur.key}/">Edición de ${mes} completa</a> · <a href="/noticias/">Archivo de ediciones</a> · <a href="/noticias/en/">Archive in English</a></p>
  <p>Escrito por Alex y Fran, que conocen la zona de primera mano y no copian la información de otras webs.</p>
  <nav aria-label="Hestía"><a href="/">Inicio</a> · <a href="/mar.html">Hestía Mar</a> · <a href="/thalassa.html">Hestía Thalassa</a> · <a href="/salinas.html">Hestía Salinas</a> · <a href="/reservas.html">Reservas</a> · <a href="/estancias-largas.html">Estancias largas</a> · <a href="/opiniones.html">Opiniones</a> · <a href="/nosotros.html">Nosotros</a> · <a href="/contacto.html">Contacto</a> · <a href="/guia-vera/">Extracto Guía</a></nav>
</div>`;
  const html = readFileSync(file, 'utf8');
  const re = /<div class="container seo-fallback">[\s\S]*?<\/nav>\s*<\/div>/;
  if (!re.test(html)) throw new Error('No encuentro el bloque seo-fallback en noticias.html');
  writeFileSync(file, html.replace(re, () => fb));
}

console.log(`Blog estático: ${EDITIONS.length} ediciones, ${EDITIONS.reduce((n, e) => n + e.items.length, 0)} artículos, ${entries.length} URLs (ES+EN)`);
