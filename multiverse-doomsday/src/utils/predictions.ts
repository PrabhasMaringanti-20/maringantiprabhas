import predictionsJson from '@/data/predictions.json';
import {
  BitReader,
  BitWriter,
  MAX_NAME_BYTES,
  encodeName,
  fromBase64Url,
  toBase64Url,
} from '@/utils/bitcode';

/**
 * The casting court.
 *
 * Twelve arguable questions about Doomsday, locked in before release and
 * settled by the film itself. The point is not the questions — it is that a
 * ballot fits in a chat message, so a group can compare positions now and
 * score them on 18 December without anyone hosting anything.
 *
 * The answer key ships empty and is filled in by an app update after release.
 * Everything here is pure so the codec and the scoring can be tested directly.
 */

export interface PredictionOption {
  id: string;
  label: string;
}

export interface PredictionQuestion {
  id: string;
  question: string;
  /** Why this is arguable. Shown under the question, never a spoiler. */
  note: string;
  options: PredictionOption[];
}

export const PREDICTIONS = predictionsJson as PredictionQuestion[];

/**
 * How the film actually resolved each question, keyed by question id.
 *
 * Empty until Doomsday is out; an update fills it in and every ballot already
 * on every phone scores itself. Nothing needs to be re-entered.
 */
export const ANSWER_KEY: Record<string, string> = {};

/** Keyed by question id → chosen option id. Missing means unanswered. */
export type Ballot = Record<string, string>;

const FORMAT_VERSION = 1;
/** 0 means unanswered, 1-7 index into the options. Four options today, room to grow. */
const BITS_PER_ANSWER = 3;
const MAX_OPTIONS = (1 << BITS_PER_ANSWER) - 1;

export interface SharedBallot {
  name: string;
  ballot: Ballot;
  /** Questions in the code this build does not have. They are on a newer version. */
  unknownCount: number;
}

/* ------------------------------------------------------------------ *
 * Encode / decode
 * ------------------------------------------------------------------ */

export function encodeBallot(name: string, ballot: Ballot): string {
  const nameBytes = encodeName(name.trim());

  const writer = new BitWriter();
  writer.write(FORMAT_VERSION, 8);
  writer.write(nameBytes.length, 8);
  for (const byte of nameBytes) writer.write(byte, 8);
  writer.write(PREDICTIONS.length, 8);

  for (const question of PREDICTIONS) {
    const index = question.options.findIndex((option) => option.id === ballot[question.id]);
    // An option beyond what the format can carry is written as unanswered
    // rather than wrapping around into a different, wrong answer.
    writer.write(index >= 0 && index < MAX_OPTIONS ? index + 1 : 0, BITS_PER_ANSWER);
  }

  return toBase64Url(writer.finish());
}

export function decodeBallot(code: string): SharedBallot | null {
  const cleaned = code.trim().replace(/\s+/g, '');
  if (!cleaned) return null;

  const bytes = fromBase64Url(cleaned);
  if (!bytes || bytes.length < 3) return null;

  const reader = new BitReader(bytes);
  if (reader.read(8) !== FORMAT_VERSION) return null;

  const nameLength = reader.read(8);
  if (nameLength > MAX_NAME_BYTES) return null;
  let name = '';
  for (let i = 0; i < nameLength; i += 1) name += String.fromCharCode(reader.read(8));

  const count = reader.read(8);
  if (count === 0 || count > 100 || reader.remainingBits < count * BITS_PER_ANSWER) return null;

  const ballot: Ballot = {};
  let unknownCount = 0;

  for (let index = 0; index < count; index += 1) {
    const answer = reader.read(BITS_PER_ANSWER);
    const question = PREDICTIONS[index];
    if (!question) {
      unknownCount += 1;
      continue;
    }
    if (answer === 0) continue;
    const option = question.options[answer - 1];
    // A code pointing at an option this build does not have is dropped, not guessed.
    if (option) ballot[question.id] = option.id;
  }

  return { name: name.trim(), ballot, unknownCount };
}

/* ------------------------------------------------------------------ *
 * Comparison
 * ------------------------------------------------------------------ */

export interface BallotLine {
  questionId: string;
  question: string;
  yours?: string;
  theirs?: string;
  /** Both answered and picked the same option. */
  agree: boolean;
  /** Both answered and picked differently — the arguments worth having. */
  clash: boolean;
}

export interface BallotComparison {
  lines: BallotLine[];
  agreed: number;
  clashed: number;
  /** Questions where at least one of you did not commit. */
  incomplete: number;
  total: number;
  /** 0–100 across the questions you both answered; 0 when there are none. */
  agreementPercent: number;
}

function labelOf(question: PredictionQuestion, optionId?: string): string | undefined {
  if (!optionId) return undefined;
  return question.options.find((option) => option.id === optionId)?.label;
}

export function compareBallots(yours: Ballot, theirs: Ballot): BallotComparison {
  const lines: BallotLine[] = [];
  let agreed = 0;
  let clashed = 0;
  let incomplete = 0;

  for (const question of PREDICTIONS) {
    const mine = yours[question.id];
    const theirPick = theirs[question.id];
    const both = Boolean(mine && theirPick);
    const agree = both && mine === theirPick;
    const clash = both && mine !== theirPick;

    if (agree) agreed += 1;
    else if (clash) clashed += 1;
    else incomplete += 1;

    lines.push({
      questionId: question.id,
      question: question.question,
      yours: labelOf(question, mine),
      theirs: labelOf(question, theirPick),
      agree,
      clash,
    });
  }

  // Clashes first: the disagreements are the reason anyone swaps codes.
  lines.sort((a, b) => Number(b.clash) - Number(a.clash));

  const compared = agreed + clashed;
  return {
    lines,
    agreed,
    clashed,
    incomplete,
    total: PREDICTIONS.length,
    agreementPercent: compared ? Math.round((agreed / compared) * 100) : 0,
  };
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

export interface BallotScore {
  answered: number;
  /** How many questions the answer key has settled. Zero before release. */
  settled: number;
  correct: number;
  /** 0–100 across settled questions you answered; 0 when there are none. */
  percent: number;
  /** True once the key covers every question. */
  complete: boolean;
}

export function scoreBallot(ballot: Ballot, key: Record<string, string> = ANSWER_KEY): BallotScore {
  let answered = 0;
  let settled = 0;
  let correct = 0;
  let judged = 0;

  for (const question of PREDICTIONS) {
    const mine = ballot[question.id];
    const truth = key[question.id];
    if (mine) answered += 1;
    if (!truth) continue;
    settled += 1;
    if (!mine) continue;
    judged += 1;
    if (mine === truth) correct += 1;
  }

  return {
    answered,
    settled,
    correct,
    percent: judged ? Math.round((correct / judged) * 100) : 0,
    complete: settled === PREDICTIONS.length && settled > 0,
  };
}
