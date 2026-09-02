import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Marker, Meter } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, space, type } from '@/styles/tokens';
import { countdownTo, pad, releaseDateLabel, type Countdown } from '@/utils/countdown';
import { formatHoursCompact } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

interface CountdownHeroProps {
  stats: ReadinessStats;
}

/**
 * The one enormous thing on the roadmap: days to Doomsday, set at 64pt with
 * everything else deliberately quiet around it.
 *
 * Only the days figure is large. Hours, minutes and seconds tick underneath at
 * body size — a wall of four big rolling numbers reads as a bomb timer, which
 * is louder than this screen wants to be.
 */
export function CountdownHero({ stats }: CountdownHeroProps) {
  const palette = usePalette();
  const [time, setTime] = useState<Countdown>(() => countdownTo());

  useEffect(() => {
    const timer = setInterval(() => setTime(countdownTo()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={{ paddingHorizontal: GUTTER }}>
      <Animated.View entering={FadeInDown.duration(motion.slow)}>
        <Marker>{time.released ? 'Doomsday has landed' : 'Doomsday in'}</Marker>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: space.sm }}>
          <Text style={{ ...type.hero, color: palette.ink, fontVariant: ['tabular-nums'] }}>
            {time.days}
          </Text>
          <Text style={{ ...type.title, color: palette.inkFaint, marginLeft: space.sm }}>
            {time.days === 1 ? 'day' : 'days'}
          </Text>
        </View>

        <Animated.View entering={FadeIn.delay(motion.base)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              ...type.small,
              color: palette.inkFaint,
              fontVariant: ['tabular-nums'],
              letterSpacing: 1,
            }}
          >
            {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
          </Text>
          <View
            style={{
              width: 3,
              height: 3,
              borderRadius: 999,
              backgroundColor: palette.inkFaint,
              marginHorizontal: space.sm,
            }}
          />
          <Text style={{ ...type.small, color: palette.inkFaint }}>{releaseDateLabel()}</Text>
        </Animated.View>
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
