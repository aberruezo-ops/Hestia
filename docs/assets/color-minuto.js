(function () {
  var BASE = {
    '--crema': '#F6F5F4', '--arena': '#E6E4DF', '--arena-dk': '#D7D3CB',
    '--crema-alba': '#EAE9E6', '--crema-dawn': '#E3E1DD', '--crema-noon': '#F2F1EF',
    '--crema-dusk': '#CFCABF', '--crema-warm': '#E0DDD8'
  };
  var SAT = 0.12;
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

  function paint() {
    var d = new Date();
    var minuto = d.getHours() * 60 + d.getMinutes();
    var h = ((minuto * 6 + 40) % 360) / 360;
    var st = document.documentElement.style;
    Object.keys(BASE).forEach(function (k) {
      var l = LIGHT[k];
      st.setProperty(k, hex(h, Math.min(SAT * (1 + (0.955 - l) / 0.11 * 0.2), 0.3), l));
    });
  }

  function next() {
    setTimeout(function () { paint(); next(); }, 60000 - (Date.now() % 60000) + 50);
  }

  paint();
  next();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) paint(); });
})();
