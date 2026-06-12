// scripts/prune-gap-offers.mjs
//
// Recalcula los huecos a partir de la disponibilidad actual (availability.json +
// manual_blocks de prices.json) y PODA las ofertas de hueco corto (gapOverrides
// con < 6 noches) que ya no corresponden a un hueco corto vigente: si el hueco se
// llenó, se acortó o creció a ≥ 6 noches (por una reserva nueva, cancelación o
// modificación), su oferta se elimina. Las ofertas largas (≥ 6 noches, descuentos
// estratégicos manuales) NO se tocan.
//
// Uso:
//   node scripts/prune-gap-offers.mjs           # aplica y escribe prices.json
//   node scripts/prune-gap-offers.mjs --dry      # solo muestra qué podaría
//
import fs from 'fs';
import path from 'path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const PRICES = path.join(ROOT, 'docs/data/prices.json');
const AVAIL  = path.join(ROOT, 'docs/assets/availability.json');
const DRY = process.argv.includes('--dry');
const SHORT_GAP_MAX = 6; // un hueco corto es < 6 noches

const diff = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);

// Réplica exacta de _hcCalcGaps (admin-page.jsx): huecos entre bloqueos.
const calcGaps = (blocked, today, horizon) => {
  if (!blocked || !blocked.length) return [];
  const sorted = [...blocked].sort((a, b) => (a.start < b.start ? -1 : 1));
  const gaps = [];
  const push = (gs, ge) => {
    if (gs >= ge) return;
    if (ge <= today) return;
    if (horizon && gs >= horizon) return;
    const n = diff(gs, ge);
    if (n < 2) return;
    gaps.push({ start: gs, end: ge, nights: n });
  };
  push(today, sorted[0].start);
  for (let i = 0; i < sorted.length - 1; i++) push(sorted[i].end, sorted[i + 1].start);
  if (horizon) push(sorted[sorted.length - 1].end, horizon);
  return gaps;
};

// Segmenta cada hueco según gapSplits (como el admin), porque una oferta puede
// vivir en un segmento de un hueco mayor.
const segmentsFor = (gaps, aptId, gapSplits) => {
  const out = [];
  for (const g of gaps) {
    const gId = `${aptId}|${g.start}`;
    const splits = (gapSplits[gId] || []).filter(d => d > g.start && d < g.end).sort();
    const points = [g.start, ...splits, g.end];
    for (let i = 0; i < points.length - 1; i++) {
      out.push({ start: points[i], end: points[i + 1], nights: diff(points[i], points[i + 1]) });
    }
  }
  return out;
};

const prices = JSON.parse(fs.readFileSync(PRICES, 'utf8'));
const avail = fs.existsSync(AVAIL) ? JSON.parse(fs.readFileSync(AVAIL, 'utf8')) : {};
const gapOverrides = prices.gapOverrides || {};
const gapSplits = prices.gapSplits || {};
const manualBlocks = prices.manual_blocks || {};
const horizon = (prices.bookingHorizon && prices.bookingHorizon.lastCheckinDate) || null;
const today = new Date().toISOString().slice(0, 10);

// Mapa de segmentos cortos vigentes:  "apt|start" -> { end, nights }
const validShort = {};
for (const aptId of ['vm', 'vt', 'vs']) {
  const blocked = [...(((avail[aptId] || {}).blocked) || []), ...((manualBlocks[aptId]) || [])];
  const segs = segmentsFor(calcGaps(blocked, today, horizon), aptId, gapSplits);
  for (const s of segs) {
    if (s.nights < SHORT_GAP_MAX) validShort[`${aptId}|${s.start}`] = { end: s.end, nights: s.nights };
  }
}

const removed = [];
for (const [key, ov] of Object.entries(gapOverrides)) {
  const start = ov.start || key.split('|')[1];
  const ovNights = ov.nights != null ? ov.nights : diff(start, ov.end);
  if (ovNights >= SHORT_GAP_MAX) continue;            // oferta larga → intacta
  const seg = validShort[key];
  const stillValid = seg && seg.end === ov.end && seg.nights < SHORT_GAP_MAX;
  if (!stillValid) removed.push({ key, ov, reason: !seg ? 'hueco lleno/inexistente' : (seg.end !== ov.end ? `hueco cambió de fin (${ov.end}→${seg.end})` : 'creció a ≥6 noches') });
}

if (!removed.length) {
  console.log(`✓ Ofertas de hueco al día (today=${today}). Nada que podar. Cortas vigentes: ${Object.keys(validShort).length}.`);
  process.exit(0);
}
console.log(`Podar ${removed.length} oferta(s) de hueco corto obsoleta(s):`);
for (const r of removed) console.log(`  − ${r.key}  (${r.ov.nights}n, fin ${r.ov.end}, ${r.ov.type} ${r.ov.value})  · ${r.reason}`);

if (DRY) { console.log('\n(dry-run — no se escribe nada)'); process.exit(0); }

for (const r of removed) delete prices.gapOverrides[r.key];
fs.writeFileSync(PRICES, JSON.stringify(prices, null, 2) + '\n');
console.log(`\nprices.json actualizado (${removed.length} ofertas podadas).`);
