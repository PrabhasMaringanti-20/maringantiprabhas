import { incursion, type IncursionInput } from '@/utils/incursion';

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

const i = (over: Partial<IncursionInput> = {}): IncursionInput => ({
  yourName: 'Prabhas',
  theirName: 'Ava',
  yourWatched: 40,
  theirWatched: 25,
  total: 68,
  bothSeen: 20,
  onlyYours: 20,
  onlyTheirs: 5,
  disagreements: 4,
  ...over,
});

/* --- Who survives --- */
check('the fuller universe survives', incursion(i()).survivor === 'yours');
check('the emptier universe is destroyed',
  incursion(i({ yourWatched: 10, theirWatched: 30 })).survivor === 'theirs');
check('a dead level collision destroys both',
  incursion(i({ yourWatched: 25, theirWatched: 25 })).survivor === 'neither');
check('one title decides it',
  incursion(i({ yourWatched: 26, theirWatched: 25 })).survivor === 'yours');

/* --- Margin --- */
check('the margin is the gap in titles', incursion(i()).margin === 15);
check('the margin is never negative',
  incursion(i({ yourWatched: 5, theirWatched: 40 })).margin === 35);
check('a tie has no margin', incursion(i({ yourWatched: 25, theirWatched: 25 })).margin === 0);

/* --- Casualties: what dies belongs to the loser --- */
check('the loser loses what only it had', incursion(i()).casualties === 5);
check('when you lose, your own titles are the casualties',
  incursion(i({ yourWatched: 10, theirWatched: 30 })).casualties === 20);
check('a tie destroys both sides’ unique titles',
  incursion(i({ yourWatched: 25, theirWatched: 25 })).casualties === 25);
check('a loser with nothing of its own loses nothing',
  incursion(i({ onlyTheirs: 0 })).casualties === 0);

/* --- Headlines move with the shape of the result --- */
const decisive = incursion(i({ yourWatched: 50, theirWatched: 20 }));
const narrowWin = incursion(i({ yourWatched: 26, theirWatched: 25 }));
const narrowLoss = incursion(i({ yourWatched: 25, theirWatched: 26 }));
const middling = incursion(i({ yourWatched: 30, theirWatched: 25 }));
const tie = incursion(i({ yourWatched: 25, theirWatched: 25 }));

check('a rout reads as a rout', decisive.headline === 'Their universe is gone');
check('a narrow win says so', narrowWin.headline === 'You hold, barely');
check('a narrow loss says so', narrowLoss.headline === 'You are overrun');
check('a middling win is neither', middling.headline === 'You survive');
check('a tie is mutual annihilation', tie.headline === 'Mutual annihilation');
check('all five headlines are distinct',
  new Set([decisive, narrowWin, narrowLoss, middling, tie].map((r) => r.headline)).size === 5);

/* --- Two empty universes --- */
const empty = incursion(i({ yourWatched: 0, theirWatched: 0, bothSeen: 0, onlyYours: 0, onlyTheirs: 0, disagreements: 0 }));
check('two empty universes do not collide', empty.survivor === 'neither');
check('an empty collision says what to do about it', /Log something/i.test(empty.line));
check('an empty collision is not called annihilation',
  empty.headline === 'Nothing to collide');

/* --- Percentages --- */
check('percentages are of the whole catalogue',
  incursion(i()).yourPercent === 59 && incursion(i()).theirPercent === 37,
  `${incursion(i()).yourPercent}/${incursion(i()).theirPercent}`);
check('an empty catalogue does not divide by zero',
  incursion(i({ total: 0, yourWatched: 0, theirWatched: 0 })).yourPercent === 0);

/* --- Prose holds up --- */
const samples = [
  decisive, narrowWin, narrowLoss, middling, tie, empty,
  incursion(i({ yourWatched: 68, theirWatched: 0, onlyTheirs: 0, bothSeen: 0 })),
  incursion(i({ bothSeen: 0, disagreements: 0 })),
  incursion(i({ yourName: '', theirName: '' })),
  incursion(i({ yourWatched: 1, theirWatched: 0, onlyYours: 1, onlyTheirs: 0, bothSeen: 0, disagreements: 0 })),
];
check('no result leaks undefined or NaN',
  samples.every((r) => !/undefined|NaN/.test(r.headline + r.line + r.shareLine)));
check('every line is a finished sentence', samples.every((r) => /[.!?]$/.test(r.line.trim())));
check('every share line is a finished sentence',
  samples.every((r) => /[.!?]$/.test(r.shareLine.trim())));
check('no line double-spaces or trails whitespace',
  samples.every((r) => !/ {2}/.test(r.line) && r.line === r.line.trim()));
check('every headline is short enough to be a headline',
  samples.every((r) => r.headline.length <= 24));
check('unnamed universes still read as sentences',
  /Your universe|Theirs/.test(incursion(i({ yourName: '', theirName: '' })).shareLine));
check('a single title is singular, not "1 titles"',
  /1 title\b/.test(incursion(i({ yourWatched: 26, theirWatched: 25 })).line));
check('a lone casualty is singular',
  /1 title existed only/.test(
    incursion(i({ yourWatched: 40, theirWatched: 25, onlyTheirs: 1 })).line));
check('a loser with nothing unique is told so',
  /nothing of its own to lose/.test(incursion(i({ onlyTheirs: 0 })).line));
check('contested ground is mentioned when it exists',
  /20 titles existed in both/.test(incursion(i()).line));
check('no contested ground is not mentioned at all',
  !/existed in both/.test(incursion(i({ bothSeen: 0 })).line));
check('results are deterministic',
  samples.every((r, n) => JSON.stringify(r) === JSON.stringify([
    incursion(i({ yourWatched: 50, theirWatched: 20 })),
    incursion(i({ yourWatched: 26, theirWatched: 25 })),
    incursion(i({ yourWatched: 25, theirWatched: 26 })),
    incursion(i({ yourWatched: 30, theirWatched: 25 })),
    incursion(i({ yourWatched: 25, theirWatched: 25 })),
    incursion(i({ yourWatched: 0, theirWatched: 0, bothSeen: 0, onlyYours: 0, onlyTheirs: 0, disagreements: 0 })),
    incursion(i({ yourWatched: 68, theirWatched: 0, onlyTheirs: 0, bothSeen: 0 })),
    incursion(i({ bothSeen: 0, disagreements: 0 })),
    incursion(i({ yourName: '', theirName: '' })),
    incursion(i({ yourWatched: 1, theirWatched: 0, onlyYours: 1, onlyTheirs: 0, bothSeen: 0, disagreements: 0 })),
  ][n])));

console.log(fails === 0 ? '\nINCURSION OK' : `\nINCURSION FAILED — ${fails} check(s)`);
process.exit(fails === 0 ? 0 : 1);
