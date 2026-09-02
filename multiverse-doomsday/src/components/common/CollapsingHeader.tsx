import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Marker } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, HAIRLINE, HEADER_BAR, space, type } from '@/styles/tokens';

interface CollapsingHeaderProps {
  /** Scroll offset of the list underneath, driven on the UI thread. */
  scrollY: SharedValue<number>;
  /** Shown in the compact bar once the screen scrolls. */
  title: string;
  /**
   * The large title. Omit on screens whose own first block is already the
   * hero — a second big heading above it is just noise.
   */
  large?: { eyebrow?: string; title: string };
  /** Optional control pinned to the right of the compact bar. */
  trailing?: React.ReactNode;
}

/** Distance over which the large title trades places with the compact bar. */
const RANGE = 64;

/**
 * The large title scrolls away and a compact bar takes its place.
 *
 * Both live in the same fixed layer and cross-fade, driven straight off the
 * list's scroll offset on the UI thread — so it tracks the finger exactly
 * rather than chasing it a frame behind.
 */
export function CollapsingHeader({ scrollY, title, large, trailing }: CollapsingHeaderProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  const largeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, RANGE * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, RANGE], [0, -18], Extrapolation.CLAMP) },
    ],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [RANGE * 0.55, RANGE], [0, 1], Extrapolation.CLAMP),
  }));

  const ruleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [RANGE * 0.55, RANGE], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
    >
      {/* Compact bar */}
      <Animated.View
        style={[
          barStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingTop: insets.top,
            height: insets.top + HEADER_BAR,
            backgroundColor: palette.canvas,
            justifyContent: 'center',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER }}>
          <Text style={{ ...type.heading, color: palette.ink, flex: 1 }} numberOfLines={1}>
            {title}
          </Text>
          {trailing}
        </View>
        <Animated.View
          style={[
            ruleStyle,
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: HAIRLINE,
              backgroundColor: palette.line,
            },
          ]}
        />
      </Animated.View>

      {/* Large title */}
      {large ? (
        <Animated.View
          pointerEvents="none"
          style={[
            largeStyle,
            { paddingTop: insets.top + space.sm, paddingHorizontal: GUTTER, paddingBottom: space.lg },
          ]}
        >
          {large.eyebrow ? <Marker>{large.eyebrow}</Marker> : null}
          <Text
            style={{ ...type.display, color: palette.ink, marginTop: large.eyebrow ? space.sm : 0 }}
          >
            {large.title}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * Top padding a list must reserve so its first row clears the header.
 * Pass `large: false` on screens that only use the compact bar.
 */
export function useHeaderInset(large = true): number {
  const insets = useSafeAreaInsets();
  if (!large) return insets.top + space.md;
  return (
    insets.top +
    space.sm +
    space.sm +
    type.marker.lineHeight +
    type.display.lineHeight +
    space.lg
  );
}
