// ================================================================
// HESTÍA — Secciones de la home
// ================================================================

// --- HERO cinematográfico ---
const Hero = ({ lang, onScrollDown }) => {
  const t = COPY[lang];
  const videoRef = React.useRef(null);
  const [videoReady, setVideoReady] = React.useState(false);

  return (
    <section id="top" className="hero" data-screen-label="01 Hero">
      {/* Vídeo de fondo — playas de Almería */}
      <video
        className="hero-bg-video"
        autoPlay muted loop playsInline
        preload="auto"
      >
        <source src="assets/playa-almeria.mp4" type="video/mp4"/>
      </video>
      {/* Logo animation overlay — mix-blend-mode screen */}
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay muted loop playsInline
        onCanPlay={() => setVideoReady(true)}
      >
        <source src="assets/logo-anim.mp4" type="video/mp4"/>
      </video>
      <div className="hero-content">
        <div className="hero-logo-wrap">
          {/* Fallback estático — el video va como overlay */}
          <img
            src="assets/logo-teal-transparent.png"
            alt="Hestía"
            className="hero-logo-img"
            style={{ opacity: videoReady ? 0 : 1, transition: 'opacity .6s' }}
          />
        </div>
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
          <a href="#contacto" className="btn btn-ghost-light">{t.hero_cta_2}</a>
        </div>
      </div>
      <div className="hero-meta">
        <span>N°01 · Noche mediterránea</span>
        <div className="scroll-hint">
          <span>{t.scroll_hint}</span>
          <div className="line"></div>
        </div>
        <span className="hide-mobile">{t.hero_meta_right}</span>
      </div>
    </section>
  );
};

// --- BRIDGE (transición día/noche) ---
const Bridge = ({ lang }) => {
  const t = COPY[lang];
  return (
    <section className="bridge" data-screen-label="02 Amanecer">
      <div className="celestial"/>
      <div className="bridge-inner">
        <div className="eyebrow bridge-time">— 07:14 —</div>
        <h2 className="reveal" style={{marginTop: 20}}>{t.bridge_title}</h2>
        <p className="reveal delay-1">{t.bridge_sub}</p>
        <div className="bridge-palette reveal delay-2">
          {BRIDGE_PALETTE.map((c, i) => (
            <div key={i} className="bridge-chip" style={{'--chip-color': c.hex}}>
              <div className="chip-swatch"/>
              <div className="chip-label">{lang === 'es' ? c.es : c.en}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- APARTAMENTOS (scroll horizontal) ---
const APARTMENTS = [
  { id: 'vm', num: '01', name: 'Hestía Mar',      slug: 'mar',      license: 'VFT/AL/01580', concept: 'apt_01_concept',
    img: 'assets/apt-vs.jpg',
    meta: ['6 + bebé', '2 hab.', 'Piscina', 'Mascotas consultar'] },
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
  const [activeIdx, setActiveIdx] = React.useState(0);

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

  return (
    <>
      <section className="apartments-intro" id="apartamentos" data-screen-label="03 Apartamentos">
        <div className="eyebrow">{t.apts_eyebrow}</div>
        <h2>{t.apts_title}</h2>
        <p>{t.apts_sub}</p>
      </section>
      <div className="apartments-scroll">
        <div className="apartments-track" ref={trackRef} onScroll={handleScroll}>
          {APARTMENTS.map((a, i) => (
            <div key={a.id} id={`apt-${a.id}`} className={`apt-card ${a.id}`}>
              <img src={a.img} alt={a.name} className="apt-photo" loading="eager"/>
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
                <a href={`${a.slug}.html`} className="apt-cta">{t.apt_cta} →</a>
              </div>
            </div>
          ))}
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
    </>
  );
};

// --- COMPARADOR ---
const Compare = ({ lang }) => {
  const rows = lang === 'es' ? [
    { label: 'Concepto',    vm: 'El mar desde los olivos', vt: 'Ático con vistas al Tabernas', vs: 'Amanecer sobre las salinas' },
    { label: 'Plazas',      vm: '6 + bebé · 2 hab.', vt: '6 + bebé · 2 hab.', vs: '6 + bebé · 2 hab.' },
    { label: 'Terraza',     vm: 'Esquina 20m² · mar', vt: 'Panorámica 360°', vs: 'Dos terrazas' },
    { label: 'Piscina',     vm: 'Comunitaria', vt: 'Comunitaria + pádel', vs: '3 piscinas' },
    { label: 'Extra ⭑',     vm: 'Jacuzzi temporada', vt: 'SPA cromo + aromaterapia', vs: 'Parque Natural Salinas' },
    { label: 'Playa',       vm: '300 m', vt: '1,5 km', vs: '900 m' },
    { label: 'Mascotas',    vm: 'Sí · aviso previo', vt: 'Sí · aviso previo', vs: 'Sí · aviso previo' },
    { label: 'Valoración',  vm: <>9.8 <span className="rate-sub">/10</span></>, vt: <>10 <span className="rate-sub">/10</span></>, vs: <>9.9 <span className="rate-sub">/10</span></>, rate: true },
  ] : [
    { label: 'Concept',     vm: 'Sea through the olive grove', vt: 'Penthouse facing Tabernas', vs: 'Sunrise over the salt flats' },
    { label: 'Guests',      vm: '6 + baby · 2 bed.', vt: '6 + baby · 2 bed.', vs: '6 + baby · 2 bed.' },
    { label: 'Terrace',     vm: 'Corner 20m² · sea', vt: '360° panoramic', vs: 'Two terraces' },
    { label: 'Pool',        vm: 'Shared', vt: 'Shared + padel', vs: '3 pools' },
    { label: 'Extra ⭑',     vm: 'Seasonal jacuzzi', vt: 'SPA chromotherapy', vs: 'Salt-flat nature park' },
    { label: 'Beach',       vm: '300 m', vt: '1,5 km', vs: '900 m' },
    { label: 'Pets',        vm: 'Yes · prior notice', vt: 'Yes · prior notice', vs: 'Yes · prior notice' },
    { label: 'Rating',      vm: <>9.8 <span className="rate-sub">/10</span></>, vt: <>10 <span className="rate-sub">/10</span></>, vs: <>9.9 <span className="rate-sub">/10</span></>, rate: true },
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
      </div>
    </section>
  );
};

Object.assign(window, { Hero, Bridge, Apartments, Compare, APARTMENTS });
