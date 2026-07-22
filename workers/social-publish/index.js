// hestia-social-publish — Cloudflare Worker
//
// Publica un post (imagen + texto) en la página de Facebook y/o en la cuenta
// de Instagram Business de Hestía vía la Meta Graph API. Lo invoca el botón
// "Publicar" de la pestaña Redes de /p-edit. El navegador NUNCA ve el token de
// Meta: vive solo aquí como secreto.
//
// Secrets (wrangler secret put <NOMBRE>):
//   META_TOKEN      token de página de Facebook de larga duración
//   IG_USER_ID      id de la cuenta de Instagram Business vinculada a la página
//   FB_PAGE_ID      id de la página de Facebook
//   PUBLISH_SECRET  clave que introduces en /p-edit para autorizar la publicación
// KV (wrangler kv namespace create SOCIAL_KV): binding SOCIAL_KV (rate limit)
//
// Rutas:
//   POST /publish  { key, networks:["ig","fb"], caption, imageUrl }
//   OPTIONS *      preflight CORS
//
// Deploy:
//   cd workers/social-publish
//   wrangler kv namespace create SOCIAL_KV   # pega el id en wrangler.toml
//   wrangler secret put META_TOKEN
//   wrangler secret put IG_USER_ID
//   wrangler secret put FB_PAGE_ID
//   wrangler secret put PUBLISH_SECRET
//   wrangler deploy

const GRAPH = 'https://graph.facebook.com/v21.0';

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

const RATE_LIMIT  = 10;          // publicaciones máx por IP (endpoint sensible)
const RATE_WINDOW = 15 * 60;     // ventana en segundos

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const json = (obj, status, cors) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });

// Comparación en tiempo (casi) constante para el secreto de publicación.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function graphPost(path, params) {
  const body = new URLSearchParams(params);
  const r = await fetch(`${GRAPH}/${path}`, { method: 'POST', body });
  let j;
  try { j = await r.json(); } catch (_) { j = {}; }
  if (!r.ok || j.error) {
    const msg = (j.error && j.error.message) || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return j;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function graphGet(path) {
  const r = await fetch(`${GRAPH}/${path}`);
  let j; try { j = await r.json(); } catch (_) { j = {}; }
  if (!r.ok || j.error) throw new Error((j.error && j.error.message) || `HTTP ${r.status}`);
  return j;
}

// Instagram: foto. Crea contenedor y publica (dos pasos).
async function publishInstagram(env, caption, imageUrl) {
  const c = await graphPost(`${env.IG_USER_ID}/media`, { image_url: imageUrl, caption, access_token: env.META_TOKEN });
  const out = await graphPost(`${env.IG_USER_ID}/media_publish`, { creation_id: c.id, access_token: env.META_TOKEN });
  return out.id;
}

// Instagram: Reel (vídeo). El contenedor se procesa de forma asíncrona: se
// sondea el estado hasta FINISHED antes de publicar.
async function publishInstagramReel(env, caption, videoUrl) {
  const c = await graphPost(`${env.IG_USER_ID}/media`, {
    media_type: 'REELS', video_url: videoUrl, caption, share_to_feed: 'true', access_token: env.META_TOKEN,
  });
  let ready = false;
  for (let i = 0; i < 20; i++) {           // hasta ~60s de procesado
    await sleep(3000);
    const st = await graphGet(`${c.id}?fields=status_code&access_token=${encodeURIComponent(env.META_TOKEN)}`);
    if (st.status_code === 'FINISHED') { ready = true; break; }
    if (st.status_code === 'ERROR') throw new Error('IG: error procesando el reel');
  }
  if (!ready) throw new Error('IG: el reel sigue procesandose, reintenta en un minuto');
  const out = await graphPost(`${env.IG_USER_ID}/media_publish`, { creation_id: c.id, access_token: env.META_TOKEN });
  return out.id;
}

// Facebook: foto a la página con su texto.
async function publishFacebook(env, caption, imageUrl) {
  const out = await graphPost(`${env.FB_PAGE_ID}/photos`, { url: imageUrl, message: caption, access_token: env.META_TOKEN });
  return out.post_id || out.id;
}

// Facebook: vídeo a la página con su texto.
async function publishFacebookVideo(env, caption, videoUrl) {
  const out = await graphPost(`${env.FB_PAGE_ID}/videos`, { file_url: videoUrl, description: caption, access_token: env.META_TOKEN });
  return out.id;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // ── GET /health — ¿sigue vivo el token de Meta? ─────────────
    // Un token de página de Meta puede caducar o invalidarse y entonces
    // "Publicar" deja de funcionar en silencio. Un cron de GitHub Actions
    // consulta esto y avisa si el token murió. 200 = vivo, 503 = caído.
    if (req.method === 'GET' && url.pathname === '/health') {
      if (!env.META_TOKEN) return json({ ok: false, error: 'no_token' }, 503, cors);
      try {
        const r = await fetch(`${GRAPH}/me?fields=id&access_token=${encodeURIComponent(env.META_TOKEN)}`);
        const j = await r.json();
        if (!r.ok || (j && j.error)) {
          return json({ ok: false, error: (j.error && j.error.message) || ('http ' + r.status) }, 503, cors);
        }
        return json({ ok: true }, 200, cors);
      } catch (e) {
        return json({ ok: false, error: e.message }, 503, cors);
      }
    }

    if (req.method !== 'POST' || url.pathname !== '/publish') {
      return json({ error: 'not_found' }, 404, cors);
    }
    if (!env.META_TOKEN || !env.IG_USER_ID || !env.FB_PAGE_ID || !env.PUBLISH_SECRET) {
      return json({ error: 'worker_no_configurado' }, 503, cors);
    }

    // Rate limit por IP.
    if (env.SOCIAL_KV) {
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl:${ip}`;
      const count = parseInt(await env.SOCIAL_KV.get(rlKey) || '0', 10);
      if (count >= RATE_LIMIT) {
        return json({ error: 'rate_limited' }, 429, { ...cors, 'Retry-After': String(RATE_WINDOW) });
      }
      await env.SOCIAL_KV.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW });
    }

    let body;
    try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400, cors); }

    if (!safeEqual(String(body.key || ''), env.PUBLISH_SECRET)) {
      return json({ error: 'unauthorized' }, 401, cors);
    }

    const caption  = String(body.caption || '').slice(0, 2200);
    const imageUrl = String(body.imageUrl || '');
    const videoUrl = String(body.videoUrl || '');
    const isReel   = body.format === 'reel' && videoUrl;
    const networks = Array.isArray(body.networks) ? body.networks : ['ig', 'fb'];

    if (isReel) {
      if (!/^https:\/\/.+\.(mp4|mov)(\?.*)?$/i.test(videoUrl)) {
        return json({ error: 'videoUrl_invalida' }, 400, cors);
      }
    } else if (!/^https:\/\/.+\.(jpg|jpeg|png)(\?.*)?$/i.test(imageUrl)) {
      return json({ error: 'imageUrl_invalida' }, 400, cors);
    }

    const result = {};
    if (networks.includes('ig')) {
      try { result.ig = { ok: true, id: isReel ? await publishInstagramReel(env, caption, videoUrl) : await publishInstagram(env, caption, imageUrl) }; }
      catch (e) { result.ig = { ok: false, error: e.message }; }
    }
    if (networks.includes('fb')) {
      try { result.fb = { ok: true, id: isReel ? await publishFacebookVideo(env, caption, videoUrl) : await publishFacebook(env, caption, imageUrl) }; }
      catch (e) { result.fb = { ok: false, error: e.message }; }
    }

    const anyOk = Object.values(result).some(r => r && r.ok);
    return json({ ok: anyOk, result }, anyOk ? 200 : 502, cors);
  },
};
