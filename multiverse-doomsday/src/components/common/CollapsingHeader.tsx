import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';


import { Marker } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, HAIRLINE, HEADER_BAR, space, type } from '@/styles/tokens';
import { useTopInset } from '@/utils/layout';

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
  const topInset = useTopInset();

  const largeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, RANGE * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, RANGE], [0, -18], Extrapolation.CLAMP) },
    ],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [RANGE * 0.55, RANGE], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
    >
      {/* Compact bar. All of its geometry sits on plain Views — an
          `[animatedStyle, { padding }]` pair had the padding half dropped on
          device, which put every screen title under the status bar and hard
          against the left edge. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topInset + HEADER_BAR,
        }}
      >
        <Animated.View style={barStyle}>
          <View
            style={{
              height: topInset + HEADER_BAR,
              paddingTop: topInset,
              backgroundColor: palette.canvas,
              justifyContent: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER }}>
              <Text style={{ ...type.heading, color: palette.ink, flex: 1 }} numberOfLines={1}>
                {title}
              </Text>
              {trailing}
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: HAIRLINE,
                backgroundColor: palette.line,
              }}
            />
          </View>
        </Animated.View>
      </View>

      {/* Large title */}
      {large ? (
        <View
          pointerEvents="none"
          style={{
            paddingTop: topInset + space.sm,
            paddingHorizontal: GUTTER,
            paddingBottom: space.lg,
          }}
        >
          <Animated.View style={largeStyle}>
            <View>
              {large.eyebrow ? <Marker>{large.eyebrow}</Marker> : null}
              <Text
                style={{
                  ...type.display,
                  color: palette.ink,
                  marginTop: large.eyebrow ? space.sm : 0,
                }}
              >
                {large.title}
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Top padding a list must reserve so its first row clears the header.
 * Pass `large: false` on screens that only use the compact bar.
 */
export function useHeaderInset(large = true): number {
  const topInset = useTopInset();
  if (!large) return topInset + space.md;
  return (
    topInset +
    space.sm +
    space.sm +
    type.marker.lineHeight +
    type.display.lineHeight +
    space.lg
  );
}
