/** Drives the four new flows end to end and photographs each. */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

  let n = 0;
  const shot = async (name) => {
    n += 1;
    await page.screenshot({ path: `${OUT}/f${String(n).padStart(2, '0')}-${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 1000) => page.waitForTimeout(ms);
  const wheel = async (steps, delta = 500) => {
    await page.mouse.move(195, 520);
    for (let i = 0; i < steps; i += 1) { await page.mouse.wheel(0, delta); await page.waitForTimeout(140); }
    await page.waitForTimeout(450);
  };
  const tab = async (name) => { await page.getByRole('tab', { name }).first().click(); await settle(1200); };

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200);

  // --- 1. First-run prompt on the roadmap ---
  await tab(/Roadmap/i);
  await shot('roadmap-catchup-prompt');

  // --- 2. Catch me up ---
  const prompt = page.getByRole('button', { name: /Catch me up/i }).first();
  if (await prompt.count()) { await prompt.click(); await settle(1500); }
  await shot('catchup');
  // Select the first three phases
  for (const label of [/^Phase 1,/, /^Phase 2,/, /^Phase 3,/]) {
    const row = page.getByRole('checkbox', { name: label }).first();
    if (await row.count()) { await row.click(); await settle(350); }
  }
  await shot('catchup-selected');
  const apply = page.getByRole('button', { name: /^Log \d+ titles$/ }).first();
  if (await apply.count()) { await apply.click(); await settle(1600); }
  await shot('roadmap-after-catchup');

  // --- 3. Per-phase bulk toggle on a header ---
  const bulk = page.getByRole('button', { name: /Mark all of Phase 4 watched/i }).first();
  if (await bulk.count()) { await bulk.click(); await settle(900); await shot('phase-bulk-marked'); }

  // --- 4. Prep entry points ---
  await tab(/Prep/i);
  await shot('prep-actions');

  // --- 5. Tonight ---
  const tonight = page.getByRole('button', { name: /What should I watch tonight/i }).first();
  if (await tonight.count()) { await tonight.click(); await settle(1500); }
  await shot('tonight');
  const long = page.getByRole('button', { name: /All evening/i }).first();
  if (await long.count()) { await long.click(); await settle(1000); await shot('tonight-all-evening'); }
  await page.goBack().catch(() => {}); await settle(1300);

  // --- 6. Compare ---
  await tab(/Prep/i);
  const compare = page.getByRole('button', { name: /Compare with a friend/i }).first();
  if (await compare.count()) { await compare.click(); await settle(1500); }
  await shot('compare-empty');

  // Grab our own code, feed it back as "a friend" with different data by
  // editing progress first would be complex — instead paste our own code,
  // which must produce a zero-difference comparison.
  const code = await page.evaluate(() => {
    const els = [...document.querySelectorAll('div')].map((e) => e.textContent || '');
    const hit = els.find((t) => /^[A-Za-z0-9_-]{60,200}$/.test(t.trim()));
    return hit ? hit.trim() : null;
  });
  console.log('own code length:', code ? code.length : 'not found');
  if (code) {
    const box = page.getByLabel(/Friend's code/i).first();
    await box.fill(code);
    await settle(400);
    const go = page.getByRole('button', { name: /^Compare$/ }).first();
    if (await go.count()) { await go.click(); await settle(1200); }
    await shot('compare-self');
    await wheel(5); await shot('compare-result');
  }
  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200);

  // --- 7. Quiz challenge: open via a challenge deep link ---
  await page.goto('http://127.0.0.1:8099/quiz?seed=4242&from=Rahul&target=7', { waitUntil: 'domcontentloaded' });
  await settle(2500);
  await shot('quiz-challenge');

  // Play it through
  for (let q = 0; q < 12; q += 1) {
    const nb = page.getByRole('button', { name: /Next question|See results/ }).first();
    if (await nb.count()) { await nb.click(); await settle(550); continue; }
    const clicked = await page.evaluate(() => {
      const c = [...document.querySelectorAll('[role="button"]')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 250 && r.height > 40 && r.top > 140;
      });
      if (!c.length) return false;
      c[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    if (!clicked) break;
    await settle(600);
    const nb2 = page.getByRole('button', { name: /Next question|See results/ }).first();
    if (await nb2.count()) { await nb2.click(); await settle(550); }
  }
  await settle(900);
  await shot('quiz-challenge-result');

  // --- 8. Spoiler-safe ---
  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200);
  await tab(/Ideator/i);
  await wheel(12);
  await shot('spoiler-toggle');
  const sw = page.getByRole('switch', { name: /Spoiler-safe/i }).first();
  if (await sw.count()) { await sw.click(); await settle(700); await shot('spoiler-on'); }

  await tab(/Roadmap/i);
  await settle(900);
  const anyTitle = page.getByRole('button', { name: /^Open / }).first();
  if (await anyTitle.count()) {
    await anyTitle.click(); await settle(1800);
    await wheel(4);
    await shot('movie-spoiler-safe');
  }

  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.slice(0, 6).join('\n') : 'no console errors');
  await browser.close();
})();
