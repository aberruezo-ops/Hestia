// ================================================================
// HESTÍA — Página Por qué Hestía / Why Hestía
// ================================================================

const PORQUE_COPY = {
  es: {
    eyebrow: 'La idea detrás de Hestía',
    title: (<>Por qué creamos Hestía.<br/><em>Y por qué se llama así.</em></>),
    sub: 'La historia de un nombre, una diosa y tres apartamentos en Vera Playa.',

    origin_eyebrow: 'El origen',
    origin_title: (<>No empezó como un negocio.<br/><em>Empezó como una convicción.</em></>),
    origin_p1: '2016. Alex y Fran tienen tres apartamentos en Vera Playa. Podrían haberlos puesto en una plataforma, cobrado la comisión y desconectado el teléfono. Lo contrario es más difícil y más lento — y es exactamente lo que decidieron hacer.',
    origin_p2: 'Hestía nació de una pregunta: ¿qué pasaría si el apartamento de alquiler que usas de vacaciones te hiciera sentir en casa de verdad? No solo limpio y funcional. En casa — con historia, con carácter, con alguien al otro lado que sabe tu nombre.',
    origin_p3: 'Un ingeniero informático y un filólogo clásico con décadas en Vera Playa. El uno observa y construye; el otro nombra y cuida. Juntos transformaron tres apartamentos en tres hogares con alma propia. Sin oficina. Sin recepción. Con el teléfono siempre encendido.',
    origin_quote: '«Lo más difícil no fue crear Hestía. Fue convencernos de que merecía la pena intentarlo de otra manera.»',
    origin_quote_attr: '— Alex Berruezo',

    name_eyebrow: 'El nombre',
    name_title: (<>Hestía: la diosa del hogar.<br/><em>No de las guerras. Del fuego de casa.</em></>),
    name_p1: 'En la mitología griega, Hestía era la primogénita de los Titanes — la primera en ser devorada por Cronos y la última en ser liberada. Mientras los demás dioses del Olimpo peleaban por la guerra, el amor o el poder, Hestía guardaba la llama. Era la diosa del hogar, del fuego sagrado, del centro de la casa.',
    name_p2: 'En la antigua Grecia, el hogar no era solo un lugar físico: era el fuego que lo hacía vivir. Antes de salir de viaje y al volver, se honraba la llama. La llama que guarda Hestía. Ese fuego era lo que convertía una casa en hogar.',
    name_p3: 'Fran es filólogo clásico — conoce los nombres griegos desde dentro. Cuando llegó el momento de bautizar el proyecto, la respuesta ya existía. Hestía: la que transforma un lugar en hogar. La que guarda el fuego que da bienvenida. Exactamente lo que intentamos ser.',
    name_quote: '«El primer día que lo dijimos en voz alta, supimos que era el único nombre posible.»',
    name_quote_attr: '— Fran Moral',

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

    crosslink_label: 'Conoce a Alex y Fran',
    crosslink_text: 'Ver quiénes somos →',
  },
  en: {
    eyebrow: 'The idea behind Hestía',
    title: (<>Why we created Hestía.<br/><em>And why it has this name.</em></>),
    sub: 'The story of a name, a goddess and three apartments in Vera Playa.',

    origin_eyebrow: 'The origin',
    origin_title: (<>It didn't start as a business.<br/><em>It started as a conviction.</em></>),
    origin_p1: '2016. Alex and Fran have three apartments in Vera Playa. They could have listed them on a platform, collected the commission and switched the phone off. The opposite is harder and slower — and that is exactly what they decided to do.',
    origin_p2: 'Hestía was born from a question: what if the holiday apartment you rent actually made you feel at home? Not just clean and functional. At home — with a history, with character, with someone on the other end who knows your name.',
    origin_p3: 'A computer engineer and a classical philologist with decades in Vera Playa. One observes and builds; the other names and cares. Together they transformed three apartments into three homes with their own soul. No office. No reception desk. With the phone always on.',
    origin_quote: '"The hardest part was not creating Hestía. It was convincing ourselves it was worth trying a different way."',
    origin_quote_attr: '— Alex Berruezo',

    name_eyebrow: 'The name',
    name_title: (<>Hestía: goddess of the hearth.<br/><em>Not of wars. Of the home fire.</em></>),
    name_p1: 'In Greek mythology, Hestía was the firstborn of the Titans — the first to be swallowed by Cronus and the last to be freed. While the other Olympians fought over war, love or power, Hestía tended the flame. She was the goddess of the home, the sacred fire, the heart of the house.',
    name_p2: 'In ancient Greece, the hearth was not just a physical place: it was the fire that made it alive. Before leaving on a journey and upon returning, the flame was honoured. The flame that Hestía keeps. That fire is what turned a house into a home.',
    name_p3: 'Fran is a classical philologist — he knows Greek names from the inside. When the time came to name the project, the answer already existed. Hestía: the one who transforms a place into a home. The keeper of the welcoming fire. Exactly what we try to be.',
    name_quote: '"The first time we said it aloud, we knew it was the only possible name."',
    name_quote_attr: '— Fran Moral',

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

    crosslink_label: 'Meet Alex and Fran',
    crosslink_text: 'Who we are →',
  },
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
  { hex: '#D42B80',
    es: { name: 'Buganvilla', story: 'El magenta que lo invade todo. Trepa por las paredes blancas, cae sobre las terrazas, se escapa por las verjas. La buganvilla es la firma de la costa almeriense: exuberante, insolente, perfecta.' },
    en: { name: 'Bougainvillea', story: 'The magenta that takes over everything. It climbs white walls, spills over terraces, escapes through iron gates. Bougainvillea is the signature of the Almería coast: exuberant, insolent, perfect.' },
  },
  { hex: '#C8975A',
    es: { name: 'Albero', story: 'La tierra almeriense. La pared encalada a las ocho de la mañana. El color que Almería lleva desde la antigüedad: tierra, cerámica, esparto seco.' },
    en: { name: 'Ochre', story: 'Almería earth. The whitewashed wall at eight in the morning. The colour Almería has carried since antiquity: clay, ceramics, dry esparto grass.' },
  },
  { hex: '#D4A84A',
    es: { name: 'Sol almeriense', story: 'La luz de la tarde en verano. Trescientos días al año, este es el color que baña las terrazas de Hestía a las seis. No amarillo. Oro viejo.' },
    en: { name: 'Almería sun', story: "Afternoon light in summer. Three hundred days a year, this is the colour washing Hestía's terraces at six. Not yellow. Old gold." },
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

const PorqueHero = ({ lang }) => {
  const t = PORQUE_COPY[lang];
  const vidRef = React.useRef(null);
  React.useEffect(() => {
    if (vidRef.current) {
      vidRef.current.playbackRate = 0.75;
      vidRef.current.play().catch(() => {});
    }
  }, []);
  return (
    <section className="page-hero porque-hero">
      <video ref={vidRef} className="porque-hero-video"
        src="assets/CF5B0673-5F2B-4434-BF04-65182B57986B.mov"
        muted loop playsInline preload="auto" aria-hidden="true"/>
      <div className="porque-hero-wash"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

const PorqueOrigen = ({ lang }) => {
  const t = PORQUE_COPY[lang];
  return (
    <section className="nos-intro">
      <div className="container">
        <div className="nos-intro-inner">
          <div className="nos-intro-head">
            <div className="eyebrow">{t.origin_eyebrow}</div>
            <h2 className="reveal">{t.origin_title}</h2>
          </div>
          <div className="nos-intro-body">
            <p className="reveal">{t.origin_p1}</p>
            <p className="reveal delay-1">{t.origin_p2}</p>
            <p className="reveal delay-2">{t.origin_p3}</p>
            <blockquote className="nos-blockquote reveal delay-2">
              <span className="nos-bq-text">{t.origin_quote}</span>
              <cite>{t.origin_quote_attr}</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

const PorqueNombre = ({ lang }) => {
  const t = PORQUE_COPY[lang];
  return (
    <section className="nos-why section-cream">
      <div className="container">
        <div className="eyebrow">{t.name_eyebrow}</div>
        <h2 className="reveal">{t.name_title}</h2>
        <p className="nos-why-p reveal delay-1">{t.name_p1}</p>
        <p className="nos-why-p reveal delay-2">{t.name_p2}</p>
        <p className="nos-why-p reveal delay-2">{t.name_p3}</p>
        <blockquote className="nos-blockquote nos-blockquote-cream reveal delay-2">
          <span className="nos-bq-text">{t.name_quote}</span>
          <cite>{t.name_quote_attr}</cite>
        </blockquote>
      </div>
    </section>
  );
};

const PorqueColores = ({ lang }) => (
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

const PorquePrincipios = ({ lang }) => {
  const t = PORQUE_COPY[lang];
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

const PorqueViajero = ({ lang }) => {
  const t = PORQUE_COPY[lang];
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

const PorqueCrosslink = ({ lang }) => {
  const t = PORQUE_COPY[lang];
  return (
    <section className="pq-crosslink section-cream">
      <div className="eyebrow">{t.crosslink_label}</div>
      <a href="nosotros.html" className="pq-cl-link">{t.crosslink_text}</a>
    </section>
  );
};

const PorquePageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Por qué Hestía · Hestía Your Home · Vera Playa'
      : 'Why Hestía · Hestía Your Home · Vera Playa';
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <PorqueHero lang={lang} />
        <PorqueOrigen lang={lang} />
        <PorqueNombre lang={lang} />
        <PorqueColores lang={lang} />
        <PorquePrincipios lang={lang} />
        <PorqueViajero lang={lang} />
        <PorqueCrosslink lang={lang} />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<PorquePageApp/>);
