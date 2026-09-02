import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/common/Badge';
import { Confetti } from '@/components/common/Confetti';
import { CustomButton } from '@/components/common/CustomButton';
import { Poster } from '@/components/common/Poster';
import { StarRating } from '@/components/common/StarRating';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { StingerCard } from '@/components/roadmap/StingerCard';
import { StreamWidget } from '@/components/roadmap/StreamWidget';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { charactersForMovie } from '@/hooks/useCharacters';
import { useMovie, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { useTmdbDetails } from '@/hooks/useTMDB';
import { backdropUrl } from '@/utils/imageHelper';
import { formatRuntime } from '@/utils/timeCalc';
import { TIERS, type Tier } from '@/types';

import { usePalette } from '@/hooks/useTheme';

/** Full-bleed when there is real artwork; a shallow colour wash when there is not. */
const HERO_WITH_ART = 268;
const HERO_NO_ART = 172;
/** How far the poster overlaps the base of the hero. */
const POSTER_LIFT = 64;

export default function MovieDetailScreen() {
  const palette = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const movie = useMovie(id);
  const toggleWatched = useRoadmapStore((state) => state.toggleWatched);
  const setRating = useRoadmapStore((state) => state.setRating);
  const setTier = useRoadmapStore((state) => state.setTier);

  const [burstId, setBurstId] = useState(0);
  const { data: details, disabled: tmdbDisabled } = useTmdbDetails(movie);

  if (!movie) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-10">
        <Ionicons name="alert-circle-outline" size={40} color={palette.line} />
        <Text className="mt-3 text-center text-sm text-ink-soft">
          That entry is not in the roadmap.
        </Text>
        <View className="mt-5">
          <CustomButton label="Back" icon="arrow-back" variant="secondary" onPress={router.back} />
        </View>
      </View>
    );
  }

  const cast = charactersForMovie(movie).slice(0, 10);
  const backdrop = backdropUrl(details?.backdropPath, 'w780');
  // Without a backdrop the hero still needs a colour — borrow the era tint.
  const heroTint = typeof movie.phase === 'number' && movie.phase >= 6 ? palette.crimson : palette.marvel;
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

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Hero — backdrop, scrim, and the poster riding the fold */}
        <View style={{ width: '100%', height: heroHeight }}>
          {backdrop ? (
            <Image
              source={{ uri: backdrop }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={260}
              cachePolicy="disk"
            />
          ) : (
            <LinearGradient
              colors={[`${heroTint}${palette.isDark ? '55' : '26'}`, palette.canvas]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={{ flex: 1 }}
            />
          )}

          {/* Two scrims: one to seat the artwork into the page, one to keep
              the title legible over whatever the backdrop happens to be. */}
          <LinearGradient
            colors={['transparent', `${palette.canvas}CC`, palette.canvas]}
            locations={[0, 0.62, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: heroHeight * 0.8 }}
          />
          <LinearGradient
            colors={[`${palette.canvas}E6`, 'transparent']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: insets.top + 64 }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={12}
            style={{
              position: 'absolute',
              left: 16,
              top: insets.top + 8,
              height: 38,
              width: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: palette.line,
              backgroundColor: `${palette.canvas}D9`,
            }}
          >
            <Ionicons name="chevron-down" size={20} color={palette.ink} />
          </Pressable>
        </View>

        {/* Title block, lifted over the base of the hero */}
        <View style={{ marginTop: -POSTER_LIFT, flexDirection: 'row', paddingHorizontal: 20 }}>
          <View
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: palette.line,
              backgroundColor: palette.raised,
              // Lifts the poster off the backdrop rather than letting it float.
              shadowColor: '#000',
              shadowOpacity: 0.45,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Poster movie={movie} width={104} hideCaption />
          </View>

          <View style={{ flex: 1, marginLeft: 16, justifyContent: 'flex-end', paddingBottom: 4 }}>
            <Text style={{ fontSize: 25, lineHeight: 29, fontWeight: '900', color: palette.ink }}>
              {movie.title}
            </Text>

            <View
              style={{
                marginTop: 7,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {[
                String(movie.releaseYear),
                typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase,
                formatRuntime(details?.runtimeMinutes ?? movie.runtimeMinutes),
              ].map((meta, index) => (
                <View key={meta} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {index > 0 ? (
                    <View
                      style={{
                        height: 3,
                        width: 3,
                        borderRadius: 999,
                        marginRight: 6,
                        backgroundColor: palette.inkFaint,
                      }}
                    />
                  ) : null}
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                      color: palette.inkSoft,
                    }}
                  >
                    {meta}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {movie.isCrucial ? <Badge label="Essential" tone="accent" compact /> : null}
              {movie.type === 'series' ? <Badge label="Series" tone="violet" compact /> : null}
              {details?.voteAverage ? (
                <Badge
                  label={`TMDB ${details.voteAverage.toFixed(1)}`}
                  tone="marvel"
                  icon="star"
                  compact
                />
              ) : null}
            </View>
          </View>
        </View>

        {/* Why it matters */}
        <View className="mt-6 px-5">
          <View className="overflow-hidden rounded-2xl border border-accent/40">
            <LinearGradient
              colors={[`${palette.accent}${palette.isDark ? '22' : '14'}`, palette.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="p-4">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={16} color={palette.accent} />
                  <Text className="ml-2 text-xs font-black uppercase tracking-[2px] text-accent">
                    Why it matters for Doomsday
                  </Text>
                </View>
                <Text className="mt-2 text-[13px] leading-5 text-ink/90">
                  {movie.whyItMatters}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Overview */}
        {details?.overview ? (
          <View className="mt-5 px-5">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-ink">Overview</Text>
            <Text className="mt-2 text-[13px] leading-5 text-ink-soft">{details.overview}</Text>
          </View>
        ) : tmdbDisabled ? (
          <View className="mt-5 px-5">
            <Text className="text-xs leading-4 text-ink-faint">
              Synopsis, posters and streaming links appear once a free TMDB key is configured.
            </Text>
          </View>
        ) : null}

        {/* Mark watched */}
        <View className="mt-6 px-5">
          <View className="items-center">
            <View className="w-full">
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
          </View>
        </View>

        {/* Rating + tier */}
        <View className="mt-6 px-5">
          <View className="rounded-2xl border border-line bg-surface p-4">
            <Text className="text-2xs font-bold uppercase tracking-[2px] text-ink-faint">
              Your rating
            </Text>
            <View className="mt-2.5">
              <StarRating
                value={movie.userRating}
                onChange={(rating) => setRating(movie.id, rating)}
              />
            </View>

            <Text className="mt-5 text-2xs font-bold uppercase tracking-[2px] text-ink-faint">
              Tier assignment
            </Text>
            <View className="mt-2.5 flex-row gap-2">
              {TIERS.map((tier: Tier) => {
                const isActive = movie.tier === tier;
                return (
                  <Pressable
                    key={tier}
                    accessibilityRole="button"
                    accessibilityLabel={`Assign tier ${tier}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTier(movie.id, isActive ? undefined : tier);
                    }}
                    className={`h-12 flex-1 items-center justify-center rounded-xl border-2 ${
                      isActive ? '' : 'bg-surface-raised'
                    }`}
                    style={{
                      backgroundColor: isActive ? TIER_STYLE[tier].hex : undefined,
                      borderColor: isActive ? TIER_STYLE[tier].hex : palette.line,
                    }}
                  >
                    <Text className={`text-lg font-black ${isActive ? 'text-white' : 'text-ink'}`}>
                      {tier}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Post-credits */}
        <View className="mt-6 px-5">
          <StingerCard movie={movie} />
        </View>

        {/* Streaming */}
        <View className="mt-5 px-5">
          <StreamWidget movie={movie} />
        </View>

        {/* Key players */}
        {cast.length > 0 ? (
          <View className="mt-6">
            <Text className="px-5 text-xs font-bold uppercase tracking-[2px] text-ink">
              Key players
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 14 }}
            >
              {cast.map((character) => (
                <View key={character.id} className="w-16 items-center">
                  <CharacterAvatar character={character} size={56} />
                  <Text
                    className="mt-1.5 text-center text-2xs font-semibold text-ink"
                    numberOfLines={2}
                  >
                    {character.alias}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
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
          height: insets.top,
          backgroundColor: palette.canvas,
        }}
      />
    </View>
  );
}
