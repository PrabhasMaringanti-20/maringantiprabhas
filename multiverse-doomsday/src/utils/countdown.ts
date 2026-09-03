/**
 * Avengers: Doomsday — theatrical release, 18 December 2026.
 *
 * The date is held as **local midnight**, not UTC. That is not a detail: a
 * countdown pinned to UTC midnight reaches zero at 05:30 in India and 19:00
 * the previous evening in New York, while the label beside it still reads
 * "18 December". The clock and the date it prints have to agree, and what a
 * person means by "18 December" is midnight where they are standing.
 *
 * Marvel has moved this date before. Change the three numbers here and every
 * countdown, notification and deadline in the app follows.
 */
const RELEASE_YEAR = 2026;
/** 0-indexed, because Date is. 11 is December. */
const RELEASE_MONTH = 11;
const RELEASE_DAY = 18;

export const DOOMSDAY_RELEASE = new Date(RELEASE_YEAR, RELEASE_MONTH, RELEASE_DAY, 0, 0, 0, 0);

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
  });
}

/** "Friday 18 December 2026" — the hero has room to say which day it lands on. */
export function releaseDayLabel(target: Date = DOOMSDAY_RELEASE): string {
  return target
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(',', '');
}

/**
 * "Midnight, your time" — says out loud what the clock is counting to, so the
 * hour it hits zero is never a surprise.
 */
export function releaseMomentLabel(): string {
  return 'midnight, your time';
}
