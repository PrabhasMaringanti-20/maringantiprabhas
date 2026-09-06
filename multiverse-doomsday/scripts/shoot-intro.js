/** Films the new cold open frame by frame, on several phone aspect ratios. */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;

const DEVICES = [
  { name: '20x9', width: 412, height: 915 }, // tall modern Android
  { name: '19.5x9', width: 390, height: 844 }, // iPhone-ish
  { name: '16x9', width: 412, height: 732 }, // older/shorter
];

// Frames through the sequence, in ms from first paint.
const FRAMES = [250, 700, 1200, 1700, 2200, 2700, 3200, 3800, 4400];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  const errors = [];
  let shots = 0;

  for (const device of DEVICES) {
    const ctx = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${device.name}: ${String(e).slice(0, 200)}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`${device.name}: ${m.text().slice(0, 200)}`);
    });

    await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });

    // Capture times are measured from one fixed origin. Sleeping for the gap
    // between frames instead lets each screenshot's own duration push every
    // later frame further out of position, which mislabels the whole sequence.
    const t0 = Date.now();
    const frames = device.name === '20x9' ? FRAMES : [2200];
    for (const at of frames) {
      const wait = at - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      const actual = Date.now() - t0;
      await page.screenshot({
        path: `${OUT}/${device.name}-${String(at).padStart(4, '0')}ms.png`,
      });
      if (Math.abs(actual - at) > 120) {
        console.log(`  ! ${device.name} frame ${at}ms actually fired at ${actual}ms`);
      }
      shots += 1;
    }

    // After the sequence, the app itself must be there and interactive.
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${device.name}-after.png` });
    const tabs = await page.getByRole('tab').count();
    console.log(`${device.name}: tabs visible after intro = ${tabs}`);
    if (tabs === 0) errors.push(`${device.name}: app never appeared after the intro`);

    await ctx.close();
  }

  console.log(`\n${shots} frames captured`);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
