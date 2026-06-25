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
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
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
