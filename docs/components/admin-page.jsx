// ============================================================
// HESTÍA · ADMIN — /p-edit.html
// Editor de docs/data/prices.json + docs/data/reviews.json.
// Login con GitHub PAT (permiso contents:write sobre el repo).
// El token vive solo en memoria — nunca en el repo ni localStorage.
// Tabs: [ Pricing ] [ Reviews ]
// ============================================================

const REPO         = 'aberruezo-ops/hestia';
const PRIVATE_REPO = 'aberruezo-ops/hestia-data';
const PATH         = 'docs/data/prices.json';
const REVIEWS_PATH = 'docs/data/reviews.json';
const BRANCH = 'main';
const API    = 'https://api.github.com';

// Cloudflare Web Analytics — Worker proxy + identificadores (no secretos)
const CF_WORKER_URL = 'https://little-night-9399.hestia-vera-almeria.workers.dev/';
const CF_ACCOUNT    = 'ccb910d549f39e3bad5d89e33315d57e';
const CF_SITE_TAG   = '770c05669c6b45ea8f1026576fe7dcce';

// URL del Worker de Cloudflare que escribe en Google Sheets.
// Despliega workers/sheets-sync/ y pega la URL aquí.
const SHEETS_WORKER_URL = 'https://hestia-sheets-sync.SUSTITUIR.workers.dev';

// URL del Worker de pago (workers/pago/). Sustituir tras wrangler deploy.
const PAGO_WORKER_URL = 'https://hestia-pago.SUSTITUIR.workers.dev';
const PAGO_PAGE_URL   = 'https://www.hestiayourhome.com/pago.html';

const APT_FULL = {
  vm: 'Hestía Mar',
  vt: 'Hestía Thalassa',
  vs: 'Hestía Salinas',
};

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
    heroPhoto: 'assets/apt-vs-collage-header.jpg',
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

// NumInput — resuelve el problema clásico de React con inputs numéricos
// controlados: imposibilidad de borrar un "0", punto decimal eliminado al vuelo.
// Mantiene estado string local mientras el campo está activo; solo confirma
// al parent cuando hay un número válido completo. Selecciona todo al enfocar.
const NumInput = ({ value, onChange, min, max, step, className, placeholder, disabled, readOnly, style, title }) => {
  const isDecimal = step != null && String(step).includes('.');
  const [str, setStr] = React.useState(() => value == null ? '' : String(value));
  const active = React.useRef(false);

  React.useEffect(() => {
    if (!active.current) setStr(value == null ? '' : String(value));
  }, [value]);

  const commit = (v) => {
    if (v === '' || v === '-' || v === '.' || v.endsWith('.')) return;
    const n = Number(v);
    if (!isNaN(n)) onChange(n);
  };

  return (
    <input
      type="text"
      inputMode={isDecimal ? 'decimal' : 'numeric'}
      value={str}
      className={className}
      placeholder={placeholder ?? '0'}
      disabled={disabled}
      readOnly={readOnly}
      style={style}
      title={title}
      onChange={e => {
        const v = e.target.value.replace(',', '.');  // iOS locale decimal comma → period
        if (!/^-?\d*\.?\d*$/.test(v)) return;
        setStr(v);
        commit(v);
      }}
      onFocus={e => { active.current = true; e.target.select(); }}
      onBlur={() => {
        active.current = false;
        const n = parseFloat(str);
        if (isNaN(n) || str === '') { setStr('0'); onChange(0); }
        else { setStr(String(n)); }
      }}
    />
  );
};

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

const ReviewRow = ({ review, onChange, onRemove, onApprove }) => {
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
        {isPending && onApprove && (
          <button type="button" className="pe-btn pe-btn-sm pe-rev-approve-btn"
            onClick={e => { e.stopPropagation(); onApprove(review.id); }}
            title="Aprobar y publicar ahora">✓ Aprobar</button>
        )}
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
              <NumInput min={0} max={review.source === 'booking' ? 10 : 5} step={0.1}
                value={review.rating} onChange={v => onChange('rating', v)} className="pe-input"/>
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
          <NumInput min={0} max={source === 'booking' ? 10 : 5} step={0.1}
            value={rating} onChange={v => setRating(v)} className="pe-input"/>
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
// DashboardTab — resumen histórico + live 2026
// ============================================================

const dashFmtMoney = v => v >= 1000
  ? (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k€'
  : Math.round(v) + '€';
const dashFmtPct = v => v.toFixed(1) + '%';

const CANAL_COLORS = {
  Directo: '#1BC8D8',
  Booking: '#E67E22',
  Airbnb:  '#E74C3C',
  Otro:    '#888888',
};

function compute2026Stats(reservas) {
  const active = reservas.filter(r => {
    if (r.cancelada === true) return false;
    const c = (r.cancelacion || '').trim().toUpperCase();
    return c !== 'CANCELADA';
  });
  const cancelled = reservas.length - active.length;
  const noches    = active.reduce((s, r) => s + (r.noches || 0), 0);
  const ingresos  = active.reduce((s, r) => s + (r.ingreso_total || 0), 0);
  const bai       = active.reduce((s, r) => s + (r.bai || 0), 0);
  const rents     = active.filter(r => r.rent_pct != null).map(r => r.rent_pct);
  const rent_pct  = rents.length ? rents.reduce((a, b) => a + b, 0) / rents.length : 0;
  const precios   = active.filter(r => r.precio_bruto_noche != null).map(r => r.precio_bruto_noche);
  const precio_noche = precios.length ? precios.reduce((a, b) => a + b, 0) / precios.length : 0;

  const canales = {};
  active.forEach(r => {
    const c = r.canal || 'Otro';
    canales[c] = (canales[c] || 0) + 1;
  });

  const apts = { vm: 0, vt: 0, vs: 0 };
  active.forEach(r => {
    const a = (r.apt || '').toLowerCase();
    if (a in apts) apts[a]++;
    else apts.vs = (apts.vs || 0) + 1;
  });

  const monthly_ingresos = {};
  const monthly_res = {};
  active.forEach(r => {
    if (!r.entrada) return;
    const key = r.entrada.slice(0, 7);
    monthly_ingresos[key] = (monthly_ingresos[key] || 0) + (r.ingreso_total || 0);
    monthly_res[key]      = (monthly_res[key] || 0) + 1;
  });

  return {
    reservas:   active.length,
    canceladas: cancelled,
    noches,
    ingresos,
    bai,
    rent_pct,
    precio_noche,
    canales,
    apts,
    monthly_ingresos,
    monthly_res,
    partial: false,
  };
}

function BarChart({ years, yearData }) {
  const W = 600; const H = 200; const PAD = { t: 28, r: 12, b: 28, l: 52 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };
  const maxVal = Math.max(...years.flatMap(y => [yearData[y].ingresos, yearData[y].bai]), 1);
  const barGroup = inner.w / years.length;
  const bw = Math.min(barGroup * 0.38, 28);
  const gap = bw * 0.25;
  const scaleY = v => inner.h - (v / maxVal) * inner.h;

  return (
    React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, className: 'dash-chart-svg', 'aria-label': 'Ingresos y BAI por año' },
      React.createElement('g', { transform: `translate(${PAD.l},${PAD.t})` },
        [0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = inner.h * (1 - f);
          return React.createElement('g', { key: f },
            React.createElement('line', { x1: 0, x2: inner.w, y1: y, y2: y, stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }),
            React.createElement('text', { x: -6, y: y + 4, textAnchor: 'end', fontSize: 9, fill: 'rgba(255,255,255,0.4)' },
              dashFmtMoney(maxVal * f))
          );
        }),
        years.map((yr, i) => {
          const d = yearData[yr];
          const cx = i * barGroup + barGroup / 2;
          const x1 = cx - gap / 2 - bw;
          const x2 = cx + gap / 2;
          const hI = (d.ingresos / maxVal) * inner.h;
          const hB = (d.bai / maxVal) * inner.h;
          const isPartial = d.partial;
          return React.createElement('g', { key: yr },
            React.createElement('rect', {
              x: x1, y: scaleY(d.ingresos), width: bw, height: hI,
              fill: 'rgba(212,168,74,0.55)',
              stroke: isPartial ? 'rgba(212,168,74,0.4)' : 'none',
              strokeDasharray: isPartial ? '3 2' : 'none',
              rx: 2,
            },
              React.createElement('title', null, `${yr} Ingresos: ${dashFmtMoney(d.ingresos)}`)
            ),
            React.createElement('rect', {
              x: x2, y: scaleY(d.bai), width: bw, height: hB,
              fill: '#1BC8D8',
              opacity: isPartial ? 0.5 : 0.85,
              rx: 2,
            },
              React.createElement('title', null, `${yr} BAI: ${dashFmtMoney(d.bai)}`)
            ),
            React.createElement('text', { x: x1 + bw / 2, y: scaleY(d.ingresos) - 3, textAnchor: 'middle', fontSize: 8, fill: '#D4A84A' },
              dashFmtMoney(d.ingresos)),
            React.createElement('text', { x: x2 + bw / 2, y: scaleY(d.bai) - 3, textAnchor: 'middle', fontSize: 8, fill: '#1BC8D8' },
              dashFmtMoney(d.bai)),
            React.createElement('text', { x: cx, y: inner.h + 14, textAnchor: 'middle', fontSize: 10, fill: 'rgba(255,255,255,0.6)' }, yr),
            isPartial && React.createElement('text', { x: cx, y: inner.h + 24, textAnchor: 'middle', fontSize: 8, fill: 'rgba(255,255,255,0.3)' }, '*')
          );
        })
      )
    )
  );
}

function LineChart({ years, getData, color, label, format }) {
  const W = 340; const H = 160; const PAD = { t: 24, r: 16, b: 24, l: 48 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };
  const vals  = years.map(getData);
  const maxV  = Math.max(...vals, 1);
  const minV  = Math.min(...vals, 0);
  const range = maxV - minV || 1;
  const xStep = inner.w / (years.length - 1 || 1);
  const toX   = i => i * xStep;
  const toY   = v => inner.h - ((v - minV) / range) * inner.h;
  const pts   = vals.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  return (
    React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, className: 'dash-chart-svg', 'aria-label': label },
      React.createElement('g', { transform: `translate(${PAD.l},${PAD.t})` },
        [0, 0.5, 1].map(f => {
          const y = inner.h * (1 - f);
          return React.createElement('g', { key: f },
            React.createElement('line', { x1: 0, x2: inner.w, y1: y, y2: y, stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }),
            React.createElement('text', { x: -6, y: y + 4, textAnchor: 'end', fontSize: 8, fill: 'rgba(255,255,255,0.35)' },
              format(minV + range * f))
          );
        }),
        React.createElement('polyline', { points: pts, fill: 'none', stroke: color, strokeWidth: 2 }),
        vals.map((v, i) => React.createElement('g', { key: years[i] },
          React.createElement('circle', { cx: toX(i), cy: toY(v), r: 3, fill: color }),
          React.createElement('title', null, `${years[i]}: ${format(v)}`),
          React.createElement('text', { x: toX(i), y: toY(v) - 7, textAnchor: 'middle', fontSize: 8, fill: color },
            format(v)),
          React.createElement('text', { x: toX(i), y: inner.h + 14, textAnchor: 'middle', fontSize: 9, fill: 'rgba(255,255,255,0.5)' }, years[i])
        ))
      )
    )
  );
}

function StackedBarChart({ years, yearData }) {
  const W = 380; const H = 180; const PAD = { t: 16, r: 12, b: 28, l: 8 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };
  const barW  = Math.min(inner.w / years.length * 0.7, 36);

  const knownCanals = ['Directo', 'Booking', 'Airbnb', 'Otro'];

  return (
    React.createElement('div', { className: 'dash-chart-box' },
      React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, className: 'dash-chart-svg', 'aria-label': 'Mix canales por año' },
        React.createElement('g', { transform: `translate(${PAD.l},${PAD.t})` },
          years.map((yr, i) => {
            const d = yearData[yr];
            const total = Object.values(d.canales || {}).reduce((a, b) => a + b, 0) || 1;
            const cx = (i + 0.5) * (inner.w / years.length);
            let yOff = inner.h;
            const bars = [];
            const canals = { ...d.canales };
            knownCanals.forEach(c => {
              if (!(c in canals)) return;
              const pct = canals[c] / total;
              const h   = pct * inner.h;
              yOff -= h;
              bars.push(
                React.createElement('rect', {
                  key: c,
                  x: cx - barW / 2, y: yOff, width: barW, height: h,
                  fill: CANAL_COLORS[c] || CANAL_COLORS.Otro,
                  opacity: 0.85,
                },
                  React.createElement('title', null, `${yr} ${c}: ${dashFmtPct(pct * 100)}`)
                )
              );
            });
            const otherKeys = Object.keys(canals).filter(k => !knownCanals.includes(k));
            otherKeys.forEach(c => {
              const pct = canals[c] / total;
              const h   = pct * inner.h;
              yOff -= h;
              bars.push(
                React.createElement('rect', {
                  key: c,
                  x: cx - barW / 2, y: yOff, width: barW, height: h,
                  fill: CANAL_COLORS.Otro,
                  opacity: 0.85,
                },
                  React.createElement('title', null, `${yr} ${c}: ${dashFmtPct(pct * 100)}`)
                )
              );
            });
            return React.createElement('g', { key: yr },
              ...bars,
              React.createElement('text', { x: cx, y: inner.h + 14, textAnchor: 'middle', fontSize: 10, fill: 'rgba(255,255,255,0.6)' }, yr)
            );
          })
        )
      ),
      React.createElement('div', { className: 'dash-legend' },
        knownCanals.map(c =>
          React.createElement('span', { key: c, className: 'dash-legend-item' },
            React.createElement('span', { style: { background: CANAL_COLORS[c], display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4 } }),
            c
          )
        )
      )
    )
  );
}

function ReservasNochesChart({ years, yearData }) {
  const W = 260; const H = 180; const PAD = { t: 24, r: 8, b: 28, l: 44 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };
  const maxRes    = Math.max(...years.map(y => yearData[y].reservas), 1);
  const maxNoches = Math.max(...years.map(y => yearData[y].noches), 1);
  const barGroup  = inner.w / years.length;
  const bw        = Math.min(barGroup * 0.38, 20);
  const gap       = bw * 0.25;

  return (
    React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, className: 'dash-chart-svg', 'aria-label': 'Reservas y noches por año' },
      React.createElement('g', { transform: `translate(${PAD.l},${PAD.t})` },
        years.map((yr, i) => {
          const d   = yearData[yr];
          const cx  = i * barGroup + barGroup / 2;
          const x1  = cx - gap / 2 - bw;
          const x2  = cx + gap / 2;
          const hR  = (d.reservas / maxRes) * inner.h;
          const hN  = (d.noches / maxNoches) * inner.h;
          return React.createElement('g', { key: yr },
            React.createElement('rect', {
              x: x1, y: inner.h - hR, width: bw, height: hR,
              fill: 'rgba(212,168,74,0.75)', rx: 2,
            },
              React.createElement('title', null, `${yr} Reservas: ${d.reservas}`)
            ),
            React.createElement('rect', {
              x: x2, y: inner.h - hN, width: bw, height: hN,
              fill: 'rgba(27,200,216,0.45)', rx: 2,
            },
              React.createElement('title', null, `${yr} Noches: ${d.noches}`)
            ),
            React.createElement('text', { x: cx, y: inner.h + 14, textAnchor: 'middle', fontSize: 10, fill: 'rgba(255,255,255,0.6)' }, yr)
          );
        })
      )
    )
  );
}

// ============================================================
// IntelligenciaTab — panel unificado: tráfico + negocio + acciones
// ============================================================
const IntelligenciaTab = ({ token, onNavigate }) => {
  const [days,     setDays]     = React.useState(30);
  const [cfData,   setCfData]   = React.useState(null);
  const [yearData, setYearData] = React.useState(null);
  const [avail,    setAvail]    = React.useState(null);
  const [loading,  setLoading]  = React.useState(true);
  const [cfError,  setCfError]  = React.useState(null);
  const [bizError, setBizError] = React.useState(null);
  const [open,     setOpen]     = React.useState({ trafico: false, negocio: true, eventos: false });

  const localEvents = (() => {
    try { return JSON.parse(localStorage.getItem('_htevt') || '[]'); } catch (_) { return []; }
  })();
  const fc = {};
  for (const ev of localEvents) fc[ev.name] = (fc[ev.name] || 0) + 1;

  const fetchCF = React.useCallback(async (d) => {
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let json;
      try { json = JSON.parse(txt); } catch (_) { throw new Error('Respuesta no es JSON'); }
      if (json.errors?.length) throw new Error(json.errors[0].message);
      if (json.error) throw new Error(json.error);
      setCfData(json.data?.viewer?.accounts?.[0] || null);
    } catch (e) {
      setCfError(e.message);
    }
  }, []);

  const fetchBiz = React.useCallback(async () => {
    setBizError(null);
    try {
      const [histRes, liveRes, availRes] = await Promise.all([
        fetch('data/dashboard-historico.json'),
        token ? fetch(`https://api.github.com/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}`, {
          headers: { Authorization: `token ${token}` },
        }) : Promise.resolve(null),
        fetch('assets/availability.json'),
      ]);
      if (!histRes.ok) throw new Error('No se pudo cargar el histórico');
      const hist = await histRes.json();
      let live2026 = null;
      if (liveRes && liveRes.ok) {
        const raw  = await liveRes.json();
        const json = JSON.parse(atob(raw.content.replace(/\n/g, '')));
        live2026   = compute2026Stats(json.reservas || []);
      }
      const combined = { ...hist.years };
      if (live2026) combined['2026'] = live2026;
      setYearData(combined);
      if (availRes.ok) setAvail(await availRes.json());
    } catch (e) {
      setBizError(e.message);
    }
  }, [token]);

  const reload = React.useCallback(() => {
    setLoading(true);
    Promise.all([fetchCF(days), fetchBiz()]).finally(() => setLoading(false));
  }, [days, fetchCF, fetchBiz]);

  React.useEffect(() => { reload(); }, [reload]);

  const altaFreeInfo = React.useMemo(() => {
    if (!avail) return null;
    const today = new Date();
    const yr    = today.getFullYear();
    const jul1  = new Date(yr, 6, 1);
    const sep1  = new Date(yr, 8, 1);
    if (today >= sep1) return null;
    const start = today > jul1 ? new Date(today) : new Date(jul1);
    const byApt = {};
    for (const id of ['vm', 'vt', 'vs']) {
      const ranges = avail[id]?.blocked || [];
      let free = 0;
      for (let d = new Date(start); d < sep1; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().slice(0, 10);
        if (!ranges.some(b => ds >= b.start && ds < b.end)) free++;
      }
      byApt[id] = free;
    }
    const total = Object.values(byApt).reduce((a, b) => a + b, 0);
    return { byApt, total };
  }, [avail]);

  const alertas = React.useMemo(() => {
    const out = [];
    const sev = { alta: 0, media: 1, baja: 2 };

    const searches = fc['search_initiated'] || 0;
    const sent     = fc['booking_sent']     || 0;
    if (searches >= 5) {
      const rate = sent / searches;
      if (rate < 0.05) {
        out.push({ sev: 'alta', cat: 'Conversión', title: `Conversión búsqueda→reserva: ${Math.round(rate * 100)}%`, desc: `${sent} de ${searches} búsquedas acaban en reserva. Revisa precios, mínimos de estancia y la fricción del formulario.`, tab: 'pricing' });
      } else if (rate < 0.12) {
        out.push({ sev: 'media', cat: 'Conversión', title: `Conversión al ${Math.round(rate * 100)}% — hay recorrido`, desc: `${sent} reservas de ${searches} búsquedas. Un CTA más directo o un price anchoring más claro podría mejorar el ratio.` });
      }
    }

    if (altaFreeInfo && altaFreeInfo.total > 0) {
      const names   = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' };
      const freeStr = Object.entries(altaFreeInfo.byApt).filter(([, f]) => f > 0).map(([id, f]) => `${names[id]} ${f}d`).join(', ');
      out.push({
        sev: altaFreeInfo.total > 14 ? 'alta' : 'media',
        cat: 'Disponibilidad',
        title: `${altaFreeInfo.total} días libres en julio/agosto`,
        desc: `${freeStr}. Considera activar una oferta de última hora o reforzar la visibilidad en ese período.`,
        tab: 'reservas',
      });
    }

    if (cfData) {
      const pages    = cfData.pages     || [];
      const ctrs     = cfData.countries || [];
      const devs     = cfData.devices   || [];
      const totalPV  = pages.reduce((s, r) => s + r.count, 0) || 1;
      const totalCtr = ctrs.reduce((s, r) => s + r.count, 0)  || 1;
      const totalDev = devs.reduce((s, r) => s + r.count, 0)  || 1;

      const noticiasV = pages.filter(p => (p.dimensions.requestPath || '').includes('noticias')).reduce((s, r) => s + r.count, 0);
      if (noticiasV / totalPV < 0.02) {
        out.push({ sev: 'media', cat: 'SEO', title: 'Blog Noticias invisible en el tráfico', desc: 'Menos del 2% de visitas van al blog. Comparte el artículo mensual en redes y asegúrate de que el enlace esté en la bio de Instagram.' });
      }

      const mob = devs.find(d => (d.dimensions.deviceType || '').toLowerCase().includes('mobile'));
      if (mob && mob.count / totalDev > 0.60) {
        out.push({ sev: 'baja', cat: 'UX Móvil', title: `${Math.round(mob.count / totalDev * 100)}% del tráfico desde móvil`, desc: 'Testea el flujo completo de reserva en iOS y Android con frecuencia.' });
      }

      const foreign = ctrs.filter(c => { const n = (c.dimensions.countryName || '').toLowerCase(); return !n.includes('spain') && !n.includes('españa'); });
      if (foreign.length && foreign[0].count / totalCtr > 0.12) {
        const cn    = foreign[0].dimensions.countryName || '';
        const pct   = Math.round(foreign[0].count / totalCtr * 100);
        const anglo = /united kingdom|reino unido|ireland|australia|united states|canada/i.test(cn);
        out.push({ sev: 'media', cat: 'Contenido', title: `${pct}% del tráfico desde ${cn}`, desc: anglo ? 'Tráfico angloparlante significativo. Verifica que el contenido EN esté completo y publícalo en inglés también.' : `Oportunidad con tráfico de ${cn}. Valora si el contenido cubre sus necesidades.` });
      }
    }

    if (yearData?.['2026']) {
      const d      = yearData['2026'];
      const cans   = d.canales || {};
      const total  = Object.values(cans).reduce((a, b) => a + b, 0) || 1;
      const ota    = (cans['Booking'] || 0) + (cans['Airbnb'] || 0);
      const direct = cans['Directo'] || 0;
      if (total >= 3 && ota / total > 0.65) {
        out.push({ sev: 'alta', cat: 'Canales', title: `${Math.round(ota / total * 100)}% reservas OTA en 2026`, desc: 'Alta dependencia de Booking/Airbnb. Activa newsletter, redes y WhatsApp directo para reducir comisiones.', tab: 'pricing' });
      } else if (total >= 3 && direct / total > 0.45) {
        out.push({ sev: 'baja', cat: 'Canales', title: `${Math.round(direct / total * 100)}% reservas directas — buen ratio`, desc: 'Mantén los canales directos activos y sigue priorizando WhatsApp y la reserva sin intermediarios.' });
      }
    }

    if (yearData) {
      const yrs = Object.keys(yearData).sort().filter(y => !yearData[y].partial);
      if (yrs.length >= 2) {
        const last = yearData[yrs[yrs.length - 1]];
        const prev = yearData[yrs[yrs.length - 2]];
        if (last.ingresos && prev.ingresos) {
          const delta = (last.ingresos - prev.ingresos) / prev.ingresos;
          if (delta < -0.10) {
            out.push({ sev: 'alta', cat: 'Ingresos', title: `Ingresos ${yrs[yrs.length - 1]} caen ${Math.round(-delta * 100)}% vs ${yrs[yrs.length - 2]}`, desc: 'Tendencia negativa. Revisa ocupación, precios y mix de canales para identificar la causa.' });
          } else if (delta > 0.10) {
            out.push({ sev: 'baja', cat: 'Ingresos', title: `Ingresos crecen ${Math.round(delta * 100)}% vs año anterior`, desc: '¿Hay margen para subir precios en temporada alta sin impactar la ocupación?', tab: 'pricing' });
          }
        }
      }
    }

    if (out.length === 0) {
      out.push({ sev: 'baja', cat: 'Estado', title: 'Sin alertas activas', desc: 'Todo parece bien. Sigue monitorizando semanalmente.' });
    }

    return out.sort((a, b) => sev[a.sev] - sev[b.sev]);
  }, [cfData, yearData, altaFreeInfo, fc]);

  const toggle   = (key) => setOpen(o => ({ ...o, [key]: !o[key] }));
  const totalPV  = cfData ? (cfData.pages     || []).reduce((s, r) => s + r.count, 0) : null;
  const totalCtr = cfData ? (cfData.countries || []).reduce((s, r) => s + r.count, 0) : 0;
  const totalDev = cfData ? (cfData.devices   || []).reduce((s, r) => s + r.count, 0) : 0;
  const topCtry  = cfData ? ((cfData.countries || [])[0]?.dimensions?.countryName || '—') : null;
  const funnConv = (() => { const s = fc['search_initiated'] || 0; const r = fc['booking_sent'] || 0; return s ? Math.round(r / s * 100) + '%' : null; })();
  const stats26  = yearData?.['2026'];
  const years    = yearData ? Object.keys(yearData).sort() : [];

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

  const FUNNEL_STEPS = [
    { name: 'search_initiated', label: 'Búsquedas' },
    { name: 'dates_selected',   label: 'Fechas' },
    { name: 'booking_step2',    label: 'Formulario' },
    { name: 'booking_sent',     label: 'Enviados' },
  ];

  const fmtEvt = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const SEV_COLOR = { alta: '#E74C3C', media: '#E67E22', baja: '#1BC8D8' };

  return (
    <div className="pe-card intel-wrap">
      <div className="intel-hd">
        <h2 style={{ margin: 0 }}>Inteligencia</h2>
        <div className="pe-period-tabs">
          {[7, 30, 90].map(d => (
            <button key={d} type="button"
              className={`pe-period-tab${days === d ? ' is-active' : ''}`}
              onClick={() => setDays(d)}>{d}d
            </button>
          ))}
          <button type="button" className="pe-period-tab" onClick={reload} title="Recargar">↺</button>
        </div>
      </div>

      {loading && <div className="pe-analytics-loading">Cargando datos…</div>}
      {cfError  && <div className="pe-error" style={{ marginBottom: 12 }}>Analytics: {cfError}</div>}
      {bizError && <div className="pe-error" style={{ marginBottom: 12 }}>Negocio: {bizError}</div>}

      {!loading && (
        <>
          <div className="intel-kpis">
            <div className="intel-kpi">
              <div className="intel-kpi-val" style={{ color: '#1BC8D8' }}>{totalPV != null ? totalPV.toLocaleString('es-ES') : '—'}</div>
              <div className="intel-kpi-lbl">Páginas vistas · {days}d</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val">{topCtry ?? '—'}</div>
              <div className="intel-kpi-lbl">País principal</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val" style={{ color: funnConv && parseInt(funnConv) < 5 ? '#E74C3C' : '#D4A84A' }}>{funnConv ?? '—'}</div>
              <div className="intel-kpi-lbl">Conversión búsqueda→reserva</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val" style={{ color: '#D4A84A' }}>{stats26 ? dashFmtMoney(stats26.ingresos) : '—'}</div>
              <div className="intel-kpi-lbl">Ingresos 2026</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val">{stats26 ? stats26.reservas : '—'}</div>
              <div className="intel-kpi-lbl">Reservas 2026</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val">{stats26 ? dashFmtMoney(stats26.precio_noche) : '—'}</div>
              <div className="intel-kpi-lbl">Precio/noche medio 2026</div>
            </div>
          </div>

          <div className="intel-alertas">
            <div className="intel-alertas-title">Alertas e ideas de acción</div>
            {alertas.map((a, i) => (
              <div key={i} className={`intel-alerta sev-${a.sev}`}>
                <div className="intel-alerta-dot" style={{ background: SEV_COLOR[a.sev] }}/>
                <div className="intel-alerta-body">
                  <div className="intel-alerta-cat">{a.cat}</div>
                  <div className="intel-alerta-title">{a.title}</div>
                  <div className="intel-alerta-desc">{a.desc}</div>
                </div>
                {a.tab && onNavigate && (
                  <button type="button" className="intel-alerta-btn"
                    onClick={() => onNavigate(a.tab)}>
                    {a.tab === 'pricing' ? 'Ver precios' : a.tab === 'reservas' ? 'Ver reservas' : 'Ver'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="intel-section">
            <button type="button" className="intel-section-toggle" onClick={() => toggle('trafico')}>
              <span>Tráfico web · {days} días</span>
              <span className="intel-section-chevron">{open.trafico ? '▲' : '▼'}</span>
            </button>
            {open.trafico && (
              <div className="intel-section-content">
                {cfError ? <p className="pe-hint">Error al cargar datos de Cloudflare.</p>
                  : cfData ? (
                    <>
                      <div className="pe-cf-summary">
                        <div className="pe-cf-stat">
                          <div className="pe-cf-stat-n">{(totalPV || 0).toLocaleString('es-ES')}</div>
                          <div className="pe-cf-stat-lbl">páginas vistas · {days}d</div>
                        </div>
                      </div>
                      <div className="pe-cf-cols">
                        <div className="pe-cf-col">
                          <div className="pe-cf-col-title">Páginas más vistas</div>
                          {(cfData.pages || []).length === 0 && <p className="pe-hint">Sin datos en este rango.</p>}
                          {(cfData.pages || []).map((r, i) => (
                            <BarRow key={i} label={pathLabel(r.dimensions.requestPath)} count={r.count} total={totalPV || 1} bold={i === 0} />
                          ))}
                        </div>
                        <div className="pe-cf-col">
                          <div className="pe-cf-col-title">Países</div>
                          {(cfData.countries || []).map((r, i) => (
                            <BarRow key={i} label={r.dimensions.countryName || '—'} count={r.count} total={totalCtr} bold={i === 0} />
                          ))}
                        </div>
                        <div className="pe-cf-col">
                          <div className="pe-cf-col-title">Dispositivos</div>
                          {(cfData.devices || []).map((r, i) => (
                            <BarRow key={i} label={r.dimensions.deviceType || '—'} count={r.count} total={totalDev} bold={i === 0} />
                          ))}
                        </div>
                      </div>
                      <div className="pe-analytics-sep"/>
                      <div className="pe-cf-col-title">Funnel de reservas · este navegador</div>
                      <div className="pe-funnel">
                        {FUNNEL_STEPS.map((step, i) => {
                          const n    = fc[step.name] || 0;
                          const prev = i > 0 ? (fc[FUNNEL_STEPS[i - 1].name] || 0) : null;
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
                    </>
                  ) : <p className="pe-hint">Sin datos de Cloudflare.</p>
                }
              </div>
            )}
          </div>

          <div className="intel-section">
            <button type="button" className="intel-section-toggle" onClick={() => toggle('negocio')}>
              <span>Negocio · histórico</span>
              <span className="intel-section-chevron">{open.negocio ? '▲' : '▼'}</span>
            </button>
            {open.negocio && (
              <div className="intel-section-content">
                {bizError ? <p className="pe-hint">Error al cargar datos de negocio.</p>
                  : !yearData ? (
                    !token ? <p className="pe-hint">Inicia sesión con un PAT para ver datos de reservas en directo.</p> : <p className="pe-hint">Sin datos.</p>
                  ) : (
                    <>
                      <div className="dash-section">
                        <h3 className="dash-section-title">Ingresos y BAI por año</h3>
                        <BarChart years={years} yearData={yearData} />
                      </div>
                      <div className="dash-charts-row">
                        <div className="dash-chart-box" style={{ flex: 1 }}>
                          <h4 className="dash-chart-title">Precio medio / noche</h4>
                          <LineChart years={years} getData={y => yearData[y].precio_noche || 0} color="#D4A84A" label="Precio medio por noche" format={dashFmtMoney} />
                        </div>
                        <div className="dash-chart-box" style={{ flex: 1 }}>
                          <h4 className="dash-chart-title">Rentabilidad %</h4>
                          <LineChart years={years} getData={y => yearData[y].rent_pct || 0} color="#1BC8D8" label="Rentabilidad por año" format={dashFmtPct} />
                        </div>
                      </div>
                      <div className="dash-charts-row">
                        <div className="dash-chart-box" style={{ flex: 6 }}>
                          <h4 className="dash-chart-title">Mix canales</h4>
                          <StackedBarChart years={years} yearData={yearData} />
                        </div>
                        <div className="dash-chart-box" style={{ flex: 4 }}>
                          <h4 className="dash-chart-title">Reservas y noches</h4>
                          <ReservasNochesChart years={years} yearData={yearData} />
                          <div className="dash-legend">
                            <span className="dash-legend-item">
                              <span style={{ background: 'rgba(212,168,74,0.75)', display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4 }} />Reservas
                            </span>
                            <span className="dash-legend-item">
                              <span style={{ background: 'rgba(27,200,216,0.45)', display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4 }} />Noches
                            </span>
                          </div>
                        </div>
                      </div>
                      {years.some(y => yearData[y].partial) && <p className="dash-footnote">* Datos parciales en algunos años</p>}
                    </>
                  )
                }
              </div>
            )}
          </div>

          <div className="intel-section">
            <button type="button" className="intel-section-toggle" onClick={() => toggle('eventos')}>
              <span>Eventos recientes · este navegador</span>
              <span className="intel-section-chevron">{open.eventos ? '▲' : '▼'}</span>
            </button>
            {open.eventos && (
              <div className="intel-section-content">
                {localEvents.length === 0
                  ? <p className="pe-hint">Sin eventos registrados todavía en este navegador.</p>
                  : (
                    <table className="pe-table pe-table-events">
                      <thead><tr><th>Hora</th><th>Evento</th><th>Datos</th></tr></thead>
                      <tbody>
                        {localEvents.slice(0, 60).map((ev, i) => (
                          <tr key={i}>
                            <td className="pe-ev-ts">{fmtEvt(ev.ts)}</td>
                            <td className="pe-ev-name">{ev.name}</td>
                            <td className="pe-ev-data">
                              {Object.entries(ev).filter(([k]) => k !== 'ts' && k !== 'name').map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>
            )}
          </div>
        </>
      )}
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
const ContractTab = ({ pricesData, prefill }) => {
  // Estado del formulario — usa prefill si llega desde Reservas
  const today = new Date().toISOString().slice(0,10);
  const p = prefill || {};
  const [apt, setApt]                 = React.useState(p.apt || 'vm');
  const [nombre, setNombre]           = React.useState(p.responsable || '');
  const [domicilio, setDomicilio]     = React.useState(p.direccion || '');
  const [dni, setDni]                 = React.useState(p.dni || '');
  const [telefono, setTelefono]       = React.useState(p.telefono || '');
  const [email, setEmail]             = React.useState(p.email || '');
  const [fechaEntrada, setFechaEntrada] = React.useState(p.entrada || '');
  const [fechaSalida, setFechaSalida]   = React.useState(p.salida || '');
  const [huespedes, setHuespedes]     = React.useState(p.huespedes || 2);
  const [mascota, setMascota]         = React.useState(p.mascota || false);
  const [precioTotal, setPrecioTotal] = React.useState(p.ingreso_total != null ? String(p.ingreso_total) : '');
  const [prereserva, setPrereserva]   = React.useState(p.reserva != null ? String(p.reserva) : '');
  const [pagoPrevio, setPagoPrevio]   = React.useState(p.pago_previo != null ? String(p.pago_previo) : '0');
  const [diasCancelacion, setDiasCancelacion] = React.useState(
    p.cancelacion ? (Number((String(p.cancelacion).match(/\d+/) || [])[0]) || 14) : 14
  );
  const [fianza, setFianza]           = React.useState(p.fianza || false);
  const [fechaFirma, setFechaFirma]   = React.useState(today);

  const aptInfo = APT_CONTRACT_DATA[apt];
  const noches = diffNoches(fechaEntrada, fechaSalida);
  const remanente = Math.max(0, Number(precioTotal||0) - Number(prereserva||0) - Number(pagoPrevio||0));

  // Lista de extras (tabla cláusula novena) — leídos de prices.json.
  const extras = (pricesData && pricesData.rules && pricesData.rules.extras) || [];

  const formOk = () => apt && nombre && fechaEntrada && fechaSalida
    && noches > 0 && huespedes >= 1
    && Number(precioTotal) > 0
    && Number(prereserva) >= 0
    && Number(prereserva) <= Number(precioTotal)
    && diasCancelacion > 0;

  const fetchDataUrl = async (path) => {
    try {
      const o = (typeof window !== 'undefined' && window.location.origin) || '';
      const b = (typeof window !== 'undefined' && window.location.pathname)
        ? window.location.pathname.replace(/[^/]+$/, '') : '/';
      const url = `${o}${b}${path}`.replace(/([^:])\/+/g, '$1/');
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
    } catch (_) { return null; }
  };

  // Pre-crop a data URL to the hero aspect ratio (210mm × 55mm ≈ 3.82:1).
  // html2canvas does not reliably apply object-fit or background-size,
  // so we crop in JS first and embed the already-cropped image.
  const cropHero = (rawUrl) => {
    if (!rawUrl) return Promise.resolve(null);
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // W/H = 2100/650 = 210/65 exactly — same ratio as jsPDF target
        const W = 2100, H = 650;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d');
        const srcAR = img.naturalWidth / img.naturalHeight;
        const tgtAR = W / H; // 3.818:1
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (Math.abs(srcAR - tgtAR) / tgtAR < 0.02) {
          // already at target ratio (e.g. pre-built collage) — just resize
        } else if (srcAR > tgtAR) {
          // landscape wider: crop sides equally
          sh = img.naturalHeight; sw = sh * tgtAR;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          // narrower than target ratio: use full width, crop vertically
          // at 35% from top (avoids ceiling, shows the room interior)
          sw = img.naturalWidth;
          sh = sw / tgtAR;
          sx = 0;
          sy = Math.max(0, (img.naturalHeight - sh) * 0.35);
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        resolve(c.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    });
  };

const buildContractHTML = (heroDataUrl, logoDataUrl, wmDataUrl) => {
    const escHtml = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const a = aptInfo;
    const fechaFirmaStr  = fmtFechaEs(fechaFirma);
    const fechaEntradaStr = fmtFechaCorta(fechaEntrada);
    const fechaSalidaStr  = fmtFechaCorta(fechaSalida);
    const pagoPrevioN = Number(pagoPrevio || 0);
    const precioL  = numToSpanish(precioTotal);
    const preL     = numToSpanish(prereserva);
    const prevL    = numToSpanish(pagoPrevio);
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
    const heroUrl = heroDataUrl || '';
    const safeName = s => String(s).replace(/\s+/g, '_').replace(/[^\wÀ-ɏ]/g, '');
    const pdfFilename = `${fechaEntrada}_Hestia_Vera_${a.shortName.replace(/\s+/g,'_')}_contrato_${safeName(nombre)}_${noches}_noches.pdf`;
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Contrato · Hestía Vera ${a.shortName} · ${escHtml(nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @page { size: A4; margin: 0; }
  :root {
    --ber: #3D1A35; --ber-dk: #2A0F2E; --ber-lt: #4E2446;
    --sol: #3AAABB; --vt: #B86A3C; --vt-dk: #8A4A24;
    --arena: #F0E8D5; --arena-dk: #E4D9BE;
  }
  /* ── Notification bar (excluded from pdf capture) ─── */
  #gen-bar {
    position: sticky; top: 0; background: var(--ber-dk); color: var(--arena);
    padding: 8px 16px; z-index: 9999; font-family: sans-serif; font-size: 13px;
    display: flex; align-items: center; gap: 12px;
  }
  #gen-bar button {
    background: var(--sol); color: #fff; border: none; border-radius: 4px;
    padding: 4px 14px; cursor: pointer; font-size: 12px;
  }
  @media print { #gen-bar { display: none !important; } }
  /* ── Layout ─────────────────────────────────────────── */
  body {
    font-family: 'Lora', Georgia, serif;
    color: var(--ber);
    font-size: 10.5pt;
    line-height: 1.55;
    margin: 0;
    margin: 0; padding: 0; background: #fff;
  }
  #pdf-content { background: #fff; }
  #contract-body { padding: 5mm 16mm 8mm; }

  /* ── Hero (primera página) ───────────────────────────── */
  .hero {
    position: relative;
    width: 100%;
    height: 65mm;
    overflow: hidden;
    background: linear-gradient(135deg, var(--ber) 0%, var(--ber-lt) 100%);
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

  /* ── Contract typography ─────────────────────────────── */
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
  .blank-line.short  { min-width: 30mm; }
  .blank-line.medium { min-width: 55mm; }
  .blank-line.long   { min-width: 80mm; }
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

  @media print { body { margin: 0; } }
</style></head>
<body>
<div id="gen-bar">
  <span id="gen-status">Generando PDF…</span>
  <button id="gen-fallback" onclick="window.print()" style="display:none">Guardar como PDF (alternativa Ctrl+P)</button>
</div>

<div id="pdf-content">
<!-- Spacer for page-1 hero: bar(18mm) + hero(65mm) − MARG_TOP(30mm) = 53mm -->
<div style="height:53mm;line-height:0;font-size:0"> </div>
<div id="contract-body">

<p class="lugar">Madrid, ${fechaFirmaStr}</p>

<h2>Reunidos</h2>
<p>Por una parte, <strong>D. Alejandro Berruezo Márquez</strong> y <strong>D. Francisco Javier Moral Arévalo</strong>, mayores de edad, y con domicilio a efectos de notificaciones en Avenida de la Constitución 38, 1A, 28821 de Coslada, Madrid, con DNI. ***DNI-RETIRADO*** y ***DNI-RETIRADO***, telf. 620316370 y 654138251, respectivamente, y correo electrónico: info@hestiayourhome.com y cuenta corriente: ***IBAN-RETIRADO***.</p>
<p><em>(De ahora en adelante, "Los Propietarios".)</em></p>
<p>De otra parte, <strong>D./Dña. ${escHtml(nombre.toUpperCase())}</strong>, mayor de edad, con domicilio a efectos de notificaciones en: ${domicilio ? `<strong>${escHtml(domicilio)}</strong>` : '<span class="blank-line long" aria-label="dirección a rellenar"></span>'}, con Documento Nacional de Identidad: ${dni ? `<strong>${escHtml(dni)}</strong>` : '<span class="blank-line short" aria-label="DNI a rellenar"></span>'}, con teléfono: ${telefono ? `<strong>${escHtml(telefono)}</strong>` : '<span class="blank-line short" aria-label="teléfono a rellenar"></span>'}, y correo electrónico a efectos de notificaciones telemáticas: ${email ? `<strong>${escHtml(email)}</strong>` : '<span class="blank-line medium" aria-label="email a rellenar"></span>'}.</p>
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
<p><strong>2.1</strong> La renta neta es de <strong>${precioL} (${precioTotal}) EUROS</strong> para <strong>${huespL} (${huespedes}) personas${mascotaTexto}</strong>. El desglose de pagos es el siguiente:</p>
<table>
  <thead><tr><th>Concepto</th><th class="num">Importe</th><th>Forma de pago</th></tr></thead>
  <tbody>
    <tr><td><strong>Señal / prereserva</strong></td><td class="num">${prereserva} €</td><td>Transferencia a ***IBAN-RETIRADO*** o Bizum a +34 620 316 370</td></tr>
    ${pagoPrevioN > 0 ? `<tr><td><strong>Pago previo</strong></td><td class="num">${pagoPrevio} €</td><td>Transferencia o Bizum (según acuerdo)</td></tr>` : ''}
    <tr><td><strong>Remanente (check-in)</strong></td><td class="num">${remanente} €</td><td>Efectivo en el momento del check-in</td></tr>
    ${fianza ? `<tr><td><strong>Fianza</strong></td><td class="num">300 €</td><td>Transferencia 2 días antes de la llegada — se devuelve al check-out</td></tr>` : ''}
    <tr style="border-top: 1pt solid var(--ber)"><td><strong>TOTAL</strong></td><td class="num"><strong>${precioTotal} €</strong></td><td></td></tr>
  </tbody>
</table>
<p>Este contrato no tendrá validez en los siguientes casos:</p>
<ul>
  <li>Sin el justificante de abono de la señal de <strong>${preL} (${prereserva}) EUROS</strong>, que deberá ingresarse en el momento de la formalización de este contrato.</li>
  <li>Sin el abono en efectivo del remanente de <strong>${remL} (${remanente}) EUROS</strong> en el momento del check-in.</li>
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
    Fdo.: <strong>${escHtml(nombre.toUpperCase())}</strong>
  </div>
</div>
</div><!-- #contract-body -->
</div><!-- #pdf-content -->

<script>
(function() {
  var HERO = ${JSON.stringify(heroDataUrl || '')};
  var LOGO = ${JSON.stringify(logoDataUrl || '')};
  var WM   = ${JSON.stringify(wmDataUrl   || '')};
  var FILE = ${JSON.stringify(pdfFilename)};
  var APT   = ${JSON.stringify('Vera ' + a.shortName)};
  var META  = ${JSON.stringify(noches + ' noches · ' + huespedes + ' huéspedes')};
  var DATES = ${JSON.stringify(fechaEntradaStr + ' - ' + fechaSalidaStr)};

  async function generate() {
    try { await document.fonts.ready; } catch(e) {}
    var el = document.getElementById('pdf-content');
    // margin: [top, right, bottom, left] — top/bottom leave room for jsPDF header/footer
    var MARG_TOP = 30, MARG_BOT = 24;
    var opt = {
      margin: [MARG_TOP, 0, MARG_BOT, 0],
      filename: FILE,
      image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    var worker = html2pdf().set(opt).from(el);
    await worker.toPdf();
    var pdf = await worker.get('pdf');
    var n = pdf.internal.getNumberOfPages();
    var pW = pdf.internal.pageSize.getWidth();   // 210 mm
    var pH = pdf.internal.pageSize.getHeight();  // 297 mm

    for (var i = 1; i <= n; i++) {
      pdf.setPage(i);

      /* ── Marca de agua (todas las páginas) ───────────────── */
      if (WM) {
        try {
          pdf.saveGraphicsState();
          pdf.setGState(pdf.GState({ opacity: 0.065 }));
          var wmW = 120, wmH = 120; // logo-teal-transparent.png es 600×600 (ratio 1:1)
          pdf.addImage(WM, 'PNG', pW / 2 - wmW / 2, pH / 2 - wmH / 2, wmW, wmH, '', 'NONE', 25);
          pdf.restoreGraphicsState();
        } catch(e) {}
      }

      var hH = 18;

      /* ── Portada: foto + overlay + texto (sólo página 1) ─── */
      if (i === 1) {
        if (HERO) {
          try { pdf.addImage(HERO, 'JPEG', 0, hH, pW, 65); } catch(e) {}
          pdf.saveGraphicsState();
          pdf.setGState(pdf.GState({ opacity: 0.38 }));
          pdf.setFillColor(42, 15, 46);
          pdf.rect(0, hH, pW, 65, 'F');
          pdf.restoreGraphicsState();
        } else {
          pdf.setFillColor(42, 15, 46);
          pdf.rect(0, hH, pW, 65, 'F');
        }
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(228, 217, 190);
        pdf.text('contrato de arrendamiento por temporada', 8, hH + 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(240, 232, 213);
        pdf.text('Hestia · ' + APT, 8, hH + 52);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(228, 217, 190);
        pdf.text(DATES + '  ·  ' + META, 8, hH + 61);
      }

      /* ── Barra compacta (todas las páginas, encima del hero) */
      pdf.setFillColor(42, 15, 46);
      pdf.rect(0, 0, pW, hH, 'F');
      if (LOGO) {
        try { pdf.addImage(LOGO, 'PNG', 4, hH / 2 - 4, 8, 8); } catch(e) {}
      }
      pdf.setTextColor(240, 232, 213);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('HESTIA', 14, hH * 0.62);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(228, 217, 190);
      pdf.text('· ' + APT, 30, hH * 0.62);
      pdf.setFontSize(7.5);
      pdf.text(DATES, pW - 5, hH * 0.62, { align: 'right' });

      /* ── Pie de página (todas las páginas) ───────────────── */
      var footY = pH - 7;
      pdf.setDrawColor(78, 36, 70);
      pdf.setLineWidth(0.2);
      pdf.line(16, footY - 3, pW - 16, footY - 3);
      pdf.setTextColor(78, 36, 70);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text('Hestia Your Home · info@hestiayourhome.com · +34 620 316 370', 16, footY);
      pdf.text('Página ' + i + ' de ' + n, pW - 5, footY, { align: 'right' });
    }

    await worker.save();
    document.getElementById('gen-status').textContent = 'PDF descargado — puedes cerrar esta pestaña o usar Ctrl+P si necesitas imprimirlo.';
  }

  document.addEventListener('DOMContentLoaded', function() {
    generate().catch(function(err) {
      console.error('html2pdf error:', err);
      document.getElementById('gen-status').textContent = 'Error al generar el PDF. Usa Ctrl+P como alternativa.';
      document.getElementById('gen-fallback').style.display = '';
    });
  });
})();
<\/script>
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
3. El justificante de la señal de ${prereserva} €, ingresada por transferencia a la cuenta ***IBAN-RETIRADO*** o Bizum al teléfono +34 620 316 370.${Number(pagoPrevio||0) > 0 ? `\n4. El justificante del pago previo de ${pagoPrevio} €.` : ''}

El remanente de ${remanente} € se abona en efectivo el día de la llegada, en el momento del check-in.

Recibida toda la documentación, tu reserva quedará confirmada y te escribiremos unos días antes de tu llegada para coordinar el check-in (autónomo o presencial, lo que te encaje mejor).

Si tienes cualquier duda, escríbenos sin problema.

Un abrazo,
Alex y Fran · Hestía
info@hestiayourhome.com · +34 620 316 370`;
  };

  const onGenerar = async () => {
    if (!formOk()) {
      alert('Faltan campos por rellenar. Comprueba que el huésped tiene nombre, fechas y precio total > 0, y que la prereserva no supere el total.');
      return;
    }
    // SYNC — must happen inside the user-gesture context, before any await.
    // Browsers block window.open and mailto navigation triggered asynchronously.
    const w = window.open('', '_blank');
    if (!w) {
      alert('Tu navegador ha bloqueado la ventana emergente. Permite popups en /p-edit.html y vuelve a intentarlo.');
      return;
    }
    const subject = `Contrato de reserva · Hestía Vera ${aptInfo.shortName} · ${fmtFechaCorta(fechaEntrada)} → ${fmtFechaCorta(fechaSalida)}`;
    const body = buildEmailBody();
    const mailto = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const aEl = Object.assign(document.createElement('a'), { href: mailto });
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);

    // ASYNC — pre-load images as data URIs so they embed correctly in the PDF.
    const [heroRaw, logoDataUrl, wmDataUrl] = await Promise.all([
      fetchDataUrl(aptInfo.heroPhoto),
      fetchDataUrl('assets/logo-hestia-brand.png'),
      fetchDataUrl('assets/logo-teal-transparent.png'),
    ]);
    const heroDataUrl = await cropHero(heroRaw);

    // Write contract HTML to the already-opened window.
    const html = buildContractHTML(heroDataUrl, logoDataUrl, wmDataUrl);
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
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
            <div className="pe-field"><label>Nº de huéspedes</label><NumInput min="1" max="8" value={huespedes} onChange={v => setHuespedes(v)} /></div>
            <div className="pe-field"><label>¿Mascota?</label>
              <label className="ct-toggle"><input type="checkbox" checked={mascota} onChange={e => setMascota(e.target.checked)} /> <span>Sí, viaja con mascota</span></label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Importes (€)</legend>
          <div className="pe-grid">
            <div className="pe-field"><label>Precio total *</label><NumInput step="0.01" min="0" value={precioTotal} onChange={v => setPrecioTotal(v)} placeholder="630" /></div>
            <div className="pe-field"><label>Señal / prereserva (Bizum o transf.) *</label><NumInput step="0.01" min="0" value={prereserva} onChange={v => setPrereserva(v)} placeholder="130" /></div>
            <div className="pe-field"><label>Pago previo adicional</label><NumInput step="0.01" min="0" value={pagoPrevio} onChange={v => setPagoPrevio(v)} placeholder="0" /></div>
            <div className="pe-field"><label>Efectivo al check-in (calculado)</label><input type="text" readOnly value={`${remanente} €`} className="ct-readonly" /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Política</legend>
          <div className="pe-grid">
            <div className="pe-field"><label>Días de cancelación sin coste *</label><NumInput min="1" max="60" value={diasCancelacion} onChange={v => setDiasCancelacion(v)} /></div>
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
const RESERVAS_PATH    = 'reservas.json';
const PRERESERVAS_PATH = 'docs/data/prereservas.json';

// Sincroniza TODAS las reservas no canceladas de P-Edit → availability.json (repo público).
// Se llama tras cada save/delete y tras convertir prereserva → reserva.
// P-Edit es la fuente de verdad: cualquier canal (directo, Airbnb, Booking, etc.)
// se vuelca al array `direct`, que el iCal sync (4h) también lee para calcular `blocked`.
const _syncReservasToAvailability = async (allReservas, token) => {
  const APTS_LIST = ['vm', 'vt', 'vs'];
  const _cxl = r => r.cancelada === true || (r.cancelacion || '').trim().toUpperCase() === 'CANCELADA' || (r.cancelacion || '').trim().toUpperCase() === 'CANCELADO';
  const newDirect = Object.fromEntries(APTS_LIST.map(a => [a, []]));
  for (const r of allReservas) {
    if (_cxl(r)) continue;
    const apt = (r.apt || '').toLowerCase();
    if (!APTS_LIST.includes(apt) || !r.entrada || !r.salida) continue;
    newDirect[apt].push({ start: r.entrada, end: r.salida });
  }
  const _merge = (ranges) => {
    if (!ranges.length) return [];
    const s = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
    const m = [{ ...s[0] }];
    for (const r of s.slice(1)) {
      if (r.start <= m[m.length - 1].end) { if (r.end > m[m.length - 1].end) m[m.length - 1].end = r.end; }
      else m.push({ ...r });
    }
    return m;
  };
  const AV_PATH = 'docs/assets/availability.json';
  const avRes = await fetch(`${API}/repos/${REPO}/contents/${AV_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
  if (!avRes.ok) return;
  const avFile = await avRes.json();
  const avData = JSON.parse(b64ToUtf8(avFile.content));
  for (const apt of APTS_LIST) {
    const ical = avData[apt]?.ical || avData[apt]?.blocked || [];
    avData[apt] = { ...avData[apt], blocked: _merge([...ical, ...newDirect[apt]]), ical, direct: newDirect[apt] };
  }
  const putRes = await fetch(`${API}/repos/${REPO}/contents/${AV_PATH}`, {
    method: 'PUT', headers: apiHeaders(token),
    body: JSON.stringify({ message: 'chore(availability): sync reservas [skip ci]', content: utf8ToB64(JSON.stringify(avData, null, 2)), sha: avFile.sha, branch: BRANCH }),
  });
  if (putRes.ok) window.dispatchEvent(new CustomEvent('hestia:availability-updated'));
};

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
  airbnb:   0.18755, // 15.5% + IVA (21%) = 18.755% efectivo sobre bruto
  booking:  0.198,   // 18.7% comisión OTA + 1.1% bancaria
  directo:  0,
  avaibook: 0,
};

function exportReservasExcel(reservas, year) {
  const cols = [
    'apt','responsable','telefono','huespedes','menores_12','cuna_trona','mascota',
    'dni_enviado','noches','entrada','salida','cancelacion','canal','contactado',
    'f_reserva','ingreso_total','reserva','pago_previo','al_checkin','comision',
'renta','fianza','gasto_limpieza','pagos_leila','efectivo_leila','bai',
    'rentabilidad_pct','precio_bruto_noche','precio_neto_noche','observaciones',
  ];
  const esc = v => {
    if (v == null) return '';
    const s = String(v);
return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const rows = [cols.join(','), ...reservas.map(r => cols.map(c => esc(r[c])).join(','))];
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `reservas-${year}.csv` });
  a.click(); URL.revokeObjectURL(a.href);
}

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

  // 2b. Comisión OTA auto-calculada salvo override manual.
  if (!r._comision_manual) {
    const cKey = getCanalKey(out.canal);
    const rate = COMMISSION_RATES[cKey] ?? 0;
    if (rate > 0) {
      out.comision = Math.round(ingreso * rate * 100) / 100;
    }
  }

  const com   = Number(out.comision)       || 0;
  const gasto = Number(out.gasto_limpieza) || 0;

  // 3. BAI = ingreso_total − comision − gasto_limpieza.
  out.bai = Math.round((ingreso - com - gasto) * 100) / 100;

  // 3. Rentabilidad = BAI / ingreso_total.
  out.rentabilidad_pct = ingreso > 0 ? Math.round((out.bai / ingreso) * 10000) / 10000 : null;

  // 4. Efectivo al check-in: 0 para plataformas (ya cobran ellas),
  //    ingreso_total − señal − pago_previo para reservas directas.
  if (!r._checkin_manual) {
    out.al_checkin = getCanalKey(out.canal) === 'directo'
      ? Math.max(0, (Number(out.ingreso_total)||0) - (Number(out.reserva)||0) - (Number(out.pago_previo)||0))
      : 0;
  }

  // 5. Precios por noche.
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
  if (r.cancelada === true || (r.cancelacion || '').trim().toUpperCase() === 'CANCELADA') return 'cancelada';
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

// FacturasTab — Gastos deducibles por año / apartamento
// Datos en PRIVATE_REPO/facturas.json
// PDFs en PRIVATE_REPO/facturas-pdf/<filename>
// ============================================================

const FACTURAS_PATH = 'facturas.json';
const FACTURAS_PDF_DIR = 'facturas-pdf';

const GASTO_CATS = [
  { key: 'mantenimiento',  label: 'Reparaciones y conservación' },
  { key: 'limpieza',       label: 'Limpieza y lavandería' },
  { key: 'suministros',    label: 'Suministros (luz, agua, gas, internet)' },
  { key: 'seguros',        label: 'Seguros del inmueble' },
  { key: 'comunidad',      label: 'Gastos de comunidad' },
  { key: 'gestion',        label: 'Comisiones de gestión / agencias' },
  { key: 'publicidad',     label: 'Publicidad y marketing' },
  { key: 'amortizacion',   label: 'Amortización' },
  { key: 'otros',          label: 'Otros gastos deducibles' },
];

const IVA_TYPES = [0, 4, 10, 21];

const EMPTY_FACTURA = {
  fecha: '', proveedor: '', nif: '', concepto: '', categoria: 'mantenimiento',
  apt: 'general', base: 0, iva_pct: 21, iva: 0, total: 0,
  deducible_pct: 100, factura_pdf: null, notas: '',
};

const FacturasTab = ({ token }) => {
  const [data,        setData]        = React.useState(null);
  const [sha,         setSha]         = React.useState(null);
  const [loading,     setLoading]     = React.useState(false);
  const [saving,      setSaving]      = React.useState(false);
  const [error,       setError]       = React.useState(null);
  const [success,     setSuccess]     = React.useState(null);
  const [focusYear,   setFocusYear]   = React.useState(2026);
  const [draft,       setDraft]       = React.useState(null);
  const [editIdx,     setEditIdx]     = React.useState(-1);
  const [pdfStatus,   setPdfStatus]   = React.useState('idle');
  const [filterApt,   setFilterApt]   = React.useState('all');
  const [filterCat,   setFilterCat]   = React.useState('all');

  const facturas = React.useMemo(() => {
    if (!data) return [];
    return (data.facturas || []).filter(f => (f.year || new Date(f.fecha).getFullYear()) === focusYear);
  }, [data, focusYear]);

  const allYears = React.useMemo(() => {
    if (!data) return [2026];
    const ys = new Set((data.facturas || []).map(f => f.year || new Date(f.fecha).getFullYear()));
    if (!ys.size) ys.add(2026);
    return [...ys].sort((a, b) => b - a);
  }, [data]);

  const loadData = React.useCallback(() => {
    if (!token) return;
    setLoading(true); setError(null);
    fetch(`${API}/repos/${PRIVATE_REPO}/contents/${FACTURAS_PATH}?ref=${BRANCH}`, {
      headers: apiHeaders(token), cache: 'no-store',
    })
      .then(r => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then(j => {
        if (!j) {
          setData({ facturas: [] }); setSha(null);
        } else {
          if (j.message) throw new Error(j.message);
          setSha(j.sha);
          setData(JSON.parse(b64ToUtf8(j.content)));
        }
      })
      .catch(e => setError('Error cargando facturas: ' + e.message))
      .finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const saveData = async (newFacturas) => {
    setSaving(true); setError(null); setSuccess(null);
    const newData = { ...data, facturas: newFacturas, updatedAt: new Date().toISOString() };
    try {
      const body = {
        message: `chore(facturas): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
        content: utf8ToB64(JSON.stringify(newData, null, 2)),
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      };
      const res = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${FACTURAS_PATH}`, {
        method: 'PUT', headers: apiHeaders(token), body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Error guardando');
      setSha(j.content.sha); setData(newData);
      setSuccess('Guardado correctamente.');
      setDraft(null); setEditIdx(-1);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const calcIva = (base, iva_pct) => Math.round(base * iva_pct) / 100;

  const updateDraft = (field, val) => {
    setDraft(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'base' || field === 'iva_pct') {
        next.iva   = calcIva(Number(next.base) || 0, Number(next.iva_pct) || 0);
        next.total = Math.round(((Number(next.base) || 0) + next.iva) * 100) / 100;
      }
      return next;
    });
  };

  const openNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDraft({ ...EMPTY_FACTURA, fecha: today, year: focusYear });
    setEditIdx(-1);
  };

  const openEdit = (idx) => {
    const allFacts = data.facturas || [];
    const globalIdx = allFacts.indexOf(facturas[idx]);
    setDraft({ ...allFacts[globalIdx] });
    setEditIdx(globalIdx);
  };

  const cancelDraft = () => { setDraft(null); setEditIdx(-1); };

  const saveDraft = () => {
    if (!draft) return;
    const allFacts = [...(data.facturas || [])];
    const withYear = { ...draft, year: focusYear };
    if (editIdx >= 0) allFacts[editIdx] = withYear;
    else allFacts.push(withYear);
    saveData(allFacts);
  };

  const deleteFactura = (idx) => {
    const allFacts = data.facturas || [];
    const globalIdx = allFacts.indexOf(facturas[idx]);
    if (!confirm(`¿Borrar factura de ${facturas[idx].proveedor}?`)) return;
    const nr = allFacts.filter((_, i) => i !== globalIdx);
    saveData(nr);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !draft) return;
    e.target.value = '';
    setPdfStatus('uploading'); setError(null);
    try {
      const safeName = (draft.proveedor || 'proveedor').replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,'');
      const safeDate = (draft.fecha || 'fecha').replace(/-/g,'');
      const filename = `${focusYear}_${safeDate}_${safeName}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const pdfPath  = `${FACTURAS_PDF_DIR}/${filename}`;

      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);

      let existingSha;
      const check = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${pdfPath}?ref=${BRANCH}`, { headers: apiHeaders(token) });
      if (check.ok) { const cj = await check.json(); existingSha = cj.sha; }

      const put = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${pdfPath}`, {
        method: 'PUT', headers: apiHeaders(token),
        body: JSON.stringify({
          message: `feat(facturas): adjuntar ${filename}`,
          content: b64, branch: BRANCH,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      });
      if (!put.ok) { const pj = await put.json(); throw new Error(pj.message || 'Error subiendo PDF'); }
      setDraft(d => ({ ...d, factura_pdf: filename }));
      setPdfStatus('idle');
    } catch (err) { setError('Error subiendo PDF: ' + err.message); setPdfStatus('idle'); }
  };

  const handlePdfDownload = async (filename) => {
    if (!filename) return;
    try {
      const r = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${FACTURAS_PDF_DIR}/${filename}?ref=${BRANCH}`, { headers: apiHeaders(token) });
      if (!r.ok) throw new Error('No se pudo obtener el PDF');
      const j = await r.json();
      const bin = atob(j.content.replace(/\n/g,''));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) { setError('Error descargando: ' + err.message); }
  };

  const filtered = facturas.filter(f => {
    if (filterApt !== 'all' && (f.apt || 'general') !== filterApt) return false;
    if (filterCat !== 'all' && f.categoria !== filterCat) return false;
    return true;
  });

  // Totales para declaración
  const totBase    = filtered.reduce((s, f) => s + (Number(f.base)  || 0), 0);
  const totIva     = filtered.reduce((s, f) => s + (Number(f.iva)   || 0), 0);
  const totTotal   = filtered.reduce((s, f) => s + (Number(f.total) || 0), 0);
  const totDeducible = filtered.reduce((s, f) => s + Math.round((Number(f.base) || 0) * ((Number(f.deducible_pct) || 100) / 100) * 100) / 100, 0);

  // Por categoría
  const byCat = {};
  filtered.forEach(f => {
    const c = f.categoria || 'otros';
    if (!byCat[c]) byCat[c] = { base: 0, total: 0, n: 0 };
    byCat[c].base  += Number(f.base)  || 0;
    byCat[c].total += Number(f.total) || 0;
    byCat[c].n++;
  });

  const aptOptions = [
    { key: 'general', label: 'General (todas)' },
    { key: 'vm', label: APT_NAMES.vm },
    { key: 'vt', label: APT_NAMES.vt },
    { key: 'vs', label: APT_NAMES.vs },
  ];

  if (loading) return <div className="pe-card"><p>Cargando facturas…</p></div>;

  return (
    <div className="pe-card fac-card">
      {error   && <div className="pe-error">{error}</div>}
      {success && <div className="pe-success">{success}</div>}

      <div className="fac-head">
        <h2>🧾 Facturas de gastos
          <span className="fac-year-badge">{focusYear}</span>
        </h2>
        <div className="fac-head-actions">
          <select value={focusYear} onChange={e => setFocusYear(Number(e.target.value))} className="fac-year-sel">
            {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            {!allYears.includes(focusYear) && <option value={focusYear}>{focusYear}</option>}
          </select>
          <button type="button" className="pe-btn pe-btn-ghost" onClick={loadData}>Recargar</button>
          <button type="button" className="pe-btn pe-btn-primary" onClick={openNew}>+ Nueva factura</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="fac-toolbar">
        <label>Hestía
          <select value={filterApt} onChange={e => setFilterApt(e.target.value)}>
            <option value="all">Todas</option>
            {aptOptions.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </label>
        <label>Categoría
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">Todas</option>
            {GASTO_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
      </div>

      {/* Resumen declaración */}
      {filtered.length > 0 && (
        <div className="fac-summary">
          <div className="fac-kpi"><span>Facturas</span><strong>{filtered.length}</strong></div>
          <div className="fac-kpi"><span>Base imponible</span><strong>{fmtEur(totBase)}</strong></div>
          <div className="fac-kpi"><span>IVA soportado</span><strong>{fmtEur(totIva)}</strong></div>
          <div className="fac-kpi"><span>Total pagado</span><strong>{fmtEur(totTotal)}</strong></div>
          <div className="fac-kpi fac-kpi-accent"><span>Gasto deducible</span><strong>{fmtEur(totDeducible)}</strong></div>
        </div>
      )}

      {/* Tabla */}
      {filtered.length === 0 ? (
        <p className="fac-empty">No hay facturas para {focusYear}{filterApt !== 'all' || filterCat !== 'all' ? ' con estos filtros' : ''}. Pulsa "+ Nueva factura" para añadir.</p>
      ) : (
        <div className="fac-table-wrap">
          <table className="fac-table">
            <thead><tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Concepto</th>
              <th>Categoría</th>
              <th>Hestía</th>
              <th className="num">Base</th>
              <th className="num">IVA</th>
              <th className="num">Total</th>
              <th className="num">Deducible</th>
              <th>PDF</th>
              <th></th>
            </tr></thead>
            <tbody>
              {filtered.map((f, i) => {
                const deducible = Math.round((Number(f.base)||0) * ((Number(f.deducible_pct)||100)/100) * 100) / 100;
                const catLabel = (GASTO_CATS.find(c => c.key === f.categoria) || {}).label || f.categoria;
                const aptLabel = aptOptions.find(a => a.key === (f.apt||'general'))?.label || f.apt;
                return (
                  <tr key={i} className="fac-row" onClick={() => openEdit(i)}>
                    <td className="fac-date">{fmtDate(f.fecha)}</td>
                    <td className="fac-proveedor">
                      <strong>{f.proveedor || '—'}</strong>
                      {f.nif && <span className="fac-nif">{f.nif}</span>}
                    </td>
                    <td className="fac-concepto">{f.concepto || '—'}</td>
                    <td><span className="fac-cat-chip">{catLabel}</span></td>
                    <td>
                      {f.apt && f.apt !== 'general'
                        ? <span className="rv-apt-chip" style={{background: APT_COLOR[f.apt], color: APT_TEXT[f.apt]}}>{APT_NAMES[f.apt]}</span>
                        : <span className="fac-apt-gen">General</span>}
                    </td>
                    <td className="num">{fmtEur(f.base)}</td>
                    <td className="num fac-iva">{f.iva_pct ? `${f.iva_pct}%` : '—'}</td>
                    <td className="num"><strong>{fmtEur(f.total)}</strong></td>
                    <td className="num fac-deducible">{fmtEur(deducible)}{f.deducible_pct < 100 ? <span className="fac-pct"> ({f.deducible_pct}%)</span> : ''}</td>
                    <td className="fac-pdf-cell" onClick={e => e.stopPropagation()}>
                      {f.factura_pdf
                        ? <button type="button" className="fac-pdf-btn" title={f.factura_pdf} onClick={() => handlePdfDownload(f.factura_pdf)}>📎 PDF</button>
                        : <span className="fac-no-pdf">—</span>}
                    </td>
                    <td className="fac-actions-cell" onClick={e => e.stopPropagation()}>
                      <button type="button" className="fac-del-btn" title="Borrar" onClick={() => deleteFactura(i)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="fac-foot">
                <td colSpan="5">Total {filtered.length} factura{filtered.length !== 1 ? 's' : ''}</td>
                <td className="num"><strong>{fmtEur(totBase)}</strong></td>
                <td className="num">—</td>
                <td className="num"><strong>{fmtEur(totTotal)}</strong></td>
                <td className="num fac-deducible"><strong>{fmtEur(totDeducible)}</strong></td>
                <td colSpan="2"/>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Resumen por categoría */}
      {Object.keys(byCat).length > 1 && (
        <div className="fac-bycat">
          <h3>Por categoría</h3>
          <div className="fac-bycat-grid">
            {Object.entries(byCat).sort((a,b) => b[1].base - a[1].base).map(([k, v]) => {
              const catLabel = (GASTO_CATS.find(c => c.key === k) || {}).label || k;
              return (
                <div key={k} className="fac-bycat-row">
                  <span className="fac-cat-chip">{catLabel}</span>
                  <span className="fac-bycat-n">{v.n} factura{v.n !== 1 ? 's' : ''}</span>
                  <span className="fac-bycat-amt">{fmtEur(v.base)} base</span>
                  <span className="fac-bycat-total">{fmtEur(v.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Panel de edición */}
      {draft && (
        <>
          <div className="rv-edit-backdrop" onClick={cancelDraft} />
          <aside className="rv-edit-panel fac-edit-panel">
            <header className="rv-edit-head">
              <div>
                <div className="rv-edit-eyebrow">{editIdx >= 0 ? 'Editar factura' : 'Nueva factura'} · {focusYear}</div>
                <h3>{draft.proveedor || '(sin proveedor)'}</h3>
              </div>
              <button type="button" className="rv-edit-close" onClick={cancelDraft}>×</button>
            </header>
            <div className="rv-edit-body">
              <div className="rv-row2">
                <div className="pe-field"><label>Fecha *</label>
                  <input type="date" className="pe-input" value={draft.fecha || ''} onChange={e => updateDraft('fecha', e.target.value)} />
                </div>
                <div className="pe-field"><label>Hestía</label>
                  <select className="pe-input" value={draft.apt || 'general'} onChange={e => updateDraft('apt', e.target.value)}>
                    {aptOptions.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="rv-row2">
                <div className="pe-field"><label>Proveedor *</label>
                  <input className="pe-input" value={draft.proveedor || ''} onChange={e => updateDraft('proveedor', e.target.value)} placeholder="Ej: Leroy Merlin" />
                </div>
                <div className="pe-field"><label>NIF / CIF</label>
                  <input className="pe-input" value={draft.nif || ''} onChange={e => updateDraft('nif', e.target.value)} placeholder="B12345678" />
                </div>
              </div>
              <div className="pe-field"><label>Concepto *</label>
                <input className="pe-input" value={draft.concepto || ''} onChange={e => updateDraft('concepto', e.target.value)} placeholder="Descripción del gasto" />
              </div>
              <div className="pe-field"><label>Categoría</label>
                <select className="pe-input" value={draft.categoria || 'otros'} onChange={e => updateDraft('categoria', e.target.value)}>
                  {GASTO_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="rv-row3">
                <div className="pe-field"><label>Base imponible</label>
                  <NumInput step="0.01" className="pe-input" value={draft.base || 0} onChange={v => updateDraft('base', v)} />
                </div>
                <div className="pe-field"><label>IVA %</label>
                  <select className="pe-input" value={draft.iva_pct ?? 21} onChange={e => updateDraft('iva_pct', Number(e.target.value))}>
                    {IVA_TYPES.map(t => <option key={t} value={t}>{t}%{t === 0 ? ' (exento)' : ''}</option>)}
                  </select>
                </div>
                <div className="pe-field"><label>Total</label>
                  <input className="pe-input" readOnly value={fmtEur(draft.total || 0)} style={{background:'var(--bg-soft)',fontWeight:600}} />
                </div>
              </div>
              <div className="pe-field"><label>% Deducible <span className="rv-hint-inline">100 = deducción total</span></label>
                <NumInput className="pe-input" value={draft.deducible_pct ?? 100} onChange={v => updateDraft('deducible_pct', Math.min(100, Math.max(0, v)))} min={0} max={100} />
              </div>
              <div className="pe-field"><label>Notas</label>
                <input className="pe-input" value={draft.notas || ''} onChange={e => updateDraft('notas', e.target.value)} placeholder="Opcional" />
              </div>
              <fieldset><legend>Factura PDF</legend>
                <div className="rv-contrato-block">
                  {draft.factura_pdf ? (
                    <>
                      <span className="rv-contrato-fname" title={draft.factura_pdf}>📎 {draft.factura_pdf}</span>
                      <button type="button" className="pe-btn pe-btn-ghost" onClick={() => handlePdfDownload(draft.factura_pdf)}>⬇ Ver</button>
                      <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                        🔄 Cambiar
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={handlePdfUpload} />
                      </label>
                    </>
                  ) : (
                    <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                      {pdfStatus === 'uploading' ? '⏳ Subiendo…' : '📎 Adjuntar factura'}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={handlePdfUpload} disabled={pdfStatus === 'uploading'} />
                    </label>
                  )}
                </div>
              </fieldset>
            </div>
            <footer className="rv-edit-foot">
              {editIdx >= 0 && (
                <button type="button" className="pe-btn pe-btn-ghost rv-btn-danger" onClick={() => { cancelDraft(); deleteFactura(facturas.indexOf(data.facturas[editIdx])); }}>🗑 Borrar</button>
              )}
              <div className="rv-edit-foot-right">
                <button type="button" className="pe-btn pe-btn-ghost" onClick={cancelDraft}>Cancelar</button>
                <button type="button" className="pe-btn pe-btn-primary" onClick={saveDraft} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </footer>
          </aside>
        </>
      )}
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

  const [loadedAt, setLoadedAt] = React.useState(null);

  const loadData = React.useCallback(() => {
    setLoading(true);
    setLoadErr(null);
fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        if (j.message) throw new Error(j.message);
        setSha(j.sha);
        setData(JSON.parse(b64ToUtf8(j.content)));
        setLoadedAt(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
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
const res = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}`, {
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
  if (loadErr) return <div className="pe-card"><div className="pe-error">{loadErr}</div><button type="button" className="pe-btn pe-btn-ghost" style={{ marginTop: 12 }} onClick={loadData}>Reintentar</button></div>;
  if (!data)   return null;

  const reservas = data.reservas || [];
  const liquidaciones = data.leila_pagos_a_hestia || [];
  const saldosIniciales = data.leila_saldo_inicial || {};
  const APT_LABEL = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' };
  const MES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const fmtBal = n => n > 0 ? `Leila debe ${n} €` : n < 0 ? `Hestía debe ${Math.abs(n)} €` : 'Saldado';

  const allYears = [...new Set(reservas.map(r => String(r.year || '')).filter(Boolean))].sort();
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
        const v = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila ?? r.pagos_leila) || 0);
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
          <NumInput
            step="0.01"
            className="leila-saldo-input"
            value={editsSaldoInicial[focusYear] !== undefined ? Number(editsSaldoInicial[focusYear]) : saldoInicialYear}
            onChange={v => setEditsSaldoInicial(p => ({ ...p, [focusYear]: v }))}
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
            {loading ? 'Recargando…' : 'Recargar'}
          </button>
<button type="button" className="pe-btn pe-btn-ghost" onClick={() => data && exportReservasExcel((data.reservas || []).filter(r => String(r.year || '') === focusYear), focusYear)} disabled={!data}>
            Exportar Excel
          </button>
          {loadedAt && <span className="leila-loaded-at">Actualizado {loadedAt}</span>}
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
          const v = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila ?? r.pagos_leila) || 0);
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
          const ef = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila ?? r.pagos_leila) || 0);
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
                    <th className="num">Bruto</th>
                    <th className="num">BAI</th>
                    <th className="num">Rent.</th>
                    <th className="num">€/noche</th>
                    <th className="num">Limpieza</th>
                    <th className="num">Efectivo</th>
                    <th className="num">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => {
                    const tarifa   = Number(r.gasto_limpieza) || 0;
                    const efectivo = editsEfectivo[r._idx] !== undefined ? Number(editsEfectivo[r._idx]) : (Number(r.efectivo_leila ?? r.pagos_leila) || 0);
                    const acum     = rowAcums[ri];
                    return (
                      <tr key={r._idx}>
                        <td className="leila-apt">{APT_LABEL[r.apt] || r.apt}</td>
                        <td className="leila-guest">{r.responsable || '—'}</td>
                        <td className="leila-dates">{r.entrada}{r.salida ? ` · ${r.salida}` : ''}</td>
                        <td className="num">{r.noches || '—'}</td>
                        <td className="num">{r.ingreso_total != null ? `${r.ingreso_total} €` : '—'}</td>
                        <td className="num">{r.bai != null ? `${r.bai} €` : '—'}</td>
                        <td className="num">{r.rentabilidad_pct != null ? `${Math.round(r.rentabilidad_pct * 1000) / 10} %` : '—'}</td>
                        <td className="num">{r.precio_bruto_noche != null ? `${r.precio_bruto_noche} €` : '—'}</td>
                        <td className="num">{tarifa} €</td>
                        <td className="num">
                          <NumInput step="1" min="0" className="leila-cobro-input"
                            value={efectivo || 0}
                            placeholder="0"
                            onChange={v => setEditsEfectivo(prev => ({ ...prev, [r._idx]: v }))}
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
                    <td className="num">{rows.reduce((s,r) => s + (Number(r.ingreso_total)||0), 0)} €</td>
                    <td className="num">{rows.reduce((s,r) => s + (Number(r.bai)||0), 0)} €</td>
                    <td colSpan="2"/>
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
              <NumInput step="1" min="0" className="leila-cobro-input"
                value={liqVal || 0}
                placeholder="0"
                onChange={v => setEditsLiquid(prev => ({ ...prev, [mKey]: v }))}
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

// ── PagoLinkInline ─────────────────────────────────────────────────────────────
// Panel inline que aparece al pulsar "💳" en una prereserva.
// Genera la URL de pago y permite copiarla o enviarla por WhatsApp.
const PagoLinkInline = ({ pr, noches, onClose }) => {
  const deposit    = pr.reserva || Math.round((Number(pr.ingreso_total) || 0) * 0.20);
  const resto      = (Number(pr.ingreso_total) || 0) - deposit;
  const aptShort   = APT_NAMES[pr.apt] || pr.apt;
  const aptFull    = APT_FULL[pr.apt] || aptShort;
  const params     = new URLSearchParams({
    apt:      pr.apt,
    checkin:  pr.entrada,
    checkout: pr.salida,
    nights:   String(noches),
    total:    String(pr.ingreso_total || 0),
    deposit:  String(deposit),
    guests:   String(pr.huespedes || 2),
    name:     pr.responsable || '',
  });
  const url = `${PAGO_PAGE_URL}?${params.toString()}`;

  const [copied, setCopied] = React.useState(false);
  const copyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const waMsg = (lang) => {
    const greeting = lang === 'en'
      ? `Hi ${pr.responsable || 'there'},`
      : `Hola ${pr.responsable || ''},`;
    const apt  = lang === 'en' ? `Hestía ${aptShort}` : `Hestía ${aptShort}`;
    const body = lang === 'en'
      ? `Here's the link to pay your ${deposit}€ deposit and confirm your stay at ${apt} (${pr.entrada} → ${pr.salida}):\n${url}\n\nThe remaining ${resto}€ is paid on arrival.`
      : `Aquí tienes el link para pagar la señal de ${deposit}€ y confirmar tu reserva en ${apt} (${pr.entrada} → ${pr.salida}):\n${url}\n\nEl resto (${resto}€) se abona a la llegada.`;
    return encodeURIComponent(`${greeting}\n${body}`);
  };

  return (
    <div style={{ background: 'rgba(42,15,46,.04)', border: '1px solid rgba(42,15,46,.12)', borderRadius: 8, padding: '16px 18px', marginTop: 10, position: 'relative' }}>
      <button onClick={onClose} style={{ position:'absolute', top:10, right:12, background:'none', border:'none', fontSize:16, cursor:'pointer', color:'#7A5A72' }} title="Cerrar">✕</button>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7A5A72', marginBottom: 10 }}>Link de pago</div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
        <span style={{ fontSize:11.5, color:'#3D1A35', background:'rgba(42,15,46,.07)', borderRadius:5, padding:'4px 10px', wordBreak:'break-all', flex:1, minWidth:0 }}>{url}</span>
      </div>
      <div style={{ fontSize: 12, color:'#7A5A72', marginBottom: 12 }}>
        Señal: <strong style={{color:'#C87A45'}}>{deposit}€</strong> · Resto al llegar: <strong>{resto}€</strong>
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button className="pe-btn pe-btn-primary" onClick={copyUrl}>
          {copied ? '✓ Copiado' : 'Copiar link'}
        </button>
        <a className="pe-btn pe-btn-ghost" style={{ textDecoration:'none' }}
           href={`https://wa.me/34620316370?text=${waMsg('es')}`} target="_blank" rel="noopener">
          WhatsApp Alex 🇪🇸
        </a>
        <a className="pe-btn pe-btn-ghost" style={{ textDecoration:'none' }}
           href={`https://wa.me/34654138251?text=${waMsg('en')}`} target="_blank" rel="noopener">
          WhatsApp Fran 🇬🇧
        </a>
      </div>
    </div>
  );
};

// ── PrereservasTab ─────────────────────────────────────────────────────────────
// Borradores de reserva almacenados en docs/data/prereservas.json (repo público).
// El botón "→ Reservas" escribe en reservas.json del repo privado y elimina el
// borrador de la lista pública en el mismo flujo.
const PrereservasTab = ({ token, refreshKey }) => {
  const [items,   setItems]   = React.useState(null);
  const [sha,     setSha]     = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [msg,     setMsg]     = React.useState(null);
  const [isErr,   setIsErr]   = React.useState(false);
  const [syncing, setSyncing] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [pagoFor,  setPagoFor]  = React.useState(null);

  const emptyForm = { apt: 'vm', responsable: '', telefono: '', huespedes: 2,
    menores_12: 0, entrada: '', salida: '', ingreso_total: '', reserva: '',
    canal: 'directo', observaciones: '' };
  const [form, setForm] = React.useState(emptyForm);

  const load = () => {
    setLoading(true); setMsg(null);
    fetch(`${API}/repos/${REPO}/contents/${PRERESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) })
      .then(r => {
        if (r.status === 404) return { sha: null, items: [] };
        return r.json().then(j => ({ sha: j.sha, items: JSON.parse(b64ToUtf8(j.content)).prereservas || [] }));
      })
      .then(({ sha, items }) => { setSha(sha); setItems(items); })
      .catch(e => { setIsErr(true); setMsg('Error cargando prereservas: ' + e.message); setItems([]); })
      .finally(() => setLoading(false));
  };
  React.useEffect(load, [token]);
  React.useEffect(() => { if (refreshKey > 0) load(); }, [refreshKey]);

  const saveList = async (newItems, currentSha) => {
    const body = JSON.stringify({
      message: `chore(prereservas): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
      content: utf8ToB64(JSON.stringify({ prereservas: newItems }, null, 2) + '\n'),
      ...(currentSha ? { sha: currentSha } : {}),
      branch: BRANCH,
    });
    const res = await fetch(`${API}/repos/${REPO}/contents/${PRERESERVAS_PATH}`, {
      method: 'PUT', headers: { ...apiHeaders(token), 'Content-Type': 'application/json' }, body,
    });
    if (!res.ok) throw new Error('Error guardando prereservas (' + res.status + ')');
    return (await res.json()).content.sha;
  };

  const addPrereserva = async () => {
    if (!form.responsable.trim() || !form.entrada || !form.salida || !form.ingreso_total) {
      setIsErr(true); setMsg('Faltan campos: nombre, fechas e importe.'); return;
    }
    const newItem = { id: 'pr-' + Date.now(), createdAt: new Date().toISOString(),
      ...form, huespedes: Number(form.huespedes)||2, menores_12: Number(form.menores_12)||0,
      ingreso_total: Number(form.ingreso_total), reserva: Number(form.reserva)||0 };
    try {
      const newSha = await saveList([newItem, ...(items||[])], sha);
      setItems(prev => [newItem, ...(prev||[])]); setSha(newSha);
      setForm(emptyForm); setShowForm(false); setIsErr(false); setMsg('Prereserva guardada.');
    } catch(e) { setIsErr(true); setMsg(e.message); }
  };

  const deleteItem = async (id) => {
    if (!confirm('¿Eliminar esta prereserva?')) return;
    const newItems = items.filter(r => r.id !== id);
    try {
      const newSha = await saveList(newItems, sha);
      setItems(newItems); setSha(newSha); setIsErr(false); setMsg('Prereserva eliminada.');
    } catch(e) { setIsErr(true); setMsg(e.message); }
  };

  const syncItem = async (pr) => {
    setSyncing(pr.id); setMsg(null);
    try {
      // 1. Leer reservas.json del repo privado
      const rRes = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) });
      if (!rRes.ok) throw new Error('No se pudo leer reservas.json (' + rRes.status + ')');
      const rFile = await rRes.json();
      const rData = JSON.parse(b64ToUtf8(rFile.content));
      // 2. Construir reserva con campos derivados
      const newRes = calcDerived({
        apt: pr.apt, responsable: pr.responsable, telefono: pr.telefono||'',
        huespedes: Number(pr.huespedes)||2, menores_12: Number(pr.menores_12)||0,
        cuna_trona: pr.cuna_trona||false, mascota: pr.mascota||false,
        dni_enviado: false, entrada: pr.entrada, salida: pr.salida,
        cancelacion: '', canal: pr.canal||'directo', contactado: false,
        f_reserva: new Date().toISOString().slice(0,10),
        ingreso_total: Number(pr.ingreso_total)||0, reserva: Number(pr.reserva)||0,
        pago_previo: 0, al_checkin: 0, comision: 0, fianza: 0,
        pagos_leila: 0, efectivo_leila: 0, observaciones: pr.observaciones||'',
      });
      // 3. Añadir y guardar en repo privado
      const updated = { ...rData, reservas: [...(rData.reservas||[]), newRes], updatedAt: new Date().toISOString() };
      const rPut = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `feat(reservas): ${pr.responsable} ${pr.entrada}–${pr.salida} via prereserva`,
          content: utf8ToB64(JSON.stringify(updated, null, 2) + '\n'),
          sha: rFile.sha, branch: BRANCH,
        }),
      });
      if (!rPut.ok) throw new Error('Error escribiendo reservas.json (' + rPut.status + ')');
      // 4a. Sincronizar calendario inmediatamente (no esperar al iCal sync de 4h)
      _syncReservasToAvailability(updated.reservas, token).catch(() => {});
      // 4b. Borrar de prereservas
      const newItems = items.filter(r => r.id !== pr.id);
      const newSha = await saveList(newItems, sha);
      setItems(newItems); setSha(newSha);
      setIsErr(false); setMsg(`✓ ${pr.responsable} añadida a Reservas.`);
    } catch(e) { setIsErr(true); setMsg(e.message); }
    finally { setSyncing(null); }
  };

  const noches = (pr) => pr.entrada && pr.salida
    ? Math.round((new Date(pr.salida) - new Date(pr.entrada)) / 86400000) : '—';

  if (loading) return <div className="pe-loading">Cargando prereservas…</div>;

  return (
    <div className="pe-tab-content">
      <div className="pe-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ margin:0 }}>Prereservas pendientes</h2>
          <button className="pe-btn pe-btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancelar' : '+ Nueva'}
          </button>
        </div>
        {msg && <div className={isErr ? 'pe-error' : 'pe-success'} style={{ marginBottom:16 }}>{msg}</div>}

        {showForm && (
          <div className="pe-card" style={{ background:'rgba(0,0,0,.04)', marginBottom:24 }}>
            <h3 style={{ marginTop:0 }}>Nueva prereserva</h3>
            <div className="pe-grid">
              <div className="pe-field">
                <label>Apartamento</label>
                <select value={form.apt} onChange={e => setForm(f=>({...f,apt:e.target.value}))} className="pe-input">
                  <option value="vm">Mar</option><option value="vt">Thalassa</option><option value="vs">Salinas</option>
                </select>
              </div>
              <div className="pe-field">
                <label>Canal</label>
                <select value={form.canal} onChange={e => setForm(f=>({...f,canal:e.target.value}))} className="pe-input">
                  <option value="directo">Directo</option><option value="airbnb">Airbnb</option>
                  <option value="booking">Booking</option><option value="avaibook">Avaibook</option>
                </select>
              </div>
              <div className="pe-field">
                <label>Responsable *</label>
                <input className="pe-input" value={form.responsable} onChange={e => setForm(f=>({...f,responsable:e.target.value}))} placeholder="Nombre y apellidos" />
              </div>
              <div className="pe-field">
                <label>Teléfono</label>
                <input className="pe-input" value={form.telefono} onChange={e => setForm(f=>({...f,telefono:e.target.value}))} placeholder="+34 600 000 000" />
              </div>
              <div className="pe-field">
                <label>Entrada *</label>
                <input type="date" className="pe-input" value={form.entrada} onChange={e => setForm(f=>({...f,entrada:e.target.value}))} />
              </div>
              <div className="pe-field">
                <label>Salida *</label>
                <input type="date" className="pe-input" value={form.salida} onChange={e => setForm(f=>({...f,salida:e.target.value}))} />
              </div>
              <div className="pe-field">
                <label>Huéspedes</label>
                <NumInput min="1" max="8" className="pe-input pe-input-num" value={form.huespedes || 0} onChange={v => setForm(f=>({...f,huespedes:v}))} />
              </div>
              <div className="pe-field">
                <label>Importe total (€) *</label>
                <NumInput step="0.01" min="0" className="pe-input pe-input-num" value={form.ingreso_total || 0} onChange={v => setForm(f=>({...f,ingreso_total:v}))} placeholder="1200" />
              </div>
              <div className="pe-field">
                <label>Señal (€)</label>
                <NumInput step="0.01" min="0" className="pe-input pe-input-num" value={form.reserva || 0} onChange={v => setForm(f=>({...f,reserva:v}))} placeholder="300" />
              </div>
              <div className="pe-field" style={{ gridColumn:'1/-1' }}>
                <label>Observaciones</label>
                <input className="pe-input" value={form.observaciones} onChange={e => setForm(f=>({...f,observaciones:e.target.value}))} placeholder="Notas libres…" />
              </div>
            </div>
            <div className="pe-actions">
              <button className="pe-btn pe-btn-primary" onClick={addPrereserva}>Guardar prereserva</button>
            </div>
          </div>
        )}

        {items && items.length === 0 ? (
          <p className="pe-hint">No hay prereservas pendientes.</p>
        ) : items && (
          <table className="pe-table">
            <thead>
              <tr><th>Apt</th><th>Huésped</th><th>Entrada</th><th>Salida</th><th>N</th><th>Total</th><th>Señal</th><th>Canal</th><th></th></tr>
            </thead>
            <tbody>
              {items.map(pr => (
                <tr key={pr.id}>
                  <td><span className="res-apt-chip" style={{ background:APT_COLOR[pr.apt], color:APT_TEXT[pr.apt] }}>{APT_NAMES[pr.apt]||pr.apt}</span></td>
                  <td><div>{pr.responsable}</div>{pr.telefono && <div className="pe-hint">{pr.telefono}</div>}</td>
                  <td>{fmtDate(pr.entrada)}</td>
                  <td>{fmtDate(pr.salida)}</td>
                  <td>{noches(pr)}</td>
                  <td>{fmtEur(pr.ingreso_total)}</td>
                  <td>{pr.reserva ? fmtEur(pr.reserva) : '—'}</td>
                  <td className="pe-hint">{pr.canal||'—'}</td>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <button className="pe-btn pe-btn-primary" style={{ marginRight:6 }}
                      disabled={!!syncing} onClick={() => syncItem(pr)}>
                      {syncing === pr.id ? '…' : '→ Reservas'}
                    </button>
                    <button className="pe-btn pe-btn-ghost" style={{ marginRight:4 }}
                      onClick={() => setPagoFor(pagoFor?.id === pr.id ? null : pr)}
                      title="Generar link de pago">
                      💳
                    </button>
                    <button className="pe-btn pe-btn-ghost" onClick={() => deleteItem(pr.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagoFor && (
          <PagoLinkInline
            pr={pagoFor}
            noches={noches(pagoFor)}
            onClose={() => setPagoFor(null)}
          />
        )}
      </div>
    </div>
  );
};

const ReservasTab = ({ token, refreshKey, onOpenContract }) => {
  const [data,        setData]        = React.useState(null);
  const [sha,         setSha]         = React.useState(null);
  const [histData,    setHistData]    = React.useState(null);
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
  const [contratoStatus, setContratoStatus] = React.useState('idle');
  const [focusYearOverride, setFocusYearOverride] = React.useState(null);
  const [focusMonth,        setFocusMonth]        = React.useState('all');

  const [loadedAt, setLoadedAt] = React.useState(null);
  const [icalDiscrepancies, setIcalDiscrepancies] = React.useState([]);
  const [discrepanciesOpen, setDiscrepanciesOpen] = React.useState(true);

  const loadData = React.useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' })
        .then(r => r.json())
        .then(j => {
          if (j.message) throw new Error(j.message);
          setSha(j.sha);
          setData(JSON.parse(b64ToUtf8(j.content)));
          setLoadedAt(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        }),
      fetch('data/dashboard-historico.json', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(hist => { if (hist) setHistData(hist); })
        .catch(() => {}),
    ])
    .catch(e => setError('Error cargando reservas: ' + e.message + ' — F12 para detalle.'))
    .finally(() => setLoading(false));
  }, [token]);

  // Detecta bloques iCal sin reserva correspondiente en P-Edit.
  // Se ejecuta tras cargar las reservas, comparando availability.json (ical[]) contra reservas[].
  React.useEffect(() => {
    if (!data) return;
    const reservas = (data.reservas || []);
    const today = new Date().toISOString().slice(0, 10);
    const _cxl = r => r.cancelada === true || (r.cancelacion || '').trim().toUpperCase() === 'CANCELADA';
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(avail => {
        if (!avail) return;
        const APT_LABEL = { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas' };
        const found = [];
        for (const apt of ['vm', 'vt', 'vs']) {
          for (const block of (avail[apt]?.ical || [])) {
            if (block.end <= today) continue;
            const match = reservas.find(r =>
              !_cxl(r) && (r.apt || '').toLowerCase() === apt &&
              r.entrada < block.end && r.salida > block.start
            );
            if (!match) found.push({ apt, label: APT_LABEL[apt], start: block.start, end: block.end });
          }
        }
        setIcalDiscrepancies(found);
      })
      .catch(() => {});
  }, [data]);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Reload when parent triggers a sync
  React.useEffect(() => { if (refreshKey > 0) loadData(); }, [refreshKey]);

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
  const historicYears = histData ? Object.keys(histData.years || {}).filter(y => !byYear[y]) : [];
  const allYears = [...Object.keys(byYear), ...historicYears].sort();
  const defaultFocus = byYear[currentYear] ? currentYear : (allYears[allYears.length - 1] || currentYear);
  const isHistoricOnly = y => !byYear[y] && !!(histData && histData.years && histData.years[y]);
  const focusYear = (focusYearOverride && allYears.includes(focusYearOverride)) ? focusYearOverride : defaultFocus;
  const focusList = byYear[focusYear] || [];

  const MES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const allMonths = [...new Set(focusList.map(r => (r.entrada || '').slice(5, 7)).filter(Boolean))].sort();
  const byMonth = {};
  focusList.forEach(r => {
    const m = (r.entrada || '').slice(5, 7);
    if (m) (byMonth[m] = byMonth[m] || []).push(r);
  });
  const visibleMonths = focusMonth === 'all' ? allMonths : allMonths.filter(m => m === focusMonth);

  // --- Métricas consistentes año a año ---
  // Bruto = ingreso_total (lo que paga el huésped al canal).
  // Comisiones = lo que se queda Airbnb/Booking/Avaibook.
  // Limpieza = gasto_limpieza (pago a equipo de limpieza).
  // Neto = bai (Beneficio Antes Impuestos, según hoja Hestía).
  // Excluimos 'renta' (sólo presente 2023+, semántica cambia año a año).
  // Las canceladas nunca se computan en métricas financieras.
  const _rxlCxl = r => {
    if (r.cancelada === true) return true;
    const c = (r.cancelacion || '').trim().toUpperCase();
    return c === 'CANCELADA' || c === 'CANCELADO';
  };
  const sum = (list, key) => list.reduce((a, r) => a + (Number(r[key]) || 0), 0);
  const yearMetrics = (list) => {
    const active = list.filter(r => !_rxlCxl(r));
    const bruto    = sum(active, 'ingreso_total');
    const comision = sum(active, 'comision');
    const limpieza = sum(active, 'gasto_limpieza');
    const neto     = sum(active, 'bai');
    const renta    = sum(active, 'renta');
    const noches   = sum(active, 'noches');
    const preciosNoche = active
      .map(r => Number(r.precio_bruto_noche))
      .filter(p => p > 0 && Number.isFinite(p));
    return {
      reservas:  active.length,
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
  const kFocusRaw = yearMetrics(focusList);
  const kFocus = (focusList.length === 0 && isHistoricOnly(focusYear) && histData.years[focusYear])
    ? (() => {
        const h = histData.years[focusYear];
        const bruto = h.ingresos || 0; const neto = h.bai || 0; const noches = h.noches || 0;
        return { reservas: h.reservas || 0, noches, bruto, comision: 0, limpieza: 0, neto,
          rentabilidad: bruto ? neto / bruto : 0, comisionPct: 0,
          brutoPorNoche: noches ? bruto / noches : 0, netoPorNoche: noches ? neto / noches : 0,
          minNoche: null, maxNoche: null };
      })()
    : kFocusRaw;

  // KPIs por apartamento (sólo año focal)
  const byApt = ['vm', 'vt', 'vs'].map(apt => {
    const list = focusList.filter(r => r.apt === apt);
    const m = yearMetrics(list);
    return { apt, reservas: m.reservas, noches: m.noches, ingreso: m.bruto, bai: m.neto };
  });

  // KPIs por canal (sólo año focal)
  const byCanal = {};
  focusList.filter(r => !_rxlCxl(r)).forEach(r => {
    const c = getCanalKey(r.canal);
    if (!byCanal[c]) byCanal[c] = { count: 0, sum: 0, bai: 0 };
    byCanal[c].count++;
    byCanal[c].sum += Number(r.ingreso_total) || 0;
    byCanal[c].bai += Number(r.bai)           || 0;
  });

  // --- Próximas y en estancia (en todos los años, son atemporales) ---
  const enEstancia = reservas.filter(r => reservaStatus(r, today) === 'staying')
    .sort((a, b) => a.salida.localeCompare(b.salida));
  const proximas = reservas.filter(r => {
    if (reservaStatus(r, today) !== 'upcoming') return false;
    const diff = (new Date(r.entrada) - new Date(today)) / 86400000;
    return diff <= 30;
  }).sort((a, b) => a.entrada.localeCompare(b.entrada));

  const buildWALink = (r) => {
    const apt = APT_NAMES[r.apt] || r.apt;
    const dias = Math.round((new Date(r.entrada) - new Date(today)) / 86400000);
    const lines = [
      `🏠 *Reserva en ${dias} día${dias !== 1 ? 's' : ''} · ${apt}*`,
      `👤 ${r.responsable || '—'}`,
      r.telefono    ? `📞 ${r.telefono}` : '',
      `📅 Entrada: ${fmtDate(r.entrada)}`,
      `📅 Salida:  ${fmtDate(r.salida)}`,
      `🌙 ${r.noches || '—'} noches · ${r.huespedes || '—'} pax`,
      r.canal ? `📲 Canal: ${r.canal}` : '',
      r.ingreso_total ? `💶 Total: ${fmtEur(r.ingreso_total)}` : '',
      r.bai         ? `📈 BAI: ${fmtEur(r.bai)}` : '',
      r.mascota     ? '🐾 Trae mascota' : '',
      r.cuna_trona  ? '👶 Necesita cuna/trona' : '',
      r.observaciones ? `📝 ${r.observaciones}` : '',
    ].filter(Boolean).join('\n');
    return `https://wa.me/34654138251?text=${encodeURIComponent(lines)}`;
  };

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


  // Recalcula la comisión de TODAS las reservas Booking/Airbnb con las tasas actuales.
  // Útil tras un cambio de tasas. Las reservas directas no se tocan.
  const recalcularComisiones = async () => {
    if (!data || !sha) return;
    const updated = (data.reservas || []).map(r => {
      const ck = getCanalKey(r.canal);
      if (ck !== 'booking' && ck !== 'airbnb') return r;
      return calcDerived({ ...r, _comision_manual: false });
    });
    await saveReservas(updated, { keepPanelOpen: true });
    setSuccess('Comisiones recalculadas y guardadas ✓');
  };

  // --- Acciones ---
  const saveReservas = async (newReservas, { keepPanelOpen = false } = {}) => {
    setError(null); setSuccess(null);
    const prevData = data;
    const newData = { ...data, reservas: newReservas, updatedAt: new Date().toISOString(), count: newReservas.length };
    const payload = utf8ToB64(JSON.stringify(newData, null, 2));
    const commitMsg = `chore(reservas): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`;

    // Actualización optimista: los KPIs y el listado se recalculan al instante
    // sin esperar a que la API de GitHub confirme. Si la operación falla, se revierte.
    setData(newData);

    const attemptSave = async (currentSha) => {
      const r = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}`, {
        method: 'PUT', headers: apiHeaders(token),
        body: JSON.stringify({ message: commitMsg, content: payload, sha: currentSha, branch: BRANCH }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || 'Error desconocido');
      return j.content.sha;
    };

    const onSaved = (newReservasList) => {
      _syncReservasToAvailability(newReservasList, token).catch(() => {});
    };

    try {
      const newSha = await attemptSave(sha);
      setSha(newSha);
      setSuccess('Reservas guardadas ✓');
      if (!keepPanelOpen) { setSelectedIdx(-1); setDraft(null); }
      onSaved(newReservas);
    } catch (e) {
      // SHA desfasada (sync corrió entre carga y guardado): re-fetch y reintento automático
      if (e.message && e.message.includes('does not match')) {
        try {
          const rf = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
          const rfj = await rf.json();
          const freshSha = rfj.sha;
          setSha(freshSha);
          const newSha = await attemptSave(freshSha);
          setSha(newSha);
          setSuccess('Reservas guardadas ✓');
          if (!keepPanelOpen) { setSelectedIdx(-1); setDraft(null); }
          onSaved(newReservas);
        } catch (e2) {
          setData(prevData);
          setError('Error guardando: ' + e2.message);
        }
      } else {
        setData(prevData);
        setError('Error guardando: ' + e.message);
      }
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
      // Al cambiar canal, resetear override de comisión — calcDerived la recalcula.
      if (field === 'canal') {
        next._comision_manual = false;
      }
      // Si el usuario edita la comisión directamente, marcamos manual.
      if (field === 'comision') {
        next._comision_manual = true;
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

  const resetLimpiezaAuto  = () => setDraft(prev => calcDerived({ ...prev, _limpieza_manual:  false }));
  const resetComisionAuto  = () => setDraft(prev => calcDerived({ ...prev, _comision_manual: false }));

  // Devuelve la reserva que solapa con `r` (excluyendo el índice `skipIdx`).
  // Solapar = el check-in de una es estrictamente antes del check-out de la
  // otra Y viceversa. Que coincida check-out con check-in está permitido.
  const isCancelada = r => {
    if (r.cancelada === true) return true;
    const c = (r.cancelacion || '').trim().toUpperCase();
    return c === 'CANCELADA' || c === 'CANCELADO';
  };

  const findOverlap = (r, skipIdx) => {
    if (!r.entrada || !r.salida || !r.apt) return null;
    if (isCancelada(r)) return null;
    return reservas.find((other, i) => {
      if (i === skipIdx) return false;
      if (isCancelada(other)) return false;
      if (other.apt !== r.apt) return false;
      if (!other.entrada || !other.salida) return false;
      return r.entrada < other.salida && r.salida > other.entrada;
    }) || null;
  };

  const saveDraft = () => {
    if (!draft) return;
    const cleaned = calcDerived(draft);
    const overlap = findOverlap(cleaned, selectedIdx >= 0 && selectedIdx < reservas.length ? selectedIdx : -1);
    if (overlap) {
      setError(`Solape de fechas: la reserva de ${overlap.responsable || '—'} (${overlap.entrada} → ${overlap.salida}) en ${overlap.apt?.toUpperCase() || '—'} se superpone con estas fechas. Corrige antes de guardar.`);
      return;
    }
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

  const duplicateRow = () => {
    if (!draft) return;
    setSelectedIdx(reservas.length);
    setDraft(calcDerived({ ...draft, f_reserva: today, observaciones: (draft.observaciones ? draft.observaciones + ' · Duplicada' : 'Duplicada') }));
  };

  const deleteRow = () => {
    if (selectedIdx < 0 || selectedIdx >= reservas.length) return;
    if (!confirm(`¿Borrar reserva de ${reservas[selectedIdx].responsable}?`)) return;
    const nr = reservas.filter((_, i) => i !== selectedIdx);
    saveReservas(nr);
  };

  // --- Calendar alert generator ---
  const generateCalendarAlert = (r) => {
    if (!r.entrada) return;
    const [yr, mo, dy] = r.entrada.split('-').map(Number);
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const fmtLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}${m}${d}T170000`;
    };

    const d1 = new Date(yr, mo - 1, dy - 7);
    const d2 = new Date(yr, mo - 1, dy - 1);
    const apt = APT_NAMES[r.apt] || r.apt;
    const guest = r.responsable || 'Huésped';

    const ev = (uid, dt, summary) => [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=Europe/Madrid:${dt}`,
      `DTEND;TZID=Europe/Madrid:${dt}`,
      `SUMMARY:${summary}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${summary}`,
      'TRIGGER:PT0S',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Hestia//Admin//ES',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Madrid',
      'BEGIN:STANDARD',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
      ev(`hestia-7d-${r.entrada}-${r.apt}`, fmtLocal(d1), `🔔 1 semana · ${apt} · ${guest}`),
      ev(`hestia-1d-${r.entrada}-${r.apt}`, fmtLocal(d2), `🔔 Mañana llega · ${apt} · ${guest}`),
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerta_${r.apt}_${r.entrada}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleContratoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !draft) return;
    e.target.value = '';
    setContratoStatus('uploading');
    setError(null);
    try {
      const apt = (draft.apt || 'apt').toLowerCase();
      const nombre = (draft.responsable || 'huesped').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const entrada = (draft.entrada || 'fecha').replace(/-/g, '');
      const aptName = { vm: 'Vera_Mar', vs: 'Vera_Salinas', vb: 'Vera_Brisa' }[apt] || apt;
      const filename = `${entrada}_Hestia_${aptName}_contrato_${nombre}_firmado.pdf`;
      const contratoPath = `contratos/${filename}`;

      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const b64 = btoa(binary);

      let existingSha;
      const check = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${contratoPath}?ref=${BRANCH}`, { headers: apiHeaders(token) });
      if (check.ok) {
        const cj = await check.json();
        existingSha = cj.sha;
      }

      const putBody = {
        message: `feat(contratos): adjuntar ${filename}`,
        content: b64,
        branch: BRANCH,
        ...(existingSha ? { sha: existingSha } : {}),
      };
      const put = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${contratoPath}`, {
        method: 'PUT', headers: apiHeaders(token), body: JSON.stringify(putBody),
      });
      if (!put.ok) {
        const pj = await put.json();
        throw new Error(pj.message || 'Error subiendo contrato');
      }

      const updatedDraft = { ...draft, contrato_pdf: filename };
      setDraft(updatedDraft);
      const nr = [...reservas];
      const idx = selectedIdx >= 0 && selectedIdx < reservas.length ? selectedIdx : -1;
      if (idx >= 0) {
        nr[idx] = calcDerived(updatedDraft);
        await saveReservas(nr, { keepPanelOpen: true });
      }
      setContratoStatus('idle');
    } catch (err) {
      setError('Error adjuntando contrato: ' + err.message);
      setContratoStatus('idle');
    }
  };

  const downloadContrato = async (filename) => {
    if (!filename) return;
    const contratoPath = `contratos/${filename}`;
    try {
      const r = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${contratoPath}?ref=${BRANCH}`, { headers: apiHeaders(token) });
      if (!r.ok) throw new Error('No se pudo obtener el contrato');
      const j = await r.json();
      const binary = atob(j.content.replace(/\n/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      setError('Error descargando contrato: ' + err.message);
    }
  };

  const handleContratoDownload = () => downloadContrato(draft?.contrato_pdf);

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
          <h2>🗓️ Reservas <span className="rv-count">· año {focusYear} · {kFocus.reservas} reservas · actualizado {data.updatedAt ? data.updatedAt.slice(0,10) : '—'}</span></h2>
          <div className="rv-head-actions">
            <button type="button" className="pe-btn pe-btn-ghost" onClick={loadData} disabled={loading}>
              {loading ? 'Recargando…' : 'Recargar'}
            </button>
            {loadedAt && <span className="leila-loaded-at">Actualizado {loadedAt}</span>}
            <button type="button" className="pe-btn pe-btn-ghost" onClick={() => data && exportReservasExcel(focusList, focusYear)} disabled={!data}>
              Exportar Excel
            </button>
            <button type="button" className="pe-btn pe-btn-ghost" onClick={recalcularComisiones} disabled={!data || loading} title="Aplica Booking 19.8% (18.7%+1.1%) y Airbnb 18.755% (15.5%+IVA) a todas las reservas OTA">
              Recalcular comisiones
            </button>
            <button type="button" className="pe-btn pe-btn-primary" onClick={newRow}>+ Nueva</button>
          </div>
        </div>

        {/* ───── Alerta discrepancias iCal ──────────────────────────────────
            Bloques bloqueados en Airbnb/Booking sin reserva en P-Edit.
            Puede indicar una reserva OTA no registrada manualmente. */}
        {icalDiscrepancies.length > 0 && (
          <div className="pe-card rv-discrepancy-banner">
            <div className="rv-discrepancy-head" onClick={() => setDiscrepanciesOpen(o => !o)} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <span>⚠️</span>
              <strong>{icalDiscrepancies.length} bloque{icalDiscrepancies.length !== 1 ? 's' : ''} del iCal sin reserva en P-Edit</strong>
              <span style={{ marginLeft:'auto', opacity:.6, fontSize:12 }}>{discrepanciesOpen ? '▲ Ocultar' : '▼ Ver'}</span>
            </div>
            {discrepanciesOpen && (
              <ul className="rv-discrepancy-list">
                {icalDiscrepancies.map((d, i) => (
                  <li key={i}>
                    <strong>{d.label}</strong>: {d.start} → {d.end}
                    <span className="rv-discrepancy-note"> — bloqueado en Airbnb/Booking pero sin reserva registrada en P-Edit</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="rv-discrepancy-hint">Si la reserva ya está registrada con fechas ligeramente distintas, puedes ignorar esto. Si no lo está, crea la reserva para evitar solapamientos.</p>
          </div>
        )}

        {/* ───── Dashboard multi-año (cabecera) ─────
            Tabla comparativa con métricas consistentes año a año:
            Bruto · Comisiones · Limpieza · Neto (BAI) · Margen · €/noche.
            Click en una fila para cambiar el año focal del listado. */}
        {allYears.length > 0 && (
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
                    const isAgg = isHistoricOnly(y);
                    const m = isAgg
                      ? (() => {
                          const h = histData.years[y];
                          const bruto = h.ingresos || 0; const neto = h.bai || 0; const noches = h.noches || 0;
                          return { reservas: h.reservas||0, noches, bruto, comision: null, limpieza: null, neto,
                            rentabilidad: bruto ? neto/bruto : 0, brutoPorNoche: noches ? bruto/noches : 0,
                            minNoche: null, maxNoche: null };
                        })()
                      : yearMetrics(byYear[y]);
                    const isFocus = y === focusYear;
                    return (
                      <tr key={y}
                          className={`rv-yearly-row${isFocus ? ' is-focus' : ''}${isAgg ? ' rv-yearly-row-agg' : ''}`}
                          onClick={() => { setFocusYearOverride(y); setFocusMonth('all'); }}
                          title={isAgg ? 'Datos agregados — sin fichas individuales para este año' : ''}>
                        <td><strong>{y}</strong>{isAgg && <span className="rv-agg-badge">resumen</span>}</td>
                        <td className="num">{m.reservas}</td>
                        <td className="num">{m.noches}</td>
                        <td className="num">{fmtEur(m.bruto)}</td>
                        <td className="num rv-yearly-neg">{m.comision !== null ? `−${fmtEur(m.comision)}` : '—'}</td>
                        <td className="num rv-yearly-neg">{m.limpieza !== null ? `−${fmtEur(m.limpieza)}` : '—'}</td>
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

        {/* ───── Alertas ≤30 días ───── */}
        {proximas.length > 0 && (
          <div className="rv-now rv-banner-upcoming rv-banner-alert">
            <h3>⚠️ Reservas en menos de 30 días · {proximas.length}</h3>
            <ul>
              {proximas.map((r, i) => {
                const dias = Math.round((new Date(r.entrada) - new Date(today)) / 86400000);
                return (
                  <li key={i}>
                    <span className="rv-prox-days-badge">{dias}d</span>
                    <span className="rv-prox-date">{fmtDate(r.entrada)}</span>
                    <span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt]}</span>
                    <strong>{r.responsable}</strong>
                    <span className="rv-prox-meta">{r.huespedes} pax · {r.noches}n · {r.canal}</span>
                    <a href={buildWALink(r)} target="_blank" rel="noopener noreferrer"
                      className="rv-wa-btn" title="Avisar a Fran por WhatsApp">📲 WhatsApp</a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ───── Filtros ───── */}
        <div className="rv-toolbar">
          <label>Año
            <select value={focusYear} onChange={e => { setFocusYearOverride(e.target.value); setFocusMonth('all'); }}>
              {allYears.slice().reverse().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label>Mes
            <select value={focusMonth} onChange={e => setFocusMonth(e.target.value)}>
              <option value="all">Todos los meses</option>
              {allMonths.map(m => <option key={m} value={m}>{MES_FULL[parseInt(m, 10) - 1]}</option>)}
            </select>
          </label>
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
              <option value="cancelada">Canceladas</option>
            </select>
          </label>
          <span className="rv-hint">Click en una fila para editarla →</span>
        </div>

        {/* ───── Tablas por mes ───── */}
        {visibleMonths.length === 0 && (
          isHistoricOnly(focusYear)
            ? <p className="pe-help" style={{ marginTop: 16 }}>Año {focusYear} — datos agregados del histórico. No hay fichas individuales registradas en P-Edit para este año. Los resúmenes se muestran en la tabla de arriba.</p>
            : <p className="pe-help" style={{ marginTop: 16 }}>Sin reservas en {focusYear}.</p>
        )}

        {visibleMonths.map(m => {
          const mRows = filtered.filter(r => (r.entrada || '').slice(5, 7) === m);
          if (mRows.length === 0) return null;
          const mActive  = mRows.filter(r => !isCancelada(r));
          const mBruto   = mActive.reduce((s, r) => s + (Number(r.ingreso_total) || 0), 0);
          const mComis   = mActive.reduce((s, r) => s + (Number(r.comision) || 0), 0);
          const mBai     = mActive.reduce((s, r) => s + (Number(r.bai) || 0), 0);
          const mNoches  = mActive.reduce((s, r) => s + (Number(r.noches) || 0), 0);
          return (
            <div key={m} className="leila-month-block">
              <div className="leila-month-hdr">
                <span className="leila-month-name">{MES_FULL[parseInt(m, 10) - 1]} {focusYear}</span>
                <span className="leila-month-kpis">
                  <span>{mRows.length} reserva{mRows.length !== 1 ? 's' : ''}</span>
                  <span>{mNoches} noches</span>
                  <span>Bruto: <strong>{fmtEur(mBruto)}</strong></span>
                  <span>BAI: <strong>{fmtEur(mBai)}</strong></span>
                  <span>{mBruto ? fmtPct(mBai / mBruto) : '—'}</span>
                </span>
              </div>
              <div className="rv-table-wrap">
                <table className="rv-table">
                  <thead><tr>
                    <th className="rv-status-th"></th>
                    <th>Apt</th><th>Huésped</th><th>Entrada</th><th>Salida</th>
                    <th className="num">Noches</th><th className="num">Pax</th>
                    <th>Canal</th>
                    <th className="num">Ingreso</th><th className="num">Comisión</th><th className="num">BAI</th><th className="num">%</th>
                    <th className="rv-ical-th"></th>
                    <th className="rv-ical-th"></th>
                  </tr></thead>
                  <tbody>
                    {mRows.map(r => {
                      const idx = reservas.indexOf(r);
                      const status = reservaStatus(r, today);
                      const cancelada = isCancelada(r);
                      const statusIcon = cancelada ? '✗' : status === 'staying' ? '🏠' : status === 'upcoming' ? '⏰' : status === 'past' ? '✓' : '·';
                      const isSel = idx === selectedIdx;
                      return (
                        <tr key={idx} className={`rv-row rv-row-${status}${isSel ? ' is-selected' : ''}${cancelada ? ' rv-row-cancelada' : ''}`}
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
                          <td className="rv-ical-td" onClick={e => e.stopPropagation()}>
                            <button type="button" className="rv-ical-btn" title="Generar alerta de calendario (.ics)"
                              onClick={() => generateCalendarAlert(r)}>🔔</button>
                          </td>
                          <td className="rv-ical-td" onClick={e => e.stopPropagation()}>
                            {r.contrato_pdf && (
                              <button type="button" className="rv-ical-btn" title={r.contrato_pdf}
                                onClick={() => downloadContrato(r.contrato_pdf)}>📄</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="rv-month-foot">
                      <td colSpan="8"/>
                      <td className="num"><strong>{fmtEur(mBruto)}</strong></td>
                      <td className="num">{fmtEur(mComis)}</td>
                      <td className="num"><strong>{fmtEur(mBai)}</strong></td>
                      <td className="num">{mBruto ? fmtPct(mBai / mBruto) : '—'}</td>
                      <td/><td/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
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
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>DNI / pasaporte</label>
                    <input value={draft.dni || ''} onChange={e => updateDraft('dni', e.target.value)} placeholder="12345678A" />
                  </div>
                  <div className="rv-field">
                    <label>Dirección postal</label>
                    <input value={draft.direccion || ''} onChange={e => updateDraft('direccion', e.target.value)} placeholder="Calle, nº, ciudad" />
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
                    <NumInput min="1" value={draft.huespedes || 0} onChange={v => updateDraft('huespedes', v)} />
                  </div>
                  <div className="rv-field">
                    <label>{'<12 años'}</label>
                    <NumInput min="0" value={draft.menores_12 || 0} onChange={v => updateDraft('menores_12', v)} />
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
                    <label>Estado / política cancelación</label>
                    <select value={isCancelada(draft||{}) ? '' : (draft.cancelacion || 'Cancelable 14')}
                      onChange={e => updateDraft('cancelacion', e.target.value)}
                      disabled={isCancelada(draft||{})}>
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
                  <NumInput step="0.01" value={draft.ingreso_total || 0} onChange={v => updateDraft('ingreso_total', v)} />
                </div>
                <div className="rv-row2">
                  <div className="rv-field">
                    <label>Comisión
                      {draft._comision_manual
                        ? <button type="button" className="rv-mini-link" onClick={resetComisionAuto}>↻ auto</button>
                        : (() => {
                            const ck = getCanalKey(draft.canal);
                            return <span className="rv-hint-inline">
                              {ck === 'booking' ? 'booking: 19.8% (18.7%+1.1%)' :
                               ck === 'airbnb'  ? 'airbnb: 18.755% (15.5%+IVA)' :
                               `${ck}: ${((COMMISSION_RATES[ck] ?? 0)*100).toFixed(1)}%`}
                            </span>;
                          })()}
                    </label>
                    <NumInput step="0.01" value={draft.comision || 0} onChange={v => updateDraft('comision', v)} />
                  </div>
                  <div className="rv-field">
                    <label>Gasto limpieza
                      {draft._limpieza_manual
                        ? <button type="button" className="rv-mini-link" onClick={resetLimpiezaAuto}>↻ auto</button>
                        : <span className="rv-hint-inline">auto (jul/ago o &gt;10n: 90 € · resto: 80 €)</span>}
                    </label>
                    <NumInput step="0.01" value={draft.gasto_limpieza || 0} onChange={v => updateDraft('gasto_limpieza', v)} />
                  </div>
                </div>
                <div className="rv-row3">
                  <div className="rv-field">
                    <label>Señal</label>
                    <NumInput step="0.01" value={draft.reserva || 0} onChange={v => updateDraft('reserva', v)} />
                  </div>
                  <div className="rv-field">
                    <label>Pago previo</label>
                    <NumInput step="0.01" value={draft.pago_previo || 0} onChange={v => updateDraft('pago_previo', v)} />
                  </div>
                  <div className="rv-field">
                    <label>Efectivo check-in
                      {draft._checkin_manual
                        ? <button type="button" className="rv-mini-link" onClick={() => setDraft(p => calcDerived({...p, _checkin_manual: false}))}>↻ auto</button>
                        : <span className="rv-calc"> auto</span>}
                    </label>
                    <NumInput step="0.01" value={draft.al_checkin || 0}
                      onChange={v => setDraft(p => ({ ...p, al_checkin: v, _checkin_manual: true }))} />
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

              <fieldset><legend>Contrato firmado</legend>
                <div className="rv-contrato-block">
                  {draft.contrato_pdf ? (
                    <>
                      <span className="rv-contrato-fname" title={draft.contrato_pdf}>📎 {draft.contrato_pdf}</span>
                      <button type="button" className="pe-btn pe-btn-ghost" onClick={handleContratoDownload}>⬇ Descargar</button>
                      <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                        🔄 Reemplazar
                        <input type="file" accept=".pdf" style={{display:'none'}} onChange={handleContratoUpload}/>
                      </label>
                    </>
                  ) : (
                    <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                      {contratoStatus === 'uploading' ? '⏳ Subiendo…' : '📎 Adjuntar contrato firmado'}
                      <input type="file" accept=".pdf" style={{display:'none'}} onChange={handleContratoUpload} disabled={contratoStatus === 'uploading'}/>
                    </label>
                  )}
                </div>
              </fieldset>
            </div>

            {(() => {
              const liveOverlap = draft && findOverlap(draft, selectedIdx >= 0 && selectedIdx < reservas.length ? selectedIdx : -1);
              return liveOverlap ? (
                <div className="rv-overlap-warn">
                  ⚠ Solape con {liveOverlap.responsable || '—'} ({liveOverlap.entrada} → {liveOverlap.salida}) en {liveOverlap.apt?.toUpperCase() || '—'}
                </div>
              ) : null;
            })()}

            <footer className="rv-edit-foot">
              <div className="rv-edit-foot-row1">
                {selectedIdx >= 0 && selectedIdx < reservas.length && (
                  <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn rv-btn-danger" onClick={deleteRow}>🗑 Borrar</button>
                )}
                {draft && (
                  isCancelada(draft)
                    ? <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn rv-btn-reactivar"
                        onClick={() => {
                          const updated = calcDerived({ ...draft, cancelada: false });
                          setDraft(updated);
                          if (selectedIdx >= 0 && selectedIdx < reservas.length) {
                            const nr = [...reservas]; nr[selectedIdx] = updated; saveReservas(nr);
                          }
                        }}>↩ Reactivar</button>
                    : <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn rv-btn-cancelar"
                        onClick={() => {
                          const updated = calcDerived({ ...draft, cancelada: true });
                          setDraft(updated);
                          if (selectedIdx >= 0 && selectedIdx < reservas.length) {
                            const nr = [...reservas]; nr[selectedIdx] = updated; saveReservas(nr);
                          }
                        }}>✗ Cancelar reserva</button>
                )}
                {onOpenContract && (
                  <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn" title="Abrir en el generador de contratos"
                    onClick={() => { saveDraft(); onOpenContract(draft); }}>📄 Contrato</button>
                )}
                {selectedIdx >= 0 && selectedIdx < reservas.length && (
                  <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn" onClick={duplicateRow}>Duplicar</button>
                )}
              </div>
              <div className="rv-edit-foot-row2">
                <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn" onClick={cancelDraft}>Cancelar</button>
                <button type="button" className="pe-btn pe-btn-primary rv-foot-btn rv-foot-save" onClick={saveDraft}>Guardar</button>
              </div>
            </footer>
          </aside>
        </>
      )}
    </>
  );
};


// ---------------------------------------------------------------
// HuecosTab — gestión de huecos entre reservas con pricing
// ---------------------------------------------------------------

const _hcDiff = (a, b) =>
  Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
const _hcAdd = (ds, n) => {
  const d = new Date(ds + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const _hcFmt = (ds) => {
  const d = new Date(ds + 'T12:00:00Z');
  const M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][d.getUTCMonth()];
  return `${d.getUTCDate()} ${M}`;
};

// Returns the season for a given date using prices.json calendar structure:
// calendar[year].seasons[season] = [[start, end], ...]
const _hcSeasonForDate = (ds, calendar) => {
  const year = ds.slice(0, 4);
  const yc = calendar && calendar[year];
  if (!yc || !yc.seasons) return 'baja';
  for (const [s, ranges] of Object.entries(yc.seasons)) {
    for (const [from, to] of ranges) {
      if (ds >= from && ds <= to) return s;
    }
  }
  return 'baja';
};

// Returns the "worst" (highest-priority) season a gap touches
const _hcDominantSeason = (start, end, calendar) => {
  const counts = {};
  let cur = start;
  while (cur < end) {
    const s = _hcSeasonForDate(cur, calendar);
    counts[s] = (counts[s] || 0) + 1;
    cur = _hcAdd(cur, 1);
  }
  for (const s of ['critica', 'alta', 'media', 'baja']) {
    if (counts[s]) return s;
  }
  return 'baja';
};

// Extracts gaps between consecutive blocked periods
const _hcCalcGaps = (blocked, today, horizon) => {
  if (!blocked || blocked.length === 0) return [];
  const sorted = [...blocked].sort((a, b) => a.start < b.start ? -1 : 1);
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gs = sorted[i].end;
    const ge = sorted[i + 1].start;
    if (gs >= ge) continue;            // overlap or zero gap
    if (ge <= today) continue;         // entirely in the past
    if (horizon && gs >= horizon) continue;
    const nights = _hcDiff(gs, ge);
    if (nights < 2) continue;         // 1-night gaps can't be booked
    gaps.push({ start: gs, end: ge, nights });
  }
  return gaps;
};

const HC_MAX    = { critica: 7, alta: 7, media: 28, baja: 28 };
const HC_LBL    = { baja: 'T. baja', media: 'T. media', alta: 'T. alta', critica: 'T. crítica' };
const HC_COL    = { baja: '#6FC4D1', media: '#B9813E', alta: '#D42B80', critica: '#8A1B1B' };
const HC_APT    = {
  vm: { name: 'Hestía Mar',      accent: '#6B7A3A' },
  vt: { name: 'Hestía Thalassa', accent: '#B86A3C' },
  vs: { name: 'Hestía Salinas',  accent: '#D4A84A' },
};

const BULK_PRESETS = [
  { label: 'Última hora (<30d)', icon: '⚡', cfg: { season: 'all', minN: '', maxN: '', maxDays: '30', type: 'discount', value: '20', lm: true,  onlyNew: true  } },
  { label: 'Larga estancia baja (>28n)',  icon: '🌿', cfg: { season: 'baja',  minN: '29', maxN: '', maxDays: '', type: 'discount', value: '15', lm: false, onlyNew: false } },
  { label: 'Larga estancia media (>28n)', icon: '🌤', cfg: { season: 'media', minN: '29', maxN: '', maxDays: '', type: 'discount', value: '10', lm: false, onlyNew: false } },
  { label: 'Alta urgente (<14d)',  icon: '🔥', cfg: { season: 'alta',  minN: '', maxN: '', maxDays: '14', type: 'discount', value: '15', lm: true,  onlyNew: true  } },
  { label: 'Crítica urgente (<7d)', icon: '🚨', cfg: { season: 'critica', minN: '', maxN: '', maxDays: '7', type: 'discount', value: '25', lm: true, onlyNew: true } },
];

// Long-stay monthly rates (€/month). Jul (7) and Aug (8) not offered.
const LS_RATES = { 1:1450, 2:1450, 3:1450, 4:1450, 5:1590, 6:1790, 9:1790, 10:1590, 11:1450, 12:1450 };

const _isLongStayGap = (gap) => {
  if (gap.nights <= 28) return false;
  const m = parseInt(gap.start.slice(5, 7), 10);
  return m !== 7 && m !== 8;
};

const _lsIncludesChristmas = (start, end) => {
  const yr = parseInt(start.slice(0, 4), 10);
  return (start < `${yr + 1}-01-07` && end > `${yr}-12-20`) ||
         (start < `${yr}-01-07`     && end > `${yr - 1}-12-20`);
};

// Returns a breakdown by calendar month + total.
// Special nights (Christmas Dec 23–Jan 6, Easter from config) use a flat rate (default 80 €/night).
const _lsIsChristmasNight = (ds) => {
  const m = parseInt(ds.slice(5, 7), 10);
  const d = parseInt(ds.slice(8, 10), 10);
  return (m === 12 && d >= 23) || (m === 1 && d <= 6);
};

const _lsIsEasterNight = (ds, easterRanges) => {
  if (!easterRanges) return false;
  return easterRanges.some(([s, e]) => ds >= s && ds <= e);
};

const _lsBreakdown = (start, end, lsCfg) => {
  const specialFlat  = (lsCfg && lsCfg.specialNightFlat) || 80;
  const easterRanges = (lsCfg && lsCfg.easterRanges) || [];
  const MO_NAMES = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  const byMonth = {};
  let cur = start;
  while (cur < end) {
    const yr = parseInt(cur.slice(0, 4), 10);
    const mo = parseInt(cur.slice(5, 7), 10);
    if (mo === 7 || mo === 8) return null;
    const monthlyRate = (mo === 6 || mo === 9) ? 1790
                      : (mo === 5 || mo === 10) ? 1590 : 1450;
    const dim         = new Date(yr, mo, 0).getDate();
    const baseNight   = monthlyRate / dim;
    const isSpecial   = _lsIsChristmasNight(cur) || _lsIsEasterNight(cur, easterRanges);
    const nightCost   = isSpecial ? specialFlat : baseNight;
    const key = `${yr}-${String(mo).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { label: `${MO_NAMES[mo]} ${yr}`, nights: 0, amount: 0, specialNights: 0, monthlyRate, dim };
    byMonth[key].nights++;
    byMonth[key].amount += nightCost;
    if (isSpecial) byMonth[key].specialNights++;
    cur = _hcAdd(cur, 1);
  }

  const parts = Object.values(byMonth).map(p => ({ ...p, amount: Math.round(p.amount) }));
  const total = parts.reduce((s, p) => s + p.amount, 0);
  return { parts, total, specialFlat };
};

const _hcOvLabel = (ov) => {
  if (!ov) return null;
  if (ov.type === 'discount')  return `-${ov.value}%`;
  if (ov.type === 'increment') return `+${ov.value}%`;
  if (ov.type === 'fixed')     return `${ov.value}€/n`;
  return 'ajuste';
};

const _hcEffPrice = (base, ov) => {
  if (!ov || ov.type === 'none') return base;
  if (ov.type === 'discount')  return Math.round(base * (1 - ov.value / 100));
  if (ov.type === 'increment') return Math.round(base * (1 + ov.value / 100));
  if (ov.type === 'fixed')     return ov.value;
  return base;
};

// Config panel for long-stay special night flat rate + Easter date ranges
const LsCfgPanel = ({ lsCfg, open, setOpen, onSave, saving }) => {
  const mr = lsCfg.monthlyRates || { baja: 1450, media: 1590, alta: 1790 };
  const [rateBaja,   setRateBaja  ] = React.useState(String(mr.baja  || 1450));
  const [rateMedia,  setRateMedia ] = React.useState(String(mr.media || 1590));
  const [rateAlta,   setRateAlta  ] = React.useState(String(mr.alta  || 1790));
  const [flat,       setFlat      ] = React.useState(String(lsCfg.specialNightFlat   || 80));
  const [extraGuest, setExtraGuest] = React.useState(String(lsCfg.extraGuestPerMonth || 60));
  const [petMonth,   setPetMonth  ] = React.useState(String(lsCfg.petPerMonth        || 50));
  const suppIn = lsCfg.aptSupplement || {};
  const [suppMar, setSuppMar] = React.useState(String(suppIn.vm || 0));
  const [suppTha, setSuppTha] = React.useState(String(suppIn.vt || 0));
  const [suppSal, setSuppSal] = React.useState(String(suppIn.vs || 0));
  const [ranges,     setRanges    ] = React.useState(
    (lsCfg.easterRanges || []).map(([s, e]) => `${s} ${e}`).join('\n')
  );

  React.useEffect(() => {
    const r = lsCfg.monthlyRates || { baja: 1450, media: 1590, alta: 1790 };
    setRateBaja(String(r.baja  || 1450));
    setRateMedia(String(r.media || 1590));
    setRateAlta(String(r.alta  || 1790));
    setFlat(String(lsCfg.specialNightFlat   || 80));
    setExtraGuest(String(lsCfg.extraGuestPerMonth || 60));
    setPetMonth(String(lsCfg.petPerMonth        || 50));
    const s = lsCfg.aptSupplement || {};
    setSuppMar(String(s.vm || 0));
    setSuppTha(String(s.vt || 0));
    setSuppSal(String(s.vs || 0));
    setRanges((lsCfg.easterRanges || []).map(([s, e]) => `${s} ${e}`).join('\n'));
  }, [lsCfg]);

  const handleSave = () => {
    const parsed = ranges.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const [s, e] = l.split(/\s+/);
      return s && e ? [s, e] : null;
    }).filter(Boolean);
    onSave({
      monthlyRates: {
        baja:  parseFloat(rateBaja)  || 1450,
        media: parseFloat(rateMedia) || 1590,
        alta:  parseFloat(rateAlta)  || 1790,
      },
      specialNightFlat:   parseFloat(flat)       || 80,
      extraGuestPerMonth: parseFloat(extraGuest) || 60,
      petPerMonth:        parseFloat(petMonth)   || 0,
      aptSupplement: {
        vm: parseFloat(suppMar) || 0,
        vt: parseFloat(suppTha) || 0,
        vs: parseFloat(suppSal) || 0,
      },
      easterRanges: parsed,
    });
  };

  // Precios efectivos en vivo: base + suplemento
  const effPrice = (base, supp) => {
    const b = parseFloat(base) || 0;
    const s = parseFloat(supp) || 0;
    return (b + s).toLocaleString('es-ES') + ' €';
  };

  const APTS = [
    { id: 'vm', label: 'Hestía Mar',      val: suppMar, set: setSuppMar },
    { id: 'vt', label: 'Hestía Thalassa', val: suppTha, set: setSuppTha },
    { id: 'vs', label: 'Hestía Salinas',  val: suppSal, set: setSuppSal },
  ];

  return (
    <div className="ls-cfg-wrap">
      <button type="button" className="hc-bulk-toggle" onClick={() => setOpen(o => !o)}>
        <span>Estancia larga · tarifas mensuales y condiciones</span>
        <span className={`hc-bulk-chev${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="hc-bulk-body">

          {/* BLOQUE 1 — Tarifas base por temporada */}
          <div className="ls-cfg-section-title">Tarifas base mensuales (€/mes)</div>
          <div className="ls-cfg-rates-table">
            <div className="ls-cfg-rates-head">
              <span>Temporada</span>
              <span>Meses</span>
              <span>€ base / mes</span>
            </div>
            {[
              { key: 'baja',  label: 'T. baja',  months: 'Nov · Dic · Ene · Feb · Mar · Abr', val: rateBaja,  set: setRateBaja  },
              { key: 'media', label: 'T. media', months: 'Oct · May',                           val: rateMedia, set: setRateMedia },
              { key: 'alta',  label: 'T. alta',  months: 'Jun · Sep',                           val: rateAlta,  set: setRateAlta  },
            ].map(({ key, label, months, val, set }) => (
              <div key={key} className="ls-cfg-rates-row">
                <span className="ls-cfg-season-lbl">{label}</span>
                <span className="ls-cfg-season-months">{months}</span>
                <div className="hc-input-row" style={{ gap: 4 }}>
                  <input type="number" min="0" step="10" className="pe-input pe-input-num" style={{ width: 80 }}
                    value={val} onChange={e => set(e.target.value)}/>
                  <span className="pe-suffix">€/mes</span>
                </div>
              </div>
            ))}
            <div className="ls-cfg-rates-row ls-cfg-special-row">
              <span className="ls-cfg-season-lbl">Noches especiales</span>
              <span className="ls-cfg-season-months">Navidad (23 dic–6 ene) · Semana Santa</span>
              <div className="hc-input-row" style={{ gap: 4 }}>
                <input type="number" min="0" step="1" className="pe-input pe-input-num" style={{ width: 80 }}
                  value={flat} onChange={e => setFlat(e.target.value)}/>
                <span className="pe-suffix">€/noche</span>
              </div>
            </div>
          </div>

          {/* BLOQUE 2 — Precio efectivo por apartamento */}
          <div className="ls-cfg-section-title" style={{ marginTop: 20 }}>Precio efectivo por apartamento</div>
          <div className="ls-cfg-apt-table">
            <div className="ls-cfg-apt-head">
              <span>Apartamento</span>
              <span>Suplemento</span>
              <span>T. baja</span>
              <span>T. media</span>
              <span>T. alta</span>
            </div>
            {APTS.map(({ id, label, val, set }) => (
              <div key={id} className="ls-cfg-apt-row">
                <span className="ls-cfg-apt-name">{label}</span>
                <div className="hc-input-row" style={{ gap: 4 }}>
                  <span className="pe-suffix" style={{ marginRight: 2 }}>+</span>
                  <input type="number" min="0" step="10" className="pe-input pe-input-num" style={{ width: 70 }}
                    value={val} onChange={e => set(e.target.value)}/>
                  <span className="pe-suffix">€/mes</span>
                </div>
                <span className="ls-cfg-eff">{effPrice(rateBaja,  val)}</span>
                <span className="ls-cfg-eff">{effPrice(rateMedia, val)}</span>
                <span className="ls-cfg-eff ls-cfg-eff-alta">{effPrice(rateAlta,  val)}</span>
              </div>
            ))}
          </div>
          <p className="hc-preview" style={{ marginTop: 8 }}>
            Precio efectivo = tarifa base + suplemento · calculado pro-rata diario
          </p>

          {/* BLOQUE 3 — Suplementos por huésped/mascota y Semana Santa */}
          <div className="ls-cfg-section-title" style={{ marginTop: 20 }}>Suplementos y fechas especiales</div>
          <div className="hc-bulk-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div className="hc-bulk-field">
              <label className="hc-lbl">Huésped extra (€/mes)</label>
              <div className="hc-input-row">
                <input type="number" min="0" step="1" className="pe-input pe-input-num" style={{ width: 70 }}
                  value={extraGuest} onChange={e => setExtraGuest(e.target.value)}/>
                <span className="pe-suffix">€/mes</span>
                <span className="hc-preview">Base 2 huéspedes · cada huésped extra {extraGuest}€/mes</span>
              </div>
            </div>
            <div className="hc-bulk-field">
              <label className="hc-lbl">Mascota (€/mes)</label>
              <div className="hc-input-row">
                <input type="number" min="0" step="1" className="pe-input pe-input-num" style={{ width: 70 }}
                  value={petMonth} onChange={e => setPetMonth(e.target.value)}/>
                <span className="pe-suffix">€/mes</span>
                <span className="hc-preview">Se añade si el huésped trae mascota</span>
              </div>
            </div>
            <div className="hc-bulk-field" style={{ flex: 1, minWidth: 260 }}>
              <label className="hc-lbl">
                Fechas Semana Santa
                <span className="hc-opt"> (una por línea: YYYY-MM-DD YYYY-MM-DD)</span>
              </label>
              <textarea rows={3} className="pe-input hc-textarea"
                value={ranges} onChange={e => setRanges(e.target.value)}
                placeholder={'2026-03-26 2026-04-06\n2027-04-08 2027-04-19'}/>
            </div>
          </div>

          <div className="hc-bulk-foot">
            <span className="hc-bulk-preview">Los cambios se guardan en prices.json y afectan a todos los cálculos de estancia larga.</span>
            <button type="button" className="pe-btn pe-btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HuecosTab = ({ token, pricesData, onPricesUpdated }) => {
  const [avail,      setAvail     ] = React.useState(null);
  const [loadErr,    setLoadErr   ] = React.useState(null);
  const [loading,    setLoading   ] = React.useState(true);
  const [saving,     setSaving    ] = React.useState(false);
  const [saveMsg,    setSaveMsg   ] = React.useState(null);
  const [filterApt,  setFilterApt ] = React.useState('all');
  const [filterProb, setFilterProb] = React.useState(false);
  const [activeGap,  setActiveGap ] = React.useState(null);
  const [dType,      setDType     ] = React.useState('discount');
  const [dValue,     setDValue    ] = React.useState('');
  const [dMinN,      setDMinN     ] = React.useState('');
  const [dNote,      setDNote     ] = React.useState('');
  const [dLastMin,   setDLastMin  ] = React.useState(false);
  const [splitGapId, setSplitGapId] = React.useState(null);
  const [splitDate,  setSplitDate ] = React.useState('');
  const [splitSaving,setSplitSaving] = React.useState(false);
  const [bulkOpen,    setBulkOpen   ] = React.useState(false);
  const [bulkApt,     setBulkApt    ] = React.useState('all');
  const [bulkSeason,  setBulkSeason ] = React.useState('all');
  const [bulkMinN,    setBulkMinN   ] = React.useState('');
  const [bulkMaxN,    setBulkMaxN   ] = React.useState('');
  const [bulkMaxDays, setBulkMaxDays] = React.useState('');
  const [bulkOnlyNew, setBulkOnlyNew] = React.useState(true);
  const [bulkType,    setBulkType   ] = React.useState('discount');
  const [bulkValue,   setBulkValue  ] = React.useState('');
  const [bulkLastMin, setBulkLastMin] = React.useState(false);
  const [bulkSaving,  setBulkSaving ] = React.useState(false);
  const [hcView,      setHcView     ] = React.useState('cortos');
  const [lsCfgOpen,   setLsCfgOpen  ] = React.useState(false);

  const today     = new Date().toISOString().slice(0, 10);
  const horizonStr = pricesData && pricesData.bookingHorizon && pricesData.bookingHorizon.lastCheckinDate;
  const calendar   = (pricesData && pricesData.calendar)  || {};
  const seasons    = (pricesData && pricesData.seasons)   || {};
  const overrides  = (pricesData && pricesData.gapOverrides) || {};
  const gapSplits  = (pricesData && pricesData.gapSplits)    || {};
  const lsCfg      = (pricesData && pricesData.longStayConfig) || { specialNightFlat: 80, easterRanges: [] };

  const _fetchAvail = React.useCallback(() => {
    setLoading(true); setLoadErr(null);
    fetch(`${API}/repos/${REPO}/contents/docs/assets/availability.json?ref=${BRANCH}`,
      { headers: apiHeaders(token), cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        if (j.message) throw new Error(j.message);
        setAvail(JSON.parse(b64ToUtf8(j.content)));
      })
      .catch(e => setLoadErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => {
    _fetchAvail();
    const iv = setInterval(_fetchAvail, 4 * 60 * 60 * 1000);
    window.addEventListener('hestia:availability-updated', _fetchAvail);
    return () => {
      clearInterval(iv);
      window.removeEventListener('hestia:availability-updated', _fetchAvail);
    };
  }, [_fetchAvail]);

  const nightBase = (aptId, season) => {
    if (!pricesData || !pricesData.apts || !pricesData.seasons) return 0;
    const base = (pricesData.apts[aptId] || {}).base || 0;
    const mult = (seasons[season] || {}).multiplier || 1;
    return Math.round(base * mult);
  };

  const allGaps = React.useMemo(() => {
    if (!avail) return {};
    const result = {};
    for (const aptId of ['vm', 'vt', 'vs']) {
      const aptData = avail[aptId];
      if (!aptData) { result[aptId] = []; continue; }
      const raw = _hcCalcGaps(aptData.blocked || [], today, horizonStr);
      result[aptId] = raw.flatMap(g => {
        const gId    = `${aptId}|${g.start}`;
        const splits = (gapSplits[gId] || [])
          .filter(d => d > g.start && d < g.end)
          .sort();
        const points = [g.start, ...splits, g.end];
        return points.slice(0, -1).map((segStart, i) => {
          const segEnd   = points[i + 1];
          const nights   = _hcDiff(segStart, segEnd);
          const segId    = `${aptId}|${segStart}`;
          const season   = _hcDominantSeason(segStart, segEnd, calendar);
          const maxN     = HC_MAX[season] || 28;
          const override = overrides[segId] || null;
          const baseN    = nightBase(aptId, season);
          const effN     = _hcEffPrice(baseN, override);
          return {
            start: segStart, end: segEnd, nights,
            aptId, id: segId,
            parentId: gId,
            parentStart: g.start, parentEnd: g.end, parentNights: g.nights,
            splitDates: splits,
            isSegment: splits.length > 0,
            segIndex: i, segTotal: points.length - 1,
            season, maxN, overLim: nights > maxN,
            override, baseN, effN,
            daysUntil: Math.round((new Date(segStart + 'T12:00:00Z') - new Date(today + 'T12:00:00Z')) / 86400000),
          };
        });
      });
    }
    return result;
  }, [avail, pricesData]);

  const longStayGaps = React.useMemo(() => {
    const r = {};
    for (const id of ['vm','vt','vs']) r[id] = (allGaps[id]||[]).filter(_isLongStayGap);
    return r;
  }, [allGaps]);
  const longStayCount = ['vm','vt','vs'].reduce((n,id) => n + (longStayGaps[id]||[]).length, 0);

  const openGap = (gap) => {
    setActiveGap(gap.id);
    const ov = gap.override;
    setDType(ov ? ov.type : 'discount');
    setDValue(ov && ov.value != null ? String(ov.value) : '');
    setDMinN(ov && ov.minNights != null ? String(ov.minNights) : '');
    setDNote(ov && ov.note ? ov.note : '');
    setDLastMin(!!(ov && ov.lastMinute));
    setSaveMsg(null);
  };
  const closeGap = () => { setActiveGap(null); setSaveMsg(null); };

  const persistPrices = async (newData, gapId, action) => {
    setSaving(true); setSaveMsg(null);
    try {
      const rf  = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      const rfj = await rf.json();
      if (rfj.message) throw new Error(rfj.message);
      const res = await fetch(`${API}/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `chore(huecos): ${action} ${gapId} via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
          content: utf8ToB64(JSON.stringify(newData, null, 2)),
          sha: rfj.sha, branch: BRANCH,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Error');
      onPricesUpdated(newData, j.content.sha);
      setSaveMsg('Guardado ✓');
      setActiveGap(null);
    } catch (e) { setSaveMsg('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleSave = (gap) => {
    const val  = dValue !== '' && dType !== 'none' ? Number(dValue) : null;
    const minN = dMinN  !== '' ? Number(dMinN)  : null;
    const newOv = {
      apt: gap.aptId, start: gap.start, end: gap.end, nights: gap.nights, type: dType,
      ...(val  !== null && !isNaN(val)  ? { value: val }       : {}),
      ...(minN !== null && !isNaN(minN) ? { minNights: minN }  : {}),
      ...(dNote.trim()                  ? { note: dNote.trim() } : {}),
      ...(dLastMin                      ? { lastMinute: true }  : {}),
    };
    const newOvs = { ...(pricesData.gapOverrides || {}), [gap.id]: newOv };
    persistPrices({ ...pricesData, gapOverrides: newOvs }, gap.id, 'set');
  };

  const handleClear = (gap) => {
    const newOvs = { ...(pricesData.gapOverrides || {}) };
    delete newOvs[gap.id];
    const newData = { ...pricesData, gapOverrides: newOvs };
    persistPrices(newData, gap.id, 'clear');
  };

  const persistSplits = async (newData, parentId, action) => {
    setSplitSaving(true); setSaveMsg(null);
    try {
      const rf  = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      const rfj = await rf.json();
      if (rfj.message) throw new Error(rfj.message);
      const res = await fetch(`${API}/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `chore(huecos): ${action} split ${parentId} via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
          content: utf8ToB64(JSON.stringify(newData, null, 2)),
          sha: rfj.sha, branch: BRANCH,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Error');
      onPricesUpdated(newData, j.content.sha);
      setSplitGapId(null); setSplitDate('');
      setSaveMsg('Partición guardada ✓');
    } catch (e) { setSaveMsg('Error: ' + e.message); }
    finally { setSplitSaving(false); }
  };

  const handleAddSplit = (gap) => {
    if (!splitDate) return;
    const { parentId, parentStart, parentEnd } = gap;
    if (splitDate <= parentStart || splitDate >= parentEnd) return;
    const existing = (pricesData.gapSplits || {})[parentId] || [];
    if (existing.includes(splitDate)) return;
    const newSplits = [...existing, splitDate].sort();
    persistSplits({ ...pricesData, gapSplits: { ...(pricesData.gapSplits || {}), [parentId]: newSplits } }, parentId, 'add');
  };

  const handleRemoveSplit = (parentId, date) => {
    const existing = ((pricesData.gapSplits || {})[parentId] || []).filter(d => d !== date);
    const newGs = { ...(pricesData.gapSplits || {}) };
    if (existing.length === 0) delete newGs[parentId]; else newGs[parentId] = existing;
    persistSplits({ ...pricesData, gapSplits: newGs }, parentId, 'remove');
  };

  const handleRemoveAllSplits = (parentId) => {
    const newGs = { ...(pricesData.gapSplits || {}) };
    delete newGs[parentId];
    persistSplits({ ...pricesData, gapSplits: newGs }, parentId, 'remove-all');
  };

  const handleSaveLsCfg = (newCfg) => {
    persistPrices({ ...pricesData, longStayConfig: newCfg }, 'longStayConfig', 'ls-cfg');
  };

  const handleQuickUrgent = (gap) => {
    const newOv = { apt: gap.aptId, start: gap.start, end: gap.end, nights: gap.nights, type: 'discount', value: 20, lastMinute: true };
    persistPrices({ ...pricesData, gapOverrides: { ...(pricesData.gapOverrides || {}), [gap.id]: newOv } }, gap.id, 'quick-urgent');
  };

  const bulkMatches = React.useMemo(() => {
    const flat = ['vm','vt','vs'].flatMap(id => allGaps[id] || []);
    const validApts = bulkApt === 'all' ? ['vm','vt','vs'] : [bulkApt];
    return flat.filter(gap => {
      if (!validApts.includes(gap.aptId)) return false;
      if (bulkSeason !== 'all' && gap.season !== bulkSeason) return false;
      if (bulkMinN !== '' && gap.nights < Number(bulkMinN)) return false;
      if (bulkMaxN !== '' && gap.nights > Number(bulkMaxN)) return false;
      if (bulkMaxDays !== '' && gap.daysUntil > Number(bulkMaxDays)) return false;
      if (bulkOnlyNew && gap.override) return false;
      return true;
    });
  }, [allGaps, bulkApt, bulkSeason, bulkMinN, bulkMaxN, bulkMaxDays, bulkOnlyNew]);

  const persistBulk = async (newData, count) => {
    setBulkSaving(true); setSaveMsg(null);
    try {
      const rf  = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      const rfj = await rf.json();
      if (rfj.message) throw new Error(rfj.message);
      const res = await fetch(`${API}/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `chore(huecos): bulk ${count} gaps via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
          content: utf8ToB64(JSON.stringify(newData, null, 2)),
          sha: rfj.sha, branch: BRANCH,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Error');
      onPricesUpdated(newData, j.content.sha);
      setSaveMsg(`Aplicado a ${count} huecos ✓`);
      setBulkOpen(false);
    } catch (e) { setSaveMsg('Error: ' + e.message); }
    finally { setBulkSaving(false); }
  };

  const handleBulkApply = () => {
    if (!bulkMatches.length || !bulkValue) return;
    const newOvs = { ...(pricesData.gapOverrides || {}) };
    for (const gap of bulkMatches) {
      newOvs[gap.id] = {
        apt: gap.aptId, start: gap.start, end: gap.end, nights: gap.nights,
        type: bulkType, value: Number(bulkValue),
        ...(bulkLastMin ? { lastMinute: true } : {}),
      };
    }
    persistBulk({ ...pricesData, gapOverrides: newOvs }, bulkMatches.length);
  };

  const applyBulkPreset = (cfg) => {
    setBulkSeason(cfg.season); setBulkMinN(cfg.minN); setBulkMaxN(cfg.maxN);
    setBulkMaxDays(cfg.maxDays); setBulkType(cfg.type); setBulkValue(cfg.value);
    setBulkLastMin(cfg.lm); setBulkOnlyNew(cfg.onlyNew);
  };

  if (loading) return <div className="pe-card"><p className="pe-help">Cargando disponibilidad…</p></div>;
  if (loadErr)  return <div className="pe-card"><div className="pe-error">{loadErr}</div></div>;
  if (!avail)   return <div className="pe-card"><p className="pe-help">Sin datos de disponibilidad.</p></div>;

  const aptIds     = ['vm', 'vt', 'vs'].filter(id => filterApt === 'all' || filterApt === id);
  const totalGaps  = aptIds.reduce((n, id) => n + (allGaps[id] || []).filter(g => !_isLongStayGap(g)).length, 0);
  const totalProb  = aptIds.reduce((n, id) => n + (allGaps[id] || []).filter(g => !_isLongStayGap(g) && g.overLim).length, 0);
  const totalOvs   = aptIds.reduce((n, id) => n + (allGaps[id] || []).filter(g => !_isLongStayGap(g) && g.override).length, 0);

  return (
    <div className="pe-card hc-tab">

      {/* ── Cabecera ────────────────────────────────────── */}
      <div className="hc-header">
        <div className="hc-stats">
          <span className="hc-stat">{totalGaps} huecos</span>
          {totalProb > 0 && <span className="hc-stat hc-stat-warn">{totalProb} ⚠</span>}
          {totalOvs  > 0 && <span className="hc-stat hc-stat-ov">{totalOvs} con ajuste</span>}
        </div>
        <div className="hc-filters">
          <select className="pe-input hc-sel" value={filterApt} onChange={e => setFilterApt(e.target.value)}>
            <option value="all">Todos los apartamentos</option>
            <option value="vm">Hestía Mar</option>
            <option value="vt">Hestía Thalassa</option>
            <option value="vs">Hestía Salinas</option>
          </select>
          <label className="hc-check">
            <input type="checkbox" checked={filterProb} onChange={e => setFilterProb(e.target.checked)}/>
            Solo problemáticos
          </label>
        </div>
      </div>

      {saveMsg && <div className={`hc-global-msg${saveMsg.startsWith('Error') ? ' err' : ' ok'}`}>{saveMsg}</div>}

      {/* ── Sub-tabs ────────────────────────────────────── */}
      <div className="hc-subtab-bar">
        <button type="button" className={`hc-subtab-btn${hcView === 'cortos' ? ' active' : ''}`}
          onClick={() => setHcView('cortos')}>Huecos cortos</button>
        <button type="button" className={`hc-subtab-btn${hcView === 'largas' ? ' active' : ''}`}
          onClick={() => setHcView('largas')}>
          Estancias largas
          {longStayCount > 0 && <span className="hc-subtab-badge">{longStayCount}</span>}
        </button>
      </div>

      {hcView === 'cortos' && <>
      {/* ── Regla de negocio visible ────────────────────── */}
      <div className="hc-rules">
        <span><strong>Alta / Crítica:</strong> máx. 7 noches entre reservas</span>
        <span><strong>Media / Baja:</strong> máx. 28 noches entre reservas</span>
      </div>

      {/* ── Reglas globales (bulk) ──────────────────────── */}
      <div className="hc-bulk-wrap">
        <button type="button" className="hc-bulk-toggle" onClick={() => setBulkOpen(o => !o)}>
          <span>Reglas globales</span>
          <span className={`hc-bulk-chev${bulkOpen ? ' open' : ''}`}>▼</span>
        </button>
        {bulkOpen && (
          <div className="hc-bulk-body">

            {/* Presets */}
            <div className="hc-bulk-presets">
              {BULK_PRESETS.map(p => (
                <button key={p.label} type="button" className="hc-bulk-preset" onClick={() => applyBulkPreset(p.cfg)}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Filtros */}
            <div className="hc-bulk-fields">
              <div className="hc-bulk-row">
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Apartamento</label>
                  <select className="pe-input" value={bulkApt} onChange={e => setBulkApt(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="vm">Mar</option>
                    <option value="vt">Thalassa</option>
                    <option value="vs">Salinas</option>
                  </select>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Temporada</label>
                  <select className="pe-input" value={bulkSeason} onChange={e => setBulkSeason(e.target.value)}>
                    <option value="all">Todas</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Noches mín.</label>
                  <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 70 }} value={bulkMinN} onChange={e => setBulkMinN(e.target.value)} placeholder="—"/>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Noches máx.</label>
                  <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 70 }} value={bulkMaxN} onChange={e => setBulkMaxN(e.target.value)} placeholder="—"/>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Checkin ≤ Xd</label>
                  <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 70 }} value={bulkMaxDays} onChange={e => setBulkMaxDays(e.target.value)} placeholder="—"/>
                </div>
              </div>
              <div className="hc-bulk-row">
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Ajuste</label>
                  <select className="pe-input" value={bulkType} onChange={e => { setBulkType(e.target.value); setBulkValue(''); }}>
                    <option value="discount">Descuento %</option>
                    <option value="fixed">Precio fijo €/n</option>
                    <option value="increment">Incremento %</option>
                  </select>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Valor</label>
                  <div className="hc-input-row">
                    <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 80 }} value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="0"/>
                    <span className="pe-suffix">{bulkType === 'fixed' ? '€/n' : '%'}</span>
                  </div>
                </div>
                <div className="hc-bulk-field hc-bulk-field-check">
                  <label className="hc-check-lbl">
                    <input type="checkbox" checked={bulkLastMin} onChange={e => setBulkLastMin(e.target.checked)}/>
                    Marcar como last minute
                  </label>
                </div>
                <div className="hc-bulk-field hc-bulk-field-check">
                  <label className="hc-check-lbl">
                    <input type="checkbox" checked={bulkOnlyNew} onChange={e => setBulkOnlyNew(e.target.checked)}/>
                    Solo sin ajuste previo
                  </label>
                </div>
              </div>
            </div>

            {/* Preview + aplicar */}
            <div className="hc-bulk-foot">
              <span className="hc-bulk-preview">
                {bulkMatches.length > 0
                  ? <>{bulkMatches.length} hueco{bulkMatches.length !== 1 ? 's' : ''}: {bulkMatches.slice(0,6).map(g => `${HC_APT[g.aptId].name.replace('Hestía ','')} ${_hcFmt(g.start)}`).join(', ')}{bulkMatches.length > 6 ? '…' : ''}</>
                  : 'Ningún hueco coincide.'}
              </span>
              <button type="button" className="pe-btn pe-btn-primary"
                disabled={!bulkMatches.length || !bulkValue || bulkSaving}
                onClick={handleBulkApply}>
                {bulkSaving ? 'Aplicando…' : `Aplicar a ${bulkMatches.length} huecos`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Por apartamento ─────────────────────────────── */}
      {aptIds.map(aptId => {
        const meta = HC_APT[aptId];
        let   gaps = (allGaps[aptId] || []).filter(g => !_isLongStayGap(g));
        if (filterProb) gaps = gaps.filter(g => g.overLim);
        const allAptGaps = allGaps[aptId] || [];

        return (
          <div key={aptId} className="hc-apt">
            <div className="hc-apt-hd" style={{ '--hc-accent': meta.accent }}>
              <span className="hc-apt-name">{meta.name}</span>
              <span className="hc-apt-meta">
                {allAptGaps.length} huecos
                {allAptGaps.filter(g => g.overLim).length > 0 &&
                  <span className="hc-apt-warn"> · {allAptGaps.filter(g => g.overLim).length} ⚠</span>}
                {allAptGaps.filter(g => g.override).length > 0 &&
                  <span className="hc-apt-ov"> · {allAptGaps.filter(g => g.override).length} con ajuste</span>}
              </span>
            </div>

            {gaps.length === 0 ? (
              <p className="pe-help" style={{ margin: '12px 0 20px' }}>
                {filterProb ? 'No hay huecos problemáticos próximos.' : 'No hay huecos detectados próximos.'}
              </p>
            ) : (
              <div className="hc-list">
                {gaps.map(gap => {
                  const isActive = activeGap === gap.id;
                  const prevEff  = dType !== 'none' && dValue !== '' && !isNaN(Number(dValue))
                    ? _hcEffPrice(gap.baseN, { type: dType, value: Number(dValue) }) : null;

                  return (
                    <div key={gap.id}
                      className={`hc-row${gap.overLim ? ' hc-over' : ''}${gap.override ? ' hc-has-ov' : ''}${isActive ? ' hc-open' : ''}`}>

                      {/* Fila principal — siempre visible */}
                      <div className="hc-row-hd" onClick={() => isActive ? closeGap() : openGap(gap)}>
                        <span className="hc-dates">
                          {_hcFmt(gap.start)} → {_hcFmt(gap.end)}
                        </span>
                        <span className="hc-nights">{gap.nights}n</span>
                        <span className="hc-sea" style={{ color: HC_COL[gap.season] }}>
                          {HC_LBL[gap.season]}
                        </span>
                        <span className="hc-price">
                          {gap.effN !== gap.baseN
                            ? <><strong>{gap.effN}€</strong><s>{gap.baseN}€</s></>
                            : <>{gap.baseN}€</>}
                          <span className="hc-per">/n</span>
                        </span>
                        <span className="hc-badges">
                          {gap.isSegment && <span className="hc-badge hc-badge-seg">seg {gap.segIndex + 1}/{gap.segTotal}</span>}
                          {gap.overLim && <span className="hc-badge hc-badge-warn">⚠ &gt;{gap.maxN}n</span>}
                          {gap.override && <span className="hc-badge hc-badge-ov">{_hcOvLabel(gap.override)}</span>}
                          {gap.override && gap.override.minNights && <span className="hc-badge hc-badge-ov">min {gap.override.minNights}n</span>}
                          {gap.override && gap.override.lastMinute && <span className="hc-badge hc-badge-lm">last min.</span>}
                          {gap.override && gap.override.note && <span className="hc-badge hc-badge-note" title={gap.override.note}>nota</span>}
                          {gap.daysUntil >= 0 && gap.daysUntil <= 30 && <span className="hc-badge hc-badge-urgent">⏱ {gap.daysUntil}d</span>}
                        </span>
                        <span className="hc-toggle">{isActive ? '▲' : '▼'}</span>
                      </div>

                      {/* Botón rápido última hora */}
                      {gap.daysUntil >= 0 && gap.daysUntil <= 30 && !(gap.override && gap.override.lastMinute) && !isActive && (
                        <div className="hc-quick-row">
                          <button type="button" className="hc-quick-lm" disabled={saving}
                            onClick={() => handleQuickUrgent(gap)}>
                            ⚡ −20% oferta urgente
                          </button>
                          <span className="hc-quick-note">Aplica descuento del 20% y lo destaca en la home como última hora</span>
                        </div>
                      )}

                      {/* Panel de edición */}
                      {isActive && (
                        <div className="hc-edit" onClick={e => e.stopPropagation()}>

                          {gap.overLim && (
                            <div className="hc-overlimit-note">
                              Hueco de <strong>{gap.nights} noches</strong> en {HC_LBL[gap.season].toLowerCase()} supera el máximo de <strong>{gap.maxN} noches</strong>.
                              Considera reducir las noches mínimas o aplicar un descuento agresivo.
                            </div>
                          )}

                          {/* Tipo de ajuste */}
                          <div className="hc-field">
                            <label className="hc-lbl">Ajuste de precio</label>
                            <div className="hc-type-row">
                              {[
                                { v: 'discount',  l: 'Descuento %' },
                                { v: 'fixed',     l: 'Precio fijo €/n' },
                                { v: 'increment', l: 'Incremento %' },
                                { v: 'none',      l: 'Sin ajuste' },
                              ].map(({ v, l }) => (
                                <button key={v} type="button"
                                  className={`hc-type-btn${dType === v ? ' is-on' : ''}`}
                                  onClick={() => { setDType(v); setDValue(''); }}>
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Valor numérico */}
                          {dType !== 'none' && (
                            <div className="hc-field">
                              <label className="hc-lbl">
                                {dType === 'discount'  ? 'Descuento' :
                                 dType === 'increment' ? 'Incremento' : 'Precio fijo'}
                              </label>
                              <div className="hc-input-row">
                                <input type="number" min="1"
                                  max={dType === 'discount' ? 80 : undefined}
                                  className="pe-input pe-input-num"
                                  style={{ width: 90 }}
                                  value={dValue}
                                  onChange={e => setDValue(e.target.value)}
                                  placeholder={dType === 'fixed' ? `base ${gap.baseN}` : ''}/>
                                <span className="pe-suffix">{dType === 'fixed' ? '€/n' : '%'}</span>
                                {prevEff !== null && prevEff !== gap.baseN && (
                                  <span className="hc-preview">
                                    → <strong>{prevEff}€/n</strong>
                                    {dType !== 'fixed' && (
                                      <span className="hc-total-preview">
                                        · {prevEff * gap.nights}€ total ({gap.nights}n)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Noches mínimas */}
                          <div className="hc-field">
                            <label className="hc-lbl">
                              Noches mínimas para este hueco
                              <span className="hc-opt"> (vacío = regla global)</span>
                            </label>
                            <div className="hc-input-row">
                              <input type="number" min="1" max={gap.nights}
                                className="pe-input pe-input-num"
                                style={{ width: 70 }}
                                value={dMinN}
                                onChange={e => setDMinN(e.target.value)}
                                placeholder="global"/>
                              <span className="pe-suffix">noches</span>
                              {dMinN && Number(dMinN) < gap.nights && (
                                <span className="hc-preview">permite llenar el hueco exacto</span>
                              )}
                            </div>
                          </div>

                          {/* Last minute */}
                          <div className="hc-field">
                            <label className="hc-check-lbl">
                              <input type="checkbox" checked={dLastMin} onChange={e => setDLastMin(e.target.checked)}/>
                              Destacar como last minute en la homepage
                            </label>
                          </div>

                          {/* Nota interna */}
                          <div className="hc-field">
                            <label className="hc-lbl">
                              Nota interna
                              <span className="hc-opt"> (solo visible en p-edit)</span>
                            </label>
                            <textarea rows={2} className="pe-input hc-textarea"
                              value={dNote}
                              onChange={e => setDNote(e.target.value)}
                              placeholder="Ej: oferta último momento, confirmar con Alex…"/>
                          </div>

                          {/* Partir en segmentos */}
                          <div className="hc-field">
                            <label className="hc-lbl">
                              Partir en segmentos
                              <span className="hc-opt"> (cada tramo con oferta independiente)</span>
                            </label>
                            {gap.splitDates.length > 0 && (
                              <div className="hc-split-list">
                                {gap.splitDates.map(sp => (
                                  <span key={sp} className="hc-split-chip">
                                    {_hcFmt(sp)}
                                    <button type="button" className="hc-split-chip-rm"
                                      disabled={splitSaving}
                                      onClick={() => handleRemoveSplit(gap.parentId, sp)}>×</button>
                                  </span>
                                ))}
                                <button type="button" className="pe-btn pe-btn-ghost hc-split-rm-all"
                                  disabled={splitSaving}
                                  onClick={() => handleRemoveAllSplits(gap.parentId)}>
                                  Quitar todas
                                </button>
                              </div>
                            )}
                            {splitGapId === gap.parentId ? (
                              <div className="hc-split-add">
                                <input type="date" className="pe-input" style={{ width: 'auto' }}
                                  min={_hcAdd(gap.parentStart, 1)}
                                  max={_hcAdd(gap.parentEnd, -1)}
                                  value={splitDate}
                                  onChange={e => setSplitDate(e.target.value)}/>
                                <button type="button" className="pe-btn pe-btn-primary"
                                  disabled={!splitDate || splitSaving}
                                  onClick={() => handleAddSplit(gap)}>
                                  {splitSaving ? 'Guardando…' : 'Confirmar'}
                                </button>
                                <button type="button" className="pe-btn pe-btn-ghost"
                                  onClick={() => { setSplitGapId(null); setSplitDate(''); }}>
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button type="button" className="pe-btn pe-btn-ghost hc-split-btn"
                                onClick={() => { setSplitGapId(gap.parentId); setSplitDate(''); }}>
                                + Añadir punto de división
                              </button>
                            )}
                          </div>

                          {/* Pie */}
                          <div className="hc-foot">
                            {saveMsg && (
                              <span className={`hc-inline-msg${saveMsg.startsWith('Error') ? ' err' : ' ok'}`}>
                                {saveMsg}
                              </span>
                            )}
                            {gap.override && (
                              <button type="button" className="pe-btn pe-btn-ghost"
                                disabled={saving} onClick={() => handleClear(gap)}>
                                Limpiar ajuste
                              </button>
                            )}
                            <button type="button" className="pe-btn pe-btn-ghost"
                              onClick={closeGap}>Cancelar</button>
                            <button type="button" className="pe-btn pe-btn-primary"
                              disabled={saving} onClick={() => handleSave(gap)}>
                              {saving ? 'Guardando…' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      </>}

      {hcView === 'largas' && (
        <div className="ls-wrap">

          <div className="ls-info">
            <div>
              <strong>Estancias largas · más de 28 noches · septiembre – junio</strong><br/>
              <span className="ls-info-sub">Para teletrabajadores, negocios y personas que quieren vivir una temporada en Vera Playa. Sin julio ni agosto.</span>
            </div>
          </div>

          {/* ── Configuración de noches especiales ── */}
          <LsCfgPanel lsCfg={lsCfg} open={lsCfgOpen} setOpen={setLsCfgOpen} onSave={handleSaveLsCfg} saving={saving}/>

          <div className="ls-rates">
            <div className="ls-rates-title">Tarifas base (€ / mes completo) · noches especiales {lsCfg.specialNightFlat}€/n fijo</div>
            <div className="ls-rates-grid">
              {[
                { label: 'Nov – Abr', rate: 1450, note: 'T. baja' },
                { label: 'Oct · May', rate: 1590, note: '' },
                { label: 'Jun · Sep', rate: 1790, note: '' },
                { label: `Navidad / S. Santa ${lsCfg.specialNightFlat}€`, note: 'precio fijo por noche' },
              ].map(r => (
                <div key={r.label} className="ls-rate-row">
                  <span className="ls-rate-period">{r.label}</span>
                  {r.rate && <span className="ls-rate-val">{r.rate}<span className="ls-rate-per">€/mes</span></span>}
                  {r.note && <span className="ls-rate-note">{r.note}</span>}
                </div>
              ))}
            </div>
          </div>

          {['vm','vt','vs'].map(aptId => {
            const meta = HC_APT[aptId];
            const gaps = longStayGaps[aptId] || [];
            if (gaps.length === 0) return null;
            return (
              <div key={aptId} className="hc-apt">
                <div className="hc-apt-hd" style={{ '--hc-accent': meta.accent }}>
                  <span className="hc-apt-name">{meta.name}</span>
                  <span className="hc-apt-meta">{gaps.length} {gaps.length === 1 ? 'hueco disponible' : 'huecos disponibles'}</span>
                </div>
                <div className="hc-list">
                  {gaps.map(gap => {
                    const bd      = _lsBreakdown(gap.start, gap.end, lsCfg);
                    if (!bd) return null;
                    const hasSpec = bd.parts.some(p => p.specialNights > 0);
                    const months  = (gap.nights / 30).toFixed(1);
                    const bdLines = bd.parts.map(p =>
                      `  • ${p.label}: ${p.nights}n${p.specialNights ? ` (${p.specialNights}n ×${bd.multiplier})` : ''} → ${p.amount}€`
                    ).join('\n');
                    const waMsg = `Hola 👋\n\nTenemos disponible *${meta.name}* para una estancia larga:\n📅 ${_hcFmt(gap.start)} → ${_hcFmt(gap.end)} (${gap.nights} noches · ~${months} meses)\n\nDesglose:\n${bdLines}\n\n💰 *Total: ${bd.total}€*\n\nPerfecto para teletrabajo, negocio o vivir una temporada en Vera Playa 🌊\nSin comisiones · trato directo.`;
                    return (
                      <div key={gap.id} className="ls-gap">
                        <div className="ls-gap-head">
                          <span className="hc-dates">{_hcFmt(gap.start)} → {_hcFmt(gap.end)}</span>
                          <span className="hc-nights">{gap.nights}n</span>
                          <span className="ls-gap-months">~{months} meses</span>
                          {hasSpec && <span className="hc-badge hc-badge-warn">noches especiales</span>}
                        </div>

                        <div className="ls-breakdown">
                          {bd.parts.map(p => (
                            <div key={p.label} className="ls-bk-row">
                              <span className="ls-bk-period">{p.label}</span>
                              <span className="ls-bk-nights">{p.nights}n</span>
                              <span className="ls-bk-rate">
                                {p.monthlyRate}€/{p.dim}d
                                {p.specialNights > 0 && <span className="ls-bk-special"> · {p.specialNights}n×{bd.multiplier}</span>}
                              </span>
                              <span className="ls-bk-sub">= {p.amount}€</span>
                            </div>
                          ))}
                          <div className="ls-bk-total">
                            <span>Total estimado</span>
                            <span className="ls-bk-total-val">{bd.total}€</span>
                          </div>
                        </div>

                        <div className="ls-gap-actions" style={{ display:'flex', justifyContent:'flex-end', paddingTop: 4 }}>
                          <button type="button" className="pe-btn pe-btn-ghost ls-wa-btn"
                            onClick={() => navigator.clipboard.writeText(waMsg)
                              .then(() => { setSaveMsg('Propuesta copiada ✓'); setTimeout(() => setSaveMsg(null), 3000); })
                              .catch(() => setSaveMsg('Error al copiar'))}>
                            Copiar propuesta WhatsApp
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {longStayCount === 0 && (
            <p className="pe-help" style={{ margin: '16px 0' }}>
              No hay huecos de más de 28 noches en septiembre–junio actualmente.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
const AdminApp = () => {
  const [phase,    setPhase]    = React.useState('login');
  const [mode,     setMode]     = React.useState('reservas');
  const [contractPrefill, setContractPrefill] = React.useState(null);
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
  const [syncState, setSyncState] = React.useState('idle');
  const [syncMsg,   setSyncMsg]   = React.useState('');
  const [refreshKey, setRefreshKey] = React.useState(0);

  const reloadConfig = React.useCallback(async () => {
    if (!token) return;
    try {
      const fr = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      if (fr.ok) {
        const file = await fr.json();
        setData(JSON.parse(b64ToUtf8(file.content)));
        setSha(file.sha);
      }
    } catch (_) {}
    try {
      const fr2 = await fetch(`${API}/repos/${REPO}/contents/${REVIEWS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      if (fr2.ok) {
        const file2 = await fr2.json();
        setReviewsData(JSON.parse(b64ToUtf8(file2.content)));
        setReviewsSha(file2.sha);
      }
    } catch (_) {}
  }, [token]);

  const triggerSync = async () => {
    setSyncState('running'); setSyncMsg('');
    try {
      const res = await fetch(
        `${API}/repos/${REPO}/actions/workflows/sync-availability.yml/dispatches`,
        { method: 'POST',
          headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref: 'main' }) }
      );
      if (res.status === 204) {
        setSyncState('ok');
        setSyncMsg('Sync lanzado — actualizando datos…');
        // Reload all tab data immediately (fresh SHA) then again when workflow finishes (~65s)
        setRefreshKey(k => k + 1);
        reloadConfig();
        setTimeout(() => {
          setRefreshKey(k => k + 1);
          reloadConfig();
          setSyncMsg('Sync completado');
          setTimeout(() => setSyncState('idle'), 5000);
        }, 70000);
      } else {
        const body = await res.json().catch(() => ({}));
        setSyncState('error');
        setSyncMsg(res.status === 403
          ? 'Sin permiso: el PAT necesita scope "workflow"'
          : `Error ${res.status}: ${body.message || '?'}`);
        setTimeout(() => setSyncState('idle'), 12000);
      }
    } catch (e) {
      setSyncState('error'); setSyncMsg(e.message);
      setTimeout(() => setSyncState('idle'), 12000);
    }
  };


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

  const saveReviewsData = async (data) => {
    setPhase('saving'); setError(null); setSuccess(null);
    try {
      const merged = { ...data, version: (data.version || 1), updatedAt: new Date().toISOString() };
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

  const saveReviews = () => saveReviewsData(reviewsData);

  const quickApprove = async (id) => {
    if (!reviewsData) return;
    const next = JSON.parse(JSON.stringify(reviewsData));
    const idx = next.items.findIndex(r => r.id === id);
    if (idx < 0) return;
    next.items[idx].status = 'published';
    setReviewsData(next);
    await saveReviewsData(next);
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
        <div className="pe-card pe-login-card">
          <h1 className="pe-login-title">Hestía Admin</h1>
          <form onSubmit={login} className="pe-login-form">
            <input
              type="password"
              autoFocus
              autoComplete="off"
              spellCheck="false"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="github_pat_…"
              className="pe-input pe-mono pe-login-input"
              required
            />
            <button type="submit" className="pe-btn pe-btn-primary pe-login-btn">Entrar</button>
            {error && <div className="pe-error">{error}</div>}
          </form>
          <details className="pe-help">
            <summary>¿Cómo obtener el token?</summary>
            <ol>
              <li>GitHub → Settings → Developer settings → Fine-grained tokens.</li>
              <li>Repository: <code>{REPO}</code> · Permisos: <strong>Contents: write</strong>.</li>
              <li>Copia el token y pégalo arriba.</li>
            </ol>
          </details>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'saving') {
    return (
      <div className="pe-shell">
        <div className="pe-card pe-login-card pe-loading-card">
          <p className="pe-loading-msg">{phase === 'loading' ? '⏳ Autenticando…' : '⏳ Guardando…'}</p>
        </div>
      </div>
    );
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
              onRemove={() => removeReview(r.id)}
              onApprove={id => quickApprove(id)}/>
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
        <div className="pe-topbar-actions">
          <button
            type="button"
            className={`pe-btn pe-sync-btn${syncState === 'running' ? ' pe-sync-running' : syncState === 'ok' ? ' pe-sync-ok' : syncState === 'error' ? ' pe-sync-err' : ''}`}
            onClick={triggerSync}
            disabled={syncState === 'running'}
            title="Lanza el workflow sync-availability en GitHub Actions"
          >
            <span className="pe-sync-icon">{syncState === 'running' ? '⏳' : syncState === 'ok' ? '✓' : syncState === 'error' ? '✗' : '🔄'}</span>
            <span className="pe-sync-label">
              {syncState === 'running' ? 'Sincronizando…' : syncState === 'ok' ? 'Sincronizado' : syncState === 'error' ? 'Error' : 'Sincronizar'}
            </span>
          </button>
          {syncMsg && <span className="pe-sync-msg">{syncMsg}</span>}
          <button onClick={logout} className="pe-btn pe-btn-ghost">Cerrar sesión</button>
        </div>
      </div>

      <div className="pe-tabs">
        <button type="button"
          className={`pe-tab${mode === 'reservas' ? ' is-active' : ''}`}
          onClick={() => { setMode('reservas'); setError(null); setSuccess(null); }}>
          🗓️<span className="pe-tab-label"> Reservas</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'prereservas' ? ' is-active' : ''}`}
          onClick={() => { setMode('prereservas'); setError(null); setSuccess(null); }}>
          📋<span className="pe-tab-label"> Prereservas</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'bloqueos' ? ' is-active' : ''}`}
          onClick={() => { setMode('bloqueos'); setError(null); setSuccess(null); }}>
          🔒<span className="pe-tab-label"> Bloqueos</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'leila' ? ' is-active' : ''}`}
          onClick={() => { setMode('leila'); setError(null); setSuccess(null); }}>
          💳<span className="pe-tab-label"> Leila</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'contract' ? ' is-active' : ''}`}
          onClick={() => { setMode('contract'); setError(null); setSuccess(null); }}>
          📄<span className="pe-tab-label"> Contrato</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'facturas' ? ' is-active' : ''}`}
          onClick={() => { setMode('facturas'); setError(null); setSuccess(null); }}>
          🧾<span className="pe-tab-label"> Facturas</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'inteligencia' ? ' is-active' : ''}`}
          onClick={() => { setMode('inteligencia'); setError(null); setSuccess(null); }}>
          🧠<span className="pe-tab-label"> Inteligencia</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'pricing' ? ' is-active' : ''}`}
          onClick={() => { setMode('pricing'); setError(null); setSuccess(null); }}>
          💰<span className="pe-tab-label"> Pricing</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'huecos' ? ' is-active' : ''}`}
          onClick={() => { setMode('huecos'); setError(null); setSuccess(null); }}>
          📅<span className="pe-tab-label"> Huecos</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'reviews' ? ' is-active' : ''}`}
          onClick={() => { setMode('reviews'); setError(null); setSuccess(null); }}>
          ⭐<span className="pe-tab-label"> Reviews</span>
          {reviewsData && (() => {
            const pending = (reviewsData.items || []).filter(r => r.status === 'pending').length;
            return pending > 0 ? <span className="pe-tab-badge">{pending}</span> : null;
          })()}
        </button>
      </div>

      {success && <div className="pe-success">{success}</div>}
      {error   && <div className="pe-error">{error}</div>}

      {mode === 'huecos' ? <HuecosTab token={token} pricesData={data} onPricesUpdated={(d, s) => { setData(d); setSha(s); }} /> : mode === 'inteligencia' ? <IntelligenciaTab token={token} onNavigate={tab => { setMode(tab); setError(null); setSuccess(null); }} /> : mode === 'contract' ? <ContractTab pricesData={data} prefill={contractPrefill} /> : mode === 'prereservas' ? <PrereservasTab token={token} refreshKey={refreshKey} /> : mode === 'reservas' ? <ReservasTab token={token} refreshKey={refreshKey} onOpenContract={r => { setContractPrefill(r); setMode('contract'); }} /> : mode === 'bloqueos' ? <BloquesTab token={token} /> : mode === 'leila' ? <LeilaTab token={token} /> : mode === 'facturas' ? <FacturasTab token={token} /> : mode === 'reviews' ? renderReviewsTab() : (
      <>
      <div className="pe-card">
        <h2>Precios base por noche · 2 huéspedes · temporada baja</h2>
        <div className="pe-grid">
          {Object.entries(data.apts).map(([id, apt]) => (
            <div key={id} className="pe-field">
              <label>{apt.name}</label>
              <div className="pe-input-row">
                <NumInput
                  step="1" min="0"
                  value={apt.base}
                  onChange={v => update(`apts.${id}.base`, v)}
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
                <NumInput
                  step="0.05" min="1"
                  value={s.multiplier}
                  onChange={v => update(`seasons.${id}.multiplier`, v)}
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
            <NumInput step="1" min="0"
              value={data.rules.extraGuestPerNight}
              onChange={v => update('rules.extraGuestPerNight', v)}
              className="pe-input pe-input-num" />
          </div>
          <div className="pe-field">
            <label>Estancia mínima (noches)</label>
            <NumInput step="1" min="1"
              value={data.rules.minNights}
              onChange={v => update('rules.minNights', v)}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Mínimo por defecto fuera de temporada crítica.</small>
          </div>
          <div className="pe-field">
            <label>Ventana de estancia corta (días)</label>
            <NumInput step="1" min="0"
              value={data.rules.imminentDays}
              onChange={v => update('rules.imminentDays', v)}
              className="pe-input pe-input-num" />
            <small className="pe-hint">
              Si el check-in es dentro de este número de días, se permite el mínimo
              de estancia corta (típicamente 2 noches). Pon 0 para desactivar.
            </small>
          </div>
          <div className="pe-field">
            <label>Mínimo en estancia corta (noches)</label>
            <NumInput step="1" min="1" max="7"
              value={data.rules.twoNightFloor}
              onChange={v => update('rules.twoNightFloor', v)}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Cuántas noches admitir dentro de la ventana corta. Por defecto 2.</small>
          </div>
          <div className="pe-field">
            <label>Mínimo en temporada crítica (noches)</label>
            <NumInput step="1" min="1"
              value={data.rules.criticalSeasonMinNights}
              onChange={v => update('rules.criticalSeasonMinNights', v)}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Solo aplica en fechas marcadas como crítica.</small>
          </div>
          <div className="pe-field">
            <label>Descuento reserva directa (0–1)</label>
            <NumInput step="0.01" min="0" max="1"
              value={data.rules.directDiscount}
              onChange={v => update('rules.directDiscount', v)}
              className="pe-input pe-input-num" />
            <small className="pe-hint">Ej. 0.09 = −9 % vs Booking/Airbnb</small>
          </div>
          <div className="pe-field">
            <label>Suplemento mascota (€/estancia)</label>
            <NumInput step="1" min="0"
              value={data.rules.petFlatFee}
              onChange={v => update('rules.petFlatFee', v)}
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
                  <NumInput step="1" min="1" max="10"
                    value={g.from}
                    onChange={v => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], from: v };
                      update('rules.guestSupplements', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <NumInput step="1" min="1" max="10"
                    value={g.to}
                    onChange={v => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], to: v };
                      update('rules.guestSupplements', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <NumInput step="1" min="0"
                    value={g.perNight}
                    onChange={v => {
                      const arr = (data.rules.guestSupplements || []).slice();
                      arr[i] = { ...arr[i], perNight: v };
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
                  <NumInput step="1" min="0"
                    value={ex.price}
                    onChange={v => {
                      const arr = (data.rules.extras || []).slice();
                      arr[i] = { ...arr[i], price: v };
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
                  <NumInput step="1" min="1"
                    value={r.nights}
                    onChange={v => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr[i] = { ...arr[i], nights: v };
                      update('rules.shortStayPricing', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <NumInput step="1" min="1"
                    value={r.basedOnNights}
                    onChange={v => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr[i] = { ...arr[i], basedOnNights: v };
                      update('rules.shortStayPricing', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <NumInput step="1" min="0"
                    value={r.discount}
                    onChange={v => {
                      const arr = (data.rules.shortStayPricing || []).slice();
                      arr[i] = { ...arr[i], discount: v };
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
                  <NumInput step="1" min="1"
                    value={d.minNights}
                    onChange={v => {
                      const arr = data.rules.stayDiscounts.slice();
                      arr[i] = { ...arr[i], minNights: v };
                      update('rules.stayDiscounts', arr);
                    }}
                    className="pe-input pe-input-num" />
                </td>
                <td>
                  <NumInput step="0.01" min="0" max="1"
                    value={d.pct}
                    onChange={v => {
                      const arr = data.rules.stayDiscounts.slice();
                      arr[i] = { ...arr[i], pct: v };
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
