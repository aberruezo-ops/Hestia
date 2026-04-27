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
    testimonials_note: 'Próximamente añadiremos aquí las mejores reseñas de nuestros huéspedes.',
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
    testimonials_note: 'We will add the best guest reviews here soon.',
    cta_eyebrow: 'Now it\'s your turn',
    cta_title: (<>Ready for <em>your stay?</em></>),
    cta_sub: 'Book directly with us. No middlemen, no commissions, with Alex or Fran on the other side.',
  },
};

const TESTIMONIALS_PLACEHOLDER = [
  { name: 'María G.', apt: 'Hestía Mar', year: '2024', stars: 5,
    es: '«Increíble. La terraza, el mar al fondo y los niños disfrutando de la piscina. Volveremos seguro.»',
    en: '«Incredible. The terrace, the sea in the background and the kids enjoying the pool. We\'ll definitely be back.»' },
  { name: 'James & Sophie', apt: 'Hestía Thalassa', year: '2024', stars: 5,
    es: '«El SPA y las vistas de 360° son como nada que hayamos experimentado. Alex respondió siempre en minutos.»',
    en: '«The SPA and 360° views are unlike anything we\'ve experienced. Alex always replied within minutes.»' },
  { name: 'Familie Müller', apt: 'Hestía Salinas', year: '2023', stars: 5,
    es: '«Las salinas al amanecer son mágicas. Fran nos recomendó los mejores restaurantes locales.»',
    en: '«The salt flats at sunrise are magical. Fran recommended the best local restaurants.»' },
  { name: 'Laura P.', apt: 'Hestía Mar', year: '2023', stars: 5,
    es: '«Vinimos con dos perros y se sintieron como en casa. El apartamento, impecable.»',
    en: '«We came with two dogs and they felt right at home. The apartment, immaculate.»' },
  { name: 'Antoine & Claire', apt: 'Hestía Thalassa', year: '2024', stars: 5,
    es: '«El ático supera todas las fotos. Un lugar para repetir cada verano.»',
    en: '«The penthouse surpasses all the photos. A place to return to every summer.»' },
  { name: 'Carlos M.', apt: 'Hestía Salinas', year: '2024', stars: 5,
    es: '«Hestía tiene algo especial. No es solo un alquiler — es una casa con alma.»',
    en: '«Hestía has something special. It\'s not just a rental — it\'s a home with soul.»' },
];

const Stars = ({ count }) => (
  <div className="stars-row" aria-label={`${count} estrellas`}>
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} className="star">★</span>
    ))}
  </div>
);

const OpinionesHero = ({ lang }) => {
  const t = OPINIONES_COPY[lang];
  return (
    <section className="page-hero opiniones-hero">
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

const OpinionesTestimonials = ({ lang }) => {
  const t = OPINIONES_COPY[lang];
  return (
    <section className="opiniones-testimonials">
      <div className="container">
        <h2 className="reveal">{t.testimonials_title}</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS_PLACEHOLDER.map((rev, i) => (
            <div key={i} className="testimonial-card reveal">
              <Stars count={rev.stars}/>
              <blockquote>{lang === 'es' ? rev.es : rev.en}</blockquote>
              <div className="testimonial-meta">
                <span className="testimonial-name">{rev.name}</span>
                <span className="testimonial-apt">{rev.apt}</span>
                <span className="testimonial-year">{rev.year}</span>
              </div>
            </div>
          ))}
        </div>
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
        <OpinionesRatings lang={lang} />
        <OpinionesTestimonials lang={lang} />
        <QuickFAQ lang={lang} />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<OpinionesPageApp/>);
