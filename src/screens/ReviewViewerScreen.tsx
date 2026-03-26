import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { ActionButton } from '@/src/components/common/ActionButton';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import { openExternalUrl } from '@/src/utils/links';
import {
  getReviewExternalActionLabel,
  getReviewProvider,
  getReviewProviderLabel,
  getRuntimeReviewUrl,
  normalizeReviewUrl,
} from '@/src/utils/reviews';

export default function ReviewViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { restaurants, isLoading } = useRestaurants();
  const [isLoadingWebView, setIsLoadingWebView] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const restaurant = useMemo(
    () => restaurants.find((item) => item.id === params.id),
    [params.id, restaurants]
  );

  const normalizedReviewUrl = normalizeReviewUrl(restaurant?.reviewUrl);
  const reviewUrl = getRuntimeReviewUrl(normalizedReviewUrl);
  const provider = getReviewProvider(normalizedReviewUrl);
  const providerLabel = getReviewProviderLabel(provider);
  const externalActionLabel = getReviewExternalActionLabel(provider);
  const canLoadInApp = Boolean(reviewUrl) && Platform.OS !== 'web';

  function handleClose() {
    router.back();
  }

  function handleOpenExternal() {
    if (!reviewUrl) {
      return;
    }

    void openExternalUrl(reviewUrl);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={({ pressed }) => [styles.headerButton, pressed ? styles.pressed : undefined]}>
            <Ionicons color={palette.text} name="close" size={20} />
            <Text style={styles.headerButtonText}>Close</Text>
          </Pressable>

          {reviewUrl ? (
            <Pressable
              onPress={handleOpenExternal}
              style={({ pressed }) => [styles.headerButton, styles.headerButtonAccent, pressed ? styles.pressed : undefined]}>
              <Ionicons color={palette.highlight} name="open-outline" size={18} />
              <Text style={styles.headerButtonAccentText}>{externalActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{providerLabel}</Text>
          <Text numberOfLines={2} style={styles.title}>
            {restaurant?.name ?? 'Review viewer'}
          </Text>
          {restaurant?.subtitle ? (
            <Text numberOfLines={2} style={styles.subtitle}>
              {restaurant.subtitle}
            </Text>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.stateWrap}>
            <LoadingState copy="Loading the selected review from the current restaurant feed." title="Loading review..." />
          </View>
        ) : !restaurant ? (
          <View style={styles.stateWrap}>
            <EmptyState copy="The linked restaurant is missing from the current feed snapshot." title="Review not found" />
          </View>
        ) : !reviewUrl ? (
          <View style={styles.stateWrap}>
            <EmptyState
              copy="This restaurant does not have a linked review yet. When one is added to the source feed, it will appear here automatically."
              title="No review available"
            />
          </View>
        ) : !canLoadInApp || loadFailed ? (
          <View style={styles.stateWrap}>
            <View style={[styles.fallbackCard, elevation.card]}>
              <Text style={styles.fallbackTitle}>
                {loadFailed ? 'This review could not load inside the app.' : 'This review opens better outside the app.'}
              </Text>
              <Text style={styles.fallbackBody}>
                {loadFailed
                  ? 'Some providers block embedded playback or fail intermittently. You can still open the review directly.'
                  : 'Use the external fallback to keep the review experience moving cleanly.'}
              </Text>
              <View style={styles.fallbackActions}>
                <ActionButton label={externalActionLabel} onPress={handleOpenExternal} variant="primary" />
                <ActionButton label="Close" onPress={handleClose} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.viewerWrap}>
            <View style={[styles.viewerShell, elevation.card]}>
              <WebView
                allowsInlineMediaPlayback
                javaScriptEnabled
                mediaPlaybackRequiresUserAction
                onError={() => {
                  setLoadFailed(true);
                  setIsLoadingWebView(false);
                }}
                onHttpError={() => {
                  setLoadFailed(true);
                  setIsLoadingWebView(false);
                }}
                onLoadEnd={() => setIsLoadingWebView(false)}
                onLoadStart={() => {
                  setLoadFailed(false);
                  setIsLoadingWebView(true);
                }}
                setSupportMultipleWindows={false}
                sharedCookiesEnabled
                source={{ uri: reviewUrl }}
                style={styles.webview}
              />
              {isLoadingWebView ? (
                <View pointerEvents="none" style={styles.loadingOverlay}>
                  <ActivityIndicator color={palette.highlight} size="large" />
                  <Text style={styles.loadingOverlayText}>Loading review in app...</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  root: {
    backgroundColor: palette.background,
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButtonAccent: {
    borderColor: palette.borderStrong,
  },
  headerButtonText: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  headerButtonAccentText: {
    color: palette.highlight,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  titleBlock: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  fallbackCard: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  fallbackTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  fallbackBody: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  fallbackActions: {
    gap: spacing.sm,
  },
  viewerWrap: {
    flex: 1,
  },
  viewerShell: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: palette.backgroundCard,
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(8, 5, 18, 0.88)',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  loadingOverlayText: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.86,
  },
});
