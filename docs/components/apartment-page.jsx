// ================================================================
// HESTÍA — Página de detalle de apartamento
// Lee window.__APT__ ('vm' | 'vt' | 'vs') para saber cuál mostrar
// ================================================================

const APT_DATA = {
  vm: {
    id: 'vm', num: '01', slug: 'mar', license: 'VFT/AL/01580',
    name_short: 'Mar',
    accent: '#6B7A3A', accent2: '#8B9A52',
    hero_img: 'assets/apt-vs.jpg',
    bedroom_img: 'assets/photo-vm-bedroom.jpg',
    others: ['vt', 'vs'],
    es: {
      name: 'Hestía Mar',
      concept: 'El campo de olivos llega al mar.',
      desc: 'Hestía Mar es el apartamento donde el paisaje del olivar se funde con el Mediterráneo. Desde la terraza esquinera de 20m², el mar aparece entre los eucaliptos de Vera Playa. Ideal para familias que buscan privacidad, verde y brisa. Las mascotas son parte de la familia.',
      desc2: 'El apartamento ocupa la planta baja del conjunto y se abre al jardín con acceso directo a la piscina comunitaria. La luz entra por tres orientaciones — mañana, mediodía y tarde. Una cocina completamente equipada, salón-comedor de 28m² y dos dormitorios con ropa de cama de calidad.',
      features: ['6 plazas · 2 habitaciones', 'Terraza esquina 20m² · Vistas al mar', 'Piscina comunitaria', 'Mascotas bienvenidas', 'Jacuzzi de temporada', '300 m de la playa', 'Aire acondicionado frío/calor', 'Smart TV · WiFi fibra óptica', 'Cocina totalmente equipada', 'Ropa de cama y toallas incluidas'],
      gallery_captions: ['Salón con vistas al jardín', 'Dormitorio principal', 'Terraza esquinera', 'Cocina equipada', 'Dormitorio secundario', 'Acceso a la piscina'],
    },
    en: {
      name: 'Hestía Mar',
      concept: 'Where the olive grove meets the sea.',
      desc: 'Hestía Mar is where the olive grove landscape merges with the Mediterranean. From the 20m² corner terrace, the sea appears between the eucalyptus trees of Vera Playa. Perfect for families looking for privacy, greenery and sea breeze. Pets are part of the family.',
      desc2: 'The apartment occupies the ground floor of the complex and opens onto the garden with direct pool access. Light enters from three orientations — morning, noon and afternoon. A fully equipped kitchen, 28m² living-dining room, and two bedrooms with quality bed linen.',
      features: ['6 guests · 2 bedrooms', 'Corner terrace 20m² · Sea views', 'Shared pool', 'Pets welcome', 'Seasonal jacuzzi', '300 m from the beach', 'A/C heating & cooling', 'Smart TV · Fibre WiFi', 'Fully equipped kitchen', 'Bed linen & towels included'],
      gallery_captions: ['Living room with garden views', 'Master bedroom', 'Corner terrace', 'Equipped kitchen', 'Second bedroom', 'Pool access'],
    },
  },
  vt: {
    id: 'vt', num: '02', slug: 'thalassa', license: 'VFT/AL/05535',
    name_short: 'Thalassa',
    accent: '#8A4A24', accent2: '#B86A3C',
    hero_img: 'assets/apt-vt.jpg',
    bedroom_img: 'assets/photo-vt-bedroom.jpg',
    others: ['vm', 'vs'],
    es: {
      name: 'Hestía Thalassa',
      concept: 'El naranja del Desierto de Tabernas.',
      desc: 'Hestía Thalassa es el apartamento ático, donde el naranja del Desierto de Tabernas entra por la terraza panorámica de 360°. Una experiencia sensorial única: SPA con cromoterapia y aromaterapia, amanecer sobre el mar, atardecer sobre el desierto.',
      desc2: 'El ático dispone de dos plantas de vida y una terraza envolvente con vistas simultáneas al Mediterráneo y al Parque Natural de Cabo de Gata. El SPA privado con cromoterapia y aromaterapia convierte cada tarde en un ritual.',
      features: ['6 plazas · 2 habitaciones', 'Terraza panorámica 360°', 'Ático — vistas al mar y al desierto', 'Piscina comunitaria + pistas de pádel', 'SPA privado: cromoterapia + aromaterapia', '400 m de la playa', 'Aire acondicionado frío/calor', 'Smart TV · WiFi fibra óptica', 'Cocina totalmente equipada', 'Ropa de cama y toallas incluidas'],
      gallery_captions: ['Terraza panorámica 360°', 'Salón duplex', 'SPA con cromoterapia', 'Dormitorio principal', 'Vistas al desierto de Tabernas', 'Atardecer desde el ático'],
    },
    en: {
      name: 'Hestía Thalassa',
      concept: 'Orange from the Tabernas desert.',
      desc: 'Hestía Thalassa is the penthouse apartment, where the orange of the Tabernas Desert enters through the 360° panoramic terrace. A unique sensory experience: SPA with chromotherapy and aromatherapy, sunrise over the sea, sunset over the desert.',
      desc2: 'The penthouse spans two living floors and a wraparound terrace with simultaneous views of the Mediterranean and the Cabo de Gata Natural Park. The private SPA with chromotherapy and aromatherapy turns every afternoon into a ritual.',
      features: ['6 guests · 2 bedrooms', '360° panoramic terrace', 'Penthouse — sea & desert views', 'Shared pool + padel courts', 'Private SPA: chromotherapy & aromatherapy', '400 m from the beach', 'A/C heating & cooling', 'Smart TV · Fibre WiFi', 'Fully equipped kitchen', 'Bed linen & towels included'],
      gallery_captions: ['360° panoramic terrace', 'Duplex living room', 'SPA with chromotherapy', 'Master bedroom', 'Tabernas desert views', 'Sunset from the penthouse'],
    },
  },
  vs: {
    id: 'vs', num: '03', slug: 'salinas', license: 'VTF/AL/07056',
    name_short: 'Salinas',
    accent: '#9E7A2C', accent2: '#D4A84A',
    hero_img: 'assets/apt-vm.jpg',
    bedroom_img: 'assets/photo-vs-bedroom.jpg',
    others: ['vm', 'vt'],
    es: {
      name: 'Hestía Salinas',
      concept: 'El amarillo albero del amanecer sobre las salinas.',
      desc: 'Hestía Salinas vive en el color albero del amanecer almeriense. Tres piscinas, dos terrazas y el Parque Natural de las Salinas de Puerto Rey a la vuelta de la esquina. El apartamento más luminoso de la colección.',
      desc2: 'A 350 metros del mar y junto al Parque Natural de las Salinas de Puerto Rey, este apartamento ofrece un paisaje que no existe en ningún otro lugar de Europa. La luz de la tarde sobre las salinas tiñe cada habitación de oro.',
      features: ['6 plazas · 2 habitaciones', 'Dos terrazas', 'Tres piscinas comunitarias', 'Parque Natural Salinas de Puerto Rey', 'Vistas a las salinas', '350 m de la playa', 'Aire acondicionado frío/calor', 'Smart TV · WiFi fibra óptica', 'Cocina totalmente equipada', 'Ropa de cama y toallas incluidas'],
      gallery_captions: ['Terraza principal al atardecer', 'Salón luminoso', 'Vistas a las salinas', 'Dormitorio principal', 'Segunda terraza', 'Piscina comunitaria'],
    },
    en: {
      name: 'Hestía Salinas',
      concept: 'Ochre yellow, sunrise over the salt flats.',
      desc: 'Hestía Salinas lives in the ochre colour of the Almería sunrise. Three pools, two terraces and the Puerto Rey salt-flat nature park around the corner. The brightest apartment in the collection.',
      desc2: '350 metres from the sea and beside the Puerto Rey Salt-flat Nature Park, this apartment offers a landscape that exists nowhere else in Europe. The afternoon light over the salt flats turns every room golden.',
      features: ['6 guests · 2 bedrooms', 'Two terraces', 'Three shared pools', 'Puerto Rey salt-flat nature park', 'Views over the salt flats', '350 m from the beach', 'A/C heating & cooling', 'Smart TV · Fibre WiFi', 'Fully equipped kitchen', 'Bed linen & towels included'],
      gallery_captions: ['Main terrace at sunset', 'Bright living room', 'Salt-flat views', 'Master bedroom', 'Second terrace', 'Shared pool'],
    },
  },
};

// --- Photo placeholder SVG inline ---
const PhotoPlaceholder = ({ caption, accent, index }) => (
  <div className="apt-photo-placeholder" style={{ '--ph-accent': accent }}>
    <svg viewBox="0 0 3 2" className="ph-ratio" aria-hidden="true"/>
    <div className="ph-inner">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity=".4" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
      <span className="ph-num">0{index + 1}</span>
    </div>
    {caption && <div className="ph-caption">— {caption}</div>}
  </div>
);

// --- Hero de la página de apartamento ---
const AptPageHero = ({ apt, lang, scrolled, mode }) => {
  const d = apt[lang];
  return (
    <section className="apt-page-hero" style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <img src={apt.hero_img} alt={d.name} className="apt-page-hero-img"/>
      <div className="apt-page-hero-wash"/>
      <div className="apt-page-hero-content">
        <div className="apt-page-eyebrow">
          <span>{apt.num}</span>
          <span className="sep">·</span>
          <span>{apt.license}</span>
        </div>
        <h1 className="apt-page-name">
          <span className="small-label">HESTÍA</span>
          {apt.name_short}
        </h1>
        <p className="apt-page-concept">« {d.concept} »</p>
        <div className="apt-page-ctas">
          <a href="https://wa.me/34620316370" className="btn btn-primary" target="_blank" rel="noopener">
            {lang === 'es' ? 'Reserva — WhatsApp' : 'Book — WhatsApp'} <span className="arrow">→</span>
          </a>
          <a href="contacto.html" className="btn btn-ghost-light">
            {lang === 'es' ? 'Más información' : 'More info'}
          </a>
        </div>
      </div>
    </section>
  );
};

// --- Descripción + features ---
const AptPageDesc = ({ apt, lang }) => {
  const d = apt[lang];
  return (
    <section className="apt-page-desc">
      <div className="apt-desc-inner">
        <div className="apt-desc-text">
          <p className="apt-desc-lead">{d.desc}</p>
          <p>{d.desc2}</p>
        </div>
        <ul className="apt-features-list">
          {d.features.map((f, i) => (
            <li key={i}>
              <span className="feat-dot" style={{ background: apt.accent }}/>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// --- Galería (6 placeholders) ---
const AptPageGallery = ({ apt, lang }) => {
  const d = apt[lang];
  const captions = d.gallery_captions;
  return (
    <section className="apt-page-gallery">
      <div className="apt-gallery-eyebrow eyebrow">
        {lang === 'es' ? 'Galería de fotos' : 'Photo gallery'}
      </div>
      <div className="apt-gallery-grid">
        {captions.map((cap, i) => (
          <PhotoPlaceholder key={i} caption={cap} accent={apt.accent} index={i}/>
        ))}
      </div>
      <p className="gallery-note">
        {lang === 'es'
          ? '↑ Fotos reales próximamente. Mientras tanto, escríbenos y te mandamos más.'
          : "↑ Real photos coming soon. Meanwhile, write us and we'll send more."}
      </p>
    </section>
  );
};

// --- Otros apartamentos ---
const AptPageOthers = ({ apt, lang }) => {
  const others = apt.others.map(id => APT_DATA[id]);
  return (
    <section className="apt-page-others">
      <div className="eyebrow" style={{ marginBottom: 32 }}>
        {lang === 'es' ? 'Los otros dos apartamentos' : 'The other two apartments'}
      </div>
      <div className="apt-others-grid">
        {others.map(o => {
          const d = o[lang];
          return (
            <a key={o.id} href={`${o.slug}.html`} className={`apt-other-card ${o.id}`}
               style={{ '--other-accent': o.accent }}>
              <img src={o.hero_img} alt={d.name} className="apt-other-img"/>
              <div className="apt-other-wash"/>
              <div className="apt-other-content">
                <div className="apt-other-num">{o.num}</div>
                <div className="apt-other-name">
                  <span>HESTÍA</span>
                  <strong>{o.name_short}</strong>
                </div>
                <div className="apt-other-concept">« {d.concept} »</div>
                <span className="apt-other-cta">
                  {lang === 'es' ? 'Ver apartamento' : 'See apartment'} →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

// --- App de página de apartamento ---
const ApartmentPageApp = () => {
  const aptId = window.__APT__ || 'vm';
  const apt = APT_DATA[aptId];

  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = `${apt[lang].name} · Hestía Your Home · Vera Playa`;
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <AptPageHero apt={apt} lang={lang} scrolled={scrolled} mode={mode} />
        <AptPageDesc apt={apt} lang={lang} />
        <AptPageGallery apt={apt} lang={lang} />
        <AptPageOthers apt={apt} lang={lang} />
        <SabiasQue lang={lang} />
        <QuickFAQ lang={lang} pageId={aptId} />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ApartmentPageApp/>);
