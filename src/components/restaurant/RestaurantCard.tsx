import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/common/ActionButton';
import { ScorePill } from '@/src/components/common/ScorePill';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useFavorites } from '@/src/providers/FavoritesProvider';
import type { Restaurant } from '@/src/types/restaurant';
import { openExternalUrl } from '@/src/utils/links';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(restaurant.id);

  function openDetails() {
    router.push({
      pathname: '/restaurant/[id]',
      params: { id: restaurant.id },
    });
  }

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

      <Pressable onPress={openDetails} style={({ pressed }) => [styles.body, pressed ? styles.pressed : undefined]}>
        <Text numberOfLines={1} style={styles.address}>
          {restaurant.fullAddress}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <ActionButton compact label="Directions" onPress={() => openExternalUrl(restaurant.directionsUrl)} />
        <View style={styles.reviewAction}>
          <ActionButton
            compact
            label="Watch Review"
            onPress={() => openExternalUrl(restaurant.reviewUrl)}
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
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.sm,
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
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  kicker: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 17,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  body: {
    gap: spacing.xs,
  },
  address: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  reviewAction: {
    flex: 1,
    minWidth: 120,
  },
  pressed: {
    opacity: 0.84,
  },
});
