// ============================================================
// HESTÍA · ADMIN — /p-edit.html
// Editor de docs/data/prices.json. Login con GitHub PAT
// (permiso contents:write sobre el repo). El token vive solo
// en memoria — nunca en el repo, nunca en localStorage.
// ============================================================

const REPO   = 'aberruezo-ops/hestia';
const PATH   = 'docs/data/prices.json';
const BRANCH = 'main';
const API    = 'https://api.github.com';

const apiHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Accept':        'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

// base64 ↔ utf-8 (atob/btoa no manejan UTF-8 directamente)
const utf8ToB64 = (s) => btoa(unescape(encodeURIComponent(s)));
const b64ToUtf8 = (s) => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));

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
        return (
          <div key={year} className="pe-card">
            <h2>Calendario {year} · temporadas</h2>
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

const AdminApp = () => {
  const [phase,    setPhase]    = React.useState('login');
  const [token,    setToken]    = React.useState('');
  const [data,     setData]     = React.useState(null);
  const [sha,      setSha]      = React.useState(null);
  const [calJson,  setCalJson]  = React.useState('');
  const [calOk,    setCalOk]    = React.useState(true);
  const [calErr,   setCalErr]   = React.useState('');
  const [error,    setError]    = React.useState(null);
  const [success,  setSuccess]  = React.useState(null);

  const login = async (e) => {
    e.preventDefault();
    setPhase('loading');
    setError(null);
    try {
      const t = token.trim();
      if (!t) throw new Error('Token vacío.');
      const ok = await fetch(`${API}/repos/${REPO}`, { headers: apiHeaders(t) });
      if (!ok.ok) throw new Error(`Token inválido o sin acceso al repo (HTTP ${ok.status}).`);
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
      setPhase('ready');
    } catch (err) {
      setError(err.message);
      setPhase('login');
    }
  };

  const logout = () => {
    setToken(''); setData(null); setSha(null); setCalJson(''); setError(null); setSuccess(null);
    setPhase('login');
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

  // phase === 'ready'
  return (
    <div className="pe-shell">
      <div className="pe-topbar">
        <span>Hestía · Pricing Edit</span>
        <span className="pe-meta">Última actualización: {data.updatedAt || '—'}</span>
        <button onClick={logout} className="pe-btn pe-btn-ghost">Cerrar sesión</button>
      </div>

      {success && <div className="pe-success">{success}</div>}
      {error   && <div className="pe-error">{error}</div>}

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
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp/>);
