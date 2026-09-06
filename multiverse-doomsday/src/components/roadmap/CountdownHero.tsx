import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Marker, Meter } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, space, type } from '@/styles/tokens';
import {
  countdownTo,
  pad,
  releaseDayLabel,
  releaseMomentLabel,
  type Countdown,
} from '@/utils/countdown';
import { formatHoursCompact } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

interface CountdownHeroProps {
  stats: ReadinessStats;
}

/**
 * The one enormous thing on the roadmap: the time left until Doomsday, as one
 * counter rather than a day count with a clock loose underneath it.
 *
 * Days, hours, minutes and seconds are read as a single row so it can only be
 * a countdown — an hours:minutes:seconds line on its own reads as a time of
 * day. Only the seconds are animated; four rolling numbers would read as a
 * bomb timer, which is louder than this screen wants to be.
 */
export function CountdownHero({ stats }: CountdownHeroProps) {
  const palette = usePalette();
  const [time, setTime] = useState<Countdown>(() => countdownTo());

  const pulse = useSharedValue(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * A plain 1000ms interval drifts, so the displayed seconds slowly stop
   * landing on real seconds. This re-aims at the next wall-clock boundary
   * after every update, which keeps the digits changing when they should.
   */
  useEffect(() => {
    let cancelled = false;

    const schedule = () => {
      const delay = 1000 - (Date.now() % 1000);
      timer.current = setTimeout(() => {
        if (cancelled) return;
        setTime(countdownTo());
        pulse.value = withSequence(
          withTiming(1.06, { duration: 90 }),
          withTiming(1, { duration: 260 }),
        );
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pulse]);

  return (
    <View style={{ paddingHorizontal: GUTTER }}>
      <Animated.View entering={FadeInDown.duration(motion.slow)}>
        <Marker color={time.released ? palette.accent : palette.marvel}>
          {time.released ? 'Doomsday has landed' : 'Doomsday in'}
        </Marker>

        {/* One counter: days, hours, minutes, seconds, ticking together. */}
        <Animated.View
          entering={FadeIn.delay(motion.stagger).duration(motion.base)}
          style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: space.md }}
        >
          <Segment value={String(time.days)} label={time.days === 1 ? 'day' : 'days'} lead />
          <Segment value={pad(time.hours)} label="hrs" />
          <Segment value={pad(time.minutes)} label="min" />
          <Segment
            value={pad(time.seconds)}
            label="sec"
            tint={time.released ? undefined : palette.marvel}
            pulse={pulse}
          />
        </Animated.View>

        <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.md }}>
          {releaseDayLabel()} · {releaseMomentLabel()}
        </Text>
      </Animated.View>

      {/* Readiness, as one line of data rather than a panel */}
      <Animated.View
        entering={FadeInDown.delay(motion.stagger * 2).duration(motion.base)}
        style={{ marginTop: space.xl }}
      >
        <Meter value={stats.percent} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.sm }}>
          <Text
            style={{ ...type.small, fontWeight: '600', color: palette.ink, fontVariant: ['tabular-nums'] }}
          >
            {stats.percent}% ready
          </Text>
          <Text style={{ ...type.small, color: palette.inkFaint, marginLeft: space.sm, flex: 1 }}>
            {stats.watched}/{stats.total} logged · {formatHoursCompact(stats.minutesRemaining)} left
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * One unit of the counter
 * ------------------------------------------------------------------ */

interface SegmentProps {
  value: string;
  label: string;
  /** The days segment carries the weight; the rest are supporting. */
  lead?: boolean;
  tint?: string;
  /** Only the seconds beat. Passed in rather than styled from outside, so the
   *  animated style is built by the component that actually renders it. */
  pulse?: SharedValue<number>;
}

function Segment({ value, label, lead = false, tint, pulse }: SegmentProps) {
  const palette = usePalette();
  const beat = useAnimatedStyle(() => ({ transform: [{ scale: pulse ? pulse.value : 1 }] }));

  // Segments share the row evenly, so a three-digit day count early on and a
  // single-digit one in the last week both stay on one line.
  return (
    <View style={{ flex: lead ? 1.15 : 1, alignItems: 'flex-start' }}>
      <Animated.Text
        style={[
          {
            ...(lead ? type.hero : type.display),
            fontSize: lead ? 52 : 34,
            lineHeight: lead ? 54 : 38,
            color: tint ?? palette.ink,
            fontVariant: ['tabular-nums'],
          },
          beat,
        ]}
      >
        {value}
      </Animated.Text>
      <Marker style={{ marginTop: space.xs }}>{label}</Marker>
    </View>
  );
}
