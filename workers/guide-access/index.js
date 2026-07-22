// hestia-guide-access — Cloudflare Worker
//
// Registra los accesos de los huéspedes a la guía digital, por reserva.
// NO guarda datos personales: solo apartamento + fecha de entrada (ya pública
// en availability.json) + hora del acceso. El nombre del huésped se resuelve
// en /p-edit cruzando con las reservas (que viven en el repo privado).
//
// Rutas:
//   POST /            → registra un acceso. Body: { apt, ref }
//                       apt ∈ {vm,vt,vs}; ref = fecha de entrada 'YYYY-MM-DD'.
//   GET  /log?key=…    → devuelve el registro completo. Requiere READ_SECRET.
//   OPTIONS *          → preflight CORS.
//
// KV namespace requerido (wrangler kv namespace create ACCESS_KV):
//   ACCESS_KV
// Secreto requerido (wrangler secret put READ_SECRET):
//   READ_SECRET        — clave para leer el registro desde /p-edit.
//
// Deploy:
//   cd workers/guide-access
//   wrangler kv namespace create ACCESS_KV     # pega el id en wrangler.toml
//   wrangler secret put READ_SECRET            # elige una clave larga
//   wrangler deploy

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

const APTS = ['vm', 'vt', 'vs'];
const DEDUP_WINDOW_MS = 10 * 60 * 1000;  // recargas dentro de 10 min = un acceso
const MAX_TS_PER_RES  = 300;             // tope de marcas por reserva
const KEY_PREFIX      = 'acc:';

// Rate limiting por IP (anti-abuso del POST).
const RATE_LIMIT  = 60;          // accesos máx por IP
const RATE_WINDOW = 15 * 60;     // ventana en segundos

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const json = (obj, status, cors) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });

// Comparación en tiempo (casi) constante para el secreto de lectura.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!env.ACCESS_KV) {
      return json({ error: 'storage_unavailable' }, 503, cors);
    }

    // ── POST / — registra un acceso ─────────────────────────────
    if (req.method === 'POST' && url.pathname === '/') {
      // Rate limit por IP.
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl:${ip}`;
      const count = parseInt(await env.ACCESS_KV.get(rlKey) || '0', 10);
      if (count >= RATE_LIMIT) {
        return json({ error: 'rate_limited' }, 429, { ...cors, 'Retry-After': String(RATE_WINDOW) });
      }
      await env.ACCESS_KV.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW });

      let body;
      try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400, cors); }
      const apt = String(body.apt || '').toLowerCase();
      const ref = String(body.ref || '');
      if (!APTS.includes(apt) || !/^\d{4}-\d{2}-\d{2}$/.test(ref)) {
        return json({ error: 'bad_params' }, 400, cors);
      }

      const key = `${KEY_PREFIX}${apt}:${ref}`;
      const existing = await env.ACCESS_KV.get(key, 'json');
      const rec = existing && Array.isArray(existing.ts) ? existing : { apt, ref, ts: [] };
      const now = Date.now();
      const last = rec.ts.length ? rec.ts[rec.ts.length - 1] : 0;
      if (now - last >= DEDUP_WINDOW_MS) {
        rec.ts.push(now);
        if (rec.ts.length > MAX_TS_PER_RES) rec.ts = rec.ts.slice(-MAX_TS_PER_RES);
        await env.ACCESS_KV.put(key, JSON.stringify(rec));
      }
      return json({ ok: true }, 200, cors);
    }

    // ── GET /log?key=SECRET — registro completo (admin) ─────────
    if (req.method === 'GET' && url.pathname === '/log') {
      if (!env.READ_SECRET || !safeEqual(url.searchParams.get('key') || '', env.READ_SECRET)) {
        return json({ error: 'unauthorized' }, 401, cors);
      }
      const out = [];
      let cursor;
      do {
        const list = await env.ACCESS_KV.list({ prefix: KEY_PREFIX, cursor });
        for (const k of list.keys) {
          const rec = await env.ACCESS_KV.get(k.name, 'json');
          if (rec && Array.isArray(rec.ts)) out.push(rec);
        }
        cursor = list.list_complete ? null : list.cursor;
      } while (cursor);
      return json({ accesses: out }, 200, cors);
    }

    return json({ error: 'not_found' }, 404, cors);
  },
};
