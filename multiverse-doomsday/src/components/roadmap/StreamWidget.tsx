import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useStreamingProviders } from '@/hooks/useTMDB';
import { TMDB_REGION } from '@/services/tmdbApi';
import { providerLogoUrl } from '@/utils/imageHelper';
import type { MovieItem, ProviderKind } from '@/types';

import { Marker } from '@/components/common/Primitives';
import { usePalette } from '@/hooks/useTheme';
import { radius, space, type } from '@/styles/tokens';

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
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="play-circle-outline" size={15} color={palette.accent} />
        <Marker style={{ marginLeft: space.sm, flex: 1 }}>Where to stream</Marker>
        <Marker>{data?.region ?? region ?? TMDB_REGION}</Marker>
      </View>

      {disabled ? (
        <Text style={{ ...type.small, color: palette.inkSoft, marginTop: space.md }}>
          Add a free TMDB key as{' '}
          <Text style={{ fontWeight: '700', color: palette.accent }}>EXPO_PUBLIC_TMDB_API_KEY</Text>{' '}
          to see live Disney+, Prime and Apple TV availability for your country.
        </Text>
      ) : state === 'loading' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.lg }}>
          <ActivityIndicator size="small" color={palette.accent} />
          <Text style={{ ...type.small, color: palette.inkSoft, marginLeft: space.sm }}>
            Checking providers…
          </Text>
        </View>
      ) : !data || data.providers.length === 0 ? (
        <View style={{ marginTop: space.md }}>
          <Text style={{ ...type.small, color: palette.inkSoft }}>
            TMDB has no listing for this title in your region.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Search where to watch ${movie.title}`}
            onPress={searchTheWeb}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginTop: space.md,
              paddingHorizontal: space.md,
              paddingVertical: space.sm,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: palette.line,
            }}
          >
            <Ionicons name="search" size={13} color={palette.accent} />
            <Marker color={palette.accent} style={{ marginLeft: space.sm }}>
              Search where to watch
            </Marker>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: space.md, paddingVertical: space.md }}
          >
            {data.providers.map((provider) => {
              const logo = providerLogoUrl(provider.logoPath);
              return (
                <Pressable
                  key={`${provider.kind}-${provider.providerId}`}
                  accessibilityRole="link"
                  accessibilityLabel={`${provider.providerName} — ${KIND_LABEL[provider.kind]}`}
                  onPress={openJustWatch}
                  style={{ width: 70, alignItems: 'center' }}
                >
                  <View
                    style={{
                      height: 46,
                      width: 46,
                      borderRadius: radius.md,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: palette.line,
                      backgroundColor: palette.raised,
                    }}
                  >
                    {logo ? (
                      <Image
                        source={{ uri: logo }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={180}
                        cachePolicy="disk"
                      />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="tv-outline" size={18} color={palette.inkFaint} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      ...type.small,
                      fontSize: 10,
                      fontWeight: '600',
                      color: palette.ink,
                      marginTop: space.sm,
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {provider.providerName}
                  </Text>
                  <Marker>{KIND_LABEL[provider.kind]}</Marker>
                </Pressable>
              );
            })}
          </ScrollView>

          {data.link ? (
            <Pressable
              accessibilityRole="link"
              onPress={openJustWatch}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ ...type.small, color: palette.inkFaint }}>
                Availability via JustWatch — tap to open
              </Text>
              <Ionicons
                name="open-outline"
                size={11}
                color={palette.inkFaint}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}
