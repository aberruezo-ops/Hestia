// ================================================================
// HESTÍA, Página de Opiniones / Reviews
// ================================================================

const OPINIONES_COPY = {
  es: {
    eyebrow: 'Lo que dicen de nosotros',
    title: (<>Diez años puntuando <em>casi perfecto.</em></>),
    sub: 'No es un eslogan. Son cifras verificadas por las plataformas, escritas por las familias que han dormido aquí.',
    platform_title: 'Puntuaciones verificadas',
    testimonials_title: (<>Lo que dicen <em>los huéspedes.</em></>),
    cta_eyebrow: 'Ahora es tu turno',
    cta_title: (<>¿Listo para <em>tu estancia?</em></>),
    cta_sub: 'Reserva directamente con nosotros. Sin intermediarios, sin comisiones, con Alex o Fran al otro lado.',
  },
  en: {
    eyebrow: 'What they say about us',
    title: (<>Ten years scoring <em>almost perfect.</em></>),
    sub: 'Not a slogan. Verified numbers from the platforms, written by the families who slept here.',
    platform_title: 'Verified scores',
    testimonials_title: (<>What the <em>guests say.</em></>),
    cta_eyebrow: 'Now it\'s your turn',
    cta_title: (<>Ready for <em>your stay?</em></>),
    cta_sub: 'Book directly with us. No middlemen, no commissions, with Alex or Fran on the other side.',
  },
};

// Color de acento por Hestía (los mismos que en /opiniones tabs).
const APT_ACCENT = {
  vm:  '#6B7A3A',
  vt:  '#B86A3C',
  vs:  '#D4A84A',
  all: '#3D1A35',
};
// Mapeo apt → nombre completo para mostrar.
const APT_FULL = { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas', all: 'Hestía' };
// Etiquetas de plataforma + color de badge.
const SOURCE_META = {
  booking: { label: 'Booking.com', short: 'Booking', color: '#003B95' },
  airbnb:  { label: 'Airbnb',      short: 'Airbnb',  color: '#FF5A5F' },
  google:  { label: 'Google',      short: 'Google',  color: '#4285F4' },
  web:     { label: 'Hestía',      short: 'Web',     color: '#3D1A35' },
};
// Convierte rating a 5 estrellas (Booking usa /10, Airbnb/Google /5).
const ratingToStars = (rating, source) => {
  if (rating == null) return 5;
  if (source === 'booking') return Math.round(rating / 2);
  return Math.round(rating);
};

const Stars = ({ count }) => (
  <div className="stars-row" aria-label={`${count} estrellas`}>
    {Array.from({ length: count }).map((_, i) => (
      <HiIcon key={i} name="star-fill" size={15} className="star" />
    ))}
  </div>
);

const OpinionesHero = ({ lang }) => {
  const t = OPINIONES_COPY[lang];
  const videoRef = React.useRef(null);

  // Auto-play resiliente a iOS (muted + playsInline) y a tabs en background.
  React.useEffect(() => {
    const tryPlay = (el) => { if (el) { el.muted = true; el.play().catch(() => {}); } };
    tryPlay(videoRef.current);
    const onVisible = () => { if (!document.hidden) tryPlay(videoRef.current); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <section className="page-hero opiniones-hero">
      <video ref={videoRef} className="opiniones-hero-video" autoPlay muted loop playsInline preload="auto">
        <source src="assets/mp_.mp4" type="video/mp4"/>
      </video>
      <div className="opiniones-hero-wash"/>
      <div className="stars"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const OpinionesRatings = ({ lang }) => {
  const t = COPY[lang];
  return (
    <section className="opiniones-platforms section-cream">
      <div className="container">
        <div className="ratings-grid">
          <div className="rating-card" style={{ borderTopColor: 'var(--sol-h)' }}>
            <div className="platform">Booking.com</div>
            <div className="score">9<span className="dec">.8</span><span className="score-max">/10</span></div>
            <div className="desc">{t.rating_booking_desc}</div>
            <a href="https://www.booking.com" target="_blank" rel="noopener" className="platform-link">
              {lang === 'es' ? 'Ver en Booking.com' : 'View on Booking.com'} →
            </a>
          </div>
          <div className="rating-card" style={{ borderTopColor: 'var(--vt)' }}>
            <div className="platform">Airbnb · Superhost</div>
            <div className="score">5<span className="dec">.0</span><span className="score-max">/5</span></div>
            <div className="desc">{t.rating_airbnb_desc}</div>
            <a href="https://www.airbnb.com" target="_blank" rel="noopener" className="platform-link">
              {lang === 'es' ? 'Ver en Airbnb' : 'View on Airbnb'} →
            </a>
          </div>
          <div className="rating-card" style={{ borderTopColor: 'var(--vs)' }}>
            <div className="platform">Google Maps</div>
            <div className="score">4<span className="dec">.9</span><span className="score-max">/5</span></div>
            <div className="desc">{t.rating_google_desc}</div>
            <a href="https://maps.google.com" target="_blank" rel="noopener" className="platform-link">
              {lang === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// OpinionesTestimonials, sección de reviews curadas + web propia
// Lee window.REVIEWS (cargado en el HTML antes que el componente).
// Cinta horizontal con frases cortas extraídas de las reviews –
// teaser emocional antes del grid estructurado. Bg eggplant + texto
// arena (ratio ~11:1). Pausa en hover. Off en reduced-motion.
const OpinionesQuotesMarquee = ({ lang }) => {
  const all = (window.REVIEWS && Array.isArray(window.REVIEWS.items))
    ? window.REVIEWS.items.filter(r => r.status === 'published')
    : [];
  // Picamos ~12 frases cortas (max 90 chars) representativas: primera
  // oración de cada review que entre en el límite. Filtramos por idioma
  // de la review para no mezclar.
  const quotes = all
    .map(r => {
      const m = (r.text || '').match(/^[^.!?]*[.!?]/);
      const txt = m ? m[0].trim() : '';
      return { txt, name: r.name.split(' ')[0], apt: r.apt, lang: r.lang };
    })
    .filter(q => q.txt.length > 25 && q.txt.length < 100 && q.lang === lang)
    .slice(0, 14);
  if (quotes.length === 0) return null;
  const doubled = [...quotes, ...quotes];
  return (
    <section className="opiniones-quotes-marquee" aria-label={lang === 'es' ? 'Frases destacadas' : 'Featured quotes'}>
      <div className="oqm-track" aria-hidden="true">
        {doubled.map((q, i) => (
          <React.Fragment key={i}>
            <span className="oqm-quote">
              <span className="oqm-mark">«</span>
              <span className="oqm-text">{q.txt}</span>
              <span className="oqm-mark">»</span>
              <span className="oqm-attr">, {q.name}</span>
            </span>
            <span className="oqm-dot" aria-hidden="true">✦</span>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const REVIEW_WORDS = 25; // palabras visibles antes del "leer más"

const ReviewCard = ({ rev, lang, fmtDate }) => {
  const meta = SOURCE_META[rev.source] || SOURCE_META.web;
  const stars = ratingToStars(rev.rating, rev.source);
  const aptColor = APT_ACCENT[rev.apt] || APT_ACCENT.all;
  const aptName = APT_FULL[rev.apt] || 'Hestía';
  const text = rev.text || '';
  const words = text.split(/\s+/);
  const needsTrunc = words.length > REVIEW_WORDS;
  const [open, setOpen] = React.useState(false);
  const displayed = needsTrunc && !open ? words.slice(0, REVIEW_WORDS).join(' ') + '…' : text;

  return (
    <article
      className="testimonial-card"
      data-apt={rev.apt}
      data-source={rev.source}
      style={{ '--apt-color': aptColor, '--src-color': meta.color }}
    >
      <span className="testimonial-stripe" aria-hidden="true"/>
      <header className="testimonial-head">
        <span className="testimonial-source-pill">{meta.short}</span>
        <span className="testimonial-apt-pill">{aptName}</span>
      </header>
      <span className="testimonial-quote-mark" aria-hidden="true">"</span>
      <blockquote className="testimonial-quote">{displayed}</blockquote>
      {needsTrunc && (
        <button type="button" className="testimonial-expand-btn" onClick={() => setOpen(o => !o)}>
          {open
            ? (lang === 'es' ? 'Leer menos' : 'Show less')
            : (lang === 'es' ? 'Leer más' : 'Read more')}
        </button>
      )}
      <footer className="testimonial-foot">
        <div className="testimonial-foot-left">
          <span className="testimonial-name">{rev.name.split(' ')[0]}</span>
          <span className="testimonial-year">{fmtDate(rev.date)}</span>
        </div>
        <Stars count={stars}/>
      </footer>
    </article>
  );
};

// Reviews paginadas: 6 por "página", flechas prev/next, sin scroll vertical infinito.
// ============================================================
const CARDS_PER_PAGE = 24;

// Criterios de orden. "Relevantes" antepone las destacadas y, dentro, las que
// traen texto largo: una reseña de tres palabras convence menos que una que
// cuenta algo, aunque las dos sean de cinco estrellas.
const ORDENES = [
  { id: 'relevantes', es: 'Más relevantes', en: 'Most relevant' },
  { id: 'recientes',  es: 'Más recientes',  en: 'Most recent' },
  { id: 'mejores',    es: 'Mejor valoradas', en: 'Highest rated' },
  { id: 'largas',     es: 'Más detalladas',  en: 'Most detailed' },
];

// Booking puntúa sobre 10 y el resto sobre 5: sin normalizar, ordenar por nota
// pondría siempre Booking arriba.
const _nota5 = r => (r.source === 'booking' ? r.rating / 2 : r.rating) || 0;
const _fecha = r => r.date || '';

const ordenar = (lista, modo) => {
  const l = [...lista];
  if (modo === 'recientes') return l.sort((a, b) => _fecha(b).localeCompare(_fecha(a)));
  if (modo === 'mejores')   return l.sort((a, b) => _nota5(b) - _nota5(a) || _fecha(b).localeCompare(_fecha(a)));
  if (modo === 'largas')    return l.sort((a, b) => (b.text || '').length - (a.text || '').length);
  return [
    ...l.filter(r => r.highlight).sort((a, b) => _fecha(b).localeCompare(_fecha(a))),
    ...l.filter(r => !r.highlight).sort((a, b) =>
      (b.text || '').length - (a.text || '').length || _fecha(b).localeCompare(_fecha(a))),
  ];
};

const OpinionesTestimonials = ({ lang }) => {
  const t = OPINIONES_COPY[lang];
  const all = (window.REVIEWS && Array.isArray(window.REVIEWS.items))
    ? window.REVIEWS.items.filter(r => r.status === 'published')
    : [];

  const [filter, setFilter] = React.useState('all');
  const [aptFilter, setAptFilter] = React.useState('all');
  const [page, setPage] = React.useState(0);
  const [orden, setOrden] = React.useState('relevantes');

  const changeFilter = (src) => _vt(() => { setFilter(src); setPage(0); });
  const changeApt   = (apt) => _vt(() => { setAptFilter(apt); setPage(0); });
  const changeOrden = (o)   => _vt(() => { setOrden(o); setPage(0); });

  // Filtrado: fuente + apartamento. Highlights primero, luego por fecha desc.
  const filtered = all
    .filter(r => filter === 'all' || r.source === filter)
    .filter(r => aptFilter === 'all' || r.apt === aptFilter || r.apt === 'all');
  const visible = ordenar(filtered, orden);

  // Resumen de lo que hay bajo el filtro activo: da escala antes de leer.
  const resumen = (() => {
    if (!filtered.length) return null;
    const media = filtered.reduce((a, r) => a + _nota5(r), 0) / filtered.length;
    const cinco = filtered.filter(r => _nota5(r) >= 4.9).length;
    const anios = filtered.map(_fecha).filter(Boolean).sort();
    return {
      media: media.toFixed(2),
      cinco: Math.round(cinco / filtered.length * 100),
      desde: anios.length ? anios[0].slice(0, 4) : null,
      total: filtered.length,
    };
  })();

  const totalPages = Math.max(1, Math.ceil(visible.length / CARDS_PER_PAGE));
  const safePage   = Math.min(page, totalPages - 1);
  const paginated  = visible.slice(safePage * CARDS_PER_PAGE, (safePage + 1) * CARDS_PER_PAGE);

  // Contadores de tabs (respetan el filtro cruzado).
  const inApt = aptFilter === 'all' ? all : all.filter(r => r.apt === aptFilter || r.apt === 'all');
  const counts = {
    all:     inApt.length,
    booking: inApt.filter(r => r.source === 'booking').length,
    airbnb:  inApt.filter(r => r.source === 'airbnb').length,
    google:  inApt.filter(r => r.source === 'google').length,
    web:     inApt.filter(r => r.source === 'web').length,
  };
  const inSrc = filter === 'all' ? all : all.filter(r => r.source === filter);
  const aptCounts = {
    all: inSrc.length,
    vm:  inSrc.filter(r => r.apt === 'vm' || r.apt === 'all').length,
    vt:  inSrc.filter(r => r.apt === 'vt' || r.apt === 'all').length,
    vs:  inSrc.filter(r => r.apt === 'vs' || r.apt === 'all').length,
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (lang === 'es') {
      const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const tabs = [
    { id: 'all',     es: 'Todas',   en: 'All' },
    { id: 'booking', es: 'Booking', en: 'Booking' },
    { id: 'airbnb',  es: 'Airbnb',  en: 'Airbnb' },
    { id: 'google',  es: 'Google',  en: 'Google' },
    { id: 'web',     es: 'Web',     en: 'Web' },
  ];
  const aptTabs = [
    { id: 'all', es: 'Todas las Hestías', en: 'All Hestías', accent: 'var(--ber)' },
    { id: 'vm',  es: 'Mar',              en: 'Mar',          accent: '#6B7A3A' },
    { id: 'vt',  es: 'Thalassa',         en: 'Thalassa',     accent: '#8A4A24' },
    { id: 'vs',  es: 'Salinas',          en: 'Salinas',      accent: '#7A5E1A' },
  ];

  return (
    <section className="opiniones-testimonials">
      <div className="container">
        <h2 className="reveal">{t.testimonials_title}</h2>
        <p className="opiniones-tt-sub reveal">
          {lang === 'es'
            ? 'Mezcla de Booking, Airbnb, Google Maps y opiniones recogidas en nuestra propia web. Curadas y verificadas.'
            : 'A mix of Booking, Airbnb, Google Maps and reviews collected on our own site. Curated and verified.'}
        </p>

        <div className="opiniones-tabs reveal" role="tablist" aria-label={lang === 'es' ? 'Filtrar por fuente' : 'Filter by source'}>
          {tabs.map(tab => (
            <button key={tab.id} type="button" role="tab"
              aria-selected={filter === tab.id}
              className={`opiniones-tab${filter === tab.id ? ' is-active' : ''}`}
              onClick={() => changeFilter(tab.id)}>
              {lang === 'es' ? tab.es : tab.en}
              <span className="opiniones-tab-count">({counts[tab.id]})</span>
            </button>
          ))}
        </div>
        <div className="opiniones-tabs opiniones-tabs-apt reveal" role="tablist" aria-label={lang === 'es' ? 'Filtrar por Hestía' : 'Filter by Hestía'}>
          {aptTabs.map(tab => (
            <button key={tab.id} type="button" role="tab"
              aria-selected={aptFilter === tab.id}
              className={`opiniones-tab opiniones-tab-apt${aptFilter === tab.id ? ' is-active' : ''}`}
              style={{ '--apt-accent': tab.accent }}
              onClick={() => changeApt(tab.id)}>
              {lang === 'es' ? tab.es : tab.en}
              <span className="opiniones-tab-count">({aptCounts[tab.id]})</span>
            </button>
          ))}
        </div>

        {resumen && (
          <div className="opi-resumen reveal">
            <div className="opi-res-datos">
              <div><b>{resumen.media}</b><span>{lang === 'es' ? 'sobre 5' : 'out of 5'}</span></div>
              <div><b>{resumen.total}</b><span>{lang === 'es' ? 'opiniones' : 'reviews'}</span></div>
              <div><b>{resumen.cinco}%</b><span>{lang === 'es' ? 'de sobresaliente' : 'top marks'}</span></div>
              {resumen.desde && <div><b>{resumen.desde}</b><span>{lang === 'es' ? 'desde' : 'since'}</span></div>}
            </div>
            <div className="opi-orden">
              <label htmlFor="opi-orden-sel">{lang === 'es' ? 'Ordenar por' : 'Sort by'}</label>
              <select id="opi-orden-sel" value={orden} onChange={e => changeOrden(e.target.value)}>
                {ORDENES.map(o => (
                  <option key={o.id} value={o.id}>{lang === 'es' ? o.es : o.en}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <p className="opiniones-empty">
            {lang === 'es' ? 'Aún no hay opiniones para este filtro.' : 'No reviews yet for this filter.'}
          </p>
        ) : (
          <>
            <div className="testimonials-grid">
              {paginated.map((rev) => (
                <ReviewCard key={rev.id} rev={rev} lang={lang} fmtDate={fmtDate} />
              ))}
            </div>
            <div className="tc-nav">
              <button
                className="tc-arrow"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={safePage === 0}
                aria-label={lang === 'es' ? 'Anteriores' : 'Previous'}>
                ←
              </button>
              <span className="tc-counter">
                {safePage * CARDS_PER_PAGE + 1}–{Math.min((safePage + 1) * CARDS_PER_PAGE, visible.length)}
                {' '}/{' '}{visible.length}
              </span>
              <button
                className="tc-arrow"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={safePage === totalPages - 1}
                aria-label={lang === 'es' ? 'Siguientes' : 'Next'}>
                →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const OpinionesPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Opiniones · Hestía Your Home · Vera Playa'
      : 'Reviews · Hestía Your Home · Vera Playa';
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <OpinionesHero lang={lang} />
        <FraseHogar lang={lang} />
        <OpinionesRatings lang={lang} />
        <OpinionesQuotesMarquee lang={lang} />
        <OpinionesTestimonials lang={lang} />
        <section className="opiniones-share-cta">
          <div className="container">
            <div className="osc-eyebrow">{lang === 'es' ? '¿Has dormido en Hestía?' : 'Have you stayed at Hestía?'}</div>
            <h2 className="osc-title">
              {lang === 'es'
                ? <>Tu opinión <em>nos ayuda</em>.</>
                : <>Your opinion <em>helps us</em>.</>}
            </h2>
            <p className="osc-text">
              {lang === 'es'
                ? 'Escríbenos en dos minutos cómo te fue. Una vez aprobada, aparecerá en esta misma página y nos ayudará a mejorar lo que toque.'
                : 'Tell us how it went in two minutes. After we review it, it appears right here and helps us improve where it matters.'}
            </p>
            <a href="escribir-opinion.html" className="btn btn-primary osc-btn">
              {lang === 'es' ? 'Comparte tu experiencia' : 'Share your experience'}
              <span className="arrow"> →</span>
            </a>
            <div className="osc-gmaps">
              <p className="osc-gmaps-lbl">
                {lang === 'es'
                  ? '¿Ya te alojaste? Déjala directamente en Google, en la ficha de tu Hestía:'
                  : 'Already stayed with us? Post it straight on Google, on your Hestía listing:'}
              </p>
              <div className="osc-gmaps-links">
                {[['vm','Hestía Mar'],['vt','Hestía Thalassa'],['vs','Hestía Salinas']].map(([id, name]) => (
                  <a key={id} href={GMAPS_PLACE[id]} target="_blank" rel="noopener" className="osc-gmaps-link">
                    <span className="apt-dot" data-apt={id} aria-hidden="true"/>
                    <span className="osc-gmaps-g" aria-hidden="true">G</span>{name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
        <QuickFAQ lang={lang} pageId="opiniones" />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<OpinionesPageApp/>);
