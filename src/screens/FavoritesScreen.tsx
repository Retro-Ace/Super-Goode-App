import { useDeferredValue, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BrandArt } from '@/src/components/common/BrandArt';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { SectionHeader } from '@/src/components/common/SectionHeader';
import { RestaurantCard } from '@/src/components/restaurant/RestaurantCard';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useFavorites } from '@/src/providers/FavoritesProvider';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import { filterRestaurants } from '@/src/utils/restaurants';

export default function FavoritesScreen() {
  const { favoriteIds, isReady } = useFavorites();
  const { restaurants } = useRestaurants();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);

  const favoriteRestaurants = restaurants.filter((restaurant) => favoriteIds.includes(restaurant.id));
  const filteredFavorites = filterRestaurants(favoriteRestaurants, { query: deferredQuery, minimumScore });
  const filtersDirty = query.trim().length > 0 || minimumScore !== null;

  return (
    <Screen includeBottomInset>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isReady ? (
            <LoadingState copy="Restoring your locally saved spots." title="Loading favorites..." />
          ) : (
            <EmptyState
              actionLabel={favoriteIds.length > 0 && filtersDirty ? 'Reset filters' : undefined}
              copy="Save spots from the map or reviews tabs to build your personal hit list."
              onActionPress={
                favoriteIds.length > 0 && filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(null);
                    }
                  : undefined
              }
              title={favoriteIds.length === 0 ? 'No favorites yet' : 'No matches in favorites'}
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.hero, elevation.card]}>
              <BrandArt align="center" height={148} variant="full" width={232} />
              <Text style={styles.copy}>Persisted locally with AsyncStorage and styled like a saved hit list, not a placeholder.</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{favoriteIds.length}</Text>
                  <Text style={styles.summaryLabel}>Saved spots</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{filteredFavorites.length}</Text>
                  <Text style={styles.summaryLabel}>In view</Text>
                </View>
              </View>
            </View>
            <View style={styles.controls}>
              <SearchBar onChangeText={setQuery} value={query} />
              <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
            </View>
            <SectionHeader
              actionLabel={favoriteIds.length > 0 && filtersDirty ? 'Reset' : undefined}
              copy="Saved places stay device-local for now, but the UI is ready for future account sync."
              eyebrow="Saved board"
              onActionPress={
                favoriteIds.length > 0 && filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(null);
                    }
                  : undefined
              }
              title="Your best bets"
            />
          </View>
        }
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.md,
  },
  hero: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  copy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  controls: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  summaryValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 22,
  },
  summaryLabel: {
    color: palette.textDim,
    fontSize: 12,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
  },
});
