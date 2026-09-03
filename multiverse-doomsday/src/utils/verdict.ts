import { TIERS, type Tier } from '@/types';

/**
 * What the app says about you, in character.
 *
 * A percentage is a fact; a verdict is an opinion, and an opinion is what
 * makes people come back to look. Both functions here are pure and take a
 * plain snapshot, so what they say can be tested rather than eyeballed.
 */

export interface VerdictInput {
  percent: number;
  watched: number;
  total: number;
  streakDays: number;
  daysToDoomsday: number;
}

export interface Verdict {
  /** Two or three words. The headline. */
  rank: string;
  /** One or two sentences, addressed to you. */
  line: string;
}

/**
 * Doom's assessment. Contempt gives way to grudging acknowledgement and
 * finally to recognition — the tone has to move or the device is just a label.
 */
export function doomVerdict(input: VerdictInput): Verdict {
  const { percent, watched, total, streakDays, daysToDoomsday } = input;
  const remaining = total - watched;

  if (watched === 0) {
    return {
      rank: 'Unpruned',
      line: 'You have watched nothing. Doom does not know your name, and has no reason to learn it.',
    };
  }

  if (percent >= 100) {
    return {
      rank: 'Equal',
      line: 'Everything. You have seen everything. Doom acknowledges you — briefly, and without warmth.',
    };
  }

  if (percent >= 85) {
    return {
      rank: 'Prepared',
      line: `${remaining} left. You will finish. Doom expected nothing less, which is the closest thing to praise you will get.`,
    };
  }

  if (percent >= 60) {
    return {
      rank: 'Adequate',
      line: streakDays >= 3
        ? `${remaining} remain, and you are moving. Continue at this pace and you may arrive in time.`
        : `${remaining} remain. Adequate is not the same as ready.`,
    };
  }

  if (percent >= 35) {
    return {
      rank: 'Halfway to nothing',
      line: `${watched} watched, ${remaining} not. ${daysToDoomsday} days. Doom can do the arithmetic. So can you.`,
    };
  }

  if (percent >= 15) {
    return {
      rank: 'Barely begun',
      line: `${watched} of ${total}. You have made a start, which is more than most, which is not much.`,
    };
  }

  return {
    rank: 'Civilian',
    line: `${watched} watched. ${daysToDoomsday} days. Doom suggests you begin taking this seriously.`,
  };
}

/* ------------------------------------------------------------------ *
 * Variant identity
 * ------------------------------------------------------------------ */

export interface VariantInput {
  percent: number;
  /** Average of your given ratings, 0 when nothing is rated. */
  averageRating: number;
  ratedCount: number;
  tierCounts: Record<Tier, number>;
  streakDays: number;
  longestStreakDays: number;
  /** Distinct days on which anything was logged. */
  activeDays: number;
  watched: number;
}

export type VariantId =
  | 'unbranched'
  | 'incursion'
  | 'sacred'
  | 'believer'
  | 'kang'
  | 'generous'
  | 'pruner'
  | 'archivist'
  | 'nexus'
  | 'earth616';

export interface VariantProfile {
  id: VariantId;
  name: string;
  blurb: string;
  /** How you get this one, in plain words. Shown for the ones you are not. */
  unlock: string;
}

export interface Variant extends VariantProfile {
  /** Why you got this one — always references the data that decided it. */
  because: string;
}

/**
 * The roster, held separately from the classifier so the app can show you the
 * timelines you are *not*. Half the appeal of being told who you are is seeing
 * who else you could have been.
 */
export const VARIANT_ORDER: VariantId[] = [
  'incursion',
  'sacred',
  'believer',
  'kang',
  'generous',
  'pruner',
  'archivist',
  'nexus',
  'earth616',
  'unbranched',
];

export const VARIANTS: Record<VariantId, VariantProfile> = {
  unbranched: {
    id: 'unbranched',
    name: 'An unbranched timeline',
    blurb: 'You have not made a single choice the TVA would care about. That is about to change.',
    unlock: 'Log nothing at all.',
  },
  incursion: {
    id: 'incursion',
    name: 'An Incursion event',
    blurb: 'You do not watch things. You collide with them. Two universes enter, one weekend survives.',
    unlock: 'Log 9 or more titles across very few days.',
  },
  sacred: {
    id: 'sacred',
    name: 'The Sacred Timeline',
    blurb: 'Relentless, orderly, faintly terrifying. He Who Remains would have hired you.',
    unlock: 'Hold a 7-day streak.',
  },
  believer: {
    id: 'believer',
    name: 'A true believer variant',
    blurb: 'You have never met a Marvel film you did not defend. This is a personality, not a flaw.',
    unlock: 'Rate 10 titles, averaging 4.3 or above.',
  },
  kang: {
    id: 'kang',
    name: 'A Council of Kangs variant',
    blurb: 'Harsh, certain, and outnumbered only by other versions of yourself who agree.',
    unlock: 'Rate 10 titles, averaging 2.7 or below.',
  },
  generous: {
    id: 'generous',
    name: 'A generous variant',
    blurb: 'Your tier list is mostly a podium. Nobody has ever had a bad time watching a film with you.',
    unlock: 'Tier 10 titles with far more in S and A than in C and D.',
  },
  pruner: {
    id: 'pruner',
    name: 'A TVA pruner',
    blurb: 'You rank to condemn, not to celebrate. The Void is full of things you did not rate highly.',
    unlock: 'Tier 10 titles with more in C and D than above.',
  },
  archivist: {
    id: 'archivist',
    name: 'A Watcher variant',
    blurb: 'You have seen almost all of it and intervened in none of it. Uatu would understand.',
    unlock: 'Log 80% of the catalogue.',
  },
  nexus: {
    id: 'nexus',
    name: 'A nexus being',
    blurb: 'Enormous potential, barely realised. The multiverse is watching to see what you do next.',
    unlock: 'Log something, but less than a quarter of the catalogue.',
  },
  earth616: {
    id: 'earth616',
    name: 'Earth-616 baseline',
    blurb: 'The reference universe. Everyone else is measured against you, which is duller than it sounds.',
    unlock: 'Sit in the middle of everything. Harder than it sounds.',
  },
};

function variant(id: VariantId, because: string): Variant {
  return { ...VARIANTS[id], because };
}

/**
 * Which variant you are, derived rather than guessed.
 *
 * Every branch cites the numbers that produced it. A quiz that tells you
 * something about yourself only lands if you can see how it got there, and
 * these are the user's own numbers rather than answers to invented questions.
 */
export function variantFor(input: VariantInput): Variant {
  const { percent, averageRating, ratedCount, tierCounts, longestStreakDays, activeDays, watched } =
    input;

  const ranked = TIERS.reduce((sum, tier) => sum + tierCounts[tier], 0);
  const topHeavy = tierCounts.S + tierCounts.A;
  const bottomHeavy = tierCounts.C + tierCounts.D;

  if (watched === 0) return variant('unbranched', 'Nothing logged yet.');

  // Binge shape: a lot watched across very few days.
  if (activeDays > 0 && watched / activeDays >= 3 && watched >= 9) {
    return variant(
      'incursion',
      `${watched} titles across ${activeDays} ${activeDays === 1 ? 'day' : 'days'}.`,
    );
  }

  if (longestStreakDays >= 7) {
    return variant('sacred', `A ${longestStreakDays}-day streak.`);
  }

  if (ratedCount >= 10 && averageRating >= 4.3) {
    return variant('believer', `${ratedCount} rated, averaging ${averageRating.toFixed(1)}.`);
  }

  if (ratedCount >= 10 && averageRating <= 2.7) {
    return variant('kang', `${ratedCount} rated, averaging ${averageRating.toFixed(1)}.`);
  }

  if (ranked >= 10 && topHeavy > bottomHeavy * 3) {
    return variant('generous', `${topHeavy} titles in S and A, ${bottomHeavy} in C and D.`);
  }

  if (ranked >= 10 && bottomHeavy > topHeavy) {
    return variant('pruner', `${bottomHeavy} titles in C and D against ${topHeavy} above.`);
  }

  if (percent >= 80) return variant('archivist', `${percent}% logged.`);
  if (percent < 25) return variant('nexus', `${percent}% logged.`);

  return variant('earth616', `${percent}% logged, ${ranked} ranked.`);
}
