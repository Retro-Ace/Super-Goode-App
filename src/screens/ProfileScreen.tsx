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
  const { restaurants } = useRestaurants();
  const cityCount = new Set(restaurants.map((restaurant) => restaurant.cityState)).size;

  return (
    <Screen includeBottomInset>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, elevation.floating]}>
          <BrandArt align="center" height={148} variant="full" width={232} />
          <Text style={styles.copy}>
            Settings runway for feed mode, local saves, and future account preferences, wrapped in the same design system as the discovery tabs.
          </Text>
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
          eyebrow="Settings runway"
          title="Data and account status"
          copy="Small, reusable cards so future auth and preferences can slot in without rethinking the visual language."
        />

        <ProfileCard
          body={locationsFeedUrl ? 'Remote JSON feed active' : 'Local seeded JSON active'}
          eyebrow="Feed mode"
          tone="highlight"
          title="Data Mode"
        />
        <ProfileCard
          body="Set EXPO_PUBLIC_LOCATIONS_FEED_URL later to switch the repository from local seed to live feed."
          eyebrow="Feed wiring"
          title="Remote Feed Ready"
        />
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
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  copy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    fontSize: 22,
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
