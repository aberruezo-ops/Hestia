// Reel vertical de tipografía animada con la marca de Hestía.
// Uso: node videos/plantilla-texto/generar.mjs videos/<proyecto>/spec.json
// Lee el spec, copia letras, logo y GSAP al proyecto y escribe index.html (1080x1920, 30 fps).
// En una frase, *palabra* se pinta con el color de acento. Todo el texto sale del spec: nada se inventa aquí.
import fs from 'node:fs';
import path from 'node:path';
import { horizonte } from '../../scripts/lib/ola-mask.mjs';

const specPath = path.resolve(process.argv[2] || '');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const dir = path.dirname(specPath);
const repo = path.resolve(import.meta.dirname, '../..');
const FONTS = ['Fraunces-500.ttf', 'Fraunces-600.ttf', 'HankenGrotesk-400.ttf', 'HankenGrotesk-600.ttf'];
const CAL = '#F6F5F4', INK = '#2A0F2E', INK2 = '#3D1A35', BER = '#2A0F2E';

fs.mkdirSync(path.join(dir, 'assets/fonts'), { recursive: true });
fs.mkdirSync(path.join(dir, 'assets/vendor'), { recursive: true });
fs.mkdirSync(path.join(dir, 'assets/images'), { recursive: true });
for (const f of FONTS) fs.copyFileSync(path.join(repo, 'videos/salinas-reel/assets/fonts', f), path.join(dir, 'assets/fonts', f));
fs.copyFileSync(path.join(repo, 'videos/salinas-reel/assets/vendor/gsap.min.js'), path.join(dir, 'assets/vendor/gsap.min.js'));
for (const l of ['logo-berenjena', 'logo-blanco']) fs.copyFileSync(path.join(repo, `docs/assets/${l}.png`), path.join(dir, `assets/images/${l}.png`));
if (spec.close.photo) fs.copyFileSync(path.join(repo, spec.close.photo), path.join(dir, 'assets/images/foto.jpg'));

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const words = text => {
  let on = false; const out = [];
  for (const tok of text.split(' ')) {
    const start = tok.startsWith('*'), end = tok.endsWith('*');
    if (start) on = true;
    out.push({ t: tok.replace(/\*/g, ''), a: on });
    if (end) on = false;
  }
  return out;
};

// Tiempos: revelado + lectura (0,5 s + 0,3 s por palabra) + salida.
const REVEAL = 0.09, EXIT = 0.18, GAP = 0;
let t = 0;
const beats = spec.beats.map((b, i) => {
  const w = words(b.text), n = w.length;
  const reveal = b.mode === 'lineBlur' ? 0.2 : 0.2 + REVEAL * (n - 1);
  const read = 0.5 + 0.3 * n + (b.extraHold || 0);
  const dur = reveal + read + EXIT;
  const o = { ...b, i, w, n, start: t, dur, reveal, exitAt: t + dur - EXIT };
  t += dur + GAP;
  return o;
});
const last = beats[beats.length - 1];
const closeStart = t;
const closeDur = spec.close.hold + 1.6;
const total = +(closeStart + closeDur).toFixed(2);
const A = spec.accent, AS = spec.accentSoft;

const beatHtml = beats.map(b => {
  const size = b.size || 112;
  const ws = b.w.map((x, k) => `<span class="w${x.a ? ' ac' : ''}" id="b${b.i}-w${k}">${esc(x.t)}</span>`).join(' ');
  const sub = b.sub ? `<p class="sub" id="b${b.i}-sub">${esc(b.sub)}</p>` : '';
  return `      <div id="b${b.i}" class="clip beat" data-start="${b.start.toFixed(2)}" data-duration="${b.dur.toFixed(2)}" data-track-index="2">
        <div class="inner" id="b${b.i}-in"><p class="line" id="b${b.i}-line" style="font-size:${size}px">${ws}</p>${sub}</div>
      </div>`;
}).join('\n');

const attrHtml = spec.attribution
  ? `      <p id="attr" class="clip" data-start="${(last.start + last.reveal + 0.4).toFixed(2)}" data-duration="${(last.dur - last.reveal - 0.4).toFixed(2)}" data-track-index="3">${esc(spec.attribution)}</p>`
  : '';

const c = spec.close;
const closeHtml = `      <div id="close" class="clip" data-start="${closeStart.toFixed(2)}" data-duration="${closeDur.toFixed(2)}" data-track-index="4">
        ${c.photo ? `<div id="win"><img id="photo" src="assets/images/foto.jpg" alt="" /><div id="scrim"></div></div>` : ''}
        <div id="cbox">
          <img id="clogo" src="assets/images/logo-blanco.png" alt="Hestía" />
          <p id="c1">${c.dot ? '<span id="cdot"></span>' : ''}${esc(c.line1)}</p>
          <p id="c2">${esc(c.line2)}</p>
          ${c.line3 ? `<p id="c3">${esc(c.line3)}</p>` : ''}
        </div>
      </div>`;

const reveals = beats.map(b => {
  const sel = `#b${b.i}`;
  let enter;
  if (b.mode === 'greyToInk') {
    enter = `tl.fromTo("${sel} .w", { opacity: 0.0, color: "#B9B1B6" }, { opacity: 1, color: "${INK}", duration: 0.2, stagger: ${REVEAL}, ease: "power2.out" }, ${b.start.toFixed(2)});
    ${b.w.some(x => x.a) ? `tl.to("${sel} .w.ac", { color: "${A}", duration: 0.2, ease: "power2.out" }, ${(b.start + 0.2 + REVEAL * (b.n - 1)).toFixed(2)});` : ''}`;
  } else if (b.mode === 'lineBlur') {
    enter = `tl.fromTo("${sel}-line", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${b.start.toFixed(2)});`;
  } else {
    enter = `tl.fromTo("${sel} .w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.18, stagger: ${REVEAL}, ease: "power4.out" }, ${b.start.toFixed(2)});`;
  }
  const sub = b.sub ? `\n    tl.fromTo("${sel}-sub", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.25, ease: "power4.out" }, ${(b.start + b.reveal + 0.2).toFixed(2)});` : '';
  const exit = `tl.to("${sel}-in", { opacity: 0, filter: "blur(8px)", duration: ${EXIT - 0.02}, ease: "power2.in" }, ${b.exitAt.toFixed(2)});`;
  return `    ${enter}${sub}\n    ${exit}`;
}).join('\n');

const attrAnim = spec.attribution ? `    tl.fromTo("#attr", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "power4.out" }, ${(last.start + last.reveal + 0.4).toFixed(2)});
    tl.to("#attr", { opacity: 0, filter: "blur(8px)", duration: 0.16, ease: "power2.in" }, ${(last.exitAt).toFixed(2)});` : '';

const wavesColorTo = c.photo ? '' : `    tl.to("#waves", { backgroundColor: "#F6F5F4", opacity: 0.5, duration: 0.45, ease: "power2.inOut" }, ${closeStart.toFixed(2)});`;
const closeAnim = c.photo
  ? `    tl.fromTo("#win", { clipPath: "inset(1420px 0px 440px 0px)" }, { clipPath: "inset(0px 0px 0px 0px)", duration: 0.9, ease: "power3.inOut" }, ${closeStart.toFixed(2)});
    tl.fromTo("#photo", { scale: 1.0 }, { scale: 1.07, duration: ${closeDur.toFixed(2)}, ease: "none" }, ${closeStart.toFixed(2)});`
  : `    tl.fromTo("#flood", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.inOut" }, ${closeStart.toFixed(2)});`;

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Fraunces"; font-weight: 500; src: url("assets/fonts/Fraunces-500.ttf"); }
      @font-face { font-family: "Fraunces"; font-weight: 600; src: url("assets/fonts/Fraunces-600.ttf"); }
      @font-face { font-family: "Hanken Grotesk"; font-weight: 400; src: url("assets/fonts/HankenGrotesk-400.ttf"); }
      @font-face { font-family: "Hanken Grotesk"; font-weight: 600; src: url("assets/fonts/HankenGrotesk-600.ttf"); }
      :root { --cal: ${CAL}; --ink: ${INK}; --ink2: ${INK2}; --accent: ${A}; --soft: ${AS}; --ola: ${horizonte(7)}; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: var(--cal); }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: "Fraunces", serif; color: var(--ink); }
      #ground { position: absolute; inset: 0; background: var(--cal); }
      #flood { position: absolute; inset: 0; background: ${BER}; opacity: 0; }
      #logo-top { position: absolute; left: 456px; top: 196px; width: 168px; height: 168px; }
      #waves { position: absolute; left: 0; top: 1500px; width: 1920px; height: 88px; background: var(--ink); opacity: 0.55;
        -webkit-mask: var(--ola) repeat-x 0 0 / 840px 88px; mask: var(--ola) repeat-x 0 0 / 840px 88px; }
      .beat { position: absolute; left: 200px; top: 168px; width: 680px; height: 904px; }
      .inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .line { font-weight: 500; line-height: 1.1; letter-spacing: -0.01em; text-wrap: balance; color: var(--ink); }
      .w.ac { color: var(--accent); font-weight: 600; }
      .sub { margin-top: 30px; font-family: "Hanken Grotesk", sans-serif; font-weight: 400; font-size: 40px; line-height: 1.3; color: var(--ink2); opacity: 0.8; max-width: 680px; }
      #attr { position: absolute; left: 200px; width: 680px; top: 770px; text-align: center; font-family: "Hanken Grotesk", sans-serif; font-weight: 400; font-size: 40px; color: var(--ink2); opacity: 0.8; }
      #close { position: absolute; inset: 0; }
      #win { position: absolute; inset: 0; overflow: hidden; clip-path: inset(1420px 0px 440px 0px); }
      #photo { position: absolute; left: -180px; top: 0; width: 1440px; height: 1920px; object-fit: cover; }
      #scrim { position: absolute; inset: 0; background: rgba(42, 15, 46, 0.58); }
      #cbox { position: absolute; left: 200px; width: 680px; top: 250px; height: 560px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #F6F5F4; }
      #clogo { width: 150px; height: 150px; margin-bottom: 30px; }
      #c1 { text-wrap: balance; font-weight: 500; font-size: 100px; line-height: 1.08; letter-spacing: -0.01em; }
      #cdot { display: inline-block; width: 26px; height: 26px; border-radius: 50%; background: var(--soft); margin-right: 26px; vertical-align: 14px; }
      #c2 { margin-top: 24px; font-family: "Hanken Grotesk", sans-serif; font-weight: 600; font-size: 38px; letter-spacing: 0; color: #E6E4DF; }
      #c3 { margin-top: 22px; font-family: "Hanken Grotesk", sans-serif; font-weight: 400; font-size: 36px; line-height: 1.3; color: #E6E4DF; opacity: 0.8; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
      <div id="ground"></div>
      <div id="flood"></div>
      <img id="logo-top" class="clip" src="assets/images/logo-berenjena.png" alt="Hestía" data-start="0" data-duration="${closeStart.toFixed(2)}" data-track-index="1" />
      <div id="waves" data-layout-ignore></div>
${beatHtml}
${attrHtml}
${closeHtml}
    </div>
    <script>
    const tl = gsap.timeline({ paused: true });
    // horizonte: una baldosa entera a velocidad constante durante todo el vídeo
    tl.fromTo("#waves", { x: 0 }, { x: -840, duration: ${total}, ease: "none" }, 0);
${reveals}
${attrAnim}
${wavesColorTo}
${closeAnim}
    tl.fromTo("#cbox > *", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.4, stagger: 0.18, ease: "power4.out" }, ${(closeStart + (c.photo ? 0.7 : 0.4)).toFixed(2)});
    window.__timelines["main"] = tl;
    tl.seek(0);
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log(`${path.relative(repo, dir)}: ${beats.length} frases, ${total} s`);
