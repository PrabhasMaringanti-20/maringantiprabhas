import * as Haptics from 'expo-haptics';

/**
 * The countdown's ticking clock.
 *
 * `expo-audio` is a native module, which matters more than it sounds: this
 * bundle ships over the air to a binary that may not contain it yet. A plain
 * import would take the whole app down on launch for anyone who has not
 * reinstalled. So the module is loaded defensively, once, and the feature
 * degrades to a haptic tick — `expo-haptics` is already in every build — until
 * a new binary is installed. Nothing here ever throws into a render.
 */

type Player = {
  loop: boolean;
  volume: number;
  play: () => void;
  pause: () => void;
  remove: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

type AudioModule = {
  createAudioPlayer: (source: number) => Player;
};

let audio: AudioModule | null | undefined;

/** Resolved once and cached. `null` means this binary has no audio support. */
function loadAudio(): AudioModule | null {
  if (audio !== undefined) return audio;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-audio') as AudioModule;
    audio = typeof mod?.createAudioPlayer === 'function' ? mod : null;
  } catch {
    // Older binary, or a platform without the module. Not an error.
    audio = null;
  }
  return audio;
}

/** True when this build can actually play the tick rather than buzz it. */
export function hasTickAudio(): boolean {
  return loadAudio() !== null;
}

let player: Player | null = null;
let hapticTimer: ReturnType<typeof setInterval> | null = null;
let running = false;

function startHaptics(): void {
  if (hapticTimer) return;
  hapticTimer = setInterval(() => {
    Haptics.selectionAsync().catch(() => {});
  }, 1000);
}

function stopHaptics(): void {
  if (!hapticTimer) return;
  clearInterval(hapticTimer);
  hapticTimer = null;
}

/**
 * Start ticking. Safe to call repeatedly; the second call does nothing.
 *
 * The clip is a loop carrying one tick and one tock, so the player is left
 * looping rather than re-triggered on a timer — restarting a clip from JS
 * drifts audibly and wakes the audio hardware for no reason. The pace lives
 * in the file, not here: see scripts/generate-tick.py to retune it.
 */
export function startTicking(): void {
  if (running) return;
  running = true;

  const mod = loadAudio();
  if (!mod) {
    startHaptics();
    return;
  }

  try {
    if (!player) {
      player = mod.createAudioPlayer(require('../../assets/audio/tick.wav'));
      player.loop = true;
      // Under everything else. A countdown that shouts is a smoke alarm.
      player.volume = 0.5;
    }
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // The module is present but the player would not start — fall back rather
    // than leaving the toggle on with nothing happening.
    player = null;
    audio = null;
    startHaptics();
  }
}

/** Stop ticking. Safe to call when nothing is running. */
export function stopTicking(): void {
  running = false;
  stopHaptics();
  try {
    player?.pause();
  } catch {
    // Already gone.
  }
}

/** Release the player entirely — used when the screen goes away for good. */
export function releaseTicking(): void {
  stopTicking();
  try {
    player?.remove();
  } catch {
    // Already gone.
  }
  player = null;
}

export function isTicking(): boolean {
  return running;
}
