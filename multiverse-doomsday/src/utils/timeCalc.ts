import type { MovieItem, ReadinessStats } from '@/types';

/** "2h 29m" · "48m" · "—" */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Compact hours label used by the dashboard: "12.5 hrs". */
export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 100) return `${Math.round(hours)} hrs`;
  if (hours >= 10) return `${hours.toFixed(1)} hrs`;
  if (hours >= 1) return `${hours.toFixed(1)} hrs`;
  return `${Math.round(minutes)} min`;
}

/** Aggregate the readiness numbers for a set of entries on the active path. */
export function computeReadiness(movies: MovieItem[]): ReadinessStats {
  const total = movies.length;
  const watchedItems = movies.filter((m) => m.isWatched);
  const watched = watchedItems.length;
  const minutesWatched = watchedItems.reduce((sum, m) => sum + m.runtimeMinutes, 0);
  const minutesRemaining = movies
    .filter((m) => !m.isWatched)
    .reduce((sum, m) => sum + m.runtimeMinutes, 0);

  return {
    total,
    watched,
    percent: total === 0 ? 0 : Math.round((watched / total) * 100),
    minutesWatched,
    minutesRemaining,
    hoursRemaining: Math.round((minutesRemaining / 60) * 10) / 10,
    nextUp: movies.find((m) => !m.isWatched),
  };
}

/**
 * Days left at a given pace, e.g. "4 evenings" at 2 hours a night.
 * Returns 0 when there is nothing left to watch.
 */
export function eveningsRemaining(minutesRemaining: number, minutesPerEvening = 120): number {
  if (minutesRemaining <= 0) return 0;
  return Math.ceil(minutesRemaining / minutesPerEvening);
}

/** Rank label attached to the readiness percentage. */
export function readinessRank(percent: number): { label: string; blurb: string } {
  if (percent >= 100) return { label: 'BATTLEWORLD READY', blurb: 'Every incursion accounted for.' };
  if (percent >= 80) return { label: 'ILLUMINATI CLEARANCE', blurb: 'You would be allowed in the room.' };
  if (percent >= 60) return { label: 'SACRED TIMELINE', blurb: 'Solidly briefed. Keep going.' };
  if (percent >= 40) return { label: 'TVA ANALYST', blurb: 'You know what a branch is. Good start.' };
  if (percent >= 20) return { label: 'VARIANT IN TRAINING', blurb: 'The basics are in place.' };
  return { label: 'UNPRUNED CIVILIAN', blurb: 'Doomsday will make no sense yet.' };
}
