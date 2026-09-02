/**
 * End-to-end smoke test against the exported web build.
 *
 *   npx expo export --platform web --output-dir dist
 *   npx serve dist -l 8099        (or any static server on :8099)
 *   node scripts/verify-web.js
 *
 * Asserts the things that have actually broken on device: the cold open
 * painting its artwork, and the character grid keeping uniform, non-collapsed
 * card heights through scrolling and recycling.
 */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures += 1;
};

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
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });

  const scrollBy = async (d) => {
    await page.evaluate((delta) => {
      const t = [...document.querySelectorAll('div')]
        .filter((el) => el.scrollHeight > el.clientHeight + 40)
        .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
      if (t) t.scrollTop += delta;
    }, d);
    await page.waitForTimeout(500);
  };

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });

  // --- Cold open ---
  await page.waitForTimeout(1800);
  const introImgs = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((i) => i.getBoundingClientRect().width > 40)
      .map((i) => ({ w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) })));
  check('intro renders 3 artwork images', introImgs.length >= 3, JSON.stringify(introImgs.slice(0, 4)));
  const creditVisible = await page.getByText('PRABHAS.MAN').first().isVisible().catch(() => false);
  check('intro shows CREATED BY PRABHAS.MAN', creditVisible);
  await page.screenshot({ path: `${OUT}/V1-intro.png` });

  await page.waitForTimeout(4200);
  const introNodes = await page.evaluate(() =>
    [...document.querySelectorAll('*')].filter((el) => el.textContent === 'CREATED BY').length);
  check('intro dismisses itself', introNodes === 0, `${introNodes} nodes left`);

  // --- Character tab ---
  await page.getByRole('tab', { name: /Vault/ }).first().click();
  await page.waitForTimeout(1600);

  const measure = () => page.evaluate(() => {
    const cards = [...document.querySelectorAll('button[aria-label*="played by"]')];
    const heights = cards.map((c) => Math.round(c.getBoundingClientRect().height));
    return { count: cards.length, min: Math.min(...heights), max: Math.max(...heights) };
  });

  let m = await measure();
  check('all 47 character cards present', m.count === 47, `count=${m.count}`);
  check('no collapsed cards at top', m.min > 200, `min height=${m.min}px max=${m.max}px`);
  check('card heights uniform', m.max - m.min < 2, `spread=${m.max - m.min}px`);

  for (let i = 0; i < 8; i += 1) await scrollBy(900);
  m = await measure();
  check('no collapsed cards after scrolling down', m.min > 200, `min=${m.min}px`);
  await page.screenshot({ path: `${OUT}/V2-vault-deep.png` });

  for (let i = 0; i < 10; i += 1) await scrollBy(-900);
  m = await measure();
  check('no collapsed cards after scrolling back', m.min > 200, `min=${m.min}px`);
  await page.screenshot({ path: `${OUT}/V3-vault-return.png` });

  // Every card must show artwork, not an empty box.
  // Comic art where we have it; an initials plate otherwise (an actor headshot
  // takes that slot once a TMDB key is present).
  const art = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('button[aria-label*="played by"]')];
    let filled = 0;
    cards.forEach((c) => {
      const img = c.querySelector('img');
      const hasImg = img && img.getBoundingClientRect().height > 50;
      const hasPlate = /^[A-Z]{2}$/.test(c.innerText.split('\n')[0] || '');
      if (hasImg || hasPlate) filled += 1;
    });
    return { total: cards.length, filled };
  });
  check('every card draws something', art.filled === art.total, `${art.filled}/${art.total}`);

  // --- Filters + search still work ---
  await page.getByRole('button', { name: /^Thunderbolts/ }).first().click();
  await page.waitForTimeout(900);
  const filtered = await page.evaluate(() => document.querySelectorAll('button[aria-label*="played by"]').length);
  check('Thunderbolts filter narrows the grid', filtered === 7, `showing ${filtered}`);
  await page.getByRole('button', { name: /^All/ }).first().click();
  await page.waitForTimeout(700);

  const input = page.locator('input').first();
  await input.fill('Pedro');
  await page.waitForTimeout(900);
  const searched = await page.evaluate(() => document.querySelectorAll('button[aria-label*="played by"]').length);
  check('search by actor works', searched === 1, `showing ${searched}`);
  await input.fill('');
  await page.waitForTimeout(600);

  // --- Character sheet opens ---
  await page.getByRole('button', { name: /Doctor Doom/ }).first().click();
  await page.waitForTimeout(1400);
  const sheetOpen = await page.getByText('COMIC ORIGINS VS MCU ROLE').first().isVisible().catch(() => false);
  check('character sheet opens', sheetOpen);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // --- Roadmap ---
  await page.getByRole('tab', { name: /Roadmap/ }).first().click();
  await page.waitForTimeout(1400);
  const entries = await page.evaluate(() => document.querySelectorAll('button[aria-label^="Open "]').length);
  check('roadmap lists titles', entries > 5, `${entries} rendered`);

  check('no console errors anywhere', errors.length === 0, errors.slice(0, 3).join(' | '));

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
})();
