import {
  ANSWER_KEY,
  PREDICTIONS,
  compareBallots,
  decodeBallot,
  encodeBallot,
  scoreBallot,
  type Ballot,
} from '@/utils/predictions';

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

/* ------------------------------------------------------------------ *
 * The questions themselves
 * ------------------------------------------------------------------ */

check('there are questions to answer', PREDICTIONS.length >= 10, `${PREDICTIONS.length}`);
check('question ids are unique',
  new Set(PREDICTIONS.map((q) => q.id)).size === PREDICTIONS.length);
check('every question has two to seven options',
  PREDICTIONS.every((q) => q.options.length >= 2 && q.options.length <= 7),
  PREDICTIONS.filter((q) => q.options.length < 2 || q.options.length > 7).map((q) => q.id).join(', '));
check('option ids are unique within a question',
  PREDICTIONS.every((q) => new Set(q.options.map((o) => o.id)).size === q.options.length));
check('every question ends in a question mark',
  PREDICTIONS.every((q) => q.question.trim().endsWith('?')),
  PREDICTIONS.filter((q) => !q.question.trim().endsWith('?')).map((q) => q.id).join(', '));
check('every question explains why it is arguable',
  PREDICTIONS.every((q) => q.note.length > 20 && /[.!?]$/.test(q.note)));
check('no option label is empty',
  PREDICTIONS.every((q) => q.options.every((o) => o.label.trim().length > 0)));

/* ------------------------------------------------------------------ *
 * Codec
 * ------------------------------------------------------------------ */

const full: Ballot = {};
for (const q of PREDICTIONS) full[q.id] = q.options[0].id;

const partial: Ballot = {};
PREDICTIONS.forEach((q, i) => {
  if (i % 3 === 0) partial[q.id] = q.options[q.options.length - 1].id;
});

const roundTrip = (name: string, ballot: Ballot) => decodeBallot(encodeBallot(name, ballot));

const fullBack = roundTrip('Prabhas', full);
check('a full ballot survives a round trip',
  fullBack !== null && JSON.stringify(fullBack.ballot) === JSON.stringify(full));
check('the name survives a round trip', fullBack?.name === 'Prabhas');

const partialBack = roundTrip('Ava', partial);
check('a partial ballot survives a round trip',
  partialBack !== null && JSON.stringify(partialBack.ballot) === JSON.stringify(partial));
check('unanswered questions stay unanswered',
  partialBack !== null &&
    Object.keys(partialBack.ballot).length === Object.keys(partial).length);

const emptyBack = roundTrip('', {});
check('an empty ballot still encodes and decodes',
  emptyBack !== null && Object.keys(emptyBack.ballot).length === 0);
check('an empty name decodes to an empty name', emptyBack?.name === '');

// Every option of every question has to be reachable through the wire format.
let optionFails = 0;
for (const q of PREDICTIONS) {
  for (const option of q.options) {
    const back = roundTrip('x', { [q.id]: option.id });
    if (back?.ballot[q.id] !== option.id) optionFails += 1;
  }
}
check('every option of every question round-trips', optionFails === 0, `${optionFails} bad`);

const code = encodeBallot('Prabhas', full);
check('the code is short enough to paste', code.length <= 60, `${code.length} chars`);
check('the code is chat-safe', /^[A-Za-z0-9_-]+$/.test(code));
check('encoding is deterministic', encodeBallot('Prabhas', full) === code);
check('whitespace around a pasted code is tolerated',
  JSON.stringify(decodeBallot(`  ${code} \n`)?.ballot) === JSON.stringify(full));

check('nonsense is refused', decodeBallot('not a real code!!!') === null);
check('an empty string is refused', decodeBallot('') === null);
check('a truncated code is refused or partial, never wrong',
  (() => {
    const cut = decodeBallot(code.slice(0, 6));
    return cut === null || Object.keys(cut.ballot).every((id) =>
      PREDICTIONS.some((q) => q.id === id));
  })());
check('a code from a future format version is refused',
  decodeBallot(encodeBallot('x', full).replace(/^./, 'Z')) === null ||
    decodeBallot('ZZZZZZZZZZZZ') === null);

/* ------------------------------------------------------------------ *
 * Comparison
 * ------------------------------------------------------------------ */

const same = compareBallots(full, full);
check('identical ballots agree on everything',
  same.agreed === PREDICTIONS.length && same.clashed === 0);
check('total agreement reads as 100%', same.agreementPercent === 100);

const opposite: Ballot = {};
for (const q of PREDICTIONS) opposite[q.id] = q.options[q.options.length - 1].id;
const clash = compareBallots(full, opposite);
check('opposed ballots clash on every multi-option question',
  clash.clashed === PREDICTIONS.filter((q) => q.options.length > 1).length,
  `${clash.clashed} clashes`);
check('total disagreement reads as 0%', clash.agreementPercent === 0);
check('clashes are listed first',
  clash.lines.slice(0, clash.clashed).every((line) => line.clash));

const oneSided = compareBallots(full, {});
check('an unanswered opponent is incomplete, not a clash',
  oneSided.clashed === 0 && oneSided.incomplete === PREDICTIONS.length);
check('agreement is 0% when nothing was compared', oneSided.agreementPercent === 0);
check('every line names its question',
  same.lines.every((line) => line.question.length > 0 && line.questionId.length > 0));
check('answered lines carry readable labels, not ids',
  same.lines.every((line) =>
    line.yours === undefined ||
    PREDICTIONS.some((q) => q.options.some((o) => o.label === line.yours))));
check('comparison covers every question',
  same.lines.length === PREDICTIONS.length &&
    new Set(same.lines.map((l) => l.questionId)).size === PREDICTIONS.length);

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

const beforeRelease = scoreBallot(full);
check('nothing is settled before the film is out', beforeRelease.settled === 0);
check('the score is not claimed as complete before release', !beforeRelease.complete);
check('answers are counted even while unsettled',
  beforeRelease.answered === PREDICTIONS.length);
check('the shipped answer key starts empty', Object.keys(ANSWER_KEY).length === 0);

// A partly-filled key, as it would look the week the film lands.
const partialKey: Record<string, string> = {};
PREDICTIONS.slice(0, 4).forEach((q, i) => {
  partialKey[q.id] = q.options[i % q.options.length].id;
});
const midScore = scoreBallot(full, partialKey);
check('a partial key settles only what it covers', midScore.settled === 4);
check('a partial key is not complete', !midScore.complete);
check('scoring counts the right answers',
  midScore.correct === PREDICTIONS.slice(0, 4).filter((q, i) => q.options[i % q.options.length].id === full[q.id]).length,
  `${midScore.correct}/4`);

const fullKey: Record<string, string> = {};
for (const q of PREDICTIONS) fullKey[q.id] = q.options[0].id;
const perfect = scoreBallot(full, fullKey);
check('a perfect ballot scores 100%', perfect.percent === 100 && perfect.correct === PREDICTIONS.length);
check('a fully settled key reads as complete', perfect.complete);

const wrong = scoreBallot(opposite, fullKey);
const winnable = PREDICTIONS.filter((q) => q.options.length > 1).length;
check('an entirely wrong ballot scores only the unavoidable',
  wrong.correct === PREDICTIONS.length - winnable, `${wrong.correct} correct`);

const blank = scoreBallot({}, fullKey);
check('an unanswered ballot scores 0% rather than dividing by zero',
  blank.percent === 0 && blank.correct === 0 && blank.answered === 0);
check('unanswered questions are not counted against you',
  scoreBallot({ [PREDICTIONS[0].id]: fullKey[PREDICTIONS[0].id] }, fullKey).percent === 100);

console.log(fails === 0 ? '\nPREDICTIONS OK' : `\nPREDICTIONS FAILED — ${fails} check(s)`);
process.exit(fails === 0 ? 0 : 1);
