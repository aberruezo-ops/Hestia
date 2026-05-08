// ================================================================
// HESTÍA — Guía interactiva del huésped (web rebuild de los PDFs)
// Acceso protegido con PIN: HVM2016 (Mar) / HVT2019 (Thalassa) / HVS2021 (Salinas)
// El contenido proviene de los PDFs originales en docs/assets/*Hestia*Guia*
// ================================================================

const APT_GUIDE_PIN = { vm: 'HVM2016', vt: 'HVT2019', vs: 'HVS2021' };

// ----- Mapeo: galería de cada apartamento → estancia -----
// Reusamos las fotos profesionales que ya están en assets/apt-vX-gallery-N.jpg
// (mismas que la galería del apartamento). Cada índice apunta a su posición
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
  { id: 'salon',        es: 'Salón',            en: 'Living room' },
  { id: 'cocina',       es: 'Cocina',           en: 'Kitchen' },
  { id: 'dormitorios',  es: 'Dormitorios',      en: 'Bedrooms' },
  { id: 'banos',        es: 'Baños',            en: 'Bathrooms' },
  { id: 'terraza',      es: 'Terraza',          en: 'Terrace' },
  { id: 'urbanizacion', es: 'Urbanización',     en: 'Complex' },
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
  // Hestía (centro del mapa) — Vera Playa
  { id: 'hestia-mar',     name: 'Hestía Vera Mar',      cat: 'home',  lat: 37.2245, lng: -1.7975 },
  { id: 'hestia-thalassa',name: 'Hestía Vera Thalassa', cat: 'home',  lat: 37.2440, lng: -1.7870 },
  { id: 'hestia-salinas', name: 'Hestía Vera Salinas',  cat: 'home',  lat: 37.2155, lng: -1.7785 },

  // Supermercados
  { id: 'coviran',        name: 'Covirán', desc: 'El más cercano (pequeño, andando), junto al hotel Vera Playa.', cat: 'super', lat: 37.2235, lng: -1.7975 },
  { id: 'consum',         name: 'Consum', cat: 'super', url: 'https://goo.gl/maps/h6UvnBe3ATHpsPXbA', lat: 37.2200, lng: -1.8090 },
  { id: 'mercadona',      name: 'Mercadona Vera Playa', cat: 'super', url: 'https://goo.gl/maps/axi9Lb9xLp8yuVUR8', lat: 37.2360, lng: -1.7935 },
  { id: 'super-vera',     name: 'Vera (Dia · Lidl · Mercadona)', desc: 'Supermercados grandes en Vera pueblo.', cat: 'super', lat: 37.2491, lng: -1.8639 },

  // Librerías
  { id: 'nobel',          name: 'Nobel', desc: 'Librería en Vera.', cat: 'bookshop', lat: 37.2491, lng: -1.8639 },
  { id: 'macondo',        name: 'Macondo', desc: 'Librería en Mojácar.', cat: 'bookshop', lat: 37.1377, lng: -1.8523 },

  // Restaurantes
  { id: 'riad-cabrera',   name: 'Riad Cabrera',     desc: 'Marroquí en Sierra Cabrera. Carretera de montaña, pero merece muchísimo la pena.', tier: '€€€', cat: 'restaurant', lat: 37.1550, lng: -1.8700 },
  { id: 'juan-moreno',    name: 'Juan Moreno',       desc: 'Sofisticado. Cocina de autor.',           tier: '€€€', cat: 'restaurant', lat: 37.2495, lng: -1.8623 },
  { id: 'terraza-carmona',name: 'Terraza Carmona',   desc: 'Cocina española moderna en Vera pueblo.', tier: '€€',  cat: 'restaurant', lat: 37.2486, lng: -1.8635 },
  { id: 'gateway-india',  name: 'Gateway to India',  desc: 'Hindú. Bueno y barato.',                   tier: '€',   cat: 'restaurant', lat: 37.2230, lng: -1.8090 },
  { id: 'pomodoro',       name: 'Pizzería Pomodoro', desc: 'A pie de playa.',                          tier: '€€',  cat: 'restaurant', lat: 37.2270, lng: -1.7920 },
  { id: 'trattoria',      name: 'La Trattoria da Marco', desc: 'Garrucha. Las pizzas están geniales.', tier: '€',   cat: 'restaurant', lat: 37.1810, lng: -1.8230 },
  { id: 'lua',            name: 'Lúa',               desc: 'Sofisticado. Mejor para cena o copa.',     tier: '€€€', cat: 'restaurant', lat: 37.2310, lng: -1.7935 },
  { id: 'bistro',         name: 'The Bistro',        desc: 'Bastante bien.',                            tier: '€€',  cat: 'restaurant', lat: 37.2310, lng: -1.7945 },
  { id: 'koa',            name: 'Resto Bar Koa',     desc: 'Frente a Hestía Vera Mar.',                 tier: '€€',  cat: 'restaurant', lat: 37.2245, lng: -1.7965 },
  { id: 'bbme-rest',      name: 'Restaurante Bbme Palomares', desc: 'En plena playa, a 10 min a pie.',  tier: '€€',  cat: 'restaurant', lat: 37.2155, lng: -1.7800 },
  { id: 'playa-azul',     name: 'Hostal Playa Azul', desc: 'Villaricos. Excelente paella con bogavante.', tier: '€€', cat: 'restaurant', lat: 37.2460, lng: -1.7660 },
  { id: 'tadeo',          name: 'Tadeo',             desc: 'Villaricos. Arroz con bogavante y tostas de ahumados.', tier: '€€', cat: 'restaurant', lat: 37.2455, lng: -1.7670 },
  { id: 'rosado',         name: 'Freiduría Bar Rosado', desc: 'Buenas referencias.',                    tier: '€€',  cat: 'restaurant', lat: 37.2240, lng: -1.8095 },
  { id: 'av-alicante',    name: 'Av. Ciudad de Alicante', desc: 'Detrás del Consum: pubs, comida rápida y más.',     cat: 'restaurant', lat: 37.2196, lng: -1.8082 },
  { id: 'valentino',      name: 'Ristorante di Valentino', desc: 'Mojácar.',                            tier: '€€',  cat: 'restaurant', lat: 37.1377, lng: -1.8523 },
  { id: 'cabo-norte',     name: 'Cabo Norte',        desc: 'Mojácar. Buena materia prima a buen precio.', tier: '€€',cat: 'restaurant', lat: 37.1370, lng: -1.8530 },
  { id: 'neptuno',        name: 'Restaurante Neptuno', desc: 'Mojácar. Buen pescado.',                  tier: '€€',  cat: 'restaurant', lat: 37.1360, lng: -1.8520 },
  { id: 'martin-fierro',  name: 'Asador Martín Fierro', desc: 'Rodalquilar.',                            tier: '€€€', cat: 'restaurant', lat: 36.8475, lng: -2.0395 },
  { id: 'oro-luz',        name: 'Oro y Luz',         desc: 'Rodalquilar.',                                tier: '€€€', cat: 'restaurant', lat: 36.8480, lng: -2.0400 },
  { id: 'la-villa',       name: 'La Villa',          desc: 'Aguamarga.',                                  tier: '€€€', cat: 'restaurant', lat: 36.9395, lng: -2.0000 },

  // Restaurantes celíacos
  { id: 'celiac-near',    name: 'Cerca de Hestía: Lúa, Chiringuito Maruja, Pizzería Memoli', cat: 'celiac', lat: 37.2240, lng: -1.7980 },
  { id: 'boracay',        name: 'Boracay (Garrucha)', cat: 'celiac', lat: 37.1810, lng: -1.8230 },
  { id: 'kontiki',        name: 'Mojácar: Cabo Norte, Neptuno, Kontiki', cat: 'celiac', lat: 37.1377, lng: -1.8523 },
  { id: 'regio',          name: 'Vera pueblo: Juan Moreno, Terraza Carmona, Regio', cat: 'celiac', lat: 37.2491, lng: -1.8639 },

  // Copas y chiringuitos
  { id: 'turquesa',       name: 'Chiringuito Playa Turquesa', desc: 'Andando desde casa.', cat: 'bar', lat: 37.2260, lng: -1.7935 },
  { id: 'paraiso',        name: 'Paraíso Vera Beach', desc: 'Andando desde casa.',         cat: 'bar', lat: 37.2300, lng: -1.7920 },
  { id: 'chumbo',         name: 'Chiringuito El Chumbo', desc: 'Andando desde casa.',      cat: 'bar', lat: 37.2360, lng: -1.7895 },
  { id: 'marau',          name: 'Marau Beach Club',                                            cat: 'bar', lat: 37.2410, lng: -1.7895 },
  { id: 'mar-arena',      name: 'Chiringuito Mar y Arena',                                     cat: 'bar', lat: 37.2335, lng: -1.7910 },
  { id: 'bbme-palomares', name: 'Bbme Palomares', desc: 'En plena playa, a 10 min a pie.',     cat: 'bar', lat: 37.2155, lng: -1.7800 },

  // Pescaderías
  { id: 'mercado-vera',   name: 'Mercado de abastos (Vera)', cat: 'fish', url: 'https://goo.gl/maps/PaEerwZNxAK1kNTS8', lat: 37.2486, lng: -1.8625 },
  { id: 'el-mero',        name: 'Pescadería El Mero (Garrucha)', cat: 'fish', url: 'https://goo.gl/maps/AdJz6SEyGRvLeToDA', lat: 37.1815, lng: -1.8235 },
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
  { id: 'geoda-pulpi',    name: 'Geoda de Pulpí',          cat: 'culture', url: 'https://www.geodapulpi.es', lat: 37.4020, lng: -1.7640 },
  { id: 'cuevas-sorbas',  name: 'Cuevas de Sorbas',        cat: 'culture', url: 'https://www.cuevasdesorbas.com/', lat: 37.0920, lng: -2.0780 },
  { id: 'laguna',         name: 'Laguna de Puerto Rey',    cat: 'culture', lat: 37.2280, lng: -1.7775 },
  { id: 'el-argar',       name: 'Yacimiento prehistórico de El Argar', cat: 'culture', url: 'https://maps.app.goo.gl/dyCfYS3L8qruFVPD9', lat: 37.2520, lng: -1.7760 },
  { id: 'tabernas',       name: 'Desierto de Tabernas',    cat: 'culture', url: 'https://www.tabernas.es/', lat: 37.0540, lng: -2.3880 },
  { id: 'minihollywood',  name: 'MiniHollywood (Oasys)',   cat: 'culture', url: 'https://www.oasysparquetematico.com/', lat: 37.0150, lng: -2.4360 },
  { id: 'aquarium',       name: 'Aquarium Costa de Almería', cat: 'culture', url: 'https://www.aquariumcostadealmeria.com/', lat: 36.7795, lng: -2.5905 },
  { id: 'mariposario',    name: 'Mariposario de Almería',  cat: 'culture', url: 'https://g.co/kgs/meY7kj', lat: 36.7810, lng: -2.5910 },

  // Playas (numeradas según cercanía)
  { id: 'p-cocedores',    name: 'Playa de los Cocedores',   cat: 'beach', url: 'https://goo.gl/maps/pCTJ8y5mt4y4VYkE8', lat: 37.3790, lng: -1.6260 },
  { id: 'p-piedras',      name: 'Piedras de Molino (Algarrobico)', cat: 'beach', url: 'https://goo.gl/maps/eySnjWJp1YcjkSiu9', lat: 37.0200, lng: -1.8730 },
  { id: 'p-muertos',      name: 'Playa de los Muertos',     desc: 'Hay que verla. Bastante gente, pero merece la pena.', cat: 'beach-hard', url: 'https://goo.gl/maps/uh1baJWHPp1uan81A', lat: 37.0050, lng: -1.8800 },
  { id: 'p-enmedio',      name: 'Cala de Enmedio',          desc: 'Nuestra favorita. Desde Aguamarga hay que andar campo a través media hora.', cat: 'beach-hard', url: 'https://goo.gl/maps/i72YXUhFgBzi7vhf6', lat: 36.9540, lng: -1.9740 },
  { id: 'p-isleta',       name: 'La Isleta del Moro',       desc: 'Snorkel y comer en La Ola, junto al mar.', cat: 'beach', url: 'https://maps.google.com?q=Playa+del+Penon+Blanco', lat: 36.7970, lng: -2.0630 },
  { id: 'p-playazo',      name: 'El Playazo de Rodalquilar', desc: 'De fácil acceso y suele gustar mucho.', cat: 'beach', url: 'https://goo.gl/maps/bu6fEsoT1mHC9j2w6', lat: 36.8470, lng: -2.0230 },
  { id: 'p-genoveses',    name: 'Playa de los Genoveses',   desc: 'San José. Hay que dejar el coche antes de la barrera y entrar en autobús.', cat: 'beach', lat: 36.7610, lng: -2.0890 },
  { id: 'p-monsul',       name: 'Playa de Mónsul',          desc: 'San José. Acceso por barrera y bus.', cat: 'beach', lat: 36.7460, lng: -2.1130 },
  { id: 'p-barronal',     name: 'Playa del Barronal',       desc: 'San José. Una de nuestras favoritas.', cat: 'beach', url: 'https://goo.gl/maps/sF2xaKDPrHEgjpxv6', lat: 36.7430, lng: -2.1180 },
  { id: 'p-medialuna',    name: 'Cala de la Media Luna',    desc: 'San José.', cat: 'beach-hard', url: 'https://goo.gl/maps/ngDbWgoBfAdH5x4S8', lat: 36.7415, lng: -2.1195 },

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
        'Hemos puesto cariño en cada detalle de este apartamento. Esperamos estar a la altura.',
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
      intro: 'Sería imposible ofrecer un catálogo completo de recomendaciones sobre los alrededores de Hestía, pues sería infinito. Para ello te recomendamos tres fuentes:',
      sources: [
        'Tienes una pequeña guía de información turística y mapas en el último cajón de la cocina.',
        'TripAdvisor, www.turismodealmeria.org y www.cabogataalmeria.com',
        '¡Pregúntanos! Te ayudaremos con mucho gusto según nuestra experiencia y la de nuestros huéspedes como tú. Te dejamos una pequeña muestra…',
      ],
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
      wifi: { label: 'Contraseña WiFi', value: 'Hestiavera' },
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
        'We\'ve put care into every detail of this apartment. We hope to live up to it.',
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
      intro: 'Offering a complete catalogue of recommendations for the area around Hestía would be endless. We suggest three sources:',
      sources: [
        'A small tourist guide and maps in the bottom drawer of the kitchen.',
        'TripAdvisor, turismodealmeria.org and cabogataalmeria.com',
        'Just ask us! We are happy to help based on our experience and that of guests like you. Here is a small sample…',
      ],
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
      wifi: { label: 'WiFi password', value: 'Hestiavera' },
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

// Contenido específico por apartamento (extraído de los PDFs originales)
const GUIDE_BY_APT = {
  // Hestía Vera Mar
  vm: {
    pdf: 'assets/HestiaVeraMar_GuiaHogar_v1.0.pdf',
    es: {
      rooms: [
        { id: 'salon', title: 'Tu salón', body: 'En tu sofá-cama podrás disfrutar de tu televisión plana donde podrás ver tus contenidos en Netflix, aclimatando la temperatura con el cuadro del aire acondicionado centralizado.', recs: [
          'No dejes el aire acondicionado encendido con las puertas abiertas o cuando no estés en Hestía.',
          'Echa un vistazo a las Normas de uso de Hestía, junto a la puerta de entrada.',
          'Amolda a tu gusto el color y tonalidad de la lámpara de mesa con el mando junto al cuadro del A/C.',
          'Pídenos tu código para usar la alarma durante tu estancia.',
          'Dispones de extintor en el pasillo exterior a Hestía.',
        ]},
        { id: 'cocina', title: 'Tu cocina', body: 'Con todo lo necesario para que tu estancia sea lo más placentera y cómoda posible: mobiliario de gran calidad, electrodomésticos de alta gama, dotación completa de pequeños electrodomésticos y detalles.', recs: [
          'Los libros de instrucciones de los electrodomésticos se encuentran en los cajones bajo la vitrocerámica.',
          'Evita el ciclo económico en lavadora y lavavajillas. Si bien ahorra agua, la duración es excesiva.',
          'El agua es potable, aunque quizás prefieras agua embotellada.',
        ]},
        { id: 'dormitorios', title: 'Tus dormitorios', body: 'Dormitorio principal con vistas al mar, con las mejores sábanas y rellenos nórdicos de plumas o sintéticos. Colchones de alta calidad y almohadas de diferentes durezas. En el armario encontrarás tu sombrilla de playa.', recs: [
          'Las cremas bronceadoras pueden estropear sábanas, toallas y tapicerías.',
          'Cuidado con el aire acondicionado por la noche y las corrientes de aire.',
          'Ponte el despertador un día no muy nublado para ver el amanecer.',
        ]},
        { id: 'banos', title: 'Tus baños', body: 'Dos baños: uno con bañera e hidromasaje y cromoterapia en el espejo, y otro con ducha e hidromasaje. Dispones de productos básicos para tus primeros días, además de aromas, velas, secador, botiquín, etc.', recs: [
          'Haz un uso prudente y responsable del agua. El agua es vida.',
          'Las toallas del baño no son para la playa ni para la piscina.',
          'Cuidado con las cremas y maquillaje. Estropean los textiles del hogar.',
        ]},
        { id: 'terraza', title: 'Tu terraza', body: 'Disfruta de las mejores vistas y los dos ambientes para cada momento de tus vacaciones: día y noche.', recs: [
          'Disfruta de la tranquilidad y permite que tus vecinos también la disfruten.',
          'Mientras estés en la terraza apaga o reduce el A/C.',
          'Recoge el toldo y los cojines cuando sople aire, llueva o vayas a salir.',
          'Usa velas para crear el ambiente perfecto.',
        ]},
        { id: 'urbanizacion', title: 'Tu urbanización', body: 'Una urbanización textil para olvidarse del mundo y cerca de todo. Aparca tu coche en tu plaza subterránea (nº 160) y disfruta de todo lo que Hestía te ofrece: entrada y salida controladas por código, plazas de garaje interiores en la planta -2, zona de parking exterior y portal de acceso peatonal (nº 14, 1.A) en planta 0, piscina y jacuzzi en planta -2, atajo peatonal a la playa y zonas verdes.', recs: [
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
        { id: 'salon', title: 'Your living room', body: 'On your sofa-bed you can enjoy your flat-screen TV — Netflix and your favourite content. The centralised air-conditioning panel is at your disposal.', recs: [
          'Do not leave the air conditioner running with doors open or while you are away from Hestía.',
          'Take a look at Hestía\'s usage guidelines, next to the entrance door.',
          'Adjust colour and tonality of the table lamp with the remote next to the A/C panel.',
          'Ask us for your alarm code to use it during your stay.',
          'A fire extinguisher is in the corridor outside Hestía.',
        ]},
        { id: 'cocina', title: 'Your kitchen', body: 'Everything you need for a comfortable stay: quality furniture, premium appliances and a full set of small appliances and details.', recs: [
          'Appliance manuals are in the drawers under the hob.',
          'Avoid the eco cycle on the washer and dishwasher — water-saving but excessively long.',
          'Tap water is drinkable, but you may prefer bottled.',
        ]},
        { id: 'dormitorios', title: 'Your bedrooms', body: 'Master bedroom with sea view, finest sheets and feather or synthetic duvets. High-quality mattresses and pillows of different firmness. Your beach umbrella is in the closet.', recs: [
          'Tanning creams can ruin sheets, towels and upholstery.',
          'Watch out for night-time A/C and drafts.',
          'Set the alarm one clear morning to catch the sunrise.',
        ]},
        { id: 'banos', title: 'Your bathrooms', body: 'Two bathrooms: one with bathtub, hydromassage and chromotherapy mirror, and another with hydromassage shower. Basic products for your first days, plus scents, candles, hairdryer, first-aid kit, etc.', recs: [
          'Use water responsibly. Water is life.',
          'Bathroom towels are not for the beach or the pool.',
          'Be careful with creams and make-up — they damage textiles.',
        ]},
        { id: 'terraza', title: 'Your terrace', body: 'Enjoy the best views and two atmospheres for every moment of your holiday: day and night.', recs: [
          'Enjoy the quiet — and let your neighbours enjoy it too.',
          'Turn off or reduce the A/C while you are on the terrace.',
          'Roll up the awning and put away cushions when it\'s windy, raining, or you go out.',
          'Use candles to create the perfect atmosphere.',
        ]},
        { id: 'urbanizacion', title: 'Your residential complex', body: 'A textile-free residential complex to forget the world while staying near everything. Park in your underground space (nº 160) and enjoy: code-controlled entrance, indoor parking on floor -2, outdoor parking and pedestrian entrance (nº 14, 1.A) on ground floor, pool and jacuzzi on floor -2, pedestrian shortcut to the beach, and green areas.', recs: [
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
        { id: 'salon', title: 'Tu salón', body: 'En tu sofá-cama podrás disfrutar de tu televisión plana donde podrás ver tus contenidos favoritos en Netflix o HBO. Tienes a tu disposición el cuadro del aire acondicionado centralizado.', recs: [
          'No dejes el aire acondicionado encendido con las puertas abiertas o cuando no estés en casa.',
          'Echa un vistazo a las Normas de uso de Hestía, junto a la puerta de entrada.',
          'Amolda a tu gusto el color y tonalidad de la lámpara de pie con el mando junto al cuadro del A/C.',
          'Si necesitas usar la chimenea eléctrica, que sea mientras estés en Hestía.',
        ]},
        { id: 'cocina', title: 'Tu cocina', body: 'Con todo lo necesario para que tu estancia sea lo más placentera y cómoda posible: mobiliario de gran calidad, electrodomésticos de alta gama, dotación completa de pequeños electrodomésticos y detalles.', recs: [
          'Los libros de instrucciones de los electrodomésticos se encuentran en los cajones bajo la vitrocerámica.',
          'Evita el ciclo económico en lavadora y lavavajillas. Si bien ahorra agua, la duración es excesiva.',
          'El agua es potable, aunque quizás prefieras agua embotellada.',
        ]},
        { id: 'dormitorios', title: 'Tus dormitorios', body: 'Dormitorio principal con vistas al mar y a las palmeras de la urbanización. Colchones de alta calidad y almohadas de diferentes durezas. Sábanas y rellenos nórdicos de plumas o sintéticos.', recs: [
          'Las cremas bronceadoras pueden estropear sábanas, toallas y tapicerías.',
          'Cuidado con el aire acondicionado por la noche y las corrientes de aire.',
          'Si tienes la suerte de ver un amanecer despejado desde la terraza, te recordará por qué viniste.',
        ]},
        { id: 'banos', title: 'Tus baños', body: 'Dos baños con todo el equipamiento de un SPA: cromoterapia, aromaterapia y duchas con hidromasaje. Dispones de productos básicos para tus primeros días, secador, botiquín, etc.', recs: [
          'Haz un uso prudente y responsable del agua. El agua es vida.',
          'Las toallas del baño no son para la playa ni para la piscina.',
          'Cuidado con las cremas y maquillaje. Estropean los textiles del hogar.',
        ]},
        { id: 'terraza', title: 'Tu terraza', body: 'Terraza panorámica de 18 m² con vistas al mar y al Salar de los Canos. El mejor sitio del ático para vivir el ciclo solar completo.', recs: [
          'Disfruta de la tranquilidad y permite que tus vecinos también la disfruten.',
          'Mientras estés en la terraza apaga o reduce el A/C.',
          'Recoge el toldo y los cojines cuando sople aire, llueva o vayas a salir.',
          'Usa velas y la cromoterapia exterior para crear el ambiente perfecto.',
        ]},
        { id: 'urbanizacion', title: 'Tu urbanización', body: 'Conjunto residencial con SPA comunitario (sauna y gimnasio), piscina y pistas de pádel. El SPA está abierto en otoño, invierno y primavera; en verano solo el gimnasio. Aparca tu coche en tu plaza subterránea y disfruta de todo lo que Hestía te ofrece.', recs: [
          'El SPA es comunitario y de uso por turnos — pregúntanos por la disponibilidad.',
          'Las pistas de pádel son comunitarias y se reservan en recepción.',
          'Respeta las zonas comunes y las normas de la urbanización.',
          'No utilices en la piscina las toallas de casa.',
        ]},
      ],
    },
    en: {
      rooms: [
        { id: 'salon', title: 'Your living room', body: 'On your sofa-bed you can enjoy your flat-screen TV — Netflix or HBO. The centralised A/C panel is at your disposal.', recs: [
          'Do not leave the A/C on with doors open or while you are away from home.',
          'Take a look at Hestía\'s usage guidelines, next to the entrance door.',
          'Adjust colour and tonality of the floor lamp with the remote next to the A/C panel.',
          'Use the electric fireplace only while you are at home.',
        ]},
        { id: 'cocina', title: 'Your kitchen', body: 'Everything you need for a comfortable stay: quality furniture, premium appliances and a full set of small appliances and details.', recs: [
          'Appliance manuals are in the drawers under the hob.',
          'Avoid the eco cycle on the washer and dishwasher — water-saving but excessively long.',
          'Tap water is drinkable, but you may prefer bottled.',
        ]},
        { id: 'dormitorios', title: 'Your bedrooms', body: 'Master bedroom with views over the sea and the complex palm trees. Quality mattresses and pillows of different firmness. Finest sheets and feather or synthetic duvets.', recs: [
          'Tanning creams can ruin sheets, towels and upholstery.',
          'Watch out for night-time A/C and drafts.',
          'If you catch a clear sunrise from the terrace, it\'ll remind you why you came.',
        ]},
        { id: 'banos', title: 'Your bathrooms', body: 'Two bathrooms with full SPA equipment: chromotherapy, aromatherapy and hydromassage showers. Basic products for your first days, hairdryer, first-aid kit, etc.', recs: [
          'Use water responsibly. Water is life.',
          'Bathroom towels are not for the beach or the pool.',
          'Be careful with creams and make-up — they damage textiles.',
        ]},
        { id: 'terraza', title: 'Your terrace', body: '18 m² panoramic terrace with sea and Salar de los Canos views. The best spot in the penthouse to live the full solar arc.', recs: [
          'Enjoy the quiet — and let your neighbours enjoy it too.',
          'Turn off or reduce the A/C while you are on the terrace.',
          'Roll up the awning and put away cushions when it\'s windy, raining, or you go out.',
          'Use candles and the outdoor chromotherapy to create the perfect atmosphere.',
        ]},
        { id: 'urbanizacion', title: 'Your residential complex', body: 'Residential complex with shared SPA (sauna and gym), pool and padel courts. The SPA opens in autumn, winter and spring; only the gym stays open in summer. Park in your underground space and enjoy everything Hestía offers.', recs: [
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
        { id: 'salon', title: 'Tu salón', body: 'En tu sofá-cama disfrutarás de tu televisión con ambilight donde podrás ver tus contenidos en streaming como Netflix, aclimatando la temperatura con el cuadro del aire acondicionado centralizado.', recs: [
          'No dejes el aire acondicionado encendido con las puertas abiertas o cuando no estés en Hestía.',
          'Echa un vistazo a las Normas de uso de Hestía, al final de esta misma guía.',
          'Amolda a tu gusto el color y tonalidad de la lámpara de mesa con el mando a la misma.',
          'Pídenos tu código para usar la alarma durante tu estancia.',
        ]},
        { id: 'cocina', title: 'Tu cocina', body: 'Con todo lo necesario para que tu estancia sea lo más placentera y cómoda posible: mobiliario de gran calidad, electrodomésticos de alta gama, dotación completa de pequeños electrodomésticos y detalles.', recs: [
          'Los libros de instrucciones de los electrodomésticos se encuentran en los cajones bajo la vitrocerámica.',
          'Si tienes prisa, evita el ciclo económico en lavadora y lavavajillas. Si bien ahorra agua, la duración es excesiva.',
          'El agua es potable, aunque quizás prefieras agua embotellada.',
        ]},
        { id: 'dormitorios', title: 'Tus dormitorios', body: 'Dormitorios con las mejores sábanas y rellenos nórdicos de plumas. Colchones de alta calidad y almohadas de viscoelástica. En el armario encontrarás tu sombrilla de playa.', recs: [
          'Las cremas bronceadoras pueden estropear sábanas, toallas y tapicerías.',
          'Cuidado con el aire acondicionado por la noche y las corrientes de aire.',
          'Ponte el despertador un día no muy nublado para ver el amanecer.',
        ]},
        { id: 'banos', title: 'Tus baños', body: 'Dos baños: uno con bañera e hidromasaje y cromoterapia en el espejo, y otro con ducha e hidromasaje. Dispones de productos básicos para tus primeros días, además de aromas, velas, secador, botiquín, etc.', recs: [
          'Haz un uso prudente y responsable del agua. El agua es vida.',
          'Las toallas del baño no son para la playa ni para la piscina.',
          'Cuidado con las cremas y maquillaje. Estropean los textiles del hogar.',
        ]},
        { id: 'terraza', title: 'Tu terraza', body: 'Disfruta de las mejores vistas y los dos ambientes para cada momento de tus vacaciones.', recs: [
          'Disfruta de la tranquilidad y permite que tus vecinos también la disfruten.',
          'Mientras estés en la terraza apaga o reduce el A/C.',
          'Recoge el toldo y los cojines cuando sople aire o llueva.',
          'Usa velas para crear el ambiente perfecto.',
        ]},
        { id: 'urbanizacion', title: 'Tu urbanización', body: 'Una urbanización textil para olvidarse del mundo y cerca de todo. Aparca tu coche en tu plaza subterránea (nº 290) y disfruta de todo lo que Hestía te ofrece: entrada y salida controladas por código, acceso/barrera a la zona 2 (donde está Hestía), tu plaza de garaje (nº 290), acceso peatonal desde la urbanización, Hestía Vera Salinas en bloque 22, planta 1, apartamento 7, piscina y pistas deportivas.', recs: [
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
        { id: 'salon', title: 'Your living room', body: 'On your sofa-bed you will enjoy your flat-screen smart TV — Netflix and your favourite streaming content. The centralised air-conditioning panel is at your disposal.', recs: [
          'Do not leave the air conditioner running with doors open or while you are away from Hestía.',
          'Take a look at Hestía\'s usage guidelines, at the end of this guide.',
          'Adjust colour and tonality of the table lamp with the remote next to it.',
          'Ask us for your alarm code to use it during your stay.',
        ]},
        { id: 'cocina', title: 'Your kitchen', body: 'Everything you need for a pleasant and comfortable stay: high-quality furniture, premium appliances and a full set of small appliances and details.', recs: [
          'Appliance manuals are in the drawers under the hob.',
          'In a hurry? Avoid the eco cycle on washer and dishwasher — water-saving but excessively long.',
          'Tap water is drinkable, but you may prefer bottled.',
        ]},
        { id: 'dormitorios', title: 'Your bedrooms', body: 'Bedrooms with the finest sheets and feather or synthetic duvets. Quality mattresses and memory-foam pillows. In the closet you will find your beach umbrella.', recs: [
          'Tanning creams can ruin sheets, towels and upholstery.',
          'Watch out for night-time A/C and drafts.',
          'Set the alarm one clear morning to see the sunrise.',
        ]},
        { id: 'banos', title: 'Your bathrooms', body: 'Two bathrooms: one with bathtub, hydromassage and chromotherapy mirror, and another with hydromassage shower. Basic products for your first days, plus scents, candles, hairdryer, first-aid kit, etc.', recs: [
          'Use water responsibly. Water is life.',
          'Bathroom towels are not for the beach or the pool.',
          'Be careful with creams and make-up — they damage textiles.',
        ]},
        { id: 'terraza', title: 'Your terrace', body: 'Enjoy the best views and two atmospheres for every moment of your holiday.', recs: [
          'Enjoy the quiet — and let your neighbours enjoy it too.',
          'Turn off or reduce the A/C while you are on the terrace.',
          'Roll up the awning and put away cushions when it\'s windy or raining.',
          'Use candles to create the perfect atmosphere.',
        ]},
        { id: 'urbanizacion', title: 'Your residential complex', body: 'A textile-free residential complex to forget the world while staying near everything. Park in your underground space (nº 290) and enjoy everything Hestía offers: code-controlled entrance, access/barrier to zone 2 (where Hestía is), your parking space (nº 290), pedestrian access from the complex, Hestía Vera Salinas at block 22, floor 1, apartment 7, swimming pool and sports courts.', recs: [
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
// GuideMap — mapa Leaflet con marcadores numerados por categoría
// Toggle de categorías en la leyenda; popup con descripción y enlace.
// ================================================================
const GuideMap = ({ places, categories, lang, apt }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markerRefs = React.useRef({});
  const [hidden, setHidden] = React.useState(new Set());

  React.useEffect(() => {
    if (!window.L || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([37.18, -1.95], 9);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const catColor = Object.fromEntries(categories.map(c => [c.id, c.color]));
    const placesNum = places.filter(p => p.lat && p.lng);

    placesNum.forEach((place, i) => {
      const color = catColor[place.cat] || '#666';
      const isHome = place.cat === 'home';
      const num = i + 1;
      const icon = window.L.divIcon({
        className: 'ag-map-marker',
        html: `<div class="ag-map-pin${isHome ? ' is-home' : ''}" style="background:${color}"><span>${isHome ? 'H' : num}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      const marker = window.L.marker([place.lat, place.lng], { icon }).addTo(map);
      const desc = place.desc || '';
      const tier = place.tier ? ` <em>${place.tier}</em>` : '';
      const url  = place.url
        ? `<br><a href="${place.url}" target="_blank" rel="noopener">${lang === 'es' ? 'Abrir en mapa →' : 'Open in maps →'}</a>`
        : '';
      marker.bindPopup(`<div class="ag-map-popup"><strong>${place.name}</strong>${tier}${desc ? `<br>${desc}` : ''}${url}</div>`);
      marker.placeData = place;
      markerRefs.current[place.id] = marker;
    });

    // Auto-fit bounds to markers (excluding the home if it would zoom too tight)
    if (placesNum.length > 1) {
      const bounds = window.L.latLngBounds(placesNum.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRefs.current = {};
    };
  }, []);

  // Mantenemos los markers SIEMPRE en el mapa y simplemente alternamos una
  // clase CSS en el ícono — así la opacity y el scale animan vía transition.
  const applyHidden = (next) => {
    setHidden(next);
    Object.values(markerRefs.current).forEach(m => {
      if (!m.placeData) return;
      const el = m.getElement && m.getElement();
      if (!el) return;
      el.classList.toggle('is-hidden-cat', next.has(m.placeData.cat));
    });
  };
  const toggleCat = (catId) => {
    const next = new Set(hidden);
    if (next.has(catId)) next.delete(catId);
    else next.add(catId);
    applyHidden(next);
  };
  const showAll = () => applyHidden(new Set());
  const hideAllExceptHome = () => {
    const next = new Set(categories.filter(c => c.id !== 'home').map(c => c.id));
    applyHidden(next);
  };

  // Count places per category for the legend chips
  const counts = {};
  places.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });

  return (
    <div className="ag-map-block no-print">
      <div ref={mapRef} className="ag-map" aria-label={lang === 'es' ? 'Mapa de la zona' : 'Area map'} />
      <div className="ag-map-legend">
        <div className="ag-map-legend-head">
          <span className="ag-map-legend-title">
            {lang === 'es' ? 'Filtra por tipo' : 'Filter by type'}
          </span>
          <div className="ag-map-legend-actions">
            <button type="button" className="ag-map-legend-action" onClick={showAll}>
              {lang === 'es' ? 'Mostrar todos' : 'Show all'}
            </button>
            <span className="ag-map-legend-sep" aria-hidden="true">·</span>
            <button type="button" className="ag-map-legend-action" onClick={hideAllExceptHome}>
              {lang === 'es' ? 'Ocultar todos' : 'Hide all'}
            </button>
          </div>
        </div>
        <div className="ag-map-legend-list">
          {categories.filter(c => counts[c.id]).map(c => (
            <button
              key={c.id}
              type="button"
              className={`ag-map-legend-chip${hidden.has(c.id) ? ' is-off' : ''}`}
              onClick={() => toggleCat(c.id)}
              aria-pressed={!hidden.has(c.id)}
            >
              <span className="ag-map-legend-dot" style={{ background: c.color }} />
              <span>{c[lang]}</span>
              <span className="ag-map-legend-count">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// AptGuideView — guía integrada en la página del apartamento
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

  // Reveal-on-scroll para fotos y números de sección.
  // Stagger via --i en photos. Una sola pasada (unobserve al primer hit).
  React.useEffect(() => {
    const targets = document.querySelectorAll('.apt-guide-view .ag-photo, .apt-guide-view .ag-section-num');
    if (!targets.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.setAttribute('data-revealed', 'true');
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [a]);

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
            <div className="ag-photo-wrap">
              <img src={p.src} alt={p.caption || ''} loading="lazy" />
              {HasMark && <WatermarkBadge size={28} pos={{ bottom: 10, right: 10 }} />}
            </div>
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
            <span>{lang === 'es' ? 'Volver al apartamento' : 'Back to apartment'}</span>
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

            <GuideMap places={PLACES} categories={CATEGORIES} lang={lang} apt={apt} />

            <h3 className="ag-h3">{lang === 'es' ? 'Fuentes recomendadas' : 'Recommended sources'}</h3>
            <ol className="ag-recs">
              {s.surroundings.sources.map((r, i) => <li key={i}>{r}</li>)}
            </ol>

            {CATEGORIES.filter(c => c.id !== 'home').map(cat => {
              const inCat = PLACES.filter(p => p.cat === cat.id);
              if (!inCat.length) return null;
              return (
                <div key={cat.id} className="ag-cat-group">
                  <h3 className="ag-h3 ag-cat-h">
                    <span className="ag-cat-dot" style={{ background: cat.color }} aria-hidden="true" />
                    {cat[lang]}
                    <span className="ag-cat-count">{inCat.length}</span>
                  </h3>
                  <ul className="ag-places">
                    {inCat.map(p => (
                      <li key={p.id} className="ag-place">
                        <div className="ag-place-main">
                          <span className="ag-place-name">{p.name}</span>
                          {p.tier && <span className="ag-place-tier">{p.tier}</span>}
                        </div>
                        {p.desc && <span className="ag-place-desc">{p.desc}</span>}
                        {p.url && (
                          <a className="ag-place-link" href={p.url} target="_blank" rel="noopener">
                            {lang === 'es' ? 'Abrir mapa' : 'Open map'} <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
              <span>{lang === 'es' ? 'Volver al apartamento' : 'Back to apartment'}</span>
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
              ? 'Recomendaciones del barrio, restaurantes, calas, instrucciones del apartamento y todo lo que necesitas para tu estancia. Reservada para huéspedes con PIN.'
              : 'Neighbourhood recommendations, restaurants, coves, apartment instructions and everything you need for your stay. Reserved for guests with a PIN.'}
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
