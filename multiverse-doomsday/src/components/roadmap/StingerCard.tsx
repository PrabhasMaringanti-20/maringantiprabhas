import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { Surface } from '@/components/common/Surface';
import { postCreditsFor, RELEVANCE_LABEL } from '@/hooks/usePostCredits';
import { usePalette } from '@/hooks/useTheme';
import { radius, space, type } from '@/styles/tokens';
import type { MovieItem, StingerRelevance } from '@/types';

interface StingerCardProps {
  movie: MovieItem;
}

/**
 * Post-credits scenes for one title.
 *
 * Stays covered until tapped. These are spoilers by definition, and this app is
 * aimed at people who have not seen everything yet — revealing them by default
 * would make the movie screen unsafe to browse.
 */
export function StingerCard({ movie }: StingerCardProps) {
  const palette = usePalette();
  const [revealed, setRevealed] = useState(false);

  const entry = postCreditsFor(movie.id);
  if (!entry) return null;

  const tint: Record<StingerRelevance, string> = {
    direct: palette.marvel,
    thread: palette.accent,
    none: palette.inkFaint,
    unreleased: palette.violet,
  };
  const colour = tint[entry.relevance];

  if (entry.scenes.length === 0) {
    return (
      <View>
        <SectionLabel icon="film-outline">Post-credits</SectionLabel>
        <Surface tone="raised">
          <Text style={{ ...type.body, color: palette.inkSoft }}>
            {entry.relevance === 'unreleased'
              ? 'Not released yet — nothing to log.'
              : 'No mid- or post-credits scene. You can leave when the lights come up.'}
          </Text>
        </Surface>
      </View>
    );
  }

  return (
    <View>
      <SectionLabel icon="film-outline" accent={colour}>
        Post-credits
      </SectionLabel>

      <Surface tone="raised" padded={false} style={{ overflow: 'hidden' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
          }}
        >
          <View
            style={{
              paddingHorizontal: space.sm,
              paddingVertical: 3,
              borderRadius: radius.pill,
              backgroundColor: `${colour}1F`,
              borderWidth: 1,
              borderColor: `${colour}55`,
            }}
          >
            <Text style={{ ...type.label, color: colour, textTransform: 'uppercase' }}>
              {RELEVANCE_LABEL[entry.relevance]}
            </Text>
          </View>
          <Text style={{ ...type.small, color: palette.inkFaint, marginLeft: space.sm }}>
            {entry.scenes.length} {entry.scenes.length === 1 ? 'scene' : 'scenes'}
          </Text>
        </View>

        {revealed ? (
          <View
            style={{
              paddingHorizontal: space.lg,
              paddingBottom: space.lg,
              borderTopWidth: 1,
              borderTopColor: palette.line,
              paddingTop: space.md,
            }}
          >
            {entry.scenes.map((scene, index) => (
              <View key={index} style={{ marginTop: index > 0 ? space.lg : 0 }}>
                <Text style={{ ...type.label, color: colour, textTransform: 'uppercase' }}>
                  {scene.kind === 'mid' ? 'Mid-credits' : 'Post-credits'}
                </Text>
                <Text style={{ ...type.body, color: palette.ink, marginTop: space.xs }}>
                  {scene.summary}
                </Text>
                <Text style={{ ...type.small, color: palette.inkSoft, marginTop: space.xs }}>
                  Sets up: {scene.setsUp}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reveal post-credits scenes — contains spoilers"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRevealed(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: space.lg,
              borderTopWidth: 1,
              borderTopColor: palette.line,
            }}
          >
            <Ionicons name="eye-off-outline" size={16} color={palette.inkSoft} />
            <Text style={{ ...type.small, fontWeight: '700', color: palette.inkSoft, marginLeft: space.sm }}>
              Tap to reveal — spoilers
            </Text>
          </Pressable>
        )}
      </Surface>
    </View>
  );
}
