import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { backgroundColor: '#ffffff' },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Golf Weather',
          tabBarLabel: 'Weather',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="partly-sunny-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
