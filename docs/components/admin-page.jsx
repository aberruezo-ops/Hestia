// ============================================================
// HESTÍA · ADMIN, /p-edit.html
// Editor de docs/data/prices.json + docs/data/reviews.json.
// Login con GitHub PAT (permiso contents:write sobre el repo).
// El token vive solo en memoria, nunca en el repo ni localStorage.
// Tabs: [ Pricing ] [ Reviews ]
// ============================================================

const REPO         = 'aberruezo-ops/hestia';
const PRIVATE_REPO = 'aberruezo-ops/hestia-data';
const PATH         = 'docs/data/prices.json';
const REVIEWS_PATH = 'docs/data/reviews.json';
const BRANCH = 'main';
const API    = 'https://api.github.com';

// Datos de los titulares para el contrato (nombre completo, DNI, domicilio
// particular, IBAN). Van en el repo PRIVADO: este fichero se compila a
// docs/components/admin-page.js, que GitHub Pages sirve a cualquiera, así que
// nada de esto puede estar escrito aquí. Se cargan con el PAT al abrir la
// pestaña de contratos, igual que las reservas.
const TITULARES_PATH = 'titulares.json';

// Se rellena en cargaTitulares(). Mientras esté vacío, el contrato imprime un
// marcador visible en lugar del dato: es preferible un hueco evidente a un
// contrato con datos inventados.
let TITULARES = null;

const _titFalta = (es, en) => `<span class="blank" style="color:#B8246E">[${es} / ${en}]</span>`;
const tit = (campo, es, en) => (TITULARES && TITULARES[campo]) || _titFalta(es, en);

async function cargaTitulares(token) {
  if (TITULARES || !token) return TITULARES;
  try {
    const r = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${TITULARES_PATH}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${token}` }, cache: 'no-store',
    });
    if (!r.ok) return null;
    const raw = await r.json();
    TITULARES = JSON.parse(decodeURIComponent(escape(atob(raw.content.replace(/\n/g, '')))));
    return TITULARES;
  } catch {
    return null;
  }
}

// Cloudflare Web Analytics, Worker proxy + identificadores (no secretos)
const CF_WORKER_URL = 'https://little-night-9399.hestia-vera-almeria.workers.dev/';
const CF_ACCOUNT    = 'ccb910d549f39e3bad5d89e33315d57e';
const CF_SITE_TAG   = '770c05669c6b45ea8f1026576fe7dcce';
// GUIDE_ACCESS_WORKER_URL se declara en shared.js (cargado antes); aquí se usa
// esa misma global para leer el registro de accesos a la guía.

// URL del Worker de Cloudflare que escribe en Google Sheets.
// Despliega workers/sheets-sync/ y pega la URL aquí.
const SHEETS_WORKER_URL = 'https://hestia-sheets-sync.SUSTITUIR.workers.dev';

// URL del Worker de pago (workers/pago/). Sustituir tras wrangler deploy.
const PAGO_WORKER_URL = 'https://hestia-pago.SUSTITUIR.workers.dev';
const PAGO_PAGE_URL   = 'https://www.hestiayourhome.com/pago.html';

// URL del Worker que publica en Facebook/Instagram (workers/social-publish/).
// Sustituir tras wrangler deploy.
const SOCIAL_PUBLISH_WORKER_URL = 'https://hestia-social-publish.SUSTITUIR.workers.dev';
const SOCIAL_DRAFTS_PATH = 'docs/data/social-drafts.json';
const TRAVELER_WORKER_URL = 'https://hestia-traveler-registry.hestia-vera-almeria.workers.dev';
const SITE_BASE = 'https://www.hestiayourhome.com';

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
// CONTRATO, datos por apartamento (variantes de la plantilla
// unificada en docs/contracts/template-base.md).
// ============================================================
const APT_CONTRACT_DATA = {
  vm: {
    name: 'Hestía Vera Mar',
    shortName: 'Mar',
    heroPhoto: 'assets/apt-vs.jpg',
    direccion: 'Apto. 1A, del portal 14, edificio 3, en la urbanización Paraíso Playa, en C/ Islas Canarias, 7',
    plazaGaraje: '160',
    acceso: 'La vivienda se encuentra en una <strong>primera planta, con ascensor</strong>.',
    acceso_en: 'The dwelling is located on the <strong>first floor, with a lift</strong>.',
    zonaObras: 'enfrente',
    zonaObras_en: 'in front',
    bloqueAccesibilidad: true,
    bloqueSabanas: 'Un juego de sábanas para la cama de matrimonio y dos juegos de sábanas para las camas individuales. Para más de cuatro huéspedes se incluye además un juego de sábanas para el sofá-cama.',
    bloqueSabanas_en: 'One set of sheets for the double bed and two sets of sheets for the single beds. For more than four guests, a set of sheets for the sofa-bed is also included.',
  },
  vt: {
    name: 'Hestía Vera Thalassa',
    shortName: 'Thalassa',
    heroPhoto: 'assets/apt-vt-4.jpg',
    direccion: 'Apto. 11, planta 5ª, escalera 13, en la urbanización Thalassa, en C/ Tomillo 2',
    plazaGaraje: '163',
    acceso: 'La vivienda se encuentra en una <strong>quinta planta (tercera desde el garaje)</strong>: hasta la segunda planta se puede subir en <strong>ascensor</strong>, pero las <strong>tres plantas restantes no disponen de ascensor</strong> y se suben por escalera. Además, existen tramos de escaleras adicionales para acceder a diferentes lugares de la urbanización, como la piscina, el parque, las pistas de tenis, etc.',
    acceso_en: 'The dwelling is on the <strong>fifth floor (third from the garage)</strong>: a <strong>lift</strong> reaches up to the second floor, but the <strong>remaining three floors have no lift</strong> and are reached by stairs. There are also additional flights of stairs to reach different areas of the complex, such as the pool, the park, the tennis courts, etc.',
    zonaObras: 'cercanas',
    zonaObras_en: 'nearby',
    bloqueAccesibilidad: false,
    bloqueSabanas: 'Un juego de sábanas para la cama doble (D1) y un juego para cada cama individual del dormitorio dos (D2). Para más de cuatro huéspedes se incluye además un juego de sábanas para el sofá-cama.',
    bloqueSabanas_en: 'One set of sheets for the double bed (D1) and one set for each single bed in the second bedroom (D2). For more than four guests, a set of sheets for the sofa-bed is also included.',
  },
  vs: {
    name: 'Hestía Vera Salinas',
    shortName: 'Salinas',
    heroPhoto: 'assets/apt-vm.jpg',
    heroFocusY: 0.8,
    direccion: 'Apto. 7, planta 1ª, bloque 22, en la urbanización Pueblo Salinas, en C/ Alcazaba 115',
    plazaGaraje: '290',
    acceso: 'La vivienda se encuentra en una <strong>primera planta, sin ascensor</strong>.',
    acceso_en: 'The dwelling is located on the <strong>first floor, without a lift</strong>.',
    zonaObras: 'cercanas',
    zonaObras_en: 'nearby',
    bloqueAccesibilidad: false,
    bloqueSabanas: 'Dos juegos de sábanas para la cama de matrimonio y sofá-cama y un juego de sábanas por cada cama individual del dormitorio dos.',
    bloqueSabanas_en: 'Two sets of sheets for the double bed and sofa-bed and one set of sheets for each single bed in the second bedroom.',
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

// Conversión de número entero a letras en inglés (mayúsculas). 0–999999.
function numToEnglish(n) {
  n = Math.trunc(n);
  if (n === 0) return 'ZERO';
  if (n < 0) return 'MINUS ' + numToEnglish(-n);
  const ones = ['','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN'];
  const tens = ['','','TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
  function under1000(x) {
    let r = '';
    const h = Math.floor(x / 100);
    if (h > 0) r += ones[h] + ' HUNDRED';
    x %= 100;
    if (x > 0) {
      if (r) r += ' ';
      if (x < 20) r += ones[x];
      else { r += tens[Math.floor(x / 10)]; if (x % 10) r += '-' + ones[x % 10]; }
    }
    return r;
  }
  let r = '';
  if (n >= 1000) {
    r += under1000(Math.floor(n / 1000)) + ' THOUSAND';
    n %= 1000;
    if (n > 0) r += ' ';
  }
  if (n > 0 || r === '') r += under1000(n);
  return r.trim();
}

// Formateo de fecha "DD de MES de AAAA" en español.
function fmtFechaEs(date) {
  const meses = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  const d = (typeof date === 'string') ? new Date(date + 'T12:00:00') : date;
  return `${String(d.getDate()).padStart(2,'0')} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}
// Formateo de fecha "MES DD, AAAA" en inglés.
function fmtFechaEn(date) {
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const d = (typeof date === 'string') ? new Date(date + 'T12:00:00') : date;
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
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
// Suma días a una fecha ISO (YYYY-MM-DD) usando aritmética local (sin saltos de zona horaria).
function addDaysIso(iso, days) {
  if (!iso) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  const r = new Date(y, m - 1, d + days);
  return `${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,'0')}-${String(r.getDate()).padStart(2,'0')}`;
}

// Reparte las noches de una estancia [entrada, salida) por mes natural (clave
// 'YYYY-MM'). Cada noche cuenta en el mes de la fecha en que se pernocta, es
// decir desde la entrada hasta la salida-1. Sirve para prorratear el importe de
// una reserva que abarca varios meses entre cada mes en lugar de imputarlo todo
// al mes de entrada.
function nightsByMonth(entrada, salida) {
  const out = {};
  if (!entrada || !salida) return out;
  const [y1, m1, d1] = entrada.split('-').map(Number);
  const [y2, m2, d2] = salida.split('-').map(Number);
  let cur = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);
  let guard = 0;
  while (cur < end && guard++ < 4000) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
    out[key] = (out[key] || 0) + 1;
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

// base64 ↔ utf-8 (atob/btoa no manejan UTF-8 directamente)
const utf8ToB64 = (s) => btoa(unescape(encodeURIComponent(s)));
const b64ToUtf8 = (s) => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));

// NumInput, resuelve el problema clásico de React con inputs numéricos
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
// validateYearCoverage: para un año dado, comprueba que cada
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
// CalendarEditor, UI estructurada para editar el calendario.
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
        <div className="pe-error">JSON inválido, {calErr}. Edita el bloque avanzado abajo para arreglarlo.</div>
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
                    <strong>{valid.gaps.length} hueco(s) sin temporada, añade un rango que los cubra:</strong>
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
                    <strong>{valid.overlaps.length} solapamiento(s), un día solo puede pertenecer a una temporada o especial:</strong>
                    <ul>
                      {valid.overlaps.map((o, i) => (
                        <li key={i}>
                          {o.start === o.end ? o.start : `${o.start} → ${o.end}`}
                          <span className="pe-validate-sources">
                            {' '}– {o.sources.map(s => sourceLabel(s, cal, seasons)).join(' + ')}
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
            {!calOk && <div className="pe-error">JSON inválido, {calErr}</div>}
          </>
        )}
      </div>
    </>
  );
};

// ============================================================
// REVIEWS, modelo + componentes de la pestaña Reviews
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
  const dateLbl = review.date ? review.date.slice(0, 7) : '–';
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
        <span className="pe-rev-name-cell">{review.name || '–'}</span>
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
      name: parsed.name || '–',
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
      <h3 className="pe-h3"><HiIcon name="clipboard" size={18} className="pe-h-ic" /> Pegar desde email</h3>
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
            <dt>Nombre</dt>      <dd>{parsed.name || <em>– no detectado</em>}</dd>
            {parsed.email && (<><dt>Email</dt><dd className="pe-mono">{parsed.email}</dd></>)}
            <dt>Fecha</dt>       <dd className="pe-mono">{fmtDate(parsed.date)}</dd>
            <dt>Idioma</dt>      <dd>{parsed.lang.toUpperCase()}</dd>
            <dt>Texto</dt>       <dd className="pe-paste-text">{parsed.text || <em>– no detectado</em>}</dd>
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
// DashboardTab, resumen histórico + live 2026
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

// Agrega estadísticas (ingresos, noches, canales…) de un array de reservas.
// No es específico de ningún año: el llamante le pasa solo las reservas de
// UN año y guarda el resultado bajo esa clave (ver fetchBiz).
function computeYearStats(reservas) {
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
            React.createElement('line', { x1: 0, x2: inner.w, y1: y, y2: y, stroke: 'rgba(61,26,53,0.08)', strokeWidth: 1 }),
            React.createElement('text', { x: -6, y: y + 4, textAnchor: 'end', fontSize: 9, fill: 'rgba(61,26,53,0.55)' },
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
              fill: 'rgba(212,168,74,0.85)',
              stroke: isPartial ? 'rgba(168,128,44,0.6)' : 'none',
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
            React.createElement('text', { x: x1 + bw / 2, y: scaleY(d.ingresos) - 3, textAnchor: 'middle', fontSize: 8, fill: '#9A7016' },
              dashFmtMoney(d.ingresos)),
            React.createElement('text', { x: x2 + bw / 2, y: scaleY(d.bai) - 3, textAnchor: 'middle', fontSize: 8, fill: '#127E8C' },
              dashFmtMoney(d.bai)),
            React.createElement('text', { x: cx, y: inner.h + 14, textAnchor: 'middle', fontSize: 10, fill: 'rgba(61,26,53,0.7)' }, yr),
            isPartial && React.createElement('text', { x: cx, y: inner.h + 24, textAnchor: 'middle', fontSize: 8, fill: 'rgba(61,26,53,0.4)' }, '*')
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
            React.createElement('line', { x1: 0, x2: inner.w, y1: y, y2: y, stroke: 'rgba(61,26,53,0.08)', strokeWidth: 1 }),
            React.createElement('text', { x: -6, y: y + 4, textAnchor: 'end', fontSize: 8, fill: 'rgba(61,26,53,0.55)' },
              format(minV + range * f))
          );
        }),
        React.createElement('polyline', { points: pts, fill: 'none', stroke: color, strokeWidth: 2 }),
        vals.map((v, i) => React.createElement('g', { key: years[i] },
          React.createElement('circle', { cx: toX(i), cy: toY(v), r: 3, fill: color }),
          React.createElement('title', null, `${years[i]}: ${format(v)}`),
          React.createElement('text', { x: toX(i), y: toY(v) - 7, textAnchor: 'middle', fontSize: 8, fill: 'rgba(61,26,53,0.8)' },
            format(v)),
          React.createElement('text', { x: toX(i), y: inner.h + 14, textAnchor: 'middle', fontSize: 9, fill: 'rgba(61,26,53,0.6)' }, years[i])
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
              React.createElement('text', { x: cx, y: inner.h + 14, textAnchor: 'middle', fontSize: 10, fill: 'rgba(61,26,53,0.7)' }, yr)
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
              fill: 'rgba(27,200,216,0.6)', rx: 2,
            },
              React.createElement('title', null, `${yr} Noches: ${d.noches}`)
            ),
            React.createElement('text', { x: cx, y: inner.h + 14, textAnchor: 'middle', fontSize: 10, fill: 'rgba(61,26,53,0.7)' }, yr)
          );
        })
      )
    )
  );
}

// ============================================================
// IntelligenciaTab, panel unificado: tráfico + negocio + acciones
// ============================================================
const IntelligenciaTab = ({ token, onNavigate }) => {
  const currentYear = String(new Date().getFullYear());
  const [days,      setDays]      = React.useState(30);
  const [cfData,    setCfData]    = React.useState(null);
  const [yearData,  setYearData]  = React.useState(null);
  const [focusYear, setFocusYear] = React.useState(currentYear);
  const [avail,     setAvail]     = React.useState(null);
  const [loading,   setLoading]   = React.useState(true);
  const [cfError,   setCfError]   = React.useState(null);
  const [bizError,  setBizError]  = React.useState(null);
  const [open,     setOpen]     = React.useState({ trafico: false, negocio: true, accesos: true, eventos: false });
  const [reservasRaw, setReservasRaw] = React.useState([]);
  const [accesses, setAccesses] = React.useState(null);
  const [accSecret, setAccSecret] = React.useState(() => { try { return sessionStorage.getItem('hestia-acc-secret') || ''; } catch (_) { return ''; } });
  const [accLoading, setAccLoading] = React.useState(false);
  const [accError, setAccError] = React.useState(null);

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
      const combined = { ...hist.years };
      if (liveRes && liveRes.ok) {
        const raw  = await liveRes.json();
        const json = JSON.parse(atob(raw.content.replace(/\n/g, '')));
        const reservasLive = json.reservas || [];
        setReservasRaw(reservasLive);
        // Agrupa las reservas EN VIVO por año real (entrada, con salida de
        // respaldo) antes de agregarlas: antes todo el array se metía sin
        // filtrar bajo la clave fija '2026', así que una reserva de 2027 (o
        // de cualquier otro año) inflaba las cifras de 2026 en vez de tener
        // las suyas propias.
        const byYear = {};
        reservasLive.forEach(r => {
          const y = (r.entrada || r.salida || '').slice(0, 4);
          if (!y) return;
          (byYear[y] = byYear[y] || []).push(r);
        });
        Object.entries(byYear).forEach(([y, rs]) => { combined[y] = computeYearStats(rs); });
      }
      setYearData(combined);
      if (availRes.ok) setAvail(await availRes.json());
    } catch (e) {
      setBizError(e.message);
    }
  }, [token]);

  const fetchAccesses = React.useCallback(async (secret) => {
    const key = (secret != null ? secret : accSecret).trim();
    if (!key) { setAccError('Introduce la clave de lectura.'); return; }
    setAccLoading(true); setAccError(null);
    try {
      const res = await fetch(`${GUIDE_ACCESS_WORKER_URL}/log?key=${encodeURIComponent(key)}`);
      if (res.status === 401) throw new Error('Clave incorrecta.');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setAccesses(Array.isArray(j.accesses) ? j.accesses : []);
      try { sessionStorage.setItem('hestia-acc-secret', key); } catch (_) {}
    } catch (e) {
      setAccError(e.message); setAccesses(null);
    } finally { setAccLoading(false); }
  }, [accSecret]);

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
        out.push({ sev: 'media', cat: 'Conversión', title: `Conversión al ${Math.round(rate * 100)}%, hay recorrido`, desc: `${sent} reservas de ${searches} búsquedas. Un CTA más directo o un price anchoring más claro podría mejorar el ratio.` });
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

    // Oportunidades por ocupación: cruza los huecos libres de los próximos
    // 90 días con los tramos de estancia (7+ = −3%, 15+ = −15%, 29+ = mensual)
    // para decir qué duración llena cada hueco. No cambia precios: recomienda
    // qué activar y difundir. Los huecos de 6–10 noches quedan por encima del
    // rango que el bot de ofertas ya recalcula solo (2–5), así que no solapa.
    if (avail) {
      const names = { vm: 'Mar', vt: 'Thalassa', vs: 'Salinas' };
      const t90 = new Date(); t90.setDate(t90.getDate() + 90);
      const iso = (d) => d.toISOString().slice(0, 10);
      const isSummer = (ds) => { const m = Number(ds.slice(5, 7)); return m === 7 || m === 8; };
      const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
      const longRuns = [];
      const weekRuns = [];
      for (const id of ['vm', 'vt', 'vs']) {
        const ranges = avail[id]?.blocked || [];
        const blocked = (ds) => ranges.some(b => ds >= b.start && ds < b.end);
        let runStart = null;
        const flush = (endIso) => {
          if (!runStart) return;
          const n = nightsBetween(runStart, endIso);
          if (n >= 15 && !isSummer(runStart)) longRuns.push({ id, start: runStart, n });
          else if (n >= 6 && n <= 10) weekRuns.push({ id, start: runStart, n });
          runStart = null;
        };
        for (let d = new Date(); d < t90; d.setDate(d.getDate() + 1)) {
          const ds = iso(d);
          if (!blocked(ds)) { if (!runStart) runStart = ds; }
          else flush(ds);
        }
        flush(iso(t90));
      }
      const bestLong = longRuns.sort((a, b) => b.n - a.n)[0];
      if (bestLong) {
        out.push({
          sev: bestLong.n >= 29 ? 'alta' : 'media',
          cat: 'Estancias',
          title: `${names[bestLong.id]}: ${bestLong.n} noches libres seguidas desde ${bestLong.start}`,
          desc: `Hueco largo en temporada baja. Difunde la estancia de 15+ noches (−15%)${bestLong.n >= 29 ? ' o el formato mensual/teletrabajo' : ''}: llena temporada muerta sin tocar la tarifa por noche. Es tu diferenciador.`,
          tab: 'huecos',
        });
      }
      if (weekRuns.length) {
        const top = weekRuns.sort((a, b) => b.n - a.n)[0];
        out.push({
          sev: 'baja',
          cat: 'Estancias',
          title: `${weekRuns.length} hueco(s) de una semana en 90 días (p. ej. ${names[top.id]} ${top.n}n desde ${top.start})`,
          desc: 'Una estancia de 7+ noches (−3%) cierra estos huecos. Empújala en redes y WhatsApp para esos rangos, en vez de dejarlos en noches sueltas que no se llenan.',
          tab: 'huecos',
        });
      }
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

    if (yearData?.[focusYear]) {
      const d      = yearData[focusYear];
      const cans   = d.canales || {};
      const total  = Object.values(cans).reduce((a, b) => a + b, 0) || 1;
      const ota    = (cans['Booking'] || 0) + (cans['Airbnb'] || 0);
      const direct = cans['Directo'] || 0;
      if (total >= 3 && ota / total > 0.65) {
        out.push({ sev: 'alta', cat: 'Canales', title: `${Math.round(ota / total * 100)}% reservas OTA en ${focusYear}`, desc: 'Alta dependencia de Booking/Airbnb. Activa newsletter, redes y WhatsApp directo para reducir comisiones.', tab: 'pricing' });
      } else if (total >= 3 && direct / total > 0.45) {
        out.push({ sev: 'baja', cat: 'Canales', title: `${Math.round(direct / total * 100)}% reservas directas, buen ratio`, desc: 'Mantén los canales directos activos y sigue priorizando WhatsApp y la reserva sin intermediarios.' });
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
  }, [cfData, yearData, altaFreeInfo, fc, avail, focusYear]);

  const toggle   = (key) => setOpen(o => ({ ...o, [key]: !o[key] }));
  const totalPV  = cfData ? (cfData.pages     || []).reduce((s, r) => s + r.count, 0) : null;
  const totalCtr = cfData ? (cfData.countries || []).reduce((s, r) => s + r.count, 0) : 0;
  const totalDev = cfData ? (cfData.devices   || []).reduce((s, r) => s + r.count, 0) : 0;
  const topCtry  = cfData ? ((cfData.countries || [])[0]?.dimensions?.countryName || '–') : null;
  const funnConv = (() => { const s = fc['search_initiated'] || 0; const r = fc['booking_sent'] || 0; return s ? Math.round(r / s * 100) + '%' : null; })();
  const years    = yearData ? Object.keys(yearData).sort() : [];
  // Si el año en curso no tiene datos todavía (arranque, o antes de que
  // cargue fetchBiz), cae al último año disponible en vez de mostrar vacío.
  const statsYear = yearData?.[focusYear] ? focusYear : (years[years.length - 1] || focusYear);
  const statsSel  = yearData?.[statsYear];

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
    const f = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getFullYear()).slice(2)}`;
    return `${f} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
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
          {years.length > 0 && (
            <div className="pe-period-tabs" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(61,26,53,0.6)', alignSelf: 'center', marginRight: 4 }}>Cifras del negocio · año</span>
              {years.map(y => (
                <button key={y} type="button"
                  className={`pe-period-tab${y === statsYear ? ' is-active' : ''}`}
                  onClick={() => setFocusYear(y)}>{y}
                </button>
              ))}
            </div>
          )}
          <div className="intel-kpis">
            <div className="intel-kpi">
              <div className="intel-kpi-val" style={{ color: '#127E8C' }}>{totalPV != null ? totalPV.toLocaleString('es-ES') : '–'}</div>
              <div className="intel-kpi-lbl">Páginas vistas · {days}d</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val">{topCtry ?? '–'}</div>
              <div className="intel-kpi-lbl">País principal</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val" style={{ color: funnConv && parseInt(funnConv) < 5 ? '#E74C3C' : '#9A7016' }}>{funnConv ?? '–'}</div>
              <div className="intel-kpi-lbl">Conversión búsqueda→reserva</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val" style={{ color: '#9A7016' }}>{statsSel ? dashFmtMoney(statsSel.ingresos) : '–'}</div>
              <div className="intel-kpi-lbl">Ingresos {statsYear}</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val">{statsSel ? statsSel.reservas : '–'}</div>
              <div className="intel-kpi-lbl">Reservas {statsYear}</div>
            </div>
            <div className="intel-kpi">
              <div className="intel-kpi-val">{statsSel ? dashFmtMoney(statsSel.precio_noche) : '–'}</div>
              <div className="intel-kpi-lbl">Precio/noche medio {statsYear}</div>
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
                            <BarRow key={i} label={r.dimensions.countryName || '–'} count={r.count} total={totalCtr} bold={i === 0} />
                          ))}
                        </div>
                        <div className="pe-cf-col">
                          <div className="pe-cf-col-title">Dispositivos</div>
                          {(cfData.devices || []).map((r, i) => (
                            <BarRow key={i} label={r.dimensions.deviceType || '–'} count={r.count} total={totalDev} bold={i === 0} />
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
                          <LineChart years={years} getData={y => yearData[y].precio_noche || 0} color="#B8862E" label="Precio medio por noche" format={dashFmtMoney} />
                        </div>
                        <div className="dash-chart-box" style={{ flex: 1 }}>
                          <h4 className="dash-chart-title">Rentabilidad %</h4>
                          <LineChart years={years} getData={y => yearData[y].rent_pct || 0} color="#127E8C" label="Rentabilidad por año" format={dashFmtPct} />
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
                      <div className="dash-section">
                        <h3 className="dash-section-title">Histórico por año</h3>
                        <div className="rv-yearly-wrap">
                          <table className="rv-yearly-table">
                            <thead><tr>
                              <th>Año</th>
                              <th className="num">Reservas</th>
                              <th className="num">Noches</th>
                              <th className="num">Bruto</th>
                              <th className="num">Neto (BAI)</th>
                              <th className="num">Rentabilidad</th>
                              <th className="num">€/noche medio</th>
                            </tr></thead>
                            <tbody>
                              {years.map(y => {
                                const d = yearData[y] || {};
                                return (
                                  <tr key={y} className={`rv-yearly-row${d.partial ? ' rv-yearly-row-agg' : ''}`}>
                                    <td><strong>{y}</strong>{d.partial && <span className="rv-agg-badge">parcial</span>}</td>
                                    <td className="num">{d.reservas || 0}</td>
                                    <td className="num">{d.noches || 0}</td>
                                    <td className="num">{fmtEur(d.ingresos)}</td>
                                    <td className="num"><strong>{fmtEur(d.bai)}</strong></td>
                                    <td className="num"><strong>{d.rent_pct ? `${d.rent_pct.toFixed(1)} %` : '–'}</strong></td>
                                    <td className="num">{d.precio_noche ? fmtEur(d.precio_noche) : '–'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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
            <button type="button" className="intel-section-toggle" onClick={() => toggle('accesos')}>
              <span>Accesos a la guía · por reserva</span>
              <span className="intel-section-chevron">{open.accesos ? '▲' : '▼'}</span>
            </button>
            {open.accesos && (
              <div className="intel-section-content">
                {!accesses ? (
                  <div className="acc-gate">
                    <p className="pe-hint" style={{ marginTop: 0 }}>
                      Registra cada vez que un huésped abre la guía con su PIN. Introduce la clave de lectura del worker (la que pusiste con <code>wrangler secret put READ_SECRET</code>).
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input type="password" className="pe-input" placeholder="Clave de lectura" value={accSecret}
                        onChange={e => setAccSecret(e.target.value)} style={{ maxWidth: 240 }}
                        onKeyDown={e => { if (e.key === 'Enter') fetchAccesses(); }} />
                      <button type="button" className="pe-btn pe-btn-primary" disabled={accLoading} onClick={() => fetchAccesses()}>
                        {accLoading ? 'Cargando…' : 'Cargar accesos'}
                      </button>
                    </div>
                    {accError && <p className="pe-error" style={{ marginTop: 8 }}>{accError}</p>}
                  </div>
                ) : (() => {
                  const fmtAcc = (ts) => {
                    const d = new Date(ts);
                    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
                  };
                  const rows = accesses.map(a => {
                    const r = reservasRaw.find(x => (x.apt || '').toLowerCase() === a.apt && x.entrada === a.ref);
                    const ts = (a.ts || []).slice().sort((x, y) => y - x);
                    return {
                      apt: a.apt, ref: a.ref,
                      guest: r ? (r.responsable || '(sin nombre)') : '(reserva no encontrada)',
                      salida: r ? r.salida : null,
                      canal: r ? r.canal : null,
                      // Este panel muestra el histórico de accesos, cruzado con el
                      // estado ACTUAL de la reserva: si aparece cancelada aquí, el
                      // acceso puede ser anterior a la cancelación (normal) o el PIN
                      // puede seguir activo por un fallo de sincronización (revisar).
                      cancelada: r ? _reservaCxl(r) : false,
                      n: ts.length, last: ts[0] || 0, ts,
                    };
                  }).filter(r => r.n > 0).sort((a, b) => b.last - a.last);
                  const totalAcc = rows.reduce((s, r) => s + r.n, 0);
                  const canceladasConAcceso = rows.filter(r => r.cancelada).length;
                  if (rows.length === 0) return <p className="pe-hint">Aún no hay accesos registrados.</p>;
                  return (
                    <>
                      <div className="acc-kpis">
                        <span><strong>{rows.length}</strong> reserva{rows.length !== 1 ? 's' : ''} han abierto la guía</span>
                        <span><strong>{totalAcc}</strong> acceso{totalAcc !== 1 ? 's' : ''} en total</span>
                        {canceladasConAcceso > 0 && (
                          <span className="acc-cancelada-kpi" title="Reservas canceladas cuyo PIN registró algún acceso. Si el acceso es posterior a la cancelación, revisa si el PIN sigue activo (Sincronizar PINs).">
                            ⚠ <strong>{canceladasConAcceso}</strong> cancelada{canceladasConAcceso !== 1 ? 's' : ''} con acceso
                          </span>
                        )}
                        <button type="button" className="pe-btn pe-btn-ghost" disabled={accLoading} onClick={() => fetchAccesses()} title="Recargar">↺</button>
                      </div>
                      <div className="rv-table-wrap">
                        <table className="rv-table acc-table">
                          <thead><tr>
                            <th>Apt</th><th>Huésped</th><th>Entrada</th><th>Salida</th>
                            <th className="num">Accesos</th><th>Último acceso</th><th>Historial</th>
                          </tr></thead>
                          <tbody>
                            {rows.map((r, i) => (
                              <tr key={i} data-apt={r.apt} className={r.cancelada ? 'acc-row-alert' : ''} style={{ '--apt-c': APT_COLOR[r.apt] || 'transparent' }}>
                                <td><span className="rv-apt-chip" style={{ background: APT_COLOR[r.apt], color: APT_TEXT[r.apt] }}>{APT_NAMES[r.apt] || r.apt}</span></td>
                                <td>{r.guest}{r.cancelada && <span className="acc-cancelada-badge" title="Esta reserva está cancelada ahora mismo. Si el PIN sigue activo, revísalo.">✗ cancelada</span>}</td>
                                <td>{fmtDate(r.ref)}</td>
                                <td>{r.salida ? fmtDate(r.salida) : '–'}</td>
                                <td className="num"><strong>{r.n}</strong></td>
                                <td>{fmtAcc(r.last)}</td>
                                <td className="acc-history">{r.ts.slice(0, 8).map(t => fmtAcc(t)).join(' · ')}{r.ts.length > 8 ? ` +${r.ts.length - 8}` : ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="pe-hint" style={{ marginTop: 8 }}>El nombre se obtiene cruzando con tus reservas en local; el registro solo guarda apartamento, fecha de entrada y hora. El PIN maestro no se registra.</p>
                    </>
                  );
                })()}
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
                              {Object.entries(ev).filter(([k]) => k !== 'ts' && k !== 'name').map(([k, v]) => `${k}: ${v}`).join(' · ') || '–'}
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
// ContractTab, generador de contratos de arrendamiento.
// Plantilla base: docs/contracts/template-base.md.
// Flujo: rellenas el formulario → "Generar contrato y abrir correo"
// abre dos cosas a la vez:
//   1) Una ventana con el contrato listo para imprimir → guardar PDF.
//   2) mailto: con el correo del huésped, asunto y cuerpo
//      prerrellenados (el usuario adjunta el PDF descargado).
// ============================================================
const ContractTab = ({ pricesData, prefill, token }) => {
  // Los datos de los titulares viven en el repo privado, no en este bundle.
  // Se piden en cuanto hay token para que estén listos al generar el contrato.
  const [titListos, setTitListos] = React.useState(!!TITULARES);
  React.useEffect(() => {
    let vivo = true;
    cargaTitulares(token).then(t => { if (vivo && t) setTitListos(true); });
    return () => { vivo = false; };
  }, [token]);

  // Estado del formulario, usa prefill si llega desde Reservas
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
  const [lang, setLang]               = React.useState('es');   // idioma del contrato: 'es' | 'en'
  const [reservaSaveMsg, setReservaSaveMsg] = React.useState(null);

  // Persiste los datos del huésped editados aquí de vuelta en la reserva
  // (reservas.json). Sin esto, lo que se rellena en el contrato no quedaba
  // guardado en la reserva. Solo aplica si el contrato se abrió desde una reserva.
  const canSaveToReserva = !!(prefill && token);
  const saveToReserva = async () => {
    if (!canSaveToReserva) return;
    setReservaSaveMsg({ kind: 'info', text: 'Guardando en la reserva…' });
    try {
      const ref = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      if (!ref.ok) throw new Error('No pude leer reservas.json');
      const j = await ref.json();
      const fileData = JSON.parse(b64ToUtf8(j.content));
      const list = fileData.reservas || [];
      const idx = prefill.id
        ? list.findIndex(x => x.id === prefill.id)
        : list.findIndex(x => x.entrada === prefill.entrada && x.apt === prefill.apt && (x.responsable || '') === (prefill.responsable || ''));
      if (idx < 0) throw new Error('No encontré la reserva en el archivo');
      list[idx] = {
        ...list[idx],
        responsable: nombre, dni, direccion: domicilio, telefono, email,
        huespedes: Number(huespedes) || list[idx].huespedes,
        mascota, fianza,
      };
      const newData = { ...fileData, reservas: list, updatedAt: new Date().toISOString(), count: list.length };
      const put = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${RESERVAS_PATH}`, {
        method: 'PUT', headers: apiHeaders(token),
        body: JSON.stringify({ message: `chore(reservas): datos de contrato · ${nombre}`, content: utf8ToB64(JSON.stringify(newData, null, 2)), sha: j.sha, branch: BRANCH }),
      });
      if (!put.ok) { const pj = await put.json(); throw new Error(pj.message || 'Error al guardar'); }
      setReservaSaveMsg({ kind: 'ok', text: 'Datos guardados en la reserva ✓' });
    } catch (e) {
      setReservaSaveMsg({ kind: 'err', text: 'No se pudo guardar en la reserva: ' + e.message });
    }
  };

  const aptInfo = APT_CONTRACT_DATA[apt];
  const noches = diffNoches(fechaEntrada, fechaSalida);
  const remanente = Math.max(0, Number(precioTotal||0) - Number(prereserva||0) - Number(pagoPrevio||0));

  // Lista de extras (tabla cláusula novena), leídos de prices.json.
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
  const cropHero = (rawUrl, focusY = 0.5) => {
    if (!rawUrl) return Promise.resolve(null);
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // W/H = 1050/325 = 210/65 exactly, same ratio as jsPDF target.
        // Reducido desde 2100×650: en iOS/Safari html2canvas no lograba
        // rasterizar el data-URL del hero cuando era muy grande y la portada
        // salía en blanco. 1050px de ancho sobre 210mm ≈ 127 dpi, nítido de
        // sobra para un cabecero, y la mitad de píxeles que iOS sí dibuja.
        const W = 1050, H = 325;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d');
        const srcAR = img.naturalWidth / img.naturalHeight;
        const tgtAR = W / H; // 3.818:1
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (Math.abs(srcAR - tgtAR) / tgtAR < 0.02) {
          // already at target ratio (e.g. pre-built collage), just resize
        } else if (srcAR > tgtAR) {
          // landscape wider: crop sides equally
          sh = img.naturalHeight; sw = sh * tgtAR;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          // narrower than target ratio: use full width y recorte vertical
          // CENTRADO, encuadra bien el cabecero + los cojines de la cama de frente.
          sw = img.naturalWidth;
          sh = sw / tgtAR;
          sx = 0;
          sy = Math.max(0, (img.naturalHeight - sh) * focusY);
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
    const isEn = lang === 'en';
    const num  = isEn ? numToEnglish : numToSpanish;
    const fechaFirmaStr  = (isEn ? fmtFechaEn : fmtFechaEs)(fechaFirma);
    const fechaEntradaStr = fmtFechaCorta(fechaEntrada);
    const fechaSalidaStr  = fmtFechaCorta(fechaSalida);
    const prereservaN = Number(prereserva || 0);
    const pagoPrevioN = Number(pagoPrevio || 0);
    const remanenteN  = Number(remanente  || 0);
    const precioL  = num(precioTotal);
    const preL     = num(prereserva);
    const prevL    = num(pagoPrevio);
    const remL     = num(remanente);
    const huespL   = num(huespedes);
    const cancelL  = num(diasCancelacion);
    const nochesL  = num(noches);
    const IBAN     = 'ES21 1465 0100 9117 2652 5059';
    const mascotaTexto = mascota ? (isEn ? ' and a pet' : ' y mascota') : '';
    const lineaFianza = fianza
      ? (isEn
          ? '<li>If the security-deposit transfer described in clause 2.7 has not been made.</li>'
          : '<li>Si no se ha realizado la transferencia por la fianza que se explica en el punto 2.7.</li>')
      : '';
    const clausulaFianza = fianza
      ? (isEn
          ? `<p><strong>2.7</strong> Two days before arrival at Hestía, the Tenant shall pay a security deposit of THREE HUNDRED (300) EUROS. This deposit will be refunded at the end of the stay, once the dwelling has been inspected, deducting any damage caused, if any.</p>`
          : `<p><strong>2.7</strong> Dos días antes de la llegada a Hestía, la Parte Arrendataria ingresará la fianza de TRESCIENTOS (300) EUROS. Esta fianza se devolverá a la finalización de la estancia, una vez revisada la vivienda, descontando los desperfectos ocasionados, si los hubiere.</p>`)
      : '';
    const clausulaMascotas = isEn
      ? (mascota
          ? 'The introduction of any domestic or wild animal into the dwelling is prohibited, except for the family\'s declared pet.'
          : 'The introduction of any domestic or wild animal into the dwelling is prohibited.')
      : (mascota
          ? 'Queda prohibida la introducción de cualquier tipo de animal doméstico o salvaje dentro de la vivienda, salvo la mascota declarada de la familia.'
          : 'Queda prohibida la introducción de cualquier tipo de animal doméstico o salvaje dentro de la vivienda.');
    const bloqueAccesibilidad = a.bloqueAccesibilidad
      ? (isEn
          ? `\n      <p>Hestía allows access to the dwelling from the garage with almost no steps (no more than two), but not from the main entrance, where there are approximately 6 steps. Inside Hestía, access to the terrace has a raised window frame, and the shower and bathtub are not adapted for people with reduced mobility, so assistance would be required.</p>`
          : `\n      <p>Hestía permite acceder a la vivienda desde el garaje sin apenas escalones (no más de dos), pero no desde el portal desde donde existen unos 6 escalones aproximadamente. Dentro de Hestía, el acceso a la terraza tiene el marco de la ventana y la ducha y la bañera no están preparadas para personas con movilidad reducida, por lo que requerirían ayuda.</p>`)
      : '';
    const _extraUnit = u => isEn
      ? (u === 'noche' ? 'per night' : u === 'estancia' ? 'per stay' : u === 'hora' ? 'per hour' : 'per ' + u)
      : (u === 'noche' ? 'por noche' : u === 'estancia' ? 'por estancia' : u === 'hora' ? 'por hora' : 'por ' + u);
    const tablaExtras = extras.map(e => {
      const labelClean = (e.label_es || '').split(' · ')[0];
      const detail = (e.label_es || '').split(' · ').slice(1).join(' · ');
      return `<tr>
        <td>${labelClean}${detail ? ` <span class="ed">· ${detail}</span>` : ''}</td>
        <td class="num">${e.price} €</td>
        <td>${_extraUnit(e.unit)}</td>
      </tr>`;
    }).join('');
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
    const baseDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
      ? window.location.pathname.replace(/[^\/]+$/, '')
      : '/';
    const heroUrl = heroDataUrl || '';
    const safeName = s => String(s).replace(/\s+/g, '_').replace(/[^\wÀ-ɏ]/g, '');
    const pdfFilename = `${fechaEntrada}_Hestia_Vera_${a.shortName.replace(/\s+/g,'_')}_${isEn ? 'contract' : 'contrato'}_${safeName(nombre)}_${noches}_${isEn ? 'nights' : 'noches'}.pdf`;
    const docTitle    = `${isEn ? 'Contract' : 'Contrato'} · Hestía Vera ${a.shortName} · ${escHtml(nombre)}`;
    const heroEyebrow = isEn ? 'seasonal tenancy agreement' : 'contrato de arrendamiento por temporada';
    const stayMeta    = `${fechaEntradaStr} – ${fechaSalidaStr}  ·  ${noches} ${isEn ? 'nights' : 'noches'} · ${huespedes} ${isEn ? 'guests' : 'huéspedes'}`;

    const _blank = (val, cls, labEs, labEn) => val
      ? `<strong>${escHtml(val)}</strong>`
      : `<span class="blank-line ${cls}" aria-label="${isEn ? labEn : labEs}"></span>`;

    // ── Cláusula Segunda · tabla de los tres momentos de pago (fuente única) ──
    const _filaSenal = prereservaN > 0
      ? (isEn
          ? `<tr><td><strong>1. Deposit</strong></td><td class="num">${prereserva} €</td><td>On signing this contract</td><td>Bank transfer to ${IBAN} or Bizum to +34 620 316 370</td></tr>`
          : `<tr><td><strong>1. Señal</strong></td><td class="num">${prereserva} €</td><td>A la firma de este contrato</td><td>Transferencia a ${IBAN} o Bizum a +34 620 316 370</td></tr>`)
      : '';
    const _filaPrevio = pagoPrevioN > 0
      ? (isEn
          ? `<tr><td><strong>2. Advance payment</strong></td><td class="num">${pagoPrevio} €</td><td>Before arrival</td><td>Bank transfer or Bizum</td></tr>`
          : `<tr><td><strong>2. Pago previo</strong></td><td class="num">${pagoPrevio} €</td><td>Antes de la llegada</td><td>Transferencia o Bizum</td></tr>`)
      : '';
    const _filaEfectivo = remanenteN > 0
      ? (isEn
          ? `<tr><td><strong>3. Payment on arrival</strong></td><td class="num">${remanente} €</td><td>On the check-in day</td><td>In cash</td></tr>`
          : `<tr><td><strong>3. Pago a la llegada</strong></td><td class="num">${remanente} €</td><td>El día del check-in</td><td>En efectivo</td></tr>`)
      : '';
    const _filaFianza = fianza
      ? (isEn
          ? `<tr><td><strong>Security deposit</strong></td><td class="num">300 €</td><td>Two days before arrival</td><td>Bank transfer (refunded at check-out)</td></tr>`
          : `<tr><td><strong>Fianza</strong></td><td class="num">300 €</td><td>Dos días antes de la llegada</td><td>Transferencia (se devuelve al check-out)</td></tr>`)
      : '';

    const clausulaSegunda = isEn ? `
<h3>Two · Rent and payment milestones</h3>
<p><strong>2.1</strong> The net rent for this lease is <strong>${precioL} (${precioTotal}) EUROS</strong>, for <strong>${huespL} (${huespedes}) guests${mascotaTexto}</strong>. Payment is structured in three milestones, set out in the table below:</p>
<table>
  <thead><tr><th>Payment milestone</th><th class="num">Amount</th><th>When</th><th>Method</th></tr></thead>
  <tbody>
    ${_filaSenal}
    ${_filaPrevio}
    ${_filaEfectivo}
    ${_filaFianza}
    <tr style="border-top: 1pt solid var(--ber)"><td><strong>TOTAL</strong></td><td class="num"><strong>${precioTotal} €</strong></td><td></td><td></td></tr>
  </tbody>
</table>
<p><strong>2.2</strong> Conditions for each amount:</p>
<ul>
  ${prereservaN > 0 ? `<li><strong>Deposit, ${preL} (${prereserva}) EUROS:</strong> paid on the signing of this contract and confirms the booking. Without proof of this payment, the contract has no effect.</li>` : ''}
  ${pagoPrevioN > 0 ? `<li><strong>Advance payment, ${prevL} (${pagoPrevio}) EUROS:</strong> paid by bank transfer or Bizum before the arrival date. In some bookings this amount is zero and therefore does not apply.</li>` : ''}
  ${remanenteN > 0 ? `<li><strong>Payment on arrival, ${remL} (${remanente}) EUROS:</strong> paid in cash on the check-in day, before the keys are handed over.</li>` : ''}
</ul>
<p><strong>2.3</strong> Any expense, fee or cost arising from making these payments (bank-transfer or Bizum fees, banking charges, currency exchange, etc.) shall be borne by the Tenant, so that the Owners receive in full the net amounts shown in the table.</p>
<p><strong>2.4</strong> This contract shall be void in the following cases:</p>
<ul>
  ${prereservaN > 0 ? `<li>Without proof of payment of the deposit of <strong>${preL} (${prereserva}) EUROS</strong>.</li>` : ''}
  ${remanenteN > 0 ? `<li>Without the cash payment of <strong>${remL} (${remanente}) EUROS</strong> at check-in.</li>` : ''}
  <li>If the ID card or passport of each guest over 16 years of age is not sent, attached to the signed contract.</li>
  ${lineaFianza}
</ul>
<p><strong>2.5</strong> Cancellation of the contract more than <strong>${cancelL} (${diasCancelacion}) days</strong> before the start of the booking will incur no cost, although we appreciate cancellations being communicated as early as possible so that other guests may enjoy Hestía.</p>
<p><strong>2.6</strong> Cancellation of the contract fewer than <strong>${cancelL} (${diasCancelacion}) days</strong> before the start of the stay will entail the loss of the amounts paid, save for officially demonstrable force majeure affecting one of the guests. In that case, if the property can be re-let, all amounts paid will be refunded, or the dates may be postponed within the following SIX (6) months from the date of the stay.</p>
${clausulaFianza}
` : `
<h3>Segunda · Renta y momentos de pago</h3>
<p><strong>2.1</strong> La renta neta del arrendamiento es de <strong>${precioL} (${precioTotal}) EUROS</strong>, para <strong>${huespL} (${huespedes}) personas${mascotaTexto}</strong>. El pago se articula en tres momentos, recogidos en la siguiente tabla:</p>
<table>
  <thead><tr><th>Momento del pago</th><th class="num">Importe</th><th>Cuándo</th><th>Forma de pago</th></tr></thead>
  <tbody>
    ${_filaSenal}
    ${_filaPrevio}
    ${_filaEfectivo}
    ${_filaFianza}
    <tr style="border-top: 1pt solid var(--ber)"><td><strong>TOTAL</strong></td><td class="num"><strong>${precioTotal} €</strong></td><td></td><td></td></tr>
  </tbody>
</table>
<p><strong>2.2</strong> Condiciones de cada importe:</p>
<ul>
  ${prereservaN > 0 ? `<li><strong>Señal, ${preL} (${prereserva}) EUROS:</strong> se abona en el momento de la formalización de este contrato y confirma la reserva. Sin su justificante, el contrato no surte efecto.</li>` : ''}
  ${pagoPrevioN > 0 ? `<li><strong>Pago previo, ${prevL} (${pagoPrevio}) EUROS:</strong> se abona por transferencia o Bizum antes de la fecha de llegada. En algunas reservas este importe es cero y entonces no procede.</li>` : ''}
  ${remanenteN > 0 ? `<li><strong>Pago a la llegada, ${remL} (${remanente}) EUROS:</strong> se abona en efectivo el día del check-in, antes de la entrega de las llaves.</li>` : ''}
</ul>
<p><strong>2.3</strong> Cualquier gasto, comisión o coste que origine la realización de estos pagos (comisiones de transferencia o de Bizum, gastos bancarios, cambio de divisa, etc.) correrá por cuenta de la Parte Arrendataria, de modo que los Propietarios reciban íntegros los importes netos indicados en la tabla.</p>
<p><strong>2.4</strong> Este contrato no tendrá validez en los siguientes casos:</p>
<ul>
  ${prereservaN > 0 ? `<li>Sin el justificante de abono de la señal de <strong>${preL} (${prereserva}) EUROS</strong>.</li>` : ''}
  ${remanenteN > 0 ? `<li>Sin el abono en efectivo de <strong>${remL} (${remanente}) EUROS</strong> en el momento del check-in.</li>` : ''}
  <li>Si no se envía el DNI o pasaporte de cada uno de los huéspedes mayores de 16 años, como adjunto al contrato firmado.</li>
  ${lineaFianza}
</ul>
<p><strong>2.5</strong> La cancelación del contrato con más de <strong>${cancelL} (${diasCancelacion}) días</strong> del inicio de la reserva no supondrá ningún coste, aunque se agradece comunicar lo antes posible la cancelación, con el fin de que otros huéspedes puedan disfrutar de Hestía.</p>
<p><strong>2.6</strong> La cancelación del contrato con menos de <strong>${cancelL} (${diasCancelacion}) días</strong> del inicio de la estancia supondrá la pérdida de las cantidades entregadas, salvo cuestión de fuerza mayor demostrable oficialmente de alguno de los huéspedes. En este caso, si se consigue realquilar, se devolverán todas las cantidades entregadas o se podrán posponer las fechas a los próximos SEIS (6) meses desde la fecha de la estancia.</p>
${clausulaFianza}
`;

    const bodyInner = isEn ? `
<p class="lugar">Madrid, ${fechaFirmaStr}</p>

<h2>Parties</h2>
<p>On the one part, <strong>Mr. ${tit('nombre1','titular 1','owner 1')}</strong> and <strong>Mr. ${tit('nombre2','titular 2','owner 2')}</strong>, of legal age, with address for notifications at ${tit('domicilio','domicilio','address')}, holding ID numbers ${tit('dni1','DNI 1','ID 1')} and ${tit('dni2','DNI 2','ID 2')}, telephones ${tit('tel1','teléfono 1','phone 1')} and ${tit('tel2','teléfono 2','phone 2')} respectively, email info@hestiayourhome.com and bank account ${tit('iban','IBAN','IBAN')}.</p>
<p><em>(Hereinafter, "the Owners".)</em></p>
<p>On the other part, <strong>Mr./Ms. ${escHtml(nombre.toUpperCase())}</strong>, of legal age, with address for notifications at: ${_blank(domicilio, 'long', 'dirección a rellenar', 'address to be completed')}, holding identity document: ${_blank(dni, 'short', 'DNI a rellenar', 'ID to be completed')}, telephone: ${_blank(telefono, 'short', 'teléfono a rellenar', 'phone to be completed')}, and email for electronic notifications: ${_blank(email, 'medium', 'email a rellenar', 'email to be completed')}.</p>
<p><em>(hereinafter, "the Tenant".)</em></p>
<p>Both parties acknowledge that they have sufficient legal capacity for this act and freely,</p>

<h2>RECITALS</h2>
<p><strong>I.</strong> That the Owner holds title to the following property in perfect condition of use:</p>
<p><strong>DWELLING:</strong> Address: ${a.direccion}, in Vera (Almería), and garage space <strong>${a.plazaGaraje}</strong>, under the conditions and with the furniture and services whose description and photographs are shown on the website www.hestiayourhome.com.</p>
${a.acceso_en ? `<p>${a.acceso_en}</p>` : ''}
<p>The dwelling is handed over clean, in perfect condition of use, upkeep and habitability, and its supplies and services are in working order. The dwelling shall be returned clean and in perfect condition.</p>${bloqueAccesibilidad}
<p>Hestía is located in a developing area and there are construction works ${a.zonaObras_en}. The Tenant acknowledges this situation, and the Owners accept no responsibility for any circumstance caused by such works.</p>
<p><strong>II.</strong> Both parties have agreed to enter into the seasonal lease of the property described above, and therefore establish this contract, which shall be governed by the following</p>

<h2>CLAUSES</h2>

<h3>One · Purpose</h3>
<p>The Owner leases on a seasonal basis, for the term to be indicated, to the Tenant, who accepts, the property described.</p>
${clausulaSegunda}
<h3>Three · Term</h3>
<p>This contract is granted for the season of <strong>${nochesL} (${noches}) nights</strong>, from <strong>${fechaEntradaStr}</strong> at 15:00, and shall be automatically terminated, without need for any notice, on <strong>${fechaSalidaStr}</strong> at 11:00, with the Tenant returning the keys beforehand.</p>
<p>The Tenant must leave the property in the condition in which it was found, free of belongings and effects, with all its services in perfect working order, with no possibility of extension save for written agreement between the parties.</p>

<h3>Four · Obligations of the parties</h3>
<p><strong>4.1</strong> The Tenant undertakes to keep the dwelling in perfect condition throughout the term freely agreed between both parties.</p>
<p><strong>4.2</strong> The Tenant may not accommodate more guests nor carry out in the dwelling any activities that are annoying, unhealthy, harmful, dangerous, unlawful or contrary to the Community Statutes. Nor may the Tenant store flammable, explosive or corrosive materials in the dwelling, or carry out commercial or industrial activities therein.</p>
<p><strong>4.3</strong> The Tenant shall be directly and exclusively liable, and releases the Owners from all liability, for: i) damage to persons or property arising from the Tenant's misuse of the installations, services and supplies of the leased seasonal home; ii) damage, deterioration or losses occurring in the dwelling, whether caused by the Tenant or by those living with them.</p>
<p><strong>4.4</strong> The Tenant may not carry out works or make any modification without the written permission of the Owner. Under no circumstances may holes be drilled in the walls.</p>
<p><strong>4.5</strong> The Owner shall keep the water, electricity and other supplies paid up and fully operational, as well as the home insurance in force.</p>
<p><strong>4.6</strong> The Tenant shall be obliged to repair and maintain the fittings and furniture whenever the need arises from misuse, as well as the electrical and plumbing installations, with major works being borne by the lessor.</p>
<p><strong>4.7</strong> ${clausulaMascotas}</p>
<p><strong>4.8</strong> Subletting in any form is prohibited.</p>

<h3>Five · Waivers</h3>
<p>The Tenant waives the rights contained in articles 31 to 33 of the Spanish Urban Leases Act, and therefore the rights of lease, subrogation, assignment or transfer, whether total or partial, pre-emption, withdrawal and the right to challenge the transfer.</p>

<h3>Six · Penalty clause</h3>
<p>Failure to comply with the obligation to vacate the Dwelling within the agreed period shall oblige the Tenant to pay, as a penalty, the sum corresponding to triple the daily rent, payable by weeks elapsed until the Owner has free availability of the dwelling, without prejudice to costs, expenses and other indemnities payable by the Tenant, including lawyers' and court agents' fees, even where their involvement is not mandatory.</p>

<h3>Seven · Jurisdiction</h3>
<p>The parties submit to the jurisdiction and competence of the courts and tribunals of the place where the dwelling is located, with express waiver of their own jurisdiction.</p>
<p>Both parties ratify this contract and sign it in duplicate, to a single effect, at the place and date indicated in the heading.</p>

<h3>Eight · Services included</h3>
<p>The apartment is handed over clean and equipped.</p>
<ul>
  <li>One set of towels per guest.</li>
  <li>${a.bloqueSabanas_en}</li>
</ul>

<h3>Nine · Additional services</h3>
<p>The following services may be added to the booking. Prices are synchronised with the website:</p>
<table>
  <thead><tr><th>Service</th><th class="num">Price</th><th>Unit</th></tr></thead>
  <tbody>${tablaExtras}</tbody>
</table>

<h3>Ten · Hestía house rules</h3>
<p>Hestía provides consumable products. Please be cooperative: if you use or consume something, replace it (except the welcome kit, which is a small gift from us).</p>
<p>Respect the environment and try not to waste electricity and water. In your own home you would not leave the air conditioning on with the windows open or when you are out. So please, feel at home.</p>
<p>Likewise, if you go out, bring in the cushions, the awning and the terrace plants, especially if it is windy, rainy or bad weather is forecast.</p>
<p>Respect and do not remove from Hestía any equipment, contents, furniture or details. After your stay an inventory and inspection of Hestía will be carried out, so any deterioration or removal will be your responsibility.</p>
<p>Our greatest wish is that you rest and that you equally respect our neighbours' rest, avoiding noise, music and commotion at unsociable hours. Hestía is exclusively for your use and enjoyment, not for others'.</p>
<p>Respect check-in (from 15:00) and check-out (until 11:00) times. Pets are not allowed except with explicit approval. Do not smoke. Towels are for exclusive use inside Hestía. Clothes may only be hung on the drying rack. Use of the common areas shall be within the permitted hours, especially the pool. Naturism and toplessness are not permitted anywhere in the complex, as it is a textile resort. Any incident involving minors shall be the responsibility of their parents/guardians. Any situation or incident in the common services or outside Hestía is not our responsibility, although we will try to help you. Please try to leave Hestía clean and tidy. We take care of the sheets and towels. In any case, please do not wash the towels and sheets with coloured clothing.</p>
<p><strong>Community and common areas.</strong> Driving above the speed indicated by the community is not allowed: in general, very low. There are children, pets and pedestrians; always drive slowly. Likewise, soiling or damaging the common areas (gardens, pool, lifts, corridors and landings) is not allowed. Any damage or repeated dirtiness will be the guest's responsibility.</p>

<div class="sign-page">
<h2>Signing of the contract</h2>
<p>In witness of agreement with all the above, both parties sign this contract in duplicate and to a single effect, at the place and date indicated in the heading.</p>
<div class="firmas">
  <div class="firma">
    <strong>The Owners</strong> <em style="font-weight:normal">(one signature is sufficient)</em><br>
    Signed: ${tit('nombre1','titular 1','owner 1')}<br>
    Signed: ${tit('nombre2','titular 2','owner 2')}
  </div>
  <div class="firma">
    <strong>The Tenant</strong><br>
    Signed: <strong>${escHtml(nombre.toUpperCase())}</strong>
  </div>
</div>
</div>
` : `
<p class="lugar">Madrid, ${fechaFirmaStr}</p>

<h2>Reunidos</h2>
<p>Por una parte, <strong>D. ${tit('nombre1','titular 1','owner 1')}</strong> y <strong>D. ${tit('nombre2','titular 2','owner 2')}</strong>, mayores de edad, y con domicilio a efectos de notificaciones en ${tit('domicilio','domicilio','address')}, con DNI ${tit('dni1','DNI 1','ID 1')} y ${tit('dni2','DNI 2','ID 2')}, teléfonos ${tit('tel1','teléfono 1','phone 1')} y ${tit('tel2','teléfono 2','phone 2')} respectivamente, correo electrónico info@hestiayourhome.com y cuenta corriente: ${tit('iban','IBAN','IBAN')}.</p>
<p><em>(De ahora en adelante, "Los Propietarios".)</em></p>
<p>De otra parte, <strong>D./Dña. ${escHtml(nombre.toUpperCase())}</strong>, mayor de edad, con domicilio a efectos de notificaciones en: ${_blank(domicilio, 'long', 'dirección a rellenar', 'address to be completed')}, con Documento Nacional de Identidad: ${_blank(dni, 'short', 'DNI a rellenar', 'ID to be completed')}, con teléfono: ${_blank(telefono, 'short', 'teléfono a rellenar', 'phone to be completed')}, y correo electrónico a efectos de notificaciones telemáticas: ${_blank(email, 'medium', 'email a rellenar', 'email to be completed')}.</p>
<p><em>(en adelante, "la Parte Arrendataria".)</em></p>
<p>Ambas partes se reconocen capacidad legal suficiente para este acto y libremente,</p>

<h2>EXPONEN</h2>
<p><strong>I.</strong> Que el Propietario es titular de la siguiente finca en perfecto estado de uso:</p>
<p><strong>VIVIENDA:</strong> Dirección: ${a.direccion}, en Vera (Almería), y plaza de garaje <strong>${a.plazaGaraje}</strong>, en las condiciones y con los muebles y servicios cuya descripción y fotografías se exponen en la página web www.hestiayourhome.com.</p>
${a.acceso ? `<p>${a.acceso}</p>` : ''}
<p>La vivienda se entrega limpia, en perfecto estado de uso, conservación y habitabilidad y los suministros y servicios que posee la misma se encuentran en funcionamiento. La vivienda se devolverá limpia y en perfecto estado.</p>${bloqueAccesibilidad}
<p>Hestía se encuentra en una zona de expansión y existen obras de construcción ${a.zonaObras}. La Parte Arrendataria da por conocida esta situación y los Propietarios no se hacen responsables de cualquier situación ocasionada por dichas obras.</p>
<p><strong>II.</strong> Ambas partes han acordado concertar el arrendamiento por temporada de la finca antes descrita, por lo que establecen el presente contrato, que se regirá por lo dispuesto en las siguientes,</p>

<h2>CLÁUSULAS</h2>

<h3>Primera · Objeto</h3>
<p>El Propietario cede en arrendamiento de temporada con la duración que se indicará a la Parte Arrendataria, que acepta, la finca descrita.</p>
${clausulaSegunda}
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
<p><strong>Mancomunidad y zonas comunes.</strong> No se permite circular a velocidad superior a la indicada por la mancomunidad: en general, muy reducida. Hay niños, mascotas y peatones; conducid siempre despacio. Asimismo, no se permite ensuciar ni deteriorar las zonas comunes (jardines, piscina, ascensores, pasillos y descansillos). Cualquier desperfecto o suciedad reiterada será responsabilidad del huésped.</p>

<div class="sign-page">
<h2>Firma del contrato</h2>
<p>En prueba de conformidad con todo lo anterior, ambas partes firman el presente contrato por duplicado y a un solo efecto, en el lugar y fecha indicados en el encabezamiento.</p>
<div class="firmas">
  <div class="firma">
    <strong>Los Propietarios</strong> <em style="font-weight:normal">(con una es suficiente)</em><br>
    Fdo.: ${tit('nombre1','titular 1','owner 1')}<br>
    Fdo.: ${tit('nombre2','titular 2','owner 2')}
  </div>
  <div class="firma">
    <strong>La Parte Arrendataria</strong><br>
    Fdo.: <strong>${escHtml(nombre.toUpperCase())}</strong>
  </div>
</div>
</div>
`;
    return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'es'}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=794, initial-scale=1">
<title>${docTitle}</title>
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
  #pdf-content { background: #fff; width: 210mm; }
  #contract-body { padding: 14mm 16mm 14mm; }

  /* ── Hero (primera página) ───────────────────────────── */
  .hero {
    margin-top: -8mm;
    position: relative;
    width: 100%;
    height: 65mm;
    overflow: hidden;
    background: linear-gradient(135deg, var(--ber) 0%, var(--ber-lt) 100%);
  }
  .hero-img {
    /* En el flujo (display:block), NO position:absolute + object-fit: html2canvas
       (el rasterizador del PDF) descarta imágenes con object-fit posicionadas en
       absoluto, y la cabecera salía en el navegador pero desaparecía en el PDF
       guardado. cropHero ya recorta a la proporción exacta (2100×650), así que
       object-fit es innecesario: width/height 100% encuadra sin deformar. */
    display: block;
    width: 100%;
    /* Altura EXPLÍCITA (= la del .hero), no 100%. En iOS/Safari html2canvas a
       veces resuelve height:100% de un padre en mm a 0 y la imagen de portada
       salía en blanco en el PDF. Con 65mm fijos siempre tiene altura. */
    height: 65mm;
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

  /* El salto a página propia lo fuerza html2pdf via pagebreak.before (legacy),
     más fiable en Safari. NO repetir aquí page-break-before (css mode), porque
     el doble salto generaba una página en blanco antes de las firmas. */
  .sign-page {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .firmas {
    margin-top: 10mm;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10mm;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .firma {
    padding-top: 15mm;
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
  <span id="gen-status">${isEn ? 'Generating PDF…' : 'Generando PDF…'}</span>
  <button id="gen-fallback" onclick="window.print()" style="display:none">${isEn ? 'Save as PDF (Ctrl+P alternative)' : 'Guardar como PDF (alternativa Ctrl+P)'}</button>
</div>

<div id="pdf-content">
<!-- Hero en el flujo del documento (no superpuesto por jsPDF). Al formar parte de la
     imagen que html2canvas rasteriza, escala SIEMPRE junto al contenido, así que la
     cabecera nunca puede desalinearse y solaparse con el texto (problema previo en
     móvil con el spacer fijo + hero dibujado por jsPDF). La barra fina y el pie se
     dibujan en los márgenes reservados (MARG_TOP/MARG_BOT), fuera del contenido. -->
<div class="hero">
  ${heroUrl ? `<img class="hero-img" src="${heroUrl}" alt="">` : ''}
  <div class="hero-overlay"></div>
  <div class="hero-text">
    <p class="hero-eyebrow">${heroEyebrow}</p>
    <div class="hero-title">Hestía · Vera ${a.shortName}</div>
    <p class="hero-meta">${stayMeta}</p>
  </div>
</div>
<div id="contract-body">
${bodyInner}
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
    // Espera a que TODAS las imágenes (sobre todo el hero de la primera página)
    // estén decodificadas antes de rasterizar. En Safari/iOS html2canvas a veces
    // capturaba antes de que el data-URL del hero estuviera listo y la cabecera
    // de la primera página salía en blanco al guardar.
    try {
      await Promise.all([].slice.call(el.querySelectorAll('img')).map(function(img) {
        if (img.complete && img.naturalWidth) return img.decode ? img.decode().catch(function() {}) : Promise.resolve();
        return new Promise(function(res) { img.onload = res; img.onerror = res; });
      }));
    } catch(e) {}
    // margin: [top, right, bottom, left], la barra fina (18mm) y el pie viven en estos
    // márgenes; el contenido (incl. el hero, ya dentro del flujo) nunca los invade.
    // La barra fina ocupa 0–18mm y el pie ~287–290mm. Dejamos MARG_TOP/BOT MAYORES
    // que esas franjas para que SIEMPRE quede una banda blanca entre cabecera y
    // contenido, y entre contenido y pie, imposible que se solapen en ninguna página.
    var MARG_TOP = 26, MARG_BOT = 30;
    // En iOS/Safari el canvas de html2canvas tiene un límite de tamaño más bajo:
    // con scale 2 y un contrato de varias páginas, el lienzo se pasaba y el final
    // (las firmas) y las imágenes salían en blanco. En móvil bajamos a scale 1.5
    // (menos presión, sigue nítido para un PDF). En escritorio se mantiene en 2.
    var IS_MOBILE = /iP(hone|ad|od)|Android/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))
      || (window.innerWidth && window.innerWidth < 820);
    var CANVAS_SCALE = IS_MOBILE ? 1.5 : 2;
    var opt = {
      margin: [MARG_TOP, 0, MARG_BOT, 0],
      filename: FILE,
      image: { type: 'jpeg', quality: 0.96 },
      // El <meta viewport width=794> del HTML hace que el móvil maquete a 794px (=210mm)
      // igual que escritorio, en vez del viewport por defecto ~980px que desajustaba la
      // imagen escalada y desbordaba el contenido sobre cabecera/pie.
      html2canvas: { scale: CANVAS_SCALE, useCORS: true, allowTaint: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Firmas: NO forzar salto de página propio ('before'). En iOS/Safari ese
      // salto generaba una página final fantasma que se descartaba, y las firmas
      // desaparecían del PDF (la última página salía en blanco). En su lugar, el
      // bloque de firmas se mantiene JUNTO ('avoid') y fluye tras las normas: si
      // cabe en el hueco de la última página entra ahí, si no, se mueve entero a
      // una nueva. 'tr' evita partir filas de tabla. Nunca se pierde ni se parte.
      pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.firmas', '.sign-page'] }
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

      /* ── Barra compacta (todas las páginas, en el margen superior) */
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
      pdf.text('${isEn ? 'Page' : 'Página'} ' + i + ' ${isEn ? 'of' : 'de'} ' + n, pW - 5, footY, { align: 'right' });
    }

    await worker.save();
    document.getElementById('gen-status').textContent = ${JSON.stringify(isEn ? 'PDF downloaded. You can close this tab or use Ctrl+P if you need to print it.' : 'PDF descargado, puedes cerrar esta pestaña o usar Ctrl+P si necesitas imprimirlo.')};
  }

  document.addEventListener('DOMContentLoaded', function() {
    generate().catch(function(err) {
      console.error('html2pdf error:', err);
      document.getElementById('gen-status').textContent = ${JSON.stringify(isEn ? 'Error generating the PDF. Use Ctrl+P as an alternative.' : 'Error al generar el PDF. Usa Ctrl+P como alternativa.')};
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
    const prevN = Number(pagoPrevio || 0);
    if (lang === 'en') {
      return `Dear ${nombre},

Thank you very much for your interest in Hestía! Attached you will find the tenancy agreement for your stay at Hestía Vera ${apartamento} from ${fechaEntradaStr} to ${fechaSalidaStr}.

To confirm your booking we need you to send us:

1. The contract signed by all parties (you can reply to this email with the signed PDF attached).
2. The ID card or passport of each guest over 16 years of age.
3. Proof of the deposit of ${prereserva} €, paid by bank transfer to account ${tit('iban','IBAN','IBAN')} or Bizum to +34 620 316 370.${prevN > 0 ? `\n4. Proof of the advance payment of ${pagoPrevio} €.` : ''}

The remaining ${remanente} € is paid in cash on the arrival day, at check-in. Any fees arising from these payments are borne by the guest.

Once we have received all the documentation, your booking will be confirmed and we will write to you a few days before your arrival to coordinate check-in (self check-in or in person, whichever suits you best).

If you have any questions, feel free to write to us.

Warm regards,
Alex & Fran · Hestía
info@hestiayourhome.com · +34 620 316 370`;
    }
    return `Estimado/a ${nombre},

¡Muchas gracias por tu interés en Hestía! Adjunto encontrarás el contrato de arrendamiento para tu estancia en Hestía Vera ${apartamento} del ${fechaEntradaStr} al ${fechaSalidaStr}.

Para confirmar tu reserva necesitamos que nos hagas llegar:

1. El contrato firmado por todas las partes (puedes contestar a este correo con el PDF firmado adjunto).
2. El DNI o pasaporte de cada huésped mayor de 16 años.
3. El justificante de la señal de ${prereserva} €, ingresada por transferencia a la cuenta ${tit('iban','IBAN','IBAN')} o Bizum al teléfono +34 620 316 370.${prevN > 0 ? `\n4. El justificante del pago previo de ${pagoPrevio} €.` : ''}

El remanente de ${remanente} € se abona en efectivo el día de la llegada, en el momento del check-in. Cualquier gasto derivado de estos pagos corre a cargo del huésped.

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
    // SYNC: must happen inside the user-gesture context, before any await.
    // Browsers block window.open and mailto navigation triggered asynchronously.
    const w = window.open('', '_blank');
    if (!w) {
      alert('Tu navegador ha bloqueado la ventana emergente. Permite popups en /p-edit.html y vuelve a intentarlo.');
      return;
    }
    const subject = lang === 'en'
      ? `Booking contract · Hestía Vera ${aptInfo.shortName} · ${fmtFechaCorta(fechaEntrada)} → ${fmtFechaCorta(fechaSalida)}`
      : `Contrato de reserva · Hestía Vera ${aptInfo.shortName} · ${fmtFechaCorta(fechaEntrada)} → ${fmtFechaCorta(fechaSalida)}`;
    const body = buildEmailBody();
    const mailto = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const aEl = Object.assign(document.createElement('a'), { href: mailto });
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);

    // ASYNC, pre-load images as data URIs so they embed correctly in the PDF.
    const [heroRaw, logoDataUrl, wmDataUrl] = await Promise.all([
      fetchDataUrl(aptInfo.heroPhoto),
      fetchDataUrl('assets/logo-hestia-brand.png'),
      fetchDataUrl('assets/logo-teal-transparent.png'),
    ]);
    const heroDataUrl = await cropHero(heroRaw, aptInfo.heroFocusY ?? 0.5);

    // Write contract HTML to the already-opened window.
    const html = buildContractHTML(heroDataUrl, logoDataUrl, wmDataUrl);
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();

    // Guarda los datos del huésped editados aquí de vuelta en la reserva.
    if (canSaveToReserva) await saveToReserva();
  };

  return (
    <div className="pe-card">
      <h2><HiIcon name="doc" size={20} className="pe-h-ic" /> Generar contrato</h2>
      <p className="pe-help">
        Rellena los datos del huésped. El precio total lo dictas tú · la fecha de firma se rellena con la de hoy (puedes cambiarla).
        Al pulsar <strong>Generar contrato y abrir correo</strong> se abren dos ventanas: el contrato listo para guardar como PDF y tu cliente de correo con el mensaje prerrellenado al huésped.
        Recuerda <strong>adjuntar manualmente</strong> el PDF descargado al correo antes de enviarlo (los navegadores no permiten adjuntar automáticamente desde un <code>mailto:</code>).
      </p>

      {!titListos && (
        <p className="pe-warn" style={{ background: 'var(--err-bg, #F8E0EB)', color: 'var(--err, #B8246E)', padding: '10px 14px', borderRadius: '10px 0 10px 0', margin: '0 0 14px' }}>
          No se han cargado los datos de los titulares desde <code>hestia-data/titulares.json</code>.
          El contrato saldría con huecos marcados en rojo donde van el nombre, el DNI, el domicilio y el IBAN.
          Comprueba que el token tiene acceso al repositorio privado y que el fichero existe.
        </p>
      )}

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
          <legend>Idioma del contrato</legend>
          <div className="pe-grid">
            {[['es', '🇪🇸 Español'], ['en', '🇬🇧 English']].map(([id, label]) => (
              <label key={id} className={`ct-radio ${lang === id ? 'is-active' : ''}`}>
                <input type="radio" name="ct-lang" value={id} checked={lang === id} onChange={() => setLang(id)} />
                <span className="ct-radio-name">{label}</span>
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
            <div className="pe-field"><label>Fecha de entrada *</label><input type="date" value={fechaEntrada} onChange={e => { const v = e.target.value; setFechaEntrada(v); if (v && (!fechaSalida || fechaSalida <= v)) setFechaSalida(addDaysIso(v, 7)); }} /></div>
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
          {canSaveToReserva && (
            <button type="button" className="pe-btn pe-btn-ghost" onClick={saveToReserva} title="Guarda los datos del huésped en la reserva sin generar el contrato">
              💾 Guardar datos en la reserva
            </button>
          )}
          {!formOk() && <span className="ct-actions-hint">Faltan campos obligatorios (marcados con *).</span>}
          {reservaSaveMsg && (
            <span className="ct-actions-hint" style={{ color: reservaSaveMsg.kind === 'err' ? '#c0392b' : reservaSaveMsg.kind === 'ok' ? '#1e8449' : 'inherit' }}>
              {reservaSaveMsg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ReservasTab, pestaña de reservas (v2).
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
const PRERESERVAS_PATH = 'prereservas.json'; // en el repo PRIVADO (PII de borradores): fuera de docs/ y de Pages

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
  booking:  0.233,   // 22% comisión + 1.3% servicio de pagos (IVA aparte, recuperable). Ref: factura Booking may-2026
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
  if (mes === 7 || mes === 8) return 90;   // julio y agosto: siempre 90
  if ((noches || 0) >= 10)    return 90;   // estancias de 10 noches o más: 90
  return 80;                               // resto: 80
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
  ? '–'
  : `${Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const fmtPct = n => (n == null || isNaN(n))
  ? '–'
  : `${(Number(n) * 100).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
const fmtDate = (d) => {
  if (!d) return '–';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));
  return m ? `${m[3]}.${m[2]}.${m[1].slice(2)}` : d;
};
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

// FacturasTab, Gastos deducibles por año / apartamento
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
        <h2><HiIcon name="receipt" size={20} className="pe-h-ic" /> Facturas de gastos
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
                      <strong>{f.proveedor || '–'}</strong>
                      {f.nif && <span className="fac-nif">{f.nif}</span>}
                    </td>
                    <td className="fac-concepto">{f.concepto || '–'}</td>
                    <td><span className="fac-cat-chip">{catLabel}</span></td>
                    <td>
                      {f.apt && f.apt !== 'general'
                        ? <span className="rv-apt-chip" style={{background: APT_COLOR[f.apt], color: APT_TEXT[f.apt]}}>{APT_NAMES[f.apt]}</span>
                        : <span className="fac-apt-gen">General</span>}
                    </td>
                    <td className="num">{fmtEur(f.base)}</td>
                    <td className="num fac-iva">{f.iva_pct ? `${f.iva_pct}%` : '–'}</td>
                    <td className="num"><strong>{fmtEur(f.total)}</strong></td>
                    <td className="num fac-deducible">{fmtEur(deducible)}{f.deducible_pct < 100 ? <span className="fac-pct"> ({f.deducible_pct}%)</span> : ''}</td>
                    <td className="fac-pdf-cell" onClick={e => e.stopPropagation()}>
                      {f.factura_pdf
                        ? <button type="button" className="fac-pdf-btn" title={f.factura_pdf} onClick={() => handlePdfDownload(f.factura_pdf)}><HiIcon name="clip" size={13} style={{verticalAlign:'-2px',marginRight:4}} />PDF</button>
                        : <span className="fac-no-pdf">–</span>}
                    </td>
                    <td className="fac-actions-cell" onClick={e => e.stopPropagation()}>
                      <button type="button" className="fac-del-btn" title="Borrar" onClick={() => deleteFactura(i)}><HiIcon name="trash" size={15} style={{verticalAlign:'-2px'}} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="fac-foot">
                <td colSpan="5">Total {filtered.length} factura{filtered.length !== 1 ? 's' : ''}</td>
                <td className="num"><strong>{fmtEur(totBase)}</strong></td>
                <td className="num">–</td>
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
                      <span className="rv-contrato-fname" title={draft.factura_pdf}><HiIcon name="clip" size={13} style={{verticalAlign:'-2px',marginRight:4}} />{draft.factura_pdf}</span>
                      <button type="button" className="pe-btn pe-btn-ghost" onClick={() => handlePdfDownload(draft.factura_pdf)}>⬇ Ver</button>
                      <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                        <HiIcon name="refresh" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Cambiar
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={handlePdfUpload} />
                      </label>
                    </>
                  ) : (
                    <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                      {pdfStatus === 'uploading' ? <><HiIcon name="hourglass" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Subiendo…</> : <><HiIcon name="clip" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Adjuntar factura</>}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={handlePdfUpload} disabled={pdfStatus === 'uploading'} />
                    </label>
                  )}
                </div>
              </fieldset>
            </div>
            <footer className="rv-edit-foot">
              {editIdx >= 0 && (
                <button type="button" className="pe-btn pe-btn-ghost rv-btn-danger" onClick={() => { cancelDraft(); deleteFactura(facturas.indexOf(data.facturas[editIdx])); }}><HiIcon name="trash" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Borrar</button>
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
  const [compact,    setCompact]    = React.useState(false);   // vista reducida para pasar a Leila

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
      setSyncMsg('Sync con Google Sheets no configurado, ver SETUP-SHEETS-SYNC.md');
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

  // Año de la reserva: usa r.year y, si falta, lo deriva de la fecha de entrada
  // o salida (igual que la pestaña Reservas). Así ninguna reserva con fechas se
  // queda fuera de la contabilidad de Leila por no tener el campo year.
  const yearOf = r => r.year ? String(r.year) : String((r.entrada || r.salida || '').slice(0, 4));
  // Las reservas canceladas no cuentan en la contabilidad de Leila (no hubo
  // estancia: ni efectivo ni limpieza).
  const isCancelada = r => r.cancelada === true || String(r.cancelacion || '').trim().toUpperCase() === 'CANCELADA';
  const activas = reservas.map((r, i) => ({ ...r, _idx: i })).filter(r => !isCancelada(r));
  const allYears = [...new Set(activas.map(yearOf).filter(Boolean))].sort();
  const yearRows = activas.filter(r => yearOf(r) === focusYear);
  const allMonths = [...new Set(yearRows.map(r => (r.entrada || '').slice(5, 7)).filter(Boolean))].sort();

  const byMonth = {};
  yearRows.forEach(r => {
    const m = (r.entrada || '').slice(5, 7);
    if (m) (byMonth[m] = byMonth[m] || []).push(r);
  });
  // Dentro de cada mes, ordenar por fecha de inicio de la estancia (entrada),
  // no por apartamento. Desempate por salida y luego por índice original.
  Object.values(byMonth).forEach(arr => arr.sort((a, b) =>
    (a.entrada || '').localeCompare(b.entrada || '')
    || (a.salida || '').localeCompare(b.salida || '')
    || (a._idx - b._idx)
  ));

  // Efectivo cobrado a Leila por reserva, en este orden de prioridad y para
  // CUALQUIER canal (directo, Booking, Airbnb, Otro): una reserva de plataforma
  // también puede dejar efectivo a la llegada (tasa turística, limpieza, un
  // extra, un remanente pactado...). Antes solo se contaba en reservas directas
  // y ese efectivo de las OTA se perdía.
  //   1) edición manual en esta pestaña (siempre gana: es la decisión activa de ahora mismo)
  //   2) efectivo al check-in registrado en la reserva (al_checkin), sea el canal que sea
  //   3) reserva directa sin al_checkin: remanente tras la señal y el pago previo,
  //      SIEMPRE calculado en vivo a partir de la reserva actual (si se amplía la
  //      estancia o se corrige el precio, este número se actualiza solo)
  //   4) sin base para calcular en vivo (reserva de OTA sin al_checkin): se usa el
  //      último efectivo guardado (efectivo_leila / pagos_leila), si lo hay
  const efectivoDe = (r) => {
    if (editsEfectivo[r._idx] !== undefined) return Number(editsEfectivo[r._idx]) || 0;
    const alCheckin = Number(r.al_checkin) || 0;
    if (alCheckin) return alCheckin;
    if (getCanalKey(r.canal) === 'directo') {
      return Math.max(0, (Number(r.ingreso_total)||0) - (Number(r.reserva)||0) - (Number(r.pago_previo)||0));
    }
    return Number(r.efectivo_leila ?? r.pagos_leila) || 0;
  };
  // Limpieza que Leila cobra por reserva: SIEMPRE la regla (80 €; 90 € en
  // jul-ago o estancias de 10 noches o más), así todas las reservas quedan
  // revisadas al instante aunque el valor guardado fuera antiguo.
  const limpiezaDe = (r) => autoLimpieza(r.entrada, r.noches);
  // Redondeo a céntimos: evita los "montones de decimales" de coma flotante al
  // sumar importes (p. ej. 1234.5600000000002 → 1234.56).
  const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
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
      const mEf = mRows.reduce((s, r) => s + efectivoDe(r), 0);
      const mTa = mRows.reduce((s, r) => s + limpiezaDe(r), 0);
      const liqE = liquidaciones.find(l => l.mes === mKey);
      const liqV = editsLiquid[mKey] !== undefined ? (Number(editsLiquid[mKey]) || 0) : (liqE ? liqE.importe : 0);
      carry = r2(carry + mEf - mTa - liqV);
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
          <button type="button" className={`pe-btn ${compact ? 'pe-btn-primary' : 'pe-btn-ghost'}`} onClick={() => setCompact(c => !c)}>
            {compact ? 'Vista completa' : 'Vista para Leila'}
          </button>
          <button type="button" className="pe-btn pe-btn-ghost" onClick={loadData} disabled={loading}>
            {loading ? 'Recargando…' : 'Recargar'}
          </button>
<button type="button" className="pe-btn pe-btn-ghost" onClick={() => data && exportReservasExcel((data.reservas || []).filter(r => yearOf(r) === focusYear && !isCancelada(r)), focusYear)} disabled={!data}>
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
        const mTarifa   = r2(rows.reduce((s, r) => s + limpiezaDe(r), 0));
        const mEfectivo = r2(rows.reduce((s, r) => s + efectivoDe(r), 0));
        const liqEntry  = liquidaciones.find(l => l.mes === mKey);
        const liqVal    = editsLiquid[mKey] !== undefined
          ? (Number(editsLiquid[mKey]) || 0)
          : (liqEntry ? liqEntry.importe : 0);
        const liqDate   = editsLiquidDate[mKey] !== undefined
          ? editsLiquidDate[mKey]
          : (liqEntry ? (liqEntry.fecha_sync || '') : '');
        const mBal = r2((mEfectivo - mTarifa) - liqVal);
        yrTarifa += mTarifa; yrEfectivo += mEfectivo; yrLiquid += liqVal;

        let mAcum = monthCarry[m] ?? 0;
        const rowAcums = rows.map(r => {
          const ef = efectivoDe(r);
          mAcum = r2(mAcum + ef - limpiezaDe(r));
          return mAcum;
        });
        const acumAfterMonth = r2(mAcum - liqVal);

        return (
          <div key={m} className="leila-month-block">
            <div className="leila-month-hdr">
              <span className="leila-month-name">{MES_FULL[parseInt(m, 10) - 1]} {focusYear}</span>
              <span className="leila-month-kpis">
                <span>Efectivo: <strong>{mEfectivo} €</strong></span>
                <span>Limpieza: <strong>{mTarifa} €</strong></span>
                <span>Neto mes: <strong>{r2(mEfectivo - mTarifa)} €</strong></span>
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
                    {!compact && <>
                      <th className="num">Noches</th>
                      <th className="num">Bruto</th>
                      <th className="num">BAI</th>
                      <th className="num">Rent.</th>
                      <th className="num">€/noche</th>
                    </>}
                    <th className="num">Limpieza</th>
                    <th className="num">Efectivo</th>
                    <th className="num">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => {
                    const tarifa   = limpiezaDe(r);
                    const efectivo = efectivoDe(r);
                    const acum     = rowAcums[ri];
                    return (
                      <tr key={r._idx}>
                        <td className="leila-apt">{APT_LABEL[r.apt] || r.apt}</td>
                        <td className="leila-guest">{r.responsable || '–'}</td>
                        <td className="leila-dates">{fmtDate(r.entrada)}{r.salida ? ` · ${fmtDate(r.salida)}` : ''}</td>
                        {!compact && <>
                          <td className="num">{r.noches || '–'}</td>
                          <td className="num">{r.ingreso_total != null ? `${r.ingreso_total} €` : '–'}</td>
                          <td className="num">{r.bai != null ? `${r.bai} €` : '–'}</td>
                          <td className="num">{r.rentabilidad_pct != null ? `${Math.round(r.rentabilidad_pct * 1000) / 10} %` : '–'}</td>
                          <td className="num">{r.precio_bruto_noche != null ? `${r.precio_bruto_noche} €` : '–'}</td>
                        </>}
                        <td className="num">{tarifa} €</td>
                        <td className="num">
                          {compact
                            ? `${efectivo || 0} €`
                            : <NumInput step="1" min="0" className="leila-cobro-input"
                                value={efectivo || 0}
                                placeholder="0"
                                onChange={v => setEditsEfectivo(prev => ({ ...prev, [r._idx]: v }))}
                              />}
                        </td>
                        <td className={`num ${acum > 0 ? 'leila-owe' : acum < 0 ? 'leila-over' : 'leila-ok'}`}>
                          {acum === 0 ? '–' : `${acum > 0 ? '+' : ''}${acum} €`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="leila-foot-row">
                    {compact
                      ? <td colSpan="3"/>
                      : <>
                          <td colSpan="4"/>
                          <td className="num">{Math.round(rows.reduce((s,r) => s + (Number(r.ingreso_total)||0), 0) * 100) / 100} €</td>
                          <td className="num">{Math.round(rows.reduce((s,r) => s + (Number(r.bai)||0), 0) * 100) / 100} €</td>
                          <td colSpan="2"/>
                        </>}
                    <td className="num">{mTarifa} €</td>
                    <td className="num">{mEfectivo > 0 ? `${mEfectivo} €` : '–'}</td>
                    <td className={`num ${(mEfectivo - mTarifa) > 0 ? 'leila-owe' : (mEfectivo - mTarifa) < 0 ? 'leila-over' : 'leila-ok'}`}>
                      {(mEfectivo - mTarifa) === 0 ? '–' : `${(mEfectivo - mTarifa) > 0 ? '+' : ''}${r2(mEfectivo - mTarifa)} €`}
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
        const yrNeto = r2(yrEfectivo - yrTarifa);
        const yrBal  = r2(yrNeto - yrLiquid);
        return (
          <div className="leila-year-total">
            <span>Total {focusYear}</span>
            <span>Efectivo: <strong>{r2(yrEfectivo)} €</strong></span>
            <span>Limpieza: <strong>{r2(yrTarifa)} €</strong></span>
            <span>Neto: <strong className={yrNeto > 0 ? 'leila-owe' : yrNeto < 0 ? 'leila-over' : ''}>{yrNeto > 0 ? '+' : ''}{yrNeto} €</strong></span>
            {yrLiquid > 0 && <span>Liquidado: <strong>{r2(yrLiquid)} €</strong></span>}
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
// Borradores de reserva almacenados en prereservas.json del repo PRIVADO
// (llevan nombre, teléfono e importes: PII, jamás en docs/ ni en Pages). El
// botón "→ Reservas" escribe en reservas.json (también privado) y elimina el
// borrador en el mismo flujo.
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
    fetch(`${API}/repos/${PRIVATE_REPO}/contents/${PRERESERVAS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token) })
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
    const res = await fetch(`${API}/repos/${PRIVATE_REPO}/contents/${PRERESERVAS_PATH}`, {
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
      // 4a-bis. Publicar PINs de acceso a la guía de las reservas activas
      _syncReservasToGuestPins(updated.reservas, token).catch(() => {});
      // 4b. Borrar de prereservas
      const newItems = items.filter(r => r.id !== pr.id);
      const newSha = await saveList(newItems, sha);
      setItems(newItems); setSha(newSha);
      setIsErr(false); setMsg(`✓ ${pr.responsable} añadida a Reservas.`);
    } catch(e) { setIsErr(true); setMsg(e.message); }
    finally { setSyncing(null); }
  };

  const noches = (pr) => pr.entrada && pr.salida
    ? Math.round((new Date(pr.salida) - new Date(pr.entrada)) / 86400000) : '–';

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
                <input type="date" className="pe-input" value={form.entrada} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, entrada: v, salida: (f.salida && f.salida > v) ? f.salida : addDaysIso(v, 7) })); }} />
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
                  <td>{pr.reserva ? fmtEur(pr.reserva) : '–'}</td>
                  <td className="pe-hint">{pr.canal||'–'}</td>
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

// Enlace de registro de viajeros para una reserva, con los datos que ya
// conocemos prerrellenados (Viajero 1). El huésped puede editarlos. Los datos
// personales van en el enlace (que envías en privado); registro.html no los
// filtra a terceros (no-referrer) y limpia la URL al abrirse.
function buildRegistroLink(r) {
  const parts = String(r.responsable || '').trim().split(/\s+/).filter(Boolean);
  const n = parts[0] || '';
  const s1 = parts.slice(1).join(' ');
  const rnd = Math.random().toString(36).slice(2, 7);
  const tok = `${r.apt || 'web'}-${(r.entrada || '').replace(/-/g, '')}-${rnd}`;
  const q = new URLSearchParams({ r: tok });
  if (r.apt) q.set('apt', r.apt);
  if (n) q.set('n', n);
  if (s1) q.set('s1', s1);
  if (r.telefono) q.set('tel', r.telefono);
  if (r.email) q.set('em', r.email);
  if (r.huespedes) q.set('hu', r.huespedes);   // deja ya creadas las fichas de los acompañantes
  return `https://www.hestiayourhome.com/registro.html?${q.toString()}`;
}
const RegLinkButton = ({ draft }) => {
  const [msg, setMsg] = React.useState(null);
  const copy = async () => {
    const link = buildRegistroLink(draft);
    try { await navigator.clipboard.writeText(link); setMsg('¡Copiado!'); setTimeout(() => setMsg(null), 3000); }
    catch (_) { window.prompt('Copia el enlace de registro:', link); }
  };
  return (
    <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn"
      title="Copiar el enlace de registro de viajeros con los datos de la reserva ya rellenos"
      onClick={copy}>
      <HiIcon name="shield" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />{msg || 'Enlace registro'}
    </button>
  );
};

// Enlace de ACCESO por reserva: abre la guía sin PIN y prerrellena el registro.
// Usa un token largo (alta entropía) y guarda el prefill cifrado en el Worker;
// como el token no es adivinable, la lectura del prefill es segura.
const SLUG_BY_APT = { vm: 'mar', vt: 'thalassa', vs: 'salinas' };
const AccessLinkButton = ({ draft }) => {
  const [msg, setMsg] = React.useState(null);
  const gen = async () => {
    if (TRAVELER_WORKER_URL.includes('SUSTITUIR')) { setMsg('Falta desplegar el Worker'); setTimeout(() => setMsg(null), 3500); return; }
    const apt = (draft.apt || '').toLowerCase();
    const slug = SLUG_BY_APT[apt] || 'mar';
    let secret = _regReadSecret;
    if (!secret) { secret = (window.prompt('Secreto de lectura del Worker de registro (READ_SECRET):') || '').trim(); _regReadSecret = secret; }
    if (!secret) return;
    const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID().replace(/-/g, '')
      : (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z0-9]/g, '');
    const token = `${apt}-${(draft.entrada || '').replace(/-/g, '')}-${rnd.slice(0, 24)}`;
    const parts = String(draft.responsable || '').trim().split(/\s+/).filter(Boolean);
    // Aprovecha TODO lo que ya sabemos de la reserva, para que el huésped
    // tenga que escribir lo mínimo posible: documento y dirección incluidos
    // (viajan cifrados al Worker, nunca en la URL).
    const prefill = {
      nombre: parts[0] || '', apellido1: parts.slice(1).join(' '), apellido2: '',
      telefono: draft.telefono || '', email: draft.email || '',
      numDoc: draft.dni || '', direccion: draft.direccion || '',
      huespedes: draft.huespedes || '', apt,
    };
    setMsg('Guardando…');
    try {
      const r = await fetch(`${TRAVELER_WORKER_URL}/prefill`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: secret, token, prefill }),
      });
      if (r.status === 401) throw new Error('secreto incorrecto');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const link = `https://www.hestiayourhome.com/${slug}.html?acceso=${token}`;
      try { await navigator.clipboard.writeText(link); setMsg('¡Copiado!'); setTimeout(() => setMsg(null), 3000); }
      catch (_) { window.prompt('Copia el enlace de acceso:', link); setMsg(null); }
    } catch (e) { setMsg('Error: ' + e.message); setTimeout(() => setMsg(null), 4000); }
  };
  return (
    <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn"
      title="Copiar el enlace de acceso: abre la guía sin PIN y prerrellena el registro de viajeros"
      onClick={gen}>
      <HiIcon name="key" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />{msg || 'Enlace acceso'}
    </button>
  );
};

// Línea de ocupación CONTINUA: una tira de días que se desplaza a izquierda y
// derecha sin cortarse por mes. Los meses se marcan en la cabecera. Una fila
// por Hestía; cada reserva es una barra del día de entrada al de salida
// (salida exclusiva: la noche de salida ya queda libre). Huecos = días libres.
const OCUP_APTS = ['vm', 'vt', 'vs'];
const MES_LARGO_OCUP = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MES_CORTO_OCUP = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const OCUP_DAYW = 30; // px por día en la tira continua
const DOW_INITIAL_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']; // índice = getUTCDay() (0=domingo)
const _dOnly = (s) => String(s || '').slice(0, 10);
const _dayMon = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(_dOnly(s)); return m ? `${+m[3]} ${MES_CORTO_OCUP[+m[2] - 1]}` : '–'; };
// Utilidades de fecha en UTC sobre cadenas 'YYYY-MM-DD' (sin líos de zona).
const _isoAdd = (iso, d) => { const t = new Date(iso + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10); };
const _firstOfMonth = (iso) => iso.slice(0, 7) + '-01';
const _lastOfMonth = (iso) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7), 0)).toISOString().slice(0, 10);
const _monthShift = (iso, n) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1 + n, 1)).toISOString().slice(0, 10);
const _daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

const OccupancyTimeline = ({ reservas, today, onOpen }) => {
  const scrollRef = React.useRef(null);
  const active = (reservas || []).filter(r => reservaStatus(r, today) !== 'cancelada' && r.entrada && r.salida);

  // Rango continuo: cubre todas las reservas más una ventana alrededor de hoy.
  let minD = today, maxD = today;
  active.forEach(r => { const i = _dOnly(r.entrada), o = _dOnly(r.salida); if (i < minD) minD = i; if (o > maxD) maxD = o; });
  const winBack = _monthShift(today, -1);
  const winFwd = _lastOfMonth(_monthShift(today, 3));
  const rangeStart = _firstOfMonth(winBack < minD ? winBack : minD);
  const rangeEnd = _lastOfMonth(winFwd > maxD ? winFwd : maxD);
  const N = _daysBetween(rangeStart, rangeEnd) + 1;
  const idxOf = (iso) => _daysBetween(rangeStart, iso);
  const dayIso = (i) => _isoAdd(rangeStart, i);
  const todayIdx = (today >= rangeStart && today <= rangeEnd) ? idxOf(today) : -1;

  const months = [];
  { let m = _firstOfMonth(rangeStart);
    while (m <= rangeEnd) {
      months.push({ label: `${MES_LARGO_OCUP[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}`, s: Math.max(0, idxOf(m)), e: Math.min(N, idxOf(_lastOfMonth(m)) + 1) });
      m = _monthShift(m, 1);
    }
  }

  const isWe = (iso) => { const w = new Date(iso + 'T00:00:00Z').getUTCDay(); return w === 0 || w === 6; };

  const barsFor = (apt) => active
    .filter(r => (r.apt || '').toLowerCase() === apt)
    .filter(r => _dOnly(r.entrada) <= rangeEnd && _dOnly(r.salida) > rangeStart)
    .map(r => ({
      r,
      s: Math.max(0, idxOf(_dOnly(r.entrada))),
      e: Math.min(N, idxOf(_dOnly(r.salida))),   // salida exclusiva
      contL: _dOnly(r.entrada) < rangeStart,
      contR: _dOnly(r.salida) > _isoAdd(rangeEnd, 1),
    }));

  // Estado de hoy por apartamento, con el huésped si está ocupado (fusiona lo
  // que antes era la sección aparte "En Hestía ahora mismo").
  const statusToday = (apt) => {
    const rs = active.filter(r => (r.apt || '').toLowerCase() === apt);
    const cur = rs.find(r => _dOnly(r.entrada) <= today && _dOnly(r.salida) > today);
    if (cur) return { occ: true, r: cur, txt: `${cur.responsable || 'ocupado'} · sale ${_dayMon(cur.salida)}` };
    const next = rs.filter(r => _dOnly(r.entrada) > today).sort((a, b) => _dOnly(a.entrada).localeCompare(_dOnly(b.entrada)))[0];
    return { occ: false, txt: next ? `libre · entra ${_dayMon(next.entrada)}` : 'libre' };
  };

  const scrollToToday = (behavior) => {
    const el = scrollRef.current;
    if (el && todayIdx >= 0) el.scrollTo({ left: Math.max(0, todayIdx * OCUP_DAYW - 100), behavior: behavior || 'auto' });
  };
  React.useEffect(() => { scrollToToday('auto'); }, []);   // al montar, empezar en hoy
  const nudge = (dir) => { const el = scrollRef.current; if (el) el.scrollBy({ left: dir * OCUP_DAYW * 14, behavior: 'smooth' }); };

  const dayIdxs = Array.from({ length: N }, (_, i) => i);

  return (
    <div className="rv-ocup">
      <div className="rv-ocup-hd">
        <h3><HiIcon name="cal" size={16} className="pe-h-ic" /> Ocupación</h3>
        <div className="rv-ocup-nav">
          <button type="button" onClick={() => nudge(-1)} aria-label="Desplazar a la izquierda">‹</button>
          <button type="button" onClick={() => scrollToToday('smooth')}>hoy</button>
          <button type="button" onClick={() => nudge(1)} aria-label="Desplazar a la derecha">›</button>
        </div>
      </div>
      <div className="rv-ocup-today">
        {OCUP_APTS.map(apt => {
          const s = statusToday(apt);
          return (
            <span key={apt}
              className={`rv-ocup-pill${s.occ ? ' occ' : ' free'}${s.occ ? ' clickable' : ''}`}
              style={{ '--apt-c': APT_COLOR[apt] }}
              onClick={s.occ ? () => onOpen && onOpen(s.r) : undefined}
              title={s.occ ? 'Abrir la reserva de quien está alojado' : undefined}>
              <span className="rv-ocup-dot" style={{ background: APT_COLOR[apt] }} />
              <b>{APT_NAMES[apt]}</b> · {s.txt}
            </span>
          );
        })}
      </div>
      <div className="rv-ocup-scroll" ref={scrollRef}>
        <div className="rv-ocup-grid" style={{ '--n': N, '--dayw': OCUP_DAYW + 'px' }}>
          <div className="rv-ocup-months">
            <div className="rv-ocup-corner" />
            {months.map((mm, i) => (
              <div key={i} className="rv-ocup-mcell" style={{ gridColumn: `${mm.s + 2} / ${mm.e + 2}` }}><span>{mm.label}</span></div>
            ))}
          </div>
          <div className="rv-ocup-axis">
            <div className="rv-ocup-corner" />
            {dayIdxs.map(i => {
              const iso = dayIso(i);
              const dow = new Date(iso + 'T00:00:00Z').getUTCDay();
              return (
                <div key={i} className={`rv-ocup-d${isWe(iso) ? ' we' : ''}${i === todayIdx ? ' today' : ''}`}>
                  <span className="rv-ocup-dow">{DOW_INITIAL_ES[dow]}</span>{+iso.slice(8, 10)}
                </div>
              );
            })}
          </div>
          {OCUP_APTS.map(apt => (
            <div key={apt} className="rv-ocup-row">
              <div className="rv-ocup-lbl"><span className="rv-apt-chip" style={{ background: APT_COLOR[apt], color: APT_TEXT[apt] }}>{APT_NAMES[apt]}</span></div>
              {dayIdxs.map(i => {
                const iso = dayIso(i);
                return <div key={i} className={`rv-ocup-cell${isWe(iso) ? ' we' : ''}${i === todayIdx ? ' today' : ''}`} style={{ gridColumn: `${i + 2} / ${i + 3}`, gridRow: 1 }} />;
              })}
              {barsFor(apt).map((b, i) => (
                <button type="button" key={i}
                  className={`rv-ocup-bar${_dOnly(b.r.salida) <= today ? ' past' : ''}${b.contL ? ' cont-l' : ''}${b.contR ? ' cont-r' : ''}`}
                  style={{ gridColumn: `${b.s + 2} / ${b.e + 2}`, gridRow: 1, background: APT_COLOR[apt], color: APT_TEXT[apt] }}
                  title={`${b.r.responsable || 'Sin nombre'} · ${_dayMon(b.r.entrada)} → ${_dayMon(b.r.salida)} · ${b.r.canal || ''}`}
                  onClick={() => onOpen && onOpen(b.r)}>
                  <span>{b.r.responsable || 'Sin nombre'}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="rv-ocup-legend">
        {OCUP_APTS.map(apt => <span key={apt} className="k"><span className="sw" style={{ background: APT_COLOR[apt] }} />{APT_NAMES[apt]}</span>)}
        <span className="k"><span className="sw free" />Libre (reservable)</span>
        <span className="rv-ocup-legend-hint">Arrastra o usa ‹ › para moverte. Pulsa una barra para abrir la reserva.</span>
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
  // Meses ya pasados que el usuario ha desplegado a mano (por clave "YYYY-MM").
  // Por defecto los meses anteriores al actual salen plegados: así se llega
  // antes a las reservas de este mes en adelante.
  const [openPastMonths,    setOpenPastMonths]    = React.useState({});

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
    .catch(e => setError('Error cargando reservas: ' + e.message + ', F12 para detalle.'))
    .finally(() => setLoading(false));
  }, [token]);

  // Detecta bloques iCal sin reserva correspondiente en P-Edit.
  // Se ejecuta tras cargar las reservas, comparando availability.json (ical[]) contra reservas[].
  // El propio sync (sync_ical.py) mezcla dentro de "ical" tanto los bloqueos reales de
  // Airbnb/Booking como VUESTROS bloqueos manuales (pestaña Bloqueos, prices.json
  // manual_blocks): un bloqueo manual nunca va a tener una "reserva" de huésped detrás
  // porque es intencional (uso propio, obras, etc.), así que hay que descartarlo aquí
  // o el aviso avisa para siempre de algo que ya está atendido.
  React.useEffect(() => {
    if (!data) return;
    const reservas = (data.reservas || []);
    const today = new Date().toISOString().slice(0, 10);
    const _cxl = r => r.cancelada === true || (r.cancelacion || '').trim().toUpperCase() === 'CANCELADA';
    Promise.all([
      fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('data/prices.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ])
      .then(([avail, prices]) => {
        if (!avail) return;
        const manualBlocks = (prices && prices.manual_blocks) || {};
        const APT_LABEL = { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas' };
        const found = [];
        for (const apt of ['vm', 'vt', 'vs']) {
          const aptManual = manualBlocks[apt] || [];
          for (const block of (avail[apt]?.ical || [])) {
            if (block.end <= today) continue;
            const match = reservas.find(r =>
              !_cxl(r) && (r.apt || '').toLowerCase() === apt &&
              r.entrada < block.end && r.salida > block.start
            );
            if (match) continue;
            const manualMatch = aptManual.find(b =>
              b.start && b.end && b.start < block.end && b.end > block.start
            );
            if (manualMatch) continue;
            found.push({ apt, label: APT_LABEL[apt], start: block.start, end: block.end });
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
      setSyncMsg('Sync con Google Sheets no configurado, ver SETUP-SHEETS-SYNC.md');
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

  if (loading)              return <div className="pe-card"><h2><HiIcon name="cal" size={20} className="pe-h-ic" /> Reservas</h2><p>Cargando…</p></div>;
  if (!data && error)       return <div className="pe-error">{error}</div>;
  if (!data)                return <div className="pe-card"><h2><HiIcon name="cal" size={20} className="pe-h-ic" /> Reservas</h2><p className="pe-help">Esperando autenticación…</p></div>;

  const reservas = (data && data.reservas) || [];
  const today    = new Date().toISOString().slice(0, 10);

  // --- Agrupación por año. Usamos r.year (calculado por el parser
  // a partir de la fecha de SALIDA, criterio contable de Hestía).
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
  // Meses con actividad: no solo el de entrada, también aquellos en los que una
  // reserva tiene noches (para que un mes "intermedio" de una estancia larga
  // aparezca y reciba su parte prorrateada del importe).
  const allMonths = (() => {
    const set = new Set();
    focusList.forEach(r => {
      const em = (r.entrada || '').slice(5, 7);
      if (em) set.add(em);
      const nm = nightsByMonth(r.entrada, r.salida);
      Object.keys(nm).forEach(k => { if (k.slice(0, 4) === focusYear) set.add(k.slice(5, 7)); });
    });
    return [...set].sort();
  })();
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

  // --- Próximas (en todos los años, son atemporales) ---
  const proximas = reservas.filter(r => {
    if (reservaStatus(r, today) !== 'upcoming') return false;
    const diff = (new Date(r.entrada) - new Date(today)) / 86400000;
    return diff <= 30;
  }).sort((a, b) => a.entrada.localeCompare(b.entrada));

  // Checkouts recientes (salieron hace ≤14 días): candidatos a pedirles reseña.
  // reviewReqDismissed: la petición se descarta (ya se pidió a mano, o no
  // procede) sin tocar la reserva en sí; se guarda en la propia reserva para
  // que no reaparezca en otro dispositivo/sesión.
  const recienCheckout = reservas.filter(r => {
    if (r.reviewReqDismissed) return false;
    if (reservaStatus(r, today) !== 'past') return false;
    const days = (new Date(today) - new Date(r.salida)) / 86400000;
    return days >= 0 && days <= 14;
  }).sort((a, b) => (b.salida || '').localeCompare(a.salida || ''));

  const dismissReviewReq = (r) => {
    const idx = reservas.findIndex(x => x.id === r.id);
    if (idx < 0) return;
    const nr = [...reservas];
    nr[idx] = { ...nr[idx], reviewReqDismissed: true };
    saveReservas(nr);
  };

  // WhatsApp AL HUÉSPED: mensaje de traspaso (Alex → Fran) para la llegada.
  // Se usa en las reservas a <30 días. Devuelve null si no hay teléfono.
  const buildGuestWALink = (r) => {
    const tel = String(r.telefono || '').replace(/\D/g, '');
    if (!tel) return null;
    const phone = tel.length === 9 ? '34' + tel : tel;   // añade prefijo ES si falta
    const nombre = String(r.responsable || '').trim().split(/\s+/)[0] || '';
    const msg = [
      `Buenos días${nombre ? ', ' + nombre : ''}.`,
      'A partir de ahora se pondrá en contacto con vosotros mi compañero Fran. Él os dará información de todo lo que necesitéis, dudas, vuestra llegada y recepción, nuestra guía, recomendaciones de la zona... Todo hasta vuestra salida de Hestía.',
      '',
      'De todas formas yo sigo por aquí... 🙂',
      'Saludos y gracias por todo.',
      'Hestía - Más que un alquiler, ¡tu hogar!',
    ].join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // WhatsApp AL HUÉSPED · Mensaje 1: bienvenida de Fran + código de acceso a la
  // guía. El PIN sale de reservaGuidePin(r) (estable, no se regenera al editar).
  const buildGuestMsg1Link = (r) => {
    const tel = String(r.telefono || '').replace(/\D/g, '');
    if (!tel) return null;
    const phone = tel.length === 9 ? '34' + tel : tel;
    const nombre = String(r.responsable || '').trim().split(/\s+/)[0] || '';
    const pin = reservaGuidePin(r);
    const msg = [
      `Buenas tardes${nombre ? ', ' + nombre : ''}.`,
      'Soy Fran Moral, copropietario de Hestía Vera, junto con Alejandro. ¡Bienvenidos! 😃 ¿Qué tal todo? Esperamos que estéis de maravilla. 😊',
      'A partir de ahora estaré a vuestra disposición para todo lo que necesitéis, tanto para preparar vuestro viaje como durante vuestra estancia.',
      'Así que, como ya os habrá dicho Alejandro, para contribuir a ello os envío el código de acceso a vuestra cuenta de huéspedes, dentro de nuestra web, donde tendréis toda la información sobre vuestro hogar en Vera, así como todas las recomendaciones de la zona. 😊',
      `*${pin}*`,
      'Cuando se acerque el momento de vuestra llegada os enviaré el resto de informaciones necesarias para llegar a Hestía.',
      'Mientras tanto, cualquier cosa que necesitéis, por favor, no dudéis en preguntarme.',
      'Que paséis buen día. 😃 ☀️',
    ].join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Ficha de Google de cada Hestía (donde el huésped deja la reseña). Mismas
  // URLs que el sameAs del JSON-LD público. Las reseñas de Google son el canal
  // que más reservas nuevas atrae: por eso el mensaje enlaza directo ahí.
  const REVIEW_PLACE = {
    vm: 'https://maps.app.goo.gl/r6tL6kJK6XHtYsCE7',
    vt: 'https://maps.app.goo.gl/daGi8o2Uh32avqhP6',
    vs: 'https://maps.app.goo.gl/Mi3z2kKjjaDqNLT98',
  };
  // WhatsApp AL HUÉSPED tras la salida: petición de reseña ya compuesta.
  const buildReviewWALink = (r) => {
    const tel = String(r.telefono || '').replace(/\D/g, '');
    if (!tel) return null;
    const phone = tel.length === 9 ? '34' + tel : tel;
    const nombre = String(r.responsable || '').trim().split(/\s+/)[0] || '';
    const apt = (r.apt || '').toLowerCase();
    const link = REVIEW_PLACE[apt] || 'https://www.hestiayourhome.com/opiniones.html';
    const msg = [
      `Hola${nombre ? ', ' + nombre : ''} 😊`,
      `Esperamos que hayáis disfrutado de vuestra estancia en Hestía ${APT_NAMES[apt] || ''}.`,
      'Si lo pasasteis bien, nos ayudaríais muchísimo dejando una reseña. Se hace en un minuto y para nosotros significa mucho:',
      link,
      '¡Gracias por elegirnos! Os esperamos de vuelta. 🌊',
      'Alex y Fran · Hestía',
    ].join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Variante por EMAIL de la petición de reseña, para huéspedes sin teléfono
  // pero con correo (p. ej. algunos Booking). Devuelve null si no hay email.
  const buildReviewMailto = (r) => {
    const email = String(r.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    const nombre = String(r.responsable || '').trim().split(/\s+/)[0] || '';
    const apt = (r.apt || '').toLowerCase();
    const link = REVIEW_PLACE[apt] || 'https://www.hestiayourhome.com/opiniones.html';
    const subject = `¿Nos dejáis una reseña? · Hestía ${APT_NAMES[apt] || ''}`;
    const body = [
      `Hola${nombre ? ', ' + nombre : ''}:`,
      '',
      `Esperamos que hayáis disfrutado de vuestra estancia en Hestía ${APT_NAMES[apt] || ''}.`,
      'Si lo pasasteis bien, nos ayudaríais muchísimo dejando una reseña. Se hace en un minuto y para nosotros significa mucho:',
      link,
      '',
      '¡Gracias por elegirnos! Os esperamos de vuelta.',
      'Alex y Fran · Hestía',
    ].join('\n');
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    // Recalcula la limpieza (regla 80/90) en TODAS las reservas y la comisión
    // en las de OTA. Persiste los valores para que BAI y ficha queden al día.
    const updated = (data.reservas || []).map(r => {
      const ck = getCanalKey(r.canal);
      const base = { ...r, _limpieza_manual: false };
      if (ck === 'booking' || ck === 'airbnb') base._comision_manual = false;
      return calcDerived(base);
    });
    await saveReservas(updated, { keepPanelOpen: true });
    setSuccess('Comisiones y limpieza recalculadas y guardadas ✓');
  };

  // Publica los PINs de acceso a la guía de todas las reservas activas.
  // Normalmente se hace solo al guardar; este botón fuerza la sincronización
  // (útil para poblar reservas ya existentes la primera vez).
  const syncGuidePins = async () => {
    if (!data) return;
    setError(null); setSuccess(null);
    try {
      const changed = await _syncReservasToGuestPins(data.reservas || [], token);
      setSuccess(changed ? 'PINs de acceso a la guía sincronizados ✓' : 'Los PINs de la guía ya estaban al día ✓');
    } catch (e) { setError('Error sincronizando PINs de la guía: ' + e.message); }
  };

  // --- Acciones ---
  const saveReservas = async (newReservas, { keepPanelOpen = false } = {}) => {
    setError(null); setSuccess(null);
    const prevData = data;
    // Toda reserva lleva un id inmutable. Si no lo tiene (reservas antiguas), se
    // asigna aquí una sola vez: así el PIN de la guía deja de regenerarse al
    // editar fechas o datos del huésped (el id es su semilla estable).
    newReservas = (newReservas || []).map(r => (r && r.id) ? r : { ...r, id: _stableResId() });
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
      // Publica/revoca los PINs de la guía. A diferencia del sync de
      // disponibilidad, un fallo aquí es un problema de seguridad real (un
      // huésped con la reserva cancelada podría conservar el acceso a la
      // guía): si falla, se avisa en vez de tragárselo en silencio como
      // antes.
      _syncReservasToGuestPins(newReservasList, token).catch(e => {
        setError('⚠ Reserva guardada, pero el PIN de la guía no se pudo sincronizar: ' + e.message + '. Pulsa "Sincronizar PINs" para reintentarlo.');
      });
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
      apt: 'vm', responsable: '', telefono: null, email: '', dni: '', direccion: '', huespedes: 2,
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
      // Al cambiar canal, resetear override de comisión, calcDerived la recalcula.
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

  const saveDraft = (override) => {
    // override solo es una reserva (la del botón de contrato). Si llega un evento
    // de click (onClick={saveDraft}) lo ignoramos y usamos el draft actual.
    const d = (override && override.apt !== undefined) ? override : draft;
    if (!d) return;
    const cleaned = calcDerived(d);
    const overlap = findOverlap(cleaned, selectedIdx >= 0 && selectedIdx < reservas.length ? selectedIdx : -1);
    if (overlap) {
      setError(`Solape de fechas: la reserva de ${overlap.responsable || '–'} (${fmtDate(overlap.entrada)} → ${fmtDate(overlap.salida)}) en ${overlap.apt?.toUpperCase() || '–'} se superpone con estas fechas. Corrige antes de guardar.`);
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
          <h2><HiIcon name="cal" size={20} className="pe-h-ic" /> Reservas <span className="rv-count">· año {focusYear} · {kFocus.reservas} reservas · actualizado {data.updatedAt ? data.updatedAt.slice(0,10) : '–'}</span></h2>
          <div className="rv-head-actions">
            <button type="button" className="pe-btn pe-btn-ghost" onClick={loadData} disabled={loading}>
              {loading ? 'Recargando…' : 'Recargar'}
            </button>
            {loadedAt && <span className="leila-loaded-at">Actualizado {loadedAt}</span>}
            <button type="button" className="pe-btn pe-btn-ghost" onClick={() => data && exportReservasExcel(focusList, focusYear)} disabled={!data}>
              Exportar Excel
            </button>
            <button type="button" className="pe-btn pe-btn-ghost" onClick={recalcularComisiones} disabled={!data || loading} title="Recalcula la limpieza (80/90 €) en todas las reservas y las comisiones OTA (Booking 23.3%, Airbnb 18.755%), y las guarda">
              Recalcular comisiones y limpieza
            </button>
            <button type="button" className="pe-btn pe-btn-ghost" onClick={syncGuidePins} disabled={!data || loading} title="Publica en la guía los PINs de acceso de las reservas activas (se hace solo al guardar; esto fuerza la sincronización)">
              🔑 Sincronizar accesos
            </button>
            <button type="button" className="pe-btn pe-btn-primary" onClick={newRow}>+ Nueva</button>
          </div>
        </div>

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

        {/* ───── Alerta discrepancias iCal ──────────────────────────────────
            Bloques bloqueados en Airbnb/Booking sin reserva en P-Edit.
            Puede indicar una reserva OTA no registrada manualmente. */}
        {icalDiscrepancies.length > 0 && (
          <div className="pe-card rv-discrepancy-banner">
            <div className="rv-discrepancy-head" onClick={() => setDiscrepanciesOpen(o => !o)} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <span><HiIcon name="alert" size={15} style={{verticalAlign:'-2px'}} /></span>
              <strong>{icalDiscrepancies.length} bloque{icalDiscrepancies.length !== 1 ? 's' : ''} del iCal sin reserva en P-Edit</strong>
              <span style={{ marginLeft:'auto', opacity:.6, fontSize:12 }}>{discrepanciesOpen ? '▲ Ocultar' : '▼ Ver'}</span>
            </div>
            {discrepanciesOpen && (
              <ul className="rv-discrepancy-list">
                {icalDiscrepancies.map((d, i) => (
                  <li key={i}>
                    <strong>{d.label}</strong>: {d.start} → {d.end}
                    <span className="rv-discrepancy-note">, bloqueado en Airbnb/Booking pero sin reserva registrada en P-Edit</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="rv-discrepancy-hint">Si la reserva ya está registrada con fechas ligeramente distintas, puedes ignorar esto. Si no lo está, crea la reserva para evitar solapamientos.</p>
          </div>
        )}

        {/* El "Histórico por año" se movió a la pestaña Inteligencia (junto a los
            gráficos anuales). El año del listado se elige en el filtro "Año". */}

        {/* ───── Vista mensual de ocupación ───── */}
        <OccupancyTimeline reservas={reservas} today={today} onOpen={r => openRow(reservas.indexOf(r))} />

        {/* ───── KPIs del año focal ───── */}
        <div className="rv-dashboard">
          <KpiCard label={`Reservas ${focusYear}`} value={kFocus.reservas} sub={`${kFocus.noches} noches`} />
          <KpiCard label="Bruto" accent="#B86A3C" value={fmtEur(kFocus.bruto)} sub={`${fmtEur(kFocus.brutoPorNoche)}/noche medio`} />
          <KpiCard label="Comisiones" accent="#D4A84A" value={fmtEur(kFocus.comision)} sub={kFocus.bruto ? `${fmtPct(kFocus.comisionPct)} del bruto` : null} />
          <KpiCard label="Limpieza" value={fmtEur(kFocus.limpieza)} sub={kFocus.bruto ? `${fmtPct(kFocus.limpieza/kFocus.bruto)} del bruto` : null} />
          <KpiCard label="Neto (BAI)" accent="#6B7A3A" value={fmtEur(kFocus.neto)} sub={`${fmtEur(kFocus.netoPorNoche)}/noche neto`} />
          <KpiCard label="Rentabilidad" accent="#6B7A3A" value={fmtPct(kFocus.rentabilidad)} sub="neto / bruto" />
          <KpiCard label="€/noche mín" value={kFocus.minNoche ? fmtEur(kFocus.minNoche) : '–'} sub="reserva más barata" />
          <KpiCard label="€/noche máx" value={kFocus.maxNoche ? fmtEur(kFocus.maxNoche) : '–'} sub="reserva más cara" />
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

        {/* "En Hestía ahora mismo" se fusionó con las píldoras de estado de hoy
            de la sección Ocupación (muestran el huésped alojado). */}

        {/* ───── Alertas ≤30 días ───── */}
        {proximas.length > 0 && (
          <div className="rv-now rv-banner-upcoming rv-banner-alert">
            <h3><HiIcon name="alert" size={18} className="pe-h-ic" /> Reservas en menos de 30 días · {proximas.length}</h3>
            <ul>
              {proximas.map((r, i) => {
                const dias = Math.round((new Date(r.entrada) - new Date(today)) / 86400000);
                const llega = dias <= 0 ? 'Llega hoy' : dias === 1 ? 'Llega mañana' : `Llega en ${dias} días`;
                // Mensajes de WhatsApp al huésped. Para añadir Mensaje 2 y 3 en el
                // futuro, basta con crear su builder y sumar una entrada aquí.
                const mensajes = [
                  { n: 0, href: buildGuestWALink(r),     desc: 'traspaso a Fran' },
                  { n: 1, href: buildGuestMsg1Link(r),   desc: 'bienvenida + código de acceso a la guía' },
                ];
                const hayTel = mensajes.some(m => m.href);
                return (
                  <li key={i} className="rv-prox-card" data-apt={r.apt} style={{'--apt-c': APT_COLOR[r.apt] || 'var(--ber)'}}>
                    <div className="rv-prox-top">
                      <span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt]}</span>
                      <button type="button" className="rv-prox-guest rv-prox-guest-link" onClick={() => openRow(reservas.indexOf(r))} title="Ver detalle de la reserva">
                        {r.responsable}{r.mascota ? ' 🐾' : ''}{r.cuna_trona ? ' 👶' : ''}
                      </button>
                      <span className="rv-prox-days-badge">{llega}</span>
                    </div>
                    <div className="rv-prox-stay">
                      <span className="rv-prox-date"><i>Entrada</i> {fmtDate(r.entrada)}</span>
                      <span className="rv-prox-arrow" aria-hidden="true">→</span>
                      <span className="rv-prox-date"><i>Salida</i> {fmtDate(r.salida)}</span>
                      <span className="rv-prox-meta">{r.noches} noches · {r.huespedes} pax · {r.canal}</span>
                    </div>
                    <div className="rv-prox-msgs">
                      <span className="rv-prox-msgs-lbl">Enviar por WhatsApp al huésped</span>
                      {hayTel
                        ? <div className="rv-prox-msgs-btns">
                            {mensajes.filter(m => m.href).map(m => (
                              <a key={m.n} href={m.href} target="_blank" rel="noopener noreferrer"
                                className="rv-wa-btn rv-wa-guest" title={`Mensaje ${m.n}: ${m.desc}`}><HiIcon name="chat" size={13} style={{verticalAlign:'-2px',marginRight:4}} />M{m.n}</a>
                            ))}
                          </div>
                        : <span className="rv-wa-btn rv-wa-disabled" title="No hay teléfono del huésped en esta reserva">Sin teléfono en la ficha</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ───── Pídeles reseña · checkouts recientes ───── */}
        {recienCheckout.length > 0 && (
          <div className="rv-rev">
            <h3><HiIcon name="star-fill" size={16} className="pe-h-ic" /> Pídeles reseña · salieron hace poco · {recienCheckout.length}</h3>
            <ul>
              {recienCheckout.map((r, i) => {
                const wa = buildReviewWALink(r);
                const mail = buildReviewMailto(r);
                return (
                  <li key={i}>
                    <span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt]}</span>
                    <strong>{r.responsable}</strong>
                    <span className="rv-rev-meta">salió {fmtDate(r.salida)} · {r.canal}</span>
                    {wa
                      ? <a href={wa} target="_blank" rel="noopener noreferrer" className="rv-wa-btn rv-wa-guest rv-rev-btn"><HiIcon name="star-fill" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Pedir reseña</a>
                      : mail
                        ? <a href={mail} className="rv-wa-btn rv-rev-btn" title="Pedir reseña por email (no hay teléfono)">✉ Pedir reseña</a>
                        : <span className="rv-wa-btn rv-wa-disabled rv-rev-btn" title="No hay teléfono ni email del huésped">Sin contacto</span>}
                    <button type="button" className="rv-rev-dismiss" title="Quitar de esta lista" aria-label={`Quitar petición de reseña de ${r.responsable}`} onClick={() => dismissReviewReq(r)}>×</button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ───── Tablas por mes ───── */}
        {visibleMonths.length === 0 && (
          isHistoricOnly(focusYear)
            ? <p className="pe-help" style={{ marginTop: 16 }}>Año {focusYear}, datos agregados del histórico. No hay fichas individuales registradas en P-Edit para este año. Los resúmenes se muestran en la tabla de arriba.</p>
            : <p className="pe-help" style={{ marginTop: 16 }}>Sin reservas en {focusYear}.</p>
        )}

        {visibleMonths.map(m => {
          const mKey = `${focusYear}-${m}`;
          // Reservas con al menos una noche en este mes (no solo las que entran
          // en él). El importe de cada reserva se prorratea según las noches que
          // caen dentro del mes, en vez de imputarse todo al mes de entrada.
          const mEntries = filtered.map(r => {
            const nm = nightsByMonth(r.entrada, r.salida);
            const totalN = Object.values(nm).reduce((a, b) => a + b, 0);
            const nInMonth = nm[mKey] || 0;
            if (nInMonth <= 0) return null;
            const frac = totalN > 0 ? nInMonth / totalN : 0;
            return { r, nInMonth, totalN, frac, partial: Object.keys(nm).length > 1 };
          }).filter(Boolean);
          if (mEntries.length === 0) return null;
          const pro = (e, key) => (Number(e.r[key]) || 0) * e.frac;
          const mActive  = mEntries.filter(e => !isCancelada(e.r));
          const mBruto   = mActive.reduce((s, e) => s + pro(e, 'ingreso_total'), 0);
          const mComis   = mActive.reduce((s, e) => s + pro(e, 'comision'), 0);
          const mBai     = mActive.reduce((s, e) => s + pro(e, 'bai'), 0);
          const mNoches  = mActive.reduce((s, e) => s + e.nInMonth, 0);
          // Un mes se pliega cuando TODAS sus reservas ya han pasado (nadie
          // alojado ni por llegar). Basta una estancia en curso o futura para
          // que el mes siga abierto. Así el mes en curso se pliega solo cuando
          // ya no queda ninguna reserva viva en él.
          const isPast = !mEntries.some(e => {
            const st = reservaStatus(e.r, today);
            return st === 'staying' || st === 'upcoming';
          });
          const isOpen = !isPast || focusMonth !== 'all' || !!openPastMonths[mKey];
          const toggle = () => setOpenPastMonths(p => ({ ...p, [mKey]: !p[mKey] }));
          return (
            <div key={m} className={`leila-month-block${isPast ? ' rv-month-past' : ''}${isPast && !isOpen ? ' is-collapsed' : ''}`}>
              <div className={`leila-month-hdr${isPast ? ' rv-month-hdr-toggle' : ''}`}
                {...(isPast ? { role: 'button', tabIndex: 0, onClick: toggle,
                  onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } } } : {})}>
                <span className="leila-month-name">
                  {isPast && <span className="rv-month-caret" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>}
                  {MES_FULL[parseInt(m, 10) - 1]} {focusYear}
                  {isPast && !isOpen && <span className="rv-month-past-tag">pasado</span>}
                </span>
                <span className="leila-month-kpis">
                  <span>{mEntries.length} reserva{mEntries.length !== 1 ? 's' : ''}</span>
                  <span>{mNoches} noches</span>
                  <span>Bruto: <strong>{fmtEur(mBruto)}</strong></span>
                  <span>BAI: <strong>{fmtEur(mBai)}</strong></span>
                  <span>{mBruto ? fmtPct(mBai / mBruto) : '–'}</span>
                </span>
              </div>
              {isOpen && <div className="rv-table-wrap">
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
                    {mEntries.map(e => {
                      const r = e.r;
                      const idx = reservas.indexOf(r);
                      const status = reservaStatus(r, today);
                      const cancelada = isCancelada(r);
                      const statusIcon = cancelada ? '✗' : status === 'staying' ? '🏠' : status === 'upcoming' ? '⏰' : status === 'past' ? '✓' : '·';
                      const isSel = idx === selectedIdx;
                      return (
                        <tr key={idx} className={`rv-row rv-row-${status} rv-canal-${getCanalKey(r.canal)}${isSel ? ' is-selected' : ''}${cancelada ? ' rv-row-cancelada' : ''}`}
                          data-apt={r.apt} style={{'--apt-c': APT_COLOR[r.apt] || 'transparent'}}
                          onClick={() => openRow(idx)}>
                          <td className={`rv-status rv-status-${status}`} title={status}><EmojiIcon emoji={statusIcon} size={14} /></td>
                          <td><span className="rv-apt-chip" style={{background: APT_COLOR[r.apt], color: APT_TEXT[r.apt]}}>{APT_NAMES[r.apt] || r.apt}</span></td>
                          <td>{r.responsable}{r.mascota ? ' 🐾' : ''}{r.cuna_trona ? ' 👶' : ''}{e.partial ? <span className="rv-partial-tag" title={`Estancia de ${e.totalN} noches repartida entre varios meses. Aquí se imputan las ${e.nInMonth} de este mes.`}>parcial</span> : ''}</td>
                          <td>{fmtDate(r.entrada)}</td>
                          <td>{fmtDate(r.salida)}</td>
                          <td className="num">{e.partial ? `${e.nInMonth}/${e.totalN}` : (e.nInMonth || r.noches || '–')}</td>
                          <td className="num">{r.huespedes || '–'}</td>
                          <td>{r.canal || '–'}</td>
                          <td className="num">{fmtEur(pro(e, 'ingreso_total'))}</td>
                          <td className="num">{fmtEur(pro(e, 'comision'))}</td>
                          <td className="num">{fmtEur(pro(e, 'bai'))}</td>
                          <td className="num">{fmtPct(r.rentabilidad_pct)}</td>
                          <td className="rv-ical-td" onClick={e => e.stopPropagation()}>
                            <button type="button" className="rv-ical-btn" title="Generar alerta de calendario (.ics)"
                              onClick={() => generateCalendarAlert(r)}><HiIcon name="bell" size={15} style={{verticalAlign:'-2px'}} /></button>
                          </td>
                          <td className="rv-ical-td" onClick={e => e.stopPropagation()}>
                            {r.contrato_pdf && (
                              <button type="button" className="rv-ical-btn" title={r.contrato_pdf}
                                onClick={() => downloadContrato(r.contrato_pdf)}><HiIcon name="doc" size={15} style={{verticalAlign:'-2px'}} /></button>
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
                      <td className="num">{mBruto ? fmtPct(mBai / mBruto) : '–'}</td>
                      <td/><td/>
                    </tr>
                  </tfoot>
                </table>
              </div>}
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
                <div className="rv-field">
                  <label>Email</label>
                  <input type="email" value={draft.email || ''} onChange={e => updateDraft('email', e.target.value)} placeholder="huesped@ejemplo.com" />
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
                      <option value="">–</option>
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
                    <input type="date" value={draft.entrada || ''} onChange={e => { const v = e.target.value; updateDraft('entrada', v); if (v && (!draft.salida || draft.salida <= v)) updateDraft('salida', addDaysIso(v, 7)); }} />
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
                      <option value="">–</option>
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
                      <option value="">–</option>
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
                              {ck === 'booking' ? 'booking: 23.3% (22%+1.3% pagos, sin IVA)' :
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
                    <div><span>Noches</span><strong>{draft.noches || '–'}</strong></div>
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
                      <span className="rv-contrato-fname" title={draft.contrato_pdf}><HiIcon name="clip" size={13} style={{verticalAlign:'-2px',marginRight:4}} />{draft.contrato_pdf}</span>
                      <button type="button" className="pe-btn pe-btn-ghost" onClick={handleContratoDownload}>⬇ Descargar</button>
                      <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                        <HiIcon name="refresh" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Reemplazar
                        <input type="file" accept=".pdf" style={{display:'none'}} onChange={handleContratoUpload}/>
                      </label>
                    </>
                  ) : (
                    <label className="pe-btn pe-btn-ghost" style={{cursor:'pointer'}}>
                      {contratoStatus === 'uploading' ? <><HiIcon name="hourglass" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Subiendo…</> : <><HiIcon name="clip" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Adjuntar contrato firmado</>}
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
                  <HiIcon name="alert" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Solape con {liveOverlap.responsable || '–'} ({fmtDate(liveOverlap.entrada)} → {fmtDate(liveOverlap.salida)}) en {liveOverlap.apt?.toUpperCase() || '–'}
                </div>
              ) : null;
            })()}

            {draft && draft.apt && draft.entrada && draft.salida && !_reservaCxl(draft) && (
              <GuidePinMini pin={reservaGuidePin(draft)} />
            )}

            {draft && draft.apt && draft.entrada && draft.salida && window.PRICES_V2 && getCanalKey(draft.canal) !== 'directo' && draft.entrada > today && (() => {
              const calc = window._calcStay && window._calcStay(draft.entrada, draft.salida, draft.apt, !!draft.mascota, Number(draft.huespedes) || null);
              if (!calc) return null;
              return (
                <div className="rv-direct-price" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', margin:'10px 0', padding:'10px 14px', background:'#eef4fb', border:'1px solid #b9cde0', borderRadius:8 }}>
                  <span style={{ fontSize:12, opacity:.75 }}>Precio si fuera reserva directa:</span>
                  <strong style={{ fontSize:18 }}>{calc.directTotal.toLocaleString('es-ES')} €</strong>
                  <span style={{ fontSize:11, opacity:.6 }}>{calc.nights} noches · con los precios actuales (se actualiza solo si cambian, mientras la reserva sea OTA y futura)</span>
                </div>
              );
            })()}

            <footer className="rv-edit-foot">
              <div className="rv-edit-foot-row1">
                {selectedIdx >= 0 && selectedIdx < reservas.length && (
                  <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn rv-btn-danger" onClick={deleteRow}><HiIcon name="trash" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Borrar</button>
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
                    onClick={() => {
                      const wid = draft.id ? draft : { ...draft, id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'r' + Date.now() + Math.random().toString(36).slice(2) };
                      setDraft(wid); saveDraft(wid); onOpenContract(wid);
                    }}><HiIcon name="doc" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Contrato</button>
                )}
                {draft && <RegLinkButton draft={draft} />}
                {draft && <AccessLinkButton draft={draft} />}
                {selectedIdx >= 0 && selectedIdx < reservas.length && (
                  <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn" onClick={duplicateRow}>Duplicar</button>
                )}
              </div>
              <div className="rv-edit-foot-row2">
                <button type="button" className="pe-btn pe-btn-ghost rv-foot-btn" onClick={cancelDraft}>Cancelar</button>
                <button type="button" className="pe-btn pe-btn-primary rv-foot-btn rv-foot-save" onClick={() => saveDraft()}>Guardar</button>
              </div>
            </footer>
          </aside>
        </>
      )}
    </>
  );
};


// ---------------------------------------------------------------
// HuecosTab, gestión de huecos entre reservas con pricing
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
  const pushGap = (gs, ge) => {
    if (gs >= ge) return;              // overlap or zero gap
    if (ge <= today) return;          // entirely in the past
    if (horizon && gs >= horizon) return;
    const nights = _hcDiff(gs, ge);
    if (nights < 2) return;           // 1-night gaps can't be booked
    gaps.push({ start: gs, end: ge, nights });
  };
  // Disponibilidad antes del primer bloqueo (hoy → primer bloqueo)
  pushGap(today, sorted[0].start);
  // Huecos entre bloqueos consecutivos
  for (let i = 0; i < sorted.length - 1; i++) pushGap(sorted[i].end, sorted[i + 1].start);
  // Disponibilidad abierta tras el último bloqueo, acotada al horizonte de reservas.
  // Sin esto, un apartamento libre de forma indefinida (sin bloqueo posterior) no
  // mostraba ningún hueco, y sus estancias largas quedaban invisibles.
  if (horizon) pushGap(sorted[sorted.length - 1].end, horizon);
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
  { label: 'Alta urgente (<14d)',  icon: '🔥', cfg: { season: 'alta',  minN: '', maxN: '', maxDays: '14', type: 'discount', value: '10', lm: true,  onlyNew: true  } },
  { label: 'Crítica urgente (<7d)', icon: '🚨', cfg: { season: 'critica', minN: '', maxN: '', maxDays: '7', type: 'discount', value: '15', lm: true, onlyNew: true } },
];

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

const _lsBreakdown = (start, end, lsCfg, aptSupp = 0) => {
  const specialFlat  = (lsCfg && lsCfg.specialNightFlat) || 80;
  const easterRanges = (lsCfg && lsCfg.easterRanges) || [];
  const rates        = (lsCfg && lsCfg.monthlyRates) || { baja: 1490, media: 1590, alta: 1850 };
  const supp         = Number(aptSupp) || 0;
  const MO_NAMES = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  const byMonth = {};
  let cur = start;
  while (cur < end) {
    const yr = parseInt(cur.slice(0, 4), 10);
    const mo = parseInt(cur.slice(5, 7), 10);
    if (mo === 7 || mo === 8) return null;
    const monthlyBase = (mo === 6 || mo === 9) ? rates.alta
                      : (mo === 5 || mo === 10) ? rates.media : rates.baja;
    const monthlyRate = (Number(monthlyBase) || 0) + supp;
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
  const mr = lsCfg.monthlyRates || { baja: 1490, media: 1590, alta: 1850 };
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
    const r = lsCfg.monthlyRates || { baja: 1490, media: 1590, alta: 1850 };
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

          {/* BLOQUE 1, Tarifas base por temporada */}
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

          {/* BLOQUE 2, Precio efectivo por apartamento */}
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

          {/* BLOQUE 3, Suplementos por huésped/mascota y Semana Santa */}
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

// ================================================================
// PIN de guía por reserva (derivado de los datos de la reserva)
// El PIN se genera solo: SIGLAS del apartamento + 4 cifras deterministas.
// Las reservas ACTIVAS publican el hash SHA-256 de su PIN en
// prices.json → guestPins[apt] (caducidad = salida). Cancelar o borrar la
// reserva lo quita del set → el acceso a la guía queda revocado.
// ================================================================
const APT_SIGLAS = { vm: 'HVM', vt: 'HVT', vs: 'HVS' };

async function _guidePinSha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// Hash determinista (djb2) → 4 cifras estables desde los datos de la reserva.
function _pinCode4(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return String(h % 10000).padStart(4, '0');
}
// Identificador inmutable de reserva. Se asigna una vez al guardar y NO cambia
// aunque se editen fechas, datos del huésped o localizador: es el ancla del PIN
// de la guía, para que el código que ya tiene el huésped siga siendo válido.
function _stableResId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return 'r_' + crypto.randomUUID();
  } catch (e) {}
  return 'r_' + Math.abs(Date.now() ^ (performance.now ? Math.floor(performance.now() * 1000) : 0)).toString(36) + Math.floor(Math.random() * 1e9).toString(36);
}
// Códigos maestros de administración (propietarios, no caducan). Ningún PIN de
// reserva puede coincidir con ellos: si el generador topa con uno, se salta.
const ADMIN_GUIDE_PINS = new Set(['HVM2016', 'HVT2019', 'HVS2021']);
// PIN visible = SIGLAS + 4 cifras. Mismo dato de reserva → mismo PIN siempre.
const reservaGuidePin = (r) => {
  const apt = (r.apt || '').toLowerCase();
  const sig = APT_SIGLAS[apt] || 'HX';
  // Seed ESTABLE: solo apt + identificador inmutable de la reserva. NO incluye
  // entrada/salida (si el huésped alarga o acorta la estancia, el PIN NO debe
  // cambiar: ya lo tiene) ni datos que se editan. La caducidad (until) sí sigue
  // las fechas actuales, pero eso se decide fuera, en la publicación.
  const seed = `${apt}|${r.id || r.localizador || r.responsable || ''}`;
  let pin, n = 0;
  do {
    pin = sig + _pinCode4(n === 0 ? seed : `${seed}#${n}`);
    n++;
  } while (ADMIN_GUIDE_PINS.has(pin) && n < 50);   // colisión con un código de admin → siguiente
  return pin;
};
const _reservaCxl = (r) => r.cancelada === true || (r.cancelacion || '').trim().toUpperCase() === 'CANCELADA';

// Pastilla compacta del PIN de guía: solo el código y un botón de copiar,
// sin texto explicativo (va todo en el title/aria-label). Ocupa lo mínimo.
const GuidePinMini = ({ pin }) => {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" className="rv-pin-mini" onClick={copy}
      title="PIN de guía del huésped (clic para copiar)"
      aria-label={`PIN de guía del huésped: ${pin}. Clic para copiar.`}>
      <HiIcon name="key" size={13} className="rv-pin-mini-ic" />
      <code>{pin}</code>
      <HiIcon name={copied ? 'check' : 'clip'} size={12} className="rv-pin-mini-ic" />
    </button>
  );
};

// Publica en prices.json → guestPins el hash del PIN de cada reserva ACTIVA
// (no cancelada y con salida futura). Reemplaza el set completo: las reservas
// canceladas o pasadas desaparecen y su PIN deja de validar. Solo escribe si
// hay cambios (no genera commits en balde). Devuelve true si publicó.
const _syncReservasToGuestPins = async (reservas, token) => {
  const today = new Date().toISOString().slice(0, 10);
  const next = { vm: [], vt: [], vs: [] };
  for (const r of (reservas || [])) {
    const apt = (r.apt || '').toLowerCase();
    if (!next[apt] || _reservaCxl(r) || !r.salida || r.salida < today) continue;
    const h = await _guidePinSha256(reservaGuidePin(r));
    // until/ref sin datos personales: fechas de la reserva (ya públicas en availability.json).
    next[apt].push({ h, until: r.salida, ref: r.entrada || '–' });
  }
  // Publica el set en prices.json. Reintenta si el fichero cambió entre la
  // lectura y la escritura: las CI de disponibilidad/ofertas tocan el mismo
  // prices.json, y un conflicto de SHA (409) hacía que el PIN NO se publicara
  // (además el error se tragaba en el guardado), dejando al huésped sin acceso.
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    const rf = await fetch(`${API}/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
    const rfj = await rf.json();
    if (rfj.message) throw new Error(rfj.message);
    const prices = JSON.parse(b64ToUtf8(rfj.content));
    if (JSON.stringify(prices.guestPins || {}) === JSON.stringify(next)) return false;
    prices.guestPins = next;
    const res = await fetch(`${API}/repos/${REPO}/contents/${PATH}`, {
      method: 'PUT',
      headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `chore(guia): sync PINs de acceso desde reservas · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
        content: utf8ToB64(JSON.stringify(prices, null, 2)),
        sha: rfj.sha, branch: BRANCH,
      }),
    });
    if (res.ok) return true;
    const j = await res.json().catch(() => ({}));
    lastErr = new Error(j.message || 'Error');
    // Solo reintenta ante conflicto de SHA; otros errores abortan.
    if (res.status !== 409 && !((j.message || '').includes('does not match'))) break;
  }
  throw lastErr || new Error('No se pudo publicar el PIN de la guía');
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
  const [lsCfgOpen,   setLsCfgOpen  ] = React.useState(true);

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
          {totalProb > 0 && <span className="hc-stat hc-stat-warn">{totalProb} <HiIcon name="alert" size={12} style={{verticalAlign:'-2px'}} /></span>}
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
                  <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 70 }} value={bulkMinN} onChange={e => setBulkMinN(e.target.value)} placeholder="–"/>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Noches máx.</label>
                  <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 70 }} value={bulkMaxN} onChange={e => setBulkMaxN(e.target.value)} placeholder="–"/>
                </div>
                <div className="hc-bulk-field">
                  <label className="hc-lbl">Checkin ≤ Xd</label>
                  <input type="number" min="1" className="pe-input pe-input-num" style={{ width: 70 }} value={bulkMaxDays} onChange={e => setBulkMaxDays(e.target.value)} placeholder="–"/>
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
                  <span className="hc-apt-warn"> · {allAptGaps.filter(g => g.overLim).length} <HiIcon name="alert" size={12} style={{verticalAlign:'-2px'}} /></span>}
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

                      {/* Fila principal, siempre visible */}
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
                          {gap.overLim && <span className="hc-badge hc-badge-warn"><HiIcon name="alert" size={12} style={{verticalAlign:'-2px',marginRight:4}} />&gt;{gap.maxN}n</span>}
                          {gap.override && <span className="hc-badge hc-badge-ov">{_hcOvLabel(gap.override)}</span>}
                          {gap.override && gap.override.minNights && <span className="hc-badge hc-badge-ov">min {gap.override.minNights}n</span>}
                          {gap.override && gap.override.lastMinute && <span className="hc-badge hc-badge-lm">last min.</span>}
                          {gap.override && gap.override.note && <span className="hc-badge hc-badge-note" title={gap.override.note}>nota</span>}
                          {gap.daysUntil >= 0 && gap.daysUntil <= 30 && <span className="hc-badge hc-badge-urgent"><HiIcon name="clock" size={12} style={{verticalAlign:'-2px',marginRight:4}} />{gap.daysUntil}d</span>}
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

          {/* Tarifas base, precio efectivo por apartamento y suplementos, única fuente
              de verdad (editable, lee/escribe prices.json). Sin tabla duplicada aparte. */}
          <LsCfgPanel lsCfg={lsCfg} open={lsCfgOpen} setOpen={setLsCfgOpen} onSave={handleSaveLsCfg} saving={saving}/>

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
                    const bd      = _lsBreakdown(gap.start, gap.end, lsCfg, (lsCfg.aptSupplement || {})[aptId] || 0);
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
const CAT_COLORS_PINS = {
  home:'#2A0F2E', super:'#6B7A3A', restaurant:'#B86A3C', michelin:'#D4A84A',
  bar:'#3AAABB', fish:'#4E7A9A', abasto:'#8A6A2E', pharmacy:'#B82490',
  health:'#B8246E', vet:'#4E8A5A', 'pet-board':'#7A5E8A', physio:'#5A7A8A',
  bodega:'#8A4A2E', coworking:'#4A6A8A', laundry:'#6A8A6A', atm:'#8A7A4A',
  market:'#7A4A2E', sport:'#3A6A8A', trek:'#4A7A3A', nature:'#3A8A5A',
  beach:'#2A8A9E', geo:'#7A4A7A', culture:'#6A4A3A', celiac:'#8A6A4A',
  bookshop:'#4A4A8A', gas:'#8A3A3A', ev:'#3A8A7A',
};

const PinsTab = () => {
  const mapRef       = React.useRef(null);
  const mapInst      = React.useRef(null);
  const markersRef   = React.useRef({});
  const placesRef    = React.useRef([]);
  const originalsRef = React.useRef({});
  const searchActive = React.useRef(null);

  const [changes, setChanges] = React.useState({});
  const [search,  setSearch]  = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState(null);
  const [toast,   setToast]   = React.useState('');
  const [geoBusy, setGeoBusy] = React.useState(false);
  const [geoMsg,  setGeoMsg]  = React.useState('');
  const abortGeo = React.useRef(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // ── Autolocalización por nombre vía OpenStreetMap (Nominatim) ──────────
  // Sesga la búsqueda al área de Vera Playa para que cadenas genéricas
  // (Mercadona, Covirán, farmacias…) caigan en la zona y no en otra ciudad.
  // viewbox = lon_min,lat_max,lon_max,lat_min.
  const VERA_VIEWBOX = '-2.05,37.40,-1.65,37.00';
  const _sleep = ms => new Promise(r => setTimeout(r, ms));

  const geocodeOne = async (name) => {
    const base = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=es';
    const q = encodeURIComponent(`${name}, Vera, Almería, España`);
    const tryUrl = async (url) => {
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!r.ok) return [];
      try { return await r.json(); } catch (_) { return []; }
    };
    // 1) acotado al área (precisión local); 2) sin acotar (pueblos, calas, rutas fuera del box).
    let j = await tryUrl(`${base}&bounded=1&viewbox=${VERA_VIEWBOX}&q=${q}`);
    if (!j.length) j = await tryUrl(`${base}&viewbox=${VERA_VIEWBOX}&q=${q}`);
    if (!j.length) return null;
    const it = j[0];
    return { lat: parseFloat(it.lat), lng: parseFloat(it.lon), display: it.display_name || '', importance: it.importance };
  };

  // Aplica un resultado de geocodificación como cambio pendiente (revisable).
  const applyGeo = (p, res) => {
    const o = originalsRef.current[p.id];
    const dist = mapInst.current ? mapInst.current.distance([o.lat, o.lng], [res.lat, res.lng]) : 9999;
    if (dist <= 25) return 'same';   // ya estaba bien, no ensuciamos la lista
    const doubtful = dist > 2000 || (res.importance != null && res.importance < 0.30);
    markersRef.current[p.id]?.setLatLng([res.lat, res.lng]);
    setChanges(prev => ({ ...prev, [p.id]: { lat: res.lat, lng: res.lng, match: res.display, dist, doubtful } }));
    return doubtful ? 'doubtful' : 'ok';
  };

  const autolocateAll = async () => {
    if (geoBusy) { abortGeo.current = true; return; }   // segundo clic = cancelar
    abortGeo.current = false;
    setGeoBusy(true);
    const places = placesRef.current;
    let moved = 0, doubtful = 0, missing = 0;
    for (let i = 0; i < places.length; i++) {
      if (abortGeo.current) break;
      const p = places[i];
      setGeoMsg(`Localizando ${i + 1}/${places.length} · ${moved} movidos · ${missing} sin encontrar`);
      let res = null;
      try { res = await geocodeOne(p.name); } catch (_) {}
      if (res) { const k = applyGeo(p, res); if (k === 'ok' || k === 'doubtful') moved++; if (k === 'doubtful') doubtful++; }
      else missing++;
      await _sleep(1100);   // política Nominatim: máx 1 petición/segundo
    }
    setGeoBusy(false);
    setGeoMsg('');
    showToast(abortGeo.current
      ? `Cancelado. ${moved} movidos (${doubtful} dudosos), ${missing} sin encontrar.`
      : `Listo: ${moved} movidos · ${doubtful} dudosos a revisar · ${missing} sin encontrar.`);
  };

  const autolocateOne = async (p) => {
    if (geoBusy) return;
    setGeoBusy(true);
    setGeoMsg(`Localizando ${p.name}…`);
    try {
      const res = await geocodeOne(p.name);
      if (!res) showToast(`Sin resultado para "${p.name}"`);
      else {
        const k = applyGeo(p, res);
        if (k === 'same') showToast(`"${p.name}" ya estaba en su sitio`);
        else { mapInst.current?.setView([res.lat, res.lng], 16); showToast(k === 'doubtful' ? `Movido (revisar): ${res.display.slice(0, 50)}` : `Movido: ${res.display.slice(0, 50)}`); }
      }
    } catch (e) { showToast('Error de geocodificación: ' + e.message); }
    setGeoBusy(false);
    setGeoMsg('');
  };

  React.useEffect(() => {
    if (!window.L) { setLoadErr('Leaflet no disponible. Recarga la pagina.'); setLoading(false); return; }
    const L = window.L;

    fetch('data/places.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(places => {
        placesRef.current = places;
        places.forEach(p => { originalsRef.current[p.id] = { lat: p.lat, lng: p.lng }; });
        setLoading(false);

        const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView([37.22, -1.81], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://openstreetmap.org/copyright">OSM</a>', maxZoom: 19,
        }).addTo(map);
        mapInst.current = map;

        places.forEach(p => {
          const col = CAT_COLORS_PINS[p.cat] || '#3AAABB';
          const icon = L.divIcon({
            className: '',
            html: `<svg width="18" height="18"><circle cx="9" cy="9" r="7" fill="${col}" stroke="#fff" stroke-width="2"/></svg>`,
            iconSize: [18, 18], iconAnchor: [9, 9],
          });
          const m = L.marker([p.lat, p.lng], { icon, draggable: true, title: p.name })
            .bindTooltip(p.name, { direction: 'top', offset: [0, -9] })
            .addTo(map);
          m.on('dragend', () => {
            const ll  = m.getLatLng();
            const o   = originalsRef.current[p.id];
            const dist = map.distance([o.lat, o.lng], [ll.lat, ll.lng]);
            if (dist < 20) {
              m.setLatLng([o.lat, o.lng]);
              setChanges(prev => { const n = { ...prev }; delete n[p.id]; return n; });
            } else {
              setChanges(prev => ({ ...prev, [p.id]: { lat: ll.lat, lng: ll.lng } }));
            }
          });
          markersRef.current[p.id] = m;
        });
      })
      .catch(e => { setLoadErr('Error cargando places.json: ' + e.message); setLoading(false); });

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
      markersRef.current = {};
    };
  }, []);

  React.useEffect(() => {
    if (!search.trim() || !mapInst.current) return;
    const q = search.toLowerCase().trim();
    if (searchActive.current) markersRef.current[searchActive.current]?.closeTooltip();
    const found = placesRef.current.find(p => p.name.toLowerCase().includes(q) || p.id.includes(q));
    if (found) {
      const m = markersRef.current[found.id];
      if (m) { mapInst.current.setView(m.getLatLng(), 16); m.openTooltip(); searchActive.current = found.id; }
    }
  }, [search]);

  const exportJson = () => {
    const ids = Object.keys(changes);
    if (!ids.length) { showToast('Sin cambios que exportar'); return; }
    const out  = ids.map(id => ({ id, lat: parseFloat(changes[id].lat.toFixed(5)), lng: parseFloat(changes[id].lng.toFixed(5)) }));
    const json = JSON.stringify(out, null, 2);
    navigator.clipboard.writeText(json)
      .then(()  => showToast(`JSON copiado (${out.length} cambios)`))
      .catch(() => showToast('No se pudo copiar al portapapeles'));
  };

  const resetAll = () => {
    if (!Object.keys(changes).length) return;
    if (!confirm('Reiniciar todos los cambios?')) return;
    Object.keys(changes).forEach(id => {
      const o = originalsRef.current[id];
      markersRef.current[id]?.setLatLng([o.lat, o.lng]);
    });
    setChanges({});
  };

  if (loadErr) return <div className="pe-card"><p className="pe-error">{loadErr}</p></div>;

  const changeIds = Object.keys(changes);
  const _q = search.toLowerCase().trim();
  const foundPlace = _q ? placesRef.current.find(p => p.name.toLowerCase().includes(_q) || p.id.includes(_q)) : null;

  return (
    <div className="pe-pins-wrap">
      {loading && <div className="pe-pins-loading">Cargando mapa...</div>}
      <div ref={mapRef} className="pe-pins-map" style={loading ? { display: 'none' } : {}} />
      <div className="pe-pins-panel">
        <div className="pe-pins-ph">
          <div className="pe-pins-title">Editor de pins</div>
          <p className="pe-hint">Autolocaliza los lugares por su nombre (OpenStreetMap) o arrastra un pin a mano. Revisa los marcados con ⚠️ y exporta el JSON para aplicarlo a la guía.</p>
          <button
            className={`pe-btn ${geoBusy ? 'pe-btn-ghost' : 'pe-btn-primary'}`}
            style={{ width: '100%', marginTop: 8 }}
            onClick={autolocateAll}>
            {geoBusy ? '✕ Cancelar autolocalización' : <><HiIcon name="pin" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Autolocalizar todos (OSM)</>}
          </button>
          {geoMsg && <div className="pe-pins-geo-prog">{geoMsg}</div>}
          {!geoBusy && <p className="pe-hint" style={{ fontSize: 11, marginTop: 6 }}>Los 274 lugares tardan unos 5 min (1 consulta/seg, política de OSM). Puedes cancelar cuando quieras; lo movido se conserva.</p>}
        </div>
        <div className="pe-pins-search-wrap">
          <input
            type="text"
            className="pe-input"
            placeholder="Buscar lugar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {foundPlace && (
            <button className="pe-btn pe-btn-ghost pe-btn-sm" style={{ marginTop: 6, width: '100%' }}
              disabled={geoBusy}
              onClick={() => autolocateOne(foundPlace)}>
              📍 Autolocalizar «{foundPlace.name}»
            </button>
          )}
        </div>
        <div className="pe-pins-changes-head">Cambios ({changeIds.length})</div>
        <div className="pe-pins-changes">
          {changeIds.length === 0
            ? <p className="pe-hint" style={{ padding: '12px 0' }}>Sin cambios aun.</p>
            : changeIds.map(id => {
                const p = placesRef.current.find(x => x.id === id);
                const c = changes[id];
                const o = originalsRef.current[id];
                return (
                  <div key={id} className={`pe-pins-change-item${c.doubtful ? ' is-doubtful' : ''}`}>
                    <div className="pe-pins-change-name">
                      {c.doubtful ? <HiIcon name="alert" size={13} style={{verticalAlign:'-2px',marginRight:4}} /> : null}{p ? p.name : id}
                      <button className="pe-btn pe-btn-ghost pe-btn-sm" style={{ float: 'right' }}
                        onClick={() => {
                          const oo = originalsRef.current[id];
                          markersRef.current[id]?.setLatLng([oo.lat, oo.lng]);
                          setChanges(prev => { const n = { ...prev }; delete n[id]; return n; });
                        }}>
                        deshacer
                      </button>
                    </div>
                    <div className="pe-pins-change-old">{o.lat.toFixed(5)}, {o.lng.toFixed(5)}</div>
                    <div className="pe-pins-change-new">→ {c.lat.toFixed(5)}, {c.lng.toFixed(5)}{c.dist != null ? ` · ${c.dist >= 1000 ? (c.dist/1000).toFixed(1) + ' km' : Math.round(c.dist) + ' m'}` : ''}</div>
                    {c.match && (
                      <button type="button" className="pe-pins-change-match"
                        title="Ver en el mapa"
                        onClick={() => { mapInst.current?.setView([c.lat, c.lng], 17); markersRef.current[id]?.openTooltip(); }}>
                        {c.match}
                      </button>
                    )}
                  </div>
                );
              })
          }
        </div>
        <div className="pe-pins-footer">
          <button className="pe-btn pe-btn-primary" onClick={exportJson} disabled={!changeIds.length}>
            Exportar JSON
          </button>
          <button className="pe-btn pe-btn-ghost" onClick={resetAll} disabled={!changeIds.length}>
            Reiniciar
          </button>
        </div>
        {toast && <div className="pe-pins-toast">{toast}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// SocialTab, pestaña Redes: revisa los borradores generados (escaparate +
// huecos de última hora), edita el texto y publica en Instagram/Facebook con
// un botón (vía el Worker social-publish, que guarda el token de Meta).
const SocialTab = ({ token }) => {
  const [drafts, setDrafts]   = React.useState([]);
  const [sha, setSha]         = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr]         = React.useState(null);
  const [busy, setBusy]       = React.useState(null);
  const [msg, setMsg]         = React.useState(null);
  const [secret, setSecret]   = React.useState(() => {
    try { return sessionStorage.getItem('hestia-social-secret') || ''; } catch (_) { return ''; }
  });

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${API}/repos/${REPO}/contents/${SOCIAL_DRAFTS_PATH}?ref=${BRANCH}`, { headers: apiHeaders(token), cache: 'no-store' });
      if (!r.ok) throw new Error('No pude leer social-drafts.json (' + r.status + ')');
      const j = await r.json();
      const data = JSON.parse(b64ToUtf8(j.content));
      setDrafts(Array.isArray(data.drafts) ? data.drafts : []);
      setSha(j.sha);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };
  React.useEffect(() => { if (token) load(); }, [token]);

  const persist = async (next) => {
    const payload = { drafts: next, updatedAt: new Date().toISOString() };
    const r = await fetch(`${API}/repos/${REPO}/contents/${SOCIAL_DRAFTS_PATH}`, {
      method: 'PUT', headers: apiHeaders(token),
      body: JSON.stringify({ message: 'chore(redes): actualizar borradores [skip ci]', content: utf8ToB64(JSON.stringify(payload, null, 2) + '\n'), sha, branch: BRANCH }),
    });
    if (!r.ok) { const pj = await r.json().catch(() => ({})); throw new Error(pj.message || 'Error al guardar'); }
    const pj = await r.json();
    setSha(pj.content.sha);
    setDrafts(next);
  };

  const setField  = (id, patch) => setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  const _with     = (id, patch) => drafts.map(d => d.id === id ? { ...d, ...patch } : d);

  const saveOne   = async (id) => { setBusy(id); setMsg(null); try { await persist(drafts); setMsg({ k: 'ok', t: 'Guardado ✓' }); } catch (e) { setMsg({ k: 'err', t: e.message }); } setBusy(null); };
  const setStatus = async (id, status) => { setBusy(id); setMsg(null); try { await persist(_with(id, { status })); } catch (e) { setMsg({ k: 'err', t: e.message }); } setBusy(null); };

  const publish = async (d) => {
    if (!secret) { setMsg({ k: 'err', t: 'Introduce la clave de publicación arriba.' }); return; }
    if (!(d.networks || []).length) { setMsg({ k: 'err', t: 'Elige al menos una red.' }); return; }
    if (!confirm(`¿Publicar «${APT_NAMES[d.apt]}» en ${d.networks.join(' + ')}?`)) return;
    setBusy(d.id); setMsg(null);
    try {
      const abs = p => `${SITE_BASE}/${p}`.replace(/([^:])\/{2,}/g, '$1/');
      const isReel = d.format === 'reel' && d.video;
      const payload = {
        key: secret, networks: d.networks, caption: d.caption,
        format: isReel ? 'reel' : 'image',
        imageUrl: abs(d.image),
        ...(isReel ? { videoUrl: abs(d.video) } : {}),
      };
      const res = await fetch(`${SOCIAL_PUBLISH_WORKER_URL}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.result ? JSON.stringify(j.result) : (j.error || ('HTTP ' + res.status)));
      await persist(_with(d.id, { status: 'published', publishedAt: new Date().toISOString(), result: j.result }));
      setMsg({ k: 'ok', t: 'Publicado ✓' });
    } catch (e) { setMsg({ k: 'err', t: 'No se pudo publicar: ' + e.message }); }
    setBusy(null);
  };

  if (!token)   return <div className="pe-card"><h2><HiIcon name="megaphone" size={20} className="pe-h-ic" /> Redes</h2><p className="pe-help">Inicia sesión con tu PAT para gestionar las publicaciones.</p></div>;
  if (loading)  return <div className="pe-card"><h2><HiIcon name="megaphone" size={20} className="pe-h-ic" /> Redes</h2><p>Cargando borradores…</p></div>;
  if (err)      return <div className="pe-card"><h2><HiIcon name="megaphone" size={20} className="pe-h-ic" /> Redes</h2><p className="pe-error">{err}</p><button className="pe-btn pe-btn-ghost" style={{ marginTop: 10 }} onClick={load}>Reintentar</button></div>;

  const pending = drafts.filter(d => d.status !== 'published' && d.status !== 'skipped');
  const done    = drafts.filter(d => d.status === 'published' || d.status === 'skipped');

  return (
    <div className="pe-card">
      <h2><HiIcon name="megaphone" size={20} className="pe-h-ic" /> Redes</h2>
      <p className="pe-help">Borradores generados solos (escaparate semanal + huecos de última hora). Revisa, edita el texto y publica en Instagram y Facebook con un botón. Nada se publica sin tu clic.</p>
      <div className="pe-field" style={{ maxWidth: 340, marginBottom: 16 }}>
        <label>Clave de publicación</label>
        <input type="password" className="pe-input" value={secret} placeholder="PUBLISH_SECRET (solo en esta sesión)"
          onChange={e => { setSecret(e.target.value); try { sessionStorage.setItem('hestia-social-secret', e.target.value); } catch (_) {} }} />
      </div>
      {msg && <div className="pe-hint" style={{ color: msg.k === 'err' ? '#c0392b' : '#1e8449', marginBottom: 10 }}>{msg.t}</div>}
      {pending.length === 0 && <p className="pe-hint">No hay borradores pendientes. Se generan automáticamente cada lunes.</p>}
      <div className="soc-grid">
        {pending.map(d => (
          <div key={d.id} className={`soc-card${d.format === 'reel' ? ' soc-card-reel' : ''}`}>
            {d.format === 'reel' && d.video
              ? <video className="soc-img soc-video" src={`/${d.video}`} poster={`/${d.image}`} muted loop playsInline controls preload="metadata" />
              : <img className="soc-img" src={`/${d.image}`} alt="" loading="lazy" />}
            <div className="soc-body">
              <div className="soc-head">
                <span className="soc-chip" style={{ background: APT_COLOR[d.apt], color: APT_TEXT[d.apt] }}>{APT_NAMES[d.apt]}</span>
                <span className="soc-src">{d.source === 'gap' ? <><HiIcon name="clock" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Última hora</> : d.source === 'weekly' ? <><HiIcon name="news" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Semanal</> : <><HiIcon name="sun" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Escaparate</>}</span>
                {d.format === 'reel' && <span className="soc-reel-tag"><HiIcon name="film" size={13} style={{verticalAlign:'-2px',marginRight:4}} />Reel</span>}
                {d.clip && (() => { const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; return (
                  <span className="soc-clip" title={`Trozo del vídeo: ${d.clip.src || ''}`}>
                    <HiIcon name="camera" size={12} style={{verticalAlign:'-2px',marginRight:3}} />
                    {fmt(d.clip.start)}–{fmt(d.clip.start + (d.clip.dur || 9))}
                  </span>
                ); })()}
                {d.status === 'approved' && <span className="soc-flag">✓ aprobado</span>}
              </div>
              <textarea className="pe-input soc-caption" rows={9} value={d.caption} onChange={e => setField(d.id, { caption: e.target.value })} />
              <div className="soc-nets">
                {[['ig', 'Instagram'], ['fb', 'Facebook']].map(([n, lbl]) => (
                  <label key={n} className="soc-net">
                    <input type="checkbox" checked={(d.networks || []).includes(n)}
                      onChange={e => { const s = new Set(d.networks || []); e.target.checked ? s.add(n) : s.delete(n); setField(d.id, { networks: [...s] }); }} />
                    {lbl}
                  </label>
                ))}
                {d.link && <a className="soc-link" href={d.link} target="_blank" rel="noreferrer">ver enlace</a>}
              </div>
              <div className="soc-actions">
                <button className="pe-btn pe-btn-ghost pe-btn-sm" disabled={busy === d.id} onClick={() => saveOne(d.id)}>Guardar</button>
                <button className="pe-btn pe-btn-ghost pe-btn-sm" disabled={busy === d.id} onClick={() => setStatus(d.id, 'skipped')}>Descartar</button>
                <button className="pe-btn pe-btn-primary pe-btn-sm" disabled={busy === d.id} onClick={() => publish(d)}>
                  {busy === d.id ? 'Publicando…' : <><HiIcon name="upload" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Publicar</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {done.length > 0 && (
        <details className="soc-done">
          <summary>Historial ({done.length})</summary>
          {done.map(d => (
            <div key={d.id} className="soc-done-row">
              <span>{d.status === 'published' ? <HiIcon name="check" size={15} style={{verticalAlign:'-2px'}} /> : <HiIcon name="trash" size={15} style={{verticalAlign:'-2px'}} />}</span>
              <span className="soc-done-txt">{APT_NAMES[d.apt]} · {d.caption.split('\n')[0].slice(0, 50)}</span>
              {d.status === 'published' && <button className="pe-btn pe-btn-ghost pe-btn-sm" disabled={busy === d.id} onClick={() => setStatus(d.id, 'pending')}>reutilizar</button>}
            </div>
          ))}
        </details>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// Secreto de lectura del Worker de registro. Solo en memoria (nunca en storage),
// igual que el PAT: persiste entre cambios de pestaña dentro de la sesión.
let _regReadSecret = '';

const REG_COLS = [
  ['token', 'Reserva'], ['nombre', 'Nombre'], ['apellido1', '1º Apellido'], ['apellido2', '2º Apellido'],
  ['sexo', 'Sexo'], ['tipoDoc', 'Tipo doc'], ['numDoc', 'Nº documento'], ['numSoporte', 'Nº soporte'],
  ['nacionalidad', 'Nacionalidad'], ['fechaNacimiento', 'F. nacimiento'], ['pais', 'País resid.'],
  ['direccion', 'Dirección'], ['municipio', 'Localidad'], ['cp', 'CP'], ['telefono', 'Teléfono'],
  ['email', 'Email'], ['parentesco', 'Parentesco'],
];

// Botón de copiar el valor de un campo del registro (para pegar en SES.HOSPEDAJES).
const RegCopyBtn = ({ value }) => {
  const [copied, setCopied] = React.useState(false);
  const doCopy = () => {
    const v = String(value == null ? '' : value);
    if (!v || !(navigator.clipboard && navigator.clipboard.writeText)) return;
    navigator.clipboard.writeText(v)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); })
      .catch(() => {});
  };
  return (
    <button type="button" className={`reg-copy-btn${copied ? ' is-copied' : ''}`}
      onClick={doCopy} title="Copiar este campo" aria-label="Copiar este campo">
      <HiIcon name={copied ? 'check' : 'clip'} size={12} />
    </button>
  );
};

const TravelerRegistryTab = () => {
  const [secret, setSecret] = React.useState(_regReadSecret);
  const [regs, setRegs]     = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr]       = React.useState(null);
  const [open, setOpen]     = React.useState({});

  const notConfigured = TRAVELER_WORKER_URL.includes('SUSTITUIR');

  const load = async () => {
    if (!secret) { setErr('Introduce el secreto de lectura (READ_SECRET).'); return; }
    _regReadSecret = secret;
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${TRAVELER_WORKER_URL}/list?key=${encodeURIComponent(secret)}`, { cache: 'no-store' });
      if (r.status === 401) throw new Error('Secreto incorrecto.');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setRegs(Array.isArray(j.registrations) ? j.registrations : []);
    } catch (e) {
      setErr('No se pudo cargar: ' + e.message + (notConfigured ? ' (falta desplegar el Worker y poner su URL).' : ''));
    } finally { setLoading(false); }
  };

  const csvCell = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const downloadCsv = () => {
    if (!regs || !regs.length) return;
    const rows = [REG_COLS.map(c => c[1]).join(';')];
    regs.forEach(reg => (reg.travelers || []).forEach(tr => {
      rows.push(REG_COLS.map(([k]) => csvCell(k === 'token' ? reg.token : tr[k])).join(';'));
    }));
    const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `registro-viajeros-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [deleting, setDeleting] = React.useState(null);
  const delReq = async (payload) => {
    const r = await fetch(`${TRAVELER_WORKER_URL}/delete`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: secret, ...payload }),
    });
    if (r.status === 401) throw new Error('Secreto incorrecto.');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  const delOne = async (token) => {
    if (!window.confirm('¿Borrar definitivamente esta ficha de viajeros? No se puede deshacer.')) return;
    setDeleting(token); setErr(null);
    try { await delReq({ token }); setRegs(rs => (rs || []).filter(x => x.token !== token)); }
    catch (e) { setErr('No se pudo borrar: ' + e.message); }
    finally { setDeleting(null); }
  };
  const delAll = async () => {
    if (!regs || !regs.length) return;
    if (!window.confirm(`¿Borrar TODAS las ${regs.length} fichas de viajeros? No se puede deshacer.`)) return;
    setDeleting('__all__'); setErr(null);
    try { await delReq({ all: true }); setRegs([]); }
    catch (e) { setErr('No se pudo borrar: ' + e.message); }
    finally { setDeleting(null); }
  };

  const fmtWhen = (iso) => { try { return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }); } catch (_) { return iso; } };

  return (
    <div className="pe-card">
      <h2><HiIcon name="shield" size={20} className="pe-h-ic" /> Registro de viajeros</h2>
      <p className="pe-help">
        Datos que rellenan los huéspedes en <code>/registro.html?r=&lt;token&gt;</code> para el registro
        obligatorio (RD 933/2021 · SES.HOSPEDAJES). Se guardan cifrados en el Worker; se descifran aquí con
        el secreto de lectura. Descarga el CSV para subirlo/copiarlo en SES.HOSPEDAJES.
        Cuando ya no los necesites, bórralos a demanda (botón en cada ficha o «Borrar todas»); si no, expiran solos con el tiempo.
      </p>
      {notConfigured && <div className="pe-error" style={{ marginTop: 8 }}>Aún no está desplegado el Worker: sustituye la URL en <code>TRAVELER_WORKER_URL</code> (admin-page y registro-page) tras <code>wrangler deploy</code>.</div>}

      <div className="reg-admin-bar">
        <input type="password" className="pe-input" placeholder="Secreto de lectura (READ_SECRET)"
          value={secret} onChange={e => setSecret(e.target.value)} autoComplete="off" style={{ maxWidth: 320 }} />
        <button type="button" className="pe-btn pe-btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Cargando…' : 'Cargar fichas'}
        </button>
        {regs && regs.length > 0 && (
          <button type="button" className="pe-btn pe-btn-ghost" onClick={downloadCsv}>
            <HiIcon name="upload" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />Descargar CSV
          </button>
        )}
        {regs && regs.length > 0 && (
          <button type="button" className="pe-btn reg-del-all" onClick={delAll} disabled={deleting === '__all__'}>
            <HiIcon name="trash" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            {deleting === '__all__' ? 'Borrando…' : 'Borrar todas'}
          </button>
        )}
      </div>
      {err && <div className="pe-error" style={{ marginTop: 8 }}>{err}</div>}

      {regs && regs.length === 0 && <p className="pe-help" style={{ marginTop: 12 }}>Aún no hay fichas enviadas.</p>}

      {/* El token lleva la fecha de entrada codificada (<apt>-<YYYYMMDD>-<random>,
          ver AccessLinkButton más arriba): orden por fecha de estancia, más reciente primero. */}
      {regs && [...regs].sort((a, b) => ((b.token || '').split('-')[1] || '').localeCompare((a.token || '').split('-')[1] || '')).map((reg, i) => {
        const isOpen = open[reg.token] ?? (i === 0);
        const aptId = (reg.token || '').split('-')[0];
        const aptName = APT_NAMES[aptId];
        const holder = reg.travelers && reg.travelers[0];
        const holderName = holder ? [holder.nombre, holder.apellido1, holder.apellido2].filter(Boolean).join(' ') : '';
        return (
          <div key={reg.token} className="reg-admin-card">
            <button type="button" className="reg-admin-head" onClick={() => setOpen(p => ({ ...p, [reg.token]: !isOpen }))}>
              <span className="reg-admin-who">
                {aptName && <span className="reg-admin-apt-chip" style={{ background: APT_COLOR[aptId], color: APT_TEXT[aptId] }}>{aptName}</span>}
                <strong className="reg-admin-holder">{holderName || 'Sin titular aún'}</strong>
              </span>
              <span className="reg-admin-token">{reg.token}</span>
              <span className="reg-admin-meta">{(reg.travelers || []).length} viajero(s) · {fmtWhen(reg.submittedAt)}</span>
              <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (reg.travelers || []).map((tr, ti) => (
              <div key={ti} className="reg-admin-traveler">
                <strong>{ti === 0 ? 'Titular' : `Viajero ${ti + 1}`}: {tr.nombre} {tr.apellido1} {tr.apellido2}</strong>
                <div className="reg-admin-fields">
                  {REG_COLS.filter(([k]) => k !== 'token').map(([k, lbl]) => (
                    tr[k] ? <span key={k}><em>{lbl}:</em> {tr[k]}<RegCopyBtn value={tr[k]} /></span> : null
                  ))}
                </div>
              </div>
            ))}
            {isOpen && (
              <div className="reg-admin-actions">
                <button type="button" className="reg-del-btn" onClick={() => delOne(reg.token)} disabled={deleting === reg.token}>
                  <HiIcon name="trash" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  {deleting === reg.token ? 'Borrando…' : 'Borrar esta ficha'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AdminApp = () => {
  const [phase,    setPhase]    = React.useState('login');
  const [mode,     setMode]     = React.useState('reservas');
  const [contractPrefill, setContractPrefill] = React.useState(null);
  const [token,    setToken]    = React.useState('');
  const [data,     setData]     = React.useState(null);
  const [sha,      setSha]      = React.useState(null);
  // Expone prices.json al motor de precios compartido (_calcStay de shared.js),
  // para calcular en vivo el "precio si fuera directa" de las reservas OTA.
  // Se reasigna cada vez que cambian los precios.
  React.useEffect(() => { if (data) window.PRICES_V2 = data; }, [data]);
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
        setSyncMsg('Sync lanzado, actualizando datos…');
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
          <p className="pe-loading-msg"><><HiIcon name="hourglass" size={14} style={{verticalAlign:'-2px',marginRight:4}} />{phase === 'loading' ? 'Autenticando…' : 'Guardando…'}</></p>
        </div>
      </div>
    );
  }

  // ---- Reviews, listado y filtros ----
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
              {addMode === 'paste' ? '× Cancelar' : <><HiIcon name="clipboard" size={14} style={{verticalAlign:'-2px',marginRight:4}} />Pegar desde email</>}
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
          {mode === 'pricing' ? `Precios actualizados: ${data.updatedAt || '–'}` :
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
            <span className="pe-sync-icon">{syncState === 'running' ? <HiIcon name="hourglass" size={13} style={{verticalAlign:'-2px'}} /> : syncState === 'ok' ? '✓' : syncState === 'error' ? '✗' : <HiIcon name="refresh" size={13} style={{verticalAlign:'-2px'}} />}</span>
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
          <HiIcon name="cal" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Reservas</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'prereservas' ? ' is-active' : ''}`}
          onClick={() => { setMode('prereservas'); setError(null); setSuccess(null); }}>
          <HiIcon name="clipboard" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Prereservas</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'bloqueos' ? ' is-active' : ''}`}
          onClick={() => { setMode('bloqueos'); setError(null); setSuccess(null); }}>
          <HiIcon name="lock" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Bloqueos</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'leila' ? ' is-active' : ''}`}
          onClick={() => { setMode('leila'); setError(null); setSuccess(null); }}>
          <HiIcon name="card" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Leila</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'contract' ? ' is-active' : ''}`}
          onClick={() => { setMode('contract'); setError(null); setSuccess(null); }}>
          <HiIcon name="doc" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Contrato</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'facturas' ? ' is-active' : ''}`}
          onClick={() => { setMode('facturas'); setError(null); setSuccess(null); }}>
          <HiIcon name="receipt" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Facturas</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'inteligencia' ? ' is-active' : ''}`}
          onClick={() => { setMode('inteligencia'); setError(null); setSuccess(null); }}>
          <HiIcon name="chart" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Inteligencia</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'pricing' ? ' is-active' : ''}`}
          onClick={() => { setMode('pricing'); setError(null); setSuccess(null); }}>
          <HiIcon name="euro" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Pricing</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'huecos' ? ' is-active' : ''}`}
          onClick={() => { setMode('huecos'); setError(null); setSuccess(null); }}>
          <HiIcon name="clock" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Huecos</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'reviews' ? ' is-active' : ''}`}
          onClick={() => { setMode('reviews'); setError(null); setSuccess(null); }}>
          <HiIcon name="star-rate" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Reviews</span>
          {reviewsData && (() => {
            const pending = (reviewsData.items || []).filter(r => r.status === 'pending').length;
            return pending > 0 ? <span className="pe-tab-badge">{pending}</span> : null;
          })()}
        </button>
        <button type="button"
          className={`pe-tab${mode === 'mapa' ? ' is-active' : ''}`}
          onClick={() => { setMode('mapa'); setError(null); setSuccess(null); }}>
          <HiIcon name="pin" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Mapa</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'social' ? ' is-active' : ''}`}
          onClick={() => { setMode('social'); setError(null); setSuccess(null); }}>
          <HiIcon name="megaphone" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Redes</span>
        </button>
        <button type="button"
          className={`pe-tab${mode === 'registro' ? ' is-active' : ''}`}
          onClick={() => { setMode('registro'); setError(null); setSuccess(null); }}>
          <HiIcon name="shield" size={18} className="pe-tab-ic" /><span className="pe-tab-label"> Registro</span>
        </button>
      </div>

      {success && <div className="pe-success">{success}</div>}
      {error   && <div className="pe-error">{error}</div>}

      {mode === 'registro' ? <TravelerRegistryTab /> : mode === 'social' ? <SocialTab token={token} /> : mode === 'mapa' ? <PinsTab /> : mode === 'huecos' ? <HuecosTab token={token} pricesData={data} onPricesUpdated={(d, s) => { setData(d); setSha(s); }} /> : mode === 'inteligencia' ? <IntelligenciaTab token={token} onNavigate={tab => { setMode(tab); setError(null); setSuccess(null); }} /> : mode === 'contract' ? <ContractTab pricesData={data} prefill={contractPrefill} token={token} /> : mode === 'prereservas' ? <PrereservasTab token={token} refreshKey={refreshKey} /> : mode === 'reservas' ? <ReservasTab token={token} refreshKey={refreshKey} onOpenContract={r => { setContractPrefill(r); setMode('contract'); }} /> : mode === 'bloqueos' ? <BloquesTab token={token} /> : mode === 'leila' ? <LeilaTab token={token} /> : mode === 'facturas' ? <FacturasTab token={token} /> : mode === 'reviews' ? renderReviewsTab() : (
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
                <td className="pe-mono pe-hint">{(d.excludeSeasons || []).join(', ') || '–'}</td>
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

// IconSprite monta las definiciones <symbol> de los iconos de marca. El admin
// no usa el Header público (que lo montaba), así que lo añadimos aquí para que
// los HiIcon de pestañas, cabeceras y botones no salgan en blanco.
ReactDOM.createRoot(document.getElementById('root')).render(<><IconSprite/><AdminApp/></>);
