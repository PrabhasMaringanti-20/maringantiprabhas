import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { CollapsingHeader, useHeaderInset } from '@/components/common/CollapsingHeader';
import { Poster } from '@/components/common/Poster';
import { Empty, Marker, Rule } from '@/components/common/Primitives';
import { useRelevanceColour } from '@/components/roadmap/StingerCard';
import { RELEVANCE_LABEL, useStingerCounts, useStingers, type StingerRow } from '@/hooks/usePostCredits';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import type { StingerRelevance } from '@/types';

type Filter = StingerRelevance | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'direct', label: 'Feeds Doomsday' },
  { key: 'thread', label: 'Threads' },
  { key: 'none', label: 'Self-contained' },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<StingerRow>);

export default function PostCreditsScreen() {
  const palette = usePalette();
  const router = useRouter();
  const headerInset = useHeaderInset();
  const scrollY = useSharedValue(0);
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useStingers(filter);
  const counts = useStingerCounts();
  const tint = useRelevanceColour();

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const close = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={router.back}
      hitSlop={12}
    >
      <Ionicons name="close" size={22} color={palette.ink} />
    </Pressable>
  );

  const renderRow = ({ item, index }: { item: StingerRow; index: number }) => {
    const { movie, entry } = item;
    const colour = tint[entry.relevance];

    return (
      <Animated.View entering={FadeIn.delay(Math.min(index, 8) * motion.stagger).duration(motion.base)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${movie.title}`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/movie/${movie.id}`);
          }}
          style={{ paddingHorizontal: GUTTER, paddingVertical: space.lg }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Poster movie={movie} width={38} hideCaption />
            <View style={{ flex: 1, marginLeft: space.md }}>
              <Text style={{ ...type.bodyStrong, color: palette.ink }} numberOfLines={1}>
                {movie.title}
              </Text>
              <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                {movie.releaseYear} · {entry.scenes.length}{' '}
                {entry.scenes.length === 1 ? 'scene' : 'scenes'}
              </Text>
            </View>
            <Marker color={colour}>{RELEVANCE_LABEL[entry.relevance]}</Marker>
          </View>

          <View style={{ marginTop: space.md, paddingLeft: 38 + space.md }}>
            {entry.scenes.map((scene, sceneIndex) => (
              <View key={sceneIndex} style={{ marginTop: sceneIndex > 0 ? space.md : 0 }}>
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      width: 2,
                      borderRadius: radius.pill,
                      backgroundColor: colour,
                      opacity: 0.55,
                      marginRight: space.md,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Marker color={palette.inkFaint}>
                      {scene.kind === 'mid' ? 'Mid-credits' : 'Post-credits'}
                    </Marker>
                    <Text style={{ ...type.body, color: palette.ink, marginTop: space.xs }}>
                      {scene.summary}
                    </Text>
                    <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
                      Sets up: {scene.setsUp}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Pressable>
        <Rule inset={GUTTER} />
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <AnimatedFlatList
        data={rows}
        keyExtractor={(item) => item.movie.id}
        renderItem={renderRow}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerInset, paddingBottom: space.huge }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        windowSize={9}
        ListHeaderComponent={
          <View style={{ paddingBottom: space.md }}>
            <Text style={{ ...type.small, color: palette.inkSoft, paddingHorizontal: GUTTER }}>
              {counts.all} titles hide a scene. {counts.direct} feed Doomsday directly.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: space.xl,
                paddingHorizontal: GUTTER,
                paddingTop: space.xl,
                paddingBottom: space.md,
              }}
            >
              {FILTERS.map(({ key, label }) => {
                const active = filter === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={label}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFilter(key);
                    }}
                  >
                    <Text
                      style={{
                        ...type.bodyStrong,
                        color: active ? palette.ink : palette.inkFaint,
                      }}
                    >
                      {label}
                      <Text style={{ ...type.ordinal, color: palette.inkFaint }}> {counts[key]}</Text>
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
            <Rule inset={GUTTER} />
          </View>
        }
        ListEmptyComponent={<Empty icon="film-outline">Nothing in this bucket.</Empty>}
      />

      <CollapsingHeader
        scrollY={scrollY}
        title="Post-credits"
        large={{ eyebrow: 'Stingers', title: 'Post-credits' }}
        trailing={close}
      />
    </View>
  );
}
