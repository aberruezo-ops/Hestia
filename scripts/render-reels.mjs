// Renderiza cada reel pendiente cogiendo el TROZO indicado en draft.clip
// (start/dur) del vídeo fuente, recortado a 9:16 vertical. Así cada reel usa
// un segmento DISTINTO del vídeo, no siempre el mismo.
//
// Uso:  node scripts/render-reels.mjs
//   - Lee docs/data/social-drafts.json
//   - Por cada draft format:'reel' con clip y sin renderizar, corta el clip a
//     docs/assets/reels/<id>.mp4 y actualiza draft.video a esa ruta.
//   - Idempotente: si el mp4 ya existe, no lo rehace.
//
// Requiere ffmpeg en el PATH.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const DRAFTS_PATH = 'docs/data/social-drafts.json';
const OUT_DIR     = 'docs/assets/reels';
const REL_PREFIX  = 'assets/reels';

const store = JSON.parse(readFileSync(DRAFTS_PATH, 'utf8'));
const drafts = Array.isArray(store.drafts) ? store.drafts : [];
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

let rendered = 0;
for (const d of drafts) {
  if (d.format !== 'reel' || !d.clip || !d.clip.src) continue;
  const rel = `${REL_PREFIX}/${d.id}.mp4`;
  const out = `docs/${rel}`;
  if (existsSync(out)) { if (d.video !== rel) d.video = rel; continue; }
  const src = `docs/${d.clip.src}`;
  if (!existsSync(src)) { console.warn(`! fuente no encontrada: ${src} (${d.id})`); continue; }
  const start = Math.max(0, Number(d.clip.start) || 0);
  const dur   = Math.max(1, Number(d.clip.dur) || 9);
  try {
    // -ss antes de -i: seek rápido; recorte 9:16 centrado y escalado a 1080x1920.
    execFileSync('ffmpeg', [
      '-y', '-ss', String(start), '-i', src, '-t', String(dur),
      '-vf', 'crop=ih*9/16:ih,scale=1080:1920:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
      out,
    ], { stdio: 'ignore' });
    d.video = rel;
    rendered++;
    console.log(`  ✓ ${d.id}  (${start}s +${dur}s de ${d.clip.src})`);
  } catch (e) {
    console.warn(`! ffmpeg falló para ${d.id}: ${e.message}`);
  }
}

if (rendered) {
  store.updatedAt = store.updatedAt || null;
  writeFileSync(DRAFTS_PATH, JSON.stringify(store, null, 2) + '\n');
  console.log(`Renderizados ${rendered} reels en ${OUT_DIR}.`);
} else {
  console.log('Nada que renderizar (todos al día o sin clip).');
}
