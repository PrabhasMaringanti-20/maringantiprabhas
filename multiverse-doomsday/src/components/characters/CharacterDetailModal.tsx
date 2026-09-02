import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Rule } from '@/components/common/Primitives';
import { STATUS_COLOR } from '@/components/characters/CharacterTile';
import { characterPortrait } from '@/data/characterImages';
import { useCharacterAppearances } from '@/hooks/useCharacters';
import { useActorProfile } from '@/hooks/useTMDB';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, radius, space, type } from '@/styles/tokens';
import { AFFILIATION_ACCENT, AFFILIATION_GRADIENT, initialsFor, profileUrl } from '@/utils/imageHelper';
import type { MarvelCharacter } from '@/types';

interface CharacterDetailModalProps {
  character: MarvelCharacter | null;
  visible: boolean;
  onClose: () => void;
  /** Jumps to the Roadmap tab filtered to this character's appearances. */
  onShowAppearances: (character: MarvelCharacter) => void;
}

/**
 * Portraits are 300x450 and are already tight head-and-shoulders crops, so at
 * the sheet's full width the image scales up a long way. A short window cut
 * chins off; 460 is the point at which every portrait in the set shows a whole
 * face, capped on short screens so the sheet still has room for content.
 */
const ART_MAX = 460;

/**
 * Character sheet.
 *
 * Opens on the portrait at full bleed with the name laid over it — the same
 * treatment as the tile it was tapped from, so the transition reads as the
 * tile growing rather than a different screen appearing.
 *
 * Colours come from the JS palette via `style`, never Tailwind classes: this
 * renders inside a native Modal, which is its own window, and the class-driven
 * version came out transparent on device.
 */
export function CharacterDetailModal({
  character,
  visible,
  onClose,
  onShowAppearances,
}: CharacterDetailModalProps) {
  const palette = usePalette();
  const { height: windowHeight } = useWindowDimensions();
  const appearances = useCharacterAppearances(character ?? undefined);
  const portrait = character ? characterPortrait(character.id) : undefined;
  const actorProfile = useActorProfile(!character || portrait ? undefined : character.actor);

  if (!character) return null;

  const accent = AFFILIATION_ACCENT[character.affiliation];
  const gradient = AFFILIATION_GRADIENT[character.affiliation];
  const actorUri = portrait ? null : profileUrl(actorProfile);
  const artHeight = Math.min(ART_MAX, Math.round(windowHeight * 0.55));

  const fact = (label: string, value: string) => (
    <View style={{ flex: 1 }}>
      <Marker>{label}</Marker>
      <Text
        style={{ ...type.bodyStrong, color: palette.ink, marginTop: space.xs }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.xxxl }}>
        {/* Portrait */}
        <View style={{ height: artHeight, backgroundColor: palette.raised }}>
          {portrait ? (
            <Image
              source={portrait}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              contentPosition="top center"
              transition={220}
            />
          ) : actorUri ? (
            <Image
              source={{ uri: actorUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              contentPosition="top center"
              transition={220}
            />
          ) : (
            <LinearGradient
              colors={[gradient[0], gradient[1]]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 56, fontWeight: '700', color: palette.inkFaint }}>
                {initialsFor(character)}
              </Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['transparent', `${palette.surface}CC`, palette.surface]}
            locations={[0, 0.55, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: artHeight * 0.45 }}
          />

          <View style={{ position: 'absolute', left: GUTTER, right: GUTTER, bottom: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.sm }}>
              <View
                style={{
                  height: 6,
                  width: 6,
                  borderRadius: radius.pill,
                  backgroundColor: STATUS_COLOR[character.status],
                  marginRight: space.sm,
                }}
              />
              <Marker color={STATUS_COLOR[character.status]}>{character.status}</Marker>
              <View
                style={{
                  height: 2,
                  width: 12,
                  borderRadius: radius.pill,
                  backgroundColor: accent,
                  marginHorizontal: space.sm,
                }}
              />
              <Marker color={accent}>{character.affiliation}</Marker>
            </View>

            <Text style={{ ...type.display, fontSize: 32, lineHeight: 35, color: palette.ink }}>
              {character.alias}
            </Text>
            <Text style={{ ...type.small, color: palette.inkSoft, marginTop: space.xs }}>
              {character.name}
            </Text>
          </View>
        </View>

        {/* Facts */}
        <View style={{ paddingHorizontal: GUTTER, paddingTop: space.lg }}>
          <Rule />
          <View style={{ flexDirection: 'row', paddingVertical: space.lg, gap: space.lg }}>
            {fact('Portrayed by', character.actor)}
            {fact('MCU debut', character.mcuDebut)}
          </View>
          <Rule />
        </View>

        {/* Comic origins */}
        <View style={{ paddingHorizontal: GUTTER, paddingTop: space.xxl }}>
          <Marker>Comic origins vs MCU role</Marker>
          <View style={{ marginTop: space.md }}>
            {character.comicBio.map((line, index) => (
              <View key={index} style={{ flexDirection: 'row', marginTop: index > 0 ? space.md : 0 }}>
                <View
                  style={{
                    width: 2,
                    borderRadius: radius.pill,
                    backgroundColor: accent,
                    opacity: 0.5,
                    marginRight: space.md,
                  }}
                />
                <Text style={{ ...type.body, color: palette.inkSoft, flex: 1 }}>{line}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Powers */}
        <View style={{ paddingHorizontal: GUTTER, paddingTop: space.xxl }}>
          <Marker>Key powers & abilities</Marker>
          <View style={{ marginTop: space.md, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {character.powers.map((power) => (
              <View
                key={power}
                style={{
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  paddingHorizontal: space.md,
                  paddingVertical: space.xs + 1,
                  borderColor: `${accent}4D`,
                }}
              >
                <Text style={{ ...type.small, color: accent }}>{power}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Appearances */}
        <View style={{ paddingHorizontal: GUTTER, paddingTop: space.xxl }}>
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
              ...type.small,
              color: palette.inkFaint,
              textAlign: 'center',
              marginTop: space.md,
            }}
          >
            Filters the Roadmap to every entry this character appears in.
          </Text>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
