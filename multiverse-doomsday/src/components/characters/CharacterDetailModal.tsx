import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { CustomButton } from '@/components/common/CustomButton';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { STATUS_COLOR } from '@/components/characters/CharacterCard';
import { characterPortrait } from '@/data/characterImages';
import { useCharacterAppearances } from '@/hooks/useCharacters';
import { AFFILIATION_ACCENT, AFFILIATION_GRADIENT } from '@/utils/imageHelper';
import type { MarvelCharacter } from '@/types';

import { usePalette } from '@/hooks/useTheme';

interface CharacterDetailModalProps {
  character: MarvelCharacter | null;
  visible: boolean;
  onClose: () => void;
  /** Jumps to the Roadmap tab filtered to this character's appearances. */
  onShowAppearances: (character: MarvelCharacter) => void;
}

const PORTRAIT_W = 104;

/**
 * Character sheet.
 *
 * Colours come from the JS palette via `style`, never from Tailwind classes:
 * this renders inside a native `Modal`, which is its own window, and the
 * class-driven version came out transparent with overlapping text on device.
 */
export function CharacterDetailModal({
  character,
  visible,
  onClose,
  onShowAppearances,
}: CharacterDetailModalProps) {
  const palette = usePalette();
  const appearances = useCharacterAppearances(character ?? undefined);

  if (!character) return null;

  const accent = AFFILIATION_ACCENT[character.affiliation];
  const gradient = AFFILIATION_GRADIENT[character.affiliation];
  const hasPortrait = Boolean(characterPortrait(character.id));

  const label = {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
    color: palette.inkFaint,
  };

  const factBox = {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[`${gradient[0]}${palette.isDark ? '55' : '1F'}`, palette.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View
              style={{
                borderWidth: 2,
                borderColor: `${accent}99`,
                borderRadius: 20,
                padding: 3,
              }}
            >
              <CharacterAvatar
                character={character}
                size={PORTRAIT_W}
                rounded={15}
                showFullPortrait={hasPortrait}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 16, paddingTop: 2 }}>
              <Text
                style={{ fontSize: 23, lineHeight: 27, fontWeight: '900', color: palette.ink }}
              >
                {character.alias}
              </Text>
              <Text
                style={{
                  marginTop: 3,
                  fontSize: 13,
                  fontWeight: '600',
                  color: palette.inkSoft,
                }}
              >
                {character.name}
              </Text>

              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <View
                  style={{
                    height: 7,
                    width: 7,
                    borderRadius: 999,
                    marginRight: 6,
                    backgroundColor: STATUS_COLOR[character.status],
                  }}
                />
                <Text style={{ ...label, color: STATUS_COLOR[character.status] }}>
                  {character.status}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 8,
                  alignSelf: 'flex-start',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: `${accent}66`,
                  backgroundColor: `${accent}1A`,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ ...label, color: accent }}>{character.affiliation}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
            <View style={factBox}>
              <Text style={label}>Portrayed by</Text>
              <Text
                numberOfLines={2}
                style={{ marginTop: 3, fontSize: 13, fontWeight: '700', color: palette.ink }}
              >
                {character.actor}
              </Text>
            </View>
            <View style={factBox}>
              <Text style={label}>MCU debut</Text>
              <Text
                numberOfLines={2}
                style={{ marginTop: 3, fontSize: 13, fontWeight: '700', color: palette.ink }}
              >
                {character.mcuDebut}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Comic origins vs MCU role */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="book-outline" size={15} color={accent} />
            <Text style={{ ...label, marginLeft: 8, color: palette.ink, letterSpacing: 2 }}>
              Comic origins vs MCU role
            </Text>
          </View>

          <View
            style={{
              marginTop: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: palette.line,
              backgroundColor: palette.raised,
              padding: 16,
            }}
          >
            {character.comicBio.map((line, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', marginTop: index > 0 ? 12 : 0 }}
              >
                <View
                  style={{
                    marginRight: 12,
                    marginTop: 7,
                    height: 6,
                    width: 6,
                    borderRadius: 999,
                    backgroundColor: accent,
                  }}
                />
                <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: palette.inkSoft }}>
                  {line}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Powers */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flash-outline" size={15} color={palette.marvel} />
            <Text style={{ ...label, marginLeft: 8, color: palette.ink, letterSpacing: 2 }}>
              Key powers & abilities
            </Text>
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {character.powers.map((power) => (
              <View
                key={power}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderColor: `${accent}55`,
                  backgroundColor: `${accent}14`,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: accent }}>{power}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key appearances */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <CustomButton
            label={`Key appearances (${appearances.length})`}
            icon="git-branch-outline"
            variant="primary"
            size="lg"
            fullWidth
            disabled={appearances.length === 0}
            onPress={() => onShowAppearances(character)}
          />
          <Text
            style={{
              marginTop: 10,
              textAlign: 'center',
              fontSize: 11,
              color: palette.inkFaint,
            }}
          >
            Filters the Roadmap to every entry this character appears in.
          </Text>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
