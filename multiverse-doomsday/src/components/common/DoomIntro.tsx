import { useEffect } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const AVENGERS_MARK = require('../../../assets/images/avengers-mark.png');
const DOOM_WORDMARK = require('../../../assets/images/doom-wordmark.png');
const DOOM_CHARACTER = require('../../../assets/images/doom-character.png');

/** Warmed by the root layout; the intro renders with or without them. */
export const INTRO_ASSETS = [AVENGERS_MARK, DOOM_WORDMARK, DOOM_CHARACTER];

/** Matches the native splash colour exactly, so the handoff is invisible. */
export const INTRO_BACKDROP = '#05040A';

const HOLD_MS = 3400;

interface DoomIntroProps {
  onFinish: () => void;
}

/**
 * Cold open.
 *
 * Deliberately sparse: black, one slow push, three pieces of artwork and a
 * name. Everything that used to compete for attention here — the tagline, the
 * particle field, the glow behind the wordmark — is gone. The only motion is a
 * long ease on a single curve, which is what makes it read as a title card
 * rather than a loading screen.
 *
 * Layout is driven by explicit fractions of the window rather than flex,
 * because these are images whose intrinsic sizes vary by density and a
 * flex-based version drifted on real hardware.
 */
export function DoomIntro({ onFinish }: DoomIntroProps) {
  const { width, height } = useWindowDimensions();

  const cover = useSharedValue(1);
  const credit = useSharedValue(0);
  const mark = useSharedValue(0);
  const word = useSharedValue(0);
  const figure = useSharedValue(0);
  const bars = useSharedValue(1);

  useEffect(() => {
    // One easing curve for the whole sequence — a slow out-cubic. Mixing
    // curves is what made the old version feel busy.
    const ease = Easing.out(Easing.cubic);

    figure.value = withDelay(80, withTiming(1, { duration: 1900, easing: ease }));
    mark.value = withDelay(420, withTiming(1, { duration: 1000, easing: ease }));
    word.value = withDelay(760, withTiming(1, { duration: 1200, easing: ease }));
    credit.value = withDelay(1500, withTiming(1, { duration: 900, easing: ease }));
    bars.value = withDelay(1100, withTiming(0, { duration: 1400, easing: ease }));

    cover.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: 620, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [cover, credit, mark, word, figure, bars, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));

  // The figure rises out of black rather than sliding — a long, small move.
  const figureStyle = useAnimatedStyle(() => ({
    opacity: figure.value,
    transform: [
      { translateY: (1 - figure.value) * 34 },
      { scale: 1.04 - figure.value * 0.04 },
    ],
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value * 0.92,
    transform: [{ scale: 0.9 + mark.value * 0.1 }],
  }));

  // Title cards settle *inwards*, so the wordmark eases down to its size.
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [{ scale: 1.1 - word.value * 0.1 }],
  }));

  const creditStyle = useAnimatedStyle(() => ({ opacity: credit.value * 0.85 }));

  const barStyle = useAnimatedStyle(() => ({ height: bars.value * height * 0.11 }));

  const figureWidth = width * 1.18;
  const figureHeight = figureWidth * 0.503;
  const markSize = Math.min(width * 0.19, 84);
  const wordWidth = Math.min(width * 0.66, 300);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        coverStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backgroundColor: INTRO_BACKDROP,
        },
      ]}
      accessibilityElementsHidden
    >
      {/* A single cold wash of green, low and behind everything. */}
      <LinearGradient
        colors={['#05040A', '#071410', '#05040A']}
        locations={[0, 0.58, 1]}
        style={{ flex: 1 }}
      />

      {/* Doom, rising out of the dark */}
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
          fadeDuration={260}
        />
      </Animated.View>

      {/* Haze so he stands in the dark rather than on top of it */}
      <LinearGradient
        colors={['transparent', 'rgba(5,4,10,0.9)', '#05040A']}
        locations={[0, 0.65, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 96 }}
      />

      {/* Lockup */}
      <View
        style={{
          position: 'absolute',
          top: height * 0.3,
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
            fadeDuration={260}
          />
        </Animated.View>

        <Animated.View style={[wordStyle, { marginTop: 22 }]}>
          <Image
            source={DOOM_WORDMARK}
            style={{ width: wordWidth, height: wordWidth * 0.33 }}
            resizeMode="contain"
            fadeDuration={260}
          />
        </Animated.View>
      </View>

      {/* Credit — last in, quietest thing on screen */}
      <Animated.View
        style={[
          creditStyle,
          { position: 'absolute', top: height * 0.1, left: 0, right: 0, alignItems: 'center' },
        ]}
      >
        <Animated.Text
          style={{
            fontSize: 8,
            fontWeight: '600',
            letterSpacing: 4,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          CREATED BY
        </Animated.Text>
        <Animated.Text
          style={{
            marginTop: 7,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 6,
            color: '#FFFFFF',
          }}
        >
          PRABHAS.MAN
        </Animated.Text>
      </Animated.View>

      {/* Letterbox bars that pull away as the title settles */}
      <Animated.View
        style={[barStyle, { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#000' }]}
      />
      <Animated.View
        style={[barStyle, { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000' }]}
      />
    </Animated.View>
  );
}
