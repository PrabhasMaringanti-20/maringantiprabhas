import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { characterPortrait } from '@/data/characterImages';
import { useActorProfile } from '@/hooks/useTMDB';
import { AFFILIATION_GRADIENT, characterImage, initialsFor } from '@/utils/imageHelper';
import type { MarvelCharacter } from '@/types';

interface CharacterAvatarProps {
  character: MarvelCharacter;
  size: number;
  rounded?: number;
  /** Skip the actor lookup in dense lists. */
  disableFetch?: boolean;
  /** Portraits are 2:3, so a circular crop loses the face — square keeps it. */
  showFullPortrait?: boolean;
}

/**
 * Portrait resolution ladder: curated avatarUrl → bundled comic portrait →
 * TMDB actor headshot → generated allegiance emblem. Something always renders,
 * so the grid never shows a hole.
 */
export function CharacterAvatar({
  character,
  size,
  rounded,
  disableFetch = false,
  showFullPortrait = false,
}: CharacterAvatarProps) {
  const bundled = characterPortrait(character.id);
  // Only look up an actor headshot when there is no comic portrait to show,
  // otherwise the grid becomes a mix of illustration and photography.
  const profilePath = useActorProfile(disableFetch || bundled ? undefined : character.actor);
  const remoteUri = bundled ? null : characterImage(character, profilePath);
  const radius = rounded ?? size / 2;
  const gradient = AFFILIATION_GRADIENT[character.affiliation];

  const height = showFullPortrait ? size * 1.5 : size;

  return (
    <View
      className="overflow-hidden border border-line bg-surface-raised"
      style={{ width: size, height, borderRadius: radius }}
    >
      {bundled ? (
        <Image
          source={bundled}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          contentPosition="top center"
          transition={180}
        />
      ) : remoteUri ? (
        <Image
          source={{ uri: remoteUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={220}
          cachePolicy="disk"
        />
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            className="font-black text-white"
            style={{ fontSize: size * 0.34, letterSpacing: size * 0.02 }}
          >
            {initialsFor(character)}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}
