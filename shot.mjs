import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:900,height:1000}, deviceScaleFactor:1.4 });
await p.goto('http://localhost:8152/empresas-local.html', { waitUntil:'load' });
await p.waitForSelector('.emp-channel-btn', { timeout:9000 });
const btns = await p.$$('.emp-channel-btn');
console.log('channel buttons:', btns.length);
for (const [i,name] of [[0,'email'],[1,'whatsapp'],[2,'call']]) {
  await btns[i].click(); await p.waitForTimeout(200);
  const f = await p.evaluate(() => {
    const email = document.querySelector('#emp-email');
    const phone = document.querySelector('#emp-phone');
    const ct = document.querySelector('#emp-calltime');
    const phLbl = phone ? document.querySelector('label[for="emp-phone"]').textContent : null;
    return { email: !!email, phone: !!phone, phoneLabel: phLbl, callTime: !!ct };
  });
  console.log(name, JSON.stringify(f));
}
// screenshot in 'call' state
await p.evaluate(()=>document.querySelector('.emp-form-head').scrollIntoView());
await p.waitForTimeout(300);
await p.screenshot({ path:'/tmp/emp-channel.png', clip:{x:0,y:0,width:900,height:560} });
await b.close();
