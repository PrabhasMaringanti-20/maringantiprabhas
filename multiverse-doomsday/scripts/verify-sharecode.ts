import { compareBoards, decodeBoard, encodeBoard } from '@/utils/shareCode';
import moviesJson from '@/data/movies.json';
import { TIERS, type MovieProgress } from '@/types';

const MOVIES = moviesJson as { id: string }[];
let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

/** Deterministic pseudo-random board, so failures are reproducible. */
function makeBoard(seed: number, density = 0.6): Record<string, MovieProgress> {
  let state = seed >>> 0 || 1;
  const rand = () => {
    state ^= state << 13; state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5; state >>>= 0;
    return state / 0x100000000;
  };
  const out: Record<string, MovieProgress> = {};
  for (const m of MOVIES) {
    if (rand() > density) continue;
    const watched = rand() > 0.2;
    out[m.id] = {
      isWatched: watched,
      userRating: Math.floor(rand() * 6),
      tier: rand() > 0.5 ? TIERS[Math.floor(rand() * TIERS.length)] : undefined,
    };
  }
  return out;
}

/** Compares only the fields the wire format actually carries. */
function sameBoard(a: Record<string, MovieProgress>, b: Record<string, MovieProgress>) {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const id of ids) {
    const x = a[id], y = b[id];
    const xw = !!x?.isWatched, yw = !!y?.isWatched;
    const xr = x?.userRating ?? 0, yr = y?.userRating ?? 0;
    const xt = x?.tier, yt = y?.tier;
    if (xw !== yw || xr !== yr || xt !== yt) {
      return `${id}: ${JSON.stringify({ xw, xr, xt })} != ${JSON.stringify({ yw, yr, yt })}`;
    }
  }
  return null;
}

// --- Round trip across many random boards ---
let worstLength = 0;
for (let seed = 1; seed <= 300; seed += 1) {
  const board = makeBoard(seed);
  const code = encodeBoard('Prabhas', board);
  worstLength = Math.max(worstLength, code.length);
  const decoded = decodeBoard(code);
  if (!decoded) { check(`seed ${seed} decodes`, false); continue; }
  const diff = sameBoard(board, decoded.progress);
  if (diff) check(`seed ${seed} round-trips`, false, diff);
  if (decoded.name !== 'Prabhas') check(`seed ${seed} keeps name`, false, decoded.name);
}
check('300 random boards round-trip exactly', fails === 0);
check('code stays short', worstLength < 140, `longest ${worstLength} chars`);

// --- Edge cases ---
const empty = decodeBoard(encodeBoard('', {}));
check('empty board decodes', !!empty && Object.keys(empty.progress).length === 0);
check('empty name decodes', empty?.name === '');

const everything: Record<string, MovieProgress> = {};
for (const m of MOVIES) everything[m.id] = { isWatched: true, userRating: 5, tier: 'S' };
const full = decodeBoard(encodeBoard('A'.repeat(40), everything));
check('full board round-trips', !!full && !sameBoard(everything, full!.progress));
check('long name is truncated, not corrupting', (full?.name.length ?? 0) <= 16, `len ${full?.name.length}`);

// --- Every tier and rating survives ---
const spread: Record<string, MovieProgress> = {};
MOVIES.slice(0, 12).forEach((m, i) => {
  spread[m.id] = { isWatched: true, userRating: i % 6, tier: TIERS[i % TIERS.length] };
});
const spreadBack = decodeBoard(encodeBoard('x', spread));
check('all tiers and ratings survive', !!spreadBack && !sameBoard(spread, spreadBack!.progress),
      sameBoard(spread, spreadBack?.progress ?? {}) ?? '');

// --- Corrupt input must be refused, never silently wrong ---
const good = encodeBoard('Prabhas', makeBoard(7));
check('empty string refused', decodeBoard('') === null);
check('whitespace refused', decodeBoard('   ') === null);
check('junk refused', decodeBoard('this is not a code!!') === null);
check('illegal char refused', decodeBoard(good.slice(0, 10) + '*' + good.slice(11)) === null);
check('truncated refused', decodeBoard(good.slice(0, 8)) === null);
check('wrong version refused', decodeBoard('_' + good.slice(1)) === null);

// A code that survives a single-char swap must still be self-consistent,
// never produce a board claiming more titles than the catalogue holds.
let unsafe = 0;
for (let i = 0; i < good.length; i += 1) {
  const swapped = good.slice(0, i) + (good[i] === 'A' ? 'B' : 'A') + good.slice(i + 1);
  const out = decodeBoard(swapped);
  if (out && Object.keys(out.progress).length > MOVIES.length) unsafe += 1;
}
check('single-char corruption never over-fills', unsafe === 0, `${unsafe} bad decodes`);

// --- Whitespace tolerance (people paste with newlines) ---
const wrapped = good.slice(0, 20) + '\n' + good.slice(20, 40) + ' ' + good.slice(40);
const wrappedBack = decodeBoard(wrapped);
check('pasted with newlines still decodes', !!wrappedBack && !sameBoard(makeBoard(7), wrappedBack!.progress));

// --- Comparison ---
const mine = makeBoard(11);
const theirs = makeBoard(22);
const cmp = compareBoards(mine, theirs);
const mineWatched = Object.values(mine).filter((p) => p.isWatched).length;
const theirsWatched = Object.values(theirs).filter((p) => p.isWatched).length;
check('comparison counts yours', cmp.yourWatched === mineWatched, `${cmp.yourWatched} vs ${mineWatched}`);
check('comparison counts theirs', cmp.theirWatched === theirsWatched, `${cmp.theirWatched} vs ${theirsWatched}`);
check('seen-lists are disjoint',
  !cmp.theyveSeen.some((a) => cmp.youveSeen.some((b) => b.id === a.id)));
check('both-seen plus exclusives adds up',
  cmp.bothSeen + cmp.youveSeen.length === cmp.yourWatched);
check('disagreements are real disagreements',
  cmp.disagreements.every((d) => d.yours !== d.theirs && d.distance > 0));
check('disagreements sorted widest first',
  cmp.disagreements.every((d, i, a) => i === 0 || a[i - 1].distance >= d.distance));

// Identical boards must produce no noise.
const same = compareBoards(mine, mine);
check('identical boards show no differences',
  same.theyveSeen.length === 0 && same.youveSeen.length === 0 && same.disagreements.length === 0);

console.log(`\nlongest code: ${worstLength} chars for ${MOVIES.length} titles`);
console.log(fails === 0 ? 'SHARE CODE OK' : `${fails} FAILURES`);
process.exit(fails ? 1 : 0);
