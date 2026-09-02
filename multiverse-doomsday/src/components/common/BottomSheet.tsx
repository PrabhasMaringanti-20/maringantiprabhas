import { useEffect } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/useTheme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Fraction of the screen the sheet occupies. */
  heightRatio?: number;
}

/**
 * Lightweight bottom sheet: spring-in, drag-to-dismiss, dimmed scrim.
 *
 * Every colour here is applied through `style` from the JS palette rather than
 * a Tailwind class. A native `Modal` renders into its own window, and relying
 * on class-driven surfaces left the sheet transparent on device with the page
 * behind it showing through.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  heightRatio = 0.86,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  // Measured per render, not once at module load. `Dimensions.get('window')`
  // at module scope runs while the bundle is still loading behind the splash,
  // and on Android it can report a window that has not been laid out yet — a
  // short sheet whose content spills over whatever is behind it.
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * heightRatio;
  const translateY = useSharedValue(10000);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 180, mass: 0.7 });
      scrimOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(sheetHeight, { duration: 200, easing: Easing.in(Easing.cubic) });
      scrimOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, sheetHeight, translateY, scrimOpacity]);

  const close = () => {
    translateY.value = withTiming(sheetHeight, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 900) {
        translateY.value = withTiming(sheetHeight, { duration: 180 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  // Height lives inside the animated style rather than in a second style
  // object beside it: `[animatedStyle, { height }]` had its plain half dropped
  // on device, which collapsed the sheet and let the screen behind show
  // through its own content.
  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight,
    transform: [{ translateY: translateY.value }],
  }));

  // Fill folded in for the same reason as the sheet: an animated wrapper with
  // no size of its own collapses the absolutely positioned child inside it.
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={scrimStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={close}
              style={{
                flex: 1,
                backgroundColor: palette.isDark ? 'rgba(0,0,0,0.68)' : 'rgba(17,16,23,0.42)',
              }}
            />
          </Animated.View>

          {/* The animated wrapper carries movement only. Everything that makes
              the sheet opaque lives on the plain View inside it, so the
              background can never depend on an animated component. */}
          <Animated.View style={sheetStyle}>
            <View
              style={{
                height: sheetHeight,
                paddingBottom: insets.bottom,
                backgroundColor: palette.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderTopWidth: 1,
                borderColor: palette.line,
                overflow: 'hidden',
              }}
            >
              <GestureDetector gesture={pan}>
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                  <View
                    style={{
                      height: 4,
                      width: 40,
                      borderRadius: 999,
                      backgroundColor: palette.line,
                    }}
                  />
                </View>
              </GestureDetector>

              {children}
            </View>
          </Animated.View>

        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
