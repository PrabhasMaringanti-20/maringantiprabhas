/**
 * The app's design system, in one file.
 *
 * Everything visual that is not a colour lives here: one spacing scale, one
 * radius scale, one type ramp, one set of motion durations. Screens compose
 * these instead of inventing their own numbers, which is what keeps the app
 * reading as a single surface rather than five separately-designed ones.
 *
 * Colours are deliberately absent — those come from usePalette(), because they
 * change with the theme and these do not.
 */

/** 4pt base. Only these values should appear as padding, margin or gap. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

/** Screens share one horizontal gutter. Nothing sits closer to the edge. */
export const GUTTER = space.xl;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/**
 * Type ramp. `size`/`lineHeight` pairs are fixed together so vertical rhythm
 * survives a font change; `tracking` is widened only as text gets smaller,
 * which is the one place letter-spacing earns its keep.
 */
export const type = {
  /** Screen title. One per screen, never two. */
  display: { fontSize: 27, lineHeight: 32, fontWeight: '900', letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 27, fontWeight: '800', letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.1 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '700', letterSpacing: 0 },
  small: { fontSize: 12, lineHeight: 17, fontWeight: '500', letterSpacing: 0 },
  /** Section labels and metadata. Always uppercase where it is used. */
  label: { fontSize: 10, lineHeight: 13, fontWeight: '700', letterSpacing: 1.8 },
} as const;

/** Motion. Short enough to feel immediate, long enough to be followed. */
export const motion = {
  instant: 120,
  quick: 200,
  base: 280,
  slow: 420,
  /** Stagger between siblings in a list that animates in. */
  stagger: 45,
} as const;

/** One spring for everything that springs, so nothing feels out of family. */
export const spring = { damping: 20, stiffness: 220, mass: 0.7 } as const;
