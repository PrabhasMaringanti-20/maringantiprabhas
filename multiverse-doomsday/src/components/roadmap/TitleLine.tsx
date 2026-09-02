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

import { Poster } from '@/components/common/Poster';
import { Rule } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, radius, space, springBouncy, type } from '@/styles/tokens';
import { formatRuntime } from '@/utils/timeCalc';
import type { MovieItem } from '@/types';

export type LineStatus = 'completed' | 'next' | 'upcoming';

interface TitleLineProps {
  movie: MovieItem;
  index: number;
  status: LineStatus;
  onPress: (movie: MovieItem) => void;
  onToggleWatched: (movie: MovieItem) => boolean;
}

export const LINE_HEIGHT = 76;

/**
 * One line in the release-order ledger.
 *
 * A line, not a card: no border, no fill, separated from its neighbours by a
 * hairline. Sixty-eight of these read as a list you can scan; sixty-eight
 * cards read as a wall.
 */
export function TitleLine({ movie, index, status, onPress, onToggleWatched }: TitleLineProps) {
  const palette = usePalette();
  const [, setBurst] = useState(0);

  const check = useSharedValue(movie.isWatched ? 1 : 0);
  const press = useSharedValue(0);

  useEffect(() => {
    check.value = withSpring(movie.isWatched ? 1 : 0, springBouncy);
  }, [movie.isWatched, check]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.4 + check.value * 0.6 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: check.value > 0.5 ? palette.accent : palette.line,
    backgroundColor: `${palette.accent}${check.value > 0.5 ? '1F' : '00'}`,
  }));

  // Pressing tints the row rather than scaling it — scaling a full-bleed line
  // shows the canvas through its edges.
  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: `${palette.ink}${press.value > 0.5 ? '0D' : '00'}`,
  }));

  const isNext = status === 'next';

  const toggle = () => {
    const nowWatched = onToggleWatched(movie);
    Haptics.notificationAsync(
      nowWatched
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
    setBurst((value) => value + 1);
  };

  return (
    <View>
      <Animated.View style={rowStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${movie.title}`}
          onPressIn={() => {
            press.value = withTiming(1, { duration: motion.instant });
          }}
          onPressOut={() => {
            press.value = withTiming(0, { duration: motion.quick });
          }}
          onPress={() => onPress(movie)}
          style={{
            height: LINE_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: GUTTER,
          }}
        >
          <Text
            style={{
              ...type.ordinal,
              color: isNext ? palette.marvel : palette.inkFaint,
              width: 24,
              fontVariant: ['tabular-nums'],
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </Text>

          <View style={{ opacity: movie.isWatched ? 0.55 : 1 }}>
            <Poster movie={movie} width={38} hideCaption />
          </View>

          <View style={{ flex: 1, marginLeft: space.md, paddingRight: space.sm }}>
            <Text
              style={{
                ...type.bodyStrong,
                color: movie.isWatched ? palette.inkSoft : palette.ink,
              }}
              numberOfLines={1}
            >
              {movie.title}
            </Text>
            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: 1 }} numberOfLines={1}>
              {movie.releaseYear} · {formatRuntime(movie.runtimeMinutes)}
              {isNext ? '  ·  START HERE' : ''}
            </Text>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: movie.isWatched }}
            accessibilityLabel={
              movie.isWatched ? `Mark ${movie.title} unwatched` : `Mark ${movie.title} watched`
            }
            hitSlop={12}
            onPress={toggle}
          >
            <Animated.View
              style={[
                ringStyle,
                {
                  height: 26,
                  width: 26,
                  borderRadius: radius.pill,
                  borderWidth: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Animated.View style={checkStyle}>
                <Ionicons name="checkmark-sharp" size={14} color={palette.accent} />
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>

      <Rule inset={GUTTER} />
    </View>
  );
}
