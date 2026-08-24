import { useEffect } from 'react';
import { Image, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';
import { usePalette } from '@/hooks/useTheme';

const AVENGERS_MARK = require('../../../assets/images/avengers-mark.png');
const DOOM_WORDMARK = require('../../../assets/images/doom-wordmark.png');
const DOOM_CHARACTER = require('../../../assets/images/doom-character.png');

/** Total runtime before the cover fades away. */
const HOLD_MS = 3000;

interface DoomIntroProps {
  onFinish: () => void;
}

/**
 * Cold open: the creator credit at the top, the Avengers mark and DOOM logo
 * resolving in the middle, and Doom himself rising out of the smoke below.
 */
export function DoomIntro({ onFinish }: DoomIntroProps) {
  const palette = usePalette();
  const { width } = useWindowDimensions();

  const cover = useSharedValue(1);
  const mark = useSharedValue(0);
  const word = useSharedValue(0);
  const figure = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    const timing = (duration: number, easing = Easing.out(Easing.cubic)) => ({ duration, easing });

    mark.value = withDelay(220, withTiming(1, timing(700)));
    word.value = withDelay(620, withTiming(1, timing(760)));
    glow.value = withDelay(700, withTiming(1, timing(900, Easing.inOut(Easing.quad))));
    figure.value = withDelay(1000, withTiming(1, timing(1500)));

    cover.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: 460, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [cover, mark, word, figure, glow, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value,
    transform: [{ scale: 0.72 + mark.value * 0.28 }, { translateY: (1 - mark.value) * 12 }],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [{ translateY: (1 - word.value) * 22 }, { scale: 0.9 + word.value * 0.1 }],
  }));

  // The wordmark art is dark green, so it needs light behind it to read against
  // the void. A solid view would render as a slab — this is a soft radial bloom.
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.75,
    transform: [{ scale: 0.75 + glow.value * 0.35 }],
  }));

  const figureStyle = useAnimatedStyle(() => ({
    opacity: figure.value,
    transform: [{ translateY: (1 - figure.value) * 60 }, { scale: 0.96 + figure.value * 0.04 }],
  }));

  const characterWidth = Math.min(width * 1.15, 520);

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 z-50"
      style={coverStyle}
      accessibilityElementsHidden
    >
      <LinearGradient
        colors={
          palette.isDark
            ? ['#050409', '#0C1A14', '#071009', '#04060A']
            : ['#FFFFFF', '#EEF4F0', '#FFFFFF']
        }
        locations={palette.isDark ? [0, 0.42, 0.72, 1] : [0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <DoomAtmosphere particleCount={26} intensity={1.5} />

        {/* Credit — top of the screen */}
        <Animated.View entering={FadeIn.delay(120).duration(700)} className="items-center pt-20">
          <Text className="text-2xs font-bold uppercase tracking-[5px] text-ink-faint">
            Created by
          </Text>
          <Text className="mt-1.5 text-base font-black uppercase tracking-[5px] text-ink">
            Prabhas.man
          </Text>
        </Animated.View>

        {/* Logo lockup — middle */}
        <View className="flex-1 items-center justify-center">
          <Animated.View style={markStyle}>
            <Image
              source={AVENGERS_MARK}
              style={{ width: 96, height: 108 }}
              resizeMode="contain"
            />
          </Animated.View>

          <View className="mt-5 items-center justify-center">
            <Animated.View pointerEvents="none" style={[glowStyle, { position: 'absolute' }]}>
              <Svg width={360} height={190}>
                <Defs>
                  <RadialGradient id="wordmarkGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={palette.accent} stopOpacity="0.85" />
                    <Stop offset="0.4" stopColor={palette.accent} stopOpacity="0.35" />
                    <Stop offset="0.72" stopColor={palette.accent} stopOpacity="0.1" />
                    <Stop offset="1" stopColor={palette.accent} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Ellipse cx={180} cy={95} rx={180} ry={95} fill="url(#wordmarkGlow)" />
              </Svg>
            </Animated.View>
            <Animated.View style={wordStyle}>
              <Image
                source={DOOM_WORDMARK}
                style={{ width: Math.min(width * 0.78, 320), height: 106 }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeIn.delay(1200).duration(800)}
            className="mt-4 text-2xs font-bold uppercase tracking-[4px] text-ink-soft"
          >
            Guide to Doomsday
          </Animated.Text>
        </View>

        {/* Doom rising out of the smoke — bottom */}
        <Animated.View style={[figureStyle, { alignItems: 'center' }]}>
          <Image
            source={DOOM_CHARACTER}
            style={{ width: characterWidth, height: characterWidth * 0.503 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Ground haze so the figure sits in the smoke rather than on top of it */}
        <LinearGradient
          colors={['transparent', palette.isDark ? '#04060A' : '#FFFFFF']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90 }}
          pointerEvents="none"
        />
      </LinearGradient>
    </Animated.View>
  );
}
