import { useEffect, useState } from 'react';

import {
  fetchActorProfilePath,
  fetchDetails,
  fetchStreamingProviders,
  hasTmdbKey,
} from '@/services/tmdbApi';
import type { AsyncState, StreamingAvailability, TmdbDetails } from '@/types';

interface TmdbResult<T> {
  data: T | null;
  state: AsyncState;
  /** True when there is no API key configured — the UI shows a setup hint instead of an error. */
  disabled: boolean;
}

/** Poster, backdrop and overview for one catalogue entry. */
export function useTmdbDetails(
  tmdbId: number | undefined,
  type: 'movie' | 'series' = 'movie',
): TmdbResult<TmdbDetails> {
  const [data, setData] = useState<TmdbDetails | null>(null);
  const [state, setState] = useState<AsyncState>('idle');

  useEffect(() => {
    if (!tmdbId || !hasTmdbKey) return;
    let cancelled = false;

    setState('loading');
    fetchDetails(tmdbId, type)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setState(result ? 'success' : 'error');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbId, type]);

  return { data, state, disabled: !hasTmdbKey };
}

/** Country-specific "Where to Stream" row, powered by TMDB's JustWatch data. */
export function useStreamingProviders(
  tmdbId: number | undefined,
  type: 'movie' | 'series' = 'movie',
  region?: string,
): TmdbResult<StreamingAvailability> {
  const [data, setData] = useState<StreamingAvailability | null>(null);
  const [state, setState] = useState<AsyncState>('idle');

  useEffect(() => {
    if (!tmdbId || !hasTmdbKey) return;
    let cancelled = false;

    setState('loading');
    fetchStreamingProviders(tmdbId, type, region)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setState(result ? 'success' : 'error');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbId, type, region]);

  return { data, state, disabled: !hasTmdbKey };
}

/** Actor headshot path for a character card. Resolves to null without a key. */
export function useActorProfile(actorName: string | undefined): string | null {
  const [profilePath, setProfilePath] = useState<string | null>(null);

  useEffect(() => {
    if (!actorName || !hasTmdbKey) return;
    let cancelled = false;

    fetchActorProfilePath(actorName)
      .then((path) => {
        if (!cancelled) setProfilePath(path);
      })
      .catch(() => {
        /* generated emblem avatar stays in place */
      });

    return () => {
      cancelled = true;
    };
  }, [actorName]);

  return profilePath;
}

export { hasTmdbKey };
