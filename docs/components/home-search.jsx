// ================================================================
// HESTÍA — Buscador de disponibilidad (Home)
// ================================================================

const HS_APTS = [
  { id: 'vm', num: '01', name: 'Hestía Mar',      short: 'Mar',      slug: 'mar',      accent: '#6B7A3A',
    concept_es: 'El campo de olivos llega al mar.',
    concept_en: 'Where the olive grove meets the sea.' },
  { id: 'vt', num: '02', name: 'Hestía Thalassa', short: 'Thalassa', slug: 'thalassa', accent: '#8A4A24',
    concept_es: 'El ático sobre el Mediterráneo y el Salar de los Canos.',
    concept_en: 'The penthouse above the Mediterranean and the Salar de los Canos.' },
  { id: 'vs', num: '03', name: 'Hestía Salinas',  short: 'Salinas',  slug: 'salinas',  accent: '#9E7A2C',
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

// ---- Result card ----
const HsResultCard = ({ apt, available, lang, checkin, checkout, guests,
  baby, pet, extraTowels, extraLinen, cot, highchair }) => {

  const nights  = checkin && checkout ? _hsDiff(checkin, checkout) : 0;
  const aptName = apt.name;

  const buildMsg = () => {
    const lines = [];
    if (lang === 'es') {
      lines.push(`Hola! Quiero solicitar precio para ${aptName}.\n`);
      lines.push(`📅 Entrada: ${_hsFmtDate(checkin, 'es')}`);
      lines.push(`📅 Salida: ${_hsFmtDate(checkout, 'es')}`);
      lines.push(`🌙 Noches: ${nights}`);
      lines.push(`👥 Huéspedes: ${guests}`);
      if (baby)        lines.push(`👶 Bebé: sí`);
      if (pet)         lines.push(`🐾 Mascota: sí`);
      if (extraTowels) lines.push(`🛁 Toallas extra: sí`);
      if (extraLinen)  lines.push(`🛏 Sábanas extra: sí`);
      if (cot)         lines.push(`🛏 Cuna de bebé: sí`);
      if (highchair)   lines.push(`🪑 Trona: sí`);
      lines.push(`\nSolicito precio y disponibilidad confirmada antes de formalizar la reserva.\n¡Gracias!`);
    } else {
      lines.push(`Hello! I'd like to request a price for ${aptName}.\n`);
      lines.push(`📅 Check-in: ${_hsFmtDate(checkin, 'en')}`);
      lines.push(`📅 Check-out: ${_hsFmtDate(checkout, 'en')}`);
      lines.push(`🌙 Nights: ${nights}`);
      lines.push(`👥 Guests: ${guests}`);
      if (baby)        lines.push(`👶 Baby: yes`);
      if (pet)         lines.push(`🐾 Pet: yes`);
      if (extraTowels) lines.push(`🛁 Extra towels: yes`);
      if (extraLinen)  lines.push(`🛏 Extra linen: yes`);
      if (cot)         lines.push(`🛏 Baby cot: yes`);
      if (highchair)   lines.push(`🪑 High chair: yes`);
      lines.push(`\nI'm requesting a price and confirmed availability before making any booking.\nThank you!`);
    }
    return lines.join('\n');
  };

  const waHref   = () => 'https://wa.me/34620316370?text=' + encodeURIComponent(buildMsg());
  const mailHref = () => {
    const subj = lang === 'es'
      ? `Solicitud de precio — ${aptName}`
      : `Price request — ${aptName}`;
    return `mailto:info@hestiayourhome.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(buildMsg())}`;
  };

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
            <div className="hs-rc-actions">
              <a href={waHref()} className="btn btn-primary hs-wa-btn"
                 target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {lang === 'es' ? 'Solicitar precio — WhatsApp' : 'Request price — WhatsApp'}
                <span className="arrow"> →</span>
              </a>
              <a href={mailHref()} className="btn btn-ghost hs-mail-btn">
                {lang === 'es' ? 'Solicitar precio — Email' : 'Request price — Email'}
              </a>
              <a href={`${apt.slug}.html`} className="hs-rc-link">
                {lang === 'es' ? 'Ver apartamento' : 'See apartment'} →
              </a>
            </div>
            <p className="hs-rc-note">
              {lang === 'es'
                ? 'Solicitud de precio, no reserva. Alex confirma disponibilidad y precio en menos de 24 h.'
                : 'Price request, not a booking. Alex confirms availability and price within 24 h.'}
            </p>
          </>
        ) : (
          <p className="hs-rc-unavail-note">
            {lang === 'es'
              ? 'Prueba con otras fechas o escríbenos — a veces hay cancelaciones de última hora.'
              : 'Try different dates or write to us — last-minute cancellations do happen.'}
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
const HomeSearch = ({ lang }) => {
  const [avail,   setAvail  ] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setAvail(j))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Form state
  const [apt,         setApt        ] = React.useState('');   // '' = any
  const [checkin,     setCheckin    ] = React.useState('');
  const [checkout,    setCheckout   ] = React.useState('');
  const [guests,      setGuests     ] = React.useState(2);
  const [baby,        setBaby       ] = React.useState(false);
  const [pet,         setPet        ] = React.useState(false);
  const [extraTowels, setExtraTowels] = React.useState(false);
  const [extraLinen,  setExtraLinen ] = React.useState(false);
  const [cot,         setCot        ] = React.useState(false);
  const [highchair,   setHighchair  ] = React.useState(false);

  // Results
  const [results,  setResults ] = React.useState(null);
  const [formErr,  setFormErr ] = React.useState('');

  const today = new Date().toISOString().slice(0, 10);

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
    const nights = _hsDiff(checkin, checkout);
    if (nights < 1) {
      setFormErr(lang === 'es' ? 'La estancia mínima es de 1 noche.' : 'Minimum stay is 1 night.');
      return;
    }

    const aptsToCheck = apt ? [apt] : ['vm', 'vt', 'vs'];
    const res = aptsToCheck.map(id => {
      const a = HS_APTS.find(x => x.id === id);
      const blocked = avail && avail[id] ? avail[id].blocked : null;
      return { ...a, available: _hsAvail(checkin, checkout, blocked) };
    });
    setResults(res);

    // Scroll to results
    setTimeout(() => {
      const el = document.getElementById('hs-results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => { setResults(null); setFormErr(''); };

  const nights = checkin && checkout && checkout > checkin ? _hsDiff(checkin, checkout) : null;

  return (
    <section className="home-search" id="buscar" data-screen-label="03b Buscador">
      <div className="hs-inner">

        {/* Header */}
        <div className="hs-hd">
          <div className="eyebrow hs-eyebrow">
            {lang === 'es' ? 'Busca tu estancia · Vera Playa' : 'Find your stay · Vera Playa'}
          </div>
          <h2 className="hs-title">
            {lang === 'es'
              ? <><em>¿Cuándo venís?</em> Elige fechas y te decimos qué hay libre.</>
              : <><em>When are you coming?</em> Pick dates and we'll show what's free.</>}
          </h2>
          <p className="hs-sub">
            {lang === 'es'
              ? 'Selecciona apartamento — o déjalo en blanco para ver los tres disponibles — y cuéntanos lo que necesitáis.'
              : 'Choose an apartment — or leave it blank to see all three — and tell us what you need.'}
          </p>
        </div>

        {/* Form */}
        <form className="hs-form" onSubmit={handleSearch} noValidate>

          {/* Apartment selector */}
          <div className="hs-field hs-field--full">
            <label className="hs-lbl">
              {lang === 'es' ? 'Apartamento' : 'Apartment'}
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

          {/* Dates + nights summary */}
          <div className="hs-row">
            <div className="hs-field">
              <label className="hs-lbl" htmlFor="hs-checkin">
                {lang === 'es' ? 'Entrada' : 'Check-in'}
              </label>
              <input
                id="hs-checkin"
                type="date"
                className="hs-input"
                value={checkin}
                min={today}
                onChange={e => { setCheckin(e.target.value); setResults(null); }}
                required
              />
            </div>
            <div className="hs-field">
              <label className="hs-lbl" htmlFor="hs-checkout">
                {lang === 'es' ? 'Salida' : 'Check-out'}
              </label>
              <input
                id="hs-checkout"
                type="date"
                className="hs-input"
                value={checkout}
                min={checkin || today}
                onChange={e => { setCheckout(e.target.value); setResults(null); }}
                required
              />
            </div>
            {nights && (
              <div className="hs-nights-badge">
                <span className="hs-nights-n">{nights}</span>
                <span className="hs-nights-lbl">{lang === 'es' ? 'noches' : 'nights'}</span>
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="hs-row hs-row--wrap">
            <div className="hs-field hs-field--inline">
              <label className="hs-lbl">
                {lang === 'es' ? 'Huéspedes' : 'Guests'}
              </label>
              <div className="hs-counter">
                <button type="button" className="hs-cnt-btn"
                  onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
                <span className="hs-cnt-num">{guests}</span>
                <button type="button" className="hs-cnt-btn"
                  onClick={() => setGuests(g => Math.min(6, g + 1))}>+</button>
              </div>
            </div>

            {/* Quick toggles */}
            <div className="hs-toggles">
              {[
                { key: 'baby',  val: baby,  set: setBaby,  es: 'Bebé',    en: 'Baby'    },
                { key: 'pet',   val: pet,   set: setPet,   es: 'Mascota', en: 'Pet'     },
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  className={`hs-toggle${t.val ? ' on' : ''}`}
                  onClick={() => t.set(v => !v)}
                >
                  {lang === 'es' ? t.es : t.en}
                </button>
              ))}
            </div>
          </div>

          {/* Extras grid */}
          <div className="hs-field hs-field--full">
            <label className="hs-lbl">
              {lang === 'es' ? 'Extras' : 'Extras'}
            </label>
            <div className="hs-extras">
              {[
                { key: 'towels',    val: extraTowels, set: setExtraTowels, es: 'Toallas extra',  en: 'Extra towels'  },
                { key: 'linen',     val: extraLinen,  set: setExtraLinen,  es: 'Sábanas extra',  en: 'Extra linen'   },
                { key: 'cot',       val: cot,         set: setCot,         es: 'Cuna de bebé',   en: 'Baby cot'      },
                { key: 'highchair', val: highchair,   set: setHighchair,   es: 'Trona',          en: 'High chair'    },
              ].map(x => (
                <label key={x.key} className={`hs-extra-item${x.val ? ' checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={x.val}
                    onChange={() => x.set(v => !v)}
                  />
                  {lang === 'es' ? x.es : x.en}
                </label>
              ))}
            </div>
          </div>

          {/* Error */}
          {formErr && (
            <div className="hs-form-err">{formErr}</div>
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
            <span>{lang === 'es' ? '✓ Alex confirma en 24h' : '✓ Alex replies in 24h'}</span>
            <span className="hs-trust-dot"/>
            <span>{lang === 'es' ? 'Solo 3 apartamentos' : 'Only 3 apartments'}</span>
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
                    ? `Ningún apartamento disponible para esas fechas exactas.`
                    : `No apartments available for those exact dates.`;
                if (nAvail === nTotal)
                  return lang === 'es'
                    ? `${nAvail === 1 ? 'Apartamento disponible' : `${nAvail} apartamentos disponibles`} para esas fechas.`
                    : `${nAvail === 1 ? 'Apartment available' : `${nAvail} apartments available`} for those dates.`;
                return lang === 'es'
                  ? `${nAvail} de ${nTotal} apartamentos disponibles para esas fechas.`
                  : `${nAvail} of ${nTotal} apartments available for those dates.`;
              })()}
            </div>

            {results.map(r => (
              <HsResultCard
                key={r.id}
                apt={r}
                available={r.available}
                lang={lang}
                checkin={checkin} checkout={checkout}
                guests={guests} baby={baby} pet={pet}
                extraTowels={extraTowels} extraLinen={extraLinen}
                cot={cot} highchair={highchair}
              />
            ))}

            {/* No availability data fallback */}
            {results.every(r => r.available === null) && (
              <div className="hs-no-data">
                {lang === 'es'
                  ? 'No tenemos datos de disponibilidad en este momento. Escríbenos directamente y te respondemos en menos de 24 h.'
                  : 'We don\'t have availability data right now. Write to us directly and we\'ll reply within 24 h.'}
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
          <p className="hs-notify-text">
            {lang === 'es'
              ? '¿Tus fechas están ocupadas? Avísanos y te escribimos si se libera algo — cancelaciones, aperturas de calendario…'
              : 'Are your dates taken? Let us know and we\'ll reach out if something opens up — cancellations, new slots…'}
          </p>
          <a
            href={lang === 'es'
              ? 'https://wa.me/34620316370?text=Hola%2C%20me%20interesan%20vuestros%20apartamentos%20pero%20mis%20fechas%20est%C3%A1n%20ocupadas.%20%C2%BFPod%C3%A9is%20avisarme%20si%20se%20libera%20algo%3F'
              : 'https://wa.me/34620316370?text=Hi%2C%20I%27m%20interested%20in%20your%20apartments%20but%20my%20dates%20are%20taken.%20Could%20you%20let%20me%20know%20if%20something%20becomes%20available%3F'}
            className="btn btn-ghost hs-notify-btn"
            target="_blank" rel="noopener"
          >
            {lang === 'es' ? 'Avisadme por WhatsApp →' : 'Notify me via WhatsApp →'}
          </a>
        </div>

      </div>
    </section>
  );
};

Object.assign(window, { HomeSearch });
