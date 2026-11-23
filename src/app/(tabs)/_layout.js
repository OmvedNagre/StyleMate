import { Tabs } from 'expo-router';
import { Compass, House, Shirt, UserRound } from 'lucide-react-native';
import { theme } from '../../constants/theme';

const tabs = [
  { name: 'index', title: 'Home', Icon: House },
  { name: 'wardrobe', title: 'Wardrobe', Icon: Shirt },
  { name: 'discover', title: 'Discover', Icon: Compass },
  { name: 'profile', title: 'Profile', Icon: UserRound },
];

export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
    tabBarActiveTintColor: theme.colors.brand,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarActiveBackgroundColor: theme.colors.tint,
    tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
  }}>
    {tabs.map(({ name, title, Icon }) => <Tabs.Screen key={name} name={name} options={{
      title,
      tabBarAccessibilityLabel: title,
      tabBarIcon: ({ color, focused }) => <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 1.8} />,
    }} />)}
  </Tabs>;
}
