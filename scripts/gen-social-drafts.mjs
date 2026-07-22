// gen-social-drafts.mjs
//
// Genera borradores de posts para Instagram y Facebook y los añade a
// docs/data/social-drafts.json (estado "pending"). NO publica nada: solo
// propone. La publicación es manual desde la pestaña Redes de /p-edit.
//
// Dos tipos de borrador, ambos en formato REEL (vídeo vertical 9:16):
//   1) Hueco: cada hueco corto COMPLETO (entre dos reservas) de julio y agosto,
//      en cada apartamento. La estancia propuesta es el hueco entero
//      (entrada = salida de la reserva anterior, salida = entrada de la
//      siguiente). Un reel por hueco, con el vídeo del apartamento.
//   2) Semanal: un reel con algo que contar del blog (La Voz de Hestía del
//      apartamento de turno) y de las noticias de la edición vigente, con link.
//
// Reglas: sin precios hardcodeados; sin guion largo (em dash).
//
// Uso:  node scripts/gen-social-drafts.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DRAFTS_PATH   = 'docs/data/social-drafts.json';
const AVAIL_PATH    = 'docs/assets/availability.json';
const NOTICIAS_PATH = 'docs/components/noticias-page.jsx';
const SITE          = 'https://www.hestiayourhome.com';

const GAP_MIN = 2, GAP_MAX = 8;     // hueco corto completo = 2..8 noches
const SEASON  = { from: '07-01', to: '08-31' };   // entradas en julio y agosto

const APTS = {
  vm: { id: 'vm', name: 'Hestía Vera Mar',      reel: 'assets/reel-vm.mp4',   img: 'assets/apt-vm-gallery-1.jpg', slug: 'mar.html',
        src: 'assets/hestia v13 mar clean.mp4',          srcDur: 74 },
  vt: { id: 'vt', name: 'Hestía Vera Thalassa', reel: 'assets/reel-vt.mp4',   img: 'assets/apt-vt-4.jpg',         slug: 'thalassa.html',
        src: 'assets/hestia intro v9 thalassa outro.mp4', srcDur: 66 },
  vs: { id: 'vs', name: 'Hestía Vera Salinas',  reel: 'assets/reel-vs.mp4',   img: 'assets/apt-vs-gallery-1.jpg', slug: 'salinas.html',
        src: 'assets/hestia v14 salinas clean.mp4',       srcDur: 81 },
};
const ORDER = ['vm', 'vt', 'vs'];

// Cada reel debe coger un TROZO DISTINTO del vídeo, no siempre el mismo.
// pickClip reparte el vídeo en ventanas y rota según una semilla (el id del
// reel), así dos reels del mismo apartamento usan segmentos diferentes.
const CLIP_LEN = 9;  // segundos por reel
const _hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function pickClip(aptId, seed) {
  const a = APTS[aptId] || {};
  const dur = a.srcDur || 10;
  const usable = Math.max(0, dur - CLIP_LEN);
  if (usable <= 1) return { src: a.src || a.reel, start: 0, dur: Math.min(CLIP_LEN, dur) };
  // Inicio continuo en todo el rango útil: máxima variedad entre reels.
  const start = _hash(seed) % (usable + 1);
  return { src: a.src || a.reel, start, dur: CLIP_LEN };
}

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const diff = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
const fmtEs = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const ys = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - ys) / 86400000 + 1) / 7);
}
const loadJson = (p, fb) => { if (!existsSync(p)) return fb; try { return JSON.parse(readFileSync(p, 'utf8')); } catch (_) { return fb; } };

function mergeRanges(ranges) {
  const s = [...ranges].filter(r => r && r.start && r.end).sort((a, b) => a.start.localeCompare(b.start));
  if (!s.length) return [];
  const m = [{ ...s[0] }];
  for (const r of s.slice(1)) {
    const last = m[m.length - 1];
    if (r.start <= last.end) { if (r.end > last.end) last.end = r.end; }
    else m.push({ ...r });
  }
  return m;
}

// Huecos COMPLETOS (entre dos reservas) cuya entrada cae en la temporada y cuya
// duración es un hueco corto. Devuelve la estancia entera del hueco.
function completeGaps(blocked, fromISO, toISO, todayISO) {
  const m = mergeRanges(blocked);
  const out = [];
  for (let i = 0; i < m.length - 1; i++) {
    const checkin = m[i].end, checkout = m[i + 1].start;
    const n = diff(checkin, checkout);
    if (n < GAP_MIN || n > GAP_MAX) continue;
    if (checkin < todayISO) continue;
    if (checkin < fromISO || checkin > toISO) continue;
    out.push({ checkin, checkout, nights: n });
  }
  return out;
}

function gapCaption(a, g) {
  return `Hueco de última hora en ${a.name}: del ${fmtEs(g.checkin)} al ${fmtEs(g.checkout)}, ${g.nights} noches completas.\n\nSon las fechas exactas que quedan libres entre dos reservas. Reserva directa: 0% comisiones, respondemos en minutos y se admiten mascotas.\n\nLast-minute gap, book directly with us.\n\n📍 Vera Playa, Almería\n🔗 ${SITE}/reservas.html\n\n#ultimahora #VeraPlaya #Almeria #HestiaYourHome #alquilervacacional`;
}

// Lee la edición vigente del blog (objeto NOTICIAS, ya en JSON) para el reel semanal.
function loadNoticias() {
  if (!existsSync(NOTICIAS_PATH)) return null;
  try {
    const txt = readFileSync(NOTICIAS_PATH, 'utf8');
    const i = txt.indexOf('const NOTICIAS = ');
    const bs = txt.indexOf('{', i);
    let depth = 0, end = -1;
    for (let k = bs; k < txt.length; k++) { const c = txt[k]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = k; break; } } }
    return JSON.parse(txt.slice(bs, end + 1));
  } catch (_) { return null; }
}

const firstSentence = s => { const m = String(s || '').match(/^[^.!?]*[.!?]/); return (m ? m[0] : String(s || '')).trim(); };

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function monthCaption(a, monName) {
  const cap = monName.charAt(0).toUpperCase() + monName.slice(1);
  return `${cap} en ${a.name} ☀️\n\nTu hogar lejos de casa en Vera Playa. Reserva directa con nosotros: 0% comisiones, mejoramos cualquier precio, respondemos en minutos y se admiten mascotas.\n\nBook directly with us.\n\n📍 Vera Playa, Almería\n🔗 ${SITE}/reservas.html\n\n#VeraPlaya #Almeria #Mojacar #verano #HestiaYourHome`;
}

function weeklyCaption(N, apt) {
  const voz = (N.voz || []).find(v => v.apt === apt.name) || (N.voz || [])[0];
  const cur = voz ? firstSentence(voz.curiosidad.es) : '';
  const ev = (N.territorio || []).flatMap(c => c.articles || [])[0];
  const evTit = ev ? ev.titulo.es : '';
  const edi = (N.edition && N.edition.es) || '';
  return `Esta semana en el blog de Hestía 📰 · Edición de ${edi}\n\n${apt.name}: ${cur}\n\nY en la zona: ${evTit}.\n\nTe lo contamos todo en el blog, con la agenda del mes y las fiestas de los pueblos cercanos ↓\n🔗 ${SITE}/noticias.html\n\n#VeraPlaya #Almeria #blog #quehacerenAlmeria #HestiaYourHome`;
}

function main() {
  const now = new Date();
  const year = now.getFullYear();
  const todayISO = iso(now);
  const fromISO = `${year}-${SEASON.from}`, toISO = `${year}-${SEASON.to}`;

  const store = loadJson(DRAFTS_PATH, { drafts: [], updatedAt: null });
  const avail = loadJson(AVAIL_PATH, {});
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const have = new Set(drafts.map(d => d.id));
  const added = [];

  // 1) Un reel por cada hueco corto completo de jul/ago en cada apartamento.
  for (const id of ORDER) {
    const a = APTS[id];
    const blocked = (avail[id] && avail[id].blocked) || [];
    for (const g of completeGaps(blocked, fromISO, toISO, todayISO)) {
      const gid = `gap-${id}-${g.checkin}`;
      if (have.has(gid)) continue;
      added.push({
        id: gid, createdAt: now.toISOString(), status: 'pending', source: 'gap',
        format: 'reel', apt: id, video: a.reel, clip: pickClip(id, gid), image: a.img, networks: ['ig', 'fb'],
        caption: gapCaption(a, g),
        link: `${SITE}/reservas.html?apt=${id}&checkin=${g.checkin}&checkout=${g.checkout}`,
      });
    }
  }

  // 2) Reel de escaparate del mes de campaña, uno por apartamento. En la última
  //    semana del mes ya se promociona el mes siguiente (p. ej. el 28 de junio
  //    se generan los reels de julio).
  let cmYear = year, cm = now.getMonth();
  if (now.getDate() >= 24) { cm += 1; if (cm > 11) { cm = 0; cmYear += 1; } }
  const monName = MONTHS_ES[cm];
  for (const id of ORDER) {
    const a = APTS[id];
    const mid = `mes-${cmYear}-${pad(cm + 1)}-${id}`;
    if (have.has(mid)) continue;
    added.push({
      id: mid, createdAt: now.toISOString(), status: 'pending', source: 'mes',
      format: 'reel', apt: id, video: a.reel, clip: pickClip(id, mid), image: a.img, networks: ['ig', 'fb'],
      caption: monthCaption(a, monName),
      link: `${SITE}/reservas.html?apt=${id}`,
    });
  }

  // 3) Reel semanal con blog (voz del apartamento de turno) + noticias + link.
  const N = loadNoticias();
  if (N) {
    const wk = isoWeek(now);
    const apt = APTS[ORDER[wk % ORDER.length]];
    const wid = `weekly-${year}w${wk}`;
    if (!have.has(wid)) {
      added.push({
        id: wid, createdAt: now.toISOString(), status: 'pending', source: 'weekly',
        format: 'reel', apt: apt.id, video: 'assets/reel-blog.mp4', clip: pickClip(apt.id, wid), image: apt.img, networks: ['ig', 'fb'],
        caption: weeklyCaption(N, apt),
        link: `${SITE}/noticias.html`,
      });
    }
  }

  if (!added.length) { console.log('Sin borradores nuevos.'); return; }
  const out = { drafts: [...added, ...drafts].slice(0, 80), updatedAt: now.toISOString() };
  writeFileSync(DRAFTS_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Anadidos ${added.length} borradores:`);
  for (const d of added) console.log(`  - ${d.id} (${d.source}, ${d.format})`);
}

main();
