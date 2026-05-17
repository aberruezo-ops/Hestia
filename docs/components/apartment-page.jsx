// ================================================================
// HESTÍA — Página de detalle de cada Hestía
// Lee window.__APT__ ('vm' | 'vt' | 'vs') para saber cuál mostrar
// ================================================================

const APT_DATA = {
  vm: {
    id: 'vm', num: '01', slug: 'mar', license: 'VFT/AL/01580',
    name_short: 'Mar',
    vimeo_id: '1192955159',
    accent: '#6B7A3A', accent2: '#8B9A52', accent_dk: '#4A5628',
    hero_img: 'assets/apt-vs.jpg',
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
      desc: 'Hestía Mar es donde el paisaje del olivar se funde con el Mediterráneo. Desde la terraza esquinera de 20m² orientada al amanecer, el mar aparece entre los eucaliptos de Vera Playa. Al ser esquinera, da a tres calles y permite ventilación cruzada natural en todas las estancias.',
      desc2: 'Mar ocupa la planta primera y se abre al jardín con acceso a la piscina comunitaria. Al ser esquinera, la luz entra desde el amanecer hasta el atardecer — ves el ciclo solar completo desde la terraza. Aire acondicionado centralizado en todas las estancias. Cocina completamente equipada, salón-comedor de 28m² y dos dormitorios con ropa de cama de calidad.',
      features: ['6 plazas + bebé · 2 habitaciones · planta primera', 'Terraza esquina 20m² · orientada al amanecer · ciclo solar completo', 'Piscina comunitaria · jacuzzi comunitario (verano)', 'Mascotas · petición previa · suplemento', '300 m de la playa · 5 min a pie desde la salida', 'Accesibilidad · adaptado para movilidad reducida', 'Aire acondicionado centralizado en todas las estancias', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Salón · mesa de madera y cocina', 'Salón · sofá con espejo sol', 'Salón · vista cenital', 'Piscina comunitaria nocturna', 'Detalle · jarrón y textiles', 'Cocina equipada · mañana', 'Cocina · encimera y copa', 'Cocina · campana extractora', 'Dormitorio 2 · camas turquesa', 'Dormitorio principal · armario espejo', 'Dormitorio 2 · simétrico', 'Terraza · día y sierra', 'Terraza · velada de verano', 'Terraza · sofás nocturnos', 'Baño 1 · luz LED verde', 'Baño 2 · ducha y toallas', 'Baño 2 · lavabo y aromas', 'Piscina comunitaria · día', 'Piscina · jardines', 'Zona duchas · mosaico azul', 'Salón · lámpara y sofá', 'Salón · sofá completo', 'Detalle · espejo sol dorado', 'Detalle · suelo hidráulico', 'Dormitorio principal · lámpara globo'],
    },
    en: {
      name: 'Hestía Mar',
      concept: 'Where the olive grove meets the sea.',
      desc: 'Hestía Mar is where the olive grove landscape merges with the Mediterranean. From the 20m² corner terrace facing the sunrise, the sea appears between the eucalyptus trees of Vera Playa. As a corner unit, Mar faces three streets and benefits from natural cross-ventilation throughout.',
      desc2: 'Mar is on the first floor and opens onto the garden with access to the shared pool. As a corner unit, light travels through from sunrise to sunset — you can follow the full arc of the sun from the terrace. Centralised air conditioning in every room. A fully equipped kitchen, 28m² living-dining room, and two bedrooms with quality bed linen.',
      features: ['6 guests + baby · 2 bedrooms · first floor', 'Corner terrace 20m² · faces sunrise · full solar arc', 'Shared pool · shared jacuzzi (summer)', 'Pets · on request · supplement', '300 m from the beach · 5 min walk from complex exit', 'Accessibility · adapted for reduced mobility', 'Centralised A/C in every room', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Living & dining · wooden table', 'Living room · sofa & sun mirror', 'Living room · overhead view', 'Community pool · night', 'Detail · vase & textiles', 'Kitchen · morning setup', 'Kitchen · counter & wine', 'Kitchen · extractor hood', 'Bedroom 2 · teal beds', 'Master bedroom · mirrored wardrobe', 'Bedroom 2 · symmetric', 'Terrace · day & mountains', 'Terrace · summer evening', 'Terrace · night sofas', 'Bathroom 1 · green LED', 'Bathroom 2 · shower & towels', 'Bathroom 2 · vessel sink', 'Community pool · daytime', 'Pool · gardens', 'Pool showers · blue mosaic', 'Living room · lamp detail', 'Living room · full sofa', 'Detail · gold sun mirror', 'Detail · hydraulic tiles', 'Master bedroom · globe lamp'],
    },
  },
  vt: {
    id: 'vt', num: '02', slug: 'thalassa', license: 'VFT/AL/05535',
    name_short: 'Thalassa',
    vimeo_id: '1192955160',
    accent: '#8A4A24', accent2: '#B86A3C', accent_dk: '#6E3A1C',
    hero_img: 'assets/apt-vt-4.jpg',
    bedroom_img: 'assets/apt-vt-gallery-02.jpg',
    floorplan_img: 'assets/IMG_1121.png',
    others: ['vm', 'vs'],
    gallery_imgs: [
      'assets/apt-vt-gallery-01.jpg',
      'assets/apt-vt-gallery-02.jpg',
      'assets/apt-vt-gallery-03.jpg',
      'assets/apt-vt-gallery-04.jpg',
      'assets/apt-vt-gallery-05.jpg',
      'assets/apt-vt-gallery-06.jpg',
      'assets/apt-vt-gallery-07.jpg',
      'assets/apt-vt-gallery-08.jpg',
      'assets/apt-vt-gallery-09.jpg',
      'assets/apt-vt-gallery-10.jpg',
      'assets/apt-vt-gallery-11.jpg',
      'assets/apt-vt-gallery-12.jpg',
      'assets/apt-vt-gallery-13.jpg',
      'assets/apt-vt-gallery-14.jpg',
      'assets/apt-vt-gallery-15.jpg',
      'assets/apt-vt-gallery-16.jpg',
    ],
    es: {
      name: 'Hestía Thalassa',
      concept: 'El ático sobre el Mediterráneo y el Salar de los Canos.',
      desc: 'Hestía Thalassa es el ático, el más elevado de los tres. Desde su terraza panorámica se ve el Mediterráneo y, hacia el interior, el Salar de los Canos — un paisaje árido y de gran belleza que cambia con la luz del día. El punto más abierto y luminoso de toda la urbanización.',
      desc2: 'El ático tiene una planta abierta y una terraza con vistas al mar. La urbanización cuenta con SPA comunitario — con sauna y gimnasio —, piscina y pistas de pádel. El SPA está abierto en otoño, invierno y primavera; solo el gimnasio permanece abierto durante el verano.',
      features: ['6 plazas + bebé · 2 habitaciones', 'Ático — el piso más alto de la urbanización', 'Terraza panorámica · vistas al mar y al Salar de los Canos', 'Piscina comunitaria · pistas de pádel', 'SPA comunitario · sauna · gimnasio (otoño-primavera)', '1,5 km de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Terraza · atardecer dorado y vistas al Mediterráneo', 'Dormitorio principal · pared turquesa y doble mesita', 'Dormitorio principal · cojines bordados y detalle', 'Dormitorio 2 · cabeceros rojos y cojines de colores', 'Salón · vistas al atardecer desde la ventana', 'Comedor · mesa extensible y lámparas negras', 'Baño 1 · mosaico azul y suelo hidráulico', 'Entrada · mueble artesanal y espejo geométrico', 'Terraza · zona chill out bajo el toldo', 'Salón · sofá y planta tropical', 'Terraza · vistas panorámicas y puesta de sol', 'Dormitorio 2 · cabeceros granate y luz cálida de noche', 'Dormitorio 2 · vista frontal · cojines abstractos azul-índigo', 'Baño 2 · ducha de obra con mampara y mosaico amarillo', 'Baño 2 · lavabo redondo, espejo circular y suelo hidráulico', 'Baño 2 · grifería negra y detalle de la flor seca'],
    },
    en: {
      name: 'Hestía Thalassa',
      concept: 'The penthouse above the Mediterranean and the Salar de los Canos.',
      desc: 'Hestía Thalassa is the penthouse — the highest of the three. From its panoramic terrace you look out over the Mediterranean and, inland, the Salar de los Canos: an arid, dramatically beautiful landscape that shifts with the light throughout the day.',
      desc2: 'The penthouse is laid out as a single open floor with a terrace and sea views. The complex also includes a shared SPA — with sauna and gym —, pool and padel courts. The SPA is open in autumn, winter and spring; only the gym stays open during summer.',
      features: ['6 guests + baby · 2 bedrooms', 'Penthouse — highest floor in the complex', 'Panoramic terrace · sea & Salar de los Canos views', 'Shared pool · padel courts', 'Shared SPA · sauna · gym (autumn–spring)', '1.5 km from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Terrace · golden sunset & Mediterranean views', 'Master bedroom · turquoise wall & twin bedside tables', 'Master bedroom · embroidered cushions detail', 'Bedroom 2 · red velvet headboards & colourful pillows', 'Living room · sunset views through the window', 'Dining area · extendable table & black pendants', 'Bathroom 1 · blue mosaic & patterned floor tiles', 'Entrance · artisan cabinet & geometric mirror', 'Terrace · chill-out seating under the awning', 'Living room · sofa & tropical plant', 'Terrace · panoramic views & golden hour', 'Bedroom 2 · burgundy headboards & warm night light', 'Bedroom 2 · front view · indigo-blue abstract cushions', 'Bathroom 2 · walk-in shower with yellow mosaic', 'Bathroom 2 · round basin, circular mirror & hydraulic tile', 'Bathroom 2 · matte-black tap & dried-flower detail'],
    },
  },
  vs: {
    id: 'vs', num: '03', slug: 'salinas', license: 'VTF/AL/07056',
    name_short: 'Salinas',
    vimeo_id: '1192955161',
    accent: '#9E7A2C', accent2: '#D4A84A', accent_dk: '#7A5E1A',
    hero_img: 'assets/apt-vm.jpg',
    bedroom_img: 'assets/apt-vs-gallery-21.jpg',
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
      'assets/apt-vs-gallery-22.jpg',   // dormitorio 2
      'assets/apt-vs-gallery-9.jpg',    // baño 1
      'assets/apt-vs-gallery-10.jpg',
      'assets/apt-vs-gallery-11.jpg',   // baño principal
      'assets/apt-vs-gallery-12.jpg',
      'assets/apt-vs-gallery-13.jpg',   // terraza principal
      'assets/apt-vs-gallery-19.jpg',
      'assets/apt-vs-gallery-20.jpg',
      'assets/apt-vs-gallery-24.jpg',
      'assets/apt-vs-gallery-25.jpg',
      'assets/apt-vs-gallery-27.jpg',
      'assets/apt-vs-gallery-14.jpg',   // segunda terraza
      'assets/apt-vs-gallery-26.jpg',
      'assets/apt-vs-gallery-28.jpg',   // nuevo: rincón lucecitas
    ],
    es: {
      name: 'Hestía Salinas',
      concept: 'El amarillo albero del amanecer sobre las salinas.',
      desc: 'Hestía Salinas vive en el color albero del amanecer almeriense. Tres piscinas, dos terrazas y el Parque Natural de las Salinas de Puerto Rey a la vuelta de la esquina. El Hestía más luminoso de la colección.',
      desc2: 'A 900 metros del mar y junto al Parque Natural de las Salinas de Puerto Rey, Salinas ofrece un paisaje que no existe en ningún otro lugar de Europa. La luz dorada de la tarde llena cada habitación — el privilegio de vivir junto a la naturaleza.',
      features: ['6 plazas + bebé · 2 habitaciones', 'Dos terrazas', '3 piscinas comunitarias · pistas de pádel', 'Gimnasio + sauna comunitarios', 'Parque Natural Salinas de Puerto Rey · acceso peatonal directo', '900 m de la playa', 'Mascotas · petición previa · suplemento', 'Aire acondicionado frío/calor', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'WiFi fibra óptica · Amazon Alexa', 'Lavadora · lavavajillas · nevera · microondas', 'Cafetera de cápsulas + espresso · batidora · plancha', 'Cama matrimonial 150 cm · colchón viscoelástico', 'Toallas 100% algodón 200 hilos · nórdicos de plumas'],
      gallery_captions: ['Entrada · espejo y pared amarilla', 'Salón-comedor · luz natural y pared albero', 'Salón · sofá mostaza y Smart TV', 'Salón · sofá y sillones turquesa', 'Sofá · detalle y cuadro', 'Salón · vista cenital', 'Salón nocturno · ambiente TV', 'Comedor · mesa y lámpara teal', 'Cocina · campana extractora y encimera', 'Cocina · encimera madera · primer plano', 'Cocina · blanca y completamente equipada', 'Cocina · vista frontal', 'Dormitorio principal · mural olas y edredón teal', 'Dormitorio principal · cama y terraza', 'Dormitorio 2 · dos camas individuales', 'Baño 1 · lavabo y azulejo azul', 'Baño 1 · ducha y mosaico', 'Baño principal · bañera y bidé', 'Baño principal · mueble y espejo', 'Terraza principal · sofás y vistas', 'Terraza pergola · desayuno', 'Terraza · desayuno Hestía', 'Terraza principal · cena romántica nocturna', 'Terraza principal · noche · vistas a la urbanización', 'Terraza principal · atardecer y nubes', 'Segunda terraza · velada romántica', 'Segunda terraza · velada con vino y faroles', 'Terraza · rincón de relax con lucecitas'],
    },
    en: {
      name: 'Hestía Salinas',
      concept: 'Ochre yellow, sunrise over the salt flats.',
      desc: 'Hestía Salinas lives in the ochre colour of the Almería sunrise. Three pools, two terraces and the Puerto Rey salt-flat nature park around the corner. The brightest Hestía in the collection.',
      desc2: '900 metres from the sea and beside the Puerto Rey Salt-flat Nature Park, Salinas offers a landscape that exists nowhere else in Europe. Golden afternoon light fills every room — the privilege of living beside unspoilt nature.',
      features: ['6 guests + baby · 2 bedrooms', 'Two terraces', '3 shared pools · padel courts', 'Communal gym + sauna', 'Puerto Rey Salt-flat Nature Park · direct pedestrian access', '900 m from the beach', 'Pets · on request · supplement', 'A/C heating & cooling', 'Smart TV 55" · Prime Video · HBO Max · Skyshowtime', 'Fibre WiFi · Amazon Alexa', 'Washer · dishwasher · fridge · microwave', 'Capsule + espresso coffee maker · blender · iron', 'Double bed 150 cm · memory foam mattress', '100% cotton 200-thread towels · down duvets'],
      gallery_captions: ['Entrance · mirror & yellow feature wall', 'Living & dining · natural light & ochre wall', 'Living room · mustard sofa & Smart TV', 'Living room · sofa & teal armchairs', 'Sofa · detail & abstract painting', 'Living room · overhead view', 'Evening living room · TV ambience', 'Dining area · table & teal pendant lamp', 'Kitchen · extractor hood & countertop', 'Kitchen · wood counter · low angle', 'Kitchen · fully equipped white', 'Kitchen · frontal view', 'Master bedroom · wave mural & teal blanket', 'Master bedroom · bed & terrace access', 'Bedroom 2 · twin beds', 'Bathroom 1 · vessel sink & blue tiles', 'Bathroom 1 · shower & mosaic tiles', 'Main bathroom · bathtub & bidet', 'Main bathroom · vanity & ornate mirror', 'Main terrace · lounge chairs & views', 'Pergola terrace · morning breakfast', 'Terrace · Hestía breakfast tray', 'Main terrace · romantic candlelit dinner', 'Main terrace · night · complex views', 'Main terrace · sunset & dramatic sky', 'Second terrace · candlelit evening', 'Second terrace · wine & lantern evening', 'Terrace · cosy corner with fairy lights'],
    },
  },
};

// ================================================================
// EQUIPAMIENTO — datos por Hestía
// ================================================================
const APT_EQUIP = {
  vm: {
    area: 77, guests: 6, bedrooms: 2, bathrooms: 2,
    daily_es: {
      eyebrow: 'Tu día en Hestía Mar',
      morning: 'Te despiertas con el mar a 300 metros y la luz que entra por la terraza de esquina. Cocina con desayuno, sales a la piscina y al jacuzzi del jardín sin coger el coche.',
      core: 'La casa funciona con A/C por conductos, fibra y Smart TV con Prime, HBO, Sky y Pluto. La cocina está completa (lavavajillas, lavadora y secadora). Dos baños: uno con columna de hidroterapia y espejo de cromoterapia, otro con ducha y luz de colores.',
      behind: 'Antes de que llegues: sábanas de 200 hilos planchadas, toallas de 600 g/m² para baño y playa, kit de bienvenida con producto local, sombrilla preparada, cuna y trona montadas si las pediste. El A/C ajustado a la estación y el botiquín revisado.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Mar',
      morning: 'You wake up to the sea 300 m away and the light pouring in from the corner terrace. Breakfast in the kitchen, then the pool and jacuzzi in the garden — no need to take the car.',
      core: 'The flat runs on ducted A/C, fibre Wi-Fi and a Smart TV with Prime, HBO, Sky and Pluto. Full kitchen (dishwasher, washer & dryer). Two bathrooms: one with a hydrotherapy column and chromotherapy mirror, the other with a shower and colour lighting.',
      behind: 'Before you arrive: 200-thread sheets ironed, 600 g/m² towels for bath and beach, a welcome kit with local produce, beach umbrella ready, cot and high chair set up if you booked them. A/C tuned to the season, first-aid kit checked.',
    },
    es: {
      terrace: 'Terraza 20m² esquina',
      icons: [
        ['🌊', 'Playa a 300m'], ['☀️', 'Terraza 20m² · esquina'], ['🏊', 'Piscina + Jacuzzi'],
        ['🌿', 'Jardines'], ['🛋', 'Chill out'], ['🛗', 'Ascensor'],
        ['📺', 'Smart TV 55"'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
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
        ['📺', '55" Smart TV'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
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
    daily_es: {
      eyebrow: 'Tu día en Hestía Thalassa',
      morning: 'El Mediterráneo enmarcado en la terraza de 18 m² del ático. Cafetera Nespresso y desayuno con vistas. Bajas a las tres piscinas — una climatizada todo el año — sin salir de la urbanización.',
      core: 'SPA con sauna, gimnasio y pista de tenis a tu disposición (SPA en otoño-invierno-primavera; gimnasio también en verano). Smart TV con Prime, HBO, Sky y Pluto. Dos baños en suite con columnas de hidromasaje. Cocina alto standing.',
      behind: 'Cada llegada: sábanas de 200 hilos planchadas, toallas de 600 g/m², nórdicos de plumas, kit de bienvenida con producto local. Las zonas comunes (SPA, piscinas, gimnasio) las mantiene la urbanización; el ático lo dejamos listo nosotros — A/C calibrado, cafetera cargada y aromas preparados.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Thalassa',
      morning: 'The Mediterranean framed by the 18 m² penthouse terrace. Nespresso machine, breakfast with a view, and three pools waiting downstairs — one heated year-round — all without leaving the complex.',
      core: 'Spa with sauna, gym and tennis court at your disposal (Spa open autumn-winter-spring; gym also in summer). Smart TV with Prime, HBO, Sky and Pluto. Two en-suite bathrooms with hydro-massage columns. High-end kitchen.',
      behind: 'Every arrival: 200-thread sheets ironed, 600 g/m² towels, down duvets, a welcome kit with local produce. The complex maintains the shared areas (spa, pools, gym); we leave the penthouse fully prepped — A/C tuned, coffee machine loaded, aromas in place.',
    },
    es: {
      terrace: 'Terraza 18m² vistas al mar',
      icons: [
        ['🌊', 'Mar · Laguna · Pueblo'], ['☀️', 'Terraza 18m² · vistas al mar'], ['🏊', '3 Piscinas'],
        ['🌡', 'Piscina climatizada'], ['♨️', 'Jacuzzi'], ['💪', 'Gimnasio'],
        ['🧖', 'Sauna'], ['🎾', 'Pista de tenis'], ['🌿', 'Jardines · Columpios'],
        ['📺', 'Smart TV 55"'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C salón y dormitorios'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Dos baños · en suite'], ['🚿', 'Columnas de hidromasaje'],
        ['🚗', 'Garaje interior'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado'], ['🧴', 'Toallas 600g/m² · baño y playa'],
        ['🌺', 'Nórdicos de plumas'], ['🪔', 'Hidroterapia · aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '18m² sea-view terrace',
      icons: [
        ['🌊', 'Sea · Lagoon · Village'], ['☀️', '18m² sea-view terrace'], ['🏊', '3 Swimming pools'],
        ['🌡', 'Heated pool (year-round)'], ['♨️', 'Jacuzzi'], ['💪', 'Gym'],
        ['🧖', 'Sauna'], ['🎾', 'Tennis court'], ['🌿', 'Gardens · Swings'],
        ['📺', '55" Smart TV'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C lounge & bedrooms'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Two en-suite bathrooms'], ['🚿', 'Hydro-massage columns'],
        ['🚗', 'Indoor garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'],
        ['🛏', '200-thread combed cotton sheets'], ['🧴', 'Bath & beach towels 600g/m²'],
        ['🌺', 'Down duvets'], ['🪔', 'Hydrotherapy · aromas'], ['🧻', 'Drying rack'],
      ],
    },
  },
  vs: {
    area: 80, guests: 6, bedrooms: 2, bathrooms: 2,
    daily_es: {
      eyebrow: 'Tu día en Hestía Salinas',
      morning: 'La luz dorada de las Salinas de Puerto Rey — único humedal protegido a 2 minutos — entra por la terraza grande de 18 m². Café y desayuno al sol; luego paseas hasta la playa o cruzas al jardín de los riachuelos.',
      core: 'Dos terrazas: la de 18 m² para sol y luna, la de 14 m² para el atardecer. Piscina, gimnasio y pista de tenis en la urbanización. Smart TV 55" con Ambilight, Prime/HBO/Sky/Pluto, cocina completa y A/C frío-calor.',
      behind: 'Antes de tu llegada: sábanas de 200 hilos planchadas, toallas de 600 g/m², nórdicos de plumas más alternativa antialérgica en el dormitorio principal, cuna y trona si las pediste, sombrilla preparada. La cafetera Nespresso cargada y los aromas elegidos según la estación.',
    },
    daily_en: {
      eyebrow: 'A day at Hestía Salinas',
      morning: 'Golden light from Puerto Rey salt flats — the only protected wetland 2 minutes away — pours in through the 18 m² main terrace. Coffee and breakfast in the sun; then a walk to the beach or across to the streams in the garden.',
      core: 'Two terraces: the 18 m² for sun and moon, the 14 m² for sunset. Pool, gym and tennis court in the complex. 55" Ambilight Smart TV, Prime/HBO/Sky/Pluto, full kitchen and heat-cool A/C.',
      behind: 'Before you arrive: 200-thread sheets ironed, 600 g/m² towels, down duvets plus a hypoallergenic alternative in the master bedroom, cot and high chair if you booked them, beach umbrella ready. Nespresso machine loaded and aromas chosen by season.',
    },
    es: {
      terrace: '2 terrazas 18m² + 14m²',
      icons: [
        ['🌊', 'Playa a 2 min'], ['☀️', 'Terraza 18m² · sol y luna'], ['🌅', 'Terraza 14m² · atardecer'],
        ['🏊', 'Piscina'], ['🌿', 'Jardines · Riachuelos'], ['💪', 'Gimnasio'],
        ['🎾', 'Pista de tenis'], ['🛋', 'Chill out'], ['🏞', 'Salinas de Puerto Rey'],
        ['📺', 'Smart TV 55" · Ambilight'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'WIFI fibra'],
        ['❄️', 'A/C frío y calor'], ['🍳', 'Cocina completa · alto standing'], ['🍽', 'Lavavajillas'],
        ['🧺', 'Lavadora · alta gama'], ['☕', 'Nespresso + cafetera goteo'],
        ['🛁', 'Bañera + hidromasaje'], ['🚿', 'Cabina ducha + hidromasaje'],
        ['🚗', 'Garaje techado'], ['🩹', 'Botiquín'],
        ['🎁', 'Kit de bienvenida'], ['☂️', 'Sombrilla playa'], ['👶', 'Cuna · Trona'],
        ['🛏', 'Sábanas 200 hilos · algodón peinado'], ['🧴', 'Toallas 600g/m² · baño y playa'],
        ['🌺', 'Nórdicos plumas + acrílicos (antialérgicos)'], ['🪔', 'Aromas'], ['🧻', 'Tendedero'],
      ],
    },
    en: {
      terrace: '2 terraces 18m² + 14m²',
      icons: [
        ['🌊', 'Beach 2 min away'], ['☀️', '18m² terrace · sun & moon'], ['🌅', '14m² terrace · sunsets'],
        ['🏊', 'Pool'], ['🌿', 'Gardens · Streams'], ['💪', 'Gym'],
        ['🎾', 'Tennis court'], ['🛋', 'Chill-out'], ['🏞', 'Puerto Rey Salt Flats'],
        ['📺', '55" Smart TV · Ambilight'], ['🎬', 'Prime · HBO · Sky · Pluto'], ['📶', 'Fibre WIFI'],
        ['❄️', 'A/C heat & cool'], ['🍳', 'Full premium kitchen'], ['🍽', 'Dishwasher'],
        ['🧺', 'Washing machine · premium'], ['☕', 'Nespresso + drip coffee maker'],
        ['🛁', 'Bath + hydro-massage'], ['🚿', 'Shower cabin + hydro-massage'],
        ['🚗', 'Covered garage'], ['🩹', 'First-aid kit'],
        ['🎁', 'Welcome kit'], ['☂️', 'Beach umbrella'], ['👶', 'Cot · Highchair'],
        ['🛏', '200-thread combed cotton sheets'], ['🧴', 'Bath & beach towels 600g/m²'],
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

  // Narrativa "Tu día en Hestía Mar/Thalassa/Salinas" — cuenta el día
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
              <span className="aes-val" style={{ color: accent }}>{s.val}</span>
              {s.unit && <span className="aes-unit"> {s.unit}</span>}
              <span className="aes-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
        <div className="apt-equip-categories">
          {grouped.map(cat => (
            <div key={cat.key} className="apt-equip-cat">
              <div className="aec-label" style={{ color: accent }}>{lang === 'es' ? cat.es : cat.en}</div>
              <div className="apt-equip-icons">
                {cat.items.map(([icon, label], i) => (
                  <div key={i} className="apt-equip-item">
                    <span className="aei-icon" aria-hidden="true">{icon}</span>
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
    {caption && <div className="ph-caption">— {caption}</div>}
  </div>
);

// --- Hero de la página de Hestía ---
const AptPageHero = ({ apt, lang, scrolled, mode }) => {
  const d = apt[lang];
  const tbl = HESTIA_PRICES[apt.id];
  // El precio "desde" es el base de prices.json en temporada baja —
  // exactamente el número que el admin ve en /p-edit.html. Sin restar
  // el directDiscount: ese descuento sirve para calcular el ahorro
  // vs Booking/Airbnb dentro del desglose de la reserva, no aquí.
  const minPrice = tbl ? Math.min(...tbl.base.slice(1)) : null;
  return (
    <section className="apt-page-hero" data-apt={apt.id} style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <picture>
        <source srcSet={apt.hero_img.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
        <img decoding="async" src={apt.hero_img} alt={d.name} className="apt-page-hero-img"/>
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
                ? '· Si encuentras un precio más bajo, te lo mejoramos.'
                : '· Find a lower price anywhere — we will beat it.'}
            </span>
          </p>
        )}
        <div className="apt-page-ctas">
          <a href={`reservas.html?apt=${apt.id}`} className="btn btn-primary apt-page-reserve-btn">
            {lang === 'es' ? 'Reservar' : 'Book now'} <span className="arrow">→</span>
          </a>
          <a href="contacto.html" className="btn btn-ghost-light">
            {lang === 'es' ? 'Más información' : 'More info'}
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
  // Booking usa /10, otros /5 — normalizamos todo a /5
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
const GalleryCarousel = ({ imgs, captions }) => {
  const n = imgs.length;
  const [cur, setCur]       = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const thumbsRef  = React.useRef(null);
  const timerRef   = React.useRef(null);
  const pausedRef  = React.useRef(false);

  // Smart object-position per photo — calculated from edge centroid.
  // Loaded from data/photo-positions.json (cargado en window.PHOTO_POS).
  const posFor = (src) => {
    const map = window.PHOTO_POS || {};
    const key = src.split('/').pop();
    return map[key] || '50% 50%';
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

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = e => {
      if (e.key === 'ArrowRight') stepTo((cur + 1) % n);
      if (e.key === 'ArrowLeft')  stepTo((cur - 1 + n) % n);
      if (e.key === 'Escape')     setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, cur, n]);

  // Scroll the strip horizontally to centre the active thumb — never the page
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
              <picture>
                <source srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
                <img decoding="async" src={src} alt={captions[i]}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  style={{ objectPosition: posFor(src) }}/>
              </picture>
            </div>
          ))}
          <div className="gc-overlay">
            <WatermarkBadge size={26} pos={{ bottom: 12, right: 12 }}/>
            <div className="gc-caption">{captions[cur]}</div>
            <div className="gc-counter">{cur + 1} / {n}</div>
            <div className="gc-zoom-hint">⤢</div>
          </div>
        </div>
        <div className="gc-thumbs" ref={thumbsRef}>
          {imgs.map((src, i) => (
            <button key={i}
                    className={`gc-thumb${i === cur ? ' gc-thumb-on' : ''}`}
                    onClick={e => { e.stopPropagation(); go(i); }}
                    aria-label={captions[i]}>
              <picture>
                <source srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
                <img decoding="async" src={src} alt="" loading="lazy"
                  style={{ objectPosition: posFor(src) }}/>
              </picture>
            </button>
          ))}
        </div>
      </div>
      {lightbox && (
        <div className="gc-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Galería de fotos">
          <button className="gc-lb-close" onClick={closeLightbox} aria-label="Cerrar">✕</button>
          <button className="gc-lb-prev" onClick={e => { e.stopPropagation(); setCur(i => (i - 1 + n) % n); }} aria-label="Anterior">‹</button>
          <picture className="gc-lb-pic">
            <source srcSet={imgs[cur].replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
            <img decoding="async" className="gc-lb-img" src={imgs[cur]} alt={captions[cur]} onClick={e => e.stopPropagation()}/>
          </picture>
          <button className="gc-lb-next" onClick={e => { e.stopPropagation(); setCur(i => (i + 1) % n); }} aria-label="Siguiente">›</button>
          <div className="gc-lb-caption">{captions[cur]}</div>
          <div className="gc-lb-counter">{cur + 1} / {n}</div>
        </div>
      )}
    </>
  );
};

const AptVideoTour = ({ apt, lang }) => {
  if (!apt.vimeo_id) return null;
  const accentHex = apt.accent.replace('#', '');
  return (
    <section className="apt-video-tour" style={{ '--apt-accent': apt.accent }}>
      <div className="container">
        <span className="eyebrow apt-vt-eyebrow">{lang === 'es' ? 'Visita virtual' : 'Virtual tour'}</span>
        <h2 className="apt-vt-title">
          {lang === 'es' ? `Recorre ${apt[lang].name}` : `Tour ${apt[lang].name}`}
        </h2>
        <div className="apt-vt-wrap">
          <iframe
            className="apt-vt-iframe"
            src={`https://player.vimeo.com/video/${apt.vimeo_id}?autoplay=1&muted=1&dnt=1&color=${accentHex}&title=0&byline=0&portrait=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={apt[lang].name}
          />
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
                <source srcSet={o.hero_img.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp"/>
                <img decoding="async" src={o.hero_img} alt={d.name} className="apt-other-img" loading="lazy"/>
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
  return (
    <section className="apt-floorplan section-cream">
      <div className="container">
        <div className="eyebrow apt-fp-eyebrow">
          {lang === 'es' ? 'Distribución de Hestía' : 'Hestía layout'}
        </div>
        <h2 className="apt-fp-title">
          {lang === 'es'
            ? <>{apt.name_short}, <em>distribución del ático.</em></>
            : <>{apt.name_short}, <em>penthouse layout.</em></>}
        </h2>
        <p className="apt-fp-desc">
          {lang === 'es'
            ? 'El ático Thalassa se distribuye en una sola planta: salón, cocina, dos dormitorios, dos baños y terraza panorámica con vistas al mar y al Salar de los Canos.'
            : 'The Thalassa penthouse is laid out as a single open floor: living room, kitchen, two bedrooms, two bathrooms and a panoramic terrace with sea and Salar de los Canos views.'}
        </p>
        <div className="apt-fp-img-wrap reveal">
          <img decoding="async"
            src={apt.floorplan_img}
            alt={lang === 'es' ? `Plano de ${apt[lang].name}` : `Floor plan of ${apt[lang].name}`}
            className="apt-fp-img"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

// --- Descarga de guía protegida por PIN ---
//
// El PIN es fricción de UX, no seguridad real (sitio estático).
// Los PDFs se sirven desde assets/guides/{PIN}.pdf — la URL solo es
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
    success: '¡Descarga iniciada!',
  } : {
    eyebrow: 'Digital guide',
    title: `Download your ${apt.en.name} guide`,
    desc: 'Neighborhood recommendations, restaurants, coves, Hestía instructions and everything you need for your stay.',
    placeholder: 'Booking PIN',
    submit: 'Download PDF',
    helper: 'You will find the PIN in your booking confirmation.',
    error: 'Wrong PIN. Check your booking confirmation.',
    success: 'Download started!',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lee del DOM, no del state. En móvil, tipear el último carácter
    // y pulsar submit casi a la vez puede hacer que el setState del
    // onChange no haya committed todavía y `pin` sea el valor anterior.
    const liveValue = (inputRef.current && inputRef.current.value) || pin;
    const entered = liveValue.trim().toUpperCase();
    if (entered !== pin) setPin(entered);
    if (entered === expected) {
      setStatus('success');
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
              placeholder="HVX0000"
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
  // Cerrar — estado persistente por sesión (no por dominio).
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
              {lang === 'es' ? '✓ ¿mejor precio? te lo mejoramos' : '✓ better price? we beat it'}
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
      const k = 'hestia-guide-unlock-' + apt.id;
      if (sessionStorage.getItem(k) === '1') {
        sessionStorage.removeItem(k);
        return true;
      }
    } catch (e) {}
    return false;
  });
  const [renderGuide, setRenderGuide] = React.useState(false);
  const [phase, setPhase] = React.useState('idle');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = `${apt[lang].name} · Hestía Your Home · Vera Playa`;
  }, [lang]);

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
  // cuelgue del root. (apt.id es "vm/vt/vs" — usamos slug para CSS
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
    document.body.classList.toggle('apt-bar-shown', !!scrolled);
    return () => document.body.classList.remove('apt-bar-shown');
  }, [scrolled]);

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

  // Marca body.guide-open mientras la guía está activa — los widgets
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
            <AptPageHero apt={apt} lang={lang} scrolled={scrolled} mode={mode} />
            <TrustStrip apt={apt} lang={lang} />
            <FraseHogar lang={lang} />
            <AptPageDesc apt={apt} lang={lang} />
            <AptPageGallery apt={apt} lang={lang} />
            <AptVideoTour apt={apt} lang={lang} />
            <AptEquipamiento apt={apt} lang={lang} />
            <AptFloorPlan apt={apt} lang={lang} />
            <DirectBookingPerks lang={lang} />
            <AptCalendar aptId={aptId} lang={lang} accent={apt.accent} />
            {typeof AptGuideGate !== 'undefined' &&
              <AptGuideGate apt={apt} lang={lang} onUnlock={() => _vt(() => setGuideOpen(true))} />}
            <AptPageOthers apt={apt} lang={lang} />
            <QuickFAQ lang={lang} pageId={aptId} />
            <ContactCTA lang={lang} />
          </>
        )}
      </main>
      <Footer lang={lang} />
      {!showGuide && <AptStickyBar apt={apt} lang={lang} scrolled={scrolled} />}
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
