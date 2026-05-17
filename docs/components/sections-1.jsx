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
  // Para añadir un vídeo: súbelo a docs/assets/Videoshome/ y añade
  // una entrada con la misma forma. Para hacerlo circular, procesa
  // con ffmpeg crossfade end→start (ver scripts/build-pdf.mjs para
  // el comando exacto que usamos). Moods: violet | teal | warm | night.
];

// --- HERO cinematográfico ---
const Hero = ({ lang, onScrollDown }) => {
  const t = COPY[lang];
  const bgVideoRef = React.useRef(null);
  const sectionRef = React.useRef(null);
  const [vitMin, setVitMin] = React.useState(() => {
    try { return sessionStorage.getItem('hestia-vit-min') === '1'; } catch (_) { return false; }
  });
  // Ocultar vitruvio expandido cuando el hero deja de ser visible en pantalla
  const [heroVisible, setHeroVisible] = React.useState(true);

  const toggleVit = () => {
    const next = !vitMin;
    setVitMin(next);
    try { sessionStorage.setItem('hestia-vit-min', next ? '1' : '0'); } catch (_) {}
  };

  // Elige un vídeo distinto en cada visita a la home dentro de la misma sesión.
  // Nunca repite hasta haber agotado todos; al reiniciar el ciclo evita
  // mostrar el último vídeo otra vez. Persiste en sessionStorage.
  const pick = React.useMemo(() => {
    try {
      const n = HERO_VIDEOS.length;
      const raw = sessionStorage.getItem('hestia-hero-seen');
      const seen = raw ? JSON.parse(raw) : [];
      const allIdx = HERO_VIDEOS.map((_, i) => i);
      const available = allIdx.filter(i => !seen.includes(i));
      // Si ya se vieron todos, reinicia excluyendo el último mostrado
      const pool = available.length > 0 ? available
        : allIdx.filter(i => i !== seen[seen.length - 1]);
      const idx = pool[Math.floor(Math.random() * pool.length)];
      const nextSeen = available.length > 0 ? [...seen, idx] : [idx];
      sessionStorage.setItem('hestia-hero-seen', JSON.stringify(nextSeen));
      return HERO_VIDEOS[idx];
    } catch (_) {
      return HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)];
    }
  }, []);

  React.useEffect(() => {
    // Force autoplay — declarative autoPlay can be blocked on mobile
    const tryPlay = (el) => { if (el) { el.muted = true; el.play().catch(() => {}); } };
    tryPlay(bgVideoRef.current);
    const onVisible = () => { if (!document.hidden) { tryPlay(bgVideoRef.current); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el || !window.IntersectionObserver) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Cuando el hero deja de ser visible y el vitruvio no está minimizado,
  // se oculta para no solaparse con el contenido siguiente.
  const vitHidden = !heroVisible && !vitMin;
  const vitruvio = ReactDOM.createPortal(
    <div className={`hero-vitruvio${vitMin ? ' hv-min' : ''}${vitHidden ? ' hv-offhero' : ''}`}>
      <div className="hv-box" aria-hidden="true" onClick={vitMin ? toggleVit : undefined}
           style={vitMin ? { cursor: 'pointer' } : undefined}>
        <video autoPlay muted loop playsInline preload="auto">
          <source src="assets/hestia-vitruvio.mp4" type="video/mp4"/>
        </video>
      </div>
      <button
        type="button"
        className="hv-toggle"
        onClick={toggleVit}
        aria-label={vitMin
          ? (lang === 'es' ? 'Expandir animacion' : 'Expand animation')
          : (lang === 'es' ? 'Minimizar' : 'Minimise')}
      >
        {vitMin ? '+' : '-'}
      </button>
    </div>,
    document.body
  );

  return (
    <>
    <section
      ref={sectionRef}
      id="top"
      className={`hero mood-${pick.mood}`}
      data-screen-label="01 Hero"
      data-hero-video={pick.src}
    >
      {/* Vídeo de fondo — elegido al azar de HERO_VIDEOS */}
      <video
        ref={bgVideoRef}
        className="hero-bg-video"
        autoPlay muted loop playsInline
        preload="auto"
        poster={pick.poster}
        aria-label={pick.alt}
        key={pick.src}
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
          <span className="hero-proof-platform">{lang === 'es' ? 'Booking · Airbnb · Google' : 'Booking · Airbnb · Google'}</span>
        </div>
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
    {vitruvio}
    </>
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
    const esc = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = prev; };
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
      <div className="hbm-card" onClick={e => e.stopPropagation()}>
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
                     placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'} autoFocus autoComplete="name"/>
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
                        placeholder={lang === 'es' ? 'Fechas pensadas, número de personas...' : 'Dates in mind, number of guests...'}/>
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
            ? '* Precios orientativos máximos. Alex o Fran responden en menos de 24 h.'
            : '* Maximum guide prices. Alex or Fran reply within 24 h.'}
        </p>
      </div>
    </div>
  );
};

// --- APARTAMENTOS (scroll horizontal) ---
const APARTMENTS = [
  { id: 'vm', num: '01', name: 'Hestía Mar',      slug: 'mar',      license: 'VFT/AL/01580', concept: 'apt_01_concept',
    img: 'assets/apt-vs.jpg',
    meta: ['6 + bebé', '2 hab.', 'Piscina', 'Mascotas · petición'] },
  { id: 'vt', num: '02', name: 'Hestía Thalassa', slug: 'thalassa', license: 'VFT/AL/05535', concept: 'apt_02_concept',
    img: 'assets/apt-vt-4.jpg',
    meta: ['6 + bebé', '2 hab.', 'Ático', 'SPA'] },
  { id: 'vs', num: '03', name: 'Hestía Salinas',  slug: 'salinas',  license: 'VTF/AL/07056', concept: 'apt_03_concept',
    img: 'assets/apt-vm.jpg',
    meta: ['6 + bebé', '2 hab.', '3 piscinas', 'Salinas'] },
];

const Apartments = ({ lang }) => {
  const t = COPY[lang];
  const trackRef = React.useRef(null);
  const [activeIdx,  setActiveIdx ] = React.useState(0);
  const [bookingApt, setBookingApt] = React.useState(null);

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
      <div className="apartments-scroll">
        <div className="apartments-track" ref={trackRef} onScroll={handleScroll}>
          {APARTMENTS.map((a, i) => {
            const minPrice = aptMinPrice(a.id);
            return (
              <div key={a.id} id={`apt-${a.id}`} className={`apt-card ${a.id}`}>
                <picture>
                  <source srcSet={a.img.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
                  <img decoding="async" src={a.img} alt={a.name} className="apt-photo" loading="eager"/>
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
                          ? '✓ Si encuentras un precio más bajo, te lo mejoramos'
                          : '✓ Find a lower price — we will beat it'}
                      </span>
                    </div>
                  )}
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
          {APARTMENTS.map((_, i) => (
            <div
              key={i}
              className={`seg ${i === activeIdx ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
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
    { label: 'Piscina',       vm: 'Comunitaria', vt: 'Comunitaria + jacuzzi', vs: 'Comunitaria + pistas de pádel' },
    { label: 'Extra ⭑',       vm: 'Jacuzzi comunitario', vt: 'Minigim · piscina climatizada + minispa (otoño-prim.)', vs: 'Gimnasio · sauna · Parque Natural Salinas' },
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
    { label: 'Pool',          vm: 'Shared', vt: 'Shared + jacuzzi', vs: 'Shared + padel courts' },
    { label: 'Extra ⭑',       vm: 'Shared jacuzzi', vt: 'Mini-gym · heated pool + mini-spa (off-peak)', vs: 'Gym · sauna · salt-flat nature park' },
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

Object.assign(window, { Hero, Bridge, Apartments, Compare, APARTMENTS });
