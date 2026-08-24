import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { useActorProfile } from '@/hooks/useTMDB';
import { AFFILIATION_GRADIENT, characterImage, initialsFor } from '@/utils/imageHelper';
import type { MarvelCharacter } from '@/types';

interface CharacterAvatarProps {
  character: MarvelCharacter;
  size: number;
  rounded?: number;
  /** Skip the actor lookup in dense lists. */
  disableFetch?: boolean;
}

/**
 * Portrait resolution ladder: curated avatarUrl → TMDB actor headshot →
 * generated allegiance emblem. The emblem means the grid never renders a hole.
 */
export function CharacterAvatar({
  character,
  size,
  rounded,
  disableFetch = false,
}: CharacterAvatarProps) {
  const profilePath = useActorProfile(disableFetch ? undefined : character.actor);
  const uri = characterImage(character, profilePath);
  const radius = rounded ?? size / 2;
  const gradient = AFFILIATION_GRADIENT[character.affiliation];

  return (
    <View
      className="overflow-hidden border border-line"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {uri ? (
        <Image
          source={{ uri }}
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
