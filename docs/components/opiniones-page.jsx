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

const TESTIMONIALS = [
  { name: 'María G.', apt: 'Hestía Mar', year: '2024', stars: 5,
    es: '«La terraza esquinera al amanecer vale cada euro. Vistas al mar entre los pinos, piscina tranquila y Alex disponible en minutos. Repetiremos en agosto.»',
    en: '«The corner terrace at sunrise is worth every euro. Sea views through the pines, a quiet pool, and Alex available in minutes. We\'ll be back in August.»' },
  { name: 'James & Sophie', apt: 'Hestía Thalassa', year: '2024', stars: 5,
    es: '«Llevamos diez años viajando y nunca habíamos visto unas vistas así desde un alojamiento. El SPA y el ático juntos hacen una combinación difícil de superar.»',
    en: '«Ten years travelling and we\'ve never had views like these from a holiday rental. The SPA and penthouse together — hard to beat.»' },
  { name: 'Familie Müller', apt: 'Hestía Salinas', year: '2023', stars: 5,
    es: '«Llegamos sin saber qué esperar de las salinas. La mañana del segundo día nos levantamos a las 7 y fue una de las mejores experiencias de nuestras vacaciones. Fran nos dejó unos consejos increíbles.»',
    en: '«We arrived not knowing what to expect from the salt flats. On the second morning we got up at 7 am and it was one of the highlights of the whole holiday. Fran\'s tips were invaluable.»' },
  { name: 'Laura P.', apt: 'Hestía Mar', year: '2023', stars: 5,
    es: '«Viajamos con dos perros y desde el primer mensaje se notó que no éramos un problema sino bienvenidos. El Hestía adaptado y sin barreras fue un plus que no esperábamos.»',
    en: '«We travelled with two dogs and from the first message it was clear we weren\'t a problem — we were welcome. The accessible layout was an unexpected bonus.»' },
  { name: 'Antoine & Claire', apt: 'Hestía Thalassa', year: '2024', stars: 5,
    es: '«El ático supera con creces las fotos — y las fotos ya son buenas. La luz a última hora de la tarde en la terraza es algo que no habíamos visto antes. Ya hemos buscado fechas para el año que viene.»',
    en: '«The penthouse far exceeds the photos — and the photos are already good. The late-afternoon light on the terrace was something we\'d never seen before. We\'ve already looked at dates for next year.»' },
  { name: 'Carlos M.', apt: 'Hestía Salinas', year: '2024', stars: 5,
    es: '«Hestía tiene algo que no se puede comprar: la sensación de que alguien ha pensado en cada detalle para que te sientas en casa, no en un alquiler. 10 sobre 10.»',
    en: '«Hestía has something money can\'t buy: the feeling that someone thought of every detail to make you feel at home, not in a rental. 10 out of 10.»' },
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
          {TESTIMONIALS.map((rev, i) => (
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
        <FraseHogar lang={lang} />
        <OpinionesRatings lang={lang} />
        <OpinionesTestimonials lang={lang} />
        <QuickFAQ lang={lang} pageId="opiniones" />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<OpinionesPageApp/>);
