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
  out: 4300,
} as const;

interface DoomIntroProps {
  onFinish: () => void;
}

/**
 * Cold open.
 *
 * Structural rule throughout: an `Animated.View` receives one animated style
 * and nothing else. Every position, size and colour sits on a plain `View`, or
 * is folded into the animated style itself. Passing `[animatedStyle, {...}]`
 * rendered correctly on web and dropped the plain half on device — the figure
 * lost `bottom: 0`, the credit lost its position, the bars lost their fill and
 * the backdrop lost its colour, which is why the intro came out white.
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

  const figureWidth = width * 1.16;
  const figureHeight = figureWidth * 0.503;
  const markSize = Math.min(width * 0.18, 78);
  const wordWidth = Math.min(width * 0.64, 292);
  const barHeight = height * 0.13;

  useEffect(() => {
    // One curve for everything that arrives, one for everything that leaves.
    const arrive = Easing.bezier(0.16, 1, 0.3, 1); // heavy ease-out, filmic
    const leave = Easing.inOut(Easing.quad);

    figure.value = withDelay(BEAT.figure, withTiming(1, { duration: 2000, easing: arrive }));
    mark.value = withDelay(BEAT.mark, withTiming(1, { duration: 1100, easing: arrive }));
    word.value = withDelay(BEAT.word, withTiming(1, { duration: 1200, easing: arrive }));
    sweep.value = withDelay(
      BEAT.sweep,
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }),
    );
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

  // Geometry lives inside the animated style rather than in a plain object
  // beside it. A React Native View defaults to `position: relative`, so an
  // animated wrapper with no size of its own collapses every absolutely
  // positioned child inside it.
  const coverStyle = useAnimatedStyle(() => ({
    opacity: cover.value,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  /** Everything inside the frame drifts in together — one camera, not five. */
  const stageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

  // Static values live inside the animated style so the bars need no second
  // style object of their own.
  const topBarStyle = useAnimatedStyle(() => ({
    height: bars.value * barHeight,
    backgroundColor: '#000000',
  }));
  const bottomBarStyle = useAnimatedStyle(() => ({
    height: bars.value * barHeight,
    backgroundColor: '#000000',
  }));

  const fill = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  return (
    // The backdrop is a plain View. Whatever happens to the animated layers,
    // the cold open is never the colour of the app behind it.
    <View pointerEvents="none" style={{ ...fill, zIndex: 50, backgroundColor: INTRO_BACKDROP }}>
      <Animated.View style={coverStyle}>
          {/* One cold wash of green, low and behind everything */}
          <LinearGradient
            colors={['#05040A', '#07160F', '#05040A']}
            locations={[0, 0.6, 1]}
            style={fill}
          />

          <Animated.View style={stageStyle}>
              {/* Doom, rising out of black */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: (width - figureWidth) / 2,
                  width: figureWidth,
                  height: figureHeight,
                }}
              >
                <Animated.View style={figureStyle}>
                  <Image
                    source={DOOM_CHARACTER}
                    style={{ width: figureWidth, height: figureHeight }}
                    resizeMode="contain"
                    fadeDuration={300}
                  />
                </Animated.View>
              </View>

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
                    <View>
                      <Image
                        source={DOOM_WORDMARK}
                        style={{ width: wordWidth, height: wordWidth * 0.33 }}
                        resizeMode="contain"
                        fadeDuration={300}
                      />

                      {/* Light sweep */}
                      <View
                        style={{
                          position: 'absolute',
                          top: -12,
                          bottom: -12,
                          left: 0,
                          width: width * 0.42,
                        }}
                      >
                        <Animated.View style={sweepStyle}>
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
                            style={{ width: width * 0.42, height: wordWidth * 0.33 + 24 }}
                          />
                        </Animated.View>
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </View>

              {/* Credit — last in, quietest thing on screen */}
              <View
                style={{
                  position: 'absolute',
                  top: height * 0.11,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                <Animated.View style={creditStyle}>
                  <View style={{ alignItems: 'center' }}>
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
                  </View>
                </Animated.View>
              </View>

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
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <Animated.View style={topBarStyle} />
          </View>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <Animated.View style={bottomBarStyle} />
          </View>
      </Animated.View>
    </View>
  );
}
