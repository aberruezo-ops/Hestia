// Favicon de día (fondo crema, teal profundo) o de noche (fondo berenjena) según el sol en Vera Playa.
(function () {
  var LAT = 36.96, LON = -1.83, R = Math.PI / 180;
  function isDay(now) {
    var n = Math.floor((now - Date.UTC(now.getUTCFullYear(), 0, 0)) / 864e5);
    var decl = 23.44 * R * Math.sin(R * 360 / 365 * (n - 81));
    var b = R * 360 / 364 * (n - 81);
    var eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    var c = (Math.sin(-0.833 * R) - Math.sin(LAT * R) * Math.sin(decl)) / (Math.cos(LAT * R) * Math.cos(decl));
    if (c >= 1) return false;
    if (c <= -1) return true;
    var half = Math.acos(c) / R * 4, noon = 720 - 4 * LON - eot;
    var m = now.getUTCHours() * 60 + now.getUTCMinutes();
    return m >= noon - half && m <= noon + half;
  }
  function apply() {
    var day = isDay(new Date());
    var links = document.querySelectorAll('link[rel="icon"]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href').replace('-dia.png', '.png');
      links[i].setAttribute('href', day ? h.replace('.png', '-dia.png') : h);
    }
  }
  apply();
  setInterval(apply, 6e5);
  document.addEventListener('visibilitychange', apply);
})();
