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
  es: [
    { q: '¿Cómo reservo directamente?',
      a: <>Escríbenos por <a href="https://wa.me/34620316370" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. Sin intermediarios, sin comisiones. Ver más en <a href="contacto.html">Contacto</a>.</> },
    { q: '¿Aceptáis mascotas?',
      a: <>En <a href="mar.html">Hestía Mar</a> sí, las mascotas son parte de la familia. En <a href="thalassa.html">Thalassa</a> y <a href="salinas.html">Salinas</a> consúltanos antes.</> },
    { q: '¿Cuál apartamento me conviene?',
      a: <>Compara los tres en <a href="index.html">nuestra home</a>. Mar es planta baja con jardín y mascotas. Thalassa es el ático con SPA. Salinas tiene tres piscinas y vistas al Parque Natural.</> },
    { q: '¿Quiénes sois Alex y Fran?',
      a: <><a href="nosotros.html">Somos los propietarios</a>, no una agencia. Gestionamos los tres apartamentos en persona desde 2016. Más de 900 familias nos avalan.</> },
  ],
  en: [
    { q: 'How do I book directly?',
      a: <>Write to us via <a href="https://wa.me/34654138251" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>. No middlemen, no commissions. More at <a href="contacto.html">Contact</a>.</> },
    { q: 'Do you accept pets?',
      a: <>At <a href="mar.html">Hestía Mar</a>, yes — pets are family. At <a href="thalassa.html">Thalassa</a> and <a href="salinas.html">Salinas</a>, please ask first.</> },
    { q: 'Which apartment suits me?',
      a: <>Compare all three on <a href="index.html">our home page</a>. Mar is ground floor with garden and pets. Thalassa is the penthouse with SPA. Salinas has three pools and Nature Park views.</> },
    { q: 'Who are Alex and Fran?',
      a: <><a href="nosotros.html">We are the owners</a>, not an agency. We have run the three apartments in person since 2016. Over 900 families back us.</> },
  ],
};

const QuickFAQ = ({ lang }) => {
  const faqs = QUICK_FAQ[lang];
  const [open, setOpen] = React.useState(null);
  return (
    <section className="quick-faq section-cream">
      <div className="container">
        <div className="eyebrow qfaq-eyebrow">
          {lang === 'es' ? 'Preguntas frecuentes' : 'Quick answers'}
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

Object.assign(window, { HestiaLogoMark, Wordmark, COPY, useScrollMode, useReveal, BRIDGE_PALETTE, QuickFAQ });
