// Plantilla compartida de las páginas estáticas (blog y páginas de destino).
import { ESTILO } from './guia-estilo.mjs';

export const BASE = 'https://www.hestiayourhome.com';
export const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const clip = (s, n) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

export const COMUN_CSS = `
.lista{margin:12px 0 0 20px;max-width:64ch;color:var(--ink-soft);font-size:16px;} .lista li{margin-bottom:8px;} .lista a{color:var(--sol-txt);}
.faq{max-width:64ch;margin:0 0 18px;} .faq h3{font-family:var(--serif);font-weight:400;font-size:20px;margin-bottom:4px;} .faq p{color:var(--ink-soft);font-size:16px;}
.apt-nota h3 a{text-decoration:none;}
.hero{background:linear-gradient(160deg,var(--ber-dk),var(--ber-deep));}
.ficha h3 a{color:inherit;text-decoration:none;} .ficha h3 a:hover{color:var(--sol-txt);}
.ficha .dist{font-size:15px;}
.apt-nota{position:relative;padding:30px 0 4px;margin:0 0 22px;max-width:64ch;}
.apt-nota::before,.apt-nota::after{content:'';position:absolute;top:6px;left:0;width:16px;height:16px;border-radius:100% 0 100% 0;pointer-events:none;}
.apt-nota::before{background:var(--hoja-c,var(--sol));transform:translate(3px,3px);}
.apt-nota::after{border:1.5px solid var(--ink);}
.apt-nota h3{font-family:var(--serif);font-weight:400;font-size:22px;margin-bottom:8px;}
.apt-nota .k{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);margin:10px 0 2px;display:block;}
.apt-nota p{font-size:15.5px;color:var(--ink-soft);margin:0;}
.cuerpo{font-size:18px;color:var(--ink);max-width:62ch;margin:30px 0 8px;}
.datos{background:var(--arena);border-radius:var(--r);padding:16px 22px;margin:26px 0;max-width:64ch;font-size:15px;color:var(--ink-soft);}
.datos b{color:var(--ink);}
.pager{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 24px;margin:48px 0 0;font-size:14.5px;}
.pager a{color:var(--sol-txt);}
.autor{font-size:14px;color:var(--ink-faint);margin-top:26px;}
.migas{font-size:12.5px;color:var(--ink-faint);margin:26px 0 0;} .migas a{color:var(--sol-txt);text-decoration:none;}
`;

export const SHELL = {
  es: {
    htmlLang: 'es', ogLocale: 'es_ES', navApts: 'Los apartamentos', navAcceso: 'Acceso huésped', navReserva: 'Reservar',
    ctaRibbon: 'Reserva directa',
    ctaH2: 'Tres casas en Vera Playa, llevadas por nosotros',
    ctaP: 'Reservas directo con Alex y Fran, sin comisiones de plataforma y con respuesta humana en menos de 2 horas, de 9:00 a 22:00. Mascotas bienvenidas en los tres, con petición previa.',
    apts: [['Hestía Mar', 'Terraza esquinera, a 300–400 m de la playa'], ['Hestía Thalassa', 'Ático con vistas panorámicas y SPA comunitario'], ['Hestía Salinas', 'El más grande, con grandes jardines']],
    pieP1: 'Hestía Your Home: tres apartamentos en Vera Playa (Almería), llevados en persona por Alex y Fran desde 2016. Licencias VFT/AL/01580, VFT/AL/05535 y VFT/AL/07056.',
    pieNav: '<a href="/">Inicio</a> · <a href="/noticias.html">Noticias</a> · <a href="/guia-vera/">Extracto Guía</a> · <a href="/reservas.html">Reservas</a> · <a href="/opiniones.html">Opiniones</a> · <a href="/nosotros.html">Nosotros</a> · <a href="/contacto.html">Contacto</a>',
    pieLegal: '<a href="/privacidad.html">Privacidad</a> · <a href="/cookies.html">Cookies</a>',
  },
  en: {
    htmlLang: 'en', ogLocale: 'en_GB', navApts: 'The apartments', navAcceso: 'Guest access', navReserva: 'Book',
    ctaRibbon: 'Direct booking',
    ctaH2: 'Three homes in Vera Playa, run by us',
    ctaP: 'Book direct with Alex and Fran: no platform commissions and a human reply within 2 hours, from 9:00 to 22:00. Pets welcome in all three, with prior request.',
    apts: [['Hestía Mar', 'Corner terrace, 300–400 m from the beach'], ['Hestía Thalassa', 'Penthouse with panoramic views and shared spa'], ['Hestía Salinas', 'The largest, with large gardens']],
    pieP1: 'Hestía Your Home: three apartments in Vera Playa (Almería), personally run by Alex and Fran since 2016. Licences VFT/AL/01580, VFT/AL/05535 and VFT/AL/07056.',
    pieNav: '<a href="/">Home</a> · <a href="/noticias.html">News</a> · <a href="/guia-vera/en/">Guide extract</a> · <a href="/reservas.html">Booking</a> · <a href="/opiniones.html">Reviews</a> · <a href="/nosotros.html">About us</a> · <a href="/contacto.html">Contact</a>',
    pieLegal: '<a href="/privacidad.html">Privacy</a> · <a href="/cookies.html">Cookies</a>',
  },
};

export const cabecera = ({ lang, title, desc, canonical, altHref, jsonld, navHref, navLabel, extraCss = '', ogType = 'article' }) => `<!DOCTYPE html>
<html lang="${SHELL[lang].htmlLang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="theme-color" content="#2A0F2E"/>
<title>${esc(title)}</title>
<meta name="robots" content="index, follow"/>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" hreflang="es" href="${lang === 'es' ? canonical : altHref}"/>
<link rel="alternate" hreflang="en" href="${lang === 'en' ? canonical : altHref}"/>
<link rel="alternate" hreflang="x-default" href="${lang === 'es' ? canonical : altHref}"/>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png"/>
<meta property="og:site_name" content="Hestía Your Home"/>
<meta property="og:type" content="${ogType}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${BASE}/assets/og-hestia.jpg"/>
<meta property="og:locale" content="${SHELL[lang].ogLocale}"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>${ESTILO}
${COMUN_CSS}${extraCss}
</style>
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<div class="topbar">
  <div class="wrap">
    <span class="tb-contacto">
      <a href="https://wa.me/34620316370" rel="noopener"><span class="tb-who">Alex</span> +34 620 316 370</a>
      <span class="tb-sep">&middot;</span>
      <a href="https://wa.me/34654138251" rel="noopener"><span class="tb-who">Fran</span> +34 654 138 251</a>
    </span>
    <a class="tb-mail" href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>
  </div>
</div>
<div class="topnav">
  <div class="wrap">
    <a class="brand" href="/">Hestía Your Home</a>
    <nav>
      <a href="${navHref}">${navLabel}</a>
      <a href="/mar.html">${SHELL[lang].navApts}</a>
      <a href="/?acceso=huesped">${SHELL[lang].navAcceso}</a>
      <a class="cta-top" href="/reservas.html">${SHELL[lang].navReserva}</a>
    </nav>
  </div>
</div>`;

export const hero = (lang, h1, intro, eyebrow) => `
<header class="hero">
  <div class="wrap">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(h1)}</h1>
    <p class="intro">${esc(intro)}</p>
  </div>
</header>`;

export const cta = lang => {
  const t = SHELL[lang];
  return `
<div class="cta">
  <span class="cta-ribbon">${esc(t.ctaRibbon)}</span>
  <h2>${esc(t.ctaH2)}</h2>
  <p>${esc(t.ctaP)}</p>
  <div class="apts">
    <a class="vm" href="/mar.html"><b>${esc(t.apts[0][0])}</b><span>${esc(t.apts[0][1])}</span></a>
    <a class="vt" href="/thalassa.html"><b>${esc(t.apts[1][0])}</b><span>${esc(t.apts[1][1])}</span></a>
    <a class="vs" href="/salinas.html"><b>${esc(t.apts[2][0])}</b><span>${esc(t.apts[2][1])}</span></a>
  </div>
</div>`;
};

export const pie = (lang, pieP1) => `
<footer class="pie">
  <p>${pieP1 || SHELL[lang].pieP1}</p>
  <p>${SHELL[lang].pieNav}</p>
  <p>${SHELL[lang].pieLegal}</p>
</footer>
</div>
</body>
</html>
`;

export const migas = (lang, trail) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
export const migasHtml = trail => `<p class="migas">${trail.map(([n, u], i) => i === trail.length - 1 ? esc(n) : `<a href="${u}">${esc(n)}</a>`).join(' › ')}</p>`;


// En las páginas inglesas los enlaces a las páginas principales van a su par /en/.
const TWIN_RE = /href="\/(index|mar|thalassa|salinas|reservas|estancias-largas|opiniones|nosotros|empresas|contacto|normas|noticias)\.html/g;
export const localize = (html, lang) => lang !== 'en' ? html : html
  .replace(TWIN_RE, 'href="/en/$1.html')
  .replace(/href="\/(\?[^"]*)?"/g, (m, q) => `href="/en/${q || ''}"`);
