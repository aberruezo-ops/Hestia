import { chromium } from 'playwright';
const b = await chromium.launch();
for (const lng of ['es','en']) {
  const p = await b.newPage({ viewport:{width:900,height:900}, deviceScaleFactor:1.5 });
  await p.goto('http://localhost:8151/empresas-local.html', { waitUntil:'load' });
  await p.waitForSelector('.emp-contact-methods', { timeout:9000 });
  if (lng==='en') { const t=await p.$('.topbar-lang [data-lang="en"], a[href]:has-text("English")'); }
  const info = await p.evaluate((lng) => {
    const cm = document.querySelector('.emp-contact-methods');
    const btns=[...document.querySelectorAll('.emp-cm-btn')].map(a=>({txt:a.textContent.replace(/\s+/g,' ').trim(), href:a.getAttribute('href')}));
    return { label: document.querySelector('.emp-cm-label')?.textContent.trim(), btns };
  });
  console.log(lng, JSON.stringify(info));
  await p.evaluate(()=>document.querySelector('.emp-form-head').scrollIntoView());
  await p.waitForTimeout(300);
  if (lng==='es') await p.screenshot({ path:'/tmp/emp-cm.png' });
  await p.close();
  break;
}
await b.close();
