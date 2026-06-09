// Estancias largas — página dedicada a reservas de +28 noches
// Sep–Jun, para teletrabajadores, empresas y estancias prolongadas.

const LS_COPY = {
  es: {
    title:        'Tu base en Vera Playa',
    subtitle:     'Un mes, una temporada, lo que necesites.',
    sub2:         'Tres apartamentos totalmente equipados para estancias prolongadas para teletrabajadores, empresas o simplemente porque te apetece vivir una temporada en un lugar especial con un tiempo, naturaleza y cultura privilegiados.\n\nDisponibles de septiembre a junio.',
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
      { period: 'Nov · Dic · Ene · Feb · Mar · Abr', months: 'T. baja' },
      { period: 'Oct · May',                          months: '' },
      { period: 'Jun · Sep',                          months: '' },
    ],
    min_note:    'Estancia mínima: 29 noches. Sin disponibilidad en julio y agosto.',
    apts_title:  'Los tres Hestías',
    apts_cta:    'Ver apartamento',
    faq_title:   'Preguntas frecuentes',
    faqs: [
      { q: '¿Cuántas noches es el mínimo?', a: 'El mínimo considerado son 29 noches. No hay máximo — si quieres quedarte más tiempo, lo acordamos.' },
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
      { period: 'Nov · Dec · Jan · Feb · Mar · Apr', months: 'Low season' },
      { period: 'Oct · May',                          months: '' },
      { period: 'Jun · Sep',                          months: '' },
    ],
    min_note:    'Minimum stay: 29 nights. July and August not available.',
    apts_title:  'The three Hestías',
    apts_cta:    'View apartment',
    faq_title:   'Frequently asked questions',
    faqs: [
      { q: 'What is the minimum stay?', a: 'The minimum considered is 29 nights. There is no maximum — if you want to stay longer, we arrange it.' },
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
  { id: 'vm', name: 'Mar',      slug: 'mar',      accent: '#6B7A3A', concept_es: 'El campo de olivos llega al mar', concept_en: 'Where the olive grove meets the sea' },
  { id: 'vt', name: 'Thalassa', slug: 'thalassa', accent: '#B86A3C', concept_es: 'El ático sobre el Mediterráneo', concept_en: 'The penthouse above the Mediterranean' },
  { id: 'vs', name: 'Salinas',  slug: 'salinas',  accent: '#D4A84A', concept_es: 'El amarillo albero del amanecer', concept_en: 'The golden dawn above the salt flats' },
];

// Tarifas de estancia larga: SIEMPRE desde prices.json (window.PRICES_V2),
// para que coincidan con el panel admin. Sin números hardcodeados en la web.
const _lsCfgPub = () => (window.PRICES_V2 && window.PRICES_V2.longStayConfig) || {};
const _lsRates  = () => _lsCfgPub().monthlyRates || { baja: 1450, media: 1590, alta: 1790 };
const _lsFlat   = () => _lsCfgPub().specialNightFlat || 80;
const _fmtRate  = (n, lang) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'es' ? '.' : ',');

const LsHero = ({ lang }) => {
  const t = LS_COPY[lang];
  return (
    <section className="lsl-hero">
      <video
        className="lsl-hero-video"
        src="assets/Videoshome/hero-rompeolas.mp4"
        autoPlay muted loop playsInline
        aria-hidden="true"
      />
      <div className="lsl-hero-wash"/>
      <div className="lsl-hero-inner">
        <p className="eyebrow lsl-eyebrow">
          {lang === 'es' ? 'Estancias largas · Hestía Your Home' : 'Long stays · Hestía Your Home'}
        </p>
        <h1 className="lsl-h1">{t.title}<br/><em>{t.subtitle}</em></h1>
        {t.sub2.split('\n\n').map((para, i) => (
          <p key={i} className="lsl-hero-sub">{para}</p>
        ))}
        <div className="lsl-hero-pills">
          <span className="lsl-pill">29+ {lang === 'es' ? 'noches' : 'nights'}</span>
          <span className="lsl-pill">{lang === 'es' ? 'Sep – Jun' : 'Sep – Jun'}</span>
          <span className="lsl-pill">{lang === 'es' ? `desde ${_fmtRate(_lsRates().baja, 'es')}€/mes` : `from €${_fmtRate(_lsRates().baja, 'en')}/month`}</span>
          <span className="lsl-pill">{lang === 'es' ? 'Sin intermediarios' : 'No middlemen'}</span>
        </div>
        <div className="lsl-hero-ctas">
          <button className="lsl-btn-primary"
            onClick={() => document.getElementById('buscar')?.scrollIntoView({ behavior: 'smooth' })}>
            {lang === 'es' ? 'Comprobar disponibilidad ↓' : 'Check availability ↓'}
          </button>
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
  const rates = _lsRates();
  const rateByIdx = [rates.baja, rates.media, rates.alta];
  const note = t.prices_note.replace(/\b80\b/, String(_lsFlat()));
  return (
    <section className="lsl-section lsl-prices">
      <div className="lsl-inner">
        <h2 className="lsl-h2">{t.prices_title}</h2>
        <p className="lsl-prices-note">{note}</p>
        <div className="lsl-prices-table">
          {t.price_rows.map((r, i) => (
            <div key={r.period} className="lsl-pt-row">
              <span className="lsl-pt-period">{r.period}</span>
              {r.months && <span className="lsl-pt-tag">{r.months}</span>}
              <span className="lsl-pt-rate"><span className="lsl-pt-desde">{lang === 'es' ? 'desde ' : 'from '}</span>{_fmtRate(rateByIdx[i], lang)}<span className="lsl-pt-unit">€/mes</span></span>
            </div>
          ))}
          <div className="lsl-pt-row lsl-pt-special">
            <span className="lsl-pt-period">
              {lang === 'es' ? 'Navidad (23 dic–6 ene) · Semana Santa' : 'Christmas (Dec 23–Jan 6) · Easter'}
            </span>
            <span className="lsl-pt-tag">{lang === 'es' ? 'tarifa especial' : 'special rate'}</span>
            <span className="lsl-pt-rate">{_lsFlat()}<span className="lsl-pt-unit">€/noche</span></span>
          </div>
        </div>
        <p className="lsl-prices-min">{t.min_note}</p>
      </div>
    </section>
  );
};

const LsSearch = ({ lang }) => {
  const [checkin,   setCheckin  ] = React.useState('');
  const [checkout,  setCheckout ] = React.useState('');
  const [guests,    setGuests   ] = React.useState(1);
  const [avail,     setAvail    ] = React.useState(null);
  const [availData, setAvailData] = React.useState(null);
  const es = lang === 'es';
  const nights = checkin && checkout ? _drDiff(checkin, checkout) : 0;

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setAvailData(d))
      .catch(() => {});
  }, []);

  const blockedUnion = React.useMemo(() => {
    if (!availData) return [];
    const all = [];
    LS_APTS.forEach(a => { (availData[a.id]?.blocked || []).forEach(b => all.push(b)); });
    return all;
  }, [availData]);

  const calcLsTotal = (start, end, guests, withPets, aptId) => {
    const lsCfg = (window.PRICES_V2?.longStayConfig) || { specialNightFlat: 80, easterRanges: [] };
    const flat              = lsCfg.specialNightFlat   || 80;
    const easter            = lsCfg.easterRanges        || [];
    const extraGuestPerMo   = lsCfg.extraGuestPerMonth  || 0;
    const petPerMo          = lsCfg.petPerMonth         || 0;
    const aptSupp           = ((lsCfg.aptSupplement || {})[aptId] || 0);
    const extraGuests       = Math.max(0, (guests || 1) - 2);
    const rates             = lsCfg.monthlyRates || { baja: 1450, media: 1590, alta: 1790 };
    const isXmas = (ds) => { const m = +ds.slice(5,7), d = +ds.slice(8,10); return (m===12&&d>=23)||(m===1&&d<=6); };
    const isEast = (ds) => easter.some(([s,e]) => ds>=s && ds<=e);
    let total = 0, cur = start;
    while (cur < end) {
      const yr = +cur.slice(0,4), mo = +cur.slice(5,7);
      const dim = new Date(yr, mo, 0).getDate();
      const rate = (mo===6||mo===9) ? rates.alta : (mo===5||mo===10) ? rates.media : rates.baja;
      total += (isXmas(cur)||isEast(cur)) ? flat : (rate + aptSupp) / dim;
      if (extraGuests > 0) total += extraGuests * extraGuestPerMo / dim;
      if (withPets)        total += petPerMo / dim;
      cur = _drAdj(cur, 1);
    }
    return Math.round(total);
  };

  React.useEffect(() => {
    if (checkin && checkout && nights >= 29) {
      const mo = +checkin.slice(5, 7);
      if (mo === 7 || mo === 8) { setAvail(null); return; }
      setAvail(LS_APTS.map(apt => {
        const isAvail = _drAvail(checkin, checkout, availData ? (availData[apt.id]?.blocked || []) : []);
        const regCalc = isAvail ? _calcStay(checkin, checkout, apt.id, false, guests) : null;
        const regTotal = regCalc ? regCalc.baseTotal + (regCalc.guestSuppAmt || 0) + (regCalc.petAmt || 0) : 0;
        const lsTotal = calcLsTotal(checkin, checkout, guests, false, apt.id);
        return { apt, nights, lsTotal, regTotal, available: isAvail };
      }));
    } else {
      setAvail(null);
    }
  }, [checkin, checkout, guests]);

  const julAugWarning = checkin && ([7,8].includes(+checkin.slice(5,7)));

  return (
    <section className="lsl-search-dark" id="buscar">
      <div className="lsl-inner">
        <h2 className="lsl-h2 lsl-h2--ondk">{es ? 'Comprobar disponibilidad' : 'Check availability'}</h2>

        <div className="lsl-sd-card">
          <div className="lsl-picker-wrap">
            <DateRangePicker
              checkin={checkin}
              checkout={checkout}
              setCheckin={(d) => { setCheckin(d); setAvail(null); }}
              setCheckout={(d) => { setCheckout(d); setAvail(null); }}
              blocked={blockedUnion}
              lang={lang}
              accent="var(--ber, #3D1A35)"
              minNightsOverride={29}
            />
          </div>

          <div className="lsl-search-footer">
            <div className="lsl-search-field lsl-search-field--sm">
              <label className="lsl-search-lbl">{es ? 'Personas' : 'Guests'}</label>
              <select className="lsl-search-input" value={guests}
                onChange={e => setGuests(Number(e.target.value))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {julAugWarning && (
              <p className="lsl-search-error">{es ? 'No disponible en julio ni agosto.' : 'Not available in July or August.'}</p>
            )}
            {checkin && checkout && nights > 0 && nights < 29 && (
              <p className="lsl-search-error">
                {es ? `Mínimo 29 noches. Has seleccionado ${nights}.` : `Minimum 29 nights. You selected ${nights}.`}
              </p>
            )}
          </div>
        </div>

        {avail && (
          <div className="lsl-results">
            {avail.map(({ apt, available, lsTotal, regTotal, nights: n }) => (
              <div key={apt.id} className={`lsl-result${available ? '' : ' lsl-result--unavail'}`}
                   style={{ '--lsl-accent': apt.accent }}>
                <div className="lsl-result-apt">HESTÍA <strong>{apt.name.toUpperCase()}</strong></div>
                {available ? (
                  <>
                    <div className="lsl-result-prices">
                      {regTotal > lsTotal && (
                        <span className="lsl-result-reg">{regTotal.toLocaleString('es-ES')} €</span>
                      )}
                      <span className="lsl-result-ls">{lsTotal.toLocaleString('es-ES')} €</span>
                      <span className="lsl-result-nights">{n} {es ? 'noches' : 'nights'}</span>
                    </div>
                    {regTotal > lsTotal && (
                      <div className="lsl-result-saving">
                        {es ? `Ahorras ${(regTotal - lsTotal).toLocaleString('es-ES')} €` : `Save ${(regTotal - lsTotal).toLocaleString('es-ES')} €`}
                      </div>
                    )}
                    <a href={`reservas.html?apt=${apt.id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`}
                       className="lsl-result-btn">
                      {es ? 'Avanzar con la reserva →' : 'Book now →'}
                    </a>
                  </>
                ) : (
                  <span className="lsl-result-unavail-msg">{es ? 'No disponible' : 'Not available'}</span>
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
