// ================================================================
// HESTÍA — App raíz (landing)
// useScrollMode y useReveal viven en shared.jsx
// ================================================================

const VideoIntro = ({ lang, onDone }) => {
  const boxRef    = React.useRef(null);
  const videoRef  = React.useRef(null);
  const exitedRef = React.useRef(false);

  const doExit = () => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    const box = boxRef.current;
    if (box) {
      box.style.transition = 'opacity 2s ease';
      box.style.opacity    = '0';
    }
    setTimeout(() => {
      sessionStorage.setItem('hestia-intro', '1');
      onDone();
    }, 2000);
  };

  React.useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => setTimeout(doExit, 200));
    const bail = setTimeout(doExit, 14000);
    return () => clearTimeout(bail);
  }, []);

  return (
    <div ref={boxRef} className="vintro">
      <div className="vintro-box">
        <video
          ref={videoRef}
          className="vintro-video"
          autoPlay muted playsInline
          onEnded={doExit}
          onError={doExit}
        >
          <source src="assets/hestia-vitruvio.mp4" type="video/mp4"/>
        </video>
        <button className="vintro-skip" onClick={doExit}>
          {lang === 'es' ? 'Saltar →' : 'Skip →'}
        </button>
      </div>
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
