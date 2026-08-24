import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, TextInput, View } from 'react-native';

import { usePalette } from '@/hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  autoFocus = false,
}: SearchBarProps) {
  const palette = usePalette();

  return (
    <View className="flex-row items-center rounded-2xl border border-line bg-surface px-3 py-2.5">
      <Ionicons name="search" size={16} color={palette.inkFaint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.inkFaint}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        className="ml-2 flex-1 p-0 text-[15px] text-ink"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => {
            Haptics.selectionAsync();
            onChangeText('');
          }}
        >
          <Ionicons name="close-circle" size={18} color={palette.inkFaint} />
        </Pressable>
      ) : null}
    </View>
  );
}
