import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { ErrorBoundary, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { navigationTheme } from '@/src/constants/theme';
import { FavoritesProvider } from '@/src/providers/FavoritesProvider';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <FavoritesProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: navigationTheme.colors.background },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: navigationTheme.colors.card },
            headerTintColor: navigationTheme.colors.text,
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="review/[id]"
            options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
        </Stack>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
