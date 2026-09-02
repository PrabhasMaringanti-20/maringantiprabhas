import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { CollapsingHeader, useHeaderInset } from '@/components/common/CollapsingHeader';
import { Ambience } from '@/components/common/Ambience';
import { Empty } from '@/components/common/Primitives';
import { SearchBar } from '@/components/common/SearchBar';
import { CharacterDetailModal } from '@/components/characters/CharacterDetailModal';
import { CharacterTile, tileHeight } from '@/components/characters/CharacterTile';
import { FilterChips } from '@/components/characters/FilterChips';
import { useCharacters } from '@/hooks/useCharacters';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, space } from '@/styles/tokens';
import { useTabBarHeight } from '@/utils/layout';
import type { MarvelCharacter } from '@/types';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<MarvelCharacter>);

const COLUMN_GAP = 10;

export default function CharactersScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const palette = usePalette();
  const router = useRouter();
  const headerInset = useHeaderInset();
  const tabBarHeight = useTabBarHeight();
  const scrollY = useSharedValue(0);

  const { query, setQuery, filter, setFilter, characters, counts, total } = useCharacters();
  const setCharacterFilter = useRoadmapStore((state) => state.setCharacterFilter);

  const [selected, setSelected] = useState<MarvelCharacter | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Column width and row height are fixed, so virtualisation never has to
  // measure a tile. Recycled rows used to collapse to hairlines without this.
  const columnWidth = Math.floor((windowWidth - GUTTER * 2 - COLUMN_GAP) / 2);
  const rowHeight = tileHeight(columnWidth) + COLUMN_GAP;

  const showAppearances = (character: MarvelCharacter) => {
    setSheetVisible(false);
    setCharacterFilter(character.id);
    router.push('/');
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <Ambience />

      <AnimatedFlatList
        data={characters}
        keyExtractor={(character) => character.id}
        numColumns={2}
        onScroll={onScroll}
        scrollEventThrottle={16}
        columnWrapperStyle={{ gap: COLUMN_GAP, paddingHorizontal: GUTTER }}
        contentContainerStyle={{
          paddingTop: headerInset,
          paddingBottom: tabBarHeight + space.xl,
          gap: COLUMN_GAP,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={8}
        windowSize={9}
        getItemLayout={(_data, index) => ({
          length: rowHeight,
          offset: rowHeight * Math.floor(index / 2),
          index,
        })}
        ListHeaderComponent={
          <View style={{ paddingBottom: space.lg }}>
            <View style={{ paddingHorizontal: GUTTER, paddingBottom: space.md }}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder={`Search ${total} characters`}
              />
            </View>
            <FilterChips value={filter} onChange={setFilter} counts={counts} />
          </View>
        }
        renderItem={({ item }) => (
          <CharacterTile
            character={item}
            width={columnWidth}
            onPress={(character) => {
              setSelected(character);
              setSheetVisible(true);
            }}
          />
        )}
        ListEmptyComponent={<Empty icon="search-outline">No one matches that search.</Empty>}
      />

      <CollapsingHeader
        scrollY={scrollY}
        title="Vault"
        large={{ eyebrow: 'Multiverse vault', title: 'Vault' }}
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
