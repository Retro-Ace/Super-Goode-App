import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

import type { MapCoordinate } from '@/src/utils/map';

type LocationPermissionState = Location.PermissionStatus | 'unavailable';

export function useForegroundLocation() {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>(
    Location.PermissionStatus.UNDETERMINED
  );
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<MapCoordinate | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  async function requestUserLocation() {
    if (Platform.OS === 'web') {
      setPermissionStatus('unavailable');
      setLocationError('Device location is currently available only on iPhone and Android.');
      return null;
    }

    setIsLocating(true);
    setLocationError(null);

    try {
      let permission = await Location.getForegroundPermissionsAsync();

      if (!permission.granted) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      setPermissionStatus(permission.status);
      setCanAskAgain(permission.canAskAgain);

      if (!permission.granted) {
        setLocationError(
          permission.canAskAgain
            ? 'Location permission is needed to center the map on you.'
            : 'Location permission is off. Enable it in device settings to center on your position.'
        );
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(coordinate);
      return coordinate;
    } catch {
      setLocationError('Unable to get your current location right now.');
      return null;
    } finally {
      setIsLocating(false);
    }
  }

  useEffect(() => {
    void requestUserLocation();
  }, []);

  return {
    canAskAgain,
    isLocating,
    locationError,
    permissionStatus,
    requestUserLocation,
    userLocation,
  };
}
