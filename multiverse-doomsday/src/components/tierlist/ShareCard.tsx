import { forwardRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { Poster } from '@/components/common/Poster';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { formatHours, readinessRank } from '@/utils/timeCalc';
import type { MovieItem, ReadinessStats, Tier } from '@/types';

export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 640; // 9:16

interface ShareCardProps {
  stats: ReadinessStats;
  favourite?: MovieItem;
  topTier: MovieItem[];
  topTierLabel: Tier;
  rankedCount: number;
}

/**
 * The 9:16 story graphic captured by react-native-view-shot.
 * Rendered at a fixed size so the export is identical on every device.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { stats, favourite, topTier, topTierLabel, rankedCount },
  ref,
) {
  const rank = readinessRank(stats.percent);
  const tierStyle = TIER_STYLE[topTierLabel];

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}
      className="overflow-hidden rounded-3xl"
    >
      <LinearGradient
        colors={['#0B0813', '#1A0F2E', '#0B0813']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
      >
        {/* Header */}
        <View>
          <View className="flex-row items-center">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-doom">
              <Ionicons name="planet" size={16} color="#0B0813" />
            </View>
            <Text className="ml-2 text-[11px] font-black uppercase tracking-[3px] text-doom">
              Multiverse Roadmap
            </Text>
          </View>
          <Text className="mt-1 text-[11px] font-semibold uppercase tracking-[2px] text-muted-deep">
            Guide to Doomsday
          </Text>
        </View>

        {/* Readiness */}
        <View className="items-center">
          <Text className="text-[13px] font-bold uppercase tracking-[3px] text-muted">
            Doomsday Ready
          </Text>
          <Text
            className="text-doom"
            style={{ fontSize: 96, fontWeight: '900', lineHeight: 104 }}
          >
            {stats.percent}%
          </Text>
          <View className="mt-1 rounded-full border border-infinity/50 bg-infinity/10 px-4 py-1.5">
            <Text className="text-xs font-black uppercase tracking-[2px] text-infinity">
              {rank.label}
            </Text>
          </View>

          <View className="mt-5 flex-row">
            <View className="flex-1 items-center">
              <Text className="text-xl font-black text-white">
                {stats.watched}/{stats.total}
              </Text>
              <Text className="mt-0.5 text-2xs uppercase tracking-wider text-muted-deep">
                Titles logged
              </Text>
            </View>
            <View className="w-px bg-surface-border" />
            <View className="flex-1 items-center">
              <Text className="text-xl font-black text-white">
                {formatHours(stats.minutesWatched)}
              </Text>
              <Text className="mt-0.5 text-2xs uppercase tracking-wider text-muted-deep">
                Watch time
              </Text>
            </View>
            <View className="w-px bg-surface-border" />
            <View className="flex-1 items-center">
              <Text className="text-xl font-black text-white">{rankedCount}</Text>
              <Text className="mt-0.5 text-2xs uppercase tracking-wider text-muted-deep">
                Ranked
              </Text>
            </View>
          </View>
        </View>

        {/* Top tier */}
        <View>
          <View className="flex-row items-center">
            <View className={`h-5 w-5 items-center justify-center rounded ${tierStyle.bg}`}>
              <Text className="text-[11px] font-black text-void">{topTierLabel}</Text>
            </View>
            <Text className="ml-2 text-[11px] font-bold uppercase tracking-[2px] text-white">
              Top tier
            </Text>
          </View>

          <View className="mt-3 flex-row gap-2">
            {topTier.length === 0 ? (
              <Text className="text-xs text-muted-deep">Nothing ranked yet.</Text>
            ) : (
              topTier.slice(0, 4).map((movie) => (
                <Poster key={movie.id} movie={movie} width={72} rounded="rounded-lg" />
              ))
            )}
          </View>

          {favourite ? (
            <View className="mt-4 rounded-2xl border border-surface-border bg-surface/80 p-3">
              <Text className="text-2xs font-bold uppercase tracking-[2px] text-muted-deep">
                Favourite
              </Text>
              <Text className="mt-1 text-sm font-black text-white" numberOfLines={1}>
                {favourite.title}
              </Text>
              <View className="mt-1.5 flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= favourite.userRating ? 'star' : 'star-outline'}
                    size={13}
                    color={star <= favourite.userRating ? '#F59E0B' : '#5C5378'}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between border-t border-surface-border pt-3">
          <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-deep">
            Avengers: Doomsday prep
          </Text>
          <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-deep">
            {rank.blurb}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});
