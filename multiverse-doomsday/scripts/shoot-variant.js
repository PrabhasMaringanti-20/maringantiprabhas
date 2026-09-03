/** Photographs Doom's verdict on Prep and the variant reveal. */
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
    await page.screenshot({ path: `${OUT}/v${String(n).padStart(2, '0')}-${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 1000) => page.waitForTimeout(ms);
  const tab = async (name) => { await page.getByRole('tab', { name }).first().click(); await settle(1200); };

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6200);

  // Empty state first — Doom at his least impressed.
  await tab(/Prep/i);
  await shot('prep-empty');
  const emptyVerdict = await page.getByText(/Doom does not know your name/i).count();
  console.log('CHECK empty verdict line present:', emptyVerdict > 0 ? 'PASS' : 'FAIL');

  // Log a chunk of the catalogue via Catch me up so the verdict has to move.
  await tab(/Roadmap/i);
  const prompt = page.getByRole('button', { name: /Catch me up/i }).first();
  if (await prompt.count()) { await prompt.click(); await settle(1500); }
  for (const label of [/^Phase 1,/, /^Phase 2,/, /^Phase 3,/, /^Phase 4,/]) {
    const row = page.getByRole('checkbox', { name: label }).first();
    if (await row.count()) { await row.click(); await settle(300); }
  }
  const apply = page.getByRole('button', { name: /^Log \d+ titles$/ }).first();
  if (await apply.count()) { await apply.click(); await settle(1800); }

  await tab(/Prep/i);
  await shot('prep-verdict');
  const movedVerdict = await page.getByText(/Doom does not know your name/i).count();
  console.log('CHECK verdict moved off Unpruned:', movedVerdict === 0 ? 'PASS' : 'FAIL');

  // The variant entry point carries the answer as its subtitle.
  const entry = page.getByRole('button', { name: /Which variant are you/i }).first();
  console.log('CHECK variant entry present:', (await entry.count()) > 0 ? 'PASS' : 'FAIL');
  await entry.click();
  await settle(1400);
  await shot('variant-locked');
  const teaser = await page.getByText(/There is no quiz/i).count();
  console.log('CHECK reveal is held behind a tap:', teaser > 0 ? 'PASS' : 'FAIL');

  await page.getByRole('button', { name: /Open my file/i }).first().click();
  await settle(1600);
  await shot('variant-revealed');
  const because = await page.getByText(/^Because$/i).count();
  console.log('CHECK evidence panel shown:', because > 0 ? 'PASS' : 'FAIL');
  const share = await page.getByRole('button', { name: /Send this to the group/i }).count();
  console.log('CHECK share affordance present:', share > 0 ? 'PASS' : 'FAIL');

  await page.mouse.move(195, 520);
  for (let i = 0; i < 5; i += 1) { await page.mouse.wheel(0, 500); await page.waitForTimeout(140); }
  await settle(600);
  await shot('variant-others');
  const others = await page.getByText(/Branches you are not on/i).count();
  console.log('CHECK other branches listed:', others > 0 ? 'PASS' : 'FAIL');

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
