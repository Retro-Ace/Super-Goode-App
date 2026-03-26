import type MapView from 'react-native-maps';
import { forwardRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import type { Restaurant } from '@/src/types/restaurant';
import {
  getRestaurantCoordinate,
  type MapCoordinate,
  type MapRegion,
} from '@/src/utils/map';

type RestaurantMapProps = {
  restaurants: Restaurant[];
  initialRegion: MapRegion;
  selectedRestaurantId: string | null;
  userLocation: MapCoordinate | null;
  onDeselectRestaurant: () => void;
  onSelectRestaurant: (id: string) => void;
};

export const RestaurantMap = forwardRef<MapView, RestaurantMapProps>(function RestaurantMap(
  { restaurants, initialRegion, selectedRestaurantId, userLocation, onDeselectRestaurant, onSelectRestaurant },
  ref
) {
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

  return (
    <View style={styles.shell}>
      <NativeMapView
        initialRegion={initialRegion}
        loadingEnabled
        mapPadding={{ bottom: 24, left: 0, right: 0, top: 0 }}
        moveOnMarkerPress={false}
        onPress={onDeselectRestaurant}
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
              onPress={() => onSelectRestaurant(restaurant.id)}
              tracksViewChanges={false}>
              <View style={[styles.markerDot, selected ? styles.markerDotSelected : undefined]} />
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
  markerDot: {
    backgroundColor: palette.accent,
    borderColor: palette.white,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  markerDotSelected: {
    backgroundColor: palette.highlight,
    borderColor: palette.background,
    height: 18,
    width: 18,
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
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  webCopy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
