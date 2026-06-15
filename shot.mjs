import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1100,height:500}, deviceScaleFactor:1.6 });
await p.goto('http://localhost:8154/empresas-local.html', { waitUntil:'load' });
await p.waitForSelector('.desktop-nav a', { timeout:9000 });
const r = await p.evaluate(()=>{ const a=[...document.querySelectorAll('.desktop-nav a')].find(x=>/empresas/i.test(x.textContent)); return { txt:a?.textContent, talign:a?getComputedStyle(a).textAlign:null }; });
console.log(JSON.stringify(r));
await p.screenshot({ path:'/tmp/emp-nav.png', clip:{x:0,y:60,width:1100,height:90} });
await b.close();
