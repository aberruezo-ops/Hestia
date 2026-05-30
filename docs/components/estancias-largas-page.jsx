// Estancias largas — página dedicada a reservas de +28 noches
// Sep–Jun, para teletrabajadores, empresas y estancias prolongadas.

const LS_COPY = {
  es: {
    title:        'Tu base en Vera Playa',
    subtitle:     'Un mes, una temporada, lo que necesites.',
    sub2:         'Tres apartamentos totalmente equipados para estancias prolongadas para teletrabajadores, empresas o simplemente porque te apetece vivir un tiempo en un lugar especial con un tiempo privilegiado. Disponibles de septiembre a junio.',
    who_title:    'Para quién es Hestía larga estancia',
    who_1_title:  'Teletrabajador · Nómada digital',
    who_1_body:   'WiFi de fibra, escritorio, silencio y el Mediterráneo a 200 metros. Vera Playa es un destino asequible con 320 días de sol al año.',
    who_2_title:  'Empresa · Equipo de proyecto',
    who_2_body:   'Auditores, consultores, equipos desplazados. Apartamento completo más económico y cómodo que un hotel durante semanas.',
    who_3_title:  'Temporada larga · Nueva vida',
    who_3_body:   'Invierno en el sur, primera temporada fuera de casa o simplemente vivir un tiempo junto al mar antes de decidir.',
    includes_title: 'Qué incluye',
    includes: [
      'WiFi fibra · velocidad simétrica',
      'Cocina completamente equipada',
      'Ropa de cama y toallas incluidas',
      'Terraza privada o con vistas',
      'Aire acondicionado y calefacción',
      'Parking',
      'Sin gastos de agencia · trato directo',
      'Contrato de arrendamiento formal',
      'Depósito del 20% para confirmar',
      'Alex y Fran disponibles siempre',
    ],
    prices_title: 'Tarifas mensuales',
    prices_note:  'Precio por apartamento completo. Las noches de Navidad (23 dic–6 ene) y Semana Santa tienen tarifa plana de 80 €/noche.',
    months_label: 'Meses',
    rate_label:   '€ / mes',
    price_rows: [
      { period: 'Nov · Dic · Ene · Feb · Mar · Abr', months: 'T. baja', rate: '1.450' },
      { period: 'Oct · May',                          months: '',        rate: '1.590' },
      { period: 'Jun · Sep',                          months: '',        rate: '1.790' },
    ],
    min_note:    'Estancia mínima: 29 noches. Sin disponibilidad en julio y agosto.',
    apts_title:  'Los tres Hestías',
    apts_cta:    'Ver apartamento',
    faq_title:   'Preguntas frecuentes',
    faqs: [
      { q: '¿Cuántas noches es el mínimo?', a: 'El mínimo son 29 noches. No hay máximo — si quieres quedarte más tiempo, lo acordamos.' },
      { q: '¿Hay contrato?', a: 'Sí. Firmamos un contrato de arrendamiento de temporada con los datos de todos los huéspedes. Recibirás el contrato antes de pagar la señal.' },
      { q: '¿Cómo se reserva?', a: 'Escríbenos por WhatsApp o email con las fechas y el apartamento que te interesa. Te respondemos en menos de 2 horas para confirmar disponibilidad y enviarte el contrato.' },
      { q: '¿Hay que pagar todo al reservar?', a: 'Solo el 20% como señal para confirmar la reserva. El resto se abona a la llegada en efectivo o Bizum.' },
      { q: '¿Está disponible en verano?', a: 'No. Los apartamentos están en máxima demanda en julio y agosto. La larga estancia está disponible de septiembre a junio.' },
      { q: '¿Se pueden registrar varias personas?', a: 'Sí, hasta la capacidad del apartamento (2–4 personas según el Hestía elegido). Todos los huéspedes que pernocten deben estar en el contrato y se registran en el parte de entrada del SES.' },
    ],
    cta_title:   '¿Listo para instalarte?',
    cta_body:    'Escríbenos con tus fechas y te enviamos disponibilidad y contrato en menos de 2 horas.',
    cta_wa:      'WhatsApp Alex',
    cta_mail:    'info@hestiayourhome.com',
  },
  en: {
    title:        'Your base in Vera Playa',
    subtitle:     'One month, one season, as long as you need.',
    sub2:         'Three fully equipped apartments for extended stays — for remote workers, businesses, or simply because you want to spend time in a special place with exceptional weather. Available September to June.',
    who_title:    'Who is Hestía long stay for?',
    who_1_title:  'Remote worker · Digital nomad',
    who_1_body:   'Fibre WiFi, desk, silence and the Mediterranean 200 metres away. Vera Playa is an affordable destination with 320 sunny days a year.',
    who_2_title:  'Business · Project team',
    who_2_body:   'Auditors, consultants, relocated teams. A full apartment — more economical and comfortable than a hotel for weeks.',
    who_3_title:  'Long season · New chapter',
    who_3_body:   'Wintering in the south, a first time living abroad or simply spending time by the sea before deciding.',
    includes_title: "What's included",
    includes: [
      'Fibre WiFi · symmetric speed',
      'Fully equipped kitchen',
      'Bed linen and towels included',
      'Private terrace or sea views',
      'Air conditioning and heating',
      'Parking',
      'No agency fees · direct deal',
      'Formal rental contract',
      '20% deposit to confirm',
      'Alex and Fran always available',
    ],
    prices_title: 'Monthly rates',
    prices_note:  'Full apartment price. Christmas nights (Dec 23–Jan 6) and Easter are charged at a flat 80 €/night.',
    months_label: 'Months',
    rate_label:   '€ / month',
    price_rows: [
      { period: 'Nov · Dec · Jan · Feb · Mar · Apr', months: 'Low season', rate: '1,450' },
      { period: 'Oct · May',                          months: '',           rate: '1,590' },
      { period: 'Jun · Sep',                          months: '',           rate: '1,790' },
    ],
    min_note:    'Minimum stay: 29 nights. July and August not available.',
    apts_title:  'The three Hestías',
    apts_cta:    'View apartment',
    faq_title:   'Frequently asked questions',
    faqs: [
      { q: 'What is the minimum stay?', a: 'The minimum is 29 nights. There is no maximum — if you want to stay longer, we arrange it.' },
      { q: 'Is there a contract?', a: "Yes. We sign a seasonal rental agreement with all guests' details. You receive the contract before paying the deposit." },
      { q: 'How do I book?', a: 'Message us on WhatsApp or email with your dates and chosen apartment. We respond within 2 hours to confirm availability and send the contract.' },
      { q: 'Do I pay everything upfront?', a: 'Only 20% as a deposit to confirm the booking. The rest is paid on arrival in cash or Bizum.' },
      { q: 'Available in summer?', a: 'No. The apartments are in peak demand in July and August. Long stays are available September to June.' },
      { q: 'Can several people stay?', a: 'Yes, up to the apartment capacity (2–4 people depending on the Hestía). All overnight guests must appear on the contract and be registered on the SES entry form.' },
    ],
    cta_title:   'Ready to settle in?',
    cta_body:    'Message us with your dates and we will send availability and contract within 2 hours.',
    cta_wa:      'WhatsApp Alex',
    cta_mail:    'info@hestiayourhome.com',
  },
};

const LS_APTS = [
  { id: 'vm', name: 'Mar',      slug: 'mar',      accent: '#3AAABB', concept_es: 'El campo de olivos llega al mar', concept_en: 'Where the olive grove meets the sea' },
  { id: 'vt', name: 'Thalassa', slug: 'thalassa', accent: '#8A4A24', concept_es: 'El ático sobre el Mediterráneo', concept_en: 'The penthouse above the Mediterranean' },
  { id: 'vs', name: 'Salinas',  slug: 'salinas',  accent: '#9E7A2C', concept_es: 'El amarillo albero del amanecer', concept_en: 'The golden dawn above the salt flats' },
];

const LsHero = ({ lang }) => {
  const t = LS_COPY[lang];
  return (
    <section className="lsl-hero">
      <div className="lsl-hero-inner">
        <p className="eyebrow lsl-eyebrow">
          {lang === 'es' ? 'Estancias largas · Hestía Your Home' : 'Long stays · Hestía Your Home'}
        </p>
        <h1 className="lsl-h1">{t.title}<br/><em>{t.subtitle}</em></h1>
        <p className="lsl-hero-sub">{t.sub2}</p>
        <div className="lsl-hero-pills">
          <span className="lsl-pill">29+ {lang === 'es' ? 'noches' : 'nights'}</span>
          <span className="lsl-pill">{lang === 'es' ? 'Sep – Jun' : 'Sep – Jun'}</span>
          <span className="lsl-pill">{lang === 'es' ? 'desde 1.450€/mes' : 'from €1,450/month'}</span>
          <span className="lsl-pill">{lang === 'es' ? 'Sin intermediarios' : 'No middlemen'}</span>
        </div>
        <div className="lsl-hero-ctas">
          <a href="https://wa.me/34620316370" className="lsl-btn-primary" target="_blank" rel="noopener">
            {lang === 'es' ? 'Consultar disponibilidad →' : 'Check availability →'}
          </a>
        </div>
      </div>
    </section>
  );
};

const LsWho = ({ lang }) => {
  const t = LS_COPY[lang];
  const cards = [
    { title: t.who_1_title, body: t.who_1_body, icon: '💻' },
    { title: t.who_2_title, body: t.who_2_body, icon: '🏢' },
    { title: t.who_3_title, body: t.who_3_body, icon: '🌊' },
  ];
  return (
    <section className="lsl-section lsl-who">
      <div className="lsl-inner">
        <h2 className="lsl-h2">{t.who_title}</h2>
        <div className="lsl-who-grid">
          {cards.map(c => (
            <div key={c.title} className="lsl-who-card">
              <span className="lsl-who-icon">{c.icon}</span>
              <h3 className="lsl-who-title">{c.title}</h3>
              <p className="lsl-who-body">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LsIncludes = ({ lang }) => {
  const t = LS_COPY[lang];
  return (
    <section className="lsl-section lsl-includes">
      <div className="lsl-inner lsl-includes-inner">
        <h2 className="lsl-h2">{t.includes_title}</h2>
        <ul className="lsl-includes-list">
          {t.includes.map(item => (
            <li key={item} className="lsl-includes-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".4"/>
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const LsPrices = ({ lang }) => {
  const t = LS_COPY[lang];
  return (
    <section className="lsl-section lsl-prices">
      <div className="lsl-inner">
        <h2 className="lsl-h2">{t.prices_title}</h2>
        <p className="lsl-prices-note">{t.prices_note}</p>
        <div className="lsl-prices-table">
          {t.price_rows.map(r => (
            <div key={r.period} className="lsl-pt-row">
              <span className="lsl-pt-period">{r.period}</span>
              {r.months && <span className="lsl-pt-tag">{r.months}</span>}
              <span className="lsl-pt-rate">{r.rate}<span className="lsl-pt-unit">€/mes</span></span>
            </div>
          ))}
          <div className="lsl-pt-row lsl-pt-special">
            <span className="lsl-pt-period">
              {lang === 'es' ? 'Navidad (23 dic–6 ene) · Semana Santa' : 'Christmas (Dec 23–Jan 6) · Easter'}
            </span>
            <span className="lsl-pt-tag">{lang === 'es' ? 'tarifa especial' : 'special rate'}</span>
            <span className="lsl-pt-rate">80<span className="lsl-pt-unit">€/noche</span></span>
          </div>
        </div>
        <p className="lsl-prices-min">{t.min_note}</p>
      </div>
    </section>
  );
};

const LsSearch = ({ lang }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [checkin,  setCheckin ] = React.useState('');
  const [checkout, setCheckout] = React.useState('');
  const [guests,   setGuests  ] = React.useState(1);
  const [avail,    setAvail   ] = React.useState(null);
  const [loading,  setLoading ] = React.useState(false);
  const [error,    setError   ] = React.useState('');
  const es = lang === 'es';

  const calcLsTotal = (start, end) => {
    const lsCfg = (window.PRICES_V2 && window.PRICES_V2.longStayConfig) || { specialNightFlat: 80, easterRanges: [] };
    const flat  = lsCfg.specialNightFlat || 80;
    const easter = lsCfg.easterRanges || [];
    const isXmas = (ds) => { const m = +ds.slice(5,7), d = +ds.slice(8,10); return (m===12&&d>=23)||(m===1&&d<=6); };
    const isEast = (ds) => easter.some(([s,e]) => ds>=s && ds<=e);
    let total = 0, cur = start;
    while (cur < end) {
      const yr = +cur.slice(0,4), mo = +cur.slice(5,7);
      const dim = new Date(yr, mo, 0).getDate();
      const rate = (mo===6||mo===9) ? 1790 : (mo===5||mo===10) ? 1590 : 1450;
      total += (isXmas(cur)||isEast(cur)) ? flat : rate/dim;
      cur = _drAdj(cur, 1);
    }
    return Math.round(total);
  };

  const validate = () => {
    if (!checkin || !checkout) return es ? 'Selecciona las fechas de entrada y salida.' : 'Select check-in and check-out dates.';
    const nights = _drDiff(checkin, checkout);
    if (nights < 1) return es ? 'La salida debe ser posterior a la entrada.' : 'Check-out must be after check-in.';
    if (nights < 29) return es ? `Mínimo 29 noches. Has seleccionado ${nights}.` : `Minimum 29 nights. You selected ${nights}.`;
    const mo = +checkin.slice(5, 7);
    if (mo === 7 || mo === 8) return es ? 'No disponible en julio ni agosto.' : 'Not available in July or August.';
    if (checkin < today) return es ? 'La fecha de entrada no puede ser en el pasado.' : 'Check-in cannot be in the past.';
    return '';
  };

  const handleSearch = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' });
      const data = res.ok ? await res.json() : null;
      const nights = _drDiff(checkin, checkout);
      const total  = calcLsTotal(checkin, checkout);
      setAvail(LS_APTS.map(apt => ({
        apt, nights, total,
        available: _drAvail(checkin, checkout, data ? (data[apt.id]?.blocked || []) : []),
      })));
    } catch (_) {
      setError(es ? 'Error al comprobar disponibilidad. Inténtalo de nuevo.' : 'Error checking availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (ds) => {
    if (!ds) return '';
    const [y,m,d] = ds.split('-');
    return es ? `${d}/${m}/${y.slice(2)}` : `${m}/${d}/${y.slice(2)}`;
  };

  return (
    <section className="lsl-section lsl-search-section" id="buscar">
      <div className="lsl-inner">
        <h2 className="lsl-h2">{es ? 'Comprobar disponibilidad' : 'Check availability'}</h2>
        <div className="lsl-search-form">
          <div className="lsl-search-fields">
            <div className="lsl-search-field">
              <label className="lsl-search-lbl">{es ? 'Entrada' : 'Check-in'}</label>
              <input type="date" className="lsl-search-input" value={checkin} min={today}
                onChange={e => { setCheckin(e.target.value); setAvail(null); setError(''); }}/>
            </div>
            <div className="lsl-search-field">
              <label className="lsl-search-lbl">{es ? 'Salida' : 'Check-out'}</label>
              <input type="date" className="lsl-search-input" value={checkout} min={checkin || today}
                onChange={e => { setCheckout(e.target.value); setAvail(null); setError(''); }}/>
            </div>
            <div className="lsl-search-field lsl-search-field--sm">
              <label className="lsl-search-lbl">{es ? 'Personas' : 'Guests'}</label>
              <select className="lsl-search-input" value={guests}
                onChange={e => { setGuests(Number(e.target.value)); setAvail(null); }}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button type="button" className="lsl-search-btn" disabled={loading} onClick={handleSearch}>
              {loading ? (es ? 'Comprobando…' : 'Checking…') : (es ? 'Ver disponibilidad' : 'Check')}
            </button>
          </div>
          {error && <p className="lsl-search-error">{error}</p>}
          {checkin && checkout && !error && (
            <p className="lsl-search-hint">
              {es ? `${fmtDate(checkin)} → ${fmtDate(checkout)} · ${_drDiff(checkin,checkout)} noches` : `${fmtDate(checkin)} → ${fmtDate(checkout)} · ${_drDiff(checkin,checkout)} nights`}
            </p>
          )}
        </div>

        {avail && (
          <div className="lsl-results">
            {avail.map(({ apt, available, total, nights }) => (
              <div key={apt.id} className={`lsl-result${available ? '' : ' lsl-result--unavail'}`}
                   style={{ '--lsl-accent': apt.accent }}>
                <div className="lsl-result-apt">HESTÍA <strong>{apt.name.toUpperCase()}</strong></div>
                {available ? (
                  <>
                    <div className="lsl-result-price">
                      <span className="lsl-result-total">{total.toLocaleString('es-ES')} €</span>
                      <span className="lsl-result-nights">{nights} {es ? 'noches' : 'nights'}</span>
                    </div>
                    <a href={`reservas.html?apt=${apt.id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`}
                       className="lsl-result-btn">
                      {es ? 'Reservar →' : 'Book →'}
                    </a>
                  </>
                ) : (
                  <span className="lsl-result-unavail-msg">
                    {es ? 'No disponible' : 'Not available'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const LsApts = ({ lang }) => {
  const t = LS_COPY[lang];
  return (
    <section className="lsl-section lsl-apts">
      <div className="lsl-inner">
        <h2 className="lsl-h2">{t.apts_title}</h2>
        <div className="lsl-apts-grid">
          {LS_APTS.map(apt => (
            <a key={apt.id} href={`${apt.slug}.html`} className="lsl-apt-card" style={{ '--lsl-accent': apt.accent }}>
              <div className="lsl-apt-dot"/>
              <div className="lsl-apt-name">HESTÍA <strong>{apt.name.toUpperCase()}</strong></div>
              <div className="lsl-apt-concept">{lang === 'es' ? apt.concept_es : apt.concept_en}</div>
              <span className="lsl-apt-cta">{t.apts_cta} →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const LsFaq = ({ lang }) => {
  const t = LS_COPY[lang];
  const [open, setOpen] = React.useState(null);
  return (
    <section className="lsl-section lsl-faq">
      <div className="lsl-inner lsl-faq-inner">
        <h2 className="lsl-h2">{t.faq_title}</h2>
        <div className="lsl-faq-list">
          {t.faqs.map((item, i) => (
            <div key={i} className={`lsl-faq-item${open === i ? ' open' : ''}`}>
              <button type="button" className="lsl-faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <span className="lsl-faq-chev">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p className="lsl-faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LsCta = ({ lang }) => {
  const t = LS_COPY[lang];
  return (
    <section className="lsl-section lsl-cta">
      <div className="lsl-inner lsl-cta-inner">
        <h2 className="lsl-h2">{t.cta_title}</h2>
        <p className="lsl-cta-body">{t.cta_body}</p>
        <div className="lsl-cta-btns">
          <a href="https://wa.me/34620316370" className="lsl-btn-primary" target="_blank" rel="noopener">
            {t.cta_wa} →
          </a>
          <a href={`mailto:${t.cta_mail}`} className="lsl-btn-ghost">{t.cta_mail}</a>
        </div>
      </div>
    </section>
  );
};

const EstanciasLargasPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main id="main-content">
        <LsHero     lang={lang} />
        <LsWho      lang={lang} />
        <LsIncludes lang={lang} />
        <LsPrices   lang={lang} />
        <LsSearch   lang={lang} />
        <LsApts     lang={lang} />
        <LsFaq      lang={lang} />
        <LsCta      lang={lang} />
      </main>
      <Footer lang={lang} />
      <WidgetStack    lang={lang} />
      <FloatingChat   lang={lang} />
      <Cookies        lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<EstanciasLargasPageApp/>);
