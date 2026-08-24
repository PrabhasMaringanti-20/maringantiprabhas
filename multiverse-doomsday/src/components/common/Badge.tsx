import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { usePalette } from '@/hooks/useTheme';

export type BadgeTone = 'accent' | 'gold' | 'crimson' | 'violet' | 'muted';

const TONE_STYLES: Record<BadgeTone, { wrap: string; text: string }> = {
  accent: { wrap: 'bg-accent/10 border-accent/30', text: 'text-accent' },
  gold: { wrap: 'bg-gold/10 border-gold/30', text: 'text-gold' },
  crimson: { wrap: 'bg-crimson/10 border-crimson/30', text: 'text-crimson' },
  violet: { wrap: 'bg-violet/10 border-violet/30', text: 'text-violet' },
  muted: { wrap: 'bg-surface-raised border-line', text: 'text-ink-faint' },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Slightly denser padding, used inside dense grids. */
  compact?: boolean;
}

export function Badge({ label, tone = 'muted', icon, compact = false }: BadgeProps) {
  const palette = usePalette();
  const style = TONE_STYLES[tone];
  const iconColor = {
    accent: palette.accent,
    gold: palette.gold,
    crimson: palette.crimson,
    violet: palette.violet,
    muted: palette.inkFaint,
  }[tone];
  return (
    <View
      className={`flex-row items-center rounded-full border ${style.wrap} ${
        compact ? 'px-2 py-0.5' : 'px-2.5 py-1'
      }`}
    >
      {icon ? (
        <Ionicons name={icon} size={compact ? 10 : 12} color={iconColor} style={{ marginRight: 4 }} />
      ) : null}
      <Text
        className={`${style.text} font-semibold uppercase tracking-wider ${
          compact ? 'text-2xs' : 'text-[11px]'
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
