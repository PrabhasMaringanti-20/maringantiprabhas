import { Text, View } from 'react-native';

import { usePalette } from '@/hooks/useTheme';
import { GUTTER, space, type } from '@/styles/tokens';

interface ScreenHeaderProps {
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}

/** Every screen opens the same way, so moving between tabs feels like one app. */
export function ScreenHeader({ eyebrow, title, subtitle, trailing }: ScreenHeaderProps) {
  const palette = usePalette();

  return (
    <View
      style={{
        paddingHorizontal: GUTTER,
        paddingBottom: space.lg,
        flexDirection: 'row',
        alignItems: 'flex-end',
      }}
    >
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text style={{ ...type.label, color: palette.inkFaint, textTransform: 'uppercase' }}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={{ ...type.display, color: palette.ink, marginTop: eyebrow ? space.xs : 0 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ ...type.small, color: palette.inkSoft, marginTop: space.xs }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={{ marginLeft: space.md }}>{trailing}</View> : null}
    </View>
  );
}
