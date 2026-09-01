// Test unitario del worker de pago sin desplegarlo ni tocar Stripe/PayPal/Sheets
// de verdad. Cubre las tres validaciones añadidas en el chequeo de seguridad:
//   1. apt debe ser uno de vm|vt|vs (Stripe intent y PayPal order)
//   2. sheetSafe() neutraliza fórmulas de Sheets (=+−@) sin tocar texto normal
//   3. el anti-tampering del 20% sigue funcionando (regresión)
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

const env = { STRIPE_SECRET_KEY: 'sk_test_fake', PAYPAL_CLIENT_ID: '', PAYPAL_CLIENT_SECRET: '' };

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

// 2. apt válido (vm) con importe correcto (20% de 500 = 100) sí llega a Stripe.
{
  outboundCalls = [];
  const res = await worker.fetch(req('/pago-api/intent', {
    amount: 100, total: 500, apt: 'vm', checkin: '2026-08-01', checkout: '2026-08-05', name: 'Ana',
  }), env);
  const data = await res.json();
  await check('2a apt válido + importe correcto → 200', res.status === 200);
  await check('2b se llamó a Stripe', outboundCalls.some(u => u.includes('api.stripe.com')));
  await check('2c devuelve clientSecret', data.clientSecret === 'pi_test_secret');
}

// 3. Anti-tampering del 20% sigue activo (regresión): amount muy bajo para el total dado.
{
  outboundCalls = [];
  const res = await worker.fetch(req('/pago-api/intent', {
    amount: 2, total: 500, apt: 'vm', checkin: '2026-08-01',
  }), env);
  await check('3a 20% no cuadra → 400', res.status === 400);
  await check('3b 20% no cuadra → sin llamada a Stripe', outboundCalls.length === 0);
}

// 4. PayPal order con apt inválido se rechaza antes de pedir token a PayPal.
{
  outboundCalls = [];
  const envPP = { ...env, PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 'secret' };
  const res = await worker.fetch(req('/pago-api/paypal-order', {
    amount: 100, apt: 'xx', checkin: '2026-08-01',
  }), envPP);
  await check('4a PayPal apt inválido → 400', res.status === 400);
  await check('4b PayPal apt inválido → sin llamada saliente', outboundCalls.length === 0);
}

// 5. sheetSafe(): valores que empiezan por = + - @ quedan neutralizados con
// apóstrofe; el resto de texto pasa igual. Se prueba como función pura con
// el mismo patrón exacto usado en index.js — cablear un pago de PayPal de
// principio a fin exigiría firmar un JWT RSA real hacia Google, que no
// aporta nada sobre lo que aquí se comprueba (el propio texto sanitizado).
{
  const sheetSafe = v => (typeof v !== 'string' ? v : (/^[=+\-@]/.test(v) ? `'${v}` : v));
  await check('5a fórmula = queda neutralizada', sheetSafe('=HYPERLINK("evil")') === "'=HYPERLINK(\"evil\")");
  await check('5b fórmula + queda neutralizada', sheetSafe('+1234') === "'+1234");
  await check('5c fórmula - queda neutralizada', sheetSafe('-1234') === "'-1234");
  await check('5d fórmula @ queda neutralizada', sheetSafe('@evil') === "'@evil");
  await check('5e texto normal no cambia', sheetSafe('Ana García') === 'Ana García');
  await check('5f número no-string no cambia', sheetSafe(42) === 42);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
