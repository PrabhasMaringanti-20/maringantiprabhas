import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { usePalette } from '@/hooks/useTheme';
import { useTmdbDetails } from '@/hooks/useTMDB';
import { posterUrl } from '@/utils/imageHelper';
import type { MovieItem } from '@/types';

interface PosterProps {
  movie: Pick<MovieItem, 'id' | 'title' | 'tmdbId' | 'type' | 'releaseYear'>;
  width: number;
  /** Poster aspect is 2:3; override for square thumbnails. */
  aspectRatio?: number;
  rounded?: string;
  /** Skip the network call for dense lists that already show a title. */
  disableFetch?: boolean;
}



/** "Avengers: Infinity War" → "AIW". Keeps narrow fallbacks legible. */
function acronym(title: string): string {
  const words = title
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 || /^[0-9]+$/.test(word));
  if (words.length === 0) return title.slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join('');
}

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
  const palette = usePalette();
  const { data } = useTmdbDetails(disableFetch ? undefined : movie);
  const uri = posterUrl(data?.posterPath, 'w342');
  const height = width / aspectRatio;
  const isNarrow = width < 76;

  return (
    <View
      className={`overflow-hidden border border-line bg-surface-raised ${rounded}`}
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
        <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center p-2">
            {isNarrow ? (
              <Text
                className="font-black tracking-wider text-ink-soft"
                style={{ fontSize: Math.max(13, width * 0.3) }}
              >
                {acronym(movie.title)}
              </Text>
            ) : (
              <Text
                className="text-center text-[11px] font-bold uppercase leading-tight tracking-wider text-ink-soft"
                numberOfLines={4}
              >
                {movie.title}
              </Text>
            )}
            <Text className="mt-1 text-2xs font-semibold text-ink-faint">{movie.releaseYear}</Text>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}
