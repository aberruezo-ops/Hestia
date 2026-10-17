#!/usr/bin/env node
// Hook PostToolUse (Edit|Write|MultiEdit) de Claude Code. Lee el payload JSON
// por stdin. Salir con código 2 devuelve el mensaje de stderr a Claude para
// que lo corrija; con 0 no interrumpe nada.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
const input = payload.tool_input || {};
const file = input.file_path || '';
const rel = relative(ROOT, file).split('\\').join('/');
const problems = [];

// 1. JSX → JS. Antes un fallo de compilación se tragaba con `|| true`.
if (file.endsWith('.jsx')) {
  try {
    execFileSync('node', [join(ROOT, 'scripts/build-jsx.js')], { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    problems.push(`build-jsx.js ha fallado al compilar ${rel}:\n${String(e.stdout || '')}${String(e.stderr || '')}`.trim());
  }
}

// 2. styles.css → sube ?v=NNN en todos los HTML de docs/ para romper caché.
if (file.endsWith('styles.css')) {
  const docs = join(ROOT, 'docs');
  const curr = (readFileSync(join(docs, 'index.html'), 'utf8').match(/styles\.css\?v=(\d+)/) || [])[1];
  if (curr) {
    const next = String(Number(curr) + 1);
    for (const f of readdirSync(docs).filter(n => n.endsWith('.html'))) {
      const p = join(docs, f);
      const s = readFileSync(p, 'utf8');
      if (s.includes(`styles.css?v=${curr}`)) writeFileSync(p, s.split(`styles.css?v=${curr}`).join(`styles.css?v=${next}`));
    }
    console.log(`CSS v${curr} → v${next}`);
  }
}

// 3. Regla de CLAUDE.md: nada de guion largo (U+2014) en texto visible de la
// web. Solo se mira el texto NUEVO de esta edición y sin comentarios de código,
// para no saltar por lo que ya había ni por notas internas.
if (/^docs\/.*\.(jsx|html|json)$/.test(rel)) {
  const added = [input.new_string, input.content, ...(input.edits || []).map(e => e.new_string)]
    .filter(Boolean).join('\n');
  const visible = added
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n').map(l => l.replace(/(^|\s)\/\/.*$/, '')).join('\n');
  const hits = visible.split('\n').filter(l => l.includes('\u2014')).slice(0, 3);
  if (hits.length) {
    problems.push(`Guion largo (—) en texto visible de ${rel}. CLAUDE.md lo prohíbe: usa coma, dos puntos, paréntesis o punto.\n` +
      hits.map(l => '  · ' + l.trim().slice(0, 140)).join('\n'));
  }
}

if (problems.length) {
  console.error(problems.join('\n\n'));
  process.exit(2);
}
