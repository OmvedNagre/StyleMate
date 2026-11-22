import { Tabs } from 'expo-router';
import { theme } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.textPrimary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
      tabBarIconStyle: { display: 'none' },
      tabBarLabelStyle: { fontSize: theme.font.caption, fontWeight: '600' },
      tabBarItemStyle: { paddingVertical: theme.space.sm },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Wardrobe' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
