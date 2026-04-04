import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandArt } from '@/src/components/common/BrandArt';
import { Screen } from '@/src/components/common/Screen';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { locationsFeedUrl } from '@/src/data/config';
import { useFavorites } from '@/src/providers/FavoritesProvider';
import { useRestaurants } from '@/src/hooks/useRestaurants';

function ProfileCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.card, elevation.card]}>
      <Text style={styles.cardEyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { favoriteIds } = useFavorites();
  const { restaurants, feedStatus } = useRestaurants();
  const cityCount = new Set(restaurants.map((restaurant) => restaurant.cityState)).size;
  const cachedSnapshotStamp =
    feedStatus?.cachedAt && Number.isFinite(Date.parse(feedStatus.cachedAt))
      ? new Date(feedStatus.cachedAt).toLocaleString()
      : null;
  const feedReference = getFeedReference({
    cachedSnapshotStamp,
    feedStatus,
    locationsFeedConfigured: Boolean(locationsFeedUrl),
  });

  return (
    <Screen includeBottomInset>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BrandArt align="center" brand="wordmark" height={132} variant="full" width={336} />
          <View style={styles.heroStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{restaurants.length}</Text>
              <Text style={styles.statLabel}>Restaurants</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{cityCount}</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHighlight]}>
              <Text style={[styles.statValue, styles.statValueHighlight]}>{favoriteIds.length}</Text>
              <Text style={[styles.statLabel, styles.statLabelHighlight]}>Saved</Text>
            </View>
          </View>
        </View>

        <ProfileCard
          body={`${restaurants.length} restaurants across ${cityCount} city/state groups.`}
          eyebrow="Coverage"
          title="Coverage"
        />
        <ProfileCard
          body={`${favoriteIds.length} locally saved favorites on this device.`}
          eyebrow="Local saves"
          title="Saved Spots"
        />

        <View style={styles.referenceSection}>
          <Text style={styles.referenceLabel}>App data source</Text>
          <View style={[styles.referenceCard, elevation.card]}>
            <Text style={styles.referenceTitle}>{feedReference.title}</Text>
            <Text style={styles.referenceBody}>{feedReference.body}</Text>
            {feedReference.note ? <Text style={styles.referenceNote}>{feedReference.note}</Text> : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function getFeedReference({
  cachedSnapshotStamp,
  feedStatus,
  locationsFeedConfigured,
}: {
  cachedSnapshotStamp: string | null;
  feedStatus: ReturnType<typeof useRestaurants>['feedStatus'];
  locationsFeedConfigured: boolean;
}) {
  if (!feedStatus || feedStatus.mode === 'local-seed') {
    return {
      title: 'Bundled app data',
      body: locationsFeedConfigured ? 'Using the bundled app dataset right now.' : 'Using the bundled app dataset.',
      note: null as string | null,
    };
  }

  if (feedStatus.mode === 'remote') {
    return {
      title: 'Live feed active',
      body: 'Using the latest live Super Goode feed right now.',
      note:
        feedStatus.droppedRecordCount > 0
          ? `${feedStatus.droppedRecordCount} invalid row${feedStatus.droppedRecordCount === 1 ? '' : 's'} skipped while loading.`
          : 'A valid snapshot is also saved on this device.',
    };
  }

  if (feedStatus.mode === 'cached-remote') {
    return {
      title: 'Cached snapshot active',
      body: cachedSnapshotStamp
        ? `Live feed unavailable. Using the last saved snapshot from ${cachedSnapshotStamp}.`
        : 'Live feed unavailable. Using the last saved snapshot on this device.',
      note: null as string | null,
    };
  }

  return {
    title: 'Bundled app data',
    body: 'Live feed unavailable. Using the bundled app dataset.',
    note: null as string | null,
  };
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  statCard: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statCardHighlight: {
    backgroundColor: palette.highlight,
    borderColor: palette.highlight,
  },
  statValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 20,
  },
  statValueHighlight: {
    color: palette.background,
  },
  statLabel: {
    color: palette.textDim,
    fontSize: 12,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
  },
  statLabelHighlight: {
    color: palette.background,
  },
  card: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardEyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  referenceSection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  referenceLabel: {
    color: palette.textDim,
    fontFamily: typography.brand,
    fontSize: 11,
    letterSpacing: 0.7,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },
  referenceCard: {
    backgroundColor: 'rgba(23, 16, 47, 0.72)',
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  referenceTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  referenceBody: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  referenceNote: {
    color: palette.highlightSoft,
    fontSize: 12,
    lineHeight: 17,
  },
});
