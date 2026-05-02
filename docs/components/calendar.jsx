// ================================================================
// HESTÍA — Disponibilidad + Selección de fechas
// Lee docs/assets/availability.json (generado por GitHub Action)
// ================================================================

const _CM = {
  months_es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  months_en: ['January','February','March','April','May','June',
               'July','August','September','October','November','December'],
  wd_es: ['Lu','Ma','Mi','Ju','Vi','Sá','Do'],
  wd_en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
  apt_names: { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas' },
};

// --- Date helpers ---
const _adj = (ds, n) => {
  const d = new Date(ds + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const _isBlk = (ds, blocked) => blocked.some(r => ds >= r.start && ds < r.end);

const _diff = (a, b) =>
  Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);

const _maxConsec = (startDs, blocked) => {
  let n = 0, cur = startDs;
  while (!_isBlk(cur, blocked) && n <= 366) { n++; cur = _adj(cur, 1); }
  return n;
};

const _hexA = (hex, a) =>
  (hex || '#3aaabb') + Math.round(a * 255).toString(16).padStart(2, '0');

const _longDate = (ds, lang) => {
  if (!ds) return '';
  const d = new Date(ds + 'T12:00:00Z');
  const M = (lang === 'es' ? _CM.months_es : _CM.months_en)[d.getUTCMonth()];
  const W = lang === 'es'
    ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d.getUTCDay()]
    : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()];
  return `${W} ${d.getUTCDate()} ${M.slice(0,3).toLowerCase()}. ${d.getUTCFullYear()}`;
};

const _shortDate = (ds, lang) => {
  if (!ds) return '';
  const d = new Date(ds + 'T12:00:00Z');
  const M = (lang === 'es' ? _CM.months_es : _CM.months_en)[d.getUTCMonth()];
  return `${d.getUTCDate()} ${M.slice(0,3).toLowerCase()}.`;
};

// ---------------------------------------------------------------
// RequestPanel — aparece cuando hay fechas seleccionadas
// ---------------------------------------------------------------
const RequestPanel = ({ aptId, lang, accent, selStart, selEnd, onReset }) => {
  const [guests, setGuests] = React.useState(2);
  const nights = _diff(selStart, selEnd);
  const aptName = _CM.apt_names[aptId] || 'Hestía';

  const buildMsg = () => {
    const entry = _longDate(selStart, lang);
    const salida = _longDate(selEnd, lang);
    if (lang === 'es') {
      return (
        `Hola! Quiero solicitar precio para ${aptName}.\n\n` +
        `📅 Entrada: ${entry}\n` +
        `📅 Salida: ${salida}\n` +
        `🌙 Noches: ${nights}\n` +
        `👥 Huéspedes: ${guests}\n\n` +
        `Solicito precio y disponibilidad confirmada antes de formalizar la reserva.\n` +
        `¡Gracias!`
      );
    }
    return (
      `Hello! I'd like to request a price for ${aptName}.\n\n` +
      `📅 Check-in: ${entry}\n` +
      `📅 Check-out: ${salida}\n` +
      `🌙 Nights: ${nights}\n` +
      `👥 Guests: ${guests}\n\n` +
      `I'm requesting a price and confirmed availability before making any booking.\n` +
      `Thank you!`
    );
  };

  const waHref = () =>
    'https://wa.me/34620316370?text=' + encodeURIComponent(buildMsg());

  const mailHref = () => {
    const subj = lang === 'es'
      ? `Solicitud de precio — ${aptName}`
      : `Price request — ${aptName}`;
    return `mailto:info@hestiayourhome.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(buildMsg())}`;
  };

  return (
    <div className="req-panel" style={{ '--req-accent': accent }}>

      {/* Dates summary */}
      <div className="req-dates">
        <div className="req-date-col">
          <span className="req-date-lbl">{lang === 'es' ? 'Entrada' : 'Check-in'}</span>
          <span className="req-date-val">{_longDate(selStart, lang)}</span>
        </div>
        <div className="req-nights">
          <span className="req-nights-n">{nights}</span>
          <span className="req-nights-lbl">{lang === 'es' ? 'noches' : 'nights'}</span>
        </div>
        <div className="req-date-col req-date-col--r">
          <span className="req-date-lbl">{lang === 'es' ? 'Salida' : 'Check-out'}</span>
          <span className="req-date-val">{_longDate(selEnd, lang)}</span>
        </div>
      </div>

      {/* Guests */}
      <div className="req-guests">
        <span className="req-guests-lbl">
          {lang === 'es' ? 'Número de huéspedes' : 'Number of guests'}
        </span>
        <div className="req-guests-ctrl">
          <button
            className="req-g-btn"
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            aria-label={lang === 'es' ? 'Menos huéspedes' : 'Fewer guests'}
          >−</button>
          <span className="req-g-num">{guests}</span>
          <button
            className="req-g-btn"
            onClick={() => setGuests(g => Math.min(6, g + 1))}
            aria-label={lang === 'es' ? 'Más huéspedes' : 'More guests'}
          >+</button>
        </div>
      </div>

      {/* Por qué no hay precio directo — explicación con voz de Hestía */}
      <div className="req-why">
        <div className="req-why-q">
          {lang === 'es' ? '¿Por qué no damos el precio directamente?' : 'Why don\'t we give the price upfront?'}
        </div>
        <p className="req-why-p">
          {lang === 'es'
            ? <>
                Porque el precio en Hestía no es convencional. Aplicamos descuentos
                para estancias de más de <strong>6, 14 o 28 noches</strong> —
                y condiciones especiales para más de tres meses.
                El importe también depende del <strong>número de huéspedes</strong>,
                de si viajáis con <strong>mascotas</strong>
                y de las <strong>fechas concretas</strong>:
                agosto y noviembre sencillamente no son lo mismo.
              </>
            : <>
                Because pricing at Hestía isn't conventional. We offer discounts
                for stays of <strong>6, 14 or 28+ nights</strong> —
                and special rates for over three months.
                The amount also depends on the <strong>number of guests</strong>,
                whether you're bringing <strong>pets</strong>,
                and the <strong>specific dates</strong>:
                August and November simply aren't the same.
              </>}
        </p>
        <p className="req-why-p req-why-close">
          {lang === 'es'
            ? <>Intentamos adaptarnos a vuestras necesidades reales. Por eso nos gusta escucharos — y que nos escuchéis. <em>Hestía no es algo convencional.</em></>
            : <>We try to adapt to your real needs. That's why we like to listen — and to be listened to. <em>Hestía is not a conventional place.</em></>}
        </p>
      </div>

      {/* Disclaimer — muy claro que es solicitud previa */}
      <div className="req-disclaimer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>
          {lang === 'es'
            ? <>
                <strong>Solicitud de precio — no es una reserva.</strong>{' '}
                Al enviar este mensaje únicamente estás pidiendo precio y disponibilidad confirmada.
                Alex te responde en menos de 24 horas con el importe exacto.
                La reserva solo se formaliza si tú la confirmas.
              </>
            : <>
                <strong>Price request — not a booking.</strong>{' '}
                By sending this message you are only asking for a price and confirmed availability.
                Alex will reply within 24 hours with the exact amount.
                The booking is only made if you confirm it.
              </>}
        </p>
      </div>

      {/* CTAs */}
      <div className="req-actions">
        <a
          href={waHref()}
          className="btn btn-primary req-btn-wa"
          target="_blank"
          rel="noopener"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {lang === 'es' ? 'Solicitar precio — WhatsApp' : 'Request price — WhatsApp'}
          <span className="arrow"> →</span>
        </a>
        <a
          href={mailHref()}
          className="btn btn-ghost req-btn-mail"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          {lang === 'es' ? 'Solicitar precio — Email' : 'Request price — Email'}
        </a>
      </div>

      {/* Reset */}
      <button className="req-reset" onClick={onReset}>
        ← {lang === 'es' ? 'Cambiar fechas' : 'Change dates'}
      </button>

    </div>
  );
};

// ---------------------------------------------------------------
// CalMonth — rejilla de un mes
// ---------------------------------------------------------------
const CalMonth = ({
  year, month, blocked, lang, todayStr,
  selStart, selEnd, previewEnd,
  onDayClick, onDayHover, onDayLeave,
}) => {
  const wds    = lang === 'es' ? _CM.wd_es : _CM.wd_en;
  const mName  = (lang === 'es' ? _CM.months_es : _CM.months_en)[month];
  const nDays  = new Date(year, month + 1, 0).getDate();
  let firstDow = new Date(year, month, 1).getDay();
  firstDow = firstDow === 0 ? 6 : firstDow - 1;

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ empty: true, k: `e${i}` });
  for (let d = 1; d <= nDays; d++) cells.push({ d, k: d });

  return (
    <div className="cal-month">
      <div className="cal-mhd">{mName} <span className="cal-yr">{year}</span></div>
      <div className="cal-grid">
        {wds.map(w => <div key={w} className="cal-wd">{w}</div>)}
        {cells.map(cell => {
          if (cell.empty) return <div key={cell.k} className="cal-cell cal-empty"/>;
          const { d } = cell;
          const ds      = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isPast  = ds < todayStr;
          const isToday = ds === todayStr;
          const isBlk   = _isBlk(ds, blocked);

          // Blocked range markers (only when not in selection)
          const prevBlk   = isBlk && _isBlk(_adj(ds,-1), blocked);
          const nextBlk   = isBlk && _isBlk(_adj(ds, 1), blocked);
          const isBlkStart= isBlk && !prevBlk;
          const isBlkEnd  = isBlk && !nextBlk;
          const isBlkSingle = isBlkStart && isBlkEnd;
          const isBlkMid  = isBlk && !isBlkStart && !isBlkEnd;

          // Selection markers
          const inSel = selStart && selEnd && ds >= selStart && ds <= selEnd;
          const isSS  = inSel && ds === selStart;
          const isSE  = inSel && ds === selEnd;
          const isSM  = inSel && !isSS && !isSE;

          // Preview markers (only when selStart set, no selEnd, previewEnd computed)
          const inPrev = !selEnd && selStart && previewEnd && ds >= selStart && ds <= previewEnd;
          const isPS   = inPrev && ds === selStart;
          const isPE   = inPrev && ds === previewEnd;
          const isPM   = inPrev && !isPS && !isPE;

          const isClickable = !isPast && !isBlk;
          const showBlk = isBlk && !inSel && !inPrev;

          return (
            <div
              key={d}
              className={[
                'cal-cell',
                isPast       && 'past',
                isToday      && 'today',
                isBlk        && 'blk',
                isClickable  && 'clickable',
                inSel        && 'in-sel',
                isSS         && 'sel-s',
                isSE         && 'sel-e',
                isSM         && 'sel-m',
                inPrev       && 'in-prev',
                isPS         && 'prev-s',
                isPE         && 'prev-e',
                isPM         && 'prev-m',
              ].filter(Boolean).join(' ')}
              onClick={isClickable ? () => onDayClick(ds) : undefined}
              onMouseEnter={isClickable ? () => onDayHover(ds) : undefined}
              onMouseLeave={isClickable ? onDayLeave : undefined}
            >
              {/* --- Blocked range rendering --- */}
              {showBlk && !isBlkSingle && isBlkStart && <div className="c-strip c-sr"/>}
              {showBlk && !isBlkSingle && isBlkEnd   && <div className="c-strip c-sl"/>}
              {showBlk && isBlkMid                   && <div className="c-strip"/>}
              {showBlk && (isBlkStart || isBlkEnd || isBlkSingle) && <div className="c-circ"/>}

              {/* --- Selection range rendering --- */}
              {isSS && !isSE && <div className="c-strip c-sel-strip c-sr"/>}
              {isSE && !isSS && <div className="c-strip c-sel-strip c-sl"/>}
              {isSM          && <div className="c-strip c-sel-strip"/>}
              {(isSS || isSE) && <div className="c-circ c-sel-circ"/>}

              {/* --- Preview range rendering --- */}
              {isPS && !isPE && <div className="c-strip c-prev-strip c-sr"/>}
              {isPE && !isPS && <div className="c-strip c-prev-strip c-sl"/>}
              {isPM          && <div className="c-strip c-prev-strip"/>}
              {(isPS || isPE) && <div className="c-circ c-prev-circ"/>}

              {/* --- Today ring --- */}
              {isToday && !inSel && !inPrev && <div className="c-today"/>}

              <span className="c-n">{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// AptCalendar — sección principal
// ---------------------------------------------------------------
const AptCalendar = ({ aptId, lang, accent }) => {
  const [data,    setData   ] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const [bYear,  setBYear ] = React.useState(now.getFullYear());
  const [bMonth, setBMonth] = React.useState(now.getMonth());

  // Selection state
  const [selStart, setSelStart] = React.useState(null);
  const [selEnd,   setSelEnd  ] = React.useState(null);
  const [hovDay,   setHovDay  ] = React.useState(null);
  const [selMsg,   setSelMsg  ] = React.useState(null); // { type:'error'|'info', es:'', en:'' }

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && j[aptId]) setData(j[aptId]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [aptId]);

  const blocked = data ? data.blocked  : [];
  const updated = data ? data.updated  : null;
  const sources = data ? data.sources  : [];
  const isDemo  = data ? data.demo     : false;

  // Precompute min nights when selStart changes
  const minNights = React.useMemo(() => {
    if (!selStart) return 6;
    return Math.min(6, _maxConsec(selStart, blocked));
  }, [selStart, blocked]);

  // Compute preview end for hover display
  let previewEnd = null;
  if (selStart && !selEnd && hovDay && hovDay > selStart) {
    let pathClear = true;
    let cur = _adj(selStart, 1);
    while (cur < hovDay) {
      if (_isBlk(cur, blocked)) { pathClear = false; break; }
      cur = _adj(cur, 1);
    }
    if (pathClear) {
      const pNights = _diff(selStart, hovDay);
      previewEnd = _adj(selStart, Math.max(pNights, minNights));
    }
  }

  const handleDayClick = (ds) => {
    if (ds < todayStr || _isBlk(ds, blocked)) return;

    // Start new selection: no start yet, or selection complete, or clicked before start
    if (!selStart || selEnd || ds < selStart) {
      setSelStart(ds); setSelEnd(null); setSelMsg(null); setHovDay(null);
      return;
    }
    // Click on start → cancel
    if (ds === selStart) {
      setSelStart(null); setSelEnd(null); setSelMsg(null); setHovDay(null);
      return;
    }

    // ds > selStart, no end yet — check path is clear
    let cur = _adj(selStart, 1);
    while (cur < ds) {
      if (_isBlk(cur, blocked)) {
        setSelMsg({
          type: 'error',
          es: 'Hay días reservados en ese rango. Elige un periodo sin interrupciones.',
          en: 'There are booked days in that range. Please select a period without gaps.',
        });
        return;
      }
      cur = _adj(cur, 1);
    }

    // Enforce minimum nights
    const nights = _diff(selStart, ds);
    if (nights < minNights) {
      const extEnd = _adj(selStart, minNights);
      setSelEnd(extEnd);
      setSelMsg({
        type: 'info',
        es: `Estancia mínima ${minNights} noches — fecha de salida ajustada.`,
        en: `Minimum stay ${minNights} nights — check-out date adjusted.`,
      });
    } else {
      setSelEnd(ds);
      setSelMsg(null);
    }
    setHovDay(null);
  };

  const handleReset = () => {
    setSelStart(null); setSelEnd(null); setSelMsg(null); setHovDay(null);
  };

  const m2y = bMonth === 11 ? bYear + 1 : bYear;
  const m2m = bMonth === 11 ? 0 : bMonth + 1;

  const canPrev = !(bYear === now.getFullYear() && bMonth <= now.getMonth());
  const goPrev = () => {
    if (!canPrev) return;
    if (bMonth === 0) { setBYear(y => y-1); setBMonth(11); }
    else setBMonth(m => m-1);
  };
  const goNext = () => {
    if (bMonth === 11) { setBYear(y => y+1); setBMonth(0); }
    else setBMonth(m => m+1);
  };

  const months  = lang === 'es' ? _CM.months_es : _CM.months_en;
  const navLbl  = `${months[bMonth]} · ${months[m2m]} ${m2y}`;

  const fmtUpd = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    const p = n => String(n).padStart(2,'0');
    return lang === 'es'
      ? `${d.getDate()} ${months[d.getMonth()].slice(0,3).toLowerCase()}. · ${p(d.getHours())}:${p(d.getMinutes())}`
      : `${months[d.getMonth()].slice(0,3)} ${d.getDate()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const sectionStyle = {
    '--apt-accent': accent,
    '--sel-fill':   _hexA(accent, 0.22),
    '--sel-circ':   _hexA(accent, 0.90),
    '--prev-fill':  _hexA(accent, 0.11),
    '--prev-circ':  _hexA(accent, 0.48),
  };

  const calProps = {
    blocked, lang, todayStr,
    selStart, selEnd, previewEnd,
    onDayClick:  handleDayClick,
    onDayHover:  ds => { if (!selEnd) setHovDay(ds); },
    onDayLeave:  ()  => setHovDay(null),
  };

  return (
    <section className="apt-avail" style={sectionStyle}>

      {/* Header */}
      <div className="avail-hd">
        <div className="avail-eyebrow">
          <span className="avail-dot"/>
          {lang === 'es' ? 'Disponibilidad · tiempo real' : 'Availability · live'}
        </div>
        <h2 className="avail-title">
          {lang === 'es'
            ? <><em>Elige tus fechas.</em> El apartamento te espera.</>
            : <><em>Pick your dates.</em> The apartment is waiting.</>}
        </h2>
        <p className="avail-sub">
          {lang === 'es'
            ? 'Calendario sincronizado desde Booking.com y Airbnb. Selecciona entrada y salida para solicitar precio directamente a Alex.'
            : 'Calendar synced from Booking.com and Airbnb. Select check-in and check-out to request a price directly from Alex.'}
        </p>
      </div>

      {/* Demo notice */}
      {isDemo && (
        <div className="avail-demo">
          {lang === 'es'
            ? '⚡ Datos de ejemplo · La sincronización en tiempo real se activará en breve'
            : '⚡ Sample data · Live sync will be activated shortly'}
        </div>
      )}

      {/* Selection hint */}
      {selStart && !selEnd && (
        <div className="avail-hint">
          <span className="avail-hint-dot"/>
          {lang === 'es'
            ? <>Entrada: <strong>{_shortDate(selStart, 'es')}</strong> · Ahora selecciona la fecha de salida (mín. {minNights} noches)</>
            : <>Check-in: <strong>{_shortDate(selStart, 'en')}</strong> · Now select check-out (min. {minNights} nights)</>}
        </div>
      )}

      {/* Month navigation */}
      <div className="avail-nav">
        <button className={`avail-arr${canPrev ? '' : ' off'}`} onClick={goPrev}
          aria-label={lang === 'es' ? 'Mes anterior' : 'Previous month'}>‹</button>
        <span className="avail-nav-lbl">{navLbl}</span>
        <button className="avail-arr" onClick={goNext}
          aria-label={lang === 'es' ? 'Mes siguiente' : 'Next month'}>›</button>
      </div>

      {/* Calendar months */}
      {loading ? (
        <div className="avail-months">
          <div className="cal-month cal-skel"/>
          <div className="cal-month cal-skel"/>
        </div>
      ) : (
        <div className="avail-months">
          <CalMonth year={bYear} month={bMonth} {...calProps}/>
          <CalMonth year={m2y}   month={m2m}    {...calProps}/>
        </div>
      )}

      {/* Inline message (error / info) */}
      {selMsg && (
        <div className={`avail-sel-msg ${selMsg.type}`}>
          {selMsg.type === 'error'
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>}
          {lang === 'es' ? selMsg.es : selMsg.en}
        </div>
      )}

      {/* Request panel — appears once both dates are selected */}
      {selStart && selEnd ? (
        <RequestPanel
          aptId={aptId} lang={lang} accent={accent}
          selStart={selStart} selEnd={selEnd}
          onReset={handleReset}
        />
      ) : (
        /* Footer — only shown when no complete selection */
        <div className="avail-foot">
          <div className="avail-legend">
            <span className="leg-item"><span className="leg-dot lg-av"/>{lang === 'es' ? 'Disponible' : 'Available'}</span>
            <span className="leg-sep">·</span>
            <span className="leg-item"><span className="leg-dot lg-bk"/>{lang === 'es' ? 'Reservado' : 'Booked'}</span>
            {selStart && (
              <>
                <span className="leg-sep">·</span>
                <span className="leg-item"><span className="leg-dot lg-sel"/>{lang === 'es' ? 'Tu selección' : 'Your selection'}</span>
              </>
            )}
          </div>
          <div className="avail-meta">
            {updated && (
              <span className="avail-upd">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {fmtUpd(updated)}
              </span>
            )}
            {sources.length > 0 && (
              <span className="avail-srcs">
                {sources.includes('booking') && <span className="avail-src src-bk">Booking.com</span>}
                {sources.includes('airbnb')  && <span className="avail-src src-ab">Airbnb</span>}
              </span>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

Object.assign(window, { AptCalendar, CalMonth, RequestPanel });
