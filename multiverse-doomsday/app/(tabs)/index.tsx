import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotiView } from 'moti';

import { Badge } from '@/components/common/Badge';
import { CountdownBar } from '@/components/common/CountdownBar';
import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';
import { PathSelector } from '@/components/roadmap/PathSelector';
import { ReadinessCard } from '@/components/roadmap/ReadinessCard';
import {
  TimelineConnector,
  TimelineNode,
  type NodeStatus,
} from '@/components/roadmap/TimelineNode';
import { CHARACTER_CATALOGUE, ROADMAP_PATHS, usePathMovies, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { computeReadiness } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

import { usePalette } from '@/hooks/useTheme';

export default function RoadmapScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const movies = usePathMovies();
  const activePath = useRoadmapStore((state) => state.activePath);
  const toggleWatched = useRoadmapStore((state) => state.toggleWatched);
  const characterFilterId = useRoadmapStore((state) => state.characterFilterId);
  const setCharacterFilter = useRoadmapStore((state) => state.setCharacterFilter);
  const hydrated = useRoadmapStore((state) => state.hydrated);

  const stats = useMemo(() => computeReadiness(movies), [movies]);
  const path = ROADMAP_PATHS.find((item) => item.id === activePath) ?? ROADMAP_PATHS[0];
  const filterCharacter = characterFilterId
    ? CHARACTER_CATALOGUE.find((character) => character.id === characterFilterId)
    : undefined;

  const nextUpId = stats.nextUp?.id;

  const statusFor = (movie: MovieItem): NodeStatus => {
    if (movie.isWatched) return 'completed';
    return movie.id === nextUpId ? 'next' : 'upcoming';
  };

  const openMovie = (movie: MovieItem) => {
    router.push({ pathname: '/movie/[id]', params: { id: movie.id } });
  };

  // Hold the feed until AsyncStorage has been read, so the ring animates from
  // the real score instead of flashing 0%.
  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <MotiView
          from={{ opacity: 0.35, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 900, loop: true }}
        >
          <Ionicons name="planet" size={44} color={palette.accent} />
        </MotiView>
        <Text className="mt-4 text-2xs font-bold uppercase tracking-[3px] text-ink-soft">
          Restoring your timeline
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <DoomAtmosphere />

      <FlatList
        data={movies}
        keyExtractor={(movie) => movie.id}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View className="px-5 pb-4">
              <Text className="text-2xs font-bold uppercase tracking-[3px] text-accent">
                Multiverse Roadmap
              </Text>
              <Text className="mt-1 text-[32px] font-black leading-9 tracking-tight text-ink">
                Guide to Doomsday
              </Text>
            </View>

            <View className="px-5 pb-4">
              <CountdownBar />
            </View>

            <View className="px-5">
              <ReadinessCard stats={stats} pathLabel={`${path.label} path`} />
            </View>

            <View className="pt-5">
              <PathSelector />
            </View>

            {filterCharacter ? (
              <View className="mt-4 px-5">
                <View className="flex-row items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-2xs font-bold uppercase tracking-wider text-accent">
                      Filtered by character
                    </Text>
                    <Text className="mt-0.5 text-sm font-bold text-ink" numberOfLines={1}>
                      {filterCharacter.alias} — {movies.length} appearance
                      {movies.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear character filter"
                    hitSlop={10}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCharacterFilter(null);
                    }}
                  >
                    <Ionicons name="close-circle" size={22} color={palette.accent} />
                  </Pressable>
                </View>
              </View>
            ) : null}

            <View className="mb-2 mt-6 flex-row items-center justify-between px-5">
              <Text className="text-xs font-bold uppercase tracking-[2px] text-ink">
                Timeline
              </Text>
              <Badge
                label={`${movies.length} ${movies.length === 1 ? 'entry' : 'entries'}`}
                tone="muted"
                compact
              />
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="px-5">
            <TimelineNode
              movie={item}
              index={index}
              status={statusFor(item)}
              onPress={openMovie}
              onToggleWatched={(movie) => toggleWatched(movie.id)}
            />
          </View>
        )}
        ItemSeparatorComponent={({ leadingItem }) => (
          <TimelineConnector isComplete={(leadingItem as MovieItem | undefined)?.isWatched ?? false} />
        )}
        ListEmptyComponent={
          <View className="items-center px-10 py-16">
            <Ionicons name="planet-outline" size={40} color={palette.line} />
            <Text className="mt-3 text-center text-sm text-ink-soft">
              Nothing on this path yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}
