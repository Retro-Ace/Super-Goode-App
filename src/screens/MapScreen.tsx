import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useOpenReviewViewer } from '@/src/hooks/useOpenReviewViewer';
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

const superGoodeIcon = require('../../assets/images/super-goode-icon.png');

export default function MapScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const mapRef = useRef<MapView | null>(null);
  const currentRegionRef = useRef<Region | null>(null);
  const hasFittedInitialRegion = useRef(false);
  const openReviewViewer = useOpenReviewViewer();
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
  const hasMapData = fallbackRestaurants.length > 0;
  const showZeroResultsHint = filtersDirty && filteredRestaurants.length === 0;
  const bottomOverlayOffset = Math.max(tabBarHeight - spacing.sm, spacing.md);
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
        ) : !hasMapData ? (
          <View style={styles.stateWrap}>
            <EmptyState
              copy="No restaurants in the current feed have usable map coordinates."
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
                    <View style={styles.brandIdentityRow}>
                      <Image source={superGoodeIcon} style={styles.brandIcon} />
                      <View style={styles.brandTextBlock}>
                        <Text style={styles.brandTitle}>SUPER GOODE MAP</Text>
                        <Text style={styles.brandSubtitle}>Live map of the current restaurant feed.</Text>
                      </View>
                    </View>
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
                  {showZeroResultsHint ? (
                    <View style={styles.zeroResultsRow}>
                      <Ionicons color={palette.textDim} name="search" size={14} />
                      <Text style={styles.zeroResultsText}>0 results. Keep typing or clear the search to see pins again.</Text>
                    </View>
                  ) : null}
                  {(error || locationError) ? (
                    <Text style={styles.inlineError}>{error ? `Feed issue: ${error}` : locationError}</Text>
                  ) : null}
                </View>
              </View>

              <View style={[styles.bottomStack, { paddingBottom: bottomOverlayOffset }]}>
                {selectedRestaurant ? (
                  <>
                    <View style={styles.bottomUtilityRow}>
                      <Pressable
                        onPress={fitToRestaurants}
                        style={({ pressed }) => [styles.mapButton, pressed ? styles.pressed : undefined]}>
                        <Ionicons color={palette.white} name="scan" size={18} />
                      </Pressable>
                      <Pressable
                        onPress={centerOnUser}
                        style={({ pressed }) => [
                          styles.mapButton,
                          styles.mapButtonAccent,
                          pressed ? styles.pressed : undefined,
                        ]}>
                        <Ionicons color={palette.white} name="locate" size={18} />
                      </Pressable>
                    </View>
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
                          onPress={() => openReviewViewer(selectedRestaurant)}
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
                  </>
                ) : (
                  <View style={styles.bottomAccessoryRow}>
                    <View style={[styles.legendCard, elevation.card]}>
                      <Text style={styles.legendTitle}>Score tiers</Text>
                      <View style={styles.legendList}>
                        <View style={styles.legendRow}>
                          <View style={[styles.legendDot, styles.legendDotGold]} />
                          <Text style={styles.legendLabel}>9.0 and up</Text>
                        </View>
                        <View style={styles.legendRow}>
                          <View style={[styles.legendDot, styles.legendDotPurple]} />
                          <Text style={styles.legendLabel}>8.0 to 8.9</Text>
                        </View>
                        <View style={styles.legendRow}>
                          <View style={[styles.legendDot, styles.legendDotBlueGray]} />
                          <Text style={styles.legendLabel}>7.0 to 7.9</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.bottomUtilityRow}>
                      <Pressable
                        onPress={fitToRestaurants}
                        style={({ pressed }) => [styles.mapButton, pressed ? styles.pressed : undefined]}>
                        <Ionicons color={palette.white} name="scan" size={18} />
                      </Pressable>
                      <Pressable
                        onPress={centerOnUser}
                        style={({ pressed }) => [
                          styles.mapButton,
                          styles.mapButtonAccent,
                          pressed ? styles.pressed : undefined,
                        ]}>
                        <Ionicons color={palette.white} name="locate" size={18} />
                      </Pressable>
                    </View>
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
    alignItems: 'flex-start',
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
    paddingRight: spacing.sm,
  },
  brandIdentityRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brandTextBlock: {
    flex: 1,
    gap: 3,
    paddingTop: 11,
  },
  brandIcon: {
    borderRadius: radii.pill,
    height: 58,
    marginTop: 1,
    width: 58,
  },
  brandTitle: {
    color: palette.logoOrange,
    fontFamily: typography.brand,
    fontSize: 22,
    lineHeight: 24,
  },
  brandSubtitle: {
    color: palette.textDim,
    fontSize: 12,
    lineHeight: 15,
  },
  brandStats: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.xs,
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
  zeroResultsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  zeroResultsText: {
    color: palette.textDim,
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  mapButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 10, 32, 0.82)',
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  mapButtonAccent: {
    backgroundColor: 'rgba(160, 109, 255, 0.92)',
    borderColor: palette.accentStrong,
  },
  bottomStack: {
    gap: spacing.xs,
  },
  bottomAccessoryRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomUtilityRow: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: -spacing.sm,
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
  legendCard: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(23, 16, 47, 0.95)',
    borderColor: 'rgba(132, 154, 206, 0.28)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 1,
    marginBottom: -spacing.md,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  legendTitle: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  legendList: {
    gap: 1,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  legendDot: {
    borderRadius: radii.pill,
    height: 11,
    width: 11,
  },
  legendDotGold: {
    backgroundColor: palette.highlight,
  },
  legendDotPurple: {
    backgroundColor: palette.accent,
  },
  legendDotBlueGray: {
    backgroundColor: '#A9B4C8',
  },
  legendLabel: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
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
