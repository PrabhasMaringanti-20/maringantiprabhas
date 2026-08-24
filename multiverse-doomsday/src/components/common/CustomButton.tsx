import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { usePalette } from '@/hooks/useTheme';
import { enableClassName } from '@/styles/nativewindInterop';

const AnimatedPressable = enableClassName(Animated.createAnimatedComponent(Pressable));

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, { wrap: string; text: string }> = {
  primary: { wrap: 'bg-accent border-accent', text: 'text-white' },
  secondary: { wrap: 'bg-surface-raised border-line', text: 'text-ink' },
  ghost: { wrap: 'bg-transparent border-line', text: 'text-ink-soft' },
  danger: { wrap: 'bg-crimson/10 border-crimson/40', text: 'text-crimson' },
};

const SIZES: Record<ButtonSize, { wrap: string; text: string; icon: number }> = {
  sm: { wrap: 'px-3 py-2', text: 'text-xs', icon: 14 },
  md: { wrap: 'px-4 py-3', text: 'text-sm', icon: 16 },
  lg: { wrap: 'px-5 py-4', text: 'text-base', icon: 18 },
};

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Haptic fired on press. Pass null to stay silent. */
  haptic?: Haptics.ImpactFeedbackStyle | null;
}

export function CustomButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  haptic = Haptics.ImpactFeedbackStyle.Light,
}: CustomButtonProps) {
  const palette = usePalette();
  const scale = useSharedValue(1);
  const style = VARIANTS[variant];
  const iconColor = {
    primary: '#FFFFFF',
    secondary: palette.ink,
    ghost: palette.inkSoft,
    danger: palette.crimson,
  }[variant];
  const sizing = SIZES[size];

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(haptic);
    onPress();
  };

  const iconNode = icon ? (
    <Ionicons name={icon} size={sizing.icon} color={iconColor} />
  ) : null;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 260 });
      }}
      onPress={handlePress}
      style={animatedStyle}
      className={`flex-row items-center justify-center rounded-2xl border ${style.wrap} ${
        sizing.wrap
      } ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View className="flex-row items-center">
          {iconPosition === 'left' && iconNode ? <View className="mr-2">{iconNode}</View> : null}
          <Text className={`font-bold tracking-wide ${style.text} ${sizing.text}`}>{label}</Text>
          {iconPosition === 'right' && iconNode ? <View className="ml-2">{iconNode}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}
