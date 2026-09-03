import { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { AppState, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Marker, Meter } from '@/components/common/Primitives';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, HAIRLINE, motion, radius, space, type } from '@/styles/tokens';
import {
  countdownTo,
  pad,
  releaseDayLabel,
  releaseMomentLabel,
  type Countdown,
} from '@/utils/countdown';
import { hasTickAudio, releaseTicking, startTicking, stopTicking } from '@/services/tick';
import { formatHoursCompact } from '@/utils/timeCalc';
import type { ReadinessStats } from '@/types';

interface CountdownHeroProps {
  stats: ReadinessStats;
}

/**
 * The one enormous thing on the roadmap: days to Doomsday, with the clock
 * running underneath it.
 *
 * The clock is set large enough to read at arm's length, with the seconds
 * carrying the accent and pulsing as they turn — that pulse is the whole
 * reason it feels like a countdown rather than a date. Only the seconds are
 * animated; four big rolling numbers read as a bomb timer, which is louder
 * than this screen wants to be.
 */
export function CountdownHero({ stats }: CountdownHeroProps) {
  const palette = usePalette();
  const [time, setTime] = useState<Countdown>(() => countdownTo());

  const ticking = useSettingsStore((state) => state.countdownTicking);
  const setTicking = useSettingsStore((state) => state.setCountdownTicking);

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

  /* --- The ticking sound ------------------------------------------- */

  // Focus and foreground are tracked as state, and exactly one effect below
  // turns the sound on and off. Letting the toggle and the focus handler both
  // drive the player races them against each other — pause lands on top of a
  // play that has not finished starting, and the clip never runs.
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(() => AppState.currentState === 'active');

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => sub.remove();
  }, []);

  // Never tick into a pocket: the sound needs the toggle on, the tab in front,
  // and the app on screen.
  useEffect(() => {
    if (ticking && focused && foreground) startTicking();
    else stopTicking();
  }, [ticking, focused, foreground]);

  useEffect(() => () => releaseTicking(), []);

  const toggleTicking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTicking(!ticking);
  };

  const secondsStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const clockColor = time.released ? palette.inkFaint : palette.ink;

  return (
    <View style={{ paddingHorizontal: GUTTER }}>
      <Animated.View entering={FadeInDown.duration(motion.slow)}>
        <Marker color={time.released ? palette.accent : palette.marvel}>
          {time.released ? 'Doomsday has landed' : 'Doomsday in'}
        </Marker>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: space.sm }}>
          <Text style={{ ...type.hero, color: palette.ink, fontVariant: ['tabular-nums'] }}>
            {time.days}
          </Text>
          <Text style={{ ...type.title, color: palette.inkFaint, marginLeft: space.sm }}>
            {time.days === 1 ? 'day' : 'days'}
          </Text>
        </View>

        {/* The clock. Large, tabular, seconds accented and pulsing. */}
        <Animated.View
          entering={FadeIn.delay(motion.base)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.md }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', flex: 1 }}>
            <Text
              style={{
                ...type.title,
                color: clockColor,
                fontVariant: ['tabular-nums'],
                letterSpacing: -0.5,
              }}
            >
              {pad(time.hours)}
              <Text style={{ color: palette.inkFaint }}>:</Text>
              {pad(time.minutes)}
              <Text style={{ color: palette.inkFaint }}>:</Text>
            </Text>
            <Animated.Text
              style={[
                {
                  ...type.title,
                  color: time.released ? palette.inkFaint : palette.marvel,
                  fontVariant: ['tabular-nums'],
                  letterSpacing: -0.5,
                },
                secondsStyle,
              ]}
            >
              {pad(time.seconds)}
            </Animated.Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: ticking }}
            accessibilityLabel={ticking ? 'Silence the countdown' : 'Let the countdown tick'}
            onPress={toggleTicking}
            hitSlop={12}
            style={{
              width: 34,
              height: 34,
              borderRadius: radius.pill,
              borderWidth: HAIRLINE,
              borderColor: ticking ? palette.marvel : palette.line,
              backgroundColor: ticking ? `${palette.marvel}1A` : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={ticking ? 'volume-medium' : 'volume-mute-outline'}
              size={16}
              color={ticking ? palette.marvel : palette.inkFaint}
            />
          </Pressable>
        </Animated.View>

        {/* Say out loud what the clock is counting to. */}
        <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.sm }}>
          {releaseDayLabel()} · {releaseMomentLabel()}
          {ticking && !hasTickAudio() ? ' · ticking by touch' : ''}
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
