/**
 * build-guia-zona.mjs
 *
 * Genera el hub público de la zona a partir de los mismos datos que la guía
 * del huésped (docs/components/apartment-guide.jsx).
 *
 * Por qué páginas estáticas y no React: el resto del sitio pinta el body con
 * React desde un CDN, así que Google ve el HTML casi vacío en la primera
 * pasada. Estas páginas existen precisamente para posicionar, de modo que su
 * contenido va escrito en el HTML. Sin JS, sin CDN, sin render diferido.
 *
 * Qué se publica y qué no: sale la capa de descubrimiento (nombre, qué es,
 * qué tiene de bueno, servicios, acceso y distancia). El campo `tip`, que es
 * el consejo de quien vive aquí, NO se publica: ese es el valor que se lleva
 * quien reserva directo y entra en la guía completa.
 *
 * Uso:  node scripts/build-guia-zona.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SRC = join(ROOT, 'docs/components/apartment-guide.jsx');
const OUT = join(ROOT, 'docs/guia-vera');
const BASE = 'https://www.hestiayourhome.com';

const HESTIA = [
  { lat: 37.22883, lng: -1.80385 },
  { lat: 37.23336, lng: -1.82415 },
  { lat: 37.2400, lng: -1.8300 },
];

const km = (lat, lng) => {
  const R = 6371;
  return Math.min(...HESTIA.map(h => {
    const dLat = (lat - h.lat) * Math.PI / 180;
    const dLng = (lng - h.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(h.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }));
};

const esc = t => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// El texto lleva emojis de servicio (🚿 🛟 ...) que en una página de contenido
// aportan poco y ensucian el snippet de Google. Se traducen a palabras.
const SERVICIOS = {
  '🚿': 'duchas', '🛟': 'socorrista', '🍹': 'chiringuito', '🛏️': 'hamacas',
  '🛏': 'hamacas', '🚻': 'aseos', '♿': 'accesible', '🅿️': 'parking',
  '🐕': 'perros', '⛱️': 'sombrillas', '🚤': 'náutica', '🏐': 'voley',
};
const legibles = s => {
  if (!s) return '';
  const out = [];
  for (const [emo, txt] of Object.entries(SERVICIOS)) if (s.includes(emo)) out.push(txt);
  return [...new Set(out)].join(' · ');
};
const limpiaEmoji = s => String(s ?? '')
  .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();

// ---- extracción de datos --------------------------------------------------
const src = readFileSync(SRC, 'utf8');

const campo = (blk, k) => {
  const m = blk.match(new RegExp(`${k}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  return m ? m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : null;
};

/**
 * Las entradas de pueblo llevan un array `events` con objetos dentro, así que
 * un regex de "todo menos llaves" se las salta. Aquí se recorre el objeto
 * contando llaves y saltando lo que va dentro de comillas.
 */
function objetosQueEmpiezanPor(texto, clave) {
  const salida = [];
  const re = new RegExp(`\\{\\s*${clave}\\s*:`, 'g');
  let m;
  while ((m = re.exec(texto)) !== null) {
    let i = m.index, prof = 0, comilla = null;
    for (let j = i; j < texto.length; j++) {
      const c = texto[j];
      if (comilla) {
        if (c === '\\') { j++; continue; }
        if (c === comilla) comilla = null;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
      if (c === '{') prof++;
      else if (c === '}') {
        prof--;
        if (prof === 0) { salida.push(texto.slice(i, j + 1)); re.lastIndex = j; break; }
      }
    }
  }
  return salida;
}

// Dentro de un objeto de lugar, `name:` puede aparecer también en los eventos
// anidados. Solo interesa el del primer nivel, así que se corta por el array.
const sinAnidados = b => b.replace(/events:\s*\[[\s\S]*?\]/g, '');

const PLACES = [];
for (const bruto of objetosQueEmpiezanPor(src, 'id')) {
  const b = sinAnidados(bruto);
  if (!b.includes('name:')) continue;
  const lat = b.match(/lat:\s*([\d.-]+)/), lng = b.match(/lng:\s*([\d.-]+)/);
  if (!lat || !lng) continue;
  const rat = b.match(/rating:\s*([\d.]+)/);
  PLACES.push({
    id: campo(b, 'id'), name: campo(b, 'name'), desc: campo(b, 'desc'), best: campo(b, 'best'),
    cat: campo(b, 'cat'), services: campo(b, 'services'), access: campo(b, 'access'),
    url: campo(b, 'url'), rating: rat ? parseFloat(rat[1]) : null,
    featured: b.includes('featured: true'),
    km: km(parseFloat(lat[1]), parseFloat(lng[1])),
  });
}

const ATLAS = [];
for (const b of objetosQueEmpiezanPor(src, 'subcat')) {
  ATLAS.push({
    subcat: campo(b, 'subcat'), name: campo(b, 'name_es'), desc: campo(b, 'desc_es'),
    como: campo(b, 'comoLlegar_es'), url: campo(b, 'url'),
    km: (b.match(/km:\s*(\d+)/) || [])[1],
  });
}

// ---- definición de los hubs ----------------------------------------------
const HUBS = [
  {
    slug: 'playas', cats: ['beach', 'beach-hard', 'beach-dog', 'beach-nude', 'beach-srvc'],
    h1: 'Playas de Vera, Mojácar y el Levante almeriense',
    title: 'Playas de Vera y el Levante almeriense · Guía Hestía',
    desc: 'Guía de las playas y calas del Levante almeriense, de Vera a Cabo de Gata: cómo son, qué servicios tienen y cómo se llega. Escrita desde Vera Playa.',
    intro: 'Vivimos en Vera Playa y estas son las playas y calas que recorremos, de las urbanas con todos los servicios a las calas de Cabo de Gata donde no hay nada más que agua y roca. Están ordenadas por distancia desde Vera Playa.',
  },
  {
    slug: 'donde-comer', cats: ['restaurant', 'michelin', 'celiac', 'bar'],
    h1: 'Dónde comer en Vera, Garrucha y Mojácar',
    title: 'Dónde comer en Vera, Garrucha y Mojácar · Guía Hestía',
    desc: 'Restaurantes, chiringuitos y estrellas Michelin del Levante almeriense y alrededores, con lo que pedir en cada uno. Guía escrita desde Vera Playa.',
    intro: 'De la gamba roja de Garrucha a las estrellas Michelin de Almería, Murcia y Cartagena. Están ordenados por distancia desde Vera Playa, empezando por lo que tenemos a un paseo.',
  },
  {
    slug: 'pueblos', cats: ['town', 'gem'],
    h1: 'Pueblos que ver cerca de Vera, en Almería',
    title: 'Pueblos que ver cerca de Vera, Almería · Guía Hestía',
    desc: 'Los pueblos del Levante almeriense y del interior de Almería que merecen una visita, con qué ver en cada uno y a qué distancia están de Vera Playa.',
    intro: 'Almería cambia mucho en pocos kilómetros: pueblos blancos colgados, pueblos mineros, casas cueva y rincones que no salen en las guías. Ordenados por distancia desde Vera Playa.',
  },
  {
    slug: 'naturaleza-y-rutas', cats: ['trek', 'water', 'adventure'],
    h1: 'Rutas, senderismo y naturaleza en Almería',
    title: 'Rutas y naturaleza en el Levante almeriense · Guía Hestía',
    desc: 'Senderos, rutas costeras, deportes de agua y planes al aire libre en el Levante almeriense y Cabo de Gata, con distancias desde Vera Playa.',
    intro: 'Desde paseos litorales que salen de la puerta de casa hasta el Karst en Yesos de Sorbas y las ramblas del interior. Ordenado por distancia desde Vera Playa.',
  },
];

const HUB_HISTORIA = {
  slug: 'historia', subcats: ['castillos', 'yacimientos', 'romano', 'islamico', 'cuevas'],
  h1: 'Castillos, yacimientos y patrimonio de Almería',
  title: 'Castillos y yacimientos de Almería · Guía Hestía',
  desc: 'Castillos, yacimientos argáricos y romanos, patrimonio andalusí y cuevas del Levante almeriense y alrededores, con distancias desde Vera Playa.',
  intro: 'Almería lleva habitada desde El Argar, hace 4.000 años. Fenicios, romanos, andalusíes y la piedra que dejaron detrás. Ordenado por distancia desde Vera Playa.',
};

const NOMBRE_CAT = {
  beach: 'Playa', 'beach-hard': 'Cala de acceso difícil', 'beach-dog': 'Playa para perros',
  'beach-nude': 'Playa naturista', 'beach-srvc': 'Servicios de playa',
  restaurant: 'Restaurante', michelin: 'Michelin', celiac: 'Sin gluten', bar: 'Chiringuito o bar',
  town: 'Pueblo', gem: 'Rincón', trek: 'Ruta', water: 'Agua', adventure: 'Aventura',
  castillos: 'Castillo', yacimientos: 'Yacimiento', romano: 'Romano',
  islamico: 'Andalusí', cuevas: 'Cueva y geología',
};

// ---- plantilla ------------------------------------------------------------
const ESTILO = `
:root{--ber:#3D1A35;--ber-dk:#2A0F2E;--sol:#176E80;--crema:#FAF6F0;--arena:#F0E8D5;
--ink:#2A0F2E;--ink-soft:#5A4459;--rule:#E2D8DC;--vm:#6B7A3A;--vt:#B86A3C;--vs:#B08A24;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--crema);color:var(--ink);font-family:'Hanken Grotesk',system-ui,sans-serif;
line-height:1.6;padding:0 20px 80px;}
.wrap{max-width:840px;margin:0 auto;}
header.top{padding:26px 0;border-bottom:1px solid var(--rule);display:flex;
justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;}
header.top a.brand{font-family:'Fraunces',Georgia,serif;font-size:20px;color:var(--ink);
text-decoration:none;letter-spacing:.02em;}
header.top nav a{color:var(--sol);text-decoration:none;font-size:14px;margin-left:16px;}
header.top nav a:hover{text-decoration:underline;}
.hero{padding:46px 0 8px;}
.eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--sol);
font-weight:600;margin-bottom:14px;}
h1{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:clamp(32px,5.4vw,50px);
line-height:1.1;letter-spacing:-.015em;margin-bottom:16px;}
.intro{font-size:17.5px;color:var(--ink-soft);max-width:62ch;margin-bottom:8px;}
h2.grupo{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:26px;
margin:44px 0 4px;padding-top:22px;border-top:2px solid var(--ink);}
.cuenta{font-size:13px;color:var(--ink-soft);margin-bottom:10px;}
article{padding:20px 0;border-bottom:1px solid var(--rule);}
article h3{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:21px;margin-bottom:5px;}
article h3 .dist{font-family:'Hanken Grotesk',sans-serif;font-size:13px;color:var(--ink-soft);
font-weight:400;margin-left:9px;white-space:nowrap;}
article p{font-size:15.5px;color:var(--ink-soft);margin-bottom:6px;max-width:68ch;}
article p.best{color:var(--ink);}
article p.best b{font-weight:600;}
.meta{font-size:13px;color:var(--ink-soft);display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px;}
.meta .tag{background:var(--arena);padding:2px 9px;border-radius:8px 0 8px 0;}
.meta a{color:var(--sol);}
.cta{background:var(--ber-dk);color:var(--crema);border-radius:14px 0 14px 0;
padding:30px 32px;margin:48px 0 0;}
.cta h2{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:25px;
margin-bottom:12px;color:var(--crema);}
.cta p{color:rgba(240,232,213,.82);font-size:15.5px;margin-bottom:14px;max-width:60ch;}
.cta a{color:#6FC4D1;font-weight:600;}
.apts{display:flex;gap:10px 22px;flex-wrap:wrap;margin-top:14px;font-size:15px;}
.apts a{text-decoration:none;font-weight:600;}
.apts a.vm{color:#9DAF62;} .apts a.vt{color:#D89467;} .apts a.vs{color:#E0BC5E;}
footer.pie{margin-top:52px;padding-top:22px;border-top:1px solid var(--rule);
font-size:13.5px;color:var(--ink-soft);}
footer.pie a{color:var(--sol);}
`;

const cabecera = ({ title, desc, canonical, jsonld }) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="theme-color" content="#2A0F2E"/>
<title>${esc(title)}</title>
<meta name="robots" content="index, follow"/>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" hreflang="es" href="${canonical}"/>
<link rel="alternate" hreflang="x-default" href="${canonical}"/>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png"/>
<meta property="og:site_name" content="Hestía Your Home"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${BASE}/assets/hero-terrace-night.jpg"/>
<meta property="og:locale" content="es_ES"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>${ESTILO}</style>
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<div class="wrap">
<header class="top">
  <a class="brand" href="/">Hestía Your Home</a>
  <nav>
    <a href="/guia-vera/">Guía de la zona</a>
    <a href="/reservas.html">Reservas</a>
    <a href="/contacto.html">Contacto</a>
  </nav>
</header>`;

const pie = `
<footer class="pie">
  <p>Guía escrita por Alex y Fran, que gestionan en persona los tres apartamentos de
  <a href="/">Hestía Your Home</a> en Vera Playa (Almería) desde 2016.
  Licencias VFT/AL/01580, VFT/AL/05535 y VFT/AL/07056.</p>
  <p style="margin-top:8px"><a href="/guia-vera/">Volver a la guía de la zona</a> ·
  <a href="/">Inicio</a> · <a href="/reservas.html">Reservas</a> ·
  <a href="/contacto.html">Contacto</a></p>
</footer>
</div>
</body>
</html>
`;

const bloqueCta = `
<div class="cta">
  <h2>Esta es solo la mitad de la guía</h2>
  <p>Lo que ves aquí es el qué y el dónde. A quien se aloja con nosotros le damos la guía
  completa: a qué hora ir para no encontrar el parking lleno, qué pedir en cada sitio, dónde
  aparcar de verdad y los rincones que no aparecen en ninguna lista.</p>
  <p>Tres apartamentos en Vera Playa, gestionados por nosotros, sin comisiones de plataforma.</p>
  <div class="apts">
    <a class="vm" href="/mar.html">Hestía Mar</a>
    <a class="vt" href="/thalassa.html">Hestía Thalassa</a>
    <a class="vs" href="/salinas.html">Hestía Salinas</a>
  </div>
</div>`;

const distTxt = k => k < 1 ? 'a un paseo' : (k < 100 ? `a ${Math.round(k)} km` : `a ${Math.round(k)} km`);

function ficha(p) {
  const serv = legibles(p.services);
  const acc = limpiaEmoji(p.access);
  const meta = [];
  if (p.rating) meta.push(`<span class="tag">${p.rating} sobre 5</span>`);
  if (serv) meta.push(`<span class="tag">${esc(serv)}</span>`);
  if (acc) meta.push(`<span class="tag">${esc(acc)}</span>`);
  if (p.url) meta.push(`<a href="${esc(p.url)}" rel="nofollow noopener" target="_blank">Ver en el mapa</a>`);
  return `
<article>
  <h3>${esc(limpiaEmoji(p.name))}<span class="dist">${distTxt(p.km)}</span></h3>
  ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
  ${p.best ? `<p class="best"><b>No te pierdas:</b> ${esc(p.best)}</p>` : ''}
  ${meta.length ? `<div class="meta">${meta.join('')}</div>` : ''}
</article>`;
}

function fichaAtlas(a) {
  const meta = [];
  if (a.como) meta.push(`<span class="tag">${esc(limpiaEmoji(a.como))}</span>`);
  if (a.url) meta.push(`<a href="${esc(a.url)}" rel="nofollow noopener" target="_blank">Web oficial</a>`);
  return `
<article>
  <h3>${esc(a.name)}<span class="dist">a ${a.km} km</span></h3>
  ${a.desc ? `<p>${esc(a.desc)}</p>` : ''}
  ${meta.length ? `<div class="meta">${meta.join('')}</div>` : ''}
</article>`;
}

function escribe(rel, html) {
  const dir = join(OUT, rel);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

const migas = (nombre, url) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Guía de la zona', item: `${BASE}/guia-vera/` },
    { '@type': 'ListItem', position: 3, name: nombre, item: url },
  ],
});

// ---- generación -----------------------------------------------------------
const generadas = [];

for (const hub of HUBS) {
  const items = PLACES.filter(p => hub.cats.includes(p.cat)).sort((a, b) => a.km - b.km);
  if (!items.length) continue;
  const url = `${BASE}/guia-vera/${hub.slug}/`;
  const jsonld = [
    migas(hub.h1, url),
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: hub.h1,
      description: hub.desc, numberOfItems: items.length,
      itemListElement: items.slice(0, 60).map((p, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'Place', name: limpiaEmoji(p.name), description: p.desc || undefined },
      })),
    },
  ];
  const porCat = {};
  for (const p of items) (porCat[p.cat] ||= []).push(p);
  let cuerpo = '';
  for (const [cat, lista] of Object.entries(porCat)) {
    cuerpo += `\n<h2 class="grupo">${NOMBRE_CAT[cat] || cat}</h2>\n<p class="cuenta">${lista.length} sitios, del más cercano al más lejano.</p>`;
    cuerpo += lista.map(ficha).join('');
  }
  escribe(hub.slug, cabecera({ title: hub.title, desc: hub.desc, canonical: url, jsonld }) + `
<div class="hero">
  <p class="eyebrow">Guía de la zona</p>
  <h1>${esc(hub.h1)}</h1>
  <p class="intro">${esc(hub.intro)}</p>
</div>
${cuerpo}
${bloqueCta}
` + pie);
  generadas.push({ slug: hub.slug, n: items.length, h1: hub.h1, desc: hub.desc });
}

// historia, desde el Atlas
{
  const h = HUB_HISTORIA;
  const items = ATLAS.filter(a => h.subcats.includes(a.subcat))
    .sort((a, b) => Number(a.km) - Number(b.km));
  const url = `${BASE}/guia-vera/${h.slug}/`;
  const jsonld = [
    migas(h.h1, url),
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: h.h1,
      description: h.desc, numberOfItems: items.length,
      itemListElement: items.map((a, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'TouristAttraction', name: a.name, description: a.desc || undefined },
      })),
    },
  ];
  const porSub = {};
  for (const a of items) (porSub[a.subcat] ||= []).push(a);
  let cuerpo = '';
  for (const [sc, lista] of Object.entries(porSub)) {
    cuerpo += `\n<h2 class="grupo">${NOMBRE_CAT[sc] || sc}</h2>\n<p class="cuenta">${lista.length} sitios, del más cercano al más lejano.</p>`;
    cuerpo += lista.map(fichaAtlas).join('');
  }
  escribe(h.slug, cabecera({ title: h.title, desc: h.desc, canonical: url, jsonld }) + `
<div class="hero">
  <p class="eyebrow">Guía de la zona</p>
  <h1>${esc(h.h1)}</h1>
  <p class="intro">${esc(h.intro)}</p>
</div>
${cuerpo}
${bloqueCta}
` + pie);
  generadas.push({ slug: h.slug, n: items.length, h1: h.h1, desc: h.desc });
}

// índice del hub
{
  const url = `${BASE}/guia-vera/`;
  const total = generadas.reduce((a, g) => a + g.n, 0);
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Guía de la zona', item: url },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: 'Guía de Vera Playa y el Levante almeriense',
      numberOfItems: generadas.length,
      itemListElement: generadas.map((g, i) => ({
        '@type': 'ListItem', position: i + 1, name: g.h1,
        url: `${BASE}/guia-vera/${g.slug}/`,
      })),
    },
  ];
  const cuerpo = generadas.map(g => `
<article>
  <h3><a href="/guia-vera/${g.slug}/" style="color:var(--ink);text-decoration:none">${esc(g.h1)}</a><span class="dist">${g.n} sitios</span></h3>
  <p>${esc(g.desc)}</p>
</article>`).join('');
  escribe('', cabecera({
    title: 'Guía de Vera Playa y el Levante almeriense · Hestía',
    desc: `Guía de la zona escrita desde Vera Playa: ${total} playas, restaurantes, pueblos, rutas y monumentos del Levante almeriense, con distancias y lo que merece la pena de cada uno.`,
    canonical: url, jsonld,
  }) + `
<div class="hero">
  <p class="eyebrow">Almería, desde dentro</p>
  <h1>Guía de Vera Playa y el Levante almeriense</h1>
  <p class="intro">${total} sitios de la zona, recorridos y escritos por Alex y Fran, que gestionan
  tres apartamentos en Vera Playa desde 2016. No es una lista copiada de otras webs: es lo que
  recomendamos a quien se aloja con nosotros, ordenado por distancia desde Vera Playa.</p>
</div>
<h2 class="grupo">Por dónde empezar</h2>
<p class="cuenta">${generadas.length} secciones.</p>
${cuerpo}
${bloqueCta}
` + pie);
}

console.log(`✓ hub generado en docs/guia-vera/`);
for (const g of generadas) console.log(`   /guia-vera/${g.slug}/  ${String(g.n).padStart(3)} sitios`);
console.log(`   /guia-vera/          índice`);
