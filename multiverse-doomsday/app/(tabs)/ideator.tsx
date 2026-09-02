import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { Ambience } from '@/components/common/Ambience';
import { CollapsingHeader, useHeaderInset } from '@/components/common/CollapsingHeader';
import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Rule, Section, Stat } from '@/components/common/Primitives';
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
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';
import { formatHoursCompact } from '@/utils/timeCalc';

const PROFILE_PHOTO = require('../../assets/images/prabhas.jpg');

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

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

export default function IdeatorScreen() {
  const palette = usePalette();
  const headerInset = useHeaderInset();
  const tabBarHeight = useTabBarHeight();
  const scrollY = useSharedValue(0);

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

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const shareApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message =
      `I'm ${stats.percent}% Doomsday ready on DOOM — ` +
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
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <Ambience />

      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: headerInset,
          paddingBottom: tabBarHeight + space.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity — photo and words on the page, not in a gradient card */}
        <Animated.View
          entering={FadeInDown.duration(motion.slow)}
          style={{ paddingHorizontal: GUTTER }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: radius.pill,
                overflow: 'hidden',
                backgroundColor: palette.raised,
              }}
            >
              <Image
                source={PROFILE_PHOTO}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={220}
              />
            </View>

            <View style={{ flex: 1, marginLeft: space.lg }}>
              <Text style={{ ...type.title, color: palette.ink }}>Maringanti Prabhas</Text>
              <Marker color={palette.accent} style={{ marginTop: space.xs }}>
                PRABHAS.MAN
              </Marker>
            </View>
          </View>

          <Text style={{ ...type.body, color: palette.inkSoft, marginTop: space.xl }}>
            Huge Marvel fan, hopelessly addicted to superhero characters. I built this so my people
            can walk into Avengers: Doomsday actually ready — and so we finally have something to
            argue over properly.
          </Text>
        </Animated.View>

        {/* Where you stand */}
        <Section title="Where you stand" index={1}>
          <View style={{ flexDirection: 'row', paddingHorizontal: GUTTER }}>
            <Stat value={`${stats.percent}%`} label="ready" />
            <Stat value={`${stats.watched}/${stats.total}`} label="logged" />
            <Stat value={formatHoursCompact(stats.minutesWatched)} label="watched" />
          </View>

          {favourite ? (
            <View style={{ paddingHorizontal: GUTTER, marginTop: space.xl }}>
              <Rule />
              <View style={{ paddingVertical: space.md }}>
                <Marker>Your favourite so far</Marker>
                <Text
                  style={{ ...type.bodyStrong, color: palette.ink, marginTop: space.xs }}
                  numberOfLines={1}
                >
                  {favourite.title}
                </Text>
              </View>
              <Rule />
            </View>
          ) : null}
        </Section>

        {/* Interests */}
        <Section title="Talk to me about" index={2}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: space.sm,
              paddingHorizontal: GUTTER,
            }}
          >
            {INTERESTS.map((interest, index) => (
              <Animated.View
                key={interest}
                entering={FadeIn.delay(index * motion.stagger).duration(motion.base)}
              >
                <View
                  style={{
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: palette.line,
                    paddingHorizontal: space.md,
                    paddingVertical: space.sm - 1,
                  }}
                >
                  <Text style={{ ...type.small, color: palette.inkSoft }}>{interest}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Section>

        {/* Daily reminder */}
        <Section title="Daily reminder" index={3}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <Rule />
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: remindersOn }}
              accessibilityLabel="Daily Marvel reminder"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRemindersEnabled(!remindersOn);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: space.lg,
              }}
            >
              <View style={{ flex: 1, paddingRight: space.md }}>
                <Text style={{ ...type.bodyStrong, color: palette.ink }}>
                  A line a day, plus the count
                </Text>
                <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                  {remindersOn
                    ? `On · ${REMINDER_TIMES.find((t) => t.hour === reminderHour)?.label ?? 'daily'}`
                    : `${QUOTES.length} lines in rotation`}
                </Text>
              </View>

              <View
                style={{
                  height: 24,
                  width: 42,
                  borderRadius: radius.pill,
                  padding: 2,
                  justifyContent: 'center',
                  backgroundColor: remindersOn ? palette.accent : palette.raised,
                  borderWidth: remindersOn ? 0 : 1,
                  borderColor: palette.line,
                }}
              >
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: radius.pill,
                    backgroundColor: remindersOn ? '#FFFFFF' : palette.inkFaint,
                    transform: [{ translateX: remindersOn ? 18 : 0 }],
                  }}
                />
              </View>
            </Pressable>
            <Rule />

            {remindersOn ? (
              <View style={{ flexDirection: 'row', gap: space.xl, paddingVertical: space.md }}>
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
                    >
                      <Text
                        style={{
                          ...type.small,
                          fontWeight: '600',
                          color: isActive ? palette.accent : palette.inkFaint,
                        }}
                      >
                        {time.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {/* What one looks like */}
            <View style={{ paddingVertical: space.lg }}>
              <Text style={{ ...type.body, fontWeight: '600', color: palette.ink }}>
                “{previewQuote.text}”
              </Text>
              <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
                {previewQuote.character} · {previewQuote.source}
              </Text>
              <Marker color={palette.accent} style={{ marginTop: space.sm }}>
                {countdownLine(daysToDoomsday())}
              </Marker>
            </View>
            <Rule />

            <Text
              style={{
                ...type.small,
                color: reminderDenied ? palette.crimson : palette.inkFaint,
                marginTop: space.md,
              }}
            >
              {reminderDenied
                ? 'Notifications are switched off for this app. Enable them in system settings, then try again.'
                : 'Scheduled on your device — no account, no server, works offline.'}
            </Text>
          </View>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" index={4}>
          <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: GUTTER }}>
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
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: space.lg,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: isActive ? palette.accent : palette.line,
                    backgroundColor: isActive ? `${palette.accent}14` : 'transparent',
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={17}
                    color={isActive ? palette.accent : palette.inkFaint}
                  />
                  <Marker
                    color={isActive ? palette.accent : palette.inkFaint}
                    style={{ marginTop: space.sm }}
                  >
                    {option.label}
                  </Marker>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Under the hood */}
        <Section title="Under the hood" index={5}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <Rule />
            {[
              [`${MOVIE_CATALOGUE.length} titles`, 'every film and series, in release order'],
              [`${CHARACTER_CATALOGUE.length} characters`, 'with comic-to-MCU context'],
              ['100% offline', 'your progress never leaves the device'],
              [
                hasTmdbKey ? 'TMDB connected' : 'TMDB key not set',
                hasTmdbKey ? 'live posters and streaming links' : 'add one for posters + streaming',
              ],
            ].map(([title, subtitle]) => (
              <View key={title}>
                <View style={{ paddingVertical: space.md }}>
                  <Text style={{ ...type.bodyStrong, color: palette.ink }}>{title}</Text>
                  <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                    {subtitle}
                  </Text>
                </View>
                <Rule />
              </View>
            ))}
          </View>
        </Section>

        {/* Share */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <CustomButton
            label="Share your readiness"
            icon="share-social-outline"
            size="lg"
            onPress={shareApp}
            fullWidth
          />
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: space.xxxl, marginTop: space.huge }}>
          <Marker>Created by</Marker>
          <Text
            style={{
              ...type.heading,
              color: palette.ink,
              letterSpacing: 3,
              marginTop: space.sm,
            }}
          >
            PRABHAS.MAN
          </Text>

          {/* Required by TMDB's terms of use whenever their API is used. */}
          <Text
            style={{
              ...type.small,
              color: palette.inkFaint,
              textAlign: 'center',
              marginTop: space.xxl,
            }}
          >
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </Text>
        </View>
      </AnimatedScrollView>

      <CollapsingHeader
        scrollY={scrollY}
        title="Ideator"
        large={{ eyebrow: 'Ideator', title: 'The one behind it' }}
      />
    </View>
  );
}
