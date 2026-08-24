import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { Badge } from '@/components/common/Badge';
import { eveningsRemaining, formatHours, readinessRank } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

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
  const progress = useSharedValue(0);
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
  const counterText = useDerivedValue(() => `${Math.round(progress.value * 100)}%`);
  const counterProps = useAnimatedProps(() => ({ text: counterText.value } as never));

  return (
    <LinearGradient
      colors={['#211A35', '#161124']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="overflow-hidden rounded-3xl border border-surface-border"
      style={{ borderRadius: 24 }}
    >
      <View className="flex-row items-center p-5">
        <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <SvgGradient id="readinessRing" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#10B981" />
                <Stop offset="0.6" stopColor="#34D399" />
                <Stop offset="1" stopColor="#F59E0B" />
              </SvgGradient>
            </Defs>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#2A2140"
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
            <AnimatedText
              className="text-3xl font-black text-white"
              animatedProps={counterProps}
              // @ts-expect-error — Reanimated drives `text` through animatedProps.
              text={`${stats.percent}%`}
            >
              {`${stats.percent}%`}
            </AnimatedText>
            <Text className="text-2xs font-bold uppercase tracking-[2px] text-doom">Ready</Text>
          </View>
        </View>

        <View className="ml-5 flex-1">
          <Text className="text-2xs font-bold uppercase tracking-[2px] text-muted">
            Doomsday Readiness
          </Text>
          <Text className="mt-1 text-xl font-black leading-6 text-white">{rank.label}</Text>
          <Text className="mt-1 text-xs leading-4 text-muted">{rank.blurb}</Text>

          <View className="mt-3 flex-row flex-wrap gap-1.5">
            <Badge
              label={`${stats.watched} of ${stats.total} done`}
              tone="infinity"
              icon="checkmark-done"
              compact
            />
            <Badge
              label={`${formatHours(stats.minutesRemaining)} left`}
              tone="doom"
              icon="time-outline"
              compact
            />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-surface-border/70 px-5 py-3">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-deep">
          {pathLabel}
        </Text>
        <Text className="text-[11px] font-semibold text-muted">
          {stats.minutesRemaining === 0
            ? 'Path complete — go rewatch something'
            : `≈ ${evenings} evening${evenings === 1 ? '' : 's'} at 2 hrs a night`}
        </Text>
      </View>
    </LinearGradient>
  );
}
