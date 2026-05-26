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

// ---- Custom calendar range picker — mismo estilo que AptCalendar ----
const HsDateRange = ({ checkin, checkout, setCheckin, setCheckout, avail, apt, lang, today }) => {
  const [hover, setHover] = React.useState(null);
  const [drMsg, setDrMsg] = React.useState(null);
  const todayDate = new Date(today + 'T12:00:00Z');
  const [viewY, setViewY] = React.useState(todayDate.getUTCFullYear());
  const [viewM, setViewM] = React.useState(todayDate.getUTCMonth());

  const blocked = React.useMemo(() => {
    if (!apt || !avail || !avail[apt]) return [];
    return avail[apt].blocked || [];
  }, [apt, avail]);

  // Cierre de reservas — última fecha de check-in aceptada (de prices.json).
  const horizonStr = (window.PRICES_V2 && window.PRICES_V2.bookingHorizon
    && window.PRICES_V2.bookingHorizon.lastCheckinDate) || null;
  const _isBeyondHorizon = (ds) => !!(horizonStr && ds > horizonStr);

  const _isBlkLocal = (ds) => blocked.some(r => ds >= r.start && ds < r.end);
  // Día "partido" — primer día de bloque: mañana libre (check-out válido),
  // tarde ocupada (check-in NO válido).
  const _isBlkStartLocal = (ds) => _isBlkLocal(ds) && !_isBlkLocal(_hsAdj(ds, -1));

  // Estancia mínima — capas de reglas (idéntico a DateRangePicker en shared):
  //   1) 1 noche → siempre prohibida.
  //   2) Por defecto: 3 noches mínimo (minNights).
  //   3) Temporada crítica: 7 noches mínimo (criticalSeasonMinNights).
  //   4) Excepción 2 noches (twoNightFloor): solo si el check-in cae en
  //      la semana actual (≤ imminentDays) O si el rango rellena
  //      exactamente un hueco entre dos reservas (gap-fill).
  const rules = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
  const baseMinN      = rules.minNights || 3;
  const twoNightFloor = rules.twoNightFloor || 2;
  const criticalMinN  = rules.criticalSeasonMinNights || baseMinN;
  const imminentD     = rules.imminentDays || 7;
  const _isCriticalDate = (ds) => {
    const v2 = window.PRICES_V2;
    if (!v2 || typeof _v2BumpedSeasonForDate !== 'function') return false;
    return _v2BumpedSeasonForDate(ds, v2) === 'critica';
  };
  const _isGapFiller = (cin, cout) => {
    if (!cin || !cout) return false;
    const dayBefore = _hsAdj(cin, -1);
    const beforeBlk = blocked.some(r => dayBefore >= r.start && dayBefore < r.end);
    const checkoutStartsBlk = blocked.some(r => r.start === cout);
    return beforeBlk && checkoutStartsBlk;
  };
  const _effectiveMinN = (cin, coutCandidate) => {
    if (!cin) return baseMinN;
    const isImminent = _hsDiff(today, cin) <= imminentD;
    const isGapFill  = coutCandidate && _isGapFiller(cin, coutCandidate);
    if (isImminent || isGapFill) return twoNightFloor;
    if (_isCriticalDate(cin)) return criticalMinN;
    return baseMinN;
  };
  // Día "demasiado cerca del check-in para ser un check-out válido".
  const _tooSoonForCheckout = (ds) => {
    if (!checkin || checkout) return false;
    if (ds <= checkin) return false;
    return _hsDiff(checkin, ds) < _effectiveMinN(checkin, ds);
  };

  // Hover preview end: el camino intermedio debe estar libre. El hover
  // puede ser un blocked-start (check-out válido).
  let previewEnd = null;
  if (checkin && !checkout && hover && hover > checkin) {
    let ok = true;
    let cur = _hsAdj(checkin, 1);
    while (cur < hover) { if (_isBlkLocal(cur)) { ok = false; break; } cur = _hsAdj(cur, 1); }
    if (ok) previewEnd = hover;
  }

  const handleDayClick = (ds) => {
    if (ds < today || _isBeyondHorizon(ds)) return;
    const blk      = _isBlkLocal(ds);
    const blkStart = blk && _isBlkStartLocal(ds);
    if (blk && !blkStart) return;
    // Fase check-in: blocked-start no vale (noche ocupada).
    if (!checkin || checkout || ds <= checkin) {
      if (blkStart) return;
      setCheckin(ds); setCheckout(''); setDrMsg(null); return;
    }
    // Fase check-out: rechazar 1 noche y rangos < effectiveMin.
    const nights = _hsDiff(checkin, ds);
    const effMin = _effectiveMinN(checkin, ds);
    if (nights === 1) {
      setDrMsg({
        type: 'error',
        es: 'No se permiten reservas de 1 noche. La estancia mínima es 2 noches.',
        en: 'One-night bookings are not allowed. Minimum stay is 2 nights.',
      });
      return;
    }
    if (nights < effMin) {
      const isCrit = _isCriticalDate(checkin);
      setDrMsg({
        type: 'error',
        es: isCrit
          ? `Temporada crítica: estancia mínima ${effMin} noches. Excepción: 2 noches solo si el check-in es esta semana (≤${imminentD} días) o el rango rellena exactamente un hueco entre dos reservas existentes.`
          : `Estancia mínima ${effMin} noches. Las reservas de 2 noches solo se permiten para la semana actual (≤${imminentD} días) o cuando rellenan exactamente un hueco entre dos reservas existentes.`,
        en: isCrit
          ? `Critical season: minimum stay ${effMin} nights. Exception: 2 nights only if check-in is this week (≤${imminentD} days) or the range exactly fills a gap between two existing bookings.`
          : `Minimum stay ${effMin} nights. Two-night stays are only allowed for the current week (≤${imminentD} days) or when they exactly fill a gap between two existing bookings.`,
      });
      return;
    }
    // Verificar camino libre (sin bloqueadas en el medio).
    let cur = _hsAdj(checkin, 1);
    while (cur < ds) {
      if (_isBlkLocal(cur)) { setCheckin(ds); setCheckout(''); setDrMsg(null); return; }
      cur = _hsAdj(cur, 1);
    }
    setCheckout(ds); setDrMsg(null);
  };

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WDS_ES = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
  const WDS_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const renderMonth = (y, m) => {
    const nDays  = new Date(y, m + 1, 0).getDate();
    let firstDow = new Date(y, m, 1).getDay();
    firstDow = firstDow === 0 ? 6 : firstDow - 1;
    const wds    = lang === 'es' ? WDS_ES : WDS_EN;
    const mName  = (lang === 'es' ? MONTHS_ES : MONTHS_EN)[m];
    const cells  = [];
    for (let i = 0; i < firstDow; i++) cells.push({ empty: true, k: `e${i}` });
    for (let d = 1; d <= nDays; d++) cells.push({ d, k: d });

    return (
      <div className="cal-month" key={`${y}-${m}`}>
        <div className="cal-mhd">{mName} <span className="cal-yr">{y}</span></div>
        <div className="cal-grid">
          {wds.map(w => <div key={w} className="cal-wd">{w}</div>)}
          {cells.map(cell => {
            if (cell.empty) return <div key={cell.k} className="cal-cell cal-empty"/>;
            const { d } = cell;
            const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isPast  = ds < today;
            const isBeyond= _isBeyondHorizon(ds);
            const isToday = ds === today;
            const isBlk   = _isBlkLocal(ds);

            const prevBlk     = isBlk && _isBlkLocal(_hsAdj(ds,-1));
            const nextBlk     = isBlk && _isBlkLocal(_hsAdj(ds, 1));
            const isBlkStart  = isBlk && !prevBlk;
            const isBlkEnd    = isBlk && !nextBlk;
            const isBlkSingle = isBlkStart && isBlkEnd;
            const isBlkMid    = isBlk && !isBlkStart && !isBlkEnd;
            // Día POST-bloqueo: no bloqueado pero el anterior sí. Mañana
            // ocupada (huésped sale), tarde libre como check-in.
            const isBlkAfter  = !isBlk && _isBlkLocal(_hsAdj(ds, -1));

            const inSel = !!(checkin && checkout && ds >= checkin && ds <= checkout);
            const isSS  = inSel && ds === checkin;
            const isSE  = inSel && ds === checkout;
            const isSM  = inSel && !isSS && !isSE;

            const inPrev = !!(checkin && !checkout && previewEnd && ds >= checkin && ds <= previewEnd);
            const isPS   = inPrev && ds === checkin;
            const isPE   = inPrev && ds === previewEnd;
            const isPM   = inPrev && !isPS && !isPE;

            // Demasiado cerca del check-in para ser check-out válido
            // (rango < effectiveMin). No clickable + visual atenuado.
            const isTooSoon = _tooSoonForCheckout(ds);
            // Un blocked-start es clickable (puede ser check-out: mañana libre)
            const isClickable = !isPast && !isBeyond && !isTooSoon && (!isBlk || isBlkStart);
            const showBlk = isBlk && !inSel && !inPrev;

            return (
              <div key={d}
                className={['cal-cell',(isPast||isBeyond)&&'past',isToday&&'today',isBlk&&'blk',
                  isBlkAfter && 'blk-after',
                  isTooSoon && 'too-soon',
                  isClickable&&'clickable',inSel&&'in-sel',isSS&&'sel-s',isSE&&'sel-e',isSM&&'sel-m',
                  inPrev&&'in-prev',isPS&&'prev-s',isPE&&'prev-e',isPM&&'prev-m',
                ].filter(Boolean).join(' ')}
                onClick={isClickable ? () => handleDayClick(ds) : undefined}
                onMouseEnter={isClickable && !checkout ? () => setHover(ds) : undefined}
                onMouseLeave={isClickable ? () => setHover(null) : undefined}
                title={isTooSoon ? (lang === 'es' ? `Estancia mínima ${_effectiveMinN(checkin, ds)} noches` : `Minimum stay ${_effectiveMinN(checkin, ds)} nights`) : undefined}
              >
                {showBlk && !isBlkSingle && isBlkStart && <div className="c-strip c-sr"/>}
                {showBlk && (isBlkMid || (isBlkEnd && !isBlkSingle)) && <div className="c-strip"/>}
                {isBlkAfter && !inSel && !inPrev && <div className="c-strip c-sl"/>}
                {showBlk && isBlkSingle && <div className="c-strip"/>}
                {showBlk && (isBlkStart || isBlkSingle) && <div className="c-circ"/>}
                {isBlkAfter && !inSel && !inPrev && <div className="c-circ"/>}
                {isSS && !isSE && <div className="c-strip c-sel-strip c-sr"/>}
                {isSE && !isSS && <div className="c-strip c-sel-strip c-sl"/>}
                {isSM          && <div className="c-strip c-sel-strip"/>}
                {(isSS||isSE)  && <div className="c-circ c-sel-circ"/>}
                {isPS && !isPE && <div className="c-strip c-prev-strip c-sr"/>}
                {isPE && !isPS && <div className="c-strip c-prev-strip c-sl"/>}
                {isPM          && <div className="c-strip c-prev-strip"/>}
                {(isPS||isPE)  && <div className="c-circ c-prev-circ"/>}
                {isToday && !inSel && !inPrev && <div className="c-today"/>}
                <span className="c-n">{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nextY    = viewM === 11 ? viewY + 1 : viewY;
  const nextM    = viewM === 11 ? 0 : viewM + 1;
  const canGoPrev = viewY > todayDate.getUTCFullYear() || viewM > todayDate.getUTCMonth();
  const prevMonth = () => { if (!canGoPrev) return; if (viewM===0){setViewY(y=>y-1);setViewM(11);}else setViewM(m=>m-1); };
  const nextMonth = () => { if (viewM===11){setViewY(y=>y+1);setViewM(0);}else setViewM(m=>m+1); };

  const months = lang === 'es' ? MONTHS_ES : MONTHS_EN;
  const navLbl = `${months[viewM]} · ${months[nextM]} ${nextY}`;
  const nights = checkin && checkout ? _hsDiff(checkin, checkout) : null;

  return (
    <div className="hscal-wrap" style={{
      '--apt-accent': '#1BC8D8',
      '--sel-fill':   'rgba(27,200,216,.22)',
      '--sel-circ':   'rgba(27,200,216,.90)',
      '--prev-fill':  'rgba(27,200,216,.11)',
      '--prev-circ':  'rgba(27,200,216,.48)',
    }}>
      <div className="hscal-phase-hint">
        {!checkin    ? (lang==='es' ? '↓ Elige fecha de entrada'       : '↓ Choose check-in date')
         : !checkout ? (lang==='es' ? '→ Ahora elige la fecha de salida' : '→ Now choose check-out date')
         : null}
      </div>
      {drMsg && (
        <div className={`hscal-msg hscal-msg-${drMsg.type || 'info'}`} role={drMsg.type === 'error' ? 'alert' : 'status'}>
          {drMsg[lang] || drMsg.es}
        </div>
      )}
      <div className="avail-nav hscal-nav">
        <button type="button" className={`avail-arr${canGoPrev?'':' off'}`} onClick={prevMonth}
          aria-label={lang==='es'?'Mes anterior':'Previous month'}>‹</button>
        <span className="avail-nav-lbl">{navLbl}</span>
        <button type="button" className="avail-arr" onClick={nextMonth}
          aria-label={lang==='es'?'Mes siguiente':'Next month'}>›</button>
      </div>
      <div className="hscal-months" onMouseLeave={() => { if (!checkout) setHover(null); }}>
        {renderMonth(viewY, viewM)}
        {renderMonth(nextY, nextM)}
      </div>
      {(checkin || checkout) && (
        <div className="hscal-sel-row">
          {checkin && (
            <span className="hscal-sel-item">
              <span className="hscal-sel-lbl">{lang==='es' ? 'Entrada' : 'Check-in'}</span>
              <strong>{_hsFmtDate(checkin, lang)}</strong>
            </span>
          )}
          {checkout && (
            <span className="hscal-sel-item">
              <span className="hscal-sel-lbl">{lang==='es' ? 'Salida' : 'Check-out'}</span>
              <strong>{_hsFmtDate(checkout, lang)}</strong>
            </span>
          )}
          {nights && (
            <div className="hs-nights-badge">
              <span className="hs-nights-n">{nights}</span>
              <span className="hs-nights-lbl">{lang==='es' ? 'noches' : 'nights'}</span>
            </div>
          )}
          <button type="button" className="hscal-clear"
            onClick={() => { setCheckin(''); setCheckout(''); setDrMsg(null); }}>
            {lang==='es' ? '✕ Borrar' : '✕ Clear'}
          </button>
        </div>
      )}
    </div>
  );
};

// ---- Result card ----
// Flujo nuevo: el huésped ve disponibilidad + precio base aquí, y un único
// CTA "Avanzar con la reserva" lo lleva a /reservas con apt+fechas+huéspedes
// pre-rellenados. Extras (cuna, trona, sábanas, mascota...) y datos de
// contacto se gestionan allí — aquí reducimos la carga al mínimo.
const HsResultCard = ({ apt, available, lang, checkin, checkout, guests }) => {

  const nights  = checkin && checkout ? _hsDiff(checkin, checkout) : 0;
  const aptName = apt.name;
  // Precio base sin extras (sin mascota) — el detalle se ve en /reservas.
  const calc    = (checkin && checkout && checkout > checkin)
    ? _calcStay(checkin, checkout, apt.id, false, parseInt(guests, 10) || null) : null;
  const fmt = n => n.toLocaleString('es-ES') + ' €';

  // URL del CTA "Avanzar con la reserva" — pasa apt+fechas+huéspedes.
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
                    <span className="hs-pb-lbl">{lang === 'es' ? 'Precio directo · hasta' : 'Direct price · up to'}</span>
                    <span className="hs-pb-total">{fmt(calc.directTotal)}</span>
                    <span className="hs-pb-avg">{fmt(calc.avgPerNight)}{lang === 'es' ? '/noche' : '/night'}</span>
                  </div>
                  <div className="hs-pb-right">
                    <div className="price-guarantee-badge">
                      {lang === 'es' ? '✓ Precio directo siempre mejor' : '✓ Direct price always better'}
                    </div>
                    <div className="price-guarantee-sub">
                      {lang === 'es'
                        ? 'Precio directo siempre mejor que cualquier plataforma.'
                        : 'Our direct price is always better than any platform.'}
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
                  <div className="hs-pb-line hs-pb-total-line">
                    <span>{lang === 'es' ? 'Precio máximo directo' : 'Maximum direct price'}</span>
                    <span>{fmt(calc.directTotal)}</span>
                  </div>
                </div>
                <p className="hs-pb-note">{lang === 'es'
                  ? '* Precio máximo orientativo. Cuéntanos de ti — muchas veces podemos ajustar.'
                  : '* Maximum indicative price. Tell us about yourselves — we can often adjust.'}</p>
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
                ? 'En la siguiente pantalla podrás añadir extras (cuna, trona, sábanas, mascota…) y dejarnos tus datos. Alex confirma en menos de 24 h.'
                : 'On the next screen you can add extras (cot, high chair, linen, pet…) and leave your details. Alex confirms within 24 h.'}
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
  // Extras (cuna, trona, sábanas, toallas, mascota) se rellenan SOLO en
  // /reservas para no duplicar trabajo. Aquí solo huéspedes + fechas.

  // Results
  const [results,     setResults    ] = React.useState(null);
  const [formErr,     setFormErr    ] = React.useState('');
  const [notifyName,  setNotifyName ] = React.useState('');
  const [notifyEmail, setNotifyEmail] = React.useState('');
  const [notifyState, setNotifyState] = React.useState('idle');

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
    <section className="home-search" id="buscar" data-screen-label="03b Buscador">
      <div className="hs-inner">

        {/* Header */}
        <div className="hs-hd">
          <div className="eyebrow hs-eyebrow">
            {lang === 'es' ? 'Busca tu estancia · Vera Playa' : 'Find your stay · Vera Playa'}
          </div>
          <h2 className="hs-title">
            {lang === 'es' ? <em>¿Cuándo venís?</em> : <em>When are you coming?</em>}
          </h2>
          <p className="hs-sub">
            {lang === 'es'
              ? 'Coge uno de nuestros huecos o elige tu Hestía y las fechas que prefieras.'
              : 'Grab one of our available slots or choose your Hestía and the dates you prefer.'}
          </p>
        </div>

        {/* Últimas plazas — huecos disponibles próximas 6 semanas */}
        {typeof LastMinuteStrip !== 'undefined' && <LastMinuteStrip lang={lang} embedded />}

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

          {/* Calendar date range picker */}
          <HsDateRange
            checkin={checkin} checkout={checkout}
            setCheckin={v => { setCheckin(v); setResults(null); }}
            setCheckout={v => { setCheckout(v); setResults(null); }}
            avail={avail} apt={apt}
            lang={lang} today={today}
          />

          {/* Guests — sin extras: cuna/trona/sábanas/toallas/mascota se
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
            <span>{lang === 'es' ? '✓ Te confirmamos en 24h' : '✓ We confirm in 24h'}</span>
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
          {results && results.length > 0 && results.every(r => r.available === false) ? (
            <>
              <p className="hs-notify-text">
                {lang === 'es'
                  ? 'Déjanos tu email y te avisamos si esas fechas se liberan — cancelaciones, ventanas nuevas…'
                  : 'Leave your email and we\'ll let you know if those dates open up — cancellations, new slots…'}
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
                  ? '¿Tus fechas están ocupadas? Avísanos y te escribimos si se libera algo — cancelaciones, aperturas de calendario…'
                  : 'Are your dates taken? Let us know and we\'ll reach out if something opens up — cancellations, new slots…'}
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
