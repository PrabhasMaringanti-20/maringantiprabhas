import { useMemo } from 'react';

import {
  MOVIE_CATALOGUE,
  hydrateMovie,
  useRoadmapStore,
} from '@/hooks/useRoadmapStore';
import type { MovieItem, Tier } from '@/types';

export interface PhaseProgress {
  /** Numeric phases sort ahead of the named ones ("Fox era" and friends). */
  phase: number | string;
  label: string;
  total: number;
  watched: number;
  percent: number;
}

export interface Milestone {
  id: string;
  label: string;
  detail: string;
  icon: string;
  achieved: boolean;
  /** 0–1. Lets a locked milestone still show how close it is. */
  progress: number;
}

export interface StatsSnapshot {
  total: number;
  watched: number;
  percent: number;
  minutesWatched: number;
  minutesRemaining: number;
  phases: PhaseProgress[];
  /** Index 1–5; index 0 is unused so ratings read naturally. */
  ratingHistogram: number[];
  ratedCount: number;
  averageRating: number;
  tierCounts: Record<Tier, number>;
  /** Consecutive days, ending today or yesterday, on which something was logged. */
  streakDays: number;
  longestStreakDays: number;
  /** Distinct days with at least one entry logged. */
  activeDays: number;
  milestones: Milestone[];
  firstWatchedAt?: number;
  lastWatchedAt?: number;
}

const DAY_MS = 86_400_000;

/** Local midnight for a timestamp, so streaks follow calendar days, not 24h windows. */
function dayIndex(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / DAY_MS);
}

function phaseLabel(phase: number | string): string {
  return typeof phase === 'number' ? `Phase ${phase}` : phase;
}

function computeStreaks(days: number[]): { current: number; longest: number } {
  if (days.length === 0) return { current: 0, longest: 0 };

  const unique = [...new Set(days)].sort((a, b) => a - b);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    run = unique[i] === unique[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // A streak stays alive through today and yesterday; older than that it is over.
  const today = dayIndex(Date.now());
  const last = unique[unique.length - 1];
  if (today - last > 1) return { current: 0, longest };

  let current = 1;
  for (let i = unique.length - 1; i > 0; i -= 1) {
    if (unique[i] === unique[i - 1] + 1) current += 1;
    else break;
  }
  return { current, longest };
}

export function useStats(): StatsSnapshot {
  const progress = useRoadmapStore((state) => state.progress);

  return useMemo(() => {
    const movies: MovieItem[] = MOVIE_CATALOGUE.map((item) => hydrateMovie(item, progress));

    let watched = 0;
    let minutesWatched = 0;
    let minutesRemaining = 0;
    let ratingTotal = 0;
    let ratedCount = 0;

    const ratingHistogram = [0, 0, 0, 0, 0, 0];
    const tierCounts: Record<Tier, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    const phaseMap = new Map<string, PhaseProgress>();

    for (const movie of movies) {
      const key = String(movie.phase);
      let bucket = phaseMap.get(key);
      if (!bucket) {
        bucket = {
          phase: movie.phase,
          label: phaseLabel(movie.phase),
          total: 0,
          watched: 0,
          percent: 0,
        };
        phaseMap.set(key, bucket);
      }
      bucket.total += 1;

      if (movie.isWatched) {
        watched += 1;
        bucket.watched += 1;
        minutesWatched += movie.runtimeMinutes;
      } else {
        minutesRemaining += movie.runtimeMinutes;
      }

      if (movie.userRating > 0) {
        ratingHistogram[movie.userRating] += 1;
        ratingTotal += movie.userRating;
        ratedCount += 1;
      }
      if (movie.tier) tierCounts[movie.tier] += 1;
    }

    const phases = [...phaseMap.values()]
      .map((bucket) => ({
        ...bucket,
        percent: bucket.total ? Math.round((bucket.watched / bucket.total) * 100) : 0,
      }))
      .sort((a, b) => {
        const aNum = typeof a.phase === 'number';
        const bNum = typeof b.phase === 'number';
        if (aNum && bNum) return (a.phase as number) - (b.phase as number);
        if (aNum) return -1;
        if (bNum) return 1;
        return a.label.localeCompare(b.label);
      });

    const stamps = Object.values(progress)
      .filter((entry) => entry.isWatched && typeof entry.watchedAt === 'number')
      .map((entry) => entry.watchedAt as number)
      .sort((a, b) => a - b);

    const { current: streakDays, longest: longestStreakDays } = computeStreaks(
      stamps.map(dayIndex),
    );
    const activeDays = new Set(stamps.map(dayIndex)).size;

    const total = movies.length;
    const percent = total ? Math.round((watched / total) * 100) : 0;
    const hoursWatched = minutesWatched / 60;

    const milestone = (
      id: string,
      label: string,
      detail: string,
      icon: string,
      value: number,
      target: number,
    ): Milestone => ({
      id,
      label,
      detail,
      icon,
      achieved: value >= target,
      progress: target ? Math.min(1, value / target) : 0,
    });

    const milestones: Milestone[] = [
      milestone('first', 'First contact', 'Log your first title', 'flag-outline', watched, 1),
      milestone('ten', 'Double digits', 'Log 10 titles', 'albums-outline', watched, 10),
      milestone('half', 'Halfway to Doom', 'Log half the catalogue', 'pie-chart-outline', percent, 50),
      milestone('all', 'Fully prepared', 'Log every title', 'shield-checkmark-outline', percent, 100),
      milestone('day', 'A full day watched', '24 hours logged', 'time-outline', hoursWatched, 24),
      milestone('week', 'A working week', '40 hours logged', 'hourglass-outline', hoursWatched, 40),
      milestone('critic', 'Critic', 'Rate 20 titles', 'star-outline', ratedCount, 20),
      milestone('ranker', 'Tier maker', 'Tier 15 titles', 'trophy-outline',
        Object.values(tierCounts).reduce((sum, n) => sum + n, 0), 15),
      milestone('streak', 'On a run', 'A 3-day streak', 'flame-outline', longestStreakDays, 3),
      milestone('marathon', 'Marathoner', 'A 7-day streak', 'bonfire-outline', longestStreakDays, 7),
    ];

    return {
      total,
      watched,
      percent,
      minutesWatched,
      minutesRemaining,
      phases,
      ratingHistogram,
      ratedCount,
      averageRating: ratedCount ? ratingTotal / ratedCount : 0,
      tierCounts,
      streakDays,
      longestStreakDays,
      activeDays,
      milestones,
      firstWatchedAt: stamps[0],
      lastWatchedAt: stamps[stamps.length - 1],
    };
  }, [progress]);
}
