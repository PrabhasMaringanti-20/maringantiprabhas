import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Marker, Rule } from '@/components/common/Primitives';
import { postCreditsFor, RELEVANCE_LABEL } from '@/hooks/usePostCredits';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { usePalette } from '@/hooks/useTheme';
import { motion, space, type } from '@/styles/tokens';
import type { MovieItem, StingerRelevance } from '@/types';

interface StingerCardProps {
  movie: MovieItem;
}

/** Colour carries the relevance, and nothing else on this block is coloured. */
export function useRelevanceColour(): Record<StingerRelevance, string> {
  const palette = usePalette();
  return {
    direct: palette.marvel,
    thread: palette.accent,
    none: palette.inkFaint,
    unreleased: palette.violet,
  };
}

/**
 * Post-credits scenes for one title.
 *
 * Stays covered until tapped. These are spoilers by definition and this app is
 * aimed at people who have not seen everything yet, so revealing them by
 * default would make the movie screen unsafe to browse.
 */
export function StingerCard({ movie }: StingerCardProps) {
  const palette = usePalette();
  const [revealed, setRevealed] = useState(false);
  const tint = useRelevanceColour();
  const spoilerSafe = useSettingsStore((state) => state.spoilerSafe);

  const entry = postCreditsFor(movie.id);
  if (!entry) return null;

  const colour = tint[entry.relevance];

  if (entry.scenes.length === 0) {
    return (
      <View>
        <Marker>Post-credits</Marker>
        <Text style={{ ...type.body, color: palette.inkSoft, marginTop: space.md }}>
          {entry.relevance === 'unreleased'
            ? 'Not released yet — nothing to log.'
            : 'No mid- or post-credits scene. You can leave when the lights come up.'}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Marker style={{ flex: 1 }}>Post-credits</Marker>
        <Marker color={colour}>{RELEVANCE_LABEL[entry.relevance]}</Marker>
      </View>

      <View style={{ marginTop: space.md }}>
        <Rule />

        {revealed && !(spoilerSafe && !movie.isWatched) ? (
          <Animated.View entering={FadeIn.duration(motion.base)}>
            {entry.scenes.map((scene, index) => (
              <View key={index} style={{ paddingVertical: space.lg }}>
                <Marker color={colour}>
                  {scene.kind === 'mid' ? 'Mid-credits' : 'Post-credits'}
                </Marker>
                <Text style={{ ...type.body, color: palette.ink, marginTop: space.sm }}>
                  {scene.summary}
                </Text>
                <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
                  Sets up: {scene.setsUp}
                </Text>
                {index < entry.scenes.length - 1 ? <Rule style={{ marginTop: space.lg }} /> : null}
              </View>
            ))}
          </Animated.View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reveal post-credits scenes — contains spoilers"
            disabled={spoilerSafe && !movie.isWatched}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRevealed(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: space.lg,
            }}
          >
            <Ionicons name="eye-off-outline" size={15} color={palette.inkSoft} />
            <Text
              style={{
                ...type.small,
                fontWeight: '600',
                color: palette.inkSoft,
                marginLeft: space.sm,
              }}
            >
              {entry.scenes.length} {entry.scenes.length === 1 ? 'scene' : 'scenes'} —{' '}
              {spoilerSafe && !movie.isWatched ? 'hidden by spoiler-safe' : 'tap to reveal'}
            </Text>
          </Pressable>
        )}

        <Rule />
      </View>
    </View>
  );
}
