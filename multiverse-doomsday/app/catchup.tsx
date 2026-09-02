import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Rule } from '@/components/common/Primitives';
import { MOVIE_CATALOGUE, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { useTopInset } from '@/utils/layout';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { formatHoursCompact } from '@/utils/timeCalc';
import type { MovieCatalogueItem } from '@/types';

interface PhaseGroup {
  label: string;
  ids: string[];
  minutes: number;
}

/**
 * First-run catch-up.
 *
 * Most people arriving at this app have already seen forty of the sixty-eight
 * titles. Making them tap forty checkmarks before the app tells them anything
 * useful is the fastest way to lose them, so the first thing it asks is which
 * phases they have already done.
 */
export default function CatchUpScreen() {
  const palette = usePalette();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();

  const setManyWatched = useRoadmapStore((state) => state.setManyWatched);
  const completeOnboarding = useRoadmapStore((state) => state.completeOnboarding);
  const progress = useRoadmapStore((state) => state.progress);

  const phases = useMemo<PhaseGroup[]>(() => {
    const map = new Map<string, PhaseGroup>();
    for (const movie of MOVIE_CATALOGUE as MovieCatalogueItem[]) {
      const label = typeof movie.phase === 'number' ? `Phase ${movie.phase}` : String(movie.phase);
      const group = map.get(label) ?? { label, ids: [], minutes: 0 };
      group.ids.push(movie.id);
      group.minutes += movie.runtimeMinutes;
      map.set(label, group);
    }
    return [...map.values()];
  }, []);

  // Seed from what is already marked, so re-opening this screen is not a reset.
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const phase of phases) {
      const watched = phase.ids.filter((id) => progress[id]?.isWatched).length;
      if (watched > phase.ids.length / 2) initial.add(phase.label);
    }
    return initial;
  });

  const toggle = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const chosen = phases.filter((phase) => selected.has(phase.label));
  const titleCount = chosen.reduce((sum, phase) => sum + phase.ids.length, 0);
  const minutes = chosen.reduce((sum, phase) => sum + phase.minutes, 0);

  const apply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Applied as one batch per direction so a phase toggled off is cleared too.
    const on: string[] = [];
    const off: string[] = [];
    for (const phase of phases) {
      (selected.has(phase.label) ? on : off).push(...phase.ids);
    }
    if (on.length) setManyWatched(on, true);
    if (off.length) setManyWatched(off, false);
    completeOnboarding();
    router.back();
  };

  const skip = () => {
    completeOnboarding();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + space.xxl,
          paddingBottom: insets.bottom + space.huge,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(motion.slow)}
          style={{ paddingHorizontal: GUTTER }}
        >
          <Marker>Catch me up</Marker>
          <Text style={{ ...type.display, color: palette.ink, marginTop: space.sm }}>
            What have you{'\n'}already seen?
          </Text>
          <Text style={{ ...type.body, color: palette.inkSoft, marginTop: space.md }}>
            Tap the phases you have watched. You can change any single title later.
          </Text>
        </Animated.View>

        <View style={{ marginTop: space.xxl }}>
          <Rule inset={GUTTER} />
          {phases.map((phase, index) => {
            const isOn = selected.has(phase.label);
            return (
              <Animated.View
                key={phase.label}
                entering={FadeInDown.delay(index * motion.stagger).duration(motion.base)}
              >
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isOn }}
                  accessibilityLabel={`${phase.label}, ${phase.ids.length} titles`}
                  onPress={() => toggle(phase.label)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: GUTTER,
                    paddingVertical: space.lg,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        ...type.bodyStrong,
                        color: isOn ? palette.ink : palette.inkSoft,
                      }}
                    >
                      {phase.label}
                    </Text>
                    <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                      {phase.ids.length} titles · {formatHoursCompact(phase.minutes)}
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 26,
                      width: 26,
                      borderRadius: radius.pill,
                      borderWidth: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: isOn ? palette.accent : palette.line,
                      backgroundColor: isOn ? `${palette.accent}1F` : 'transparent',
                    }}
                  >
                    {isOn ? (
                      <Ionicons name="checkmark-sharp" size={14} color={palette.accent} />
                    ) : null}
                  </View>
                </Pressable>
                <Rule inset={GUTTER} />
              </Animated.View>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <Text style={{ ...type.small, color: palette.inkFaint, marginBottom: space.lg }}>
            {titleCount === 0
              ? 'Nothing selected — you will start from zero.'
              : `${titleCount} titles · ${formatHoursCompact(minutes)} logged`}
          </Text>

          <CustomButton
            label={titleCount === 0 ? 'Start from scratch' : `Log ${titleCount} titles`}
            icon="checkmark-done"
            size="lg"
            fullWidth
            haptic={null}
            onPress={apply}
          />

          <View style={{ marginTop: space.md }}>
            <CustomButton
              label="Skip for now"
              variant="ghost"
              size="lg"
              fullWidth
              onPress={skip}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
