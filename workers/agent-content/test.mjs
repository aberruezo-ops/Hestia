// Test unitario del Worker sin desplegarlo ni depender de Cloudflare.
// Ejecutar: node workers/agent-content/test.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import worker from './index.js';
import {
  INDEX_MD, NOSOTROS_MD, CONTACTO_MD, PRIVACIDAD_MD,
  ABOUT_MD, CONTACT_MD, PRIVACY_MD,
} from './markdown-content.generated.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

// Mock origin: a tiny in-process "server" so we can call worker.fetch()
// exactly like the real Workers runtime would, without deploying anything.
const originFiles = {
  '/': { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>home</html>' },
  '/nosotros.html': { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>about</html>' },
  '/about.html': { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>about alias</html>' },
  '/contact.html': { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>contact alias</html>' },
  '/privacy.html': { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>privacy alias</html>' },
  '/nope-not-found': { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>404</html>' },
};

const realFetch = global.fetch;
let originFetchCount = 0;
global.fetch = async (input, init) => {
  originFetchCount++;
  const req = input instanceof Request ? input : new Request(input, init);
  const u = new URL(req.url);
  if (u.hostname === 'www.hestiayourhome.com') {
    const f = originFiles[u.pathname];
    if (!f) return new Response('not mapped in mock', { status: 404 });
    return new Response(f.body, { status: f.status, headers: f.headers });
  }
  return realFetch(input, init);
};

function req(path, accept) {
  const headers = accept ? { Accept: accept } : {};
  return new Request(`https://www.hestiayourhome.com${path}`, { headers });
}

let pass = 0, fail = 0;
async function check(name, cond) {
  if (cond) { pass++; console.log('OK  ', name); }
  else { fail++; console.log('FAIL', name); }
}

// 1. Plain HTML request, no Accept header at all -> passthrough, Vary added.
{
  const res = await worker.fetch(req('/', undefined));
  const body = await res.text();
  await check('1a home html passthrough body', body === '<html>home</html>');
  await check('1b home html content-type unchanged', res.headers.get('Content-Type').includes('text/html'));
  await check('1c Vary includes Accept and Accept-Encoding', /Accept(?!-)/.test(res.headers.get('Vary')) && res.headers.get('Vary').includes('Accept-Encoding'));
}

// 2. Accept: text/markdown, mapped path -> markdown variant served, inline (no subrequest).
{
  originFetchCount = 0;
  const res = await worker.fetch(req('/', 'text/markdown'));
  const body = await res.text();
  await check('2a markdown body served', body.startsWith('# Hestía Your Home'));
  await check('2b markdown content-type', res.headers.get('Content-Type') === 'text/markdown; charset=utf-8');
  await check('2c Vary present on markdown response too', res.headers.get('Vary').includes('Accept'));
  await check('2d no origin subrequest for a negotiated markdown response (no same-zone recursion risk)', originFetchCount === 0);
}

// 3. Accept header prefers html over markdown via q-values -> html wins.
{
  const res = await worker.fetch(req('/', 'text/markdown;q=0.5, text/html;q=0.9'));
  const body = await res.text();
  await check('3 html preferred by q-value', body === '<html>home</html>');
}

// 4. A path with no markdown version, Accept: text/markdown -> passthrough as html.
{
  const original = { ...originFiles };
  originFiles['/no-md-here.html'] = { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<html>no md</html>' };
  const res = await worker.fetch(req('/no-md-here.html', 'text/markdown'));
  const body = await res.text();
  await check('4 unmapped path passes through as html even when markdown is requested', body === '<html>no md</html>');
  delete originFiles['/no-md-here.html'];
}

// 5. Real curl-style header from the audit evidence: "Accept: text/markdown" exactly.
{
  const res = await worker.fetch(req('/', 'text/markdown'));
  await check('5 exact audit repro: content-type is text/markdown', res.headers.get('Content-Type').startsWith('text/markdown'));
  await check('5 exact audit repro: Vary has Accept', res.headers.get('Vary').split(',').map(s => s.trim()).includes('Accept'));
}

// 6. 404 path still passes through with correct status + Vary.
{
  const res = await worker.fetch(req('/nope-not-found', undefined));
  await check('6a 404 status preserved', res.status === 404);
  await check('6b 404 has Vary too', res.headers.get('Vary').includes('Accept'));
}

// 7. Every page in MARKDOWN_MAP resolves to real markdown content per route.
{
  const cases = [
    ['/', INDEX_MD],
    ['/index.html', INDEX_MD],
    ['/nosotros.html', NOSOTROS_MD],
    ['/contacto.html', CONTACTO_MD],
    ['/privacidad.html', PRIVACIDAD_MD],
    ['/about.html', ABOUT_MD],
    ['/contact.html', CONTACT_MD],
    ['/privacy.html', PRIVACY_MD],
  ];
  for (const [path, expected] of cases) {
    const res = await worker.fetch(req(path, 'text/markdown'));
    const body = await res.text();
    await check(`7 ${path} markdown matches expected constant`, body === expected);
  }
}

// 8. HEAD request negotiated as markdown returns no body but correct headers.
{
  const res = await worker.fetch(new Request('https://www.hestiayourhome.com/', { method: 'HEAD', headers: { Accept: 'text/markdown' } }));
  const body = await res.text();
  await check('8a HEAD markdown has empty body', body === '');
  await check('8b HEAD markdown still gets the right content-type', res.headers.get('Content-Type') === 'text/markdown; charset=utf-8');
}

// 9. Regression guard: the bundled markdown constants must stay in sync with
// the source docs/md/*.md files that generate-markdown-content.mjs reads.
// If this fails, someone edited docs/md/*.md without regenerating the
// Worker's inlined copy — run `node workers/agent-content/generate-markdown-content.mjs`.
{
  const sourceFiles = {
    INDEX_MD: 'docs/md/index.md',
    NOSOTROS_MD: 'docs/md/nosotros.md',
    CONTACTO_MD: 'docs/md/contacto.md',
    PRIVACIDAD_MD: 'docs/md/privacidad.md',
    ABOUT_MD: 'docs/md/about.md',
    CONTACT_MD: 'docs/md/contact.md',
    PRIVACY_MD: 'docs/md/privacy.md',
  };
  const constants = { INDEX_MD, NOSOTROS_MD, CONTACTO_MD, PRIVACIDAD_MD, ABOUT_MD, CONTACT_MD, PRIVACY_MD };
  for (const [name, relPath] of Object.entries(sourceFiles)) {
    const fromDisk = readFileSync(join(repoRoot, relPath), 'utf8');
    await check(`9 ${name} matches ${relPath}`, constants[name] === fromDisk);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
