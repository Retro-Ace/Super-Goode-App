import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { elevation, palette, spacing, typography } from '@/src/constants/theme';

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
    bottom: 0,
    elevation: 0,
    height: Platform.select({ ios: 78, default: 70 }),
    left: 0,
    paddingHorizontal: 0,
    position: 'absolute',
    right: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.backgroundElevated,
    borderColor: palette.border,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: elevation.card.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarItem: {
    paddingTop: spacing.xxs,
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
