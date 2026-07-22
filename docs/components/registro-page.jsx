// ================================================================
// HESTÍA · Registro de viajeros (RD 933/2021 · SES.HOSPEDAJES)
// Formulario que rellena el huésped con los datos que exige el
// Ministerio del Interior. Se abre con ?r=<token> (uno por reserva).
// Los datos se envían cifrados al Worker; NUNCA se guardan en el
// repositorio público ni en localStorage.
// ================================================================

// URL del Worker (sustituir por la real al desplegar). Ver
// workers/traveler-registry/README.md
const TRAVELER_WORKER_URL = 'https://hestia-traveler-registry.hestia-vera-almeria.workers.dev';

// Países más frecuentes de nuestros huéspedes + "Otro". El valor es el
// código ISO-3166 alfa-3 que pide SES; la etiqueta, bilingüe.
const COUNTRIES = [
  { code: 'ESP', es: 'España', en: 'Spain' },
  { code: 'GBR', es: 'Reino Unido', en: 'United Kingdom' },
  { code: 'FRA', es: 'Francia', en: 'France' },
  { code: 'DEU', es: 'Alemania', en: 'Germany' },
  { code: 'NLD', es: 'Países Bajos', en: 'Netherlands' },
  { code: 'BEL', es: 'Bélgica', en: 'Belgium' },
  { code: 'IRL', es: 'Irlanda', en: 'Ireland' },
  { code: 'ITA', es: 'Italia', en: 'Italy' },
  { code: 'PRT', es: 'Portugal', en: 'Portugal' },
  { code: 'CHE', es: 'Suiza', en: 'Switzerland' },
  { code: 'USA', es: 'Estados Unidos', en: 'United States' },
  { code: 'SWE', es: 'Suecia', en: 'Sweden' },
  { code: 'NOR', es: 'Noruega', en: 'Norway' },
  { code: 'DNK', es: 'Dinamarca', en: 'Denmark' },
  { code: 'POL', es: 'Polonia', en: 'Poland' },
];

const DOC_TYPES = [
  { code: 'NIF', es: 'DNI (español)', en: 'Spanish ID (DNI)' },
  { code: 'NIE', es: 'NIE', en: 'NIE (foreigner ID)' },
  { code: 'PAS', es: 'Pasaporte', en: 'Passport' },
];

// --- Validación ---
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const validDni = (v) => {
  const m = /^(\d{8})([A-Z])$/.exec((v || '').toUpperCase().trim());
  if (!m) return false;
  return DNI_LETTERS[parseInt(m[1], 10) % 23] === m[2];
};
const validNie = (v) => {
  const m = /^([XYZ])(\d{7})([A-Z])$/.exec((v || '').toUpperCase().trim());
  if (!m) return false;
  const n = String('XYZ'.indexOf(m[1])) + m[2];
  return DNI_LETTERS[parseInt(n, 10) % 23] === m[3];
};
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
const ageFrom = (iso) => {
  if (!iso) return null;
  const b = new Date(iso), now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const mm = now.getMonth() - b.getMonth();
  if (mm < 0 || (mm === 0 && now.getDate() < b.getDate())) a--;
  return a;
};

const emptyTraveler = () => ({
  nombre: '', apellido1: '', apellido2: '', sexo: '',
  tipoDoc: 'NIF', numDoc: '', numSoporte: '',
  nacionalidad: 'ESP', fechaNacimiento: '',
  pais: 'ESP', direccion: '', municipio: '', cp: '',
  telefono: '', email: '', parentesco: '',
});

const T = {
  es: {
    eyebrow: 'Registro de viajeros',
    title: 'Tus datos para el registro obligatorio',
    legal: 'La Guardia Civil / Ministerio del Interior exige registrar a todas las personas que pernoctan (Real Decreto 933/2021). Rellénalo una sola vez; solo lo usamos para ese registro y se conserva el tiempo que marca la ley.',
    noToken: 'Este enlace no es válido o ha caducado. Escríbenos por WhatsApp y te enviamos uno nuevo.',
    traveler: 'Viajero',
    titular: 'Titular de la reserva',
    add: 'Añadir viajero',
    remove: 'Quitar',
    copy: 'Copiar dirección y contacto del titular',
    nombre: 'Nombre', apellido1: 'Primer apellido', apellido2: 'Segundo apellido',
    apellido2Hint: '(si aparece en tu documento)',
    sexo: 'Sexo', hombre: 'Hombre', mujer: 'Mujer',
    tipoDoc: 'Tipo de documento', numDoc: 'Número de documento',
    numSoporte: 'Número de soporte', soporteHelp: '¿Dónde está?',
    soporteExpl: 'En el DNI es el número que empieza por letras y aparece bajo la foto (DNI nuevo) o en el reverso, junto a "NÚM. SOPORTE" / "IDESP". En el NIE, el número de soporte de la tarjeta. En el pasaporte, déjalo vacío.',
    nacionalidad: 'Nacionalidad', nacimiento: 'Fecha de nacimiento',
    pais: 'País de residencia', direccion: 'Dirección', municipio: 'Localidad', cp: 'Código postal',
    telefono: 'Teléfono', email: 'Correo electrónico',
    parentesco: 'Parentesco con el titular', parentescoHint: '(menor de edad)',
    consent: 'He leído y acepto que estos datos se usen para el registro obligatorio de viajeros ante el Ministerio del Interior, conforme al RD 933/2021.',
    submit: 'Enviar mis datos',
    sending: 'Enviando…',
    okTitle: '¡Listo, gracias!',
    okBody: 'Hemos recibido tus datos para el registro. No tienes que hacer nada más. Nos vemos en Hestía.',
    errRequired: 'Revisa los campos marcados.',
    errDni: 'El DNI no es válido (8 números y letra).',
    errNie: 'El NIE no es válido (X/Y/Z, 7 números y letra).',
    errEmail: 'El correo no es válido.',
    errSend: 'No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.',
    req: 'obligatorio',
  },
  en: {
    eyebrow: 'Traveller registration',
    title: 'Your details for the mandatory registry',
    legal: 'The Guardia Civil / Ministry of the Interior requires registering everyone who stays overnight (Royal Decree 933/2021). Fill it once; we only use it for that registry and keep it for the legally required period.',
    noToken: 'This link is invalid or expired. Message us on WhatsApp and we will send a new one.',
    traveler: 'Traveller',
    titular: 'Booking holder',
    add: 'Add traveller',
    remove: 'Remove',
    copy: "Copy the holder's address and contact",
    nombre: 'First name', apellido1: 'Surname', apellido2: 'Second surname',
    apellido2Hint: '(if it appears on your document)',
    sexo: 'Sex', hombre: 'Male', mujer: 'Female',
    tipoDoc: 'Document type', numDoc: 'Document number',
    numSoporte: 'Support number', soporteHelp: 'Where is it?',
    soporteExpl: 'On a Spanish DNI it is the code starting with letters, under the photo (new DNI) or on the back next to "NÚM. SOPORTE" / "IDESP". On a NIE, the card support number. On a passport, leave it empty.',
    nacionalidad: 'Nationality', nacimiento: 'Date of birth',
    pais: 'Country of residence', direccion: 'Address', municipio: 'Town/City', cp: 'Postcode',
    telefono: 'Phone', email: 'Email',
    parentesco: 'Relationship to the holder', parentescoHint: '(minor)',
    consent: 'I have read and accept that these details are used for the mandatory traveller registry with the Ministry of the Interior, under RD 933/2021.',
    submit: 'Send my details',
    sending: 'Sending…',
    okTitle: 'All done, thank you!',
    okBody: 'We have received your details for the registry. Nothing else to do. See you at Hestía.',
    errRequired: 'Please check the highlighted fields.',
    errDni: 'Invalid DNI (8 digits and a letter).',
    errNie: 'Invalid NIE (X/Y/Z, 7 digits and a letter).',
    errEmail: 'Invalid email.',
    errSend: 'Could not send. Try again or message us on WhatsApp.',
    req: 'required',
  },
};

const TravelerCard = ({ t, tr, idx, isTitular, onChange, onRemove, onCopy, errors, lang }) => {
  const [showSoporte, setShowSoporte] = React.useState(false);
  const set = (k, v) => onChange(idx, { ...tr, [k]: v });
  const menor = ageFrom(tr.fechaNacimiento) != null && ageFrom(tr.fechaNacimiento) < 18;
  const err = (k) => errors[`${idx}.${k}`];
  const field = (k, label, opts = {}) => (
    <div className={`reg-field${err(k) ? ' has-err' : ''}${opts.wide ? ' reg-field--wide' : ''}`}>
      <label>{label}{opts.req && <span className="reg-req"> *</span>}</label>
      <input
        type={opts.type || 'text'}
        inputMode={opts.inputMode}
        autoComplete={opts.autoComplete || 'off'}
        autoCapitalize={opts.autoCapitalize}
        className={opts.upper ? 'reg-input-upper' : undefined}
        max={opts.max}
        value={tr[k]}
        placeholder={opts.ph || ''}
        onChange={(e) => set(k, opts.upper ? e.target.value.toUpperCase() : e.target.value)}
      />
      {err(k) && <span className="reg-err-msg">{err(k)}</span>}
    </div>
  );
  // Hoy, en formato yyyy-mm-dd, para topar la fecha de nacimiento (no se
  // puede haber nacido en el futuro) y ayudar al selector nativo de fecha.
  const todayIso = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  return (
    <div className="reg-card">
      <div className="reg-card-hdr">
        <h3><HiIcon name="key" size={16} className="reg-card-ic" /> {isTitular ? t.titular : `${t.traveler} ${idx + 1}`}</h3>
        {!isTitular && <button type="button" className="reg-remove" onClick={() => onRemove(idx)}>{t.remove}</button>}
      </div>
      <div className="reg-grid">
        {field('nombre', t.nombre, { req: true, autoComplete: 'given-name', autoCapitalize: 'words' })}
        {field('apellido1', t.apellido1, { req: true, autoComplete: 'family-name', autoCapitalize: 'words' })}
        {field('apellido2', <>{t.apellido2} <span className="reg-hint">{t.apellido2Hint}</span></>, { autoComplete: 'family-name', autoCapitalize: 'words' })}
        <div className={`reg-field${err('sexo') ? ' has-err' : ''}`}>
          <label>{t.sexo}<span className="reg-req"> *</span></label>
          <select value={tr.sexo} onChange={(e) => set('sexo', e.target.value)}>
            <option value="">–</option>
            <option value="H">{t.hombre}</option>
            <option value="M">{t.mujer}</option>
          </select>
          {err('sexo') && <span className="reg-err-msg">{err('sexo')}</span>}
        </div>
        <div className="reg-field">
          <label>{t.tipoDoc}<span className="reg-req"> *</span></label>
          <select value={tr.tipoDoc} onChange={(e) => set('tipoDoc', e.target.value)}>
            {DOC_TYPES.map(d => <option key={d.code} value={d.code}>{lang === 'es' ? d.es : d.en}</option>)}
          </select>
        </div>
        {field('numDoc', t.numDoc, { req: true, upper: true, autoCapitalize: 'characters', autoComplete: 'off' })}
        <div className={`reg-field${err('numSoporte') ? ' has-err' : ''}`}>
          <label>
            {t.numSoporte}{tr.tipoDoc !== 'PAS' && <span className="reg-req"> *</span>}
            <button type="button" className="reg-help-btn" onClick={() => setShowSoporte(s => !s)}>{t.soporteHelp}</button>
          </label>
          <input value={tr.numSoporte} className="reg-input-upper" autoCapitalize="characters"
            onChange={(e) => set('numSoporte', e.target.value.toUpperCase())} placeholder="IDESP / Núm. soporte" />
          {showSoporte && <p className="reg-help-box">{t.soporteExpl}</p>}
          {err('numSoporte') && <span className="reg-err-msg">{err('numSoporte')}</span>}
        </div>
        <div className="reg-field">
          <label>{t.nacionalidad}<span className="reg-req"> *</span></label>
          <select value={tr.nacionalidad} onChange={(e) => set('nacionalidad', e.target.value)}>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === 'es' ? c.es : c.en}</option>)}
            <option value="OTRO">{lang === 'es' ? 'Otro' : 'Other'}</option>
          </select>
        </div>
        {field('fechaNacimiento', t.nacimiento, { req: true, type: 'date', max: todayIso, autoComplete: 'bday', wide: true })}
        {menor && (
          <div className={`reg-field${err('parentesco') ? ' has-err' : ''}`}>
            <label>{t.parentesco} <span className="reg-hint">{t.parentescoHint}</span><span className="reg-req"> *</span></label>
            <input value={tr.parentesco} onChange={(e) => set('parentesco', e.target.value)} placeholder={lang === 'es' ? 'hijo/a, sobrino/a…' : 'son/daughter, nephew…'} />
            {err('parentesco') && <span className="reg-err-msg">{err('parentesco')}</span>}
          </div>
        )}
      </div>

      <div className="reg-sub">{lang === 'es' ? 'Residencia y contacto' : 'Residence & contact'}
        {!isTitular && <button type="button" className="reg-copy-btn" onClick={() => onCopy(idx)}>{t.copy}</button>}
      </div>
      <div className="reg-grid">
        <div className="reg-field">
          <label>{t.pais}<span className="reg-req"> *</span></label>
          <select value={tr.pais} onChange={(e) => set('pais', e.target.value)}>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === 'es' ? c.es : c.en}</option>)}
            <option value="OTRO">{lang === 'es' ? 'Otro' : 'Other'}</option>
          </select>
        </div>
        {field('direccion', t.direccion, { req: true, wide: true, autoComplete: 'street-address' })}
        {field('municipio', t.municipio, { req: true, autoComplete: 'address-level2', autoCapitalize: 'words' })}
        {field('cp', t.cp, { req: true, inputMode: tr.pais === 'ESP' ? 'numeric' : 'text', autoComplete: 'postal-code' })}
        {field('telefono', t.telefono, { req: isTitular, type: 'tel', inputMode: 'tel', autoComplete: 'tel' })}
        {field('email', t.email, { req: isTitular, type: 'email', inputMode: 'email', autoComplete: 'email' })}
      </div>
    </div>
  );
};

const RegistroPage = () => {
  const [lang, setLang] = React.useState(() => { try { return localStorage.getItem('hestia-lang') || 'es'; } catch (_) { return 'es'; } });
  const t = T[lang];
  // Token de la reserva: si el anfitrión mandó un enlace con ?r=, se usa; si el
  // huésped llega desde la guía (?apt=vm), se genera uno único por envío para que
  // dos huéspedes no se pisen. El anfitrión identifica la ficha por nombre/fechas.
  const token = React.useMemo(() => {
    const q = new URLSearchParams(location.search);
    const r = (q.get('r') || '').trim();
    if (r) return r;
    const apt = (q.get('apt') || '').replace(/[^a-z]/gi, '').slice(0, 3).toLowerCase() || 'web';
    return `${apt}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }, []);
  const [travelers, setTravelers] = React.useState([emptyTraveler()]);
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [phase, setPhase] = React.useState('form');   // form | sending | ok | error
  const [topMsg, setTopMsg] = React.useState(null);

  React.useEffect(() => { try { localStorage.setItem('hestia-lang', lang); } catch (_) {} document.documentElement.lang = lang; }, [lang]);

  // Prefill del Viajero 1 con lo que el anfitrión ya sabe de la reserva
  // (nombre, apellidos, teléfono, email), pasado en el enlace. Editable. Luego
  // limpiamos la URL de datos personales (deja solo r/apt) para no dejarlos en
  // el historial ni filtrarlos por referer.
  React.useEffect(() => {
    const q = new URLSearchParams(location.search);
    const g = (k) => (q.get(k) || '').trim();
    // Aplica el prefill al Viajero 1 y, si sabemos el nº de huéspedes de la
    // reserva, ya deja creadas las fichas de los acompañantes (vacías, para
    // que el huésped solo tenga que rellenarlas, no añadirlas una a una).
    const applyPf = (pf) => setTravelers(prev => {
      const first = {
        ...prev[0],
        nombre:    pf.nombre    || prev[0].nombre,
        apellido1: pf.apellido1 || prev[0].apellido1,
        apellido2: pf.apellido2 || prev[0].apellido2,
        telefono:  pf.telefono  || prev[0].telefono,
        email:     pf.email     || prev[0].email,
        numDoc:    pf.numDoc    || prev[0].numDoc,
        direccion: pf.direccion || prev[0].direccion,
      };
      let rest = prev.slice(1);
      const total = Math.min(12, parseInt(pf.huespedes, 10) || 0);
      if (total > 1 && prev.length === 1) {
        rest = Array.from({ length: total - 1 }, emptyTraveler);
      }
      return [first, ...rest];
    });

    // 1) Prefill directo en la URL (enlace "Enlace registro" del anfitrión).
    if (['n', 's1', 's2', 'tel', 'em', 'hu'].some(k => q.get(k))) {
      applyPf({ nombre: g('n'), apellido1: g('s1'), apellido2: g('s2'), telefono: g('tel'), email: g('em'), huespedes: g('hu') });
      const clean = new URLSearchParams();
      if (q.get('r'))   clean.set('r', q.get('r'));
      if (q.get('apt')) clean.set('apt', q.get('apt'));
      const qs = clean.toString();
      try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '')); } catch (_) {}
      return;
    }
    // 2) Prefill por token de acceso (enlace de acceso a la guía): lo pide al
    //    Worker. El token es largo e imposible de adivinar, así que es seguro.
    //    Aquí sí viaja el documento y la dirección (cifrados en el Worker,
    //    nunca en la URL).
    const r = g('r');
    if (r && r.length >= 16 && !TRAVELER_WORKER_URL.includes('SUSTITUIR')) {
      fetch(`${TRAVELER_WORKER_URL}/prefill?token=${encodeURIComponent(r)}`)
        .then(res => res.ok ? res.json() : null)
        .then(j => { if (j && j.prefill) applyPf(j.prefill); })
        .catch(() => {});
    }
  }, []);

  const change = (idx, next) => setTravelers(prev => prev.map((tr, i) => i === idx ? next : tr));
  const add = () => setTravelers(prev => [...prev, emptyTraveler()]);
  const remove = (idx) => setTravelers(prev => prev.filter((_, i) => i !== idx));
  const copyFromTitular = (idx) => setTravelers(prev => prev.map((tr, i) => {
    if (i !== idx) return tr;
    const h = prev[0];
    return { ...tr, pais: h.pais, direccion: h.direccion, municipio: h.municipio, cp: h.cp, telefono: h.telefono, email: h.email };
  }));

  const validate = () => {
    const e = {};
    travelers.forEach((tr, i) => {
      const need = (k) => { if (!String(tr[k] || '').trim()) e[`${i}.${k}`] = t.req; };
      ['nombre', 'apellido1', 'sexo', 'numDoc', 'fechaNacimiento', 'direccion', 'municipio', 'cp'].forEach(need);
      if (i === 0) { need('telefono'); need('email'); }
      if (tr.tipoDoc === 'NIF' && tr.numDoc && !validDni(tr.numDoc)) e[`${i}.numDoc`] = t.errDni;
      if (tr.tipoDoc === 'NIE' && tr.numDoc && !validNie(tr.numDoc)) e[`${i}.numDoc`] = t.errNie;
      if (tr.tipoDoc !== 'PAS') need('numSoporte');
      if (tr.email && !validEmail(tr.email)) e[`${i}.email`] = t.errEmail;
      const age = ageFrom(tr.fechaNacimiento);
      if (age != null && age < 18 && !String(tr.parentesco || '').trim()) e[`${i}.parentesco`] = t.req;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setTopMsg(null);
    if (!consent) { setTopMsg(t.errRequired); return; }
    if (!validate()) { setTopMsg(t.errRequired); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setPhase('sending');
    try {
      const r = await fetch(`${TRAVELER_WORKER_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, lang, submittedAt: new Date().toISOString(), travelers }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setPhase('ok');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {
      setPhase('form');
      setTopMsg(t.errSend);
    }
  };

  return (
    <div className="reg-page on-dark">
      <IconSprite />
      <div className="reg-lang">
        <button type="button" className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
        <span>/</span>
        <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
      <div className="reg-inner">
        <div className="reg-brand">
          <img decoding="async" src="assets/logo-teal-transparent.png" alt="Hestía" className="reg-logo" width="600" height="600" />
          <Wordmark size={16} />
        </div>

        {phase === 'ok' ? (
          <div className="reg-done">
            <HiIcon name="check" size={54} className="reg-done-ic" />
            <h1>{t.okTitle}</h1>
            <p>{t.okBody}</p>
          </div>
        ) : !token ? (
          <div className="reg-done">
            <HiIcon name="alert" size={48} className="reg-done-ic" />
            <p>{t.noToken}</p>
            <a className="btn btn-primary" href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <span className="reg-eyebrow">{t.eyebrow}</span>
            <h1 className="reg-title">{t.title}</h1>
            <p className="reg-legal"><HiIcon name="shield" size={16} className="reg-legal-ic" /> {t.legal}</p>
            {topMsg && <div className="reg-topmsg">{topMsg}</div>}

            {travelers.map((tr, i) => (
              <TravelerCard key={i} t={t} tr={tr} idx={i} isTitular={i === 0}
                onChange={change} onRemove={remove} onCopy={copyFromTitular} errors={errors} lang={lang} />
            ))}

            <button type="button" className="reg-add" onClick={add}>
              <HiIcon name="baby" size={16} /> {t.add}
            </button>

            <label className="reg-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t.consent}</span>
            </label>

            <button type="submit" className="btn btn-primary reg-submit" disabled={phase === 'sending'}>
              {phase === 'sending' ? t.sending : t.submit} {phase !== 'sending' && <span className="arrow">→</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<RegistroPage />);
