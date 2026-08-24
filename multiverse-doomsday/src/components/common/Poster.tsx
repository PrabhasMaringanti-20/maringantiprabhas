import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
  rounded?: string;
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

/** Each era gets its own tint, so a scrolled feed reads as a spectrum. */
function eraTint(phase: number | string, palette: ReturnType<typeof usePalette>): string {
  if (typeof phase === 'string') return palette.violet;
  if (phase <= 3) return palette.marvel;
  if (phase <= 5) return palette.accent;
  return palette.crimson;
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
  rounded = 'rounded-xl',
  disableFetch = false,
  hideCaption = false,
}: PosterProps) {
  const palette = usePalette();
  const { data } = useTmdbDetails(disableFetch ? undefined : movie);
  const remoteUri = posterUrl(data?.posterPath, 'w342');
  const bundled = localPoster(movie.id);
  const height = width / aspectRatio;
  const isNarrow = width < 76;
  const tint = eraTint(movie.phase, palette);

  // A poster URL that 404s used to leave an empty rectangle; fall through to
  // the typographic card instead.
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [remoteUri]);

  if ((remoteUri && !failed) || bundled) {
    return (
      <View
        className={`overflow-hidden border border-line bg-surface-raised ${rounded}`}
        style={{ width, height }}
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

  return (
    <View
      className={`overflow-hidden border border-line ${rounded}`}
      style={{ width, height }}
    >
      <LinearGradient
        colors={[`${tint}${palette.isDark ? '2E' : '1A'}`, palette.raised, palette.surface]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center px-1.5">
          <Text
            className="font-black tracking-tight"
            style={{ fontSize: Math.max(15, width * 0.3), color: tint }}
            numberOfLines={1}
          >
            {acronym(movie.title)}
          </Text>

          {!isNarrow && !hideCaption ? (
            <Text
              className="mt-1.5 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-ink-soft"
              numberOfLines={3}
            >
              {movie.title}
            </Text>
          ) : null}

          <Text className="mt-1 text-2xs font-bold text-ink-faint">{movie.releaseYear}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
