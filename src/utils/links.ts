import { Alert, Linking } from 'react-native';

import type { RestaurantLocation } from '@/src/types/restaurant';

type RestaurantDirectionsTarget = Pick<
  RestaurantLocation,
  'name' | 'address' | 'city' | 'state' | 'googlePlaceUrl' | 'directionsUrl'
>;

function hasUsableHttpUrl(rawUrl: string) {
  if (!rawUrl) {
    return false;
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function fullAddressForDirections(target: RestaurantDirectionsTarget) {
  return [target.address, target.city, target.state]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');
}

function searchQueryForDirections(target: RestaurantDirectionsTarget) {
  return [target.name, target.city, target.state]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');
}

export function getRestaurantDirectionsUrl(target: RestaurantDirectionsTarget) {
  const googlePlaceUrl = target.googlePlaceUrl.trim();
  if (hasUsableHttpUrl(googlePlaceUrl)) {
    return googlePlaceUrl;
  }

  const directionsUrl = target.directionsUrl.trim();
  if (hasUsableHttpUrl(directionsUrl)) {
    return directionsUrl;
  }

  const destination = fullAddressForDirections(target);
  if (destination) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }

  const query = searchQueryForDirections(target);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || target.name.trim())}`;
}

export async function openExternalUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open link', 'Please try again in a moment.');
  }
}

export async function openRestaurantDirections(target: RestaurantDirectionsTarget) {
  await openExternalUrl(getRestaurantDirectionsUrl(target));
}
