import { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/common/Badge';
import { BottomSheet } from '@/components/common/BottomSheet';
import { CustomButton } from '@/components/common/CustomButton';
import { ProgressBar } from '@/components/common/ProgressBar';
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

export default function TierStudioScreen() {
  const insets = useSafeAreaInsets();
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

  return (
    <View className="flex-1 bg-void">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <Text className="text-2xs font-bold uppercase tracking-[3px] text-doom">
            Tier Studio
          </Text>
          <Text className="mt-1 text-3xl font-black leading-9 text-white">Rank the Saga</Text>
          <Text className="mt-1 text-xs text-muted">
            Long-press a poster to drag it between tiers, or tap it to assign one.
          </Text>
        </View>

        {/* Readiness summary */}
        <View className="mt-5 px-5">
          <View className="rounded-2xl border border-surface-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-[2px] text-white">
                Overall readiness
              </Text>
              <Badge label={`${stats.percent}%`} tone="doom" compact />
            </View>
            <View className="mt-3">
              <ProgressBar value={stats.percent / 100} height={8} />
            </View>
            <View className="mt-3 flex-row justify-between">
              <Text className="text-2xs uppercase tracking-wider text-muted-deep">
                {stats.watched}/{stats.total} watched
              </Text>
              <Text className="text-2xs uppercase tracking-wider text-muted-deep">
                {rankedCount} ranked
              </Text>
            </View>
          </View>
        </View>

        {/* Tier board */}
        <View className="mt-6 px-5">
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
        <View className="mt-3 px-5">
          <Text className="mb-2 text-xs font-bold uppercase tracking-[2px] text-muted">
            Watched · unranked ({unranked.length})
          </Text>
          <MeasuredDropZone
            target="unranked"
            onMeasure={handleMeasure}
            measureToken={measureToken}
            className="rounded-2xl border border-dashed border-surface-border bg-surface/60 p-3"
          >
            <View className="min-h-[92px] flex-row flex-wrap items-center gap-2">
              {unranked.length === 0 ? (
                <Text className="px-1 text-xs text-muted-deep">
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
        <View className="mt-7 px-5">
          <View className="rounded-2xl border border-surface-border bg-surface p-4">
            <View className="flex-row items-center">
              <Ionicons name="share-social-outline" size={16} color="#F59E0B" />
              <Text className="ml-2 text-xs font-bold uppercase tracking-[2px] text-white">
                Social export studio
              </Text>
            </View>
            <Text className="mt-2 text-xs leading-4 text-muted">
              Renders a branded 9:16 story card with your readiness score, favourite entry and top
              tier — ready for Instagram or X.
            </Text>
            <View className="mt-4">
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
          </View>
        </View>
      </ScrollView>

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
          <View className="px-5 pt-3">
            <Text className="text-xl font-black leading-6 text-white" numberOfLines={2}>
              {selected.title}
            </Text>
            <Text className="mt-1 text-xs text-muted">
              {selected.releaseYear} ·{' '}
              {typeof selected.phase === 'number' ? `Phase ${selected.phase}` : selected.phase}
            </Text>

            <Text className="mt-5 text-2xs font-bold uppercase tracking-[2px] text-muted-deep">
              Assign tier
            </Text>
            <View className="mt-3 flex-row gap-2">
              {TIERS.map((tier) => {
                const isActive = selected.tier === tier;
                return (
                  <Pressable
                    key={tier}
                    accessibilityRole="button"
                    accessibilityLabel={`Assign tier ${tier}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      assignTier(selected, isActive ? undefined : tier);
                      setSelected({ ...selected, tier: isActive ? undefined : tier });
                    }}
                    className={`h-14 flex-1 items-center justify-center rounded-2xl border-2 ${
                      isActive ? TIER_STYLE[tier].bg : 'bg-surface-raised'
                    }`}
                    style={{ borderColor: isActive ? '#FFFFFF' : '#372B56' }}
                  >
                    <Text
                      className={`text-xl font-black ${isActive ? 'text-void' : 'text-white'}`}
                    >
                      {tier}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-6 text-2xs font-bold uppercase tracking-[2px] text-muted-deep">
              Your rating
            </Text>
            <View className="mt-3">
              <StarRating
                value={selected.userRating}
                onChange={(rating) => {
                  setRating(selected.id, rating);
                  setSelected({
                    ...selected,
                    userRating: selected.userRating === rating ? 0 : rating,
                  });
                }}
              />
            </View>

            <View className="mt-7">
              <CustomButton
                label="Remove from board"
                icon="trash-outline"
                variant="danger"
                fullWidth
                onPress={() => {
                  assignTier(selected, undefined);
                  setSelected(null);
                }}
              />
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}
