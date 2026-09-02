import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, SectionList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotiView } from 'moti';

import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Surface } from '@/components/common/Surface';
import { MovieRow, type RowStatus } from '@/components/roadmap/MovieRow';
import { RoadmapSummary } from '@/components/roadmap/RoadmapSummary';
import { CHARACTER_CATALOGUE, usePathMovies, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, radius, space, type } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';
import { computeReadiness } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

interface PhaseSection {
  title: string;
  watched: number;
  data: MovieItem[];
}

export default function RoadmapScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const movies = usePathMovies();
  const toggleWatched = useRoadmapStore((state) => state.toggleWatched);
  const characterFilterId = useRoadmapStore((state) => state.characterFilterId);
  const setCharacterFilter = useRoadmapStore((state) => state.setCharacterFilter);
  const hydrated = useRoadmapStore((state) => state.hydrated);

  const stats = useMemo(() => computeReadiness(movies), [movies]);
  const filterCharacter = characterFilterId
    ? CHARACTER_CATALOGUE.find((character) => character.id === characterFilterId)
    : undefined;

  // Release order is still release order — the phase headings only give a
  // 68-entry feed something to hold on to while scrolling.
  const sections = useMemo<PhaseSection[]>(() => {
    const out: PhaseSection[] = [];
    for (const movie of movies) {
      const title = typeof movie.phase === 'number' ? `Phase ${movie.phase}` : String(movie.phase);
      const last = out[out.length - 1];
      if (last && last.title === title) last.data.push(movie);
      else out.push({ title, watched: 0, data: [movie] });
    }
    for (const section of out) {
      section.watched = section.data.filter((movie) => movie.isWatched).length;
    }
    return out;
  }, [movies]);

  const nextUpId = stats.nextUp?.id;
  const statusFor = (movie: MovieItem): RowStatus => {
    if (movie.isWatched) return 'completed';
    return movie.id === nextUpId ? 'next' : 'upcoming';
  };

  const openMovie = (movie: MovieItem) => {
    router.push({ pathname: '/movie/[id]', params: { id: movie.id } });
  };

  // Hold the feed until AsyncStorage has been read, so progress does not
  // flash empty before the real numbers arrive.
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.canvas }}>
        <MotiView
          from={{ opacity: 0.35, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 900, loop: true }}
        >
          <Ionicons name="planet" size={40} color={palette.accent} />
        </MotiView>
        <Text style={{ ...type.label, color: palette.inkSoft, marginTop: space.lg, textTransform: 'uppercase' }}>
          Restoring your timeline
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <DoomAtmosphere />

      <SectionList
        sections={sections}
        keyExtractor={(movie) => movie.id}
        stickySectionHeadersEnabled
        contentContainerStyle={{
          paddingTop: insets.top + space.sm,
          paddingBottom: tabBarHeight + space.xl,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={11}
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow="Multiverse roadmap" title="Guide to Doomsday" />

            <View style={{ paddingHorizontal: GUTTER }}>
              <RoadmapSummary stats={stats} />
            </View>

            {filterCharacter ? (
              <View style={{ paddingHorizontal: GUTTER, marginTop: space.md }}>
                <Surface
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: `${palette.accent}66`,
                    backgroundColor: `${palette.accent}14`,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: space.md }}>
                    <Text style={{ ...type.label, color: palette.accent, textTransform: 'uppercase' }}>
                      Filtered by character
                    </Text>
                    <Text style={{ ...type.bodyStrong, color: palette.ink, marginTop: 2 }} numberOfLines={1}>
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
                </Surface>
              </View>
            ) : null}

            <View style={{ height: space.lg }} />
          </View>
        }
        renderSectionHeader={({ section }) => {
          const { title, watched, data } = section as PhaseSection;
          return (
            <View
              style={{
                paddingHorizontal: GUTTER,
                paddingTop: space.md,
                paddingBottom: space.sm,
                backgroundColor: palette.canvas,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ ...type.label, color: palette.inkSoft, textTransform: 'uppercase', flex: 1 }}>
                {title}
              </Text>
              <View
                style={{
                  paddingHorizontal: space.sm,
                  paddingVertical: 2,
                  borderRadius: radius.pill,
                  backgroundColor: palette.raised,
                  borderWidth: 1,
                  borderColor: palette.line,
                }}
              >
                <Text style={{ ...type.label, color: palette.inkFaint }}>
                  {watched}/{data.length}
                </Text>
              </View>
            </View>
          );
        }}
        renderItem={({ item, index, section }) => {
          // Numbering runs across the whole feed, not per section.
          const offset = sections
            .slice(0, sections.indexOf(section as PhaseSection))
            .reduce((sum, s) => sum + s.data.length, 0);
          return (
            <View style={{ paddingHorizontal: GUTTER, paddingBottom: space.sm }}>
              <MovieRow
                movie={item}
                index={offset + index}
                status={statusFor(item)}
                onPress={openMovie}
                onToggleWatched={(movie) => toggleWatched(movie.id)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingHorizontal: space.xxxl, paddingVertical: 64 }}>
            <Ionicons name="planet-outline" size={40} color={palette.line} />
            <Text style={{ ...type.body, color: palette.inkSoft, marginTop: space.md, textAlign: 'center' }}>
              Nothing matches that filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}
