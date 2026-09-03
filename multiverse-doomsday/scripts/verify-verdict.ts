import {
  doomVerdict,
  variantFor,
  VARIANTS,
  VARIANT_ORDER,
  type VariantId,
  type VariantInput,
  type VerdictInput,
} from '@/utils/verdict';
import { TIERS, type Tier } from '@/types';

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

/* ------------------------------------------------------------------ *
 * Doom's verdict
 * ------------------------------------------------------------------ */

const v = (over: Partial<VerdictInput> = {}): VerdictInput => ({
  percent: 50,
  watched: 34,
  total: 68,
  streakDays: 0,
  daysToDoomsday: 106,
  ...over,
});

const rank = (over: Partial<VerdictInput> = {}) => doomVerdict(v(over)).rank;

check('nothing watched reads as Unpruned', rank({ watched: 0, percent: 0 }) === 'Unpruned');
check('a single title leaves Unpruned behind', rank({ watched: 1, percent: 1 }) === 'Civilian');
check('14% is still Civilian', rank({ watched: 10, percent: 14 }) === 'Civilian');
check('15% crosses into Barely begun', rank({ watched: 10, percent: 15 }) === 'Barely begun');
check('34% is Barely begun', rank({ percent: 34 }) === 'Barely begun');
check('35% is Halfway to nothing', rank({ percent: 35 }) === 'Halfway to nothing');
check('59% is Halfway to nothing', rank({ percent: 59 }) === 'Halfway to nothing');
check('60% is Adequate', rank({ percent: 60 }) === 'Adequate');
check('84% is Adequate', rank({ percent: 84 }) === 'Adequate');
check('85% is Prepared', rank({ percent: 85 }) === 'Prepared');
check('99% is Prepared', rank({ percent: 99 }) === 'Prepared');
check('100% is Equal', rank({ percent: 100, watched: 68 }) === 'Equal');

// Every rank must be distinct, or the ladder does not read as a ladder.
const ladder = [0, 5, 20, 40, 70, 90, 100].map((percent) =>
  rank({ percent, watched: percent === 0 ? 0 : Math.round((percent / 100) * 68) }),
);
check('every step of the ladder is a different rank', new Set(ladder).size === ladder.length,
  ladder.join(' → '));

check('Adequate acknowledges a streak',
  doomVerdict(v({ percent: 70, streakDays: 5 })).line !==
    doomVerdict(v({ percent: 70, streakDays: 0 })).line);

// The lines are shown as-is, so they must always be complete sentences with
// the real numbers substituted — never a stray "undefined" or "NaN".
const samples: VerdictInput[] = [
  v({ watched: 0, percent: 0 }),
  v({ percent: 8, watched: 5 }),
  v({ percent: 22, watched: 15 }),
  v({ percent: 45, watched: 31 }),
  v({ percent: 72, watched: 49, streakDays: 4 }),
  v({ percent: 90, watched: 61 }),
  v({ percent: 100, watched: 68 }),
  v({ percent: 0, watched: 0, total: 0, daysToDoomsday: 0 }),
];
check('no verdict line leaks undefined or NaN',
  samples.every((s) => !/undefined|NaN/.test(doomVerdict(s).line)));
check('every verdict is a finished sentence',
  samples.every((s) => /[.!?]$/.test(doomVerdict(s).line)));
check('every rank is short enough to be a headline',
  samples.every((s) => doomVerdict(s).rank.length <= 20));
check('verdicts are deterministic',
  samples.every((s) => doomVerdict(s).line === doomVerdict(s).line));

/* ------------------------------------------------------------------ *
 * Variants
 * ------------------------------------------------------------------ */

const tiers = (over: Partial<Record<Tier, number>> = {}): Record<Tier, number> => ({
  S: 0, A: 0, B: 0, C: 0, D: 0, ...over,
});

const b = (over: Partial<VariantInput> = {}): VariantInput => ({
  percent: 50,
  averageRating: 3.5,
  ratedCount: 0,
  tierCounts: tiers(),
  streakDays: 0,
  longestStreakDays: 0,
  activeDays: 10,
  watched: 34,
  ...over,
});

const id = (over: Partial<VariantInput> = {}) => variantFor(b(over)).id;

check('nothing logged is unbranched', id({ watched: 0, percent: 0, activeDays: 0 }) === 'unbranched');
check('a binge is an incursion', id({ watched: 12, activeDays: 3 }) === 'incursion');
check('a slow watcher is not an incursion', id({ watched: 12, activeDays: 12 }) !== 'incursion');
check('a small burst is not an incursion', id({ watched: 6, activeDays: 2 }) !== 'incursion');
check('a long streak is the sacred timeline', id({ longestStreakDays: 9, activeDays: 20 }) === 'sacred');
check('a 6-day streak is not enough', id({ longestStreakDays: 6, activeDays: 20 }) !== 'sacred');
check('high ratings make a believer',
  id({ ratedCount: 14, averageRating: 4.5, activeDays: 20 }) === 'believer');
check('low ratings make a Kang',
  id({ ratedCount: 14, averageRating: 2.2, activeDays: 20 }) === 'kang');
check('too few ratings does not classify by rating',
  id({ ratedCount: 4, averageRating: 4.9, activeDays: 20 }) !== 'believer');
check('a top-heavy tier list is generous',
  id({ tierCounts: tiers({ S: 8, A: 6, B: 2, C: 1 }), activeDays: 20 }) === 'generous');
check('a bottom-heavy tier list is a pruner',
  id({ tierCounts: tiers({ S: 1, A: 2, B: 3, C: 6, D: 5 }), activeDays: 20 }) === 'pruner');
check('near-complete with nothing else is a Watcher',
  id({ percent: 88, watched: 60, activeDays: 30 }) === 'archivist');
check('barely started is a nexus being',
  id({ percent: 12, watched: 8, activeDays: 8 }) === 'nexus');
check('the middle falls through to Earth-616',
  id({ percent: 50, watched: 34, activeDays: 20 }) === 'earth616');

// Reachability: every branch must be gettable, or it is dead prose.
const reachable = new Set(
  [
    b({ watched: 0, percent: 0, activeDays: 0 }),
    b({ watched: 12, activeDays: 3 }),
    b({ longestStreakDays: 9, activeDays: 20 }),
    b({ ratedCount: 14, averageRating: 4.5, activeDays: 20 }),
    b({ ratedCount: 14, averageRating: 2.2, activeDays: 20 }),
    b({ tierCounts: tiers({ S: 8, A: 6, B: 2, C: 1 }), activeDays: 20 }),
    b({ tierCounts: tiers({ S: 1, A: 2, B: 3, C: 6, D: 5 }), activeDays: 20 }),
    b({ percent: 88, watched: 60, activeDays: 30 }),
    b({ percent: 12, watched: 8, activeDays: 8 }),
    b({ percent: 50, watched: 34, activeDays: 20 }),
  ].map((input) => variantFor(input).id),
);
check('all ten variants are reachable', reachable.size === 10, [...reachable].join(', '));

const everyVariant = [...reachable];
check('variant ids are unique', new Set(everyVariant).size === everyVariant.length);

// Each result has to justify itself with real numbers.
const results = [
  variantFor(b({ watched: 12, activeDays: 3 })),
  variantFor(b({ longestStreakDays: 9, activeDays: 20 })),
  variantFor(b({ ratedCount: 14, averageRating: 4.5, activeDays: 20 })),
  variantFor(b({ tierCounts: tiers({ S: 8, A: 6, B: 2, C: 1 }), activeDays: 20 })),
  variantFor(b({ percent: 88, watched: 60, activeDays: 30 })),
  variantFor(b({ percent: 50, watched: 34, activeDays: 20 })),
];
check('every variant cites a number', results.every((r) => /\d/.test(r.because)));
check('no variant leaks undefined or NaN',
  results.every((r) => !/undefined|NaN/.test(r.because + r.blurb + r.name)));
check('every because is a finished sentence', results.every((r) => /[.!?]$/.test(r.because)));
check('every blurb is a finished sentence', results.every((r) => /[.!?]$/.test(r.blurb)));

// Guards against inputs the store can genuinely produce.
check('zero active days does not divide by zero',
  id({ watched: 5, activeDays: 0 }) === 'nexus' || id({ watched: 5, activeDays: 0 }).length > 0);
check('an empty catalogue does not throw',
  variantFor(b({ watched: 0, percent: 0, activeDays: 0, tierCounts: tiers() })).id === 'unbranched');
check('tier counts cover every tier',
  TIERS.every((tier) => typeof b().tierCounts[tier] === 'number'));
check('variants are deterministic',
  results.every((r, i) => variantFor([
    b({ watched: 12, activeDays: 3 }),
    b({ longestStreakDays: 9, activeDays: 20 }),
    b({ ratedCount: 14, averageRating: 4.5, activeDays: 20 }),
    b({ tierCounts: tiers({ S: 8, A: 6, B: 2, C: 1 }), activeDays: 20 }),
    b({ percent: 88, watched: 60, activeDays: 30 }),
    b({ percent: 50, watched: 34, activeDays: 20 }),
  ][i]).id === r.id));

/* ------------------------------------------------------------------ *
 * The roster
 * ------------------------------------------------------------------ */

const rosterIds = Object.keys(VARIANTS) as VariantId[];
check('the roster lists every variant the classifier can return',
  everyVariant.every((v) => rosterIds.includes(v as VariantId)));
check('the classifier can return every variant on the roster',
  rosterIds.every((v) => everyVariant.includes(v)),
  rosterIds.filter((v) => !everyVariant.includes(v)).join(', '));
check('the display order covers the whole roster',
  VARIANT_ORDER.length === rosterIds.length &&
    new Set(VARIANT_ORDER).size === rosterIds.length &&
    VARIANT_ORDER.every((v) => rosterIds.includes(v)));
check('every roster entry keys itself', rosterIds.every((v) => VARIANTS[v].id === v));
check('every unlock explains itself in a finished sentence',
  rosterIds.every((v) => /[.!?]$/.test(VARIANTS[v].unlock) && VARIANTS[v].unlock.length > 8));
check('classified variants carry the roster copy',
  results.every((r) => r.name === VARIANTS[r.id].name && r.blurb === VARIANTS[r.id].blurb));

console.log(fails === 0 ? '\nVERDICT OK' : `\nVERDICT FAILED — ${fails} check(s)`);
process.exit(fails === 0 ? 0 : 1);
