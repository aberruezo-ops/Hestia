import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:8138/empresas.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/emp-mobile.png' });
// Diagnose trust strip geometry vs hero
const info = await p.evaluate(() => {
  const hero = document.querySelector('.emp-hero');
  const trust = document.querySelector('.emp-trust');
  const items = [...document.querySelectorAll('.emp-trust-item')].map(el => {
    const r = el.getBoundingClientRect();
    return { text: el.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), visible: r.height>0 && getComputedStyle(el).display!=='none' };
  });
  const hr = hero?.getBoundingClientRect();
  const tr = trust?.getBoundingClientRect();
  return { heroBottom: hr&&Math.round(hr.bottom), trustTop: tr&&Math.round(tr.top), trustBottom: tr&&Math.round(tr.bottom), trustH: tr&&Math.round(tr.height), items };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
