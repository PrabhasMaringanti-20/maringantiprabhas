import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SectionLabel } from '@/components/common/SectionLabel';
import { Surface } from '@/components/common/Surface';
import { useStingerCounts } from '@/hooks/usePostCredits';
import { useStats } from '@/hooks/useStats';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';
import { formatHoursCompact } from '@/utils/timeCalc';
import { TIERS, type Tier } from '@/types';

/** Tier colours live with the tier row; re-declared here would drift. */
import { TIER_STYLE } from '@/components/tierlist/TierRow';

export default function PrepScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const stats = useStats();
  const stingers = useStingerCounts();

  const achieved = stats.milestones.filter((m) => m.achieved).length;

  const bigNumber = (value: string, label: string, tint?: string) => (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 26, lineHeight: 30, fontWeight: '900', color: tint ?? palette.ink }}>
        {value}
      </Text>
      <Text style={{ ...type.label, color: palette.inkFaint, textTransform: 'uppercase', marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.sm,
          paddingBottom: tabBarHeight + space.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Your record"
          title="Prep"
          subtitle={`${stats.watched} of ${stats.total} logged · ${achieved} of ${stats.milestones.length} milestones`}
        />

        {/* Headline numbers */}
        <Animated.View
          entering={FadeInDown.duration(motion.base)}
          style={{ paddingHorizontal: GUTTER }}
        >
          <Surface>
            <View style={{ flexDirection: 'row' }}>
              {bigNumber(`${stats.percent}%`, 'ready', palette.accent)}
              {bigNumber(formatHoursCompact(stats.minutesWatched), 'watched')}
              {bigNumber(String(stats.streakDays), 'day streak', stats.streakDays > 0 ? palette.marvel : undefined)}
            </View>

            <View
              style={{
                height: 6,
                borderRadius: radius.pill,
                backgroundColor: palette.line,
                marginTop: space.lg,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${stats.percent}%`,
                  backgroundColor: palette.accent,
                  borderRadius: radius.pill,
                }}
              />
            </View>

            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.sm }}>
              {formatHoursCompact(stats.minutesRemaining)} still to watch
              {stats.longestStreakDays > 0
                ? ` · best streak ${stats.longestStreakDays} ${stats.longestStreakDays === 1 ? 'day' : 'days'}`
                : ''}
            </Text>
          </Surface>
        </Animated.View>

        {/* Two things to do */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xl }}>
          <SectionLabel icon="game-controller-outline">Test yourself</SectionLabel>

          <View style={{ gap: space.md }}>
            <ActionCard
              icon="help-circle-outline"
              title="Doomsday quiz"
              detail="10 questions drawn from the whole catalogue"
              tint={palette.marvel}
              onPress={() => router.push('/quiz')}
            />
            <ActionCard
              icon="film-outline"
              title="Post-credits tracker"
              detail={`${stingers.all} titles hide a scene · ${stingers.direct} feed Doomsday`}
              tint={palette.accent}
              onPress={() => router.push('/postcredits')}
            />
          </View>
        </View>

        {/* Phases */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <SectionLabel icon="layers-outline">By phase</SectionLabel>
          <Surface>
            {stats.phases.map((phase, index) => (
              <View key={phase.label} style={{ marginTop: index > 0 ? space.lg : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ ...type.small, fontWeight: '700', color: palette.ink, flex: 1 }}>
                    {phase.label}
                  </Text>
                  <Text style={{ ...type.small, color: palette.inkFaint }}>
                    {phase.watched}/{phase.total}
                  </Text>
                </View>
                <View
                  style={{
                    height: 5,
                    borderRadius: radius.pill,
                    backgroundColor: palette.line,
                    marginTop: space.sm,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${phase.percent}%`,
                      backgroundColor: phase.percent === 100 ? palette.accent : palette.marvel,
                      borderRadius: radius.pill,
                    }}
                  />
                </View>
              </View>
            ))}
          </Surface>
        </View>

        {/* Ratings */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <SectionLabel icon="star-outline">
            {stats.ratedCount > 0
              ? `Ratings · avg ${stats.averageRating.toFixed(1)}`
              : 'Ratings'}
          </SectionLabel>
          <Surface>
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
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: star === 5 ? 0 : space.sm }}
                  >
                    <Text style={{ ...type.small, color: palette.inkSoft, width: 26 }}>{star}★</Text>
                    <View
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: radius.pill,
                        backgroundColor: palette.line,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${width}%`,
                          backgroundColor: palette.marvel,
                          borderRadius: radius.pill,
                        }}
                      />
                    </View>
                    <Text style={{ ...type.small, color: palette.inkFaint, width: 26, textAlign: 'right' }}>
                      {count}
                    </Text>
                  </View>
                );
              })
            )}
          </Surface>
        </View>

        {/* Tiers */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <SectionLabel icon="trophy-outline">Tiers assigned</SectionLabel>
          <Surface>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {TIERS.map((tier: Tier) => (
                <View
                  key={tier}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: space.md,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: stats.tierCounts[tier] > 0 ? TIER_STYLE[tier].hex : palette.line,
                    backgroundColor:
                      stats.tierCounts[tier] > 0 ? `${TIER_STYLE[tier].hex}1F` : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      ...type.heading,
                      color: stats.tierCounts[tier] > 0 ? TIER_STYLE[tier].hex : palette.inkFaint,
                    }}
                  >
                    {tier}
                  </Text>
                  <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 2 }}>
                    {stats.tierCounts[tier]}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
        </View>

        {/* Milestones */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <SectionLabel icon="ribbon-outline">
            {`Milestones · ${achieved}/${stats.milestones.length}`}
          </SectionLabel>

          <View style={{ gap: space.sm }}>
            {stats.milestones.map((milestone, index) => (
              <Animated.View
                key={milestone.id}
                entering={FadeInDown.delay(index * motion.stagger).duration(motion.base)}
              >
                <Surface
                  tone={milestone.achieved ? 'base' : 'outline'}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View
                    style={{
                      height: 38,
                      width: 38,
                      borderRadius: radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: milestone.achieved ? `${palette.accent}26` : palette.raised,
                    }}
                  >
                    <Ionicons
                      name={milestone.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={milestone.achieved ? palette.accent : palette.inkFaint}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: space.md }}>
                    <Text
                      style={{
                        ...type.bodyStrong,
                        color: milestone.achieved ? palette.ink : palette.inkSoft,
                      }}
                    >
                      {milestone.label}
                    </Text>
                    <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>
                      {milestone.detail}
                    </Text>

                    {!milestone.achieved && milestone.progress > 0 ? (
                      <View
                        style={{
                          height: 3,
                          borderRadius: radius.pill,
                          backgroundColor: palette.line,
                          marginTop: space.sm,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            height: '100%',
                            width: `${Math.round(milestone.progress * 100)}%`,
                            backgroundColor: palette.inkFaint,
                            borderRadius: radius.pill,
                          }}
                        />
                      </View>
                    ) : null}
                  </View>

                  {milestone.achieved ? (
                    <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
                  ) : null}
                </Surface>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  tint: string;
  onPress: () => void;
}

function ActionCard({ icon, title, detail, tint, onPress }: ActionCardProps) {
  const palette = usePalette();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Surface style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            height: 42,
            width: 42,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${tint}1F`,
            borderWidth: 1,
            borderColor: `${tint}44`,
          }}
        >
          <Ionicons name={icon} size={20} color={tint} />
        </View>

        <View style={{ flex: 1, marginLeft: space.md }}>
          <Text style={{ ...type.bodyStrong, color: palette.ink }}>{title}</Text>
          <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}>{detail}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={palette.inkFaint} />
      </Surface>
    </Pressable>
  );
}
