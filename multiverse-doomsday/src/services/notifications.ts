import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { buildPlan, QUOTES, quoteForDay, VOICE_LABEL, type PlannedNotification } from '@/services/notificationPlan';
import { countdownTo, DOOMSDAY_RELEASE } from '@/utils/countdown';

export { QUOTES, quoteForDay };
export type { Quote } from '@/services/notificationPlan';
export type { PlanInput, PlannedNotification } from '@/services/notificationPlan';

const CHANNEL_ID = 'doomsday-countdown';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function daysToDoomsday(from: Date = new Date()): number {
  return countdownTo(DOOMSDAY_RELEASE, from).days;
}

/** "115 days to Doomsday" · "Doomsday is today" */
export function countdownLine(days: number): string {
  if (days <= 0) return 'Doomsday is here.';
  if (days === 1) return '1 day to Doomsday.';
  return `${days} days to Doomsday.`;
}

export async function requestPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    status = request.status;
  }

  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Doomsday countdown',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#10B981',
    });
  }

  return true;
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Applies a plan.
 *
 * Everything about *what* to say lives in notificationPlan.ts, which is pure
 * and tested. This function only knows how to hand it to the OS. Existing
 * schedules are cleared first, so calling it repeatedly is safe — it is how the
 * queue is rebuilt whenever progress changes.
 */
export async function applyPlan(plan: PlannedNotification[]): Promise<number> {
  const granted = await requestPermission();
  if (!granted) return 0;

  await cancelAll();

  let scheduled = 0;
  for (const item of plan) {
    const date = new Date(item.at);
    if (date <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        // The speaker is named on its own line so the cast is legible at a
        // glance on the lock screen.
        body: `${item.body}\n${VOICE_LABEL[item.voice]}`,
        data: { kind: item.kind, voice: item.voice },
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
    scheduled += 1;
  }

  return scheduled;
}

export { buildPlan };

/** Fires one immediately, so the user can see what they signed up for. */
export async function sendPreview(): Promise<boolean> {
  const granted = await requestPermission();
  if (!granted) return false;

  const days = daysToDoomsday();
  const quote = quoteForDay(days);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `"${quote.text}"`,
      body: `${quote.character} · ${quote.source}\n${countdownLine(days)}`,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
  return true;
}

export async function scheduledCount(): Promise<number> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}
