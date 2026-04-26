// ================================================================
// HESTÍA — Páginas legales: Cookies + Privacidad
// Selecciona cuál renderizar con window.__LEGAL__ ('cookies' | 'privacidad')
// ================================================================

const LEGAL_COPY = {
  cookies: {
    es: {
      title: 'Política de Cookies',
      eyebrow: 'Legal · Cookies',
      sections: [
        {
          h: '¿Qué son las cookies?',
          p: 'Las cookies son pequeños archivos de texto que los sitios web colocan en tu dispositivo cuando los visitas. Nos ayudan a que el sitio funcione correctamente y a recordar tus preferencias.',
        },
        {
          h: 'Cookies que utilizamos',
          items: [
            { name: 'hestia-lang', type: 'Preferencia', duration: 'Permanente', desc: 'Recuerda el idioma que elegiste (ES/EN).' },
            { name: 'hestia-cookies', type: 'Consentimiento', duration: 'Permanente', desc: 'Guarda tu elección sobre esta política de cookies.' },
          ],
        },
        {
          h: 'Cookies de terceros',
          p: 'Este sitio no usa Google Analytics, píxeles de seguimiento ni publicidad. No hay cookies de terceros. Los enlaces a WhatsApp y correo electrónico abren aplicaciones externas pero no colocan cookies en tu dispositivo.',
        },
        {
          h: 'Cómo gestionar las cookies',
          p: 'Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Si eliminas "hestia-lang", la web volverá al idioma por defecto. Si eliminas "hestia-cookies", verás de nuevo el aviso de cookies.',
        },
        {
          h: 'Más información',
          p: 'Para cualquier consulta sobre nuestra política de cookies escríbenos a info@hestiayourhome.com.',
        },
      ],
    },
    en: {
      title: 'Cookie Policy',
      eyebrow: 'Legal · Cookies',
      sections: [
        {
          h: 'What are cookies?',
          p: 'Cookies are small text files that websites place on your device when you visit them. They help the site work correctly and remember your preferences.',
        },
        {
          h: 'Cookies we use',
          items: [
            { name: 'hestia-lang', type: 'Preference', duration: 'Permanent', desc: 'Remembers the language you chose (ES/EN).' },
            { name: 'hestia-cookies', type: 'Consent', duration: 'Permanent', desc: 'Stores your choice about this cookie policy.' },
          ],
        },
        {
          h: 'Third-party cookies',
          p: 'This site does not use Google Analytics, tracking pixels or advertising. There are no third-party cookies. Links to WhatsApp and email open external applications but do not place cookies on your device.',
        },
        {
          h: 'How to manage cookies',
          p: 'You can delete or block cookies from your browser settings. If you delete "hestia-lang", the site will revert to the default language. If you delete "hestia-cookies", the cookie notice will appear again.',
        },
        {
          h: 'More information',
          p: 'For any questions about our cookie policy write to us at info@hestiayourhome.com.',
        },
      ],
    },
  },
  privacidad: {
    es: {
      title: 'Política de Privacidad',
      eyebrow: 'Legal · Privacidad',
      sections: [
        {
          h: 'Responsable del tratamiento',
          p: 'Alex Berruezo y Francisco Moral, propietarios de Hestía Your Home. Dirección: Calle Islas Canarias 7, 04621 Vera Playa, Almería. Email: info@hestiayourhome.com.',
        },
        {
          h: 'Datos que recogemos',
          p: 'Solo recogemos los datos que tú nos proporcionas voluntariamente al escribirnos por WhatsApp, teléfono o email para reservar o consultar. No existen formularios de captación de datos en esta web.',
        },
        {
          h: 'Finalidad del tratamiento',
          p: 'Gestionamos los datos de contacto exclusivamente para responder a tu consulta o gestionar tu reserva. No usamos los datos para ningún otro fin ni los cedemos a terceros.',
        },
        {
          h: 'Base legal',
          p: 'El tratamiento se basa en tu consentimiento explícito al ponerte en contacto con nosotros (art. 6.1.a RGPD) y en la ejecución del contrato de arrendamiento (art. 6.1.b RGPD).',
        },
        {
          h: 'Conservación',
          p: 'Conservamos los datos durante el tiempo necesario para gestionar la relación contigo y cumplir con las obligaciones legales derivadas del alquiler turístico (hasta 5 años según normativa fiscal).',
        },
        {
          h: 'Tus derechos',
          p: 'Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación y portabilidad escribiéndonos a info@hestiayourhome.com. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        },
        {
          h: 'Seguridad',
          p: 'Esta web no almacena datos personales en servidores propios. Las comunicaciones a través de WhatsApp se rigen por la política de privacidad de Meta. Las comunicaciones por email se rigen por la política de tu proveedor de correo.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      eyebrow: 'Legal · Privacy',
      sections: [
        {
          h: 'Data controller',
          p: 'Alex Berruezo and Francisco Moral, owners of Hestía Your Home. Address: Calle Islas Canarias 7, 04621 Vera Playa, Almería, Spain. Email: info@hestiayourhome.com.',
        },
        {
          h: 'Data we collect',
          p: 'We only collect data that you voluntarily provide when writing to us via WhatsApp, phone or email to book or enquire. There are no data capture forms on this website.',
        },
        {
          h: 'Purpose of processing',
          p: 'We use contact data exclusively to respond to your enquiry or manage your booking. We do not use the data for any other purpose or share it with third parties.',
        },
        {
          h: 'Legal basis',
          p: 'Processing is based on your explicit consent when contacting us (Art. 6.1.a GDPR) and on the performance of the rental contract (Art. 6.1.b GDPR).',
        },
        {
          h: 'Retention',
          p: 'We retain data for the time necessary to manage the relationship and comply with legal obligations arising from holiday rentals (up to 5 years under tax regulations).',
        },
        {
          h: 'Your rights',
          p: 'You can exercise your rights of access, rectification, erasure, restriction and portability by writing to info@hestiayourhome.com. You may also lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).',
        },
        {
          h: 'Security',
          p: 'This website does not store personal data on its own servers. WhatsApp communications are governed by Meta\'s privacy policy. Email communications are governed by your email provider\'s policy.',
        },
      ],
    },
  },
};

const LegalHero = ({ copy }) => (
  <section className="page-hero legal-hero">
    <div className="stars"/>
    <div className="page-hero-content">
      <div className="eyebrow">{copy.eyebrow}</div>
      <h1 style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}>{copy.title}</h1>
    </div>
  </section>
);

const CookieTable = ({ items, lang }) => (
  <div className="legal-cookie-table">
    <div className="cookie-row cookie-head">
      <span>{lang === 'es' ? 'Nombre' : 'Name'}</span>
      <span>{lang === 'es' ? 'Tipo' : 'Type'}</span>
      <span>{lang === 'es' ? 'Duración' : 'Duration'}</span>
      <span>{lang === 'es' ? 'Descripción' : 'Description'}</span>
    </div>
    {items.map((it, i) => (
      <div key={i} className="cookie-row">
        <span className="cookie-name">{it.name}</span>
        <span>{it.type}</span>
        <span>{it.duration}</span>
        <span>{it.desc}</span>
      </div>
    ))}
  </div>
);

const LegalContent = ({ copy, lang }) => (
  <section className="legal-content section-cream">
    <div className="container">
      <div className="legal-body">
        {copy.sections.map((s, i) => (
          <div key={i} className="legal-section">
            <h3>{s.h}</h3>
            {s.p && <p>{s.p}</p>}
            {s.items && <CookieTable items={s.items} lang={lang}/>}
          </div>
        ))}
        <div className="legal-footer-note">
          <p style={{ opacity: 0.5, fontSize: 13 }}>
            {lang === 'es'
              ? `Última actualización: ${new Date().getFullYear()}`
              : `Last updated: ${new Date().getFullYear()}`}
          </p>
        </div>
      </div>
    </div>
  </section>
);

const LegalPageApp = () => {
  const type = window.__LEGAL__ || 'privacidad';
  const [lang, setLang] = React.useState(() => localStorage.getItem('hestia-lang') || 'es');
  const { mode, scrolled } = useScrollMode();

  React.useEffect(() => {
    localStorage.setItem('hestia-lang', lang);
    document.documentElement.lang = lang;
    const copy = LEGAL_COPY[type][lang];
    document.title = `${copy.title} · Hestía Your Home`;
  }, [lang]);

  const copy = LEGAL_COPY[type][lang];

  return (
    <>
      <Topbar lang={lang} setLang={setLang} />
      <Header mode={mode} scrolled={scrolled} lang={lang} />
      <main>
        <LegalHero copy={copy}/>
        <LegalContent copy={copy} lang={lang}/>
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} />
      <Cookies lang={lang} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<LegalPageApp/>);
