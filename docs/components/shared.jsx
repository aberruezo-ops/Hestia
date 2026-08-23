// ================================================================
// HESTÍA, componentes compartidos
// ================================================================

// View Transition helper: usa la API nativa del navegador (Chrome 111+,
// Safari 18.2+, Firefox 144+). En navegadores sin soporte, ejecuta el
// callback directamente sin animación. Se exporta como window._vt.
const _vt = (cb) => {
  if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => {
      // El callback es síncrono dentro del wrapper; React lotea los
      // setState dentro de él para que la animación los capture juntos.
      cb();
    });
  } else {
    cb();
  }
};

// Nombre de huésped para mostrar en el portal: nunca el apellido completo.
// Los datos internos (reviews.json, etc.) pueden guardar el nombre completo,
// pero de cara al público siempre se recorta a "Nombre X." (o "Nombre1 & Nombre2 X."
// en parejas). Defensivo: si el dato ya llega recortado, no lo toca.
const _shortGuestName = (name) => {
  const n = String(name || '').trim();
  if (!n) return n;
  const shortenOne = (part) => {
    const words = part.trim().split(/\s+/);
    if (words.length <= 1) return part.trim();
    const last = words[words.length - 1];
    if (last.length <= 2 || last.endsWith('.')) return part.trim();
    const initial = [...last].find(ch => /\p{L}/u.test(ch));
    return `${words[0]} ${(initial || last[0]).toUpperCase()}.`;
  };
  if (n.includes(' & ')) {
    const [a, b] = n.split(' & ');
    return `${shortenOne(a)} & ${shortenOne(b)}`;
  }
  return shortenOne(n);
};
window._shortGuestName = _shortGuestName;

// ----------------------------------------------------------------
// _hestiaTrack, registra eventos de funnel.
// Guarda en localStorage (ring buffer 300 eventos) para la pestaña
// Analítica de /p-edit. También intenta enviar al endpoint RUM de
// Cloudflare si el beacon está cargado.
// ----------------------------------------------------------------
const _hestiaTrack = (name, props = {}) => {
  try {
    const ev = { ts: Date.now(), name, ...props };
    const key = '_htevt';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift(ev);
    if (arr.length > 300) arr.length = 300;
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (_) {}
  try {
    if (window.__cfBeacon) {
      navigator.sendBeacon('https://cloudflareinsights.com/cdn-cgi/rum',
        new Blob([JSON.stringify({ ...window.__cfBeacon, type: 'custom', name, ...props })],
          { type: 'application/json' }));
    }
  } catch (_) {}
};
window._hestiaTrack = _hestiaTrack;

const HestiaLogoMark = ({ size = 40, color = '#3AAABB' }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
    {/* Dos columnas H serif */}
    <g fill={color}>
      <path d="M18 22 L32 22 L32 50 L32 56 L30 62 L30 98 L18 98 Z" />
      <path d="M88 22 L102 22 L102 98 L90 98 L90 62 L88 56 L88 50 Z" />
      {/* Remate superior (serif) */}
      <rect x="14" y="20" width="22" height="4" rx="1" />
      <rect x="84" y="20" width="22" height="4" rx="1" />
      <rect x="14" y="96" width="22" height="4" rx="1" />
      <rect x="84" y="96" width="22" height="4" rx="1" />
    </g>
    {/* Dos olas orgánicas (tejado + mediterráneo) */}
    <path d="M32 58 C 44 42, 60 42, 60 56 C 60 46, 78 46, 90 62"
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    <path d="M32 66 C 46 52, 60 52, 60 64 C 60 54, 76 54, 90 70"
          fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

// ── Iconos propios de Hestía ──────────────────────────────────────────
// Estilo line en rejilla 24, color heredado (currentColor). El grosor y los
// remates van por CSS (.hi en styles.css). Firma de marca: la onda del logo
// en "home" y "wave". Se montan una vez (IconSprite) y se usan con <HiIcon/>.
const _ln = { fill: 'none', stroke: 'currentColor' };   // trazo
const _fl = { fill: 'currentColor', stroke: 'none' };    // relleno (acentos)
const IconSprite = () => (
  <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true" focusable="false">
    <symbol id="hi-home" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M6 5v14M18 5v14"/><path fill="none" stroke="#3AAABB" d="M6 12c3-3 9 3 12 0"/></symbol>
    <symbol id="hi-wave" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M3 9c2.2-2.4 4.8-2.4 6 0s4.8 2.4 6 0 4.8-2.4 6 0"/><path fill="none" stroke="#3AAABB" d="M3 15c2.2-2.4 4.8-2.4 6 0s4.8 2.4 6 0 4.8-2.4 6 0"/></symbol>
    <symbol id="hi-olive" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5.5 19.5C9 13.5 13 9.5 19.5 6"/><path fill="none" stroke="currentColor" d="M11.8 12.4c-2-.2-3-1.4-2.8-3.6 2 .2 3 1.4 2.8 3.6z"/><path fill="none" stroke="currentColor" d="M15.4 8.8c-.2-2.1 1-3.3 3.1-3.1.2 2.1-1 3.3-3.1 3.1z"/><circle fill="#6B7A3A" stroke="none" cx="8.6" cy="15.4" r="1.6"/></symbol>
    <symbol id="hi-sun" viewBox="0 0 24 24"><circle fill="#D4A84A" stroke="none" cx="12" cy="12" r="3.4"/><circle fill="none" stroke="currentColor" cx="12" cy="12" r="4"/><path fill="none" stroke="currentColor" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></symbol>
    <symbol id="hi-salt" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" d="M12 3l5 6-5 12-5-12z"/><path fill="none" stroke="currentColor" d="M12 3l5 6-5 12-5-12z"/><path fill="none" stroke="currentColor" d="M7 9h10M12 3v18"/></symbol>
    <symbol id="hi-key" viewBox="0 0 24 24"><circle cx="7.8" cy="7.8" r="3.9" fill="none" stroke="currentColor"/><circle cx="7.8" cy="7.8" r="1.2" fill="#3AAABB" stroke="none"/><path fill="none" stroke="currentColor" d="M10.6 10.6 20 20M17 15.3l2.4 2.4M14.7 17.6l2 2"/></symbol>
    <symbol id="hi-paw" viewBox="0 0 24 24"><ellipse fill="none" stroke="currentColor" cx="7.5" cy="9.5" rx="1.5" ry="2"/><ellipse fill="none" stroke="currentColor" cx="12" cy="8" rx="1.5" ry="2"/><ellipse fill="none" stroke="currentColor" cx="16.5" cy="9.5" rx="1.5" ry="2"/><path fill="#6B7A3A" stroke="none" d="M12 12c-2.5 0-4.5 2-4.5 4 0 1.6 1.6 2.4 4.5 2.4s4.5-.8 4.5-2.4c0-2-2-4-4.5-4z"/></symbol>
    <symbol id="hi-cal" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" d="M4 8a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 8v2H4z"/><rect fill="none" stroke="currentColor" x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path fill="none" stroke="currentColor" d="M8.5 3v4M15.5 3v4"/><circle fill="currentColor" stroke="none" cx="12" cy="15" r="1.3"/></symbol>
    <symbol id="hi-chat" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5 18l-1.2 2.6 3-1.2A8.5 7.5 0 1 1 20 12 8 7.5 0 0 1 5 18z"/><circle fill="#3AAABB" stroke="none" cx="9" cy="11.5" r="1"/><circle fill="#3AAABB" stroke="none" cx="12" cy="11.5" r="1"/><circle fill="#3AAABB" stroke="none" cx="15" cy="11.5" r="1"/></symbol>
    <symbol id="hi-star" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="currentColor" d="M12 4l2.3 4.9 5.2.7-3.8 3.6 1 5.3L12 16.4 7.3 18.5l1-5.3L4.5 9.6l5.2-.7z"/></symbol>
    <symbol id="hi-star-fill" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" d="M12 4l2.3 4.9 5.2.7-3.8 3.6 1 5.3L12 16.4 7.3 18.5l1-5.3L4.5 9.6l5.2-.7z"/></symbol>
    <symbol id="hi-pin" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M12 21c4-4.5 6-7.7 6-10.5A6 6 0 0 0 6 10.5C6 13.3 8 16.5 12 21z"/><circle fill="#3AAABB" stroke="none" cx="12" cy="10.3" r="2.1"/></symbol>
    <symbol id="hi-shield" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5v-5z"/><path fill="none" stroke="#6B7A3A" d="M9 12l2 2 4-4"/></symbol>
    <symbol id="hi-mic" viewBox="0 0 24 24"><rect fill="#3AAABB" stroke="none" x="9" y="3" width="6" height="11" rx="3"/><path fill="none" stroke="currentColor" d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/></symbol>
    <symbol id="hi-boat" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" d="M12 5l6 9H12z"/><path fill="none" stroke="currentColor" d="M12 3v11"/><path fill="none" stroke="currentColor" d="M4 17h16l-2.5 4h-11z"/></symbol>
    <symbol id="hi-spark" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" d="M12 3c.7 4.5 1.8 5.6 6 6.3-4.2.7-5.3 1.8-6 6.3-.7-4.5-1.8-5.6-6-6.3 4.2-.7 5.3-1.8 6-6.3z"/><path fill="none" stroke="currentColor" d="M18.5 15c.3 1.6.6 1.9 2.2 2.2-1.6.3-1.9.6-2.2 2.2-.3-1.6-.6-1.9-2.2-2.2 1.6-.3 1.9-.6 2.2-2.2z"/></symbol>
    <symbol id="hi-news" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path fill="none" stroke="currentColor" d="M17 8h3v9a2 2 0 0 1-2 2"/><path fill="none" stroke="#3AAABB" d="M7 8h7M7 11h7M7 14h4"/></symbol>
    <symbol id="hi-indalo" viewBox="0 0 24 24"><path fill="none" stroke="#D4A84A" d="M4.5 13C4.5 5.5 19.5 5.5 19.5 13"/><path fill="none" stroke="currentColor" d="M12 6.8V15"/><path fill="none" stroke="currentColor" d="M12 11 4.5 13M12 11 19.5 13"/><path fill="none" stroke="currentColor" d="M12 15l-3.2 5M12 15l3.2 5"/></symbol>
    <symbol id="hi-bed" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" d="M7 12V9.7h4V12z"/><path fill="none" stroke="currentColor" d="M3 18v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path fill="none" stroke="currentColor" d="M3 18v2M21 18v2M3 15h18"/></symbol>
    <symbol id="hi-wifi" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5 9.5c4-3.6 10-3.6 14 0"/><path fill="none" stroke="currentColor" d="M7.6 12.6c2.6-2.4 6.2-2.4 8.8 0"/><path fill="none" stroke="currentColor" d="M10.2 15.7c1.1-1 2.5-1 3.6 0"/><circle fill="#3AAABB" stroke="none" cx="12" cy="18.5" r="1.2"/></symbol>
    <symbol id="hi-fork" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12"/><path fill="none" stroke="#6B7A3A" d="M16 3c-1.8 0-2.8 2-2.8 4.6 0 2.2 1 3.4 2.8 3.4v10"/></symbol>
    <symbol id="hi-car" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M4 16l1.6-5.2A2 2 0 0 1 7.5 9.4h9a2 2 0 0 1 1.9 1.4L20 16"/><path fill="none" stroke="currentColor" d="M4 16h16v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H7.5v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle fill="#3AAABB" stroke="none" cx="7.8" cy="18.2" r="1.25"/><circle fill="#3AAABB" stroke="none" cx="16.2" cy="18.2" r="1.25"/></symbol>
    <symbol id="hi-tag" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" d="M4 12.5l8-8a2 2 0 0 1 1.4-.5H18a2 2 0 0 1 2 2v4.1a2 2 0 0 1-.5 1.4l-8 8a2 2 0 0 1-2.8 0l-4.7-4.7a2 2 0 0 1 0-2.8z"/><path fill="none" stroke="currentColor" d="M4 12.5l8-8a2 2 0 0 1 1.4-.5H18a2 2 0 0 1 2 2v4.1a2 2 0 0 1-.5 1.4l-8 8a2 2 0 0 1-2.8 0l-4.7-4.7a2 2 0 0 1 0-2.8z"/><circle fill="none" stroke="currentColor" cx="15.5" cy="8.5" r="1.3"/></symbol>
    <symbol id="hi-ban" viewBox="0 0 24 24"><circle fill="none" stroke="currentColor" cx="12" cy="12" r="8.5"/><path fill="none" stroke="#3AAABB" d="M6.5 6.5l11 11"/></symbol>
    <symbol id="hi-clock" viewBox="0 0 24 24"><circle fill="none" stroke="currentColor" cx="12" cy="12" r="8.5"/><path fill="none" stroke="#3AAABB" d="M12 7v5l3.2 2"/></symbol>
    <symbol id="hi-unlock" viewBox="0 0 24 24"><rect fill="#D4A84A" stroke="none" x="5" y="11" width="14" height="9" rx="2"/><rect fill="none" stroke="currentColor" x="5" y="11" width="14" height="9" rx="2"/><path fill="none" stroke="currentColor" d="M8 11V8a4 4 0 0 1 7.7-1.5"/><circle fill="none" stroke="currentColor" cx="12" cy="15.5" r="1.2"/></symbol>
    <symbol id="hi-card" viewBox="0 0 24 24"><rect fill="none" stroke="currentColor" x="3" y="6" width="18" height="12" rx="2"/><rect fill="#3AAABB" stroke="none" x="3" y="9.5" width="18" height="2.6"/><path fill="none" stroke="currentColor" d="M7 15h4"/></symbol>
    <symbol id="hi-gift" viewBox="0 0 24 24"><rect fill="none" stroke="currentColor" x="4" y="9" width="16" height="11" rx="1.5"/><path fill="none" stroke="currentColor" d="M4 13h16M12 9v11"/><path fill="#D4A84A" stroke="none" d="M12 9C9.5 9 8 6.8 9 5.3c.8-1.2 3-.3 3 3.7zM12 9c2.5 0 4-2.2 3-3.7-.8-1.2-3-.3-3 3.7z"/></symbol>
    <symbol id="hi-sound" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M11 5 6 9H2v6h4l5 4z"/><path fill="none" stroke="#3AAABB" d="M15.5 8.5a5 5 0 0 1 0 7"/><path fill="none" stroke="#3AAABB" d="M18.5 5.5a9 9 0 0 1 0 13"/></symbol>
    <symbol id="hi-mute" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M11 5 6 9H2v6h4l5 4z"/><path fill="none" stroke="#3AAABB" d="M16 9l6 6M22 9l-6 6"/></symbol>
    <symbol id="hi-lock" viewBox="0 0 24 24"><rect fill="none" stroke="currentColor" x="5" y="11" width="14" height="9" rx="2"/><path fill="none" stroke="currentColor" d="M8 11V8a4 4 0 0 1 8 0v3"/><circle fill="#3AAABB" stroke="none" cx="12" cy="15.3" r="1.3"/></symbol>
    <symbol id="hi-doc" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M6 3h8l4 4v14H6z"/><path fill="none" stroke="currentColor" d="M14 3v4h4"/><path fill="none" stroke="#3AAABB" d="M9 12h6M9 15h6M9 18h3"/></symbol>
    <symbol id="hi-receipt" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5 3h14v18l-2.3-1.5L14.3 21 12 19.5 9.7 21 7.3 19.5 5 21z"/><path fill="none" stroke="#3AAABB" d="M8 8h8M8 11h8M8 14h5"/></symbol>
    <symbol id="hi-clipboard" viewBox="0 0 24 24"><rect fill="none" stroke="currentColor" x="5" y="5" width="14" height="16" rx="2"/><path fill="none" stroke="currentColor" d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1z"/><path fill="none" stroke="#3AAABB" d="M8.5 11h7M8.5 14h7M8.5 17h4"/></symbol>
    <symbol id="hi-chart" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M4 4v16h16"/><rect fill="#3AAABB" stroke="none" x="7" y="12" width="3" height="5"/><rect fill="#3AAABB" stroke="none" x="12" y="8" width="3" height="9"/><rect fill="#3AAABB" stroke="none" x="17" y="10" width="3" height="7"/></symbol>
    <symbol id="hi-euro" viewBox="0 0 24 24"><circle fill="none" stroke="currentColor" cx="12" cy="12" r="8.5"/><path fill="none" stroke="#3AAABB" d="M15.5 8.5a4.2 4.2 0 1 0 0 7M7.5 11h6M7.5 13.5h5.5"/></symbol>
    <symbol id="hi-megaphone" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M4 9.5v5h3l9 4.5v-14L7 9.5z"/><path fill="none" stroke="#3AAABB" d="M19 9a4 4 0 0 1 0 6"/><path fill="none" stroke="currentColor" d="M7 14.5V19"/></symbol>
    <symbol id="hi-alert" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" d="M12 3.5 1.8 20.5h20.4z" opacity="0.18"/><path fill="none" stroke="currentColor" d="M12 3.5 1.8 20.5h20.4z"/><path fill="none" stroke="currentColor" d="M12 9.5v5"/><circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none"/></symbol>
    <symbol id="hi-award" viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5" fill="none" stroke="currentColor"/><circle cx="12" cy="9" r="2" fill="#D4A84A" stroke="none"/><path fill="none" stroke="#D4A84A" d="M9.3 13.4 8 21l4-2.2 4 2.2-1.3-7.6"/></symbol>
    <symbol id="hi-wheat" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M12 21V7"/><path fill="none" stroke="#D4A84A" d="M12 9c0-2 1.6-3.2 3.2-3.2C15.2 7.8 13.6 9 12 9zM12 9c0-2-1.6-3.2-3.2-3.2C8.8 7.8 10.4 9 12 9zM12 13c0-2 1.6-3.2 3.2-3.2C15.2 11.8 13.6 13 12 13zM12 13c0-2-1.6-3.2-3.2-3.2C8.8 11.8 10.4 13 12 13z"/></symbol>
    <symbol id="hi-cocktail" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.18" d="M6 7h12l-6 6z"/><path fill="none" stroke="currentColor" d="M4 5h16l-8 8zM12 13v6M8 19h8"/><circle cx="16.5" cy="5" r="1.3" fill="#3AAABB" stroke="none"/></symbol>
    <symbol id="hi-umbrella" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.18" d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z"/><path fill="none" stroke="currentColor" d="M4 12a8 8 0 0 1 16 0zM12 12v7M12 19a2 2 0 0 0 2.2-1.8"/></symbol>
    <symbol id="hi-lifebuoy" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor"/><path fill="none" stroke="#3AAABB" d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5"/></symbol>
    <symbol id="hi-mountain" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M3 19 9.5 8l3.3 5.4L16 9l5 10z"/><path fill="#6FC4D1" stroke="none" opacity="0.5" d="M16 9l1.8 3.4-2.2.3-1-1.7z"/></symbol>
    <symbol id="hi-cart" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M3 4h2l2.4 11h10l2-7.5H6.2"/><circle cx="9" cy="19" r="1.3" fill="#3AAABB" stroke="none"/><circle cx="16.5" cy="19" r="1.3" fill="#3AAABB" stroke="none"/></symbol>
    <symbol id="hi-fish" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M3 12c4-5 11-5 15 0-4 5-11 5-15 0z"/><path fill="none" stroke="currentColor" d="M3 12c4-5 11-5 15 0-4 5-11 5-15 0z"/><path fill="none" stroke="currentColor" d="M18 12c1.4-1.4 3-2 3-2v4s-1.6-.6-3-2z"/><circle cx="8" cy="11" r="0.7" fill="currentColor" stroke="none"/></symbol>
    <symbol id="hi-pill" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.18" d="M14.5 3.5 20.5 9.5l-5.5 5.5-6-6z"/><path fill="none" stroke="currentColor" d="M14.5 3.5 3.5 14.5a4 4 0 0 0 6 6l11-11a4 4 0 0 0-6-6z"/><path fill="none" stroke="currentColor" d="M9 9l6 6"/></symbol>
    <symbol id="hi-cross" viewBox="0 0 24 24"><path fill="#B8246E" stroke="none" opacity="0.16" d="M9.5 3h5v5.5H20v5h-5.5V19h-5v-5.5H4v-5h5.5z"/><path fill="none" stroke="currentColor" d="M9.5 3h5v5.5H20v5h-5.5V19h-5v-5.5H4v-5h5.5z"/></symbol>
    <symbol id="hi-stethoscope" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M6 3v6a4 4 0 0 0 8 0V3"/><path fill="none" stroke="currentColor" d="M10 13a5 5 0 0 0 5 5 3 3 0 0 0 3-3"/><circle cx="18" cy="12" r="2" fill="#3AAABB" stroke="none"/></symbol>
    <symbol id="hi-heart" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M12 20s-7-4.5-7-9.5a4 4 0 0 1 7-2.6 4 4 0 0 1 7 2.6c0 5-7 9.5-7 9.5z"/><path fill="none" stroke="currentColor" d="M12 20s-7-4.5-7-9.5a4 4 0 0 1 7-2.6 4 4 0 0 1 7 2.6c0 5-7 9.5-7 9.5z"/></symbol>
    <symbol id="hi-gem" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M6 4h12l3 5-9 11L3 9z"/><path fill="none" stroke="currentColor" d="M6 4h12l3 5-9 11L3 9z"/><path fill="none" stroke="currentColor" d="M3 9h18M9.5 4 8 9l4 11M14.5 4 16 9l-4 11"/></symbol>
    <symbol id="hi-boot" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M8 3v8H6.5c-1.6 0-2.8 1-2.8 3v3h16.6v-1.6c0-2-1.4-2.8-3.6-3.3l-4.2-1V3z"/><path fill="none" stroke="#6B7A3A" d="M3.7 16h15.6"/></symbol>
    <symbol id="hi-ticket" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.12" d="M3 8a2 2 0 0 0 0 4v3h18v-3a2 2 0 0 1 0-4V5H3z"/><path fill="none" stroke="currentColor" d="M3 8a2 2 0 0 0 0 4v3h18v-3a2 2 0 0 1 0-4V5H3z"/><path fill="none" stroke="#3AAABB" d="M14.5 5v15"/></symbol>
    <symbol id="hi-wine" viewBox="0 0 24 24"><path fill="#3D1A35" stroke="none" opacity="0.16" d="M7.3 5h9.4c-.4 3-2 5-4.7 5S7.7 8 7.3 5z"/><path fill="none" stroke="currentColor" d="M7 3h10c0 4-2 7-5 7s-5-3-5-7zM12 10v8M8.5 21h7"/></symbol>
    <symbol id="hi-buildings" viewBox="0 0 24 24"><path fill="#B86A3C" stroke="none" opacity="0.16" d="M5 21V9l5-3 5 3v12z"/><path fill="none" stroke="currentColor" d="M3 21h18M5 21V9l5-3 5 3v12M15 21V12h4v9M8.5 13h3M8.5 17h3"/></symbol>
    <symbol id="hi-book" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 0-2 2z"/><path fill="none" stroke="currentColor" d="M5 4v15a2 2 0 0 1 2-2h11"/><path fill="none" stroke="#3AAABB" d="M9 8h5"/></symbol>
    <symbol id="hi-shop" viewBox="0 0 24 24"><path fill="#8A4A24" stroke="none" opacity="0.16" d="M3 5h18l1 4H2z"/><path fill="none" stroke="currentColor" d="M3 5h18l1 4H2zM4 9v11h16V9M9.5 20v-6h5v6"/></symbol>
    <symbol id="hi-basket" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5 9h14l-1.4 10H6.4zM9 9 11 4M15 9 13 4"/><path fill="none" stroke="#6B7A3A" d="M8.5 12v4M12 12v4M15.5 12v4"/></symbol>
    <symbol id="hi-fuel" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M5 5h8v5H5z"/><path fill="none" stroke="currentColor" d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M3 21h12M5 5h8v5H5z"/><path fill="none" stroke="currentColor" d="M13 9h3a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9.5l-2-2"/></symbol>
    <symbol id="hi-plug" viewBox="0 0 24 24"><rect x="5" y="3" width="9" height="18" rx="1.5" fill="none" stroke="currentColor"/><path fill="#3AAABB" stroke="none" d="M10 6.5 7.3 11H9.5l-1 5L13 10h-2.2z"/><path fill="none" stroke="currentColor" d="M14 8h2a1.6 1.6 0 0 1 1.6 1.6V15a1.6 1.6 0 0 0 3.2 0v-5"/></symbol>
    <symbol id="hi-laptop" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M6.5 6.5h11v7h-11z"/><path fill="none" stroke="currentColor" d="M5 5h14v10H5zM3 18h18l-1.2 1.6H4.2z"/></symbol>
    <symbol id="hi-shirt" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.13" d="M8 8 6 9 4 6l4-3a3 3 0 0 0 6 0l4 3-2 3-2-1z"/><path fill="none" stroke="currentColor" d="M8 3 4 6l2 3 2-1v10h8V8l2 1 2-3-4-3a3 3 0 0 1-6 0z"/></symbol>
    <symbol id="hi-pool" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M3 14c2 0 2 1.4 4.5 1.4S10 14 12 14s2 1.4 4.5 1.4S19 14 21 14M3 18c2 0 2 1.4 4.5 1.4S10 18 12 18s2 1.4 4.5 1.4S19 18 21 18"/><path fill="none" stroke="#3AAABB" d="M8 13V5.5a2 2 0 0 1 4 0M14 13V5.5a2 2 0 0 1 4 0M8 8.5h4"/></symbol>
    <symbol id="hi-sofa" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M5 12h14v5H5z"/><path fill="none" stroke="currentColor" d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 12.5A1.8 1.8 0 0 1 5 14v3h14v-3a1.8 1.8 0 0 1 3.6 0M6 17v2.5M18 17v2.5"/></symbol>
    <symbol id="hi-lift" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5" fill="none" stroke="currentColor"/><path fill="#3AAABB" stroke="none" d="M12 6 9.6 9.2h4.8zM12 18 9.6 14.8h4.8z"/></symbol>
    <symbol id="hi-tv" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M5 7h14v8H5z"/><rect x="3" y="5" width="18" height="12" rx="1.5" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M8 20h8M12 17v3"/></symbol>
    <symbol id="hi-film" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M7.5 5v14M16.5 5v14M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21"/><path fill="#3AAABB" stroke="none" d="M10.5 9.5 15 12l-4.5 2.5z"/></symbol>
    <symbol id="hi-snow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17"/><path fill="none" stroke="#3AAABB" d="M9.5 4 12 6l2.5-2M9.5 20 12 18l2.5 2M3.3 9.7 6.1 9l.5-2.8M17.4 6.2l.5 2.8 2.8.7M3.3 14.3l2.8.7-.5 2.8M17.9 17.8l-.5-2.8 2.8-.7"/></symbol>
    <symbol id="hi-cooktop" viewBox="0 0 24 24"><circle cx="10" cy="13" r="6" fill="none" stroke="currentColor"/><circle cx="10" cy="13" r="2.6" fill="#3AAABB" stroke="none" opacity="0.4"/><path fill="none" stroke="currentColor" d="M16 13h6"/></symbol>
    <symbol id="hi-washer" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor"/><circle cx="12" cy="13" r="5" fill="none" stroke="currentColor"/><circle cx="12" cy="13" r="2.4" fill="#3AAABB" stroke="none" opacity="0.4"/><path fill="none" stroke="currentColor" d="M7 6h.01M10 6h.01"/></symbol>
    <symbol id="hi-bath" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M4 13h16v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path fill="none" stroke="currentColor" d="M3 13h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 13V6a2 2 0 0 1 4 0M6.5 20l-1 1.5M17.5 20l1 1.5"/></symbol>
    <symbol id="hi-shower" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M6 13V7a3 3 0 0 1 6 0M12 4.5a2 2 0 0 1 4 0V6M2.5 13h8"/><path fill="none" stroke="#3AAABB" d="M4.5 16v3M6.5 16.5v3.5M8.5 16v3"/></symbol>
    <symbol id="hi-baby" viewBox="0 0 24 24"><circle cx="12" cy="6.5" r="3.2" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M6.5 21v-2.5a5.5 5.5 0 0 1 11 0V21"/><circle cx="11" cy="6.3" r="0.5" fill="currentColor" stroke="none"/><circle cx="13" cy="6.3" r="0.5" fill="currentColor" stroke="none"/><path fill="none" stroke="#3AAABB" d="M11 8c.6.5 1.4.5 2 0"/></symbol>
    <symbol id="hi-bottle" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M9 13h6v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path fill="none" stroke="currentColor" d="M9 8h6v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM10 8V5h4v3M10 12h4"/></symbol>
    <symbol id="hi-flower" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.3" fill="#D4A84A" stroke="none"/><g fill="none" stroke="currentColor"><ellipse cx="12" cy="6.4" rx="2" ry="3"/><ellipse cx="12" cy="17.6" rx="2" ry="3"/><ellipse cx="6.4" cy="12" rx="3" ry="2"/><ellipse cx="17.6" cy="12" rx="3" ry="2"/></g></symbol>
    <symbol id="hi-aroma" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M7.5 14h9a4.5 4.5 0 0 1-9 0z"/><path fill="none" stroke="currentColor" d="M6.5 13.5a5.5 5.5 0 0 0 11 0z"/><path fill="none" stroke="#3AAABB" d="M11 10c0-1.6 1-2.2 1-3.8M14 10.5c0-1.6 1-2.2 1-3.4"/></symbol>
    <symbol id="hi-dryrack" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M5 4v16M19 4v16M5 20h14"/><path fill="none" stroke="#3AAABB" d="M5 8h14M5 12h14M5 16h14"/></symbol>
    <symbol id="hi-thermometer" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M12 4a2 2 0 0 1 2 2v8.6a4 4 0 1 1-4 0V6a2 2 0 0 1 2-2z"/><circle cx="12" cy="17" r="2.3" fill="#B8246E" stroke="none"/><path fill="none" stroke="#B8246E" d="M12 10v5"/></symbol>
    <symbol id="hi-jacuzzi" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M5 13h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path fill="none" stroke="currentColor" d="M4 12.5h16v3.5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path fill="none" stroke="#3AAABB" d="M8 9.5c0-1.2.8-1.8.8-3M12 9.5c0-1.2.8-1.8.8-3M16 9.5c0-1.2.8-1.8.8-3"/></symbol>
    <symbol id="hi-dumbbell" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M3 9v6M6 6.5v11M18 6.5v11M21 9v6"/><path fill="none" stroke="#3AAABB" d="M6 12h12"/></symbol>
    <symbol id="hi-sauna" viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="7" ry="2" fill="#D4A84A" stroke="none" opacity="0.3"/><path fill="none" stroke="currentColor" d="M4 16h16v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM6 16c1.5-1 4.5-1 6 0s4.5 1 6 0"/><path fill="none" stroke="#3AAABB" d="M9 11c0-1.2.8-1.8.8-3M14.2 11c0-1.2.8-1.8.8-3"/></symbol>
    <symbol id="hi-tennis" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor"/><path fill="none" stroke="#6B7A3A" d="M5.2 6.2a11 11 0 0 0 0 11.6M18.8 6.2a11 11 0 0 1 0 11.6"/></symbol>
    <symbol id="hi-coffee" viewBox="0 0 24 24"><path fill="#8A4A24" stroke="none" opacity="0.16" d="M5 9h11v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path fill="none" stroke="currentColor" d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9.5h2.5a2.5 2.5 0 0 1 0 5H17"/><path fill="none" stroke="#3AAABB" d="M8 3c0 1.5-1 1.5-1 3M12 3c0 1.5-1 1.5-1 3"/></symbol>
    <symbol id="hi-briefcase" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M3 11h18v4H3z"/><rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18"/></symbol>
    <symbol id="hi-toilet" viewBox="0 0 24 24"><circle cx="8.5" cy="4.6" r="1.5" fill="currentColor" stroke="none"/><path fill="none" stroke="currentColor" d="M8.5 7c-1 0-1.6.6-1.8 1.6L6 13h1.2l.4 6h1.8l.4-6H11l-.7-4.4C10.1 7.6 9.5 7 8.5 7z"/><circle cx="15.5" cy="4.6" r="1.5" fill="currentColor" stroke="none"/><path fill="none" stroke="#3AAABB" d="M14 7.5h3l1.4 5h-1.2L17 19h-3l.2-6.5H13z"/></symbol>
    <symbol id="hi-walk" viewBox="0 0 24 24"><circle cx="13" cy="4.4" r="1.6" fill="currentColor" stroke="none"/><path fill="none" stroke="currentColor" d="M13 7c-1 0-1.7.6-2 1.6L9 13l2.2 1.2.6-2.2.2 3L10 21M13.2 11.2 16.5 13l1.8 3"/></symbol>
    <symbol id="hi-bus" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="13" rx="2" fill="none" stroke="currentColor"/><path fill="#3AAABB" stroke="none" opacity="0.14" d="M5 6h14v5H5z"/><path fill="none" stroke="currentColor" d="M4 11h16M12 4v7"/><circle cx="8" cy="19" r="1.4" fill="currentColor" stroke="none"/><circle cx="16" cy="19" r="1.4" fill="currentColor" stroke="none"/></symbol>
    <symbol id="hi-accessible" viewBox="0 0 24 24"><circle cx="11" cy="4.4" r="1.7" fill="currentColor" stroke="none"/><circle cx="11.5" cy="15" r="5.5" fill="none" stroke="#3AAABB"/><path fill="none" stroke="currentColor" d="M9 8h4.2l.6 4H17l1.8 6"/></symbol>
    <symbol id="hi-bike" viewBox="0 0 24 24"><circle cx="6" cy="16" r="3.4" fill="none" stroke="currentColor"/><circle cx="18" cy="16" r="3.4" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M6 16 10 9h5l3 7M10 9h5M9 9 7.6 6.2H6"/><circle cx="15" cy="6.2" r="1" fill="#3AAABB" stroke="none"/></symbol>
    <symbol id="hi-train" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="13" rx="3" fill="none" stroke="currentColor"/><path fill="#3AAABB" stroke="none" opacity="0.14" d="M7 6h10v4H7z"/><path fill="none" stroke="currentColor" d="M6 10h12"/><circle cx="9" cy="13" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="0.9" fill="currentColor" stroke="none"/><path fill="none" stroke="currentColor" d="M8.5 16 6.5 20M15.5 16l2 4M9 20h6"/></symbol>
    <symbol id="hi-plane" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.18" d="M21 6 15 20l-3-5z"/><path fill="none" stroke="currentColor" d="M2.5 13 21 6l-6 14-3-5z"/><path fill="none" stroke="currentColor" d="m12 15-2 4"/></symbol>
    <symbol id="hi-door" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.12" d="M7 4h10v16H7z"/><path fill="none" stroke="currentColor" d="M6 21h12M7 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17"/><circle cx="14.3" cy="12" r="1" fill="currentColor" stroke="none"/></symbol>
    <symbol id="hi-bell" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M7 16v-5a5 5 0 0 1 10 0v5z"/><path fill="none" stroke="currentColor" d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5h-15zM10 18.5a2 2 0 0 0 4 0"/></symbol>
    <symbol id="hi-nosmoking" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M5.5 13h9v2h-9zM15.5 13v2M17.5 13v2M15 11c0-1.5 1.5-1.5 1.5-3"/><path fill="none" stroke="#B8246E" d="m5.6 5.6 12.8 12.8"/></symbol>
    <symbol id="hi-broom" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" opacity="0.2" d="m8 11 5 5-3 4.5L4.5 16z"/><path fill="none" stroke="currentColor" d="M16 3 9 10M8 11l5 5-3 4.5L4.5 16zM7 13.5l4 3M9.5 11.5l4 3"/></symbol>
    <symbol id="hi-chair" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M7 3v9h9V5a2 2 0 0 0-2-2zM7 12l-1.5 8M16 12l1.5 8M5.5 16h13"/><path fill="#3AAABB" stroke="none" opacity="0.14" d="M8 4h6v7H8z"/></symbol>
    <symbol id="hi-luggage" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M7 8h10v11H7z"/><rect x="6" y="7" width="12" height="13" rx="2" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M10 11v5M14 11v5"/></symbol>
    <symbol id="hi-phone" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.14" d="M5 5h3l1.3 3.4-2 1.5a12 12 0 0 0 6.3 6.3l1.5-2L18.5 19v.5C11 20 4.5 13.5 5 5z"/><path fill="none" stroke="currentColor" d="M5 4h3.2l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3.3a1.5 1.5 0 0 1-1.7 1.5C11.5 23.5 3.6 15.6 3.5 6.2A1.5 1.5 0 0 1 5 4z"/></symbol>
    <symbol id="hi-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor"/><path fill="#3AAABB" stroke="none" opacity="0.12" d="M4 6h16l-8 6z"/><path fill="none" stroke="#3AAABB" d="m4 7 8 6 8-6"/></symbol>
    <symbol id="hi-handshake" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.12" d="M3 9h6l3 2 3-2h6v5l-3 2-3-2-3 2-3-2-3-1z"/><path fill="none" stroke="currentColor" d="M3 8.5h4.5L10 10.5M21 8.5h-4.5L14 10.5M12 11l-1.6 1.4a1.4 1.4 0 0 0 1.9 2l.7-.6.7.6a1.4 1.4 0 0 0 1.9-2L16 11M3 8.5V14l3 2 2.3-1.6M21 8.5V14l-3 2-2.3-1.6"/></symbol>
    <symbol id="hi-refresh" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M20 11a8 8 0 0 0-13.7-5L4 8M4 3.5V8h4.5"/><path fill="none" stroke="#3AAABB" d="M4 13a8 8 0 0 0 13.7 5L20 16M20 20.5V16h-4.5"/></symbol>
    <symbol id="hi-bulb" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" opacity="0.2" d="M9 14a5 5 0 1 1 6 0l-.6 2h-4.8z"/><path fill="none" stroke="currentColor" d="M9 14.5a5 5 0 1 1 6 0l-.6 2.5h-4.8zM9.7 19.5h4.6M10.7 22h2.6"/></symbol>
    <symbol id="hi-star-rate" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 4l2.3 4.9 5.2.7-3.8 3.6 1 5.3L12 16.4 7.3 18.5l1-5.3L4.5 9.6l5.2-.7z"/></symbol>
    <symbol id="hi-clip" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M19 10.5 11 18.5a4.2 4.2 0 0 1-6-6l8.2-8.2a2.7 2.7 0 0 1 3.8 3.8l-8.1 8.1a1.3 1.3 0 0 1-1.8-1.8l7.2-7.2"/></symbol>
    <symbol id="hi-hourglass" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.3" d="M9 5.5h6c0 2.5-1.3 3.6-3 5-1.7-1.4-3-2.5-3-5z"/><path fill="none" stroke="currentColor" d="M6.5 3h11M6.5 21h11M8 3c0 4.2 2 5.2 4 7.2M16 3c0 4.2-2 5.2-4 7.2M8 21c0-4.2 2-5.2 4-7.2M16 21c0-4.2-2-5.2-4-7.2"/></symbol>
    <symbol id="hi-trash" viewBox="0 0 24 24"><path fill="#B8246E" stroke="none" opacity="0.12" d="M6 6h12l-1 14H7z"/><path fill="none" stroke="currentColor" d="M4 6h16M9.5 6V3.8h5V6M6.5 6l1 14h9l1-14M10 10v6M14 10v6"/></symbol>
    <symbol id="hi-upload" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.16" d="M7 8.5 12 3.5l5 5z"/><path fill="none" stroke="currentColor" d="M12 15.5V4M7 8.5l5-5 5 5M5 20h14"/></symbol>
    <symbol id="hi-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"/><path fill="none" stroke="#6B7A3A" d="m7.8 12.4 2.7 2.7L16.2 9"/></symbol>
    <symbol id="hi-camera" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" d="M8.5 7 10 4.5h4L15.5 7"/><circle cx="12" cy="13.5" r="3.4" fill="none" stroke="#3AAABB"/></symbol>
    <symbol id="hi-cloud" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></symbol>
    <symbol id="hi-moon" viewBox="0 0 24 24"><path fill="#D4A84A" stroke="none" opacity="0.16" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path fill="none" stroke="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></symbol>
    <symbol id="hi-thermo" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M12 4a2 2 0 0 1 2 2v8.5a4 4 0 1 1-4 0V6a2 2 0 0 1 2-2z"/><path fill="none" stroke="#B86A3C" d="M12 8v6"/><circle fill="#B86A3C" stroke="none" cx="12" cy="17" r="2.2"/></symbol>
    <symbol id="hi-drop" viewBox="0 0 24 24"><path fill="#3AAABB" stroke="none" opacity="0.18" d="M12 3.5c3 3.8 6 7.4 6 10.8a6 6 0 1 1-12 0c0-3.4 3-7 6-10.8z"/><path fill="none" stroke="currentColor" d="M12 3.5c3 3.8 6 7.4 6 10.8a6 6 0 1 1-12 0c0-3.4 3-7 6-10.8z"/></symbol>
    <symbol id="hi-wind" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" d="M3 8h10.2a2.4 2.4 0 1 0-2-3.7"/><path fill="none" stroke="currentColor" d="M3 13h13.8a2.4 2.4 0 1 1-2 3.7"/><path fill="none" stroke="#3AAABB" d="M3 18h7.8a2 2 0 1 0-1.7-2.9"/></symbol>
  </svg>
)
// Mapa de ventajas de reserva directa (por id, independiente del idioma) a icono propio.
const PERK_HI = { precio: 'tag', comision: 'ban', respuesta: 'clock', cancel: 'unlock', pago: 'card', descuento: 'gift', guia: 'key', mascotas: 'paw', aliados: 'handshake', proceso: 'doc' };
const HiIcon = ({ name, size = 24, className = '', style, title }) => (
  <svg className={`hi${className ? ' ' + className : ''}`} width={size} height={size}
       role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} style={style}>
    {title ? <title>{title}</title> : null}
    <use href={`#hi-${name}`} />
  </svg>
);

// Mapa global emoji→icono de marca para textos sueltos de páginas (tarjetas,
// canales de contacto, listas de ventajas). Clave normalizada sin variation
// selector. Para los textos largos de la guía hay un mapa propio (iconifyText).
const BRAND_EMOJI_HI = {
  '📍': 'pin', '📅': 'cal', '🤝': 'handshake', '⏱': 'clock', '🏠': 'home', '🏡': 'home',
  '📶': 'wifi', '✉': 'mail', '💬': 'chat', '📞': 'phone', '⚠': 'alert', '🌿': 'olive',
  '🔄': 'refresh', '💻': 'laptop', '🏢': 'buildings', '🌊': 'wave', '⭐': 'star-fill',
  '🔒': 'lock', '💼': 'briefcase', '🐾': 'paw', '👶': 'baby', '🎁': 'gift', '⚡': 'spark',
  '📣': 'megaphone', '📲': 'chat', '💶': 'euro', '💳': 'card', '🗓': 'cal', '✦': 'spark',
  '💡': 'bulb', '⏰': 'clock', '🕒': 'clock', '📰': 'news', '✨': 'sun', '🎬': 'film',
  '📤': 'upload', '📎': 'clip', '🔔': 'bell', '🔑': 'key', '📋': 'clipboard', '⏳': 'hourglass',
  '🗑': 'trash', '✅': 'check', '📄': 'doc', '🧾': 'receipt', '📊': 'chart', '📈': 'chart',
  '📷': 'camera', '⏱': 'clock', '🧳': 'luggage', '✈': 'plane', '🚌': 'bus', '🚆': 'train',
  '🚗': 'car', '🚶': 'walk', '🏘': 'buildings', '🍷': 'wine', '🐟': 'fish', '🦩': 'salt',
  '✓': 'check', '✗': 'ban',
};
const emojiHi = (emoji) => BRAND_EMOJI_HI[(emoji || '').replace(/️/g, '')];
// Render: icono de marca si el emoji está mapeado; si no, el emoji tal cual.
const EmojiIcon = ({ emoji, size = 20, className, style }) => {
  const name = emojiHi(emoji);
  return name ? <HiIcon name={name} size={size} className={className} style={style} /> : (emoji || null);
};

// Precio que "cuenta" hasta su valor al revelarse o cambiar (momento de confianza
// en la reserva). El valor crudo se anima con easeOutCubic; se formatea con `format`.
// Respeta prefers-reduced-motion (salta al valor final). Arranca al 92% para dar un
// tick satisfactorio en la primera aparición sin llegar a parpadear un "0 €".
const AnimatedPrice = ({ value, format, className, duration = 560 }) => {
  const to = Math.round(value) || 0;
  const [display, setDisplay] = React.useState(() => Math.round(to * 0.92));
  const dispRef = React.useRef(display);
  const rafRef = React.useRef(0);
  React.useEffect(() => {
    const prm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = dispRef.current;
    if (prm) { dispRef.current = to; setDisplay(to); return; }
    if (from === to) return;
    const ease = t => 1 - Math.pow(1 - t, 3);
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const v = Math.round(from + (to - from) * ease(p));
      dispRef.current = v; setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, duration]);
  return <span className={className}>{format ? format(display) : display}</span>;
};

// ── Blur-up de fotos: placeholder difuminado (LQIP) que se enfoca al cargar ──
// El mapa data/lqip.json se carga una vez y queda en window.LQIP_MAP. BlurImg
// pinta el LQIP de fondo del contenedor y funde la foto real cuando termina de
// cargar: se acaba el "pop" de blanco a foto en móvil. Respeta reduced-motion.
if (typeof window !== 'undefined' && !window.__LQIP_FETCHED) {
  window.__LQIP_FETCHED = true;
  window.LQIP_MAP = window.LQIP_MAP || {};
  fetch('data/lqip.json', { cache: 'force-cache' })
    .then(r => (r.ok ? r.json() : {}))
    .then(m => { window.LQIP_MAP = m; document.dispatchEvent(new CustomEvent('lqip-ready')); })
    .catch(() => {});
}
const lqipFor = (src) => {
  if (!src) return null;
  const m = window.LQIP_MAP || {};
  return m[src] || m[src.split('?')[0]] || null;
};
const BlurImg = ({ src, webp = true, alt = '', className = '', imgClassName = '', imgStyle, loading, onError, fill = false, ...rest }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [, force] = React.useReducer(x => x + 1, 0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && ref.current.complete && ref.current.naturalWidth) setLoaded(true);
  }, [src]);
  React.useEffect(() => {
    if (lqipFor(src)) return;                 // ya tenemos placeholder
    const h = () => force();                  // re-render cuando llegue el mapa
    document.addEventListener('lqip-ready', h, { once: true });
    return () => document.removeEventListener('lqip-ready', h);
  }, [src]);
  const ph = lqipFor(src);
  return (
    <span className={`blur-img${fill ? ' blur-img-fill' : ''}${loaded ? ' is-loaded' : ''}${ph ? ' has-ph' : ''}${className ? ' ' + className : ''}`}
          style={ph ? { backgroundImage: `url("${ph}")` } : undefined}>
      <picture>
        {webp && <source srcSet={src.replace(/\.(jpe?g|png)(\?.*)?$/i, '.webp$2')} type="image/webp" />}
        <img ref={ref} decoding="async" src={src} alt={alt}
             className={imgClassName || undefined} loading={loading} onError={onError}
             onLoad={() => setLoaded(true)} style={imgStyle} {...rest} />
      </picture>
    </span>
  );
};

const WatermarkBadge = ({ size = 34, pos = {} }) => (
  <div className="wm-badge" aria-hidden="true" style={{ bottom: 10, right: 10, ...pos }}>
    <img decoding="async" src="assets/logo-teal-transparent.png" alt="" width={size} height={size}
         style={{ display: 'block', opacity: 0.50, filter: 'brightness(0) invert(1)' }}/>
  </div>
);

// Indalo de marca en una sola tinta (sin oro), pensado para usarse como
// marca de agua tenue en fondos oscuros o como pieza animada (loader).
const IndaloShape = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M4.5 13C4.5 5.5 19.5 5.5 19.5 13"/>
    <path d="M12 6.8V15"/>
    <path d="M12 11 4.5 13M12 11 19.5 13"/>
    <path d="M12 15l-3.2 5M12 15l3.2 5"/>
  </svg>
);
// Marca de agua: Indalo grande y muy tenue para texturizar fondos oscuros.
const IndaloWatermark = ({ className = '', style }) => (
  <IndaloShape className={`indalo-wm ${className}`} style={style} />
);
// Loader de marca: el Indalo se dibuja solo (animación de trazo).
const IndaloLoader = ({ size = 40, label, className = '' }) => (
  <div className={`indalo-loader ${className}`} role="status" aria-live="polite">
    <IndaloShape className="indalo-loader-mark" width={size} height={size} />
    {label ? <span className="indalo-loader-label">{label}</span> : null}
  </div>
);

const Wordmark = ({ size = 14, color }) => (
  <div style={{ textAlign: 'center', color }}>
    <div className="wordmark" style={{ fontSize: size }}>HESTÍA</div>
    <div className="your-home" style={{ fontSize: size * 0.62, marginTop: 2 }}>your home!</div>
  </div>
);

// Copy diccionario ES/EN
const COPY = {
  es: {
    nav: ['Inicio', 'Hestía Mar', 'Hestía Thalassa', 'Hestía Salinas', 'Hestía y nosotros', 'Vuestras opiniones', 'Contacto', 'Blog y noticias', '¿Por qué Hestía?', 'Estancias largas'],
    cta_nav: 'Reserva',
    mn_ventajas: 'Ventajas de reserva directa',
    hero_title_1: 'Bienvenido a tu hogar',
    hero_title_2: 'lejos de casa.',
    hero_sub: 'Vera Playa · Almería · desde 2016',
    hero_cta_1: 'Descubre cada Hestía',
    hero_cta_avail: 'Comprobar disponibilidad',
    hero_cta_nosotros: 'Sobre nosotros y Hestía',
    hero_cta_2: 'Escríbenos',
    scroll_hint: 'Desliza para despertar',
    hero_meta_right: 'Noche mediterránea, 36.96° N, 1.83° W',
    bridge_title: '…y amanece sobre Vera Playa.',
    bridge_sub: 'La noche morada se retira despacio. El alba trae el albero: tierra, pared encalada, sal seca. A las siete, el Mediterráneo abre el ojo en teal y los olivos reciben la luz de costado. Al fondo, el Desierto de Tabernas ya es naranja.',
    apts_eyebrow: 'Nuestros tres Hestías',
    apts_title: (<>Tres atmósferas, <em>una misma casa.</em></>),
    apts_sub: 'Cada uno toma su color del paisaje que lo rodea. Tres hogares: elige el tuyo, o ven tres veces.',
    apts_pets: 'Mascotas bienvenidas en los tres, con petición previa.',
    apt_01_concept: 'El campo de olivos llega al mar',
    apt_02_concept: 'El ático sobre el Mediterráneo y el Salar de los Canos',
    apt_03_concept: 'El amarillo albero del amanecer, cerca de las salinas',
    apt_cta: 'Ver Hestía',
    compare_eyebrow: 'Compara · Elige · Reserva',
    compare_title: (<>Tres puertas distintas al <em>mismo Mediterráneo.</em></>),
    counters_eyebrow: 'Diez años · una playa · vuestra casa',
    days_unit: 'días',
    counter_1: 'familias han vivido aquí desde 2016',
    counter_2: 'de sol al año en Vera Playa',
    counter_3: 'Hestías gestionados en persona por Alex y Fran',
    gallery_eyebrow: 'Postales desde Vera',
    gallery_title: (<>La luz de Almería <em>cuenta la historia.</em></>),
    team_eyebrow: 'Quienes os reciben',
    team_title: (<>No somos una recepción. <em>Somos Alex y Fran.</em></>),
    team_intro: 'En 2016 nacieron los tres, el nombre lo tomamos de la diosa griega del hogar. Diez años después seguimos limpiando, recibiendo, respondiendo WhatsApp y eligiendo las toallas. Todo lo hacemos nosotros, por eso todo importa.',
    alex_role: 'Reserva · Antes de tu llegada',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, seguiremos en contacto si tú quieres…»',
    fran_role: 'Estancia · Mientras estás aquí',
    fran_quote: '«Si algo falla, cambia o necesita atención, estoy aquí. Tu estancia, mi trabajo.»',
    manifest_eyebrow: 'El viajero que hace hogar',
    manifest_title: (<>Hestía no se visita, <em>se vive, y se cuida para quien venga después.</em></>),
    manifest_lead_1: 'No vienes a hacer turismo. Vienes a cocinar tu desayuno, a leer en la terraza, a seguir tu ritmo. Esto no es un hotel: durante tu estancia, es tu casa.',
    manifest_lead_2: 'Y porque es tu casa, te pedimos lo que se le pide a quien quiere su hogar: que lo cuides. Que lo dejes listo. Para quien venga detrás, será su casa entonces, igual que es la tuya ahora.',
    manifest_principles_eyebrow: 'Cuatro maneras de cuidar lo que es tuyo por unos días',
    manifest_p1: 'Agradecemos que repongas lo que uses.',
    manifest_p2: 'Si algo se estropea, nos gustaría saberlo.',
    manifest_p3: 'Intenta cuidarlo como si fuera tu propio hogar.',
    manifest_p4: 'Nosotros también ponemos todo de nuestra parte.',
    manifest_quote: '«Deja esto como te hubiera gustado encontrarlo. Alguien antes que tú también lo hizo.»',
    ratings_eyebrow: 'Lo que dicen de nosotros',
    ratings_title: (<>Diez años puntuando <em>casi perfecto.</em></>),
    ratings_sub: 'No es un eslogan. Son cifras verificadas por las plataformas, escritas por las familias que han dormido aquí.',
    rating_booking_desc: 'Valoración Booking.com, promedio de los tres.',
    rating_airbnb_desc: 'Superhost desde 2018. Puntuación máxima ininterrumpida.',
    rating_google_desc: 'Google Maps, opiniones de huéspedes que volvieron a Vera.',
    contact_eyebrow: 'Reserva directa, sin intermediarios',
    contact_title: (<>Escríbenos. Te responde <em>una persona.</em></>),
    contact_sub: 'Alex en español, Fran en inglés. WhatsApp, teléfono o email: sin formularios eternos, sin bots, sin comisiones.',
    contact_cta_wa: 'WhatsApp Alex (ES)',
    contact_cta_wa_href: 'https://wa.me/34620316370',
    contact_cta_mail: 'info@hestiayourhome.com',
    contact_cta_avail: 'Comprobar disponibilidad',
    footer_apts: 'Hestías',
    footer_hestia: 'Hestía',
    footer_contacto: 'Contacto',
    footer_tag: 'Tu hogar en Vera Playa, desde 2016.',
  },
  en: {
    nav: ['Home', 'Hestía Mar', 'Hestía Thalassa', 'Hestía Salinas', 'Hestía & us', 'Your reviews', 'Contact', 'Blog & news', 'Why Hestía', 'Long stays'],
    cta_nav: 'Book',
    mn_ventajas: 'Direct booking perks',
    hero_title_1: 'Welcome to your home',
    hero_title_2: 'away from home.',
    hero_sub: 'Vera Playa · Almería · since 2016',
    hero_cta_1: 'Discover the Hestías',
    hero_cta_avail: 'Check availability',
    hero_cta_nosotros: 'About us & Hestía',
    hero_cta_2: 'Say hello',
    scroll_hint: 'Scroll to wake up',
    hero_meta_right: 'Mediterranean night, 36.96° N, 1.83° W',
    bridge_title: '…and morning breaks over Vera Playa.',
    bridge_sub: 'The purple night slowly withdraws. Dawn brings the ochre: earth, whitewashed wall, dried salt. By seven, the Mediterranean opens its eye in teal, the olive trees catch the side-light. In the distance, the Tabernas Desert is already orange.',
    apts_eyebrow: 'Our three Hestías',
    apts_title: (<>Three moods, <em>one same home.</em></>),
    apts_sub: 'Each one borrows its colour from the landscape around it. Three homes: choose yours, or come three times.',
    apts_pets: 'Pets welcome in all three, on request.',
    apt_01_concept: 'Where the olive grove meets the sea',
    apt_02_concept: 'Penthouse above the Mediterranean and the Salar de los Canos',
    apt_03_concept: 'Ochre yellow, sunrise near the salt flats',
    apt_cta: 'See Hestía',
    compare_eyebrow: 'Compare · Choose · Book',
    compare_title: (<>Three doors onto the <em>same Mediterranean.</em></>),
    counters_eyebrow: 'Ten years · one beach · your home',
    days_unit: 'days',
    counter_1: 'families have lived here since 2016',
    counter_2: 'of sunshine a year in Vera Playa',
    counter_3: 'Hestías run in person by Alex & Fran',
    gallery_eyebrow: 'Postcards from Vera',
    gallery_title: (<>Almería's light <em>tells the story.</em></>),
    team_eyebrow: 'The hosts',
    team_title: (<>Not a front desk. <em>Just Alex & Fran.</em></>),
    team_intro: 'In 2016 the three Hestías opened, we took the name from the Greek goddess of home. Ten years later we still clean, welcome, reply WhatsApp and choose the towels. We do everything ourselves, that is why it all matters.',
    alex_role: 'Booking · Before you arrive',
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, we will stay in touch if you like…»',
    fran_role: 'Stay · While you are here',
    fran_quote: '«If anything breaks, calls, or changes, I am here. Your stay, my job.»',
    manifest_eyebrow: 'The traveler who makes a home',
    manifest_title: (<>Hestía isn’t visited. <em>It’s lived in: and cared for, for whoever comes next.</em></>),
    manifest_lead_1: 'You’re not here as a tourist. You’re here to cook your breakfast, read on the terrace, keep your own rhythm. This isn’t a hotel: while you stay, it’s your home.',
    manifest_lead_2: 'And because it’s your home, we ask the same thing one asks of anyone who loves their home: care for it. Leave it ready. For whoever comes next, it will be their home then, just as it’s yours now.',
    manifest_principles_eyebrow: 'Four ways to care for what is yours for a few days',
    manifest_p1: 'We appreciate you replacing what you use.',
    manifest_p2: 'If something breaks, we\'d love to know.',
    manifest_p3: 'Try to care for it as if it were your own home.',
    manifest_p4: 'And we always do our part too.',
    manifest_quote: '«Leave this as you would have liked to find it. Because someone, before you, did.»',
    ratings_eyebrow: 'What they say about us',
    ratings_title: (<>Ten years scoring <em>almost perfect.</em></>),
    ratings_sub: 'Not a slogan. Verified numbers from the platforms, written by the families who slept here.',
    rating_booking_desc: 'Booking.com average, across our three Hestías.',
    rating_airbnb_desc: 'Superhost since 2018. Top score, uninterrupted.',
    rating_google_desc: 'Google Maps, reviews from guests who came back to Vera.',
    contact_eyebrow: 'Direct booking, no middlemen',
    contact_title: (<>Write to us. A <em>real person</em> replies.</>),
    contact_sub: 'Alex in Spanish, Fran in English. WhatsApp, phone or email: no endless forms, no bots, no commissions.',
    contact_cta_wa: 'WhatsApp Fran (EN)',
    contact_cta_wa_href: 'https://wa.me/34654138251',
    contact_cta_mail: 'info@hestiayourhome.com',
    contact_cta_avail: 'Check availability',
    footer_apts: 'Hestías',
    footer_hestia: 'Hestía',
    footer_contacto: 'Contact',
    footer_tag: 'Your home in Vera Playa, since 2016.',
  }
};

// Hooks compartidos, disponibles en todas las páginas
const useScrollMode = () => {
  const [mode, setMode] = React.useState('night');
  const [scrolled, setScrolled] = React.useState(false);

  // Keep --topbar-h, --header-h, --chrome-h in sync with real rendered heights
  React.useEffect(() => {
    const sync = () => {
      const root = document.documentElement;
      const tb = document.querySelector('.topbar');
      const hd = document.querySelector('.header');
      const tbH = tb ? tb.offsetHeight : 36;
      const hdH = hd ? hd.offsetHeight : 80;
      root.style.setProperty('--topbar-h', tbH + 'px');
      root.style.setProperty('--header-h', hdH + 'px');
      root.style.setProperty('--chrome-h', (tbH + hdH) + 'px');
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      setScrolled(y > 40);
      if (y < h * 0.85) setMode('night');
      else setMode('day');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return { mode, scrolled };
};

const useReveal = () => {
  React.useEffect(() => {
    // Marcar automáticamente las secciones con fondo corporativo para la
    // animación de entrada (border-radius + blur). Se excluyen heros y
    // secciones que ya están en el viewport al cargar (first-child visible).
    const BG_CLASSES = ['section-night','section-dark','section-violet','section-day','section-cream'];
    document.querySelectorAll(BG_CLASSES.map(c => `.${c}`).join(',')).forEach(el => {
      if (!el.classList.contains('reveal-section') && !el.closest('.hero, .apt-page-hero, .page-hero')) {
        el.classList.add('reveal-section');
      }
    });

    const SELECTOR = '.reveal:not(.in), .reveal-section:not(.in)';
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
    const observe = (node) => {
      if (!(node instanceof Element)) return;
      const isReveal = node.classList && (node.classList.contains('reveal') || node.classList.contains('reveal-section')) && !node.classList.contains('in');
      if (isReveal) io.observe(node);
      node.querySelectorAll && node.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
    };
    const mo = new MutationObserver((mutations) => {
      mutations.forEach(m => m.addedNodes.forEach(observe));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
};

const BRIDGE_PALETTE = [
  { hex: '#2A0F2E', es: 'Noche · berenjena',   en: 'Night · aubergine' },
  { hex: '#7B3B6B', es: 'Alba · violeta',       en: 'Dawn · violet' },
  { hex: '#1BC8D8', es: 'Mar · turquesa',       en: 'Sea · turquoise' },
  { hex: '#6B7A3A', es: 'Olivos · verde',       en: 'Olives · green' },
  { hex: '#D42B80', es: 'Buganvilla · fucsia',  en: 'Bougainvillea · fuchsia' },
  { hex: '#C8975A', es: 'Día · albero',         en: 'Day · ochre' },
  { hex: '#D4A84A', es: 'Tarde · sol',          en: 'Afternoon · sun' },
  { hex: '#8B4A1E', es: 'Crepúsculo · siena',  en: 'Dusk · sienna' },
  { hex: '#F0E8D5', es: 'Calima · arena',       en: 'Calima · sand' },
];

const QUICK_FAQ = {
  home: {
    es: [
      { q: '¿Cómo reservo directamente?',
        a: <>Escríbenos por <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. Sin intermediarios, sin comisiones. O usa el formulario en <a href="reservas.html">nuestra página de reservas</a>.</> },
      { q: '¿Puedo llevar a mi perro?',
        a: <>Sí, en los tres. Las mascotas son bienvenidas siempre bajo petición previa y con suplemento, respetando unas condiciones básicas dentro de Hestía, en las zonas comunes y en los espacios públicos. Avísanos al reservar.</> },
      { q: '¿Qué Hestía me conviene más?',
        a: <>Compara los tres en <a href="/">nuestra home</a>. <a href="mar.html">Mar</a> es planta primera con jardín, terraza de amanecer y mascotas. <a href="thalassa.html">Thalassa</a> es el ático con SPA comunitario y vistas panorámicas al mar. <a href="salinas.html">Salinas</a> tiene tres piscinas y el Parque Natural a un paseo corto.</> },
      { q: '¿Quiénes sois Alex y Fran?',
        a: <><a href="nosotros.html">Somos los propietarios</a>, no una agencia. Gestionamos los tres en persona desde 2016. Más de 630 familias nos avalan.</> },
    ],
    en: [
      { q: 'How do I book directly?',
        a: <>Write to us via <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. No middlemen, no commissions. Or use the form on <a href="reservas.html">our reservations page</a>.</> },
      { q: 'Can I bring my dog?',
        a: <>Yes, in all three Hestías. Pets are welcome on request and with a supplement, as long as basic conditions are respected inside the Hestía, in the communal areas and in public spaces. Just let us know when booking.</> },
      { q: 'Which Hestía suits me best?',
        a: <>Compare all three on <a href="/">our home page</a>. <a href="mar.html">Mar</a> is first floor with garden, sunrise terrace and pets. <a href="thalassa.html">Thalassa</a> is the penthouse with shared SPA and panoramic sea views. <a href="salinas.html">Salinas</a> has three pools and the Nature Park a short walk away.</> },
      { q: 'Who are Alex and Fran?',
        a: <><a href="nosotros.html">We are the owners</a>, not an agency. We have run the three Hestías in person since 2016. Over 630 families back us.</> },
    ],
  },
  vm: {
    es: [
      { q: '¿Por qué elegiría Hestía Mar sobre los otros dos?',
        a: <>Mar es planta primera, con acceso al jardín y a la piscina comunitaria. Al ser de esquina da a tres calles distintas: hacia el mar, hacia los lados y hacia la zona de entrada, lo que permite ventilación cruzada natural en todas las estancias. La terraza de 20m² está orientada al amanecer, pero desde ella ves el ciclo solar completo. El más cercano a la playa de los tres.</> },
      { q: '¿Puedo traer a mi perro (o gato)?',
        a: <>Sí, las mascotas son bienvenidas en los tres, siempre bajo petición previa y con suplemento. Solo pedimos que se respeten unas condiciones básicas y sensatas: dentro de Hestía, en las zonas comunes de la urbanización y en los espacios públicos. Avísanos al reservar.</> },
      { q: '¿El jacuzzi está disponible durante mi estancia?',
        a: <>El jacuzzi es comunitario y está abierto durante la temporada de verano, igual que la piscina. Si tienes dudas sobre tus fechas concretas, pregúntanos antes de reservar.</> },
      { q: '¿A qué distancia está la playa?',
        a: <>Unos 300 metros a pie desde la salida de la urbanización, cinco minutos máximo hasta pisar la arena. La playa de Vera Playa es larga, tranquila y de arena fina.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Mar over the other two?',
        a: <>Mar is on the first floor, with access to the garden and shared pool. As a corner unit facing three different streets: sea side, lateral and entrance, it has natural cross-ventilation throughout. The 20m² terrace faces the sunrise, but from it you can follow the entire arc of the sun. The closest to the beach of the three.</> },
      { q: 'Can I bring my dog (or cat)?',
        a: <>Yes, pets are welcome in all three Hestías, always on request and with a supplement. We simply ask that basic conditions are respected: inside the Hestía, in the communal areas of the complex, and in public spaces. Let us know when booking.</> },
      { q: 'Is the jacuzzi available during my stay?',
        a: <>The jacuzzi is a shared facility, open during the summer season, just like the pool. If you have doubts about your specific dates, ask us before booking.</> },
      { q: 'How far is the beach?',
        a: <>About 300 metres on foot from the complex exit, five minutes at most to reach the sand. Vera Playa beach is long, quiet and fine-sand.</> },
    ],
  },
  vt: {
    es: [
      { q: '¿Por qué elegiría Hestía Thalassa sobre los otros dos?',
        a: <>Thalassa es el ático, el piso más alto de la urbanización. La terraza panorámica tiene vistas al Mediterráneo y al Salar de los Canos, el paisaje más abierto y luminoso de los tres. Además, la urbanización cuenta con SPA comunitario (con sauna), piscina y pistas de pádel.</> },
      { q: '¿Cómo funciona el SPA de la urbanización?',
        a: <>El SPA es comunitario y está abierto en otoño, invierno y primavera. En verano permanece cerrado, aunque el gimnasio permanece abierto todo el año. El SPA también dispone de sauna.</> },
      { q: '¿Qué vistas tiene la terraza del ático?',
        a: <>Desde la terraza panorámica ves el Mediterráneo y, hacia el interior, el Salar de los Canos, un paisaje árido y de gran belleza. La zona tiene una luz y una aridez espectaculares. El Desierto de Tabernas propiamente dicho está a unos 30 minutos en coche.</> },
      { q: '¿Puedo traer mascotas?',
        a: <>Sí, en los tres. Siempre bajo petición previa y con un pequeño suplemento. Solo pedimos que se respeten unas normas básicas y sensatas: que no suban a sofás, sillones ni camas, y que no hagan sus necesidades en zonas comunes ni dentro de Hestía.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Thalassa over the other two?',
        a: <>Thalassa is the penthouse, the highest floor in the complex. The panoramic terrace looks out over the Mediterranean and the Salar de los Canos: the most open and light-filled view of the three. The complex also has a shared SPA (with sauna), pool and padel courts.</> },
      { q: 'How does the shared SPA work?',
        a: <>The SPA is a communal facility, open in autumn, winter and spring. It closes during the summer, although the gym stays open all year round. There is also a sauna.</> },
      { q: 'What can you see from the penthouse terrace?',
        a: <>From the panoramic terrace you look out over the Mediterranean and, inland, the Salar de los Canos: an arid, strikingly beautiful landscape. The area is dramatic and dry. The Tabernas Desert proper is about 30 minutes by car.</> },
      { q: 'Can I bring pets?',
        a: <>Yes, in all three Hestías. Always on request and with a small supplement. We just ask that basic rules are respected: pets should not get on sofas, armchairs or beds, and must not relieve themselves inside the Hestía or in communal areas.</> },
    ],
  },
  vs: {
    es: [
      { q: '¿Por qué elegiría Hestía Salinas sobre los otros dos?',
        a: <>Salinas es el más espacioso de los tres. Dos terrazas, tres piscinas, gimnasio, sauna y pistas de pádel comunitarios, y el Parque Natural de las Salinas de Puerto Rey a un paseo corto. La luz dorada de Almería llena cada habitación, con la naturaleza siempre cerca.</> },
      { q: '¿Qué son las Salinas de Puerto Rey?',
        a: <>Un Parque Natural cercano, a un paseo corto, con flamencos, aves migratorias y una luz dorada al amanecer única en Europa. Una de las razones por las que Salinas tiene algo que los demás no tienen.</> },
      { q: '¿Hay de verdad tres piscinas?',
        a: <>Sí. La urbanización tiene tres piscinas comunitarias: no una sola dividida, sino tres zonas diferenciadas con orientaciones distintas. Además hay gimnasio y sauna comunitarios (el gimnasio abierto todo el año; la sauna, solo fuera de temporada de verano) y pistas de pádel. Una de las urbanizaciones mejor equipadas de Vera Playa.</> },
      { q: '¿Puedo traer mascotas?',
        a: <>Sí, en los tres. Siempre bajo petición previa y con suplemento, respetando unas condiciones básicas dentro de Hestía, en las zonas comunes y en los espacios públicos.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Salinas over the other two?',
        a: <>Salinas is the most spacious of the three. Two terraces, three pools, a communal gym, sauna and padel courts, and the Puerto Rey Salt-flat Nature Park a short walk away. Almería's golden afternoon light fills every room, with nature always close by.</> },
      { q: 'What is the Puerto Rey Nature Park?',
        a: <>A nearby natural park, a short walk away, with flamingos, migratory birds and a golden light at sunrise unique in Europe. One of the reasons Salinas has something the others don't.</> },
      { q: 'Are there really three pools?',
        a: <>Yes. The complex has three community pools: not one divided, but three separate areas with different orientations. There is also a communal gym and sauna (gym open all year; sauna closed in summer) and padel courts. One of the best-equipped complexes in Vera Playa.</> },
      { q: 'Can I bring pets?',
        a: <>Yes, in all three Hestías. Always on request and with a supplement, as long as basic conditions are respected inside the Hestía, in the communal areas and in public spaces.</> },
    ],
  },
  nosotros: {
    es: [
      { q: '¿Desde cuándo lo hacéis vosotros mismos?',
        a: <>Desde 2016. En diez años hemos recibido a más de 630 familias. Nunca hemos externalizado la gestión: nosotros gestionamos, nosotros cuidamos.</> },
      { q: '¿Por qué se llaman así cada Hestía?',
        a: <>Hestía era la diosa griega del hogar: la diosa pacífica, la que guardaba el fuego de casa. Eso es lo que intentamos hacer: que Hestía deje de ser un sitio donde dormir y se convierta en un lugar donde quedarse.</> },
      { q: '¿Hay alguna agencia o gestor detrás?',
        a: <>No. Somos Alex y Fran. No hay agencia, no hay gestor, no hay centralita. Cuando nos escribes, nos escribes a nosotros directamente.</> },
      { q: '¿Qué pasa si algo falla durante mi estancia?',
        a: <>Fran se encarga de tu estancia, está pendiente de ti, de vosotros. Responde rápido y resuelve con la mayor celeridad y eficacia posibles.</> },
    ],
    en: [
      { q: 'How long have you been managing the Hestías yourselves?',
        a: <>Since 2016. In ten years we have hosted over 630 families. We have never outsourced management: we still clean, reply and choose the towels ourselves. <a href="nosotros.html">Read our story.</a></> },
      { q: "Why are they called Hestía?",
        a: <>Hestía was the Greek goddess of the hearth: the peaceful goddess, guardian of the home fire. That is what we try to do: turn a Hestía from a place to sleep into a place you want to stay.</> },
      { q: 'Is there an agency or property manager behind you?',
        a: <>No. We are Alex and Fran. No agency, no manager, no call centre. When you write to us, you are writing to us directly.</> },
      { q: 'What happens if something goes wrong during my stay?',
        a: <>Fran handles everything technical on-site. He is available, replies quickly and fixes things. No need to wait for an office to open. His number: <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp Fran</a>.</> },
    ],
  },
  opiniones: {
    es: [
      { q: '¿Estas valoraciones son reales y verificadas?',
        a: <>Sí. Las puntuaciones de Booking.com, Airbnb y Google Maps son verificadas por las propias plataformas, solo pueden valorar quienes han completado una estancia real. No podemos modificarlas.</> },
      { q: '¿Sois realmente Superhost en Airbnb?',
        a: <>Sí, desde 2018 de forma ininterrumpida. El estatus Superhost se revisa cada trimestre y requiere mantener puntuación máxima y tiempo de respuesta alto de forma continua. No es un título que se queda para siempre.</> },
      { q: '¿Qué es lo que más valoran los huéspedes?',
        a: <>La atención personal de Alex y Fran, la limpieza y el estado de cada Hestía. Y que cuando algo falla buscan soluciones en el momento.</> },
      { q: '¿Cómo dejo una reseña tras mi estancia?',
        a: <>En Booking.com, Airbnb o Google Maps, según donde hayas reservado. También puedes escribirnos directamente, nos alegra saber cómo fue la experiencia.</> },
    ],
    en: [
      { q: 'Are these ratings real and verified?',
        a: <>Yes. Scores on Booking.com, Airbnb and Google Maps are verified by the platforms themselves, only guests who have completed a real stay can leave a review. We cannot modify them.</> },
      { q: 'Are you really a Superhost on Airbnb?',
        a: <>Yes, continuously since 2018. Superhost status is reviewed every quarter and requires maintaining top scores and response times consistently. It is not a title that stays forever.</> },
      { q: 'What do guests value most?',
        a: <>The personal attention from Alex and Fran, cleanliness and condition of the Hestías, and location. And that when something goes wrong, it genuinely gets fixed, no excuses.</> },
      { q: 'How do I leave a review after my stay?',
        a: <>On Booking.com, Airbnb or Google Maps, depending on where you booked. You can also write to us directly, we love hearing how the experience went.</> },
    ],
  },
  reservas: {
    es: [
      { q: '¿Es mejor reservar directo que por Booking o Airbnb?',
        a: <>Sí: reservando directo no pagas las comisiones que cobran las plataformas, así que casi siempre sale más barato. A veces lanzan promociones que no controlamos; si ves un precio más bajo, tráenoslo: no solo te lo igualamos, te lo mejoramos. Sin intermediarios, hablando con los propietarios. <a href="reservas.html">Reserva aquí.</a></> },
      { q: '¿Y si veo un precio más barato en una plataforma?',
        a: <>Puede pasar en momentos puntuales: Booking o Airbnb lanzan sus propios descuentos y programas (ofertas de última hora, niveles de fidelidad, cupones…) que nosotros no controlamos, así que a veces su precio baja del que damos por defecto. No es que te cobremos de más: es su promoción, no nuestro precio real. Si te ocurre, escríbenos con el precio que ves: nos adaptamos y hacemos todo lo posible por mejorarlo.</> },
      { q: '¿Cuánto tardáis en confirmar la reserva?',
        a: <>Normalmente en minutos. Casi siempre respondemos el mismo día y, la mayoría de las veces, en cuestión de minutos.</> },
      { q: '¿Qué pasa si necesito cambiar las fechas?',
        a: <>Escríbenos. Somos flexibles con cambios y cancelaciones siempre que se puedan gestionar. No hay que batallar con ninguna plataforma, es una conversación entre personas.</> },
      { q: '¿Tenéis política de cancelación?',
        a: <>Sí. Te la explicamos al confirmar la reserva, según la temporada y las fechas. Si tienes dudas antes de reservar, pregúntanos sin compromiso.</> },
    ],
    en: [
      { q: 'Is it better to book directly than through Booking or Airbnb?',
        a: <>Yes: booking direct you skip the commissions platforms charge, so it's almost always cheaper. They sometimes run promos we don't control; if you find a lower price, bring it to us: we don't just match it, we beat it. No middlemen, straight with the owners. <a href="reservas.html">Book here.</a></> },
      { q: 'What if I see a cheaper price on a platform?',
        a: <>It can happen at certain moments: Booking or Airbnb run their own discounts and programs (last-minute deals, loyalty tiers, coupons…) that we don't control, so sometimes their price dips below our default one. It doesn't mean we're overcharging, it's their promotion, not our real price. If it happens, write to us with the price you see: we'll adapt and do everything we can to beat it.</> },
      { q: 'How long does confirmation take?',
        a: <>Usually within minutes. Almost always the same day and, most of the time, within minutes.</> },
      { q: 'What if I need to change my dates?',
        a: <>Write to us. We are flexible with changes and cancellations as long as they can be managed. No need to fight with a platform, it is a conversation between people.</> },
      { q: 'Do you have a cancellation policy?',
        a: <>Yes. We explain it when we confirm your booking, depending on the season and dates. If you have doubts before booking, just ask, no commitment.</> },
    ],
  },
};

const QuickFAQ = ({ lang, pageId = 'home' }) => {
  const page = QUICK_FAQ[pageId] || QUICK_FAQ.home;
  const faqs = page[lang];
  const [open, setOpen] = React.useState(null);
  return (
    <section className="quick-faq section-cream">
      <div className="container">
        <div className="eyebrow qfaq-eyebrow">
          {lang === 'es' ? 'Preguntas frecuentes' : 'Frequently asked questions'}
        </div>
        <div className="qfaq-grid">
          {faqs.map((f, i) => (
            <div key={i} className={`qfaq-item ${open === i ? 'open' : ''}`}>
              <button className="qfaq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <span className="qfaq-chevron">{open === i ? '−' : '+'}</span>
              </button>
              <div className="qfaq-a">{f.a}</div>
            </div>
          ))}
        </div>
        <div className="qfaq-more">
          <a href="contacto.html" className="btn btn-ghost-dark">
            {lang === 'es' ? 'Más preguntas →' : 'More questions →'}
          </a>
        </div>
      </div>
    </section>
  );
};

const SABIAS_QUE_FACTS = [
  /* ── Almería y Vera Playa ── */
  {
    type: 'fact',
    es: 'Almería recibe más de 3.000 horas de sol al año, casi el doble que la media europea.',
    en: 'Almería receives over 3,000 hours of sunshine a year, almost twice the European average.',
  },
  {
    type: 'fact',
    es: 'Almería tiene más días de sol al año que cualquier capital de Europa, incluidas Atenas y Lisboa.',
    en: 'Almería has more sunny days per year than any European capital, including Athens and Lisbon.',
  },
  {
    type: 'fact',
    es: '"Almería" viene del árabe Al-Mariyya, "el espejo del mar".',
    en: '"Almería" comes from the Arabic Al-Mariyya, meaning "the mirror of the sea".',
  },
  {
    type: 'fact',
    es: 'El Desierto de Tabernas, a 30 minutos de Vera Playa, es el único desierto auténtico de Europa occidental.',
    en: 'The Tabernas Desert, 30 minutes from Vera Playa, is the only true desert in Western Europe.',
  },
  {
    type: 'fact',
    es: 'Almería fue escenario de más de 400 producciones cinematográficas, incluyendo los westerns más icónicos de Sergio Leone.',
    en: 'Almería was the filming location for over 400 productions, including Sergio Leone\'s most iconic westerns.',
  },
  {
    type: 'fact',
    es: 'Almería es la única provincia española con clima desértico reconocido oficialmente por la Organización Meteorológica Mundial.',
    en: 'Almería is the only Spanish province with a desert climate officially recognised by the World Meteorological Organization.',
  },
  {
    type: 'fact',
    es: 'Vera Playa fue la primera playa naturista autorizada de España, en 1979.',
    en: 'Vera Playa was the first officially authorised naturist beach in Spain, in 1979.',
  },
  {
    type: 'fact',
    es: 'El paseo marítimo de Vera Playa tiene casi 3 kilómetros sin coches, uno de los más largos del litoral mediterráneo español.',
    en: 'The Vera Playa promenade stretches nearly 3 kilometres without a car, one of the longest on the Spanish Mediterranean coast.',
  },
  {
    type: 'fact',
    es: 'La temperatura media del Mediterráneo en Vera supera los 26 °C en verano, más cálida que en Mallorca o la Costa Brava.',
    en: 'The Mediterranean at Vera averages over 26 °C in summer, warmer than Mallorca or the Costa Brava.',
  },
  {
    type: 'fact',
    es: 'El Mediterráneo en Vera Playa alcanza hasta 28 °C en agosto, más cálido que el Caribe en esas fechas.',
    en: 'The Mediterranean at Vera Playa reaches up to 28 °C in August, warmer than the Caribbean at that time of year.',
  },
  {
    type: 'fact',
    es: 'Los 300 kilómetros de costa almeriense incluyen más de 70 playas, muchas de ellas sin urbanizar y sin banderas azules por elección propia.',
    en: 'Almería\'s 300 kilometres of coastline include over 70 beaches, many of them undeveloped and deliberately without blue flags.',
  },
  /* ── Cabo de Gata y naturaleza ── */
  {
    type: 'fact',
    es: 'El Parque Natural Cabo de Gata-Níjar recibe menos de 200 mm de lluvia al año, la aridez más extrema de Europa continental.',
    en: 'The Cabo de Gata-Níjar Natural Park receives less than 200 mm of rain a year, the most extreme aridity on mainland Europe.',
  },
  {
    type: 'fact',
    es: 'El fondo marino de Cabo de Gata alberga la mayor pradera de posidonia oceánica del Mediterráneo occidental, declarada patrimonio de interés europeo.',
    en: 'The seabed of Cabo de Gata holds the largest posidonia meadow in the western Mediterranean, declared a European heritage site.',
  },
  {
    type: 'fact',
    es: 'El Parque Natural Cabo de Gata tiene más de 1.000 especies vegetales, 200 de ellas endémicas del sur de España.',
    en: 'The Cabo de Gata Natural Park has over 1,000 plant species, 200 of them endemic to southern Spain.',
  },
  {
    type: 'fact',
    es: 'Los fondos de Vera Playa son hábitat del caballito de mar mediterráneo, una de las especies más protegidas del litoral español.',
    en: 'The waters off Vera Playa are habitat for the Mediterranean seahorse, one of the most protected species on the Spanish coast.',
  },
  /* ── Historia y gastronomía ── */
  {
    type: 'fact',
    es: 'Las Salinas de Puerto Rey albergan colonias de flamencos rosas que llegan cada año desde el norte de África.',
    en: 'The Puerto Rey salt flats host pink flamingo colonies that arrive each year from North Africa.',
  },
  {
    type: 'fact',
    es: 'Las Salinas de Puerto Rey fueron explotadas por los romanos hace más de 2.000 años para elaborar el garum, la salsa más valiosa de la antigüedad.',
    en: 'The Puerto Rey salt flats were worked by the Romans over 2,000 years ago to produce garum, the most prized condiment of antiquity.',
  },
  {
    type: 'fact',
    es: 'El olivar que inspira a Hestía Mar lleva siglos en la costa de Vera. El aceite de oliva de Almería ya se exportaba en época fenicia.',
    en: 'The olive grove behind Hestía Mar has stood on the Vera coast for centuries. Almería\'s olive oil was already exported in Phoenician times.',
  },
  {
    type: 'fact',
    es: 'La mojama de atún de Garrucha, a pocos kilómetros de Vera: es una de las conservas más antiguas del Mediterráneo, con más de 2.000 años de tradición.',
    en: 'The tuna mojama from Garrucha, a few kilometres from Vera, is one of the Mediterranean\'s oldest preserved foods, with over 2,000 years of tradition.',
  },
  {
    type: 'fact',
    es: 'La uva moscatel almeriense fue descrita por los viajeros árabes del siglo X como "la reina de todas las frutas".',
    en: 'The Almería muscat grape was described by Arab travellers in the 10th century as "the queen of all fruits".',
  },
  /* ── Hestía: lo que otros no tienen ── */
  {
    type: 'fact',
    es: 'Hestía lleva más de diez años con puntuación máxima ininterrumpida en Booking.com, Airbnb y Google Maps, algo que menos del 1 % de los alojamientos turísticos de España mantiene durante tanto tiempo.',
    en: 'Hestía has held top scores on Booking.com, Airbnb and Google Maps for over ten years, something fewer than 1% of guest accommodations in Spain sustain for that long.',
  },
  {
    type: 'fact',
    es: 'Reserva directo con Hestía: sin comisiones de plataforma y, si encuentras un precio más bajo, te lo igualamos y lo mejoramos. Y hablas con los propietarios, no con una centralita ni un bot.',
    en: 'Book direct with Hestía: no platform commissions and, if you find a lower price, we match it and beat it. And you speak with the owners, not a call centre or a bot.',
  },
  {
    type: 'fact',
    es: 'Hestía Thalassa es el único ático de la colección. Desde su terraza panorámica se tienen las vistas más abiertas al Mediterráneo y al Salar de los Canos de toda la urbanización.',
    en: 'Hestía Thalassa is the only penthouse in the collection. Its panoramic terrace has the most open views of the Mediterranean and the Salar de los Canos in the entire complex.',
  },
  {
    type: 'fact',
    es: 'Las mascotas son bienvenidas en los tres, bajo petición previa y con suplemento, respetando unas condiciones básicas.',
    en: 'Pets are welcome in all three Hestías, on request and with a supplement, as long as basic conditions are respected.',
  },
  {
    type: 'fact',
    es: 'Más de 630 familias han dormido en Hestía desde 2016. Más del 40 % repite, sin necesidad de ninguna oferta ni descuento.',
    en: 'Over 630 families have stayed at Hestía since 2016. More than 40% return, with no offer or discount needed.',
  },
  {
    type: 'fact',
    es: 'Nuestra guía de la zona es pública: más de 120 sitios entre Almería, Murcia y Granada, con lo que es cada uno y a qué distancia queda. Al reservar te damos la versión completa: a qué hora ir a cada sitio, qué pedir, dónde aparcar de verdad y los descuentos que hemos negociado.',
    en: 'Our area guide is public: over 120 places across Almería, Murcia and Granada, with what each one is and how far it sits. Book and you get the full version: when to go, what to order, where to actually park, and the discounts we have arranged.',
  },
  {
    type: 'fact',
    es: 'Salinas es uno de los pocos alojamientos del litoral mediterráneo con acceso peatonal directo a un parque natural protegido desde la puerta.',
    en: 'Salinas is one of very few homes on the Mediterranean coast with direct pedestrian access to a protected natural park from the front door.',
  },
  {
    type: 'fact',
    es: 'Los cambios de fecha y cancelaciones en Hestía se gestionan directamente con Alex o Fran: una conversación, no un formulario ni una política automática.',
    en: 'Date changes and cancellations at Hestía are handled directly with Alex or Fran: a conversation, not a form or an automated policy.',
  },

  /* ── Movidos desde FRASES_HOGAR (mayo 2026), eran curiosidades ── */
  { type:'fact', es:'Almería es la provincia más soleada de Europa con más de 3.000 horas anuales: supera a Atenas, Lisboa y Marsella.', en:'Almería is Europe\'s sunniest province with over 3,000 hours a year: beating Athens, Lisbon and Marseille.' },
  { type:'fact', es:'En Almería se filmaron clásicos como El Bueno, el Feo y el Malo (1966), Lawrence de Arabia (1962) o Indiana Jones y la Última Cruzada (1989).', en:'Almería was the location for classics like The Good, the Bad and the Ugly (1966), Lawrence of Arabia (1962) and Indiana Jones and the Last Crusade (1989).' },
  { type:'fact', es:'La Alcazaba de Almería es la segunda fortaleza musulmana más grande de España, sólo superada por la Alhambra de Granada.', en:'Almería\'s Alcazaba is the second-largest Muslim fortress in Spain, beaten only by Granada\'s Alhambra.' },
  { type:'fact', es:'El Mar de Plástico de Almería, más de 30.000 hectáreas de invernaderos, se ve desde el espacio y abastece de hortalizas a media Europa en invierno.', en:'Almería\'s Sea of Plastic: over 30,000 ha of greenhouses, is visible from space and supplies half of Europe with winter vegetables.' },
  { type:'fact', es:'La Geoda de Pulpí es la mayor cueva con cristales de yeso transparentes accesible al público en Europa: 8 metros de cristales gigantes.', en:'The Pulpí Geode is Europe\'s largest publicly accessible cave of transparent gypsum crystals: 8 m of giant crystals.' },
  { type:'fact', es:'En Roquetas de Mar nació el cantaor Manolo Caracol, uno de los grandes del flamenco del siglo XX.', en:'Cantaor Manolo Caracol, one of the great 20th-century flamenco voices, was born in Roquetas de Mar.' },
  { type:'fact', es:'En Sorbas existen las únicas formaciones de karst en yeso a gran escala de toda Europa.', en:'Sorbas hosts the only large-scale gypsum karst formations in all of Europe.' },
  { type:'fact', es:'La Cueva de los Letreros, en Vélez-Blanco, conserva pinturas rupestres declaradas Patrimonio de la Humanidad, la imagen del «Indalo» nació allí.', en:'The Letreros Cave in Vélez-Blanco preserves UNESCO-listed rock paintings, the image of the "Indalo" was born there.' },
  { type:'fact', es:'El Indalo, símbolo de Almería, es una figura prehistórica de hace ~4.500 años; durante siglos se pintó en las puertas de Mojácar como talismán.', en:'The Indalo, Almería\'s symbol, is a ~4,500-year-old prehistoric figure; for centuries it was painted on Mojácar doors as a talisman.' },
  { type:'fact', es:'La tradición dice que el Indalo solo da suerte si te lo regalan, nunca si lo compras tú: por eso es el mejor recuerdo para llevarse de Almería.', en:'Tradition says the Indalo only brings luck if it is given to you, never if you buy it yourself: that is why it is the finest keepsake to take home from Almería.' },
  { type:'fact', es:'La figura del Indalo representa a un hombre con los brazos abiertos sosteniendo un arco; muchos lo interpretan como un dios que sujeta el arcoíris.', en:'The Indalo figure shows a man with open arms holding an arch; many read it as a god holding up the rainbow.' },
  { type:'fact', es:'El nombre «Indalo» lo popularizaron en los años 40 los «Indalianos», un grupo de artistas de Almería liderado por Jesús de Perceval; viene de Indalecio, primer santo de la provincia.', en:'The name "Indalo" was popularised in the 1940s by the "Indalianos", a group of Almería artists led by Jesús de Perceval; it derives from Indalecio, the province\'s first saint.' },
  { type:'fact', es:'Hoy el Indalo está por todas partes en Almería: en la bandera y el escudo de la provincia, en las matrículas y hasta en la camiseta de la UD Almería.', en:'Today the Indalo is everywhere in Almería: on the province\'s flag and coat of arms, on number plates and even on UD Almería\'s shirt.' },
  { type:'fact', es:'Se colgaba en balcones y puertas como protección contra el mal de ojo y las tormentas: un amuleto de hogar, muy en la línea de lo que es Hestía.', en:'It was hung on balconies and doors to guard against the evil eye and storms: a charm for the home, very much in the spirit of Hestía.' },
  { type:'fact', es:'El Castillo de Vélez-Blanco albergaba un patio renacentista que hoy se exhibe íntegro en el Museo Metropolitano de Nueva York.', en:'Vélez-Blanco Castle housed a Renaissance courtyard that today stands intact at the Metropolitan Museum in New York.' },
  { type:'fact', es:'La Sierra de los Filabres acoge el observatorio astronómico de Calar Alto, uno de los más importantes de Europa continental.', en:'The Filabres mountain range hosts Calar Alto, one of mainland Europe\'s leading astronomical observatories.' },
  { type:'fact', es:'En Garrucha la lonja de pescado abre cada tarde y subasta gambas rojas que viajan hasta los mejores restaurantes de Madrid.', en:'Garrucha\'s fish market opens every afternoon and auctions red prawns that travel to Madrid\'s top restaurants.' },
  { type:'fact', es:'La Alpujarra Almeriense, al pie de Sierra Nevada, conserva pueblos blancos colgados de la montaña como Laujar de Andarax y Ohanes.', en:'The Almerian Alpujarra, at the foot of Sierra Nevada, preserves white villages clinging to the mountain like Laujar de Andarax and Ohanes.' },
  { type:'fact', es:'En Lucainena de las Torres, declarado uno de los pueblos más bonitos de España, se conservan minas de hierro del siglo XIX y un trenecillo minero.', en:'Lucainena de las Torres, listed among Spain\'s prettiest villages, preserves 19th-century iron mines and a mining train.' },
  { type:'fact', es:'El cabo de Gata-Níjar es la única región de Europa continental con clima oficialmente desértico, menos de 200 mm de lluvia al año.', en:'Cabo de Gata-Níjar is the only mainland-European region with an officially desert climate, under 200 mm of rain a year.' },
  { type:'fact', es:'En el Cabo de Gata existen unas 1.000 especies vegetales, 200 de ellas endémicas, más diversidad que cualquier otro parque del Mediterráneo español.', en:'Cabo de Gata holds about 1,000 plant species, 200 of them endemic, more diversity than any other Spanish Mediterranean park.' },
  { type:'fact', es:'La Sierra de María-Los Vélez es uno de los mejores lugares de Andalucía para ver águila real, búho real y treparriscos.', en:'Sierra de María-Los Vélez is one of Andalusia\'s best spots to see golden eagle, eagle owl and wallcreeper.' },
  { type:'fact', es:'El uvo Ohanes, uva blanca tardía de la Alpujarra almeriense, alcanzó tal fama en el siglo XIX que se exportaba en barriles a Londres y Nueva York.', en:'The Ohanes grape, a late white grape from the Almerian Alpujarra, was so famed in the 19th century it shipped in barrels to London and New York.' },
  { type:'fact', es:'En Almería hay más de 70 municipios y solo 3 superan los 50.000 habitantes: la capital, Roquetas y El Ejido.', en:'Almería has over 70 municipalities and only 3 top 50,000 people: the capital, Roquetas and El Ejido.' },
  { type:'fact', es:'El Refugio de la Guerra Civil de Almería son 4,5 km de túneles bajo la ciudad construidos para proteger a la población, los segundos más largos de España.', en:'Almería\'s Civil War Shelter is a 4.5 km network of underground tunnels built to shelter the population, Spain\'s second-longest.' },
  { type:'fact', es:'El Mar Menor, a 1 h de Vera Playa, es la mayor laguna salada de Europa: 170 km² con aguas siempre templadas.', en:'The Mar Menor, 1 h from Vera Playa, is Europe\'s largest saltwater lagoon: 170 km² of always-warm water.' },
  { type:'fact', es:'En Cartagena se conserva el único teatro romano en uso de toda Andalucía/Murcia: cabe 7.000 personas y se redescubrió en 1988.', en:'Cartagena holds the only working Roman theatre in Andalusia/Murcia: it seats 7,000 and was rediscovered in 1988.' },
  { type:'fact', es:'La Manga del Mar Menor mide 22 km y es una franja de arena de apenas 100-1.000 m de ancho que separa dos mares.', en:'La Manga del Mar Menor is 22 km long: a sand strip just 100-1,000 m wide separating two seas.' },
  { type:'fact', es:'Águilas, la primera población murciana al norte de Almería, fundó en 1879 el primer carnaval declarado de Interés Turístico Internacional de la Región.', en:'Águilas, the first Murcian town north of Almería, founded in 1879 the first carnival declared of International Tourist Interest in the Region.' },
  { type:'fact', es:'Los pasteles de carne de Murcia tienen más de 600 años, se servían en bodas árabes antes de la Reconquista.', en:'Murcia\'s meat pasties date back over 600 years, they were served at Arab weddings before the Reconquista.' },
  { type:'fact', es:'La Catedral de Murcia tiene la segunda fachada barroca más grande de Europa y un campanario de 92 m, el segundo más alto de España.', en:'Murcia Cathedral has Europe\'s second-largest Baroque façade and a 92 m bell tower, Spain\'s second-tallest.' },
  { type:'fact', es:'Caravaca de la Cruz es una de las cinco ciudades santas del cristianismo (junto a Roma, Jerusalén, Santiago y Santo Toribio).', en:'Caravaca de la Cruz is one of Christianity\'s five Holy Cities: alongside Rome, Jerusalem, Santiago and Santo Toribio.' },
  { type:'fact', es:'El Valle de Ricote, último reducto morisco de la península, conserva pueblos colgados sobre cañones de huerta tropical.', en:'The Ricote Valley, the last Morisco stronghold in Iberia, preserves villages clinging over canyons of tropical orchards.' },
  { type:'fact', es:'Lorca, restaurada tras el terremoto de 2011, posee el casco histórico barroco más completo de la España mediterránea.', en:'Lorca, rebuilt after the 2011 earthquake, holds the most complete Baroque old town of Mediterranean Spain.' },
  { type:'fact', es:'La huerta de Murcia produce el 70 % del limón consumido en Europa y el 40 % de los pimientos en conserva.', en:'Murcia\'s vegetable plain produces 70 % of Europe\'s lemons and 40 % of canned peppers.' },
  { type:'fact', es:'El zarangollo murciano (calabacín, cebolla y huevo) y los michirones (habas con jamón y guindilla) son los reyes de cualquier tapeo en la Plaza de las Flores.', en:'Murcian zarangollo (zucchini, onion and egg) and michirones (broad beans with ham and chili) rule any tapas crawl at Plaza de las Flores.' },
  { type:'fact', es:'En la pedanía cartagenera de Cabo de Palos hay un faro decimonónico encaramado a 81 m sobre el mar, un sitio top mundial para buceo.', en:'In Cabo de Palos (Cartagena) a 19th-century lighthouse perches 81 m above the sea, a world-class dive spot.' },
  { type:'fact', es:'El Bando de la Huerta de Murcia (Martes de Pascua) reúne a más de 500.000 personas vestidas de traje regional, más que la Tomatina o las Fallas.', en:'Murcia\'s Bando de la Huerta (Easter Tuesday) draws over 500,000 people in regional dress, more than La Tomatina or Las Fallas.' },
  { type:'fact', es:'El paparajote, dulce típico de Murcia, se hace envolviendo una hoja de limonero en masa: la masa se come, la hoja no.', en:'The paparajote, a Murcian sweet, wraps a lemon-tree leaf in batter: you eat the batter, not the leaf.' },
  { type:'fact', es:'La Alhambra de Granada es el monumento más visitado de España: más de 2,7 millones de visitas al año.', en:'Granada\'s Alhambra is Spain\'s most-visited monument: over 2.7 million visits a year.' },
  { type:'fact', es:'Sierra Nevada tiene el pico más alto de la península (Mulhacén, 3.479 m) y la estación de esquí más al sur de Europa.', en:'Sierra Nevada has Iberia\'s highest peak (Mulhacén, 3,479 m) and Europe\'s southernmost ski resort.' },
  { type:'fact', es:'La Costa Tropical de Granada produce mangos, papayas, chirimoyas y aguacates al aire libre, el clima subtropical más al norte del mundo.', en:'Granada\'s Tropical Coast grows mangoes, papayas, custard apples and avocados outdoors, the world\'s northernmost subtropical climate.' },
  { type:'fact', es:'La Alpujarra granadina aún conserva pueblos donde se habla un castellano con vocablos árabes que se han perdido en el resto de España.', en:'Granada\'s Alpujarra preserves villages where Spanish still uses Arabic words lost in the rest of the country.' },
  { type:'fact', es:'Las Cuevas del Sacromonte (Granada) son un barrio entero excavado en la roca donde aún viven familias gitanas y se baila zambra.', en:'The Sacromonte Caves (Granada) form an entire neighbourhood carved into rock where Roma families still live and dance the zambra.' },
  { type:'fact', es:'Federico García Lorca nació en Fuente Vaqueros, a 17 km de Granada, su casa-museo recibe miles de poetas cada año.', en:'Federico García Lorca was born in Fuente Vaqueros, 17 km from Granada, his house-museum draws thousands of poets each year.' },
  { type:'fact', es:'En Granada, "ir de tapas" significa que cada caña va acompañada de una tapa gratis, costumbre más viva aquí que en cualquier otra capital.', en:'In Granada, "going for tapas" means every drink comes with a free tapa, alive here more than in any other Spanish capital.' },
  { type:'fact', es:'Las cuevas de Guadix son el conjunto más grande de viviendas trogloditas habitadas de Europa: más de 4.500 personas viven en ellas hoy.', en:'The Guadix caves are Europe\'s largest set of inhabited troglodyte dwellings: over 4,500 people live in them today.' },
  { type:'fact', es:'En Salobreña, frontera con Almería, se cultiva la mejor caña de azúcar de Europa, última destilería tradicional de ron en España.', en:'In Salobreña, on the Almería border, Europe\'s best sugar cane is grown, Spain\'s last traditional rum distillery operates here.' },
  { type:'fact', es:'El Albaicín de Granada es el conjunto urbano nazarí mejor conservado del mundo, declarado Patrimonio de la Humanidad en 1984.', en:'Granada\'s Albaicín is the world\'s best-preserved Nasrid urban quarter, UNESCO-listed since 1984.' },
  { type:'fact', es:'La Acequia Real de la Alhambra lleva 800 años trayendo agua de Sierra Nevada, su sistema hidráulico inspiró acueductos en India y Marruecos.', en:'The Alhambra\'s Royal Acequia has carried Sierra Nevada water for 800 years, its hydraulic system inspired aqueducts in India and Morocco.' },
  { type:'fact', es:'En Castril (norte de Granada) está el río más oligotrofo de Andalucía: agua tan limpia que sirve de patrón para estudios europeos.', en:'In Castril (northern Granada) flows Andalusia\'s most oligotrophic river: water so clean it serves as a benchmark for European studies.' },
  { type:'fact', es:'Jaén produce el 20 % del aceite de oliva del mundo: si fuera un país, sería el cuarto productor mundial.', en:'Jaén produces 20 % of the world\'s olive oil: if it were a country it would be the fourth-largest producer.' },
  { type:'fact', es:'En el Parque Natural de Cazorla, Segura y las Villas nace el Guadalquivir: el río más largo de Andalucía, 657 km.', en:'In Cazorla, Segura and Las Villas Natural Park rises the Guadalquivir, Andalusia\'s longest river at 657 km.' },
  { type:'fact', es:'Úbeda y Baeza son ciudades gemelas Patrimonio de la Humanidad por su Renacimiento andaluz, raro y casi único en Europa.', en:'Úbeda and Baeza are twin UNESCO World Heritage cities for their Andalusian Renaissance, rare and nearly unique in Europe.' },
  { type:'fact', es:'En Jaén capital, los Baños Árabes del Palacio de Villardompardo son los mejor conservados de España.', en:'In Jaén city, the Arab Baths at Palacio de Villardompardo are the best-preserved in Spain.' },
  { type:'fact', es:'La Sierra de Cazorla aún conserva linces ibéricos en libertad, se han pasado de 94 ejemplares en 2002 a más de 2.000 en 2024.', en:'Sierra de Cazorla still has wild Iberian lynxes: populations grew from 94 in 2002 to over 2,000 in 2024.' },
  { type:'fact', es:'El Castillo de Santa Catalina (Jaén) se ve en pintura del Greco, y desde su mirador se domina el mar de olivos hasta Sierra Mágina.', en:'Santa Catalina Castle (Jaén) appears in an El Greco painting, its mirador sweeps the olive sea to Sierra Mágina.' },
  { type:'fact', es:'En Andújar (Jaén) se celebra el Cristo de los Jueves Santos, una procesión que reúne a más de 700.000 peregrinos cada abril.', en:'Andújar (Jaén) hosts the Cristo de los Jueves Santos, a procession drawing over 700,000 pilgrims each April.' },
  { type:'fact', es:'El cocido de pelotas, el ajilimoje, los ochíos y las gachamigas son cuatro pilares de la cocina serrana de Jaén.', en:'Cocido de pelotas, ajilimoje, ochíos and gachamigas are four pillars of Jaén\'s mountain cuisine.' },
  { type:'fact', es:'Iznatoraf es uno de los pueblos más altos de Jaén: 1.063 m, calles empedradas de piedra y vistas que llegan a Sierra Cazorla y Sierra Morena.', en:'Iznatoraf is one of Jaén\'s highest villages: 1,063 m, cobbled streets, views reaching Cazorla and Sierra Morena.' },
  { type:'fact', es:'En Sabiote, Jaén, el castillo de los Vázquez de Molina conserva uno de los patios renacentistas más bellos de España, casi desconocido.', en:'In Sabiote, Jaén, the Vázquez de Molina castle holds one of Spain\'s loveliest, and least-known, Renaissance courtyards.' },
  { type:'fact', es:'Almería, Murcia, Granada y Jaén comparten Sierra Nevada: la única cordillera del sur de Europa con nieve casi todo el año.', en:'Almería, Murcia, Granada and Jaén share Sierra Nevada, the only southern-European range with snow most of the year.' },
  { type:'fact', es:'La N-340, "carretera del Mediterráneo", recorre Almería, Murcia y Cataluña enlazando a más de 4 millones de habitantes costeros.', en:'The N-340 "Mediterranean road" crosses Almería, Murcia and Catalonia, linking over 4 million coastal residents.' },
  { type:'fact', es:'En la frontera Almería-Granada, el Geoparque del Cabo de Gata se cruza con el de Sierra Nevada, único corredor desierto-alta montaña de Europa.', en:'On the Almería-Granada border, the Cabo de Gata Geopark meets Sierra Nevada\'s, Europe\'s only desert-to-high-mountain corridor.' },
  { type:'fact', es:'El Geoparque Mundial UNESCO de Granada (norte) y el del Cabo de Gata (Almería) son dos de los seis únicos de España.', en:'Granada\'s northern UNESCO Global Geopark and Cabo de Gata\'s (Almería) are two of just six in all of Spain.' },
  { type:'fact', es:'Los olivos del campo de Vera y los de Jaén forman parte del mayor bosque cultivado del mundo: 350 millones de olivos.', en:'Vera\'s olive groves and Jaén\'s belong to the world\'s largest cultivated forest: 350 million olive trees.' },
  { type:'fact', es:'El AVE Madrid-Granada, abierto en 2019, redujo el viaje desde Madrid a 3 h, antes eran casi 5 con tren convencional.', en:'The Madrid-Granada AVE high-speed line, opened in 2019, cut Madrid travel to 3 h, formerly nearly 5 by conventional train.' },
  { type:'fact', es:'La carretera A-92, que cruza Andalucía oriental, es la única que une a las cuatro provincias fronterizas con Almería en menos de 4 horas.', en:'The A-92 motorway across eastern Andalusia is the only road linking all four provinces bordering Almería in under 4 hours.' },
  { type:'fact', es:'Granada y Almería tienen el cielo más oscuro de la Andalucía mediterránea, la noche en el Cabo y en Sierra Nevada compite con la del Atacama.', en:'Granada and Almería have Andalusia\'s darkest Mediterranean skies, nights at Cabo de Gata and Sierra Nevada rival those of Atacama.' },
  { type:'fact', es:'Hestía está más cerca de Mojácar (10 min) que del centro de Vera pueblo (15 min), la mejor manera de conocer ambos sin moverte de Hestía.', en:'Hestía is closer to Mojácar (10 min) than to Vera town centre (15 min), the best way to know both without leaving Hestía.' },
  { type:'fact', es:'Desde la terraza de Hestía Thalassa se ve el Mediterráneo, el Salar de los Canos y, en días limpios, las cumbres nevadas de Sierra Nevada.', en:'From Hestía Thalassa\'s terrace you can see the Mediterranean, the Salar de los Canos and, on clear days, snow-capped Sierra Nevada.' },
  { type:'fact', es:'A 30 min de Hestía empieza el Parque Natural de Cabo de Gata-Níjar y a 90 min el Parque Natural de Sierra María-Los Vélez. Dos parques en un día son posibles.', en:'30 min from Hestía starts the Cabo de Gata-Níjar Natural Park; 90 min to Sierra María-Los Vélez. Two parks in one day is possible.' },
  { type:'fact', es:'Hestía Vera Salinas está cerca del Parque Natural de las Salinas de Puerto Rey: un paseo corto y estás entre flamencos.', en:'Hestía Vera Salinas is close to the Puerto Rey Salt Flats Natural Park: a short walk puts you among flamingos.' },
  { type:'fact', es:'La Alcazaba de Almería es el segundo conjunto fortificado musulmán más grande de España, solo por detrás de la Alhambra.', en:'Almería\'s Alcazaba is the second-largest Muslim fortress in Spain, after the Alhambra.' },
  { type:'fact', es:'La Catedral de Almería es la única catedral fortaleza de España: cuatro torres y muros gruesos para defenderse de los ataques berberiscos del siglo XVI.', en:'Almería\'s Cathedral is the only fortified cathedral in Spain, four towers and thick walls built to repel Barbary corsair raids in the 16th century.' },
  { type:'fact', es:'Los Refugios de la Guerra Civil de Almería son los más grandes de Europa abiertos al público: 4,5 km bajo el suelo, con quirófano y dispensario.', en:'Almería\'s Civil War Shelters are the largest in Europe open to the public: 4.5 km of tunnels with operating room and dispensary.' },
  { type:'fact', es:'El barrio de la Chanca, en Almería capital, conserva casas-cueva habitadas, pintadas con colores vivos por encima del barro original.', en:'The Chanca quarter in Almería city still has inhabited cave-houses, painted in vivid colours over the original adobe.' },
  { type:'fact', es:'En Los Millares (Santa Fe de Mondújar) están los restos de la primera civilización metalúrgica de la Península Ibérica: 4.000 a.C.', en:'Los Millares (Santa Fe de Mondújar) preserves the remains of the Iberian Peninsula\'s earliest metallurgical civilisation, around 4000 BC.' },
  { type:'fact', es:'El Desierto de Tabernas es el único desierto de Europa continental: menos de 200 mm de lluvia al año.', en:'The Tabernas Desert is the only desert in continental Europe, under 200 mm of rain per year.' },
  { type:'fact', es:'En Tabernas se rodaron más de 500 películas: spaguetti western, Indiana Jones, Cleopatra, Lawrence de Arabia y Juego de Tronos pasaron por aquí.', en:'Over 500 films were shot in Tabernas: spaghetti westerns, Indiana Jones, Cleopatra, Lawrence of Arabia and Game of Thrones all visited.' },
  { type:'fact', es:'Mini Hollywood (Oasys), Western Leone y Fort Bravo son los tres "pueblos del Oeste" originales construidos en Tabernas, siguen abiertos al público.', en:'Mini Hollywood (Oasys), Western Leone and Fort Bravo, the three original Wild-West sets in Tabernas, are still open to visitors.' },
  { type:'fact', es:'El observatorio de Calar Alto (Sierra de los Filabres, 2.168 m) tiene el telescopio óptico más grande de Europa continental: 3,5 m de diámetro.', en:'Calar Alto Observatory (Filabres range, 2,168 m) houses continental Europe\'s largest optical telescope, 3.5 m in diameter.' },
  { type:'fact', es:'Macael lleva sacando mármol blanco desde la época romana: abasteció a la Mezquita de Córdoba, El Escorial y la Alhambra.', en:'Macael has quarried white marble since Roman times: supplying the Córdoba Mosque, El Escorial and the Alhambra.' },
  { type:'fact', es:'En Pulpí está la geoda más grande de Europa abierta al público: una cavidad de 11 m con cristales de yeso transparentes de hasta 2 m.', en:'Pulpí holds Europe\'s largest geode open to the public: an 11-metre cavity with transparent gypsum crystals up to 2 m long.' },
  { type:'fact', es:'La Geoda de Pulpí se descubrió por casualidad en 1999, mientras dos mineros buscaban un nuevo filón en una mina ya abandonada.', en:'The Pulpí Geode was discovered by chance in 1999, when two miners exploring an abandoned mine broke through the wrong wall.' },
  { type:'fact', es:'El Karst en Yesos de Sorbas es el segundo karst de yeso más importante de Europa: cuevas con cristales de selenita y ríos subterráneos.', en:'The Sorbas Gypsum Karst is Europe\'s second-largest gypsum karst, caves with selenite crystals and underground rivers.' },
  { type:'fact', es:'Níjar mantiene desde el siglo XV el oficio de la jarapa: alfombras tejidas con tiras de tela reciclada en talleres familiares.', en:'Níjar has woven jarapas, rugs made from recycled fabric strips, in family workshops since the 15th century.' },
  { type:'fact', es:'La playa de Mónsul aparece en "Indiana Jones y la Última Cruzada": la duna gigante es ceniza volcánica solidificada hace 8 millones de años.', en:'Mónsul beach appears in "Indiana Jones and the Last Crusade", the giant dune is volcanic ash solidified 8 million years ago.' },
  { type:'fact', es:'La playa de los Genoveses se llama así por la flota genovesa que ayudó a los Reyes Católicos a tomar Almería en 1489.', en:'Genoveses Beach owes its name to the Genoese fleet that helped the Catholic Monarchs take Almería in 1489.' },
  { type:'fact', es:'En el Cabo de Gata vive el caballito de mar mediterráneo (Hippocampus guttulatus): uno de los pocos lugares de España donde se ve buceando.', en:'The Mediterranean seahorse (Hippocampus guttulatus) lives in Cabo de Gata, one of the few places in Spain to spot one while diving.' },
  { type:'fact', es:'El Arrecife de las Sirenas, junto al faro del Cabo de Gata, es una formación volcánica única que dio origen a la leyenda local de las sirenas.', en:'The Mermaid Reef, next to the Cabo de Gata lighthouse, is a unique volcanic formation that inspired the local mermaid legend.' },
  { type:'fact', es:'La pradera de posidonia oceánica del Cabo de Gata es de las mejor conservadas del Mediterráneo occidental: pulmón submarino que filtra el agua y oxigena el mar.', en:'Cabo de Gata\'s Posidonia oceanica meadow is one of the best-preserved in the western Mediterranean, an underwater lung that filters water and oxygenates the sea.' },
  { type:'fact', es:'Las Salinas de Cabo de Gata producen 40.000 toneladas de sal marina al año: la única salina industrial activa de Andalucía oriental.', en:'The Cabo de Gata Salt Flats produce 40,000 tonnes of sea salt a year, eastern Andalusia\'s only active industrial salina.' },
  { type:'fact', es:'La Cala de Enmedio (Agua Amarga) es para muchos la playa virgen más bonita de España: 30 minutos andando entre rocas blancas talladas por el viento.', en:'Cala de Enmedio (Agua Amarga) is widely considered Spain\'s most beautiful unspoiled beach, a 30-minute walk between wind-sculpted white rocks.' },
  { type:'fact', es:'La playa de los Muertos (Carboneras) recibe su nombre de la corriente de Almería, que devolvía a la orilla los cuerpos de naufragios del Estrecho.', en:'Playa de los Muertos (Carboneras) is named after the Almería current, which used to wash bodies from Strait of Gibraltar wrecks back ashore.' },
  { type:'fact', es:'En el faro de Mesa Roldán (Carboneras) se rodaron escenas de Juego de Tronos: las almenadas paredes hacen de Rocadragón en la sexta temporada.', en:'Game of Thrones filmed at Mesa Roldán lighthouse (Carboneras), its battlemented walls play Dragonstone in season six.' },
  { type:'fact', es:'Mojácar tiene un Indalo pintado en cada puerta: figura prehistórica de la Cueva de los Letreros (Vélez Blanco) adoptada como amuleto.', en:'Every door in Mojácar carries an Indalo: a prehistoric figure from the Letreros Cave (Vélez Blanco), adopted as a protective amulet.' },
  { type:'fact', es:'Mojácar Pueblo y Mojácar Playa están a solo 4 km en línea recta, pero el primer autobús urbano que los conectó (1962) tardaba 25 minutos por las curvas.', en:'Mojácar village and Mojácar beach are just 4 km apart in a straight line, but the first bus connecting them (1962) took 25 winding minutes.' },
  { type:'fact', es:'En la Plaza Nueva de Mojácar hay un mirador árabe del siglo XIII orientado al sureste: ve el amanecer del solsticio de verano sobre el peñón.', en:'Mojácar\'s Plaza Nueva mirador, dating from the 13th-century Moorish era, frames the summer-solstice sunrise over the headland.' },
  { type:'fact', es:'El Castillo de Vélez Blanco es renacentista: el patio interior lo compró un magnate de Nueva York en 1904 y hoy se exhibe en el Museo Metropolitan de Manhattan.', en:'Vélez Blanco Castle is Renaissance, its inner courtyard was bought by a New York tycoon in 1904 and is now displayed at the Met in Manhattan.' },
  { type:'fact', es:'La Cueva de los Letreros (Vélez Blanco) es Patrimonio de la Humanidad: pinturas rupestres de hace 7.000 años, incluido el Indalo original.', en:'The Letreros Cave (Vélez Blanco) is a UNESCO World Heritage Site: 7,000-year-old rock paintings including the original Indalo.' },
  { type:'fact', es:'La Olla del Padre, en la Sierra de María, es la cima más alta del Parque Natural Sierra María-Los Vélez (2.045 m) y suele tener nieve hasta abril.', en:'La Olla del Padre, in the Sierra de María, is the highest peak in the Sierra María-Los Vélez Natural Park (2,045 m), often snow-covered through April.' },
  { type:'fact', es:'Las jarapas de Níjar y la cerámica esmaltada azul de Cuevas del Almanzora se consideran las dos artesanías más antiguas y vivas de la provincia.', en:'Níjar jarapas and Cuevas del Almanzora\'s blue glazed pottery are widely seen as the province\'s two oldest still-living crafts.' },
  { type:'fact', es:'La gamba roja de Garrucha tiene Denominación de Origen propia: solo se considera auténtica la pescada en su caladero a 600 m de profundidad.', en:'Garrucha\'s red prawn carries its own protected designation, only those caught in its 600 m-deep fishing ground qualify as authentic.' },
  { type:'fact', es:'Garrucha presume del "malecón más bonito del Mediterráneo": un kilómetro iluminado entre la flota pesquera y los restaurantes de marisco.', en:'Garrucha takes pride in the "prettiest harbour promenade in the Mediterranean": one lit kilometre between the fishing fleet and the seafood restaurants.' },
  { type:'fact', es:'El Cargadero de Mineral del Alquife (1904), en el puerto de Almería, es uno de los pocos puentes de carga ferroviaria sobre el mar conservados en España.', en:'The Alquife ore loader (1904) in Almería harbour is one of the few iron rail-loading piers built over the sea still preserved in Spain.' },
  { type:'fact', es:'Roquetas de Mar tiene la mayor concentración de invernaderos del mundo: el "Mar de Plástico" cubre 31.000 hectáreas y se ve desde el espacio.', en:'Roquetas de Mar holds the world\'s largest concentration of greenhouses, the "Plastic Sea" covers 31,000 hectares and is visible from space.' },
  { type:'fact', es:'La cooperativa de tomate de Almería y Murcia produce el grueso del tomate fresco que se consume en Alemania entre noviembre y marzo.', en:'The Almería-Murcia tomato cooperatives supply most of the fresh tomatoes consumed in Germany from November to March.' },
  { type:'fact', es:'Adra fue fundada por los fenicios en el siglo VIII a.C. como "Abdera": una de las cinco colonias fenicias del litoral andaluz.', en:'Adra was founded by the Phoenicians in the 8th century BC as "Abdera", one of five Phoenician colonies on the Andalusian coast.' },
  { type:'fact', es:'La Alpujarra almeriense (Laujar, Berja, Adra) fue el último refugio de los moriscos antes de su expulsión definitiva en 1571.', en:'The Almerian Alpujarra (Laujar, Berja, Adra) was the last Morisco refuge before their final expulsion in 1571.' },
  { type:'fact', es:'En la cara este de Sierra Nevada nace el río Andarax, uno de los pocos ríos europeos cuyas aguas se evaporan antes de llegar al mar.', en:'The Andarax river rises on Sierra Nevada\'s eastern slope, one of the few European rivers whose waters evaporate before reaching the sea.' },
  { type:'fact', es:'En Almería hay especialidades culinarias únicas: gurullos (pasta artesana), gachas, ajoblanco con almendras del Almanzora y olla de trigo serrana.', en:'Almería offers unique dishes: gurullos (handmade pasta), gachas, ajoblanco made with Almanzora almonds and the highland wheat olla.' },
  { type:'fact', es:'Las migas almerienses son de sémola, no de pan: se acompañan con uvas, sardinas en aceite o granada, costumbre rural del invierno.', en:'Almerian migas are made with semolina, not bread, and are served with grapes, oil-cured sardines or pomegranate, a winter country tradition.' },
  { type:'fact', es:'Almería y Murcia tienen los inviernos más cálidos de la Península Ibérica: media de 13 °C en enero, idéntica a la de Atenas.', en:'Almería and Murcia have the warmest winters on the Iberian Peninsula: averaging 13 °C in January, the same as Athens.' },
  { type:'fact', es:'La Sierra Cabrera, entre Mojácar y Vera, es de origen metamórfico distinto al volcánico del Cabo de Gata: los geólogos la llaman "isla geológica".', en:'Sierra Cabrera, between Mojácar and Vera, is metamorphic in origin, unlike volcanic Cabo de Gata, geologists call it a "geological island".' },
  { type:'fact', es:'En el río Almanzora hay barbos endémicos de la cuenca, especie protegida que sobrevive solo en sus tramos altos.', en:'The Almanzora river hosts an endemic barbel species, protected and surviving only in its upper reaches.' },
  { type:'fact', es:'La presa de Cuevas del Almanzora es la mayor de la cuenca del Segura: terminó con las riadas históricas que arrasaban el Levante en el siglo XIX.', en:'The Cuevas del Almanzora dam is the largest in the Segura basin, it ended the historic floods that devastated the Levante in the 19th century.' },
  { type:'fact', es:'El Bajo Almanzora produce uva de mesa exportada desde el siglo XIX: en barco a Londres, Hamburgo y Nueva York en cinco semanas de travesía.', en:'The lower Almanzora has exported table grapes since the 19th century: five weeks by ship to London, Hamburg and New York.' },
  { type:'fact', es:'El aceite de oliva de Tabernas tiene Denominación de Origen propia desde 2017: uno de los pocos D.O. cultivados en pleno desierto.', en:'Tabernas olive oil has had its own protected designation since 2017, one of the few PDOs grown in true desert.' },
  { type:'fact', es:'El "Toyo" es el campo de golf más al sur de la Costa de Almería con vistas al Cabo de Gata desde todos los hoyos, diseño de Severiano Ballesteros.', en:'El Toyo is the southernmost golf course on the Almería Coast: Cabo de Gata views from every hole, designed by Seve Ballesteros.' },
  { type:'fact', es:'En el Cabo de Gata vive el águila perdicera (Aquila fasciata): aquí nidifica una de las mayores poblaciones europeas de la especie.', en:'Bonelli\'s eagle (Aquila fasciata) breeds in Cabo de Gata, one of Europe\'s largest populations of the species.' },
  { type:'fact', es:'En la Sierra de Filabres viven cabras montesas reintroducidas en los años 80, hoy se ven al amanecer subiendo a los telescopios de Calar Alto.', en:'Iberian ibex were reintroduced into the Filabres range in the 1980s, today you can spot them at dawn near the Calar Alto telescopes.' },
  { type:'fact', es:'El Faro del Cabo de Gata fue uno de los últimos faros españoles en pasar del aceite de oliva a la electricidad, ocurrió en 1972.', en:'The Cabo de Gata lighthouse was among Spain\'s last to switch from olive oil to electric power, it happened in 1972.' },
  { type:'fact', es:'Las cuatro cumbres volcánicas del Cabo de Gata (Bermeja, Mauricio, Negra, Higo Seco) se suben en una hora desde Las Negras y regalan vistas a 360°.', en:'Cabo de Gata\'s four volcanic peaks: Bermeja, Mauricio, Negra and Higo Seco, can be climbed in an hour from Las Negras for full 360° views.' },
  { type:'fact', es:'Almería capital tiene el segundo casco histórico amurallado más grande de Andalucía oriental: solo Granada le supera.', en:'Almería city has eastern Andalusia\'s second-largest historic walled centre, only Granada is bigger.' },
  { type:'fact', es:'La Catedral de Almería conserva una de las pocas custodias renacentistas de plata maciza en España: pesa cerca de 200 kg y solo sale en Corpus.', en:'Almería Cathedral keeps one of Spain\'s few solid-silver Renaissance monstrances: close to 200 kg, paraded only at Corpus Christi.' },
  { type:'fact', es:'Vera celebra cada agosto sus Fiestas Mayores en honor a la Virgen de las Angustias: programa con encierros, dianas y feria centenaria.', en:'Vera holds its main August fiestas honouring the Virgin of the Angustias: running of the bulls, dawn parades and a fair dating back over a century.' },
  { type:'fact', es:'Cuevas del Almanzora tiene un castillo árabe del siglo XII restaurado: aparece en "El Cid" (1961) con Charlton Heston en escenas exteriores.', en:'Cuevas del Almanzora\'s 12th-century Moorish castle appears in "El Cid" (1961) with Charlton Heston in the exterior scenes.' },
  { type:'fact', es:'Las playas naturistas de Vera Playa están reconocidas oficialmente desde 1979: una de las primeras de toda España y la única con bandera azul desde hace décadas.', en:'Vera Playa\'s naturist beaches were officially recognised in 1979, among Spain\'s first and Blue-Flag certified for decades.' },
  { type:'fact', es:'La Cueva del Tesoro en Vélez Rubio guarda pinturas rupestres del Levantino: ciervas, cabras y cazadores en una de las cuevas más alejadas del mar de Andalucía.', en:'Vélez Rubio\'s Cueva del Tesoro keeps Levantine rock art: deer, goats and hunters in one of Andalusia\'s most inland caves.' },
  { type:'fact', es:'El Castillo de Tabernas se ve desde 30 km a la redonda y domina todo el desierto: bajo restauración con financiación europea desde 2022.', en:'Tabernas Castle is visible from 30 km around, dominating the entire desert, under EU-funded restoration since 2022.' },
  { type:'fact', es:'Lorca celebra la Semana Santa más teatral de España: pasos con cuádrigas romanas y representaciones bíblicas declaradas Bien de Interés Cultural.', en:'Lorca holds Spain\'s most theatrical Holy Week: Roman chariots and biblical pageants, declared a National Heritage Site.' },
  { type:'fact', es:'El Castillo de Lorca, "Fortaleza del Sol", es el más grande de la Región de Murcia: 8 km de murallas y dos torres del homenaje.', en:'Lorca\'s "Fortaleza del Sol" is the largest castle in the Region of Murcia, 8 km of walls and two keep towers.' },
  { type:'fact', es:'El terremoto de Lorca de 2011 fue uno de los más destructivos de la España moderna: la reconstrucción del centro histórico ganó el Premio Europa Nostra.', en:'Lorca\'s 2011 earthquake was among modern Spain\'s most destructive, the historic centre\'s restoration won the Europa Nostra Award.' },
  { type:'fact', es:'Águilas tiene Carnaval de Interés Turístico Internacional: cuatro noches de música, comparsas y la "musa" elegida cada año atraen a 100.000 visitantes.', en:'Águilas Carnival is rated of International Tourist Interest: four nights of music, troupes and the annual "musa" draw 100,000 visitors.' },
  { type:'fact', es:'En Águilas y Cabo Cope viven cabras montesas reintroducidas en los años 90: la pequeña reserva costera funciona como puente con la sierra.', en:'Águilas and Cabo Cope host ibex reintroduced in the 1990s, a small coastal reserve linking sea and inland sierra.' },
  { type:'fact', es:'Cartagena guarda el único Teatro Romano de la Hispania Tarraconense excavado bajo el casco urbano, enterrado bajo la catedral medieval durante 2.000 años.', en:'Cartagena holds the only Roman Theatre of Hispania Tarraconensis excavated under a city centre: buried beneath the medieval cathedral for 2,000 years.' },
  { type:'fact', es:'Cartagena es una de las pocas ciudades del mundo con dos puertos enfrentados: militar (Arsenal) y comercial, separados por solo 200 m.', en:'Cartagena is one of the few cities in the world with two facing harbours, military (Arsenal) and commercial, just 200 m apart.' },
  { type:'fact', es:'Cartagena guarda el Submarino Peral, primer submarino eléctrico de combate del mundo, botado en 1888 y expuesto al aire libre en su puerto.', en:'Cartagena exhibits the Peral submarine, the world\'s first electric combat submarine, launched in 1888 and now displayed open-air at the harbour.' },
  { type:'fact', es:'Asdrúbal el Bello fundó Cartagena en 227 a.C. con el nombre de Qart Hadasht, "Ciudad Nueva", capital cartaginesa de Iberia.', en:'Hasdrubal the Fair founded Cartagena in 227 BC as Qart Hadasht, "New City", the Carthaginian capital of Iberia.' },
  { type:'fact', es:'La península ibérica le debe el nombre "España" al fenicio "I-Spn-Ya" (tierra de conejos): los conejos venían sobre todo de Almería y Murcia.', en:'The Iberian Peninsula owes its name "Spain" to the Phoenician "I-Spn-Ya" (land of rabbits), and most of those rabbits came from Almería and Murcia.' },
  { type:'fact', es:'El Mar Menor es la mayor laguna salada de Europa: 135 km² conectados al Mediterráneo por cinco bocas estrechas llamadas "golas".', en:'The Mar Menor is Europe\'s largest saltwater lagoon, 135 km² linked to the Mediterranean by five narrow channels called "golas".' },
  { type:'fact', es:'La Manga del Mar Menor mide 22 km y separa la laguna del Mediterráneo: en algunos puntos tiene solo 100 m de ancho.', en:'La Manga del Mar Menor is 22 km long, separating the lagoon from the open Mediterranean, narrowing to just 100 m in places.' },
  { type:'fact', es:'En el Mar Menor se practica deportes náuticos sin viento ni olas: única laguna en Europa donde aprenden vela los niños menores de 10 años.', en:'The Mar Menor offers calm-water sailing, Europe\'s only lagoon where children under 10 routinely learn to sail.' },
  { type:'fact', es:'La isla del Barón en el Mar Menor fue regalo de bodas de un barón a su esposa en 1900: hoy propiedad privada, solo se ve desde el aire.', en:'The Mar Menor\'s Isla del Barón was a wedding gift in 1900: private property today, visible only from the air.' },
  { type:'fact', es:'Mazarrón fue el principal puerto de exportación de plata romana de Hispania: aún se conservan galerías mineras bajo la sierra.', en:'Mazarrón was Hispania\'s main Roman silver export port, mining galleries still survive under the surrounding hills.' },
  { type:'fact', es:'En el yacimiento Phoenician de Mazarrón se conservan dos pecios fenicios del siglo VII a.C., únicos en el mundo: aún están bajo el mar.', en:'Mazarrón\'s Phoenician site preserves two 7th-century BC Phoenician shipwrecks unique in the world, still under water.' },
  { type:'fact', es:'La Azohía (Mazarrón) tiene una de las cinco torres vigía costeras del Reino de Murcia: contra los ataques berberiscos del siglo XVI.', en:'La Azohía (Mazarrón) keeps one of the Kingdom of Murcia\'s five 16th-century coastal watchtowers, built against Barbary raids.' },
  { type:'fact', es:'Caravaca de la Cruz es una de las cinco ciudades santas del cristianismo (junto a Roma, Jerusalén, Santiago y Santo Toribio): celebra Año Jubilar cada 7 años.', en:'Caravaca de la Cruz is one of Christianity\'s five Holy Cities: alongside Rome, Jerusalem, Santiago and Santo Toribio, with a Jubilee Year every 7 years.' },
  { type:'fact', es:'La basílica de Caravaca alberga la Vera Cruz: reliquia de la cruz de Cristo donada en 1232, "lavada" cada 3 de mayo en una ceremonia única.', en:'Caravaca\'s basilica holds the True Cross, a relic donated in 1232 and ritually "washed" every 3 May in a unique ceremony.' },
  { type:'fact', es:'Calasparra produce el único arroz español de Denominación de Origen Protegida cultivado en montaña: terrazas inundadas a 350 m de altitud.', en:'Calasparra grows Spain\'s only protected-designation rice cultivated at altitude, flooded mountain terraces at 350 m.' },
  { type:'fact', es:'El Cañón de Almadenes (Calasparra) se navega solo en kayak: 4 km de paredes verticales de 100 m sobre el río Segura.', en:'The Almadenes Canyon (Calasparra) can be navigated only by kayak, 4 km of vertical 100-m walls along the Segura river.' },
  { type:'fact', es:'Sierra Espuña fue el primer espacio reforestado de Europa: en 1891, Ricardo Codorníu plantó pinos para frenar la erosión, hoy 25.000 hectáreas de bosque.', en:'Sierra Espuña was Europe\'s first reforested area, in 1891 Ricardo Codorníu planted pines to halt erosion; today the forest covers 25,000 hectares.' },
  { type:'fact', es:'Sierra Espuña conserva los "Pozos de la Nieve" del siglo XVI: 20 cisternas de piedra que recogían nieve para abastecer Cartagena en verano.', en:'Sierra Espuña preserves 16th-century "Pozos de la Nieve", 20 stone snow-pits that supplied Cartagena with ice through the summer.' },
  { type:'fact', es:'Murcia tiene el segundo casco antiguo más extenso de España tras Sevilla: 215 hectáreas dentro de las antiguas murallas árabes.', en:'Murcia has Spain\'s second-largest old town after Seville, 215 hectares inside the former Moorish walls.' },
  { type:'fact', es:'La Catedral de Murcia tiene la fachada barroca más alta de España (95 m) y conserva el corazón embalsamado del rey Alfonso X el Sabio.', en:'Murcia Cathedral has Spain\'s tallest Baroque façade (95 m) and preserves the embalmed heart of King Alfonso X the Wise.' },
  { type:'fact', es:'La huerta de Murcia se riega con un sistema de acequias árabe del siglo X: el más antiguo de Europa todavía en uso, con su propio Tribunal del Agua.', en:'Murcia\'s huerta is irrigated by a 10th-century Moorish acequia system, Europe\'s oldest still in use, with its own Water Tribunal.' },
  { type:'fact', es:'El altiplano murciano (Yecla, Jumilla) produce el monastrell más concentrado de España: vino de uva resistente a 40 °C en verano.', en:'Murcia\'s altiplano (Yecla, Jumilla) yields Spain\'s most concentrated Monastrell, wines from grapes that withstand 40 °C summers.' },
  { type:'fact', es:'El "tomate raf" murciano-almeriense solo crece en suelo salino y combina dulzor y acidez extremos: las mejores variedades vienen de Pulpí y Águilas.', en:'The "raf" tomato, Murcian-Almerian, grows only in saline soil and combines extreme sweetness and acidity; the best come from Pulpí and Águilas.' },
  { type:'fact', es:'El paparajote es el postre típico de la huerta murciana: hoja de limonero rebozada y frita con azúcar y canela. Se come la masa, no la hoja.', en:'Paparajote is Murcia\'s emblematic huerta dessert: a lemon leaf battered and fried, dusted with sugar and cinnamon. You eat the batter, not the leaf.' },
  { type:'fact', es:'El "zarangollo" murciano es un revuelto de calabacín y cebolla, sencillo pero hecho con la huerta: solo se sabe a qué huele cuando es de Murcia.', en:'Murcia\'s "zarangollo" is a simple zucchini-onion scramble, but only Murcian huerta produce gives it that unmistakable scent.' },
  { type:'fact', es:'Los michirones son habas secas guisadas con chorizo y hueso de jamón: el plato cuartelero murciano por excelencia, herencia mudéjar.', en:'Michirones are dried broad beans stewed with chorizo and ham bone, Murcia\'s emblematic barrack-style dish, of Mudéjar origin.' },
  { type:'fact', es:'La Dama de Baza es una escultura íbera del siglo IV a.C. encontrada en el Cerro del Santuario en 1971: hoy en el Museo Arqueológico Nacional.', en:'The Lady of Baza is a 4th-century BC Iberian sculpture unearthed in 1971 at the Cerro del Santuario, now at the National Archaeological Museum.' },
  { type:'fact', es:'Los Baños Árabes de Baza son los mejor conservados del sur de Granada: del siglo XIII, con decoraciones originales todavía visibles.', en:'Baza\'s Arab Baths are the best preserved in southern Granada: 13th-century, with original decoration still visible.' },
  { type:'fact', es:'La fiesta del Cascamorras une Baza y Guadix cada 6 de septiembre: un hombre intenta robar una virgen mientras los vecinos lo cubren de aceite negro.', en:'The Cascamorras festival links Baza and Guadix on 6 September, one man tries to steal a Virgin statue while locals cover him in black oil.' },
  { type:'fact', es:'Guadix tiene el segundo barrio troglodita más grande de Europa: más de 2.000 cuevas habitadas con chimeneas blancas asomando por los cerros.', en:'Guadix has Europe\'s second-largest troglodyte quarter: over 2,000 inhabited cave-houses, white chimneys poking out of the hills.' },
  { type:'fact', es:'La Catedral de Guadix se construyó sobre la antigua mezquita aljama: única catedral barroca-mudéjar de Andalucía oriental.', en:'Guadix Cathedral was built over the former main mosque, the only Baroque-Mudéjar cathedral in eastern Andalusia.' },
  { type:'fact', es:'El Geoparque de Granada, único geoparque UNESCO de la Cordillera Bética, es una sucesión de badlands rojizos en Gorafe y Marquesado.', en:'The Granada Geopark, the only UNESCO geopark in the Baetic Range, is a sequence of red badlands across Gorafe and Marquesado.' },
  { type:'fact', es:'En Galera está el mayor yacimiento ibérico de Granada: la necrópolis de Tútugi, con más de 1.500 tumbas excavadas en la ladera.', en:'Galera holds Granada\'s largest Iberian site: the Tútugi necropolis, with over 1,500 tombs cut into the hillside.' },
  { type:'fact', es:'En Orce se encontraron los restos humanos más antiguos de Europa: 1,4 millones de años. Los fósiles dieron al pueblo fama mundial en 1982.', en:'Orce yielded the oldest human remains found in Europe, 1.4 million years old. The fossils brought the village world fame in 1982.' },
  { type:'fact', es:'La Sierra de Castril tiene el cañón fluvial más profundo de Andalucía oriental: paredes verticales de 200 m sobre el río Castril.', en:'The Sierra de Castril has eastern Andalusia\'s deepest river canyon, 200-m vertical walls along the Castril river.' },
  { type:'fact', es:'Huéscar es la única ciudad de España "técnicamente en guerra" con Dinamarca durante 172 años: declarada en 1809 por Napoleón, paz firmada en 1981.', en:'Huéscar was the only Spanish town "technically at war" with Denmark for 172 years: declared in 1809 in the Napoleonic era, peace finally signed in 1981.' },
  { type:'fact', es:'La Puebla de Don Fadrique (Huéscar) está a 1.143 m de altitud, uno de los municipios andaluces más altos con actividad agrícola tradicional.', en:'La Puebla de Don Fadrique (Huéscar) sits at 1,143 m, among Andalusia\'s highest towns with active traditional farming.' },
  { type:'fact', es:'En la Cueva del Agua de Tíscar (Sierra de Castril) nace un río subterráneo: bóveda de 12 m que sirvió de capilla rupestre cristiana en el siglo XV.', en:'A subterranean river rises in Tíscar Cave (Sierra de Castril), its 12-m vault served as a Christian rock chapel in the 15th century.' },
  { type:'fact', es:'Castril guarda uno de los pueblos blancos más altos de Andalucía oriental (1.000 m): visto desde el embalse, parece pegado al cielo.', en:'Castril is one of eastern Andalusia\'s highest whitewashed villages (1,000 m): viewed from the reservoir, it seems glued to the sky.' },
  { type:'fact', es:'El embalse de Negratín (Granada oriental) es el segundo lago artificial más grande de Andalucía: aguas verde turquesa en pleno paisaje árido.', en:'The Negratín reservoir (eastern Granada) is Andalusia\'s second-largest artificial lake, turquoise water in the middle of arid landscape.' },
  { type:'fact', es:'En las cumbres de Sierra Nevada, vertiente granadina, quedan los últimos glaciares fósiles del sur de Europa: el Veleta y el Mulhacén.', en:'Sierra Nevada\'s Granada slopes hold southern Europe\'s last fossil glaciers, Veleta and Mulhacén.' },
  { type:'fact', es:'El Mulhacén (3.482 m) es el techo de la península ibérica y el tercer pico más alto de Europa occidental tras Mont Blanc y Monte Rosa.', en:'Mulhacén (3,482 m) is the highest peak on the Iberian Peninsula and Western Europe\'s third-highest after Mont Blanc and Monte Rosa.' },
  { type:'fact', es:'Sierra Nevada tiene la única estación de esquí del sur de Europa donde se puede esquiar viendo el mar Mediterráneo desde la pista.', en:'Sierra Nevada is the only ski resort in southern Europe where you can ski with a view of the Mediterranean Sea.' },
  { type:'fact', es:'La cara este de Sierra Nevada (vertiente almeriense) es mucho más árida que la oeste: el Mulhacén divide dos climas radicalmente distintos.', en:'Sierra Nevada\'s eastern (Almerian) slope is far drier than the western, Mulhacén splits two radically different climates.' },
  { type:'fact', es:'La Alpujarra granadina y la almeriense comparten arquitectura: tinaos (pasadizos cubiertos sobre las calles), terrazas y lavaderos comunales.', en:'Granadan and Almerian Alpujarras share architecture: tinaos (covered passageways over streets), terraced fields and communal washhouses.' },
  { type:'fact', es:'En la Alpujarra granadina (Trevélez, Bubión, Pampaneira) curan el jamón a 1.500 m de altitud: secado al aire seco de la sierra.', en:'In the Granada Alpujarra (Trevélez, Bubión, Pampaneira), ham is cured at 1,500 m, dried by the mountain\'s dry air.' },
  { type:'fact', es:'El Jamón de Trevélez es el único jamón curado a más altitud de Europa con D.O. propia: solo se cura entre noviembre y abril por el frío seco.', en:'Trevélez ham is Europe\'s highest-altitude PDO cured ham, produced only between November and April when the dry cold is right.' },
  { type:'fact', es:'En Cogollos de Guadix, sobre la sierra del Mencal, se conservan los únicos hipogeos romanos del sureste peninsular descubiertos hasta hoy.', en:'In Cogollos de Guadix, atop the Mencal range, lie the only Roman hypogea so far discovered in southeastern Iberia.' },
  { type:'fact', es:'En la cueva de las Ventanas (Píñar, Granada oriental) están las "perlas de cueva" más grandes de Europa: esferas de calcita de hasta 2 cm.', en:'Píñar\'s Cueva de las Ventanas (eastern Granada) holds Europe\'s largest cave pearls, calcite spheres up to 2 cm across.' },
  { type:'fact', es:'Almería, Murcia y Granada oriental conforman el "triángulo más seco de Europa": menos de 300 mm de lluvia anual en todo el territorio interior.', en:'Almería, Murcia and eastern Granada form Europe\'s "driest triangle", less than 300 mm of annual rain across all the inland area.' },
  { type:'fact', es:'El cielo nocturno entre Sierra Nevada y Cabo de Gata es de los más oscuros de Europa: certificación Starlight para astrofotografía profesional.', en:'The night sky between Sierra Nevada and Cabo de Gata is among Europe\'s darkest, Starlight-certified for professional astrophotography.' },
  { type:'fact', es:'El monasterio de la Encarnación (Huelma, Jaén oriental, frontera con Granada) inspiró a García Lorca en algunos pasajes de "La Casa de Bernarda Alba".', en:'The Encarnación Monastery (Huelma, eastern Jaén near Granada) inspired García Lorca in passages of "The House of Bernarda Alba".' },
  { type:'fact', es:'La trashumancia entre Almería y Granada está documentada desde el siglo XIII: los rebaños de la Alpujarra granadina pasaban el invierno en el Cabo.', en:'Transhumance between Almería and Granada is documented since the 13th century, Granadan Alpujarra flocks wintered in Cabo de Gata.' },
  { type:'fact', es:'Almería y Murcia comparten el río Almanzora hasta que se evapora antes del mar: uno de los pocos ríos europeos sin desembocadura directa.', en:'Almería and Murcia share the Almanzora river until it evaporates before reaching the sea, one of Europe\'s few rivers without a direct mouth.' },
  { type:'fact', es:'Las "casas-cueva" de Guadix, Cuevas del Almanzora y Híjar conservan tradición común desde la repoblación cristiana del siglo XVI.', en:'The cave-houses of Guadix, Cuevas del Almanzora and Híjar share a common tradition dating back to the 16th-century Christian repopulation.' },
  { type:'fact', es:'El conjunto de paisajes áridos del sureste (Tabernas, Gorafe, Marquesado, badlands del Almanzora) es el segundo más extenso de Europa tras Bardenas Reales.', en:'The southeast\'s arid landscapes (Tabernas, Gorafe, Marquesado, Almanzora badlands) form Europe\'s second-largest arid complex after the Bardenas Reales.' },
  { type:'fact', es:'La Sierra de Cazorla, Segura y Las Villas (Jaén, frontera con Granada) tiene el bosque mediterráneo más extenso de España: 209.000 ha.', en:'Cazorla, Segura and Las Villas range (Jaén, on the Granada border) holds Spain\'s largest Mediterranean forest: 209,000 hectares.' },
  { type:'fact', es:'Tres de las cinco capitales más cálidas de España están en este triángulo: Almería, Murcia y Granada batieron 47 °C en agosto de 2021.', en:'Three of Spain\'s five hottest capitals lie in this triangle: Almería, Murcia and Granada all topped 47 °C in August 2021.' },
  { type:'fact', es:'El Geoparque de Cabo de Gata-Níjar (Almería) y el de Granada son los únicos geoparques UNESCO consecutivos de Europa: una excursión los une en un día.', en:'The Cabo de Gata-Níjar Geopark (Almería) and the Granada Geopark are Europe\'s only consecutive UNESCO geoparks, connectable in a day trip.' },
  { type:'fact', es:'La cocina del sureste comparte plato bandera: el cocido tradicional con garbanzos, tocino y morcilla, presente en Almería, Murcia y Granada.', en:'The southeast shares a flagship dish: the traditional cocido of chickpeas, bacon and morcilla: common to Almería, Murcia and Granada.' },
  { type:'fact', es:'El "remojón" almeriense, granadino y murciano es ensalada de naranja, bacalao desmigado y aceitunas negras: fusión gastronómica de tres provincias.', en:'The "remojón" of Almería, Granada and Murcia is an orange, salt-cod and black-olive salad, a gastronomic fusion of three provinces.' },
  { type:'fact', es:'Las almendras del Almanzora (Almería) y de Albanchez (Granada) abastecen a la mayor parte del turrón blando de Jijona: cosecha septiembre-octubre.', en:'Almonds from the Almanzora (Almería) and Albanchez (Granada) supply most of Jijona\'s soft turrón, harvested in September–October.' },
  { type:'fact', es:'La cocina de los nazaríes seguía viva en Almería y Granada hasta 1571: hoy se reconstruye en restaurantes históricos como El Bosque del Lobo (Granada).', en:'Nasrid cuisine survived in Almería and Granada until 1571, today reconstructed in historic restaurants such as El Bosque del Lobo (Granada).' },
  { type:'fact', es:'Hacia oriente, Almería, Murcia y Granada tienen el mayor número de horas de sol al año de toda Europa: más de 3.200 horas anuales.', en:'Almería, Murcia and Granada record Europe\'s highest annual sunshine totals: over 3,200 hours per year.' },
  { type:'fact', es:'La oliva picual del Almanzora se prensa en Tahal, Bayarque y Albanchez para producir aceite virgen extra de alta acidez baja, premiado en Europa.', en:'Picual olives from the Almanzora are pressed in Tahal, Bayarque and Albanchez into low-acidity extra-virgin oils, repeatedly awarded in Europe.' },
  { type:'fact', es:'El Cante de las Minas (La Unión, Murcia) es el certamen flamenco más prestigioso del mundo: nació en 1961 cuando los mineros del cabo cantaban tras la jornada.', en:'La Unión\'s Cante de las Minas (Murcia) is the world\'s most prestigious flamenco contest, born in 1961 from the songs of cape miners after their shift.' },
  { type:'fact', es:'El Día de Santa Cecilia se celebra en Murcia y Almería con bandas de música por la calle: tradición compartida desde el siglo XIX.', en:'St Cecilia\'s Day is celebrated in Murcia and Almería with marching bands in the streets, a shared tradition since the 19th century.' },
  { type:'fact', es:'El cerro del Almirez (Sierra de los Filabres) tuvo el primer asentamiento humano del Calcolítico almeriense: 4.500 años a.C., junto a Los Millares.', en:'Cerro del Almirez (Filabres range) hosted Almería\'s earliest Chalcolithic settlement: 4,500 BC, alongside Los Millares.' },
];

const FRASES_HOGAR = [
  {
    type: 'quote',
    es: '«El hogar no es un lugar. Es un sentimiento.»',
    en: '«Home is not a place. It is a feeling.»',
    attr: '– Cecelia Ahearn',
  },
  {
    type: 'quote',
    es: '«El hogar es donde está el corazón.»',
    en: '«Home is where the heart is.»',
    attr: '– Plinio el Viejo',
  },
  {
    type: 'quote',
    es: '«No hay lugar como el hogar.»',
    en: '«There is no place like home.»',
    attr: '– L. Frank Baum, El Mago de Oz',
  },
  {
    type: 'quote',
    es: '«El hogar es el refugio del alma.»',
    en: '«The home is the refuge of the soul.»',
    attr: '– Gaston Bachelard',
  },
  {
    type: 'quote',
    es: '«Donde haya amor, allí está el hogar.»',
    en: '«Where there is love, there is home.»',
    attr: '– Leon Tolstoy',
  },
  {
    type: 'quote',
    es: '«Una casa se construye con ladrillos y vigas; un hogar se edifica con amor y sueños.»',
    en: '«A house is made of walls and beams; a home is built with love and dreams.»',
    attr: '– William Arthur Ward',
  },
  {
    type: 'quote',
    es: '«El buen huésped deja el lugar mejor de como lo encontró.»',
    en: '«A good guest leaves a place better than they found it.»',
    attr: '– Proverbio / Proverb',
  },
  {
    type: 'quote',
    es: '«Volver a casa es la forma más agradable de viajar.»',
    en: '«Returning home is the sweetest of all journeys.»',
    attr: '– Fanny Burney',
  },
  {
    type: 'quote',
    es: '«Necesito el mar porque me enseña. No sé si aprendo música o conciencia: no sé si es ola sola o ser profundo, o sólo ronca voz o deslumbrante suposición de peces y navíos.»',
    en: '«I need the sea because it teaches me. I don\'t know if I learn music or awareness, if it is wave alone or deep being, or only hoarse voice or dazzling assumption of fish and ships.»',
    attr: '– Pablo Neruda',
  },
  {
    type: 'quote',
    es: '«El descanso no es holgazanería. Tumbarse en la hierba escuchando el murmullo del agua, contemplar las nubes flotando, no es perder el tiempo.»',
    en: '«Rest is not idleness. To lie sometimes on the grass listening to the murmur of water, or watching clouds float by, is by no means a waste of time.»',
    attr: '– John Lubbock',
  },
  {
    type: 'quote',
    es: '«La cura para todo es agua salada: sudor, lágrimas o el mar.»',
    en: '«The cure for anything is salt water: sweat, tears, or the sea.»',
    attr: '– Isak Dinesen',
  },
  {
    type: 'quote',
    es: '«Vivir bien es la mejor venganza.»',
    en: '«Living well is the best revenge.»',
    attr: '– George Herbert',
  },
  {
    type: 'quote',
    es: '«El mar es todo. Cubre siete décimas partes del globo. Su aliento es puro y vivificante. Es un inmenso desierto donde el hombre nunca está solo.»',
    en: '«The sea is everything. It covers seven-tenths of the globe. Its breath is pure and healthy. It is an immense desert where a man is never alone.»',
    attr: '– Jules Verne',
  },
  {
    type: 'quote',
    es: '«Quien cuida lo que comparte merece disfrutarlo del todo.»',
    en: '«Those who care for what they share deserve to enjoy it fully.»',
    attr: '– Hestía',
  },
  {
    type: 'quote',
    es: '«La vida es lo que pasa mientras estás ocupado haciendo otros planes.»',
    en: '«Life is what happens while you\'re busy making other plans.»',
    attr: '– John Lennon',
  },
  {
    type: 'quote',
    es: '«El arte del descanso es parte del arte del trabajo.»',
    en: '«The art of rest is a part of the art of work.»',
    attr: '– John Steinbeck',
  },
  {
    type: 'quote',
    es: '«Cada lugar que nos acoge bien merece ser cuidado igual de bien.»',
    en: '«Every place that welcomes us well deserves to be cared for just as well.»',
    attr: '– Hestía',
  },
  {
    type: 'quote',
    es: '«El verano tiene su propia eternidad.»',
    en: '«Summer has its own eternity.»',
    attr: '– Charles Bowden',
  },
  {
    type: 'quote',
    es: '«No hay nada como quedarse en casa para sentirse de verdad cómodo.»',
    en: '«There is nothing like staying at home for real comfort.»',
    attr: '– Jane Austen',
  },
  {
    type: 'quote',
    es: '«No hace falta irse lejos para descubrir un lugar diferente. Hace falta llegar con los ojos abiertos.»',
    en: '«You need not go far to discover a different place. You just need to arrive with open eyes.»',
    attr: '– Hestía',
  },
  {
    type: 'quote',
    es: '«El verdadero descanso es sentir que el tiempo no corre.»',
    en: '«True rest is the feeling that time is not running.»',
    attr: '– Marty Rubin',
  },
  {
    type: 'quote',
    es: '«El sol, el mar y la brisa, la trinidad del bienestar mediterráneo.»',
    en: '«Sun, sea and breeze, the Mediterranean trinity of wellbeing.»',
    attr: '– Hestía',
  },
  {
    type: 'quote',
    es: '«Lo que el sol es para las flores, el amor lo es para el alma humana.»',
    en: '«What the sun is to the flowers, love is to the human soul.»',
    attr: '– Joseph Addison',
  },
  {
    type: 'quote',
    es: '«El espíritu no puede ser permanentemente negado. Se reafirma, aunque indirectamente, en cada acto de reposo.»',
    en: '«The spirit cannot be permanently denied. It reasserts itself, though indirectly, in every act of rest.»',
    attr: '– Aldous Huxley',
  },
  {
    type: 'quote',
    es: '«La felicidad es un lugar entre demasiado poco y demasiado mucho.»',
    en: '«Happiness is a place between too little and too much.»',
    attr: '– Proverbio finlandés',
  },
];

// ── Datos curiosos exclusivos para la home ──
const SABIAS_QUE_HOME_FACTS = [
  /* Cabo de Gata */
  {
    es: 'El Parque Natural Cabo de Gata-Níjar es de origen volcánico: sus acantilados negros son magma solidificado del fondo del mar hace millones de años.',
    en: 'The Cabo de Gata-Níjar Natural Park is volcanic in origin: its black cliffs are solidified magma from the ocean floor, millions of years old.',
  },
  {
    es: 'La Reserva Marina de Cabo de Gata tiene la mayor visibilidad submarina del Mediterráneo occidental: hasta 40 metros de profundidad a simple vista.',
    en: 'The Cabo de Gata Marine Reserve has the highest underwater visibility in the western Mediterranean, up to 40 metres of clear water.',
  },
  {
    es: 'La Playa de los Genoveses, en Cabo de Gata, figura entre las 10 playas más vírgenes de Europa según National Geographic.',
    en: 'Playa de los Genoveses in Cabo de Gata is listed by National Geographic among the 10 most pristine beaches in Europe.',
  },
  {
    es: 'La Playa de Mónsul fue escenario de una escena de "Indiana Jones y la Última Cruzada". Sus dunas de roca volcánica son únicas en el mundo.',
    en: 'Playa de Mónsul was used in "Indiana Jones and the Last Crusade". Its volcanic rock dunes exist nowhere else on Earth.',
  },
  {
    es: 'La Cala de San Pedro, en Cabo de Gata, solo es accesible a pie o en barco. En su interior existe una aldea habitada desde los años 70 sin luz eléctrica de red.',
    en: 'Cala de San Pedro in Cabo de Gata is only reachable on foot or by boat. Inside, a village has been inhabited since the 1970s with no mains electricity.',
  },
  {
    es: 'Las Negras, en Cabo de Gata, tiene la única playa de arena volcánica negra del Mediterráneo español. Sus arenas calientan el agua circundante hasta 4 °C más que las playas vecinas.',
    en: 'Las Negras in Cabo de Gata has the only black volcanic sand beach on the Spanish Mediterranean. Its sands warm the surrounding water up to 4 °C more than nearby beaches.',
  },
  {
    es: 'El Parque Natural Cabo de Gata alberga más de 20 especies vegetales endémicas que no existen en ningún otro lugar del planeta. Algunas crecen en un radio de apenas 5 kilómetros.',
    en: 'Cabo de Gata Natural Park is home to over 20 endemic plant species that exist nowhere else on Earth. Some grow only within a 5-kilometre radius.',
  },
  /* Zona hacia Murcia */
  {
    es: 'Águilas, a 40 minutos hacia Murcia, tiene 38 playas en menos de 30 kilómetros, la mayor densidad de calas vírgenes del litoral mediterráneo español.',
    en: 'Águilas, 40 minutes towards Murcia, has 38 beaches in under 30 kilometres, the highest density of wild coves on the Spanish Mediterranean coast.',
  },
  {
    es: 'Cabo Tiñoso, entre Cartagena y Mazarrón, es el único paraje del Mediterráneo europeo donde la tierra cae al mar desde 400 metros de altura sin ningún acceso rodado.',
    en: 'Cabo Tiñoso, between Cartagena and Mazarrón, is the only place on the European Mediterranean where land drops into the sea from 400 metres with no road access.',
  },
  {
    es: 'Las minas romanas de Mazarrón extrajeron plata y plomo durante más de 500 años. Sus yacimientos submarinos conservan ánforas y pecios intactos de hace 2.000 años.',
    en: 'The Roman mines at Mazarrón extracted silver and lead for over 500 years. Their underwater sites preserve intact amphorae and shipwrecks 2,000 years old.',
  },
  /* Pueblos */
  {
    es: 'Mojácar, a 15 minutos de Vera, es uno de los pueblos más fotografiados del Mediterráneo, un cubo blanco sobre roca que Salvador Dalí describió como "el surrealismo natural".',
    en: 'Mojácar, 15 minutes from Vera, is one of the most photographed villages in the Mediterranean, a white cube on rock that Salvador Dalí described as "natural surrealism".',
  },
  {
    es: 'Bédar, a 20 minutos hacia el interior, tiene 400 habitantes y más de 500 extranjeros empadronados que eligieron sus casas blancas para vivir. Uno de los pueblos más cosmopolitas por habitante de España.',
    en: 'Bédar, 20 minutes inland, has 400 inhabitants and over 500 registered foreign residents who chose its white houses as home. One of the most cosmopolitan villages per capita in Spain.',
  },
  {
    es: 'Sorbas, a 30 minutos de Vera, tiene el sistema de cuevas de yeso más extenso y mejor conservado de Europa, con más de 1.000 cavidades.',
    en: 'Sorbas, 30 minutes from Vera, has the most extensive and best-preserved gypsum cave system in Europe, with over 1,000 cavities.',
  },
  /* Playas */
  {
    es: 'Las playas de Cabo de Gata tienen el agua con mayor transparencia de España: hasta 30 metros de visibilidad en días sin viento. El turquesa de sus calas figura entre los más intensos del Mediterráneo.',
    en: 'Cabo de Gata beaches have the clearest water in Spain: up to 30 metres of visibility on calm days. The turquoise of their coves is ranked among the most intense in the Mediterranean.',
  },
  {
    es: 'El litoral entre Vera Playa y Cabo de Gata no tiene ninguna plataforma petrolífera ni central eléctrica a la vista. Es uno de los pocos horizontes marítimos completamente vírgenes de España.',
    en: 'The coastline between Vera Playa and Cabo de Gata has no oil platform or power plant visible on the horizon, one of the few completely unspoilt maritime views in Spain.',
  },
  /* Gastronomía */
  {
    es: 'Garrucha, a 5 minutos de Vera, tiene la lonja de gambas rojas más importante del Mediterráneo. La gamba roja de Garrucha es considerada la mejor del mundo por los chefs más premiados de España.',
    en: 'Garrucha, 5 minutes from Vera, has the Mediterranean\'s most important red prawn market. The Garrucha red prawn is considered the world\'s finest by Spain\'s most acclaimed chefs.',
  },
  {
    es: 'El tomate raf de Almería, el tomate más premiado de España, se cultiva en los invernaderos del entorno de Vera y se exporta a los mejores restaurantes de Europa.',
    en: 'Almería\'s raf tomato, Spain\'s most award-winning tomato, is grown in greenhouses around Vera and exported to Europe\'s finest restaurants.',
  },
  {
    es: 'La pipirrana almeriense: tomate, pepino, pimiento y atún en aceite, lleva más de tres generaciones cocinándose igual en las casas de Vera. El plato de verano más refrescante del Mediterráneo.',
    en: 'Almería\'s pipirrana: tomato, cucumber, pepper and tuna in oil, has been cooked the same way in Vera homes for over three generations. The Mediterranean\'s most refreshing summer dish.',
  },
  {
    es: 'La ñora, el pimentón seco que da sabor a la paella auténtica, se cultiva y seca al sol entre Almería y Murcia. Sin ñora, no hay paella.',
    en: 'The ñora, the dried pepper that flavours authentic paella, is grown and sun-dried between Almería and Murcia. Without ñora, there is no paella.',
  },
  /* Clima */
  {
    es: 'En Vera Playa, la temperatura media de enero es de 13 °C: más cálida que Niza, Cannes o Montpellier en pleno invierno.',
    en: 'In Vera Playa, the average January temperature is 13 °C: warmer than Nice, Cannes or Montpellier in the depths of winter.',
  },
  {
    es: 'Vera Playa recibe una media de 230 mm de lluvia al año: menos que Madrid, menos que Roma y una fracción de lo que llueve en el norte de España.',
    en: 'Vera Playa receives an average of 230 mm of rain a year: less than Madrid, less than Rome, and a fraction of what falls in northern Spain.',
  },
  /* Mar */
  {
    es: 'El Mediterráneo frente a Almería es el más cálido de toda la cuenca occidental. En verano, la temperatura del agua no baja de 24 °C ni de noche.',
    en: 'The Mediterranean off Almería is the warmest in the entire western basin. In summer, water temperature never drops below 24 °C, even at night.',
  },
  {
    es: 'La pradera de posidonia de Vera Playa produce entre 10 y 15 litros de oxígeno por m² al día. Es el pulmón subacuático del Mediterráneo occidental.',
    en: 'The posidonia meadow off Vera Playa produces 10 to 15 litres of oxygen per square metre each day, the underwater lung of the western Mediterranean.',
  },
  /* Fauna */
  {
    es: 'El tramo de mar entre Vera Playa y la costa norte de África es una de las rutas habituales de los delfines mular del Mediterráneo. Se avistan frecuentemente desde los barcos de Garrucha.',
    en: 'The stretch of sea between Vera Playa and the North African coast is a regular route for Mediterranean bottlenose dolphins, frequently spotted from Garrucha\'s boats.',
  },
  {
    es: 'La tortuga boba (Caretta caretta) nidifica en las playas del sur de Almería desde hace siglos. Las arenas finas de Vera Playa forman parte de su área de cría mediterránea.',
    en: 'The loggerhead sea turtle (Caretta caretta) has nested on southern Almería beaches for centuries. Vera Playa\'s fine sands are part of its Mediterranean nesting range.',
  },
  {
    es: 'El águila de Bonelli, una de las rapaces más amenazadas de Europa, anida en los acantilados de Cabo de Gata. Vera Playa es uno de los pocos lugares donde puede verse sobrevolar el mar.',
    en: 'Bonelli\'s eagle, one of Europe\'s most threatened raptors, nests in the Cabo de Gata cliffs. Vera Playa is one of the few places where it can be seen soaring over the sea.',
  },
  /* Flora */
  {
    es: 'El esparto que crece salvaje en el campo de Vera fue la base de la economía rural almeriense durante siglos. Con él se fabricaban cestos, cuerdas y algunos de los primeros papeles de la historia.',
    en: 'The esparto grass growing wild in the Vera countryside was the backbone of Almería\'s rural economy for centuries: used to make baskets, ropes, and some of history\'s earliest paper.',
  },
  {
    es: 'El azufaifo, el árbol más resistente a la sequía de Europa, crece de forma natural en los campos de Vera. Sus frutos fueron alimento cotidiano de fenicios, griegos y romanos en el Mediterráneo.',
    en: 'The jujube, Europe\'s most drought-resistant tree, grows naturally in the Vera countryside. Its fruits were a daily staple for Phoenicians, Greeks and Romans across the Mediterranean.',
  },
  /* Belleza / paisaje */
  {
    es: 'El atardecer desde Cabo de Gata tiñe el cielo de naranja, rosa y violeta durante más de 45 minutos seguidos. Los fotógrafos lo llaman "la hora dorada más larga de Europa".',
    en: 'The sunset from Cabo de Gata turns the sky orange, pink and violet for over 45 continuous minutes. Photographers call it "Europe\'s longest golden hour".',
  },
  {
    es: 'El desierto de Tabernas y el Mediterráneo se ven simultáneamente desde el Cabo de Gata: dos paisajes que no coexisten en ningún otro punto del planeta a tan poca distancia.',
    en: 'The Tabernas Desert and the Mediterranean are visible simultaneously from Cabo de Gata, two landscapes that coexist nowhere else on the planet at such close range.',
  },
  {
    es: 'La Alcazaba de Almería, construida en el siglo X, fue la mayor fortaleza árabe de España en su época, incluso más extensa que la Alhambra de Granada.',
    en: 'The Almería Alcazaba, built in the 10th century, was the largest Arab fortress in Spain at the time, even more extensive than the Alhambra in Granada.',
  },
  /* Datos espaciales: latitud, posición, coordenadas */
  {
    es: 'Vera Playa se sitúa a 37° 14′ N, 1° 47′ O: exactamente la misma latitud que Atenas, Sevilla, Argel y San Francisco.',
    en: 'Vera Playa sits at 37° 14′ N, 1° 47′ W: exactly the same latitude as Athens, Seville, Algiers and San Francisco.',
  },
  {
    es: 'Vera Playa está a menos de 200 km de la costa africana. Está más cerca de Argelia que de Madrid.',
    en: 'Vera Playa is less than 200 km from the African coast. It is closer to Algeria than to Madrid.',
  },
  {
    es: 'Vera Playa está a cero metros sobre el nivel del mar, literalmente al nivel del Mediterráneo. El pueblo de Vera, a 10 minutos tierra adentro, se eleva a 105 metros entre cítricos y olivares.',
    en: 'Vera Playa sits at zero metres above sea level, literally at Mediterranean level. The town of Vera, 10 minutes inland, rises to 105 metres above citrus groves and olive fields.',
  },
  {
    es: 'Por su longitud (1° 47′ O), en Vera Playa el sol de verano se pone a las 21:30 en hora oficial, pero el reloj solar marca las 20:00. Casi dos horas extra de luz vespertina que no existen en el centro de Europa.',
    en: 'Due to its longitude (1° 47′ W), summer sunsets in Vera Playa happen at 21:30 by the clock, but the sun says 20:00. Nearly two extra hours of evening light that do not exist in central Europe.',
  },
  {
    es: 'Vera Playa queda en la zona subtropical del hemisferio norte: la misma franja climática que el Sahara, el desierto de Atacama y el de Gobi. Es el único rincón de Europa con esa clasificación real.',
    en: 'Vera Playa lies in the subtropical zone of the northern hemisphere: the same climatic band as the Sahara, Atacama and Gobi deserts. It is the only corner of Europe with that genuine classification.',
  },
  {
    es: 'Desde Vera Playa: 90 km a Almería capital, 550 km a Madrid, 700 km a Barcelona, 780 km a Casablanca. Más cerca de Marruecos que de la capital de España.',
    en: 'From Vera Playa: 90 km to Almería, 550 km to Madrid, 700 km to Barcelona, 780 km to Casablanca. Closer to Morocco than to the Spanish capital.',
  },
  {
    es: 'El municipio de Vera ocupa el vértice sureste de la España peninsular. 40 km al sur empieza Cabo de Gata; 60 km al norte, la Sierra de las Estancias ya supera los 1.200 metros.',
    en: 'The municipality of Vera sits at the southeastern vertex of mainland Spain. 40 km south begins Cabo de Gata; 60 km north, the Sierra de las Estancias already exceeds 1,200 metres.',
  },
  /* Lugares pintorescos y visitables */
  {
    es: 'La Geoda de Pulpí, a 30 minutos de Vera, es la mayor geoda visitable del mundo: 11 metros de largo, cristales de selenita de hasta 2 metros. Solo accesible en grupos de 10 personas.',
    en: 'The Pulpí Geode, 30 minutes from Vera, is the largest accessible geode in the world: 11 metres long, selenite crystals up to 2 metres. Access limited to groups of 10.',
  },
  {
    es: 'El Observatorio Astronómico de Calar Alto, a 1 hora de Vera en la Sierra de los Filabres, tiene el mayor telescopio óptico de España (3,5 m) y más de 300 noches despejadas al año.',
    en: 'The Calar Alto Astronomical Observatory, 1 hour from Vera in the Sierra de los Filabres, has Spain\'s largest optical telescope (3.5 m) and over 300 clear nights a year.',
  },
  {
    es: 'La Sierra Cabrera, entre Mojácar y Vera, alcanza los 432 metros sobre el mar. Desde sus crestas se ven a la vez el Mediterráneo, el desierto de Tabernas y Sierra Nevada.',
    en: 'The Sierra Cabrera, between Mojácar and Vera, reaches 432 metres above sea level. From its ridges you can see simultaneously the Mediterranean, the Tabernas Desert and Sierra Nevada.',
  },
  {
    es: 'El Castillo de Vélez Blanco, a 1 hora de Vera, es uno de los castillos del Renacimiento más importantes de España. Su patio original fue vendido y está hoy en el Metropolitan Museum de Nueva York.',
    en: 'Vélez Blanco Castle, 1 hour from Vera, is one of Spain\'s finest Renaissance castles. Its original patio was sold and now stands inside the Metropolitan Museum of Art in New York.',
  },
  {
    es: 'El Cortijo del Fraile, a 45 minutos de Vera en Níjar, es el escenario real del crimen que inspiró "Bodas de Sangre" de Federico García Lorca. Hoy se puede visitar en ruinas.',
    en: 'Cortijo del Fraile, 45 minutes from Vera in Níjar, is the real-life scene of the crime that inspired García Lorca\'s "Blood Wedding". The ruins are open to visitors today.',
  },
  {
    es: 'La Playa de los Muertos, cerca de Carboneras y a 30 minutos de Vera, tiene aguas tan transparentes que el fondo se ve a 15 metros de profundidad desde la superficie. Figura en todas las listas de playas vírgenes de España.',
    en: 'Playa de los Muertos, near Carboneras and 30 minutes from Vera, has water so clear the bottom is visible 15 metres down from the surface. It appears on every list of Spain\'s wildest beaches.',
  },
  {
    es: 'Rodalquilar, en Cabo de Gata, alberga una mina de oro abandonada de los años 40. Sus instalaciones industriales entre volcanes y mar forman uno de los paisajes más surrealistas de Europa.',
    en: 'Rodalquilar in Cabo de Gata holds an abandoned 1940s gold mine. Its industrial plant set between volcanoes and sea creates one of the most surreal landscapes in Europe.',
  },
  {
    es: 'La Isleta del Moro, en Cabo de Gata, es un pueblo de pescadores con menos de 60 habitantes donde el tiempo parece detenido. Una de las aldeas costeras más fotogénicas del Mediterráneo.',
    en: 'Isleta del Moro in Cabo de Gata is a fishing village of fewer than 60 inhabitants where time seems to stand still. One of the most photogenic coastal hamlets in the Mediterranean.',
  },
  {
    es: 'Villaricos, a 10 minutos de Vera, fue una de las ciudades fenicias y romanas más importantes del sureste peninsular. Sus necrópolis y restos de murallas llevan 2.700 años junto al mar.',
    en: 'Villaricos, 10 minutes from Vera, was one of the most important Phoenician and Roman cities in southeastern Iberia. Its necropolises and wall remains have stood by the sea for 2,700 years.',
  },
  {
    es: 'Las minas de plata de Bédar, a 20 minutos de Vera, se explotaron desde la época romana hasta el siglo XX. Sus escombreras de colores siguen tiñendo la sierra de tonos oxidados y violáceos.',
    en: 'The Bédar silver mines, 20 minutes from Vera, were worked from Roman times until the 20th century. Their coloured spoil heaps still stain the hillside in shades of rust and violet.',
  },
  /* Más playas impresionantes */
  {
    es: 'El Playazo de Rodalquilar tiene una torre vigía del siglo XVIII construida para defender la costa de los piratas berberiscos. Es una de las playas más espectaculares y menos masificadas de todo Cabo de Gata.',
    en: 'El Playazo de Rodalquilar has an 18th-century watchtower built to defend the coast from Barbary pirates. It is one of the most spectacular and least-crowded beaches in all of Cabo de Gata.',
  },
  {
    es: 'La Cala del Plomo, en Cabo de Gata, solo es accesible a pie (1 hora de caminata) o en barco. Es la playa más aislada del parque natural y una de las más vírgenes del Mediterráneo.',
    en: 'Cala del Plomo in Cabo de Gata is only reachable on foot (1 hour\'s walk) or by boat: the most isolated beach in the natural park, one of the most pristine in the Mediterranean.',
  },
  {
    es: 'Las Cuatro Calas de Águilas: Cala Cerrada, Cala Carolina, Cala Palmera y Cala del Pino, son cuatro playas consecutivas de aguas cristalinas sin acceso rodado. A solo 40 km de Vera.',
    en: 'The Cuatro Calas of Águilas: Cala Cerrada, Cala Carolina, Cala Palmera and Cala del Pino, are four consecutive crystal-clear coves with no road access. Just 40 km from Vera.',
  },
  /* Más pueblos pintorescos */
  {
    es: 'Aguamarga, a 35 minutos de Vera, es uno de los pueblos de Cabo de Gata más pequeños con acceso rodado: menos de 50 habitantes en invierno. Sin bancos, sin cadenas de restaurantes, sin semáforos.',
    en: 'Aguamarga, 35 minutes from Vera, is one of Cabo de Gata\'s smallest road-accessible villages: fewer than 50 inhabitants in winter. No banks, no chain restaurants, no traffic lights.',
  },
  {
    es: 'San José, en Cabo de Gata, es el pueblo base del parque natural. Desde su puerto salen los barcos hacia calas inaccesibles por tierra. Sus fondos son algunos de los más biodiversos del Mediterráneo occidental.',
    en: 'San José in Cabo de Gata is the natural park\'s main village. From its harbour, boats depart to coves unreachable by road. Its seabed ranks among the most biodiverse in the western Mediterranean.',
  },
  {
    es: 'Níjar, a 40 minutos de Vera, es la capital artesanal de Almería. Sus talleres de cerámica y esparto llevan produciendo con la misma técnica desde el siglo XV: sin moldes industriales, sin cambiar el método.',
    en: 'Níjar, 40 minutes from Vera, is Almería\'s craft capital. Its ceramic and esparto workshops have used the same technique since the 15th century: no industrial moulds, method unchanged.',
  },
  /* Lugares singulares */
  {
    es: 'El Faro de Cabo de Gata fue construido en 1863 y es el más antiguo en activo de la provincia. A su alrededor, las salinas albergan flamencos rosados, avocetas y martinetes todo el año.',
    en: 'The Cabo de Gata lighthouse was built in 1863 and is the oldest active lighthouse in the province. Around it, the salt flats shelter pink flamingos, avocets and night herons year-round.',
  },
  {
    es: 'La Cueva de Ambrosio, en Vélez Blanco (1 hora de Vera), tiene pinturas rupestres de más de 15.000 años de antigüedad, Patrimonio Mundial y uno de los yacimientos paleolíticos más importantes del sur de Europa.',
    en: 'Cueva de Ambrosio in Vélez Blanco (1 hour from Vera) holds cave paintings over 15,000 years old, a World Heritage site and one of the most important Palaeolithic art sites in southern Europe.',
  },
  {
    es: 'Fort Bravo y Mini Hollywood, en el Desierto de Tabernas (1 hora de Vera), fueron los platós donde se rodaron "El Bueno, el Feo y el Malo", "Lawrence de Arabia" y más de 600 westerns espagueti.',
    en: 'Fort Bravo and Mini Hollywood in the Tabernas Desert (1 hour from Vera) were the sets for "The Good, the Bad and the Ugly", "Lawrence of Arabia" and over 600 spaghetti westerns.',
  },
  {
    es: 'El Arco del Agua, en el Valle de Aguas (Sorbas), es un arco natural de yeso de 15 metros de altura, uno de los paisajes geológicos más espectaculares y menos conocidos del sur de Europa.',
    en: 'The Arco del Agua in the Valle de Aguas (Sorbas) is a natural gypsum arch 15 metres high, one of the most spectacular and least-known geological landscapes in southern Europe.',
  },
  /* Clima y naturaleza */
  {
    es: 'La Sierra Nevada, con cumbres de más de 3.400 metros, se ve desde la playa de Vera en los días claros de invierno. Solo 80 km separan el Mediterráneo del glaciar más meridional de Europa.',
    en: 'Sierra Nevada, with peaks above 3,400 metres, is visible from Vera beach on clear winter days. Just 80 km separate the Mediterranean from Europe\'s southernmost glacier.',
  },
  {
    es: 'El Valle del Almanzora, a 30 minutos de Vera, florece en marzo con azahar de naranjo y limonero. El olor llega a la playa los días de poniente, uno de los fenómenos olfativos más sorprendentes de España.',
    en: 'The Almanzora valley, 30 minutes from Vera, blooms in March with orange and lemon blossom. The scent reaches the beach on westerly days, one of Spain\'s most surprising natural perfume events.',
  },
  /* Gastronomía y tradición */
  {
    es: 'Garrucha, a 5 minutos de Vera, tiene el único puerto pesquero de la costa almeriense que mantiene en activo la subasta de pescado a primera hora de la mañana. Puedes asistir como visitante.',
    en: 'Garrucha, 5 minutes from Vera, has the only fishing port on the Almería coast that still holds a live fish auction first thing in the morning. Visitors are welcome.',
  },
  {
    es: 'La almadraba de Cabo de Gata usa la misma trampa de redes laberínticas para atrapar atún rojo que los fenicios diseñaron hace 3.000 años: sin cambiar el método, sin añadir tecnología.',
    en: 'The Cabo de Gata almadraba uses the same labyrinth-net trap for catching bluefin tuna that the Phoenicians devised 3,000 years ago: unchanged method, no technology added.',
  },
  {
    es: 'El Parque Natural de Sierra María-Los Vélez, a 1 hora de Vera, supera los 2.000 metros. Desde sus cimas se ven simultáneamente el Mediterráneo, las sierras subbéticas y el norte de África.',
    en: 'Sierra María-Los Vélez Natural Park, 1 hour from Vera, exceeds 2,000 metres. From its peaks you can see the Mediterranean, the Subbetic ranges and North Africa simultaneously.',
  },
  {
    es: 'La Chanca, barrio histórico de Almería capital, tiene casas-cueva excavadas en el risco rojo de la Alcazaba. Algunas siguen habitadas hoy, igual que hace más de mil años.',
    en: 'La Chanca, Almería city\'s historic quarter, has cave-houses carved into the red rock of the Alcazaba. Some are still inhabited today, just as they were over a thousand years ago.',
  },
  /* Naturalismo / Vera Playa */
  {
    es: 'Vera Playa es la playa naturista más grande de España, más de 5 km de arena sin ropa desde los años 70. Una de las comunidades naturistas más antiguas y numerosas de Europa.',
    en: 'Vera Playa is Spain\'s largest naturist beach, over 5 km of clothes-free sand since the 1970s. One of the oldest and largest naturist communities in Europe.',
  },
  {
    es: 'La playa naturista de Vera fue pionera en España cuando la inauguró en 1979. Hoy recibe más de 200.000 visitantes al año y figura en la guía naturista europea como referencia mediterránea.',
    en: 'Vera\'s naturist beach was a Spanish pioneer when it opened in 1979. Today it attracts over 200,000 visitors a year and is listed as a Mediterranean benchmark in European naturist guides.',
  },
  /* El Indalo */
  {
    es: 'El Indalo, símbolo de Almería, es una figura pintada en la Cueva de los Letreros hace más de 5.000 años. En Almería se cuelga en los balcones como amuleto de protección contra las tormentas.',
    en: 'The Indalo, Almería\'s symbol, is a figure painted in the Cueva de los Letreros over 5,000 years ago. In Almería it hangs from balconies as a charm against storms.',
  },
  /* Invernaderos, agricultura */
  {
    es: 'Los invernaderos de Almería producen el 20 % de la fruta y verdura que consume la Unión Europea. Vistos desde el espacio, forman el área de plástico más grande del planeta: más de 30.000 hectáreas.',
    en: 'Almería\'s greenhouses produce 20% of the fruit and vegetables consumed by the European Union. Seen from space, they form the largest plastic-covered area on Earth: over 30,000 hectares.',
  },
  {
    es: 'El milagro agrícola almeriense: en 1960 era la provincia más pobre de España; en 2025 tiene una de las rentas per cápita más altas del campo español. La invernadero lo cambió todo en 40 años.',
    en: 'The Almería agricultural miracle: in 1960 it was Spain\'s poorest province; by 2025 it has one of the highest rural per capita incomes. The greenhouse changed everything in 40 years.',
  },
  /* Flamenco */
  {
    es: 'El Fandango de Almería es uno de los palos más antiguos del flamenco. Nació en los pueblos mineros del interior y bajó al mar con los jornaleros que construyeron los primeros barrios de Vera Playa.',
    en: 'The Fandango de Almería is one of flamenco\'s oldest styles. It was born in the inland mining villages and reached the sea with the labourers who built the first neighbourhoods of Vera Playa.',
  },
  /* Salinas del Cano */
  {
    es: 'Las Salinas del Cano, cerca de Hestía Salinas, son una reserva de aves catalogada Zona de Especial Protección. En invierno llegan hasta 600 flamencos rosados de una sola vez.',
    en: 'The Salinas del Cano, near Hestía Salinas, are a bird reserve classified as a Special Protection Zone. Up to 600 pink flamingos arrive together in winter.',
  },
  {
    es: 'Las salinas del litoral almeriense llevan produciendo sal para conservar el pescado desde la época fenicia, más de 2.700 años de historia salina ininterrumpida en el mismo litoral.',
    en: 'The Almería coastal salt flats have produced salt for fish preservation since Phoenician times: over 2,700 years of uninterrupted salt-making history on the same shoreline.',
  },
  /* Astronomía / cielos oscuros */
  {
    es: 'Almería tiene los cielos nocturnos más oscuros de España peninsular. Varias comarcas del interior están certificadas como "Starlight Reserve": son de los pocos lugares de Europa donde se ve la Vía Láctea a simple vista.',
    en: 'Almería has the darkest night skies in mainland Spain. Several inland areas are certified Starlight Reserves, among the few places in Europe where the Milky Way is visible to the naked eye.',
  },
  /* Cetáceos */
  {
    es: 'El Estrecho de Gibraltar, a 2 horas de Vera, es el principal corredor de cetáceos de Europa: orcas, ballenas azules, cachalotes, rorcuales comunes y delfines pasan por él cada año.',
    en: 'The Strait of Gibraltar, 2 hours from Vera, is Europe\'s main cetacean corridor: orcas, blue whales, sperm whales, fin whales and dolphins pass through it every year.',
  },
  {
    es: 'El cachalote, el cetáceo más grande con dientes del mundo, se alimenta en las aguas profundas frente a Almería. Sus inmersiones de más de 2.000 metros duran hasta 90 minutos.',
    en: 'The sperm whale, the world\'s largest toothed cetacean, feeds in the deep waters off Almería. Its dives of over 2,000 metres last up to 90 minutes.',
  },
  /* Agave */
  {
    es: 'El agave americano: la pita: florece una sola vez en su vida, entre 20 y 40 años después de brotar. Su tallo alcanza 6 metros en pocas semanas. Una de las vidas vegetales más dramáticas de la flora mediterránea.',
    en: 'The American agave: the pita: flowers only once in its lifetime, between 20 and 40 years after sprouting. Its stalk reaches 6 metres in a matter of weeks. One of the most dramatic life cycles in Mediterranean flora.',
  },
  /* Cine */
  {
    es: 'Juego de Tronos rodó varias escenas de la ciudad de Essos en Almería: el puerto de Pentos, las tierras de Dothrak y la ciudad de Meeren. Almería fue el Orient ficticio de la serie durante 4 temporadas.',
    en: 'Game of Thrones filmed several Essos city scenes in Almería: the port of Pentos, the Dothraki lands and the city of Meereen. Almería served as the series\' fictional Orient for 4 seasons.',
  },
  {
    es: 'Iron Man 3 rodó las escenas de Mandarin en la costa de Almería. El litoral entre Vera y Cabo de Gata ha sido "Asia", "Arabia", "América Latina" y "el Oeste americano" en más de 800 producciones internacionales.',
    en: 'Iron Man 3 filmed the Mandarin scenes on the Almería coast. The shoreline between Vera and Cabo de Gata has stood in for "Asia", "Arabia", "Latin America" and "the American West" in over 800 international productions.',
  },
  /* Viento */
  {
    es: 'El Terral de Vera, viento cálido y seco que baja de la sierra, puede elevar la temperatura 10 °C en pocas horas. Los lugareños lo detectan por el olor a jara y romero que arrastra desde el interior.',
    en: 'The Vera Terral: a warm, dry wind descending from the sierra, can raise temperatures 10 °C in a matter of hours. Locals detect it by the scent of cistus and rosemary it carries from the interior.',
  },
  {
    es: 'El Levante de Almería es el viento más constante del Mediterráneo occidental: puede soplar sin parar durante 3 o 4 días. Los marineros árabes lo llamaban "el viento que empuja hacia Occidente".',
    en: 'The Almería Levante is the most constant wind in the western Mediterranean: it can blow without pause for 3 or 4 days. Arab sailors called it "the wind that pushes toward the West".',
  },
  /* Migración de aves */
  {
    es: 'El litoral almeriense es una de las principales rutas de migración de aves de Europa. Cada otoño, más de un millón de aves rapaces cruzan entre Europa y África sobre el mar frente a Vera Playa.',
    en: 'The Almería coastline is one of Europe\'s main bird migration routes. Every autumn, over a million raptors cross between Europe and Africa over the sea off Vera Playa.',
  },
  /* Historia árabe */
  {
    es: 'Más del 60 % de los topónimos de la provincia de Almería son de origen árabe: Vera (Bayra), Almería (Al-Mariyyat), Mojácar (Muxacra), Garrucha (del árabe para "garrucha de mar"). La lengua árabe está en el paisaje.',
    en: 'Over 60% of Almería\'s place names are of Arabic origin: Vera (Bayra), Almería (Al-Mariyyat), Mojácar (Muxacra), Garrucha (from the Arabic for "sea pulley"). The Arabic language is written in the landscape.',
  },
  {
    es: 'El periodo árabe de Almería (711-1489) duró más de 700 años, más que los 500 años que han pasado desde la conquista castellana. La impronta árabe en la cultura, la cocina y el paisaje es más profunda que cualquier otra.',
    en: 'The Arab period of Almería (711–1489) lasted over 700 years, more than the 500 years since the Castilian conquest. The Arabic imprint on culture, cuisine and landscape runs deeper than any other.',
  },
  /* Terremoto de 1522 */
  {
    es: 'El terremoto de Almería de 1522 fue el más destructivo de la historia de España peninsular. Destruyó casi por completo el casco histórico y parte de la Alcazaba. La ciudad se reconstruyó entera en menos de 20 años.',
    en: 'The 1522 Almería earthquake was the most destructive in mainland Spain\'s history. It almost completely destroyed the historic centre and part of the Alcazaba. The city was fully rebuilt in under 20 years.',
  },
  /* Barca de jábega */
  {
    es: 'La jábega, embarcación de pesca tradicional del Mediterráneo andaluz, se bota al agua a mano desde la playa sin muelle. El arte de botar la jábega lleva más de 2.000 años sin cambiar de técnica.',
    en: 'The jábega, the traditional fishing boat of Andalusian Mediterranean, is launched by hand from the beach without a jetty. The art of launching the jábega has kept the same technique for over 2,000 years.',
  },
  /* Gamba roja, más detalle */
  {
    es: 'La gamba roja de Garrucha vive entre 600 y 1.200 metros de profundidad en el cañón submarino frente a Vera. La riqueza de ese cañón en plancton es lo que le da su sabor único e incomparable.',
    en: 'Garrucha\'s red prawn lives between 600 and 1,200 metres deep in the submarine canyon off Vera. The canyon\'s plankton richness is what gives it its unique, incomparable flavour.',
  },
  /* Mojama */
  {
    es: 'La mojama, atún curado en sal al sol, es el embutido de mar más antiguo del Mediterráneo. Se elabora en Barbate y Isla Cristina, y llega a los mercados de Vera desde hace siglos. Un jamón de atún.',
    en: 'Mojama, salt-cured tuna dried in the sun, is the oldest cured sea product in the Mediterranean. Made in Barbate and Isla Cristina, it has reached Vera\'s markets for centuries. A tuna ham.',
  },
  /* Palometas y peces locales */
  {
    es: 'El pulpo mediterráneo frente a Vera Playa es considerado el mejor de Europa por los cocineros de vanguardia. Su dieta de gambas y crustáceos en el cañón submarino le da una textura imposible de imitar.',
    en: 'The Mediterranean octopus off Vera Playa is considered Europe\'s finest by avant-garde chefs. Its diet of prawns and crustaceans in the submarine canyon gives it a texture impossible to replicate.',
  },
  /* Lentiscos */
  {
    es: 'El lentisco, arbusto perenne de las laderas de Cabo de Gata, produce el mastic griego: la resina que los otomanos mascaban, que perfuma el aguardiente griego y que los fenicios usaban como dentífrico hace 3.500 años.',
    en: 'Lentisk, the evergreen shrub on Cabo de Gata\'s hillsides, produces Greek mastic: the resin the Ottomans chewed, that perfumes Greek spirits and that the Phoenicians used as toothpaste 3,500 years ago.',
  },
  /* Agua dulce */
  {
    es: 'Almería es la única provincia española que bebe más agua desalinizada que agua de lluvia. Su planta desalinizadora de Carboneras es una de las más grandes de Europa y lleva en funcionamiento desde 2003.',
    en: 'Almería is the only Spanish province that drinks more desalinated water than rainwater. Its Carboneras desalination plant is one of Europe\'s largest and has been operating since 2003.',
  },
  /* Frontera natural */
  {
    es: 'El municipio de Vera hace frontera con tres provincias diferentes: Almería, Murcia y Granada. Es uno de los pocos puntos de España donde tres provincias se tocan en menos de 40 kilómetros.',
    en: 'The municipality of Vera borders three different provinces: Almería, Murcia and Granada. It is one of the few points in Spain where three provinces meet within 40 kilometres.',
  },
  /* Sol en invierno */
  {
    es: 'En enero y febrero, Vera Playa tiene más horas de sol que el sur de Portugal y que la Costa Azul francesa. El Mediterráneo almeriense tiene clima de invierno suave con más luz que cualquier otro litoral europeo.',
    en: 'In January and February, Vera Playa has more sunshine hours than southern Portugal or the French Riviera. The Almería Mediterranean has a mild winter climate with more light than any other European coastline.',
  },
  /* Biodiversidad marina */
  {
    es: 'El cañón submarino de Vera-Carboneras es uno de los más activos del Mediterráneo: un valle subacuático de 800 metros de profundidad a solo 6 millas náuticas de la costa. Su biodiversidad equivale a la de un arrecife tropical.',
    en: 'The Vera-Carboneras submarine canyon is one of the Mediterranean\'s most active: an underwater valley 800 metres deep just 6 nautical miles from shore. Its biodiversity rivals that of a tropical reef.',
  },
  /* Mimosa */
  {
    es: 'La mimosa australiana florece en los jardines de Vera Playa entre enero y marzo, cuando el resto de Europa está en invierno. Sus racimos amarillos son la primera señal visible de que el Mediterráneo despierta.',
    en: 'Australian mimosa blooms in Vera Playa gardens between January and March, while the rest of Europe is in winter. Its yellow clusters are the first visible sign that the Mediterranean is waking up.',
  },
  /* Carretera costera */
  {
    es: 'La carretera costera entre Vera Playa y Carboneras discurre por una zona de acantilados volcánicos sin ningún núcleo urbano durante 25 km. Figura entre las 10 rutas escénicas más impactantes del Mediterráneo.',
    en: 'The coastal road between Vera Playa and Carboneras runs through 25 km of volcanic cliffs with no urban settlement. It ranks among the 10 most dramatic scenic drives on the Mediterranean.',
  },
  /* Pesca lunar */
  {
    es: 'Los pescadores de Garrucha aún usan el calendario lunar para decidir cuándo pescar gamba roja. La luna nueva y la llena cambian la profundidad de migración del crustáceo, un conocimiento empírico de más de 800 años.',
    en: 'Garrucha\'s fishermen still use the lunar calendar to decide when to fish for red prawns. New and full moons change the crustacean\'s migration depth, empirical knowledge over 800 years old.',
  },
  /* Higos */
  {
    es: 'La higuera almeriense da dos cosechas al año: las brevas de junio y los higos de agosto. Los griegos llamaron "la tierra de las dos cosechas" a este litoral, uno de los primeros homenajes escritos a la fertilidad de Almería.',
    en: 'The Almería fig tree gives two harvests a year: the figs of June and the figs of August. The Greeks called this coastline "the land of two harvests", one of the first written tributes to Almería\'s fertility.',
  },
  /* Almería occidental: Roquetas, Almerimar, El Ejido, Adra */
  {
    es: 'Roquetas de Mar tiene 16 km de playa continua y un castillo de 1502, Santa Ana, construido para defender la costa de los piratas berberiscos. Hoy es uno de los pocos castillos costeros visitables del Mediterráneo español.',
    en: 'Roquetas de Mar has 16 km of unbroken beach and a 1502 fortress, Santa Ana, built to defend the coast from Barbary pirates. Today it is one of the few visitable coastal castles on the Spanish Mediterranean.',
  },
  {
    es: 'Almerimar nació en los 70 como puerto deportivo de un proyecto urbanístico pionero, uno de los primeros marinas-resort de España. Tiene 1.100 amarres y rutas en velero hasta Marruecos en 14 horas.',
    en: 'Almerimar was born in the 1970s as the marina of a pioneering resort development, one of the first marina-resorts in Spain. It hosts 1,100 berths and sailing routes to Morocco in 14 hours.',
  },
  {
    es: 'El Ejido produce el 30% del tomate y el pepino que se comen en Europa entre noviembre y marzo. Su "mar de plástico", 30.000 hectáreas de invernaderos, es el único cultivo humano visible desde el espacio.',
    en: 'El Ejido grows 30% of all tomatoes and cucumbers eaten in Europe between November and March. Its "plastic sea": 30,000 hectares of greenhouses, is the only human crop visible from space.',
  },
  {
    es: 'Adra es la ciudad más antigua de Andalucía: fundada por los fenicios hace 3.000 años como Abdera. En su museo hay una moneda púnica con un atún, el primer "logo" comercial de la cuenca mediterránea.',
    en: 'Adra is Andalusia\'s oldest city: founded by the Phoenicians 3,000 years ago as Abdera. Its museum holds a Punic coin showing a tuna, the first commercial "logo" of the Mediterranean basin.',
  },
  {
    es: 'Las Albuferas de Adra son el último humedal natural de Andalucía oriental: refugio de la malvasía cabeciblanca, ave en peligro crítico que estuvo a punto de extinguirse en los 80.',
    en: 'The Albuferas of Adra are the last natural wetland of eastern Andalusia: a refuge for the white-headed duck, a critically endangered bird that nearly went extinct in the 1980s.',
  },
  {
    es: 'Berja, Dalías y la Alpujarra almeriense fueron el último reducto musulmán de la Península tras la conquista de Granada en 1492. Sus cortijos blancos en las laderas son herencia directa de aquella arquitectura morisca.',
    en: 'Berja, Dalías and the Almería Alpujarra were the last Moorish stronghold in the Peninsula after the 1492 fall of Granada. The white-washed mountain farmsteads still carry that Morisco architecture directly.',
  },
  {
    es: 'La Sierra de Gádor, entre Berja y Almería capital, fue la mayor productora de plomo del mundo en el siglo XIX. Sus minas dieron tanto plomo que abastecieron media Europa.',
    en: 'The Sierra de Gádor, between Berja and Almería city, was the world\'s largest lead producer in the 19th century. Its mines fed half of Europe.',
  },
  {
    es: 'El Cabo Sacratif (Granada, frontera con Almería) es uno de los puntos más al sur de la España peninsular. Su faro lleva más de 160 años guiando barcos por el Estrecho del Mediterráneo.',
    en: 'Cabo Sacratif (Granada, on the Almería border) is one of the southernmost points of mainland Spain. Its lighthouse has been guiding ships through the Mediterranean strait for over 160 years.',
  },

  /* ── Bloque ampliado · Almería ── */
  { es: 'El desierto de Tabernas es el único desierto propiamente dicho de Europa continental: llueve menos de 250 mm al año y hay paisajes idénticos a Arizona a media hora de Vera.', en: 'The Tabernas Desert is the only true desert in continental Europe: under 250 mm of rain per year and Arizona-like badlands half an hour from Vera.' },
  { es: 'Más de 500 películas se han rodado en Tabernas. Sergio Leone filmó allí "El bueno, el feo y el malo" (1966) y los decorados se conservan como parques temáticos en Fort Bravo y Oasys.', en: 'Over 500 films have been shot in Tabernas. Sergio Leone filmed "The Good, the Bad and the Ugly" there in 1966, the sets still stand as theme parks at Fort Bravo and Oasys.' },
  { es: 'El símbolo del Indalo, hoy en banderas y matrículas almerienses, es una pintura prehistórica del Abrigo de los Letreros en Vélez Blanco (hace ~4.500 años).', en: 'The Indalo symbol, on Almería\'s flag and number plates today: is a prehistoric painting from the Letreros shelter in Vélez Blanco, roughly 4,500 years old.' },
  { es: 'La Geoda de Pulpí es la cavidad geológica visitable más grande del mundo: 11 m de largo, llena de cristales transparentes de yeso, descubierta por casualidad por unos espeleólogos en 1999.', en: 'The Pulpí Geode is the world\'s largest accessible geode: 11 m long, packed with transparent gypsum crystals, found by chance by cavers in 1999.' },
  { es: 'Macael lleva sacando mármol blanco desde el Imperio Romano: con piedra de su sierra se hicieron las columnas de Medina Azahara y los patios de la Alhambra.', en: 'Macael has been quarrying white marble since Roman times, its stone built the columns of Medina Azahara and the courtyards of the Alhambra.' },
  { es: 'Los Yesos de Sorbas son un kárst único: bajo el pueblo serpentean más de 1.000 cuevas naturales talladas por el agua en el yeso, con cristales que parecen catedrales subterráneas.', en: 'The Sorbas gypsum karst is unique in Europe: over 1,000 natural caves wind beneath the village, water-carved through gypsum into crystal cathedrals.' },
  { es: 'En Los Millares, junto a Santa Fe de Mondújar, hay una de las primeras ciudades amuralladas de Europa (siglo XXVI a.C.): una civilización del Calcolítico con murallas y torres mucho antes que Troya.', en: 'Los Millares, near Santa Fe de Mondújar, holds one of Europe\'s earliest walled cities (26th century BC), Copper Age towers and ramparts older than Troy.' },
  { es: 'El Cable Inglés del puerto de Almería es la única estructura de hierro Eiffel-style en el sur peninsular. Servía para cargar mineral en barcos y hoy es Bien de Interés Cultural.', en: 'Almería port\'s "Cable Inglés" is the only Eiffel-style iron structure in southern Spain: built to load mineral onto ships, now a protected heritage site.' },
  { es: 'La Alcazaba de Almería es la segunda fortaleza musulmana más grande de España tras la Alhambra. En su día albergó a 20.000 habitantes, más que muchas ciudades europeas medievales.', en: 'Almería\'s Alcazaba is Spain\'s second-largest Muslim fortress after the Alhambra. At its peak it housed 20,000 people, more than many medieval European cities.' },
  { es: 'Almería fue, en el siglo XI, una de las ciudades más ricas del Mediterráneo: sus sederías exportaban a Bagdad, El Cairo y Bizancio.', en: 'In the 11th century Almería was one of the Mediterranean\'s wealthiest cities: its silks travelled to Baghdad, Cairo and Byzantium.' },
  { es: 'Mojácar la Vieja se asienta sobre un cerro con vistas a 360°. La leyenda dice que la última musulmana de la Reconquista negoció aquí la rendición sin perder casa ni huerta.', en: 'Old Mojácar perches on a 360°-view hill. Legend has it the last Muslim of the Reconquista negotiated her surrender here without losing house or garden.' },
  { es: 'Garrucha tiene una de las lonjas de pescado más vivas del Levante: la gamba roja de Garrucha está en las mejores cartas de Madrid y Barcelona y se subasta a la voz cada tarde.', en: 'Garrucha\'s fish market is one of the liveliest on the south coast. Its red prawn ends up on Madrid and Barcelona\'s top menus, auctioned out loud every afternoon.' },
  { es: 'La Sierra de los Filabres es la zona astronómica más limpia de Europa continental: en su cima está Calar Alto, el mayor observatorio del continente con un telescopio de 3,5 m.', en: 'The Filabres range has continental Europe\'s clearest skies: at its peak sits Calar Alto, the continent\'s largest observatory with a 3.5 m telescope.' },
  { es: 'En el yacimiento argárico de El Argar (Antas) está el origen del nombre de toda una cultura prehistórica: la Cultura del Argar dominó el SE peninsular hace 4.000 años.', en: 'The Argaric culture: which dominated south-east Iberia 4,000 years ago, takes its name from the El Argar dig in Antas.' },
  { es: 'Las Salinas de Cabo de Gata producen sal marina por evaporación natural desde la época fenicia. Hoy alimentan a la única colonia estable de flamencos del sureste peninsular.', en: 'The Cabo de Gata salt flats have produced sea salt by natural evaporation since Phoenician times. They feed the only stable flamingo colony of south-east Iberia.' },
  { es: 'En Roquetas de Mar hay una "alcazaba" cristiana del XVI: el Castillo de Santa Ana, construido para vigilar piratas berberiscos que asaltaban la costa cada verano.', en: 'In Roquetas stands Santa Ana, a 16th-century Christian "alcazaba" built to spot Berber pirates who raided the coast each summer.' },
  { es: 'Carboneras tiene la playa de los Muertos, repetidamente votada entre las mejores de España: 1 km de cantos rodados y agua transparente sin un solo edificio detrás.', en: 'Carboneras owns Playa de los Muertos, repeatedly voted among Spain\'s best: 1 km of pebbles, crystalline water, not a single building behind it.' },
  { es: 'Vélez Blanco tiene un castillo renacentista cuyo patio fue desmontado y vendido entero a Nueva York en 1904, hoy está reconstruido pieza a pieza en el Metropolitan Museum.', en: 'Vélez Blanco\'s Renaissance castle had its courtyard dismantled and sold whole to New York in 1904, today it stands reassembled inside the Metropolitan Museum.' },
  { es: 'Cuevas del Almanzora alberga uno de los yacimientos prehistóricos más densos de Europa: 26 enterramientos argáricos hallados solo en el cabezo de Fuente Álamo.', en: 'Cuevas del Almanzora holds one of Europe\'s densest prehistoric sites: 26 Argaric burials found in the single hill of Fuente Álamo.' },
  { es: 'El acueducto de los Milagros en Albox sigue funcionando 250 años después: lleva agua de la Sierra de las Estancias a los huertos del pueblo con un caudal constante.', en: 'The Milagros aqueduct in Albox still works 250 years on, bringing water from the Estancias range to the village gardens at constant flow.' },
  { es: 'Pulpí tiene la mina del Polvorín, la mayor explotación de hierro abandonada de Europa: un laberinto de galerías inundadas que se exploran en kayak con linterna frontal.', en: 'Pulpí\'s Polvorín mine, Europe\'s largest abandoned iron operation, is a flooded gallery maze you can kayak through with a head torch.' },
  { es: 'Níjar es famoso por sus jarapas, alfombras tejidas con tiras de tela reciclada en telar de pedal, y por la cerámica vidriada que se hace desde el XVI.', en: 'Níjar is known for its "jarapas", rugs woven from recycled fabric strips on foot looms, and for the glazed pottery it has made since the 16th century.' },
  { es: 'El Karst en Yesos de Sorbas es el segundo del mundo en extensión tras el de Sicilia. Bajo tus pies en Sorbas pasan cuevas que nadie ha cartografiado del todo.', en: 'The Sorbas gypsum karst is the world\'s second largest after Sicily\'s. Beneath the village wind caves still not fully mapped.' },
  { es: 'El Almanzora era río navegable en época romana: por él subían barcos hasta el actual Cuevas para cargar plomo y plata de la sierra.', en: 'The Almanzora was a navigable river in Roman times, boats sailed up to modern Cuevas to load lead and silver from the mountains.' },
  { es: 'La Cala de San Pedro, junto a Las Negras, solo se llega andando o en barca. Era refugio de hippies en los 70 y hoy sobreviven 8 personas viviendo sin coches ni red eléctrica.', en: 'San Pedro Cove, next to Las Negras, can only be reached on foot or by boat. Hippies took refuge there in the 70s, eight still live there today without cars or grid power.' },
  { es: 'Almería capital tuvo la primera bombilla eléctrica encendida en España, en 1882, gracias al ingeniero Gaspar Molina y al inglés Samuel Wood que montaron una pequeña central en el barrio de la Almedina.', en: 'Almería had Spain\'s first electric bulb lit in 1882, thanks to engineer Gaspar Molina and English engineer Samuel Wood who set up a small plant in the Almedina district.' },
  { es: 'El "tropicalismo" almeriense: subtropicales como chirimoyas, mangos, papayas y aguacates crecen al aire libre en el bajo Andarax, el único microclima de Europa que lo permite.', en: 'Almería\'s tropical microclimate: cherimoyas, mangoes, papayas and avocados grow outdoors in the lower Andarax, the only spot in Europe where they can.' },
  { es: 'En Tabernas se rueda casi todos los meses: Indiana Jones, El Dorado, Lawrence de Arabia, Conan, Patton, Doctor Who, Juego de Tronos y Star Wars han pasado por sus ramblas.', en: 'Tabernas hosts shoots almost every month: Indiana Jones, El Dorado, Lawrence of Arabia, Conan, Patton, Doctor Who, Game of Thrones and Star Wars have all rolled cameras here.' },
  { es: 'Las gambas rojas de Garrucha se diferencian de otras del Mediterráneo porque viven a 600-800 m de profundidad. Por eso su carne es más dulce, el frío concentra los azúcares.', en: 'Garrucha\'s red prawns live at 600-800 m depth: that cold concentrates sugars in the flesh, making them sweeter than other Mediterranean reds.' },
  { es: 'La cueva del Tesoro, en el Cabezo María (Pulpí), guarda pinturas rupestres del Neolítico: cabras, ciervos y figuras humanas pintadas hace 7.000 años.', en: 'The Treasure Cave in Cabezo María (Pulpí) holds Neolithic rock paintings: goats, deer and human figures painted 7,000 years ago.' },
  { es: 'El faro de Mesa Roldán (Carboneras) ha aparecido en "Juego de Tronos" como la Atalaya Marina de Meereen, el mar visto desde aquí sale en los créditos de la serie.', en: 'Mesa Roldán lighthouse (Carboneras) appeared in Game of Thrones as Meereen\'s sea watch, its sea view shows up in the credits.' },
  { es: 'En Almería se inventó la "tapa" tal como la conocemos hoy: la costumbre de servir algo de comer GRATIS con la bebida sigue siendo norma, pruébala en el barrio de Las Cuatro Calles.', en: 'Almería is the birthplace of the modern "tapa", a free bite served with every drink. Still the norm. Try it in the Cuatro Calles district.' },
  { es: 'La ruta del cine en Tabernas es la única en Europa donde puedes hacer tu propia escena de duelo al sol con vestuario, caballo y diligencia de época.', en: 'Tabernas\' cinema route is the only one in Europe where you can stage your own western showdown with full period costume, horse and stagecoach.' },
  { es: 'En el Parque Natural Sierra María-Los Vélez crecen sabinas centenarias y abetos pinsapos relictos del último período glaciar, un bosque que viene del Pleistoceno.', en: 'Sierra María-Los Vélez Natural Park grows centuries-old junipers and pinsapo firs left over from the last ice age, a forest straight out of the Pleistocene.' },
  { es: 'En Cuevas del Almanzora se inventó el chocolate a la taza con canela y leche al estilo árabe, sigue siendo receta protegida de varias chocolaterías locales.', en: 'The Arab-style thick chocolate with cinnamon and milk was invented in Cuevas del Almanzora, still a protected recipe at a handful of local chocolatiers.' },

  /* ── Bloque ampliado · Murcia limítrofe (sureste) ── */
  { es: 'Cartagena fue fundada por los cartagineses en 227 a.C. como Qart Hadasht. Roma la conquistó en 209 a.C. y desde allí Aníbal mandaba mensajes a Cartago vía paloma, la primera "red" del Mediterráneo.', en: 'Cartagena was founded by the Carthaginians in 227 BC as Qart Hadasht. Rome took it in 209 BC and Hannibal sent pigeon-post to Carthage from there, the Mediterranean\'s first "network".' },
  { es: 'El Teatro Romano de Cartagena estuvo enterrado bajo la ciudad hasta 1988. Fue descubierto al rehabilitar el barrio del Molinete, y hoy es uno de los mejor conservados de España.', en: 'Cartagena\'s Roman Theatre lay buried under the city until 1988. It was uncovered while restoring the Molinete quarter, now one of the best preserved in Spain.' },
  { es: 'Isaac Peral inventó el primer submarino eléctrico del mundo en Cartagena (1888): funcional, navegaba sumergido. El original se expone en el puerto de la ciudad.', en: 'Isaac Peral built the world\'s first electric submarine in Cartagena (1888), fully functional and submersible. The original is on display at the city\'s port.' },
  { es: 'Mazarrón conserva dos pecios fenicios del siglo VII a.C., los más antiguos del Mediterráneo occidental. Uno se ha extraído pieza a pieza, el otro sigue intacto bajo la arena.', en: 'Mazarrón holds two 7th-century BC Phoenician shipwrecks, the oldest in the western Mediterranean. One has been recovered piece by piece, the other still rests intact under sand.' },
  { es: 'Las Gredas de Bolnuevo (Mazarrón) son esculturas naturales talladas por el viento en arcilla amarilla durante miles de años, un paisaje marciano a 50 m de la playa.', en: 'The Bolnuevo Gredas (Mazarrón) are wind-carved sculptures in yellow clay, a Martian landscape 50 m from the beach.' },
  { es: 'Águilas celebra el carnaval declarado de Interés Turístico Internacional desde 2015. Su mascota, el "Cuerva", es un personaje único en España: media broma, media tradición ancestral.', en: 'Águilas\' carnival has been an international tourism event since 2015. Its mascot, "El Cuerva", is unique in Spain: half-joke, half-ancient-tradition.' },
  { es: 'Lorca sufrió un terremoto de 5,1 en 2011 que arruinó su casco histórico. La reconstrucción ha recuperado uno de los conjuntos barrocos más completos del sur peninsular.', en: 'Lorca was hit by a magnitude 5.1 earthquake in 2011 that flattened its historic centre. The rebuild has recovered one of southern Spain\'s most complete baroque ensembles.' },
  { es: 'La Semana Santa de Lorca, declarada de Interés Internacional, no es como las otras: hay carros romanos a galope, bordados en hilo de oro de 8 kg y carreras de caballos en plena procesión.', en: 'Lorca\'s Holy Week, internationally declared: is unlike any other: galloping Roman chariots, 8-kg gold-thread embroideries and horse races during the procession.' },
  { es: 'Caravaca de la Cruz es una de las 5 ciudades santas del mundo católico. Su Vera Cruz es la única reliquia que se baña en agua y vino cada año: los demás lugares santos están en Roma, Jerusalén, Santiago y Loyola.', en: 'Caravaca de la Cruz is one of five holy cities of Catholicism. Its Vera Cruz is the only relic dipped in wine and water each year: the others are Rome, Jerusalem, Santiago and Loyola.' },
  { es: 'Sierra Espuña es el único bosque de pinos repoblado entero a mano: a finales del XIX el ingeniero Ricardo Codorníu plantó allí 20 millones de pinos para frenar la erosión.', en: 'Sierra Espuña is the only forest planted entirely by hand: in the late 19th century engineer Ricardo Codorníu planted 20 million pine trees there to stop erosion.' },
  { es: 'Calblanque es un parque protegido sin un solo edificio en 13 km de costa, entrar requiere autobús lanzadera en verano. El mar es transparente y la arena, dorada de mineral.', en: 'Calblanque is a protected park with not one building along its 13 km of coast, shuttle access only in summer. The sea is clear, the sand mineral-gold.' },
  { es: 'El Mar Menor es la laguna salada de agua de mar más grande de Europa: 135 km² y solo 7 m en su punto más profundo. Las aguas tienen el doble de sal que el mar y propiedades terapéuticas.', en: 'The Mar Menor is Europe\'s largest saltwater lagoon: 135 km², just 7 m deep at most. Its water is twice as salty as the sea and has therapeutic properties.' },
  { es: 'Calasparra produce un arroz protegido por DOP que es el único en Europa que se cultiva con agua corriente de río, la cebada del agua mantiene el grano firme y absorbente.', en: 'Calasparra grows a PDO-protected rice: the only one in Europe cultivated with flowing river water, which keeps the grain firm and absorbent.' },
  { es: 'Mula es famosa por sus tambores: la Noche de los Tambores reúne a 20.000 tamborileros que tocan sin parar de la medianoche al amanecer en Semana Santa.', en: 'Mula is famous for its drums: the Night of the Drums brings together 20,000 drummers playing nonstop from midnight to dawn during Holy Week.' },
  { es: 'En Bullas, Jumilla y Yecla se hace el mejor monastrell del mundo: una uva tinta robusta que solo madura bien en suelos secos y soleados como los del altiplano murciano.', en: 'Bullas, Jumilla and Yecla produce the world\'s best Monastrell: a robust red grape that only ripens properly in dry, sunny plateaus like Murcia\'s altiplano.' },
  { es: 'Murcia capital tiene la Casa-Museo Salzillo, dedicada al escultor del XVIII que talló todos los pasos de la Semana Santa local. Sus figuras en madera policromada se conservan intactas tras 250 años.', en: 'Murcia city houses the Salzillo museum, devoted to the 18th-century sculptor who carved every local Holy Week throne. His polychrome wood figures survive intact after 250 years.' },
  { es: 'El Valle de Ricote es el último reducto morisco de España: tras la expulsión de 1614 sobrevivieron varias familias por un permiso especial del rey. Hoy se mantienen los huertos de palmera y limonero.', en: 'The Ricote Valley is Spain\'s last Morisco stronghold: after the 1614 expulsion a handful of families survived by royal exemption. The palm and lemon orchards endure.' },
  { es: 'Cieza tiene Medina Siyâsa, una ciudad andalusí del XII que mantiene 25 viviendas con yeserías originales, restos únicos de la vida cotidiana musulmana medieval.', en: 'Cieza holds Medina Siyâsa, a 12th-century Andalusi town with 25 dwellings still showing original plasterwork, unique remains of medieval Muslim daily life.' },
  { es: 'La Sierra de la Pila, entre Fortuna y Abarán, esconde la Cueva Negra: yacimiento del Paleolítico con homínidos de hace 800.000 años, entre los más antiguos del sur europeo.', en: 'Sierra de la Pila, between Fortuna and Abarán, hides Cueva Negra: a Paleolithic site with 800,000-year-old hominins, among southern Europe\'s oldest.' },
  { es: 'En Aledo (Murcia, frontera con Almería) hay una torre vigía del XII que se ve desde la Sierra de los Filabres, los moros la usaban para mandar señales de humo a Mojácar y Vera.', en: 'In Aledo (Murcia, on the Almería border) stands a 12th-century watchtower visible from the Filabres range, Moors used it to send smoke signals to Mojácar and Vera.' },
  { es: 'Los baños romanos de Fortuna (Murcia) llevan funcionando 2.000 años: las mismas aguas termales que usaron los legionarios se siguen embotellando hoy.', en: 'The Roman baths of Fortuna (Murcia) have been working for 2,000 years: the same thermal water once used by Roman legionaries is still bottled today.' },
  { es: 'En las salinas de San Pedro del Pinatar conviven flamencos, avocetas y cigüeñuelas. Es el humedal con más especies de aves protegidas del sureste peninsular.', en: 'San Pedro del Pinatar\'s salt flats are home to flamingos, avocets and stilts, the south-east\'s wetland with most protected bird species.' },
  { es: 'Yecla tiene la mayor producción mundial de muebles tapizados de gama media: una de cada 10 sofás vendidos en Europa se fabrica en sus polígonos industriales.', en: 'Yecla is the world\'s largest producer of mid-range upholstered furniture: 1 in every 10 sofas sold in Europe is built in its industrial parks.' },
  { es: 'Cope (entre Águilas y Calabardina) tiene una torre defensiva del XVI dentro del mar, la marea sube y la rodea por completo dos veces al día.', en: 'Cope (between Águilas and Calabardina) has a 16th-century defence tower in the sea, the tide surrounds it completely twice a day.' },
  { es: 'El embalse de la Cierva (Mula) se llenó tan rápido al construirlo en 1929 que se quedó atrapado un pueblo entero, La Puebla de Mula, todavía emerge en años secos.', en: 'The Cierva reservoir (Mula) filled so fast after its 1929 construction that the entire village of La Puebla de Mula was trapped, it still emerges in drought years.' },

  /* ── Bloque ampliado · Granada limítrofe (Costa Tropical, Alpujarra y altiplano) ── */
  { es: 'La Alpujarra granadina conserva las "tinaos": pórticos cubiertos entre casas: y los tejados planos de launa, arcilla impermeable que se compacta cada otoño antes de las lluvias.', en: 'The Granadan Alpujarra keeps its "tinaos", covered passages between houses: and flat launa roofs of waterproof clay, compacted every autumn before the rains.' },
  { es: 'Trevélez es uno de los pueblos a más altitud habitados de España (1.476 m) y curan allí jamones DOP por la sequedad del aire, el frío seco mata bacterias sin necesidad de pimentón.', en: 'Trevélez is one of Spain\'s highest inhabited villages (1,476 m) and cures PDO hams thanks to its dry air, cold dryness kills bacteria without needing paprika.' },
  { es: 'Sierra Nevada tiene el segundo techo de la España peninsular: el Mulhacén (3.479 m). Está a 1h45 en coche de Vera Playa, puedes esquiar y bañarte en el mar el mismo día.', en: 'Sierra Nevada has mainland Spain\'s second-highest peak: Mulhacén (3,479 m). It\'s 1h45 from Vera Playa by car, ski and swim in the sea the same day.' },
  { es: 'En Orce (Granada, altiplano) está el yacimiento de Venta Micena: allí se halló el resto humano más antiguo de Europa (1,4 millones de años), conocido como el Hombre de Orce.', en: 'Orce (Granada altiplano) holds the Venta Micena site, Europe\'s oldest human remains were found there, 1.4 million years old: the so-called Orce Man.' },
  { es: 'Galera (Granada, altiplano) conserva una necrópolis ibera del siglo IV a.C. con la Dama de Galera, una estatuilla de alabastro fenicia anterior a los íberos.', en: 'Galera (Granada altiplano) holds a 4th-century BC Iberian necropolis with the Lady of Galera, a Phoenician alabaster statuette older than the Iberians themselves.' },
  { es: 'Guadix tiene 2.000 viviendas cueva habitadas, el mayor barrio troglodita de Europa. Las casas mantienen 18-20°C todo el año sin calefacción ni aire acondicionado.', en: 'Guadix has 2,000 inhabited cave dwellings, Europe\'s largest troglodyte district. They stay 18-20°C year-round without heating or AC.' },
  { es: 'Baza conserva los baños árabes del siglo X mejor preservados de Andalucía oriental. Funcionaron 600 años hasta que un terremoto en 1531 los cerró.', en: 'Baza holds eastern Andalusia\'s best preserved 10th-century Arab baths. They worked for 600 years until a 1531 earthquake closed them.' },
  { es: 'El Geoparque de Granada (en torno a Guadix y Baza) tiene la mayor concentración de cárcavas y badlands de Europa, paisaje lunar de arcillas rojizas talladas por el agua.', en: 'The Granada Geopark (around Guadix and Baza) holds Europe\'s densest concentration of badlands, a lunar landscape of water-carved red clays.' },
  { es: 'En Castril (Granada, frontera con Jaén) nace un río que perfora la montaña por dentro: la Cerrada del Río Castril es una pasarela colgada sobre el agua que se mete en cuevas.', en: 'In Castril (Granada, on the Jaén border) a river bores through the mountain, the Río Castril gorge is a hanging walkway over water that disappears into caves.' },
  { es: 'La Costa Tropical granadina (Salobreña, Almuñécar, Castell de Ferro) tiene las únicas plantaciones de caña de azúcar de Europa continental. El último ingenio cerró en 2006.', en: 'The Granadan Costa Tropical (Salobreña, Almuñécar, Castell de Ferro) hosts continental Europe\'s only sugarcane plantations. The last mill closed in 2006.' },
  { es: 'Almuñécar fue Sexi, una ciudad fenicia del siglo VIII a.C., exportaba garum (salsa de pescado fermentado) a todo el Mediterráneo. Aún se conservan piscinas de fabricación romanas.', en: 'Almuñécar was Sexi, an 8th-century BC Phoenician city that exported garum (fermented fish sauce) across the Mediterranean. Roman production pools still survive.' },
  { es: 'Salobreña tiene un castillo nazarí del XIII pegado a un peñón sobre el mar. En su época fue prisión real, varios sultanes de Granada acabaron allí.', en: 'Salobreña\'s 13th-century Nasrid castle clings to a sea-cliff. In its day it was a royal prison, several sultans of Granada ended their reigns there.' },
  { es: 'Motril fue capital azucarera de Europa entre el XVI y el XIX. Aún se conservan sus chimeneas de ladrillo, patrimonio industrial único en el sur peninsular.', en: 'Motril was Europe\'s sugar capital between the 16th and 19th centuries. Its brick chimneys still stand, industrial heritage unique to southern Spain.' },
  { es: 'La Calahorra (Granada, Marquesado del Zenete) tiene un castillo del siglo XVI con un patio renacentista italiano dentro: el primer ejemplo del Cinquecento en España.', en: 'La Calahorra (Granada, Zenete Marquisate) holds a 16th-century castle with a Renaissance Italian courtyard inside, the first Cinquecento example in Spain.' },
  { es: 'En Jérez del Marquesado (Granada) nacen los ríos que abastecen toda la cuenca del Genil, un manantial subterráneo de la Sierra Nevada que no se seca nunca.', en: 'In Jérez del Marquesado (Granada) springs the water for the entire Genil basin, an underground source from Sierra Nevada that never dries up.' },
  { es: 'En las cuevas de Pampaneira (Alpujarra) se hace el primer chocolate ecológico de España con cacao trazable y leche de cabra payoya, uno de los proyectos artesanos más premiados del país.', en: 'In Pampaneira (Alpujarra) sits Spain\'s first organic chocolate workshop with traceable cocoa and "payoya" goat milk, one of the country\'s most awarded craft projects.' },
  { es: 'Capileira y Bubión son los pueblos de la Alpujarra que aparecen en "Sur" de Federico García Lorca, el paisaje de cumbres y arrayanes de los textos.', en: 'Capileira and Bubión are the Alpujarra villages in Federico García Lorca\'s "Sur", the same peaks and myrtle terraces of the texts.' },
  { es: 'Pedro Antonio de Alarcón, autor de "El sombrero de tres picos", recorrió la Alpujarra en 1872 a lomos de mulo y escribió uno de los primeros libros de viajes modernos en español.', en: 'Pedro Antonio de Alarcón, author of "The Three-Cornered Hat", rode the Alpujarra by mule in 1872 and wrote one of Spain\'s first modern travel books.' },
  { es: 'La estación de esquí de Sierra Nevada es la más al sur de Europa: las pistas miran al Mediterráneo y desde el Veleta se ve el Rif marroquí en días claros.', en: 'Sierra Nevada is Europe\'s southernmost ski resort: pistes face the Mediterranean and from Veleta peak you can see the Moroccan Rif on clear days.' },
  { es: 'En los telégrafos de la Calahorra (Granada) está la última fonda de muleros del antiguo camino real, un edificio del XIX donde paraban arrieros entre Granada y Almería.', en: 'In La Calahorra (Granada) stands the last muleteer inn of the old royal road, a 19th-century building where carriers stopped between Granada and Almería.' },
  { es: 'En Lanjarón (Alpujarra) hay 6 manantiales con propiedades distintas, la marca de agua mineral más vendida en España nació allí en 1818.', en: 'Lanjarón (Alpujarra) has 6 mineral springs with distinct properties, Spain\'s top-selling bottled water started there in 1818.' },
  { es: 'Sierra Nevada es refugio del único glaciar relicto de Europa al sur del paralelo 40°: bolsa de hielo permanente bajo el pico Veleta, restos del último período glacial.', en: 'Sierra Nevada shelters Europe\'s only relict glacier south of the 40th parallel: a permanent ice pocket under Veleta peak, surviving from the last ice age.' },
  { es: 'En Pórtugos (Alpujarra) brota la Fuente Agria, agua ferruginosa que tiñe de naranja la piedra. Se cree que ayuda a la anemia y los lugareños la beben a diario.', en: 'In Pórtugos (Alpujarra) springs the Fuente Agria, iron-rich water that stains stones orange. Said to help with anaemia and drunk daily by locals.' },
  { es: 'Huéscar (Granada, altiplano) le declaró la guerra a Dinamarca en 1809 por las Guerras Napoleónicas y se olvidaron de firmar la paz hasta 1981, 172 años de "guerra" sin un solo disparo.', en: 'Huéscar (Granada altiplano) declared war on Denmark in 1809 during the Napoleonic Wars and forgot to sign peace until 1981, 172 years of "war" without a single shot fired.' },
  { es: 'La Falla de Baza es la mayor falla activa del sur peninsular: provoca pequeños terremotos cada año y dio forma a toda la hoya entre Granada y Almería.', en: 'The Baza Fault is southern Iberia\'s largest active fault, it triggers small quakes yearly and shaped the entire basin between Granada and Almería.' },
  { es: 'La Cueva de las Ventanas en Píñar (Granada) tiene espeleotemas de aragonito raros: cristales en forma de flor que solo crecen en condiciones de humedad y temperatura muy estables.', en: 'The Ventanas Cave in Píñar (Granada) holds rare aragonite formations, flower-shaped crystals that only grow under very stable humidity and temperature.' },
  { es: 'En las cuevas del Sacromonte (Granada) nació el "zambra", variante del flamenco más antigua y exclusiva de la comunidad gitana de Granada.', en: 'In the Sacromonte caves (Granada) was born the "zambra": the oldest flamenco style, exclusive to Granada\'s Roma community.' },
  { es: 'El Marquesado del Zenete (Granada) cría la oveja segureña, raza autóctona que da el cordero más apreciado del altiplano. Pasta en sierras altas y solo se vende en mercados locales.', en: 'The Zenete Marquisate (Granada) breeds the Segureña sheep, a native breed yielding the most prized lamb in the altiplano. Grazed in high sierras, sold only in local markets.' },
  { es: 'La almendra "marcona", la favorita de pastelerías de toda Europa: se cultiva entre Almería oriental, sur de Murcia y norte de Granada: el triángulo perfecto de altura y sequedad.', en: 'The Marcona almond: favourite of European patisseries: grows in eastern Almería, southern Murcia and northern Granada: the perfect dry, elevated triangle.' }
];

// Shuffled pools, stable per page load
const _shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const _FACTS_POOL  = _shuffle(SABIAS_QUE_FACTS);
const _QUOTES_POOL = _shuffle(FRASES_HOGAR);

// Session-persistent pool: same random order for the whole browser session
const _getSessionPool = () => {
  try {
    const raw = sessionStorage.getItem('hestia-facts-order');
    if (raw) {
      const indices = JSON.parse(raw);
      if (Array.isArray(indices) && indices.length === SABIAS_QUE_HOME_FACTS.length)
        return indices.map(i => SABIAS_QUE_HOME_FACTS[i]);
    }
  } catch {}
  const indices = _shuffle([...Array(SABIAS_QUE_HOME_FACTS.length).keys()]);
  try { sessionStorage.setItem('hestia-facts-order', JSON.stringify(indices)); } catch {}
  return indices.map(i => SABIAS_QUE_HOME_FACTS[i]);
};
const _getSessionIdx = () => {
  try { return Math.max(0, parseInt(sessionStorage.getItem('hestia-facts-idx') || '0', 10)); } catch { return 0; }
};
const _saveSessionIdx = (i) => {
  try { sessionStorage.setItem('hestia-facts-idx', String(i)); } catch {}
};

// Keep _HOME_FACTS_POOL for backward-compat (FraseHogar etc.)
const _HOME_FACTS_POOL = _getSessionPool();

// Franja oscura antes del FAQ, solo datos de Almería / Hestía
const SabiasQue = ({ lang, pool: propPool }) => {
  const pool = propPool || _FACTS_POOL;
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * pool.length));
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % pool.length);
        setVisible(true);
      }, 500);
    }, 7000);
    return () => clearInterval(tick);
  }, []);

  const item = pool[idx];
  return (
    <div className="sabias-que">
      <span className="sq-label">{lang === 'es' ? '¿Sabías que…?' : 'Did you know?'}</span>
      <span className={`sq-body ${visible ? 'sq-in' : 'sq-out'}`}>
        <span className="sq-fact">{item[lang]}</span>
      </span>
    </div>
  );
};

// Franja crema tras el hero, frases célebres sobre el hogar
const FraseHogar = ({ lang }) => {
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * _QUOTES_POOL.length));
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % _QUOTES_POOL.length);
        setVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(tick);
  }, []);

  const item = _QUOTES_POOL[idx];
  return (
    <div className="frase-hogar">
      <span className={`fh-body ${visible ? 'fh-in' : 'fh-out'}`}>
        <span className="fh-quote">{item[lang]}</span>
        <span className="fh-attr">{item.attr}</span>
      </span>
    </div>
  );
};

// Widget fijo media pantalla derecha, solo datos curiosos
const StickyFacts = ({ lang }) => {
  const [pool]  = React.useState(_getSessionPool);
  const total   = pool.length;
  const [idx, setIdx]         = React.useState(_getSessionIdx);
  const [visible, setVisible] = React.useState(true);
  const [open, setOpen]       = React.useState(true);
  const [pastHero, setPastHero]           = React.useState(() => window.scrollY > window.innerHeight * 0.7);
  const [searchActive, setSearchActive]   = React.useState(false);

  React.useEffect(() => {
    const check = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  React.useEffect(() => {
    const handler = e => setSearchActive(e.detail);
    window.addEventListener('hs-results-change', handler);
    return () => window.removeEventListener('hs-results-change', handler);
  }, []);

  const advance = (dir) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(i => { const n = (i + dir + total) % total; _saveSessionIdx(n); return n; });
      setVisible(true);
    }, 320);
  };

  React.useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => { const n = (i + 1) % total; _saveSessionIdx(n); return n; });
        setVisible(true);
      }, 400);
    }, 9000);
    return () => clearInterval(t);
  }, [open]);

  const item  = pool[idx];
  const label = lang === 'es' ? '¿Sabías que…?' : 'Did you know?';

  return (
    <div className={`sticky-facts ${open ? '' : 'sf-closed'}${(pastHero && !searchActive) ? '' : ' sf-hidden'}`} onClick={!open ? () => setOpen(true) : undefined}>
      {!open ? (
        <>
          <span style={{ fontSize: 14, color: 'var(--sol-lt)', fontFamily: 'var(--sans)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 400 }}>
            {lang === 'es' ? '¿Sabías que…?' : 'Did you know?'}
          </span>
          <button className="sf-toggle" onClick={() => setOpen(true)} aria-label="Expandir">＋</button>
        </>
      ) : (
        <>
          <button className="sf-toggle" onClick={() => setOpen(false)} aria-label="Minimizar">−</button>
          <div className={`sf-body ${visible ? 'sf-in' : 'sf-out'}`}>
            <span className="sf-label">{label}</span>
            <span className="sf-text">{item[lang]}</span>
          </div>
          <div className="sf-nav">
            <button className="sf-nav-btn" onClick={() => advance(-1)} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>←</button>
            <span className="sf-counter">{idx + 1} / {total}</span>
            <button className="sf-nav-btn" onClick={() => advance(1)} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>→</button>
          </div>
        </>
      )}
    </div>
  );
};

// ================================================================
// HESTÍA PRICE ENGINE
// Fuente de verdad: docs/data/prices.json (editado vía /p-edit.html).
// El loader del HTML hace fetch antes de evaluar este archivo y deja
// el JSON en window.PRICES_V2. Si por lo que sea no llegó (red caída,
// CDN frío), usamos HESTIA_PRICES_FALLBACK para no romper la web.
// ================================================================

// --- Fallback con valores aproximados (por si window.PRICES_V2 no carga)
const HESTIA_PRICES_FALLBACK = {
  vm: { base: [0, 88, 88, 88, 106, 106, 176, 220, 220, 176, 106, 88, 88], peaks: [] },
  vt: { base: [0, 86, 86, 86, 103, 103, 172, 215, 215, 172, 103, 86, 86], peaks: [] },
  vs: { base: [0, 82, 82, 82,  98,  98, 164, 205, 205, 164,  98, 82, 82], peaks: [] },
};

// --- Helpers para v2 (consultan window.PRICES_V2 ad-hoc)
const _v2DateInRanges = (ds, ranges) =>
  (ranges || []).some(([from, to]) => ds >= from && ds <= to);

const _v2SeasonForDate = (ds, v2) => {
  const year = ds.slice(0, 4);
  const yd = v2.calendar && v2.calendar[year];
  if (!yd) return 'baja';
  // Specials (Sem Santa, Navidad) ganan a las temporadas regulares
  for (const spec of Object.values(yd.specials || {})) {
    if (_v2DateInRanges(ds, spec.ranges)) return spec.season || 'baja';
  }
  for (const [s, ranges] of Object.entries(yd.seasons || {})) {
    if (_v2DateInRanges(ds, ranges)) return s;
  }
  return 'baja';
};

const _v2BumpedSeasonForDate = (ds, v2) => {
  let s = _v2SeasonForDate(ds, v2);
  if (!v2.rules || !v2.rules.bridgeBumpsOneStep) return s;
  const year = ds.slice(0, 4);
  const yd = v2.calendar && v2.calendar[year];
  const inBridge = (yd && (yd.bridges || []).some(b => _v2DateInRanges(ds, b.ranges)));
  if (!inBridge) return s;
  const ladder = (v2.rules.seasonLadder) || ['baja', 'media', 'alta', 'critica'];
  const idx = ladder.indexOf(s);
  return (idx >= 0 && idx < ladder.length - 1) ? ladder[idx + 1] : s;
};

// Devuelve el precio exacto de UNA noche según el modelo v2.
// null si no hay v2 disponible (callers caen al motor v1).
const _dayPriceV2 = (ds, aptId) => {
  const v2 = window.PRICES_V2;
  if (!v2 || !v2.apts || !v2.apts[aptId]) return null;
  const apt = v2.apts[aptId];
  const season = _v2BumpedSeasonForDate(ds, v2);
  const mult = (v2.seasons && v2.seasons[season] && v2.seasons[season].multiplier) || 1;
  return Math.round(apt.base * mult);
};

// Sintetiza la tabla mensual antigua a partir de v2 (sample del día 15).
// Lo justo para que componentes que computan min/max anuales sigan
// funcionando sin tocarse. _dayPrice usa v2 directo, no esta tabla.
const _v2DeriveV1 = (v2) => {
  const result = {};
  const year = (v2.calendar && Object.keys(v2.calendar)[0]) || '2026';
  for (const aptId of Object.keys(v2.apts || {})) {
    const base = [0];
    for (let m = 1; m <= 12; m++) {
      const ds = `${year}-${String(m).padStart(2, '0')}-15`;
      base[m] = _dayPriceV2(ds, aptId);
    }
    // También recogemos el max real iterando todos los rangos (las temporadas
    // alta/crítica caen en sample del 15 de jul/ago en mi schema, así que el
    // max ya queda capturado, pero lo blindo).
    result[aptId] = { base, peaks: [] };
  }
  return result;
};

const HESTIA_PRICES = (window.PRICES_V2 && window.PRICES_V2.apts)
  ? _v2DeriveV1(window.PRICES_V2)
  : HESTIA_PRICES_FALLBACK;

// AIRBNB_PRICES eliminado en mayo 2026, ya no comparamos precio con
// plataformas externas. La promesa pública es "te mejoramos cualquier
// precio que veas en cualquier sitio". Lo que se cobra es el precio
// directo calculado a partir de prices.json + descuentos por estancia.
const _airbnbDayPrice = () => 0; // legacy stub para callers antiguos

// DIRECT_DISCOUNT eliminado en mayo 2026: ya no comparamos vs OTAs.
// El precio en la web ES el directo. La promesa pública es "te mejoramos
// cualquier precio que veas en cualquier sitio".

// Stay discounts vienen del JSON cuando está disponible. El JSON puede
// definir excludeSeasons (ej. "no se aplica en alta/crítica"), eso lo
// chequea _calcStay día a día. Ordenado de mayor a menor minNights para
// que el primer match en .find() sea el mejor descuento aplicable.
const STAY_DISCOUNTS = (window.PRICES_V2 && window.PRICES_V2.rules && Array.isArray(window.PRICES_V2.rules.stayDiscounts))
  ? window.PRICES_V2.rules.stayDiscounts.slice()
      .sort((a, b) => b.minNights - a.minNights)
      .map(d => ({
        min: d.minNights,
        pct: d.pct,
        excludeSeasons: d.excludeSeasons || [],
        es: d.label || `−${Math.round(d.pct * 100)} % por estancia larga (${d.minNights}+ noches)`,
        en: `−${Math.round(d.pct * 100)} % long stay (${d.minNights}+ nights)`,
      }))
  : [
      { min: 28, pct: 0.20, excludeSeasons: [], es: '−20 % por estancia larga (28+ noches)', en: '−20 % long stay (28+ nights)' },
      { min: 14, pct: 0.10, excludeSeasons: [], es: '−10 % por estancia larga (14+ noches)', en: '−10 % long stay (14+ nights)' },
      { min:  6, pct: 0.05, excludeSeasons: [], es: '−5 % por estancia larga (6+ noches)',  en: '−5 % long stay (6+ nights)' },
    ];

// Suplemento mascota. Contract: 10€/noche con máximo 50€/estancia.
// Si rules.petPerNight/petMax existen, los respeta; si no, cae al
// petFlatFee legacy (fijo) o al fallback hardcoded.
const PET_RULES = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
const PET_PER_NIGHT = typeof PET_RULES.petPerNight === 'number' ? PET_RULES.petPerNight : null;
const PET_MAX       = typeof PET_RULES.petMax       === 'number' ? PET_RULES.petMax       : null;
const PET_SUPP_FLAT = typeof PET_RULES.petFlatFee   === 'number' ? PET_RULES.petFlatFee   : 50;
const _petCost = (nights) => {
  if (PET_PER_NIGHT !== null && PET_MAX !== null) {
    return Math.min(nights * PET_PER_NIGHT, PET_MAX);
  }
  return PET_SUPP_FLAT;
};

// Suplementos escalonados por número de huéspedes (precio base = 1 huésped).
// Sumamos los tramos perNight entre 1 y el número de huéspedes seleccionado.
// Por ejemplo, 4 huéspedes = supp(1→2) + supp(2→3) + supp(3→4) por noche.
const _guestSuppPerNight = (guests) => {
  const rules = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
  const supps = Array.isArray(rules.guestSupplements) ? rules.guestSupplements : null;
  if (!supps || !guests || guests <= 2) return 0;
  let total = 0;
  for (const s of supps) {
    if (typeof s.to === 'number' && s.to <= guests && typeof s.perNight === 'number') {
      total += s.perNight;
    }
  }
  return total;
};

// helpers compat con el motor de calendario
const _be_adj = (ds, n) => {
  const d = new Date(ds + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const _be_diff = (a, b) =>
  Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);

const _dayPrice = (ds, aptId) => {
  // v2 (prices.json) tiene resolución por día, así que preferimos eso.
  // Si no está disponible, caemos a la tabla mensual + peaks (motor antiguo).
  const v2price = _dayPriceV2(ds, aptId);
  if (v2price !== null && Number.isFinite(v2price)) return v2price;
  const tbl = HESTIA_PRICES[aptId];
  if (!tbl) return 0;
  const month = parseInt(ds.slice(5, 7), 10);
  const mmdd  = ds.slice(5);
  for (const pk of (tbl.peaks || [])) {
    if (pk.from > pk.to) {
      if (mmdd >= pk.from || mmdd < pk.to) return pk.pn;
    } else {
      if (mmdd >= pk.from && mmdd < pk.to) return pk.pn;
    }
  }
  return tbl.base[month] || 100;
};

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  _calcStay, FUENTE ÚNICA DE VERDAD DEL PRECIO NOCHE A NOCHE.               ║
// ║                                                                            ║
// ║  TODO sitio que muestre un precio de estancia (páginas de apartamento, la  ║
// ║  Home, /reservas, estancia larga, admin) DEBE llamar a esta función y      ║
// ║  mostrar su resultado tal cual (calc.directTotal / calc.avgPerNight). Así  ║
// ║  es IMPOSIBLE que dos páginas muestren un precio distinto para las mismas  ║
// ║  fechas.                                                                   ║
// ║                                                                            ║
// ║  ⛔ NUNCA calcules un precio de estancia fuera de aquí (nada de            ║
// ║     `perNight * nights`, descuentos, ofertas de hueco ni temporadas en     ║
// ║     otro componente). Si necesitas un caso nuevo, añádelo DENTRO de        ║
// ║     _calcStay. (Excepción: el precio de estancia LARGA mensual vive en su  ║
// ║     propio cálculo `calcLsTotal`, es otro producto.)                       ║
// ║                                                                            ║
// ║  Cubre: tarifa variable por noche, regla short-stay, descuento por         ║
// ║  estancia, oferta de hueco (solo si la estancia rellena el hueco exacto y  ║
// ║  no choca con manual_blocks), suplemento de huéspedes y mascota.           ║
// ║  Protegido por scripts/price-consistency.mjs (regresión).                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝
const _calcStay = (selStart, selEnd, aptId, withPets, guests) => {
  if (!selStart || !selEnd || !aptId) return null;
  const nights = _be_diff(selStart, selEnd);
  if (nights <= 0) return null;

  const sumNights = (start, n) => {
    let t = 0; let d = start;
    for (let i = 0; i < n; i++) { t += _dayPrice(d, aptId); d = _be_adj(d, 1); }
    return t;
  };

  // Regla short-stay (3-4 noches cotizadas como 5-6 menos descuento fijo).
  const v2rules = window.PRICES_V2 && window.PRICES_V2.rules;
  const shortRule = (v2rules && Array.isArray(v2rules.shortStayPricing))
    ? v2rules.shortStayPricing.find(r => r.nights === nights)
    : null;
  const horizonNights = shortRule ? shortRule.basedOnNights : nights;
  const flatDiscount  = shortRule ? shortRule.discount      : 0;

  const baseTotal = Math.round(sumNights(selStart, horizonNights) - flatDiscount);

  // Descuento por estancia larga. Excluye temporadas marcadas en JSON.
  const v2 = window.PRICES_V2;
  const seasonsInStay = new Set();
  if (v2) {
    let s = selStart;
    for (let i = 0; i < nights; i++) {
      seasonsInStay.add(_v2BumpedSeasonForDate(s, v2));
      s = _be_adj(s, 1);
    }
  }
  const stayD = STAY_DISCOUNTS.find(d => {
    if (nights < d.min) return false;
    const excl = d.excludeSeasons || [];
    if (excl.some(season => seasonsInStay.has(season))) return false;
    return true;
  }) || null;
  const stayDiscAmt = stayD ? Math.round(baseTotal * stayD.pct) : 0;
  const afterStay   = baseTotal - stayDiscAmt;

  const petAmt = withPets ? _petCost(nights) : 0;

  // Suplemento por huéspedes: base = 1 huésped, se suma escalón a escalón.
  const guestSuppPerNight = _guestSuppPerNight(guests);
  const guestSuppAmt = guestSuppPerNight * nights;

  let fBaseTotal = baseTotal, fStayD = stayD, fStayDiscAmt = stayDiscAmt, fAfterStay = afterStay;
  let isGapOffer = false, gapPerNight = null;

  // Oferta de hueco (gapOverrides): SOLO se aplica si la estancia rellena EXACTAMENTE
  // el hueco, la entrada coincide con el inicio (clave aptId|selStart) Y la salida
  // con el fin del hueco. Si la estancia se sale del hueco, NO aplica (precio normal).
  // Vive aquí para que apartamento, home y reservas calculen siempre igual.
  // Validación en runtime: una reserva directa instantánea (manual_blocks de
  // prices.json) que solape las fechas invalida la oferta aun antes del recálculo
  // del workflow (cada 4h). Las externas (iCal) ya entran sincronizadas con el pruning.
  const _mb = (v2 && v2.manual_blocks && v2.manual_blocks[aptId]) || [];
  const _gapBlocked = _mb.some(b => selStart < b.end && selEnd > b.start);
  const gov = v2 && v2.gapOverrides && v2.gapOverrides[`${aptId}|${selStart}`];
  if (gov && gov.type && gov.type !== 'none' && gov.end === selEnd && !_gapBlocked) {
    const seasonBase = Math.round(((v2.apts && v2.apts[aptId] && v2.apts[aptId].base) || 0)
      * ((v2.seasons && v2.seasons[_v2SeasonForDate(selStart, v2)] && v2.seasons[_v2SeasonForDate(selStart, v2)].multiplier) || 1));
    let pn;
    if (gov.type === 'fixed')          pn = gov.value;
    else if (gov.type === 'discount')  pn = Math.round(seasonBase * (1 - gov.value / 100));
    else if (gov.type === 'increment') pn = Math.round(seasonBase * (1 + gov.value / 100));
    else pn = seasonBase;
    fBaseTotal = pn * nights;
    fStayD = null; fStayDiscAmt = 0; fAfterStay = fBaseTotal;
    isGapOffer = true; gapPerNight = pn;
  }

  const directTotal  = fAfterStay + petAmt + guestSuppAmt;
  const avgPerNight  = Math.round((fAfterStay + guestSuppAmt) / nights);
  if (!Number.isFinite(directTotal)) return null;

  return {
    nights, baseTotal: fBaseTotal, stayD: fStayD, stayDiscAmt: fStayDiscAmt, afterStay: fAfterStay,
    petAmt, guestSuppPerNight, guestSuppAmt, guests: guests || null,
    directTotal, avgPerNight, isGapOffer, gapPerNight,
  };
};

// ================================================================
// Alternativas cercanas con disponibilidad. Cuando el huésped comprueba
// disponibilidad y su propuesta (apt + fechas) está ocupada, buscamos las
// opciones libres más próximas: mismas fechas en otro Hestía, o las mismas
// noches en fechas cercanas (±28 días) para el/los apartamentos que buscaba.
// Devuelve cada alternativa con su precio (fuente única: _calcStay), ordenadas
// de más cercana a más lejana. Sin estado, reutilizable en home y /reservas.
// ================================================================
const _ALT_APTS = [
  { id: 'vm', name: 'Hestía Mar',      slug: 'mar',      accent: '#6B7A3A' },
  { id: 'vt', name: 'Hestía Thalassa', slug: 'thalassa', accent: '#B86A3C' },
  { id: 'vs', name: 'Hestía Salinas',  slug: 'salinas',  accent: '#D4A84A' },
];
function _hestiaFindAlternatives({ checkin, checkout, apt, avail, guests, max = 4, windowDays = 28 }) {
  if (!checkin || !checkout || !avail || typeof _calcStay !== 'function') return [];
  const _adj = (ds, n) => { const d = new Date(ds + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const _diff = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
  const nights = _diff(checkin, checkout);
  if (nights < 1) return [];

  const wantIds  = apt ? [apt] : ['vm', 'vt', 'vs'];
  const otherIds = _ALT_APTS.map(a => a.id).filter(id => !wantIds.includes(id));
  const today    = new Date().toISOString().slice(0, 10);
  const v2        = window.PRICES_V2 || {};
  const rules     = v2.rules || {};
  const baseMinN  = rules.minNights || 3;
  const critMinN  = rules.criticalSeasonMinNights || baseMinN;
  const horizon   = (v2.bookingHorizon && v2.bookingHorizon.lastCheckinDate) || null;
  const isCrit    = (ds) => (typeof _v2BumpedSeasonForDate === 'function') ? _v2BumpedSeasonForDate(ds, v2) === 'critica' : false;
  const isFree    = (id, cin, cout) => { const blk = avail[id] && avail[id].blocked; if (!blk) return false; return !blk.some(r => cin < r.end && cout > r.start); };

  const out = [];
  const seen = new Set();
  const perAptN = {};
  const tryAdd = (id, cin) => {
    if ((perAptN[id] || 0) >= max) return;  // basta con guardar las `max` más cercanas de cada Hestía
    const cout = _adj(cin, nights);
    if (cin < today) return;
    if (horizon && cin > horizon) return;
    if (nights < (isCrit(cin) ? critMinN : baseMinN)) return;
    if (!isFree(id, cin, cout)) return;
    const key = id + cin;
    if (seen.has(key)) return;
    seen.add(key);
    const calc = _calcStay(cin, cout, id, false, parseInt(guests, 10) || null);
    if (!calc) return;
    const meta = _ALT_APTS.find(a => a.id === id);
    perAptN[id] = (perAptN[id] || 0) + 1;
    out.push({
      aptId: id, aptName: meta.name, slug: meta.slug, accent: meta.accent,
      checkin: cin, checkout: cout, nights,
      total: calc.directTotal, avgPerNight: calc.avgPerNight,
      shiftDays: _diff(checkin, cin), sameDates: cin === checkin,
    });
  };

  // 1) Mismas fechas, otro Hestía (la alternativa más cercana: mismo viaje, otra casa).
  otherIds.forEach(id => tryAdd(id, checkin));
  // 2) Mismas noches en fechas cercanas, de más próxima a más lejana, para los 3.
  for (let d = 1; d <= windowDays; d++) {
    wantIds.forEach(id => { tryAdd(id, _adj(checkin, -d)); tryAdd(id, _adj(checkin, d)); });
  }

  // Diversificar por apartamento: primero la opción más cercana de CADA Hestía
  // (ordenadas entre sí por proximidad de fechas), luego la 2ª de cada uno, etc.
  // Así la lista no se llena con un solo apartamento y aparecen los 3 Hestías,
  // siempre dando prioridad a las fechas más próximas a lo que pidió el huésped.
  const byApt = {};
  out.forEach(o => { (byApt[o.aptId] = byApt[o.aptId] || []).push(o); });
  Object.values(byApt).forEach(list => list.sort((a, b) =>
    (Math.abs(a.shiftDays) - Math.abs(b.shiftDays)) || (a.total - b.total)));
  Object.values(byApt).forEach(list => list.forEach((o, i) => { o._rank = i; }));
  out.sort((a, b) =>
    (a._rank - b._rank) ||
    (Math.abs(a.shiftDays) - Math.abs(b.shiftDays)) ||
    (a.total - b.total));
  out.forEach(o => { delete o._rank; });
  return out.slice(0, max);
}

// ================================================================
// DateRangePicker: calendario doble con bloqueadas visibles, auto-jump
// al checkout y preview en hover. Mismas mecánicas y estética que el
// HsDateRange de la home, expuesto vía window para uso en /reservas.
// ================================================================
const _drAvail = (checkin, checkout, blocked) => {
  if (!blocked) return null;
  return !blocked.some(r => checkin < r.end && checkout > r.start);
};
const _drAdj = (ds, n) => {
  const d = new Date(ds + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const _drDiff = (a, b) =>
  Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
const _drFmtDate = (ds, lang) => {
  if (!ds) return '';
  const dd = ds.slice(8,10), mm = ds.slice(5,7), yy = ds.slice(2,4);
  return lang === 'en' ? `${mm}-${dd}-${yy}` : `${dd}-${mm}-${yy}`;
};
const _drToday = () => new Date().toISOString().slice(0, 10);

const DateRangePicker = ({
  checkin, checkout, setCheckin, setCheckout,
  blocked, lang, today,
  accent,
  minNightsOverride,
  gapOffers,
}) => {
  const [hover, setHover] = React.useState(null);
  const [drMsg, setDrMsg] = React.useState(null);
  const t = today || _drToday();
  const todayDate = new Date(t + 'T12:00:00Z');
  const [viewY, setViewY] = React.useState(todayDate.getUTCFullYear());
  const [viewM, setViewM] = React.useState(todayDate.getUTCMonth());

  const blockedList = blocked || [];
  const horizonStr = (window.PRICES_V2 && window.PRICES_V2.bookingHorizon
    && window.PRICES_V2.bookingHorizon.lastCheckinDate) || null;
  const _isBeyondHorizon = (ds) => !!(horizonStr && ds > horizonStr);
  const _isBlk = (ds) => blockedList.some(r => ds >= r.start && ds < r.end);
  // Estancia mínima, capas de reglas:
  //   1) 1 noche → siempre prohibida.
  //   2) Por defecto: 3 noches mínimo (minNights).
  //   3) Temporada crítica: 7 noches mínimo (criticalSeasonMinNights).
  //   4) Excepción 2 noches (twoNightFloor): solo si el check-in cae en
  //      la semana actual (≤ imminentDays) O si el rango rellena
  //      exactamente un hueco entre dos reservas (gap-fill).
  //   minNightsOverride: fuerza un mínimo absoluto (p.ej. 29 para estancias largas).
  const rules = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
  const baseMinN     = minNightsOverride || rules.minNights || 3;
  const twoNightFloor = minNightsOverride ? minNightsOverride : (rules.twoNightFloor || 2);
  const criticalMinN = minNightsOverride || rules.criticalSeasonMinNights || baseMinN;
  const imminentD    = rules.imminentDays || 7;
  const _isCriticalDate = (ds) => {
    const v2 = window.PRICES_V2;
    if (!v2 || typeof _v2BumpedSeasonForDate !== 'function') return false;
    return _v2BumpedSeasonForDate(ds, v2) === 'critica';
  };
  const _isGapFiller = (cin, cout) => {
    if (!cin || !cout) return false;
    const dayBefore = _drAdj(cin, -1);
    const beforeBlk = blockedList.some(r => dayBefore >= r.start && dayBefore < r.end);
    const checkoutStartsBlk = blockedList.some(r => r.start === cout);
    if (beforeBlk && checkoutStartsBlk) return true;
    // Un trozo de hueco con oferta (entrada = inicio y salida = fin del trozo)
    // también cuenta como relleno de hueco: se puede reservar aunque el trozo
    // baje del mínimo de noches (así los huecos largos troceados son reservables).
    return (gapOffers || []).some(o => o && o.start === cin && o.end === cout && o.type && o.type !== 'none');
  };
  const _effectiveMinN = (cin, coutCandidate) => {
    if (!cin) return baseMinN;
    const isImminent = _drDiff(t, cin) <= imminentD;
    const isGapFill  = coutCandidate && _isGapFiller(cin, coutCandidate);
    // Excepción universal de 2 noches: aplica incluso en temporada crítica.
    if (isImminent || isGapFill) return twoNightFloor;
    // Sin excepción: crítica → criticalMinN; resto → baseMinN.
    if (_isCriticalDate(cin)) return criticalMinN;
    return baseMinN;
  };
  // Día "demasiado cerca del check-in para ser un check-out válido".
  // Cuando ya hay check-in seleccionado, los días entre checkin+1 y
  // checkin+effectiveMin-1 NO son seleccionables como check-out.
  const _tooSoonForCheckout = (ds) => {
    if (!checkin || checkout) return false;
    if (ds <= checkin) return false;
    return _drDiff(checkin, ds) < _effectiveMinN(checkin, ds);
  };

  // Día "partido": el primer día de un rango bloqueado tiene la mañana
  // libre (el huésped que llega lo hace a las 15:00). Por tanto puede
  // usarse como check-out, pero NUNCA como check-in.
  const _isBlkStart = (ds) => _isBlk(ds) && !_isBlk(_drAdj(ds, -1));

  let previewEnd = null;
  if (checkin && !checkout && hover && hover > checkin) {
    // El hover puede ser un blocked-start (check-out válido), comprueba
    // que el camino intermedio entre check-in y hover está libre.
    let ok = true;
    let cur = _drAdj(checkin, 1);
    while (cur < hover) { if (_isBlk(cur)) { ok = false; break; } cur = _drAdj(cur, 1); }
    if (ok) previewEnd = hover;
  }

  const handleDayClick = (ds) => {
    if (ds < t || _isBeyondHorizon(ds)) return;
    const blk      = _isBlk(ds);
    const blkStart = blk && _isBlkStart(ds);
    // Día completamente bloqueado (mid-block o fin de bloque interior):
    // no puede ser ni check-in ni check-out.
    if (blk && !blkStart) return;

    // Fase: elegir check-in. Un blocked-start NO sirve como check-in
    // (la noche está ocupada). Pulsar lo trata como "cambiar selección".
    if (!checkin || checkout || ds <= checkin) {
      if (blkStart) return;
      setCheckin(ds); setCheckout(''); setDrMsg(null); return;
    }
    // Fase: elegir check-out. Rechaza si el rango < effectiveMin para
    // este check-in. Crítica = 7 noches salvo que sea inminente o
    // rellene exactamente un hueco entre reservas existentes.
    const nights = _drDiff(checkin, ds);
    const effMin = _effectiveMinN(checkin, ds);
    if (nights === 1) {
      setDrMsg({
        type: 'error',
        es: 'No se permiten reservas de 1 noche. La estancia mínima es 2 noches.',
        en: 'One-night bookings are not allowed. Minimum stay is 2 nights.',
      });
      return;
    }
    if (nights < effMin) {
      const isCrit = _isCriticalDate(checkin);
      setDrMsg({
        type: 'error',
        es: isCrit
          ? `Temporada crítica: estancia mínima ${effMin} noches. Excepción: 2 noches solo si el check-in es esta semana (≤${imminentD} días) o el rango rellena exactamente un hueco entre dos reservas existentes.`
          : `Estancia mínima ${effMin} noches. Las reservas de 2 noches solo se permiten para la semana actual (≤${imminentD} días) o cuando rellenan exactamente un hueco entre dos reservas existentes.`,
        en: isCrit
          ? `Critical season: minimum stay ${effMin} nights. Exception: 2 nights only if check-in is this week (≤${imminentD} days) or the range exactly fills a gap between two existing bookings.`
          : `Minimum stay ${effMin} nights. Two-night stays are only allowed for the current week (≤${imminentD} days) or when they exactly fill a gap between two existing bookings.`,
      });
      return;
    }
    // Verificamos camino libre (sin bloqueadas en el medio).
    let cur = _drAdj(checkin, 1);
    while (cur < ds) {
      if (_isBlk(cur)) { setCheckin(ds); setCheckout(''); setDrMsg(null); return; }
      cur = _drAdj(cur, 1);
    }
    setCheckout(ds);
    setDrMsg(null);
    _hestiaTrack('dates_selected', { checkin, checkout: ds, nights });
  };

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WDS_ES = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
  const WDS_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const renderMonth = (y, m) => {
    const nDays  = new Date(y, m + 1, 0).getDate();
    let firstDow = new Date(y, m, 1).getDay();
    firstDow = firstDow === 0 ? 6 : firstDow - 1;
    const wds   = lang === 'es' ? WDS_ES : WDS_EN;
    const mName = (lang === 'es' ? MONTHS_ES : MONTHS_EN)[m];
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push({ empty: true, k: `e${i}` });
    for (let d = 1; d <= nDays; d++) cells.push({ d, k: d });
    return (
      <div className="cal-month" key={`${y}-${m}`}>
        <div className="cal-mhd">{mName} <span className="cal-yr">{y}</span></div>
        <div className="cal-grid">
          {wds.map(w => <div key={w} className="cal-wd">{w}</div>)}
          {cells.map(cell => {
            if (cell.empty) return <div key={cell.k} className="cal-cell cal-empty"/>;
            const { d } = cell;
            const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isPast   = ds < t;
            const isBeyond = _isBeyondHorizon(ds);
            const isToday  = ds === t;
            const isBlk    = _isBlk(ds);
            const prevBlk  = isBlk && _isBlk(_drAdj(ds, -1));
            const nextBlk  = isBlk && _isBlk(_drAdj(ds,  1));
            const isBlkStart  = isBlk && !prevBlk;
            const isBlkEnd    = isBlk && !nextBlk;
            const isBlkSingle = isBlkStart && isBlkEnd;
            const isBlkMid    = isBlk && !isBlkStart && !isBlkEnd;
            // Día POST-bloqueo: no está bloqueado pero el día anterior sí.
            // Su mañana está "ocupada" (huésped sale en checkout) y la
            // tarde libre (puedes hacer check-in). Visual: left-strip.
            const isBlkAfter  = !isBlk && _isBlk(_drAdj(ds, -1));
            const inSel = !!(checkin && checkout && ds >= checkin && ds <= checkout);
            const isSS  = inSel && ds === checkin;
            const isSE  = inSel && ds === checkout;
            const isSM  = inSel && !isSS && !isSE;
            const inPrev = !!(checkin && !checkout && previewEnd && ds >= checkin && ds <= previewEnd);
            const isPS   = inPrev && ds === checkin;
            const isPE   = inPrev && ds === previewEnd;
            const isPM   = inPrev && !isPS && !isPE;
            // Demasiado cerca del check-in para ser check-out válido
            // (rango < minNights). Se marca como "too-soon" y no clickable.
            const isTooSoon = _tooSoonForCheckout(ds);
            // Un blocked-start es clickable (puede ser check-out: mañana libre)
            const isClickable = !isPast && !isBeyond && !isTooSoon && (!isBlk || isBlkStart);
            const showBlk = isBlk && !inSel && !inPrev;
            return (
              <div key={d}
                className={['cal-cell',(isPast||isBeyond)&&'past',isToday&&'today',isBlk&&'blk',
                  isBlkAfter && 'blk-after',
                  isTooSoon && 'too-soon',
                  isClickable&&'clickable',inSel&&'in-sel',isSS&&'sel-s',isSE&&'sel-e',isSM&&'sel-m',
                  inPrev&&'in-prev',isPS&&'prev-s',isPE&&'prev-e',isPM&&'prev-m',
                ].filter(Boolean).join(' ')}
                onClick={isClickable ? () => handleDayClick(ds) : undefined}
                onMouseEnter={isClickable && !checkout ? () => setHover(ds) : undefined}
                onMouseLeave={isClickable ? () => setHover(null) : undefined}
                title={isTooSoon ? (lang === 'es' ? `Estancia mínima ${_effectiveMinN(checkin, ds)} noches` : `Minimum stay ${_effectiveMinN(checkin, ds)} nights`) : undefined}>
                {/* Día PRE-bloqueo (primer día del rango): right-strip
                    tarde-onward bloqueada, mañana libre como check-out. */}
                {showBlk && !isBlkSingle && isBlkStart && <div className="c-strip c-sr"/>}
                {/* Días bloqueados intermedios y último del rango (también
                    fully ocupado de noche): strip sólido. */}
                {showBlk && (isBlkMid || (isBlkEnd && !isBlkSingle)) && <div className="c-strip"/>}
                {/* Día POST-bloqueo (no bloqueado, anterior sí): left-strip
                    para indicar que la mañana sigue ocupada (huésped sale)
                    pero la tarde es libre como check-in. */}
                {isBlkAfter && !inSel && !inPrev && <div className="c-strip c-sl"/>}
                {/* Single-day block: strip estrecho centrado para destacar */}
                {showBlk && isBlkSingle && <div className="c-strip"/>}
                {/* Círculo en los días de TRANSICIÓN (departure y arrival) */}
                {showBlk && (isBlkStart || isBlkSingle) && <div className="c-circ"/>}
                {isBlkAfter && !inSel && !inPrev && <div className="c-circ"/>}
                {isSS && !isSE && <div className="c-strip c-sel-strip c-sr"/>}
                {isSE && !isSS && <div className="c-strip c-sel-strip c-sl"/>}
                {isSM          && <div className="c-strip c-sel-strip"/>}
                {(isSS||isSE)  && <div className="c-circ c-sel-circ"/>}
                {isPS && !isPE && <div className="c-strip c-prev-strip c-sr"/>}
                {isPE && !isPS && <div className="c-strip c-prev-strip c-sl"/>}
                {isPM          && <div className="c-strip c-prev-strip"/>}
                {(isPS||isPE)  && <div className="c-circ c-prev-circ"/>}
                {isToday && !inSel && !inPrev && <div className="c-today"/>}
                <span className="c-n">{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nextY = viewM === 11 ? viewY + 1 : viewY;
  const nextM = viewM === 11 ? 0 : viewM + 1;
  const canGoPrev = viewY > todayDate.getUTCFullYear() || viewM > todayDate.getUTCMonth();
  const prevMonth = () => { if (!canGoPrev) return; if (viewM === 0) { setViewY(y => y - 1); setViewM(11); } else setViewM(m => m - 1); };
  const nextMonth = () => { if (viewM === 11) { setViewY(y => y + 1); setViewM(0); } else setViewM(m => m + 1); };

  const months = lang === 'es' ? MONTHS_ES : MONTHS_EN;
  const navLbl = `${months[viewM]} · ${months[nextM]} ${nextY}`;
  const nights = checkin && checkout ? _drDiff(checkin, checkout) : null;
  const acc = accent || '#1BC8D8';

  // Deriva variables CSS de selección desde el acento (rgba con alpha)
  const _toRgb = (hex) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r, g, b] = _toRgb(acc);

  return (
    <div className="hscal-wrap" style={{
      '--apt-accent': acc,
      '--sel-fill':   `rgba(${r},${g},${b},.22)`,
      '--sel-circ':   `rgba(${r},${g},${b},.90)`,
      '--prev-fill':  `rgba(${r},${g},${b},.11)`,
      '--prev-circ':  `rgba(${r},${g},${b},.48)`,
    }}>
      <div className="hscal-phase-hint">
        {!checkin  ? (lang === 'es' ? '↓ Elige fecha de entrada'       : '↓ Choose check-in date')
         : !checkout ? (lang === 'es' ? '→ Ahora elige la fecha de salida' : '→ Now choose check-out date')
         : null}
      </div>
      {drMsg && (
        <div className={`hscal-msg hscal-msg-${drMsg.type || 'info'}`} role={drMsg.type === 'error' ? 'alert' : 'status'}>
          {drMsg[lang] || drMsg.es}
        </div>
      )}
      <div className="avail-nav hscal-nav">
        <button type="button" className={`avail-arr${canGoPrev ? '' : ' off'}`} onClick={prevMonth}
          aria-label={lang === 'es' ? 'Mes anterior' : 'Previous month'}>‹</button>
        <span className="avail-nav-lbl">{navLbl}</span>
        <button type="button" className="avail-arr" onClick={nextMonth}
          aria-label={lang === 'es' ? 'Mes siguiente' : 'Next month'}>›</button>
      </div>
      <div className="hscal-months" onMouseLeave={() => { if (!checkout) setHover(null); }}>
        {renderMonth(viewY, viewM)}
        {renderMonth(nextY, nextM)}
      </div>
      {(checkin || checkout) && (
        <div className="hscal-sel-row">
          {checkin && (
            <span className="hscal-sel-item">
              <span className="hscal-sel-lbl">{lang === 'es' ? 'Entrada' : 'Check-in'}</span>
              <strong>{_drFmtDate(checkin, lang)}</strong>
            </span>
          )}
          {checkout && (
            <span className="hscal-sel-item">
              <span className="hscal-sel-lbl">{lang === 'es' ? 'Salida' : 'Check-out'}</span>
              <strong>{_drFmtDate(checkout, lang)}</strong>
            </span>
          )}
          {nights && (
            <div className="hs-nights-badge">
              <span className="hs-nights-n">{nights}</span>
              <span className="hs-nights-lbl">{lang === 'es' ? 'noches' : 'nights'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// Video loop fade, añade fade-out 0.65 s antes del final + fade-in
// al recomenzar para que el corte del loop no se note.
// Funciona sobre cualquier <video loop> del sitio (excepto los que
// llevan data-no-loop-fade). La CSS aplica transition opacity y la
// clase .is-fading se añade/quita aquí según currentTime/duration.
// ────────────────────────────────────────────────────────────────
const _initVideoFadeLoop = (() => {
  const FADE_S = 0.65;
  const attached = new WeakSet();
  const attach = (v) => {
    if (attached.has(v) || !v || v.dataset.noLoopFade !== undefined) return;
    attached.add(v);
    let lastT = 0;
    const tick = () => {
      const t = v.currentTime;
      const d = v.duration;
      if (!d || isNaN(d) || d < FADE_S * 2.5) return;
      if (t < lastT) {
        // El loop ha vuelto al principio (currentTime se reseteó).
        v.classList.remove('is-fading');
      } else if (d - t < FADE_S) {
        v.classList.add('is-fading');
      } else if (t > FADE_S && v.classList.contains('is-fading')) {
        v.classList.remove('is-fading');
      }
      lastT = t;
    };
    v.addEventListener('timeupdate', tick);
    v.addEventListener('seeking', () => {
      if (v.currentTime < FADE_S) v.classList.remove('is-fading');
    });
  };
  let initialized = false;
  return () => {
    if (initialized) return;
    initialized = true;
    const scan = (root) => {
      (root.querySelectorAll ? root.querySelectorAll('video[loop]') : []).forEach(attach);
      if (root instanceof HTMLVideoElement && root.hasAttribute('loop')) attach(root);
    };
    scan(document);
    const mo = new MutationObserver((muts) => {
      muts.forEach(m => m.addedNodes.forEach(n => { if (n instanceof Element) scan(n); }));
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };
})();
// Auto-init en cuanto se carga el módulo.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initVideoFadeLoop, { once: true });
  } else {
    _initVideoFadeLoop();
  }
}

// useSectionGlow, barra fija en la parte superior del viewport que anima
// con el color de la paleta cada vez que una nueva sección entra al scroll.
// Oscuro → buganvilla (#D42B80), crema → turquesa (#1BC8D8).
// Usa Web Animations API para reiniciar la animación de forma fiable.
const useSectionGlow = () => {
  React.useEffect(() => {
    const bar = document.createElement('div');
    bar.className = 'sgt-bar';
    document.body.appendChild(bar);

    const COLORS = { dark: '#D42B80', cream: '#1BC8D8' };
    let currentAnim = null;

    const trigger = (color) => {
      if (currentAnim) { currentAnim.cancel(); currentAnim = null; }
      bar.style.setProperty('--sgt-color', color);
      currentAnim = bar.animate([
        { transform: 'scaleX(0)', opacity: 1 },
        { transform: 'scaleX(1)', opacity: 1, offset: 0.52 },
        { transform: 'scaleX(1)', opacity: 0 },
      ], { duration: 1050, easing: 'cubic-bezier(.16,.84,.44,1)' });
      currentAnim.addEventListener('finish', () => { currentAnim = null; });
    };

    const sections = document.querySelectorAll('section.section-dark, section.section-cream');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.sgtFired) {
          e.target.dataset.sgtFired = '1';
          trigger(e.target.classList.contains('section-dark') ? COLORS.dark : COLORS.cream);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

    sections.forEach(s => io.observe(s));
    return () => {
      io.disconnect();
      if (currentAnim) currentAnim.cancel();
      bar.remove();
    };
  }, []);
};

// _calcLsTotal: tarifa larga estancia (≥29 noches, Sep–Jun).
// Pro-rata diario: base mensual / días del mes, día a día.
// Noches de Navidad y Semana Santa: tarifa especial plana.
const _calcLsTotal = (start, end, guests, withPets, aptId) => {
  if (!start || !end || start >= end) return null;
  const lsCfg          = (window.PRICES_V2 && window.PRICES_V2.longStayConfig) || { specialNightFlat: 80, easterRanges: [] };
  const flat           = lsCfg.specialNightFlat  || 80;
  const easter         = lsCfg.easterRanges       || [];
  const extraGuestPerMo = lsCfg.extraGuestPerMonth || 0;
  const petPerMo       = lsCfg.petPerMonth        || 0;
  const aptSupp        = ((lsCfg.aptSupplement || {})[aptId] || 0);
  const extraGuests    = Math.max(0, (guests || 1) - 2);
  const rates          = lsCfg.monthlyRates || { baja: 1490, media: 1590, alta: 1850 };
  const isXmas = (ds) => { const m = +ds.slice(5,7), d = +ds.slice(8,10); return (m===12&&d>=23)||(m===1&&d<=6); };
  const isEast = (ds) => easter.some(([s,e]) => ds>=s && ds<=e);
  const adj = (ds, n) => { const dt = new Date(ds+'T12:00:00Z'); dt.setUTCDate(dt.getUTCDate()+n); return dt.toISOString().slice(0,10); };
  let total = 0, specialN = 0, cur = start;
  while (cur < end) {
    const mo = +cur.slice(5,7);
    if (mo === 7 || mo === 8) return null;
    const yr = +cur.slice(0,4);
    const dim = new Date(yr, mo, 0).getDate();
    const rate = (mo===6||mo===9) ? rates.alta : (mo===5||mo===10) ? rates.media : rates.baja;
    const special = isXmas(cur) || isEast(cur);
    total += special ? flat : (rate + aptSupp) / dim;
    if (extraGuests > 0) total += extraGuests * extraGuestPerMo / dim;
    if (withPets)        total += petPerMo / dim;
    if (special) specialN++;
    cur = adj(cur, 1);
  }
  return { total: Math.round(total), specialNights: specialN };
};

// Envío fiable de leads a Web3Forms. Un lead que falla al enviarse NO se pierde:
// se encola en localStorage y se reintenta al cargar cualquier página. Cierra el
// agujero del envío fire-and-forget del formulario de reserva (una solicitud que
// no llegaba a vuestro email desaparecía sin rastro).
const _HESTIA_W3F_KEY = '95a86784-6d6a-496f-9830-15759c0a3cff';
const _HESTIA_LEADQ   = '_hestiaLeadQueue';

async function _hestiaPostLead(fields) {
  const fd = new FormData();
  if (!('access_key' in fields)) fd.append('access_key', _HESTIA_W3F_KEY);
  for (const [k, v] of Object.entries(fields)) fd.append(k, v == null ? '' : String(v));
  const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
  if (!r.ok) throw new Error('web3forms ' + r.status);
  return true;
}
function _hestiaQueueLead(fields) {
  try {
    const q = JSON.parse(localStorage.getItem(_HESTIA_LEADQ) || '[]');
    q.push({ fields, ts: Date.now() });
    const cutoff = Date.now() - 30 * 864e5;   // descarta pendientes > 30 días
    localStorage.setItem(_HESTIA_LEADQ, JSON.stringify(q.filter(x => x.ts > cutoff).slice(-20)));
  } catch (_) {}
}
// Entrega el lead ya; si la red falla, lo encola. Devuelve true si se entregó.
async function _hestiaSendLead(fields) {
  try { await _hestiaPostLead(fields); return true; }
  catch (_) { _hestiaQueueLead(fields); return false; }
}
// Variante para código que ya construyó un FormData (sin ficheros, solo texto).
function _hestiaSendLeadFd(fd) {
  return _hestiaSendLead(Object.fromEntries(fd.entries()));
}
// Reintenta los leads pendientes al cargar, sin bloquear el render.
async function _hestiaFlushLeads() {
  let q;
  try { q = JSON.parse(localStorage.getItem(_HESTIA_LEADQ) || '[]'); } catch (_) { return; }
  if (!q.length) return;
  const keep = [];
  for (const item of q) {
    try { await _hestiaPostLead(item.fields); } catch (_) { keep.push(item); }
  }
  try { localStorage.setItem(_HESTIA_LEADQ, JSON.stringify(keep)); } catch (_) {}
}
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('load', () => setTimeout(() => { _hestiaFlushLeads(); }, 3000));
}

// Monitorización mínima de errores en producción. Hoy, si una página peta en
// vivo (componente roto, token caducado, CDN caído) nadie se entera hasta que
// un huésped lo dice. Esto envía, como mucho UNA vez por sesión y por mensaje,
// los errores no capturados de NUESTRO código a /err del worker de analytics.
// Filtra ruido de extensiones y scripts de terceros (solo nuestro origen).
const _HESTIA_ERR_URL = 'https://hestia-analytics.hestia-vera-almeria.workers.dev/err';
function _hestiaReportError(msg, src, line) {
  try {
    msg = String(msg || '').slice(0, 300);
    if (!msg) return;
    if (src && src.indexOf(location.origin) !== 0 && src.charAt(0) !== '/') return;
    const flag = '_heErr_' + msg.slice(0, 48);
    if (sessionStorage.getItem(flag)) return;
    sessionStorage.setItem(flag, '1');
    const body = JSON.stringify({
      msg, src: src || '', line: line || 0, page: location.pathname,
      ua: (navigator.userAgent || '').slice(0, 180), t: Date.now(),
    });
    if (navigator.sendBeacon) navigator.sendBeacon(_HESTIA_ERR_URL, body);
    else fetch(_HESTIA_ERR_URL, { method: 'POST', body, keepalive: true }).catch(() => {});
  } catch (_) {}
}
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('error', (e) => { if (e && e.message) _hestiaReportError(e.message, e.filename, e.lineno); });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e && e.reason;
    _hestiaReportError('unhandledrejection: ' + (r && r.message ? r.message : r), location.pathname, 0);
  });
}

Object.assign(window, { HestiaLogoMark, IconSprite, HiIcon, emojiHi, EmojiIcon, AnimatedPrice, lqipFor, BlurImg, WatermarkBadge, IndaloWatermark, IndaloLoader, IndaloShape, Wordmark, COPY, useScrollMode, useReveal, useSectionGlow, BRIDGE_PALETTE, QuickFAQ, SabiasQue, FraseHogar, StickyFacts, _HOME_FACTS_POOL, HESTIA_PRICES, STAY_DISCOUNTS, PET_SUPP_FLAT, _dayPrice, _calcStay, _dayPriceV2, _v2SeasonForDate, _v2BumpedSeasonForDate, _vt, DateRangePicker, _drAvail, _drAdj, _drDiff, _drFmtDate, _calcLsTotal, _hestiaFindAlternatives, _hestiaSendLead, _hestiaSendLeadFd, _hestiaFlushLeads });

// Ficha de Google Maps de cada Hestía (mismas que el sameAs del JSON-LD de
// mar.html / thalassa.html / salinas.html). Abren la ficha donde el huésped
// pulsa "Escribir una reseña". Las reseñas de Google son el canal que más
// reservas nuevas atrae, por eso enlazamos directo. Fuente única.
const GMAPS_PLACE = {
  vm: 'https://maps.app.goo.gl/r6tL6kJK6XHtYsCE7',
  vt: 'https://maps.app.goo.gl/daGi8o2Uh32avqhP6',
  vs: 'https://maps.app.goo.gl/Mi3z2kKjjaDqNLT98',
};
window.GMAPS_PLACE = GMAPS_PLACE;

// ================================================================
// HESTIA_RULES · Normas de la casa, fuente única (ES + EN).
// La consume la guía del huésped (apartment-guide.jsx, capítulo
// "Normas") y la página pública /normas.html (legal-page.jsx). `hi`
// es el nombre ya resuelto del icono de marca (ver GUIDE_EMOJI_HI en
// apartment-guide.jsx); `icon` se mantiene para que la guía lo pase
// por iconifyText sin cambios.
// ================================================================
const HESTIA_RULES = {
  es: {
    title: 'Normas de Hestía',
    intro: 'Estas normas vienen del contrato que firmaste con nosotros. Son sencillas y están pensadas para que tú, los próximos huéspedes y nuestros vecinos disfrutemos de Hestía.',
    items: [
      { icon: '🛒', hi: 'cart', t: 'Reponed lo que consumáis',
        d: 'Hestía dispone de productos consumibles. Si gastáis o consumís algo, intentad reponerlo: salvo el kit de bienvenida, que es un pequeño regalo nuestro. Reponed también lo que consumáis fuera de ese kit.' },
      { icon: '🌿', hi: 'olive', t: 'Cuidad el medio ambiente',
        d: 'No malgastéis la luz ni el agua. No dejéis el aire acondicionado con las ventanas abiertas o cuando salgáis. Sentíos como en vuestro hogar.' },
      { icon: '🪑', hi: 'chair', t: 'Recoged la terraza si salís',
        d: 'Cojines, toldo y plantas: especialmente si hay viento, lluvia o predicción de mal tiempo.' },
      { icon: '🛏️', hi: 'bed', t: 'Cuidad equipamiento y mobiliario',
        d: 'No extraigáis nada de Hestía. Tras vuestra estancia haremos inventario; cualquier deterioro o sustracción será responsabilidad vuestra.' },
      { icon: '🤫', hi: 'mute', t: 'Respetad el descanso',
        d: 'El vuestro y el de los vecinos. Evitad ruidos, música o jaleo a deshoras.' },
      { icon: '🚪', hi: 'door', t: 'Hestía es solo para vosotros',
        d: 'No para terceros que no figuren en la reserva.' },
      { icon: '🕒', hi: 'clock', t: 'Check-in 15:00 · Check-out 11:00',
        d: 'Necesitamos un margen considerable para dejar Hestía a punto para la siguiente llegada. Late check-out y early check-in sujetos a disponibilidad.' },
      { icon: '🚭', hi: 'nosmoking', t: 'No se fuma dentro de Hestía',
        d: 'En toda la casa está prohibido.' },
      { icon: '🏖️', hi: 'umbrella', t: 'Toallas solo dentro de Hestía',
        d: 'No las uséis en la piscina ni en la playa. Para esos sitios, llevad las vuestras.' },
      { icon: '🌬️', hi: 'wind', t: 'Tender solo en el tendedero',
        d: 'No colguéis ropa en las barandillas ni en la terraza.' },
      { icon: '🏊', hi: 'pool', t: 'Respetad las normas de la urbanización',
        d: 'Especialmente el horario de piscina y zonas comunes. El incumplimiento es responsabilidad vuestra.' },
      { icon: '🚼', hi: 'baby', t: 'Terminantemente prohibido hacer necesidades en la piscina o en cualquier zona común',
        d: 'Los bebés deben bañarse siempre con pañal de baño, nunca sin él. Si ocurre un incidente, la responsabilidad es de los familiares del bebé.' },
      { icon: '🚗', hi: 'car', t: 'No correr con el coche en la mancomunidad',
        d: 'La velocidad máxima dentro de la mancomunidad es muy baja. Hay niños, mascotas y peatones: circulad despacio, siempre. Es una norma de la comunidad y de sentido común.' },
      { icon: '🧹', hi: 'broom', t: 'No ensuciar ni deteriorar las zonas comunes',
        d: 'Jardines, piscina, ascensores, pasillos y descansillos: dejadlos como os los encontrasteis. Cualquier desperfecto o suciedad reiterada es responsabilidad del huésped.' },
      { icon: '👙', hi: 'umbrella', t: 'Urbanización textil',
        d: 'No están permitidos el naturismo ni el topless en ninguna zona de la urbanización.' },
      { icon: '👨‍👩‍👧', hi: 'baby', t: 'Menores bajo responsabilidad de sus padres',
        d: 'Cualquier incidente con menores en Hestía o en zonas comunes es responsabilidad de sus padres o tutores.' },
      { icon: '🛎️', hi: 'bell', t: 'Servicios comunes y exterior',
        d: 'Lo que pase fuera de Hestía no es responsabilidad nuestra, pero siempre intentaremos ayudaros.' },
      { icon: '🧺', hi: 'basket', t: 'Dejad Hestía limpia y recogida',
        d: 'De las sábanas y toallas nos encargamos nosotros. Por favor, no las lavéis con ropa de otro color.' },
    ],
  },
  en: {
    title: 'Hestía house rules',
    intro: 'These rules come from the contract you signed. They are simple: they exist so you, future guests and our neighbours all enjoy Hestía.',
    items: [
      { icon: '🛒', hi: 'cart', t: 'Replace what you use up',
        d: 'Hestía has consumable supplies. If you use or finish something, please try to replace it: except the welcome kit, which is a small gift from us. Replace also what you consume beyond that kit.' },
      { icon: '🌿', hi: 'olive', t: 'Look after the environment',
        d: 'Do not waste water or electricity. Never run the AC with windows open or when you leave. Treat it as your own home.' },
      { icon: '🪑', hi: 'chair', t: 'Tidy the terrace before going out',
        d: 'Cushions, awning and plants: especially when there is wind, rain or bad weather forecast.' },
      { icon: '🛏️', hi: 'bed', t: 'Care for furniture and equipment',
        d: 'Do not remove anything from Hestía. After your stay we run an inventory; any damage or loss will be your responsibility.' },
      { icon: '🤫', hi: 'mute', t: 'Respect rest hours',
        d: 'Yours and your neighbours\'. Avoid noise, music or loud gatherings late at night or early morning.' },
      { icon: '🚪', hi: 'door', t: 'Hestía is only for you',
        d: 'Not for third parties who are not on the booking.' },
      { icon: '🕒', hi: 'clock', t: 'Check-in 15:00 · Check-out 11:00',
        d: 'We need a considerable window to prepare Hestía for the next arrival. Late check-out and early check-in are subject to availability.' },
      { icon: '🚭', hi: 'nosmoking', t: 'No smoking inside Hestía',
        d: 'Strictly forbidden in the whole apartment.' },
      { icon: '🏖️', hi: 'umbrella', t: 'Towels stay inside Hestía',
        d: 'Do not take them to the pool or the beach. Use your own for those.' },
      { icon: '🌬️', hi: 'wind', t: 'Hang laundry on the drying rack only',
        d: 'Not on railings or terrace edges.' },
      { icon: '🏊', hi: 'pool', t: 'Respect the community rules',
        d: 'Especially pool hours and shared areas. Breaking those rules is your responsibility.' },
      { icon: '🚼', hi: 'baby', t: 'Strictly forbidden to relieve yourself in the pool or any shared area',
        d: 'Babies must always wear a swim nappy, never without one. If an incident happens, responsibility lies with the baby\'s family.' },
      { icon: '🚗', hi: 'car', t: 'No speeding inside the resort',
        d: 'Speed limits inside the resort are very low. Children, pets and pedestrians around: drive slowly, always. It is both a community rule and common sense.' },
      { icon: '🧹', hi: 'broom', t: 'Do not dirty or damage common areas',
        d: 'Gardens, pool, lifts, corridors and landings: leave them as you found them. Any repeated mess or damage is the guest\'s responsibility.' },
      { icon: '👙', hi: 'umbrella', t: 'Textile community',
        d: 'Naturism and topless are not allowed anywhere in the urbanisation.' },
      { icon: '👨‍👩‍👧', hi: 'baby', t: 'Minors under their parents\' responsibility',
        d: 'Any incident with minors inside Hestía or in shared areas is the responsibility of their parents/guardians.' },
      { icon: '🛎️', hi: 'bell', t: 'Common services and outside areas',
        d: 'What happens outside Hestía is not our responsibility, but we will always try to help.' },
      { icon: '🧺', hi: 'basket', t: 'Leave Hestía clean and tidy',
        d: 'We take care of sheets and towels. Please do not wash them with coloured laundry.' },
    ],
  },
};
window.HESTIA_RULES = HESTIA_RULES;

// ================================================================
// DirectBookingPerks, sección "Reserva directa, una mejor manera"
// Stat ribbon (4 cifras destacadas) + botón → rejilla de 8 cards
// ricos con icono, cifra, título y descripción. Reutilizable en
// home y cada Hestía; mismo copy ES + EN, una sola fuente.
// ================================================================
const DIRECT_PERKS = {
  es: [
    { id:'precio',    icon:'💰', stat:'✓',       t:'No solo igualamos: mejoramos cualquier precio.',   d:'El precio de la web es el directo, sin comisiones de plataforma, así que casi siempre es más barato. Las plataformas a veces hacen promociones que no controlamos; si encuentras uno más bajo, tráenoslo: no solo te lo igualamos, te lo mejoramos.' },
    { id:'comision',  icon:'🚫', stat:'~10%',    t:'Reservando directo te ahorras hasta un 10 % aprox.',    d:'Las plataformas como Booking o Airbnb añaden comisiones y cargos de servicio que aquí no existen: pagas el precio real, no el inflado por intermediarios. El ahorro exacto depende de si la plataforma ya está aplicando descuentos o programas propios que no podemos conocer, por eso decimos «hasta un 10 % aprox.».' },
    { id:'respuesta', icon:'⏱',  stat:'≤1 h',    t:'Respuesta humana, no un bot.',                    d:'Hablas directamente con Alex o Fran. Casi siempre respondemos en minutos; máximo una hora en horario activo.' },
    { id:'cancel',    icon:'🔓', stat:'✓',       t:'Mejoramos las condiciones de cancelación.',       d:'¿Necesitas algo distinto a la política estándar? Pregúntanos, miramos cada caso. Sin formularios eternos, sin sanciones ocultas.' },
    { id:'pago',      icon:'💳', stat:'✓',       t:'Pago seguro y flexible.',                         d:'Sin pre-autorizaciones que bloqueen tu tarjeta. Si necesitas plazos, los acordamos contigo. Pago directo, sin intermediarios.' },
    { id:'descuento', icon:'🎁', stat:'desde −30%', t:'Estancias largas desde {LS} €/mes.',             d:'Mínimo 29 noches · septiembre a junio (no disponible en julio ni agosto). Sin comisión, con contrato de arrendamiento firmado y trato 100 % directo.', link: { href: 'estancias-largas.html', label: 'Ver tarifas y disponibilidad →' } },
    { id:'guia',      icon:'🗝',  stat:'24/7',   t:'Guía privada y trato cercano.',                   d:'Más que una lista: Alex y Fran te preparan la llegada, te acompañan toda la estancia (recomendaciones, restaurantes, calas, rutas e instrucciones de Hestía) y te echan una mano también a la salida si hace falta. Siempre a un mensaje.' },
    { id:'aliados',   icon:'🤝', stat:'10%',     t:'Descuentos con proveedores locales.',             d:'Acabamos de empezar esta iniciativa: de momento, un 10 % en Lunar Cable Park. La lista está en tu guía privada y la iremos ampliando con más proveedores de la zona.' },
    { id:'mascotas',  icon:'🐾', stat:'3/3',     t:'Mascotas bienvenidas.',                           d:'En los tres. Petición previa y un pequeño suplemento, sin tarifas abusivas ni vetos.' },
    { id:'proceso',   icon:'📜', stat:'20%',     t:'Contrato, prereserva y resto al llegar.',         d:'Te enviamos un borrador de contrato con derechos y obligaciones de ambas partes (precios, pagos, condiciones de cancelación y normas). Lo revisas, lo rellenas, lo firmas y nos lo devuelves. Una pequeña prereserva a convenir, normalmente el 20 % del total, se paga al formalizar el contrato; el resto, al llegar a Hestía. Acusamos recibo de todo (contrato y pago) para darte confianza, garantía y seguridad en cada paso.' },
  ],
  en: [
    { id:'precio',    icon:'💰', stat:'✓',       t:'We don\'t just match, we beat any price.',        d:'The website price is the direct one, with no platform commission, so it\'s almost always cheaper. Platforms sometimes run promos we don\'t control; if you find a lower one, bring it to us: we don\'t just match it, we beat it.' },
    { id:'comision',  icon:'🚫', stat:'~10%',    t:'Book direct and save up to ~10%.',                  d:'Platforms like Booking or Airbnb add commissions and service fees that simply don\'t exist here: you pay the real price, not the inflated one. The exact saving depends on whether the platform is already applying its own discounts or programmes we can\'t know, that\'s why we say "up to ~10%".' },
    { id:'respuesta', icon:'⏱',  stat:'≤1 h',    t:'Human reply, not a bot.',                         d:'You talk directly to Alex or Fran. Usually within minutes; up to an hour during active hours.' },
    { id:'cancel',    icon:'🔓', stat:'✓',       t:'We improve cancellation terms.',                  d:'Need something different from the standard policy? Just ask, we look at each case. No endless forms, no hidden penalties.' },
    { id:'pago',      icon:'💳', stat:'✓',       t:'Safe, flexible payment.',                         d:'No pre-authorisations blocking your card. If you need installments, we agree them. Direct payment, no middleman.' },
    { id:'descuento', icon:'🎁', stat:'from −30%', t:'Long stays from €{LS}/month.',                   d:'Minimum 29 nights · September to June (not available July or August). No commission, formal lease signed by both parties, 100% direct contact.', link: { href: 'estancias-largas.html', label: 'See rates and availability →' } },
    { id:'guia',      icon:'🗝',  stat:'24/7',   t:'Private guide, personal care.',                   d:'More than a list: Alex & Fran set up your arrival, stay with you all through the trip (recommendations, restaurants, coves, routes and Hestía instructions) and give you a hand at check-out too if needed. Always one message away.' },
    { id:'aliados',   icon:'🤝', stat:'10%',     t:'Discounts with local providers.',                 d:'We just started this: for now, 10% at Lunar Cable Park. The full list is in your private guide, and we will keep adding more local providers over time.' },
    { id:'mascotas',  icon:'🐾', stat:'3/3',     t:'Pets welcome.',                                   d:'In all three Hestías. On request and with a small supplement: no abusive fees, no blanket bans.' },
    { id:'proceso',   icon:'📜', stat:'20%',     t:'Contract, deposit and balance on arrival.',       d:'We send you a draft contract with the rights and obligations of both parties (prices, payments, cancellation terms and house rules). You review it, fill it in, sign and return it. A small deposit to agree, usually 20 % of the total, is paid when the contract is signed; the rest, on arrival at Hestía. We acknowledge everything (contract and payment) so you have trust, guarantee and security at every step.' },
  ],
};

const DIRECT_RIBBON = {
  es: [
    { num:'✓',     label:'mejor precio' },
    { num:'0%',    label:'comisiones' },
    { num:'≤1 h',  label:'respuesta' },
    { num:'−30%',  label:'estancia larga' },
  ],
  en: [
    { num:'✓',     label:'better price' },
    { num:'0%',    label:'commissions' },
    { num:'≤1 h',  label:'reply' },
    { num:'−30%',  label:'long stay' },
  ],
};

// Cada perk recibe su propio acento de la paleta, 9 micro-identidades.
const _PERK_HUES = {
  precio:    { c1: '#D4A84A', c2: '#E8C476' },   // dorado/sol
  comision:  { c1: '#8B4A1E', c2: '#B86A3C' },   // siena
  respuesta: { c1: '#3AAABB', c2: '#6FC4D1' },   // turquesa
  cancel:    { c1: '#7B3B6B', c2: '#A45A8E' },   // violeta
  pago:      { c1: '#C8975A', c2: '#E2B47A' },   // albero
  descuento: { c1: '#D42B80', c2: '#E5559C' },   // buganvilla
  guia:      { c1: '#6B7A3A', c2: '#8B9A52' },   // olivo
  aliados:   { c1: '#B8622E', c2: '#D9895A' },   // cobre
  mascotas:  { c1: '#3AAABB', c2: '#6FC4D1' },   // turquesa
  proceso:   { c1: '#4E2446', c2: '#7B3B6B' },   // berenjena
};

// Modal con carrusel: una sola card visible, prev/next + dots.
// Se monta condicionalmente; cierra con backdrop click, ESC o ✕.
// Tarifa mensual de estancia larga mínima ("desde"), SIEMPRE desde prices.json:
// base más barata + suplemento de apartamento más bajo. Nunca hardcodeada.
const _lsMinMonthly = () => {
  const c = (window.PRICES_V2 && window.PRICES_V2.longStayConfig) || {};
  const r = c.monthlyRates || { baja: 1490, media: 1590, alta: 1850 };
  const supps = Object.values(c.aptSupplement || {});
  return Math.min(r.baja, r.media, r.alta) + (supps.length ? Math.min(...supps) : 0);
};
const getDirectPerks = (lang) => {
  const fmt = _lsMinMonthly().toLocaleString(lang === 'es' ? 'es-ES' : 'en-US');
  return DIRECT_PERKS[lang].map(p => p.id === 'descuento' ? { ...p, t: p.t.replace('{LS}', fmt) } : p);
};

const DirectBookingModal = ({ lang, onClose }) => {
  const list   = getDirectPerks(lang);
  const ribbon = DIRECT_RIBBON[lang];
  const len    = list.length;
  const [idx, setIdx] = React.useState(0);
  // Dirección del último cambio, 'next' o 'prev' o '' (sin dirección).
  // Usado para que la transición de card sea direction-aware.
  const [dir, setDir] = React.useState('');

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') { setDir('next'); setIdx(i => (i + 1) % len); }
      else if (e.key === 'ArrowLeft')  { setDir('prev'); setIdx(i => (i - 1 + len) % len); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [len, onClose]);

  const cur = list[idx];
  const hue = _PERK_HUES[cur.id] || _PERK_HUES.respuesta;
  const goPrev = () => { setDir('prev'); setIdx(i => (i - 1 + len) % len); };
  const goNext = () => { setDir('next'); setIdx(i => (i + 1) % len); };

  return (
    <div className="dbm-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dbm-title">
      <div className="dbm-modal" onClick={e => e.stopPropagation()}
        style={{ '--perk-c1': hue.c1, '--perk-c2': hue.c2 }}>
        {/* Capa de motas ambientales, partículas turquesas flotando */}
        <div className="dbm-motes" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="dbm-mote" style={{ '--mote-i': i }} />
          ))}
        </div>
        <button
          type="button" className="dbm-close"
          onClick={onClose}
          aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
        >×</button>

        <div className="dbm-head">
          <span className="eyebrow">
            {lang === 'es' ? 'Reserva directa' : 'Direct booking'}
          </span>
          <h3 id="dbm-title" className="dbm-title">
            {lang === 'es'
              ? <>La <em>mejor manera</em> de reservar</>
              : <>The <em>best way</em> to book</>}
          </h3>
        </div>

        <div className="dbm-ribbon">
          {ribbon.map((s, i) => (
            <div key={i} className="dbm-stat" style={{ '--stagger': `${i * 80}ms` }}>
              <span className="dbm-num">{s.num}</span>
              <span className="dbm-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="dbm-carousel">
          <button type="button" className="dbm-nav" onClick={goPrev}
            aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>←</button>
          <article
            key={cur.id}
            className={`dbm-card ${dir === 'next' ? 'is-from-right' : dir === 'prev' ? 'is-from-left' : ''}`}
            data-perk={cur.id}
          >
            <div className="dbm-card-head">
              <span className="dbm-icon" aria-hidden="true">{PERK_HI[cur.id] ? <HiIcon name={PERK_HI[cur.id]} size={26} /> : cur.icon}</span>
              <span className="dbm-card-stat">{cur.stat}</span>
            </div>
            <h4 className="dbm-card-t">{cur.t}</h4>
            <p className="dbm-card-d">{cur.d}</p>
            {cur.link && <a href={cur.link.href} className="dbm-card-link" onClick={onClose}>{cur.link.label}</a>}
          </article>
          <button type="button" className="dbm-nav" onClick={goNext}
            aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>→</button>
        </div>

        <div className="dbm-dots">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`dbm-dot ${i === idx ? 'active' : ''}`}
              onClick={() => { setDir(i > idx ? 'next' : 'prev'); setIdx(i); }}
              aria-label={`${i + 1} / ${len}`}
            />
          ))}
        </div>
        <div className="dbm-counter">{idx + 1} / {len}</div>
        <a
          href="reservas.html"
          className="dbm-cta"
          onClick={onClose}
        >
          {lang === 'es' ? 'Reservar ahora' : 'Book now'}
        </a>
      </div>
    </div>
  );
};

// Banda compacta + trigger. Se coloca encima del calendario en cada
// Hestía (y donde se quiera en el home). Al pulsar el botón, abre el
// modal con carrusel y stat ribbon.
const DirectBookingPerks = ({ lang }) => {
  const [open, setOpen] = React.useState(false);
  // El listener global hestia:open-direct-perks vive en WidgetStack
  // (mounted en todas las páginas con widgets). No lo duplicamos aquí
  // porque sino aparecían DOS modales superpuestos en home/apt y al
  // cerrar uno el otro quedaba bloqueando la página.
  return (
    <>
      <section className="dbt-band dbt-band-animated">
        <span className="dbt-spark dbt-spark-1" aria-hidden="true">✦</span>
        <span className="dbt-spark dbt-spark-2" aria-hidden="true">✦</span>
        <span className="dbt-spark dbt-spark-3" aria-hidden="true">✦</span>
        <span className="dbt-spark dbt-spark-4" aria-hidden="true">✦</span>
        <span className="dbt-spark dbt-spark-5" aria-hidden="true">✦</span>
        <div className="container dbt-inner">
          <span className="eyebrow dbt-eyebrow">
            <span className="dbt-eyebrow-dot" aria-hidden="true"></span>
            {lang === 'es' ? 'Reserva directa' : 'Direct booking'}
          </span>
          <h3 className="dbt-title">
            {lang === 'es'
              ? <>Reserva directa, <em>siempre</em> mejor.</>
              : <>Booking direct is <em>always</em> better.</>}
          </h3>
          <button
            type="button"
            className="dbt-btn"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
          >
            <span className="dbt-btn-pulse" aria-hidden="true"></span>
            <span>{lang === 'es' ? 'Ver todas las ventajas' : 'See all perks'}</span>
            <span className="dbt-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      {open && <DirectBookingModal lang={lang} onClose={() => setOpen(false)} />}
    </>
  );
};

// ================================================================
// AptDesktopSidebar, widget lateral visible solo en escritorio/iPad
// (≥900 px) en las páginas de Hestía. Sustituye a StickyFacts ahí.
// Dos cajas apiladas: ventajas resumidas (con CTA al modal completo)
// y acceso a la guía si ya estás reservado.
// ================================================================
const AptDesktopSidebar = ({ lang, onGuideClick }) => {
  const ribbon = DIRECT_RIBBON[lang];
  const [minimized, setMinimized] = React.useState(false);
  if (minimized) {
    return (
      <button
        type="button"
        className="apt-desktop-sidebar-mini"
        onClick={() => setMinimized(false)}
        aria-label={lang === 'es' ? 'Restaurar widget de reserva directa' : 'Restore direct-booking widget'}
        title={lang === 'es' ? 'Reserva directa' : 'Direct booking'}
      >
        <span className="ads-mini-star" aria-hidden="true">✦</span>
        <span className="ads-mini-label">
          {lang === 'es' ? 'Reserva directa' : 'Direct booking'}
        </span>
      </button>
    );
  }
  return (
    <aside className="apt-desktop-sidebar" aria-label={lang === 'es' ? 'Reserva directa y guía' : 'Direct booking and guide'}>
      <button
        type="button"
        className="ads-min"
        aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'}
        title={lang === 'es' ? 'Minimizar' : 'Minimize'}
        onClick={() => setMinimized(true)}
      >−</button>
      <section className="ads-card ads-perks">
        <span className="eyebrow">{lang === 'es' ? 'Reserva directa' : 'Direct booking'}</span>
        <h4 className="ads-title">
          {lang === 'es'
            ? <>La <em>mejor manera</em> de reservar</>
            : <>The <em>best way</em> to book</>}
        </h4>
        <ul className="ads-stats">
          {ribbon.map((s, i) => (
            <li key={i} className="ads-stat">
              <strong>{s.num}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="ads-btn"
          onClick={() => window.dispatchEvent(new Event('hestia:open-direct-perks'))}
        >
          <span>{lang === 'es' ? 'Ver todas las ventajas' : 'See all perks'}</span>
          <span aria-hidden="true">→</span>
        </button>
      </section>
      <section className="ads-card ads-guide">
        <span className="eyebrow">{lang === 'es' ? '¿Ya estás reservado?' : 'Already booked?'}</span>
        <h4 className="ads-title">
          {lang === 'es' ? <>Tu <em>guía privada</em></> : <>Your <em>private guide</em></>}
        </h4>
        <p className="ads-text">
          {lang === 'es'
            ? 'Recomendaciones de Alex y Fran, instrucciones de tu Hestía, planes de día y todo lo que necesitas para tu estancia.'
            : 'Alex & Fran\'s recommendations, your Hestía instructions, day plans and everything you need for your stay.'}
        </p>
        <button
          type="button"
          className="ads-btn ads-btn-ghost"
          onClick={onGuideClick}
        >
          <span>{lang === 'es' ? 'Acceder con PIN' : 'Open with PIN'}</span>
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </aside>
  );
};

Object.assign(window, { DirectBookingPerks, DirectBookingModal, AptDesktopSidebar, DIRECT_PERKS, DIRECT_RIBBON });

// ================================================================
// WidgetStack, pila de widgets flotantes independientes a la derecha
// (≥900 px). Tres widgets, cada uno con su propio botón de
// minimizar/restaurar. Estado persistido en localStorage para que
// el huésped no tenga que cerrarlos en cada página.
//   1. Reserva directa (perks summary + CTA al modal completo)
//   2. ¿Sabías que? (curiosidades rotando cada 9 s)
//   3. Tu guía privada, solo si la página tiene window.__APT__ y NO
//      se está visualizando la guía abierta.
// Todos se ocultan cuando body.guide-open (la guía Hestía está abierta)
// y cuando la búsqueda del home está activa (hs-results-change).
// ================================================================

// El stack va centrado verticalmente (top:50% + translateY(-50%)), así que
// si crece demasiado (dos cards desplegadas a la vez) empuja al de más
// arriba fuera de la pantalla por encima. Para que eso no pase, solo un
// widget puede estar desplegado a la vez: al abrir uno, el resto se pliega
// (evento global, sin depender de que compartan un padre común).
const _WIDGET_OPEN_EVENT = 'hestia:widget-open';
const _useLocalMin = (key, fallback = false) => {
  const k = `hestia-widget-${key}-min2`;          // -min2: nuevo default (todos plegados)
  const [min, setMin] = React.useState(() => {
    try { const v = localStorage.getItem(k); return v === null ? fallback : v === '1'; } catch (e) { return fallback; }
  });
  const update = (v) => {
    setMin(v);
    try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) {}
    if (!v) {
      try { window.dispatchEvent(new CustomEvent(_WIDGET_OPEN_EVENT, { detail: key })); } catch (e) {}
    }
  };
  React.useEffect(() => {
    const onOpen = (e) => { if (e.detail !== key) update(true); };
    window.addEventListener(_WIDGET_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(_WIDGET_OPEN_EVENT, onOpen);
  }, [key]);
  return [min, update];
};

// Mismo mecanismo que _useLocalMin pero para paneles flotantes sueltos que
// no se persisten entre sesiones (chat, regalo, tiempo en móvil...): abrir
// uno cierra cualquier otro que esté abierto, en vez de acumular pops uno
// encima de otro. No usa localStorage, siempre arranca cerrado.
const _useExclusiveOpen = (key) => {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onOpen = (e) => { if (e.detail !== key) setOpen(false); };
    window.addEventListener(_WIDGET_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(_WIDGET_OPEN_EVENT, onOpen);
  }, [key]);
  const setOpenExclusive = (v) => {
    setOpen(v);
    if (v) { try { window.dispatchEvent(new CustomEvent(_WIDGET_OPEN_EVENT, { detail: key })); } catch (e) {} }
  };
  return [open, setOpenExclusive];
};
Object.assign(window, { _useExclusiveOpen });

// Pastilla corporativa de minimizado, reutilizada por los 3 widgets.
// Borde redondeado a la izquierda + recta a la derecha (pegada al borde
// del viewport). Estrella sol + label en caps + tinte ber-dk corporativo.
const WidgetMiniPill = ({ icon = '✦', label, onClick, ariaLabel, className = '' }) => (
  <button
    type="button"
    className={`widget-mini ${className}`}
    onClick={onClick}
    aria-label={ariaLabel || label}
    title={label}
  >
    <span className="widget-mini-icon" aria-hidden="true">{icon}</span>
    <span className="widget-mini-label">{label}</span>
  </button>
);

const WidgetDirectBooking = ({ lang }) => {
  const [min, setMin] = _useLocalMin('direct', true);   // plegado por defecto
  const ribbon = DIRECT_RIBBON[lang];
  if (min) {
    return (
      <WidgetMiniPill
        icon={<HiIcon name="handshake" size={15} />}
        label={lang === 'es' ? 'Reserva directa' : 'Direct booking'}
        ariaLabel={lang === 'es' ? 'Restaurar reserva directa' : 'Restore direct booking'}
        onClick={() => setMin(false)}
        className="widget-mini-direct"
      />
    );
  }
  return (
    <section className="widget-card widget-direct" aria-label={lang === 'es' ? 'Reserva directa' : 'Direct booking'}>
      <button
        type="button"
        className="widget-min-btn"
        aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'}
        title={lang === 'es' ? 'Minimizar' : 'Minimize'}
        onClick={() => setMin(true)}
      >−</button>
      <span className="eyebrow">{lang === 'es' ? 'Reserva directa' : 'Direct booking'}</span>
      <h4 className="widget-title">
        {lang === 'es'
          ? <>La <em>mejor manera</em> de reservar</>
          : <>The <em>best way</em> to book</>}
      </h4>
      <ul className="widget-stats">
        {ribbon.map((s, i) => (
          <li key={i} className="widget-stat">
            <strong>{s.num}</strong>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="widget-cta"
        onClick={() => window.dispatchEvent(new Event('hestia:open-direct-perks'))}
      >
        <span>{lang === 'es' ? 'Ver todas las ventajas' : 'See all perks'}</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
};

const WidgetSabiasQue = ({ lang }) => {
  const [min, setMin] = _useLocalMin('sabias', true);   // plegado por defecto, como el resto
  const [pool] = React.useState(_getSessionPool);
  const total  = pool.length;
  const [idx, setIdx]         = React.useState(_getSessionIdx);
  const [visible, setVisible] = React.useState(true);

  const advance = (dir) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(i => { const n = (i + dir + total) % total; _saveSessionIdx(n); return n; });
      setVisible(true);
    }, 320);
  };

  React.useEffect(() => {
    if (min) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => { const n = (i + 1) % total; _saveSessionIdx(n); return n; });
        setVisible(true);
      }, 400);
    }, 9000);
    return () => clearInterval(t);
  }, [min, total]);

  if (min) {
    return (
      <WidgetMiniPill
        icon={<HiIcon name="bulb" size={15} />}
        label={lang === 'es' ? '¿Sabías que…?' : 'Did you know?'}
        ariaLabel={lang === 'es' ? 'Restaurar curiosidades' : 'Restore did-you-know'}
        onClick={() => setMin(false)}
        className="widget-mini-sabias"
      />
    );
  }
  const item = pool[idx];
  return (
    <section className="widget-card widget-sabias" aria-label={lang === 'es' ? '¿Sabías que…?' : 'Did you know'}>
      <button
        type="button"
        className="widget-min-btn"
        aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'}
        title={lang === 'es' ? 'Minimizar' : 'Minimize'}
        onClick={() => setMin(true)}
      >−</button>
      <div className={`sf-body ${visible ? 'sf-in' : 'sf-out'}`}>
        <span className="sf-label">{lang === 'es' ? '¿Sabías que…?' : 'Did you know?'}</span>
        <span className="sf-text">{item[lang]}</span>
      </div>
      <div className="sf-nav">
        <button className="sf-nav-btn" onClick={() => advance(-1)} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>←</button>
        <span className="sf-counter">{idx + 1} / {total}</span>
        <button className="sf-nav-btn" onClick={() => advance(1)} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>→</button>
      </div>
    </section>
  );
};

const WidgetGuidePin = ({ lang, onGuideClick }) => {
  const [min, setMin] = _useLocalMin('guide');
  if (min) {
    return (
      <WidgetMiniPill
        icon="✦"
        label={lang === 'es' ? 'Guía para huéspedes' : 'Guests\' guidebook'}
        ariaLabel={lang === 'es' ? 'Restaurar guía para huéspedes' : 'Restore guests\' guidebook'}
        onClick={() => setMin(false)}
        className="widget-mini-guide"
      />
    );
  }
  return (
    <section className="widget-card widget-guide" aria-label={lang === 'es' ? 'Guía para huéspedes' : 'Guests\' guidebook'}>
      <button
        type="button"
        className="widget-min-btn"
        aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'}
        title={lang === 'es' ? 'Minimizar' : 'Minimize'}
        onClick={() => setMin(true)}
      >−</button>
      <span className="eyebrow">{lang === 'es' ? '¿Ya estás reservado?' : 'Already booked?'}</span>
      <h4 className="widget-title">
        {lang === 'es' ? <>Guía para <em>huéspedes</em></> : <>Guests' <em>guidebook</em></>}
      </h4>
      <p className="widget-text">
        {lang === 'es'
          ? 'Recomendaciones de Alex y Fran, instrucciones de Hestía, planes de día y todo lo que necesitas para tu estancia.'
          : 'Alex & Fran\'s recommendations, Hestía instructions, day plans and everything you need for your stay.'}
      </p>
      <button
        type="button"
        className="widget-cta widget-cta-ghost"
        onClick={onGuideClick}
      >
        <span>{lang === 'es' ? 'Acceder con PIN' : 'Open with PIN'}</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
};

// Top 5 recomendaciones imprescindibles de Vera + Almería. Mezcla de
// categorías para que cada huésped descubra algo nuevo: playa, pueblo,
// cena, mercado, naturaleza/cultura. Se rotan cada 11 s; navegables.
const TOP_RECS = [
  {
    id: 'monsul',
    icon: '🌊',
    name_es: 'Playa de Mónsul',
    name_en: 'Mónsul Beach',
    place_es: 'Cabo de Gata · 1 h en coche',
    place_en: 'Cabo de Gata · 1 h drive',
    desc_es: 'La duna y la roca volcánica que salieron en Indiana Jones. Acceso restringido al coche en verano (bus desde San José).',
    desc_en: 'The dune and volcanic rock from Indiana Jones. Cars restricted in summer (bus from San José).',
    url: 'https://www.google.com/maps/place/Playa+de+M%C3%B3nsul/@36.7460,-2.1130,16z',
  },
  {
    id: 'mojacar',
    icon: '🏘',
    name_es: 'Mojácar pueblo',
    name_en: 'Mojácar village',
    place_es: 'Sierra Cabrera · 25 min',
    place_en: 'Sierra Cabrera · 25 min',
    desc_es: 'Pueblo blanco encalado en la ladera, callejuelas árabes, mirador de la Plaza Nueva con vistas al mar y a la sierra.',
    desc_en: 'Whitewashed hill village, Arab streets, Plaza Nueva mirador with sea and mountain views.',
    url: 'https://www.google.com/maps/place/Moj%C3%A1car/',
  },
  {
    id: 'lua',
    icon: '🍷',
    name_es: 'Restaurante Lúa',
    name_en: 'Lúa restaurant',
    place_es: 'Vera Playa · andando',
    place_en: 'Vera Playa · walking distance',
    desc_es: 'Cocina creativa de mar y huerta, sofisticado pero cercano. Carta de vinos cuidada. Reservar fines de semana.',
    desc_en: 'Creative sea & garden cuisine, sophisticated yet close. Considered wine list. Book on weekends.',
    url: 'https://www.google.com/maps/search/Lua+Vera+Playa',
  },
  {
    id: 'lonja',
    icon: '🐟',
    name_es: 'Lonja de Garrucha',
    name_en: 'Garrucha fish market',
    place_es: 'Garrucha · 10 min',
    place_en: 'Garrucha · 10 min',
    desc_es: 'Subasta de pescado en directo, gratis. Llegan los barcos y subastan al instante. La gamba roja es D.O.',
    desc_en: 'Live fish auction, free. Boats arrive and the auction runs immediately. PDO red prawns.',
    url: 'https://www.google.com/maps/place/Lonja+de+Garrucha',
  },
  {
    id: 'salinas',
    icon: '🦩',
    name_es: 'Salinas de Puerto Rey',
    name_en: 'Puerto Rey Salt Flats',
    place_es: 'Vera Playa · a un paseo corto',
    place_en: 'Vera Playa · a short walk away',
    desc_es: 'Parque Natural cercano, a un paseo corto, con flamencos, aves migratorias y luz dorada al amanecer.',
    desc_en: 'Nearby nature park, a short walk away, with flamingos, migratory birds and golden dawn light.',
    url: 'https://www.google.com/maps/place/Salinas+de+Vera',
  },
];

const WidgetTopRecs = ({ lang }) => {
  const [min, setMin] = _useLocalMin('toprecs');
  const total = TOP_RECS.length;
  const [idx, setIdx] = React.useState(() => {
    try { return Math.max(0, Math.min(total - 1, parseInt(sessionStorage.getItem('hestia-toprecs-idx') || '0', 10))); }
    catch (e) { return 0; }
  });
  const [visible, setVisible] = React.useState(true);

  const advance = (dir) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(i => {
        const n = (i + dir + total) % total;
        try { sessionStorage.setItem('hestia-toprecs-idx', String(n)); } catch (e) {}
        return n;
      });
      setVisible(true);
    }, 320);
  };

  React.useEffect(() => {
    if (min) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => {
          const n = (i + 1) % total;
          try { sessionStorage.setItem('hestia-toprecs-idx', String(n)); } catch (e) {}
          return n;
        });
        setVisible(true);
      }, 400);
    }, 11000);
    return () => clearInterval(t);
  }, [min, total]);

  if (min) {
    return (
      <WidgetMiniPill
        icon="★"
        label={lang === 'es' ? 'Imprescindibles' : 'Must-see'}
        ariaLabel={lang === 'es' ? 'Restaurar recomendaciones' : 'Restore recommendations'}
        onClick={() => setMin(false)}
        className="widget-mini-recs"
      />
    );
  }
  const item = TOP_RECS[idx];
  return (
    <section className="widget-card widget-recs" aria-label={lang === 'es' ? 'Imprescindibles de Vera y Almería' : 'Vera & Almería must-see'}>
      <button
        type="button"
        className="widget-min-btn"
        aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'}
        title={lang === 'es' ? 'Minimizar' : 'Minimize'}
        onClick={() => setMin(true)}
      >−</button>
      <span className="eyebrow">{lang === 'es' ? 'Imprescindibles · Vera y Almería' : 'Must-see · Vera & Almería'}</span>
      <div className={`tr-body ${visible ? 'tr-in' : 'tr-out'}`}>
        <div className="tr-head">
          <span className="tr-icon" aria-hidden="true"><EmojiIcon emoji={item.icon} size={24} /></span>
          <h4 className="tr-name">{item[`name_${lang}`]}</h4>
        </div>
        <span className="tr-place">{item[`place_${lang}`]}</span>
        <p className="tr-desc">{item[`desc_${lang}`]}</p>
      </div>
      <div className="sf-nav">
        <button className="sf-nav-btn" onClick={() => advance(-1)} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>←</button>
        <a className="tr-map" href={item.url} target="_blank" rel="noopener" aria-label={lang === 'es' ? 'Ver en mapa' : 'View on map'}>
          {lang === 'es' ? 'Mapa' : 'Map'} →
        </a>
        <button className="sf-nav-btn" onClick={() => advance(1)} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>→</button>
      </div>
    </section>
  );
};

// PINs por apartamento. Espejo del que vive en apartment-page.jsx /
// apartment-guide.jsx: al ser un sitio estático, los PINs no son
// secretos: solo fricción de UX para diferenciar a huéspedes.
const HESTIA_GUIDE_PINS = { vm: 'HVM2016', vt: 'HVT2019', vs: 'HVS2021' };

// Validación del PIN de la guía. Admite dos tipos de PIN:
//  - PIN maestro por apartamento (HESTIA_GUIDE_PINS): acceso de los
//    propietarios, siempre válido.
//  - PIN por huésped (prices.json → guestPins[apt]): se almacena SOLO el
//    hash SHA-256 + fecha de caducidad (until). El PIN real nunca se guarda.
//    Revocar al cancelar = borrar la entrada; caduca solo tras `until`.
async function hestiaSha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// Worker que registra los accesos a la guía (KV). Vacío hasta desplegarlo:
// pon aquí la URL de hestia-guide-access tras `wrangler deploy`.
const GUIDE_ACCESS_WORKER_URL = 'https://hestia-guide-access.hestia-vera-almeria.workers.dev';
// Registra un acceso a la guía (apartamento + fecha de entrada de la reserva).
// Sin datos personales: el nombre se resuelve en /p-edit cruzando con reservas.
// Fire-and-forget; text/plain para que el beacon no dispare preflight CORS.
function logGuideAccess(apt, ref) {
  try {
    if (!GUIDE_ACCESS_WORKER_URL || !apt || !ref) return;
    const payload = JSON.stringify({ apt, ref });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(GUIDE_ACCESS_WORKER_URL + '/', new Blob([payload], { type: 'text/plain' }));
    } else {
      fetch(GUIDE_ACCESS_WORKER_URL + '/', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload, keepalive: true }).catch(() => {});
    }
  } catch (_) {}
}
async function validateGuidePin(aptId, entered) {
  const pin = (entered || '').trim().toUpperCase();
  if (!pin) return false;
  if (pin === HESTIA_GUIDE_PINS[aptId]) return true;  // PIN maestro (propietarios): no se registra
  const list = (window.PRICES_V2 && window.PRICES_V2.guestPins && window.PRICES_V2.guestPins[aptId]) || [];
  if (!list.length) return false;
  const today = new Date().toISOString().slice(0, 10);
  let h;
  try { h = await hestiaSha256Hex(pin); } catch (_) { return false; }
  const match = list.find(e => e && e.h === h && (!e.until || e.until >= today));
  if (match) { logGuideAccess(aptId, match.ref); return true; }
  return false;
}
// Lee el valor real del input (no el state, que puede no haber terminado de
// comprometerse tras autofill, sugerencia de teclado móvil o el cambio de
// paso del selector de Hestía) y valida. Si falla, reintenta una vez tras
// un par de frames por si el valor todavía se estaba asentando, antes de
// dar el PIN por incorrecto: así un "primer intento" que en realidad leía
// un valor a medio escribir no se le cuenta como error al huésped.
async function submitGuidePin(inputRef, pinState, aptId) {
  const read = () => ((inputRef.current && inputRef.current.value) || pinState).trim().toUpperCase();
  let entered = read();
  let ok = await validateGuidePin(aptId, entered);
  if (!ok) {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    entered = read();
    ok = await validateGuidePin(aptId, entered);
  }
  return { entered, ok };
}
Object.assign(window, { validateGuidePin, hestiaSha256Hex, logGuideAccess, submitGuidePin });
const HESTIA_APT_META = {
  vm: { name: 'Hestía Mar',      slug: 'mar',      accent: '#6B7A3A', concept_es: 'Frente a la playa', concept_en: 'By the beach' },
  vt: { name: 'Hestía Thalassa', slug: 'thalassa', accent: '#B86A3C', concept_es: 'Ático panorámico',  concept_en: 'Panoramic penthouse' },
  vs: { name: 'Hestía Salinas',  slug: 'salinas',  accent: '#D4A84A', concept_es: 'Cerca de las salinas', concept_en: 'Near the salt flats' },
};

// Modal global de acceso huéspedes. Dos pasos:
// 1) Selección de Hestía (omitido si window.__APT__ ya está definido).
// 2) Introducción del PIN.
// PIN correcto → marca sessionStorage y navega a <slug>.html. La
// apartment-page detecta el flag al montar y abre la guía directamente.
const GuestAccessModal = ({ lang, onClose }) => {
  const currentApt = window.__APT__;
  const [step, setStep] = React.useState(currentApt ? 'pin' : 'select');
  const [selectedApt, setSelectedApt] = React.useState(currentApt || null);
  const [pin, setPin] = React.useState('');
  const [status, setStatus] = React.useState('idle');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (step === 'pin' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 80);
    }
  }, [step]);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pickApt = (id) => _vt(() => {
    setSelectedApt(id);
    setStep('pin');
  });
  const back = () => {
    if (currentApt) return; // si estás en una página Hestía, no hay paso atrás
    _vt(() => {
      setStep('select');
      setPin('');
      setStatus('idle');
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const { entered, ok } = await submitGuidePin(inputRef, pin, selectedApt);
    if (ok) {
      if (entered !== pin) setPin(entered);
      setStatus('success');
      try { sessionStorage.setItem('hestia-guide-unlock-' + selectedApt, '1'); } catch (err) {}
      const meta = HESTIA_APT_META[selectedApt];
      // Si ya estás en la página del apt seleccionado, dispara el
      // evento que abre la guía in-situ (sin navegación). Si no,
      // navega al .html, el flag de sessionStorage hace que se
      // abra la guía automáticamente al cargar.
      setTimeout(() => {
        if (currentApt === selectedApt) {
          window.dispatchEvent(new Event('hestia:open-guide-pin'));
          onClose();
        } else {
          window.location.href = meta.slug + '.html';
        }
      }, 360);
    } else {
      setStatus('error');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const t = lang === 'es' ? {
    title_select: 'Rincón del huésped',
    desc_select:  'Elige tu Hestía e introduce el PIN que te enviamos con la reserva.',
    title_pin: (n) => `Acceso a ${n}`,
    desc_pin: 'Introduce el PIN que recibiste con tu reserva.',
    placeholder: 'PIN de tu reserva',
    submit: 'Entrar',
    helper: 'Encontrarás el PIN en tu confirmación de reserva.',
    error: 'PIN incorrecto. Revisa tu confirmación de reserva.',
    success: 'PIN correcto. Abriendo la guía…',
    cancel: 'Cancelar',
    back: '← Cambiar',
  } : {
    title_select: 'Guest corner',
    desc_select:  'Pick your Hestía and enter the PIN we sent with your booking.',
    title_pin: (n) => `${n} guide access`,
    desc_pin: 'Enter the PIN from your booking.',
    placeholder: 'Booking PIN',
    submit: 'Enter',
    helper: 'You will find the PIN in your booking confirmation.',
    error: 'Wrong PIN. Check your booking confirmation.',
    success: 'PIN accepted. Opening the guide…',
    cancel: 'Cancel',
    back: '← Change',
  };

  const aptIds = ['vm', 'vt', 'vs'];

  return (
    <div className="ga-modal-backdrop" onClick={onClose}>
      <div
        className={`ga-modal${status === 'error' ? ' is-error' : ''}${status === 'success' ? ' is-success' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={step === 'select' ? t.title_select : t.title_pin(HESTIA_APT_META[selectedApt]?.name || '')}
        onClick={e => e.stopPropagation()}
        style={selectedApt ? { '--ga-accent': HESTIA_APT_META[selectedApt].accent } : undefined}
      >
        <button className="ga-modal-close" onClick={onClose} aria-label={t.cancel}>×</button>
        {step === 'select' ? (
          <>
            <span className="ga-modal-eyebrow">{t.title_select}</span>
            <p className="ga-modal-desc">{t.desc_select}</p>
            <div className="ga-apt-grid">
              {aptIds.map(id => {
                const m = HESTIA_APT_META[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className="ga-apt-card"
                    onClick={() => pickApt(id)}
                    style={{ '--ga-accent': m.accent }}
                  >
                    <span className="ga-apt-star" aria-hidden="true">✦</span>
                    <span className="ga-apt-name">{m.name}</span>
                    <span className="ga-apt-concept">{m[`concept_${lang}`]}</span>
                    <span className="ga-apt-arrow" aria-hidden="true">→</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <span className="ga-modal-eyebrow">{HESTIA_APT_META[selectedApt].name}</span>
            <h3 className="ga-modal-title">{t.title_pin(HESTIA_APT_META[selectedApt].name)}</h3>
            <p className="ga-modal-desc">{t.desc_pin}</p>
            <form onSubmit={submit} noValidate>
              <label htmlFor="ga-pin" className="ga-modal-label">{t.placeholder}</label>
              <input
                ref={inputRef}
                id="ga-pin"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                data-1p-ignore="true"
                data-lpignore="true"
                maxLength={12}
                className="ga-modal-input"
                placeholder={`${(HESTIA_GUIDE_PINS[selectedApt] || 'HVX0000').slice(0, 3)}0000`}
                value={pin}
                onChange={e => { setPin(e.target.value); if (status !== 'idle') setStatus('idle'); }}
                aria-invalid={status === 'error'}
              />
              <p className="ga-modal-msg" role="status">
                {status === 'error'   ? t.error   :
                 status === 'success' ? t.success :
                 t.helper}
              </p>
              <div className="ga-modal-actions">
                {!currentApt && (
                  <button type="button" className="ga-modal-back" onClick={back}>{t.back}</button>
                )}
                <button type="submit" className="ga-modal-submit">{t.submit}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// Botón corporativo "Acceso huéspedes", abre el modal global.
// El modal se monta vía ReactDOM.createPortal directamente sobre <body>
// porque el WidgetStack que lo contiene tiene `transform: translateY(-50%)`
// y eso rompería `position: fixed` del backdrop (lo anclaría al widget
// en lugar del viewport). Con portal el modal queda fullscreen y centrado.
const WidgetGuestAccess = ({ lang }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        className="widget-mini widget-mini-access"
        onClick={() => setOpen(true)}
        aria-label={lang === 'es' ? 'Rincón del huésped' : 'Guest corner'}
        title={lang === 'es' ? 'Rincón del huésped (guía y registro)' : 'Guest corner (guide & registration)'}
      >
        <span className="widget-mini-icon" aria-hidden="true"><HiIcon name="key" size={15} /></span>
        <span className="widget-mini-label">
          {lang === 'es' ? 'Rincón del huésped' : 'Guest corner'}
        </span>
      </button>
      {open && ReactDOM.createPortal(
        <GuestAccessModal lang={lang} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
};

// Pila completa. Tres widgets fijos para toda la web. Se oculta:
//  - Antes de pasar el hero (scrollY < 70% viewport).
//  - Cuando la búsqueda del home está activa (hs-results-change=true).
//  - Cuando la guía Hestía está abierta (body.guide-open).
// Cuarto widget del stack: Regala Hestía. Misma familia visual que los otros
// tres (hereda el acento teal por defecto, color de marca que NO es de ningún
// apartamento). Otra vía de solicitud de reserva, personalizada para regalo.
const WidgetGiftHestia = ({ lang }) => {
  const [min, setMin] = _useLocalMin('gift', true);     // plegado por defecto
  const giftWa = encodeURIComponent(lang === 'es'
    ? 'Hola, me gustaría regalar una experiencia de alojamiento en Hestía. Os cuento mi caso (la ocasión, fechas aproximadas y para quién): '
    : 'Hi, I would like to gift a stay experience at Hestía. Here is my case (the occasion, approximate dates and who it is for): ');
  if (min) {
    return (
      <WidgetMiniPill
        icon={<HiIcon name="gift" size={15} />}
        label={lang === 'es' ? 'Regala Hestía' : 'Gift Hestía'}
        ariaLabel={lang === 'es' ? 'Restaurar Regala Hestía' : 'Restore Gift Hestía'}
        onClick={() => setMin(false)}
        className="widget-mini-gift"
      />
    );
  }
  return (
    <section className="widget-card widget-gift" aria-label={lang === 'es' ? 'Regala Hestía' : 'Gift Hestía'}>
      <button type="button" className="widget-min-btn" aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'} title={lang === 'es' ? 'Minimizar' : 'Minimize'} onClick={() => setMin(true)}>−</button>
      <span className="eyebrow">{lang === 'es' ? 'Regala Hestía' : 'Gift Hestía'}</span>
      <h4 className="widget-title">
        {lang === 'es' ? <>Una <em>experiencia</em> de regalo</> : <>A <em>gift</em> experience</>}
      </h4>
      <p className="widget-text">
        {lang === 'es'
          ? 'Regala una estancia en Hestía. Cuéntanos tu caso (ocasión, fechas, para quién) y lo preparamos a medida.'
          : 'Gift a stay at Hestía. Tell us your case (occasion, dates, who for) and we tailor it.'}
      </p>
      <a className="widget-cta" href={`https://wa.me/34620316370?text=${giftWa}`} target="_blank" rel="noopener">
        <span>{lang === 'es' ? 'Cuéntanos tu caso' : 'Tell us your case'}</span>
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
};

// ── Widget "Hoy en Vera Playa" (solo Home) ──────────────────────────────────
// Tiempo, oleaje y luna en directo, con un apunte con gracia (voz Alex/Fran,
// nunca "¡genial!" ni superlativos). Datos de Open-Meteo (gratis, sin key,
// CORS abierto): forecast (temperatura + código de cielo) y marine (oleaje,
// puede no cubrir el punto exacto de costa; si no hay dato, se omite esa
// línea sin más). Fase lunar se calcula localmente (sin API, matemáticas de
// mes sinódico). Cacheado en sessionStorage 45 min para no golpear la API
// en cada visita a la Home.
const _VERA_LAT = 37.1833, _VERA_LON = -1.8333;

// Código de tiempo WMO (Open-Meteo) → { icon, es, en }. Agrupado por familias.
const _WMO_SKY = (code) => {
  if (code === 0) return { icon: 'sun', es: 'despejado', en: 'clear sky' };
  if (code === 1) return { icon: 'sun', es: 'casi despejado', en: 'mostly clear' };
  if (code === 2) return { icon: 'cloud', es: 'parcialmente nublado', en: 'partly cloudy' };
  if (code === 3) return { icon: 'cloud', es: 'nublado', en: 'overcast' };
  if (code === 45 || code === 48) return { icon: 'cloud', es: 'niebla', en: 'foggy' };
  if (code >= 51 && code <= 57) return { icon: 'cloud', es: 'llovizna', en: 'drizzle' };
  if (code >= 61 && code <= 67) return { icon: 'cloud', es: 'lluvia', en: 'rain' };
  if (code >= 71 && code <= 77) return { icon: 'cloud', es: 'nieve', en: 'snow' };
  if (code >= 80 && code <= 82) return { icon: 'cloud', es: 'chubascos', en: 'showers' };
  if (code >= 95) return { icon: 'cloud', es: 'tormenta', en: 'thunderstorm' };
  return { icon: 'cloud', es: 'variable', en: 'mixed' };
};

// Apunte con gracia por familia de cielo. Varios por categoría, elegido de
// forma estable según el día del año (no al azar en cada recarga).
const _WTHR_QUIPS = {
  sun: {
    es: ['Otro de esos 320 días de sol, aquí ya ni lo contamos.', 'Sol, cómo no. Toalla y a la playa.', 'Día de playa sin excusas.'],
    en: ['Another of those 320 sunny days, we stopped counting.', 'Sun, of course. Towel and off to the beach.', 'No excuses today, beach day.'],
  },
  cloud: {
    es: ['Hoy con nubes, raro por aquí.', 'Un poco gris, el sol vuelve en cuanto se despiste.', 'Nubes de paso, nada serio.'],
    en: ['A bit cloudy today, unusual around here.', 'A little grey, the sun will be back before long.', 'Passing clouds, nothing serious.'],
  },
};
const _pickQuip = (family, lang) => {
  const pool = (_WTHR_QUIPS[family] || _WTHR_QUIPS.cloud)[lang] || _WTHR_QUIPS.cloud.es;
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return pool[doy % pool.length];
};

// Fase lunar sin API: días desde una luna nueva de referencia / mes sinódico.
const _MOON_PHASES = [
  { es: 'luna nueva', en: 'new moon' },
  { es: 'luna creciente', en: 'waxing crescent' },
  { es: 'cuarto creciente', en: 'first quarter' },
  { es: 'gibosa creciente', en: 'waxing gibbous' },
  { es: 'luna llena', en: 'full moon' },
  { es: 'gibosa menguante', en: 'waning gibbous' },
  { es: 'cuarto menguante', en: 'last quarter' },
  { es: 'luna menguante', en: 'waning crescent' },
];
const _moonPhase = () => {
  const synodic = 29.530588853;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (Date.now() - knownNewMoon) / 86400000;
  const frac = (((days % synodic) + synodic) % synodic) / synodic;
  return _MOON_PHASES[Math.round(frac * 8) % 8];
};

// Enlace a previsión detallada de la zona (viento + oleaje juntos, la vista
// que de verdad quiere alguien decidiendo si hay playa/mar hoy). Windy es
// bilingüe y no depende de nuestra propia lectura de la API.
const _WINDY_URL = `https://www.windy.com/?wind,${_VERA_LAT},${_VERA_LON},11`;

const WidgetWeather = ({ lang, variant = 'floating' }) => {
  const [min, setMin] = _useLocalMin('weather', true);   // plegado por defecto (solo variant floating)
  const [wx, setWx] = React.useState(null);   // null = cargando/no disponible
  const [show7d, setShow7d] = React.useState(false);
  const [fabOpen, setFabOpen] = _useExclusiveOpen('weather-fab');   // solo variant="fab"
  React.useEffect(() => {
    let alive = true;
    const CACHE_KEY = 'hestia-weather-cache-v4';
    const CACHE_MS = 45 * 60 * 1000;
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.t) < CACHE_MS) { setWx(cached.v); return; }
    } catch (_) {}
    // Un único fetch de forecast trae el dato de hoy (current) y los próximos
    // 7 días (daily) a la vez: evita una segunda llamada cuando se abre la
    // ventana de previsión. Igual con el oleaje: current + daily en la misma
    // llamada al marine-api, para que "Ver 7 días" también lleve oleaje.
    const fUrl = `https://api.open-meteo.com/v1/forecast?latitude=${_VERA_LAT}&longitude=${_VERA_LON}&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,apparent_temperature_max,relative_humidity_2m_mean,wind_speed_10m_max&timezone=Europe%2FMadrid&forecast_days=7`;
    const mUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${_VERA_LAT}&longitude=${_VERA_LON}&current=wave_height&daily=wave_height_max&timezone=Europe%2FMadrid&forecast_days=7`;
    Promise.all([
      fetch(fUrl).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(mUrl).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([f, m]) => {
      if (!alive) return;
      if (!f || !f.current) { setWx(false); return; }
      // Math.round de un valor que puede faltar (la API a veces omite un
      // campo puntual): si no es número, null y ese dato simplemente no se
      // pinta, en vez de romper el widget.
      const numOrNull = (v) => (typeof v === 'number' && !Number.isNaN(v)) ? Math.round(v) : null;
      const waveOrNull = (v) => (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
      const mDaily = m && m.daily && Array.isArray(m.daily.time) ? m.daily : null;
      const days = (f.daily && Array.isArray(f.daily.time)) ? f.daily.time.map((d, i) => ({
        date: d,
        max: Math.round(f.daily.temperature_2m_max[i]),
        min: Math.round(f.daily.temperature_2m_min[i]),
        code: f.daily.weather_code[i],
        feels: numOrNull(f.daily.apparent_temperature_max?.[i]),
        humidity: numOrNull(f.daily.relative_humidity_2m_mean?.[i]),
        wind: numOrNull(f.daily.wind_speed_10m_max?.[i]),
        wave: mDaily ? waveOrNull(mDaily.wave_height_max?.[i]) : null,
      })) : [];
      const v = {
        temp: Math.round(f.current.temperature_2m),
        code: f.current.weather_code,
        feels: numOrNull(f.current.apparent_temperature),
        humidity: numOrNull(f.current.relative_humidity_2m),
        wind: numOrNull(f.current.wind_speed_10m),
        wave: (m && m.current && typeof m.current.wave_height === 'number') ? m.current.wave_height : null,
        days,
      };
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v })); } catch (_) {}
      setWx(v);
    }).catch(() => { if (alive) setWx(false); });
    return () => { alive = false; };
  }, []);

  if (wx === false) return null;   // fetch falló: no mostramos un widget roto

  const sky = wx ? _WMO_SKY(wx.code) : null;
  const moon = _moonPhase();
  const DOW = lang === 'es' ? ['D','L','M','X','J','V','S'] : ['S','M','T','W','T','F','S'];

  // En variant="fab", abrir los 7 días con el panel ya desplegado apilaba
  // un pop encima de otro: se cierra el panel ancla antes de abrir el
  // modal de 7 días, nunca los dos overlays a la vez.
  const SevenDayLink = () => (wx && wx.days.length > 0) ? (
    <button type="button" className="widget-cta widget-cta-ghost wthr-7d-btn" onClick={() => { if (variant === 'fab') setFabOpen(false); setShow7d(true); }}>
      <span>{lang === 'es' ? 'Ver 7 días' : 'See 7 days'}</span>
      <span aria-hidden="true">→</span>
    </button>
  ) : null;

  const WindyLink = () => (
    <a className="wthr-windy-link" href={_WINDY_URL} target="_blank" rel="noopener">
      {lang === 'es' ? 'Previsión detallada de viento y oleaje →' : 'Detailed wind & swell forecast →'}
    </a>
  );

  const Content = () => !wx ? (
    <p className="widget-text">{lang === 'es' ? 'Consultando el tiempo…' : 'Checking the weather…'}</p>
  ) : (
    <>
      <p className="wthr-quip">{_pickQuip(sky.icon, lang)}</p>
      <ul className="wthr-facts">
        <li className="wthr-fact">
          <HiIcon name={sky.icon} size={18} />
          <strong>{wx.temp}°</strong>
          <span>{lang === 'es' ? sky.es : sky.en}</span>
        </li>
        {wx.wave !== null && (
          <li className="wthr-fact">
            <HiIcon name="wave" size={18} />
            <strong>{wx.wave.toFixed(1)} m</strong>
            <span>{lang === 'es' ? 'oleaje' : 'swell'}</span>
          </li>
        )}
        {wx.feels !== null && (
          <li className="wthr-fact">
            <HiIcon name="thermo" size={18} />
            <strong>{wx.feels}°</strong>
            <span>{lang === 'es' ? 'sensación térmica' : 'feels like'}</span>
          </li>
        )}
        {wx.humidity !== null && (
          <li className="wthr-fact">
            <HiIcon name="drop" size={18} />
            <strong>{wx.humidity}%</strong>
            <span>{lang === 'es' ? 'humedad' : 'humidity'}</span>
          </li>
        )}
        {wx.wind !== null && (
          <li className="wthr-fact">
            <HiIcon name="wind" size={18} />
            <strong>{wx.wind} km/h</strong>
            <span>{lang === 'es' ? 'viento' : 'wind'}</span>
          </li>
        )}
        <li className="wthr-fact">
          <HiIcon name="moon" size={18} />
          <span className="wthr-moon-lbl">{lang === 'es' ? moon.es : moon.en}</span>
        </li>
      </ul>
      <div className="wthr-links">
        <SevenDayLink />
        <WindyLink />
      </div>
    </>
  );

  const SevenDayPortal = () => show7d ? ReactDOM.createPortal(
    <div className="wthr-7d-backdrop" onClick={() => setShow7d(false)}>
      <div className="wthr-7d-pop" onClick={e => e.stopPropagation()} role="dialog" aria-label={lang === 'es' ? 'Previsión a 7 días' : '7-day forecast'}>
        <button type="button" className="wthr-7d-close" onClick={() => setShow7d(false)} aria-label={lang === 'es' ? 'Cerrar' : 'Close'}>×</button>
        <h4 className="wthr-7d-title">{lang === 'es' ? 'Próximos 7 días · Vera Playa' : 'Next 7 days · Vera Playa'}</h4>
        <ul className="wthr-7d-list">
          {wx.days.map((d, i) => {
            const dSky = _WMO_SKY(d.code);
            const dow = i === 0 ? (lang === 'es' ? 'Hoy' : 'Today') : DOW[new Date(d.date + 'T12:00:00Z').getUTCDay()];
            const hasExtra = d.feels !== null || d.humidity !== null || d.wind !== null || d.wave !== null;
            return (
              <li key={d.date} className="wthr-7d-item">
                <div className="wthr-7d-row">
                  <span className="wthr-7d-dow">{dow}</span>
                  <HiIcon name={dSky.icon} size={18} />
                  <span className="wthr-7d-desc">{lang === 'es' ? dSky.es : dSky.en}</span>
                  <span className="wthr-7d-temps"><strong>{d.max}°</strong> {d.min}°</span>
                </div>
                {hasExtra && (
                  <div className="wthr-7d-extra">
                    {d.feels !== null && (
                      <span className="wthr-7d-chip"><HiIcon name="thermo" size={12} /> {d.feels}°</span>
                    )}
                    {d.humidity !== null && (
                      <span className="wthr-7d-chip"><HiIcon name="drop" size={12} /> {d.humidity}%</span>
                    )}
                    {d.wind !== null && (
                      <span className="wthr-7d-chip"><HiIcon name="wind" size={12} /> {d.wind} km/h</span>
                    )}
                    {d.wave !== null && (
                      <span className="wthr-7d-chip"><HiIcon name="wave" size={12} /> {d.wave.toFixed(1)} m</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <a className="wthr-windy-link wthr-windy-link-7d" href={_WINDY_URL} target="_blank" rel="noopener">
          {lang === 'es' ? 'Previsión detallada de viento y oleaje →' : 'Detailed wind & swell forecast →'}
        </a>
      </div>
    </div>,
    document.body
  ) : null;

  // variant="fab": botón flotante redondo, mismo estilo que .sound-toggle,
  // apilado justo encima de él. Es la versión para móvil: el widget-stack
  // flotante está oculto por debajo de 900px, así que sin esto el tiempo
  // no existía en absoluto en móvil. Al tocarlo despliega el mismo
  // contenido que la card de escritorio, en un panel ancla arriba.
  if (variant === 'fab') {
    const label = lang === 'es' ? 'Hoy en Vera Playa' : 'Today in Vera Playa';
    return (
      <div className={`wthr-fab-wrap${fabOpen ? ' is-open' : ''}`}>
        <div className="wthr-fab-panel widget-card widget-weather" role="dialog" aria-label={label} aria-hidden={!fabOpen}>
          <button type="button" className="widget-min-btn" onClick={() => setFabOpen(false)} aria-label={lang === 'es' ? 'Cerrar' : 'Close'}>×</button>
          <span className="eyebrow">{label}</span>
          <Content />
        </div>
        <button
          type="button"
          className="wthr-fab"
          onClick={() => setFabOpen(!fabOpen)}
          aria-expanded={fabOpen}
          aria-label={label}
          title={label}
        >
          <HiIcon name={wx ? sky.icon : 'sun'} size={24} />
        </button>
        <SevenDayPortal />
      </div>
    );
  }

  if (min) {
    return (
      <WidgetMiniPill
        icon={<HiIcon name="sun" size={15} />}
        label={lang === 'es' ? 'Hoy en Vera Playa' : 'Today in Vera Playa'}
        ariaLabel={lang === 'es' ? 'Restaurar el tiempo de hoy' : 'Restore today\'s weather'}
        onClick={() => setMin(false)}
        className="widget-mini-weather"
      />
    );
  }
  return (
    <section className="widget-card widget-weather" aria-label={lang === 'es' ? 'Hoy en Vera Playa' : 'Today in Vera Playa'}>
      <button type="button" className="widget-min-btn" aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'} title={lang === 'es' ? 'Minimizar' : 'Minimize'} onClick={() => setMin(true)}>−</button>
      <span className="eyebrow">{lang === 'es' ? 'Hoy en Vera Playa' : 'Today in Vera Playa'}</span>
      <Content />
      <SevenDayPortal />
    </section>
  );
};

// ── Widget "Sonido de mar" (solo Home) ──────────────────────────────────────
// Envoltorio del botón .sound-toggle de app.jsx como pieza de la barra de
// widgets: el estado y el <audio> los sigue llevando App (aquí solo se
// presenta). No tiene tarjeta ni estado de apertura propios: es un
// interruptor directo, no hay nada que expandir.
const WidgetSound = ({ lang, soundOn, onToggle }) => (
  <button
    type="button"
    className="widget-mini widget-mini-sound"
    onClick={onToggle}
    aria-pressed={soundOn}
    aria-label={soundOn ? (lang === 'es' ? 'Silenciar sonido de mar' : 'Mute sea sound') : (lang === 'es' ? 'Activar sonido de mar' : 'Unmute sea sound')}
    title={soundOn ? (lang === 'es' ? 'Silenciar sonido de mar' : 'Mute sea sound') : (lang === 'es' ? 'Activar sonido de mar' : 'Unmute sea sound')}
  >
    <span className="widget-mini-icon" aria-hidden="true"><HiIcon name={soundOn ? 'sound' : 'mute'} size={15} /></span>
    <span className="widget-mini-label">{lang === 'es' ? 'Sonido de mar' : 'Sea sound'}</span>
  </button>
);

// ── Widget "Contacto" (todas las páginas) ───────────────────────────────────
// Mismo contacto directo con Alex y Fran que el burbuja flotante (chrome.jsx
// FloatingChat), pero como pieza más de la barra en vez de un botón aparte.
// FloatingChat se sigue mostrando tal cual en móvil (la barra es solo
// ≥900px); en escritorio la barra sustituye a FloatingChat, así que no hay
// dos accesos de contacto a la vez. Regalar Hestía ya tiene su propio
// widget (WidgetGiftHestia): este solo cubre "hablar con Alex/Fran".
const _CONTACT_WA_MSGS = {
  es: {
    'index.html':            'Hola, me interesa saber más sobre los apartamentos Hestía en Vera Playa.',
    'mar.html':               'Hola, me interesa el apartamento Hestía Mar. ¿Podéis darme más información?',
    'thalassa.html':          'Hola, me interesa el apartamento Hestía Thalassa. ¿Podéis darme más información?',
    'salinas.html':           'Hola, me interesa el apartamento Hestía Salinas. ¿Podéis darme más información?',
    'reservas.html':          'Hola, quiero hacer una reserva en Hestía. ¿Me podéis ayudar?',
    'estancias-largas.html':  'Hola, me interesa una estancia larga en Hestía. ¿Podéis darme más información?',
    'contacto.html':          'Hola, me pongo en contacto desde la web de Hestía.',
  },
  en: {
    'index.html':             'Hi, I\'d like to know more about Hestía apartments in Vera Playa.',
    'mar.html':                'Hi, I\'m interested in Hestía Mar. Can you tell me more?',
    'thalassa.html':           'Hi, I\'m interested in Hestía Thalassa. Can you tell me more?',
    'salinas.html':            'Hi, I\'m interested in Hestía Salinas. Can you tell me more?',
    'reservas.html':           'Hi, I\'d like to book at Hestía. Can you help me?',
    'estancias-largas.html':   'Hi, I\'m interested in a long stay at Hestía. Can you tell me more?',
    'contacto.html':           'Hi, I\'m reaching out from the Hestía website.',
  },
};
const _waMsgForPage = (lang) => {
  const page = (window.location.pathname.split('/').pop() || 'index.html');
  return _CONTACT_WA_MSGS[lang][page] || (lang === 'es' ? 'Hola, me interesa Hestía Your Home.' : 'Hi, I\'d like to know more about Hestía Your Home.');
};
const _CONTACT_PERSONS = [
  { id: 'alex', name: 'Alex', photo: 'assets/photo-alex.jpg', photoW: 840, photoH: 1120, imgClass: 'wc-avatar-img-alex', langLbl: 'Español', tel: '+34 620 316 370', telHref: 'tel:+34620316370', waNumber: '34620316370' },
  { id: 'fran', name: 'Fran', photo: 'assets/photo-fran.jpg', photoW: 925, photoH: 2000, imgClass: 'wc-avatar-img-fran', langLbl: 'English', tel: '+34 654 138 251', telHref: 'tel:+34654138251', waNumber: '34654138251' },
];
const WcWaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const WidgetContact = ({ lang }) => {
  const [min, setMin] = _useLocalMin('contact', true);   // plegado por defecto
  if (min) {
    return (
      <WidgetMiniPill
        icon={<HiIcon name="chat" size={15} />}
        label={lang === 'es' ? 'Hablemos' : 'Let\'s talk'}
        ariaLabel={lang === 'es' ? 'Restaurar contacto' : 'Restore contact'}
        onClick={() => setMin(false)}
        className="widget-mini-contact"
      />
    );
  }
  const waText = encodeURIComponent(_waMsgForPage(lang));
  return (
    <section className="widget-card widget-contact" aria-label={lang === 'es' ? 'Hablemos' : 'Let\'s talk'}>
      <button type="button" className="widget-min-btn" aria-label={lang === 'es' ? 'Minimizar' : 'Minimize'} title={lang === 'es' ? 'Minimizar' : 'Minimize'} onClick={() => setMin(true)}>−</button>
      <span className="eyebrow">{lang === 'es' ? 'Hablemos' : 'Let\'s talk'}</span>
      <p className="widget-text">
        {lang === 'es' ? 'Te responde una persona real. En minutos, no en días.' : 'A real person replies. In minutes, not days.'}
      </p>
      {_CONTACT_PERSONS.map(p => (
        <div className="wc-person" key={p.id}>
          <span className="wc-avatar">
            <img src={p.photo} alt="" loading="lazy" width={p.photoW} height={p.photoH} className={`wc-avatar-img ${p.imgClass}`} />
          </span>
          <div className="wc-body">
            <span className="wc-name">{p.name}</span>
            <div className="wc-actions">
              <a className="wc-btn" href={`https://wa.me/${p.waNumber}?text=${waText}`} target="_blank" rel="noopener" aria-label={`WhatsApp ${p.name}`}>
                <WcWaIcon /> WhatsApp
              </a>
              <a className="wc-btn wc-btn-tel" href={p.telHref} aria-label={`${lang === 'es' ? 'Llamar a' : 'Call'} ${p.name}`}>
                <HiIcon name="phone" size={13} /> {lang === 'es' ? 'Llamar' : 'Call'}
              </a>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const WidgetStack = ({ lang, extra }) => {
  const [pastHero, setPastHero] = React.useState(() => window.scrollY > window.innerHeight * 0.7);
  const [searchActive, setSearchActive] = React.useState(false);
  const [guideOpen, setGuideOpen] = React.useState(() => document.body.classList.contains('guide-open'));
  // Modal global "Ver todas las ventajas", escucha el evento
  // hestia:open-direct-perks que disparan los botones del widget
  // (.widget-cta) y del sidebar (.ads-btn). Antes solo funcionaba
  // si DirectBookingPerks estaba mounted en la página. Ahora cualquier
  // página con WidgetStack tiene el listener garantizado.
  const [perksOpen, setPerksOpen] = React.useState(false);
  // Oculta el botón flotante "Reservar →" mientras un checker de disponibilidad
  // ([data-avail-checker]) está a la vista, para que no compita con el "Comprobar
  // disponibilidad" de esa página (si no, al pulsar Reservar se pierde la selección).
  const [checkerInView, setCheckerInView] = React.useState(false);
  React.useEffect(() => {
    const onOpen = () => setPerksOpen(true);
    window.addEventListener('hestia:open-direct-perks', onOpen);
    return () => window.removeEventListener('hestia:open-direct-perks', onOpen);
  }, []);

  React.useEffect(() => {
    const check = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  React.useEffect(() => {
    const handler = e => setSearchActive(!!e.detail);
    window.addEventListener('hs-results-change', handler);
    return () => window.removeEventListener('hs-results-change', handler);
  }, []);

  React.useEffect(() => {
    const obs = new MutationObserver(() => {
      setGuideOpen(document.body.classList.contains('guide-open'));
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = document.querySelectorAll('[data-avail-checker]');
    if (!els.length) return;
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      setCheckerInView(seen.size > 0);
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const hidden = !pastHero || searchActive || guideOpen;
  const bookHidden = hidden || checkerInView;
  const onReservas = typeof window !== 'undefined' && window.location.pathname.includes('reservas');

  return (
    <>
      <div className={`widget-stack ${hidden ? 'is-hidden' : ''}`} aria-hidden={hidden}>
        <WidgetSabiasQue lang={lang} />
        <WidgetDirectBooking lang={lang} />
        <WidgetGuestAccess lang={lang} />
        <WidgetGiftHestia lang={lang} />
        <WidgetContact lang={lang} />
        {extra}
      </div>
      {!onReservas && (
        <a
          href="reservas.html"
          className={`mob-book-btn${bookHidden ? ' mob-book-btn--hidden' : ''}`}
          aria-hidden={bookHidden}
        >
          {lang === 'es' ? 'Reservar →' : 'Book →'}
        </a>
      )}
      {perksOpen && <DirectBookingModal lang={lang} onClose={() => setPerksOpen(false)} />}
    </>
  );
};

// ================================================================
// HomeGuideTeaser, bloque "La guía completa de Hestía" para la home.
// Mismo lenguaje visual que AptGuideGate (en la apt-page) pero sin
// referencia a un apartamento concreto. El CTA abre GuestAccessModal
// (mismo modal que el botón Acceso huéspedes) para pedir apto + PIN.
// ================================================================
const HomeGuideTeaser = ({ lang }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const t = lang === 'es' ? {
    eyebrow: 'Guía del huésped',
    title_a: 'La guía completa de ',
    title_em: 'Hestía',
    desc: <>No es un folleto: es la <strong>superguía que nos habría gustado encontrar a nosotros</strong> cuando llegamos por primera vez a Vera. Veintidós capítulos con todo lo que necesitas para vivir tu estancia, desde cómo llegar desde cualquiera de los cinco aeropuertos cercanos hasta los rincones que solo conocen los vecinos del Levante almeriense.</>,
    stats: [
      <><strong>22 capítulos</strong> sobre tu Hestía y el entorno</>,
      <><strong>Más de 230 recomendaciones</strong>: restaurantes, playas, bares, bodegas, mercados, pescaderías…</>,
      <><strong>48 planes de día completo</strong> con horarios, rutas y reservas</>,
      <><strong>Calendario anual</strong> de fiestas patronales y eventos</>,
      <><strong>Servicios a mano</strong>: centros de salud, veterinarios 24 h, farmacias, fisioterapeutas, guarderías y residencias para mascotas…</>,
      <><strong>Teléfonos útiles</strong> y nuestro contacto directo antes, durante y después de tu estancia</>,
    ],
    foot: 'Web interactiva + PDF descargable de 40 páginas. Reservada para huéspedes con PIN.',
    cta: 'Solo para huéspedes',
  } : {
    eyebrow: 'Guest guide',
    title_a: 'The complete ',
    title_em: 'Hestía',
    title_b: ' guide',
    desc: <>This isn&apos;t a leaflet: it&apos;s the <strong>super-guide we wish we&apos;d had ourselves</strong> the first time we arrived in Vera. Twenty-two chapters with everything you need for your stay, from how to get here from any of the five nearest airports to the corners only locals from the Levante know.</>,
    stats: [
      <><strong>22 chapters</strong> on your Hestía and the area</>,
      <><strong>230+ curated spots</strong>: restaurants, beaches, bars, wineries, markets, fishmongers…</>,
      <><strong>48 full-day itineraries</strong> with timing, routes and bookings</>,
      <><strong>Annual calendar</strong> of festivals and local events</>,
      <><strong>Everything within reach</strong>: health centres, 24 h vets, pharmacies, physio clinics, pet boarding & daycare…</>,
      <><strong>Useful phones</strong> and our direct line before, during and after your stay</>,
    ],
    foot: 'Interactive web + 40-page downloadable PDF. Reserved for guests with a PIN.',
    cta: 'Guests only',
  };
  return (
    <>
      <section className="apt-guide-gate apt-guide-gate-home">
        <div className="apt-guide-gate-inner">
          <span className="apt-guide-gate-eyebrow">{t.eyebrow}</span>
          <h2 className="apt-guide-gate-title">
            {t.title_a}<em>{t.title_em}</em>{t.title_b || ''}
          </h2>
          <p className="apt-guide-gate-desc">{t.desc}</p>
          <ul className="apt-guide-gate-stats">
            {t.stats.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <p className="apt-guide-gate-foot">{t.foot}</p>
          <button className="apt-guide-gate-btn" onClick={() => setModalOpen(true)}>
            <span>{t.cta}</span>
            <span className="apt-guide-gate-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      {modalOpen && ReactDOM.createPortal(
        <GuestAccessModal lang={lang} onClose={() => setModalOpen(false)} />,
        document.body
      )}
    </>
  );
};

Object.assign(window, { WidgetStack, WidgetDirectBooking, WidgetSabiasQue, WidgetGuidePin, WidgetGuestAccess, WidgetTopRecs, WidgetWeather, WidgetSound, WidgetContact, TOP_RECS, HomeGuideTeaser, GuestAccessModal, _VERA_LAT, _VERA_LON, _WMO_SKY });
