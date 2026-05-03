// ================================================================
// HESTÍA — Noticias & Blog
// Actualizado mensualmente. Edición: Mayo 2026
// ================================================================

const NOTICIAS = {
  edition:  { es: 'Mayo 2026',   en: 'May 2026'   },
  updated:  { es: 'Actualizado cada mes por Hestía', en: 'Updated monthly by Hestía' },

  // ── La Voz de Hestía ──────────────────────────────────────────
  voz: [
    {
      num: '01', apt: 'Hestía Mar', slug: 'mar.html', accent: 'var(--vm)',
      curiosidad: {
        es: 'Los olivos que rodean la urbanización llevan siglos aquí. En mayo florecen y las tardes huelen a miel y a hierba seca. Abre la terraza esquinera antes de que suba el viento del mar.',
        en: 'The olive trees surrounding the complex have been here for centuries. In May they blossom and still evenings smell of honey and dry grass. Open the corner terrace before the sea breeze picks up.',
      },
      reco: {
        es: 'Mercado del sábado en Vera pueblo, detrás de la fortaleza. Llega antes de las 10h para el queso de Huércal-Overa — se agota antes de las 11. La parada del pan de pueblo es la tercera a mano izquierda.',
        en: 'Saturday market in Vera village, behind the fortress. Arrive before 10am for the Huércal-Overa cheese — it sells out by 11. The sourdough stall is the third one on the left.',
      },
    },
    {
      num: '02', apt: 'Hestía Thalassa', slug: 'thalassa.html', accent: 'var(--vt)',
      curiosidad: {
        es: 'El Salar de los Canos — el espejo de agua que ves desde la terraza del ático — es una laguna costera protegida. Cada mayo llegan las primeras cigüeñuelas rosas. Si tienes prismáticos, llévalos.',
        en: 'The Salar de los Canos — the sheet of water visible from the penthouse terrace — is a protected coastal lagoon. Every May the first pink stilts arrive. Pack binoculars if you have them.',
      },
      reco: {
        es: 'Con viento de poniente y buena visibilidad, desde el ático se distingue la costa africana. No lo des por sabido — busca el momento en que el horizonte se vuelve doble y el perfil de Marruecos aparece.',
        en: "With a westerly wind and good visibility, you can spot the African coast from the penthouse. Don't take it for granted — look for the moment the horizon doubles and Morocco's silhouette appears.",
      },
    },
    {
      num: '03', apt: 'Hestía Salinas', slug: 'salinas.html', accent: 'var(--vs-dk)',
      curiosidad: {
        es: 'Las Salinas de Puerto Rey, a 50 metros de la puerta, están en plena faena en mayo. La salmuera empieza a concentrarse antes de la cosecha de agosto. Si ves al guarda, pregúntale si puedes asomarte — casi siempre dice que sí.',
        en: 'The Salinas de Puerto Rey salt flats — 50 metres from the front door — are in full swing in May, concentrating the brine ahead of the August harvest. Ask the warden if you can look in closer — the answer is almost always yes.',
      },
      reco: {
        es: 'Pon el despertador el primer día. A las 6:30h el sol rasante tiñe las salinas de naranja, rosa y plata en cuestión de minutos. Es uno de los espectáculos naturales más brutales de Almería y no sale en ninguna guía.',
        en: "Set an alarm on your first morning. At 6:30am the low sun turns the salt flats from orange to rose to silver in minutes. It's one of Almería's most extraordinary natural shows — and it appears in no guidebook.",
      },
    },
  ],

  // ── Noticias del territorio ───────────────────────────────────
  territorio: [
    {
      cat:  { es: 'Vera Playa & alrededores', en: 'Vera Playa & surroundings' },
      icon: '🌊',
      accent: 'var(--sol)',
      articles: [
        {
          tag:    { es: 'Temporada',     en: 'Season'       },
          titulo: { es: 'Abren los chiringuitos — la temporada empieza', en: 'Beach bars open — the season begins' },
          cuerpo: {
            es: 'El 1 de mayo marca el inicio oficial de la temporada en Vera Playa. El paseo recupera su ritmo: chiringuitos, sombrillas y olor a brasa desde las 13h. La Playa de los Muertos, a 30 km, abre también su acceso por pista de tierra — imprescindible este mes.',
            en: 'May 1st marks the official start of the season in Vera Playa. The promenade comes alive: beach bars, parasols and the smell of charcoal from 1pm. La Playa de los Muertos, 30km away, also opens its dirt-track access — unmissable this month.',
          },
        },
        {
          tag:    { es: 'Gastronomía',   en: 'Food'         },
          titulo: { es: 'Feria del Jamón de Tíjola — primer fin de semana de mayo', en: "Tíjola Ham Fair — first May weekend" },
          cuerpo: {
            es: 'A 80 km hacia la sierra, Tíjola celebra su Feria del Jamón con jamón serrano de la Sierra de los Filabres, vino de pitarra y música de pueblo. Entrada libre todo el fin de semana. Merece la excursión.',
            en: '80km inland, Tíjola holds its Ham Fair with cured ham from the Sierra de los Filabres, local wine and folk music. Free entry all weekend. Worth the drive.',
          },
        },
        {
          tag:    { es: 'Calidad del agua', en: 'Water quality' },
          titulo: { es: 'Bandera Azul 2026 — confirmada para Vera, Garrucha y Mojácar', en: 'Blue Flag 2026 — confirmed for Vera, Garrucha and Mojácar' },
          cuerpo: {
            es: 'Las playas de Vera Playa, Garrucha y Mojácar renuevan la certificación de la UE. El litoral almeriense tiene oficialmente algunas de las aguas más limpias del Mediterráneo. Algo que los que venís ya sabíais.',
            en: 'The beaches of Vera Playa, Garrucha and Mojácar retain their EU certification. The Almería coastline officially has some of the cleanest water in the Mediterranean — something regular visitors already knew.',
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
          tag:    { es: 'Naturaleza', en: 'Nature' },
          titulo: { es: 'Cabo de Gata en mayo — el mejor mes del año', en: 'Cabo de Gata in May — the best month of the year' },
          cuerpo: {
            es: 'El Parque Natural retoma sus actividades: senderismo nocturno, kayak de costa y visitas guiadas a la estepa. Mayo es perfecto — sin el calor de julio ni las multitudes de agosto. La ruta del Faro de Gata al Faro de las Sirenas, al amanecer, es sagrada.',
            en: "The Natural Park resumes its activities: night hiking, sea kayaking and guided steppe tours. May is perfect — no July heat, no August crowds. The lighthouse trail at sunrise is unmissable.",
          },
        },
        {
          tag:    { es: 'Cultura', en: 'Culture' },
          titulo: { es: 'Festival de Jazz en el Paseo — Almería capital, segunda quincena de mayo', en: 'Jazz Festival on the Promenade — Almería city, late May' },
          cuerpo: {
            es: 'Conciertos al atardecer en el Paseo de Almería, entrada libre la mayoría de noches. A 1h 15\' de Vera Playa — merece la excursión nocturna, sobre todo si el programa incluye a las bandas de la Escuela Municipal de Música.',
            en: "Sunset concerts on Almería's Promenade, most nights free entry. 1h 15' from Vera Playa — worth an evening trip, especially if the municipal music school bands are on the bill.",
          },
        },
      ],
    },
    {
      cat:  { es: 'Andalucía', en: 'Andalucía' },
      icon: '🌸',
      accent: 'var(--vt)',
      articles: [
        {
          tag:    { es: 'Feria',          en: 'Fair'         },
          titulo: { es: 'Feria del Caballo de Jerez — primera semana de mayo', en: 'Jerez Horse Fair — first week of May' },
          cuerpo: {
            es: 'La más flamenca de las ferias andaluzas. Carruajes, trajes de volantes, jerez y farruca hasta el amanecer. Jerez está a 3 horas de Vera Playa. Si vuestras fechas coinciden y tenéis coche, es una experiencia que no se repite.',
            en: 'The most flamenco of all Andalusian fairs. Carriages, flounced dresses, sherry and farruca until dawn. Jerez is 3 hours from Vera Playa — if your dates overlap and you have a car, it is unmissable.',
          },
        },
        {
          tag:    { es: 'Reconocimiento', en: 'Award'        },
          titulo: { es: 'Mojácar, entre los Pueblos Más Bonitos de España — cuarto año consecutivo', en: "Mojácar, among Spain's Most Beautiful Villages — fourth consecutive year" },
          cuerpo: {
            es: 'El pueblo blanco a 20 km de Vera Playa renueva su reconocimiento. Visítalo a primera hora — antes de las 10h las calles son solo de los gatos y los geranios.',
            en: 'The whitewashed village 20km from Vera Playa retains its recognition. Visit at first light — before 10am the streets belong only to cats and geraniums.',
          },
        },
        {
          tag:    { es: 'Gastronomía',   en: 'Food'         },
          titulo: { es: 'AOVE Poniente de Granada — cosecha 2025/26 excepcional', en: 'Poniente de Granada olive oil — exceptional 2025/26 harvest' },
          cuerpo: {
            es: 'Los aceites de oliva virgen extra de la DOP Poniente de Granada están recibiendo sus mejores puntuaciones de la última década. Si pasáis por Guadix o Baza de camino a Vera, parad en alguna cooperativa — los precios directos son otra cosa.',
            en: 'Poniente de Granada DOP olive oils are scoring their best in a decade. If you pass through Guadix or Baza on the way to Vera, stop at a cooperative — the direct prices are something else.',
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
          tag:    { es: 'Cultura',    en: 'Culture'    },
          titulo: { es: 'Cartagena — Semana de la Mar, mayo', en: 'Cartagena — Week of the Sea, May' },
          cuerpo: {
            es: 'El puerto de Cartagena acoge regatas, visitas al submarino Isaac Peral y un mercado marinero en el muelle. A 1h 15\' de Vera en coche. El submarino está en el Museo Naval — pequeño pero fascinante, y los ingenieros del siglo XIX os van a sorprender.',
            en: "Cartagena's port hosts regattas, visits to the Isaac Peral submarine and a maritime market on the quayside. 1h 15' from Vera by car. The submarine is in the Naval Museum — small but fascinating.",
          },
        },
        {
          tag:    { es: 'Naturaleza', en: 'Nature'     },
          titulo: { es: 'Sierra Espuña — mayo en su mejor momento', en: 'Sierra Espuña — May at its finest' },
          cuerpo: {
            es: 'Las rutas de primavera en la Sierra Espuña están en su punto óptimo. La ruta de las Siete Caídas y la ascensión al Morrón de Espuña (1.579 m) son las más valoradas. Salida desde El Berro, a 1h 30\' de Vera.',
            en: 'Spring hiking in the Sierra Espuña is at its best. The Siete Caídas trail and the Morrón de Espuña ascent (1,579m) are the favourites. Start from El Berro, 1h 30\' from Vera.',
          },
        },
        {
          tag:    { es: 'Música',     en: 'Music'      },
          titulo: { es: 'Festival del Cante de las Minas — entradas a la venta (La Unión, julio)', en: 'Festival del Cante de las Minas — tickets on sale (La Unión, July)' },
          cuerpo: {
            es: 'El festival de flamenco más importante del mundo tiene entradas a la venta para julio. La Unión está a 1h 20\' de Vera Playa. Los concursos de madrugada son los más auténticos — compra con tiempo.',
            en: "The world's most important flamenco festival has July tickets on sale now. La Unión is 1h 20' from Vera Playa. The late-night competitions are the most authentic — book early.",
          },
        },
      ],
    },
  ],
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
        <div className="noticias-hero-inner">
          <div className="noticias-edition-badge">
            {N.edition[lang]}
          </div>
          <div className="eyebrow" style={{ color: 'var(--sol-lt)', marginBottom: 16 }}>
            {N.updated[lang]}
          </div>
          <h1 className="noticias-hero-title">
            {lang === 'es'
              ? <>Noticias & Blog<br/><em>del territorio Hestía</em></>
              : <>News & Blog<br/><em>from Hestía territory</em></>}
          </h1>
          <p className="noticias-hero-sub">
            {lang === 'es'
              ? 'Lo que pasa en Vera Playa, Almería, Andalucía y Murcia. Más la voz de Hestía — recomendaciones y curiosidades de cada apartamento.'
              : 'What\'s happening in Vera Playa, Almería, Andalucía and Murcia. Plus the voice of Hestía — recommendations and curiosities from each apartment.'}
          </p>
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
              : <>This month\'s recommendations<br/><em>and curiosities</em></>}
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
              : <>What\'s happening this month<br/><em>around you</em></>}
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

      {/* ── Próxima edición ── */}
      <section className="noticias-next">
        <div className="noticias-next-inner">
          <div className="eyebrow" style={{ color: 'var(--sol-lt)' }}>
            {lang === 'es' ? 'Próxima edición · Junio 2026' : 'Next edition · June 2026'}
          </div>
          <p className="noticias-next-text">
            {lang === 'es'
              ? 'Cada mes actualizamos esta página con lo mejor del territorio. Si quieres que cubramos algo — un evento, un rincón, un restaurante — escríbenos.'
              : "Every month we update this page with the best of the territory. If you'd like us to cover something — an event, a corner, a restaurant — write to us."}
          </p>
          <div className="noticias-next-ctas">
            <a href="https://wa.me/34620316370?text=Hola%2C%20quiero%20sugerir%20algo%20para%20el%20blog%20de%20Hest%C3%ADa"
               className="btn btn-primary" target="_blank" rel="noopener">
              {lang === 'es' ? 'Sugerir algo → WhatsApp' : 'Suggest something → WhatsApp'}
            </a>
            <a href="reservas.html" className="btn btn-ghost-light">
              {lang === 'es' ? 'Reservar apartamento →' : 'Book an apartment →'}
            </a>
          </div>
        </div>
      </section>
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
