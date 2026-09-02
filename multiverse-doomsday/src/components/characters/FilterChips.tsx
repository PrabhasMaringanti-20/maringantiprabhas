import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import {
  AFFILIATION_FILTERS,
  AFFILIATION_LABELS,
  type AffiliationFilter,
} from '@/hooks/useCharacters';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, motion, space, type } from '@/styles/tokens';

interface FilterChipsProps {
  value: AffiliationFilter;
  onChange: (value: AffiliationFilter) => void;
  counts: Record<AffiliationFilter, number>;
}

/**
 * Allegiance filter.
 *
 * Underlined text rather than pills: seven filled chips in a row was the
 * loudest element on a screen whose subject is the portraits below it.
 */
export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: GUTTER, gap: space.xl, alignItems: 'center' }}
    >
      {AFFILIATION_FILTERS.map((filter) => (
        <Chip
          key={filter}
          label={AFFILIATION_LABELS[filter]}
          count={counts[filter]}
          active={filter === value}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(filter);
          }}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const palette = usePalette();
  const progress = useSharedValue(active ? 1 : 0);

  progress.value = withTiming(active ? 1 : 0, { duration: motion.quick });

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
    opacity: progress.value,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} ${count}`}
      onPress={onPress}
      style={{ paddingVertical: space.sm }}
    >
      <Text
        style={{
          ...type.bodyStrong,
          color: active ? palette.ink : palette.inkFaint,
        }}
      >
        {label}
        <Text style={{ ...type.ordinal, color: palette.inkFaint }}> {count}</Text>
      </Text>

      <Animated.View
        style={[
          underlineStyle,
          {
            height: 2,
            marginTop: space.xs,
            borderRadius: 999,
            backgroundColor: palette.accent,
          },
        ]}
      />
    </Pressable>
  );
}
