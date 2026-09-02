import { useEffect, useRef } from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { usePalette } from '@/hooks/useTheme';
import { GUTTER, radius, space, type } from '@/styles/tokens';
import type { MovieItem, Tier } from '@/types';

export type DropTarget = Tier | 'unranked';

/** Tier colours are the tier list's own identity, so they hold in both themes. */
export const TIER_STYLE: Record<Tier, { hex: string }> = {
  S: { hex: '#E23D3D' },
  A: { hex: '#E08A17' },
  B: { hex: '#12A46F' },
  C: { hex: '#2E9BD6' },
  D: { hex: '#7C5CE0' },
};

interface MeasuredDropZoneProps {
  target: DropTarget;
  /** Absolute window Y range, re-reported whenever `measureToken` changes. */
  onMeasure: (target: DropTarget, top: number, bottom: number) => void;
  measureToken: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Reports its on-screen Y range in window coordinates. The board bumps
 * `measureToken` when a drag starts so positions are fresh even after scrolling.
 */
export function MeasuredDropZone({
  target,
  onMeasure,
  measureToken,
  style,
  children,
}: MeasuredDropZoneProps) {
  const ref = useRef<View>(null);

  const measure = () => {
    ref.current?.measureInWindow((_x, y, _width, height) => {
      onMeasure(target, y, y + height);
    });
  };

  useEffect(measure, [measureToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View ref={ref} onLayout={measure} style={style}>
      {children}
    </View>
  );
}

interface TierRowProps {
  tier: Tier;
  movies: MovieItem[];
  children: React.ReactNode;
  onMeasure: (target: DropTarget, top: number, bottom: number) => void;
  measureToken: number;
  isDropTarget?: boolean;
}

export function TierRow({
  tier,
  movies,
  children,
  onMeasure,
  measureToken,
  isDropTarget = false,
}: TierRowProps) {
  const palette = usePalette();
  const hex = TIER_STYLE[tier].hex;

  return (
    <MeasuredDropZone
      target={tier}
      onMeasure={onMeasure}
      measureToken={measureToken}
      style={{
        paddingHorizontal: GUTTER,
        paddingVertical: space.md,
        backgroundColor: isDropTarget ? `${palette.accent}14` : 'transparent',
      }}
    >
      {/* The tier letter is a label with a coloured rule under it, not a
          filled block — five saturated slabs down the page were the loudest
          thing in the app. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.sm }}>
        <Text style={{ ...type.heading, color: hex, width: 18 }}>{tier}</Text>
        <View
          style={{
            flex: 1,
            height: 2,
            borderRadius: radius.pill,
            backgroundColor: hex,
            opacity: 0.4,
            marginHorizontal: space.md,
          }}
        />
        <Text
          style={{ ...type.ordinal, color: palette.inkFaint, fontVariant: ['tabular-nums'] }}
        >
          {movies.length}
        </Text>
      </View>

      <View
        style={{
          minHeight: 78,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: space.sm,
        }}
      >
        {movies.length === 0 ? (
          <Text style={{ ...type.small, color: palette.inkFaint }}>
            Drop a poster here, or tap one and pick {tier}.
          </Text>
        ) : (
          children
        )}
      </View>
    </MeasuredDropZone>
  );
}
