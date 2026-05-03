// ================================================================
// HESTÍA — Secciones parte 2: Counters, Gallery, Team, Manifest, Ratings, Contact
// ================================================================

// --- COUNTERS con animación ---
const useCountUp = (target, duration = 2000, trigger) => {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return val;
};

const Counters = ({ lang }) => {
  const t = COPY[lang];
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const families = useCountUp(900, 2200, seen);
  const sun = useCountUp(320, 2000, seen);
  const apts = useCountUp(3, 1200, seen);

  return (
    <section className="counters" ref={ref} data-screen-label="05 Cifras">
      <div className="inner">
        <div className="eyebrow">{t.counters_eyebrow}</div>
        <div className="counters-grid">
          <div className="counter">
            <div className="num">{families}<span className="plus">+</span></div>
            <div className="lbl">{t.counter_1}</div>
          </div>
          <div className="counter">
            <div className="num">{sun}<span className="unit">{t.days_unit}</span></div>
            <div className="lbl">{t.counter_2}</div>
          </div>
          <div className="counter">
            <div className="num">{apts}</div>
            <div className="lbl">{t.counter_3}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- GALLERY mosaic con parallax suave ---
const Gallery = ({ lang }) => {
  const t = COPY[lang];
  const tiles = [
    { cls: 'g-1 tile-a', caption: 'Vera Playa · Golden hour' },
    { cls: 'g-2 tile-c', caption: 'Hestía Thalassa · SPA' },
    { cls: 'g-3 tile-b', caption: 'Tabernas · the orange desert' },
    { cls: 'g-4 tile-d', caption: 'Salinas de Puerto Rey' },
    { cls: 'g-5 tile-e', caption: 'Cabo de Gata · teal sea' },
    { cls: 'g-6 tile-f', caption: 'Interiores · luz almeriense' },
  ];
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const imgs = el.querySelectorAll('.g-tile .img');
      imgs.forEach((img, i) => {
        const rect = img.parentElement.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const off = (window.innerHeight / 2 - mid) * 0.08 * ((i % 2 === 0) ? 1 : -1);
        img.style.transform = `translateY(${off}px) scale(1.12)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="gallery" ref={ref} data-screen-label="06 Galería">
      <div className="gallery-head">
        <div className="eyebrow">{t.gallery_eyebrow}</div>
        <h2>{t.gallery_title}</h2>
      </div>
      <div className="gallery-mosaic">
        {tiles.map((tile, i) => (
          <div key={i} className={`g-tile ${tile.cls}`}>
            <div className="img"/>
            <div className="caption">— {tile.caption}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- TEAM ---
const Team = ({ lang }) => {
  const t = COPY[lang];
  return (
    <section className="team" id="nosotros" data-screen-label="07 Alex y Fran">
      <div className="container">
        <div className="team-head">
          <div>
            <div className="eyebrow">{t.team_eyebrow}</div>
            <h2>{t.team_title}</h2>
          </div>
          <div>
            <p>{t.team_intro}</p>
          </div>
        </div>
        <div className="team-grid">
          <div className="team-member alex">
            <div className="portrait">
              <svg viewBox="0 0 100 125" className="silhouette" preserveAspectRatio="xMidYMax meet">
                <defs>
                  <linearGradient id="gA" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(240,232,213,0.25)"/>
                    <stop offset="100%" stopColor="rgba(240,232,213,0)"/>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="30" r="18" fill="url(#gA)"/>
                <path d="M20 125 C 20 80, 35 65, 50 65 C 65 65, 80 80, 80 125 Z" fill="url(#gA)"/>
              </svg>
            </div>
            <div className="member-info">
              <span className="role">01 · {t.alex_role}</span>
              <span className="name">Alex <em>Berruezo</em></span>
              <p className="quote">{t.alex_quote}</p>
              <div className="contacts-inline">
                <a href="https://wa.me/34620316370">WhatsApp</a>
                <a href="tel:+34620316370">+34 620 316 370</a>
              </div>
            </div>
          </div>
          <div className="team-member fran">
            <div className="portrait">
              <svg viewBox="0 0 100 125" className="silhouette" preserveAspectRatio="xMidYMax meet">
                <defs>
                  <linearGradient id="gF" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(240,232,213,0.25)"/>
                    <stop offset="100%" stopColor="rgba(240,232,213,0)"/>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="30" r="18" fill="url(#gF)"/>
                <path d="M20 125 C 20 80, 35 65, 50 65 C 65 65, 80 80, 80 125 Z" fill="url(#gF)"/>
              </svg>
            </div>
            <div className="member-info">
              <span className="role">02 · {t.fran_role}</span>
              <span className="name">Fran <em>Moral</em></span>
              <p className="quote">{t.fran_quote}</p>
              <div className="contacts-inline">
                <a href="https://wa.me/34654138251">WhatsApp</a>
                <a href="tel:+34654138251">+34 654 138 251</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- MANIFEST (Huésped colaborativo) ---
const Manifest = ({ lang }) => {
  const t = COPY[lang];
  return (
    <section className="manifest" data-screen-label="08 Huésped colaborativo">
      <div className="manifest-inner">
        <div>
          <div className="eyebrow">{t.manifest_eyebrow}</div>
          <h2>{t.manifest_title}</h2>
          <p className="closing-quote">{t.manifest_quote}</p>
        </div>
        <div className="principles">
          <div className="principle">
            <div className="p-num">i.</div>
            <div className="p-text">{t.manifest_p1}</div>
          </div>
          <div className="principle">
            <div className="p-num">ii.</div>
            <div className="p-text">{t.manifest_p2}</div>
          </div>
          <div className="principle">
            <div className="p-num">iii.</div>
            <div className="p-text">{t.manifest_p3}</div>
          </div>
          <div className="principle">
            <div className="p-num">iv.</div>
            <div className="p-text">{t.manifest_p4}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- RATINGS ---
const Ratings = ({ lang }) => {
  const t = COPY[lang];
  return (
    <section className="ratings" id="opiniones" data-screen-label="09 Opiniones">
      <div className="container">
        <div className="eyebrow">{t.ratings_eyebrow}</div>
        <h2>{t.ratings_title}</h2>
        <p className="ratings-sub">{t.ratings_sub}</p>
        <div className="ratings-grid">
          <div className="rating-card" style={{borderTopColor: 'var(--sol-h)'}}>
            <div className="platform">Booking.com</div>
            <div className="score">9<span className="dec">.8</span><span className="score-max">/10</span></div>
            <div className="desc">{t.rating_booking_desc}</div>
          </div>
          <div className="rating-card" style={{borderTopColor: 'var(--vt)'}}>
            <div className="platform">Airbnb · Superhost</div>
            <div className="score">5<span className="dec">.0</span><span className="score-max">/5</span></div>
            <div className="desc">{t.rating_airbnb_desc}</div>
          </div>
          <div className="rating-card" style={{borderTopColor: 'var(--vs)'}}>
            <div className="platform">Google Maps</div>
            <div className="score">4<span className="dec">.9</span><span className="score-max">/5</span></div>
            <div className="desc">{t.rating_google_desc}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- CONTACT CTA ---
const ContactCTA = ({ lang, availHref }) => {
  const t = COPY[lang];
  return (
    <section className="contact-cta" id="contacto" data-screen-label="10 Contacto">
      <div className="inner">
        <div className="eyebrow">{t.contact_eyebrow}</div>
        <h2>{t.contact_title}</h2>
        <p>{t.contact_sub}</p>
        <div className="ctas">
          <a href="https://wa.me/34620316370" className="btn btn-primary" target="_blank" rel="noopener">
            {t.contact_cta_wa} <span className="arrow">→</span>
          </a>
          <a href="mailto:info@hestiayourhome.com" className="btn btn-ghost-light">
            {t.contact_cta_mail}
          </a>
          {availHref && (
            <a href={availHref} className="btn btn-ghost-light">
              {t.contact_cta_avail} <span className="arrow">→</span>
            </a>
          )}
        </div>
        <div className="address">Calle Islas Canarias 7 · 04621 Vera Playa · Almería</div>
      </div>
    </section>
  );
};

Object.assign(window, { Counters, Gallery, Team, Manifest, Ratings, ContactCTA });
