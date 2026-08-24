import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  StreamingAvailability,
  StreamingProvider,
  TmdbDetails,
  ProviderKind,
} from '@/types';

const BASE_URL = 'https://api.themoviedb.org/3';
const CACHE_PREFIX = 'tmdb-cache:';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // one week — posters do not move

export const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';
export const TMDB_REGION = process.env.EXPO_PUBLIC_TMDB_REGION ?? 'US';

/** The whole app degrades gracefully when this is false. */
export const hasTmdbKey = TMDB_API_KEY.length > 0;

type CacheEnvelope<T> = { at: number; data: T };

/** Requests in flight, so twenty timeline nodes mounting at once make one call each. */
const inflight = new Map<string, Promise<unknown>>();
const memoryCache = new Map<string, CacheEnvelope<unknown>>();

async function readCache<T>(key: string): Promise<T | null> {
  const mem = memoryCache.get(key) as CacheEnvelope<T> | undefined;
  if (mem && Date.now() - mem.at < CACHE_TTL_MS) return mem.data;

  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    memoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  const envelope: CacheEnvelope<T> = { at: Date.now(), data };
  memoryCache.set(key, envelope);
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(envelope));
  } catch {
    // A full disk must never break rendering.
  }
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!hasTmdbKey) return null;

  const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...params }).toString();
  const cacheKey = `${path}?${new URLSearchParams(params).toString()}`;

  const cached = await readCache<T>(cacheKey);
  if (cached) return cached;

  const pending = inflight.get(cacheKey) as Promise<T | null> | undefined;
  if (pending) return pending;

  const promise = (async (): Promise<T | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(`${BASE_URL}${path}?${query}`, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });
      clearTimeout(timeout);
      if (!response.ok) return null;
      const json = (await response.json()) as T;
      await writeCache(cacheKey, json);
      return json;
    } catch {
      return null; // offline-first: callers fall back to bundled data
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, promise);
  return promise;
}

interface RawMovie {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_episodes?: number;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  tagline?: string | null;
}

/* ------------------------------------------------------------------ *
 * Id resolution
 *
 * Bundled tmdbIds are curated by hand, so an occasional one is wrong or goes
 * stale. Rather than trust them blindly we verify the title and year, and fall
 * back to a title search when they disagree. The corrected id is cached, so a
 * bad id self-heals after one extra request.
 * ------------------------------------------------------------------ */

const RESOLVED_ID_PREFIX = 'resolved-id:';

export interface TmdbLookup {
  /** Catalogue id — the cache key for the resolved TMDB id. */
  id: string;
  title: string;
  tmdbId: number;
  type: 'movie' | 'series';
  releaseYear: number;
}

/** "Loki — Season 2" → "loki" · "The Marvels" → "marvels" */
function normaliseTitle(title: string): string {
  return title
    .split(/[\u2014\u2013-]\s*Season/i)[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^(the|a)\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titlesMatch(a: string, b: string): boolean {
  const left = normaliseTitle(a);
  const right = normaliseTitle(b);
  if (!left || !right) return false;
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function yearOf(dateString: string | null | undefined): number | null {
  const year = Number(dateString?.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
}

async function searchByTitle(entry: TmdbLookup): Promise<number | null> {
  const segment = entry.type === 'series' ? 'tv' : 'movie';
  const raw = await request<{ results?: RawMovie[] }>(`/search/${segment}`, {
    query: normaliseTitle(entry.title),
    include_adult: 'false',
  });
  const results = raw?.results ?? [];
  if (results.length === 0) return null;

  // Prefer an exact title match in the right year, then title alone, then
  // whatever TMDB ranked first.
  const scored = results.map((result) => {
    const title = result.title ?? result.name ?? '';
    const year = yearOf(result.release_date ?? result.first_air_date);
    return {
      id: result.id,
      score:
        (titlesMatch(title, entry.title) ? 2 : 0) +
        (year && Math.abs(year - entry.releaseYear) <= 1 ? 1 : 0),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].id : results[0].id;
}

/**
 * The TMDB id to actually use for an entry: the bundled one when it checks out,
 * otherwise whatever a title search finds.
 */
export async function resolveTmdbId(entry: TmdbLookup): Promise<number | null> {
  if (!hasTmdbKey) return null;

  const cacheKey = RESOLVED_ID_PREFIX + entry.id;
  const cached = await readCache<number>(cacheKey);
  if (cached) return cached;

  const segment = entry.type === 'series' ? 'tv' : 'movie';
  const candidate = await request<RawMovie>(`/${segment}/${entry.tmdbId}`);

  const candidateTitle = candidate?.title ?? candidate?.name ?? '';
  const candidateYear = yearOf(candidate?.release_date ?? candidate?.first_air_date);
  const looksRight =
    !!candidate &&
    titlesMatch(candidateTitle, entry.title) &&
    (candidateYear === null || Math.abs(candidateYear - entry.releaseYear) <= 1);

  const resolved = looksRight ? entry.tmdbId : await searchByTitle(entry);
  if (resolved) await writeCache(cacheKey, resolved);
  return resolved;
}

/* ------------------------------------------------------------------ *
 * Details
 * ------------------------------------------------------------------ */


export async function fetchDetails(entry: TmdbLookup): Promise<TmdbDetails | null> {
  const type = entry.type;
  const tmdbId = await resolveTmdbId(entry);
  if (!tmdbId) return null;

  const segment = type === 'series' ? 'tv' : 'movie';
  const raw = await request<RawMovie>(`/${segment}/${tmdbId}`);
  if (!raw) return null;

  const episodeRuntime = raw.episode_run_time?.[0] ?? null;
  const seriesRuntime =
    episodeRuntime && raw.number_of_episodes ? episodeRuntime * raw.number_of_episodes : episodeRuntime;

  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? '',
    overview: raw.overview ?? '',
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    runtimeMinutes: type === 'series' ? seriesRuntime : (raw.runtime ?? null),
    voteAverage: typeof raw.vote_average === 'number' ? raw.vote_average : null,
    releaseDate: raw.release_date ?? raw.first_air_date ?? null,
    tagline: raw.tagline ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * Where to stream (TMDB's JustWatch-powered endpoint)
 * ------------------------------------------------------------------ */

interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

interface RawRegionProviders {
  link?: string;
  flatrate?: RawProvider[];
  rent?: RawProvider[];
  buy?: RawProvider[];
  ads?: RawProvider[];
  free?: RawProvider[];
}

const PROVIDER_KINDS: ProviderKind[] = ['flatrate', 'free', 'ads', 'rent', 'buy'];

export async function fetchStreamingProviders(
  entry: TmdbLookup,
  region: string = TMDB_REGION,
): Promise<StreamingAvailability | null> {
  const tmdbId = await resolveTmdbId(entry);
  if (!tmdbId) return null;

  const segment = entry.type === 'series' ? 'tv' : 'movie';
  const raw = await request<{ results?: Record<string, RawRegionProviders> }>(
    `/${segment}/${tmdbId}/watch/providers`,
  );
  if (!raw?.results) return null;

  const regionData = raw.results[region] ?? raw.results.US;
  if (!regionData) return { region, link: null, providers: [] };

  const seen = new Set<number>();
  const providers: StreamingProvider[] = [];

  for (const kind of PROVIDER_KINDS) {
    for (const provider of regionData[kind] ?? []) {
      if (seen.has(provider.provider_id)) continue;
      seen.add(provider.provider_id);
      providers.push({
        providerId: provider.provider_id,
        providerName: provider.provider_name,
        logoPath: provider.logo_path ?? null,
        kind,
      });
    }
  }

  return {
    region: raw.results[region] ? region : 'US',
    link: regionData.link ?? null,
    providers,
  };
}

/* ------------------------------------------------------------------ *
 * Actor headshots for the Character Vault
 * ------------------------------------------------------------------ */

interface RawPerson {
  id: number;
  name: string;
  profile_path?: string | null;
  popularity?: number;
}

/** Resolves an actor headshot path. Multi-name credits ("A / B") use the first name. */
export async function fetchActorProfilePath(actorName: string): Promise<string | null> {
  const primary = actorName.split('/')[0].trim();
  if (!primary || primary === 'TBA') return null;

  const raw = await request<{ results?: RawPerson[] }>('/search/person', {
    query: primary,
    include_adult: 'false',
  });

  const match = raw?.results?.find((person) => person.profile_path);
  return match?.profile_path ?? null;
}

/** Wipes cached TMDB payloads (Settings → "Clear image cache"). */
export async function clearTmdbCache(): Promise<void> {
  memoryCache.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (ours.length) await AsyncStorage.removeMany(ours);
  } catch {
    // ignore
  }
}
