import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, TextInput, View } from 'react-native';

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
  return (
    <View className="flex-row items-center rounded-2xl border border-surface-border bg-surface px-3 py-2.5">
      <Ionicons name="search" size={16} color="#8B80A8" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#5C5378"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        className="ml-2 flex-1 p-0 text-[15px] text-white"
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
          <Ionicons name="close-circle" size={18} color="#5C5378" />
        </Pressable>
      ) : null}
    </View>
  );
}
