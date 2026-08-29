// ================================================================
// HESTÍA: Página de Contacto (puro contacto, sin formulario de reserva)
// ================================================================

const CONTACTO_COPY = {
  es: {
    eyebrow: 'Estamos aquí para ti',
    title: (<>Contáctanos.<br/><em>Te respondemos nosotros.</em></>),
    sub: 'Sin centralitas. Alex y Fran responden normalmente en minutos.',
    intro: 'No somos una empresa con centralita. Somos Alex y Fran, y respondemos nosotros personalmente. Alex atiende en español, Fran en inglés.',
    alex_title: 'Alex Berruezo',
    alex_role: 'Reserva · Antes de tu llegada',
    alex_lang: '🇪🇸 Español',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, seguiremos en contacto si tú quieres…»',
    fran_title: 'Fran Moral',
    fran_role: 'Estancia · Mientras estás aquí',
    fran_lang: '🇬🇧 English',
    fran_quote: '«If anything breaks, calls, or changes, I am here. Your stay, my job.»',
    wa_label: 'WhatsApp',
    tel_label: 'Teléfono',
    email_label: 'Email',
    addr_eyebrow: 'Encuéntranos en Vera Playa',
    addr: 'Calle Islas Canarias 7, 04621 Vera Playa, Almería, España',
    lic_eyebrow: 'Licencias de alquiler vacacional',
    book_cta: 'Solicitar reserva →',
    book_sub: '¿Quieres reservar Hestía?',
    faq_title: 'Preguntas frecuentes',
    faqs: [
      { q: '¿Cuándo podéis responder?',
        a: 'Normalmente en minutos, de 9h a 22h todos los días de la semana. Alex responde en español, Fran en inglés.' },
      { q: '¿Puedo llamar o solo WhatsApp?',
        a: 'Puedes llamar, pero el WhatsApp es más rápido. Alex: +34 620 316 370. Fran: +34 654 138 251.' },
      { q: '¿Cómo hago una reserva?',
        a: (<>Rellena el formulario en nuestra <a href="reservas.html">página de reservas</a> o escríbenos directamente por WhatsApp con las fechas y qué Hestía te interesa.</>),
      },
      { q: '¿Cómo es el proceso de reserva directa?',
        a: (<>Te enviamos un <strong>borrador de contrato</strong> con derechos y obligaciones de ambas partes (precios, pagos, condiciones de cancelación y normas). Lo revisas, lo rellenas, lo firmas y nos lo devuelves. Una <strong>pequeña prereserva a convenir</strong>, normalmente el <strong>20 % de la reserva total</strong>, se paga al formalizar el contrato; el resto, también <strong>a convenir</strong>, se abona al llegar a Hestía. Acusamos recibo de todo (contrato y prereserva) para que tengas <strong>confianza, garantía y seguridad</strong> en cada paso.</>),
      },
      { q: '¿Qué Hestías tenéis?',
        a: (<>Tenemos tres: <a href="mar.html" className="cl-vm">Hestía Mar</a>, <a href="thalassa.html" className="cl-vt">Hestía Thalassa</a> y <a href="salinas.html" className="cl-vs">Hestía Salinas</a>. Puedes comparar los tres en <a href="/">la home</a>.</>),
      },
      { q: '¿Quiénes sois Alex y Fran?',
        a: (<><a href="nosotros.html">Somos los propietarios de Hestía</a>, no una agencia. Gestionamos los tres en persona desde 2016.</>),
      },
    ],
  },
  en: {
    eyebrow: "We're here for you",
    title: (<>Contact us.<br/><em>We reply ourselves.</em></>),
    sub: 'No call centres. Alex and Fran usually reply in minutes.',
    intro: "We are not a company with a call centre. We are Alex and Fran, and we respond personally. Alex handles Spanish, Fran handles English.",
    alex_title: 'Alex Berruezo',
    alex_role: 'Booking · Before you arrive',
    alex_lang: '🇪🇸 Español',
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, we will stay in touch if you like…»',
    fran_title: 'Fran Moral',
    fran_role: 'Stay · While you are here',
    fran_lang: '🇬🇧 English',
    fran_quote: '«If anything breaks, calls, or changes, I am here. Your stay, my job.»',
    wa_label: 'WhatsApp',
    tel_label: 'Phone',
    email_label: 'Email',
    addr_eyebrow: 'Find us in Vera Playa',
    addr: 'Calle Islas Canarias 7, 04621 Vera Playa, Almería, Spain',
    lic_eyebrow: 'Holiday rental licences',
    book_cta: 'Request a booking →',
    book_sub: 'Want to book a Hestía?',
    faq_title: 'Frequently asked questions',
    faqs: [
      { q: 'When can you reply?',
        a: 'Usually within minutes, 9am to 10pm every day of the week. Alex replies in Spanish, Fran in English.' },
      { q: 'Can I call or only WhatsApp?',
        a: 'You can call, but WhatsApp is faster. Alex: +34 620 316 370. Fran: +34 654 138 251.' },
      { q: 'How do I make a booking?',
        a: (<>Fill in the form on our <a href="reservas.html">reservations page</a> or write to us directly on WhatsApp with your dates and the Hestía you are interested in.</>),
      },
      { q: 'How does the direct booking process work?',
        a: (<>We send you a <strong>draft contract</strong> with the rights and obligations of both sides (prices, payments, cancellation terms and house rules). You review it, fill it in, sign and return it. A <strong>small deposit to agree</strong>, usually <strong>20 % of the total booking</strong>, is paid when the contract is signed; the rest, also <strong>to be agreed</strong>, is paid on arrival at Hestía. We acknowledge everything (contract and deposit) so you have <strong>trust, guarantee and security</strong> at every step.</>),
      },
      { q: 'Which Hestías do you have?',
        a: (<>We have three: <a href="mar.html" className="cl-vm">Hestía Mar</a>, <a href="thalassa.html" className="cl-vt">Hestía Thalassa</a> and <a href="salinas.html" className="cl-vs">Hestía Salinas</a>. Compare all three on <a href="/">the home page</a>.</>),
      },
      { q: 'Who are Alex and Fran?',
        a: (<><a href="nosotros.html">We are the owners of Hestía</a>, not an agency. We have managed the three Hestías in person since 2016.</>),
      },
    ],
  },
};

const ContactoHero = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  const videoRef = React.useRef(null);
  const prefersReducedMotion = React.useMemo(
    () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const tryPlay = (el) => { if (el) { el.muted = true; el.play().catch(() => {}); } };
    tryPlay(videoRef.current);
    const onVisible = () => { if (!document.hidden) tryPlay(videoRef.current); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [prefersReducedMotion]);

  return (
    <section className="page-hero contacto-hero">
      <video ref={videoRef} className="contacto-hero-video" autoPlay={!prefersReducedMotion} muted loop={!prefersReducedMotion} playsInline preload="auto">
        <source src="assets/contacto-hero.mp4" type="video/mp4"/>
      </video>
      <div className="contacto-hero-wash"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const PersonCard = ({ name, role, langLabel, phone, waLink, quote, initial, accent, imgSrc }) => (
  <div className="contacto-card" style={{ '--card-accent': accent }}>
    <div className="contacto-avatar">
      {imgSrc
        ? <img decoding="async" src={imgSrc} alt={name} width="64" height="64" loading="lazy" onError={e => { e.currentTarget.style.display='none'; }}/>
        : initial}
    </div>
    <div className="contacto-card-body">
      <div className="contacto-card-lang">{langLabel}</div>
      <div className="contacto-card-name">{name}</div>
      <div className="contacto-card-role">{role}</div>
      <blockquote className="contacto-quote">{quote}</blockquote>
      <div className="contacto-actions">
        <a href={waLink} className="btn btn-primary" target="_blank" rel="noopener">
          WhatsApp <span className="arrow">→</span>
        </a>
        <a href={`tel:${phone}`} className="btn btn-ghost-dark">
          {phone}
        </a>
      </div>
    </div>
  </div>
);

const ContactoPersons = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  return (
    <section className="contacto-persons" aria-labelledby="contacto-persons-h2">
      <div className="container">
        <h2 id="contacto-persons-h2" className="sr-only">
          {lang === 'es' ? 'Contacta directamente con Alex y Fran' : 'Contact Alex and Fran directly'}
        </h2>
        <p className="contacto-intro">{t.intro}</p>
        <div className="contacto-persons-grid">
          <PersonCard
            name={t.alex_title}
            role={t.alex_role}
            langLabel={t.alex_lang}
            phone="+34 620 316 370"
            waLink="https://wa.me/34620316370"
            quote={t.alex_quote}
            initial="A"
            accent="var(--sol)"
            imgSrc="assets/photo-alex.jpg"
          />
          <PersonCard
            name={t.fran_title}
            role={t.fran_role}
            langLabel={t.fran_lang}
            phone="+34 654 138 251"
            waLink="https://wa.me/34654138251"
            quote={t.fran_quote}
            initial="F"
            accent="var(--vt)"
            imgSrc="assets/photo-fran.jpg"
          />
        </div>
        <div className="contacto-email-row">
          <a href="mailto:info@hestiayourhome.com" className="btn btn-ghost-dark">
            <HiIcon name="mail" size={16} style={{verticalAlign:'-2px',marginRight:5}} />info@hestiayourhome.com
          </a>
        </div>
        <p className="contacto-privacy-note">
          {lang === 'es'
            ? <small>Al contactarnos, tus datos se tratarán conforme a nuestra <a href="privacidad.html">política de privacidad</a>.</small>
            : <small>When you contact us, your data will be handled in accordance with our <a href="privacidad.html">privacy policy</a>.</small>}
        </p>
      </div>
    </section>
  );
};

const ContactoAddress = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  return (
    <section className="contacto-address section-cream" aria-labelledby="contacto-address-h2">
      <div className="container">
        <h2 id="contacto-address-h2" className="sr-only">
          {lang === 'es' ? 'Dirección, licencias y reserva' : 'Address, licences and booking'}
        </h2>
        <div className="contacto-addr-grid">
          <div>
            <div className="eyebrow">{t.addr_eyebrow}</div>
            <div className="contacto-addr-text"><HiIcon name="pin" size={15} style={{verticalAlign:'-2px',marginRight:4}} />{t.addr}</div>
          </div>
          <div>
            <div className="eyebrow">{t.lic_eyebrow}</div>
            <div className="contacto-lic-list">
              <span className="cl-vm">VFT/AL/01580 · <a href="mar.html">Hestía Mar</a></span>
              <span className="cl-vt">VFT/AL/05535 · <a href="thalassa.html">Hestía Thalassa</a></span>
              <span className="cl-vs">VFT/AL/07056 · <a href="salinas.html">Hestía Salinas</a></span>
            </div>
          </div>
          <div className="contacto-book-cta">
            <div className="eyebrow">{t.book_sub}</div>
            <a href="reservas.html" className="btn btn-primary">
              {t.book_cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactoFAQ = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  const [open, setOpen] = React.useState(null);
  return (
    <section className="contacto-faq">
      <div className="container">
        <h2 className="faq-title">{t.faq_title}</h2>
        <div className="faq-list">
          {t.faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i} aria-controls={`contacto-faq-a-${i}`}>
                <span>{faq.q}</span>
                <span className="faq-chevron" aria-hidden="true">{open === i ? '−' : '+'}</span>
              </button>
              <div className="faq-a" id={`contacto-faq-a-${i}`}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactoPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Contacto · Hestía Your Home · Vera Playa'
      : 'Contact · Hestía Your Home · Vera Playa';
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main id="main-content" tabIndex={-1}>
        <ContactoHero lang={lang} />
        <FraseHogar lang={lang} />
        <ContactoPersons lang={lang} />
        <ContactoAddress lang={lang} />
        <ContactoFAQ lang={lang} />
      </main>
      <Footer lang={lang} />
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ContactoPageApp/>);
