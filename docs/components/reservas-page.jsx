// ================================================================
// HESTÍA — Página de Reservas
// ================================================================

const RESERVAS_COPY = {
  es: {
    eyebrow: 'Mejor precio garantizado · Sin intermediarios',
    title: (<>Reserva tu<br/><em>hogar en Vera.</em></>),
    sub: 'Escríbenos directamente. Alex o Fran confirman en menos de 24 horas.',
    form_title: 'Solicitar reserva',
    form_sub: 'Rellena el formulario y te escribimos por WhatsApp con disponibilidad y precio.',
    f_apt: 'Apartamento',
    f_apt_ph: 'Elige un apartamento',
    f_name: 'Nombre completo',
    f_name_ph: 'Tu nombre',
    f_email: 'Email',
    f_email_ph: 'tu@email.com',
    f_tel: 'Teléfono',
    f_tel_ph: '+34 6XX XXX XXX',
    f_checkin: 'Fecha de entrada',
    f_checkout: 'Fecha de salida',
    f_guests: 'Número de huéspedes',
    f_guests_opts: ['1 huésped', '2 huéspedes', '3 huéspedes', '4 huéspedes', '5 huéspedes', '6 huéspedes'],
    f_pets: '¿Viaja con mascota?',
    f_pets_no: 'No',
    f_pets_yes: 'Sí',
    f_extras_label: 'Extras (opcional)',
    f_extras: ['Ropa de cama extra', 'Toallas extra', 'Cuna de bebé', 'Silla de bebé'],
    f_comments: 'Comentarios',
    f_comments_ph: 'Fechas alternativas, preguntas, necesidades especiales…',
    submit: 'Enviar por WhatsApp →',
    note: 'Al pulsar se abrirá WhatsApp con tu solicitud. Alex o Fran te responden en menos de 24 horas.',
    aside_title: 'Tu solicitud llega a:',
    guarantee_title: 'Reserva directa',
    guarantee_items: [
      'Precio igual o mejor que cualquier plataforma',
      'Sin comisiones de intermediarios',
      'Alex o Fran responden personalmente',
      'Confirmación en menos de 24 horas',
      'Flexibilidad real en cambios y cancelaciones',
    ],
  },
  en: {
    eyebrow: 'Best price guaranteed · No middlemen',
    title: (<>Book your<br/><em>home in Vera.</em></>),
    sub: 'Write to us directly. Alex or Fran confirm within 24 hours.',
    form_title: 'Request a booking',
    form_sub: 'Fill in the form and we will message you on WhatsApp with availability and price.',
    f_apt: 'Apartment',
    f_apt_ph: 'Choose an apartment',
    f_name: 'Full name',
    f_name_ph: 'Your name',
    f_email: 'Email',
    f_email_ph: 'you@email.com',
    f_tel: 'Phone',
    f_tel_ph: '+34 6XX XXX XXX',
    f_checkin: 'Check-in date',
    f_checkout: 'Check-out date',
    f_guests: 'Number of guests',
    f_guests_opts: ['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests'],
    f_pets: 'Travelling with a pet?',
    f_pets_no: 'No',
    f_pets_yes: 'Yes',
    f_extras_label: 'Extras (optional)',
    f_extras: ['Extra bed linen', 'Extra towels', 'Baby cot', 'Baby chair'],
    f_comments: 'Comments',
    f_comments_ph: 'Alternative dates, questions, special needs…',
    submit: 'Send via WhatsApp →',
    note: 'Clicking will open WhatsApp with your request. Alex or Fran will reply within 24 hours.',
    aside_title: 'Your request goes to:',
    guarantee_title: 'Direct booking',
    guarantee_items: [
      'Same price or better than any platform',
      'No platform commissions',
      'Alex or Fran reply personally',
      'Confirmation within 24 hours',
      'Real flexibility on changes and cancellations',
    ],
  },
};

const ReservasHero = ({ lang }) => {
  const t = RESERVAS_COPY[lang];
  return (
    <section className="page-hero reservas-hero">
      <div className="stars"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const ReservasForm = ({ lang }) => {
  const t = RESERVAS_COPY[lang];
  const [apt, setApt] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [tel, setTel] = React.useState('');
  const [checkin, setCheckin] = React.useState('');
  const [checkout, setCheckout] = React.useState('');
  const [guests, setGuests] = React.useState('');
  const [pets, setPets] = React.useState('no');
  const [extras, setExtras] = React.useState([]);
  const [comments, setComments] = React.useState('');

  const toggleExtra = (i) => {
    setExtras(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const aptNames = { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas' };

  const handleSubmit = (e) => {
    e.preventDefault();
    const extrasText = extras.length > 0
      ? '\nExtras: ' + extras.map(i => t.f_extras[i]).join(', ')
      : '';
    const petsText = pets === 'yes' ? (lang === 'es' ? 'Sí' : 'Yes') : (lang === 'es' ? 'No' : 'No');
    const msg = lang === 'es'
      ? `Hola! Quiero hacer una consulta de reserva.\n\nApartamento: ${aptNames[apt] || apt}\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${tel}\nEntrada: ${checkin}\nSalida: ${checkout}\nHuéspedes: ${guests}\nMascota: ${petsText}${extrasText}\nComentarios: ${comments || '—'}`
      : `Hello! I'd like to enquire about a booking.\n\nApartment: ${aptNames[apt] || apt}\nName: ${name}\nEmail: ${email}\nPhone: ${tel}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}\nPet: ${petsText}${extrasText}\nComments: ${comments || '—'}`;
    window.open('https://wa.me/34620316370?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div className="reservas-form-wrap">
      <div className="reservas-form-title">{t.form_title}</div>
      <div className="reservas-form-sub">{t.form_sub}</div>
      <form className="reservas-form" onSubmit={handleSubmit}>
        <div className="form-field full">
          <label>{t.f_apt}</label>
          <select value={apt} onChange={e => setApt(e.target.value)} required>
            <option value="">{t.f_apt_ph}</option>
            <option value="vm">Hestía Mar</option>
            <option value="vt">Hestía Thalassa</option>
            <option value="vs">Hestía Salinas</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>{t.f_name}</label>
            <input type="text" placeholder={t.f_name_ph} value={name} onChange={e => setName(e.target.value)} required/>
          </div>
          <div className="form-field">
            <label>{t.f_tel}</label>
            <input type="tel" placeholder={t.f_tel_ph} value={tel} onChange={e => setTel(e.target.value)}/>
          </div>
        </div>
        <div className="form-field full">
          <label>{t.f_email}</label>
          <input type="email" placeholder={t.f_email_ph} value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>{t.f_checkin}</label>
            <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} required/>
          </div>
          <div className="form-field">
            <label>{t.f_checkout}</label>
            <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} required/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>{t.f_guests}</label>
            <select value={guests} onChange={e => setGuests(e.target.value)} required>
              <option value="">—</option>
              {t.f_guests_opts.map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>{t.f_pets}</label>
            <select value={pets} onChange={e => setPets(e.target.value)}>
              <option value="no">{t.f_pets_no}</option>
              <option value="yes">{t.f_pets_yes}</option>
            </select>
          </div>
        </div>
        <div className="form-field full">
          <div className="form-extras-label">{t.f_extras_label}</div>
          <div className="form-extras-grid">
            {t.f_extras.map((ex, i) => (
              <label key={i} className="form-extra-item">
                <input type="checkbox" checked={extras.includes(i)} onChange={() => toggleExtra(i)}/>
                {ex}
              </label>
            ))}
          </div>
        </div>
        <div className="form-field full">
          <label>{t.f_comments}</label>
          <textarea placeholder={t.f_comments_ph} value={comments} onChange={e => setComments(e.target.value)}/>
        </div>
        <button type="submit" className="reservas-submit">{t.submit}</button>
        <p className="reservas-note">{t.note}</p>
      </form>
    </div>
  );
};

const ReservasAside = ({ lang }) => {
  const t = RESERVAS_COPY[lang];
  return (
    <aside className="reservas-aside">
      <div className="reservas-aside-title">{t.aside_title}</div>
      <div className="reservas-person-card" style={{ '--card-accent': 'var(--sol)' }}>
        <div className="r-avatar">A</div>
        <div>
          <div className="r-name">Alex Berruezo</div>
          <div className="r-lang">🇪🇸 Español</div>
          <div className="r-role">{lang === 'es' ? 'Creativo · Pre-estancia · Reservas' : 'Creative · Pre-stay · Bookings'}</div>
        </div>
        <div className="r-actions">
          <a href="https://wa.me/34620316370" className="btn btn-primary" target="_blank" rel="noopener">
            WhatsApp <span className="arrow">→</span>
          </a>
          <a href="tel:+34620316370" className="btn btn-ghost">+34 620 316 370</a>
        </div>
      </div>
      <div className="reservas-person-card" style={{ '--card-accent': 'var(--vt)' }}>
        <div className="r-avatar" style={{ background: 'var(--vt)' }}>F</div>
        <div>
          <div className="r-name">Fran Moral</div>
          <div className="r-lang" style={{ color: 'var(--vt)' }}>🇬🇧 English</div>
          <div className="r-role">{lang === 'es' ? 'Técnico · In-estancia · Bookings EN' : 'Technical · In-stay · English bookings'}</div>
        </div>
        <div className="r-actions">
          <a href="https://wa.me/34654138251" className="btn btn-primary" target="_blank" rel="noopener">
            WhatsApp <span className="arrow">→</span>
          </a>
          <a href="tel:+34654138251" className="btn btn-ghost">+34 654 138 251</a>
        </div>
      </div>
      <div className="reservas-guarantee">
        <div className="rg-title">{t.guarantee_title}</div>
        <ul>
          {t.guarantee_items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

const ReservasPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Reservas · Hestía Your Home · Vera Playa'
      : 'Book · Hestía Your Home · Vera Playa';
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <ReservasHero lang={lang} />
        <FraseHogar lang={lang} />
        <div className="reservas-body">
          <div className="reservas-inner">
            <ReservasForm lang={lang} />
            <ReservasAside lang={lang} />
          </div>
        </div>
        <SabiasQue lang={lang} />
        <QuickFAQ lang={lang} pageId="reservas" />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ReservasPageApp/>);
