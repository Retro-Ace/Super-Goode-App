import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/common/ActionButton';
import { ScorePill } from '@/src/components/common/ScorePill';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useOpenReviewViewer } from '@/src/hooks/useOpenReviewViewer';
import { useFavorites } from '@/src/providers/FavoritesProvider';
import type { Restaurant } from '@/src/types/restaurant';
import { openRestaurantDirections } from '@/src/utils/links';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const openReviewViewer = useOpenReviewViewer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(restaurant.id);

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
          <Pressable
            accessibilityRole="button"
            onPress={() => toggleFavorite(restaurant.id)}
            style={({ pressed }) => [styles.favoriteButton, pressed ? styles.pressed : undefined]}>
            <Ionicons
              color={favorite ? palette.highlight : palette.textMuted}
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.address}>
          {restaurant.fullAddress}
        </Text>
      </View>

      <View style={styles.footer}>
        <ActionButton compact label="Directions" onPress={() => openRestaurantDirections(restaurant)} />
        <View style={styles.reviewAction}>
          <ActionButton
            compact
            label="Watch Review"
            onPress={() => openReviewViewer(restaurant)}
            variant="ghost"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
    gap: spacing.xs,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 4,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 15,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  body: {
    gap: 0,
  },
  address: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reviewAction: {
    flex: 1,
    minWidth: 120,
  },
  pressed: {
    opacity: 0.84,
  },
});
