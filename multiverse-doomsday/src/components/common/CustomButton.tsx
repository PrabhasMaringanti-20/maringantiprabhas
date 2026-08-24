import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { usePalette } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const SIZES: Record<ButtonSize, { px: number; py: number; font: number; icon: number }> = {
  sm: { px: 12, py: 8, font: 12, icon: 14 },
  md: { px: 16, py: 12, font: 14, icon: 16 },
  lg: { px: 20, py: 16, font: 16, icon: 18 },
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

/**
 * This component is deliberately styled through `style` alone — no `className`.
 * The class-driven version rendered as white text on nothing in light mode on
 * device, so every colour here is resolved in JS where it cannot be dropped.
 */
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
  const sizing = SIZES[size];

  const skin = {
    primary: {
      background: palette.accent,
      border: palette.accent,
      // The accent is a mid-dark green in both themes, so white always reads.
      content: '#FFFFFF',
    },
    secondary: {
      background: palette.raised,
      border: palette.line,
      content: palette.ink,
    },
    ghost: {
      background: 'transparent',
      border: palette.line,
      content: palette.inkSoft,
    },
    danger: {
      background: `${palette.crimson}1A`,
      border: `${palette.crimson}66`,
      content: palette.crimson,
    },
  }[variant];

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(haptic);
    onPress();
  };

  const iconNode = icon ? (
    <Ionicons name={icon} size={sizing.icon} color={skin.content} />
  ) : null;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 260 });
      }}
      onPress={handlePress}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sizing.px,
          paddingVertical: sizing.py,
          borderWidth: 1,
          borderRadius: 16,
          backgroundColor: skin.background,
          borderColor: skin.border,
          opacity: disabled ? 0.4 : 1,
          ...(fullWidth ? { width: '100%' as const } : null),
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={skin.content} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {iconPosition === 'left' && iconNode ? (
            <View style={{ marginRight: 8 }}>{iconNode}</View>
          ) : null}
          <Text
            style={{
              fontSize: sizing.font,
              fontWeight: '700',
              letterSpacing: 0.4,
              color: skin.content,
            }}
          >
            {label}
          </Text>
          {iconPosition === 'right' && iconNode ? (
            <View style={{ marginLeft: 8 }}>{iconNode}</View>
          ) : null}
        </View>
      )}
    </AnimatedPressable>
  );
}
