import { useDeferredValue, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { SectionHeader } from '@/src/components/common/SectionHeader';
import { RestaurantCard } from '@/src/components/restaurant/RestaurantCard';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import { filterRestaurants } from '@/src/utils/restaurants';

export default function ReviewsScreen() {
  const { restaurants, isLoading, error } = useRestaurants();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredRestaurants = filterRestaurants(restaurants, { query: deferredQuery, minimumScore });
  const topResult = filteredRestaurants[0] ?? restaurants[0];
  const filtersDirty = query.trim().length > 0 || minimumScore !== null;

  return (
    <Screen includeBottomInset>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          isLoading ? (
            <LoadingState copy="Building the ranked review feed from the current dataset." title="Loading reviews..." />
          ) : (
            <EmptyState
              actionLabel={filtersDirty ? 'Reset filters' : undefined}
              copy="Adjust the text query or score floor to broaden the list."
              onActionPress={
                filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(null);
                    }
                  : undefined
              }
              title="Nothing matches that search."
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.hero, elevation.card]}>
              <Text style={styles.title}>Reviews</Text>
              <Text style={styles.copy}>Full ranked feed from the current Super Goode dataset, optimized for quick scan and tap.</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{filteredRestaurants.length}</Text>
                  <Text style={styles.summaryLabel}>Results</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{restaurants.length}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={[styles.summaryCard, styles.summaryCardHighlight]}>
                  <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>
                    {topResult ? topResult.score.toFixed(1) : '--'}
                  </Text>
                  <Text style={[styles.summaryLabel, styles.summaryLabelHighlight]}>Best in view</Text>
                </View>
              </View>
            </View>
            <View style={styles.controls}>
              <SearchBar onChangeText={setQuery} value={query} />
              <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
            </View>
            <SectionHeader
              actionLabel={filtersDirty ? 'Reset' : undefined}
              copy="The same reusable search, filter, score, and card system applied to the full feed."
              eyebrow="Ranked feed"
              onActionPress={
                filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(null);
                    }
                  : undefined
              }
              title="Browse every reviewed spot"
            />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>{filteredRestaurants.length} results</Text>
              <Text style={styles.summaryText}>{restaurants.length} total entries</Text>
            </View>
            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorEyebrow}>Data load issue</Text>
                <Text style={styles.errorText}>{error}</Text>
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
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 28,
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
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  summaryCardHighlight: {
    backgroundColor: palette.highlight,
    borderColor: palette.highlight,
  },
  summaryValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 22,
  },
  summaryValueHighlight: {
    color: palette.background,
  },
  summaryLabel: {
    color: palette.textDim,
    fontSize: 12,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
  },
  summaryLabelHighlight: {
    color: palette.background,
  },
  summaryText: {
    color: palette.textDim,
    fontSize: 13,
  },
  errorCard: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  errorEyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  errorText: {
    color: palette.text,
    lineHeight: 20,
  },
});
