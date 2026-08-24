import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Pressable, Text, View } from 'react-native';

import { characterPortrait } from '@/data/characterImages';
import { useActorProfile } from '@/hooks/useTMDB';
import { usePalette } from '@/hooks/useTheme';
import { AFFILIATION_ACCENT, AFFILIATION_GRADIENT, initialsFor, profileUrl } from '@/utils/imageHelper';
import type { CharacterStatus, MarvelCharacter } from '@/types';

const STATUS_COLOR: Record<CharacterStatus, string> = {
  // Status colours carry meaning, so they hold across themes.
  Active: '#12A46F',
  Incoming: '#E08A17',
  Variant: '#7C5CE0',
  Deceased: '#E23D3D',
  Unknown: '#8B899C',
};

/** Art is 3:4; the caption block below it is a fixed three lines. */
export const CARD_ART_RATIO = 4 / 3;
export const CARD_CAPTION_HEIGHT = 74;

/** Total card height for a given column width — the list needs this up front. */
export function characterCardHeight(columnWidth: number): number {
  return Math.round(columnWidth * CARD_ART_RATIO) + CARD_CAPTION_HEIGHT;
}

interface CharacterCardProps {
  character: MarvelCharacter;
  index: number;
  /** Explicit width; the grid measures once and passes it down. */
  width: number;
  onPress: (character: MarvelCharacter) => void;
}

/**
 * Trading-card tile.
 *
 * Every dimension is explicit. An earlier version leaned on `flex-1` and
 * `aspectRatio`, and recycled rows collapsed to hairlines on device — the grid
 * showed stacks of empty borders instead of cards.
 */
export function CharacterCard({ character, index, width, onPress }: CharacterCardProps) {
  const palette = usePalette();
  const accent = AFFILIATION_ACCENT[character.affiliation];
  const portrait = characterPortrait(character.id);

  // Comic art is the house style; an actor headshot only fills the gaps.
  const actorProfile = useActorProfile(portrait ? undefined : character.actor);
  const actorUri = portrait ? null : profileUrl(actorProfile);

  const artHeight = Math.round(width * CARD_ART_RATIO);
  const gradient = AFFILIATION_GRADIENT[character.affiliation];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 320, delay: Math.min(index, 8) * 40 }}
      style={{ width, height: characterCardHeight(width) }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${character.alias}, played by ${character.actor}`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(character);
        }}
        style={{
          width,
          height: characterCardHeight(width),
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: palette.line,
          backgroundColor: palette.surface,
        }}
      >
        <View style={{ width, height: artHeight, backgroundColor: palette.raised }}>
          {portrait || actorUri ? (
            <Image
              source={portrait ?? { uri: actorUri as string }}
              style={{ width, height: artHeight }}
              contentFit="cover"
              contentPosition="top center"
              transition={160}
              cachePolicy="disk"
            />
          ) : (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width, height: artHeight, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: width * 0.3, fontWeight: '900', color: '#FFFFFF' }}>
                {initialsFor(character)}
              </Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(6,4,12,0.45)', 'rgba(6,4,12,0.95)']}
            locations={[0.4, 0.7, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: artHeight }}
          />

          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accent }} />

          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 10,
              height: 10,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: 'rgba(6,4,12,0.55)',
              backgroundColor: STATUS_COLOR[character.status],
            }}
          />

          <Text
            numberOfLines={2}
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              bottom: 8,
              fontSize: 13,
              lineHeight: 16,
              fontWeight: '900',
              color: '#FFFFFF',
            }}
          >
            {character.alias}
          </Text>
        </View>

        <View style={{ height: CARD_CAPTION_HEIGHT, paddingHorizontal: 10, paddingVertical: 8 }}>
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
