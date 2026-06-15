import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:8142/empresas-local.html', { waitUntil: 'load' });
await p.waitForSelector('.emp-trust-item', { timeout: 8000 });
await p.evaluate(() => document.querySelector('.emp-trust').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(400);
await p.screenshot({ path: '/tmp/emp-proof.png' });
await b.close();
