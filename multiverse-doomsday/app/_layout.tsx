import '../global.css';
import '@/styles/nativewindInterop';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DoomIntro } from '@/components/common/DoomIntro';
import { usePalette, useThemeStore } from '@/hooks/useTheme';

export default function RootLayout() {
  const palette = usePalette();
  // Subscribing here re-renders the whole tree when the theme changes.
  useThemeStore((state) => state.mode);
  const [introDone, setIntroDone] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.canvas }}>
      <SafeAreaProvider>
        <StatusBar style={palette.isDark ? 'light' : 'dark'} />
        <View style={{ flex: 1, backgroundColor: palette.canvas }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.canvas },
              animation: 'slide_from_right',
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
