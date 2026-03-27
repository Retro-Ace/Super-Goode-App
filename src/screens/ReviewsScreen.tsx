import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useDeferredValue, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/common/BrandHeader';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { SectionHeader } from '@/src/components/common/SectionHeader';
import { RestaurantCard } from '@/src/components/restaurant/RestaurantCard';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { palette, radii, spacing, typography } from '@/src/constants/theme';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import { filterRestaurants } from '@/src/utils/restaurants';

export default function ReviewsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { restaurants, isLoading, error } = useRestaurants();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredRestaurants = filterRestaurants(restaurants, { query: deferredQuery, minimumScore });
  const topResult = filteredRestaurants[0] ?? restaurants[0];
  const filtersDirty = query.trim().length > 0 || minimumScore !== null;
  const bottomListInset = tabBarHeight + spacing.xxl;

  return (
    <Screen includeBottomInset>
      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: bottomListInset }]}
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
            <BrandHeader
              artAlign="center"
              artHeight={118}
              artWidth={336}
              shellStyle={styles.brandHeader}
              variant="long"
            />
            <View style={styles.controlsCard}>
              <SearchBar onChangeText={setQuery} value={query} />
              <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
              <View style={styles.utilityRow}>
                <View style={styles.utilityChip}>
                  <Text style={styles.utilityLabel}>Results</Text>
                  <Text style={styles.utilityValue}>{filteredRestaurants.length}</Text>
                </View>
                <View style={styles.utilityChip}>
                  <Text style={styles.utilityLabel}>Total</Text>
                  <Text style={styles.utilityValue}>{restaurants.length}</Text>
                </View>
                <View style={[styles.utilityChip, styles.utilityChipHighlight]}>
                  <Text style={[styles.utilityLabel, styles.utilityLabelHighlight]}>Best</Text>
                  <Text style={[styles.utilityValue, styles.utilityValueHighlight]}>
                    {topResult ? topResult.score.toFixed(1) : '--'}
                  </Text>
                </View>
              </View>
            </View>
            <SectionHeader
              actionLabel={filtersDirty ? 'Reset' : undefined}
              eyebrow="Review feed"
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
            <View style={styles.summaryMetaRow}>
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
        scrollIndicatorInsets={{ bottom: bottomListInset }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  header: {
    gap: spacing.sm,
  },
  brandHeader: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  controlsCard: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  utilityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  utilityChip: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  utilityChipHighlight: {
    backgroundColor: palette.highlight,
    borderColor: palette.highlight,
  },
  utilityLabel: {
    color: palette.textMuted,
    fontFamily: typography.brand,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  utilityLabelHighlight: {
    color: palette.background,
  },
  utilityValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 16,
  },
  utilityValueHighlight: {
    color: palette.background,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
