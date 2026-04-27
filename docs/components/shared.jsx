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
    nav: ['Inicio', 'Hestía Mar', 'Hestía Thalassa', 'Hestía Salinas', 'Nosotros', 'Opiniones', 'Contacto'],
    cta_nav: 'Reserva',
    hero_title_1: 'Tu hogar',
    hero_title_2: 'lejos de tu casa.',
    hero_sub: 'Vera Playa · Almería · desde 2016',
    hero_cta_1: 'Descubre los apartamentos',
    hero_cta_2: 'Escríbenos',
    scroll_hint: 'Desliza para despertar',
    hero_meta_right: 'Noche mediterránea — 36.96° N, 1.83° W',
    bridge_title: '…y amanece sobre Vera Playa.',
    bridge_sub: 'La noche morada se retira despacio. El alba trae el albero — tierra, pared encalada, sal seca. A las siete, el Mediterráneo abre el ojo en teal y los olivos reciben la luz de costado. Al fondo, el Desierto de Tabernas ya es naranja.',
    apts_eyebrow: 'Nuestros tres apartamentos',
    apts_title: (<>Tres atmósferas, <em>una misma casa.</em></>),
    apts_sub: 'Cada uno toma su color del paisaje que lo rodea. Elige el tuyo — o ven tres veces.',
    apt_01_concept: 'El campo de olivos llega al mar',
    apt_02_concept: 'El naranja del Desierto de Tabernas',
    apt_03_concept: 'El amarillo albero del amanecer sobre las salinas',
    apt_cta: 'Ver apartamento',
    compare_eyebrow: 'Compara · Elige · Reserva',
    compare_title: (<>Tres puertas distintas al <em>mismo Mediterráneo.</em></>),
    counters_eyebrow: 'Diez años · una playa · vuestra casa',
    days_unit: 'días',
    counter_1: 'familias han dormido aquí desde 2016',
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
    manifest_title: (<>Esto no se alquila. <em>Se comparte.</em></>),
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
    footer_apts: 'Apartamentos',
    footer_hestia: 'Hestía',
    footer_contacto: 'Contacto',
    footer_tag: 'Tu hogar en Vera Playa, desde 2016.',
  },
  en: {
    nav: ['Home', 'Hestía Mar', 'Hestía Thalassa', 'Hestía Salinas', 'About us', 'Reviews', 'Contact'],
    cta_nav: 'Book',
    hero_title_1: 'Your home',
    hero_title_2: 'away from home.',
    hero_sub: 'Vera Playa · Almería · since 2016',
    hero_cta_1: 'Discover the apartments',
    hero_cta_2: 'Say hello',
    scroll_hint: 'Scroll to wake up',
    hero_meta_right: 'Mediterranean night — 36.96° N, 1.83° W',
    bridge_title: '…and morning breaks over Vera Playa.',
    bridge_sub: 'The purple night slowly withdraws. Dawn brings the ochre — earth, whitewashed wall, dried salt. By seven, the Mediterranean opens its eye in teal, the olive trees catch the side-light. In the distance, the Tabernas Desert is already orange.',
    apts_eyebrow: 'Our three apartments',
    apts_title: (<>Three moods, <em>one same home.</em></>),
    apts_sub: 'Each one borrows its colour from the landscape around it. Choose yours — or come three times.',
    apt_01_concept: 'Where the olive grove meets the sea',
    apt_02_concept: 'Orange from the Tabernas desert',
    apt_03_concept: 'Ochre yellow, sunrise over the salt flats',
    apt_cta: 'See apartment',
    compare_eyebrow: 'Compare · Choose · Book',
    compare_title: (<>Three doors onto the <em>same Mediterranean.</em></>),
    counters_eyebrow: 'Ten years · one beach · your home',
    days_unit: 'days',
    counter_1: 'families have slept here since 2016',
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
    manifest_title: (<>This isn’t rented. <em>It’s shared.</em></>),
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
        a: <>En <a href="mar.html">Hestía Mar</a> sí, sin cargo extra — las mascotas son parte de la familia. En <a href="thalassa.html">Thalassa</a> y <a href="salinas.html">Salinas</a> consúltanos antes.</> },
      { q: '¿Cuál apartamento me conviene más?',
        a: <>Compara los tres en <a href="index.html">nuestra home</a>. <a href="mar.html">Mar</a> es planta baja con jardín y mascotas. <a href="thalassa.html">Thalassa</a> es el ático con SPA y vistas 360°. <a href="salinas.html">Salinas</a> tiene tres piscinas y el Parque Natural al lado.</> },
      { q: '¿Quiénes sois Alex y Fran?',
        a: <><a href="nosotros.html">Somos los propietarios</a>, no una agencia. Gestionamos los tres apartamentos en persona desde 2016. Más de 900 familias nos avalan.</> },
    ],
    en: [
      { q: 'How do I book directly?',
        a: <>Write to us via <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. No middlemen, no commissions. Or use the form on <a href="reservas.html">our reservations page</a>.</> },
      { q: 'Can I bring my dog?',
        a: <>At <a href="mar.html">Hestía Mar</a>, yes — no extra charge, pets are family. At <a href="thalassa.html">Thalassa</a> and <a href="salinas.html">Salinas</a>, please ask us first.</> },
      { q: 'Which apartment suits me best?',
        a: <>Compare all three on <a href="index.html">our home page</a>. <a href="mar.html">Mar</a> is ground floor with garden and pets. <a href="thalassa.html">Thalassa</a> is the penthouse with SPA and 360° views. <a href="salinas.html">Salinas</a> has three pools and the Nature Park next door.</> },
      { q: 'Who are Alex and Fran?',
        a: <><a href="nosotros.html">We are the owners</a>, not an agency. We have run the three apartments in person since 2016. Over 900 families back us.</> },
    ],
  },
  vm: {
    es: [
      { q: '¿Por qué elegiría Hestía Mar sobre los otros dos?',
        a: <>Mar es el apartamento de planta baja, con acceso directo al jardín y a la piscina. El más íntimo y sereno de los tres: olivar, brisa marina y luz lateral toda la mañana. Y el único donde <strong>las mascotas son siempre bienvenidas</strong> sin consultar.</> },
      { q: '¿Puedo traer a mi perro (o gato)?',
        a: <>Sí, en Hestía Mar las mascotas son parte de la familia. Sin cargo extra. Avísanos al reservar y lo tenemos todo listo para cuando lleguéis.</> },
      { q: '¿El jacuzzi está disponible durante mi estancia?',
        a: <>El jacuzzi es de temporada, disponible en los meses de verano. Si tienes dudas sobre tus fechas, pregúntanos antes de reservar y te confirmamos.</> },
      { q: '¿A qué distancia está la playa?',
        a: <>A 300 metros a pie. Al salir del apartamento, gira a la izquierda — en cinco minutos tienes los pies en el agua. La playa de Vera Playa es larga, tranquila y de arena fina.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Mar over the other two?',
        a: <>Mar is the ground-floor apartment with direct access to the garden and pool. The most intimate and serene of the three: olive trees, sea breeze, side-light all morning. And the only one where <strong>pets are always welcome</strong> without asking.</> },
      { q: 'Can I bring my dog (or cat)?',
        a: <>Yes, at Hestía Mar pets are family. No extra charge. Let us know when booking and we'll have everything ready for your arrival.</> },
      { q: 'Is the jacuzzi available during my stay?',
        a: <>The jacuzzi is seasonal, available during the summer months. If you have doubts about your dates, ask us before booking and we'll confirm.</> },
      { q: 'How far is the beach?',
        a: <>300 metres on foot. Turn left when you leave the apartment — in five minutes you have your feet in the water. Vera Playa beach is long, quiet and fine-sand.</> },
    ],
  },
  vt: {
    es: [
      { q: '¿Por qué elegiría Hestía Thalassa sobre los otros dos?',
        a: <>Thalassa es el ático. La terraza panorámica de 360° te da el amanecer sobre el Mediterráneo y el atardecer sobre el Desierto de Tabernas al mismo tiempo. El SPA privado con cromoterapia y aromaterapia lo convierte en el más sensorial de los tres.</> },
      { q: '¿El SPA es privado, solo para nosotros?',
        a: <>Sí. El SPA con cromoterapia y aromaterapia es de uso exclusivo del apartamento. No se comparte con otros huéspedes en ningún momento.</> },
      { q: '¿Puedo ver el Desierto de Tabernas desde el ático?',
        a: <>Sí. Desde la terraza panorámica tienes vistas simultáneas al Mediterráneo y al Cabo de Gata. El Desierto de Tabernas — el único desierto de Europa — está a unos 30 minutos en coche.</> },
      { q: '¿Puedo traer mascotas?',
        a: <>Consúltanos antes de reservar. En <a href="mar.html">Hestía Mar</a> las mascotas están siempre bienvenidas; en Thalassa lo valoramos según la temporada y las circunstancias.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Thalassa over the other two?',
        a: <>Thalassa is the penthouse. The 360° panoramic terrace gives you sunrise over the Mediterranean and sunset over the Tabernas Desert simultaneously. The private SPA with chromotherapy and aromatherapy makes it the most sensory of the three.</> },
      { q: 'Is the SPA private, just for us?',
        a: <>Yes. The SPA with chromotherapy and aromatherapy is for exclusive use of the apartment. It is not shared with other guests at any time.</> },
      { q: 'Can I see the Tabernas Desert from the penthouse?',
        a: <>Yes. From the panoramic terrace you have simultaneous views of the Mediterranean and Cabo de Gata. The Tabernas Desert — Europe's only desert — is about 30 minutes by car.</> },
      { q: 'Can I bring pets?',
        a: <>Please ask us before booking. At <a href="mar.html">Hestía Mar</a> pets are always welcome; at Thalassa we consider it depending on the season and circumstances.</> },
    ],
  },
  vs: {
    es: [
      { q: '¿Por qué elegiría Hestía Salinas sobre los otros dos?',
        a: <>Salinas es el más luminoso de los tres. Dos terrazas, tres piscinas comunitarias y el Parque Natural de las Salinas de Puerto Rey a la vuelta de la esquina. La luz de la tarde sobre las salinas tiñe cada habitación de oro — un paisaje que no existe en ningún otro lugar de Europa.</> },
      { q: '¿Qué son las Salinas de Puerto Rey?',
        a: <>Un Parque Natural a pocos metros del apartamento, con flamencos, aves migratorias y una luz dorada al amanecer única en Europa. Una de las razones por las que este apartamento tiene algo que los demás no tienen.</> },
      { q: '¿Hay de verdad tres piscinas?',
        a: <>Sí. La urbanización tiene tres piscinas comunitarias — no una sola dividida, sino tres zonas diferenciadas con orientaciones distintas. Una de las cosas que más sorprende a los huéspedes.</> },
      { q: '¿Puedo traer mascotas?',
        a: <>Consúltanos antes de reservar. En <a href="mar.html">Hestía Mar</a> las mascotas están siempre bienvenidas; en Salinas lo valoramos según la temporada.</> },
    ],
    en: [
      { q: 'Why would I choose Hestía Salinas over the other two?',
        a: <>Salinas is the brightest of the three. Two terraces, three shared pools and the Puerto Rey Salt-flat Nature Park around the corner. The afternoon light over the salt flats turns every room golden — a landscape that exists nowhere else in Europe.</> },
      { q: 'What is the Puerto Rey Nature Park?',
        a: <>A natural park a few metres from the apartment, with flamingos, migratory birds and a golden light at sunrise unique in Europe. One of the reasons this apartment has something the others don't.</> },
      { q: 'Are there really three pools?',
        a: <>Yes. The complex has three community pools — not one divided, but three separate areas with different orientations. One of the things that surprises guests most.</> },
      { q: 'Can I bring pets?',
        a: <>Please ask us before booking. At <a href="mar.html">Hestía Mar</a> pets are always welcome; at Salinas we consider it depending on the season.</> },
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
          <a href="contacto.html" className="btn btn-ghost">
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
    es: 'Hestía lleva más de diez años con puntuación máxima ininterrumpida en Booking.com, Airbnb y Google Maps — algo que menos del 1 % de los alojamientos vacacionales de España mantiene durante tanto tiempo.',
    en: 'Hestía has held top scores on Booking.com, Airbnb and Google Maps for over ten years — something fewer than 1% of holiday rentals in Spain sustain for that long.',
  },
  {
    type: 'fact',
    es: 'Al reservar directamente con Hestía, el precio es igual o mejor que en Booking o Airbnb — y hablas con los propietarios, no con una centralita ni un bot.',
    en: 'Booking directly with Hestía gives you the same price or better than Booking or Airbnb — and you speak with the owners, not a call centre or a bot.',
  },
  {
    type: 'fact',
    es: 'El SPA privado de Hestía Thalassa — con cromoterapia y aromaterapia — es el único de uso exclusivo por apartamento en toda la zona de Vera Playa.',
    en: 'The private SPA at Hestía Thalassa — with chromotherapy and aromatherapy — is the only exclusive-use SPA per apartment in the entire Vera Playa area.',
  },
  {
    type: 'fact',
    es: 'En Hestía Mar, las mascotas son siempre bienvenidas sin coste extra — la única política de este tipo en la urbanización.',
    en: 'At Hestía Mar, pets are always welcome at no extra cost — the only no-supplement pet policy in the complex.',
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
    es: '«El hogar es el punto de partida de todo gran viaje.»',
    en: '«Home is the starting point of every great journey.»',
    attr: '— Henry Drummond',
  },
  {
    type: 'quote',
    es: '«Volver a casa es la forma más agradable de viajar.»',
    en: '«Returning home is the sweetest of all journeys.»',
    attr: '— Fanny Burney',
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
const _FACTS_POOL      = _shuffle(SABIAS_QUE_FACTS);
const _HOME_FACTS_POOL = _shuffle(SABIAS_QUE_HOME_FACTS);
const _QUOTES_POOL     = _shuffle(FRASES_HOGAR);

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

Object.assign(window, { HestiaLogoMark, Wordmark, COPY, useScrollMode, useReveal, BRIDGE_PALETTE, QuickFAQ, SabiasQue, FraseHogar, _HOME_FACTS_POOL });
