// gen-social-drafts.mjs
//
// Genera los borradores de redes DEL MES a partir de la edición vigente del
// blog (constante NOTICIAS de noticias-page.jsx) y los añade a
// docs/data/social-drafts.json en estado "pending". NO publica nada: la
// publicación es manual desde la pestaña Redes de /p-edit.
//
// Tres borradores por mes, no más (antes salían decenas de reels genéricos y
// no se publicaba ninguno). Los textos son los del blog, escritos en la voz
// de Hestía y ya validados por el agente mensual:
//   1) voz-YYYY-MM     La Voz de Hestía del apartamento de turno (rota cada
//                      mes: Mar, Thalassa, Salinas). Imagen del apartamento.
//   2) agenda-YYYY-MM  El plan del mes en el territorio (primer artículo de
//                      fiestas, si lo hay; si no, el primero de la edición).
//   3) guion-YYYY-MM   Guion de 30 segundos para un reel grabado por Alex.
//                      No se publica desde el panel: se graba. Es la única
//                      pieza que no se puede automatizar, y la que hace que
//                      la cuenta parezca de personas.
//
// Todos los enlaces llevan utm_campaign con el id del borrador, para saber en
// la analítica qué post trajo la visita.
//
// Reglas: sin precios; sin guion largo (em dash); nada que no esté en el blog.
// Uso:  node scripts/gen-social-drafts.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DRAFTS_PATH   = 'docs/data/social-drafts.json';
const NOTICIAS_PATH = 'docs/components/noticias-page.jsx';
const SITE          = 'https://www.hestiayourhome.com';
const HERO_IMG      = 'assets/hero-terrace-night.jpg';

const APTS = {
  vm: { id: 'vm', name: 'Hestía Mar',      img: 'assets/apt-vm-gallery-1.jpg', slug: 'mar.html' },
  vt: { id: 'vt', name: 'Hestía Thalassa', img: 'assets/apt-vt-4.jpg',         slug: 'thalassa.html' },
  vs: { id: 'vs', name: 'Hestía Salinas',  img: 'assets/apt-vs-gallery-1.jpg', slug: 'salinas.html' },
};
const ORDER = ['vm', 'vt', 'vs'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const loadJson = (p, fb) => { if (!existsSync(p)) return fb; try { return JSON.parse(readFileSync(p, 'utf8')); } catch (_) { return fb; } };
const firstSentence = s => { const m = String(s || '').match(/^[^.!?]*[.!?]/); return (m ? m[0] : String(s || '')).trim(); };
const utm = (path, id) => `${SITE}/${path}${path.includes('?') ? '&' : '?'}utm_source=redes&utm_medium=social&utm_campaign=${id}`;

// Edición vigente del blog (mismo parseo que el agente mensual).
function loadNoticias() {
  const txt = readFileSync(NOTICIAS_PATH, 'utf8');
  const i = txt.indexOf('const NOTICIAS = ');
  const bs = txt.indexOf('{', i);
  let depth = 0, inStr = false, esc = false;
  for (let k = bs; k < txt.length; k++) {
    const c = txt[k];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return JSON.parse(txt.slice(bs, k + 1)); }
  }
  throw new Error('Bloque NOTICIAS sin cerrar');
}
function editionKey(N) {
  const m = String(N.edition?.es || '').match(/^(\p{L}+)\s+(\d{4})$/u);
  const idx = m ? MONTHS_ES.indexOf(m[1].toLowerCase()) : -1;
  if (idx < 0) throw new Error(`No reconozco la edición "${N.edition?.es}"`);
  return { key: `${m[2]}-${String(idx + 1).padStart(2, '0')}`, mon: idx + 1, name: MONTHS_ES[idx], year: m[2] };
}

const HASHTAGS = '#VeraPlaya #Almeria #CaboDeGata #HestiaYourHome';

function vozCaption(voz, a, ed, id) {
  return [
    `${a.name}, ${ed.name} ${ed.year}`,
    '',
    voz.curiosidad.es,
    '',
    voz.reco.es,
    '',
    firstSentence(voz.curiosidad.en),
    '',
    'Reserva directa con nosotros: 0% comisiones, respuesta humana en minutos y mascotas bienvenidas.',
    `📍 Vera Playa, Almería`,
    `🔗 ${utm(a.slug, id)}`,
    '',
    HASHTAGS,
  ].join('\n');
}

function agendaCaption(art, cat, ed, id) {
  return [
    `${art.titulo.es}`,
    '',
    art.cuerpo.es,
    '',
    art.titulo.en,
    '',
    `Toda la agenda de ${ed.name} en el blog de Hestía, con lo que pasa en Vera Playa, Almería y Murcia.`,
    `🔗 ${utm('noticias.html', id)}`,
    '',
    `${HASHTAGS} #${cat.cat.es.replace(/[^\p{L}\p{N}]/gu, '')}`,
  ].join('\n');
}

// Guion para un reel de 30 s grabado por Alex: gancho, tres planos, cierre.
function guionCaption(voz, a, art, ed) {
  return [
    `GUION · reel de 30 segundos · ${a.name} · ${ed.name} ${ed.year}`,
    '',
    `Dónde: ${a.name}, luz natural, móvil en vertical, sin música alta (las redes ya la ponen).`,
    '',
    `0-5 s · Gancho, a cámara, en la terraza:`,
    `"${firstSentence(voz.curiosidad.es)}"`,
    '',
    `5-15 s · Plano del apartamento o de la vista mientras dices, en tus palabras:`,
    `"${voz.reco.es}"`,
    '',
    `15-25 s · Un plano del sitio que recomiendas o del mar, con esta idea:`,
    `"${art ? art.titulo.es : 'Y en la zona, lo que cuenta el blog este mes.'}"`,
    '',
    `25-30 s · Cierre, a cámara:`,
    `"Reserva directo con nosotros y te lo enseñamos en persona. Hestía Your Home, Vera Playa."`,
    '',
    `Texto del post al publicar el reel: usa el borrador "voz-${ed.key}" tal cual.`,
    `No hace falta que salga perfecto. Hace falta que salgas tú.`,
  ].join('\n');
}

function main() {
  const now = new Date();
  const N = loadNoticias();
  const ed = editionKey(N);
  const store = loadJson(DRAFTS_PATH, { drafts: [], updatedAt: null });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const have = new Set(drafts.map(d => d.id));
  const added = [];

  const apt = APTS[ORDER[(ed.mon - 1) % ORDER.length]];
  const voz = (N.voz || []).find(v => v.apt === apt.name);
  if (!voz) throw new Error(`La edición no tiene Voz de ${apt.name}`);

  const cats = N.territorio || [];
  const fiestas = cats.find(c => /fiestas/i.test(c.cat?.es || '')) || cats[0];
  const art = fiestas?.articles?.[0] || null;

  const vozId = `voz-${ed.key}`;
  if (!have.has(vozId)) added.push({
    id: vozId, createdAt: now.toISOString(), status: 'pending', source: 'voz',
    format: 'image', apt: apt.id, image: apt.img, networks: ['ig', 'fb'],
    caption: vozCaption(voz, apt, ed, vozId),
    link: utm(apt.slug, vozId),
  });

  const agendaId = `agenda-${ed.key}`;
  if (art && !have.has(agendaId)) added.push({
    id: agendaId, createdAt: now.toISOString(), status: 'pending', source: 'agenda',
    format: 'image', apt: apt.id, image: HERO_IMG, networks: ['ig', 'fb'],
    caption: agendaCaption(art, fiestas, ed, agendaId),
    link: utm('noticias.html', agendaId),
  });

  const guionId = `guion-${ed.key}`;
  if (!have.has(guionId)) added.push({
    id: guionId, createdAt: now.toISOString(), status: 'pending', source: 'guion',
    format: 'guion', apt: apt.id, image: apt.img, networks: ['ig', 'fb'],
    caption: guionCaption(voz, apt, art, ed),
    link: utm(apt.slug, vozId),
  });

  for (const d of added) if (/—|\d\s?€/.test(d.caption)) throw new Error(`Borrador ${d.id} con guion largo o precio`);

  if (!added.length) { console.log(`Sin borradores nuevos para ${ed.key}.`); return; }
  const out = { drafts: [...added, ...drafts].slice(0, 80), updatedAt: now.toISOString() };
  writeFileSync(DRAFTS_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Edición ${ed.key} · apartamento de turno: ${apt.name}. Añadidos ${added.length} borradores:`);
  for (const d of added) console.log(`  - ${d.id} (${d.source}, ${d.format})`);
}

main();
