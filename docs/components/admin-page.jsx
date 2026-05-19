// ============================================================
// HESTÍA · ADMIN — /p-edit.html
// Editor de docs/data/prices.json + docs/data/reviews.json.
// Login con GitHub PAT (permiso contents:write sobre el repo).
// El token vive solo en memoria — nunca en el repo ni localStorage.
// Tabs: [ Pricing ] [ Reviews ]
// ============================================================

const REPO   = 'aberruezo-ops/hestia';
const PATH         = 'docs/data/prices.json';
const REVIEWS_PATH = 'docs/data/reviews.json';
const BRANCH = 'main';
const API    = 'https://api.github.com';

// Cloudflare Web Analytics — Worker proxy + identificadores (no secretos)
const CF_WORKER_URL = 'https://little-night-9399.hestia-vera-almeria.workers.dev/';
const CF_ACCOUNT    = 'ccb910d549f39e3bad5d89e33315d57e';
const CF_SITE_TAG   = '770c05669c6b45ea8f1026576fe7dcce';

// URL del Worker de Cloudflare que escribe en Google Sheets.
// Déjalo vacío hasta completar SETUP-SHEETS-SYNC.md.
const SHEETS_WORKER_URL = '';

const apiHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Accept':        'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

// ============================================================
// CONTRATO — datos por apartamento (variantes de la plantilla
// unificada en docs/contracts/template-base.md).
// ============================================================
const APT_CONTRACT_DATA = {
  vm: {
    name: 'Hestía Vera Mar',
    shortName: 'Mar',
    heroPhoto: 'assets/apt-vm-gallery-1.jpg',
    direccion: 'Apto. 1A, del portal 14, edificio 3, en la urbanización Paraíso Playa, en C/ Islas Canarias, 7',
    plazaGaraje: '160',
    zonaObras: 'enfrente',
    bloqueAccesibilidad: true,
    bloqueSabanas: 'Un juego de sábanas para la cama de matrimonio y dos juegos de sábanas para las camas individuales.',
  },
  vt: {
    name: 'Hestía Vera Thalassa',
    shortName: 'Thalassa',
    heroPhoto: 'assets/apt-vt-gallery-01.jpg',
    direccion: 'Apto. 11, planta 5ª, escalera 13, en la urbanización Thalassa, en C/ Tomillo 2',
    plazaGaraje: '163',
    zonaObras: 'cercanas',
    bloqueAccesibilidad: false,
    bloqueSabanas: 'Un juego de sábanas para la cama doble (D1) y un juego para cada cama individual del dormitorio dos (D2).',
  },
  vs: {
    name: 'Hestía Vera Salinas',
    shortName: 'Salinas',
    heroPhoto: 'assets/apt-vs-gallery-1.jpg',
    direccion: 'Apto. 7, planta 1ª, bloque 22, en la urbanización Pueblo Salinas, en C/ Alcazaba 115',
    plazaGaraje: '290',
    zonaObras: 'cercanas',
    bloqueAccesibilidad: false,
    bloqueSabanas: 'Dos juegos de sábanas para la cama de matrimonio y sofá-cama y un juego de sábanas por cada cama individual del dormitorio dos.',
  },
};

// Conversión de número entero a letras en español (mayúsculas).
// Soporta 0–999999. Usa "Y" entre decena y unidad (TREINTA Y UNO).
// Caso especial 21-29: VEINTIUNO, VEINTIDÓS, … en una palabra.
function numToSpanish(n) {
  n = Math.trunc(n);
  if (n === 0) return 'CERO';
  if (n < 0) return 'MENOS ' + numToSpanish(-n);
  const u = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  const teens = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
  const tw = ['VEINTE','VEINTIUNO','VEINTIDÓS','VEINTITRÉS','VEINTICUATRO','VEINTICINCO','VEINTISÉIS','VEINTISIETE','VEINTIOCHO','VEINTINUEVE'];
  const tens = ['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const hu = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  function under1000(n) {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    let r = '';
    const h = Math.floor(n / 100);
    if (h > 0) r += hu[h] + ' ';
    n %= 100;
    if (n === 0) return r.trim();
    if (n < 10) return (r + u[n]).trim();
    if (n < 20) return (r + teens[n - 10]).trim();
    if (n < 30) return (r + tw[n - 20]).trim();
    const t = Math.floor(n / 10), un = n % 10;
    r += tens[t];
    if (un > 0) r += ' Y ' + u[un];
    return r.trim();
  }
  let r = '';
  if (n >= 1000) {
    const th = Math.floor(n / 1000);
    if (th === 1) r += 'MIL ';
    else r += under1000(th) + ' MIL ';
    n %= 1000;
  }
  r += under1000(n);
  return r.trim();
}

// Formateo de fecha "DD de MES de AAAA" en español.
function fmtFechaEs(date) {
  const meses = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  const d = (typeof date === 'string') ? new Date(date + 'T12:00:00') : date;
  return `${String(d.getDate()).padStart(2,'0')} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}
function fmtFechaCorta(date) {
  const d = (typeof date === 'string') ? new Date(date + 'T12:00:00') : date;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
function diffNoches(entradaIso, salidaIso) {
  if (!entradaIso || !salidaIso) return 0;
  const a = new Date(entradaIso + 'T00:00:00');
  const b = new Date(salidaIso + 'T00:00:00');
  return Math.max(0, Math.round((b - a) / (24*60*60*1000)));
}

// base64 ↔ utf-8 (atob/btoa no manejan UTF-8 directamente)
const utf8ToB64 = (s) => btoa(unescape(encodeURIComponent(s)));
const b64ToUtf8 = (s) => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));

// ============================================================
// validateYearCoverage — para un año dado, comprueba que cada
// día está cubierto por exactamente una temporada/especial. Los
// puentes no cuentan: solo bumpean +1 grado, no asignan
// temporada base.
//
// Returns { gaps: [{start, end}], overlaps: [{start, end, sources}] }.
// ============================================================
const validateYearCoverage = (year, cal) => {
  const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const daysInMonth = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const totalDays = daysInMonth.reduce((a, b) => a + b, 0);

  // Mapa día (ISO) → array de fuentes ('season:baja', 'special:semSanta'…)
  const daySources = new Map();
  const fillRange = (sIso, eIso, label) => {
    if (!sIso || !eIso) return;
    const [sy, sm, sd] = sIso.split('-').map(Number);
    const [ey, em, ed] = eIso.split('-').map(Number);
    const cur = new Date(Date.UTC(sy, sm - 1, sd));
    const end = new Date(Date.UTC(ey, em - 1, ed));
    while (cur <= end) {
      const k = cur.toISOString().slice(0, 10);
      if (!daySources.has(k)) daySources.set(k, []);
      daySources.get(k).push(label);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  };

  for (const sid of Object.keys(cal.seasons || {})) {
    for (const r of cal.seasons[sid] || []) fillRange(r[0], r[1], `season:${sid}`);
  }
  for (const spid of Object.keys(cal.specials || {})) {
    const sp = cal.specials[spid];
    for (const r of sp.ranges || []) fillRange(r[0], r[1], `special:${spid}`);
  }

  // Walk year, build gaps and overlaps en rangos contiguos
  const gaps = [];
  const overlaps = [];
  let curGap = null;
  let curOverlap = null;

  const cur = new Date(Date.UTC(year, 0, 1));
  const endY = new Date(Date.UTC(year, 11, 31));
  while (cur <= endY) {
    const k = cur.toISOString().slice(0, 10);
    const sources = daySources.get(k) || [];

    if (sources.length === 0) {
      if (!curGap) curGap = { start: k, end: k };
      else curGap.end = k;
      if (curOverlap) { overlaps.push(curOverlap); curOverlap = null; }
    } else {
      if (curGap) { gaps.push(curGap); curGap = null; }
      if (sources.length > 1) {
        const key = sources.slice().sort().join(',');
        if (!curOverlap || curOverlap.key !== key) {
          if (curOverlap) overlaps.push(curOverlap);
          curOverlap = { start: k, end: k, sources: sources.slice().sort(), key };
        } else {
          curOverlap.end = k;
        }
      } else {
        if (curOverlap) { overlaps.push(curOverlap); curOverlap = null; }
      }
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  if (curGap) gaps.push(curGap);
  if (curOverlap) overlaps.push(curOverlap);

  return { gaps, overlaps, totalDays };
};

// Etiqueta humana de una "fuente" (season:alta → "alta", special:semSanta → "Semana Santa").
const sourceLabel = (src, cal, seasons) => {
  if (src.startsWith('season:')) {
    const id = src.slice(7);
    return (seasons[id] && seasons[id].label) || id;
  }
  if (src.startsWith('special:')) {
    const id = src.slice(8);
    const sp = cal.specials && cal.specials[id];
    return (sp && sp.label) || id;
  }
  return src;
};

// ============================================================
// CalendarEditor — UI estructurada para editar el calendario.
// Lee/escribe el mismo JSON que el textarea (fuente única) pero
// con tablas por año + secciones de especiales y puentes. El
// textarea avanzado se mantiene plegado para edición libre.
// ============================================================
const CalendarEditor = ({ calJson, setCalJson, updateCalJson, calOk, calErr, seasons }) => {
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  // Parseamos el JSON cada vez. Si está roto, no renderizamos las
  // tablas (el usuario tiene que arreglarlo en el textarea avanzado).
  let parsed = null;
  try { parsed = JSON.parse(calJson); } catch (e) {}
  const ok = parsed && parsed.calendar && parsed.bookingHorizon;

  const writeBack = (next) => {
    setCalJson(JSON.stringify(next, null, 2));
    updateCalJson(JSON.stringify(next, null, 2));
  };

  // Helpers que mutan el árbol y persisten al textarea.
  const updateRange = (year, kind, key, idx, side, value) => {
    if (!parsed) return;
    const next = JSON.parse(JSON.stringify(parsed));
    if (kind === 'seasons') {
      next.calendar[year].seasons[key][idx][side === 'start' ? 0 : 1] = value;
    } else if (kind === 'specials') {
      next.calendar[year].specials[key].ranges[idx][side === 'start' ? 0 : 1] = value;
    } else if (kind === 'bridges') {
      next.calendar[year].bridges[idx].ranges[0][side === 'start' ? 0 : 1] = value;
    }
    writeBack(next);
  };
  const removeRange = (year, kind, key, idx) => {
    if (!parsed) return;
    const next = JSON.parse(JSON.stringify(parsed));
    if (kind === 'seasons') next.calendar[year].seasons[key].splice(idx, 1);
    else if (kind === 'specials') next.calendar[year].specials[key].ranges.splice(idx, 1);
    else if (kind === 'bridges') next.calendar[year].bridges.splice(idx, 1);
    writeBack(next);
  };
  const addRange = (year, kind, key) => {
    if (!parsed) return;
    const next = JSON.parse(JSON.stringify(parsed));
    const today = `${year}-01-01`;
    if (kind === 'seasons') {
      if (!next.calendar[year].seasons[key]) next.calendar[year].seasons[key] = [];
      next.calendar[year].seasons[key].push([today, today]);
    } else if (kind === 'specials') {
      next.calendar[year].specials[key].ranges.push([today, today]);
    } else if (kind === 'bridges') {
      next.calendar[year].bridges.push({ name: 'Nuevo puente', ranges: [[today, today]] });
    }
    writeBack(next);
  };
  const updateBridgeName = (year, idx, name) => {
    if (!parsed) return;
    const next = JSON.parse(JSON.stringify(parsed));
    next.calendar[year].bridges[idx].name = name;
    writeBack(next);
  };
  const updateHorizon = (value) => {
    if (!parsed) return;
    const next = JSON.parse(JSON.stringify(parsed));
    next.bookingHorizon.lastCheckinDate = value;
    writeBack(next);
  };

  if (!ok) {
    return (
      <div className="pe-card">
        <h2>Calendario y horizonte de reservas</h2>
        <div className="pe-error">JSON inválido — {calErr}. Edita el bloque avanzado abajo para arreglarlo.</div>
        <textarea
          value={calJson}
          onChange={e => updateCalJson(e.target.value)}
          rows={20}
          className="pe-textarea pe-mono"
          spellCheck="false"
        />
      </div>
    );
  }

  const years = Object.keys(parsed.calendar).sort();
  const seasonIds = Object.keys(seasons);

  return (
    <>
      <div className="pe-card">
        <h2>Horizonte de reservas</h2>
        <div className="pe-grid">
          <div className="pe-field">
            <label>Última fecha de check-in permitida</label>
            <input
              type="date"
              value={parsed.bookingHorizon.lastCheckinDate}
              onChange={e => updateHorizon(e.target.value)}
              className="pe-input"
            />
            <small className="pe-hint">{parsed.bookingHorizon.reason}</small>
          </div>
        </div>
      </div>

      {years.map(year => {
        const cal = parsed.calendar[year];
        const valid = validateYearCoverage(Number(year), cal);
        const okCoverage = valid.gaps.length === 0 && valid.overlaps.length === 0;
        return (
          <div key={year} className="pe-card">
            <h2>Calendario {year} · temporadas</h2>
            {okCoverage ? (
              <div className="pe-success pe-validate-ok">
                ✓ {valid.totalDays} días cubiertos · sin huecos ni solapamientos
              </div>
            ) : (
              <div className="pe-validate">
                {valid.gaps.length > 0 && (
                  <div className="pe-validate-block pe-validate-gaps">
                    <strong>{valid.gaps.length} hueco(s) sin temporada — añade un rango que los cubra:</strong>
                    <ul>
                      {valid.gaps.map((g, i) => (
                        <li key={i}>
                          {g.start === g.end ? g.start : `${g.start} → ${g.end}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {valid.overlaps.length > 0 && (
                  <div className="pe-validate-block pe-validate-overlaps">
                    <strong>{valid.overlaps.length} solapamiento(s) — un día solo puede pertenecer a una temporada o especial:</strong>
                    <ul>
                      {valid.overlaps.map((o, i) => (
                        <li key={i}>
                          {o.start === o.end ? o.start : `${o.start} → ${o.end}`}
                          <span className="pe-validate-sources">
                            {' '}— {o.sources.map(s => sourceLabel(s, cal, seasons)).join(' + ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="pe-cal-seasons">
              {seasonIds.map(sid => {
                const s = seasons[sid];
                const ranges = cal.seasons[sid] || [];
                return (
                  <div key={sid} className="pe-cal-card" style={{'--season-c': s.color}}>
                    <div className="pe-cal-card-head">
                      <span className="pe-dot" style={{ background: s.color }} />
                      <strong>{s.label}</strong>
                      <span className="pe-cal-mult">×{s.multiplier}</span>
                      <button
                        type="button"
                        className="pe-cal-add"
                        onClick={() => addRange(year, 'seasons', sid)}
                        aria-label="Añadir rango"
                      >+</button>
                    </div>
                    {ranges.length === 0 ? (
                      <div className="pe-cal-empty">Sin rangos</div>
                    ) : (
                      <div className="pe-cal-ranges">
                        {ranges.map((r, i) => (
                          <div key={i} className="pe-cal-range">
                            <input type="date" value={r[0]}
                              onChange={e => updateRange(year, 'seasons', sid, i, 'start', e.target.value)}
                              className="pe-input pe-input-date" />
                            <span className="pe-cal-arrow">→</span>
                            <input type="date" value={r[1]}
                              onChange={e => updateRange(year, 'seasons', sid, i, 'end', e.target.value)}
                              className="pe-input pe-input-date" />
                            <button type="button" className="pe-cal-remove"
                              onClick={() => removeRange(year, 'seasons', sid, i)}
                              aria-label="Eliminar">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="pe-h3">Especiales</h3>
            <div className="pe-cal-seasons">
              {Object.entries(cal.specials || {}).map(([sid, sp]) => (
                <div key={sid} className="pe-cal-card pe-cal-card-special">
                  <div className="pe-cal-card-head">
                    <strong>{sp.label || sid}</strong>
                    <span className="pe-cal-mult">{sp.season}</span>
                    <button
                      type="button"
                      className="pe-cal-add"
                      onClick={() => addRange(year, 'specials', sid)}
                      aria-label="Añadir rango"
                    >+</button>
                  </div>
                  <div className="pe-cal-ranges">
                    {sp.ranges.map((r, i) => (
                      <div key={i} className="pe-cal-range">
                        <input type="date" value={r[0]}
                          onChange={e => updateRange(year, 'specials', sid, i, 'start', e.target.value)}
                          className="pe-input pe-input-date" />
                        <span className="pe-cal-arrow">→</span>
                        <input type="date" value={r[1]}
                          onChange={e => updateRange(year, 'specials', sid, i, 'end', e.target.value)}
                          className="pe-input pe-input-date" />
                        <button type="button" className="pe-cal-remove"
                          onClick={() => removeRange(year, 'specials', sid, i)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pe-cal-bridges-h">
              <h3 className="pe-h3">Puentes nacionales <span className="pe-hint">+1 grado de temporada</span></h3>
              <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
                onClick={() => addRange(year, 'bridges')}>+ Puente</button>
            </div>
            <div className="pe-cal-bridges">
              {(cal.bridges || []).map((b, i) => (
                <div key={i} className="pe-cal-bridge">
                  <input type="text" value={b.name}
                    onChange={e => updateBridgeName(year, i, e.target.value)}
                    className="pe-input pe-cal-bridge-name"
                    placeholder="Nombre del puente" />
                  <input type="date" value={b.ranges[0][0]}
                    onChange={e => updateRange(year, 'bridges', null, i, 'start', e.target.value)}
                    className="pe-input pe-input-date" />
                  <span className="pe-cal-arrow">→</span>
                  <input type="date" value={b.ranges[0][1]}
                    onChange={e => updateRange(year, 'bridges', null, i, 'end', e.target.value)}
                    className="pe-input pe-input-date" />
                  <button type="button" className="pe-cal-remove"
                    onClick={() => removeRange(year, 'bridges', null, i)}>×</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="pe-card">
        <button type="button" className="pe-btn pe-btn-ghost"
          onClick={() => setAdvancedOpen(o => !o)}>
          {advancedOpen ? '▼ Ocultar JSON avanzado' : '▶ Edición avanzada (JSON)'}
        </button>
        {advancedOpen && (
          <>
            <p className="pe-lede">Para cambios masivos, paste/copy de un año entero, o cuando quieras añadir un año nuevo. Los cambios aquí se reflejan en las tablas de arriba.</p>
            <textarea
              value={calJson}
              onChange={e => updateCalJson(e.target.value)}
              rows={20}
              className="pe-textarea pe-mono"
              spellCheck="false"
            />
            {!calOk && <div className="pe-error">JSON inválido — {calErr}</div>}
          </>
        )}
      </div>
    </>
  );
};

// ============================================================
// REVIEWS — modelo + componentes de la pestaña Reviews
// ============================================================
const REVIEW_SOURCES = [
  { id: 'booking', label: 'Booking.com', short: 'Booking', color: '#003B95' },
  { id: 'airbnb',  label: 'Airbnb',      short: 'Airbnb',  color: '#FF5A5F' },
  { id: 'google',  label: 'Google',      short: 'Google',  color: '#4285F4' },
  { id: 'web',     label: 'Web propia',  short: 'Web',     color: '#3D1A35' },
];
const REVIEW_APTS = [
  { id: 'vm', label: 'Hestía Mar' },
  { id: 'vt', label: 'Hestía Thalassa' },
  { id: 'vs', label: 'Hestía Salinas' },
  { id: 'all', label: 'Sin asignar' },
];
const newReviewId = (source) => {
  const prefix = source === 'booking' ? 'bk' : source === 'airbnb' ? 'ab' : source === 'google' ? 'go' : 'wb';
  return `${prefix}-${Date.now().toString(36)}`;
};
const todayIso = () => new Date().toISOString().slice(0, 10);

const ReviewRow = ({ review, onChange, onRemove }) => {
  const [expanded, setExpanded] = React.useState(false);
  const sourceMeta = REVIEW_SOURCES.find(s => s.id === review.source) || REVIEW_SOURCES[3];
  const aptMeta   = REVIEW_APTS.find(a => a.id === review.apt) || { label: review.apt };
  const isPending = review.status === 'pending';
  const dateLbl = review.date ? review.date.slice(0, 7) : '—';
  const snippet = (review.text || '').slice(0, 110);
  const ratingLbl = review.source === 'booking'
    ? `${review.rating}/10`
    : `${review.rating}/5`;

  return (
    <div className={`pe-card pe-rev-row${isPending ? ' pe-rev-pending' : ''}${expanded ? ' is-expanded' : ' is-collapsed'}`}>
      <button
        type="button"
        className="pe-rev-row-summary"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <span className="pe-rev-row-chevron" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
        <span className="pe-rev-status" style={{ background: isPending ? 'var(--warn, #C8975A)' : 'var(--ok, #6B7A3A)' }}>
          {isPending ? 'PEND' : 'PUB'}
        </span>
        <span className="pe-rev-source-badge" style={{ background: sourceMeta.color, color: '#fff' }}>
          {sourceMeta.short}
        </span>
        <span className="pe-rev-apt-badge">{aptMeta.label}</span>
        <span className="pe-rev-date-cell">{dateLbl}</span>
        <span className="pe-rev-name-cell">{review.name || '—'}</span>
        <span className="pe-rev-country-cell">{review.country || ''}</span>
        <span className="pe-rev-rating-cell">{ratingLbl}{review.highlight ? ' ✦' : ''}</span>
        <span className="pe-rev-snippet">{snippet}{review.text && review.text.length > 110 ? '…' : ''}</span>
      </button>

      {expanded && (
        <div className="pe-rev-row-body">
          <div className="pe-rev-head">
            <span className="pe-rev-id">{review.id}</span>
            <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm pe-rev-del" onClick={onRemove}>× Eliminar</button>
          </div>
          <div className="pe-rev-grid">
            <div className="pe-field">
              <label>Estado</label>
              <select value={review.status || 'pending'} onChange={e => onChange('status', e.target.value)} className="pe-input">
                <option value="pending">Pendiente</option>
                <option value="published">Publicada</option>
              </select>
            </div>
            <div className="pe-field">
              <label>Fuente</label>
              <select value={review.source} onChange={e => onChange('source', e.target.value)} className="pe-input">
                {REVIEW_SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="pe-field">
              <label>Hestía</label>
              <select value={review.apt} onChange={e => onChange('apt', e.target.value)} className="pe-input">
                {REVIEW_APTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            <div className="pe-field">
              <label>Nombre</label>
              <input type="text" value={review.name || ''} onChange={e => onChange('name', e.target.value)} className="pe-input"/>
            </div>
            <div className="pe-field">
              <label>País (ISO 2)</label>
              <input type="text" maxLength={2} value={review.country || ''} onChange={e => onChange('country', e.target.value.toUpperCase())} className="pe-input"/>
            </div>
            <div className="pe-field">
              <label>Fecha</label>
              <input type="date" value={review.date || ''} onChange={e => onChange('date', e.target.value)} className="pe-input"/>
            </div>
            <div className="pe-field">
              <label>Rating ({review.source === 'booking' ? '/10' : '/5'})</label>
              <input type="number" min={0} max={review.source === 'booking' ? 10 : 5} step={0.1}
                value={review.rating} onChange={e => onChange('rating', Number(e.target.value))} className="pe-input"/>
            </div>
            <div className="pe-field">
              <label>Idioma</label>
              <select value={review.lang || 'es'} onChange={e => onChange('lang', e.target.value)} className="pe-input">
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>
          <div className="pe-field" style={{marginTop: 12}}>
            <label>Texto</label>
            <textarea rows={3} value={review.text || ''} onChange={e => onChange('text', e.target.value)} className="pe-textarea"/>
          </div>
          <div className="pe-field" style={{marginTop: 12, flexDirection:'row', alignItems:'center', gap:8, display:'flex'}}>
            <input type="checkbox" id={`hl-${review.id}`} checked={!!review.highlight} onChange={e => onChange('highlight', e.target.checked)}/>
            <label htmlFor={`hl-${review.id}`} style={{cursor:'pointer'}}>
              ✦ Destacar como "Más relevante" en /opiniones
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Parser para extraer una review del cuerpo del email que llega desde
// /escribir-opinion vía Web3Forms. Web3Forms manda los campos del form
// como pares "Label: valor" (idéntico a los nombres que usamos en
// FormData en escribir-opinion-page.jsx). Buscamos por etiqueta con
// alias ES/EN; "Opinión" se captura como texto multi-línea hasta el
// siguiente label.
const REV_PARSE_FIELDS = {
  hestia:  ['Hestía', 'Hestia'],
  rating:  ['Valoración', 'Valoracion', 'Rating'],
  name:    ['Nombre', 'Name', 'from_name'],
  email:   ['Email', 'Correo'],
  dates:   ['Fechas', 'Fecha', 'Date'],
  lang:    ['Idioma', 'Language'],
  pin:     ['PIN guía', 'PIN reserva', 'PIN'],
  text:    ['Opinión', 'Opinion', 'Review', 'Comentarios'],
};
const REV_MONTHS = {
  enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06',
  julio:'07', agosto:'08', septiembre:'09', octubre:'10', noviembre:'11', diciembre:'12',
  january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
  july:'07', august:'08', september:'09', october:'10', november:'11', december:'12',
};
const parseFieldOneLine = (raw, labels) => {
  for (const lbl of labels) {
    // Match "Label : value" (también ::, ：, sin :) hasta fin de línea
    const re = new RegExp(`(?:^|\\n)\\s*${lbl.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*[:：]\\s*([^\\n\\r]+)`, 'i');
    const m = raw.match(re);
    if (m && m[1].trim()) return m[1].trim();
  }
  return '';
};
const parseFieldMultiLine = (raw, labels) => {
  for (const lbl of labels) {
    const lblEsc = lbl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Captura desde "Label:" hasta el siguiente label conocido o final
    const stop = Object.values(REV_PARSE_FIELDS).flat().filter(l => l !== lbl).map(l => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const re = new RegExp(`(?:^|\\n)\\s*${lblEsc}\\s*[:：]\\s*([\\s\\S]+?)(?=\\n\\s*(?:${stop})\\s*[:：]|$)`, 'i');
    const m = raw.match(re);
    if (m && m[1].trim()) return m[1].trim();
  }
  return '';
};

const parseEmailToReview = (raw) => {
  const hestiaText = parseFieldOneLine(raw, REV_PARSE_FIELDS.hestia);
  const apt = /Mar\b/i.test(hestiaText)      ? 'vm'
            : /Thalassa/i.test(hestiaText)   ? 'vt'
            : /Salinas/i.test(hestiaText)    ? 'vs'
            : 'vm';

  const rRaw = parseFieldOneLine(raw, REV_PARSE_FIELDS.rating);
  const rMatch = rRaw.match(/(\d+(?:[.,]\d+)?)/);
  const rating = rMatch ? Number(rMatch[1].replace(',', '.')) : 5;

  const name  = parseFieldOneLine(raw, REV_PARSE_FIELDS.name);
  const email = parseFieldOneLine(raw, REV_PARSE_FIELDS.email);

  const datesText = parseFieldOneLine(raw, REV_PARSE_FIELDS.dates);
  let date = todayIso();
  if (datesText) {
    const lower = datesText.toLowerCase();
    const yMatch = datesText.match(/\b(20\d\d)\b/);
    if (yMatch) {
      let mo = '01';
      for (const [n, num] of Object.entries(REV_MONTHS)) {
        if (lower.includes(n)) { mo = num; break; }
      }
      date = `${yMatch[1]}-${mo}-15`;
    }
  }

  const langText = parseFieldOneLine(raw, REV_PARSE_FIELDS.lang);
  const lang = /english|inglés|ingles|\ben\b/i.test(langText) ? 'en' : 'es';

  const text = parseFieldMultiLine(raw, REV_PARSE_FIELDS.text);

  return { apt, rating, name, email, date, lang, text };
};

const PasteFromEmail = ({ onAdd, onCancel }) => {
  const [raw, setRaw]       = React.useState('');
  const [parsed, setParsed] = React.useState(null);
  const [err, setErr]       = React.useState('');

  const doParse = () => {
    setErr('');
    if (raw.trim().length < 20) {
      setErr('Pega primero el cuerpo del email.');
      setParsed(null);
      return;
    }
    const p = parseEmailToReview(raw);
    if (!p.name && !p.text) {
      setErr('No he podido extraer nombre ni texto. Asegúrate de pegar el cuerpo completo del email.');
      setParsed(null);
      return;
    }
    setParsed(p);
  };

  const accept = () => {
    if (!parsed) return;
    onAdd({
      id: newReviewId('web'),
      source: 'web',
      apt: parsed.apt,
      name: parsed.name || '—',
      country: '',
      date: parsed.date,
      rating: Number(parsed.rating) || 5,
      lang: parsed.lang,
      text: parsed.text || '',
      highlight: false,
      status: 'pending',
    });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); doParse(); }}>
      <h3 className="pe-h3">📋 Pegar desde email</h3>
      <p className="pe-hint" style={{marginBottom:12}}>
        Pega el cuerpo del email que llega desde <code>/escribir-opinion</code>.
        Extraigo Hestía, valoración, nombre, email, fechas, idioma y texto.
        Se añade como <strong>PENDIENTE</strong> para revisar antes de publicar.
      </p>
      <textarea
        rows={10}
        value={raw}
        onChange={e => { setRaw(e.target.value); setParsed(null); setErr(''); }}
        className="pe-textarea"
        placeholder={'Hestía: Hestía Mar\nValoración: 5/5\nNombre: María G.\nEmail: maria@email.com\nFechas: Agosto 2024\nIdioma: Español\nOpinión: La estancia fue maravillosa...'}
        autoFocus
      />
      <div className="pe-actions" style={{marginTop:12}}>
        <button type="submit" className="pe-btn pe-btn-primary">Parsear</button>
        <button type="button" onClick={onCancel} className="pe-btn pe-btn-ghost">Cancelar</button>
        {raw && (
          <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
            onClick={() => { setRaw(''); setParsed(null); setErr(''); }}>Limpiar</button>
        )}
      </div>
      {err && <p className="pe-paste-err" style={{marginTop:10}}>{err}</p>}
      {parsed && (
        <div className="pe-paste-preview">
          <div className="pe-paste-preview-head">
            <span className="pe-paste-preview-tag">VISTA PREVIA</span>
            <span className="pe-hint">Edita después si algo no está bien.</span>
          </div>
          <dl className="pe-paste-grid">
            <dt>Hestía</dt>      <dd>{(REVIEW_APTS.find(a => a.id === parsed.apt) || {}).label || parsed.apt}</dd>
            <dt>Valoración</dt>  <dd>{parsed.rating}/5</dd>
            <dt>Nombre</dt>      <dd>{parsed.name || <em>— no detectado</em>}</dd>
            {parsed.email && (<><dt>Email</dt><dd className="pe-mono">{parsed.email}</dd></>)}
            <dt>Fecha</dt>       <dd className="pe-mono">{parsed.date}</dd>
            <dt>Idioma</dt>      <dd>{parsed.lang.toUpperCase()}</dd>
            <dt>Texto</dt>       <dd className="pe-paste-text">{parsed.text || <em>— no detectado</em>}</dd>
          </dl>
          <div className="pe-actions" style={{marginTop:14}}>
            <button type="button" onClick={accept} className="pe-btn pe-btn-primary">
              ✓ Crear como pendiente
            </button>
            <span className="pe-hint">Recuerda <strong>Guardar</strong> al final para commitear.</span>
          </div>
        </div>
      )}
    </form>
  );
};

const NewReviewForm = ({ onAdd, onCancel }) => {
  const [source, setSource] = React.useState('web');
  const [apt, setApt] = React.useState('vm');
  const [name, setName] = React.useState('');
  const [country, setCountry] = React.useState('ES');
  const [date, setDate] = React.useState(todayIso());
  const [rating, setRating] = React.useState(5);
  const [lang, setLang] = React.useState('es');
  const [text, setText] = React.useState('');
  const [highlight, setHighlight] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return alert('Nombre y texto son obligatorios');
    onAdd({
      id: newReviewId(source), source, apt,
      name: name.trim(), country: country.toUpperCase(),
      date, rating: Number(rating), lang,
      text: text.trim(), highlight,
      status: 'published',
    });
  };
  return (
    <form onSubmit={submit}>
      <h3 className="pe-h3">Añadir review nueva</h3>
      <p className="pe-hint" style={{marginBottom:14}}>
        Si la review viene del formulario público (vía email Web3Forms), copia los campos aquí.
        Por defecto se añade como "Publicada".
      </p>
      <div className="pe-rev-grid">
        <div className="pe-field">
          <label>Fuente</label>
          <select value={source} onChange={e => setSource(e.target.value)} className="pe-input">
            {REVIEW_SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="pe-field">
          <label>Hestía</label>
          <select value={apt} onChange={e => setApt(e.target.value)} className="pe-input">
            {REVIEW_APTS.filter(a => a.id !== 'all').map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div className="pe-field">
          <label>Nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="pe-input" required/>
        </div>
        <div className="pe-field">
          <label>País (ISO 2)</label>
          <input type="text" maxLength={2} value={country} onChange={e => setCountry(e.target.value.toUpperCase())} className="pe-input"/>
        </div>
        <div className="pe-field">
          <label>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="pe-input"/>
        </div>
        <div className="pe-field">
          <label>Rating ({source === 'booking' ? '/10' : '/5'})</label>
          <input type="number" min={0} max={source === 'booking' ? 10 : 5} step={0.1}
            value={rating} onChange={e => setRating(Number(e.target.value))} className="pe-input"/>
        </div>
        <div className="pe-field">
          <label>Idioma</label>
          <select value={lang} onChange={e => setLang(e.target.value)} className="pe-input">
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <div className="pe-field" style={{marginTop: 12}}>
        <label>Texto</label>
        <textarea rows={4} value={text} onChange={e => setText(e.target.value)} className="pe-textarea" required/>
      </div>
      <div className="pe-field" style={{marginTop: 12, flexDirection:'row', alignItems:'center', gap:8, display:'flex'}}>
        <input type="checkbox" id="new-hl" checked={highlight} onChange={e => setHighlight(e.target.checked)}/>
        <label htmlFor="new-hl" style={{cursor:'pointer'}}>✦ Marcar como "Más relevante"</label>
      </div>
      <div className="pe-actions" style={{marginTop:16}}>
        <button type="submit" className="pe-btn pe-btn-primary">Añadir a la lista</button>
        <button type="button" onClick={onCancel} className="pe-btn pe-btn-ghost">Cancelar</button>
        <span className="pe-hint">Recuerda pulsar <strong>"Guardar"</strong> al final para commitear.</span>
      </div>
    </form>
  );
};

// ============================================================
// AnalyticsTab — datos en vivo de Cloudflare Web Analytics
// (vía Worker proxy para sortear CORS) + funnel local.
// ============================================================
const AnalyticsTab = () => {
  const [cfData,   setCfData]   = React.useState(null);
  const [loading,  setLoading]  = React.useState(true);
  const [cfError,  setCfError]  = React.useState(null);
  const [days,     setDays]     = React.useState(30);

  const fetchCF = React.useCallback(async (d) => {
    setLoading(true);
    setCfError(null);
    try {
      const until = new Date().toISOString();
      const since = new Date(Date.now() - d * 86400000).toISOString();
      const flt   = `AND:[{datetime_geq:"${since}"},{datetime_leq:"${until}"},{siteTag:"${CF_SITE_TAG}"}]`;
      const query = `{viewer{accounts(filter:{accountTag:"${CF_ACCOUNT}"}){` +
        `pages:rumPageloadEventsAdaptiveGroups(filter:{${flt}},limit:10,orderBy:[count_DESC])` +
        `{count dimensions{requestPath}}` +
        `countries:rumPageloadEventsAdaptiveGroups(filter:{${flt}},limit:8,orderBy:[count_DESC])` +
        `{count dimensions{countryName}}` +
        `devices:rumPageloadEventsAdaptiveGroups(filter:{${flt}},limit:4,orderBy:[count_DESC])` +
        `{count dimensions{deviceType}}` +
        `}}}`;
      const res = await fetch(CF_WORKER_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${txt.slice(0, 400)}`);
      let json;
      try { json = JSON.parse(txt); }
      catch (_) { throw new Error(`Respuesta no es JSON: ${txt.slice(0, 200)}`); }
      if (json.errors?.length) throw new Error(json.errors[0].message);
      if (json.error) throw new Error(json.error);
      setCfData(json.data?.viewer?.accounts?.[0] || null);
    } catch (e) {
      setCfError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchCF(days); }, [days, fetchCF]);

  // Funnel local (localStorage)
  const localEvents = (() => {
    try { return JSON.parse(localStorage.getItem('_htevt') || '[]'); } catch (_) { return []; }
  })();
  const FUNNEL = [
    { name: 'search_initiated', label: 'Búsquedas' },
    { name: 'dates_selected',   label: 'Fechas' },
    { name: 'booking_step2',    label: 'Formulario' },
    { name: 'booking_sent',     label: 'Enviados' },
  ];
  const fc = {};
  for (const ev of localEvents) fc[ev.name] = (fc[ev.name] || 0) + 1;

  const fmt = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const totalPV  = cfData ? (cfData.pages     || []).reduce((s, r) => s + r.count, 0) : 0;
  const totalCtr = cfData ? (cfData.countries || []).reduce((s, r) => s + r.count, 0) : 0;
  const totalDev = cfData ? (cfData.devices   || []).reduce((s, r) => s + r.count, 0) : 0;

  const BarRow = ({ label, count, total, bold }) => {
    const pct = total ? Math.round(count / total * 100) : 0;
    return (
      <div className="pe-cf-row">
        <div className="pe-cf-bar-wrap"><div className="pe-cf-bar" style={{ width: `${pct}%` }}/></div>
        <span className={`pe-cf-row-label${bold ? ' pe-cf-row-bold' : ''}`}>{label}</span>
        <span className="pe-cf-row-n">{count.toLocaleString('es-ES')}</span>
      </div>
    );
  };

  const pathLabel = (p) => {
    if (!p || p === '/' || p === '/index.html') return 'Inicio';
    return p.replace(/\.html$/, '').replace(/^\//, '') || p;
  };

  return (
    <div className="pe-card pe-analytics">
      <div className="pe-analytics-hd">
        <h2>Analítica</h2>
        <div className="pe-period-tabs">
          {[7, 30, 90].map(d => (
            <button key={d} type="button"
              className={`pe-period-tab${days === d ? ' is-active' : ''}`}
              onClick={() => setDays(d)}>
              {d}d
            </button>
          ))}
          <button type="button" className="pe-period-tab" onClick={() => fetchCF(days)}
            title="Recargar">↺</button>
        </div>
      </div>

      {/* CF live data */}
      {loading && <div className="pe-analytics-loading">Cargando Cloudflare…</div>}
      {cfError  && <div className="pe-error" style={{marginBottom:16}}>CF: {cfError}</div>}

      {!loading && !cfError && cfData && (
        <>
          <div className="pe-cf-summary">
            <div className="pe-cf-stat">
              <div className="pe-cf-stat-n">{totalPV.toLocaleString('es-ES')}</div>
              <div className="pe-cf-stat-lbl">páginas vistas · {days}d</div>
            </div>
          </div>

          <div className="pe-cf-cols">
            <div className="pe-cf-col">
              <div className="pe-cf-col-title">Páginas más vistas</div>
              {(cfData.pages || []).length === 0 && <p className="pe-hint">Sin datos en este rango.</p>}
              {(cfData.pages || []).map((r, i) => (
                <BarRow key={i} label={pathLabel(r.dimensions.requestPath)}
                  count={r.count} total={totalPV} bold={i === 0} />
              ))}
            </div>
            <div className="pe-cf-col">
              <div className="pe-cf-col-title">Países</div>
              {(cfData.countries || []).length === 0 && <p className="pe-hint">—</p>}
              {(cfData.countries || []).map((r, i) => (
                <BarRow key={i} label={r.dimensions.countryName || '—'}
                  count={r.count} total={totalCtr} bold={i === 0} />
              ))}
            </div>
            <div className="pe-cf-col">
              <div className="pe-cf-col-title">Dispositivos</div>
              {(cfData.devices || []).length === 0 && <p className="pe-hint">—</p>}
              {(cfData.devices || []).map((r, i) => (
                <BarRow key={i} label={r.dimensions.deviceType || '—'}
                  count={r.count} total={totalDev} bold={i === 0} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Funnel local */}
      <div className="pe-analytics-sep"/>
      <div className="pe-cf-col-title">Funnel de reservas · este navegador</div>
      <div className="pe-funnel">
        {FUNNEL.map((step, i) => {
          const n    = fc[step.name] || 0;
          const prev = i > 0 ? (fc[FUNNEL[i - 1].name] || 0) : null;
          const pct  = prev ? Math.round((n / prev) * 100) : null;
          return (
            <div key={step.name} className="pe-funnel-step">
              <div className="pe-funnel-n">{n}</div>
              <div className="pe-funnel-label">{step.label}</div>
              {pct !== null && <div className="pe-funnel-conv">{pct}%</div>}
            </div>
          );
        })}
      </div>

      {/* Eventos recientes */}
      <h3 className="pe-analytics-h3" style={{marginTop:20}}>Últimos eventos</h3>
      {localEvents.length === 0
        ? <p className="pe-hint">Sin eventos registrados todavía en este navegador.</p>
        : (
          <table className="pe-table pe-table-events">
            <thead><tr><th>Hora</th><th>Evento</th><th>Datos</th></tr></thead>
            <tbody>
              {localEvents.slice(0, 60).map((ev, i) => (
                <tr key={i}>
                  <td className="pe-ev-ts">{fmt(ev.ts)}</td>
                  <td className="pe-ev-name">{ev.name}</td>
                  <td className="pe-ev-data">
                    {Object.entries(ev).filter(([k]) => k !== 'ts' && k !== 'name')
                      .map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
};

// ============================================================
// ContractTab — generador de contratos de arrendamiento.
// Plantilla base: docs/contracts/template-base.md.
// Flujo: rellenas el formulario → "Generar contrato y abrir correo"
// abre dos cosas a la vez:
//   1) Una ventana con el contrato listo para imprimir → guardar PDF.
//   2) mailto: con el correo del huésped, asunto y cuerpo
//      prerrellenados (el usuario adjunta el PDF descargado).
// ============================================================
const ContractTab = ({ pricesData }) => {
  // Estado del formulario
  const today = new Date().toISOString().slice(0,10);
  const [apt, setApt]                 = React.useState('vm');
  const [nombre, setNombre]           = React.useState('');
  const [domicilio, setDomicilio]     = React.useState('');
  const [dni, setDni]                 = React.useState('');
  const [telefono, setTelefono]       = React.useState('');
  const [email, setEmail]             = React.useState('');
  const [fechaEntrada, setFechaEntrada] = React.useState('');
  const [fechaSalida, setFechaSalida]   = React.useState('');
  const [huespedes, setHuespedes]     = React.useState(2);
  const [mascota, setMascota]         = React.useState(false);
  const [precioTotal, setPrecioTotal] = React.useState('');
  const [prereserva, setPrereserva]   = React.useState('');
  const [diasCancelacion, setDiasCancelacion] = React.useState(14);
  const [fianza, setFianza]           = React.useState(false);
  const [fechaFirma, setFechaFirma]   = React.useState(today);

  const aptInfo = APT_CONTRACT_DATA[apt];
  const noches = diffNoches(fechaEntrada, fechaSalida);
  const remanente = Math.max(0, Number(precioTotal||0) - Number(prereserva||0));

  // Lista de extras (tabla cláusula novena) — leídos de prices.json.
  const extras = (pricesData && pricesData.rules && pricesData.rules.extras) || [];

  const formOk = () => apt && nombre && fechaEntrada && fechaSalida
    && noches > 0 && huespedes >= 1
    && Number(precioTotal) > 0
    && Number(prereserva) >= 0
    && Number(prereserva) <= Number(precioTotal)
    && diasCancelacion > 0;

  const buildContractHTML = () => {
    const a = aptInfo;
    const fechaFirmaStr  = fmtFechaEs(fechaFirma);
    const fechaEntradaStr = fmtFechaCorta(fechaEntrada);
    const fechaSalidaStr  = fmtFechaCorta(fechaSalida);
    const precioL  = numToSpanish(precioTotal);
    const preL     = numToSpanish(prereserva);
    const remL     = numToSpanish(remanente);
    const huespL   = numToSpanish(huespedes);
    const cancelL  = numToSpanish(diasCancelacion);
    const nochesL  = numToSpanish(noches);
    const mascotaTexto = mascota ? ' y mascota' : '';
    const lineaFianza = fianza
      ? '<li>Si no se ha realizado la transferencia por la fianza que se explica en el punto 2.4.</li>'
      : '';
    const clausulaFianza = fianza
      ? `<p><strong>2.4</strong> Dos días antes de la llegada a Hestía, la Parte Arrendataria ingresará la fianza de TRESCIENTOS (300) EUROS. Esta fianza se devolverá a la finalización de la estancia, una vez revisada la vivienda, descontando los desperfectos ocasionados, si los hubiere.</p>`
      : '';
    const clausulaMascotas = mascota
      ? 'Queda prohibida la introducción de cualquier tipo de animal doméstico o salvaje dentro de la vivienda, salvo la mascota declarada de la familia.'
      : 'Queda prohibida la introducción de cualquier tipo de animal doméstico o salvaje dentro de la vivienda.';
    const bloqueAccesibilidad = a.bloqueAccesibilidad ? `
      <p>Hestía permite acceder a la vivienda desde el garaje sin apenas escalones (no más de dos), pero no desde el portal desde donde existen unos 6 escalones aproximadamente. Dentro de Hestía, el acceso a la terraza tiene el marco de la ventana y la ducha y la bañera no están preparadas para personas con movilidad reducida, por lo que requerirían ayuda.</p>` : '';
    const tablaExtras = extras.map(e => {
      const labelClean = (e.label_es || '').split(' · ')[0];
      const detail = (e.label_es || '').split(' · ').slice(1).join(' · ');
      return `<tr>
        <td>${labelClean}${detail ? ` <span class="ed">· ${detail}</span>` : ''}</td>
        <td class="num">${e.price} €</td>
        <td>${e.unit === 'noche' ? 'por noche' : e.unit === 'estancia' ? 'por estancia' : e.unit === 'hora' ? 'por hora' : 'por ' + e.unit}</td>
      </tr>`;
    }).join('');
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
    const baseDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
      ? window.location.pathname.replace(/[^\/]+$/, '')
      : '/';
    const assetUrl = (p) => `${origin}${baseDir}${p}`.replace(/([^:])\/+/g, '$1/');
    const logoUrl = assetUrl('assets/logo-hestia-brand.png');
    const heroUrl = assetUrl(a.heroPhoto);
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<base href="${origin}${baseDir}">
<title>Contrato · Hestía Vera ${a.shortName} · ${nombre}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
  /* Forzar a Chrome/Edge a imprimir los colores de fondo y los
     degradados de la portada hero. Sin esto, la cabecera con la
     foto se imprime en blanco al exportar a PDF. */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  :root {
    --ber: #3D1A35;
    --ber-dk: #2A0F2E;
    --ber-lt: #4E2446;
    --sol: #3AAABB;
    --vt: #B86A3C;
    --vt-dk: #8A4A24;
    --arena: #F0E8D5;
    --arena-dk: #E4D9BE;
    --ink-soft: #5B4A56;
  }
  @page {
    size: A4;
    margin: 22mm 16mm 22mm 16mm;
    @top-left {
      content: "HESTÍA  ·  contrato de arrendamiento";
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: #3D1A35;
      padding-top: 6mm;
    }
    @top-right {
      content: "Hestía Vera ${a.shortName}";
      font-family: 'Lora', Georgia, serif;
      font-size: 9pt;
      font-style: italic;
      color: #3AAABB;
      padding-top: 6mm;
    }
    @bottom-left {
      content: "Hestía Your Home  ·  info@hestiayourhome.com  ·  +34 620 316 370";
      font-family: 'Lora', Georgia, serif;
      font-size: 8pt;
      color: #4E2446;
      padding-bottom: 6mm;
    }
    @bottom-center {
      content: "✦";
      color: #3AAABB;
      font-size: 10pt;
      padding-bottom: 6mm;
    }
    @bottom-right {
      content: "Página " counter(page) " de " counter(pages);
      font-family: 'Lora', Georgia, serif;
      font-size: 8.5pt;
      font-weight: 600;
      color: #3D1A35;
      padding-bottom: 6mm;
    }
  }
  @page :first {
    /* La primera página no necesita header de texto porque ya
       lleva la cabecera completa de marca con logo y la foto hero. */
    @top-left   { content: ""; }
    @top-right  { content: ""; }
  }
  /* Cabecera de marca al inicio (página 1) */
  .brand-header {
    display: flex;
    align-items: center;
    gap: 4mm;
    padding-bottom: 3mm;
    margin-bottom: 4mm;
    border-bottom: 0.5pt solid var(--ber);
  }
  .brand-header-logo { width: 12mm; height: 12mm; object-fit: contain; }
  .brand-header-text { flex: 1; line-height: 1.2; }
  .brand-header-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 14pt;
    font-weight: 700;
    color: var(--ber);
    letter-spacing: 0.04em;
  }
  .brand-header-sub {
    font-family: 'Lora', Georgia, serif;
    font-size: 9pt;
    color: var(--ber-lt);
    font-style: italic;
    margin-top: 0.5mm;
  }
  .brand-header-apt {
    font-family: 'Lora', Georgia, serif;
    font-size: 9pt;
    font-weight: 600;
    color: var(--sol);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: right;
  }

  body {
    font-family: 'Lora', Georgia, serif;
    color: var(--ber);
    font-size: 10.5pt;
    line-height: 1.55;
    margin: 0;
  }

  /* Hero con foto + título grande (solo página 1) */
  .hero {
    position: relative;
    width: 178mm;
    height: 50mm;
    margin: 0 0 6mm;
    overflow: hidden;
    border-radius: 1.5mm;
    background: linear-gradient(135deg, var(--ber) 0%, var(--ber-lt) 100%);
    page-break-inside: avoid;
  }
  .hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.88;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(170deg, rgba(42,15,46,0.10) 0%, rgba(42,15,46,0.45) 60%, rgba(42,15,46,0.78) 100%);
  }
  .hero-text {
    position: absolute;
    left: 6mm;
    bottom: 4mm;
    right: 6mm;
    color: var(--arena);
  }
  .hero-eyebrow {
    font-family: 'Lora', Georgia, serif;
    font-size: 8pt;
    font-style: italic;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--arena-dk);
    opacity: 0.85;
    margin: 0 0 1mm;
  }
  .hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22pt;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.03em;
    line-height: 1.1;
  }
  .hero-meta {
    font-family: 'Lora', Georgia, serif;
    font-size: 9pt;
    margin-top: 2mm;
    color: var(--arena-dk);
  }

  h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 16pt;
    font-weight: 700;
    color: var(--ber-dk);
    text-align: center;
    letter-spacing: 0.04em;
    margin: 0 0 2mm;
  }
  .lugar {
    text-align: center;
    font-style: italic;
    color: var(--ber-lt);
    margin: 0 0 6mm;
    font-size: 10pt;
  }
  h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 13pt;
    font-weight: 700;
    color: var(--ber);
    letter-spacing: 0.04em;
    margin: 6mm 0 2mm;
    padding-bottom: 1mm;
    border-bottom: 0.5pt solid var(--sol);
  }
  h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 11pt;
    font-weight: 600;
    color: var(--vt-dk);
    margin: 4mm 0 1mm;
    letter-spacing: 0.02em;
  }
  h3::before {
    content: "✦  ";
    color: var(--sol);
    font-weight: 400;
  }
  p {
    margin: 1.5mm 0;
    text-align: justify;
    color: var(--ber);
  }
  p strong { color: var(--ber-dk); }
  p em { color: var(--ber-lt); }

  /* Línea para rellenar a mano cuando falta DNI / dirección /
     teléfono. Se imprime como un guion bajo continuo de ancho
     fijo. El huésped la rellena con bolígrafo. */
  .blank-line {
    display: inline-block;
    border-bottom: 0.6pt solid var(--ber-lt);
    min-width: 55mm;
    height: 4mm;
    vertical-align: baseline;
    margin: 0 1mm;
  }
  .blank-line.short { min-width: 30mm; }
  .blank-line.long  { min-width: 80mm; }
  ul, ol { margin: 1mm 0 2mm 6mm; padding: 0; color: var(--ber); }
  li { margin: 0.8mm 0; }
  li::marker { color: var(--sol); }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2mm 0 4mm;
    font-size: 9.5pt;
  }
  th {
    text-align: left;
    padding: 2mm 2.5mm;
    background: var(--ber);
    color: var(--arena);
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 600;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  td {
    padding: 1.8mm 2.5mm;
    border-bottom: 0.3pt solid var(--arena-dk);
    color: var(--ber);
  }
  tr:nth-child(even) td { background: rgba(240,232,213,0.40); }
  td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; color: var(--ber-dk); }
  td .ed { color: var(--ber-lt); font-size: 8.5pt; font-style: italic; }

  /* Cifras destacadas (renta, prereserva, fianza) */
  .key-num { color: var(--vt-dk); font-weight: 700; }

  .firmas {
    margin-top: 12mm;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10mm;
    page-break-inside: avoid;
  }
  .firma {
    padding-top: 18mm;
    border-top: 1pt solid var(--sol);
    font-size: 9.5pt;
    color: var(--ber);
  }
  .firma strong {
    display: block;
    margin-bottom: 1mm;
    font-family: 'Playfair Display', Georgia, serif;
    color: var(--ber-dk);
    font-size: 10.5pt;
  }
  .firma em {
    color: var(--ber-lt);
    font-weight: normal;
  }

  /* Bloque ornamental al final */
  .closing {
    margin-top: 8mm;
    padding: 5mm;
    background: var(--arena);
    border-left: 3pt solid var(--sol);
    border-radius: 1mm;
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    color: var(--ber);
    text-align: center;
    font-size: 10.5pt;
    page-break-inside: avoid;
  }
  .closing-sign {
    font-style: normal;
    font-weight: 600;
    color: var(--vt-dk);
    margin-top: 2mm;
    font-size: 9.5pt;
  }

  @media print {
    body { margin: 0; }
    .print-bar { display: none; }
  }
  .print-bar {
    position: fixed;
    top: 10px;
    right: 10px;
    max-width: 300px;
    background: var(--arena);
    border: 1pt solid var(--ber);
    border-radius: 6px;
    padding: 10px 12px;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(61,26,53,0.15);
    font-family: 'Lora', sans-serif;
    font-size: 11px;
    line-height: 1.4;
    color: var(--ber);
  }
  .print-bar h4 {
    margin: 0 0 4px;
    font-family: 'Playfair Display', serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--ber-dk);
  }
  .print-bar ul {
    margin: 0 0 8px 14px;
    padding: 0;
    font-size: 10.5px;
  }
  .print-bar ul li { margin: 2px 0; }
  .print-bar button {
    background: var(--ber);
    color: var(--arena);
    border: none;
    border-radius: 3px;
    font-family: 'Lora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
    width: 100%;
  }
  .print-bar button:hover { background: var(--ber-lt); }
</style></head>
<body>
<div class="print-bar">
  <h4>Ajustes recomendados</h4>
  <ul>
    <li><strong>Gráficos de fondo:</strong> activado</li>
    <li><strong>Encabezados y pies:</strong> desactivado</li>
    <li><strong>Márgenes:</strong> predeterminado</li>
  </ul>
  <button onclick="window.print()">Imprimir / Guardar como PDF</button>
</div>

<div class="brand-header">
  <img src="${logoUrl}" alt="Hestía" class="brand-header-logo">
  <div class="brand-header-text">
    <div class="brand-header-name">HESTÍA</div>
    <div class="brand-header-sub">your home — contrato de arrendamiento</div>
  </div>
  <div class="brand-header-apt">Hestía Vera ${a.shortName}</div>
</div>

<div class="hero">
  <img src="${heroUrl}" alt="${a.name}" class="hero-img" onerror="this.style.display='none'">
  <div class="hero-overlay"></div>
  <div class="hero-text">
    <div class="hero-eyebrow">contrato de arrendamiento por temporada</div>
    <h1 class="hero-title" style="text-align:left;color:var(--arena);margin:0">${a.name}</h1>
    <div class="hero-meta">${fechaEntradaStr} → ${fechaSalidaStr} · ${nochesL} (${noches}) noches · ${huespedes} huésped${huespedes !== 1 ? 'es' : ''}${mascotaTexto}</div>
  </div>
</div>

<p class="lugar">Madrid, ${fechaFirmaStr}</p>

<h2>Reunidos</h2>
<p>Por una parte, <strong>D. Alejandro Berruezo Márquez</strong> y <strong>D. Francisco Javier Moral Arévalo</strong>, mayores de edad, y con domicilio a efectos de notificaciones en Avenida de la Constitución 38, 1A, 28821 de Coslada, Madrid, con DNI. 02646392N y 75018031N, telf. 620316370 y 654138251, respectivamente, y correo electrónico: info@hestiayourhome.com y cuenta corriente: ES2114650100911726525059.</p>
<p><em>(De ahora en adelante, "Los Propietarios".)</em></p>
<p>De otra parte, <strong>D./Dña. ${nombre.toUpperCase()}</strong>, mayor de edad, con domicilio a efectos de notificaciones en: ${domicilio ? `<strong>${domicilio}</strong>` : '<span class="blank-line long" aria-label="dirección a rellenar"></span>'}, con Documento Nacional de Identidad: ${dni ? `<strong>${dni}</strong>` : '<span class="blank-line short" aria-label="DNI a rellenar"></span>'}, y con teléfono: ${telefono ? `<strong>${telefono}</strong>` : '<span class="blank-line short" aria-label="teléfono a rellenar"></span>'}.</p>
<p><em>(en adelante, "la Parte Arrendataria".)</em></p>
<p>Ambas partes se reconocen capacidad legal suficiente para este acto y libremente,</p>

<h2>EXPONEN</h2>
<p><strong>I.</strong> Que el Propietario es titular de la siguiente finca en perfecto estado de uso:</p>
<p><strong>VIVIENDA:</strong> Dirección: ${a.direccion}, en Vera (Almería), y plaza de garaje <strong>${a.plazaGaraje}</strong>, en las condiciones y con los muebles y servicios cuya descripción y fotografías se exponen en la página web www.hestiayourhome.com.</p>
<p>La vivienda se entrega limpia, en perfecto estado de uso, conservación y habitabilidad y los suministros y servicios que posee la misma se encuentran en funcionamiento. La vivienda se devolverá limpia y en perfecto estado.</p>
${bloqueAccesibilidad}
<p>Hestía se encuentra en una zona de expansión y existen obras de construcción ${a.zonaObras}. La Parte Arrendataria da por conocida esta situación y los Propietarios no se hacen responsables de cualquier situación ocasionada por dichas obras.</p>
<p><strong>II.</strong> Ambas partes han acordado concertar el arrendamiento por temporada de la finca antes descrita, por lo que establecen el presente contrato, que se regirá por lo dispuesto en las siguientes,</p>

<h2>CLÁUSULAS</h2>

<h3>Primera · Objeto</h3>
<p>El Propietario cede en arrendamiento de temporada con la duración que se indicará a la Parte Arrendataria, que acepta, la finca descrita.</p>

<h3>Segunda · Renta y fianza</h3>
<p><strong>2.1</strong> La renta neta es de <strong>${precioL} (${precioTotal}) EUROS</strong> para <strong>${huespL} (${huespedes}) personas${mascotaTexto}</strong>. Este contrato no tendrá validez en los siguientes casos:</p>
<ul>
  <li>Sin el correspondiente justificante de abono en la cuenta ES2114650100911726525059 o BIZUM al teléfono +34 620 316 370 de la prereserva, es decir, <strong>${preL} (${prereserva}) EUROS</strong>. Deberá ingresarse en el momento de la formalización de este contrato.</li>
  <li>Sin el correspondiente abono en efectivo del remanente de la estancia, es decir, <strong>${remL} (${remanente}) EUROS</strong>. Deberá pagarse en efectivo en el momento del check-in.</li>
  <li>Si no se envía el DNI o pasaporte de cada uno de los huéspedes mayores de 16 años, como adjunto al contrato firmado.</li>
  ${lineaFianza}
</ul>
<p><strong>2.2</strong> La cancelación del contrato con más de <strong>${cancelL} (${diasCancelacion}) días</strong> del inicio de la reserva no supondrá ningún coste, aunque se agradece comunicar lo antes posible la cancelación, con el fin de que otros huéspedes puedan disfrutar de Hestía.</p>
<p><strong>2.3</strong> La cancelación del contrato con menos de <strong>${cancelL} (${diasCancelacion}) días</strong> del inicio de la estancia supondrá la pérdida de las cantidades entregadas, salvo cuestión de fuerza mayor demostrable oficialmente de alguno de los huéspedes. En este caso, si se consigue realquilar, se devolverán todas las cantidades entregadas o se podrán posponer las fechas a los próximos SEIS (6) meses desde la fecha de la estancia.</p>
${clausulaFianza}

<h3>Tercera · Duración</h3>
<p>Este contrato se otorga por la temporada de <strong>${nochesL} (${noches}) noches</strong>, desde el día <strong>${fechaEntradaStr}</strong> a las 15:00, y quedará automáticamente resuelto sin necesidad de aviso alguno, el día <strong>${fechaSalidaStr}</strong> a las 11:00, debiendo la Parte Arrendataria entregar las llaves con anterioridad.</p>
<p>La Parte Arrendataria deberá abandonar la finca en el estado en que la encontró, dejándola libre de efectos y enseres y permaneciendo en perfecto estado los servicios de que dispone, sin que quepa prórroga del mismo salvo acuerdo escrito entre las partes.</p>

<h3>Cuarta · Obligaciones de las partes</h3>
<p><strong>4.1</strong> La Parte Arrendataria se obliga a conservar la vivienda en perfecto estado durante el plazo de duración libremente pactado entre ambas partes.</p>
<p><strong>4.2</strong> La Parte Arrendataria no podrá alojar a más huéspedes ni realizar en la vivienda actividades molestas, insalubres, nocivas, peligrosas, ilícitas o contrarias a los Estatutos de la Comunidad. Tampoco podrá almacenar materias inflamables, explosivas o corrosivas en la vivienda y/o desarrollar, en la misma, actividades mercantiles o de industria.</p>
<p><strong>4.3</strong> La Parte Arrendataria será directa y exclusivamente responsable y exime de toda responsabilidad a la propiedad por: i) Los daños que puedan ocasionarse a personas o cosas y sean derivados de mal uso por la Parte Arrendataria de instalaciones para servicios y suministros de la casa de temporada arrendada. ii) Los daños, deterioros o pérdidas que se produzcan en la misma, ya sean causados por la Parte Arrendataria o por las personas que convivan en la vivienda.</p>
<p><strong>4.4</strong> La Parte Arrendataria no podrá hacer obras, ni introducir modificación alguna sin permiso escrito del Propietario. En ningún caso podrá hacer taladros o agujeros en las paredes.</p>
<p><strong>4.5</strong> El Propietario mantendrá los suministros de agua y luz, etc., al corriente de pago y en pleno funcionamiento, así como el seguro de la vivienda vigente.</p>
<p><strong>4.6</strong> La Parte Arrendataria se verá obligada a la reparación y conservación de los enseres y muebles siempre que se derive por mal uso, así como de las instalaciones eléctricas y fontanería, siendo por cuenta de la parte arrendadora las obras que tengan carácter de mayores.</p>
<p><strong>4.7</strong> ${clausulaMascotas}</p>
<p><strong>4.8</strong> Queda prohibido el subarriendo en cualquiera de sus modalidades.</p>

<h3>Quinta · Renuncias</h3>
<p>La Parte Arrendataria renuncia a los derechos contenidos en los artículos 31 a 33 de la Ley de Arrendamientos Urbanos, y por tanto a los derechos de Arrendamiento, subrogación, cesión, o traspaso, ya sean de forma total o parcial, tanteo, retracto y derecho de impugnación de la transmisión.</p>

<h3>Sexta · Cláusula penal</h3>
<p>El incumplimiento de la obligación de abandonar la Vivienda en el plazo pactado obligará a la Parte Arrendataria a satisfacer en concepto de cláusula penal, la suma correspondiente al triple de la renta diaria, exigibles por semanas vencidas hasta la libre disponibilidad de la vivienda por el Propietario, sin perjuicio de las costas, gastos y demás indemnizaciones que fueran a su cargo incluso minutas de abogado y procurador, aunque no fuera preceptiva su intervención.</p>

<h3>Séptima · Jurisdicción</h3>
<p>Las partes integrantes se someten a la jurisdicción y competencia de los tribunales y juzgados del lugar donde está situada la vivienda, con renuncia expresa a su fuero propio.</p>
<p>Ambas partes se ratifican en el presente contrato y firman por duplicado, a un solo efecto, en el lugar y fecha indicados en el encabezamiento.</p>

<h3>Octava · Servicios incluidos</h3>
<p>El apartamento se entrega limpio y dotado.</p>
<ul>
  <li>Un juego de toallas por cada huésped.</li>
  <li>${a.bloqueSabanas}</li>
</ul>

<h3>Novena · Servicios adicionales</h3>
<p>Los siguientes servicios pueden añadirse a la reserva. Precios sincronizados con la web:</p>
<table>
  <thead><tr><th>Servicio</th><th class="num">Precio</th><th>Unidad</th></tr></thead>
  <tbody>${tablaExtras}</tbody>
</table>

<h3>Décima · Normas de Hestía</h3>
<p>Hestía dispone de productos consumibles. Por favor, sed colaborativos: si gastáis o consumís, reponed (salvo el kit que es un pequeño regalo por nuestra parte).</p>
<p>Respetad el medio ambiente e intentad no malgastar la luz y el agua. En vuestro hogar no dejaríais el aire acondicionado encendido con las ventanas abiertas o cuando no estáis en casa. Pues eso, sentíos como en vuestro hogar.</p>
<p>Asimismo, si salís, recoged los cojines, el toldo, las plantas de la terraza, especialmente si hay viento, lluvia o predicción de mal tiempo.</p>
<p>Respetad y no extraigáis de Hestía el equipamiento, el contenido, el mobiliario y los detalles. Tras vuestra estancia se realizará un inventario e inspección de Hestía, con lo que cualquier deterioro o sustracción será vuestra responsabilidad.</p>
<p>Nuestro máximo deseo es que descanséis y que respetéis igualmente el descanso de nuestros vecinos, evitando los ruidos, la música y el jaleo a deshoras. Hestía es exclusivamente para vuestro uso y disfrute, no para el de otros.</p>
<p>Respetad las horas de check-in (a partir de las 15:00) y check-out (hasta las 11:00). No están permitidas las mascotas, salvo aprobación explícita. No fuméis. Las toallas son para uso exclusivo dentro de Hestía. Solo está permitido colgar ropa en el tendedero. El uso de las zonas comunes será en el horario permitido, especialmente la piscina. No está permitido el naturismo ni el toples en toda la urbanización, ya que se trata de una urbanización textil. Cualquier incidente o problemática derivada de los menores de edad será responsabilidad de sus padres/tutores. Cualquier situación o incidente de los servicios comunes o del exterior de Hestía no es responsabilidad nuestra, aunque intentaremos ayudarte. Por favor, intenta dejar Hestía limpio y recogido. De las sábanas y toallas nos encargamos nosotros. En cualquier caso, no laves las toallas y sábanas con ropa de otro color, por favor.</p>
<p><strong>Mancomunidad y zonas comunes.</strong> No se permite circular a velocidad superior a la indicada por la mancomunidad — en general, muy reducida. Hay niños, mascotas y peatones; conducid siempre despacio. Asimismo, no se permite ensuciar ni deteriorar las zonas comunes (jardines, piscina, ascensores, pasillos y descansillos). Cualquier desperfecto o suciedad reiterada será responsabilidad del huésped.</p>

<div class="firmas">
  <div class="firma">
    <strong>Los Propietarios</strong> <em style="font-weight:normal">(con una es suficiente)</em><br>
    Fdo.: Alejandro Berruezo Márquez<br>
    Fdo.: Francisco Javier Moral Arévalo
  </div>
  <div class="firma">
    <strong>La Parte Arrendataria</strong><br>
    Fdo.: <strong>${nombre.toUpperCase()}</strong>
  </div>
</div>

</body></html>`;
  };

  const buildEmailBody = () => {
    const fechaEntradaStr = fmtFechaCorta(fechaEntrada);
    const fechaSalidaStr  = fmtFechaCorta(fechaSalida);
    const apartamento = aptInfo.shortName;
    return `Estimado/a ${nombre},

¡Muchas gracias por tu interés en Hestía! Adjunto encontrarás el contrato de arrendamiento para tu estancia en Hestía Vera ${apartamento} del ${fechaEntradaStr} al ${fechaSalidaStr}.

Para confirmar tu reserva necesitamos que nos hagas llegar:

1. El contrato firmado por todas las partes (puedes contestar a este correo con el PDF firmado adjunto).
2. El DNI o pasaporte de cada huésped mayor de 16 años.
3. El justificante de la prereserva de ${prereserva} €, ingresada por transferencia a la cuenta ES2114650100911726525059 o BIZUM al teléfono +34 620 316 370.

El remanente de ${remanente} € se abona en efectivo el día de la llegada, en el momento del check-in.

Recibida toda la documentación, tu reserva quedará confirmada y te escribiremos unos días antes de tu llegada para coordinar el check-in (autónomo o presencial, lo que te encaje mejor).

Si tienes cualquier duda, escríbenos sin problema.

Un abrazo,
Alex y Fran · Hestía
info@hestiayourhome.com · +34 620 316 370`;
  };

  const onGenerar = () => {
    if (!formOk()) {
      alert('Faltan campos por rellenar. Comprueba que el huésped tiene nombre, fechas y precio total > 0, y que la prereserva no supere el total.');
      return;
    }
    // 1. Abrir ventana con el contrato (auto-print después de un momento)
    const html = buildContractHTML();
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      // Esperar a que las imágenes (logo + hero por apt) y las fuentes
      // (Playfair Display / Lora) carguen antes de invocar print().
      // Sin esto, el PDF puede salir sin la cabecera de marca ni la
      // foto del apartamento.
      const triggerPrint = () => { try { w.focus(); w.print(); } catch (e) {} };
      const waitForAssets = () => {
        try {
          const imgs = Array.from(w.document.images || []);
          const imgPromises = imgs.map(img =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise(r => { img.onload = img.onerror = r; })
          );
          const fontsReady = (w.document.fonts && w.document.fonts.ready) || Promise.resolve();
          Promise.all([...imgPromises, fontsReady])
            .then(() => setTimeout(triggerPrint, 250))
            .catch(() => setTimeout(triggerPrint, 1500));
        } catch (e) {
          setTimeout(triggerPrint, 1500);
        }
      };
      if (w.document.readyState === 'complete') waitForAssets();
      else w.addEventListener('load', waitForAssets);
    } else {
      alert('Tu navegador ha bloqueado la ventana emergente. Permite popups en /p-edit.html y vuelve a intentarlo.');
      return;
    }
    // 2. Abrir mailto en otra pestaña (después de un instante para no romper la ventana de impresión)
    setTimeout(() => {
      const subject = `Contrato de reserva · Hestía Vera ${aptInfo.shortName} · ${fmtFechaCorta(fechaEntrada)} → ${fmtFechaCorta(fechaSalida)}`;
      const body = buildEmailBody();
      const mailto = `mailto:${encodeURIComponent(email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    }, 1500);
  };

  return (
    <div className="pe-card">
      <h2>📄 Generar contrato</h2>
      <p className="pe-help">
        Rellena los datos del huésped. El precio total lo dictas tú · la fecha de firma se rellena con la de hoy (puedes cambiarla).
        Al pulsar <strong>Generar contrato y abrir correo</strong> se abren dos ventanas: el contrato listo para guardar como PDF y tu cliente de correo con el mensaje prerrellenado al huésped.
        Recuerda <strong>adjuntar manualmente</strong> el PDF descargado al correo antes de enviarlo (los navegadores no permiten adjuntar automáticamente desde un <code>mailto:</code>).
      </p>

      <div className="ct-form">
        <fieldset>
          <legend>Apartamento</legend>
          <div className="pe-grid">
            {Object.entries(APT_CONTRACT_DATA).map(([id, info]) => (
              <label key={id} className={`ct-radio ${apt === id ? 'is-active' : ''}`}>
                <input type="radio" name="apt" value={id} checked={apt === id} onChange={() => setApt(id)} />
                <span className="ct-radio-name">{info.name}</span>
                <span className="ct-radio-meta">Plaza {info.plazaGaraje}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Datos del huésped</legend>
          <div className="pe-grid">
            <div className="pe-field"><label>Nombre completo *</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="VÍCTOR CORTÉS" /></div>
            <div className="pe-field"><label>DNI o pasaporte</label><input type="text" value={dni} onChange={e => setDni(e.target.value)} placeholder="12345678A" /></div>
            <div className="pe-field" style={{gridColumn: '1 / -1'}}><label>Domicilio</label><input type="text" value={domicilio} onChange={e => setDomicilio(e.target.value)} placeholder="C/ Mayor 10, 1ºB, 28013 Madrid" /></div>
            <div className="pe-field"><label>Teléfono</label><input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+34 600 000 000" /></div>
            <div className="pe-field"><label>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="huesped@ejemplo.com" /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Estancia</legend>
          <div className="pe-grid">
            <div className="pe-field"><label>Fecha de entrada *</label><input type="date" value={fechaEntrada} onChange={e => setFechaEntrada(e.target.value)} /></div>
            <div className="pe-field"><label>Fecha de salida *</label><input type="date" value={fechaSalida} onChange={e => setFechaSalida(e.target.value)} /></div>
            <div className="pe-field"><label>Noches (calculado)</label><input type="text" readOnly value={noches} className="ct-readonly" /></div>
            <div className="pe-field"><label>Nº de huéspedes</label><input type="number" min="1" max="8" value={huespedes} onChange={e => setHuespedes(Number(e.target.value))} /></div>
            <div className="pe-field"><label>¿Mascota?</label>
              <label className="ct-toggle"><input type="checkbox" checked={mascota} onChange={e => setMascota(e.target.checked)} /> <span>Sí, viaja con mascota</span></label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Importes (€)</legend>
          <div className="pe-grid">
            <div className="pe-field"><label>Precio total *</label><input type="number" min="0" value={precioTotal} onChange={e => setPrecioTotal(e.target.value)} placeholder="630" /></div>
            <div className="pe-field"><label>Prereserva (Bizum / transferencia) *</label><input type="number" min="0" value={prereserva} onChange={e => setPrereserva(e.target.value)} placeholder="130" /></div>
            <div className="pe-field"><label>Remanente (efectivo en check-in)</label><input type="text" readOnly value={`${remanente} €`} className="ct-readonly" /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Política</legend>
          <div className="pe-grid">
            <div className="pe-field"><label>Días de cancelación sin coste *</label><input type="number" min="1" max="60" value={diasCancelacion} onChange={e => setDiasCancelacion(Number(e.target.value))} /></div>
            <div className="pe-field"><label>¿Fianza?</label>
              <label className="ct-toggle"><input type="checkbox" checked={fianza} onChange={e => setFianza(e.target.checked)} /> <span>Sí, 300 € (transferencia 2 días antes)</span></label>
            </div>
            <div className="pe-field"><label>Fecha del contrato (firma)</label><input type="date" value={fechaFirma} onChange={e => setFechaFirma(e.target.value)} /></div>
          </div>
        </fieldset>

        <div className="ct-actions">
          <button type="button" className="pe-btn pe-btn-primary" onClick={onGenerar} disabled={!formOk()}>
            📨 Generar contrato y abrir correo
          </button>
          {!formOk() && <span className="ct-actions-hint">Faltan campos obligatorios (marcados con *).</span>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ReservasTab — pestaña de reservas (v2).
//
// Lee data-private/reservas.json vía la API de GitHub con el PAT
// del usuario. La carpeta data-private/ vive FUERA de docs/, por
// lo que GitHub Pages no la sirve.
//
// UX:
//   · Dashboard arriba con KPIs del año actual y comparativa con
//     el resto de años disponibles en el JSON.
//   · Bloque de próximos check-ins y check-ins actuales destacado.
//   · Tabla compacta: click en fila → panel deslizante a la
//     derecha con TODOS los campos de la reserva.
//   · Auto-cálculo de noches, comisión sugerida, BAI,
//     rentabilidad %, y precio neto/bruto por noche.
//   · Indicador visual al inicio de cada fila para reservas en
//     curso (🏠) y próximas (⏰).
//
// Sincronización con Google Sheets: ver data-private/SETUP-SHEETS-SYNC.md.
// ============================================================
const RESERVAS_PATH = 'data-private/reservas.json';

const APT_NAMES   = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' };
// Colores reales de marca (Hestía brandbook):
//   Mar      → #6B7A3A verde olivo (olivar de Vera Playa)
//   Thalassa → #B86A3C teja        (Desierto de Tabernas)
//   Salinas  → #D4A84A albero      (amarillo del amanecer)
const APT_COLOR   = { vm: '#6B7A3A', vt: '#B86A3C', vs: '#D4A84A' };
// Albero es claro: el chip necesita texto oscuro para legibilidad.
const APT_TEXT    = { vm: '#FFFBF4', vt: '#FFFBF4', vs: '#3D1A35' };

// Tasas de comisión por defecto (% sobre ingreso_total). Editable
// por reserva: la UI los usa solo como sugerencia inicial cuando
// se cambia el canal de una nueva reserva.
const COMMISSION_RATES = {
  airbnb:   0.149,
  booking:  0.187,
  directo:  0,
  avaibook: 0,
};

function getCanalKey(canal) {
  if (!canal) return 'directo';
  const k = canal.toLowerCase().trim();
  if (k.includes('airbnb'))  return 'airbnb';
  if (k.includes('booking')) return 'booking';
  if (k.includes('avaibook'))return 'avaibook';
  return 'directo';
}

// Auto-calculo del gasto de limpieza según regla de negocio:
//   · 90 € si la entrada cae en julio o agosto
//   · 90 € si la estancia es de más de 10 noches
//   · 80 € en cualquier otro caso
function autoLimpieza(entrada, noches) {
  if (!entrada) return 80;
  const mes = parseInt(entrada.slice(5, 7));
  if (mes === 7 || mes === 8) return 90;
  if ((noches || 0) > 10)     return 90;
  return 80;
}

// Devuelve la reserva con todos los campos derivados recalculados
// a partir de las fuentes (entrada, salida, ingreso_total,
// comision, gasto_limpieza, canal). Mantiene los campos editables
// que ya tuvieran valor.
function calcDerived(r) {
  const out = { ...r };

  // 1. Noches = (salida - entrada) en días.
  if (out.entrada && out.salida) {
    const e = new Date(out.entrada);
    const s = new Date(out.salida);
    const days = Math.round((s.getTime() - e.getTime()) / 86400000);
    if (days > 0) out.noches = days;
  }

  // 2. Gasto limpieza autocalculado salvo override manual (cuando
  // el usuario marca _limpieza_manual=true en el draft, respeta el
  // valor ya introducido). Por defecto aplicamos la regla.
  if (!r._limpieza_manual) {
    out.gasto_limpieza = autoLimpieza(out.entrada, out.noches);
  }

  const ingreso = Number(out.ingreso_total) || 0;
  const com     = Number(out.comision)      || 0;
  const gasto   = Number(out.gasto_limpieza) || 0;

  // 3. BAI = ingreso_total − comision − gasto_limpieza.
  out.bai = Math.round((ingreso - com - gasto) * 100) / 100;

  // 3. Rentabilidad = BAI / ingreso_total.
  out.rentabilidad_pct = ingreso > 0 ? Math.round((out.bai / ingreso) * 10000) / 10000 : null;

  // 4. Precios por noche.
  const noches = Number(out.noches) || 0;
  if (noches > 0 && ingreso > 0) {
    out.precio_bruto_noche = Math.round((ingreso / noches) * 100) / 100;
    out.precio_neto_noche  = Math.round((out.bai  / noches) * 100) / 100;
  } else {
    out.precio_bruto_noche = null;
    out.precio_neto_noche  = null;
  }

  return out;
}

function reservaStatus(r, todayStr) {
  if (!r.entrada || !r.salida) return 'unknown';
  if (r.salida  <= todayStr) return 'past';
  if (r.entrada >  todayStr) return 'upcoming';
  return 'staying';
}

const fmtEur = n => (n == null || isNaN(n))
  ? '—'
  : `${Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const fmtPct = n => (n == null || isNaN(n))
  ? '—'
  : `${(Number(n) * 100).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
const fmtDate = d => d || '—';
const fmtDelta = (cur, prev) => {
  if (prev == null || prev === 0) return '';
  const diff = ((cur - prev) / Math.abs(prev)) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)} %`;
};

// ── BloquesTab ── manual blocked ranges for direct bookings ──────────────────
const BloquesTab = ({ token }) => {
  const [pData,   setPData]   = React.useState(null);
  const [sha,     setSha]     = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState(null);
  const [saving,  setSaving]  = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState(null);
  const [blocks,  setBlocks]  = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) })
      .then(r => r.json())
      .then(j => {
        if (j.message) throw new Error(j.message);
        setSha(j.sha);
        const parsed = JSON.parse(b64ToUtf8(j.content));
        setPData(parsed);
        setBlocks(parsed.manual_blocks || { vm: [], vt: [], vs: [] });
      })
      .catch(e => setLoadErr('Error cargando precios: ' + e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const save = async () => {
    if (!pData || !sha) return;
    setSaving(true); setSaveMsg(null);
    try {
      const next = { ...pData, manual_blocks: blocks };
      const res = await fetch(`${API}/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'admin: update manual_blocks',
          content: utf8ToB64(JSON.stringify(next, null, 2)),
          sha,
          branch: BRANCH,
        }),
      });
      const j = await res.json();
      if (j.message && !j.content) throw new Error(j.message);
      setSha(j.content.sha); setPData(next);
      setSaveMsg('Guardado. El próximo sync iCal (≤4 h) integrará estos bloqueos en el calendario público.');
    } catch (e) {
      setSaveMsg('Error al guardar: ' + e.message);
    } finally { setSaving(false); }
  };

  const addBlock = (apt) =>
    setBlocks(b => ({ ...b, [apt]: [...(b[apt] || []), { start: '', end: '', note: '' }] }));

  const removeBlock = (apt, idx) =>
    setBlocks(b => ({ ...b, [apt]: b[apt].filter((_, i) => i !== idx) }));

  const updateBlock = (apt, idx, field, val) =>
    setBlocks(b => ({ ...b, [apt]: b[apt].map((r, i) => i === idx ? { ...r, [field]: val } : r) }));

  if (loading) return <div className="pe-card"><p>Cargando…</p></div>;
  if (loadErr) return <div className="pe-error">{loadErr}</div>;
  if (!blocks)  return null;

  const APTS_BLK = [
    { id: 'vm', label: 'Hestía Vera Mar' },
    { id: 'vt', label: 'Hestía Vera Thalassa' },
    { id: 'vs', label: 'Hestía Vera Salinas' },
  ];

  return (
    <div className="pe-card">
      <h2 className="pe-section-title">Bloqueos manuales de calendario</h2>
      <p className="blk-desc">
        Reservas directas y fechas cerradas que <strong>no aparecen en los feeds de Airbnb/Booking</strong>.
        El sync iCal automático (cada 4 h) las integra en el calendario público junto con las reservas de plataformas.
      </p>

      {APTS_BLK.map(({ id, label }) => (
        <div key={id} className="blk-apt-block">
          <h3 className="blk-apt-name">{label}</h3>
          {(blocks[id] || []).length === 0 ? (
            <p className="blk-empty">Sin bloqueos manuales</p>
          ) : (
            <table className="blk-table">
              <thead>
                <tr><th>Entrada</th><th>Salida</th><th>Nota / huésped</th><th></th></tr>
              </thead>
              <tbody>
                {(blocks[id] || []).map((r, i) => (
                  <tr key={i}>
                    <td><input type="date" value={r.start} onChange={e => updateBlock(id, i, 'start', e.target.value)} className="blk-date-input" /></td>
                    <td><input type="date" value={r.end}   onChange={e => updateBlock(id, i, 'end',   e.target.value)} className="blk-date-input" /></td>
                    <td><input type="text" value={r.note || ''} onChange={e => updateBlock(id, i, 'note', e.target.value)} className="blk-note-input" placeholder="Huésped / motivo" /></td>
                    <td><button className="blk-del" onClick={() => removeBlock(id, i)} title="Eliminar">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className="blk-add" onClick={() => addBlock(id)}>+ Añadir bloqueo</button>
        </div>
      ))}

      <div className="pe-actions" style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar bloqueos'}
        </button>
        {saveMsg && <span className={`pe-save-msg${saveMsg.startsWith('Error') ? ' pe-err' : ''}`}>{saveMsg}</span>}
      </div>
    </div>
  );
};

const LeilaTab = ({ token }) => {
  const [data,    setData]    = React.useState(null);
  const [sha,     setSha]     = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState(null);
  const [saving,  setSaving]  = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState(null);
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState(null);
  const [editsEfectivo,     setEditsEfectivo]     = React.useState({});
  const [editsLiquid,       setEditsLiquid]       = React.useState({});
  const [editsLiquidDate,   setEditsLiquidDate]   = React.useState({});
  const [editsSaldoInicial, setEditsSaldoInicial] = React.useState({});
  const currentYear = String(new Date().getFullYear());
  const [focusYear,  setFocusYear]  = React.useState(currentYear);
  const [focusMonth, setFocusMonth] = React.useState('all');

  const loadData = React.useCallback(() => {
    setLoading(true);
    fetch(`${API}/repos/${REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) })
      .then(r => r.json())
      .then(j => {
        if (j.message) throw new Error(j.message);
        setSha(j.sha);
        setData(JSON.parse(b64ToUtf8(j.content)));
      })
      .catch(e => setLoadErr('Error cargando reservas: ' + e.message))
      .finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const copyToSheets = async (currentData) => {
    if (!SHEETS_WORKER_URL) {
      setSyncMsg('Sync con Google Sheets no configurado — ver SETUP-SHEETS-SYNC.md');
      return;
    }
    setSyncing(true); setSyncMsg(null);
    try {
      const res = await fetch(SHEETS_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSyncMsg('Datos copiados al Excel correctamente.');
    } catch (e) {
      setSyncMsg('Error al copiar al Excel: ' + e.message);
    } finally { setSyncing(false); }
  };

  const hasEdits = Object.keys(editsEfectivo).length > 0 ||
                   Object.keys(editsLiquid).length > 0 ||
                   Object.keys(editsLiquidDate).length > 0 ||
                   Object.keys(editsSaldoInicial).length > 0;

  const save = async () => {
    if (!data || !sha || !hasEdits) return;
    setSaving(true); setSaveMsg(null);
    try {
      const updReservas = data.reservas.map((r, i) => {
        const out = { ...r };
        if (editsEfectivo[i] !== undefined) out.efectivo_leila = Number(editsEfectivo[i]) || 0;
        return out;
      });
      let updLiquid = [...(data.leila_pagos_a_hestia || [])];
      Object.entries(editsLiquid).forEach(([ym, val]) => {
        const v = Number(val) || 0;
        const idx = updLiquid.findIndex(l => l.mes === ym);
        const dateVal = editsLiquidDate[ym] ?? (idx >= 0 ? updLiquid[idx].fecha_sync : undefined);
        const entry = { mes: ym, importe: v };
        if (dateVal) entry.fecha_sync = dateVal;
        if (v === 0 && idx >= 0)    { updLiquid.splice(idx, 1); }
        else if (v > 0 && idx >= 0) { updLiquid[idx] = entry; }
        else if (v > 0)             { updLiquid.push(entry); }
      });
      Object.entries(editsLiquidDate).forEach(([ym, dateVal]) => {
        if (editsLiquid[ym] !== undefined) return;
        const idx = updLiquid.findIndex(l => l.mes === ym);
        if (idx >= 0) updLiquid[idx] = { ...updLiquid[idx], fecha_sync: dateVal || undefined };
      });
      let updSaldoInicial = { ...(data.leila_saldo_inicial || {}) };
      Object.entries(editsSaldoInicial).forEach(([yr, val]) => {
        const v = Number(val) || 0;
        if (v !== 0) updSaldoInicial[yr] = v;
        else delete updSaldoInicial[yr];
      });
      const next = { ...data, reservas: updReservas, leila_pagos_a_hestia: updLiquid, leila_saldo_inicial: updSaldoInicial };
      const res = await fetch(`${API}/repos/${REPO}/contents/${RESERVAS_PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Update Leila: efectivo + liquidaciones', content: utf8ToB64(JSON.stringify(next, null, 2)), sha, branch: BRANCH }),
      });
      const j = await res.json();
      if (j.message && !j.content) throw new Error(j.message);
      setSha(j.content.sha); setData(next);
      setEditsEfectivo({}); setEditsLiquid({}); setEditsLiquidDate({}); setEditsSaldoInicial({});
      setSaveMsg('Guardado correctamente.');
    } catch (e) {
      setSaveMsg('Error al guardar: ' + e.message);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="pe-card"><p>Cargando…</p></div>;
  if (loadErr) return <div className="pe-error">{loadErr}</div>;
  if (!data)   return null;

  const reservas = data.reservas || [];
  const liquidaciones = data.leila_pagos_a_hestia || [];
  const saldosIniciales = data.leila_saldo_inicial || {};
  const APT_LABEL = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' };
  const MES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const fmtBal = n => n > 0 ? `Leila debe ${n} €` : n < 0 ? `Hestía debe ${Math.abs(n)} €` : 'Saldado';

  const allYears = [...new Set(reservas.map(r => String(r.year || '')).filter(Boolean))].sort().filter(y => y >= '2025');
  const yearRows = reservas.map((r, i) => ({ ...r, _idx: i }))
    .filter(r => String(r.year || '') === focusYear);
  const allMonths = [...new Set(yearRows.map(r => (r.entrada || '').slice(5, 7)).filter(Boolean))].sort();

  const byMonth = {};
  yearRows.forEach(r => {
    const m = (r.entrada || '').slice(5, 7);
    if (m) (byMonth[m] = byMonth[m] || []).push(r);
  });
  const visibleMonths = focusMonth === 'all' ? allMonths : allMonths.filter(m => m === focusMonth);

  // Saldo inicial del año (arrastrado del año anterior).
  const saldoInicialYear = editsSaldoInicial[focusYear] !== undefined
    ? (Number(editsSaldoInicial[focusYear]) || 0)
    : (Number(saldosIniciales[focusYear]) || 0);

  // Pre-compute cross-month running carry: for each month, the balance
  // entering that month = saldo inicial + sum of all previous months' net.
  const monthCarry = {};
  {
    let carry = saldoInicialYear;
    allMonths.forEach(m => {
      monthCarry[m] = carry;
      const mKey = `${focusYear}-${m}`;
      const mRows = byMonth[m] || [];
      const mEf = mRows.reduce((s, r) => {
        const v = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila) || 0);
        return s + v;
      }, 0);
      const mTa = mRows.reduce((s, r) => s + (Number(r.gasto_limpieza) || 0), 0);
      const liqE = liquidaciones.find(l => l.mes === mKey);
      const liqV = editsLiquid[mKey] !== undefined ? (Number(editsLiquid[mKey]) || 0) : (liqE ? liqE.importe : 0);
      carry = carry + mEf - mTa - liqV;
    });
  }
  let yrTarifa = 0, yrEfectivo = 0, yrLiquid = 0;

  return (
    <div className="pe-card">
      <div className="leila-hdr">
        <h2 style={{ margin: 0 }}>Pagos · Leila</h2>
        <div className="leila-year-row">
          {allYears.map(y => (
            <button key={y} type="button"
              className={`leila-yr-btn${y === focusYear ? ' active' : ''}`}
              onClick={() => {
                setFocusYear(y); setFocusMonth('all');
                setEditsEfectivo({}); setEditsLiquid({}); setEditsLiquidDate({}); setEditsSaldoInicial({});
                setSaveMsg(null);
              }}>
              {y}
            </button>
          ))}
          <select className="leila-month-sel" value={focusMonth} onChange={e => setFocusMonth(e.target.value)}>
            <option value="all">Todos los meses</option>
            {allMonths.map(m => (
              <option key={m} value={m}>{MES_FULL[parseInt(m, 10) - 1]}</option>
            ))}
          </select>
        </div>
        <div className="leila-saldo-row">
          <label className="leila-saldo-label" htmlFor="leila-saldo-inicial">
            Saldo arrastrado de {Number(focusYear) - 1}
          </label>
          <input
            id="leila-saldo-inicial"
            type="number"
            step="0.01"
            className="leila-saldo-input"
            value={editsSaldoInicial[focusYear] !== undefined ? editsSaldoInicial[focusYear] : saldoInicialYear}
            onChange={e => setEditsSaldoInicial(p => ({ ...p, [focusYear]: e.target.value }))}
          />
          <span className="leila-saldo-unit">€</span>
          {saldoInicialYear !== 0 && (
            <span className="leila-saldo-hint">{saldoInicialYear > 0 ? `Leila debe ${saldoInicialYear}€ al entrar el año` : `Hestía debe ${Math.abs(saldoInicialYear)}€ al entrar el año`}</span>
          )}
        </div>
        {hasEdits && (
          <button type="button" className="pe-btn pe-btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        )}
        <div className="leila-sync-row">
          <button type="button" className="pe-btn pe-btn-ghost" onClick={loadData} disabled={loading}>
            {loading ? 'Recargando…' : 'Releer el Excel de reservas'}
          </button>
          <button type="button" className="pe-btn pe-btn-ghost" onClick={() => data && copyToSheets(data)} disabled={syncing || !data}>
            {syncing ? 'Copiando…' : 'Copiar datos en el Excel de reservas'}
          </button>
        </div>
      </div>
      {saveMsg && <div className={saveMsg.startsWith('Error') ? 'pe-error' : 'pe-success'} style={{ marginTop: 8 }}>{saveMsg}</div>}
      {syncMsg && <div className={syncMsg.startsWith('Error') ? 'pe-error' : 'pe-success'} style={{ marginTop: 8 }}>{syncMsg}</div>}

      {visibleMonths.length === 0 && <p className="pe-help" style={{ marginTop: 16 }}>Sin reservas en {focusYear}.</p>}

      {visibleMonths.map(m => {
        const rows = byMonth[m] || [];
        const mKey = `${focusYear}-${m}`;
        const mTarifa   = rows.reduce((s, r) => s + (Number(r.gasto_limpieza) || 0), 0);
        const mEfectivo = rows.reduce((s, r) => {
          const v = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila) || 0);
          return s + v;
        }, 0);
        const liqEntry  = liquidaciones.find(l => l.mes === mKey);
        const liqVal    = editsLiquid[mKey] !== undefined
          ? (Number(editsLiquid[mKey]) || 0)
          : (liqEntry ? liqEntry.importe : 0);
        const liqDate   = editsLiquidDate[mKey] !== undefined
          ? editsLiquidDate[mKey]
          : (liqEntry ? (liqEntry.fecha_sync || '') : '');
        const mBal = (mEfectivo - mTarifa) - liqVal;
        yrTarifa += mTarifa; yrEfectivo += mEfectivo; yrLiquid += liqVal;

        let mAcum = monthCarry[m] ?? 0;
        const rowAcums = rows.map(r => {
          const ef = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila) || 0);
          mAcum += ef - (Number(r.gasto_limpieza) || 0);
          return mAcum;
        });
        const acumAfterMonth = mAcum - liqVal;

        return (
          <div key={m} className="leila-month-block">
            <div className="leila-month-hdr">
              <span className="leila-month-name">{MES_FULL[parseInt(m, 10) - 1]} {focusYear}</span>
              <span className="leila-month-kpis">
                <span>Efectivo: <strong>{mEfectivo} €</strong></span>
                <span>Limpieza: <strong>{mTarifa} €</strong></span>
                <span>Neto mes: <strong>{mEfectivo - mTarifa} €</strong></span>
                {liqVal > 0 && <span>Leila pagó: <strong>{liqVal} €</strong></span>}
                <span className={mBal > 0 ? 'leila-owe' : mBal < 0 ? 'leila-over' : ''}><strong>{fmtBal(mBal)}</strong></span>
              </span>
            </div>
            <div className="leila-table-wrap">
              <table className="leila-table">
                <thead>
                  <tr>
                    <th>Apt</th>
                    <th>Huésped</th>
                    <th>Entrada · Salida</th>
                    <th className="num">Noches</th>
                    <th className="num">Limpieza</th>
                    <th className="num">Efectivo</th>
                    <th className="num">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => {
                    const tarifa   = Number(r.gasto_limpieza) || 0;
                    const efectivo = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila) || 0);
                    const acum     = rowAcums[ri];
                    return (
                      <tr key={r._idx}>
                        <td className="leila-apt">{APT_LABEL[r.apt] || r.apt}</td>
                        <td className="leila-guest">{r.responsable || '—'}</td>
                        <td className="leila-dates">{r.entrada}{r.salida ? ` · ${r.salida}` : ''}</td>
                        <td className="num">{r.noches || '—'}</td>
                        <td className="num">{tarifa} €</td>
                        <td className="num">
                          <input type="number" step="1" min="0" className="leila-cobro-input"
                            value={efectivo || ''}
                            placeholder="0"
                            onChange={e => setEditsEfectivo(prev => ({ ...prev, [r._idx]: e.target.value }))}
                          />
                        </td>
                        <td className={`num ${acum > 0 ? 'leila-owe' : acum < 0 ? 'leila-over' : 'leila-ok'}`}>
                          {acum === 0 ? '—' : `${acum > 0 ? '+' : ''}${acum} €`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="leila-foot-row">
                    <td colSpan="4"/>
                    <td className="num">{mTarifa} €</td>
                    <td className="num">{mEfectivo > 0 ? `${mEfectivo} €` : '—'}</td>
                    <td className={`num ${(mEfectivo - mTarifa) > 0 ? 'leila-owe' : (mEfectivo - mTarifa) < 0 ? 'leila-over' : 'leila-ok'}`}>
                      {(mEfectivo - mTarifa) === 0 ? '—' : `${(mEfectivo - mTarifa) > 0 ? '+' : ''}${mEfectivo - mTarifa} €`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="leila-liquid-row">
              <label className="leila-liquid-lbl">Leila pagó a Hestía en {MES_FULL[parseInt(m, 10) - 1]}:</label>
              <input type="number" step="1" min="0" className="leila-cobro-input"
                value={liqVal || ''}
                placeholder="0"
                onChange={e => setEditsLiquid(prev => ({ ...prev, [mKey]: e.target.value }))}
              />
              <span className="leila-liquid-eur">€</span>
              <label className="leila-liquid-lbl" style={{ marginLeft: 16 }}>Fecha sync:</label>
              <input type="date" className="leila-cobro-input leila-sync-date"
                value={liqDate}
                onChange={e => setEditsLiquidDate(prev => ({ ...prev, [mKey]: e.target.value }))}
              />
            </div>

            <div className="leila-cum-row">
              Saldo acumulado al cierre de {MES_FULL[parseInt(m, 10) - 1]}:{' '}
              <strong className={acumAfterMonth > 0 ? 'leila-owe' : acumAfterMonth < 0 ? 'leila-over' : ''}>
                {acumAfterMonth === 0 ? 'Saldado' : `${acumAfterMonth > 0 ? '+' : ''}${acumAfterMonth} €`}
              </strong>
            </div>
          </div>
        );
      })}

      {visibleMonths.length > 1 && (() => {
        const yrNeto = yrEfectivo - yrTarifa;
        const yrBal  = yrNeto - yrLiquid;
        return (
          <div className="leila-year-total">
            <span>Total {focusYear}</span>
            <span>Efectivo: <strong>{yrEfectivo} €</strong></span>
            <span>Limpieza: <strong>{yrTarifa} €</strong></span>
            <span>Neto: <strong className={yrNeto > 0 ? 'leila-owe' : yrNeto < 0 ? 'leila-over' : ''}>{yrNeto > 0 ? '+' : ''}{yrNeto} €</strong></span>
            {yrLiquid > 0 && <span>Liquidado: <strong>{yrLiquid} €</strong></span>}
            <span className={yrBal > 0 ? 'leila-owe' : yrBal < 0 ? 'leila-over' : ''}>
              Balance: <strong>{fmtBal(yrBal)}</strong>
            </span>
          </div>
        );
      })()}
    </div>
  );
};

const ReservasTab = ({ token }) => {
  const [data,        setData]        = React.useState(null);
  const [sha,         setSha]         = React.useState(null);
  const [loading,     setLoading]     = React.useState(false);
  const [error,       setError]       = React.useState(null);
  const [success,     setSuccess]     = React.useState(null);
  const [syncing,     setSyncing]     = React.useState(false);
  const [syncMsg,     setSyncMsg]     = React.useState(null);
  const [filterApt,   setFilterApt]   = React.useState('all');
  const [filterCanal, setFilterCanal] = React.useState('all');
  const [filterStatus,setFilterStatus]= React.useState('all');
  const [selectedIdx, setSelectedIdx] = React.useState(-1);
  const [draft,       setDraft]       = React.useState(null);
  const [focusYearOverride, setFocusYearOverride] = React.useState(null);

  const loadData = React.useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/repos/${REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) })
      .then(r => r.json())
      .then(j => {
        if (j.message) throw new Error(j.message);
        setSha(j.sha);
        setData(JSON.parse(b64ToUtf8(j.content)));
      })
      .catch(e => setError('Error cargando reservas: ' + e.message + ' — F12 para detalle.'))
      .finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const copyToSheets = async (currentData) => {
    if (!SHEETS_WORKER_URL) {
      setSyncMsg('Sync con Google Sheets no configurado — ver SETUP-SHEETS-SYNC.md');
      return;
    }
    setSyncing(true); setSyncMsg(null);
    try {
      const res = await fetch(SHEETS_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSyncMsg('Datos copiados al Excel correctamente.');
    } catch (e) {
      setSyncMsg('Error al copiar al Excel: ' + e.message);
    } finally { setSyncing(false); }
  };

  if (loading)              return <div className="pe-card"><h2>🗓️ Reservas</h2><p>Cargando…</p></div>;
  if (!data && error)       return <div className="pe-error">{error}</div>;
  if (!data)                return <div className="pe-card"><h2>🗓️ Reservas</h2><p className="pe-help">Esperando autenticación…</p></div>;

  const reservas = (data && data.reservas) || [];
  const today    = new Date().toISOString().slice(0, 10);

  // --- Agrupación por año. Usamos r.year (calculado por el parser
  // a partir de la fecha de SALIDA — criterio contable de Hestía).
  // Fallback a la fecha de salida o entrada si falta. ---
  const yearOf = r => r.year ? String(r.year) : ((r.salida || r.entrada || '').slice(0, 4));
  const currentYear = String(new Date().getFullYear());
  const byYear      = {};
  reservas.forEach(r => {
    const y = yearOf(r);
    if (!y) return;
    (byYear[y] = byYear[y] || []).push(r);
  });
  const allYears = Object.keys(byYear).sort();
  const defaultFocus = byYear[currentYear] ? currentYear : (allYears[allYears.length - 1] || currentYear);
  const focusYear = focusYearOverride && byYear[focusYearOverride] ? focusYearOverride : defaultFocus;
  const focusList = byYear[focusYear] || [];

  // --- Métricas consistentes año a año ---
  // Bruto = ingreso_total (lo que paga el huésped al canal).
  // Comisiones = lo que se queda Airbnb/Booking/Avaibook.
  // Limpieza = gasto_limpieza (pago a equipo de limpieza).
  // Neto = bai (Beneficio Antes Impuestos, según hoja Hestía).
  // Excluimos 'renta' (sólo presente 2023+, semántica cambia año a año).
  const sum = (list, key) => list.reduce((a, r) => a + (Number(r[key]) || 0), 0);
  const yearMetrics = (list) => {
    const bruto    = sum(list, 'ingreso_total');
    const comision = sum(list, 'comision');
    const limpieza = sum(list, 'gasto_limpieza');
    const neto     = sum(list, 'bai');
    const renta    = sum(list, 'renta');
    const noches   = sum(list, 'noches');
    // Precio bruto por noche: usar el pre-calculado del Sheet
    // (precio_bruto_noche). Filtramos nulos y ceros para min/max.
    const preciosNoche = list
      .map(r => Number(r.precio_bruto_noche))
      .filter(p => p > 0 && Number.isFinite(p));
    return {
      reservas:  list.length,
      noches,
      bruto, comision, limpieza, neto, renta,
      rentabilidad:  bruto ? neto / bruto : 0,
      comisionPct:   bruto ? comision / bruto : 0,
      brutoPorNoche: noches ? bruto / noches : 0,
      netoPorNoche:  noches ? neto  / noches : 0,
      minNoche: preciosNoche.length ? Math.min(...preciosNoche) : 0,
      maxNoche: preciosNoche.length ? Math.max(...preciosNoche) : 0,
    };
  };
  const kFocus = yearMetrics(focusList);

  // KPIs por apartamento (sólo año focal)
  const byApt = ['vm', 'vt', 'vs'].map(apt => {
    const list = focusList.filter(r => r.apt === apt);
    const m = yearMetrics(list);
    return { apt, reservas: m.reservas, noches: m.noches, ingreso: m.bruto, bai: m.neto };
  });

  // KPIs por canal (sólo año focal)
  const byCanal = {};
  focusList.forEach(r => {
    const c = (r.canal || '—').trim() || '—';
    if (!byCanal[c]) byCanal[c] = { count: 0, sum: 0, bai: 0 };
    byCanal[c].count++;
    byCanal[c].sum += Number(r.ingreso_total) || 0;
    byCanal[c].bai += Number(r.bai)           || 0;
  });

  // --- Próximas y en estancia (en todos los años, son atemporales) ---
  const enEstancia = reservas.filter(r => reservaStatus(r, today) === 'staying')
    .sort((a, b) => a.salida.localeCompare(b.salida));
  const proximas = reservas.filter(r => reservaStatus(r, today) === 'upcoming')
    .sort((a, b) => a.entrada.localeCompare(b.entrada))
    .slice(0, 8);

  // --- Filtros visibles. El listado SÓLO muestra el año focal
  // (por defecto el actual). Los demás años están en el dashboard
  // multi-año de la cabecera. ---
  const filtered = focusList.filter(r => {
    if (filterApt   !== 'all' && r.apt !== filterApt) return false;
    if (filterCanal !== 'all' && getCanalKey(r.canal) !== filterCanal) return false;
    if (filterStatus!== 'all' && reservaStatus(r, today) !== filterStatus) return false;
    return true;
  }).sort((a, b) => (a.entrada || '').localeCompare(b.entrada || ''));

  const canalKeys = Array.from(new Set(focusList.map(r => getCanalKey(r.canal))));

  // --- Acciones ---
  const saveReservas = async (newReservas) => {
    setError(null); setSuccess(null);
    const newData = { ...data, reservas: newReservas, updatedAt: new Date().toISOString(), count: newReservas.length };
    try {
      const body = {
        message: `chore(reservas): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
        content: utf8ToB64(JSON.stringify(newData, null, 2)),
        sha,
        branch: BRANCH,
      };
      const r = await fetch(`${API}/repos/${REPO}/contents/${RESERVAS_PATH}`, {
        method: 'PUT', headers: apiHeaders(token), body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || 'Error desconocido');
      setSha(j.content.sha);
      setData(newData);
      setSuccess('Reservas guardadas ✓');
      setSelectedIdx(-1);
      setDraft(null);
    } catch (e) {
      setError('Error guardando: ' + e.message);
    }
  };

  const openRow = (idx) => {
    setSelectedIdx(idx);
    setDraft({ ...reservas[idx] });
  };
  const newRow = () => {
    const empty = {
      apt: 'vm', responsable: '', telefono: null, huespedes: 2,
      menores_12: null, cuna_trona: null, mascota: false, dni_enviado: false,
      noches: null, entrada: today, salida: today,
      cancelacion: 'Cancelable 14', canal: 'Directo', contactado: 'Alex',
      f_reserva: today, ingreso_total: 0, reserva: 0, pago_previo: 0,
      al_checkin: 0, comision: 0, renta: 0, fianza: false,
      gasto_limpieza: 80, pagos_leila: 0, bai: 0, observaciones: '',
      rentabilidad_pct: null, precio_neto_noche: null, precio_bruto_noche: null,
    };
    setSelectedIdx(reservas.length);
    setDraft(empty);
  };

  // Edita un campo del draft. Si tocas algo que afecta a derivados
  // (entrada/salida/ingreso/comision/gasto/canal), recalculamos.
  const updateDraft = (field, value) => {
    setDraft(prev => {
      let next = { ...prev, [field]: value };
      // Sugerencia de comisión al cambiar canal en reserva nueva.
      if (field === 'canal') {
        const rate = COMMISSION_RATES[getCanalKey(value)] ?? 0;
        if (next.ingreso_total) {
          next.comision = Math.round(next.ingreso_total * rate * 100) / 100;
        }
      }
      // Si el usuario edita la limpieza directamente, marcamos
      // _limpieza_manual=true para que el auto-cálculo no la
      // sobrescriba al cambiar entrada/salida.
      if (field === 'gasto_limpieza') {
        next._limpieza_manual = true;
      }
      next = calcDerived(next);
      return next;
    });
  };

  // Restaura el auto-cálculo de limpieza desactivando el flag
  // de override manual.
  const resetLimpiezaAuto = () => {
    setDraft(prev => calcDerived({ ...prev, _limpieza_manual: false }));
  };

  const saveDraft = () => {
    if (!draft) return;
    const cleaned = calcDerived(draft);
    const nr = [...reservas];
    if (selectedIdx >= 0 && selectedIdx < reservas.length) {
      nr[selectedIdx] = cleaned;
    } else {
      nr.push(cleaned);
    }
    saveReservas(nr);
  };

  const cancelDraft = () => {
    setSelectedIdx(-1);
    setDraft(null);
  };

  const deleteRow = () => {
    if (selectedIdx < 0 || selectedIdx >= reservas.length) return;
    if (!confirm(`¿Borrar reserva de ${reservas[selectedIdx].responsable}?`)) return;
    const nr = reservas.filter((_, i) => i !== selectedIdx);
    saveReservas(nr);
  };

  // --- KPI Card helper ---
  const KpiCard = ({ label, value, sub, accent }) => (
    <div className="rv-kpi" style={accent ? {borderLeftColor: accent} : null}>
      <div className="rv-kpi-label">{label}</div>
      <div className="rv-kpi-value">{value}</div>
      {sub && <div className="rv-kpi-sub">{sub}</div>}
    </div>
  );

  // ============================================================
  // Render
  // ============================================================
  return (
    <>
      {error   && <div className="pe-error">{error}</div>}
      {success && <div className="pe-success">{success}</div>}
      {syncMsg && <div className={syncMsg.startsWith('Error') ? 'pe-error' : 'pe-success'}>{syncMsg}</div>}

      <div className="pe-card rv-card">
        <div className="rv-head">
          <h2>🗓️ Reservas <span className="rv-count">· año {focusYear} · {focusList.length} reservas · actualizado {data.updatedAt ? data.updatedAt.slice(0,10) : '—'}</span></h2>
          <div className="rv-head-actions">
            <button type="button" className="pe-btn pe-btn-ghost" onClick={loadData} disabled={loading}>
              {loading ? 'Recargando…' : 'Releer el Excel de reservas'}
            </button>
            <button type="button" className="pe-btn pe-btn-ghost" onClick={() => copyToSheets(data)} disabled={syncing}>
              {syncing ? 'Copiando…' : 'Copiar datos en el Excel de reservas'}
            </button>
            <button type="button" className="pe-btn pe-btn-primary" onClick={newRow}>+ Nueva</button>
          </div>
        </div>

        {/* ───── Dashboard multi-año (cabecera) ─────
            Tabla comparativa con métricas consistentes año a año:
            Bruto · Comisiones · Limpieza · Neto (BAI) · Margen · €/noche.
            Click en una fila para cambiar el año focal del listado. */}
        {allYears.length > 1 && (
          <div className="rv-yearly">
            <div className="rv-yearly-h">
              <h3>Histórico por año</h3>
              <span className="rv-yearly-sub">Click en un año para verlo en el listado</span>
            </div>
            <div className="rv-yearly-wrap">
              <table className="rv-yearly-table">
                <thead><tr>
                  <th>Año</th>
                  <th className="num">Reservas</th>
                  <th className="num">Noches</th>
                  <th className="num">Bruto</th>
                  <th className="num">Comisiones</th>
                  <th className="num">Limpieza</th>
                  <th className="num">Neto (BAI)</th>
                  <th className="num">Rentabilidad</th>
                  <th className="num">€/noche medio</th>
                  <th className="num">€/noche mín</th>
                  <th className="num">€/noche máx</th>
                </tr></thead>
                <tbody>
                  {allYears.map(y => {
                    const m = yearMetrics(byYear[y]);
                    const isFocus = y === focusYear;
                    return (
                      <tr key={y}
                          className={`rv-yearly-row${isFocus ? ' is-focus' : ''}`}
                          onClick={() => setFocusYearOverride(y)}>
                        <td><strong>{y}</strong></td>
                        <td className="num">{m.reservas}</td>
                        <td className="num">{m.noches}</td>
                        <td className="num">{fmtEur(m.bruto)}</td>
                        <td className="num rv-yearly-neg">−{fmtEur(m.comision)}</td>
                        <td className="num rv-yearly-neg">−{fmtEur(m.limpieza)}</td>
                        <td className="num"><strong>{fmtEur(m.neto)}</strong></td>
                        <td className="num"><strong>{fmtPct(m.rentabilidad)}</strong></td>
                        <td className="num">{fmtEur(m.brutoPorNoche)}</td>
                        <td className="num rv-yearly-min">{m.minNoche ? fmtEur(m.minNoche) : '—'}</td>
                        <td className="num rv-yearly-max">{m.maxNoche ? fmtEur(m.maxNoche) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───── KPIs del año focal ───── */}
        <div className="rv-dashboard">
          <KpiCard label={`Reservas ${focusYear}`} value={kFocus.reservas} sub={`${kFocus.noches} noches`} />
          <KpiCard label="Bruto" accent="#B86A3C" value={fmtEur(kFocus.bruto)} sub={`${fmtEur(kFocus.brutoPorNoche)}/noche medio`} />
          <KpiCard label="Comisiones" accent="#D4A84A" value={fmtEur(kFocus.comision)} sub={kFocus.bruto ? `${fmtPct(kFocus.comisionPct)} del bruto` : null} />
          <KpiCard label="Limpieza" value={fmtEur(kFocus.limpieza)} sub={kFocus.bruto ? `${fmtPct(kFocus.limpieza/kFocus.bruto)} del bruto` : null} />
          <KpiCard label="Neto (BAI)" accent="#6B7A3A" value={fmtEur(kFocus.neto)} sub={`${fmtEur(kFocus.netoPorNoche)}/noche neto`} />
          <KpiCard label="Rentabilidad" accent="#6B7A3A" value={fmtPct(kFocus.rentabilidad)} sub="neto / bruto" />
          <KpiCard label="€/noche mín" value={kFocus.minNoche ? fmtEur(kFocus.minNoche) : '—'} sub="reserva más barata" />
          <KpiCard label="€/noche máx" value={kFocus.maxNoche ? fmtEur(kFocus.maxNoche) : '—'} sub="reserva más cara" />
        </div>

        {/* Subrejilla: por apartamento + por canal */}
        <div className="rv-dashboard-2">
          <div className="rv-block">
            <div className="rv-block-h">Por apartamento</div>
            <div className="rv-block-rows">
              {byApt.map(b => (
                <div key={b.apt} className="rv-block-row rv-block-row-apt" data-apt={b.apt} style={{'--apt-c': APT_COLOR[b.apt]}}>
                  <span className="rv-apt-chip" style={{background: APT_COLOR[b.apt], color: APT_TEXT[b.apt]}}>{APT_NAMES[b.apt]}</span>
                  <span className="rv-block-row-meta">{b.reservas} reservas · {b.noches} noches</span>
                  <span className="rv-block-row-val">{fmtEur(b.ingreso)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rv-block">
            <div className="rv-block-h">Por canal</div>
            <div className="rv-block-rows">
              {Object.entries(byCanal).map(([c, v]) => (
                <div key={c} className="rv-block-row">
                  <span className="rv-canal-tag">{c}</span>
                  <span className="rv-block-row-meta">{v.count} reservas · BAI {fmtEur(v.bai)}</span>
                  <span className="rv-block-row-val">{fmtEur(v.sum)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ───── En estancia (ahora) ───── */}
        {enEstancia.length > 0 && (
          <div className="rv-now rv-banner-staying">
            <h3>🏠 En Hestía ahora mismo · {enEstancia.length}</h3>
            <ul>
              {enEstancia.map((r, i) => (
                <li key={i}>
                  <span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt]}</span>
                  <strong>{r.responsable}</strong>
                  <span className="rv-prox-meta">salida {fmtDate(r.salida)} · {r.huespedes} pax · {r.canal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ───── Próximas (8) ───── */}
        {proximas.length > 0 && (
          <div className="rv-now rv-banner-upcoming">
            <h3>⏰ Próximos check-ins · {proximas.length}{reservas.filter(r => reservaStatus(r, today) === 'upcoming').length > proximas.length ? ` (de ${reservas.filter(r => reservaStatus(r, today) === 'upcoming').length})` : ''}</h3>
            <ul>
              {proximas.map((r, i) => (
                <li key={i}>
                  <span className="rv-prox-date">{fmtDate(r.entrada)}</span>
                  <span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt]}</span>
                  <strong>{r.responsable}</strong>
                  <span className="rv-prox-meta">{r.huespedes} pax · {r.noches}n · {r.canal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ───── Filtros ───── */}
        <div className="rv-toolbar">
          <label>Apartamento
            <select value={filterApt} onChange={e => setFilterApt(e.target.value)}>
              <option value="all">Todos</option>
              {Object.entries(APT_NAMES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Canal
            <select value={filterCanal} onChange={e => setFilterCanal(e.target.value)}>
              <option value="all">Todos</option>
              {canalKeys.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </label>
          <label>Estado
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Todas</option>
              <option value="staying">En estancia</option>
              <option value="upcoming">Próximas</option>
              <option value="past">Pasadas</option>
            </select>
          </label>
          <span className="rv-hint">Click en una fila para editarla →</span>
        </div>

        {/* ───── Tabla ───── */}
        <div className="rv-table-wrap">
          <table className="rv-table">
            <thead><tr>
              <th className="rv-status-th"></th>
              <th>Apt</th><th>Huésped</th><th>Entrada</th><th>Salida</th>
              <th className="num">Noches</th><th className="num">Pax</th>
              <th>Canal</th>
              <th className="num">Ingreso</th><th className="num">Comisión</th><th className="num">BAI</th><th className="num">%</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const idx = reservas.indexOf(r);
                const status = reservaStatus(r, today);
                const statusIcon = status === 'staying' ? '🏠' : status === 'upcoming' ? '⏰' : status === 'past' ? '✓' : '·';
                const isSel = idx === selectedIdx;
                return (
                  <tr key={idx} className={`rv-row rv-row-${status}${isSel ? ' is-selected' : ''}`}
                    data-apt={r.apt} style={{'--apt-c': APT_COLOR[r.apt] || 'transparent'}}
                    onClick={() => openRow(idx)}>
                    <td className={`rv-status rv-status-${status}`} title={status}>{statusIcon}</td>
                    <td><span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt] || r.apt}</span></td>
                    <td>{r.responsable}{r.mascota ? ' 🐾' : ''}{r.cuna_trona ? ' 👶' : ''}</td>
                    <td>{fmtDate(r.entrada)}</td>
                    <td>{fmtDate(r.salida)}</td>
                    <td className="num">{r.noches || '—'}</td>
                    <td className="num">{r.huespedes || '—'}</td>
                    <td>{r.canal || '—'}</td>
                    <td className="num">{fmtEur(r.ingreso_total)}</td>
                    <td className="num">{fmtEur(r.comision)}</td>
                    <td className="num">{fmtEur(r.bai)}</td>
                    <td className="num">{fmtPct(r.rentabilidad_pct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── Panel deslizante de edición ───── */}
      {draft && (
        <>
          <div className="rv-edit-backdrop" onClick={cancelDraft} />
          <aside className="rv-edit-panel" data-apt={draft.apt} style={{'--apt-c': APT_COLOR[draft.apt] || '#3D1A35'}}>
            <header className="rv-edit-head">
              <div>
                <div className="rv-edit-eyebrow">{selectedIdx < reservas.length ? 'Editar reserva' : 'Nueva reserva'} · {APT_NAMES[draft.apt] || ''}</div>
                <h3>{draft.responsable || '(sin nombre)'}</h3>
              </div>
              <button type="button" className="rv-edit-close" onClick={cancelDraft} aria-label="Cerrar">×</button>
            </header>

            <div className="rv-edit-body">
              <fieldset><legend>Estancia</legend>
                <div className="rv-field">
                  <label>Apartamento</label>
                  <select value={draft.apt || ''} onChange={e => updateDraft('apt', e.target.value)}>
                    {Object.entries(APT_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="rv-field">
                  <label>Huésped (responsable)</label>
                  <input value={draft.responsable || ''} onChange={e => updateDraft('responsable', e.target.value)} placeholder="Nombre completo" />
                </div>
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>Teléfono</label>
                    <input value={draft.telefono || ''} onChange={e => updateDraft('telefono', e.target.value)} placeholder="+34 600 000 000" />
                  </div>
                  <div className="rv-field">
                    <label>DNI enviado</label>
                    <select value={draft.dni_enviado === true ? 'si' : draft.dni_enviado === false ? 'no' : ''}
                      onChange={e => updateDraft('dni_enviado', e.target.value === 'si' ? true : e.target.value === 'no' ? false : null)}>
                      <option value="">—</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="rv-row3">
                  <div className="rv-field">
                    <label>Entrada</label>
                    <input type="date" value={draft.entrada || ''} onChange={e => updateDraft('entrada', e.target.value)} />
                  </div>
                  <div className="rv-field">
                    <label>Salida</label>
                    <input type="date" value={draft.salida || ''} onChange={e => updateDraft('salida', e.target.value)} />
                  </div>
                  <div className="rv-field">
                    <label>Noches <span className="rv-calc">calculado</span></label>
                    <input value={draft.noches != null ? draft.noches : ''} readOnly className="rv-readonly" />
                  </div>
                </div>
                <div className="rv-row3">
                  <div className="rv-field">
                    <label>Huéspedes</label>
                    <input type="number" min="1" value={draft.huespedes || 0} onChange={e => updateDraft('huespedes', Number(e.target.value))} />
                  </div>
                  <div className="rv-field">
                    <label>{'<12 años'}</label>
                    <input type="number" min="0" value={draft.menores_12 || 0} onChange={e => updateDraft('menores_12', Number(e.target.value))} />
                  </div>
                  <div className="rv-field">
                    <label>Cuna / trona</label>
                    <select value={draft.cuna_trona === true ? 'si' : draft.cuna_trona === false ? 'no' : ''}
                      onChange={e => updateDraft('cuna_trona', e.target.value === 'si' ? true : e.target.value === 'no' ? false : null)}>
                      <option value="">—</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="rv-field">
                  <label>Mascota</label>
                  <select value={draft.mascota ? 'si' : 'no'} onChange={e => updateDraft('mascota', e.target.value === 'si')}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
              </fieldset>

              <fieldset><legend>Canal y cancelación</legend>
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>Canal</label>
                    <select value={draft.canal || 'Directo'} onChange={e => updateDraft('canal', e.target.value)}>
                      <option value="Directo">Directo</option>
                      <option value="Airbnb">Airbnb</option>
                      <option value="Booking">Booking</option>
                      <option value="Avaibook">Avaibook</option>
                    </select>
                  </div>
                  <div className="rv-field">
                    <label>Política cancelación</label>
                    <select value={draft.cancelacion || 'Cancelable 14'} onChange={e => updateDraft('cancelacion', e.target.value)}>
                      <option value="Cancelable 7">Cancelable 7 días</option>
                      <option value="Cancelable 14">Cancelable 14 días</option>
                      <option value="Cancelable 30">Cancelable 30 días</option>
                      <option value="Cancelable 60">Cancelable 60 días</option>
                      <option value="Semiestricta">Semiestricta</option>
                      <option value="No reembolsable">No reembolsable</option>
                    </select>
                  </div>
                </div>
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>Fecha reserva</label>
                    <input type="date" value={draft.f_reserva || ''} onChange={e => updateDraft('f_reserva', e.target.value)} />
                  </div>
                  <div className="rv-field">
                    <label>Contactado por</label>
                    <select value={draft.contactado || ''} onChange={e => updateDraft('contactado', e.target.value)}>
                      <option value="">—</option>
                      <option value="Alex">Alex</option>
                      <option value="Fran">Fran</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset><legend>Importes</legend>
                <div className="rv-field">
                  <label>Ingreso total bruto</label>
                  <input type="number" step="0.01" value={draft.ingreso_total || 0} onChange={e => updateDraft('ingreso_total', Number(e.target.value))} />
                </div>
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>Comisión <span className="rv-hint-inline">tasa {getCanalKey(draft.canal)}: {((COMMISSION_RATES[getCanalKey(draft.canal)] ?? 0)*100).toFixed(1)}%</span></label>
                    <input type="number" step="0.01" value={draft.comision || 0} onChange={e => updateDraft('comision', Number(e.target.value))} />
                  </div>
                  <div className="rv-field">
                    <label>Gasto limpieza
                      {draft._limpieza_manual
                        ? <button type="button" className="rv-mini-link" onClick={resetLimpiezaAuto}>↻ auto</button>
                        : <span className="rv-hint-inline">auto (jul/ago o &gt;10n: 90 € · resto: 80 €)</span>}
                    </label>
                    <input type="number" step="0.01" value={draft.gasto_limpieza || 0} onChange={e => updateDraft('gasto_limpieza', Number(e.target.value))} />
                  </div>
                </div>
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>Pago previo</label>
                    <input type="number" step="0.01" value={draft.pago_previo || 0} onChange={e => updateDraft('pago_previo', Number(e.target.value))} />
                  </div>
                  <div className="rv-field">
                    <label>Al check-in</label>
                    <input type="number" step="0.01" value={draft.al_checkin || 0} onChange={e => updateDraft('al_checkin', Number(e.target.value))} />
                  </div>
                </div>
                <div className="rv-field">
                  <label>Fianza tomada</label>
                  <select value={draft.fianza ? 'si' : 'no'} onChange={e => updateDraft('fianza', e.target.value === 'si')}>
                    <option value="no">No</option>
                    <option value="si">Sí (300 €)</option>
                  </select>
                </div>

                <div className="rv-calc-block">
                  <div className="rv-calc-block-title">Calculado automáticamente</div>
                  <div className="rv-calc-grid">
                    <div><span>Noches</span><strong>{draft.noches || '—'}</strong></div>
                    <div><span>BAI</span><strong>{fmtEur(draft.bai)}</strong></div>
                    <div><span>Rentabilidad</span><strong>{fmtPct(draft.rentabilidad_pct)}</strong></div>
                    <div><span>Bruto/noche</span><strong>{fmtEur(draft.precio_bruto_noche)}</strong></div>
                    <div><span>Neto/noche</span><strong>{fmtEur(draft.precio_neto_noche)}</strong></div>
                    {(() => {
                      const renta = Math.max(0, (Number(draft.ingreso_total)||0) - (Number(draft.al_checkin)||0));
                      return <div><span>Renta declarable<br/><em className="rv-calc-em">ingreso − cash checkin</em></span><strong>{fmtEur(renta)}</strong></div>;
                    })()}
                    {(() => {
                      const eurHuespNoche = (draft.noches > 0 && draft.huespedes > 0 && draft.ingreso_total > 0)
                        ? (draft.ingreso_total / draft.noches / draft.huespedes) : null;
                      return <div><span>€/huésped/noche</span><strong>{fmtEur(eurHuespNoche)}</strong></div>;
                    })()}
                    {(() => {
                      if (!draft.entrada || !draft.f_reserva) return null;
                      const dE = new Date(draft.entrada); const dF = new Date(draft.f_reserva);
                      const dias = Math.round((dE.getTime() - dF.getTime()) / 86400000);
                      return <div><span>Antelación</span><strong>{dias} días</strong></div>;
                    })()}
                    {(() => {
                      const ingreso = Number(draft.ingreso_total)||0;
                      const com = Number(draft.comision)||0;
                      const pct = ingreso > 0 ? com / ingreso : 0;
                      return <div><span>Comisión efectiva</span><strong>{fmtPct(pct)}</strong></div>;
                    })()}
                  </div>
                </div>
              </fieldset>

              <fieldset><legend>Observaciones</legend>
                <div className="rv-field">
                  <textarea rows="3" value={draft.observaciones || ''} onChange={e => updateDraft('observaciones', e.target.value)} placeholder="Notas internas, peticiones especiales, etc."></textarea>
                </div>
              </fieldset>
            </div>

            <footer className="rv-edit-foot">
              {selectedIdx >= 0 && selectedIdx < reservas.length && (
                <button type="button" className="pe-btn pe-btn-ghost rv-btn-danger" onClick={deleteRow}>🗑 Borrar</button>
              )}
              <div className="rv-edit-foot-right">
                <button type="button" className="pe-btn pe-btn-ghost" onClick={cancelDraft}>Cancelar</button>
                <button type="button" className="pe-btn pe-btn-primary" onClick={saveDraft}>Guardar</button>
              </div>
            </footer>
          </aside>
        </>
      )}
    </>
  );
};


const AdminApp = () => {
  const [phase,    setPhase]    = React.useState('login');
  const [mode,     setMode]     = React.useState('pricing');  // 'pricing' | 'reviews' | 'analytics' | 'contract' | 'reservas'
  const [token,    setToken]    = React.useState('');
  const [data,     setData]     = React.useState(null);
  const [sha,      setSha]      = React.useState(null);
  const [reviewsData, setReviewsData] = React.useState(null);
  const [reviewsSha,  setReviewsSha]  = React.useState(null);
  const [calJson,  setCalJson]  = React.useState('');
  const [calOk,    setCalOk]    = React.useState(true);
  const [calErr,   setCalErr]   = React.useState('');
  const [error,    setError]    = React.useState(null);
  const [success,  setSuccess]  = React.useState(null);
  const [addMode, setAddMode] = React.useState(null); // null | 'manual' | 'paste'
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterSource, setFilterSource] = React.useState('all');
  const [filterApt,    setFilterApt]    = React.useState('all');

  const login = async (e) => {
    e.preventDefault();
    setPhase('loading');
    setError(null);
    try {
      const t = token.trim();
      if (!t) throw new Error('Token vacío.');
      const ok = await fetch(`${API}/repos/${REPO}`, { headers: apiHeaders(t) });
      if (!ok.ok) throw new Error(`Token inválido o sin acceso al repo (HTTP ${ok.status}).`);
      // 1) Pricing
      const fr = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(t) });
      if (!fr.ok) throw new Error(`No se pudo leer ${PATH} (HTTP ${fr.status}).`);
      const file   = await fr.json();
      const text   = b64ToUtf8(file.content);
      const parsed = JSON.parse(text);
      setData(parsed);
      setSha(file.sha);
      setCalJson(JSON.stringify({
        calendar: parsed.calendar,
        bookingHorizon: parsed.bookingHorizon,
      }, null, 2));
      setCalOk(true); setCalErr('');
      // 2) Reviews (best-effort: no rompe login si falla)
      try {
        const fr2 = await fetch(`${API}/repos/${REPO}/contents/${REVIEWS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(t) });
        if (fr2.ok) {
          const file2 = await fr2.json();
          const parsed2 = JSON.parse(b64ToUtf8(file2.content));
          setReviewsData(parsed2);
          setReviewsSha(file2.sha);
        }
      } catch (_) { /* reviews opcional */ }
      setPhase('ready');
    } catch (err) {
      setError(err.message);
      setPhase('login');
    }
  };

  const logout = () => {
    setToken(''); setData(null); setSha(null); setCalJson('');
    setReviewsData(null); setReviewsSha(null);
    setError(null); setSuccess(null);
    setPhase('login');
  };

  // ---- Helpers para reviews ----
  const updateReview = (id, key, value) => {
    setReviewsData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const idx = next.items.findIndex(r => r.id === id);
      if (idx >= 0) next.items[idx][key] = value;
      return next;
    });
  };
  const removeReview = (id) => {
    if (!confirm('¿Eliminar esta review? No se puede deshacer.')) return;
    setReviewsData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.items = next.items.filter(r => r.id !== id);
      return next;
    });
  };
  const addReview = (newItem) => {
    setReviewsData(prev => {
      const next = JSON.parse(JSON.stringify(prev || { items: [] }));
      next.items = [newItem, ...(next.items || [])];
      return next;
    });
  };

  const saveReviews = async () => {
    setPhase('saving'); setError(null); setSuccess(null);
    try {
      const merged = {
        ...reviewsData,
        version: (reviewsData.version || 1),
        updatedAt: new Date().toISOString(),
      };
      const body = JSON.stringify({
        message: `chore(reviews): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
        content: utf8ToB64(JSON.stringify(merged, null, 2) + '\n'),
        sha: reviewsSha,
        branch: BRANCH,
      });
      const r = await fetch(`${API}/repos/${REPO}/contents/${REVIEWS_PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(`Guardado fallido (HTTP ${r.status}): ${j.message || ''}`);
      }
      const result = await r.json();
      setReviewsSha(result.content.sha);
      setReviewsData(merged);
      setSuccess('Reviews guardadas. Pages re-desplegará en ~30 s.');
      setPhase('ready');
    } catch (err) {
      setError(err.message); setPhase('ready');
    }
  };

  const update = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateCalJson = (text) => {
    setCalJson(text);
    try {
      const p = JSON.parse(text);
      if (!p.calendar || !p.bookingHorizon) {
        setCalOk(false); setCalErr('Falta "calendar" o "bookingHorizon".'); return;
      }
      setCalOk(true); setCalErr('');
    } catch (err) {
      setCalOk(false); setCalErr(err.message);
    }
  };

  const save = async () => {
    if (!calOk) { setError('El JSON del calendario no es válido. Corrígelo antes de guardar.'); return; }
    setPhase('saving'); setError(null); setSuccess(null);
    try {
      const calParsed = JSON.parse(calJson);
      const merged = {
        ...data,
        calendar:       calParsed.calendar,
        bookingHorizon: calParsed.bookingHorizon,
        version:   (data.version || 1),
        updatedAt: new Date().toISOString(),
      };
      const body = JSON.stringify({
        message: `chore(prices): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
        content: utf8ToB64(JSON.stringify(merged, null, 2) + '\n'),
        sha,
        branch:  BRANCH,
      });
      const r = await fetch(`${API}/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(`Guardado fallido (HTTP ${r.status}): ${j.message || ''}`);
      }
      const result = await r.json();
      setSha(result.content.sha);
      setData(merged);
      setSuccess('Guardado en GitHub. Pages re-desplegará en ~30 s.');
      setPhase('ready');
    } catch (err) {
      setError(err.message);
      setPhase('ready');
    }
  };

  // -------- Render --------

  if (phase === 'login') {
    return (
      <div className="pe-shell">
        <div className="pe-card">
          <h1>Hestía · Pricing Edit</h1>
          <p className="pe-lede">
            Edición segura de <code>{PATH}</code>. Pega tu Personal Access Token de GitHub
            con permiso <code>contents: write</code> sobre <code>{REPO}</code>.
            El token vive solo en memoria del navegador — no se persiste.
          </p>
          <form onSubmit={login}>
            <label className="pe-lbl">Personal Access Token</label>
            <input
              type="password"
              autoComplete="off"
              spellCheck="false"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_… o github_pat_…"
              className="pe-input pe-mono"
              required
            />
            <button type="submit" className="pe-btn pe-btn-primary">Entrar</button>
            {error && <div className="pe-error">{error}</div>}
          </form>
          <div className="pe-help">
            <strong>¿Cómo crear el PAT?</strong>
            <ol>
              <li>GitHub → Settings → Developer settings → Personal access tokens → <em>Fine-grained tokens</em>.</li>
              <li>Repository access → Only select repositories → <code>{REPO}</code>.</li>
              <li>Repository permissions → <strong>Contents: Read and write</strong>.</li>
              <li>Generate, copia el token (empieza por <code>github_pat_</code>) y pégalo aquí.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'saving') {
    return <div className="pe-shell"><div className="pe-card"><p>{phase === 'loading' ? 'Autenticando y cargando…' : 'Guardando…'}</p></div></div>;
  }

  // ---- Reviews — listado y filtros ----
  const renderReviewsTab = () => {
    if (!reviewsData) {
      return (
        <div className="pe-card">
          <p className="pe-error">No se pudo cargar <code>{REVIEWS_PATH}</code>. Comprueba que el archivo existe.</p>
        </div>
      );
    }
    const items = (reviewsData.items || []).slice();
    items.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return (b.date || '').localeCompare(a.date || '');
    });
    const filtered = items.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterSource !== 'all' && r.source !== filterSource) return false;
      if (filterApt    !== 'all' && r.apt    !== filterApt && r.apt !== 'all') return false;
      return true;
    });
    const counts = {
      all: items.length,
      pending:   items.filter(r => r.status === 'pending').length,
      published: items.filter(r => r.status === 'published').length,
    };
    // Counts por fuente y por apt (respetan el resto de filtros activos
    // para que el huésped vea cuántas hay tras el filtrado combinado).
    const baseForSrc = items
      .filter(r => filterStatus === 'all' || r.status === filterStatus)
      .filter(r => filterApt    === 'all' || r.apt    === filterApt    || r.apt === 'all');
    const baseForApt = items
      .filter(r => filterStatus === 'all' || r.status === filterStatus)
      .filter(r => filterSource === 'all' || r.source === filterSource);
    const srcCounts = {
      all: baseForSrc.length,
      ...Object.fromEntries(REVIEW_SOURCES.map(s => [s.id, baseForSrc.filter(r => r.source === s.id).length])),
    };
    const aptCounts = {
      all: baseForApt.length,
      ...Object.fromEntries(REVIEW_APTS.filter(a => a.id !== 'all').map(a =>
        [a.id, baseForApt.filter(r => r.apt === a.id || r.apt === 'all').length]
      )),
    };
    return (
      <>
        <div className="pe-card">
          <h2>Reviews · {filtered.length} de {counts.all} · <strong>{counts.pending} pendientes</strong></h2>
          <div className="pe-rev-filters">
            <div className="pe-rev-filter-group">
              <span className="pe-rev-flbl">Estado</span>
              {[['all','Todas',counts.all], ['pending','Pendientes',counts.pending], ['published','Publicadas',counts.published]].map(([id,lbl,n]) => (
                <button key={id} type="button"
                  className={`pe-btn pe-btn-sm${filterStatus === id ? ' pe-btn-primary' : ' pe-btn-ghost'}`}
                  onClick={() => setFilterStatus(id)}>{lbl} ({n})</button>
              ))}
            </div>
            <div className="pe-rev-filter-group">
              <span className="pe-rev-flbl">Fuente</span>
              <button type="button"
                className={`pe-btn pe-btn-sm${filterSource === 'all' ? ' pe-btn-primary' : ' pe-btn-ghost'}`}
                onClick={() => setFilterSource('all')}>Todas ({srcCounts.all})</button>
              {REVIEW_SOURCES.map(s => (
                <button key={s.id} type="button"
                  className={`pe-btn pe-btn-sm${filterSource === s.id ? ' pe-btn-primary' : ' pe-btn-ghost'}`}
                  onClick={() => setFilterSource(s.id)}>{s.short} ({srcCounts[s.id]})</button>
              ))}
            </div>
            <div className="pe-rev-filter-group">
              <span className="pe-rev-flbl">Hestía</span>
              <button type="button"
                className={`pe-btn pe-btn-sm${filterApt === 'all' ? ' pe-btn-primary' : ' pe-btn-ghost'}`}
                onClick={() => setFilterApt('all')}>Todas ({aptCounts.all})</button>
              {REVIEW_APTS.filter(a => a.id !== 'all').map(a => (
                <button key={a.id} type="button"
                  className={`pe-btn pe-btn-sm${filterApt === a.id ? ' pe-btn-primary' : ' pe-btn-ghost'}`}
                  onClick={() => setFilterApt(a.id)}>{a.label} ({aptCounts[a.id]})</button>
              ))}
            </div>
          </div>
          <div className="pe-rev-add-actions" style={{marginTop:16, display:'flex', gap:8, flexWrap:'wrap'}}>
            <button
              type="button"
              className={`pe-btn ${addMode === 'paste' ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
              onClick={() => setAddMode(m => m === 'paste' ? null : 'paste')}>
              {addMode === 'paste' ? '× Cancelar' : '📋 Pegar desde email'}
            </button>
            <button
              type="button"
              className={`pe-btn ${addMode === 'manual' ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
              onClick={() => setAddMode(m => m === 'manual' ? null : 'manual')}>
              {addMode === 'manual' ? '× Cancelar' : '+ Añadir manualmente'}
            </button>
          </div>
        </div>

        {addMode === 'paste' && (
          <div className="pe-card">
            <PasteFromEmail
              onAdd={item => { addReview(item); setAddMode(null); }}
              onCancel={() => setAddMode(null)}
            />
          </div>
        )}
        {addMode === 'manual' && (
          <div className="pe-card">
            <NewReviewForm
              onAdd={item => { addReview(item); setAddMode(null); }}
              onCancel={() => setAddMode(null)}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="pe-card"><p className="pe-hint">Sin reviews para este filtro.</p></div>
        ) : (
          filtered.map(r => (
            <ReviewRow key={r.id} review={r}
              onChange={(key, val) => updateReview(r.id, key, val)}
              onRemove={() => removeReview(r.id)}/>
          ))
        )}

        <div className="pe-actions">
          <button onClick={saveReviews} className="pe-btn pe-btn-primary">Guardar reviews y desplegar</button>
          <span className="pe-hint">Commitea a <code>{BRANCH}</code> y GitHub Pages re-despliega solo.</span>
        </div>
      </>
    );
  };

  // phase === 'ready'
  return (
    <div className="pe-shell">
      <div className="pe-topbar">
        <span>Hestía · Admin</span>
        <span className="pe-meta">
          {mode === 'pricing' ? `Precios actualizados: ${data.updatedAt || '—'}` :
           reviewsData ? `${(reviewsData.items || []).length} reviews` : ''}
        </span>
        <button onClick={logout} className="pe-btn pe-btn-ghost">Cerrar sesión</button>
      </div>

      <div className="pe-tabs">
        <button type="button"
          className={`pe-tab${mode === 'pricing' ? ' is-active' : ''}`}
          onClick={() => { setMode('pricing'); setError(null); setSuccess(null); }}>
          💰 Pricing
        </button>
        <button type="button"
          className={`pe-tab${mode === 'reviews' ? ' is-active' : ''}`}
          onClick={() => { setMode('reviews'); setError(null); setSuccess(null); }}>
          ⭐ Reviews
          {reviewsData && (() => {
            const pending = (reviewsData.items || []).filter(r => r.status === 'pending').length;
            return pending > 0 ? <span className="pe-tab-badge">{pending}</span> : null;
          })()}
        </button>
        <button type="button"
          className={`pe-tab${mode === 'analytics' ? ' is-active' : ''}`}
          onClick={() => { setMode('analytics'); setError(null); setSuccess(null); }}>
          📊 Analítica
        </button>
        <button type="button"
          className={`pe-tab${mode === 'contract' ? ' is-active' : ''}`}
          onClick={() => { setMode('contract'); setError(null); setSuccess(null); }}>
          📄 Contrato
        </button>
        <button type="button"
          className={`pe-tab${mode === 'reservas' ? ' is-active' : ''}`}
          onClick={() => { setMode('reservas'); setError(null); setSuccess(null); }}>
          🗓️ Reservas
        </button>
        <button type="button"
          className={`pe-tab${mode === 'leila' ? ' is-active' : ''}`}
          onClick={() => { setMode('leila'); setError(null); setSuccess(null); }}>
          💳 Leila
        </button>
      </div>

      {success && <div className="pe-success">{success}</div>}
      {error   && <div className="pe-error">{error}</div>}

      {mode === 'analytics' ? <AnalyticsTab /> : mode === 'contract' ? <ContractTab pricesData={data} /> : mode === 'reservas' ? <ReservasTab token={token} /> : mode === 'leila' ? <LeilaTab token={token} /> : mode === 'reviews' ? renderReviewsTab() : (
      <>
      <div className="pe-card">
        <h2>Precios base por noche · 2 huéspedes · temporada baja</h2>
        <div className="pe-grid">
          {Object.entries(data.apts).map(([id, apt]) => (
            <div key={id} className="pe-field">
              <label>{apt.name}</label>
              <div className="pe-input-row">
                <input
                  type="number" step="1" min="0"
                  value={apt.base}
                  onChange={e => update(`apts.${id}.base`, Number(e.target.value))}
                  className="pe-input pe-input-num"
                />
                <span className="pe-suffix">€</span>
              </div>
              <small className="pe-hint">{apt.vft}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="pe-card">
        <h2>Multiplicadores de temporada</h2>
        <div className="pe-grid">
          {Object.entries(data.seasons).map(([id, s]) => (
            <div key={id} className="pe-field">
              <label>
                <span className="pe-dot" style={{background:s.color}}/>
                {s.label}
              </label>
              <div className="pe-input-row">
                <input
                  type="number" step="0.05" min="1"
                  value={s.multiplier}
                  onChange={e => update(`seasons.${id}.multiplier`, Number(e.target.value))}
                  className="pe-input pe-input-num"
                />
                <span className="pe-suffix">× base</span>
              </div>
              {Object.entries(data.apts).map(([aid, apt]) => (
                <small key={aid} className="pe-hint">{apt.name_short || apt.name.split(' ').pop()}: {(apt.base * s.multiplier).toFixed(2)} €</small>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="pe-card">
        <h2>Reglas globales</h2>
        <div className="pe-grid">
          <div className="pe-field">
            <label>Huésped extra (€/noche, desde el 3.º)</label>
            <input type="number" min="0" step="1"
              value={data.rules.extraGuestPerNight}
              onChange={e => update('rules.extraGuestPerNight', Number(e.target.value))}
              className="pe-input pe-input-num" />
          </div>
          <div className="pe-field">
            <label>Estancia mínima (noches)</label>
            <input type="number" min="1" step="1"
              value={data.rules.minNights}
              onChange={e => update('rules.minNights', Number(e.target.value))}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Mínimo por defecto fuera de temporada crítica.</small>
          </div>
          <div className="pe-field">
            <label>Ventana de estancia corta (días)</label>
            <input type="number" min="0" step="1"
              value={data.rules.imminentDays}
              onChange={e => update('rules.imminentDays', Number(e.target.value))}
              className="pe-input pe-input-num" />
            <small className="pe-hint">
              Si el check-in es dentro de este número de días, se permite el mínimo
              de estancia corta (típicamente 2 noches). Pon 0 para desactivar.
            </small>
          </div>
          <div className="pe-field">
            <label>Mínimo en estancia corta (noches)</label>
            <input type="number" min="1" max="7" step="1"
              value={data.rules.twoNightFloor}
              onChange={e => update('rules.twoNightFloor', Number(e.target.value))}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Cuántas noches admitir dentro de la ventana corta. Por defecto 2.</small>
          </div>
          <div className="pe-field">
            <label>Mínimo en temporada crítica (noches)</label>
            <input type="number" min="1" step="1"
              value={data.rules.criticalSeasonMinNights}
              onChange={e => update('rules.criticalSeasonMinNights', Number(e.target.value))}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Solo aplica en fechas marcadas como crítica.</small>
          </div>
          <div className="pe-field">
            <label>Descuento reserva directa (0–1)</label>
            <input type="number" min="0" max="1" step="0.01"
              value={data.rules.directDiscount}
              onChange={e => update('rules.directDiscount', Number(e.target.value))}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Ej. 0.09 = −9 % vs Booking/Airbnb</small>
          </div>
          <div className="pe-field">
            <label>Suplemento mascota (€/estancia)</label>
            <input type="number" min="0" step="1"
              value={data.rules.petFlatFee}
              onChange={e => update('rules.petFlatFee', Number(e.target.value))}
              className="pe-input pe-input-num" />
          </div>
        </div>
      </div>

      <div className="pe-card">
        <h2>Suplementos por huésped</h2>
        <p className="pe-lede">
          Precio escalonado por número de huéspedes. Cada fila es el
          coste adicional <strong>por noche</strong> al subir un escalón.
          Base = 1 huésped. Ej. 2 huéspedes = 1 huésped + suplemento 1→2;
          4 huéspedes = 1 huésped + suplemento 1→2 + 2→3 + 3→4.
        </p>
        <table className="pe-table pe-table-extras">
          <thead>
            <tr>
              <th style={{width: 80}}>De</th>
              <th style={{width: 80}}>A</th>
              <th style={{width: 140}}>€/noche</th>
              <th>Etiqueta</th>
              <th style={{width: 80}}></th>
            </tr>
          </thead>
          <tbody>
            {(data.rules.guestSupplements || []).map((g, i) => (
              <tr key={i}>
                <td>
                  <input type="number" min="1" max="10" step="1"
                    value={g.from}
                    onChange={e => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], from: Number(e.target.value) };
                      update('rules.guestSupplements', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <input type="number" min="1" max="10" step="1"
                    value={g.to}
                    onChange={e => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], to: Number(e.target.value) };
                      update('rules.guestSupplements', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <input type="number" min="0" step="1"
                    value={g.perNight}
                    onChange={e => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], perNight: Number(e.target.value) };
                      update('rules.guestSupplements', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <input type="text"
                    value={g.label || ''}
                    onChange={e => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], label: e.target.value };
                      update('rules.guestSupplements', arr);
                    }}
                    className="pe-input" />
                </td>
                <td>
                  <button type="button"
                    className="pe-btn pe-btn-ghost"
                    onClick={() => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr.splice(i, 1);
                      update('rules.guestSupplements', arr);
                    }}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button"
          className="pe-btn pe-btn-ghost"
          style={{marginTop: 12}}
          onClick={() => {
            const arr = (data.rules.guestSupplements || []).slice();
            const lastTo = arr.length ? arr[arr.length - 1].to : 1;
            arr.push({ from: lastTo, to: lastTo + 1, perNight: 0, label: `${lastTo} → ${lastTo + 1} huéspedes` });
            update('rules.guestSupplements', arr);
          }}>+ Añadir escalón</button>
      </div>

      <div className="pe-card">
        <h2>Extras configurables</h2>
        <p className="pe-lede">
          Items opcionales que el huésped puede pedir desde el formulario
          de reserva. Edita label, precio y unidad. Eliminar una fila la
          quita de la web.
        </p>
        <table className="pe-table pe-table-extras">
          <thead>
            <tr>
              <th style={{minWidth: 110}}>ID</th>
              <th>Label ES</th>
              <th>Label EN</th>
              <th style={{width: 100}}>Precio (€)</th>
              <th style={{width: 130}}>Unidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data.rules.extras || []).map((ex, i) => (
              <tr key={ex.id || i}>
                <td>
                  <input type="text"
                    value={ex.id}
                    onChange={e => {
                      const arr = (data.rules.extras || []).slice();
                      arr[i] = { ...arr[i], id: e.target.value.trim() };
                      update('rules.extras', arr);
                    }}
                    className="pe-input pe-mono" />
                </td>
                <td>
                  <input type="text"
                    value={ex.label_es}
                    onChange={e => {
                      const arr = (data.rules.extras || []).slice();
                      arr[i] = { ...arr[i], label_es: e.target.value };
                      update('rules.extras', arr);
                    }}
                    className="pe-input" />
                </td>
                <td>
                  <input type="text"
                    value={ex.label_en}
                    onChange={e => {
                      const arr = (data.rules.extras || []).slice();
                      arr[i] = { ...arr[i], label_en: e.target.value };
                      update('rules.extras', arr);
                    }}
                    className="pe-input" />
                </td>
                <td>
                  <input type="number" min="0" step="1"
                    value={ex.price}
                    onChange={e => {
                      const arr = (data.rules.extras || []).slice();
                      arr[i] = { ...arr[i], price: Number(e.target.value) };
                      update('rules.extras', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <select
                    value={ex.unit}
                    onChange={e => {
                      const arr = (data.rules.extras || []).slice();
                      arr[i] = { ...arr[i], unit: e.target.value };
                      update('rules.extras', arr);
                    }}
                    className="pe-input">
                    <option value="estancia">por estancia</option>
                    <option value="noche">por noche</option>
                    <option value="hora">por hora</option>
                    <option value="set">por set</option>
                    <option value="unidad">por unidad</option>
                  </select>
                </td>
                <td style={{textAlign:'right'}}>
                  <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
                    onClick={() => {
                      const arr = (data.rules.extras || []).slice();
                      arr.splice(i, 1);
                      update('rules.extras', arr);
                    }}
                    aria-label="Eliminar">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
          style={{marginTop: 8}}
          onClick={() => {
            const arr = (data.rules.extras || []).slice();
            arr.push({
              id: 'nuevo' + (arr.length + 1),
              label_es: 'Nuevo extra',
              label_en: 'New extra',
              price: 0,
              unit: 'estancia',
            });
            update('rules.extras', arr);
          }}>+ Extra</button>
      </div>

      <div className="pe-card">
        <h2>Estancia corta · precio penalizado</h2>
        <p className="pe-lede">
          Para empujar a estancias de 5+ noches, las de 3 y 4 se cotizan
          como si duraran más, menos un descuento fijo. Ej.: 3 noches =
          precio de 5 noches − 10 €. Vacía la tabla para desactivar.
        </p>
        <table className="pe-table">
          <thead>
            <tr>
              <th>Noches reales</th>
              <th>Calcular como (noches)</th>
              <th>Descuento fijo (€)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data.rules.shortStayPricing || []).map((r, i) => (
              <tr key={i}>
                <td>
                  <input type="number" min="1" step="1"
                    value={r.nights}
                    onChange={e => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr[i] = { ...arr[i], nights: Number(e.target.value) };
                      update('rules.shortStayPricing', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <input type="number" min="1" step="1"
                    value={r.basedOnNights}
                    onChange={e => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr[i] = { ...arr[i], basedOnNights: Number(e.target.value) };
                      update('rules.shortStayPricing', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <input type="number" min="0" step="1"
                    value={r.discount}
                    onChange={e => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr[i] = { ...arr[i], discount: Number(e.target.value) };
                      update('rules.shortStayPricing', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td style={{textAlign:'right'}}>
                  <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
                    onClick={() => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr.splice(i, 1);
                      update('rules.shortStayPricing', arr);
                    }}
                    aria-label="Eliminar">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
          style={{marginTop: 8}}
          onClick={() => {
            const arr = (data.rules.shortStayPricing || []).slice();
            const last = arr[arr.length - 1];
            const nextN = last ? last.nights + 1 : 3;
            arr.push({ nights: nextN, basedOnNights: nextN + 2, discount: 10 });
            update('rules.shortStayPricing', arr);
          }}>+ Regla</button>
      </div>

      <div className="pe-card">
        <h2>Descuentos por estancia larga</h2>
        <table className="pe-table">
          <thead>
            <tr>
              <th>Mín. noches</th>
              <th>Descuento (0–1)</th>
              <th>No aplica en</th>
            </tr>
          </thead>
          <tbody>
            {data.rules.stayDiscounts.map((d, i) => (
              <tr key={i}>
                <td>
                  <input type="number" min="1" step="1"
                    value={d.minNights}
                    onChange={e => {
                      const arr = data.rules.stayDiscounts.slice();
                      arr[i] = { ...arr[i], minNights: Number(e.target.value) };
                      update('rules.stayDiscounts', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <input type="number" min="0" max="1" step="0.01"
                    value={d.pct}
                    onChange={e => {
                      const arr = data.rules.stayDiscounts.slice();
                      arr[i] = { ...arr[i], pct: Number(e.target.value) };
                      update('rules.stayDiscounts', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td className="pe-mono pe-hint">{(d.excludeSeasons || []).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CalendarEditor
        calJson={calJson}
        setCalJson={setCalJson}
        updateCalJson={updateCalJson}
        calOk={calOk}
        calErr={calErr}
        seasons={data.seasons}
      />

      <div className="pe-actions">
        <button onClick={save} disabled={!calOk} className="pe-btn pe-btn-primary">
          Guardar y desplegar
        </button>
        <span className="pe-hint">El cambio se commitea a <code>{BRANCH}</code> y GitHub Pages re-despliega solo.</span>
      </div>
      </>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp/>);
