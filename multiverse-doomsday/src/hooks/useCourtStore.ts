import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Ballot } from '@/utils/predictions';

interface CourtState {
  ballot: Ballot;
  /** When you locked your predictions in. Null while you can still change them. */
  lockedAt: number | null;
  setAnswer: (questionId: string, optionId: string) => void;
  clearAnswer: (questionId: string) => void;
  lock: () => void;
  /** Reopening is allowed — but the timestamp goes, and that is the point. */
  unlock: () => void;
}

/**
 * Your predictions, kept locally like everything else in this app.
 *
 * Locking is the whole ritual: a prediction nobody can see you change is not
 * a prediction. Nothing enforces it but the timestamp you show your friends,
 * which is exactly as much enforcement as an argument between friends needs.
 */
export const useCourtStore = create<CourtState>()(
  persist(
    (set) => ({
      ballot: {},
      lockedAt: null,
      setAnswer: (questionId, optionId) =>
        set((state) =>
          state.lockedAt
            ? state
            : { ballot: { ...state.ballot, [questionId]: optionId } },
        ),
      clearAnswer: (questionId) =>
        set((state) => {
          if (state.lockedAt) return state;
          const next = { ...state.ballot };
          delete next[questionId];
          return { ballot: next };
        }),
      lock: () => set({ lockedAt: Date.now() }),
      unlock: () => set({ lockedAt: null }),
    }),
    {
      name: 'multiverse-court-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
