// ================================================================
// HESTÍA — Disponibilidad en tiempo real
// Lee docs/assets/availability.json (generado por GitHub Action)
// ================================================================

const _CM = {
  months_es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  months_en: ['January','February','March','April','May','June',
               'July','August','September','October','November','December'],
  wd_es: ['Lu','Ma','Mi','Ju','Vi','Sá','Do'],
  wd_en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
};

const _adj = (ds, n) => {
  const d = new Date(ds + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const _isBlk = (ds, blocked) =>
  blocked.some(r => ds >= r.start && ds < r.end);

// --- Single month grid ---
const CalMonth = ({ year, month, blocked, lang, todayStr }) => {
  const wds   = lang === 'es' ? _CM.wd_es : _CM.wd_en;
  const mName = (lang === 'es' ? _CM.months_es : _CM.months_en)[month];
  const nDays = new Date(year, month + 1, 0).getDate();

  let firstDow = new Date(year, month, 1).getDay();
  firstDow = firstDow === 0 ? 6 : firstDow - 1; // Mon = 0

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ empty: true, k: `e${i}` });
  for (let d = 1; d <= nDays; d++) cells.push({ d, k: d });

  return (
    <div className="cal-month">
      <div className="cal-mhd">
        {mName} <span className="cal-yr">{year}</span>
      </div>
      <div className="cal-grid">
        {wds.map(w => <div key={w} className="cal-wd">{w}</div>)}
        {cells.map(cell => {
          if (cell.empty) return <div key={cell.k} className="cal-cell cal-empty"/>;
          const { d } = cell;
          const ds      = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isPast  = ds < todayStr;
          const isToday = ds === todayStr;
          const isBlk   = _isBlk(ds, blocked);
          const prevBlk = isBlk && _isBlk(_adj(ds, -1), blocked);
          const nextBlk = isBlk && _isBlk(_adj(ds,  1), blocked);
          const isStart = isBlk && !prevBlk;
          const isEnd   = isBlk && !nextBlk;
          const isSingle= isStart && isEnd;
          const isMid   = isBlk && !isStart && !isEnd;

          return (
            <div
              key={d}
              className={[
                'cal-cell',
                isPast   && 'past',
                isToday  && 'today',
                isBlk    && 'blk',
                isSingle && 'blk-x',
                isStart && !isSingle && 'blk-s',
                isEnd   && !isSingle && 'blk-e',
                isMid    && 'blk-m',
              ].filter(Boolean).join(' ')}
            >
              {/* Horizontal strip connecting range days */}
              {isBlk && !isSingle && isStart  && <div className="c-strip c-sr"/>}
              {isBlk && !isSingle && isEnd    && <div className="c-strip c-sl"/>}
              {isBlk && isMid                 && <div className="c-strip"/>}
              {/* Filled circle on start / end / single blocked */}
              {isBlk && (isStart || isEnd || isSingle) && <div className="c-circ"/>}
              {/* Today ring */}
              {isToday && <div className="c-today"/>}
              <span className="c-n">{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main calendar section ---
const AptCalendar = ({ aptId, lang, accent }) => {
  const [data,    setData   ] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const [bYear,  setBYear ] = React.useState(now.getFullYear());
  const [bMonth, setBMonth] = React.useState(now.getMonth());

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && j[aptId]) setData(j[aptId]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [aptId]);

  const blocked  = data ? data.blocked  : [];
  const updated  = data ? data.updated  : null;
  const sources  = data ? data.sources  : [];
  const isDemo   = data ? data.demo     : false;

  const m2y = bMonth === 11 ? bYear + 1 : bYear;
  const m2m = bMonth === 11 ? 0 : bMonth + 1;

  const canPrev = !(bYear === now.getFullYear() && bMonth <= now.getMonth());

  const goPrev = () => {
    if (!canPrev) return;
    if (bMonth === 0) { setBYear(y => y - 1); setBMonth(11); }
    else setBMonth(m => m - 1);
  };
  const goNext = () => {
    if (bMonth === 11) { setBYear(y => y + 1); setBMonth(0); }
    else setBMonth(m => m + 1);
  };

  const months = lang === 'es' ? _CM.months_es : _CM.months_en;
  const navLbl = `${months[bMonth]} · ${months[m2m]} ${m2y}`;

  const fmtUpdated = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    const p = n => String(n).padStart(2, '0');
    return lang === 'es'
      ? `${d.getDate()} ${months[d.getMonth()].slice(0,3).toLowerCase()}. · ${p(d.getHours())}:${p(d.getMinutes())}`
      : `${months[d.getMonth()].slice(0,3)} ${d.getDate()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  return (
    <section className="apt-avail" style={{ '--apt-accent': accent }}>

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
            ? 'Calendario sincronizado desde Booking.com y Airbnb. Reserva directamente con Alex o Fran — sin intermediarios ni comisiones.'
            : 'Calendar synced from Booking.com and Airbnb. Book directly with Alex or Fran — no middlemen, no commissions.'}
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

      {/* Month navigation */}
      <div className="avail-nav">
        <button
          className={`avail-arr${canPrev ? '' : ' off'}`}
          onClick={goPrev}
          aria-label={lang === 'es' ? 'Mes anterior' : 'Previous month'}
        >‹</button>
        <span className="avail-nav-lbl">{navLbl}</span>
        <button
          className="avail-arr"
          onClick={goNext}
          aria-label={lang === 'es' ? 'Mes siguiente' : 'Next month'}
        >›</button>
      </div>

      {/* Calendars */}
      {loading ? (
        <div className="avail-months">
          <div className="cal-month cal-skel"/>
          <div className="cal-month cal-skel"/>
        </div>
      ) : (
        <div className="avail-months">
          <CalMonth year={bYear} month={bMonth} blocked={blocked} lang={lang} todayStr={todayStr}/>
          <CalMonth year={m2y}   month={m2m}    blocked={blocked} lang={lang} todayStr={todayStr}/>
        </div>
      )}

      {/* Footer — legend + metadata */}
      <div className="avail-foot">
        <div className="avail-legend">
          <span className="leg-item">
            <span className="leg-dot lg-av"/>
            {lang === 'es' ? 'Disponible' : 'Available'}
          </span>
          <span className="leg-sep">·</span>
          <span className="leg-item">
            <span className="leg-dot lg-bk"/>
            {lang === 'es' ? 'Reservado' : 'Booked'}
          </span>
        </div>
        <div className="avail-meta">
          {updated && (
            <span className="avail-upd">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {fmtUpdated(updated)}
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

      {/* CTA */}
      <div className="avail-cta-wrap">
        <a href="https://wa.me/34620316370" className="btn btn-primary" target="_blank" rel="noopener">
          {lang === 'es' ? 'Reservar estas fechas — WhatsApp' : 'Book these dates — WhatsApp'}
          <span className="arrow"> →</span>
        </a>
        <span className="avail-cta-note">
          {lang === 'es'
            ? 'Alex confirma en menos de 24 h · Sin comisiones'
            : 'Alex confirms within 24 h · No commissions'}
        </span>
      </div>

    </section>
  );
};

Object.assign(window, { AptCalendar, CalMonth });
