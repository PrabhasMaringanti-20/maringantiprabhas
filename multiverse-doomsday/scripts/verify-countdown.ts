import {
  DOOMSDAY_RELEASE,
  countdownTo,
  pad,
  releaseDateLabel,
  releaseDayLabel,
} from '@/utils/countdown';

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

/* ------------------------------------------------------------------ *
 * The date itself
 * ------------------------------------------------------------------ */

check('the release is 18 December 2026',
  DOOMSDAY_RELEASE.getFullYear() === 2026 &&
    DOOMSDAY_RELEASE.getMonth() === 11 &&
    DOOMSDAY_RELEASE.getDate() === 18);

// The whole point of the fix: local midnight, not UTC midnight. A UTC-pinned
// date reaches zero at 05:30 in India while its own label says "18 December".
check('the release is local midnight, not UTC midnight',
  DOOMSDAY_RELEASE.getHours() === 0 &&
    DOOMSDAY_RELEASE.getMinutes() === 0 &&
    DOOMSDAY_RELEASE.getSeconds() === 0 &&
    DOOMSDAY_RELEASE.getMilliseconds() === 0,
  DOOMSDAY_RELEASE.toString());

check('the printed date is the date the clock counts to',
  releaseDateLabel().startsWith(String(DOOMSDAY_RELEASE.getDate())),
  releaseDateLabel());
check('the day label names the weekday', /^\w+ 18 December 2026$/.test(releaseDayLabel()),
  releaseDayLabel());
check('the day label carries no stray comma', !releaseDayLabel().includes(','));

// Counting down to the release from one second before it must land on zero,
// in whatever zone this runs in.
const oneSecondBefore = new Date(DOOMSDAY_RELEASE.getTime() - 1000);
const last = countdownTo(DOOMSDAY_RELEASE, oneSecondBefore);
check('the final second reads 0d 00:00:01',
  last.days === 0 && last.hours === 0 && last.minutes === 0 && last.seconds === 1 && !last.released);

const atMidnight = countdownTo(DOOMSDAY_RELEASE, DOOMSDAY_RELEASE);
check('the clock hits zero exactly at local midnight',
  atMidnight.released && atMidnight.totalSeconds === 0);

// The evening before release, a person should see "0 days" and hours in the
// teens — not a day count that implies they still have another sleep.
const eveningBefore = new Date(
  DOOMSDAY_RELEASE.getFullYear(),
  DOOMSDAY_RELEASE.getMonth(),
  DOOMSDAY_RELEASE.getDate() - 1,
  18, 0, 0,
);
const eve = countdownTo(DOOMSDAY_RELEASE, eveningBefore);
check('6pm the night before is 0 days and 6 hours',
  eve.days === 0 && eve.hours === 6 && eve.minutes === 0, `${eve.days}d ${eve.hours}h`);

// Midnight exactly N days out must read as N days flat — this is what a
// UTC-pinned release got wrong for every zone but one.
//
// The one honest exception is daylight saving. Between two local midnights
// either side of a DST change there really are 24n ± 1 hours, and the app
// shows the true remaining time rather than a calendar count, so days and
// h:m:s always add up to the same moment. India, where this is being used,
// has no DST and never sees it; zones that do get an extra hour on the clock
// rather than a wrong day count, which is the better of the two errors.
for (const daysOut of [1, 7, 30, 100]) {
  const at = new Date(
    DOOMSDAY_RELEASE.getFullYear(),
    DOOMSDAY_RELEASE.getMonth(),
    DOOMSDAY_RELEASE.getDate() - daysOut,
    0, 0, 0,
  );
  const c = countdownTo(DOOMSDAY_RELEASE, at);
  // getTimezoneOffset is minutes behind UTC, so a zone that loses an hour of
  // offset between the two dates has genuinely gained an hour of elapsed time.
  const dstMinutes = DOOMSDAY_RELEASE.getTimezoneOffset() - at.getTimezoneOffset();
  const expected = daysOut * 86_400 + dstMinutes * 60;
  check(`local midnight ${daysOut} days out reads exactly ${daysOut}d${dstMinutes ? ' give or take the DST hour' : ' 00:00:00'}`,
    c.totalSeconds === expected && c.minutes === 0 && c.seconds === 0,
    `${c.days}d ${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`);
}

check('days and h:m:s always describe the same instant',
  [1, 7, 30, 100, 200].every((daysOut) => {
    const at = new Date(DOOMSDAY_RELEASE.getTime() - daysOut * 86_400_000 - 3_723_000);
    const c = countdownTo(DOOMSDAY_RELEASE, at);
    return c.days * 86_400 + c.hours * 3600 + c.minutes * 60 + c.seconds === c.totalSeconds;
  }));

/* ------------------------------------------------------------------ *
 * Arithmetic
 * ------------------------------------------------------------------ */

const target = new Date(2026, 11, 18, 0, 0, 0);
const cases: [string, Date, [number, number, number, number]][] = [
  ['a clean day and a half', new Date(2026, 11, 16, 12, 0, 0), [1, 12, 0, 0]],
  ['one minute out', new Date(2026, 11, 17, 23, 59, 0), [0, 0, 1, 0]],
  ['one second out', new Date(2026, 11, 17, 23, 59, 59), [0, 0, 0, 1]],
  ['an awkward remainder', new Date(2026, 11, 15, 7, 22, 41), [2, 16, 37, 19]],
];
for (const [name, from, [d, h, m, s]] of cases) {
  const c = countdownTo(target, from);
  check(name, c.days === d && c.hours === h && c.minutes === m && c.seconds === s,
    `${c.days}d ${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`);
}

check('hours never exceed 23',
  cases.every(([, from]) => countdownTo(target, from).hours <= 23));
check('minutes and seconds never exceed 59',
  cases.every(([, from]) => {
    const c = countdownTo(target, from);
    return c.minutes <= 59 && c.seconds <= 59;
  }));

/* ------------------------------------------------------------------ *
 * After release
 * ------------------------------------------------------------------ */

const after = countdownTo(target, new Date(2026, 11, 19, 12, 0, 0));
check('a passed release reads as released', after.released);
check('a passed release never counts backwards',
  after.days === 0 && after.hours === 0 && after.minutes === 0 && after.seconds === 0 &&
    after.totalSeconds === 0);

/* ------------------------------------------------------------------ *
 * Padding
 * ------------------------------------------------------------------ */

check('single digits are padded', pad(7) === '07' && pad(0) === '00');
check('double digits are left alone', pad(23) === '23' && pad(59) === '59');

console.log(fails === 0 ? '\nCOUNTDOWN OK' : `\nCOUNTDOWN FAILED — ${fails} check(s)`);
process.exit(fails === 0 ? 0 : 1);
