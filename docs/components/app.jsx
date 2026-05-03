// ================================================================
// HESTÍA — App raíz (landing)
// useScrollMode y useReveal viven en shared.jsx
// ================================================================

const VideoIntro = ({ lang, onDone }) => {
  const overlayRef = React.useRef(null);
  const wrapRef    = React.useRef(null);
  const videoRef   = React.useRef(null);
  const exitedRef  = React.useRef(false);

  const doExit = () => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    document.body.style.overflow = '';

    const logo    = document.querySelector('.hestia-logo');
    const wrap    = wrapRef.current;
    const overlay = overlayRef.current;

    if (logo && wrap) {
      const lr = logo.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const dx = (lr.left + lr.width  / 2) - (wr.left + wr.width  / 2);
      const dy = (lr.top  + lr.height / 2) - (wr.top  + wr.height / 2);
      const s  = Math.min(lr.width / wr.width, lr.height / wr.height);
      wrap.style.transition = 'transform 0.85s cubic-bezier(.65,0,.35,1), opacity 0.4s 0.5s';
      wrap.style.transform  = `translate(${dx}px,${dy}px) scale(${s})`;
      wrap.style.opacity    = '0';
    }
    if (overlay) {
      overlay.style.transition    = 'background 0.55s 0.38s';
      overlay.style.background    = 'transparent';
      overlay.style.pointerEvents = 'none';
    }

    setTimeout(() => {
      sessionStorage.setItem('hestia-intro', '1');
      onDone();
    }, 1100);
  };

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    const v = videoRef.current;
    if (v) v.play().catch(() => setTimeout(doExit, 200));
    const bail = setTimeout(doExit, 14000);
    return () => { clearTimeout(bail); document.body.style.overflow = ''; };
  }, []);

  return (
    <div ref={overlayRef} className="vintro">
      <div ref={wrapRef} className="vintro-wrap">
        <video
          ref={videoRef}
          className="vintro-video"
          autoPlay muted playsInline
          onEnded={doExit}
          onError={doExit}
        >
          <source src="assets/hestia-vitruvio.mp4" type="video/mp4"/>
        </video>
      </div>
      <button className="vintro-skip" onClick={doExit}>
        {lang === 'es' ? 'Saltar →' : 'Skip →'}
      </button>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const [introOver, setIntroOver] = React.useState(() => !!sessionStorage.getItem('hestia-intro'));
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

  return (
    <>
      {!introOver && <VideoIntro lang={lang} onDone={() => setIntroOver(true)} />}
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <Hero lang={lang} />
        <FraseHogar lang={lang} />
        <HomeSearch lang={lang} />
        <Apartments lang={lang} />
        <Compare lang={lang} />
        <Counters lang={lang} />
        <Team lang={lang} />
        <Manifest lang={lang} />
        <Ratings lang={lang} />
        <QuickFAQ lang={lang} pageId="home" />
        <ContactCTA lang={lang} availHref="#buscar" />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
      {tweaksOpen && <TweaksPanel tweaks={tweaks} update={updateTweak} lang={lang} setLang={setLang} />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
