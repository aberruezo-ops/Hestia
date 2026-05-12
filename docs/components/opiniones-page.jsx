// ================================================================
// HESTÍA — Página de Opiniones / Reviews
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
      <span key={i} className="star">★</span>
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
// OpinionesTestimonials — sección de reviews curadas + web propia
// Lee window.REVIEWS (cargado en el HTML antes que el componente).
// Filtros: todas | Booking | Airbnb | Google | Web.
// Por defecto muestra "highlights" + recientes; expandible al resto.
// ============================================================
const OpinionesTestimonials = ({ lang }) => {
  const t = OPINIONES_COPY[lang];
  const all = (window.REVIEWS && Array.isArray(window.REVIEWS.items))
    ? window.REVIEWS.items.filter(r => r.status === 'published')
    : [];

  const [filter, setFilter] = React.useState('all'); // 'all'|'booking'|'airbnb'|'google'|'web'
  const [expanded, setExpanded] = React.useState(false);

  // Filtrado por fuente.
  const filtered = filter === 'all' ? all : all.filter(r => r.source === filter);

  // Agrupación visible:
  // - Highlights: marcadas como destacadas (las "más relevantes").
  // - Recientes: las 6 más nuevas que NO sean highlights.
  // - Resto: todas las demás cuando se expande.
  const highlights = filtered.filter(r => r.highlight)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const nonHL = filtered.filter(r => !r.highlight)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const recent = nonHL.slice(0, 6);
  const rest   = nonHL.slice(6);

  const visible = expanded
    ? [...highlights, ...recent, ...rest]
    : [...highlights, ...recent];

  // Cuenta por filtro para mostrar (3) etc en la pestaña.
  const counts = {
    all:     all.length,
    booking: all.filter(r => r.source === 'booking').length,
    airbnb:  all.filter(r => r.source === 'airbnb').length,
    google:  all.filter(r => r.source === 'google').length,
    web:     all.filter(r => r.source === 'web').length,
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
    { id: 'all',     es: 'Todas',    en: 'All' },
    { id: 'booking', es: 'Booking',  en: 'Booking' },
    { id: 'airbnb',  es: 'Airbnb',   en: 'Airbnb' },
    { id: 'google',  es: 'Google',   en: 'Google' },
    { id: 'web',     es: 'Web',      en: 'Web' },
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

        <div className="opiniones-tabs reveal" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              className={`opiniones-tab${filter === tab.id ? ' is-active' : ''}`}
              onClick={() => _vt(() => { setFilter(tab.id); setExpanded(false); })}>
              {lang === 'es' ? tab.es : tab.en}
              <span className="opiniones-tab-count">({counts[tab.id]})</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="opiniones-empty">
            {lang === 'es' ? 'Aún no hay opiniones para este filtro.' : 'No reviews yet for this filter.'}
          </p>
        ) : (
          <>
            {highlights.length > 0 && filter === 'all' && (
              <div className="opiniones-section-label reveal">
                <span className="osl-star" aria-hidden="true">✦</span>
                {lang === 'es' ? 'Más relevantes' : 'Most relevant'}
              </div>
            )}
            <div className="testimonials-grid">
              {visible.map((rev) => {
                const meta = SOURCE_META[rev.source] || SOURCE_META.web;
                const stars = ratingToStars(rev.rating, rev.source);
                return (
                  <div key={rev.id} className="testimonial-card">
                    <div className="testimonial-top">
                      <Stars count={stars}/>
                      <span className="testimonial-source" style={{ '--src-color': meta.color }}>
                        {meta.short}
                      </span>
                    </div>
                    <blockquote>«{rev.text}»</blockquote>
                    <div className="testimonial-meta">
                      <span className="testimonial-name">{rev.name}</span>
                      <span className="testimonial-apt">{APT_FULL[rev.apt] || 'Hestía'}</span>
                      <span className="testimonial-year">{fmtDate(rev.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {rest.length > 0 && (
              <div className="opiniones-expand-wrap reveal">
                <button
                  type="button"
                  className="opiniones-expand-btn"
                  onClick={() => setExpanded(e => !e)}>
                  {expanded
                    ? (lang === 'es' ? `Mostrar menos` : 'Show less')
                    : (lang === 'es' ? `Ver todas (+${rest.length})` : `See all (+${rest.length})`)}
                  <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
                </button>
              </div>
            )}
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
