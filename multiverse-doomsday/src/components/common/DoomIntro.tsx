import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';
import { usePalette } from '@/hooks/useTheme';

const LETTERS = ['D', 'O', 'O', 'M'];
const LETTER_STAGGER = 110;
const HOLD_MS = 620;

function Letter({ char, index, color }: { char: string; index: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * LETTER_STAGGER,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 26 },
      { scale: 0.86 + progress.value * 0.14 },
    ],
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: 68,
          lineHeight: 78,
          fontWeight: '900',
          letterSpacing: 6,
          color,
          textShadowColor: color,
          textShadowRadius: 24,
          textShadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      {char}
    </Animated.Text>
  );
}

interface DoomIntroProps {
  onFinish: () => void;
}

/** Branded cold-open: DOOM resolves letter by letter, then hands over to the app. */
export function DoomIntro({ onFinish }: DoomIntroProps) {
  const palette = usePalette();
  const cover = useSharedValue(1);
  const sweep = useSharedValue(0);

  useEffect(() => {
    const total = LETTERS.length * LETTER_STAGGER + 520 + HOLD_MS;

    sweep.value = withDelay(
      260,
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.cubic) }),
    );

    cover.value = withDelay(
      total,
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) }, (finished) => {
          if (finished) runOnJS(onFinish)();
        }),
      ),
    );
  }, [cover, sweep, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: sweep.value < 0.5 ? sweep.value * 1.4 : (1 - sweep.value) * 1.4,
    transform: [{ scaleX: 0.2 + sweep.value * 0.8 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 z-50"
      style={coverStyle}
      accessibilityElementsHidden
    >
      <LinearGradient
        colors={palette.isDark ? ['#0B0813', '#0F1A16', '#0B0813'] : ['#FFFFFF', '#F2F2F7', '#FFFFFF']}
        style={{ flex: 1 }}
      >
        <DoomAtmosphere particleCount={18} />

        <View className="flex-1 items-center justify-center">
          <Animated.Text
            entering={FadeIn.delay(120).duration(600)}
            className="mb-4 text-2xs font-bold uppercase tracking-[6px] text-ink-faint"
          >
            Multiverse Roadmap
          </Animated.Text>

          <View className="flex-row items-center">
            {LETTERS.map((char, index) => (
              <Letter key={`${char}-${index}`} char={char} index={index} color={palette.accent} />
            ))}
          </View>

          {/* A single beam of light sweeping under the wordmark. */}
          <Animated.View
            className="mt-3 h-[2px] w-40 rounded-full bg-accent"
            style={sweepStyle}
          />

          <Animated.Text
            entering={FadeIn.delay(760).duration(700)}
            className="mt-5 text-xs font-semibold uppercase tracking-[3px] text-ink-soft"
          >
            Guide to Doomsday
          </Animated.Text>
        </View>

        <Animated.View entering={FadeIn.delay(1000).duration(800)} className="items-center pb-14">
          <Text className="text-2xs font-bold uppercase tracking-[4px] text-ink-faint">
            Created by
          </Text>
          <Text className="mt-1 text-sm font-black uppercase tracking-[3px] text-ink">
            Prabhas.man
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}
