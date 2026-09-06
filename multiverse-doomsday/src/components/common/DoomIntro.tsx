import { useEffect } from 'react';
import { Image, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { useTopInset } from '@/utils/layout';

import geometry from '../../../assets/images/intro/geometry.json';

const DOOM_TEXT = require('../../../assets/images/intro/doom-text.png');
const DOOM_FIGURE = require('../../../assets/images/intro/doom-figure.png');
const DOOM_ORB = require('../../../assets/images/intro/doom-orb.png');

/** Warmed by the root layout; the intro renders with or without them. */
export const INTRO_ASSETS = [DOOM_TEXT, DOOM_FIGURE, DOOM_ORB];

/** Matches the native splash colour exactly, so the handoff is invisible. */
export const INTRO_BACKDROP = '#04090B';

/* ------------------------------------------------------------------ *
 * Composition
 * ------------------------------------------------------------------ */

/**
 * The three layers were separated from one poster and still share its canvas,
 * so drawing them into a box of that same aspect ratio re-registers them for
 * free — the orb lands in the hand without a single offset being guessed.
 * These numbers come from scripts/prepare-intro-art.py; re-run it if the
 * artwork is ever replaced.
 */
const { canvasAspect: CANVAS_ASPECT, orbCentreX, orbCentreY, orbSizeX } = geometry;

/** Green light thrown by the orb onto the gap and the near edge of the gauntlet. */
const SPILL_X = 0.33;
const SPILL_Y = 0.505;
const SPILL_R = 0.3;

/**
 * Vertical strips the red highlight is built from.
 *
 * Few strips and the boundary between two of them reads as a hard edge — the
 * highlight looks like a red rectangle sitting on the letters instead of light
 * moving across them. Enough strips, spanned by a wide enough falloff, and
 * consecutive opacities differ so little that the seams disappear.
 */
const SLICES = 22;
/** How wide the highlight is, as a fraction of the sweep's travel. */
const SLICE_BAND = 0.26;
/** Peak strength. Low enough that the dark lettering still reads underneath. */
const SLICE_PEAK = 0.55;

const RED = '#E01E26';
const GREEN = '#2FE39B';

/* ------------------------------------------------------------------ *
 * Beat sheet
 * ------------------------------------------------------------------ */

/**
 * The whole point of a cold open is its timing, and timing scattered across
 * call sites cannot be reasoned about — so it lives here, in milliseconds.
 */
const BEAT = {
  atmosphere: 150,
  text: 300,
  figure: 420,
  orb: 1000,
  sweep: 1900,
  // Late, and after the figure has settled: a signature belongs at the end of
  // a title sequence, not competing with its reveal.
  credit: 1600,
  // Nothing else starts between the sweep and the exit. That silence is the
  // point: the composition is allowed to just sit there for a moment.
  out: 4300,
} as const;

const OUT_MS = 360;

interface DoomIntroProps {
  onFinish: () => void;
}

/**
 * Cold open.
 *
 * Structural rule throughout: an `Animated` component receives one animated
 * style and nothing else. Every position, size and colour sits on a plain
 * `View`, or is folded into the animated style itself. Passing
 * `[animatedStyle, {...}]` rendered correctly on web and dropped the plain
 * half on device — layers lost their geometry and the intro came out blank.
 *
 * Only opacity, transform and scale are ever animated, so the whole sequence
 * runs on the UI thread and never re-renders the app mounted beneath it.
 */
export function DoomIntro({ onFinish }: DoomIntroProps) {
  const { width: winW, height: winH } = useWindowDimensions();
  const topInset = useTopInset();

  // Fit the poster to the screen, anchored to the bottom. On a tall phone the
  // stage is full width and dark space sits above it; on a squarer screen it
  // scales down rather than cropping the lockup off the top.
  const stageW = Math.min(winW, winH * CANVAS_ASPECT);
  const stageH = stageW / CANVAS_ASPECT;
  const stageLeft = (winW - stageW) / 2;

  const orbSize = orbSizeX * stageW;
  const orbLeft = orbCentreX * stageW - orbSize / 2;
  const orbTop = orbCentreY * stageH - orbSize / 2;

  const atmosphere = useSharedValue(0);
  const text = useSharedValue(0);
  const textGlow = useSharedValue(0);
  const figure = useSharedValue(0);
  const orb = useSharedValue(0);
  const spinA = useSharedValue(0);
  const spinB = useSharedValue(0);
  const pulse = useSharedValue(0);
  const sweep = useSharedValue(-0.25);
  const sweepGate = useSharedValue(0);
  const credit = useSharedValue(0);
  const outro = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.bezier(0.22, 1, 0.36, 1);

    atmosphere.value = withDelay(BEAT.atmosphere, withTiming(1, { duration: 900, easing: ease }));
    text.value = withDelay(BEAT.text, withTiming(1, { duration: 1100, easing: ease }));
    figure.value = withDelay(BEAT.figure, withTiming(1, { duration: 1000, easing: ease }));
    orb.value = withDelay(BEAT.orb, withTiming(1, { duration: 700, easing: ease }));

    // The orb is already turning before it becomes visible, so it never reads
    // as a still picture that suddenly starts moving.
    spinA.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1,
      false,
    );
    spinB.value = withRepeat(
      withTiming(-360, { duration: 19000, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withDelay(
      BEAT.orb,
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    textGlow.value = withDelay(
      BEAT.text,
      withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true),
    );

    credit.value = withDelay(BEAT.credit, withTiming(1, { duration: 900, easing: ease }));

    // One slow pass of red light across D-O-O-M, then a residual ember.
    sweepGate.value = withDelay(BEAT.sweep, withTiming(1, { duration: 500 }));
    sweep.value = withDelay(
      BEAT.sweep,
      withRepeat(withTiming(1.25, { duration: 2400, easing: Easing.linear }), -1, false),
    );

    const timer = setTimeout(() => {
      outro.value = withTiming(1, { duration: OUT_MS, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(onFinish)();
      });
    }, BEAT.out);

    return () => clearTimeout(timer);
    // Shared values are stable; this sequence is meant to run exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- Root ------------------------------------------------------- */

  const rootStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: INTRO_BACKDROP,
    opacity: 1 - outro.value,
  }));

  const atmosphereStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: winW,
    height: winH,
    opacity: atmosphere.value * 0.55,
  }));

  // Everything in the poster pushes in very slightly as it leaves, so the
  // hand-off reads as a move into the app rather than a light switch.
  const stageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: stageLeft,
    bottom: 0,
    width: stageW,
    height: stageH,
    opacity: 1 - outro.value,
    transform: [{ scale: 1 + outro.value * 0.045 }],
  }));

  const creditStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: topInset + 26,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: credit.value,
    transform: [{ translateY: (1 - credit.value) * 8 }],
  }));

  /* --- DOOM lockup ------------------------------------------------ */

  const textStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: stageW,
    height: stageH,
    opacity: text.value,
  }));

  // A dark green ember under the letters, breathing slowly. Tinted from the
  // same artwork, so the glow can only ever fall inside the lettering.
  const textGlowStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: stageW,
    height: stageH,
    tintColor: GREEN,
    opacity: text.value * (0.05 + textGlow.value * 0.09),
  }));

  /* --- Figure ----------------------------------------------------- */

  const figureStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: stageW,
    height: stageH,
    opacity: figure.value,
    transform: [{ translateY: (1 - figure.value) * stageH * 0.03 }],
  }));

  /* --- Orb -------------------------------------------------------- */

  const spillStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: stageW,
    height: stageH,
    opacity: orb.value * (0.5 + pulse.value * 0.5),
  }));

  const orbHaloStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: orbLeft,
    top: orbTop,
    width: orbSize,
    height: orbSize,
    opacity: orb.value * (0.22 + pulse.value * 0.16),
    transform: [{ scale: 2.1 + pulse.value * 0.12 }],
  }));

  const orbCoreStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: orbLeft,
    top: orbTop,
    width: orbSize,
    height: orbSize,
    opacity: orb.value,
    transform: [
      { translateY: pulse.value * orbSize * 0.012 },
      { scale: 1 + pulse.value * 0.03 },
    ],
  }));

  // Two counter-turning copies of the same sphere. Because the texture is
  // roughly radial, they drift through each other and read as energy moving
  // inside a volume, rather than a flat picture being spun.
  const orbChurnAStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: orbLeft,
    top: orbTop,
    width: orbSize,
    height: orbSize,
    opacity: orb.value * 0.55,
    transform: [
      { translateY: pulse.value * orbSize * 0.012 },
      { scale: 0.9 + pulse.value * 0.03 },
      { rotate: `${spinA.value}deg` },
    ],
  }));

  const orbChurnBStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: orbLeft,
    top: orbTop,
    width: orbSize,
    height: orbSize,
    opacity: orb.value * (0.3 + pulse.value * 0.2),
    transform: [
      { translateY: pulse.value * orbSize * 0.012 },
      { scale: 0.74 + pulse.value * 0.04 },
      { rotate: `${spinB.value}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={rootStyle}>
      {/* Faint green air, low and centred where the figure stands */}
      <Animated.View style={atmosphereStyle}>
        <Svg width={winW} height={winH}>
          <Defs>
            <RadialGradient id="air" cx="50%" cy="62%" rx="75%" ry="55%">
              <Stop offset="0" stopColor="#0A3229" stopOpacity="0.42" />
              <Stop offset="0.55" stopColor="#061C17" stopOpacity="0.18" />
              <Stop offset="1" stopColor="#04090B" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={winW / 2} cy={winH * 0.62} rx={winW * 0.75} ry={winH * 0.55} fill="url(#air)" />
        </Svg>
      </Animated.View>

      <Animated.View style={stageStyle}>
        {/* DOOM, behind everything */}
        <Animated.Image source={DOOM_TEXT} resizeMode="stretch" style={textStyle} />
        <Animated.Image source={DOOM_TEXT} resizeMode="stretch" style={textGlowStyle} />
        {Array.from({ length: SLICES }, (_, index) => (
          <SweepSlice
            key={index}
            index={index}
            stageW={stageW}
            stageH={stageH}
            sweep={sweep}
            gate={sweepGate}
          />
        ))}

        {/* The figure */}
        <Animated.Image source={DOOM_FIGURE} resizeMode="stretch" style={figureStyle} />

        {/* Light thrown from the orb onto the gauntlet, over the figure */}
        <Animated.View style={spillStyle}>
          <Svg width={stageW} height={stageH}>
            <Defs>
              <RadialGradient id="spill" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={GREEN} stopOpacity="0.2" />
                <Stop offset="0.5" stopColor={GREEN} stopOpacity="0.07" />
                <Stop offset="1" stopColor={GREEN} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Ellipse
              cx={SPILL_X * stageW}
              cy={SPILL_Y * stageH}
              rx={SPILL_R * stageW}
              ry={SPILL_R * stageW * 0.85}
              fill="url(#spill)"
            />
          </Svg>
        </Animated.View>

        {/* The orb itself */}
        <Animated.Image source={DOOM_ORB} resizeMode="stretch" style={orbHaloStyle} />
        <Animated.Image source={DOOM_ORB} resizeMode="stretch" style={orbCoreStyle} />
        <Animated.Image source={DOOM_ORB} resizeMode="stretch" style={orbChurnAStyle} />
        <Animated.Image source={DOOM_ORB} resizeMode="stretch" style={orbChurnBStyle} />
      </Animated.View>

      {/* Vignette, static */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: winH * 0.3 }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0)']}
          style={{ flex: 1 }}
        />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: winH * 0.22 }}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
          style={{ flex: 1 }}
        />
      </View>

      {/* Signature */}
      <Animated.View style={creditStyle}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 4.5,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          CREATED BY
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 6,
            color: '#FFFFFF',
          }}
        >
          PRABHAS.MAN
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ *
 * Red sweep
 * ------------------------------------------------------------------ */

interface SweepSliceProps {
  index: number;
  stageW: number;
  stageH: number;
  sweep: SharedValue<number>;
  gate: SharedValue<number>;
}

/**
 * One vertical strip of a red-tinted copy of the lockup.
 *
 * The highlight has to travel across D-O-O-M rather than lighting the whole
 * word at once, which needs the artwork masked in place — and a mask library
 * would be a new native module, meaning another store-less rebuild and a
 * re-install for everyone. Strips get the same result from opacity alone:
 * each one is a fixed window onto the tinted artwork, and a soft falloff
 * moving along the row lights them in turn. Only opacity animates, so the
 * whole sweep stays on the compositor.
 */
function SweepSlice({ index, stageW, stageH, sweep, gate }: SweepSliceProps) {
  const sliceW = stageW / SLICES;
  const centre = (index + 0.5) / SLICES;

  const clipStyle = useAnimatedStyle(() => {
    const distance = Math.abs(sweep.value - centre);
    const t = Math.max(0, 1 - distance / SLICE_BAND);
    const falloff = t * t * (3 - 2 * t); // smoothstep
    return {
      position: 'absolute',
      top: 0,
      left: index * sliceW,
      width: sliceW,
      height: stageH,
      overflow: 'hidden',
      opacity: falloff * SLICE_PEAK * gate.value,
    };
  });

  return (
    <Animated.View style={clipStyle}>
      <Image
        source={DOOM_TEXT}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          top: 0,
          left: -index * sliceW,
          width: stageW,
          height: stageH,
          tintColor: RED,
        }}
      />
    </Animated.View>
  );
}
