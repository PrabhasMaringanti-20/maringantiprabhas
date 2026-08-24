import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { useTmdbDetails } from '@/hooks/useTMDB';
import { posterUrl } from '@/utils/imageHelper';
import type { MovieItem } from '@/types';

interface PosterProps {
  movie: Pick<MovieItem, 'title' | 'tmdbId' | 'type' | 'releaseYear'>;
  width: number;
  /** Poster aspect is 2:3; override for square thumbnails. */
  aspectRatio?: number;
  rounded?: string;
  /** Skip the network call for dense lists that already show a title. */
  disableFetch?: boolean;
}

const FALLBACK_GRADIENT = ['#211A35', '#161124'] as const;

/**
 * TMDB poster with a hand-built fallback so the app looks intentional offline
 * and without an API key.
 */
export function Poster({
  movie,
  width,
  aspectRatio = 2 / 3,
  rounded = 'rounded-xl',
  disableFetch = false,
}: PosterProps) {
  const { data } = useTmdbDetails(disableFetch ? undefined : movie.tmdbId, movie.type);
  const uri = posterUrl(data?.posterPath, 'w342');
  const height = width / aspectRatio;

  return (
    <View
      className={`overflow-hidden border border-surface-border bg-surface-raised ${rounded}`}
      style={{ width, height }}
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
        <LinearGradient colors={FALLBACK_GRADIENT} style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center p-2">
            <Text
              className="text-center text-[11px] font-bold uppercase leading-tight tracking-wider text-muted"
              numberOfLines={4}
            >
              {movie.title}
            </Text>
            <Text className="mt-1 text-2xs font-semibold text-muted-deep">{movie.releaseYear}</Text>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}
