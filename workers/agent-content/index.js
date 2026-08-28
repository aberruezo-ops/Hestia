// Hestía — Agent Content Worker
//
// GitHub Pages (donde vive docs/) sirve archivos estáticos: no puede negociar
// contenido por cabecera Accept ni añadir/editar el header Vary por petición.
// Este Worker se sitúa DELANTE del dominio para resolver eso, sin tocar el
// origen (GitHub Pages sigue siendo la fuente de verdad del contenido):
//
// 1) Si el cliente pide `Accept: text/markdown` con prioridad mayor que
//    text/html (RFC 7231 §5.3.2, comparando q-values de verdad, no un
//    .includes()), y la ruta pedida tiene versión markdown conocida (ver
//    MARKDOWN_MAP más abajo), responde esa versión con Content-Type:
//    text/markdown.
// 2) SIEMPRE añade `Vary: Accept, Accept-Encoding` a toda respuesta del
//    dominio (negociada o no), para que ningún cache intermedio sirva la
//    variante equivocada a un agente o a un navegador.
// 3) Cualquier otra petición pasa intacta al origen (GitHub Pages): mismo
//    body, mismo status, sin más cambios que el header Vary.
//
// NO se despliega solo con este commit. Pasos para activarlo:
//   cd workers/agent-content
//   wrangler deploy
//   # Cloudflare dashboard → Workers → Routes → añadir, apuntando a
//   # hestia-agent-content:
//   #   hestiayourhome.com/*
//   #   www.hestiayourhome.com/*
// Antes de añadir la ruta en el dominio real: probar el Worker en su
// subdominio *.workers.dev contra unas cuantas rutas (/, /nosotros.html,
// /mar.html, una que no exista) para confirmar que el passthrough no
// rompe nada, dado que a partir de ese momento TODO el tráfico del dominio
// pasa por aquí.

// Contenido inline, no fetch(): si este Worker termina delante de TODO el
// dominio (necesario para que Vary funcione en cualquier página), un
// fetch() a una URL del propio dominio para leer /md/*.md volvería a pasar
// por esta misma ruta y recursaría sobre sí mismo. Inlinear el markdown en
// el bundle evita ese salto por completo. Ver generate-markdown-content.mjs
// para cómo se genera este archivo a partir de docs/md/*.md (fuente real,
// también servida tal cual por GitHub Pages para quien la enlace directo).
import { INDEX_MD, NOSOTROS_MD, CONTACTO_MD, PRIVACIDAD_MD } from './markdown-content.generated.js';

// Mapa explícito ruta pública → markdown. Cerrado a propósito: mejor pasar
// de largo (passthrough a HTML) que servir un markdown sin revisar para una
// página que no está en esta lista.
const MARKDOWN_MAP = {
  '/': INDEX_MD,
  '/index.html': INDEX_MD,
  '/nosotros.html': NOSOTROS_MD,
  '/contacto.html': CONTACTO_MD,
  '/privacidad.html': PRIVACIDAD_MD,
};

function parseAccept(acceptHeader) {
  return acceptHeader
    .split(',')
    .map((part) => {
      const [rawType, ...params] = part.trim().split(';').map((s) => s.trim());
      let q = 1;
      for (const p of params) {
        const [k, v] = p.split('=').map((s) => s && s.trim());
        if (k === 'q' && v !== undefined) q = parseFloat(v);
      }
      return { type: (rawType || '').toLowerCase(), q: isNaN(q) ? 1 : q };
    })
    .filter((p) => p.type);
}

// true solo si el cliente prefiere markdown de verdad: lo pidió y con
// prioridad estrictamente mayor que la de text/html (si también la pidió).
function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const parsed = parseAccept(acceptHeader);
  const md = parsed.find((p) => p.type === 'text/markdown');
  if (!md) return false;
  const html = parsed.find((p) => p.type === 'text/html' || p.type === '*/*');
  if (!html) return true;
  return md.q > html.q;
}

function withVary(sourceHeaders) {
  const headers = new Headers(sourceHeaders);
  const existing = headers.get('Vary') || '';
  const parts = new Set(existing.split(',').map((s) => s.trim()).filter(Boolean));
  parts.add('Accept');
  parts.add('Accept-Encoding');
  headers.set('Vary', Array.from(parts).join(', '));
  return headers;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
    const mdContent = MARKDOWN_MAP[url.pathname];

    if (isGetOrHead && mdContent && prefersMarkdown(request.headers.get('Accept'))) {
      const headers = withVary({
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      });
      const body = request.method === 'HEAD' ? null : mdContent;
      return new Response(body, { status: 200, headers });
    }

    const originRes = await fetch(request);
    return new Response(originRes.body, {
      status: originRes.status,
      statusText: originRes.statusText,
      headers: withVary(originRes.headers),
    });
  },
};
