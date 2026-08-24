import { MotiText, MotiView } from 'moti';
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

/**
 * NativeWind wires `className` into React Native's core components only.
 * Reanimated's animated variants are distinct components, so without this
 * registration every `className` on an <Animated.View> is silently dropped.
 *
 * Imported for side effects from the root layout, before anything renders.
 */
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });
cssInterop(Animated.Image, { className: 'style' });

// Moti wraps Reanimated in its own components, which need the same treatment.
cssInterop(MotiView, { className: 'style' });
cssInterop(MotiText, { className: 'style' });

/** Register any locally created animated component (e.g. an animated Pressable). */
export function enableClassName<T>(component: T): T {
  cssInterop(component as never, { className: 'style' });
  return component;
}
