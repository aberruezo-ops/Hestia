// ================================================================
// HESTÍA — Página Nosotros / About
// ================================================================

const NOSOTROS_COPY = {
  es: {
    eyebrow: 'Quiénes somos',
    title: (<>No somos una recepción.<br/><em>Somos Alex y Fran.</em></>),
    sub: 'En 2016 convertimos tres apartamentos en Hestía — la diosa griega del hogar. Diez años después seguimos limpiando, recibiendo, respondiendo WhatsApp y eligiendo las toallas. Todo lo hacemos nosotros, por eso todo importa.',

    story_eyebrow: 'La historia',
    story_title: (<>Diez años, <em>una playa.</em></>),
    story_p1: 'Todo empezó en 2016. Alex y Fran, dos amigos de Almería con trabajos distintos y una idea compartida: que los apartamentos turísticos podían ser algo más que una llave bajo el felpudo.',
    story_p2: 'Vera Playa, con sus 320 días de sol, el Mediterráneo en teal y el Parque Natural de Cabo de Gata a 40 minutos, era el sitio. Tres apartamentos, tres atmósferas, una sola forma de entender la hospitalidad.',
    story_p3: 'En diez años, más de 900 familias han dormido aquí. Algunas vuelven cada verano. Algunas nos mandan postales. Todas han recibido el mismo trato: el que daríamos en nuestra propia casa.',

    values_eyebrow: 'Lo que nos importa',
    values_title: (<>El huésped <em>colaborativo.</em></>),

    alex_eyebrow: '01 · Creativo · Pre-estancia',
    alex_name: 'Alex Berruezo',
    alex_bio: 'Alex se encarga de que sepas todo antes de llegar. Las rutas, los chiringuitos, los atardeceres. La comunicación pre-estancia, la presentación de los apartamentos, el alma visual de Hestía.',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',

    fran_eyebrow: '02 · Técnico · In-estancia',
    fran_name: 'Fran Moral',
    fran_bio: 'Fran se asegura de que todo funcione mientras estás aquí. Llaves, mantenimiento, incidencias a las 3 de la mañana. Si algo va mal, Fran ya sabe.',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    style_eyebrow: 'Guía de estilo',
    style_title: 'Identidad visual de Hestía',
    style_placeholder: 'La guía de estilo completa — paleta de color, tipografía, voz de marca y más — se publicará aquí próximamente.',
  },
  en: {
    eyebrow: 'Who we are',
    title: (<>Not a front desk.<br/><em>Just Alex & Fran.</em></>),
    sub: 'In 2016 we turned three apartments into Hestía — the Greek goddess of home. Ten years later we still clean, welcome, reply to WhatsApp and choose the towels. We do everything ourselves — that is why it all matters.',

    story_eyebrow: 'The story',
    story_title: (<>Ten years, <em>one beach.</em></>),
    story_p1: 'It all started in 2016. Alex and Fran, two friends from Almería with different jobs and a shared idea: that holiday apartments could be something more than a key under the mat.',
    story_p2: 'Vera Playa, with its 320 days of sun, the teal Mediterranean, and the Cabo de Gata Natural Park 40 minutes away, was the place. Three apartments, three moods, one way of understanding hospitality.',
    story_p3: 'In ten years, more than 900 families have slept here. Some come back every summer. Some send us postcards. All have received the same treatment: the one we would give in our own home.',

    values_eyebrow: 'What matters to us',
    values_title: (<>The collaborative <em>guest.</em></>),

    alex_eyebrow: '01 · Creative · Pre-stay',
    alex_name: 'Alex Berruezo',
    alex_bio: 'Alex makes sure you know everything before you arrive. Routes, beach bars, sunsets. Pre-stay communication, the way the apartments are presented, the visual soul of Hestía.',
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',

    fran_eyebrow: '02 · Technical · In-stay',
    fran_name: 'Fran Moral',
    fran_bio: 'Fran makes sure everything works while you are here. Keys, maintenance, 3am incidents. If something goes wrong, Fran already knows.',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    style_eyebrow: 'Style guide',
    style_title: 'Hestía visual identity',
    style_placeholder: 'The full style guide — colour palette, typography, brand voice and more — will be published here soon.',
  },
};

const NosotrosHero = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="page-hero nosotros-hero">
      <div className="stars"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const NosotrosStory = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nosotros-story section-cream">
      <div className="container">
        <div className="nosotros-story-inner">
          <div className="nosotros-story-head">
            <div className="eyebrow">{t.story_eyebrow}</div>
            <h2 className="reveal">{t.story_title}</h2>
          </div>
          <div className="nosotros-story-text">
            <p className="reveal">{t.story_p1}</p>
            <p className="reveal delay-1">{t.story_p2}</p>
            <p className="reveal delay-2">{t.story_p3}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const NosotrosTeam = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  const SilhouetteSVG = ({ gradId }) => (
    <svg viewBox="0 0 100 125" className="silhouette" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(240,232,213,0.25)"/>
          <stop offset="100%" stopColor="rgba(240,232,213,0)"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="30" r="18" fill={`url(#${gradId})`}/>
      <path d="M20 125 C 20 80, 35 65, 50 65 C 65 65, 80 80, 80 125 Z" fill={`url(#${gradId})`}/>
    </svg>
  );
  return (
    <section className="nosotros-team">
      <div className="container">
        <div className="nosotros-team-grid">
          <div className="nosotros-person reveal">
            <div className="portrait"><SilhouetteSVG gradId="gNA"/></div>
            <div className="nosotros-person-body">
              <div className="eyebrow">{t.alex_eyebrow}</div>
              <div className="nosotros-person-name">{t.alex_name}</div>
              <p>{t.alex_bio}</p>
              <blockquote className="nosotros-quote">{t.alex_quote}</blockquote>
              <div className="contacts-inline">
                <a href="https://wa.me/34620316370">WhatsApp</a>
                <a href="tel:+34620316370">+34 620 316 370</a>
              </div>
            </div>
          </div>
          <div className="nosotros-person reveal delay-1">
            <div className="portrait"><SilhouetteSVG gradId="gNF"/></div>
            <div className="nosotros-person-body">
              <div className="eyebrow">{t.fran_eyebrow}</div>
              <div className="nosotros-person-name">{t.fran_name}</div>
              <p>{t.fran_bio}</p>
              <blockquote className="nosotros-quote">{t.fran_quote}</blockquote>
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

const NosotrosManifest = ({ lang }) => {
  const t = COPY[lang];
  return (
    <section className="manifest">
      <div className="manifest-inner">
        <div>
          <div className="eyebrow">{t.manifest_eyebrow}</div>
          <h2>{t.manifest_title}</h2>
          <p className="closing-quote">{t.manifest_quote}</p>
        </div>
        <div className="principles">
          {['manifest_p1','manifest_p2','manifest_p3','manifest_p4'].map((key, i) => (
            <div key={i} className="principle">
              <div className="p-num">{['i.','ii.','iii.','iv.'][i]}</div>
              <div className="p-text">{t[key]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NosotrosStylePlaceholder = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nosotros-style section-cream">
      <div className="container">
        <div className="eyebrow">{t.style_eyebrow}</div>
        <h2 className="reveal">{t.style_title}</h2>
        <div className="style-placeholder reveal">
          <div className="style-placeholder-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <p>{t.style_placeholder}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const NosotrosPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Nosotros · Hestía Your Home · Vera Playa'
      : 'About us · Hestía Your Home · Vera Playa';
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <NosotrosHero lang={lang} />
        <NosotrosStory lang={lang} />
        <NosotrosTeam lang={lang} />
        <NosotrosManifest lang={lang} />
        <NosotrosStylePlaceholder lang={lang} />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<NosotrosPageApp/>);
