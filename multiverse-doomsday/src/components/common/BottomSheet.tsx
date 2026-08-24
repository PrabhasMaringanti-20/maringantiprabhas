import { useEffect } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const sheetHeight = SCREEN_HEIGHT * heightRatio;
  const translateY = useSharedValue(sheetHeight);
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

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrimOpacity.value }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
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

          <Animated.View
            style={[
              sheetStyle,
              {
                height: sheetHeight,
                paddingBottom: insets.bottom,
                backgroundColor: palette.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderTopWidth: 1,
                borderColor: palette.line,
                overflow: 'hidden',
              },
            ]}
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
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
