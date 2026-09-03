import { useEffect, useMemo } from 'react';

import { postCreditsFor } from '@/hooks/usePostCredits';
import { useAllMovies, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { useNotificationStore } from '@/hooks/useNotificationStore';
import { useStats } from '@/hooks/useStats';
import { buildPlan, type PlanInput, type PlannedNotification } from '@/services/notificationPlan';
import { DOOMSDAY_RELEASE } from '@/utils/countdown';

const DAY_MS = 86_400_000;
/** What a free weekend realistically holds, in minutes. */
const WEEKEND_MINUTES = 10 * 60;

function sameDay(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

/**
 * Assembles what the app knows about you into a notification plan, and keeps
 * the queue in step with it.
 *
 * Notifications are scheduled ahead of time and the app cannot run in the
 * background, so the plan is rebuilt whenever there is an opportunity: on
 * launch, and whenever progress or the preferred time changes. Everything the
 * messages say is decided by `buildPlan`, which is pure and tested.
 */
export function useNotificationScheduler(): { plan: PlannedNotification[] } {
  const movies = useAllMovies();
  const stats = useStats();
  const progress = useRoadmapStore((state) => state.progress);
  const hydrated = useRoadmapStore((state) => state.hydrated);

  const enabled = useNotificationStore((state) => state.enabled);
  const hour = useNotificationStore((state) => state.hour);
  const minute = useNotificationStore((state) => state.minute);
  const reschedule = useNotificationStore((state) => state.reschedule);

  const input = useMemo<PlanInput>(() => {
    const now = new Date();
    const unwatched = movies.filter((movie) => !movie.isWatched);

    // How far the front of the list gets on ten free hours.
    let weekendReach = 0;
    let used = 0;
    for (const movie of unwatched) {
      if (used + movie.runtimeMinutes > WEEKEND_MINUTES) break;
      used += movie.runtimeMinutes;
      weekendReach += 1;
    }

    const quickWin = [...unwatched]
      .filter((movie) => movie.runtimeMinutes <= 75)
      .sort((a, b) => a.runtimeMinutes - b.runtimeMinutes)[0];

    // Something logged yesterday that hides a credits scene.
    const yesterday = now.getTime() - DAY_MS;
    let stingerFollowUp: PlanInput['stingerFollowUp'];
    for (const [movieId, entry] of Object.entries(progress)) {
      if (!entry.isWatched || !entry.watchedAt) continue;
      if (!sameDay(entry.watchedAt, yesterday)) continue;
      const scenes = postCreditsFor(movieId)?.scenes.length ?? 0;
      if (scenes === 0) continue;
      const movie = movies.find((m) => m.id === movieId);
      if (movie) stingerFollowUp = { title: movie.title, sceneCount: scenes };
    }

    const daysSinceLastLog = stats.lastWatchedAt
      ? Math.floor((now.getTime() - stats.lastWatchedAt) / DAY_MS)
      : Number.POSITIVE_INFINITY;

    return {
      now,
      hour,
      minute,
      release: DOOMSDAY_RELEASE,
      total: stats.total,
      watched: stats.watched,
      percent: stats.percent,
      streakDays: stats.streakDays,
      loggedToday: Boolean(stats.lastWatchedAt && sameDay(stats.lastWatchedAt, now.getTime())),
      daysSinceLastLog,
      nextUp: unwatched[0]
        ? { title: unwatched[0].title, runtimeMinutes: unwatched[0].runtimeMinutes }
        : undefined,
      quickWin: quickWin
        ? { title: quickWin.title, runtimeMinutes: quickWin.runtimeMinutes }
        : undefined,
      stingerFollowUp,
      weekendReach,
    };
    // `now` deliberately re-reads on every rebuild; the deps below are what
    // should actually trigger one.
  }, [movies, progress, stats, hour, minute]);

  const plan = useMemo(() => buildPlan(input), [input]);

  useEffect(() => {
    if (!hydrated || !enabled) return;
    reschedule(plan);
  }, [hydrated, enabled, plan, reschedule]);

  return { plan };
}
