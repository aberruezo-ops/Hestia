// gen-noticias-mes.mjs
//
// Agente mensual del blog (Noticias & Blog). Corre el último día de cada mes
// (workflow noticias-mes.yml) y deja lista la edición del mes siguiente:
//
//   1. Archiva la edición vigente (constante NOTICIAS de noticias-page.jsx)
//      en docs/data/noticias-historico.json, si no está ya (idempotente).
//   2. Obtiene la edición nueva, por este orden:
//        a) docs/data/noticias/<YYYY-MM>.json si existe (escrita a mano o
//           por una ejecución anterior);
//        b) si no, y hay ANTHROPIC_API_KEY, se la pide a Claude con la voz
//           de marca, los hechos y el calendario de strategy/redes/ como
//           única fuente (nada de inventar);
//        c) si no hay clave, deja un esqueleto y sale con código 2 para que
//           el workflow abra el PR marcado "faltan textos".
//   3. Valida la edición (esquema + reglas de CLAUDE.md: sin guion largo,
//      sin precios, sin "desde X", sin estancia larga en julio/agosto, todo
//      bilingüe, cada artículo etiquetado con el mes). Si falla, no toca nada.
//   4. La instala como NOTICIAS en el .jsx, completa MONTH_NAMES y actualiza
//      el lastmod de noticias.html en el sitemap.
//
// NO publica: el workflow abre un PR y la publicación es el merge.
//
// Uso:  node scripts/gen-noticias-mes.mjs --month 2026-09 [--dry-run] [--no-llm]
// Salida: 0 ok · 1 error de validación o infraestructura · 2 esqueleto sin textos

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const JSX_PATH      = 'docs/components/noticias-page.jsx';
const HIST_PATH     = 'docs/data/noticias-historico.json';
const SITEMAP_PATH  = 'docs/sitemap.xml';
const CLIMATE_PATH  = 'docs/data/climate-monthly.json';
const EDITIONS_DIR  = 'docs/data/noticias';
const STRATEGY      = {
  voz:     'strategy/redes/system-prompt.md',
  hechos:  'strategy/redes/hechos-y-ventajas.md',
  eventos: 'strategy/redes/temporadas-y-eventos.md',
  marca:   'VOZ-DE-MARCA.md',
};

const MONTHS = [
  ['Enero', 'January'], ['Febrero', 'February'], ['Marzo', 'March'], ['Abril', 'April'],
  ['Mayo', 'May'], ['Junio', 'June'], ['Julio', 'July'], ['Agosto', 'August'],
  ['Septiembre', 'September'], ['Octubre', 'October'], ['Noviembre', 'November'], ['Diciembre', 'December'],
];
const APTS = [
  { num: '01', apt: 'Hestía Mar',      slug: 'mar.html',      accent: 'var(--vm)' },
  { num: '02', apt: 'Hestía Thalassa', slug: 'thalassa.html', accent: 'var(--vt)' },
  { num: '03', apt: 'Hestía Salinas',  slug: 'salinas.html',  accent: 'var(--vs-dk)' },
];
const ICONS = new Set(['🌊', '🎉', '🎤', '✨', '⛵', '🔥', '🌿', '🎶', '🌸']);
const MIN_ARTICLES = 4;

// Reglas de CLAUDE.md y del kit de redes, aplicadas a cada texto.
const TEXT_RULES = [
  [/—/,                                            'guion largo (em dash) prohibido'],
  [/\d\s?€|€\s?\d/,                                'precio en el texto (los precios salen solo de prices.json)'],
  [/\bdesde\s+\d/i,                                '"desde X": no hardcodear precios'],
  [/estancias?\s+largas?[^.]*\b(julio|agosto)\b/i, 'estancia larga en julio/agosto: no existe'],
  [/\[[^\]]*\]/,                                   'placeholder entre corchetes sin rellenar'],
];

// ── args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = f => args.includes(f);
const opt  = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const month = opt('--month', nextMonth());
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) die(`--month debe ser YYYY-MM, recibido "${month}"`);
const [year, mon] = month.split('-').map(Number);
const dryRun = flag('--dry-run');
const noLlm  = flag('--no-llm');

function nextMonth() {
  const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
function die(msg, code = 1) { console.error('ERROR:', msg); process.exit(code); }

// ── 1. edición vigente y archivo ──────────────────────────────────────────
const jsx = readFileSync(JSX_PATH, 'utf8');
const current = readNoticiasBlock(jsx);
const currentKey = keyFromLabel(current.edition?.es);
if (!currentKey) die(`No reconozco la edición vigente: "${current.edition?.es}"`);
if (currentKey === month) die(`La edición ${month} ya es la vigente en ${JSX_PATH}; nada que hacer`, 0);

const hist = JSON.parse(readFileSync(HIST_PATH, 'utf8'));
const alreadyArchived = hist.editions.some(e => e.key === currentKey);
if (!alreadyArchived) {
  const { updated, ...rest } = current;
  hist.editions.unshift({ key: currentKey, ...rest });
  hist.editions.sort((a, b) => b.key.localeCompare(a.key));
}

// ── 2. edición nueva ──────────────────────────────────────────────────────
const editionPath = `${EDITIONS_DIR}/${month}.json`;
let edition, source, exitCode = 0;
if (existsSync(editionPath)) {
  edition = JSON.parse(readFileSync(editionPath, 'utf8'));
  source = editionPath;
} else if (process.env.ANTHROPIC_API_KEY && !noLlm) {
  edition = await generateWithClaude();
  source = 'claude';
} else {
  edition = skeleton();
  source = 'esqueleto';
  exitCode = 2;
}
edition.key = month;

// ── 3. validación ─────────────────────────────────────────────────────────
const errors = exitCode === 2 ? [] : validate(edition);
if (errors.length) {
  console.error(`Edición ${month} (${source}) NO válida:\n  - ` + errors.join('\n  - '));
  process.exit(1);
}
console.log(`Edición ${month} desde ${source}: ${edition.voz.length} voces, ${countArticles(edition)} artículos` + (exitCode === 2 ? ' (ESQUELETO, faltan textos)' : ' (válida)'));
if (dryRun) { console.log('dry-run: no se escribe nada'); process.exit(exitCode); }

// ── 4. escritura ──────────────────────────────────────────────────────────
if (!existsSync(EDITIONS_DIR)) mkdirSync(EDITIONS_DIR, { recursive: true });
writeFileSync(editionPath, JSON.stringify(edition, null, 2) + '\n');
if (!alreadyArchived) {
  hist.updatedAt = new Date().toISOString();
  writeFileSync(HIST_PATH, JSON.stringify(hist, null, 2) + '\n');
  console.log(`Archivada ${currentKey} en ${HIST_PATH}`);
}
if (exitCode === 0) {
  const { key, ...live } = edition;
  live.updated = current.updated || { es: 'Actualizado cada mes por Hestía', en: 'Updated monthly by Hestía' };
  const ordered = { edition: live.edition, updated: live.updated, voz: live.voz, territorio: live.territorio };
  writeFileSync(JSX_PATH, installBlock(jsx, ordered));
  bumpSitemap();
  console.log(`Instalada ${month} en ${JSX_PATH}. Falta: node scripts/build-jsx.js`);
}
process.exit(exitCode);

// ── helpers ───────────────────────────────────────────────────────────────
function readNoticiasBlock(txt) {
  const i = txt.indexOf('const NOTICIAS = ');
  if (i < 0) die('No encuentro "const NOTICIAS = " en el .jsx');
  const [bs, end] = blockBounds(txt, txt.indexOf('{', i));
  return JSON.parse(txt.slice(bs, end + 1));
}
function blockBounds(txt, bs) {
  let depth = 0, inStr = false, esc = false;
  for (let k = bs; k < txt.length; k++) {
    const c = txt[k];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return [bs, k]; }
  }
  die('Bloque NOTICIAS sin cerrar');
}
function installBlock(txt, obj) {
  const i = txt.indexOf('const NOTICIAS = ');
  const [bs, end] = blockBounds(txt, txt.indexOf('{', i));
  let out = txt.slice(0, bs) + JSON.stringify(obj, null, 2) + txt.slice(end + 1);
  // MONTH_NAMES completo: la vista por mes necesita etiqueta para cualquier mes etiquetado.
  const names = MONTHS.map(([es, en], k) => `  ${k + 1}: { es: '${es}', en: '${en}' },`).join('\n');
  out = out.replace(/const MONTH_NAMES = \{[\s\S]*?\n\};/, `const MONTH_NAMES = {\n${names}\n};`);
  return out;
}
function keyFromLabel(label) {
  const m = String(label || '').match(/^(\p{L}+)\s+(\d{4})$/u);
  if (!m) return null;
  const idx = MONTHS.findIndex(([es]) => es.toLowerCase() === m[1].toLowerCase());
  return idx < 0 ? null : `${m[2]}-${String(idx + 1).padStart(2, '0')}`;
}
function countArticles(e) { return e.territorio.reduce((n, c) => n + c.articles.length, 0); }
function bumpSitemap() {
  if (!existsSync(SITEMAP_PATH)) return;
  const sm = readFileSync(SITEMAP_PATH, 'utf8');
  const re = /(<loc>https:\/\/www\.hestiayourhome\.com\/noticias\.html<\/loc>\s*<lastmod>)\d{4}-\d{2}-\d{2}(<\/lastmod>)/;
  if (re.test(sm)) writeFileSync(SITEMAP_PATH, sm.replace(re, `$1${month}-01$2`));
}

function skeleton() {
  const [es, en] = MONTHS[mon - 1];
  const empty = { es: '', en: '' };
  return {
    key: month,
    edition: { es: `${es} ${year}`, en: `${en} ${year}` },
    voz: APTS.map(a => ({ ...a, curiosidad: { ...empty }, reco: { ...empty } })),
    territorio: [],
  };
}

function validate(e) {
  const errs = [];
  const bi = (obj, where) => {
    for (const l of ['es', 'en']) {
      const s = obj?.[l];
      if (typeof s !== 'string' || !s.trim()) { errs.push(`${where}.${l} vacío`); continue; }
      for (const [re, msg] of TEXT_RULES) if (re.test(s)) errs.push(`${where}.${l}: ${msg}`);
    }
  };
  const [es, en] = MONTHS[mon - 1];
  bi(e.edition, 'edition');
  if (e.edition?.es !== `${es} ${year}`) errs.push(`edition.es debe ser "${es} ${year}"`);
  if (e.edition?.en !== `${en} ${year}`) errs.push(`edition.en debe ser "${en} ${year}"`);
  if (!Array.isArray(e.voz) || e.voz.length !== 3) errs.push('voz debe tener exactamente 3 entradas (Mar, Thalassa, Salinas)');
  else e.voz.forEach((v, k) => {
    const a = APTS[k];
    for (const f of ['num', 'apt', 'slug', 'accent']) if (v[f] !== a[f]) errs.push(`voz[${k}].${f} debe ser "${a[f]}"`);
    bi(v.curiosidad, `voz[${k}].curiosidad`); bi(v.reco, `voz[${k}].reco`);
  });
  if (!Array.isArray(e.territorio) || !e.territorio.length) errs.push('territorio vacío');
  else e.territorio.forEach((c, i) => {
    bi(c.cat, `territorio[${i}].cat`);
    if (!ICONS.has(c.icon)) errs.push(`territorio[${i}].icon "${c.icon}" no es uno de los iconos conocidos`);
    if (!/^var\(--[a-z-]+\)$/.test(c.accent || '')) errs.push(`territorio[${i}].accent debe ser var(--token)`);
    if (!Array.isArray(c.articles) || !c.articles.length) errs.push(`territorio[${i}] sin artículos`);
    else c.articles.forEach((a, j) => {
      const w = `territorio[${i}].articles[${j}]`;
      if (!Array.isArray(a.months) || !a.months.includes(mon)) errs.push(`${w}.months debe incluir ${mon}`);
      bi(a.tag, `${w}.tag`); bi(a.titulo, `${w}.titulo`); bi(a.cuerpo, `${w}.cuerpo`);
    });
  });
  if (Array.isArray(e.territorio) && countArticles(e) < MIN_ARTICLES) errs.push(`menos de ${MIN_ARTICLES} artículos`);
  return errs;
}

// ── LLM: solo con los archivos del repo como fuente ───────────────────────
async function generateWithClaude() {
  const read = p => existsSync(p) ? readFileSync(p, 'utf8') : '';
  const climate = JSON.parse(read(CLIMATE_PATH) || '{}');
  const clim = (climate.months || []).find(m => m.m === mon);
  const prev = hist.editions.slice(0, 2);
  const [es, en] = MONTHS[mon - 1];
  const system = [
    read(STRATEGY.voz),
    '\n\n# HECHOS (única fuente de verdad)\n', read(STRATEGY.hechos),
    '\n\n# VOZ DE MARCA\n', read(STRATEGY.marca),
  ].join('');
  const user = [
    `Escribe la edición "${es} ${year}" del blog mensual (Noticias & Blog) de Hestía.`,
    `Devuelve SOLO un JSON válido con esta forma exacta (mismo esquema que los ejemplos): {"edition":{"es":"${es} ${year}","en":"${en} ${year}"},"voz":[...3 entradas, una por apartamento en este orden y con estos campos fijos: ${JSON.stringify(APTS)}; cada una con "curiosidad":{"es","en"} y "reco":{"es","en"}],"territorio":[{"cat":{"es","en"},"icon":"uno de ${[...ICONS].join(' ')}","accent":"var(--sol)|var(--vs)|var(--vm)|var(--vt)|var(--vs-dk)","articles":[{"months":[${mon}],"tag":{"es","en"},"titulo":{"es","en"},"cuerpo":{"es","en"}}]}]}.`,
    `Entre ${MIN_ARTICLES} y 10 artículos en total. Usa únicamente hechos de los archivos de abajo y de las ediciones anteriores; si un evento no tiene fecha confirmada, dilo ("confirmar programa"). Nada de precios ni de "desde". Sin guion largo. Inglés natural, no traducción literal.`,
    `\n# Calendario del mes (strategy/redes/temporadas-y-eventos.md)\n${read(STRATEGY.eventos)}`,
    clim ? `\n# Clima orientativo de ${es}: media ${clim.avg}°C, mínima ${clim.min}°C, máxima ${clim.max}°C (${climate.note || ''})` : '',
    `\n# Ediciones anteriores (estilo y esquema)\n${JSON.stringify(prev, null, 1)}`,
  ].join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-fable-5-1', max_tokens: 8000, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) die(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = (data.content || []).map(c => c.text || '').join('');
  const start = text.indexOf('{');
  if (start < 0) die('La respuesta no contiene JSON');
  const [, end] = blockBounds(text, start);
  try { return JSON.parse(text.slice(start, end + 1)); }
  catch (e) { die(`JSON de la respuesta inválido: ${e.message}`); }
}
