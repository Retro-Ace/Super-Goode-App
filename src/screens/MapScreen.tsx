import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';

import { ActionButton } from '@/src/components/common/ActionButton';
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

const TAB_BAR_OFFSET = Platform.select({ ios: 18, default: 14 }) ?? 14;

export default function MapScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const mapRef = useRef<MapView | null>(null);
  const currentRegionRef = useRef<Region | null>(null);
  const hasFittedInitialRegion = useRef(false);
  const { restaurants, isLoading, error } = useRestaurants();
  const { canAskAgain, isLocating, locationError, permissionStatus, requestUserLocation, userLocation } =
    useForegroundLocation();
  const [query, setQuery] = useState('');
  const [minimumScore, setMinimumScore] = useState<number | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const filteredRestaurants = filterRestaurants(restaurants, { query, minimumScore });
  const mappedRestaurants = filteredRestaurants.filter(hasRestaurantCoordinate);
  const fallbackRestaurants = restaurants.filter(hasRestaurantCoordinate);
  const initialRegion = buildRegionFromRestaurants(
    mappedRestaurants.length > 0 ? mappedRestaurants : fallbackRestaurants
  );
  const selectedRestaurant =
    mappedRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
  const filtersDirty = query.trim().length > 0 || minimumScore !== null;
  const bottomOverlayOffset = tabBarHeight + TAB_BAR_OFFSET + spacing.sm;
  const locationReadyLabel =
    permissionStatus === 'granted'
      ? 'On'
      : canAskAgain
        ? 'Enable'
        : 'Off';

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
        top: 132,
        right: 36,
        bottom: 170,
        left: 36,
      },
    });
  }, [mappedRestaurants]);

  useEffect(() => {
    if (!selectedRestaurantId || !mapRef.current) {
      return;
    }

    const coordinate = selectedRestaurant ? getRestaurantCoordinate(selectedRestaurant) : null;

    if (!coordinate) {
      return;
    }

    const fallbackRegion = buildRegionFromCoordinate(coordinate, 0.08, 0.08);
    const baseRegion = currentRegionRef.current ?? fallbackRegion;
    const latitudeDelta = baseRegion.latitudeDelta || fallbackRegion.latitudeDelta;
    const longitudeDelta = baseRegion.longitudeDelta || fallbackRegion.longitudeDelta;
    const latitudeOffset = Math.max(latitudeDelta * 0.16, 0.0038);

    mapRef.current.animateToRegion(
      {
        latitude: coordinate.latitude - latitudeOffset,
        longitude: coordinate.longitude,
        latitudeDelta,
        longitudeDelta,
      },
      280
    );
  }, [selectedRestaurant, selectedRestaurantId]);

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
        top: 132,
        right: 36,
        bottom: 170,
        left: 36,
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
                      setMinimumScore(null);
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
              onRegionChangeComplete={(region) => {
                currentRegionRef.current = region;
              }}
              onSelectRestaurant={setSelectedRestaurantId}
              ref={mapRef}
              restaurants={mappedRestaurants}
              selectedRestaurantId={selectedRestaurantId}
              userLocation={userLocation}
            />

            <View pointerEvents="box-none" style={styles.overlay}>
              <View style={styles.topStack}>
                <View style={[styles.brandBar, elevation.card]}>
                  <View style={styles.brandCopy}>
                    <Text style={styles.brandTitle}>SUPER GOODE MAP</Text>
                    <Text style={styles.brandSubtitle}>Live map of the current restaurant feed.</Text>
                  </View>
                  <View style={styles.brandStats}>
                    <View style={styles.badgePill}>
                      <Ionicons color={palette.highlight} name="location" size={12} />
                      <Text style={styles.badgeText}>{mappedRestaurants.length}</Text>
                    </View>
                    <View style={styles.badgePill}>
                      <Ionicons color={palette.white} name="navigate" size={12} />
                      <Text style={styles.badgeText}>
                        {isLocating ? '...' : locationReadyLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.controlsBar, elevation.card]}>
                  <SearchBar onChangeText={setQuery} placeholder="Search restaurants..." value={query} />
                  <ScoreFilter onChange={setMinimumScore} selectedScore={minimumScore} />
                  {(error || locationError) ? (
                    <Text style={styles.inlineError}>{error ? `Feed issue: ${error}` : locationError}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.utilityRail}>
                <Pressable
                  onPress={fitToRestaurants}
                  style={({ pressed }) => [styles.mapButton, pressed ? styles.pressed : undefined]}>
                  <Ionicons color={palette.white} name="scan" size={18} />
                </Pressable>
                <Pressable
                  onPress={centerOnUser}
                  style={({ pressed }) => [styles.mapButton, styles.mapButtonAccent, pressed ? styles.pressed : undefined]}>
                  <Ionicons color={palette.white} name="locate" size={18} />
                </Pressable>
              </View>

              <View style={[styles.bottomStack, { paddingBottom: bottomOverlayOffset }]}>
                {selectedRestaurant ? (
                  <View style={[styles.selectedCard, elevation.floating]}>
                    <View style={styles.selectedHeader}>
                      <View style={styles.selectedCopy}>
                        <Text numberOfLines={2} style={styles.selectedTitle}>
                          {selectedRestaurant.name}
                        </Text>
                        <Text numberOfLines={1} style={styles.selectedSubtitle}>
                          {selectedRestaurant.subtitle}
                        </Text>
                      </View>
                      <ScorePill score={selectedRestaurant.score} />
                    </View>
                    <View style={styles.selectedInfoBlock}>
                      <Text numberOfLines={2} style={styles.selectedAddress}>
                        {selectedRestaurant.fullAddress}
                      </Text>
                      <Text numberOfLines={1} style={styles.selectedMeta}>
                        {getSelectedMeta(selectedRestaurant)}
                      </Text>
                    </View>
                    <View style={styles.selectedActions}>
                      <ActionButton
                        compact
                        label="Review Video"
                        onPress={() => openExternalUrl(selectedRestaurant.reviewUrl)}
                        variant="primary"
                      />
                      <ActionButton
                        compact
                        label="Directions"
                        onPress={() => openExternalUrl(selectedRestaurant.directionsUrl)}
                        variant="secondary"
                      />
                    </View>
                    <Pressable
                      onPress={() => openRestaurantDetails(selectedRestaurant)}
                      style={({ pressed }) => [
                        styles.selectedDetailsLink,
                        pressed ? styles.pressed : undefined,
                      ]}>
                      <Text style={styles.selectedDetailsText}>Open full restaurant details</Text>
                      <Ionicons color={palette.highlightSoft} name="chevron-forward" size={14} />
                    </Pressable>
                  </View>
                ) : (
                  <View style={[styles.hintCard, elevation.card]}>
                    <Text style={styles.hintCopy}>
                      Tap any colored pin to open the restaurant popup. Gold is 9.0+, purple is 8.0s, blue-gray is
                      7.0s.
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topStack: {
    gap: spacing.xs,
  },
  brandBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 10, 32, 0.78)',
    borderColor: 'rgba(242, 201, 76, 0.24)',
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brandCopy: {
    flex: 1,
    gap: 1,
    paddingRight: spacing.sm,
  },
  brandTitle: {
    color: palette.logoOrange,
    fontFamily: typography.brand,
    fontSize: 17,
    lineHeight: 20,
  },
  brandSubtitle: {
    color: palette.textDim,
    fontSize: 11,
    lineHeight: 14,
  },
  brandStats: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badgePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(36, 24, 74, 0.94)',
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: palette.text,
    fontFamily: typography.brand,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  controlsBar: {
    backgroundColor: 'rgba(17, 10, 32, 0.78)',
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  inlineError: {
    color: palette.highlightSoft,
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: spacing.xs,
  },
  utilityRail: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginTop: 112,
  },
  mapButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 10, 32, 0.82)',
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  mapButtonAccent: {
    backgroundColor: 'rgba(160, 109, 255, 0.92)',
    borderColor: palette.accentStrong,
  },
  bottomStack: {
    gap: spacing.xs,
  },
  selectedCard: {
    backgroundColor: 'rgba(12, 18, 41, 0.94)',
    borderColor: 'rgba(132, 154, 206, 0.28)',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  selectedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectedCopy: {
    flex: 1,
    gap: 4,
  },
  selectedTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  selectedSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  selectedInfoBlock: {
    gap: 4,
  },
  selectedAddress: {
    color: '#D7E0F3',
    fontSize: 13,
    lineHeight: 18,
  },
  selectedMeta: {
    color: '#99A8C6',
    fontSize: 12,
  },
  selectedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedDetailsLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  selectedDetailsText: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  hintCard: {
    backgroundColor: 'rgba(12, 18, 41, 0.82)',
    borderColor: 'rgba(132, 154, 206, 0.22)',
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hintCopy: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 16,
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
