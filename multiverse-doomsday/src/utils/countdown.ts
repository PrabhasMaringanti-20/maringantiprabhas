/**
 * Avengers: Doomsday — theatrical release.
 * Marvel has moved this date before; change it here and every countdown follows.
 */
export const DOOMSDAY_RELEASE = new Date('2026-12-18T00:00:00Z');

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the release date has passed. */
  released: boolean;
  totalSeconds: number;
}

export function countdownTo(target: Date = DOOMSDAY_RELEASE, from: Date = new Date()): Countdown {
  const totalSeconds = Math.floor((target.getTime() - from.getTime()) / 1000);

  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, released: true, totalSeconds: 0 };
  }

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    released: false,
    totalSeconds,
  };
}

/** Zero-padded two-digit segment, e.g. 7 → "07". */
export function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** "18 December 2026" */
export function releaseDateLabel(target: Date = DOOMSDAY_RELEASE): string {
  return target.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
