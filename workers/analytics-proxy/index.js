// Hestía — Analytics Proxy Worker
//
// Sirve el beacon de Cloudflare Web Analytics desde un dominio propio
// para que los ad-blockers no lo detecten por hostname.
//
// Rutas:
//   GET  /s.js  → beacon.min.js (cacheado 2h en edge de CF)
//   POST /r     → reenvía los datos RUM al endpoint de CF
//
// Deploy:
//   cd workers/analytics-proxy
//   wrangler deploy
//
// No necesita secretos.

const BEACON_SCRIPT = 'https://static.cloudflareinsights.com/beacon.min.js';
const BEACON_DATA   = 'https://cloudflareinsights.com/cdn-cgi/rum';

const CORS = {
  'Access-Control-Allow-Origin':  'https://hestiayourhome.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
};

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── POST /err — beacon de errores de producción del sitio ───
    // Siempre loguea (visible con `wrangler tail`). Además, si hay un KV
    // (ERR_KV) para throttlear, envía un email por Web3Forms como máximo una
    // vez cada 30 min por firma de error, para avisar sin inundar la bandeja.
    if (pathname === '/err' && request.method === 'POST') {
      let d = {};
      try { d = await request.json(); } catch (_) {}
      const msg = String(d.msg || '').slice(0, 300);
      if (!msg) return new Response(null, { status: 204, headers: CORS });
      console.log('[hestia-err]', JSON.stringify({ msg, page: d.page, src: d.src, line: d.line, ua: d.ua }));

      if (env && env.ERR_KV) {
        const sig = 'erremail:' + msg.slice(0, 80);
        const seen = await env.ERR_KV.get(sig);
        if (!seen) {
          await env.ERR_KV.put(sig, '1', { expirationTtl: 1800 });
          const key = env.W3F_KEY || '95a86784-6d6a-496f-9830-15759c0a3cff';
          try {
            const fd = new URLSearchParams({
              access_key: key,
              subject: '⚠️ Error en la web de Hestía',
              from_name: 'Monitor Hestía',
              message: `Página: ${d.page || '?'}\nError: ${msg}\nOrigen: ${d.src || '?'}:${d.line || 0}\nNavegador: ${d.ua || '?'}`,
            });
            await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
          } catch (_) { /* el log ya quedó; el email es best-effort */ }
        }
      }
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── GET /s.js — script del beacon ──────────────────────────
    if (pathname === '/s.js' && request.method === 'GET') {
      const upstream = await fetch(BEACON_SCRIPT, {
        cf: { cacheEverything: true, cacheTtl: 7200 },
      });
      if (!upstream.ok) {
        return new Response('upstream error', { status: 502 });
      }
      return new Response(upstream.body, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=7200',
          ...CORS,
        },
      });
    }

    // ── POST /r — datos RUM ─────────────────────────────────────
    if (pathname === '/r' && request.method === 'POST') {
      const body = await request.arrayBuffer();
      // Reenviamos las cabeceras del visitante para que Cloudflare atribuya bien
      // el dato: User-Agent (navegador/dispositivo), Referer, idioma e IP real
      // (sin estas, las visitas salían incompletas o sin país/dispositivo).
      const fwd = { 'Content-Type': request.headers.get('Content-Type') || 'application/json' };
      const ua = request.headers.get('User-Agent');      if (ua) fwd['User-Agent'] = ua;
      const ref = request.headers.get('Referer');         if (ref) fwd['Referer'] = ref;
      const al = request.headers.get('Accept-Language');  if (al) fwd['Accept-Language'] = al;
      const ip = request.headers.get('CF-Connecting-IP'); if (ip) fwd['X-Forwarded-For'] = ip;
      const upstream = await fetch(BEACON_DATA, {
        method:  'POST',
        headers: fwd,
        body,
      });
      return new Response(upstream.body, {
        status:  upstream.status,
        headers: { ...CORS },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
