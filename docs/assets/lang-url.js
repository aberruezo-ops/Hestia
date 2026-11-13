// Idioma por URL: /x.html es español y /en/x.html es inglés. La URL manda sobre
// localStorage; el botón ES/EN navega al par en lugar de cambiar el texto en sitio.
(function () {
  var TWINS = 'index|mar|thalassa|salinas|reservas|estancias-largas|opiniones|nosotros|empresas|contacto|normas|noticias';
  var re = new RegExp('^(?:\\./|/)?(' + TWINS + ')\\.html(?=$|[?#])');
  var en = /^\/en(\/|$)/.test(location.pathname);
  window.__HESTIA_LANG__ = en ? 'en' : 'es';

  function toEn(h) {
    if (h === '/' || h === './') return '/en/';
    var m = h.match(re);
    if (!m) return h;
    var rest = h.slice(h.indexOf('.html') + 5);
    return m[1] === 'index' ? '/en/' + rest : '/en/' + m[1] + '.html' + rest;
  }
  window.__hestiaHref = function (h) { return en ? toEn(String(h)) : h; };

  window.__hestiaSwitchLang = function (target) {
    try { localStorage.setItem('hestia-lang', target); } catch (e) {}
    if (target === window.__HESTIA_LANG__) return false;
    var p = location.pathname;
    var np = target === 'en'
      ? (p === '/' || p === '/index.html' ? '/en/' : '/en' + p)
      : (p.replace(/^\/en/, '') || '/');
    location.href = np + location.search + location.hash;
    return true;
  };

  if (!en) {
    try {
      if (localStorage.getItem('hestia-lang') === 'en' && !/[?&]lang=es\b/.test(location.search)) {
        var p = location.pathname;
        location.replace((p === '/' || p === '/index.html' ? '/en/' : '/en' + p) + location.search + location.hash);
      }
    } catch (e) {}
    return;
  }

  // En /en/ el <base href="/"> hace que los enlaces relativos apunten a la raíz:
  // los de página se reescriben al par inglés y los de ancla se resuelven en sitio.
  function fix(root) {
    var as = (root.querySelectorAll ? root.querySelectorAll('a[href]') : []);
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href'), n = toEn(h);
      if (n !== h) as[i].setAttribute('href', n);
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    fix(document);
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'attributes') { var h = m.target.getAttribute('href'), n = h && toEn(h); if (n && n !== h) m.target.setAttribute('href', n); }
        else for (var j = 0; j < m.addedNodes.length; j++) if (m.addedNodes[j].nodeType === 1) { if (m.addedNodes[j].matches && m.addedNodes[j].matches('a[href]')) { var hh = m.addedNodes[j].getAttribute('href'), nn = toEn(hh); if (nn !== hh) m.addedNodes[j].setAttribute('href', nn); } fix(m.addedNodes[j]); }
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute('href').slice(1), el = id && document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    try { history.replaceState(null, '', location.pathname + location.search + (id ? '#' + id : '')); } catch (x) {}
  }, true);
})();
