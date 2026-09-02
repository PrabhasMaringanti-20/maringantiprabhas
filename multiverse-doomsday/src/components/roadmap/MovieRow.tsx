import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Confetti } from '@/components/common/Confetti';
import { Poster } from '@/components/common/Poster';
import { usePalette } from '@/hooks/useTheme';
import { motion, radius, space, spring, type } from '@/styles/tokens';
import { formatRuntime } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

export type RowStatus = 'completed' | 'next' | 'upcoming';

interface MovieRowProps {
  movie: MovieItem;
  index: number;
  status: RowStatus;
  onPress: (movie: MovieItem) => void;
  onToggleWatched: (movie: MovieItem) => boolean;
}

export const ROW_HEIGHT = 92;

/**
 * One row in the release-order feed.
 *
 * Deliberately a single fixed-height line: poster, title, metadata, a check.
 * The previous card carried two lines of prose per entry, which over 68 titles
 * made the feed impossible to scan — that copy lives on the detail screen,
 * where there is room for it. Only the next unwatched entry is annotated.
 */
export function MovieRow({ movie, index, status, onPress, onToggleWatched }: MovieRowProps) {
  const palette = usePalette();
  const [burstId, setBurstId] = useState(0);

  const check = useSharedValue(movie.isWatched ? 1 : 0);
  const press = useSharedValue(1);

  useEffect(() => {
    check.value = withSpring(movie.isWatched ? 1 : 0, spring);
  }, [movie.isWatched, check]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.6 + check.value * 0.4 }],
  }));

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const isNext = status === 'next';
  const accent = movie.isWatched ? palette.accent : isNext ? palette.marvel : palette.line;

  const toggle = () => {
    const nowWatched = onToggleWatched(movie);
    if (nowWatched) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBurstId((value) => value + 1);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  };

  return (
    <Animated.View style={rowStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${movie.title}`}
        onPressIn={() => {
          press.value = withTiming(0.985, { duration: motion.instant });
        }}
        onPressOut={() => {
          press.value = withSpring(1, spring);
        }}
        onPress={() => onPress(movie)}
        style={{
          height: ROW_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: space.md,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: isNext ? `${palette.marvel}66` : palette.line,
          backgroundColor: palette.surface,
          overflow: 'hidden',
          opacity: movie.isWatched ? 0.72 : 1,
        }}
      >
        {/* Status stripe — the only place progress is coloured */}
        <View style={{ width: 3, height: '100%', backgroundColor: accent }} />

        <View style={{ paddingHorizontal: space.md }}>
          <Poster movie={movie} width={44} hideCaption disableFetch={false} />
        </View>

        <View style={{ flex: 1, paddingRight: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...type.label, color: palette.inkFaint, marginRight: space.sm }}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text style={{ ...type.bodyStrong, color: palette.ink, flex: 1 }} numberOfLines={1}>
              {movie.title}
            </Text>
          </View>

          <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 2 }} numberOfLines={1}>
            {movie.releaseYear} ·{' '}
            {typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase} ·{' '}
            {formatRuntime(movie.runtimeMinutes)}
          </Text>

          {isNext ? (
            <Text style={{ ...type.label, color: palette.marvel, marginTop: space.xs }}>
              START HERE
            </Text>
          ) : null}
        </View>

        {/* Watch toggle */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: movie.isWatched }}
          accessibilityLabel={movie.isWatched ? `Mark ${movie.title} unwatched` : `Mark ${movie.title} watched`}
          hitSlop={10}
          onPress={toggle}
          style={{
            height: 30,
            width: 30,
            borderRadius: radius.pill,
            borderWidth: 1.5,
            borderColor: movie.isWatched ? palette.accent : palette.line,
            backgroundColor: movie.isWatched ? `${palette.accent}26` : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark-sharp" size={16} color={palette.accent} />
          </Animated.View>
        </Pressable>

        <Confetti burstId={burstId} radius={44} count={10} size={4} />
      </Pressable>
    </Animated.View>
  );
}
