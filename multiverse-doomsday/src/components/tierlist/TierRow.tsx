import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import type { MovieItem, Tier } from '@/types';

export type DropTarget = Tier | 'unranked';

export const TIER_STYLE: Record<Tier, { bg: string; label: string; hex: string }> = {
  S: { bg: 'bg-incursion', label: 'text-void', hex: '#EF4444' },
  A: { bg: 'bg-infinity', label: 'text-void', hex: '#F59E0B' },
  B: { bg: 'bg-doom', label: 'text-void', hex: '#10B981' },
  C: { bg: 'bg-[#38BDF8]', label: 'text-void', hex: '#38BDF8' },
  D: { bg: 'bg-[#8B5CF6]', label: 'text-void', hex: '#8B5CF6' },
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
        isDropTarget ? 'border-white/70' : 'border-surface-border'
      }`}
    >
      <View className={`w-14 items-center justify-center ${style.bg}`}>
        <Text className={`text-2xl font-black ${style.label}`}>{tier}</Text>
        <Text className={`text-2xs font-bold ${style.label} opacity-70`}>{movies.length}</Text>
      </View>

      <View className="min-h-[92px] flex-1 flex-row flex-wrap items-center gap-2 p-2.5">
        {movies.length === 0 ? (
          <Text className="px-1 text-xs text-muted-deep">
            Drop a poster here — or tap one and pick {tier}.
          </Text>
        ) : (
          children
        )}
      </View>
    </MeasuredDropZone>
  );
}
