import { useEffect } from 'react';
import { Image, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';

const AVENGERS_MARK = require('../../../assets/images/avengers-mark.png');
const DOOM_WORDMARK = require('../../../assets/images/doom-wordmark.png');
const DOOM_CHARACTER = require('../../../assets/images/doom-character.png');

/** Preloaded by the root layout before the native splash is dismissed. */
export const INTRO_ASSETS = [AVENGERS_MARK, DOOM_WORDMARK, DOOM_CHARACTER];

/** Matches the native splash colour exactly, so the handoff is invisible. */
export const INTRO_BACKDROP = '#05040A';

const ACCENT = '#10B981';
const HOLD_MS = 3200;

interface DoomIntroProps {
  onFinish: () => void;
  /** Fired on first paint — the cue to dismiss the native splash. */
  onReady?: () => void;
}

/**
 * Cold open: creator credit at the top, the Avengers mark and DOOM logo
 * resolving in the middle, Doom rising out of the smoke below.
 *
 * The layout is driven by explicit fractions of the window rather than flex,
 * because the pieces are images whose intrinsic sizes vary by device density
 * and a flex-based version drifted on real hardware.
 */
export function DoomIntro({ onFinish, onReady }: DoomIntroProps) {
  const { width, height } = useWindowDimensions();

  const cover = useSharedValue(1);
  const credit = useSharedValue(0);
  const mark = useSharedValue(0);
  const word = useSharedValue(0);
  const glow = useSharedValue(0);
  const figure = useSharedValue(0);
  const tagline = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    const soft = Easing.inOut(Easing.quad);

    credit.value = withDelay(120, withTiming(1, { duration: 620, easing: ease }));
    mark.value = withDelay(260, withTiming(1, { duration: 760, easing: ease }));
    word.value = withDelay(620, withTiming(1, { duration: 820, easing: ease }));
    glow.value = withDelay(
      700,
      withSequence(
        withTiming(1, { duration: 900, easing: soft }),
        withTiming(0.72, { duration: 1400, easing: soft }),
      ),
    );
    figure.value = withDelay(980, withTiming(1, { duration: 1500, easing: ease }));
    tagline.value = withDelay(1500, withTiming(1, { duration: 700, easing: ease }));

    cover.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: 520, easing: soft }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [cover, credit, mark, word, glow, figure, tagline, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));

  const creditStyle = useAnimatedStyle(() => ({
    opacity: credit.value,
    transform: [{ translateY: (1 - credit.value) * -10 }],
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value,
    transform: [{ scale: 0.74 + mark.value * 0.26 }, { translateY: (1 - mark.value) * 14 }],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [{ translateY: (1 - word.value) * 24 }, { scale: 0.92 + word.value * 0.08 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.8,
    transform: [{ scale: 0.78 + glow.value * 0.32 }],
  }));

  const figureStyle = useAnimatedStyle(() => ({
    opacity: figure.value,
    transform: [
      { translateY: (1 - figure.value) * 70 },
      { scale: 0.94 + figure.value * 0.06 },
    ],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: (1 - tagline.value) * 8 }],
  }));

  // Doom is drawn 1.2x the screen width so the outstretched arms bleed off both
  // edges, and anchored to the bottom.
  const figureWidth = width * 1.2;
  const figureHeight = figureWidth * 0.503;
  const markSize = Math.min(width * 0.26, 116);
  const wordWidth = Math.min(width * 0.72, 320);

  return (
    <Animated.View
      pointerEvents="none"
      style={[coverStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }]}
      onLayout={onReady}
      accessibilityElementsHidden
    >
      <LinearGradient
        colors={['#05040A', '#0A1712', '#08120D', '#05040A']}
        locations={[0, 0.4, 0.7, 1]}
        style={{ flex: 1 }}
      >
        <DoomAtmosphere particleCount={22} intensity={1.6} forceDark />

        {/* Credit — pinned to the top */}
        <Animated.View
          style={[
            creditStyle,
            { position: 'absolute', top: height * 0.09, left: 0, right: 0, alignItems: 'center' },
          ]}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 5,
              color: 'rgba(255,255,255,0.42)',
            }}
          >
            CREATED BY
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 15,
              fontWeight: '900',
              letterSpacing: 5,
              color: '#FFFFFF',
            }}
          >
            PRABHAS.MAN
          </Text>
        </Animated.View>

        {/* Lockup — held at a fixed height so it never collides with the figure */}
        <View
          style={{
            position: 'absolute',
            top: height * 0.26,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <Animated.View style={markStyle}>
            <Image
              source={AVENGERS_MARK}
              style={{ width: markSize, height: markSize * 1.13 }}
              resizeMode="contain"
              fadeDuration={220}
            />
          </Animated.View>

          <View style={{ marginTop: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[glowStyle, { position: 'absolute' }]}>
              <Svg width={360} height={190}>
                <Defs>
                  <RadialGradient id="introGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={ACCENT} stopOpacity="0.9" />
                    <Stop offset="0.4" stopColor={ACCENT} stopOpacity="0.34" />
                    <Stop offset="0.72" stopColor={ACCENT} stopOpacity="0.1" />
                    <Stop offset="1" stopColor={ACCENT} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Ellipse cx={180} cy={95} rx={180} ry={95} fill="url(#introGlow)" />
              </Svg>
            </Animated.View>

            <Animated.View style={wordStyle}>
              <Image
                source={DOOM_WORDMARK}
                style={{ width: wordWidth, height: wordWidth * 0.33 }}
                resizeMode="contain"
                fadeDuration={220}
              />
            </Animated.View>
          </View>

          <Animated.Text
            style={[
              taglineStyle,
              {
                marginTop: 18,
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 4,
                color: 'rgba(255,255,255,0.55)',
              },
            ]}
          >
            GUIDE TO DOOMSDAY
          </Animated.Text>
        </View>

        {/* Doom rising out of the smoke */}
        <Animated.View
          style={[
            figureStyle,
            {
              position: 'absolute',
              bottom: 0,
              left: (width - figureWidth) / 2,
              width: figureWidth,
              height: figureHeight,
            },
          ]}
        >
          <Image
            source={DOOM_CHARACTER}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            fadeDuration={220}
          />
        </Animated.View>

        {/* Ground haze so he stands in the smoke rather than on top of it */}
        <LinearGradient
          colors={['transparent', 'rgba(5,4,10,0.85)', '#05040A']}
          locations={[0, 0.6, 1]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }}
        />
      </LinearGradient>
    </Animated.View>
  );
}
