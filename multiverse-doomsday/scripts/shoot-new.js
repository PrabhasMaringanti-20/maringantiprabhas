/** Drives the new Prep / quiz / post-credits flows and photographs them. */
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

  const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n); };
  const settle = (ms = 1100) => page.waitForTimeout(ms);
  const wheel = async (steps, delta = 600) => {
    await page.mouse.move(195, 500);
    for (let i = 0; i < steps; i += 1) { await page.mouse.wheel(0, delta); await page.waitForTimeout(150); }
    await page.waitForTimeout(500);
  };

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6500);
  await shot('n0-intro-gone');

  // --- Prep tab ---
  await page.getByRole('tab', { name: /Prep/ }).first().click();
  await settle(1500);
  await shot('n1-prep-top');
  await wheel(6); await shot('n2-prep-mid');
  await wheel(8); await shot('n3-prep-milestones');
  await wheel(-20);

  // --- Post-credits ---
  await page.getByRole('button', { name: /Post-credits tracker/ }).first().click();
  await settle(1800);
  await shot('n4-postcredits');
  await wheel(5); await shot('n5-postcredits-scroll');
  const feeds = page.getByRole('button', { name: /^Feeds Doomsday$/ }).first();
  if (await feeds.count()) { await feeds.click(); await settle(1000); await shot('n6-postcredits-filtered'); }
  await page.keyboard.press('Escape').catch(() => {});
  await page.goBack().catch(() => {});
  await settle(1500);

  // --- Quiz: play a full round ---
  await page.getByRole('tab', { name: /Prep/ }).first().click();
  await settle(1200);
  await page.getByRole('button', { name: /Doomsday quiz/ }).first().click();
  await settle(1800);
  await shot('n7-quiz-question');

  for (let q = 0; q < 12; q += 1) {
    // Answer options sit above the Next button; pick the first option row.
    const opts = page.locator('div[role="button"], button').filter({ hasText: /.+/ });
    const nextBtn = page.getByRole('button', { name: /Next question|See results/ }).first();
    if (await nextBtn.count()) { await nextBtn.click(); await settle(700); continue; }

    // Not answered yet — click an option by its accessibility label.
    const clicked = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('[role="button"]')];
      // The four option rows are the widest buttons in the scroll area.
      const cands = nodes.filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 250 && r.height > 40 && r.top > 120;
      });
      if (!cands.length) return false;
      cands[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    if (!clicked) break;
    await settle(800);
    if (q === 0) await shot('n8-quiz-answered');
    const nb = page.getByRole('button', { name: /Next question|See results/ }).first();
    if (await nb.count()) { await nb.click(); await settle(700); }
  }
  await settle(1200);
  await shot('n9-quiz-results');

  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.slice(0, 6).join('\n') : 'no console errors');
  await browser.close();
})();
