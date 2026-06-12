// scripts/price-consistency.mjs
//
// Guardarraíl del precio: ejecuta _calcStay (la FUENTE ÚNICA de precio, en
// docs/components/shared.js) contra una matriz de casos y compara con la
// instantánea scripts/price-baseline.json. Si la lógica de precio cambia sin
// querer, el test falla. Si el cambio es intencionado, regenera la baseline:
//
//   node scripts/price-consistency.mjs --update   # regenera la baseline
//   node scripts/price-consistency.mjs            # verifica (CI / pre-push)
//
// No usa navegador: carga shared.js en un sandbox Node con stubs mínimos.
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const sharedJs = fs.readFileSync(path.join(ROOT, 'docs/components/shared.js'), 'utf8');
const prices = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/data/prices.json'), 'utf8'));
const BASELINE = path.join(ROOT, 'scripts/price-baseline.json');
const UPDATE = process.argv.includes('--update');

// Sandbox con stubs de navegador suficientes para que shared.js cargue y exponga
// _calcStay en window. Ningún componente React se ejecuta (solo se define).
const win = { PRICES_V2: prices };
win.window = win;
const noop = () => {};
const reactStub = new Proxy(() => {}, { get: () => () => {} });
const sandbox = {
  window: win, globalThis: win, self: win,
  document: { createElement: () => ({ style: {}, appendChild: noop, setAttribute: noop }),
    addEventListener: noop, removeEventListener: noop, querySelector: () => null,
    documentElement: { style: { setProperty: noop } }, body: { setAttribute: noop } },
  navigator: { language: 'es' }, location: { pathname: '/', origin: '' },
  React: reactStub, ReactDOM: reactStub,
  atob: s => Buffer.from(s, 'base64').toString('binary'),
  btoa: s => Buffer.from(s, 'binary').toString('base64'),
  setTimeout: noop, setInterval: noop, clearInterval: noop, clearTimeout: noop,
  requestAnimationFrame: noop, cancelAnimationFrame: noop,
  matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }),
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  MutationObserver: class { observe() {} disconnect() {} },
  HTMLElement: class {}, HTMLVideoElement: class {}, HTMLImageElement: class {},
  HTMLCanvasElement: class {}, HTMLInputElement: class {}, Element: class {}, Node: class {},
  Image: class {}, Audio: class {}, CustomEvent: class {}, Event: class {},
  URL: class { static createObjectURL() { return ''; } }, Blob: class {}, FileReader: class {},
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve(null) }),
  console,
};
sandbox.window.matchMedia = sandbox.matchMedia;
vm.createContext(sandbox);
try { vm.runInContext(sharedJs, sandbox, { filename: 'shared.js' }); }
catch (e) { console.error('No se pudo cargar shared.js en el sandbox:', e.message); process.exit(2); }

const calcStay = sandbox.window._calcStay;
if (typeof calcStay !== 'function') { console.error('window._calcStay no está expuesto por shared.js'); process.exit(2); }

// Matriz de casos representativos (apt × fechas × huéspedes × mascota).
const CASES = [
  ['vm', '2026-08-08', '2026-08-15', 2, false],  // alta, 7n (con descuento semanal)
  ['vm', '2026-08-08', '2026-08-12', 4, false],  // alta, 4n, 4 huéspedes
  ['vm', '2026-02-10', '2026-02-17', 2, false],  // baja, 7n
  ['vt', '2026-08-08', '2026-08-22', 2, true],   // alta, 14n, mascota
  ['vt', '2026-09-10', '2026-09-13', 3, false],  // media, 3n short-stay
  ['vs', '2026-08-31', '2026-09-05', 2, false],  // oferta de hueco vigente
  ['vs', '2026-12-26', '2027-01-02', 2, false],  // navidad
];
const round = (c) => c && ({
  nights: c.nights, baseTotal: c.baseTotal, stayDiscAmt: c.stayDiscAmt,
  guestSuppAmt: c.guestSuppAmt, petAmt: c.petAmt,
  directTotal: c.directTotal, avgPerNight: c.avgPerNight,
  isGapOffer: !!c.isGapOffer, gapPerNight: c.gapPerNight ?? null,
});
const result = {};
for (const [apt, ci, co, g, pets] of CASES) {
  result[`${apt}|${ci}|${co}|g${g}|p${pets ? 1 : 0}`] = round(calcStay(ci, co, apt, pets, g));
}

if (UPDATE) {
  fs.writeFileSync(BASELINE, JSON.stringify(result, null, 2) + '\n');
  console.log(`Baseline de precios regenerada (${Object.keys(result).length} casos) → ${path.relative(ROOT, BASELINE)}`);
  process.exit(0);
}

if (!fs.existsSync(BASELINE)) { console.error('Falta price-baseline.json — ejecuta con --update primero.'); process.exit(2); }
const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const diffs = [];
for (const k of Object.keys(result)) {
  const a = JSON.stringify(result[k]), b = JSON.stringify(baseline[k]);
  if (a !== b) diffs.push(`  ${k}\n    esperado: ${b}\n    obtenido: ${a}`);
}
for (const k of Object.keys(baseline)) if (!(k in result)) diffs.push(`  ${k}  (falta en el resultado)`);

if (diffs.length) {
  console.error(`✗ PRECIO cambió respecto a la baseline (${diffs.length} caso/s):\n` + diffs.join('\n'));
  console.error('\nSi el cambio es intencionado: node scripts/price-consistency.mjs --update');
  process.exit(1);
}
console.log(`✓ Precio consistente — ${Object.keys(result).length} casos coinciden con la baseline. _calcStay es la fuente única.`);
