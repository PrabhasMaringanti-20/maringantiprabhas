const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;
// Beats from DoomIntro: bars 0, figure 260, mark 900, word 1450,
// sweep 2150, credit 2600, dissolve 4300. Sample inside each, not across.
const MARKS = [
  [620,  '01-open-bars'],
  [1350, '02-open-figure'],
  [2050, '03-open-mark'],
  [2600, '04-open-sweep'],
  [3700, '05-open-credit'],
];
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  for (const [at, name] of MARKS) {
    const wait = at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: `${OUT}/dark-${name}.png` });
    console.log(name, 'at', Date.now() - t0, 'ms');
  }
  await browser.close();
})();
