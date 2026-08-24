import '../global.css';
import '@/styles/nativewindInterop';

import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DoomIntro, INTRO_ASSETS, INTRO_BACKDROP } from '@/components/common/DoomIntro';
import { usePalette, useThemeStore } from '@/hooks/useTheme';

// The cold open paints its own backdrop, so the native splash only needs to
// cover the very first frame. It is dismissed unconditionally on mount below —
// nothing about the intro is allowed to gate it, because a stalled asset decode
// once left people staring at the splash forever.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 260 });

export default function RootLayout() {
  const palette = usePalette();
  useThemeStore((state) => state.mode);

  const [introDone, setIntroDone] = useState(false);

  // Warm the intro artwork in the background. The intro renders immediately
  // either way; the images simply fade in as they decode.
  useEffect(() => {
    Asset.loadAsync(INTRO_ASSETS).catch(() => {});
  }, []);

  // One unconditional hand-off from the native splash to the cold open.
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: INTRO_BACKDROP }}>
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

          {!introDone ? <DoomIntro onFinish={() => setIntroDone(true)} /> : null}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
