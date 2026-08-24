import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#5C5378',
        tabBarStyle: {
          backgroundColor: '#0B0813',
          borderTopColor: '#372B56',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tierlist"
        options={{
          title: 'Tier Studio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
