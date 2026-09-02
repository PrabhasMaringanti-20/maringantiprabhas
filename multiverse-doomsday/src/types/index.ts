/**
 * Multiverse Roadmap: Guide to Doomsday — core domain models.
 *
 * Everything the app renders is derived from these three primitives:
 *   MovieItem       — a watchable entry on the road to Avengers: Doomsday
 *   MarvelCharacter — a player in the Incursion / Secret Wars endgame
 *   RoadmapPath     — a curated lane through the catalogue
 */

export type PathTag =
  | 'express'
  | 'doom-f4'
  | 'xmen-incursions'
  | 'avengers'
  | 'completionist';

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D'];

export interface MovieItem {
  id: string;
  title: string;
  releaseYear: number;
  phase: number | string;
  type: 'movie' | 'series';
  tmdbId: number;
  runtimeMinutes: number;
  /** True for the Express path — the minimum viable Doomsday prep. */
  isCrucial: boolean;
  pathTags: PathTag[];
  /** 2-sentence spoiler-free context linking directly to Doomsday / Incursions. */
  whyItMatters: string;
  isWatched: boolean;
  /** 0 to 5 stars. 0 means "not rated yet". */
  userRating: number;
  tier?: Tier;
  /** Characters worth flagging on the detail screen. Ids index characters.json. */
  keyCharacterIds?: string[];
}

/** The immutable half of a movie — everything shipped in movies.json. */
export type MovieCatalogueItem = Omit<MovieItem, 'isWatched' | 'userRating' | 'tier'>;

/** Sort orders available on the roadmap feed. */
export type RoadmapOrder = 'release' | 'chronological' | 'runtime';

/** The mutable half — everything the user owns, persisted to AsyncStorage. */
export interface MovieProgress {
  isWatched: boolean;
  userRating: number;
  tier?: Tier;
  /** Epoch ms of the moment the entry was marked watched. Powers streaks + recents. */
  watchedAt?: number;
}

export type Affiliation =
  | 'Fantastic Four'
  | 'Avengers'
  | 'Doom Allegiance'
  | 'X-Men / Mutants'
  | 'Thunderbolts'
  | 'Cosmic';

export type CharacterStatus =
  | 'Active'
  | 'Incoming'
  | 'Variant'
  | 'Deceased'
  | 'Unknown';

export interface MarvelCharacter {
  id: string;
  /** Civilian / real name, e.g. "Victor Von Doom". */
  name: string;
  /** Codename, e.g. "Doctor Doom". */
  alias: string;
  actor: string;
  affiliation: Affiliation;
  status: CharacterStatus;
  mcuDebut: string;
  /** 3–4 bullet points on origins and Secret Wars comic lore. */
  comicBio: string[];
  powers: string[];
  /** Remote portrait URL. Empty string falls back to the generated emblem avatar. */
  avatarUrl: string;
  relatedMovieIds: string[];
}

export interface RoadmapPath {
  id: PathTag;
  label: string;
  tagline: string;
  /** Short blurb shown under the selector. */
  description: string;
  accent: 'doom' | 'infinity' | 'incursion';
}

/** Aggregate progress numbers rendered by the readiness dashboard. */
export interface ReadinessStats {
  total: number;
  watched: number;
  /** 0–100, rounded. */
  percent: number;
  minutesRemaining: number;
  minutesWatched: number;
  hoursRemaining: number;
  /** Next unwatched entry on the active path, if any. */
  nextUp?: MovieItem;
}

/* ------------------------------------------------------------------ *
 * TMDB
 * ------------------------------------------------------------------ */

export interface TmdbDetails {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  runtimeMinutes: number | null;
  voteAverage: number | null;
  releaseDate: string | null;
  tagline: string | null;
}

export type ProviderKind = 'flatrate' | 'rent' | 'buy' | 'ads' | 'free';

export interface StreamingProvider {
  providerId: number;
  providerName: string;
  logoPath: string | null;
  kind: ProviderKind;
}

export interface StreamingAvailability {
  region: string;
  /** JustWatch attribution link surfaced by TMDB's /watch/providers endpoint. */
  link: string | null;
  providers: StreamingProvider[];
}

export type AsyncState = 'idle' | 'loading' | 'success' | 'error';

/* ------------------------------------------------------------------ *
 * Post-credits scenes
 * ------------------------------------------------------------------ */

/** How much a stinger actually bears on Doomsday. Drives sorting and colour. */
export type StingerRelevance = 'direct' | 'thread' | 'none' | 'unreleased';

export interface PostCreditsScene {
  /** Mid-credits scenes land before the crawl ends; post-credits after it. */
  kind: 'mid' | 'post';
  summary: string;
  /** What the scene pays off — "Nothing" where it is purely a joke. */
  setsUp: string;
}

export interface PostCreditsEntry {
  relevance: StingerRelevance;
  scenes: PostCreditsScene[];
}
