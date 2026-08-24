import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useStreamingProviders } from '@/hooks/useTMDB';
import { TMDB_REGION } from '@/services/tmdbApi';
import { providerLogoUrl } from '@/utils/imageHelper';
import type { MovieItem, ProviderKind } from '@/types';

import { usePalette } from '@/hooks/useTheme';

const KIND_LABEL: Record<ProviderKind, string> = {
  flatrate: 'Stream',
  free: 'Free',
  ads: 'Free w/ ads',
  rent: 'Rent',
  buy: 'Buy',
};

interface StreamWidgetProps {
  movie: Pick<MovieItem, 'id' | 'title' | 'tmdbId' | 'type' | 'releaseYear'>;
  region?: string;
}

/** Live "Where to Stream" row — TMDB's JustWatch-powered availability for one country. */
export function StreamWidget({ movie, region }: StreamWidgetProps) {
  const palette = usePalette();
  const { data, state, disabled } = useStreamingProviders(movie, region);

  const openJustWatch = async () => {
    if (data?.link) await WebBrowser.openBrowserAsync(data.link);
    else await searchTheWeb();
  };

  /** TMDB's country data has gaps, so there is always a way to go look it up. */
  const searchTheWeb = async () => {
    const query = encodeURIComponent(
      `${movie.title} ${movie.releaseYear} watch online streaming ${region ?? TMDB_REGION}`,
    );
    await WebBrowser.openBrowserAsync(`https://www.google.com/search?q=${query}`);
  };

  return (
    <View className="rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="play-circle-outline" size={16} color={palette.accent} />
          <Text className="ml-2 text-xs font-bold uppercase tracking-[2px] text-ink">
            Where to stream
          </Text>
        </View>
        <Text className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
          {data?.region ?? region ?? TMDB_REGION}
        </Text>
      </View>

      {disabled ? (
        <Text className="mt-3 text-xs leading-4 text-ink-soft">
          Add a free TMDB key as{' '}
          <Text className="font-bold text-accent">EXPO_PUBLIC_TMDB_API_KEY</Text> to see live
          Disney+, Prime and Apple TV availability for your country.
        </Text>
      ) : state === 'loading' ? (
        <View className="mt-4 flex-row items-center">
          <ActivityIndicator size="small" color={palette.accent} />
          <Text className="ml-2 text-xs text-ink-soft">Checking providers…</Text>
        </View>
      ) : !data || data.providers.length === 0 ? (
        <View className="mt-3">
          <Text className="text-xs leading-4 text-ink-soft">
            TMDB has no listing for this title in your region.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Search where to watch ${movie.title}`}
            onPress={searchTheWeb}
            className="mt-3 flex-row items-center self-start rounded-xl border border-line px-3 py-2"
          >
            <Ionicons name="search" size={13} color={palette.accent} />
            <Text className="ml-2 text-2xs font-bold uppercase tracking-wider text-accent">
              Search where to watch
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
          >
            {data.providers.map((provider) => {
              const logo = providerLogoUrl(provider.logoPath);
              return (
                <Pressable
                  key={`${provider.kind}-${provider.providerId}`}
                  accessibilityRole="link"
                  accessibilityLabel={`${provider.providerName} — ${KIND_LABEL[provider.kind]}`}
                  onPress={openJustWatch}
                  className="w-[70px] items-center"
                >
                  <View className="h-12 w-12 overflow-hidden rounded-xl border border-line bg-surface-raised">
                    {logo ? (
                      <Image
                        source={{ uri: logo }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={180}
                        cachePolicy="disk"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="tv-outline" size={18} color={palette.inkFaint} />
                      </View>
                    )}
                  </View>
                  <Text className="mt-1.5 text-center text-2xs font-semibold text-ink" numberOfLines={1}>
                    {provider.providerName}
                  </Text>
                  <Text className="text-2xs uppercase tracking-wider text-ink-faint">
                    {KIND_LABEL[provider.kind]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {data.link ? (
            <Pressable
              accessibilityRole="link"
              onPress={openJustWatch}
              className="flex-row items-center"
            >
              <Text className="text-2xs font-semibold text-ink-faint">
                Availability via JustWatch — tap to open
              </Text>
              <Ionicons name="open-outline" size={11} color={palette.inkFaint} style={{ marginLeft: 4 }} />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}
