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
 * el consejo de quien conoce el sitio, NO se publica: ese es el valor que se lleva
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
    video: 'hero-cala-aerea.mp4', slug: 'playas', cats: ['beach', 'beach-hard', 'beach-dog', 'beach-nude', 'beach-srvc'],
    h1: 'Las playas por las que volvemos',
    title: 'Las mejores playas de Vera y el Levante almeriense · Hestía',
    desc: 'Guía de las playas y calas del Levante almeriense, de Vera a Cabo de Gata: cómo son, qué servicios tienen y cómo se llega. Escrita por quienes llevan toda la vida viniendo.',
    intro: 'De todas las playas del Levante almeriense, estas son a las que volvemos. No es un listado de la costa: es la criba de muchos veranos, de las urbanas con todos los servicios a las calas donde no hay nada más que agua y roca. Ordenadas por distancia desde los apartamentos.',
  },
  {
    video: 'hero-piscina-verano.mp4', slug: 'donde-comer', cats: ['restaurant', 'michelin', 'celiac', 'bar'],
    h1: 'Las mesas que recomendamos',
    title: 'Dónde comer en Vera, Garrucha y Mojácar · Guía Hestía',
    desc: 'Restaurantes, chiringuitos y estrellas Michelin del Levante almeriense y alrededores, con lo que pedir en cada uno. Escrita por quienes llevan toda la vida viniendo.',
    intro: 'De la gamba roja de Garrucha a las estrellas Michelin de Almería, Murcia y Cartagena. Aquí no está todo lo que hay: está donde nosotros comemos y a dónde mandamos a los huéspedes. Ordenado por distancia desde los apartamentos.',
  },
  {
    video: 'hero-playa-aerea-turquesa.mp4', slug: 'pueblos', cats: ['town', 'gem'],
    h1: 'Los pueblos que merecen el viaje',
    title: 'Pueblos que ver cerca de Vera, Almería · Guía Hestía',
    desc: 'Los pueblos del Levante almeriense y del interior de Almería que merecen una visita, con qué ver en cada uno y a qué distancia están de Vera Playa.',
    intro: 'Almería cambia mucho en pocos kilómetros: pueblos blancos colgados, pueblos mineros y casas cueva. De todos los que hay, estos son los que compensan coger el coche. Ordenados por distancia desde los apartamentos.',
  },
  {
    video: 'hero-cala-rocosa.mp4', slug: 'naturaleza-y-rutas', cats: ['trek', 'water', 'adventure'],
    h1: 'Salir a andar, y a mojarse',
    title: 'Rutas y naturaleza en el Levante almeriense · Guía Hestía',
    desc: 'Senderos, rutas costeras, deportes de agua y planes al aire libre en el Levante almeriense y Cabo de Gata, con distancias desde Vera Playa.',
    intro: 'Desde paseos litorales que empiezan en la puerta hasta el Karst en Yesos de Sorbas. Una selección corta a propósito: lo que de verdad recomendamos hacer al aire libre por aquí.',
  },
];

const HUB_HISTORIA = {
  video: 'hero-atardecer-aereo.mp4', slug: 'historia', subcats: ['castillos', 'yacimientos', 'romano', 'islamico', 'cuevas'],
  h1: 'Cuatro mil años de piedra',
  title: 'Castillos y yacimientos de Almería · Guía Hestía',
  desc: 'Castillos, yacimientos argáricos y romanos, patrimonio andalusí y cuevas del Levante almeriense y alrededores, con distancias desde Vera Playa.',
  intro: 'Almería lleva habitada desde El Argar, hace 4.000 años. Fenicios, romanos y andalusíes dejaron aquí más de lo que cabe en una lista: estos son los que están cerca y merecen la parada.',
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
:root{
  --ber:#3D1A35; --ber-dk:#2A0F2E; --ber-deep:#1E0722;
  --sol:#3AAABB; --sol-lt:#6FC4D1; --sol-txt:#176E80;
  --crema:#FAF6F0; --arena:#F0E8D5; --arena-dk:#E4D9BE;
  --ink:#2A0F2E; --ink-soft:#5A4459; --ink-faint:#8B7A8A;
  --rule:#E6DCDF; --vm:#6B7A3A; --vt:#B86A3C; --vs:#B08A24;
  --r:10px 0 10px 0; --r-lg:16px 0 16px 0;
  --serif:'Fraunces',Georgia,serif; --sans:'Hanken Grotesk',system-ui,sans-serif;
  --ease:cubic-bezier(.23,1,.32,1);
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:var(--crema);color:var(--ink);font-family:var(--sans);line-height:1.6;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px;}

.topbar{position:relative;z-index:6;background:var(--ber-deep);color:rgba(240,232,213,.72);
  font-size:12px;padding:8px 0;}
.topbar .wrap{display:flex;justify-content:space-between;align-items:center;gap:16px;}
.topbar a{color:rgba(240,232,213,.72);text-decoration:none;transition:color .2s;}
.topbar a:hover{color:var(--crema);}
.tb-sep{margin:0 10px;opacity:.4;}
@media(max-width:720px){.tb-mail{display:none;} .topbar .wrap{justify-content:center;}}
@media(max-width:460px){.tb-sep,.tb-contacto a:last-child{display:none;}}
.topnav{position:absolute;top:38px;left:0;right:0;z-index:5;padding:20px 0;}
.topnav .wrap{display:flex;justify-content:space-between;align-items:center;gap:20px;}
.topnav a{color:var(--crema);text-decoration:none;font-size:14px;opacity:.85;transition:opacity .2s;}
.topnav a:hover{opacity:1;}
.topnav .brand{font-family:var(--serif);font-size:19px;letter-spacing:.04em;opacity:1;}
.topnav nav{display:flex;gap:22px;}
@media(max-width:640px){.topnav nav a:not(.cta-top){display:none;}}
@media(max-width:680px){
  .ficha{grid-template-columns:44px 1fr;padding:26px 0;}
  .ficha::before{font-size:24px;}
  .dist{grid-column:2;text-align:left;padding-top:0;margin-bottom:10px;font-size:17px;}
  .dist small{display:inline;margin-left:7px;}
}

.hero{position:relative;margin-top:-38px;min-height:clamp(480px,66vh,660px);display:flex;align-items:flex-end;
  background:var(--ber-deep);overflow:hidden;}
.hero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  opacity:.42;filter:saturate(1.1);}
.hero::after{content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(30,7,34,.74) 0%,rgba(30,7,34,.30) 42%,rgba(30,7,34,.95) 100%);}
.hero .wrap{position:relative;z-index:2;padding-top:132px;padding-bottom:54px;width:100%;}
.eyebrow{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--sol-lt);
  font-weight:600;margin-bottom:18px;animation:up .7s var(--ease) both;}
.hero h1{font-family:var(--serif);font-weight:400;color:var(--crema);
  font-size:clamp(36px,6.4vw,72px);line-height:1.03;letter-spacing:-.025em;
  max-width:17ch;margin-bottom:22px;animation:up .8s var(--ease) .08s both;}
.hero .intro{color:rgba(240,232,213,.86);font-size:clamp(16px,1.9vw,19px);max-width:56ch;
  animation:up .8s var(--ease) .18s both;}
.cifras{display:flex;flex-wrap:wrap;gap:16px 44px;margin-top:36px;
  animation:up .8s var(--ease) .28s both;}
.cifra b{display:block;font-family:var(--serif);font-size:clamp(28px,3.6vw,40px);
  color:var(--crema);line-height:1;font-variant-numeric:tabular-nums;}
.cifra span{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;
  color:rgba(240,232,213,.6);margin-top:8px;}
@keyframes up{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:none;}}

.indice{position:sticky;top:0;z-index:4;background:rgba(250,246,240,.94);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--rule);}
.indice .wrap{display:flex;gap:8px;overflow-x:auto;padding-top:14px;padding-bottom:14px;
  scrollbar-width:none;}
.indice .wrap::-webkit-scrollbar{display:none;}
.indice a{flex:0 0 auto;font-size:13px;color:var(--ink-soft);text-decoration:none;
  padding:7px 15px;border:1px solid var(--rule);border-radius:var(--r);white-space:nowrap;
  transition:all .2s var(--ease);}
.indice a:hover{color:var(--crema);background:var(--ber-dk);border-color:var(--ber-dk);}

.grupo{padding:74px 0 8px;scroll-margin-top:70px;}
.grupo-head{display:flex;align-items:baseline;gap:20px;margin-bottom:6px;}
.grupo-n{font-family:var(--serif);font-size:clamp(38px,5.4vw,60px);line-height:1;
  color:var(--arena-dk);font-variant-numeric:tabular-nums;}
.grupo h2{font-family:var(--serif);font-weight:400;font-size:clamp(24px,3.3vw,35px);
  line-height:1.1;letter-spacing:-.02em;}
.grupo-nota{color:var(--ink-faint);font-size:13.5px;margin-bottom:30px;padding-left:2px;}
.grupo-nota b{color:var(--vs);font-weight:600;}

.rejilla{display:flex;flex-direction:column;gap:0;}
.ficha{position:relative;display:grid;grid-template-columns:70px 1fr auto;gap:0 26px;
  align-items:start;padding:34px 30px 34px 4px;border-bottom:1px solid var(--rule);
  transition:background .35s var(--ease),padding-left .35s var(--ease);}
.ficha:first-child{border-top:1px solid var(--rule);}
.ficha:hover{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,0) 92%);padding-left:20px;}
.ficha::before{counter-increment:sitio;content:counter(sitio,decimal-leading-zero);
  font-family:var(--serif);font-size:34px;line-height:.95;color:var(--arena-dk);
  font-variant-numeric:tabular-nums;transition:color .35s var(--ease);}
.ficha:hover::before{color:var(--vs);}
.rejilla{counter-reset:sitio;}
.f-cuerpo{min-width:0;}
.ficha h3{font-family:var(--serif);font-weight:400;font-size:clamp(21px,2.5vw,27px);
  line-height:1.15;letter-spacing:-.015em;margin-bottom:8px;}
.dist{grid-column:3;align-self:start;font-family:var(--serif);font-size:19px;
  color:var(--sol-txt);white-space:nowrap;font-variant-numeric:tabular-nums;
  padding-top:5px;text-align:right;}
.dist small{display:block;font-family:var(--sans);font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink-faint);margin-top:4px;}
.ficha p{font-size:15.5px;color:var(--ink-soft);margin-bottom:12px;max-width:62ch;}
.ficha .best{color:var(--ink);border-left:2px solid var(--vs);padding-left:12px;
  font-size:14px;margin-bottom:12px;}
.ficha .best b{font-weight:600;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  display:block;color:var(--ink-faint);margin-bottom:3px;}
.chips{display:flex;flex-wrap:wrap;align-items:center;gap:7px 11px;}
.chip{font-size:11.5px;color:var(--ink-soft);background:var(--arena);padding:3px 9px;
  border-radius:6px 0 6px 0;}
.chip.nota{background:#EDF1E2;color:#4A5628;font-weight:600;}
.chips a{font-size:11.5px;color:var(--sol-txt);text-decoration:none;
  border-bottom:1px solid rgba(23,110,128,.3);}
.chips a:hover{border-bottom-color:var(--sol-txt);}

.cta{position:relative;margin:88px 0 0;background:var(--ber-dk);color:var(--crema);
  border-radius:var(--r-lg);padding:clamp(38px,5.4vw,60px);overflow:hidden;}
.cta::before{content:'';position:absolute;inset:0;
  background:radial-gradient(680px 420px at 88% 8%,rgba(58,170,187,.20),transparent 62%),
             radial-gradient(560px 380px at 4% 96%,rgba(212,168,74,.16),transparent 58%);}
.cta>*{position:relative;z-index:1;}
.cta h2{font-family:var(--serif);font-weight:400;font-size:clamp(26px,3.7vw,40px);
  line-height:1.1;letter-spacing:-.02em;margin-bottom:22px;max-width:17ch;}
.cta p{color:rgba(240,232,213,.84);font-size:16px;max-width:62ch;margin-bottom:15px;}
.cta .num{color:var(--sol-lt);font-weight:600;}
.cta-datos{display:flex;flex-wrap:wrap;gap:16px 36px;margin:28px 0 30px;
  padding-top:26px;border-top:1px solid rgba(240,232,213,.18);}
.cta-datos div b{display:block;font-family:var(--serif);font-size:30px;line-height:1;
  color:var(--crema);font-variant-numeric:tabular-nums;}
.cta-datos div span{display:block;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(240,232,213,.55);margin-top:7px;}
.apts{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px;}
.apts a{flex:1 1 200px;text-decoration:none;padding:17px 22px;border-radius:var(--r);
  border:1px solid rgba(240,232,213,.2);background:rgba(240,232,213,.05);
  transition:background .25s var(--ease),transform .25s var(--ease);}
.apts a:hover{background:rgba(240,232,213,.11);transform:translateY(-2px);}
.apts a b{display:block;font-family:var(--serif);font-size:19px;font-weight:400;margin-bottom:3px;}
.apts a span{font-size:12.5px;color:rgba(240,232,213,.62);}
.apts .vm b{color:#9DAF62;} .apts .vt b{color:#D89467;} .apts .vs b{color:#E0BC5E;}

.pie{margin-top:66px;padding:34px 0 70px;border-top:1px solid var(--rule);
  font-size:13.5px;color:var(--ink-faint);}
.pie a{color:var(--sol-txt);}
.pie p+p{margin-top:9px;}

a:focus-visible{outline:2px solid var(--sol);outline-offset:3px;}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important;}
  html{scroll-behavior:auto;}
}
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
<div class="topbar">
  <div class="wrap">
    <span class="tb-contacto">
      <a href="https://wa.me/34620316370" rel="noopener">Alex &middot; +34 620 316 370</a>
      <span class="tb-sep">&middot;</span>
      <a href="https://wa.me/34654138251" rel="noopener">Fran &middot; +34 654 138 251</a>
    </span>
    <a class="tb-mail" href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>
  </div>
</div>
<div class="topnav">
  <div class="wrap">
    <a class="brand" href="/">Hestía Your Home</a>
    <nav>
      <a href="/guia-vera/">Guía de la zona</a>
      <a href="/mar.html">Los apartamentos</a>
      <a class="cta-top" href="/reservas.html">Reservar</a>
    </nav>
  </div>
</div>`;

// El hero lleva vídeo real de la zona: es lo que vende antes de leer nada.
// preload="metadata" y poster para no castigar la carga, igual que la home.
const hero = ({ h1, intro, cifras, video }) => `
<header class="hero">
  ${video ? `<video autoplay muted loop playsinline preload="metadata" poster="/assets/posters/${video.replace('.mp4', '.jpg')}" aria-hidden="true">
    <source src="/assets/Videoshome/${video}" type="video/mp4"/>
  </video>` : ''}
  <div class="wrap">
    <p class="eyebrow">Guía de la zona</p>
    <h1>${esc(h1)}</h1>
    <p class="intro">${esc(intro)}</p>
    ${cifras && cifras.length ? `<div class="cifras">${cifras.map(c =>
      `<div class="cifra"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('')}</div>` : ''}
  </div>
</header>`;

const indice = grupos => grupos.length < 2 ? '' : `
<div class="indice"><div class="wrap">
  ${grupos.map(g => `<a href="#${g.id}">${esc(g.nombre)}</a>`).join('')}
</div></div>`;

const bloqueCta = `
<div class="cta">
  <h2>Esto es la mitad de la guía</h2>
  <p>Lo que ves aquí lo puede leer cualquiera: qué es cada sitio, qué tiene de bueno y a qué
  distancia queda. Es la parte que se puede contar por escrito.</p>
  <p>La otra mitad no se aprende leyendo: se aprende viniendo año tras año. A qué hora llegar a cada cala para
  encontrar sitio. Qué pedir en cada mesa. Dónde se aparca de verdad en agosto. Y en qué
  <span class="num">once negocios</span> de la zona tienen descuento nuestros huéspedes.</p>
  <div class="cta-datos">
    <div><b>36</b><span>capítulos</span></div>
    <div><b>131</b><span>consejos</span></div>
    <div><b>430</b><span>puntos en el mapa</span></div>
    <div><b>PDF</b><span>para ir sin cobertura</span></div>
  </div>
  <p>Se entrega al reservar, junto con todo lo del apartamento: del wifi a la farmacia de guardia.
  Tres casas en Vera Playa, llevadas por nosotros, sin comisiones de plataforma.</p>
  <div class="apts">
    <a class="vm" href="/mar.html"><b>Hestía Mar</b><span>A 300 m de la playa</span></a>
    <a class="vt" href="/thalassa.html"><b>Hestía Thalassa</b><span>Ático con SPA y sauna</span></a>
    <a class="vs" href="/salinas.html"><b>Hestía Salinas</b><span>Dos terrazas y las salinas</span></a>
  </div>
</div>`;

const pie = `
<footer class="pie">
  <p>Guía escrita por Alex y Fran, que llevan en persona los tres apartamentos de
  <a href="/">Hestía Your Home</a> en Vera Playa (Almería) desde 2016.
  Licencias VFT/AL/01580, VFT/AL/05535 y VFT/AL/07056.</p>
  <p><a href="/">Inicio</a> · <a href="/guia-vera/">Guía de la zona</a> ·
  <a href="/reservas.html">Reservas</a> · <a href="/opiniones.html">Opiniones</a> ·
  <a href="/nosotros.html">Nosotros</a> · <a href="/contacto.html">Contacto</a></p>
  <p><a href="/privacidad.html">Privacidad</a> · <a href="/cookies.html">Cookies</a></p>
</footer>
</div>
</body>
</html>
`;

const distTxt = k => k < 0.8 ? 'a un paseo'
  : (k < 10 ? `a ${k.toFixed(1).replace('.0', '')} km` : `a ${Math.round(k)} km`);

function ficha(p) {
  const serv = legibles(p.services);
  const acc = limpiaEmoji(p.access);
  const chips = [];
  if (p.rating) chips.push(`<span class="chip nota">${p.rating} sobre 5</span>`);
  if (serv) chips.push(`<span class="chip">${esc(serv)}</span>`);
  if (acc) chips.push(`<span class="chip">${esc(acc)}</span>`);
  if (p.url) chips.push(`<a href="${esc(p.url)}" rel="nofollow noopener" target="_blank">Ver en el mapa</a>`);
  const d = distTxt(p.km);
  return `
<article class="ficha">
  <div class="f-cuerpo">
    <h3>${esc(limpiaEmoji(p.name))}</h3>
    ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
    ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
  </div>
  <span class="dist">${esc(d.replace('a ', ''))}<small>${d === 'a un paseo' ? 'desde casa' : 'desde casa'}</small></span>
</article>`;
}

function fichaAtlas(a) {
  const chips = [];
  if (a.como) chips.push(`<span class="chip">${esc(limpiaEmoji(a.como))}</span>`);
  if (a.url) chips.push(`<a href="${esc(a.url)}" rel="nofollow noopener" target="_blank">Web oficial</a>`);
  return `
<article class="ficha">
  <div class="f-cuerpo">
    <h3>${esc(a.name)}</h3>
    ${a.desc ? `<p>${esc(a.desc)}</p>` : ''}
    ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
  </div>
  <span class="dist">${a.km} km<small>desde casa</small></span>
</article>`;
}

const seccion = (n, id, nombre, cuenta, fichas, total) => `
<section class="grupo" id="${id}">
  <div class="grupo-head">
    <span class="grupo-n">${String(n).padStart(2, '0')}</span>
    <h2>${esc(nombre)}</h2>
  </div>
  <p class="grupo-nota">${total && total > cuenta
    ? `Aquí van ${cuenta}. En la guía del huésped hay <b>${total}</b>, con el consejo de cada uno.`
    : `${cuenta} ${cuenta === 1 ? 'sitio' : 'sitios'}, del más cercano al más lejano.`}</p>
  <div class="rejilla">${fichas}</div>
</section>`;

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
  // Se publica la criba, no el archivo: lo marcado como imperdible más todo
  // lo que está a menos de 6 km. Sin esa segunda condición la guía de playas
  // empezaba a 26 km, sin las de Vera ni Garrucha, que es lo que de verdad
  // busca quien va a dormir aquí. El resto se queda para quien reserva.
  const items = PLACES.filter(p => hub.cats.includes(p.cat) && (p.featured || p.km < 6)).sort((a, b) => a.km - b.km);
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
  const grupos = Object.keys(porCat).map(cat => ({ id: 'g-' + cat, nombre: NOMBRE_CAT[cat] || cat }));
  const totalCat = {};
  for (const p of PLACES) if (hub.cats.includes(p.cat)) totalCat[p.cat] = (totalCat[p.cat] || 0) + 1;
  const cuerpo = Object.entries(porCat).map(([cat, lista], i) =>
    seccion(i + 1, 'g-' + cat, NOMBRE_CAT[cat] || cat, lista.length,
            lista.map(ficha).join(''), totalCat[cat])).join('');
  const masCerca = items[0] ? distTxt(items[0].km) : null;
  const cifras = [[String(items.length), 'sitios'], [String(grupos.length), 'categorías']];
  if (masCerca) cifras.push([masCerca.replace('a ', ''), 'el más cercano']);
  escribe(hub.slug,
    cabecera({ title: hub.title, desc: hub.desc, canonical: url, jsonld })
    + hero({ h1: hub.h1, intro: hub.intro, cifras, video: hub.video })
    + indice(grupos)
    + '<div class="wrap">' + cuerpo + bloqueCta + pie);
  generadas.push({ slug: hub.slug, n: items.length, h1: hub.h1, desc: hub.desc });
}

// historia, desde el Atlas
{
  const h = HUB_HISTORIA;
  const items = ATLAS.filter(a => h.subcats.includes(a.subcat))
    .sort((a, b) => Number(a.km) - Number(b.km)).slice(0, 12);
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
  const grupos = Object.keys(porSub).map(sc => ({ id: 'g-' + sc, nombre: NOMBRE_CAT[sc] || sc }));
  const cuerpo = Object.entries(porSub).map(([sc, lista], i) =>
    seccion(i + 1, 'g-' + sc, NOMBRE_CAT[sc] || sc, lista.length, lista.map(fichaAtlas).join(''))).join('');
  escribe(h.slug,
    cabecera({ title: h.title, desc: h.desc, canonical: url, jsonld })
    + hero({ h1: h.h1, intro: h.intro, video: h.video,
             cifras: [[String(items.length), 'sitios'], [String(grupos.length), 'categorías'],
                      ['4.000', 'años de historia']] })
    + indice(grupos)
    + '<div class="wrap">' + cuerpo + bloqueCta + pie);
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
  const fichas = generadas.map(g => `
<article class="ficha">
  <div class="f-top">
    <h3><a href="/guia-vera/${g.slug}/" style="color:inherit;text-decoration:none">${esc(g.h1)}</a></h3>
    <span class="dist">${g.n} sitios</span>
  </div>
  <p>${esc(g.desc)}</p>
  <div class="chips"><a href="/guia-vera/${g.slug}/">Ver los ${g.n} sitios</a></div>
</article>`).join('');
  escribe('',
    cabecera({
      title: 'Guía de Vera Playa y el Levante almeriense · Hestía',
      desc: `Guía del Levante almeriense por quienes llevan toda la vida viniendo: ${total} playas, restaurantes, pueblos, rutas y monumentos del Levante almeriense, con distancias y lo que merece la pena de cada uno.`,
      canonical: url, jsonld,
    })
    + hero({
      h1: 'La Almería que no sale en las guías',
      intro: `${total} sitios del Levante almeriense recorridos por Alex y Fran, ligados a Almería de toda la vida y con tres apartamentos en Vera Playa desde 2016. No es una lista copiada de otras webs: es lo que recomendamos a quien se aloja con nosotros, ordenado por distancia desde los apartamentos.`,
      cifras: [[String(total), 'sitios'], [String(generadas.length), 'secciones'], ['2016', 'con casa aquí']],
      video: 'hero-atardecer-aereo.mp4',
    })
    + '<div class="wrap">'
    + seccion(1, 'g-todo', 'Por dónde empezar', generadas.length, fichas)
    + bloqueCta + pie);
}

console.log(`✓ hub generado en docs/guia-vera/`);
for (const g of generadas) console.log(`   /guia-vera/${g.slug}/  ${String(g.n).padStart(3)} sitios`);
console.log(`   /guia-vera/          índice`);
