import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type MapView from 'react-native-maps';

import { ActionButton } from '@/src/components/common/ActionButton';
import { BrandHeader } from '@/src/components/common/BrandHeader';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { ScorePill } from '@/src/components/common/ScorePill';
import { Screen } from '@/src/components/common/Screen';
import { RestaurantMap } from '@/src/components/restaurant/RestaurantMap';
import { ScoreFilter } from '@/src/components/restaurant/ScoreFilter';
import { SearchBar } from '@/src/components/restaurant/SearchBar';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { useForegroundLocation } from '@/src/hooks/useForegroundLocation';
import { useRestaurants } from '@/src/hooks/useRestaurants';
import type { Restaurant } from '@/src/types/restaurant';
import { openExternalUrl } from '@/src/utils/links';
import {
  buildRegionFromCoordinate,
  buildRegionFromRestaurants,
  calculateDistanceMiles,
  getRestaurantCoordinate,
  hasRestaurantCoordinate,
} from '@/src/utils/map';
import { filterRestaurants } from '@/src/utils/restaurants';

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const hasFittedInitialRegion = useRef(false);
  const { restaurants, isLoading, error } = useRestaurants();
  const { canAskAgain, isLocating, locationError, permissionStatus, requestUserLocation, userLocation } =
    useForegroundLocation();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(8);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const filteredRestaurants = filterRestaurants(restaurants, { query, minimumScore });
  const mappedRestaurants = filteredRestaurants.filter(hasRestaurantCoordinate);
  const fallbackRestaurants = restaurants.filter(hasRestaurantCoordinate);
  const initialRegion = buildRegionFromRestaurants(
    mappedRestaurants.length > 0 ? mappedRestaurants : fallbackRestaurants
  );
  const selectedRestaurant =
    mappedRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
  const filtersDirty = query.trim().length > 0 || minimumScore !== 8;
  const locationReadyLabel =
    permissionStatus === 'granted'
      ? 'Location on'
      : canAskAgain
        ? 'Enable location'
        : 'Location off';

  useEffect(() => {
    if (selectedRestaurantId && !mappedRestaurants.some((restaurant) => restaurant.id === selectedRestaurantId)) {
      setSelectedRestaurantId(null);
    }
  }, [mappedRestaurants, selectedRestaurantId]);

  useEffect(() => {
    if (hasFittedInitialRegion.current || mappedRestaurants.length === 0 || !mapRef.current) {
      return;
    }

    const coordinates = mappedRestaurants
      .map(getRestaurantCoordinate)
      .filter((coordinate): coordinate is NonNullable<ReturnType<typeof getRestaurantCoordinate>> => coordinate !== null);

    if (coordinates.length === 0) {
      return;
    }

    hasFittedInitialRegion.current = true;

    if (coordinates.length === 1) {
      mapRef.current.animateToRegion(buildRegionFromCoordinate(coordinates[0]), 400);
      return;
    }

    mapRef.current.fitToCoordinates(coordinates, {
      animated: true,
      edgePadding: {
        top: 180,
        right: 48,
        bottom: 220,
        left: 48,
      },
    });
  }, [mappedRestaurants]);

  function openRestaurantDetails(restaurant: Restaurant) {
    router.push({
      pathname: '/restaurant/[id]',
      params: { id: restaurant.id },
    });
  }

  function centerOnUser() {
    void requestUserLocation().then((coordinate) => {
      if (!coordinate || !mapRef.current) {
        return;
      }

      mapRef.current.animateToRegion(buildRegionFromCoordinate(coordinate, 0.06, 0.06), 400);
    });
  }

  function fitToRestaurants() {
    const coordinates = mappedRestaurants
      .map(getRestaurantCoordinate)
      .filter((coordinate): coordinate is NonNullable<ReturnType<typeof getRestaurantCoordinate>> => coordinate !== null);

    if (coordinates.length === 0 || !mapRef.current) {
      return;
    }

    if (coordinates.length === 1) {
      mapRef.current.animateToRegion(buildRegionFromCoordinate(coordinates[0]), 400);
      return;
    }

    mapRef.current.fitToCoordinates(coordinates, {
      animated: true,
      edgePadding: {
        top: 180,
        right: 48,
        bottom: 220,
        left: 48,
      },
    });
  }

  function getSelectedMeta(restaurant: Restaurant) {
    const coordinate = getRestaurantCoordinate(restaurant);

    if (userLocation && coordinate) {
      const miles = calculateDistanceMiles(userLocation, coordinate);
      return `${miles.toFixed(1)} mi away`;
    }

    return restaurant.cityState;
  }

  return (
    <Screen includeBottomInset>
      <View style={styles.root}>
        {isLoading ? (
          <View style={styles.stateWrap}>
            <LoadingState
              copy="Pulling the current Super Goode seed into the native map shell."
              title="Loading the map..."
            />
          </View>
        ) : mappedRestaurants.length === 0 ? (
          <View style={styles.stateWrap}>
            <EmptyState
              actionLabel={filtersDirty ? 'Reset filters' : undefined}
              copy={
                filtersDirty
                  ? 'Try a broader search or lower the score floor to repopulate the map.'
                  : 'No restaurants in the current feed have usable map coordinates.'
              }
              onActionPress={
                filtersDirty
                  ? () => {
                      setQuery('');
                      setMinimumScore(8);
                    }
                  : undefined
              }
              title="No map pins to show"
            />
          </View>
        ) : (
          <>
            <RestaurantMap
              initialRegion={initialRegion}
              onDeselectRestaurant={() => setSelectedRestaurantId(null)}
              onSelectRestaurant={setSelectedRestaurantId}
              ref={mapRef}
              restaurants={mappedRestaurants}
              selectedRestaurantId={selectedRestaurantId}
              userLocation={userLocation}
            />

            <View pointerEvents="box-none" style={styles.overlay}>
              <View style={styles.topStack}>
                <BrandHeader
                  compact
                  subtitle="Map-first discovery with live pins from the shared Super Goode feed."
                />

                <View style={[styles.controlsCard, elevation.card]}>
                  <SearchBar onChangeText={setQuery} placeholder="Search restaurants..." value={query} />
                  <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
                  <View style={styles.statusRow}>
                    <View style={styles.statusChip}>
                      <Ionicons color={palette.highlight} name="location" size={14} />
                      <Text style={styles.statusText}>{mappedRestaurants.length} pins</Text>
                    </View>
                    <Pressable
                      onPress={centerOnUser}
                      style={({ pressed }) => [
                        styles.statusChip,
                        styles.statusChipAction,
                        pressed ? styles.pressed : undefined,
                      ]}>
                      <Ionicons color={palette.white} name="navigate" size={14} />
                      <Text style={styles.statusActionText}>
                        {isLocating ? 'Locating...' : locationReadyLabel}
                      </Text>
                    </Pressable>
                  </View>
                  {error ? (
                    <Text style={styles.inlineError}>Feed issue: {error}</Text>
                  ) : null}
                  {locationError ? <Text style={styles.inlineError}>{locationError}</Text> : null}
                </View>
              </View>

              <View style={styles.floatingButtons}>
                <Pressable
                  onPress={fitToRestaurants}
                  style={({ pressed }) => [styles.mapButton, pressed ? styles.pressed : undefined]}>
                  <Ionicons color={palette.white} name="expand" size={18} />
                </Pressable>
                <Pressable
                  onPress={centerOnUser}
                  style={({ pressed }) => [styles.mapButton, pressed ? styles.pressed : undefined]}>
                  <Ionicons color={palette.white} name="locate" size={18} />
                </Pressable>
              </View>

              <View style={styles.bottomStack}>
                {selectedRestaurant ? (
                  <View style={[styles.selectedCard, elevation.floating]}>
                    <View style={styles.selectedHeader}>
                      <View style={styles.selectedCopy}>
                        <Text numberOfLines={1} style={styles.selectedTitle}>
                          {selectedRestaurant.name}
                        </Text>
                        <Text numberOfLines={1} style={styles.selectedMeta}>
                          {selectedRestaurant.subtitle}
                        </Text>
                        <Text style={styles.selectedMetaSecondary}>{getSelectedMeta(selectedRestaurant)}</Text>
                      </View>
                      <ScorePill score={selectedRestaurant.score} />
                    </View>
                    <View style={styles.selectedActions}>
                      <ActionButton
                        compact
                        label="Details"
                        onPress={() => openRestaurantDetails(selectedRestaurant)}
                        variant="primary"
                      />
                      <ActionButton
                        compact
                        label="Directions"
                        onPress={() => openExternalUrl(selectedRestaurant.directionsUrl)}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.hintCard, elevation.card]}>
                    <Text style={styles.hintEyebrow}>Map tab</Text>
                    <Text style={styles.hintCopy}>
                      Tap a pin to open a spot. Use locate to center on yourself and scan nearby places.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  topStack: {
    gap: spacing.sm,
  },
  controlsCard: {
    backgroundColor: 'rgba(23, 16, 47, 0.94)',
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusChip: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusChipAction: {
    backgroundColor: palette.accent,
    flex: 1,
    justifyContent: 'center',
  },
  statusText: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statusActionText: {
    color: palette.white,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  inlineError: {
    color: palette.highlightSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  floatingButtons: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: 140,
  },
  mapButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 10, 32, 0.94)',
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bottomStack: {
    gap: spacing.sm,
  },
  selectedCard: {
    backgroundColor: 'rgba(17, 10, 32, 0.95)',
    borderColor: palette.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  selectedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectedCopy: {
    flex: 1,
    gap: 2,
  },
  selectedTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  selectedMeta: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  selectedMetaSecondary: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
  },
  selectedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hintCard: {
    backgroundColor: 'rgba(17, 10, 32, 0.92)',
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  hintEyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  hintCopy: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.84,
  },
});
