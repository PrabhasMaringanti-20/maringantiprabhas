import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, Text, View } from 'react-native';

import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { AFFILIATION_ACCENT } from '@/utils/imageHelper';
import type { CharacterStatus, MarvelCharacter } from '@/types';

import { usePalette } from '@/hooks/useTheme';

const STATUS_COLOR: Record<CharacterStatus, string> = {
  // Status colours carry meaning, so they hold across themes.
  Active: '#12A46F',
  Incoming: '#E08A17',
  Variant: '#7C5CE0',
  Deceased: '#E23D3D',
  Unknown: '#8B899C',
};

interface CharacterCardProps {
  character: MarvelCharacter;
  index: number;
  onPress: (character: MarvelCharacter) => void;
}

/** Grid tile: emblem/portrait, alias, real name, actor badge and live status. */
export function CharacterCard({ character, index, onPress }: CharacterCardProps) {
  const palette = usePalette();
  const accent = AFFILIATION_ACCENT[character.affiliation];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'timing', duration: 340, delay: Math.min(index, 10) * 45 }}
      className="flex-1"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${character.alias}, played by ${character.actor}`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(character);
        }}
        className="flex-1 items-center rounded-2xl border border-line bg-surface p-3"
      >
        <View className="items-center">
          <View
            className="rounded-full p-[2px]"
            style={{ borderWidth: 1.5, borderColor: `${accent}66`, borderRadius: 999 }}
          >
            <CharacterAvatar character={character} size={72} />
          </View>

          <View
            className="absolute -bottom-0.5 right-0 h-3.5 w-3.5 rounded-full border-2"
            style={{
              backgroundColor: STATUS_COLOR[character.status],
              borderColor: palette.surface,
            }}
          />
        </View>

        <Text className="mt-2.5 text-center text-sm font-black leading-4 text-ink" numberOfLines={2}>
          {character.alias}
        </Text>
        <Text className="mt-0.5 text-center text-2xs font-semibold text-ink-soft" numberOfLines={1}>
          {character.name}
        </Text>

        <View className="mt-2 w-full rounded-lg bg-surface-raised px-2 py-1">
          <Text className="text-center text-2xs font-semibold text-ink-soft" numberOfLines={1}>
            {character.actor}
          </Text>
        </View>

        <View className="mt-2 flex-row items-center">
          <View
            className="mr-1.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: STATUS_COLOR[character.status] }}
          />
          <Text
            className="text-2xs font-bold uppercase tracking-wider"
            style={{ color: STATUS_COLOR[character.status] }}
          >
            {character.status}
          </Text>
        </View>
      </Pressable>
    </MotiView>
  );
}

export { STATUS_COLOR };
