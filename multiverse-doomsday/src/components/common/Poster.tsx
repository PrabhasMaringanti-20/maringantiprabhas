import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { localPoster } from '@/data/posterImages';
import { usePalette } from '@/hooks/useTheme';
import { useTmdbDetails } from '@/hooks/useTMDB';
import { posterUrl } from '@/utils/imageHelper';
import type { MovieItem } from '@/types';

interface PosterProps {
  movie: Pick<MovieItem, 'id' | 'title' | 'tmdbId' | 'type' | 'releaseYear' | 'phase'>;
  width: number;
  /** Poster aspect is 2:3; override for square thumbnails. */
  aspectRatio?: number;
  /** Corner radius. Defaults to the small radius used across the app. */
  round?: number;
  /** Skip the network call for dense lists that already show a title. */
  disableFetch?: boolean;
  /** Hide the title plate — used where the title already sits alongside. */
  hideCaption?: boolean;
}

/** "Avengers: Infinity War" → "AIW". Keeps narrow cards legible. */
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
 * Poster art, in order of preference:
 *   1. the real TMDB poster, once an API key is configured
 *   2. a local poster dropped into assets/images/posters/ (see npm run posters)
 *   3. a typographic card tinted by era
 *
 * Only real posters ever represent a film — the comic art in this app belongs
 * to the character vault, not to the movies.
 */
export function Poster({
  movie,
  width,
  aspectRatio = 2 / 3,
  round = 6,
  disableFetch = false,
  hideCaption = false,
}: PosterProps) {
  const palette = usePalette();
  const { data } = useTmdbDetails(disableFetch ? undefined : movie);
  const remoteUri = posterUrl(data?.posterPath, 'w342');
  const bundled = localPoster(movie.id);
  const height = width / aspectRatio;
  const isNarrow = width < 76;

  // A poster URL that 404s used to leave an empty rectangle; fall through to
  // the typographic card instead.
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [remoteUri]);

  if ((remoteUri && !failed) || bundled) {
    return (
      <View
        style={{
          width,
          height,
          borderRadius: round,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: palette.line,
          backgroundColor: palette.raised,
        }}
      >
        <Image
          source={remoteUri && !failed ? { uri: remoteUri } : bundled}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={220}
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  // The placeholder stands in for artwork that has not loaded — it should read
  // as an absence, not as a design element. An earlier version set the acronym
  // in era-tinted colour at 30% of the tile width, which made a feed of
  // unloaded posters louder than one full of real ones.
  return (
    <View
      style={{
        width,
        height,
        borderRadius: round,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.raised,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          fontSize: Math.max(9, Math.min(13, width * 0.24)),
          fontWeight: '700',
          letterSpacing: 0.4,
          color: palette.inkFaint,
        }}
        numberOfLines={1}
      >
        {acronym(movie.title)}
      </Text>

      {!isNarrow && !hideCaption ? (
        <Text
          style={{
            marginTop: 4,
            fontSize: 9,
            lineHeight: 12,
            fontWeight: '500',
            textAlign: 'center',
            color: palette.inkFaint,
          }}
          numberOfLines={3}
        >
          {movie.title}
        </Text>
      ) : null}
    </View>
  );
}
