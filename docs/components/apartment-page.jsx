// ================================================================
// HESTÍA — Página de detalle de apartamento
// Lee window.__APT__ ('vm' | 'vt' | 'vs') para saber cuál mostrar
// ================================================================

const APT_DATA = {
  vm: {
    id: 'vm', num: '01', slug: 'mar', license: 'VFT/AL/01580',
    name_short: 'Mar',
    accent: '#6B7A3A', accent2: '#8B9A52',
    hero_img: 'assets/apt-vm-gallery-10.jpg',
    bedroom_img: 'assets/apt-vm-gallery-10.jpg',
    others: ['vt', 'vs'],
    gallery_imgs: [
      'assets/apt-vm-gallery-1.jpg',
      'assets/apt-vm-gallery-2.jpg',
      'assets/apt-vm-gallery-3.jpg',
      'assets/apt-vm-gallery-4.jpg',
      'assets/apt-vm-gallery-5.jpg',
      'assets/apt-vm-gallery-6.jpg',
      'assets/apt-vm-gallery-7.jpg',
      'assets/apt-vm-gallery-8.jpg',
      'assets/apt-vm-gallery-9.jpg',
      'assets/apt-vm-gallery-10.jpg',
      'assets/apt-vm-gallery-11.jpg',
      'assets/apt-vm-gallery-12.jpg',
      'assets/apt-vm-gallery-13.jpg',
      'assets/apt-vm-gallery-14.jpg',
      'assets/apt-vm-gallery-15.jpg',
      'assets/apt-vm-gallery-16.jpg',
      'assets/apt-vm-gallery-17.jpg',
      'assets/apt-vm-gallery-18.jpg',
      'assets/apt-vm-gallery-19.jpg',
      'assets/apt-vm-gallery-20.jpg',
      'assets/apt-vm-gallery-21.jpg',
      'assets/apt-vm-gallery-22.jpg',
      'assets/apt-vm-gallery-23.jpg',
      'assets/apt-vm-gallery-24.jpg',
      'assets/apt-vm-gallery-25.jpg',
    ],
    es: {
      name: 'Hestía Mar',
      concept: 'El campo de olivos llega al mar.',
      desc: 'Hestía Mar es el apartamento donde el paisaje del olivar se funde con el Mediterráneo. Desde la terraza esquinera de 20m² orientada al amanecer, el mar aparece entre los eucaliptos de Vera Playa. Al ser de esquina, el apartamento da a tres calles y permite ventilación cruzada natural en todas las estancias.',
      desc2: 'El apartamento ocupa la planta primera y se abre al jardín con acceso a la piscina comunitaria. Al ser esquinero, la luz entra desde el amanecer hasta el atardecer — ves el ciclo solar completo desde la terraza. Aire acondicionado centralizado en todas las estancias. Cocina completamente equipada, salón-comedor de 28m² y dos dormitorios con ropa de cama de calidad.',
      features: ['6 plazas + bebé · 2 habitaciones · planta primera', 'Terraza esquina 20m² · orientada al amanecer · ciclo solar completo', 'Piscina comunitaria · jacuzzi comunitario (verano)', 'Mascotas · petición previa · suplemento', '300 m de la playa · 5 min a pie desde la salida', 'Accesibilidad · adaptado para movilidad reducida', 'Aire acondicionado centralizado en todas las estancias', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Salón · mesa de madera y cocina', 'Salón · sofá con espejo sol', 'Salón · vista cenital', 'Piscina comunitaria nocturna', 'Detalle · jarrón y textiles', 'Cocina equipada · mañana', 'Cocina · encimera y copa', 'Cocina · campana extractora', 'Dormitorio 2 · camas turquesa', 'Dormitorio principal · armario espejo', 'Dormitorio 2 · simétrico', 'Terraza · día y sierra', 'Terraza · velada de verano', 'Terraza · sofás nocturnos', 'Baño 1 · luz LED verde', 'Baño 2 · ducha y toallas', 'Baño 2 · lavabo y aromas', 'Piscina comunitaria · día', 'Piscina · jardines', 'Zona duchas · mosaico azul', 'Salón · lámpara y sofá', 'Salón · sofá completo', 'Detalle · espejo sol dorado', 'Detalle · suelo hidráulico', 'Dormitorio principal · lámpara globo'],
    },
    en: {
      name: 'Hestía Mar',
      concept: 'Where the olive grove meets the sea.',
      desc: 'Hestía Mar is where the olive grove landscape merges with the Mediterranean. From the 20m² corner terrace facing the sunrise, the sea appears between the eucalyptus trees of Vera Playa. Being a corner apartment, it faces three streets and benefits from natural cross-ventilation throughout.',
      desc2: 'The apartment is on the first floor and opens onto the garden with access to the shared pool. As a corner unit, light travels through from sunrise to sunset — you can follow the full arc of the sun from the terrace. Centralised air conditioning in every room. A fully equipped kitchen, 28m² living-dining room, and two bedrooms with quality bed linen.',
      features: ['6 guests + baby · 2 bedrooms · first floor', 'Corner terrace 20m² · faces sunrise · full solar arc', 'Shared pool · shared jacuzzi (summer)', 'Pets · on request · supplement', '300 m from the beach · 5 min walk from complex exit', 'Accessibility · adapted for reduced mobility', 'Centralised A/C in every room', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Living & dining · wooden table', 'Living room · sofa & sun mirror', 'Living room · overhead view', 'Community pool · night', 'Detail · vase & textiles', 'Kitchen · morning setup', 'Kitchen · counter & wine', 'Kitchen · extractor hood', 'Bedroom 2 · teal beds', 'Master bedroom · mirrored wardrobe', 'Bedroom 2 · symmetric', 'Terrace · day & mountains', 'Terrace · summer evening', 'Terrace · night sofas', 'Bathroom 1 · green LED', 'Bathroom 2 · shower & towels', 'Bathroom 2 · vessel sink', 'Community pool · daytime', 'Pool · gardens', 'Pool showers · blue mosaic', 'Living room · lamp detail', 'Living room · full sofa', 'Detail · gold sun mirror', 'Detail · hydraulic tiles', 'Master bedroom · globe lamp'],
    },
  },
  vt: {
    id: 'vt', num: '02', slug: 'thalassa', license: 'VFT/AL/05535',
    name_short: 'Thalassa',
    accent: '#8A4A24', accent2: '#B86A3C',
    hero_img: 'assets/apt-vt-4.jpg',
    bedroom_img: 'assets/photo-vt-bedroom.jpg',
    others: ['vm', 'vs'],
    es: {
      name: 'Hestía Thalassa',
      concept: 'El ático sobre el Mediterráneo y el Salar de los Canos.',
      desc: 'Hestía Thalassa es el apartamento ático, el más elevado de los tres. Desde su terraza panorámica se ve el Mediterráneo y, hacia el interior, el Salar de los Canos — un paisaje árido y de gran belleza que cambia con la luz del día. El punto más abierto y luminoso de toda la urbanización.',
      desc2: 'El ático tiene dos plantas y una terraza con vistas al mar. La urbanización cuenta con SPA comunitario — con sauna y gimnasio —, piscina y pistas de pádel. El SPA está abierto en otoño, invierno y primavera; solo el gimnasio permanece abierto durante el verano.',
      features: ['6 plazas + bebé · 2 habitaciones', 'Ático — el piso más alto de la urbanización', 'Terraza panorámica · vistas al mar y al Salar de los Canos', 'Piscina comunitaria · pistas de pádel', 'SPA comunitario · sauna · gimnasio (otoño-primavera)', '1,5 km de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Terraza panorámica', 'Salón duplex', 'SPA comunitario', 'Dormitorio principal', 'Vistas al Salar de los Canos', 'Atardecer desde el ático'],
    },
    en: {
      name: 'Hestía Thalassa',
      concept: 'The penthouse above the Mediterranean and the Salar de los Canos.',
      desc: 'Hestía Thalassa is the penthouse — the highest apartment of the three. From its panoramic terrace you look out over the Mediterranean and, inland, the Salar de los Canos: an arid, dramatically beautiful landscape that shifts with the light throughout the day.',
      desc2: 'The penthouse spans two floors and a terrace with sea views. The complex also includes a shared SPA — with sauna and gym —, pool and padel courts. The SPA is open in autumn, winter and spring; only the gym stays open during summer.',
      features: ['6 guests + baby · 2 bedrooms', 'Penthouse — highest floor in the complex', 'Panoramic terrace · sea & Salar de los Canos views', 'Shared pool · padel courts', 'Shared SPA · sauna · gym (autumn–spring)', '1.5 km from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Panoramic terrace', 'Duplex living room', 'Shared SPA', 'Master bedroom', 'Views over the Salar de los Canos', 'Sunset from the penthouse'],
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
      desc2: 'A 900 metros del mar y junto al Parque Natural de las Salinas de Puerto Rey, este apartamento ofrece un paisaje que no existe en ningún otro lugar de Europa. La luz dorada de la tarde llena cada habitación — el privilegio de vivir junto a la naturaleza.',
      features: ['6 plazas + bebé · 2 habitaciones', 'Dos terrazas', '3 piscinas comunitarias · pistas de pádel', 'Gimnasio + sauna comunitarios', 'Parque Natural Salinas de Puerto Rey · acceso peatonal directo', '900 m de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Terraza principal al atardecer', 'Salón luminoso', 'Jardín del edificio', 'Dormitorio principal', 'Segunda terraza', 'Piscina comunitaria'],
    },
    en: {
      name: 'Hestía Salinas',
      concept: 'Ochre yellow, sunrise over the salt flats.',
      desc: 'Hestía Salinas lives in the ochre colour of the Almería sunrise. Three pools, two terraces and the Puerto Rey salt-flat nature park around the corner. The brightest apartment in the collection.',
      desc2: '900 metres from the sea and beside the Puerto Rey Salt-flat Nature Park, this apartment offers a landscape that exists nowhere else in Europe. Golden afternoon light fills every room — the privilege of living beside unspoilt nature.',
      features: ['6 guests + baby · 2 bedrooms', 'Two terraces', '3 shared pools · padel courts', 'Communal gym + sauna', 'Puerto Rey Salt-flat Nature Park · direct pedestrian access', '900 m from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Main terrace at sunset', 'Bright living room', 'Building garden', 'Master bedroom', 'Second terrace', 'Shared pool'],
    },
  },
};

// ================================================================
// EQUIPAMIENTO — datos por apartamento
// ================================================================
const APT_EQUIP = {
  vm: {
    area: 77, guests: 6, bedrooms: 2, bathrooms: 2,
    es: {
      terrace: 'Terraza 20m² esquina',
      icons: [
        ['🌊', 'Playa a 300m'], ['☀️', 'Terraza 20m² · esquina'], ['🏊', 'Piscina + Jacuzzi'],
        ['🌿', 'Jardines'], ['🛋', 'Chill out'], ['🛗', 'Ascensor'],
        ['📺', 'Smart TV 50"'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C por conductos'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · secadora'], ['🛁', 'Bañera + hidromasaje'], ['🚿', 'Ducha + cromoterapia'],
        ['🚗', 'Garaje cubierto'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'], ['👶', 'Cuna · Trona'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado'], ['🧴', 'Toallas 600g/m² · baño y playa'],
        ['🌺', 'Nórdico de plumas'], ['🪔', 'Cromoterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '20m² corner terrace',
      icons: [
        ['🌊', 'Beach 300m away'], ['☀️', '20m² corner terrace'], ['🏊', 'Pool + Jacuzzi'],
        ['🌿', 'Gardens'], ['🛋', 'Chill-out'], ['🛗', 'Lift'],
        ['📺', '50" Smart TV'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'Ducted A/C'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washer · dryer'], ['🛁', 'Bath + hydro-massage'], ['🚿', 'Shower + chromotherapy'],
        ['🚗', 'Covered garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'], ['👶', 'Cot · Highchair'],
        ['🛏', '200-thread combed cotton sheets'], ['🧴', 'Bath & beach towels 600g/m²'],
        ['🌺', 'Down duvet'], ['🪔', 'Chromotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
  vt: {
    area: 85, guests: 6, bedrooms: 2, bathrooms: 2,
    es: {
      terrace: 'Terraza 18m² vistas al mar',
      icons: [
        ['🌊', 'Mar · Laguna · Pueblo'], ['☀️', 'Terraza 18m² · vistas al mar'], ['🏊', '3 Piscinas'],
        ['🌡', 'Piscina climatizada'], ['♨️', 'Jacuzzi'], ['💪', 'Gimnasio'],
        ['🧖', 'Sauna'], ['🎾', 'Pista de tenis'], ['🌿', 'Jardines · Columpios'],
        ['📺', 'Smart TV 50"'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C salón y dormitorios'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Dos baños · en suite'], ['🚿', 'Columnas de hidromasaje'],
        ['🚗', 'Garaje interior'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado'], ['🧴', 'Toallas 600g/m² · baño y playa'],
        ['🌺', 'Nórdicos de plumas'], ['🪔', 'Cromoterapia · hidroterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '18m² sea-view terrace',
      icons: [
        ['🌊', 'Sea · Lagoon · Village'], ['☀️', '18m² sea-view terrace'], ['🏊', '3 Swimming pools'],
        ['🌡', 'Heated pool (year-round)'], ['♨️', 'Jacuzzi'], ['💪', 'Gym'],
        ['🧖', 'Sauna'], ['🎾', 'Tennis court'], ['🌿', 'Gardens · Swings'],
        ['📺', '50" Smart TV'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C lounge & bedrooms'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Two en-suite bathrooms'], ['🚿', 'Hydro-massage columns'],
        ['🚗', 'Indoor garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'],
        ['🛏', '200-thread combed cotton sheets'], ['🧴', 'Bath & beach towels 600g/m²'],
        ['🌺', 'Down duvets'], ['🪔', 'Chromotherapy · hydrotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
  vs: {
    area: 80, guests: 6, bedrooms: 2, bathrooms: 2,
    es: {
      terrace: '2 terrazas 18m² + 14m²',
      icons: [
        ['🌊', 'Playa a 2 min'], ['☀️', 'Terraza 18m² · sol y luna'], ['🌅', 'Terraza 14m² · atardecer'],
        ['🏊', 'Piscina'], ['🌿', 'Jardines · Riachuelos'], ['💪', 'Gimnasio'],
        ['🎾', 'Pista de tenis'], ['🛋', 'Chill out'], ['🏞', 'Salinas de Puerto Rey'],
        ['📺', 'Smart TV 50" · Ambilight'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C frío y calor'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Bañera + hidromasaje'], ['🚿', 'Cabina ducha + hidromasaje'],
        ['🚗', 'Garaje techado'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'], ['👶', 'Cuna · Trona'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado'], ['🧴', 'Toallas 600g/m² · baño y playa'],
        ['🌺', 'Nórdicos plumas + acrílicos (antialérgicos)'], ['🪔', 'Cromoterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '2 terraces 18m² + 14m²',
      icons: [
        ['🌊', 'Beach 2 min away'], ['☀️', '18m² terrace · sun & moon'], ['🌅', '14m² terrace · sunsets'],
        ['🏊', 'Pool'], ['🌿', 'Gardens · Streams'], ['💪', 'Gym'],
        ['🎾', 'Tennis court'], ['🛋', 'Chill-out'], ['🏞', 'Puerto Rey Salt Flats'],
        ['📺', '50" Smart TV · Ambilight'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C heat & cool'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Bath + hydro-massage'], ['🚿', 'Shower cabin + hydro-massage'],
        ['🚗', 'Covered garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'], ['👶', 'Cot · Highchair'],
        ['🛏', '200-thread combed cotton sheets'], ['🧴', 'Bath & beach towels 600g/m²'],
        ['🌺', 'Down & hypoallergenic duvets'], ['🪔', 'Chromotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
};

const AptEquipamiento = ({ apt, lang }) => {
  const equip = APT_EQUIP[apt.id];
  if (!equip) return null;
  const d = equip[lang];
  const accent = apt.accent;

  return (
    <section className="apt-equip">
      <div className="container">
        <div className="eyebrow apt-equip-eyebrow">
          {lang === 'es' ? 'Equipamiento · de un vistazo' : 'Amenities · at a glance'}
        </div>
        <div className="apt-equip-stats">
          {[
            { val: equip.area,      unit: 'm²',                             lbl: lang === 'es' ? 'superficie' : 'area' },
            { val: equip.guests,    unit: lang === 'es' ? '+cuna' : '+cot', lbl: lang === 'es' ? 'personas' : 'guests' },
            { val: equip.bedrooms,  unit: '',                               lbl: lang === 'es' ? 'dormitorios' : 'bedrooms' },
            { val: equip.bathrooms, unit: '',                               lbl: lang === 'es' ? 'baños' : 'bathrooms' },
            { val: d.terrace,       unit: '',                               lbl: lang === 'es' ? 'terraza' : 'terrace' },
          ].map((s, i) => (
            <div key={i} className="apt-equip-stat">
              <span className="aes-val" style={{ color: accent }}>{s.val}</span>
              {s.unit && <span className="aes-unit"> {s.unit}</span>}
              <span className="aes-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
        <div className="apt-equip-icons">
          {d.icons.map(([icon, label], i) => (
            <div key={i} className="apt-equip-item">
              <span className="aei-icon" aria-hidden="true">{icon}</span>
              <span className="aei-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
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
    <section className="apt-page-hero" data-apt={apt.id} style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <img src={apt.hero_img} alt={d.name} className="apt-page-hero-img"/>
      <WatermarkBadge size={40} pos={{ bottom: 16, right: 16 }}/>
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

// --- Descripción ---
const AptPageDesc = ({ apt, lang }) => {
  const d = apt[lang];
  return (
    <section className="apt-page-desc">
      <div className="apt-desc-inner">
        <p className="apt-desc-lead">{d.desc}</p>
        <p className="apt-desc-body">{d.desc2}</p>
      </div>
    </section>
  );
};

// --- Galería carousel ---
const GalleryCarousel = ({ imgs, captions }) => {
  const n = imgs.length;
  const [cur, setCur] = React.useState(0);
  const thumbsRef = React.useRef(null);
  const timerRef  = React.useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCur(i => (i + 1) % n), 3000);
  };

  React.useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  // Scroll the strip horizontally to centre the active thumb — never the page
  React.useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const thumb = strip.children[cur];
    if (!thumb) return;
    const offset = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left: offset, behavior: 'smooth' });
  }, [cur]);

  const go = i => { setCur(i); resetTimer(); };

  // Swipe on main image
  const touchX = React.useRef(null);
  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) { setCur(i => dx < 0 ? (i + 1) % n : (i - 1 + n) % n); resetTimer(); }
    touchX.current = null;
  };

  return (
    <div className="gc-wrap">
      <div className="gc-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {imgs.map((src, i) => (
          <div key={i} className="gc-slide"
               style={{ transform: `translateX(${(i - cur) * 100}%)` }}>
            <img src={src} alt={captions[i]} loading={i === 0 ? 'eager' : 'lazy'}/>
          </div>
        ))}
        <div className="gc-overlay">
          <WatermarkBadge size={26} pos={{ bottom: 12, right: 12 }}/>
          <div className="gc-caption">{captions[cur]}</div>
          <div className="gc-counter">{cur + 1} / {n}</div>
        </div>
      </div>
      <div className="gc-thumbs" ref={thumbsRef}>
        {imgs.map((src, i) => (
          <button key={i}
                  className={`gc-thumb${i === cur ? ' gc-thumb-on' : ''}`}
                  onClick={() => go(i)}
                  aria-label={captions[i]}>
            <img src={src} alt="" loading="lazy"/>
          </button>
        ))}
      </div>
    </div>
  );
};

const AptPageGallery = ({ apt, lang }) => {
  const d = apt[lang];
  const captions = d.gallery_captions;
  const imgs = apt.gallery_imgs;
  return (
    <section className="apt-page-gallery">
      <div className="apt-gallery-eyebrow eyebrow">
        {lang === 'es' ? 'Galería de fotos' : 'Photo gallery'}
      </div>
      {imgs
        ? <GalleryCarousel imgs={imgs} captions={captions}/>
        : <>
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
          </>
      }
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
              <img src={o.hero_img} alt={d.name} className="apt-other-img" loading="lazy"/>
              <WatermarkBadge size={28}/>
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
        <FraseHogar lang={lang} />
        <AptPageDesc apt={apt} lang={lang} />
        <AptEquipamiento apt={apt} lang={lang} />
        <AptCalendar aptId={aptId} lang={lang} accent={apt.accent} />
        <AptPageGallery apt={apt} lang={lang} />
        <AptPageOthers apt={apt} lang={lang} />
        <QuickFAQ lang={lang} pageId={aptId} />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <StickyFacts lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ApartmentPageApp/>);
