import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  /** Tailwind colour class for the fill, e.g. "bg-accent". */
  fillClassName?: string;
  trackClassName?: string;
  height?: number;
  durationMs?: number;
}

/** Thin animated meter used under path selectors and tier rows. */
export function ProgressBar({
  value,
  fillClassName = 'bg-accent',
  trackClassName = 'bg-surface-raised',
  height = 6,
  durationMs = 700,
}: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, value)), {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, durationMs, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      className={`w-full overflow-hidden rounded-full ${trackClassName}`}
      style={{ height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(value * 100), min: 0, max: 100 }}
    >
      <Animated.View className={`h-full rounded-full ${fillClassName}`} style={fillStyle} />
    </View>
  );
}
