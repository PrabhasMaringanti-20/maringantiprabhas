/**
 * Walks the app the way a person would and photographs each step.
 * Produces the UI workflow reel.
 */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;
const THEME = process.env.THEME || 'dark';

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
    const file = `${OUT}/${THEME}-${String(n).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: file });
    console.log('shot', file.split('/').pop());
  };
  const settle = (ms = 1000) => page.waitForTimeout(ms);
  const wheel = async (steps, delta = 500) => {
    await page.mouse.move(195, 520);
    for (let i = 0; i < steps; i += 1) { await page.mouse.wheel(0, delta); await page.waitForTimeout(140); }
    await page.waitForTimeout(450);
  };
  const tab = async (name) => {
    await page.getByRole('tab', { name }).first().click();
    await settle(1300);
  };

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });

  // --- Cold open, beat by beat ---
  await settle(700);  await shot('open-bars');
  await settle(900);  await shot('open-figure');
  await settle(700);  await shot('open-mark');
  await settle(750);  await shot('open-sweep');
  await settle(900);  await shot('open-credit');
  await settle(2600); // let it dissolve

  const setTheme = async (want) => {
    for (let i = 0; i < 4; i += 1) {
      const isDark = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim().startsWith('11'));
      if ((want === 'dark') === isDark) return true;
      const toggle = page.getByRole('button', { name: /theme|light|doom|system/i }).first();
      if (!(await toggle.count())) return false;
      await toggle.click();
      await settle(600);
    }
    return false;
  };
  await tab(/Ideator/i);
  await setTheme(THEME);

  // --- Roadmap ---
  await tab(/Roadmap/i);
  await shot('roadmap');
  await wheel(4); await shot('roadmap-scrolled');
  await wheel(10); await shot('roadmap-deep');
  await wheel(-20);

  // --- Movie detail ---
  const first = page.getByRole('button', { name: /^Open / }).first();
  if (await first.count()) {
    await first.click(); await settle(1600);
    await shot('movie');
    await wheel(4); await shot('movie-lower');
    // Reveal the stinger
    const reveal = page.getByRole('button', { name: /reveal/i }).first();
    if (await reveal.count()) { await reveal.click(); await settle(800); await shot('movie-stinger'); }
    await page.goBack().catch(() => {});
    await settle(1300);
  }

  // --- Vault ---
  await tab(/Vault/i);
  await shot('vault');
  await wheel(6); await shot('vault-scrolled');
  await wheel(-12);
  const doom = page.getByRole('button', { name: /Doctor Doom/i }).first();
  if (await doom.count()) {
    await doom.click(); await settle(1500);
    await shot('character-sheet');
    await page.keyboard.press('Escape'); await settle(800);
  }

  // --- Tiers ---
  await tab(/Tier/i);
  await shot('tiers');

  // --- Prep ---
  await tab(/Prep/i);
  await shot('prep');
  await wheel(6); await shot('prep-phases');
  await wheel(8); await shot('prep-milestones');
  await wheel(-20);

  // --- Post-credits ---
  const pc = page.getByRole('button', { name: /Post-credits tracker/ }).first();
  if (await pc.count()) {
    await pc.click(); await settle(1600);
    await shot('postcredits');
    await wheel(4); await shot('postcredits-scrolled');
    await page.goBack().catch(() => {}); await settle(1300);
  }

  // --- Quiz ---
  await tab(/Prep/i);
  const quiz = page.getByRole('button', { name: /Doomsday quiz/ }).first();
  if (await quiz.count()) {
    await quiz.click(); await settle(1600);
    await shot('quiz');
    for (let q = 0; q < 12; q += 1) {
      const nb = page.getByRole('button', { name: /Next question|See results/ }).first();
      if (await nb.count()) { await nb.click(); await settle(600); continue; }
      const clicked = await page.evaluate(() => {
        const cands = [...document.querySelectorAll('[role="button"]')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 250 && r.height > 40 && r.top > 140;
        });
        if (!cands.length) return false;
        cands[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
      });
      if (!clicked) break;
      await settle(700);
      if (q === 0) await shot('quiz-answered');
      const nb2 = page.getByRole('button', { name: /Next question|See results/ }).first();
      if (await nb2.count()) { await nb2.click(); await settle(600); }
    }
    await settle(1000);
    await shot('quiz-results');
    // The quiz is a modal route; navigating directly is more reliable than
    // hunting for its dismiss control.
    await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
    await settle(2000);
  }

  // --- Ideator ---
  await tab(/Ideator/i);
  await shot('ideator');

  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.slice(0, 6).join('\n') : 'no console errors');
  await browser.close();
})();
