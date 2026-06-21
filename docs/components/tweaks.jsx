// ================================================================
// HESTÍA — Tweaks panel
// ================================================================

const TweaksPanel = ({ tweaks, update, lang, setLang }) => {
  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <div className="wordmark" style={{fontSize: 13}}>TWEAKS</div>
        <div className="your-home" style={{fontSize: 9, marginTop: 2}}>hestía your home!</div>
      </div>
      <div className="tweaks-body">
        <div className="tweaks-row">
          <label>Idioma · Language</label>
          <div className="seg-control">
            <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
        <div className="tweaks-row">
          <label>Cielo estrellado en hero</label>
          <div className="seg-control">
            <button className={tweaks.starfield ? 'active' : ''} onClick={() => update('starfield', true)}>On</button>
            <button className={!tweaks.starfield ? 'active' : ''} onClick={() => update('starfield', false)}>Off</button>
          </div>
        </div>
        <div className="tweaks-row">
          <label>Parallax en galería</label>
          <div className="seg-control">
            <button className={tweaks.parallax ? 'active' : ''} onClick={() => update('parallax', true)}>On</button>
            <button className={!tweaks.parallax ? 'active' : ''} onClick={() => update('parallax', false)}>Off</button>
          </div>
        </div>
        <div className="tweaks-row">
          <label>Ir a sección</label>
          <div className="tweaks-jumps">
            <button onClick={() => document.getElementById('apartamentos').scrollIntoView({behavior:'smooth'})}>Apart.</button>
            <button onClick={() => document.getElementById('nosotros').scrollIntoView({behavior:'smooth'})}>Alex & Fran</button>
            <button onClick={() => document.getElementById('opiniones').scrollIntoView({behavior:'smooth'})}>Opiniones</button>
            <button onClick={() => document.getElementById('contacto').scrollIntoView({behavior:'smooth'})}>Contacto</button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TweaksPanel });
