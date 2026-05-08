// ================================================================
// HESTÍA — Guía interactiva del huésped (web rebuild de los PDFs)
// Acceso protegido con PIN: HVM2016 (Mar) / HVT2019 (Thalassa) / HVS2021 (Salinas)
// El contenido proviene de los PDFs originales en docs/assets/*Hestia*Guia*
// ================================================================

const APT_GUIDE_PIN = { vm: 'HVM2016', vt: 'HVT2019', vs: 'HVS2021' };

// Mapa estancia → archivo de página renderizada del PDF.
// El layout de los 3 PDFs es idéntico: salón p8, cocina p9, dormitorios p10,
// baños p11, terraza p12, urbanización p13 (mapa) + p14 (zonas comunes).
const ROOM_PAGE = {
  salon: 'p-08.jpg',
  cocina: 'p-09.jpg',
  dormitorios: 'p-10.jpg',
  banos: 'p-11.jpg',
  terraza: 'p-12.jpg',
  urbanizacion: 'p-13.jpg',
};

// Contenido COMPARTIDO entre las 3 guías (carta de bienvenida, marca, etc.)
const GUIDE_SHARED = {
  es: {
    welcome: {
      title: 'Bienvenido a tu hogar',
      paras: [
        'Estábamos deseando que llegarás y, ¡por fin estás aquí!',
        'Muchas gracias por habernos elegido.',
        'Esperamos que el viaje haya sido genial. Ahora descansa, relájate y descubre tu hogar lejos de tu casa…',
      ],
      sign: 'Nuestros mejores deseos,',
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
      title: 'Welcome to your home',
      paras: [
        'We were looking forward to having you here, and here you are!',
        'Thank you for choosing us.',
        'We hope your trip was great. Now relax and discover your home away from home…',
      ],
      sign: 'Best wishes,',
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
    imageBase: 'assets/guides/vm',
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
    imageBase: 'assets/guides/vt',
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
    imageBase: 'assets/guides/vs',
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
// AptGuideView — vista completa de la guía (reemplaza la página al desbloquear)
// ================================================================
const AptGuideView = ({ apt, lang, onClose }) => {
  const s = GUIDE_SHARED[lang];
  const a = GUIDE_BY_APT[apt.id][lang];
  const aptInfo = GUIDE_BY_APT[apt.id];
  const aptName = apt[lang].name;

  React.useEffect(() => {
    document.body.classList.add('guide-mode');
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove('guide-mode');
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  const handlePrint = () => window.print();

  return (
    <article className="apt-guide-view" data-apt={apt.id} style={{ '--apt-accent': apt.accent, '--apt-accent2': apt.accent2 }}>
      <div className="ag-toolbar no-print">
        <div className="ag-toolbar-inner">
          <button className="ag-toolbar-back" onClick={onClose}>
            <span aria-hidden="true">←</span>
            <span>{lang === 'es' ? 'Volver al apartamento' : 'Back to apartment'}</span>
          </button>
          <div className="ag-toolbar-actions">
            <a className="ag-toolbar-pdf" href={aptInfo.pdf} target="_blank" rel="noopener">
              {lang === 'es' ? 'PDF original' : 'Original PDF'}
            </a>
            <button className="ag-toolbar-print" onClick={handlePrint}>
              <span aria-hidden="true">⇩</span>
              <span>{lang === 'es' ? 'Descargar PDF' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <header className="ag-cover" style={{ '--cover-img': `url(${aptInfo.imageBase}/p-01.jpg)` }}>
        <div className="ag-cover-bg" aria-hidden="true" />
        <div className="ag-cover-inner">
          <span className="ag-eyebrow">{lang === 'es' ? 'Guía del huésped' : 'Guest guide'}</span>
          <h1 className="ag-title">{aptName}</h1>
          <p className="ag-subtitle">{apt[lang].concept}</p>
          <p className="ag-cover-greeting">{s.welcome.title}</p>
        </div>
      </header>

      <section className="ag-section ag-welcome">
        <div className="ag-section-inner">
          {s.welcome.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
          <p className="ag-sign">{s.welcome.sign}</p>
          <p className="ag-signer">{s.welcome.signer}</p>
        </div>
      </section>

      <section className="ag-section ag-name">
        <div className="ag-section-inner">
          <h2 className="ag-h2">{s.name.title}</h2>
          {s.name.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
        </div>
      </section>

      <section className="ag-section ag-why">
        <div className="ag-section-inner">
          <h2 className="ag-h2">{s.why.title}</h2>
          {s.why.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
        </div>
      </section>

      <section className="ag-section ag-cleaning">
        <div className="ag-section-inner">
          <h2 className="ag-h2">{s.cleaning.title}</h2>
          <p className="ag-para">{s.cleaning.intro}</p>
          <p className="ag-note">{s.cleaning.note}</p>
          <ol className="ag-recs">
            {s.cleaning.recs.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </div>
      </section>

      <section className="ag-section ag-floorplan">
        <div className="ag-section-inner">
          <h2 className="ag-h2">{lang === 'es' ? 'Plano y equipamiento' : 'Floor plan and amenities'}</h2>
          <p className="ag-para">
            {lang === 'es'
              ? 'Una vista 3D del apartamento y el detalle del equipamiento que tienes a tu disposición.'
              : 'A 3D layout of the apartment and the details of every amenity at your disposal.'}
          </p>
          <figure className="ag-figure ag-figure-wide">
            <img src={`${aptInfo.imageBase}/p-07.jpg`} alt={lang === 'es' ? 'Plano del apartamento' : 'Apartment floor plan'} loading="lazy" />
          </figure>
        </div>
      </section>

      {a.rooms.map(room => {
        const roomPage = ROOM_PAGE[room.id];
        return (
          <section key={room.id} className={`ag-section ag-room ag-room-${room.id}`}>
            <div className="ag-section-inner ag-room-grid">
              <div className="ag-room-prose">
                <span className="ag-room-eyebrow">{aptName}</span>
                <h2 className="ag-h2">{room.title}</h2>
                <p className="ag-para">{room.body}</p>
                <div className="ag-recs-block">
                  <h3 className="ag-h3">{lang === 'es' ? 'Recomendaciones' : 'Recommendations'}</h3>
                  <ol className="ag-recs">
                    {room.recs.map((r, i) => <li key={i}>{r}</li>)}
                  </ol>
                </div>
              </div>
              {roomPage && (
                <figure className="ag-figure ag-room-photo">
                  <img src={`${aptInfo.imageBase}/${roomPage}`} alt={room.title} loading="lazy" />
                </figure>
              )}
              {room.id === 'urbanizacion' && (
                <figure className="ag-figure ag-figure-wide ag-urb-extra">
                  <img src={`${aptInfo.imageBase}/p-14.jpg`} alt={lang === 'es' ? 'Zonas comunes' : 'Common areas'} loading="lazy" />
                </figure>
              )}
            </div>
          </section>
        );
      })}

      <section className="ag-section ag-surroundings">
        <div className="ag-section-inner">
          <h2 className="ag-h2">{s.surroundings.title}</h2>
          <p className="ag-para">{s.surroundings.intro}</p>
          <ol className="ag-recs">
            {s.surroundings.sources.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
          <div className="ag-cats">
            {s.surroundings.categories.map(cat => (
              <div key={cat.title} className="ag-cat">
                <h3 className="ag-h3">{cat.title}</h3>
                <ul className="ag-list">
                  {cat.items.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="ag-restaurants">
            <h3 className="ag-h3">{s.surroundings.restaurants_title}</h3>
            <ol className="ag-list ag-list-num">
              {s.surroundings.restaurants.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </div>
        </div>
      </section>

      <section className="ag-section ag-phones">
        <div className="ag-section-inner">
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
        </div>
      </section>

      <section className="ag-section ag-feedback">
        <div className="ag-section-inner">
          <h2 className="ag-h2">{s.feedback.title}</h2>
          {s.feedback.paras.map((p, i) => <p key={i} className="ag-para">{p}</p>)}
        </div>
      </section>

      <footer className="ag-footer no-print">
        <button className="ag-toolbar-back" onClick={onClose}>
          <span aria-hidden="true">←</span>
          <span>{lang === 'es' ? 'Volver al apartamento' : 'Back to apartment'}</span>
        </button>
      </footer>
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
      setTimeout(() => { onUnlock(); setOpen(false); }, 250);
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
