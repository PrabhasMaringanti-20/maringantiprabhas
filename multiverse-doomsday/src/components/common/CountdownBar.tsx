import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { usePalette } from '@/hooks/useTheme';
import { countdownTo, pad, releaseDateLabel, type Countdown } from '@/utils/countdown';

interface CountdownBarProps {
  /** Compact drops the date line — used on secondary tabs. */
  compact?: boolean;
}

function Segment({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-row items-baseline">
      <Text className="text-base font-bold tabular-nums text-ink">{value}</Text>
      <Text className="ml-0.5 text-2xs font-semibold text-ink-faint">{label}</Text>
    </View>
  );
}

function Gap() {
  return <View className="w-3" />;
}

/** Live countdown to Avengers: Doomsday, ticking once a second. */
export function CountdownBar({ compact = false }: CountdownBarProps) {
  const [time, setTime] = useState<Countdown>(() => countdownTo());
  const palette = usePalette();
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    const timer = setInterval(() => setTime(countdownTo()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Animated.View className="mr-2 h-1.5 w-1.5 rounded-full bg-accent" style={dotStyle} />
          <Text className="text-2xs font-semibold uppercase tracking-[2px] text-ink-faint">
            {time.released ? 'Doomsday has landed' : 'Doomsday in'}
          </Text>
        </View>

        <View className="flex-row items-baseline">
          <Segment value={time.days.toString()} label="d" />
          <Gap />
          <Segment value={pad(time.hours)} label="h" />
          <Gap />
          <Segment value={pad(time.minutes)} label="m" />
          <Gap />
          <Segment value={pad(time.seconds)} label="s" />
        </View>
      </View>

      {!compact ? (
        <View className="mt-1.5 flex-row items-center">
          <Ionicons name="calendar-outline" size={11} color={palette.inkFaint} />
          <Text className="ml-1.5 text-2xs font-medium text-ink-faint">{releaseDateLabel()}</Text>
        </View>
      ) : null}
    </View>
  );
}
