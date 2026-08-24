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

import { Badge } from '@/components/common/Badge';
import { Confetti } from '@/components/common/Confetti';
import { Poster } from '@/components/common/Poster';
import { formatRuntime } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

import { usePalette } from '@/hooks/useTheme';

export type NodeStatus = 'completed' | 'next' | 'upcoming';

interface TimelineNodeProps {
  movie: MovieItem;
  status: NodeStatus;
  /** Hides the connector above/below at the ends of the feed. */
  isFirst: boolean;
  isLast: boolean;
  index: number;
  onPress: (movie: MovieItem) => void;
  onToggleWatched: (movie: MovieItem) => boolean;
}

const RAIL_WIDTH = 44;

export function TimelineNode({
  movie,
  status,
  isFirst,
  isLast,
  index,
  onPress,
  onToggleWatched,
}: TimelineNodeProps) {
  const palette = usePalette();
  const [burstId, setBurstId] = useState(0);
  const pulse = useSharedValue(0);
  const checkScale = useSharedValue(movie.isWatched ? 1 : 0);

  // "Next up" node breathes so the eye lands on it first.
  useEffect(() => {
    if (status === 'next') {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(0, { duration: 240 });
    }
  }, [status, pulse]);

  useEffect(() => {
    checkScale.value = withSpring(movie.isWatched ? 1 : 0, { damping: 12, stiffness: 240 });
  }, [movie.isWatched, checkScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + pulse.value * 0.45,
    transform: [{ scale: 1 + pulse.value * 0.35 }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const handleToggle = () => {
    const nowWatched = onToggleWatched(movie);
    if (nowWatched) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBurstId((id) => id + 1);
      checkScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 240 }),
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  };

  const nodeColor =
    status === 'completed' ? palette.gold : status === 'next' ? palette.accent : palette.line;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 380, delay: Math.min(index, 8) * 55 }}
      className="flex-row"
    >
      {/* Rail */}
      <View style={{ width: RAIL_WIDTH }} className="items-center">
        <View
          className="w-[2px] flex-1"
          style={{
            backgroundColor: isFirst
              ? 'transparent'
              : status === 'upcoming'
                ? palette.line
                : palette.accent,
          }}
        />

        <View className="my-1 items-center justify-center">
          {status === 'next' ? (
            <Animated.View
              pointerEvents="none"
              style={[
                pulseStyle,
                {
                  position: 'absolute',
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: palette.accent,
                },
              ]}
            />
          ) : null}

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: movie.isWatched }}
            accessibilityLabel={`Mark ${movie.title} as ${movie.isWatched ? 'unwatched' : 'watched'}`}
            hitSlop={12}
            onPress={handleToggle}
            className="items-center justify-center rounded-full border-2"
            style={{
              width: 26,
              height: 26,
              borderColor: nodeColor,
              backgroundColor: status === 'completed' ? palette.gold : palette.canvas,
            }}
          >
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark-sharp" size={15} color="#FFFFFF" />
            </Animated.View>
          </Pressable>

          <Confetti burstId={burstId} />
        </View>

        <View
          className="w-[2px] flex-1"
          style={{
            backgroundColor: isLast
              ? 'transparent'
              : status === 'completed'
                ? palette.gold
                : palette.line,
          }}
        />
      </View>

      {/* Card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${movie.title}`}
        onPress={() => {
          Haptics.selectionAsync();
          onPress(movie);
        }}
        className={`mb-3 flex-1 flex-row rounded-2xl border p-3 ${
          status === 'next'
            ? 'border-accent/60 bg-surface-raised'
            : movie.isWatched
              ? 'border-line bg-surface/70'
              : 'border-line bg-surface'
        }`}
      >
        <Poster movie={movie} width={58} rounded="rounded-lg" />

        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              className={`flex-1 pr-2 text-[15px] font-bold leading-5 ${
                movie.isWatched ? 'text-ink-soft' : 'text-ink'
              }`}
              numberOfLines={2}
            >
              {movie.title}
            </Text>
            {movie.isCrucial ? <Badge label="Crucial" tone="accent" compact /> : null}
          </View>

          <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
            <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
              {movie.releaseYear}
            </Text>
            <Text className="text-2xs text-ink-faint">•</Text>
            <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
              {typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase}
            </Text>
            <Text className="text-2xs text-ink-faint">•</Text>
            <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
              {formatRuntime(movie.runtimeMinutes)}
            </Text>
            {movie.type === 'series' ? (
              <Badge label="Series" tone="violet" compact />
            ) : null}
          </View>

          <Text className="mt-2 text-xs leading-4 text-ink-soft" numberOfLines={2}>
            {movie.whyItMatters}
          </Text>

          <View className="mt-2 flex-row items-center justify-between">
            {status === 'next' ? (
              <Badge label="Next up" tone="accent" icon="play" compact />
            ) : movie.isWatched ? (
              <Badge label="Watched" tone="gold" icon="checkmark-done" compact />
            ) : (
              <Badge label="Upcoming" tone="muted" compact />
            )}
            {movie.tier ? <Badge label={`Tier ${movie.tier}`} tone="crimson" compact /> : null}
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}
