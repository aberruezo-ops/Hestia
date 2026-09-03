// Test del contador de visitas y páginas del worker de analítica, con un KV
// simulado (sin desplegar ni tocar Cloudflare). Cubre:
//   1. /pv suma página vista por ruta y por día; visita solo si first=true
//   2. rutas fuera de la gramática (404s, querys raras) no crean claves
//   3. campañas utm válidas se acumulan por mes; inválidas se ignoran
//   4. /stats devuelve visitas, páginas vistas, top de páginas, canales y
//      campañas, y cachea la respuesta 10 min
//
// Ejecutar: node workers/analytics-proxy/test.mjs

import worker from './index.js';

function fakeKV() {
  const store = new Map();
  return {
    store,
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v) { store.set(k, String(v)); },
    async list({ prefix = '', cursor } = {}) {
      const keys = [...store.keys()].filter(k => k.startsWith(prefix)).sort().map(name => ({ name }));
      return { keys, list_complete: true, cursor: null };
    },
  };
}

const ORIGIN = 'https://www.hestiayourhome.com';
const post = (path, body, ip = '1.2.3.4') => new Request(`${ORIGIN}${path}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'CF-Connecting-IP': ip }, body: JSON.stringify(body),
});
const today = new Date().toISOString().slice(0, 10);
const month = today.slice(0, 7);

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; console.log('OK  ', name); } else { fail++; console.log('FAIL', name); } };

const kv = fakeKV();
const env = { EVENTS_KV: kv, READ_SECRET: 'secreto-de-prueba' };

// 1. Dos páginas vistas en la misma sesión: 2 pv, 1 visita, canal social, campaña válida.
await worker.fetch(post('/pv', { path: '/', src: 'social', campaign: 'voz-2026-09', first: true }), env);
await worker.fetch(post('/pv', { path: '/salinas.html', src: 'social', campaign: 'voz-2026-09', first: false }), env);
check('1a pv por ruta (/)', kv.store.get(`pv:${today}:/`) === '1');
check('1b pv por ruta (/salinas.html)', kv.store.get(`pv:${today}:/salinas.html`) === '1');
check('1c páginas vistas del día', kv.store.get(`pvday:${today}`) === '2');
check('1d una sola visita', kv.store.get(`vis:${today}`) === '1');
check('1e visita por canal social', kv.store.get(`vsrc:${today}:social`) === '1');
check('1f campaña del mes', kv.store.get(`camp:${month}:voz-2026-09`) === '1');

// 2. Rutas fuera de la gramática no crean claves; /index.html se normaliza a /.
const before = kv.store.size;
await worker.fetch(post('/pv', { path: '/wp-admin.php', first: true }), env);
await worker.fetch(post('/pv', { path: '/x'.repeat(50) + '.html', first: true }), env);
await worker.fetch(post('/pv', { path: '/mar.html?x=<script>', first: true }), env);
check('2a rutas inválidas ignoradas (sin claves nuevas salvo rate limit)', kv.store.size === before);
await worker.fetch(post('/pv', { path: '/index.html', src: 'direct', first: true }), env);
check('2b /index.html cuenta como /', kv.store.get(`pv:${today}:/`) === '2');
check('2c visita directa', kv.store.get(`vsrc:${today}:direct`) === '1');

// 3. Campaña inválida (mayúsculas/espacios) se ignora; canal desconocido cae en other.
await worker.fetch(post('/pv', { path: '/noticias.html', src: 'marte', campaign: 'Mal Formada!', first: true }), env);
check('3a campaña inválida ignorada', ![...kv.store.keys()].some(k => k.startsWith('camp:') && /mal/i.test(k)));
check('3b canal desconocido → other', kv.store.get(`vsrc:${today}:other`) === '1');

// 4. /stats agrega y cachea.
const stats = (u) => worker.fetch(new Request(`${ORIGIN}${u}`, { headers: { Origin: ORIGIN } }), env);
const unauth = await stats('/stats?key=mala');
check('4a /stats sin clave → 401', unauth.status === 401);
const r1 = await stats('/stats?key=secreto-de-prueba&days=7');
const j1 = await r1.json();
check('4b visitas totales = 3', j1.traffic.visits.total === 3);
check('4c páginas vistas = 4', j1.traffic.pageviews.total === 4);
check('4d top de páginas ordenado', j1.traffic.pages[0].path === '/' && j1.traffic.pages[0].n === 2);
check('4e canales', j1.traffic.visitsBySource.social === 1 && j1.traffic.visitsBySource.direct === 1 && j1.traffic.visitsBySource.other === 1);
check('4f campañas del mes', j1.traffic.campaigns[month]?.['voz-2026-09'] === 1);
check('4g primera lectura no cacheada', r1.headers.get('X-Cache') === 'miss');
await worker.fetch(post('/pv', { path: '/mar.html', first: true }), env);
const r2 = await stats('/stats?key=secreto-de-prueba&days=7');
const j2 = await r2.json();
check('4h segunda lectura sale de caché (no ve la visita nueva)', r2.headers.get('X-Cache') === 'hit' && j2.traffic.visits.total === 3);
const r3 = await stats('/stats?key=secreto-de-prueba&days=7&fresh=1');
const j3 = await r3.json();
check('4i fresh=1 recalcula', j3.traffic.visits.total === 4);
check('4j el embudo sigue en la respuesta', j3.totals && 'search_initiated' in j3.totals);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
