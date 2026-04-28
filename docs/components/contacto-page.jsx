// ================================================================
// HESTÍA — Página de Contacto (puro contacto, sin formulario de reserva)
// ================================================================

const CONTACTO_COPY = {
  es: {
    eyebrow: 'Estamos aquí para ti',
    title: (<>Contáctanos.<br/><em>Te respondemos nosotros.</em></>),
    sub: 'Sin centralitas. Alex y Fran responden en menos de 24 horas.',
    intro: 'No somos una empresa con centralita. Somos Alex y Fran, y respondemos nosotros personalmente. Alex atiende en español, Fran en inglés.',
    alex_title: 'Alex Berruezo',
    alex_role: 'Creativo · Reservas · Pre-estancia',
    alex_lang: '🇪🇸 Español',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',
    fran_title: 'Fran Moral',
    fran_role: 'Técnico · In-estancia',
    fran_lang: '🇬🇧 English',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',
    wa_label: 'WhatsApp',
    tel_label: 'Teléfono',
    email_label: 'Email',
    addr_eyebrow: 'Encuéntranos en Vera Playa',
    addr: 'Calle Islas Canarias 7, 04621 Vera Playa, Almería, España',
    lic_eyebrow: 'Licencias de alquiler vacacional',
    book_cta: 'Solicitar reserva →',
    book_sub: '¿Quieres reservar un apartamento?',
    faq_title: 'Preguntas frecuentes',
    faqs: [
      { q: '¿Cuándo podéis responder?',
        a: 'Casi siempre en menos de una hora, de 9h a 22h todos los días de la semana. Alex responde en español, Fran en inglés.' },
      { q: '¿Puedo llamar o solo WhatsApp?',
        a: 'Puedes llamar, pero el WhatsApp es más rápido. Alex: +34 620 316 370. Fran: +34 654 138 251.' },
      { q: '¿Cómo hago una reserva?',
        a: (<>Rellena el formulario en nuestra <a href="reservas.html">página de reservas</a> o escríbenos directamente por WhatsApp con las fechas y el apartamento que te interesa.</>),
      },
      { q: '¿Qué apartamentos tenéis?',
        a: (<>Tenemos tres: <a href="mar.html" className="cl-vm">Hestía Mar</a>, <a href="thalassa.html" className="cl-vt">Hestía Thalassa</a> y <a href="salinas.html" className="cl-vs">Hestía Salinas</a>. Puedes comparar los tres en <a href="index.html">la home</a>.</>),
      },
      { q: '¿Quiénes sois Alex y Fran?',
        a: (<><a href="nosotros.html">Somos los propietarios de Hestía</a>, no una agencia. Gestionamos los tres apartamentos en persona desde 2016.</>),
      },
    ],
  },
  en: {
    eyebrow: "We're here for you",
    title: (<>Contact us.<br/><em>We reply ourselves.</em></>),
    sub: 'No call centres. Alex and Fran respond within 24 hours.',
    intro: "We are not a company with a call centre. We are Alex and Fran, and we respond personally. Alex handles Spanish, Fran handles English.",
    alex_title: 'Alex Berruezo',
    alex_role: 'Creative · Bookings · Pre-stay',
    alex_lang: '🇪🇸 Español',
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',
    fran_title: 'Fran Moral',
    fran_role: 'Technical · In-stay',
    fran_lang: '🇬🇧 English',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',
    wa_label: 'WhatsApp',
    tel_label: 'Phone',
    email_label: 'Email',
    addr_eyebrow: 'Find us in Vera Playa',
    addr: 'Calle Islas Canarias 7, 04621 Vera Playa, Almería, Spain',
    lic_eyebrow: 'Holiday rental licences',
    book_cta: 'Request a booking →',
    book_sub: 'Want to book an apartment?',
    faq_title: 'Frequently asked questions',
    faqs: [
      { q: 'When can you reply?',
        a: 'Almost always within an hour, 9am to 10pm every day of the week. Alex replies in Spanish, Fran in English.' },
      { q: 'Can I call or only WhatsApp?',
        a: 'You can call, but WhatsApp is faster. Alex: +34 620 316 370. Fran: +34 654 138 251.' },
      { q: 'How do I make a booking?',
        a: (<>Fill in the form on our <a href="reservas.html">reservations page</a> or write to us directly on WhatsApp with your dates and the apartment you are interested in.</>),
      },
      { q: 'Which apartments do you have?',
        a: (<>We have three: <a href="mar.html" className="cl-vm">Hestía Mar</a>, <a href="thalassa.html" className="cl-vt">Hestía Thalassa</a> and <a href="salinas.html" className="cl-vs">Hestía Salinas</a>. Compare all three on <a href="index.html">the home page</a>.</>),
      },
      { q: 'Who are Alex and Fran?',
        a: (<><a href="nosotros.html">We are the owners of Hestía</a>, not an agency. We have managed the three apartments in person since 2016.</>),
      },
    ],
  },
};

const ContactoHero = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  return (
    <section className="page-hero contacto-hero">
      <div className="stars"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const PersonCard = ({ name, role, langLabel, phone, waLink, quote, initial, accent }) => (
  <div className="contacto-card" style={{ '--card-accent': accent }}>
    <div className="contacto-avatar">{initial}</div>
    <div className="contacto-card-body">
      <div className="contacto-card-lang">{langLabel}</div>
      <div className="contacto-card-name">{name}</div>
      <div className="contacto-card-role">{role}</div>
      <blockquote className="contacto-quote">{quote}</blockquote>
      <div className="contacto-actions">
        <a href={waLink} className="btn btn-primary" target="_blank" rel="noopener">
          WhatsApp <span className="arrow">→</span>
        </a>
        <a href={`tel:${phone}`} className="btn btn-ghost">
          {phone}
        </a>
      </div>
    </div>
  </div>
);

const ContactoPersons = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  return (
    <section className="contacto-persons">
      <div className="container">
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
          />
        </div>
        <div className="contacto-email-row">
          <a href="mailto:info@hestiayourhome.com" className="btn btn-ghost-light">
            ✉ info@hestiayourhome.com
          </a>
        </div>
      </div>
    </section>
  );
};

const ContactoAddress = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  return (
    <section className="contacto-address section-cream">
      <div className="container">
        <div className="contacto-addr-grid">
          <div>
            <div className="eyebrow">{t.addr_eyebrow}</div>
            <div className="contacto-addr-text">📍 {t.addr}</div>
          </div>
          <div>
            <div className="eyebrow">{t.lic_eyebrow}</div>
            <div className="contacto-lic-list">
              <span className="cl-vm">VFT/AL/01580 · <a href="mar.html">Hestía Mar</a></span>
              <span className="cl-vt">VFT/AL/05535 · <a href="thalassa.html">Hestía Thalassa</a></span>
              <span className="cl-vs">VTF/AL/07056 · <a href="salinas.html">Hestía Salinas</a></span>
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
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <span className="faq-chevron">{open === i ? '−' : '+'}</span>
              </button>
              <div className="faq-a">{faq.a}</div>
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
      <main>
        <ContactoHero lang={lang} />
        <FraseHogar lang={lang} />
        <ContactoPersons lang={lang} />
        <ContactoAddress lang={lang} />
        <ContactoFAQ lang={lang} />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ContactoPageApp/>);
