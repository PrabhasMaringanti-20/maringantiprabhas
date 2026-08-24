import { useMemo } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#38BDF8'];

interface ConfettiProps {
  /** Remount key — bump it (or pass a counter) to replay the burst. */
  burstId: number;
  count?: number;
  radius?: number;
  size?: number;
}

/**
 * Micro particle burst fired when an entry is marked watched.
 * Purely decorative: it is pointer-events-none and unmounts itself visually by fading out.
 */
export function Confetti({ burstId, count = 10, radius = 34, size = 5 }: ConfettiProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + (burstId % 2 === 0 ? 0 : 0.3);
        const distance = radius * (0.65 + ((index * 37) % 40) / 100);
        return {
          key: `${burstId}-${index}`,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: COLORS[index % COLORS.length],
          delay: (index % 4) * 22,
          scale: 0.7 + ((index * 13) % 50) / 100,
        };
      }),
    [burstId, count, radius],
  );

  if (burstId === 0) return null;

  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      {particles.map((particle) => (
        <MotiView
          key={particle.key}
          from={{ translateX: 0, translateY: 0, opacity: 1, scale: 0.2 }}
          animate={{
            translateX: particle.x,
            translateY: particle.y,
            opacity: 0,
            scale: particle.scale,
          }}
          transition={{ type: 'timing', duration: 620, delay: particle.delay }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: particle.color,
          }}
        />
      ))}
    </View>
  );
}
