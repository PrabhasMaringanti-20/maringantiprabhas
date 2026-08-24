import { useMemo, useState } from 'react';

import { CHARACTER_CATALOGUE, MOVIE_CATALOGUE } from '@/hooks/useRoadmapStore';
import type { Affiliation, MarvelCharacter, MovieCatalogueItem } from '@/types';

export type AffiliationFilter = Affiliation | 'All';

export const AFFILIATION_FILTERS: AffiliationFilter[] = [
  'All',
  'Fantastic Four',
  'Doom Allegiance',
  'Avengers',
  'X-Men / Mutants',
  'Thunderbolts',
  'Cosmic',
];

/** Short labels for the horizontal chip row. */
export const AFFILIATION_LABELS: Record<AffiliationFilter, string> = {
  All: 'All',
  'Fantastic Four': 'Fantastic Four',
  'Doom Allegiance': 'Doom Allegiance',
  Avengers: 'Avengers',
  'X-Men / Mutants': 'Mutants / X-Men',
  Thunderbolts: 'Thunderbolts',
  Cosmic: 'Cosmic',
};

function matches(character: MarvelCharacter, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    character.name.toLowerCase().includes(needle) ||
    character.alias.toLowerCase().includes(needle) ||
    character.actor.toLowerCase().includes(needle) ||
    character.affiliation.toLowerCase().includes(needle) ||
    character.powers.some((power) => power.toLowerCase().includes(needle))
  );
}

export interface UseCharactersResult {
  query: string;
  setQuery: (value: string) => void;
  filter: AffiliationFilter;
  setFilter: (value: AffiliationFilter) => void;
  characters: MarvelCharacter[];
  counts: Record<AffiliationFilter, number>;
  total: number;
}

/** Search + affiliation filtering for the Character Vault. */
export function useCharacters(): UseCharactersResult {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AffiliationFilter>('All');

  const characters = useMemo(() => {
    return CHARACTER_CATALOGUE.filter(
      (character) =>
        (filter === 'All' || character.affiliation === filter) && matches(character, query),
    );
  }, [filter, query]);

  const counts = useMemo(() => {
    const base = Object.fromEntries(
      AFFILIATION_FILTERS.map((key) => [key, 0]),
    ) as Record<AffiliationFilter, number>;

    for (const character of CHARACTER_CATALOGUE) {
      base.All += 1;
      base[character.affiliation] += 1;
    }
    return base;
  }, []);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    characters,
    counts,
    total: CHARACTER_CATALOGUE.length,
  };
}

export function useCharacter(characterId: string | undefined): MarvelCharacter | undefined {
  return useMemo(
    () => CHARACTER_CATALOGUE.find((character) => character.id === characterId),
    [characterId],
  );
}

/** Every catalogue entry a character appears in, from both sides of the relation. */
export function useCharacterAppearances(character: MarvelCharacter | undefined): MovieCatalogueItem[] {
  return useMemo(() => {
    if (!character) return [];
    return MOVIE_CATALOGUE.filter(
      (movie) =>
        character.relatedMovieIds.includes(movie.id) ||
        (movie.keyCharacterIds ?? []).includes(character.id),
    );
  }, [character]);
}

/** Characters flagged as key players in a given entry. */
export function charactersForMovie(movie: MovieCatalogueItem | undefined): MarvelCharacter[] {
  if (!movie) return [];
  const flagged = new Set(movie.keyCharacterIds ?? []);
  return CHARACTER_CATALOGUE.filter(
    (character) => flagged.has(character.id) || character.relatedMovieIds.includes(movie.id),
  );
}
