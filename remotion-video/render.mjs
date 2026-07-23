import path from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Playwright's bundled Chromium
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const OUT_DIR  = path.join(__dirname, 'out');
const OUT_FILE = path.join(OUT_DIR, 'hestia-reel.mp4');

import { mkdirSync } from 'fs';
mkdirSync(OUT_DIR, { recursive: true });

console.log('Bundling composition...');
const bundled = await bundle({
  entryPoint: path.join(__dirname, 'src/index.jsx'),
  webpackOverride: (cfg) => cfg,
  publicDir: path.join(__dirname, 'public'),
});

console.log('Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundled,
  id: 'HestiaReel',
  browserExecutable: BROWSER,
  chromiumOptions: { disableWebSecurity: true },
});

console.log(`Rendering ${composition.durationInFrames} frames @ ${composition.fps}fps (${composition.durationInFrames / composition.fps}s)...`);
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: OUT_FILE,
  browserExecutable: BROWSER,
  chromiumOptions: { disableWebSecurity: true },
  imageFormat: 'jpeg',
  jpegQuality: 90,
  crf: 18,
  concurrency: 4,
  onProgress: ({ progress, renderedFrames, encodedFrames }) => {
    if (renderedFrames % 60 === 0 || progress >= 0.99) {
      process.stdout.write(`\r  Rendered ${renderedFrames}/${composition.durationInFrames}  [${Math.round(progress * 100)}%]`);
    }
  },
});

console.log(`\nDone → ${OUT_FILE}`);
