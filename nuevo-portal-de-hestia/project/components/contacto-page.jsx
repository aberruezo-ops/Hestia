// ================================================================
// HESTÍA — Página de Contacto
// ================================================================

const CONTACTO_COPY = {
  es: {
    eyebrow: 'Reserva directa · Sin intermediarios',
    title: (<>Hablemos. Te responde<br/><em>una persona.</em></>),
    sub: 'Alex en español, Fran en inglés. WhatsApp, teléfono o email — sin formularios, sin bots, sin comisiones.',
    person_label: 'Tu interlocutor',
    alex_title: 'Alex Berruezo',
    alex_role: 'Creativo · Reservas · Pre-estancia',
    alex_lang: 'Español',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',
    fran_title: 'Fran Moral',
    fran_role: 'Técnico · In-estancia · English bookings',
    fran_lang: 'English',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',
    wa_label: 'WhatsApp',
    tel_label: 'Teléfono',
    addr_label: 'Dirección',
    addr: 'Calle Islas Canarias 7, 04621 Vera Playa, Almería, España',
    reservas_eyebrow: 'Reserva directa',
    reservas_title: 'Tres pasos, sin intermediarios',
    reservas_steps: [
      { n: '01', t: 'Escríbenos', d: 'WhatsApp o email con las fechas y el apartamento que te interesa.' },
      { n: '02', t: 'Confirmamos', d: 'Disponibilidad y precio en minutos, sin depósitos en plataformas externas.' },
      { n: '03', t: 'Reservado', d: 'Trato directo, sin comisiones. Alex o Fran te acompañan desde ese momento.' },
    ],
    faq_title: 'Preguntas frecuentes',
    faqs: [
      { q: '¿Cómo reservo directamente?', a: <>Escríbenos por <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a> con las fechas y el apartamento que te interesa. Te confirmamos disponibilidad y precio en minutos, sin comisiones a terceros.</> },
      { q: '¿Aceptáis mascotas?', a: <>En <a href="mar.html">Hestía Mar</a> sí, con mucho gusto — las mascotas son parte de la familia. En <a href="thalassa.html">Thalassa</a> y <a href="salinas.html">Salinas</a> consultad antes, depende de cada caso.</> },
      { q: '¿Cuál es el apartamento más adecuado para mí?', a: <><a href="mar.html">Hestía Mar</a> es ideal para familias con niños o mascotas (planta baja, jardín y piscina directa). <a href="thalassa.html">Thalassa</a> es el ático con SPA y vistas 360°, perfecto para una escapada especial. <a href="salinas.html">Salinas</a> destaca por sus tres piscinas y las vistas al Parque Natural. Compara los tres en <a href="index.html#comparar">nuestra tabla comparativa</a>.</> },
      { q: '¿Cuál es la política de cancelación?', a: 'Flexible hasta 30 días antes de la llegada. Consulta las condiciones exactas al reservar.' },
      { q: '¿Ofrecéis traslados o actividades?', a: 'No organizamos traslados, pero os recomendamos con gusto los mejores servicios locales que conocemos desde hace diez años.' },
      { q: '¿Cuándo podéis responder?', a: <>Casi siempre en menos de una hora, de 9h a 22h todos los días de la semana. Alex responde en español y Fran en inglés — <a href="https://wa.me/34620316370" target="_blank" rel="noopener">escríbenos ahora</a>.</> },
      { q: '¿Quiénes sois Alex y Fran?', a: <><a href="nosotros.html">Somos los propietarios de Hestía</a>, no una agencia. Gestionamos directamente los tres apartamentos desde 2016. Más de 900 familias nos han elegido.</> },
    ],
  },
  en: {
    eyebrow: 'Direct booking · No middlemen',
    title: (<>Write to us. A<br/><em>real person</em> replies.</>),
    sub: 'Alex in Spanish, Fran in English. WhatsApp, phone or email — no endless forms, no bots, no commissions.',
    person_label: 'Your point of contact',
    alex_title: 'Alex Berruezo',
    alex_role: 'Creative · Bookings · Pre-stay',
    alex_lang: 'Español',
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',
    fran_title: 'Fran Moral',
    fran_role: 'Technical · In-stay · English bookings',
    fran_lang: 'English',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',
    wa_label: 'WhatsApp',
    tel_label: 'Phone',
    addr_label: 'Address',
    addr: 'Calle Islas Canarias 7, 04621 Vera Playa, Almería, Spain',
    reservas_eyebrow: 'Direct booking',
    reservas_title: 'Three steps, no middlemen',
    reservas_steps: [
      { n: '01', t: 'Write to us', d: 'WhatsApp or email with your dates and the apartment you are interested in.' },
      { n: '02', t: 'We confirm', d: 'Availability and price in minutes, no deposits on external platforms.' },
      { n: '03', t: 'Booked', d: 'Direct deal, no commissions. Alex or Fran are with you from that moment.' },
    ],
    faq_title: 'Frequently asked questions',
    faqs: [
      { q: 'How do I book directly?', a: <>Write to us via <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp</a> or at <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a> with your dates and the apartment you are interested in. We confirm availability and price in minutes, without paying commissions to third parties.</> },
      { q: 'Do you accept pets?', a: <>At <a href="mar.html">Hestía Mar</a>, yes — very welcome, pets are part of the family. At <a href="thalassa.html">Thalassa</a> and <a href="salinas.html">Salinas</a>, please ask first — it depends on each case.</> },
      { q: 'Which apartment is right for me?', a: <><a href="mar.html">Hestía Mar</a> is ideal for families with children or pets (ground floor, garden, direct pool access). <a href="thalassa.html">Thalassa</a> is the penthouse with SPA and 360° views, perfect for a special getaway. <a href="salinas.html">Salinas</a> stands out with three pools and views over the Nature Park. Compare all three in <a href="index.html#comparar">our comparison table</a>.</> },
      { q: 'What is the cancellation policy?', a: 'Flexible up to 30 days before arrival. Ask for exact conditions when booking.' },
      { q: 'Do you offer transfers or activities?', a: "We don't organise transfers, but we're happy to recommend the best local services we've known for ten years." },
      { q: 'When can you reply?', a: <>Almost always within an hour, 9am to 10pm every day of the week. Alex replies in Spanish, Fran in English — <a href="https://wa.me/34654138251" target="_blank" rel="noopener">write to us now</a>.</> },
      { q: 'Who are Alex and Fran?', a: <><a href="nosotros.html">We are the owners of Hestía</a>, not an agency. We have managed the three apartments directly since 2016. Over 900 families have chosen us.</> },
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
            info@hestiayourhome.com
          </a>
          <div className="contacto-addr">{t.addr}</div>
        </div>
      </div>
    </section>
  );
};

const ContactoReservas = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  return (
    <section className="contacto-reservas">
      <div className="container">
        <div className="eyebrow">{t.reservas_eyebrow}</div>
        <h2 className="reveal">{t.reservas_title}</h2>
        <div className="reservas-steps">
          {t.reservas_steps.map((s, i) => (
            <div key={i} className="reserva-step reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="step-num">{s.n}</div>
              <div className="step-body">
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactoFAQ = ({ lang }) => {
  const t = CONTACTO_COPY[lang];
  const [open, setOpen] = React.useState(null);
  return (
    <section className="contacto-faq section-cream">
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
        <ContactoPersons lang={lang} />
        <ContactoReservas lang={lang} />
        <ContactoFAQ lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ContactoPageApp/>);
