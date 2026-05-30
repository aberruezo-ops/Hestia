---
name: hestia
description: >
  Guía maestra del proyecto Hestía Your Home. Úsala siempre que trabajes en este
  repositorio — diseño visual, CSS, JSX, colores, contraste, arquitectura, build,
  seguridad y reglas de estilo. Si estás a punto de escribir CSS de color, tipografía
  o texto en cualquier componente, consulta esta guía primero.
---

# Hestía Your Home — Guía del proyecto

Sitio estático en GitHub Pages (`docs/`). JSX compilado a JS con
`node scripts/build-jsx.js`. Sin bundler. Sin runtime de framework.

---

## ⚠️ REGLA CRÍTICA: Espacio vacío debajo del footer / títulos cortados

### Espacio en blanco bajo el footer (iOS Safari)

`overscroll-behavior: none` DEBE estar en **ambos** `html` Y `body`. Si solo está en `body`, iOS Safari permite el rubber-band scroll, que muestra espacio vacío debajo del footer.

```css
html {
  overscroll-behavior: none;
}
body {
  overscroll-behavior: none;
}
```

### Títulos de hero cortados por el header fijo

Todos los heroes de páginas interiores DEBEN tener `padding-top` suficiente para quedar por debajo del header fijo (`--chrome-h`). Usa siempre:

```css
.mi-hero {
  padding: calc(var(--chrome-h, 116px) + 48px) var(--page-pad) 72px;
}
```

**Nunca** uses un valor fijo como `padding-top: 80px` — el chrome es ~116px, cualquier valor menor oculta el título detrás del header.

| Hero | Padding-top correcto |
|---|---|
| `.page-hero` (base) | `calc(var(--topbar-h, 36px) + 120px)` |
| `.lsl-hero` | `calc(var(--chrome-h, 116px) + 48px)` |
| `.noticias-hero` | `calc(var(--chrome-h, 116px) + 24px)` |

---

## ⚠️ REGLA CRÍTICA: Contraste texto / fondo

**Este es el error recurrente #1.** Antes de escribir cualquier `color:` CSS,
identifica el tipo de superficie en la que vivirá ese texto.

### Superficies OSCURAS — texto debe ser CLARO

Estas secciones tienen fondos de berenjena muy oscura (casi negro).
Usar texto oscuro sobre ellas produce contraste ~0:

| Selector | Fondo |
|---|---|
| `.apt-avail` | `linear-gradient(135deg, #4E2446, #3D1A35)` |
| `.manifest` | `linear-gradient(125deg, ber-glow, ber-twilight)` animado |
| `.nosotros-team` | `linear-gradient(125deg, ber-glow, ber-twilight)` animado |
| `.home-search` | `linear-gradient(180deg, var(--ber-dk), #2A0F2E)` |
| `.hps-strip` | `var(--ber-dk, #2A0F2E)` |
| `.lm-strip` | `var(--ber-dk, #1A0A1E)` |
| `.lss-strip` | `linear-gradient(135deg, var(--ber-dk), var(--ber))` |
| `.lsl-hero` | dark gradient |
| `.noticias-hero` | video + dark overlay |
| topbar | `#2A0F2E` |
| `.vintro-box` | `var(--ber-dk)` |

**En superficies oscuras SIEMPRE usa:**
```css
color: var(--crema, #FAF6F0);          /* texto principal */
color: var(--arena, #F0E8D5);          /* texto secundario */
color: rgba(240, 232, 213, 0.65);      /* texto muted / labels */
color: rgba(240, 232, 213, 0.45);      /* texto muy sutil / notas */
color: var(--sol-lt, #6FC4D1);         /* acento, highlights */
```

**NUNCA uses en superficies oscuras:**
```css
color: var(--ber);       /* #3D1A35 — oscuro sobre oscuro = invisible */
color: var(--ber-dk);    /* #2A0F2E — peor aún */
color: var(--ink);       /* sinónimo de ber-dk */
color: var(--ink-soft);  /* sinónimo de ber */
/* Y NUNCA combines color oscuro + opacity: 0.5 — esto garantiza invisibilidad */
```

### Superficies CLARAS — texto puede ser oscuro

`body` (`var(--crema, #FAF6F0)`), `.reservas-body`, formularios, cards.
Aquí sí: `color: var(--ber)`, `color: var(--ink-soft)`, `color: rgba(42,15,46,0.6)`.

### Patrón para componentes reutilizados en contextos mixtos

Si un componente (ej. price-engine, amr-card) se usa tanto en sección oscura
como clara, añade **scoped overrides** en el CSS del contexto oscuro:

```css
/* Componente en superficie oscura — override de contraste */
.apt-avail .price-label-sm    { color: rgba(240,232,213,.55); opacity: 1; }
.apt-avail .price-direct-total { color: var(--crema, #FAF6F0); }
.apt-avail .price-avg-night   { color: rgba(240,232,213,.60); opacity: 1; }
```

El `opacity: 1` explícito cancela cualquier `opacity: 0.5` heredado.

---

## Sistema de colores

### Variables principales (`--ber-*` = berenjena, el color marca)

```css
--ber:     #3D1A35;   /* berenjena oscuro — texto en claro, bordes */
--ber-dk:  #2A0F2E;   /* berenjena muy oscuro — fondos noche, nav */
--ber-lt:  #4E2446;   /* berenjena claro — hover states, gradientes */
--ber-glow: #4E2446;  /* igual a ber-lt en gradientes animados */
```

### Sol (turquesa / accent principal)

```css
--sol:      #3AAABB;  /* teal primario — CTAs, links activos */
--sol-h:    #2A8E9E;  /* hover del teal */
--sol-lt:   #6FC4D1;  /* teal claro — texto sobre oscuro */
--sol-text: #176E80;  /* teal legible sobre claro */
```

### Cremas (fondos y texto sobre oscuro)

```css
--crema:    #FAF6F0;  /* fondo página / texto principal sobre oscuro */
--arena:    #F0E8D5;  /* crema cálida / texto secundario sobre oscuro */
--arena-dk: #E4D9BE;  /* crema más oscura */
```

### Identidades de apartamentos

```css
/* Mar — Olivo */
--vm:    #6B7A3A;  --vm2:  #8B9A52;  --vm-dk: #4A5628;

/* Thalassa — Naranja tostado / Tabernas */
--vt:    #B86A3C;  --vt2:  #D08B5A;  --vt-dk: #8A4A24;

/* Salinas — Albero / Amanecer */
--vs:    #D4A84A;  --vs2:  #E8C476;  --vs-dk: #7A5E1A;
```

### Semánticos (estados del sistema)

```css
--err:    #B8246E;  --err-bg:  #F8E0EB;  /* error / peligro */
--warn:   #C8975A;  --warn-bg: #F5E8D4;  /* aviso */
--ok:     #6B7A3A;  --ok-bg:   #E6E8D5;  /* éxito */
```

---

## Tipografía

```css
--serif: 'Playfair Display', 'Lora', Georgia, serif;  /* títulos, headings */
--sans:  'Inter', system-ui, -apple-system, sans-serif; /* cuerpo, UI */
```

**Reglas:**
- `font-family: var(--serif)` para `h1`–`h3` de sección y hero titles
- `font-family: var(--sans)` para labels, body, botones, eyebrows
- Eyebrows: `font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase`

---

## Identidad visual — bordes asimétricos

**Firma visual de Hestía:** `border-radius: 10px 0 10px 0` (esquinas opuestas redondeadas).

```css
border-radius: 10px 0 10px 0;   /* estándar — tarjetas, botones, pills */
border-radius: 12px 0 12px 0;   /* variante mayor — modales, hero cards */
border-radius: 14px 0 14px 0;   /* variante video intro */
border-radius: 8px 0 8px 0;     /* variante mobile */
```

Aplica este patrón a cards, botones, pills, badges, overlays, tags.
**Nunca** uses `border-radius: 50%` (círculos) salvo avatares.

---

## Motion tokens

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);   /* hovers, entradas */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* movimiento on-screen */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* drawers iOS-like */
--dur-fast:    160ms;   /* feedback botones */
--dur-base:    220ms;   /* dropdowns, hovers */
--dur-slow:    320ms;   /* modales, drawers */
```

---

## Arquitectura del sitio

```
docs/
  *.html              — páginas públicas (GitHub Pages sirve desde aquí)
  assets/styles.css   — CSS único, versionado con ?v=NNN en los HTMLs
  components/
    *.jsx             — fuente React (Babel standalone en producción)
    *.js              — compilados por build-jsx.js (NUNCA editar a mano)
  data/
    prices.json       — precios, configuración long-stay, reglas
    availability.json — bloques de fechas no disponibles
    reviews.json      — reseñas de plataformas

data-private/         — fuera de docs/, NO servido por Pages
scripts/
  build-jsx.js        — compila todos los .jsx a .js
  build-pdf.mjs       — genera PDFs desde componentes
```

---

## Patrón de componentes JSX

Los componentes se exportan al `window` global (sin bundler):

```jsx
// Al final de cada .jsx:
Object.assign(window, { ComponentName, OtherComponent });
```

Los HTMLs cargan Babel standalone + los .js compilados en orden:
```html
<script src="components/shared.js"></script>      <!-- primero: shared -->
<script src="components/page-specific.js"></script>
```

**Acceso a datos:**
```javascript
window.PRICES_V2         // precios cargados desde prices.json
window.AVAILABILITY_BLOCKS  // fechas bloqueadas
```

**React sin bundler — no hay imports.** Usa `React.createElement` / JSX via Babel.
`useState`, `useEffect`, etc. se acceden como `React.useState`.

---

## Build y despliegue

**Compilar JSX → JS:**
```bash
node scripts/build-jsx.js
```
El hook PostToolUse de `.claude/settings.json` lo lanza automáticamente al guardar
cualquier `.jsx`. Si falla, revisar el error antes de commitear.

**Versionar CSS:**
Al editar `styles.css`, el hook bumpa automáticamente `?v=NNN` en todos los `.html`.
Si el hook no corrió, hacerlo manualmente:
```bash
# Encuentra versión actual
grep -oE "styles\.css\?v=[0-9]+" docs/index.html | head -1
# Reemplaza en todos los HTMLs
sed -i "s/styles\.css?v=520/styles.css?v=521/g" docs/*.html
```

**Rama de trabajo:**
- Branch actual: `claude/organize-events-by-month-PW7JG`
- Siempre preguntar al usuario si trabajar en `main` o en feature branch.

**Push:**
```bash
git push -u origin <branch-name>
```

---

## Modelo de negocio — Estancias largas

Estancias >28 noches, Sep–Jun (no Jul ni Ago).

**Tarifas mensuales (€/mes):**
| Meses | Tarifa |
|---|---|
| Nov, Dic, Ene, Feb, Mar, Abr | 1.450 € |
| Oct, May | 1.590 € |
| Sep, Jun | 1.790 € |
| Jul, Ago | No disponible para estancia larga |

**Noches especiales (Navidad: 23 dic – 6 ene / Semana Santa):** 80 €/noche fijo.

**Lógica de precio:** suma proporcional por días en cada mes del período + noches especiales a tarifa plana.

---

## Seguridad — reglas obligatorias

1. **Nunca** escribas API keys, tokens o secretos en código que vaya a `docs/` (es público).
2. **PATs de GitHub** solo en memoria del navegador durante sesión de `/p-edit.html`. Nunca en `localStorage`, cookies, ni enviados a otro endpoint que no sea `api.github.com`.
3. **Nunca** `dangerouslySetInnerHTML` con contenido de usuario sin sanitizar. React escapa por defecto — mantenlo.
4. **Datos de huéspedes** (nombre, teléfono, DNI, importes) solo en `data-private/` (fuera de `docs/`).
5. Workers de Cloudflare: secretos vía `wrangler secret put`, rate limiting (100 req/IP/15min general, 10 req/IP/15min sensibles), headers de seguridad.
6. Nunca datos personales en `docs/` ni en mensajes de commit.

---

## Estilo de código

- Sin comentarios redundantes. Solo documenta el WHY no obvio.
- Sin emojis salvo petición explícita.
- Sin backwards-compat shims innecesarios.
- Edita archivos existentes antes de crear nuevos.
- 3 líneas claras > 1 elegante críptica.
- No añadas features, abstracciones ni error handling para casos que no pueden ocurrir.

---

## Checklist al tocar CSS de color o texto

Antes de escribir cualquier regla de color, responde:

1. ¿En qué sección vive este elemento? ¿Es oscura o clara? (ver tabla de superficies)
2. Si es oscura: ¿usas `var(--crema)` / `rgba(240,232,213,...)` para el texto?
3. Si es un componente reutilizable: ¿has añadido el scoped override para el contexto oscuro?
4. ¿Has evitado `color: var(--ber)` + `opacity: 0.5`? (= invisible sobre oscuro)
5. Rápida visual antes de commitear: ¿el texto es legible contra el fondo?
