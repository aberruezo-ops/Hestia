// ================================================================
// HESTÍA — Página Nosotros / About
// ================================================================

const NOSOTROS_COPY = {
  es: {
    eyebrow: 'Vera Playa · Almería · desde 2016',
    title: (<>Nosotros, vosotros<br/><em>y Hestía.</em></>),
    sub: 'Dos personas que transformaron tres apartamentos en hogares con alma.',

    intro_title: (<>No somos una empresa.<em>Somos dos personas.</em></>),
    intro_p1: 'Nos conocisteis cuando reservasteis, o quizás ahora mismo es la primera vez. Da igual. Lo importante es que detrás de Hestía no hay una plataforma, ni un gestor, ni una oficina. Estamos nosotros: Alex y Fran. Dos personas reales que cogen el teléfono, que conocen vuestro nombre y que se ocupan de que cuando llegáis, todo esté exactamente como debería.',
    intro_p2: 'Somos un filólogo clásico y un ingeniero informático. Llevamos desde 2016 transformando nuestros apartamentos en Vera Playa en algo que, con suerte, vosotros también podéis llamar hogar durante unos días.',
    intro_quote: '«El hogar no es un lugar, es un sentimiento.»',
    intro_quote_attr: '— Cecelia Ahearn',

    why_eyebrow: 'Por qué Hestía',
    why_title: (<>La diosa griega del hogar.<br/><em>No de las guerras. Del fuego de casa.</em></>),
    why_p: 'En la mitología griega, Hestía guardaba el centro de la casa. Era la diosa pacífica, la que transformaba un lugar en hogar. Eso es exactamente lo que intentamos hacer nosotros: que un apartamento de Vera Playa deje de ser un sitio donde dormir y se convierta en el lugar donde os apetece quedarse.',
    why_quote: '«Porque lo simple, cuando se siente de verdad, deja de ser pequeño y se convierte en algo que el alma nunca olvida.»',
    why_quote_attr: '— Mundoescritos',

    principles_eyebrow: 'Nuestros principios',
    principles_title: (<>Cuatro ideas que nunca<br/><em>negociamos.</em></>),
    principles: [
      { n: '01', t: 'Como si fuera nuestro.', d: 'Diseñamos y cuidamos cada apartamento como si fuera el nuestro propio. Porque en cierto modo lo es. Y porque queremos que vosotros lo sintáis igual.' },
      { n: '02', t: 'El detalle que lo cambia todo.', d: 'El cojín bien puesto, el café que espera, la toalla doblada. No son extras. Son la forma en que os decimos que nos importáis.' },
      { n: '03', t: 'Personas, no clientes.', d: 'Alex y Fran atendemos directamente. Conocemos vuestro nombre antes de que lleguéis y sabemos lo que necesitáis. No hay intermediarios.' },
      { n: '04', t: 'Una estancia que no acaba cuando os vais.', d: 'Vuestra estancia empieza cuando reserváis y termina cuando queréis volver. Eso no es un intercambio económico. Es otra cosa.' },
    ],

    traveler_eyebrow: 'El huésped que nos elige',
    traveler_title: (<>Sabemos para quién<br/><em>existe Hestía.</em></>),
    traveler_intro: 'Hay un tipo de huésped que no viene solo a descansar. Trae consigo el cuidado, la curiosidad y las ganas de que el lugar que visita siga siendo lo que es. Cuida lo que usa, respeta lo que comparte y deja el destino un poco mejor de como lo encontró. Para ese huésped existe Hestía.',
    travelers: [
      { icon: '🏡', t: 'Cuida lo que usa como si fuera suyo.', d: 'El apartamento que deja está tan bien como lo encontró. Sabe que el siguiente huésped también lo merece.' },
      { icon: '🌿', t: 'No solo está: contribuye.', d: 'Recomienda el bar de toda la vida, respeta el silencio de la tarde, deja el entorno mejor de como lo encontró.' },
      { icon: '🔄', t: 'Vuelve. Y trae a alguien.', d: 'Cuando encuentra un lugar donde se ha sentido en casa, vuelve. Y convierte a otros en huéspedes colaborativos.' },
    ],

    team_eyebrow: 'El equipo',
    team_title: (<>Detrás de Hestía hay<br/><em>dos personas reales.</em></>),
    alex_eyebrow: '01 · Creativo · Pre-estancia · Reservas',
    alex_lang: '🇪🇸 Español',
    alex_name: 'Alex Berruezo',
    alex_bio: 'Filólogo clásico. Me ocupo de que Hestía se vea y se sienta como un hogar: la decoración, los detalles de bienvenida, las reservas en español y todo lo que ocurre antes de que lleguéis.',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',
    fran_eyebrow: '02 · Técnico · In-estancia · Reservas',
    fran_lang: '🇬🇧 English',
    fran_name: 'Fran Moral',
    fran_bio: 'Ingeniero informático. Me encargo de que todo funcione cuando estáis aquí: la tecnología, la atención durante la estancia, las reservas en inglés y la operativa invisible.',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    manifest_cta: 'Reservar ahora →',
  },
  en: {
    eyebrow: 'Vera Playa · Almería · since 2016',
    title: (<>Us, you<br/><em>and Hestía.</em></>),
    sub: 'Two people who transformed three apartments into soulful homes.',

    intro_title: (<>{"We're not a company."}<em>{"We're two people."}</em></>),
    intro_p1: "You may have met us when you booked, or perhaps this is the very first time. It doesn't matter. What matters is that behind Hestía there is no platform, no property manager, no office. There's us: Alex and Fran. Two real people who pick up the phone, know your name, and make sure that when you arrive, everything is exactly as it should be.",
    intro_p2: "A classical philologist and a computer engineer. Since 2016 we have been turning our apartments in Vera Playa into something that, with luck, you can also call home for a few days.",
    intro_quote: "«Home isn't a place, it's a feeling.»",
    intro_quote_attr: '— Cecelia Ahearn',

    why_eyebrow: 'Why Hestía',
    why_title: (<>The Greek goddess of the hearth.<br/><em>Not of wars. Of the home fire.</em></>),
    why_p: "In Greek mythology, Hestía kept the heart of the home. She was the peaceful goddess, the one who transformed a place into a home. That is exactly what we try to do: turn an apartment in Vera Playa from a place to sleep into a place you actually want to stay.",
    why_quote: "«Because what is simple, when truly felt, ceases to be small and becomes something the soul never forgets.»",
    why_quote_attr: '— Mundoescritos',

    principles_eyebrow: 'Our principles',
    principles_title: (<>Four ideas we never<br/><em>compromise on.</em></>),
    principles: [
      { n: '01', t: 'As if it were ours.', d: 'We design and care for each apartment as if it were our own. Because in a way it is. And because we want you to feel it the same way.' },
      { n: '02', t: 'The detail that changes everything.', d: 'The neatly placed cushion, the waiting coffee, the folded towel. Not extras. The way we tell you that you matter to us.' },
      { n: '03', t: 'People, not clients.', d: 'Alex and Fran attend to you directly. We know your name before you arrive and what you need. No intermediaries.' },
      { n: '04', t: "A stay that doesn't end when you leave.", d: "Your stay begins when you book and ends when you want to return. That's not an economic exchange. It's something else." },
    ],

    traveler_eyebrow: 'The guest who chooses us',
    traveler_title: (<>We know who<br/><em>Hestía exists for.</em></>),
    traveler_intro: "There is a type of guest who doesn't come just to rest. They bring care, curiosity and a genuine wish to leave the place a little better than they found it. They look after what they use, respect what they share, and make the destination better every day. Hestía exists for that guest.",
    travelers: [
      { icon: '🏡', t: 'Cares for what they use as if it were theirs.', d: 'The apartment they leave is as good as they found it. They know the next guest deserves the same.' },
      { icon: '🌿', t: "They don't just stay: they contribute.", d: 'They recommend the local bar, respect the quiet of the afternoon, leave their surroundings better than they found them.' },
      { icon: '🔄', t: 'They come back. And bring someone.', d: "When they find a place where they felt at home, they return — and turn others into collaborative guests too." },
    ],

    team_eyebrow: 'The team',
    team_title: (<>Behind Hestía there are<br/><em>two real people.</em></>),
    alex_eyebrow: '01 · Creative · Pre-stay · Bookings',
    alex_lang: '🇪🇸 Español',
    alex_name: 'Alex Berruezo',
    alex_bio: "Classical philologist. I make sure Hestía looks and feels like a home: the decoration, the welcome details, Spanish bookings and everything that happens before you arrive.",
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',
    fran_eyebrow: '02 · Technical · In-stay · Bookings',
    fran_lang: '🇬🇧 English',
    fran_name: 'Fran Moral',
    fran_bio: "Computer engineer. I make sure everything works while you're here: technology, in-stay support, English bookings and the invisible operations.",
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    manifest_cta: 'Book now →',
  },
};

const NosotrosHero = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="page-hero nosotros-hero">
      <div className="nosotros-hero-img-wrap" aria-hidden="true">
        <img src="assets/photo-nosotros-hero.jpg" alt="" className="nosotros-hero-img"/>
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

const NosotrosPorQueHestia = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nos-why section-cream">
      <div className="container">
        <div className="eyebrow">{t.why_eyebrow}</div>
        <h2 className="reveal">{t.why_title}</h2>
        <p className="nos-why-p reveal delay-1">{t.why_p}</p>
        <blockquote className="nos-blockquote nos-blockquote-cream reveal delay-2">
          <span className="nos-bq-text">{t.why_quote}</span>
          <cite>{t.why_quote_attr}</cite>
        </blockquote>
      </div>
    </section>
  );
};

const NosotrosPrincipios = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nos-principios">
      <div className="container">
        <div className="eyebrow nos-principios-eyebrow">{t.principles_eyebrow}</div>
        <h2 className="reveal">{t.principles_title}</h2>
        <div className="nos-principios-list">
          {t.principles.map((p, i) => (
            <div key={i} className="nos-principio reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="nos-p-num">{p.n}</div>
              <div className="nos-p-body">
                <div className="nos-p-title">{p.t}</div>
                <div className="nos-p-desc">{p.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NosotrosViajero = ({ lang }) => {
  const t = NOSOTROS_COPY[lang];
  return (
    <section className="nos-viajero section-cream">
      <div className="container">
        <div className="eyebrow">{t.traveler_eyebrow}</div>
        <h2 className="reveal">{t.traveler_title}</h2>
        <p className="nos-viajero-intro reveal delay-1">{t.traveler_intro}</p>
        <div className="nos-viajero-grid">
          {t.travelers.map((v, i) => (
            <div key={i} className="nos-viajero-card reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="nos-viajero-icon">{v.icon}</div>
              <div className="nos-viajero-title">{v.t}</div>
              <div className="nos-viajero-desc">{v.d}</div>
            </div>
          ))}
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
        <div className="eyebrow nos-team-eyebrow">{t.team_eyebrow}</div>
        <h2 className="reveal">{t.team_title}</h2>
        <div className="nosotros-team-grid">
          <div className="nosotros-person reveal">
            <div className="portrait">
              <img src="assets/photo-alex.jpg" alt="Alex Berruezo"
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display='block'); }}/>
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
        <NosotrosPorQueHestia lang={lang} />
        <NosotrosPrincipios lang={lang} />
        <NosotrosViajero lang={lang} />
        <NosotrosTeam lang={lang} />
        <NosotrosManifest lang={lang} />
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
