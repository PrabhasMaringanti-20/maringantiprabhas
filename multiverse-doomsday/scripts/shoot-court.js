/** Drives the casting court end to end: call, lock, share, read a rival ballot. */
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
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 240)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)); });

  let n = 0;
  const shot = async (name) => {
    n += 1;
    await page.screenshot({ path: `${OUT}/c${String(n).padStart(2, '0')}-${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 900) => page.waitForTimeout(ms);
  const wheel = async (steps, delta = 500) => {
    await page.mouse.move(195, 520);
    for (let i = 0; i < steps; i += 1) { await page.mouse.wheel(0, delta); await page.waitForTimeout(140); }
    await settle(400);
  };
  const check = (label, ok) => console.log(`CHECK ${label}: ${ok ? 'PASS' : 'FAIL'}`);

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200);

  await page.getByRole('tab', { name: /Prep/i }).first().click();
  await settle(1200);
  const entry = page.getByRole('button', { name: /Casting court/i }).first();
  check('court entry point on Prep', (await entry.count()) > 0);
  await entry.click();
  await settle(1500);
  await shot('court-empty');

  // Answer every question by taking the first option of each.
  const radios = page.getByRole('radio');
  const seen = new Set();
  const total = await radios.count();
  let answered = 0;
  for (let i = 0; i < total; i += 1) {
    const label = await radios.nth(i).getAttribute('aria-label');
    if (!label) continue;
    const question = label.split(' — ')[0];
    if (seen.has(question)) continue;
    seen.add(question);
    await radios.nth(i).click();
    answered += 1;
    await page.waitForTimeout(120);
  }
  console.log('answered', answered, 'of', seen.size, 'questions');
  await settle(600);
  await page.mouse.move(195, 300);
  for (let i = 0; i < 12; i += 1) { await page.mouse.wheel(0, -500); await page.waitForTimeout(90); }
  await settle(600);
  await shot('court-called');
  const called = await page.getByText(new RegExp(`${answered}/${answered}`)).count();
  check('every question shows as called', called > 0);

  // Lock it in.
  await wheel(16);
  const lockBtn = page.getByRole('button', { name: /Lock in \d+ predictions/i }).first();
  check('lock button offered once answers exist', (await lockBtn.count()) > 0);
  await lockBtn.click();
  await settle(1200);
  await shot('court-locked');
  const shareBtn = await page.getByRole('button', { name: /Send my ballot/i }).count();
  check('locking reveals the code and share', shareBtn > 0);
  const reopen = await page.getByText(/Reopen the ballot/i).count();
  check('reopening is offered but marked', reopen > 0);

  // Grab the code from the page and feed a mutated one back in as a "friend".
  const code = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('div,span'));
    const hit = nodes.map((n) => n.textContent || '').find((t) => /^[A-Za-z0-9_-]{14,60}$/.test(t.trim()));
    return hit ? hit.trim() : null;
  });
  check('a pasteable code is shown', Boolean(code));
  console.log('code:', code);

  const field = page.getByLabel(/Friend's ballot/i).first();
  await field.click();
  await field.fill(code || '');
  await settle(400);
  await page.getByRole('button', { name: /Read their ballot/i }).first().click();
  await settle(1400);
  await wheel(6);
  await shot('court-compared');
  const agree = await page.getByText(/You agree on everything/i).count();
  check('an identical ballot reports total agreement', agree > 0);

  // A junk code must be refused, not silently accepted.
  await page.mouse.move(195, 400);
  for (let i = 0; i < 8; i += 1) { await page.mouse.wheel(0, -500); await page.waitForTimeout(90); }
  await settle(400);
  const field2 = page.getByLabel(/Friend's ballot/i).first();
  await field2.click();
  await field2.fill('!!!not-a-code!!!');
  await page.getByRole('button', { name: /Read their ballot/i }).first().click();
  await settle(900);
  const refused = await page.getByText(/could not be read/i).count();
  check('a bad ballot is refused with a message', refused > 0);
  await shot('court-bad-code');

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
