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
    direccion: 'Apto. 1A, del portal 14, edificio 3, en la urbanización Paraíso Playa, en C/ Islas Canarias, 7',
    plazaGaraje: '160',
    zonaObras: 'enfrente',
    bloqueAccesibilidad: true,
    bloqueSabanas: 'Un juego de sábanas para la cama de matrimonio y dos juegos de sábanas para las camas individuales.',
  },
  vt: {
    name: 'Hestía Vera Thalassa',
    shortName: 'Thalassa',
    direccion: 'Apto. 11, planta 5ª, escalera 13, en la urbanización Thalassa, en C/ Tomillo 2',
    plazaGaraje: '163',
    zonaObras: 'cercanas',
    bloqueAccesibilidad: false,
    bloqueSabanas: 'Un juego de sábanas para la cama doble (D1) y un juego para cada cama individual del dormitorio dos (D2).',
  },
  vs: {
    name: 'Hestía Vera Salinas',
    shortName: 'Salinas',
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
                  <div key={sid} className="pe-cal-season">
                    <div className="pe-cal-season-head">
                      <span className="pe-dot" style={{ background: s.color }} />
                      <strong>{s.label}</strong>
                      <span className="pe-hint">×{s.multiplier}</span>
                      <button
                        type="button"
                        className="pe-btn pe-btn-ghost pe-btn-sm"
                        onClick={() => addRange(year, 'seasons', sid)}
                      >+ Rango</button>
                    </div>
                    {ranges.length === 0 ? (
                      <div className="pe-cal-empty">Sin rangos</div>
                    ) : (
                      <table className="pe-table pe-table-cal">
                        <thead>
                          <tr>
                            <th>Desde</th>
                            <th>Hasta</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranges.map((r, i) => (
                            <tr key={i}>
                              <td>
                                <input type="date" value={r[0]}
                                  onChange={e => updateRange(year, 'seasons', sid, i, 'start', e.target.value)}
                                  className="pe-input pe-input-date" />
                              </td>
                              <td>
                                <input type="date" value={r[1]}
                                  onChange={e => updateRange(year, 'seasons', sid, i, 'end', e.target.value)}
                                  className="pe-input pe-input-date" />
                              </td>
                              <td>
                                <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
                                  onClick={() => removeRange(year, 'seasons', sid, i)}
                                  aria-label="Eliminar">×</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="pe-h3">Especiales</h3>
            {Object.entries(cal.specials || {}).map(([sid, sp]) => (
              <div key={sid} className="pe-cal-season">
                <div className="pe-cal-season-head">
                  <strong>{sp.label || sid}</strong>
                  <span className="pe-hint">temporada: {sp.season}</span>
                  <button
                    type="button"
                    className="pe-btn pe-btn-ghost pe-btn-sm"
                    onClick={() => addRange(year, 'specials', sid)}
                  >+ Rango</button>
                </div>
                <table className="pe-table pe-table-cal">
                  <thead><tr><th>Desde</th><th>Hasta</th><th></th></tr></thead>
                  <tbody>
                    {sp.ranges.map((r, i) => (
                      <tr key={i}>
                        <td><input type="date" value={r[0]}
                          onChange={e => updateRange(year, 'specials', sid, i, 'start', e.target.value)}
                          className="pe-input pe-input-date" /></td>
                        <td><input type="date" value={r[1]}
                          onChange={e => updateRange(year, 'specials', sid, i, 'end', e.target.value)}
                          className="pe-input pe-input-date" /></td>
                        <td><button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
                          onClick={() => removeRange(year, 'specials', sid, i)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <h3 className="pe-h3">Puentes nacionales (+1 grado de temporada)</h3>
            <button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
              onClick={() => addRange(year, 'bridges')}>+ Puente</button>
            <table className="pe-table pe-table-cal">
              <thead><tr><th>Nombre</th><th>Desde</th><th>Hasta</th><th></th></tr></thead>
              <tbody>
                {(cal.bridges || []).map((b, i) => (
                  <tr key={i}>
                    <td>
                      <input type="text" value={b.name}
                        onChange={e => updateBridgeName(year, i, e.target.value)}
                        className="pe-input" />
                    </td>
                    <td>
                      <input type="date" value={b.ranges[0][0]}
                        onChange={e => updateRange(year, 'bridges', null, i, 'start', e.target.value)}
                        className="pe-input pe-input-date" />
                    </td>
                    <td>
                      <input type="date" value={b.ranges[0][1]}
                        onChange={e => updateRange(year, 'bridges', null, i, 'end', e.target.value)}
                        className="pe-input pe-input-date" />
                    </td>
                    <td><button type="button" className="pe-btn pe-btn-ghost pe-btn-sm"
                      onClick={() => removeRange(year, 'bridges', null, i)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Contrato · ${a.shortName} · ${nombre}</title>
<style>
  @page { size: A4; margin: 18mm 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #222; font-size: 11pt; line-height: 1.55; max-width: 174mm; margin: 0 auto; padding: 6mm 0; }
  h1 { font-size: 16pt; text-align: center; letter-spacing: 0.04em; margin: 0 0 4mm; }
  .lugar { text-align: center; font-style: italic; margin: 0 0 8mm; }
  h2 { font-size: 12pt; margin: 6mm 0 2mm; letter-spacing: 0.06em; }
  h3 { font-size: 11pt; margin: 4mm 0 1mm; text-transform: uppercase; letter-spacing: 0.04em; color: #444; }
  p { margin: 1.5mm 0; text-align: justify; }
  ul, ol { margin: 1mm 0 2mm 6mm; padding: 0; }
  li { margin: 0.5mm 0; }
  table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 10pt; }
  th, td { text-align: left; padding: 1.5mm 2mm; border-bottom: 0.3pt solid #ccc; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  td .ed { color: #666; font-size: 9pt; }
  .firmas { margin-top: 10mm; display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
  .firma { padding-top: 18mm; border-top: 0.5pt solid #888; font-size: 10pt; }
  .firma strong { display: block; margin-bottom: 1mm; }
  @media print { body { padding: 0; } button { display: none; } }
  .print-bar { position: fixed; top: 10px; right: 10px; background: #fff; padding: 8px; border: 1px solid #ccc; border-radius: 4px; z-index: 100; }
  .print-bar button { font-size: 14px; padding: 6px 14px; cursor: pointer; }
</style></head>
<body>
<div class="print-bar"><button onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button></div>

<h1>CONTRATO DE ARRENDAMIENTO POR TEMPORADA</h1>
<p class="lugar">Madrid, ${fechaFirmaStr}</p>

<h2>REUNIDOS</h2>
<p>Por una parte, <strong>D. Alejandro Berruezo Márquez</strong> y <strong>D. Francisco Javier Moral Arévalo</strong>, mayores de edad, y con domicilio a efectos de notificaciones en Avenida de la Constitución 38, 1A, 28821 de Coslada, Madrid, con DNI. 02646392N y 75018031N, telf. 620316370 y 654138251, respectivamente, y correo electrónico: info@hestiayourhome.com y cuenta corriente: ES2114650100911726525059.</p>
<p><em>(De ahora en adelante, "Los Propietarios".)</em></p>
<p>De otra parte, <strong>D./Dña. ${nombre.toUpperCase()}</strong>, mayor de edad, con domicilio a efectos de notificaciones en: <strong>${domicilio || '____________'}</strong>, con Documento Nacional de Identidad: <strong>${dni || '____________'}</strong>, y con teléfono: <strong>${telefono || '____________'}</strong>.</p>
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
      // Da tiempo al render antes de imprimir
      setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 700);
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
// ReservasTab — pestaña de reservas.
// Lee data-private/reservas.json (zona privada del repo, no
// publicada en docs/) vía la API de GitHub con el PAT del usuario.
// Permite filtrar, ver resumen, editar inline una reserva, y
// guardar el JSON de vuelta.
// La sincronización en vivo con Google Sheets requiere setup
// adicional documentado en data-private/SETUP-SHEETS-SYNC.md.
// ============================================================
const RESERVAS_PATH = 'data-private/reservas.json';

const ReservasTab = ({ token }) => {
  const [data,      setData]      = React.useState(null);
  const [sha,       setSha]       = React.useState(null);
  const [loading,   setLoading]   = React.useState(false);
  const [error,     setError]     = React.useState(null);
  const [success,   setSuccess]   = React.useState(null);
  const [filterApt, setFilterApt] = React.useState('all');
  const [filterCanal, setFilterCanal] = React.useState('all');
  const [editIdx,   setEditIdx]   = React.useState(-1);

  // Carga inicial del JSON desde GitHub
  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/repos/${REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) })
      .then(r => r.json())
      .then(j => {
        if (j.message) throw new Error(j.message);
        setSha(j.sha);
        const json = JSON.parse(b64DecodeUtf8(j.content));
        setData(json);
      })
      .catch(e => setError('Error cargando reservas: ' + e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!data && !loading && !error) return null;
  if (loading && !data) return <div className="pe-card"><h2>🗓️ Reservas</h2><p>Cargando…</p></div>;

  const reservas = (data && data.reservas) || [];
  const APT_NAMES = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' };
  const APT_COLOR = { vm: '#3D1A35', vt: '#3AAABB', vs: '#8A4A24' };

  // Filtros
  const filtered = reservas.filter(r => {
    if (filterApt !== 'all' && r.apt !== filterApt) return true && false;
    if (filterCanal !== 'all' && (r.canal || '').toLowerCase().trim() !== filterCanal) return false;
    return true;
  }).filter(r => filterApt === 'all' || r.apt === filterApt);

  // Resumen
  const today = new Date().toISOString().slice(0,10);
  const ingresoTotal = reservas.reduce((s,r) => s + (r.ingreso_total || 0), 0);
  const ingresoFuturo = reservas.filter(r => r.salida && r.salida >= today)
    .reduce((s,r) => s + (r.ingreso_total || 0), 0);
  const byApt = ['vm','vt','vs'].map(apt => {
    const list = reservas.filter(r => r.apt === apt);
    return { apt, count: list.length, sum: list.reduce((s,r) => s + (r.ingreso_total || 0), 0) };
  });
  const byCanal = {};
  reservas.forEach(r => {
    const c = (r.canal || '—').trim() || '—';
    if (!byCanal[c]) byCanal[c] = { count: 0, sum: 0 };
    byCanal[c].count++;
    byCanal[c].sum += r.ingreso_total || 0;
  });

  // Próximos check-ins (siguientes 14 días)
  const in14 = (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0,10); })();
  const proximos = reservas
    .filter(r => r.entrada && r.entrada >= today && r.entrada <= in14)
    .sort((a,b) => a.entrada.localeCompare(b.entrada));

  const canales = Array.from(new Set(reservas.map(r => (r.canal || '').trim()).filter(Boolean)));

  const saveReservas = async (newReservas) => {
    setError(null); setSuccess(null);
    const newData = { ...data, reservas: newReservas, updatedAt: new Date().toISOString(), count: newReservas.length };
    try {
      const body = {
        message: `chore(reservas): update via /p-edit · ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
        content: b64EncodeUtf8(JSON.stringify(newData, null, 2)),
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
      setSuccess('Reservas guardadas en data-private/reservas.json ✓');
      setEditIdx(-1);
    } catch (e) {
      setError('Error guardando: ' + e.message);
    }
  };

  const updateRow = (idx, patch) => {
    const nr = [...reservas];
    nr[idx] = { ...nr[idx], ...patch };
    saveReservas(nr);
  };
  const deleteRow = (idx) => {
    if (!confirm(`¿Borrar reserva de ${reservas[idx].responsable}?`)) return;
    const nr = reservas.filter((_, i) => i !== idx);
    saveReservas(nr);
  };
  const addRow = () => {
    const nr = [{
      apt: 'vm', responsable: '', telefono: null, huespedes: 2, menores_12: null,
      cuna_trona: null, mascota: false, dni_enviado: false, noches: null,
      entrada: today, salida: today, cancelacion: 'Cancelable 14', canal: 'Directo',
      contactado: 'Alex', f_reserva: today, ingreso_total: 0, reserva: 0,
      pago_previo: 0, al_checkin: 0, comision: 0, renta: 0, fianza: false,
      gasto_limpieza: 0, pagos_leila: 0, bai: 0, observaciones: '',
      rentabilidad_pct: null, precio_neto_noche: null, precio_bruto_noche: null,
    }, ...reservas];
    saveReservas(nr);
    setEditIdx(0);
  };

  const fmtEur = n => (n == null) ? '—' : `${n.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €`;
  const fmtDate = d => d || '—';

  return (
    <>
      {error   && <div className="pe-error">{error}</div>}
      {success && <div className="pe-success">{success}</div>}

      <div className="pe-card">
        <h2>🗓️ Reservas <span className="rv-count">· {reservas.length} · actualizado {data.updatedAt ? data.updatedAt.slice(0,10) : '—'}</span></h2>
        <p className="pe-help">
          Datos sincronizados desde la hoja "Hestía - Reservas" de Google Drive. Snapshot en
          <code> data-private/reservas.json</code> (fuera de la web pública).
          Para sincronización en vivo con el Sheet, ver <code>data-private/SETUP-SHEETS-SYNC.md</code>.
        </p>

        {/* Resumen */}
        <div className="rv-stats">
          <div className="rv-stat"><span className="rv-stat-label">Ingreso total</span><span className="rv-stat-val">{fmtEur(ingresoTotal)}</span></div>
          <div className="rv-stat"><span className="rv-stat-label">Aún por llegar</span><span className="rv-stat-val">{fmtEur(ingresoFuturo)}</span></div>
          {byApt.map(b => (
            <div key={b.apt} className="rv-stat" style={{borderLeftColor: APT_COLOR[b.apt]}}>
              <span className="rv-stat-label">{APT_NAMES[b.apt]} · {b.count}</span>
              <span className="rv-stat-val">{fmtEur(b.sum)}</span>
            </div>
          ))}
        </div>

        <div className="rv-stats rv-stats-canal">
          {Object.entries(byCanal).map(([c, v]) => (
            <div key={c} className="rv-stat rv-stat-small">
              <span className="rv-stat-label">{c}</span>
              <span className="rv-stat-val">{v.count} · {fmtEur(v.sum)}</span>
            </div>
          ))}
        </div>

        {/* Próximos */}
        {proximos.length > 0 && (
          <div className="rv-proximos">
            <h3>Próximos check-ins (14 días)</h3>
            <ul>
              {proximos.map((r, i) => (
                <li key={i}>
                  <span className="rv-prox-date">{fmtDate(r.entrada)}</span>
                  <span className="rv-apt-chip" style={{background: APT_COLOR[r.apt]}}>{APT_NAMES[r.apt] || r.apt}</span>
                  <span className="rv-prox-name">{r.responsable}</span>
                  <span className="rv-prox-meta">{r.huespedes} pax · {r.noches} noches · {r.canal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filtros + acciones */}
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
              {canales.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
          </label>
          <button type="button" className="pe-btn pe-btn-primary" onClick={addRow}>+ Nueva reserva</button>
        </div>

        {/* Tabla */}
        <div className="rv-table-wrap">
          <table className="rv-table">
            <thead><tr>
              <th>Apt</th><th>Huésped</th><th>Entrada</th><th>Salida</th>
              <th className="num">Noches</th><th className="num">Pax</th>
              <th>Canal</th><th>Cancelación</th>
              <th className="num">Ingreso</th><th className="num">Comisión</th><th className="num">BAI</th>
              <th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map((r, idxOrig) => {
                const idx = reservas.indexOf(r);
                const isEdit = idx === editIdx;
                const past = r.salida && r.salida < today;
                const onUpd = (field) => e => updateRow(idx, { [field]: e.target.value });
                return isEdit ? (
                  <tr key={idx} className="rv-edit">
                    <td><select defaultValue={r.apt} onBlur={onUpd('apt')}>{Object.keys(APT_NAMES).map(k => <option key={k} value={k}>{APT_NAMES[k]}</option>)}</select></td>
                    <td><input defaultValue={r.responsable} onBlur={onUpd('responsable')} /></td>
                    <td><input type="date" defaultValue={r.entrada || ''} onBlur={onUpd('entrada')} /></td>
                    <td><input type="date" defaultValue={r.salida || ''} onBlur={onUpd('salida')} /></td>
                    <td className="num"><input type="number" defaultValue={r.noches || 0} onBlur={e => updateRow(idx, { noches: Number(e.target.value) })} /></td>
                    <td className="num"><input type="number" defaultValue={r.huespedes || 0} onBlur={e => updateRow(idx, { huespedes: Number(e.target.value) })} /></td>
                    <td><input defaultValue={r.canal || ''} onBlur={onUpd('canal')} /></td>
                    <td><input defaultValue={r.cancelacion || ''} onBlur={onUpd('cancelacion')} /></td>
                    <td className="num"><input type="number" step="0.01" defaultValue={r.ingreso_total || 0} onBlur={e => updateRow(idx, { ingreso_total: Number(e.target.value) })} /></td>
                    <td className="num"><input type="number" step="0.01" defaultValue={r.comision || 0} onBlur={e => updateRow(idx, { comision: Number(e.target.value) })} /></td>
                    <td className="num"><input type="number" step="0.01" defaultValue={r.bai || 0} onBlur={e => updateRow(idx, { bai: Number(e.target.value) })} /></td>
                    <td>{past ? '✓' : '◷'}</td>
                    <td><button type="button" className="pe-btn pe-btn-ghost" onClick={() => setEditIdx(-1)}>OK</button> <button type="button" className="pe-btn pe-btn-ghost" onClick={() => deleteRow(idx)}>🗑</button></td>
                  </tr>
                ) : (
                  <tr key={idx} className={past ? 'rv-past' : ''}>
                    <td><span className="rv-apt-chip" style={{background: APT_COLOR[r.apt]}}>{APT_NAMES[r.apt] || r.apt}</span></td>
                    <td>{r.responsable}{r.mascota ? ' 🐾' : ''}{r.cuna_trona ? ' 👶' : ''}</td>
                    <td>{fmtDate(r.entrada)}</td>
                    <td>{fmtDate(r.salida)}</td>
                    <td className="num">{r.noches || '—'}</td>
                    <td className="num">{r.huespedes || '—'}</td>
                    <td>{r.canal || '—'}</td>
                    <td className="rv-tiny">{r.cancelacion || '—'}</td>
                    <td className="num">{fmtEur(r.ingreso_total)}</td>
                    <td className="num">{fmtEur(r.comision)}</td>
                    <td className="num">{fmtEur(r.bai)}</td>
                    <td>{past ? '✓' : (r.entrada && r.entrada <= today ? '🏠' : '◷')}</td>
                    <td><button type="button" className="pe-btn pe-btn-ghost" onClick={() => setEditIdx(idx)}>✏️</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
      </div>

      {success && <div className="pe-success">{success}</div>}
      {error   && <div className="pe-error">{error}</div>}

      {mode === 'analytics' ? <AnalyticsTab /> : mode === 'contract' ? <ContractTab pricesData={data} /> : mode === 'reservas' ? <ReservasTab token={token} /> : mode === 'reviews' ? renderReviewsTab() : (
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
