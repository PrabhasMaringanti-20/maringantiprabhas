import { View, type ViewProps, type ViewStyle } from 'react-native';

import { usePalette } from '@/hooks/useTheme';
import { radius, space } from '@/styles/tokens';

interface SurfaceProps extends ViewProps {
  /** `raised` sits on top of `base`; `outline` has no fill at all. */
  tone?: 'base' | 'raised' | 'outline';
  padded?: boolean;
  round?: keyof typeof radius;
}

/**
 * The app's one card. Every panel is this, so corner radius, border weight and
 * fill stay identical everywhere without each screen restating them.
 *
 * Colours go through `style` from the JS palette rather than Tailwind classes —
 * the class-driven version came out transparent inside native modals.
 */
export function Surface({
  tone = 'base',
  padded = true,
  round = 'xl',
  style,
  children,
  ...rest
}: SurfaceProps) {
  const palette = usePalette();

  const fill: ViewStyle =
    tone === 'outline'
      ? { backgroundColor: 'transparent' }
      : { backgroundColor: tone === 'raised' ? palette.raised : palette.surface };

  return (
    <View
      style={[
        {
          borderRadius: radius[round],
          borderWidth: 1,
          borderColor: palette.line,
          ...fill,
          ...(padded ? { padding: space.lg } : null),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
