import {
  buildPlan,
  LANDMARKS,
  MAX_SCHEDULED,
  voiceForHour,
  type PlanInput,
  type PlannedNotification,
} from '@/services/notificationPlan';

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

const RELEASE = new Date('2026-12-18T00:00:00');
const base = (over: Partial<PlanInput> = {}): PlanInput => ({
  now: new Date('2026-09-03T10:00:00'),
  hour: 19,
  minute: 0,
  release: RELEASE,
  total: 68,
  watched: 20,
  percent: 29,
  streakDays: 0,
  loggedToday: false,
  daysSinceLastLog: 1,
  ...over,
});

const kinds = (p: PlannedNotification[]) => new Set(p.map((n) => n.kind));
const byId = (p: PlannedNotification[], id: string) => p.find((n) => n.id === id);

// --- Shape ---
const plan = buildPlan(base());
check('produces a plan', plan.length > 0, `${plan.length} notifications`);
check('respects the platform cap', plan.length <= MAX_SCHEDULED, `${plan.length} <= ${MAX_SCHEDULED}`);
check('sorted soonest first', plan.every((n, i) => i === 0 || plan[i - 1].at <= n.at));
check('every notification is in the future',
  plan.every((n) => n.at > base().now.getTime()));
check('ids are unique', new Set(plan.map((n) => n.id)).size === plan.length);
check('every message has a title and body',
  plan.every((n) => n.title.length > 0 && n.body.length > 0));

// --- One message per day, no doubling up ---
const dayOf = (ms: number) => new Date(ms).toDateString();
const scheduledDays = plan.filter((n) => n.kind === 'daily' || n.kind === 'landmark' || n.kind === 'weekend');
const dayCounts = new Map<string, number>();
for (const n of scheduledDays) dayCounts.set(dayOf(n.at), (dayCounts.get(dayOf(n.at)) ?? 0) + 1);
check('at most one scheduled message per day',
  [...dayCounts.values()].every((c) => c === 1),
  [...dayCounts.entries()].filter(([, c]) => c > 1).map(([d]) => d).join(', '));

// --- Streak rescue only fires when it should ---
const noStreak = buildPlan(base({ streakDays: 0, quickWin: { title: 'X', runtimeMinutes: 50 } }));
check('no streak rescue without a streak', !byId(noStreak, 'streak-rescue'));

const loggedAlready = buildPlan(base({
  streakDays: 4, loggedToday: true, quickWin: { title: 'X', runtimeMinutes: 50 },
}));
check('no streak rescue once you have logged today', !byId(loggedAlready, 'streak-rescue'));

const noQuickWin = buildPlan(base({ streakDays: 4, loggedToday: false }));
check('no streak rescue with nothing short enough to ask for', !byId(noQuickWin, 'streak-rescue'));

const rescue = buildPlan(base({
  streakDays: 4, loggedToday: false,
  quickWin: { title: 'Werewolf by Night', runtimeMinutes: 53 },
}));
const r = byId(rescue, 'streak-rescue');
check('streak rescue fires when a streak is at risk', !!r);
check('streak rescue names the title and its length',
  !!r && r.body.includes('Werewolf by Night') && r.body.includes('53 minutes'), r?.body);
check('streak rescue is in the evening',
  !!r && new Date(r.at).getHours() === 20, r ? String(new Date(r.at).getHours()) : '');

// A plan built late at night must not schedule tonight's rescue in the past.
const lateNight = buildPlan(base({
  now: new Date('2026-09-03T23:40:00'),
  streakDays: 4, loggedToday: false,
  quickWin: { title: 'X', runtimeMinutes: 44 },
}));
check('no rescue scheduled in the past', !byId(lateNight, 'streak-rescue'));

// --- Stinger follow-up ---
const stinger = buildPlan(base({
  now: new Date('2026-09-03T08:00:00'),
  stingerFollowUp: { title: 'Thunderbolts*', sceneCount: 2 },
}));
const st = byId(stinger, 'stinger-followup');
check('stinger follow-up fires', !!st);
check('stinger follow-up names the title and count',
  !!st && st.title.includes('Thunderbolts*') && st.title.includes('2 credits scenes'), st?.title);
check('no stinger follow-up when there is nothing to follow up', !byId(buildPlan(base()), 'stinger-followup'));

// --- Idle nudge ---
check('idle nudge stays quiet at 1 day', !byId(buildPlan(base({ daysSinceLastLog: 1 })), 'idle-nudge'));
const idle = buildPlan(base({ now: new Date('2026-09-03T08:00:00'), daysSinceLastLog: 9 }));
check('idle nudge fires after a long gap', !!byId(idle, 'idle-nudge'));
check('idle nudge counts the days', byId(idle, 'idle-nudge')?.title === '9 days',
      byId(idle, 'idle-nudge')?.title);
// Never logged anything: Infinity must not produce "Infinity days".
const never = buildPlan(base({ daysSinceLastLog: Number.POSITIVE_INFINITY, watched: 0, percent: 0 }));
check('no nonsense nudge when nothing was ever logged', !byId(never, 'idle-nudge'));

// --- Landmarks ---
for (const days of Object.keys(LANDMARKS).map(Number)) {
  const now = new Date(RELEASE.getTime() - days * 86_400_000);
  now.setHours(6, 0, 0, 0);
  const p = buildPlan(base({ now, release: RELEASE }));
  const hit = byId(p, `landmark-${days}`);
  check(`landmark at ${days} days fires`, !!hit, hit?.title);
}

// A landmark day must not also carry the ordinary daily message.
const landmarkDay = new Date(RELEASE.getTime() - 7 * 86_400_000);
landmarkDay.setHours(6, 0, 0, 0);
const lp = buildPlan(base({ now: landmarkDay }));
const sameDay = lp.filter((n) => dayOf(n.at) === landmarkDay.toDateString()
  && (n.kind === 'daily' || n.kind === 'landmark'));
check('a landmark replaces that day\'s daily message', sameDay.length === 1,
      sameDay.map((n) => n.kind).join(', '));

// --- Nothing scheduled past release ---
const nearEnd = buildPlan(base({ now: new Date('2026-12-16T08:00:00') }));
check('nothing scheduled after release day',
  nearEnd.every((n) => n.at <= RELEASE.getTime() + 86_400_000),
  nearEnd.map((n) => new Date(n.at).toDateString()).slice(-2).join(' | '));

// --- Voices ---
check('early hours are Wong', voiceForHour(2) === 'wong');
check('morning is the TVA', voiceForHour(9) === 'tva');
check('evening is Doom', voiceForHour(19) === 'doom');
check('late night is Wong', voiceForHour(23) === 'wong');
check('plan uses more than one voice', new Set(plan.map((n) => n.voice)).size > 1,
      [...new Set(plan.map((n) => n.voice))].join(', '));

// --- The daily line knows something about you ---
const fresh = buildPlan(base({ watched: 0, percent: 0 }));
check('a new user is told nothing is logged',
  fresh.some((n) => n.kind === 'daily' && n.body.includes('Nothing logged yet')));

const withNext = buildPlan(base({ nextUp: { title: 'Loki', runtimeMinutes: 300 } }));
check('the daily line names what is next',
  withNext.some((n) => n.kind === 'daily' && n.body.includes('Loki')));

const done = buildPlan(base({ watched: 68, percent: 100 }));
check('a finished user is not told to keep going',
  done.some((n) => n.kind === 'daily' && n.body.includes('You are done')));

// --- Weekend planner ---
const friday = new Date('2026-09-04T08:00:00'); // a Friday
const wk = buildPlan(base({ now: friday, weekendReach: 3 }));
const weekend = wk.find((n) => n.kind === 'weekend');
check('Friday gets the weekend message', !!weekend, weekend?.body);
check('weekend message counts titles', !!weekend && weekend.body.includes('3 titles'), weekend?.body);
check('no weekend message when nothing would fit',
  !buildPlan(base({ now: friday, weekendReach: 0 })).some((n) => n.kind === 'weekend'));

// --- Determinism ---
const a = JSON.stringify(buildPlan(base()));
const b = JSON.stringify(buildPlan(base()));
check('same input produces the same plan', a === b);

console.log(`\nkinds produced: ${[...kinds(plan)].join(', ')}`);
console.log(fails === 0 ? 'NOTIFICATIONS OK' : `${fails} FAILURES`);
process.exit(fails ? 1 : 0);
