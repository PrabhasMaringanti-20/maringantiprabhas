import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import quotesJson from '@/data/quotes.json';
import { countdownTo, DOOMSDAY_RELEASE } from '@/utils/countdown';

export interface Quote {
  text: string;
  character: string;
  source: string;
}

export const QUOTES = quotesJson as Quote[];

const CHANNEL_ID = 'doomsday-countdown';
/**
 * How far ahead to schedule. Each notification carries its own quote and its
 * own day count, so they are scheduled individually rather than as one repeat,
 * and topped up whenever the app opens.
 */
const HORIZON_DAYS = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Deterministic pick, so a given day always gets the same line. */
export function quoteForDay(dayIndex: number): Quote {
  return QUOTES[Math.abs(dayIndex) % QUOTES.length];
}

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
 * Schedules one notification a day for the next month: a Marvel line, and how
 * many days are left. Existing schedules are cleared first, so calling this
 * repeatedly is safe — it is how the queue is topped up on each launch.
 */
export async function scheduleDailyReminders(hour: number, minute: number): Promise<number> {
  const granted = await requestPermission();
  if (!granted) return 0;

  await cancelAll();

  const now = new Date();
  let scheduled = 0;

  for (let offset = 0; offset < HORIZON_DAYS; offset += 1) {
    const fireDate = new Date(now);
    fireDate.setDate(now.getDate() + offset);
    fireDate.setHours(hour, minute, 0, 0);

    if (fireDate <= now) continue;
    if (fireDate > DOOMSDAY_RELEASE) break;

    const days = daysToDoomsday(fireDate);
    const quote = quoteForDay(
      Math.floor(fireDate.getTime() / 86_400_000) + fireDate.getMonth(),
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `"${quote.text}"`,
        body: `${quote.character} · ${quote.source}\n${countdownLine(days)}`,
        data: { days, source: quote.source },
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
    scheduled += 1;
  }

  return scheduled;
}

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
