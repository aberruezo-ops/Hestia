import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1180, height: 1000 }, deviceScaleFactor: 1.4 });
const errs=[]; p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,120)); });
await p.goto('http://localhost:8150/empresas-local.html', { waitUntil: 'load' });
await p.waitForSelector('.home-search', { timeout: 9000 });
// pick a far-future month: click next-month arrow a few times if present, then pick cells
const next = await p.$('.home-search .cal-nav-next, .home-search [aria-label*="iguiente"], .home-search .cal-next');
for (let i=0;i<3 && next;i++){ await next.click(); await p.waitForTimeout(120); }
const cells = await p.$$('.home-search .cal-cell:not(.past):not(.blk):not(.empty)');
console.log('cells:', cells.length);
if (cells.length>20){ await cells[cells.length-12].click(); await p.waitForTimeout(150); await cells[cells.length-6].click(); await p.waitForTimeout(200); }
const submit = await p.$('.home-search .hs-submit'); if(submit){ await submit.click(); await p.waitForTimeout(900); }
const res = await p.evaluate(() => {
  const cards=[...document.querySelectorAll('.home-search .hs-results .hs-result-card, .home-search .hs-results [class*=hs-result]')].length;
  const avail=[...document.querySelectorAll('.home-search .hs-results')].length;
  const b2b=document.querySelector('.hs-b2b-nudge');
  const hd=document.querySelector('.home-search .hs-results-hd');
  return { resultsHd: hd?hd.textContent.trim().slice(0,60):null, hasB2b: !!b2b, b2b: b2b?b2b.textContent.replace(/\s+/g,' ').trim().slice(0,80):null };
});
console.log('res:', JSON.stringify(res));
const r=await p.$('.home-search .hs-results'); if(r){ await r.scrollIntoViewIfNeeded(); }
await p.waitForTimeout(300); await p.screenshot({ path:'/tmp/emp-res2.png' });
console.log('errors:', JSON.stringify(errs));
await b.close();
