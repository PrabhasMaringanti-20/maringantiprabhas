import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Surface } from '@/components/common/Surface';
import { usePalette } from '@/hooks/useTheme';
import { radius, space, type } from '@/styles/tokens';
import { countdownTo, pad, releaseDateLabel, type Countdown } from '@/utils/countdown';
import { formatHoursCompact } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

interface RoadmapSummaryProps {
  stats: ReadinessStats;
}

/**
 * Countdown and readiness in one card.
 *
 * These used to be two stacked panels — a countdown bar and a large ring —
 * which together filled the first screen before a single title was visible.
 * The same four facts fit in a third of the height.
 */
export function RoadmapSummary({ stats }: RoadmapSummaryProps) {
  const palette = usePalette();
  const [time, setTime] = useState<Countdown>(() => countdownTo());
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

  const unit = (value: string, label: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 19, fontWeight: '800', color: palette.ink, fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text style={{ ...type.label, color: palette.inkFaint, marginLeft: 1 }}>{label}</Text>
    </View>
  );

  return (
    <Surface>
      {/* Countdown */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          style={[
            dotStyle,
            {
              height: 6,
              width: 6,
              borderRadius: radius.pill,
              backgroundColor: palette.accent,
              marginRight: space.sm,
            },
          ]}
        />
        <Text style={{ ...type.label, color: palette.inkFaint, textTransform: 'uppercase', flex: 1 }}>
          {time.released ? 'Doomsday has landed' : 'Doomsday in'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
          {unit(String(time.days), 'd')}
          {unit(pad(time.hours), 'h')}
          {unit(pad(time.minutes), 'm')}
          {unit(pad(time.seconds), 's')}
        </View>
      </View>

      <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
        {releaseDateLabel()}
      </Text>

      {/* Readiness */}
      <View
        style={{
          height: 5,
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

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.sm }}>
        <Text style={{ ...type.small, fontWeight: '700', color: palette.ink }}>
          {stats.percent}% ready
        </Text>
        <Text style={{ ...type.small, color: palette.inkFaint, marginLeft: space.sm, flex: 1 }}>
          {stats.watched}/{stats.total} logged · {formatHoursCompact(stats.minutesRemaining)} left
        </Text>
      </View>
    </Surface>
  );
}
