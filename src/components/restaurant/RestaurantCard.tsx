import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/common/ActionButton';
import { FavoriteHeartButton } from '@/src/components/common/FavoriteHeartButton';
import { ScorePill } from '@/src/components/common/ScorePill';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useOpenReviewViewer } from '@/src/hooks/useOpenReviewViewer';
import type { Restaurant } from '@/src/types/restaurant';
import { openRestaurantDirections } from '@/src/utils/links';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const openReviewViewer = useOpenReviewViewer();

  return (
    <View style={[styles.card, elevation.card]}>
      <View style={styles.topRail} />
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={styles.kicker}>
            {restaurant.cityState}
          </Text>
          <Text numberOfLines={2} style={styles.title}>
            {restaurant.name}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {restaurant.subtitle}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ScorePill score={restaurant.score} />
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.address}>
          {restaurant.fullAddress}
        </Text>
      </View>

      <View style={styles.footer}>
        <ActionButton
          compact
          label="Directions"
          onPress={() => openRestaurantDirections(restaurant)}
          variant="secondary"
        />
        <View style={styles.reviewAction}>
          <ActionButton
            compact
            label="Watch Review"
            onPress={() => openReviewViewer(restaurant)}
            variant="primary"
          />
        </View>
      </View>

      <FavoriteHeartButton restaurantId={restaurant.id} style={styles.favoriteButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 4,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    position: 'relative',
  },
  topRail: {
    backgroundColor: palette.highlight,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    minHeight: 0,
  },
  headerCopy: {
    flex: 1,
    gap: 1,
    paddingRight: 74,
  },
  headerActions: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  kicker: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 18,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  subtitle: {
    color: '#C7B3FF',
    fontFamily: typography.bodyBold,
    fontSize: 11.5,
    lineHeight: 13,
  },
  body: {
    gap: 0,
    marginTop: -1,
  },
  address: {
    color: palette.text,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: -2,
    paddingRight: 38,
  },
  reviewAction: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: 168,
    minWidth: 110,
  },
  favoriteButton: {
    bottom: 8,
    position: 'absolute',
    right: spacing.sm,
  },
});
