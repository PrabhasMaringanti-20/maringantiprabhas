import * as Haptics from 'expo-haptics';

import {
  hasTickAudio,
  isTicking,
  releaseTicking,
  startTicking,
  stopTicking,
} from '@/services/tick';

// Injected by the bundle step so one source file can test both worlds.
declare const AUDIO_PRESENT: boolean;

const audioLog = AUDIO_PRESENT
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('expo-audio') as { __log: Record<string, number | boolean | null> }).__log
  : null;
const haptics = (Haptics as unknown as { __calls: { selection: number } }).__calls;

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

const world = AUDIO_PRESENT ? 'new binary' : 'OLD BINARY (OTA)';
console.log(`\n--- ${world} ---`);

check('the service reports what this binary can do', hasTickAudio() === AUDIO_PRESENT);
check('nothing is ticking before it is asked to', !isTicking());

// The whole point: an OTA bundle landing on a binary with no expo-audio must
// not take the app down. Any throw here is a crash on someone's phone.
let threw: string | null = null;
try {
  startTicking();
} catch (error) {
  threw = String(error);
}
check('starting the tick never throws', threw === null, threw ?? '');
check('the tick reports itself as running', isTicking());

// Repeat calls are a normal consequence of re-renders and refocus.
try {
  startTicking();
  startTicking();
} catch (error) {
  threw = String(error);
}
check('starting twice more never throws', threw === null, threw ?? '');

if (AUDIO_PRESENT && audioLog) {
  check('exactly one player is built, not one per call', audioLog.created === 1,
    `${audioLog.created} created`);
  check('the clip is set to loop', audioLog.loop === true);
  check('the clip is played under everything else',
    typeof audioLog.volume === 'number' && audioLog.volume > 0 && audioLog.volume <= 0.6,
    `volume ${audioLog.volume}`);
  check('the loop is rewound before it starts', (audioLog.seeks as number) >= 1);
  check('no haptic buzzing when there is real audio', haptics.selection === 0);
} else {
  check('it falls back to a haptic tick', true);
}

stopTicking();
check('stopping leaves nothing running', !isTicking());
if (AUDIO_PRESENT && audioLog) {
  check('stopping pauses the clip', (audioLog.pauses as number) >= 1);
}

let stopThrew: string | null = null;
try {
  stopTicking();
  stopTicking();
} catch (error) {
  stopThrew = String(error);
}
check('stopping when already stopped never throws', stopThrew === null, stopThrew ?? '');

// The fallback has to actually tick, once a second, and stop when told.
if (!AUDIO_PRESENT) {
  const before = haptics.selection;
  startTicking();
  setTimeout(() => {
    const during = haptics.selection;
    stopTicking();
    setTimeout(() => {
      const after = haptics.selection;
      check('the haptic fallback pulses about once a second',
        during - before >= 2 && during - before <= 4, `${during - before} pulses in 2.5s`);
      check('the haptic fallback stops when silenced', after === during,
        `${after - during} stray pulses`);
      finish();
    }, 1600);
  }, 2500);
} else {
  let releaseThrew: string | null = null;
  try {
    releaseTicking();
  } catch (error) {
    releaseThrew = String(error);
  }
  check('releasing the player never throws', releaseThrew === null, releaseThrew ?? '');
  check('releasing frees the player', (audioLog?.removes as number) >= 1);
  finish();
}

function finish() {
  console.log(fails === 0 ? `\n${world}: TICK OK` : `\n${world}: TICK FAILED — ${fails} check(s)`);
  process.exit(fails === 0 ? 0 : 1);
}
