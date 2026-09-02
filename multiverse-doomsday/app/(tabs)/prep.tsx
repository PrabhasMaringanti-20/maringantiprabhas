import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { CollapsingHeader, useHeaderInset } from '@/components/common/CollapsingHeader';
import { Marker, Meter, Rule, Section, Stat } from '@/components/common/Primitives';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { useStingerCounts } from '@/hooks/usePostCredits';
import { useStats } from '@/hooks/useStats';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';
import { formatHoursCompact } from '@/utils/timeCalc';
import { TIERS, type Tier } from '@/types';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function PrepScreen() {
  const palette = usePalette();
  const router = useRouter();
  const headerInset = useHeaderInset();
  const tabBarHeight = useTabBarHeight();
  const scrollY = useSharedValue(0);

  const stats = useStats();
  const stingers = useStingerCounts();
  const achieved = stats.milestones.filter((m) => m.achieved).length;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: headerInset,
          paddingBottom: tabBarHeight + space.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline figures */}
        <Animated.View
          entering={FadeInDown.duration(motion.slow)}
          style={{ paddingHorizontal: GUTTER }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ ...type.hero, color: palette.ink, fontVariant: ['tabular-nums'] }}>
              {stats.percent}
            </Text>
            <Text style={{ ...type.title, color: palette.inkFaint, marginLeft: space.xs }}>%</Text>
          </View>
          <Marker>Ready for Doomsday</Marker>

          <View style={{ marginTop: space.xl }}>
            <Meter value={stats.percent} />
          </View>

          <View style={{ flexDirection: 'row', marginTop: space.xl }}>
            <Stat value={`${stats.watched}/${stats.total}`} label="logged" />
            <Stat value={formatHoursCompact(stats.minutesWatched)} label="watched" />
            <Stat
              value={String(stats.streakDays)}
              label="day streak"
              tint={stats.streakDays > 0 ? palette.marvel : undefined}
            />
          </View>

          <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.lg }}>
            {formatHoursCompact(stats.minutesRemaining)} still to watch
            {stats.longestStreakDays > 0
              ? ` · best streak ${stats.longestStreakDays} ${
                  stats.longestStreakDays === 1 ? 'day' : 'days'
                }`
              : ''}
          </Text>
        </Animated.View>

        {/* Two things to do */}
        <Section title="Test yourself" index={1}>
          <Rule inset={GUTTER} />
          <ActionLine
            icon="help-circle-outline"
            title="Doomsday quiz"
            detail="10 questions from the whole catalogue"
            tint={palette.marvel}
            onPress={() => router.push('/quiz')}
          />
          <ActionLine
            icon="film-outline"
            title="Post-credits tracker"
            detail={`${stingers.all} titles hide a scene · ${stingers.direct} feed Doomsday`}
            tint={palette.accent}
            onPress={() => router.push('/postcredits')}
          />
        </Section>

        {/* Phases */}
        <Section title="By phase" index={2}>
          <View style={{ paddingHorizontal: GUTTER }}>
            {stats.phases.map((phase, index) => (
              <View key={phase.label} style={{ marginTop: index > 0 ? space.lg : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.sm }}>
                  <Text style={{ ...type.small, fontWeight: '600', color: palette.ink, flex: 1 }}>
                    {phase.label}
                  </Text>
                  <Text
                    style={{
                      ...type.ordinal,
                      color: palette.inkFaint,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {phase.watched}/{phase.total}
                  </Text>
                </View>
                <Meter
                  value={phase.percent}
                  tint={phase.percent === 100 ? palette.accent : palette.marvel}
                />
              </View>
            ))}
          </View>
        </Section>

        {/* Ratings */}
        <Section
          title={stats.ratedCount > 0 ? `Ratings · avg ${stats.averageRating.toFixed(1)}` : 'Ratings'}
          index={3}
        >
          <View style={{ paddingHorizontal: GUTTER }}>
            {stats.ratedCount === 0 ? (
              <Text style={{ ...type.body, color: palette.inkFaint }}>
                Rate a few titles and the spread shows up here.
              </Text>
            ) : (
              [5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingHistogram[star];
                const width = stats.ratedCount ? (count / stats.ratedCount) * 100 : 0;
                return (
                  <View
                    key={star}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: star === 5 ? 0 : space.md,
                    }}
                  >
                    <Text
                      style={{ ...type.ordinal, color: palette.inkSoft, width: 22 }}
                    >
                      {star}★
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Meter value={width} tint={palette.marvel} />
                    </View>
                    <Text
                      style={{
                        ...type.ordinal,
                        color: palette.inkFaint,
                        width: 24,
                        textAlign: 'right',
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </Section>

        {/* Tiers */}
        <Section title="Tiers assigned" index={4}>
          <View style={{ flexDirection: 'row', paddingHorizontal: GUTTER, gap: space.sm }}>
            {TIERS.map((tier: Tier) => {
              const count = stats.tierCounts[tier];
              const on = count > 0;
              return (
                <View key={tier} style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      ...type.title,
                      color: on ? TIER_STYLE[tier].hex : palette.inkFaint,
                      opacity: on ? 1 : 0.45,
                    }}
                  >
                    {tier}
                  </Text>
                  <Text
                    style={{
                      ...type.ordinal,
                      color: palette.inkFaint,
                      marginTop: space.xs,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {count}
                  </Text>
                  <View
                    style={{
                      height: 2,
                      width: '60%',
                      marginTop: space.sm,
                      borderRadius: radius.pill,
                      backgroundColor: on ? TIER_STYLE[tier].hex : palette.line,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </Section>

        {/* Milestones */}
        <Section title={`Milestones · ${achieved}/${stats.milestones.length}`} index={5}>
          <Rule inset={GUTTER} />
          {stats.milestones.map((milestone) => (
            <View key={milestone.id}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: GUTTER,
                  paddingVertical: space.md,
                  opacity: milestone.achieved ? 1 : 0.55,
                }}
              >
                <Ionicons
                  name={milestone.icon as keyof typeof Ionicons.glyphMap}
                  size={17}
                  color={milestone.achieved ? palette.accent : palette.inkFaint}
                />
                <View style={{ flex: 1, marginLeft: space.md }}>
                  <Text style={{ ...type.bodyStrong, color: palette.ink }}>{milestone.label}</Text>
                  <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                    {milestone.detail}
                  </Text>
                  {!milestone.achieved && milestone.progress > 0 ? (
                    <View style={{ marginTop: space.sm }}>
                      <Meter value={milestone.progress * 100} tint={palette.inkFaint} height={2} />
                    </View>
                  ) : null}
                </View>
                {milestone.achieved ? (
                  <Ionicons name="checkmark" size={17} color={palette.accent} />
                ) : null}
              </View>
              <Rule inset={GUTTER} />
            </View>
          ))}
        </Section>
      </AnimatedScrollView>

      <CollapsingHeader
        scrollY={scrollY}
        title="Prep"
        large={{ eyebrow: 'Your record', title: 'Prep' }}
      />
    </View>
  );
}

interface ActionLineProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  tint: string;
  onPress: () => void;
}

function ActionLine({ icon, title, detail, tint, onPress }: ActionLineProps) {
  const palette = usePalette();

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: GUTTER,
          paddingVertical: space.lg,
        }}
      >
        <Ionicons name={icon} size={19} color={tint} />
        <View style={{ flex: 1, marginLeft: space.md }}>
          <Text style={{ ...type.bodyStrong, color: palette.ink }}>{title}</Text>
          <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>{detail}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={palette.inkFaint} />
      </Pressable>
      <Rule inset={GUTTER} />
    </View>
  );
}
