/** Photographs the countdown clock and checks it counts to local midnight. */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });
  // Pin the browser to the user's timezone: the whole bug was a UTC/local mismatch.
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    timezoneId: 'Asia/Kolkata', locale: 'en-GB',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 240)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)); });

  let n = 0;
  const shot = async (name) => {
    n += 1;
    await page.screenshot({ path: `${OUT}/k${String(n).padStart(2, '0')}-${name}.png` });
    console.log('shot', name);
  };
  const settle = (ms = 900) => page.waitForTimeout(ms);
  const check = (label, ok, detail = '') =>
    console.log(`CHECK ${label}: ${ok ? 'PASS' : 'FAIL'}${detail ? ' — ' + detail : ''}`);

  await page.addInitScript(() => {
    // expo-audio plays through a detached HTMLAudioElement, so it cannot be
    // found in the DOM. Record play/pause on the prototype instead.
    window.__audio = { plays: 0, pauses: 0 };
    const play = HTMLAudioElement.prototype.play;
    const pause = HTMLAudioElement.prototype.pause;
    HTMLAudioElement.prototype.play = function (...a) {
      window.__audio.plays += 1;
      window.__audio.last = this;
      return play.apply(this, a);
    };
    HTMLAudioElement.prototype.pause = function (...a) {
      window.__audio.pauses += 1;
      return pause.apply(this, a);
    };
  });

  await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
  await settle(6500);
  await page.getByRole('tab', { name: /Roadmap/i }).first().click();
  await settle(1500);
  await shot('clock');

  // The clock must agree with local midnight on 18 December 2026.
  const clock = await page.evaluate(() => {
    const hit = Array.from(document.querySelectorAll('div'))
      .map((el) => (el.textContent || '').trim())
      .find((t) => /^\d{2}:\d{2}:\d{2}$/.test(t));
    return hit || null;
  });
  check('a HH:MM:SS clock is rendered', Boolean(clock), clock || 'not found');

  const expected = await page.evaluate(() => {
    const target = new Date(2026, 11, 18, 0, 0, 0);
    const s = Math.floor((target - new Date()) / 1000);
    const p = (v) => String(v).padStart(2, '0');
    return {
      hms: `${p(Math.floor((s % 86400) / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`,
      days: Math.floor(s / 86400),
      tzOffsetMinutes: new Date().getTimezoneOffset(),
    };
  });
  console.log('browser tz offset (min):', expected.tzOffsetMinutes, '(IST = -330)');
  // Allow a second or two of slippage between the two reads.
  const near = (a, b) => {
    const toS = (t) => { const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + s; };
    return Math.abs(toS(a) - toS(b)) <= 3;
  };
  check('the clock counts to LOCAL midnight, not UTC', clock && near(clock, expected.hms),
    `shown ${clock}, expected ~${expected.hms}`);

  const dayText = await page.getByText(/18 December 2026/).first().textContent();
  check('the date names the weekday and the hour it lands',
    /Friday 18 December 2026/.test(dayText || '') && /midnight/i.test(dayText || ''),
    (dayText || '').trim());

  // The seconds have to actually move.
  const before = clock;
  await settle(2200);
  const after = await page.evaluate(() => {
    const hit = Array.from(document.querySelectorAll('div'))
      .map((el) => (el.textContent || '').trim())
      .find((t) => /^\d{2}:\d{2}:\d{2}$/.test(t));
    return hit || null;
  });
  check('the clock is running', before !== after, `${before} → ${after}`);

  // The tick toggle.
  const mute = page.getByRole('switch', { name: /Let the countdown tick/i }).first();
  check('the tick toggle is offered, and starts silent', (await mute.count()) > 0);
  await mute.click();
  await settle(900);
  await shot('clock-ticking');
  const on = await page.getByRole('switch', { name: /Silence the countdown/i }).count();
  check('tapping it switches the countdown to ticking', on > 0);
  const playing = await page.evaluate(() => ({
    plays: window.__audio.plays,
    paused: window.__audio.last ? window.__audio.last.paused : null,
    looping: window.__audio.last ? window.__audio.last.loop : null,
  }));
  check('the tick clip is played', playing.plays > 0, `${playing.plays} play call(s)`);
  check('it is not immediately paused by a race', playing.paused === false);
  check('the clip loops rather than firing once a second', playing.looping === true);

  await page.getByRole('switch', { name: /Silence the countdown/i }).first().click();
  await settle(700);
  const silenced = await page.evaluate(() =>
    window.__audio.last ? window.__audio.last.paused : null);
  check('silencing it stops the audio', silenced === true);
  check('the toggle returns to silent',
    (await page.getByRole('switch', { name: /Let the countdown tick/i }).count()) > 0);

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
