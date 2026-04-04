import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { ErrorBoundary, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStartupScreen } from '@/src/components/common/AppStartupScreen';
import { navigationTheme } from '@/src/constants/theme';
import { FavoritesProvider } from '@/src/providers/FavoritesProvider';
import { loadFavoriteIds } from '@/src/services/favoritesStorage';
import { getRestaurantFeed } from '@/src/services/restaurantRepository';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const MIN_BOOT_SCREEN_MS = 1200;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [bootReady, setBootReady] = useState(false);
  const [initialFavoriteIds, setInitialFavoriteIds] = useState<string[] | undefined>(undefined);

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

  useEffect(() => {
    if (!loaded) {
      return;
    }

    let isMounted = true;
    const bootStartedAt = Date.now();

    Promise.allSettled([getRestaurantFeed(), loadFavoriteIds()])
      .then(async ([, favoritesResult]) => {
        const remaining = Math.max(0, MIN_BOOT_SCREEN_MS - (Date.now() - bootStartedAt));

        if (remaining > 0) {
          await new Promise((resolve) => {
            setTimeout(resolve, remaining);
          });
        }

        if (!isMounted) {
          return;
        }

        setInitialFavoriteIds(favoritesResult.status === 'fulfilled' ? favoritesResult.value : []);
        setBootReady(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setInitialFavoriteIds([]);
        setBootReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!bootReady) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppStartupScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <FavoritesProvider initialFavoriteIds={initialFavoriteIds}>
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
    </SafeAreaProvider>
  );
}
