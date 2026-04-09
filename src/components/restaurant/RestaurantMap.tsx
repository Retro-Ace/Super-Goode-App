import type MapView from 'react-native-maps';
import { forwardRef, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

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
import {
  getRestaurantCoordinate,
  type MapCoordinate,
  type MapRegion,
} from '@/src/utils/map';

type RestaurantMapProps = {
  restaurants: Restaurant[];
  initialRegion: MapRegion;
  onRegionChangeComplete?: (region: MapRegion) => void;
  selectedRestaurantId: string | null;
  userLocation: MapCoordinate | null;
  onDeselectRestaurant: () => void;
  onSelectRestaurant: (id: string) => void;
};

function getMarkerColor(score: number) {
  return scoreTierPalette[getScoreTier(score)].marker;
}

export const RestaurantMap = forwardRef<MapView, RestaurantMapProps>(function RestaurantMap(
  {
    restaurants,
    initialRegion,
    onRegionChangeComplete,
    selectedRestaurantId,
    userLocation,
    onDeselectRestaurant,
    onSelectRestaurant,
  },
  ref
) {
  const markerPressInFlight = useRef(false);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, elevation.card]}>
        <Text style={styles.webEyebrow}>Native map</Text>
        <Text style={styles.webTitle}>Map rendering is available on iPhone and Android.</Text>
        <Text style={styles.webCopy}>{restaurants.length} restaurants are ready to plot in the native app.</Text>
      </View>
    );
  }

  const NativeMaps = require('react-native-maps') as typeof import('react-native-maps');
  const NativeMapView = NativeMaps.default;
  const Marker = NativeMaps.Marker;

  function handleMapPress() {
    if (markerPressInFlight.current) {
      markerPressInFlight.current = false;
      return;
    }

    onDeselectRestaurant();
  }

  function handleMarkerSelect(id: string) {
    markerPressInFlight.current = true;
    onSelectRestaurant(id);

    setTimeout(() => {
      markerPressInFlight.current = false;
    }, 160);
  }

  return (
    <View style={styles.shell}>
      <NativeMapView
        initialRegion={initialRegion}
        loadingEnabled
        mapPadding={{ bottom: 24, left: 0, right: 0, top: 0 }}
        moveOnMarkerPress={false}
        onPress={handleMapPress}
        onRegionChangeComplete={onRegionChangeComplete}
        ref={ref}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={Boolean(userLocation)}
        style={styles.map}
        toolbarEnabled={false}>
        {restaurants.map((restaurant) => {
          const coordinate = getRestaurantCoordinate(restaurant);

          if (!coordinate) {
            return null;
          }

          const selected = restaurant.id === selectedRestaurantId;

          return (
            <Marker
              coordinate={coordinate}
              key={restaurant.id}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => handleMarkerSelect(restaurant.id)}
              onSelect={() => handleMarkerSelect(restaurant.id)}
              tracksViewChanges={false}>
              <View style={styles.markerTouchTarget}>
                <View
                  style={[
                    styles.markerDot,
                    { backgroundColor: getMarkerColor(restaurant.score) },
                    selected ? styles.markerDotSelected : undefined,
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </NativeMapView>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    flex: 1,
  },
  markerTouchTarget: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  markerDot: {
    borderColor: 'rgba(15, 10, 28, 0.82)',
    borderRadius: radii.pill,
    borderWidth: 2.5,
    height: 14,
    width: 14,
  },
  markerDotSelected: {
    borderColor: palette.white,
    height: 20,
    width: 20,
  },
  webFallback: {
    alignItems: 'center',
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    margin: spacing.md,
    padding: spacing.xl,
  },
  webEyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  webTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 20,
    textAlign: 'center',
  },
  webCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
