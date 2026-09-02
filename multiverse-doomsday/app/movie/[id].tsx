import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Confetti } from '@/components/common/Confetti';
import { CustomButton } from '@/components/common/CustomButton';
import { Section } from '@/components/common/Primitives';
import { Poster } from '@/components/common/Poster';
import { StarRating } from '@/components/common/StarRating';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { StingerCard } from '@/components/roadmap/StingerCard';
import { StreamWidget } from '@/components/roadmap/StreamWidget';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { charactersForMovie } from '@/hooks/useCharacters';
import { useMovie, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { useTmdbDetails } from '@/hooks/useTMDB';
import { usePalette } from '@/hooks/useTheme';
import { useTopInset } from '@/utils/layout';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { backdropUrl } from '@/utils/imageHelper';
import { formatRuntime } from '@/utils/timeCalc';
import { TIERS, type Tier } from '@/types';

const HERO_WITH_ART = 300;
const HERO_NO_ART = 150;
/** How far the poster overlaps the base of the hero. */
const POSTER_LIFT = 52;

export default function MovieDetailScreen() {
  const palette = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();

  const movie = useMovie(id);
  const toggleWatched = useRoadmapStore((state) => state.toggleWatched);
  const setRating = useRoadmapStore((state) => state.setRating);
  const setTier = useRoadmapStore((state) => state.setTier);

  const spoilerSafe = useSettingsStore((state) => state.spoilerSafe);
  const [burstId, setBurstId] = useState(0);
  const { data: details, disabled: tmdbDisabled } = useTmdbDetails(movie);

  if (!movie) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.canvas,
          paddingHorizontal: space.xxxl,
        }}
      >
        <Text style={{ ...type.body, color: palette.inkSoft, textAlign: 'center' }}>
          That entry is not in the roadmap.
        </Text>
        <View style={{ marginTop: space.xl }}>
          <CustomButton label="Back" icon="arrow-back" variant="secondary" onPress={router.back} />
        </View>
      </View>
    );
  }

  const cast = charactersForMovie(movie).slice(0, 12);
  const backdrop = backdropUrl(details?.backdropPath, 'w780');
  const heroHeight = backdrop ? HERO_WITH_ART : HERO_NO_ART;

  const handleToggle = () => {
    const nowWatched = toggleWatched(movie.id);
    if (nowWatched) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBurstId((value) => value + 1);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  };

  const meta = [
    String(movie.releaseYear),
    typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase,
    formatRuntime(details?.runtimeMinutes ?? movie.runtimeMinutes),
    details?.voteAverage ? `TMDB ${details.voteAverage.toFixed(1)}` : null,
  ].filter(Boolean) as string[];

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}
      >
        {/* Hero */}
        <View style={{ width: '100%', height: heroHeight }}>
          {backdrop ? (
            <Animated.View entering={FadeIn.duration(motion.slow)} style={{ flex: 1 }}>
              <Image
                source={{ uri: backdrop }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={280}
                cachePolicy="disk"
              />
            </Animated.View>
          ) : null}

          {/* Scrim, so the title reads over whatever the backdrop happens to be */}
          <LinearGradient
            colors={['transparent', `${palette.canvas}D9`, palette.canvas]}
            locations={[0, 0.6, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: heroHeight * 0.85 }}
          />
          <LinearGradient
            colors={[`${palette.canvas}E6`, 'transparent']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: topInset + 56 }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={14}
            style={{ position: 'absolute', left: GUTTER, top: topInset + space.sm }}
          >
            <Ionicons name="chevron-down" size={26} color={palette.ink} />
          </Pressable>
        </View>

        {/* Title block */}
        <Animated.View
          entering={FadeInDown.duration(motion.base)}
          style={{
            marginTop: backdrop ? -POSTER_LIFT : space.sm,
            flexDirection: 'row',
            paddingHorizontal: GUTTER,
          }}
        >
          <View
            style={{
              borderRadius: radius.md,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.4,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 7,
            }}
          >
            <Poster movie={movie} width={86} hideCaption round={radius.md} />
          </View>

          <View style={{ flex: 1, marginLeft: space.lg, justifyContent: 'flex-end' }}>
            <Text style={{ ...type.title, color: palette.ink }}>{movie.title}</Text>
            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
              {meta.join('  ·  ')}
            </Text>
          </View>
        </Animated.View>

        {/* Why it matters */}
        <Section title="Why it matters for Doomsday" index={1}>
          <Text style={{ ...type.body, color: palette.ink, paddingHorizontal: GUTTER }}>
            {movie.whyItMatters}
          </Text>
        </Section>

        {/* Overview */}
        {spoilerSafe && movie && !movie.isWatched ? (
          <Section title="Synopsis" index={2}>
            <Text style={{ ...type.small, color: palette.inkFaint, paddingHorizontal: GUTTER }}>
              Hidden — spoiler-safe mode is on and you have not logged this yet.
            </Text>
          </Section>
        ) : details?.overview ? (
          <Section title="Synopsis" index={2}>
            <Text style={{ ...type.body, color: palette.inkSoft, paddingHorizontal: GUTTER }}>
              {details.overview}
            </Text>
          </Section>
        ) : tmdbDisabled ? (
          <Section title="Synopsis" index={2}>
            <Text style={{ ...type.small, color: palette.inkFaint, paddingHorizontal: GUTTER }}>
              Synopsis, posters and streaming appear once a free TMDB key is configured.
            </Text>
          </Section>
        ) : null}

        {/* Mark watched */}
        <Animated.View
          entering={FadeInDown.delay(motion.stagger * 3).duration(motion.base)}
          style={{ paddingHorizontal: GUTTER, marginTop: space.xxl, alignItems: 'center' }}
        >
          <View style={{ width: '100%' }}>
            <CustomButton
              label={movie.isWatched ? 'Watched — tap to undo' : 'Mark as watched'}
              icon={movie.isWatched ? 'checkmark-done' : 'eye-outline'}
              variant={movie.isWatched ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              haptic={null}
              onPress={handleToggle}
            />
          </View>
          <Confetti burstId={burstId} radius={70} count={14} size={6} />
        </Animated.View>

        {/* Rating */}
        <Section title="Your rating" index={4}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <StarRating
              value={movie.userRating}
              onChange={(rating) => setRating(movie.id, rating)}
            />
          </View>
        </Section>

        {/* Tier */}
        <Section title="Tier" index={5}>
          <View style={{ flexDirection: 'row', paddingHorizontal: GUTTER, gap: space.sm }}>
            {TIERS.map((tier: Tier) => {
              const isActive = movie.tier === tier;
              return (
                <Pressable
                  key={tier}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Assign tier ${tier}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTier(movie.id, isActive ? undefined : tier);
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: space.md,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: isActive ? TIER_STYLE[tier].hex : palette.line,
                    backgroundColor: isActive ? `${TIER_STYLE[tier].hex}22` : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      ...type.heading,
                      color: isActive ? TIER_STYLE[tier].hex : palette.inkFaint,
                    }}
                  >
                    {tier}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Post-credits */}
        <Animated.View
          entering={FadeInDown.delay(motion.stagger * 6).duration(motion.base)}
          style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}
        >
          <StingerCard movie={movie} />
        </Animated.View>

        {/* Streaming */}
        <Section title="Where to watch" index={7}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <StreamWidget movie={movie} />
          </View>
        </Section>

        {/* Key players */}
        {cast.length > 0 ? (
          <Section title="Key players" index={8}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: GUTTER, gap: space.lg }}
            >
              {cast.map((character) => (
                <View key={character.id} style={{ width: 60, alignItems: 'center' }}>
                  <CharacterAvatar character={character} size={54} />
                  <Text
                    style={{
                      ...type.small,
                      fontSize: 10,
                      color: palette.inkSoft,
                      marginTop: space.sm,
                      textAlign: 'center',
                    }}
                    numberOfLines={2}
                  >
                    {character.alias}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Section>
        ) : null}
      </ScrollView>

      {/* Opaque strip so scrolled content never runs under the status bar */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topInset,
          backgroundColor: palette.canvas,
        }}
      />
    </View>
  );
}
