// ================================================================
// HESTÍA, App raíz (landing)
// useScrollMode y useReveal viven en shared.jsx
// ================================================================

const OfertaBanner = ({ lang }) => {
  const offer = window.PRICES_V2 && window.PRICES_V2.specialOffer;
  const [dismissed, setDismissed] = React.useState(() => {
    try { return sessionStorage.getItem('hestia-offer-dismissed') === '1'; } catch (_) { return false; }
  });
  if (!offer || !offer.active || dismissed) return null;
  if (offer.expires && new Date().toISOString().slice(0, 10) > offer.expires) return null;
  const text = lang === 'en' ? (offer.text_en || offer.text_es) : offer.text_es;
  const cta  = lang === 'en' ? (offer.cta_en  || offer.cta_es)  : offer.cta_es;
  if (!text) return null;
  const dismiss = () => {
    try { sessionStorage.setItem('hestia-offer-dismissed', '1'); } catch (_) {}
    setDismissed(true);
  };
  return (
    <div className="oferta-banner" role="alert">
      <span className="oferta-text">{text}</span>
      {cta && <a href="reservas.html" className="oferta-cta">{cta}</a>}
      <button type="button" className="oferta-close" onClick={dismiss} aria-label={lang === 'es' ? 'Cerrar' : 'Close'}>×</button>
    </div>
  );
};

const _SEA_VOL = 0.25;
// Rampa de volumen (fade) con requestAnimationFrame, para que el mar no corte de
// golpe ni al silenciar ni al terminar, sino que baje hasta desaparecer.
const _fadeTo = (audio, to, ms, onEnd) => {
  if (!audio) return;
  if (audio._raf) cancelAnimationFrame(audio._raf);
  const from = audio.volume;
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const tick = (now) => {
    const k = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) audio._raf = requestAnimationFrame(tick);
    else { audio._raf = null; if (onEnd) onEnd(); }
  };
  audio._raf = requestAnimationFrame(tick);
};

const App = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();


  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // Tweaks
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(window.__TWEAKS__);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const updateTweak = (key, value) => {
    const next = { ...tweaks, [key]: value };
    setTweaks(next);
    window.__TWEAKS__ = next;
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
  };

  // Apply tweaks
  React.useEffect(() => {
    document.body.classList.toggle('no-stars', !tweaks.starfield);
    document.body.classList.toggle('no-parallax', !tweaks.parallax);
  }, [tweaks]);

  // Sonido sutil de mar, suena UNA sola vez al entrar en la home (sin bucle).
  // Los navegadores bloquean el audio con sonido hasta que el usuario interactúa,
  // así que intentamos reproducir al cargar y, si se bloquea, lo lanzamos en el
  // primer gesto (clic/tecla/tap/scroll). Una reproducción por carga. El usuario
  // puede silenciarlo con el botón; la preferencia se recuerda (localStorage).
  const [soundOn, setSoundOn] = React.useState(() => {
    try { return localStorage.getItem('hestia-sound') !== 'off'; } catch (_) { return true; }
  });
  const seaRef = React.useRef(null);
  React.useEffect(() => {
    const audio = new Audio('assets/sea-ambient.mp3');
    audio.volume = _SEA_VOL;
    audio.preload = 'auto';
    audio.playsInline = true;
    seaRef.current = audio;
    // Fundido de salida en los ~2.5 s finales: el mar se apaga suave, no de golpe.
    audio.addEventListener('timeupdate', () => {
      const left = audio.duration - audio.currentTime;
      if (isFinite(left) && left <= 2.5 && !audio._raf && audio.volume > 0.01) _fadeTo(audio, 0, left * 1000);
    });
    let done = false;
    const wanted = () => { try { return localStorage.getItem('hestia-sound') !== 'off'; } catch (_) { return true; } };
    // Reproducir una vez al primer gesto. Los listeners se ponen YA (sin esperar a que
    // el play() inicial falle) para no perder el primer toque. Usamos gestos que
    // Safari/iOS SÍ aceptan para desbloquear audio (touchend/click/pointerup/tecla);
    // pointerdown/touchstart/scroll no lo desbloquean en Safari. Solo se marca hecho
    // cuando play() RESUELVE, así que si un gesto se rechaza, seguimos esperando.
    const evs = ['touchend', 'click', 'pointerup', 'keydown'];
    const cleanup = () => evs.forEach(ev => document.removeEventListener(ev, onGesture, true));
    const onGesture = () => {
      if (done || !wanted()) return;
      audio.play().then(() => { done = true; cleanup(); }).catch(() => {});
    };
    evs.forEach(ev => document.addEventListener(ev, onGesture, { passive: true, capture: true }));
    // Intento inmediato por si el navegador ya permite (sesión con interacción previa).
    if (wanted()) audio.play().then(() => { done = true; cleanup(); }).catch(() => {});
    return cleanup;
  }, []);
  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev;
      try { localStorage.setItem('hestia-sound', next ? 'on' : 'off'); } catch (_) {}
      const a = seaRef.current;
      if (a) {
        if (next) { a.volume = 0; a.currentTime = 0; a.play().catch(() => {}); _fadeTo(a, _SEA_VOL, 600); }
        else { _fadeTo(a, 0, 1000, () => a.pause()); } // fade-out suave al silenciar
      }
      return next;
    });
  };

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <Hero lang={lang} />
        <OfertaBanner lang={lang} />
        <FraseHogar lang={lang} />
        <RatingsMarquee lang={lang} />
        <HomePriceStrip lang={lang} />
        {typeof LastMinuteStrip !== 'undefined' && <LastMinuteStrip lang={lang} />}
        <HomeSearch lang={lang} />
        <Apartments lang={lang} />
        <DirectBookingPerks lang={lang} />
        <Compare lang={lang} />
        {typeof LongStayStrip !== 'undefined' && <LongStayStrip lang={lang} />}
        <Counters lang={lang} />
        <Team lang={lang} />
        <Manifest lang={lang} />
        <Ratings lang={lang} />
        <HomeGuideTeaser lang={lang} />
        <QuickFAQ lang={lang} pageId="home" />
        <ContactCTA lang={lang} availHref="#buscar" />
      </main>
      <Footer lang={lang} />
      <button
        type="button"
        className={`sound-toggle${soundOn ? ' is-on' : ''}`}
        onClick={toggleSound}
        aria-pressed={soundOn}
        title={soundOn ? (lang === 'es' ? 'Silenciar sonido' : 'Mute sound') : (lang === 'es' ? 'Activar sonido' : 'Unmute sound')}
        aria-label={soundOn ? (lang === 'es' ? 'Silenciar sonido de mar' : 'Mute sea sound') : (lang === 'es' ? 'Activar sonido de mar' : 'Unmute sea sound')}
      >
        {soundOn ? (
          <svg className="hi sound-waves" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="none" stroke="currentColor" d="M11 5 6 9H2v6h4l5 4z"/>
            <path className="sw sw1" fill="none" stroke="currentColor" d="M15.5 8.5a5 5 0 0 1 0 7"/>
            <path className="sw sw2" fill="none" stroke="currentColor" d="M18.5 5.5a9 9 0 0 1 0 13"/>
          </svg>
        ) : (
          <HiIcon name="mute" size={22} />
        )}
      </button>
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
      {tweaksOpen && <TweaksPanel tweaks={tweaks} update={updateTweak} lang={lang} setLang={setLang} />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
