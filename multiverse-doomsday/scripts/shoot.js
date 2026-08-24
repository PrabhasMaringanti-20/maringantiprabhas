/**
 * Visual pass over the screens that have regressed on device, in both themes.
 * Companion to verify-web.js: that one asserts, this one photographs.
 *
 *   npx expo export --platform web --output-dir dist
 *   npx serve dist -l 8099 --single
 *   SHOT_DIR=... node scripts/shoot.js
 */
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

  const shot = async (name) => {
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 1200) => page.waitForTimeout(ms);

  // react-native-web nests several scrollable divs; a wheel event at the centre
  // of the viewport drives whichever one actually owns the gesture.
  const wheel = async (steps, delta = 600) => {
    await page.mouse.move(195, 500);
    for (let i = 0; i < steps; i += 1) {
      await page.mouse.wheel(0, delta);
      await page.waitForTimeout(160);
    }
    await page.waitForTimeout(600);
  };

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200); // let the cold open finish

  // Theme control lives on the Ideator tab; cycle order is system -> light -> dark.
  const setTheme = async (want) => {
    for (let i = 0; i < 4; i += 1) {
      const isDark = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim().startsWith('11'));
      if ((want === 'dark') === isDark) return true;
      const toggle = page.getByRole('button', { name: /theme/i }).first();
      if (!(await toggle.count())) return false;
      await toggle.click();
      await settle(700);
    }
    return false;
  };

  const gotoTab = async (name) => {
    await page.getByRole('tab', { name }).first().click();
    await settle(1500);
  };

  for (const theme of ['dark', 'light']) {
    await gotoTab(/Ideator/);
    const ok = await setTheme(theme);
    console.log(`theme ${theme}:`, ok ? 'set' : 'COULD NOT SET');
    await shot(`${theme}-1-ideator`);
    await wheel(14);
    await shot(`${theme}-2-ideator-bottom`);

    await gotoTab(/Roadmap/);
    await shot(`${theme}-3-roadmap`);

    // Movie detail
    const card = page.getByRole('button', { name: /^Open / }).first();
    if (await card.count()) {
      await card.click();
      await settle(2000);
      await shot(`${theme}-4-movie`);
      await wheel(5);
      await shot(`${theme}-5-movie-lower`);
      await page.goBack().catch(() => {});
      await settle(1200);
    }

    await gotoTab(/Vault/);
    await shot(`${theme}-6-vault`);
    const doom = page.getByRole('button', { name: /Doctor Doom/ }).first();
    if (await doom.count()) {
      await doom.click();
      await settle(1600);
      await shot(`${theme}-7-character-sheet`);
      await wheel(14);
      await shot(`${theme}-8-character-sheet-bottom`);
      await page.keyboard.press('Escape');
      await settle(900);
    }

    await gotoTab(/Tier/);
    await shot(`${theme}-9-tier`);
  }

  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.slice(0, 5).join('\n') : 'no console errors');
  await browser.close();
})();
