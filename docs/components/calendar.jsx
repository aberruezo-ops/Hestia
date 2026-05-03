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
  const [guests,   setGuests  ] = React.useState(2);
  const [pets,     setPets    ] = React.useState(false);
  const [name,     setName    ] = React.useState('');
  const [phone,    setPhone   ] = React.useState('');
  const [email,    setEmail   ] = React.useState('');
  const [comments, setComments] = React.useState('');

  const aptName = _CM.apt_names[aptId] || 'Hestía';
  const calc    = _calcStay(selStart, selEnd, aptId, pets);

  const fmt = n => n.toLocaleString('es-ES') + ' €';

  const months_es = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const months_en = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const fmtDate = (ds) => {
    if (!ds) return '';
    const d = new Date(ds + 'T12:00:00Z');
    if (lang === 'es') return `${d.getUTCDate()} de ${months_es[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
    return `${months_en[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  };

  const buildMsg = () => {
    const c = calc;
    const petsLine = pets
      ? (lang === 'es' ? `🐾 Mascota: Sí (+${PET_SUPP_NIGHT}€/noche)\n` : `🐾 Pet: Yes (+${PET_SUPP_NIGHT}€/night)\n`)
      : '';
    const discLine = c && c.stayD
      ? (lang === 'es'
          ? `🏷 ${c.stayD.es}: −${fmt(c.stayDiscAmt)}\n`
          : `🏷 ${c.stayD.en}: −${fmt(c.stayDiscAmt)}\n`)
      : '';
    const priceBlock = c
      ? (lang === 'es'
          ? `\n💰 PRECIO ESTIMADO DIRECTO\n` +
            `   ${fmt(c.directTotal)} total (${c.nights} noches × ~${fmt(c.avgPerNight)}/noche)\n` +
            discLine +
            petsLine +
            `   vs. ~${fmt(c.totalBooking)} en Booking.com → ahorro ~${fmt(c.savings)}\n` +
            `   ✓ Sin comisiones · Precio igual o mejor que cualquier plataforma\n`
          : `\n💰 ESTIMATED DIRECT PRICE\n` +
            `   ${fmt(c.directTotal)} total (${c.nights} nights × ~${fmt(c.avgPerNight)}/night)\n` +
            discLine +
            petsLine +
            `   vs. ~${fmt(c.totalBooking)} on Booking.com → saving ~${fmt(c.savings)}\n` +
            `   ✓ No fees · Same or better price than any platform\n`)
      : '';
    const nameBlock = name ? (lang === 'es' ? `\n👤 Nombre: ${name}` : `\n👤 Name: ${name}`) : '';
    const phoneBlock = phone ? (lang === 'es' ? `\n📱 Teléfono: ${phone}` : `\n📱 Phone: ${phone}`) : '';
    const emailBlock = email ? `\n📧 Email: ${email}` : '';
    const commBlock  = comments ? (lang === 'es' ? `\n💬 Comentarios: ${comments}` : `\n💬 Comments: ${comments}`) : '';

    if (lang === 'es') return (
      `¡Hola! Quiero reservar ${aptName}.\n\n` +
      `📅 Entrada: ${fmtDate(selStart)}\n` +
      `📅 Salida: ${fmtDate(selEnd)}\n` +
      `🌙 Noches: ${calc ? calc.nights : '?'}\n` +
      `👥 Huéspedes: ${guests}` +
      priceBlock +
      nameBlock + phoneBlock + emailBlock + commBlock + '\n\n' +
      `Solicito confirmación de disponibilidad y precio definitivo.\n¡Gracias!`
    );
    return (
      `Hello! I'd like to book ${aptName}.\n\n` +
      `📅 Check-in: ${fmtDate(selStart)}\n` +
      `📅 Check-out: ${fmtDate(selEnd)}\n` +
      `🌙 Nights: ${calc ? calc.nights : '?'}\n` +
      `👥 Guests: ${guests}` +
      priceBlock +
      nameBlock + phoneBlock + emailBlock + commBlock + '\n\n' +
      `I'd like to confirm availability and the final price.\nThank you!`
    );
  };

  const waNum  = lang === 'es' ? '34620316370' : '34654138251';
  const waHref = () => `https://wa.me/${waNum}?text=${encodeURIComponent(buildMsg())}`;
  const mailHref = () => {
    const subj = lang === 'es' ? `Solicitud reserva — ${aptName}` : `Booking request — ${aptName}`;
    return `mailto:info@hestiayourhome.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(buildMsg())}`;
  };

  const WaIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

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
              <span className="price-label-sm">{lang === 'es' ? 'Precio directo estimado' : 'Estimated direct price'}</span>
              <span className="price-direct-total">{fmt(calc.directTotal)}</span>
              <span className="price-avg-night">{fmt(calc.avgPerNight)}{lang === 'es' ? '/noche' : '/night'}</span>
            </div>
            <div className="price-right-col">
              <div className="price-booking-ref">
                <span className="price-ref-label">Booking.com</span>
                <span className="price-ref-val">{fmt(calc.totalBooking)}</span>
              </div>
              <div className="price-savings-badge">
                {lang === 'es' ? 'Ahorras' : 'You save'} ~{fmt(calc.savings)}
              </div>
            </div>
          </div>
          <div className="price-breakdown">
            <div className="price-line">
              <span>{lang === 'es' ? `${calc.nights} noches × precio variable` : `${calc.nights} nights × variable rate`}</span>
              <span>{fmt(calc.totalBooking)}</span>
            </div>
            <div className="price-line price-line-disc">
              <span>{lang === 'es' ? `−9 % reserva directa` : `−9 % direct booking`}</span>
              <span>−{fmt(calc.totalBooking - calc.afterDirect)}</span>
            </div>
            {calc.stayD && (
              <div className="price-line price-line-disc">
                <span>{lang === 'es' ? calc.stayD.es : calc.stayD.en}</span>
                <span>−{fmt(calc.stayDiscAmt)}</span>
              </div>
            )}
            {calc.petAmt > 0 && (
              <div className="price-line">
                <span>{lang === 'es' ? `Suplemento mascota (${calc.nights} × ${PET_SUPP_NIGHT}€)` : `Pet supplement (${calc.nights} × ${PET_SUPP_NIGHT}€)`}</span>
                <span>+{fmt(calc.petAmt)}</span>
              </div>
            )}
            <div className="price-line price-line-total">
              <span>{lang === 'es' ? 'Total estimado directo' : 'Estimated direct total'}</span>
              <span>{fmt(calc.directTotal)}</span>
            </div>
          </div>
          <p className="price-note">{lang === 'es'
            ? '* Estimación orientativa. Alex confirma el precio exacto en menos de 24 h. Limpieza final y depósito se confirman al reservar.'
            : '* Indicative estimate. Alex confirms the exact price within 24 h. Cleaning fee and deposit confirmed at booking.'}</p>
        </div>
      )}

      {/* Guests */}
      <div className="req-guests">
        <span className="req-guests-lbl">{lang === 'es' ? 'Huéspedes' : 'Guests'}</span>
        <div className="req-guests-ctrl">
          <button className="req-g-btn" onClick={() => setGuests(g => Math.max(1, g - 1))} aria-label="−">−</button>
          <span className="req-g-num">{guests}</span>
          <button className="req-g-btn" onClick={() => setGuests(g => Math.min(6, g + 1))} aria-label="+">+</button>
        </div>
        <label className="req-pets-toggle">
          <input type="checkbox" checked={pets} onChange={e => setPets(e.target.checked)}/>
          <span>{lang === 'es' ? '🐾 Mascota (+15€/noche)' : '🐾 Pet (+15€/night)'}</span>
        </label>
      </div>

      {/* Contact form */}
      <div className="req-contact-form">
        <div className="req-form-title">{lang === 'es' ? 'Tus datos (opcional pero recomendable)' : 'Your details (optional but recommended)'}</div>
        <div className="req-form-row">
          <input className="req-input" type="text" placeholder={lang === 'es' ? 'Nombre' : 'Name'} value={name} onChange={e => setName(e.target.value)}/>
          <input className="req-input" type="tel" placeholder={lang === 'es' ? 'Teléfono' : 'Phone'} value={phone} onChange={e => setPhone(e.target.value)}/>
        </div>
        <input className="req-input req-input-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
        <textarea className="req-textarea" placeholder={lang === 'es' ? 'Comentarios, preguntas, fechas alternativas…' : 'Comments, questions, alternative dates…'} value={comments} onChange={e => setComments(e.target.value)}/>
      </div>

      {/* Disclaimer */}
      <div className="req-disclaimer">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>{lang === 'es'
          ? <><strong>Solicitud de precio — no es una reserva.</strong> Alex confirma disponibilidad y precio exacto en menos de 24 horas. La reserva solo se formaliza si la confirmas tú.</>
          : <><strong>Price request — not a booking.</strong> Alex confirms availability and exact price within 24 hours. The booking is only made when you confirm it.</>}</p>
      </div>

      {/* CTAs */}
      <div className="req-actions">
        <a href={waHref()} className="btn btn-primary req-btn-wa" target="_blank" rel="noopener">
          <WaIcon/>
          {lang === 'es' ? 'Solicitar reserva — WhatsApp' : 'Request booking — WhatsApp'}
          <span className="arrow"> →</span>
        </a>
        <a href={mailHref()} className="btn btn-ghost-dark req-btn-mail">
          {lang === 'es' ? 'Solicitar por email' : 'Request by email'}
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

  const blocked      = data ? data.blocked       : [];
  const updated      = data ? data.updated       : null;
  const sources      = data ? data.sources       : [];
  const fetchErrors  = data ? (data.fetch_errors || {}) : {};
  const hasSyncError = Object.keys(fetchErrors).length > 0;
  const isDemo       = data ? data.demo          : false;

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
