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
const GALLERY_V = '16';

const APT_DATA = {
  vm: {
    id: 'vm', num: '01', slug: 'mar', license: 'VFT/AL/01580',
    name_short: 'Mar',
    video_src: 'assets/hestia v13 mar clean.mp4',
    video_duration: 'PT1M14S', video_upload: '2026-05-30T12:00:00+02:00',
    accent: '#6B7A3A', accent2: '#8B9A52', accent_dk: '#4A5628',
    hero_img: 'assets/apt-vm-gallery-26.jpg',
    bedroom_img: 'assets/apt-vm-gallery-26.jpg',
    reveal_img: 'assets/apt-vm-gallery-27.jpg',
    floorplan_img: 'assets/apt-vm-plano.jpg?v=2',
    floorplan_subtitle_es: 'distribución en planta.',
    floorplan_subtitle_en: 'floor layout.',
    floorplan_desc_es: 'Mar se distribuye en primera planta con terraza de esquina: salón-comedor abierto, cocina equipada, dos dormitorios y dos baños. La terraza en esquina recibe luz desde el amanecer hasta el atardecer.',
    floorplan_desc_en: 'Mar is on the first floor with a corner terrace: open living and dining room, equipped kitchen, two bedrooms and two bathrooms. The corner terrace catches light from sunrise to sunset.',
    others: ['vt', 'vs'],
    // Orden por estancia (recorrido de visita): salón/comedor + detalles,
    // cocina, dormitorio principal, dormitorio 2, baños, terraza, piscina.
    gallery_imgs: [
      'assets/apt-vm-gallery-1.jpg',
      'assets/apt-vm-gallery-2.jpg',
      'assets/apt-vm-gallery-3.jpg',
      'assets/apt-vm-gallery-21.jpg',
      'assets/apt-vm-gallery-22.jpg',
      'assets/apt-vm-gallery-5.jpg',
      'assets/apt-vm-gallery-23.jpg',
      'assets/apt-vm-gallery-24.jpg',
      'assets/apt-vm-gallery-6.jpg',
      'assets/apt-vm-gallery-7.jpg',
      'assets/apt-vm-gallery-8.jpg',
      'assets/apt-vm-gallery-26.jpg',
      'assets/apt-vm-gallery-10.jpg',
      'assets/apt-vm-gallery-25.jpg',
      'assets/apt-vm-gallery-9.jpg',
      'assets/apt-vm-gallery-11.jpg',
      'assets/apt-vm-gallery-15.jpg',
      'assets/apt-vm-gallery-29.jpg',
      'assets/apt-vm-gallery-16.jpg',
      'assets/apt-vm-gallery-17.jpg',
      'assets/apt-vm-gallery-30.jpg',
      'assets/apt-vm-gallery-13.jpg',
      'assets/apt-vm-gallery-14.jpg',
      'assets/apt-vm-gallery-28.jpg',
      'assets/apt-vm-gallery-4.jpg',
      'assets/apt-vm-gallery-27.jpg',
      'assets/apt-vm-gallery-18.jpg',
      'assets/apt-vm-gallery-19.jpg',
      'assets/apt-vm-gallery-20.jpg',
      'assets/apt-vm-gallery-31.jpg',
      'assets/apt-vm-gallery-32.jpg',
    ],
    es: {
      name: 'Hestía Mar',
      concept: 'El verde distinto de una tierra entre el mar y el desierto.',
      desc: 'Hestía Mar vive en un paisaje distinto, donde el verde agreste de Almería se encuentra con el Mediterráneo. Desde la terraza esquinera de 20m² orientada al amanecer, entre las palmeras de Vera Playa se ven vistas parciales al mar. Al ser esquinera, da a tres calles y permite ventilación cruzada natural en todas las estancias.',
      desc2: 'Mar ocupa la planta primera y se abre al jardín con acceso a la piscina comunitaria. Al ser esquinera, la luz entra desde el amanecer hasta el atardecer, ves el ciclo solar completo desde la terraza. Aire acondicionado centralizado en todas las estancias. Cocina completamente equipada, salón-comedor de 28m² y dos dormitorios con ropa de cama de calidad.',
      features: ['El más cercano a la playa, un pequeño y agradable paseo', '6 plazas + bebé · 2 habitaciones · planta primera', 'Terraza esquina 20m² · orientada al amanecer · ciclo solar completo · vistas parciales al mar', 'Piscina, jacuzzi (verano) y parque infantil comunitarios', 'Mascotas · petición previa · suplemento', '300 m de la playa · 5 min a pie desde la salida', 'Accesibilidad · adaptado para movilidad reducida', 'Aire acondicionado centralizado en todas las estancias', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 600 g/m² · nórdicos de plumas'],
      gallery_captions: ['Salón · sobremesas de madera, cocina a mano', 'Salón · sofá bajo un sol de espejo', 'Salón · a vista de pájaro, todo tuyo', 'Salón · lámpara y sofá, tarde en calma', 'Salón · el sofá entero para ti', 'Detalle · jarrón y textiles que abrigan', 'Detalle · el sol dorado del espejo', 'Detalle · suelo hidráulico de otra época', 'Cocina · mañanas que empiezan despacio', 'Cocina · copa en la encimera, sin prisa', 'Cocina · campana a punto, guisos lentos', 'Dormitorio principal · verde profundo, cojines granate', 'Dormitorio principal · armario espejo, luz doblada', 'Dormitorio principal · un globo de luz suave', 'Dormitorio 2 · sueños en turquesa', 'Dormitorio 2 · dos camas, mismo descanso', 'Baño 1 · un resplandor verde y sereno', 'Baño 1 · bañera y ducha, flores rojas de bienvenida', 'Baño 2 · ducha lista, toallas esperando', 'Baño 2 · lavabo y aromas suaves', 'Baño 2 · cabina de ducha y velas, agua caliente al momento', 'Terraza · veladas de verano que se alargan', 'Terraza · sofás para charlas de noche', 'Terraza · copa de vino y velas, la luna de testigo', 'Piscina comunitaria · el agua brilla de noche', 'Piscina comunitaria · el jacuzzi, luces encendidas al anochecer', 'Piscina · jardines alrededor, verano lento', 'Piscina comunitaria · azul de mediodía', 'Zona duchas · mosaico azul tras el baño', 'Dormitorio 2 · cabeceros azules, dos camas', 'Dormitorio principal · cojines de rayas verdes, flores naranjas'],
      gallery_notes: {
        0: 'Mantuvimos el suelo hidráulico original en vez de cubrirlo: no es nuevo, pero es de verdad, y la cocina abierta hace que cocinar no te saque de la sobremesa.',
        8: 'Elegimos electrodomésticos de los que usaríamos en casa, no los más baratos para una estancia: cafetera que no gotea, vitrocerámica que calienta rápido, nada que te haga perder la mañana.',
        11: 'El verde lo elegimos para que la habitación descanse la vista antes incluso de dormir; los colchones y las almohadas de distinta dureza, para que cada uno duerma a su manera.',
        14: 'El turquesa es el mismo que el mar al mediodía: lo pusimos aquí porque es la habitación de los más pequeños, y queríamos que se durmieran mirándolo.',
        16: 'Este es el baño con columna de hidroterapia y espejo de cromoterapia: lo pensamos para después de un día de playa, cuando lo que apetece es un poco de spa sin salir de casa.',
        18: 'El segundo baño es más sencillo a propósito: con cinco en casa, queríamos que alguien pudiera ducharse rápido sin esperar turno.',
        21: 'La terraza hace esquina a propósito: coge sol desde que amanece hasta que se pone, así que desayunas donde quieras y cenas donde refresque.',
      },
    },
    en: {
      name: 'Hestía Mar',
      concept: 'The distinct green of a land between the sea and the desert.',
      desc: 'Hestía Mar sits in a distinct landscape, where the wild green of Almería meets the Mediterranean. From the 20m² corner terrace facing the sunrise, you get partial sea views between the palm trees of Vera Playa. As a corner unit, Mar faces three streets and benefits from natural cross-ventilation throughout.',
      desc2: 'Mar is on the first floor and opens onto the garden with access to the shared pool. As a corner unit, light travels through from sunrise to sunset, you can follow the full arc of the sun from the terrace. Centralised air conditioning in every room. A fully equipped kitchen, 28m² living-dining room, and two bedrooms with quality bed linen.',
      features: ['Closest to the beach: a short, pleasant walk', '6 guests + baby · 2 bedrooms · first floor', 'Corner terrace 20m² · faces sunrise · full solar arc', 'Shared pool, jacuzzi (summer) and playground', 'Pets · on request · supplement', '300 m from the beach · 5 min walk from complex exit', 'Accessibility · adapted for reduced mobility', 'Centralised A/C in every room', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Living & dining · wood made for lingering', 'Living room · sofa under a mirrored sun', 'Living room · from above, all yours', 'Living room · lamp glow, evening ease', 'Living room · the whole sofa, yours', 'Detail · vase & textiles, gentle touches', "Detail · the mirror's golden sun", 'Detail · hydraulic tiles from another era', 'Kitchen · mornings that start slow', 'Kitchen · wine on the counter, unhurried', 'Kitchen · hood ready, slow cooking ahead', 'Master bedroom · deep green, burgundy cushions', 'Master bedroom · mirrored wardrobe doubling the light', 'Master bedroom · a globe of soft light', 'Bedroom 2 · dreams in teal', 'Bedroom 2 · two beds, one calm', 'Bathroom 1 · a serene green glow', 'Bathroom 1 · bathtub and shower, red flowers to welcome you', 'Bathroom 2 · shower ready, towels waiting', 'Bathroom 2 · vessel sink & soft scents', 'Bathroom 2 · shower cabin and candles, instant hot water', 'Terrace · summer evenings that stretch on', 'Terrace · sofas for late-night talks', 'Terrace · a glass of wine, candlelight, moon as witness', 'Community pool · water glowing at night', 'Community pool · the jacuzzi lit up at dusk', 'Pool · gardens around, summer slowed', 'Community pool · the blue of midday', 'Pool showers · blue mosaic after the swim', 'Bedroom 2 · blue headboards, twin beds', 'Master bedroom · striped green cushions, orange flowers'],
      gallery_notes: {
        0: "We kept the original hydraulic floor instead of covering it: it isn't new, but it's real, and the open kitchen means cooking never pulls you away from the table.",
        8: "We chose the same appliances we'd use at home, not the cheapest option for a rental: a coffee machine that doesn't drip everywhere, a hob that heats fast, nothing that wastes your morning.",
        11: "We chose the green so the room rests your eyes even before you sleep; mattresses and pillows of different firmness, so each of you sleeps your own way.",
        14: "The turquoise matches the sea at midday: we chose it for the kids' room, so they'd fall asleep looking at it.",
        16: "This is the bathroom with the hydrotherapy column and chromotherapy mirror: we thought of it for after a day at the beach, when what you want is a bit of spa without leaving the apartment.",
        18: "The second bathroom is simpler on purpose: with five people in the house, we wanted someone to be able to shower quickly without waiting their turn.",
        21: "The terrace is a corner unit on purpose: it catches light from sunrise to sunset, so you can have breakfast wherever the sun is and dinner wherever it's cooler.",
      },
    },
  },
  vt: {
    id: 'vt', num: '02', slug: 'thalassa', license: 'VFT/AL/05535',
    name_short: 'Thalassa',
    video_src: 'assets/hestia intro v9 thalassa outro.mp4',
    video_duration: 'PT1M6S', video_upload: '2026-05-30T12:00:00+02:00',
    accent: '#B86A3C', accent2: '#D08B5A', accent_dk: '#8A4A24',
    hero_img: 'assets/apt-vt-gallery-33.jpg',
    bedroom_img: 'assets/apt-vt-gallery-33.jpg',
    reveal_img: 'assets/apt-vt-gallery-20.jpg',
    floorplan_img: 'assets/apt-vt-plano.png',
    floorplan_subtitle_es: 'distribución del ático.',
    floorplan_subtitle_en: 'penthouse layout.',
    floorplan_desc_es: 'Thalassa ocupa la tercera planta (desde el garaje) en una sola crujía: salón con terraza panorámica, cocina abierta, dos dormitorios, dos baños y vistas al Mediterráneo y al Salar de los Canos.',
    floorplan_desc_en: 'Thalassa occupies the third floor (from the garage) in a single open plan: living room with panoramic terrace, open kitchen, two bedrooms, two bathrooms and views over the Mediterranean and the Salar de los Canos.',
    others: ['vm', 'vs'],
    // Orden por estancia (recorrido de visita): entrada, salón/comedor,
    // cocina, dormitorio principal, dormitorio 2, baños, terraza, piscinas.
    gallery_imgs: [
      'assets/apt-vt-gallery-08.jpg',
      'assets/apt-vt-gallery-20.jpg',
      'assets/apt-vt-gallery-34.jpg',
      'assets/apt-vt-gallery-10.jpg',
      'assets/apt-vt-gallery-42.jpg',
      'assets/apt-vt-gallery-05.jpg',
      'assets/apt-vt-gallery-06.jpg',
      'assets/apt-vt-gallery-19.jpg',
      'assets/apt-vt-gallery-33.jpg',
      'assets/apt-vt-gallery-24.jpg',
      'assets/apt-vt-gallery-23.jpg',
      'assets/apt-vt-gallery-35.jpg',
      'assets/apt-vt-gallery-43.jpg',
      'assets/apt-vt-gallery-03.jpg',
      'assets/apt-vt-gallery-21.jpg',
      'assets/apt-vt-gallery-04.jpg',
      'assets/apt-vt-gallery-12.jpg',
      'assets/apt-vt-gallery-32.jpg',
      'assets/apt-vt-gallery-07.jpg',
      'assets/apt-vt-gallery-14.jpg',
      'assets/apt-vt-gallery-16.jpg',
      'assets/apt-vt-gallery-17.jpg',
      'assets/apt-vt-gallery-11.jpg',
      'assets/apt-vt-gallery-01.jpg',
      'assets/apt-vt-gallery-09.jpg',
      'assets/apt-vt-gallery-31.jpg',
      'assets/apt-vt-gallery-37.jpg',
      'assets/apt-vt-gallery-30.jpg',
      'assets/apt-vt-gallery-18.jpg',
      'assets/apt-vt-gallery-25.jpg',
      'assets/apt-vt-gallery-26.jpg',
      'assets/apt-vt-gallery-40.jpg',
      'assets/apt-vt-gallery-27.jpg',
      'assets/apt-vt-gallery-39.jpg',
      'assets/apt-vt-gallery-28.jpg',
      'assets/apt-vt-gallery-36.jpg',
      'assets/apt-vt-gallery-38.jpg',
      'assets/apt-vt-gallery-41.jpg',
      'assets/apt-vt-gallery-29.jpg', 'assets/apt-vt-gallery-44.jpg', 'assets/apt-vt-gallery-45.jpg'],
    es: {
      name: 'Hestía Thalassa',
      concept: 'El ático sobre el Mediterráneo y el Salar de los Canos.',
      desc: 'Hestía Thalassa es el ático, el más elevado de los tres. Desde su terraza panorámica se ve el Mediterráneo y, hacia el interior, el Salar de los Canos, un paisaje árido y de gran belleza que cambia con la luz del día. El punto más abierto y luminoso de toda la urbanización.',
      desc2: 'El ático tiene una planta abierta y una terraza con vistas panorámicas al mar. La urbanización, Al Andalus Thalassa, tiene dos piscinas exteriores (norte y sur), jardines, parques y pistas de pádel y tenis, y un SPA comunitario con piscina climatizada, jacuzzi, sauna, pediluvio, gimnasio y zona de relax, abierto en otoño, invierno y primavera.',
      features: ['El más alto · ves toda la playa, con la sensación de dominar la vista', '6 plazas + bebé · 2 habitaciones', 'Ático · tercera planta desde el garaje', 'Terraza panorámica · vistas panorámicas al mar y al Salar de los Canos', '2 piscinas exteriores comunitarias · norte y sur', 'SPA comunitario · piscina climatizada, jacuzzi, sauna y gimnasio (otoño-primavera)', '1,5 km de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 600 g/m² · nórdicos de plumas'],
      gallery_captions: ['Entrada · mueble artesano, espejo que recibe', 'Salón · luz cálida, terraza a un paso', 'Salón · el atardecer entra por la ventana', 'Salón · rincón de sofá, luz de tarde', 'Salón · sofá, estufa y el horizonte de fondo', 'Salón · la ventana abierta al horizonte', 'Comedor · mesa que crece, luz que acompaña', 'Cocina · nevera y campana en acero, tulipanes en la encimera', 'Dormitorio principal · manta suave y horizonte', 'Dormitorio principal · pared turquesa, cojines de damasco', 'Baño · lavabo en negro, espejo de luna', 'Baño · el mismo rincón, más cerca', 'Baño · el mismo lavabo negro, de cerca', 'Dormitorio principal · cojines en índigo, de cerca', 'Dormitorio principal · el mar, visto desde la cama', 'Dormitorio 2 · mantas de lana, dos camas', 'Dormitorio 2 · la ventana al mar, mantas turquesa', 'Dormitorio 2 · ropa de cama blanca, cojines de color', 'Baño 1 · azul de mosaico bajo los pies', 'Baño 2 · ducha de obra, amarillo que despierta', 'Baño 2 · negro mate y una flor serena', 'Terraza · noches cálidas que apetece alargar', 'Terraza · el horizonte entero al atardecer', 'Terraza · primera luz del amanecer sobre la urbanización', 'Terraza · el Mediterráneo se tiñe de oro', 'Terraza · bajo el toldo, sin prisa', 'Piscina exterior comunitaria · jardines y sierra al fondo', 'Piscina exterior comunitaria · el puente de madera', 'Piscina · desde arriba, el Mediterráneo espera', 'Piscina climatizada · luz de palmeras tras el cristal', 'Piscina climatizada · el punto de encuentro, todo el año', 'Piscina climatizada · el cielo se enciende al anochecer', 'Jacuzzi y piscina climatizada', 'Jacuzzi cubierto · un momento para ti al atardecer', 'Gimnasio comunitario', 'Gimnasio comunitario · máquinas y pesas libres', 'Pista de tenis comunitaria', 'Zona infantil · columpios y tobogán para los peques', 'Sauna y baño de vapor', 'Dormitorio 2 · mantas moradas y el mar en la ventana', 'Baño 1 · bañera con columna de hidromasaje y mosaico azul'],
      gallery_notes: {
        1: 'Al ser el ático, quisimos que el salón mirara hacia la vista y no al revés: por eso el sofá está orientado a la terraza, no a la tele.',
        7: 'La campana de acero y los tonos ocres los elegimos para que la cocina no compitiera con las vistas del salón: aquí el protagonista sigue siendo el horizonte.',
        8: 'La pared turquesa la pusimos mirando hacia donde sale el sol: el mar está tan cerca en Thalassa que quisimos que entrara también en el color de la habitación.',
        10: 'El lavabo en negro lo elegimos porque Thalassa es el ático: queríamos un punto más serio, casi de hotel, que hiciera juego con la altura del piso.',
        16: 'Pusimos la segunda cama orientada a la ventana a propósito: en el ático, hasta el dormitorio de los niños tiene mar.',
        22: 'Hicimos Thalassa el ático porque queríamos la terraza más alta de los tres: desde aquí se ve el Mediterráneo de un lado y el Salar de los Canos del otro, el único sitio así en toda la urbanización.',
      },
    },
    en: {
      name: 'Hestía Thalassa',
      concept: 'The penthouse above the Mediterranean and the Salar de los Canos.',
      desc: 'Hestía Thalassa is the penthouse, the highest of the three. From its panoramic terrace you look out over the Mediterranean and, inland, the Salar de los Canos: an arid, dramatically beautiful landscape that shifts with the light throughout the day.',
      desc2: 'The penthouse is laid out as a single open floor with a terrace and panoramic sea views. The complex, Al Andalus Thalassa, has two outdoor pools (north and south), gardens, parks and padel and tennis courts, plus a shared spa with heated pool, jacuzzi, sauna, footbath, gym and relaxation area, open in autumn, winter and spring.',
      features: ['The highest · see the whole beach, commanding the view', '6 guests + baby · 2 bedrooms', 'Penthouse · third floor from the garage', 'Panoramic terrace · panoramic sea & Salar de los Canos views', '2 outdoor shared pools · north and south', 'Shared spa · heated pool, jacuzzi, sauna and gym (autumn–spring)', '1.5 km from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Entrance · artisan cabinet, a mirror\'s welcome', 'Living room · warm light, terrace steps away', 'Living room · sunset pouring through the window', 'Living room · sofa corner, evening light', 'Living room · sofa, stove, and the horizon behind', 'Living room · a window open to the horizon', 'Dining area · the table grows, light follows', 'Kitchen · steel fridge and hood, tulips on the counter', 'Master bedroom · soft throw and horizon', 'Master bedroom · turquoise wall, damask cushions', 'Bathroom · black vanity, moon-round mirror', 'Bathroom · the same corner, a closer look', 'Bathroom · the same black vanity, up close', 'Master bedroom · indigo cushions, up close', 'Master bedroom · the sea, glimpsed from bed', 'Bedroom 2 · wool throws, twin beds', 'Bedroom 2 · a window to the sea, turquoise throws', 'Bedroom 2 · crisp white linen, a wall of colour', 'Bathroom 1 · mosaic blue underfoot', 'Bathroom 2 · walk-in shower, yellow that wakes', 'Bathroom 2 · matte black, one quiet flower', 'Terrace · warm nights worth stretching', 'Terrace · the whole horizon, golden hour', 'Terrace · first light of dawn over the complex', 'Terrace · the Mediterranean turns to gold', 'Terrace · under the awning, unhurried', 'Outdoor community pool · gardens and hills beyond', 'Outdoor community pool · the wooden bridge', 'Pool · from above, the Mediterranean beyond', 'Heated pool · palm-tree light through the glass', 'Heated pool · the year-round gathering spot', 'Heated pool · the sky catches fire at dusk', 'Jacuzzi and heated pool', 'Covered jacuzzi · a moment to yourself at sunset', 'Community gym', 'Community gym · machines and free weights', 'Community tennis court', 'Playground · swings and slide for the kids', 'Sauna and steam room', 'Bedroom 2 · purple throws and the sea in the window', 'Bathroom 1 · bathtub with hydro-massage column and blue mosaic'],
      gallery_notes: {
        1: "Being the penthouse, we wanted the living room to face the view, not the other way round: that's why the sofa looks toward the terrace, not the TV.",
        7: "We chose the steel hood and ochre tones so the kitchen wouldn't compete with the living room's views: the horizon is still the main character here.",
        8: "We put the turquoise wall facing the sunrise: the sea is so close in Thalassa that we wanted it to show up in the room's colour too.",
        10: 'We chose the black vanity because Thalassa is the penthouse: we wanted something a bit more serious, almost hotel-like, to match how high up it sits.',
        16: "We angled the second bed toward the window on purpose: in the penthouse, even the kids' room gets the sea.",
        22: "We made Thalassa the penthouse because we wanted the highest terrace of the three: from here you see the Mediterranean on one side and the Salar de los Canos on the other, the only spot like it in the whole complex.",
      },
    },
  },
  vs: {
    id: 'vs', num: '03', slug: 'salinas', license: 'VFT/AL/07056',
    name_short: 'Salinas',
    video_src: 'assets/hestia v14 salinas clean.mp4',
    video_duration: 'PT1M21S', video_upload: '2026-05-30T12:00:00+02:00',
    accent: '#D4A84A', accent2: '#E8C476', accent_dk: '#7A5E1A',
    hero_img: 'assets/apt-vs-gallery-33.jpg',
    bedroom_img: 'assets/apt-vs-gallery-33.jpg',
    reveal_img: 'assets/apt-vs-gallery-32.jpg',
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
      'assets/apt-vs-gallery-33.jpg',   // dormitorio 1 · mural de olas (foto de referencia)
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
      concept: 'El amarillo albero del amanecer, cerca de las salinas.',
      desc: 'Hestía Salinas vive en el color albero del amanecer almeriense. Dos terrazas, grandes jardines con riachuelos y la reserva de aves de las Salinas de Puerto Rey a un paseo corto.',
      desc2: 'A 900 metros del mar y a un paseo corto de la reserva de aves de las Salinas de Puerto Rey, dentro de la urbanización Pueblo Salinas. La luz dorada de la tarde llena cada habitación, el privilegio de tener la naturaleza tan cerca.',
      features: ['El más grande de los tres · base para conocer toda la zona', '6 plazas + bebé · 2 habitaciones', 'Dos terrazas', 'Piscina comunitaria · pistas de pádel y tenis', 'Grandes jardines con riachuelos', 'Reserva de aves Salinas de Puerto Rey · a un paseo corto', '900 m de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 600 g/m² · nórdicos de plumas'],
      gallery_captions: ['Entrada · espejo y amarillo de bienvenida', 'Salón-comedor · luz de día sobre albero', 'Salón · sofá mostaza, tarde de película', 'Salón · sofá y turquesa para conversar', 'Sofá · con un cuadro de compañía', 'Salón · el conjunto desde arriba', 'Salón nocturno · sesión de cine en casa', 'Comedor · la lámpara teal reúne la mesa', 'Cocina · bajo la campana, encimera lista', 'Cocina · encimera de madera · tacto cálido', 'Cocina · blanca, con todo pensado', 'Cocina · de frente, lista para ti', 'Dormitorio principal · el mural de olas, nada más entrar', 'Dormitorio principal · olas para arroparte', 'Dormitorio principal · de la cama a la terraza', 'Dormitorio 2 · dos camas · espejos gemelos', 'Dormitorio 2 · mantas gruesas, espejos redondos', 'Baño 1 · azul fresco junto al lavabo', 'Baño 1 · mosaico bajo la ducha', 'Baño principal · bañera y bidé, tiempo para ti', 'Terraza principal · sofás de cara a las vistas', 'Terraza pérgola · desayunos sin reloj', 'Terraza · desayuno Hestía, primer regalo del día', 'Terraza principal · cena para dos, luz de velas', 'Terraza principal · noche · la urbanización se enciende', 'Terraza principal · nubes encendidas al atardecer', 'Segunda terraza · velada para dos', 'Terraza · un rincón entre lucecitas', 'Piscina comunitaria · palmeras arriba, casa al lado', 'Piscina comunitaria · rosa de atardecer en el agua'],
      gallery_notes: {
        1: 'El salón-comedor lo hicimos grande a propósito: Salinas es el más amplio de los tres, pensado para familias que necesitan sitio de sobra, no solo una habitación más.',
        8: 'La encimera de madera la elegimos porque es la cocina que más se usa de las tres: con más gente en casa, hace falta un sitio donde cocinar de verdad, no solo calentar algo.',
        12: 'El mural de olas lo pintamos nosotros mismos, pensando en que lo primero que vieras al entrar fuera el mar, aunque la cama esté a un paseo de la playa.',
        15: 'Pusimos dos camas y dos espejos iguales a propósito: es el dormitorio pensado para hermanos o amigos, que cada uno tenga su propio rincón simétrico.',
        17: 'El azul del baño 1 lo elegimos para que refrescara incluso en pleno agosto: con más huéspedes en casa, queríamos que este baño se sintiera siempre fresco.',
        19: 'La bañera, con su bidé al lado: Salinas es la casa pensada para quedarse más tiempo, y un baño de verdad se agradece en una estancia larga.',
        20: 'Las dos terrazas de Salinas las orientamos para separar momentos: una para el café de la mañana sin prisa, otra para la cena con velas al anochecer.',
      },
    },
    en: {
      name: 'Hestía Salinas',
      concept: 'Ochre yellow, sunrise near the salt flats.',
      desc: 'Hestía Salinas lives in the ochre colour of the Almería sunrise. Two terraces, large gardens with streams and the Puerto Rey salt-flat nature park a short walk away.',
      desc2: '900 metres from the sea and a short walk from the Puerto Rey salt-flat bird reserve. Golden afternoon light fills every room, the privilege of having nature so close by.',
      features: ['The largest of the three · a base to explore the whole area', '6 guests + baby · 2 bedrooms', 'Two terraces', 'Shared pool · padel and tennis courts', 'Large gardens with streams', 'Puerto Rey salt-flat bird reserve · a short walk away', '900 m from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Entrance · mirror & a yellow welcome', 'Living & dining · daylight on ochre walls', 'Living room · mustard sofa, movie afternoons', 'Living room · sofa & teal for conversation', 'Sofa · with a painting for company', 'Living room · the whole scene from above', 'Evening living room · home-cinema mood', 'Dining area · teal light gathers the table', 'Kitchen · under the hood, counter ready', 'Kitchen · wooden counter · warm touch', 'Kitchen · all white, nothing missing', 'Kitchen · full view, ready for you', 'Master bedroom · the wave mural, right as you walk in', 'Master bedroom · waves to tuck you in', 'Master bedroom · from bed to terrace', 'Bedroom 2 · twin beds · twin mirrors', 'Bedroom 2 · winter throws, round mirrors', 'Bathroom 1 · cool blue by the sink', 'Bathroom 1 · mosaic under the shower', 'Main bathroom · bathtub & bidet, time for you', 'Main terrace · loungers facing the view', 'Pergola terrace · breakfasts without a clock', "Terrace · Hestía breakfast, the day's first treat", 'Main terrace · dinner for two, candlelight', 'Main terrace · night · the complex lights up', 'Main terrace · clouds catching the sunset', 'Second terrace · an evening for two', 'Terrace · a corner wrapped in fairy lights', 'Community pool · palms above, home steps away', 'Community pool · pink dusk on the water'],
      gallery_notes: {
        1: 'We made the living-dining room large on purpose: Salinas is the biggest of the three, built for families who need plenty of room, not just one more bedroom.',
        8: 'We chose the wooden counter because this is the kitchen that gets used the most of the three: with more people in the house, you need a place to actually cook, not just heat something up.',
        12: 'We painted the wave mural ourselves, so the sea is the first thing you see when you walk in, even though the bed is a walk away from the beach.',
        15: 'We set up two beds and two matching mirrors on purpose: this room is built for siblings or friends, so each one gets their own matching corner.',
        17: "We chose the blue in bathroom 1 so it would feel cool even in the middle of August: with more guests in the house, we wanted this bathroom to always feel fresh.",
        19: 'The bathtub, with the bidet beside it: Salinas is the apartment built for longer stays, and a proper bath is something you appreciate when you are staying a while.',
        20: 'We oriented Salinas\'s two terraces to separate moments: one for an unhurried morning coffee, the other for candlelit dinners at dusk.',
      },
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
      core: 'La casa funciona con A/C por conductos, fibra y Smart TV con streaming: SkyShowtime, HBO Max, Prime Video y Disney+ siempre activas, además de apps gratuitas. La cocina está completa (lavavajillas y lavadora). Dos baños: uno con columna de hidroterapia y espejo de cromoterapia, otro con ducha.',
      behind: 'Antes de que llegues: sábanas de 200 hilos planchadas, toallas de 600 g/m², kit de bienvenida, sombrilla preparada, cuna y trona montadas si las pediste. El A/C ajustado a la estación y el botiquín revisado.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Mar',
      morning: 'You wake up to the sea 300 m away and the light pouring in from the corner terrace, where you start the day with a good breakfast. Then the pool and jacuzzi in the garden, no need to take the car.',
      core: 'The flat runs on ducted A/C, fibre Wi-Fi and a Smart TV with streaming: SkyShowtime, HBO Max, Prime Video and Disney+ are always active, plus free apps. Full kitchen (dishwasher and washer). Two bathrooms: one with a hydrotherapy column and chromotherapy mirror, the other with a shower.',
      behind: 'Before you arrive: 200-thread sheets ironed, 600 g/m² towels, a welcome kit, beach umbrella ready, cot and high chair set up if you booked them. A/C tuned to the season, first-aid kit checked.',
    },
    es: {
      terrace: 'Terraza 20m² esquina',
      icons: [
        ['🌊', 'Playa a 300m'], ['☀️', 'Terraza 20m² · esquina'], ['🏊', 'Piscina + Jacuzzi'],
        ['🌿', 'Jardines'], ['👶', 'Parque infantil'], ['🛋', 'Chill out'], ['🛗', 'Ascensor'],
        ['📺', 'Smart TV 55"'], ['🎬', 'Streaming: SkyShowtime · HBO Max · Prime Video · Disney+'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C por conductos'], ['🍳', 'Cocina completa'], ['🍽', 'Lavavajillas'],
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
        ['🌿', 'Gardens'], ['👶', 'Playground'], ['🛋', 'Chill-out'], ['🛗', 'Lift'],
        ['📺', '55" Smart TV'], ['🎬', 'Streaming: SkyShowtime · HBO Max · Prime Video · Disney+'], ['📶', 'Fibre WIFI'],
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
      core: 'Zonas comunes: SPA comunitario con piscina climatizada, jacuzzi, sauna, pediluvio, gimnasio y zona de relax (SPA en otoño-invierno-primavera; gimnasio todo el año), dos piscinas exteriores, jardines, parques y pistas de pádel y tenis. En el ático: Smart TV con streaming (SkyShowtime, HBO Max, Prime Video, Movistar Plus y Disney+ siempre activas, además de apps gratuitas), dos baños en suite con bañera y columnas de hidromasaje, y cocina alto standing.',
      behind: 'Cada llegada: sábanas de 200 hilos planchadas, toallas de 600 g/m², nórdicos de plumas, kit de bienvenida. Las zonas comunes (SPA, piscinas, gimnasio) las mantiene la urbanización; el ático lo dejamos listo nosotros: A/C calibrado, cafetera cargada y aromas preparados.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Thalassa',
      morning: 'The Mediterranean framed by the 18 m² penthouse terrace. Nespresso machine, breakfast with a view. Enjoy the outdoor or indoor pools depending on the time of year.',
      core: 'Shared areas: a shared spa with heated pool, jacuzzi, sauna, footbath, gym and relaxation area (spa open autumn–winter–spring; gym year-round), two outdoor pools, gardens, parks and padel and tennis courts. In the penthouse: Smart TV with streaming (SkyShowtime, HBO Max, Prime Video, Movistar Plus and Disney+ always active, plus free apps), two en-suite bathrooms with bathtub and hydro-massage columns, and a high-end kitchen.',
      behind: 'Every arrival: 200-thread sheets ironed, 600 g/m² towels, down duvets, a welcome kit. The complex maintains the shared areas (spa, pools, gym); we leave the penthouse fully prepped: A/C tuned, coffee machine loaded, aromas in place.',
    },
    es: {
      terrace: '2 terrazas · delantera 18m² + trasera',
      icons: [
        ['🌊', 'Mar · Laguna · Pueblo'], ['☀️', 'Terraza delantera 18m² · vistas al mar'], ['🌅', 'Terraza trasera'], ['🏊', '2 piscinas exteriores · norte y sur'],
        ['🌡', 'Piscina climatizada'], ['♨️', 'Jacuzzi'], ['💪', 'Gimnasio'],
        ['🧖', 'Sauna · pediluvio · zona de relax'], ['🎾', 'Pistas de pádel y tenis'], ['🌿', 'Jardines · parques'],
        ['📺', 'Smart TV 55"'], ['🎬', 'Streaming: SkyShowtime · HBO Max · Prime Video · Movistar Plus · Disney+'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C salón y dormitorios'], ['🍳', 'Cocina completa'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Dos baños en suite · bañera'], ['🚿', 'Columnas de hidromasaje'],
        ['🚗', 'Garaje interior'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado · juego extra para el sofá-cama'], ['🧴', 'Toallas 600g/m²'],
        ['🌺', 'Nórdicos de plumas'], ['🪔', 'Hidroterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '2 terraces · front 18m² + rear',
      icons: [
        ['🌊', 'Sea · Lagoon · Village'], ['☀️', 'Front terrace 18m² · sea views'], ['🌅', 'Rear terrace'], ['🏊', '2 outdoor pools · north & south'],
        ['🌡', 'Heated pool (autumn–spring)'], ['♨️', 'Jacuzzi'], ['💪', 'Gym'],
        ['🧖', 'Sauna · footbath · relaxation area'], ['🎾', 'Padel and tennis courts'], ['🌿', 'Gardens · parks'],
        ['📺', '55" Smart TV'], ['🎬', 'Streaming: SkyShowtime · HBO Max · Prime Video · Movistar Plus · Disney+'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C lounge & bedrooms'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Two en-suite bathrooms · bathtub'], ['🚿', 'Hydro-massage columns'],
        ['🚗', 'Indoor garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'],
        ['🛏', '200-thread combed cotton sheets · extra set for the sofa-bed'], ['🧴', 'Bath towels 600g/m²'],
        ['🌺', 'Down duvets'], ['🪔', 'Hydrotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
  vs: {
    area: 87, guests: 6, bedrooms: 2, bathrooms: 2,
    daily_es: {
      eyebrow: 'Tu día en Hestía Salinas',
      morning: 'La luz dorada del amanecer entra por la terraza grande de 18 m², con la reserva de aves de las Salinas de Puerto Rey a un paseo corto. Café y desayuno al sol; luego paseas hasta la playa o por el jardín de la urbanización.',
      core: 'Dos terrazas: la de 18 m² para sol y luna, la de 14 m² para el atardecer. Piscina, pistas de pádel y tenis y grandes jardines con riachuelos en la urbanización. Smart TV 55" con Ambilight y streaming (SkyShowtime, HBO Max, Prime Video y Disney+ siempre activas, además de apps gratuitas), cocina completa y A/C frío-calor.',
      behind: 'Antes de tu llegada: sábanas de 200 hilos planchadas, toallas de 600 g/m², nórdicos de plumas más alternativa antialérgica en el dormitorio principal, cuna y trona si las pediste. La cafetera Nespresso cargada y los aromas elegidos según la estación.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Salinas',
      morning: 'Golden morning light pours in through the 18 m² main terrace, with the Puerto Rey salt flats, the Puerto Rey bird reserve, a short walk away. Coffee and breakfast in the sun; then a walk to the beach or through the complex gardens.',
      core: 'Two terraces: the 18 m² for sun and moon, the 14 m² for sunset. Pool, padel and tennis courts and large gardens with streams in the complex. 55" Ambilight Smart TV with streaming (SkyShowtime, HBO Max, Prime Video and Disney+ always active, plus free apps), full kitchen and heat-cool A/C.',
      behind: 'Before you arrive: 200-thread sheets ironed, 600 g/m² towels, down duvets plus a hypoallergenic alternative in the master bedroom, cot and high chair if you booked them. Nespresso machine loaded and aromas chosen by season.',
    },
    es: {
      terrace: '2 terrazas 18m² + 14m²',
      icons: [
        ['🌊', 'Playa a 5 min en coche'], ['☀️', 'Terraza 18m² · sol y luna'], ['🌅', 'Terraza 14m² · atardecer'],
        ['🏊', 'Piscina'], ['🌿', 'Grandes jardines · riachuelos'],
        ['🎾', 'Pistas de pádel y tenis'], ['🛋', 'Chill out'], ['🏞', 'Salinas de Puerto Rey'],
        ['📺', 'Smart TV 55" · Ambilight'], ['🎬', 'Streaming: SkyShowtime · HBO Max · Prime Video · Disney+'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C frío y calor'], ['🍳', 'Cocina completa'], ['🍽', 'Lavavajillas'],
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
        ['🏊', 'Pool'], ['🌿', 'Large gardens · streams'],
        ['🎾', 'Padel and tennis courts'], ['🛋', 'Chill-out'], ['🏞', 'Puerto Rey Salt Flats'],
        ['📺', '55" Smart TV · Ambilight'], ['🎬', 'Streaming: SkyShowtime · HBO Max · Prime Video · Disney+'], ['📶', 'Fibre WIFI'],
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

  const TECH_KW    = ['TV', 'WiFi', 'WIFI', 'fibra', 'Streaming', 'streaming', 'Alexa', 'Smart', 'fibre', 'Fibre'];
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

// --- Hero de la página de Hestía ---
// Foto de cabecera: índice en gallery_imgs del dormitorio principal, la imagen
// que identifica a cada Hestía. El resto de fotos vive en el carrusel de abajo.
const APT_COVER = { vm: 11, vt: 8, vs: 12 };
const _webp = (src) => src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
const _toGallery = () => {
  const el = document.getElementById('apt-galeria');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Cabecera de la ficha: todas las fotos deslizables, empezando por el
// dormitorio principal (la que identifica al Hestía) y siguiendo por estancias;
// "Ver por estancias" baja a la galería con filtros. Debajo, el resumen.
const AptPageHero = ({ apt, lang }) => {
  const d = apt[lang];
  const tbl = HESTIA_PRICES[apt.id];
  // "Desde" = base de prices.json en temporada baja, el número que el admin ve
  // en /p-edit.html, sin el directDiscount (ese vive en el desglose de reserva).
  const minPrice = tbl ? Math.min(...tbl.base.slice(1)) : null;
  const imgs = apt.gallery_imgs || [];
  const caps = d.gallery_captions || [];
  const order = React.useMemo(() => {
    const esCaps = (apt.es && apt.es.gallery_captions) || caps;
    const zone = i => GALLERY_ZONES.findIndex(z => z.test((esCaps[i] || '').split(' · ')[0]));
    const coverIdx = APT_COVER[apt.id] ?? 0;
    const rest = imgs.map((_, i) => i).filter(i => i !== coverIdx).sort((x, y) => zone(x) - zone(y) || x - y);
    return imgs[coverIdx] ? [coverIdx, ...rest] : rest;
  }, [apt.id]);
  const trackRef = React.useRef(null);
  const [pos, setPos] = React.useState(0);
  const onTrack = () => { const el = trackRef.current; if (el) setPos(Math.round(el.scrollLeft / el.clientWidth)); };
  const go = (dlt) => {
    const el = trackRef.current; if (!el) return;
    const n = (pos + dlt + order.length) % order.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: Math.abs(n - pos) > 1 ? 'auto' : 'smooth' });
  };
  const all = (window.REVIEWS && window.REVIEWS.items) || [];
  const own = all.filter(r => r.status === 'published' && (r.apt === apt.id || r.apt === 'all'));
  const avg = ratingScore(own, 'global');
  return (
    <section className="ah on-dark" data-apt={apt.id} style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      {order.length > 0 && (
        <div className="ah-gallery">
          <div className="ah-cover">
            <div className="ah-track" ref={trackRef} onScroll={onTrack}>
              {order.map((gi, k) => (
                <figure key={gi} className="ah-slide">
                  <picture>
                    <source srcSet={_webp(imgs[gi])} type="image/webp"/>
                    <img src={imgs[gi]} alt={caps[gi] || d.name} decoding="async"
                         loading={k < 2 ? 'eager' : 'lazy'} fetchpriority={k === 0 ? 'high' : undefined}
                         style={{ objectPosition: (window.PHOTO_POS || {})[imgs[gi].split('/').pop()] || '50% 50%' }}/>
                  </picture>
                </figure>
              ))}
            </div>
            <button type="button" className="ah-nav ah-prev" onClick={() => go(-1)} aria-label={lang === 'es' ? 'Foto anterior' : 'Previous photo'}>‹</button>
            <button type="button" className="ah-nav ah-next" onClick={() => go(1)} aria-label={lang === 'es' ? 'Foto siguiente' : 'Next photo'}>›</button>
            <img className="ah-logo" src={`assets/logo-${APT_WM[apt.id] || 'blanco'}-160.png`} alt="" width="34" height="34" decoding="async"/>
            <IndaloShape className="ah-indalo" width="30" height="30" />
            <span className="ah-count" aria-live="polite">{pos + 1} / {order.length}</span>
            {caps[order[pos]] && <span className="ah-cap">{caps[order[pos]]}</span>}
            <button type="button" className="ah-all" onClick={_toGallery}>
              <HiIcon name="camera" size={16} /> {lang === 'es' ? 'Ver por estancias' : 'View by room'}
            </button>
          </div>
        </div>
      )}
      <div className="ah-summary">
        <div className="ah-id">
          <div className="ah-eyebrow"><span>{apt.num}</span><span className="sep">·</span><span>{apt.license}</span></div>
          <h1 className="ah-name">
            <span className="ah-name-small"><span className="apt-dot" data-apt={apt.id} aria-hidden="true"/>Hestía</span>
            {apt.name_short}
          </h1>
          <p className="ah-concept">{d.concept}</p>
          {avg != null && (
            <a className="ah-rating" href="#apt-reviews">
              <HiIcon name="star-fill" size="1em" /> <strong>{fmtRating(avg)}</strong>/10
              <span className="ah-rating-n">· {own.length} {lang === 'es' ? 'reseñas verificadas' : 'verified reviews'}</span>
            </a>
          )}
        </div>
        <div className="ah-book">
          {minPrice && (
            <p className="ah-price">
              <span className="ah-price-from">{lang === 'es' ? 'desde' : 'from'}</span>
              <span className="ah-price-n">{minPrice}€</span>
              <span className="ah-price-per">{lang === 'es' ? '/noche · precio directo' : '/night · direct price'}</span>
            </p>
          )}
          <p className="ah-match">
            {lang === 'es'
              ? 'Si lo ves más barato, no solo te lo igualamos: te lo mejoramos.'
              : 'Find it cheaper and we don\'t just match it: we beat it.'}
          </p>
          <div className="ah-ctas">
            <a href={`reservas.html?apt=${apt.id}`} className="btn btn-primary apt-page-reserve-btn">
              {lang === 'es' ? 'Reservar' : 'Book now'} <span className="arrow">→</span>
            </a>
            <a href="#apt-avail" className="btn btn-ghost-light">
              {lang === 'es' ? 'Ver disponibilidad' : 'Check availability'}
            </a>
          </div>
          <p className="ah-cancel">
            <HiIcon name="check" size="1em" /> {lang === 'es' ? 'Cancelación gratuita hasta 30 días antes' : 'Free cancellation up to 30 days before'}
          </p>
        </div>
      </div>
    </section>
  );
};

// --- Reveal cinematográfico ---
// Pausa a pantalla completa entre el hero (nombre/precio/CTA) y la galería:
// una foto real atmosférica de la propia Hestía, teñida con su color, con
// la cita de la marca en grande. No es información nueva (la cita ya vive
// en el hero de arriba) — es un momento de marca, no un dato más.
const AptCinematicReveal = ({ apt, lang }) => {
  const d = apt[lang];
  if (!apt.reveal_img) return null;
  return (
    <section className="apt-reveal" style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <picture>
        <source srcSet={apt.reveal_img.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
        <img src={apt.reveal_img} alt="" className="apt-reveal-img" loading="lazy" decoding="async"/>
      </picture>
      <div className="apt-reveal-tint"/>
      <div className="apt-reveal-content">
        <p className="apt-reveal-quote">« {d.concept} »</p>
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
  // ratingScore/fmtRating: fuente única (shared.jsx). 'global' porque esta
  // cifra se presenta como LA nota de este Hestía en su propia página.
  const avg = ratingScore(own, 'global');
  const countries = new Set(own.map(r => r.country).filter(Boolean));
  // Mar abrió en 2016, Thalassa en 2018 y Salinas en 2020 (10, 8 y 6 años en 2026).
  const since = { vm: 2016, vt: 2018, vs: 2020 }[apt.id] || 2016;
  const years = new Date().getFullYear() - since;

  const stats = [
    { v: `${years} ${lang === 'es' ? 'años' : 'years'}`,
      l: lang === 'es' ? `desde ${since}` : `since ${since}` },
    { v: total.toString(),
      l: lang === 'es' ? (total === 1 ? 'reseña verificada' : 'reseñas verificadas') : (total === 1 ? 'verified review' : 'verified reviews') },
    avg != null ? { v: `${fmtRating(avg)}/10`,
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
// Galería de la ficha: mosaico editorial con filtros por estancia y visor a
// pantalla completa (texto y nota de intención de cada foto). La zona sale del
// título de la foto (parte antes de " · ", en español para no depender del idioma).
const GALLERY_ZONES = [
  { id: 'salon', es: 'Salón y comedor', en: 'Living & dining', test: t => /^(Salón|Comedor|Entrada|Detalle|Sofá)/.test(t) },
  { id: 'dorm',  es: 'Dormitorios',     en: 'Bedrooms',        test: t => /^Dormitorio/.test(t) },
  { id: 'coc',   es: 'Cocina',          en: 'Kitchen',         test: t => /^Cocina/.test(t) },
  { id: 'bano',  es: 'Baños',           en: 'Bathrooms',       test: t => /^Baño/.test(t) },
  { id: 'terr',  es: 'Terrazas',        en: 'Terraces',        test: t => /terraza/i.test(t) },
  { id: 'urb',   es: 'Urbanización',    en: 'The complex',     test: () => true },
];
const GALLERY_FIRST = 12;
// Ritmo del mosaico: una grande, una alta y una ancha cada siete fotos.
const _tileKind = (k) => (k % 7 === 0 ? 'big' : k % 7 === 3 ? 'tall' : k % 7 === 5 ? 'wide' : '');
const _tileSpan = (kind, cols) => {
  if (cols <= 2) return kind === 'tall' ? [1, 2] : kind ? [2, 1] : [1, 1];
  return kind === 'big' ? [2, 2] : kind === 'tall' ? [1, 2] : kind === 'wide' ? [2, 1] : [1, 1];
};
// Misma colocación "dense" que hace el grid CSS: cada pieza al primer hueco libre, por filas.
const _placeTiles = (tiles, cols) => {
  const grid = [];
  const at = (r, c) => (grid[r] || [])[c];
  const free = (r, c, cs, rs) => { for (let y = r; y < r + rs; y++) for (let x = c; x < c + cs; x++) if (at(y, x) !== undefined) return false; return true; };
  tiles.forEach((t, i) => {
    for (let r = 0; ; r++) {
      let done = false;
      for (let c = 0; c + t.cs <= cols; c++) {
        if (free(r, c, t.cs, t.rs)) {
          for (let y = r; y < r + t.rs; y++) { grid[y] = grid[y] || []; for (let x = c; x < c + t.cs; x++) grid[y][x] = i; }
          t.r = r; t.c = c; done = true; break;
        }
      }
      if (done) break;
    }
  });
  return grid;
};
const _gridHoles = (grid, cols) => {
  const out = [];
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < cols; c++) if ((grid[r] || [])[c] === undefined) out.push([r, c]);
  return out;
};
// Tamaños de las piezas para que el mosaico cierre siempre abajo en línea recta, con
// cualquier número de fotos: se parte del ritmo y, si queda un hueco, se estira la pieza
// de encima o la de la izquierda; si aun así no cierra, se aplana el ritmo por la cola.
const _flushKinds = (n, cols) => {
  const kinds = Array.from({ length: n }, (_, k) => _tileKind(k));
  for (let plainFrom = n; plainFrom >= 0; plainFrom--) {
    const tiles = kinds.map((k, i) => { const [cs, rs] = _tileSpan(i < plainFrom ? k : '', cols); return { cs, rs }; });
    for (let pass = 0; pass < 12; pass++) {
      const grid = _placeTiles(tiles, cols);
      const holes = _gridHoles(grid, cols);
      if (!holes.length) return tiles.map(t => (t.cs === 2 && t.rs === 2 ? 'big' : t.rs === 2 ? 'tall' : t.cs === 2 ? 'wide' : ''));
      let fixed = false;
      for (const [r, c] of holes) {
        const up = r > 0 ? tiles[grid[r - 1][c]] : null;
        if (up && up.r + up.rs === r && up.rs < 2 && !(cols <= 2 && up.cs === 2)) { up.rs = 2; fixed = true; break; }
        const left = c > 0 ? tiles[grid[r][c - 1]] : null;
        if (left && left.c + left.cs === c && left.cs < 2 && !(cols <= 2 && left.rs === 2)) { left.cs = 2; fixed = true; break; }
      }
      if (!fixed) break;
    }
  }
  return kinds.map(() => 'full');
};
const _useGridCols = () => {
  const mq = () => (window.matchMedia('(max-width: 760px)').matches ? 2 : 4);
  const [cols, setCols] = React.useState(mq);
  React.useEffect(() => {
    const m = window.matchMedia('(max-width: 760px)');
    const on = () => setCols(mq());
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return cols;
};

// Logo de la marca de agua: el del color de cada Hestía.
const APT_WM = { vm: 'mar', vt: 'thalassa', vs: 'salinas' };
// La ruta se resuelve respecto a styles.css (carpeta assets).
const wmVar = (id) => `url(logo-${APT_WM[id] || 'blanco'}-160.png)`;

const GalleryMosaic = ({ imgs, captions, esCaptions, notes = {}, accent, wm, lang = 'es' }) => {
  const zoneOf = React.useMemo(() => imgs.map((_, i) => {
    const head = ((esCaptions || captions)[i] || '').split(' · ')[0];
    return GALLERY_ZONES.find(z => z.test(head)).id;
  }), [imgs, captions, esCaptions]);
  const zones = GALLERY_ZONES.map(z => ({ ...z, n: zoneOf.filter(id => id === z.id).length })).filter(z => z.n);
  const [filter, setFilter] = React.useState('all');
  const [expanded, setExpanded] = React.useState(false);
  const [lb, setLb] = React.useState(null); // posición dentro de la lista visible
  const closeRef = React.useRef(null);

  // "Todo" va ordenado por estancias (el salón abre el mosaico, y dentro de cada
  // zona entrada y detalles quedan al final) para que la foto grande sea de las buenas.
  const order = React.useMemo(() => {
    const zi = id => GALLERY_ZONES.findIndex(z => z.id === id);
    const minor = i => /^(Entrada|Detalle)/.test(((esCaptions || captions)[i] || '')) ? 1 : 0;
    return imgs.map((_, i) => i).sort((a, b) => zi(zoneOf[a]) - zi(zoneOf[b]) || minor(a) - minor(b) || a - b);
  }, [imgs, zoneOf]);
  const list = order.filter(i => filter === 'all' || zoneOf[i] === filter);
  const shown = filter === 'all' && !expanded ? list.slice(0, GALLERY_FIRST) : list;
  const cols = _useGridCols();
  const kinds = React.useMemo(() => _flushKinds(shown.length, cols), [shown.length, cols]);
  const zoneName = id => { const z = GALLERY_ZONES.find(x => x.id === id); return z ? z[lang] : ''; };

  // Cache-bust de las fotos (subir GALLERY_V al reemplazar una con el mismo nombre)
  // y encuadre inteligente por foto (data/photo-positions.json → window.PHOTO_POS).
  const gv = (src) => `${src}?v=${GALLERY_V}`;
  const webp = (src) => gv(src).replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
  const posFor = (src) => (window.PHOTO_POS || {})[src.split('/').pop()] || '50% 50%';
  // Si la .webp falla (404 o caché), <picture> no cae solo al jpg: se fuerza.
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

  const pick = (id) => { setFilter(id); setExpanded(false); };
  const openAt = (pos) => { setLb(pos); document.body.style.overflow = 'hidden'; };
  const close = () => { setLb(null); document.body.style.overflow = ''; };
  const step = (d) => setLb(p => (p + d + list.length) % list.length);

  React.useEffect(() => {
    if (lb === null) return;
    closeRef.current && closeRef.current.focus();
    const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const onKey = e => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'Escape')     close();
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
  }, [lb, list.length]);

  const touchX = React.useRef(null);
  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const cur = lb !== null ? list[lb] : null;
  return (
    <>
      <div className="gm-filters" role="tablist" aria-label={lang === 'es' ? 'Filtrar fotos por estancia' : 'Filter photos by room'}>
        <button type="button" role="tab" aria-selected={filter === 'all'} className={`gm-chip${filter === 'all' ? ' on' : ''}`} onClick={() => pick('all')}>
          {lang === 'es' ? 'Todo' : 'All'} <span className="gm-chip-n">{imgs.length}</span>
        </button>
        {zones.map(z => (
          <button key={z.id} type="button" role="tab" aria-selected={filter === z.id} className={`gm-chip${filter === z.id ? ' on' : ''}`} onClick={() => pick(z.id)}>
            {z[lang]} <span className="gm-chip-n">{z.n}</span>
          </button>
        ))}
      </div>
      <div className="gm-grid">
        {shown.map((i, k) => (
          <button key={i} type="button" className={`gm-tile ${kinds[k]}`} onClick={() => openAt(k)} aria-label={captions[i]}>
            <picture>
              <source srcSet={webp(imgs[i])} type="image/webp"/>
              <img src={gv(imgs[i])} alt="" loading={k < 4 ? 'eager' : 'lazy'} decoding="async" onError={webpFallback}
                   style={{ objectPosition: posFor(imgs[i]) }}/>
            </picture>
            <span className="gm-cap">{captions[i]}</span>
          </button>
        ))}
      </div>
      {filter === 'all' && !expanded && list.length > GALLERY_FIRST && (
        <div className="gm-more-wrap">
          <button type="button" className="gm-more" onClick={() => setExpanded(true)}>
            {lang === 'es' ? `Mostrar las ${list.length} fotos` : `Show all ${list.length} photos`}
          </button>
        </div>
      )}
      {cur !== null && ReactDOM.createPortal(
        // Montado en <body>: dentro de la sección quedaba atrapado en su pila de
        // z-index y el header (z-index 99) tapaba el botón de cerrar.
        <div className="gc-lightbox" onClick={close} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
             role="dialog" aria-modal="true" aria-label={lang === 'es' ? 'Galería de fotos' : 'Photo gallery'} style={{ '--apt-accent': accent, '--wm-logo': wm }}>
          <button ref={closeRef} className="gc-lb-close" onClick={close} aria-label={lang === 'es' ? 'Cerrar' : 'Close'}>✕</button>
          <button className="gc-lb-prev" onClick={e => { e.stopPropagation(); step(-1); }} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>‹</button>
          <picture className="gc-lb-pic">
            <source srcSet={webp(imgs[cur])} type="image/webp"/>
            <img decoding="async" className="gc-lb-img" src={gv(imgs[cur])} alt={captions[cur]} onError={webpFallback} onClick={e => e.stopPropagation()}/>
          </picture>
          <button className="gc-lb-next" onClick={e => { e.stopPropagation(); step(1); }} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>›</button>
          <div className="gc-lb-caption-wrap">
            <div className="gc-lb-caption">{captions[cur]}</div>
            {notes[cur] && <p className="gc-lb-note">{notes[cur]}</p>}
          </div>
          <div className="gc-lb-counter">{lb + 1} / {list.length}{filter !== 'all' ? ` · ${zoneName(filter)}` : ''}</div>
        </div>,
        document.body
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
              {lang === 'es' ? 'Guía del apartamento' : 'Apartment guide'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const AptPageGallery = ({ apt, lang }) => {
  const d = apt[lang];
  const imgs = apt.gallery_imgs;
  if (!imgs || !imgs.length) return null;
  return (
    <section id="apt-galeria" className="apt-page-gallery on-dark" style={{ '--apt-accent': apt.accent, '--wm-logo': wmVar(apt.id) }}>
      <div className="gm-head">
        <div className="apt-gallery-eyebrow eyebrow">{lang === 'es' ? 'Galería de fotos' : 'Photo gallery'}</div>
        <h2 className="gm-title">{lang === 'es' ? <>Rincón a <em>rincón.</em></> : <>Corner by <em>corner.</em></>}</h2>
      </div>
      <GalleryMosaic wm={wmVar(apt.id)} imgs={imgs} captions={d.gallery_captions} esCaptions={apt.es && apt.es.gallery_captions}
                     notes={d.gallery_notes || {}} accent={apt.accent} lang={lang}/>
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

// --- Mini reseñas antes del calendario ---
// 3 citas reales de huéspedes (campo highlight) del mismo apartamento.
// Idioma preferido = lang de la página; fallback a cualquier idioma.
const _amrFlag = (cc) => {
  if (!cc || cc.length !== 2) return '';
  const b = 0x1F1E6;
  return String.fromCodePoint(b + cc.toUpperCase().charCodeAt(0) - 65) +
         String.fromCodePoint(b + cc.toUpperCase().charCodeAt(1) - 65);
};
// Icono de estrella sin fracción al lado: cuenta de 0 a 5 (visual, no expone
// escala), derivada de ratingNorm (shared.jsx) para que la normalización
// Booking/Airbnb/Google/web se calcule en un único sitio.
const _amrStars = (r) => Math.round(ratingNorm(r) / 2);
const _amrSrc   = { booking: 'Booking', airbnb: 'Airbnb', google: 'Google', web: 'Hestía' };

const AmrCard = ({ r, lang }) => {
  const stars = _amrStars(r);
  const full = r.text || '';
  const needsTrunc = full.length > 145;
  const [open, setOpen] = React.useState(false);
  const text = needsTrunc && !open ? full.slice(0, 142) + '…' : full;
  const textId = React.useId();
  return (
    <div className="amr-card">
      <div className="amr-top">
        <span className="amr-stars" aria-label={lang === 'en' ? `${stars} stars` : `${stars} estrellas`}>{Array.from({ length: stars }, (_, i) => <HiIcon key={i} name="star-fill" size="1em" />)}</span>
        <span className="amr-src-lbl">{_amrSrc[r.source] || r.source}</span>
      </div>
      <p className="amr-text" id={textId}>"{text}"</p>
      {needsTrunc && (
        <button type="button" className="amr-expand-btn" onClick={() => setOpen(o => !o)}
          aria-expanded={open} aria-controls={textId}>
          {open ? (lang === 'es' ? 'Leer menos' : 'Show less') : (lang === 'es' ? 'Leer más' : 'Read more')}
        </button>
      )}
      <div className="amr-author">
        <span className="amr-flag" aria-hidden="true">{_amrFlag(r.country)}</span>
        <span className="amr-name">{_shortGuestName(r.name)}</span>
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
    <section id="apt-reviews" className="apt-mini-reviews" style={{ '--apt-accent': apt.accent }}>
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
            const lsRates = lsCfg.monthlyRates;
            if (!lsRates) return null;
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
              <HiIcon name="check" size="1em" /> {lang === 'es' ? 'si lo ves más barato, lo mejoramos' : 'find it cheaper and we beat it'}
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
        <span className="asb-perks-icon" aria-hidden="true"><HiIcon name="spark" size="1em" /></span>
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
      'author': { '@type': 'Person', 'name': (r.name && r.name !== '?') ? _shortGuestName(r.name) : 'Verified Guest' },
      'datePublished': r.date,
      'reviewBody': r.text,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': ratingNorm(r),
        'bestRating': 10,
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
      'uploadDate': apt.video_upload || '2026-05-30T12:00:00+02:00',
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
      <main id="main-content" tabIndex={-1} className="apt-main" data-phase={phase} data-apt={apt.id}>
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
            <AptPageHero apt={apt} lang={lang} />
            <TrustStrip apt={apt} lang={lang} />
            <AptPageGallery apt={apt} lang={lang} />
            <AptVideoDesc apt={apt} lang={lang} />
            <AptCinematicReveal apt={apt} lang={lang} />
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
