// ================================================================
// HESTÍA — Página Nosotros / About
// ================================================================

const NOSOTROS_COPY = {
  es: {
    eyebrow: 'Vera Playa · Almería · desde 2016',
    title: (<>Alex y Fran.<br/><em>Vera Playa. Hestía.</em></>),
    sub: 'Las personas detrás de Hestía y su vínculo con Almería.',

    intro_title: (<>No somos una empresa.<em>Somos dos personas.</em></>),
    intro_p1: 'Nos conocisteis cuando reservasteis, o quizás ahora mismo es la primera vez. Da igual. Lo importante es que detrás de Hestía no hay una plataforma, ni un gestor, ni una oficina. Estamos nosotros: Alex y Fran. Dos personas reales que cogen el teléfono, que conocen vuestro nombre y que se ocupan de que cuando llegáis, todo esté exactamente como debería.',
    intro_p2: 'Somos un ingeniero informático y un filólogo clásico. Llevamos desde 2016 transformando nuestros apartamentos en Vera Playa en algo que, con suerte, vosotros también podéis llamar hogar durante unos días.',
    intro_quote: '«El hogar no es un lugar, es un sentimiento.»',
    intro_quote_attr: '— Cecelia Ahearn',

    almeria_eyebrow: 'Nuestro vínculo con Almería',
    almeria_title: (<>Vera Playa no es donde trabajamos.<br/><em>Es donde vivimos.</em></>),
    almeria_p1: 'Hay lugares que escoges y lugares que te eligen. Almería fue lo segundo. Vera Playa llegó a nuestras vidas antes de que supiéramos lo que íbamos a construir aquí. La playa más larga de la costa, el azul más limpio del Mediterráneo, trescientos días de sol al año y una forma de vivir que todavía no ha perdido el pulso de lo auténtico.',
    almeria_p2: 'La provincia más soleada de Europa no es la más conocida. Y precisamente eso la protege. En Almería el turismo todavía convive con la vida real: el bar de toda la vida, los pescadores de la mañana, el mercado del jueves. Llevamos más de una década aquí. Y cada apartamento de Hestía mira al mismo Mediterráneo.',
    almeria_p3: 'Vera Playa es conocida por sus kilómetros de costa protegida, por su playa naturista — una de las más grandes de Europa — y por la tranquilidad de una localidad que sabe lo que tiene sin necesitar demostrarlo. No vendemos Almería porque sea nuestra oficina. La defendemos porque es nuestra casa.',
    almeria_quote: '«Almería tiene la luz más honesta que conozco. No engaña. Lo que ves es lo que es.»',
    almeria_quote_attr: '— Alex Berruezo',

    team_eyebrow: 'El equipo',
    team_title: (<>Detrás de Hestía hay<br/><em>dos personas reales.</em></>),
    alex_eyebrow: '01 · Creativo · Pre-estancia · Reservas',
    alex_lang: '🇪🇸 Español',
    alex_name: 'Alex Berruezo',
    alex_bio: 'Ingeniero informático. Me ocupo de que Hestía se vea y se sienta como un hogar: la decoración, los detalles de bienvenida, las reservas en español y todo lo que ocurre antes de que lleguéis.',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',
    fran_eyebrow: '02 · Técnico · In-estancia · Reservas',
    fran_lang: '🇬🇧 English',
    fran_name: 'Fran Moral',
    fran_bio: 'Filólogo clásico. Me encargo de que todo funcione cuando estáis aquí: la atención durante la estancia, las reservas en inglés y todo lo que hace que vuestra experiencia sea memorable.',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    manifest_cta: 'Reservar ahora →',

    crosslink_label: 'La historia del nombre',
    crosslink_text: 'Descubre por qué se llama Hestía →',
  },
  en: {
    eyebrow: 'Vera Playa · Almería · since 2016',
    title: (<>Alex and Fran.<br/><em>Vera Playa. Hestía.</em></>),
    sub: 'The people behind Hestía and their bond with Almería.',

    intro_title: (<>{"We're not a company."}<em>{"We're two people."}</em></>),
    intro_p1: "You may have met us when you booked, or perhaps this is the very first time. It doesn't matter. What matters is that behind Hestía there is no platform, no property manager, no office. There's us: Alex and Fran. Two real people who pick up the phone, know your name, and make sure that when you arrive, everything is exactly as it should be.",
    intro_p2: "A computer engineer and a classical philologist. Since 2016 we have been turning our apartments in Vera Playa into something that, with luck, you can also call home for a few days.",
    intro_quote: "«Home isn't a place, it's a feeling.»",
    intro_quote_attr: '— Cecelia Ahearn',

    almeria_eyebrow: 'Our bond with Almería',
    almeria_title: (<>Vera Playa isn't where we work.<br/><em>It's where we live.</em></>),
    almeria_p1: 'There are places you choose, and places that choose you. Almería was the second. Vera Playa entered our lives before we knew what we were going to build here. The longest beach on the coast, the clearest blue in the Mediterranean, three hundred days of sun a year, and a way of living that has not yet lost its authentic pulse.',
    almeria_p2: "Europe's sunniest province is not its most famous. And that is precisely what protects it. In Almería, tourism still coexists with real life: the neighbourhood bar that has always been there, the morning fishermen, the Thursday market. We have been here for over a decade. And every Hestía apartment looks out at the same Mediterranean.",
    almeria_p3: 'Vera Playa is known for its kilometres of protected coastline, its naturist beach — one of the largest in Europe — and the calm of a town that knows what it has without needing to prove it. We do not promote Almería because it is our office. We champion it because it is our home.',
    almeria_quote: '"Almería has the most honest light I know. It does not deceive. What you see is what it is."',
    almeria_quote_attr: '— Alex Berruezo',

    team_eyebrow: 'The team',
    team_title: (<>Behind Hestía there are<br/><em>two real people.</em></>),
    alex_eyebrow: '01 · Creative · Pre-stay · Bookings',
    alex_lang: '🇪🇸 Español',
    alex_name: 'Alex Berruezo',
    alex_bio: "Computer engineer. I make sure Hestía looks and feels like a home: the decoration, the welcome details, Spanish bookings and everything that happens before you arrive.",
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',
    fran_eyebrow: '02 · Technical · In-stay · Bookings',
    fran_lang: '🇬🇧 English',
    fran_name: 'Fran Moral',
    fran_bio: "Classical philologist. I make sure everything is exceptional while you're here: in-stay support, English bookings and everything that makes your experience truly memorable.",
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    manifest_cta: 'Book now →',

    crosslink_label: 'The story of the name',
    crosslink_text: "Find out why it's called Hestía →",
  },
};

const NosotrosHero = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="page-hero nosotros-hero">
      <div className="nosotros-hero-img-wrap" aria-hidden="true">
        <img src="assets/photo-nosotros-hero.jpg" alt="" className="nosotros-hero-img"/>
        <WatermarkBadge size={40} pos={{ bottom: 16, right: 16 }}/>
      </div>
      <div className="nosotros-hero-ripple" aria-hidden="true"/>
      <div className="nosotros-hero-wash"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const NosotrosIntro = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nos-intro">
      <div className="container">
        <div className="nos-intro-inner">
          <div className="nos-intro-head">
            <h2 className="reveal">{t.intro_title}</h2>
          </div>
          <div className="nos-intro-body">
            <p className="reveal">{t.intro_p1}</p>
            <p className="reveal delay-1">{t.intro_p2}</p>
            <blockquote className="nos-blockquote reveal delay-2">
              <span className="nos-bq-text">{t.intro_quote}</span>
              <cite>{t.intro_quote_attr}</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

const NosotrosAlmeria = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nos-why section-cream">
      <div className="container">
        <div className="eyebrow">{t.almeria_eyebrow}</div>
        <h2 className="reveal">{t.almeria_title}</h2>
        <p className="nos-why-p reveal delay-1">{t.almeria_p1}</p>
        <p className="nos-why-p reveal delay-2">{t.almeria_p2}</p>
        <p className="nos-why-p reveal delay-2">{t.almeria_p3}</p>
        <blockquote className="nos-blockquote nos-blockquote-cream reveal delay-2">
          <span className="nos-bq-text">{t.almeria_quote}</span>
          <cite>{t.almeria_quote_attr}</cite>
        </blockquote>
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
        <div className="eyebrow nos-team-eyebrow">{t.team_eyebrow}</div>
        <h2 className="reveal">{t.team_title}</h2>
        <div className="nosotros-team-grid">
          <div className="nosotros-person reveal">
            <div className="portrait">
              <img src="assets/photo-alex.jpg" alt="Alex Berruezo"
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display='block'); }}/>
              <WatermarkBadge size={28} pos={{ bottom: 8, right: 8 }}/>
              <SilhouetteSVG gradId="gNA"/>
            </div>
            <div className="nosotros-person-body">
              <div className="eyebrow">{t.alex_eyebrow}</div>
              <div className="nos-person-lang">{t.alex_lang}</div>
              <div className="nosotros-person-name">{t.alex_name}</div>
              <p>{t.alex_bio}</p>
              <blockquote className="nosotros-quote">{t.alex_quote}</blockquote>
              <div className="contacts-inline">
                <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp</a>
                <a href="tel:+34620316370">+34 620 316 370</a>
              </div>
            </div>
          </div>
          <div className="nosotros-person reveal delay-1">
            <div className="portrait">
              <img src="assets/photo-fran.jpg" alt="Fran Moral"
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display='block'); }}/>
              <WatermarkBadge size={28} pos={{ bottom: 8, right: 8 }}/>
              <SilhouetteSVG gradId="gNF"/>
            </div>
            <div className="nosotros-person-body">
              <div className="eyebrow">{t.fran_eyebrow}</div>
              <div className="nos-person-lang">{t.fran_lang}</div>
              <div className="nosotros-person-name">{t.fran_name}</div>
              <p>{t.fran_bio}</p>
              <blockquote className="nosotros-quote">{t.fran_quote}</blockquote>
              <div className="contacts-inline">
                <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp</a>
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

const NosotrosCrosslink = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="pq-crosslink section-cream">
      <div className="eyebrow">{t.crosslink_label}</div>
      <a href="porque-hestia.html" className="pq-cl-link">{t.crosslink_text}</a>
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
        <FraseHogar lang={lang} />
        <NosotrosIntro lang={lang} />
        <NosotrosAlmeria lang={lang} />
        <NosotrosTeam lang={lang} />
        <NosotrosManifest lang={lang} />
        <NosotrosCrosslink lang={lang} />
        <QuickFAQ lang={lang} pageId="nosotros" />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<NosotrosPageApp/>);
