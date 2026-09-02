import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { characterPortrait } from '@/data/characterImages';
import { useActorProfile } from '@/hooks/useTMDB';
import { usePalette } from '@/hooks/useTheme';
import { motion, radius, space, spring, type } from '@/styles/tokens';
import { AFFILIATION_ACCENT, initialsFor, profileUrl } from '@/utils/imageHelper';
import type { CharacterStatus, MarvelCharacter } from '@/types';

export const STATUS_COLOR: Record<CharacterStatus, string> = {
  // Status colours carry meaning, so they hold across themes.
  Active: '#12A46F',
  Incoming: '#E08A17',
  Variant: '#7C5CE0',
  Deceased: '#E23D3D',
  Unknown: '#8B899C',
};

/** Portrait aspect. Names are laid over the art, so there is no caption block. */
export const TILE_RATIO = 1.38;

export function tileHeight(width: number): number {
  return Math.round(width * TILE_RATIO);
}

interface CharacterTileProps {
  character: MarvelCharacter;
  width: number;
  onPress: (character: MarvelCharacter) => void;
}

/**
 * Full-bleed portrait tile.
 *
 * The art runs edge to edge and the name sits on it under a scrim, rather than
 * the art being boxed above a caption panel. That is what turns the grid into
 * a wall of faces instead of a wall of cards.
 *
 * Every dimension is explicit. An earlier version leaned on flex and
 * aspectRatio, and recycled rows collapsed to hairlines on device.
 */
export function CharacterTile({ character, width, onPress }: CharacterTileProps) {
  const palette = usePalette();
  const accent = AFFILIATION_ACCENT[character.affiliation];
  const portrait = characterPortrait(character.id);

  // Comic art is the house style; an actor headshot only fills the gaps.
  const actorProfile = useActorProfile(portrait ? undefined : character.actor);
  const actorUri = portrait ? null : profileUrl(actorProfile);

  const height = tileHeight(width);
  const press = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(motion.base)} style={pressStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${character.alias}, played by ${character.actor}`}
        onPressIn={() => {
          press.value = withTiming(0.97, { duration: motion.instant });
        }}
        onPressOut={() => {
          press.value = withSpring(1, spring);
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(character);
        }}
        style={{
          width,
          height,
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: palette.raised,
        }}
      >
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
          // No art for this character. The plate stands in for a missing
          // portrait, so it stays quiet — a saturated gradient with 30%-width
          // initials made the handful of gaps the loudest tiles in the grid.
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.raised,
            }}
          >
            <Text style={{ ...type.title, color: palette.inkFaint }}>
              {initialsFor(character)}
            </Text>
          </View>
        )}

        {/* Scrim — dark enough for white type at any brightness of art */}
        <LinearGradient
          colors={['transparent', 'rgba(6,5,12,0.55)', 'rgba(6,5,12,0.94)']}
          locations={[0, 0.52, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.6 }}
        />

        {/* Affiliation tick — the only colour on the tile */}
        <View
          style={{
            position: 'absolute',
            top: space.md,
            left: space.md,
            height: 3,
            width: 18,
            borderRadius: radius.pill,
            backgroundColor: accent,
          }}
        />

        {/* Status dot */}
        <View
          style={{
            position: 'absolute',
            top: space.md,
            right: space.md,
            height: 7,
            width: 7,
            borderRadius: radius.pill,
            backgroundColor: STATUS_COLOR[character.status],
          }}
        />

        <View style={{ position: 'absolute', left: space.md, right: space.md, bottom: space.md }}>
          <Text style={{ ...type.bodyStrong, color: '#FFFFFF' }} numberOfLines={1}>
            {character.alias}
          </Text>
          <Text
            style={{ ...type.small, color: 'rgba(255,255,255,0.62)', marginTop: 1 }}
            numberOfLines={1}
          >
            {character.actor}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
