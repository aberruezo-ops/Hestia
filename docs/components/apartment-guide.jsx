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
    dormitorios:  [1, 2, 3, 11, 12],      // + cama-2 naranja (12) + cama-2 horizontal (13)
    banos:        [6, 13, 14, 15],         // + ducha (14) + lavabo redondo (15) + grifo (16)
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
  { id: 'llegada',      es: 'Llegada y salida', en: 'Arrival & departure' },
  { id: 'wifi',         es: 'Mi WiFi',          en: 'My WiFi' },
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
  { id: 'sabores',      es: 'Sabores',          en: 'Tastes' },
  { id: 'pueblos',      es: 'Pueblos y cultura', en: 'Towns & culture' },
  { id: 'mar-playas',   es: 'Mar y playas',     en: 'Sea & beaches' },
  { id: 'actividades',  es: 'Actividades y planes', en: 'Activities & plans' },
  { id: 'mercados',     es: 'Mercados y compras', en: 'Markets & shops' },
  { id: 'movilidad',    es: 'Gasolineras y carga eléctrica', en: 'Fuel & EV charging' },
  { id: 'telefonos',    es: 'Teléfonos',        en: 'Useful phones' },
  { id: 'feedback',     es: 'Comentarios',      en: 'Feedback' },
];

// Mapeo de qué categorías van en cada sección temática.
// El bloque 'alrededores' queda solo con intro/mapa/fuentes oficiales.
const SECTION_CATS = {
  sabores:     ['restaurant', 'bar', 'fish', 'super', 'celiac'],
  pueblos:     ['town', 'culture', 'bookshop'],
  'mar-playas':['beach', 'beach-hard', 'beach-srvc', 'beach-nude', 'beach-dog'],
  actividades: ['activity', 'sport'],
  mercados:    ['market'],
  movilidad:   ['fuel', 'ev-charge'],
};

// ----- Categorías de lugares (icono + color brand + etiqueta bilingüe) -----
// Color: 1 token de la paleta corporativa por categoría. Icono: emoji
// neutro que ya forma parte del set Unicode (sin assets externos).
const CATEGORIES = [
  { id: 'home',        es: 'Hestía',                 en: 'Hestía',                color: 'var(--ber-dk)',  icon: '🏠' },
  { id: 'restaurant',  es: 'Restaurantes',           en: 'Restaurants',           color: 'var(--vt)',      icon: '🍽️' },
  { id: 'celiac',      es: 'Restaurantes celíacos',  en: 'Gluten-free dining',    color: 'var(--vt2)',     icon: '🌾' },
  { id: 'bar',         es: 'Copas y chiringuitos',   en: 'Bars & beach bars',     color: 'var(--vs)',      icon: '🍹' },
  { id: 'beach',       es: 'Playas',                 en: 'Beaches',               color: 'var(--sol)',     icon: '🏖️' },
  { id: 'beach-dog',   es: 'Playas para perros',     en: 'Dog-friendly beaches',  color: 'var(--vm)',      icon: '🐕' },
  { id: 'beach-nude',  es: 'Playas naturistas',      en: 'Naturist beaches',      color: 'var(--bug)',     icon: '🌞' },
  { id: 'beach-srvc',  es: 'Playas con servicios',   en: 'Beaches with services', color: 'var(--tur)',     icon: '🛟' },
  { id: 'beach-hard',  es: 'Playas de difícil acceso', en: 'Hard-access beaches', color: 'var(--vio)',     icon: '🧗' },
  { id: 'super',       es: 'Supermercados',          en: 'Supermarkets',          color: 'var(--vm2)',     icon: '🛒' },
  { id: 'fish',        es: 'Producto fresco · pescado, carne, pan',  en: 'Fresh produce · fish, meat, bread', color: 'var(--sol-text)', icon: '🐟' },
  { id: 'pharmacy',    es: 'Farmacias',              en: 'Pharmacies',            color: 'var(--alb)',     icon: '💊' },
  { id: 'health',      es: 'Centros de salud',       en: 'Health centres',        color: 'var(--err)',     icon: '⚕️' },
  { id: 'activity',    es: 'Actividades',            en: 'Activities',            color: 'var(--vs2)',     icon: '⛵' },
  { id: 'sport',       es: 'Deporte y aventura',     en: 'Sports & adventure',    color: 'var(--err)',     icon: '⚡' },
  { id: 'town',        es: 'Pueblos',                en: 'Towns',                 color: 'var(--vt-dk)',   icon: '🏘️' },
  { id: 'culture',     es: 'Lugares de interés',     en: 'Places of interest',    color: 'var(--sol-h)',   icon: '🏛️' },
  { id: 'bookshop',    es: 'Librerías',              en: 'Bookshops',             color: 'var(--sie)',     icon: '📚' },
  { id: 'market',      es: 'Mercadillos',            en: 'Street markets',        color: 'var(--vs-dk)',   icon: '🧺' },
  { id: 'fuel',        es: 'Gasolineras',            en: 'Petrol stations',       color: 'var(--ber-lt)',  icon: '⛽' },
  { id: 'ev-charge',   es: 'Puntos de carga eléctrica', en: 'EV charging points', color: 'var(--teal-dk)', icon: '🔌' },
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
  { id: 'coviran',        name: 'Covirán', desc: 'El más cercano (pequeño, andando), junto al hotel Vera Playa. Para básicos sin coger el coche.', cat: 'super', lat: 37.2235, lng: -1.7975 },
  { id: 'consum',         name: 'Consum (Vera Playa)', desc: 'Supermercado mediano a 5 min en coche. Sorpresa: tiene un buen surtido de productos británicos (cereales, salsas, té, alubias Heinz) por la afluencia inglesa de la zona.', specialty: 'estantería de productos UK — Marmite, Yorkshire Tea, baked beans, salsas Branston, mince pies en Navidad.', cat: 'super', url: 'https://goo.gl/maps/h6UvnBe3ATHpsPXbA', lat: 37.2200, lng: -1.8090, featured: true },
  { id: 'mercadona',      name: 'Mercadona Vera Playa', desc: 'Mercadona estándar a 5 min en coche. El más completo de la zona.', cat: 'super', url: 'https://goo.gl/maps/axi9Lb9xLp8yuVUR8', lat: 37.2360, lng: -1.7935, featured: true },
  { id: 'super-vera',     name: 'Vera pueblo (Dia · Lidl · Mercadona)', desc: 'Supermercados grandes en Vera pueblo, a 10 min en coche.', cat: 'super', lat: 37.2491, lng: -1.8639, featured: true },
  // Supermercados británicos / internacionales — para huéspedes UK que echen de menos lo de casa
  { id: 'iceland-vera',   name: 'Iceland Overseas (Vera Playa)', desc: 'Supermercado británico junto al complejo Vera Natura. Productos congelados, ready meals, té, salsas y dulces típicos de UK.', specialty: 'fish & chips congelados, Yorkshire puddings, scotch eggs, productos M&S y Tesco.', tip: 'Imprescindible para huéspedes ingleses con nostalgia. Hablan inglés en caja.', cat: 'super', lat: 37.2380, lng: -1.7895, featured: true },
  { id: 'quicksave',      name: 'Quicksave Britannia (Mojácar)', desc: 'Supermercado británico clásico de la Costa Almería. Surtido amplio de marcas UK que no encuentras en supermercado español.', specialty: 'embutidos ingleses (sausages, bacon Wiltshire), pasteles, panes especiales, repostería casera.', cat: 'super', lat: 37.1450, lng: -1.8540 },
  { id: 'aldi-vera',      name: 'Aldi (Vera pueblo)', desc: 'Cadena alemana low-cost. En Vera pueblo, a unos 10 min en coche desde Vera Playa.', specialty: 'productos alemanes (cerveza, embutidos, dulces) y precios bajos en básicos.', cat: 'super', lat: 37.2491, lng: -1.8639 },

  // Librerías
  { id: 'nobel',          name: 'Nobel', desc: 'Librería en Vera.', cat: 'bookshop', lat: 37.2491, lng: -1.8639 , featured: true },
  { id: 'macondo',        name: 'Macondo', desc: 'Librería en Mojácar.', cat: 'bookshop', lat: 37.1377, lng: -1.8523 , featured: true },

  // Restaurantes
  { id: 'riad-cabrera',   name: 'Riad Cabrera',     desc: 'Marroquí en Sierra Cabrera. Carretera de montaña, pero merece muchísimo la pena.', specialty: 'tagine de cordero con ciruelas, pastilla de pichón y té con menta en la terraza al atardecer.', tip: 'Reserva con tiempo y sube con luz: las curvas tienen su gracia, pero de noche cuestan.', tier: '€€€', cat: 'restaurant', rating: 4.6, lat: 37.1550, lng: -1.8700 , featured: true },
  { id: 'juan-moreno',    name: 'Juan Moreno',       desc: 'Sofisticado. Cocina de autor en Vera pueblo.', specialty: 'menú degustación con producto local, atún rojo de almadraba y arroces secos.', tier: '€€€', cat: 'restaurant', rating: 4.5, lat: 37.2495, lng: -1.8623 , featured: true },
  { id: 'terraza-carmona',name: 'Terraza Carmona',   desc: 'Cocina española moderna en Vera pueblo. Casa con historia.', specialty: 'gurullos con conejo y caldero de pescado; postres caseros.', tier: '€€',  cat: 'restaurant', rating: 4.5, lat: 37.2486, lng: -1.8635 },
  { id: 'gateway-india',  name: 'Gateway to India',  desc: 'Hindú. Bueno y barato.',                   specialty: 'cordero rogan josh, pollo tikka masala y pan naan de ajo.', tier: '€',   cat: 'restaurant', rating: 4.2, lat: 37.2230, lng: -1.8090 },
  { id: 'pomodoro',       name: 'Pizzería Pomodoro', desc: 'A pie de playa.',                          specialty: 'pizza al horno de leña — la diavola y la quattro formaggi salen siempre.', tier: '€€',  cat: 'restaurant', rating: 4.3, lat: 37.2270, lng: -1.7920 },
  { id: 'trattoria',      name: 'La Trattoria da Marco', desc: 'Garrucha. Las pizzas están geniales.', specialty: 'pizza calzone, pasta a la carbonara auténtica y tiramisú.', tier: '€',   cat: 'restaurant', rating: 4.4, lat: 37.1810, lng: -1.8230 },
  { id: 'lua',            name: 'Lúa',               desc: 'Sofisticado. Mejor para cena o copa.',     specialty: 'tartar de atún rojo, croquetas de gamba roja y carrillera al PX.', tip: 'Reserva mesa fuera al atardecer; la carta de cócteles está a la altura.', tier: '€€€', cat: 'restaurant', rating: 4.5, lat: 37.2310, lng: -1.7935 , featured: true },
  { id: 'bistro',         name: 'The Bistro',        desc: 'Bastante bien.',                            specialty: 'entrecot a la parrilla y ensalada de burrata.', tier: '€€',  cat: 'restaurant', rating: 4.3, lat: 37.2310, lng: -1.7945 },
  { id: 'koa',            name: 'Resto Bar Koa',     desc: 'Frente a Hestía Vera Mar. Bocados pensados, ambiente cercano.', specialty: 'bao de panceta, ceviche del día y poke bowl.', tier: '€€',  cat: 'restaurant', rating: 4.5, lat: 37.2245, lng: -1.7965 , featured: true },
  { id: 'bbme-rest',      name: 'Restaurante Bbme Palomares', desc: 'En plena playa, a 10 min a pie.',  specialty: 'arroz negro con sepia y all i oli, sardinas a la espalda.', tier: '€€',  cat: 'restaurant', rating: 4.4, lat: 37.2155, lng: -1.7800 },
  { id: 'playa-azul',     name: 'Hostal Playa Azul', desc: 'Villaricos. Excelente paella con bogavante.', specialty: 'paella con bogavante (encargar al reservar), gambas blancas de Garrucha.', tip: 'Pide la paella al hacer la reserva — la preparan al momento.', tier: '€€', cat: 'restaurant', rating: 4.5, lat: 37.2460, lng: -1.7660 , featured: true },
  { id: 'tadeo',          name: 'Tadeo',             desc: 'Villaricos. Cocina de mar con producto del día.', specialty: 'arroz con bogavante, tostas de ahumados y pulpo a la brasa.', tier: '€€', cat: 'restaurant', rating: 4.4, lat: 37.2455, lng: -1.7670 , featured: true },
  { id: 'rincon-puerto',  name: 'Rincón del Puerto (Garrucha)', desc: 'Junto a la lonja de Garrucha. Marisco fresquísimo y ambiente de pueblo pesquero.', specialty: 'camarones crudos de Garrucha (imprescindibles), gamba roja a la plancha y quisquilla viva.', tip: 'Pide los camarones crudos según vienen del barco — no hay nada igual en la zona.', tier: '€€€', cat: 'restaurant', lat: 37.1818, lng: -1.8235, featured: true },
  { id: 'almadraba',      name: 'La Almadraba (Garrucha)', desc: 'Garrucha. Vista al puerto, especializado en pescado de la lonja.', specialty: 'gamba roja de Garrucha, lubina a la sal y arroz caldoso de marisco.', tier: '€€€', cat: 'restaurant', lat: 37.1822, lng: -1.8232 },
  { id: 'rosado',         name: 'Freiduría Bar Rosado', desc: 'Buenas referencias.',                    specialty: 'fritura mixta de pescado y boquerones rebozados.', tier: '€€',  cat: 'restaurant', rating: 4.3, lat: 37.2240, lng: -1.8095 },
  { id: 'av-alicante',    name: 'Av. Ciudad de Alicante', desc: 'Detrás del Consum: pubs, comida rápida y más.',     cat: 'restaurant', lat: 37.2196, lng: -1.8082 },
  { id: 'valentino',      name: 'Ristorante di Valentino', desc: 'Mojácar.',                            specialty: 'pasta fresca casera — los ravioli de espinacas y la lasagna.', tier: '€€',  cat: 'restaurant', rating: 4.3, lat: 37.1377, lng: -1.8523 },
  { id: 'cabo-norte',     name: 'Cabo Norte',        desc: 'Mojácar. Buena materia prima a buen precio.', specialty: 'gambas al ajillo (imprescindibles), chuletón de vaca madurada, pulpo a la gallega y croquetas caseras.', tier: '€€',cat: 'restaurant', rating: 4.5, lat: 37.1370, lng: -1.8530 },
  { id: 'neptuno',        name: 'Restaurante Neptuno', desc: 'Mojácar. Buen pescado.',                  specialty: 'pescado del día a la sal, fideuá y arroz caldoso.', tier: '€€',  cat: 'restaurant', rating: 4.3, lat: 37.1360, lng: -1.8520 },
  { id: 'martin-fierro',  name: 'Asador Martín Fierro', desc: 'Rodalquilar. Asador argentino dentro del Parque Natural.', specialty: 'parrillada argentina, entraña, mollejas y empanadas criollas.', tip: 'Mesa fuera en primavera/otoño — el cielo de Cabo de Gata vale por sí solo.', tier: '€€€', cat: 'restaurant', rating: 4.6, lat: 36.8475, lng: -2.0395 , featured: true },
  { id: 'oro-luz',        name: 'Oro y Luz',         desc: 'Rodalquilar. Cocina creativa con producto del Parque.', specialty: 'menú degustación de temporada con verduras del huerto y pescado de Carboneras.', tier: '€€€', cat: 'restaurant', rating: 4.5, lat: 36.8480, lng: -2.0400 },
  { id: 'la-villa',       name: 'La Villa',          desc: 'Aguamarga. Mediterráneo elegante a pie de pueblo.', specialty: 'risotto de gambas, atún rojo a la parrilla y postre de chocolate templado.', tier: '€€€', cat: 'restaurant', rating: 4.5, lat: 36.9395, lng: -2.0000 },
  { id: 'maruja',         name: 'Chiringuito Maruja', desc: 'Vera Playa. A pie de arena, ambiente sin pretensiones.', specialty: 'pescaíto frito, ensaladilla de la casa y sardinas al espeto en verano.', tier: '€€', cat: 'restaurant', rating: 4.3, lat: 37.2310, lng: -1.7920 },

  // ── Top-rated por Google en la zona (≥4.5 estrellas) ─────────
  // Mojácar
  { id: 'titos-mojacar',  name: "Tito's (Mojácar)",  desc: 'Mojácar Pueblo. Tapas y carta tradicional con producto local. Imprescindible.', specialty: 'rabo de toro, croquetas de jamón y atún encebollado.', tip: 'Reserva con días de antelación en verano — siempre llena.', tier: '€€', rating: 4.6, cat: 'restaurant', lat: 37.1380, lng: -1.8523, featured: true },
  { id: 'acebuche',       name: 'El Acebuche (Mojácar)', desc: 'Recomendado por Guía Repsol y Bib Gourmand. Cocina almeriense actualizada.', specialty: 'menú degustación con producto de proximidad — pescados de Garrucha y verduras del huerto.', tier: '€€€', rating: 4.7, cat: 'restaurant', lat: 37.1373, lng: -1.8519, featured: true },
  { id: 'almirez',        name: 'El Almirez (Mojácar)', desc: 'Mojácar Pueblo. Cocina mediterránea elegante con terraza con vistas.', specialty: 'arroz meloso de bogavante y solomillo a la brasa.', tier: '€€€', rating: 4.6, cat: 'restaurant', lat: 37.1378, lng: -1.8525 },
  // Vera pueblo
  { id: 'casa-egea',      name: 'Casa Egea (Vera)',  desc: 'Vera pueblo. Cocina tradicional con producto del Levante almeriense.', specialty: 'fritura de pescaíto, arroz a banda y postres caseros.', tier: '€€', rating: 4.6, cat: 'restaurant', lat: 37.2494, lng: -1.8631 },
  { id: 'regio-restaurante', name: 'Regio (Vera)',   desc: 'Vera pueblo. Casa de comidas con platos de cuchara y arroces.', specialty: 'olla de trigo, gurullos con conejo y arroz caldoso.', tier: '€€', rating: 4.5, cat: 'restaurant', lat: 37.2487, lng: -1.8637 },
  // Garrucha
  { id: 'almejero',       name: 'El Almejero (Garrucha)', desc: 'Garrucha. Frente al puerto, especialista en marisco y arroces. Bib Gourmand.', specialty: 'arroz caldoso con bogavante, gamba roja a la plancha y almejas a la marinera.', tip: 'Mejor a mediodía con la luz del puerto.', tier: '€€€', rating: 4.6, cat: 'restaurant', lat: 37.1820, lng: -1.8240, featured: true },
  // Cabo de Gata · San José y alrededores
  { id: 'gallineta',      name: 'La Gallineta (Pozo de los Frailes)', desc: 'Pozo de los Frailes. Uno de los más reputados del Parque Natural. Reserva imprescindible.', specialty: 'menú degustación de pescado del día y atún rojo de almadraba.', tip: 'Reserva con 1-2 semanas de antelación en temporada.', tier: '€€€', rating: 4.7, cat: 'restaurant', lat: 36.7860, lng: -2.0900, featured: true },
  { id: '4nudos',         name: '4 Nudos (San José)', desc: 'San José. Cocina creativa con producto del mar de Cabo de Gata.', specialty: 'tartar de atún, ceviche de corvina y arroz negro.', tier: '€€€', rating: 4.6, cat: 'restaurant', lat: 36.7670, lng: -2.1080 },
  { id: 'casa-miguel-sj', name: 'Casa Miguel (San José)', desc: 'San José. Clásico de pescado y marisco a buen precio.', specialty: 'fritura de pescaíto, arroz marinero y gamba roja.', tier: '€€', rating: 4.5, cat: 'restaurant', lat: 36.7665, lng: -2.1075 },
  // Carboneras / Agua Amarga
  { id: 'chumbera',       name: 'Asador La Chumbera (Sopalmo)', desc: 'Entre Mojácar y Agua Amarga. Cocina al fuego con vistas espectaculares al mar.', specialty: 'cordero al horno de leña, lubina a la sal y chuletón de ternera.', tip: 'Atardecer en la terraza — una de las mejores panorámicas de la costa.', tier: '€€€', rating: 4.6, cat: 'restaurant', lat: 37.0410, lng: -1.8810, featured: true },
  // Almería capital
  { id: 'joseba-anorga',  name: 'Joseba Añorga (Almería capital)', desc: 'Cocina vasca-mediterránea de autor. Recomendado por Guía Michelin.', specialty: 'menú degustación con producto de mercado, pescados a la brasa.', tier: '€€€€', rating: 4.7, cat: 'restaurant', lat: 36.8395, lng: -2.4635, featured: true },
  { id: 'casa-puga',      name: 'Casa Puga (Almería capital)', desc: 'Histórica taberna fundada en 1870. Templo de la tapa almeriense.', specialty: 'tapas tradicionales — caracoles, ensaladilla y tortilla del Sacromonte.', tip: 'Sin reservas — llega antes de las 13:30 o sobre las 20:00 para evitar cola.', tier: '€€', rating: 4.5, cat: 'restaurant', lat: 36.8395, lng: -2.4633, featured: true },
  { id: 'tetería',        name: 'Tetería Almedina (Almería capital)', desc: 'Barrio Almedina. Cocina marroquí auténtica en el casco antiguo.', specialty: 'tagine de cordero, cuscús casero y té con menta.', tier: '€€', rating: 4.6, cat: 'restaurant', lat: 36.8400, lng: -2.4690 },
  { id: 'torreluz-med',   name: 'Torreluz Mediterráneo (Almería capital)', desc: 'En Plaza Flores. Cocina mediterránea con producto de mercado.', specialty: 'arroces marineros, atún rojo y carrillera de ternera.', tier: '€€€', rating: 4.5, cat: 'restaurant', lat: 36.8392, lng: -2.4625 },
  { id: 'salmantice',     name: 'Salmantice (Almería capital)', desc: 'Asador castellano-leonés. Carnes a la brasa de primera.', specialty: 'chuletón de buey, lechazo asado y embutidos ibéricos.', tier: '€€€', rating: 4.5, cat: 'restaurant', lat: 36.8378, lng: -2.4602 },
  // Murcia · Cartagena, Lorca, Águilas
  { id: 'magoga',         name: 'Magoga (Cartagena)', desc: 'Cartagena. ⭐ Estrella Michelin. Cocina murciana de alta gama.', specialty: 'menú degustación con producto del Mar Menor y huerta murciana.', tip: 'Reserva con 3-4 semanas — es de lo mejor del Sureste.', tier: '€€€€', rating: 4.7, cat: 'restaurant', lat: 37.6017, lng: -0.9886, featured: true },
  { id: 'marquesita',     name: 'La Marquesita (Cartagena)', desc: 'Cartagena. Clásico imprescindible junto al teatro romano.', specialty: 'caldero del Mar Menor, dorada a la sal y arroz con bogavante.', tier: '€€€', rating: 4.5, cat: 'restaurant', lat: 37.6030, lng: -0.9870 },
  { id: 'san-roque',      name: 'El Barrio de San Roque (Cartagena)', desc: 'Cartagena. Cocina tradicional con producto de la lonja.', specialty: 'michirones, marineras y arroz caldero.', tier: '€€', rating: 4.5, cat: 'restaurant', lat: 37.6042, lng: -0.9905 },
  { id: 'el-faro-aguilas',name: 'El Faro (Águilas)', desc: 'Águilas. A pie de puerto. Famoso por el arroz caldero murciano.', specialty: 'arroz caldero, salmonete y dorada a la sal.', tier: '€€€', rating: 4.6, cat: 'restaurant', lat: 37.4070, lng: -1.5790, featured: true },
  { id: 'juan-mari',      name: 'Juan Mari (Águilas)', desc: 'Águilas. Cocina marinera con producto del día.', specialty: 'lubina al horno, arroces y mariscada.', tier: '€€€', rating: 4.5, cat: 'restaurant', lat: 37.4065, lng: -1.5810 },
  { id: 'casino-lorca',   name: 'Asador Casino de Lorca', desc: 'Lorca. Comedor histórico dentro del Casino. Cocina murciana actualizada.', specialty: 'arroces secos, cordero segureño y verduras de la huerta.', tier: '€€€', rating: 4.5, cat: 'restaurant', lat: 37.6770, lng: -1.7000 },

  // Restaurantes celíacos (con menú o platos sin gluten certificados)
  { id: 'celiac-near',    name: 'Cerca de Hestía: Lúa, Chiringuito Maruja, Pizzería Memoli', desc: 'Andando o en 5 min en coche.', specialty: 'En Memoli pizza con base sin gluten; en Lúa el tartar y los pescados de la pizarra.', tip: 'Avisa al reservar — preparan utensilios separados.', cat: 'celiac', lat: 37.2240, lng: -1.7980, featured: true },
  { id: 'boracay',        name: 'Boracay (Garrucha)', desc: 'Mediterráneo a pie del puerto.', specialty: 'arroces y pescados de la lonja sin gluten.', cat: 'celiac', lat: 37.1810, lng: -1.8230 },
  { id: 'kontiki',        name: 'Mojácar: Cabo Norte, Neptuno, Kontiki', desc: 'Tres opciones seguras en el paseo de Mojácar.', specialty: 'Kontiki tiene carta sin gluten amplia; Neptuno controla muy bien el pescado.', cat: 'celiac', lat: 37.1377, lng: -1.8523, featured: true },
  { id: 'regio',          name: 'Vera pueblo: Juan Moreno, Terraza Carmona, Regio', desc: 'En el centro de Vera: tres clásicos con opciones sin gluten.', specialty: 'En Regio los gurullos y la olla de trigo; en Juan Moreno menú degustación adaptado bajo aviso.', tip: 'Reserva avisando — la cocina los prepara con cubiertos limpios.', cat: 'celiac', lat: 37.2491, lng: -1.8639, featured: true },
  { id: 'celiac-asoc',    name: 'Asociación de Celíacos de Almería', desc: 'Listado actualizado de restaurantes y obradores certificados.', cat: 'celiac', url: 'https://celiacosalmeria.es', lat: 36.8350, lng: -2.4630 },

  // Copas y chiringuitos
  { id: 'turquesa',       name: 'Chiringuito Playa Turquesa', desc: 'Andando desde casa. Ambiente familiar de día, copas al atardecer.', specialty: 'mojito de menta del huerto y tabla de quesos al sol.', cat: 'bar', rating: 4.3, lat: 37.2260, lng: -1.7935 , featured: true },
  { id: 'paraiso',        name: 'Paraíso Vera Beach', desc: 'Andando desde casa. Música chill desde media tarde.',         specialty: 'gin tonics premium y picoteo de tapeo mediterráneo.', cat: 'bar', rating: 4.3, lat: 37.2300, lng: -1.7920 },
  { id: 'chumbo',         name: 'Chiringuito El Chumbo', desc: 'Andando desde casa. El más relajado del paseo.',      specialty: 'sangría de cava, sardinas al espeto en verano y arroz del día.', cat: 'bar', rating: 4.2, lat: 37.2360, lng: -1.7895 },
  { id: 'marau',          name: 'Marau Beach Club',  desc: 'Beach club con DJ y zona de hamacas vista mar.',                                          specialty: 'cócteles de autor y carta asiática (poke, bao, tartar).', tip: 'Mejor reservar hamaca en julio-agosto; los atardeceres con DJ valen la pena.', cat: 'bar', rating: 4.4, lat: 37.2410, lng: -1.7895 , featured: true },
  { id: 'mar-arena',      name: 'Chiringuito Mar y Arena', desc: 'Pequeño y muy local, a pie de arena.',                                    specialty: 'caña fría, paella los domingos y boquerones en vinagre.', cat: 'bar', rating: 4.2, lat: 37.2335, lng: -1.7910 },
  { id: 'bbme-palomares', name: 'Bbme Palomares', desc: 'En plena playa, a 10 min a pie. Vistas amplias al Mediterráneo.',     specialty: 'spritz al atardecer, ostras y tapeo gourmet.', tip: 'Vete andando por la orilla al atardecer y vuelve en taxi: la luz vale la caminata.', cat: 'bar', rating: 4.4, lat: 37.2155, lng: -1.7800 , featured: true },
  { id: 'lebreros',       name: 'Los Lebreros (Garrucha puerto)', desc: 'Caña, marisco y vista al puerto pesquero.', specialty: 'gambas blancas, quisquilla viva y conchas finas.', tip: 'Ir sobre las 19:00 cuando atracan los barcos.', cat: 'bar', rating: 4.4, lat: 37.1820, lng: -1.8235, featured: true },
  // ── Bares top-rated por Google ───────────────────────────────
  // Mojácar pueblo
  { id: 'cantares',       name: 'Cantares (Mojácar Pueblo)', desc: 'Plaza Nueva. Terraza con vistas al valle, ambiente bohemio.', specialty: 'vermut con tapa, tabla ibérica y cócteles al atardecer.', tip: 'Reserva mesa con vistas al valle — el atardecer es brutal.', rating: 4.5, cat: 'bar', lat: 37.1380, lng: -1.8525, featured: true },
  { id: 'mandala',        name: 'Mandala (Mojácar Pueblo)', desc: 'Coctelería de autor en el casco antiguo.', specialty: 'gin tonics premium y mezcales mexicanos.', rating: 4.5, cat: 'bar', lat: 37.1378, lng: -1.8522 },
  // Vera
  { id: 'cafe-bahia',     name: 'Café Bahía (Vera pueblo)', desc: 'Plaza Mayor. Aperitivo clásico con tapa.', specialty: 'caña con tapa de jamón ibérico de la zona.', rating: 4.4, cat: 'bar', lat: 37.2491, lng: -1.8639 },
  // San José
  { id: 'sahara-sj',      name: 'Bar Sahara (San José)', desc: 'San José. Música en vivo y ambiente de Cabo de Gata.', specialty: 'cervezas artesanas locales y tapas marineras.', rating: 4.5, cat: 'bar', lat: 36.7665, lng: -2.1080 },
  // Almería capital
  { id: 'la-mala',        name: 'La Mala (Almería capital)', desc: 'Centro histórico. Coctelería referente de la capital.', specialty: 'cócteles de autor — Negroni clarificado, Old Fashioned con PX.', tip: 'Mejor a partir de las 22:00; antes está más tranquilo.', rating: 4.7, cat: 'bar', lat: 36.8395, lng: -2.4625, featured: true },
  { id: 'tetería-cap',    name: 'Tetería La Almedina Cafés (Almería)', desc: 'Casco antiguo. Té marroquí y dulces árabes.', specialty: 'té con menta, pastelería árabe y cuscús dulce.', rating: 4.6, cat: 'bar', lat: 36.8398, lng: -2.4688 },
  { id: 'jovellanos',     name: 'Jovellanos 16 (Almería capital)', desc: 'Tapeo de calidad en el centro. Producto y elaboración.', specialty: 'croquetas líquidas, atún rojo crujiente y bao de cochinita.', rating: 4.6, cat: 'bar', lat: 36.8380, lng: -2.4615 },
  // Murcia · Cartagena
  { id: 'columbares',     name: 'Columbares (Cartagena)', desc: 'Plaza San Sebastián. Tapas creativas y vermuts.', specialty: 'marinera, michirón y zarangollo.', rating: 4.6, cat: 'bar', lat: 37.6020, lng: -0.9885, featured: true },
  { id: 'el-zorro',       name: 'El Zorro Pub (Cartagena)', desc: 'Coctelería junto al puerto. Carta extensa.', specialty: 'gin tonics de autor y combinados premium.', rating: 4.5, cat: 'bar', lat: 37.5995, lng: -0.9810 },
  // Águilas
  { id: 'mar-menuda',     name: 'La Mar Menuda (Águilas)', desc: 'Águilas. Coctelería frente al mar.', specialty: 'mojitos, vermut casero y tapeo marinero.', rating: 4.5, cat: 'bar', lat: 37.4080, lng: -1.5785 },

  // Pescaderías y lonja
  { id: 'lonja-garrucha', name: 'Lonja de Garrucha (subasta)', desc: 'Una de las lonjas más activas del Mediterráneo español. Subasta diaria de marisco y pescado de barco — se puede ver el espectáculo desde la cristalera.', specialty: 'gamba roja de Garrucha (la mejor del Mediterráneo), quisquilla, conchas finas, gallineta.', tip: 'La subasta es a las 17:00 los días laborables. Llega con tiempo y compra después en las pescaderías de al lado.', cat: 'fish', lat: 37.1810, lng: -1.8240, featured: true },
  { id: 'mercado-vera',   name: 'Mercado de abastos (Vera pueblo)', desc: 'Mercado tradicional cubierto con frutería, carnicería, pescadería y charcutería. Producto local del día.', specialty: 'producto fresco de la huerta de Almería, carne de la sierra, pescado de la lonja.', tip: 'Sábado por la mañana es cuando más vida tiene — combínalo con el mercadillo exterior.', cat: 'fish', url: 'https://goo.gl/maps/PaEerwZNxAK1kNTS8', lat: 37.2486, lng: -1.8625, featured: true },
  { id: 'el-mero',        name: 'Pescadería El Mero (Garrucha)', desc: 'Junto a la lonja. Una de las pescaderías de referencia de Garrucha.', specialty: 'gamba roja recién subastada, lubinas y doradas salvajes, mariscos del día.', cat: 'fish', url: 'https://goo.gl/maps/AdJz6SEyGRvLeToDA', lat: 37.1815, lng: -1.8235, featured: true },
  { id: 'isabel',         name: 'Pescados y Mariscos Isabel (Garrucha)', desc: 'Pescadería pequeña pero con mucho oficio.', specialty: 'pescado para horno (besugo, dorada), pulpo cocido y conserva casera de mojama.', cat: 'fish', url: 'https://goo.gl/maps/RHCieMNkgo3FL8m5A', lat: 37.1820, lng: -1.8240 },
  { id: 'pescados-online',name: 'Pescados Garrucha (online)', desc: 'Servicio de pescado y marisco online — entrega en Vera Playa el mismo día.', specialty: 'gamba roja de Garrucha empacada en hielo, lista para comer o congelar.', tip: 'Útil si quieres llevarte producto a casa al final de la estancia.', cat: 'fish', url: 'https://pescadosgarrucha.es/', lat: 37.1815, lng: -1.8230 },
  { id: 'pescaderia-vera',name: 'Pescadería Hermanos Quintana (Vera pueblo)', desc: 'Tradicional, de las pescaderías de toda la vida en Vera. Producto fresco diario.', specialty: 'pescado del día y marisco a precio razonable.', cat: 'fish', lat: 37.2493, lng: -1.8633 },
  // Carnicerías, charcuterías y producto de calidad
  { id: 'carniceria-rey', name: 'Carnicería Rey (Vera pueblo)', desc: 'Carnicería de confianza con carne de la Sierra de los Filabres y cordero segureño.', specialty: 'cordero segureño (IGP), chuletón de vaca madurada, embutidos artesanos.', tip: 'Pide con un día de antelación si quieres cordero entero o piezas grandes.', cat: 'fish', lat: 37.2490, lng: -1.8635, featured: true },
  { id: 'carniceria-garrucha', name: 'Carnicería Hermanos López (Garrucha)', desc: 'Carnicería con producto local y embutidos curados en la sierra.', specialty: 'morcilla de Vera, jamón ibérico de Las Alpujarras, chorizo casero.', cat: 'fish', lat: 37.1818, lng: -1.8233 },
  { id: 'jamoneria-vera', name: 'Jamonería Sierra Almería (Vera)', desc: 'Especialista en ibéricos y jamones de toda España. Cortan al momento.', specialty: 'jamón ibérico de bellota, lomo embuchado, chorizo cular y caña de lomo.', tip: 'Se puede comprar jamón cortado a cuchillo y envasado al vacío para llevar a casa.', cat: 'fish', lat: 37.2495, lng: -1.8636 },
  { id: 'panaderia-vera', name: 'Panadería La Viña (Vera pueblo)', desc: 'Panadería tradicional con horno de leña.', specialty: 'pan de Cuevas, mollete almeriense, ensaimadas y empanadillas saladas.', tip: 'Llega antes de las 11:00 — el pan de Cuevas se acaba pronto.', cat: 'fish', lat: 37.2491, lng: -1.8637 },
  { id: 'fruteria-vera',  name: 'Frutería del Mercado (Vera)', desc: 'Frutería y verdulería de la huerta de Almería en el mercado de abastos.', specialty: 'tomates raf, pimientos asar, melones de huerta, naranjas valencianas.', cat: 'fish', lat: 37.2486, lng: -1.8625 },
  { id: 'queseria-velez', name: 'Quesería Los Vélez', desc: 'Quesos artesanos de cabra y oveja de la Sierra de María-Los Vélez.', specialty: 'queso de cabra al romero, oveja semicurado y manchego de los Vélez.', tip: 'Pídelo en queserías de Vera o ve directamente al obrador en Vélez-Rubio.', cat: 'fish', lat: 37.6520, lng: -2.0760 },

  // Farmacias y salud
  { id: 'farmacia-1',     name: 'Farmacia (junto Consum)', cat: 'pharmacy', url: 'https://goo.gl/maps/bGMV1sjwUqrRTNzk6', lat: 37.2210, lng: -1.8085 },
  { id: 'farmacia-2',     name: 'Farmacia Vera Playa',     cat: 'pharmacy', url: 'https://goo.gl/maps/GaRHGscDhErp9kBG7', lat: 37.2260, lng: -1.7985 },
  { id: 'cs-vera',        name: 'Centro de Salud de Vera', cat: 'health',   url: 'https://goo.gl/maps/ei7cMoTYLmWLnWZj7', lat: 37.2473, lng: -1.8612 },
  { id: 'virgen-alcazar', name: 'Virgen del Alcázar', desc: 'Privado.',     cat: 'health', url: 'https://goo.gl/maps/AXJ74Goy1ESTtBVy7', lat: 37.6850, lng: -1.7060 },

  // Mercadillos (los mejores de la zona, ordenados por día)
  { id: 'm-vera-sab',     name: 'Mercadillo de Vera (sábado mañana)', desc: 'El más grande de la comarca. Frutas y verduras de la huerta, ropa, calzado, artesanía.', best: 'queso fresco de cabra y aceite local en la zona de productores.', tip: 'Llega sobre las 10:00 — a la una empieza a recoger.', cat: 'market', lat: 37.2491, lng: -1.8639, featured: true },
  { id: 'm-mojacar-mie',  name: 'Mercadillo de Mojácar (miércoles mañana)', desc: 'En el Parque Comercial. Mezcla de productos frescos y artículos locales.', best: 'aceitunas aliñadas y especias de la sierra.', cat: 'market', lat: 37.1377, lng: -1.8523, featured: true },
  { id: 'm-garrucha-vie', name: 'Mercadillo de Garrucha (viernes mañana)', desc: 'Pequeño pero con muy buen pescado de la lonja al lado.', best: 'gamba roja de Garrucha al precio del día — pasa antes por la lonja.', tip: 'Combínalo con la subasta del puerto a las 17:00.', cat: 'market', lat: 37.1815, lng: -1.8235, featured: true },
  { id: 'm-pulpi-mie',    name: 'Mercadillo de Pulpí (miércoles mañana)', desc: 'En el centro del pueblo, ambiente local sin turistas.', best: 'higos chumbos en agosto y melones de huerta.', cat: 'market', lat: 37.4055, lng: -1.7635 },
  { id: 'm-cuevas-sab',   name: 'Mercadillo de Cuevas del Almanzora (sábado mañana)', desc: 'Junto al castillo. Frutas, verduras y ropa.', best: 'productos del valle del Almanzora.', cat: 'market', lat: 37.2980, lng: -1.8830 },
  { id: 'm-mercadillos',  name: 'Calendario semanal completo', desc: 'Todos los mercadillos de Almería por día y municipio.', cat: 'market', url: 'https://www.mercadillosemanal.com/en.almeria', lat: 37.2491, lng: -1.8639 },
  { id: 'm-artesanal-mojacar', name: 'Mercado artesanal de Mojácar Pueblo (verano)', desc: 'Plaza Nueva al atardecer en julio y agosto. Bisutería, cuero, cerámica.', best: 'artesanía local — perfecto para regalos.', tip: 'Empieza sobre las 20:00, cuando baja el sol.', cat: 'market', lat: 37.1380, lng: -1.8525 },

  // Actividades — más tranquilas, aptas para todas las edades.
  { id: 'aquavera',       name: 'Parque acuático Aquavera',
    desc: 'Toboganes, piscinas y zona infantil. A 5 min en coche dentro de la propia Vera Playa.',
    level: 'Fácil · todas las edades · zona infantil supervisada',
    cat: 'activity', url: 'https://www.aquavera.com/', lat: 37.2230, lng: -1.7960, featured: true, featuredOrder: 1 },
  { id: 'rumboalcabo',    name: 'Paseos en barco · Rumbo al Cabo',
    desc: 'Salidas desde Garrucha con visita a calas accesibles solo por mar. Embarcación cómoda.',
    level: 'Fácil · todas las edades · chalecos a bordo',
    cat: 'activity', url: 'http://www.rumboalcabo.com/', lat: 37.1815, lng: -1.8235 },
  { id: 'caboafondo',     name: 'Paseos en barco · El Cabo a Fondo',
    desc: 'Excursiones marítimas por Cabo de Gata desde San José. Avistamiento de delfines algunos días.',
    level: 'Fácil · todas las edades',
    cat: 'activity', url: 'https://elcaboafondo.es', lat: 36.7605, lng: -2.1075 },
  { id: 'cabogata',       name: 'Paseos en barco · Cabo de Gata',
    desc: 'Travesía por las calas vírgenes del parque natural.',
    level: 'Fácil · todas las edades',
    cat: 'activity', url: 'https://www.cabogataalmeria.com', lat: 36.7605, lng: -2.1075 },
  { id: 'mojacar-fiesta', name: 'Mojácar Fiesta · actividades',
    desc: 'Catálogo amplio de planes en Mojácar (kayak, paddle surf, paseos, alquiler de barcos).',
    level: 'Variable · cada actividad indica su exigencia',
    cat: 'activity', url: 'https://mojacarfiesta.com/actividades/', lat: 37.1377, lng: -1.8523 },
  { id: 'biplaza',        name: 'Vuelo en biplaza (Vera-Palomares)',
    desc: 'Vuelos en ultraligero biplaza desde el aeródromo de Palomares. Vistas de costa, salinas y desierto.',
    level: 'Fácil · 8+ años · sin movilidad reducida (acceso al avión)',
    cat: 'activity', url: 'https://aeronomadas.com/es/vuelos-biplaza', lat: 37.2150, lng: -1.7720 },
  { id: 'turismo-ind',    name: 'Turismo industrial y científico',
    desc: 'Visitas guiadas a invernaderos, plantas solares y observatorios de Almería.',
    level: 'Fácil · todas las edades',
    cat: 'activity', url: 'https://myalmeria.com/turismo-industrial-y-cientifico-en-almeria', lat: 36.8400, lng: -2.4600 },

  // ==========================================================
  // DEPORTE Y AVENTURA — actividades más exigentes con prerrequisitos.
  // Cada una incluye dificultad, edad mínima y notas de aptitud
  // (saber nadar, movilidad, equipo). Verificadas mayo 2026 vía
  // Garrucha Adventure Sports, Mojácar Tour, Deep Emotion,
  // Wikiloc y la red de senderos de Almería.
  // ==========================================================
  { id: 'lunar-cable',    name: 'Lunar Cable Park (wakeboard · ski náutico)',
    desc: 'Cable ski sobre el antiguo canal de remo de los Juegos Mediterráneos 2005, junto al embalse de Cuevas del Almanzora. Reinaugurado en 2019 como Lunar Cable Park. Sin barco, sin olas — el cable te arrastra. Distancia: ~20 km / 24 min desde Vera Playa por carretera local pasando por Vera y Cuevas del Almanzora.',
    specialty: 'Sistema de 5 torres para wakeboard, ski náutico y kneeboard. Además: circuito hinchable acuático (el mayor del sur de España), kayak, paddle surf, mini-rampa de skate y gimnasio outdoor. Sesiones de iniciación con instructor.',
    level: 'Medio · 8+ años en cable infantil · 12+ años en cable principal · Saber nadar bien · Forma física básica',
    tip: 'Reserva online con 24 h en julio-agosto. Llévate crema solar, gorra y agua — el sol pega fuerte sobre el embalse. La primera caída es a los 5 minutos; al final del día acabas tirado en la hamaca con muy buena cara.',
    cat: 'sport', url: 'https://lunarcablepark.com/', lat: 37.3970, lng: -1.7320, featured: true, featuredOrder: 1, rating: 4.7 },
  { id: 'sport-garrucha-adventure', name: 'Garrucha Adventure Sports · pesca y alquiler de barcos',
    desc: 'Empresa especializada en pesca recreativa con embarcación Menorquina 500 (4 personas). Salidas desde el puerto de Garrucha. También alquilan barcos sin patrón y con patrón. Distancia: ~10 min en coche desde Vera Playa (~7 km).',
    specialty: 'Pesca privada de 4 h o día completo · alquiler de barcos por horas o jornada · paseos guiados.',
    level: 'Fácil · 6+ años con adulto · No apto si te marea el barco con facilidad',
    tip: 'Reserva con días de antelación, sobre todo en julio-agosto. Si vais 4, sale más a cuenta el privado que el compartido. Patrón profesional incluido en el privado.',
    cat: 'sport', url: 'https://garruchaadventuresports.com/', lat: 37.1810, lng: -1.8210, featured: true, featuredOrder: 2, rating: 4.8 },
  { id: 'sport-mojacar-tour-snorkel', name: 'Snorkel Cabo de Gata · Mojácar Tour',
    desc: 'Excursión guiada en barco a las calas vírgenes de Cabo de Gata (Cala de Enmedio, San Pedro, Plomo). Recogida en Vera Playa o Garrucha. Día completo 9:00-18:00. Equipo y picnic incluidos.',
    specialty: 'Para por Mesa Roldán (escenario de Juego de Tronos) y permite snorkel en aguas cristalinas con peces y posidonia.',
    level: 'Fácil-Medio · 8+ años · Saber nadar · Hacer snorkel básico',
    tip: 'Llévate calzado de agua o sandalias antideslizantes — algunas calas tienen piedras al entrar. La crema solar tiene que ser biodegradable (Cabo de Gata es parque protegido).',
    cat: 'sport', url: 'https://mojacartour.com/', lat: 37.1377, lng: -1.8523, featured: true, featuredOrder: 3 },
  { id: 'sport-deep-emotion', name: 'Snorkel y buceo · Deep Emotion (Mojácar)',
    desc: 'Centro de buceo en Mojácar con salidas diarias a Cabo de Gata. Snorkel guiado 60 €/persona (incluye traslado, equipo, guía, fotos y picnic). Buceo PADI desde bautismo a Open Water.',
    specialty: 'Inmersiones de 2 h con guía profesional. Bautismo de buceo para no certificados.',
    level: 'Snorkel: Medio · 8+ años · Saber nadar. · Buceo: Alto · 10+ años · Examen médico simple',
    tip: 'Salida temprana (8:00), pero compensa: el mar está plano y la luz para fotos es perfecta.',
    cat: 'sport', url: 'https://deepemotiondiving.com/', lat: 37.1380, lng: -1.8520 },
  { id: 'buceo-tortuga',  name: 'Buceo · Tortuga (Vera Playa)',
    desc: 'Centro de buceo cercano, con bautismos y cursos PADI completos.',
    level: 'Bautismo: Medio · 10+ años · Buena salud cardiopulmonar. · Cursos PADI: Alto · 12+ años con autorización',
    cat: 'sport', url: 'https://www.buceotortuga.com', lat: 37.2470, lng: -1.7660 },
  { id: 'buceo-villaricos', name: 'Buceo · Villaricos Sub',
    desc: 'Inmersiones en los pecios y arrecifes de Villaricos. Equipo completo en alquiler.',
    level: 'Medio-Alto · titulación PADI Open Water o equivalente · 14+ años',
    cat: 'sport', url: 'https://www.villaricosub.com', lat: 37.2470, lng: -1.7660 },
  { id: 'buceo-mojacar',  name: 'Buceo · Mojácar',
    desc: 'Centro tradicional de buceo en Mojácar.',
    level: 'Bautismo: Medio · 10+ años. · Inmersiones: depende del nivel certificado',
    cat: 'sport', url: 'https://www.buceomojacar.com', lat: 37.1380, lng: -1.8520 },
  { id: 'aquamundo',      name: 'Motos de agua · Aquamundo (sin titulación)',
    desc: 'Alquiler de motos de agua en Vera Playa, sin necesidad de licencia. Sesiones de 15-30 min en zona acotada.',
    level: 'Medio · 16+ años (carnet de identidad obligatorio) · Saber nadar · No apto embarazadas ni problemas de espalda',
    tip: 'Casco y chaleco incluidos. Lleva ropa que se pueda mojar — terminas calado.',
    cat: 'sport', url: 'https://www.aquamundo.es', lat: 37.2300, lng: -1.7960 },
  { id: 'jetski-island',  name: 'Motos de agua · Desert Island (Carboneras)',
    desc: 'Salidas guiadas en moto de agua por la costa de Cabo de Gata desde Carboneras. Recorridos hasta calas a las que no llegan los barcos.',
    level: 'Medio-Alto · 18+ años con DNI · Saber nadar · No apto embarazadas',
    tip: 'Distancia: 50 min en coche desde Vera Playa. Reserva por Instagram.',
    cat: 'sport', url: 'https://instagram.com/desertislandjetskiclub', lat: 36.9990, lng: -1.9010 },
  { id: 'karting',        name: 'Karting Garrucha',
    desc: 'Pista de karting outdoor en Garrucha. Karts adultos y karts infantiles separados. Distancia: ~10 min en coche desde Vera Playa.',
    level: 'Fácil-Medio · adultos en kart grande · niños 8+ años con karts pequeños · No apto problemas cervicales',
    cat: 'sport', url: 'https://kartinggarrucha.es/', lat: 37.1810, lng: -1.8230 },
  { id: 'buggy',          name: 'Buggy en el desierto de Tabernas',
    desc: 'Rutas en buggy 4×4 por el desierto de Tabernas (escenario de los spaghetti westerns). Ruta corta 1 h o larga 3 h con paradas. Distancia: ~1 h en coche desde Vera Playa (~70 km).',
    level: 'Medio · 18+ años para conducir · 6+ años de copiloto con adulto · No apto embarazadas ni problemas de espalda · Polvo y vibración alta',
    tip: 'Llévate gafas de sol, pañuelo o buff para la boca y agua. Acabas blanco de polvo — es parte de la experiencia.',
    cat: 'sport', url: 'https://buggy-almeria.com/', lat: 37.0540, lng: -2.3880 },
  { id: 'vera-surfing',   name: 'Vera Surfing · clases de surf',
    desc: 'Clases de surf y SUP en la propia Playa de Vera. Material en alquiler.',
    level: 'Fácil · 6+ años con instructor · Saber nadar',
    cat: 'sport', url: 'https://cambiatugesto.vera.es/turismo/index.php?page=directorio_view&id=1498', lat: 37.2240, lng: -1.7950 },
  { id: 'vela-almeria',   name: 'Vela Almería · iniciación a la vela',
    desc: 'Cursos de iniciación a la vela en el puerto de Almería. Salidas en velero ligero y crucero.',
    level: 'Medio · 10+ años con autorización · Saber nadar',
    cat: 'sport', url: 'https://www.velaalmeria.es', lat: 36.8350, lng: -2.4630 },

  // Trekking — rutas verificadas en wikiloc / senderosdealmeria.es
  { id: 'trek-la-mena',   name: 'Sendero La Mena – Macenas (PR-A 96)',
    desc: 'Ruta lineal junto al mar entre los acantilados de Mojácar y la playa de Macenas. Pasa por la Torre del Pirulico (s.XVI) y miradores.',
    specialty: '~6 km · 2 h · desnivel mínimo · señalizada PR-A 96.',
    level: 'Fácil · todas las edades (con cuidado en tramos cerca del acantilado) · Apta para mayores con buena movilidad',
    tip: 'Mejor por la mañana o al atardecer — sin sombra. Lleva 1,5 L agua/persona en verano.',
    cat: 'sport', url: 'https://senderosdealmeria.es/otras-zonas/la-mena-macenas-pr-a-96/', lat: 37.1130, lng: -1.8500, featured: true, featuredOrder: 5 },
  { id: 'trek-marina-mojacar', name: 'Marina de la Torre → Mojácar Pueblo',
    desc: 'Subida desde la costa hasta el casco antiguo de Mojácar. ~7 km ida y vuelta, baja dificultad.',
    level: 'Fácil-Medio · 10+ años · Subida sostenida pero corta',
    tip: 'Combínalo con desayuno o comida en la Plaza Nueva de Mojácar arriba.',
    cat: 'sport', url: 'https://www.google.com/maps/search/?api=1&query=Marina+de+la+Torre+Mojacar+sendero', lat: 37.1100, lng: -1.8395 },
  { id: 'trek-rambla-sopalmo', name: 'Rambla del Sopalmo',
    desc: 'Sendero por la rambla del Sopalmo (Sierra Cabrera). Descenso suave de ~90 min.',
    level: 'Fácil · todas las edades · Calzado cerrado',
    cat: 'sport', url: 'https://www.google.com/maps/search/?api=1&query=Rambla+Sopalmo+Sierra+Cabrera', lat: 37.1400, lng: -1.8800 },
  { id: 'trek-jali',      name: 'El Jalí – Sierra Cabrera (Turre)',
    desc: 'Ruta circular exigente con ascenso pronunciado y vistas del valle del Aguas y la Sierra Cabrera. ~12 km · 4 h · desnivel ~700 m.',
    level: 'Alto · 14+ años con experiencia · Buena forma física · No apto principiantes ni con problemas de rodilla',
    tip: 'Sólo en otoño-invierno-primavera: en verano hace demasiado calor para subir. Lleva 2 L agua, comida y bastones.',
    cat: 'sport', url: 'https://www.wikiloc.com/hiking-trails/cortijo-cabrera-turre-mojacar-6347444', lat: 37.1550, lng: -1.8700 },
  { id: 'club-nautico',   name: 'Club Náutico Almanzora', cat: 'activity', url: 'https://maps.app.goo.gl/kgT5rYortJ2s5oPN8', lat: 37.2530, lng: -1.7720 },
  { id: 'bicis',          name: 'Alquiler de bicicletas (Vera Playa)', cat: 'activity', url: 'https://maps.app.goo.gl/yPqqBXpwgcZyu6568', lat: 37.2270, lng: -1.7965 },
  { id: 'bicis-villaricos',name: 'Bicis Villaricos', desc: 'Tel. 627 139 092', cat: 'activity', lat: 37.2470, lng: -1.7660 },

  // Pueblos
  // Pueblos — cada uno con atractivos, recomendaciones y eventos clave.
  // El campo `events` es una lista de fiestas/festivales con su mes.
  { id: 't-mojacar',      name: 'Mojácar',                desc: 'El pueblo blanco más fotografiado de Almería, colgado sobre un cerro a 175 m. Herencia árabe en cada calle estrecha encalada.', best: 'Plaza del Frontón al atardecer (mirador), Fuente Mora, Iglesia de Santa María (fortaleza-iglesia), Puerta de la Ciudad y el símbolo del Indalo.', tip: 'Aparca en el parking de la entrada y sube andando. Mejor a última hora — la luz dora las fachadas y bajan las temperaturas.', events: [
      { name: 'Moros y Cristianos', when: '2.ª semana de junio', d: 'Tres días de desfiles, embajadas y batallas históricas en homenaje a la Reconquista de 1488.' },
      { name: 'Fiestas patronales de San Agustín', when: '28-29 de agosto', d: 'Procesión del Indalo, conciertos en Plaza Nueva y verbenas en la playa.' },
      { name: 'Noche de los Museos', when: 'mayo', d: 'Visitas nocturnas gratuitas a museos y galerías del casco antiguo.' },
    ], cat: 'town', lat: 37.1377, lng: -1.8523, featured: true },
  { id: 't-vera',         name: 'Vera pueblo',            desc: 'Cabecera comarcal. Plaza Mayor con palmeras, iglesia-fortaleza del s. XVI, ayuntamiento del s. XVIII y restos de la muralla.', best: 'Iglesia de la Encarnación (sólo fortaleza de iglesia conservada en Andalucía con cuatro torres), Plaza Mayor, Mercado de Abastos y Museo Histórico Municipal.', tip: 'Aprovecha la mañana de sábado para el mercadillo grande y queda a comer en Juan Moreno o Terraza Carmona.', events: [
      { name: 'Feria y Fiestas de Vera (San Cleofás)', when: '24-29 de septiembre', d: 'Feria patronal con caseta municipal, conciertos, toros y procesión de San Cleofás.' },
      { name: 'Romería de la Virgen de las Angustias', when: 'último domingo de abril', d: 'Romería al santuario de Cabrera con caballos y carretas engalanadas.' },
      { name: 'Festival de Cante Flamenco', when: 'agosto', d: 'Uno de los festivales flamencos veteranos del Levante almeriense.' },
    ], cat: 'town', lat: 37.2491, lng: -1.8639, featured: true },
  { id: 't-velez',        name: 'Vélez-Rubio',            desc: 'Puerta de la Comarca de los Vélez, al norte de la provincia. Imponente arquitectura barroca y casas señoriales.', best: 'Iglesia de la Encarnación (catedral barroca del s. XVIII), Museo Comarcal Velezano y Casa de los Arrieros.', tip: 'Combina con Vélez-Blanco y la Cueva de los Letreros (arte rupestre Patrimonio UNESCO). Un día perfecto desde Vera.', events: [
      { name: 'Fiestas patronales en honor a la Virgen del Carmen', when: '15-16 de julio', d: 'Procesión nocturna y verbena en la plaza.' },
      { name: 'Romería de la Virgen de la Cabeza', when: 'último domingo de abril', d: 'Una de las romerías más arraigadas de la sierra.' },
    ], cat: 'town', lat: 37.6520, lng: -2.0760 },
  { id: 't-velez-blanco', name: 'Vélez-Blanco',           desc: 'Pueblo encalado coronado por uno de los castillos renacentistas más bellos de España. Su patio original está hoy en el Metropolitan de Nueva York.', best: 'Castillo del Marqués de los Vélez (s. XVI), Cueva de los Letreros (arte rupestre, Indalo original), Iglesia de Santiago.', tip: 'La Cueva de los Letreros exige visita guiada (reserva en oficina de turismo). En el castillo, no te pierdas el Cubo del Marqués.', events: [
      { name: 'Festival Internacional de Música y Patrimonio', when: 'segunda quincena de julio', d: 'Conciertos de música clásica y jazz en el patio del castillo.' },
      { name: 'Fiestas de San Roque', when: '16 de agosto', d: 'Procesión, danzas tradicionales de los moros y cristianos del Marqués.' },
      { name: 'Festival Drácula', when: 'última semana de octubre', d: 'Recreaciones góticas en el castillo — pintoresco y único.' },
    ], cat: 'town', lat: 37.6905, lng: -2.0998, featured: true },
  { id: 't-castillo',     name: 'Castillo Marqués de los Vélez', desc: 'Dentro de Vélez-Blanco. Fortaleza renacentista del s. XVI, una de las cumbres del Renacimiento andaluz.', best: 'Vista desde la Torre del Homenaje, la galería con vistas al valle y la reproducción del patio renacentista (el original está en el MET).', tip: 'Entrada económica (~5 €). Combínalo con la Cueva de los Letreros y comida en Vélez-Rubio.', cat: 'town', lat: 37.6905, lng: -2.0998 },
  { id: 't-sorbas',       name: 'Sorbas',                  desc: 'Pueblo de casas colgadas sobre el barranco. Su entorno es el Paraje Natural Karst en Yesos, único en Europa.', best: 'Mirador de las casas colgadas, Cuevas de Sorbas (visita guiada en yeso natural), alfarería tradicional (talleres abiertos), Iglesia de Santa María.', tip: 'Las cuevas se visitan con guía obligatorio (3 niveles de dificultad). Reserva en cuevasdesorbas.com.', events: [
      { name: 'Fiestas en honor a la Virgen de las Nieves', when: '5-8 de agosto', d: 'Patrona con procesión, verbena y degustación de productos típicos.' },
      { name: 'Festival Alfarería de Sorbas', when: 'octubre', d: 'Demostraciones de los últimos alfareros tradicionales.' },
    ], cat: 'town', lat: 37.0920, lng: -2.0770, featured: true },
  { id: 't-nijar',        name: 'Níjar',                  desc: 'Pueblo blanco al pie de Sierra Alhamilla, puerta natural al Parque de Cabo de Gata. Cuna de la cerámica andaluza más reputada y de la jarapa (alfombra tradicional).', best: 'Calle de las Tiendas (alfarerías centenarias — La Tienda de los Milagros, El Oficio), Iglesia de Santa María (s. XVI), Plaza La Glorieta.', tip: 'Las jarapas y la cerámica de Níjar son uno de los mejores recuerdos posibles de Almería. Pregunta por el taller de Matilde Sánchez.', events: [
      { name: 'Fiestas patronales de San Antonio Abad', when: '17 de enero', d: 'Hogueras (luminarias) y bendición de animales.' },
      { name: 'Fiestas del Cristo de la Salud', when: 'segunda semana de septiembre', d: 'Feria, conciertos y verbena en la plaza.' },
      { name: 'Feria de la Cerámica', when: 'julio', d: 'Encuentro de alfareros tradicionales con talleres abiertos al público.' },
    ], cat: 'town', lat: 36.9663, lng: -2.2056, featured: true },
  { id: 't-gergal',       name: 'Gérgal',                  desc: 'Pueblo blanco a los pies de la Sierra de los Filabres. Punto de partida natural para el Observatorio Astronómico de Calar Alto (uno de los más importantes de Europa).', best: 'Castillo de Gérgal (s. XV, vistas), Observatorio de Calar Alto (visitas guiadas a 2.168 m), senderismo en los Filabres.', tip: 'Para Calar Alto, reserva con antelación en calaralto.es. Las visitas nocturnas con observación de estrellas son experiencias únicas.', events: [
      { name: 'Fiestas patronales de la Virgen de la Cabeza', when: 'último fin de semana de abril', d: 'Romería a la ermita y procesión por el pueblo.' },
    ], cat: 'town', lat: 37.1110, lng: -2.5430 },
  { id: 't-cuevas',       name: 'Cuevas del Almanzora',   desc: 'Capital del valle del Almanzora, dominada por un castillo del s. XV restaurado.', best: 'Castillo del Marqués (museo arqueológico y de arte), Cueva del Tesoro, ruta del Almanzora (paseos al río).', tip: 'Si vas con niños, el museo del castillo tiene yacimientos del Argar (Edad del Bronce) muy didácticos.', events: [
      { name: 'Fiestas de San Diego', when: '12-13 de noviembre', d: 'Procesión, conciertos y verbena.' },
      { name: 'Feria de Cuevas', when: 'mediados de agosto', d: 'Feria veraniega con caseta municipal y conciertos.' },
    ], cat: 'town', lat: 37.2978, lng: -1.8814 },
  { id: 't-garrucha',     name: 'Garrucha',                desc: 'Pueblo pesquero a 10 min de Hestía. Su lonja es de las más importantes del Mediterráneo (famosa la gamba roja).', best: 'Subasta de pescado (17:00 días laborables), Paseo Marítimo, Castillo de Jesús Nazareno (s. XVIII), Plaza del Pueblo.', tip: 'Llega al puerto sobre las 19:00 para ver descargar el día y comer al lado en Rincón del Puerto o El Almejero.', events: [
      { name: 'Fiestas patronales de la Virgen del Carmen', when: '15-16 de julio', d: 'Procesión marítima de la Virgen por el puerto — la más emotiva de la zona.' },
      { name: 'Fiestas de San Joaquín', when: '20-22 de agosto', d: 'Feria con conciertos en el paseo marítimo y fuegos artificiales sobre el mar.' },
    ], cat: 'town', lat: 37.1815, lng: -1.8225, featured: true },
  { id: 't-san-jose',     name: 'San José',                desc: 'Capital del Parque Natural de Cabo de Gata. Pueblo blanco junto al mar, base perfecta para explorar playas vírgenes.', best: 'Paseo del puerto deportivo, Centro de Visitantes Las Amoladeras, playas de Genoveses y Mónsul a 5-10 min.', tip: 'En julio-agosto el acceso a Genoveses/Mónsul se restringe — llega temprano o usa el bus lanzadera desde el pueblo.', events: [
      { name: 'Fiestas de la Virgen del Carmen', when: '15-16 de julio', d: 'Procesión marítima con barcas pesqueras engalanadas.' },
      { name: 'Festival Mar de Cabo de Gata', when: 'agosto', d: 'Conciertos de música mediterránea al atardecer en el puerto.' },
    ], cat: 'town', lat: 36.7665, lng: -2.1083 },
  { id: 't-almeria',      name: 'Almería capital',         desc: 'Capital de la provincia, a 1 h 15 min. Mezcla única de Alcazaba musulmana, Catedral-fortaleza y barrios marineros.', best: 'Alcazaba (segunda más grande de España tras la Alhambra), Catedral de la Encarnación (con planta de fortaleza), Refugios de la Guerra Civil, barrio de La Chanca, Cable Inglés (mirador al puerto), Aljibes Árabes.', tip: 'Empieza por la Alcazaba al abrir, baja al casco antiguo a tomar tapas (en Almería con cada caña traen una gratis), y termina en el Paseo Marítimo al atardecer.', events: [
      { name: 'Semana Santa de Almería', when: 'marzo o abril', d: 'Declarada de Interés Turístico Nacional. Hermandades por el casco antiguo.' },
      { name: 'Feria de Almería en honor a la Virgen del Mar', when: 'última semana de agosto', d: 'Feria principal, con casetas en el recinto ferial y procesión marítima de la Patrona.' },
      { name: 'Festival de Flamenco y Música Tradicional', when: 'octubre', d: 'En diferentes localizaciones del casco histórico.' },
    ], cat: 'town', lat: 36.8350, lng: -2.4630, featured: true },
  { id: 't-lorca',        name: 'Lorca (Murcia)',          desc: 'Ciudad barroca declarada Conjunto Histórico-Artístico. Conocida como "la Ciudad del Sol" y por una de las Semanas Santas más espectaculares de España.', best: 'Castillo de Lorca (Fortaleza del Sol — visita guiada con teatralización), Colegiata de San Patricio, Palacio de Guevara, Museo MASS (bordados de la Semana Santa Blancos y Azules), Plaza de España.', tip: 'Sube al castillo en el ferrocarril turístico desde el centro. Si vas en Semana Santa, reserva alojamiento y entradas con meses de antelación.', events: [
      { name: 'Semana Santa de Lorca', when: 'marzo o abril', d: '⭐ Fiesta de Interés Turístico Internacional. La rivalidad histórica entre la Hermandad Blanca y la Azul produce procesiones únicas: cabalgatas con caballos y vestuario bordado en oro y seda.' },
      { name: 'Feria y Fiestas de Lorca', when: '6-21 de septiembre', d: 'Feria veraniega con conciertos, festejos taurinos y verbenas.' },
      { name: 'Noche de los Museos', when: 'mayo', d: 'Visitas nocturnas gratuitas a museos y monumentos.' },
    ], cat: 'town', lat: 37.6770, lng: -1.7000, featured: true },
  { id: 't-aguilas',      name: 'Águilas (Murcia)',        desc: 'Pueblo costero murciano a 30 min al norte. Famoso por su Carnaval, declarado de Interés Turístico Internacional.', best: 'Castillo de San Juan (mirador), Plaza de España, Embarcadero del Hornillo (antigua estación ferroviaria inglesa), Cuatro Calas (sur), Cala Cerrada.', tip: 'En invierno (febrero) es imprescindible el Carnaval — uno de los más auténticos de España, con la Musa del Carnaval y comparsas todo el año preparándose.', events: [
      { name: 'Carnaval de Águilas', when: 'febrero', d: '⭐ Fiesta de Interés Turístico Internacional. Tres días de comparsas, batalla de flores, entierro de la sardina.' },
      { name: 'Fiestas patronales de la Virgen de los Dolores', when: 'segunda semana de septiembre', d: 'Procesión marítima y verbena en el paseo.' },
      { name: 'Festival Trovero Marín', when: 'agosto', d: 'Festival de cante de trovo, género único de la cultura murciana.' },
    ], cat: 'town', lat: 37.4060, lng: -1.5840, featured: true },
  { id: 't-cartagena',    name: 'Cartagena (Murcia)',      desc: 'Ciudad portuaria con 3.000 años de historia. Romana, modernista y militar — única en el Mediterráneo. A 1 h 30 min.', best: 'Teatro Romano (descubierto en 1988, en perfecta conservación), Calle Mayor modernista, Museo del Foro Romano, Submarino Peral, Castillo de la Concepción (mirador), barrio del Molinete, Casa Cervantes.', tip: 'El bono "Puerto de Culturas" da acceso a todos los monumentos por ~25 €. Sube al castillo al atardecer.', events: [
      { name: 'Carthagineses y Romanos', when: '2.ª quincena de septiembre', d: '⭐ Fiesta de Interés Turístico Internacional. 10 días de recreación histórica de la conquista romana — campamentos, batallas, mercado romano.' },
      { name: 'La Mar de Músicas', when: 'julio', d: 'Festival internacional de músicas del mundo. Conciertos en el Auditorio del Parque Torres con vista al puerto.' },
      { name: 'Semana Santa de Cartagena', when: 'marzo o abril', d: 'Fiesta de Interés Turístico Internacional. Procesiones nocturnas únicas en sus tronos iluminados con cera.' },
    ], cat: 'town', lat: 37.6040, lng: -0.9870, featured: true },
  // ── Pueblos adicionales (la Comarca, Murcia y conexiones) ─────
  { id: 't-carboneras',   name: 'Carboneras',              desc: 'Pueblo pesquero al norte del Cabo de Gata. Punto de partida hacia Playa de los Muertos y Mesa Roldán.', best: 'Castillo de San Andrés (s. XVI, escenario de Juego de Tronos), Mesa Roldán y su faro, playa del Algarrobico (polémica icónica), puerto pesquero al atardecer.', tip: 'Sube a Mesa Roldán al amanecer o al atardecer — vistas a las mejores calas vírgenes de la zona.', events: [
      { name: 'Moros y Cristianos de Carboneras', when: 'primera quincena de septiembre', d: 'Embajadas y desembarcos en la playa, una de las recreaciones más vistosas del Levante.' },
      { name: 'Fiestas patronales de San Antonio de Padua', when: '13 de junio', d: 'Procesión por las calles del puerto y verbena.' },
    ], cat: 'town', lat: 36.9963, lng: -1.8966, featured: true },
  { id: 't-pulpi',        name: 'Pulpí',                   desc: 'Pueblo del Levante almeriense, último al norte. Famoso mundialmente por la Geoda gigante (8 m de altura).', best: 'Geoda de Pulpí (visita guiada en mina, segunda más grande del mundo), Playa de los Cocedores, Castillo de San Juan de los Terreros.', tip: 'La visita a la Geoda requiere reserva con semanas de antelación en geodapulpi.es. Grupos de 8 personas máx, en pozo a 50 m.', events: [
      { name: 'Fiestas de San Juan', when: '23-24 de junio', d: 'Hogueras en la playa, baño nocturno y verbena junto al mar.' },
      { name: 'Fiestas patronales de San Miguel', when: '29 de septiembre', d: 'Feria, conciertos y degustación gastronómica.' },
    ], cat: 'town', lat: 37.4055, lng: -1.7635, featured: true },
  { id: 't-tabernas',     name: 'Tabernas',                desc: 'Pueblo blanco en medio del único desierto de Europa. Escenario de más de 500 películas (El bueno, el feo y el malo).', best: 'Desierto de Tabernas, Mini Hollywood (Oasys), Fort Bravo (poblado del Oeste), Castillo de Tabernas, ruta de localizaciones de cine.', tip: 'En verano hace mucho calor — ve por la mañana temprano. Mini Hollywood y Fort Bravo tienen espectáculos con dobles, ideal con niños.', events: [
      { name: 'Almería Western Film Festival', when: 'octubre', d: 'Festival internacional dedicado al género western, con proyecciones en el desierto.' },
      { name: 'Fiestas de la Virgen de las Angustias', when: 'segunda semana de septiembre', d: 'Verbena y procesión por el casco antiguo.' },
    ], cat: 'town', lat: 37.0420, lng: -2.3890, featured: true },
  { id: 't-roquetas',     name: 'Roquetas de Mar',         desc: 'Capital turística del sur de la provincia, a 1 h 30 min. Playas largas, marismas con flamencos y el Aquarium más grande de la costa.', best: 'Castillo de Santa Ana, Aquarium Costa de Almería, Marismas de las Salinas Viejas (flamencos), playas de Bajadilla y Aguadulce.', tip: 'El Aquarium es perfecto para días nublados o con niños. Combínalo con el paseo por el puerto deportivo y el Castillo.', events: [
      { name: 'Festival Internacional Roquetas Flamenca', when: 'julio', d: 'Espectáculos al aire libre en el Castillo de Santa Ana.' },
      { name: 'Fiestas patronales de la Virgen del Rosario', when: 'primera quincena de octubre', d: 'Feria local, conciertos y procesión marinera.' },
    ], cat: 'town', lat: 36.7641, lng: -2.6094 },
  { id: 't-turre',        name: 'Turre',                   desc: 'Pueblo blanco al pie de la Sierra Cabrera, a 15 min de Hestía. Auténtico y poco turistificado, con buenos olivares y almazaras.', best: 'Almazara de aceite (visitas con cata), senderismo en Sierra Cabrera, mirador hacia Mojácar y la costa, Iglesia de la Encarnación.', tip: 'Combínalo con una comida en Riad Cabrera (a 10 min, en la sierra). El aceite local es excepcional.', events: [
      { name: 'Fiestas patronales de San Francisco Javier', when: '3 de diciembre', d: 'Procesión y verbena en la plaza.' },
      { name: 'Feria de Turre', when: 'agosto', d: 'Feria veraniega con caseta municipal.' },
    ], cat: 'town', lat: 37.1530, lng: -1.8870 },
  { id: 't-bedar',        name: 'Bédar',                   desc: 'Pueblo blanco serrano con pasado minero, encaramado a 600 m. Vistas espectaculares al Levante almeriense.', best: 'Ruta minera (antiguos cargaderos y túneles), Iglesia de Santa María (s. XVI), mirador del pueblo, fuentes naturales.', tip: 'En verano es 5-7 °C más fresco que la costa — escapada perfecta para el calor. Combínalo con tapas en Bédar centro.', events: [
      { name: 'Fiestas patronales de San Gregorio', when: 'segunda quincena de mayo', d: 'Procesión, danzas tradicionales y degustación de migas.' },
    ], cat: 'town', lat: 37.1860, lng: -1.9610 },
  { id: 't-macael',       name: 'Macael',                  desc: 'Capital mundial del mármol blanco — el mismo de la Alhambra, el Patio de los Leones y el Vaticano. A 50 min.', best: 'Centro de Interpretación del Mármol, ruta de los talleres artesanales, canteras (con visita guiada), Iglesia de Santa María (toda de mármol).', tip: 'El Centro de Interpretación explica 5.000 años de historia del mármol macaelero. Combínalo con Cantoria y Olula (Museo Pérez Siquier).', events: [
      { name: 'Fiestas patronales en honor a la Virgen del Rosario', when: 'primera semana de octubre', d: 'Procesión, conciertos y feria del mármol.' },
      { name: 'Feria del Mármol', when: 'mayo (bienal)', d: 'Encuentro internacional con escultores y empresas del sector.' },
    ], cat: 'town', lat: 37.3850, lng: -2.2780 },
  { id: 't-olula',        name: 'Olula del Río',           desc: 'Pueblo del valle del Almanzora, sede del Museo Pérez Siquier (uno de los mejores museos de fotografía contemporánea de España).', best: 'Museo Carmen Pérez Siquier (gratuito), Plaza Mayor, mercado los miércoles.', tip: 'Imperdible para amantes del arte. El museo está abierto de mié a dom — comprueba horarios.', cat: 'town', lat: 37.3680, lng: -2.2785 },
  { id: 't-albox',        name: 'Albox',                   desc: 'Capital del valle del Almanzora. Mercados al aire libre con producto local y artesanía marroquí.', best: 'Mercadillo de los sábados (uno de los más grandes de Almería), Iglesia de Santa María, paseo del Llano.', tip: 'El mercadillo es famoso por sus precios — perfecto para producto fresco si te quedas más de una semana.', events: [
      { name: 'Fiestas patronales del Saliente', when: 'primera semana de septiembre', d: 'Romería al Santuario del Saliente, una de las más concurridas de Almería.' },
    ], cat: 'town', lat: 37.3870, lng: -2.1490 },
  { id: 't-antas',        name: 'Antas',                   desc: 'Pueblo cercano a Hestía con yacimiento argárico (Edad del Bronce) de El Argar — el más importante de la Península.', best: 'Yacimiento de El Argar, Centro de Interpretación, Cabezo de Yerba, Iglesia de Santa María.', tip: 'El yacimiento explica una de las primeras civilizaciones urbanas de Europa (3.000 a.C.). Visita guiada gratis los fines de semana.', events: [
      { name: 'Fiestas patronales del Cristo de la Salud', when: '14 de septiembre', d: 'Procesión y verbena.' },
    ], cat: 'town', lat: 37.2440, lng: -1.8920 },
  { id: 't-mazarron',     name: 'Mazarrón (Murcia)',       desc: 'Pueblo costero murciano con pasado minero romano. Playas vírgenes y aguas turquesas a 1 h 15 min.', best: 'Playa de Bolnuevo y sus erosiones geológicas (Las Gredas), Playa de la Carolina, Castillo de los Vélez, Museo Arqueológico.', tip: 'Las Gredas de Bolnuevo son formaciones erosionadas únicas — visítalas al atardecer para la mejor luz.', events: [
      { name: 'Fiestas patronales de la Purísima Concepción', when: '8 de diciembre', d: 'Procesión, hogueras y verbena.' },
      { name: 'Carnaval de Mazarrón', when: 'febrero', d: 'Comparsas y desfiles por el paseo marítimo.' },
    ], cat: 'town', lat: 37.5970, lng: -1.3170 },
  { id: 't-cuevas-velez', name: 'Cuevas de los Letreros (Vélez-Blanco)', desc: 'Abrigo rupestre con pinturas neolíticas. Aquí se descubrió el Indalo, símbolo de Almería.', best: 'Las pinturas rupestres (4.000-7.000 a.C.) Patrimonio de la Humanidad UNESCO — antílopes, brujos y el Indalo original.', tip: 'Visita guiada obligatoria. Reserva en la Oficina de Turismo de Vélez-Blanco (teléfono 950 415 354).', cat: 'town', lat: 37.6920, lng: -2.0960 },

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
  { id: 'p-cocedores',    name: 'Playa de los Cocedores',        desc: 'San Juan de los Terreros (Pulpí). Última cala almeriense antes de Murcia. Aguas turquesas y rocas de arenisca con cuevas naturales.', best: 'las cuevas labradas por el viento al sur de la cala — fotos icónicas.', tip: 'Mejor a primera hora; el parking es pequeño y se llena en agosto.', cat: 'beach', rating: 4.5, services: '🛏️ 🚻 ♿', access: '🚗 parking pequeño · pista corta', url: 'https://goo.gl/maps/pCTJ8y5mt4y4VYkE8', lat: 37.3790, lng: -1.6260 },
  { id: 'p-carolina',     name: 'Playa de la Carolina',          desc: 'San Juan de los Terreros. Larga, dorada, tranquila. Familiar.', best: 'arena fina para niños y aguas poco profundas.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿', access: '🚗 parking abundante', lat: 37.3550, lng: -1.6510 },
  { id: 'p-calabardina',  name: 'Playa de Calabardina (Águilas)', desc: 'Murcia. Pueblo costero íntimo. Cala protegida, agua transparente. 35 min.', best: 'snorkel en el extremo rocoso — buena visibilidad.', cat: 'beach', rating: 4.5, services: '🚿 🍹 🛏️ 🚻', access: '🚗 parking en pueblo', lat: 37.4020, lng: -1.5840 },
  { id: 'p-hornillo',     name: 'Playa del Hornillo (Águilas)',  desc: 'Murcia. Cala urbana de aguas tranquilas, junto a la antigua estación inglesa.', best: 'la silueta de la estación inglesa al fondo — foto de postal.', cat: 'beach', rating: 4.5, services: '🚿 🛟 🍹 🛏️ 🚻', access: '🚗 · 🚌 línea Águilas', lat: 37.4080, lng: -1.5780 },
  { id: 'p-calnegre',     name: 'Playas de Calnegre',            desc: 'Lorca-Mazarrón (Murcia). Parque regional protegido, calas vírgenes y áridas. 50 min.', best: 'soledad absoluta y fondos rocosos para snorkel.', tip: 'Lleva agua, sombra y zapatos — no hay nada en kilómetros.', cat: 'beach-hard', rating: 4.6, services: 'sin servicios', access: '🚗 pista de tierra · 🚶 corto', lat: 37.4730, lng: -1.4250 },

  // ── VERA PLAYA Y ALREDEDORES INMEDIATOS
  { id: 'p-vera',         name: 'Playa de Vera (sector textil)', desc: 'Justo al lado de Hestía. Larga, fina, agua templada. La playa de cabecera.', best: 'el atardecer caminando por la orilla hacia Garrucha.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿ 🏊 Bandera Azul', access: '🚶 desde Hestía · 🚗 parking en calle', lat: 37.2275, lng: -1.7935 },
  { id: 'p-garrucha',     name: 'Playa de Garrucha',             desc: 'Pueblo pesquero a 10 min. Buena lonja de pescado. Paseo agradable.', best: 'tomar algo en el puerto al atardecer cuando llegan los barcos.', cat: 'beach', rating: 4.4, services: '🚿 🛟 🍹 🛏️ 🚻 ♿', access: '🚗 parking en pueblo', lat: 37.1810, lng: -1.8230 },
  { id: 'p-macenas',      name: 'Playa de Macenas (Mojácar)',    desc: 'Sur de Mojácar. Mezcla de calas vírgenes y arena dorada. Castillo del s. XVIII al fondo.', best: 'la torre vigía y las calas pequeñas al sur, casi vírgenes.', cat: 'beach', rating: 4.5, services: '🍹 🛏️ parcial', access: '🚗 acceso por carretera', lat: 37.0830, lng: -1.8350 },
  { id: 'p-piedras',      name: 'Piedras de Molino (Carboneras)', desc: 'Cala icónica al lado del Algarrobico. Aguas cristalinas, fondo rocoso para snorkel.', best: 'snorkel entre las rocas — pulpos y meros si tienes suerte.', tip: 'Lleva calzado de agua: el acceso es por piedras.', cat: 'beach', rating: 4.5, services: 'sin servicios', access: '🚗 parking pequeño · 🚶 5 min', url: 'https://goo.gl/maps/eySnjWJp1YcjkSiu9', lat: 37.0200, lng: -1.8730 },

  // ── HACIA EL SUR (Cabo de Gata)
  { id: 'p-mesa-roldan',  name: 'Mesa Roldán (Carboneras)',      desc: 'Domo volcánico con faro y fortaleza. Mirador con vistas a la Playa de los Muertos. Sale en Juego de Tronos.', best: 'subir al atardecer — mirador 360° sobre el Mediterráneo.', tip: 'Aparca antes del último tramo y sube andando: la pista no siempre está bien.', cat: 'beach', rating: 4.7, services: 'mirador · sin baño', access: '🚗 hasta el faro · 🚶 corto', lat: 36.9620, lng: -1.9080 },
  { id: 'p-muertos',      name: 'Playa de los Muertos',          desc: 'Carboneras. Una de las mejores playas de España. Aguas cristalinas, cantos rodados grandes. Sin un solo servicio.', best: 'el azul del agua — el contraste con las paredes blancas es irreal.', tip: 'En julio-agosto ve a primera hora (antes de las 10) o última (a partir de las 18) — al mediodía el sol pega a plomo y el sendero quema.', cat: 'beach-hard', rating: 4.6, services: 'virgen · sin servicios', access: '🚗 parking de pago en verano · 🚶 15 min sendero pedregoso, fuerte pendiente', url: 'https://goo.gl/maps/uh1baJWHPp1uan81A', lat: 37.0050, lng: -1.8800, featured: true, featuredOrder: 1 },
  { id: 'p-enmedio',      name: 'Cala de Enmedio',               desc: 'Agua Amarga. Nuestra favorita. Arena fina blanca enmarcada por roca esculpida. Casi virgen porque exige caminar.', best: 'las roca esculpidas por el viento al fondo — escenario de cuento.', tip: 'En verano, primera hora del día: la luz al amanecer sobre la roca blanca es magia, y a mediodía no hay sombra.', cat: 'beach-hard', rating: 4.7, services: 'virgen · sin servicios', access: '🚗 hasta Agua Amarga · 🚶 30 min campo a través', url: 'https://goo.gl/maps/i72YXUhFgBzi7vhf6', lat: 36.9540, lng: -1.9740, featured: true, featuredOrder: 4 },
  { id: 'p-plomo',        name: 'Cala del Plomo',                desc: 'Agua Amarga. Cala virgen de arena oscura. Aguas cristalinas, snorkel.', best: 'snorkel en el extremo norte — la roca volcánica esconde mucha vida.', tip: 'Lleva nevera y sombra: no hay un solo árbol.', cat: 'beach-hard', rating: 4.6, services: 'virgen · sin servicios', access: '🚗 pista corta · 🚶 30 min a pie', lat: 36.9460, lng: -1.9690 },
  { id: 'p-aguamarga',    name: 'Playa de Agua Amarga',          desc: 'Pueblo blanco con encanto, calas pequeñas y restaurantes a pie de arena.', best: 'cenar en La Villa o en Asador La Chumbera con los pies en la arena.', cat: 'beach', rating: 4.5, services: '🚿 🍹 🛏️ 🚻', access: '🚗 parking en pueblo', lat: 36.9395, lng: -2.0000 },
  { id: 'p-negras',       name: 'Playa de Las Negras',           desc: 'Pueblo bohemio con cantos rodados negros y agua cristalina. Punto de salida hacia la Cala de San Pedro.', best: 'tomar una caña en La Caleta viendo las barcas pesqueras.', cat: 'beach', rating: 4.4, services: '🚿 🍹 🚻', access: '🚗 parking a la entrada del pueblo · ⛵ taxi-barca a San Pedro', lat: 36.8770, lng: -2.0030 },
  { id: 'p-san-pedro',    name: 'Cala de San Pedro',             desc: 'Comunidad hippie estable, fuente de agua dulce, sin servicios. Solo accesible a pie o por barca.', best: 'la mezcla irrepetible: ruinas, fuente natural y comunidad alternativa.', tip: 'En verano coge el taxi-barca desde Las Negras (15 min); el sendero costero exige forma física y son 90 min al sol.', cat: 'beach-hard', rating: 4.7, services: 'virgen · fuente natural', access: '🚶 90 min desde Las Negras (sendero costero) · ⛵ taxi-barca en verano', lat: 36.8540, lng: -1.9890 },
  { id: 'p-playazo',      name: 'El Playazo de Rodalquilar',     desc: 'Cabo de Gata. De fácil acceso, larga, rocas en los extremos. Castillo de San Ramón al sur.', best: 'subir al Castillo de San Ramón al final del día — vistas perfectas.', tip: 'En julio-agosto el parking se llena: ve antes de las 10:30 o después de las 18:00.', cat: 'beach', rating: 4.6, services: '🚻 mínimos · sin chiringuito', access: '🚗 hasta el aparcamiento al pie de la playa', url: 'https://goo.gl/maps/bu6fEsoT1mHC9j2w6', lat: 36.8470, lng: -2.0230 },
  { id: 'p-isleta',       name: 'La Isleta del Moro',            desc: 'Pueblo pesquero diminuto con calas. Snorkel y comer en La Ola junto al mar.', best: 'comer pescado fresco en La Ola con las barcas detrás.', tip: 'La cala del Peñón Blanco es la mejor para snorkel; ve con gafas.', cat: 'beach', rating: 4.5, services: '🍹 🚻', access: '🚗 parking en pueblo · 🚶 corto', url: 'https://maps.google.com?q=Playa+del+Penon+Blanco', lat: 36.7970, lng: -2.0630 },
  { id: 'p-genoveses',    name: 'Playa de los Genoveses',        desc: 'San José. Bahía perfecta de medio km, dunas con sabinas. Sin servicios para preservar el paraje.', best: 'la bahía vista desde la duna sur — postal de Cabo de Gata.', tip: 'En julio-agosto, primera hora (7:30-10) o última (18:30 hasta puesta de sol). El acceso al coche está restringido — coge el bus o la bici desde San José.', cat: 'beach', rating: 4.7, services: 'virgen · 🛟 verano', access: '🚌 bus desde San José en verano (acceso restringido al coche) · 🚲 carril bici · 🚶 25 min desde San José', lat: 36.7610, lng: -2.0890, featured: true, featuredOrder: 3 },
  { id: 'p-monsul',       name: 'Playa de Mónsul',               desc: 'San José. Famosa por la duna y la roca volcánica. Sale en El bueno, el feo y el malo y en Indiana Jones.', best: 'la roca volcánica del centro y la duna gigante al oeste.', tip: 'Atardecer en julio-agosto: la roca se enciende en naranja sobre las 20:30 y se vacía la playa. A primera hora también es mágica y sin gente.', cat: 'beach', rating: 4.7, services: '🚻 🛟 verano · sin chiringuito', access: '🚌 bus desde San José en verano (acceso restringido al coche) · 🚲 carril bici', lat: 36.7460, lng: -2.1130, featured: true, featuredOrder: 2 },
  { id: 'p-barronal',     name: 'Playa del Barronal',            desc: 'San José. Más virgen que Mónsul. Detrás de las dunas de la pista. Una de nuestras favoritas.', best: 'caminar entre dunas hasta llegar y encontrar la cala vacía.', tip: 'En verano ve temprano o al final del día — sin sombra y con calor extremo.', cat: 'beach', rating: 4.6, services: 'virgen · sin servicios', access: '🚌 bus + 🚶 10 min andando entre dunas', url: 'https://goo.gl/maps/sF2xaKDPrHEgjpxv6', lat: 36.7430, lng: -2.1180, featured: true, featuredOrder: 5 },
  { id: 'p-medialuna',    name: 'Cala de la Media Luna',         desc: 'San José. Pequeña, simétrica, mar transparente. Se llega andando desde el Barronal.', best: 'su forma perfecta de media luna — solo se ve desde el sendero costero.', tip: 'Combínala con el Barronal: 10 min andando entre las dos.', cat: 'beach-hard', rating: 4.6, services: 'virgen', access: '🚶 desde el Barronal por sendero costero', url: 'https://goo.gl/maps/ngDbWgoBfAdH5x4S8', lat: 36.7415, lng: -2.1195 },
  { id: 'p-cabogata',     name: 'Las Salinas (Cabo de Gata pueblo)', desc: 'Frente a las salinas con flamencos. Faro al fondo. Atardecer espectacular.', best: 'los flamencos en las salinas al amanecer o atardecer.', tip: 'Atardecer del lado del Faro de Cabo de Gata es uno de los más fotografiados de la provincia.', cat: 'beach', rating: 4.5, services: '🚿 🍹 🛏️ 🚻 ♿', access: '🚗 parking gratuito · 🚌 línea M-100', lat: 36.7530, lng: -2.2250 },
  { id: 'p-fabriquilla',  name: 'La Fabriquilla / El Corralete', desc: 'Última cala antes del Faro de Cabo de Gata. Roca volcánica, agua transparente. Punto más al sur.', best: 'el faro y el Arrecife de las Sirenas justo después.', tip: 'Encadena con el mirador del Arrecife de las Sirenas al atardecer.', cat: 'beach', rating: 4.5, services: 'mínimos', access: '🚗 hasta el faro', lat: 36.7270, lng: -2.1950 },

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

  // ==========================================================
  // GASOLINERAS — verificadas en mayo 2026 vía repsol.es, Cepsa,
  // Plenoil y observatorio de precios. Horarios y precios pueden
  // cambiar; el link de Google Maps siempre apunta al lugar real
  // por búsqueda directa, así que aunque el listado se quede
  // viejo, el navegador llega al sitio correcto.
  // ==========================================================
  { id: 'gas-repsol-vera',    name: 'Repsol Vera (C/ Ancha)',
    desc: 'La estación de servicio más conveniente desde Vera Playa. Justo en la entrada de Vera pueblo viniendo desde la playa. Distancia: ~7 min en coche (5,5 km).',
    specialty: 'Marca: Repsol · Servicios: tienda, café, aseos, parking.',
    tip: 'Horario habitual: 6:30 – 22:30 todos los días. Por la noche queda fuera de servicio — para repostar de madrugada, usa Plenoil o BARAZA+.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Repsol+Vera+Calle+Ancha+Almeria',
    lat: 37.2462, lng: -1.8645, featured: true, featuredOrder: 1 },
  { id: 'gas-plenoil-vera',   name: 'Plenoil Vera (Crta. de Cuevas)',
    desc: 'Gasolinera low-cost, automática, abierta 24 h sin personal. Suele ser de las más baratas de la zona (1,53 € gasolina 95, 1,85 € diésel en mayo 2026). Distancia: ~9 min en coche (7 km).',
    specialty: 'Marca: Plenoil · Solo surtidor (sin tienda) · Pago con tarjeta o app.',
    tip: 'Útil para repostar barato y para horario nocturno. No hay aseos ni café.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Plenoil+Vera+Carretera+Cuevas',
    lat: 37.2540, lng: -1.8580, featured: true, featuredOrder: 2 },
  { id: 'gas-baraza-vera',    name: 'BARAZA+ (N-340A km 533)',
    desc: 'En la nacional N-340A, salida natural si vas hacia Murcia/Cartagena por la antigua. Abierta 24 horas. Distancia: ~8 min en coche (6,5 km).',
    specialty: 'Marca: independiente · Servicios: tienda 24 h, aseos, café automático.',
    tip: 'Sirve también para coger la N-340 sin volver al pueblo.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=BARAZA+gasolinera+N-340A+Vera',
    lat: 37.2490, lng: -1.8970 },
  { id: 'gas-vera-diesel',    name: 'Vera Diesel (Ctra. de Ronda)',
    desc: 'Estación local con buena reputación. Distancia: ~7 min en coche (5,5 km).',
    specialty: 'Marca: independiente · Servicios: tienda, lavadero de coches.',
    tip: 'Horario: 7:00 – 22:00 todos los días. Teléfono: 950 39 34 76.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Vera+Diesel+Carretera+Ronda+Vera+Almeria',
    lat: 37.2475, lng: -1.8620 },
  { id: 'gas-repsol-garrucha',name: 'Repsol Garrucha (Puerto)',
    desc: 'Junto al puerto pesquero de Garrucha. Ideal si vas a comer pescado o pasear por el paseo marítimo. Distancia: ~10 min en coche (5,5 km).',
    specialty: 'Marca: Repsol · Servicios: tienda, aseos.',
    tip: 'Horario: 7:00 – 22:00 aprox. Teléfono: 950 46 01 01. Cierra de madrugada.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Repsol+Garrucha+Puerto',
    lat: 37.1808, lng: -1.8210 },
  { id: 'gas-cepsa-garrucha', name: 'Cepsa La Garrucha (AL-152 Garrucha-Turre)',
    desc: 'En la carretera entre Garrucha y Turre. Útil si vienes/vas hacia Mojácar o Sierra Cabrera. Distancia aproximada: ~15 min en coche (~15 km) desde Vera Playa.',
    specialty: 'Marca: Cepsa (grupo Moeve) · Servicios: tienda, café, aseos.',
    tip: 'Horario habitual: 7:00 – 22:00.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Cepsa+La+Garrucha+AL-152+Turre',
    lat: 37.1700, lng: -1.8650 },
  { id: 'gas-repsol-mojacar', name: 'Repsol Mojácar (AL-118 km 0,6)',
    desc: 'En la carretera entre Mojácar pueblo y Mojácar Playa. Si haces excursión a Mojácar, repostar a la vuelta sale de paso. Distancia aproximada: ~15-18 min en coche (~14-15 km) desde Vera Playa.',
    specialty: 'Marca: Repsol · Servicios: tienda, café, aseos.',
    tip: 'Horario habitual: 6:30 – 22:30.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Repsol+Mojacar+AL-118',
    lat: 37.1380, lng: -1.8475 },
  { id: 'gas-repsol-palomares',name: 'Repsol Palomares (ALP-118)',
    desc: 'En la carretera hacia Palomares/Cuevas del Almanzora, paso natural si vas al norte (Aguilas, Mar Menor). Distancia aproximada: ~7 min en coche (~6 km) desde Vera Playa.',
    specialty: 'Marca: Repsol · Servicios: tienda básica, aseos.',
    tip: 'Horario habitual: 7:00 – 21:00.',
    cat: 'fuel', url: 'https://www.google.com/maps/search/?api=1&query=Repsol+Palomares+Almeria',
    lat: 37.2370, lng: -1.7700 },

  // ==========================================================
  // PUNTOS DE CARGA ELÉCTRICA — verificados mayo 2026 vía
  // Electromaps, MiCarburante e Iberdrola. La red cambia rápido;
  // siempre comprueba disponibilidad en la app antes de salir.
  // ==========================================================
  { id: 'ev-mercadona-vera-mz', name: 'Mercadona Vera (Av. Medina Azahara)',
    desc: 'Punto de carga en el parking subterráneo del Mercadona de Vera Playa. 2 conectores AC tipo 2 (hasta 22 kW). Gratuito mientras compras. Distancia aproximada: ~5 min en coche (~3 km) desde Vera Playa.',
    specialty: 'Tipo: AC (carga lenta-rápida) · Conector: Type 2 · Hasta 22 kW.',
    tip: 'Horario igual que la tienda: lunes-sábado 9:00 – 21:30, domingos cerrado. Pensado para 1-2 h durante la compra; no es carga rápida.',
    cat: 'ev-charge', url: 'https://www.google.com/maps/search/?api=1&query=Mercadona+Vera+Medina+Azahara',
    lat: 37.2360, lng: -1.7935, featured: true, featuredOrder: 1 },
  { id: 'ev-mercadona-vera-pueblo', name: 'Mercadona Vera Pueblo (C/ Baza)',
    desc: 'Segunda ubicación de Mercadona en Vera pueblo, con 2 conectores AC tipo 2. Gratuito para clientes. Distancia aproximada: ~10 min en coche (~6 km) desde Vera Playa.',
    specialty: 'Tipo: AC · Conector: Type 2 · Hasta 22 kW (la potencia real entregada varía 4-22 kW según la hora).',
    tip: 'Horario: lunes-sábado 9:00 – 21:30. Aparcamiento accesible. Combina con la compra para sacarle partido.',
    cat: 'ev-charge', url: 'https://www.google.com/maps/search/?api=1&query=Mercadona+Vera+Pueblo+Calle+Baza',
    lat: 37.2491, lng: -1.8639 },
  { id: 'ev-lidl-albox',      name: 'Lidl Albox (ruta hacia interior)',
    desc: 'Punto de carga rápida del programa público de Lidl. CCS, CHAdeMO y Type 2. Primeros 30 min gratis. Distancia: ~35 min en coche (35 km) hacia el interior por la A-334.',
    specialty: 'Tipo: DC rápida · Conectores: CCS · CHAdeMO · Type 2 · Hasta 150 kW.',
    tip: 'Es la mejor opción de carga rápida real cerca de Vera. Si vas a Mojácar/Almería y necesitas potencia, mejor desviarte aquí.',
    cat: 'ev-charge', url: 'https://www.google.com/maps/search/?api=1&query=Lidl+Albox+puntos+recarga+coche+electrico',
    lat: 37.3893, lng: -2.1424, featured: true, featuredOrder: 2 },
  { id: 'ev-electromaps',     name: 'Mapa completo (Electromaps)',
    desc: 'Mapa actualizado con todos los puntos de carga públicos de Vera y alrededores. Incluye estado en tiempo real (libre/ocupado), precios y reseñas de otros conductores.',
    specialty: 'Es la fuente más fiable para EV en España.',
    tip: 'Recomendamos descargar la app antes de venir: planifica con tu coche y autonomía real.',
    cat: 'ev-charge', url: 'https://www.electromaps.com/en/charging-stations/spain/almeria/vera',
    lat: 37.2491, lng: -1.8639 },
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
    checkin: {
      title: 'Llegada y salida',
      intro: 'Lo tienes todo cubierto: Fran te escribirá unos días antes de tu llegada para acordar la modalidad que mejor te encaje y los detalles concretos (dirección exacta, código del portal, cómo entrar). No tienes de qué preocuparte — solo decirle a qué hora aproximada llegas.',
      modalitiesTitle: 'Dos modalidades de check-in',
      modalities: [
        { tag: 'Autónoma', body: 'Llegas y entras directamente. Fran te pasa por mensaje el código de la urbanización, el acceso a la caja-llaves y las instrucciones paso a paso. Útil si vienes con vuelo nocturno o si prefieres tu ritmo.' },
        { tag: 'Presencial', body: 'Te recibe Fran en persona, te enseña la casa y te resuelve cualquier duda en el momento. Horario de recepción presencial: 15:00 – 21:00. Si tu llegada cae fuera, pasamos a la modalidad autónoma sin más.' },
      ],
      garageTitle: 'Plaza de garaje',
      garageIntro: 'Todos los apartamentos llevan plaza de garaje incluida en la urbanización Pueblo Salinas. La plaza que te corresponde según tu Hestía es:',
      garageNote: 'A confirmar con Fran antes de tu llegada — alguna semana puede haber rotación por mantenimiento.',
      checkoutTitle: 'Check-out',
      checkoutBody: 'La salida es siempre antes de las 11:00. Deja las llaves donde Fran te indique (caja-llaves o entrega presencial, según hayas entrado). La basura, en los contenedores de la urbanización; las toallas y sábanas, sobre la cama — del resto se encarga el equipo de limpieza.',
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
    rules: {
      title: 'Normas de Hestía',
      intro: 'Estas normas vienen del contrato que firmaste con nosotros. Son sencillas y están pensadas para que tú, los próximos huéspedes y nuestros vecinos disfrutemos de Hestía.',
      items: [
        { icon: '🛒', t: 'Reponed lo que consumáis',
          d: 'Hestía dispone de productos consumibles. Si gastáis o consumís algo, intentad reponerlo — salvo el kit de bienvenida, que es un pequeño regalo nuestro. Reponed también lo que consumáis fuera de ese kit.' },
        { icon: '🌿', t: 'Cuidad el medio ambiente',
          d: 'No malgastéis la luz ni el agua. No dejéis el aire acondicionado con las ventanas abiertas o cuando salgáis. Sentíos como en vuestro hogar.' },
        { icon: '🪑', t: 'Recoged la terraza si salís',
          d: 'Cojines, toldo y plantas — especialmente si hay viento, lluvia o predicción de mal tiempo.' },
        { icon: '🛏️', t: 'Cuidad equipamiento y mobiliario',
          d: 'No extraigáis nada de Hestía. Tras vuestra estancia haremos inventario; cualquier deterioro o sustracción será responsabilidad vuestra.' },
        { icon: '🤫', t: 'Respetad el descanso',
          d: 'El vuestro y el de los vecinos. Evitad ruidos, música o jaleo a deshoras.' },
        { icon: '🚪', t: 'Hestía es solo para vosotros',
          d: 'No para terceros que no figuren en la reserva.' },
        { icon: '🕒', t: 'Check-in 15:00 · Check-out 11:00',
          d: 'Necesitamos un margen considerable para dejar Hestía a punto para la siguiente llegada. Late check-out y early check-in sujetos a disponibilidad.' },
        { icon: '🐾', t: 'Mascotas solo con aprobación previa',
          d: 'No están permitidas salvo que nos lo hayáis pedido explícitamente y nosotros lo hayamos aprobado.' },
        { icon: '🚭', t: 'No se fuma dentro de Hestía',
          d: 'En toda la casa está prohibido.' },
        { icon: '🏖️', t: 'Toallas solo dentro de Hestía',
          d: 'No las uséis en la piscina ni en la playa. Para esos sitios, llevad las vuestras.' },
        { icon: '🌬️', t: 'Tender solo en el tendedero',
          d: 'No colguéis ropa en las barandillas ni en la terraza.' },
        { icon: '🏊', t: 'Respetad las normas de la urbanización',
          d: 'Especialmente el horario de piscina y zonas comunes. El incumplimiento es responsabilidad vuestra.' },
        { icon: '👙', t: 'Urbanización textil',
          d: 'No están permitidos el naturismo ni el topless en ninguna zona de la urbanización.' },
        { icon: '👨‍👩‍👧', t: 'Menores bajo responsabilidad de sus padres',
          d: 'Cualquier incidente con menores en Hestía o en zonas comunes es responsabilidad de sus padres o tutores.' },
        { icon: '🛎️', t: 'Servicios comunes y exterior',
          d: 'Lo que pase fuera de Hestía no es responsabilidad nuestra — pero siempre intentaremos ayudaros.' },
        { icon: '🧺', t: 'Dejad Hestía limpia y recogida',
          d: 'De las sábanas y toallas nos encargamos nosotros. Por favor, no las lavéis con ropa de otro color.' },
      ],
    },
    surroundings: {
      title: 'Alrededores y recomendaciones',
      intro: 'Sería imposible ofrecer un catálogo completo de recomendaciones sobre los alrededores de Hestía, pues sería infinito. Para empezar a explorar te recomendamos estas fuentes:',
      disclaimer_title: 'Sobre lo que leerás a continuación',
      disclaimer: 'Todas las distancias y tiempos de coche son aproximados y se calculan desde la urbanización Vera Playa como punto común a las tres Hestías (que están a menos de 2 km entre sí). Conviene comprobar la ruta exacta en Google Maps antes de salir, sobre todo en verano cuando el tráfico se carga. Los horarios de bares, restaurantes y comercios cambian con la temporada y pueden alterarse sin previo aviso — siempre que puedas, llama o consulta su web antes de ir. Las valoraciones (⭐) y los "best" que destacamos son recomendaciones personales y dependen del momento: un sitio brillante en mayo puede estar saturado en agosto, un chiringuito impecable en temporada puede cerrar en invierno, y el aforo o el tiempo cambian la experiencia. Tómalo como guía de salida, no como verdad absoluta.',
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
    wifi: {
      title: 'Mi WiFi',
      intro: 'Conéctate sin pedir permiso — el WiFi de Hestía está abierto a sus huéspedes.',
      ssidLabel: 'Red',
      ssidValue: 'Hestía',
      passLabel: 'Contraseña',
      passValue: 'Hestiavera',
      note: 'Si la contraseña no funciona, la actualizada está en una pegatina pegada al router. El router suele estar cerca del sofá, escondido en algún hueco o al lado de la tele. Avísanos si no lo encuentras y te lo decimos.',
    },
    phones: {
      title: 'Teléfonos y datos de utilidad',
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
    checkin: {
      title: 'Arrival & departure',
      intro: 'You are covered: Fran will message you a few days before your arrival to agree on the option that suits you best and share the specifics (exact address, gate code, how to get in). Nothing to worry about — just let him know your approximate arrival time.',
      modalitiesTitle: 'Two check-in options',
      modalities: [
        { tag: 'Self check-in', body: 'You arrive and let yourself in. Fran sends you the gate code, lockbox access and step-by-step instructions by message. Handy for late flights or if you prefer your own pace.' },
        { tag: 'In-person check-in', body: 'Fran greets you, shows you around and answers anything on the spot. In-person reception hours: 15:00 – 21:00. If your arrival falls outside that window, we switch to self check-in — no problem.' },
      ],
      garageTitle: 'Garage spot',
      garageIntro: 'Every apartment comes with an included garage spot in the Pueblo Salinas complex. The spot assigned to your Hestía is:',
      garageNote: 'Confirm with Fran before arrival — occasional rotation for maintenance.',
      checkoutTitle: 'Check-out',
      checkoutBody: 'Check-out is always before 11:00. Leave the keys wherever Fran tells you (lockbox or in-person, depending on how you arrived). Bin bags go in the complex containers; towels and sheets stay on the bed — the cleaning team handles the rest.',
    },
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
    rules: {
      title: 'Hestía house rules',
      intro: 'These rules come from the contract you signed. They are simple — they exist so you, future guests and our neighbours all enjoy Hestía.',
      items: [
        { icon: '🛒', t: 'Replace what you use up',
          d: 'Hestía has consumable supplies. If you use or finish something, please try to replace it — except the welcome kit, which is a small gift from us. Replace also what you consume beyond that kit.' },
        { icon: '🌿', t: 'Look after the environment',
          d: 'Do not waste water or electricity. Never run the AC with windows open or when you leave. Treat it as your own home.' },
        { icon: '🪑', t: 'Tidy the terrace before going out',
          d: 'Cushions, awning and plants — especially when there is wind, rain or bad weather forecast.' },
        { icon: '🛏️', t: 'Care for furniture and equipment',
          d: 'Do not remove anything from Hestía. After your stay we run an inventory; any damage or loss will be your responsibility.' },
        { icon: '🤫', t: 'Respect rest hours',
          d: 'Yours and your neighbours\'. Avoid noise, music or loud gatherings late at night or early morning.' },
        { icon: '🚪', t: 'Hestía is only for you',
          d: 'Not for third parties who are not on the booking.' },
        { icon: '🕒', t: 'Check-in 15:00 · Check-out 11:00',
          d: 'We need a considerable window to prepare Hestía for the next arrival. Late check-out and early check-in are subject to availability.' },
        { icon: '🐾', t: 'Pets only with prior approval',
          d: 'Not allowed unless you have asked us and we have approved them explicitly.' },
        { icon: '🚭', t: 'No smoking inside Hestía',
          d: 'Strictly forbidden in the whole apartment.' },
        { icon: '🏖️', t: 'Towels stay inside Hestía',
          d: 'Do not take them to the pool or the beach. Use your own for those.' },
        { icon: '🌬️', t: 'Hang laundry on the drying rack only',
          d: 'Not on railings or terrace edges.' },
        { icon: '🏊', t: 'Respect the community rules',
          d: 'Especially pool hours and shared areas. Breaking those rules is your responsibility.' },
        { icon: '👙', t: 'Textile community',
          d: 'Naturism and topless are not allowed anywhere in the urbanisation.' },
        { icon: '👨‍👩‍👧', t: 'Minors under their parents\' responsibility',
          d: 'Any incident with minors inside Hestía or in shared areas is the responsibility of their parents/guardians.' },
        { icon: '🛎️', t: 'Common services and outside areas',
          d: 'What happens outside Hestía is not our responsibility — but we will always try to help.' },
        { icon: '🧺', t: 'Leave Hestía clean and tidy',
          d: 'We take care of sheets and towels. Please do not wash them with coloured laundry.' },
      ],
    },
    surroundings: {
      title: 'Surroundings and recommendations',
      intro: 'A complete catalogue of recommendations for the area around Hestía would be endless. To start exploring, we suggest these sources:',
      disclaimer_title: 'About what you are about to read',
      disclaimer: 'All distances and drive times are approximate and measured from the Vera Playa complex as a common reference for the three Hestías (which sit within 2 km of each other). Check the exact route on Google Maps before heading out, especially in summer when traffic builds up. Opening hours for bars, restaurants and shops change with the season and may be altered without notice — when in doubt, phone ahead or check their website. Star ratings (⭐) and "best" picks are personal recommendations and depend on the moment: a place that shines in May can be saturated in August, an impeccable beach shack in season may close in winter, and crowd or weather change the experience. Take this as a starting guide, not gospel.',
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
    wifi: {
      title: 'My WiFi',
      intro: 'Connect without asking — Hestía\'s WiFi is open to its guests.',
      ssidLabel: 'Network',
      ssidValue: 'Hestía',
      passLabel: 'Password',
      passValue: 'Hestiavera',
      note: 'If the password does not work, the current one is on a sticker attached to the router. The router is usually near the sofa, tucked into a nook, or next to the TV. Let us know if you cannot find it and we will tell you where.',
    },
    phones: {
      title: 'Useful data and phone numbers',
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
    pdf: 'downloads/Hestia-Mar-Guia.pdf',
    garageSpot: '160',
    es: {
      cover_tagline: 'El campo de olivos llega al mar. Donde el descanso encuentra su raíz.',
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
      cover_tagline: 'Where the olive grove meets the sea. Rest, with its roots in place.',
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
    pdf: 'downloads/Hestia-Thalassa-Guia.pdf',
    garageSpot: '163',
    es: {
      cover_tagline: 'Ático sobre el mar y el Salar de los Canos. Donde el horizonte se ensancha.',
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
      cover_tagline: 'Penthouse over the sea and the Salar de los Canos. Where the horizon widens.',
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
    pdf: 'downloads/Hestia-Salinas-Guia.pdf',
    garageSpot: '290',
    es: {
      cover_tagline: 'Junto a las salinas. Donde la luz se queda más tiempo.',
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
        { id: 'urbanizacion', title: 'Mi urbanización', body: 'Mi urbanización es textil — para olvidarse del mundo y cerca de todo. Tu plaza subterránea es la nº 290. Tienes entrada y salida controladas por código, acceso/barrera a la zona 2 (donde está Hestía), acceso peatonal desde la urbanización, piscina y pistas deportivas. Hestía Vera Salinas está en bloque 22, planta 1, puerta 7.',
          points: [
            'Entrada y salida a la urbanización controlada por código.',
            'Acceso/barrera a la zona 2, donde está Hestía.',
            'Plaza de garaje de Hestía. Número 290.',
            'Acceso peatonal a Hestía desde la urbanización.',
            'Hestía Vera Salinas. Bloque 22, planta 1, apartamento 7.',
            'Piscina.',
            'Pistas deportivas.',
          ],
          recs: [
          'La urbanización merece la pena recorrerla. Los jardines, los riachuelos, las aves, otros pequeños animales, el desierto alrededor. Es un lugar sin igual, para disfrutar con los más pequeños con toda la tranquilidad de un recinto cerrado.',
          'Cuida las plantas y la limpieza de la urbanización.',
          'Respeta las zonas comunes y las normas de la urbanización.',
          'Respeta a los vecinos.',
          'Llama a Conserjería para reservar cualquier espacio común.',
        ]},
      ],
    },
    en: {
      cover_tagline: 'Next to the salt flats. Where light lingers longer.',
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
        { id: 'urbanizacion', title: 'My complex', body: 'My complex is textile-free — to forget the world while staying near everything. Your underground parking space is nº 290. Code-controlled entrance, barrier to zone 2 (where Hestía is), pedestrian access from the complex, swimming pool and sports courts. Hestía Vera Salinas is at block 22, floor 1, unit 7.',
          points: [
            'Entrance and exit to the complex controlled by code.',
            'Access/barrier to zone 2, where Hestía is.',
            'Hestía parking space. Number 290.',
            'Pedestrian access to Hestía from the complex.',
            'Hestía Vera Salinas. Block 22, floor 1, apartment 7.',
            'Swimming pool.',
            'Sports courts.',
          ],
          recs: [
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
// CompactPlaceItem — versión reducida del lugar (no-featured).
// Muestra solo headline (nombre + tier + rating). Click para
// expandir descripción/specialty/tip/events si los tiene.
// ================================================================
const CompactPlaceItem = ({ p, lang }) => {
  const [open, setOpen] = React.useState(false);
  const hasDetails = p.desc || p.specialty || p.best || p.tip ||
                     p.services || p.access || p.level ||
                     (Array.isArray(p.events) && p.events.length > 0);
  const mapHref = p.url
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' Almería')}`;
  return (
    <li className={`ag-place ag-place-compact${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="ag-place-compact-head"
        onClick={() => hasDetails && setOpen(o => !o)}
        aria-expanded={open}
        disabled={!hasDetails}>
        <span className="ag-place-name">{p.name}</span>
        {p.tier && <span className="ag-place-tier">{p.tier}</span>}
        {typeof p.rating === 'number' && (
          <span className="ag-place-rating">⭐ {p.rating.toFixed(1)}</span>
        )}
        {hasDetails && (
          <span className={`ag-place-compact-chev ${open ? 'open' : ''}`} aria-hidden="true">↓</span>
        )}
      </button>
      {open && (
        <div className="ag-place-compact-body">
          {p.desc && <span className="ag-place-desc">{p.desc}</span>}
          {p.specialty && (
            <span className="ag-place-specialty">
              <span className="ag-place-specialty-tag">{lang === 'es' ? 'Pide:' : 'Order:'}</span>
              {' '}{p.specialty}
            </span>
          )}
          {p.best && (
            <span className="ag-place-best">
              <span className="ag-place-best-tag">{lang === 'es' ? 'Lo mejor:' : 'Highlight:'}</span>
              {' '}{p.best}
            </span>
          )}
          {p.tip && (
            <span className="ag-place-tip">
              <span className="ag-place-tip-tag">{lang === 'es' ? 'Tip:' : 'Tip:'}</span>
              {' '}{p.tip}
            </span>
          )}
          {Array.isArray(p.events) && p.events.length > 0 && (
            <div className="ag-place-events">
              <span className="ag-place-events-tag">
                {lang === 'es' ? 'Fiestas y eventos' : 'Festivals & events'}
              </span>
              <ul className="ag-place-events-list">
                {p.events.map((e, i) => (
                  <li key={i} className="ag-place-event">
                    <span className="ag-place-event-name">{e.name}</span>
                    {e.when && <span className="ag-place-event-when"> · {e.when}</span>}
                    {e.d && <span className="ag-place-event-desc"> — {e.d}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.services && <span className="ag-place-services">{p.services}</span>}
          {p.access && <span className="ag-place-access">{p.access}</span>}
          {p.level && (
            <span className="ag-place-level">
              <span className="ag-place-level-tag">{lang === 'es' ? 'Dificultad:' : 'Level:'}</span>
              {' '}{p.level}
            </span>
          )}
          <a className="ag-place-link" href={mapHref} target="_blank" rel="noopener">
            {lang === 'es' ? 'Cómo llegar' : 'Directions'} <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </li>
  );
};

// ================================================================
// CatGroup — una categoría plegable de la sección "Alrededores".
// Click en el head abre/cierra. Animación max-height suave.
// ================================================================
// ================================================================
// DishesGuide — platos típicos al inicio de Sabores. Tarjeta por
// plato: icono + nombre + región + descripción + tip + sitios para
// probarlo. Los sitios son chips clicables que enlazan a la anchor
// del lugar dentro de la guía (PLACES tiene id) o a Google Maps.
// ================================================================
const DishesGuide = ({ lang }) => {
  if (!Array.isArray(ICONIC_DISHES) || ICONIC_DISHES.length === 0) return null;
  const placeById = id => PLACES.find(p => p.id === id);
  return (
    <div className="ag-dishes">
      <h3 className="ag-h3 ag-dishes-title">
        {lang === 'es' ? 'Platos típicos · pídelos por nombre' : 'Iconic dishes · order them by name'}
      </h3>
      <p className="ag-para ag-dishes-intro">
        {lang === 'es'
          ? 'Una selección de lo que merece la pena probar en la zona — entre Almería y Murcia — con los sitios concretos donde lo bordan.'
          : 'A short list of what is worth trying in the area — between Almería and Murcia — with the specific spots that nail each dish.'}
      </p>
      <div className="ag-dishes-grid">
        {ICONIC_DISHES.map(d => {
          const name = lang === 'es' ? d.name_es : d.name_en;
          const region = lang === 'es' ? d.region_es : d.region_en;
          const desc = lang === 'es' ? d.desc_es : d.desc_en;
          const tip = lang === 'es' ? d.tip_es : d.tip_en;
          const whereText = lang === 'es' ? d.where_es : d.where_en;
          const refs = (d.placeIds || []).map(placeById).filter(Boolean);
          return (
            <article key={d.id} className="ag-dish-card">
              <div className="ag-dish-head">
                <span className="ag-dish-icon" aria-hidden="true">{d.icon}</span>
                <div className="ag-dish-titles">
                  <h4 className="ag-dish-name">{name}</h4>
                  <span className="ag-dish-region">{region}</span>
                </div>
              </div>
              <p className="ag-dish-desc">{desc}</p>
              {tip && (
                <p className="ag-dish-tip">
                  <span className="ag-dish-tip-tag">{lang === 'es' ? 'Tip:' : 'Tip:'}</span> {tip}
                </p>
              )}
              {refs.length > 0 && (
                <div className="ag-dish-where">
                  <span className="ag-dish-where-tag">{lang === 'es' ? 'Dónde:' : 'Where:'}</span>
                  <span className="ag-dish-chips">
                    {refs.map(p => (
                      <a key={p.id} className="ag-dish-chip"
                         href={p.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' Almería')}`}
                         target="_blank" rel="noopener">
                        {p.name} <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </span>
                </div>
              )}
              {refs.length === 0 && whereText && (
                <p className="ag-dish-where ag-dish-where-text">
                  <span className="ag-dish-where-tag">{lang === 'es' ? 'Dónde:' : 'Where:'}</span> {whereText}
                  {d.extLink && (
                    <> <a className="ag-dish-extlink" href={d.extLink} target="_blank" rel="noopener">
                      {lang === 'es' ? 'mapa' : 'map'} <span aria-hidden="true">↗</span>
                    </a></>
                  )}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

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
        {p.specialty && (
          <span className="ag-place-specialty">
            <span className="ag-place-specialty-tag">{lang === 'es' ? 'Pide:' : 'Order:'}</span>
            {' '}{p.specialty}
          </span>
        )}
        {p.best && (
          <span className="ag-place-best">
            <span className="ag-place-best-tag">{lang === 'es' ? 'Lo mejor:' : 'Highlight:'}</span>
            {' '}{p.best}
          </span>
        )}
        {p.tip && (
          <span className="ag-place-tip">
            <span className="ag-place-tip-tag">{lang === 'es' ? 'Tip:' : 'Tip:'}</span>
            {' '}{p.tip}
          </span>
        )}
        {Array.isArray(p.events) && p.events.length > 0 && (
          <div className="ag-place-events">
            <span className="ag-place-events-tag">
              {lang === 'es' ? 'Fiestas y eventos' : 'Festivals & events'}
            </span>
            <ul className="ag-place-events-list">
              {p.events.map((e, i) => (
                <li key={i} className="ag-place-event">
                  <span className="ag-place-event-name">{e.name}</span>
                  {e.when && <span className="ag-place-event-when"> · {e.when}</span>}
                  {e.d && <span className="ag-place-event-desc"> — {e.d}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
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
        {p.level && (
          <span className="ag-place-level">
            <span className="ag-place-level-tag">{lang === 'es' ? 'Dificultad:' : 'Level:'}</span>
            {' '}{p.level}
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
        <span className="ag-cat-dot" style={{ background: cat.color }} aria-hidden="true">
          <span className="ag-cat-icon">{cat.icon}</span>
        </span>
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
            <ul className="ag-places ag-places-compact">
              {rest.map(p => (
                <CompactPlaceItem key={p.id} p={p} lang={lang} />
              ))}
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

// ================================================================
// ICONIC_DISHES — platos típicos de Almería, Murcia y Levante
// almeriense que merecen ser pedidos por nombre. Cada plato lista los
// sitios concretos donde probarlo (placeIds apuntan a PLACES; los
// platos murcianos no tienen referencia local — se sugiere zona).
// Renderiza al inicio de la sección Sabores (web + PDF).
// ================================================================
const ICONIC_DISHES = [
  { id:'gurullos', icon:'🍝',
    name_es:'Gurullos almerienses', name_en:'Almerían gurullos',
    region_es:'Almería · Levante', region_en:'Almería · Levante',
    desc_es:'Pasta artesana parecida a un fideo de pellizco, guisada con conejo, pulpo o sepia. Plato de campo, cuchara contundente.',
    desc_en:'Hand-pinched pasta cooked with rabbit, octopus or cuttlefish. A robust country dish.',
    placeIds:['terraza-carmona','regio-restaurante','casa-egea'] },
  { id:'olla-trigo', icon:'🍲',
    name_es:'Olla de trigo', name_en:'Wheat stew (olla de trigo)',
    region_es:'Levante almeriense', region_en:'Levante almeriense',
    desc_es:'Guiso de trigo entero con costilla, chorizo, habichuelas y verduras. Receta de pastores, plato de invierno por excelencia.',
    desc_en:'Whole-wheat stew with pork ribs, chorizo, beans and vegetables. An old shepherd recipe, the winter classic.',
    placeIds:['regio-restaurante','casa-egea'] },
  { id:'caldero-almeriense', icon:'🥘',
    name_es:'Caldero almeriense', name_en:'Almerían caldero (rice & fish)',
    region_es:'Almería', region_en:'Almería',
    desc_es:'Arroz cocinado en caldera de hierro con fumet de pescados de roca. Se sirve en dos vuelcos: primero el arroz, luego el pescado con all-i-oli.',
    desc_en:'Rice cooked in a cast-iron pot with rockfish broth. Served in two courses — rice first, fish with garlic mayo after.',
    placeIds:['terraza-carmona'] },
  { id:'gamba-roja', icon:'🦐',
    name_es:'Gamba roja de Garrucha', name_en:'Garrucha red shrimp',
    region_es:'Garrucha · marca de calidad', region_en:'Garrucha · quality label',
    desc_es:'La estrella indiscutible del litoral. Carne dulce, intensa, casi cremosa. Solo a la plancha con sal gorda — sin más.',
    desc_en:'The undisputed star of the coast. Sweet, intense, almost creamy flesh. Just grilled with coarse salt — no embellishment.',
    tip_es:'Temporada fuerte enero-junio. Es cara (90-160 €/kg según pieza). Pídela según vaya la lonja del día.',
    tip_en:'Peak season January-June. Pricey (€90-160/kg). Order it depending on the day\'s catch.',
    placeIds:['almejero','almadraba','playa-azul','tadeo'] },
  { id:'quisquilla', icon:'🍤',
    name_es:'Quisquilla y camarón de Garrucha', name_en:'Garrucha pink shrimp & prawn',
    region_es:'Garrucha', region_en:'Garrucha',
    desc_es:'Más pequeñas que la gamba roja pero igual de delicadas. La quisquilla viene viva; el camarón se sirve crudo, recién bajado del barco.',
    desc_en:'Smaller than the red shrimp but just as delicate. Quisquilla comes live; camarones are served raw, straight off the boat.',
    placeIds:['rincon-puerto'] },
  { id:'migas', icon:'🌾',
    name_es:'Migas almerienses', name_en:'Almerían migas',
    region_es:'Almería', region_en:'Almería',
    desc_es:'Sémola de pan o harina frita con ajo y aceite, acompañada de tropezones: pimiento, chorizo, sardinas, uvas o naranja. Cada casa tiene su versión.',
    desc_en:'Bread or flour semolina fried with garlic and oil, served with side bites: peppers, chorizo, sardines, grapes or orange. Every house has its version.',
    placeIds:['casa-egea','regio-restaurante'] },
  { id:'atun-almadraba', icon:'🐟',
    name_es:'Atún rojo de almadraba', name_en:'Almadraba bluefin tuna',
    region_es:'Costa · temporada', region_en:'Coast · in season',
    desc_es:'El "ronqueo" del atún (despiece tradicional) se hace en mayo-junio. Tartar, tataki, ventresca a la brasa, encebollado — cada parte se presta a una preparación.',
    desc_en:'The "ronqueo" (traditional bluefin butchering) happens in May-June. Tartar, tataki, grilled belly, with onions — each cut has its preparation.',
    tip_es:'Mayo-junio es el mejor momento. Reserva con días en estos sitios.',
    tip_en:'May-June is peak. Book days ahead at these spots.',
    placeIds:['lua','titos-mojacar','almirez','juan-moreno'] },
  { id:'pescaito-frito', icon:'🍽️',
    name_es:'Pescaíto frito y fritura mixta', name_en:'Fried fish platter',
    region_es:'Toda la costa', region_en:'All along the coast',
    desc_es:'Boquerones, calamares, salmonetes, gambas y rosada en harina de garbanzo. La fritura andaluza por excelencia, a pie de playa.',
    desc_en:'Anchovies, squid, red mullet, prawns and pollock in chickpea flour. The classic Andalusian fry-up, at the beach.',
    placeIds:['maruja','rosado'] },
  { id:'caldero-mar-menor', icon:'🥘',
    name_es:'Caldero del Mar Menor', name_en:'Mar Menor caldero',
    region_es:'Murcia · Mar Menor', region_en:'Murcia · Mar Menor',
    desc_es:'Primo murciano del caldero almeriense: arroz cocinado en caldera con pescados del Mar Menor (mújol, dorada) y salmorreta de ñora. Servido en dos vuelcos.',
    desc_en:'Murcian cousin of the Almería caldero: rice cooked in a pot with Mar Menor fish (grey mullet, sea bream) and ñora-based salmorreta. Two-course service.',
    where_es:'San Pedro del Pinatar y Lo Pagán (Murcia). El plan de día de Lunar Cable Park es la excusa perfecta para comerlo allí.',
    where_en:'San Pedro del Pinatar and Lo Pagán (Murcia). The Lunar Cable Park day plan is the perfect excuse to try it.',
    extLink:'https://www.google.com/maps/search/?api=1&query=Caldero+San+Pedro+del+Pinatar' },
  { id:'paparajotes', icon:'🍋',
    name_es:'Paparajotes (Murcia)', name_en:'Paparajotes (Murcia)',
    region_es:'Murcia · postre', region_en:'Murcia · dessert',
    desc_es:'Hoja de limonero rebozada y frita, espolvoreada con azúcar y canela. El truco: NO se come la hoja — se "ordeña" la masa y se descarta.',
    desc_en:'Lemon leaf battered and fried, dusted with sugar and cinnamon. The trick: do NOT eat the leaf — slide the dough off and discard.',
    where_es:'Murcia capital (cualquier restaurante tradicional). En la zona: bares de la huerta murciana en La Manga y Mar Menor.',
    where_en:'Murcia city (any traditional restaurant). In the area: huerta-style bars at La Manga and Mar Menor.',
    extLink:'https://www.google.com/maps/search/?api=1&query=Paparajotes+Murcia' },
  { id:'marinera', icon:'🥖',
    name_es:'Marinera murciana', name_en:'Murcian "marinera"',
    region_es:'Murcia · tapa', region_en:'Murcia · tapa',
    desc_es:'Una rosquilla de pan crujiente con ensaladilla rusa por encima y una anchoa enrollada. La tapa identitaria de Murcia capital — siempre por pares.',
    desc_en:'A crunchy bread ring topped with Russian salad and a curled anchovy. Murcia city\'s signature tapa — always order in pairs.',
    where_es:'Bares de tapas de Murcia capital (zona de la Trapería). En La Manga y Mar Menor, en cualquier bar de barrio.',
    where_en:'Tapas bars in Murcia city (Trapería area). At La Manga and Mar Menor, any neighbourhood bar.',
    extLink:'https://www.google.com/maps/search/?api=1&query=Marinera+tapa+Murcia' },
  { id:'pastel-carne', icon:'🥧',
    name_es:'Pastel de carne murciano', name_en:'Murcian meat pie',
    region_es:'Murcia', region_en:'Murcia',
    desc_es:'Masa hojaldrada rellena de ternera picada, chorizo, huevo y especias. Se come tibio a media mañana con cerveza, como tapa de calle.',
    desc_en:'Puff-pastry pie filled with minced beef, chorizo, egg and spices. Eaten warm mid-morning with a beer, as a street snack.',
    where_es:'Panaderías de Murcia capital (Bonache es el referente). En la zona: panaderías de Águilas y Mazarrón.',
    where_en:'Murcia city bakeries (Bonache is the reference). In the area: bakeries in Águilas and Mazarrón.',
    extLink:'https://www.google.com/maps/search/?api=1&query=Pastel+de+carne+Murcia' },
];

// Etiquetas de cada tema con icono y color
const THEMES_DEFS = {
  naturaleza:  { es: 'Naturaleza',  en: 'Nature',       icon: '🌿', color: '#6B7A3A' },
  gastronomia: { es: 'Gastronomía', en: 'Food',         icon: '🍴', color: '#8A4A24' },
  cultura:     { es: 'Cultura',     en: 'Culture',      icon: '🏛️', color: '#3D1A35' },
  historia:    { es: 'Historia',    en: 'History',      icon: '📜', color: '#5D2A48' },
  pintoresco:  { es: 'Pintoresco',  en: 'Picturesque',  icon: '✦',  color: '#D4A84A' },
  aventura:    { es: 'Aventura',    en: 'Adventure',    icon: '⛰️', color: '#3AAABB' },
  relax:       { es: 'Relax',       en: 'Relax',        icon: '☕', color: '#9E7A2C' },
  familia:     { es: 'Familia',     en: 'Family',       icon: '👨‍👩‍👧', color: '#D42B80' },
};

// Categorías de duración para filtrar
const DURATION_BUCKETS = [
  { id: 'short',  es: '2-3 h',    en: '2-3 h',     min: 0,  max: 3 },
  { id: 'half',   es: 'Media jornada', en: 'Half day', min: 4, max: 6 },
  { id: 'full',   es: 'Día completo',  en: 'Full day', min: 7, max: 24 },
];

// Metadata para los 35 planes existentes (themes inferidos por id,
// duration_h calculada de start-end). Para los planes NUEVOS (más
// abajo) los campos están dentro del propio plan.
const PLAN_META = {
  'plan-flamencos':           { duration_h: 7,  themes: ['naturaleza','familia','gastronomia'] },
  'plan-monsul-amanecer':     { duration_h: 8,  themes: ['naturaleza','pintoresco'] },
  'plan-sendero-litoral':     { duration_h: 7,  themes: ['naturaleza','aventura','relax'] },
  'plan-cabo-gata':           { duration_h: 10, themes: ['naturaleza','aventura','pintoresco'] },
  'plan-carboneras-aguamarga':{ duration_h: 10, themes: ['naturaleza','pintoresco'] },
  'plan-vera-sorbas-tabernas':{ duration_h: 10, themes: ['naturaleza','cultura','aventura'] },
  'plan-monsul-cena':         { duration_h: 6,  themes: ['naturaleza','pintoresco','gastronomia'] },
  'plan-mojacar-noche':       { duration_h: 6,  themes: ['cultura','gastronomia','pintoresco'] },
  'plan-riad-cabrera':        { duration_h: 6,  themes: ['cultura','gastronomia'] },
  'plan-cala-enmedio-tarde':  { duration_h: 7,  themes: ['naturaleza','aventura','relax'] },
  'plan-flamencos-niños':     { duration_h: 6,  themes: ['naturaleza','familia','gastronomia'] },
  'plan-mini-hollywood':      { duration_h: 9,  themes: ['familia','cultura','aventura'] },
  'plan-geoda-pulpi':         { duration_h: 9,  themes: ['naturaleza','aventura'] },
  'plan-aqua-vera':           { duration_h: 10, themes: ['familia','aventura'] },
  'plan-mojacar-niños':       { duration_h: 5,  themes: ['cultura','gastronomia','pintoresco','familia'] },
  'plan-carretera-cabo':      { duration_h: 10, themes: ['naturaleza','aventura','pintoresco'] },
  'plan-trek-san-pedro':      { duration_h: 10, themes: ['naturaleza','aventura'] },
  'plan-murcia-gastro':       { duration_h: 11, themes: ['gastronomia','cultura'] },
  'plan-almeria-capital':     { duration_h: 12, themes: ['cultura','gastronomia','historia'] },
  'plan-nijar-ceramica':      { duration_h: 10, themes: ['cultura','pintoresco'] },
  'plan-kayak-cabo':          { duration_h: 6,  themes: ['naturaleza','aventura','pintoresco'] },
  'plan-snorkel-familia':     { duration_h: 4,  themes: ['naturaleza','familia','aventura'] },
  'plan-buceo-las-negras':    { duration_h: 10, themes: ['naturaleza','aventura'] },
  'plan-parque-vera-niños':   { duration_h: 4,  themes: ['familia','relax'] },
  'plan-estrellas-cabo':      { duration_h: 6,  themes: ['naturaleza','aventura','pintoresco','relax'] },
  'plan-mojacar-noche-musica':{ duration_h: 6,  themes: ['cultura','gastronomia','pintoresco'] },
  'plan-crucero-cabo':        { duration_h: 8,  themes: ['naturaleza','aventura','familia','pintoresco'] },
  'plan-lunar-cable':         { duration_h: 4,  themes: ['aventura','familia'] },
  'plan-motos-acuaticas':     { duration_h: 4,  themes: ['aventura'] },
  'plan-bici-costa':          { duration_h: 5,  themes: ['naturaleza','aventura','familia'] },
  'plan-curso-buceo':         { duration_h: 10, themes: ['naturaleza','aventura'] },
  'plan-lua-paseo':           { duration_h: 4,  themes: ['gastronomia','relax'] },
  'plan-garrucha-malecon':    { duration_h: 4,  themes: ['familia','gastronomia','pintoresco'] },
  'plan-calar-alto':          { duration_h: 8,  themes: ['naturaleza','aventura','cultura','relax'] },
  'plan-granada-alhambra':    { duration_h: 16, themes: ['cultura','historia','pintoresco'] },
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
    id:'plan-lunar-cable',
    type:'fullday', audience:'both',
    title_es:'Día en Lunar Cable Park · iniciación al wakeboard',
    title_en:'A day at Lunar Cable Park · wakeboarding initiation',
    start:'9:30', end:'19:30',
    tags_es:['deporte','aventura','wakeboard','embalse'],
    tags_en:['sport','adventure','wakeboard','reservoir'],
    steps:[
      { t:'9:30',  es:'Salida desde Vera Playa hacia el embalse de Cuevas del Almanzora',
                   en:'Leave Vera Playa for the Cuevas del Almanzora reservoir',
                   d_es:'~20 km / 24 min por carretera local pasando por Vera y Cuevas del Almanzora. Ruta directa y tranquila, sin AP-7.',
                   d_en:'~20 km / 24 min via local roads through Vera and Cuevas del Almanzora. Direct and quiet route, no motorway needed.',
                   km:20, gmaps:'https://www.google.com/maps/search/?api=1&query=Lunar+Cable+Park+Cuevas+Almanzora' },
      { t:'10:00', es:'Llegada a Lunar Cable Park y check-in',
                   en:'Arrive at Lunar Cable Park and check in',
                   d_es:'Está en el antiguo canal de remo y piragüismo de los Juegos Mediterráneos 2005. Sistema de 5 torres. Equipo incluido (tabla, casco, chaleco). Si vas con niños, pide el cable infantil.',
                   d_en:'Set in the old rowing canal from the 2005 Mediterranean Games. 5-tower system. Gear included (board, helmet, vest). With children, ask for the kids cable.',
                   km:0, gmaps:'https://www.google.com/maps/search/?api=1&query=Lunar+Cable+Park' },
      { t:'10:30', es:'Briefing de seguridad y primeros intentos en cable infantil',
                   en:'Safety briefing and first attempts on the kids cable',
                   d_es:'15 min de explicación + práctica en el cable bajo. Las primeras caídas son a los 5 minutos — es parte del aprendizaje.',
                   d_en:'15 min briefing + practice on the low cable. First wipeouts come within 5 min — part of learning.',
                   km:0 },
      { t:'12:00', es:'Sesión en cable principal o circuito hinchable',
                   en:'Main cable session or inflatable circuit',
                   d_es:'Cuando consigues levantarte, pasas al cable grande. Si vas con niños o quieres alternar, el circuito hinchable acuático es el mayor del sur de España.',
                   d_en:'Once you can stand up, switch to the main cable. With kids or for a change, the inflatable water circuit is the largest in southern Spain.',
                   km:0 },
      { t:'14:00', es:'Comida en el chiringuito de las instalaciones',
                   en:'Lunch at the on-site chiringuito',
                   d_es:'Picoteo, ensaladas, hamburguesas, cerveza fría. También puedes bajar 10 min en coche a Cuevas del Almanzora pueblo y comer en una venta local.',
                   d_en:'Tapas, salads, burgers, cold beer. Or drive 10 min down to Cuevas del Almanzora village for a local "venta" lunch.',
                   km:0 },
      { t:'16:00', es:'Segunda sesión o kayak/paddle por el canal',
                   en:'Second session or kayak/paddle on the canal',
                   d_es:'Si compraste pase de día, segunda tanda. Si no, prueba kayak o paddle surf — el canal está protegido y el agua plana.',
                   d_en:'Day pass: second round. Otherwise try kayak or paddle — the canal is sheltered and the water is flat.',
                   km:0 },
      { t:'18:00', es:'Parada en Cuevas del Almanzora pueblo · castillo del Marqués',
                   en:'Stop in Cuevas del Almanzora village · Marqués castle',
                   d_es:'A 10 min. Castillo del Marqués de los Vélez (s.XVI) y plaza de la villa para tomar algo. Distancia añadida: ~5 km.',
                   d_en:'10 min away. Castle of the Marqués de los Vélez (16th c.) and the village square for a drink. Added distance: ~5 km.',
                   km:5, gmaps:'https://www.google.com/maps/search/?api=1&query=Castillo+Marqu%C3%A9s+V%C3%A9lez+Cuevas+Almanzora' },
      { t:'19:30', es:'Vuelta a Hestía. Ducha larga, cerveza en la terraza.',
                   en:'Back at Hestía. Long shower, beer on the terrace.',
                   d_es:'~15 min desde Cuevas. Te van a doler músculos que no sabías que tenías. Vale la pena.',
                   d_en:'~15 min from Cuevas. You will ache in muscles you did not know you had. Worth it.',
                   km:18 },
    ],
    tip_es:'A solo 24 min en coche — puedes hacerlo de medio día si vas con tope justo, pero el día completo permite añadir Cuevas del Almanzora pueblo. Reserva online con 24 h en julio-agosto. Crema solar resistente al agua SPF 50, gorra, gafas con cordón, ropa de cambio seca y zapatillas de agua. Edad mínima recomendada: 8 años en cable infantil, 12 años en principal. Saber nadar bien es imprescindible.',
    tip_en:'Just 24 min by car — feasible as a half-day, but full day lets you add Cuevas del Almanzora village. Book online 24 h ahead in July-August. SPF 50 waterproof sunscreen, cap, sunglasses with strap, dry change of clothes and water shoes. Minimum age: 8 on kids cable, 12 on main. Strong swimming required.',
  },
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
    id:'plan-almeria-capital',
    type:'fullday', audience:'both',
    title_es:'Almería capital · un día completo',
    title_en:'Almería city · a full day',
    start:'9:00', end:'21:30',
    tags_es:['ciudad','cultura','tapas','historia'],
    tags_en:['city','culture','tapas','history'],
    steps:[
      { t:'9:00',  es:'Salida hacia Almería',                       en:'Drive to Almería',
                   d_es:'1 h 15 min por la A-7. Aparcamiento en el centro (Obispo Orberá o Plaza Vieja).',                d_en:'1 h 15 min on the A-7. Park downtown (Obispo Orberá or Plaza Vieja).' },
      { t:'10:30', es:'Alcazaba',                                   en:'Alcazaba fortress',
                   d_es:'La segunda mayor fortaleza musulmana de Al-Ándalus. Tres recintos, vistas al puerto. Entrada gratis para UE.', d_en:'The second-largest Muslim fortress in Al-Andalus. Three enclosures, harbour views. Free entry for EU citizens.' },
      { t:'12:30', es:'Catedral-fortaleza',                         en:'Cathedral-fortress',
                   d_es:'Catedral renacentista del XVI con aspecto de fortaleza por las incursiones berberiscas. Torre subible.',         d_en:'16th-century Renaissance cathedral built like a fortress against Barbary raids. Climbable tower.' },
      { t:'13:30', es:'Tapeo en Plaza Vieja y centro',              en:'Tapas in Plaza Vieja and old town',
                   d_es:'Tradición almeriense: pides una caña y eliges tapa gratis. Casa Puga, La Mala, El Quinto Toro.',                 d_en:'Almería tradition: order a beer, pick a free tapa. Casa Puga, La Mala, El Quinto Toro.' },
      { t:'15:30', es:'Refugios de la Guerra Civil',                en:'Civil War shelters',
                   d_es:'4,5 km subterráneos bajo el Paseo. Visita guiada de 1 h — reserva online en tickets.almeriaculturayocio.es.',     d_en:'4.5 km of tunnels under the Paseo. 1 h guided visit — book online at tickets.almeriaculturayocio.es.' },
      { t:'17:00', es:'Cable Inglés y paseo marítimo',              en:'Cable Inglés and seafront',
                   d_es:'Cargadero de mineral del XIX, hito industrial. Paseo hasta la Playa del Zapillo.',                               d_en:'19th-century iron ore loader, industrial landmark. Walk down to Playa del Zapillo.' },
      { t:'18:30', es:'Café o helado en Calle de las Tiendas',      en:'Coffee or ice-cream on Calle de las Tiendas',
                   d_es:'La calle comercial más antigua de la ciudad. Heladería Bornay, Café Colón.',                                     d_en:'The oldest commercial street in town. Bornay ice-cream parlour, Café Colón.' },
      { t:'20:00', es:'Cena con vistas en el puerto',               en:'Dinner with views at the harbour',
                   d_es:'Terrace bar o Joseba Añorga (Club de Mar). Pescaíto frito, arroces y atardecer sobre el agua.',                  d_en:'Terrace bar or Joseba Añorga (Club de Mar). Fried fish, rice dishes and sunset over the water.' },
    ],
    tip_es:'En verano dale la vuelta: tapeo y refugios por la mañana, baño en el Zapillo a media tarde y cena tardía. La luz del atardecer sobre la Alcazaba y la catedral es de las cosas más bonitas de Almería.',
    tip_en:'In summer flip it: tapas + shelters in the morning, swim at Zapillo mid-afternoon, late dinner. The evening light on the Alcazaba and cathedral is one of Almería\'s finest sights.',
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
  {
    id:'plan-granada-alhambra',
    type:'fullday', audience:'both',
    title_es:'Granada · Alhambra y Albaicín en un día',
    title_en:'Granada · Alhambra and Albaicín in a day',
    start:'7:00', end:'22:30',
    tags_es:['cultura','patrimonio','día largo','reserva imprescindible'],
    tags_en:['culture','heritage','long day','booking required'],
    steps:[
      { t:'7:00',  es:'Salida temprano hacia Granada',                  en:'Early drive to Granada',
                   d_es:'3 h 30 min por A-7 y A-92. Desayuno rápido en Hestía o parada en gasolinera de Sorbas.', d_en:'3 h 30 min via A-7 and A-92. Quick breakfast at Hestía or a stop at the Sorbas service station.' },
      { t:'10:30', es:'Llegada a Granada · aparcamiento Alhambra',      en:'Arrive in Granada · Alhambra parking',
                   d_es:'Parking oficial junto al recinto. Si llegáis con margen, café en el Parador antes de entrar.', d_en:'Official car park next to the complex. If you arrive early, coffee at the Parador before entering.' },
      { t:'11:00', es:'Visita a la Alhambra · Nazaríes, Generalife, Alcazaba', en:'Alhambra visit · Nasrid Palaces, Generalife, Alcazaba',
                   d_es:'Entrada con franja horaria — respetad la hora de los Nazaríes. 3 horas de visita sin prisa.', d_en:'Timed-entry ticket — respect the Nasrid Palaces slot. 3 hours unhurried.' },
      { t:'14:30', es:'Comida en el Realejo o cerca de Plaza Nueva',    en:'Lunch in Realejo or near Plaza Nueva',
                   d_es:'Tapeo andaluz o un menú tranquilo. Los Diamantes (clásico) o Bar Ávila (tapas con la caña).', d_en:'Andalusian tapas or a relaxed menu. Los Diamantes (classic) or Bar Ávila (free tapa with each drink).' },
      { t:'16:30', es:'Subir al Albaicín por la Cuesta del Chapiz',     en:'Walk up to the Albaicín via Cuesta del Chapiz',
                   d_es:'Calles blancas, cármenes, jazmines. Calzado cómodo — las cuestas pinchan.', d_en:'White streets, carmen houses, jasmine. Comfortable shoes — the slopes bite.' },
      { t:'17:30', es:'Mirador de San Nicolás',                        en:'San Nicolás viewpoint',
                   d_es:'La estampa más famosa de Granada: la Alhambra con Sierra Nevada al fondo. Llegad antes de que llene.', d_en:'Granada\'s most famous view: the Alhambra with Sierra Nevada behind. Arrive before it fills up.' },
      { t:'18:30', es:'Bajada por el Sacromonte (opcional) o vuelta al coche', en:'Down through Sacromonte (optional) or back to the car',
                   d_es:'Si os queda energía, asomaos al Sacromonte y a sus cuevas-flamenco. Si no, directo al coche.', d_en:'If energy allows, peek into Sacromonte and its cave-flamenco venues. Otherwise, straight to the car.' },
      { t:'19:00', es:'Salida hacia Vera Playa',                       en:'Drive back to Vera Playa',
                   d_es:'3 h 30 min. Atardecer entre olivos y el Desierto de Tabernas al cruzar.', d_en:'3 h 30 min. Sunset through olive groves and the Tabernas Desert on the way back.' },
      { t:'22:30', es:'Vuelta a Hestía sin trasnochar',                en:'Back to Hestía, not too late',
                   d_es:'Día largo pero memorable. Una cerveza en la terraza y a la cama.', d_en:'Long but memorable day. A beer on the terrace and to bed.' },
    ],
    tip_es:'Reservad la entrada a la Alhambra con varias semanas (incluso meses) de antelación en alhambra-patronato.es. Sin entrada no se entra: el cupo diario está topado. Llevad DNI/pasaporte — lo piden en cada acceso. Si os queda batería para más, una opción es dormir en Granada y volver al día siguiente.',
    tip_en:'Book Alhambra tickets weeks (even months) ahead at alhambra-patronato.es. No ticket, no entry — daily quota is capped. Bring your ID/passport — it is checked at each gate. If you have the stamina, consider sleeping in Granada and returning the next day.',
  },

  // ── 12 PLANES NUEVOS — schema completo (themes, duration_h, km, gmaps, rating) ──

  {
    id:'plan-mercadillo-vera', type:'morning', audience:'both', duration_h:2,
    themes:['gastronomia','pintoresco'],
    title_es:'Mercadillo de Vera (jueves) + desayuno',
    title_en:'Vera street market (Thursdays) + breakfast',
    start:'9:00', end:'11:00',
    tags_es:['jueves','mercado','desayuno','tomate raf'], tags_en:['thursday','market','breakfast','raf tomato'],
    steps:[
      { t:'9:00',  es:'Salida hacia Vera pueblo', en:'Drive to Vera town', d_es:'10 min en coche por la AL-7107.', d_en:'10 min by car on AL-7107.', km:8, gmaps:'https://maps.google.com/?q=Vera+Almeria' },
      { t:'9:15',  es:'Desayuno en Bar Manolo', en:'Breakfast at Bar Manolo', d_es:'Tostada con tomate raf y aceite, café con leche. 4€.', d_en:'Raf tomato + olive oil toast, café con leche. €4.', km:0.2, gmaps:'https://maps.google.com/?q=Bar+Manolo+Vera+Almeria', rating:{ v:4.4, src:'google' } },
      { t:'10:00', es:'Mercadillo · Plaza Mayor', en:'Market · Plaza Mayor', d_es:'Tomate raf, queso curado de Garrucha, miel de azahar, aceitunas aliñadas, hierbas, ropa.', d_en:'Raf tomato, Garrucha cured cheese, orange-blossom honey, marinated olives, herbs, clothes.', km:0.1, gmaps:'https://maps.google.com/?q=Mercadillo+Vera+Almeria', rating:{ v:4.5, src:'google' } },
      { t:'11:00', es:'Vuelta a Hestía', en:'Back to Hestía', km:8, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Solo los jueves de 8:30 a 13:30. En agosto, mejor antes de las 11 — luego aprieta el sol. Llevad bolsa propia.',
    tip_en:'Only Thursdays 8:30-13:30. In August go before 11 — gets too hot afterwards. Bring your own bag.',
  },

  {
    id:'plan-termas-alhamilla', type:'morning', audience:'adults', duration_h:4,
    themes:['relax','naturaleza','cultura'],
    title_es:'Termas romanas de Sierra Alhamilla',
    title_en:'Roman thermal baths of Sierra Alhamilla',
    start:'8:30', end:'12:30',
    tags_es:['termas','aguas termales','romano','silencio'], tags_en:['thermal','spa','roman','silence'],
    steps:[
      { t:'8:30',  es:'Salida hacia Pechina', en:'Drive to Pechina', d_es:'70 min por la A-7 dirección Almería.', d_en:'70 min on the A-7 toward Almería.', km:90, gmaps:'https://maps.google.com/?q=Pechina+Almeria' },
      { t:'9:45',  es:'Llegada al Balneario de Sierra Alhamilla', en:'Arrival at Sierra Alhamilla Spa', d_es:'Aguas a 58° desde tiempos romanos. Edificio del s.XVIII.', d_en:'58° waters since Roman times. 18th-c. building.', km:0, gmaps:'https://maps.google.com/?q=Balneario+Sierra+Alhamilla', rating:{ v:4.6, src:'google' } },
      { t:'10:00', es:'Baños en piscina termal y cuevas', en:'Bath in thermal pool and caves', d_es:'Agua mineralizada con propiedades terapéuticas. ~10€/persona.', d_en:'Mineralized water with therapeutic properties. ~€10/person.', km:0, gmaps:'https://maps.google.com/?q=Balneario+Sierra+Alhamilla' },
      { t:'11:30', es:'Desayuno en el restaurante del balneario', en:'Breakfast at the spa restaurant', d_es:'Tortilla, café, vista al pueblo de Pechina al fondo.', d_en:'Tortilla, coffee, view of Pechina village below.', km:0, gmaps:'https://maps.google.com/?q=Balneario+Sierra+Alhamilla' },
      { t:'12:30', es:'Vuelta a Vera Playa', en:'Back to Vera Playa', km:90, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Llamad antes — horario de baños cambia por temporada (+34 950 31 75 13). Llevad chanclas para la zona húmeda.',
    tip_en:'Call ahead — bath schedule changes by season (+34 950 31 75 13). Bring flip-flops for the wet area.',
  },

  {
    id:'plan-faro-cabo-corto', type:'morning', audience:'both', duration_h:3,
    themes:['naturaleza','pintoresco'],
    title_es:'Faro y mirador de Cabo de Gata (mañana corta)',
    title_en:'Cabo de Gata lighthouse and lookout (short morning)',
    start:'9:00', end:'12:00',
    tags_es:['faro','flamencos','mirador'], tags_en:['lighthouse','flamingos','viewpoint'],
    steps:[
      { t:'9:00',  es:'Salida hacia Cabo de Gata', en:'Drive to Cabo de Gata', d_es:'1 h 15 min, carretera espectacular.', d_en:'1 h 15 min, spectacular road.', km:90, gmaps:'https://maps.google.com/?q=Cabo+de+Gata' },
      { t:'10:15', es:'Salinas de Cabo de Gata · flamencos', en:'Cabo de Gata salt flats · flamingos', d_es:'Otra colonia de flamencos diferente a la de Vera. Foto desde el observatorio.', d_en:'Another flamingo colony, different from Vera. Photo from the observatory.', km:5, gmaps:'https://maps.google.com/?q=Salinas+Cabo+de+Gata', rating:{ v:4.7, src:'google' } },
      { t:'11:00', es:'Faro y arrecife de las Sirenas', en:'Lighthouse and Sirens reef', d_es:'Mirador con vista a las dos columnas volcánicas saliendo del mar.', d_en:'Lookout with view of the two volcanic columns rising from the sea.', km:5, gmaps:'https://maps.google.com/?q=Faro+Cabo+de+Gata', rating:{ v:4.6, src:'google' } },
      { t:'12:00', es:'Vuelta a Hestía', en:'Back to Hestía', km:90, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Para una mañana 100% naturaleza sin estresarse. Si queréis hacer playa también, alargad y combinadlo con Mónsul (otro plan).',
    tip_en:'For a 100% nature morning without stress. To add a beach, extend and combine with Mónsul (another plan).',
  },

  {
    id:'plan-genoveses-atardecer', type:'evening', audience:'both', duration_h:3,
    themes:['naturaleza','relax','pintoresco'],
    title_es:'Playa de los Genoveses al atardecer',
    title_en:'Los Genoveses beach at sunset',
    start:'17:00', end:'20:00',
    tags_es:['playa virgen','atardecer','sin servicios'], tags_en:['virgin beach','sunset','no services'],
    steps:[
      { t:'17:00', es:'Salida hacia San José', en:'Drive to San José', d_es:'1 h 10 min por la N-340 y AL-3115.', d_en:'1 h 10 min on N-340 and AL-3115.', km:85, gmaps:'https://maps.google.com/?q=San+Jose+Almeria' },
      { t:'18:15', es:'Aparcar en el parking de Genoveses', en:'Park at the Genoveses car park', d_es:'En verano hay barrera de coches: parking de pago + bus lanzadera o caminar 20 min.', d_en:'In summer cars are restricted: paid parking + shuttle bus, or 20-min walk.', km:6, gmaps:'https://maps.google.com/?q=Playa+de+los+Genoveses', rating:{ v:4.7, src:'google' } },
      { t:'18:45', es:'Baño y paseo por la playa virgen', en:'Swim and walk on the virgin beach', d_es:'1.300 m de arena dorada sin construcciones. Eucaliptos al borde.', d_en:'1,300 m of golden sand with no buildings. Eucalyptus at the edge.', km:0, gmaps:'https://maps.google.com/?q=Playa+de+los+Genoveses' },
      { t:'19:30', es:'Atardecer mirando al cabo', en:'Sunset facing the cape', d_es:'El sol cae detrás del Cerro del Cabrero. Aire fresco al ponerse.', d_en:'Sun drops behind Cerro del Cabrero. Cool air when it sets.', km:0, gmaps:'https://maps.google.com/?q=Playa+de+los+Genoveses' },
      { t:'20:00', es:'Vuelta a Hestía', en:'Back to Hestía', km:91, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'No hay chiringuito ni servicios. Llevad agua, snack y toalla extra. Si vais en julio-agosto comprobad la barrera de coches en cabodegata.es.',
    tip_en:'No beach bar, no services. Bring water, snack and extra towel. In July-August check car restrictions at cabodegata.es.',
  },

  {
    id:'plan-pulpi-cocedores', type:'morning', audience:'both', duration_h:5,
    themes:['aventura','naturaleza','familia'],
    title_es:'Geoda gigante de Pulpí + Playa de los Cocedores',
    title_en:'Pulpí giant geode + Cocedores beach',
    start:'10:00', end:'15:00',
    tags_es:['geoda','minería','cala','niños'], tags_en:['geode','mining','cove','kids'],
    steps:[
      { t:'10:00', es:'Salida hacia Pulpí', en:'Drive to Pulpí', d_es:'45 min, reserva online imprescindible.', d_en:'45 min, online booking required.', km:45, gmaps:'https://maps.google.com/?q=Pulpi+Almeria' },
      { t:'11:00', es:'Visita guiada a la Geoda Gigante', en:'Guided tour of the Giant Geode', d_es:'8 m de cristales — la 2ª más grande del mundo. Casco, linterna y arnés incluidos. ~22€ adulto.', d_en:'8 m of crystals — the world\'s 2nd largest. Helmet, lamp and harness included. ~€22/adult.', km:0, gmaps:'https://maps.google.com/?q=Geoda+Pulpi', rating:{ v:4.8, src:'google' } },
      { t:'13:00', es:'Comida en San Juan de los Terreros', en:'Lunch at San Juan de los Terreros', d_es:'Pueblo costero pequeño. Restaurantes a pie de mar (Mejillonera, La Tasca).', d_en:'Small coastal village. Beachfront restaurants (Mejillonera, La Tasca).', km:13, gmaps:'https://maps.google.com/?q=San+Juan+de+los+Terreros', rating:{ v:4.3, src:'google' } },
      { t:'14:30', es:'Playa de los Cocedores', en:'Cocedores beach', d_es:'Cuevas excavadas en la arenisca, perfectas para que los niños exploren. Aguas turquesas.', d_en:'Caves carved into the sandstone — perfect for kids to explore. Turquoise waters.', km:8, gmaps:'https://maps.google.com/?q=Playa+de+los+Cocedores', rating:{ v:4.6, src:'google' } },
      { t:'15:00', es:'Vuelta a Hestía', en:'Back to Hestía', km:50, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Reservad la Geoda con 1-2 semanas de antelación en geodapulpi.es. Edad mínima 6 años. Temperatura constante 20° dentro — llevad sudadera.',
    tip_en:'Book the Geode 1-2 weeks ahead at geodapulpi.es. Min age 6. Constant 20° inside — bring a sweatshirt.',
  },

  {
    id:'plan-cartagena-roma', type:'fullday', audience:'both', duration_h:8,
    themes:['cultura','historia','gastronomia'],
    title_es:'Cartagena · Teatro romano y modernismo',
    title_en:'Cartagena · Roman theatre and modernism',
    start:'8:00', end:'18:00',
    tags_es:['romano','modernismo','puerto','tapas'], tags_en:['roman','modernism','harbour','tapas'],
    steps:[
      { t:'8:00',  es:'Salida hacia Cartagena', en:'Drive to Cartagena', d_es:'1 h 45 min por la A-7 y AP-7.', d_en:'1 h 45 min on A-7 and AP-7.', km:160, gmaps:'https://maps.google.com/?q=Cartagena+Spain' },
      { t:'10:00', es:'Teatro Romano de Cartagena', en:'Roman Theatre of Cartagena', d_es:'Reabierto en 2008 tras décadas enterrado. Imprescindible. ~7€.', d_en:'Reopened in 2008 after decades buried. Must-see. ~€7.', km:0, gmaps:'https://maps.google.com/?q=Teatro+Romano+Cartagena', rating:{ v:4.7, src:'google' } },
      { t:'12:00', es:'Calle Mayor + Casino + Casas modernistas', en:'Main street + Casino + Modernist houses', d_es:'Joya del modernismo español. Caminad sin prisa.', d_en:'Spanish modernism gem. Walk slowly.', km:0.5, gmaps:'https://maps.google.com/?q=Calle+Mayor+Cartagena', rating:{ v:4.6, src:'google' } },
      { t:'13:30', es:'Comida de tapas en La Marquesita', en:'Lunch tapas at La Marquesita', d_es:'Marineras (boquerones en vinagre sobre rosquilla) — invento cartagenero. ~25€/persona.', d_en:'Marineras (vinegar anchovy on a rosquilla bagel) — Cartagena invention. ~€25/person.', km:0.3, gmaps:'https://maps.google.com/?q=La+Marquesita+Cartagena', rating:{ v:4.4, src:'google' } },
      { t:'15:30', es:'Puerto y submarino Peral', en:'Harbour and Peral submarine', d_es:'1er submarino con propulsión eléctrica del mundo (1888). Paseo por el muelle.', d_en:'World\'s first electric-powered submarine (1888). Walk along the docks.', km:0.7, gmaps:'https://maps.google.com/?q=Submarino+Peral+Cartagena', rating:{ v:4.5, src:'google' } },
      { t:'16:30', es:'Castillo de la Concepción · ascensor panorámico', en:'Concepción Castle · panoramic lift', d_es:'Vistas 360° de la bahía. Ascensor desde el puerto.', d_en:'360° bay views. Lift from the harbour.', km:0.5, gmaps:'https://maps.google.com/?q=Castillo+de+la+Concepcion+Cartagena', rating:{ v:4.5, src:'google' } },
      { t:'17:30', es:'Café y vuelta', en:'Coffee and drive back', d_es:'1 h 45 min de carretera.', d_en:'1 h 45 min drive.', km:160, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Sacad la entrada al Teatro Romano online (museoteatroromanocartagena.es) — incluye museo subterráneo. Cartagena merece una vuelta de noche también, si os animáis a quedaros.',
    tip_en:'Buy Roman Theatre tickets online (museoteatroromanocartagena.es) — includes the underground museum. Worth visiting at night too if you feel like staying.',
  },

  {
    id:'plan-lorca-castillo', type:'fullday', audience:'both', duration_h:7,
    themes:['cultura','historia'],
    title_es:'Lorca · Castillo, judería y bordados',
    title_en:'Lorca · Castle, Jewish quarter and embroidery',
    start:'9:00', end:'16:00',
    tags_es:['castillo','semana santa','judería','bordados'], tags_en:['castle','holy week','jewish quarter','embroidery'],
    steps:[
      { t:'9:00',  es:'Salida hacia Lorca', en:'Drive to Lorca', d_es:'1 h por la A-7.', d_en:'1 h on A-7.', km:80, gmaps:'https://maps.google.com/?q=Lorca+Murcia' },
      { t:'10:00', es:'Castillo de Lorca · Fortaleza del Sol', en:'Lorca Castle · Sun Fortress', d_es:'Torre Alfonsina, sinagoga medieval y judería excavada en 2002. Tren turístico desde el casco.', d_en:'Alfonsina Tower, medieval synagogue and Jewish quarter excavated in 2002. Tourist train from old town.', km:1, gmaps:'https://maps.google.com/?q=Castillo+de+Lorca', rating:{ v:4.5, src:'google' } },
      { t:'12:00', es:'Casco histórico · Plaza de España y Colegiata', en:'Old town · Plaza España and Colegiata', d_es:'Iglesia de San Patricio (s.XVI), una de las pocas colegiatas extra-catedralicias.', d_en:'San Patricio church (16th c.), one of the few non-cathedral collegiates.', km:1, gmaps:'https://maps.google.com/?q=Plaza+de+Espana+Lorca', rating:{ v:4.6, src:'google' } },
      { t:'13:30', es:'Museo del Bordado · Paso Azul o Paso Blanco', en:'Embroidery Museum · Paso Azul or Paso Blanco', d_es:'Bordado en seda único en el mundo — declarado Patrimonio Inmaterial. ~6€.', d_en:'Silk embroidery unique in the world — declared Intangible Heritage. ~€6.', km:0.3, gmaps:'https://maps.google.com/?q=Museo+Bordado+Paso+Azul+Lorca', rating:{ v:4.7, src:'google' } },
      { t:'14:30', es:'Comida en El Esquinazo', en:'Lunch at El Esquinazo', d_es:'Cocina lorquina tradicional — migas, michirones, conejo al ajillo. ~30€/persona.', d_en:'Traditional Lorca cuisine — migas, michirones, garlic rabbit. ~€30/person.', km:0.5, gmaps:'https://maps.google.com/?q=El+Esquinazo+Lorca', rating:{ v:4.4, src:'google' } },
      { t:'16:00', es:'Vuelta a Hestía', en:'Back to Hestía', km:80, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Si vais en Semana Santa, Lorca tiene la mejor procesión de España según muchos — pero las plazas se llenan, reservad con meses.',
    tip_en:'During Holy Week, Lorca has Spain\'s most spectacular processions according to many — but spots fill, book months ahead.',
  },

  {
    id:'plan-cazorla-sierra', type:'fullday', audience:'adults', duration_h:9,
    themes:['naturaleza','relax'],
    title_es:'Sierra de Cazorla · día verde en la montaña',
    title_en:'Sierra de Cazorla · green day in the mountains',
    start:'8:00', end:'19:00',
    tags_es:['sierra','río','parque natural','desconexión'], tags_en:['mountains','river','natural park','disconnect'],
    steps:[
      { t:'8:00',  es:'Salida hacia Cazorla', en:'Drive to Cazorla', d_es:'2 h 45 min por la A-7 y A-92.', d_en:'2 h 45 min on A-7 and A-92.', km:230, gmaps:'https://maps.google.com/?q=Cazorla+Jaen' },
      { t:'10:45', es:'Pueblo de Cazorla · Plaza de Santa María', en:'Cazorla town · Plaza Santa María', d_es:'Pueblo blanco encajado entre dos sierras. Café en cualquiera de las terrazas.', d_en:'White village wedged between two ranges. Coffee at any terrace.', km:1, gmaps:'https://maps.google.com/?q=Plaza+de+Santa+Maria+Cazorla', rating:{ v:4.7, src:'google' } },
      { t:'11:30', es:'Sendero del Río Borosa (tramo corto, 4 km)', en:'Río Borosa trail (short 4 km section)', d_es:'Pasarelas sobre el río más espectacular del parque. Plano y familiar.', d_en:'Walkways over the park\'s most spectacular river. Flat and family-friendly.', km:25, gmaps:'https://maps.google.com/?q=Sendero+Rio+Borosa', rating:{ v:4.8, src:'google' } },
      { t:'14:00', es:'Comida en Mesón Leandro (Burunchel)', en:'Lunch at Mesón Leandro (Burunchel)', d_es:'Cocina serrana — venado, ciervo, gachamigas. ~35€/persona.', d_en:'Mountain cuisine — venison, deer, gachamigas. ~€35/person.', km:15, gmaps:'https://maps.google.com/?q=Meson+Leandro+Burunchel', rating:{ v:4.6, src:'google' } },
      { t:'16:00', es:'Mirador Cinco Puertas', en:'Cinco Puertas viewpoint', d_es:'Vista de toda la Sierra de Cazorla con el embalse del Tranco al fondo.', d_en:'Sweeping view of all Sierra de Cazorla with the Tranco reservoir below.', km:10, gmaps:'https://maps.google.com/?q=Mirador+Cinco+Puertas+Cazorla', rating:{ v:4.7, src:'google' } },
      { t:'17:00', es:'Vuelta a Vera Playa', en:'Drive back to Vera Playa', d_es:'2 h 45 min.', d_en:'2 h 45 min.', km:230, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Llevad calzado de senderismo (incluso para 4 km) y agua. Sierra de Cazorla tiene 200.000 ha — si os engancha, mereceréis volver a dormir un par de días.',
    tip_en:'Bring hiking shoes (even for 4 km) and water. Sierra de Cazorla has 200,000 ha — if hooked, worth returning to sleep a couple nights.',
  },

  {
    id:'plan-tapas-vera-pueblo', type:'evening', audience:'both', duration_h:3,
    themes:['gastronomia','pintoresco','cultura'],
    title_es:'Tapas tour por Vera pueblo',
    title_en:'Tapas tour around Vera village',
    start:'20:00', end:'23:00',
    tags_es:['tapas','rutas tapas','vino','barato'], tags_en:['tapas','tapas route','wine','cheap'],
    steps:[
      { t:'20:00', es:'Salida hacia Vera pueblo', en:'Drive to Vera town', d_es:'10 min en coche.', d_en:'10 min by car.', km:8, gmaps:'https://maps.google.com/?q=Vera+Almeria' },
      { t:'20:15', es:'Bar Las Vegas · cerveza + tapa de marisco', en:'Bar Las Vegas · beer + seafood tapa', d_es:'Cerveza fría + chocos fritos o gambas — gratis con la consumición. ~3€.', d_en:'Cold beer + fried squid or shrimp — free with the drink. ~€3.', km:0.3, gmaps:'https://maps.google.com/?q=Bar+Las+Vegas+Vera+Almeria', rating:{ v:4.4, src:'google' } },
      { t:'21:00', es:'Bodega El Choto · vino + tapa de carne', en:'Bodega El Choto · wine + meat tapa', d_es:'Buena selección de vinos murcianos y andaluces. Ambiente tradicional. ~5€/copa.', d_en:'Good Murcia and Andalusia wine selection. Traditional atmosphere. ~€5/glass.', km:0.2, gmaps:'https://maps.google.com/?q=Bodega+El+Choto+Vera+Almeria', rating:{ v:4.5, src:'google' } },
      { t:'21:45', es:'Bar Pasaje · ración para compartir', en:'Bar Pasaje · sharing platter', d_es:'Pulpo a la gallega o jamón ibérico. Mesa fuera en verano. ~12€/ración.', d_en:'Galician octopus or Iberian ham. Outdoor table in summer. ~€12/dish.', km:0.1, gmaps:'https://maps.google.com/?q=Bar+Pasaje+Vera+Almeria', rating:{ v:4.5, src:'google' } },
      { t:'22:30', es:'Helado en Heladería La Ibense', en:'Ice cream at La Ibense', d_es:'Heladería artesanal del paseo — turrón, chocolate al ron, mantecado.', d_en:'Artisan ice cream parlour on the promenade — turrón, rum chocolate, mantecado.', km:0.2, gmaps:'https://maps.google.com/?q=Heladeria+La+Ibense+Vera', rating:{ v:4.6, src:'google' } },
      { t:'23:00', es:'Vuelta a Hestía', en:'Back to Hestía', km:8, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'En Andalucía la tapa va con la consumición — cuesta acostumbrarse después de Madrid. Pedid "una caña" y ya viene con algo. Llevad efectivo, los bares pequeños no siempre cobran con tarjeta.',
    tip_en:'In Andalusia tapas come free with each drink — takes getting used to after Madrid. Ask for "una caña" and it comes with food. Bring cash — small bars don\'t always take card.',
  },

  {
    id:'plan-villaricos-pescaderia', type:'morning', audience:'both', duration_h:3,
    themes:['gastronomia','pintoresco'],
    title_es:'Villaricos · pescadería del puerto + paella en Tadeo',
    title_en:'Villaricos · port fish market + paella at Tadeo',
    start:'10:30', end:'14:30',
    tags_es:['pesca','marisco','paella','arroz'], tags_en:['fishing','seafood','paella','rice'],
    steps:[
      { t:'10:30', es:'Salida hacia Villaricos', en:'Drive to Villaricos', d_es:'15 min por la AL-7.', d_en:'15 min on AL-7.', km:13, gmaps:'https://maps.google.com/?q=Villaricos+Almeria' },
      { t:'10:50', es:'Pescadería del puerto · ver llegar las barcas', en:'Port fish market · watch boats arrive', d_es:'Las barcas llegan sobre las 11. Pescado del día — gambas, calamar, sepia. Compradlo y os lo limpian.', d_en:'Boats arrive around 11. Day catch — shrimp, squid, cuttlefish. Buy and they clean it for you.', km:0.5, gmaps:'https://maps.google.com/?q=Lonja+de+Villaricos', rating:{ v:4.5, src:'google' } },
      { t:'12:00', es:'Paseo por el puerto y la cala de la Galera', en:'Walk port and Galera cove', d_es:'Pueblo pesquero auténtico, sin turisficar. La cala es de piedra pequeña.', d_en:'Authentic fishing village, untouched by tourism. Cove has small pebbles.', km:0.3, gmaps:'https://maps.google.com/?q=Cala+de+la+Galera+Villaricos' },
      { t:'13:00', es:'Comida en Restaurante Tadeo', en:'Lunch at Restaurant Tadeo', d_es:'Arroz con bogavante — la mejor de la zona, sin excepciones. Reservad. ~35€/persona.', d_en:'Lobster rice — the best in the area, no exceptions. Book ahead. ~€35/person.', km:0.2, gmaps:'https://maps.google.com/?q=Restaurante+Tadeo+Villaricos', rating:{ v:4.7, src:'google' } },
      { t:'14:30', es:'Vuelta a Hestía', en:'Back to Hestía', km:13, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'En Tadeo el arroz lleva 35-40 min de cocción. Pedidlo nada más sentaros y mientras tanto picad gambas o boquerones. Solo abren mediodía.',
    tip_en:'At Tadeo the rice takes 35-40 min cooking. Order it as soon as you sit and snack on shrimp/anchovies meanwhile. Lunch only.',
  },

  {
    id:'plan-monsul-mojacar-mediodia', type:'fullday', audience:'both', duration_h:6,
    themes:['naturaleza','pintoresco','cultura'],
    title_es:'Mónsul de mañana + Mojácar pueblo de tarde',
    title_en:'Mónsul morning + Mojácar village afternoon',
    start:'9:00', end:'17:00',
    tags_es:['playa virgen','pueblo blanco','dos en uno'], tags_en:['virgin beach','white village','two-in-one'],
    steps:[
      { t:'9:00',  es:'Salida hacia San José', en:'Drive to San José', d_es:'1 h 10 min, salir temprano para evitar barrera de coches.', d_en:'1 h 10 min, leave early to beat car barrier.', km:85, gmaps:'https://maps.google.com/?q=San+Jose+Almeria' },
      { t:'10:15', es:'Subir a la duna de Mónsul', en:'Climb the Mónsul dune', d_es:'Foto desde lo alto. Sentirás Indiana Jones (rodaron aquí La última cruzada).', d_en:'Photo from the top. Indiana Jones moment (Last Crusade was filmed here).', km:6, gmaps:'https://maps.google.com/?q=Playa+de+Monsul', rating:{ v:4.8, src:'google' } },
      { t:'11:30', es:'Baño en Mónsul', en:'Swim at Mónsul', d_es:'La roca circular en el agua es la marca de la casa.', d_en:'The circular rock in the water is the trademark.', km:0, gmaps:'https://maps.google.com/?q=Playa+de+Monsul' },
      { t:'13:00', es:'Comida en La Ola (San José)', en:'Lunch at La Ola (San José)', d_es:'A pie de mar. Pulpo, tartar de atún, arroces. ~40€/persona.', d_en:'Beachfront. Octopus, tuna tartare, rices. ~€40/person.', km:6, gmaps:'https://maps.google.com/?q=La+Ola+San+Jose+Almeria', rating:{ v:4.5, src:'google' } },
      { t:'15:00', es:'Salida hacia Mojácar pueblo', en:'Drive to Mojácar village', d_es:'40 min, carretera por la costa.', d_en:'40 min, coast road.', km:50, gmaps:'https://maps.google.com/?q=Mojacar+Pueblo' },
      { t:'15:45', es:'Mojácar pueblo · Plaza Nueva y mirador', en:'Mojácar village · Plaza Nueva and lookout', d_es:'Pueblo blanco encalado en la sierra. Vistas a 360°. Heladería La Veleta para la merienda.', d_en:'White-washed mountain village. 360° views. La Veleta ice-cream stop.', km:1, gmaps:'https://maps.google.com/?q=Plaza+Nueva+Mojacar', rating:{ v:4.7, src:'google' } },
      { t:'17:00', es:'Vuelta a Vera Playa', en:'Back to Vera Playa', km:13, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'En verano la barrera al sur de San José cierra coches a partir de las 9:00 — id antes o coged el bus lanzadera. Mojácar pueblo se sube en coche pero hay aparcamiento abajo y andar.',
    tip_en:'In summer the south barrier of San José closes cars from 9:00 — leave earlier or take the shuttle. Mojácar town has parking below — walk up.',
  },

  {
    id:'plan-saltos-cuevas-sierra', type:'morning', audience:'both', duration_h:5,
    themes:['naturaleza','aventura'],
    title_es:'Cuevas de Sorbas y Karst de yesos',
    title_en:'Sorbas Caves and Gypsum Karst',
    start:'10:00', end:'15:00',
    tags_es:['cuevas','karst','geología','aventura'], tags_en:['caves','karst','geology','adventure'],
    steps:[
      { t:'10:00', es:'Salida hacia Sorbas', en:'Drive to Sorbas', d_es:'45 min por la A-7.', d_en:'45 min on A-7.', km:60, gmaps:'https://maps.google.com/?q=Sorbas+Almeria' },
      { t:'11:00', es:'Visita guiada a las Cuevas de Sorbas', en:'Guided tour of Sorbas Caves', d_es:'Karst de yesos único en Europa. 2 h con casco y linterna. ~22€ adulto.', d_en:'Gypsum karst unique in Europe. 2 h with helmet and lamp. ~€22/adult.', km:5, gmaps:'https://maps.google.com/?q=Cuevas+de+Sorbas', rating:{ v:4.7, src:'google' } },
      { t:'13:00', es:'Comida en Sorbas pueblo', en:'Lunch in Sorbas town', d_es:'Mesón La Era — cocina serrana, gachas, migas. ~25€/persona.', d_en:'Mesón La Era — mountain cuisine, gachas, migas. ~€25/person.', km:5, gmaps:'https://maps.google.com/?q=Sorbas+Almeria', rating:{ v:4.4, src:'google' } },
      { t:'14:30', es:'Vuelta con parada en mirador del Río Aguas', en:'Drive back via Río Aguas viewpoint', d_es:'5 min en la salida del pueblo. El cañón se ve desde arriba.', d_en:'5 min from town exit. Canyon seen from above.', km:65, gmaps:'https://maps.google.com/?q=Vera+Playa' },
    ],
    tip_es:'Reservad las cuevas con antelación en cuevasdesorbas.com — los grupos son pequeños (15 max). Hace fresco dentro: 18° constante. Calzado cerrado, las cuerdas y escaleras requieren manos libres.',
    tip_en:'Book caves ahead at cuevasdesorbas.com — small groups (15 max). Cool inside: constant 18°. Closed shoes — ropes and ladders need free hands.',
  },
];

// Helper para enriquecer plan con metadata (themes/duration_h) si está
// en PLAN_META o ya viene en el propio plan (planes nuevos).
const enrichPlan = (plan) => ({
  ...plan,
  duration_h: plan.duration_h ?? PLAN_META[plan.id]?.duration_h,
  themes:     plan.themes     ?? PLAN_META[plan.id]?.themes ?? [],
});

const DayPlanCard = ({ plan, lang }) => {
  const [open, setOpen] = React.useState(false);
  const title = plan[`title_${lang}`];
  const tags  = plan[`tags_${lang}`] || [];
  const tip   = plan[`tip_${lang}`];
  const themes = plan.themes || [];
  const durH = plan.duration_h;

  // Total km del itinerario (suma km de cada paso)
  const totalKm = (plan.steps || []).reduce((s, st) => s + (st.km || 0), 0);

  return (
    <article className={`dp-card ${open ? 'is-open' : ''}`}>
      <button type="button" className="dp-card-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="dp-card-time">{plan.start}<span className="dp-card-arrow" aria-hidden="true">→</span>{plan.end}</span>
        <span className="dp-card-title">{title}</span>
        <span className={`dp-card-chev ${open ? 'open' : ''}`} aria-hidden="true">↓</span>
      </button>
      <div className="dp-card-body" aria-hidden={!open}>
        {(durH || totalKm > 0 || themes.length > 0) && (
          <div className="dp-meta-bar">
            {durH && <span className="dp-meta-pill dp-meta-duration">⏱ {durH} h</span>}
            {totalKm > 0 && <span className="dp-meta-pill dp-meta-km">🚗 {Math.round(totalKm)} km</span>}
            {themes.map(th => {
              const def = THEMES_DEFS[th] || { es: th, en: th, color: '#3D1A35', icon: '·' };
              return (
                <span key={th} className="dp-meta-pill dp-meta-theme"
                  style={{ '--theme-color': def.color }}>
                  {def.icon} {def[lang] || def.es}
                </span>
              );
            })}
          </div>
        )}
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
                {s[`d_${lang}`] && <span className="dp-step-detail">{s[`d_${lang}`]}</span>}
                {(s.km != null || s.gmaps || s.rating) && (
                  <div className="dp-step-extra">
                    {s.km != null && s.km > 0 && (
                      <span className="dp-step-km">📍 {s.km < 1 ? `${Math.round(s.km*1000)} m` : `${s.km} km`}</span>
                    )}
                    {s.rating && (
                      <span className="dp-step-rating" title={`Fuente: ${s.rating.src}`}>
                        ★ {s.rating.v} <small>· {s.rating.src}</small>
                      </span>
                    )}
                    {s.gmaps && (
                      <a className="dp-step-gmaps" href={s.gmaps} target="_blank" rel="noopener">
                        {lang === 'es' ? 'Cómo llegar →' : 'Directions →'}
                      </a>
                    )}
                  </div>
                )}
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
  // Filtros: audiencia (existing), duración, temas (multi-select).
  const [audience, setAudience] = React.useState('all');
  const [duration, setDuration] = React.useState('all');
  const [themes, setThemes]     = React.useState([]);

  const matches = (p) => {
    if (audience === 'all')    {} // pass
    else if (audience === 'kids'   && !(p.audience === 'kids'   || p.audience === 'both')) return false;
    else if (audience === 'adults' && !(p.audience === 'adults' || p.audience === 'both' || !p.audience)) return false;

    if (duration !== 'all') {
      const bucket = DURATION_BUCKETS.find(b => b.id === duration);
      if (bucket) {
        const dh = p.duration_h || 0;
        if (dh < bucket.min || dh > bucket.max) return false;
      }
    }
    if (themes.length > 0) {
      const planThemes = p.themes || [];
      // OR logic: que al menos uno de los temas seleccionados esté en el plan
      if (!themes.some(t => planThemes.includes(t))) return false;
    }
    return true;
  };

  const toggleTheme = (id) => {
    setThemes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const tabs = [
    { id:'all',    es:'Todos',     en:'All' },
    { id:'adults', es:'Sin niños', en:'No kids' },
    { id:'kids',   es:'Con niños', en:'With kids' },
  ];
  const durationTabs = [
    { id:'all', es:'Cualquiera', en:'Any' },
    ...DURATION_BUCKETS,
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
            ? 'Estos son solo ideas — hay innumerables opciones para todos los gustos. Los horarios son orientativos: dependen tanto de vuestras necesidades como de las posibles excursiones o actividades que decidáis contratar. Las puntuaciones son las que aparecen en Google Maps cuando hicimos la guía. Os animamos a descubrir, vivir Vera y Hestía a vuestro propio ritmo.'
            : 'These are just ideas — there are countless options for every taste. The times are approximate: they depend on your own needs and on any excursions or activities you may book. Ratings are from Google Maps when we wrote this guide. We invite you to discover, to live Vera and Hestía at your own pace.'}
        </p>
      </div>

      {/* Fila 1: filtro por audiencia */}
      <div className="dp-filters-row">
        <span className="dp-filter-label">{lang === 'es' ? 'Audiencia' : 'Audience'}</span>
        <div className="dp-tabs" role="tablist">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              type="button"
              className={`dp-tab ${audience === t.id ? 'active' : ''}`}
              onClick={() => setAudience(t.id)}>
              {t[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Fila 2: filtro por duración */}
      <div className="dp-filters-row">
        <span className="dp-filter-label">{lang === 'es' ? 'Duración' : 'Duration'}</span>
        <div className="dp-tabs" role="tablist">
          {durationTabs.map(t => (
            <button
              key={t.id}
              role="tab"
              type="button"
              className={`dp-tab ${duration === t.id ? 'active' : ''}`}
              onClick={() => setDuration(t.id)}>
              {t[lang] || t.es}
            </button>
          ))}
        </div>
      </div>

      {/* Fila 3: filtro por tema (chips multi-select) */}
      <div className="dp-filters-row">
        <span className="dp-filter-label">{lang === 'es' ? 'Tema' : 'Theme'}</span>
        <div className="dp-theme-chips">
          {Object.entries(THEMES_DEFS).map(([id, def]) => {
            const active = themes.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`dp-theme-chip ${active ? 'active' : ''}`}
                style={{ '--theme-color': def.color }}
                onClick={() => toggleTheme(id)}>
                {def.icon} {def[lang]}
              </button>
            );
          })}
          {themes.length > 0 && (
            <button type="button" className="dp-theme-clear" onClick={() => setThemes([])}>
              ✕ {lang === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {Object.entries(DAY_PLAN_GROUPS).map(([type, group]) => {
        const plans = DAY_PLANS
          .map(enrichPlan)
          .filter(p => p.type === type && matches(p));
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
              <img decoding="async" src={p.src} alt={p.caption || ''} loading="lazy" />
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

      {/* PDF-only: portada + índice editoriales — ahora para los 3 apts. */}
      <div className="ag-print-cover print-only" aria-hidden="true">
        <div className="ag-print-cover-bg" aria-hidden="true"/>
        <div className="ag-print-cover-frame">
          <div className="ag-print-cover-top">
            <span className="ag-print-cover-brand">Hestía Your Home</span>
            <span className="ag-print-cover-meta">{lang === 'es' ? 'Guía del hogar · v1.0' : 'Home guide · v1.0'}</span>
          </div>
          <div className="ag-print-cover-num" aria-hidden="true">{apt.num}</div>
          <div className="ag-print-cover-mid">
            <span className="ag-print-cover-eyebrow">
              {lang === 'es' ? 'Vera Playa · Almería · Desde 2016' : 'Vera Playa · Almería · Since 2016'}
            </span>
            <h1 className="ag-print-cover-title">
              Hestía <em>{apt.name_short}</em>
            </h1>
            <p className="ag-print-cover-sub">
              {s.cover_tagline}
            </p>
          </div>
          <div className="ag-print-cover-rule" aria-hidden="true"/>
          <div className="ag-print-cover-bottom">
            <div className="ag-print-cover-sig">
              <span className="ag-print-cover-sig-line">{lang === 'es' ? 'Tu hogar, escrito a mano por' : 'Your home, hand-written by'}</span>
              <span className="ag-print-cover-sig-name">Alex &amp; Fran</span>
            </div>
            <div className="ag-print-cover-coord">
              <span>{apt.license}</span>
              <span>www.hestiayourhome.com</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="ag-print-toc print-only" aria-hidden="true">
        <span className="ag-print-toc-label">{lang === 'es' ? 'Índice' : 'Contents'}</span>
        <h2 className="ag-print-toc-title">
          {lang === 'es'
            ? <>Tu Hestía,<br/><em>en {GUIDE_SECTIONS.length} capítulos.</em></>
            : <>Your Hestía,<br/><em>in {GUIDE_SECTIONS.length} chapters.</em></>}
        </h2>
        <ol className="ag-print-toc-list">
          {GUIDE_SECTIONS.map((sec, i) => (
            <li key={sec.id}>
              <span className="ag-print-toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="ag-print-toc-name">{sec[lang]}</span>
              <span className="ag-print-toc-leader" aria-hidden="true"/>
            </li>
          ))}
        </ol>
        <p className="ag-print-toc-foot">
          {lang === 'es'
            ? 'Esta guía cubre todo lo que necesitas saber sobre tu Hestía y los alrededores. Léela con calma — está hecha para acompañarte.'
            : 'This guide covers everything you need to know about your Hestía and the surroundings. Read it slowly — it is made to accompany you.'}
        </p>
      </nav>

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
              <a
                className="ag-nav-btn ag-nav-btn-primary"
                href={lang === 'en' ? aptInfo.pdf.replace('-Guia.pdf', '-Guia-EN.pdf') : aptInfo.pdf}
                download
                target="_blank"
                rel="noopener"
              >
                {lang === 'es' ? '⇩ Descargar guía (PDF)' : '⇩ Download guide (PDF)'}
              </a>
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

          {s.checkin && (
          <section id="ag-llegada" className="ag-section ag-section-checkin">
            <span className="ag-section-num">02</span>
            <h2 className="ag-h2">{s.checkin.title}</h2>
            <p className="ag-para ag-para-lead">{s.checkin.intro}</p>

            <h3 className="ag-h3">{s.checkin.modalitiesTitle}</h3>
            <div className="ag-checkin-modes">
              {s.checkin.modalities.map((m, i) => (
                <div key={i} className="ag-checkin-mode">
                  <span className="ag-checkin-mode-tag">{m.tag}</span>
                  <p className="ag-checkin-mode-body">{m.body}</p>
                </div>
              ))}
            </div>

            <h3 className="ag-h3">{s.checkin.garageTitle}</h3>
            <p className="ag-para">{s.checkin.garageIntro}</p>
            <div className="ag-checkin-garage">
              <span className="ag-checkin-garage-apt">{apt.name}</span>
              <span className="ag-checkin-garage-sep">·</span>
              <span className="ag-checkin-garage-label">{lang === 'es' ? 'Plaza' : 'Spot'}</span>
              <span className="ag-checkin-garage-num">{aptInfo.garageSpot || '—'}</span>
            </div>
            <p className="ag-para ag-para-note">{s.checkin.garageNote}</p>

            <h3 className="ag-h3">{s.checkin.checkoutTitle}</h3>
            <p className="ag-para">{s.checkin.checkoutBody}</p>
          </section>
          )}

          <section id="ag-wifi" className="ag-section ag-section-wifi">
            <span className="ag-section-num">03</span>
            <h2 className="ag-h2">{s.wifi.title}</h2>
            <p className="ag-para ag-para-lead">{s.wifi.intro}</p>
            <div className="ag-wifi-card">
              <div className="ag-wifi-row">
                <span className="ag-wifi-row-label">{s.wifi.ssidLabel}</span>
                <code className="ag-wifi-row-value">{s.wifi.ssidValue}</code>
              </div>
              <div className="ag-wifi-row">
                <span className="ag-wifi-row-label">{s.wifi.passLabel}</span>
                <code className="ag-wifi-row-value ag-wifi-row-pass">{s.wifi.passValue}</code>
              </div>
              <p className="ag-wifi-note">{s.wifi.note}</p>
            </div>
          </section>

          <section id="ag-nombre" className="ag-section">
            <span className="ag-section-num">04</span>
            <h2 className="ag-h2">{s.name.title}</h2>
            {s.name.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
          </section>

          <section id="ag-proposito" className="ag-section">
            <span className="ag-section-num">05</span>
            <h2 className="ag-h2">{s.why.title}</h2>
            {s.why.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
          </section>

          <section id="ag-limpieza" className="ag-section">
            <span className="ag-section-num">06</span>
            <h2 className="ag-h2">{s.cleaning.title}</h2>
            <p className="ag-para">{s.cleaning.intro}</p>
            <p className="ag-note">{s.cleaning.note}</p>
            <h3 className="ag-h3">{lang === 'es' ? 'Recomendaciones' : 'Recommendations'}</h3>
            <ol className="ag-recs">
              {s.cleaning.recs.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </section>

          {s.rules && (
            <section id="ag-normas" className="ag-section ag-section-rules">
              <span className="ag-section-num">07</span>
              <h2 className="ag-h2">{s.rules.title}</h2>
              <p className="ag-para">{s.rules.intro}</p>
              <ul className="ag-rules-grid">
                {s.rules.items.map((rule, i) => (
                  <li key={i} className="ag-rule">
                    <span className="ag-rule-icon" aria-hidden="true">{rule.icon}</span>
                    <div className="ag-rule-body">
                      <h4 className="ag-rule-title">{rule.t}</h4>
                      <p className="ag-rule-desc">{rule.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {a.rooms.map((room, idx) => (
            <section key={room.id} id={`ag-${room.id}`} className={`ag-section ag-room ag-room-${room.id}`}>
              <span className="ag-section-num">{String(idx + 8).padStart(2, '0')}</span>
              <h2 className="ag-h2">{room.title}</h2>
              <p className="ag-para ag-para-lead">{room.body}</p>
              <PhotoGrid photos={getRoomPhotos(room.id)} />
              {room.points && room.points.length > 0 && (
                <>
                  <h3 className="ag-h3">{lang === 'es' ? 'Leyenda del mapa' : 'Map legend'}</h3>
                  <ol className="ag-recs ag-urb-points">
                    {room.points.map((p, i) => <li key={i}>{p}</li>)}
                  </ol>
                </>
              )}
              <h3 className="ag-h3">{lang === 'es' ? 'Recomendaciones' : 'Recommendations'}</h3>
              <ol className="ag-recs">
                {room.recs.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </section>
          ))}

          <section id="ag-alrededores" className="ag-section">
            <span className="ag-section-num">14</span>
            <h2 className="ag-h2">{s.surroundings.title}</h2>
            <p className="ag-para">{s.surroundings.intro}</p>

            {s.surroundings.disclaimer && (
              <aside className="ag-disclaimer" role="note">
                <span className="ag-disclaimer-tag">{s.surroundings.disclaimer_title}</span>
                <p className="ag-disclaimer-body">{s.surroundings.disclaimer}</p>
              </aside>
            )}

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
          </section>

          {/* Sabores · comer y beber */}
          <section id="ag-sabores" className="ag-section">
            <span className="ag-section-num">15</span>
            <h2 className="ag-h2">{lang === 'es' ? 'Sabores' : 'Tastes'}</h2>
            <p className="ag-para">
              {lang === 'es'
                ? 'Restaurantes, bares y lugares para comprar. Nuestras recomendaciones, lo que pediríamos en cada sitio y dónde ir cuando apriete el hambre.'
                : 'Restaurants, bars and places to shop. Our recommendations, what we would order at each spot and where to go when hunger strikes.'}
            </p>

            <DishesGuide lang={lang} />

            {SECTION_CATS.sabores.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              const inCat = PLACES.filter(p => p.cat === catId);
              if (!inCat.length) return null;
              return <CatGroup key={catId} cat={cat} places={inCat} lang={lang} />;
            })}
          </section>

          {/* Pueblos y cultura */}
          <section id="ag-pueblos" className="ag-section">
            <span className="ag-section-num">16</span>
            <h2 className="ag-h2">{lang === 'es' ? 'Pueblos y cultura' : 'Towns & culture'}</h2>
            <p className="ag-para">
              {lang === 'es'
                ? 'Pueblos blancos, castillos, yacimientos y festivales. Cada lugar con sus atractivos principales, recomendaciones y las fiestas que merece la pena coincidir.'
                : 'White villages, castles, archaeological sites and festivals. Each place with its highlights, recommendations and festivals worth timing your visit with.'}
            </p>
            {SECTION_CATS.pueblos.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              const inCat = PLACES.filter(p => p.cat === catId);
              if (!inCat.length) return null;
              return <CatGroup key={catId} cat={cat} places={inCat} lang={lang} />;
            })}
          </section>

          {/* Mar y playas */}
          <section id="ag-mar-playas" className="ag-section">
            <span className="ag-section-num">17</span>
            <h2 className="ag-h2">{lang === 'es' ? 'Mar y playas' : 'Sea & beaches'}</h2>
            <p className="ag-para">
              {lang === 'es'
                ? 'Las mejores playas y calas — desde las más accesibles a las vírgenes que exigen caminar un rato. Servicios, acceso y la mejor hora para ir en cada época del año.'
                : 'The best beaches and coves — from the easily accessible to the wild ones that require a walk. Services, access and the best hour to visit in each season.'}
            </p>
            <Top5BeachesBand places={PLACES} lang={lang} />
            {SECTION_CATS['mar-playas'].map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              const inCat = PLACES.filter(p => p.cat === catId);
              if (!inCat.length) return null;
              return <CatGroup key={catId} cat={cat} places={inCat} lang={lang} />;
            })}
          </section>

          {/* Actividades y planes de día */}
          <section id="ag-actividades" className="ag-section">
            <span className="ag-section-num">18</span>
            <h2 className="ag-h2">{lang === 'es' ? 'Actividades y planes' : 'Activities & plans'}</h2>
            <p className="ag-para">
              {lang === 'es'
                ? 'Buceo, kayak, vuelo en biplaza, parques acuáticos, observatorios. Y nuestros itinerarios curados para vivir días redondos por la zona.'
                : 'Diving, kayaking, scenic flights, water parks, observatories. And our curated itineraries for full days around the area.'}
            </p>
            {SECTION_CATS.actividades.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              const inCat = PLACES.filter(p => p.cat === catId);
              if (!inCat.length) return null;
              return <CatGroup key={catId} cat={cat} places={inCat} lang={lang} />;
            })}
            <DayPlans lang={lang} />
          </section>

          {/* Mercados y compras */}
          <section id="ag-mercados" className="ag-section">
            <span className="ag-section-num">19</span>
            <h2 className="ag-h2">{lang === 'es' ? 'Mercados y compras' : 'Markets & shops'}</h2>
            <p className="ag-para">
              {lang === 'es'
                ? 'El calendario semanal de mercadillos de la zona y los mejores sitios para llevarte un recuerdo: cerámica de Níjar, jarapas, aceite local.'
                : 'Weekly street markets in the area and the best places for souvenirs: Níjar ceramics, traditional rugs, local olive oil.'}
            </p>
            {SECTION_CATS.mercados.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              const inCat = PLACES.filter(p => p.cat === catId);
              if (!inCat.length) return null;
              return <CatGroup key={catId} cat={cat} places={inCat} lang={lang} />;
            })}
          </section>

          {/* Movilidad · gasolineras y carga eléctrica */}
          <section id="ag-movilidad" className="ag-section">
            <span className="ag-section-num">20</span>
            <h2 className="ag-h2">{lang === 'es' ? 'Gasolineras y carga eléctrica' : 'Fuel & EV charging'}</h2>
            <p className="ag-para">
              {lang === 'es'
                ? 'Estaciones de servicio y puntos de carga para coche eléctrico en Vera Playa y alrededores. Cada lugar incluye distancia desde tu Hestía, horario habitual y enlace directo a Google Maps para llegar.'
                : 'Petrol stations and EV charging points in Vera Playa and surroundings. Each spot includes distance from your Hestía, typical opening hours and a direct Google Maps link.'}
            </p>
            <p className="ag-para" style={{fontSize:'0.92em',color:'var(--ink-soft)'}}>
              {lang === 'es'
                ? 'Los horarios son orientativos (verificados en mayo 2026 mediante Repsol, Cepsa, Plenoil y Electromaps). El enlace de Google Maps siempre lleva al lugar correcto aunque cambie la información.'
                : 'Hours are approximate (verified in May 2026 via Repsol, Cepsa, Plenoil and Electromaps). The Google Maps link always reaches the correct location even if details change.'}
            </p>
            {SECTION_CATS.movilidad.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              const inCat = PLACES.filter(p => p.cat === catId);
              if (!inCat.length) return null;
              return <CatGroup key={catId} cat={cat} places={inCat} lang={lang} />;
            })}
          </section>

          <section id="ag-telefonos" className="ag-section">
            <span className="ag-section-num">21</span>
            <h2 className="ag-h2">{s.phones.title}</h2>
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
            <span className="ag-section-num">22</span>
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
