// ================================================================
// HESTÍA — Chrome (topbar, header, cookies, floating chat, footer)
// ================================================================

const Topbar = ({ lang, setLang }) => (
  <>
    <div className="topbar">
      <div className="contacts">
        <a href="https://wa.me/34620316370" className={`topbar-link${lang === 'es' ? ' tl-active' : ''}`} target="_blank" rel="noopener" aria-label="WhatsApp Alex">
          <span className={`tl-dot${lang === 'es' ? ' tl-dot--on' : ''}`}/>
          <span className="tl-who hide-mobile">Alex</span>
          <span className="tl-mode hide-mobile">🇪🇸 Español</span>
          <span className="tl-num">+34 620 316 370</span>
        </a>
        <span className="sep">·</span>
        <a href="https://wa.me/34654138251" className={`topbar-link${lang === 'en' ? ' tl-active' : ''}`} target="_blank" rel="noopener" aria-label="WhatsApp Fran">
          <span className={`tl-dot${lang === 'en' ? ' tl-dot--on' : ''}`}/>
          <span className="tl-who hide-mobile">Fran</span>
          <span className="tl-mode hide-mobile">🇬🇧 English</span>
          <span className="tl-num">+34 654 138 251</span>
        </a>
        <span className="sep hide-mobile">·</span>
        <a href="mailto:info@hestiayourhome.com" className="topbar-link email hide-mobile" aria-label="Email">
          info@hestiayourhome.com
        </a>
      </div>
      <div className="lang" role="group" aria-label="Language">
        <button
          className={lang === 'es' ? 'active' : ''}
          onClick={() => setLang('es')}
          aria-pressed={lang === 'es'}
          aria-label="Español"
        >
          <span className="lang-full" aria-hidden="true">🇪🇸 Español</span>
          <span className="lang-abbr" aria-hidden="true">ES</span>
        </button>
        <span className="divider" aria-hidden="true">/</span>
        <button
          className={lang === 'en' ? 'active' : ''}
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
          aria-label="English"
        >
          <span className="lang-full" aria-hidden="true">🇬🇧 English</span>
          <span className="lang-abbr" aria-hidden="true">EN</span>
        </button>
      </div>
    </div>
    <div className="topbar-corner-fill" aria-hidden="true" />
  </>
);

const IconHamburger = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="currentColor" aria-hidden="true">
    <rect width="22" height="2" rx="1"/>
    <rect y="7" width="22" height="2" rx="1"/>
    <rect y="14" width="22" height="2" rx="1"/>
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="4" y1="4" x2="16" y2="16"/>
    <line x1="16" y1="4" x2="4" y2="16"/>
  </svg>
);

const IconChat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const NAV_PAGES = {
  mar:              'mar.html',
  thalassa:         'thalassa.html',
  salinas:          'salinas.html',
  nosotros:         'nosotros.html',
  porqueHestia:     'porque-hestia.html',
  opiniones:        'opiniones.html',
  noticias:         'noticias.html',
  contacto:         'contacto.html',
  reservas:         'reservas.html',
  ventajas:         'reservas.html#ventajas',
  estanciasLargas:  'estancias-largas.html',
};

const isActive = (href) => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  return current === href;
};

const CTA_CYCLE_DURATION = 80; // 8 colors × 10s

// Sección plegable "Acceso para huéspedes" en el menú móvil.
// Al pulsar muestra los enlaces a las guías de cada apartamento.
const MnGuestSection = ({ t, lang, NavLink, NAV_PAGES }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mn-guests-section">
      <button
        type="button"
        className={`mn-guests-btn${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="mn-guests-icon" aria-hidden="true">🔑</span>
        <span>{t.mn_guests}</span>
        <span className={`mn-guests-chev${open ? ' open' : ''}`} aria-hidden="true">↓</span>
      </button>
      {open && (
        <div className="mn-guests-body">
          <div className="mn-guests-label eyebrow">{t.mn_guide}</div>
          <NavLink href={NAV_PAGES.mar} className="mn-guest-apt mn-vm">
            <span className="mn-guest-dot" aria-hidden="true"/>
            <span>Hestía <em>Mar</em></span>
          </NavLink>
          <NavLink href={NAV_PAGES.thalassa} className="mn-guest-apt mn-vt">
            <span className="mn-guest-dot" aria-hidden="true"/>
            <span>Hestía <em>Thalassa</em></span>
          </NavLink>
          <NavLink href={NAV_PAGES.salinas} className="mn-guest-apt mn-vs">
            <span className="mn-guest-dot" aria-hidden="true"/>
            <span>Hestía <em>Salinas</em></span>
          </NavLink>
        </div>
      )}
    </div>
  );
};

const Header = ({ mode, scrolled, lang }) => {
  const t = COPY[lang];
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const close = () => setMobileOpen(false);
  React.useEffect(() => { close(); }, [lang]);

  // vitMin: se lee de sessionStorage para funcionar en cualquier página
  const [vitMin, setVitMin] = React.useState(() => {
    try {
      if (window.location.pathname.split('/').pop() === 'porque-hestia.html') return true;
      return sessionStorage.getItem('hestia-vit-min') === '1';
    } catch (_) { return false; }
  });
  React.useEffect(() => {
    const sync = () => {
      try { setVitMin(sessionStorage.getItem('hestia-vit-min') === '1'); } catch (_) {}
    };
    window.addEventListener('hestia-vit-change', sync);
    return () => window.removeEventListener('hestia-vit-change', sync);
  }, []);

  // Launch banner — siempre en la home (Vitruvio desactivado en home de momento)
  const [showBanner, setShowBanner] = React.useState(() => {
    try {
      const page = window.location.pathname.split('/').pop();
      return page === '' || page === 'index.html';
    } catch (_) { return false; }
  });
  const [launchEnded, setLaunchEnded] = React.useState(false);
  const dismissBanner = React.useCallback(() => { setShowBanner(false); }, []);

  const toggleVit = () => {
    const next = !vitMin;
    setVitMin(next);
    try { sessionStorage.setItem('hestia-vit-min', next ? '1' : '0'); } catch (_) {}
    window.dispatchEvent(new CustomEvent('hestia-vit-change'));
  };
  const expandVit = () => {
    setVitMin(false);
    try { sessionStorage.setItem('hestia-vit-min', '0'); } catch (_) {}
    window.dispatchEvent(new CustomEvent('hestia-vit-change'));
  };
  const [heroVisible, setHeroVisible] = React.useState(true);
  React.useEffect(() => {
    const hero = document.querySelector('.hero');
    if (!hero || !window.IntersectionObserver) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);
  const vitHidden = !heroVisible;

  // Vitruvio desactivado en la home de momento
  const isHomePage = (() => {
    try { const p = window.location.pathname.split('/').pop(); return p === '' || p === 'index.html'; } catch (_) { return false; }
  })();

  // Banner de lanzamiento — siempre en la home, fondo blanco
  const launchVidRef = React.useRef(null);
  const replayLaunch = () => {
    setLaunchEnded(false);
    if (launchVidRef.current) { launchVidRef.current.currentTime = 0; launchVidRef.current.play().catch(() => {}); }
  };
  const launchBanner = showBanner ? ReactDOM.createPortal(
    <div className="hero-vitruvio hero-vitruvio--launch">
      <div className="hv-launch-card">
        <div className="hv-inner">
          <div className="hv-box">
            <video ref={launchVidRef} autoPlay muted playsInline preload="auto"
                   onEnded={() => setLaunchEnded(true)}>
              <source src="assets/gemini_generated_video_7C740615.mp4" type="video/mp4"/>
            </video>
            {launchEnded && (
              <button type="button" className="hv-replay" onClick={replayLaunch}
                      aria-label={lang === 'es' ? 'Volver a ver' : 'Replay'}>
                ↺
              </button>
            )}
          </div>
        </div>
        <div className={`hv-launch-text${launchEnded ? ' hv-launch-text--visible' : ''}`}>
          <div className="hv-launch-text-inner">
            {lang === 'es'
              ? <><em>Nuestra marca evoluciona, nuestra ilusión continúa.</em>{' '}
                  <a href="porque-hestia.html" className="hv-launch-link">Saber más →</a></>
              : <><em>Our brand evolves, our passion endures.</em>{' '}
                  <a href="porque-hestia.html" className="hv-launch-link">Learn more →</a></>}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="hv-toggle"
        onClick={dismissBanner}
        aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
      >
        ×
      </button>
    </div>,
    document.body
  ) : null;

  // Vitruvio — no se muestra en la home
  const vitruvio = (!isHomePage && !vitMin) ? ReactDOM.createPortal(
    <div className={`hero-vitruvio${vitHidden ? ' hv-offhero' : ''}`}>
      <div className="hv-inner">
        <div className="hv-box">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="assets/hestia-vitruvio.mp4" type="video/mp4"/>
          </video>
          <a href="porque-hestia.html" className="hv-box-link">
            {lang === 'es' ? 'Nuestra marca' : 'Our brand'}
          </a>
        </div>
      </div>
      <button
        type="button"
        className="hv-toggle"
        onClick={toggleVit}
        aria-label={lang === 'es' ? 'Minimizar' : 'Minimise'}
      >
        -
      </button>
    </div>,
    document.body
  ) : null;

  // Sync animation across page navigations using absolute time
  React.useEffect(() => {
    const elapsed = (Date.now() / 1000) % CTA_CYCLE_DURATION;
    document.querySelectorAll('.header nav .cta').forEach(el => {
      el.style.animationDelay = `-${elapsed}s`;
    });
  }, []);

  // Scroll-driven radial glow: update --hdr-scroll (0→1) on the header element
  const headerRef = React.useRef(null);
  React.useEffect(() => {
    const onScroll = () => {
      const ratio = Math.min(window.scrollY / (window.innerHeight * 0.55), 1);
      headerRef.current?.style.setProperty('--hdr-scroll', ratio.toFixed(3));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Magnetic CTA — el botón RESERVA del header atrae el cursor cuando está
  // cerca (radio 80 px). El texto interior desliza max 12 px hacia el
  // cursor, el botón entero 6 px. Spring suave vía transition CSS.
  // Solo en desktop con hover real, off en reduced-motion.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btn = headerRef.current?.querySelector('nav .cta');
    if (!btn) return;
    const inner = btn.querySelector('.cta-text');
    let raf = 0;
    const onMove = (e) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = Math.max(r.width, r.height) + 60;
      if (dist > radius) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.setProperty('--mag-x', '0px');
          btn.style.setProperty('--mag-y', '0px');
          if (inner) {
            inner.style.setProperty('--mag-tx', '0px');
            inner.style.setProperty('--mag-ty', '0px');
          }
        });
        return;
      }
      const strength = 1 - dist / radius;       // 0 lejos → 1 cerca
      const maxBtn = 6;
      const maxTxt = 12;
      const btnX = (dx / radius) * maxBtn * strength;
      const btnY = (dy / radius) * maxBtn * strength;
      const txtX = (dx / radius) * maxTxt * strength;
      const txtY = (dy / radius) * maxTxt * strength;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        btn.style.setProperty('--mag-x', `${btnX.toFixed(2)}px`);
        btn.style.setProperty('--mag-y', `${btnY.toFixed(2)}px`);
        if (inner) {
          inner.style.setProperty('--mag-tx', `${txtX.toFixed(2)}px`);
          inner.style.setProperty('--mag-ty', `${txtY.toFixed(2)}px`);
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      btn.style.setProperty('--mag-x', '0px');
      btn.style.setProperty('--mag-y', '0px');
      if (inner) {
        inner.style.setProperty('--mag-tx', '0px');
        inner.style.setProperty('--mag-ty', '0px');
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('blur', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const NavLink = ({ href, children, className = '' }) => (
    <a href={href} className={`${className} ${isActive(href) ? 'active-page' : ''}`} onClick={close}>
      {children}
    </a>
  );

  return (
    <>
      <header ref={headerRef} className={`header ${mode} ${scrolled ? 'scrolled' : ''}`}>
        <nav className="desktop-nav nav-left">
          <NavLink href={NAV_PAGES.mar}>{t.nav[1]}</NavLink>
          <NavLink href={NAV_PAGES.thalassa}>{t.nav[2]}</NavLink>
          <NavLink href={NAV_PAGES.salinas}>{t.nav[3]}</NavLink>
          <NavLink href={NAV_PAGES.estanciasLargas}>{t.nav[9]}</NavLink>
        </nav>
        <div className="brand-center">
          <a href="index.html" className="brand-lockup" aria-label="Hestía — Inicio">
            <span className="hestia-logo-mark" aria-hidden="true">
              <img decoding="async" src="assets/logo-teal-transparent.png" alt="" className="hestia-logo" width="600" height="600"/>
            </span>
            <span className="wordmark">HESTÍA</span>
            <span className="your-home">your home!</span>
          </a>
          {vitMin && (
            <button type="button" className="hv-logo-btn" onClick={expandVit}
              aria-label={lang === 'es' ? 'Expandir animación Vitruvio' : 'Expand Vitruvio animation'}>
              +
            </button>
          )}
        </div>
        <div className="nav-right-area">
          <nav className="desktop-nav nav-right">
            <NavLink href={NAV_PAGES.nosotros}>{t.nav[4]}</NavLink>
            <NavLink href={NAV_PAGES.opiniones}>{t.nav[5]}</NavLink>
            <NavLink href={NAV_PAGES.noticias}>{t.nav[7]}</NavLink>
            <NavLink href={NAV_PAGES.porqueHestia}>{t.nav[8]}</NavLink>
            <NavLink href={NAV_PAGES.reservas} className="cta"><span className="cta-text">{t.cta_nav}</span></NavLink>
          </nav>
          <button
            className={`hamburger-btn ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <IconClose /> : <IconHamburger />}
          </button>
        </div>
      </header>
      {launchBanner}
      {vitruvio}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <nav className="mobile-nav">
          <div className="mn-label eyebrow">{lang === 'es' ? 'Hestías' : 'Hestías'}</div>
          <div className="mn-apts-grid">
            <div className="mn-apt-row mn-vm">
              <NavLink href={NAV_PAGES.mar} className="mn-apt-link">
                <span className="mn-num">01</span>
                <span className="mn-name">Hestía <em>Mar</em></span>
              </NavLink>
            </div>
            <div className="mn-apt-row mn-vt">
              <NavLink href={NAV_PAGES.thalassa} className="mn-apt-link">
                <span className="mn-num">02</span>
                <span className="mn-name">Hestía <em>Thalassa</em></span>
              </NavLink>
            </div>
            <div className="mn-apt-row mn-vs">
              <NavLink href={NAV_PAGES.salinas} className="mn-apt-link">
                <span className="mn-num">03</span>
                <span className="mn-name">Hestía <em>Salinas</em></span>
              </NavLink>
            </div>
          </div>
          <div className="mn-sep"/>
          <NavLink href={NAV_PAGES.porqueHestia} className="mn-mid-why mn-mid-why-full">
            → {lang === 'es' ? '¿Por qué Hestía?' : 'Why Hestía?'}
          </NavLink>
          <div className="mn-sep"/>
          <div className="mn-pages-row">
            <NavLink href={NAV_PAGES.nosotros} className="mn-page">{t.nav[4]}</NavLink>
            <NavLink href={NAV_PAGES.opiniones} className="mn-page">{t.nav[5]}</NavLink>
            <NavLink href={NAV_PAGES.noticias} className="mn-page">{t.nav[7]}</NavLink>
            <NavLink href={NAV_PAGES.estanciasLargas} className="mn-page">{t.nav[9]}</NavLink>
          </div>
          <div className="mn-cta-row">
            <NavLink href={NAV_PAGES.reservas} className="mobile-cta">{t.cta_nav} →</NavLink>
            <NavLink href={NAV_PAGES.ventajas} className="mn-mid-ventajas mn-ventajas-inline">
              ✓ {lang === 'es' ? 'Ventajas reserva directa' : 'Direct booking perks'}
            </NavLink>
          </div>
          <div className="mn-contacts">
            <a href="https://wa.me/34620316370" target="_blank" rel="noopener">
              <span className="tl-dot"/>Alex · +34 620 316 370
            </a>
            <a href="https://wa.me/34654138251" target="_blank" rel="noopener">
              <span className="tl-dot"/>Fran · +34 654 138 251
            </a>
          </div>
        </nav>
      </div>
    </>
  );
};

const FloatingChat = ({ lang }) => {
  const [open, setOpen] = React.useState(false);
  const WaIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  const TelIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  const persons = [
    {
      id: 'alex',
      name: 'Alex',
      photo: 'assets/photo-alex.jpg',
      photoW: 840, photoH: 1120,
      imgClass: 'avatar-img-alex',
      langLbl: 'Español',
      tel: '+34 620 316 370',
      telHref: 'tel:+34620316370',
      waHref: 'https://wa.me/34620316370',
    },
    {
      id: 'fran',
      name: 'Fran',
      photo: 'assets/photo-fran.jpg',
      photoW: 925, photoH: 2000,
      imgClass: 'avatar-img-fran',
      langLbl: 'English',
      tel: '+34 654 138 251',
      telHref: 'tel:+34654138251',
      waHref: 'https://wa.me/34654138251',
    },
  ];
  return (
    <div className={`float-chat ${open ? 'open' : ''}`}>
      <div className="bubble-panel" role="dialog" aria-hidden={!open} aria-labelledby="float-chat-title">
        <h4 id="float-chat-title">{lang === 'es' ? 'Hablemos.' : 'Let\'s talk.'}</h4>
        <p className="small">
          {lang === 'es'
            ? 'Te responde una persona real. En minutos, no en días.'
            : 'A real person replies. In minutes, not days.'}
        </p>
        {persons.map(p => (
          <div className="contact-person" key={p.id}>
            <div className="avatar avatar-photo">
              <img src={p.photo} alt="" loading="lazy" width={p.photoW} height={p.photoH} className={`avatar-img ${p.imgClass}`}/>
            </div>
            <div className="cp-body">
              <div className="cp-head">
                <span className="cp-name">{p.name}</span>
                <span className="cp-lang">{p.langLbl}</span>
              </div>
              <div className="cp-tel">{p.tel}</div>
              <div className="cp-actions">
                <a className="cp-btn cp-btn-wa" href={p.waHref} target="_blank" rel="noopener"
                   aria-label={`WhatsApp ${p.name}`}>
                  <WaIcon/> WhatsApp
                </a>
                <a className="cp-btn cp-btn-tel" href={p.telHref}
                   aria-label={`${lang === 'es' ? 'Llamar a' : 'Call'} ${p.name}`}>
                  <TelIcon/> {lang === 'es' ? 'Llamar' : 'Call'}
                </a>
              </div>
            </div>
          </div>
        ))}
        <a className="contact-row contact-email" href="mailto:info@hestiayourhome.com">
          <div className="avatar" style={{background: 'var(--arena)', color: 'var(--ber)'}}>@</div>
          <div className="info">
            <div className="name">Email</div>
            <div className="sub">info@hestiayourhome.com</div>
          </div>
        </a>
      </div>
      <button className="bubble-btn" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar chat' : 'Abrir chat'}>
        {open ? <IconClose /> : <IconChat />}
      </button>
    </div>
  );
};

const Cookies = ({ lang }) => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const k = localStorage.getItem('hestia-cookies');
    if (!k) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);
  // Permite re-abrir el banner desde cualquier sitio (footer, /cookies.html…)
  // disparando un evento global. Usuario puede revisar/cambiar el consentimiento
  // sin tener que limpiar el localStorage a mano — RGPD-compliant.
  React.useEffect(() => {
    const reopen = () => {
      localStorage.removeItem('hestia-cookies');
      setVisible(true);
    };
    window.addEventListener('hestia:cookies-reopen', reopen);
    return () => window.removeEventListener('hestia:cookies-reopen', reopen);
  }, []);
  const loadBeacon = () => {
    if (document.querySelector('script[data-cf-beacon]')) return;
    const s = document.createElement('script');
    s.defer = true;
    // Proxy propio para evitar ad-blockers (cloudflareinsights.com está bloqueado).
    // Worker: workers/analytics-proxy — desplegado en hestia-analytics.hestia-vera-almeria.workers.dev
    s.src = 'https://hestia-analytics.hestia-vera-almeria.workers.dev/s.js';
    s.setAttribute('data-cf-beacon',
      '{"token":"770c05669c6b45ea8f1026576fe7dcce",' +
      '"endpoint":"https://hestia-analytics.hestia-vera-almeria.workers.dev/r",' +
      '"spa":true}');
    document.head.appendChild(s);
  };
  // CF Web Analytics es cookieless (sin IPs ni datos personales) → carga siempre,
  // sin esperar consentimiento de cookies.
  React.useEffect(() => { loadBeacon(); }, []);
  const close = (mode) => {
    localStorage.setItem('hestia-cookies', mode);
    setVisible(false);
  };
  return (
    <div className={`cookies ${visible ? 'show' : ''}`}>
      <h5>{lang === 'es' ? 'Cookies necesarias' : 'Cookie notice'}</h5>
      <p>
        {lang === 'es'
          ? <>Usamos una cookie de preferencia (idioma). Las visitas se miden de forma anónima y sin cookies. <a href="cookies.html">Más info</a>.</>
          : <>We use a preference cookie (language). Visits are measured anonymously and without cookies. <a href="cookies.html">More info</a>.</>}
      </p>
      <div className="cookies-btns">
        <button className="essential" onClick={() => close('essential')}>
          {lang === 'es' ? 'Solo esenciales' : 'Only essential'}
        </button>
        <button className="accept" onClick={() => close('accept')}>
          {lang === 'es' ? 'Aceptar' : 'Accept'}
        </button>
      </div>
    </div>
  );
};

const Footer = ({ lang }) => {
  const t = COPY[lang];
  return (
    <footer>
      <div className="footer-grid">
        <div className="col footer-brand">
          <img decoding="async" src="assets/logo-teal-transparent.png" alt="Hestía" className="hestia-logo" loading="lazy" width="600" height="600"/>
          <div className="wordmark" style={{fontSize: 13, marginBottom: 4}}>HESTÍA</div>
          <div className="your-home" style={{fontSize: 9, marginBottom: 16}}>your home!</div>
          <div className="tagline">
            {lang === 'es'
              ? '« Tu hogar lejos de tu casa. »'
              : '« Your home away from home. »'}
          </div>
          <div className="addr">
            Calle Islas Canarias 7<br/>
            04621 Vera Playa, Almería<br/>
            España
          </div>
          <div className="footer-social">
            <a href="https://www.facebook.com/hestiayourhome" target="_blank" rel="noopener" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/hestiayourhome" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://twitter.com/hestiayourhome" target="_blank" rel="noopener" aria-label="Twitter / X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
          <div className="footer-social-cta">
            {lang === 'es'
              ? '¡Ven a Hestía! Síguenos en redes.'
              : 'Come to Hestía! Follow us.'}
          </div>
        </div>
        <div className="col">
          <h5>{t.footer_apts}</h5>
          <ul>
            <li><a href="mar.html">Hestía Mar</a></li>
            <li><a href="thalassa.html">Hestía Thalassa</a></li>
            <li><a href="salinas.html">Hestía Salinas</a></li>
          </ul>
        </div>
        <div className="col">
          <h5>{t.footer_hestia}</h5>
          <ul>
            <li><a href="nosotros.html">{t.nav[4]}</a></li>
            <li><a href="porque-hestia.html">{t.nav[8]}</a></li>
            <li><a href="opiniones.html">{t.nav[5]}</a></li>
            <li><a href="noticias.html">{t.nav[7]}</a></li>
            <li><a href="estancias-largas.html">{t.nav[9]}</a></li>
            <li><a href="privacidad.html">{lang === 'es' ? 'Privacidad' : 'Privacy'}</a></li>
            <li><a href="cookies.html">Cookies</a></li>
            <li><a href="mapa.html">{lang === 'es' ? 'Mapa web' : 'Site map'}</a></li>
            <li>
              <button
                type="button"
                className="footer-linklike"
                onClick={() => window.dispatchEvent(new Event('hestia:cookies-reopen'))}
              >
                {lang === 'es' ? 'Revisar consentimiento' : 'Review consent'}
              </button>
            </li>
          </ul>
        </div>
        <div className="col">
          <h5>{t.footer_contacto}</h5>
          <ul>
            <li><a href="https://wa.me/34620316370">🇪🇸 Alex · WhatsApp</a></li>
            <li><a href="https://wa.me/34654138251">🇬🇧 Fran · WhatsApp</a></li>
            <li><a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a></li>
          </ul>
        </div>
      </div>
      <FooterNewsletter lang={lang} />
      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} HESTÍA YOUR HOME · Alex Berruezo & Fran Moral</div>
        <div className="licences">VFT/AL/01580 · VFT/AL/05535 · VTF/AL/07056</div>
      </div>
    </footer>
  );
};

const FooterNewsletter = ({ lang }) => {
  const [email, setEmail] = React.useState('');
  const [state, setState] = React.useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const raw = email.trim();
    if (!raw.includes('@') || !raw.includes('.')) return;
    setState('sending');
    try {
      const fd = new FormData();
      fd.append('access_key', '95a86784-6d6a-496f-9830-15759c0a3cff');
      fd.append('subject', `Hestía · Newsletter · ${raw}`);
      fd.append('from_name', raw);
      fd.append('email', raw);
      fd.append('message', `Nueva suscripción al newsletter.\nEmail: ${raw}`);
      await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      setState('sent');
    } catch (_) {
      setState('idle');
    }
  };

  return (
    <div className="footer-newsletter" aria-live="polite">
      <span className="footer-nl-label eyebrow">
        {lang === 'es' ? 'Ofertas directas · sin intermediarios' : 'Direct offers · no middleman'}
      </span>
      {state === 'sent' ? (
        <p className="footer-nl-ok">
          {lang === 'es' ? 'Te avisamos. Gracias!' : 'You\'re on the list. Thanks!'}
        </p>
      ) : (
        <form className="footer-nl-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="footer-nl-input"
            placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            maxLength={120}
            aria-label={lang === 'es' ? 'Email para newsletter' : 'Newsletter email'}
            spellCheck={false}
          />
          <button type="submit" className="footer-nl-btn" disabled={state === 'sending'}>
            {state === 'sending' ? '…' : (lang === 'es' ? 'Suscribir' : 'Subscribe')}
          </button>
        </form>
      )}
    </div>
  );
};

Object.assign(window, { Topbar, Header, FloatingChat, Cookies, Footer });
