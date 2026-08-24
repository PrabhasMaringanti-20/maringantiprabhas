import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Pressable, Text, View } from 'react-native';

import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { characterPortrait } from '@/data/characterImages';
import { usePalette } from '@/hooks/useTheme';
import { AFFILIATION_ACCENT } from '@/utils/imageHelper';
import type { CharacterStatus, MarvelCharacter } from '@/types';

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

/**
 * Trading-card tile: comic portrait up top with the codename over it, then the
 * civilian name, the actor and a live status line. Characters without a bundled
 * portrait fall back to the emblem avatar in the same frame.
 */
export function CharacterCard({ character, index, onPress }: CharacterCardProps) {
  const palette = usePalette();
  const accent = AFFILIATION_ACCENT[character.affiliation];
  const portrait = characterPortrait(character.id);

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
        className="flex-1 overflow-hidden rounded-2xl border border-line bg-surface"
      >
        {/* Artwork */}
        <View style={{ aspectRatio: 3 / 4, backgroundColor: palette.raised }}>
          {portrait ? (
            <Image
              source={portrait}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              contentPosition="top center"
              transition={180}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <CharacterAvatar character={character} size={78} />
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(6,4,12,0.4)', 'rgba(6,4,12,0.94)']}
            locations={[0.35, 0.65, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />

          {/* Allegiance hairline along the top edge */}
          <View
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ backgroundColor: accent }}
          />

          <View
            className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2"
            style={{
              backgroundColor: STATUS_COLOR[character.status],
              borderColor: 'rgba(6,4,12,0.6)',
            }}
          />

          <Text
            className="absolute inset-x-0 bottom-0 px-2.5 pb-2 text-[13px] font-black leading-4 text-white"
            numberOfLines={2}
          >
            {character.alias}
          </Text>
        </View>

        {/* Credits */}
        <View className="px-2.5 py-2">
          <Text className="text-2xs font-semibold text-ink-soft" numberOfLines={1}>
            {character.name}
          </Text>
          <Text className="mt-1 text-2xs font-bold text-ink" numberOfLines={1}>
            {character.actor}
          </Text>
          <Text
            className="mt-1 text-2xs font-bold uppercase tracking-wider"
            style={{ color: STATUS_COLOR[character.status] }}
            numberOfLines={1}
          >
            {character.status}
          </Text>
        </View>
      </Pressable>
    </MotiView>
  );
}

export { STATUS_COLOR };
