/**
 * The Incursion.
 *
 * Two universes touching is not a leaderboard — it is an event with a
 * survivor and a casualty list. The comparison already knows who has seen
 * what; this turns it into an outcome you can send to someone.
 *
 * Pure and given plain numbers, so what it declares can be tested rather
 * than argued with. (The arguing is the user's job.)
 */

export interface IncursionInput {
  yourName: string;
  theirName: string;
  yourWatched: number;
  theirWatched: number;
  total: number;
  /** Titles you have both seen — the ground the collision happens on. */
  bothSeen: number;
  /** Titles only you have seen. */
  onlyYours: number;
  /** Titles only they have seen. */
  onlyTheirs: number;
  /** Titles you have both tiered, differently. */
  disagreements: number;
}

export type Survivor = 'yours' | 'theirs' | 'neither';

export interface IncursionResult {
  survivor: Survivor;
  yourPercent: number;
  theirPercent: number;
  /** Titles between you, always positive. Zero means annihilation. */
  margin: number;
  /** Three or four words. The result. */
  headline: string;
  /** One or two sentences, in character. */
  line: string;
  /** Titles that only existed in the universe that lost. */
  casualties: number;
  /** A single line to paste into the group chat. */
  shareLine: string;
}

function percent(watched: number, total: number): number {
  return total > 0 ? Math.round((watched / total) * 100) : 0;
}

export function incursion(input: IncursionInput): IncursionResult {
  const {
    yourName,
    theirName,
    yourWatched,
    theirWatched,
    total,
    bothSeen,
    onlyYours,
    onlyTheirs,
    disagreements,
  } = input;

  const you = yourName.trim() || 'Your universe';
  const them = theirName.trim() || 'Theirs';

  const yourPercent = percent(yourWatched, total);
  const theirPercent = percent(theirWatched, total);
  const margin = Math.abs(yourWatched - theirWatched);

  const survivor: Survivor =
    yourWatched > theirWatched ? 'yours' : theirWatched > yourWatched ? 'theirs' : 'neither';
  const casualties = survivor === 'yours' ? onlyTheirs : survivor === 'theirs' ? onlyYours : 0;

  // Two universes that have seen nothing have nothing to collide with.
  if (yourWatched === 0 && theirWatched === 0) {
    return {
      survivor: 'neither',
      yourPercent,
      theirPercent,
      margin: 0,
      headline: 'Nothing to collide',
      line: 'Neither universe has anything in it yet. Log something and try again.',
      casualties: 0,
      shareLine: 'Two empty universes. Nothing happened.',
    };
  }

  if (survivor === 'neither') {
    return {
      survivor,
      yourPercent,
      theirPercent,
      margin: 0,
      headline: 'Mutual annihilation',
      line: `Dead level at ${yourWatched} apiece. Both universes are destroyed, which is canon and no comfort.`,
      casualties: onlyYours + onlyTheirs,
      shareLine: `${you} and ${them} tied at ${yourWatched}. Both universes destroyed.`,
    };
  }

  const winner = survivor === 'yours' ? you : them;
  const loser = survivor === 'yours' ? them : you;
  const decisive = margin >= 10;
  const narrow = margin <= 2;

  const headline = narrow
    ? survivor === 'yours'
      ? 'You hold, barely'
      : 'You are overrun'
    : decisive
      ? survivor === 'yours'
        ? 'Their universe is gone'
        : 'Your universe is gone'
      : survivor === 'yours'
        ? 'You survive'
        : 'They survive';

  const contested = bothSeen > 0
    ? ` ${bothSeen} titles existed in both${disagreements > 0 ? `, and you rank ${disagreements} of them differently` : ''}.`
    : '';

  const line = narrow
    ? `${margin} ${margin === 1 ? 'title' : 'titles'} decided it. ${winner} survives on a margin nobody should be proud of.${contested}`
    : `${winner} survives by ${margin}. ${casualties > 0 ? `${casualties} ${casualties === 1 ? 'title' : 'titles'} existed only in ${loser} and ${casualties === 1 ? 'is' : 'are'} gone with it.` : `${loser} had nothing of its own to lose.`}${contested}`;

  return {
    survivor,
    yourPercent,
    theirPercent,
    margin,
    headline,
    line,
    casualties,
    shareLine: `Incursion: ${winner} survived by ${margin}. ${loser} is gone.`,
  };
}
