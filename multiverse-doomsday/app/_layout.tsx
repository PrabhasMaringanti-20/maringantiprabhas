import '../global.css';
import '@/styles/nativewindInterop';

import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DoomIntro, INTRO_ASSETS, INTRO_BACKDROP } from '@/components/common/DoomIntro';
import { usePalette, useThemeStore } from '@/hooks/useTheme';

// Hold the native splash until the cold open has its artwork decoded, so the
// handoff is one continuous image rather than a flash of empty screen.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const palette = usePalette();
  useThemeStore((state) => state.mode);

  const [assetsReady, setAssetsReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Asset.loadAsync(INTRO_ASSETS)
      .catch(() => {
        // A decode failure must not strand the user on the splash screen.
      })
      .finally(() => {
        if (!cancelled) setAssetsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleIntroLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Until the intro can paint, keep the screen on its exact background colour.
  if (!assetsReady) {
    return <View style={{ flex: 1, backgroundColor: INTRO_BACKDROP }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.canvas }}>
      <SafeAreaProvider>
        <StatusBar style={introDone ? (palette.isDark ? 'light' : 'dark') : 'light'} />
        <View style={{ flex: 1, backgroundColor: palette.canvas }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.canvas },
              animation: 'fade',
              animationDuration: 220,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="movie/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
              }}
            />
          </Stack>

          {!introDone ? (
            <DoomIntro onFinish={() => setIntroDone(true)} onReady={handleIntroLayout} />
          ) : null}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
