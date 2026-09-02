import { buildRound, QUESTIONS_PER_ROUND, type QuizQuestion } from '@/utils/quiz';
import charactersJson from '@/data/characters.json';
import moviesJson from '@/data/movies.json';
import postCreditsJson from '@/data/postCredits.json';

const MOVIES = moviesJson as any[];
const CHARACTERS = charactersJson as any[];
const PC = postCreditsJson as Record<string, any>;

let fails = 0;
const fail = (msg: string) => { console.log('FAIL ' + msg); fails += 1; };

/** Re-derives truth from source data and checks exactly one option is right. */
function checkAnswer(q: QuizQuestion) {
  const chosen = q.options[q.answerIndex];
  const countCorrect = (isCorrect: (opt: string) => boolean) =>
    q.options.filter(isCorrect).length;

  switch (q.kind) {
    case 'release-year': {
      const m = MOVIES.find((x) => x.title === q.subject);
      if (!m) return fail(`year: unknown subject ${q.subject}`);
      if (chosen !== String(m.releaseYear)) fail(`year: ${m.title} answer ${chosen} != ${m.releaseYear}`);
      if (countCorrect((o) => o === String(m.releaseYear)) !== 1) fail(`year: duplicate correct for ${m.title}`);
      break;
    }
    case 'actor': {
      const alias = (q.subject ?? '').split(' · ')[0];
      const c = CHARACTERS.find((x) => x.alias === alias);
      if (!c) return fail(`actor: unknown ${alias}`);
      if (chosen !== c.actor) fail(`actor: ${alias} answer ${chosen} != ${c.actor}`);
      if (countCorrect((o) => o === c.actor) !== 1) fail(`actor: duplicate correct for ${alias}`);
      break;
    }
    case 'affiliation': {
      const c = CHARACTERS.find((x) => x.alias === q.subject);
      if (!c) return fail(`affil: unknown ${q.subject}`);
      if (chosen !== c.affiliation) fail(`affil: ${q.subject} answer ${chosen} != ${c.affiliation}`);
      if (countCorrect((o) => o === c.affiliation) !== 1) fail(`affil: duplicate correct`);
      break;
    }
    case 'phase': {
      const m = MOVIES.find((x) => x.title === q.subject);
      if (!m) return fail(`phase: unknown ${q.subject}`);
      const want = typeof m.phase === 'number' ? `Phase ${m.phase}` : String(m.phase);
      if (chosen !== want) fail(`phase: ${m.title} answer ${chosen} != ${want}`);
      if (countCorrect((o) => o === want) !== 1) fail(`phase: duplicate correct`);
      break;
    }
    case 'debut': {
      const c = CHARACTERS.find((x) => x.alias === q.subject);
      if (!c) return fail(`debut: unknown ${q.subject}`);
      if (chosen !== c.mcuDebut) fail(`debut: ${q.subject} answer ${chosen} != ${c.mcuDebut}`);
      if (countCorrect((o) => o === c.mcuDebut) !== 1) fail(`debut: duplicate correct for ${q.subject}`);
      break;
    }
    case 'stinger': {
      const m = MOVIES.find((x) => x.title === q.subject);
      if (!m) return fail(`stinger: unknown ${q.subject}`);
      const n = PC[m.id].scenes.length;
      const want = n === 0 ? 'None' : n === 1 ? '1 scene' : `${n} scenes`;
      if (chosen !== want) fail(`stinger: ${m.title} answer ${chosen} != ${want}`);
      if (countCorrect((o) => o === want) !== 1) fail(`stinger: duplicate correct`);
      break;
    }
    case 'which-first': {
      const picked = q.options.map((t) => MOVIES.find((m) => m.title === t));
      if (picked.some((m) => !m)) return fail('which-first: unknown title in options');
      const minYear = Math.min(...picked.map((m: any) => m.releaseYear));
      const winners = picked.filter((m: any) => m.releaseYear === minYear);
      if (winners.length !== 1) fail(`which-first: ${winners.length} titles tie on ${minYear}`);
      if ((picked[q.answerIndex] as any).releaseYear !== minYear) fail('which-first: wrong answer index');
      break;
    }
  }
}

const ROUNDS = 400;
let totalQuestions = 0;
const kindCounts: Record<string, number> = {};

for (let seed = 1; seed <= ROUNDS; seed += 1) {
  const round = buildRound(seed);
  if (round.length !== QUESTIONS_PER_ROUND) fail(`seed ${seed}: got ${round.length} questions`);

  const ids = new Set<string>();
  for (const q of round) {
    totalQuestions += 1;
    kindCounts[q.kind] = (kindCounts[q.kind] ?? 0) + 1;

    if (ids.has(q.id)) fail(`seed ${seed}: duplicate question ${q.id}`);
    ids.add(q.id);

    if (q.options.length !== 4) fail(`seed ${seed}: ${q.id} has ${q.options.length} options`);
    if (new Set(q.options).size !== q.options.length) fail(`seed ${seed}: ${q.id} has duplicate options: ${JSON.stringify(q.options)}`);
    if (q.answerIndex < 0 || q.answerIndex >= q.options.length) fail(`seed ${seed}: ${q.id} bad answerIndex`);
    if (!q.explanation) fail(`seed ${seed}: ${q.id} missing explanation`);
    checkAnswer(q);
  }
}

// Determinism: same seed must give the same round.
const a = JSON.stringify(buildRound(42));
const b = JSON.stringify(buildRound(42));
if (a !== b) fail('same seed produced different rounds');
if (JSON.stringify(buildRound(1)) === JSON.stringify(buildRound(2))) fail('different seeds produced identical rounds');

// Answer position must not be predictable.
const positions = [0, 0, 0, 0];
for (let seed = 1; seed <= 300; seed += 1) for (const q of buildRound(seed)) positions[q.answerIndex] += 1;
const total = positions.reduce((s, n) => s + n, 0);
const skew = Math.max(...positions) / (total / 4);
if (skew > 1.25) fail(`answer position skewed: ${JSON.stringify(positions)}`);

console.log(`rounds=${ROUNDS} questions=${totalQuestions}`);
console.log('kinds:', JSON.stringify(kindCounts));
console.log('answer positions:', JSON.stringify(positions), 'skew', skew.toFixed(3));
console.log(fails === 0 ? '\nQUIZ OK' : `\n${fails} FAILURES`);
process.exit(fails ? 1 : 0);
