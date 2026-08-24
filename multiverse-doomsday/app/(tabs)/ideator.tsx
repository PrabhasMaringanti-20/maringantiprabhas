import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { MotiView } from 'moti';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/common/Badge';
import { CountdownBar } from '@/components/common/CountdownBar';
import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';
import { CustomButton } from '@/components/common/CustomButton';
import {
  CHARACTER_CATALOGUE,
  MOVIE_CATALOGUE,
  useFavouriteMovie,
  useGlobalReadiness,
} from '@/hooks/useRoadmapStore';
import { REMINDER_TIMES, useNotificationStore } from '@/hooks/useNotificationStore';
import { hasTmdbKey } from '@/hooks/useTMDB';
import { usePalette, useThemeStore, type ThemeMode } from '@/hooks/useTheme';
import { countdownLine, daysToDoomsday, quoteForDay, QUOTES } from '@/services/notifications';
import { formatHours } from '@/utils/timeCalc';

const INTERESTS = [
  'Secret Wars theories',
  'Incursion mechanics',
  'Casting rumours',
  'Fox-era legacy',
  'Comic deep cuts',
  'Post-credit forensics',
  'Multiverse rules',
  'Tier debates',
];

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Doom', icon: 'skull-outline' },
];

function SectionTitle({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const palette = usePalette();
  return (
    <View className="mb-3 flex-row items-center">
      <Ionicons name={icon} size={14} color={palette.accent} />
      <Text className="ml-2 text-2xs font-bold uppercase tracking-[3px] text-ink-soft">{label}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl border border-line bg-surface px-2 py-3">
      <Text className="text-xl font-black text-ink" numberOfLines={1}>
        {value}
      </Text>
      <Text className="mt-0.5 text-center text-2xs font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </Text>
    </View>
  );
}

export default function IdeatorScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const stats = useGlobalReadiness();
  const favourite = useFavouriteMovie();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const remindersOn = useNotificationStore((state) => state.enabled);
  const reminderHour = useNotificationStore((state) => state.hour);
  const reminderDenied = useNotificationStore((state) => state.denied);
  const setRemindersEnabled = useNotificationStore((state) => state.setEnabled);
  const setReminderTime = useNotificationStore((state) => state.setTime);

  const previewQuote = quoteForDay(daysToDoomsday());

  const shareApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message =
      `I'm ${stats.percent}% Doomsday ready on Multiverse Roadmap — ` +
      `${stats.watched}/${stats.total} titles logged. Built by PRABHAS.MAN. ` +
      `Catch up before Avengers: Doomsday and let's argue theories.`;
    try {
      await Share.share({ message });
    } catch {
      // Sharing was dismissed — nothing to recover.
      await Sharing.isAvailableAsync();
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <DoomAtmosphere particleCount={12} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-4">
          <Text className="text-2xs font-semibold uppercase tracking-[3px] text-ink-faint">
            Ideator
          </Text>
          <Text className="mt-1.5 text-[27px] font-black leading-8 tracking-tight text-ink">
            The one behind it
          </Text>
        </View>

        {/* Identity card */}
        <View className="px-5">
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <LinearGradient
              colors={palette.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: palette.line,
              }}
            >
              <View className="items-center px-5 py-7">
                <LinearGradient
                  colors={[palette.accent, palette.isDark ? '#064E3B' : '#34D399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text className="text-3xl font-black tracking-widest text-white">MP</Text>
                </LinearGradient>

                <Text className="mt-4 text-2xl font-black tracking-tight text-ink">
                  Maringanti Prabhas
                </Text>
                <Text className="mt-1 text-xs font-bold uppercase tracking-[3px] text-accent">
                  Prabhas.man
                </Text>

                <Text className="mt-4 text-center text-sm leading-6 text-ink-soft">
                  Huge Marvel fan, hopelessly addicted to superhero characters. I built this so my
                  people can walk into Avengers: Doomsday actually ready — and so we finally have
                  something to argue over properly.
                </Text>

                <View className="mt-5 flex-row flex-wrap justify-center gap-1.5">
                  <Badge label="Theories" tone="accent" icon="bulb-outline" compact />
                  <Badge label="Rumours" tone="gold" icon="ear-outline" compact />
                  <Badge label="Comic lore" tone="violet" icon="book-outline" compact />
                </View>
              </View>
            </LinearGradient>
          </MotiView>
        </View>

        {/* Live numbers */}
        <View className="mt-6 px-5">
          <SectionTitle icon="stats-chart-outline" label="Where you stand" />
          <View className="flex-row gap-2">
            <Stat value={`${stats.percent}%`} label="Ready" />
            <Stat value={`${stats.watched}/${stats.total}`} label="Logged" />
            <Stat value={formatHours(stats.minutesWatched)} label="Watched" />
          </View>
          {favourite ? (
            <View className="mt-2 rounded-2xl border border-line bg-surface px-4 py-3">
              <Text className="text-2xs font-bold uppercase tracking-wider text-ink-faint">
                Your favourite so far
              </Text>
              <Text className="mt-0.5 text-sm font-bold text-ink" numberOfLines={1}>
                {favourite.title}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Countdown */}
        <View className="mt-6 px-5">
          <SectionTitle icon="hourglass-outline" label="What we're waiting for" />
          <CountdownBar />
        </View>

        {/* Interests */}
        <View className="mt-6 px-5">
          <SectionTitle icon="chatbubbles-outline" label="Talk to me about" />
          <View className="flex-row flex-wrap gap-2">
            {INTERESTS.map((interest, index) => (
              <MotiView
                key={interest}
                from={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 320, delay: index * 45 }}
              >
                <View className="rounded-full border border-line bg-surface px-3 py-1.5">
                  <Text className="text-xs font-semibold text-ink-soft">{interest}</Text>
                </View>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Daily reminders */}
        <View className="mt-6 px-5">
          <SectionTitle icon="notifications-outline" label="Daily reminder" />

          <View className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: remindersOn }}
              accessibilityLabel="Daily Marvel reminder"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRemindersEnabled(!remindersOn);
              }}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-ink">A line a day, plus the count</Text>
                <Text className="mt-0.5 text-2xs leading-4 text-ink-faint">
                  {remindersOn
                    ? `On · ${REMINDER_TIMES.find((t) => t.hour === reminderHour)?.label ?? 'daily'}`
                    : `${QUOTES.length} lines in rotation`}
                </Text>
              </View>

              <View
                className={`h-6 w-11 justify-center rounded-full px-0.5 ${
                  remindersOn ? 'bg-accent' : 'bg-surface-raised'
                }`}
              >
                <View
                  className="h-5 w-5 rounded-full bg-white"
                  style={{ transform: [{ translateX: remindersOn ? 20 : 0 }] }}
                />
              </View>
            </Pressable>

            {remindersOn ? (
              <View className="flex-row gap-2 border-t border-line px-4 py-3">
                {REMINDER_TIMES.map((time) => {
                  const isActive = time.hour === reminderHour;
                  return (
                    <Pressable
                      key={time.label}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Remind me at ${time.label}`}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setReminderTime(time.hour, time.minute);
                      }}
                      className={`flex-1 items-center rounded-xl border py-2 ${
                        isActive ? 'border-accent bg-accent/10' : 'border-line'
                      }`}
                    >
                      <Text
                        className={`text-2xs font-bold ${isActive ? 'text-accent' : 'text-ink-faint'}`}
                      >
                        {time.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {/* What one looks like */}
            <View className="border-t border-line px-4 py-3">
              <Text className="text-[13px] font-semibold leading-5 text-ink">
                “{previewQuote.text}”
              </Text>
              <Text className="mt-1 text-2xs text-ink-faint">
                {previewQuote.character} · {previewQuote.source}
              </Text>
              <Text className="mt-1.5 text-2xs font-bold uppercase tracking-wider text-accent">
                {countdownLine(daysToDoomsday())}
              </Text>
            </View>
          </View>

          {reminderDenied ? (
            <Text className="mt-2 text-2xs leading-4 text-crimson">
              Notifications are switched off for this app. Enable them in system settings, then
              try again.
            </Text>
          ) : (
            <Text className="mt-2 text-2xs leading-4 text-ink-faint">
              Scheduled on your device — no account, no server, works offline.
            </Text>
          )}
        </View>

        {/* Theme */}
        <View className="mt-6 px-5">
          <SectionTitle icon="color-palette-outline" label="Appearance" />
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((option) => {
              const isActive = mode === option.mode;
              return (
                <Pressable
                  key={option.mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${option.label} theme`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMode(option.mode);
                  }}
                  className={`flex-1 items-center rounded-2xl border px-2 py-3 ${
                    isActive ? 'border-accent bg-accent/10' : 'border-line bg-surface'
                  }`}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={isActive ? palette.accent : palette.inkFaint}
                  />
                  <Text
                    className={`mt-1 text-2xs font-bold uppercase tracking-wider ${
                      isActive ? 'text-accent' : 'text-ink-faint'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-2 text-2xs leading-4 text-ink-faint">
            Doom mode runs the green smoke and drifting embers. Light mode keeps it clean for
            daylight reading.
          </Text>
        </View>

        {/* Under the hood */}
        <View className="mt-6 px-5">
          <SectionTitle icon="construct-outline" label="Under the hood" />
          <View className="rounded-2xl border border-line bg-surface px-4 py-4">
            {[
              [`${MOVIE_CATALOGUE.length} titles`, 'curated across five paths'],
              [`${CHARACTER_CATALOGUE.length} characters`, 'with comic-to-MCU context'],
              ['100% offline', 'your progress never leaves the device'],
              [
                hasTmdbKey ? 'TMDB connected' : 'TMDB key not set',
                hasTmdbKey ? 'live posters and streaming links' : 'add one for posters + streaming',
              ],
            ].map(([title, subtitle]) => (
              <View key={title} className="flex-row items-start py-1.5">
                <View className="mt-1.5 h-1 w-1 rounded-full bg-accent" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-ink">{title}</Text>
                  <Text className="text-xs text-ink-faint">{subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Share */}
        <View className="mt-6 px-5">
          <CustomButton
            label="Share your readiness"
            icon="share-social-outline"
            onPress={shareApp}
            fullWidth
          />
        </View>

        <View className="mt-8 items-center px-8">
          <Text className="text-2xs font-bold uppercase tracking-[4px] text-ink-faint">
            Created by
          </Text>
          <Text className="mt-1 text-sm font-black uppercase tracking-[3px] text-ink">
            Prabhas.man
          </Text>

          {/* Required by TMDB's terms of use whenever their API is used. */}
          <Text className="mt-5 text-center text-2xs leading-4 text-ink-faint">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
