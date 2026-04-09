import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  elevation,
  getScoreTier,
  palette,
  radii,
  scoreTierPalette,
  spacing,
  typography,
} from '@/src/constants/theme';
import type { Restaurant } from '@/src/types/restaurant';
import { hasRestaurantCoordinate } from '@/src/utils/map';
import { formatScore } from '@/src/utils/restaurants';

type MapPreviewProps = {
  restaurants: Restaurant[];
  onSelectRestaurant: (id: string) => void;
};

export function MapPreview({ restaurants, onSelectRestaurant }: MapPreviewProps) {
  const mappableRestaurants = restaurants.filter(hasRestaurantCoordinate);
  const plottedRestaurants = mappableRestaurants.slice(0, 80);
  const latitudes = plottedRestaurants.map((restaurant) => restaurant.lat).filter((value): value is number => value !== null);
  const longitudes = plottedRestaurants.map((restaurant) => restaurant.lng).filter((value): value is number => value !== null);

  const minLat = latitudes.length > 0 ? Math.min(...latitudes) : 0;
  const maxLat = latitudes.length > 0 ? Math.max(...latitudes) : 0;
  const minLng = longitudes.length > 0 ? Math.min(...longitudes) : 0;
  const maxLng = longitudes.length > 0 ? Math.max(...longitudes) : 0;
  const leadingRestaurants = restaurants.slice(0, 3);

  return (
    <View style={[styles.shell, elevation.card]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Map pulse</Text>
          <Text style={styles.title}>Chicago-area hits</Text>
        </View>
      </View>
      <View style={styles.mapFrame}>
        <View style={styles.gridVertical} />
        <View style={styles.gridHorizontal} />
        <View style={[styles.glow, styles.glowLarge]} />
        <View style={[styles.glow, styles.glowSmall]} />
        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeValue}>{restaurants.length}</Text>
          <Text style={styles.mapBadgeLabel}>Spots in view</Text>
        </View>
        {plottedRestaurants.map((restaurant) => {
          if (restaurant.lat === null || restaurant.lng === null) {
            return null;
          }

          const top = maxLat === minLat ? 50 : 14 + ((maxLat - restaurant.lat) / (maxLat - minLat)) * 72;
          const left = maxLng === minLng ? 50 : 8 + ((restaurant.lng - minLng) / (maxLng - minLng)) * 84;
          const size = restaurant.score >= 9 ? 14 : restaurant.score >= 8.5 ? 11 : 8;
          const dotTone = scoreTierPalette[getScoreTier(restaurant.score)].marker;

          return (
            <Pressable
              key={restaurant.id}
              onPress={() => onSelectRestaurant(restaurant.id)}
              style={[
                styles.dot,
                { backgroundColor: dotTone },
                {
                  height: size,
                  left: `${left}%`,
                  top: `${top}%`,
                  width: size,
                },
              ]}
            />
          );
        })}
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Top right now</Text>
          {leadingRestaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              onPress={() => onSelectRestaurant(restaurant.id)}
              style={styles.legendRow}>
              <View style={styles.legendMarker} />
              <Text numberOfLines={1} style={styles.legendText}>
                {restaurant.name}
              </Text>
              <Text style={styles.legendScore}>{formatScore(restaurant.score)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerCopy: {
    gap: spacing.xxs,
  },
  eyebrow: {
    color: palette.textDim,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 20,
    letterSpacing: -0.5,
  },
  mapFrame: {
    backgroundColor: '#120B24',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  mapBadge: {
    backgroundColor: 'rgba(17, 10, 32, 0.9)',
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    zIndex: 2,
  },
  mapBadgeValue: {
    color: palette.highlight,
    fontFamily: typography.bodyBold,
    fontSize: 22,
    lineHeight: 22,
  },
  mapBadgeLabel: {
    color: palette.textMuted,
    fontFamily: typography.label,
    fontSize: 11,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
  },
  gridVertical: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 0,
    left: '50%',
    position: 'absolute',
    top: 0,
    width: 1,
  },
  gridHorizontal: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: '50%',
  },
  glow: {
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    opacity: 0.16,
    position: 'absolute',
  },
  glowLarge: {
    height: 200,
    left: -50,
    top: -35,
    width: 200,
  },
  glowSmall: {
    backgroundColor: palette.highlight,
    height: 120,
    right: -25,
    top: 80,
    width: 120,
  },
  dot: {
    borderColor: palette.background,
    borderRadius: radii.pill,
    borderWidth: 2,
    position: 'absolute',
  },
  legend: {
    backgroundColor: 'rgba(8, 5, 18, 0.82)',
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    bottom: spacing.md,
    left: spacing.md,
    padding: spacing.sm,
    position: 'absolute',
    right: spacing.md,
  },
  legendLabel: {
    color: palette.textMuted,
    fontFamily: typography.brand,
    fontSize: 12,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  legendMarker: {
    backgroundColor: palette.highlight,
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  legendText: {
    color: palette.text,
    fontFamily: typography.bodyMedium,
    flex: 1,
    fontSize: 13,
  },
  legendScore: {
    color: palette.highlight,
    fontFamily: typography.bodyBold,
    fontSize: 13,
  },
});
