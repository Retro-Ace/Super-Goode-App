import type { Restaurant } from '@/src/types/restaurant';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapRegion = MapCoordinate & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export const DEFAULT_MAP_REGION: MapRegion = {
  latitude: 41.88,
  longitude: -88.08,
  latitudeDelta: 1.32,
  longitudeDelta: 1.28,
};

export function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function getRestaurantCoordinate(restaurant: Restaurant): MapCoordinate | null {
  if (!isValidCoordinate(restaurant.lat, restaurant.lng)) {
    return null;
  }

  return {
    latitude: restaurant.lat,
    longitude: restaurant.lng,
  };
}

export function hasRestaurantCoordinate(restaurant: Restaurant) {
  return getRestaurantCoordinate(restaurant) !== null;
}

export function buildRegionFromCoordinate(
  coordinate: MapCoordinate,
  latitudeDelta = 0.08,
  longitudeDelta = 0.08
): MapRegion {
  return {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta,
    longitudeDelta,
  };
}

export function buildRegionFromRestaurants(restaurants: Restaurant[]) {
  const coordinates = restaurants
    .map(getRestaurantCoordinate)
    .filter((coordinate): coordinate is MapCoordinate => coordinate !== null);

  if (coordinates.length === 0) {
    return DEFAULT_MAP_REGION;
  }

  if (coordinates.length === 1) {
    return buildRegionFromCoordinate(coordinates[0]);
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.35, 0.08),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.35, 0.08),
  };
}

export function calculateDistanceMiles(from: MapCoordinate, to: MapCoordinate) {
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = degreesToRadians(to.latitude - from.latitude);
  const longitudeDelta = degreesToRadians(to.longitude - from.longitude);
  const startLatitude = degreesToRadians(from.latitude);
  const endLatitude = degreesToRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}
