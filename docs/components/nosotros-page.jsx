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
    intro_p2: 'Somos un ingeniero informático y un filólogo clásico. Llevamos desde 2016 transformando nuestros apartamentos en Vera Playa en algo que, con suerte, vosotros también podéis llamar hogar durante unos días.',
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
    alex_bio: 'Ingeniero informático. Me ocupo de que Hestía se vea y se sienta como un hogar: la decoración, los detalles de bienvenida, las reservas en español y todo lo que ocurre antes de que lleguéis.',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',
    fran_eyebrow: '02 · Técnico · In-estancia · Reservas',
    fran_lang: '🇬🇧 English',
    fran_name: 'Fran Moral',
    fran_bio: 'Filólogo clásico. Me encargo de que todo funcione cuando estáis aquí: la atención durante la estancia, las reservas en inglés y todo lo que hace que vuestra experiencia sea memorable.',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',

    manifest_cta: 'Reservar ahora →',
  },
  en: {
    eyebrow: 'Vera Playa · Almería · since 2016',
    title: (<>Us, you<br/><em>and Hestía.</em></>),
    sub: 'Two people who transformed three apartments into soulful homes.',

    intro_title: (<>{"We're not a company."}<em>{"We're two people."}</em></>),
    intro_p1: "You may have met us when you booked, or perhaps this is the very first time. It doesn't matter. What matters is that behind Hestía there is no platform, no property manager, no office. There's us: Alex and Fran. Two real people who pick up the phone, know your name, and make sure that when you arrive, everything is exactly as it should be.",
    intro_p2: "A computer engineer and a classical philologist. Since 2016 we have been turning our apartments in Vera Playa into something that, with luck, you can also call home for a few days.",
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
    alex_bio: "Computer engineer. I make sure Hestía looks and feels like a home: the decoration, the welcome details, Spanish bookings and everything that happens before you arrive.",
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',
    fran_eyebrow: '02 · Technical · In-stay · Bookings',
    fran_lang: '🇬🇧 English',
    fran_name: 'Fran Moral',
    fran_bio: "Classical philologist. I make sure everything is exceptional while you're here: in-stay support, English bookings and everything that makes your experience truly memorable.",
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

const BRAND_PALETTE = [
  { hex: '#2A0F2E',
    es: { name: 'Berenjena', story: 'El cielo de Vera Playa a las tres de la madrugada. Morado oscuro, casi negro — la noche mediterránea antes de que el horizonte empiece a abrirse. El color base de todo.' },
    en: { name: 'Aubergine', story: 'The Vera Playa sky at three in the morning. Dark purple, almost black — the Mediterranean night before the horizon begins to open. The base colour of everything.' },
  },
  { hex: '#7B3B6B',
    es: { name: 'Violeta', story: 'El instante entre la noche y el amanecer. El horizonte se tiñe de violeta justo antes de que llegue el azul del mar. Dura menos de veinte minutos. Hay que estar despierto.' },
    en: { name: 'Violet', story: 'The moment between night and dawn. The horizon turns violet just before the blue of the sea arrives. It lasts less than twenty minutes. You have to be awake.' },
  },
  { hex: '#1BC8D8',
    es: { name: 'Turquesa', story: 'El mar y el cielo al amanecer. No el azul eléctrico de postal — el turquesa real, limpio y luminoso, que el Mediterráneo y el cielo de Almería comparten solo en los primeros minutos del día.' },
    en: { name: 'Turquoise', story: 'The sea and sky at dawn. Not the electric blue of postcards — the real turquoise, clean and luminous, that the Mediterranean and the Almería sky share only in the first minutes of the day.' },
  },
  { hex: '#6B7A3A',
    es: { name: 'Verde olivo', story: 'El olivar de Vera Playa con la luz lateral de la mañana. Desde Hestía Mar se ve el mar entre las ramas. Este verde existe en Almería desde antes que Roma.' },
    en: { name: 'Olive green', story: 'The Vera Playa olive grove in the side-light of morning. From Hestía Mar you see the sea between the branches. This green existed in Almería before Rome did.' },
  },
  { hex: '#3A7D44',
    es: { name: 'Verde tropical', story: 'El verde que deja boquiabierto. Agapantos, buganvillas, estrelitzias, palmeras — la vegetación de la costa almeriense que no debería existir aquí y existe. Una exuberancia que solo el sol y el mar juntos pueden explicar.' },
    en: { name: 'Tropical green', story: 'The green that stops you in your tracks. Agapanthus, bougainvillea, bird-of-paradise, palms — the coastal Almería vegetation that should not exist here and does. An abundance that only sun and sea together can explain.' },
  },
  { hex: '#C8975A',
    es: { name: 'Albero', story: 'La tierra almeriense. La pared encalada a las ocho de la mañana. El color que Almería lleva desde la antigüedad: tierra, cerámica, esparto seco.' },
    en: { name: 'Ochre', story: 'Almería earth. The whitewashed wall at eight in the morning. The colour Almería has carried since antiquity: clay, ceramics, dry esparto grass.' },
  },
  { hex: '#D4A84A',
    es: { name: 'Sol almeriense', story: 'La luz de la tarde en verano. Trescientos días al año, este es el color que baña las terrazas de Hestía a las seis. No amarillo. Oro viejo.' },
    en: { name: 'Almería sun', story: 'Afternoon light in summer. Three hundred days a year, this is the colour washing Hestía\'s terraces at six. Not yellow. Old gold.' },
  },
  { hex: '#8B4A1E',
    es: { name: 'Siena', story: 'El crepúsculo sobre el Mediterráneo. Cuando el sol toca el agua el cielo se vuelve de este color exacto — naranja rojizo, cálido, irrepetible.' },
    en: { name: 'Sienna', story: 'Dusk over the Mediterranean. When the sun touches the water the sky turns this exact colour — red-orange, warm, unrepeatable.' },
  },
  { hex: '#F0E8D5',
    es: { name: 'Arena', story: 'La calima y la arena del Sahara. El polvo fino que llega en verano convierte la luz en algo sólido. Hestía huele a esto: sal, arena, lino.' },
    en: { name: 'Sand', story: 'Calima and Saharan sand. The fine dust that arrives in summer turns the light solid. Hestía smells of this: salt, sand, linen.' },
  },
];

const NosotrosColores = ({ lang }) => (
  <section className="nos-colores section-cream">
    <div className="container">
      <div className="eyebrow">{lang === 'es' ? 'La paleta de Hestía' : 'The Hestía palette'}</div>
      <h2 className="reveal">
        {lang === 'es'
          ? <><em>No inventamos</em> nuestros colores.<br/>Los encontramos aquí.</>
          : <><em>We didn't invent</em> our colours.<br/>We found them here.</>}
      </h2>
      <p className="nos-colores-intro reveal delay-1">
        {lang === 'es'
          ? 'Vera Playa tiene una luz que cambia cada hora y una naturaleza que deja boquiabierto. Un ingeniero que observa y un filólogo que nombra. Así nació la paleta de Hestía: nueve colores del paisaje almeriense, capturados y convertidos en marca.'
          : 'Vera Playa has a light that changes every hour and a nature that leaves you breathless. An engineer who observes and a philologist who names. That is how the Hestía palette was born: nine colours of the Almería landscape, captured and turned into a brand.'}
      </p>
      <div className="nos-colores-grid">
        {BRAND_PALETTE.map((c, i) => {
          const d = c[lang];
          return (
            <div key={i} className="nos-color-card reveal" style={{ transitionDelay: `${i * 0.09}s` }}>
              <div className="nos-color-swatch" style={{ background: c.hex }}/>
              <div>
                <div className="nos-color-hex">{c.hex}</div>
                <div className="nos-color-name">{d.name}</div>
                <p className="nos-color-story">{d.story}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

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
        <NosotrosColores lang={lang} />
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
