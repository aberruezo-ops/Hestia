// ================================================================
// HESTÍA — Página de Reservas
// ================================================================

const RESERVAS_COPY = {
  es: {
    eyebrow: 'Mejor precio garantizado · Sin intermediarios',
    title: (<>Reserva tu<br/><em>hogar en Vera.</em></>),
    sub: 'Escríbenos directamente. Alex o Fran confirman en menos de 24 horas.',
    form_title: 'Solicitar reserva',
    form_sub: 'Tres pasos: dinos qué buscas, te enseñamos disponibilidad y precio, y eliges cómo enviar la solicitud.',
    step1_title: 'Tu reserva',
    step2_title: 'Disponibilidad y precio',
    step3_title: 'Cómo nos lo envías',
    f_apt: 'Hestía',
    f_apt_ph: 'Elige Hestía',
    f_name: 'Nombre completo',
    f_name_ph: 'Tu nombre',
    f_email: 'Email',
    f_email_ph: 'tu@email.com',
    f_tel: 'Teléfono',
    f_tel_ph: '+34 6XX XXX XXX',
    f_checkin: 'Fecha de entrada',
    f_checkout: 'Fecha de salida',
    f_guests: 'Número de huéspedes',
    f_guests_opts: ['1 huésped', '2 huéspedes', '3 huéspedes', '4 huéspedes', '5 huéspedes', '6 huéspedes'],
    f_pets: '¿Viaja con mascota?',
    f_pets_no: 'No',
    f_pets_yes: 'Sí',
    f_baby: '¿Viaja con bebé?',
    f_baby_no: 'No',
    f_baby_yes: 'Sí',
    f_extras_label: 'Extras (opcional)',
    f_extras: ['Ropa de cama extra', 'Toallas extra', 'Cuna de bebé', 'Silla de bebé'],
    f_comments: 'Comentarios (opcional)',
    f_comments_ph: 'Fechas alternativas, preguntas, necesidades especiales…',
    check_avail: 'Comprobar disponibilidad y precio →',
    edit_data: 'Cambiar datos',
    continue_to_send: 'Continuar →',
    status_avail: 'Disponible para tus fechas',
    status_taken: 'Ocupado en esas fechas',
    status_taken_sub: 'Aún así puedes enviarnos la solicitud — te avisamos si se libera o te proponemos alternativas.',
    status_no_data: 'No tenemos datos en este momento',
    status_no_data_sub: 'Sin problema — envíanos la solicitud y te confirmamos en menos de 24 h.',
    channel_label: 'Elige cómo quieres enviarnos la solicitud',
    channel_wa: 'WhatsApp',
    channel_wa_desc: 'Necesitamos tu nombre y teléfono.',
    channel_email: 'Email',
    channel_email_desc: 'Necesitamos tu nombre y email. Abrirá tu cliente de correo con todo pre-rellenado.',
    send_wa: 'Enviar por WhatsApp →',
    send_email: 'Enviar por email →',
    summary_apt: 'Hestía',
    summary_dates: 'Fechas',
    summary_guests: 'Huéspedes',
    summary_pets: 'Mascota',
    summary_extras: 'Extras',
    summary_nights: (n) => `${n} ${n === 1 ? 'noche' : 'noches'}`,
    note: 'Al pulsar se abrirá WhatsApp con tu solicitud. Alex o Fran te responden en menos de 24 horas.',
    aside_title: 'Tu solicitud llega a:',
    guarantee_title: 'Reserva directa',
    guarantee_items: [
      'Precio igual o mejor que cualquier plataforma',
      'Sin comisiones de intermediarios',
      'Alex o Fran responden personalmente',
      'Confirmación en menos de 24 horas',
      'Flexibilidad real en cambios y cancelaciones',
    ],
  },
  en: {
    eyebrow: 'Best price guaranteed · No middlemen',
    title: (<>Book your<br/><em>home in Vera.</em></>),
    sub: 'Write to us directly. Alex or Fran confirm within 24 hours.',
    form_title: 'Request a booking',
    form_sub: 'Three steps: tell us what you need, see availability and price, then choose how to send the request.',
    step1_title: 'Your booking',
    step2_title: 'Availability and price',
    step3_title: 'How to send it',
    f_apt: 'Hestía',
    f_apt_ph: 'Choose a Hestía',
    f_name: 'Full name',
    f_name_ph: 'Your name',
    f_email: 'Email',
    f_email_ph: 'you@email.com',
    f_tel: 'Phone',
    f_tel_ph: '+34 6XX XXX XXX',
    f_checkin: 'Check-in date',
    f_checkout: 'Check-out date',
    f_guests: 'Number of guests',
    f_guests_opts: ['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests'],
    f_pets: 'Bringing a pet?',
    f_pets_no: 'No',
    f_pets_yes: 'Yes',
    f_baby: 'Bringing a baby?',
    f_baby_no: 'No',
    f_baby_yes: 'Yes',
    f_extras_label: 'Extras (optional)',
    f_extras: ['Extra bed linen', 'Extra towels', 'Baby cot', 'Baby chair'],
    f_comments: 'Comments (optional)',
    f_comments_ph: 'Alternative dates, questions, special needs…',
    check_avail: 'Check availability and price →',
    edit_data: 'Change details',
    continue_to_send: 'Continue →',
    status_avail: 'Available for your dates',
    status_taken: 'Taken on those dates',
    status_taken_sub: 'You can still send the request — we will let you know if it frees up or suggest alternatives.',
    status_no_data: 'No data right now',
    status_no_data_sub: 'No worries — send the request and we will confirm within 24 h.',
    channel_label: 'Choose how to send your request',
    channel_wa: 'WhatsApp',
    channel_wa_desc: 'We need your name and phone.',
    channel_email: 'Email',
    channel_email_desc: 'We need your name and email. Will open your mail client with everything pre-filled.',
    send_wa: 'Send via WhatsApp →',
    send_email: 'Send by email →',
    summary_apt: 'Hestía',
    summary_dates: 'Dates',
    summary_guests: 'Guests',
    summary_pets: 'Pet',
    summary_extras: 'Extras',
    summary_nights: (n) => `${n} ${n === 1 ? 'night' : 'nights'}`,
    note: 'Clicking will open WhatsApp with your request. Alex or Fran will reply within 24 hours.',
    aside_title: 'Your request goes to:',
    guarantee_title: 'Direct booking',
    guarantee_items: [
      'Same price or better than any platform',
      'No platform commissions',
      'Alex or Fran reply personally',
      'Confirmation within 24 hours',
      'Real flexibility on changes and cancellations',
    ],
  },
};

const _resExtrasList = () => {
  const v = window.PRICES_V2 && window.PRICES_V2.rules && window.PRICES_V2.rules.extras;
  if (!Array.isArray(v)) return [];
  // "huespedAdicional" se gestiona vía el contador de huéspedes y solo
  // tiene sentido para modificar reservas existentes (no para crear una
  // nueva). Se queda en /p-edit para el admin, fuera del flujo público.
  return v.filter(ex => ex.id !== 'huespedAdicional');
};

const _resExtraUnitSuffix = (unit, lang) => {
  if (unit === 'noche') return lang === 'es' ? '/noche' : '/night';
  if (unit === 'hora')  return lang === 'es' ? '/hora'  : '/hour';
  if (unit === 'set')   return lang === 'es' ? '/set'   : '/set';
  return '';
};

const PricePreview = ({ apt, checkin, checkout, pets, guests, lang, extras = [] }) => {
  if (!apt || !checkin || !checkout) return null;
  const gn = parseInt(guests, 10) || null;
  const calc = _calcStay(checkin, checkout, apt, pets === 'yes', gn);
  if (!calc || calc.nights <= 0) return null;
  const fmt = n => n.toLocaleString('es-ES') + ' €';
  const extrasTotal = extras.reduce((s, e) => s + e.amount, 0);
  const grandTotal = calc.directTotal + extrasTotal;
  const grandAvg = Math.round(grandTotal / calc.nights);
  return (
    <div className="price-engine price-engine-form">
      <div className="price-main-row">
        <div className="price-direct-block">
          <span className="price-label-sm">{lang === 'es' ? 'Precio directo · hasta' : 'Direct price · up to'}</span>
          <span className="price-direct-total">{fmt(grandTotal)}</span>
          <span className="price-avg-night">{fmt(grandAvg)}{lang === 'es' ? '/noche' : '/night'}</span>
        </div>
        <div className="price-right-col">
          <div className="price-guarantee-badge">
            {lang === 'es' ? '✓ Mejor precio garantizado' : '✓ Best price guarantee'}
          </div>
          <div className="price-guarantee-sub">
            {lang === 'es'
              ? 'Si encuentras un precio mejor, te lo mejoramos.'
              : 'See a better price elsewhere? We\'ll beat it.'}
          </div>
        </div>
      </div>
      <div className="price-breakdown">
        <div className="price-line">
          <span>{lang === 'es' ? `${calc.nights} noches` : `${calc.nights} nights`}</span>
          <span>{fmt(calc.baseTotal)}</span>
        </div>
        {calc.stayD && (
          <div className="price-line price-line-disc">
            <span>{lang === 'es' ? calc.stayD.es : calc.stayD.en}</span>
            <span>−{fmt(calc.stayDiscAmt)}</span>
          </div>
        )}
        {/* El suplemento por número de huéspedes se incluye en directTotal
            pero no se muestra como línea separada — pedido del usuario. */}
        {calc.petAmt > 0 && (
          <div className="price-line">
            <span>{lang === 'es' ? `Suplemento mascota (10 €/noche · máx. 50 €)` : `Pet supplement (10 €/night · max 50 €)`}</span>
            <span>+{fmt(calc.petAmt)}</span>
          </div>
        )}
        {extras.map(ex => {
          const u = ex.units || 1;
          let detail = '';
          if (ex.unit === 'hora') {
            detail = ` · ${u} h × ${ex.unitPrice} €`;
          } else if (ex.unit === 'noche') {
            const nLabel = lang === 'es' ? 'noches' : 'nights';
            const uLabel = lang === 'es' ? (u === 1 ? 'unidad' : 'unidades') : (u === 1 ? 'unit' : 'units');
            detail = ` · ${u} ${uLabel} × ${ex.qty} ${nLabel} × ${ex.unitPrice} €`;
          } else if (u > 1) {
            detail = ` · ${u} × ${ex.unitPrice} €`;
          }
          return (
            <div className="price-line" key={ex.id}>
              <span>{ex.label}{detail}</span>
              <span>+{fmt(ex.amount)}</span>
            </div>
          );
        })}
        <div className="price-line price-line-total">
          <span>{lang === 'es' ? 'Precio máximo directo' : 'Maximum direct price'}</span>
          <span>{fmt(grandTotal)}</span>
        </div>
      </div>
      <p className="price-note">{lang === 'es'
        ? '* Precio máximo orientativo. Si ves un precio mejor en cualquier plataforma, te lo mejoramos. Cuéntanos de ti y los tuyos — casi siempre podemos ajustar.'
        : '* Indicative maximum price. If you find a better price anywhere, we\'ll beat it. Tell us about your situation — we can almost always adjust.'}</p>
    </div>
  );
};

const ReservasHero = ({ lang }) => {
  const t = RESERVAS_COPY[lang];
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const tryPlay = (el) => { if (el) { el.muted = true; el.play().catch(() => {}); } };
    tryPlay(videoRef.current);
    const onVisible = () => { if (!document.hidden) { tryPlay(videoRef.current); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  return (
    <section className="page-hero reservas-hero">
      <video
        ref={videoRef}
        className="reservas-hero-video"
        autoPlay muted loop playsInline preload="auto"
      >
        <source src="assets/285834_medium.mp4" type="video/mp4"/>
      </video>
      <div className="reservas-hero-wash"/>
      <div className="stars"/>
      <div className="page-hero-content">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p className="page-hero-sub">{t.sub}</p>
      </div>
    </section>
  );
};

// Helper: comprueba si un rango está libre dado un array blocked [{start,end}].
// Igual semántica que home-search _hsAvail (end exclusivo).
const _resAvail = (checkin, checkout, blocked) => {
  if (!blocked) return null;
  return !blocked.some(r => checkin < r.end && checkout > r.start);
};

const ReservasForm = ({ lang }) => {
  const t = RESERVAS_COPY[lang];
  const aptNames = { vm: 'Hestía Mar', vt: 'Hestía Thalassa', vs: 'Hestía Salinas' };

  // Step 1 — datos que afectan a precio y disponibilidad
  const [apt, setApt]           = React.useState('');
  const [checkin, setCheckin]   = React.useState('');
  const [checkout, setCheckout] = React.useState('');
  const [guests, setGuests]     = React.useState('');
  const [pets, setPets]         = React.useState('no');
  const [baby, setBaby]         = React.useState('no');
  // extrasSel: { [id]: qty }. 0/missing = no seleccionado.
  // Para unidades no-hora, qty siempre es 1; para 'hora', el usuario edita.
  const [extrasSel, setExtrasSel] = React.useState({});
  const extrasList = _resExtrasList();

  // Step 3 — datos del canal + comentarios
  const [name, setName]         = React.useState('');
  const [tel, setTel]           = React.useState('');
  const [email, setEmail]       = React.useState('');
  const [comments, setComments] = React.useState('');

  // Workflow
  const [step, setStep]         = React.useState(1);
  const [channel, setChannel]   = React.useState('whatsapp');

  // Disponibilidad (carga lazy)
  const [avail, setAvail]       = React.useState(null);
  const [availLoaded, setAvailLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch('assets/availability.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setAvail(j))
      .catch(() => {})
      .finally(() => setAvailLoaded(true));
  }, []);

  // Prefill desde URL: /reservas.html?apt=vm&checkin=YYYY-MM-DD&...
  // Llamado desde home-search o desde el calendar de cada apt page.
  // Si llega con apt+checkin+checkout+guests, salta directo al step 2
  // (disponibilidad + precio) para que el huésped revise y avance.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = new URLSearchParams(window.location.search);
    const qApt      = qs.get('apt');
    const qCheckin  = qs.get('checkin');
    const qCheckout = qs.get('checkout');
    const qGuests   = qs.get('guests');
    const qPets     = qs.get('pets');
    let hadAny = false;
    if (qApt && ['vm', 'vt', 'vs'].includes(qApt)) { setApt(qApt); hadAny = true; }
    if (qCheckin && /^\d{4}-\d{2}-\d{2}$/.test(qCheckin))   { setCheckin(qCheckin);   hadAny = true; }
    if (qCheckout && /^\d{4}-\d{2}-\d{2}$/.test(qCheckout)) { setCheckout(qCheckout); hadAny = true; }
    if (qGuests) {
      const n = parseInt(qGuests, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= 6) {
        const guestStr = lang === 'es'
          ? `${n} ${n === 1 ? 'huésped' : 'huéspedes'}`
          : `${n} ${n === 1 ? 'guest' : 'guests'}`;
        setGuests(guestStr);
        hadAny = true;
      }
    }
    if (qPets === 'yes') { setPets('yes'); hadAny = true; }
    // Bebé: setea el toggle Sí/No y deja la opción a marcar cuna/trona en
    // los extras (no las marca automáticamente — el huésped decide).
    const qBaby = qs.get('baby');
    if (qBaby === 'yes') { setBaby('yes'); hadAny = true; }
    // Si vino apt + ambas fechas, avanzamos al step 2 directamente.
    if (qApt && qCheckin && qCheckout) {
      setStep(2);
      setTimeout(() => {
        document.getElementById('rf-step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
    // Si el prefill se ha aplicado, limpiamos los params para que un
    // refresh no re-prefille (UX confusa cuando el huésped ya está
    // editando). El estado se mantiene en React.
    if (hadAny && window.history && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [lang]);

  const toggleExtra = (id) => {
    setExtrasSel(prev => {
      const cur = prev[id] || 0;
      return { ...prev, [id]: cur > 0 ? 0 : 1 };
    });
  };
  const setExtraQty = (id, qty) => {
    const n = Math.max(0, Math.floor(Number(qty) || 0));
    setExtrasSel(prev => ({ ...prev, [id]: n }));
  };
  // Máximo qty por extra. Items "estancia" (cuna, trona, late check-in)
  // son binarios → max 1. "hora" (early check-in, late check-out) hasta
  // 8 horas. Resto (set/noche) escala con huéspedes — default 6.
  const guestCap = Math.max(1, parseInt(guests, 10) || 6);
  const maxForExtra = (ex) => {
    if (!ex) return guestCap;
    if (ex.unit === 'estancia') return 1;
    if (ex.unit === 'hora')     return 8;
    return guestCap;
  };
  const extrasById = React.useMemo(() => {
    const m = {};
    for (const ex of extrasList) m[ex.id] = ex;
    return m;
  }, [extrasList]);
  const incExtra = (id) => {
    setExtrasSel(prev => {
      const cur = prev[id] || 0;
      const max = maxForExtra(extrasById[id]);
      return { ...prev, [id]: Math.min(max, cur + 1) };
    });
  };
  const decExtra = (id) => {
    setExtrasSel(prev => {
      const cur = prev[id] || 0;
      return { ...prev, [id]: Math.max(0, cur - 1) };
    });
  };

  // Computa los extras seleccionados con su importe ya calculado.
  // Se evalúa SIEMPRE; si no hay noches válidas, los 'noche' dan amount 0
  // pero igualmente quedan listados para mostrar al usuario.
  const computeSelectedExtras = (nights) => {
    return extrasList
      .filter(ex => (extrasSel[ex.id] || 0) > 0)
      .map(ex => {
        const qty = extrasSel[ex.id];
        let amount, lineQty;
        if (ex.unit === 'hora')       { lineQty = qty;     amount = ex.price * qty; }
        else if (ex.unit === 'noche') { lineQty = nights;  amount = ex.price * nights * qty; }
        else                          { lineQty = qty;     amount = ex.price * qty; }
        // qty es siempre el número de unidades elegidas por el huésped
        // (1 por defecto, hasta el número de huéspedes). lineQty depende
        // del tipo (horas, noches, o el propio qty).
        return {
          id: ex.id,
          label: lang === 'es' ? ex.label_es : ex.label_en,
          unit: ex.unit,
          unitPrice: ex.price,
          qty: lineQty,
          units: qty,
          amount,
        };
      });
  };

  // Validaciones
  // minNights desde prices.json. Base 3 noches. Excepción 2 noches solo
  // si check-in inminente o gap-fill exacto. 1 noche siempre prohibida.
  const rrules = (window.PRICES_V2 && window.PRICES_V2.rules) || {};
  const minNights = rrules.minNights || 3;
  const twoNightFloor = rrules.twoNightFloor || 2;
  const nightsSelected = (checkin && checkout)
    ? Math.round((new Date(checkout + 'T12:00:00Z') - new Date(checkin + 'T12:00:00Z')) / 86400000)
    : 0;
  // floor mínimo absoluto (2) — el bloqueo final se valida en el picker;
  // aquí solo aseguramos que no sea < twoNightFloor.
  const meetsMinNights = nightsSelected >= twoNightFloor;
  // step1Ready = puede pasar al step 2 incluso sin apt elegido. Si no hay
  // apt, en step 2 se muestra un grid con los 3 Hestías y su estado de
  // disponibilidad → el huésped elige el que prefiera (o el que tenga libre).
  const step1Ready    = checkin && checkout && guests && checkin < checkout && meetsMinNights;
  const step1Complete = apt && step1Ready;
  const hasName  = name.trim().length > 0;
  const hasTel   = tel.replace(/\D/g, '').length >= 6;
  const hasEmail = /\S+@\S+/.test(email);
  const channelValid = channel === 'whatsapp' ? (hasName && hasTel) : (hasName && hasEmail);

  // Cálculo
  const calc = step1Complete ? _calcStay(checkin, checkout, apt, pets === 'yes', parseInt(guests, 10) || null) : null;
  const nightsForExtras = calc?.nights || 0;
  const selectedExtras = computeSelectedExtras(nightsForExtras);
  const extrasCount = Object.values(extrasSel).filter(v => v > 0).length;
  const blocked = avail && avail[apt] ? avail[apt].blocked : null;
  const isAvailable = step1Complete && availLoaded ? _resAvail(checkin, checkout, blocked) : null;

  // Avanzar pasos. step1Ready basta (sin apt) — en step 2 el huésped
  // verá la disponibilidad de los 3 Hestías y puede elegir uno.
  const goToStep2 = () => {
    if (!step1Ready) return;
    setStep(2);
    setTimeout(() => {
      document.getElementById('rf-step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };
  const goToStep3 = () => {
    setStep(3);
    setTimeout(() => {
      document.getElementById('rf-step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };
  const editStep1 = () => {
    setStep(1);
    setTimeout(() => {
      document.getElementById('rf-step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Mensaje a enviar
  const buildMsg = () => {
    const fmt = n => n.toLocaleString('es-ES') + ' €';
    const extrasTotal = selectedExtras.reduce((s, e) => s + e.amount, 0);

    // Bloque "Extras" en el cuerpo (entre Mascota y Precio)
    let extrasText = '';
    if (selectedExtras.length > 0) {
      const headEs = '\nExtras:';
      const headEn = '\nExtras:';
      const lines = selectedExtras.map(ex => {
        if (ex.unit === 'hora') {
          return `  • ${ex.label} — ${ex.qty} h × ${ex.unitPrice} € = ${fmt(ex.amount)}`;
        }
        if (ex.unit === 'noche') {
          return `  • ${ex.label} — ${ex.qty} ${lang === 'es' ? 'noches' : 'nights'} × ${ex.unitPrice} € = ${fmt(ex.amount)}`;
        }
        if (ex.amount > 0) {
          return `  • ${ex.label} — ${fmt(ex.amount)}`;
        }
        return `  • ${ex.label}`;
      });
      const subtotal = extrasTotal > 0
        ? `\n  Subtotal extras: ${fmt(extrasTotal)}`
        : '';
      extrasText = (lang === 'es' ? headEs : headEn) + '\n' + lines.join('\n') + subtotal;
    }

    const petsText = pets === 'yes' ? (lang === 'es' ? 'Sí' : 'Yes') : 'No';
    const babyText = baby === 'yes' ? (lang === 'es' ? 'Sí' : 'Yes') : 'No';

    const grandTotal = calc ? calc.directTotal + extrasTotal : 0;
    const grandAvg   = calc ? Math.round(grandTotal / calc.nights) : 0;
    const priceBlock = calc
      ? (lang === 'es'
          ? `\n💰 PRECIO ESTIMADO DIRECTO\n` +
            `   ${fmt(grandTotal)} total (${calc.nights} noches × ~${fmt(grandAvg)}/noche)\n` +
            (calc.stayD ? `   🏷 ${calc.stayD.es}: −${fmt(calc.stayDiscAmt)}\n` : '') +
            (calc.petAmt > 0 ? `   🐾 Mascota: Sí (+${calc.petAmt}€ · 10€/noche, máx 50€)\n` : '') +
            (extrasTotal > 0 ? `   ✚ Extras: +${fmt(extrasTotal)}\n` : '') +
            `   ✓ Mejor precio garantizado · si encuentras un precio mejor, te lo mejoramos\n`
          : `\n💰 ESTIMATED DIRECT PRICE\n` +
            `   ${fmt(grandTotal)} total (${calc.nights} nights × ~${fmt(grandAvg)}/night)\n` +
            (calc.stayD ? `   🏷 ${calc.stayD.en}: −${fmt(calc.stayDiscAmt)}\n` : '') +
            (calc.petAmt > 0 ? `   🐾 Pet: Yes (+${calc.petAmt}€ · 10€/night, max 50€)\n` : '') +
            (extrasTotal > 0 ? `   ✚ Extras: +${fmt(extrasTotal)}\n` : '') +
            `   ✓ Best price guarantee · if you find a better price, we'll beat it\n`)
      : '';
    const lines = lang === 'es'
      ? [
          `¡Hola! Quiero hacer una consulta de reserva.\n`,
          `Hestía: ${aptNames[apt] || apt || '—'}`,
          `Nombre: ${name}`,
          channel === 'whatsapp' ? `Teléfono: ${tel}` : `Email: ${email}`,
          `Entrada: ${checkin}`,
          `Salida: ${checkout}`,
          `Huéspedes: ${guests}`,
          `Mascota: ${petsText}`,
          `Bebé: ${babyText}${extrasText}${priceBlock}`,
          `Comentarios: ${comments || '—'}`,
        ]
      : [
          `Hello! I'd like to enquire about a booking.\n`,
          `Hestía: ${aptNames[apt] || apt || '—'}`,
          `Name: ${name}`,
          channel === 'whatsapp' ? `Phone: ${tel}` : `Email: ${email}`,
          `Check-in: ${checkin}`,
          `Check-out: ${checkout}`,
          `Guests: ${guests}`,
          `Pet: ${petsText}`,
          `Baby: ${babyText}${extrasText}${priceBlock}`,
          `Comments: ${comments || '—'}`,
        ];
    return lines.join('\n');
  };

  const send = (e) => {
    e?.preventDefault();
    if (!step1Complete || !channelValid) return;
    if (channel === 'whatsapp') {
      const waNum = lang === 'es' ? '34620316370' : '34654138251';
      window.open(`https://wa.me/${waNum}?text=` + encodeURIComponent(buildMsg()), '_blank');
    } else {
      const subj = lang === 'es'
        ? `Consulta reserva — ${aptNames[apt] || 'Hestía'}`
        : `Booking enquiry — ${aptNames[apt] || 'Hestía'}`;
      window.location.href = `mailto:info@hestiayourhome.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(buildMsg())}`;
    }
  };

  // Resúmenes para los headers de cada step cuando están plegados
  const step1Summary = step1Complete ? (
    <span className="rf-summary-line">
      <strong>{aptNames[apt]}</strong>
      {' · '}{checkin} → {checkout}
      {' · '}{guests}
      {pets === 'yes' && <> · {lang === 'es' ? '🐾 mascota' : '🐾 pet'}</>}
      {extrasCount > 0 && <> · {extrasCount} {lang === 'es' ? 'extras' : 'extras'}</>}
    </span>
  ) : null;

  const fmt = n => n.toLocaleString('es-ES') + ' €';

  return (
    <div className="reservas-form-wrap">
      <h2 className="reservas-form-title">{t.form_title}</h2>
      <div className="reservas-form-sub">{t.form_sub}</div>

      {/* SECTION 1 — DATOS */}
      <section
        id="rf-step-1"
        className={`rf-step rf-step-1 ${step === 1 ? 'is-open' : 'is-collapsed'}`}
        aria-current={step === 1 ? 'step' : undefined}
      >
        <header className="rf-step-head">
          <span className="rf-step-num">01</span>
          <h3 className="rf-step-title">{t.step1_title}</h3>
          {step > 1 && (
            <button type="button" className="rf-edit" onClick={editStep1}>
              <span className="rf-edit-summary">{step1Summary}</span>
              <span className="rf-edit-action">{t.edit_data}</span>
            </button>
          )}
        </header>
        {step === 1 && (
          <div className="rf-step-body">
            <div className="form-field full">
              <label>{t.f_apt}</label>
              <div className="rf-apt-pick" role="radiogroup" aria-label={t.f_apt}>
                {[
                  { id: 'vm', name: 'Hestía Mar',      accent: '#6B7A3A' },
                  { id: 'vt', name: 'Hestía Thalassa', accent: '#B86A3C' },
                  { id: 'vs', name: 'Hestía Salinas',  accent: '#D4A84A' },
                ].map(o => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={apt === o.id}
                    className={`rf-apt-chip${apt === o.id ? ' is-on' : ''}`}
                    style={{ '--apt-accent': o.accent }}
                    onClick={() => setApt(o.id)}
                  >
                    <span className="rf-apt-chip-dot" aria-hidden="true"/>
                    <span className="rf-apt-chip-name">{o.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field full">
              <label>{lang === 'es' ? 'Fechas de la estancia' : 'Stay dates'}</label>
              <DateRangePicker
                checkin={checkin}
                checkout={checkout}
                setCheckin={setCheckin}
                setCheckout={setCheckout}
                blocked={apt && avail && avail[apt] ? avail[apt].blocked : []}
                accent={
                  apt === 'vm' ? '#6B7A3A'
                  : apt === 'vt' ? '#B86A3C'
                  : apt === 'vs' ? '#D4A84A'
                  : '#3AAABB'
                }
                lang={lang}
              />
              {!apt && (
                <p className="form-help-note">
                  {lang === 'es'
                    ? '↑ Selecciona primero una Hestía para ver las fechas bloqueadas.'
                    : '↑ Pick a Hestía first to see blocked dates.'}
                </p>
              )}
            </div>
            <div className="form-field full">
              <label>{t.f_guests}</label>
              <div className="rf-chip-row" role="radiogroup" aria-label={t.f_guests}>
                {t.f_guests_opts.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={guests === o}
                    className={`rf-chip${guests === o ? ' is-on' : ''}`}
                    onClick={() => setGuests(o)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <span className="rf-chip-hint">
                {guests || (lang === 'es' ? 'Selecciona número de huéspedes' : 'Pick the number of guests')}
              </span>
            </div>
            <div className="form-field full">
              <label>{t.f_pets}</label>
              <div className="rf-chip-row" role="radiogroup" aria-label={t.f_pets}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={pets === 'no'}
                  className={`rf-chip rf-chip-wide${pets === 'no' ? ' is-on' : ''}`}
                  onClick={() => setPets('no')}
                >
                  {t.f_pets_no}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={pets === 'yes'}
                  className={`rf-chip rf-chip-wide${pets === 'yes' ? ' is-on' : ''}`}
                  onClick={() => setPets('yes')}
                >
                  🐾 {t.f_pets_yes}
                </button>
              </div>
            </div>
            <div className="form-field full">
              <label>{t.f_baby}</label>
              <div className="rf-chip-row" role="radiogroup" aria-label={t.f_baby}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={baby === 'no'}
                  className={`rf-chip rf-chip-wide${baby === 'no' ? ' is-on' : ''}`}
                  onClick={() => setBaby('no')}
                >
                  {t.f_baby_no}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={baby === 'yes'}
                  className={`rf-chip rf-chip-wide${baby === 'yes' ? ' is-on' : ''}`}
                  onClick={() => setBaby('yes')}
                >
                  👶 {t.f_baby_yes}
                </button>
              </div>
            </div>
            {checkin && checkout && nightsSelected > 0 && nightsSelected < minNights && (
              <div className="rf-min-nights-warn" role="alert">
                <strong>{lang === 'es' ? '⚠ Estancia mínima' : '⚠ Minimum stay'}</strong>
                <span>
                  {lang === 'es'
                    ? `No aceptamos reservas de ${nightsSelected} ${nightsSelected === 1 ? 'noche' : 'noches'}. La estancia mínima en cualquier Hestía es de ${minNights} noches. Ajusta la fecha de salida para continuar.`
                    : `We don't accept ${nightsSelected}-night stays. Minimum stay at any Hestía is ${minNights} nights. Adjust the check-out date to continue.`}
                </span>
              </div>
            )}
            <div className="rf-step-actions">
              <button
                type="button"
                onClick={goToStep2}
                className={`btn btn-primary rf-next${!step1Ready ? ' req-btn-dis' : ''}`}
                aria-disabled={!step1Ready}
              >
                {t.check_avail}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2 — DISPONIBILIDAD Y PRECIO */}
      <section
        id="rf-step-2"
        className={`rf-step rf-step-2 ${step >= 2 ? 'is-open' : 'is-locked'} ${step > 2 ? 'is-collapsed' : ''}`}
        aria-current={step === 2 ? 'step' : undefined}
      >
        <header className="rf-step-head">
          <span className="rf-step-num">02</span>
          <h3 className="rf-step-title">{t.step2_title}</h3>
          {step === 1 && <span className="rf-step-locked-note" aria-hidden="true">🔒</span>}
        </header>
        {step >= 2 && (
          <div className="rf-step-body">
            {/* Si no hay apt elegido, mostramos los 3 Hestías con su
                disponibilidad para las fechas → el huésped elige uno. */}
            {!apt && availLoaded && (
              <div className="rf-apt-availability" aria-label={lang === 'es' ? 'Disponibilidad por Hestía' : 'Availability per Hestía'}>
                <p className="rf-apt-avail-lede">
                  {lang === 'es'
                    ? 'Estas son las Hestías disponibles para tus fechas. Elige una para continuar.'
                    : 'These are the Hestías available for your dates. Pick one to continue.'}
                </p>
                <div className="rf-apt-avail-grid">
                  {[
                    { id: 'vm', name: 'Hestía Mar',      slug: 'mar',      color: '#6B7A3A' },
                    { id: 'vt', name: 'Hestía Thalassa', slug: 'thalassa', color: '#B86A3C' },
                    { id: 'vs', name: 'Hestía Salinas',  slug: 'salinas',  color: '#D4A84A' },
                  ].map(a => {
                    const blk = avail && avail[a.id] ? avail[a.id].blocked : null;
                    const free = blk ? _resAvail(checkin, checkout, blk) : null;
                    const statusClass = free === true ? 'is-free' : free === false ? 'is-taken' : 'is-unknown';
                    const statusLabel = free === true
                      ? (lang === 'es' ? 'Disponible' : 'Available')
                      : free === false
                        ? (lang === 'es' ? 'Ocupado'  : 'Taken')
                        : (lang === 'es' ? 'Sin datos' : 'No data');
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className={`rf-apt-avail-card ${statusClass}`}
                        style={{ '--apt-c': a.color }}
                        onClick={() => setApt(a.id)}
                      >
                        <span className="rf-apt-avail-name">{a.name}</span>
                        <span className="rf-apt-avail-badge">{statusLabel}</span>
                        <span className="rf-apt-avail-cta">
                          {free === false
                            ? (lang === 'es' ? 'Envío de solicitud igualmente →' : 'Send request anyway →')
                            : (lang === 'es' ? 'Elegir y continuar →' : 'Choose and continue →')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Status badge — sólo si hay apt elegido */}
            {apt && isAvailable === true && (
              <div className="rf-status rf-status-ok">
                <span className="rf-status-icon" aria-hidden="true">✓</span>
                <span>{t.status_avail}</span>
              </div>
            )}
            {apt && isAvailable === false && (
              <div className="rf-status rf-status-taken">
                <span className="rf-status-icon" aria-hidden="true">×</span>
                <span className="rf-status-main">{t.status_taken}</span>
                <span className="rf-status-sub">{t.status_taken_sub}</span>
              </div>
            )}
            {apt && isAvailable === null && availLoaded && (
              <div className="rf-status rf-status-unknown">
                <span className="rf-status-icon" aria-hidden="true">·</span>
                <span className="rf-status-main">{t.status_no_data}</span>
                <span className="rf-status-sub">{t.status_no_data_sub}</span>
              </div>
            )}

            {/* Extras editor (chips) — primero los extras para que el
                precio que sale debajo se vea recalculándose en vivo a
                medida que el huésped marca/desmarca. */}
            {step === 2 && (
              <div className="form-field full rf-extras-block">
                <div className="form-extras-label">{t.f_extras_label}</div>
                <div className="rf-extras-chips">
                  {extrasList.map(ex => {
                    const qty = extrasSel[ex.id] || 0;
                    const checked = qty > 0;
                    const label = lang === 'es' ? ex.label_es : ex.label_en;
                    const suffix = _resExtraUnitSuffix(ex.unit, lang);
                    return (
                      <div key={ex.id} className={`rf-extra-chip${checked ? ' is-on' : ''}`}>
                        <button
                          type="button"
                          className="rf-extra-chip-btn"
                          onClick={() => (checked ? null : incExtra(ex.id))}
                          aria-label={checked ? label : (lang === 'es' ? `Añadir ${label}` : `Add ${label}`)}
                        >
                          <span className="rf-extra-chip-mark" aria-hidden="true">{checked ? '✓' : '＋'}</span>
                          <span className="rf-extra-chip-text">
                            <span className="rf-extra-chip-label">{label}</span>
                            {ex.price > 0 && (
                              <span className="rf-extra-chip-price">{ex.price} €{suffix}</span>
                            )}
                          </span>
                        </button>
                        {checked && (
                          <div
                            className="rf-extra-stepper"
                            role="group"
                            aria-label={lang === 'es' ? `Cantidad de ${label}` : `Quantity of ${label}`}
                          >
                            <button
                              type="button"
                              className="rf-extra-step-btn"
                              onClick={() => decExtra(ex.id)}
                              aria-label={lang === 'es' ? 'Quitar uno' : 'Remove one'}
                            >−</button>
                            <span className="rf-extra-step-num" aria-live="polite">{qty}</span>
                            <button
                              type="button"
                              className="rf-extra-step-btn"
                              onClick={() => incExtra(ex.id)}
                              disabled={qty >= maxForExtra(ex)}
                              aria-label={lang === 'es' ? 'Añadir uno' : 'Add one'}
                            >+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price — debajo de los extras para que el huésped vea cómo
                cambia el total al añadir cada extra. */}
            {calc && (
              <PricePreview apt={apt} checkin={checkin} checkout={checkout} pets={pets} guests={guests} lang={lang} extras={selectedExtras}/>
            )}

            {step === 2 && (
              <div className="rf-step-actions">
                <button type="button" className="btn btn-primary rf-next" onClick={goToStep3}>
                  {t.continue_to_send}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3 — CANAL */}
      <section
        id="rf-step-3"
        className={`rf-step rf-step-3 ${step >= 3 ? 'is-open' : 'is-locked'}`}
        aria-current={step === 3 ? 'step' : undefined}
      >
        <header className="rf-step-head">
          <span className="rf-step-num">03</span>
          <h3 className="rf-step-title">{t.step3_title}</h3>
          {step < 3 && <span className="rf-step-locked-note" aria-hidden="true">🔒</span>}
        </header>
        {step >= 3 && (
          <div className="rf-step-body">
            <div className="rf-channel-label">{t.channel_label}</div>
            <div className="rf-channels" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={channel === 'whatsapp'}
                className={`rf-channel ${channel === 'whatsapp' ? 'is-active' : ''}`}
                onClick={() => setChannel('whatsapp')}
              >
                <span className="rf-channel-name">{t.channel_wa}</span>
                <span className="rf-channel-desc">{t.channel_wa_desc}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={channel === 'email'}
                className={`rf-channel ${channel === 'email' ? 'is-active' : ''}`}
                onClick={() => setChannel('email')}
              >
                <span className="rf-channel-name">{t.channel_email}</span>
                <span className="rf-channel-desc">{t.channel_email_desc}</span>
              </button>
            </div>

            <form className="reservas-form rf-channel-form" onSubmit={send}>
              <div className="form-field full">
                <label>{t.f_name}</label>
                <input type="text" placeholder={t.f_name_ph} value={name}
                  onChange={e => setName(e.target.value)} required autoComplete="name"/>
              </div>
              {channel === 'whatsapp' ? (
                <div className="form-field full">
                  <label>{t.f_tel}</label>
                  <input type="tel" placeholder={t.f_tel_ph} value={tel}
                    onChange={e => setTel(e.target.value)} required autoComplete="tel"/>
                </div>
              ) : (
                <div className="form-field full">
                  <label>{t.f_email}</label>
                  <input type="email" placeholder={t.f_email_ph} value={email}
                    onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
                </div>
              )}
              <div className="form-field full">
                <label>{t.f_comments}</label>
                <textarea placeholder={t.f_comments_ph} value={comments}
                  onChange={e => setComments(e.target.value)}/>
              </div>
              <div className="rf-step-actions">
                <button
                  type="submit"
                  className={`btn btn-primary reservas-submit${!channelValid ? ' req-btn-dis' : ''}`}
                  aria-disabled={!channelValid}
                >
                  {channel === 'whatsapp' ? t.send_wa : t.send_email}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};

const ReservasAside = ({ lang }) => {
  const t = RESERVAS_COPY[lang];
  return (
    <aside className="reservas-aside">
      <h2 className="reservas-aside-title">{t.aside_title}</h2>
      <div className="reservas-person-card" style={{ '--card-accent': 'var(--sol)' }}>
        <div className="r-avatar">
          <img decoding="async" src="assets/photo-alex.jpg" alt="Alex Berruezo" width="731" height="1014" loading="lazy" onError={e => { e.currentTarget.style.display='none'; }}/>
        </div>
        <div>
          <div className="r-name">Alex Berruezo</div>
          <div className="r-lang">🇪🇸 Español</div>
          <div className="r-role">{lang === 'es' ? 'Reserva · Antes de tu llegada' : 'Booking · Before you arrive'}</div>
        </div>
        <div className="r-actions">
          <a href="https://wa.me/34620316370" className="btn btn-primary" target="_blank" rel="noopener">
            WhatsApp <span className="arrow">→</span>
          </a>
          <a href="tel:+34620316370" className="btn btn-ghost-dark">+34 620 316 370</a>
        </div>
      </div>
      <div className="reservas-person-card" style={{ '--card-accent': 'var(--vt)' }}>
        <div className="r-avatar" style={{ background: 'var(--vt)' }}>
          <img decoding="async" src="assets/photo-fran.jpg" alt="Fran Moral" width="925" height="2000" loading="lazy" onError={e => { e.currentTarget.style.display='none'; }}/>
        </div>
        <div>
          <div className="r-name">Fran Moral</div>
          <div className="r-lang" style={{ color: 'var(--vt)' }}>🇬🇧 English</div>
          <div className="r-role">{lang === 'es' ? 'Estancia · Mientras estás aquí' : 'Stay · While you are here'}</div>
        </div>
        <div className="r-actions">
          <a href="https://wa.me/34654138251" className="btn btn-primary" target="_blank" rel="noopener">
            WhatsApp <span className="arrow">→</span>
          </a>
          <a href="tel:+34654138251" className="btn btn-ghost-dark">+34 654 138 251</a>
        </div>
      </div>
      <div className="reservas-guarantee">
        <div className="rg-title">{t.guarantee_title}</div>
        <p className="rg-lede">
          {lang === 'es'
            ? 'Mejor precio garantizado · sin comisiones · respuesta humana en menos de 24 h.'
            : 'Best price guaranteed · no commissions · human reply within 24 h.'}
        </p>
        <button
          type="button"
          className="rg-cta"
          onClick={() => window.dispatchEvent(new Event('hestia:open-direct-perks'))}
          aria-haspopup="dialog"
        >
          {lang === 'es' ? 'Ver todas las ventajas' : 'See all perks'}
          <span className="rg-cta-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  );
};

const ReservasPageApp = () => {
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();
  useReveal();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Reservas · Hestía Your Home · Vera Playa'
      : 'Book · Hestía Your Home · Vera Playa';
  }, [lang]);

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <ReservasHero lang={lang} />
        <FraseHogar lang={lang} />
        <div className="reservas-body">
          <div className="reservas-inner">
            <ReservasForm lang={lang} />
            <ReservasAside lang={lang} />
          </div>
        </div>
        <QuickFAQ lang={lang} pageId="reservas" />
        <ContactCTA lang={lang} />
      </main>
      <Footer lang={lang} />
      <WidgetStack lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ReservasPageApp/>);
