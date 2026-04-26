// ================================================================
// HESTÍA — App raíz
// ================================================================

const useScrollMode = () => {
  const [mode, setMode] = React.useState('night');
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      setScrolled(y > 40);
      // Hero + bridge area = night/bridge; después = day
      // Hero ~100vh, bridge ~80vh → a partir de 1.4vh pasa a "day"
      if (y < h * 0.85) setMode('night');
      else setMode('day');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return { mode, scrolled };
};

const useReveal = () => {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
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

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <Hero lang={lang} />
        <Bridge lang={lang} />
        <Apartments lang={lang} />
        <Compare lang={lang} />
        <Counters lang={lang} />
        <Gallery lang={lang} />
        <Team lang={lang} />
        <Manifest lang={lang} />
        <Ratings lang={lang} />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
      {tweaksOpen && <TweaksPanel tweaks={tweaks} update={updateTweak} lang={lang} setLang={setLang} />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
