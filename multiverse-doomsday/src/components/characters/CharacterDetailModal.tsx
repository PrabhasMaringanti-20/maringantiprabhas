import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { CustomButton } from '@/components/common/CustomButton';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { STATUS_COLOR } from '@/components/characters/CharacterCard';
import { useCharacterAppearances } from '@/hooks/useCharacters';
import { AFFILIATION_ACCENT, AFFILIATION_GRADIENT } from '@/utils/imageHelper';
import type { MarvelCharacter } from '@/types';

interface CharacterDetailModalProps {
  character: MarvelCharacter | null;
  visible: boolean;
  onClose: () => void;
  /** Jumps to the Roadmap tab filtered to this character's appearances. */
  onShowAppearances: (character: MarvelCharacter) => void;
}

export function CharacterDetailModal({
  character,
  visible,
  onClose,
  onShowAppearances,
}: CharacterDetailModalProps) {
  const appearances = useCharacterAppearances(character ?? undefined);

  if (!character) return null;

  const accent = AFFILIATION_ACCENT[character.affiliation];
  const gradient = AFFILIATION_GRADIENT[character.affiliation];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Portrait header */}
        <LinearGradient
          colors={[`${gradient[0]}55`, '#161124']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        >
          <View className="flex-row items-center">
            <View
              className="rounded-2xl p-[3px]"
              style={{ borderWidth: 2, borderColor: `${accent}88`, borderRadius: 20 }}
            >
              <CharacterAvatar character={character} size={92} rounded={16} />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-2xl font-black leading-7 text-white">{character.alias}</Text>
              <Text className="mt-0.5 text-sm font-semibold text-muted">{character.name}</Text>

              <View className="mt-2 flex-row items-center">
                <View
                  className="mr-1.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[character.status] }}
                />
                <Text
                  className="text-2xs font-bold uppercase tracking-[2px]"
                  style={{ color: STATUS_COLOR[character.status] }}
                >
                  {character.status}
                </Text>
                <Text className="mx-2 text-2xs text-muted-deep">•</Text>
                <Text className="flex-1 text-2xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                  {character.affiliation}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row gap-2">
            <View className="flex-1 rounded-xl border border-surface-border bg-surface/80 px-3 py-2">
              <Text className="text-2xs font-bold uppercase tracking-wider text-muted-deep">
                Portrayed by
              </Text>
              <Text className="mt-0.5 text-sm font-bold text-white" numberOfLines={2}>
                {character.actor}
              </Text>
            </View>
            <View className="flex-1 rounded-xl border border-surface-border bg-surface/80 px-3 py-2">
              <Text className="text-2xs font-bold uppercase tracking-wider text-muted-deep">
                MCU debut
              </Text>
              <Text className="mt-0.5 text-sm font-bold text-white" numberOfLines={2}>
                {character.mcuDebut}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Comic origins vs MCU role */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center">
            <Ionicons name="book-outline" size={15} color={accent} />
            <Text className="ml-2 text-xs font-bold uppercase tracking-[2px] text-white">
              Comic origins vs MCU role
            </Text>
          </View>

          <View className="mt-3 rounded-2xl border border-surface-border bg-surface-raised p-4">
            {character.comicBio.map((line, index) => (
              <View key={index} className={`flex-row ${index > 0 ? 'mt-3' : ''}`}>
                <View
                  className="mr-3 mt-[7px] h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <Text className="flex-1 text-[13px] leading-5 text-muted">{line}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Powers */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center">
            <Ionicons name="flash-outline" size={15} color="#F59E0B" />
            <Text className="ml-2 text-xs font-bold uppercase tracking-[2px] text-white">
              Key powers & abilities
            </Text>
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            {character.powers.map((power) => (
              <View
                key={power}
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: `${accent}55`, backgroundColor: `${accent}12` }}
              >
                <Text className="text-xs font-semibold" style={{ color: accent }}>
                  {power}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key appearances */}
        <View className="px-5 pt-6">
          <CustomButton
            label={`Key appearances (${appearances.length})`}
            icon="git-branch-outline"
            variant="primary"
            size="lg"
            fullWidth
            disabled={appearances.length === 0}
            onPress={() => onShowAppearances(character)}
          />
          <Text className="mt-2 text-center text-2xs text-muted-deep">
            Filters the Roadmap to every entry this character appears in.
          </Text>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
