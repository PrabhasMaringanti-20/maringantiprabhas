import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { Badge } from '@/components/common/Badge';
import { usePalette } from '@/hooks/useTheme';
import { eveningsRemaining, formatHours, readinessRank } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 132;
const STROKE = 11;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ReadinessCardProps {
  stats: ReadinessStats;
  pathLabel: string;
}

/** Header dashboard: animated ring, completion counters and remaining watch time. */
export function ReadinessCard({ stats, pathLabel }: ReadinessCardProps) {
  const palette = usePalette();
  const progress = useSharedValue(0);
  const [displayPercent, setDisplayPercent] = useState(0);
  const rank = readinessRank(stats.percent);
  const evenings = eveningsRemaining(stats.minutesRemaining);

  useEffect(() => {
    progress.value = withTiming(stats.percent / 100, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [stats.percent, progress]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  // The counter climbs with the ring instead of snapping to the final value.
  useAnimatedReaction(
    () => Math.round(progress.value * 100),
    (value, previous) => {
      if (value !== previous) runOnJS(setDisplayPercent)(value);
    },
    [],
  );

  return (
    <LinearGradient
      colors={palette.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: palette.line,
      }}
    >
      <View className="flex-row items-center p-5">
        <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <SvgGradient id="readinessRing" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.accent} />
                <Stop offset="0.6" stopColor={palette.accent} stopOpacity="0.75" />
                <Stop offset="1" stopColor={palette.gold} />
              </SvgGradient>
            </Defs>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={palette.raised}
              strokeWidth={STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="url(#readinessRing)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={ringProps}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>

          <View className="absolute items-center justify-center">
            <Text className="text-3xl font-black text-ink">{`${displayPercent}%`}</Text>
            <Text className="text-2xs font-bold uppercase tracking-[2px] text-accent">Ready</Text>
          </View>
        </View>

        <View className="ml-5 flex-1">
          <Text className="text-2xs font-bold uppercase tracking-[2px] text-ink-soft">
            Doomsday Readiness
          </Text>
          <Text className="mt-1 text-xl font-black leading-6 text-ink">{rank.label}</Text>
          <Text className="mt-1 text-xs leading-4 text-ink-soft">{rank.blurb}</Text>

          <View className="mt-3 flex-row flex-wrap gap-1.5">
            <Badge
              label={`${stats.watched} of ${stats.total} done`}
              tone="gold"
              icon="checkmark-done"
              compact
            />
            <Badge
              label={`${formatHours(stats.minutesRemaining)} left`}
              tone="accent"
              icon="time-outline"
              compact
            />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-line/70 px-5 py-3">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          {pathLabel}
        </Text>
        <Text className="text-[11px] font-semibold text-ink-soft">
          {stats.minutesRemaining === 0
            ? 'Path complete — go rewatch something'
            : `≈ ${evenings} evening${evenings === 1 ? '' : 's'} at 2 hrs a night`}
        </Text>
      </View>
    </LinearGradient>
  );
}
