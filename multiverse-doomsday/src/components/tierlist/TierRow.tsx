import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

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
  className?: string;
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
  className,
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
    <View ref={ref} onLayout={measure} className={className}>
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
  const style = TIER_STYLE[tier];

  return (
    <MeasuredDropZone
      target={tier}
      onMeasure={onMeasure}
      measureToken={measureToken}
      className={`mb-2 flex-row overflow-hidden rounded-2xl border bg-surface ${
        isDropTarget ? 'border-accent' : 'border-line'
      }`}
    >
      <View className="w-14 items-center justify-center" style={{ backgroundColor: style.hex }}>
        <Text className="text-2xl font-black text-white">{tier}</Text>
        <Text className="text-2xs font-bold text-white opacity-80">{movies.length}</Text>
      </View>

      <View className="min-h-[92px] flex-1 flex-row flex-wrap items-center gap-2 p-2.5">
        {movies.length === 0 ? (
          <Text className="px-1 text-xs text-ink-faint">
            Drop a poster here — or tap one and pick {tier}.
          </Text>
        ) : (
          children
        )}
      </View>
    </MeasuredDropZone>
  );
}
