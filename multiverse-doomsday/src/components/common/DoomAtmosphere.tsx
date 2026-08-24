import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      opacity: t < 0.2 ? t * 4 : t > 0.7 ? (1 - t) * 2.4 : 0.85,
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
          shadowRadius: size * 1.8,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

interface SmokeProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  id: string;
  delay: number;
  /** Peak opacity of the bloom. */
  strength: number;
  /** Horizontal drift, in points, over one breath. */
  drift?: number;
  duration?: number;
}

/** A slowly breathing, drifting bloom of smoke. */
function Smoke({ cx, cy, rx, ry, color, id, delay, strength, drift = 0, duration = 9000 }: SmokeProps) {
  const breath = useSharedValue(0);

  breath.value = withDelay(
    delay,
    withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
  );

  const style = useAnimatedStyle(() => ({
    opacity: strength * (0.45 + breath.value * 0.55),
    transform: [
      { scale: 0.88 + breath.value * 0.3 },
      { translateX: (breath.value - 0.5) * drift },
      { translateY: (0.5 - breath.value) * drift * 0.4 },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Svg width={rx * 2} height={ry * 2} style={{ marginLeft: cx - rx, marginTop: cy - ry }}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.6" />
            <Stop offset="0.45" stopColor={color} stopOpacity="0.26" />
            <Stop offset="0.75" stopColor={color} stopOpacity="0.08" />
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
  /** Multiplier on smoke opacity — the intro runs hotter than the tabs. */
  intensity?: number;
  /** The cold open is always dark, whatever theme the app is in. */
  forceDark?: boolean;
}

/**
 * The dark theme's signature: layered green smoke with embers drifting upward.
 * Renders nothing in light mode, where the design stays clean and paper-like.
 */
export function DoomAtmosphere({
  particleCount = 10,
  intensity = 0.45,
  forceDark = false,
}: DoomAtmosphereProps) {
  const palette = usePalette();
  const { width, height } = useWindowDimensions();

  const accent = forceDark ? '#10B981' : palette.accent;
  const gold = forceDark ? '#F59E0B' : palette.gold;
  const smoke: [string, string] = forceDark ? ['#10B981', '#064E3B'] : palette.smoke;

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, index) => ({
        key: `ember-${index}`,
        x: ((index * 61) % 100) * (width / 100),
        size: 2 + ((index * 13) % 5),
        delay: (index * 620) % 9000,
        duration: 10_000 + ((index * 1700) % 10_000),
        drift: 10 + ((index * 7) % 30),
        travel: height * 0.8,
        color: index % 5 === 0 ? gold : accent,
      })),
    [particleCount, width, height, accent, gold],
  );

  const blooms = useMemo(
    () => [
      { id: 'smokeA', cx: width * 0.12, cy: height * 0.06, rx: 210, ry: 165, strength: 0.9, delay: 0, drift: 30, duration: 9000 },
      { id: 'smokeB', cx: width * 0.95, cy: height * 0.26, rx: 235, ry: 185, strength: 0.8, delay: 2200, drift: -36, duration: 11_000 },
      { id: 'smokeC', cx: width * 0.35, cy: height * 0.55, rx: 260, ry: 190, strength: 0.7, delay: 4200, drift: 44, duration: 12_500 },
      { id: 'smokeD', cx: width * 0.86, cy: height * 0.8, rx: 250, ry: 200, strength: 0.85, delay: 1400, drift: -28, duration: 10_500 },
      { id: 'smokeE', cx: width * 0.15, cy: height * 0.98, rx: 300, ry: 210, strength: 1, delay: 3000, drift: 34, duration: 13_000 },
    ],
    [width, height],
  );

  if (!palette.isDark && !forceDark) return null;

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      {/* Base wash: green rising from the floor of the screen. */}
      <LinearGradient
        colors={['transparent', `${accent}07`, `${accent}12`]}
        locations={[0.45, 0.8, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {blooms.map((bloom, index) => (
        <Smoke
          {...bloom}
          key={bloom.id}
          color={index % 2 === 0 ? smoke[0] : smoke[1]}
          strength={bloom.strength * intensity}
        />
      ))}

      {particles.map((particle) => (
        <Particle {...particle} key={particle.key} />
      ))}
    </View>
  );
}
