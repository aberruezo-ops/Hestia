// ================================================================
// HESTÍA — Chrome (topbar, header, cookies, floating chat, footer)
// ================================================================

const Topbar = ({ lang, setLang }) => (
  <div className="topbar">
    <div className="contacts">
      <span>Alex · WhatsApp</span>
      <span className="hide-mobile">+34 620 316 370</span>
      <span className="sep">·</span>
      <span>Fran · WhatsApp</span>
      <span className="hide-mobile">+34 654 138 251</span>
      <span className="sep hide-mobile">·</span>
      <span className="email hide-mobile">info@hestiayourhome.com</span>
    </div>
    <div className="lang">
      <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
      <span className="divider">/</span>
      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
    </div>
  </div>
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

const Header = ({ mode, scrolled, lang }) => {
  const t = COPY[lang];
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const close = () => setMobileOpen(false);

  React.useEffect(() => { close(); }, [lang]);

  return (
    <>
      <header className={`header ${mode} ${scrolled ? 'scrolled' : ''}`}>
        <nav className="desktop-nav nav-left">
          <a href="#apt-vm">{t.nav[1]}</a>
          <a href="#apt-vt">{t.nav[2]}</a>
          <a href="#apt-vs">{t.nav[3]}</a>
        </nav>
        <a href="#top" className="brand-lockup" aria-label="Hestía — Home">
          <img src="assets/logo-teal-transparent.png" alt="Hestía" className="hestia-logo"/>
          <span className="wordmark">HESTÍA</span>
          <span className="your-home">your home!</span>
        </a>
        <div className="nav-right-area">
          <nav className="desktop-nav nav-right">
            <a href="#nosotros">{t.nav[4]}</a>
            <a href="#opiniones">{t.nav[5]}</a>
            <a href="#contacto">{t.nav[6]}</a>
            <a href="#contacto" className="cta">{t.cta_nav}</a>
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

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <nav className="mobile-nav">
          <a href="#apt-vm" onClick={close}>{t.nav[1]}</a>
          <a href="#apt-vt" onClick={close}>{t.nav[2]}</a>
          <a href="#apt-vs" onClick={close}>{t.nav[3]}</a>
          <a href="#nosotros" onClick={close}>{t.nav[4]}</a>
          <a href="#opiniones" onClick={close}>{t.nav[5]}</a>
          <a href="#contacto" onClick={close}>{t.nav[6]}</a>
          <a href="#contacto" className="mobile-cta" onClick={close}>{t.cta_nav}</a>
        </nav>
      </div>
    </>
  );
};

const FloatingChat = ({ lang }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`float-chat ${open ? 'open' : ''}`}>
      <div className="bubble-panel" role="dialog" aria-hidden={!open}>
        <h4>{lang === 'es' ? 'Hablemos.' : 'Let\'s talk.'}</h4>
        <p className="small">
          {lang === 'es'
            ? 'Te responde una persona. En minutos, no en días.'
            : 'A real person replies. In minutes, not days.'}
        </p>
        <a className="contact-row" href="https://wa.me/34620316370" target="_blank" rel="noopener">
          <div className="avatar">A</div>
          <div className="info">
            <div className="name">Alex · WhatsApp</div>
            <div className="sub">Español · +34 620 316 370</div>
          </div>
        </a>
        <a className="contact-row" href="https://wa.me/34654138251" target="_blank" rel="noopener">
          <div className="avatar fran">F</div>
          <div className="info">
            <div className="name">Fran · WhatsApp</div>
            <div className="sub">English · +34 654 138 251</div>
          </div>
        </a>
        <a className="contact-row" href="mailto:info@hestiayourhome.com">
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
      const t = setTimeout(() => setVisible(true), 1400);
      return () => clearTimeout(t);
    }
  }, []);
  const close = (mode) => {
    localStorage.setItem('hestia-cookies', mode);
    setVisible(false);
  };
  return (
    <div className={`cookies ${visible ? 'show' : ''}`}>
      <h5>{lang === 'es' ? 'Cookies necesarias' : 'Cookie notice'}</h5>
      <p style={{margin:0, opacity:0.75, lineHeight:1.5}}>
        {lang === 'es'
          ? 'Usamos cookies para que la web funcione. Puedes elegir.'
          : 'We use cookies to make this site work. You can choose.'}
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
          <img src="assets/logo-teal-transparent.png" alt="Hestía" className="hestia-logo"/>
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
        </div>
        <div className="col">
          <h5>{t.footer_apts}</h5>
          <ul>
            <li><a href="#apt-vm">Hestía Mar</a></li>
            <li><a href="#apt-vt">Hestía Thalassa</a></li>
            <li><a href="#apt-vs">Hestía Salinas</a></li>
          </ul>
        </div>
        <div className="col">
          <h5>{t.footer_hestia}</h5>
          <ul>
            <li><a href="#nosotros">{t.nav[4]}</a></li>
            <li><a href="#opiniones">{t.nav[5]}</a></li>
            <li><a href="#contacto">{t.nav[6]}</a></li>
            <li><a href="#">{lang === 'es' ? 'Privacidad' : 'Privacy'}</a></li>
            <li><a href="#">Cookies</a></li>
          </ul>
        </div>
        <div className="col">
          <h5>{t.footer_contacto}</h5>
          <ul>
            <li><a href="https://wa.me/34620316370">Alex · ES</a></li>
            <li><a href="https://wa.me/34654138251">Fran · EN</a></li>
            <li><a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} HESTÍA YOUR HOME · Alex Berruezo & Fran Moral</div>
        <div className="licences">VFT/AL/01580 · VFT/AL/05535 · VTF/AL/07056</div>
      </div>
    </footer>
  );
};

Object.assign(window, { Topbar, Header, FloatingChat, Cookies, Footer });
