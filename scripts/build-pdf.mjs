#!/usr/bin/env node
/**
 * scripts/build-pdf.mjs
 *
 * Genera PDFs editoriales (A4) de la Guía del huésped para cada Hestía
 * a partir de los datos en docs/components/apartment-guide.jsx y
 * docs/components/apartment-page.jsx.
 *
 * Output: docs/downloads/Hestia-{Mar|Thalassa|Salinas}-Guia.pdf
 *
 * Uso:
 *   node scripts/build-pdf.mjs            # genera los 3 en español
 *   node scripts/build-pdf.mjs vm         # solo Mar
 *   node scripts/build-pdf.mjs vm en      # Mar en inglés
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import babel from '@babel/core';
import preset from '@babel/preset-react';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const DOCS = join(ROOT, 'docs');
const OUT  = join(DOCS, 'downloads');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------
// 1) Carga de datos: extrae las constantes de los JSX vía Babel + vm
// ---------------------------------------------------------------
function loadGuideData() {
  const guideSrc = readFileSync(join(DOCS, 'components/apartment-guide.jsx'), 'utf8');
  const aptSrc   = readFileSync(join(DOCS, 'components/apartment-page.jsx'),  'utf8');
  // Expone los consts/lets top-level como globalThis para que sobrevivan
  // entre llamadas a runInContext (const en vm aísla por script).
  const exposeTopLevel = (src) => src.replace(/^(const|let) (\w+) = /gm, 'globalThis.$2 = ');
  const transpile = (src) => babel.transformSync(exposeTopLevel(src), {
    presets: [preset],
    babelrc: false,
    configFile: false,
    sourceMaps: false,
    compact: false,
  }).code;

  // Sandbox con stubs mínimos
  const ReactStub = new Proxy(function ReactStub() {}, {
    get(_, key) {
      if (key === 'createElement') return () => null;
      if (key === 'Fragment')      return Symbol('Fragment');
      if (key === 'useState')      return (init) => [typeof init === 'function' ? init() : init, () => {}];
      if (key === 'useEffect')     return () => {};
      if (key === 'useRef')        return () => ({ current: null });
      if (key === 'useCallback')   return (fn) => fn;
      if (key === 'useMemo')       return (fn) => fn();
      return () => null;
    },
  });
  const sandbox = {
    React: ReactStub,
    ReactDOM: { createRoot: () => ({ render: () => {} }), render: () => {} },
    window: {},
    document: {
      addEventListener: () => {},
      createElement: () => ({}),
      getElementById: () => ({}),
    },
    console,
  };
  createContext(sandbox);

  try { runInContext(transpile(guideSrc), sandbox, { filename: 'apartment-guide.jsx' }); }
  catch (e) { console.error('Error evaluando apartment-guide.jsx:', e.message); throw e; }
  try { runInContext(transpile(aptSrc), sandbox, { filename: 'apartment-page.jsx' }); }
  catch (e) { console.error('Error evaluando apartment-page.jsx:', e.message); throw e; }

  return {
    GUIDE_SHARED:    sandbox.GUIDE_SHARED,
    GUIDE_BY_APT:    sandbox.GUIDE_BY_APT,
    ROOM_PHOTOS:     sandbox.ROOM_PHOTOS,
    URB_FALLBACK:    sandbox.URB_FALLBACK,
    CATEGORIES:      sandbox.CATEGORIES,
    PLACES:          sandbox.PLACES,
    DAY_PLAN_GROUPS: sandbox.DAY_PLAN_GROUPS,
    DAY_PLANS:       sandbox.DAY_PLANS,
    GUIDE_SECTIONS:  sandbox.GUIDE_SECTIONS,
    APT_DATA:        sandbox.APT_DATA,
  };
}

// ---------------------------------------------------------------
// 2) Helpers HTML
// ---------------------------------------------------------------
const esc = (s) => (s == null ? '' : String(s)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;'));

const fileUrl = (relPath) => pathToFileURL(join(DOCS, relPath)).href;

// ---------------------------------------------------------------
// 3) CSS de marca + print
// ---------------------------------------------------------------
const CSS = `
@page {
  size: A4 portrait;
  margin: 18mm 16mm 18mm 16mm;
}
@page :first {
  margin: 0;
}
@page cover { margin: 0; }

* { box-sizing: border-box; }

:root {
  --crema:      #FAF6F0;
  --crema-warm: #F6E3C2;
  --crema-dawn: #F2E6CE;
  --ber:        #3D1A35;
  --ber-dk:     #2A0F2E;
  --ber-lt:     #4E2446;
  --teal:       #3AAABB;
  --teal-dk:    #176E80;
  --teal-lt:    #6FC4D1;
  --sol:        #E8C26B;
  --ink:        #2A1A28;
  --ink-soft:   #5B4A57;
  --hair:       rgba(61,26,53,0.12);
  --hair-strong:rgba(61,26,53,0.32);
  --apt-c:      var(--ber);
  --apt-c-dk:   var(--ber-dk);
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--crema);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10.5pt;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ============ Tipografía ============ */
h1, h2, h3, h4 {
  font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
  font-weight: 500;
  color: var(--ber-dk);
  margin: 0 0 12pt;
  line-height: 1.18;
}
h1 { font-size: 36pt; letter-spacing: -0.01em; }
h2 { font-size: 26pt; letter-spacing: -0.005em; }
h3 { font-size: 18pt; }
h4 { font-size: 13pt; font-weight: 600; letter-spacing: 0.02em; }
p { margin: 0 0 9pt; }
em { font-style: italic; color: var(--ber); }
a { color: var(--teal-dk); text-decoration: none; }

.eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 8pt;
}

.subtle { color: var(--ink-soft); }

/* ============ Cover ============ */
.cover {
  page: cover;
  position: relative;
  width: 210mm;
  height: 297mm;
  overflow: hidden;
  break-after: page;
  page-break-after: always;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--ber-dk);
  color: var(--crema);
}
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    rgba(42,15,46,0.20) 0%,
    rgba(42,15,46,0.55) 55%,
    rgba(42,15,46,0.92) 100%);
}
.cover-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 22mm 18mm;
  color: var(--crema);
}
.cover-mark {
  position: absolute;
  top: 18mm;
  left: 18mm;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14pt;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--crema);
}
.cover-mark svg { width: 22px; height: 22px; }
.cover-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 9.5pt;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--crema-warm);
  margin-bottom: 10mm;
  opacity: 0.85;
}
.cover-title {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  font-size: 64pt;
  line-height: 0.96;
  letter-spacing: -0.015em;
  margin: 0 0 8mm;
  color: var(--crema);
}
.cover-title em {
  font-style: italic;
  color: var(--crema-warm);
}
.cover-tagline {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 18pt;
  line-height: 1.35;
  max-width: 120mm;
  color: var(--crema);
  opacity: 0.95;
  margin: 0 0 10mm;
}
.cover-foot {
  position: absolute;
  bottom: 14mm;
  left: 18mm;
  right: 18mm;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--crema-warm);
  opacity: 0.78;
}

/* ============ Sections ============ */
section {
  break-before: page;
  page-break-before: always;
}
section.no-break {
  break-before: auto;
  page-break-before: auto;
}
.section-hd {
  margin-bottom: 16pt;
  padding-bottom: 10pt;
  border-bottom: 1px solid var(--hair);
}
.section-hd .eyebrow { color: var(--apt-c); }
.section-hd h2 { margin-bottom: 0; color: var(--apt-c-dk); }

/* ============ Welcome ============ */
.welcome {
  padding-top: 6mm;
}
.welcome p {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14pt;
  line-height: 1.55;
  color: var(--ber);
  max-width: 150mm;
  margin: 0 0 10pt;
}
.welcome-sign {
  margin-top: 14mm;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 14pt;
  color: var(--ber);
}
.welcome-signer {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 16pt;
  color: var(--ber-dk);
  margin-top: 3pt;
}

/* ============ WiFi card ============ */
.wifi-card {
  margin: 8mm 0 0;
  padding: 14mm 16mm;
  background: linear-gradient(135deg, var(--crema-dawn) 0%, var(--crema-warm) 100%);
  border-radius: 6mm;
  border: 1px solid rgba(232,194,107,0.40);
  break-inside: avoid;
}
.wifi-row { display: flex; align-items: baseline; gap: 14pt; margin-bottom: 8pt; }
.wifi-lbl {
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-soft);
  min-width: 32mm;
}
.wifi-val {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 16pt;
  font-weight: 600;
  color: var(--ber-dk);
  letter-spacing: 0.02em;
}
.wifi-note {
  margin-top: 8mm;
  font-size: 9pt;
  color: var(--ink-soft);
  line-height: 1.55;
}

/* ============ Two-col text ============ */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10mm;
  margin-top: 4mm;
}
.two-col h3 { margin-top: 0; }

/* ============ Room sections ============ */
.room {
  break-before: page;
  page-break-before: always;
}
.room-body {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13pt;
  line-height: 1.55;
  color: var(--ber);
  max-width: 145mm;
  margin-bottom: 8mm;
}
.recs {
  margin-top: 4mm;
  padding-top: 6mm;
  border-top: 1px solid var(--hair);
}
.recs-title {
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: var(--apt-c);
  margin-bottom: 6pt;
}
.recs ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.recs li {
  padding: 4pt 0 4pt 18pt;
  border-bottom: 1px solid var(--hair);
  position: relative;
  font-size: 10pt;
  color: var(--ink);
  line-height: 1.55;
  break-inside: avoid;
}
.recs li:last-child { border-bottom: none; }
.recs li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12pt;
  width: 8pt;
  height: 1px;
  background: var(--apt-c);
}

/* ============ Photo grid ============ */
.photos {
  margin: 6mm 0 0;
}
.photos-grid {
  display: grid;
  gap: 5mm;
}
.photos-grid.cols-2 { grid-template-columns: 1fr 1fr; }
.photos-grid.cols-1 { grid-template-columns: 1fr; }
.photo {
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0;
}
.photo img {
  width: 100%;
  height: 75mm;
  object-fit: cover;
  border-radius: 3mm;
  display: block;
  background: var(--hair);
}
.photo.tall img { height: 105mm; }
.photo figcaption {
  margin-top: 4pt;
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  line-height: 1.4;
}

/* Hero photo (room intro) */
.room-hero {
  margin: 0 0 6mm;
  break-inside: avoid;
}
.room-hero img {
  width: 100%;
  height: 105mm;
  object-fit: cover;
  border-radius: 3mm;
  display: block;
}

/* ============ Rules grid ============ */
.rules-intro {
  margin-bottom: 6mm;
  color: var(--ink-soft);
  font-size: 10.5pt;
  max-width: 150mm;
}
.rules {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4mm 8mm;
  margin-top: 4mm;
}
.rule {
  break-inside: avoid;
  page-break-inside: avoid;
  padding: 4mm 0;
  border-top: 1px solid var(--hair);
}
.rule-hd {
  display: flex;
  align-items: baseline;
  gap: 6pt;
  margin-bottom: 3pt;
}
.rule-icon { font-size: 14pt; }
.rule-title {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  font-weight: 600;
  color: var(--ber-dk);
  letter-spacing: 0.01em;
}
.rule-d {
  margin-left: 22pt;
  font-size: 9pt;
  line-height: 1.5;
  color: var(--ink-soft);
}

/* ============ Categories list ============ */
.cat-block { margin-bottom: 6mm; break-inside: avoid; }
.cat-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14pt;
  font-weight: 600;
  color: var(--ber-dk);
  margin-bottom: 4pt;
  border-bottom: 1px solid var(--hair-strong);
  padding-bottom: 2pt;
}
.cat-items { margin: 0; padding: 0; list-style: none; }
.cat-items li {
  padding: 3pt 0;
  font-size: 9.5pt;
  line-height: 1.55;
  color: var(--ink);
}

/* ============ Restaurants ============ */
.resto-list {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: r;
}
.resto-list li {
  break-inside: avoid;
  page-break-inside: avoid;
  position: relative;
  padding: 6pt 0 6pt 32pt;
  border-bottom: 1px solid var(--hair);
  font-size: 10pt;
  line-height: 1.5;
  color: var(--ink);
}
.resto-list li:last-child { border-bottom: none; }
.resto-list li::before {
  counter-increment: r;
  content: counter(r, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 7pt;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14pt;
  font-weight: 600;
  color: var(--apt-c);
}

/* ============ Sites grid ============ */
.sites-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8mm;
}
.site-col h4 {
  font-size: 10pt;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--apt-c);
  border-bottom: 1px solid var(--hair-strong);
  padding-bottom: 2pt;
  margin-bottom: 4pt;
}
.site-col ul { margin: 0; padding: 0; list-style: none; }
.site-col li {
  padding: 2pt 0;
  font-size: 9pt;
  line-height: 1.45;
  color: var(--ink);
}
.site-col li a { color: var(--ink); }
.site-col li small {
  display: block;
  font-size: 7pt;
  color: var(--ink-soft);
  word-break: break-all;
}

/* ============ Phones ============ */
.phones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 8mm;
}
.phone-row {
  break-inside: avoid;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6pt 0;
  border-bottom: 1px solid var(--hair);
}
.phone-lbl {
  font-size: 10pt;
  color: var(--ink);
}
.phone-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11pt;
  font-weight: 600;
  color: var(--ber-dk);
  letter-spacing: 0.02em;
}

/* ============ Day plan ============ */
.dayplan {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 8mm;
  padding: 5mm 6mm;
  background: rgba(232,194,107,0.08);
  border-left: 3pt solid var(--apt-c);
  border-radius: 0 3mm 3mm 0;
}
.dayplan-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13pt;
  font-weight: 600;
  color: var(--ber-dk);
  margin: 0 0 1mm;
}
.dayplan-meta {
  font-size: 8pt;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 3mm;
}
.dayplan ol {
  margin: 0;
  padding: 0;
  list-style: none;
}
.dayplan li {
  display: flex;
  gap: 8pt;
  padding: 3pt 0;
  font-size: 9.5pt;
  line-height: 1.45;
}
.dayplan-t {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 9pt;
  color: var(--apt-c);
  min-width: 36pt;
}
.dayplan-d {
  font-size: 8.5pt;
  color: var(--ink-soft);
  margin-top: 1pt;
}
.dayplan-tip {
  margin-top: 4mm;
  padding-top: 3mm;
  border-top: 1px dashed var(--hair-strong);
  font-style: italic;
  font-size: 9pt;
  color: var(--ink-soft);
}

/* ============ Closing / back cover ============ */
.closing-quote {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 16pt;
  line-height: 1.45;
  color: var(--ber);
  max-width: 130mm;
  margin: 0 0 8mm;
}

.back-cover {
  page: cover;
  position: relative;
  width: 210mm;
  height: 297mm;
  margin: 0;
  background: var(--ber-dk);
  color: var(--crema);
  break-before: page;
}
.back-cover-inner {
  padding: 30mm 22mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.back-mark {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28pt;
  font-style: italic;
  color: var(--crema-warm);
  margin-bottom: 8mm;
}
.back-meta {
  font-family: 'Inter', sans-serif;
  font-size: 9pt;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--crema-warm);
  opacity: 0.75;
}
.back-meta a { color: var(--crema-warm); }
.back-meta div { margin-bottom: 4pt; }
`;

// ---------------------------------------------------------------
// 4) HTML por sección
// ---------------------------------------------------------------
function renderCover(aptId, lang, aptData, byApt) {
  const guideData = byApt[aptId][lang];
  const heroImg = aptData.gallery_imgs[0] || aptData.hero_img;
  return `
  <div class="cover" style="background-image: url('${fileUrl(heroImg)}')">
    <div class="cover-mark">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <g fill="#F6E3C2">
          <path d="M18 22 L32 22 L32 50 L32 56 L30 62 L30 98 L18 98 Z"/>
          <path d="M88 22 L102 22 L102 98 L90 98 L90 62 L88 56 L88 50 Z"/>
          <rect x="14" y="20" width="22" height="4" rx="1"/>
          <rect x="84" y="20" width="22" height="4" rx="1"/>
          <rect x="14" y="96" width="22" height="4" rx="1"/>
          <rect x="84" y="96" width="22" height="4" rx="1"/>
          <rect x="36" y="56" width="48" height="6" rx="1"/>
        </g>
      </svg>
      Hestía
    </div>
    <div class="cover-content">
      <div class="cover-eyebrow">${esc(lang === 'es' ? 'Guía del huésped · ' : 'Guest guide · ')}${esc(aptData.num)}</div>
      <h1 class="cover-title">Hestía <em>${esc(aptData.name_short)}</em></h1>
      <p class="cover-tagline">${esc(guideData.cover_tagline)}</p>
    </div>
    <div class="cover-foot">
      <span>${esc(aptData.license)}</span>
      <span>${esc(lang === 'es' ? 'Vera Playa · Almería' : 'Vera Playa · Almería, Spain')}</span>
    </div>
  </div>`;
}

function renderWelcome(shared) {
  const w = shared.welcome;
  return `
  <section class="welcome">
    <div class="section-hd">
      <div class="eyebrow">${esc(w.title.split(' ')[0]).toUpperCase()}</div>
      <h2>${esc(w.title)}</h2>
    </div>
    ${w.paras.map(p => `<p>${esc(p)}</p>`).join('\n')}
    <div class="welcome-sign">${esc(w.sign)}</div>
    <div class="welcome-signer">${esc(w.signer)}</div>
  </section>`;
}

function renderWifi(shared) {
  const w = shared.wifi;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(w.title.toUpperCase())}</div>
      <h2>${esc(w.title)}</h2>
    </div>
    <p>${esc(w.intro)}</p>
    <div class="wifi-card">
      <div class="wifi-row">
        <span class="wifi-lbl">${esc(w.ssidLabel)}</span>
        <span class="wifi-val">${esc(w.ssidValue)}</span>
      </div>
      <div class="wifi-row">
        <span class="wifi-lbl">${esc(w.passLabel)}</span>
        <span class="wifi-val">${esc(w.passValue)}</span>
      </div>
      <div class="wifi-note">${esc(w.note)}</div>
    </div>
  </section>`;
}

function renderNameAndWhy(shared) {
  const n = shared.name;
  const w = shared.why;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc((n.title + ' · ' + w.title).toUpperCase())}</div>
      <h2>${esc(n.title)}</h2>
    </div>
    ${n.paras.map(p => `<p style="font-family:'Cormorant Garamond',serif;font-size:13pt;line-height:1.55;color:var(--ber);max-width:150mm">${esc(p)}</p>`).join('\n')}

    <h3 style="margin-top:14mm">${esc(w.title)}</h3>
    ${w.paras.map(p => `<p style="font-family:'Cormorant Garamond',serif;font-size:13pt;line-height:1.55;color:var(--ber);max-width:150mm">${esc(p)}</p>`).join('\n')}
  </section>`;
}

function renderCleaning(shared) {
  const c = shared.cleaning;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(c.title.toUpperCase())}</div>
      <h2>${esc(c.title)}</h2>
    </div>
    <p>${esc(c.intro)}</p>
    <p class="subtle" style="font-size:9.5pt">${esc(c.note)}</p>
    <div class="recs">
      <div class="recs-title">${esc({ es: 'Para que sea perfecto', en: 'To keep it perfect' }[shared.__lang] || 'Para que sea perfecto')}</div>
      <ul>${c.recs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    </div>
  </section>`;
}

function renderRules(shared, lang) {
  const r = shared.rules;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(r.title.toUpperCase())}</div>
      <h2>${esc(r.title)}</h2>
    </div>
    <p class="rules-intro">${esc(r.intro)}</p>
    <div class="rules">
      ${r.items.map(item => `
        <div class="rule">
          <div class="rule-hd">
            <span class="rule-icon">${item.icon}</span>
            <span class="rule-title">${esc(item.t)}</span>
          </div>
          <div class="rule-d">${esc(item.d)}</div>
        </div>`).join('\n')}
    </div>
  </section>`;
}

function renderRoom(room, aptData, roomPhotos, urbFallback, aptId, lang) {
  const photoIdxs = roomPhotos[aptId][room.id] || [];
  const captions = aptData[lang].gallery_captions || [];
  const galleryImgs = aptData.gallery_imgs || [];
  let photos = photoIdxs
    .map(idx => ({ src: galleryImgs[idx], caption: captions[idx] }))
    .filter(p => !!p.src);
  // Fallback urbanización si no hay fotos en la galería
  if (photos.length === 0 && room.id === 'urbanizacion' && urbFallback[aptId]) {
    photos = urbFallback[aptId].map(src => ({ src, caption: '' }));
  }
  const points = room.points || null;
  return `
  <section class="room">
    <div class="section-hd">
      <div class="eyebrow">${esc(room.title.toUpperCase())}</div>
      <h2>${esc(room.title)}</h2>
    </div>

    ${photos[0] ? `
      <figure class="room-hero">
        <img src="${fileUrl(photos[0].src)}" alt=""/>
      </figure>` : ''}

    <p class="room-body">${esc(room.body)}</p>

    ${points ? `
      <ul style="margin:0 0 6mm;padding-left:18pt;font-size:10pt;color:var(--ink);line-height:1.55">
        ${points.map(p => `<li style="padding:2pt 0">${esc(p)}</li>`).join('')}
      </ul>` : ''}

    <div class="recs">
      <div class="recs-title">${esc(lang === 'es' ? 'Recomendaciones' : 'Recommendations')}</div>
      <ul>${room.recs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    </div>

    ${photos.length > 1 ? `
      <div class="photos">
        <div class="photos-grid cols-2">
          ${photos.slice(1).map(p => `
            <figure class="photo">
              <img src="${fileUrl(p.src)}" alt=""/>
              ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}
            </figure>`).join('')}
        </div>
      </div>` : ''}
  </section>`;
}

function renderSurroundings(shared, lang) {
  const s = shared.surroundings;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(s.title.toUpperCase())}</div>
      <h2>${esc(s.title)}</h2>
    </div>
    <p>${esc(s.intro)}</p>
    ${s.sources.map(src => `<p class="subtle" style="font-size:10pt">${esc(src)}</p>`).join('')}

    <h3 style="margin-top:10mm">${esc(lang === 'es' ? 'Lo esencial alrededor' : 'Essentials nearby')}</h3>
    <div class="two-col">
      ${s.categories.map(c => `
        <div class="cat-block">
          <div class="cat-title">${esc(c.title)}</div>
          <ul class="cat-items">${c.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>
        </div>`).join('')}
    </div>

    <h3 style="margin-top:12mm">${esc(s.restaurants_title)}</h3>
    <ol class="resto-list">
      ${s.restaurants.map(r => `<li>${esc(r)}</li>`).join('')}
    </ol>

    <h3 style="margin-top:12mm">${esc(s.sites.title)}</h3>
    <div class="sites-grid">
      ${s.sites.groups.map(g => `
        <div class="site-col">
          <h4>${esc(g.title)}</h4>
          <ul>${g.links.map(l => `
            <li>
              <strong>${esc(l.label)}</strong>
              <small>${esc(l.url.replace(/^https?:\/\//, ''))}</small>
            </li>`).join('')}
          </ul>
        </div>`).join('')}
    </div>
  </section>`;
}

function renderDayPlans(DAY_PLANS, lang) {
  if (!DAY_PLANS || DAY_PLANS.length === 0) return '';
  const fmt = (k) => lang === 'es' ? `title_es` : `title_en`;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(lang === 'es' ? 'ITINERARIOS' : 'ITINERARIES')}</div>
      <h2>${esc(lang === 'es' ? 'Días que podéis vivir' : 'Days you can live')}</h2>
    </div>
    <p class="rules-intro">${esc(lang === 'es'
      ? 'Recorridos pensados para vosotros — adaptables según vuestras ganas. Los horarios son orientativos.'
      : 'Routes built for you — adaptable to your mood. Times are approximate.')}</p>
    ${DAY_PLANS.map(plan => {
      const title = plan[`title_${lang}`] || plan.title_es;
      const tags  = plan[`tags_${lang}`] || plan.tags_es || [];
      const tip   = plan[`tip_${lang}`] || plan.tip_es;
      const steps = plan.steps || [];
      const meta = [
        plan.start && `${plan.start} – ${plan.end || ''}`,
        ...tags,
      ].filter(Boolean).join(' · ');
      return `
        <div class="dayplan">
          <div class="dayplan-title">${esc(title)}</div>
          <div class="dayplan-meta">${esc(meta)}</div>
          <ol>
            ${steps.map(s => {
              const txt  = s[lang] || s.es;
              const desc = s[`d_${lang}`] || s.d_es;
              return `
              <li>
                <span class="dayplan-t">${esc(s.t || '')}</span>
                <span>
                  <strong>${esc(txt || '')}</strong>
                  ${desc ? `<div class="dayplan-d">${esc(desc)}</div>` : ''}
                </span>
              </li>`;
            }).join('')}
          </ol>
          ${tip ? `<div class="dayplan-tip">💡 ${esc(tip)}</div>` : ''}
        </div>`;
    }).join('\n')}
  </section>`;
}

function renderPhones(shared) {
  const p = shared.phones;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(p.title.toUpperCase())}</div>
      <h2>${esc(p.title)}</h2>
    </div>
    <div class="phones-grid">
      ${p.list.map(it => `
        <div class="phone-row">
          <span class="phone-lbl">${esc(it.label)}</span>
          <span class="phone-val">${esc(it.value)}</span>
        </div>`).join('')}
    </div>
  </section>`;
}

function renderFeedback(shared, lang) {
  const f = shared.feedback;
  return `
  <section>
    <div class="section-hd">
      <div class="eyebrow">${esc(f.title.toUpperCase())}</div>
      <h2>${esc(f.title)}</h2>
    </div>
    ${f.paras.map(p => `<p class="closing-quote">${esc(p)}</p>`).join('')}
  </section>`;
}

function renderBackCover(aptData, lang) {
  return `
  <div class="back-cover">
    <div class="back-cover-inner">
      <div>
        <div class="back-mark">Hestía</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:30pt;line-height:1.1;color:var(--crema)">
          ${esc(lang === 'es' ? 'Gracias por elegirnos.' : 'Thank you for choosing us.')}
        </div>
        <div style="margin-top:6mm;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14pt;color:var(--crema-warm);opacity:0.85;max-width:140mm">
          ${esc(lang === 'es'
            ? 'No es un alquiler. Es tu hogar durante tu estancia — y un hogar que cuidas para quien venga después.'
            : 'It’s not a rental. It’s your home during your stay — and a home you care for, for whoever comes next.')}
        </div>
      </div>
      <div class="back-meta">
        <div>hestiayourhome.com</div>
        <div>info@hestiayourhome.com</div>
        <div>+34 620 316 370 · +34 654 138 251</div>
        <div style="margin-top:8mm">${esc(aptData.license)} · ${esc(aptData[lang].name)}</div>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------
// 5) Compose HTML completo
// ---------------------------------------------------------------
function buildHTML(aptId, lang, data) {
  const apt = data.APT_DATA[aptId];
  const guide = data.GUIDE_BY_APT[aptId];
  const shared = { ...data.GUIDE_SHARED[lang], __lang: lang };
  const aptName = apt[lang].name;
  const aptAccent = apt.accent_dk || apt.accent || '#3D1A35';
  const aptAccentLight = apt.accent || '#4E2446';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>${esc(aptName)} · ${esc(lang === 'es' ? 'Guía' : 'Guide')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>${CSS}
:root { --apt-c: ${aptAccentLight}; --apt-c-dk: ${aptAccent}; }
</style>
</head>
<body>
${renderCover(aptId, lang, apt, data.GUIDE_BY_APT)}
${renderWelcome(shared)}
${renderWifi(shared)}
${renderNameAndWhy(shared)}
${renderCleaning(shared)}
${renderRules(shared, lang)}
${guide[lang].rooms.map(room =>
  renderRoom(room, apt, data.ROOM_PHOTOS, data.URB_FALLBACK, aptId, lang)
).join('\n')}
${renderSurroundings(shared, lang)}
${renderDayPlans(data.DAY_PLANS, lang)}
${renderPhones(shared)}
${renderFeedback(shared, lang)}
${renderBackCover(apt, lang)}
</body>
</html>`;
}

// ---------------------------------------------------------------
// 6) Run Playwright → PDF
// ---------------------------------------------------------------
async function generate(aptId, lang, data) {
  const apt = data.APT_DATA[aptId];
  const slug = apt.name_short;
  const fname = `Hestia-${slug}-Guia${lang === 'en' ? '-EN' : ''}.pdf`;
  const outPath = join(OUT, fname);
  const html = buildHTML(aptId, lang, data);

  // Escribe el HTML a un temp dentro de docs/ (file:// puede resolver
  // URLs file:// de imágenes en el mismo origen). Borramos al final.
  const htmlPath = join(OUT, `.build-${aptId}-${lang}.html`);
  writeFileSync(htmlPath, html);

  console.log(`→ ${apt[lang].name} (${lang}) · ${(html.length / 1024).toFixed(0)} KB HTML`);

  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  // Asegúrate de que las fuentes y las imágenes están listas
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map(img => img.complete
      ? Promise.resolve()
      : new Promise(r => { img.onload = img.onerror = r; })));
  });

    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
    try { await import('node:fs').then(m => m.promises.unlink(htmlPath)); } catch (_) {}
  }

  const { size } = await import('node:fs').then(m => m.promises.stat(outPath));
  console.log(`   ✓ ${fname} · ${(size / 1024 / 1024).toFixed(2)} MB → ${outPath}`);
  return outPath;
}

// ---------------------------------------------------------------
// 7) CLI
// ---------------------------------------------------------------
const args = process.argv.slice(2);
const aptArg = args[0];
const langArg = args[1] || 'es';
const apts = aptArg ? [aptArg] : ['vm', 'vt', 'vs'];

(async () => {
  console.log('Cargando datos de guías…');
  const data = loadGuideData();
  console.log('Datos cargados. Generando PDFs…\n');

  for (const apt of apts) {
    await generate(apt, langArg, data);
  }
  console.log('\n✓ Hecho.');
})().catch(e => {
  console.error('\n✗ Error:', e);
  process.exit(1);
});
