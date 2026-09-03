import moviesJson from '@/data/movies.json';
import {
  BitReader,
  BitWriter,
  MAX_NAME_BYTES,
  encodeName,
  fromBase64Url,
  toBase64Url,
} from '@/utils/bitcode';
import { TIERS, type MovieCatalogueItem, type MovieProgress, type Tier } from '@/types';

/**
 * The catalogue is read straight from the bundled data rather than through the
 * store, so the codec has no dependency on React state and can be tested on
 * its own. Order here is the wire format — see the note on indices below.
 */
const MOVIE_CATALOGUE = moviesJson as MovieCatalogueItem[];

/**
 * Progress as a short, pasteable string.
 *
 * The whole point of this app is arguing with your friends, and there is no
 * server to argue through — so a person's board has to travel inside a message.
 * Seven bits per title (watched + tier + rating) over 68 titles is 60 bytes,
 * which lands around 90 characters of base64url once the name is attached.
 *
 * Encoding is by catalogue *index*, so a code is only meaningful against a
 * catalogue of the same shape. The header carries a version and a count, and
 * decoding refuses anything it cannot read rather than silently mangling it.
 */

const FORMAT_VERSION = 1;
const BITS_PER_TITLE = 7; // 1 watched, 3 tier (0 = none, 1-5), 3 rating (0-5)

export interface SharedBoard {
  name: string;
  /** Keyed by movie id, same shape the store persists. */
  progress: Record<string, MovieProgress>;
  /** Titles in the code that this build does not know about. */
  unknownCount: number;
}

/* ------------------------------------------------------------------ *
 * Encode / decode
 * ------------------------------------------------------------------ */

export function encodeBoard(
  name: string,
  progress: Record<string, MovieProgress>,
): string {
  const nameBytes = encodeName(name.trim());
  const count = MOVIE_CATALOGUE.length;

  const writer = new BitWriter();
  writer.write(FORMAT_VERSION, 8);
  writer.write(nameBytes.length, 8);
  for (const byte of nameBytes) writer.write(byte, 8);
  writer.write(count, 16);

  for (const movie of MOVIE_CATALOGUE) {
    const entry = progress[movie.id];
    const tierIndex = entry?.tier ? TIERS.indexOf(entry.tier) + 1 : 0;
    writer.write(entry?.isWatched ? 1 : 0, 1);
    writer.write(tierIndex, 3);
    writer.write(Math.max(0, Math.min(5, entry?.userRating ?? 0)), 3);
  }

  return toBase64Url(writer.finish());
}

export function decodeBoard(code: string): SharedBoard | null {
  const cleaned = code.trim().replace(/\s+/g, '');
  if (!cleaned) return null;

  const bytes = fromBase64Url(cleaned);
  if (!bytes || bytes.length < 4) return null;

  const reader = new BitReader(bytes);
  if (reader.read(8) !== FORMAT_VERSION) return null;

  const nameLength = reader.read(8);
  if (nameLength > MAX_NAME_BYTES) return null;
  let name = '';
  for (let i = 0; i < nameLength; i += 1) name += String.fromCharCode(reader.read(8));

  const count = reader.read(16);
  // A code claiming more titles than it carries bits for is corrupt.
  if (count === 0 || count > 500 || reader.remainingBits < count * BITS_PER_TITLE) return null;

  const progress: Record<string, MovieProgress> = {};
  let unknownCount = 0;

  for (let index = 0; index < count; index += 1) {
    const isWatched = reader.read(1) === 1;
    const tierIndex = reader.read(3);
    const userRating = reader.read(3);

    const movie = MOVIE_CATALOGUE[index];
    if (!movie) {
      // Their catalogue is longer than ours — they are on a newer build.
      unknownCount += 1;
      continue;
    }
    if (!isWatched && tierIndex === 0 && userRating === 0) continue;

    progress[movie.id] = {
      isWatched,
      userRating: Math.min(5, userRating),
      tier: tierIndex > 0 ? (TIERS[tierIndex - 1] as Tier) : undefined,
    };
  }

  return { name: name.trim(), progress, unknownCount };
}

/* ------------------------------------------------------------------ *
 * Comparison
 * ------------------------------------------------------------------ */

export interface TierDisagreement {
  movieId: string;
  title: string;
  yours: Tier;
  theirs: Tier;
  /** How far apart, in tier steps. Sorting by this puts real fights first. */
  distance: number;
}

export interface BoardComparison {
  yourWatched: number;
  theirWatched: number;
  total: number;
  /** Titles they have seen and you have not. */
  theyveSeen: { id: string; title: string }[];
  /** Titles you have seen and they have not. */
  youveSeen: { id: string; title: string }[];
  bothSeen: number;
  disagreements: TierDisagreement[];
}

export function compareBoards(
  yours: Record<string, MovieProgress>,
  theirs: Record<string, MovieProgress>,
): BoardComparison {
  const theyveSeen: { id: string; title: string }[] = [];
  const youveSeen: { id: string; title: string }[] = [];
  const disagreements: TierDisagreement[] = [];

  let yourWatched = 0;
  let theirWatched = 0;
  let bothSeen = 0;

  for (const movie of MOVIE_CATALOGUE) {
    const mine = yours[movie.id];
    const theirEntry = theirs[movie.id];
    const iSaw = Boolean(mine?.isWatched);
    const theySaw = Boolean(theirEntry?.isWatched);

    if (iSaw) yourWatched += 1;
    if (theySaw) theirWatched += 1;
    if (iSaw && theySaw) bothSeen += 1;
    if (theySaw && !iSaw) theyveSeen.push({ id: movie.id, title: movie.title });
    if (iSaw && !theySaw) youveSeen.push({ id: movie.id, title: movie.title });

    if (mine?.tier && theirEntry?.tier && mine.tier !== theirEntry.tier) {
      disagreements.push({
        movieId: movie.id,
        title: movie.title,
        yours: mine.tier,
        theirs: theirEntry.tier,
        distance: Math.abs(TIERS.indexOf(mine.tier) - TIERS.indexOf(theirEntry.tier)),
      });
    }
  }

  disagreements.sort((a, b) => b.distance - a.distance);

  return {
    yourWatched,
    theirWatched,
    total: MOVIE_CATALOGUE.length,
    theyveSeen,
    youveSeen,
    bothSeen,
    disagreements,
  };
}
