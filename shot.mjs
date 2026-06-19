import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1223/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1200,height:900} });
await p.goto('http://localhost:8173/_navtest.html', { waitUntil:'load' });
await p.waitForTimeout(3500);
const has = await p.evaluate(()=>({ strip:!!document.querySelector('.lm-strip'), cards:document.querySelectorAll('.lm-card').length, errDiv:(document.getElementById('root')?.textContent||'').includes('Error loading') }));
console.log('state:', JSON.stringify(has));
if (has.cards>0){
  const first=await p.$('.lm-card'); const href=await first.getAttribute('href');
  await first.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await first.click(); await p.waitForTimeout(800);
  console.log('TAP →', href, '| now:', p.url().split('/').pop());
}
await b.close();
