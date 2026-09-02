import { Platform } from 'react-native';

/**
 * The design language, in one file.
 *
 * The app is deliberately *editorial* rather than card-based: content sits on
 * the canvas separated by hairlines and space, not boxed in bordered panels.
 * Panels are the exception, not the default. That is the single decision that
 * gives every screen its density and its calm.
 *
 * Colours are absent on purpose — those come from usePalette(), because they
 * change with the theme and none of this does.
 */

/** 4pt base. Only these values should appear as padding, margin or gap. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
  huge: 56,
} as const;

/** One horizontal gutter for the whole app. Nothing sits closer to the edge. */
export const GUTTER = 22;

/** Panels are rare, so there are only three radii and one of them is a pill. */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

/** A real hairline, not a 1pt line pretending to be one. */
export const HAIRLINE = Platform.select({ ios: 0.5, default: 0.7 }) as number;

/**
 * Numerals are tabular everywhere they appear in a column or tick over —
 * countdowns, scores, runtimes. Proportional digits jitter as they change.
 */
export const numeric = {
  fontVariant: ['tabular-nums' as const],
} as const;

/**
 * Type ramp.
 *
 * The jump from `display` to `body` is deliberately violent: one enormous
 * thing per screen and everything else quiet. That contrast is what makes a
 * layout with no boxes still read as organised.
 */
export const type = {
  /** The one big number or word on a screen. */
  hero: { fontSize: 64, lineHeight: 64, fontWeight: '800' as const, letterSpacing: -3 },
  display: { fontSize: 40, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -1.6 },
  title: { fontSize: 25, lineHeight: 29, fontWeight: '700' as const, letterSpacing: -0.7 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, letterSpacing: 0 },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const, letterSpacing: -0.1 },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, letterSpacing: 0 },
  /** Section markers. Always uppercase, always widely tracked, always faint. */
  marker: { fontSize: 10, lineHeight: 12, fontWeight: '600' as const, letterSpacing: 2.4 },
  /** Row indices and other quiet ordinals. */
  ordinal: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0.5 },
} as const;

/**
 * Motion.
 *
 * Two durations do almost all the work. Lists stagger by `stagger` so a screen
 * assembles rather than appearing, which is most of what makes it feel smooth.
 */
export const motion = {
  instant: 110,
  quick: 190,
  base: 300,
  slow: 460,
  cinematic: 900,
  stagger: 38,
} as const;

/** One spring, so nothing in the app feels out of family with anything else. */
export const spring = { damping: 22, stiffness: 240, mass: 0.7 } as const;
/** A looser one, for things that should overshoot a little. */
export const springBouncy = { damping: 13, stiffness: 200, mass: 0.7 } as const;

/** Height of the collapsing header's pinned bar, excluding the safe-area inset. */
export const HEADER_BAR = 46;
