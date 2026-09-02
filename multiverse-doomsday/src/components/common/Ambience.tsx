import { useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { usePalette } from '@/hooks/useTheme';

interface AmbienceProps {
  /** 0–1. Dark mode carries more of it than light. */
  intensity?: number;
}

/**
 * A single still green bloom behind the top of a screen.
 *
 * This replaces a drifting ember field. Animated particles over content read
 * as rendering artifacts once the layout is this quiet — they were small
 * bright dots landing on top of body text — and they cost a running animation
 * on every screen for decoration nobody asked for. The Doom atmosphere now
 * lives where it belongs: in the cold open, and in one static wash here.
 */
export function Ambience({ intensity = 1 }: AmbienceProps) {
  const palette = usePalette();
  const { width } = useWindowDimensions();

  if (!palette.isDark) return null;

  const height = Math.round(width * 0.95);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="ambience" cx="50%" cy="0%" r="80%">
            <Stop offset="0" stopColor={palette.accent} stopOpacity={0.16 * intensity} />
            <Stop offset="0.55" stopColor={palette.accent} stopOpacity={0.05 * intensity} />
            <Stop offset="1" stopColor={palette.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width / 2} cy={0} rx={width * 0.9} ry={height} fill="url(#ambience)" />
      </Svg>
    </View>
  );
}
