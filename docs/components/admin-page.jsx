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

      <div className="pe-card">
        <h2>Calendario y horizonte de reservas</h2>
        <p className="pe-lede">
          Edición avanzada en JSON: rangos por temporada, especiales (Sem. Santa, Navidad), puentes nacionales y fecha de cierre de reservas. Cambia 1 vez al año. Validación en vivo abajo.
        </p>
        <textarea
          value={calJson}
          onChange={e => updateCalJson(e.target.value)}
          rows={20}
          className="pe-textarea pe-mono"
          spellCheck="false"
        />
        {!calOk && <div className="pe-error">JSON inválido — {calErr}</div>}
      </div>

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
