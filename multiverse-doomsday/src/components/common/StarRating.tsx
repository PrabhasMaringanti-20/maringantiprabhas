import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, View } from 'react-native';

import { usePalette } from '@/hooks/useTheme';

interface StarRatingProps {
  /** 0–5. 0 renders as fully unrated. */
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}

/** Tapping the active star clears the rating (handled upstream in the store). */
export function StarRating({ value, onChange, size = 26, readOnly = false }: StarRatingProps) {
  const palette = usePalette();

  return (
    <View className="flex-row items-center" accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            disabled={readOnly}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onPress={() => {
              if (readOnly) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange?.(star);
            }}
            style={{ paddingHorizontal: 3 }}
          >
            <MotiView
              animate={{ scale: filled ? 1 : 0.9, opacity: filled ? 1 : 0.45 }}
              transition={{ type: 'spring', damping: 14, stiffness: 260 }}
            >
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={size}
                color={filled ? palette.gold : palette.inkFaint}
              />
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}
