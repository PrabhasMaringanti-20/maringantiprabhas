import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Panel, Rule, Stat } from '@/components/common/Primitives';
import { useStats } from '@/hooks/useStats';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { useTopInset } from '@/utils/layout';
import { VARIANTS, VARIANT_ORDER, variantFor } from '@/utils/verdict';

/**
 * Which variant are you.
 *
 * No questionnaire: the answer is read out of what you have actually logged,
 * which is both more honest and more interesting than ten invented questions.
 * The reveal is held behind one tap so the result lands rather than appearing.
 */
export default function VariantScreen() {
  const palette = usePalette();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();

  const stats = useStats();
  const variant = useMemo(() => variantFor(stats), [stats]);

  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRevealed(true);
  };

  const share = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Share.share({
      message:
        `DOOM says I'm ${variant.name}.\n\n${variant.because} ${variant.blurb}\n\n` +
        `${stats.watched}/${stats.total} logged before Doomsday. Which variant are you?`,
    }).catch(() => {
      // Dismissed — nothing to recover.
    });
  };

  const others = VARIANT_ORDER.filter((id) => id !== variant.id);

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + space.xl,
          paddingBottom: insets.bottom + space.huge,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: GUTTER,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1 }}>
            <Marker>Multiversal profile</Marker>
            <Text style={{ ...type.display, color: palette.ink, marginTop: space.sm }}>
              Your variant
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={14}
          >
            <Ionicons name="close" size={24} color={palette.ink} />
          </Pressable>
        </View>

        {!revealed ? (
          <Animated.View
            exiting={FadeOut.duration(motion.instant)}
            style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}
          >
            <Text style={{ ...type.body, color: palette.inkSoft, lineHeight: 21 }}>
              There is no quiz. The TVA already has your file: {stats.watched} titles logged,
              {stats.ratedCount > 0 ? ` ${stats.ratedCount} rated,` : ''} across{' '}
              {stats.activeDays} {stats.activeDays === 1 ? 'day' : 'days'}. That is enough to say
              which branch you are on.
            </Text>
            <View style={{ marginTop: space.xl }}>
              <CustomButton
                label="Open my file"
                icon="finger-print-outline"
                size="lg"
                fullWidth
                onPress={reveal}
              />
            </View>
          </Animated.View>
        ) : (
          <View>
            {/* The result */}
            <Animated.View
              entering={FadeInDown.duration(motion.slow)}
              style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}
            >
              <Marker color={palette.marvel}>You are</Marker>
              <Text
                style={{
                  ...type.title,
                  fontSize: 32,
                  lineHeight: 36,
                  color: palette.ink,
                  marginTop: space.sm,
                }}
              >
                {variant.name}
              </Text>
              <Text
                style={{
                  ...type.body,
                  color: palette.inkSoft,
                  marginTop: space.lg,
                  lineHeight: 21,
                }}
              >
                {variant.blurb}
              </Text>
            </Animated.View>

            {/* The evidence — this is what stops it feeling arbitrary. */}
            <Animated.View
              entering={FadeInDown.delay(motion.stagger).duration(motion.slow)}
              style={{ paddingHorizontal: GUTTER, marginTop: space.xl }}
            >
              <Panel tint={palette.marvel}>
                <Marker color={palette.marvel}>Because</Marker>
                <Text
                  style={{
                    ...type.bodyStrong,
                    color: palette.ink,
                    marginTop: space.sm,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {variant.because}
                </Text>
              </Panel>

              <View style={{ flexDirection: 'row', marginTop: space.xl }}>
                <Stat value={`${stats.percent}%`} label="logged" />
                <Stat
                  value={stats.ratedCount > 0 ? stats.averageRating.toFixed(1) : '—'}
                  label="avg rating"
                />
                <Stat
                  value={String(stats.longestStreakDays)}
                  label="best streak"
                  tint={stats.longestStreakDays > 0 ? palette.marvel : undefined}
                />
              </View>

              <View style={{ marginTop: space.xl }}>
                <CustomButton
                  label="Send this to the group"
                  icon="share-outline"
                  size="lg"
                  fullWidth
                  onPress={share}
                />
              </View>
            </Animated.View>

            {/* Everything you are not. Half the point is seeing the rest. */}
            <Animated.View
              entering={FadeIn.delay(motion.stagger * 2).duration(motion.slow)}
              style={{ marginTop: space.xxl }}
            >
              <View style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}>
                <Marker>Branches you are not on</Marker>
              </View>
              <Rule inset={GUTTER} />
              {others.map((id) => {
                const profile = VARIANTS[id];
                return (
                  <View key={id}>
                    <View
                      style={{
                        paddingHorizontal: GUTTER,
                        paddingVertical: space.md,
                        opacity: 0.6,
                      }}
                    >
                      <Text style={{ ...type.bodyStrong, color: palette.ink }}>
                        {profile.name}
                      </Text>
                      <Text
                        style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }}
                      >
                        {profile.unlock}
                      </Text>
                    </View>
                    <Rule inset={GUTTER} />
                  </View>
                );
              })}

              <Text
                style={{
                  ...type.small,
                  color: palette.inkFaint,
                  paddingHorizontal: GUTTER,
                  marginTop: space.lg,
                }}
              >
                Your branch is recalculated every time you log, rate or tier something. Keep
                watching and it will move.
              </Text>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
