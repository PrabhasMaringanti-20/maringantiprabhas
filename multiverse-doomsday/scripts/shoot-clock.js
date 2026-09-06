/** Photographs the countdown and checks it counts to the right moment. */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  // Pin the browser to the user's timezone: the countdown's whole point is
  // that it lands on local midnight, not UTC midnight.
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    timezoneId: 'Asia/Kolkata',
    locale: 'en-GB',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 240)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 240));
  });

  let n = 0;
  const shot = async (name) => {
    n += 1;
    await page.screenshot({ path: `${OUT}/k${String(n).padStart(2, '0')}-${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 900) => page.waitForTimeout(ms);
  const check = (label, ok, detail = '') =>
    console.log(`CHECK ${label}: ${ok ? 'PASS' : 'FAIL'}${detail ? ' — ' + detail : ''}`);

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6500);
  await page.getByRole('tab', { name: /Roadmap/i }).first().click();
  await settle(1500);
  await shot('countdown');

  // All four units must be on screen, labelled, so it can only read as a
  // countdown rather than as a time of day.
  const body = await page.evaluate(() => document.body.innerText);
  for (const unit of ['DAYS', 'HRS', 'MIN', 'SEC']) {
    check(`the ${unit} segment is labelled`, body.toUpperCase().includes(unit));
  }

  const read = () =>
    page.evaluate(() => {
      const text = document.body.innerText.toUpperCase();
      const nums = text.match(/(\d+)\s*\n?\s*DAYS?\s*\n?\s*(\d{2})\s*\n?\s*HRS\s*\n?\s*(\d{2})\s*\n?\s*MIN\s*\n?\s*(\d{2})/);
      return nums ? { d: +nums[1], h: +nums[2], m: +nums[3], s: +nums[4] } : null;
    });

  const shown = await read();
  check('the whole counter renders', shown !== null, JSON.stringify(shown));

  if (shown) {
    const expected = await page.evaluate(() => {
      const target = new Date(2026, 11, 18, 0, 0, 0);
      const total = Math.floor((target - new Date()) / 1000);
      return {
        d: Math.floor(total / 86400),
        h: Math.floor((total % 86400) / 3600),
        m: Math.floor((total % 3600) / 60),
        s: total % 60,
      };
    });
    check(
      'it counts to LOCAL midnight on 18 December 2026',
      shown.d === expected.d && shown.h === expected.h && shown.m === expected.m,
      `shown ${shown.d}d ${shown.h}h ${shown.m}m, expected ${expected.d}d ${expected.h}h ${expected.m}m`,
    );
  }

  const dayText = await page.getByText(/18 December 2026/).first().textContent();
  check(
    'the date names the weekday and the hour it lands',
    /Friday 18 December 2026/.test(dayText || '') && /midnight/i.test(dayText || ''),
    (dayText || '').trim(),
  );

  // The seconds have to actually move.
  const before = await read();
  await settle(2200);
  const after = await read();
  check('the counter is running', before && after && before.s !== after.s,
    `${before && before.s} -> ${after && after.s}`);

  // The sound toggle is gone for good; nothing should offer it.
  const speaker = await page.getByRole('switch').count();
  check('no audio control remains on the countdown', speaker === 0, `${speaker} switches`);

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
