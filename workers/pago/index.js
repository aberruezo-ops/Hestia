// hestia-pago — Cloudflare Worker
// Gestiona pagos de señal (prereserva) via Stripe y PayPal.
//
// Secretos requeridos (wrangler secret put):
//   STRIPE_SECRET_KEY       — sk_test_... / sk_live_...
//   STRIPE_WEBHOOK_SECRET   — whsec_... (del dashboard Stripe → Webhooks)
//   PAYPAL_CLIENT_ID        — sandbox o live
//   PAYPAL_CLIENT_SECRET    — sandbox o live
//   GCP_SA_KEY              — JSON completo del service account (mismo que sheets-sync)
//   PAGO_LINK_SECRET        — secreto para firmar el total del link de pago (openssl rand -hex 32)
//   PAGO_ADMIN_KEY          — clave que debe enviar /p-edit para poder firmar un link (openssl rand -hex 24)
//
// KV namespace requerido:
//   RATE_KV  — para rate limiting por IP
//
// Variable de entorno (en wrangler.toml o via wrangler secret):
//   PAYPAL_ENV  — "sandbox" (por defecto) o "live"

const SHEET_ID   = '1dWJPG-GxAyHWbRPbSLpp3mTe11bYVA1VaJhKEytUygg';
const SHEET_NAME = 'Pagos';

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

const RATE_LIMIT  = 20;
const RATE_WINDOW = 60 * 60; // 1 hora en segundos

// /pago-api/sign-link es una acción de admin (mintar la firma de un importe):
// límite propio y más estricto, igual que pide el checklist de seguridad del
// proyecto para endpoints sensibles (10 req/IP/15 min).
const SIGN_RATE_LIMIT  = 10;
const SIGN_RATE_WINDOW = 15 * 60;

const LINK_SIG_TTL = 90 * 24 * 60 * 60; // validez de la firma del link de pago (90 días)
const MAX_SIGNABLE_TOTAL = 50000; // tope de cordura: ninguna reserva real de Hestía llega a esto

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    if (origin && !ALLOWED_ORIGINS.includes(origin) && !isLocalhost) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    const url  = new URL(req.url);
    const path = url.pathname;

    // Stripe webhook — no usa CORS normal (viene de Stripe, no del navegador)
    if (path === '/pago-api/stripe-webhook' && req.method === 'POST') {
      return handleStripeWebhook(req, env);
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    const ip = req.headers.get('CF-Connecting-IP') || 'unknown';

    // Rate limiting por IP (general)
    if (env.RATE_KV) {
      const key   = `rl:pago:${ip}`;
      const count = parseInt(await env.RATE_KV.get(key) || '0');
      if (count >= RATE_LIMIT) {
        return new Response(JSON.stringify({ error: 'Demasiadas peticiones. Espera un momento.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(RATE_WINDOW) },
        });
      }
      await env.RATE_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    }

    // Rate limiting adicional y más estricto para sign-link: es una acción de
    // admin que emite firmas, no un pago de huésped.
    if (path === '/pago-api/sign-link' && env.RATE_KV) {
      const key   = `rl:pago:sign:${ip}`;
      const count = parseInt(await env.RATE_KV.get(key) || '0');
      if (count >= SIGN_RATE_LIMIT) {
        return new Response(JSON.stringify({ error: 'Demasiadas peticiones. Espera un momento.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(SIGN_RATE_WINDOW) },
        });
      }
      await env.RATE_KV.put(key, String(count + 1), { expirationTtl: SIGN_RATE_WINDOW });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'JSON inválido' }, 400, corsHeaders);
    }

    if (path === '/pago-api/sign-link')      return handleSignLink(body, env, corsHeaders);
    if (path === '/pago-api/intent')         return handleIntent(body, env, corsHeaders);
    if (path === '/pago-api/paypal-order')   return handlePaypalOrder(body, env, corsHeaders);
    if (path === '/pago-api/paypal-capture') return handlePaypalCapture(body, env, corsHeaders);

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

// ── Firma del link de pago ────────────────────────────────────────────────
// El total de la reserva lo declara /p-edit (fuente: _calcStay vía prices.json),
// nunca el navegador de quien paga. Este endpoint sella ese total con un HMAC
// de servidor para que /pago-api/intent y /pago-api/paypal-order puedan
// verificar que el importe de la URL no se ha editado a mano. Sin este sello,
// el único control era comprobar que amount = 20% de total, pero total lo
// controlaba quien llamaba al endpoint: cuadraba consigo mismo, no con el
// precio real de la reserva.
async function handleSignLink(body, env, corsHeaders) {
  const { apt, checkin, checkout, total, deposit, key } = body;

  // Autenticación real de quién puede firmar: CORS solo filtra navegadores
  // (un cliente que no sea navegador puede falsear el Origin sin problema),
  // así que sin esta clave cualquiera que alcance el endpoint podría mintar
  // una firma para el importe que quisiera. PAGO_ADMIN_KEY es un secreto
  // propio del Worker, nunca el PAT de GitHub: no debe enviarse a GitHub ni
  // este endpoint debe recibir el PAT.
  if (!env.PAGO_ADMIN_KEY) {
    return json({ error: 'Firma no configurada' }, 500, corsHeaders);
  }
  if (!key || !timingSafeEqualStr(String(key), env.PAGO_ADMIN_KEY)) {
    return json({ error: 'No autorizado' }, 401, corsHeaders);
  }

  if (!apt || !checkin || !checkout || !total || !deposit) {
    return json({ error: 'Faltan parámetros: apt, checkin, checkout, total, deposit' }, 400, corsHeaders);
  }
  if (!['vm', 'vt', 'vs'].includes(apt)) {
    return json({ error: 'Apartamento no válido' }, 400, corsHeaders);
  }
  if (Number(total) > MAX_SIGNABLE_TOTAL) {
    return json({ error: 'Total fuera de rango' }, 400, corsHeaders);
  }
  const expected = Math.round(total * 0.20);
  if (Math.abs(deposit - expected) > 2) {
    return json({ error: 'La señal debe ser el 20% del total' }, 400, corsHeaders);
  }
  if (!env.PAGO_LINK_SECRET) {
    return json({ error: 'Firma no configurada' }, 500, corsHeaders);
  }

  const exp = Math.floor(Date.now() / 1000) + LINK_SIG_TTL;
  const sig = await hmacHex(env.PAGO_LINK_SECRET, linkPayload({ apt, checkin, checkout, total, deposit, exp }));
  return json({ sig, exp }, 200, corsHeaders);
}

const linkPayload = ({ apt, checkin, checkout, total, deposit, exp }) =>
  `${apt}|${checkin}|${checkout}|${total}|${deposit}|${exp}`;

// Mensaje de error si la firma falta, ha caducado o no coincide; null si es
// válida. Compartido por /pago-api/intent y /pago-api/paypal-order.
async function checkLinkSignature(env, { apt, checkin, checkout, total, deposit, exp, sig }) {
  if (!env.PAGO_LINK_SECRET) return 'Firma no configurada';
  if (!sig || !exp) return 'Link de pago sin firmar';
  if (Math.floor(Date.now() / 1000) > Number(exp)) return 'Link de pago caducado';
  const expectedSig = await hmacHex(env.PAGO_LINK_SECRET, linkPayload({ apt, checkin, checkout, total, deposit, exp }));
  if (!timingSafeEqualStr(expectedSig, sig)) return 'Firma no válida';
  return null;
}

// ── Stripe: crear PaymentIntent ───────────────────────────────────────────
async function handleIntent(body, env, corsHeaders) {
  const { amount, total, apt, checkin, checkout, name, sig, exp } = body;

  if (!amount || !total || !apt || !checkin) {
    return json({ error: 'Faltan parámetros: amount, total, apt, checkin' }, 400, corsHeaders);
  }
  if (!['vm', 'vt', 'vs'].includes(apt)) {
    return json({ error: 'Apartamento no válido' }, 400, corsHeaders);
  }

  const sigError = await checkLinkSignature(env, { apt, checkin, checkout, total, deposit: amount, exp, sig });
  if (sigError) return json({ error: sigError }, 400, corsHeaders);

  // Anti-tampering: el depósito debe ser el 20% del total (±2€ por redondeo)
  const expected = Math.round(total * 0.20);
  if (Math.abs(amount - expected) > 2) {
    return json({ error: 'Importe no válido' }, 400, corsHeaders);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe no configurado' }, 500, corsHeaders);
  }

  try {
    const params = new URLSearchParams({
      amount:      String(Math.round(amount * 100)), // en céntimos
      currency:    'eur',
      description: `Señal Hestía ${apt} ${checkin}`,
      'metadata[apt]':      apt,
      'metadata[checkin]':  checkin,
      'metadata[checkout]': checkout || '',
      'metadata[name]':     name || '',
    });

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) return json({ error: data.error?.message || 'Error Stripe' }, 502, corsHeaders);

    return json({ clientSecret: data.client_secret }, 200, corsHeaders);
  } catch (e) {
    console.error('Stripe intent error:', e.message);
    return json({ error: 'Error interno' }, 500, corsHeaders);
  }
}

// ── Stripe: webhook (payment_intent.succeeded) ────────────────────────────
async function handleStripeWebhook(req, env) {
  const sig  = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!env.STRIPE_WEBHOOK_SECRET || !sig) {
    return new Response('Webhook secret not configured', { status: 400 });
  }

  // Verificar firma HMAC-SHA256
  try {
    const valid = await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) return new Response('Invalid signature', { status: 400 });
  } catch (e) {
    return new Response('Signature error: ' + e.message, { status: 400 });
  }

  let event;
  try { event = JSON.parse(body); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const meta = pi.metadata || {};
    if (env.GCP_SA_KEY) {
      try {
        const token = await getAccessToken(env.GCP_SA_KEY);
        await appendToSheet(token, [
          new Date().toISOString().slice(0,10),
          meta.apt || '', meta.checkin || '', meta.checkout || '', meta.name || '',
          '', (pi.amount / 100).toFixed(2), 'stripe', pi.id, 'confirmado',
        ]);
      } catch (e) {
        console.error('Sheets error after stripe webhook:', e.message);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200, headers: {
      'Content-Type': 'application/json',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// ── PayPal: crear Order ───────────────────────────────────────────────────
async function handlePaypalOrder(body, env, corsHeaders) {
  const { amount, apt, checkin, checkout, total, name, sig, exp } = body;
  if (!amount || !apt || !checkin) return json({ error: 'Faltan parámetros' }, 400, corsHeaders);
  if (!['vm', 'vt', 'vs'].includes(apt)) {
    return json({ error: 'Apartamento no válido' }, 400, corsHeaders);
  }

  const sigError = await checkLinkSignature(env, { apt, checkin, checkout, total, deposit: amount, exp, sig });
  if (sigError) return json({ error: sigError }, 400, corsHeaders);

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    return json({ error: 'PayPal no configurado' }, 500, corsHeaders);
  }

  try {
    const base  = paypalBase(env);
    const token = await getPaypalToken(base, env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET);
    const order = await createPaypalOrder(base, token, amount, apt, checkin, name);
    if (!order.id) return json({ error: order.message || 'Error PayPal' }, 502, corsHeaders);
    return json({ id: order.id }, 200, corsHeaders);
  } catch (e) {
    console.error('PayPal order error:', e.message);
    return json({ error: 'Error interno' }, 500, corsHeaders);
  }
}

// ── PayPal: capturar Order ────────────────────────────────────────────────
async function handlePaypalCapture(body, env, corsHeaders) {
  const { orderId, apt, checkin, checkout, name, total, deposit } = body;
  if (!orderId) return json({ error: 'Falta orderId' }, 400, corsHeaders);
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    return json({ error: 'PayPal no configurado' }, 500, corsHeaders);
  }

  try {
    const base    = paypalBase(env);
    const token   = await getPaypalToken(base, env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET);
    const capture = await capturePaypalOrder(base, token, orderId);

    if (capture.status !== 'COMPLETED') {
      return json({ error: `Estado inesperado: ${capture.status}` }, 502, corsHeaders);
    }

    // Escribir en Sheets
    if (env.GCP_SA_KEY) {
      try {
        const sheetsToken = await getAccessToken(env.GCP_SA_KEY);
        await appendToSheet(sheetsToken, [
          new Date().toISOString().slice(0,10),
          apt || '', checkin || '', checkout || '', name || '',
          total ? String(total) : '',
          deposit ? String(deposit) : '',
          'paypal', orderId, 'confirmado',
        ]);
      } catch (e) {
        console.error('Sheets error after paypal capture:', e.message);
      }
    }

    return json({ status: 'COMPLETED' }, 200, corsHeaders);
  } catch (e) {
    console.error('PayPal capture error:', e.message);
    return json({ error: 'Error interno' }, 500, corsHeaders);
  }
}

// ── PayPal helpers ────────────────────────────────────────────────────────
const paypalBase = env => (env.PAYPAL_ENV === 'live')
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPaypalToken(base, clientId, clientSecret) {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal token error ${res.status}`);
  const { access_token } = await res.json();
  return access_token;
}

async function createPaypalOrder(base, token, amount, apt, checkin, name) {
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'EUR', value: Number(amount).toFixed(2) },
        description: `Señal Hestía ${apt} ${checkin}${name ? ' · ' + name : ''}`,
      }],
    }),
  });
  return res.json();
}

async function capturePaypalOrder(base, token, orderId) {
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return res.json();
}

// Sheets formula injection: con valueInputOption=USER_ENTERED, un valor que
// empiece por = + - @ se interpreta como fórmula al abrir la hoja (p. ej. un
// nombre "=HYPERLINK(...)" en el formulario de pago). Anteponer un apóstrofe
// fuerza texto literal, igual que hace Sheets al pegar manualmente.
const sheetSafe = v => {
  if (typeof v !== 'string') return v;
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
};

// ── Google Sheets: append row ─────────────────────────────────────────────
async function appendToSheet(token, row) {
  const range = `${SHEET_NAME}!A1`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row.map(sheetSafe)] }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets append error ${res.status}: ${err}`);
  }
}

// Reutiliza íntegramente el patrón de sheets-sync (JWT + GCP OAuth2)
async function getAccessToken(saKeyJson) {
  const sa  = JSON.parse(saKeyJson);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss:   sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  };
  const b64url = obj =>
    btoa(JSON.stringify(obj)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const unsigned = `${b64url(header)}.${b64url(claims)}`;
  const pem      = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const keyData  = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
  const sig    = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const jwt    = `${unsigned}.${sig}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!tokenRes.ok) throw new Error(`OAuth2 error ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();
  return access_token;
}

// ── HMAC-SHA256 (Web Crypto, sin dependencias) ────────────────────────────
async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Comparación en tiempo constante: evita filtrar por timing cuánto de una
// firma coincide. Los hex de un HMAC-SHA256 miden siempre 64 caracteres; si
// la longitud ya difiere, no es una firma válida.
function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── Stripe webhook signature verification ────────────────────────────────
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k.trim()] = v?.trim();
    return acc;
  }, {});
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const computed = await hmacHex(secret, `${ts}.${rawBody}`);
  return timingSafeEqualStr(computed, v1);
}

// ── Utility ───────────────────────────────────────────────────────────────
const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
