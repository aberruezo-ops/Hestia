// Hestía — Analytics Proxy Worker
//
// Dos cosas viven aquí:
//
// 1) Proxy del beacon de Cloudflare Web Analytics, servido desde un dominio
//    propio para que los ad-blockers no lo detecten por hostname.
// 2) Agregador del embudo de reserva (_hestiaTrack en shared.jsx): cuenta
//    cuántas veces ocurre cada paso del embudo por día. SOLO contadores
//    agregados por evento+día, nunca un registro por visitante: no hay IP,
//    cookie ni identificador de sesión en lo que se guarda aquí.
//
// Rutas:
//   GET  /s.js  → beacon.min.js (cacheado 2h en edge de CF)
//   POST /r     → reenvía los datos RUM al endpoint de CF
//   POST /e     → registra 1 ocurrencia de un evento del embudo (rate limited)
//   GET  /stats?key=…&days=N → cuentas agregadas de los últimos N días.
//                              Requiere READ_SECRET.
//
// KV namespace requerido (wrangler kv namespace create EVENTS_KV):
//   EVENTS_KV
// Secreto requerido para leer /stats (wrangler secret put READ_SECRET):
//   READ_SECRET
//
// Deploy:
//   cd workers/analytics-proxy
//   wrangler kv namespace create EVENTS_KV     # pega el id en wrangler.toml
//   wrangler secret put READ_SECRET            # elige una clave larga
//   wrangler deploy
//
// El proxy del beacon (/s.js, /r, /err) sigue sin necesitar KV ni secretos;
// solo /e y /stats los usan.

const BEACON_SCRIPT = 'https://static.cloudflareinsights.com/beacon.min.js';
const BEACON_DATA   = 'https://cloudflareinsights.com/cdn-cgi/rum';

// Único catálogo de eventos de embudo que se aceptan y se pueden leer.
// Cerrado a propósito: así /e no se puede usar para acumular contadores
// arbitrarios, y /stats siempre devuelve las mismas claves.
const FUNNEL_EVENTS = ['search_initiated', 'dates_selected', 'booking_step2', 'booking_step3', 'booking_sent', 'whatsapp_click'];
const MAX_STATS_DAYS = 90;

// Canal de origen de la visita (ver _hestiaDetectSrc en shared.jsx). Cubo
// cerrado también aquí, por la misma razón. Solo se acumula por canal para
// estos eventos (no todos): son los que responden a "de dónde viene el
// tráfico que de verdad convierte", sin multiplicar escrituras en KV por
// eventos intermedios del embudo que no aportan esa lectura.
const SOURCES = ['direct', 'organic_search', 'social', 'referral', 'email', 'other'];
const SRC_TRACKED_EVENTS = ['search_initiated', 'booking_sent', 'whatsapp_click'];

// Rate limiting por IP del POST /e (anti-abuso).
const RATE_LIMIT  = 120;         // eventos máx por IP
const RATE_WINDOW = 15 * 60;     // ventana en segundos

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

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

const todayKey = () => new Date().toISOString().slice(0, 10);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const origin = request.headers.get('Origin') || '';
    const CORS = corsHeaders(origin);

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
          'X-Content-Type-Options': 'nosniff',
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

    // ── POST /e — 1 ocurrencia de un evento del embudo ──────────
    // Body: { name, src? }. Solo suma +1 al contador del día para ese
    // nombre (y, si aplica, +1 al acumulado por canal de origen); no
    // guarda IP, ni ts, ni nada ligado al visitante. Si el nombre no está
    // en FUNNEL_EVENTS, se ignora en silencio (204 igualmente, para no dar
    // pistas a quien esté sondeando el endpoint). `src` fuera de SOURCES
    // cae en 'other'.
    if (pathname === '/e' && request.method === 'POST') {
      if (!env.EVENTS_KV) return new Response(null, { status: 204, headers: CORS });

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = 'rl:' + ip;
      const count = parseInt(await env.EVENTS_KV.get(rlKey) || '0', 10);
      if (count >= RATE_LIMIT) {
        return json({ error: 'rate_limited' }, 429, { ...CORS, 'Retry-After': String(RATE_WINDOW) });
      }
      await env.EVENTS_KV.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW });

      let d = {};
      try { d = await request.json(); } catch (_) {}
      const name = String(d.name || '');
      if (FUNNEL_EVENTS.includes(name)) {
        const evKey = `ev:${todayKey()}:${name}`;
        const writes = [
          env.EVENTS_KV.get(evKey).then(cur =>
            env.EVENTS_KV.put(evKey, String((parseInt(cur || '0', 10)) + 1), { expirationTtl: 400 * 86400 })),
        ];
        // Contador acumulado por canal de origen (sin fecha, todo el histórico):
        // solo para los eventos que responden a "qué canal trae tráfico que
        // convierte", y sin desglose diario para no disparar el número de
        // lecturas/escrituras a KV que hace falta luego en /stats.
        if (SRC_TRACKED_EVENTS.includes(name)) {
          const src = SOURCES.includes(d.src) ? d.src : 'other';
          const srcKey = `evsrc:${name}:${src}`;
          writes.push(env.EVENTS_KV.get(srcKey).then(cur =>
            env.EVENTS_KV.put(srcKey, String((parseInt(cur || '0', 10)) + 1), { expirationTtl: 400 * 86400 })));
        }
        await Promise.all(writes);
      }
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── GET /stats?key=SECRET&days=N — cuentas agregadas (admin) ─
    if (pathname === '/stats' && request.method === 'GET') {
      if (!env.READ_SECRET || !safeEqual(url.searchParams.get('key') || '', env.READ_SECRET)) {
        return json({ error: 'unauthorized' }, 401, CORS);
      }
      if (!env.EVENTS_KV) return json({ error: 'storage_unavailable' }, 503, CORS);

      const days = Math.min(MAX_STATS_DAYS, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10)));
      const dates = Array.from({ length: days }, (_, i) =>
        new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));

      const totals = {};
      const byDay = {};
      await Promise.all(FUNNEL_EVENTS.map(async name => {
        totals[name] = 0;
        const perDay = await Promise.all(dates.map(d => env.EVENTS_KV.get(`ev:${d}:${name}`)));
        perDay.forEach((v, i) => {
          const n = parseInt(v || '0', 10) || 0;
          totals[name] += n;
          (byDay[dates[i]] ||= {})[name] = n;
        });
      }));

      // Desglose por canal de origen: acumulado histórico, no filtrable por
      // rango de días (ver comentario en SRC_TRACKED_EVENTS). Pocas claves
      // fijas (3 eventos × 6 canales), no crece con `days`.
      const bySource = {};
      await Promise.all(SRC_TRACKED_EVENTS.map(async name => {
        bySource[name] = {};
        await Promise.all(SOURCES.map(async src => {
          const v = await env.EVENTS_KV.get(`evsrc:${name}:${src}`);
          bySource[name][src] = parseInt(v || '0', 10) || 0;
        }));
      }));

      return json({ days, totals, byDay, bySource }, 200, CORS);
    }

    return new Response('Not found', { status: 404 });
  },
};
