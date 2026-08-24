import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MOVIE_CATALOGUE, ROADMAP_PATHS, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { formatHours } from '@/utils/timeCalc';
import type { PathTag } from '@/types';

/**
 * Segmented path tabs.
 *
 * One accent colour across the row rather than a colour per path — five
 * competing hues read as noise, and the selection is the only thing that needs
 * to stand out.
 */
export function PathSelector() {
  const activePath = useRoadmapStore((state) => state.activePath);
  const setActivePath = useRoadmapStore((state) => state.setActivePath);
  const progress = useRoadmapStore((state) => state.progress);

  const active = ROADMAP_PATHS.find((path) => path.id === activePath) ?? ROADMAP_PATHS[0];

  const countsFor = (pathId: PathTag) => {
    const items = MOVIE_CATALOGUE.filter((movie) => movie.pathTags.includes(pathId));
    const watched = items.filter((movie) => progress[movie.id]?.isWatched);
    const remaining = items
      .filter((movie) => !progress[movie.id]?.isWatched)
      .reduce((sum, movie) => sum + movie.runtimeMinutes, 0);
    return { total: items.length, watched: watched.length, remaining };
  };

  const activeCounts = countsFor(active.id);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {ROADMAP_PATHS.map((path) => {
          const isActive = path.id === activePath;
          const counts = countsFor(path.id);

          return (
            <Pressable
              key={path.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => {
                Haptics.selectionAsync();
                setActivePath(path.id);
              }}
              className={`flex-row items-center rounded-full border px-3.5 py-2 ${
                isActive ? 'border-accent bg-accent/10' : 'border-line bg-surface'
              }`}
            >
              <Text
                className={`text-[13px] font-bold ${isActive ? 'text-accent' : 'text-ink-soft'}`}
                numberOfLines={1}
              >
                {path.label}
              </Text>
              <Text
                className={`ml-2 text-2xs font-bold tabular-nums ${
                  isActive ? 'text-accent' : 'text-ink-faint'
                }`}
              >
                {counts.watched}/{counts.total}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Animated.View key={active.id} entering={FadeIn.duration(240)} className="px-5 pt-3">
        <Text className="text-[13px] leading-5 text-ink-soft">{active.description}</Text>
        <Text className="mt-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-faint">
          {active.tagline} · {formatHours(activeCounts.remaining)} remaining
        </Text>
      </Animated.View>
    </View>
  );
}
