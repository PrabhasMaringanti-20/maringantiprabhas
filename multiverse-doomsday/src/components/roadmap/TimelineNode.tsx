import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Confetti } from '@/components/common/Confetti';
import { Poster } from '@/components/common/Poster';
import { usePalette } from '@/hooks/useTheme';
import { formatRuntime } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

export type NodeStatus = 'completed' | 'next' | 'upcoming';

interface TimelineNodeProps {
  movie: MovieItem;
  status: NodeStatus;
  index: number;
  onPress: (movie: MovieItem) => void;
  onToggleWatched: (movie: MovieItem) => boolean;
}

/**
 * One entry on the roadmap.
 *
 * Progress lives inside the card — a status stripe down its leading edge and a
 * single round check control — rather than on a rail down the side of the
 * screen. The centred connector between cards is `TimelineConnector`.
 */
export function TimelineNode({ movie, status, index, onPress, onToggleWatched }: TimelineNodeProps) {
  const palette = usePalette();
  const [burstId, setBurstId] = useState(0);

  const check = useSharedValue(movie.isWatched ? 1 : 0);
  const pulse = useSharedValue(0);
  const press = useSharedValue(1);

  useEffect(() => {
    check.value = withSpring(movie.isWatched ? 1 : 0, { damping: 13, stiffness: 220 });
  }, [movie.isWatched, check]);

  useEffect(() => {
    if (status !== 'next') {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [status, pulse]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.4 + check.value * 0.6 }],
  }));

  // A ripple ring expanding out of the next-up control.
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 - pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const handleToggle = () => {
    const nowWatched = onToggleWatched(movie);
    if (nowWatched) {
      setBurstId((id) => id + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      press.value = withSequence(
        withTiming(0.94, { duration: 90 }),
        withSpring(1, { damping: 12, stiffness: 260 }),
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  };

  const stripeColor =
    status === 'completed' ? palette.marvel : status === 'next' ? palette.accent : palette.line;

  const stepLabel = (index + 1).toString().padStart(2, '0');

  return (
    <MotiView
      from={{ opacity: 0, translateY: 22, scale: 0.985 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 140,
        mass: 0.9,
        delay: Math.min(index, 8) * 45,
      }}
    >
      <Animated.View style={pressStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${movie.title}`}
          onPressIn={() => {
            press.value = withTiming(0.985, { duration: 110 });
          }}
          onPressOut={() => {
            press.value = withSpring(1, { damping: 16, stiffness: 260 });
          }}
          onPress={() => {
            Haptics.selectionAsync();
            onPress(movie);
          }}
          className={`overflow-hidden rounded-3xl border ${
            status === 'next'
              ? 'border-accent/50 bg-surface-raised'
              : movie.isWatched
                ? 'border-line bg-surface/70'
                : 'border-line bg-surface'
          }`}
        >
          <View className="flex-row">
            {/* Status stripe — the whole progress language, in three pixels */}
            <View style={{ width: 3, backgroundColor: stripeColor }} />

            <View className="flex-1 p-4">
              <View className="flex-row">
                <Poster movie={movie} width={50} rounded="rounded-lg" hideCaption />

                <View className="ml-3 flex-1 justify-center">
                  <View className="flex-row items-baseline">
                    <Text className="mr-2 text-2xs font-bold tabular-nums text-ink-faint">
                      {stepLabel}
                    </Text>
                    <Text
                      className={`flex-1 text-[15px] font-bold leading-5 ${
                        movie.isWatched ? 'text-ink-soft' : 'text-ink'
                      }`}
                      numberOfLines={2}
                    >
                      {movie.title}
                    </Text>
                  </View>

                  <Text className="mt-1 text-2xs font-medium text-ink-faint">
                    {movie.releaseYear} · {typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase} ·{' '}
                    {formatRuntime(movie.runtimeMinutes)}
                    {movie.type === 'series' ? ' · Series' : ''}
                    {movie.tier ? ` · Tier ${movie.tier}` : ''}
                  </Text>
                </View>

                {/* The single control: tap to log it */}
                <View className="ml-2 items-center justify-center">
                  {status === 'next' ? (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        haloStyle,
                        {
                          position: 'absolute',
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          borderWidth: 2,
                          borderColor: palette.accent,
                        },
                      ]}
                    />
                  ) : null}

                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: movie.isWatched }}
                    accessibilityLabel={`Mark ${movie.title} as ${
                      movie.isWatched ? 'unwatched' : 'watched'
                    }`}
                    hitSlop={10}
                    onPress={handleToggle}
                    className="items-center justify-center rounded-full border-2"
                    style={{
                      width: 34,
                      height: 34,
                      borderColor: movie.isWatched ? palette.marvel : stripeColor,
                      backgroundColor: movie.isWatched ? palette.marvel : 'transparent',
                    }}
                  >
                    <Animated.View style={checkStyle}>
                      <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                    </Animated.View>
                  </Pressable>

                  <Confetti burstId={burstId} />
                </View>
              </View>

              <Text className="mt-3 text-[13px] leading-5 text-ink-soft" numberOfLines={2}>
                {movie.whyItMatters}
              </Text>

              {status === 'next' ? (
                <Text className="mt-3 text-2xs font-bold uppercase tracking-[2px] text-accent">
                  Start here
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </MotiView>
  );
}

interface TimelineConnectorProps {
  /** Green once the entry above has been logged. */
  isComplete: boolean;
}

/** Centred link between two cards: a short dashed run with a dot at its middle. */
export function TimelineConnector({ isComplete }: TimelineConnectorProps) {
  const palette = usePalette();
  const color = isComplete ? palette.accent : palette.line;

  return (
    <View className="items-center py-2" pointerEvents="none">
      <View style={{ width: 2, height: 10, borderRadius: 1, backgroundColor: color, opacity: 0.55 }} />
      <View
        className="my-1"
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: isComplete ? palette.accent : 'transparent',
          borderWidth: isComplete ? 0 : 1.5,
          borderColor: color,
        }}
      />
      <View style={{ width: 2, height: 10, borderRadius: 1, backgroundColor: color, opacity: 0.55 }} />
    </View>
  );
}
