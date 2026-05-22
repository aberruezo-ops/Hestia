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
      const upstream = await fetch(BEACON_DATA, {
        method:  'POST',
        headers: { 'Content-Type': request.headers.get('Content-Type') || 'application/json' },
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
