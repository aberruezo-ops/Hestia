// hestia-reviews-submit — Cloudflare Worker
//
// Recibe la opinión que un huésped envía desde /escribir-opinion.html y la
// añade directamente a docs/data/reviews.json (rama main) con status
// "pending", para que aparezca en la pestaña Reviews de /p-edit sin que
// nadie tenga que copiarla a mano del email de Web3Forms. El formulario
// sigue enviando también a Web3Forms (aviso por email a Alex/Fran); este
// Worker es un segundo envío en paralelo, no un reemplazo.
//
// El PIN de reserva se valida igual que en el cliente (mismo PIN maestro
// por apartamento, o cualquier código con el prefijo correcto): es fricción
// de UX, no verificación real contra la reserva (el Worker no tiene acceso
// a los datos privados de reservas). Igual que ya documenta
// escribir-opinion-page.jsx, la reseña no depende de tener acceso vigente
// a la guía.
//
// Rutas:
//   POST /submit   → guarda la reseña. Body JSON:
//                    { apt, pin, rating, name, date, lang, text, botcheck }
//   GET  /health   → 200 si el Worker está desplegado y configurado.
//   OPTIONS *      → preflight CORS.
//
// KV namespace (wrangler kv namespace create REV_KV): solo para el
// contador de rate limit por IP, no se guarda ninguna reseña aquí.
// Secreto (wrangler secret put GITHUB_TOKEN):
//   PAT de GitHub de grano fino, con permiso Contents: Read and write
//   restringido SOLO al repo aberruezo-ops/hestia. No uses un PAT clásico
//   con acceso a toda la cuenta.
//
// Deploy:
//   cd workers/reviews-submit
//   wrangler kv namespace create REV_KV      # pega el id en wrangler.toml
//   wrangler secret put GITHUB_TOKEN
//   wrangler deploy

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

const GITHUB_OWNER  = 'aberruezo-ops';
const GITHUB_REPO   = 'hestia';
const REVIEWS_PATH  = 'docs/data/reviews.json';
const BRANCH        = 'main';

// Mismo PIN maestro y mismo patrón que escribir-opinion-page.jsx (fuente
// única de la validación en el cliente; se repite aquí porque el Worker no
// puede importar JSX). Si cambian los PIN maestros, actualiza los dos sitios.
const GUIDE_PIN = { vm: 'HVM2016', vt: 'HVT2019', vs: 'HVS2021' };
const PIN_RE    = { vm: /^HVM\d{4}$/, vt: /^HVT\d{4}$/, vs: /^HVS\d{4}$/ };

const MAX_NAME_LEN = 100;
const MIN_TEXT_LEN = 30;
const MAX_TEXT_LEN = 3000;

// Rate limit por IP (endpoint de escritura → sensible, 10/15min por CLAUDE.md).
const RATE_LIMIT  = 10;
const RATE_WINDOW = 15 * 60;

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

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_EN = ['january','february','march','april','may','june','july','august','september','october','november','december'];

// La estancia se recoge como texto libre ("Agosto 2024"); reviews.json
// necesita YYYY-MM-DD real (se ordena con localeCompare). Si no se puede
// interpretar el mes, usamos el mes de envío como aproximación razonable
// en vez de guardar una fecha inválida que rompería el orden y el pintado.
function parseStayDate(input) {
  const s = String(input || '').trim().toLowerCase();
  const yearMatch = s.match(/(20\d{2})/);
  let monthIdx = MONTHS_ES.findIndex(m => s.includes(m));
  if (monthIdx === -1) monthIdx = MONTHS_EN.findIndex(m => s.includes(m));
  if (monthIdx === -1) {
    const numMatch = s.match(/\b(0?[1-9]|1[0-2])[\/\-](20\d{2})\b/);
    if (numMatch) monthIdx = parseInt(numMatch[1], 10) - 1;
  }
  const now = new Date();
  const year = yearMatch ? yearMatch[1] : String(now.getUTCFullYear());
  if (monthIdx === -1) return now.toISOString().slice(0, 10);
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;
}

function b64DecodeUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}
function b64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

const GH_HEADERS = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'hestia-reviews-submit-worker',
  'X-GitHub-Api-Version': '2022-11-28',
});

async function fetchReviewsFile(env) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${REVIEWS_PATH}?ref=${BRANCH}`;
  const r = await fetch(url, { headers: GH_HEADERS(env.GITHUB_TOKEN) });
  if (!r.ok) throw new Error(`github_get_${r.status}`);
  return r.json();
}

async function putReviewsFile(env, contentStr, sha, message) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${REVIEWS_PATH}`;
  const r = await fetch(url, {
    method: 'PUT',
    headers: { ...GH_HEADERS(env.GITHUB_TOKEN), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: b64EncodeUtf8(contentStr), sha, branch: BRANCH }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`github_put_${r.status}:${body.slice(0, 200)}`);
  }
  return r.json();
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (req.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, configured: !!env.GITHUB_TOKEN }, 200, cors);
    }

    if (req.method === 'POST' && url.pathname === '/submit') {
      if (!env.GITHUB_TOKEN) return json({ error: 'not_configured' }, 503, cors);
      if (!env.REV_KV) return json({ error: 'storage_unavailable' }, 503, cors);

      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl:${ip}`;
      const count = parseInt(await env.REV_KV.get(rlKey) || '0', 10);
      if (count >= RATE_LIMIT) {
        return json({ error: 'rate_limited' }, 429, { ...cors, 'Retry-After': String(RATE_WINDOW) });
      }
      await env.REV_KV.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW });

      let body;
      try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400, cors); }

      // Honeypot: si el bot rellenó el campo invisible, respondemos éxito
      // falso sin escribir nada (no delatamos el filtro).
      if (body.botcheck) return json({ ok: true }, 200, cors);

      const apt = ['vm', 'vt', 'vs'].includes(body.apt) ? body.apt : null;
      if (!apt) return json({ error: 'bad_apt' }, 400, cors);

      const pin = String(body.pin || '').trim().toUpperCase();
      const pinOk = pin === GUIDE_PIN[apt] || (PIN_RE[apt] && PIN_RE[apt].test(pin));
      if (!pinOk) return json({ error: 'bad_pin' }, 400, cors);

      const rating = parseInt(body.rating, 10);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: 'bad_rating' }, 400, cors);

      const name = String(body.name || '').trim().slice(0, MAX_NAME_LEN);
      if (!name) return json({ error: 'bad_name' }, 400, cors);

      const text = String(body.text || '').trim().slice(0, MAX_TEXT_LEN);
      if (text.length < MIN_TEXT_LEN) return json({ error: 'bad_text' }, 400, cors);

      const lang = body.lang === 'en' ? 'en' : 'es';
      const date = parseStayDate(body.date);

      const newItem = {
        id: `wb-${Date.now().toString(36)}`,
        source: 'web',
        apt,
        name,
        country: '',
        date,
        rating,
        lang,
        text,
        highlight: false,
        status: 'pending',
      };

      try {
        const file = await fetchReviewsFile(env);
        const data = JSON.parse(b64DecodeUtf8(file.content));
        data.items.push(newItem);
        data.updatedAt = new Date().toISOString();
        const aptName = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' }[apt];
        await putReviewsFile(
          env,
          JSON.stringify(data, null, 2) + '\n',
          file.sha,
          `chore: nueva opinión pendiente (Hestía ${aptName}) [skip ci]`
        );
      } catch (err) {
        console.error('reviews-submit github error', err.message || err);
        return json({ error: 'github_write_failed' }, 502, cors);
      }

      return json({ ok: true, id: newItem.id }, 200, cors);
    }

    return json({ error: 'not_found' }, 404, cors);
  },
};
