import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  /**
   * Hides the TMDB synopsis and keeps post-credits covered for anything you
   * have not marked watched.
   *
   * "Why it matters" is deliberately not hidden: it is written spoiler-free by
   * design, and it is the reason the roadmap exists — blanking it would leave
   * a list of titles with no argument for watching them.
   */
  spoilerSafe: boolean;
  setSpoilerSafe: (value: boolean) => void;

  /**
   * Whether the countdown ticks out loud.
   *
   * Off by default, and deliberately so: an app that starts making noise the
   * moment it opens is one people close. It is offered on the countdown
   * itself, where the sound makes sense, rather than buried in settings.
   */
  countdownTicking: boolean;
  setCountdownTicking: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      spoilerSafe: false,
      setSpoilerSafe: (value) => set({ spoilerSafe: value }),
      countdownTicking: false,
      setCountdownTicking: (value) => set({ countdownTicking: value }),
    }),
    {
      name: 'multiverse-settings-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
