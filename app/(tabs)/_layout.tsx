import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: palette.highlight,
        tabBarInactiveTintColor: palette.textDim,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'map' : 'map-outline'} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Reviews',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'newspaper' : 'newspaper-outline'} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'heart' : 'heart-outline'} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: palette.background,
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    bottom: Platform.select({ ios: 18, default: 14 }),
    elevation: 0,
    height: 84,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    ...elevation.floating,
    backgroundColor: palette.backgroundElevated,
    borderColor: palette.border,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  tabBarItem: {
    paddingTop: spacing.xs,
  },
  tabBarIcon: {
    marginTop: spacing.xs,
  },
  tabBarLabel: {
    fontFamily: typography.brand,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
