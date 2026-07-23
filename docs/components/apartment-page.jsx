// ================================================================
// HESTÍA, Página de detalle de cada Hestía
// Lee window.__APT__ ('vm' | 'vt' | 'vs') para saber cuál mostrar
// ================================================================

// Emoji de amenidad a icono propio de marca (set Hestía). La clave normaliza
// el variation selector (U+FE0F) para no depender de cómo se escriba el emoji.
const AMENITY_HI = {
  '🌊': 'wave', '☀': 'sun', '🏊': 'pool', '🌿': 'olive', '🛋': 'sofa', '🛗': 'lift',
  '📺': 'tv', '🎬': 'film', '📶': 'wifi', '❄': 'snow', '🍳': 'cooktop', '🍽': 'fork',
  '🧺': 'washer', '🛁': 'bath', '🚿': 'shower', '🚗': 'car', '🩹': 'cross', '🎁': 'gift',
  '☂': 'umbrella', '👶': 'baby', '🛏': 'bed', '🧴': 'bottle', '🌺': 'flower', '🪔': 'aroma',
  '🧻': 'dryrack', '🌅': 'sun', '🌡': 'thermometer', '♨': 'jacuzzi', '💪': 'dumbbell',
  '🧖': 'sauna', '🎾': 'tennis', '☕': 'coffee', '🏞': 'mountain',
};
const amenityHi = (emoji) => AMENITY_HI[(emoji || '').replace(/️/g, '')];

// Versión de caché de las fotos de galería. Súbela al reemplazar fotos con el
// mismo nombre para que el navegador cargue las nuevas y no las cacheadas.
const GALLERY_V = '9';

const APT_DATA = {
  vm: {
    id: 'vm', num: '01', slug: 'mar', license: 'VFT/AL/01580',
    name_short: 'Mar',
    video_src: 'assets/hestia v13 mar clean.mp4',
    video_duration: 'PT1M14S', video_upload: '2026-05-30',
    accent: '#6B7A3A', accent2: '#8B9A52', accent_dk: '#4A5628',
    hero_img: 'assets/apt-vs.jpg',
    bedroom_img: 'assets/apt-vm-gallery-10.jpg',
    floorplan_img: 'assets/apt-vm-plano.jpg?v=2',
    floorplan_subtitle_es: 'distribución en planta.',
    floorplan_subtitle_en: 'floor layout.',
    floorplan_desc_es: 'Mar se distribuye en primera planta con terraza de esquina: salón-comedor abierto, cocina equipada, dos dormitorios y dos baños. La terraza en esquina recibe luz desde el amanecer hasta el atardecer.',
    floorplan_desc_en: 'Mar is on the first floor with a corner terrace: open living and dining room, equipped kitchen, two bedrooms and two bathrooms. The corner terrace catches light from sunrise to sunset.',
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
      desc: 'Hestía Mar es donde el paisaje del olivar se funde con el Mediterráneo. Desde la terraza esquinera de 20m² orientada al amanecer, el mar aparece entre los eucaliptos de Vera Playa. Al ser esquinera, da a tres calles y permite ventilación cruzada natural en todas las estancias.',
      desc2: 'Mar ocupa la planta primera y se abre al jardín con acceso a la piscina comunitaria. Al ser esquinera, la luz entra desde el amanecer hasta el atardecer, ves el ciclo solar completo desde la terraza. Aire acondicionado centralizado en todas las estancias. Cocina completamente equipada, salón-comedor de 28m² y dos dormitorios con ropa de cama de calidad.',
      features: ['El más cercano a la playa, un pequeño y agradable paseo', '6 plazas + bebé · 2 habitaciones · planta primera', 'Terraza esquina 20m² · orientada al amanecer · ciclo solar completo', 'Piscina comunitaria · jacuzzi comunitario (verano)', 'Mascotas · petición previa · suplemento', '300 m de la playa · 5 min a pie desde la salida', 'Accesibilidad · adaptado para movilidad reducida', 'Aire acondicionado centralizado en todas las estancias', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Salón · sobremesas de madera, cocina a mano', 'Salón · sofá bajo un sol de espejo', 'Salón · a vista de pájaro, todo tuyo', 'Piscina comunitaria · el agua brilla de noche', 'Detalle · jarrón y textiles que abrigan', 'Cocina · mañanas que empiezan despacio', 'Cocina · copa en la encimera, sin prisa', 'Cocina · campana a punto, guisos lentos', 'Dormitorio 2 · sueños en turquesa', 'Dormitorio principal · armario espejo, luz doblada', 'Dormitorio 2 · dos camas, mismo descanso', 'Terraza · veladas de verano que se alargan', 'Terraza · sofás para charlas de noche', 'Baño 1 · un resplandor verde y sereno', 'Baño 2 · ducha lista, toallas esperando', 'Baño 2 · lavabo y aromas suaves', 'Piscina comunitaria · azul de mediodía', 'Piscina · jardines alrededor, verano lento', 'Zona duchas · mosaico azul tras el baño', 'Salón · lámpara y sofá, tarde en calma', 'Salón · el sofá entero para ti', 'Detalle · el sol dorado del espejo', 'Detalle · suelo hidráulico de otra época', 'Dormitorio principal · un globo de luz suave'],
    },
    en: {
      name: 'Hestía Mar',
      concept: 'Where the olive grove meets the sea.',
      desc: 'Hestía Mar is where the olive grove landscape merges with the Mediterranean. From the 20m² corner terrace facing the sunrise, the sea appears between the eucalyptus trees of Vera Playa. As a corner unit, Mar faces three streets and benefits from natural cross-ventilation throughout.',
      desc2: 'Mar is on the first floor and opens onto the garden with access to the shared pool. As a corner unit, light travels through from sunrise to sunset, you can follow the full arc of the sun from the terrace. Centralised air conditioning in every room. A fully equipped kitchen, 28m² living-dining room, and two bedrooms with quality bed linen.',
      features: ['Closest to the beach: a short, pleasant walk', '6 guests + baby · 2 bedrooms · first floor', 'Corner terrace 20m² · faces sunrise · full solar arc', 'Shared pool · shared jacuzzi (summer)', 'Pets · on request · supplement', '300 m from the beach · 5 min walk from complex exit', 'Accessibility · adapted for reduced mobility', 'Centralised A/C in every room', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Living & dining · wood made for lingering', 'Living room · sofa under a mirrored sun', 'Living room · from above, all yours', 'Community pool · water glowing at night', 'Detail · vase & textiles, gentle touches', 'Kitchen · mornings that start slow', 'Kitchen · wine on the counter, unhurried', 'Kitchen · hood ready, slow cooking ahead', 'Bedroom 2 · dreams in teal', 'Master bedroom · mirrored wardrobe doubling the light', 'Bedroom 2 · two beds, one calm', 'Terrace · summer evenings that stretch on', 'Terrace · sofas for late-night talks', 'Bathroom 1 · a serene green glow', 'Bathroom 2 · shower ready, towels waiting', 'Bathroom 2 · vessel sink & soft scents', 'Community pool · the blue of midday', 'Pool · gardens around, summer slowed', 'Pool showers · blue mosaic after the swim', 'Living room · lamp glow, evening ease', 'Living room · the whole sofa, yours', "Detail · the mirror's golden sun", 'Detail · hydraulic tiles from another era', 'Master bedroom · a globe of soft light'],
    },
  },
  vt: {
    id: 'vt', num: '02', slug: 'thalassa', license: 'VFT/AL/05535',
    name_short: 'Thalassa',
    video_src: 'assets/hestia intro v9 thalassa outro.mp4',
    video_duration: 'PT1M6S', video_upload: '2026-05-30',
    accent: '#B86A3C', accent2: '#D08B5A', accent_dk: '#8A4A24',
    hero_img: 'assets/apt-vt-4.jpg',
    bedroom_img: 'assets/apt-vt-gallery-03.jpg',
    floorplan_img: 'assets/apt-vt-plano.png',
    floorplan_subtitle_es: 'distribución del ático.',
    floorplan_subtitle_en: 'penthouse layout.',
    floorplan_desc_es: 'Thalassa ocupa la tercera planta (desde el garaje) en una sola crujía: salón con terraza panorámica, cocina abierta, dos dormitorios, dos baños y vistas al Mediterráneo y al Salar de los Canos.',
    floorplan_desc_en: 'Thalassa occupies the third floor (from the garage) in a single open plan: living room with panoramic terrace, open kitchen, two bedrooms, two bathrooms and views over the Mediterranean and the Salar de los Canos.',
    others: ['vm', 'vs'],
    gallery_imgs: [
      'assets/apt-vt-gallery-20.jpg',
      'assets/apt-vt-gallery-22.jpg',
      'assets/apt-vt-gallery-17.jpg',
      'assets/apt-vt-gallery-19.jpg',
      'assets/apt-vt-gallery-10.jpg',
      'assets/apt-vt-gallery-23.jpg',
      'assets/apt-vt-gallery-21.jpg',
      'assets/apt-vt-gallery-24.jpg',
      'assets/apt-vt-gallery-25.jpg',
      'assets/apt-vt-gallery-26.jpg',
      'assets/apt-vt-gallery-27.jpg',
      'assets/apt-vt-gallery-28.jpg',
      'assets/apt-vt-gallery-29.jpg',
      'assets/apt-vt-gallery-06.jpg',
      'assets/apt-vt-gallery-18.jpg',
      'assets/apt-vt-gallery-11.jpg',
      'assets/apt-vt-gallery-01.jpg',
      'assets/apt-vt-gallery-03.jpg',
      'assets/apt-vt-gallery-05.jpg',
      'assets/apt-vt-gallery-09.jpg',
      'assets/apt-vt-gallery-04.jpg',
      'assets/apt-vt-gallery-12.jpg',
      'assets/apt-vt-gallery-13.jpg',
      'assets/apt-vt-gallery-07.jpg',
      'assets/apt-vt-gallery-14.jpg',
      'assets/apt-vt-gallery-16.jpg',
      'assets/apt-vt-gallery-08.jpg',
    ],
    es: {
      name: 'Hestía Thalassa',
      concept: 'El ático sobre el Mediterráneo y el Salar de los Canos.',
      desc: 'Hestía Thalassa es el ático, el más elevado de los tres. Desde su terraza panorámica se ve el Mediterráneo y, hacia el interior, el Salar de los Canos, un paisaje árido y de gran belleza que cambia con la luz del día. El punto más abierto y luminoso de toda la urbanización.',
      desc2: 'El ático tiene una planta abierta y una terraza con vistas al mar. La urbanización cuenta con piscina comunitaria con jacuzzi, minigim, y un minispa con piscina climatizada abierto en otoño, invierno y primavera.',
      features: ['El más alto · ves toda la playa, con la sensación de dominar la vista', '6 plazas + bebé · 2 habitaciones', 'Ático · tercera planta desde el garaje', 'Terraza panorámica · vistas al mar y al Salar de los Canos', '2 piscinas exteriores comunitarias + jacuzzi', 'Minigim · piscina climatizada + minispa (otoño-primavera)', '1,5 km de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Salón · luz cálida, terraza a un paso', 'Dormitorio principal · turquesa y el mar al fondo', 'Terraza · noches cálidas que apetece alargar', 'Cocina · encimera gris, ocres que abrigan', 'Salón · rincón de sofá, luz de tarde', 'Dormitorio principal · manta suave y horizonte', 'Baño · lavabo en negro, espejo de luna', 'Dormitorio principal · luz cálida sobre turquesa', 'Piscina climatizada · minispa con vistas', 'Piscina climatizada · spa cubierto', 'Jacuzzi y piscina climatizada', 'Gimnasio comunitario', 'Sauna y baño de vapor', 'Comedor · mesa que crece, luz que acompaña', 'Piscina · desde arriba, el Mediterráneo espera', 'Terraza · el horizonte entero al atardecer', 'Terraza · el Mediterráneo se tiñe de oro', 'Dormitorio principal · bordados con tacto de hogar', 'Salón · el atardecer entra por la ventana', 'Terraza · bajo el toldo, sin prisa', 'Dormitorio 2 · cabeceros rojos, sueños de color', 'Dormitorio 2 · granate y luz que arropa', 'Dormitorio 2 · cojines índigo · invitación al descanso', 'Baño 1 · azul de mosaico bajo los pies', 'Baño 2 · ducha de obra, amarillo que despierta', 'Baño 2 · negro mate y una flor serena', 'Entrada · mueble artesano, espejo que recibe'],
    },
    en: {
      name: 'Hestía Thalassa',
      concept: 'The penthouse above the Mediterranean and the Salar de los Canos.',
      desc: 'Hestía Thalassa is the penthouse, the highest of the three. From its panoramic terrace you look out over the Mediterranean and, inland, the Salar de los Canos: an arid, dramatically beautiful landscape that shifts with the light throughout the day.',
      desc2: 'The penthouse is laid out as a single open floor with a terrace and sea views. The complex has a shared pool with jacuzzi, a mini-gym, and a mini-spa with heated pool open in autumn, winter and spring.',
      features: ['The highest · see the whole beach, commanding the view', '6 guests + baby · 2 bedrooms', 'Penthouse · third floor from the garage', 'Panoramic terrace · sea & Salar de los Canos views', '2 outdoor shared pools + jacuzzi', 'Mini-gym · heated pool + mini-spa (autumn–spring)', '1.5 km from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Living room · warm light, terrace steps away', 'Master bedroom · teal and the sea beyond', 'Terrace · warm nights worth stretching', 'Kitchen · grey counter, ochre warmth', 'Living room · sofa corner, evening light', 'Master bedroom · soft throw and horizon', 'Bathroom · black vanity, moon-round mirror', 'Master bedroom · warm light on teal', 'Heated pool · mini-spa with views', 'Heated pool · the indoor spa', 'Jacuzzi and heated pool', 'Community gym', 'Sauna and steam room', 'Dining area · the table grows, light follows', 'Pool · from above, the Mediterranean beyond', 'Terrace · the whole horizon, golden hour', 'Terrace · the Mediterranean turns to gold', 'Master bedroom · embroidered cushions, touch of home', 'Living room · sunset pouring through the window', 'Terrace · under the awning, unhurried', 'Bedroom 2 · red headboards, colourful dreams', 'Bedroom 2 · burgundy warmth as night falls', 'Bedroom 2 · indigo cushions · an invitation to rest', 'Bathroom 1 · mosaic blue underfoot', 'Bathroom 2 · walk-in shower, yellow that wakes', 'Bathroom 2 · matte black, one quiet flower', "Entrance · artisan cabinet, a mirror's welcome"],
    },
  },
  vs: {
    id: 'vs', num: '03', slug: 'salinas', license: 'VFT/AL/07056',
    name_short: 'Salinas',
    video_src: 'assets/hestia v14 salinas clean.mp4',
    video_duration: 'PT1M21S', video_upload: '2026-05-30',
    accent: '#D4A84A', accent2: '#E8C476', accent_dk: '#7A5E1A',
    hero_img: 'assets/apt-vm.jpg',
    bedroom_img: 'assets/apt-vs-gallery-21.jpg',
    floorplan_img: 'assets/apt-vs-floorplan.jpg',
    floorplan_subtitle_es: 'distribución en planta.',
    floorplan_subtitle_en: 'floor layout.',
    floorplan_desc_es: 'Salinas se distribuye en planta primera: salón-comedor, cocina equipada, dos dormitorios, dos baños y dos terrazas, la principal al sur con vistas a los jardines y la piscina de la urbanización.',
    floorplan_desc_en: 'Salinas is a first-floor apartment: living and dining room, equipped kitchen, two bedrooms, two bathrooms and two terraces, the main one faces south with views over the complex gardens and pool.',
    others: ['vm', 'vt'],
    gallery_imgs: [
      'assets/apt-vs-gallery-2.jpg',    // recibidor
      'assets/apt-vs-gallery-1.jpg',    // salón-comedor
      'assets/apt-vs-gallery-3.jpg',
      'assets/apt-vs-gallery-4.jpg',
      'assets/apt-vs-gallery-5.jpg',
      'assets/apt-vs-gallery-6.jpg',
      'assets/apt-vs-gallery-7.jpg',
      'assets/apt-vs-gallery-8.jpg',    // comedor
      'assets/apt-vs-gallery-15.jpg',   // cocina
      'assets/apt-vs-gallery-16.jpg',
      'assets/apt-vs-gallery-17.jpg',
      'assets/apt-vs-gallery-18.jpg',
      'assets/apt-vs-gallery-21.jpg',   // dormitorio 1
      'assets/apt-vs-gallery-23.jpg',
      'assets/apt-vs-gallery-29.jpg',   // dormitorio 2 · camas + espejos
      'assets/apt-vs-gallery-30.jpg',   // dormitorio 2 · simétrico
      'assets/apt-vs-gallery-9.jpg',    // baño 1
      'assets/apt-vs-gallery-10.jpg',
      'assets/apt-vs-gallery-11.jpg',   // baño principal
      'assets/apt-vs-gallery-13.jpg',   // terraza principal
      'assets/apt-vs-gallery-19.jpg',
      'assets/apt-vs-gallery-20.jpg',
      'assets/apt-vs-gallery-24.jpg',
      'assets/apt-vs-gallery-25.jpg',
      'assets/apt-vs-gallery-27.jpg',
      'assets/apt-vs-gallery-14.jpg',   // segunda terraza
      'assets/apt-vs-gallery-28.jpg',   // rincón lucecitas
      'assets/apt-vs-gallery-31.jpg',   // piscina · día
      'assets/apt-vs-gallery-32.jpg',   // piscina · atardecer
    ],
    es: {
      name: 'Hestía Salinas',
      concept: 'El amarillo albero del amanecer sobre las salinas.',
      desc: 'Hestía Salinas vive en el color albero del amanecer almeriense. Tres piscinas, dos terrazas y el Parque Natural de las Salinas de Puerto Rey a la vuelta de la esquina.',
      desc2: 'A 900 metros del mar y junto al Parque Natural de las Salinas de Puerto Rey. La luz dorada de la tarde llena cada habitación, el privilegio de vivir junto a la naturaleza.',
      features: ['El más grande de los tres · el que más desconexión da · el mejor centro de operaciones para conocer toda la zona', '6 plazas + bebé · 2 habitaciones', 'Dos terrazas', '3 piscinas comunitarias · pistas de pádel', 'Gimnasio + sauna comunitarios', 'Parque Natural Salinas de Puerto Rey · acceso peatonal directo', '900 m de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Entrada · espejo y amarillo de bienvenida', 'Salón-comedor · luz de día sobre albero', 'Salón · sofá mostaza, tarde de película', 'Salón · sofá y turquesa para conversar', 'Sofá · con un cuadro de compañía', 'Salón · el conjunto desde arriba', 'Salón nocturno · sesión de cine en casa', 'Comedor · la lámpara teal reúne la mesa', 'Cocina · bajo la campana, encimera lista', 'Cocina · encimera de madera · tacto cálido', 'Cocina · blanca, con todo pensado', 'Cocina · de frente, lista para ti', 'Dormitorio principal · olas para arroparte', 'Dormitorio principal · de la cama a la terraza', 'Dormitorio 2 · dos camas · espejos gemelos', 'Dormitorio 2 · simetría serena · mesita a mano', 'Baño 1 · azul fresco junto al lavabo', 'Baño 1 · mosaico bajo la ducha', 'Baño principal · bañera y bidé, tiempo para ti', 'Terraza principal · sofás de cara a las vistas', 'Terraza pérgola · desayunos sin reloj', 'Terraza · desayuno Hestía, primer regalo del día', 'Terraza principal · cena para dos, luz de velas', 'Terraza principal · noche · la urbanización se enciende', 'Terraza principal · nubes encendidas al atardecer', 'Segunda terraza · velada para dos', 'Terraza · un rincón entre lucecitas', 'Piscina comunitaria · palmeras arriba, casa al lado', 'Piscina comunitaria · rosa de atardecer en el agua'],
    },
    en: {
      name: 'Hestía Salinas',
      concept: 'Ochre yellow, sunrise over the salt flats.',
      desc: 'Hestía Salinas lives in the ochre colour of the Almería sunrise. Three pools, two terraces and the Puerto Rey salt-flat nature park around the corner.',
      desc2: '900 metres from the sea and beside the Puerto Rey Salt-flat Nature Park. Golden afternoon light fills every room, the privilege of living beside unspoilt nature.',
      features: ['The largest of the three · the most disconnecting · the best base of operations to explore the whole area', '6 guests + baby · 2 bedrooms', 'Two terraces', '3 shared pools · padel courts', 'Communal gym + sauna', 'Puerto Rey Salt-flat Nature Park · direct pedestrian access', '900 m from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Entrance · mirror & a yellow welcome', 'Living & dining · daylight on ochre walls', 'Living room · mustard sofa, movie afternoons', 'Living room · sofa & teal for conversation', 'Sofa · with a painting for company', 'Living room · the whole scene from above', 'Evening living room · home-cinema mood', 'Dining area · teal light gathers the table', 'Kitchen · under the hood, counter ready', 'Kitchen · wooden counter · warm touch', 'Kitchen · all white, nothing missing', 'Kitchen · full view, ready for you', 'Master bedroom · waves to tuck you in', 'Master bedroom · from bed to terrace', 'Bedroom 2 · twin beds · twin mirrors', 'Bedroom 2 · calm symmetry · nightstand at hand', 'Bathroom 1 · cool blue by the sink', 'Bathroom 1 · mosaic under the shower', 'Main bathroom · bathtub & bidet, time for you', 'Main terrace · loungers facing the view', 'Pergola terrace · breakfasts without a clock', "Terrace · Hestía breakfast, the day's first treat", 'Main terrace · dinner for two, candlelight', 'Main terrace · night · the complex lights up', 'Main terrace · clouds catching the sunset', 'Second terrace · an evening for two', 'Terrace · a corner wrapped in fairy lights', 'Community pool · palms above, home steps away', 'Community pool · pink dusk on the water'],
    },
  },
};

// ================================================================
// EQUIPAMIENTO, datos por Hestía
// ================================================================
const APT_EQUIP = {
  vm: {
    area: 77, guests: 6, bedrooms: 2, bathrooms: 2,
    daily_es: {
      eyebrow: 'Tu día en Hestía Mar',
      morning: 'Te despiertas con el mar a 300 metros y la luz que entra por la terraza de esquina, donde comienzas el día con un buen desayuno. Luego sales a la piscina y al jacuzzi del jardín sin coger el coche.',
      core: 'La casa funciona con A/C por conductos, fibra y Smart TV con Prime, HBO, Sky y Pluto. La cocina está completa (lavavajillas y lavadora). Dos baños: uno con columna de hidroterapia y espejo de cromoterapia, otro con ducha.',
      behind: 'Antes de que llegues: sábanas de 200 hilos planchadas, toallas de 600 g/m², kit de bienvenida, sombrilla preparada, cuna y trona montadas si las pediste. El A/C ajustado a la estación y el botiquín revisado.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Mar',
      morning: 'You wake up to the sea 300 m away and the light pouring in from the corner terrace, where you start the day with a good breakfast. Then the pool and jacuzzi in the garden, no need to take the car.',
      core: 'The flat runs on ducted A/C, fibre Wi-Fi and a Smart TV with Prime, HBO, Sky and Pluto. Full kitchen (dishwasher and washer). Two bathrooms: one with a hydrotherapy column and chromotherapy mirror, the other with a shower.',
      behind: 'Before you arrive: 200-thread sheets ironed, 600 g/m² towels, a welcome kit, beach umbrella ready, cot and high chair set up if you booked them. A/C tuned to the season, first-aid kit checked.',
    },
    es: {
      terrace: 'Terraza 20m² esquina',
      icons: [
        ['🌊', 'Playa a 300m'], ['☀️', 'Terraza 20m² · esquina'], ['🏊', 'Piscina + Jacuzzi'],
        ['🌿', 'Jardines'], ['🛋', 'Chill out'], ['🛗', 'Ascensor'],
        ['📺', 'Smart TV 55"'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C por conductos'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora'], ['🛁', 'Bañera + hidromasaje'], ['🚿', 'Ducha'],
        ['🚗', 'Garaje cubierto'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'], ['👶', 'Cuna · Trona'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado · juego extra para el sofá-cama'], ['🧴', 'Toallas 600g/m²'],
        ['🌺', 'Nórdico de plumas'], ['🪔', 'Cromoterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '20m² corner terrace',
      icons: [
        ['🌊', 'Beach 300m away'], ['☀️', '20m² corner terrace'], ['🏊', 'Pool + Jacuzzi'],
        ['🌿', 'Gardens'], ['🛋', 'Chill-out'], ['🛗', 'Lift'],
        ['📺', '55" Smart TV'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'Ducted A/C'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washer'], ['🛁', 'Bath + hydro-massage'], ['🚿', 'Shower'],
        ['🚗', 'Covered garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'], ['👶', 'Cot · Highchair'],
        ['🛏', '200-thread combed cotton sheets · extra set for the sofa-bed'], ['🧴', 'Bath towels 600g/m²'],
        ['🌺', 'Down duvet'], ['🪔', 'Chromotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
  vt: {
    area: 85, guests: 6, bedrooms: 2, bathrooms: 2,
    daily_es: {
      eyebrow: 'Tu día en Hestía Thalassa',
      morning: 'El Mediterráneo enmarcado en la terraza de 18 m² del ático. Cafetera Nespresso y desayuno con vistas. Disfruta de tus piscinas exteriores o de interior, dependiendo de la época del año.',
      core: 'Zonas comunes: SPA con sauna y gimnasio (SPA en otoño-invierno-primavera; gimnasio todo el año), piscinas y pista de tenis. En el ático: Smart TV con Prime, HBO, Sky y Pluto, dos baños en suite con columnas de hidromasaje y cocina alto standing.',
      behind: 'Cada llegada: sábanas de 200 hilos planchadas, toallas de 600 g/m², nórdicos de plumas, kit de bienvenida. Las zonas comunes (SPA, piscinas, gimnasio) las mantiene la urbanización; el ático lo dejamos listo nosotros: A/C calibrado, cafetera cargada y aromas preparados.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Thalassa',
      morning: 'The Mediterranean framed by the 18 m² penthouse terrace. Nespresso machine, breakfast with a view. Enjoy the outdoor or indoor pools depending on the time of year.',
      core: 'Shared areas: spa with sauna and gym (spa open autumn–winter–spring; gym year-round), pools and tennis court. In the penthouse: Smart TV with Prime, HBO, Sky and Pluto, two en-suite bathrooms with hydro-massage columns and a high-end kitchen.',
      behind: 'Every arrival: 200-thread sheets ironed, 600 g/m² towels, down duvets, a welcome kit. The complex maintains the shared areas (spa, pools, gym); we leave the penthouse fully prepped: A/C tuned, coffee machine loaded, aromas in place.',
    },
    es: {
      terrace: '2 terrazas · delantera 18m² + trasera',
      icons: [
        ['🌊', 'Mar · Laguna · Pueblo'], ['☀️', 'Terraza delantera 18m² · vistas al mar'], ['🌅', 'Terraza trasera'], ['🏊', '3 Piscinas'],
        ['🌡', 'Piscina climatizada'], ['♨️', 'Jacuzzi'], ['💪', 'Gimnasio'],
        ['🧖', 'Sauna'], ['🎾', 'Pista de tenis'], ['🌿', 'Jardines · Columpios'],
        ['📺', 'Smart TV 55"'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C salón y dormitorios'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Dos baños · en suite'], ['🚿', 'Columnas de hidromasaje'],
        ['🚗', 'Garaje interior'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado · juego extra para el sofá-cama'], ['🧴', 'Toallas 600g/m²'],
        ['🌺', 'Nórdicos de plumas'], ['🪔', 'Hidroterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '2 terraces · front 18m² + rear',
      icons: [
        ['🌊', 'Sea · Lagoon · Village'], ['☀️', 'Front terrace 18m² · sea views'], ['🌅', 'Rear terrace'], ['🏊', '3 Swimming pools'],
        ['🌡', 'Heated pool (autumn–spring)'], ['♨️', 'Jacuzzi'], ['💪', 'Gym'],
        ['🧖', 'Sauna'], ['🎾', 'Tennis court'], ['🌿', 'Gardens · Swings'],
        ['📺', '55" Smart TV'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C lounge & bedrooms'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Two en-suite bathrooms'], ['🚿', 'Hydro-massage columns'],
        ['🚗', 'Indoor garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'],
        ['🛏', '200-thread combed cotton sheets · extra set for the sofa-bed'], ['🧴', 'Bath towels 600g/m²'],
        ['🌺', 'Down duvets'], ['🪔', 'Hydrotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
  vs: {
    area: 80, guests: 6, bedrooms: 2, bathrooms: 2,
    daily_es: {
      eyebrow: 'Tu día en Hestía Salinas',
      morning: 'La luz dorada de las Salinas de Puerto Rey, único humedal protegido a la vuelta de la esquina, entra por la terraza grande de 18 m². Café y desayuno al sol; luego paseas hasta la playa o por el jardín de la urbanización.',
      core: 'Dos terrazas: la de 18 m² para sol y luna, la de 14 m² para el atardecer. Piscina, gimnasio y pista de tenis en la urbanización. Smart TV 55" con Ambilight, Prime/HBO/Sky/Pluto, cocina completa y A/C frío-calor.',
      behind: 'Antes de tu llegada: sábanas de 200 hilos planchadas, toallas de 600 g/m², nórdicos de plumas más alternativa antialérgica en el dormitorio principal, cuna y trona si las pediste. La cafetera Nespresso cargada y los aromas elegidos según la estación.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Salinas',
      morning: 'Golden light from Puerto Rey salt flats, the only protected wetland just around the corner, pours in through the 18 m² main terrace. Coffee and breakfast in the sun; then a walk to the beach or through the complex gardens.',
      core: 'Two terraces: the 18 m² for sun and moon, the 14 m² for sunset. Pool, gym and tennis court in the complex. 55" Ambilight Smart TV, Prime/HBO/Sky/Pluto, full kitchen and heat-cool A/C.',
      behind: 'Before you arrive: 200-thread sheets ironed, 600 g/m² towels, down duvets plus a hypoallergenic alternative in the master bedroom, cot and high chair if you booked them. Nespresso machine loaded and aromas chosen by season.',
    },
    es: {
      terrace: '2 terrazas 18m² + 14m²',
      icons: [
        ['🌊', 'Playa a 5 min en coche'], ['☀️', 'Terraza 18m² · sol y luna'], ['🌅', 'Terraza 14m² · atardecer'],
        ['🏊', 'Piscina'], ['🌿', 'Jardines · Riachuelos'], ['💪', 'Gimnasio'],
        ['🎾', 'Pista de tenis'], ['🛋', 'Chill out'], ['🏞', 'Salinas de Puerto Rey'],
        ['📺', 'Smart TV 55" · Ambilight'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C frío y calor'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Bañera + hidromasaje'], ['🚿', 'Cabina ducha + hidromasaje'],
        ['🚗', 'Garaje techado'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'], ['👶', 'Cuna · Trona'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado · juego extra para el sofá-cama'], ['🧴', 'Toallas 600g/m²'],
        ['🌺', 'Nórdicos plumas + acrílicos (antialérgicos)'], ['🪔', 'Aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '2 terraces 18m² + 14m²',
      icons: [
        ['🌊', 'Beach 5 min by car'], ['☀️', '18m² terrace · sun & moon'], ['🌅', '14m² terrace · sunsets'],
        ['🏊', 'Pool'], ['🌿', 'Gardens · Streams'], ['💪', 'Gym'],
        ['🎾', 'Tennis court'], ['🛋', 'Chill-out'], ['🏞', 'Puerto Rey Salt Flats'],
        ['📺', '55" Smart TV · Ambilight'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C heat & cool'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Bath + hydro-massage'], ['🚿', 'Shower cabin + hydro-massage'],
        ['🚗', 'Covered garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'], ['👶', 'Cot · Highchair'],
        ['🛏', '200-thread combed cotton sheets · extra set for the sofa-bed'], ['🧴', 'Bath towels 600g/m²'],
        ['🌺', 'Down & hypoallergenic duvets'], ['🪔', 'Aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
};

const AptEquipamiento = ({ apt, lang }) => {
  const equip = APT_EQUIP[apt.id];
  if (!equip) return null;
  const d = equip[lang];
  const accent = apt.accent;

  const TECH_KW    = ['TV', 'WiFi', 'WIFI', 'fibra', 'Prime', 'HBO', 'Sky', 'Pluto', 'Alexa', 'Smart', 'fibre', 'Fibre'];
  const KITCHEN_KW = ['cocin', 'kitchen', 'Kitchen', 'Lavadora', 'lavadora', 'Dishwasher', 'dishwasher', 'Washer', 'washer', 'lavavajillas', 'caf', 'Caf', 'espresso', 'nevera', 'microondas', 'tendedero', 'Tendedero', 'iron', 'Nespresso', 'blender', 'batidora', 'plancha', 'drip'];
  const OUTDOOR_KW = ['playa', 'Beach', 'beach', 'Piscina', 'piscin', 'pool', 'Pool', 'Terraza', 'terraza', 'terrace', 'Terrace', 'jardín', 'Garden', 'garden', 'jacuzzi', 'Jacuzzi', 'sauna', 'Sauna', 'SPA', 'pádel', 'padel', 'tenis', 'tennis', 'Tennis', 'gym', 'Gym', 'Gimnasio', 'gimnasio', 'Salinas', 'salinas', 'salt', 'Salt', 'lagoon', 'Lagoon', 'chill', 'Chill', 'Lift', 'Ascensor', 'garaje', 'Garaje', 'Garage', 'garage', 'Streams', 'streams', 'Swings', 'columpios', 'Park', 'Parque', 'Mar ', 'Sea ', 'Pueblo', 'Village', 'Laguna', 'climatiz'];
  const categorize = (label) => {
    if (TECH_KW.some(k => label.includes(k)))    return 'tech';
    if (KITCHEN_KW.some(k => label.includes(k))) return 'kitchen';
    if (OUTDOOR_KW.some(k => label.includes(k))) return 'outdoor';
    return 'comfort';
  };
  const CATS = [
    { key: 'outdoor', es: 'Espacio y entorno',  en: 'Space & surroundings' },
    { key: 'tech',    es: 'Tecnología',          en: 'Technology' },
    { key: 'kitchen', es: 'Cocina',              en: 'Kitchen' },
    { key: 'comfort', es: 'Confort',             en: 'Comfort' },
  ];
  const grouped = CATS
    .map(cat => ({ ...cat, items: d.icons.filter(([, lbl]) => categorize(lbl) === cat.key) }))
    .filter(cat => cat.items.length > 0);

  // Narrativa "Tu día en Hestía Mar/Thalassa/Salinas", cuenta el día
  // del huésped (mañana, lo que tiene a su disposición, y el trabajo
  // de preparación que va detrás de cada llegada).
  const daily = equip[`daily_${lang}`];

  return (
    <section className="apt-equip">
      <div className="container">
        {daily && (
          <div className="apt-day" style={{ '--apt-accent': accent }}>
            <div className="eyebrow apt-day-eyebrow">{daily.eyebrow}</div>
            <div className="apt-day-grid">
              <div className="apt-day-card apt-day-card-morning">
                <div className="apt-day-card-tag">
                  <span className="apt-day-card-num">01</span>
                  <span className="apt-day-card-tlabel">{lang === 'es' ? 'cada mañana' : 'every morning'}</span>
                </div>
                <p className="apt-day-card-text">{daily.morning}</p>
              </div>
              <div className="apt-day-card apt-day-card-core">
                <div className="apt-day-card-tag">
                  <span className="apt-day-card-num">02</span>
                  <span className="apt-day-card-tlabel">{lang === 'es' ? 'lo que tienes' : 'what you get'}</span>
                </div>
                <p className="apt-day-card-text">{daily.core}</p>
              </div>
              <div className="apt-day-card apt-day-card-behind">
                <div className="apt-day-card-tag">
                  <span className="apt-day-card-num">03</span>
                  <span className="apt-day-card-tlabel">{lang === 'es' ? 'el trabajo detrás' : 'work behind the scenes'}</span>
                </div>
                <p className="apt-day-card-text">{daily.behind}</p>
              </div>
            </div>
          </div>
        )}
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
              <span className="aes-val" style={{ color: 'var(--apt-accent-dk)' }}>{s.val}</span>
              {s.unit && <span className="aes-unit"> {s.unit}</span>}
              <span className="aes-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
        <div className="apt-equip-categories">
          {grouped.map(cat => (
            <div key={cat.key} className="apt-equip-cat">
              <div className="aec-label" style={{ color: 'var(--apt-accent-dk)' }}>{lang === 'es' ? cat.es : cat.en}</div>
              <div className="apt-equip-icons">
                {cat.items.map(([icon, label], i) => (
                  <div key={i} className="apt-equip-item">
                    <span className="aei-icon" aria-hidden="true">{amenityHi(icon) ? <HiIcon name={amenityHi(icon)} size={20} /> : icon}</span>
                    <span className="aei-label">{label}</span>
                  </div>
                ))}
              </div>
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
    {caption && <div className="ph-caption">– {caption}</div>}
  </div>
);

// --- Hero de la página de Hestía ---
const AptPageHero = ({ apt, lang, scrolled, mode }) => {
  const d = apt[lang];
  const tbl = HESTIA_PRICES[apt.id];
  // El precio "desde" es el base de prices.json en temporada baja –
  // exactamente el número que el admin ve en /p-edit.html. Sin restar
  // el directDiscount: ese descuento sirve para calcular el ahorro
  // vs Booking/Airbnb dentro del desglose de la reserva, no aquí.
  const minPrice = tbl ? Math.min(...tbl.base.slice(1)) : null;
  return (
    <section className="apt-page-hero" data-apt={apt.id} style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <picture>
        <source srcSet={apt.hero_img.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2')} type="image/webp"/>
        <BlurImg src={apt.hero_img} alt={d.name} imgClassName="apt-page-hero-img" loading="eager" fill webp={false}/>
      </picture>
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
        {minPrice && (
          <p className="apt-page-price">
            {lang === 'es' ? `desde ${minPrice}€` : `from ${minPrice}€`}
            <span className="app-per">{lang === 'es' ? ' / noche · precio directo' : ' / night · direct price'}</span>
            <span className="app-match">
              {lang === 'es'
                ? '· Mejor precio garantizado: si lo ves más barato, no solo te lo igualamos, te lo mejoramos.'
                : '· Best price guaranteed: find it cheaper and we don\'t just match it, we beat it.'}
            </span>
          </p>
        )}
        <div className="apt-page-ctas">
          <a href={`reservas.html?apt=${apt.id}`} className="btn btn-primary apt-page-reserve-btn">
            {lang === 'es' ? 'Reservar' : 'Book now'} <span className="arrow">→</span>
          </a>
          <a href="#apt-avail" className="btn btn-ghost-light">
            {lang === 'es' ? 'Ver disponibilidad' : 'Check availability'}
          </a>
        </div>
        <p className="apt-page-cancel">
          {lang === 'es' ? '✓ Política de cancelación sin competencia' : '✓ Unmatched cancellation policy'}
        </p>
      </div>
    </section>
  );
};

// --- TrustStrip ---
// Tira de confianza bajo el hero: años operando + reseñas + ★ + países.
// Datos reales calculados de window.REVIEWS (data/reviews.json).
const TrustStrip = ({ apt, lang }) => {
  const all = (window.REVIEWS && window.REVIEWS.items) || [];
  const own = all.filter(r =>
    r.status === 'published' && (r.apt === apt.id || r.apt === 'all'));
  const total = own.length;
  // Booking usa /10, otros /5, normalizamos todo a /5
  const ratings = own.map(r => r.source === 'booking' ? r.rating / 2 : r.rating)
    .filter(n => typeof n === 'number' && !isNaN(n));
  const avg = ratings.length
    ? Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10
    : null;
  const countries = new Set(own.map(r => r.country).filter(Boolean));
  const years = new Date().getFullYear() - 2016;

  const stats = [
    { v: `${years} ${lang === 'es' ? 'años' : 'years'}`,
      l: lang === 'es' ? 'desde 2016' : 'since 2016' },
    { v: total.toString(),
      l: lang === 'es' ? (total === 1 ? 'reseña verificada' : 'reseñas verificadas') : (total === 1 ? 'verified review' : 'verified reviews') },
    avg ? { v: `${avg}★`,
            l: lang === 'es' ? 'valoración media' : 'avg rating' } : null,
    countries.size > 1 ? { v: countries.size.toString(),
            l: lang === 'es' ? 'países de origen' : 'guest countries' } : null,
  ].filter(Boolean);

  return (
    <section className="apt-trust-strip" data-apt={apt.id} style={{ '--apt-accent': apt.accent }}>
      <div className="apt-trust-inner">
        {stats.map((s, i) => (
          <div key={i} className="apt-trust-item">
            <div className="apt-trust-v">{s.v}</div>
            <div className="apt-trust-l">{s.l}</div>
          </div>
        ))}
        <div className="apt-trust-item apt-trust-direct">
          <div className="apt-trust-v">
            {lang === 'es' ? 'Sin comisión' : 'No fees'}
          </div>
          <div className="apt-trust-l">
            {lang === 'es' ? 'reserva directa' : 'direct booking'}
          </div>
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
const GalleryCarousel = ({ imgs, captions, lang = 'es' }) => {
  const n = imgs.length;
  const [cur, setCur]       = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const thumbsRef  = React.useRef(null);
  const timerRef   = React.useRef(null);
  const pausedRef  = React.useRef(false);
  const lbCloseRef = React.useRef(null);

  // Smart object-position per photo, calculated from edge centroid.
  // Loaded from data/photo-positions.json (cargado en window.PHOTO_POS).
  const posFor = (src) => {
    const map = window.PHOTO_POS || {};
    const key = src.split('/').pop();
    return map[key] || '50% 50%';
  };

  // Cache-bust de las fotos de galería: al reemplazar una foto con el mismo
  // nombre, el navegador (sobre todo Safari) sirve la vieja cacheada. Subir
  // GALLERY_V fuerza la nueva. posFor/captions siguen usando el src limpio.
  const gv = (src) => `${src}?v=${GALLERY_V}`;

  // <picture> elige la fuente .webp por type, pero si esa fuente falla (404,
  // caché o deploy incompleto) NO cae al <img> jpg por sí sola: la imagen
  // queda en blanco. Aquí forzamos el fallback al jpg al primer error.
  const webpFallback = (e) => {
    const img = e.currentTarget;
    if (img.dataset.jpgFallback) return;
    img.dataset.jpgFallback = '1';
    const pic = img.parentNode;
    const source = pic && pic.tagName === 'PICTURE' ? pic.querySelector('source[type="image/webp"]') : null;
    if (source) source.remove();
    const jpg = img.getAttribute('src');
    img.src = jpg + (jpg.indexOf('?') >= 0 ? '&' : '?') + 'fb=1';
  };

  // Cambia de foto. La animación visual la lleva el CSS sobre
  // .gc-slide (transform translateX). NO envolvemos en _vt() porque
  // colisiona con el slide CSS y produce flicker en mobile.
  const stepTo = (next) => setCur(next);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) stepTo((cur + 1) % n);
    }, 6000);
  };

  React.useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [cur, n]);

  // Keyboard navigation + focus trap for lightbox
  React.useEffect(() => {
    if (!lightbox) return;
    lbCloseRef.current && lbCloseRef.current.focus();
    const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const onKey = e => {
      if (e.key === 'ArrowRight') stepTo((cur + 1) % n);
      if (e.key === 'ArrowLeft')  stepTo((cur - 1 + n) % n);
      if (e.key === 'Escape')     setLightbox(false);
      if (e.key === 'Tab') {
        const el = document.querySelector('.gc-lightbox');
        if (!el) return;
        const nodes = [...el.querySelectorAll(FOCUSABLE)];
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, cur, n]);

  // Scroll the strip horizontally to centre the active thumb, never the page
  React.useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const thumb = strip.children[cur];
    if (!thumb) return;
    const offset = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left: offset, behavior: 'smooth' });
  }, [cur]);

  const go = i => { stepTo(i); resetTimer(); };

  // Swipe on main image. Trackeamos si hubo swipe para no abrir el
  // lightbox al soltar (touchend dispara click sintético después).
  const touchX = React.useRef(null);
  const swipedRef = React.useRef(false);
  const onTouchStart = e => { touchX.current = e.touches[0].clientX; swipedRef.current = false; };
  const onTouchEnd   = e => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      stepTo(dx < 0 ? (cur + 1) % n : (cur - 1 + n) % n);
      resetTimer();
      swipedRef.current = true;
    }
    touchX.current = null;
  };

  const openLightbox = () => {
    if (swipedRef.current) { swipedRef.current = false; return; }
    setLightbox(true);
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => { setLightbox(false); document.body.style.overflow = ''; };

  return (
    <>
      <div className="gc-wrap">
        <div className="gc-stage"
             onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
             onMouseEnter={() => { pausedRef.current = true; }}
             onMouseLeave={() => { pausedRef.current = false; }}
             onClick={openLightbox}>
          {imgs.map((src, i) => (
            <div key={i} className={`gc-slide${i === cur ? ' gc-slide-active' : ''}`}
                 style={{ transform: `translateX(${(i - cur) * 100}%)` }}>
              <BlurImg src={gv(src)} alt={captions[i]} fill
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={webpFallback}
                imgStyle={{ objectPosition: posFor(src) }}/>
            </div>
          ))}
          <div className="gc-overlay">
            <WatermarkBadge size={26} pos={{ bottom: 12, right: 12 }}/>
            <div className="gc-caption">{captions[cur]}</div>
            <div className="gc-counter">{cur + 1} / {n}</div>
            <div className="gc-zoom-hint">⤢</div>
          </div>
          <button className="gc-prev" onClick={e => { e.stopPropagation(); go((cur - 1 + n) % n); }} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>‹</button>
          <button className="gc-next" onClick={e => { e.stopPropagation(); go((cur + 1) % n); }} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>›</button>
        </div>
        <div className="gc-thumbs" ref={thumbsRef}>
          {imgs.map((src, i) => (
            <button key={i}
                    className={`gc-thumb${i === cur ? ' gc-thumb-on' : ''}`}
                    onClick={e => { e.stopPropagation(); go(i); }}
                    aria-label={captions[i]}>
              <picture>
                <source srcSet={gv(src).replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2')} type="image/webp"/>
                <img decoding="async" src={gv(src)} alt="" loading="lazy"
                  onError={webpFallback}
                  style={{ objectPosition: posFor(src) }}/>
              </picture>
            </button>
          ))}
        </div>
      </div>
      {lightbox && (
        <div className="gc-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label={lang === 'es' ? 'Galería de fotos' : 'Photo gallery'}>
          <button ref={lbCloseRef} className="gc-lb-close" onClick={closeLightbox} aria-label={lang === 'es' ? 'Cerrar' : 'Close'}>✕</button>
          <button className="gc-lb-prev" onClick={e => { e.stopPropagation(); setCur(i => (i - 1 + n) % n); }} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>‹</button>
          <picture className="gc-lb-pic">
            <source srcSet={gv(imgs[cur]).replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2')} type="image/webp"/>
            <img decoding="async" className="gc-lb-img" src={gv(imgs[cur])} alt={captions[cur]} onError={webpFallback} onClick={e => e.stopPropagation()}/>
          </picture>
          <button className="gc-lb-next" onClick={e => { e.stopPropagation(); setCur(i => (i + 1) % n); }} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>›</button>
          <div className="gc-lb-caption">{captions[cur]}</div>
          <div className="gc-lb-counter">{cur + 1} / {n}</div>
        </div>
      )}
    </>
  );
};

const AptVideoDesc = ({ apt, lang }) => {
  if (!apt.video_src) return null;
  const d = apt[lang];
  const reservasHref = `reservas.html?apt=${apt.id}`;
  const guideHref = `${apt.slug}.html#guide`;
  return (
    <section className="apt-video-desc" style={{ '--apt-accent': apt.accent }}>
      <div className="avd-inner">
        <div className="avd-video-col">
          <span className="eyebrow avd-eyebrow">{lang === 'es' ? 'Visita virtual' : 'Virtual tour'}</span>
          <div className="avd-iframe-wrap">
            <video
              className="avd-iframe"
              src={apt.video_src}
              autoPlay muted loop playsInline controls
              poster={apt.hero_img}
            />
          </div>
        </div>
        <div className="avd-text-col">
          <p className="avd-concept">{d.concept}</p>
          <p className="avd-desc">{d.desc}</p>
          <p className="avd-desc2">{d.desc2}</p>
          <div className="avd-cta-row">
            <a href={reservasHref} className="btn btn-primary">
              {lang === 'es' ? 'Reservar' : 'Book'} <span className="arrow">&#8594;</span>
            </a>
            <a href={guideHref} className="btn btn-ghost">
              {lang === 'es' ? 'Guia del apartamento' : 'Apartment guide'}
            </a>
          </div>
        </div>
      </div>
    </section>
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
        ? <GalleryCarousel imgs={imgs} captions={captions} lang={lang}/>
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

// --- Otros Hestías ---
const AptPageOthers = ({ apt, lang }) => {
  const others = apt.others.map(id => APT_DATA[id]);
  return (
    <section className="apt-page-others">
      <div className="eyebrow" style={{ marginBottom: 32 }}>
        {lang === 'es' ? 'Los otros dos Hestías' : 'The other two Hestías'}
      </div>
      <div className="apt-others-grid">
        {others.map(o => {
          const d = o[lang];
          return (
            <a key={o.id} href={`${o.slug}.html`} className={`apt-other-card ${o.id}`}
               style={{ '--other-accent': o.accent }}>
              <picture>
                <source srcSet={o.hero_img.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2')} type="image/webp"/>
                <BlurImg src={o.hero_img} alt={d.name} imgClassName="apt-other-img" fill loading="lazy" webp={false}/>
              </picture>
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
                  {lang === 'es' ? 'Ver Hestía' : 'See Hestía'} →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

// --- Plano de Hestía (solo si floorplan_img está definido) ---
const AptFloorPlan = ({ apt, lang }) => {
  if (!apt.floorplan_img) return null;
  const subtitle = lang === 'es' ? (apt.floorplan_subtitle_es || 'distribución en planta.') : (apt.floorplan_subtitle_en || 'floor layout.');
  const desc     = lang === 'es' ? apt.floorplan_desc_es : apt.floorplan_desc_en;
  return (
    <section className="apt-floorplan section-cream">
      <div className="container">
        <div className="eyebrow apt-fp-eyebrow">
          {lang === 'es' ? 'Distribución de Hestía' : 'Hestía layout'}
        </div>
        <h2 className="apt-fp-title">
          {apt.name_short}, <em>{subtitle}</em>
        </h2>
        {desc && <p className="apt-fp-desc">{desc}</p>}
        <div className="apt-fp-img-wrap reveal">
          <div className="apt-fp-watermark-wrap">
            <img decoding="async"
              src={apt.floorplan_img}
              alt={lang === 'es' ? `Plano de ${apt[lang].name}` : `Floor plan of ${apt[lang].name}`}
              className="apt-fp-img"
              loading="lazy"
            />
            <div className="apt-fp-watermark" aria-hidden="true">
              <img src="assets/logo-hestia-brand.png" alt="" className="apt-fp-watermark-logo" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Descarga de guía protegida por PIN ---
//
// El PIN es fricción de UX, no seguridad real (sitio estático).
// Los PDFs se sirven desde assets/guides/{PIN}.pdf, la URL solo es
// "adivinable" si conoces el PIN. Cualquiera con la URL puede descargar.
//
const APT_GUIDE_PIN = { vm: 'HVM2016', vt: 'HVT2019', vs: 'HVS2021' };

const AptGuideDownload = ({ apt, lang }) => {
  const expected = APT_GUIDE_PIN[apt.id];
  const [pin, setPin] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | error | success
  const inputRef = React.useRef(null);

  const t = lang === 'es' ? {
    eyebrow: 'Guía digital',
    title: `Descarga la guía de ${apt.es.name}`,
    desc: 'Recomendaciones del barrio, restaurantes, calas, instrucciones de Hestía y todo lo que necesitas para tu estancia.',
    placeholder: 'PIN de tu reserva',
    submit: 'Descargar PDF',
    helper: 'Encontrarás el PIN en tu confirmación de reserva.',
    error: 'PIN incorrecto. Revisa tu confirmación de reserva.',
    success: 'PIN correcto. Descargando la guía…',
  } : {
    eyebrow: 'Digital guide',
    title: `Download your ${apt.en.name} guide`,
    desc: 'Neighborhood recommendations, restaurants, coves, Hestía instructions and everything you need for your stay.',
    placeholder: 'Booking PIN',
    submit: 'Download PDF',
    helper: 'You will find the PIN in your booking confirmation.',
    error: 'Wrong PIN. Check your booking confirmation.',
    success: 'PIN accepted. Downloading the guide…',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Lee del DOM, no del state. En móvil, tipear el último carácter
    // y pulsar submit casi a la vez puede hacer que el setState del
    // onChange no haya committed todavía y `pin` sea el valor anterior.
    const liveValue = (inputRef.current && inputRef.current.value) || pin;
    const entered = liveValue.trim().toUpperCase();
    if (entered !== pin) setPin(entered);
    const ok = window.validateGuidePin
      ? await window.validateGuidePin(apt.id, entered)
      : (entered === expected);
    if (ok) {
      setStatus('success');
      // El PDF se sirve con el nombre del PIN maestro; los PINs de huésped
      // validan el acceso pero el fichero es el mismo.
      const a = document.createElement('a');
      a.href = `assets/guides/${expected}.pdf`;
      a.download = `Guia-${apt.es.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      setStatus('error');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <section
      id="guide"
      className="apt-guide"
      data-apt={apt.id}
      style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}
    >
      <div className="apt-guide-inner">
        <div className="apt-guide-copy">
          <span className="apt-guide-eyebrow">{t.eyebrow}</span>
          <h2 className="apt-guide-title">{t.title}</h2>
          <p className="apt-guide-desc">{t.desc}</p>
        </div>
        <form
          className={`apt-guide-form${status === 'error' ? ' is-error' : ''}${status === 'success' ? ' is-success' : ''}`}
          onSubmit={handleSubmit}
          noValidate
        >
          <label htmlFor={`guide-pin-${apt.id}`} className="apt-guide-label">{t.placeholder}</label>
          <div className="apt-guide-row">
            <input
              ref={inputRef}
              id={`guide-pin-${apt.id}`}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              data-1p-ignore="true"
              data-lpignore="true"
              maxLength={12}
              className="apt-guide-input"
              placeholder={`${(APT_GUIDE_PIN[apt.id] || 'HVX0000').slice(0, 3)}0000`}
              value={pin}
              onChange={(e) => { setPin(e.target.value); if (status !== 'idle') setStatus('idle'); }}
              aria-invalid={status === 'error'}
              aria-describedby={`guide-msg-${apt.id}`}
            />
            <button type="submit" className="apt-guide-btn">
              <span>{t.submit}</span>
              <span className="apt-guide-arrow" aria-hidden="true">↓</span>
            </button>
          </div>
          <p id={`guide-msg-${apt.id}`} className="apt-guide-msg" role="status">
            {status === 'error'   ? t.error   :
             status === 'success' ? t.success :
             t.helper}
          </p>
        </form>
      </div>
    </section>
  );
};

// --- Mini reseñas antes del calendario ---
// 3 citas reales de huéspedes (campo highlight) del mismo apartamento.
// Idioma preferido = lang de la página; fallback a cualquier idioma.
const _amrFlag = (cc) => {
  if (!cc || cc.length !== 2) return '';
  const b = 0x1F1E6;
  return String.fromCodePoint(b + cc.toUpperCase().charCodeAt(0) - 65) +
         String.fromCodePoint(b + cc.toUpperCase().charCodeAt(1) - 65);
};
const _amrStars = (r) => Math.round(r.source === 'booking' ? r.rating / 2 : r.rating);
const _amrSrc   = { booking: 'Booking', airbnb: 'Airbnb', google: 'Google', web: 'Hestía' };

const AmrCard = ({ r, lang }) => {
  const stars = _amrStars(r);
  const full = r.text || '';
  const needsTrunc = full.length > 145;
  const [open, setOpen] = React.useState(false);
  const text = needsTrunc && !open ? full.slice(0, 142) + '…' : full;
  return (
    <div className="amr-card">
      <div className="amr-top">
        <span className="amr-stars" aria-label={`${stars} estrellas`}>{'★'.repeat(stars)}</span>
        <span className="amr-src-lbl">{_amrSrc[r.source] || r.source}</span>
      </div>
      <p className="amr-text">"{text}"</p>
      {needsTrunc && (
        <button type="button" className="amr-expand-btn" onClick={() => setOpen(o => !o)}>
          {open ? (lang === 'es' ? 'Leer menos' : 'Show less') : (lang === 'es' ? 'Leer más' : 'Read more')}
        </button>
      )}
      <div className="amr-author">
        <span className="amr-flag" aria-hidden="true">{_amrFlag(r.country)}</span>
        <span className="amr-name">{r.name}</span>
      </div>
    </div>
  );
};

const AptMiniReviews = ({ apt, lang }) => {
  const all  = (window.REVIEWS && window.REVIEWS.items) || [];
  const pool = all.filter(r => r.status === 'published' && r.apt === apt.id && r.highlight)
                  .sort((a, b) => b.date > a.date ? 1 : -1);
  if (pool.length === 0) return null;

  const inLang = pool.filter(r => r.lang === lang);
  const picks  = (inLang.length >= 3 ? inLang : pool).slice(0, 3);

  return (
    <section className="apt-mini-reviews" style={{ '--apt-accent': apt.accent }}>
      <div className="amr-inner">
        <p className="amr-eyebrow">
          {lang === 'es' ? 'Lo que dicen los huéspedes' : 'What guests say'}
        </p>
        <div className="amr-grid">
          {picks.map(r => <AmrCard key={r.id} r={r} lang={lang} />)}
        </div>
      </div>
    </section>
  );
};

// --- Tabla de precios orientativos ---
// Muestra el rango de precios por temporada como ancla de referencia.
// El objetivo no es convertir aquí sino generar contacto (WhatsApp)
// para que el usuario pueda recibir un precio personalizado inferior.
const AptPriceTeaser = ({ apt, lang }) => {
  const v2 = window.PRICES_V2;
  if (!v2 || !v2.apts || !v2.seasons) return null;
  const base = v2.apts[apt.id] && v2.apts[apt.id].base;
  if (!base) return null;

  const seasons = [
    { key: 'baja',    es: 'Temporada baja',    en: 'Low season'   },
    { key: 'media',   es: 'Temporada media',   en: 'Mid season'   },
    { key: 'alta',    es: 'Temporada alta',    en: 'High season'  },
    { key: 'critica', es: 'Temporada crítica', en: 'Peak season'  },
  ].map(s => {
    const def = v2.seasons[s.key];
    if (!def) return null;
    return { ...s, price: Math.round(base * def.multiplier) };
  }).filter(Boolean);

  const waMsg = encodeURIComponent(
    lang === 'es'
      ? `Hola, me interesa reservar ${apt.es.name}. ¿Podéis indicarme el precio para mis fechas?`
      : `Hello, I'm interested in ${apt.en.name}. Could you give me a price for my dates?`
  );
  const waHref = `https://wa.me/34620316370?text=${waMsg}`;

  return (
    <section className="apt-price-teaser" style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <div className="apt-pt-inner">
        <div className="apt-pt-copy">
          <span className="apt-pt-eyebrow">{lang === 'es' ? 'Precios orientativos' : 'Indicative prices'}</span>
          <p className="apt-pt-note">
            {lang === 'es'
              ? 'Precio de referencia para dos huéspedes · el precio real puede ser inferior según duración y temporada exacta.'
              : 'Reference price for two guests · the actual price may be lower depending on exact dates and duration.'}
          </p>
        </div>
        <div className="apt-pt-table">
          {seasons.map(s => (
            <div key={s.key} className={`apt-pt-row apt-pt-${s.key}`}>
              <span className="apt-pt-season">{lang === 'es' ? s.es : s.en}</span>
              <span className="apt-pt-price">
                {lang === 'es' ? 'desde ' : 'from '}
                <strong>{s.price} €</strong>
                <span className="apt-pt-per">{lang === 'es' ? '/noche' : '/night'}</span>
              </span>
            </div>
          ))}
          {(() => {
            const nightlyMonthly = base * 30;
            const lsCfg   = v2.longStayConfig || {};
            const lsRates = lsCfg.monthlyRates || { baja: 1490, media: 1590, alta: 1850 };
            const supp    = (lsCfg.aptSupplement || {})[apt.id] || 0;
            const lsRate  = Math.min(lsRates.baja, lsRates.media, lsRates.alta) + supp;
            const savings = Math.round((1 - lsRate / nightlyMonthly) * 100);
            return (
              <div className="apt-pt-row apt-pt-ls">
                <span className="apt-pt-season">
                  {lang === 'es' ? 'Estancia larga · +29 noches' : 'Long stay · 29+ nights'}
                  <span className="apt-pt-ls-tag">Sep–Jun</span>
                </span>
                <span className="apt-pt-ls-price">
                  <span className="apt-pt-ls-reg">~{nightlyMonthly.toLocaleString('es-ES')} €/mes</span>
                  <span className="apt-pt-ls-rate">
                    {lang === 'es' ? 'desde ' : 'from '}
                    <strong>{lsRate.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')} €/mes</strong>
                    <span className="apt-pt-ls-save">−{savings}%</span>
                  </span>
                </span>
              </div>
            );
          })()}
        </div>
        <a href={waHref} target="_blank" rel="noopener" className="apt-pt-wa-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {lang === 'es' ? 'Consúltanos precio para tus fechas' : 'Ask us for a price for your dates'}
          <span className="apt-pt-wa-arrow"> →</span>
        </a>
      </div>
    </section>
  );
};

// --- Sticky booking bar ---
const AptStickyBar = ({ apt, lang, scrolled }) => {
  const ref = React.useRef(null);
  const tbl = HESTIA_PRICES[apt.id];
  // Mismo criterio que el hero: mostrar el base de prices.json directo.
  const minP = tbl ? Math.min(...tbl.base.slice(1)) : null;
  const waMsg = lang === 'es'
    ? `Hola, me interesa reservar ${apt[lang].name}. ¿Podéis indicarme disponibilidad?`
    : `Hello, I'm interested in booking ${apt[lang].name}. Could you let me know availability?`;
  // El CTA del sticky bar lleva a /reservas con el apt pre-seleccionado.
  // Datos de contacto y canal (WhatsApp/email) se gestionan allí.
  const reservasHref = `reservas.html?apt=${apt.id}`;
  // Cerrar, estado persistente por sesión (no por dominio).
  const [closed, setClosed] = React.useState(() => {
    try { return sessionStorage.getItem('hestia-asb-closed-' + apt.id) === '1'; }
    catch (_) { return false; }
  });
  const close = () => {
    setClosed(true);
    try { sessionStorage.setItem('hestia-asb-closed-' + apt.id, '1'); } catch (_) {}
  };
  if (closed) return null;

  // Mide la altura real de la barra y la expone como --apt-sticky-h.
  // Así Cookies y FloatingChat suben EXACTAMENTE lo que mide la barra,
  // sin números mágicos por viewport. Una sola fuente de verdad.
  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--apt-sticky-h', `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--apt-sticky-h');
    };
  }, []);


  return (
    <div ref={ref} className={`apt-sticky-bar${scrolled ? ' asb-visible' : ''}`}>
      <button
        type="button"
        className="asb-close"
        aria-label={lang === 'es' ? 'Cerrar barra de reserva' : 'Close booking bar'}
        title={lang === 'es' ? 'Cerrar' : 'Close'}
        onClick={close}
      >×</button>
      <div className="asb-info">
        <span className="asb-name">HESTÍA <strong>{apt.name_short}</strong></span>
        {minP && (
          <span className="asb-price">
            {lang === 'es' ? `desde ${minP}€/noche` : `from ${minP}€/night`}
            <span className="asb-match" aria-hidden="true">
              {lang === 'es' ? '✓ mejor precio garantizado' : '✓ best price guaranteed'}
            </span>
          </span>
        )}
      </div>
      <a href={reservasHref} className="btn btn-primary asb-cta">
        {lang === 'es' ? 'Reservar' : 'Book'} <span className="arrow">→</span>
      </a>
      <button
        type="button"
        className="asb-perks"
        onClick={() => window.dispatchEvent(new Event('hestia:open-direct-perks'))}
        aria-label={lang === 'es' ? 'Ver ventajas de la reserva directa' : 'See direct booking perks'}
      >
        <span className="asb-perks-icon" aria-hidden="true">✦</span>
        <span className="asb-perks-text">{lang === 'es' ? 'Ver ventajas' : 'See perks'}</span>
      </button>
    </div>
  );
};

// --- App de página de Hestía ---
const ApartmentPageApp = () => {
  const aptId = window.__APT__ || 'vm';
  const apt = APT_DATA[aptId];

  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  // Si el huésped acaba de validar el PIN en otra página vía
  // GuestAccessModal, sessionStorage tiene un flag 'hestia-guide-unlock-<apt>'.
  // Al montar abrimos la guía directamente y limpiamos el flag.
  const [guideOpen, setGuideOpen] = React.useState(() => {
    try {
      // Enlace de acceso por reserva: ?acceso=<token> abre la guía sin PIN y
      // guarda el token para prerrellenar el registro de viajeros.
      const acceso = new URLSearchParams(location.search).get('acceso');
      if (acceso) {
        sessionStorage.setItem('hestia-reg-token', acceso);
        return true;
      }
      const k = 'hestia-guide-unlock-' + apt.id;
      if (sessionStorage.getItem(k) === '1') {
        sessionStorage.removeItem(k);
        return true;
      }
    } catch (e) {}
    return false;
  });
  // Quita ?acceso de la URL (no dejar el token en el historial ni al compartir).
  React.useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('acceso')) { q.delete('acceso'); const s = q.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); }
    } catch (_) {}
  }, []);
  const [renderGuide, setRenderGuide] = React.useState(false);
  const [phase, setPhase] = React.useState('idle');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  // La barra sticky de reservar se OCULTA mientras el checker de disponibilidad
  // (#apt-avail) está a la vista: si no, sus dos CTAs ("Comprobar disponibilidad"
  // y "Reservar") compiten en móvil y, al pulsar el sticky, se pierde la selección
  // de fechas que se estaba haciendo. Cuando se hace scroll fuera del checker, la
  // barra reaparece.
  const [availInView, setAvailInView] = React.useState(false);
  const barVisible = scrolled && !availInView;

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = `${apt[lang].name} · Hestía Your Home · Vera Playa`;
  }, [lang]);

  React.useEffect(() => {
    const items = (window.REVIEWS && window.REVIEWS.items) || [];
    const aptReviews = items
      .filter(r => r.status === 'published' && (r.apt === apt.id || r.apt === 'all'))
      .sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0))
      .slice(0, 10);
    if (!aptReviews.length) return;
    const pageUrl = `https://www.hestiayourhome.com/${apt.slug}.html`;
    const schemaItems = aptReviews.map(r => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': (r.name && r.name !== '?') ? r.name : 'Verified Guest' },
      'datePublished': r.date,
      'reviewBody': r.text,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': r.source === 'booking' ? r.rating / 2 : r.rating,
        'bestRating': 5,
        'worstRating': 1,
      },
      'itemReviewed': { '@type': ['Accommodation', 'LodgingBusiness'], '@id': `${pageUrl}#accommodation` },
    }));
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'apt-review-schema';
    el.textContent = JSON.stringify(schemaItems);
    document.head.appendChild(el);
    return () => { const s = document.getElementById('apt-review-schema'); if (s) s.remove(); };
  }, [apt.id, apt.slug]);

  React.useEffect(() => {
    if (!apt.video_src) return;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      'name': `Visita virtual · ${apt.es.name}`,
      'description': `${apt.es.concept} ${apt.es.desc}`.slice(0, 300),
      'thumbnailUrl': `https://www.hestiayourhome.com/${apt.hero_img}`,
      'uploadDate': apt.video_upload || '2026-05-30',
      'duration': apt.video_duration || 'PT1M30S',
      'contentUrl': `https://www.hestiayourhome.com/${encodeURI(apt.video_src)}`,
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'apt-video-schema';
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
    return () => { const s = document.getElementById('apt-video-schema'); if (s) s.remove(); };
  }, [apt.id]);

  // Marca el body con dos clases:
  //  · has-apt-sticky → la página tiene barra sticky (siempre, en apt page)
  //  · apt-bar-shown  → la barra está VISIBLE (post-scroll). Cookies y
  //    FloatingChat usan esta para subir solo cuando la barra está fuera.
  React.useEffect(() => {
    document.body.classList.add('has-apt-sticky');
    return () => document.body.classList.remove('has-apt-sticky');
  }, []);
  // Setea --apt-accent y --apt-accent2 a nivel de :root para que los
  // widgets flotantes (fuera del <main>) puedan tomar el color del
  // Hestía actual. Default sol se mantiene en otras páginas.
  // Además se setea data-apt=<slug> en body para que selectores CSS
  // [data-apt="mar"|"thalassa"|"salinas"] casen aunque el widget
  // cuelgue del root. (apt.id es "vm/vt/vs", usamos slug para CSS
  // legible.)
  React.useEffect(() => {
    document.documentElement.style.setProperty('--apt-accent', apt.accent);
    document.documentElement.style.setProperty('--apt-accent2', apt.accent2);
    document.documentElement.style.setProperty('--apt-accent-dk', apt.accent_dk || apt.accent);
    document.body.setAttribute('data-apt', apt.slug);
    return () => {
      document.documentElement.style.removeProperty('--apt-accent');
      document.documentElement.style.removeProperty('--apt-accent2');
      document.documentElement.style.removeProperty('--apt-accent-dk');
      document.body.removeAttribute('data-apt');
    };
  }, [apt.accent, apt.accent2, apt.accent_dk, apt.slug]);
  React.useEffect(() => {
    document.body.classList.toggle('apt-bar-shown', !!barVisible);
    return () => document.body.classList.remove('apt-bar-shown');
  }, [barVisible]);

  // Crossfade entre vista apt ↔ guía: fade-out 220ms → swap → RAF → fade-in.
  // Aplica un blur sutil para mascarar el cambio (truco de Emil para crossfades).
  // Al abrir la guía, sube al top para que el hero de la guía sea visible.
  React.useEffect(() => {
    if (guideOpen === renderGuide) return;
    if (guideOpen) window.scrollTo({ top: 0, behavior: 'instant' });
    setPhase('out');
    const t = setTimeout(() => {
      setRenderGuide(guideOpen);
      setPhase('in');
      // Doble RAF para que el navegador aplique el estado 'in' antes de transicionar a 'idle'.
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('idle')));
    }, 220);
    return () => clearTimeout(t);
  }, [guideOpen, renderGuide]);

  // La guía vive DENTRO de la página: header y footer del portal se mantienen,
  // y solo el contenido de <main> se sustituye por la guía con su nav lateral.
  const showGuide = renderGuide && typeof AptGuideView !== 'undefined';

  // Observa si el checker de disponibilidad está en pantalla (para ocultar el sticky).
  React.useEffect(() => {
    if (showGuide || typeof IntersectionObserver === 'undefined') { setAvailInView(false); return; }
    const el = document.getElementById('apt-avail');
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setAvailInView(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showGuide]);

  // Marca body.guide-open mientras la guía está activa, los widgets
  // flotantes la respetan y se ocultan vía MutationObserver.
  React.useEffect(() => {
    document.body.classList.toggle('guide-open', !!showGuide);
    return () => document.body.classList.remove('guide-open');
  }, [showGuide]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main className="apt-main" data-phase={phase} data-apt={apt.id}>
        {showGuide ? (
          <AptGuideView apt={apt} lang={lang} onClose={() => _vt(() => setGuideOpen(false))} />
        ) : (
          <>
            {/* Redistribución (jul-2026): antes la galería de fotos real
                quedaba 7ª, tras confianza/reseñas/precio/calendario/vídeo;
                los huéspedes decían que las fotos "quedaban muy abajo".
                Nuevo orden, narrativa VER → CONFIAR → RESERVAR → DETALLE:
                hero → fotos → vídeo/descripción → confianza → reseñas →
                precio → calendario → equipamiento → plano → resto. Los CTA
                "Reservar"/"Ver disponibilidad" del hero son anclas (#apt-avail)
                o enlaces a reservas.html: funcionan igual estén donde estén
                estas secciones, así que la trazabilidad acceso→reserva no
                se resiente; solo cambia el orden de lectura en scroll. */}
            <AptPageHero apt={apt} lang={lang} scrolled={scrolled} mode={mode} />
            <AptPageGallery apt={apt} lang={lang} />
            <AptVideoDesc apt={apt} lang={lang} />
            <TrustStrip apt={apt} lang={lang} />
            <AptMiniReviews apt={apt} lang={lang} />
            <AptPriceTeaser apt={apt} lang={lang} />
            <AptCalendar aptId={aptId} lang={lang} accent={apt.accent} />
            <AptEquipamiento apt={apt} lang={lang} />
            <AptFloorPlan apt={apt} lang={lang} />
            <DirectBookingPerks lang={lang} />
            {typeof AptGuideGate !== 'undefined' &&
              <AptGuideGate apt={apt} lang={lang} onUnlock={() => _vt(() => setGuideOpen(true))} />}
            <AptPageOthers apt={apt} lang={lang} />
            <QuickFAQ lang={lang} pageId={aptId} />
            <ContactCTA lang={lang} />
          </>
        )}
      </main>
      <Footer lang={lang} />
      {!showGuide && <AptStickyBar apt={apt} lang={lang} scrolled={barVisible} />}
      {/* WidgetStack: 3 widgets flotantes independientes, cada uno con
          minimizado a pastilla corporativa. Se ocultan automáticamente
          cuando la guía está abierta (body.guide-open). */}
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ApartmentPageApp/>);
