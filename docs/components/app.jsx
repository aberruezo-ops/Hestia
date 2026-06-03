// ================================================================
// HESTÍA — App raíz (landing)
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
      <button type="button" className="oferta-close" onClick={dismiss} aria-label="Cerrar">×</button>
    </div>
  );
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
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
      {tweaksOpen && <TweaksPanel tweaks={tweaks} update={updateTweak} lang={lang} setLang={setLang} />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
