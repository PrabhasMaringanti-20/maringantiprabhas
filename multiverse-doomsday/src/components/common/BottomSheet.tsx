import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Fraction of the screen the sheet occupies. */
  heightRatio?: number;
}

/**
 * Lightweight bottom sheet: spring-in, drag-to-dismiss, blurred scrim.
 * Deliberately dependency-free so the app stays inside the managed workflow.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  heightRatio = 0.86,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
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
        <View className="flex-1 justify-end">
          <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={close}
              style={{ flex: 1 }}
            >
              <BlurView intensity={28} tint="dark" style={{ flex: 1 }}>
                <View className="flex-1 bg-void/70" />
              </BlurView>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              sheetStyle,
              {
                height: sheetHeight,
                paddingBottom: insets.bottom,
              },
            ]}
            className="overflow-hidden rounded-t-[28px] border-t border-surface-border bg-surface"
          >
            <GestureDetector gesture={pan}>
              <View className="items-center pb-1 pt-3">
                <View className="h-1 w-10 rounded-full bg-surface-border" />
              </View>
            </GestureDetector>

            {children}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
