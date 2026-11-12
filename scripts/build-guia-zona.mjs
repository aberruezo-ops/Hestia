/**
 * build-guia-zona.mjs
 *
 * Genera el hub público de la zona a partir de los mismos datos que la guía
 * del huésped (docs/components/apartment-guide.jsx), en español y en inglés.
 *
 * Por qué páginas estáticas y no React: el resto del sitio pinta el body con
 * React desde un CDN, así que Google ve el HTML casi vacío en la primera
 * pasada. Estas páginas existen precisamente para posicionar, de modo que su
 * contenido va escrito en el HTML. Sin JS, sin CDN, sin render diferido.
 *
 * Qué se publica y qué no: sale la capa de descubrimiento (nombre, qué es,
 * qué tiene de bueno, servicios, acceso y distancia). El campo `tip`, que es
 * el consejo de quien conoce el sitio, NO se publica: ese es el valor que se lleva
 * quien reserva directo y entra en la guía completa.
 *
 * Español: /guia-vera/... · Inglés: /guia-vera/en/...
 * No todas las fichas están traducidas al inglés todavía (`desc_en`/`access_en`
 * en apartment-guide.jsx): las que faltan no se anuncian, se generan igual
 * salvo el texto libre de descripción (queda sin `<p>`), nunca se cuela
 * español sin marcar en una página en inglés.
 *
 * Uso:  node scripts/build-guia-zona.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const STARS = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path d="M12 3.8l2.4 5 5.4.8-3.9 3.8.9 5.4L12 16.3l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/></svg>'.repeat(5);
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESTILO } from './lib/guia-estilo.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SRC = join(ROOT, 'docs/components/apartment-guide.jsx');
const OUT = join(ROOT, 'docs/guia-vera');
const BASE = 'https://www.hestiayourhome.com';

const HESTIA = [
  { lat: 37.22883, lng: -1.80385 },
  { lat: 37.23336, lng: -1.82415 },
  { lat: 37.2400, lng: -1.8300 },
];

const km = (lat, lng) => {
  const R = 6371;
  return Math.min(...HESTIA.map(h => {
    const dLat = (lat - h.lat) * Math.PI / 180;
    const dLng = (lng - h.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(h.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }));
};

const esc = t => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// El texto lleva emojis de servicio (🚿 🛟 ...) que en una página de contenido
// aportan poco y ensucian el snippet de Google. Se traducen a palabras.
const SERVICIOS = {
  es: {
    '🚿': 'duchas', '🛟': 'socorrista', '🍹': 'chiringuito', '🛏️': 'hamacas',
    '🛏': 'hamacas', '🚻': 'aseos', '♿': 'accesible', '🅿️': 'parking',
    '🐕': 'perros', '⛱️': 'sombrillas', '🚤': 'náutica', '🏐': 'voley',
  },
  en: {
    '🚿': 'showers', '🛟': 'lifeguard', '🍹': 'beach bar', '🛏️': 'sunbeds',
    '🛏': 'sunbeds', '🚻': 'toilets', '♿': 'accessible', '🅿️': 'parking',
    '🐕': 'dogs allowed', '⛱️': 'umbrellas', '🚤': 'watersports', '🏐': 'volleyball',
  },
};
const legibles = (s, lang) => {
  if (!s) return '';
  const dict = SERVICIOS[lang];
  const out = [];
  for (const [emo, txt] of Object.entries(dict)) if (s.includes(emo)) out.push(txt);
  return [...new Set(out)].join(' · ');
};
const limpiaEmoji = s => String(s ?? '')
  .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();

// ---- prueba social real (misma normalización, suelo y redondeo que
// scripts/sync-rating.mjs y ratingScore/fmtRating en docs/components/
// shared.jsx, la fuente única para el resto del sitio: si cambias algo en
// uno, cámbialo en los tres) -----------------------------------------------
// La guía es la puerta de entrada de gente que no nos conoce: la nota y el
// número de opiniones son el dato que más convence, y sale calculado de
// reviews.json en cada build, nunca a mano, para no quedarse desfasado. Es
// la nota GLOBAL del sitio entero, nunca baja de RATING_FLOOR_GLOBAL.
const REVIEWS_PATH = join(ROOT, 'docs/data/reviews.json');
const TEN_SCALE = new Set(['booking']);
const RATING_FLOOR_GLOBAL = 9.85;
const RATING = (() => {
  try {
    const raw = JSON.parse(readFileSync(REVIEWS_PATH, 'utf8'));
    const items = (raw.items || []).filter(r => r.status === 'published' && typeof r.rating === 'number');
    if (!items.length) return null;
    const norm = r => (TEN_SCALE.has(r.source) ? r.rating : r.rating * 2);
    const sum = items.reduce((a, r) => a + norm(r), 0);
    const avg = Math.max(RATING_FLOOR_GLOBAL, sum / items.length);
    return { value: avg.toFixed(2), count: items.length };
  } catch (_) { return null; }
})();

// ---- extracción de datos --------------------------------------------------
const src = readFileSync(SRC, 'utf8');

const campo = (blk, k) => {
  const m = blk.match(new RegExp(`${k}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  return m ? m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : null;
};

/**
 * Las entradas de pueblo llevan un array `events` con objetos dentro, así que
 * un regex de "todo menos llaves" se las salta. Aquí se recorre el objeto
 * contando llaves y saltando lo que va dentro de comillas.
 */
function objetosQueEmpiezanPor(texto, clave) {
  const salida = [];
  const re = new RegExp(`\\{\\s*${clave}\\s*:`, 'g');
  let m;
  while ((m = re.exec(texto)) !== null) {
    let i = m.index, prof = 0, comilla = null;
    for (let j = i; j < texto.length; j++) {
      const c = texto[j];
      if (comilla) {
        if (c === '\\') { j++; continue; }
        if (c === comilla) comilla = null;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
      if (c === '{') prof++;
      else if (c === '}') {
        prof--;
        if (prof === 0) { salida.push(texto.slice(i, j + 1)); re.lastIndex = j; break; }
      }
    }
  }
  return salida;
}

// Dentro de un objeto de lugar, `name:` puede aparecer también en los eventos
// anidados. Solo interesa el del primer nivel, así que se corta por el array.
const sinAnidados = b => b.replace(/events:\s*\[[\s\S]*?\]/g, '');

const PLACES = [];
for (const bruto of objetosQueEmpiezanPor(src, 'id')) {
  const b = sinAnidados(bruto);
  if (!b.includes('name:')) continue;
  const lat = b.match(/lat:\s*([\d.-]+)/), lng = b.match(/lng:\s*([\d.-]+)/);
  if (!lat || !lng) continue;
  const rat = b.match(/rating:\s*([\d.]+)/);
  PLACES.push({
    id: campo(b, 'id'), name: campo(b, 'name'),
    desc: campo(b, 'desc'), desc_en: campo(b, 'desc_en'), best: campo(b, 'best'),
    cat: campo(b, 'cat'), services: campo(b, 'services'),
    access: campo(b, 'access'), access_en: campo(b, 'access_en'),
    url: campo(b, 'url'), rating: rat ? parseFloat(rat[1]) : null,
    featured: b.includes('featured: true'),
    km: km(parseFloat(lat[1]), parseFloat(lng[1])),
  });
}

const ATLAS = [];
for (const b of objetosQueEmpiezanPor(src, 'subcat')) {
  ATLAS.push({
    subcat: campo(b, 'subcat'),
    name: { es: campo(b, 'name_es'), en: campo(b, 'name_en') },
    desc: { es: campo(b, 'desc_es'), en: campo(b, 'desc_en') },
    como: { es: campo(b, 'comoLlegar_es'), en: campo(b, 'comoLlegar_en') },
    url: campo(b, 'url'),
    km: (b.match(/km:\s*(\d+)/) || [])[1],
  });
}

// ---- definición de los hubs ----------------------------------------------
const HUBS = [
  {
    video: 'hero-cala-aerea.mp4', slug: 'playas', cats: ['beach', 'beach-hard', 'beach-dog', 'beach-nude', 'beach-srvc'],
    es: {
      h1: 'Las playas por las que volvemos',
      title: 'Las mejores playas de Vera y el Levante almeriense · Hestía',
      desc: 'Guía de las playas y calas del Levante almeriense, de Vera a Cabo de Gata: cómo son, qué servicios tienen y cómo se llega. Escrita por quienes llevan toda la vida viniendo.',
      intro: 'De todas las playas del Levante almeriense, estas son a las que volvemos. No es un listado de la costa: es la criba de muchos veranos, de las urbanas con todos los servicios a las calas donde no hay nada más que agua y roca. Ordenadas por distancia desde los apartamentos.',
    },
    en: {
      h1: 'The beaches we keep coming back to',
      title: 'The best beaches in Vera and the Almería Levante · Hestía',
      desc: 'Guide to the beaches and coves of the Almería Levante, from Vera to Cabo de Gata: what they are like, what services they have and how to get there. Written by people who have been coming here their whole lives.',
      intro: 'Of all the beaches on the Almería Levante, these are the ones we keep coming back to. This is not a list of the whole coast: it is the result of many summers, from town beaches with every service to coves with nothing but water and rock. Sorted by distance from the apartments.',
    },
  },
  {
    video: 'hero-piscina-verano.mp4', slug: 'donde-comer', cats: ['restaurant', 'michelin', 'celiac', 'bar'],
    es: {
      h1: 'Las mesas que recomendamos',
      title: 'Dónde comer en Vera, Garrucha y Mojácar · Guía Hestía',
      desc: 'Restaurantes, chiringuitos y estrellas Michelin del Levante almeriense y alrededores, con lo que pedir en cada uno. Escrita por quienes llevan toda la vida viniendo.',
      intro: 'De la gamba roja de Garrucha a las estrellas Michelin de Almería, Murcia y Cartagena. Aquí no está todo lo que hay: está donde nosotros comemos y a dónde mandamos a los huéspedes. Ordenado por distancia desde los apartamentos.',
    },
    en: {
      h1: 'The tables we recommend',
      title: 'Where to eat in Vera, Garrucha and Mojácar · Hestía Guide',
      desc: 'Restaurants, beach bars and Michelin stars from the Almería Levante and beyond, with what to order at each one. Written by people who have been coming here their whole lives.',
      intro: "From Garrucha's red prawns to the Michelin stars of Almería, Murcia and Cartagena. This is not everything there is: it is where we eat and where we send our guests. Sorted by distance from the apartments.",
    },
  },
  {
    video: 'hero-playa-aerea-turquesa.mp4', slug: 'pueblos', cats: ['town', 'gem'],
    es: {
      h1: 'Los pueblos que merecen el viaje',
      title: 'Pueblos que ver cerca de Vera, Almería · Guía Hestía',
      desc: 'Los pueblos del Levante almeriense y del interior de Almería que merecen una visita, con qué ver en cada uno y a qué distancia están de Vera Playa.',
      intro: 'Almería cambia mucho en pocos kilómetros: pueblos blancos colgados, pueblos mineros y casas cueva. De todos los que hay, estos son los que compensan coger el coche. Ordenados por distancia desde los apartamentos.',
    },
    en: {
      h1: 'The villages worth the drive',
      title: 'Villages to see near Vera, Almería · Hestía Guide',
      desc: 'The villages of the Almería Levante and inland Almería that are worth a visit, with what to see in each one and how far they are from Vera Playa.',
      intro: 'Almería changes a lot over a short distance: hillside white villages, mining towns and cave dwellings. Of everything there is, these are the ones worth getting in the car for. Sorted by distance from the apartments.',
    },
  },
  {
    video: 'hero-cala-rocosa.mp4', slug: 'naturaleza-y-rutas', cats: ['trek', 'water', 'adventure'],
    es: {
      h1: 'Salir a andar, y a mojarse',
      title: 'Rutas y naturaleza en el Levante almeriense · Guía Hestía',
      desc: 'Senderos, rutas costeras, deportes de agua y planes al aire libre en el Levante almeriense y Cabo de Gata, con distancias desde Vera Playa.',
      intro: 'Desde paseos litorales que empiezan en la puerta hasta el Karst en Yesos de Sorbas. Una selección corta a propósito: lo que de verdad recomendamos hacer al aire libre por aquí.',
    },
    en: {
      h1: 'Getting out to walk, and to get wet',
      title: 'Trails and nature in the Almería Levante · Hestía Guide',
      desc: 'Trails, coastal routes, water sports and outdoor plans in the Almería Levante and Cabo de Gata, with distances from Vera Playa.',
      intro: 'From coastal walks that start at the door to the Karst en Yesos gypsum reserve in Sorbas. A deliberately short selection: what we genuinely recommend doing outdoors around here.',
    },
  },
];

const HUB_HISTORIA = {
  video: 'hero-atardecer-aereo.mp4', slug: 'historia', subcats: ['castillos', 'yacimientos', 'romano', 'islamico', 'cuevas'],
  es: {
    h1: 'Cuatro mil años de piedra',
    title: 'Castillos y yacimientos de Almería · Guía Hestía',
    desc: 'Castillos, yacimientos argáricos y romanos, patrimonio andalusí y cuevas del Levante almeriense y alrededores, con distancias desde Vera Playa.',
    intro: 'Almería lleva habitada desde El Argar, hace 4.000 años. Fenicios, romanos y andalusíes dejaron aquí más de lo que cabe en una lista: estos son los que están cerca y merecen la parada.',
  },
  en: {
    h1: 'Four thousand years of stone',
    title: 'Castles and archaeological sites of Almería · Hestía Guide',
    desc: 'Castles, Argaric and Roman sites, Andalusi heritage and caves of the Almería Levante and beyond, with distances from Vera Playa.',
    intro: 'Almería has been inhabited since El Argar, 4,000 years ago. Phoenicians, Romans and Andalusis left behind more than fits in a list: these are the ones nearby that are worth the stop.',
  },
};

const NOMBRE_CAT = {
  es: {
    beach: 'Playa', 'beach-hard': 'Cala de acceso difícil', 'beach-dog': 'Playa para perros',
    'beach-nude': 'Playa naturista', 'beach-srvc': 'Servicios de playa',
    restaurant: 'Restaurante', michelin: 'Michelin', celiac: 'Sin gluten', bar: 'Chiringuito o bar',
    town: 'Pueblo', gem: 'Rincón', trek: 'Ruta', water: 'Agua', adventure: 'Aventura',
    castillos: 'Castillo', yacimientos: 'Yacimiento', romano: 'Romano',
    islamico: 'Andalusí', cuevas: 'Cueva y geología',
  },
  en: {
    beach: 'Beach', 'beach-hard': 'Hard-to-reach cove', 'beach-dog': 'Dog-friendly beach',
    'beach-nude': 'Naturist beach', 'beach-srvc': 'Beach with services',
    restaurant: 'Restaurant', michelin: 'Michelin', celiac: 'Gluten-free', bar: 'Beach bar or bar',
    town: 'Village', gem: 'Hidden gem', trek: 'Trail', water: 'Water', adventure: 'Adventure',
    castillos: 'Castle', yacimientos: 'Archaeological site', romano: 'Roman',
    islamico: 'Andalusi', cuevas: 'Cave & geology',
  },
};

// ---- textos de plantilla, por idioma --------------------------------------
const T = {
  es: {
    htmlLang: 'es', ogLocale: 'es_ES',
    navGuia: 'Extracto Guía', navApts: 'Los apartamentos', navAcceso: 'Acceso huésped', navReserva: 'Reservar',
    eyebrowGuia: 'Nuestra guía',
    inicio: 'Inicio', nuestraGuia: 'Nuestra guía',
    aviso: `Esto es <b>un extracto</b> de nuestra guía. La guía completa, con
30 capítulos y el mapa de la zona, es <b>exclusiva para quien se aloja
con nosotros</b>: se entrega unos días antes de vuestra llegada, en PDF para
llevar sin cobertura. Incluye:
<ul>
<li>La descripción de cada Hestía y cómo os recomendamos usarla, estancia a estancia.</li>
<li>Planes de día completo, para adultos y con niños, y planes de mediodía.</li>
<li>Platos típicos de la zona y dónde comerlos.</li>
<li>Pueblos, playas, mercados y rutas, con la distancia real desde casa.</li>
<li>Los descuentos que hemos negociado con negocios de la zona para quien reserva directo.</li>
<li>Todo lo práctico: wifi, limpieza, normas, salud, gasolineras y teléfonos útiles.</li>
</ul>`,
    ctaH2: 'Esto es solo una muestra de la guía',
    ctaP1: 'Lo que ves aquí lo puede leer cualquiera: qué es cada sitio, qué tiene de bueno y a qué distancia queda. Es la parte que se puede contar por escrito.',
    ctaP2: () => `El resto no se aprende leyendo: se aprende viniendo año tras año. A qué hora llegar a cada cala para
  encontrar sitio. Qué pedir en cada mesa. Dónde se aparca de verdad en agosto. Y los descuentos
  que hemos negociado con negocios de la zona para quien reserva directo.`,
    ctaDatos: [['30', 'capítulos'], ['314', 'puntos en el mapa'], ['2016', 'con casa aquí'], ['PDF', 'para ir sin cobertura']],
    ctaP3: 'Se entrega unos días antes de la llegada, junto con todo lo del apartamento: del wifi a la farmacia de guardia. Tres casas en Vera Playa, llevadas por nosotros, sin comisiones de plataforma.',
    apts: [
      ['Hestía Mar', 'A 300 m de la playa'],
      ['Hestía Thalassa', 'Ático con SPA y sauna'],
      ['Hestía Salinas', 'Dos terrazas y las salinas'],
    ],
    pieP1: 'Guía escrita por Alex y Fran, que llevan en persona los tres apartamentos de <a href="/">Hestía Your Home</a> en Vera Playa (Almería) desde 2016. Licencias VFT/AL/01580, VFT/AL/05535 y VFT/AL/07056.',
    pieNav: '<a href="/">Inicio</a> · <a href="/guia-vera/">Extracto Guía</a> · <a href="/reservas.html">Reservas</a> · <a href="/opiniones.html">Opiniones</a> · <a href="/nosotros.html">Nosotros</a> · <a href="/contacto.html">Contacto</a>',
    pieLegal: '<a href="/privacidad.html">Privacidad</a> · <a href="/cookies.html">Cookies</a>',
    aUnPaseo: 'a un paseo', desdeCasa: 'desde casa',
    sobre5: 'sobre 5', verMapa: 'Ver en el mapa', webOficial: 'Web oficial',
    notaConTotal: (cuenta, total) => `Aquí van ${cuenta}. En la guía del huésped hay <b>${total}</b>, con el consejo de cada uno.`,
    notaSinTotal: (cuenta) => `${cuenta} ${cuenta === 1 ? 'sitio' : 'sitios'}, del más cercano al más lejano.`,
    sitios: 'sitios', categorias: 'categorías', elMasCercano: 'el más cercano', anosHistoria: 'años de historia',
    indexTitle: 'Guía de Vera Playa y el Levante almeriense · Hestía',
    indexDesc: (total) => `Guía del Levante almeriense por quienes llevan toda la vida viniendo: ${total} playas, restaurantes, pueblos, rutas y monumentos del Levante almeriense, con distancias y lo que merece la pena de cada uno.`,
    indexH1: 'La Almería que no sale en otras guías',
    indexIntro: (total) => `Hemos recorrido ${total} sitios del Levante almeriense: Alex y Fran, ligados a Almería de toda la vida y con tres apartamentos en Vera Playa desde 2016. No es una lista copiada de otras webs: es lo que recomendamos a quien se aloja con nosotros, ordenado por distancia desde los apartamentos.`,
    indexCifras: (total, n) => [[String(total), 'sitios'], [String(n), 'secciones'], ['2016', 'con casa aquí']],
    porDondeEmpezar: 'Por dónde empezar',
    verLos: (n) => `Ver los ${n} sitios`,
    ondasSitios: (n) => `${n} sitios`,
    imprescindible: 'Imprescindible',
    ratingSub: 'en opiniones reales de huéspedes',
    ctaRibbon: 'Reserva directa',
    ctaFloatBtn: 'Reservar →',
    ctaMid: '¿Te está gustando lo que ves? La guía completa, con el consejo de cada sitio, es para quien reserva directo.',
    ctaMidBtn: 'Ver los tres Hestía',
  },
  en: {
    htmlLang: 'en', ogLocale: 'en_GB',
    navGuia: 'Guide extract', navApts: 'The apartments', navAcceso: 'Guest access', navReserva: 'Book',
    eyebrowGuia: 'Our guide',
    inicio: 'Home', nuestraGuia: 'Our guide',
    aviso: `This is <b>an extract</b> of our guide. The full guide, with
30 chapters and the area map, is <b>exclusive to guests staying
with us</b>: it is handed over a few days before you arrive, as a PDF you
can use without signal. It includes:
<ul>
<li>A description of each Hestía and how we recommend using it, room by room.</li>
<li>Full-day plans, for adults and with kids, and half-day plans.</li>
<li>Local dishes and where to eat them.</li>
<li>Towns, beaches, markets and routes, with the real distance from home.</li>
<li>The discounts we have negotiated with local businesses for direct guests.</li>
<li>All the practical stuff: wifi, cleaning, house rules, health, fuel and useful phone numbers.</li>
</ul>`,
    ctaH2: 'This is just a sample of the guide',
    ctaP1: 'What you see here anyone can read: what each place is, what is good about it and how far it is. It is the part that can be put in writing.',
    ctaP2: () => `The rest is not learned by reading: it is learned by coming back, year after
  year. What time to arrive at each cove to find a spot. What to order at each table. Where to actually
  park in August. And the discounts we have negotiated with local businesses for guests who book direct.`,
    ctaDatos: [['30', 'chapters'], ['314', 'points on the map'], ['2016', 'with a home here'], ['PDF', 'for when there is no signal']],
    ctaP3: "Handed over a few days before arrival, along with everything about the apartment: from the wifi to the on-call pharmacy. Three homes in Vera Playa, run by us, with no platform commissions.",
    apts: [
      ['Hestía Mar', '300 m from the beach'],
      ['Hestía Thalassa', 'Penthouse with spa and sauna'],
      ['Hestía Salinas', 'Two terraces and the salt flats'],
    ],
    pieP1: 'Guide written by Alex and Fran, who personally run the three <a href="/">Hestía Your Home</a> apartments in Vera Playa (Almería) since 2016. Licences VFT/AL/01580, VFT/AL/05535 and VFT/AL/07056.',
    pieNav: '<a href="/">Home</a> · <a href="/guia-vera/en/">Guide extract</a> · <a href="/reservas.html">Booking</a> · <a href="/opiniones.html">Reviews</a> · <a href="/nosotros.html">About us</a> · <a href="/contacto.html">Contact</a>',
    pieLegal: '<a href="/privacidad.html">Privacy</a> · <a href="/cookies.html">Cookies</a>',
    aUnPaseo: 'a short walk', desdeCasa: 'from home',
    sobre5: 'out of 5', verMapa: 'View on map', webOficial: 'Official website',
    notaConTotal: (cuenta, total) => `Here are ${cuenta}. The guest guide has <b>${total}</b>, with a tip for each.`,
    notaSinTotal: (cuenta) => `${cuenta} ${cuenta === 1 ? 'place' : 'places'}, from nearest to farthest.`,
    sitios: 'places', categorias: 'categories', elMasCercano: 'the nearest', anosHistoria: 'years of history',
    indexTitle: 'Guide to Vera Playa and the Almería Levante · Hestía',
    indexDesc: (total) => `Almería Levante guide by people who have been coming here their whole lives: ${total} beaches, restaurants, villages, trails and monuments of the Almería Levante, with distances and what is worth it in each one.`,
    indexH1: 'The Almería that does not make it into other guides',
    indexIntro: (total) => `We have visited ${total} places across the Almería Levante: Alex and Fran, lifelong Almería people with three apartments in Vera Playa since 2016. This is not a list copied from other websites: it is what we recommend to our own guests, sorted by distance from the apartments.`,
    indexCifras: (total, n) => [[String(total), 'places'], [String(n), 'sections'], ['2016', 'with a home here']],
    porDondeEmpezar: 'Where to start',
    verLos: (n) => `See all ${n} places`,
    ondasSitios: (n) => `${n} places`,
    imprescindible: 'Must-see',
    ratingSub: 'from real guest reviews',
    ctaRibbon: 'Direct booking',
    ctaFloatBtn: 'Book →',
    ctaMid: 'Liking what you see? The full guide, with a tip for every place, is for guests who book direct.',
    ctaMidBtn: 'See the three Hestías',
  },
};

// ---- plantilla (comparte CSS entre idiomas) -------------------------------

const cabecera = ({ lang, title, desc, canonical, altHref, jsonld }) => `<!DOCTYPE html>
<html lang="${T[lang].htmlLang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="theme-color" content="#2A0F2E"/>
<title>${esc(title)}</title>
<meta name="robots" content="index, follow"/>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" hreflang="es" href="${lang === 'es' ? canonical : altHref}"/>
<link rel="alternate" hreflang="en" href="${lang === 'en' ? canonical : altHref}"/>
<link rel="alternate" hreflang="x-default" href="${lang === 'es' ? canonical : altHref}"/>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png"/>
<meta property="og:site_name" content="Hestía Your Home"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${BASE}/assets/hero-terrace-night.jpg"/>
<meta property="og:locale" content="${T[lang].ogLocale}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>${ESTILO}</style>
<script>document.documentElement.classList.add('js');</script>
<noscript><style>.reveal{opacity:1!important;transform:none!important;}</style></noscript>
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<div class="progreso" id="progreso"></div>
<div class="topbar">
  <div class="wrap">
    <span class="tb-contacto">
      <a href="https://wa.me/34620316370" rel="noopener"><span class="tb-who">Alex</span> +34 620 316 370</a>
      <span class="tb-sep">&middot;</span>
      <a href="https://wa.me/34654138251" rel="noopener"><span class="tb-who">Fran</span> +34 654 138 251</a>
    </span>
    <a class="tb-mail" href="mailto:info@hestiayourhome.com">info@hestiayourhome.com</a>
  </div>
</div>
<div class="topnav">
  <div class="wrap">
    <a class="brand" href="/">Hestía Your Home</a>
    <nav>
      <a href="${lang === 'es' ? '/guia-vera/' : '/guia-vera/en/'}">${T[lang].navGuia}</a>
      <a href="/mar.html">${T[lang].navApts}</a>
      <a href="/?acceso=huesped">${T[lang].navAcceso}</a>
      <details class="topnav-menu">
        <summary aria-label="${lang === 'es' ? 'Menú' : 'Menu'}">&#9776;</summary>
        <div class="topnav-menu-panel">
          <a href="${lang === 'es' ? '/guia-vera/' : '/guia-vera/en/'}">${T[lang].navGuia}</a>
          <a href="/mar.html">${T[lang].navApts}</a>
          <a href="/?acceso=huesped">${T[lang].navAcceso}</a>
        </div>
      </details>
      <a class="cta-top" href="/reservas.html">${T[lang].navReserva}</a>
    </nav>
  </div>
</div>`;

// El hero lleva vídeo real de la zona: es lo que vende antes de leer nada.
// preload="metadata" y poster para no castigar la carga, igual que la home.
const hero = ({ lang, h1, intro, cifras, video }) => `
<header class="hero">
  ${video ? `<video autoplay muted loop playsinline preload="metadata" poster="/assets/posters/${video.replace('.mp4', '.jpg')}" aria-hidden="true">
    <source src="/assets/Videoshome/${video}" type="video/mp4"/>
  </video>` : ''}
  <div class="wrap">
    <p class="eyebrow">${T[lang].eyebrowGuia}</p>
    <h1>${esc(h1)}</h1>
    <p class="intro">${esc(intro)}</p>
    ${cifras && cifras.length ? `<div class="cifras">${cifras.map(c =>
      `<div class="cifra"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('')}</div>` : ''}
    ${RATING ? `<div class="hero-rating">
      <span class="stars" aria-hidden="true">${STARS}</span>
      <b>${esc(RATING.value)}/10</b>
      <span>${esc(String(RATING.count))} ${esc(T[lang].ratingSub)}</span>
    </div>` : ''}
  </div>
</header>`;

const indice = grupos => grupos.length < 2 ? '' : `
<div class="indice"><div class="wrap">
  ${grupos.map(g => `<a href="#${g.id}">${esc(g.nombre)}</a>`).join('')}
</div></div>`;

// Que quede dicho arriba y sin rodeos: esto es un extracto, la guía entera es
// de los huéspedes. Antes solo se decía al final de la página.
const avisoExtracto = lang => `
<div class="aviso">${T[lang].aviso}</div>`;

const bloqueCta = lang => {
  const t = T[lang];
  return `
<div class="cta reveal">
  <span class="cta-ribbon">${esc(t.ctaRibbon)}</span>
  <h2>${esc(t.ctaH2)}</h2>
  ${RATING ? `<div class="cta-rating">
    <span class="stars" aria-hidden="true">${STARS}</span>
    <b>${esc(RATING.value)}/10</b>
    <span>${esc(String(RATING.count))} ${esc(t.ratingSub)}</span>
  </div>` : ''}
  <p>${esc(t.ctaP1)}</p>
  <p>${t.ctaP2()}</p>
  <div class="cta-datos">
    ${t.ctaDatos.map(([n, s]) => `<div><b>${esc(n)}</b><span>${esc(s)}</span></div>`).join('')}
  </div>
  <p>${esc(t.ctaP3)}</p>
  <div class="apts">
    <a class="vm" href="/mar.html"><b>${esc(t.apts[0][0])}</b><span>${esc(t.apts[0][1])}</span></a>
    <a class="vt" href="/thalassa.html"><b>${esc(t.apts[1][0])}</b><span>${esc(t.apts[1][1])}</span></a>
    <a class="vs" href="/salinas.html"><b>${esc(t.apts[2][0])}</b><span>${esc(t.apts[2][1])}</span></a>
  </div>
</div>`;
};

// CTA compacta que se intercala entre bloques de categoría en hubs largos
// (donde-comer, con 4 categorías y 57 sitios): sin ella, quien no llega
// hasta el final nunca ve la llamada a reservar.
const ctaMid = lang => {
  const t = T[lang];
  return `
<div class="cta-mid reveal">
  <p>${esc(t.ctaMid)}</p>
  <a href="/mar.html">${esc(t.ctaMidBtn)} →</a>
</div>`;
};

const pie = lang => `
<footer class="pie">
  <p>${T[lang].pieP1}</p>
  <p>${T[lang].pieNav}</p>
  <p>${T[lang].pieLegal}</p>
</footer>
</div>
<a class="cta-float" id="cta-float" href="/reservas.html"><span>${esc(T[lang].ctaFloatBtn)}</span></a>
<script>
(function(){
  // Barra de progreso de lectura.
  var barra = document.getElementById('progreso');
  var flot = document.getElementById('cta-float');
  var onScroll = function(){
    var h = document.documentElement;
    var alto = h.scrollHeight - h.clientHeight;
    if (barra) barra.style.width = (alto > 0 ? (h.scrollTop / alto * 100) : 0) + '%';
    if (flot) flot.classList.toggle('is-visible', h.scrollTop > window.innerHeight * 0.6);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Revelado al entrar en viewport. Failsafe: si algo falla o el navegador
  // no tiene IntersectionObserver, se revela todo a los 2,5 s igualmente,
  // nunca se queda contenido oculto de forma permanente.
  var reveals = document.querySelectorAll('.reveal');
  var showAll = function(){ reveals.forEach(function(el){ el.classList.add('is-in'); }); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    showAll();
  }
  setTimeout(showAll, 2500);

  // Resalta en el índice sticky la sección que se está leyendo.
  var enlaces = document.querySelectorAll('.indice a');
  var grupos = document.querySelectorAll('.grupo[id]');
  if (enlaces.length && grupos.length && 'IntersectionObserver' in window) {
    var activar = function(id){
      enlaces.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
    };
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) activar(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    grupos.forEach(function(g){ spy.observe(g); });
  }
})();
</script>
</body>
</html>
`;

const distTxt = (k, lang) => k < 0.8 ? T[lang].aUnPaseo
  : (k < 10 ? `${k.toFixed(1).replace('.0', '')} km` : `${Math.round(k)} km`);

function ficha(p, lang) {
  const desc = lang === 'es' ? p.desc : p.desc_en;
  const acceso = lang === 'es' ? p.access : (p.access_en || null);
  const serv = legibles(p.services, lang);
  const acc = limpiaEmoji(acceso);
  const chips = [];
  if (p.featured) chips.push(`<span class="chip destacado">${esc(T[lang].imprescindible)}</span>`);
  if (p.rating) chips.push(`<span class="chip nota">${p.rating} ${T[lang].sobre5}</span>`);
  if (serv) chips.push(`<span class="chip">${esc(serv)}</span>`);
  if (acc) chips.push(`<span class="chip">${esc(acc)}</span>`);
  if (p.url) chips.push(`<a href="${esc(p.url)}" rel="nofollow noopener" target="_blank">${T[lang].verMapa}</a>`);
  const d = distTxt(p.km, lang);
  return `
<article class="ficha reveal${p.featured ? ' imprescindible' : ''}">
  <div class="f-cuerpo">
    <h3>${esc(limpiaEmoji(p.name))}</h3>
    ${desc ? `<p>${esc(desc)}</p>` : ''}
    ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
  </div>
  <span class="dist">${esc(d)}<small>${T[lang].desdeCasa}</small></span>
</article>`;
}

function fichaAtlas(a, lang) {
  const name = a.name[lang] || a.name.es;
  const desc = a.desc[lang];
  const como = a.como[lang] || a.como.es;
  const chips = [];
  if (como) chips.push(`<span class="chip">${esc(limpiaEmoji(como))}</span>`);
  if (a.url) chips.push(`<a href="${esc(a.url)}" rel="nofollow noopener" target="_blank">${T[lang].webOficial}</a>`);
  return `
<article class="ficha reveal">
  <div class="f-cuerpo">
    <h3>${esc(name)}</h3>
    ${desc ? `<p>${esc(desc)}</p>` : ''}
    ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
  </div>
  <span class="dist">${a.km} km<small>${T[lang].desdeCasa}</small></span>
</article>`;
}

const seccion = (n, id, nombre, cuenta, fichas, total, lang) => `
<section class="grupo" id="${id}">
  <div class="grupo-head reveal">
    <span class="grupo-n">${String(n).padStart(2, '0')}</span>
    <h2>${esc(nombre)}</h2>
  </div>
  <p class="grupo-nota">${total && total > cuenta ? T[lang].notaConTotal(cuenta, total) : T[lang].notaSinTotal(cuenta)}</p>
  <div class="rejilla">${fichas}</div>
</section>`;

function escribe(rel, html) {
  const dir = join(OUT, rel);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

const migas = (lang, nombre, url) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: T[lang].inicio, item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: T[lang].nuestraGuia, item: `${BASE}/guia-vera/${lang === 'en' ? 'en/' : ''}` },
    { '@type': 'ListItem', position: 3, name: nombre, item: url },
  ],
});

// URL de un hub según idioma: ES en /guia-vera/x/, EN en /guia-vera/en/x/
const hubUrl = (lang, slug) => `${BASE}/guia-vera/${lang === 'en' ? 'en/' : ''}${slug ? slug + '/' : ''}`;
const hubRel = (lang, slug) => `${lang === 'en' ? 'en/' : ''}${slug || ''}`;

// ---- generación -----------------------------------------------------------
// Todo el hub se genera dos veces, una por idioma, con la misma criba de
// contenido (qué se publica no cambia con el idioma, solo el texto).
const resumen = { es: [], en: [] };

for (const lang of ['es', 'en']) {
  const generadas = resumen[lang];

  for (const hub of HUBS) {
    const copy = hub[lang];
    // Se publica la criba, no el archivo: lo marcado como imperdible más todo
    // lo que está a menos de 6 km. Sin esa segunda condición la guía de playas
    // empezaba a 26 km, sin las de Vera ni Garrucha, que es lo que de verdad
    // busca quien va a dormir aquí. El resto se queda para quien reserva.
    const items = PLACES.filter(p => hub.cats.includes(p.cat) && (p.featured || p.km < 6)).sort((a, b) => a.km - b.km);
    if (!items.length) continue;
    const url = hubUrl(lang, hub.slug);
    const alt = hubUrl(lang === 'es' ? 'en' : 'es', hub.slug);
    const jsonld = [
      migas(lang, copy.h1, url),
      {
        '@context': 'https://schema.org', '@type': 'ItemList', name: copy.h1,
        description: copy.desc, numberOfItems: items.length,
        itemListElement: items.slice(0, 60).map((p, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: { '@type': 'Place', name: limpiaEmoji(p.name), description: (lang === 'es' ? p.desc : p.desc_en) || undefined },
        })),
      },
    ];
    const porCat = {};
    for (const p of items) (porCat[p.cat] ||= []).push(p);
    const grupos = Object.keys(porCat).map(cat => ({ id: 'g-' + cat, nombre: NOMBRE_CAT[lang][cat] || cat }));
    const totalCat = {};
    for (const p of PLACES) if (hub.cats.includes(p.cat)) totalCat[p.cat] = (totalCat[p.cat] || 0) + 1;
    // En hubs con 3+ categorías se cuela una CTA compacta a mitad de lista:
    // quien no llega hasta el bloque final (donde-comer tiene 57 sitios en
    // 4 categorías) también ve la llamada a reservar.
    const catEntries = Object.entries(porCat);
    const medio = Math.floor(catEntries.length / 2);
    const cuerpo = catEntries.map(([cat, lista], i) =>
      seccion(i + 1, 'g-' + cat, NOMBRE_CAT[lang][cat] || cat, lista.length,
              lista.map(p => ficha(p, lang)).join(''), totalCat[cat], lang)
      + (catEntries.length >= 3 && i === medio ? ctaMid(lang) : '')).join('');
    const masCerca = items[0] ? distTxt(items[0].km, lang) : null;
    const cifras = [[String(items.length), T[lang].sitios], [String(grupos.length), T[lang].categorias]];
    if (masCerca) cifras.push([masCerca, T[lang].elMasCercano]);
    escribe(hubRel(lang, hub.slug),
      cabecera({ lang, title: copy.title, desc: copy.desc, canonical: url, altHref: alt, jsonld })
      + hero({ lang, h1: copy.h1, intro: copy.intro, cifras, video: hub.video })
      + indice(grupos)
      + '<div class="wrap libro">' + avisoExtracto(lang) + cuerpo + bloqueCta(lang) + pie(lang));
    generadas.push({ slug: hub.slug, n: items.length, h1: copy.h1, desc: copy.desc });
  }

  // historia, desde el Atlas
  {
    const h = HUB_HISTORIA;
    const copy = h[lang];
    const items = ATLAS.filter(a => h.subcats.includes(a.subcat))
      .sort((a, b) => Number(a.km) - Number(b.km)).slice(0, 12);
    const url = hubUrl(lang, h.slug);
    const alt = hubUrl(lang === 'es' ? 'en' : 'es', h.slug);
    const jsonld = [
      migas(lang, copy.h1, url),
      {
        '@context': 'https://schema.org', '@type': 'ItemList', name: copy.h1,
        description: copy.desc, numberOfItems: items.length,
        itemListElement: items.map((a, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: { '@type': 'TouristAttraction', name: a.name[lang] || a.name.es, description: a.desc[lang] || undefined },
        })),
      },
    ];
    const porSub = {};
    for (const a of items) (porSub[a.subcat] ||= []).push(a);
    const grupos = Object.keys(porSub).map(sc => ({ id: 'g-' + sc, nombre: NOMBRE_CAT[lang][sc] || sc }));
    const subEntries = Object.entries(porSub);
    const medioSub = Math.floor(subEntries.length / 2);
    const cuerpo = subEntries.map(([sc, lista], i) =>
      seccion(i + 1, 'g-' + sc, NOMBRE_CAT[lang][sc] || sc, lista.length, lista.map(a => fichaAtlas(a, lang)).join(''), null, lang)
      + (subEntries.length >= 3 && i === medioSub ? ctaMid(lang) : '')).join('');
    escribe(hubRel(lang, h.slug),
      cabecera({ lang, title: copy.title, desc: copy.desc, canonical: url, altHref: alt, jsonld })
      + hero({ lang, h1: copy.h1, intro: copy.intro, video: h.video,
               cifras: [[String(items.length), T[lang].sitios], [String(grupos.length), T[lang].categorias],
                        ['4.000', T[lang].anosHistoria]] })
      + indice(grupos)
      + '<div class="wrap libro">' + avisoExtracto(lang) + cuerpo + bloqueCta(lang) + pie(lang));
    generadas.push({ slug: h.slug, n: items.length, h1: copy.h1, desc: copy.desc });
  }

  // índice del hub
  {
    const t = T[lang];
    const url = hubUrl(lang, '');
    const alt = hubUrl(lang === 'es' ? 'en' : 'es', '');
    const total = generadas.reduce((a, g) => a + g.n, 0);
    const jsonld = [
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.inicio, item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: t.nuestraGuia, item: url },
        ],
      },
      {
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: lang === 'es' ? 'Guía de Vera Playa y el Levante almeriense' : 'Guide to Vera Playa and the Almería Levante',
        numberOfItems: generadas.length,
        itemListElement: generadas.map((g, i) => ({
          '@type': 'ListItem', position: i + 1, name: g.h1,
          url: hubUrl(lang, g.slug),
        })),
      },
    ];
    // Misma forma de DOM que ficha() (.f-cuerpo + .dist como hijos directos
    // de .ficha): la rejilla CSS de .ficha da por hecho esos dos hijos. Con
    // .f-top envolviendo título y cifra, como estaba antes, el grid no
    // encontraba sus columnas y el texto quedaba montado unas líneas encima
    // de otras.
    const fichas = generadas.map(g => `
<article class="ficha reveal">
  <div class="f-cuerpo">
    <h3><a href="${hubUrl(lang, g.slug)}" style="color:inherit;text-decoration:none">${esc(g.h1)}</a></h3>
    <p>${esc(g.desc)}</p>
    <div class="chips"><a href="${hubUrl(lang, g.slug)}">${esc(t.verLos(g.n))}</a></div>
  </div>
  <span class="dist">${esc(t.ondasSitios(g.n))}</span>
</article>`).join('');
    escribe(hubRel(lang, ''),
      cabecera({ lang, title: t.indexTitle, desc: t.indexDesc(total), canonical: url, altHref: alt, jsonld })
      + hero({ lang, h1: t.indexH1, intro: t.indexIntro(total),
               cifras: t.indexCifras(total, generadas.length), video: 'hero-atardecer-aereo.mp4' })
      + '<div class="wrap libro">' + avisoExtracto(lang)
      + seccion(1, 'g-todo', t.porDondeEmpezar, generadas.length, fichas, null, lang)
      + bloqueCta(lang) + pie(lang));
  }
}

console.log(`✓ hub generado en docs/guia-vera/ (es + en)`);
for (const g of resumen.es) console.log(`   /guia-vera/${g.slug}/  ${String(g.n).padStart(3)} sitios`);
console.log(`   /guia-vera/          índice`);
for (const g of resumen.en) console.log(`   /guia-vera/en/${g.slug}/  ${String(g.n).padStart(3)} places`);
console.log(`   /guia-vera/en/          index`);
