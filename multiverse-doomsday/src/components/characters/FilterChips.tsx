import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  AFFILIATION_FILTERS,
  AFFILIATION_LABELS,
  type AffiliationFilter,
} from '@/hooks/useCharacters';

interface FilterChipsProps {
  value: AffiliationFilter;
  onChange: (value: AffiliationFilter) => void;
  counts: Record<AffiliationFilter, number>;
}

/** Horizontal allegiance filter row with live counts. */
export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {AFFILIATION_FILTERS.map((filter) => {
        const isActive = filter === value;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(filter);
            }}
            className={`flex-row items-center rounded-full border px-3.5 py-2 ${
              isActive ? 'border-accent bg-accent/15' : 'border-line bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-bold ${isActive ? 'text-accent' : 'text-ink-soft'}`}
              numberOfLines={1}
            >
              {AFFILIATION_LABELS[filter]}
            </Text>
            <View
              className={`ml-2 rounded-full px-1.5 py-0.5 ${
                isActive ? 'bg-accent/25' : 'bg-surface-raised'
              }`}
            >
              <Text
                className={`text-2xs font-bold ${isActive ? 'text-accent' : 'text-ink-faint'}`}
              >
                {counts[filter] ?? 0}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
