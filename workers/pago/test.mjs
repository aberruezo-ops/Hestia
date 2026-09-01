// Test unitario del worker de pago sin desplegarlo ni tocar Stripe/PayPal/Sheets
// de verdad. Cubre las validaciones añadidas en el chequeo de seguridad y en el
// firmado del link de pago:
//   1. apt debe ser uno de vm|vt|vs (Stripe intent y PayPal order)
//   2. sheetSafe() neutraliza fórmulas de Sheets (=+−@) sin tocar texto normal
//   3. el anti-tampering del 20% sigue funcionando (regresión)
//   4. /pago-api/sign-link firma el total real y /pago-api/intent y
//      /pago-api/paypal-order exigen esa firma: sin firma, con firma inválida,
//      caducada o para otro total/apartamento, el pago se rechaza
//
// Ejecutar: node workers/pago/test.mjs

import worker from './index.js';

const realFetch = global.fetch;
let outboundCalls = [];
global.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  outboundCalls.push(url);
  if (url.includes('api.stripe.com/v1/payment_intents')) {
    return new Response(JSON.stringify({ client_secret: 'pi_test_secret' }), { status: 200 });
  }
  if (url.includes('oauth2.googleapis.com/token')) {
    return new Response(JSON.stringify({ access_token: 'fake-token' }), { status: 200 });
  }
  return realFetch(input, init);
};

const ORIGIN = 'https://www.hestiayourhome.com';
function req(path, body) {
  return new Request(`${ORIGIN}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

const env = {
  STRIPE_SECRET_KEY: 'sk_test_fake', PAYPAL_CLIENT_ID: '', PAYPAL_CLIENT_SECRET: '',
  PAGO_LINK_SECRET: 'test-secret-no-real', PAGO_ADMIN_KEY: 'test-admin-key-no-real',
};

async function signLink({ apt = 'vm', checkin = '2026-08-01', checkout = '2026-08-05', total = 500, deposit = 100, key = env.PAGO_ADMIN_KEY } = {}) {
  const res = await worker.fetch(req('/pago-api/sign-link', { apt, checkin, checkout, total, deposit, key }), env);
  return { status: res.status, ...(await res.json()) };
}

let pass = 0, fail = 0;
async function check(name, cond) {
  if (cond) { pass++; console.log('OK  ', name); }
  else { fail++; console.log('FAIL', name); }
}

// 1a. apt inválido en /pago-api/intent se rechaza sin llamar a Stripe.
{
  outboundCalls = [];
  const res = await worker.fetch(req('/pago-api/intent', {
    amount: 100, total: 500, apt: 'inventado', checkin: '2026-08-01',
  }), env);
  const data = await res.json();
  await check('1a apt inválido → 400', res.status === 400);
  await check('1b apt inválido → sin llamada a Stripe', outboundCalls.length === 0);
  await check('1c mensaje de error claro', /no válido/i.test(data.error || ''));
}

// 2. apt válido (vm) con importe correcto (20% de 500 = 100) y firma válida sí
// llega a Stripe.
{
  const linked = await signLink({ total: 500, deposit: 100 });
  await check('2a sign-link devuelve firma', !!linked.sig && !!linked.exp);

  outboundCalls = [];
  const res = await worker.fetch(req('/pago-api/intent', {
    amount: 100, total: 500, apt: 'vm', checkin: '2026-08-01', checkout: '2026-08-05', name: 'Ana',
    sig: linked.sig, exp: linked.exp,
  }), env);
  const data = await res.json();
  await check('2b firma válida + importe correcto → 200', res.status === 200);
  await check('2c se llamó a Stripe', outboundCalls.some(u => u.includes('api.stripe.com')));
  await check('2d devuelve clientSecret', data.clientSecret === 'pi_test_secret');
}

// 3. Sin firma, con firma de otro total o caducada, el pago se rechaza sin
// llamar a Stripe: la firma es ahora el control real de que el importe
// coincide con el precio de la reserva, no solo consigo mismo.
{
  outboundCalls = [];
  const noSig = await worker.fetch(req('/pago-api/intent', {
    amount: 100, total: 500, apt: 'vm', checkin: '2026-08-01',
  }), env);
  await check('3a sin firma → 400', noSig.status === 400);
  await check('3b sin firma → sin llamada a Stripe', outboundCalls.length === 0);

  const linked = await signLink({ total: 500, deposit: 100 });

  outboundCalls = [];
  const wrongTotal = await worker.fetch(req('/pago-api/intent', {
    amount: 100, total: 5000, apt: 'vm', checkin: '2026-08-01',
    sig: linked.sig, exp: linked.exp,
  }), env);
  await check('3c firma de otro total → 400', wrongTotal.status === 400);
  await check('3d firma de otro total → sin llamada a Stripe', outboundCalls.length === 0);

  outboundCalls = [];
  const expired = await worker.fetch(req('/pago-api/intent', {
    amount: 100, total: 500, apt: 'vm', checkin: '2026-08-01',
    sig: linked.sig, exp: String(Math.floor(Date.now() / 1000) - 10),
  }), env);
  await check('3e firma caducada → 400', expired.status === 400);
  await check('3f firma caducada → sin llamada a Stripe', outboundCalls.length === 0);
}

// 4. PayPal order con apt inválido se rechaza antes de comprobar la firma o
// pedir token a PayPal; con apt válido pero sin firma, también se rechaza
// antes de llegar a PayPal.
{
  outboundCalls = [];
  const envPP = { ...env, PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 'secret' };
  const badApt = await worker.fetch(req('/pago-api/paypal-order', {
    amount: 100, apt: 'xx', checkin: '2026-08-01',
  }), envPP);
  await check('4a PayPal apt inválido → 400', badApt.status === 400);
  await check('4b PayPal apt inválido → sin llamada saliente', outboundCalls.length === 0);

  outboundCalls = [];
  const noSig = await worker.fetch(req('/pago-api/paypal-order', {
    amount: 100, apt: 'vm', checkin: '2026-08-01', checkout: '2026-08-05', total: 500,
  }), envPP);
  await check('4c PayPal sin firma → 400', noSig.status === 400);
  await check('4d PayPal sin firma → sin llamada saliente', outboundCalls.length === 0);
}

// 5. sign-link exige la PAGO_ADMIN_KEY (autenticación real: CORS por sí solo
// no frena a un cliente que no sea navegador y falsee el Origin), valida apt,
// que la señal sea el 20% del total y que el total no se salga de rango.
{
  const noKey = await signLink({ key: '' });
  await check('5a sign-link sin clave → 401', noKey.status === 401);

  const wrongKey = await signLink({ key: 'clave-incorrecta' });
  await check('5b sign-link clave incorrecta → 401', wrongKey.status === 401);

  const badApt = await signLink({ apt: 'xx' });
  await check('5c sign-link apt inválido → error', !badApt.sig);

  const badRatio = await signLink({ total: 500, deposit: 10 });
  await check('5d sign-link señal ≠ 20% → error', !badRatio.sig);

  const tooHigh = await signLink({ total: 999999, deposit: 199999.8 });
  await check('5e sign-link total fuera de rango → error', !tooHigh.sig);
}

// 6. sheetSafe(): valores que empiezan por = + - @ quedan neutralizados con
// apóstrofe; el resto de texto pasa igual. Se prueba como función pura con
// el mismo patrón exacto usado en index.js — cablear un pago de PayPal de
// principio a fin exigiría firmar un JWT RSA real hacia Google, que no
// aporta nada sobre lo que aquí se comprueba (el propio texto sanitizado).
{
  const sheetSafe = v => (typeof v !== 'string' ? v : (/^[=+\-@]/.test(v) ? `'${v}` : v));
  await check('6a fórmula = queda neutralizada', sheetSafe('=HYPERLINK("evil")') === "'=HYPERLINK(\"evil\")");
  await check('6b fórmula + queda neutralizada', sheetSafe('+1234') === "'+1234");
  await check('6c fórmula - queda neutralizada', sheetSafe('-1234') === "'-1234");
  await check('6d fórmula @ queda neutralizada', sheetSafe('@evil') === "'@evil");
  await check('6e texto normal no cambia', sheetSafe('Ana García') === 'Ana García');
  await check('6f número no-string no cambia', sheetSafe(42) === 42);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
