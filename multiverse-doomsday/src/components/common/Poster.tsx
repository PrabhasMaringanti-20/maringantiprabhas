import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { characterPortrait } from '@/data/characterImages';
import { MOVIE_CATALOGUE } from '@/hooks/useRoadmapStore';
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
  /** Hide the title plate — used where the title already sits alongside. */
  hideCaption?: boolean;
}

/** "Avengers: Infinity War" → "AIW". Keeps narrow art legible. */
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

/** The face of the film: its first key character that ships with a portrait. */
function keyArtFor(movieId: string) {
  const entry = MOVIE_CATALOGUE.find((item) => item.id === movieId);
  for (const characterId of entry?.keyCharacterIds ?? []) {
    const portrait = characterPortrait(characterId);
    if (portrait) return portrait;
  }
  return undefined;
}

/**
 * Poster art, in order of preference:
 *   1. the real TMDB poster, when an API key is configured
 *   2. bundled key art — the film's headline character under a title plate
 *   3. a typographic card
 *
 * Everything below the first rung works offline, so the app is never full of
 * empty rectangles.
 */
export function Poster({
  movie,
  width,
  aspectRatio = 2 / 3,
  rounded = 'rounded-xl',
  disableFetch = false,
  hideCaption = false,
}: PosterProps) {
  const palette = usePalette();
  const { data } = useTmdbDetails(disableFetch ? undefined : movie);
  const uri = posterUrl(data?.posterPath, 'w342');
  const keyArt = keyArtFor(movie.id);
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
      ) : keyArt ? (
        <View style={{ flex: 1 }}>
          <Image
            source={keyArt}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            contentPosition="top center"
            transition={180}
          />

          {/* Ink wash so the plate reads over any artwork */}
          <LinearGradient
            colors={['transparent', 'rgba(6,4,12,0.35)', 'rgba(6,4,12,0.92)']}
            locations={[0.3, 0.6, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
          />

          {!hideCaption ? (
            <View className="absolute inset-x-0 bottom-0 p-1.5">
              {isNarrow ? (
                <Text
                  className="text-center font-black tracking-wider text-white"
                  style={{ fontSize: Math.max(11, width * 0.22) }}
                  numberOfLines={1}
                >
                  {acronym(movie.title)}
                </Text>
              ) : (
                <Text
                  className="text-[10px] font-black uppercase leading-tight tracking-wide text-white"
                  numberOfLines={3}
                >
                  {movie.title}
                </Text>
              )}
              <Text
                className="mt-0.5 text-center text-2xs font-bold"
                style={{ color: palette.accent, textAlign: isNarrow ? 'center' : 'left' }}
              >
                {movie.releaseYear}
              </Text>
            </View>
          ) : null}
        </View>
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
