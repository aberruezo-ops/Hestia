// ================================================================
// HESTÍA — /escribir-opinion · formulario público de opinión.
// Envía a Web3Forms (api.web3forms.com/submit) que reenvía email
// a Alex/Fran. Sin backend propio. Reviews quedan en email hasta
// que Alex/Fran las aprueban en /p-edit y las añaden a reviews.json.
// ================================================================

const W3F_KEY = '95a86784-6d6a-496f-9830-15759c0a3cff';

const ESCRIBIR_COPY = {
  es: {
    eyebrow: 'Comparte tu experiencia',
    title: (<>Cuéntanos cómo <em>te fue.</em></>),
    sub: 'Tu opinión es importante. Tras revisarla, la publicaremos en nuestra web. Sin filtros raros — si algo no salió bien, también queremos saberlo.',
    apt_label: '¿En qué Hestía te alojaste?',
    apt_vm: 'Hestía Mar',
    apt_vt: 'Hestía Thalassa',
    apt_vs: 'Hestía Salinas',
    rating_label: 'Tu valoración',
    name_label: 'Tu nombre o cómo quieres firmar',
    name_ph: 'María G., Familie Müller, James & Sophie…',
    email_label: 'Tu email',
    email_help: 'Solo lo usamos para responderte. Nunca aparece publicado.',
    date_label: 'Mes y año de tu estancia',
    date_ph: 'Agosto 2024',
    text_label: 'Tu opinión',
    text_ph: '¿Qué te gustó? ¿Algo que mejorar? Lo más útil para futuros huéspedes.',
    submit: 'Enviar opinión',
    sending: 'Enviando…',
    success_title: '¡Gracias!',
    success_text: 'Hemos recibido tu opinión. La revisaremos y, una vez aprobada, aparecerá en nuestra web. Te avisaremos cuando esté publicada.',
    success_extra: 'Si te animas, también puedes dejarla en Booking.com, Airbnb o Google Maps — son las plataformas en las que la verán otros viajeros.',
    success_back: '← Volver a Opiniones',
    error_generic: 'No hemos podido enviar tu opinión. Inténtalo de nuevo en un minuto, o escríbenos por WhatsApp.',
    val_name: 'Cuéntanos tu nombre',
    val_email: 'Email no válido',
    val_text: 'Escribe al menos 30 caracteres',
    val_apt: 'Selecciona el Hestía donde te alojaste',
  },
  en: {
    eyebrow: 'Share your experience',
    title: (<>Tell us how <em>it went.</em></>),
    sub: 'Your opinion matters. After we review it, we will publish it on our website. No weird filters — if something went wrong, we also want to know.',
    apt_label: 'Which Hestía did you stay at?',
    apt_vm: 'Hestía Mar',
    apt_vt: 'Hestía Thalassa',
    apt_vs: 'Hestía Salinas',
    rating_label: 'Your rating',
    name_label: 'Your name or how to sign',
    name_ph: 'María G., Familie Müller, James & Sophie…',
    email_label: 'Your email',
    email_help: 'Only used to reply. Never published.',
    date_label: 'Month and year of your stay',
    date_ph: 'August 2024',
    text_label: 'Your review',
    text_ph: 'What did you enjoy? Anything to improve? The most useful for future guests.',
    submit: 'Send review',
    sending: 'Sending…',
    success_title: 'Thank you!',
    success_text: 'We have received your review. We will check it and once approved it will appear on our website. We\'ll let you know when it\'s published.',
    success_extra: 'If you feel like it, you can also post it on Booking.com, Airbnb or Google Maps — those are where other travellers will see it.',
    success_back: '← Back to Reviews',
    error_generic: 'We could not send your review. Try again in a minute, or message us on WhatsApp.',
    val_name: 'Please tell us your name',
    val_email: 'Invalid email',
    val_text: 'Write at least 30 characters',
    val_apt: 'Pick the Hestía where you stayed',
  },
};

const StarsInput = ({ value, onChange, lang }) => {
  const [hover, setHover] = React.useState(0);
  return (
    <div className="eo-stars" role="radiogroup" aria-label={lang === 'es' ? 'Valoración' : 'Rating'}>
      {[1,2,3,4,5].map(n => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${lang === 'es' ? 'estrellas' : 'stars'}`}
          className={`eo-star${(hover ? hover >= n : value >= n) ? ' is-on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>
          ★
        </button>
      ))}
      <span className="eo-stars-num">{value > 0 ? `${value}/5` : ''}</span>
    </div>
  );
};

const EscribirOpinionForm = ({ lang }) => {
  const t = ESCRIBIR_COPY[lang];
  const [apt,    setApt]    = React.useState('');
  const [rating, setRating] = React.useState(0);
  const [name,   setName]   = React.useState('');
  const [email,  setEmail]  = React.useState('');
  const [date,   setDate]   = React.useState('');
  const [text,   setText]   = React.useState('');
  const [phase,  setPhase]  = React.useState('idle');  // idle | sending | success | error
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const e = {};
    if (!apt) e.apt = t.val_apt;
    if (!name.trim()) e.name = t.val_name;
    if (!/\S+@\S+\.\S+/.test(email)) e.email = t.val_email;
    if (text.trim().length < 30) e.text = t.val_text;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setPhase('sending');

    const aptName = { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas' }[apt] || apt;

    const fd = new FormData();
    fd.append('access_key', W3F_KEY);
    fd.append('subject', `Nueva opinión · ${aptName} · ${rating}★ · ${name}`);
    fd.append('from_name', name);
    fd.append('replyto', email);
    fd.append('Hestía', aptName);
    fd.append('Valoración', `${rating}/5`);
    fd.append('Nombre', name);
    fd.append('Email', email);
    fd.append('Fechas', date || '—');
    fd.append('Idioma', lang === 'es' ? 'Español' : 'English');
    fd.append('Opinión', text);
    // Honeypot anti-spam (Web3Forms lo respeta).
    fd.append('botcheck', '');

    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd,
      });
      const j = await r.json().catch(() => ({}));
      if (j.success) {
        setPhase('success');
      } else {
        console.error('w3f error', j);
        setPhase('error');
      }
    } catch (err) {
      console.error('w3f network', err);
      setPhase('error');
    }
  };

  if (phase === 'success') {
    return (
      <section className="eo-success">
        <div className="container">
          <div className="eo-success-card">
            <span className="eo-success-icon" aria-hidden="true">✓</span>
            <h2 className="eo-success-title">{t.success_title}</h2>
            <p className="eo-success-text">{t.success_text}</p>
            <p className="eo-success-extra">{t.success_extra}</p>
            <a href="opiniones.html" className="btn btn-primary">{t.success_back}</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="eo-form-sec">
      <div className="container">
        <form className="eo-form" onSubmit={submit} noValidate>
          {/* Hestía */}
          <div className="eo-field">
            <label className="eo-label">{t.apt_label}</label>
            <div className="eo-apt-grid">
              {['vm','vt','vs'].map(id => (
                <button
                  type="button"
                  key={id}
                  className={`eo-apt-pick${apt === id ? ' is-on' : ''}`}
                  onClick={() => { setApt(id); setErrors(e => ({ ...e, apt: undefined })); }}>
                  <span className="eo-apt-dot" data-apt={id}/>
                  {t[`apt_${id}`]}
                </button>
              ))}
            </div>
            {errors.apt && <span className="eo-err">{errors.apt}</span>}
          </div>

          {/* Stars */}
          <div className="eo-field">
            <label className="eo-label">{t.rating_label}</label>
            <StarsInput value={rating} onChange={setRating} lang={lang}/>
          </div>

          {/* Name + email */}
          <div className="eo-row">
            <div className="eo-field">
              <label className="eo-label" htmlFor="eo-name">{t.name_label}</label>
              <input
                id="eo-name" type="text" className="eo-input"
                value={name} onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: undefined })); }}
                placeholder={t.name_ph} autoComplete="name"/>
              {errors.name && <span className="eo-err">{errors.name}</span>}
            </div>
            <div className="eo-field">
              <label className="eo-label" htmlFor="eo-email">{t.email_label}</label>
              <input
                id="eo-email" type="email" className="eo-input"
                value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: undefined })); }}
                autoComplete="email"/>
              <span className="eo-help">{t.email_help}</span>
              {errors.email && <span className="eo-err">{errors.email}</span>}
            </div>
          </div>

          {/* Stay date */}
          <div className="eo-field">
            <label className="eo-label" htmlFor="eo-date">{t.date_label}</label>
            <input
              id="eo-date" type="text" className="eo-input"
              value={date} onChange={e => setDate(e.target.value)}
              placeholder={t.date_ph}/>
          </div>

          {/* Comment */}
          <div className="eo-field">
            <label className="eo-label" htmlFor="eo-text">{t.text_label}</label>
            <textarea
              id="eo-text" className="eo-textarea" rows={6}
              value={text} onChange={e => { setText(e.target.value); setErrors(er => ({ ...er, text: undefined })); }}
              placeholder={t.text_ph}/>
            <span className="eo-help">{text.length} / 30</span>
            {errors.text && <span className="eo-err">{errors.text}</span>}
          </div>

          {/* Submit */}
          <div className="eo-actions">
            <button type="submit" className="btn btn-primary eo-submit" disabled={phase === 'sending'}>
              {phase === 'sending' ? t.sending : t.submit}
              <span className="arrow"> →</span>
            </button>
          </div>

          {phase === 'error' && <p className="eo-error-msg">{t.error_generic}</p>}
        </form>
      </div>
    </section>
  );
};

const EscribirOpinionPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Comparte tu experiencia · Hestía Your Home · Vera Playa'
      : 'Share your experience · Hestía Your Home · Vera Playa';
  }, [lang]);

  const t = ESCRIBIR_COPY[lang];

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <section className="page-hero eo-hero">
          <div className="page-hero-content">
            <div className="eyebrow">{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p className="page-hero-sub">{t.sub}</p>
          </div>
        </section>
        <EscribirOpinionForm lang={lang}/>
      </main>
      <Footer lang={lang} />
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<EscribirOpinionPageApp/>);
