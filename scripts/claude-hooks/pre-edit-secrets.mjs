#!/usr/bin/env node
// Hook PreToolUse (Edit|Write|MultiEdit) de Claude Code. Bloquea (exit 2)
// escribir en ficheros de secretos o meter tokens en el código: regla de
// seguridad nº 1 y nº 9 de CLAUDE.md, aplicada de forma automática.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
const input = payload.tool_input || {};
const name = basename(input.file_path || '');

const SECRET_FILE = /^(\.env(\..+)?|\.dev\.vars(\..+)?|.+\.(pem|key)|.*service[-_]?account.*\.json)$/i;
if (SECRET_FILE.test(name) && !/\.example$/i.test(name)) {
  console.error(`Bloqueado: ${name} es un fichero de secretos. Los secretos de Workers van con \`wrangler secret put\`; documenta solo el nombre de la variable en un .env.example.`);
  process.exit(2);
}

const text = [input.new_string, input.content, ...(input.edits || []).map(e => e.new_string)].filter(Boolean).join('\n');
const PATTERNS = [
  ['token de GitHub', /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ['clave de API de Anthropic', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['clave de acceso de AWS', /\bAKIA[0-9A-Z]{16}\b/],
  ['clave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];
for (const [label, re] of PATTERNS) {
  if (re.test(text)) {
    console.error(`Bloqueado: el cambio contiene un ${label}. Nunca en el código (CLAUDE.md, Seguridad §1): el PAT del admin vive solo en memoria del navegador y los secretos de Workers con \`wrangler secret put\`.`);
    process.exit(2);
  }
}
