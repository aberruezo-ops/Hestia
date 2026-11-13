/**
 * build-landings.mjs
 *
 * Páginas de destino estáticas para búsquedas concretas (mascotas, cerca de la
 * playa, piscina, invierno), en español e inglés, con FAQ en JSON-LD:
 *
 *   /vera-playa/<slug>/        ·  /vera-playa/en/<slug>/
 *
 * Cada hecho sale de los mismos ficheros que el resto de la web: el suplemento de
 * mascota de prices.json y el clima de climate-monthly.json se leen al generar, el
 * resto es texto verificado contra CLAUDE.md y strategy/redes/hechos-y-ventajas.md.
 * Nunca precios de estancia ni tarifa mensual: se remite a las páginas de reserva.
 *
 * También reescribe el bloque `landings` de docs/sitemap.xml (entre marcadores).
 * Uso:  node scripts/build-landings.mjs   (vuelve a ejecutarlo si cambia prices.json)
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { BASE, esc, clip, cabecera, hero, cta, pie, migas, migasHtml, localize } from './lib/pagina-estatica.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const OUT = join(DOCS, 'vera-playa');
const SITEMAP = join(DOCS, 'sitemap.xml');
const START = '<!-- landings:start -->';
const END = '<!-- landings:end -->';

const prices = JSON.parse(readFileSync(join(DOCS, 'data/prices.json'), 'utf8'));
const climate = JSON.parse(readFileSync(join(DOCS, 'data/climate-monthly.json'), 'utf8'));
const PET = prices.rules.petPerNight, PET_MAX = prices.rules.petMax;
const winter = [12, 1, 2].map(m => climate.months.find(c => c.m === m));
const wMax = [Math.min(...winter.map(c => c.max)), Math.max(...winter.map(c => c.max))];
const wMin = [Math.min(...winter.map(c => c.min)), Math.max(...winter.map(c => c.min))];

const C = { vm: '#6B7A3A', vt: '#B86A3C', vs: '#B08A24' };
const APT = {
  es: {
    mar: ['Hestía Mar', 'vm', '/mar.html'], thalassa: ['Hestía Thalassa', 'vt', '/thalassa.html'], salinas: ['Hestía Salinas', 'vs', '/salinas.html'],
  },
  en: {
    mar: ['Hestía Mar', 'vm', '/mar.html'], thalassa: ['Hestía Thalassa', 'vt', '/thalassa.html'], salinas: ['Hestía Salinas', 'vs', '/salinas.html'],
  },
};
const T = {
  es: { eyebrow: 'Vera Playa, Almería', inicio: 'Inicio', see: 'Ver', related: 'Más sobre Vera Playa', faq: 'Preguntas frecuentes', apts: 'Los tres Hestía' },
  en: { eyebrow: 'Vera Playa, Almería', inicio: 'Home', see: 'See', related: 'More about Vera Playa', faq: 'Frequently asked questions', apts: 'The three Hestías' },
};

// Cada página: slug por idioma, textos, secciones (h2 + párrafos o lista), apartamentos (clave: frase) y FAQ.
const PAGES = [
  {
    id: 'mascotas', slug: { es: 'apartamentos-con-mascotas', en: 'pet-friendly-apartments' },
    es: {
      title: 'Apartamentos con mascotas en Vera Playa · Hestía',
      desc: `Los tres Hestía admiten perros y gatos en Vera Playa, con petición previa y un suplemento de ${PET} € por noche (máximo ${PET_MAX} € por estancia). Reserva directa.`,
      h1: 'Apartamentos con mascotas en Vera Playa',
      intro: 'Mar, Thalassa y Salinas admiten mascotas. Solo te pedimos que nos avises al reservar y que respetes unas normas sencillas.',
      sections: [
        { h2: 'Cómo funciona', p: [
          'Las mascotas son bienvenidas en los tres Hestía si nos lo pides antes de la llegada. No hay vetos ni tarifas abusivas: el suplemento es de ' + PET + ' € por noche, con un máximo de ' + PET_MAX + ' € por estancia.',
          'Avísanos al reservar, por WhatsApp o por email, y lo dejamos anotado para que tu llegada sea tranquila.'] },
        { h2: 'Normas básicas', list: [
          'Dentro de Hestía, que no suban a sofás, sillones ni camas.',
          'Que no hagan sus necesidades dentro de Hestía ni en las zonas comunes de la urbanización.',
          'En las zonas comunes, siempre atadas.',
          'Las mismas condiciones básicas en los espacios públicos.'] },
      ],
      apts: { mar: 'Planta primera con ascensor, jardín y piscina comunitaria. El más cercano a la playa, a 300–400 m.', thalassa: 'El ático, con jardines y dos piscinas exteriores en el complejo.', salinas: 'El más grande, con grandes jardines con riachuelos y la reserva de aves a un paseo corto.' },
      faqs: [
        ['¿Puedo traer a mi perro o a mi gato?', 'Sí, en los tres Hestía, siempre bajo petición previa y con suplemento.'],
        ['¿Cuánto cuesta traer una mascota?', `El suplemento es de ${PET} € por noche, con un máximo de ${PET_MAX} € por estancia.`],
        ['¿Tengo que avisar antes?', 'Sí. Avísanos al reservar, por WhatsApp o por email, para dejarlo anotado.'],
        ['¿Qué normas hay?', 'Que no suban a sofás, sillones ni camas, que no hagan sus necesidades dentro ni en las zonas comunes y que vayan atadas en las zonas comunes.'],
      ],
    },
    en: {
      title: 'Pet-friendly apartments in Vera Playa · Hestía',
      desc: `All three Hestía apartments in Vera Playa accept dogs and cats on prior request, with a supplement of ${PET} € per night (maximum ${PET_MAX} € per stay). Book direct.`,
      h1: 'Pet-friendly apartments in Vera Playa',
      intro: 'Mar, Thalassa and Salinas all accept pets. We only ask you to tell us when you book and to follow a few simple rules.',
      sections: [
        { h2: 'How it works', p: [
          'Pets are welcome in all three Hestías if you ask us before arrival. No bans and no abusive fees: the supplement is ' + PET + ' € per night, with a maximum of ' + PET_MAX + ' € per stay.',
          'Tell us when you book, by WhatsApp or email, and we note it down so your arrival is smooth.'] },
        { h2: 'Basic rules', list: [
          'Inside Hestía, pets should not go on sofas, armchairs or beds.',
          'They should not relieve themselves inside Hestía or in the shared areas of the complex.',
          'In shared areas, always on a lead.',
          'The same basic conditions in public spaces.'] },
      ],
      apts: { mar: 'First floor with a lift, garden and shared pool. The closest to the beach, 300–400 m away.', thalassa: 'The penthouse, with gardens and two outdoor pools in the complex.', salinas: 'The largest, with large gardens with streams and the bird reserve a short walk away.' },
      faqs: [
        ['Can I bring my dog or cat?', 'Yes, in all three Hestías, always on prior request and with a supplement.'],
        ['How much does it cost to bring a pet?', `The supplement is ${PET} € per night, with a maximum of ${PET_MAX} € per stay.`],
        ['Do I need to tell you beforehand?', 'Yes. Let us know when you book, by WhatsApp or email, so we can note it down.'],
        ['What are the rules?', 'No sofas, armchairs or beds, no relieving themselves inside or in shared areas, and on a lead in shared areas.'],
      ],
    },
  },
  {
    id: 'playa', slug: { es: 'apartamentos-cerca-de-la-playa', en: 'apartments-near-the-beach' },
    es: {
      title: 'Apartamentos cerca de la playa en Vera Playa · Hestía',
      desc: 'Apartamentos en Vera Playa a 300–400 m de la playa, a cinco minutos a pie. Tres Hestía con reserva directa y trato directo con Alex y Fran.',
      h1: 'Apartamentos cerca de la playa en Vera Playa',
      intro: 'Vera Playa es una playa larga y tranquila de arena fina, con unos 320 días de sol al año. Hestía Mar está a 300–400 m, unos cinco minutos a pie.',
      sections: [
        { h2: 'Qué distancia hay a la playa', list: [
          'Hestía Mar: a 300–400 m, unos cinco minutos a pie desde la salida.',
          'Hestía Salinas: a unos 900 m del mar, con la playa a cinco minutos en coche.',
          'Hestía Thalassa: el ático, a 1,5 km de la playa y con el Mediterráneo de frente desde la terraza.'] },
        { h2: 'Más allá de Vera Playa', p: [
          'Desde los tres Hestía tienes cerca las calas del Cabo de Gata, además de Garrucha y Mojácar. Si quieres un plan para cada día, mira la guía de la zona y las noticias del mes.'] },
      ],
      apts: { mar: 'El más cercano a la playa, con terraza esquinera de 20 m² y vistas parciales al mar entre palmeras.', thalassa: 'Ático a 1,5 km de la playa, con terraza delantera de 18 m² y vistas panorámicas al mar.', salinas: 'El más grande de los tres, con dos terrazas y la playa a cinco minutos en coche.' },
      faqs: [
        ['¿Cuál es el apartamento más cercano a la playa?', 'Hestía Mar, a 300–400 m, unos cinco minutos a pie.'],
        ['¿Hay vistas al mar?', 'Desde Mar hay vistas parciales al mar entre palmeras. Desde Thalassa, vistas panorámicas al Mediterráneo.'],
        ['¿Se llega a la playa a pie desde Salinas?', 'Salinas está a unos 900 m del mar y la playa queda a cinco minutos en coche.'],
        ['¿Cómo es la playa de Vera?', 'Larga, tranquila y de arena fina, con unos 320 días de sol al año.'],
      ],
    },
    en: {
      title: 'Apartments near the beach in Vera Playa · Hestía',
      desc: 'Apartments in Vera Playa 300–400 m from the beach, a five-minute walk. Three Hestía homes with direct booking and direct contact with Alex and Fran.',
      h1: 'Apartments near the beach in Vera Playa',
      intro: 'Vera Playa is a long, quiet beach of fine sand, with around 320 days of sun a year. Hestía Mar is 300–400 m away, about a five-minute walk.',
      sections: [
        { h2: 'How far is the beach', list: [
          'Hestía Mar: 300–400 m, about a five-minute walk from the exit.',
          'Hestía Salinas: about 900 m from the sea, with the beach five minutes away by car.',
          'Hestía Thalassa: the penthouse, 1.5 km from the beach and with the Mediterranean ahead from the terrace.'] },
        { h2: 'Beyond Vera Playa', p: [
          'From all three Hestías the Cabo de Gata coves are nearby, as are Garrucha and Mojácar. If you want a plan for each day, see the area guide and the news of the month.'] },
      ],
      apts: { mar: 'The closest to the beach, with a 20 m² corner terrace and partial sea views among the palm trees.', thalassa: 'Penthouse 1.5 km from the beach, with an 18 m² front terrace and panoramic sea views.', salinas: 'The largest of the three, with two terraces and the beach five minutes away by car.' },
      faqs: [
        ['Which apartment is closest to the beach?', 'Hestía Mar, 300–400 m away, about a five-minute walk.'],
        ['Are there sea views?', 'From Mar there are partial sea views among the palm trees. From Thalassa, panoramic views of the Mediterranean.'],
        ['Can I walk to the beach from Salinas?', 'Salinas is about 900 m from the sea and the beach is five minutes away by car.'],
        ['What is Vera beach like?', 'Long, quiet and fine-sand, with around 320 days of sun a year.'],
      ],
    },
  },
  {
    id: 'piscina', slug: { es: 'apartamentos-con-piscina', en: 'apartments-with-pool' },
    es: {
      title: 'Apartamentos con piscina en Vera Playa · Hestía',
      desc: 'Apartamentos con piscina comunitaria en Vera Playa: Mar con piscina y jacuzzi, Thalassa con dos piscinas y SPA, Salinas con piscina y jardines. Reserva directa.',
      h1: 'Apartamentos con piscina en Vera Playa',
      intro: 'Los tres Hestía están en urbanizaciones con piscina comunitaria. Cambia lo que hay alrededor: jacuzzi, SPA, pistas o grandes jardines.',
      sections: [
        { h2: 'Qué tiene cada urbanización', list: [
          'Hestía Mar: piscina, jacuzzi y parque infantil comunitarios.',
          'Hestía Thalassa: dos piscinas exteriores, jardines, parques, pistas de pádel y tenis y un SPA comunitario con piscina climatizada, jacuzzi, sauna, pediluvio, gimnasio y zona de relax.',
          'Hestía Salinas: piscina, pistas de pádel y tenis y grandes jardines con riachuelos.'] },
        { h2: 'Cuándo se usan', p: [
          'La piscina y el jacuzzi comunitarios abren en la temporada de verano. El SPA de Thalassa, con su piscina climatizada, abre en otoño, invierno y primavera, y su gimnasio, todo el año. Si tienes dudas sobre tus fechas, pregúntanos antes de reservar.'] },
      ],
      apts: { mar: 'Piscina, jacuzzi y parque infantil comunitarios, a 300–400 m de la playa.', thalassa: 'Dos piscinas exteriores y el SPA comunitario, con piscina climatizada y sauna.', salinas: 'Piscina, pistas de pádel y tenis y grandes jardines con riachuelos.' },
      faqs: [
        ['¿Todos los apartamentos tienen piscina?', 'Sí, los tres están en urbanizaciones con piscina comunitaria.'],
        ['¿Hay piscina climatizada?', 'Sí, en Thalassa, dentro del SPA comunitario junto con jacuzzi, sauna, pediluvio, gimnasio y zona de relax. El SPA abre en otoño, invierno y primavera.'],
        ['¿Cuándo está abierta la piscina?', 'La piscina y el jacuzzi comunitarios abren en la temporada de verano. Pregúntanos por tus fechas.'],
        ['¿Hay algo para niños?', 'En Mar hay un parque infantil comunitario, además de la piscina y el jacuzzi.'],
      ],
    },
    en: {
      title: 'Apartments with a pool in Vera Playa · Hestía',
      desc: 'Apartments with a shared pool in Vera Playa: Mar with pool and jacuzzi, Thalassa with two pools and a spa, Salinas with pool and gardens. Book direct.',
      h1: 'Apartments with a pool in Vera Playa',
      intro: 'All three Hestías are in complexes with a shared pool. What changes is what surrounds it: jacuzzi, spa, courts or large gardens.',
      sections: [
        { h2: 'What each complex has', list: [
          'Hestía Mar: shared pool, jacuzzi and children\'s playground.',
          'Hestía Thalassa: two outdoor pools, gardens, parks, padel and tennis courts and a shared spa with heated pool, jacuzzi, sauna, foot bath, gym and relaxation area.',
          'Hestía Salinas: pool, padel and tennis courts and large gardens with streams.'] },
        { h2: 'When you can use them', p: [
          'The shared pool and jacuzzi open in the summer season. The Thalassa spa, with its heated pool, opens in autumn, winter and spring, and its gym all year. If you have doubts about your dates, ask us before booking.'] },
      ],
      apts: { mar: 'Shared pool, jacuzzi and children\'s playground, 300–400 m from the beach.', thalassa: 'Two outdoor pools and the shared spa, with heated pool and sauna.', salinas: 'Pool, padel and tennis courts and large gardens with streams.' },
      faqs: [
        ['Do all apartments have a pool?', 'Yes, all three are in complexes with a shared pool.'],
        ['Is there a heated pool?', 'Yes, at Thalassa, inside the shared spa along with jacuzzi, sauna, foot bath, gym and relaxation area. The spa opens in autumn, winter and spring.'],
        ['When is the pool open?', 'The shared pool and jacuzzi open in the summer season. Ask us about your dates.'],
        ['Is there anything for children?', 'At Mar there is a shared children\'s playground, as well as the pool and jacuzzi.'],
      ],
    },
  },
  {
    id: 'invierno', slug: { es: 'invierno-en-vera-playa', en: 'winter-in-vera-playa' },
    es: {
      title: 'Invierno en Vera Playa: sol y estancia larga · Hestía',
      desc: `Pasar el invierno en Vera Playa, Almería: máximas de ${wMax[0]} a ${wMax[1]}°C, 320 días de sol al año y estancias largas de septiembre a junio, desde 29 noches.`,
      h1: 'Invierno en Vera Playa: sol y estancia larga',
      intro: `En diciembre, enero y febrero las máximas rondan los ${wMax[0]} a ${wMax[1]}°C y la costa de Almería sigue con unos 320 días de sol al año. Es la mejor época para quedarse un mes o toda una temporada.`,
      sections: [
        { h2: 'Cómo es el invierno aquí', p: [
          `Las mínimas rondan los ${wMin[0]} a ${wMin[1]}°C (media histórica orientativa de la costa de Almería). La playa larga y de arena fina se camina sin prisa, y los pueblos, las calas y el Cabo de Gata están a mano.`] },
        { h2: 'Estancias largas, de septiembre a junio', list: [
          'Desde 29 noches, sin máximo.',
          'WiFi de fibra de 300 a 600 Mbps y mesa de trabajo bajo petición.',
          'Cocina completamente equipada, ropa de cama y toallas incluidas.',
          'Aire acondicionado y calefacción.',
          'En Thalassa, el SPA comunitario (piscina climatizada, jacuzzi y sauna) abre en otoño, invierno y primavera.',
          'Contrato formal, señal de ~20% al firmar y el resto a la llegada.'] },
        { h2: 'Tarifa mensual', p: [
          'La tarifa mensual depende de las fechas y del apartamento: la tienes en la página de estancias largas y te la cerramos por escrito en menos de 2 horas, de 9:00 a 22:00.'] },
      ],
      apts: { mar: 'El más cercano a la playa, con terraza esquinera de 20 m².', thalassa: 'El ático, con SPA comunitario con piscina climatizada y sauna abierto en invierno.', salinas: 'El más grande, con 87 m², dos terrazas y grandes jardines.' },
      extra: { href: '/estancias-largas.html', es: 'Ver estancias largas', en: 'See long stays' },
      faqs: [
        ['¿Qué temperaturas hay en invierno?', `En diciembre, enero y febrero, máximas de ${wMax[0]} a ${wMax[1]}°C y mínimas de ${wMin[0]} a ${wMin[1]}°C, como media histórica orientativa.`],
        ['¿Cuántas noches es el mínimo?', 'Desde 29 noches se considera estancia larga. No hay máximo.'],
        ['¿Hay estancias largas en verano?', 'No. Las estancias largas son de septiembre a junio.'],
        ['¿Se puede teletrabajar?', 'Sí: WiFi de fibra de 300 a 600 Mbps y mesa de trabajo bajo petición.'],
        ['¿Tienen calefacción?', 'Sí, aire acondicionado y calefacción.'],
      ],
    },
    en: {
      title: 'Winter in Vera Playa: sun and long stays · Hestía',
      desc: `Spending winter in Vera Playa, Almería: highs of ${wMax[0]} to ${wMax[1]}°C, 320 days of sun a year and long stays from September to June, from 29 nights.`,
      h1: 'Winter in Vera Playa: sun and long stays',
      intro: `In December, January and February highs hover around ${wMax[0]} to ${wMax[1]}°C and the Almería coast still gets about 320 days of sun a year. It is the best time to stay a month or a whole season.`,
      sections: [
        { h2: 'What winter is like here', p: [
          `Lows hover around ${wMin[0]} to ${wMin[1]}°C (indicative historical average for the Almería coast). The long fine-sand beach is for slow walks, and villages, coves and Cabo de Gata are close.`] },
        { h2: 'Long stays, September to June', list: [
          'From 29 nights, with no maximum.',
          'Fibre WiFi from 300 to 600 Mbps and a work table on request.',
          'Fully equipped kitchen, bed linen and towels included.',
          'Air conditioning and heating.',
          'At Thalassa, the shared spa (heated pool, jacuzzi and sauna) opens in autumn, winter and spring.',
          'Formal contract, ~20% deposit on signing and the rest on arrival.'] },
        { h2: 'Monthly rate', p: [
          'The monthly rate depends on your dates and the apartment: you will find it on the long stays page and we confirm it in writing within 2 hours, from 9:00 to 22:00.'] },
      ],
      apts: { mar: 'The closest to the beach, with a 20 m² corner terrace.', thalassa: 'The penthouse, with a shared spa with heated pool and sauna open in winter.', salinas: 'The largest, at 87 m², with two terraces and large gardens.' },
      extra: { href: '/estancias-largas.html', es: 'Ver estancias largas', en: 'See long stays' },
      faqs: [
        ['What are winter temperatures like?', `In December, January and February, highs of ${wMax[0]} to ${wMax[1]}°C and lows of ${wMin[0]} to ${wMin[1]}°C, as an indicative historical average.`],
        ['What is the minimum stay?', 'From 29 nights it counts as a long stay. There is no maximum.'],
        ['Are there long stays in summer?', 'No. Long stays run from September to June.'],
        ['Can I work remotely?', 'Yes: fibre WiFi from 300 to 600 Mbps and a work table on request.'],
        ['Is there heating?', 'Yes, air conditioning and heating.'],
      ],
    },
  },
];

const url = (lang, slug) => `${BASE}/vera-playa/${lang === 'en' ? 'en/' : ''}${slug}/`;
const path = (lang, slug) => url(lang, slug).replace(BASE, '');

const today = new Date().toISOString().slice(0, 10);
const lastmod = (() => {
  const dirty = execFileSync('git', ['status', '--porcelain', '--', 'scripts/build-landings.mjs', 'docs/data/prices.json'], { encoding: 'utf8' }).trim();
  return dirty ? today : (execFileSync('git', ['log', '-1', '--format=%cs', '--', 'scripts/build-landings.mjs', 'docs/data/prices.json'], { encoding: 'utf8' }).trim() || today);
})();

rmSync(OUT, { recursive: true, force: true });
const entries = [];

for (const lang of ['es', 'en']) {
  const other = lang === 'es' ? 'en' : 'es', t = T[lang];
  for (const pg of PAGES) {
    const c = pg[lang], canonical = url(lang, pg.slug[lang]), alt = url(other, pg.slug[other]);
    const trail = [[t.inicio, `${BASE}/`], [c.h1, canonical]];
    const secciones = c.sections.map(s => `
<section class="grupo">
  <div class="grupo-head"><h2>${esc(s.h2)}</h2></div>
  ${(s.p || []).map(x => `<p class="cuerpo">${esc(x)}</p>`).join('')}
  ${s.list ? `<ul class="lista">${s.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
</section>`).join('');
    const aptos = ['mar', 'thalassa', 'salinas'].map(k => {
      const [nombre, cl, href] = APT[lang][k];
      return `<div class="apt-nota" style="--ola-c:${C[cl]}">
  <h3><a href="${href}" style="color:${C[cl]}">${esc(nombre)}</a></h3>
  <p>${esc(c.apts[k])}</p>
</div>`;
    }).join('');
    const faqs = c.faqs.map(([q, a]) => `<div class="faq"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('');
    const otras = PAGES.filter(p => p !== pg).map(p => `<li><a href="${path(lang, p.slug[lang])}">${esc(p[lang].h1)}</a></li>`).join('')
      + `<li><a href="${lang === 'es' ? '/guia-vera/' : '/guia-vera/en/'}">${lang === 'es' ? 'Guía de Vera Playa y el Levante almeriense' : 'Guide to Vera Playa and the Almería Levante'}</a></li>`
      + `<li><a href="${lang === 'es' ? '/noticias/' : '/noticias/en/'}">${lang === 'es' ? 'Noticias y planes del mes' : 'News and plans of the month'}</a></li>`
      + (pg.extra ? '' : `<li><a href="/estancias-largas.html">${lang === 'es' ? 'Estancias largas' : 'Long stays'}</a></li>`);
    const html = cabecera({
      lang, title: c.title, desc: clip(c.desc, 158), canonical, altHref: alt, navHref: lang === 'es' ? '/noticias/' : '/noticias/en/', navLabel: lang === 'es' ? 'Noticias' : 'News', ogType: 'website',
      jsonld: [migas(lang, trail), {
        '@context': 'https://schema.org', '@type': 'WebPage', name: c.h1, description: c.desc, url: canonical, inLanguage: lang,
        isPartOf: { '@type': 'WebSite', name: 'Hestía Your Home', url: `${BASE}/` },
        about: { '@type': 'LodgingBusiness', '@id': `${BASE}/#org`, name: 'Hestía Your Home' } }, {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: c.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
    })
      + hero(lang, c.h1, c.intro, t.eyebrow)
      + `\n<div class="wrap libro">\n${migasHtml(trail.map(([a, b]) => [a, b.replace(BASE, '')]))}
${secciones}
<section class="grupo"><div class="grupo-head"><h2>${esc(t.apts)}</h2></div>${aptos}
${pg.extra ? `<p class="cuerpo"><a href="${pg.extra.href}" style="color:var(--sol-txt)">${esc(pg.extra[lang])} →</a></p>` : ''}</section>
<section class="grupo"><div class="grupo-head"><h2>${esc(t.faq)}</h2></div>${faqs}</section>
<section class="grupo"><div class="grupo-head"><h2>${esc(t.related)}</h2></div><ul class="lista">${otras}</ul></section>${cta(lang)}${pie(lang)}`;
    const dir = join(OUT, lang === 'en' ? 'en' : '', pg.slug[lang]);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), localize(html, lang), 'utf8');
    entries.push({ lang, loc: canonical, alt });
  }
}

const block = entries.map(e => {
  const es = e.lang === 'es' ? e.loc : e.alt, en = e.lang === 'en' ? e.loc : e.alt;
  return `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
}).join('\n');
let sm = readFileSync(SITEMAP, 'utf8');
const wrapped = `  ${START}\n${block}  ${END}\n`;
if (sm.includes(START)) sm = sm.replace(new RegExp(`  ${START}[\\s\\S]*?${END}\\n`), wrapped);
else sm = sm.replace('</urlset>', `${wrapped}\n</urlset>`);
writeFileSync(SITEMAP, sm);
console.log(`Páginas de destino: ${PAGES.length} x 2 idiomas = ${entries.length} URLs`);
