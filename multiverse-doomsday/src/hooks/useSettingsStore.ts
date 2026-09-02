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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      spoilerSafe: false,
      setSpoilerSafe: (value) => set({ spoilerSafe: value }),
    }),
    {
      name: 'multiverse-settings-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
