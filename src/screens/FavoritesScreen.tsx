import { useDeferredValue, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandArt, HERO_WORDMARK_BRAND_ART } from '@/src/components/common/BrandArt';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { RestaurantCard } from '@/src/components/restaurant/RestaurantCard';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { palette, spacing, typography } from '@/src/constants/theme';
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
            <View style={styles.hero}>
              <BrandArt {...HERO_WORDMARK_BRAND_ART} />
            </View>
            <View style={styles.controls}>
              <SearchBar compact onChangeText={setQuery} value={query} />
              <ScoreFilter compact onChange={setMinimumScore} selectedScore={minimumScore} />
            </View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your best bets</Text>
              <View style={styles.sectionMeta}>
                <Text style={styles.savedCountText}>
                  {favoriteIds.length} saved
                </Text>
                {favoriteIds.length > 0 && filtersDirty ? (
                  <Pressable
                    onPress={() => {
                      setQuery('');
                      setMinimumScore(null);
                    }}
                    style={({ pressed }) => [styles.resetAction, pressed && styles.resetActionPressed]}>
                    <Text style={styles.resetActionText}>Reset</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
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
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    marginHorizontal: -spacing.xs,
    paddingTop: spacing.xxs,
  },
  controls: {
    gap: spacing.xs,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 22,
  },
  sectionTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  sectionMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  savedCountText: {
    color: palette.textDim,
    fontSize: 12,
    fontFamily: typography.brand,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  resetAction: {
    paddingVertical: 0,
  },
  resetActionPressed: {
    opacity: 0.72,
  },
  resetActionText: {
    color: palette.highlight,
    fontFamily: typography.brand,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
