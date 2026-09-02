import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Poster } from '@/components/common/Poster';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Surface } from '@/components/common/Surface';
import {
  RELEVANCE_LABEL,
  useStingerCounts,
  useStingers,
  type StingerRow,
} from '@/hooks/usePostCredits';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, radius, space, type } from '@/styles/tokens';
import type { StingerRelevance } from '@/types';

type Filter = StingerRelevance | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'direct', label: 'Feeds Doomsday' },
  { key: 'thread', label: 'Loose threads' },
  { key: 'none', label: 'Self-contained' },
];

export default function PostCreditsScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useStingers(filter);
  const counts = useStingerCounts();

  // Relevance is the only colour signal on this screen, so it has to be legible
  // at a glance and consistent with the rest of the app's palette.
  const relevanceColour: Record<StingerRelevance, string> = {
    direct: palette.marvel,
    thread: palette.accent,
    none: palette.inkFaint,
    unreleased: palette.violet,
  };

  const renderRow = ({ item }: { item: StingerRow }) => {
    const { movie, entry } = item;
    const tint = relevanceColour[entry.relevance];

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${movie.title}`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/movie/${movie.id}`);
        }}
        style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}
      >
        <Surface padded={false} style={{ overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', padding: space.lg }}>
            <Poster movie={movie} width={54} hideCaption disableFetch />

            <View style={{ flex: 1, marginLeft: space.md }}>
              <Text style={{ ...type.bodyStrong, color: palette.ink }} numberOfLines={2}>
                {movie.title}
              </Text>
              <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 2 }}>
                {movie.releaseYear} · {entry.scenes.length}{' '}
                {entry.scenes.length === 1 ? 'scene' : 'scenes'}
              </Text>

              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: space.sm,
                  paddingHorizontal: space.sm,
                  paddingVertical: 3,
                  borderRadius: radius.pill,
                  backgroundColor: `${tint}1F`,
                  borderWidth: 1,
                  borderColor: `${tint}55`,
                }}
              >
                <Text style={{ ...type.label, color: tint, textTransform: 'uppercase' }}>
                  {RELEVANCE_LABEL[entry.relevance]}
                </Text>
              </View>
            </View>
          </View>

          {/* Scenes */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: palette.line,
              backgroundColor: palette.raised,
              paddingHorizontal: space.lg,
              paddingVertical: space.md,
            }}
          >
            {entry.scenes.map((scene, index) => (
              <View key={index} style={{ marginTop: index > 0 ? space.md : 0 }}>
                <Text style={{ ...type.label, color: tint, textTransform: 'uppercase' }}>
                  {scene.kind === 'mid' ? 'Mid-credits' : 'Post-credits'}
                </Text>
                <Text style={{ ...type.body, color: palette.ink, marginTop: space.xs }}>
                  {scene.summary}
                </Text>
                <Text style={{ ...type.small, color: palette.inkSoft, marginTop: space.xs }}>
                  Sets up: {scene.setsUp}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.movie.id}
        renderItem={renderRow}
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xxxl }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        windowSize={9}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              eyebrow="Stingers"
              title="Post-credits"
              subtitle={`${counts.all} titles hide a scene. ${counts.direct} feed Doomsday directly.`}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  onPress={router.back}
                  hitSlop={12}
                  style={{
                    height: 36,
                    width: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: palette.line,
                    backgroundColor: palette.surface,
                  }}
                >
                  <Ionicons name="close" size={18} color={palette.ink} />
                </Pressable>
              }
            />

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: space.sm,
                paddingHorizontal: GUTTER,
                paddingBottom: space.lg,
              }}
            >
              {FILTERS.map(({ key, label }) => {
                const active = filter === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFilter(key);
                    }}
                    style={{
                      paddingHorizontal: space.md,
                      paddingVertical: space.sm,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: active ? palette.accent : palette.line,
                      backgroundColor: active ? `${palette.accent}1F` : palette.surface,
                    }}
                  >
                    <Text
                      style={{
                        ...type.small,
                        fontWeight: '700',
                        color: active ? palette.accent : palette.inkSoft,
                      }}
                    >
                      {label} {counts[key]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: GUTTER, paddingTop: space.xxl, alignItems: 'center' }}>
            <Text style={{ ...type.body, color: palette.inkFaint, textAlign: 'center' }}>
              Nothing in this bucket.
            </Text>
          </View>
        }
      />
    </View>
  );
}
