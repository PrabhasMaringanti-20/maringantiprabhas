import quotesJson from '@/data/quotes.json';

/**
 * What the app says to you, and when.
 *
 * This file is deliberately pure — no expo-notifications, no dates from
 * `Date.now()`, no store access. It takes a snapshot of your state and returns
 * the messages that should be scheduled. That makes the interesting part (does
 * it say the right thing on the right day?) testable without a device.
 *
 * The register is short and sharp rather than explanatory. A notification you
 * read on the lock screen and enjoy without opening the app has done its job.
 */

export interface Quote {
  text: string;
  character: string;
  source: string;
}

export const QUOTES = quotesJson as Quote[];

/**
 * Who is speaking. The app has a cast, so the voice changes with the hour
 * rather than everything arriving in the same flat narrator.
 */
export type Voice = 'tva' | 'doom' | 'wong' | 'archive';

export const VOICE_LABEL: Record<Voice, string> = {
  tva: 'TVA',
  doom: 'DOOM',
  wong: 'WONG',
  archive: 'ARCHIVE',
};

export type PlanKind =
  | 'daily'
  | 'landmark'
  | 'streak'
  | 'stinger'
  | 'weekend'
  | 'idle';

export interface PlannedNotification {
  /** Stable within a plan, so two plans can be compared in a test. */
  id: string;
  kind: PlanKind;
  voice: Voice;
  title: string;
  body: string;
  /** Epoch ms. */
  at: number;
}

export interface PlanInput {
  /** When the plan is being built. */
  now: Date;
  /** Preferred hour/minute for the ordinary daily message. */
  hour: number;
  minute: number;
  /** Release date, so landmarks land on the right days. */
  release: Date;
  total: number;
  watched: number;
  percent: number;
  streakDays: number;
  /** True when something was logged today — suppresses the streak rescue. */
  loggedToday: boolean;
  /** Days since anything was logged. Infinity when nothing ever has been. */
  daysSinceLastLog: number;
  /** Next unwatched title in order. */
  nextUp?: { title: string; runtimeMinutes: number };
  /** Shortest unwatched title — what the streak rescue can realistically ask for. */
  quickWin?: { title: string; runtimeMinutes: number };
  /** A title logged yesterday that hides credits scenes. */
  stingerFollowUp?: { title: string; sceneCount: number };
  /** How many titles a free weekend could clear. */
  weekendReach?: number;
}

/** iOS only keeps 64 pending notifications; stay well inside that. */
export const MAX_SCHEDULED = 48;
const HORIZON_DAYS = 30;

const DAY_MS = 86_400_000;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

function at(day: Date, hour: number, minute: number): Date {
  const copy = new Date(day);
  copy.setHours(hour, minute, 0, 0);
  return copy;
}

/** Morning is procedural, evening is Doom, after midnight is Wong. */
export function voiceForHour(hour: number): Voice {
  if (hour >= 0 && hour < 5) return 'wong';
  if (hour < 12) return 'tva';
  if (hour < 22) return 'doom';
  return 'wong';
}

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/* ------------------------------------------------------------------ *
 * Landmarks
 *
 * Ordinary days get a quote. These days get something else, and the tone
 * tightens as the date closes in — the point of a countdown is that it should
 * not feel the same at 100 days as at one.
 * ------------------------------------------------------------------ */

interface Landmark {
  voice: Voice;
  title: string;
  body: (input: PlanInput) => string;
}

export const LANDMARKS: Record<number, Landmark> = {
  100: {
    voice: 'tva',
    title: 'Case file 616-D',
    body: () => 'One hundred days to the Incursion event. Your timeline is being monitored.',
  },
  75: {
    voice: 'tva',
    title: 'Seventy-five days',
    body: (i) => `Readiness logged at ${i.percent}%. The Council has seen worse. Not much worse.`,
  },
  50: {
    voice: 'doom',
    title: 'Fifty days',
    body: (i) =>
      i.percent >= 50
        ? 'Half the runway gone. So are you. Continue.'
        : `Half the runway gone. You are ${i.percent}% prepared. Doom is unimpressed.`,
  },
  30: {
    voice: 'doom',
    title: 'One month',
    body: (i) =>
      i.total - i.watched > 0
        ? `${i.total - i.watched} titles remain. Doom is patient. The date is not.`
        : 'Everything is logged. Doom acknowledges you.',
  },
  14: {
    voice: 'tva',
    title: 'Two weeks',
    body: () => 'Two weeks to the branch point. Pruning begins shortly.',
  },
  10: {
    voice: 'doom',
    title: 'Ten days',
    body: (i) => `Ten days. ${i.total - i.watched} unwatched. Choose what you can live without.`,
  },
  7: {
    voice: 'doom',
    title: 'One week',
    body: () => 'One week. Whatever is left undone will stay undone.',
  },
  3: {
    voice: 'doom',
    title: 'Three days',
    body: () => 'Three days. Stop planning. Start watching.',
  },
  1: {
    voice: 'doom',
    title: 'Tomorrow',
    body: () => 'Tomorrow.',
  },
  0: {
    voice: 'doom',
    title: 'Today',
    body: () => 'Avengers: Doomsday. Today. Doom has been waiting.',
  },
};

/* ------------------------------------------------------------------ *
 * Message builders
 * ------------------------------------------------------------------ */

/** Deterministic pick, so a given day always gets the same line. */
export function quoteForDay(dayIndex: number): Quote {
  return QUOTES[Math.abs(Math.trunc(dayIndex)) % QUOTES.length];
}

function dailyMessage(input: PlanInput, fireAt: Date, daysLeft: number): PlannedNotification {
  const voice = voiceForHour(fireAt.getHours());
  const quote = quoteForDay(Math.floor(fireAt.getTime() / DAY_MS));

  // The quote is the hook; the second line is the only part that knows you.
  const progress =
    input.watched === 0
      ? `${daysLeft} days. Nothing logged yet.`
      : input.percent >= 100
        ? `${daysLeft} days. You are done. Rewatch something.`
        : input.nextUp
          ? `${daysLeft} days. Next: ${input.nextUp.title}, ${formatRuntime(input.nextUp.runtimeMinutes)}.`
          : `${daysLeft} days. ${input.percent}% ready.`;

  return {
    id: `daily-${startOfDay(fireAt).getTime()}`,
    kind: 'daily',
    voice,
    title: `“${quote.text}”`,
    body: `${quote.character} · ${quote.source}\n${progress}`,
    at: fireAt.getTime(),
  };
}

/* ------------------------------------------------------------------ *
 * The planner
 * ------------------------------------------------------------------ */

export function buildPlan(input: PlanInput): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  const { now, hour, minute, release } = input;

  /* --- Tonight only: things that depend on today's state --- */

  // Streak rescue. Only when a streak actually exists, nothing has been logged
  // today, and there is something short enough to realistically finish.
  if (input.streakDays > 0 && !input.loggedToday && input.quickWin) {
    const fire = at(now, 20, 30);
    if (fire > now) {
      out.push({
        id: 'streak-rescue',
        kind: 'streak',
        voice: 'doom',
        title: `${input.streakDays}-day streak`,
        body: `It ends at midnight. ${input.quickWin.title} is ${formatRuntime(input.quickWin.runtimeMinutes)}.`,
        at: fire.getTime(),
      });
    }
  }

  // Post-credits follow-up for something logged yesterday.
  if (input.stingerFollowUp) {
    const fire = at(now, Math.max(hour, 12), minute);
    if (fire > now) {
      const { title, sceneCount } = input.stingerFollowUp;
      out.push({
        id: 'stinger-followup',
        kind: 'stinger',
        voice: 'archive',
        title: `${title} had ${sceneCount === 1 ? 'a credits scene' : `${sceneCount} credits scenes`}`,
        body: 'Did you stay? The tracker has them if you did not.',
        at: fire.getTime(),
      });
    }
  }

  // Nothing logged in a while. Said once, not nagged daily.
  if (input.daysSinceLastLog >= 6 && Number.isFinite(input.daysSinceLastLog)) {
    const fire = at(now, 19, 0);
    if (fire > now) {
      out.push({
        id: 'idle-nudge',
        kind: 'idle',
        voice: 'doom',
        title: `${Math.floor(input.daysSinceLastLog)} days`,
        body: 'Doom has noticed.',
        at: fire.getTime(),
      });
    }
  }

  /* --- The next month of scheduled days --- */

  for (let offset = 0; offset <= HORIZON_DAYS; offset += 1) {
    const day = new Date(now.getTime() + offset * DAY_MS);
    const daysLeft = daysBetween(day, release);
    if (daysLeft < 0) break;

    const landmark = LANDMARKS[daysLeft];
    if (landmark) {
      const fire = at(day, landmark.voice === 'tva' ? 9 : 19, 0);
      if (fire > now) {
        out.push({
          id: `landmark-${daysLeft}`,
          kind: 'landmark',
          voice: landmark.voice,
          title: landmark.title,
          body: landmark.body(input),
          at: fire.getTime(),
        });
      }
      continue; // A landmark replaces that day's ordinary message.
    }

    // Friday evening: what a free weekend could actually clear.
    if (day.getDay() === 5 && input.weekendReach && input.weekendReach > 0) {
      const fire = at(day, 18, 0);
      if (fire > now) {
        out.push({
          id: `weekend-${startOfDay(day).getTime()}`,
          kind: 'weekend',
          voice: 'tva',
          title: 'Two days clear',
          body: `A free weekend gets you through ${input.weekendReach} ${
            input.weekendReach === 1 ? 'title' : 'titles'
          }.`,
          at: fire.getTime(),
        });
        continue;
      }
    }

    const fire = at(day, hour, minute);
    if (fire > now) out.push(dailyMessage(input, fire, daysLeft));
  }

  // Soonest first, and never more than the platform will hold.
  return out.sort((a, b) => a.at - b.at).slice(0, MAX_SCHEDULED);
}
