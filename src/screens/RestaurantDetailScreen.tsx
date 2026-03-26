import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/common/ActionButton';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { ScorePill } from '@/src/components/common/ScorePill';
import { Screen } from '@/src/components/common/Screen';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useFavorites } from '@/src/providers/FavoritesProvider';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import { openExternalUrl } from '@/src/utils/links';

export default function RestaurantDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { restaurants, isLoading } = useRestaurants();
  const { isFavorite, toggleFavorite } = useFavorites();
  const restaurant = restaurants.find((item) => item.id === params.id);

  return (
    <Screen includeBottomInset>
      <Stack.Screen options={{ title: restaurant?.name ?? 'Restaurant' }} />
      {isLoading ? (
        <View style={styles.loadingState}>
          <LoadingState copy="Loading restaurant details from the shared feed." title="Loading restaurant..." />
        </View>
      ) : !restaurant ? (
        <View style={styles.loadingState}>
          <EmptyState
            copy="The selected location is missing from the current feed snapshot."
            title="Restaurant not found"
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, elevation.floating]}>
            <View style={styles.heroRail} />
            <View style={styles.heroHeader}>
              <ScorePill score={restaurant.score} />
              <ActionButton
                label={isFavorite(restaurant.id) ? 'Favorited' : 'Save Favorite'}
                onPress={() => toggleFavorite(restaurant.id)}
                variant={isFavorite(restaurant.id) ? 'primary' : 'secondary'}
              />
            </View>
            <Text style={styles.kicker}>{restaurant.cityState}</Text>
            <Text style={styles.title}>{restaurant.name}</Text>
            <Text style={styles.subtitle}>{restaurant.subtitle}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Ionicons color={palette.highlight} name="location-outline" size={16} />
                <Text style={styles.metaText}>{restaurant.cityState}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons color={palette.highlight} name="sparkles-outline" size={16} />
                <Text style={styles.metaText}>{restaurant.sourceType}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons color={palette.highlight} name="shield-checkmark-outline" size={16} />
                <Text style={styles.metaText}>{restaurant.confidence}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.sectionBody}>{restaurant.fullAddress}</Text>
          </View>

          {restaurant.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.sectionBody}>{restaurant.notes}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <ActionButton
              label="Get Directions"
              onPress={() => openExternalUrl(restaurant.directionsUrl)}
              variant="primary"
            />
            <ActionButton
              label="Watch Review"
              onPress={() => openExternalUrl(restaurant.reviewUrl)}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
  },
  heroRail: {
    backgroundColor: palette.highlight,
    height: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metaText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: palette.highlight,
    fontFamily: typography.brand,
    fontSize: 15,
    textTransform: 'uppercase',
  },
  sectionBody: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});
