import { useDeferredValue, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/common/BrandHeader';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { SectionHeader } from '@/src/components/common/SectionHeader';
import { MapPreview } from '@/src/components/restaurant/MapPreview';
import { RestaurantCard } from '@/src/components/restaurant/RestaurantCard';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { palette, radii, spacing, typography } from '@/src/constants/theme';
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
            <BrandHeader subtitle="Search restaurants, scan the map, and drop into the hot list." />

            <View style={styles.controlsCard}>
              <SearchBar onChangeText={setQuery} placeholder="Search restaurants..." value={query} />
              <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
              <View style={styles.utilityRow}>
                <View style={styles.utilityChip}>
                  <Text style={styles.utilityLabel}>Visible</Text>
                  <Text style={styles.utilityValue}>{filteredRestaurants.length}</Text>
                </View>
                <View style={styles.utilityChip}>
                  <Text style={styles.utilityLabel}>Cities</Text>
                  <Text style={styles.utilityValue}>{cityCount}</Text>
                </View>
                <View style={[styles.utilityChip, styles.utilityChipHighlight]}>
                  <Text style={[styles.utilityLabel, styles.utilityLabelHighlight]}>Top</Text>
                  <Text style={[styles.utilityValue, styles.utilityValueHighlight]}>{topScore}</Text>
                </View>
              </View>
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
              copy="Tighter cards and gold score chips, aligned closer to the concept list rhythm."
              eyebrow="Hot list"
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
