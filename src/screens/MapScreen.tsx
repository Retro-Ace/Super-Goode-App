import { useDeferredValue, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { SectionHeader } from '@/src/components/common/SectionHeader';
import { MapPreview } from '@/src/components/restaurant/MapPreview';
import { RestaurantCard } from '@/src/components/restaurant/RestaurantCard';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import { filterRestaurants } from '@/src/utils/restaurants';

export default function MapScreen() {
  const router = useRouter();
  const { restaurants, isLoading, error } = useRestaurants();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(8);
  const deferredQuery = useDeferredValue(query);

  const filteredRestaurants = filterRestaurants(restaurants, { query: deferredQuery, minimumScore });
  const featuredRestaurants = filteredRestaurants.slice(0, 12);
  const cityCount = new Set(restaurants.map((restaurant) => restaurant.cityState)).size;
  const topScore = restaurants[0]?.score.toFixed(1) ?? '...';
  const filtersDirty = query.trim().length > 0 || minimumScore !== 8;

  return (
    <Screen includeBottomInset>
      <FlatList
        contentContainerStyle={styles.content}
        data={featuredRestaurants}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          isLoading ? (
            <LoadingState
              copy="Pulling the current Super Goode seed into the mobile shell."
              title="Loading the score board..."
            />
          ) : (
            <EmptyState
              actionLabel={filtersDirty ? 'Reset filters' : undefined}
              copy="Try a broader search or lower the score floor."
              onActionPress={
                filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(8);
                    }
                  : undefined
              }
              title="No matches found"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.hero, elevation.floating]}>
              <View style={styles.heroGlow} />
              <Text style={styles.heroEyebrow}>Super Goode</Text>
              <Text style={styles.heroTitle}>Find the next elite bite.</Text>
              <Text style={styles.heroCopy}>
                Dark-purple, score-first discovery shaped around the current shared restaurant feed and ready for a
                future live JSON endpoint.
              </Text>
              <View style={styles.heroStats}>
                <View style={[styles.statCard, styles.statCardHighlight]}>
                  <Text style={[styles.statValue, styles.statValueHighlight]}>{topScore}</Text>
                  <Text style={[styles.statLabel, styles.statLabelHighlight]}>Top score</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{restaurants.length || '...'}</Text>
                  <Text style={styles.statLabel}>Restaurants</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{cityCount || '...'}</Text>
                  <Text style={styles.statLabel}>Cities</Text>
                </View>
              </View>
            </View>

            <View style={styles.controls}>
              <SearchBar onChangeText={setQuery} value={query} />
              <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
            </View>

            {filteredRestaurants.length > 0 ? (
              <MapPreview
                onSelectRestaurant={(id) =>
                  router.push({ pathname: '/restaurant/[id]', params: { id } })
                }
                restaurants={filteredRestaurants}
              />
            ) : null}

            <SectionHeader
              actionLabel={filtersDirty ? 'Reset' : undefined}
              copy="Highest-rated results in the current filter, tuned for fast thumb scanning."
              eyebrow="Live board"
              onActionPress={
                filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(8);
                    }
                  : undefined
              }
              title="Hot list"
            />

            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorEyebrow}>Data load issue</Text>
                <Text style={styles.errorCopy}>{error}</Text>
              </View>
            ) : null}
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
    borderColor: palette.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
  },
  heroGlow: {
    backgroundColor: 'rgba(160, 109, 255, 0.18)',
    borderRadius: 220,
    height: 220,
    position: 'absolute',
    right: -70,
    top: -90,
    width: 220,
  },
  heroEyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  heroCopy: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  statCardHighlight: {
    backgroundColor: palette.highlight,
    borderColor: palette.highlight,
  },
  statValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 24,
  },
  statValueHighlight: {
    color: palette.background,
  },
  statLabel: {
    color: palette.textDim,
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statLabelHighlight: {
    color: palette.background,
  },
  controls: {
    gap: spacing.md,
  },
  errorCard: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
    padding: spacing.md,
  },
  errorEyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  errorCopy: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
