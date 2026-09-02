import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, SectionList, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { CollapsingHeader, useHeaderInset } from '@/components/common/CollapsingHeader';
import { Ambience } from '@/components/common/Ambience';
import { Empty, Marker, Panel } from '@/components/common/Primitives';
import { CountdownHero } from '@/components/roadmap/CountdownHero';
import { TitleLine, type LineStatus } from '@/components/roadmap/TitleLine';
import { CHARACTER_CATALOGUE, usePathMovies, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, HAIRLINE, space, type } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';
import { computeReadiness } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList<MovieItem, PhaseSection>,
);

interface PhaseSection {
  title: string;
  watched: number;
  offset: number;
  data: MovieItem[];
}

export default function RoadmapScreen() {
  const palette = usePalette();
  const router = useRouter();
  const headerInset = useHeaderInset(false);
  const tabBarHeight = useTabBarHeight();
  const scrollY = useSharedValue(0);

  const movies = usePathMovies();
  const toggleWatched = useRoadmapStore((state) => state.toggleWatched);
  const setManyWatched = useRoadmapStore((state) => state.setManyWatched);
  const characterFilterId = useRoadmapStore((state) => state.characterFilterId);
  const setCharacterFilter = useRoadmapStore((state) => state.setCharacterFilter);
  const hydrated = useRoadmapStore((state) => state.hydrated);
  const onboarded = useRoadmapStore((state) => state.onboarded);

  const stats = useMemo(() => computeReadiness(movies), [movies]);
  const filterCharacter = characterFilterId
    ? CHARACTER_CATALOGUE.find((character) => character.id === characterFilterId)
    : undefined;

  // Release order stays release order; the phase markers only give a long
  // scroll something to hold on to. `offset` keeps numbering continuous.
  const sections = useMemo<PhaseSection[]>(() => {
    const out: PhaseSection[] = [];
    let running = 0;
    for (const movie of movies) {
      const title = typeof movie.phase === 'number' ? `Phase ${movie.phase}` : String(movie.phase);
      const last = out[out.length - 1];
      if (last && last.title === title) {
        last.data.push(movie);
      } else {
        out.push({ title, watched: 0, offset: running, data: [movie] });
      }
      running += 1;
    }
    for (const section of out) {
      section.watched = section.data.filter((movie) => movie.isWatched).length;
    }
    return out;
  }, [movies]);

  const nextUpId = stats.nextUp?.id;
  const statusFor = (movie: MovieItem): LineStatus =>
    movie.isWatched ? 'completed' : movie.id === nextUpId ? 'next' : 'upcoming';

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.canvas,
        }}
      >
        <Marker>Restoring your timeline</Marker>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <Ambience />

      <AnimatedSectionList
        sections={sections}
        keyExtractor={(movie) => movie.id}
        stickySectionHeadersEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: headerInset,
          paddingBottom: tabBarHeight + space.xl,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={11}
        ListHeaderComponent={
          <View style={{ paddingBottom: space.sm }}>
            <CountdownHero stats={stats} />

            {/* Offered once. Marking forty titles one at a time is the fastest
                way to lose someone who has already seen most of the saga. */}
            {!onboarded && stats.watched === 0 ? (
              <View style={{ paddingHorizontal: GUTTER, marginTop: space.xl }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Catch me up — mark phases you have already seen"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/catchup');
                  }}
                >
                  <Panel tint={palette.marvel} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, paddingRight: space.md }}>
                      <Marker color={palette.marvel}>Start here</Marker>
                      <Text style={{ ...type.bodyStrong, color: palette.ink, marginTop: space.xs }}>
                        Already seen most of these?
                      </Text>
                      <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                        Mark whole phases in a few taps
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={palette.marvel} />
                  </Panel>
                </Pressable>
              </View>
            ) : null}

            {filterCharacter ? (
              <View style={{ paddingHorizontal: GUTTER, marginTop: space.xl }}>
                <Panel tint={palette.accent} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, paddingRight: space.md }}>
                    <Marker color={palette.accent}>Filtered by character</Marker>
                    <Text
                      style={{ ...type.bodyStrong, color: palette.ink, marginTop: space.xs }}
                      numberOfLines={1}
                    >
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
                </Panel>
              </View>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => {
          const allWatched = section.watched === section.data.length;
          return (
            <View style={{ backgroundColor: palette.canvas }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: GUTTER,
                  paddingTop: space.xl,
                  paddingBottom: space.sm,
                }}
              >
                <Marker style={{ flex: 1 }}>{section.title}</Marker>
                <Text
                  style={{
                    ...type.ordinal,
                    color: palette.inkFaint,
                    fontVariant: ['tabular-nums'],
                    marginRight: space.md,
                  }}
                >
                  {section.watched}/{section.data.length}
                </Text>
                {/* Marking a phase you have already seen, without eighteen taps. */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    allWatched
                      ? `Clear all of ${section.title}`
                      : `Mark all of ${section.title} watched`
                  }
                  hitSlop={12}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setManyWatched(
                      section.data.map((movie) => movie.id),
                      !allWatched,
                    );
                  }}
                >
                  <Ionicons
                    name={allWatched ? 'remove-circle-outline' : 'checkmark-done'}
                    size={16}
                    color={allWatched ? palette.inkFaint : palette.accent}
                  />
                </Pressable>
              </View>
              <View style={{ height: HAIRLINE, backgroundColor: palette.line }} />
            </View>
          );
        }}
        renderItem={({ item, index, section }) => (
          <TitleLine
            movie={item}
            index={section.offset + index}
            status={statusFor(item)}
            onPress={(movie) => router.push({ pathname: '/movie/[id]', params: { id: movie.id } })}
            onToggleWatched={(movie) => toggleWatched(movie.id)}
          />
        )}
        ListEmptyComponent={<Empty icon="planet-outline">Nothing matches that filter.</Empty>}
      />

      <CollapsingHeader scrollY={scrollY} title="Guide to Doomsday" />
    </View>
  );
}
