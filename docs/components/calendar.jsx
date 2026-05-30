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

// Returns free days Jun–Aug of current year, or null if no badge should show.
// Shows only Mar–Sep (approaching summer or mid-summer). Hides if ≥42 days free.
const _summerScarcity = (blocked) => {
  const today = new Date();
  const m = today.getMonth(); // 0-indexed
  if (m < 2 || m > 8) return null;
  const y = today.getFullYear();
  let free = 0;
  let cur = new Date(`${y}-06-01T12:00:00Z`);
  const end = new Date(`${y}-08-31T12:00:00Z`);
  while (cur <= end) {
    const ds = cur.toISOString().slice(0, 10);
    if (!_isBlk(ds, blocked)) free++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return free >= 42 ? null : free;
};

// ---------------------------------------------------------------
// RequestPanel — aparece cuando hay fechas seleccionadas
// ---------------------------------------------------------------
const RequestPanel = ({ aptId, lang, accent, selStart, selEnd, onReset }) => {
  const [guests, setGuests] = React.useState(2);
  // Pet y baby SÍ se eligen aquí porque afectan al precio (mascota) y
  // a la preparación (bebé). El resto de extras (cuna, trona, sábanas
  // adicionales, toallas adicionales) se eligen en /reservas.
  const [pets, setPets] = React.useState(false);
  const [baby, setBaby] = React.useState(false);

  const aptName = _CM.apt_names[aptId] || 'Hestía';
  const calc    = _calcStay(selStart, selEnd, aptId, pets, guests);

  const fmt = n => n.toLocaleString('es-ES') + ' €';

  const months_es = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const months_en = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const fmtDate = (ds) => {
    if (!ds) return '';
    const dd = ds.slice(8,10), mm = ds.slice(5,7), yy = ds.slice(2,4);
    return lang === 'en' ? `${mm}-${dd}-${yy}` : `${dd}-${mm}-${yy}`;
  };

  // CTA "Avanzar con la reserva": navega a /reservas pre-rellenado.
  // Datos de contacto, extras detallados (cuna, trona, sábanas, toallas)
  // y comentarios se gestionan allí — aquí solo lo esencial.
  const reservasHref = (() => {
    const params = new URLSearchParams();
    params.set('apt', aptId);
    if (selStart) params.set('checkin',  selStart);
    if (selEnd)   params.set('checkout', selEnd);
    if (guests)   params.set('guests',   String(guests));
    if (pets)     params.set('pets',     'yes');
    if (baby)     params.set('baby',     'yes');
    return 'reservas.html?' + params.toString();
  })();

  return (
    <div className="req-panel" style={{ '--req-accent': accent }}>

      {/* Dates summary */}
      <div className="req-dates">
        <div className="req-date-col">
          <span className="req-date-lbl">{lang === 'es' ? 'Entrada' : 'Check-in'}</span>
          <span className="req-date-val">{fmtDate(selStart)}</span>
        </div>
        <div className="req-nights">
          <span className="req-nights-n">{calc ? calc.nights : '—'}</span>
          <span className="req-nights-lbl">{lang === 'es' ? 'noches' : 'nights'}</span>
        </div>
        <div className="req-date-col req-date-col--r">
          <span className="req-date-lbl">{lang === 'es' ? 'Salida' : 'Check-out'}</span>
          <span className="req-date-val">{fmtDate(selEnd)}</span>
        </div>
      </div>

      {/* Price engine */}
      {calc && (
        <div className="price-engine">
          <div className="price-main-row">
            <div className="price-direct-block">
              <span className="price-label-sm">{lang === 'es' ? 'Precio directo' : 'Direct price'}</span>
              <span className="price-direct-total">{fmt(calc.directTotal)}</span>
              <span className="price-avg-night">{fmt(calc.avgPerNight)}{lang === 'es' ? '/noche' : '/night'}</span>
            </div>
            <div className="price-right-col">
              <div className="price-guarantee-badge">
                {lang === 'es' ? '★ Mejor precio garantizado' : '★ Best price guaranteed'}
              </div>
              <div className="price-guarantee-sub">
                {lang === 'es'
                  ? '¿Lo encuentras más barato en Booking o Airbnb? No solo lo igualamos — lo mejoramos.'
                  : 'Found it cheaper on Booking or Airbnb? We won\'t just match it — we\'ll beat it.'}
              </div>
            </div>
          </div>
          <div className="price-breakdown">
            <div className="price-line">
              <span>{lang === 'es' ? `${calc.nights} noches × precio variable` : `${calc.nights} nights × variable rate`}</span>
              <span>{fmt(calc.baseTotal)}</span>
            </div>
            {calc.stayD && (
              <div className="price-line price-line-disc">
                <span>{lang === 'es' ? calc.stayD.es : calc.stayD.en}</span>
                <span>−{fmt(calc.stayDiscAmt)}</span>
              </div>
            )}
            {calc.guestSuppAmt > 0 && (
              <div className="price-line">
                <span>{lang === 'es'
                  ? `${calc.guests} huéspedes · +${calc.guestSuppPerNight} €/noche`
                  : `${calc.guests} guests · +${calc.guestSuppPerNight} €/night`}</span>
                <span>+{fmt(calc.guestSuppAmt)}</span>
              </div>
            )}
            {calc.petAmt > 0 && (
              <div className="price-line">
                <span>{lang === 'es' ? 'Suplemento mascota (10 €/noche · máx. 50 €)' : 'Pet supplement (10 €/night · max 50 €)'}</span>
                <span>+{fmt(calc.petAmt)}</span>
              </div>
            )}
            <div className="price-line price-line-total">
              <span>{lang === 'es' ? 'Total estimado' : 'Estimated total'}</span>
              <span>{fmt(calc.directTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Guests + mascota + bebé. Cuna/trona/sábanas/toallas se eligen
          luego en /reservas (paso único de extras). */}
      <div className="req-guests">
        <span className="req-guests-lbl">{lang === 'es' ? 'Huéspedes' : 'Guests'}</span>
        <div className="req-guests-ctrl">
          <button className="req-g-btn" onClick={() => setGuests(g => Math.max(1, g - 1))} aria-label={lang === 'es' ? 'Quitar huésped' : 'Remove guest'}>−</button>
          <span className="req-g-num">{guests}</span>
          <button className="req-g-btn" onClick={() => setGuests(g => Math.min(6, g + 1))} aria-label={lang === 'es' ? 'Añadir huésped' : 'Add guest'}>+</button>
        </div>
        <label className="req-pets-toggle">
          <input type="checkbox" checked={pets} onChange={e => setPets(e.target.checked)}/>
          <span>{lang === 'es' ? '🐾 Mascota' : '🐾 Pet'}</span>
        </label>
        <label className="req-pets-toggle">
          <input type="checkbox" checked={baby} onChange={e => setBaby(e.target.checked)}/>
          <span>{lang === 'es' ? '👶 Bebé' : '👶 Baby'}</span>
        </label>
      </div>

      {/* Disclaimer — precio orientativo + garantía de mejora */}
      <div className="req-disclaimer">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>{lang === 'es'
          ? <><strong>Precio máximo orientativo.</strong> Si encuentras este apartamento más barato en Booking, Airbnb o cualquier otra plataforma, escríbenos — no solo lo igualamos, lo mejoramos. En la siguiente pantalla puedes añadir extras (cuna, trona, sábanas, mascota…). Alex confirma en menos de 24 h.</>
          : <><strong>Maximum indicative price.</strong> Found it cheaper on Booking, Airbnb or any other platform? Write to us — we won't just match it, we'll beat it. On the next screen you can add extras (cot, high chair, linen, pet…). Alex confirms within 24 h.</>}</p>
      </div>

      {/* CTA único: avanzar con la reserva → /reservas con prefill */}
      <div className="req-actions req-actions-forward">
        <a href={reservasHref} className="btn btn-primary req-btn-forward">
          {lang === 'es' ? 'Avanzar con la reserva' : 'Continue with the booking'}
          <span className="arrow"> →</span>
        </a>
      </div>

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
  year, month, blocked, lang, todayStr, horizonStr,
  selStart, selEnd, previewEnd,
  minNights, effMinFn,
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
          // Beyond booking horizon = no aceptamos reservas con check-in
          // posterior a esa fecha (ej. cierre antes de Sem. Santa 2027).
          // Se trata visualmente como "past" — gris, no clickable.
          const beyondHorizon = !!(horizonStr && ds > horizonStr);
          const isToday = ds === todayStr;
          const isBlk   = _isBlk(ds, blocked);

          // Blocked range markers (only when not in selection)
          const prevBlk   = isBlk && _isBlk(_adj(ds,-1), blocked);
          const nextBlk   = isBlk && _isBlk(_adj(ds, 1), blocked);
          const isBlkStart= isBlk && !prevBlk;
          const isBlkEnd  = isBlk && !nextBlk;
          const isBlkSingle = isBlkStart && isBlkEnd;
          const isBlkMid  = isBlk && !isBlkStart && !isBlkEnd;
          // Día POST-bloqueo: no bloqueado pero anterior sí. Mañana
          // todavía ocupada, tarde libre para check-in.
          const isBlkAfter = !isBlk && _isBlk(_adj(ds, -1), blocked);

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

          // Demasiado cerca del check-in: el rango sería < effectiveMin.
          // effMinFn calcula el mínimo aplicable a este candidato (tiene
          // en cuenta temporada crítica, inminencia y gap-fill).
          const effMinHere = effMinFn ? effMinFn(selStart, ds) : (minNights || 2);
          const isTooSoon = !!(selStart && !selEnd && ds > selStart && _diff(selStart, ds) < effMinHere);
          // Un blocked-start es clickable (puede ser check-out: mañana libre)
          const isClickable = !isPast && !beyondHorizon && !isTooSoon && (!isBlk || isBlkStart);
          const showBlk = isBlk && !inSel && !inPrev;

          return (
            <div
              key={d}
              className={[
                'cal-cell',
                (isPast || beyondHorizon) && 'past',
                isToday      && 'today',
                isBlk        && 'blk',
                isBlkAfter   && 'blk-after',
                isTooSoon    && 'too-soon',
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
              title={isTooSoon ? (lang === 'es' ? `Estancia mínima ${effMinHere} noches` : `Minimum stay ${effMinHere} nights`) : undefined}
            >
              {/* --- Blocked range rendering ---
                  · First blocked day (departure morning libre): right-strip
                  · Middle + last blocked night (fully booked): solid strip
                  · Day-after-block (arrival, mañana ocupada + tarde libre):
                    left-strip
                  · Single-day block: strip centrado
              */}
              {showBlk && !isBlkSingle && isBlkStart && <div className="c-strip c-sr"/>}
              {showBlk && (isBlkMid || (isBlkEnd && !isBlkSingle)) && <div className="c-strip"/>}
              {isBlkAfter && !inSel && !inPrev && <div className="c-strip c-sl"/>}
              {showBlk && isBlkSingle && <div className="c-strip"/>}
              {showBlk && (isBlkStart || isBlkSingle) && <div className="c-circ"/>}
              {isBlkAfter && !inSel && !inPrev && <div className="c-circ"/>}

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

  const blocked      = data ? data.blocked       : [];
  const updated      = data ? data.updated       : null;
  const sources      = data ? data.sources       : [];
  const fetchErrors  = data ? (data.fetch_errors || {}) : {};
  const hasSyncError = Object.keys(fetchErrors).length > 0;
  const isDemo       = data ? data.demo          : false;

  // Cierre de reservas — última fecha de check-in aceptada (ej. 20 mar 2027).
  // Lee de prices.json (window.PRICES_V2). null = sin restricción.
  const horizonStr = (window.PRICES_V2 && window.PRICES_V2.bookingHorizon
    && window.PRICES_V2.bookingHorizon.lastCheckinDate) || null;

  // Estancia mínima — capas:
  //   1) 1 noche → prohibida siempre.
  //   2) Base (minNights, default 3).
  //   3) Crítica (criticalSeasonMinNights, default 7).
  //   4) Excepción de 2 noches (twoNightFloor): solo si check-in inminente
  //      (≤ imminentDays) o gap-fill exacto.
  const rulesPC = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
  const baseMinNights      = rulesPC.minNights || 3;
  const twoNightFloor      = rulesPC.twoNightFloor || 2;
  const criticalMinNights  = rulesPC.criticalSeasonMinNights || baseMinNights;
  const imminentDays       = rulesPC.imminentDays || 7;
  const _isCriticalDate = (ds) => {
    const v2 = window.PRICES_V2;
    if (!v2 || typeof _v2BumpedSeasonForDate !== 'function') return false;
    return _v2BumpedSeasonForDate(ds, v2) === 'critica';
  };
  const _isGapFiller = (cin, cout) => {
    if (!cin || !cout) return false;
    const dayBefore = _adj(cin, -1);
    const beforeBlk = blocked.some(r => dayBefore >= r.start && dayBefore < r.end);
    const checkoutStartsBlk = blocked.some(r => r.start === cout);
    return beforeBlk && checkoutStartsBlk;
  };
  const _effectiveMinN = (cin, coutCandidate) => {
    if (!cin) return baseMinNights;
    const isImminent = _diff(todayStr, cin) <= imminentDays;
    const isGapFill  = coutCandidate && _isGapFiller(cin, coutCandidate);
    // Excepción universal: 2 noches si imminent o gap-fill (incl. crítica).
    if (isImminent || isGapFill) return twoNightFloor;
    if (_isCriticalDate(cin)) return criticalMinNights;
    return baseMinNights;
  };
  const minNights = React.useMemo(() => {
    if (!selStart) return baseMinNights;
    return Math.min(_effectiveMinN(selStart, null), _maxConsec(selStart, blocked));
  }, [selStart, blocked, baseMinNights, criticalMinNights, imminentDays]);

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
    if (ds < todayStr || (horizonStr && ds > horizonStr)) return;
    const blk      = _isBlk(ds, blocked);
    const blkStart = blk && !_isBlk(_adj(ds, -1), blocked);
    // Bloqueado mid-block: ni check-in ni check-out posibles.
    if (blk && !blkStart) return;

    // Start new selection: no start yet, or selection complete, or clicked before start
    if (!selStart || selEnd || ds < selStart) {
      // Un blocked-start NO vale como check-in (la noche está ocupada).
      if (blkStart) return;
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

    // Enforce minimum nights — rechaza la selección con mensaje
    // explicativo según el caso: 1 noche prohibida en cualquier caso,
    // 2 noches en temporada crítica salvo excepciones.
    const nights = _diff(selStart, ds);
    const effMin = _effectiveMinN(selStart, ds);
    if (nights === 1) {
      setSelMsg({
        type: 'error',
        es: 'No se permiten reservas de 1 noche. La estancia mínima es 2 noches.',
        en: 'One-night bookings are not allowed. Minimum stay is 2 nights.',
      });
      return;
    }
    if (nights < effMin) {
      const isCrit = _isCriticalDate(selStart);
      setSelMsg({
        type: 'error',
        es: isCrit
          ? `Temporada crítica: estancia mínima ${effMin} noches. Excepción: 2 noches solo si el check-in es esta semana (≤${imminentDays} días) o el rango rellena exactamente un hueco entre dos reservas existentes.`
          : `Estancia mínima ${effMin} noches. Las reservas de 2 noches solo se permiten para la semana actual (≤${imminentDays} días) o cuando rellenan exactamente un hueco entre dos reservas existentes.`,
        en: isCrit
          ? `Critical season: minimum stay ${effMin} nights. Exception: 2 nights only if check-in is this week (≤${imminentDays} days) or the range exactly fills a gap between two existing bookings.`
          : `Minimum stay ${effMin} nights. Two-night stays are only allowed for the current week (≤${imminentDays} days) or when they exactly fill a gap between two existing bookings.`,
      });
      return;
    }
    setSelEnd(ds);
    setSelMsg(null);
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
    '--apt-accent':    accent,
    '--apt-accent-8':  _hexA(accent, 0.08),
    '--apt-accent-30': _hexA(accent, 0.30),
    '--sel-fill':      _hexA(accent, 0.22),
    '--sel-circ':      _hexA(accent, 0.90),
    '--prev-fill':     _hexA(accent, 0.11),
    '--prev-circ':     _hexA(accent, 0.48),
  };

  const calProps = {
    blocked, lang, todayStr, horizonStr,
    selStart, selEnd, previewEnd,
    minNights,
    effMinFn: (cin, cout) => _effectiveMinN(cin, cout),
    onDayClick:  handleDayClick,
    onDayHover:  ds => { if (!selEnd) setHovDay(ds); },
    onDayLeave:  ()  => setHovDay(null),
  };

  return (
    <section id="apt-avail" className="apt-avail" style={sectionStyle}>

      {/* Header */}
      <div className="avail-hd">
        <div className="avail-eyebrow">
          <span className="avail-dot"/>
          {lang === 'es' ? 'Disponibilidad · tiempo real' : 'Availability · live'}
        </div>
        <h2 className="avail-title">
          {lang === 'es'
            ? <><em>Elige tus fechas.</em> Tu Hestía te espera.</>
            : <><em>Pick your dates.</em> Your Hestía is waiting.</>}
        </h2>
        <p className="avail-sub">
          {lang === 'es'
            ? 'Calendario sincronizado desde Booking.com y Airbnb. Selecciona entrada y salida para solicitarnos precio.'
            : 'Calendar synced from Booking.com and Airbnb. Select check-in and check-out to request a price directly from us.'}
        </p>
      </div>

      {/* Scarcity badge — shows free weeks remaining in summer */}
      {!loading && data && (() => {
        const free = _summerScarcity(blocked);
        if (free === null) return null;
        const wks = Math.round(free / 7);
        const msg = free <= 7
          ? { es: 'Prácticamente completo para este verano', en: 'Almost fully booked this summer' }
          : { es: `Solo ${wks} semana${wks !== 1 ? 's' : ''} disponible${wks !== 1 ? 's' : ''} este verano`, en: `Only ${wks} week${wks !== 1 ? 's' : ''} left this summer` };
        return (
          <div className="avail-scarcity">
            <span className="avail-scar-dot"/>
            <span>{msg[lang]}</span>
          </div>
        );
      })()}

      {/* Demo notice */}
      {isDemo && (
        <div className="avail-demo">
          {lang === 'es'
            ? '⚡ Datos de ejemplo · La sincronización en tiempo real se activará en breve'
            : '⚡ Sample data · Live sync will be activated shortly'}
        </div>
      )}

      {/* Sync-error notice — shown only when fetch failed but we have no demo flag */}
      {!isDemo && hasSyncError && (
        <div className="avail-sync-err">
          {lang === 'es'
            ? <>⚠ La sincronización automática no pudo conectar. Las fechas mostradas pueden no estar actualizadas. Escríbenos para confirmar disponibilidad: <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp →</a></>
            : <>⚠ Auto-sync could not connect. Dates shown may not be up to date. Write to us to confirm availability: <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp →</a></>}
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
