import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { usePalette } from '@/hooks/useTheme';
import { eveningsRemaining, formatHours, readinessRank } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 104;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ReadinessCardProps {
  stats: ReadinessStats;
  pathLabel: string;
}

/**
 * Counts up to `target` on the JS thread.
 *
 * Reanimated can drive a Text's `text` prop through animatedProps, but that
 * path discards the element's own colour — so the readable option is a plain
 * Text fed by a short rAF loop that only runs when the number changes.
 */
function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const from = 0;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      // Matches the ring's ease-out cubic.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
}

function Stat({ value, label, last = false }: { value: string; label: string; last?: boolean }) {
  return (
    <View className={`flex-1 px-3 ${last ? '' : 'border-r border-line'}`}>
      <Text className="text-[15px] font-bold tabular-nums text-ink" numberOfLines={1}>
        {value}
      </Text>
      <Text className="mt-0.5 text-2xs font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </Text>
    </View>
  );
}

/** Readiness dashboard: one ring, one rank, three numbers. */
export function ReadinessCard({ stats, pathLabel }: ReadinessCardProps) {
  const palette = usePalette();
  const progress = useSharedValue(0);
  const rank = readinessRank(stats.percent);
  const evenings = eveningsRemaining(stats.minutesRemaining);

  useEffect(() => {
    progress.value = withTiming(stats.percent / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [stats.percent, progress]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  // The counter climbs alongside the ring rather than snapping to its value.
  const displayPercent = useCountUp(stats.percent);

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      <View className="flex-row items-center p-5">
        <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={palette.line}
              strokeWidth={STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={palette.accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={ringProps}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>

          <View className="absolute items-center justify-center">
            <Text className="text-[28px] font-black tracking-tight tabular-nums text-ink">
              {displayPercent}%
            </Text>
          </View>
        </View>

        <View className="ml-5 flex-1">
          <Text className="text-2xs font-semibold uppercase tracking-[2px] text-ink-faint">
            {pathLabel}
          </Text>
          <Text className="mt-1.5 text-lg font-bold leading-6 text-ink">{rank.label}</Text>
          <Text className="mt-1 text-[13px] leading-5 text-ink-soft">
            {stats.minutesRemaining === 0
              ? 'Path complete.'
              : `About ${evenings} evening${evenings === 1 ? '' : 's'} to go.`}
          </Text>
        </View>
      </View>

      <View className="flex-row border-t border-line py-3">
        <Stat value={`${stats.watched}/${stats.total}`} label="Logged" />
        <Stat value={formatHours(stats.minutesRemaining)} label="Left" />
        <Stat value={formatHours(stats.minutesWatched)} label="Watched" last />
      </View>
    </View>
  );
}
