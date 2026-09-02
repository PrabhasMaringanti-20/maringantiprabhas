import { useCallback, useRef, useState } from 'react';

import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';

import { BottomSheet } from '@/components/common/BottomSheet';
import { CollapsingHeader, useHeaderInset } from '@/components/common/CollapsingHeader';
import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Meter, Section } from '@/components/common/Primitives';
import { StarRating } from '@/components/common/StarRating';
import { DraggableItem } from '@/components/tierlist/DraggableItem';
import { ShareCard } from '@/components/tierlist/ShareCard';
import { MeasuredDropZone, TIER_STYLE, TierRow, type DropTarget } from '@/components/tierlist/TierRow';
import {
  useFavouriteMovie,
  useGlobalReadiness,
  useRoadmapStore,
  useTierBoard,
} from '@/hooks/useRoadmapStore';
import { TIERS, type MovieItem, type Tier } from '@/types';

import { Ambience } from '@/components/common/Ambience';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, space, type } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function TierStudioScreen() {
  const palette = usePalette();
  const headerInset = useHeaderInset();
  const tabBarHeight = useTabBarHeight();
  const scrollY = useSharedValue(0);
  const { tiers, unranked } = useTierBoard();
  const stats = useGlobalReadiness();
  const favourite = useFavouriteMovie();
  const setTier = useRoadmapStore((state) => state.setTier);
  const setRating = useRoadmapStore((state) => state.setRating);

  const [selected, setSelected] = useState<MovieItem | null>(null);
  const [measureToken, setMeasureToken] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Drop zones report absolute window Y ranges; a drag resolves against them.
  const zones = useRef<Record<string, { top: number; bottom: number }>>({});
  const shareCardRef = useRef<View>(null);

  const handleMeasure = useCallback((target: DropTarget, top: number, bottom: number) => {
    zones.current[target] = { top, bottom };
  }, []);

  const resolveDropTier = useCallback((absoluteY: number): DropTarget | null => {
    for (const [target, range] of Object.entries(zones.current)) {
      if (absoluteY >= range.top && absoluteY <= range.bottom) return target as DropTarget;
    }
    return null;
  }, []);

  const rankedCount = TIERS.reduce((sum, tier) => sum + tiers[tier].length, 0);
  const topTierLabel = TIERS.find((tier) => tiers[tier].length > 0) ?? 'S';

  const exportStoryCard = async () => {
    try {
      setExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Doomsday readiness',
          UTI: 'public.png',
        });
      } else {
        Alert.alert('Story card ready', `Saved to:\n${uri}`);
      }
    } catch {
      Alert.alert('Export failed', 'Could not render the story card. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const assignTier = (movie: MovieItem, tier: Tier | undefined) => {
    setTier(movie.id, tier);
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

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
        {/* One line of state, rather than a countdown card stacked on a
            readiness card — both of those already lead the Roadmap and Prep. */}
        <View style={{ paddingHorizontal: GUTTER }}>
          <Meter value={stats.percent} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.sm }}>
            <Text
              style={{
                ...type.small,
                fontWeight: '600',
                color: palette.ink,
                fontVariant: ['tabular-nums'],
              }}
            >
              {rankedCount} ranked
            </Text>
            <Text style={{ ...type.small, color: palette.inkFaint, marginLeft: space.sm, flex: 1 }}>
              {stats.watched}/{stats.total} watched · long-press a poster to drag it
            </Text>
          </View>
        </View>

        {/* Tier board */}
        <View style={{ marginTop: space.xl }}>
          {TIERS.map((tier) => (
            <TierRow
              key={tier}
              tier={tier}
              movies={tiers[tier]}
              onMeasure={handleMeasure}
              measureToken={measureToken}
            >
              {tiers[tier].map((movie) => (
                <DraggableItem
                  key={movie.id}
                  movie={movie}
                  resolveDropTier={resolveDropTier}
                  onDrop={assignTier}
                  onPress={setSelected}
                  onDragStart={() => setMeasureToken((token) => token + 1)}
                />
              ))}
            </TierRow>
          ))}
        </View>

        {/* Bench */}
        <View style={{ marginTop: space.xl }}>
          <View style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}>
            <Marker>{`Watched · unranked (${unranked.length})`}</Marker>
          </View>
          <MeasuredDropZone
            target="unranked"
            onMeasure={handleMeasure}
            measureToken={measureToken}
            style={{ paddingHorizontal: GUTTER, paddingVertical: space.md }}
          >
            <View
              style={{
                minHeight: 78,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: space.sm,
              }}
            >
              {unranked.length === 0 ? (
                <Text style={{ ...type.small, color: palette.inkFaint }}>
                  Everything you have watched is ranked. Mark more entries on the Roadmap.
                </Text>
              ) : (
                unranked.map((movie) => (
                  <DraggableItem
                    key={movie.id}
                    movie={movie}
                    resolveDropTier={resolveDropTier}
                    onDrop={assignTier}
                    onPress={setSelected}
                    onDragStart={() => setMeasureToken((token) => token + 1)}
                  />
                ))
              )}
            </View>
          </MeasuredDropZone>
        </View>

        {/* Export */}
        <Section title="Share" index={2}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <Text style={{ ...type.small, color: palette.inkSoft, marginBottom: space.lg }}>
              Renders a 9:16 story card with your readiness, favourite entry and top tier.
            </Text>
            <CustomButton
              label={exporting ? 'Rendering…' : 'Export story card'}
              icon="download-outline"
              variant="primary"
              size="lg"
              fullWidth
              loading={exporting}
              onPress={exportStoryCard}
            />
          </View>
        </Section>
      </AnimatedScrollView>

      <CollapsingHeader
        scrollY={scrollY}
        title="Tiers"
        large={{ eyebrow: 'Tier studio', title: 'Rank the Saga' }}
      />

      {/* Off-screen capture target */}
      <View style={{ position: 'absolute', left: -10000, top: 0 }} pointerEvents="none">
        <ShareCard
          ref={shareCardRef}
          stats={stats}
          favourite={favourite}
          topTier={tiers[topTierLabel]}
          topTierLabel={topTierLabel}
          rankedCount={rankedCount}
        />
      </View>

      {/* Tap-to-assign sheet */}
      <BottomSheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        heightRatio={0.52}
      >
        {selected ? (
          <View style={{ paddingHorizontal: GUTTER, paddingTop: space.md }}>
            <Text style={{ ...type.title, color: palette.ink }} numberOfLines={2}>
              {selected.title}
            </Text>
            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
              {selected.releaseYear} ·{' '}
              {typeof selected.phase === 'number' ? `Phase ${selected.phase}` : selected.phase}
            </Text>

            <View style={{ marginTop: space.xxl }}>
              <Marker>Assign tier</Marker>
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
                {TIERS.map((tier) => {
                  const isActive = selected.tier === tier;
                  return (
                    <Pressable
                      key={tier}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Assign tier ${tier}`}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        assignTier(selected, isActive ? undefined : tier);
                        setSelected({ ...selected, tier: isActive ? undefined : tier });
                      }}
                      style={{
                        flex: 1,
                        height: 52,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isActive ? TIER_STYLE[tier].hex : palette.line,
                        backgroundColor: isActive ? `${TIER_STYLE[tier].hex}26` : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          ...type.heading,
                          color: isActive ? TIER_STYLE[tier].hex : palette.inkFaint,
                        }}
                      >
                        {tier}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: space.xxl }}>
              <Marker>Your rating</Marker>
              <View style={{ marginTop: space.md }}>
                <StarRating
                  value={selected.userRating}
                  onChange={(rating) => {
                    setRating(selected.id, rating);
                    setSelected({ ...selected, userRating: rating });
                  }}
                />
              </View>
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}
