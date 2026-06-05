// hestia-sheets-sync — Cloudflare Worker
// POST / → recibe reservas JSON de /p-edit → escribe a Google Sheets
//
// Secretos requeridos (wrangler secret put):
//   GCP_SA_KEY  — contenido completo del JSON del service account de GCP
// KV namespace requerido:
//   RATE_KV     — para rate limiting por IP

const SHEET_ID   = '1dWJPG-GxAyHWbRPbSLpp3mTe11bYVA1VaJhKEytUygg';
const SHEET_NAME = 'Reservas';  // pestaña en el Google Sheet

const ALLOWED_ORIGINS = [
  'https://www.hestiayourhome.com',
  'https://hestiayourhome.com',
  'https://aberruezo-ops.github.io',
];

const RATE_LIMIT  = 10;        // peticiones máx por IP
const RATE_WINDOW = 15 * 60;   // ventana en segundos

// Columnas del JSON → columnas del sheet (en orden)
const COLUMNS = [
  'apt', 'responsable', 'telefono', 'huespedes', 'menores_12', 'cuna_trona',
  'mascota', 'dni_enviado', 'noches', 'entrada', 'salida', 'cancelacion',
  'canal', 'contactado', 'f_reserva', 'ingreso_total', 'reserva',
  'pago_previo', 'al_checkin', 'comision', 'renta', 'fianza',
  'gasto_limpieza', 'pagos_leila', 'bai', 'observaciones',
  'rentabilidad_pct', 'precio_neto_noche', 'precio_bruto_noche', 'year',
];

const HEADERS = [
  'Apt', 'Responsable', 'Teléfono', 'Huéspedes', 'Menores -12', 'Cuna/Trona',
  'Mascota', 'DNI enviado', 'Noches', 'Entrada', 'Salida', 'Cancelación',
  'Canal', 'Contactado', 'F. Reserva', 'Ingreso total', 'Reserva',
  'Pago previo', 'Al check-in', 'Comisión €', 'Renta', 'Fianza',
  'Limpieza €', 'Pagos Leila', 'BAI', 'Observaciones',
  'Rent. %', '€/noche neto', '€/noche bruto', 'Año',
];

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    if (origin && !ALLOWED_ORIGINS.includes(origin) && !isLocalhost) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // Rate limiting por IP usando KV — OBLIGATORIO: rechaza si no está configurado
    if (!env.RATE_KV) {
      console.error('RATE_KV namespace not bound — request rejected');
      return new Response(JSON.stringify({ error: 'Service misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    {
      const ip  = req.headers.get('CF-Connecting-IP') || 'unknown';
      const key = `rl:${ip}`;
      const count = parseInt(await env.RATE_KV.get(key) || '0');
      if (count >= RATE_LIMIT) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(RATE_WINDOW) },
        });
      }
      await env.RATE_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validación básica del payload
    const contentLength = req.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 512 * 1024) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reservas = body.reservas;
    if (!Array.isArray(reservas) || reservas.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or empty reservas array' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (reservas.length > 2000) {
      return new Response(JSON.stringify({ error: 'Too many reservas (max 2000)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const VALID_APTS = new Set(['vm', 'vt', 'vs']);
    for (const r of reservas) {
      if (typeof r !== 'object' || r === null) {
        return new Response(JSON.stringify({ error: 'Invalid reserva entry' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (r.apt && !VALID_APTS.has(String(r.apt).toLowerCase())) {
        return new Response(JSON.stringify({ error: `Invalid apt value: ${r.apt}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (r.responsable && String(r.responsable).length > 200) {
        return new Response(JSON.stringify({ error: 'responsable field too long' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!env.GCP_SA_KEY) {
      return new Response(JSON.stringify({ error: 'GCP_SA_KEY secret not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const token = await getAccessToken(env.GCP_SA_KEY);
      const written = await writeToSheet(token, reservas);
      return new Response(JSON.stringify({ ok: true, rows: written }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error('Sheets sync error:', e.message);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function writeToSheet(token, reservas) {
  // Ordenar por año y luego por fecha de entrada
  const sorted = [...reservas].sort((a, b) => {
    const ya = Number(a.year) || 0, yb = Number(b.year) || 0;
    if (ya !== yb) return ya - yb;
    return (a.entrada || '').localeCompare(b.entrada || '');
  });

  const rows = [
    HEADERS,
    ...sorted.map(r => COLUMNS.map(k => {
      const v = r[k];
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean') return v ? 'Sí' : 'No';
      return String(v);
    })),
  ];

  const lastCol = columnLetter(COLUMNS.length);
  const range   = `${SHEET_NAME}!A1:${lastCol}${rows.length}`;

  // 1. Limpiar el rango existente
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:clear`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );

  // 2. Escribir los datos
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ range, majorDimension: 'ROWS', values: rows }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API ${res.status}: ${err}`);
  }

  return rows.length - 1; // filas de datos (sin cabecera)
}

// Convierte un número de columna (1-based) a letra(s): 1→A, 27→AA, etc.
function columnLetter(n) {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

// Firma un JWT con el service account de GCP usando Web Crypto (sin dependencias)
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
    btoa(JSON.stringify(obj))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const unsigned = `${b64url(header)}.${b64url(claims)}`;

  // Importar la clave privada RSA del service account (formato PKCS#8 PEM)
  const pem     = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuf = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${unsigned}.${sig}`;

  // Intercambiar el JWT por un access token de OAuth2
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`OAuth2 error ${tokenRes.status}: ${err}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}
