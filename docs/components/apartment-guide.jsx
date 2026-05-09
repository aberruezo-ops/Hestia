// ================================================================
// HESTÍA — Guía interactiva del huésped (web rebuild de los PDFs)
// Acceso protegido con PIN: HVM2016 (Mar) / HVT2019 (Thalassa) / HVS2021 (Salinas)
// El contenido proviene de los PDFs originales en docs/assets/*Hestia*Guia*
// ================================================================

const APT_GUIDE_PIN = { vm: 'HVM2016', vt: 'HVT2019', vs: 'HVS2021' };

// ----- Mapeo: galería de cada Hestía → estancia -----
// Reusamos las fotos profesionales que ya están en assets/apt-vX-gallery-N.jpg
// (mismas que la galería de Hestía). Cada índice apunta a su posición
// en apt.gallery_imgs[]. Las captions se sacan de apt[lang].gallery_captions[].
const ROOM_PHOTOS = {
  vm: {
    salon:        [0, 1, 2, 20, 21],      // 'Salón · ...'
    cocina:       [5, 6, 7],              // 'Cocina · ...'
    dormitorios:  [8, 9, 10, 24],         // 'Dormitorio · ...'
    banos:        [14, 15, 16],           // 'Baño · ...'
    terraza:      [11, 12, 13],           // 'Terraza · ...'
    urbanizacion: [3, 17, 18, 19],        // 'Piscina', 'Zona duchas'
  },
  vt: {
    salon:        [4, 7, 9],
    cocina:       [5],
    dormitorios:  [1, 2, 3],
    banos:        [6],
    terraza:      [0, 8, 10],
    urbanizacion: [],                     // sin foto en galería; usa URB_FALLBACK
  },
  vs: {
    salon:        [0, 1, 2, 3, 4, 5, 6, 7],
    cocina:       [8, 9, 10, 11],
    dormitorios:  [12, 13, 14],
    banos:        [15, 16, 17, 18],
    terraza:      [19, 20, 21, 22, 23, 24, 25, 26, 27],
    urbanizacion: [],
  },
};

// Fotos extraídas del PDF SIN el logo verde antiguo, usadas como fallback
// cuando no hay foto de galería para esa estancia (típicamente urbanización).
const URB_FALLBACK = {
  vm: ['assets/guides/vm/urb-1.jpg', 'assets/guides/vm/urb-2.jpg'],
  vt: ['assets/guides/vt/urb-1.jpg', 'assets/guides/vt/urb-2.jpg'],
  vs: ['assets/guides/vs/urb-1.jpg'],
};

// Secciones del nav lateral, en orden de aparición
const GUIDE_SECTIONS = [
  { id: 'bienvenida',   es: 'Bienvenida',       en: 'Welcome' },
  { id: 'nombre',       es: 'Nuestro nombre',   en: 'Our name' },
  { id: 'proposito',    es: '¿Por qué Hestía?', en: 'Why Hestía?' },
  { id: 'limpieza',     es: 'Limpieza',         en: 'Cleaning' },
  { id: 'salon',        es: 'Mi salón',         en: 'My living room' },
  { id: 'cocina',       es: 'Mi cocina',        en: 'My kitchen' },
  { id: 'dormitorios',  es: 'Mis dormitorios',  en: 'My bedrooms' },
  { id: 'banos',        es: 'Mis baños',        en: 'My bathrooms' },
  { id: 'terraza',      es: 'Mi terraza',       en: 'My terrace' },
  { id: 'urbanizacion', es: 'Mi urbanización',  en: 'My complex' },
  { id: 'alrededores',  es: 'Alrededores',      en: 'Surroundings' },
  { id: 'telefonos',    es: 'Teléfonos',        en: 'Useful phones' },
  { id: 'feedback',     es: 'Comentarios',      en: 'Feedback' },
];

// ----- Categorías de lugares (color + etiqueta bilingüe) -----
const CATEGORIES = [
  { id: 'home',        es: 'Hestía',                 en: 'Hestía',                color: '#2A0F2E' },
  { id: 'restaurant',  es: 'Restaurantes',           en: 'Restaurants',           color: '#C84C4C' },
  { id: 'celiac',      es: 'Restaurantes celíacos',  en: 'Gluten-free dining',    color: '#E07B5B' },
  { id: 'bar',         es: 'Copas y chiringuitos',   en: 'Bars & beach bars',     color: '#D4A84A' },
  { id: 'beach',       es: 'Playas',                 en: 'Beaches',               color: '#3AAABB' },
  { id: 'beach-dog',   es: 'Playas para perros',     en: 'Dog-friendly beaches',  color: '#7BAA3F' },
  { id: 'beach-nude',  es: 'Playas naturistas',      en: 'Naturist beaches',      color: '#B86A3C' },
  { id: 'beach-srvc',  es: 'Playas con servicios',   en: 'Beaches with services', color: '#3A6FAF' },
  { id: 'beach-hard',  es: 'Playas de difícil acceso', en: 'Hard-access beaches', color: '#5D4A8A' },
  { id: 'super',       es: 'Supermercados',          en: 'Supermarkets',          color: '#6B7A3A' },
  { id: 'fish',        es: 'Pescaderías',            en: 'Fish markets',          color: '#4A8A8A' },
  { id: 'pharmacy',    es: 'Farmacias',              en: 'Pharmacies',            color: '#E8985C' },
  { id: 'health',      es: 'Centros de salud',       en: 'Health centres',        color: '#D14747' },
  { id: 'activity',    es: 'Actividades',            en: 'Activities',            color: '#FF8A3A' },
  { id: 'town',        es: 'Pueblos',                en: 'Towns',                 color: '#8A4A24' },
  { id: 'culture',     es: 'Lugares de interés',     en: 'Places of interest',    color: '#5C7AAB' },
  { id: 'bookshop',    es: 'Librerías',              en: 'Bookshops',             color: '#A07842' },
  { id: 'market',      es: 'Mercadillos',            en: 'Street markets',        color: '#9E7A2C' },
];

// ----- Lugares: nombre, categoría, descripción opcional, coords aproximadas, URL -----
// Las coordenadas son aproximadas (centroides de pueblos cuando no hay punto exacto).
// Cuando un goo.gl link está disponible, va en .url para el detalle.
const PLACES = [
  // Hestía (centro del mapa) — los 3 en Vera Playa
  // Coordenadas exactas extraídas de los Plus Codes que el usuario
  // pegó desde Google Maps (decodificadas a lat/lng centradas en cada
  // pin). Direcciones postales:
  //   · Mar      — C. Islas Canarias 7, Bloque 3 · 65HW+J3 Vera
  //   · Thalassa — C. Tomillo 2                  · 65MG+8C Playas de Vera
  //   · Salinas  — Avda. Alcazaba 115, Pueblo Salinas Fase II · 65JJ+9P Playas de Vera
  { id: 'hestia-mar',     name: 'Hestía Vera Mar',      cat: 'home',  lat: 37.22883, lng: -1.80385 },
  { id: 'hestia-thalassa',name: 'Hestía Vera Thalassa', cat: 'home',  lat: 37.23336, lng: -1.82415 },
  { id: 'hestia-salinas', name: 'Hestía Vera Salinas',  cat: 'home',  lat: 37.23094, lng: -1.81860 },

  // Supermercados
  { id: 'coviran',        name: 'Covirán', desc: 'El más cercano (pequeño, andando), junto al hotel Vera Playa.', cat: 'super', lat: 37.2235, lng: -1.7975 },
  { id: 'consum',         name: 'Consum', cat: 'super', url: 'https://goo.gl/maps/h6UvnBe3ATHpsPXbA', lat: 37.2200, lng: -1.8090 },
  { id: 'mercadona',      name: 'Mercadona Vera Playa', cat: 'super', url: 'https://goo.gl/maps/axi9Lb9xLp8yuVUR8', lat: 37.2360, lng: -1.7935 , featured: true },
  { id: 'super-vera',     name: 'Vera (Dia · Lidl · Mercadona)', desc: 'Supermercados grandes en Vera pueblo.', cat: 'super', lat: 37.2491, lng: -1.8639 , featured: true },

  // Librerías
  { id: 'nobel',          name: 'Nobel', desc: 'Librería en Vera.', cat: 'bookshop', lat: 37.2491, lng: -1.8639 , featured: true },
  { id: 'macondo',        name: 'Macondo', desc: 'Librería en Mojácar.', cat: 'bookshop', lat: 37.1377, lng: -1.8523 , featured: true },

  // Restaurantes
  { id: 'riad-cabrera',   name: 'Riad Cabrera',     desc: 'Marroquí en Sierra Cabrera. Carretera de montaña, pero merece muchísimo la pena.', tier: '€€€', cat: 'restaurant', lat: 37.1550, lng: -1.8700 , featured: true },
  { id: 'juan-moreno',    name: 'Juan Moreno',       desc: 'Sofisticado. Cocina de autor.',           tier: '€€€', cat: 'restaurant', lat: 37.2495, lng: -1.8623 , featured: true },
  { id: 'terraza-carmona',name: 'Terraza Carmona',   desc: 'Cocina española moderna en Vera pueblo.', tier: '€€',  cat: 'restaurant', lat: 37.2486, lng: -1.8635 },
  { id: 'gateway-india',  name: 'Gateway to India',  desc: 'Hindú. Bueno y barato.',                   tier: '€',   cat: 'restaurant', lat: 37.2230, lng: -1.8090 },
  { id: 'pomodoro',       name: 'Pizzería Pomodoro', desc: 'A pie de playa.',                          tier: '€€',  cat: 'restaurant', lat: 37.2270, lng: -1.7920 },
  { id: 'trattoria',      name: 'La Trattoria da Marco', desc: 'Garrucha. Las pizzas están geniales.', tier: '€',   cat: 'restaurant', lat: 37.1810, lng: -1.8230 },
  { id: 'lua',            name: 'Lúa',               desc: 'Sofisticado. Mejor para cena o copa.',     tier: '€€€', cat: 'restaurant', lat: 37.2310, lng: -1.7935 , featured: true },
  { id: 'bistro',         name: 'The Bistro',        desc: 'Bastante bien.',                            tier: '€€',  cat: 'restaurant', lat: 37.2310, lng: -1.7945 },
  { id: 'koa',            name: 'Resto Bar Koa',     desc: 'Frente a Hestía Vera Mar.',                 tier: '€€',  cat: 'restaurant', lat: 37.2245, lng: -1.7965 , featured: true },
  { id: 'bbme-rest',      name: 'Restaurante Bbme Palomares', desc: 'En plena playa, a 10 min a pie.',  tier: '€€',  cat: 'restaurant', lat: 37.2155, lng: -1.7800 },
  { id: 'playa-azul',     name: 'Hostal Playa Azul', desc: 'Villaricos. Excelente paella con bogavante.', tier: '€€', cat: 'restaurant', lat: 37.2460, lng: -1.7660 , featured: true },
  { id: 'tadeo',          name: 'Tadeo',             desc: 'Villaricos. Arroz con bogavante y tostas de ahumados.', tier: '€€', cat: 'restaurant', lat: 37.2455, lng: -1.7670 , featured: true },
  { id: 'rosado',         name: 'Freiduría Bar Rosado', desc: 'Buenas referencias.',                    tier: '€€',  cat: 'restaurant', lat: 37.2240, lng: -1.8095 },
  { id: 'av-alicante',    name: 'Av. Ciudad de Alicante', desc: 'Detrás del Consum: pubs, comida rápida y más.',     cat: 'restaurant', lat: 37.2196, lng: -1.8082 },
  { id: 'valentino',      name: 'Ristorante di Valentino', desc: 'Mojácar.',                            tier: '€€',  cat: 'restaurant', lat: 37.1377, lng: -1.8523 },
  { id: 'cabo-norte',     name: 'Cabo Norte',        desc: 'Mojácar. Buena materia prima a buen precio.', tier: '€€',cat: 'restaurant', lat: 37.1370, lng: -1.8530 },
  { id: 'neptuno',        name: 'Restaurante Neptuno', desc: 'Mojácar. Buen pescado.',                  tier: '€€',  cat: 'restaurant', lat: 37.1360, lng: -1.8520 },
  { id: 'martin-fierro',  name: 'Asador Martín Fierro', desc: 'Rodalquilar.',                            tier: '€€€', cat: 'restaurant', lat: 36.8475, lng: -2.0395 , featured: true },
  { id: 'oro-luz',        name: 'Oro y Luz',         desc: 'Rodalquilar.',                                tier: '€€€', cat: 'restaurant', lat: 36.8480, lng: -2.0400 },
  { id: 'la-villa',       name: 'La Villa',          desc: 'Aguamarga.',                                  tier: '€€€', cat: 'restaurant', lat: 36.9395, lng: -2.0000 },

  // Restaurantes celíacos
  { id: 'celiac-near',    name: 'Cerca de Hestía: Lúa, Chiringuito Maruja, Pizzería Memoli', cat: 'celiac', lat: 37.2240, lng: -1.7980 },
  { id: 'boracay',        name: 'Boracay (Garrucha)', cat: 'celiac', lat: 37.1810, lng: -1.8230 },
  { id: 'kontiki',        name: 'Mojácar: Cabo Norte, Neptuno, Kontiki', cat: 'celiac', lat: 37.1377, lng: -1.8523 },
  { id: 'regio',          name: 'Vera pueblo: Juan Moreno, Terraza Carmona, Regio', cat: 'celiac', lat: 37.2491, lng: -1.8639 },

  // Copas y chiringuitos
  { id: 'turquesa',       name: 'Chiringuito Playa Turquesa', desc: 'Andando desde casa.', cat: 'bar', lat: 37.2260, lng: -1.7935 , featured: true },
  { id: 'paraiso',        name: 'Paraíso Vera Beach', desc: 'Andando desde casa.',         cat: 'bar', lat: 37.2300, lng: -1.7920 },
  { id: 'chumbo',         name: 'Chiringuito El Chumbo', desc: 'Andando desde casa.',      cat: 'bar', lat: 37.2360, lng: -1.7895 },
  { id: 'marau',          name: 'Marau Beach Club',                                            cat: 'bar', lat: 37.2410, lng: -1.7895 , featured: true },
  { id: 'mar-arena',      name: 'Chiringuito Mar y Arena',                                     cat: 'bar', lat: 37.2335, lng: -1.7910 },
  { id: 'bbme-palomares', name: 'Bbme Palomares', desc: 'En plena playa, a 10 min a pie.',     cat: 'bar', lat: 37.2155, lng: -1.7800 , featured: true },

  // Pescaderías
  { id: 'mercado-vera',   name: 'Mercado de abastos (Vera)', cat: 'fish', url: 'https://goo.gl/maps/PaEerwZNxAK1kNTS8', lat: 37.2486, lng: -1.8625 , featured: true },
  { id: 'el-mero',        name: 'Pescadería El Mero (Garrucha)', cat: 'fish', url: 'https://goo.gl/maps/AdJz6SEyGRvLeToDA', lat: 37.1815, lng: -1.8235 , featured: true },
  { id: 'isabel',         name: 'Pescados y Mariscos Isabel (Garrucha)', cat: 'fish', url: 'https://goo.gl/maps/RHCieMNkgo3FL8m5A', lat: 37.1820, lng: -1.8240 },
  { id: 'pescados-online',name: 'Pescados Garrucha (online)', cat: 'fish', url: 'https://pescadosgarrucha.es/', lat: 37.1815, lng: -1.8230 },

  // Farmacias y salud
  { id: 'farmacia-1',     name: 'Farmacia (junto Consum)', cat: 'pharmacy', url: 'https://goo.gl/maps/bGMV1sjwUqrRTNzk6', lat: 37.2210, lng: -1.8085 },
  { id: 'farmacia-2',     name: 'Farmacia Vera Playa',     cat: 'pharmacy', url: 'https://goo.gl/maps/GaRHGscDhErp9kBG7', lat: 37.2260, lng: -1.7985 },
  { id: 'cs-vera',        name: 'Centro de Salud de Vera', cat: 'health',   url: 'https://goo.gl/maps/ei7cMoTYLmWLnWZj7', lat: 37.2473, lng: -1.8612 },
  { id: 'virgen-alcazar', name: 'Virgen del Alcázar', desc: 'Privado.',     cat: 'health', url: 'https://goo.gl/maps/AXJ74Goy1ESTtBVy7', lat: 37.6850, lng: -1.7060 },

  // Mercadillos
  { id: 'mercadillos',    name: 'Calendario semanal Almería', cat: 'market', url: 'https://www.mercadillosemanal.com/en.almeria', lat: 37.2491, lng: -1.8639 },

  // Actividades
  { id: 'aquavera',       name: 'Parque acuático Aquavera',  cat: 'activity', url: 'https://www.aquavera.com/',          lat: 37.2230, lng: -1.7960 },
  { id: 'lunar-cable',    name: 'Lunar Cable Park',          cat: 'activity', url: 'https://lunarcablepark.com/',         lat: 37.3970, lng: -1.7320 },
  { id: 'rumboalcabo',    name: 'Paseos en barco · Rumbo al Cabo', cat: 'activity', url: 'http://www.rumboalcabo.com/',  lat: 37.1815, lng: -1.8235 },
  { id: 'caboafondo',     name: 'Paseos en barco · El Cabo a Fondo', cat: 'activity', url: 'https://elcaboafondo.es',     lat: 36.7605, lng: -2.1075 },
  { id: 'cabogata',       name: 'Paseos en barco · Cabo de Gata', cat: 'activity', url: 'https://www.cabogataalmeria.com',lat: 36.7605, lng: -2.1075 },
  { id: 'buceo-tortuga',  name: 'Buceo · Tortuga',           cat: 'activity', url: 'https://www.buceotortuga.com',        lat: 37.2470, lng: -1.7660 },
  { id: 'buceo-villaricos', name: 'Buceo · Villaricos Sub',  cat: 'activity', url: 'https://www.villaricosub.com',        lat: 37.2470, lng: -1.7660 },
  { id: 'buceo-mojacar',  name: 'Buceo · Mojácar',           cat: 'activity', url: 'https://www.buceomojacar.com',        lat: 37.1380, lng: -1.8520 },
  { id: 'mojacar-fiesta', name: 'Mojácar Fiesta · actividades', cat: 'activity', url: 'https://mojacarfiesta.com/actividades/', lat: 37.1377, lng: -1.8523 },
  { id: 'aquamundo',      name: 'Motos de agua · Aquamundo (sin titulación)', cat: 'activity', url: 'https://www.aquamundo.es', lat: 37.2300, lng: -1.7960 },
  { id: 'karting',        name: 'Karting Garrucha',          cat: 'activity', url: 'https://kartinggarrucha.es/',         lat: 37.1810, lng: -1.8230 },
  { id: 'biplaza',        name: 'Vuelo en biplaza (Vera-Palomares)', cat: 'activity', url: 'https://aeronomadas.com/es/vuelos-biplaza', lat: 37.2150, lng: -1.7720 },
  { id: 'turismo-ind',    name: 'Turismo industrial y científico', cat: 'activity', url: 'https://myalmeria.com/turismo-industrial-y-cientifico-en-almeria', lat: 36.8400, lng: -2.4600 },
  { id: 'vera-surfing',   name: 'Vera Surfing', cat: 'activity', url: 'https://cambiatugesto.vera.es/turismo/index.php?page=directorio_view&id=1498', lat: 37.2240, lng: -1.7950 },
  { id: 'vela-almeria',   name: 'Vela Almería', cat: 'activity', url: 'https://www.velaalmeria.es', lat: 36.8350, lng: -2.4630 },
  { id: 'jetski-island',  name: 'Motos de agua · Carboneras (Desert Island)', cat: 'activity', url: 'https://instagram.com/desertislandjetskiclub', lat: 36.9990, lng: -1.9010 },
  { id: 'buggy',          name: 'Buggy en el desierto', cat: 'activity', url: 'https://buggy-almeria.com/', lat: 37.0540, lng: -2.3880 },
  { id: 'club-nautico',   name: 'Club Náutico Almanzora', cat: 'activity', url: 'https://maps.app.goo.gl/kgT5rYortJ2s5oPN8', lat: 37.2530, lng: -1.7720 },
  { id: 'bicis',          name: 'Alquiler de bicicletas (Vera Playa)', cat: 'activity', url: 'https://maps.app.goo.gl/yPqqBXpwgcZyu6568', lat: 37.2270, lng: -1.7965 },
  { id: 'bicis-villaricos',name: 'Bicis Villaricos', desc: 'Tel. 627 139 092', cat: 'activity', lat: 37.2470, lng: -1.7660 },

  // Pueblos
  { id: 't-mojacar',      name: 'Mojácar (casco antiguo)', cat: 'town', lat: 37.1377, lng: -1.8523 },
  { id: 't-vera',         name: 'Vera pueblo',             cat: 'town', lat: 37.2491, lng: -1.8639 },
  { id: 't-velez',        name: 'Vélez-Rubio',             cat: 'town', lat: 37.6520, lng: -2.0760 },
  { id: 't-sorbas',       name: 'Sorbas',                  cat: 'town', lat: 37.0920, lng: -2.0770 },
  { id: 't-castillo',     name: 'Castillo Marqués de los Vélez', desc: 'Vélez-Blanco.', cat: 'town', lat: 37.6905, lng: -2.0998 },
  { id: 't-gergal',       name: 'Gérgal',                  cat: 'town', lat: 37.1110, lng: -2.5430 },
  { id: 't-lorca',        name: 'Lorca (Murcia)',          cat: 'town', lat: 37.6770, lng: -1.7000 },
  { id: 't-cartagena',    name: 'Cartagena (teatro romano)', cat: 'town', lat: 37.6040, lng: -0.9870 },

  // Lugares de interés
  // Lugares de interés
  { id: 'geoda-pulpi',    name: 'Geoda de Pulpí',          cat: 'culture', url: 'https://www.geodapulpi.es', lat: 37.4083, lng: -1.7635 },
  { id: 'cuevas-sorbas',  name: 'Cuevas de Sorbas',        cat: 'culture', url: 'https://www.cuevasdesorbas.com/', lat: 37.1070, lng: -2.0820 },
  { id: 'laguna',         name: 'Laguna de Puerto Rey',    cat: 'culture', lat: 37.2110, lng: -1.7770 },
  { id: 'el-argar',       name: 'Yacimiento prehistórico de El Argar', desc: 'Antas.', cat: 'culture', url: 'https://maps.app.goo.gl/dyCfYS3L8qruFVPD9', lat: 37.2440, lng: -1.8920 },
  { id: 'tabernas',       name: 'Desierto de Tabernas',    cat: 'culture', url: 'https://www.tabernas.es/', lat: 37.0410, lng: -2.3890 },
  { id: 'minihollywood',  name: 'MiniHollywood (Oasys)',   cat: 'culture', url: 'https://www.oasysparquetematico.com/', lat: 37.0050, lng: -2.4750 },
  { id: 'aquarium',       name: 'Aquarium Costa de Almería', cat: 'culture', url: 'https://www.aquariumcostadealmeria.com/', lat: 36.7674, lng: -2.6094 },
  { id: 'mariposario',    name: 'Mariposario de Almería',  cat: 'culture', url: 'https://g.co/kgs/meY7kj', lat: 36.7641, lng: -2.6109 },

  // Playas (orden geográfico: norte → Vera → Cabo de Gata → Almería → Adra).
  // Cada entrada lleva rating (estrellas Google), services (qué tiene)
  // y access (cómo se llega: 🚗 coche · 🚌 bus · 🚶 a pie · ⛵ barca).
  // ── HACIA EL NORTE (camino a Murcia)
  { id: 'p-cocedores',    name: 'Playa de los Cocedores',        desc: 'San Juan de los Terreros (Pulpí). Última cala almeriense antes de Murcia. Aguas turquesas y rocas de arenisca con cuevas naturales.', cat: 'beach', rating: 4.5, services: '🛏️ 🚻 ♿', access: '🚗 parking pequeño · pista corta', url: 'https://goo.gl/maps/pCTJ8y5mt4y4VYkE8', lat: 37.3790, lng: -1.6260 },
  { id: 'p-carolina',     name: 'Playa de la Carolina',          desc: 'San Juan de los Terreros. Larga, dorada, tranquila. Familiar.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿', access: '🚗 parking abundante', lat: 37.3550, lng: -1.6510 },
  { id: 'p-calabardina',  name: 'Playa de Calabardina (Águilas)', desc: 'Murcia. Pueblo costero íntimo. Cala protegida, agua transparente. 35 min.', cat: 'beach', rating: 4.5, services: '🚿 🍹 🛏️ 🚻', access: '🚗 parking en pueblo', lat: 37.4020, lng: -1.5840 },
  { id: 'p-hornillo',     name: 'Playa del Hornillo (Águilas)',  desc: 'Murcia. Cala urbana de aguas tranquilas, junto a la antigua estación inglesa.', cat: 'beach', rating: 4.5, services: '🚿 🛟 🍹 🛏️ 🚻', access: '🚗 · 🚌 línea Águilas', lat: 37.4080, lng: -1.5780 },
  { id: 'p-calnegre',     name: 'Playas de Calnegre',            desc: 'Lorca-Mazarrón (Murcia). Parque regional protegido, calas vírgenes y áridas. 50 min.', cat: 'beach-hard', rating: 4.6, services: 'sin servicios', access: '🚗 pista de tierra · 🚶 corto', lat: 37.4730, lng: -1.4250 },

  // ── VERA PLAYA Y ALREDEDORES INMEDIATOS
  { id: 'p-vera',         name: 'Playa de Vera (sector textil)', desc: 'Justo al lado de Hestía. Larga, fina, agua templada. La playa de cabecera.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿ 🏊 Bandera Azul', access: '🚶 desde Hestía · 🚗 parking en calle', lat: 37.2275, lng: -1.7935 },
  { id: 'p-garrucha',     name: 'Playa de Garrucha',             desc: 'Pueblo pesquero a 10 min. Buena lonja de pescado. Paseo agradable.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿', access: '🚗 parking en pueblo', lat: 37.1810, lng: -1.8230 },
  { id: 'p-macenas',      name: 'Playa de Macenas (Mojácar)',    desc: 'Sur de Mojácar. Mezcla de calas vírgenes y arena dorada. Castillo del s. XVIII al fondo.', cat: 'beach', rating: 4.5, services: '🍹 🛏️ parcial', access: '🚗 acceso por carretera', lat: 37.0830, lng: -1.8350 },
  { id: 'p-piedras',      name: 'Piedras de Molino (Carboneras)', desc: 'Cala icónica al lado del Algarrobico. Aguas cristalinas, fondo rocoso para snorkel.', cat: 'beach', rating: 4.5, services: 'sin servicios', access: '🚗 parking pequeño · 🚶 5 min', url: 'https://goo.gl/maps/eySnjWJp1YcjkSiu9', lat: 37.0200, lng: -1.8730 },

  // ── HACIA EL SUR (Cabo de Gata)
  { id: 'p-mesa-roldan',  name: 'Mesa Roldán (Carboneras)',      desc: 'Domo volcánico con faro y fortaleza. Mirador con vistas a la Playa de los Muertos. Sale en Juego de Tronos.', cat: 'beach', rating: 4.7, services: 'mirador · sin baño', access: '🚗 hasta el faro · 🚶 corto', lat: 36.9620, lng: -1.9080 },
  { id: 'p-muertos',      name: 'Playa de los Muertos',          desc: 'Carboneras. Una de las mejores playas de España. Aguas cristalinas, cantos rodados grandes. Sin un solo servicio.', cat: 'beach-hard', rating: 4.6, services: 'virgen · sin servicios', access: '🚗 parking de pago en verano · 🚶 15 min sendero pedregoso, fuerte pendiente', url: 'https://goo.gl/maps/uh1baJWHPp1uan81A', lat: 37.0050, lng: -1.8800, featured: true, featuredOrder: 1 },
  { id: 'p-enmedio',      name: 'Cala de Enmedio',               desc: 'Agua Amarga. Nuestra favorita. Arena fina blanca enmarcada por roca esculpida. Casi virgen porque exige caminar.', cat: 'beach-hard', rating: 4.7, services: 'virgen · sin servicios', access: '🚗 hasta Agua Amarga · 🚶 30 min campo a través', url: 'https://goo.gl/maps/i72YXUhFgBzi7vhf6', lat: 36.9540, lng: -1.9740, featured: true, featuredOrder: 4 },
  { id: 'p-plomo',        name: 'Cala del Plomo',                desc: 'Agua Amarga. Cala virgen de arena oscura. Aguas cristalinas, snorkel.', cat: 'beach-hard', rating: 4.6, services: 'virgen · sin servicios', access: '🚗 pista corta · 🚶 30 min a pie', lat: 36.9460, lng: -1.9690 },
  { id: 'p-aguamarga',    name: 'Playa de Agua Amarga',          desc: 'Pueblo blanco con encanto, calas pequeñas y restaurantes a pie de arena.', cat: 'beach', rating: 4.5, services: '🚿 🍹 🛏️ 🚻', access: '🚗 parking en pueblo', lat: 36.9395, lng: -2.0000 },
  { id: 'p-negras',       name: 'Playa de Las Negras',           desc: 'Pueblo bohemio con cantos rodados negros y agua cristalina. Punto de salida hacia la Cala de San Pedro.', cat: 'beach', rating: 4.4, services: '🚿 🍹 🚻', access: '🚗 parking a la entrada del pueblo · ⛵ taxi-barca a San Pedro', lat: 36.8770, lng: -2.0030 },
  { id: 'p-san-pedro',    name: 'Cala de San Pedro',             desc: 'Comunidad hippie estable, fuente de agua dulce, sin servicios. Solo accesible a pie o por barca.', cat: 'beach-hard', rating: 4.7, services: 'virgen · fuente natural', access: '🚶 90 min desde Las Negras (sendero costero) · ⛵ taxi-barca en verano', lat: 36.8540, lng: -1.9890 },
  { id: 'p-playazo',      name: 'El Playazo de Rodalquilar',     desc: 'Cabo de Gata. De fácil acceso, larga, rocas en los extremos. Castillo de San Ramón al sur.', cat: 'beach', rating: 4.6, services: '🚻 mínimos · sin chiringuito', access: '🚗 hasta el aparcamiento al pie de la playa', url: 'https://goo.gl/maps/bu6fEsoT1mHC9j2w6', lat: 36.8470, lng: -2.0230 },
  { id: 'p-isleta',       name: 'La Isleta del Moro',            desc: 'Pueblo pesquero diminuto con calas. Snorkel y comer en La Ola junto al mar.', cat: 'beach', rating: 4.5, services: '🍹 🚻', access: '🚗 parking en pueblo · 🚶 corto', url: 'https://maps.google.com?q=Playa+del+Penon+Blanco', lat: 36.7970, lng: -2.0630 },
  { id: 'p-genoveses',    name: 'Playa de los Genoveses',        desc: 'San José. Bahía perfecta de medio km, dunas con sabinas. Sin servicios para preservar el paraje.', cat: 'beach', rating: 4.7, services: 'virgen · 🛟 verano', access: '🚌 bus desde San José en verano (acceso restringido al coche) · 🚲 carril bici · 🚶 25 min desde San José', lat: 36.7610, lng: -2.0890, featured: true, featuredOrder: 3 },
  { id: 'p-monsul',       name: 'Playa de Mónsul',               desc: 'San José. Famosa por la duna y la roca volcánica. Sale en El bueno, el feo y el malo y en Indiana Jones.', cat: 'beach', rating: 4.7, services: '🚻 🛟 verano · sin chiringuito', access: '🚌 bus desde San José en verano (acceso restringido al coche) · 🚲 carril bici', lat: 36.7460, lng: -2.1130, featured: true, featuredOrder: 2 },
  { id: 'p-barronal',     name: 'Playa del Barronal',            desc: 'San José. Más virgen que Mónsul. Detrás de las dunas de la pista. Una de nuestras favoritas.', cat: 'beach', rating: 4.6, services: 'virgen · sin servicios', access: '🚌 bus + 🚶 10 min andando entre dunas', url: 'https://goo.gl/maps/sF2xaKDPrHEgjpxv6', lat: 36.7430, lng: -2.1180, featured: true, featuredOrder: 5 },
  { id: 'p-medialuna',    name: 'Cala de la Media Luna',         desc: 'San José. Pequeña, simétrica, mar transparente. Se llega andando desde el Barronal.', cat: 'beach-hard', rating: 4.6, services: 'virgen', access: '🚶 desde el Barronal por sendero costero', url: 'https://goo.gl/maps/ngDbWgoBfAdH5x4S8', lat: 36.7415, lng: -2.1195 },
  { id: 'p-cabogata',     name: 'Las Salinas (Cabo de Gata pueblo)', desc: 'Frente a las salinas con flamencos. Faro al fondo. Atardecer espectacular.', cat: 'beach', rating: 4.5, services: '🚿 🍹 🛏️ 🚻 ♿', access: '🚗 parking gratuito · 🚌 línea M-100', lat: 36.7530, lng: -2.2250 },
  { id: 'p-fabriquilla',  name: 'La Fabriquilla / El Corralete', desc: 'Última cala antes del Faro de Cabo de Gata. Roca volcánica, agua transparente. Punto más al sur.', cat: 'beach', rating: 4.5, services: 'mínimos', access: '🚗 hasta el faro', lat: 36.7270, lng: -2.1950 },

  // ── ALMERÍA CAPITAL (paso intermedio hacia Adra)
  { id: 'p-zapillo',      name: 'Playa del Zapillo (Almería)',   desc: 'Capital. Bandera Azul. Paseo, hamacas, chiringuitos, paddle.', cat: 'beach', rating: 4.3, services: '🚿 🛟 🍹 🛏️ 🚻 ♿ 🏊 Bandera Azul', access: '🚗 · 🚌 bus urbano', lat: 36.8290, lng: -2.4380 },
  { id: 'p-nueva-almeria', name: 'Playa Nueva Almería / Térmica', desc: 'Capital. Paralela al Zapillo, 1,5 km de arena con todos los servicios.', cat: 'beach', rating: 4.3, services: '🚿 🛟 🍹 🛏️ 🚻 ♿', access: '🚗 · 🚌 bus urbano', lat: 36.8270, lng: -2.4540 },
  { id: 'p-costacabana',  name: 'Playa de Costacabana',          desc: 'Almería. Larga, urbana, con un paseo amplio. Buena para familias.', cat: 'beach', rating: 4.2, services: '🚿 🛟 🍹 🛏️ 🚻', access: '🚗 · 🚌 bus M-2', lat: 36.8200, lng: -2.4040 },
  { id: 'p-almeria',      name: 'Playa de El Palmer (Almería)',  desc: 'Capital. Paseo, hamacas, chiringuitos. 1 h 15 min en coche.', cat: 'beach', rating: 4.2, services: '🚿 🛟 🍹 🛏️ 🚻', access: '🚗 · 🚌 bus urbano', lat: 36.8230, lng: -2.4140 },
  { id: 'p-aguadulce',    name: 'Playa de Aguadulce (Roquetas)', desc: 'Roquetas de Mar. Larga, urbana, amplia. Buena para familia.', cat: 'beach', rating: 4.3, services: '🚿 🛟 🍹 🛏️ 🚻 ♿ 🏊 Bandera Azul', access: '🚗 parking · 🚌 línea M-302', lat: 36.8070, lng: -2.5680 },
  { id: 'p-toyo',         name: 'Playa del Toyo (Retamar)',      desc: 'Retamar / El Ejido. Limita con el Parque Natural. Arena fina y tranquila.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿', access: '🚗 parking', lat: 36.8100, lng: -2.3640 },
  { id: 'p-almerimar',    name: 'Playa de Almerimar (El Ejido)',  desc: 'Junto al puerto deportivo. 1 h 30 min de Vera. Aguas tranquilas.', cat: 'beach', rating: 4.3, services: '🚿 🛟 🍹 🛏️ 🚻 ♿ 🏊 Bandera Azul', access: '🚗 parking', lat: 36.7050, lng: -2.7920 },
  { id: 'p-balerma',      name: 'Playa de Balerma (El Ejido)',    desc: 'La playa más larga de la zona. Arena gruesa, casi virgen en algunos tramos.', cat: 'beach', rating: 4.2, services: '🚿 🛟 🍹 🛏️ 🚻', access: '🚗 parking abundante', lat: 36.7430, lng: -2.8870 },
  { id: 'p-adra',         name: 'Playa de San Nicolás (Adra)',    desc: 'Adra. Última playa antes de Granada. 1 h 50 min en coche.', cat: 'beach', rating: 4.2, services: '🚿 🛟 🍹 🛏️ 🚻', access: '🚗 parking', lat: 36.7430, lng: -3.0220 },


  // Playas para perros
  { id: 'p-mijo',         name: 'Cala de Mijo',         cat: 'beach-dog', url: 'https://goo.gl/maps/bH2xyYdjNCdHvGy19', lat: 37.0440, lng: -1.8910 },
  { id: 'p-canada',       name: 'Playa de la Cañada del Negro', cat: 'beach-dog', url: 'https://goo.gl/maps/9iQMPzR1YWpPGjNc6', lat: 37.0220, lng: -1.8770 },
  { id: 'playeros',       name: 'Playeros.es · directorio', cat: 'beach-dog', url: 'http://www.playeros.es', lat: 37.1100, lng: -1.8395 },

  // Playas naturistas (Vera Playa es la mayor zona naturista de España)
  { id: 'p-naturista-vera', name: 'Vera Playa naturista', desc: 'Frente al complejo naturista. La mayor zona naturista de España.', cat: 'beach-nude', lat: 37.2425, lng: -1.7880 },
  { id: 'p-naturista-almanzora', name: 'Playa del Almanzora (zona naturista)', desc: 'Tramo norte de la playa, junto a la desembocadura del Almanzora.', cat: 'beach-nude', lat: 37.2530, lng: -1.7720 },
  { id: 'p-naturista-marina', name: 'Playa de la Marina de la Torre (Mojácar)', desc: 'Zona naturista en su tramo sur.', cat: 'beach-nude', lat: 37.1075, lng: -1.8395 },

  // Playas con servicios (sombrillas, hamacas, chiringuitos)
  { id: 'p-srvc-vera',    name: 'Playa de Vera (sector textil)', desc: 'Sombrillas, hamacas y chiringuitos.', cat: 'beach-srvc', lat: 37.2275, lng: -1.7935 },
  { id: 'p-srvc-mojacar', name: 'Mojácar Playa',           desc: 'Hamacas, sombrillas y chiringuitos a lo largo del paseo.', cat: 'beach-srvc', lat: 37.1100, lng: -1.8395 },
  { id: 'p-srvc-garrucha',name: 'Playa de Garrucha',       desc: 'Servicios de playa y paseo marítimo.', cat: 'beach-srvc', lat: 37.1815, lng: -1.8210 },
  { id: 'p-srvc-quitapellejos', name: 'Playa Quitapellejos (Palomares)', desc: 'Hamacas, sombrillas y chiringuitos cerca de Hestía.', cat: 'beach-srvc', lat: 37.2050, lng: -1.7790 },
];

// Contenido COMPARTIDO entre las 3 guías (carta de bienvenida, marca, etc.)
const GUIDE_SHARED = {
  es: {
    welcome: {
      title: 'Bienvenido a tu Hestía',
      paras: [
        'Si lees esto, tu reserva está más que confirmada — y no sabes la ilusión que nos hace tenerte aquí.',
        'Hemos puesto cariño en cada detalle de Hestía. Esperamos estar a la altura.',
        'Ya estés preparando el viaje, viviendo tus días aquí, o de vuelta a casa con la maleta a medio deshacer: todo lo que esté en nuestra mano, antes, durante o después de tu estancia, lo haremos. Sin dudarlo. Para eso estamos.',
        'Ahora descansa, relájate y descubre tu hogar lejos de tu casa.',
      ],
      sign: 'Con cariño,',
      signer: 'Fran y Alex',
    },
    name: {
      title: 'Nuestro nombre',
      paras: [
        'En la mitología griega, Hestía (en griego, Ἑστία) es la diosa del hogar, es decir, del fuego que da calor y vida a los hogares.',
        'Es una diosa pacífica y eso es lo que os deseamos en vuestra estancia: tranquilidad y descanso. No podíamos llamarnos de otra manera…',
      ],
    },
    why: {
      title: '¿Por qué hemos creado Hestía?',
      paras: [
        'Hestía no es lujo. Tampoco es un alquiler vacacional al uso. Se trata más bien de hogares, de alojamientos de calidad, con la intención de que os sintáis como en vuestra propia casa, creados con nuestro mayor cariño, esfuerzo y dedicación.',
        'Todo ello para que disfrutéis de vuestras merecidas vacaciones, sin preocuparos de nada, en un entorno cálido, bien decorado y cómodo. Hestía es lo que a nosotros nos gustaría encontrar cuando viajamos.',
      ],
    },
    cleaning: {
      title: 'Protocolo de limpieza',
      intro: 'Puedes estar tranquilo. Nuestros protocolos de limpieza garantizan la desinfección y la higiene tanto de las superficies, como de la ropa de hogar.',
      note: 'Es posible que algunos cojines de los que viste en nuestra web no estén pues los tendremos en cuarentena o en limpieza profunda.',
      recs: [
        'Por favor respeta los textiles y mobiliario de Hestía.',
        'Avísanos si quieres servicio opcional de limpieza o de textil.',
        'Las toallas, úsalas solo en Hestía.',
      ],
    },
    surroundings: {
      title: 'Alrededores y recomendaciones',
      intro: 'Sería imposible ofrecer un catálogo completo de recomendaciones sobre los alrededores de Hestía, pues sería infinito. Para empezar a explorar te recomendamos estas fuentes:',
      sources: [
        '¡Pregúntanos! Te ayudaremos con mucho gusto según nuestra experiencia y la de nuestros huéspedes como tú. Más abajo tienes una pequeña muestra…',
      ],
      sites: {
        title: 'Sitios web de recomendación turística',
        groups: [
          { title: 'Vera y pueblos del Levante almeriense', links: [
            { label: 'Turismo de Vera', url: 'https://www.veraturismo.com/' },
            { label: 'Ayuntamiento de Vera', url: 'https://www.vera.es/' },
            { label: 'Mojácar Turismo', url: 'https://mojacar.es/turismo/' },
            { label: 'Garrucha Turismo', url: 'https://www.garrucha.es/' },
            { label: 'Turismo de Cuevas del Almanzora', url: 'https://www.cuevasdelalmanzora.es/turismo' },
            { label: 'Pulpí Turismo (Geoda)', url: 'https://www.pulpi.es/turismo' },
            { label: 'Carboneras Turismo', url: 'https://www.carboneras.es/turismo' },
          ]},
          { title: 'Almería capital y provincia', links: [
            { label: 'Turismo de Almería · provincia', url: 'https://www.turismodealmeria.org/' },
            { label: 'Almería Capital · turismo', url: 'https://www.turismodealmeria.com/' },
            { label: 'Cabo de Gata · Níjar', url: 'https://www.cabogataalmeria.com/' },
            { label: 'Junta de Andalucía · turismo', url: 'https://www.andalucia.org/' },
            { label: 'Geoparque de Cabo de Gata', url: 'https://geoparquecabodegata.es/' },
            { label: 'Gourmet Almería · gastronomía', url: 'https://gourmetalmeria.com/' },
            { label: 'TripAdvisor Almería', url: 'https://www.tripadvisor.es/Tourism-g315912-Province_of_Almeria_Andalucia-Vacations.html' },
          ]},
          { title: 'Murcia occidental (Lorca, Águilas, Mazarrón)', links: [
            { label: 'Turismo Región de Murcia', url: 'https://www.murciaturistica.es/' },
            { label: 'Lorca Turismo', url: 'https://www.lorcaturismo.es/' },
            { label: 'Águilas Turismo', url: 'https://www.aguilas.es/turismo' },
            { label: 'Mazarrón Turismo', url: 'https://www.mazarron.es/turismo' },
            { label: 'Cartagena · Puerto de Culturas', url: 'https://www.cartagenaturismo.es/' },
            { label: 'Calasparra Turismo', url: 'https://www.calasparra.org/turismo' },
          ]},
        ],
      },
      categories: [
        { title: 'Supermercados', items: [
          'En Vera Playa, Consum y Mercadona, a menos de 3 km.',
          'En Vera, Dia, Lidl, Mercadona y otros más pequeños, así como mercados y mercadillos.',
        ]},
        { title: 'Farmacia', items: [
          'La más cercana, junto al Consum de Vera Playa.',
          'En Vera, Garrucha y Mojácar, hay varias.',
        ]},
        { title: 'Librerías', items: [
          'En Vera: Nobel.',
          'En Mojácar: Macondo.',
        ]},
        { title: 'Actividades', items: [
          'Parque acuático Aquavera: aquavera.com',
          'Paseos en barco: elcaboafondo.es · cabogataalmeria.com',
          'Buceo y snorkel: buceotortuga.com · villaricosub.com · buceomojacar.com',
          'En Mojácar: mojacarfiesta.com/actividades/',
          'Motos de agua sin titulación: aquamundo.es',
          'Karting Garrucha: kartinggarrucha.es',
          'Alquiler de bicis en Villaricos: 627 139 092',
          'Naturismo: gran oferta de playas, locales y zonas naturistas de Vera.',
          'Golf. En Vera y Mojácar tienes para elegir.',
          'Actividades de aventura: lunarcablepark.com',
        ]},
      ],
      restaurants_title: 'Nuestro TOP 10 restaurantes (a menos de 30 minutos)',
      restaurants: [
        'Riad Cabrera. Marroquí en Sierra Cabrera. Aunque es por carretera de montaña, merece la pena. €€€',
        'Juan Moreno. Sofisticado. Cocina de autor. €€€',
        'Gateway to India. Comida india. Agradable. €',
        'The Bistro. Bastante bueno. €€',
        'Lúa. Sofisticado. Mejor para cena/copa. €€€',
        'Freiduría Bar Rosado. Buenas referencias. €€',
        'Restaurante-Hostal Playa Azul (Villaricos). Excelente paella con bogavante. €€',
        'Yaho. Cocina oriental (china, japonesa) en Puerto Rey. Muy recomendable. €',
        'Pizzería La Trattoria da Marco (Garrucha). Buena pizza. €',
        'Marau Beach Club. A pie de playa. €€',
      ],
    },
    phones: {
      title: 'Teléfonos y datos de utilidad',
      wifi: { label: 'Contraseña WiFi', value: 'Mira en el router (puede haber cambiado)' },
      list: [
        { label: 'Bomberos', value: '080' },
        { label: 'Emergencias', value: '112' },
        { label: 'Ambulancias', value: '061' },
        { label: 'Policía local', value: '092' },
        { label: 'Policía de Vera', value: '950 39 00 10' },
        { label: 'Policía nacional', value: '091' },
        { label: 'Guardia Civil', value: '062' },
        { label: 'Guardia costera', value: '900 202 202' },
        { label: 'Taxi', value: '950 39 21 00' },
        { label: 'Cerrajero', value: '607 800 900' },
      ],
    },
    feedback: {
      title: 'Ayúdanos a mejorar',
      paras: [
        'Tu experiencia importa más que ninguna palabra que podamos escribir aquí. Si algo no ha estado a la altura, dínoslo antes de irte y lo solucionamos.',
        'Y si te gustó tu Hestía, una reseña honesta en Booking o Airbnb nos ayuda muchísimo a seguir mejorando.',
      ],
    },
  },
  en: {
    welcome: {
      title: 'Welcome to your Hestía',
      paras: [
        'If you\'re reading this, your booking is more than confirmed — and we couldn\'t be more thrilled to have you with us.',
        'We\'ve put care into every detail of this Hestía. We hope to live up to it.',
        'Whether you\'re still planning the trip, living your days here, or back home with a half-unpacked suitcase: anything in our hands, before, during or after your stay, we\'ll do it. No hesitation. That\'s what we\'re here for.',
        'Now rest, relax, and discover your home away from home.',
      ],
      sign: 'With love,',
      signer: 'Fran & Alex',
    },
    name: {
      title: 'Our name',
      paras: [
        'In Greek mythology, Hestia (Ἑστία) is the goddess of home — of the fireplace that warms and gives life to our homes.',
        'She is a peaceful goddess and that is exactly what we wish for your stay: rest and relaxation. We could not have any other name.',
      ],
    },
    why: {
      title: 'Why have we created Hestía?',
      paras: [
        'Hestía is not luxury. It is not a typical holiday rental either. Rather, it is high-quality accommodation for you to feel at home away from home, built with our deepest care, effort and dedication.',
        'All so that you can enjoy the holiday you deserve, free of worries, in a warm, well-decorated and comfortable place. Hestía is exactly what we would like to find every time we travel.',
      ],
    },
    cleaning: {
      title: 'Cleaning protocol',
      intro: 'You can rest easy. Our cleaning protocols guarantee the disinfection and hygiene of every surface and all home textiles.',
      note: 'Some cushions you may have seen on our website might be missing — they are in quarantine or deep cleaning.',
      recs: [
        'Please take care of Hestía\'s textiles and furniture.',
        'Ask us if you want optional cleaning or extra textile services.',
        'Use towels only inside Hestía.',
      ],
    },
    surroundings: {
      title: 'Surroundings and recommendations',
      intro: 'A complete catalogue of recommendations for the area around Hestía would be endless. To start exploring, we suggest these sources:',
      sources: [
        'Just ask us! We are happy to help based on our experience and that of guests like you. A small sample below…',
      ],
      sites: {
        title: 'Tourist information websites',
        groups: [
          { title: 'Vera and Levante Almeriense villages', links: [
            { label: 'Vera Tourism', url: 'https://www.veraturismo.com/' },
            { label: 'Vera Town Hall', url: 'https://www.vera.es/' },
            { label: 'Mojácar Tourism', url: 'https://mojacar.es/turismo/' },
            { label: 'Garrucha Tourism', url: 'https://www.garrucha.es/' },
            { label: 'Cuevas del Almanzora Tourism', url: 'https://www.cuevasdelalmanzora.es/turismo' },
            { label: 'Pulpí Tourism (Geode)', url: 'https://www.pulpi.es/turismo' },
            { label: 'Carboneras Tourism', url: 'https://www.carboneras.es/turismo' },
          ]},
          { title: 'Almería city and province', links: [
            { label: 'Almería Province · tourism', url: 'https://www.turismodealmeria.org/' },
            { label: 'Almería City · tourism', url: 'https://www.turismodealmeria.com/' },
            { label: 'Cabo de Gata · Níjar', url: 'https://www.cabogataalmeria.com/' },
            { label: 'Andalusia · tourism', url: 'https://www.andalucia.org/' },
            { label: 'Cabo de Gata Geopark', url: 'https://geoparquecabodegata.es/' },
            { label: 'Gourmet Almería · food', url: 'https://gourmetalmeria.com/' },
            { label: 'TripAdvisor Almería', url: 'https://www.tripadvisor.com/Tourism-g315912-Province_of_Almeria_Andalucia-Vacations.html' },
          ]},
          { title: 'Western Murcia (Lorca, Águilas, Mazarrón)', links: [
            { label: 'Region of Murcia · tourism', url: 'https://www.murciaturistica.es/' },
            { label: 'Lorca Tourism', url: 'https://www.lorcaturismo.es/' },
            { label: 'Águilas Tourism', url: 'https://www.aguilas.es/turismo' },
            { label: 'Mazarrón Tourism', url: 'https://www.mazarron.es/turismo' },
            { label: 'Cartagena · Port of Cultures', url: 'https://www.cartagenaturismo.es/' },
            { label: 'Calasparra Tourism', url: 'https://www.calasparra.org/turismo' },
          ]},
        ],
      },
      categories: [
        { title: 'Supermarkets', items: [
          'Vera Playa: Consum and Mercadona, less than 3 km away.',
          'Vera: Dia, Lidl, Mercadona and smaller shops, plus markets and street markets.',
        ]},
        { title: 'Pharmacy', items: [
          'The closest is next to Consum in Vera Playa.',
          'Several in Vera, Garrucha and Mojácar.',
        ]},
        { title: 'Bookshops', items: [
          'In Vera: Nobel.',
          'In Mojácar: Macondo.',
        ]},
        { title: 'Activities', items: [
          'Aquavera water park: aquavera.com',
          'Boat trips: elcaboafondo.es · cabogataalmeria.com',
          'Diving and snorkelling: buceotortuga.com · villaricosub.com · buceomojacar.com',
          'In Mojácar: mojacarfiesta.com/actividades/',
          'Jet skis (no licence): aquamundo.es',
          'Karting Garrucha: kartinggarrucha.es',
          'Bike rental in Villaricos: 627 139 092',
          'Nudism: many beaches, venues and naturist areas in Vera.',
          'Golf — choices in Vera and Mojácar.',
          'Adventure activities: lunarcablepark.com',
        ]},
      ],
      restaurants_title: 'Our TOP 10 restaurants (less than 30 min)',
      restaurants: [
        'Riad Cabrera. Moroccan, in Sierra Cabrera. The mountain road is worth it. €€€',
        'Juan Moreno. Sophisticated signature cuisine. €€€',
        'Gateway to India. Indian food. Pleasant. €',
        'The Bistro. Quite good. €€',
        'Lúa. Sophisticated. Better for dinner / drinks. €€€',
        'Freiduría Bar Rosado. Good references. €€',
        'Restaurante-Hostal Playa Azul (Villaricos). Excellent lobster paella. €€',
        'Yaho. Asian (Chinese, Japanese) in Puerto Rey. Highly recommended. €',
        'Pizzería La Trattoria da Marco (Garrucha). Good pizza. €',
        'Marau Beach Club. On the beach. €€',
      ],
    },
    phones: {
      title: 'Useful data and phone numbers',
      wifi: { label: 'WiFi password', value: 'Check the router (may have changed)' },
      list: [
        { label: 'Firefighters', value: '080' },
        { label: 'Emergencies', value: '112' },
        { label: 'Ambulance', value: '061' },
        { label: 'Local police', value: '092' },
        { label: 'Local police Vera', value: '950 39 00 10' },
        { label: 'National police', value: '091' },
        { label: 'Civil Guard', value: '062' },
        { label: 'Coast Guard', value: '900 202 202' },
        { label: 'Taxi', value: '950 39 21 00' },
        { label: 'Locksmith', value: '607 800 900' },
      ],
    },
    feedback: {
      title: 'Help us improve',
      paras: [
        'Your experience matters more than anything we can write here. If something isn\'t up to scratch, tell us before you leave and we\'ll fix it.',
        'And if you loved your Hestía, an honest review on Booking or Airbnb really helps us keep improving.',
      ],
    },
  },
};

// Contenido específico por Hestía (extraído de los PDFs originales)
const GUIDE_BY_APT = {
  // Hestía Vera Mar
  vm: {
    pdf: 'assets/HestiaVeraMar_GuiaHogar_v1.0.pdf',
    es: {
      rooms: [
        { id: 'salon', title: 'Mi salón', body: 'Mi sofá-cama y mi televisión plana son el rincón perfecto para una tarde de Netflix. La temperatura la controlas tú con el cuadro del aire acondicionado centralizado.', recs: [
          'No dejes el aire acondicionado encendido con las puertas abiertas o cuando no estés en Hestía.',
          'Echa un vistazo a las Normas de uso de Hestía, junto a la puerta de entrada.',
          'Amolda a tu gusto el color y tonalidad de la lámpara de mesa con el mando junto al cuadro del A/C.',
          'Dispones de extintor en el pasillo exterior a Hestía.',
        ]},
        { id: 'cocina', title: 'Mi cocina', body: 'Mi cocina tiene todo lo que necesitas para sentirte como en casa: mobiliario de calidad, electrodomésticos de alta gama y un set completo de pequeños electrodomésticos y detalles.', recs: [
          'Los libros de instrucciones de los electrodomésticos se encuentran en los cajones bajo la vitrocerámica.',
          'Evita el ciclo económico en lavadora y lavavajillas. Si bien ahorra agua, la duración es excesiva.',
          'El agua es potable, aunque quizás prefieras agua embotellada.',
        ]},
        { id: 'dormitorios', title: 'Mis dormitorios', body: 'Mi dormitorio principal mira al mar y tiene las mejores sábanas y rellenos nórdicos de plumas o sintéticos. Colchones de alta calidad y almohadas de diferentes durezas. En el armario te espera la sombrilla de playa.', recs: [
          'Las cremas bronceadoras pueden estropear sábanas, toallas y tapicerías.',
          'Cuidado con el aire acondicionado por la noche y las corrientes de aire.',
          'Ponte el despertador un día no muy nublado para ver el amanecer.',
        ]},
        { id: 'banos', title: 'Mis baños', body: 'Mis dos baños: uno con bañera, hidromasaje y cromoterapia en el espejo, y otro con ducha hidromasaje. Productos básicos para tus primeros días, aromas, velas, secador, botiquín y más.', recs: [
          'Haz un uso prudente y responsable del agua. El agua es vida.',
          'Las toallas del baño no son para la playa ni para la piscina.',
          'Cuidado con las cremas y maquillaje. Estropean los textiles del hogar.',
          'Usa la cromoterapia del espejo para crear ambiente — relajante de noche, vibrante por la mañana.',
        ]},
        { id: 'terraza', title: 'Mi terraza', body: 'Mi terraza tiene las mejores vistas y dos ambientes para cada momento de las vacaciones: día y noche.', recs: [
          'Disfruta de la tranquilidad y permite que tus vecinos también la disfruten.',
          'Mientras estés en la terraza apaga o reduce el A/C.',
          'Recoge el toldo y los cojines cuando sople aire, llueva o vayas a salir.',
          'Usa velas para crear el ambiente perfecto.',
        ]},
        { id: 'urbanizacion', title: 'Mi urbanización', body: 'Mi urbanización es textil — para olvidarse del mundo y cerca de todo. Tu plaza subterránea es la nº 160. Tienes entrada y salida controladas por código, plazas de garaje interiores en la planta -2, zona de parking exterior y portal de acceso peatonal (nº 14, 1.A) en planta 0, piscina y jacuzzi en planta -2, atajo peatonal a la playa y zonas verdes.', recs: [
          'Para ir a la piscina o playa baja en el ascensor a la planta -2, atravesa el parking y baja hasta la planta a nivel del suelo del bloque de enfrente. Allí encontrarás la zona de aguas.',
          'Junto a la piscina tienes un atajo para ir y volver de la playa.',
          'Respeta las zonas comunes y las normas de la urbanización.',
          'Respeta a los vecinos.',
          'No utilices en la piscina las toallas de casa.',
        ]},
      ],
    },
    en: {
      rooms: [
        { id: 'salon', title: 'My living room', body: 'My sofa-bed and flat-screen TV are the perfect spot for a Netflix afternoon. You control the temperature with the centralised A/C panel.', recs: [
          'Do not leave the air conditioner running with doors open or while you are away from Hestía.',
          'Take a look at Hestía\'s usage guidelines, next to the entrance door.',
          'Adjust colour and tonality of the table lamp with the remote next to the A/C panel.',
          'A fire extinguisher is in the corridor outside Hestía.',
        ]},
        { id: 'cocina', title: 'My kitchen', body: 'My kitchen has everything you need to feel at home: quality furniture, premium appliances and a full set of small appliances and details.', recs: [
          'Appliance manuals are in the drawers under the hob.',
          'Avoid the eco cycle on the washer and dishwasher — water-saving but excessively long.',
          'Tap water is drinkable, but you may prefer bottled.',
        ]},
        { id: 'dormitorios', title: 'My bedrooms', body: 'My master bedroom faces the sea and has the finest sheets and feather or synthetic duvets. Quality mattresses and pillows of different firmness. Your beach umbrella waits in the closet.', recs: [
          'Tanning creams can ruin sheets, towels and upholstery.',
          'Watch out for night-time A/C and drafts.',
          'Set the alarm one clear morning to catch the sunrise.',
        ]},
        { id: 'banos', title: 'My bathrooms', body: 'My two bathrooms: one with bathtub, hydromassage and chromotherapy mirror, and another with a hydromassage shower. Basic products for your first days, plus scents, candles, hairdryer, first-aid kit and more.', recs: [
          'Use water responsibly. Water is life.',
          'Bathroom towels are not for the beach or the pool.',
          'Be careful with creams and make-up — they damage textiles.',
          'Use the chromotherapy mirror to set the mood — relaxing at night, vibrant in the morning.',
        ]},
        { id: 'terraza', title: 'My terrace', body: 'My terrace has the best views and two atmospheres for every moment of your holiday: day and night.', recs: [
          'Enjoy the quiet — and let your neighbours enjoy it too.',
          'Turn off or reduce the A/C while you are on the terrace.',
          'Roll up the awning and put away cushions when it\'s windy, raining, or you go out.',
          'Use candles to create the perfect atmosphere.',
        ]},
        { id: 'urbanizacion', title: 'My complex', body: 'My complex is textile-free — to forget the world while staying near everything. Your underground parking space is nº 160. Code-controlled entrance, indoor parking on floor -2, outdoor parking and pedestrian entrance (nº 14, 1.A) on ground floor, pool and jacuzzi on floor -2, pedestrian shortcut to the beach and green areas.', recs: [
          'To reach the pool or beach: take the elevator down to floor -2, cross the car park, then go down to the ground level of the block opposite. Pool area is in the middle of the complex.',
          'Next to the pool you have a shortcut to and from the beach.',
          'Respect the common areas and the complex rules.',
          'Respect the neighbours.',
          'Do not take house towels to the pool.',
        ]},
      ],
    },
  },

  // Hestía Vera Thalassa
  vt: {
    pdf: 'assets/20220607_HestiaVeraThalassa_GuiaHogar_v3.6.pdf',
    es: {
      rooms: [
        { id: 'salon', title: 'Mi salón', body: 'Mi sofá-cama y mi televisión plana son el sitio perfecto para una sesión de Netflix o HBO. La temperatura la controlas tú con el cuadro del aire acondicionado centralizado.', recs: [
          'No dejes el aire acondicionado encendido con las puertas abiertas o cuando no estés en casa.',
          'Echa un vistazo a las Normas de uso de Hestía, junto a la puerta de entrada.',
          'Amolda a tu gusto el color y tonalidad de la lámpara de pie con el mando junto al cuadro del A/C.',
          'Si necesitas usar la chimenea eléctrica, que sea mientras estés en Hestía.',
        ]},
        { id: 'cocina', title: 'Mi cocina', body: 'Mi cocina tiene todo lo que necesitas para sentirte como en casa: mobiliario de calidad, electrodomésticos de alta gama y un set completo de pequeños electrodomésticos y detalles.', recs: [
          'Los libros de instrucciones de los electrodomésticos se encuentran en los cajones bajo la vitrocerámica.',
          'Evita el ciclo económico en lavadora y lavavajillas. Si bien ahorra agua, la duración es excesiva.',
          'El agua es potable, aunque quizás prefieras agua embotellada.',
        ]},
        { id: 'dormitorios', title: 'Mis dormitorios', body: 'Mi dormitorio principal mira al mar y a las palmeras de la urbanización. Colchones de alta calidad y almohadas de diferentes durezas. Las mejores sábanas y rellenos nórdicos de plumas o sintéticos.', recs: [
          'Las cremas bronceadoras pueden estropear sábanas, toallas y tapicerías.',
          'Cuidado con el aire acondicionado por la noche y las corrientes de aire.',
          'Si tienes la suerte de ver un amanecer despejado desde la terraza, te recordará por qué viniste.',
        ]},
        { id: 'banos', title: 'Mis baños', body: 'Mis dos baños con aromaterapia y duchas hidromasaje. Productos básicos para tus primeros días, secador, botiquín y más.', recs: [
          'Haz un uso prudente y responsable del agua. El agua es vida.',
          'Las toallas del baño no son para la playa ni para la piscina.',
          'Cuidado con las cremas y maquillaje. Estropean los textiles del hogar.',
        ]},
        { id: 'terraza', title: 'Mi terraza', body: 'Mi terraza panorámica de 18 m² mira al mar y al Salar de los Canos. El mejor sitio del ático para vivir el ciclo solar completo.', recs: [
          'Disfruta de la tranquilidad y permite que tus vecinos también la disfruten.',
          'Mientras estés en la terraza apaga o reduce el A/C.',
          'Recoge el toldo y los cojines cuando sople aire, llueva o vayas a salir.',
          'Usa velas para crear el ambiente perfecto al atardecer.',
        ]},
        { id: 'urbanizacion', title: 'Mi urbanización', body: 'Mi urbanización tiene SPA comunitario (sauna y gimnasio), piscina y pistas de pádel. El SPA está abierto en otoño, invierno y primavera; en verano solo el gimnasio. Tu plaza subterránea te espera junto al ascensor.', recs: [
          'El SPA es comunitario y de uso por turnos — pregúntanos por la disponibilidad.',
          'Las pistas de pádel son comunitarias y se reservan en recepción.',
          'Respeta las zonas comunes y las normas de la urbanización.',
          'No utilices en la piscina las toallas de casa.',
        ]},
      ],
    },
    en: {
      rooms: [
        { id: 'salon', title: 'My living room', body: 'My sofa-bed and flat-screen TV are the perfect spot for a Netflix or HBO session. You control the temperature with the centralised A/C panel.', recs: [
          'Do not leave the A/C on with doors open or while you are away from home.',
          'Take a look at Hestía\'s usage guidelines, next to the entrance door.',
          'Adjust colour and tonality of the floor lamp with the remote next to the A/C panel.',
          'Use the electric fireplace only while you are at home.',
        ]},
        { id: 'cocina', title: 'My kitchen', body: 'My kitchen has everything you need to feel at home: quality furniture, premium appliances and a full set of small appliances and details.', recs: [
          'Appliance manuals are in the drawers under the hob.',
          'Avoid the eco cycle on the washer and dishwasher — water-saving but excessively long.',
          'Tap water is drinkable, but you may prefer bottled.',
        ]},
        { id: 'dormitorios', title: 'My bedrooms', body: 'My master bedroom looks out to the sea and the complex palm trees. Quality mattresses and pillows of different firmness. Finest sheets and feather or synthetic duvets.', recs: [
          'Tanning creams can ruin sheets, towels and upholstery.',
          'Watch out for night-time A/C and drafts.',
          'If you catch a clear sunrise from the terrace, it\'ll remind you why you came.',
        ]},
        { id: 'banos', title: 'My bathrooms', body: 'My two bathrooms with aromatherapy and hydromassage showers. Basic products for your first days, hairdryer, first-aid kit and more.', recs: [
          'Use water responsibly. Water is life.',
          'Bathroom towels are not for the beach or the pool.',
          'Be careful with creams and make-up — they damage textiles.',
        ]},
        { id: 'terraza', title: 'My terrace', body: 'My 18 m² panoramic terrace looks out to the sea and the Salar de los Canos. The best spot in the penthouse to live the full solar arc.', recs: [
          'Enjoy the quiet — and let your neighbours enjoy it too.',
          'Turn off or reduce the A/C while you are on the terrace.',
          'Roll up the awning and put away cushions when it\'s windy, raining, or you go out.',
          'Use candles to create the perfect sunset atmosphere.',
        ]},
        { id: 'urbanizacion', title: 'My complex', body: 'My complex has a shared SPA (sauna and gym), pool and padel courts. The SPA opens in autumn, winter and spring; only the gym stays open in summer. Your underground parking space is right by the lift.', recs: [
          'The SPA is shared by slots — ask us for availability.',
          'Padel courts are shared and booked at reception.',
          'Respect the common areas and the complex rules.',
          'Do not take house towels to the pool.',
        ]},
      ],
    },
  },

  // Hestía Vera Salinas
  vs: {
    pdf: 'assets/HestiaVeraSalinas_GuiaHogar_v1.0.pdf',
    es: {
      rooms: [
        { id: 'salon', title: 'Mi salón', body: 'Mi sofá-cama y mi televisión con ambilight son el rincón perfecto para una sesión de Netflix. La temperatura la controlas tú con el cuadro del aire acondicionado centralizado.', recs: [
          'No dejes el aire acondicionado encendido con las puertas abiertas o cuando no estés en Hestía.',
          'Echa un vistazo a las Normas de uso de Hestía, al final de esta misma guía.',
          'Amolda a tu gusto el color y tonalidad de la lámpara de mesa con el mando a la misma.',
        ]},
        { id: 'cocina', title: 'Mi cocina', body: 'Mi cocina tiene todo lo que necesitas para sentirte como en casa: mobiliario de calidad, electrodomésticos de alta gama y un set completo de pequeños electrodomésticos y detalles.', recs: [
          'Los libros de instrucciones de los electrodomésticos se encuentran en los cajones bajo la vitrocerámica.',
          'Si tienes prisa, evita el ciclo económico en lavadora y lavavajillas. Si bien ahorra agua, la duración es excesiva.',
          'El agua es potable, aunque quizás prefieras agua embotellada.',
        ]},
        { id: 'dormitorios', title: 'Mis dormitorios', body: 'Mis dormitorios tienen las mejores sábanas y rellenos nórdicos de plumas. Colchones de alta calidad y almohadas de viscoelástica. En el armario te espera la sombrilla de playa.', recs: [
          'Las cremas bronceadoras pueden estropear sábanas, toallas y tapicerías.',
          'Cuidado con el aire acondicionado por la noche y las corrientes de aire.',
          'Ponte el despertador un día no muy nublado para ver el amanecer.',
        ]},
        { id: 'banos', title: 'Mis baños', body: 'Mis dos baños: uno con bañera, hidromasaje y otro con ducha hidromasaje. Productos básicos para tus primeros días, aromas, velas, secador, botiquín y más.', recs: [
          'Haz un uso prudente y responsable del agua. El agua es vida.',
          'Las toallas del baño no son para la playa ni para la piscina.',
          'Cuidado con las cremas y maquillaje. Estropean los textiles del hogar.',
        ]},
        { id: 'terraza', title: 'Mi terraza', body: 'Mi terraza tiene las mejores vistas y dos ambientes para cada momento de las vacaciones.', recs: [
          'Disfruta de la tranquilidad y permite que tus vecinos también la disfruten.',
          'Mientras estés en la terraza apaga o reduce el A/C.',
          'Recoge el toldo y los cojines cuando sople aire o llueva.',
          'Usa velas para crear el ambiente perfecto.',
        ]},
        { id: 'urbanizacion', title: 'Mi urbanización', body: 'Mi urbanización es textil — para olvidarse del mundo y cerca de todo. Tu plaza subterránea es la nº 290. Tienes entrada y salida controladas por código, acceso/barrera a la zona 2 (donde está Hestía), acceso peatonal desde la urbanización, piscina y pistas deportivas. Hestía Vera Salinas está en bloque 22, planta 1, puerta 7.', recs: [
          'La urbanización merece la pena recorrerla. Los jardines, los riachuelos, las aves, otros pequeños animales, el desierto alrededor. Es un lugar sin igual, para disfrutar con los más pequeños con toda la tranquilidad de un recinto cerrado.',
          'Cuida las plantas y la limpieza de la urbanización.',
          'Respeta las zonas comunes y las normas de la urbanización.',
          'Respeta a los vecinos.',
          'Llama a Conserjería para reservar cualquier espacio común.',
        ]},
      ],
    },
    en: {
      rooms: [
        { id: 'salon', title: 'My living room', body: 'My sofa-bed and ambilight smart TV are the perfect spot for a Netflix session. You control the temperature with the centralised air-conditioning panel.', recs: [
          'Do not leave the air conditioner running with doors open or while you are away from Hestía.',
          'Take a look at Hestía\'s usage guidelines, at the end of this guide.',
          'Adjust colour and tonality of the table lamp with the remote next to it.',
        ]},
        { id: 'cocina', title: 'My kitchen', body: 'My kitchen has everything you need to feel at home: quality furniture, premium appliances and a full set of small appliances and details.', recs: [
          'Appliance manuals are in the drawers under the hob.',
          'In a hurry? Avoid the eco cycle on washer and dishwasher — water-saving but excessively long.',
          'Tap water is drinkable, but you may prefer bottled.',
        ]},
        { id: 'dormitorios', title: 'My bedrooms', body: 'My bedrooms have the finest sheets and feather duvets. Quality mattresses and memory-foam pillows. Your beach umbrella waits in the closet.', recs: [
          'Tanning creams can ruin sheets, towels and upholstery.',
          'Watch out for night-time A/C and drafts.',
          'Set the alarm one clear morning to see the sunrise.',
        ]},
        { id: 'banos', title: 'My bathrooms', body: 'My two bathrooms: one with bathtub and hydromassage, and another with a hydromassage shower. Basic products for your first days, plus scents, candles, hairdryer, first-aid kit and more.', recs: [
          'Use water responsibly. Water is life.',
          'Bathroom towels are not for the beach or the pool.',
          'Be careful with creams and make-up — they damage textiles.',
        ]},
        { id: 'terraza', title: 'My terrace', body: 'My terrace has the best views and two atmospheres for every moment of your holiday.', recs: [
          'Enjoy the quiet — and let your neighbours enjoy it too.',
          'Turn off or reduce the A/C while you are on the terrace.',
          'Roll up the awning and put away cushions when it\'s windy or raining.',
          'Use candles to create the perfect atmosphere.',
        ]},
        { id: 'urbanizacion', title: 'My complex', body: 'My complex is textile-free — to forget the world while staying near everything. Your underground parking space is nº 290. Code-controlled entrance, barrier to zone 2 (where Hestía is), pedestrian access from the complex, swimming pool and sports courts. Hestía Vera Salinas is at block 22, floor 1, unit 7.', recs: [
          'The complex is worth exploring. The gardens, streams, birds, small animals, the surrounding desert — a place without equal, perfect for kids with the calm of a closed area.',
          'Take care of the plants and the cleanliness of the complex.',
          'Respect the common areas and the complex rules.',
          'Respect the neighbours.',
          'Call the concierge to reserve any common space.',
        ]},
      ],
    },
  },
};

// ================================================================
// GuideMap — mapa de Vera Playa (Google Maps embed)
// Antes era un Leaflet con coordenadas hardcoded para cada lugar.
// Reemplazado por iframe genérico de Google + cada lugar abre su
// propio Google Maps al pulsar "Cómo llegar" en la lista de abajo.
// Cero coordenadas que mantener.
// ================================================================
const GuideMap = ({ lang, apt }) => {
  // Si tenemos el apt actual, centramos el embed en las coords concretas
  // de esa Hestía. Si no, generic Vera Playa.
  const home = apt && PLACES.find(p => p.id === `hestia-${apt.slug}`);
  const src = home
    ? `https://maps.google.com/maps?q=${home.lat},${home.lng}&z=15&output=embed`
    : 'https://maps.google.com/maps?q=Vera+Playa+Almer%C3%ADa&z=14&output=embed';
  return (
    <div className="ag-map-block no-print">
      <iframe
        className="ag-map"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={home ? `${home.name} — mapa` : (lang === 'es' ? 'Mapa de Vera Playa' : 'Vera Playa map')}
        allowFullScreen
      />
      <div className="ag-map-note">
        {lang === 'es'
          ? (home
              ? `Mapa centrado en ${home.name}.`
              : 'Mapa general de Vera Playa. Cada recomendación de abajo abre Google Maps con la búsqueda directa.')
          : (home
              ? `Map centred on ${home.name}.`
              : 'Overview of Vera Playa. Each recommendation below opens Google Maps with a direct search.')}
      </div>
    </div>
  );
};

// ================================================================
// CatGroup — una categoría plegable de la sección "Alrededores".
// Click en el head abre/cierra. Animación max-height suave.
// ================================================================
const CatGroup = ({ cat, places, lang }) => {
  const [open, setOpen] = React.useState(false);
  const featured = places
    .filter(p => p.featured)
    .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
  const rest = places.filter(p => !p.featured);
  const renderPlace = (p) => {
    const mapHref = p.url
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' Almería')}`;
    return (
      <li key={p.id} className={`ag-place${p.featured ? ' is-featured' : ''}`}>
        <div className="ag-place-main">
          {p.featured && <span className="ag-place-star" title={lang === 'es' ? 'Imperdible' : 'Must-see'} aria-hidden="true">✦</span>}
          <span className="ag-place-name">{p.name}</span>
          {p.tier && <span className="ag-place-tier">{p.tier}</span>}
          {typeof p.rating === 'number' && (
            <span className="ag-place-rating" title={lang === 'es' ? 'Valoración Google' : 'Google rating'}>
              ⭐ {p.rating.toFixed(1)}
            </span>
          )}
        </div>
        {p.desc && <span className="ag-place-desc">{p.desc}</span>}
        {p.services && (
          <span className="ag-place-services" aria-label={lang === 'es' ? 'Servicios' : 'Services'}>
            {p.services}
          </span>
        )}
        {p.access && (
          <span className="ag-place-access" aria-label={lang === 'es' ? 'Acceso' : 'Access'}>
            {p.access}
          </span>
        )}
        <a className="ag-place-link" href={mapHref} target="_blank" rel="noopener">
          {lang === 'es' ? 'Cómo llegar' : 'Directions'} <span aria-hidden="true">↗</span>
        </a>
      </li>
    );
  };
  return (
    <div className={`ag-cat-group ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="ag-cat-h"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="ag-cat-dot" style={{ background: cat.color }} aria-hidden="true" />
        <span className="ag-cat-label">{cat[lang]}</span>
        <span className="ag-cat-count">{places.length}</span>
        <span className={`ag-cat-chev ${open ? 'open' : ''}`} aria-hidden="true">↓</span>
      </button>
      <div className="ag-cat-body" aria-hidden={!open}>
        {featured.length > 0 && (
          <>
            <div className="ag-cat-sub-h">
              <span className="ag-cat-sub-star" aria-hidden="true">✦</span>
              {lang === 'es' ? 'Imperdibles' : 'Must-see'}
            </div>
            <ul className="ag-places ag-places-featured">
              {featured.map(renderPlace)}
            </ul>
          </>
        )}
        {rest.length > 0 && (
          <>
            {featured.length > 0 && (
              <div className="ag-cat-sub-h ag-cat-sub-h-rest">
                {lang === 'es' ? 'Más recomendaciones' : 'More recommendations'}
              </div>
            )}
            <ul className="ag-places">
              {rest.map(renderPlace)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

// ================================================================
// Top5BeachesBand — cinta destacada con las cinco playas top.
// Cada card lleva al "Cómo llegar" de Google Maps + "Ver fotos"
// (Google Imágenes con la búsqueda) como pequeña vista previa.
// ================================================================
const Top5BeachesBand = ({ places, lang }) => {
  const tops = places
    .filter(p => p.top5)
    .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
  if (!tops.length) return null;
  return (
    <div className="ag-top5">
      <div className="ag-top5-head">
        <span className="eyebrow">{lang === 'es' ? 'Lo que no te puedes perder' : 'Don\'t-miss spots'}</span>
        <h3 className="ag-h3" style={{ margin: 0 }}>
          {lang === 'es' ? 'Top 5 playas de la zona' : 'Top 5 beaches around'}
        </h3>
      </div>
      <ol className="ag-top5-list">
        {tops.map(p => {
          const mapHref = p.url
            || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' Almería')}`;
          const photosHref = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(p.name + ' Almería')}`;
          return (
            <li key={p.id} className="ag-top5-item">
              <span className="ag-top5-num">{String(p.featuredOrder).padStart(2, '0')}</span>
              <a
                className="ag-top5-photo"
                href={photosHref}
                target="_blank" rel="noopener"
                aria-label={lang === 'es' ? `Ver fotos de ${p.name}` : `See photos of ${p.name}`}
                title={lang === 'es' ? 'Abrir en Google Imágenes' : 'Open in Google Images'}
              >
                <span className="ag-top5-photo-icon" aria-hidden="true">📷</span>
                <span className="ag-top5-photo-label">{lang === 'es' ? 'Ver fotos' : 'Photos'}</span>
              </a>
              <div className="ag-top5-text">
                <div className="ag-top5-name-row">
                  <span className="ag-top5-name">{p.name}</span>
                  {typeof p.rating === 'number' && (
                    <span className="ag-top5-rating">⭐ {p.rating.toFixed(1)}</span>
                  )}
                </div>
                {p.desc && <span className="ag-top5-desc">{p.desc}</span>}
                {p.services && (
                  <span className="ag-top5-meta">
                    <em>{lang === 'es' ? 'Servicios:' : 'Services:'}</em> {p.services}
                  </span>
                )}
                {p.access && (
                  <span className="ag-top5-meta">
                    <em>{lang === 'es' ? 'Acceso:' : 'Access:'}</em> {p.access}
                  </span>
                )}
                <div className="ag-top5-links">
                  <a href={mapHref} target="_blank" rel="noopener">
                    {lang === 'es' ? 'Cómo llegar' : 'Directions'} <span aria-hidden="true">↗</span>
                  </a>
                  <a href={photosHref} target="_blank" rel="noopener">
                    {lang === 'es' ? 'Saber más' : 'Read more'} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

// ================================================================
// DAY_PLANS — itinerarios de un día curados por Alex y Fran.
// Tres grupos: madrugadores (amanecer), día completo (mañana+
// comida+tarde) y tarde-noche (cena en sitio bonito). Cada plan
// es una card plegable con timeline + consejo.
// ================================================================
const DAY_PLAN_GROUPS = {
  morning:  { es: 'Madrugadores',   en: 'Early birds',   sub_es: 'Empezar al amanecer y terminar comiendo',     sub_en: 'Start at sunrise, finish over lunch' },
  fullday:  { es: 'Día completo',   en: 'Full-day',      sub_es: 'Mañana, comida y tarde sin prisas',           sub_en: 'Morning, lunch, afternoon — unhurried' },
  evening:  { es: 'Tarde-noche',    en: 'Evening',       sub_es: 'Atardecer, cena y un sitio especial',         sub_en: 'Sunset, dinner and a beautiful night spot' },
};

// audience: 'kids' (con niños), 'adults' (sin niños — cenas tardías,
// senderos largos, carretera de montaña), 'both' (vale para los dos).
const DAY_PLANS = [
  // ── MADRUGADORES ──────────────────────────────────────────────
  {
    id:'plan-flamencos',
    type:'morning', audience:'both',
    title_es:'Amanecer con flamencos + lonja de Garrucha',
    title_en:'Sunrise with flamingos + Garrucha fish market',
    start:'7:00', end:'14:00',
    tags_es:['naturaleza','desayuno','marisco'],
    tags_en:['nature','breakfast','seafood'],
    steps:[
      { t:'7:00',  es:'Sendero a las Salinas de Puerto Rey',         en:'Walk to the Puerto Rey Salt Flats',
                   d_es:'Acceso peatonal directo desde la urbanización Pueblo Salinas. Flamencos al amanecer.', d_en:'Direct walking access from the Pueblo Salinas complex. Flamingos at sunrise.' },
      { t:'8:30',  es:'Desayuno en bar local de Garrucha',           en:'Breakfast at a local Garrucha bar',
                   d_es:'Tostada con tomate en cualquier bar del paseo del puerto.',                            d_en:'Toast with tomato at any bar along the harbour promenade.' },
      { t:'10:00', es:'Lonja del puerto · subasta de pescado',       en:'Fish market · live auction',
                   d_es:'Espectáculo gratis. Llegan los barcos y subastan al instante.',                       d_en:'Free spectacle. Boats arrive, the auction runs immediately.' },
      { t:'12:30', es:'Comida en Tadeo (Villaricos)',                en:'Lunch at Tadeo (Villaricos)',
                   d_es:'Arroz con bogavante. 15 min en coche desde Garrucha.',                                d_en:'Lobster rice. 15 min drive from Garrucha.' },
    ],
    tip_es:'En verano la subasta termina pronto: si vas a las 10:00 ya casi no queda. Mejor llegar a las 9:30.',
    tip_en:'In summer the auction wraps up early. Aim to arrive by 9:30.',
  },
  {
    id:'plan-monsul-amanecer',
    type:'morning', audience:'adults',
    title_es:'Amanecer en Mónsul + Mojácar pueblo',
    title_en:'Sunrise at Mónsul + Mojácar village',
    start:'6:30', end:'14:30',
    tags_es:['amanecer','playa virgen','pueblo blanco'],
    tags_en:['sunrise','virgin beach','white village'],
    steps:[
      { t:'6:30',  es:'Salida hacia San José',                       en:'Drive to San José',
                   d_es:'1 h por la N-340. La barrera de la pista a Mónsul abre temprano.',                    d_en:'1 h on the N-340. The Mónsul track gate opens early.' },
      { t:'7:30',  es:'Mónsul al amanecer',                          en:'Mónsul at sunrise',
                   d_es:'Sin nadie. Foto desde la duna. Después, un baño rápido si te atreves.',               d_en:'Empty. Shoot from the dune. Then a quick swim if you dare.' },
      { t:'10:30', es:'Desayuno en San José',                        en:'Breakfast in San José',
                   d_es:'Cualquier cafetería del puerto. Zumo de naranja recién hecho.',                       d_en:'Any harbour café. Fresh orange juice.' },
      { t:'12:00', es:'Subir a Mojácar pueblo',                      en:'Up to Mojácar village',
                   d_es:'Callejuelas blancas, mirador de la Plaza Nueva, vistas a la Sierra Cabrera.',          d_en:'Whitewashed streets, mirador at Plaza Nueva, Sierra Cabrera views.' },
      { t:'14:00', es:'Comida en Cabo Norte',                        en:'Lunch at Cabo Norte',
                   d_es:'Buena materia prima a precio sensato. Reserva.',                                       d_en:'Quality produce at fair prices. Book ahead.' },
    ],
    tip_es:'En julio-agosto la barrera al sur cierra el paso de coches a partir de las 9:00. Vete antes.',
    tip_en:'In July-August the southern barrier closes to cars after 9 am. Leave earlier.',
  },
  {
    id:'plan-sendero-litoral',
    type:'morning', audience:'both',
    title_es:'Sendero del litoral + desayuno con vistas',
    title_en:'Coastal walk + breakfast with a view',
    start:'7:00', end:'14:00',
    tags_es:['caminar','playa','chiringuito'],
    tags_en:['walking','beach','beach bar'],
    steps:[
      { t:'7:00',  es:'Caminata por la playa de Vera al amanecer',   en:'Walk along Vera beach at dawn',
                   d_es:'Desde Hestía hacia el sur, hasta el Almanzora. Arena fina y agua templada.',           d_en:'From Hestía southward to the Almanzora. Fine sand, warm water.' },
      { t:'8:30',  es:'Desayuno en Chiringuito Playa Turquesa',      en:'Breakfast at Chiringuito Playa Turquesa',
                   d_es:'A pie. Tostada, café, pies en la arena.',                                              d_en:'On foot. Toast, coffee, toes in the sand.' },
      { t:'10:00', es:'Paseo del puerto de Garrucha',                en:'Garrucha harbour promenade',
                   d_es:'Lonja, barcas, terrazas con sombra.',                                                  d_en:'Market, fishing boats, shaded terraces.' },
      { t:'13:30', es:'Comida en Lúa (Vera Playa)',                  en:'Lunch at Lúa (Vera Playa)',
                   d_es:'Sofisticado y a pie de Hestía. Buena bodega.',                                         d_en:'Sophisticated and walkable from Hestía. Good wine list.' },
    ],
    tip_es:'Si es jueves, parada extra a las 11:00 en el mercadillo de Vera pueblo.',
    tip_en:'If it is Thursday, add an 11:00 stop at the Vera village street market.',
  },

  // ── DÍA COMPLETO ──────────────────────────────────────────────
  {
    id:'plan-cabo-gata',
    type:'fullday', audience:'both',
    title_es:'Cabo de Gata esencial',
    title_en:'Cabo de Gata essentials',
    start:'9:30', end:'19:30',
    tags_es:['parque natural','faro','playa virgen'],
    tags_en:['natural park','lighthouse','virgin beach'],
    steps:[
      { t:'9:30',  es:'Salida hacia el Faro de Cabo de Gata',        en:'Drive to the Cabo de Gata lighthouse',
                   d_es:'1 h 15 min. Carretera espectacular junto al mar.',                                    d_en:'1 h 15 min. Stunning seaside road.' },
      { t:'10:45', es:'Faro y Arrecife de las Sirenas',              en:'Lighthouse and Sirenas Reef',
                   d_es:'Mirador con dos columnas volcánicas saliendo del mar.',                                d_en:'Viewpoint with two volcanic columns rising from the sea.' },
      { t:'11:45', es:'Salinas de Cabo de Gata',                     en:'Cabo de Gata Salt Flats',
                   d_es:'Otra colonia de flamencos. Foto desde el observatorio.',                               d_en:'Another flamingo colony. Shot from the observation deck.' },
      { t:'13:30', es:'Comida en San José',                          en:'Lunch in San José',
                   d_es:'La Gallineta o La Ola — junto al mar.',                                                d_en:'La Gallineta or La Ola — right by the sea.' },
      { t:'15:30', es:'Playa de Genoveses o Mónsul',                 en:'Genoveses or Mónsul beach',
                   d_es:'En verano, bus desde San José. En invierno entras con coche.',                         d_en:'Summer: bus from San José. Winter: drive in.' },
      { t:'18:30', es:'Café en San José antes de volver',            en:'Coffee in San José before heading back',
                   d_es:'Terraza del puerto, atardecer suave.',                                                 d_en:'Harbour terrace, gentle sunset.' },
    ],
    tip_es:'Lleva agua y crema solar. La sombra escasea en todo el parque.',
    tip_en:'Bring water and sunscreen. Shade is scarce throughout the park.',
  },
  {
    id:'plan-carboneras-aguamarga',
    type:'fullday', audience:'both',
    title_es:'Carboneras → Mesa Roldán → Agua Amarga',
    title_en:'Carboneras → Mesa Roldán → Agua Amarga',
    start:'9:30', end:'20:00',
    tags_es:['costa salvaje','sendero','pueblo blanco'],
    tags_en:['wild coast','hiking','white village'],
    steps:[
      { t:'9:30',  es:'Salida por la costa hacia Carboneras',        en:'Coastal drive to Carboneras',
                   d_es:'Pasando por Mojácar y Macenas.',                                                       d_en:'Through Mojácar and Macenas.' },
      { t:'11:00', es:'Mesa Roldán: faro y fortaleza',               en:'Mesa Roldán: lighthouse and fortress',
                   d_es:'Mirador 360º. Aquí rodaron Juego de Tronos.',                                          d_en:'360° viewpoint. Filmed for Game of Thrones.' },
      { t:'12:30', es:'Bajada a la Playa de los Muertos',            en:'Down to Playa de los Muertos',
                   d_es:'15 min de sendero pedregoso. Una de las mejores playas de España.',                    d_en:'15 min rocky path. One of Spain\'s best beaches.' },
      { t:'14:30', es:'Comida en Carboneras',                        en:'Lunch in Carboneras',
                   d_es:'Cualquier marisquería del puerto.',                                                    d_en:'Any seafood spot at the harbour.' },
      { t:'16:30', es:'Coche hasta Agua Amarga',                     en:'Drive to Agua Amarga',
                   d_es:'15 min. El pueblo blanco más cuidado de la zona.',                                     d_en:'15 min. The most polished white village around.' },
      { t:'18:00', es:'Aperitivo en Agua Amarga',                    en:'Aperitif in Agua Amarga',
                   d_es:'Terraza con vistas al mar.',                                                           d_en:'Sea-view terrace.' },
    ],
    tip_es:'El sendero a Los Muertos tiene rampa fuerte. Calzado cerrado y agua.',
    tip_en:'The Los Muertos path is steep and rocky. Closed shoes and water.',
  },
  {
    id:'plan-vera-sorbas-tabernas',
    type:'fullday', audience:'both',
    title_es:'Vera pueblo + cuevas de Sorbas + western de Tabernas',
    title_en:'Vera village + Sorbas caves + Tabernas western',
    start:'9:00', end:'19:30',
    tags_es:['cultura','aventura','interior'],
    tags_en:['culture','adventure','inland'],
    steps:[
      { t:'9:00',  es:'Vera pueblo',                                 en:'Vera town',
                   d_es:'Si es jueves, mercadillo. Iglesia de la Encarnación, plaza mayor.',                    d_en:'If Thursday, the street market. Encarnación church, main square.' },
      { t:'11:00', es:'Cuevas de Sorbas',                            en:'Sorbas caves',
                   d_es:'Karst de yeso único en Europa. Visita guiada de 2 h con casco y linterna.',           d_en:'Unique gypsum karst in Europe. 2 h guided visit with helmet and torch.' },
      { t:'13:30', es:'Comida en Sorbas',                            en:'Lunch in Sorbas',
                   d_es:'Cualquier mesón del pueblo. Cocina serrana.',                                          d_en:'Any village inn. Mountain home cooking.' },
      { t:'15:30', es:'Desierto de Tabernas',                        en:'Tabernas Desert',
                   d_es:'Fort Bravo o Mini Hollywood — único desierto auténtico de Europa.',                    d_en:'Fort Bravo or Mini Hollywood — Europe\'s only true desert.' },
      { t:'18:00', es:'Vuelta con parada en bar de carretera',       en:'Return with a roadside-bar stop',
                   d_es:'Caña, tapa, atardecer entre olivos.',                                                  d_en:'Beer, tapa, sunset among olive groves.' },
    ],
    tip_es:'Reserva las cuevas con antelación — los grupos son pequeños.',
    tip_en:'Book the caves in advance — groups are small.',
  },

  // ── TARDE-NOCHE ───────────────────────────────────────────────
  {
    id:'plan-monsul-cena',
    type:'evening', audience:'adults',
    title_es:'Atardecer en Mónsul + cena en San José',
    title_en:'Sunset at Mónsul + dinner in San José',
    start:'17:00', end:'23:00',
    tags_es:['atardecer','playa','cena con vistas'],
    tags_en:['sunset','beach','dinner with a view'],
    steps:[
      { t:'17:00', es:'Salida hacia San José',                       en:'Drive to San José',
                   d_es:'1 h. En verano deja el coche en la entrada y coge el bus.',                            d_en:'1 h. In summer leave the car at the entrance and take the bus.' },
      { t:'18:30', es:'Atardecer en Mónsul',                         en:'Sunset at Mónsul',
                   d_es:'Sube a la duna y sentirás Indiana Jones.',                                             d_en:'Climb the dune — pure Indiana Jones.' },
      { t:'20:30', es:'Paseo por San José',                          en:'Stroll through San José',
                   d_es:'Puerto, calles peatonales, terrazas.',                                                 d_en:'Harbour, pedestrian streets, terraces.' },
      { t:'21:30', es:'Cena en La Ola junto al mar',                 en:'Dinner at La Ola by the sea',
                   d_es:'Mesa al borde del agua. Reserva.',                                                     d_en:'Table at the water\'s edge. Book.' },
      { t:'23:00', es:'Copa en alguna terraza del puerto',           en:'A drink at a harbour terrace',
                   d_es:'San José se vacía pronto, así que vuelve relajado.',                                   d_en:'San José empties early — drive back relaxed.' },
    ],
    tip_es:'Lleva chaqueta — en cuanto cae el sol refresca, incluso en agosto.',
    tip_en:'Bring a jacket — once the sun sets it cools down even in August.',
  },
  {
    id:'plan-mojacar-noche',
    type:'evening', audience:'adults',
    title_es:'Mojácar pueblo al anochecer',
    title_en:'Mojácar village at nightfall',
    start:'17:30', end:'23:30',
    tags_es:['pueblo blanco','mirador','copa'],
    tags_en:['white village','viewpoint','drinks'],
    steps:[
      { t:'17:30', es:'Subir a Mojácar pueblo',                      en:'Drive up to Mojácar',
                   d_es:'25 min. Aparca abajo y sube andando.',                                                 d_en:'25 min. Park below and walk up.' },
      { t:'18:30', es:'Mirador del Castillo · vistas 360°',          en:'Castle viewpoint · 360° views',
                   d_es:'Mediterráneo, Sierra Cabrera, salar de la Algaida.',                                   d_en:'Mediterranean, Sierra Cabrera, Algaida salt-marsh.' },
      { t:'19:30', es:'Paseo por la Plaza Nueva',                    en:'Stroll along Plaza Nueva',
                   d_es:'Atardecer en cafés con jazmín.',                                                       d_en:'Sunset at cafés scented with jasmine.' },
      { t:'21:00', es:'Cena en Cabo Norte',                          en:'Dinner at Cabo Norte',
                   d_es:'Buena materia prima, ambiente tranquilo.',                                             d_en:'Quality produce, calm atmosphere.' },
      { t:'23:00', es:'Copa con el pueblo iluminado',                en:'A drink with the village lit up',
                   d_es:'Cualquier terraza alta — Mojácar de noche es magia.',                                  d_en:'Any rooftop terrace — Mojácar lit up is magic.' },
    ],
    tip_es:'Las cuestas son empinadas. Calzado cómodo si os gusta callejear.',
    tip_en:'The streets are steep. Comfy shoes if you like to wander.',
  },
  {
    id:'plan-riad-cabrera',
    type:'evening', audience:'adults',
    title_es:'Cena en Riad Cabrera (Sierra Cabrera)',
    title_en:'Dinner at Riad Cabrera (Sierra Cabrera)',
    start:'18:00', end:'23:30',
    tags_es:['montaña','marroquí','cena especial'],
    tags_en:['mountain','Moroccan','special dinner'],
    steps:[
      { t:'18:00', es:'Salida hacia la Sierra Cabrera',              en:'Drive to Sierra Cabrera',
                   d_es:'45 min de carretera de montaña — atardecer entre olivos.',                             d_en:'45 min of mountain road — sunset through olive groves.' },
      { t:'19:30', es:'Mirador de la Sierra',                        en:'Sierra viewpoint',
                   d_es:'Pintamos el valle con la luz dorada del final del día.',                               d_en:'The valley painted in late-day gold.' },
      { t:'21:00', es:'Cena en Riad Cabrera',                        en:'Dinner at Riad Cabrera',
                   d_es:'Tagines, té de menta, decoración marroquí auténtica. Reserva sí o sí.',                d_en:'Tagines, mint tea, authentic Moroccan decor. Reserve in advance.' },
      { t:'23:00', es:'Vuelta tranquila a Hestía',                   en:'Calm drive back to Hestía',
                   d_es:'Lleva mantita — la sierra refresca por la noche.',                                     d_en:'Bring a light blanket — the sierra cools at night.' },
    ],
    tip_es:'Carretera de montaña sinuosa. Si os marea, tomad el bíodramina antes.',
    tip_en:'Winding mountain road. If you get carsick, take meds beforehand.',
  },
  {
    id:'plan-cala-enmedio-tarde',
    type:'evening', audience:'adults',
    title_es:'Cala de Enmedio + Agua Amarga al anochecer',
    title_en:'Cala de Enmedio + Agua Amarga at dusk',
    start:'16:00', end:'23:00',
    tags_es:['cala virgen','baño','cena pueblo'],
    tags_en:['virgin cove','swim','village dinner'],
    steps:[
      { t:'16:00', es:'Salida hacia Agua Amarga',                    en:'Drive to Agua Amarga',
                   d_es:'1 h por la costa.',                                                                    d_en:'1 h along the coast.' },
      { t:'17:00', es:'Sendero a la Cala de Enmedio',                en:'Path to Cala de Enmedio',
                   d_es:'30 min campo a través. Casi vacía a partir de las 17:00.',                             d_en:'30 min cross-country. Nearly empty after 5 pm.' },
      { t:'17:30', es:'Baño y atardecer en la cala',                 en:'Swim and sunset in the cove',
                   d_es:'Arena blanca, roca esculpida, agua cristalina.',                                       d_en:'White sand, sculpted rock, crystalline water.' },
      { t:'19:30', es:'Vuelta caminando a Agua Amarga',              en:'Walk back to Agua Amarga',
                   d_es:'Calzado cerrado para la pista de tierra.',                                             d_en:'Closed shoes for the dirt path.' },
      { t:'21:00', es:'Cena en Agua Amarga frente al mar',           en:'Dinner in Agua Amarga by the sea',
                   d_es:'Cualquier restaurante del paseo. Ambiente boho.',                                      d_en:'Any seafront restaurant. Boho atmosphere.' },
    ],
    tip_es:'Llévate una toalla extra y agua — la cala no tiene servicios.',
    tip_en:'Bring an extra towel and water — the cove has no services.',
  },

  // ── PLANES CON NIÑOS ─────────────────────────────────────────
  {
    id:'plan-flamencos-niños',
    type:'morning', audience:'kids',
    title_es:'Flamencos en las Salinas + barco en Garrucha',
    title_en:'Flamingos at the Salt Flats + Garrucha boat',
    start:'9:00', end:'14:30',
    tags_es:['niños','animales','barco'],
    tags_en:['kids','animals','boat'],
    steps:[
      { t:'9:00',  es:'Sendero a las Salinas de Puerto Rey',         en:'Walk to Puerto Rey Salt Flats',
                   d_es:'Acceso peatonal directo desde la urbanización Pueblo Salinas. Llevad binoculares — los flamencos están a 50-100 m.', d_en:'Direct walking access from the Pueblo Salinas complex. Bring binoculars — flamingos are 50-100 m away.' },
      { t:'10:30', es:'Desayuno en Garrucha',                        en:'Breakfast in Garrucha',
                   d_es:'Cruasán y zumo en cualquier bar del paseo. Cerca del puerto.',                            d_en:'Croissant and juice at any promenade bar near the harbour.' },
      { t:'11:30', es:'Excursión en barco desde el puerto',          en:'Boat trip from the harbour',
                   d_es:'Mar Azul y otras compañías ofrecen vueltas de 1 h costeras. Reserva el día antes.',       d_en:'Mar Azul and others offer 1 h coastal tours. Book the day before.' },
      { t:'13:00', es:'Comida en Pizzería Pomodoro',                 en:'Lunch at Pizzería Pomodoro',
                   d_es:'A pie de playa, ambiente familiar, niños pueden moverse.',                                d_en:'Right on the beach, family-friendly, kids can roam.' },
    ],
    tip_es:'En invierno los barcos no salen. Llamad antes para confirmar — Mar Azul +34 950 13 24 11.',
    tip_en:'No boats in winter — call to confirm: Mar Azul +34 950 13 24 11.',
  },
  {
    id:'plan-mini-hollywood',
    type:'fullday', audience:'kids',
    title_es:'Mini Hollywood (Oasys, Parque del Oeste)',
    title_en:'Mini Hollywood (Oasys Western Park)',
    start:'10:00', end:'19:00',
    tags_es:['niños','western','animales','desierto'],
    tags_en:['kids','western','animals','desert'],
    steps:[
      { t:'10:00', es:'Salida hacia el Desierto de Tabernas',        en:'Drive to the Tabernas Desert',
                   d_es:'45 min en coche por la A-7 hacia Almería.',                                               d_en:'45 min on the A-7 towards Almería.' },
      { t:'11:30', es:'Show del Oeste · gunfighters',                en:'Wild West gunfight show',
                   d_es:'En la calle principal del poblado. Los niños alucinan con los disparos y los caballos.',  d_en:'On the main street. Kids love the gunfire and horses.' },
      { t:'13:00', es:'Comida en el saloon',                         en:'Lunch at the saloon',
                   d_es:'Hamburguesas, alitas, burrito mexicano. Apto para niños.',                                d_en:'Burgers, wings, Mexican burrito. Kid-approved.' },
      { t:'14:30', es:'Reserva zoológica del desierto',              en:'Desert zoo reserve',
                   d_es:'Lobos, rapaces, pumas, dromedarios. Educativo y bien cuidado.',                           d_en:'Wolves, raptors, pumas, camels. Educational and well kept.' },
      { t:'16:00', es:'Show de can-can en el saloon',                en:'Can-can show at the saloon',
                   d_es:'Tradicional. Apto para todos los públicos.',                                              d_en:'Classic. Family-friendly.' },
      { t:'17:30', es:'Piscinas del parque (verano)',                en:'Park pools (summer)',
                   d_es:'En temporada de calor. Llevad bañador y toalla.',                                         d_en:'Hot season only. Bring swimwear and towels.' },
    ],
    tip_es:'Compra entrada online — ahorras 2-3 € y evitas la cola en taquilla.',
    tip_en:'Buy tickets online — saves €2-3 and skips the queue.',
  },
  {
    id:'plan-geoda-pulpi',
    type:'fullday', audience:'kids',
    title_es:'Geoda gigante de Pulpí + Playa de los Cocedores',
    title_en:'Pulpí giant geode + Cocedores beach',
    start:'10:00', end:'19:00',
    tags_es:['niños','minería','aventura','playa'],
    tags_en:['kids','mining','adventure','beach'],
    steps:[
      { t:'10:00', es:'Salida hacia Pulpí',                          en:'Drive to Pulpí',
                   d_es:'45 min. Reserva online imprescindible — grupos pequeños.',                                d_en:'45 min. Online booking required — small groups only.' },
      { t:'11:00', es:'Visita guiada a la Geoda Gigante',            en:'Guided tour of the Giant Geode',
                   d_es:'8 m de cristales — la segunda más grande del mundo. Casco, linterna y arnés incluidos.',  d_en:'8 m of crystals — second largest in the world. Helmet, torch and harness included.' },
      { t:'13:00', es:'Comida en San Juan de los Terreros',          en:'Lunch in San Juan de los Terreros',
                   d_es:'Pueblo costero pequeño con varios restaurantes a pie de mar.',                            d_en:'Small coastal town with several seafront restaurants.' },
      { t:'15:30', es:'Playa de los Cocedores',                      en:'Cocedores beach',
                   d_es:'Cuevas excavadas en la arenisca, perfectas para que los niños exploren. Aguas turquesas.', d_en:'Sandstone caves perfect for kids to explore. Turquoise water.' },
      { t:'18:00', es:'Helado en San Juan o Pulpí pueblo',           en:'Ice cream in San Juan or Pulpí',
                   d_es:'Última parada antes de volver.',                                                          d_en:'Last stop before heading back.' },
    ],
    tip_es:'Reserva la Geoda con 1-2 semanas de antelación. Edad mínima 6 años.',
    tip_en:'Book the geode 1-2 weeks ahead. Minimum age 6.',
  },
  {
    id:'plan-aqua-vera',
    type:'fullday', audience:'kids',
    title_es:'Aqua Vera (parque acuático) + cena en chiringuito',
    title_en:'Aqua Vera waterpark + beach-bar dinner',
    start:'11:00', end:'21:30',
    tags_es:['niños','toboganes','playa','verano'],
    tags_en:['kids','slides','beach','summer'],
    steps:[
      { t:'11:00', es:'Apertura de Aqua Vera',                       en:'Aqua Vera opens',
                   d_es:'Solo abre en temporada (junio-septiembre). 10 min en coche desde Hestía.',                d_en:'Open only in summer (June-September). 10 min drive from Hestía.' },
      { t:'14:00', es:'Comida dentro del parque',                    en:'Lunch inside the park',
                   d_es:'O salís y volvéis con sello en la mano. Hay menú infantil.',                              d_en:'Or step out and come back with a hand stamp. Kids menu available.' },
      { t:'15:00', es:'Toboganes y río salvaje',                     en:'Slides and lazy river',
                   d_es:'Hay zona infantil con altura mínima muy baja y zona para mayores.',                       d_en:'Kids area with low height limits and a bigger-kids area.' },
      { t:'18:30', es:'Salida del parque · ducha en Hestía',         en:'Leave the park · shower at Hestía',
                   d_es:'Volved relajados, secad, descansad un rato.',                                              d_en:'Drive back relaxed, dry off, rest a while.' },
      { t:'20:30', es:'Cena en Chiringuito Playa Turquesa',          en:'Dinner at Chiringuito Playa Turquesa',
                   d_es:'Pizza/pasta a pie de arena. Andando desde Hestía. Niños pueden seguir jugando en la playa.', d_en:'Pizza/pasta on the sand. Walkable from Hestía. Kids can play on the beach.' },
    ],
    tip_es:'Aqua Vera no abre fuera de temporada. Llamad antes para confirmar fechas si vais en mayo o septiembre.',
    tip_en:'Aqua Vera is closed out of season. Call to confirm dates in May or September.',
  },
  {
    id:'plan-mojacar-niños',
    type:'evening', audience:'kids',
    title_es:'Mojácar pueblo + heladería + cena pizzería',
    title_en:'Mojácar village + ice cream + pizza dinner',
    start:'17:30', end:'22:30',
    tags_es:['niños','pueblo blanco','helado','pizza'],
    tags_en:['kids','white village','ice cream','pizza'],
    steps:[
      { t:'17:30', es:'Subir a Mojácar pueblo',                      en:'Drive up to Mojácar',
                   d_es:'25 min. Aparcad abajo en el parking público y subid andando — más fresco al atardecer.',  d_en:'25 min. Park below in the public lot and walk up — cooler at sunset.' },
      { t:'18:30', es:'Mirador del Castillo',                        en:'Castle viewpoint',
                   d_es:'Cuesta arriba con escalones — niños mayores de 4 años lo disfrutan. Vistas al mar.',      d_en:'Uphill with steps — kids 4+ enjoy it. Sea views.' },
      { t:'19:30', es:'Helado en la Plaza Nueva',                    en:'Ice cream on Plaza Nueva',
                   d_es:'Sentaos en la plaza con vistas al Mediterráneo. Heladería artesanal.',                    d_en:'Sit on the square with sea views. Artisan ice cream.' },
      { t:'20:30', es:'Cena en pizzería del pueblo',                 en:'Dinner at a village pizzeria',
                   d_es:'Cabo Norte tiene menú infantil; otros sitios también. Reservad si es viernes/sábado.',     d_en:'Cabo Norte has a kids menu; others too. Book Fri/Sat.' },
      { t:'22:00', es:'Bajada al coche',                             en:'Walk back down',
                   d_es:'Mojácar de noche es magia con farolillos.',                                                d_en:'Mojácar at night is magic with the lanterns.' },
    ],
    tip_es:'El carrito de bebé no es la mejor opción — calzado bueno para los peques en las cuestas empedradas.',
    tip_en:'Strollers are awkward — solid shoes for the kids on the cobbled streets.',
  },

  // ── PLANES EXTRA (rutas, trekking, escapadas) ────────────────
  {
    id:'plan-carretera-cabo',
    type:'fullday', audience:'both',
    title_es:'Carretera del Cabo: calas escondidas en coche',
    title_en:'Cabo coastal road: hidden coves by car',
    start:'9:30', end:'19:30',
    tags_es:['ruta en coche','calas vírgenes','snorkel'],
    tags_en:['road trip','virgin coves','snorkel'],
    steps:[
      { t:'9:30',  es:'Salida hacia Carboneras por la costa',         en:'Drive south along the coast to Carboneras',
                   d_es:'AL-5106. Carretera con curvas y miradores espectaculares.',                              d_en:'AL-5106. Winding road with stunning viewpoints.' },
      { t:'10:30', es:'Mirador de Mesa Roldán y bajada a Los Muertos', en:'Mesa Roldán viewpoint and descent to Los Muertos',
                   d_es:'Aparcas arriba y bajas a la playa por sendero.',                                          d_en:'Park at the top and walk down the trail.' },
      { t:'12:30', es:'Cala del Plomo (Agua Amarga)',                en:'Cala del Plomo (Agua Amarga)',
                   d_es:'Pista de tierra · 30 min andando · casi siempre vacía.',                                  d_en:'Dirt road · 30 min walk · almost always empty.' },
      { t:'14:30', es:'Comida en Las Negras o Agua Amarga',          en:'Lunch in Las Negras or Agua Amarga',
                   d_es:'Las Negras tiene ambiente bohemio; Agua Amarga más cuidado.',                             d_en:'Las Negras has bohemian vibe; Agua Amarga is more polished.' },
      { t:'16:30', es:'Playazo de Rodalquilar',                       en:'Playazo de Rodalquilar',
                   d_es:'Aparcamiento al pie de la playa. Castillo de San Ramón al sur.',                          d_en:'Park right by the beach. San Ramón castle to the south.' },
      { t:'18:00', es:'La Isleta del Moro: snorkel y aperitivo',     en:'La Isleta del Moro: snorkel and aperitif',
                   d_es:'Pueblo pesquero diminuto. Snorkel en el Peñón Blanco. Cerveza al sol.',                  d_en:'Tiny fishing village. Snorkel at Peñón Blanco. Beer in the sun.' },
    ],
    tip_es:'Lleva neumáticos en buen estado: hay tramos de pista que pinchan. Y agua, mucha agua.',
    tip_en:'Make sure your tyres are sound — some dirt tracks bite. Bring lots of water.',
  },
  {
    id:'plan-trek-san-pedro',
    type:'fullday', audience:'adults',
    title_es:'Trekking del litoral · Las Negras → Cala de San Pedro',
    title_en:'Coastal trek · Las Negras → Cala de San Pedro',
    start:'8:30', end:'19:00',
    tags_es:['trekking','sendero costero','cala virgen'],
    tags_en:['hiking','coastal path','virgin cove'],
    steps:[
      { t:'8:30',  es:'Salida hacia Las Negras',                     en:'Drive to Las Negras',
                   d_es:'1 h en coche. Aparcad en el pueblo, junto a la playa.',                                   d_en:'1 h drive. Park in the village, next to the beach.' },
      { t:'10:00', es:'Inicio del sendero costero (PR-A 357)',       en:'Start of the coastal trail (PR-A 357)',
                   d_es:'Sale del extremo norte del pueblo. 90 min andando con desnivel moderado.',                d_en:'Starts at the north end of the village. 90 min walk with moderate elevation.' },
      { t:'11:30', es:'Llegada a la Cala de San Pedro',              en:'Arrival at Cala de San Pedro',
                   d_es:'Cala virgen con fuente natural. Comunidad estable, sin servicios. Agua limpia.',          d_en:'Virgin cove with natural spring. Long-time community, no services. Clean water.' },
      { t:'12:00', es:'Baño y bocadillo en la cala',                 en:'Swim and packed lunch in the cove',
                   d_es:'Llevad la comida — no hay nada que comprar. Sombra escasa.',                              d_en:'Bring food — nothing to buy. Little shade.' },
      { t:'15:00', es:'Vuelta caminando · 90 min',                   en:'Walk back · 90 min',
                   d_es:'O vuelta en taxi-barca por unos 10 € por persona si están operando.',                     d_en:'Or boat-taxi back for ~€10 per person if operating.' },
      { t:'17:30', es:'Cerveza en Las Negras',                       en:'Beer in Las Negras',
                   d_es:'Premio en alguna terraza con vistas al pedregal.',                                        d_en:'Reward yourselves on a pebble-beach terrace.' },
    ],
    tip_es:'Calzado de trekking obligatorio. 3 L de agua por persona. Crema solar y gorra. Sombrita en la cala — la sombra escasea.',
    tip_en:'Trekking shoes required. 3 L water per person. Sunscreen and hat. Take a beach umbrella — shade is scarce.',
  },
  {
    id:'plan-murcia-gastro',
    type:'fullday', audience:'both',
    title_es:'Murcia capital y su gastronomía',
    title_en:'Murcia city and its gastronomy',
    start:'9:00', end:'20:00',
    tags_es:['ciudad','tapas','cultura'],
    tags_en:['city','tapas','culture'],
    steps:[
      { t:'9:00',  es:'Salida hacia Murcia',                         en:'Drive to Murcia',
                   d_es:'1 h 30 min por la A-7. Aparcamiento subterráneo en el centro (Plaza Circular).',          d_en:'1 h 30 min on the A-7. Underground parking downtown (Plaza Circular).' },
      { t:'11:00', es:'Catedral de Santa María',                     en:'Cathedral of Santa María',
                   d_es:'Fachada barroca, torre con vistas. Entrada combinada al museo.',                          d_en:'Baroque façade, bell tower with views. Combined ticket includes the museum.' },
      { t:'12:30', es:'Plaza de las Flores · tapeo',                 en:'Plaza de las Flores · tapas',
                   d_es:'Pasteles de carne, marineras, michirones, zarangollo. Un poco en cada terraza.',           d_en:'Meat pasties, marineras (anchovy on potato salad), michirones, zarangollo. A bite at each terrace.' },
      { t:'14:30', es:'Comida en El Rincón de Pepe o Salzillo',      en:'Lunch at El Rincón de Pepe or Salzillo',
                   d_es:'Cocina murciana tradicional. Caldero, arroz a banda, mero al horno.',                     d_en:'Traditional Murcian cuisine. Caldero, arroz a banda, baked grouper.' },
      { t:'16:30', es:'Real Casino de Murcia',                       en:'Real Casino de Murcia',
                   d_es:'Edificio único del siglo XIX. Patio árabe, biblioteca inglesa, salón pompeyano.',         d_en:'Unique 19th-century building. Arab patio, English library, Pompeian hall.' },
      { t:'17:30', es:'Paseo por Trapería y Platería',               en:'Stroll along Trapería and Platería',
                   d_es:'Calles peatonales con tiendas históricas y heladerías.',                                  d_en:'Pedestrian streets with historic shops and gelaterias.' },
    ],
    tip_es:'Si vais en jueves, parad a la vuelta en el mercadillo de Vera para comprar producto de Murcia: pimentón, paparajotes, vino del Bullas.',
    tip_en:'If on Thursday, stop at Vera market on the way back for Murcian produce: paprika, paparajotes, Bullas wine.',
  },
  {
    id:'plan-nijar-ceramica',
    type:'fullday', audience:'both',
    title_es:'San José + Níjar y sus alfareros',
    title_en:'San José + Níjar pottery workshops',
    start:'10:00', end:'20:00',
    tags_es:['cultura','artesanía','pueblo blanco'],
    tags_en:['culture','crafts','white village'],
    steps:[
      { t:'10:00', es:'Salida hacia San José',                       en:'Drive to San José',
                   d_es:'1 h. Aparcamiento gratuito a la entrada del pueblo.',                                     d_en:'1 h drive. Free parking at the village entrance.' },
      { t:'11:30', es:'Paseo por el puerto y la playa de San José',  en:'Walk the harbour and San José beach',
                   d_es:'Mañana tranquila. Cafés con vista al Mediterráneo.',                                      d_en:'Quiet morning. Cafés with Mediterranean views.' },
      { t:'13:30', es:'Comida en La Gallineta',                      en:'Lunch at La Gallineta',
                   d_es:'Junto al mar, productos del Cabo de Gata. Reserva.',                                      d_en:'Seaside, Cabo de Gata produce. Book ahead.' },
      { t:'15:30', es:'Subir a Níjar pueblo',                         en:'Drive up to Níjar village',
                   d_es:'30 min. Pueblo blanco colgado en la sierra Alhamilla.',                                    d_en:'30 min. White village clinging to the Alhamilla mountains.' },
      { t:'16:30', es:'Talleres de cerámica en la calle Real',       en:'Pottery workshops on Calle Real',
                   d_es:'Cerámica Tito · Cerámica Cosano · El Oficio. Cada uno con estilo propio. Compra una pieza.', d_en:'Cerámica Tito · Cerámica Cosano · El Oficio. Each with its own style. Buy a piece.' },
      { t:'18:00', es:'Mirador de la Atalaya',                       en:'Atalaya viewpoint',
                   d_es:'Vistas al Cabo de Gata y al desierto. Muy bueno al atardecer.',                            d_en:'Views over Cabo de Gata and the desert. Best at sunset.' },
      { t:'19:00', es:'Café o tapa en la Plaza de la Glorieta',      en:'Coffee or tapa at Plaza de la Glorieta',
                   d_es:'Antes de bajar a la N-340.',                                                              d_en:'Before heading back down to the N-340.' },
    ],
    tip_es:'Cada taller cierra a sus horas — abren mañanas y desde las 17:00. Llamad antes si vais en pleno verano: en agosto hay menos actividad.',
    tip_en:'Each workshop has its own hours — typically mornings and from 5 pm. Call ahead in mid-summer; August is quieter.',
  },

  // ── PLANES EXTRA · investigación web (kayak, buceo, estrellas, copas, juegos) ─
  {
    id:'plan-kayak-cabo',
    type:'morning', audience:'adults',
    title_es:'Kayak guiado en Cabo de Gata · ruta del Corralete',
    title_en:'Guided kayak in Cabo de Gata · Corralete route',
    start:'9:00', end:'14:30',
    tags_es:['kayak','aventura','snorkel'],
    tags_en:['kayak','adventure','snorkel'],
    steps:[
      { t:'9:00',  es:'Salida hacia Agua Amarga',                    en:'Drive to Agua Amarga',
                   d_es:'1 h por la costa. Aparcad en el pueblo.',                                                d_en:'1 h coastal drive. Park in the village.' },
      { t:'10:30', es:'Briefing técnico y kayak doble o individual', en:'Technical briefing + single or double kayak',
                   d_es:'Las empresas ofrecen ruta de 2 h (~30 €/adulto, 20 €/niño). Toyo Aventura, Cabo de Gata Activo, Medialuna.', d_en:'Operators offer 2 h routes (~€30/adult, €20/child). Toyo Aventura, Cabo de Gata Activo, Medialuna.' },
      { t:'11:00', es:'Ruta a la Cala del Plomo y cuevas',           en:'Route to Cala del Plomo and sea caves',
                   d_es:'Acantilados, cuevas marinas, parada para snorkel en agua transparente.',                  d_en:'Cliffs, sea caves, snorkel break in clear water.' },
      { t:'13:00', es:'Comida en Agua Amarga frente al mar',         en:'Lunch in Agua Amarga by the sea',
                   d_es:'Cualquier restaurante del paseo — habéis sudado, os lo merecéis.',                       d_en:'Any seafront restaurant — you earned it.' },
    ],
    tip_es:'Reservad la víspera. Bañador puesto, escarpines o calzado de neopreno, crema biodegradable y una botella de agua.',
    tip_en:'Book the day before. Wear swimwear, water shoes, biodegradable sunscreen and bring a bottle.',
  },
  {
    id:'plan-snorkel-familia',
    type:'morning', audience:'kids',
    title_es:'Snorkel guiado en familia (San José)',
    title_en:'Family snorkel tour (San José)',
    start:'10:00', end:'14:30',
    tags_es:['niños','snorkel','animales marinos'],
    tags_en:['kids','snorkel','marine life'],
    steps:[
      { t:'10:00', es:'Salida hacia San José',                       en:'Drive to San José',
                   d_es:'1 h. Aparcamiento gratuito a la entrada del pueblo.',                                     d_en:'1 h. Free parking at the village entrance.' },
      { t:'11:30', es:'Briefing y entrega de equipo neopreno',       en:'Briefing and wetsuit gear handout',
                   d_es:'Eco Agata u otras empresas — incluyen gafas, tubo, neopreno y chaleco.',                  d_en:'Eco Agata and others — mask, snorkel, wetsuit and vest included.' },
      { t:'12:00', es:'Ruta de snorkel en el Arrecife de las Sirenas', en:'Snorkel at Arrecife de las Sirenas',
                   d_es:'Aguas cristalinas, peces de colores, posidonia. Apto desde 6 años (con monitor).',        d_en:'Clear water, colourful fish, posidonia meadows. Suitable from age 6.' },
      { t:'13:30', es:'Comida en La Ola junto al mar',               en:'Lunch at La Ola by the sea',
                   d_es:'Pescaíto frito y arroces sencillos. Niños menú.',                                         d_en:'Fried fish and simple rice dishes. Kids menu.' },
    ],
    tip_es:'Tras el snorkel, aplicad crema solar de nuevo: el sol pega más después de salir del agua.',
    tip_en:'Reapply sunscreen after snorkelling — the sun bites harder once you\'re dry.',
  },
  {
    id:'plan-buceo-las-negras',
    type:'fullday', audience:'adults',
    title_es:'Buceo en Las Negras + comida + tarde de calas',
    title_en:'Diving in Las Negras + lunch + afternoon coves',
    start:'9:30', end:'19:00',
    tags_es:['buceo','aventura','calas'],
    tags_en:['diving','adventure','coves'],
    steps:[
      { t:'9:30',  es:'Salida hacia Las Negras',                     en:'Drive to Las Negras',
                   d_es:'55 min. Aparcad en el pueblo.',                                                          d_en:'55 min. Park in the village.' },
      { t:'10:30', es:'Briefing y bautismo / inmersión guiada',      en:'Briefing and dive (try-dive or certified)',
                   d_es:'Buceo Las Negras y otras empresas. Visibilidad de 15-30 m, posidonia, fauna mediterránea.', d_en:'Buceo Las Negras and others. 15-30 m visibility, posidonia, Mediterranean fauna.' },
      { t:'13:30', es:'Comida en una terraza del paseo',             en:'Lunch on a promenade terrace',
                   d_es:'Las Negras tiene un par de sitios buenos. Ambiente bohemio.',                             d_en:'Las Negras has a couple of good spots. Bohemian vibe.' },
      { t:'16:00', es:'Tarde en el Playazo de Rodalquilar',          en:'Afternoon at Playazo de Rodalquilar',
                   d_es:'10 min en coche. Acceso fácil al pie de la playa, sombra de paragüeros y descanso.',     d_en:'10 min drive. Easy access at the beach, parasol shade and rest.' },
      { t:'18:00', es:'Café o cerveza en La Isleta del Moro',        en:'Coffee or beer in La Isleta del Moro',
                   d_es:'Pueblito pesquero a 5 min. Atardecer relajado antes de volver.',                          d_en:'Tiny fishing village 5 min away. Relaxed sunset before driving back.' },
    ],
    tip_es:'Bautismo de buceo desde unos 70 €. No hay que ser titulado pero sí saber nadar y no tener problemas de oídos.',
    tip_en:'Try-dive from around €70. No certificate needed but you must swim and have no ear issues.',
  },
  {
    id:'plan-parque-vera-niños',
    type:'evening', audience:'kids',
    title_es:'Parque de ocio infantil en Vera + cena familiar',
    title_en:'Vera kids fun-park + family dinner',
    start:'17:00', end:'21:30',
    tags_es:['niños','minigolf','camas elásticas','cena'],
    tags_en:['kids','minigolf','trampolines','dinner'],
    steps:[
      { t:'17:00', es:'Centro Deportivo Puerto Rey · parque infantil', en:'Puerto Rey sports complex · kids park',
                   d_es:'A 10 min de Hestía. Minigolf, camas elásticas vallada, castillos hinchables, karts de pedales.', d_en:'10 min from Hestía. Minigolf, fenced trampolines, bouncy castles, pedal go-karts.' },
      { t:'19:00', es:'Helado o granizado a pie de pista',           en:'Ice cream or slushie poolside',
                   d_es:'Mientras los peques siguen quemando energía.',                                            d_en:'While the kids burn off the rest of their energy.' },
      { t:'20:00', es:'Vuelta a Hestía y ducha rápida',              en:'Back to Hestía for a quick shower',
                   d_es:'Cambio de ropa antes de salir a cenar.',                                                  d_en:'Change before heading out for dinner.' },
      { t:'20:45', es:'Cena en Pizzería Pomodoro a pie de playa',    en:'Dinner at Pizzería Pomodoro on the beach',
                   d_es:'Pizza, pasta, niños menú. Andando desde Hestía.',                                         d_en:'Pizza, pasta, kids menu. Walkable from Hestía.' },
    ],
    tip_es:'Las hinchables y los karts cierran sobre las 20:00 en invierno y 22:00 en verano. Llegad con margen.',
    tip_en:'Inflatables and karts close around 8 pm in winter and 10 pm in summer. Arrive with time.',
  },
  {
    id:'plan-estrellas-cabo',
    type:'evening', audience:'adults',
    title_es:'Cena en San José + observación de estrellas en Cabo de Gata',
    title_en:'Dinner in San José + stargazing at Cabo de Gata',
    start:'19:00', end:'00:30',
    tags_es:['astronomía','cielo Starlight','romántico'],
    tags_en:['stargazing','Starlight reserve','romantic'],
    steps:[
      { t:'19:00', es:'Salida hacia San José',                       en:'Drive to San José',
                   d_es:'1 h. Aparcad junto al puerto.',                                                          d_en:'1 h. Park near the harbour.' },
      { t:'20:30', es:'Cena temprana en La Gallineta o La Ola',      en:'Early dinner at La Gallineta or La Ola',
                   d_es:'Reservar imprescindible.',                                                                d_en:'Book ahead — required.' },
      { t:'22:30', es:'Coche al Faro de Cabo de Gata',                en:'Drive to Cabo de Gata lighthouse',
                   d_es:'20 min. Aparcamiento del Mirador de las Sirenas.',                                        d_en:'20 min. Park at Mirador de las Sirenas.' },
      { t:'23:00', es:'Observación bajo el cielo Starlight',         en:'Stargazing under the Starlight sky',
                   d_es:'Cabo de Gata tiene reserva Starlight: la Vía Láctea se ve a simple vista en noches limpias. Llevad mantita y el móvil en modo rojo.', d_en:'Cabo de Gata is a Starlight reserve: the Milky Way is visible to the naked eye on clear nights. Bring a blanket and put your phone on red-light mode.' },
      { t:'0:30',  es:'Vuelta tranquila a Hestía',                   en:'Calm drive back to Hestía',
                   d_es:'1 h por carretera vacía. Atentos a los conejos en el arcén.',                             d_en:'1 h on empty road. Watch out for rabbits on the verge.' },
    ],
    tip_es:'Buscad en stellarium.org la fecha óptima — las noches sin luna llena son mucho mejores. Linterna roja > linterna blanca.',
    tip_en:'Use stellarium.org to pick the right date — no-moon nights are much better. Red flashlight > white flashlight.',
  },
  {
    id:'plan-mojacar-noche-musica',
    type:'evening', audience:'adults',
    title_es:'Mojácar Playa de noche · cena + copa con música en vivo',
    title_en:'Mojácar beach by night · dinner + live-music drinks',
    start:'20:00', end:'1:30',
    tags_es:['copas','música en vivo','playa de noche'],
    tags_en:['drinks','live music','night beach'],
    steps:[
      { t:'20:00', es:'Salida hacia Mojácar Playa',                  en:'Drive to Mojácar Beach',
                   d_es:'25 min. Aparcad en el paseo del Mediterráneo.',                                           d_en:'25 min. Park along Paseo del Mediterráneo.' },
      { t:'21:00', es:'Cena en Cabo Norte o Ristorante Valentino',   en:'Dinner at Cabo Norte or Ristorante Valentino',
                   d_es:'Reservad. Mesas con vistas al mar.',                                                      d_en:'Book. Sea-view tables.' },
      { t:'23:00', es:'Copa en Mandala Beach Club',                  en:'Drinks at Mandala Beach Club',
                   d_es:'Club playero con DJ y cócteles. Pista en la arena los fines de semana.',                  d_en:'Beach club with DJ and cocktails. Dance floor on the sand on weekends.' },
      { t:'0:30',  es:'Paseo final por el Paseo del Mediterráneo',   en:'Final walk along Paseo del Mediterráneo',
                   d_es:'Mojácar Playa nunca se duerme del todo en verano.',                                       d_en:'Mojácar Beach never fully sleeps in summer.' },
    ],
    tip_es:'En invierno hay menos sitios abiertos. Llamad antes para confirmar la programación de música en vivo.',
    tip_en:'Fewer venues open in winter. Call ahead to confirm live-music nights.',
  },

  // ── PLANES DEPORTIVOS · CRUCERO Y EXTRAS ─────────────────────
  {
    id:'plan-crucero-cabo',
    type:'fullday', audience:'both',
    title_es:'Crucero por el Cabo de Gata',
    title_en:'Cabo de Gata cruise',
    start:'10:00', end:'17:30',
    tags_es:['barco','calas inaccesibles','snorkel'],
    tags_en:['boat','hidden coves','snorkel'],
    steps:[
      { t:'10:00', es:'Salida hacia el puerto de Carboneras o San José', en:'Drive to Carboneras or San José harbour',
                   d_es:'Compañías como Cabo de Gata Charter, Cala&Bay y otras ofrecen cruceros de medio día y de día completo.', d_en:'Cabo de Gata Charter, Cala&Bay and others offer half-day and full-day cruises.' },
      { t:'11:00', es:'Embarque y briefing de seguridad',           en:'Boarding and safety briefing',
                   d_es:'Reservar antes — los grupos son pequeños (10-25 personas).',                                d_en:'Book ahead — small groups (10-25 people).' },
      { t:'11:30', es:'Ruta por la costa virgen del parque',         en:'Cruise along the protected coast',
                   d_es:'Calas inaccesibles por tierra: Cala del Cuervo, Cala Cerrada, San Pedro desde el mar.',     d_en:'Coves you can\'t reach by land: Cala del Cuervo, Cala Cerrada, San Pedro from the sea.' },
      { t:'13:00', es:'Parada para snorkel y aperitivo a bordo',     en:'Snorkel stop and onboard aperitif',
                   d_es:'Bañito en agua transparente. Algunas compañías incluyen paella o picoteo.',                  d_en:'Swim in clear water. Some operators include paella or finger food.' },
      { t:'15:30', es:'Vuelta a puerto y comida tardía',             en:'Return to port and late lunch',
                   d_es:'Carboneras: marisquerías a pie de puerto. San José: La Ola o La Gallineta.',               d_en:'Carboneras: harbour seafood spots. San José: La Ola or La Gallineta.' },
    ],
    tip_es:'Llevad gorra, crema solar mineral y una sudadera ligera — en el barco hay viento aunque haga calor.',
    tip_en:'Bring a hat, mineral sunscreen and a light hoodie — there\'s wind on board even when it\'s hot.',
  },
  {
    id:'plan-lunar-cable',
    type:'evening', audience:'kids',
    title_es:'Lunar Cable Park · wakeboard sin barco',
    title_en:'Lunar Cable Park · cable wakeboarding',
    start:'17:00', end:'21:30',
    tags_es:['niños','aventura','agua'],
    tags_en:['kids','adventure','water'],
    steps:[
      { t:'17:00', es:'Salida hacia el Lunar Cable Park',           en:'Drive to Lunar Cable Park',
                   d_es:'Wakeboard, kneeboard y esquí acuático sobre un cable que tira en circuito — sin barco. A 20-30 min de Hestía según la sede.', d_en:'Wakeboard, kneeboard and water-ski on a circuit cable — no boat needed. 20-30 min from Hestía depending on the venue.' },
      { t:'18:00', es:'Sesión de cable (1 h) o pase de tarde',       en:'Cable session (1 h) or afternoon pass',
                   d_es:'Hay nivel principiante con barra para niños desde 6-7 años. Equipo neopreno y casco incluidos.', d_en:'Beginner setup with bar for kids from 6-7 years old. Wetsuit and helmet included.' },
      { t:'19:30', es:'Ducha y cambio',                              en:'Shower and change',
                   d_es:'Vestuarios en la propia instalación.',                                                     d_en:'Changing rooms on site.' },
      { t:'20:30', es:'Cena en chiringuito a pie de playa',          en:'Dinner at a beach bar',
                   d_es:'Vuelta a Hestía + cena en Pomodoro o Marau.',                                              d_en:'Back to Hestía + dinner at Pomodoro or Marau.' },
    ],
    tip_es:'Reservad la sesión online — en agosto se llena. Llevad bañador, toalla, chanclas.',
    tip_en:'Book the session online — fills up in August. Bring swimwear, towel, flip-flops.',
  },
  {
    id:'plan-motos-acuaticas',
    type:'morning', audience:'adults',
    title_es:'Motos acuáticas · ruta guiada por la costa',
    title_en:'Jet-ski guided coastal tour',
    start:'10:00', end:'14:00',
    tags_es:['adrenalina','mar','adultos'],
    tags_en:['adrenaline','sea','adults'],
    steps:[
      { t:'10:00', es:'Llegada al centro náutico (Vera Playa o Garrucha)', en:'Arrive at the watersports centre (Vera Playa or Garrucha)',
                   d_es:'Hay varias empresas con punto de salida desde la propia playa.',                            d_en:'Several operators launch directly from the beach.' },
      { t:'10:30', es:'Briefing y entrega del jet ski',              en:'Briefing and jet-ski hand-off',
                   d_es:'Sin licencia con monitor a bordo (acompañado). Con licencia, libre.',                       d_en:'No licence required with a guide on board. With licence, free riding.' },
      { t:'11:00', es:'Ruta de 1-2 h hasta Garrucha o Mojácar',     en:'1-2 h ride to Garrucha or Mojácar',
                   d_es:'En grupo, paradas para fotos y baño en alguna cala.',                                      d_en:'In group, photo and swim stops at some cove.' },
      { t:'13:00', es:'Comida en Pomodoro o Lúa',                   en:'Lunch at Pomodoro or Lúa',
                   d_es:'A pie de playa, descanso al sol después del subidón.',                                     d_en:'Right by the sea, sun-lounger relax after the rush.' },
    ],
    tip_es:'No conducir motos acuáticas con resaca. Crema solar resistente al agua y ropa que se pueda mojar.',
    tip_en:'Never drive a jet-ski hung-over. Waterproof sunscreen and clothes you don\'t mind getting wet.',
  },
  {
    id:'plan-bici-costa',
    type:'morning', audience:'both',
    title_es:'Ruta en bici por la costa · Vera → Mojácar',
    title_en:'Coastal bike ride · Vera → Mojácar',
    start:'9:00', end:'14:00',
    tags_es:['bicicleta','costa','familiar'],
    tags_en:['cycling','coastline','family'],
    steps:[
      { t:'9:00',  es:'Recogida de bicis en Vera Playa',             en:'Pick up bikes in Vera Playa',
                   d_es:'Hay alquileres en Pueblo Indalo, Garrucha y Mojácar. Bicis para niños y carro para los más peques.', d_en:'Rentals in Pueblo Indalo, Garrucha and Mojácar. Kids bikes and toddler trailers available.' },
      { t:'9:30',  es:'Paseo del Almanzora y carril bici a Garrucha', en:'Almanzora promenade and bike lane to Garrucha',
                   d_es:'Asfalto liso y plano. Llano todo el camino.',                                              d_en:'Smooth flat tarmac. Flat all the way.' },
      { t:'11:00', es:'Subida suave hacia Mojácar Playa',            en:'Gentle climb to Mojácar Beach',
                   d_es:'Carril bici en el paseo del Mediterráneo. Vistas al mar todo el rato.',                    d_en:'Bike lane along Paseo del Mediterráneo. Sea views the whole way.' },
      { t:'12:30', es:'Aperitivo en chiringuito de Mojácar',         en:'Aperitif at a Mojácar beach bar',
                   d_es:'Cerveza, refresco, helado para los niños.',                                                d_en:'Beer, soft drink, ice cream for the kids.' },
      { t:'13:30', es:'Vuelta tranquila a Hestía',                   en:'Calm ride back to Hestía',
                   d_es:'Si hay viento del oeste, la vuelta cuesta menos.',                                          d_en:'With a westerly wind, the way back is easier.' },
    ],
    tip_es:'En verano, salid temprano: a partir de las 12:00 el sol pega fuerte aunque vayáis junto al mar.',
    tip_en:'In summer, leave early: after noon the sun is strong even by the sea.',
  },
  {
    id:'plan-curso-buceo',
    type:'fullday', audience:'adults',
    title_es:'Curso de buceo Open Water (Las Negras o San José)',
    title_en:'Open Water diving course (Las Negras or San José)',
    start:'9:00', end:'18:30',
    tags_es:['titulación','buceo','aventura'],
    tags_en:['certification','diving','adventure'],
    steps:[
      { t:'9:00',  es:'Salida hacia Las Negras',                     en:'Drive to Las Negras',
                   d_es:'1 h. Buceo Las Negras o Isub Almería ofrecen Open Water PADI/SSI en 3-4 días.',            d_en:'1 h. Buceo Las Negras or Isub Almería run PADI/SSI Open Water in 3-4 days.' },
      { t:'10:00', es:'Teoría y piscina · primer día',               en:'Theory and pool · day one',
                   d_es:'Vídeos online previos + repaso presencial. Práctica en aguas confinadas.',                 d_en:'Online theory before + classroom recap. Confined-water practice.' },
      { t:'14:00', es:'Comida en una terraza del paseo',             en:'Lunch on a promenade terrace',
                   d_es:'Pescaíto y un buen vino blanco antes de la siguiente sesión.',                             d_en:'Fried fish and a good white wine before the next session.' },
      { t:'15:30', es:'Inmersión 1 en aguas abiertas',               en:'Open-water dive 1',
                   d_es:'Profundidad limitada (12 m). Visibilidad 15-30 m, posidonia, fauna mediterránea.',          d_en:'Limited depth (12 m). Visibility 15-30 m, posidonia, Mediterranean fauna.' },
      { t:'17:30', es:'Debriefing y café',                           en:'Debrief and coffee',
                   d_es:'Repaso del bitácora antes de volver.',                                                     d_en:'Logbook review before driving back.' },
    ],
    tip_es:'El curso Open Water son 3-4 días. Si solo vais una mañana → bautismo (sin titulación) por unos 70 €.',
    tip_en:'The Open Water course is 3-4 days. For a single morning → try-dive (no certification) from around €70.',
  },
  {
    id:'plan-lua-paseo',
    type:'evening', audience:'adults',
    title_es:'Cena en Lúa + paseo por la playa de Vera',
    title_en:'Dinner at Lúa + walk along Vera beach',
    start:'20:30', end:'00:00',
    tags_es:['cena sofisticada','playa','romántico'],
    tags_en:['fine dining','beach','romantic'],
    steps:[
      { t:'20:30', es:'Aperitivo a pie de playa',                     en:'Aperitif by the beach',
                   d_es:'Vermut o gin tonic en cualquier chiringuito de la zona — Marau, Las Buganvillas o Playa Turquesa funcionan bien.', d_en:'Vermouth or gin tonic at any local beach bar — Marau, Las Buganvillas or Playa Turquesa all work.' },
      { t:'21:30', es:'Cena en Lúa',                                  en:'Dinner at Lúa',
                   d_es:'Cocina creativa de producto, mar y huerta. Reservad — los fines de semana se llenan. Carta de vinos cuidada.', d_en:'Creative seasonal cuisine, sea and garden produce. Book ahead — weekends fill up. Considered wine list.' },
      { t:'23:00', es:'Paseo por la orilla o por el Paseo del Mediterráneo', en:'Stroll along the shore or the Paseo del Mediterráneo',
                   d_es:'Si la marea está baja, descalzos por la arena hacia el sur. Si no, el paseo iluminado entre palmeras. Brisa de mar y luna llena (si hay suerte).', d_en:'If the tide is low, barefoot along the sand southwards. If not, the lit promenade between palm trees. Sea breeze and full moon (if you are lucky).' },
      { t:'23:45', es:'Última copa en terraza',                       en:'Nightcap on a terrace',
                   d_es:'Yaho, Lúa mismo o cualquier coctelería del paseo para un destilado tranquilo antes de volver a Hestía.', d_en:'Yaho, Lúa itself or any cocktail bar on the promenade for a quiet last drink before heading back to Hestía.' },
    ],
    tip_es:'Lúa cierra cocina sobre las 23:00 y la cena ronda los 50-70 €/persona con vino. Reservad y pedid mesa de terraza si la noche es buena.',
    tip_en:'Lúa stops serving around 23:00 and dinner runs €50-70/person with wine. Book ahead and ask for a terrace table on a clear night.',
  },
  {
    id:'plan-garrucha-malecon',
    type:'evening', audience:'both',
    title_es:'Cena en Garrucha + malecón del puerto',
    title_en:'Dinner in Garrucha + harbour promenade',
    start:'20:00', end:'23:30',
    tags_es:['gambas rojas','puerto','familiar'],
    tags_en:['red prawns','harbour','family'],
    steps:[
      { t:'20:00', es:'Llegada a Garrucha y paseo previo',            en:'Arrive in Garrucha, pre-dinner stroll',
                   d_es:'Aparcad cerca del puerto. Bajad al malecón para abrir apetito viendo cómo amarra la flota.', d_en:'Park near the harbour. Walk down the malecón to work up an appetite watching the fleet moor.' },
      { t:'20:30', es:'Cena de gambas rojas',                         en:'Red-prawn dinner',
                   d_es:'La gamba roja de Garrucha es D.O. y se come a pie de puerto. Restaurante El Almejero, Mesón Manolo o cualquier marisquería del paseo. Si vais con niños: arroz a banda, calamares, pescaíto. Para adultos: gamba roja a la plancha + vino blanco frío.', d_en:'Garrucha red prawns are PDO and best at the port. El Almejero, Mesón Manolo or any seafood spot on the promenade. With kids: arroz a banda, calamari, fried fish. Adults: grilled red prawns + cold white wine.' },
      { t:'22:00', es:'Paseo del malecón hasta el faro',               en:'Walk the malecón to the lighthouse',
                   d_es:'Tramo iluminado de un kilómetro junto a las barcas. Bancos para parar. Niños felices con las farolas y el ruido de las olas contra el espigón.', d_en:'A lit one-kilometre stretch along the boats. Plenty of benches. Kids love the lamps and the waves against the breakwater.' },
      { t:'22:45', es:'Helado o churros antes de volver',              en:'Ice cream or churros before heading back',
                   d_es:'Heladería La Ibense en el paseo (artesanal). Si abre, los churros del puerto son un clásico.', d_en:'La Ibense ice-cream parlour on the promenade (artisanal). If open, the harbour churros are a classic.' },
    ],
    tip_es:'Domingos noche muchos restaurantes de Garrucha cierran. Mejor de jueves a sábado. La gamba roja vale lo que vale — pero merece la pena al menos una vez.',
    tip_en:'Many Garrucha restaurants close on Sunday evenings. Best Thursday to Saturday. Red prawns aren\'t cheap — but worth doing at least once.',
  },
  {
    id:'plan-calar-alto',
    type:'fullday', audience:'adults',
    title_es:'Visita al observatorio de Calar Alto + cielo nocturno',
    title_en:'Visit to Calar Alto Observatory + night sky',
    start:'15:00', end:'23:30',
    tags_es:['astronomía','montaña','starlight'],
    tags_en:['astronomy','mountain','starlight'],
    steps:[
      { t:'15:00', es:'Salida hacia Sierra de los Filabres',          en:'Drive to Sierra de los Filabres',
                   d_es:'2 h por A-7, A-92 y AL-3404. Carretera de montaña al final, sin dificultad pero con curvas. Reservad la visita guiada en calaraltoexperience.com con varias semanas de antelación — las plazas vuelan.', d_en:'2 h via A-7, A-92 and AL-3404. Mountain road at the end, no difficulty but winding. Book the guided tour at calaraltoexperience.com several weeks in advance — slots sell out fast.' },
      { t:'17:00', es:'Visita guiada al observatorio (telescopio 3.5m)', en:'Guided tour of the observatory (3.5m telescope)',
                   d_es:'A 2.168 m de altitud. Visita el telescopio español más grande, sala de control, exposición. Astrónomos profesionales explican el trabajo del CAHA.', d_en:'At 2,168 m altitude. Visit Spain\'s largest telescope, the control room, the exhibition. Professional astronomers explain CAHA\'s work.' },
      { t:'19:30', es:'Cena en Bacares o Serón',                      en:'Dinner in Bacares or Serón',
                   d_es:'Pueblos serranos. En Serón el jamón es de los mejores de España (D.O. Serón). Mesón El Tano o cualquier hostal con menú casero serrano: migas, gachas, choto al ajillo.', d_en:'Mountain villages. Serón ham is among Spain\'s best (PDO Serón). Mesón El Tano or any inn with home-style mountain menu: migas, gachas, kid stew with garlic.' },
      { t:'21:30', es:'Observación de estrellas en mirador',          en:'Stargazing at a viewpoint',
                   d_es:'Vuelta hacia el observatorio o cualquier mirador alto de los Filabres. Cielo Starlight certificado: la Vía Láctea se ve a simple vista. Aplicación SkyView o Stellarium en el móvil para identificar.', d_en:'Drive back near the observatory or any high Filabres viewpoint. Starlight-certified sky: Milky Way visible to the naked eye. Use SkyView or Stellarium on your phone to identify.' },
      { t:'22:30', es:'Vuelta a Hestía',                              en:'Drive back to Hestía',
                   d_es:'1h45. Despacio en las curvas — las cabras montesas cruzan de noche. Si vais cansados, dormid en una casa rural de Bacares.', d_en:'1h45. Take the curves slowly — wild goats cross at night. If you are tired, stay over at a rural house in Bacares.' },
    ],
    tip_es:'Llevad sudadera GORDA y gorro: a 2.000 m hace 10-15 °C menos que en Vera, incluso en agosto. Linterna roja para no romper la adaptación a la oscuridad.',
    tip_en:'Bring a HEAVY hoodie and beanie: at 2,000 m it\'s 10-15 °C colder than in Vera, even in August. Red flashlight to preserve dark adaptation.',
  },
];

const DayPlanCard = ({ plan, lang }) => {
  const [open, setOpen] = React.useState(false);
  const title = plan[`title_${lang}`];
  const tags  = plan[`tags_${lang}`] || [];
  const tip   = plan[`tip_${lang}`];
  return (
    <article className={`dp-card ${open ? 'is-open' : ''}`}>
      <button type="button" className="dp-card-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="dp-card-time">{plan.start}<span className="dp-card-arrow" aria-hidden="true">→</span>{plan.end}</span>
        <span className="dp-card-title">{title}</span>
        <span className={`dp-card-chev ${open ? 'open' : ''}`} aria-hidden="true">↓</span>
      </button>
      <div className="dp-card-body" aria-hidden={!open}>
        {tags.length > 0 && (
          <div className="dp-tags">
            {tags.map(t => <span key={t} className="dp-tag">{t}</span>)}
          </div>
        )}
        <ol className="dp-timeline">
          {plan.steps.map((s, i) => (
            <li key={i} className="dp-step">
              <span className="dp-step-time">{s.t}</span>
              <div className="dp-step-body">
                <strong className="dp-step-what">{s[lang]}</strong>
                <span className="dp-step-detail">{s[`d_${lang}`]}</span>
              </div>
            </li>
          ))}
        </ol>
        {tip && (
          <div className="dp-tip">
            <span className="dp-tip-label">{lang === 'es' ? 'Tip de Alex y Fran' : 'Tip from Alex & Fran'}</span>
            <span className="dp-tip-text">{tip}</span>
          </div>
        )}
      </div>
    </article>
  );
};

const DayPlans = ({ lang }) => {
  // Filtro por audiencia: kids (con niños), adults (sin niños), all (todos).
  // Los planes 'both' aparecen en kids y en adults.
  const [audience, setAudience] = React.useState('all');
  const matches = (p) => {
    if (audience === 'all')    return true;
    if (audience === 'kids')   return p.audience === 'kids'   || p.audience === 'both';
    if (audience === 'adults') return p.audience === 'adults' || p.audience === 'both' || !p.audience;
    return true;
  };
  const tabs = [
    { id:'all',    es:'Todos',     en:'All' },
    { id:'adults', es:'Sin niños', en:'No kids' },
    { id:'kids',   es:'Con niños', en:'With kids' },
  ];
  return (
    <div className="ag-day-plans">
      <div className="ag-day-plans-head">
        <span className="eyebrow">{lang === 'es' ? 'Sugerencias de excursiones' : 'Suggested excursions'}</span>
        <h3 className="ag-h3" style={{ margin: 0 }}>
          {lang === 'es' ? 'Planes de día por la zona' : 'One-day plans around'}
        </h3>
        <p className="ag-day-plans-disclaimer">
          {lang === 'es'
            ? 'Estos son solo ideas — hay innumerables opciones para todos los gustos. Os animamos a descubrir, vivir Vera y Hestía a vuestro propio ritmo.'
            : 'These are just ideas — there are countless options for every taste. We invite you to discover, to live Vera and Hestía at your own pace.'}
        </p>
      </div>
      <div className="dp-tabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            type="button"
            className={`dp-tab ${audience === t.id ? 'active' : ''}`}
            aria-selected={audience === t.id}
            onClick={() => setAudience(t.id)}
          >
            {t[lang]}
          </button>
        ))}
      </div>
      {Object.entries(DAY_PLAN_GROUPS).map(([type, group]) => {
        const plans = DAY_PLANS.filter(p => p.type === type && matches(p));
        if (!plans.length) return null;
        return (
          <div key={type} className="dp-group">
            <h4 className="dp-group-title">
              <span>{group[lang]}</span>
              <small>{group[`sub_${lang}`]}</small>
            </h4>
            <div className="dp-cards">
              {plans.map(plan => <DayPlanCard key={plan.id} plan={plan} lang={lang} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ================================================================
// AptGuideView — guía integrada en la página de Hestía
// (se renderiza dentro del Header / Footer del portal)
// ================================================================
const AptGuideView = ({ apt, lang, onClose }) => {
  const s         = GUIDE_SHARED[lang];
  const a         = GUIDE_BY_APT[apt.id][lang];
  const aptInfo   = GUIDE_BY_APT[apt.id];
  const aptName   = apt[lang].name;
  const photoMap  = ROOM_PHOTOS[apt.id] || {};
  const urbExtra  = URB_FALLBACK[apt.id] || [];
  const galleryImgs     = apt.gallery_imgs || [];
  const galleryCaptions = apt[lang].gallery_captions || [];

  const [activeSection, setActiveSection] = React.useState('bienvenida');
  const [navOpen, setNavOpen] = React.useState(false);

  // Scrollspy: marca la sección visible en el nav lateral
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length) {
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b);
        setActiveSection(top.target.id.replace('ag-', ''));
      }
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

    GUIDE_SECTIONS.forEach(sec => {
      const el = document.getElementById(`ag-${sec.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Las fotos y .ag-section-num animan al mount via @starting-style en CSS,
  // sin necesidad de IntersectionObserver. Default visible si el navegador
  // no soporta @starting-style — más robusto que ocultar y depender de JS.

  React.useEffect(() => {
    document.body.classList.add('guide-mode');
    window.scrollTo(0, 0);
    return () => document.body.classList.remove('guide-mode');
  }, []);

  const handlePrint = () => window.print();

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setNavOpen(false);
    const el = document.getElementById(`ag-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Devuelve [{src, caption}] para una habitación dada
  const getRoomPhotos = (roomId) => {
    const idxs = photoMap[roomId] || [];
    const fromGallery = idxs
      .filter(i => i < galleryImgs.length)
      .map(i => ({ src: galleryImgs[i], caption: galleryCaptions[i] || '' }));
    if (fromGallery.length) return fromGallery;
    if (roomId === 'urbanizacion') return urbExtra.map(src => ({ src, caption: '' }));
    return [];
  };

  const PhotoGrid = ({ photos }) => {
    if (!photos || !photos.length) return null;
    const HasMark = typeof WatermarkBadge !== 'undefined';
    return (
      <div className="ag-photo-grid" data-count={photos.length}>
        {photos.map((p, i) => (
          <figure key={i} className="ag-photo" style={{ '--i': i }}>
            <span className="ag-photo-frame">
              <img src={p.src} alt={p.caption || ''} loading="lazy" />
              {HasMark && <WatermarkBadge size={28} pos={{ bottom: 10, right: 10 }} />}
            </span>
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  };

  return (
    <article className="apt-guide-view" data-apt={apt.id}
             style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>

      <header className="ag-hero">
        <div className="ag-hero-inner">
          <button className="ag-back no-print" onClick={onClose}>
            <span aria-hidden="true">←</span>
            <span>{lang === 'es' ? 'Volver a Hestía' : 'Back to Hestía'}</span>
          </button>
          <span className="ag-hero-eyebrow">{lang === 'es' ? 'Guía del huésped' : 'Guest guide'}</span>
          <h1 className="ag-hero-title">{aptName}</h1>
          <p className="ag-hero-sub">
            {lang === 'es'
              ? 'Tu hogar lejos de tu casa — con todo lo que necesitas saber.'
              : 'Your home away from home — with everything you need to know.'}
          </p>
        </div>
      </header>

      <div className="ag-layout">

        {/* Mobile-only: trigger to open nav */}
        <button
          className="ag-nav-toggle no-print"
          onClick={() => setNavOpen(o => !o)}
          aria-expanded={navOpen}
        >
          <span aria-hidden="true">☰</span>
          <span>{lang === 'es' ? 'Índice de la guía' : 'Guide contents'}</span>
        </button>

        <aside className={`ag-nav no-print${navOpen ? ' is-open' : ''}`}>
          <div className="ag-nav-inner">
            <span className="ag-nav-label">{lang === 'es' ? 'Índice' : 'Contents'}</span>
            <ol className="ag-nav-list">
              {GUIDE_SECTIONS.map((sec, i) => (
                <li key={sec.id}>
                  <a
                    href={`#ag-${sec.id}`}
                    className={activeSection === sec.id ? 'is-active' : ''}
                    onClick={(e) => handleNavClick(e, sec.id)}
                  >
                    <span className="ag-nav-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ag-nav-text">{sec[lang]}</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="ag-nav-actions">
              <a className="ag-nav-btn" href={aptInfo.pdf} target="_blank" rel="noopener">
                {lang === 'es' ? 'PDF original' : 'Original PDF'}
              </a>
              <button className="ag-nav-btn ag-nav-btn-primary" onClick={handlePrint}>
                {lang === 'es' ? '⇩ Descargar PDF' : '⇩ Download PDF'}
              </button>
            </div>
          </div>
        </aside>

        <div className="ag-content">

          <section id="ag-bienvenida" className="ag-section">
            <span className="ag-section-num">01</span>
            <h2 className="ag-h2">{s.welcome.title}</h2>
            {s.welcome.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
            <p className="ag-sign">{s.welcome.sign}</p>
            <p className="ag-signer">{s.welcome.signer}</p>
          </section>

          <section id="ag-nombre" className="ag-section">
            <span className="ag-section-num">02</span>
            <h2 className="ag-h2">{s.name.title}</h2>
            {s.name.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
          </section>

          <section id="ag-proposito" className="ag-section">
            <span className="ag-section-num">03</span>
            <h2 className="ag-h2">{s.why.title}</h2>
            {s.why.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
          </section>

          <section id="ag-limpieza" className="ag-section">
            <span className="ag-section-num">04</span>
            <h2 className="ag-h2">{s.cleaning.title}</h2>
            <p className="ag-para">{s.cleaning.intro}</p>
            <p className="ag-note">{s.cleaning.note}</p>
            <h3 className="ag-h3">{lang === 'es' ? 'Recomendaciones' : 'Recommendations'}</h3>
            <ol className="ag-recs">
              {s.cleaning.recs.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </section>

          {a.rooms.map((room, idx) => (
            <section key={room.id} id={`ag-${room.id}`} className={`ag-section ag-room ag-room-${room.id}`}>
              <span className="ag-section-num">{String(idx + 5).padStart(2, '0')}</span>
              <h2 className="ag-h2">{room.title}</h2>
              <p className="ag-para ag-para-lead">{room.body}</p>
              <PhotoGrid photos={getRoomPhotos(room.id)} />
              <h3 className="ag-h3">{lang === 'es' ? 'Recomendaciones' : 'Recommendations'}</h3>
              <ol className="ag-recs">
                {room.recs.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </section>
          ))}

          <section id="ag-alrededores" className="ag-section">
            <span className="ag-section-num">11</span>
            <h2 className="ag-h2">{s.surroundings.title}</h2>
            <p className="ag-para">{s.surroundings.intro}</p>

            <GuideMap lang={lang} apt={apt} />

            <h3 className="ag-h3">{lang === 'es' ? 'Fuentes recomendadas' : 'Recommended sources'}</h3>
            <ol className="ag-recs">
              {s.surroundings.sources.map((r, i) => <li key={i}>{r}</li>)}
            </ol>

            {/* Bloque de sitios web turísticos · agrupados por zona */}
            {s.surroundings.sites && (
              <div className="ag-sites">
                <h3 className="ag-h3">{s.surroundings.sites.title}</h3>
                <div className="ag-sites-grid">
                  {s.surroundings.sites.groups.map((g, gi) => (
                    <div key={gi} className="ag-sites-group">
                      <h4 className="ag-sites-group-title">{g.title}</h4>
                      <ul className="ag-sites-list">
                        {g.links.map((l, li) => (
                          <li key={li}>
                            <a href={l.url} target="_blank" rel="noopener noreferrer">
                              <span className="ag-sites-arrow" aria-hidden="true">↗</span>
                              {l.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías plegables: cada una abre/cierra al pulsar el head.
                Si tiene "imperdibles" se ven dentro, arriba del listado general. */}
            {CATEGORIES.filter(c => c.id !== 'home').map(cat => {
              const inCat = PLACES.filter(p => p.cat === cat.id);
              if (!inCat.length) return null;
              return <CatGroup key={cat.id} cat={cat} places={inCat} lang={lang} />;
            })}

            {/* Planes de día curados — itinerarios de un día completo */}
            <DayPlans lang={lang} />
          </section>

          <section id="ag-telefonos" className="ag-section">
            <span className="ag-section-num">12</span>
            <h2 className="ag-h2">{s.phones.title}</h2>
            <div className="ag-wifi">
              <span className="ag-wifi-label">{s.phones.wifi.label}</span>
              <code className="ag-wifi-value">{s.phones.wifi.value}</code>
            </div>
            <table className="ag-phones-table">
              <tbody>
                {s.phones.list.map(item => (
                  <tr key={item.label}>
                    <th scope="row">{item.label}</th>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="ag-feedback" className="ag-section">
            <span className="ag-section-num">13</span>
            <h2 className="ag-h2">{s.feedback.title}</h2>
            {s.feedback.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
          </section>

          <div className="ag-content-end no-print">
            <button className="ag-back" onClick={onClose}>
              <span aria-hidden="true">←</span>
              <span>{lang === 'es' ? 'Volver a Hestía' : 'Back to Hestía'}</span>
            </button>
          </div>

        </div>
      </div>
    </article>
  );
};

// ================================================================
// AptGuideGate — botón "Solo para huéspedes" + modal con PIN
// Cuando se desbloquea, llama onUnlock() para que el padre
// reemplace la página por <AptGuideView/>.
// ================================================================
const AptGuideGate = ({ apt, lang, onUnlock }) => {
  const expected = APT_GUIDE_PIN[apt.id];
  const [open, setOpen] = React.useState(false);
  const [pin, setPin] = React.useState('');
  const [status, setStatus] = React.useState('idle');
  const dialogRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
    if (open) {
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open]);

  // Permite abrir el modal desde otros sitios (ej. sidebar de escritorio)
  // disparando window.dispatchEvent(new Event('hestia:open-guide-pin')).
  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('hestia:open-guide-pin', onOpen);
    return () => window.removeEventListener('hestia:open-guide-pin', onOpen);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (pin.trim().toUpperCase() === expected) {
      setStatus('success');
      // Delay matches the modal's .is-success exit animation (scale + blur out)
      // and lets the apartment-page crossfade kick in cleanly afterwards.
      setTimeout(() => { onUnlock(); setOpen(false); }, 360);
    } else {
      setStatus('error');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const t = lang === 'es' ? {
    cta: 'Solo para huéspedes',
    title: `Guía completa de ${apt.es.name}`,
    desc: 'Introduce el PIN que recibiste con tu reserva para acceder a la guía web (rooms, recomendaciones, teléfonos útiles) y descargarla en PDF.',
    placeholder: 'PIN de tu reserva',
    submit: 'Acceder a la guía',
    helper: 'Encontrarás el PIN en tu confirmación de reserva.',
    error: 'PIN incorrecto. Revisa tu confirmación de reserva.',
    success: 'PIN correcto. Abriendo la guía…',
    cancel: 'Cancelar',
  } : {
    cta: 'Guests only',
    title: `Full ${apt.en.name} guide`,
    desc: 'Enter the PIN from your booking to access the web guide (rooms, recommendations, useful phones) and download it as PDF.',
    placeholder: 'Booking PIN',
    submit: 'Open guide',
    helper: 'You will find the PIN in your booking confirmation.',
    error: 'Wrong PIN. Check your booking confirmation.',
    success: 'PIN accepted. Opening the guide…',
    cancel: 'Cancel',
  };

  return (
    <>
      <section className="apt-guide-gate" style={{ '--apt-accent': apt.accent }}>
        <div className="apt-guide-gate-inner">
          <span className="apt-guide-gate-eyebrow">{lang === 'es' ? 'Guía del huésped' : 'Guest guide'}</span>
          <h2 className="apt-guide-gate-title">
            {lang === 'es'
              ? <>La guía completa de <em>{apt.es.name}</em></>
              : <>The complete <em>{apt.en.name}</em> guide</>}
          </h2>
          <p className="apt-guide-gate-desc">
            {lang === 'es'
              ? 'Recomendaciones del barrio, restaurantes, calas, instrucciones de Hestía y todo lo que necesitas para tu estancia. Reservada para huéspedes con PIN.'
              : 'Neighbourhood recommendations, restaurants, coves, Hestía instructions and everything you need for your stay. Reserved for guests with a PIN.'}
          </p>
          <button className="apt-guide-gate-btn" onClick={() => setOpen(true)}>
            <span>{t.cta}</span>
            <span className="apt-guide-gate-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {open && (
        <div className="ag-modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className={`ag-modal${status === 'error' ? ' is-error' : ''}${status === 'success' ? ' is-success' : ''}`}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ag-modal-title"
            onClick={e => e.stopPropagation()}
            style={{ '--apt-accent': apt.accent }}
          >
            <button className="ag-modal-close" onClick={() => setOpen(false)} aria-label={t.cancel}>×</button>
            <h3 id="ag-modal-title" className="ag-modal-title">{t.title}</h3>
            <p className="ag-modal-desc">{t.desc}</p>
            <form onSubmit={submit} noValidate>
              <label htmlFor="ag-pin" className="ag-modal-label">{t.placeholder}</label>
              <input
                ref={inputRef}
                id="ag-pin"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={12}
                className="ag-modal-input"
                placeholder="HVX0000"
                value={pin}
                onChange={e => { setPin(e.target.value); if (status !== 'idle') setStatus('idle'); }}
                aria-invalid={status === 'error'}
              />
              <p className="ag-modal-msg" role="status">
                {status === 'error'   ? t.error   :
                 status === 'success' ? t.success :
                 t.helper}
              </p>
              <div className="ag-modal-actions">
                <button type="button" className="ag-modal-cancel" onClick={() => setOpen(false)}>{t.cancel}</button>
                <button type="submit" className="ag-modal-submit">{t.submit}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

Object.assign(window, { AptGuideGate, AptGuideView });
