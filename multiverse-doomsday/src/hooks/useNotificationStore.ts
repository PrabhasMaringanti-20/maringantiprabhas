import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applyPlan, cancelAll } from '@/services/notifications';
import type { PlannedNotification } from '@/services/notificationPlan';

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

  setEnabled: (enabled: boolean, plan?: PlannedNotification[]) => Promise<void>;
  setTime: (hour: number, minute: number) => void;
  /**
   * Replaces the queue with a freshly built plan.
   *
   * The plan is passed in rather than built here: what to say depends on watch
   * progress, and reaching from this store into the roadmap store would couple
   * the two in both directions. The app layer assembles it and hands it over.
   */
  reschedule: (plan: PlannedNotification[]) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      enabled: false,
      hour: 20,
      minute: 0,
      queued: 0,
      denied: false,

      setEnabled: async (enabled, plan) => {
        if (!enabled) {
          await cancelAll();
          set({ enabled: false, queued: 0 });
          return;
        }

        const count = plan ? await applyPlan(plan) : 0;
        set({ enabled: count > 0, queued: count, denied: count === 0 });
      },

      // Only records the preference. The scheduler picks the change up and
      // rebuilds, so the time can be changed without a permission round-trip.
      setTime: (hour, minute) => set({ hour, minute }),

      reschedule: async (plan) => {
        if (!get().enabled) return;
        const count = await applyPlan(plan);
        set({ queued: count, denied: count === 0 });
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

    },
  ),
);
