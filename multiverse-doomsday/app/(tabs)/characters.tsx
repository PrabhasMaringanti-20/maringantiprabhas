import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/common/SearchBar';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { CharacterDetailModal } from '@/components/characters/CharacterDetailModal';
import { FilterChips } from '@/components/characters/FilterChips';
import { useCharacters } from '@/hooks/useCharacters';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import type { MarvelCharacter } from '@/types';

import { CountdownBar } from '@/components/common/CountdownBar';
import { DoomAtmosphere } from '@/components/common/DoomAtmosphere';
import { usePalette } from '@/hooks/useTheme';

export default function CharactersScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { query, setQuery, filter, setFilter, characters, counts, total } = useCharacters();
  const setCharacterFilter = useRoadmapStore((state) => state.setCharacterFilter);

  const [selected, setSelected] = useState<MarvelCharacter | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const openCharacter = (character: MarvelCharacter) => {
    setSelected(character);
    setSheetVisible(true);
  };

  const showAppearances = (character: MarvelCharacter) => {
    setSheetVisible(false);
    setCharacterFilter(character.id);
    router.push('/');
  };

  return (
    <View className="flex-1 bg-canvas">
      <DoomAtmosphere particleCount={9} />

      <FlatList
        data={characters}
        keyExtractor={(character) => character.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 32,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="pb-3">
            <View className="px-5">
              <Text className="text-2xs font-bold uppercase tracking-[3px] text-accent">
                Multiverse Vault
              </Text>
              <Text className="mt-1 text-[32px] font-black leading-9 tracking-tight text-ink">
                Character Codex
              </Text>
              <Text className="mt-1 text-xs text-ink-soft">
                {characters.length} of {total} players in the Incursion endgame
              </Text>

              <View className="mt-4">
                <CountdownBar compact />
              </View>

              <View className="mt-4">
                <SearchBar
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search name, alias, actor or power…"
                />
              </View>
            </View>

            <View className="pt-4">
              <FilterChips value={filter} onChange={setFilter} counts={counts} />
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <CharacterCard character={item} index={index} onPress={openCharacter} />
        )}
        ListEmptyComponent={
          <View className="items-center px-10 py-16">
            <Ionicons name="search-outline" size={40} color={palette.line} />
            <Text className="mt-3 text-center text-sm text-ink-soft">
              No one in the vault matches “{query}”.
            </Text>
          </View>
        }
      />

      <CharacterDetailModal
        character={selected}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onShowAppearances={showAppearances}
      />
    </View>
  );
}
