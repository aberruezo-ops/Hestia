// ================================================================
// HESTÍA, Buscador de disponibilidad (Home)
// ================================================================

const HS_APTS = [
  { id: 'vm', num: '01', name: 'Hestía Mar',      short: 'Mar',      slug: 'mar',      accent: '#6B7A3A',
    concept_es: 'El campo de olivos llega al mar.',
    concept_en: 'Where the olive grove meets the sea.' },
  { id: 'vt', num: '02', name: 'Hestía Thalassa', short: 'Thalassa', slug: 'thalassa', accent: '#B86A3C',
    concept_es: 'El ático sobre el Mediterráneo y el Salar de los Canos.',
    concept_en: 'The penthouse above the Mediterranean and the Salar de los Canos.' },
  { id: 'vs', num: '03', name: 'Hestía Salinas',  short: 'Salinas',  slug: 'salinas',  accent: '#D4A84A',
    concept_es: 'El amarillo albero del amanecer sobre las salinas.',
    concept_en: 'Ochre yellow, sunrise over the salt flats.' },
];

// Checks if [checkin, checkout) overlaps with any blocked range
const _hsAvail = (checkin, checkout, blocked) => {
  if (!blocked) return null;
  return !blocked.some(r => checkin < r.end && checkout > r.start);
};

const _hsAdj = (ds, n) => {
  const d = new Date(ds + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const _hsDiff = (a, b) =>
  Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);

const _hsFmtDate = (ds, lang) => {
  if (!ds) return '';
  const d = new Date(ds + 'T12:00:00Z');
  const M = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
             'Septiembre','Octubre','Noviembre','Diciembre'];
  const ME = ['January','February','March','April','May','June','July','August',
              'September','October','November','December'];
  return lang === 'es'
    ? `${d.getUTCDate()} ${M[d.getUTCMonth()].slice(0,3).toLowerCase()}. ${d.getUTCFullYear()}`
    : `${ME[d.getUTCMonth()].slice(0,3)} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

const _hsShiftLabel = (shift, lang) => {
  if (shift === 0) return lang === 'es' ? 'Mismas fechas' : 'Same dates';
  const n = Math.abs(shift);
  const unit = n === 1 ? (lang === 'es' ? 'día' : 'day') : (lang === 'es' ? 'días' : 'days');
  if (lang === 'es') return shift < 0 ? `${n} ${unit} antes` : `${n} ${unit} después`;
  return shift < 0 ? `${n} ${unit} earlier` : `${n} ${unit} later`;
};


// ---- Result card ----
// Flujo nuevo: el huésped ve disponibilidad + precio base aquí, y un único
// CTA "Avanzar con la reserva" lo lleva a /reservas con apt+fechas+huéspedes
// pre-rellenados. Extras (cuna, trona, sábanas, mascota...) y datos de
// contacto se gestionan allí, aquí reducimos la carga al mínimo.
const HsResultCard = ({ apt, available, lang, checkin, checkout, guests }) => {

  const nights  = checkin && checkout ? _hsDiff(checkin, checkout) : 0;
  const aptName = apt.name;
  // Precio base sin extras (sin mascota), el detalle se ve en /reservas.
  const calc    = (checkin && checkout && checkout > checkin)
    ? _calcStay(checkin, checkout, apt.id, false, parseInt(guests, 10) || null) : null;
  // Larga estancia: ≥29 noches, no julio ni agosto
  const isLsStay = nights > 28 && checkin && +checkin.slice(5,7) !== 7 && +checkin.slice(5,7) !== 8;
  const lsCalc   = isLsStay ? _calcLsTotal(checkin, checkout, parseInt(guests,10)||1, false, apt.id) : null;
  const fmt = n => n.toLocaleString('es-ES') + ' €';

  // URL del CTA "Avanzar con la reserva", pasa apt+fechas+huéspedes.
  // Mascota y extras se eligen en /reservas (paso único de extras).
  const reservasHref = (() => {
    const params = new URLSearchParams();
    params.set('apt', apt.id);
    if (checkin)  params.set('checkin',  checkin);
    if (checkout) params.set('checkout', checkout);
    if (guests)   params.set('guests',   String(guests));
    return 'reservas.html?' + params.toString();
  })();

  return (
    <div className={`hs-result-card ${available ? 'avail' : 'taken'}`}
         style={{ '--hs-accent': apt.accent }}>
      <div className="hs-rc-bar"/>
      <div className="hs-rc-body">
        <div className="hs-rc-head">
          <div className="hs-rc-ident">
            <span className="hs-rc-num">{apt.num}</span>
            <div>
              <div className="hs-rc-name">{apt.name}</div>
              <div className="hs-rc-concept">
                «&thinsp;{lang === 'es' ? apt.concept_es : apt.concept_en}&thinsp;»
              </div>
            </div>
          </div>
          <div className={`hs-rc-status ${available ? 'ok' : 'no'}`}>
            {available
              ? (lang === 'es' ? '✓ Disponible' : '✓ Available')
              : (lang === 'es' ? '✗ Reservado' : '✗ Booked')}
          </div>
        </div>

        {available ? (
          <>
            {calc && (
              <div className="hs-price-block">
                <div className="hs-pb-main">
                  <div className="hs-pb-direct">
                    <span className="hs-pb-lbl">
                      {isLsStay && lsCalc
                        ? (lang === 'es' ? 'Precio estancia larga' : 'Long-stay price')
                        : (lang === 'es' ? 'Precio directo · hasta' : 'Direct price · up to')}
                    </span>
                    <span className="hs-pb-total">
                      {isLsStay && lsCalc ? fmt(lsCalc.total) : fmt(calc.directTotal)}
                    </span>
                    <span className="hs-pb-avg">
                      {isLsStay && lsCalc
                        ? (lang === 'es' ? 'tarifa mensual' : 'monthly rate')
                        : `${fmt(calc.avgPerNight)}${lang === 'es' ? '/noche' : '/night'}`}
                    </span>
                  </div>
                  <div className="hs-pb-right">
                    <div className="price-guarantee-badge">
                      {lang === 'es' ? '✓ Mejor precio garantizado' : '✓ Best price guaranteed'}
                    </div>
                    <div className="price-guarantee-sub">
                      {lang === 'es'
                        ? '¿Lo encuentras más barato en Booking o Airbnb? No solo te lo igualamos: te lo mejoramos.'
                        : 'Found it cheaper on Booking or Airbnb? We don\'t just match it, we beat it.'}
                    </div>
                  </div>
                </div>
                <div className="hs-pb-breakdown">
                  <div className="hs-pb-line">
                    <span>{lang === 'es' ? `${calc.nights} noches × precio variable` : `${calc.nights} nights × variable rate`}</span>
                    <span>{fmt(calc.baseTotal)}</span>
                  </div>
                  {calc.stayD && (
                    <div className="hs-pb-line hs-pb-disc">
                      <span>{lang === 'es' ? calc.stayD.es : calc.stayD.en}</span>
                      <span>−{fmt(calc.stayDiscAmt)}</span>
                    </div>
                  )}
                  {calc.petAmt > 0 && (
                    <div className="hs-pb-line">
                      <span>{lang === 'es' ? `Suplemento mascota (${PET_SUPP_FLAT}€ tarifa plana)` : `Pet supplement (${PET_SUPP_FLAT}€ flat fee)`}</span>
                      <span>+{fmt(calc.petAmt)}</span>
                    </div>
                  )}
                  <div className={`hs-pb-line hs-pb-total-line${isLsStay && lsCalc ? ' is-striked' : ''}`}>
                    <span>{lang === 'es' ? 'Total estimado noche a noche' : 'Estimated nightly total'}</span>
                    <span>{fmt(calc.directTotal)}</span>
                  </div>
                  {isLsStay && lsCalc && (
                    <>
                      <div className="price-line-ls-hl">
                        <span>{lang === 'es' ? 'Precio estancia larga' : 'Long-stay price'}</span>
                        <span className="prl-ls-val">{fmt(lsCalc.total)}</span>
                      </div>
                      {calc.directTotal > lsCalc.total && (
                        <div className="price-line-saving">
                          <span>{lang === 'es' ? 'Ahorras' : 'You save'}</span>
                          <span className="prl-saving-val">−{fmt(calc.directTotal - lsCalc.total)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="hs-pb-note">
                  {isLsStay && lsCalc
                    ? (lang === 'es'
                        ? '* Señal del 20% para confirmar. Resto a la llegada.'
                        : '* 20% deposit to confirm. Balance paid on arrival.')
                    : (lang === 'es'
                        ? '* Precio máximo orientativo. Cuéntanos de ti, muchas veces podemos ajustar.'
                        : '* Maximum indicative price. Tell us about yourselves, we can often adjust.')}
                </p>
              </div>
            )}
            <div className="hs-rc-actions hs-rc-actions-forward">
              <a href={reservasHref} className="btn btn-primary hs-forward-btn">
                {lang === 'es' ? 'Avanzar con la reserva' : 'Continue with the booking'}
                <span className="arrow"> →</span>
              </a>
              <a href={`${apt.slug}.html`} className="hs-rc-link">
                {lang === 'es' ? 'Ver Hestía' : 'See Hestía'} →
              </a>
            </div>
            <p className="hs-rc-note">
              {lang === 'es'
                ? 'En la siguiente pantalla podrás añadir extras (cuna, trona, sábanas, mascota…) y dejarnos tus datos. Normalmente te contestamos en minutos.'
                : 'On the next screen you can add extras (cot, high chair, linen, pet…) and leave your details. We usually reply in minutes.'}
            </p>
          </>
        ) : (
          <p className="hs-rc-unavail-note">
            {lang === 'es'
              ? 'Prueba con otras fechas o escríbenos, a veces hay cancelaciones de última hora.'
              : 'Try different dates or write to us, last-minute cancellations do happen.'}
            {' '}
            <a href="https://wa.me/34620316370" target="_blank" rel="noopener">
              WhatsApp →
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

// ---- Main search widget ----
const HomeSearch = ({ lang, b2b = false }) => {
  const [avail,   setAvail  ] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setAvail(j))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Form state. Por defecto: entrada = mañana, salida = una semana después,
  // listo para pulsar "Comprobar" de un toque.
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = _hsAdj(today, 1);
  const [apt,         setApt        ] = React.useState('');   // '' = any
  const [checkin,     setCheckin    ] = React.useState(tomorrow);
  const [checkout,    setCheckout   ] = React.useState(_hsAdj(tomorrow, 7));
  const [guests,      setGuests     ] = React.useState(2);
  // Extras (cuna, trona, sábanas, toallas, mascota) se rellenan SOLO en
  // /reservas para no duplicar trabajo. Aquí solo huéspedes + fechas.

  // Results
  const [results,     setResults    ] = React.useState(null);
  const [formErr,     setFormErr    ] = React.useState('');
  const [notifyName,  setNotifyName ] = React.useState('');
  const [notifyEmail, setNotifyEmail] = React.useState('');
  const [notifyState, setNotifyState] = React.useState('idle');

  // Entrada cambia → salida salta automáticamente a +1 semana (default).
  const onCheckinChange = (v) => {
    setCheckin(v);
    if (v) setCheckout(_hsAdj(v, 7));
    setResults(null);
    window.dispatchEvent(new CustomEvent('hs-results-change', { detail: false }));
  };
  const onCheckoutChange = (v) => {
    setCheckout(v);
    setResults(null);
    window.dispatchEvent(new CustomEvent('hs-results-change', { detail: false }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFormErr('');
    if (!checkin || !checkout) {
      setFormErr(lang === 'es' ? 'Elige fecha de entrada y salida.' : 'Please select check-in and check-out dates.');
      return;
    }
    if (checkout <= checkin) {
      setFormErr(lang === 'es' ? 'La salida debe ser posterior a la entrada.' : 'Check-out must be after check-in.');
      return;
    }
    // Reglas idénticas al DateRangePicker compartido (shared.jsx) y al
    // AptCalendar (calendar.jsx): 1 noche prohibida; 2 noches solo si
    // check-in inminente o gap-fill; crítica = 7; resto = base 3.
    const nights = _hsDiff(checkin, checkout);
    const rules = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
    const baseMinN      = rules.minNights || 3;
    const twoNightFloor = rules.twoNightFloor || 2;
    const criticalMinN  = rules.criticalSeasonMinNights || baseMinN;
    const imminentD     = rules.imminentDays || 7;
    const _isCrit = (ds) => {
      const v2 = window.PRICES_V2;
      if (!v2 || typeof _v2BumpedSeasonForDate !== 'function') return false;
      return _v2BumpedSeasonForDate(ds, v2) === 'critica';
    };
    // Gap-fill solo es posible si hay apt seleccionado (sin apt no hay blocked).
    const blkList = (apt && avail && avail[apt]) ? (avail[apt].blocked || []) : [];
    const _isGap = (cin, cout) => {
      if (!cin || !cout || !blkList.length) return false;
      const dayBefore = _hsAdj(cin, -1);
      const beforeBlk = blkList.some(r => dayBefore >= r.start && dayBefore < r.end);
      const checkoutStartsBlk = blkList.some(r => r.start === cout);
      return beforeBlk && checkoutStartsBlk;
    };
    const isImminent = _hsDiff(today, checkin) <= imminentD;
    const isGapFill  = _isGap(checkin, checkout);
    const effMin = (isImminent || isGapFill) ? twoNightFloor
                 : _isCrit(checkin) ? criticalMinN
                 : baseMinN;
    if (nights === 1) {
      setFormErr(lang === 'es'
        ? 'No se permiten reservas de 1 noche. La estancia mínima es 2 noches.'
        : 'One-night bookings are not allowed. Minimum stay is 2 nights.');
      return;
    }
    if (nights < effMin) {
      const isCrit = _isCrit(checkin);
      setFormErr(lang === 'es'
        ? (isCrit
            ? `Temporada crítica: estancia mínima ${effMin} noches. Excepción: 2 noches solo si el check-in es esta semana (≤${imminentD} días) o el rango rellena un hueco exacto entre reservas.`
            : `Estancia mínima ${effMin} noches. Las reservas de 2 noches solo se permiten para la semana actual (≤${imminentD} días) o gap-fill exacto entre reservas.`)
        : (isCrit
            ? `Critical season: minimum stay ${effMin} nights. Exception: 2 nights only if check-in is this week (≤${imminentD} days) or the range exactly fills a gap.`
            : `Minimum stay ${effMin} nights. Two-night stays only allowed for the current week (≤${imminentD} days) or exact gap-fill.`));
      return;
    }

    const aptsToCheck = apt ? [apt] : ['vm', 'vt', 'vs'];
    const res = aptsToCheck.map(id => {
      const a = HS_APTS.find(x => x.id === id);
      const blocked = avail && avail[id] ? avail[id].blocked : null;
      return { ...a, available: _hsAvail(checkin, checkout, blocked) };
    });
    // Detect long-stay searches (>28 nights, not Jul/Aug)
    const cinMonth = checkin ? parseInt(checkin.slice(5, 7), 10) : 0;
    res._isLongStay = nights > 28 && cinMonth !== 7 && cinMonth !== 8;
    setResults(res);
    window.dispatchEvent(new CustomEvent('hs-results-change', { detail: true }));
    if (typeof _hestiaTrack === 'function') _hestiaTrack('search_initiated', { apt: apt || 'all', checkin, checkout, nights });

    // Scroll to results
    setTimeout(() => {
      const el = document.getElementById('hs-results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setResults(null);
    setFormErr('');
    setNotifyState('idle');
    window.dispatchEvent(new CustomEvent('hs-results-change', { detail: false }));
  };

  const handleNotify = async (e) => {
    e.preventDefault();
    const rawEmail = notifyEmail.trim();
    if (!rawEmail.includes('@') || !rawEmail.includes('.')) return;
    setNotifyState('sending');
    try {
      const fd = new FormData();
      fd.append('access_key', '95a86784-6d6a-496f-9830-15759c0a3cff');
      fd.append('subject', `Hestía · Avísame · ${checkin || '?'} – ${checkout || '?'}`);
      fd.append('from_name', notifyName.trim() || rawEmail);
      fd.append('email', rawEmail);
      fd.append('message', [
        `Nombre: ${notifyName.trim() || '(no indicado)'}`,
        `Email: ${rawEmail}`,
        `Fechas: ${checkin || '?'} – ${checkout || '?'}`,
        `Apartamento: ${apt || 'cualquiera'}`,
      ].join('\n'));
      await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      setNotifyState('sent');
    } catch (_) {
      setNotifyState('idle');
    }
  };

  return (
    <section className="home-search" id="buscar" data-avail-checker data-screen-label="03b Buscador">
      <div className="hs-inner">

        {/* Header */}
        <div className="hs-hd">
          <div className="eyebrow hs-eyebrow">
            {b2b
              ? (lang === 'es' ? 'Disponibilidad · Vera Playa' : 'Availability · Vera Playa')
              : (lang === 'es' ? 'Busca tu estancia · Vera Playa' : 'Find your stay · Vera Playa')}
          </div>
          <h2 className="hs-title">
            {b2b
              ? (lang === 'es' ? <em>Comprueba tus fechas</em> : <em>Check your dates</em>)
              : (lang === 'es' ? <em>¿Cuándo venís?</em> : <em>When are you coming?</em>)}
          </h2>
          <p className="hs-sub">
            {b2b
              ? (lang === 'es'
                  ? 'Mira qué apartamentos tenemos libres y su precio. Para empresas tenemos condiciones especiales: lo mejor es que lo tratemos personalmente.'
                  : 'See which apartments are free and at what price. For companies we have special terms, so it is best to handle it personally.')
              : (lang === 'es'
                  ? 'Coge uno de nuestros huecos o elige tu Hestía y las fechas que prefieras.'
                  : 'Grab one of our available slots or choose your Hestía and the dates you prefer.')}
          </p>
        </div>

        {/* Form */}
        <form className="hs-form" onSubmit={handleSearch} noValidate>

          {/* Apartment selector */}
          <div className="hs-field hs-field--full">
            <label className="hs-lbl">
              {lang === 'es' ? 'Hestía' : 'Hestía'}
            </label>
            <div className="hs-apt-sel">
              {[
                { id: '', label: lang === 'es' ? 'Cualquiera' : 'Any', accent: '#3aaabb' },
                ...HS_APTS.map(a => ({ id: a.id, label: a.short, accent: a.accent })),
              ].map(o => (
                <button
                  key={o.id}
                  type="button"
                  className={`hs-apt-btn${apt === o.id ? ' active' : ''}`}
                  style={{ '--btn-accent': o.accent }}
                  onClick={() => setApt(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dos campos de fecha (selector nativo del dispositivo) con atajos:
              entrada por defecto = mañana; al cambiar la entrada, la salida
              salta a +1 semana. */}
          <div className="hs-row hs-dates-row">
            <div className="hs-field hs-field--date">
              <label className="hs-lbl" htmlFor="hs-checkin">
                {lang === 'es' ? 'Entrada' : 'Check-in'}
              </label>
              <input
                id="hs-checkin"
                type="date"
                className="hs-date-input"
                value={checkin}
                min={tomorrow}
                onChange={e => onCheckinChange(e.target.value)}
              />
            </div>
            <span className="hs-dates-arrow" aria-hidden="true">→</span>
            <div className="hs-field hs-field--date">
              <label className="hs-lbl" htmlFor="hs-checkout">
                {lang === 'es' ? 'Salida' : 'Check-out'}
              </label>
              <input
                id="hs-checkout"
                type="date"
                className="hs-date-input"
                value={checkout}
                min={_hsAdj(checkin || tomorrow, 1)}
                onChange={e => onCheckoutChange(e.target.value)}
              />
            </div>
          </div>

          {/* Guests, sin extras: cuna/trona/sábanas/toallas/mascota se
              gestionan en /reservas (paso único). Aquí solo lo esencial
              para comprobar disponibilidad y ver precio base. */}
          <div className="hs-row hs-row--wrap">
            <div className="hs-field hs-field--inline">
              <label className="hs-lbl">
                {lang === 'es' ? 'Huéspedes' : 'Guests'}
              </label>
              <div className="hs-counter">
                <button type="button" className="hs-cnt-btn"
                  aria-label={lang === 'es' ? 'Reducir huéspedes' : 'Fewer guests'}
                  onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
                <span className="hs-cnt-num">{guests}</span>
                <button type="button" className="hs-cnt-btn"
                  aria-label={lang === 'es' ? 'Añadir huésped' : 'Add guest'}
                  onClick={() => setGuests(g => Math.min(6, g + 1))}>+</button>
              </div>
            </div>
          </div>

          {/* Error */}
          {formErr && (
            <div className="hs-form-err" role="alert">{formErr}</div>
          )}

          {/* Submit */}
          <div className="hs-submit-row">
            <button type="submit" className="btn btn-primary hs-submit">
              {lang === 'es' ? 'Comprobar disponibilidad' : 'Check availability'}
              <span className="arrow"> →</span>
            </button>
            {loading && (
              <span className="hs-loading-note">
                {lang === 'es' ? 'Cargando disponibilidad…' : 'Loading availability…'}
              </span>
            )}
          </div>
          <div className="hs-trust">
            <span>{lang === 'es' ? '🔒 Sin comisiones' : '🔒 No fees'}</span>
            <span className="hs-trust-dot"/>
            <span>{lang === 'es' ? '✓ Te contestamos en minutos' : '✓ We reply in minutes'}</span>
            <span className="hs-trust-dot"/>
            <span>{lang === 'es' ? 'Solo 3 Hestías' : 'Only 3 Hestías'}</span>
          </div>

        </form>

        {/* Results */}
        {results && (
          <div className="hs-results" id="hs-results">
            <div className="hs-results-hd">
              {(() => {
                const nAvail = results.filter(r => r.available === true).length;
                const nTotal = results.length;
                if (nAvail === 0)
                  return lang === 'es'
                    ? `Ningún Hestía disponible para esas fechas exactas.`
                    : `No Hestías available for those exact dates.`;
                if (nAvail === nTotal)
                  return lang === 'es'
                    ? `${nAvail === 1 ? 'Hestía disponible' : `${nAvail} Hestías disponibles`} para esas fechas.`
                    : `${nAvail === 1 ? 'Hestía available' : `${nAvail} Hestías available`} for those dates.`;
                return lang === 'es'
                  ? `${nAvail} de ${nTotal} Hestías disponibles para esas fechas.`
                  : `${nAvail} of ${nTotal} Hestías available for those dates.`;
              })()}
            </div>

            {results.map(r => (
              <HsResultCard
                key={r.id}
                apt={r}
                available={r.available}
                lang={lang}
                checkin={checkin} checkout={checkout}
                guests={guests}
              />
            ))}

            {/* Condiciones especiales para empresas (variante B2B) */}
            {b2b && results.some(r => r.available === true) && (
              <div className="hs-longstay-nudge hs-b2b-nudge">
                <div className="hs-ls-icon">💼</div>
                <div className="hs-ls-body">
                  <strong>{lang === 'es' ? 'Condiciones especiales para empresas' : 'Special terms for companies'}</strong>
                  <span>{lang === 'es'
                    ? ' Sobre este precio ajustamos las condiciones según vuestras fechas y necesidades. Lo mejor es que lo tratemos personalmente.'
                    : ' We tailor the terms on top of this price to your dates and needs. It is best to handle it personally.'}</span>
                </div>
                <a href="#propuesta" className="hs-ls-cta">
                  {lang === 'es' ? 'Pedir propuesta →' : 'Request a proposal →'}
                </a>
              </div>
            )}

            {/* Long-stay nudge */}
            {results._isLongStay && !b2b && (
              <div className="hs-longstay-nudge">
                <div className="hs-ls-icon">🏠</div>
                <div className="hs-ls-body">
                  <strong>{lang === 'es' ? '¿Más de un mes en Vera Playa?' : 'More than a month in Vera Playa?'}</strong>
                  <span>{lang === 'es'
                    ? ' Para estancias largas tenemos condiciones especiales: precio mensual fijo, contrato de arrendamiento y trato directo.'
                    : ' For long stays we offer special terms: fixed monthly rate, rental contract and direct deal.'}</span>
                </div>
                <a href="estancias-largas.html" className="hs-ls-cta">
                  {lang === 'es' ? 'Ver condiciones →' : 'See conditions →'}
                </a>
              </div>
            )}

            {/* Fechas parecidas/cercanas con disponibilidad: se muestran SIEMPRE
                tras el resultado (cambia el titular según haya o no hueco en lo
                pedido). Cada alternativa lleva su precio directo. */}
            {results.some(r => r.available !== null) && (() => {
              const alts = _hestiaFindAlternatives({ checkin, checkout, apt, avail, guests, max: 4 });
              if (!alts.length) return null;
              const anyAvail = results.some(r => r.available === true);
              const fmt = n => n.toLocaleString('es-ES') + ' €';
              const altHref = (alt) => {
                const p = new URLSearchParams();
                p.set('apt', alt.aptId);
                p.set('checkin', alt.checkin);
                p.set('checkout', alt.checkout);
                if (guests) p.set('guests', String(guests));
                return 'reservas.html?' + p.toString();
              };
              return (
                <div className="hs-alts">
                  <div className="hs-alts-hd">
                    {anyAvail
                      ? (lang === 'es' ? '¿Flexibilidad en las fechas? Otras opciones cercanas' : 'Flexible on dates? Other nearby options')
                      : (lang === 'es' ? 'Cerca de lo que buscabas, con disponibilidad' : 'Close to what you wanted, with availability')}
                  </div>
                  <p className="hs-alts-sub">
                    {lang === 'es'
                      ? 'También están libres. El precio es el directo, sin comisiones.'
                      : 'These are also free. The price is direct, with no fees.'}
                  </p>
                  <div className="hs-alts-grid">
                    {alts.map((alt, i) => (
                      <a key={i} className="hs-alt-card" style={{ '--hs-accent': alt.accent }} href={altHref(alt)}>
                        <span className="hs-alt-apt">{alt.aptName}</span>
                        <span className="hs-alt-dates">{_hsFmtDate(alt.checkin, lang)} – {_hsFmtDate(alt.checkout, lang)}</span>
                        <span className="hs-alt-shift">{alt.sameDates ? (lang === 'es' ? 'Mismas fechas, otro Hestía' : 'Same dates, another Hestía') : `${alt.nights} ${lang === 'es' ? 'noches' : 'nights'} · ${_hsShiftLabel(alt.shiftDays, lang)}`}</span>
                        <span className="hs-alt-price">
                          <strong>{fmt(alt.total)}</strong>
                          <small>{fmt(alt.avgPerNight)}{lang === 'es' ? '/noche' : '/night'}</small>
                        </span>
                        <span className="hs-alt-cta">{lang === 'es' ? 'Reservar →' : 'Book →'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* No availability data fallback */}
            {results.every(r => r.available === null) && (
              <div className="hs-no-data">
                {lang === 'es'
                  ? 'No tenemos datos de disponibilidad en este momento. Escríbenos directamente y te respondemos normalmente en minutos.'
                  : 'We don\'t have availability data right now. Write to us directly and we\'ll usually reply in minutes.'}
                {' '}
                <a href="https://wa.me/34620316370" target="_blank" rel="noopener">
                  WhatsApp →
                </a>
              </div>
            )}

            <button className="hs-reset" onClick={handleReset}>
              ← {lang === 'es' ? 'Nueva búsqueda' : 'New search'}
            </button>
          </div>
        )}

        {/* Notify me */}
        <div className="hs-notify">
          {results && results.length > 0 && results.every(r => r.available === false) ? (
            <>
              <p className="hs-notify-text">
                {lang === 'es'
                  ? 'Déjanos tu email y te avisamos si esas fechas se liberan: cancelaciones, ventanas nuevas…'
                  : 'Leave your email and we\'ll let you know if those dates open up: cancellations, new slots…'}
              </p>
              {notifyState === 'sent' ? (
                <p className="hs-notify-ok">
                  {lang === 'es' ? 'Anotado. Te escribimos si se libera algo.' : 'Got it. We\'ll write if something opens up.'}
                </p>
              ) : (
                <form className="hs-notify-form" onSubmit={handleNotify}>
                  <input
                    type="text"
                    className="hs-notify-field"
                    placeholder={lang === 'es' ? 'Nombre' : 'Name'}
                    value={notifyName}
                    onChange={e => setNotifyName(e.target.value)}
                    maxLength={60}
                  />
                  <input
                    type="email"
                    className="hs-notify-field"
                    placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    required
                    maxLength={120}
                  />
                  <button type="submit" className="hs-notify-submit" disabled={notifyState === 'sending'}>
                    {notifyState === 'sending' ? '…' : (lang === 'es' ? 'Avísame →' : 'Notify me →')}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="hs-notify-text">
                {lang === 'es'
                  ? '¿Tus fechas están ocupadas? Avísanos y te escribimos si se libera algo: cancelaciones, aperturas de calendario…'
                  : 'Are your dates taken? Let us know and we\'ll reach out if something opens up: cancellations, new slots…'}
              </p>
              <a
                href={lang === 'es'
                  ? 'https://wa.me/34620316370?text=Hola%2C%20me%20interesan%20vuestros%20Hest%C3%ADas%20pero%20mis%20fechas%20est%C3%A1n%20ocupadas.%20%C2%BFPod%C3%A9is%20avisarme%20si%20se%20libera%20algo%3F'
                  : 'https://wa.me/34620316370?text=Hi%2C%20I%27m%20interested%20in%20your%20Hest%C3%ADas%20but%20my%20dates%20are%20taken.%20Could%20you%20let%20me%20know%20if%20something%20becomes%20available%3F'}
                className="btn btn-ghost hs-notify-btn"
                target="_blank" rel="noopener"
              >
                {lang === 'es' ? 'Avisadme por WhatsApp →' : 'Notify me via WhatsApp →'}
              </a>
            </>
          )}
        </div>

      </div>
    </section>
  );
};

Object.assign(window, { HomeSearch });
