import {
  AbsoluteFill, Video, Img, Sequence,
  useCurrentFrame, useVideoConfig,
  interpolate, spring, staticFile,
} from 'remotion';

// ── Brand tokens ─────────────────────────────────────────────────────
const BER_DK  = '#2A0F2E';
const BER     = '#3D1A35';
const CREMA   = '#FAF6F0';
const ARENA   = '#F0E8D5';
const SOL     = '#3AAABB';
const SOL_LT  = '#6FC4D1';
const VM      = '#6B7A3A';   // Mar — olive
const VT      = '#C87A45';   // Thalassa — terracotta
const VS      = '#D4A84A';   // Salinas — gold

// ── Fonts (local — served by Remotion's static server, no SSL issues) ────
const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

// ── Scene boundaries (frames @ 30fps) ────────────────────────────────
// 0     intro       120 f = 4s
// 100   mar start   420 f = 14s  (overlap 20f cross-fade)
// 500   thalassa    420 f = 14s
// 900   salinas     420 f = 14s
// 1300  outro       200 f = 6.7s (fade + hold)
// Total 1500 f = 50s

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function fade(frame, inStart, inEnd, outStart = -1, outEnd = -1) {
  const fadeIn  = interpolate(frame, [inStart, inEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (outStart < 0) return fadeIn;
  const fadeOut = interpolate(frame, [outStart, outEnd], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return Math.min(fadeIn, fadeOut);
}

// ── FontLoader — loads fonts from Remotion's local static server ──────
const FontLoader = () => (
  <style>{`@import url('${staticFile('fonts/fonts.css')}');`}</style>
);

// ── GradientBg — animated aubergine gradient background ──────────────
const GradientBg = ({ frame }) => {
  const shift = interpolate(frame, [0, 300], [0, 100], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse ${100 + shift}% 80% at 50% ${50 + shift * 0.1}%,
        rgba(78,36,70,0.95) 0%,
        ${BER_DK} 65%)`,
    }} />
  );
};

// ── LetterReveal — staggered letter animation ─────────────────────────
const LetterReveal = ({ text, frame, startFrame, style = {}, delay = 4 }) => {
  return (
    <span style={{ display: 'inline-flex', letterSpacing: 'inherit' }}>
      {text.split('').map((ch, i) => {
        const f = frame - startFrame - i * delay;
        const progress = interpolate(f, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity: progress,
            transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
            ...style,
          }}>{ch === ' ' ? ' ' : ch}</span>
        );
      })}
    </span>
  );
};

// ── SlideIn text helper ───────────────────────────────────────────────
const SlideIn = ({ frame, startFrame, duration = 25, direction = 'up', children, style = {} }) => {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const eased = easeOut(progress);
  const dy = direction === 'up'   ? interpolate(eased, [0, 1], [40, 0])  : 0;
  const dx = direction === 'left' ? interpolate(eased, [0, 1], [-60, 0]) : 0;
  return (
    <div style={{ opacity: eased, transform: `translate(${dx}px, ${dy}px)`, ...style }}>
      {children}
    </div>
  );
};

// ── Thin accent line ──────────────────────────────────────────────────
const AccentLine = ({ frame, startFrame, color, width = 60, style = {} }) => {
  const scaleX = interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      width, height: 1.5,
      background: color,
      transformOrigin: 'left center',
      transform: `scaleX(${scaleX})`,
      ...style,
    }} />
  );
};

// ── IntroScene ────────────────────────────────────────────────────────
const IntroScene = () => {
  const frame = useCurrentFrame();
  const bgOpacity = fade(frame, 0, 15);
  const logoOpacity = fade(frame, 5, 35, 95, 120);
  const tagOpacity = fade(frame, 35, 60, 95, 120);
  const locationOpacity = fade(frame, 55, 80, 95, 120);

  return (
    <AbsoluteFill style={{ background: BER_DK, opacity: bgOpacity }}>
      <GradientBg frame={frame} />

      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: 48, left: 48, width: 40, height: 40,
        borderTop: `1.5px solid rgba(250,246,240,0.2)`, borderLeft: `1.5px solid rgba(250,246,240,0.2)`,
        opacity: fade(frame, 10, 30) }} />
      <div style={{ position: 'absolute', bottom: 48, right: 48, width: 40, height: 40,
        borderBottom: `1.5px solid rgba(250,246,240,0.2)`, borderRight: `1.5px solid rgba(250,246,240,0.2)`,
        opacity: fade(frame, 10, 30) }} />

      {/* Center stack */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0 }}>

        {/* HESTÍA */}
        <div style={{ opacity: logoOpacity, fontFamily: SERIF, fontSize: 128, fontWeight: 400,
          color: CREMA, letterSpacing: '0.18em', lineHeight: 1, textAlign: 'center' }}>
          <LetterReveal text="HESTÍA" frame={frame} startFrame={5} />
        </div>

        {/* Divider */}
        <AccentLine frame={frame} startFrame={40} color={SOL} width={80} style={{ margin: '18px auto 14px' }} />

        {/* tagline */}
        <div style={{ opacity: tagOpacity, fontFamily: SANS, fontSize: 22, fontWeight: 300,
          color: SOL_LT, letterSpacing: '0.45em', textTransform: 'uppercase' }}>
          your home
        </div>
      </div>

      {/* Location bottom */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
        opacity: locationOpacity, fontFamily: SANS, fontSize: 13, fontWeight: 300,
        color: 'rgba(250,246,240,0.45)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Vera Playa · Almería · España
      </div>
    </AbsoluteFill>
  );
};

// ── ApartmentScene ─────────────────────────────────────────────────────
const ApartmentScene = ({ videoSrc, apt, tagline, detail, accent, num, videoStartFrom = 2 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in/out
  const fadeIn  = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns: very slow zoom in
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Text entrance timings
  const numT   = fade(frame, 15, 35);
  const nameT  = fade(frame, 25, 50);
  const tagT   = fade(frame, 40, 65);
  const detT   = fade(frame, 55, 80);
  const priceT = fade(frame, 70, 90);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Video fullscreen with Ken Burns */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Video
          src={staticFile(videoSrc)}
          startFrom={videoStartFrom * fps}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
          }}
          muted
        />
      </AbsoluteFill>

      {/* Dark gradient vignette */}
      <AbsoluteFill style={{
        background: `linear-gradient(
          to right,
          rgba(42,15,46,0.88) 0%,
          rgba(42,15,46,0.65) 30%,
          rgba(42,15,46,0.15) 65%,
          rgba(42,15,46,0.08) 100%
        )`,
      }} />

      {/* Bottom gradient */}
      <AbsoluteFill style={{
        background: `linear-gradient(to top, rgba(42,15,46,0.7) 0%, transparent 40%)`,
      }} />

      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 5, background: accent,
        opacity: numT,
      }} />

      {/* Text panel */}
      <div style={{ position: 'absolute', left: 88, top: '50%', transform: 'translateY(-50%)', maxWidth: 580 }}>
        {/* Num */}
        <div style={{ opacity: numT, fontFamily: SANS, fontSize: 13, fontWeight: 400,
          color: accent, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 16 }}>
          {num}
        </div>

        {/* Name */}
        <SlideIn frame={frame} startFrame={25} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: SERIF, fontSize: 80, fontWeight: 400, color: CREMA,
            lineHeight: 1.05, letterSpacing: '-0.01em' }}>
            {apt.split(' ').map((word, i) => (
              <span key={i} style={{ display: 'block' }}>{word}</span>
            ))}
          </div>
        </SlideIn>

        {/* Accent line */}
        <AccentLine frame={frame} startFrame={35} color={accent} width={50} style={{ marginBottom: 20 }} />

        {/* Tagline */}
        <SlideIn frame={frame} startFrame={40}>
          <div style={{ opacity: tagT, fontFamily: SANS, fontSize: 17, fontWeight: 300,
            color: 'rgba(250,246,240,0.75)', letterSpacing: '0.06em', marginBottom: 10 }}>
            {tagline}
          </div>
        </SlideIn>

        {/* Detail */}
        <SlideIn frame={frame} startFrame={55}>
          <div style={{ opacity: detT, fontFamily: SANS, fontSize: 15, fontWeight: 300,
            color: 'rgba(250,246,240,0.55)', letterSpacing: '0.04em' }}>
            → {detail}
          </div>
        </SlideIn>
      </div>

      {/* Corner logo watermark */}
      <div style={{ position: 'absolute', top: 44, right: 60, opacity: fade(frame, 20, 45) * 0.55,
        fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: CREMA, letterSpacing: '0.15em' }}>
        HESTÍA
      </div>

      {/* Asymmetric border decoration — bottom right */}
      <div style={{
        position: 'absolute', bottom: 48, right: 60,
        width: 80, height: 80,
        borderBottom: `1.5px solid ${accent}`,
        borderRight: `1.5px solid ${accent}`,
        opacity: fade(frame, 60, 90) * 0.6,
        borderRadius: '0 0 10px 0',
      }} />
    </AbsoluteFill>
  );
};

// ── GalleryScene — 3-up photo grid ────────────────────────────────────
const GalleryScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const photos = [
    { src: staticFile('assets/apt-vm-gallery-3.jpg'),  accent: VM,  label: 'Hestía Mar' },
    { src: staticFile('assets/apt-vt-gallery-03.jpg'), accent: VT,  label: 'Hestía Thalassa' },
    { src: staticFile('assets/apt-vs-gallery-3.jpg'),  accent: VS,  label: 'Hestía Salinas' },
  ];

  const bgOpacity = fade(frame, 0, 20, durationInFrames - 25, durationInFrames);

  return (
    <AbsoluteFill style={{ background: BER_DK, opacity: bgOpacity }}>
      {/* Soft bg glow */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 120% 80% at 50% 50%, rgba(78,36,70,0.8) 0%, ${BER_DK} 70%)` }} />

      {/* Heading */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center',
        opacity: fade(frame, 10, 35), fontFamily: SERIF, fontSize: 16, fontWeight: 400,
        color: 'rgba(250,246,240,0.5)', letterSpacing: '0.35em', textTransform: 'uppercase' }}>
        Tres hogares · Un estilo de vida
      </div>

      {/* Photo grid */}
      <div style={{ position: 'absolute', top: 110, bottom: 120, left: 60, right: 60,
        display: 'flex', gap: 20 }}>
        {photos.map((p, i) => {
          const delay = i * 20;
          const imgOpacity = fade(frame, 15 + delay, 45 + delay);
          const scale = interpolate(frame, [15 + delay, 45 + delay], [1.04, 1.0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const labelOpacity = fade(frame, 45 + delay, 65 + delay);
          return (
            <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden',
              borderRadius: '10px 0 10px 0', opacity: imgOpacity }}>
              <Img
                src={p.src}
                style={{ width: '100%', height: '100%', objectFit: 'cover',
                  transform: `scale(${scale})` }}
              />
              {/* Color accent overlay at bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                background: p.accent, opacity: labelOpacity }} />
              {/* Label */}
              <div style={{ position: 'absolute', bottom: 20, left: 20,
                opacity: labelOpacity, fontFamily: SANS, fontSize: 14, fontWeight: 400,
                color: CREMA, letterSpacing: '0.08em',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {p.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom tagline */}
      <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0, textAlign: 'center',
        opacity: fade(frame, 65, 90), fontFamily: SANS, fontSize: 13, fontWeight: 300,
        color: 'rgba(250,246,240,0.4)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
        Diseñado para el descanso · Equipado para la libertad
      </div>
    </AbsoluteFill>
  );
};

// ── OutroScene ─────────────────────────────────────────────────────────
const OutroScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgOpacity    = fade(frame, 0, 20);
  const labelOpacity = fade(frame, 15, 45, durationInFrames - 40, durationInFrames);
  const urlOpacity   = fade(frame, 35, 65, durationInFrames - 40, durationInFrames);
  const subOpacity   = fade(frame, 55, 80, durationInFrames - 40, durationInFrames);
  const dotsOpacity  = fade(frame, 80, 100, durationInFrames - 40, durationInFrames);

  // Shimmer on URL
  const shimX = interpolate(frame, [65, 130], [-200, 2200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BER_DK, opacity: bgOpacity }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 55%, rgba(78,36,70,0.7) 0%, ${BER_DK} 70%)` }} />

      {/* Corner decorations */}
      {[{ top: 48, left: 48 }, { bottom: 48, right: 48 }].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos, width: 50, height: 50,
          borderTop: i === 0 ? `1.5px solid rgba(250,246,240,0.15)` : undefined,
          borderLeft: i === 0 ? `1.5px solid rgba(250,246,240,0.15)` : undefined,
          borderBottom: i === 1 ? `1.5px solid rgba(250,246,240,0.15)` : undefined,
          borderRight: i === 1 ? `1.5px solid rgba(250,246,240,0.15)` : undefined,
          opacity: labelOpacity,
        }} />
      ))}

      {/* Center content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0 }}>

        {/* Eyebrow */}
        <div style={{ opacity: labelOpacity, fontFamily: SANS, fontSize: 12, fontWeight: 400,
          color: 'rgba(250,246,240,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 28 }}>
          Reserva directa · sin intermediarios
        </div>

        {/* URL with shimmer */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ opacity: urlOpacity, fontFamily: SERIF, fontSize: 64, fontWeight: 400,
            color: CREMA, letterSpacing: '0.04em', textAlign: 'center' }}>
            hestiayourhome.com
          </div>
          {/* Shimmer sweep */}
          <div style={{
            position: 'absolute', top: 0, left: shimX, width: 200, height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(111,196,209,0.25), transparent)',
            pointerEvents: 'none',
            opacity: urlOpacity,
          }} />
        </div>

        {/* Underline */}
        <AccentLine frame={frame} startFrame={65} color={SOL} width={320} style={{ margin: '20px auto 24px' }} />

        {/* Sub */}
        <div style={{ opacity: subOpacity, fontFamily: SANS, fontSize: 16, fontWeight: 300,
          color: SOL_LT, letterSpacing: '0.12em', textAlign: 'center' }}>
          Sin comisiones · Mejor precio garantizado
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 40, opacity: dotsOpacity }}>
          {[VM, VT, VS].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50% 0 50% 0', background: c }} />
          ))}
        </div>
      </div>

      {/* Logo watermark */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, textAlign: 'center',
        opacity: labelOpacity * 0.4, fontFamily: SERIF, fontSize: 14, fontWeight: 400,
        color: CREMA, letterSpacing: '0.35em' }}>
        HESTÍA
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ───────────────────────────────────────────────────
export const HestiaReel = () => {
  return (
    <AbsoluteFill style={{ background: BER_DK, fontFamily: SANS }}>
      <FontLoader />

      {/* 1. Intro — 0-120 (4s) */}
      <Sequence from={0} durationInFrames={130}>
        <IntroScene />
      </Sequence>

      {/* 2. Hestía Mar — 100-520 (14s) */}
      <Sequence from={100} durationInFrames={420}>
        <ApartmentScene
          videoSrc="videos/mar.webm"
          apt="Hestía Mar"
          tagline="Vera Playa · Almería"
          detail="Terraza privada con vistas al olivar"
          accent={VM}
          num="01"
          videoStartFrom={3}
        />
      </Sequence>

      {/* 3. Hestía Thalassa — 500-920 (14s) */}
      <Sequence from={500} durationInFrames={420}>
        <ApartmentScene
          videoSrc="videos/thalassa.webm"
          apt="Hestía Thalassa"
          tagline="Ático panorámico · Vera Playa"
          detail="Piscina privada · salida directa a la playa"
          accent={VT}
          num="02"
          videoStartFrom={4}
        />
      </Sequence>

      {/* 4. Hestía Salinas — 900-1320 (14s) */}
      <Sequence from={900} durationInFrames={420}>
        <ApartmentScene
          videoSrc="videos/salinas.webm"
          apt="Hestía Salinas"
          tagline="Puerto Rey · Vera, Almería"
          detail="Junto a las Salinas · flamencos rosados"
          accent={VS}
          num="03"
          videoStartFrom={3}
        />
      </Sequence>

      {/* 5. Gallery — 1290-1440 (5s) */}
      <Sequence from={1290} durationInFrames={150}>
        <GalleryScene />
      </Sequence>

      {/* 6. Outro — 1420-1500 (2.7s) */}
      <Sequence from={1420} durationInFrames={230}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
