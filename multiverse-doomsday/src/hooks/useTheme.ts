import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      setMode: (mode) => set({ mode }),
      cycleMode: () =>
        set({ mode: ORDER[(ORDER.indexOf(get().mode) + 1) % ORDER.length] }),
    }),
    {
      name: 'multiverse-theme-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * The app's only source of colour. Every component reads from this through
 * `style` — there is no class-based styling left, because the class layer kept
 * dropping inline styles on animated components and only on device.
 */
export interface Palette {
  canvas: string;
  surface: string;
  raised: string;
  line: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  accent: string;
  accentSoft: string;
  marvel: string;
  crimson: string;
  violet: string;
  /** Two-stop wash behind cards and headers. */
  gradient: [string, string];
  /** Smoke colours for the dark-mode atmosphere. */
  smoke: [string, string];
}

const LIGHT: Palette = {
  canvas: '#F7F7FA',
  surface: '#FFFFFF',
  raised: '#F2F2F7',
  line: '#E2E2EA',
  ink: '#111017',
  inkSoft: '#585566',
  inkFaint: '#8C899C',
  accent: '#059669',
  accentSoft: '#D1FAE5',
  marvel: '#C1121F',
  crimson: '#BE123C',
  violet: '#6D28D9',
  gradient: ['#FFFFFF', '#F2F2F7'],
  smoke: ['#059669', '#0EA5E9'],
};

const DARK: Palette = {
  canvas: '#0B0813',
  surface: '#161124',
  raised: '#211A35',
  line: '#372B56',
  ink: '#FFFFFF',
  inkSoft: '#8B80A8',
  inkFaint: '#5C5378',
  accent: '#10B981',
  accentSoft: '#064E3B',
  marvel: '#EC1D24',
  crimson: '#F43F5E',
  violet: '#A78BFA',
  gradient: ['#211A35', '#161124'],
  smoke: ['#10B981', '#064E3B'],
};

export function usePalette(): Palette & { isDark: boolean } {
  const system = useSystemColorScheme();
  const mode = useThemeStore((state) => state.mode);
  // "system" follows the phone; anything else is an explicit choice. Dark is
  // the default when the system reports nothing, which is this app's house style.
  const isDark = mode === 'system' ? system !== 'light' : mode === 'dark';
  return useMemo(() => ({ ...(isDark ? DARK : LIGHT), isDark }), [isDark]);
}

export const LIGHT_PALETTE = LIGHT;
export const DARK_PALETTE = DARK;
