/** Collides two universes and photographs the outcome. */
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
    await page.screenshot({ path: `${OUT}/i${String(n).padStart(2, '0')}-${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 900) => page.waitForTimeout(ms);
  const wheel = async (steps, delta = 500) => {
    await page.mouse.move(195, 520);
    for (let i = 0; i < steps; i += 1) { await page.mouse.wheel(0, delta); await page.waitForTimeout(130); }
    await settle(400);
  };
  const check = (label, ok) => console.log(`CHECK ${label}: ${ok ? 'PASS' : 'FAIL'}`);

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200);

  // Give this universe some titles so the collision is not empty on both sides.
  await page.getByRole('tab', { name: /Roadmap/i }).first().click();
  await settle(1200);
  const prompt = page.getByRole('button', { name: /Catch me up/i }).first();
  if (await prompt.count()) { await prompt.click(); await settle(1500); }
  for (const label of [/^Phase 1,/, /^Phase 2,/, /^Phase 3,/]) {
    const row = page.getByRole('checkbox', { name: label }).first();
    if (await row.count()) { await row.click(); await settle(280); }
  }
  const apply = page.getByRole('button', { name: /^Log \d+ titles$/ }).first();
  if (await apply.count()) { await apply.click(); await settle(1700); }

  await page.getByRole('tab', { name: /Prep/i }).first().click();
  await settle(1200);
  const entry = page.getByRole('button', { name: /The Incursion/i }).first();
  check('Incursion entry point on Prep', (await entry.count()) > 0);
  await entry.click();
  await settle(1500);
  await shot('incursion-open');
  check('framed as two universes', (await page.getByText(/one survivor/i).count()) > 0);

  // My own code, collided with itself: a dead-level tie.
  const code = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('div,span'));
    const hit = nodes.map((el) => el.textContent || '').find((t) => /^[A-Za-z0-9_-]{80,140}$/.test(t.trim()));
    return hit ? hit.trim() : null;
  });
  check('a universe code is shown', Boolean(code));

  const field = page.getByLabel(/Their universe/i).first();
  await field.click();
  await field.fill(code || '');
  await settle(300);
  await page.getByRole('button', { name: /^Collide$/i }).first().click();
  await settle(1500);
  await wheel(5);
  await shot('incursion-tie');
  check('an identical universe annihilates both',
    (await page.getByText(/Mutual annihilation/i).count()) > 0);

  // A weaker universe. The tail of a code is already zeroes (unwatched
  // titles), so zeroing it changes nothing — the watched bits sit right after
  // the header, so that is the stretch to blank out.
  const weaker = code ? code.slice(0, 20) + 'A'.repeat(16) + code.slice(36) : '';
  await page.mouse.move(195, 400);
  for (let i = 0; i < 10; i += 1) { await page.mouse.wheel(0, -500); await page.waitForTimeout(90); }
  await settle(400);
  const field2 = page.getByLabel(/Their universe/i).first();
  await field2.click();
  await field2.fill(weaker);
  await page.getByRole('button', { name: /^Collide$/i }).first().click();
  await settle(1500);
  await wheel(5);
  await shot('incursion-win');
  const survived = await page.getByText(/survives by|Their universe is gone|You hold, barely|You survive/i).count();
  check('a weaker universe loses and is told so', survived > 0);
  check('the result can be sent', (await page.getByRole('button', { name: /Send the result/i }).count()) > 0);
  await wheel(4);
  await shot('incursion-casualties');
  check('casualty lists are framed as universes',
    (await page.getByText(/Only in their universe|Only in yours/i).count()) > 0);

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
