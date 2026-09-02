import { useEffect } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Rect, RadialGradient, Stop } from 'react-native-svg';

const AVENGERS_MARK = require('../../../assets/images/avengers-mark.png');
const DOOM_WORDMARK = require('../../../assets/images/doom-wordmark.png');
const DOOM_CHARACTER = require('../../../assets/images/doom-character.png');

/** Warmed by the root layout; the intro renders with or without them. */
export const INTRO_ASSETS = [AVENGERS_MARK, DOOM_WORDMARK, DOOM_CHARACTER];

/** Matches the native splash colour exactly, so the handoff is invisible. */
export const INTRO_BACKDROP = '#05040A';

/**
 * Beat sheet. Kept as named constants because the whole point of the sequence
 * is the timing, and timing buried in call sites cannot be reasoned about.
 */
const BEAT = {
  bars: 0,
  figure: 260,
  mark: 900,
  word: 1450,
  sweep: 2150,
  credit: 2600,
  open: 3300,
  out: 4300,
} as const;

interface DoomIntroProps {
  onFinish: () => void;
}

/**
 * Cold open.
 *
 * Staged like a title card rather than a loading screen: the frame opens
 * through letterbox bars, Doom rises out of black, the mark and wordmark
 * resolve, a light sweeps across the type, the credit arrives last, and the
 * bars pull away as the whole thing dissolves into the app.
 *
 * Layout uses explicit fractions of the window rather than flex, because these
 * are images whose intrinsic sizes vary by density and a flex version drifted
 * on real hardware.
 */
export function DoomIntro({ onFinish }: DoomIntroProps) {
  const { width, height } = useWindowDimensions();

  const cover = useSharedValue(1);
  const bars = useSharedValue(1);
  const figure = useSharedValue(0);
  const mark = useSharedValue(0);
  const word = useSharedValue(0);
  const sweep = useSharedValue(0);
  const credit = useSharedValue(0);
  const push = useSharedValue(0);

  useEffect(() => {
    // One curve for everything that arrives, one for everything that leaves.
    const arrive = Easing.bezier(0.16, 1, 0.3, 1); // heavy ease-out, filmic
    const leave = Easing.inOut(Easing.quad);

    figure.value = withDelay(BEAT.figure, withTiming(1, { duration: 2000, easing: arrive }));
    mark.value = withDelay(BEAT.mark, withTiming(1, { duration: 1100, easing: arrive }));
    word.value = withDelay(BEAT.word, withTiming(1, { duration: 1200, easing: arrive }));
    sweep.value = withDelay(BEAT.sweep, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }));
    credit.value = withDelay(BEAT.credit, withTiming(1, { duration: 800, easing: arrive }));

    // The frame opens, holds, then opens the rest of the way as we cut out.
    bars.value = withDelay(
      BEAT.bars,
      withSequence(
        withTiming(0.45, { duration: 1400, easing: arrive }),
        withDelay(1200, withTiming(0, { duration: 700, easing: leave })),
      ),
    );

    // A slow push in, so the still frame is never quite still.
    push.value = withDelay(BEAT.figure, withTiming(1, { duration: 4200, easing: Easing.linear }));

    cover.value = withDelay(
      BEAT.out,
      withTiming(0, { duration: 700, easing: leave }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [cover, bars, figure, mark, word, sweep, credit, push, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));

  /** Everything inside the frame drifts in together — one camera, not five. */
  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + push.value * 0.045 }],
  }));

  const figureStyle = useAnimatedStyle(() => ({
    opacity: figure.value,
    transform: [{ translateY: (1 - figure.value) * 44 }],
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value * 0.95,
    transform: [{ scale: 0.86 + mark.value * 0.14 }],
  }));

  // Title cards settle inwards: the wordmark eases *down* to its final size.
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [
      { scale: 1.14 - word.value * 0.14 },
      { translateY: (1 - word.value) * 10 },
    ],
  }));

  // A band of light travelling across the type. React Native cannot mask an
  // image, so this is an additive sheen laid over it — which is what a real
  // specular sweep looks like anyway.
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweep.value, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
    transform: [{ translateX: interpolate(sweep.value, [0, 1], [-width * 0.9, width * 0.9]) }],
  }));

  const creditStyle = useAnimatedStyle(() => ({
    opacity: credit.value,
    transform: [{ translateY: (1 - credit.value) * 8 }],
  }));

  const barStyle = useAnimatedStyle(() => ({ height: bars.value * height * 0.13 }));

  const figureWidth = width * 1.16;
  const figureHeight = figureWidth * 0.503;
  const markSize = Math.min(width * 0.18, 78);
  const wordWidth = Math.min(width * 0.64, 292);

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
          overflow: 'hidden',
        },
      ]}
      accessibilityElementsHidden
    >
      <Animated.View style={[stageStyle, { flex: 1 }]}>
        {/* One cold wash of green, low and behind everything */}
        <LinearGradient
          colors={['#05040A', '#07160F', '#05040A']}
          locations={[0, 0.6, 1]}
          style={{ flex: 1 }}
        />

        {/* Doom, rising out of black */}
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
            fadeDuration={300}
          />
        </Animated.View>

        {/* Haze, so he stands in the dark rather than on top of it */}
        <LinearGradient
          colors={['transparent', 'rgba(5,4,10,0.92)', '#05040A']}
          locations={[0, 0.62, 1]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 110 }}
        />

        {/* Lockup */}
        <View
          style={{
            position: 'absolute',
            top: height * 0.29,
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
              fadeDuration={300}
            />
          </Animated.View>

          <View style={{ marginTop: 24, overflow: 'hidden' }}>
            <Animated.View style={wordStyle}>
              <Image
                source={DOOM_WORDMARK}
                style={{ width: wordWidth, height: wordWidth * 0.33 }}
                resizeMode="contain"
                fadeDuration={300}
              />

              {/* Light sweep */}
              <Animated.View
                style={[
                  sweepStyle,
                  { position: 'absolute', top: -12, bottom: -12, width: width * 0.42 },
                ]}
              >
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0)',
                    'rgba(190,255,225,0.16)',
                    'rgba(255,255,255,0.42)',
                    'rgba(190,255,225,0.16)',
                    'rgba(255,255,255,0)',
                  ]}
                  locations={[0, 0.35, 0.5, 0.65, 1]}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 1, y: 0.8 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </Animated.View>
          </View>
        </View>

        {/* Credit — last in, quietest thing on screen */}
        <Animated.View
          style={[
            creditStyle,
            { position: 'absolute', top: height * 0.11, left: 0, right: 0, alignItems: 'center' },
          ]}
        >
          <Animated.Text
            style={{
              fontSize: 8,
              fontWeight: '600',
              letterSpacing: 4.5,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            CREATED BY
          </Animated.Text>
          <Animated.Text
            style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 6,
              color: '#FFFFFF',
            }}
          >
            PRABHAS.MAN
          </Animated.Text>
        </Animated.View>

        {/* Vignette — pulls the eye to the centre of the frame */}
        <Svg
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0 }}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient id="introVignette" cx="50%" cy="46%" r="72%">
              <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.72" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={height} fill="url(#introVignette)" />
        </Svg>
      </Animated.View>

      {/* Letterbox bars sit outside the push, so the frame edge stays fixed */}
      <Animated.View
        style={[barStyle, { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#000' }]}
      />
      <Animated.View
        style={[barStyle, { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000' }]}
      />
    </Animated.View>
  );
}
