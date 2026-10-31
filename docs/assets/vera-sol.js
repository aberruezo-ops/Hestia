// El sol de Vera Playa: fase del día (alba, día, ocaso, noche) para toda la web.
// Pone data-sol en <html>, cambia favicon y theme-color y avisa con el evento hestia:sol.
// Vista previa: ?hora=21:30 (hora de Vera) o VeraSol.setPreview(minutosDelDía | null).
(function () {
  var LAT = 37.18, LON = -1.83, R = Math.PI / 180, TZ = 'Europe/Madrid';
  var FASES = ['alba', 'dia', 'ocaso', 'noche'];
  var THEME = { alba: '#4E2446', dia: '#2A0F2E', ocaso: '#4A2236', noche: '#160818' };
  var fmtParts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  var fmtHora = new Intl.DateTimeFormat('es-ES', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  var preview = null, last = null, lastRaw = null;

  function parts(ms) {
    var o = {}; fmtParts.formatToParts(new Date(ms)).forEach(function (p) { if (p.type !== 'literal') o[p.type] = +p.value; });
    return o;
  }
  function offsetMin(ms) { var p = parts(ms); return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(ms / 6e4) * 6e4) / 6e4; }
  function minutosVera(ms) { var p = parts(ms); return p.hour * 60 + p.minute; }

  // Amanecer y ocaso (UTC, ms) del día UTC que contiene `ms`. Algoritmo NOAA simplificado.
  function sol(ms) {
    var d = new Date(ms), day0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    var n = Math.floor((day0 - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
    var decl = 23.44 * R * Math.sin(R * 360 / 365 * (n - 81));
    var b = R * 360 / 364 * (n - 81);
    var eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    var c = (Math.sin(-0.833 * R) - Math.sin(LAT * R) * Math.sin(decl)) / (Math.cos(LAT * R) * Math.cos(decl));
    c = Math.max(-1, Math.min(1, c));
    var half = Math.acos(c) / R * 4, noon = 720 - 4 * LON - eot;
    return { sale: day0 + (noon - half) * 6e4, pone: day0 + (noon + half) * 6e4 };
  }
  function eventos(ms) {
    var out = [];
    [-1, 0, 1].forEach(function (k) {
      var s = sol(ms + k * 864e5);
      out.push({ fase: 'alba', at: s.sale - 40 * 6e4 }, { fase: 'dia', at: s.sale + 40 * 6e4 },
               { fase: 'ocaso', at: s.pone - 70 * 6e4 }, { fase: 'noche', at: s.pone + 35 * 6e4 });
    });
    return out.sort(function (a, b) { return a.at - b.at; });
  }
  function estado(ms) {
    var ev = eventos(ms), cur = ev[0], next = null;
    for (var i = 0; i < ev.length; i++) { if (ev[i].at <= ms) cur = ev[i]; else { next = ev[i]; break; } }
    var s = sol(ms);
    return { ms: ms, fase: cur.fase, desde: cur.at, siguiente: next, sale: s.sale, pone: s.pone,
             solArriba: ms >= s.sale && ms <= s.pone, minVera: minutosVera(ms), vistaPrevia: preview !== null };
  }
  function ahoraMs() {
    if (preview === null) return Date.now();
    var p = parts(Date.now()), base = Date.UTC(p.year, p.month - 1, p.day);
    return base + preview * 6e4 - offsetMin(base + preview * 6e4) * 6e4;
  }
  function hora(ms) { return fmtHora.format(new Date(ms)); }

  function aplicar(emitir) {
    var st = estado(ahoraMs()), root = document.documentElement;
    root.setAttribute('data-sol', st.fase);
    root.setAttribute('data-sol-dia', st.solArriba ? '1' : '0');
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', THEME[st.fase]);
    var links = document.querySelectorAll('link[rel="icon"]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href').replace('-dia.png', '.png');
      links[i].setAttribute('href', st.solArriba ? h.replace('.png', '-dia.png') : h);
    }
    var cambio = !last || last.fase !== st.fase || last.vistaPrevia !== st.vistaPrevia;
    var prev = last; last = st;
    if (emitir || cambio) window.dispatchEvent(new CustomEvent('hestia:sol', { detail: { estado: st, anterior: prev, cambio: cambio } }));
    return st;
  }
  window.VeraSol = {
    FASES: FASES, estado: function () { return last || aplicar(false); }, hora: hora, estadoEn: estado,
    setPreview: function (min) { preview = (min === null || min === undefined) ? null : Math.max(0, Math.min(1439, Math.round(min))); aplicar(true); },
    ahoraMs: ahoraMs
  };
  var m = /[?&]hora=(\d{1,2}):(\d{2})/.exec(location.search);
  if (m && +m[1] < 24 && +m[2] < 60) preview = +m[1] * 60 + +m[2];
  aplicar(false);
  document.addEventListener('DOMContentLoaded', function () { aplicar(false); });
  setInterval(function () { aplicar(false); }, 3e4);
  document.addEventListener('visibilitychange', function () { aplicar(false); });
})();
