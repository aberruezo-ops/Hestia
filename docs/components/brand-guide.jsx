// ================================================================
// HESTÍA — Sección de guía de marca
// ================================================================

const BRAND_COPY = {
  es: {
    eyebrow: 'Manual de identidad',
    title: (<>El idioma visual de <em>Hestía.</em></>),
    lede: (<>Cada decisión cromática en este portal nace del paisaje de Vera Playa: la <em>noche mediterránea</em>, el <em>amanecer sobre las salinas</em>, el <em>olivar al mar</em>, la <em>tierra del Tabernas</em>. Esta es la lógica que mantiene unidas tres atmósferas distintas bajo un mismo techo.</>),

    logo_eyebrow: 'El símbolo',
    logo_title: (<>Una H de hogar y de mar, <em>tejado y olas.</em></>),
    logo_p1: 'El monograma de Hestía es una serif clásica trabajada en teal vidriado. Las dos columnas verticales sostienen una doble curva: una hoja de olivo que se transforma en cresta de ola, y una segunda línea diagonal que evoca el tejado.',
    logo_p2: 'Tres símbolos, una sola letra. Hogar — naturaleza — Mediterráneo.',
    sym_1_t: 'Las columnas',
    sym_1_d: 'Estabilidad. La casa. Hestía, la diosa griega del hogar y del fuego que nunca se apaga.',
    sym_2_t: 'La hoja',
    sym_2_d: 'El campo de olivos almeriense. Lo que rodea la casa antes de llegar al mar.',
    sym_3_t: 'La ola',
    sym_3_d: 'El Mediterráneo a 300 m. El destino, lo que se ve desde la terraza.',

    pal_eyebrow: 'Paleta de marca',
    pal_title: (<>Berenjena, teal y arena. <em>El día y la noche</em> en tres colores.</>),
    pal_lede: 'La paleta principal nace de una sola foto: la terraza de Hestía Mar a la 1:00 AM. Cojines turquesa, velas encendidas, el cielo violeta de Vera Playa. De ahí salen los tres tonos rectores de toda la marca.',

    apt_eyebrow: 'Tres apartamentos · tres paisajes',
    apt_title: (<>Cada apartamento <em>toma su color del paisaje.</em></>),
    apt_lede: 'Las tres identidades secundarias funcionan como sub-marcas. No son colores arbitrarios: cada uno está extraído de un paisaje real de Almería que define la atmósfera del apartamento.',

    type_eyebrow: 'Tipografía',
    type_title: (<>Lora para el alma, <em>Poppins para la voz.</em></>),
    type_lede: 'Una pareja sobria que mezcla letra de libro y letra de pantalla. La cursiva de Lora es nuestra firma — aparece en titulares, citas y conceptos. Poppins delgada hace de soporte: navegación, datos, microcopy.',

    voice_eyebrow: 'Tono de voz',
    voice_title: (<>Cercanos, no informales. <em>Cuidados, no fríos.</em></>),
    voice_lede: 'Hablamos como Alex y Fran hablan en WhatsApp con un huésped que ya conocen. Nada de "estimado cliente". Nada de "le informamos que". Tampoco de bromas forzadas o emojis al final de cada frase.',

    use_eyebrow: 'Usos del logotipo',
    use_title: (<>Cómo se trata <em>el monograma.</em></>),
    use_lede: 'El logo respira: nunca menos de su propia altura de margen alrededor. Vive sobre fondo berenjena (versión nocturna) o sobre arena (versión diurna). Nunca se distorsiona, gira o coloca sobre fotos saturadas.',

    do_1: 'Sobre berenjena oscuro (modo noche).',
    do_2: 'Sobre arena clara (modo día).',
    dont_1: 'Sobre fondos saturados de marca.',
    dont_2: 'Estirar o deformar el monograma.',
    dont_3: 'Inclinar o rotar el símbolo.',
    dont_4: 'Sobre gradientes de la paleta apt.',
    do_label: 'Sí',
    dont_label: 'No',
  },
  en: {
    eyebrow: 'Brand identity manual',
    title: (<>The visual language of <em>Hestía.</em></>),
    lede: (<>Every chromatic decision in this site is born from the landscape of Vera Playa: the <em>Mediterranean night</em>, the <em>sunrise over the salt flats</em>, the <em>olive grove meeting the sea</em>, the <em>earth of Tabernas</em>. This is the logic that holds three different moods under one same roof.</>),
    logo_eyebrow: 'The mark',
    logo_title: (<>An H that is also <em>roof and wave.</em></>),
    logo_p1: 'The Hestía monogram is a classical serif worked in glazed teal. The two vertical columns support a double curve: an olive leaf that becomes a wave crest, and a second diagonal that evokes the roof.',
    logo_p2: 'Three symbols, a single letter. Home — nature — Mediterranean.',
    sym_1_t: 'The columns',
    sym_1_d: 'Stability. The house. Hestía, Greek goddess of home and the fire that never dies.',
    sym_2_t: 'The leaf',
    sym_2_d: 'The Almerian olive grove. What surrounds the house before reaching the sea.',
    sym_3_t: 'The wave',
    sym_3_d: 'The Mediterranean 300 m away. The destination — what you see from the terrace.',
    pal_eyebrow: 'Brand palette',
    pal_title: (<>Aubergine, teal and sand. <em>Day and night</em> in three colours.</>),
    pal_lede: 'The main palette comes from a single photograph: the Hestía Mar terrace at 1:00 AM. Turquoise cushions, lit candles, Vera Playa\'s violet sky. From there, the three governing tones of the whole brand.',
    apt_eyebrow: 'Three apartments · three landscapes',
    apt_title: (<>Each apartment <em>borrows its colour from its landscape.</em></>),
    apt_lede: 'The three secondary identities work as sub-brands. They are not arbitrary colours: each one is extracted from a real Almerían landscape that defines the apartment\'s atmosphere.',
    type_eyebrow: 'Typography',
    type_title: (<>Lora for the soul, <em>Poppins for the voice.</em></>),
    type_lede: 'A sober pair mixing book type and screen type. Lora italics are our signature — they appear in headlines, quotes and concepts. Thin Poppins handles the rest: navigation, data, microcopy.',
    voice_eyebrow: 'Voice & tone',
    voice_title: (<>Close, not casual. <em>Crafted, not cold.</em></>),
    voice_lede: 'We write the way Alex and Fran chat on WhatsApp with a guest they already know. No "Dear customer". No "please be advised". No forced jokes or emojis tacked at the end of every line.',
    use_eyebrow: 'Logo usage',
    use_title: (<>How the <em>monogram</em> is handled.</>),
    use_lede: 'The mark breathes: never less than its own height of margin around it. It lives on aubergine (night) or sand (day). It is never distorted, rotated or placed over saturated photos.',
    do_1: 'On dark aubergine (night mode).',
    do_2: 'On light sand (day mode).',
    dont_1: 'On saturated brand backgrounds.',
    dont_2: 'Stretching or warping the mark.',
    dont_3: 'Tilting or rotating the symbol.',
    dont_4: 'Over apartment gradient washes.',
    do_label: 'Do',
    dont_label: 'Don\'t',
  }
};

const BrandGuide = ({ lang }) => {
  const t = BRAND_COPY[lang];

  const foundation = [
    {
      cls: 'dark', name: 'Berenjena', hex: '#3D1A35',
      role: lang === 'es' ? 'Color primario · noche' : 'Primary · night',
      why: lang === 'es' ? 'El cielo violeta de Vera a la 1:00 AM. Estructura, calma, profundidad.' : 'Vera\'s violet sky at 1 AM. Structure, calm, depth.',
      vals: ['HEX #3D1A35', 'RGB 61·26·53'],
      photo: 'assets/photo-night-terrace.jpg',
      bg: '#3D1A35',
    },
    {
      cls: 'dark', name: 'Teal Sol', hex: '#3AAABB',
      role: lang === 'es' ? 'Acento primario · mar' : 'Primary accent · sea',
      why: lang === 'es' ? 'El Mediterráneo a primera hora. Luz, frescor, el detalle que siempre brilla.' : 'The Mediterranean at first light. Brightness, freshness, the detail that always glows.',
      vals: ['HEX #3AAABB', 'RGB 58·170·187'],
      photo: 'assets/apt-vm.jpg',
      bg: '#3AAABB',
    },
    {
      cls: 'light', name: 'Arena', hex: '#F0E8D5',
      role: lang === 'es' ? 'Fondo claro · día' : 'Light background · day',
      why: lang === 'es' ? 'La arena de Vera Playa. Calor, papel viejo, la pared de cal almeriense.' : 'The sand of Vera beach. Warmth, old paper, the Almerían lime wall.',
      vals: ['HEX #F0E8D5', 'RGB 240·232·213'],
      photo: '',
      bg: '#F0E8D5',
    },
  ];

  const accents = [
    {
      cls: 'light', name: 'Crema', hex: '#FAF6F0',
      role: lang === 'es' ? 'Fondo neutral' : 'Neutral background',
      why: lang === 'es' ? 'Lienzo de revista. Más cálido que el blanco puro, más limpio que la arena.' : 'Magazine canvas. Warmer than pure white, cleaner than sand.',
      vals: ['HEX #FAF6F0'],
      bg: '#FAF6F0',
    },
    {
      cls: 'dark', name: 'Tinta', hex: '#1A0C18',
      role: lang === 'es' ? 'Cuerpo de texto' : 'Body type',
      why: lang === 'es' ? 'Berenjena llevado al casi-negro. Lectura suave, nunca una nota dura.' : 'Aubergine pushed almost-black. Soft reading, never a hard note.',
      vals: ['HEX #1A0C18'],
      bg: '#1A0C18',
    },
    {
      cls: 'dark', name: 'Teal Hover', hex: '#2A8E9E',
      role: lang === 'es' ? 'Estados interactivos' : 'Interactive states',
      why: lang === 'es' ? 'Una nota más profunda del teal. Sólo aparece cuando el cursor entra.' : 'A deeper note of teal. Only when the cursor enters.',
      vals: ['HEX #2A8E9E'],
      bg: '#2A8E9E',
    },
  ];

  const apts = [
    {
      id: 'vm',
      num: '01',
      name: 'Hestía Mar',
      concept: lang === 'es' ? '« El campo de olivos llega al mar »' : '« Where the olive grove meets the sea »',
      why: lang === 'es' ? 'Verde olivo profundo extraído del campo almeriense. Apartamento más sereno y mineral, con el detalle marino del cabecero. La paleta neutraliza para que el mar pintado del cabecero sea siempre el protagonista.' : 'Deep olive green from the Almerían countryside. The most serene and mineral apartment, with a marine touch in the headboard. The palette neutralises so the painted sea remains the lead.',
      photo: 'assets/photo-vm-bedroom.jpg',
      colors: [
        { hex: '#4A5628', name: 'Olivo' },
        { hex: '#6B7A3A', name: 'Olivo claro' },
        { hex: '#8B9A52', name: 'Hoja' },
      ],
    },
    {
      id: 'vt',
      num: '02',
      name: 'Hestía Thalassa',
      concept: lang === 'es' ? '« El naranja del Desierto de Tabernas »' : '« Orange from the Tabernas desert »',
      why: lang === 'es' ? 'Naranja tostado del único desierto de Europa, a 30 min en coche. Es la atmósfera más cálida y dramática: el ático, el SPA, las puestas de sol panorámicas. Una nota que enciende sin gritar.' : 'Toasted orange from Europe\'s only desert, 30 min by car. The warmest and most dramatic mood: the penthouse, the SPA, panoramic sunsets. A note that lights without shouting.',
      photo: 'assets/photo-vt-bedroom.jpg',
      colors: [
        { hex: '#8A4A24', name: 'Tabernas' },
        { hex: '#B86A3C', name: 'Tostado' },
        { hex: '#D08B5A', name: 'Adobe' },
      ],
    },
    {
      id: 'vs',
      num: '03',
      name: 'Hestía Salinas',
      concept: lang === 'es' ? '« El amarillo albero del amanecer »' : '« The ochre yellow of sunrise »',
      why: lang === 'es' ? 'Amarillo albero del Parque Natural de las Salinas a las 7:14 AM. La luz dorada que da nombre al apartamento. Tiene la textura del polvo de plaza, del adobe del Sur.' : 'Ochre yellow from the Salt Flats Natural Park at 7:14 AM. The golden light that names the apartment. It carries the texture of square dust, the adobe of the South.',
      photo: 'assets/photo-vs-bedroom.jpg',
      colors: [
        { hex: '#9E7A2C', name: 'Albero' },
        { hex: '#D4A84A', name: 'Sol bajo' },
        { hex: '#E8C476', name: 'Trigo' },
      ],
    },
  ];

  const voicePairs = lang === 'es' ? [
    { we: '« Te respondo yo, en cuanto vea el mensaje. »', not: 'Estimado cliente, en breve atenderemos su consulta.' },
    { we: '« La playa está a 300 metros — gira a la derecha al salir. »', not: 'Disponemos de una ubicación privilegiada en primera línea.' },
    { we: '« Si algo se rompe, lo dices. Y nosotros nos ocupamos. »', not: 'Política de daños conforme a las condiciones del contrato.' },
    { we: '« Alex en español, Fran en inglés. WhatsApp, sin formularios. »', not: 'Por favor, complete el formulario de contacto adjunto.' },
  ] : [
    { we: '« I\'ll reply, the moment I see your message. »', not: 'Dear customer, your enquiry will be attended shortly.' },
    { we: '« The beach is 300 m away — turn right when you go out. »', not: 'We are pleased to offer a privileged front-line location.' },
    { we: '« If anything breaks, just tell us. We take care of it. »', not: 'Damages policy as per terms and conditions of the contract.' },
    { we: '« Alex in Spanish, Fran in English. WhatsApp, no forms. »', not: 'Please fill out the attached contact form.' },
  ];

  return (
    <section className="brand-guide" id="marca" data-screen-label="11 Guía de marca">
      <div className="bg-letter">H</div>
      <div className="container">

        {/* HEAD */}
        <div className="bg-head">
          <div>
            <div className="eyebrow">— {t.eyebrow}</div>
            <h2>{t.title}</h2>
          </div>
          <div className="lede">{t.lede}</div>
        </div>

        {/* LOGO */}
        <div className="bg-sub-eyebrow">{t.logo_eyebrow}</div>
        <h3 className="bg-sub-title">{t.logo_title}</h3>

        <div className="bg-logo-block">
          <div className="bg-logo-stage">
            <div className="bg-logo-grid"/>
            <span className="x-mark tl">× margin</span>
            <span className="x-mark tr">× margin</span>
            <span className="x-mark bl">× margin</span>
            <span className="x-mark br">× margin</span>
            <img src="assets/logo-teal-transparent.png" alt="Hestía monogram"/>
          </div>
          <div className="bg-logo-text">
            <p>{t.logo_p1}</p>
            <p>{t.logo_p2}</p>
            <div className="symbols">
              <div className="sym"><strong>{t.sym_1_t}</strong>{t.sym_1_d}</div>
              <div className="sym"><strong>{t.sym_2_t}</strong>{t.sym_2_d}</div>
              <div className="sym"><strong>{t.sym_3_t}</strong>{t.sym_3_d}</div>
            </div>
          </div>
        </div>

        {/* PALETTE */}
        <div className="bg-palette-section">
          <div className="bg-sub-eyebrow">{t.pal_eyebrow}</div>
          <h3 className="bg-sub-title">{t.pal_title}</h3>
          <p className="bg-sub-lede">{t.pal_lede}</p>

          <div className="bg-palette-foundation">
            {foundation.map((c, i) => (
              <div key={i} className="color-card">
                <div className={`swatch ${c.cls}`} style={{ background: c.bg }}>
                  {c.photo && <div className="photo" style={{ backgroundImage: `url(${c.photo})` }}/>}
                  <div className="label-on">{c.name}</div>
                  <div className="hex-on">{c.hex}</div>
                </div>
                <div className="info">
                  <div className="role">{c.role}</div>
                  <div className="why">«&nbsp;{c.why}&nbsp;»</div>
                  <div className="vals">{c.vals.map((v, j) => <span key={j}>{v}</span>)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-palette-accents">
            {accents.map((c, i) => (
              <div key={i} className="color-card">
                <div className={`swatch ${c.cls}`} style={{ background: c.bg, height: 140 }}>
                  <div className="label-on" style={{ fontSize: 18 }}>{c.name}</div>
                  <div className="hex-on">{c.hex}</div>
                </div>
                <div className="info">
                  <div className="role">{c.role}</div>
                  <div className="why">«&nbsp;{c.why}&nbsp;»</div>
                  <div className="vals">{c.vals.map((v, j) => <span key={j}>{v}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* APARTMENTS COLOR */}
        <div className="bg-sub-eyebrow">{t.apt_eyebrow}</div>
        <h3 className="bg-sub-title">{t.apt_title}</h3>
        <p className="bg-sub-lede">{t.apt_lede}</p>

        <div className="bg-apt-identities">
          {apts.map((a, i) => (
            <div key={i} className={`apt-identity ${a.id}`}>
              <div className="photo-block">
                <div className="photo-img" style={{ backgroundImage: `url(${a.photo})` }}/>
                <div className="swatch-strip">
                  {a.colors.map((c, j) => (
                    <div key={j} style={{ background: c.hex }}>{c.hex}</div>
                  ))}
                </div>
              </div>
              <div className="info">
                <div className="head-row">
                  <span className="num">— {a.num} —</span>
                </div>
                <div className="name">{a.name.replace('Hestía ', 'Hestía ')}</div>
                <div className="concept">{a.concept}</div>
                <div className="why">
                  <strong>{lang === 'es' ? 'Por qué este color' : 'Why this colour'}</strong>
                  {a.why}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TYPOGRAPHY */}
        <div className="bg-sub-eyebrow">{t.type_eyebrow}</div>
        <h3 className="bg-sub-title">{t.type_title}</h3>
        <p className="bg-sub-lede">{t.type_lede}</p>

        <div className="bg-typography">
          <div className="type-card serif">
            <div className="role-tag">Aa · Display</div>
            <div className="specimen">Aa<span className="specimen-lower">aábéíóúñ</span></div>
            <div className="why">«&nbsp;{lang === 'es' ? 'La cursiva es nuestra firma. Usada con restricción para titulares y conceptos clave.' : 'The italic is our signature. Used with restraint, for headlines and key concepts.'}&nbsp;»</div>
            <div className="meta">
              <div className="meta-row"><span className="key">Family</span><span className="val">Lora</span></div>
              <div className="meta-row"><span className="key">Weights</span><span className="val">300 · 400 · 500</span></div>
              <div className="meta-row"><span className="key">Use</span><span className="val">H1, H2, H3, citas</span></div>
              <div className="meta-row"><span className="key">Italic</span><span className="val">marca el énfasis</span></div>
            </div>
            <div className="scale">
              <div className="scale-row"><span className="lbl">H1 · 104</span><span className="sample" style={{fontSize: 22, fontStyle: 'italic'}}>Tu hogar lejos…</span></div>
              <div className="scale-row"><span className="lbl">H2 · 72</span><span className="sample" style={{fontSize: 18, fontStyle: 'italic'}}>una misma casa.</span></div>
              <div className="scale-row"><span className="lbl">Quote · 22</span><span className="sample" style={{fontSize: 14, fontStyle: 'italic'}}>« Deja esto como… »</span></div>
            </div>
          </div>

          <div className="type-card sans">
            <div className="role-tag">Aa · Text</div>
            <div className="specimen">Aa<span className="specimen-lower">123 · ñ</span></div>
            <div className="why">«&nbsp;{lang === 'es' ? 'Soporte ligero. Pesos finos (200–400) para que respire al lado de Lora.' : 'Light support. Thin weights (200–400) so it breathes next to Lora.'}&nbsp;»</div>
            <div className="meta">
              <div className="meta-row"><span className="key">Family</span><span className="val">Poppins</span></div>
              <div className="meta-row"><span className="key">Weights</span><span className="val">200 · 300 · 400 · 500</span></div>
              <div className="meta-row"><span className="key">Use</span><span className="val">Body, nav, eyebrows</span></div>
              <div className="meta-row"><span className="key">Tracking</span><span className="val">+0.18em en eyebrows</span></div>
            </div>
            <div className="scale">
              <div className="scale-row"><span className="lbl">Body · 14</span><span className="sample" style={{fontSize: 13}}>Tres apartamentos en Vera Playa.</span></div>
              <div className="scale-row"><span className="lbl">Eyebrow · 11</span><span className="sample" style={{fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 400}}>Manual de identidad</span></div>
              <div className="scale-row"><span className="lbl">Caps · 14</span><span className="sample wordmark" style={{fontSize: 12, letterSpacing: '0.44em'}}>HESTÍA</span></div>
            </div>
          </div>
        </div>

        {/* VOICE */}
        <div className="bg-voice">
          <div>
            <div className="bg-sub-eyebrow">{t.voice_eyebrow}</div>
            <h3 className="bg-sub-title">{t.voice_title}</h3>
            <p className="bg-sub-lede">{t.voice_lede}</p>
          </div>
          <div className="voice-pairs">
            {voicePairs.map((p, i) => (
              <div key={i} className="voice-pair">
                <div className="we">{p.we}</div>
                <div className="vs">vs</div>
                <div className="not">{p.not}</div>
              </div>
            ))}
          </div>
        </div>

        {/* USAGE */}
        <div className="bg-sub-eyebrow">{t.use_eyebrow}</div>
        <h3 className="bg-sub-title">{t.use_title}</h3>
        <p className="bg-sub-lede">{t.use_lede}</p>

        <div className="bg-usage">
          <div className="usage-card do-card">
            <div className="demo">
              <img src="assets/logo-teal-transparent.png" alt=""/>
            </div>
            <div className="label">
              <span className="badge">✓ {t.do_label}</span>
              <span className="text">{t.do_1}</span>
            </div>
          </div>
          <div className="usage-card do-card cream">
            <div className="demo">
              <img src="assets/logo-teal-transparent.png" alt="" style={{filter: 'none'}}/>
            </div>
            <div className="label">
              <span className="badge">✓ {t.do_label}</span>
              <span className="text">{t.do_2}</span>
            </div>
          </div>
          <div className="usage-card dont-card stretch">
            <div className="demo">
              <img src="assets/logo-teal-transparent.png" alt=""/>
            </div>
            <div className="label">
              <span className="badge">✕ {t.dont_label}</span>
              <span className="text">{t.dont_2}</span>
            </div>
          </div>
          <div className="usage-card dont-card tilt">
            <div className="demo">
              <img src="assets/logo-teal-transparent.png" alt=""/>
            </div>
            <div className="label">
              <span className="badge">✕ {t.dont_label}</span>
              <span className="text">{t.dont_3}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

Object.assign(window, { BrandGuide });
