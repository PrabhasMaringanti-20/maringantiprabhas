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
import { StreamWidget } from '@/components/roadmap/StreamWidget';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { charactersForMovie } from '@/hooks/useCharacters';
import { useMovie, useRoadmapStore } from '@/hooks/useRoadmapStore';
import { useTmdbDetails } from '@/hooks/useTMDB';
import { backdropUrl } from '@/utils/imageHelper';
import { formatRuntime } from '@/utils/timeCalc';
import { TIERS, type Tier } from '@/types';

import { usePalette } from '@/hooks/useTheme';

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
        {/* Backdrop */}
        <View className={`w-full bg-surface-raised ${backdrop ? 'h-56' : 'h-36'}`}>
          {backdrop ? (
            <Image
              source={{ uri: backdrop }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={260}
              cachePolicy="disk"
            />
          ) : (
            <LinearGradient colors={[palette.raised, palette.canvas]} style={{ flex: 1 }} />
          )}
          <LinearGradient
            colors={['transparent', palette.canvas]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={12}
            style={{ top: insets.top + 8 }}
            className="absolute left-4 h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas/80"
          >
            <Ionicons name="chevron-down" size={20} color={palette.ink} />
          </Pressable>
        </View>

        {/* Title block */}
        <View className="-mt-12 flex-row px-5">
          <Poster movie={movie} width={92} hideCaption />

          <View className="ml-4 flex-1 justify-end pb-1">
            <Text className="text-2xl font-black leading-7 text-ink">{movie.title}</Text>
            <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
              <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-soft">
                {movie.releaseYear}
              </Text>
              <Text className="text-2xs text-ink-faint">•</Text>
              <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-soft">
                {typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase}
              </Text>
              <Text className="text-2xs text-ink-faint">•</Text>
              <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-soft">
                {formatRuntime(details?.runtimeMinutes ?? movie.runtimeMinutes)}
              </Text>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              {movie.isCrucial ? <Badge label="Essential" tone="accent" compact /> : null}
              {movie.type === 'series' ? <Badge label="Series" tone="violet" compact /> : null}
              {details?.voteAverage ? (
                <Badge
                  label={`TMDB ${details.voteAverage.toFixed(1)}`}
                  tone="gold"
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
        ) : null}
      </ScrollView>
    </View>
  );
}
