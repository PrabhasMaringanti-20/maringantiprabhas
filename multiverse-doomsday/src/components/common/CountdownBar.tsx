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
    <View className="items-center">
      <Text className="text-lg font-black tabular-nums text-ink">{value}</Text>
      <Text className="text-2xs font-bold uppercase tracking-widest text-ink-faint">{label}</Text>
    </View>
  );
}

function Colon() {
  return <Text className="px-1 pb-3 text-base font-black text-ink-faint">:</Text>;
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
          <Animated.View
            className="mr-2 h-1.5 w-1.5 rounded-full bg-accent"
            style={dotStyle}
          />
          <Text className="text-2xs font-bold uppercase tracking-[2px] text-ink-soft">
            {time.released ? 'Doomsday has landed' : 'Doomsday countdown'}
          </Text>
        </View>
        {!compact && (
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={11} color={palette.inkFaint} />
            <Text className="ml-1 text-2xs font-semibold text-ink-faint">{releaseDateLabel()}</Text>
          </View>
        )}
      </View>

      <View className="mt-2 flex-row items-end">
        <Segment value={time.days.toString()} label="days" />
        <Colon />
        <Segment value={pad(time.hours)} label="hrs" />
        <Colon />
        <Segment value={pad(time.minutes)} label="min" />
        <Colon />
        <Segment value={pad(time.seconds)} label="sec" />
      </View>
    </View>
  );
}
