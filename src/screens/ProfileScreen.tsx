import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandArt } from '@/src/components/common/BrandArt';
import { Screen } from '@/src/components/common/Screen';
import { SectionHeader } from '@/src/components/common/SectionHeader';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { locationsFeedUrl } from '@/src/data/config';
import { useFavorites } from '@/src/providers/FavoritesProvider';
import { useRestaurants } from '@/src/hooks/useRestaurants';

function ProfileCard({
  eyebrow,
  title,
  body,
  tone = 'default',
}: {
  eyebrow: string;
  title: string;
  body: string;
  tone?: 'default' | 'highlight';
}) {
  return (
    <View style={[styles.card, tone === 'highlight' ? styles.cardHighlight : undefined, elevation.card]}>
      <Text style={styles.cardEyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardBody, tone === 'highlight' ? styles.cardBodyHighlight : undefined]}>{body}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { favoriteIds } = useFavorites();
  const { restaurants, feedStatus } = useRestaurants();
  const cityCount = new Set(restaurants.map((restaurant) => restaurant.cityState)).size;
  const feedModeBody = feedStatus?.message ?? (locationsFeedUrl ? 'Remote JSON feed configured.' : 'Local seeded JSON active.');
  const cachedSnapshotStamp =
    feedStatus?.cachedAt && Number.isFinite(Date.parse(feedStatus.cachedAt))
      ? new Date(feedStatus.cachedAt).toLocaleString()
      : null;
  const feedWiringBody = !locationsFeedUrl
    ? 'Set EXPO_PUBLIC_LOCATIONS_FEED_URL later to switch the repository from local seed to live feed.'
    : feedStatus?.mode === 'remote'
      ? feedStatus.droppedRecordCount > 0
        ? `EXPO_PUBLIC_LOCATIONS_FEED_URL is active and the app cached the latest valid remote snapshot after skipping ${feedStatus.droppedRecordCount} invalid remote record${feedStatus.droppedRecordCount === 1 ? '' : 's'}.`
        : 'EXPO_PUBLIC_LOCATIONS_FEED_URL is active and the app is currently reading the live feed while refreshing the on-device snapshot cache.'
      : feedStatus?.mode === 'cached-remote'
        ? `${feedStatus.remoteFailureReason} Using the last valid cached remote snapshot${cachedSnapshotStamp ? ` from ${cachedSnapshotStamp}` : ''}.`
        : 'EXPO_PUBLIC_LOCATIONS_FEED_URL is configured, but the app is currently using the bundled local seed because the live feed and cached snapshot were unavailable.';

  return (
    <Screen includeBottomInset>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BrandArt align="center" height={104} variant="full" width={176} />
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

        <SectionHeader
          compact
          eyebrow="Settings runway"
          title="Data and account status"
        />

        <ProfileCard
          body={feedModeBody}
          eyebrow="Feed mode"
          tone="highlight"
          title="Data Mode"
        />
        <ProfileCard
          body={feedWiringBody}
          eyebrow="Feed wiring"
          title="Remote Feed Ready"
        />
        {feedStatus?.mode === 'cached-remote' && cachedSnapshotStamp ? (
          <ProfileCard
            body={`Last valid remote snapshot saved on ${cachedSnapshotStamp}.`}
            eyebrow="Snapshot cache"
            title="Cached Feed Timestamp"
          />
        ) : null}
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
        <ProfileCard
          body="Profile auth, push alerts, and sync preferences still need to be implemented."
          eyebrow="Next phase"
          title="Next Settings Work"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxs,
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.xxs,
    marginTop: 2,
  },
  statCard: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  statCardHighlight: {
    backgroundColor: palette.highlight,
    borderColor: palette.highlight,
  },
  statValue: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 18,
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
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cardHighlight: {
    borderColor: palette.borderStrong,
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
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  cardBodyHighlight: {
    color: palette.highlight,
  },
});
