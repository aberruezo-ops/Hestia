// ================================================================
// HESTÍA — Secciones de la home
// ================================================================

// --- HERO · galería rotatoria de vídeos de fondo ----------------
// Cada visita a la home elige un vídeo al azar de esta lista. La
// clase `mood-*` modula el "velo" (gradientes de .hero::before) para
// que combine con la luz del clip. Para añadir uno nuevo basta con:
//   1. Subir el .mp4 a docs/assets/
//   2. Añadir aquí un objeto { src, poster, mood, alt }
//      · mood ∈ 'violet' | 'teal' | 'warm' | 'night'
//        — violet: velo morado (atmósfera nocturna, marina suave)
//        — teal:   azul mediterráneo (día, agua clara)
//        — warm:   bermellón cálido (atardecer, dorado)
//        — night:  azul profundo (noche cerrada, estrellas)
// Para crear un mood nuevo: añade ::before override en styles.css.
// Los .mp4 viven en docs/assets/Videoshome/ y todos vienen procesados
// con grading + sharpening y loop circular (xfade end→start) para que
// el bucle sea imperceptible.
// VIDEO_V se añade como query string al src para cache-bust cuando
// re-grading o re-encode: bump cuando cambies los .mp4.
const VIDEO_V = '2026-05-16-2';
const HERO_VIDEOS = [
  { src: 'assets/Videoshome/hero-playa-almeria.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'violet',
    alt: 'Costa aérea · turquesa' },
  { src: 'assets/Videoshome/hero-cabo-gata-mediodia.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'teal',
    alt: 'Cabo de Gata · mediodía' },
  { src: 'assets/Videoshome/hero-atardecer-aereo.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'warm',
    alt: 'Atardecer aéreo sobre la playa' },
  { src: 'assets/Videoshome/hero-cala-rocosa.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'night',
    alt: 'Cala rocosa con agua cristalina · cenital' },
  { src: 'assets/Videoshome/hero-playa-aerea-turquesa.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'teal',
    alt: 'Playa aérea · arena dorada y agua turquesa' },
  { src: 'assets/Videoshome/hero-atardecer-logo.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'warm',
    alt: 'Atardecer cinematográfico con logo Hestía' },
  { src: 'assets/Videoshome/hero-olas-acantilado.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'night',
    alt: 'Olas rompiendo en acantilado rocoso' },
  { src: 'assets/Videoshome/hero-cala-aerea.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'teal',
    alt: 'Cala aérea · arena dorada y agua azul intenso' },
  { src: 'assets/Videoshome/hero-piscina-verano.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'teal',
    alt: 'Piscina en verano' },
  { src: 'assets/Videoshome/hero-rompeolas.mp4',
    poster: 'assets/hero-terrace-night.jpg',
    mood: 'night',
    alt: 'Olas rompiendo en el rompeolas · espuma y mar abierto' },
  // Para añadir un vídeo: súbelo a docs/assets/Videoshome/ y añade
  // una entrada con la misma forma. Para hacerlo circular, procesa
  // con ffmpeg crossfade end→start (ver scripts/build-pdf.mjs para
  // el comando exacto que usamos). Moods: violet | teal | warm | night.
];

// --- HERO cinematográfico ---
const Hero = ({ lang, onScrollDown }) => {
  const t = COPY[lang];
  const bgVideoRef = React.useRef(null);

  // Playlist aleatoria: mezcla Fisher-Yates una vez por sesión (useMemo
  // se ejecuta solo en el montaje, es decir, una vez por carga de página).
  // El orden cambia en cada sesión sin necesidad de sessionStorage.
  const playlist = React.useMemo(() => {
    const a = [...HERO_VIDEOS];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);
  const [vidIdx, setVidIdx] = React.useState(0);
  const pick = playlist[vidIdx];

  // Arranca reproducción al montar y al cambiar de clip (key remonta el <video>)
  React.useEffect(() => {
    const el = bgVideoRef.current;
    if (el) { el.muted = true; el.play().catch(() => {}); }
  }, [vidIdx]);

  // Reanuda si el usuario vuelve a la pestaña
  React.useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && bgVideoRef.current) {
        bgVideoRef.current.muted = true;
        bgVideoRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <section
      id="top"
      className={`hero mood-${pick.mood}`}
      data-screen-label="01 Hero"
      data-hero-video={pick.src}
    >
      {/* Vídeo de fondo — playlist aleatoria, avanza al siguiente al terminar */}
      <video
        ref={bgVideoRef}
        className="hero-bg-video"
        autoPlay muted playsInline
        preload="metadata"
        poster={pick.poster}
        aria-label={pick.alt}
        key={pick.src}
        onEnded={() => setVidIdx(i => (i + 1) % playlist.length)}
      >
        <source src={`${pick.src}?v=${VIDEO_V}`} type="video/mp4"/>
      </video>
      <div className="hero-content">
        <div className="wordmark hero-wordmark">HESTÍA</div>
        <div className="your-home hero-yourhome">your home!</div>

        <h1 className="hero-title">
          {t.hero_title_1}<br/>
          <span className="it">{t.hero_title_2}</span>
        </h1>
        <div className="hero-sub">{t.hero_sub}</div>
        <div className="hero-ctas">
          <a href="#apartamentos" className="btn btn-primary">
            {t.hero_cta_1} <span className="arrow">→</span>
          </a>
          <a href="#buscar" className="btn btn-ghost-light">
            {t.hero_cta_avail} <span className="arrow">→</span>
          </a>
        </div>
        <div className="hero-proof">
          <span className="hero-proof-item">★ 9.8 <span className="hero-proof-name">Mar</span></span>
          <span className="hero-proof-dot"/>
          <span className="hero-proof-item">★ 10 <span className="hero-proof-name">Thalassa</span></span>
          <span className="hero-proof-dot"/>
          <span className="hero-proof-item">★ 9.9 <span className="hero-proof-name">Salinas</span></span>
          <span className="hero-proof-platform">{lang === 'es' ? 'Media en Booking · Airbnb · web — +600 familias desde 2016' : 'Average across Booking · Airbnb · site — 600+ families since 2016'}</span>
        </div>
        {(() => {
          const prices = typeof HESTIA_PRICES !== 'undefined' ? HESTIA_PRICES : null;
          if (!prices) return null;
          const mins = ['vm','vt','vs'].map(id => {
            const tbl = prices[id]; if (!tbl) return null;
            return Math.min(...tbl.base.slice(1));
          }).filter(Boolean);
          if (!mins.length) return null;
          const from = Math.min(...mins);
          return (
            <div className="hero-price-line">
              {lang === 'es'
                ? <><span className="hpl-from">desde </span><strong className="hpl-price">{from}€</strong><span className="hpl-per">/noche · precio directo garantizado</span></>
                : <><span className="hpl-from">from </span><strong className="hpl-price">{from}€</strong><span className="hpl-per">/night · guaranteed direct price</span></>}
            </div>
          );
        })()}
      </div>
      <div className="hero-meta">
        <span className="hero-meta-coords">37°11′N · 1°50′W</span>
        <div className="hero-meta-facts">
          <span>Alt. 5 m</span>
          <span className="hm-dot" aria-hidden="true">·</span>
          <span>{lang === 'es' ? '320+ días de sol' : '320+ sunny days'}</span>
          <span className="hm-dot" aria-hidden="true">·</span>
          <span>Mar Mediterráneo</span>
        </div>
        <span className="hide-mobile hero-meta-province">Almería · Andalucía</span>
      </div>
    </section>
  );
};

// --- BRIDGE (transición día/noche) ---
const Bridge = ({ lang }) => {
  const t = COPY[lang];
  const sectionRef = React.useRef(null);
  const [burst, setBurst] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setBurst(true), 420); obs.disconnect(); } },
      { threshold: 0.38 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bridge" data-screen-label="02 Amanecer" ref={sectionRef}>
      <div className={`celestial${burst ? ' sun-burst' : ''}`}/>
      <div className="bridge-inner">
        <div className="eyebrow bridge-time">— 07:14 —</div>
        <h2 className="reveal" style={{marginTop: 20}}>{t.bridge_title}</h2>
        <p className="reveal delay-1">{t.bridge_sub}</p>
        <div className={`bridge-palette${burst ? ' burst-active' : ''}`}>
          {BRIDGE_PALETTE.map((c, i) => (
            <div key={i} className="bridge-chip" style={{ '--chip-color': c.hex, '--chip-idx': i }}>
              <div className="chip-swatch"/>
              <div className="chip-label">
                {(lang === 'es' ? c.es : c.en).split(' · ').map((part, j) => (
                  <span key={j}>{part}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- MODAL DE RESERVA DESDE HOME ---
const HomeBookingModal = ({ apt, lang, onClose }) => {
  const [name,  setName ] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [msg,   setMsg  ] = React.useState('');
  const cardRef = React.useRef(null);

  const valid = name.trim().length > 0 && /\S+@\S+/.test(email);
  const waNum = lang === 'es' ? '34620316370' : '34654138251';

  const buildWaMsg = () => {
    const intro = lang === 'es'
      ? `Hola, me llamo ${name}.\n\nMe interesa ${apt.name}.\n`
      : `Hello, my name is ${name}.\n\nI'm interested in ${apt.name}.\n`;
    const ph  = phone ? (lang === 'es' ? `Tel: ${phone}\n` : `Phone: ${phone}\n`) : '';
    const em  = `Email: ${email}\n`;
    const txt = msg ? `\n${msg}\n` : '';
    const end = lang === 'es'
      ? '\n¿Podéis indicarme disponibilidad y precio final?\n¡Gracias!'
      : '\nCould you let me know availability and final price?\nThank you!';
    return intro + em + ph + txt + end;
  };

  const mailSubj = lang === 'es' ? `Consulta reserva — ${apt.name}` : `Booking enquiry — ${apt.name}`;
  const mailBody = lang === 'es'
    ? `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone || '—'}\nHestía: ${apt.name}\n\n${msg || '(sin mensaje adicional)'}`
    : `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nHestía: ${apt.name}\n\n${msg || '(no additional message)'}`;

  React.useEffect(() => {
    const FOCUSABLE = 'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const card = cardRef.current;
    if (card && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const first = card.querySelector(FOCUSABLE);
      if (first) first.focus();
    }
    const onKey = e => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && card) {
        const nodes = [...card.querySelectorAll(FOCUSABLE)];
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, []);

  const WaIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
    </svg>
  );

  return (
    <div className="hbm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="hbm-apt-title">
      <div className="hbm-card" ref={cardRef} onClick={e => e.stopPropagation()}>
        <button className="hbm-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="hbm-head">
          <div className="hbm-apt-num">{apt.num}</div>
          <div id="hbm-apt-title" className="hbm-apt-name">HESTÍA <strong>{apt.name.replace('Hestía ', '')}</strong></div>
          <p className="hbm-sub">{lang === 'es' ? 'Solicitud de información · sin compromiso' : 'No-commitment enquiry'}</p>
        </div>

        <div className="hbm-form">
          <div className="hbm-row">
            <div className="hbm-field">
              <label>{lang === 'es' ? 'Nombre *' : 'Name *'}</label>
              <input value={name} onChange={e => setName(e.target.value)}
                     placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'} autoComplete="name"/>
            </div>
            <div className="hbm-field">
              <label>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                     placeholder="tu@email.com" autoComplete="email"/>
            </div>
          </div>
          <div className="hbm-row">
            <div className="hbm-field">
              <label>{lang === 'es' ? 'Teléfono' : 'Phone'} <span className="hbm-opt">{lang === 'es' ? '(opcional)' : '(optional)'}</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+34 600 000 000" autoComplete="tel"/>
            </div>
            <div className="hbm-field hbm-field-wide">
              <label>{lang === 'es' ? 'Mensaje' : 'Message'} <span className="hbm-opt">{lang === 'es' ? '(opcional)' : '(optional)'}</span></label>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2}
                        placeholder={lang === 'es' ? 'Fechas pensadas, número de personas…' : 'Dates in mind, number of guests…'}/>
            </div>
          </div>
          {!valid && (name.length > 0 || email.length > 0) && (
            <p className="hbm-hint">{lang === 'es' ? '✦ Nombre y email requeridos para continuar' : '✦ Name and email required to continue'}</p>
          )}
        </div>

        <div className="hbm-actions">
          <a href={valid ? `https://wa.me/${waNum}?text=${encodeURIComponent(buildWaMsg())}` : undefined}
             className={`hbm-btn hbm-wa${!valid ? ' hbm-dis' : ''}`}
             target="_blank" rel="noopener"
             onClick={!valid ? e => e.preventDefault() : undefined}>
            <WaIcon/> {lang === 'es' ? 'WhatsApp con Alex o Fran' : 'WhatsApp Alex or Fran'}
          </a>
          <a href={valid ? `mailto:info@hestiayourhome.com?subject=${encodeURIComponent(mailSubj)}&body=${encodeURIComponent(mailBody)}` : undefined}
             className={`hbm-btn hbm-mail${!valid ? ' hbm-dis' : ''}`}
             onClick={!valid ? e => e.preventDefault() : undefined}>
            <MailIcon/> {lang === 'es' ? 'Enviar por email' : 'Send by email'}
          </a>
        </div>
        <p className="hbm-note">
          {lang === 'es'
            ? '* Precios orientativos máximos. Alex o Fran responden normalmente en minutos.'
            : '* Maximum guide prices. Alex or Fran usually reply in minutes.'}
        </p>
      </div>
    </div>
  );
};

// --- APARTAMENTOS (scroll horizontal) ---
const APARTMENTS = [
  { id: 'vm', num: '01', name: 'Hestía Mar',      slug: 'mar',      license: 'VFT/AL/01580', concept: 'apt_01_concept',
    img: 'assets/apt-vs.jpg', imgW: 1024, imgH: 768,
    meta: ['6 + bebé', '2 hab.', 'Piscina', 'Mascotas · petición'] },
  { id: 'vt', num: '02', name: 'Hestía Thalassa', slug: 'thalassa', license: 'VFT/AL/05535', concept: 'apt_02_concept',
    img: 'assets/apt-vt-4.jpg', imgW: 1440, imgH: 1103,
    meta: ['6 + bebé', '2 hab.', 'Ático', 'SPA'] },
  { id: 'vs', num: '03', name: 'Hestía Salinas',  slug: 'salinas',  license: 'VFT/AL/07056', concept: 'apt_03_concept',
    img: 'assets/apt-vm.jpg', imgW: 1255, imgH: 1146,
    meta: ['6 + bebé', '2 hab.', '3 piscinas', 'Salinas'] },
];

const _aptNextFree = (data, aptId) => {
  if (!data) return null;
  const today = new Date().toISOString().slice(0, 10);
  const manualBlocks = (window.PRICES_V2?.manual_blocks) || {};
  const avBlocked = data[aptId]?.blocked || [];
  const all = [...avBlocked, ...(manualBlocks[aptId] || [])].sort((a, b) => a.start.localeCompare(b.start));
  const merged = [];
  for (const r of all) {
    if (merged.length && r.start <= merged[merged.length - 1].end) {
      if (r.end > merged[merged.length - 1].end) merged[merged.length - 1] = { ...merged[merged.length - 1], end: r.end };
    } else merged.push({ ...r });
  }
  let cursor = today;
  for (const block of merged.filter(b => b.end > today)) {
    if (block.start > cursor) {
      const nights = Math.round((new Date(block.start + 'T12:00:00Z') - new Date(cursor + 'T12:00:00Z')) / 86400000);
      if (nights >= 2) return { checkin: cursor, checkout: block.start, nights };
    }
    if (block.end > cursor) cursor = block.end;
  }
  return { checkin: cursor, checkout: null, nights: null };
};

const Apartments = ({ lang }) => {
  const t = COPY[lang];
  const trackRef = React.useRef(null);
  const [activeIdx,  setActiveIdx ] = React.useState(0);
  const [bookingApt, setBookingApt] = React.useState(null);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const [aptAvail, setAptAvail] = React.useState({});

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const result = {};
        for (const apt of APARTMENTS) result[apt.id] = _aptNextFree(data, apt.id);
        setAptAvail(result);
      })
      .catch(() => {});
  }, []);

  // Precios "desde / hasta" mostrados son el base de prices.json
  // (lo que el admin ve en /p-edit.html). Sin aplicar directDiscount —
  // ese descuento es para el ahorro vs plataformas dentro del desglose.
  const aptMaxPrice = (aptId) => {
    const tbl = HESTIA_PRICES[aptId];
    if (!tbl) return null;
    const maxBase = Math.max(...tbl.base.slice(1));
    const maxPeak = tbl.peaks && tbl.peaks.length ? Math.max(...tbl.peaks.map(p => p.pn)) : 0;
    return Math.max(maxBase, maxPeak);
  };

  const aptMinPrice = (aptId) => {
    const tbl = HESTIA_PRICES[aptId];
    if (!tbl) return null;
    return Math.min(...tbl.base.slice(1));
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setHasScrolled(true);
    const children = track.querySelectorAll('.apt-card');
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    children.forEach((child, i) => {
      const r = child.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - center);
      if (d < closestDist) { closestDist = d; closestIdx = i; }
    });
    setActiveIdx(closestIdx);
  };

  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.querySelectorAll('.apt-card')[i];
    if (child) {
      track.scrollTo({ left: child.offsetLeft - (track.clientWidth - child.clientWidth) / 2, behavior: 'smooth' });
    }
  };

  // Tilt 3D al pasar el cursor sobre cada apt-card. Solo en desktop con
  // hover real (excluye táctil). Máx ±6° en X/Y. Se desactiva si el
  // usuario prefiere reduced-motion. CSS lee --tilt-rx / --tilt-ry.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(hover: hover) and (pointer: fine)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!m.matches || rm.matches) return;
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.apt-card'));
    const cleanup = [];
    cards.forEach(card => {
      let raf = 0;
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 6;
        const ry = (x - 0.5) * 6;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.setProperty('--tilt-rx', `${rx.toFixed(2)}deg`);
          card.style.setProperty('--tilt-ry', `${ry.toFixed(2)}deg`);
        });
      };
      const onLeave = () => {
        cancelAnimationFrame(raf);
        card.style.setProperty('--tilt-rx', '0deg');
        card.style.setProperty('--tilt-ry', '0deg');
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      cleanup.push(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
    return () => cleanup.forEach(fn => fn());
  }, []);

  return (
    <>
      <section className="apartments-intro" id="apartamentos" data-screen-label="03 Hestías">
        <div className="eyebrow">{t.apts_eyebrow}</div>
        <h2>{t.apts_title}</h2>
        <p>{t.apts_sub}</p>
      </section>
      <div className={`apartments-scroll${hasScrolled ? ' scrolled' : ''}`}>
        <div className="apartments-track" ref={trackRef} onScroll={handleScroll}>
          {APARTMENTS.map((a, i) => {
            const minPrice = aptMinPrice(a.id);
            return (
              <div key={a.id} id={`apt-${a.id}`} className={`apt-card ${a.id}`}>
                <picture>
                  <source srcSet={a.img.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
                  <img decoding="async" src={a.img} alt={a.name} className="apt-photo" loading="eager" width={a.imgW} height={a.imgH}/>
                </picture>
                <WatermarkBadge size={32} pos={{ bottom: 72, right: 16 }}/>
                <div className="apt-wash"/>
                <div className="pattern"/>
                <div className="apt-corner"><span className="bar"/>{a.license}</div>
                <div className="apt-content">
                  <div className="apt-num">{a.num}</div>
                  <div className="apt-name">
                    <span className="small">HESTÍA</span><br/>{a.name.replace('Hestía ', '')}
                  </div>
                  <div className="apt-tag">« {t[a.concept]} »</div>
                  <div className="apt-meta">
                    {a.meta.map((m, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="dot"/>}
                        <span>{m}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  {minPrice && (
                    <div className="apt-price-badge">
                      <span className="apb-label">{lang === 'es' ? 'desde' : 'from'}</span>
                      <span className="apb-price">{minPrice.toLocaleString('es-ES')}€</span>
                      <span className="apb-per">{lang === 'es' ? '/noche · precio directo orientativo' : '/night · guide direct price'}</span>
                      <span className="apb-match">
                        {lang === 'es'
                          ? '✓ Hasta un 10% aprox. más barato que en Booking o Airbnb*'
                          : '✓ Up to ~10% cheaper than Booking or Airbnb*'}
                      </span>
                    </div>
                  )}
                  {(() => {
                    const av = aptAvail[a.id];
                    if (!av) return null;
                    const today = new Date().toISOString().slice(0, 10);
                    const isNow = av.checkin <= today;
                    const months = lang === 'es'
                      ? ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
                      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    const fmt = d => { const [,mm,dd] = d.split('-'); return `${parseInt(dd)} ${months[parseInt(mm)-1]}`; };
                    return (
                      <div className="apt-avail-hint">
                        <span className="aah-dot"/>
                        {isNow
                          ? (lang === 'es' ? 'Disponible ahora' : 'Available now')
                          : `${lang === 'es' ? 'Libre' : 'Free'} ${fmt(av.checkin)}`}
                        {av.checkout && av.nights
                          ? <span className="aah-nights"> · {av.nights} {lang === 'es' ? 'noches' : 'nights'}</span>
                          : <span className="aah-nights"> {lang === 'es' ? 'en adelante' : 'onwards'}</span>}
                      </div>
                    );
                  })()}
                  <div className="apt-ctas">
                    <a href={`${a.slug}.html`} className="apt-link-cta">{t.apt_cta}</a>
                    <button className="apt-cta" onClick={() => setBookingApt(a)}>
                      {lang === 'es' ? 'Reservar →' : 'Book →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="apt-scroll-progress">
          {APARTMENTS.map((a, i) => (
            <button
              key={i}
              className={`seg ${i === activeIdx ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={a.name}
            >
              <span className="seg-label">{a.name.replace('Hestía ', '')}</span>
            </button>
          ))}
        </div>
      </div>
      {bookingApt && <HomeBookingModal apt={bookingApt} lang={lang} onClose={() => setBookingApt(null)}/>}
    </>
  );
};

// --- COMPARADOR ---
const Compare = ({ lang }) => {
  const rows = lang === 'es' ? [
    { label: 'Concepto',      vm: 'El mar desde los olivos', vt: 'Ático · mar y Salar de los Canos', vs: 'Amanecer sobre las salinas' },
    { label: 'Plazas',        vm: '6 + bebé · 2 hab.', vt: '6 + bebé · 2 hab.', vs: '6 + bebé · 2 hab.' },
    { label: 'Terraza',       vm: 'Esquina 20m² · mar', vt: 'Panorámica · mar + salar', vs: 'Dos terrazas' },
    { label: 'Piscina',       vm: 'Comunitaria', vt: '2 ext. + jacuzzi', vs: 'Comunitaria + pistas de pádel' },
    { label: 'Extra ⭑',       vm: 'Jacuzzi comunitario', vt: 'Minigim · piscina climatizada + minispa (otoño-primavera)', vs: 'Gimnasio · sauna · Parque Natural Salinas' },
    { label: 'Playa',         vm: '300 m', vt: '1,5 km', vs: '900 m' },
    { label: 'Mascotas',      vm: 'Sí · petición + suplem.', vt: 'Sí · petición + suplem.', vs: 'Sí · petición + suplem.' },
    { label: 'Ideal para',    vm: 'Practicidad · todo a mano', vt: 'Las mejores vistas', vs: 'Paz · jardines · naturaleza' },
    { label: 'Superguía',     vm: '✓ Incluida', vt: '✓ Incluida', vs: '✓ Incluida' },
    { label: 'Trato',         vm: '✓ Personalizado', vt: '✓ Personalizado', vs: '✓ Personalizado' },
    { label: 'Valoración',    vm: <>9.8 <span className="rate-sub">/10</span></>, vt: <>10 <span className="rate-sub">/10</span></>, vs: <>9.9 <span className="rate-sub">/10</span></>, rate: true },
  ] : [
    { label: 'Concept',       vm: 'Sea through the olive grove', vt: 'Penthouse · sea & Salar de los Canos', vs: 'Sunrise over the salt flats' },
    { label: 'Guests',        vm: '6 + baby · 2 bed.', vt: '6 + baby · 2 bed.', vs: '6 + baby · 2 bed.' },
    { label: 'Terrace',       vm: 'Corner 20m² · sea', vt: 'Panoramic · sea + salt flats', vs: 'Two terraces' },
    { label: 'Pool',          vm: 'Shared', vt: '2 outdoor + jacuzzi', vs: 'Shared + padel courts' },
    { label: 'Extra ⭑',       vm: 'Shared jacuzzi', vt: 'Mini-gym · heated pool + mini-spa (autumn–spring)', vs: 'Gym · sauna · salt-flat nature park' },
    { label: 'Beach',         vm: '300 m', vt: '1.5 km', vs: '900 m' },
    { label: 'Pets',          vm: 'Yes · request + suppl.', vt: 'Yes · request + suppl.', vs: 'Yes · request + suppl.' },
    { label: 'Ideal for',     vm: 'Practicality · everything close', vt: 'Best views in the complex', vs: 'Peace · gardens · nature' },
    { label: 'Guide',         vm: '✓ Included', vt: '✓ Included', vs: '✓ Included' },
    { label: 'Care',          vm: '✓ Personal service', vt: '✓ Personal service', vs: '✓ Personal service' },
    { label: 'Rating',        vm: <>9.8 <span className="rate-sub">/10</span></>, vt: <>10 <span className="rate-sub">/10</span></>, vs: <>9.9 <span className="rate-sub">/10</span></>, rate: true },
  ];
  const t = COPY[lang];

  return (
    <section className="compare section-cream" data-screen-label="04 Comparador">
      <div className="container">
        <div className="eyebrow">{t.compare_eyebrow}</div>
        <h2 style={{marginTop: 14}}>{t.compare_title}</h2>
        <div className="compare-grid">
          <div className="label"> </div>
          <div className="head vm">
            <span className="apt-tag">01 · Hestía</span>
            <span>Mar</span>
            <span className="apt-concept">« {t.apt_01_concept} »</span>
          </div>
          <div className="head vt">
            <span className="apt-tag">02 · Hestía</span>
            <span>Thalassa</span>
            <span className="apt-concept">« {t.apt_02_concept} »</span>
          </div>
          <div className="head vs">
            <span className="apt-tag">03 · Hestía</span>
            <span>Salinas</span>
            <span className="apt-concept">« {t.apt_03_concept} »</span>
          </div>
          {rows.map((r, i) => (
            <React.Fragment key={i}>
              <div className="label">{r.label}</div>
              <div className={`cell ${r.rate ? 'rate' : ''}`}>{r.vm}</div>
              <div className={`cell ${r.rate ? 'rate' : ''}`}>{r.vt}</div>
              <div className={`cell ${r.rate ? 'rate' : ''}`}>{r.vs}</div>
            </React.Fragment>
          ))}
        </div>

        {/* Mobile: swipeable cards (one per apartment) */}
        <div className="compare-cards-mobile">
          {[
            { key: 'vm', num: '01', name: 'Mar',      aptKey: 'apt_01_concept' },
            { key: 'vt', num: '02', name: 'Thalassa', aptKey: 'apt_02_concept' },
            { key: 'vs', num: '03', name: 'Salinas',  aptKey: 'apt_03_concept' },
          ].map(a => (
            <div key={a.key} className={`cc-card cc-${a.key}`}>
              <div className="cc-card-head">
                <span className="apt-tag">{a.num} · Hestía</span>
                <span className="cc-card-name">{a.name}</span>
                <span className="apt-concept">« {t[a.aptKey]} »</span>
              </div>
              {rows.map((row, i) => (
                <div key={i} className="cc-row">
                  <span className="cc-lbl">{row.label}</span>
                  <span className={`cc-val${row.rate ? ' rate' : ''}`}>{row[a.key]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ================================================================
// LAST MINUTE STRIP — huecos disponibles en los próximos 45 días
// ================================================================
const LastMinuteStrip = ({ lang, embedded = false }) => {
  const [slots, setSlots] = React.useState([]);

  const _loadSlots = React.useCallback(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const todayStr = new Date().toISOString().slice(0, 10);
        const horizon = new Date();
        horizon.setDate(horizon.getDate() + 90);
        const horizonStr = horizon.toISOString().slice(0, 10);

        const manualBlocks = (window.PRICES_V2 && window.PRICES_V2.manual_blocks) || {};
        const mergeRanges = (a, b) => {
          const all = [...a, ...b].sort((x, y) => x.start.localeCompare(y.start));
          const m = [];
          for (const r of all) {
            if (m.length && r.start <= m[m.length-1].end) {
              if (r.end > m[m.length-1].end) m[m.length-1] = { ...m[m.length-1], end: r.end };
            } else { m.push({ ...r }); }
          }
          return m;
        };
        // Devuelve true si el rango [checkin, checkout) se solapa con temporada crítica.
        const overlapsCritica = (checkin, checkout) => {
          const v2 = window.PRICES_V2;
          if (!v2 || !v2.calendar) return false;
          const years = [...new Set([checkin.slice(0, 4), checkout.slice(0, 4)])];
          for (const yr of years) {
            const ranges = v2.calendar[yr]?.seasons?.critica || [];
            for (const [s, e] of ranges) {
              if (checkin < e && checkout > s) return true;
            }
          }
          return false;
        };
        const found = [];
        for (const apt of APARTMENTS) {
          const avBlocked = data[apt.id]?.blocked || [];
          const blocked = mergeRanges(avBlocked, manualBlocks[apt.id] || []);
          const sorted = blocked
            .filter(b => b.end > todayStr)
            .sort((a, b) => a.start.localeCompare(b.start));

          let cursor = todayStr;
          for (const block of sorted) {
            if (cursor >= horizonStr) break;
            if (block.start > cursor) {
              const nights = Math.round(
                (new Date(block.start + 'T12:00:00Z') - new Date(cursor + 'T12:00:00Z')) / 86400000
              );
              const critica = overlapsCritica(cursor, block.start);
              const ok = critica ? (nights >= 2 && nights < 6) : (nights >= 2 && nights <= 28);
              if (ok) found.push({ apt, checkin: cursor, checkout: block.start, nights });
            }
            if (block.end > cursor) cursor = block.end;
          }
          if (cursor < horizonStr) {
            const nights = Math.round(
              (new Date(horizonStr + 'T12:00:00Z') - new Date(cursor + 'T12:00:00Z')) / 86400000
            );
            const critica = overlapsCritica(cursor, horizonStr);
            const ok = critica ? (nights >= 2 && nights < 6) : (nights >= 2 && nights <= 28);
            if (ok) found.push({ apt, checkin: cursor, checkout: horizonStr, nights });
          }
        }
        found.sort((a, b) => a.checkin.localeCompare(b.checkin));
        const seen = {};
        const filtered = [];
        for (const s of found) {
          const id = s.apt.id;
          if ((seen[id] || 0) < 4) { filtered.push(s); seen[id] = (seen[id] || 0) + 1; }
          if (filtered.length >= 9) break;
        }
        setSlots(filtered);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    _loadSlots();
    const iv = setInterval(_loadSlots, 4 * 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, [_loadSlots]);

  // Marquee con auto-scroll por JS (rAF) que ADEMÁS se puede arrastrar con dedo
  // (móvil/iPad) o ratón (PC) en ambos sentidos. El contenido va duplicado, así
  // que basta con envolver el offset en [-setW, 0] para un bucle continuo.
  const wrapRef = React.useRef(null);
  const trackRef = React.useRef(null);
  React.useEffect(() => {
    const wrap = wrapRef.current, track = trackRef.current;
    if (!wrap || !track) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let setW = track.scrollWidth / 2;
    const durSec = Math.max(10, slots.length * 5);
    const speed = setW > 0 ? setW / (durSec * 1000) : 0; // px por ms (igual que la animación CSS previa)
    let offset = 0, raf = 0, last = performance.now();
    let dragging = false, hovering = false, lastX = 0, moved = 0;
    const wrapOffset = () => { if (setW <= 0) return; while (offset <= -setW) offset += setW; while (offset > 0) offset -= setW; };
    const apply = () => { track.style.transform = `translateX(${offset}px)`; };
    const frame = (now) => {
      const dt = Math.min(now - last, 50); last = now;
      if (!dragging && !hovering && !reduce) { offset -= speed * dt; wrapOffset(); apply(); }
      raf = requestAnimationFrame(frame);
    };
    const onDown = (e) => { dragging = true; moved = 0; lastX = e.clientX; wrap.classList.add('lm-dragging'); try { wrap.setPointerCapture(e.pointerId); } catch (_) {} };
    const onMove = (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); offset += dx; wrapOffset(); apply(); };
    const onUp = (e) => { if (!dragging) return; dragging = false; wrap.classList.remove('lm-dragging'); try { wrap.releasePointerCapture(e.pointerId); } catch (_) {} };
    const onClick = (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } };
    const onEnter = (e) => { if (e.pointerType === 'mouse') hovering = true; };
    const onLeave = (e) => { if (e.pointerType === 'mouse') hovering = false; };
    const onResize = () => { setW = track.scrollWidth / 2; };
    setW = track.scrollWidth / 2; apply();
    raf = requestAnimationFrame(frame);
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointercancel', onUp);
    wrap.addEventListener('pointerenter', onEnter);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('click', onClick, true);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('pointercancel', onUp);
      wrap.removeEventListener('pointerenter', onEnter);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('click', onClick, true);
      window.removeEventListener('resize', onResize);
    };
  }, [slots]);

  if (!slots.length) return null;

  const fmtDate = (ds) => {
    if (!ds) return '';
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-ES', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    }).format(new Date(ds + 'T12:00:00Z'));
  };

  const APT_COLOR = { vm: '#6B7A3A', vt: '#B86A3C', vs: '#D4A84A' };

  const getStayPrice = (aptId, checkin, checkout) => {
    try {
      // Para huecos largos, calculamos precio sobre los primeros 7 días para no mostrar
      // el total de toda la temporada (ej. 41 noches de verano = precio disparatado).
      const gapNights = Math.round(
        (new Date(checkout + 'T12:00:00Z') - new Date(checkin + 'T12:00:00Z')) / 86400000
      );
      const sampleNights = Math.min(gapNights, 7);
      const sampleDate = new Date(checkin + 'T12:00:00Z');
      sampleDate.setUTCDate(sampleDate.getUTCDate() + sampleNights);
      const sampleCheckout = sampleDate.toISOString().slice(0, 10);
      const r = _calcStay(checkin, sampleCheckout, aptId, false, 2);
      if (!r || !r.directTotal || !r.nights) return null;
      return { total: Math.round(r.directTotal), perNight: Math.round(r.directTotal / r.nights), gapNights };
    } catch (_) { return null; }
  };

  const renderCard = (slot, key) => {
    const price = getStayPrice(slot.apt.id, slot.checkin, slot.checkout);
    const color = APT_COLOR[slot.apt.id];
    const url = `reservas.html?apt=${slot.apt.id}&checkin=${slot.checkin}&checkout=${slot.checkout}`;
    const aptShort = slot.apt.name.replace('Hestía ', '').toUpperCase();
    return (
      <a key={key} href={url} className="lm-card" style={{ '--lm-color': color }}>
        <span className="lm-card-apt">{aptShort}</span>
        <span className="lm-card-dates">
          <span className="lm-card-d1">{fmtDate(slot.checkin)}</span>
          <span className="lm-card-sep">→</span>
          <span className="lm-card-d2">{fmtDate(slot.checkout)}</span>
        </span>
        <span className="lm-card-meta">
          {slot.nights <= 21 ? slot.nights : `${slot.nights}+`} {lang === 'es' ? 'noches' : 'nights'}
          {price && <span className="lm-card-ppn"> · desde {price.perNight}€/n</span>}
        </span>
        {price && slot.nights <= 14 && <span className="lm-card-total">~{price.total.toLocaleString('es-ES')}€</span>}
      </a>
    );
  };

  const renderLongStayCard = (key) => {
    const ls = window.PRICES_V2?.longStayConfig;
    const minRate = ls?.monthlyRates ? Math.min(...Object.values(ls.monthlyRates)) : 1450;
    return (
      <a key={key} href="estancias-largas.html" className="lm-card lm-card--longstay">
        <span className="lm-card-apt lm-card-apt--longstay">
          {lang === 'es' ? 'ESTANCIA LARGA' : 'LONG STAY'}
        </span>
        <span className="lm-card-meta">
          {lang === 'es' ? '29+ noches · descuento especial' : '29+ nights · special discount'}
          <span className="lm-card-ppn"> · desde {minRate.toLocaleString('es-ES')}€/mes</span>
        </span>
        <span className="lm-card-total lm-longstay-cta">
          {lang === 'es' ? 'Ver condiciones →' : 'See conditions →'}
        </span>
      </a>
    );
  };

  return (
    <section className={`lm-strip${embedded ? ' lm-strip--embedded' : ''}`} aria-label={lang === 'es' ? 'Últimas plazas disponibles' : 'Last-minute availability'}>
      <div className="lm-inner">
        {!embedded && (
          <span className="lm-eyebrow eyebrow">
            {lang === 'es' ? 'Huecos disponibles ahora:' : 'Available now:'}
          </span>
        )}
        <div className="lm-marquee-wrap" ref={wrapRef}>
          <div className="lm-marquee-track" ref={trackRef}>
            {slots.map((slot, i) => renderCard(slot, i))}
            {renderLongStayCard('ls1')}
            {slots.map((slot, i) => renderCard(slot, `d${i}`))}
            {renderLongStayCard('ls2')}
          </div>
        </div>
        {!embedded && (
          <a href="reservas.html" className="lm-cta">
            {lang === 'es' ? 'Ver disponibilidad completa →' : 'See full availability →'}
          </a>
        )}
      </div>
    </section>
  );
};

// ================================================================
// HOME PRICE STRIP — 3 precios base visibles antes del buscador
// ================================================================
const HomePriceStrip = ({ lang }) => {
  const APT_META = [
    { id: 'vm', name: 'Mar',      slug: 'mar',      accent: '#6B7A3A' },
    { id: 'vt', name: 'Thalassa', slug: 'thalassa', accent: '#B86A3C' },
    { id: 'vs', name: 'Salinas',  slug: 'salinas',  accent: '#D4A84A' },
  ];

  const basePrice = (id) => {
    const v2 = window.PRICES_V2;
    if (v2 && v2.apts && v2.apts[id] && v2.apts[id].base) return v2.apts[id].base;
    return { vm: 88, vt: 85, vs: 83 }[id];
  };

  return (
    <section className="hps-strip" aria-label={lang === 'es' ? 'Precios por apartamento' : 'Prices per apartment'}>
      <div className="hps-inner">
        <p className="hps-label eyebrow">
          {lang === 'es' ? 'Precio directo · sin intermediarios' : 'Direct price · no middlemen'}
        </p>
        <div className="hps-grid">
          {APT_META.map(apt => {
            const p = basePrice(apt.id);
            const pMin = p ? Math.round(p * 1.10) : null;
            return (
              <a key={apt.id} href={`${apt.slug}.html`} className="hps-card" style={{ '--hps-accent': apt.accent }}>
                <span className="hps-name">HESTÍA <strong>{apt.name.toUpperCase()}</strong></span>
                <span className="hps-price">
                  <span className="hps-desde">{lang === 'es' ? 'desde' : 'from'}</span>
                  <span className="hps-amount">{p}€</span>
                  <span className="hps-per">/noche</span>
                </span>
                {p && (
                  <span className="hps-ota-compare">
                    <span className="hps-ota-row">
                      <span className="hps-ota-name">Booking / Airbnb</span>
                      <span className="hps-ota-price">desde ~{pMin}€</span>
                      <span className="hps-ota-pct">+10% aprox.</span>
                    </span>
                  </span>
                )}
                <span className="hps-cta">{lang === 'es' ? 'Ver apartamento →' : 'View apartment →'}</span>
              </a>
            );
          })}
        </div>
        <p className="hps-disclaimer">
          {lang === 'es'
            ? '* Precios en plataformas aproximados. No incluyen las ofertas personales o generales que las plataformas puedan hacer a sus clientes, ni sus programas de fidelización o descuento — ya que no podemos conocerlos. En cualquier caso, siempre podemos mejorar el precio.'
            : '* Platform prices are approximate. They do not include personal or general offers, nor loyalty or discount programmes that platforms may offer their customers — as we cannot know them. In any case, we can always do better on price.'}
        </p>
      </div>
    </section>
  );
};

const LongStayStrip = ({ lang }) => {
  const es = lang === 'es';
  const v2 = window.PRICES_V2;
  const bases = v2?.apts ? Object.values(v2.apts).map(a => a.base).filter(Boolean) : [];
  const minBase = bases.length ? Math.min(...bases) : 83;
  const nightlyMonthly = minBase * 30;
  const lsCfg = v2?.longStayConfig || {};
  const lsRates = lsCfg.monthlyRates || { baja: 1450, media: 1590, alta: 1790 };
  const supps = Object.values(lsCfg.aptSupplement || {});
  const lsRate = Math.min(lsRates.baja, lsRates.media, lsRates.alta) + (supps.length ? Math.min(...supps) : 0);
  const savings = Math.round((1 - lsRate / nightlyMonthly) * 100);
  return (
    <section className="lss-strip" aria-label={es ? 'Estancias largas' : 'Long stays'}>
      <div className="lss-inner">
        <div className="lss-text">
          <p className="eyebrow lss-eyebrow">{es ? 'Más de un mes en Vera Playa' : 'More than a month in Vera Playa'}</p>
          <h2 className="lss-title">
            {es ? <>Teletrabajo, empresa<br/>o temporada larga.</> : <>Remote work, business<br/>or an extended stay.</>}
          </h2>
          <p className="lss-sub">
            {es
              ? 'Apartamentos totalmente equipados de septiembre a junio. Precio fijo mensual, sin intermediarios, con contrato.'
              : 'Fully equipped apartments from September to June. Fixed monthly price, no middlemen, formal contract.'}
          </p>
        </div>
        <div className="lss-right">
          <div className="lss-pills">
            <span className="lss-pill">{es ? '29+ noches' : '29+ nights'}</span>
            <span className="lss-pill lss-pill-compare">
              <span className="lss-pill-reg">~{nightlyMonthly.toLocaleString('es-ES')}€/mes</span>
              <span className="lss-pill-arrow">→</span>
              <span className="lss-pill-ls">{es ? `desde ${lsRate.toLocaleString('es-ES')}€/mes` : `from €${lsRate.toLocaleString('en-US')}/mo`}</span>
              <span className="lss-pill-save">−{savings}%</span>
            </span>
            <span className="lss-pill">WiFi fibra</span>
            <span className="lss-pill">{es ? 'Contrato formal' : 'Formal contract'}</span>
          </div>
          <a href="estancias-largas.html" className="lss-cta">
            {es ? 'Ver condiciones y precios →' : 'See conditions and pricing →'}
          </a>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Hero, Bridge, Apartments, Compare, APARTMENTS, LastMinuteStrip, HomePriceStrip, LongStayStrip });
