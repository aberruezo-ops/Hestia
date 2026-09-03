// hestia-traveler-registry — Cloudflare Worker
//
// Recibe y guarda, CIFRADOS, los datos de los viajeros que exige el registro
// obligatorio (RD 933/2021 · SES.HOSPEDAJES). Los datos personales se cifran
// con AES-GCM antes de escribirse en KV (defensa en profundidad, además del
// cifrado en reposo de Cloudflare) y solo se leen desde /p-edit con el secreto.
//
// Rutas:
//   POST /submit            → el huésped envía sus datos. Body:
//                             { token, lang, submittedAt, travelers:[...] }
//   GET  /list?key=SECRET    → lista todas las fichas (admin). Requiere READ_SECRET.
//   GET  /reg?key=SECRET&token=… → una ficha concreta.
//   OPTIONS *                → preflight CORS.
//
// KV namespace (wrangler kv namespace create REG_KV):  REG_KV
// Secretos (wrangler secret put …):
//   READ_SECRET   — clave para leer desde /p-edit (larga y aleatoria).
//   ENCRYPT_KEY   — frase larga; de ella se deriva la clave AES-GCM (SHA-256).
//
// Deploy:
//   cd workers/traveler-registry
//   wrangler kv namespace create REG_KV      # pega el id en wrangler.toml
//   wrangler secret put READ_SECRET
//   wrangler secret put ENCRYPT_KEY
//   wrangler deploy

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

const KEY_PREFIX = 'reg:';
const MAX_TRAVELERS = 12;
const MAX_FIELD_LEN = 200;
const RETENTION_DAYS = 3 * 365 + 30;   // ~3 años (RD 933/2021) + margen; luego expira solo.

// Rate limiting por IP.
const RATE_LIMIT  = 20;          // envíos máx por IP
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
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...cors,
    },
  });

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- AES-GCM helpers (clave derivada de ENCRYPT_KEY por SHA-256) ---
const b64 = { enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))),
              dec: (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0)) };

async function aesKey(secret) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function encryptJson(obj, secret) {
  const key = await aesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key,
    new TextEncoder().encode(JSON.stringify(obj)));
  return { iv: b64.enc(iv), ct: b64.enc(ct), v: 1 };
}
async function decryptJson(rec, secret) {
  const key = await aesKey(secret);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(rec.iv) }, key, b64.dec(rec.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}

// Saneado defensivo de una ficha de viajero (sin confiar en el cliente).
const FIELDS = ['nombre', 'apellido1', 'apellido2', 'sexo', 'tipoDoc', 'numDoc',
  'numSoporte', 'nacionalidad', 'fechaNacimiento', 'pais', 'direccion', 'municipio',
  'cp', 'telefono', 'email', 'parentesco'];
function cleanTraveler(t) {
  const out = {};
  for (const f of FIELDS) out[f] = String((t && t[f]) || '').slice(0, MAX_FIELD_LEN);
  return out;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!env.REG_KV) return json({ error: 'storage_unavailable' }, 503, cors);
    if (!env.ENCRYPT_KEY) return json({ error: 'not_configured' }, 503, cors);

    // ── POST /submit ────────────────────────────────────────────
    if (req.method === 'POST' && url.pathname === '/submit') {
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl:${ip}`;
      const count = parseInt(await env.REG_KV.get(rlKey) || '0', 10);
      if (count >= RATE_LIMIT) {
        return json({ error: 'rate_limited' }, 429, { ...cors, 'Retry-After': String(RATE_WINDOW) });
      }
      await env.REG_KV.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW });

      let body;
      try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400, cors); }
      const token = String(body.token || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
      if (!token) return json({ error: 'bad_token' }, 400, cors);
      if (!Array.isArray(body.travelers) || body.travelers.length === 0 || body.travelers.length > MAX_TRAVELERS) {
        return json({ error: 'bad_travelers' }, 400, cors);
      }
      const travelers = body.travelers.map(cleanTraveler);
      // Mínimo: el titular necesita nombre + apellido + documento.
      const h = travelers[0];
      if (!h.nombre || !h.apellido1 || !h.numDoc) return json({ error: 'incomplete' }, 400, cors);

      const payload = {
        token,
        lang: String(body.lang || 'es').slice(0, 5),
        submittedAt: new Date().toISOString(),
        travelers,
        // Consentimiento OPCIONAL para el boletín mensual (base distinta del
        // registro obligatorio RD 933/2021): solo true si el huésped marcó la
        // casilla. Se lee desde /p-edit para montar la lista del boletín.
        boletin: body.boletin === true,
      };
      const enc = await encryptJson(payload, env.ENCRYPT_KEY);
      await env.REG_KV.put(`${KEY_PREFIX}${token}`, JSON.stringify(enc), {
        expirationTtl: RETENTION_DAYS * 24 * 3600,
      });
      return json({ ok: true }, 200, cors);
    }

    // ── GET /list?key=SECRET  (admin) ───────────────────────────
    if (req.method === 'GET' && url.pathname === '/list') {
      if (!env.READ_SECRET || !safeEqual(url.searchParams.get('key') || '', env.READ_SECRET)) {
        return json({ error: 'unauthorized' }, 401, cors);
      }
      const out = [];
      let cursor;
      do {
        const list = await env.REG_KV.list({ prefix: KEY_PREFIX, cursor });
        for (const k of list.keys) {
          const raw = await env.REG_KV.get(k.name, 'json');
          if (!raw || !raw.ct) continue;
          try { out.push(await decryptJson(raw, env.ENCRYPT_KEY)); } catch (_) { /* skip corrupt */ }
        }
        cursor = list.list_complete ? null : list.cursor;
      } while (cursor);
      out.sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
      return json({ registrations: out }, 200, cors);
    }

    // ── GET /reg?key=SECRET&token=…  (admin, una ficha) ─────────
    if (req.method === 'GET' && url.pathname === '/reg') {
      if (!env.READ_SECRET || !safeEqual(url.searchParams.get('key') || '', env.READ_SECRET)) {
        return json({ error: 'unauthorized' }, 401, cors);
      }
      const token = String(url.searchParams.get('token') || '').replace(/[^A-Za-z0-9_-]/g, '');
      const raw = await env.REG_KV.get(`${KEY_PREFIX}${token}`, 'json');
      if (!raw || !raw.ct) return json({ error: 'not_found' }, 404, cors);
      try { return json({ registration: await decryptJson(raw, env.ENCRYPT_KEY) }, 200, cors); }
      catch (_) { return json({ error: 'decrypt_failed' }, 500, cors); }
    }

    // ── POST /delete  (admin) — borra fichas a demanda ─────────
    // Minimización de datos: el anfitrión borra el registro cuando quiere.
    // Body: { key: READ_SECRET, token }     → borra esa ficha.
    //       { key: READ_SECRET, all: true } → borra TODAS las fichas.
    if ((req.method === 'POST' || req.method === 'DELETE') && url.pathname === '/delete') {
      let body;
      try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400, cors); }
      if (!env.READ_SECRET || !safeEqual(String(body.key || ''), env.READ_SECRET)) {
        return json({ error: 'unauthorized' }, 401, cors);
      }
      if (body.all === true) {
        let deleted = 0, cursor;
        do {
          const list = await env.REG_KV.list({ prefix: KEY_PREFIX, cursor });
          for (const k of list.keys) { await env.REG_KV.delete(k.name); deleted++; }
          cursor = list.list_complete ? null : list.cursor;
        } while (cursor);
        return json({ ok: true, deleted }, 200, cors);
      }
      const token = String(body.token || '').replace(/[^A-Za-z0-9_-]/g, '');
      if (!token) return json({ error: 'bad_token' }, 400, cors);
      await env.REG_KV.delete(`${KEY_PREFIX}${token}`);
      return json({ ok: true, deleted: 1 }, 200, cors);
    }

    // ── POST /prefill  (admin) — guarda el prefill de una reserva ───
    // El anfitrión, al generar el enlace de acceso, guarda aquí todo lo que
    // ya sabe de la reserva (nombre, apellidos, teléfono, email, documento,
    // dirección, nº de huéspedes) bajo un token LARGO e imposible de
    // adivinar. Es seguro guardar aquí el documento porque solo se lee con
    // ese token (a diferencia del enlace corto, que nunca lo lleva).
    if (req.method === 'POST' && url.pathname === '/prefill') {
      let body;
      try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400, cors); }
      if (!env.READ_SECRET || !safeEqual(String(body.key || ''), env.READ_SECRET)) {
        return json({ error: 'unauthorized' }, 401, cors);
      }
      const token = String(body.token || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
      if (token.length < 16) return json({ error: 'weak_token' }, 400, cors);  // exige token de alta entropía
      const p = body.prefill || {};
      const prefill = {};
      for (const f of ['nombre', 'apellido1', 'apellido2', 'telefono', 'email', 'numDoc', 'direccion', 'huespedes', 'apt']) {
        prefill[f] = String(p[f] || '').slice(0, MAX_FIELD_LEN);
      }
      const enc = await encryptJson(prefill, env.ENCRYPT_KEY);
      await env.REG_KV.put(`pf:${token}`, JSON.stringify(enc), { expirationTtl: 200 * 24 * 3600 });
      return json({ ok: true }, 200, cors);
    }

    // ── GET /prefill?token=…  (público) — lo lee el formulario ──────
    // Solo con el token largo (capability). Rate-limit para frenar abuso.
    if (req.method === 'GET' && url.pathname === '/prefill') {
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rlpf:${ip}`;
      const count = parseInt(await env.REG_KV.get(rlKey) || '0', 10);
      if (count >= 40) return json({ error: 'rate_limited' }, 429, { ...cors, 'Retry-After': String(RATE_WINDOW) });
      await env.REG_KV.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW });

      const token = String(url.searchParams.get('token') || '').replace(/[^A-Za-z0-9_-]/g, '');
      if (token.length < 16) return json({ error: 'not_found' }, 404, cors);
      const raw = await env.REG_KV.get(`pf:${token}`, 'json');
      if (!raw || !raw.ct) return json({ error: 'not_found' }, 404, cors);
      try { return json({ prefill: await decryptJson(raw, env.ENCRYPT_KEY) }, 200, cors); }
      catch (_) { return json({ error: 'decrypt_failed' }, 500, cors); }
    }

    return json({ error: 'not_found' }, 404, cors);
  },
};
