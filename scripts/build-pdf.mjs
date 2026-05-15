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
// Marca: SVG inline del logo Hestía (dos columnas H + ola/hoja)
// Usado en cover, contraportada, headers de página y watermark.
// ---------------------------------------------------------------
const logoSVG = (color = 'currentColor', includeWaves = true) => `
<svg viewBox="0 0 120 120" aria-hidden="true">
  <g fill="${color}">
    <path d="M18 22 L32 22 L32 50 L32 56 L30 62 L30 98 L18 98 Z"/>
    <path d="M88 22 L102 22 L102 98 L90 98 L90 62 L88 56 L88 50 Z"/>
    <rect x="14" y="20" width="22" height="4" rx="1"/>
    <rect x="84" y="20" width="22" height="4" rx="1"/>
    <rect x="14" y="96" width="22" height="4" rx="1"/>
    <rect x="84" y="96" width="22" height="4" rx="1"/>
    <rect x="36" y="56" width="48" height="6" rx="1"/>
  </g>
  ${includeWaves ? `
  <path d="M32 58 C 44 42, 60 42, 60 56 C 60 46, 78 46, 90 62"
        fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
  <path d="M32 66 C 46 52, 60 52, 60 64 C 60 54, 76 54, 90 70"
        fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>` : ''}
</svg>`;

// Watermark badge para fotos: caja oscura con logo blanco translúcido
const watermarkBadge = () => `
<div class="wm-badge" aria-hidden="true">${logoSVG('#FAF6F0', false)}</div>`;

// Cinta de sección — sello de marca + nombre de Hestía en el top
// de cada sección. Aparece una vez por sección (~una por página).
const sectionMark = (aptData, lang) =>
  `<div class="sect-mark">
    <div class="sect-mark-logo">${logoSVG('var(--apt-c-dk)', false)}</div>
    <div class="sect-mark-text">
      <span class="sect-mark-name">Hestía · ${esc(aptData.name_short)}</span>
      <span class="sect-mark-meta">${esc(lang === 'es' ? 'Guía del huésped' : 'Guest guide')} · ${esc(aptData.num)}</span>
    </div>
    <div class="sect-mark-rule"></div>
  </div>`;

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
  background: #FFFFFF;
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

/* Sello de marca al inicio de cada sección. Layout horizontal:
   logo + nombre Hestía a la izquierda, meta a la derecha, regla
   en color del acento de la Hestía debajo. Sin fondos pesados. */
.sect-mark {
  display: flex;
  align-items: center;
  gap: 8pt;
  margin: 0 0 14pt;
  padding-bottom: 6pt;
  position: relative;
}
.sect-mark-logo {
  width: 14pt;
  height: 14pt;
  display: flex;
  align-items: center;
}
.sect-mark-logo svg { width: 100%; height: 100%; }
.sect-mark-text {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 10pt;
}
.sect-mark-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 11pt;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--apt-c-dk);
}
.sect-mark-meta {
  font-family: 'Inter', sans-serif;
  font-size: 7.5pt;
  font-weight: 600;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-left: auto;
}
.sect-mark-rule {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1.5pt;
  background: linear-gradient(90deg, var(--apt-c) 0%, var(--apt-c) 22mm, transparent 22mm);
}

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
.welcome-photo {
  margin: 14mm 0 0;
  break-inside: avoid;
}
.welcome-photo img {
  width: 100%;
  height: 95mm;
  object-fit: cover;
  border-radius: 8mm 0 8mm 0;
  display: block;
}
.wifi-photo {
  margin: 12mm 0 0;
  break-inside: avoid;
}
.wifi-photo img {
  width: 100%;
  height: 95mm;
  object-fit: cover;
  border-radius: 8mm 0 8mm 0;
  display: block;
}

/* ============ WiFi card ============ */
/* Versión print-friendly: sin fondo de color, solo borde fino con
   acento de la Hestía. Marca visible sin gastar tinta de fondo. */
.wifi-card {
  margin: 8mm 0 0;
  padding: 12mm 14mm;
  background: transparent;
  border-radius: 8mm 0 8mm 0;
  border: 1.5pt solid var(--apt-c);
  break-inside: avoid;
  position: relative;
}
.wifi-card::before {
  content: '';
  position: absolute;
  top: -1pt;
  left: -1pt;
  width: 18mm;
  height: 6pt;
  background: var(--apt-c);
  border-radius: 8mm 0 0 0;
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
  break-inside: avoid;
  page-break-inside: avoid;
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
/* Firma de marca: border-radius asimétrico 10px 0 10px 0
   (escalado a mm para A4) — esquinas top-left y bottom-right
   redondeadas, las otras dos rectas. */
.photos {
  margin: 8mm 0 0;
}
.photos-page {
  break-before: page;
  page-break-before: always;
  margin: 0;
}
.photos-page-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--apt-c);
  margin-bottom: 7mm;
}
/* Fotos de galería con altura fija para llenar el A4 sin huecos.
   - cols-2 (3-4 fotos en 2x2): cada foto ~115mm de alto
   - cols-1 con 2 fotos: 115mm cada una, stacked
   - cols-1 con 1 foto: gran panorámica 190mm */
.photos-page .photos-grid.cols-2 .photo img {
  aspect-ratio: auto;
  height: 115mm;
}
.photos-page .photos-grid.cols-1 .photo img {
  aspect-ratio: auto;
  height: 115mm;
}
.photos-page .photos-grid.cols-1.single .photo img {
  height: 190mm;
}
/* Trío: 2 fotos arriba + 1 abajo a ancho completo */
.photos-page .photos-grid.trio .photo:nth-child(3) {
  grid-column: 1 / -1;
}
.photos-page .photos-grid.trio .photo:nth-child(3) img {
  height: 95mm;
}
.photos-grid {
  display: grid;
  gap: 6mm;
}
.photos-grid.cols-2 { grid-template-columns: 1fr 1fr; }
.photos-grid.cols-1 { grid-template-columns: 1fr; }
.photo {
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0;
  position: relative;
}
.photo img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 5mm 0 5mm 0;
  display: block;
  background: var(--hair);
}

/* Marca de agua sobre cada foto: caja oscura con logo blanco
   translúcido en la esquina inferior derecha. Firma de marca
   en cada imagen del PDF — igual concepto que la web. */
.wm-badge {
  position: absolute;
  bottom: 6pt;
  right: 6pt;
  width: 22pt;
  height: 22pt;
  background: rgba(42,15,46,0.55);
  border-radius: 3mm 0 3mm 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3pt;
  pointer-events: none;
}
.wm-badge svg {
  width: 100%;
  height: 100%;
  opacity: 0.85;
}
.room-hero .wm-badge,
.welcome-photo .wm-badge,
.wifi-photo .wm-badge {
  width: 28pt;
  height: 28pt;
  bottom: 8pt;
  right: 8pt;
}
.photos-grid.cols-1 .photo img {
  aspect-ratio: 16 / 9;
  border-radius: 7mm 0 7mm 0;
}
.photo figcaption {
  margin-top: 4pt;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 10pt;
  letter-spacing: 0.01em;
  color: var(--ink-soft);
  line-height: 1.45;
}

.room-points {
  margin: 0 0 6mm;
  padding: 0;
  list-style: none;
}
.room-points li {
  padding: 4pt 0 4pt 14pt;
  position: relative;
  font-size: 10pt;
  line-height: 1.5;
  color: var(--ink);
  border-bottom: 1px solid var(--hair);
}
.room-points li::before {
  content: '·';
  position: absolute;
  left: 0;
  top: 2pt;
  color: var(--apt-c);
  font-weight: 700;
  font-size: 14pt;
  line-height: 1;
}

/* Hero photo (room intro) — más grande, marca asimétrica */
.room-hero {
  margin: 0 0 7mm;
  break-inside: avoid;
}
.room-hero img {
  width: 100%;
  height: 115mm;
  object-fit: cover;
  border-radius: 8mm 0 8mm 0;
  display: block;
}
.room-hero figcaption {
  margin-top: 6pt;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 11pt;
  color: var(--ink-soft);
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
/* Print-friendly: sin fondo, solo borde fino con accent. */
.cat-block {
  margin-bottom: 6mm;
  break-inside: avoid;
  padding: 5mm 6mm;
  border: 0.8pt solid color-mix(in srgb, var(--apt-c) 32%, transparent);
  border-radius: 6mm 0 6mm 0;
  background: transparent;
}
.cat-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14pt;
  font-weight: 600;
  color: var(--apt-c-dk);
  margin-bottom: 5pt;
  padding-bottom: 3pt;
  border-bottom: 1px solid color-mix(in srgb, var(--apt-c) 25%, transparent);
}
.cat-items { margin: 0; padding: 0; list-style: none; }
.cat-items li {
  padding: 3pt 0;
  font-size: 9.5pt;
  line-height: 1.55;
  color: var(--ink);
  padding-left: 12pt;
  position: relative;
}
.cat-items li::before {
  content: '·';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--apt-c);
  font-weight: 700;
  font-size: 14pt;
  line-height: 1.2;
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
/* Print-friendly: sin fondo de color, borde + acento a la izquierda */
.dayplan {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 8mm;
  padding: 5mm 7mm;
  background: transparent;
  border: 0.8pt solid color-mix(in srgb, var(--apt-c) 30%, transparent);
  border-left: 3pt solid var(--apt-c);
  border-radius: 6mm 0 6mm 0;
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

/* ============ Por qué Hestía ============ */
.porque .section-hd h2 { font-size: 28pt; }
.porque-sub {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 14pt;
  color: var(--ber);
  margin-top: 4pt;
}
.porque-origin,
.porque-values,
.porque-traveler {
  break-inside: avoid-page;
  margin-top: 10mm;
}
.porque-origin .eyebrow,
.porque-values .eyebrow,
.porque-traveler .eyebrow {
  color: var(--apt-c);
  font-size: 9pt;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.porque-h3 {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: 20pt;
  line-height: 1.18;
  color: var(--ber-dk);
  margin: 4pt 0 8pt;
  max-width: 150mm;
}
.porque-p {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13pt;
  line-height: 1.55;
  color: var(--ber);
  max-width: 150mm;
  margin: 0 0 8pt;
}
.porque-quote {
  margin: 10mm 0 0;
  padding: 0 0 0 8mm;
  border-left: 2pt solid var(--apt-c);
  break-inside: avoid;
}
.porque-quote p {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 16pt;
  line-height: 1.45;
  color: var(--ber-dk);
  margin: 0 0 4pt;
}
.porque-quote-attr {
  font-family: 'Inter', sans-serif;
  font-size: 9pt;
  letter-spacing: 0.10em;
  color: var(--ink-soft);
}
.porque-closing {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 14pt;
  color: var(--apt-c-dk);
  margin: 8mm 0 0;
  text-align: center;
}

/* HESTIA letters — H E S T I A */
.hestia-letters {
  display: grid;
  gap: 5mm;
  margin: 7mm 0 0;
}
.hestia-letter {
  break-inside: avoid;
  display: grid;
  grid-template-columns: 32pt 1fr;
  gap: 10pt;
  align-items: start;
  padding: 4mm 0;
  border-top: 0.6pt solid var(--hair);
}
.hl-letter {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34pt;
  font-weight: 500;
  line-height: 1;
  color: var(--apt-c);
}
.hl-name {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ber-dk);
  margin-bottom: 3pt;
}
.hl-desc {
  font-family: 'Cormorant Garamond', serif;
  font-size: 12pt;
  line-height: 1.5;
  color: var(--ink);
}

.traveler-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6mm;
  margin-top: 6mm;
}
.traveler-card {
  break-inside: avoid;
  padding: 4mm 4mm;
  border: 0.8pt solid color-mix(in srgb, var(--apt-c) 30%, transparent);
  border-radius: 5mm 0 5mm 0;
}
.traveler-icon {
  font-size: 22pt;
  margin-bottom: 3pt;
}
.traveler-t {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13pt;
  font-weight: 500;
  color: var(--ber-dk);
  margin-bottom: 3pt;
  line-height: 1.25;
}
.traveler-d {
  font-size: 9pt;
  line-height: 1.45;
  color: var(--ink-soft);
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
  // Cover photo: el mismo hero que abre la página de cada Hestía en la web
  const heroImg = aptData.hero_img || aptData.gallery_imgs[0];
  return `
  <div class="cover" style="background-image: url('${fileUrl(heroImg)}')">
    <div class="cover-mark">
      ${logoSVG('#F6E3C2')}
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

function renderWelcome(shared, aptData, lang) {
  const w = shared.welcome;
  const photo = aptData.gallery_imgs[11] || aptData.gallery_imgs[0];
  return `
  <section class="welcome">
    ${sectionMark(aptData, lang)}
    <div class="section-hd">
      <div class="eyebrow">${esc(w.title.split(' ')[0]).toUpperCase()}</div>
      <h2>${esc(w.title)}</h2>
    </div>
    ${w.paras.map(p => `<p>${esc(p)}</p>`).join('\n')}
    <div class="welcome-sign">${esc(w.sign)}</div>
    <div class="welcome-signer">${esc(w.signer)}</div>
    ${photo ? `
      <figure class="welcome-photo">
        <img src="${fileUrl(photo)}" alt=""/>
        ${watermarkBadge()}
      </figure>` : ''}
  </section>`;
}

function renderWifi(shared, aptData, lang) {
  const w = shared.wifi;
  const photo = aptData.gallery_imgs[1] || aptData.gallery_imgs[0];
  return `
  <section>
    ${sectionMark(aptData, lang)}
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
    ${photo ? `
      <figure class="wifi-photo">
        <img src="${fileUrl(photo)}" alt=""/>
        ${watermarkBadge()}
      </figure>` : ''}
  </section>`;
}

function renderNameAndWhy(shared, aptData, lang) {
  const n = shared.name;
  const w = shared.why;
  return `
  <section>
    ${sectionMark(aptData, lang)}
    <div class="section-hd">
      <div class="eyebrow">${esc((n.title + ' · ' + w.title).toUpperCase())}</div>
      <h2>${esc(n.title)}</h2>
    </div>
    ${n.paras.map(p => `<p style="font-family:'Cormorant Garamond',serif;font-size:13pt;line-height:1.55;color:var(--ber);max-width:150mm">${esc(p)}</p>`).join('\n')}

    <h3 style="margin-top:14mm">${esc(w.title)}</h3>
    ${w.paras.map(p => `<p style="font-family:'Cormorant Garamond',serif;font-size:13pt;line-height:1.55;color:var(--ber);max-width:150mm">${esc(p)}</p>`).join('\n')}
  </section>`;
}

function renderCleaning(shared, aptData, lang) {
  const c = shared.cleaning;
  return `
  <section>
    ${sectionMark(aptData, lang)}
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

function renderRules(shared, aptData, lang) {
  const r = shared.rules;
  return `
  <section>
    ${sectionMark(aptData, lang)}
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
  if (photos.length === 0 && room.id === 'urbanizacion' && urbFallback[aptId]) {
    photos = urbFallback[aptId].map(src => ({ src, caption: '' }));
  }
  const points = room.points || null;
  const hero = photos[0];
  const rest = photos.slice(1);

  // Galería: si hay restos, los repartimos en filas de 2 fotos
  // por página. La primera página tiene hero + body + recs +
  // (si caben) 2 fotos del grid. Las siguientes son full-grid.
  const firstPagePhotos = rest.slice(0, 0);          // primera página: solo hero+texto (más respirado)
  const galleryPhotos   = rest;                       // resto en página(s) de galería

  return `
  <section class="room">
    ${sectionMark(aptData, lang)}
    <div class="section-hd">
      <div class="eyebrow">${esc(room.title.toUpperCase())}</div>
      <h2>${esc(room.title)}</h2>
    </div>

    ${hero ? `
      <figure class="room-hero">
        <img src="${fileUrl(hero.src)}" alt=""/>
        ${watermarkBadge()}
        ${hero.caption ? `<figcaption>${esc(hero.caption)}</figcaption>` : ''}
      </figure>` : ''}

    <p class="room-body">${esc(room.body)}</p>

    ${points ? `
      <ul class="room-points">
        ${points.map(p => `<li>${esc(p)}</li>`).join('')}
      </ul>` : ''}

    <div class="recs">
      <div class="recs-title">${esc(lang === 'es' ? 'Recomendaciones' : 'Recommendations')}</div>
      <ul>${room.recs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    </div>

    ${galleryPhotos.length > 0 ? renderRoomGallery(galleryPhotos, room, lang) : ''}
  </section>`;
}

// Galería de fotos de una estancia: rompe a página nueva y reparte
// las fotos en filas de 2 o 1 según cuántas haya, ocupando el ancho
// completo de la página A4 para que no quede espacio vacío.
function renderRoomGallery(photos, room, lang) {
  const n = photos.length;
  // Agrupamos por bloques de hasta 4 fotos por página (2x2)
  const pages = [];
  for (let i = 0; i < n; i += 4) pages.push(photos.slice(i, i + 4));

  return pages.map((pagePhotos, pi) => {
    // 1 foto → panorámica grande; 2 fotos → 1 col stacked;
    // 3 fotos → 2x2 con la tercera span 2 cols; 4 fotos → 2x2
    let cols;
    if (pagePhotos.length === 1)      cols = 'cols-1 single';
    else if (pagePhotos.length === 2) cols = 'cols-1';
    else if (pagePhotos.length === 3) cols = 'cols-2 trio';
    else                              cols = 'cols-2';
    return `
    <div class="photos photos-page">
      <div class="photos-page-eyebrow">${esc(lang === 'es' ? 'Galería' : 'Gallery')} · ${esc(room.title.toLowerCase())}</div>
      <div class="photos-grid ${cols}">
        ${pagePhotos.map(p => `
          <figure class="photo">
            <img src="${fileUrl(p.src)}" alt=""/>
            ${watermarkBadge()}
            ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}
          </figure>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function renderSurroundings(shared, aptData, lang) {
  const s = shared.surroundings;
  return `
  <section>
    ${sectionMark(aptData, lang)}
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

function renderDayPlans(DAY_PLANS, aptData, lang) {
  if (!DAY_PLANS || DAY_PLANS.length === 0) return '';
  return `
  <section>
    ${sectionMark(aptData, lang)}
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

function renderPhones(shared, aptData, lang) {
  const p = shared.phones;
  return `
  <section>
    ${sectionMark(aptData, lang)}
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

function renderFeedback(shared, aptData, lang) {
  const f = shared.feedback;
  const photo = aptData.gallery_imgs[12] || aptData.gallery_imgs[3] || aptData.gallery_imgs[0];
  return `
  <section>
    ${sectionMark(aptData, lang)}
    <div class="section-hd">
      <div class="eyebrow">${esc(f.title.toUpperCase())}</div>
      <h2>${esc(f.title)}</h2>
    </div>
    ${f.paras.map(p => `<p class="closing-quote">${esc(p)}</p>`).join('')}
    ${photo ? `
      <figure class="welcome-photo">
        <img src="${fileUrl(photo)}" alt=""/>
        ${watermarkBadge()}
      </figure>` : ''}
  </section>`;
}

// ---------------------------------------------------------------
// Por qué Hestía — contenido extraído de porque-hestia-page.jsx
// ---------------------------------------------------------------
const PORQUE_PDF = {
  es: {
    eyebrow: 'La idea detrás de Hestía',
    title: 'Por qué creamos Hestía',
    subtitle: 'Y por qué se llama así.',
    origin_eyebrow: 'EL ORIGEN',
    origin_title: 'No empezó como un negocio. Empezó como una convicción.',
    origin_paras: [
      '2016. Alex y Fran tienen tres viviendas en Vera Playa. Podrían haberlas puesto en una plataforma, cobrado la comisión y desconectado el teléfono. Lo contrario es más difícil y más lento — y es exactamente lo que decidieron hacer.',
      'Hestía nació de una pregunta: ¿qué pasaría si el alquiler de vacaciones que usas te hiciera sentir en casa de verdad? No solo limpio y funcional. En casa — con historia, con carácter, con alguien al otro lado que sabe tu nombre.',
      'Un ingeniero informático y un filólogo clásico con décadas en Vera Playa. El uno observa y construye; el otro nombra y cuida. Juntos transformaron tres viviendas en los tres — tres hogares con alma propia. Sin oficina. Sin recepción. Con el teléfono siempre encendido.',
    ],
    origin_quote: 'Lo más difícil no fue crear Hestía. Fue convencernos de que merecía la pena intentarlo de otra manera.',
    origin_quote_attr: '— Alex Berruezo',
    values_eyebrow: 'NUESTROS VALORES',
    values_title: 'HESTIA · seis maneras de habitarla',
    values_lede: 'El nombre que recibimos de la diosa griega no es solo símbolo: es una guía. Cada letra de Hestía nombra un valor que practicamos a diario. Seis ideas que se suman en una sola: la confianza.',
    values: [
      { letter: 'H', name: 'Hospitalidad', desc: 'La llama que recibe. Hestía es la diosa del hogar y guarda el fuego de bienvenida — el que se honra al partir y al volver. Tu estancia empieza el día que reservas y no termina cuando te marchas: termina el día que quieres volver.' },
      { letter: 'E', name: 'Escucha',      desc: 'Personas, no clientes. Alex en español, Fran en inglés. Conocemos tu nombre antes de que cruces la puerta y sabemos lo que necesitas — porque nos lo cuentas y porque escuchamos. Sin formularios. Sin intermediarios.' },
      { letter: 'S', name: 'Sencillez',    desc: 'Sin recepción. Sin oficina. Lo esencial hecho con cuidado: tres llaves, tres casas, dos personas al teléfono. Lo demás sobra.' },
      { letter: 'T', name: 'Transparencia', desc: 'Sin letra pequeña. Precios claros, fotos reales, distancias medidas en metros. Si algo no está, lo decimos. Si algo se rompe, lo arreglamos. Lo que ves es lo que hay.' },
      { letter: 'I', name: 'Integridad',   desc: 'Lo que prometemos al reservar es lo que entregamos al abrir la puerta. Diseñamos cada Hestía como si fuera nuestra propia casa — porque, en cierto modo, lo es. El cojín bien puesto, el café que espera, la toalla doblada: el detalle que lo cambia todo.' },
      { letter: 'A', name: 'Arraigo',      desc: 'No inventamos nada. Hestía huele a sal, a olivar, a calima del Sahara. Llevamos décadas en Vera Playa y eso es lo que entregamos: no un decorado, sino el sitio real.' },
    ],
    values_closing: 'Seis valores que se suman en uno: la confianza.',
    traveler_eyebrow: 'EL HUÉSPED QUE NOS ELIGE',
    traveler_title: 'Sabemos para quién existe Hestía',
    traveler_intro: 'Hay un tipo de huésped que no viene solo a descansar. Trae consigo el cuidado, la curiosidad y las ganas de que el lugar que visita siga siendo lo que es. Cuida lo que usa, respeta lo que comparte y deja el destino un poco mejor de como lo encontró. Para ese huésped existe Hestía.',
    travelers: [
      { icon: '🏡', t: 'Cuida lo que usa como si fuera suyo.', d: 'El Hestía que deja está tan bien como lo encontró. Sabe que el siguiente huésped también lo merece.' },
      { icon: '🌿', t: 'No solo está: contribuye.',           d: 'Recomienda el bar de toda la vida, respeta el silencio de la tarde, deja el entorno mejor de como lo encontró.' },
      { icon: '🔄', t: 'Vuelve. Y trae a alguien.',          d: 'Cuando encuentra un lugar donde se ha sentido en casa, vuelve. Y convierte a otros en huéspedes colaborativos.' },
    ],
  },
  en: {
    eyebrow: 'The idea behind Hestía',
    title: 'Why we created Hestía',
    subtitle: 'And why it has this name.',
    origin_eyebrow: 'THE ORIGIN',
    origin_title: "It didn't start as a business. It started as a conviction.",
    origin_paras: [
      '2016. Alex and Fran have three properties in Vera Playa. They could have listed them on a platform, collected the commission and switched the phone off. The opposite is harder and slower — and that is exactly what they decided to do.',
      'Hestía was born from a question: what if the holiday rental you book actually made you feel at home? Not just clean and functional. At home — with a history, with character, with someone on the other end who knows your name.',
      'A computer engineer and a classical philologist with decades in Vera Playa. One observes and builds; the other names and cares. Together they turned three properties into the three Hestías — three homes with their own soul. No office. No reception desk. With the phone always on.',
    ],
    origin_quote: 'The hardest part was not creating Hestía. It was convincing ourselves it was worth trying a different way.',
    origin_quote_attr: '— Alex Berruezo',
    values_eyebrow: 'OUR VALUES',
    values_title: 'HESTIA · six ways to inhabit it',
    values_lede: 'The name we received from the Greek goddess is not only a symbol: it is a guide. Every letter of Hestía names a value we practice every day. Six ideas that add up to one: trust.',
    values: [
      { letter: 'H', name: 'Hospitality',  desc: 'The flame that welcomes. Hestía is the goddess of the hearth — keeper of the fire honoured when leaving and returning. Your stay begins the day you book and does not end when you leave: it ends the day you want to come back.' },
      { letter: 'E', name: 'Empathy',      desc: 'People, not clients. Alex in Spanish, Fran in English. We know your name before you cross the door and what you need — because you tell us, and because we listen. No forms. No intermediaries.' },
      { letter: 'S', name: 'Simplicity',   desc: 'No reception. No office. The essentials done with care: three keys, three homes, two people on the phone. Anything more is in the way.' },
      { letter: 'T', name: 'Transparency', desc: 'No small print. Clear prices, real photos, distances measured in metres. If something is missing, we say so. If something breaks, we fix it. What you see is what is there.' },
      { letter: 'I', name: 'Integrity',    desc: 'What we promise at booking is what we hand over when the door opens. We design every Hestía as if it were our own home — because in a way it is. The neatly placed cushion, the waiting coffee, the folded towel: the detail that changes everything.' },
      { letter: 'A', name: 'Authenticity', desc: 'We invented nothing. Hestía smells of salt, olive grove, Saharan calima. We have been in Vera Playa for decades — and that is what we hand over: not a stage set, but the real place.' },
    ],
    values_closing: 'Six values that add up to one: trust.',
    traveler_eyebrow: 'THE GUEST WHO CHOOSES US',
    traveler_title: 'We know who Hestía exists for',
    traveler_intro: "There is a type of guest who doesn't come just to rest. They bring care, curiosity and a genuine wish to leave the place a little better than they found it. They look after what they use, respect what they share, and make the destination better every day. Hestía exists for that guest.",
    travelers: [
      { icon: '🏡', t: 'Cares for what they use as if it were theirs.', d: 'The Hestía they leave is as good as they found it. They know the next guest deserves the same.' },
      { icon: '🌿', t: "They don't just stay: they contribute.",        d: 'They recommend the local bar, respect the quiet of the afternoon, leave their surroundings better than they found them.' },
      { icon: '🔄', t: 'They come back. And bring someone.',           d: "When they find a place where they felt at home, they return — and turn others into collaborative guests too." },
    ],
  },
};

function renderPorque(aptData, lang) {
  const p = PORQUE_PDF[lang];
  return `
  <section class="porque">
    ${sectionMark(aptData, lang)}
    <div class="section-hd">
      <div class="eyebrow">${esc(p.eyebrow.toUpperCase())}</div>
      <h2>${esc(p.title)}</h2>
      <div class="porque-sub">${esc(p.subtitle)}</div>
    </div>

    <div class="porque-origin">
      <div class="eyebrow">${esc(p.origin_eyebrow)}</div>
      <h3 class="porque-h3">${esc(p.origin_title)}</h3>
      ${p.origin_paras.map(par => `<p class="porque-p">${esc(par)}</p>`).join('')}
      <blockquote class="porque-quote">
        <p>${esc(p.origin_quote)}</p>
        <div class="porque-quote-attr">${esc(p.origin_quote_attr)}</div>
      </blockquote>
    </div>

    <div class="porque-values">
      <div class="eyebrow">${esc(p.values_eyebrow)}</div>
      <h3 class="porque-h3">${esc(p.values_title)}</h3>
      <p class="porque-p">${esc(p.values_lede)}</p>
      <div class="hestia-letters">
        ${p.values.map(v => `
          <div class="hestia-letter">
            <span class="hl-letter">${esc(v.letter)}</span>
            <div class="hl-body">
              <div class="hl-name">${esc(v.name)}</div>
              <div class="hl-desc">${esc(v.desc)}</div>
            </div>
          </div>`).join('')}
      </div>
      <p class="porque-closing">${esc(p.values_closing)}</p>
    </div>

    <div class="porque-traveler">
      <div class="eyebrow">${esc(p.traveler_eyebrow)}</div>
      <h3 class="porque-h3">${esc(p.traveler_title)}</h3>
      <p class="porque-p">${esc(p.traveler_intro)}</p>
      <div class="traveler-grid">
        ${p.travelers.map(t => `
          <div class="traveler-card">
            <div class="traveler-icon">${t.icon}</div>
            <div class="traveler-t">${esc(t.t)}</div>
            <div class="traveler-d">${esc(t.d)}</div>
          </div>`).join('')}
      </div>
    </div>
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
${renderWelcome(shared, apt, lang)}
${renderWifi(shared, apt, lang)}
${renderNameAndWhy(shared, apt, lang)}
${renderCleaning(shared, apt, lang)}
${renderRules(shared, apt, lang)}
${guide[lang].rooms.map(room =>
  renderRoom(room, apt, data.ROOM_PHOTOS, data.URB_FALLBACK, aptId, lang)
).join('\n')}
${renderSurroundings(shared, apt, lang)}
${renderDayPlans(data.DAY_PLANS, apt, lang)}
${renderPhones(shared, apt, lang)}
${renderPorque(apt, lang)}
${renderFeedback(shared, apt, lang)}
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
