// gen-boletin-mes.mjs
//
// Boletín mensual para huéspedes que han dado su consentimiento (casilla
// "boletín" del registro de viajeros). Reutiliza la edición vigente del blog:
// no se escribe nada nuevo, solo se maqueta.
//
// Genera dos piezas en docs/boletin/<YYYY-MM>.*:
//   .html  versión email y "ver en el navegador" (tablas, estilos en línea,
//          noindex; no se enlaza desde la web ni entra en el sitemap)
//   .txt   versión corta para WhatsApp (lista de difusión), lista para pegar
//
// El envío es manual o por el Worker de boletín cuando exista; este script
// no manda nada ni toca datos de huéspedes. Enlaces con utm_source=boletin.
//
// Uso:  node scripts/gen-boletin-mes.mjs [--month 2026-09]
//   Sin --month usa la edición vigente del .jsx; con --month, el JSON de
//   docs/data/noticias/<mes>.json (para preparar el boletín antes del merge).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const JSX_PATH = 'docs/components/noticias-page.jsx';
const OUT_DIR  = 'docs/boletin';
const SITE     = 'https://www.hestiayourhome.com';
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const APT = {
  'Hestía Mar':      { color: '#6B7A3A', slug: 'mar.html' },
  'Hestía Thalassa': { color: '#B86A3C', slug: 'thalassa.html' },
  'Hestía Salinas':  { color: '#7A5E1A', slug: 'salinas.html' },
};

const args = process.argv.slice(2);
const monthArg = args[args.indexOf('--month') + 1];
const N = args.includes('--month') ? JSON.parse(readFileSync(`docs/data/noticias/${monthArg}.json`, 'utf8')) : loadNoticias();
const m = String(N.edition?.es || '').match(/^(\p{L}+)\s+(\d{4})$/u);
const mon = m ? MONTHS_ES.indexOf(m[1].toLowerCase()) + 1 : 0;
if (!mon) throw new Error(`No reconozco la edición "${N.edition?.es}"`);
const key = `${m[2]}-${String(mon).padStart(2, '0')}`;
const utm = (path) => `${SITE}/${path}?utm_source=boletin&utm_medium=email&utm_campaign=boletin-${key}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function loadNoticias() {
  const txt = readFileSync(JSX_PATH, 'utf8');
  const bs = txt.indexOf('{', txt.indexOf('const NOTICIAS = '));
  let depth = 0, inStr = false, e = false;
  for (let k = bs; k < txt.length; k++) {
    const c = txt[k];
    if (inStr) { if (e) e = false; else if (c === '\\') e = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '{') depth++; else if (c === '}' && --depth === 0) return JSON.parse(txt.slice(bs, k + 1));
  }
  throw new Error('Bloque NOTICIAS sin cerrar');
}

const arts = (N.territorio || []).flatMap(c => c.articles.map(a => ({ ...a, cat: c.cat.es }))).slice(0, 4);

const vozHtml = (N.voz || []).map(v => {
  const a = APT[v.apt] || { color: '#3D1A35', slug: 'index.html' };
  return `
  <tr><td style="padding:22px 28px 0;">
    <p style="margin:0 0 6px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${a.color};">${esc(v.apt)}</p>
    <p style="margin:0 0 10px;font:15px/1.6 Georgia,serif;color:#3D1A35;">${esc(v.curiosidad.es)}</p>
    <p style="margin:0;font:14px/1.6 Arial,sans-serif;color:#7A5A72;">${esc(v.reco.es)}</p>
    <p style="margin:10px 0 0;"><a href="${utm(a.slug)}" style="font:600 13px Arial,sans-serif;color:${a.color};text-decoration:none;">Ver ${esc(v.apt)} &rarr;</a></p>
  </td></tr>`;
}).join('');

const agendaHtml = arts.map(a => `
    <p style="margin:0 0 4px;font:600 14px/1.5 Arial,sans-serif;color:#3D1A35;">${esc(a.titulo.es)}</p>
    <p style="margin:0 0 14px;font:13px/1.6 Arial,sans-serif;color:#7A5A72;">${esc(a.cuerpo.es)}</p>`).join('');

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Hestía · ${esc(N.edition.es)}</title></head>
<body style="margin:0;background:#F5EFE4;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5EFE4;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#FFFCF6;border-radius:12px 0 12px 0;overflow:hidden;">
  <tr><td style="background:#2A0F2E;padding:28px;text-align:center;">
    <div style="display:inline-block;width:40px;height:40px;line-height:40px;background:#C87A45;border-radius:10px 0 10px 0;color:#fff;font:600 20px Georgia,serif;">H</div>
    <p style="margin:10px 0 0;font:500 16px Georgia,serif;letter-spacing:.12em;color:#fff;">HESTÍA</p>
    <p style="margin:4px 0 0;font:11px Arial,sans-serif;letter-spacing:.08em;color:rgba(255,255,255,.55);">BOLETÍN · ${esc(N.edition.es).toUpperCase()}</p>
  </td></tr>
  <tr><td style="padding:26px 28px 0;font:15px/1.6 Arial,sans-serif;color:#3D1A35;">Hola,<br>esto es lo que pasa este mes en Vera Playa y en los tres Hestías. Te lo mandamos porque nos lo pediste; si ya no lo quieres, responde "baja" y listo.</td></tr>
  ${vozHtml}
  <tr><td style="padding:26px 28px 0;">
    <p style="margin:0 0 14px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#A85E2E;">Agenda de ${esc(MONTHS_ES[mon - 1])}</p>
    ${agendaHtml}
    <p style="margin:0;"><a href="${utm('noticias.html')}" style="font:600 13px Arial,sans-serif;color:#A85E2E;text-decoration:none;">Toda la agenda en el blog &rarr;</a></p>
  </td></tr>
  <tr><td style="padding:28px;text-align:center;">
    <a href="${utm('reservas.html')}" style="display:inline-block;background:#C87A45;color:#fff;font:600 14px Arial,sans-serif;letter-spacing:.03em;padding:14px 26px;border-radius:10px 0 10px 0;text-decoration:none;">Reservar directo, 0% comisiones &rarr;</a>
    <p style="margin:12px 0 0;font:12px/1.6 Arial,sans-serif;color:#7A5A72;">Como ya has estado en casa: mejoramos cualquier precio que encuentres y te respondemos en minutos. Alex y Fran.</p>
  </td></tr>
  <tr><td style="padding:16px 28px 22px;border-top:1px solid rgba(42,15,46,.08);font:11px/1.6 Arial,sans-serif;color:#9C8A97;">Hestía Your Home · Vera Playa, Almería · <a href="${SITE}" style="color:#9C8A97;">hestiayourhome.com</a><br>Recibes este boletín porque marcaste la casilla al hacer tu registro de viajeros. Para dejar de recibirlo, responde a este correo con "baja".</td></tr>
</table></td></tr></table>
</body></html>
`;

const txt = [
  `Hola, soy Alex, de Hestía (Vera Playa). Esto es lo que pasa en ${MONTHS_ES[mon - 1]}:`,
  '',
  ...(N.voz || []).map(v => `• ${v.apt}: ${firstSentence(v.curiosidad.es)}`),
  '',
  ...arts.slice(0, 2).map(a => `• ${a.titulo.es}`),
  '',
  `Toda la agenda: ${utm('noticias.html').replace('utm_medium=email', 'utm_medium=whatsapp')}`,
  `Si te apetece volver: reserva directo y mejoramos cualquier precio que veas. ${utm('reservas.html').replace('utm_medium=email', 'utm_medium=whatsapp')}`,
  '',
  `Si no quieres recibir esto, dímelo y te quito de la lista.`,
].join('\n');

function firstSentence(s) { const r = String(s || '').match(/^[^.!?]*[.!?]/); return (r ? r[0] : String(s || '')).trim(); }

for (const t of [html, txt]) if (/—|\d\s?€/.test(t)) throw new Error('Guion largo o precio en el boletín');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/${key}.html`, html);
writeFileSync(`${OUT_DIR}/${key}.txt`, txt + '\n');
console.log(`Boletín ${key}: ${OUT_DIR}/${key}.html (email / navegador) y ${OUT_DIR}/${key}.txt (WhatsApp)`);
