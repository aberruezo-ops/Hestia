import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w,h,tag] of [[390,844,'mob'],[1280,800,'desk']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8144/empresas-local.html', { waitUntil: 'load' });
  await p.waitForSelector('.emp-trust-track', { timeout: 8000 });
  await p.evaluate(() => document.querySelector('.emp-trust').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(500);
  const n = await p.evaluate(() => document.querySelectorAll('.emp-trust-item').length);
  console.log(tag, 'items:', n);
  await p.screenshot({ path: `/tmp/emp-${tag}.png` });
  await p.close();
}
await b.close();
