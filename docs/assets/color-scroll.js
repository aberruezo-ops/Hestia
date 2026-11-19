(function () {
  var BASE = {
    '--crema': '#F6F5F4', '--arena': '#E5E3E0', '--arena-dk': '#D6D3CC',
    '--crema-alba': '#EAE9E6', '--crema-dawn': '#E3E1DD', '--crema-noon': '#F2F1EF',
    '--crema-dusk': '#CDC9C1', '--crema-warm': '#E0DDD9'
  };
  var LIGHT = {};
  Object.keys(BASE).forEach(function (k) {
    var h = BASE[k];
    var r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    LIGHT[k] = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
  });

  function hex(h, s, l) {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function f(t) {
      t = (t + 1) % 1;
      var v = t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
      return ('0' + Math.round(v * 255).toString(16)).slice(-2);
    }
    return '#' + f(h + 1 / 3) + f(h) + f(h - 1 / 3);
  }

  // Un día en Vera repartido por la altura de la página: la cal es la base al
  // empezar (alba) y el matiz recorre mañana, mediodía, atardecer y crepúsculo
  // hasta una noche azul pizarra al llegar al pie. La saturación sube un poco
  // en el atardecer y la noche; la luminosidad no cambia, así que el contraste tampoco.
  var DIA = [[0, 40, 0.10], [0.3, 46, 0.09], [0.55, 52, 0.08], [0.75, 22, 0.17], [0.9, 335, 0.16], [1, 235, 0.15]];

  function tonoDelDia(p) {
    for (var i = 1; i < DIA.length; i++) {
      if (p <= DIA[i][0]) {
        var a = DIA[i - 1], b = DIA[i];
        var t = (p - a[0]) / (b[0] - a[0]);
        var d = ((b[1] - a[1] + 540) % 360) - 180;
        return { h: ((a[1] + d * t + 360) % 360) / 360, s: a[2] + (b[2] - a[2]) * t };
      }
    }
    var u = DIA[DIA.length - 1];
    return { h: u[1] / 360, s: u[2] };
  }

  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pendiente = false;

  function paint() {
    pendiente = false;
    var y = Math.max(window.pageYOffset || 0, 0);
    var de = document.documentElement;
    var largo = Math.max((de.scrollHeight || 0) - (window.innerHeight || 0), 1);
    var d = tonoDelDia(Math.min(y / largo, 1));
    Object.keys(BASE).forEach(function (k) {
      de.style.setProperty(k, hex(d.h, d.s, LIGHT[k]));
    });
  }

  function alScroll() {
    if (!pendiente) { pendiente = true; requestAnimationFrame(paint); }
  }

  if (!quieto) {
    paint();
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    window.addEventListener('load', alScroll);
    window.addEventListener('pageshow', paint);
  }
})();
