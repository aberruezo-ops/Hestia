# hestia-social-publish

Worker que publica en **Facebook** (página) e **Instagram** (cuenta Business)
desde el botón "Publicar" de la pestaña **Redes** de `/p-edit`. El token de Meta
vive solo aquí como secreto; el navegador nunca lo ve.

## Qué necesitas en Meta (lo haces tú una vez)

1. Una **página de Facebook** de Hestía.
2. Una **cuenta de Instagram Business o Creator** vinculada a esa página
   (Instagram > Configuración > Cuenta > Cambiar a cuenta profesional, y enlázala
   a la página desde la app o desde Meta Business Suite).
3. Una **app** en [developers.facebook.com](https://developers.facebook.com) con
   los permisos `pages_manage_posts`, `pages_read_engagement`,
   `instagram_basic` e `instagram_content_publish`.
   - La publicación en Instagram requiere **revisión de la app** por parte de
     Meta (`instagram_content_publish`). Tarda unos días. Mientras tanto puedes
     probar con usuarios de rol en la app sin revisión.
4. Un **token de página de larga duración** y los IDs:
   - `FB_PAGE_ID`: id de la página.
   - `IG_USER_ID`: id de la cuenta de Instagram Business (`GET /{page-id}?fields=instagram_business_account`).

## Despliegue

```bash
cd workers/social-publish
wrangler kv namespace create SOCIAL_KV     # pega el id en wrangler.toml
wrangler secret put META_TOKEN             # token de página de larga duración
wrangler secret put IG_USER_ID
wrangler secret put FB_PAGE_ID
wrangler secret put PUBLISH_SECRET         # clave que escribirás en /p-edit
wrangler deploy
```

Apunta la URL del worker desplegado en `SOCIAL_PUBLISH_WORKER_URL`
(en `docs/components/admin-page.jsx`).

## Uso

`POST /publish` con JSON:

```json
{ "key": "<PUBLISH_SECRET>", "networks": ["ig","fb"], "caption": "texto", "imageUrl": "https://hestiayourhome.com/assets/apt-vm-gallery-1.jpg" }
```

- `imageUrl` debe ser **pública y https** (Instagram descarga la imagen por URL).
- Devuelve `{ ok, result: { ig:{ok,id|error}, fb:{ok,id|error} } }`.

## Seguridad

- Autorización por `PUBLISH_SECRET` (comparación en tiempo casi constante).
- Rate limit 10 req/IP/15 min (KV).
- CORS restringido a los dominios de Hestía.
