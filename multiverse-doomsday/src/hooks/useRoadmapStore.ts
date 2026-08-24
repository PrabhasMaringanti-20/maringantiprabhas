import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import charactersJson from '@/data/characters.json';
import moviesJson from '@/data/movies.json';
import { computeReadiness } from '@/utils/timeCalc';
import type {
  MarvelCharacter,
  MovieCatalogueItem,
  MovieItem,
  MovieProgress,
  PathTag,
  ReadinessStats,
  RoadmapPath,
  Tier,
} from '@/types';

/* ------------------------------------------------------------------ *
 * Static catalogue (bundled, never mutated)
 * ------------------------------------------------------------------ */

export const MOVIE_CATALOGUE = moviesJson as MovieCatalogueItem[];
export const CHARACTER_CATALOGUE = charactersJson as MarvelCharacter[];

export const ROADMAP_PATHS: RoadmapPath[] = [
  {
    id: 'express',
    label: 'Express',
    tagline: 'The 9 essentials',
    description:
      'The shortest honest route. Nine titles that carry every rule, grudge and Incursion you need before Doomsday.',
    accent: 'doom',
  },
  {
    id: 'doom-f4',
    label: 'Doom & F4 Lore',
    tagline: "Marvel's First Family",
    description:
      'Everything feeding Victor Von Doom, the Fantastic Four and the cosmic scale they operate at.',
    accent: 'infinity',
  },
  {
    id: 'xmen-incursions',
    label: 'Mutants & Incursions',
    tagline: 'The Fox legacy',
    description:
      'The dying timeline next door: legacy X-Men, anchor beings and the collisions that follow.',
    accent: 'incursion',
  },
  {
    id: 'avengers',
    label: 'The New Avengers',
    tagline: "Who's left standing",
    description:
      'The roster forming right now — the shield-bearers, the Thunderbolts and the vacuum they fill.',
    accent: 'doom',
  },
  {
    id: 'completionist',
    label: 'Completionist',
    tagline: 'Everything, in order',
    description:
      'The full run in release order. No shortcuts, no gaps, about eight and a half days of screen time.',
    accent: 'infinity',
  },
];

/* ------------------------------------------------------------------ *
 * Store
 * ------------------------------------------------------------------ */

interface RoadmapState {
  /** Per-movie user data, keyed by movie id. */
  progress: Record<string, MovieProgress>;
  activePath: PathTag;
  /** Set from the Character Vault's "Key Appearances" action. */
  characterFilterId: string | null;
  hydrated: boolean;

  setActivePath: (path: PathTag) => void;
  toggleWatched: (movieId: string) => boolean;
  setWatched: (movieId: string, watched: boolean) => void;
  setRating: (movieId: string, rating: number) => void;
  setTier: (movieId: string, tier: Tier | undefined) => void;
  setCharacterFilter: (characterId: string | null) => void;
  markPathWatched: (path: PathTag, watched: boolean) => void;
  resetProgress: () => void;
}

const EMPTY_PROGRESS: MovieProgress = { isWatched: false, userRating: 0 };

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      progress: {},
      activePath: 'express',
      characterFilterId: null,
      hydrated: false,

      setActivePath: (path) => set({ activePath: path, characterFilterId: null }),

      toggleWatched: (movieId) => {
        const current = get().progress[movieId] ?? EMPTY_PROGRESS;
        const next = !current.isWatched;
        set((state) => ({
          progress: {
            ...state.progress,
            [movieId]: {
              ...current,
              isWatched: next,
              watchedAt: next ? Date.now() : undefined,
            },
          },
        }));
        return next;
      },

      setWatched: (movieId, watched) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [movieId]: {
              ...(state.progress[movieId] ?? EMPTY_PROGRESS),
              isWatched: watched,
              watchedAt: watched ? Date.now() : undefined,
            },
          },
        })),

      setRating: (movieId, rating) =>
        set((state) => {
          const current = state.progress[movieId] ?? EMPTY_PROGRESS;
          // Tapping the current rating again clears it.
          const nextRating = current.userRating === rating ? 0 : rating;
          return {
            progress: {
              ...state.progress,
              [movieId]: { ...current, userRating: nextRating },
            },
          };
        }),

      setTier: (movieId, tier) =>
        set((state) => {
          const current = state.progress[movieId] ?? EMPTY_PROGRESS;
          return {
            progress: {
              ...state.progress,
              [movieId]: {
                ...current,
                tier,
                // Ranking something implies you have seen it.
                isWatched: tier ? true : current.isWatched,
                watchedAt: tier && !current.isWatched ? Date.now() : current.watchedAt,
              },
            },
          };
        }),

      setCharacterFilter: (characterId) => set({ characterFilterId: characterId }),

      markPathWatched: (path, watched) =>
        set((state) => {
          const progress = { ...state.progress };
          for (const movie of MOVIE_CATALOGUE) {
            if (!movie.pathTags.includes(path)) continue;
            progress[movie.id] = {
              ...(progress[movie.id] ?? EMPTY_PROGRESS),
              isWatched: watched,
              watchedAt: watched ? Date.now() : undefined,
            };
          }
          return { progress };
        }),

      resetProgress: () => set({ progress: {}, characterFilterId: null }),
    }),
    {
      name: 'multiverse-roadmap-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        progress: state.progress,
        activePath: state.activePath,
      }),
      // Fires once AsyncStorage has been read, so the UI can hold its animations
      // until real progress is on screen instead of flashing 0%.
      onRehydrateStorage: () => () => {
        useRoadmapStore.setState({ hydrated: true });
      },
    },
  ),
);

/* ------------------------------------------------------------------ *
 * Selectors — components subscribe to these, not to raw state
 * ------------------------------------------------------------------ */

/** Merge catalogue + user progress into the full MovieItem the UI renders. */
export function hydrateMovie(
  catalogueItem: MovieCatalogueItem,
  progress: Record<string, MovieProgress>,
): MovieItem {
  const userData = progress[catalogueItem.id] ?? EMPTY_PROGRESS;
  return {
    ...catalogueItem,
    isWatched: userData.isWatched,
    userRating: userData.userRating,
    tier: userData.tier,
  };
}

export function useAllMovies(): MovieItem[] {
  const progress = useRoadmapStore((state) => state.progress);
  return MOVIE_CATALOGUE.map((movie) => hydrateMovie(movie, progress));
}

export function useMovie(movieId: string | undefined): MovieItem | undefined {
  const progress = useRoadmapStore((state) => state.progress);
  const item = MOVIE_CATALOGUE.find((movie) => movie.id === movieId);
  return item ? hydrateMovie(item, progress) : undefined;
}

/**
 * The feed: every title in release order, narrowed only when the Character
 * Vault has handed over a cross-filter.
 */
export function usePathMovies(): MovieItem[] {
  const progress = useRoadmapStore((state) => state.progress);
  const characterFilterId = useRoadmapStore((state) => state.characterFilterId);

  const character = characterFilterId
    ? CHARACTER_CATALOGUE.find((c) => c.id === characterFilterId)
    : undefined;

  const source = character
    ? MOVIE_CATALOGUE.filter(
        (movie) =>
          character.relatedMovieIds.includes(movie.id) ||
          (movie.keyCharacterIds ?? []).includes(character.id),
      )
    : MOVIE_CATALOGUE;

  return source.map((movie) => hydrateMovie(movie, progress));
}

export function useReadiness(): ReadinessStats {
  return computeReadiness(usePathMovies());
}

/** Global readiness across the whole catalogue — used by the share card. */
export function useGlobalReadiness(): ReadinessStats {
  return computeReadiness(useAllMovies());
}

export function useWatchedMovies(): MovieItem[] {
  return useAllMovies().filter((movie) => movie.isWatched);
}

/** Watched entries grouped by tier, plus the unranked bench. */
export function useTierBoard(): { tiers: Record<Tier, MovieItem[]>; unranked: MovieItem[] } {
  const movies = useAllMovies();
  const tiers: Record<Tier, MovieItem[]> = { S: [], A: [], B: [], C: [], D: [] };
  const unranked: MovieItem[] = [];

  for (const movie of movies) {
    if (movie.tier) tiers[movie.tier].push(movie);
    else if (movie.isWatched) unranked.push(movie);
  }
  return { tiers, unranked };
}

/** Highest-rated watched entry — the "favourite" on the share card. */
export function useFavouriteMovie(): MovieItem | undefined {
  const movies = useWatchedMovies();
  const rated = movies.filter((movie) => movie.userRating > 0);
  const pool = rated.length ? rated : movies.filter((movie) => movie.tier === 'S');
  return [...pool].sort((a, b) => b.userRating - a.userRating)[0];
}
