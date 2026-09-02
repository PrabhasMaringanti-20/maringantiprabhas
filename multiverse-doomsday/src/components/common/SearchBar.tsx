import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, TextInput, View } from 'react-native';

import { Rule } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { space, type } from '@/styles/tokens';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** An underlined field rather than a boxed one, to match the editorial layout. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  autoFocus = false,
}: SearchBarProps) {
  const palette = usePalette();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: space.sm }}>
        <Ionicons name="search" size={15} color={palette.inkFaint} />
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
          accessibilityLabel={placeholder}
          style={{
            flex: 1,
            marginLeft: space.sm,
            padding: 0,
            ...type.body,
            fontSize: 15,
            color: palette.ink,
          }}
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
            <Ionicons name="close-circle" size={17} color={palette.inkFaint} />
          </Pressable>
        ) : null}
      </View>
      <Rule />
    </View>
  );
}
