import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/useTheme';
import { HAIRLINE, type } from '@/styles/tokens';
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
          borderTopWidth: HAIRLINE,
          height: TAB_BAR_BASE + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          elevation: 0,
        },
        tabBarLabelStyle: {
          ...type.marker,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch-outline" size={19} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={19} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tierlist"
        options={{
          title: 'Tiers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={19} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prep"
        options={{
          title: 'Prep',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={19} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideator"
        options={{
          title: 'Ideator',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={19} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
