import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { usePalette } from '@/hooks/useTheme';

interface ParticleProps {
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  travel: number;
  color: string;
}

/** One slow green ember drifting up through the void. */
function Particle({ x, size, delay, duration, drift, travel, color }: ParticleProps) {
  const progress = useSharedValue(0);

  progress.value = withDelay(
    delay,
    withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
  );

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      transform: [
        { translateY: -t * travel },
        { translateX: Math.sin(t * Math.PI * 2) * drift },
        { scale: 0.6 + t * 0.5 },
      ],
      // Fade in over the first fifth, out over the last third.
      opacity: t < 0.2 ? t * 4 : t > 0.7 ? (1 - t) * 2.4 : 0.8,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          bottom: -20,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: size * 1.5,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

/** Slowly breathing smoke bloom rendered as a soft radial gradient. */
function Smoke({
  cx,
  cy,
  rx,
  ry,
  color,
  id,
  delay,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  id: string;
  delay: number;
}) {
  const breath = useSharedValue(0);

  breath.value = withDelay(
    delay,
    withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true),
  );

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + breath.value * 0.45,
    transform: [{ scale: 0.9 + breath.value * 0.25 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Svg width={rx * 2} height={ry * 2} style={{ marginLeft: cx - rx, marginTop: cy - ry }}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.55" />
            <Stop offset="0.55" stopColor={color} stopOpacity="0.18" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

interface DoomAtmosphereProps {
  /** Number of embers. Kept low on dense screens. */
  particleCount?: number;
}

/**
 * The dark theme's signature: smoky green blooms with embers drifting upward.
 * Renders nothing in light mode, where the design stays clean and paper-like.
 */
export function DoomAtmosphere({ particleCount = 14 }: DoomAtmosphereProps) {
  const palette = usePalette();
  const { width, height } = useWindowDimensions();

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, index) => ({
        key: `ember-${index}`,
        x: ((index * 97) % 100) * (width / 100),
        size: 2 + ((index * 13) % 4),
        delay: (index * 900) % 9000,
        duration: 11_000 + ((index * 1700) % 9000),
        drift: 12 + ((index * 7) % 26),
        travel: height * 0.75,
        color: index % 4 === 0 ? palette.gold : palette.accent,
      })),
    [particleCount, width, height, palette.accent, palette.gold],
  );

  if (!palette.isDark) return null;

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <Smoke id="smokeA" cx={width * 0.16} cy={height * 0.1} rx={190} ry={150} color={palette.smoke[0]} delay={0} />
      <Smoke id="smokeB" cx={width * 0.92} cy={height * 0.36} rx={210} ry={170} color={palette.smoke[1]} delay={2600} />
      <Smoke id="smokeC" cx={width * 0.42} cy={height * 0.82} rx={230} ry={160} color={palette.smoke[0]} delay={5200} />
      {particles.map((particle) => (
        <Particle {...particle} key={particle.key} />
      ))}
    </View>
  );
}
