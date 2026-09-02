import { Ionicons } from '@expo/vector-icons';
import { Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePalette } from '@/hooks/useTheme';
import { GUTTER, HAIRLINE, motion, radius, space, type } from '@/styles/tokens';

/* ------------------------------------------------------------------ *
 * Rule
 * ------------------------------------------------------------------ */

/**
 * A hairline. This is the app's main separator — content is divided by these
 * and by whitespace, not by wrapping everything in a bordered card.
 */
export function Rule({ inset = 0, style }: { inset?: number; style?: ViewStyle }) {
  const palette = usePalette();
  return (
    <View
      style={[
        { height: HAIRLINE, backgroundColor: palette.line, marginLeft: inset },
        style,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Marker
 * ------------------------------------------------------------------ */

/**
 * A section marker: small, uppercase, widely tracked, faint. Used instead of
 * headings so sections register without shouting.
 */
export function Marker({
  children,
  color,
  style,
}: {
  children: string;
  color?: string;
  style?: ViewStyle;
}) {
  const palette = usePalette();
  return (
    <Text
      style={[
        { ...type.marker, color: color ?? palette.inkFaint, textTransform: 'uppercase' },
        style as never,
      ]}
    >
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ *
 * Section
 * ------------------------------------------------------------------ */

interface SectionProps {
  title: string;
  children: React.ReactNode;
  /** Shown at the right of the marker row — a count, a control. */
  trailing?: React.ReactNode;
  /** Sections stagger in when a screen assembles. */
  index?: number;
  gutter?: boolean;
  style?: ViewStyle;
}

export function Section({
  title,
  children,
  trailing,
  index = 0,
  gutter = true,
  style,
}: SectionProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * motion.stagger).duration(motion.base)}
      style={[{ marginTop: space.xxl }, style]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: gutter ? GUTTER : 0,
          marginBottom: space.md,
        }}
      >
        <Marker style={{ flex: 1 }}>{title}</Marker>
        {trailing}
      </View>
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ *
 * Panel
 * ------------------------------------------------------------------ */

/**
 * The exception to the no-boxes rule: used only where something genuinely is a
 * discrete object (a result, a callout), never as a default wrapper.
 */
export function Panel({
  children,
  tint,
  style,
}: {
  children: React.ReactNode;
  /** Tints border and fill — for callouts that need to carry a status. */
  tint?: string;
  style?: ViewStyle;
}) {
  const palette = usePalette();
  return (
    <View
      style={[
        {
          borderRadius: radius.lg,
          borderWidth: HAIRLINE,
          borderColor: tint ? `${tint}55` : palette.line,
          backgroundColor: tint ? `${tint}12` : palette.surface,
          padding: space.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Stat
 * ------------------------------------------------------------------ */

/** A figure and its label. Numerals are tabular so columns line up. */
export function Stat({
  value,
  label,
  tint,
  align = 'left',
}: {
  value: string;
  label: string;
  tint?: string;
  align?: 'left' | 'right' | 'center';
}) {
  const palette = usePalette();
  return (
    <View style={{ flex: 1, alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
      <Text
        style={{
          ...type.title,
          color: tint ?? palette.ink,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <Marker style={{ marginTop: space.xs }}>{label}</Marker>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Meter
 * ------------------------------------------------------------------ */

/** A 3pt progress line. Thin on purpose — it is data, not decoration. */
export function Meter({
  value,
  tint,
  height = 3,
}: {
  /** 0–100. */
  value: number;
  tint?: string;
  height?: number;
}) {
  const palette = usePalette();
  return (
    <View
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: palette.line,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: tint ?? palette.accent,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Empty
 * ------------------------------------------------------------------ */

export function Empty({ icon, children }: { icon: keyof typeof Ionicons.glyphMap; children: string }) {
  const palette = usePalette();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: space.xxxl, paddingVertical: space.huge }}>
      <Ionicons name={icon} size={30} color={palette.line} />
      <Text style={{ ...type.body, color: palette.inkFaint, marginTop: space.md, textAlign: 'center' }}>
        {children}
      </Text>
    </View>
  );
}
