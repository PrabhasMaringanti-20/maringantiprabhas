/**
 * Checks the cold open actually behaves, rather than just looking right in a
 * single frame: that the orb is really turning, that the composition does not
 * jump, and that the app is reached.
 */
const { chromium } = require('playwright');

const W = 412;
const H = 915;

let fails = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

/** Mean absolute difference between two same-sized PNG buffers, 0-255. */
function meanDiff(a, b) {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / n;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 200));
  });

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  const at = async (ms) => {
    const wait = ms - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
  };

  // The orb sits at a known place in the composition; clip to it so the
  // comparison is about the orb and nothing else.
  const stageW = Math.min(W, H * 0.560457);
  const stageH = stageW / 0.560457;
  const stageLeft = (W - stageW) / 2;
  const stageTop = H - stageH;
  const orbSize = 0.214815 * stageW;
  const orb = {
    x: Math.round(stageLeft + 0.22037 * stageW - orbSize / 2),
    y: Math.round(stageTop + 0.495589 * stageH - orbSize / 2),
    width: Math.round(orbSize),
    height: Math.round(orbSize),
  };

  // Two frames a beat apart, both well after the orb has faded in, so any
  // difference is movement rather than the fade.
  await at(2000);
  const orbA = await page.screenshot({ clip: orb });
  await at(2900);
  const orbB = await page.screenshot({ clip: orb });
  const orbMoved = meanDiff(orbA, orbB);
  check('the orb is actually turning between frames', orbMoved > 1.0, `mean delta ${orbMoved.toFixed(2)}`);

  // The figure must be settled and still by now: sample a patch of armour
  // well away from the orb's glow.
  const still = {
    x: Math.round(stageLeft + stageW * 0.62),
    y: Math.round(stageTop + stageH * 0.78),
    width: 70,
    height: 70,
  };
  await at(3300);
  const figA = await page.screenshot({ clip: still });
  await at(3900);
  const figB = await page.screenshot({ clip: still });
  const figMoved = meanDiff(figA, figB);
  check('the figure has settled and holds still', figMoved < 1.2, `mean delta ${figMoved.toFixed(2)}`);

  // The app must arrive, and the intro must be gone rather than lingering.
  await at(6500);
  const tabs = await page.getByRole('tab').count();
  check('the app is reached after the sequence', tabs === 5, `${tabs} tabs`);

  const introGone = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img, div'));
    return !imgs.some((el) => {
      const s = el.currentSrc || getComputedStyle(el).backgroundImage || '';
      return s.includes('doom-figure') || s.includes('doom-orb');
    });
  });
  check('the intro layer is unmounted, not just hidden', introGone);

  // Nothing of the old cold open should survive anywhere in the bundle.
  const oldArt = await page.evaluate(() =>
    document.documentElement.innerHTML.match(/avengers-mark|doom-wordmark|doom-character/g) || []);
  check('no trace of the old opening artwork', oldArt.length === 0, oldArt.join(', '));

  check('no console errors', errors.length === 0, errors.join(' | '));

  console.log(fails === 0 ? '\nINTRO OK' : `\nINTRO FAILED — ${fails} check(s)`);
  await browser.close();
  process.exit(fails === 0 ? 0 : 1);
})();
