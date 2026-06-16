import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1223/chrome-linux/chrome' });
for (const w of [1180, 1366]) {
  const p = await b.newPage({ viewport:{width:w,height:420}, deviceScaleFactor:1.4 });
  await p.goto('http://localhost:8169/_navtest.html', { waitUntil:'load' });
  await p.waitForSelector('.desktop-nav a', { timeout:9000 });
  const items = await p.evaluate(()=>[...document.querySelectorAll('.desktop-nav a')].map(a=>({t:a.textContent.trim(), h:Math.round(a.getBoundingClientRect().height)})));
  console.log('w'+w, JSON.stringify(items));
  await p.screenshot({ path:`/tmp/nav-${w}.png`, clip:{x:0,y:55,width:w,height:95} });
  await p.close();
}
await b.close();
