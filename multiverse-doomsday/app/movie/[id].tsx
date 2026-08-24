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

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const movie = useMovie(id);
  const toggleWatched = useRoadmapStore((state) => state.toggleWatched);
  const setRating = useRoadmapStore((state) => state.setRating);
  const setTier = useRoadmapStore((state) => state.setTier);

  const [burstId, setBurstId] = useState(0);
  const { data: details, disabled: tmdbDisabled } = useTmdbDetails(movie?.tmdbId, movie?.type);

  if (!movie) {
    return (
      <View className="flex-1 items-center justify-center bg-void px-10">
        <Ionicons name="alert-circle-outline" size={40} color="#372B56" />
        <Text className="mt-3 text-center text-sm text-muted">
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
    <View className="flex-1 bg-void">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Backdrop */}
        <View className="h-56 w-full bg-surface-raised">
          {backdrop ? (
            <Image
              source={{ uri: backdrop }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={260}
              cachePolicy="disk"
            />
          ) : (
            <LinearGradient colors={['#211A35', '#0B0813']} style={{ flex: 1 }} />
          )}
          <LinearGradient
            colors={['transparent', '#0B0813']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={12}
            style={{ top: insets.top + 8 }}
            className="absolute left-4 h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-void/80"
          >
            <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Title block */}
        <View className="-mt-12 flex-row px-5">
          <Poster movie={movie} width={92} />

          <View className="ml-4 flex-1 justify-end pb-1">
            <Text className="text-2xl font-black leading-7 text-white">{movie.title}</Text>
            <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
              <Text className="text-2xs font-semibold uppercase tracking-wider text-muted">
                {movie.releaseYear}
              </Text>
              <Text className="text-2xs text-muted-deep">•</Text>
              <Text className="text-2xs font-semibold uppercase tracking-wider text-muted">
                {typeof movie.phase === 'number' ? `Phase ${movie.phase}` : movie.phase}
              </Text>
              <Text className="text-2xs text-muted-deep">•</Text>
              <Text className="text-2xs font-semibold uppercase tracking-wider text-muted">
                {formatRuntime(details?.runtimeMinutes ?? movie.runtimeMinutes)}
              </Text>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              {movie.isCrucial ? <Badge label="Express essential" tone="doom" compact /> : null}
              {movie.type === 'series' ? <Badge label="Series" tone="cosmic" compact /> : null}
              {details?.voteAverage ? (
                <Badge
                  label={`TMDB ${details.voteAverage.toFixed(1)}`}
                  tone="infinity"
                  icon="star"
                  compact
                />
              ) : null}
            </View>
          </View>
        </View>

        {/* Why it matters */}
        <View className="mt-6 px-5">
          <View className="overflow-hidden rounded-2xl border border-doom/40">
            <LinearGradient colors={['#10B98122', '#161124']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View className="p-4">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={16} color="#10B981" />
                  <Text className="ml-2 text-xs font-black uppercase tracking-[2px] text-doom">
                    Why it matters for Doomsday
                  </Text>
                </View>
                <Text className="mt-2 text-[13px] leading-5 text-white/90">
                  {movie.whyItMatters}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Overview */}
        {details?.overview ? (
          <View className="mt-5 px-5">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-white">Overview</Text>
            <Text className="mt-2 text-[13px] leading-5 text-muted">{details.overview}</Text>
          </View>
        ) : tmdbDisabled ? (
          <View className="mt-5 px-5">
            <Text className="text-xs leading-4 text-muted-deep">
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
          <View className="rounded-2xl border border-surface-border bg-surface p-4">
            <Text className="text-2xs font-bold uppercase tracking-[2px] text-muted-deep">
              Your rating
            </Text>
            <View className="mt-2.5">
              <StarRating
                value={movie.userRating}
                onChange={(rating) => setRating(movie.id, rating)}
              />
            </View>

            <Text className="mt-5 text-2xs font-bold uppercase tracking-[2px] text-muted-deep">
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
                      isActive ? TIER_STYLE[tier].bg : 'bg-surface-raised'
                    }`}
                    style={{ borderColor: isActive ? '#FFFFFF' : '#372B56' }}
                  >
                    <Text className={`text-lg font-black ${isActive ? 'text-void' : 'text-white'}`}>
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
          <StreamWidget tmdbId={movie.tmdbId} type={movie.type} />
        </View>

        {/* Key players */}
        {cast.length > 0 ? (
          <View className="mt-6">
            <Text className="px-5 text-xs font-bold uppercase tracking-[2px] text-white">
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
                    className="mt-1.5 text-center text-2xs font-semibold text-white"
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
    </View>
  );
}
