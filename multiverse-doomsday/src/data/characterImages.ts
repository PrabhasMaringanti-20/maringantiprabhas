import type { ImageSourcePropType } from 'react-native';

/**
 * Comic portraits bundled with the app, keyed by character id.
 *
 * Metro resolves `require` statically, so this map is generated rather than
 * built from a path at runtime. Characters without an entry fall back to the
 * generated affiliation emblem, and a TMDB actor headshot takes precedence
 * over both when an API key is configured.
 */
export const CHARACTER_PORTRAITS: Record<string, ImageSourcePropType> = {
  'ant-man': require('../../assets/images/characters/ant-man.jpg'),
  'beast': require('../../assets/images/characters/beast.jpg'),
  'ben-grimm': require('../../assets/images/characters/ben-grimm.jpg'),
  'blade': require('../../assets/images/characters/blade.jpg'),
  'captain-america': require('../../assets/images/characters/captain-america.jpg'),
  'captain-marvel': require('../../assets/images/characters/captain-marvel.jpg'),
  'cyclops': require('../../assets/images/characters/cyclops.jpg'),
  'daredevil': require('../../assets/images/characters/daredevil.jpg'),
  'deadpool': require('../../assets/images/characters/deadpool.jpg'),
  'doctor-doom': require('../../assets/images/characters/doctor-doom.jpg'),
  'doctor-strange': require('../../assets/images/characters/doctor-strange.jpg'),
  'franklin-richards': require('../../assets/images/characters/franklin-richards.jpg'),
  'galactus': require('../../assets/images/characters/galactus.jpg'),
  'gambit': require('../../assets/images/characters/gambit.jpg'),
  'hawkeye': require('../../assets/images/characters/hawkeye.jpg'),
  'hulk': require('../../assets/images/characters/hulk.jpg'),
  'jean-grey': require('../../assets/images/characters/jean-grey.jpg'),
  'johnny-storm': require('../../assets/images/characters/johnny-storm.jpg'),
  'loki': require('../../assets/images/characters/loki.jpg'),
  'magneto': require('../../assets/images/characters/magneto.jpg'),
  'moon-knight': require('../../assets/images/characters/moon-knight.jpg'),
  'namor': require('../../assets/images/characters/namor.jpg'),
  'professor-x': require('../../assets/images/characters/professor-x.jpg'),
  'reed-richards': require('../../assets/images/characters/reed-richards.jpg'),
  'scarlet-witch': require('../../assets/images/characters/scarlet-witch.jpg'),
  'sentry': require('../../assets/images/characters/sentry.jpg'),
  'shang-chi': require('../../assets/images/characters/shang-chi.jpg'),
  'silver-surfer': require('../../assets/images/characters/silver-surfer.jpg'),
  'spider-man': require('../../assets/images/characters/spider-man.jpg'),
  'sue-storm': require('../../assets/images/characters/sue-storm.jpg'),
  'taskmaster': require('../../assets/images/characters/taskmaster.jpg'),
  'thor': require('../../assets/images/characters/thor.jpg'),
  'vision': require('../../assets/images/characters/vision.jpg'),
  'winter-soldier': require('../../assets/images/characters/winter-soldier.jpg'),
  'wolverine': require('../../assets/images/characters/wolverine.jpg'),
};

export function characterPortrait(characterId: string): ImageSourcePropType | undefined {
  return CHARACTER_PORTRAITS[characterId];
}
