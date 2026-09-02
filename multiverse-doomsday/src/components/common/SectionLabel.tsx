import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { usePalette } from '@/hooks/useTheme';
import { space, type } from '@/styles/tokens';

interface SectionLabelProps {
  children: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Tints the icon only — the text stays neutral so sections do not shout. */
  accent?: string;
  trailing?: React.ReactNode;
}

/** The single heading style used above every block in the app. */
export function SectionLabel({ children, icon, accent, trailing }: SectionLabelProps) {
  const palette = usePalette();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.md }}>
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={accent ?? palette.inkFaint}
          style={{ marginRight: space.sm }}
        />
      ) : null}
      <Text style={{ ...type.label, color: palette.inkSoft, textTransform: 'uppercase', flex: 1 }}>
        {children}
      </Text>
      {trailing}
    </View>
  );
}
