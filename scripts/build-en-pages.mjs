/**
 * build-en-pages.mjs
 *
 * Cada página principal tiene una URL por idioma: /x.html en español y /en/x.html
 * en inglés. El HTML en español es la fuente (se edita a mano); este script:
 *
 *   1. Deja en cada página en español el script lang-url.js y los hreflang
 *      es / en / x-default apuntando a su par (idempotente).
 *   2. Genera docs/en/<página>.html a partir de ella: <html lang="en">, <base href="/">,
 *      título, descripción, Open Graph, canonical y hreflang en inglés, JSON-LD
 *      traducido (sin FAQPage: Google ya casi no la muestra y no hay versión
 *      inglesa en el HTML) y el texto rastreable (seo-fallback) en inglés.
 *   3. Añade las URLs inglesas al sitemap y apunta el hreflang "en" de las españolas.
 *
 * Lo ejecuta build-jsx.js al final (el HTML en español cambia con cada build).
 * Uso:  node scripts/build-en-pages.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const BASE = 'https://www.hestiayourhome.com';
const SITEMAP = join(DOCS, 'sitemap.xml');
const START = '<!-- en:start -->';
const END = '<!-- en:end -->';

const NAV = `<nav aria-label="Hestía"><a href="/en/">Home</a> · <a href="/en/mar.html">Hestía Mar</a> · <a href="/en/thalassa.html">Hestía Thalassa</a> · <a href="/en/salinas.html">Hestía Salinas</a> · <a href="/en/reservas.html">Book</a> · <a href="/en/estancias-largas.html">Long stays</a> · <a href="/en/opiniones.html">Reviews</a> · <a href="/en/nosotros.html">About us</a> · <a href="/en/contacto.html">Contact</a> · <a href="/guia-vera/en/">Guide extract</a></nav>`;

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const liveKey = () => {
  const m = readFileSync(join(DOCS, 'components/noticias-page.jsx'), 'utf8').match(/"es": "(\p{L}+) (\d{4})"/u);
  const i = m ? MONTHS_ES.findIndex(x => x.toLowerCase() === m[1].toLowerCase()) : -1;
  return i < 0 ? null : `${m[2]}-${String(i + 1).padStart(2, '0')}`;
};

// slug → inglés
const PAGES = {
  index: {
    title: 'Hestía Your Home · Your home in Vera Playa, Almería',
    desc: 'Three apartments in Vera Playa, Almería: Mar, Thalassa and Salinas. We run them ourselves, Alex and Fran, since 2016. Book direct, no commissions.',
    ogTitle: 'Hestía Your Home · Three Hestías in Vera Playa, Almería',
    fb: `<h1>Hestía Your Home · Your home in Vera Playa, Almería</h1>
  <p>Three holiday apartments in Vera Playa (Almería), run directly by Alex and Fran since 2016, with no intermediaries and no platform commissions.</p>
  <h2>The three apartments</h2>
  <p>Hestía Mar is the closest to the beach, 300 metres away, with a 20 m² corner terrace, palm trees and partial sea views. Hestía Thalassa is the penthouse, with panoramic views over the Mediterranean and the Salar de los Canos, a shared spa, pools and padel and tennis courts in the complex. Hestía Salinas is the largest, with two terraces and the Salinas de Puerto Rey bird reserve a short walk away.</p>
  <p>All three have 2 bedrooms, space for 6 guests plus a baby, a pool, a full kitchen, air conditioning, fibre WiFi and a Smart TV with streaming platforms included. Pets are welcome in all three, on prior request and with a supplement.</p>
  <h2>The area: Vera Playa and the Almería Levante</h2>
  <p>Vera Playa is the base for exploring the Almería Levante: Mojácar, Garrucha, the Cabo de Gata Natural Park, the Tabernas Desert and the beaches of Villaricos and Palomares.</p>
  <h2>Direct booking</h2>
  <p>When you book direct we don't just match the price you find on another portal, we improve on it, with 0% commission and a human reply within two hours. Hundreds of guest reviews with an outstanding average.</p>
  <p>Tourist licences VFT/AL/01580, VFT/AL/05535 and VFT/AL/07056.</p>`,
  },
  mar: {
    title: 'Hestía Mar · Apartment in Vera Playa, Almería',
    desc: 'Hestía Mar, holiday apartment in Vera Playa with a corner terrace and partial sea views. Pets welcome. Almería. Run directly by Alex and Fran.',
    ogTitle: 'Hestía Mar · Apartment in Vera Playa with terrace and partial sea views',
    fb: `<h1>Hestía Mar · Apartment in Vera Playa, Almería</h1>
  <p>Hestía Mar is a holiday apartment in Vera Playa (Almería), 300 metres from the beach, the closest to the sea of the three Hestías. You can walk there, no car needed.</p>
  <p>Its 20 m² corner terrace looks towards the Mediterranean among the palm trees and is where the day begins. The complex garden has a shared pool, jacuzzi and children's playground.</p>
  <p>Two bedrooms and space for 6 guests plus a baby, with a cot and high chair on request. Two bathrooms: one with a hydrotherapy column and chromotherapy mirror, the other with a shower. Full kitchen with dishwasher and washing machine, ducted air conditioning, fibre WiFi and covered garage.</p>
  <p>A 55-inch Smart TV with SkyShowtime, HBO Max, Prime Video and Disney+ active from the first minute of your stay.</p>
  <p>Pets are welcome on prior request, with a moderate supplement per night. There is a minimum stay, a little higher in peak season, and an additional guest carries a small supplement.</p>
  <p>Tourist licence VFT/AL/01580.</p>`,
  },
  thalassa: {
    title: 'Hestía Thalassa · Apartment in Vera Playa, Almería',
    desc: 'Hestía Thalassa, penthouse with a panoramic sea-view terrace and shared spa. Holiday rental in the Al Andalus Thalassa complex, Vera Playa, Almería. Run directly by Alex and Fran.',
    ogTitle: 'Hestía Thalassa · Penthouse with sea views and spa · Vera Playa',
    fb: `<h1>Hestía Thalassa · Apartment in Vera Playa, Almería</h1>
  <p>Hestía Thalassa is the penthouse of the Al Andalus Thalassa complex, in Vera Playa (Almería). From its 18 m² panoramic terrace you see the Mediterranean on one side and the Salar de los Canos on the other.</p>
  <p>The complex has two outdoor pools (north and south), gardens, parks and padel and tennis courts, and a shared spa with heated pool, jacuzzi, sauna, foot bath, gym and relaxation area (the spa opens in autumn, winter and spring; the gym all year).</p>
  <p>Two bedrooms and space for 6 guests plus a baby. Two en-suite bathrooms with hydromassage columns and a full kitchen with a high-end dishwasher and washing machine. Air conditioning in the living room and bedrooms, fibre WiFi and a Nespresso machine.</p>
  <p>It is the apartment with the most streaming platforms: SkyShowtime, HBO Max, Prime Video, Movistar Plus and Disney+, all active.</p>
  <p>The beach is 1.5 kilometres away. Pets are welcome on prior request, with a moderate supplement per night. There is a minimum stay, a little higher in peak season.</p>
  <p>Tourist licence VFT/AL/05535.</p>`,
  },
  salinas: {
    title: 'Hestía Salinas · Apartment in Vera Playa, Almería',
    desc: 'Hestía Salinas, the largest of the three, near the Salinas de Puerto Rey, with large gardens and streams. Pueblo Salinas complex, Vera Playa, Almería. Run directly by Alex and Fran.',
    ogTitle: 'Hestía Salinas · The largest apartment, near the Salinas de Puerto Rey',
    fb: `<h1>Hestía Salinas · Apartment in Vera Playa, Almería</h1>
  <p>Hestía Salinas is the largest of the three apartments, in Vera Playa (Almería). It has two terraces: an 18 m² one for sun and moonlight, and a 14 m² one facing the sunset.</p>
  <p>It is next to the Salinas de Puerto Rey bird reserve, a short walk away. The beach is 900 metres away.</p>
  <p>Two bedrooms and space for 6 guests plus a baby. A bathtub with hydromassage and a hydromassage shower cabin. Full kitchen with dishwasher and washing machine, heating and cooling air conditioning, and fibre WiFi.</p>
  <p>A 55-inch Smart TV with Ambilight and streaming included: SkyShowtime, HBO Max, Prime Video and Disney+.</p>
  <p>The complex has a pool, padel and tennis courts and large gardens with streams. The main bedroom has a feather duvet and a hypoallergenic alternative.</p>
  <p>Pets are welcome on prior request, with a moderate supplement per night. There is a minimum stay, a little higher in peak season.</p>
  <p>Tourist licence VFT/AL/07056.</p>`,
  },
  reservas: {
    title: 'Book · Hestía Your Home · Vera Playa',
    desc: "Book direct with Alex and Fran. We don't just match the price, we improve on it. 0% commission. Hestía Your Home, Vera Playa, Almería.",
    fb: `<h1>Book · Hestía Your Home · Vera Playa</h1>
  <p>Check availability and price for the three Hestía apartments in Vera Playa (Almería): Mar, Thalassa and Salinas.</p>
  <p>When you book direct we don't just match the price you find on Booking, Airbnb or any other portal, we improve on it. 0% commission, because there is no intermediary taking a cut.</p>
  <p>The process is simple: you pick your dates, we confirm availability and price, you sign the contract with a deposit and pay the rest on arrival. The reply is human and arrives within two hours, usually within minutes.</p>
  <p>There is a minimum stay, a little higher in peak season. An additional guest and pets carry a small supplement per night. The conditions and the exact amount appear when you choose dates.</p>
  <p>For stays of a month or more, see the long stays: a fixed monthly rate, available from September to June.</p>
  <p>All overnight guests are registered on the traveller register, as Spanish regulations require.</p>`,
  },
  'estancias-largas': {
    title: 'Long stays in Vera Playa · Remote work and winter',
    desc: 'Rent for a month or a season in Vera Playa, Almería. Apartments equipped for remote work and companies. Fixed monthly rate, no intermediaries.',
    fb: `<h1>Long stays in Vera Playa · Remote work and winter</h1>
  <p>Stays of a month or more in Vera Playa (Almería), designed for remote work, winter seasons or long stays on the Almería coast.</p>
  <p>Available from September to June. We do not offer long stays in July and August.</p>
  <p>The rate is monthly and fixed, and varies by season. Christmas (23 December to 6 January) and Easter carry a supplement. Check the current price on the website.</p>
  <p>It includes fibre WiFi, a full kitchen, washing machine, heating and cooling air conditioning, and access to the shared areas of each complex: a pool in all three and, at Thalassa, a shared spa with sauna and gym.</p>
  <p>Vera Playa has services all year, a mild winter climate and good connections to Almería, Murcia and the airports in the area, which makes it comfortable for spending the cold season.</p>
  <p>Pets are welcome on prior request. Tell us your dates and we confirm availability and a fixed price.</p>`,
  },
  opiniones: {
    title: 'Reviews · Hestía Your Home · Vera Playa',
    desc: 'More than 630 families and 10 years of near-perfect ratings. Hestía Your Home, Vera Playa, Almería.',
    fb: `<h1>Reviews · Hestía Your Home · Vera Playa</h1>
  <p>Reviews from guests who have stayed at the three Hestías in Vera Playa, with an outstanding average rating.</p>
  <p>They are collected from Booking, Airbnb, Google and the website's own form, and published as written, without filtering out the ones that point to something to improve.</p>
  <p>You can filter them by apartment and see the rating for Hestía Mar, Hestía Thalassa and Hestía Salinas separately.</p>
  <p>What guests mention most: cleanliness on arrival, how quickly we reply during the stay, and the terraces. We take responsibility for the apartment being spotless, for everything working and for being available while you are here.</p>
  <p>If you have stayed with us, you can leave your review on the website.</p>`,
  },
  nosotros: {
    title: 'About Hestía · Who we are and why Hestía · Vera Playa',
    desc: 'Alex and Fran, the origin of the name Hestía, the Greek goddess of the home, the six values of the brand and our bond with Vera Playa, Almería, since 2016.',
    fb: `<h1>About Hestía · Who we are and why Hestía · Vera Playa</h1>
  <p>We, Alex and Fran, have run Hestía Your Home since 2016, in Vera Playa (Almería). We are not an agency or a management company: they are our three apartments and we look after them ourselves.</p>
  <p>Alex takes care of the booking and everything before you arrive: availability, price, contract and your questions before the trip. Fran takes care of the stay and everything that happens once you are here.</p>
  <p>That is the difference from booking through a portal: there is a person behind it who knows the apartment, the complex and the area, and who replies within minutes.</p>
  <h2>Why Hestía is called Hestía</h2>
  <p>In Greek mythology, Hestia was the goddess of the hearth and the sacred fire, the one who kept the flame at the centre of the house while the rest of Olympus divided up war, love and power. That fire turned a house into a home, and it was honoured before leaving on a journey and on returning.</p>
  <p>Fran is a classical philologist and Alex a computer engineer. When it was time to name the project, the name already existed: Hestía, the one who turns a place into a home.</p>
  <p>The monogram is an H worked in glazed teal. The two columns are the house, the double curve is at once an olive leaf (the Almería olive grove) and a wave crest (the Mediterranean 300 metres away), and in the stroke remains the silhouette of the roof of the previous logo, the one that accompanied us for almost a decade.</p>
  <h2>Our values</h2>
  <p>Each letter of Hestía names a value: Hospitality, Listening, Simplicity, Transparency, Integrity and Roots. Six ideas that add up to one: trust.</p>
  <h2>Our bond with Almería</h2>
  <p>We do not live in Vera Playa, but we have been tied to Almería all our lives. It is the sunniest province in Europe, with more than 320 days of sun a year, and it is still not the best known: that is precisely what protects it. Every Hestía looks out on the same Mediterranean.</p>
  <p>We prepare every arrival the same way: ironed 200-thread-count sheets, 600 g/m² towels, feather duvets, a welcome kit, air conditioning set to the season, and a cot and high chair set up if you asked for them.</p>
  <p>All three apartments are registered with the Andalusian tourism register under licences VFT/AL/01580, VFT/AL/05535 and VFT/AL/07056.</p>`,
  },
  empresas: {
    title: 'Hestía for companies and teams · Vera Playa, Almería',
    desc: 'Equipped apartments in Vera Playa for companies, clinics, clubs and estate agents. Direct booking with no commission and direct contact with the owners.',
    fb: `<h1>Hestía for companies and teams · Vera Playa, Almería</h1>
  <p>Accommodation for companies, teams and business travel in Vera Playa (Almería).</p>
  <p>All three apartments have 2 bedrooms and space for 6 people, fibre WiFi, a full kitchen and room to work, which makes them practical for relocated teams, film shoots, building works or seasonal projects in the Almería Levante.</p>
  <p>We work with invoices, a contract and terms agreed in writing. For long stays, from one month onwards, we apply a fixed monthly rate.</p>
  <p>The area concentrates intensive agriculture, energy and construction, as well as film shoots in the Tabernas Desert, about 30 minutes by car.</p>
  <p>Direct management with Alex and Fran, no intermediaries, with a reply in under two hours. Tell us your dates, number of people and needs and we will prepare a proposal.</p>`,
  },
  contacto: {
    title: 'Contact · Hestía Your Home · Vera Playa',
    desc: 'Book direct with no intermediaries. Talk to Alex or Fran by WhatsApp, phone or email. Hestía Your Home, Vera Playa, Almería.',
    fb: `<h1>Contact · Hestía Your Home · Vera Playa</h1>
  <p>Talk directly to Alex and Fran, who run the three Hestía apartments in Vera Playa (Almería).</p>
  <p>We reply within two hours, from 9:00 to 22:00, and usually within minutes. There is no switchboard or form that gets lost: you write and a person answers.</p>
  <p>Email: info@hestiayourhome.com. Phone and WhatsApp: +34 654 138 251 (Fran, English) and +34 620 316 370 (Alex, Spanish).</p>
  <p>Write to us to check availability and price, to ask questions before booking, to request a cot, high chair or garage space, to let us know you travel with a pet, or to ask anything about the area.</p>
  <p>We are in Vera, Almería (04621), on the Almería Levante coast, between Garrucha and Villaricos.</p>
  <p>You can check our tourist licences VFT/AL/01580, VFT/AL/05535 and VFT/AL/07056 or our privacy policy before booking.</p>`,
  },
  normas: {
    title: 'House rules · Hestía Your Home',
    desc: 'The house rules at Hestía Mar, Thalassa and Salinas: check-in and check-out, pets, shared areas and living alongside the neighbours in Vera Playa.',
    fb: `<h1>House rules · Hestía Your Home</h1>
  <p>The rules for using the three Hestía apartments in Vera Playa, published before you book so there are no surprises. They come from the contract you sign and exist so that you, the next guests and the neighbours can all enjoy the place.</p>
  <p>Check-in from 15:00 and check-out before 11:00. We need that margin to get the apartment ready for the next arrival. Early check-in and late check-out are subject to availability. Arrival is self check-in by default; in-person arrival is free between 15:00 and 19:00 and, outside those hours, carries a cost and is subject to availability.</p>
  <p>Hestía is only for the people on the booking, never for third parties. All overnight guests go on the contract and on the traveller register, as Spanish regulations require.</p>
  <p>No smoking inside the apartment, in any room. Towels stay inside Hestía: for the pool and the beach, everyone brings their own. Laundry is hung only on the clothes rack, never on railings or on the terrace.</p>
  <p>Rest is respected, yours and the neighbours', avoiding noise, music or commotion at unsociable hours. When you go out, tidy the terrace (cushions, awning and plants), especially if it is windy or bad weather is forecast.</p>
  <p>In shared areas the rules of each complex apply, especially pool hours. Naturism and topless sunbathing are not allowed in any area of the complex. Drive slowly inside the community: there are children, pets and pedestrians.</p>
  <p>Relieving oneself in the pool and shared areas is strictly forbidden. Babies must always swim in a swim nappy. Minors remain the responsibility of their parents or guardians.</p>
  <p>Pets are welcome in all three apartments, always on prior request and with a moderate supplement per night, with a cap per stay.</p>
  <p>Look after the equipment and furniture: we do an inventory after the stay. And look after the surroundings, without wasting electricity or water and without leaving the air conditioning on with the windows open or when you go out.</p>
  <p>Anything can break or fail. What we guarantee is that we will be on hand and do everything we can to solve it as soon as possible.</p>`,
  },
  noticias: {
    title: 'News & Blog · Hestía Your Home · Vera Playa, Almería',
    desc: 'What is on in Vera Playa, Almería, Andalusia and Murcia. Recommendations and curiosities from each Hestía. Updated monthly.',
    fb: null,
  },
};

const LD = {
  'Tres Hestías, viviendas turísticas gestionadas directamente en Vera Playa por Alex y Fran. Desde 2016.': 'Three Hestías, holiday homes run directly in Vera Playa by Alex and Fran. Since 2016.',
  'Transferencia bancaria, Bizum, tarjeta, PayPal, efectivo': 'Bank transfer, Bizum, card, PayPal, cash',
  'Levante almeriense': 'Almería Levante',
  'Co-propietario y gestor de Hestía Your Home': 'Co-owner and manager of Hestía Your Home',
  'Se ocupa de la reserva: disponibilidad, precio, contrato y las dudas previas al viaje.': 'Takes care of the booking: availability, price, contract and questions before the trip.',
  'Se ocupa de la estancia: está aquí mientras el huésped está aquí.': 'Takes care of the stay: is here while the guest is here.',
  'Reserva una Hestía': 'Book a Hestía',
  'Terraza esquinera 20m²': 'Corner terrace 20 m²',
  'Vistas al mar': 'Partial sea views',
  'Vistas parciales al mar': 'Partial sea views',
  'Piscina comunitaria': 'Shared pool',
  'Jacuzzi comunitario': 'Shared jacuzzi',
  'Parque infantil comunitario': 'Shared children\'s playground',
  'Bañera': 'Bathtub',
  'Mascotas permitidas': 'Pets allowed',
  'Aire acondicionado': 'Air conditioning',
  'Calle Islas Canarias 7': 'Calle Islas Canarias 7',
  'Terraza panorámica con vistas al mar': 'Panoramic terrace with sea views',
  'Vistas al mar y al Salar de los Canos': 'Views of the sea and the Salar de los Canos',
  'SPA comunitario': 'Shared spa',
  'Pistas de pádel y tenis': 'Padel and tennis courts',
  'Piscina climatizada': 'Heated pool',
  'Gimnasio': 'Gym',
  'Jardines con riachuelos': 'Gardens with streams',
  'Dos terrazas': 'Two terraces',
  'Reserva de aves Salinas de Puerto Rey': 'Salinas de Puerto Rey bird reserve',
  'Estancia larga Hestía Your Home · Vera Playa': 'Hestía Your Home long stay · Vera Playa',
  'Apartamentos equipados para teletrabajadores, empresas y estancias prolongadas en Vera Playa. Disponible septiembre–junio.': 'Apartments equipped for remote workers, companies and extended stays in Vera Playa. Available September to June.',
  'Noticias & Blog · Hestía Your Home': 'News & Blog · Hestía Your Home',
  'Noticias mensuales sobre Vera Playa, Almería, Andalucía y Murcia. Recomendaciones de los anfitriones.': 'Monthly news about Vera Playa, Almería, Andalusia and Murcia. Recommendations from the hosts.',
  'Inicio': 'Home', 'Reservas': 'Book', 'Estancias largas': 'Long stays', 'Opiniones': 'Reviews', 'Nosotros': 'About us',
  'Para empresas': 'For companies', 'Contacto': 'Contact', 'Noticias': 'News',
};
const LD_DESC = /^Hestía (Mar|Thalassa|Salinas), /;
const LD_LONG = {
  mar: 'Hestía Mar, holiday apartment in Vera Playa. 20 m² corner terrace and partial sea views. 2 bedrooms, 6 guests + baby. Pets welcome. Almería. Run directly by Alex and Fran.',
  thalassa: 'Hestía Thalassa, penthouse with a panoramic terrace over the sea and shared spa. 2 bedrooms, 6 guests + baby. Al Andalus Thalassa complex, Vera Playa, Almería.',
  salinas: 'Hestía Salinas, near the Salinas de Puerto Rey. 87 m², shared pool, padel and tennis courts, two terraces and large gardens with streams. 2 bedrooms, 6 guests + baby. Vera Playa, Almería.',
};
const LD_ADDR = { 'Hestía Thalassa, Urbanización Al Andalus Thalassa': 'Hestía Thalassa, Al Andalus Thalassa complex', 'Hestía Salinas, Urbanización Pueblo Salinas': 'Hestía Salinas, Pueblo Salinas complex' };

const TWINS = Object.keys(PAGES);
const esUrl = s => (s === 'index' ? `${BASE}/` : `${BASE}/${s}.html`);
const enUrl = s => (s === 'index' ? `${BASE}/en/` : `${BASE}/en/${s}.html`);
const esc = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function translateLd(node, slug) {
  if (Array.isArray(node)) return node.map(n => translateLd(n, slug));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === 'description' && typeof v === 'string' && LD_DESC.test(v) && LD_LONG[slug]) out[k] = LD_LONG[slug];
      else if (k === 'item' && typeof v === 'string') out[k] = TWINS.find(s => esUrl(s) === v) ? enUrl(TWINS.find(s => esUrl(s) === v)) : v;
      else if (k === 'url' && typeof v === 'string' && TWINS.find(s => esUrl(s) === v)) out[k] = enUrl(TWINS.find(s => esUrl(s) === v));
      else out[k] = translateLd(v, slug);
    }
    return out;
  }
  if (typeof node === 'string') return LD_ADDR[node] || LD[node] || node;
  return node;
}

function metaSet(html, key, value, attr = 'property') {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, (m, a, b) => a + esc(value) + b) : html;
}

function hreflang(html, slug) {
  return html
    .replace(/<link rel="alternate" hreflang="es" href="[^"]*"\/>/, `<link rel="alternate" hreflang="es" href="${esUrl(slug)}"/>`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\/>/, `<link rel="alternate" hreflang="en" href="${enUrl(slug)}"/>`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\/>/, `<link rel="alternate" hreflang="x-default" href="${esUrl(slug)}"/>`);
}

const LANG_JS = '<script src="/assets/lang-url.js"></script>';
const created = [];

for (const slug of TWINS) {
  const file = join(DOCS, slug === 'index' ? 'index.html' : `${slug}.html`);
  let es = readFileSync(file, 'utf8');

  // 1. Español: script de idioma y hreflang pareados
  let esOut = es;
  if (!esOut.includes('/assets/lang-url.js')) esOut = esOut.replace(/(<meta charset="UTF-8"\/>)/, `$1\n  ${LANG_JS}`);
  esOut = hreflang(esOut, slug);
  if (esOut !== es) { writeFileSync(file, esOut); es = esOut; }

  // 2. Inglés
  const p = PAGES[slug];
  let en = es.replace('<html lang="es">', '<html lang="en">')
    .replace(/(<meta charset="UTF-8"\/>)/, '$1\n  <base href="/"/>')
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/<link rel="alternate" type="text\/markdown"[^>]*\/>\n?/, '')
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${enUrl(slug)}$2`);
  en = metaSet(en, 'description', p.desc, 'name');
  en = metaSet(en, 'og:url', enUrl(slug));
  en = metaSet(en, 'og:title', p.ogTitle || p.title);
  en = metaSet(en, 'og:description', p.desc);
  en = metaSet(en, 'og:image:alt', p.ogTitle || p.title);
  en = metaSet(en, 'og:locale', 'en_GB');
  en = metaSet(en, 'og:locale:alternate', 'es_ES');
  en = metaSet(en, 'twitter:title', p.ogTitle || p.title, 'name');
  en = metaSet(en, 'twitter:description', p.desc, 'name');
  en = hreflang(en, slug);

  en = en.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, body) => {
    let d; try { d = JSON.parse(body); } catch { return m; }
    const items = Array.isArray(d) ? d : (d['@graph'] || [d]);
    const kept = items.filter(x => x['@type'] !== 'FAQPage').map(x => translateLd(x, slug));
    if (!kept.length) return '';
    const val = Array.isArray(d) ? kept : (d['@graph'] ? { ...d, '@graph': kept } : kept[0]);
    return `<script type="application/ld+json">${JSON.stringify(val, null, 2)}</script>`;
  });

  let fb = p.fb;
  if (slug === 'noticias') {
    const key = liveKey();
    fb = `<h1>News & Blog · Hestía Your Home · Vera Playa, Almería</h1>
  <p>What is on in Vera, Mojácar, Garrucha, Almería and Murcia: festivals, plans and hidden corners of the area, with what we recommend from each Hestía. We publish one edition every month.</p>
  <p>${key ? `<a href="/noticias/en/${key}/">This month's edition</a> · ` : ''}<a href="/noticias/en/">Edition archive</a> · <a href="/noticias/">Archivo en español</a></p>
  <p>Written by Alex and Fran, who know the area first-hand and do not copy information from other websites.</p>`;
  }
  const fbRe = /<div class="container seo-fallback">[\s\S]*?<\/nav>\s*<\/div>/;
  if (!fbRe.test(en)) throw new Error(`Sin seo-fallback en ${slug}`);
  en = en.replace(fbRe, () => `<div class="container seo-fallback">\n  ${fb}\n  ${NAV}\n</div>`);
  en = en.replace(/<a href="#main-content" class="skip-link">[^<]*<\/a>/, `<a href="${enUrl(slug).replace(BASE, '')}#main-content" class="skip-link">Skip to main content</a>`);

  const out = join(DOCS, 'en', slug === 'index' ? 'index.html' : `${slug}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, en);
  created.push(slug);
}

// 3. Sitemap
let sm = readFileSync(SITEMAP, 'utf8');
for (const slug of TWINS) {
  const es = esUrl(slug), en = enUrl(slug);
  const re = new RegExp(`(<loc>${es.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}</loc>[\\s\\S]*?hreflang="en" href=")[^"]*(")`);
  sm = sm.replace(re, `$1${en}$2`);
}
const last = slug => {
  const m = sm.match(new RegExp(`<loc>${esUrl(slug).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}</loc>\\s*<lastmod>([^<]*)`));
  return m ? m[1] : new Date().toISOString().slice(0, 10);
};
const block = TWINS.map(slug => `  <url>
    <loc>${enUrl(slug)}</loc>
    <lastmod>${last(slug)}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${esUrl(slug)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl(slug)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esUrl(slug)}"/>
    <changefreq>weekly</changefreq>
    <priority>${slug === 'index' ? '0.9' : '0.7'}</priority>
  </url>
`).join('\n');
const wrapped = `  ${START}\n${block}  ${END}\n`;
if (sm.includes(START)) sm = sm.replace(new RegExp(`  ${START}[\\s\\S]*?${END}\\n`), wrapped);
else sm = sm.replace('</urlset>', `${wrapped}\n</urlset>`);
writeFileSync(SITEMAP, sm);
console.log(`Páginas en inglés: ${created.length} en docs/en/`);
