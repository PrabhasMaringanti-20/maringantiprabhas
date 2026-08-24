import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export type BadgeTone = 'doom' | 'infinity' | 'incursion' | 'cosmic' | 'muted';

const TONE_STYLES: Record<BadgeTone, { wrap: string; text: string; icon: string }> = {
  doom: { wrap: 'bg-doom/15 border-doom/40', text: 'text-doom', icon: '#10B981' },
  infinity: { wrap: 'bg-infinity/15 border-infinity/40', text: 'text-infinity', icon: '#F59E0B' },
  incursion: { wrap: 'bg-incursion/15 border-incursion/40', text: 'text-incursion', icon: '#EF4444' },
  cosmic: { wrap: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40', text: 'text-[#A78BFA]', icon: '#A78BFA' },
  muted: { wrap: 'bg-surface-raised border-surface-border', text: 'text-muted', icon: '#8B80A8' },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Slightly denser padding, used inside dense grids. */
  compact?: boolean;
}

export function Badge({ label, tone = 'muted', icon, compact = false }: BadgeProps) {
  const style = TONE_STYLES[tone];
  return (
    <View
      className={`flex-row items-center rounded-full border ${style.wrap} ${
        compact ? 'px-2 py-0.5' : 'px-2.5 py-1'
      }`}
    >
      {icon ? (
        <Ionicons name={icon} size={compact ? 10 : 12} color={style.icon} style={{ marginRight: 4 }} />
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
