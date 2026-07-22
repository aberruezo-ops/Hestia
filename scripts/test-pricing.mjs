// scripts/test-pricing.mjs
//
// Tests unitarios de las INVARIANTES de precio de CLAUDE.md. Carga shared.js
// (la fuente única _calcStay / _calcLsTotal) en un sandbox Node, sin navegador,
// y comprueba reglas de negocio que NO pueden romperse. Es un gate: sale 1 si
// alguna falla.
//
//   node scripts/test-pricing.mjs
//
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const sharedJs = fs.readFileSync(path.join(ROOT, 'docs/components/shared.js'), 'utf8');
const prices = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/data/prices.json'), 'utf8'));

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
catch (e) { console.error('No se pudo cargar shared.js:', e.message); process.exit(2); }

const calcStay = sandbox.window._calcStay;
const calcLs   = sandbox.window._calcLsTotal;
if (typeof calcStay !== 'function') { console.error('window._calcStay no expuesto'); process.exit(2); }

let pass = 0, fail = 0;
const ok  = (name) => { pass++; console.log(`  ✓ ${name}`); };
const bad = (name, detail) => { fail++; console.log(`  ✗ ${name}\n      ${detail}`); };
const assert = (cond, name, detail) => cond ? ok(name) : bad(name, detail);

const rules = prices.rules || {};
const petMax = rules.petMax ?? 50;
const petPerNight = rules.petPerNight ?? 10;

console.log('Invariantes de precio (fuente única _calcStay / prices.json)\n');

// INV-1 · una estancia válida cotiza un total positivo y coherente.
{
  const r = calcStay('2026-02-10', '2026-02-17', 'vm', false, 2);
  assert(r && r.directTotal > 0 && r.avgPerNight > 0 && r.nights === 7,
    'estancia válida → total y €/noche positivos, nights correcto',
    `got ${JSON.stringify(r)}`);
}

// INV-2 · descuento por estancia MONOTÓNICO: a más noches, nunca más €/noche
// (misma temporada baja, mismo apto). Cubre los tramos 7+ y 15+.
{
  const p5  = calcStay('2026-02-02', '2026-02-07', 'vm', false, 2)?.avgPerNight;
  const p7  = calcStay('2026-02-02', '2026-02-09', 'vm', false, 2)?.avgPerNight;
  const p15 = calcStay('2026-02-02', '2026-02-17', 'vm', false, 2)?.avgPerNight;
  assert(p5 && p7 && p15 && p7 <= p5 && p15 <= p7,
    `€/noche no crece con la duración (5n=${p5} ≥ 7n=${p7} ≥ 15n=${p15})`,
    `esperado 5n ≥ 7n ≥ 15n`);
}

// INV-3 · el tramo 7+ aplica descuento; una estancia de 5 no.
{
  const r5 = calcStay('2026-02-02', '2026-02-07', 'vm', false, 2);
  const r7 = calcStay('2026-02-02', '2026-02-09', 'vm', false, 2);
  assert(r5 && r7 && (r5.stayDiscAmt || 0) === 0 && (r7.stayDiscAmt || 0) > 0,
    'descuento por estancia: 5n sin descuento, 7n con descuento',
    `5n stayDiscAmt=${r5?.stayDiscAmt}, 7n stayDiscAmt=${r7?.stayDiscAmt}`);
}

// INV-4 · suplemento de mascota TOPADO en petMax (nunca petPerNight × noches sin tope).
{
  const r = calcStay('2026-02-02', '2026-02-16', 'vm', true, 2); // 14 noches con mascota
  const sinPet = calcStay('2026-02-02', '2026-02-16', 'vm', false, 2);
  const petAmt = r ? r.petAmt : null;
  assert(petAmt != null && petAmt <= petMax && petAmt < 14 * petPerNight,
    `mascota topada en ${petMax}€ (14n×${petPerNight}=${14 * petPerNight} sería sin tope; got ${petAmt})`,
    `petAmt=${petAmt}`);
  assert(r && sinPet && r.directTotal - sinPet.directTotal <= petMax,
    'el sobrecoste por mascota no supera el tope',
    `delta=${r && sinPet ? r.directTotal - sinPet.directTotal : '?'}`);
}

// INV-5 · huésped adicional encarece (temporada baja, mismo tramo).
{
  const r2 = calcStay('2026-02-02', '2026-02-07', 'vm', false, 2);
  const r5g = calcStay('2026-02-02', '2026-02-07', 'vm', false, 5);
  assert(r2 && r5g && r5g.directTotal > r2.directTotal,
    'más huéspedes → mayor total (suplemento por huésped)',
    `2h=${r2?.directTotal} vs 5h=${r5g?.directTotal}`);
}

// INV-6 · temporada alta (agosto) más cara por noche que baja (febrero), mismo apto/tramo.
{
  const baja = calcStay('2026-02-02', '2026-02-09', 'vm', false, 2)?.avgPerNight;
  const alta = calcStay('2026-08-03', '2026-08-10', 'vm', false, 2)?.avgPerNight;
  assert(baja && alta && alta > baja,
    `temporada alta > baja por noche (ago=${alta} > feb=${baja})`,
    `alta=${alta} baja=${baja}`);
}

// INV-7 · estancia larga cotiza más barata por noche que la tarifa por noche
// (tarifa mensual). El mínimo de 29 noches NO lo aplica el calculador
// _calcLsTotal (es una calculadora pura), sino el gate isLsStay de la UI
// [estancias-largas-page · reservas-page]; aquí solo verificamos el precio.
if (typeof calcLs === 'function') {
  const ls = calcLs('2026-02-01', '2026-03-03', 2, false, 'vm'); // 30 noches, baja
  const nightlyBase = prices.apts.vm.base; // 88
  const perNight = ls && ls.total ? ls.total / 30 : null;
  assert(ls && ls.total > 0 && perNight < nightlyBase,
    `estancia larga más barata por noche que la tarifa/noche (mensual ≈ ${perNight ? Math.round(perNight) : '?'}€ < ${nightlyBase}€)`,
    `got ${JSON.stringify(ls)}`);
} else {
  console.log('  · _calcLsTotal no expuesto, salto INV-7');
}

// INV-8 · estancia larga NO admite check-in en julio ni agosto (CLAUDE.md).
if (typeof calcLs === 'function') {
  const julio = calcLs('2026-07-05', '2026-08-10', 2, false, 'vm'); // 36 noches, check-in julio
  assert(julio == null,
    'estancia larga rechaza check-in en julio/agosto (null)',
    `got ${JSON.stringify(julio)}`);
}

console.log(`\n${pass} pasan · ${fail} fallan`);
process.exit(fail ? 1 : 0);
