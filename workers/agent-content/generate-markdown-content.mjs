// Regenera markdown-content.generated.js a partir de docs/md/*.md.
// Ejecutar cada vez que cambie alguno de esos archivos:
//   node workers/agent-content/generate-markdown-content.mjs
//
// Por qué un archivo generado y no un import directo de docs/md/*.md:
// el Worker no puede leer el filesystem en tiempo de ejecución (Workers no
// tiene fs), y hacer fetch() a la propia URL pública del .md reintroduciría
// el riesgo de recursión de ruta que este diseño evita a propósito (ver
// comentario en index.js). Inlinear el contenido en el bundle es la opción
// simple y sin sorpresas.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const FILES = {
  INDEX_MD: 'docs/md/index.md',
  NOSOTROS_MD: 'docs/md/nosotros.md',
  CONTACTO_MD: 'docs/md/contacto.md',
  PRIVACIDAD_MD: 'docs/md/privacidad.md',
  ABOUT_MD: 'docs/md/about.md',
  CONTACT_MD: 'docs/md/contact.md',
  PRIVACY_MD: 'docs/md/privacy.md',
};

let out = '// GENERADO. No editar a mano: regenerar con\n';
out += '//   node workers/agent-content/generate-markdown-content.mjs\n';
out += '// después de tocar cualquier docs/md/*.md.\n\n';
for (const [name, relPath] of Object.entries(FILES)) {
  const content = readFileSync(join(repoRoot, relPath), 'utf8');
  out += `export const ${name} = ${JSON.stringify(content)};\n`;
}

writeFileSync(join(here, 'markdown-content.generated.js'), out);
console.log('workers/agent-content/markdown-content.generated.js actualizado.');
