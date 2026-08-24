import type { Affiliation, MarvelCharacter } from '@/types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w185' | 'w342' | 'w500' | 'original';
export type BackdropSize = 'w780' | 'w1280' | 'original';

export function posterUrl(path: string | null | undefined, size: PosterSize = 'w342'): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function backdropUrl(path: string | null | undefined, size: BackdropSize = 'w780'): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function providerLogoUrl(path: string | null | undefined): string | null {
  return path ? `${TMDB_IMAGE_BASE}/w92${path}` : null;
}

export function profileUrl(path: string | null | undefined): string | null {
  return path ? `${TMDB_IMAGE_BASE}/w185${path}` : null;
}

/** Two-stop gradient used by the generated emblem avatar, keyed by allegiance. */
export const AFFILIATION_GRADIENT: Record<Affiliation, [string, string]> = {
  'Fantastic Four': ['#1D4ED8', '#0EA5E9'],
  Avengers: ['#7F1D1D', '#EC1D24'],
  'Doom Allegiance': ['#065F46', '#10B981'],
  'X-Men / Mutants': ['#7C2D12', '#FB923C'],
  Thunderbolts: ['#4C1D95', '#8B5CF6'],
  Cosmic: ['#5B21B6', '#EC4899'],
};

export const AFFILIATION_ACCENT: Record<Affiliation, string> = {
  'Fantastic Four': '#38BDF8',
  Avengers: '#EC1D24',
  'Doom Allegiance': '#10B981',
  'X-Men / Mutants': '#FB923C',
  Thunderbolts: '#A78BFA',
  Cosmic: '#F472B6',
};

/** "Victor Von Doom" → "VD" · "Wong" → "WO" */
export function initialsFor(character: Pick<MarvelCharacter, 'alias' | 'name'>): string {
  const source = character.alias || character.name;
  const words = source.replace(/[^A-Za-z\s.-]/g, '').split(/[\s.-]+/).filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Resolve the best available portrait for a character.
 * Order: curated `avatarUrl` → TMDB actor headshot (needs an API key) → generated emblem.
 */
export function characterImage(
  character: MarvelCharacter,
  tmdbProfilePath?: string | null,
): string | null {
  if (character.avatarUrl) return character.avatarUrl;
  return profileUrl(tmdbProfilePath);
}
