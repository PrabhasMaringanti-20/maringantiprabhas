import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cancelAll, scheduleDailyReminders } from '@/services/notifications';

/** Reminder times offered in the UI, as 24-hour {hour, minute} pairs. */
export const REMINDER_TIMES = [
  { hour: 9, minute: 0, label: '9:00 am' },
  { hour: 13, minute: 0, label: '1:00 pm' },
  { hour: 20, minute: 0, label: '8:00 pm' },
  { hour: 22, minute: 0, label: '10:00 pm' },
];

interface NotificationState {
  enabled: boolean;
  hour: number;
  minute: number;
  /** How many reminders are currently queued, for the settings summary. */
  queued: number;
  /** Set when permission was refused, so the UI can explain itself. */
  denied: boolean;

  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
  /** Re-arms the rolling queue. Called on launch when reminders are on. */
  refresh: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      enabled: false,
      hour: 20,
      minute: 0,
      queued: 0,
      denied: false,

      setEnabled: async (enabled) => {
        if (!enabled) {
          await cancelAll();
          set({ enabled: false, queued: 0 });
          return;
        }

        const { hour, minute } = get();
        const count = await scheduleDailyReminders(hour, minute);
        set({ enabled: count > 0, queued: count, denied: count === 0 });
      },

      setTime: async (hour, minute) => {
        set({ hour, minute });
        if (!get().enabled) return;
        const count = await scheduleDailyReminders(hour, minute);
        set({ queued: count, denied: count === 0 });
      },

      // The queue is a rolling month of individually dated reminders, so it
      // needs topping up whenever the app is opened.
      refresh: async () => {
        if (!get().enabled) return;
        const { hour, minute } = get();
        const count = await scheduleDailyReminders(hour, minute);
        set({ queued: count });
      },
    }),
    {
      name: 'multiverse-notifications-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        hour: state.hour,
        minute: state.minute,
      }),
      onRehydrateStorage: () => (state) => {
        state?.refresh();
      },
    },
  ),
);
