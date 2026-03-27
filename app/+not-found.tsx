import { Link, Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/src/constants/theme';

export default function NotFoundScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const isRemovedRestaurantRoute = pathname.startsWith('/restaurant/');

  useEffect(() => {
    if (isRemovedRestaurantRoute) {
      router.replace('/');
    }
  }, [isRemovedRestaurantRoute, router]);

  if (isRemovedRestaurantRoute) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>That page is off the menu.</Text>
        <Link href="/" style={styles.link}>
          Back to Super Goode
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.background,
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    color: palette.highlight,
    fontSize: 15,
    fontWeight: '700',
  },
});
