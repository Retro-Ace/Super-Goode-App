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
          <Text numberOfLines={2} style={styles.subtitle}>
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
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaTag}>{restaurant.confidence}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaTag}>{restaurant.sourceType}</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.address}>
          {restaurant.address}
        </Text>
        {restaurant.notes ? (
          <View style={styles.noteWrap}>
            <Text numberOfLines={2} style={styles.notes}>
              {restaurant.notes}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.primaryAction}>
        <ActionButton label="Details" onPress={openDetails} variant="primary" />
      </View>
      <View style={styles.footer}>
        <View style={styles.footerSlot}>
          <ActionButton label="Directions" onPress={() => openExternalUrl(restaurant.directionsUrl)} />
        </View>
        <View style={styles.footerSlot}>
          <ActionButton
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
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
    position: 'relative',
  },
  topRail: {
    backgroundColor: palette.highlight,
    height: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  kicker: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 26,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  body: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  metaTag: {
    color: palette.textDim,
    fontSize: 12,
    fontFamily: typography.brand,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  address: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  noteWrap: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  notes: {
    color: palette.warning,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryAction: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerSlot: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
  },
});
