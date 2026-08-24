import { useEffect, useMemo, useState } from 'react';

import {
  fetchActorProfilePath,
  fetchDetails,
  fetchStreamingProviders,
  hasTmdbKey,
  type TmdbLookup,
} from '@/services/tmdbApi';
import type { AsyncState, StreamingAvailability, TmdbDetails } from '@/types';

interface TmdbResult<T> {
  data: T | null;
  state: AsyncState;
  /** True when there is no API key configured — the UI shows a setup hint instead of an error. */
  disabled: boolean;
}

/** Stable lookup object so effects do not refire on every parent render. */
function useLookup(entry: TmdbLookup | undefined): TmdbLookup | undefined {
  return useMemo(
    () => entry,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry?.id, entry?.tmdbId, entry?.type, entry?.title, entry?.releaseYear],
  );
}

/** Poster, backdrop and overview for one catalogue entry. */
export function useTmdbDetails(entry: TmdbLookup | undefined): TmdbResult<TmdbDetails> {
  const [data, setData] = useState<TmdbDetails | null>(null);
  const [state, setState] = useState<AsyncState>('idle');
  const lookup = useLookup(entry);

  useEffect(() => {
    if (!lookup || !hasTmdbKey) return;
    let cancelled = false;

    setState('loading');
    fetchDetails(lookup)
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
  }, [lookup]);

  return { data, state, disabled: !hasTmdbKey };
}

/** Country-specific "Where to Stream" row, powered by TMDB's JustWatch data. */
export function useStreamingProviders(
  entry: TmdbLookup | undefined,
  region?: string,
): TmdbResult<StreamingAvailability> {
  const [data, setData] = useState<StreamingAvailability | null>(null);
  const [state, setState] = useState<AsyncState>('idle');
  const lookup = useLookup(entry);

  useEffect(() => {
    if (!lookup || !hasTmdbKey) return;
    let cancelled = false;

    setState('loading');
    fetchStreamingProviders(lookup, region)
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
  }, [lookup, region]);

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
export type { TmdbLookup };
