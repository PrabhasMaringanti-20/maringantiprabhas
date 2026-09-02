import { useMemo } from 'react';

import postCreditsJson from '@/data/postCredits.json';
import { useAllMovies } from '@/hooks/useRoadmapStore';
import type { MovieItem, PostCreditsEntry, StingerRelevance } from '@/types';

const POST_CREDITS = postCreditsJson as Record<string, PostCreditsEntry>;

export function postCreditsFor(movieId: string): PostCreditsEntry | undefined {
  return POST_CREDITS[movieId];
}

export interface StingerRow {
  movie: MovieItem;
  entry: PostCreditsEntry;
}

/** Ranking used everywhere a stinger is shown, so the ordering never disagrees. */
export const RELEVANCE_RANK: Record<StingerRelevance, number> = {
  direct: 0,
  thread: 1,
  none: 2,
  unreleased: 3,
};

export const RELEVANCE_LABEL: Record<StingerRelevance, string> = {
  direct: 'Feeds Doomsday',
  thread: 'Loose thread',
  none: 'Self-contained',
  unreleased: 'Not out yet',
};

/**
 * Every title that actually has a stinger, heaviest first.
 *
 * Titles with no scene at all are dropped rather than listed as empty rows —
 * a tracker of things that do not exist is just noise.
 */
export function useStingers(filter: StingerRelevance | 'all' = 'all'): StingerRow[] {
  const movies = useAllMovies();

  return useMemo(() => {
    const rows: StingerRow[] = [];
    for (const movie of movies) {
      const entry = POST_CREDITS[movie.id];
      if (!entry || entry.scenes.length === 0) continue;
      if (filter !== 'all' && entry.relevance !== filter) continue;
      rows.push({ movie, entry });
    }
    return rows.sort((a, b) => {
      const byRelevance = RELEVANCE_RANK[a.entry.relevance] - RELEVANCE_RANK[b.entry.relevance];
      if (byRelevance !== 0) return byRelevance;
      return a.movie.releaseYear - b.movie.releaseYear;
    });
  }, [movies, filter]);
}

/** Counts per bucket, for the filter row. */
export function useStingerCounts(): Record<StingerRelevance | 'all', number> {
  const rows = useStingers('all');
  return useMemo(() => {
    const counts = { all: rows.length, direct: 0, thread: 0, none: 0, unreleased: 0 };
    for (const row of rows) counts[row.entry.relevance] += 1;
    return counts;
  }, [rows]);
}
