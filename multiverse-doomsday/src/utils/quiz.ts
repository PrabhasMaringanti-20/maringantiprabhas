import charactersJson from '@/data/characters.json';
import moviesJson from '@/data/movies.json';
import postCreditsJson from '@/data/postCredits.json';
import type {
  MarvelCharacter,
  MovieCatalogueItem,
  PostCreditsEntry,
} from '@/types';

const MOVIES = moviesJson as MovieCatalogueItem[];
const CHARACTERS = charactersJson as MarvelCharacter[];
const POST_CREDITS = postCreditsJson as Record<string, PostCreditsEntry>;

export type QuestionKind =
  | 'release-year'
  | 'actor'
  | 'affiliation'
  | 'which-first'
  | 'phase'
  | 'stinger'
  | 'debut';

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  /** Extra context shown under the prompt, e.g. the title being asked about. */
  subject?: string;
  options: string[];
  answerIndex: number;
  /** Shown after answering — always says why, never just "correct". */
  explanation: string;
}

/* ------------------------------------------------------------------ *
 * Deterministic shuffling
 *
 * A seeded generator, so a round can be replayed and — more importantly —
 * tested. Math.random would make the generator impossible to assert on.
 * ------------------------------------------------------------------ */

export function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return () => {
    // xorshift32
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Distinct *option values* drawn from a pool of records.
 *
 * De-duplicating the records is not enough: several characters share a debut
 * film, and several share an actor, so filtering by record identity happily
 * produced the same string three times in one question.
 */
function distinctValues<T>(
  pool: T[],
  valueOf: (item: T) => string,
  correct: string,
  count: number,
  random: () => number,
): string[] {
  const seen = new Set<string>([correct]);
  const values: string[] = [];

  for (const item of shuffle(pool, random)) {
    const value = valueOf(item);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    values.push(value);
    if (values.length === count) break;
  }
  return values;
}

/** Places the answer at a random index and reports where it landed. */
function assemble(correct: string, distractors: string[], random: () => number) {
  const options = shuffle([correct, ...distractors], random);
  return { options, answerIndex: options.indexOf(correct) };
}

/* ------------------------------------------------------------------ *
 * Question builders
 * ------------------------------------------------------------------ */

type Builder = (random: () => number) => QuizQuestion | null;

const releaseYear: Builder = (random) => {
  const movie = shuffle(MOVIES, random)[0];
  if (!movie) return null;

  // Distractor years hug the real one, so the question tests knowledge
  // rather than the ability to spot an absurd outlier.
  const offsets = shuffle([-3, -2, -1, 1, 2, 3], random).slice(0, 3);
  const years = offsets.map((offset) => String(movie.releaseYear + offset));

  const { options, answerIndex } = assemble(String(movie.releaseYear), years, random);
  return {
    id: `year-${movie.id}`,
    kind: 'release-year',
    prompt: 'What year did this release?',
    subject: movie.title,
    options,
    answerIndex,
    explanation: `${movie.title} released in ${movie.releaseYear}.`,
  };
};

const actorFor: Builder = (random) => {
  const pool = CHARACTERS.filter((c) => c.actor && c.actor !== 'TBA');
  const character = shuffle(pool, random)[0];
  if (!character) return null;

  const others = distinctValues(pool, (c) => c.actor, character.actor, 3, random);
  if (others.length < 3) return null;

  const { options, answerIndex } = assemble(character.actor, others, random);
  return {
    id: `actor-${character.id}`,
    kind: 'actor',
    prompt: 'Who plays this character?',
    subject: `${character.alias} · ${character.name}`,
    options,
    answerIndex,
    explanation: `${character.alias} is played by ${character.actor}.`,
  };
};

const affiliationFor: Builder = (random) => {
  const character = shuffle(CHARACTERS, random)[0];
  if (!character) return null;

  const all = [...new Set(CHARACTERS.map((c) => c.affiliation))];
  const others = shuffle(all.filter((a) => a !== character.affiliation), random).slice(0, 3);
  if (others.length < 3) return null;

  const { options, answerIndex } = assemble(character.affiliation, others, random);
  return {
    id: `affil-${character.id}`,
    kind: 'affiliation',
    prompt: 'Where does this character stand?',
    subject: character.alias,
    options,
    answerIndex,
    explanation: `${character.alias} is aligned with ${character.affiliation}.`,
  };
};

const whichCameFirst: Builder = (random) => {
  const picks = shuffle(MOVIES, random).slice(0, 4);
  if (picks.length < 4) return null;

  // Ties on year would make more than one option correct.
  const years = new Set(picks.map((m) => m.releaseYear));
  if (years.size !== picks.length) return null;

  const earliest = picks.reduce((a, b) => (a.releaseYear <= b.releaseYear ? a : b));
  const options = picks.map((m) => m.title);
  return {
    id: `first-${picks.map((m) => m.id).join('-')}`,
    kind: 'which-first',
    prompt: 'Which of these came out first?',
    options,
    answerIndex: options.indexOf(earliest.title),
    explanation: `${earliest.title} (${earliest.releaseYear}) came first.`,
  };
};

const phaseFor: Builder = (random) => {
  const pool = MOVIES.filter((m) => typeof m.phase === 'number');
  const movie = shuffle(pool, random)[0];
  if (!movie) return null;

  const label = (phase: number | string) => (typeof phase === 'number' ? `Phase ${phase}` : String(phase));
  const all = [...new Set(pool.map((m) => m.phase))];
  const others = shuffle(all.filter((p) => p !== movie.phase), random).slice(0, 3).map(label);
  if (others.length < 3) return null;

  const { options, answerIndex } = assemble(label(movie.phase), others, random);
  return {
    id: `phase-${movie.id}`,
    kind: 'phase',
    prompt: 'Which phase does this belong to?',
    subject: movie.title,
    options,
    answerIndex,
    explanation: `${movie.title} is ${label(movie.phase)}.`,
  };
};

const stingerCount: Builder = (random) => {
  const pool = MOVIES.filter((m) => {
    const entry = POST_CREDITS[m.id];
    return entry && entry.relevance !== 'unreleased';
  });
  const movie = shuffle(pool, random)[0];
  if (!movie) return null;

  const count = POST_CREDITS[movie.id].scenes.length;
  const others = shuffle([0, 1, 2, 3].filter((n) => n !== count), random).slice(0, 3);
  const label = (n: number) => (n === 0 ? 'None' : n === 1 ? '1 scene' : `${n} scenes`);

  const { options, answerIndex } = assemble(label(count), others.map(label), random);
  return {
    id: `sting-${movie.id}`,
    kind: 'stinger',
    prompt: 'How many credits scenes does it have?',
    subject: movie.title,
    options,
    answerIndex,
    explanation:
      count === 0
        ? `${movie.title} has no credits scene at all.`
        : `${movie.title} has ${count} — mid- and post-credits combined.`,
  };
};

const debutFor: Builder = (random) => {
  const pool = CHARACTERS.filter((c) => c.mcuDebut);
  const character = shuffle(pool, random)[0];
  if (!character) return null;

  const others = distinctValues(pool, (c) => c.mcuDebut, character.mcuDebut, 3, random);
  if (others.length < 3) return null;

  const { options, answerIndex } = assemble(character.mcuDebut, others, random);
  return {
    id: `debut-${character.id}`,
    kind: 'debut',
    prompt: 'Where did this character first appear?',
    subject: character.alias,
    options,
    answerIndex,
    explanation: `${character.alias} debuted in ${character.mcuDebut}.`,
  };
};

const BUILDERS: Builder[] = [
  releaseYear,
  actorFor,
  affiliationFor,
  whichCameFirst,
  phaseFor,
  stingerCount,
  debutFor,
];

export const QUESTIONS_PER_ROUND = 10;

/**
 * Builds one round.
 *
 * Rotates through the builders so a round is varied rather than ten year
 * questions, and refuses to emit the same question twice. Builders return null
 * when the data cannot support a fair question, so generation retries rather
 * than shipping something with two correct answers.
 */
export function buildRound(seed: number, count = QUESTIONS_PER_ROUND): QuizQuestion[] {
  const random = makeRandom(seed);
  const questions: QuizQuestion[] = [];
  const seen = new Set<string>();

  let builderIndex = Math.floor(random() * BUILDERS.length);
  let attempts = 0;

  while (questions.length < count && attempts < count * 40) {
    attempts += 1;
    const builder = BUILDERS[builderIndex % BUILDERS.length];
    builderIndex += 1;

    const question = builder(random);
    if (!question || seen.has(question.id)) continue;
    seen.add(question.id);
    questions.push(question);
  }

  return questions;
}

export function gradeLabel(score: number, total: number): { title: string; blurb: string } {
  const percent = total ? (score / total) * 100 : 0;
  if (percent === 100) return { title: 'Doom himself', blurb: 'Perfect round. Nothing left to teach you.' };
  if (percent >= 80) return { title: 'Illuminati', blurb: 'You have been paying attention.' };
  if (percent >= 60) return { title: 'Avenger', blurb: 'Solid. A rewatch would close the gaps.' };
  if (percent >= 40) return { title: 'Field agent', blurb: 'You know the shape of it, not the detail.' };
  return { title: 'Unpruned civilian', blurb: 'Start the roadmap. That is what it is for.' };
}
