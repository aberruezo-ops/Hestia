import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1223/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:900,height:760}, deviceScaleFactor:1.6 });
await p.goto('http://localhost:8164/empresas-local.html', { waitUntil:'load' });
await p.waitForSelector('.emp-hero-dl', { timeout:9000 });
const dl = await p.evaluate(()=>{ const a=document.querySelector('.emp-hero-dl'); return { txt:a.textContent.trim(), href:a.getAttribute('href') }; });
console.log(JSON.stringify(dl));
await p.screenshot({ path:'/tmp/emp-dl.png', clip:{x:0,y:120,width:900,height:560} });
await b.close();
