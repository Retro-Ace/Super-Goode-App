import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useDeferredValue, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandArt } from '@/src/components/common/BrandArt';
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
  const insets = useSafeAreaInsets();
  const { restaurants, isLoading, error } = useRestaurants();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredRestaurants = filterRestaurants(restaurants, { query: deferredQuery, minimumScore });
  const topResult = filteredRestaurants[0] ?? restaurants[0];
  const filtersDirty = query.trim().length > 0 || minimumScore !== null;
  const bottomListInset = Math.max(tabBarHeight - insets.bottom, 0) + spacing.xxs;

  return (
    <Screen includeBottomInset>
      <View style={styles.screen}>
        <View style={styles.fixedHeader}>
          <View style={styles.brandBanner}>
            <BrandArt align="center" height={118} variant="long" width={360} />
          </View>

          <View style={styles.controlsCard}>
            <SearchBar compact onChangeText={setQuery} value={query} />
            <ScoreFilter compact onChange={setMinimumScore} selectedScore={minimumScore} />
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

          <View style={styles.feedHeader}>
            <SectionHeader
              actionLabel={filtersDirty ? 'Reset' : undefined}
              compact
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
        </View>

        <View style={styles.listArea}>
          {isLoading ? (
            <View style={[styles.listStateWrap, { paddingBottom: bottomListInset }]}>
              <LoadingState copy="Building the ranked review feed from the current dataset." title="Loading reviews..." />
            </View>
          ) : (
            <FlatList
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: bottomListInset },
                filteredRestaurants.length === 0 ? styles.listContentEmpty : undefined,
              ]}
              data={filteredRestaurants}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={[styles.listStateWrap, { paddingBottom: bottomListInset }]}>
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
                </View>
              }
              renderItem={({ item }) => <RestaurantCard restaurant={item} />}
              scrollIndicatorInsets={{ bottom: bottomListInset }}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + spacing.xxs,
  },
  fixedHeader: {
    gap: spacing.xxs,
  },
  brandBanner: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.xs,
    paddingVertical: 0,
  },
  controlsCard: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  utilityRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
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
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  utilityChipHighlight: {
    backgroundColor: palette.highlight,
    borderColor: palette.highlight,
  },
  utilityLabel: {
    color: palette.textMuted,
    fontFamily: typography.brand,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  utilityLabelHighlight: {
    color: palette.background,
  },
  utilityValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 14,
  },
  utilityValueHighlight: {
    color: palette.background,
  },
  feedHeader: {
    gap: spacing.xxs,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    color: palette.textDim,
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.xs,
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
  listArea: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingTop: 2,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listStateWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
