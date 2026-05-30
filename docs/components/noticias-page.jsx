// ================================================================
// HESTÍA — Noticias & Blog
// Actualizado mensualmente. Edición: Junio 2026
// ================================================================

const NOTICIAS = {
  edition:  { es: 'Junio 2026',   en: 'June 2026'   },
  updated:  { es: 'Actualizado cada mes por Hestía', en: 'Updated monthly by Hestía' },

  // ── La Voz de Hestía ──────────────────────────────────────────
  voz: [
    {
      num: '01', apt: 'Hestía Mar', slug: 'mar.html', accent: 'var(--vm)',
      curiosidad: {
        es: 'El 12 de junio Vera Playa entra en temporada alta. El complejo se llena, el Mediterráneo alcanza los 22-23°C y el agua deja de sorprender — simplemente abraza. La terraza esquinera de Hestía Mar tiene su mejor luz al final de la tarde, cuando el sol rasante baña el olivar de dorado.',
        en: 'On 12 June, Vera Playa enters high season. The complex fills up, the Mediterranean reaches 22-23°C and the water stops surprising — it simply holds you. Hestía Mar\'s corner terrace catches its best light in late afternoon, when the low sun turns the olive grove gold.',
      },
      reco: {
        es: 'Chiringuito de la Playa de Puerto Rey: pide el pulpo a la plancha sobre sal de las salinas locales. Es el único chiringuito de la playa que tiene proveedor propio de sal de Puerto Rey. Llega antes de las 14h para primera fila.',
        en: 'Puerto Rey beach bar: order the grilled octopus on local salt-flat salt — the only beach bar on the strip with its own Puerto Rey salt supplier. Get there before 2pm for a front-row spot.',
      },
    },
    {
      num: '02', apt: 'Hestía Thalassa', slug: 'thalassa.html', accent: 'var(--vt)',
      curiosidad: {
        es: 'En las noches despejadas de junio, el Salar de los Canos refleja la luna llena con más nitidez que un espejo. No hace falta irse a ningún sitio — siéntate en la terraza del ático con una copa de vino y mira hacia el interior. Es de las pocas cosas que salen mejor sin moverse.',
        en: 'On clear June nights, the Salar de los Canos reflects the full moon more precisely than a mirror. You don\'t need to go anywhere — sit on the penthouse terrace with a glass of wine and look inland. It\'s one of those rare things that is better without moving.',
      },
      reco: {
        es: 'La noche del 23 al 24 de junio, hogueras de San Juan en toda la playa de Vera. Desde el ático tienes una vista aérea de todas las fogatas a la vez. Baja a la playa hacia las 23h para la parte de saltar las llamas — es tradición local que no sale en ningún folleto turístico.',
        en: 'On the night of 23-24 June, San Juan bonfires run the length of Vera beach. From the penthouse you get an aerial view of every fire at once. Head down to the beach around 11pm for the flame-jumping — a local tradition you won\'t find in any tourist brochure.',
      },
    },
    {
      num: '03', apt: 'Hestía Salinas', slug: 'salinas.html', accent: 'var(--vs-dk)',
      curiosidad: {
        es: 'Las Salinas de Puerto Rey en junio pasan de rosa pálido a rojo intenso. El pigmento viene de la alga Dunaliella salina, que produce betacaroteno para protegerse del calor creciente. A 50 metros de la puerta de Salinas tienes uno de los fenómenos naturales más fotogénicos de la costa mediterránea.',
        en: 'The Puerto Rey salt flats shift from pale pink to deep red in June. The colour comes from the Dunaliella salina alga, which produces beta-carotene to shield itself from the rising heat. Fifty metres from Salinas\'s front door, one of the most photogenic natural phenomena on the Mediterranean coast.',
      },
      reco: {
        es: 'La ruta de los flamencos rosados sale desde el aparcamiento norte del Parque Natural. En junio hay entre 200 y 400 ejemplares. El mejor momento es media tarde, cuando vuelan en bandada hacia la laguna interior. No hacen falta prismáticos — se ven a simple vista desde el camino.',
        en: 'The flamingo trail starts from the north car park of the Natural Park. In June there are between 200 and 400 birds. Best time is mid-afternoon, when they fly in formation toward the inner lagoon. No binoculars needed — they\'re clearly visible from the path.',
      },
    },
  ],

  // ── Noticias del territorio ───────────────────────────────────
  territorio: [
    {
      cat:  { es: 'Vera Playa & alrededores', en: 'Vera Playa & surroundings' },
      icon: '🔥',
      accent: 'var(--sol)',
      articles: [
        {
          tag:    { es: 'Tradición',     en: 'Tradition'    },
          titulo: { es: 'Noche de San Juan — hogueras en la playa el 23 de junio', en: 'Midsummer Night — bonfires on the beach, 23 June' },
          cuerpo: {
            es: 'La noche más corta del año, la de San Juan, es la más celebrada en la costa almeriense. Hogueras en la orilla desde las 22h, música y la tradición de saltar las llamas para purificar el año. En Vera Playa no hay mando central — se improvisa en familia, calle a calle, chiringuito a chiringuito. Lleva algo para quemar.',
            en: 'The shortest night of the year is the most celebrated on the Almería coast. Bonfires along the shore from 10pm, music and the tradition of jumping the flames to cleanse the year ahead. In Vera Playa there\'s no central organisation — it unfolds family by family, street by street, bar by bar. Bring something to burn.',
          },
        },
        {
          tag:    { es: 'Mar',           en: 'Sea'          },
          titulo: { es: 'El agua llega a 22°C — empieza la temporada de snorkel', en: 'Sea temperature hits 22°C — snorkel season begins' },
          cuerpo: {
            es: 'Con el agua sobre los 22 grados, las calas de Cala del Cuervo y Los Cocedores (a 15 km por carretera costera) se vuelven practicables para el snorkel sin traje. Posidonia oceánica, peces piedra, sepias y pulpos pequeños. Lleva gafas y tubo — las aletas son optativas.',
            en: 'With sea temperatures above 22°C, the coves at Cala del Cuervo and Los Cocedores (15km along the coast road) become practical for wetsuit-free snorkelling. Posidonia meadows, scorpionfish, cuttlefish and small octopus. Bring mask and snorkel — fins optional.',
          },
        },
        {
          tag:    { es: 'Mercado',       en: 'Market'       },
          titulo: { es: 'Mercado nocturno de Vera pueblo — viernes y sábados desde las 21h', en: 'Vera village night market — Fridays and Saturdays from 9pm' },
          cuerpo: {
            es: 'Vera pueblo recupera su mercado nocturno de verano en la Plaza Mayor y el entorno de la fortaleza. Artesanía local, productos del campo, limonada fría y música en directo. A 10 minutos en coche desde Hestía. El ambiente de las primeras noches de junio — todavía sin la multitud de agosto — es el mejor del año.',
            en: 'Vera village revives its summer night market around the main square and fortress. Local crafts, farm produce, cold lemonade and live music. 10 minutes by car from Hestía. The early-June atmosphere — still without the August crowds — is the best of the year.',
          },
        },
      ],
    },
    {
      cat:  { es: 'Almería capital & provincia', en: 'Almería city & province' },
      icon: '🌿',
      accent: 'var(--vm)',
      articles: [
        {
          tag:    { es: 'Naturaleza',    en: 'Nature'       },
          titulo: { es: 'Cabo de Gata en junio — última ventana antes del calor extremo', en: 'Cabo de Gata in June — last window before the heat' },
          cuerpo: {
            es: 'El parque natural es visitable en junio antes de las 9h o después de las 19h sin el peso del calor de julio. La ruta del Faro de Mesa Roldán al Playazo de Rodalquilar es la menos masificada de todo el parque y tiene las mejores vistas del litoral. Lleva agua de más.',
            en: 'The natural park is walkable in June before 9am or after 7pm, before July\'s punishing heat sets in. The trail from Mesa Roldán lighthouse to Playazo de Rodalquilar is the least crowded in the whole park and has the best coastal views. Bring extra water.',
          },
        },
        {
          tag:    { es: 'Cultura',       en: 'Culture'      },
          titulo: { es: 'Almería de Escena — teatro en los Reales Alcázares, todo junio', en: 'Almería on Stage — theatre in the Royal Alcazar, all June' },
          cuerpo: {
            es: 'El festival de artes escénicas de Almería capital llena los Reales Alcázares y el Patio de Armas de teatro, danza contemporánea y música clásica. Entradas desde 12 €, muchas actuaciones al aire libre gratuitas. A 1h 15\' de Vera — es una noche perfecta.',
            en: 'Almería\'s performing arts festival fills the Royal Alcazar and its courtyard with theatre, contemporary dance and classical music. Tickets from €12, many outdoor performances free. 1h 15\' from Vera — a perfect evening out.',
          },
        },
      ],
    },
    {
      cat:  { es: 'Andalucía', en: 'Andalucía' },
      icon: '🎶',
      accent: 'var(--vt)',
      articles: [
        {
          tag:    { es: 'Festival',      en: 'Festival'     },
          titulo: { es: 'Festival Internacional de Música y Danza de Granada — junio y julio en el Generalife', en: 'Granada International Music and Dance Festival — June and July in the Generalife' },
          cuerpo: {
            es: 'Uno de los festivales más importantes de Europa, con la Alhambra y los jardines del Generalife como escenario. Orquesta, flamenco, ballet y danza contemporánea bajo las estrellas. Granada está a 2h 15\' de Vera Playa — merece una noche fuera. Las entradas se venden con meses de antelación.',
            en: 'One of Europe\'s most important festivals, with the Alhambra and Generalife gardens as the stage. Orchestra, flamenco, ballet and contemporary dance under the stars. Granada is 2h 15\' from Vera Playa — worth a night away. Tickets sell months in advance.',
          },
        },
        {
          tag:    { es: 'Gastronomía',   en: 'Food'         },
          titulo: { es: 'Tomate Huevo de Toro de Almería — la cosecha llega a los mercados', en: 'Almería\'s Huevo de Toro tomato — the harvest hits the markets' },
          cuerpo: {
            es: 'El tomate Huevo de Toro, variedad antigua almeriense de hasta 800 gramos, llega en junio a los mercados locales. Es el tomate del verano — sabe a lo que un tomate debería saber. En el mercado de Vera pueblo los sábados por la mañana cuestan menos de 2 €/kg comprados al agricultor directamente.',
            en: 'The Huevo de Toro tomato — an ancient Almería variety weighing up to 800 grams — arrives at local markets in June. This is the summer tomato, tasting exactly as a tomato should. At the Saturday market in Vera village, direct from the grower for under €2/kg.',
          },
        },
        {
          tag:    { es: 'Playa',         en: 'Beach'        },
          titulo: { es: 'Carreras de caballos en la playa de Sanlúcar de Barrameda — ya hay fechas para agosto', en: 'Horse racing on Sanlúcar de Barrameda beach — August dates announced' },
          cuerpo: {
            es: 'Las carreras de caballos en la orilla del Guadalquivir son una de las citas más singulares del verano andaluz. Sanlúcar está a 3h 40\' de Vera Playa. Si estáis disponibles en agosto y tenéis coche, es una experiencia sin equivalente en España — y las entradas para la zona de palcos se agotan en junio.',
            en: 'Horse racing on the bank of the Guadalquivir river is one of Andalusia\'s most singular summer events. Sanlúcar is 3h 40\' from Vera Playa. If you\'re free in August and have a car, there\'s nothing else quite like it in Spain — and grandstand tickets sell out in June.',
          },
        },
      ],
    },
    {
      cat:  { es: 'Murcia',   en: 'Murcia'   },
      icon: '⛵',
      accent: 'var(--vs-dk)',
      articles: [
        {
          tag:    { es: 'Tradición',     en: 'Tradition'    },
          titulo: { es: 'Noche de San Juan en Águilas — la mayor hoguera del Mediterráneo español', en: 'Midsummer Night in Águilas — the largest bonfire on the Spanish Mediterranean' },
          cuerpo: {
            es: 'El municipio de Águilas, a 50 km de Vera Playa, celebra la Noche de San Juan con la hoguera más grande del litoral: una construcción de varios metros de alto que se quema en la playa de El Hornillo. El espectáculo dura desde las 23h hasta el amanecer. Lleva ropa que no te importe manchar.',
            en: 'The town of Águilas, 50km from Vera Playa, celebrates Midsummer Night with the largest bonfire on the coast: a multi-storey structure burned on El Hornillo beach. The spectacle runs from 11pm to dawn. Wear clothes you don\'t mind getting smoky.',
          },
        },
        {
          tag:    { es: 'Música',        en: 'Music'        },
          titulo: { es: 'Festival de Jazz de Murcia — segunda quincena de junio', en: 'Murcia Jazz Festival — second half of June' },
          cuerpo: {
            es: 'El festival de jazz de la capital murciana ocupa los jardines del Malecón y la plaza de la Catedral con conciertos al aire libre. Entrada libre para la mayoría de actuaciones. Murcia está a 1h 30\' de Vera Playa. Combínalo con una cena de tapas en el Barrio del Carmen.',
            en: 'The Murcia jazz festival fills the Malecón gardens and Cathedral square with open-air concerts. Free entry for most performances. Murcia is 1h 30\' from Vera Playa. Combine with tapas in the Carmen quarter.',
          },
        },
        {
          tag:    { es: 'Verano',        en: 'Summer'       },
          titulo: { es: 'Cala Cortina, Cartagena — la piscina natural del Mediterráneo', en: 'Cala Cortina, Cartagena — the Mediterranean\'s natural pool' },
          cuerpo: {
            es: 'A 1h 15\' de Vera Playa, Cala Cortina es la cala urbana más bien conservada del litoral murciano. Aguas turquesas, arena fina y servicio de hamacas. En junio todavía se puede aparcar sin dar vueltas. A partir de julio hay que llegar antes de las 9h.',
            en: 'One hour fifteen minutes from Vera Playa, Cala Cortina is the best-preserved urban cove on the Murcia coast. Turquoise water, fine sand and sun lounger hire. In June you can still park without circling. From July onwards, arrive before 9am.',
          },
        },
      ],
    },
  ],
};

// ── Histórico de ediciones ────────────────────────────────────────

const NoticiasArchivo = ({ lang }) => {
  const [data, setData] = React.useState(null);
  const [open, setOpen] = React.useState(null); // key de la edición expandida

  React.useEffect(() => {
    fetch('data/noticias-historico.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.editions) setData(d.editions); })
      .catch(() => {});
  }, []);

  if (!data || !data.length) return null;

  const toggle = (key) => setOpen(k => k === key ? null : key);

  return (
    <section className="noticias-archivo">
      <div className="container">
        <div className="eyebrow noticias-archivo-eyebrow">
          {lang === 'es' ? 'Ediciones anteriores' : 'Previous editions'}
        </div>
        <h2 className="noticias-archivo-title">
          {lang === 'es'
            ? <>El territorio mes a mes</>
            : <>The territory, month by month</>}
        </h2>
        <div className="archivo-list">
          {data.map((ed) => (
            <div key={ed.key} className={`archivo-item${open === ed.key ? ' open' : ''}`}>
              <button
                type="button"
                className="archivo-toggle"
                onClick={() => toggle(ed.key)}
                aria-expanded={open === ed.key}
              >
                <span className="archivo-toggle-label">{ed.edition[lang]}</span>
                <span className="archivo-toggle-chev" aria-hidden="true">{open === ed.key ? '↑' : '↓'}</span>
              </button>
              {open === ed.key && (
                <div className="archivo-content">
                  <div className="voz-grid">
                    {ed.voz.map((item, i) => <VozCard key={i} item={item} lang={lang} />)}
                  </div>
                  <div className="noticias-terr-grid" style={{ marginTop: 40 }}>
                    {ed.territorio.map((cat, ci) => (
                      <div key={ci} className="noticias-cat" style={{ '--cat-accent': cat.accent }}>
                        <div className="noticias-cat-head">
                          <span className="noticias-cat-icon">{cat.icon}</span>
                          <h3 className="noticias-cat-name">{cat.cat[lang]}</h3>
                        </div>
                        <div className="noticias-articles">
                          {cat.articles.map((a, ai) => <ArticleCard key={ai} article={a} lang={lang} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Compartir ─────────────────────────────────────────────────────

const ShareSection = ({ lang }) => {
  const [shared, setShared] = React.useState(false);
  const url   = 'https://www.hestiayourhome.com/noticias.html';
  const title = lang === 'es'
    ? 'Noticias & Blog de Hestía — Vera Playa, Almería'
    : 'News & Blog by Hestía — Vera Playa, Almería';
  const text  = lang === 'es'
    ? 'Noticias mensuales del territorio: Vera Playa, Almería, Andalucía y Murcia.'
    : 'Monthly news from the territory: Vera Playa, Almería, Andalucía and Murcia.';

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); setShared(true); } catch (_) {}
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + url)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + url)}`;
  const xHref  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <section className="noticias-share">
      <div className="noticias-share-inner">
        <p className="noticias-share-text">
          {lang === 'es'
            ? '¿Te ha gustado? Comparte con alguien que vaya a la zona.'
            : 'Enjoyed it? Share with someone heading to the area.'}
        </p>
        <div className="noticias-share-btns">
          <button type="button" className="noticias-share-btn" onClick={handleShare}>
            {shared
              ? (lang === 'es' ? 'Compartido ✓' : 'Shared ✓')
              : (lang === 'es' ? 'Compartir' : 'Share')}
          </button>
          <a href={waHref} className="noticias-share-btn noticias-share-wa" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={xHref} className="noticias-share-btn noticias-share-x" target="_blank" rel="noopener noreferrer">
            X / Twitter
          </a>
        </div>
      </div>
    </section>
  );
};

// ── Componentes ───────────────────────────────────────────────────

const VozCard = ({ item, lang }) => (
  <div className="voz-card" style={{ '--voz-accent': item.accent }}>
    <div className="voz-card-head">
      <span className="voz-num">{item.num}</span>
      <a href={item.slug} className="voz-apt-name">{item.apt}</a>
    </div>
    <div className="voz-block">
      <div className="voz-block-label">
        {lang === 'es' ? '💡 Curiosidad del mes' : '💡 This month\'s curiosity'}
      </div>
      <p className="voz-block-text">{item.curiosidad[lang]}</p>
    </div>
    <div className="voz-block">
      <div className="voz-block-label">
        {lang === 'es' ? '★ Recomendación Hestía' : '★ Hestía recommends'}
      </div>
      <p className="voz-block-text">{item.reco[lang]}</p>
    </div>
    <a href={item.slug} className="voz-apt-link">
      {lang === 'es' ? `Ver ${item.apt} →` : `See ${item.apt} →`}
    </a>
  </div>
);

const ArticleCard = ({ article, lang }) => (
  <div className="noticias-article">
    <span className="noticias-tag">{article.tag[lang]}</span>
    <h3 className="noticias-titulo">{article.titulo[lang]}</h3>
    <p className="noticias-cuerpo">{article.cuerpo[lang]}</p>
  </div>
);

const NoticiasPage = ({ lang }) => {
  const N = NOTICIAS;
  return (
    <>
      {/* ── Hero ── */}
      <section className="page-hero noticias-hero">
        <video
          className="noticias-hero-video"
          src="assets/BE123FA9-6E78-4AE0-AF49-8253801E58E8.MP4"
          autoPlay muted loop playsInline
          aria-hidden="true"
        />
        <div className="noticias-hero-wash"/>
        <div className="noticias-hero-inner">
          <div className="noticias-edition-badge">
            {lang === 'es' ? 'Edición · Junio 2026' : 'Edition · June 2026'}
          </div>
          <h1 className="noticias-hero-title">
            {lang === 'es'
              ? <>Noticias & Blog<br/><em>del territorio Hestía</em></>
              : <>News & Blog<br/><em>from Hestía territory</em></>}
          </h1>
          <p className="noticias-hero-sub">
            {lang === 'es'
              ? 'Cada mes actualizamos esta página con lo mejor del territorio. Si quieres que cubramos algo — un evento, un rincón, un restaurante — escríbenos.'
              : "Every month we update this page with the best of the territory. If you'd like us to cover something — an event, a corner, a restaurant — write to us."}
          </p>
          <div className="noticias-hero-ctas">
            <a href="https://wa.me/34620316370?text=Hola%2C%20quiero%20sugerir%20algo%20para%20el%20blog%20de%20Hest%C3%ADa"
               className="btn btn-primary" target="_blank" rel="noopener">
              {lang === 'es' ? 'Sugerir algo → WhatsApp' : 'Suggest something → WhatsApp'}
            </a>
            <a href="reservas.html" className="btn btn-ghost-light">
              {lang === 'es' ? 'Reservar Hestía →' : 'Book a Hestía →'}
            </a>
          </div>
        </div>
      </section>

      {/* ── La Voz de Hestía ── */}
      <section className="noticias-voz">
        <div className="container">
          <div className="eyebrow noticias-voz-eyebrow">
            {lang === 'es' ? 'La Voz de Hestía' : 'The Voice of Hestía'}
          </div>
          <h2 className="noticias-voz-title">
            {lang === 'es'
              ? <>Recomendaciones y curiosidades<br/><em>de este mes</em></>
              : <>{"This month's recommendations"}<br/><em>and curiosities</em></>}
          </h2>
          <div className="voz-grid">
            {N.voz.map((item, i) => (
              <VozCard key={i} item={item} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Noticias del territorio ── */}
      <section className="noticias-territorio section-cream">
        <div className="container">
          <div className="eyebrow noticias-terr-eyebrow">
            {lang === 'es' ? 'Noticias del territorio' : 'Territory news'}
          </div>
          <h2 className="noticias-terr-title">
            {lang === 'es'
              ? <>Qué pasa este mes<br/><em>a tu alrededor</em></>
              : <>{"What's happening this month"}<br/><em>around you</em></>}
          </h2>
          <div className="noticias-terr-grid">
            {N.territorio.map((cat, ci) => (
              <div key={ci} className="noticias-cat" style={{ '--cat-accent': cat.accent }}>
                <div className="noticias-cat-head">
                  <span className="noticias-cat-icon">{cat.icon}</span>
                  <h3 className="noticias-cat-name">{cat.cat[lang]}</h3>
                </div>
                <div className="noticias-articles">
                  {cat.articles.map((a, ai) => (
                    <ArticleCard key={ai} article={a} lang={lang} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Archivo histórico ── */}
      <NoticiasArchivo lang={lang} />

      {/* ── Compartir ── */}
      <ShareSection lang={lang} />

    </>
  );
};

// ── App wrapper ────────────────────────────────────────────────────
const NoticiasPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();
  React.useEffect(() => { localStorage.setItem('hestia-lang', lang); document.documentElement.lang = lang; }, [lang]);
  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main><NoticiasPage lang={lang} /></main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<NoticiasPageApp/>);
