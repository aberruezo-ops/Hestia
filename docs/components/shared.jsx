// ================================================================
// HESTÍA — componentes compartidos
// ================================================================

const HestiaLogoMark = ({ size = 40, color = '#3AAABB' }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
    {/* Dos columnas H serif */}
    <g fill={color}>
      <path d="M18 22 L32 22 L32 50 L32 56 L30 62 L30 98 L18 98 Z" />
      <path d="M88 22 L102 22 L102 98 L90 98 L90 62 L88 56 L88 50 Z" />
      {/* Remate superior (serif) */}
      <rect x="14" y="20" width="22" height="4" rx="1" />
      <rect x="84" y="20" width="22" height="4" rx="1" />
      <rect x="14" y="96" width="22" height="4" rx="1" />
      <rect x="84" y="96" width="22" height="4" rx="1" />
    </g>
    {/* Dos olas orgánicas (tejado + mediterráneo) */}
    <path d="M32 58 C 44 42, 60 42, 60 56 C 60 46, 78 46, 90 62"
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    <path d="M32 66 C 46 52, 60 52, 60 64 C 60 54, 76 54, 90 70"
          fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

const Wordmark = ({ size = 14, color }) => (
  <div style={{ textAlign: 'center', color }}>
    <div className="wordmark" style={{ fontSize: size }}>HESTÍA</div>
    <div className="your-home" style={{ fontSize: size * 0.62, marginTop: 2 }}>your home!</div>
  </div>
);

// Copy diccionario ES/EN
const COPY = {
  es: {
    nav: ['Inicio', 'Hestía Mar', 'Hestía Thalassa', 'Hestía Salinas', 'Nosotros', 'Opiniones', 'Contacto', 'Noticias'],
    cta_nav: 'Reserva',
    hero_title_1: 'Bienvenido a tu hogar',
    hero_title_2: 'lejos de casa.',
    hero_sub: 'Vera Playa · Almería · desde 2016',
    hero_cta_1: 'Descubre los apartamentos',
    hero_cta_avail: 'Comprobar disponibilidad',
    hero_cta_nosotros: 'Sobre nosotros y Hestía',
    hero_cta_2: 'Escríbenos',
    scroll_hint: 'Desliza para despertar',
    hero_meta_right: 'Noche mediterránea — 36.96° N, 1.83° W',
    bridge_title: '…y amanece sobre Vera Playa.',
    bridge_sub: 'La noche morada se retira despacio. El alba trae el albero — tierra, pared encalada, sal seca. A las siete, el Mediterráneo abre el ojo en teal y los olivos reciben la luz de costado. Al fondo, el Desierto de Tabernas ya es naranja.',
    apts_eyebrow: 'Nuestros tres apartamentos',
    apts_title: (<>Tres atmósferas, <em>una misma casa.</em></>),
    apts_sub: 'Cada uno toma su color del paisaje que lo rodea. Elige el tuyo — o ven tres veces.',
    apt_01_concept: 'El campo de olivos llega al mar',
    apt_02_concept: 'El ático sobre el mar y el Salar de los Canos',
    apt_03_concept: 'El amarillo albero del amanecer sobre las salinas',
    apt_cta: 'Ver apartamento',
    compare_eyebrow: 'Compara · Elige · Reserva',
    compare_title: (<>Tres puertas distintas al <em>mismo Mediterráneo.</em></>),
    counters_eyebrow: 'Diez años · una playa · vuestra casa',
    days_unit: 'días',
    counter_1: 'familias han vivido aquí desde 2016',
    counter_2: 'días de sol al año en Vera Playa',
    counter_3: 'apartamentos gestionados en persona por Alex y Fran',
    gallery_eyebrow: 'Postales desde Vera',
    gallery_title: (<>La luz de Almería <em>cuenta la historia.</em></>),
    team_eyebrow: 'Quienes os reciben',
    team_title: (<>No somos una recepción. <em>Somos Alex y Fran.</em></>),
    team_intro: 'En 2016 convertimos tres apartamentos en Hestía — la diosa griega del hogar. Diez años después seguimos limpiando, recibiendo, respondiendo WhatsApp y eligiendo las toallas. Todo lo hacemos nosotros, por eso todo importa.',
    alex_role: 'Creativo · Pre-estancia · Reservas',
    alex_quote: '«A ti, antes de que llegues, te lo cuento todo. Después, cuando te vayas, te echaré de menos.»',
    fran_role: 'Técnico · In-estancia · Bookings EN',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',
    manifest_eyebrow: 'El huésped colaborativo',
    manifest_title: (<>Hestía no es solo un alquiler: <em>se vive, invita a ser cuidado, se comparte…</em></>),
    manifest_p1: 'Si lo usas, lo repones.',
    manifest_p2: 'Si lo rompes, lo dices.',
    manifest_p3: 'Lo tratas como si fuera tuyo.',
    manifest_p4: 'Nosotros también nos ocupamos.',
    manifest_quote: '«Deja esto como te hubiera gustado encontrarlo. Porque alguien, antes que tú, lo hizo.»',
    ratings_eyebrow: 'Lo que dicen de nosotros',
    ratings_title: (<>Diez años puntuando <em>casi perfecto.</em></>),
    ratings_sub: 'No es un eslogan. Son cifras verificadas por las plataformas, escritas por las familias que han dormido aquí.',
    rating_booking_desc: 'Valoración Booking.com — promedio de nuestros tres apartamentos.',
    rating_airbnb_desc: 'Superhost desde 2018. Puntuación máxima ininterrumpida.',
    rating_google_desc: 'Google Maps — opiniones de huéspedes que volvieron a Vera.',
    contact_eyebrow: 'Reserva directa, sin intermediarios',
    contact_title: (<>Escríbenos. Te responde <em>una persona.</em></>),
    contact_sub: 'Alex en español, Fran en inglés. WhatsApp, teléfono o email — sin formularios eternos, sin bots, sin comisiones.',
    contact_cta_wa: 'WhatsApp Alex',
    contact_cta_mail: 'info@hestiayourhome.com',
    contact_cta_avail: 'Comprobar disponibilidad',
    footer_apts: 'Apartamentos',
    footer_hestia: 'Hestía',
    footer_contacto: 'Contacto',
    footer_tag: 'Tu hogar en Vera Playa, desde 2016.',
  },
  en: {
    nav: ['Home', 'Hestía Mar', 'Hestía Thalassa', 'Hestía Salinas', 'About us', 'Reviews', 'Contact', 'News'],
    cta_nav: 'Book',
    hero_title_1: 'Welcome to your home',
    hero_title_2: 'away from home.',
    hero_sub: 'Vera Playa · Almería · since 2016',
    hero_cta_1: 'Discover the apartments',
    hero_cta_avail: 'Check availability',
    hero_cta_nosotros: 'About us & Hestía',
    hero_cta_2: 'Say hello',
    scroll_hint: 'Scroll to wake up',
    hero_meta_right: 'Mediterranean night — 36.96° N, 1.83° W',
    bridge_title: '…and morning breaks over Vera Playa.',
    bridge_sub: 'The purple night slowly withdraws. Dawn brings the ochre — earth, whitewashed wall, dried salt. By seven, the Mediterranean opens its eye in teal, the olive trees catch the side-light. In the distance, the Tabernas Desert is already orange.',
    apts_eyebrow: 'Our three apartments',
    apts_title: (<>Three moods, <em>one same home.</em></>),
    apts_sub: 'Each one borrows its colour from the landscape around it. Choose yours — or come three times.',
    apt_01_concept: 'Where the olive grove meets the sea',
    apt_02_concept: 'Penthouse above the sea and the Salar de los Canos',
    apt_03_concept: 'Ochre yellow, sunrise over the salt flats',
    apt_cta: 'See apartment',
    compare_eyebrow: 'Compare · Choose · Book',
    compare_title: (<>Three doors onto the <em>same Mediterranean.</em></>),
    counters_eyebrow: 'Ten years · one beach · your home',
    days_unit: 'days',
    counter_1: 'families have lived here since 2016',
    counter_2: 'days of sunshine a year in Vera Playa',
    counter_3: 'apartments run in person by Alex & Fran',
    gallery_eyebrow: 'Postcards from Vera',
    gallery_title: (<>Almería's light <em>tells the story.</em></>),
    team_eyebrow: 'The hosts',
    team_title: (<>Not a front desk. <em>Just Alex & Fran.</em></>),
    team_intro: 'In 2016 we turned three apartments into Hestía — the Greek goddess of home. Ten years later we still clean, welcome, reply WhatsApp and choose the towels. We do everything ourselves — that is why it all matters.',
    alex_role: 'Creative · Pre-stay · Bookings',
    alex_quote: '«Before you arrive, I will tell you everything. After you leave, I will miss you a little.»',
    fran_role: 'Technical · In-stay · English bookings',
    fran_quote: '«If anything breaks, calls, or changes — I am here. Your stay, my job.»',
    manifest_eyebrow: 'The collaborative guest',
    manifest_title: (<>Hestía isn’t just a rental: <em>it’s lived in, cared for, shared…</em></>),
    manifest_p1: 'Use it, replace it.',
    manifest_p2: 'Break it, tell us.',
    manifest_p3: 'Treat it as if it were yours.',
    manifest_p4: 'We do our part too.',
    manifest_quote: '«Leave this as you would have liked to find it. Because someone, before you, did.»',
    ratings_eyebrow: 'What they say about us',
    ratings_title: (<>Ten years scoring <em>almost perfect.</em></>),
    ratings_sub: 'Not a slogan. Verified numbers from the platforms, written by the families who slept here.',
    rating_booking_desc: 'Booking.com average — across our three apartments.',
    rating_airbnb_desc: 'Superhost since 2018. Top score, uninterrupted.',
    rating_google_desc: 'Google Maps — reviews from guests who came back to Vera.',
    contact_eyebrow: 'Direct booking, no middlemen',
    contact_title: (<>Write to us. A <em>real person</em> replies.</>),
    contact_sub: 'Alex in Spanish, Fran in English. WhatsApp, phone or email — no endless forms, no bots, no commissions.',
    contact_cta_wa: 'WhatsApp Alex',
    contact_cta_mail: 'info@hestiayourhome.com',
    contact_cta_avail: 'Check availability',
    footer_apts: 'Apartments',
    footer_hestia: 'Hestía',
    footer_contacto: 'Contact',
    footer_tag: 'Your home in Vera Playa, since 2016.',
  }
};

// Hooks compartidos — disponibles en todas las páginas
const useScrollMode = () => {
  const [mode, setMode] = React.useState('night');
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      setScrolled(y > 40);
      if (y < h * 0.85) setMode('night');
      else setMode('day');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return { mode, scrolled };
};

const useReveal = () => {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const BRIDGE_PALETTE = [
  { hex: '#2A0F2E', es: 'Noche · morada',    en: 'Night · purple' },
  { hex: '#7B3B6B', es: 'Alba · violeta',    en: 'Dawn · violet' },
  { hex: '#C8975A', es: 'Día · albero',      en: 'Day · ochre' },
  { hex: '#246B6E', es: 'Mar · teal',        en: 'Sea · teal' },
  { hex: '#8B4A1E', es: 'Desierto · naranja',en: 'Desert · orange' },
];

const QUICK_FAQ = {
  home: {
    es: [
      { q: '¿Cómo reservo directamente?',
        a: <>Escríbenos por <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. Sin intermediarios, sin comisiones. O usa el formulario en <a href="reservas.html">nuestra página de reservas</a>.</> },
      { q: '¿Puedo llevar a mi perro?',
        a: <>Sí, en los tres apartamentos. Las mascotas son bienvenidas siempre bajo petición previa y con suplemento, respetando unas condiciones básicas en el apartamento, en las zonas comunes y en los espacios públicos. Avísanos al reservar.</> },
      { q: '¿Cuál apartamento me conviene más?',
        a: <>Compara los tres en <a href="index.html">nuestra home</a>. <a href="mar.html">Mar</a> es planta primera con jardín, terraza de amanecer y mascotas. <a href="thalassa.html">Thalassa</a> es el ático con SPA comunitario y vistas panorámicas al mar. <a href="salinas.html">Salinas</a> tiene tres piscinas y el Parque Natural al lado.</> },
      { q: '¿Quiénes sois Alex y Fran?',
        a: <><a href="nosotros.html">Somos los propietarios</a>, no una agencia. Gestionamos los tres apartamentos en persona desde 2016. Más de 900 familias nos avalan.</> },
    ],
    en: [
      { q: 'How do I book directly?',
        a: <>Write to us via <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. No middlemen, no commissions. Or use the form on <a href="reservas.html">our reservations page</a>.</> },
      { q: 'Can I bring my dog?',
        a: <>Yes, in all three apartments. Pets are welcome on request and with a supplement, as long as basic conditions are respected inside the apartment, in the communal areas and in public spaces. Just let us know when booking.</> },
      { q: 'Which apartment suits me best?',
        a: <>Compare all three on <a href="index.html">our home page</a>. <a href="mar.html">Mar</a> is first floor with garden, sunrise terrace and pets. <a href="thalassa.html">Thalassa</a> is the penthouse with shared SPA and panoramic sea views. <a href="salinas.html">Salinas</a> has three pools and the Nature Park next door.</> },
      { q: 'Who are Alex and Fran?',
        a: <><a href="nosotros.html">We are the owners</a>, not an agency. We have run the three apartments in person since 2016. Over 900 families back us.</> },
    ],
  },
  vm: {
    es: [
      { q: '¿Por qué elegiría Hestía Mar sobre los otros dos?',
        a: <>Mar es planta primera, con acceso al jardín y a la piscina comunitaria. Al ser un apartamento de esquina da a tres calles distintas: hacia el mar, hacia los lados y hacia la zona de entrada — lo que permite ventilación cruzada natural en todo el apartamento. La terraza de 20m² está orientada al amanecer, pero desde ella ves el ciclo solar completo. El más íntimo y sereno de los tres.</> },
      { q: '¿Puedo traer a mi perro (o gato)?',
        a: <>Sí, las mascotas son bienvenidas en los tres apartamentos, siempre bajo petición previa y con suplemento. Solo pedimos que se respeten unas condiciones básicas y sensatas: dentro del apartamento, en las zonas comunes de la urbanización y en los espacios públicos. Avísanos al reservar.</> },
      { q: '¿El jacuzzi está disponible durante mi estancia?',
        a: <>El jacuzzi es comunitario y está abierto durante la temporada de verano, igual que la piscina. Si tienes dudas sobre tus fechas concretas, pregúntanos antes de reservar.</> },
      { q: '¿A qué distancia está la playa?',
        a: <>Unos 300 metros a pie desde la salida de la urbanización — cinco minutos máximo hasta pisar la arena. La playa de Vera Playa es larga, tranquila y de arena fina.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Mar over the other two?',
        a: <>Mar is a first-floor corner apartment with access to the garden and shared pool. Being a corner unit facing three different streets — sea side, lateral and entrance — it has natural cross-ventilation throughout. The 20m² terrace faces the sunrise, but from it you can follow the entire arc of the sun. The most intimate and serene of the three.</> },
      { q: 'Can I bring my dog (or cat)?',
        a: <>Yes, pets are welcome in all three apartments, always on request and with a supplement. We simply ask that basic conditions are respected: inside the apartment, in the communal areas of the complex, and in public spaces. Let us know when booking.</> },
      { q: 'Is the jacuzzi available during my stay?',
        a: <>The jacuzzi is a shared facility, open during the summer season — just like the pool. If you have doubts about your specific dates, ask us before booking.</> },
      { q: 'How far is the beach?',
        a: <>About 300 metres on foot from the complex exit — five minutes at most to reach the sand. Vera Playa beach is long, quiet and fine-sand.</> },
    ],
  },
  vt: {
    es: [
      { q: '¿Por qué elegiría Hestía Thalassa sobre los otros dos?',
        a: <>Thalassa es el ático, el piso más alto de la urbanización. La terraza panorámica tiene vistas al Mediterráneo y al Salar de los Canos — el paisaje más abierto y luminoso de los tres. Además, la urbanización cuenta con SPA comunitario (con sauna), piscina y pistas de pádel.</> },
      { q: '¿Cómo funciona el SPA de la urbanización?',
        a: <>El SPA es comunitario y está abierto en otoño, invierno y primavera. En verano permanece cerrado, aunque el gimnasio permanece abierto todo el año. El SPA también dispone de sauna.</> },
      { q: '¿Qué vistas tiene la terraza del ático?',
        a: <>Desde la terraza panorámica ves el Mediterráneo y, hacia el interior, el Salar de los Canos — un paisaje árido y de gran belleza. La zona tiene una luz y una aridez espectaculares. El Desierto de Tabernas propiamente dicho está a unos 30 minutos en coche.</> },
      { q: '¿Puedo traer mascotas?',
        a: <>Sí, en los tres apartamentos. Siempre bajo petición previa y con un pequeño suplemento. Solo pedimos que se respeten unas normas básicas y sensatas: que no suban a sofás, sillones ni camas, y que no hagan sus necesidades en zonas comunes ni en el apartamento.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Thalassa over the other two?',
        a: <>Thalassa is the penthouse — the highest floor in the complex. The panoramic terrace looks out over the Mediterranean and the Salar de los Canos: the most open and light-filled view of the three. The complex also has a shared SPA (with sauna), pool and padel courts.</> },
      { q: 'How does the shared SPA work?',
        a: <>The SPA is a communal facility, open in autumn, winter and spring. It closes during the summer, although the gym stays open all year round. There is also a sauna.</> },
      { q: 'What can you see from the penthouse terrace?',
        a: <>From the panoramic terrace you look out over the Mediterranean and, inland, the Salar de los Canos — an arid, strikingly beautiful landscape. The area is dramatic and dry. The Tabernas Desert proper is about 30 minutes by car.</> },
      { q: 'Can I bring pets?',
        a: <>Yes, in all three apartments. Always on request and with a small supplement. We just ask that basic rules are respected: pets should not get on sofas, armchairs or beds, and must not relieve themselves in the apartment or in communal areas.</> },
    ],
  },
  vs: {
    es: [
      { q: '¿Por qué elegiría Hestía Salinas sobre los otros dos?',
        a: <>Salinas es el más luminoso de los tres. Dos terrazas, tres piscinas, gimnasio, sauna y pistas de pádel comunitarios, y el Parque Natural de las Salinas de Puerto Rey a la vuelta de la esquina con acceso peatonal directo. La luz dorada de Almería llena cada habitación — y la naturaleza empieza donde termina la acera.</> },
      { q: '¿Qué son las Salinas de Puerto Rey?',
        a: <>Un Parque Natural a pocos metros del apartamento, con flamencos, aves migratorias y una luz dorada al amanecer única en Europa. Una de las razones por las que este apartamento tiene algo que los demás no tienen.</> },
      { q: '¿Hay de verdad tres piscinas?',
        a: <>Sí. La urbanización tiene tres piscinas comunitarias — no una sola dividida, sino tres zonas diferenciadas con orientaciones distintas. Además hay gimnasio y sauna comunitarios (abiertos todo el año) y pistas de pádel. Una de las urbanizaciones mejor equipadas de Vera Playa.</> },
      { q: '¿Puedo traer mascotas?',
        a: <>Sí, en los tres apartamentos. Siempre bajo petición previa y con suplemento, respetando unas condiciones básicas en el apartamento, en las zonas comunes y en los espacios públicos.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Salinas over the other two?',
        a: <>Salinas is the brightest of the three. Two terraces, three pools, a communal gym, sauna and padel courts, and the Puerto Rey Salt-flat Nature Park around the corner with direct pedestrian access. Almería's golden afternoon light fills every room — and nature begins where the pavement ends.</> },
      { q: 'What is the Puerto Rey Nature Park?',
        a: <>A natural park a few metres from the apartment, with flamingos, migratory birds and a golden light at sunrise unique in Europe. One of the reasons this apartment has something the others don't.</> },
      { q: 'Are there really three pools?',
        a: <>Yes. The complex has three community pools — not one divided, but three separate areas with different orientations. There is also a communal gym and sauna (open year-round) and padel courts. One of the best-equipped complexes in Vera Playa.</> },
      { q: 'Can I bring pets?',
        a: <>Yes, in all three apartments. Always on request and with a supplement, as long as basic conditions are respected inside the apartment, in the communal areas and in public spaces.</> },
    ],
  },
  nosotros: {
    es: [
      { q: '¿Desde cuándo lo hacéis vosotros mismos?',
        a: <>Desde 2016. En diez años hemos recibido a más de 900 familias. Nunca hemos externalizado la gestión: seguimos limpiando, respondiendo y eligiendo las toallas nosotros. <a href="nosotros.html">Conoce nuestra historia.</a></> },
      { q: '¿Por qué se llaman los apartamentos Hestía?',
        a: <>Hestía era la diosa griega del hogar — la diosa pacífica, la que guardaba el fuego de casa. Eso es lo que intentamos hacer: que un apartamento deje de ser un sitio donde dormir y se convierta en un lugar donde quedarse.</> },
      { q: '¿Hay alguna agencia o gestor detrás?',
        a: <>No. Somos Alex y Fran. No hay agencia, no hay gestor, no hay centralita. Cuando nos escribes, nos escribes a nosotros directamente.</> },
      { q: '¿Qué pasa si algo falla durante mi estancia?',
        a: <>Fran se encarga de todo lo técnico in situ. Está disponible, responde rápido y resuelve. No hay que esperar a que abra ninguna oficina. Su número: <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp Fran</a>.</> },
    ],
    en: [
      { q: 'How long have you been managing the apartments yourselves?',
        a: <>Since 2016. In ten years we have hosted over 900 families. We have never outsourced management: we still clean, reply and choose the towels ourselves. <a href="nosotros.html">Read our story.</a></> },
      { q: "Why are the apartments called Hestía?",
        a: <>Hestía was the Greek goddess of the hearth — the peaceful goddess, guardian of the home fire. That is what we try to do: turn an apartment from a place to sleep into a place you want to stay.</> },
      { q: 'Is there an agency or property manager behind you?',
        a: <>No. We are Alex and Fran. No agency, no manager, no call centre. When you write to us, you are writing to us directly.</> },
      { q: 'What happens if something goes wrong during my stay?',
        a: <>Fran handles everything technical on-site. He is available, replies quickly and fixes things. No need to wait for an office to open. His number: <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp Fran</a>.</> },
    ],
  },
  opiniones: {
    es: [
      { q: '¿Estas valoraciones son reales y verificadas?',
        a: <>Sí. Las puntuaciones de Booking.com, Airbnb y Google Maps son verificadas por las propias plataformas — solo pueden valorar quienes han completado una estancia real. No podemos modificarlas.</> },
      { q: '¿Sois realmente Superhost en Airbnb?',
        a: <>Sí, desde 2018 de forma ininterrumpida. El estatus Superhost se revisa cada trimestre y requiere mantener puntuación máxima y tiempo de respuesta alto de forma continua. No es un título que se queda para siempre.</> },
      { q: '¿Qué es lo que más valoran los huéspedes?',
        a: <>La atención personal de Alex y Fran, la limpieza y el estado de los apartamentos, y la ubicación. Y que cuando algo falla, se resuelve de verdad — no se pone una excusa.</> },
      { q: '¿Cómo dejo una reseña tras mi estancia?',
        a: <>En Booking.com, Airbnb o Google Maps, según donde hayas reservado. También puedes escribirnos directamente — nos alegra saber cómo fue la experiencia.</> },
    ],
    en: [
      { q: 'Are these ratings real and verified?',
        a: <>Yes. Scores on Booking.com, Airbnb and Google Maps are verified by the platforms themselves — only guests who have completed a real stay can leave a review. We cannot modify them.</> },
      { q: 'Are you really a Superhost on Airbnb?',
        a: <>Yes, continuously since 2018. Superhost status is reviewed every quarter and requires maintaining top scores and response times consistently. It is not a title that stays forever.</> },
      { q: 'What do guests value most?',
        a: <>The personal attention from Alex and Fran, cleanliness and condition of the apartments, and location. And that when something goes wrong, it genuinely gets fixed — no excuses.</> },
      { q: 'How do I leave a review after my stay?',
        a: <>On Booking.com, Airbnb or Google Maps, depending on where you booked. You can also write to us directly — we love hearing how the experience went.</> },
    ],
  },
  reservas: {
    es: [
      { q: '¿Es mejor reservar directo que por Booking o Airbnb?',
        a: <>Sí. El precio es igual o mejor que cualquier plataforma, sin comisiones. Y hablas directamente con nosotros, no con un bot ni un formulario automático. <a href="reservas.html">Reserva aquí.</a></> },
      { q: '¿Cuánto tardáis en confirmar la reserva?',
        a: <>Menos de 24 horas. En la mayoría de los casos respondemos el mismo día — y en muchos casos, en menos de una hora.</> },
      { q: '¿Qué pasa si necesito cambiar las fechas?',
        a: <>Escríbenos. Somos flexibles con cambios y cancelaciones siempre que se puedan gestionar. No hay que batallar con ninguna plataforma — es una conversación entre personas.</> },
      { q: '¿Tenéis política de cancelación?',
        a: <>Sí. Te la explicamos al confirmar la reserva, según la temporada y las fechas. Si tienes dudas antes de reservar, pregúntanos sin compromiso.</> },
    ],
    en: [
      { q: 'Is it better to book directly than through Booking or Airbnb?',
        a: <>Yes. The price is the same or better, with no platform commissions. And you speak directly with us, not a bot or automatic form. <a href="reservas.html">Book here.</a></> },
      { q: 'How long does confirmation take?',
        a: <>Under 24 hours. In most cases we reply the same day — and often in under an hour.</> },
      { q: 'What if I need to change my dates?',
        a: <>Write to us. We are flexible with changes and cancellations as long as they can be managed. No need to fight with a platform — it is a conversation between people.</> },
      { q: 'Do you have a cancellation policy?',
        a: <>Yes. We explain it when we confirm your booking, depending on the season and dates. If you have doubts before booking, just ask — no commitment.</> },
    ],
  },
};

const QuickFAQ = ({ lang, pageId = 'home' }) => {
  const page = QUICK_FAQ[pageId] || QUICK_FAQ.home;
  const faqs = page[lang];
  const [open, setOpen] = React.useState(null);
  return (
    <section className="quick-faq section-cream">
      <div className="container">
        <div className="eyebrow qfaq-eyebrow">
          {lang === 'es' ? 'Preguntas frecuentes' : 'Frequently asked questions'}
        </div>
        <div className="qfaq-grid">
          {faqs.map((f, i) => (
            <div key={i} className={`qfaq-item ${open === i ? 'open' : ''}`}>
              <button className="qfaq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <span className="qfaq-chevron">{open === i ? '−' : '+'}</span>
              </button>
              <div className="qfaq-a">{f.a}</div>
            </div>
          ))}
        </div>
        <div className="qfaq-more">
          <a href="contacto.html" className="btn btn-ghost-dark">
            {lang === 'es' ? 'Más preguntas →' : 'More questions →'}
          </a>
        </div>
      </div>
    </section>
  );
};

const SABIAS_QUE_FACTS = [
  /* ── Almería y Vera Playa ── */
  {
    type: 'fact',
    es: 'Almería recibe más de 3.000 horas de sol al año — casi el doble que la media europea.',
    en: 'Almería receives over 3,000 hours of sunshine a year — almost twice the European average.',
  },
  {
    type: 'fact',
    es: 'Almería tiene más días de sol al año que cualquier capital de Europa, incluidas Atenas y Lisboa.',
    en: 'Almería has more sunny days per year than any European capital — including Athens and Lisbon.',
  },
  {
    type: 'fact',
    es: '"Almería" viene del árabe Al-Mariyya — "el espejo del mar".',
    en: '"Almería" comes from the Arabic Al-Mariyya — meaning "the mirror of the sea".',
  },
  {
    type: 'fact',
    es: 'El Desierto de Tabernas, a 30 minutos de Vera Playa, es el único desierto auténtico de Europa occidental.',
    en: 'The Tabernas Desert, 30 minutes from Vera Playa, is the only true desert in Western Europe.',
  },
  {
    type: 'fact',
    es: 'Almería fue escenario de más de 400 producciones cinematográficas, incluyendo los westerns más icónicos de Sergio Leone.',
    en: 'Almería was the filming location for over 400 productions, including Sergio Leone\'s most iconic westerns.',
  },
  {
    type: 'fact',
    es: 'Almería es la única provincia española con clima desértico reconocido oficialmente por la Organización Meteorológica Mundial.',
    en: 'Almería is the only Spanish province with a desert climate officially recognised by the World Meteorological Organization.',
  },
  {
    type: 'fact',
    es: 'Vera Playa fue la primera playa naturista autorizada de España, en 1979.',
    en: 'Vera Playa was the first officially authorised naturist beach in Spain, in 1979.',
  },
  {
    type: 'fact',
    es: 'El paseo marítimo de Vera Playa tiene casi 3 kilómetros sin coches — uno de los más largos del litoral mediterráneo español.',
    en: 'The Vera Playa promenade stretches nearly 3 kilometres without a car — one of the longest on the Spanish Mediterranean coast.',
  },
  {
    type: 'fact',
    es: 'La temperatura media del Mediterráneo en Vera supera los 26 °C en verano — más cálida que en Mallorca o la Costa Brava.',
    en: 'The Mediterranean at Vera averages over 26 °C in summer — warmer than Mallorca or the Costa Brava.',
  },
  {
    type: 'fact',
    es: 'El Mediterráneo en Vera Playa alcanza hasta 28 °C en agosto — más cálido que el Caribe en esas fechas.',
    en: 'The Mediterranean at Vera Playa reaches up to 28 °C in August — warmer than the Caribbean at that time of year.',
  },
  {
    type: 'fact',
    es: 'Los 300 kilómetros de costa almeriense incluyen más de 70 playas, muchas de ellas sin urbanizar y sin banderas azules por elección propia.',
    en: 'Almería\'s 300 kilometres of coastline include over 70 beaches, many of them undeveloped and deliberately without blue flags.',
  },
  /* ── Cabo de Gata y naturaleza ── */
  {
    type: 'fact',
    es: 'El Parque Natural Cabo de Gata-Níjar recibe menos de 200 mm de lluvia al año — la aridez más extrema de Europa continental.',
    en: 'The Cabo de Gata-Níjar Natural Park receives less than 200 mm of rain a year — the most extreme aridity on mainland Europe.',
  },
  {
    type: 'fact',
    es: 'El fondo marino de Cabo de Gata alberga la mayor pradera de posidonia oceánica del Mediterráneo occidental, declarada patrimonio de interés europeo.',
    en: 'The seabed of Cabo de Gata holds the largest posidonia meadow in the western Mediterranean, declared a European heritage site.',
  },
  {
    type: 'fact',
    es: 'El Parque Natural Cabo de Gata tiene más de 1.000 especies vegetales, 200 de ellas endémicas del sur de España.',
    en: 'The Cabo de Gata Natural Park has over 1,000 plant species, 200 of them endemic to southern Spain.',
  },
  {
    type: 'fact',
    es: 'Los fondos de Vera Playa son hábitat del caballito de mar mediterráneo — una de las especies más protegidas del litoral español.',
    en: 'The waters off Vera Playa are habitat for the Mediterranean seahorse — one of the most protected species on the Spanish coast.',
  },
  /* ── Historia y gastronomía ── */
  {
    type: 'fact',
    es: 'Las Salinas de Puerto Rey albergan colonias de flamencos rosas que llegan cada año desde el norte de África.',
    en: 'The Puerto Rey salt flats host pink flamingo colonies that arrive each year from North Africa.',
  },
  {
    type: 'fact',
    es: 'Las Salinas de Puerto Rey fueron explotadas por los romanos hace más de 2.000 años para elaborar el garum, la salsa más valiosa de la antigüedad.',
    en: 'The Puerto Rey salt flats were worked by the Romans over 2,000 years ago to produce garum — the most prized condiment of antiquity.',
  },
  {
    type: 'fact',
    es: 'El olivar que inspira a Hestía Mar lleva siglos en la costa de Vera. El aceite de oliva de Almería ya se exportaba en época fenicia.',
    en: 'The olive grove behind Hestía Mar has stood on the Vera coast for centuries. Almería\'s olive oil was already exported in Phoenician times.',
  },
  {
    type: 'fact',
    es: 'La mojama de atún de Garrucha — a pocos kilómetros de Vera — es una de las conservas más antiguas del Mediterráneo, con más de 2.000 años de tradición.',
    en: 'The tuna mojama from Garrucha — a few kilometres from Vera — is one of the Mediterranean\'s oldest preserved foods, with over 2,000 years of tradition.',
  },
  {
    type: 'fact',
    es: 'La uva moscatel almeriense fue descrita por los viajeros árabes del siglo X como "la reina de todas las frutas".',
    en: 'The Almería muscat grape was described by Arab travellers in the 10th century as "the queen of all fruits".',
  },
  /* ── Hestía: lo que otros no tienen ── */
  {
    type: 'fact',
    es: 'Hestía lleva más de diez años con puntuación máxima ininterrumpida en Booking.com, Airbnb y Google Maps — algo que menos del 1 % de los apartamentos con huéspedes de España mantiene durante tanto tiempo.',
    en: 'Hestía has held top scores on Booking.com, Airbnb and Google Maps for over ten years — something fewer than 1% of guest apartments in Spain sustain for that long.',
  },
  {
    type: 'fact',
    es: 'Al reservar directamente con Hestía, el precio es igual o mejor que en Booking o Airbnb — y hablas con los propietarios, no con una centralita ni un bot.',
    en: 'Booking directly with Hestía gives you the same price or better than Booking or Airbnb — and you speak with the owners, not a call centre or a bot.',
  },
  {
    type: 'fact',
    es: 'Hestía Thalassa es el único ático de la colección. Desde su terraza panorámica se tienen las vistas más abiertas al Mediterráneo y al Salar de los Canos de toda la urbanización.',
    en: 'Hestía Thalassa is the only penthouse in the collection. Its panoramic terrace has the most open views of the Mediterranean and the Salar de los Canos in the entire complex.',
  },
  {
    type: 'fact',
    es: 'Las mascotas son bienvenidas en los tres apartamentos Hestía, bajo petición previa y con suplemento, respetando unas condiciones básicas.',
    en: 'Pets are welcome in all three Hestía apartments, on request and with a supplement, as long as basic conditions are respected.',
  },
  {
    type: 'fact',
    es: 'Más de 900 familias han dormido en Hestía desde 2016. Más del 40 % repite — sin necesidad de ninguna oferta ni descuento.',
    en: 'Over 900 families have stayed at Hestía since 2016. More than 40% return — with no offer or discount needed.',
  },
  {
    type: 'fact',
    es: 'Los huéspedes de Hestía reciben, al reservar, una guía personalizada de Alex o Fran con restaurantes, playas secretas y rutas que no aparecen en ninguna guía turística.',
    en: 'Hestía guests receive, on booking, a personalised guide from Alex or Fran with restaurants, hidden beaches and routes that appear in no travel guide.',
  },
  {
    type: 'fact',
    es: 'Hestía Salinas es uno de los pocos apartamentos del litoral mediterráneo con acceso peatonal directo a un parque natural protegido desde la puerta.',
    en: 'Hestía Salinas is one of very few apartments on the Mediterranean coast with direct pedestrian access to a protected natural park from the front door.',
  },
  {
    type: 'fact',
    es: 'Los cambios de fecha y cancelaciones en Hestía se gestionan directamente con Alex o Fran — una conversación, no un formulario ni una política automática.',
    en: 'Date changes and cancellations at Hestía are handled directly with Alex or Fran — a conversation, not a form or an automated policy.',
  },
];

const FRASES_HOGAR = [
  {
    type: 'quote',
    es: '«El hogar no es un lugar. Es un sentimiento.»',
    en: '«Home is not a place. It is a feeling.»',
    attr: '— Cecelia Ahearn',
  },
  {
    type: 'quote',
    es: '«El hogar es donde está el corazón.»',
    en: '«Home is where the heart is.»',
    attr: '— Plinio el Viejo',
  },
  {
    type: 'quote',
    es: '«No hay lugar como el hogar.»',
    en: '«There is no place like home.»',
    attr: '— L. Frank Baum, El Mago de Oz',
  },
  {
    type: 'quote',
    es: '«El hogar es el refugio del alma.»',
    en: '«The home is the refuge of the soul.»',
    attr: '— Gaston Bachelard',
  },
  {
    type: 'quote',
    es: '«Donde haya amor, allí está el hogar.»',
    en: '«Where there is love, there is home.»',
    attr: '— Leon Tolstoy',
  },
  {
    type: 'quote',
    es: '«Una casa se construye con ladrillos y vigas; un hogar se edifica con amor y sueños.»',
    en: '«A house is made of walls and beams; a home is built with love and dreams.»',
    attr: '— William Arthur Ward',
  },
  {
    type: 'quote',
    es: '«El buen huésped deja el lugar mejor de como lo encontró.»',
    en: '«A good guest leaves a place better than they found it.»',
    attr: '— Proverbio / Proverb',
  },
  {
    type: 'quote',
    es: '«Volver a casa es la forma más agradable de viajar.»',
    en: '«Returning home is the sweetest of all journeys.»',
    attr: '— Fanny Burney',
  },
  {
    type: 'quote',
    es: '«Necesito el mar porque me enseña. No sé si aprendo música o conciencia: no sé si es ola sola o ser profundo, o sólo ronca voz o deslumbrante suposición de peces y navíos.»',
    en: '«I need the sea because it teaches me. I don\'t know if I learn music or awareness, if it is wave alone or deep being, or only hoarse voice or dazzling assumption of fish and ships.»',
    attr: '— Pablo Neruda',
  },
  {
    type: 'quote',
    es: '«El descanso no es holgazanería. Tumbarse en la hierba escuchando el murmullo del agua, contemplar las nubes flotando, no es perder el tiempo.»',
    en: '«Rest is not idleness. To lie sometimes on the grass listening to the murmur of water, or watching clouds float by, is by no means a waste of time.»',
    attr: '— John Lubbock',
  },
  {
    type: 'quote',
    es: '«La cura para todo es agua salada: sudor, lágrimas o el mar.»',
    en: '«The cure for anything is salt water — sweat, tears, or the sea.»',
    attr: '— Isak Dinesen',
  },
  {
    type: 'quote',
    es: '«Vivir bien es la mejor venganza.»',
    en: '«Living well is the best revenge.»',
    attr: '— George Herbert',
  },
  {
    type: 'quote',
    es: '«El mar es todo. Cubre siete décimas partes del globo. Su aliento es puro y vivificante. Es un inmenso desierto donde el hombre nunca está solo.»',
    en: '«The sea is everything. It covers seven-tenths of the globe. Its breath is pure and healthy. It is an immense desert where a man is never alone.»',
    attr: '— Jules Verne',
  },
  {
    type: 'quote',
    es: '«Quien cuida lo que comparte merece disfrutarlo del todo.»',
    en: '«Those who care for what they share deserve to enjoy it fully.»',
    attr: '— Hestía',
  },
  {
    type: 'quote',
    es: '«La vida es lo que pasa mientras estás ocupado haciendo otros planes.»',
    en: '«Life is what happens while you\'re busy making other plans.»',
    attr: '— John Lennon',
  },
  {
    type: 'quote',
    es: '«El arte del descanso es parte del arte del trabajo.»',
    en: '«The art of rest is a part of the art of work.»',
    attr: '— John Steinbeck',
  },
  {
    type: 'quote',
    es: '«Cada lugar que nos acoge bien merece ser cuidado igual de bien.»',
    en: '«Every place that welcomes us well deserves to be cared for just as well.»',
    attr: '— Hestía',
  },
  {
    type: 'quote',
    es: '«El verano tiene su propia eternidad.»',
    en: '«Summer has its own eternity.»',
    attr: '— Charles Bowden',
  },
  {
    type: 'quote',
    es: '«No hay nada como quedarse en casa para sentirse de verdad cómodo.»',
    en: '«There is nothing like staying at home for real comfort.»',
    attr: '— Jane Austen',
  },
  {
    type: 'quote',
    es: '«No hace falta irse lejos para descubrir un lugar diferente. Hace falta llegar con los ojos abiertos.»',
    en: '«You need not go far to discover a different place. You just need to arrive with open eyes.»',
    attr: '— Hestía',
  },
  {
    type: 'quote',
    es: '«El verdadero descanso es sentir que el tiempo no corre.»',
    en: '«True rest is the feeling that time is not running.»',
    attr: '— Marty Rubin',
  },
  {
    type: 'quote',
    es: '«El sol, el mar y la brisa — la trinidad del bienestar mediterráneo.»',
    en: '«Sun, sea and breeze — the Mediterranean trinity of wellbeing.»',
    attr: '— Hestía',
  },
  {
    type: 'quote',
    es: '«Lo que el sol es para las flores, el amor lo es para el alma humana.»',
    en: '«What the sun is to the flowers, love is to the human soul.»',
    attr: '— Joseph Addison',
  },
  {
    type: 'quote',
    es: '«El espíritu no puede ser permanentemente negado. Se reafirma, aunque indirectamente, en cada acto de reposo.»',
    en: '«The spirit cannot be permanently denied. It reasserts itself, though indirectly, in every act of rest.»',
    attr: '— Aldous Huxley',
  },
  {
    type: 'quote',
    es: '«La felicidad es un lugar entre demasiado poco y demasiado mucho.»',
    en: '«Happiness is a place between too little and too much.»',
    attr: '— Proverbio finlandés',
  },
];

// ── Datos curiosos exclusivos para la home ──
const SABIAS_QUE_HOME_FACTS = [
  /* Cabo de Gata */
  {
    es: 'El Parque Natural Cabo de Gata-Níjar es de origen volcánico: sus acantilados negros son magma solidificado del fondo del mar hace millones de años.',
    en: 'The Cabo de Gata-Níjar Natural Park is volcanic in origin: its black cliffs are solidified magma from the ocean floor, millions of years old.',
  },
  {
    es: 'La Reserva Marina de Cabo de Gata tiene la mayor visibilidad submarina del Mediterráneo occidental: hasta 40 metros de profundidad a simple vista.',
    en: 'The Cabo de Gata Marine Reserve has the highest underwater visibility in the western Mediterranean — up to 40 metres of clear water.',
  },
  {
    es: 'La Playa de los Genoveses, en Cabo de Gata, figura entre las 10 playas más vírgenes de Europa según National Geographic.',
    en: 'Playa de los Genoveses in Cabo de Gata is listed by National Geographic among the 10 most pristine beaches in Europe.',
  },
  {
    es: 'La Playa de Mónsul fue escenario de una escena de "Indiana Jones y la Última Cruzada". Sus dunas de roca volcánica son únicas en el mundo.',
    en: 'Playa de Mónsul was used in "Indiana Jones and the Last Crusade". Its volcanic rock dunes exist nowhere else on Earth.',
  },
  {
    es: 'La Cala de San Pedro, en Cabo de Gata, solo es accesible a pie o en barco. En su interior existe una aldea habitada desde los años 70 sin luz eléctrica de red.',
    en: 'Cala de San Pedro in Cabo de Gata is only reachable on foot or by boat. Inside, a village has been inhabited since the 1970s with no mains electricity.',
  },
  {
    es: 'Las Negras, en Cabo de Gata, tiene la única playa de arena volcánica negra del Mediterráneo español. Sus arenas calientan el agua circundante hasta 4 °C más que las playas vecinas.',
    en: 'Las Negras in Cabo de Gata has the only black volcanic sand beach on the Spanish Mediterranean. Its sands warm the surrounding water up to 4 °C more than nearby beaches.',
  },
  {
    es: 'El Parque Natural Cabo de Gata alberga más de 20 especies vegetales endémicas que no existen en ningún otro lugar del planeta. Algunas crecen en un radio de apenas 5 kilómetros.',
    en: 'Cabo de Gata Natural Park is home to over 20 endemic plant species that exist nowhere else on Earth. Some grow only within a 5-kilometre radius.',
  },
  /* Zona hacia Murcia */
  {
    es: 'Águilas, a 40 minutos hacia Murcia, tiene 38 playas en menos de 30 kilómetros — la mayor densidad de calas vírgenes del litoral mediterráneo español.',
    en: 'Águilas, 40 minutes towards Murcia, has 38 beaches in under 30 kilometres — the highest density of wild coves on the Spanish Mediterranean coast.',
  },
  {
    es: 'Cabo Tiñoso, entre Cartagena y Mazarrón, es el único paraje del Mediterráneo europeo donde la tierra cae al mar desde 400 metros de altura sin ningún acceso rodado.',
    en: 'Cabo Tiñoso, between Cartagena and Mazarrón, is the only place on the European Mediterranean where land drops into the sea from 400 metres with no road access.',
  },
  {
    es: 'Las minas romanas de Mazarrón extrajeron plata y plomo durante más de 500 años. Sus yacimientos submarinos conservan ánforas y pecios intactos de hace 2.000 años.',
    en: 'The Roman mines at Mazarrón extracted silver and lead for over 500 years. Their underwater sites preserve intact amphorae and shipwrecks 2,000 years old.',
  },
  /* Pueblos */
  {
    es: 'Mojácar, a 15 minutos de Vera, es uno de los pueblos más fotografiados del Mediterráneo — un cubo blanco sobre roca que Salvador Dalí describió como "el surrealismo natural".',
    en: 'Mojácar, 15 minutes from Vera, is one of the most photographed villages in the Mediterranean — a white cube on rock that Salvador Dalí described as "natural surrealism".',
  },
  {
    es: 'Bédar, a 20 minutos hacia el interior, tiene 400 habitantes y más de 500 extranjeros empadronados que eligieron sus casas blancas para vivir. Uno de los pueblos más cosmopolitas por habitante de España.',
    en: 'Bédar, 20 minutes inland, has 400 inhabitants and over 500 registered foreign residents who chose its white houses as home. One of the most cosmopolitan villages per capita in Spain.',
  },
  {
    es: 'Sorbas, a 30 minutos de Vera, tiene el sistema de cuevas de yeso más extenso y mejor conservado de Europa, con más de 1.000 cavidades.',
    en: 'Sorbas, 30 minutes from Vera, has the most extensive and best-preserved gypsum cave system in Europe, with over 1,000 cavities.',
  },
  /* Playas */
  {
    es: 'Las playas de Cabo de Gata tienen el agua con mayor transparencia de España: hasta 30 metros de visibilidad en días sin viento. El turquesa de sus calas figura entre los más intensos del Mediterráneo.',
    en: 'Cabo de Gata beaches have the clearest water in Spain: up to 30 metres of visibility on calm days. The turquoise of their coves is ranked among the most intense in the Mediterranean.',
  },
  {
    es: 'El litoral entre Vera Playa y Cabo de Gata no tiene ninguna plataforma petrolífera ni central eléctrica a la vista. Es uno de los pocos horizontes marítimos completamente vírgenes de España.',
    en: 'The coastline between Vera Playa and Cabo de Gata has no oil platform or power plant visible on the horizon — one of the few completely unspoilt maritime views in Spain.',
  },
  /* Gastronomía */
  {
    es: 'Garrucha, a 5 minutos de Vera, tiene la lonja de gambas rojas más importante del Mediterráneo. La gamba roja de Garrucha es considerada la mejor del mundo por los chefs más premiados de España.',
    en: 'Garrucha, 5 minutes from Vera, has the Mediterranean\'s most important red prawn market. The Garrucha red prawn is considered the world\'s finest by Spain\'s most acclaimed chefs.',
  },
  {
    es: 'El tomate raf de Almería — el tomate más premiado de España — se cultiva en los invernaderos del entorno de Vera y se exporta a los mejores restaurantes de Europa.',
    en: 'Almería\'s raf tomato — Spain\'s most award-winning tomato — is grown in greenhouses around Vera and exported to Europe\'s finest restaurants.',
  },
  {
    es: 'La pipirrana almeriense — tomate, pepino, pimiento y atún en aceite — lleva más de tres generaciones cocinándose igual en las casas de Vera. El plato de verano más refrescante del Mediterráneo.',
    en: 'Almería\'s pipirrana — tomato, cucumber, pepper and tuna in oil — has been cooked the same way in Vera homes for over three generations. The Mediterranean\'s most refreshing summer dish.',
  },
  {
    es: 'La ñora, el pimentón seco que da sabor a la paella auténtica, se cultiva y seca al sol entre Almería y Murcia. Sin ñora, no hay paella.',
    en: 'The ñora, the dried pepper that flavours authentic paella, is grown and sun-dried between Almería and Murcia. Without ñora, there is no paella.',
  },
  /* Clima */
  {
    es: 'En Vera Playa, la temperatura media de enero es de 13 °C — más cálida que Niza, Cannes o Montpellier en pleno invierno.',
    en: 'In Vera Playa, the average January temperature is 13 °C — warmer than Nice, Cannes or Montpellier in the depths of winter.',
  },
  {
    es: 'Vera Playa recibe una media de 230 mm de lluvia al año — menos que Madrid, menos que Roma y una fracción de lo que llueve en el norte de España.',
    en: 'Vera Playa receives an average of 230 mm of rain a year — less than Madrid, less than Rome, and a fraction of what falls in northern Spain.',
  },
  /* Mar */
  {
    es: 'El Mediterráneo frente a Almería es el más cálido de toda la cuenca occidental. En verano, la temperatura del agua no baja de 24 °C ni de noche.',
    en: 'The Mediterranean off Almería is the warmest in the entire western basin. In summer, water temperature never drops below 24 °C, even at night.',
  },
  {
    es: 'La pradera de posidonia de Vera Playa produce entre 10 y 15 litros de oxígeno por m² al día. Es el pulmón subacuático del Mediterráneo occidental.',
    en: 'The posidonia meadow off Vera Playa produces 10 to 15 litres of oxygen per square metre each day — the underwater lung of the western Mediterranean.',
  },
  /* Fauna */
  {
    es: 'El tramo de mar entre Vera Playa y la costa norte de África es una de las rutas habituales de los delfines mular del Mediterráneo. Se avistan frecuentemente desde los barcos de Garrucha.',
    en: 'The stretch of sea between Vera Playa and the North African coast is a regular route for Mediterranean bottlenose dolphins — frequently spotted from Garrucha\'s boats.',
  },
  {
    es: 'La tortuga boba (Caretta caretta) nidifica en las playas del sur de Almería desde hace siglos. Las arenas finas de Vera Playa forman parte de su área de cría mediterránea.',
    en: 'The loggerhead sea turtle (Caretta caretta) has nested on southern Almería beaches for centuries. Vera Playa\'s fine sands are part of its Mediterranean nesting range.',
  },
  {
    es: 'El águila de Bonelli, una de las rapaces más amenazadas de Europa, anida en los acantilados de Cabo de Gata. Vera Playa es uno de los pocos lugares donde puede verse sobrevolar el mar.',
    en: 'Bonelli\'s eagle, one of Europe\'s most threatened raptors, nests in the Cabo de Gata cliffs. Vera Playa is one of the few places where it can be seen soaring over the sea.',
  },
  /* Flora */
  {
    es: 'El esparto que crece salvaje en el campo de Vera fue la base de la economía rural almeriense durante siglos. Con él se fabricaban cestos, cuerdas y algunos de los primeros papeles de la historia.',
    en: 'The esparto grass growing wild in the Vera countryside was the backbone of Almería\'s rural economy for centuries — used to make baskets, ropes, and some of history\'s earliest paper.',
  },
  {
    es: 'El azufaifo, el árbol más resistente a la sequía de Europa, crece de forma natural en los campos de Vera. Sus frutos fueron alimento cotidiano de fenicios, griegos y romanos en el Mediterráneo.',
    en: 'The jujube, Europe\'s most drought-resistant tree, grows naturally in the Vera countryside. Its fruits were a daily staple for Phoenicians, Greeks and Romans across the Mediterranean.',
  },
  /* Belleza / paisaje */
  {
    es: 'El atardecer desde Cabo de Gata tiñe el cielo de naranja, rosa y violeta durante más de 45 minutos seguidos. Los fotógrafos lo llaman "la hora dorada más larga de Europa".',
    en: 'The sunset from Cabo de Gata turns the sky orange, pink and violet for over 45 continuous minutes. Photographers call it "Europe\'s longest golden hour".',
  },
  {
    es: 'El desierto de Tabernas y el Mediterráneo se ven simultáneamente desde el Cabo de Gata: dos paisajes que no coexisten en ningún otro punto del planeta a tan poca distancia.',
    en: 'The Tabernas Desert and the Mediterranean are visible simultaneously from Cabo de Gata — two landscapes that coexist nowhere else on the planet at such close range.',
  },
  {
    es: 'La Alcazaba de Almería, construida en el siglo X, fue la mayor fortaleza árabe de España en su época — incluso más extensa que la Alhambra de Granada.',
    en: 'The Almería Alcazaba, built in the 10th century, was the largest Arab fortress in Spain at the time — even more extensive than the Alhambra in Granada.',
  },
  /* Datos espaciales — latitud, posición, coordenadas */
  {
    es: 'Vera Playa se sitúa a 37° 14′ N, 1° 47′ O — exactamente la misma latitud que Atenas, Sevilla, Argel y San Francisco.',
    en: 'Vera Playa sits at 37° 14′ N, 1° 47′ W — exactly the same latitude as Athens, Seville, Algiers and San Francisco.',
  },
  {
    es: 'Vera Playa está a menos de 200 km de la costa africana. Está más cerca de Argelia que de Madrid.',
    en: 'Vera Playa is less than 200 km from the African coast. It is closer to Algeria than to Madrid.',
  },
  {
    es: 'Vera Playa está a cero metros sobre el nivel del mar — literalmente al nivel del Mediterráneo. El pueblo de Vera, a 10 minutos tierra adentro, se eleva a 105 metros entre cítricos y olivares.',
    en: 'Vera Playa sits at zero metres above sea level — literally at Mediterranean level. The town of Vera, 10 minutes inland, rises to 105 metres above citrus groves and olive fields.',
  },
  {
    es: 'Por su longitud (1° 47′ O), en Vera Playa el sol de verano se pone a las 21:30 en hora oficial — pero el reloj solar marca las 20:00. Casi dos horas extra de luz vespertina que no existen en el centro de Europa.',
    en: 'Due to its longitude (1° 47′ W), summer sunsets in Vera Playa happen at 21:30 by the clock — but the sun says 20:00. Nearly two extra hours of evening light that do not exist in central Europe.',
  },
  {
    es: 'Vera Playa queda en la zona subtropical del hemisferio norte — la misma franja climática que el Sahara, el desierto de Atacama y el de Gobi. Es el único rincón de Europa con esa clasificación real.',
    en: 'Vera Playa lies in the subtropical zone of the northern hemisphere — the same climatic band as the Sahara, Atacama and Gobi deserts. It is the only corner of Europe with that genuine classification.',
  },
  {
    es: 'Desde Vera Playa: 90 km a Almería capital, 550 km a Madrid, 700 km a Barcelona, 780 km a Casablanca. Más cerca de Marruecos que de la capital de España.',
    en: 'From Vera Playa: 90 km to Almería, 550 km to Madrid, 700 km to Barcelona, 780 km to Casablanca. Closer to Morocco than to the Spanish capital.',
  },
  {
    es: 'El municipio de Vera ocupa el vértice sureste de la España peninsular. 40 km al sur empieza Cabo de Gata; 60 km al norte, la Sierra de las Estancias ya supera los 1.200 metros.',
    en: 'The municipality of Vera sits at the southeastern vertex of mainland Spain. 40 km south begins Cabo de Gata; 60 km north, the Sierra de las Estancias already exceeds 1,200 metres.',
  },
  /* Lugares pintorescos y visitables */
  {
    es: 'La Geoda de Pulpí, a 30 minutos de Vera, es la mayor geoda visitable del mundo: 11 metros de largo, cristales de selenita de hasta 2 metros. Solo accesible en grupos de 10 personas.',
    en: 'The Pulpí Geode, 30 minutes from Vera, is the largest accessible geode in the world: 11 metres long, selenite crystals up to 2 metres. Access limited to groups of 10.',
  },
  {
    es: 'El Observatorio Astronómico de Calar Alto, a 1 hora de Vera en la Sierra de los Filabres, tiene el mayor telescopio óptico de España (3,5 m) y más de 300 noches despejadas al año.',
    en: 'The Calar Alto Astronomical Observatory, 1 hour from Vera in the Sierra de los Filabres, has Spain\'s largest optical telescope (3.5 m) and over 300 clear nights a year.',
  },
  {
    es: 'La Sierra Cabrera, entre Mojácar y Vera, alcanza los 432 metros sobre el mar. Desde sus crestas se ven a la vez el Mediterráneo, el desierto de Tabernas y Sierra Nevada.',
    en: 'The Sierra Cabrera, between Mojácar and Vera, reaches 432 metres above sea level. From its ridges you can see simultaneously the Mediterranean, the Tabernas Desert and Sierra Nevada.',
  },
  {
    es: 'El Castillo de Vélez Blanco, a 1 hora de Vera, es uno de los castillos del Renacimiento más importantes de España. Su patio original fue vendido y está hoy en el Metropolitan Museum de Nueva York.',
    en: 'Vélez Blanco Castle, 1 hour from Vera, is one of Spain\'s finest Renaissance castles. Its original patio was sold and now stands inside the Metropolitan Museum of Art in New York.',
  },
  {
    es: 'El Cortijo del Fraile, a 45 minutos de Vera en Níjar, es el escenario real del crimen que inspiró "Bodas de Sangre" de Federico García Lorca. Hoy se puede visitar en ruinas.',
    en: 'Cortijo del Fraile, 45 minutes from Vera in Níjar, is the real-life scene of the crime that inspired García Lorca\'s "Blood Wedding". The ruins are open to visitors today.',
  },
  {
    es: 'La Playa de los Muertos, cerca de Carboneras y a 30 minutos de Vera, tiene aguas tan transparentes que el fondo se ve a 15 metros de profundidad desde la superficie. Figura en todas las listas de playas vírgenes de España.',
    en: 'Playa de los Muertos, near Carboneras and 30 minutes from Vera, has water so clear the bottom is visible 15 metres down from the surface. It appears on every list of Spain\'s wildest beaches.',
  },
  {
    es: 'Rodalquilar, en Cabo de Gata, alberga una mina de oro abandonada de los años 40. Sus instalaciones industriales entre volcanes y mar forman uno de los paisajes más surrealistas de Europa.',
    en: 'Rodalquilar in Cabo de Gata holds an abandoned 1940s gold mine. Its industrial plant set between volcanoes and sea creates one of the most surreal landscapes in Europe.',
  },
  {
    es: 'La Isleta del Moro, en Cabo de Gata, es un pueblo de pescadores con menos de 60 habitantes donde el tiempo parece detenido. Una de las aldeas costeras más fotogénicas del Mediterráneo.',
    en: 'Isleta del Moro in Cabo de Gata is a fishing village of fewer than 60 inhabitants where time seems to stand still. One of the most photogenic coastal hamlets in the Mediterranean.',
  },
  {
    es: 'Villaricos, a 10 minutos de Vera, fue una de las ciudades fenicias y romanas más importantes del sureste peninsular. Sus necrópolis y restos de murallas llevan 2.700 años junto al mar.',
    en: 'Villaricos, 10 minutes from Vera, was one of the most important Phoenician and Roman cities in southeastern Iberia. Its necropolises and wall remains have stood by the sea for 2,700 years.',
  },
  {
    es: 'Las minas de plata de Bédar, a 20 minutos de Vera, se explotaron desde la época romana hasta el siglo XX. Sus escombreras de colores siguen tiñendo la sierra de tonos oxidados y violáceos.',
    en: 'The Bédar silver mines, 20 minutes from Vera, were worked from Roman times until the 20th century. Their coloured spoil heaps still stain the hillside in shades of rust and violet.',
  },
  /* Más playas impresionantes */
  {
    es: 'El Playazo de Rodalquilar tiene una torre vigía del siglo XVIII construida para defender la costa de los piratas berberiscos. Es una de las playas más espectaculares y menos masificadas de todo Cabo de Gata.',
    en: 'El Playazo de Rodalquilar has an 18th-century watchtower built to defend the coast from Barbary pirates. It is one of the most spectacular and least-crowded beaches in all of Cabo de Gata.',
  },
  {
    es: 'La Cala del Plomo, en Cabo de Gata, solo es accesible a pie (1 hora de caminata) o en barco. Es la playa más aislada del parque natural y una de las más vírgenes del Mediterráneo.',
    en: 'Cala del Plomo in Cabo de Gata is only reachable on foot (1 hour\'s walk) or by boat — the most isolated beach in the natural park, one of the most pristine in the Mediterranean.',
  },
  {
    es: 'Las Cuatro Calas de Águilas — Cala Cerrada, Cala Carolina, Cala Palmera y Cala del Pino — son cuatro playas consecutivas de aguas cristalinas sin acceso rodado. A solo 40 km de Vera.',
    en: 'The Cuatro Calas of Águilas — Cala Cerrada, Cala Carolina, Cala Palmera and Cala del Pino — are four consecutive crystal-clear coves with no road access. Just 40 km from Vera.',
  },
  /* Más pueblos pintorescos */
  {
    es: 'Aguamarga, a 35 minutos de Vera, es uno de los pueblos de Cabo de Gata más pequeños con acceso rodado: menos de 50 habitantes en invierno. Sin bancos, sin cadenas de restaurantes, sin semáforos.',
    en: 'Aguamarga, 35 minutes from Vera, is one of Cabo de Gata\'s smallest road-accessible villages: fewer than 50 inhabitants in winter. No banks, no chain restaurants, no traffic lights.',
  },
  {
    es: 'San José, en Cabo de Gata, es el pueblo base del parque natural. Desde su puerto salen los barcos hacia calas inaccesibles por tierra. Sus fondos son algunos de los más biodiversos del Mediterráneo occidental.',
    en: 'San José in Cabo de Gata is the natural park\'s main village. From its harbour, boats depart to coves unreachable by road. Its seabed ranks among the most biodiverse in the western Mediterranean.',
  },
  {
    es: 'Níjar, a 40 minutos de Vera, es la capital artesanal de Almería. Sus talleres de cerámica y esparto llevan produciendo con la misma técnica desde el siglo XV — sin moldes industriales, sin cambiar el método.',
    en: 'Níjar, 40 minutes from Vera, is Almería\'s craft capital. Its ceramic and esparto workshops have used the same technique since the 15th century — no industrial moulds, method unchanged.',
  },
  /* Lugares singulares */
  {
    es: 'El Faro de Cabo de Gata fue construido en 1863 y es el más antiguo en activo de la provincia. A su alrededor, las salinas albergan flamencos rosados, avocetas y martinetes todo el año.',
    en: 'The Cabo de Gata lighthouse was built in 1863 and is the oldest active lighthouse in the province. Around it, the salt flats shelter pink flamingos, avocets and night herons year-round.',
  },
  {
    es: 'La Cueva de Ambrosio, en Vélez Blanco (1 hora de Vera), tiene pinturas rupestres de más de 15.000 años de antigüedad — Patrimonio Mundial y uno de los yacimientos paleolíticos más importantes del sur de Europa.',
    en: 'Cueva de Ambrosio in Vélez Blanco (1 hour from Vera) holds cave paintings over 15,000 years old — a World Heritage site and one of the most important Palaeolithic art sites in southern Europe.',
  },
  {
    es: 'Fort Bravo y Mini Hollywood, en el Desierto de Tabernas (1 hora de Vera), fueron los platós donde se rodaron "El Bueno, el Feo y el Malo", "Lawrence de Arabia" y más de 600 westerns espagueti.',
    en: 'Fort Bravo and Mini Hollywood in the Tabernas Desert (1 hour from Vera) were the sets for "The Good, the Bad and the Ugly", "Lawrence of Arabia" and over 600 spaghetti westerns.',
  },
  {
    es: 'El Arco del Agua, en el Valle de Aguas (Sorbas), es un arco natural de yeso de 15 metros de altura — uno de los paisajes geológicos más espectaculares y menos conocidos del sur de Europa.',
    en: 'The Arco del Agua in the Valle de Aguas (Sorbas) is a natural gypsum arch 15 metres high — one of the most spectacular and least-known geological landscapes in southern Europe.',
  },
  /* Clima y naturaleza */
  {
    es: 'La Sierra Nevada, con cumbres de más de 3.400 metros, se ve desde la playa de Vera en los días claros de invierno. Solo 80 km separan el Mediterráneo del glaciar más meridional de Europa.',
    en: 'Sierra Nevada, with peaks above 3,400 metres, is visible from Vera beach on clear winter days. Just 80 km separate the Mediterranean from Europe\'s southernmost glacier.',
  },
  {
    es: 'El Valle del Almanzora, a 30 minutos de Vera, florece en marzo con azahar de naranjo y limonero. El olor llega a la playa los días de poniente — uno de los fenómenos olfativos más sorprendentes de España.',
    en: 'The Almanzora valley, 30 minutes from Vera, blooms in March with orange and lemon blossom. The scent reaches the beach on westerly days — one of Spain\'s most surprising natural perfume events.',
  },
  /* Gastronomía y tradición */
  {
    es: 'Garrucha, a 5 minutos de Vera, tiene el único puerto pesquero de la costa almeriense que mantiene en activo la subasta de pescado a primera hora de la mañana. Puedes asistir como visitante.',
    en: 'Garrucha, 5 minutes from Vera, has the only fishing port on the Almería coast that still holds a live fish auction first thing in the morning. Visitors are welcome.',
  },
  {
    es: 'La almadraba de Cabo de Gata usa la misma trampa de redes laberínticas para atrapar atún rojo que los fenicios diseñaron hace 3.000 años — sin cambiar el método, sin añadir tecnología.',
    en: 'The Cabo de Gata almadraba uses the same labyrinth-net trap for catching bluefin tuna that the Phoenicians devised 3,000 years ago — unchanged method, no technology added.',
  },
  {
    es: 'El Parque Natural de Sierra María-Los Vélez, a 1 hora de Vera, supera los 2.000 metros. Desde sus cimas se ven simultáneamente el Mediterráneo, las sierras subbéticas y el norte de África.',
    en: 'Sierra María-Los Vélez Natural Park, 1 hour from Vera, exceeds 2,000 metres. From its peaks you can see the Mediterranean, the Subbetic ranges and North Africa simultaneously.',
  },
  {
    es: 'La Chanca, barrio histórico de Almería capital, tiene casas-cueva excavadas en el risco rojo de la Alcazaba. Algunas siguen habitadas hoy, igual que hace más de mil años.',
    en: 'La Chanca, Almería city\'s historic quarter, has cave-houses carved into the red rock of the Alcazaba. Some are still inhabited today, just as they were over a thousand years ago.',
  },
];

// Shuffled pools — stable per page load
const _shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const _FACTS_POOL  = _shuffle(SABIAS_QUE_FACTS);
const _QUOTES_POOL = _shuffle(FRASES_HOGAR);

// Session-persistent pool: same random order for the whole browser session
const _getSessionPool = () => {
  try {
    const raw = sessionStorage.getItem('hestia-facts-order');
    if (raw) {
      const indices = JSON.parse(raw);
      if (Array.isArray(indices) && indices.length === SABIAS_QUE_HOME_FACTS.length)
        return indices.map(i => SABIAS_QUE_HOME_FACTS[i]);
    }
  } catch {}
  const indices = _shuffle([...Array(SABIAS_QUE_HOME_FACTS.length).keys()]);
  try { sessionStorage.setItem('hestia-facts-order', JSON.stringify(indices)); } catch {}
  return indices.map(i => SABIAS_QUE_HOME_FACTS[i]);
};
const _getSessionIdx = () => {
  try { return Math.max(0, parseInt(sessionStorage.getItem('hestia-facts-idx') || '0', 10)); } catch { return 0; }
};
const _saveSessionIdx = (i) => {
  try { sessionStorage.setItem('hestia-facts-idx', String(i)); } catch {}
};

// Keep _HOME_FACTS_POOL for backward-compat (FraseHogar etc.)
const _HOME_FACTS_POOL = _getSessionPool();

// Franja oscura antes del FAQ — solo datos de Almería / Hestía
const SabiasQue = ({ lang, pool: propPool }) => {
  const pool = propPool || _FACTS_POOL;
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * pool.length));
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % pool.length);
        setVisible(true);
      }, 500);
    }, 7000);
    return () => clearInterval(tick);
  }, []);

  const item = pool[idx];
  return (
    <div className="sabias-que">
      <span className="sq-label">{lang === 'es' ? '¿Sabías que…?' : 'Did you know?'}</span>
      <span className={`sq-body ${visible ? 'sq-in' : 'sq-out'}`}>
        <span className="sq-fact">{item[lang]}</span>
      </span>
    </div>
  );
};

// Franja crema tras el hero — frases célebres sobre el hogar
const FraseHogar = ({ lang }) => {
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * _QUOTES_POOL.length));
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % _QUOTES_POOL.length);
        setVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(tick);
  }, []);

  const item = _QUOTES_POOL[idx];
  return (
    <div className="frase-hogar">
      <span className={`fh-body ${visible ? 'fh-in' : 'fh-out'}`}>
        <span className="fh-quote">{item[lang]}</span>
        <span className="fh-attr">{item.attr}</span>
      </span>
    </div>
  );
};

// Widget fijo media pantalla derecha — solo datos curiosos
const StickyFacts = ({ lang }) => {
  const [pool]  = React.useState(_getSessionPool);
  const total   = pool.length;
  const [idx, setIdx]         = React.useState(_getSessionIdx);
  const [visible, setVisible] = React.useState(true);
  const [open, setOpen]       = React.useState(true);

  const advance = (dir) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(i => { const n = (i + dir + total) % total; _saveSessionIdx(n); return n; });
      setVisible(true);
    }, 320);
  };

  React.useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => { const n = (i + 1) % total; _saveSessionIdx(n); return n; });
        setVisible(true);
      }, 400);
    }, 9000);
    return () => clearInterval(t);
  }, [open]);

  const item  = pool[idx];
  const label = lang === 'es' ? '¿Sabías que?' : 'Did you know?';

  return (
    <div className={`sticky-facts ${open ? '' : 'sf-closed'}`} onClick={!open ? () => setOpen(true) : undefined}>
      {!open ? (
        <>
          <span style={{ fontSize: 14, color: 'var(--sol-lt)', fontFamily: 'var(--sans)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 400 }}>
            {lang === 'es' ? '¿Sabías que?' : 'Did you know?'}
          </span>
          <button className="sf-toggle" onClick={() => setOpen(true)} aria-label="Expandir">＋</button>
        </>
      ) : (
        <>
          <button className="sf-toggle" onClick={() => setOpen(false)} aria-label="Minimizar">−</button>
          <div className={`sf-body ${visible ? 'sf-in' : 'sf-out'}`}>
            <span className="sf-label">{label}</span>
            <span className="sf-text">{item[lang]}</span>
          </div>
          <div className="sf-nav">
            <button className="sf-nav-btn" onClick={() => advance(-1)} aria-label={lang === 'es' ? 'Anterior' : 'Previous'}>←</button>
            <span className="sf-counter">{idx + 1} / {total}</span>
            <button className="sf-nav-btn" onClick={() => advance(1)} aria-label={lang === 'es' ? 'Siguiente' : 'Next'}>→</button>
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { HestiaLogoMark, Wordmark, COPY, useScrollMode, useReveal, BRIDGE_PALETTE, QuickFAQ, SabiasQue, FraseHogar, StickyFacts, _HOME_FACTS_POOL });
