import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useStreamingProviders } from '@/hooks/useTMDB';
import { TMDB_REGION } from '@/services/tmdbApi';
import { providerLogoUrl } from '@/utils/imageHelper';
import type { ProviderKind } from '@/types';

const KIND_LABEL: Record<ProviderKind, string> = {
  flatrate: 'Stream',
  free: 'Free',
  ads: 'Free w/ ads',
  rent: 'Rent',
  buy: 'Buy',
};

interface StreamWidgetProps {
  tmdbId: number;
  type: 'movie' | 'series';
  region?: string;
}

/** Live "Where to Stream" row — TMDB's JustWatch-powered availability for one country. */
export function StreamWidget({ tmdbId, type, region }: StreamWidgetProps) {
  const { data, state, disabled } = useStreamingProviders(tmdbId, type, region);

  const openJustWatch = async () => {
    if (data?.link) await WebBrowser.openBrowserAsync(data.link);
  };

  return (
    <View className="rounded-2xl border border-surface-border bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="play-circle-outline" size={16} color="#10B981" />
          <Text className="ml-2 text-xs font-bold uppercase tracking-[2px] text-white">
            Where to stream
          </Text>
        </View>
        <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-deep">
          {data?.region ?? region ?? TMDB_REGION}
        </Text>
      </View>

      {disabled ? (
        <Text className="mt-3 text-xs leading-4 text-muted">
          Add a free TMDB key as{' '}
          <Text className="font-bold text-doom">EXPO_PUBLIC_TMDB_API_KEY</Text> to see live
          Disney+, Prime and Apple TV availability for your country.
        </Text>
      ) : state === 'loading' ? (
        <View className="mt-4 flex-row items-center">
          <ActivityIndicator size="small" color="#10B981" />
          <Text className="ml-2 text-xs text-muted">Checking providers…</Text>
        </View>
      ) : !data || data.providers.length === 0 ? (
        <Text className="mt-3 text-xs leading-4 text-muted">
          No streaming options listed for this region yet — check back closer to release.
        </Text>
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
                  <View className="h-12 w-12 overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
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
                        <Ionicons name="tv-outline" size={18} color="#8B80A8" />
                      </View>
                    )}
                  </View>
                  <Text className="mt-1.5 text-center text-2xs font-semibold text-white" numberOfLines={1}>
                    {provider.providerName}
                  </Text>
                  <Text className="text-2xs uppercase tracking-wider text-muted-deep">
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
              <Text className="text-2xs font-semibold text-muted-deep">
                Availability via JustWatch — tap to open
              </Text>
              <Ionicons name="open-outline" size={11} color="#5C5378" style={{ marginLeft: 4 }} />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}
