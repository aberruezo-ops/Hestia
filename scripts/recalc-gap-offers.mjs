// scripts/recalc-gap-offers.mjs
//
// Recalcula las ofertas de hueco corto (2–5 noches) cada vez que cambia la
// disponibilidad (alta / cancelación / modificación de reserva). Se ejecuta en
// el workflow de sync iCal (cada 4h) tras actualizar availability.json.
//
//  1. PODA: borra toda oferta de hueco corto cuyo hueco ya no exista con esas
//     fechas exactas (se llenó, se acortó o creció a ≥6 noches).
//  2. AUTO-CREA: a los huecos cortos (2–5 noches) SIN oferta les pone el
//     descuento de última hora por temporada (misma regla que los presets de la
//     pestaña de precios), marcados con auto:true:
//        · crítica  y ≤ 7 días  → −15 %
//        · alta     y ≤ 14 días → −10 %
//        · cualquiera ≤ 30 días → −5 %
//        · más lejos de 30 días → sin oferta (todavía no es última hora)
//  3. RESPETA las ofertas manuales (sin auto:true) sobre huecos que no han
//     cambiado: ni se borran ni se sobrescriben.
//
// Reusa _v2BumpedSeasonForDate de docs/components/shared.js (la misma lógica de
// temporada que el resto del sitio), cargado en un sandbox Node.
//
//   node scripts/recalc-gap-offers.mjs           # aplica y escribe prices.json
//   node scripts/recalc-gap-offers.mjs --dry      # solo muestra qué cambiaría
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const PRICES = path.join(ROOT, 'docs/data/prices.json');
const AVAIL = path.join(ROOT, 'docs/assets/availability.json');
const DRY = process.argv.includes('--dry');
const SHORT_MIN = 2, SHORT_MAX = 5; // hueco corto = 2..5 noches

const diff = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
const addDays = (ds, n) => { const d = new Date(ds + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const prices = JSON.parse(fs.readFileSync(PRICES, 'utf8'));
const avail = fs.existsSync(AVAIL) ? JSON.parse(fs.readFileSync(AVAIL, 'utf8')) : {};
const gapOverrides = prices.gapOverrides || {};
const gapSplits = prices.gapSplits || {};
const manualBlocks = prices.manual_blocks || {};
const horizon = (prices.bookingHorizon && prices.bookingHorizon.lastCheckinDate) || null;
const today = new Date().toISOString().slice(0, 10);

// ── temporada: reusar la lógica de shared.js en un sandbox ───────────────────
const sharedJs = fs.readFileSync(path.join(ROOT, 'docs/components/shared.js'), 'utf8');
const win = { PRICES_V2: prices }; win.window = win;
const noop = () => {};
const cls = () => class {};
const sandbox = {
  window: win, globalThis: win, self: win, console,
  document: { createElement: () => ({ style: {}, appendChild: noop, setAttribute: noop }), addEventListener: noop, removeEventListener: noop, querySelector: () => null, documentElement: { style: { setProperty: noop } }, body: { setAttribute: noop } },
  navigator: { language: 'es' }, location: { pathname: '/', origin: '' },
  React: new Proxy(() => {}, { get: () => () => {} }), ReactDOM: new Proxy(() => {}, { get: () => () => {} }),
  atob: s => Buffer.from(s, 'base64').toString('binary'), btoa: s => Buffer.from(s, 'binary').toString('base64'),
  setTimeout: noop, setInterval: noop, clearInterval: noop, clearTimeout: noop, requestAnimationFrame: noop, cancelAnimationFrame: noop,
  matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }),
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } },
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
  HTMLElement: cls(), HTMLVideoElement: cls(), HTMLImageElement: cls(), HTMLCanvasElement: cls(), HTMLInputElement: cls(), Element: cls(), Node: cls(),
  Image: cls(), Audio: cls(), CustomEvent: cls(), Event: cls(), URL: class { static createObjectURL() { return ''; } }, Blob: cls(), FileReader: cls(),
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve(null) }),
};
sandbox.window.matchMedia = sandbox.matchMedia;
vm.createContext(sandbox);
vm.runInContext(sharedJs, sandbox, { filename: 'shared.js' });
const seasonForDate = sandbox.window._v2BumpedSeasonForDate;
if (typeof seasonForDate !== 'function') { console.error('shared.js no expone _v2BumpedSeasonForDate'); process.exit(2); }

// temporada dominante de un hueco (la más frecuente entre sus noches)
const dominantSeason = (start, end) => {
  const count = {};
  for (let d = start; d < end; d = addDays(d, 1)) { const s = seasonForDate(d, prices); count[s] = (count[s] || 0) + 1; }
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'baja';
};

// ── geometría de huecos (réplica de _hcCalcGaps + splits) ────────────────────
const calcGaps = (blocked, tday, hz) => {
  if (!blocked || !blocked.length) return [];
  const sorted = [...blocked].sort((a, b) => (a.start < b.start ? -1 : 1));
  const gaps = [];
  const push = (gs, ge) => { if (gs >= ge || ge <= tday || (hz && gs >= hz)) return; const n = diff(gs, ge); if (n < 2) return; gaps.push({ start: gs, end: ge, nights: n }); };
  push(tday, sorted[0].start);
  for (let i = 0; i < sorted.length - 1; i++) push(sorted[i].end, sorted[i + 1].start);
  if (hz) push(sorted[sorted.length - 1].end, hz);
  return gaps;
};
const segmentsFor = (gaps, aptId) => {
  const out = [];
  for (const g of gaps) {
    const splits = ((gapSplits[`${aptId}|${g.start}`]) || []).filter(d => d > g.start && d < g.end).sort();
    const pts = [g.start, ...splits, g.end];
    for (let i = 0; i < pts.length - 1; i++) out.push({ start: pts[i], end: pts[i + 1], nights: diff(pts[i], pts[i + 1]) });
  }
  return out;
};

// descuento de última hora por temporada + días hasta la entrada (presets pestaña precios)
const autoDiscount = (season, daysUntil) => {
  if (daysUntil < 0) return null;
  if (season === 'critica' && daysUntil <= 7) return 15;
  if (season === 'alta' && daysUntil <= 14) return 10;
  if (daysUntil <= 30) return 5;
  return null; // todavía no es última hora
};

// ── AUTO-TROCEO de huecos largos (6+ noches) en piezas de 3–5 noches ─────────
// No aplica a huecos que podrían ser estancia larga (≥29 noches con check-in
// fuera de julio/agosto): esos se dejan enteros. Respeta los trozos que ya
// estén puestos a mano; los suyos (gapSplitsAuto) los regenera cada vez.
const splitsBefore = JSON.stringify(gapSplits);
const LS_MIN = 29;
const isLsGap = (g) => g.nights >= LS_MIN && ![7, 8].includes(Number(g.start.slice(5, 7)));
const splitSizes = (N) => {
  const k = Math.min(Math.floor(N / 3), Math.max(Math.ceil(N / 5), Math.round(N / 4)));
  const base = Math.floor(N / k), rem = N % k;
  return Array.from({ length: k }, (_, i) => base + (i < rem ? 1 : 0));
};
const prevAutoSplits = new Set(prices.gapSplitsAuto || []);
for (const key of prevAutoSplits) delete gapSplits[key];   // limpia mis trozos previos (los manuales se quedan)
const autoSplits = new Set();
for (const aptId of ['vm', 'vt', 'vs']) {
  const blocked = [...(((avail[aptId] || {}).blocked) || []), ...((manualBlocks[aptId]) || [])];
  for (const g of calcGaps(blocked, today, horizon)) {
    if (g.nights < 6 || isLsGap(g)) continue;
    const key = `${aptId}|${g.start}`;
    if ((gapSplits[key] || []).some(d => d > g.start && d < g.end)) continue;   // troceado a mano → respetar
    if (autoDiscount(dominantSeason(g.start, g.end), diff(today, g.start)) == null) continue;   // aún no es última hora
    const sizes = splitSizes(g.nights);
    const pts = []; let s = g.start;
    for (let i = 0; i < sizes.length - 1; i++) { s = addDays(s, sizes[i]); pts.push(s); }
    gapSplits[key] = pts;
    autoSplits.add(key);
  }
}

// ── huecos cortos vigentes por apt (ya incluyen los trozos auto) ─────────────
const shortGaps = {}; // "apt|start" -> { apt, start, end, nights }
for (const aptId of ['vm', 'vt', 'vs']) {
  const blocked = [...(((avail[aptId] || {}).blocked) || []), ...((manualBlocks[aptId]) || [])];
  for (const s of segmentsFor(calcGaps(blocked, today, horizon), aptId)) {
    if (s.nights >= SHORT_MIN && s.nights <= SHORT_MAX) shortGaps[`${aptId}|${s.start}`] = { apt: aptId, ...s };
  }
}

const removed = [], created = [], kept = [];
const next = { ...gapOverrides };

// Auto-troceo manda: quita la oferta larga (manual) del inicio de un hueco ahora
// troceado, para que el primer trozo reciba su propia oferta de última hora.
for (const key of autoSplits) {
  const ov = next[key];
  if (ov) {
    const n = ov.nights != null ? ov.nights : diff(ov.start || key.split('|')[1], ov.end);
    if (n > SHORT_MAX) delete next[key];
  }
}

// 1) PODA — ofertas de hueco corto que ya no corresponden a un hueco vigente
for (const [key, ov] of Object.entries(gapOverrides)) {
  const start = ov.start || key.split('|')[1];
  const ovN = ov.nights != null ? ov.nights : diff(start, ov.end);
  if (ovN < SHORT_MIN || ovN > SHORT_MAX) continue; // oferta larga → no se toca
  const g = shortGaps[key];
  if (g && g.end === ov.end) { kept.push(key); continue; } // hueco intacto → conservar (manual o auto)
  delete next[key];
  removed.push({ key, reason: !g ? 'hueco lleno/inexistente' : `cambió de fin (${ov.end}→${g.end})` });
}

// 2) AUTO-CREA / REFRESCA — cada hueco corto vigente recibe (o actualiza) su
//    descuento de última hora según los % actuales. Las ofertas manuales (sin
//    auto:true) no se tocan.
for (const [key, g] of Object.entries(shortGaps)) {
  const cur = next[key];
  if (cur && !cur.auto) continue; // oferta manual → respetar
  const season = dominantSeason(g.start, g.end);
  const daysUntil = diff(today, g.start);
  const value = autoDiscount(season, daysUntil);
  if (value == null) {
    if (cur && cur.auto) { delete next[key]; removed.push({ key, reason: 'ya no es última hora' }); }
    continue;
  }
  if (cur && cur.auto && cur.type === 'discount' && cur.value === value && cur.end === g.end) { kept.push(key); continue; }
  next[key] = { apt: g.apt, start: g.start, end: g.end, nights: g.nights, type: 'discount', value, lastMinute: true, auto: true };
  created.push({ key, season, daysUntil, value });
}

console.log(`Huecos cortos vigentes: ${Object.keys(shortGaps).length} · conservados: ${kept.length} · podados: ${removed.length} · auto-creados: ${created.length} (today=${today})`);
removed.forEach(r => console.log(`  − ${r.key}  · ${r.reason}`));
created.forEach(c => console.log(`  + ${c.key}  · ${c.season}, ${c.daysUntil}d → −${c.value}%`));

const splitsChanged = JSON.stringify(gapSplits) !== splitsBefore
  || JSON.stringify([...autoSplits].sort()) !== JSON.stringify([...prevAutoSplits].sort());
if (autoSplits.size) console.log(`Huecos troceados automáticamente: ${autoSplits.size} → ${[...autoSplits].join(', ')}`);

if (!removed.length && !created.length && !splitsChanged) { console.log('✓ Ofertas de hueco al día. Sin cambios.'); process.exit(0); }
if (DRY) { console.log('\n(dry-run — no se escribe nada)'); process.exit(0); }

prices.gapOverrides = next;
prices.gapSplits = gapSplits;
prices.gapSplitsAuto = [...autoSplits];
fs.writeFileSync(PRICES, JSON.stringify(prices, null, 2) + '\n');
console.log(`\nprices.json actualizado (−${removed.length} / +${created.length}${splitsChanged ? ' · trozos actualizados' : ''}).`);
