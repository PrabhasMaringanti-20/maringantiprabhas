import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Poster } from '@/components/common/Poster';
import { Empty, Marker, Rule } from '@/components/common/Primitives';
import { useAllMovies } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { useTopInset } from '@/utils/layout';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { formatRuntime } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

const BUDGETS = [
  { label: '45 min', minutes: 45 },
  { label: '1½ hrs', minutes: 90 },
  { label: '2½ hrs', minutes: 150 },
  { label: 'All evening', minutes: 300 },
];

/**
 * "I have this long — what do I watch?"
 *
 * Fills the time budget from the front of the unwatched list, in release
 * order, because the roadmap's whole premise is that order matters. It is a
 * greedy fill rather than an optimal packing: skipping ahead to squeeze in a
 * shorter film would hand you a title whose setup you have not watched yet.
 */
export default function TonightScreen() {
  const palette = usePalette();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();

  const movies = useAllMovies();
  const [budget, setBudget] = useState(BUDGETS[1].minutes);

  const { picks, usedMinutes, blockedBy, alternatives } = useMemo(() => {
    const unwatched = movies.filter((movie) => !movie.isWatched);
    const chosen: MovieItem[] = [];
    let used = 0;

    for (const movie of unwatched) {
      if (used + movie.runtimeMinutes > budget) break;
      chosen.push(movie);
      used += movie.runtimeMinutes;
    }

    if (chosen.length > 0) {
      return { picks: chosen, usedMinutes: used, blockedBy: undefined, alternatives: [] };
    }

    // Release order is a preference, not a prison. When the very next title is
    // too long, saying "nothing fits" is useless with forty unwatched titles on
    // the list — so offer the shortest ones that do, clearly marked as skipping
    // ahead, and let the reader decide whether they mind.
    const alternatives = [...unwatched]
      .filter((movie) => movie.runtimeMinutes <= budget)
      .sort((a, b) => b.runtimeMinutes - a.runtimeMinutes)
      .slice(0, 6);

    return { picks: [], usedMinutes: 0, blockedBy: unwatched[0], alternatives };
  }, [movies, budget]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + space.xl,
          paddingBottom: insets.bottom + space.huge,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Marker>Tonight</Marker>
            <Text style={{ ...type.display, color: palette.ink, marginTop: space.sm }}>
              How long{'\n'}have you got?
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={14}
          >
            <Ionicons name="close" size={24} color={palette.ink} />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: space.xl,
            paddingHorizontal: GUTTER,
            marginTop: space.xxl,
          }}
        >
          {BUDGETS.map((option) => {
            const active = option.minutes === budget;
            return (
              <Pressable
                key={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.label}
                onPress={() => {
                  Haptics.selectionAsync();
                  setBudget(option.minutes);
                }}
              >
                <Text
                  style={{ ...type.bodyStrong, color: active ? palette.ink : palette.inkFaint }}
                >
                  {option.label}
                </Text>
                <View
                  style={{
                    height: 2,
                    marginTop: space.xs,
                    borderRadius: radius.pill,
                    backgroundColor: active ? palette.accent : 'transparent',
                  }}
                />
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          key={budget}
          entering={FadeIn.duration(motion.base)}
          style={{ marginTop: space.xxl }}
        >
          {picks.length > 0 ? (
            <>
              <View style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}>
                <Marker>
                  {`${picks.length} ${picks.length === 1 ? 'title' : 'titles'} · ${formatRuntime(usedMinutes)} of ${formatRuntime(budget)}`}
                </Marker>
              </View>
              <Rule inset={GUTTER} />

              {picks.map((movie, index) => (
                <Animated.View
                  key={movie.id}
                  entering={FadeInDown.delay(index * motion.stagger).duration(motion.base)}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${movie.title}`}
                    onPress={() => router.push(`/movie/${movie.id}`)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: GUTTER,
                      paddingVertical: space.md,
                    }}
                  >
                    <Poster movie={movie} width={40} hideCaption />
                    <View style={{ flex: 1, marginLeft: space.md }}>
                      <Text style={{ ...type.bodyStrong, color: palette.ink }} numberOfLines={1}>
                        {movie.title}
                      </Text>
                      <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                        {movie.releaseYear} · {formatRuntime(movie.runtimeMinutes)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.inkFaint} />
                  </Pressable>
                  <Rule inset={GUTTER} />
                </Animated.View>
              ))}
            </>
          ) : blockedBy ? (
            <>
              <View style={{ paddingHorizontal: GUTTER }}>
                <Text style={{ ...type.body, color: palette.inkSoft }}>
                  Next in order is{' '}
                  <Text style={{ ...type.bodyStrong, color: palette.ink }}>{blockedBy.title}</Text> at{' '}
                  {formatRuntime(blockedBy.runtimeMinutes)} — longer than you have.
                  {alternatives.length === 0
                    ? ' Nothing else you have left fits either, so this one is worth the wait.'
                    : ''}
                </Text>
              </View>

              {alternatives.length > 0 ? (
                <View style={{ marginTop: space.xxl }}>
                  <View style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}>
                    <Marker>Fits, but skips ahead</Marker>
                  </View>
                  <Rule inset={GUTTER} />
                  {alternatives.map((movie, index) => (
                    <Animated.View
                      key={movie.id}
                      entering={FadeInDown.delay(index * motion.stagger).duration(motion.base)}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${movie.title}`}
                        onPress={() => router.push(`/movie/${movie.id}`)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: GUTTER,
                          paddingVertical: space.md,
                        }}
                      >
                        <Poster movie={movie} width={40} hideCaption />
                        <View style={{ flex: 1, marginLeft: space.md }}>
                          <Text style={{ ...type.bodyStrong, color: palette.ink }} numberOfLines={1}>
                            {movie.title}
                          </Text>
                          <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                            {movie.releaseYear} · {formatRuntime(movie.runtimeMinutes)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={palette.inkFaint} />
                      </Pressable>
                      <Rule inset={GUTTER} />
                    </Animated.View>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <Empty icon="checkmark-done-outline">
              You have logged everything. Nothing left to watch.
            </Empty>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
