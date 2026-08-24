import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ProgressBar } from '@/components/common/ProgressBar';
import { MOVIE_CATALOGUE, ROADMAP_PATHS, useRoadmapStore } from '@/hooks/useRoadmapStore';
import type { PathTag } from '@/types';

const ACCENT_ACTIVE: Record<string, string> = {
  doom: 'border-doom bg-doom/15',
  infinity: 'border-infinity bg-infinity/15',
  incursion: 'border-incursion bg-incursion/15',
};

const ACCENT_TEXT: Record<string, string> = {
  doom: 'text-doom',
  infinity: 'text-infinity',
  incursion: 'text-incursion',
};

const ACCENT_FILL: Record<string, string> = {
  doom: 'bg-doom',
  infinity: 'bg-infinity',
  incursion: 'bg-incursion',
};

/** Horizontal path tabs with a per-path completion meter underneath. */
export function PathSelector() {
  const activePath = useRoadmapStore((state) => state.activePath);
  const setActivePath = useRoadmapStore((state) => state.setActivePath);
  const progress = useRoadmapStore((state) => state.progress);

  const active = ROADMAP_PATHS.find((path) => path.id === activePath) ?? ROADMAP_PATHS[0];

  const countsFor = (pathId: PathTag) => {
    const items = MOVIE_CATALOGUE.filter((movie) => movie.pathTags.includes(pathId));
    const watched = items.filter((movie) => progress[movie.id]?.isWatched).length;
    return { total: items.length, watched, ratio: items.length ? watched / items.length : 0 };
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
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
              className={`min-w-[132px] rounded-2xl border px-3.5 py-3 ${
                isActive ? ACCENT_ACTIVE[path.accent] : 'border-surface-border bg-surface'
              }`}
            >
              <Text
                className={`text-sm font-black ${isActive ? ACCENT_TEXT[path.accent] : 'text-white'}`}
                numberOfLines={1}
              >
                {path.label}
              </Text>
              <Text className="mt-0.5 text-2xs font-semibold uppercase tracking-wider text-muted-deep">
                {path.tagline}
              </Text>

              <View className="mt-2.5">
                <ProgressBar
                  value={counts.ratio}
                  height={4}
                  fillClassName={isActive ? ACCENT_FILL[path.accent] : 'bg-muted-deep'}
                  trackClassName="bg-void"
                />
              </View>
              <Text className="mt-1.5 text-2xs font-semibold text-muted">
                {counts.watched}/{counts.total} watched
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Animated.View key={active.id} entering={FadeIn.duration(260)} className="px-5 pt-3">
        <Text className="text-xs leading-4 text-muted">{active.description}</Text>
      </Animated.View>
    </View>
  );
}
