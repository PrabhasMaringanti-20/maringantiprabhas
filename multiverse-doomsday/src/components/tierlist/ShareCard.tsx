import { forwardRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { Poster } from '@/components/common/Poster';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { DARK_PALETTE } from '@/hooks/useTheme';
import { radius, space, type } from '@/styles/tokens';
import { formatHoursCompact, readinessRank } from '@/utils/timeCalc';
import type { MovieItem, ReadinessStats, Tier } from '@/types';

export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 640; // 9:16

/**
 * The card is always dark, whatever theme the app is in. It is an image that
 * leaves the device and gets posted somewhere — it should look the same no
 * matter who exported it.
 */
const P = DARK_PALETTE;

interface ShareCardProps {
  stats: ReadinessStats;
  favourite?: MovieItem;
  topTier: MovieItem[];
  topTierLabel: Tier;
  rankedCount: number;
}

const marker = {
  ...type.marker,
  color: P.inkFaint,
  textTransform: 'uppercase' as const,
};

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

  const stat = (value: string, label: string) => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text
        style={{ ...type.title, color: P.ink, fontVariant: ['tabular-nums'] }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={{ ...marker, marginTop: space.xs }}>{label}</Text>
    </View>
  );

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#0B0813', '#1A0F2E', '#0B0813']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
      >
        {/* Header */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                height: 26,
                width: 26,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.sm,
                backgroundColor: P.accent,
              }}
            >
              <Ionicons name="planet" size={15} color="#0B0813" />
            </View>
            <Text style={{ ...marker, color: P.accent, marginLeft: space.sm }}>DOOM</Text>
          </View>
          <Text style={{ ...marker, marginTop: space.xs }}>Guide to Doomsday</Text>
        </View>

        {/* Readiness */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...marker, color: P.inkSoft }}>Doomsday ready</Text>
          <Text
            style={{
              fontSize: 92,
              lineHeight: 100,
              fontWeight: '800',
              letterSpacing: -4,
              color: P.accent,
              fontVariant: ['tabular-nums'],
            }}
          >
            {stats.percent}%
          </Text>

          <View
            style={{
              marginTop: space.xs,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: `${P.marvel}80`,
              backgroundColor: `${P.marvel}1A`,
              paddingHorizontal: space.lg,
              paddingVertical: space.sm - 2,
            }}
          >
            <Text style={{ ...marker, color: P.marvel }}>{rank.label}</Text>
          </View>

          <View style={{ marginTop: space.xl, flexDirection: 'row' }}>
            {stat(`${stats.watched}/${stats.total}`, 'Titles logged')}
            <View style={{ width: 1, backgroundColor: P.line }} />
            {stat(formatHoursCompact(stats.minutesWatched), 'Watch time')}
            <View style={{ width: 1, backgroundColor: P.line }} />
            {stat(String(rankedCount), 'Ranked')}
          </View>
        </View>

        {/* Top tier */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                height: 20,
                width: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.sm,
                backgroundColor: tierStyle.hex,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                {topTierLabel}
              </Text>
            </View>
            <Text style={{ ...marker, color: P.ink, marginLeft: space.sm }}>Top tier</Text>
          </View>

          <View style={{ marginTop: space.md, flexDirection: 'row', gap: space.sm }}>
            {topTier.length === 0 ? (
              <Text style={{ ...type.small, color: P.inkFaint }}>Nothing ranked yet.</Text>
            ) : (
              topTier
                .slice(0, 4)
                .map((movie) => <Poster key={movie.id} movie={movie} width={72} round={10} />)
            )}
          </View>

          {favourite ? (
            <View
              style={{
                marginTop: space.lg,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: P.line,
                backgroundColor: `${P.surface}CC`,
                padding: space.md,
              }}
            >
              <Text style={marker}>Favourite</Text>
              <Text
                style={{ ...type.bodyStrong, color: P.ink, marginTop: space.xs }}
                numberOfLines={1}
              >
                {favourite.title}
              </Text>
              <View style={{ marginTop: space.sm, flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= favourite.userRating ? 'star' : 'star-outline'}
                    size={13}
                    color={star <= favourite.userRating ? P.marvel : P.inkFaint}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderTopColor: P.line,
            paddingTop: space.md,
          }}
        >
          <Text style={marker}>Avengers: Doomsday prep</Text>
          <Text style={{ ...marker, color: P.accent }}>
            {stats.watched}/{stats.total} logged
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});
