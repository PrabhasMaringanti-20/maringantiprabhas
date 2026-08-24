import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/useTheme';
import { TAB_BAR_BASE } from '@/utils/layout';

export default function TabsLayout() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.inkFaint,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.line,
          borderTopWidth: 1,
          height: TAB_BAR_BASE + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch-outline" size={size ?? 21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size ?? 21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tierlist"
        options={{
          title: 'Tiers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size ?? 21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideator"
        options={{
          title: 'Ideator',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size ?? 21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
