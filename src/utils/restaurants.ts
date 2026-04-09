import type { Restaurant, RestaurantFilters, RestaurantRecord } from '@/src/types/restaurant';
import { normalizeReviewUrl } from '@/src/utils/reviews';

export const scoreFilterOptions: Array<{ label: string; minimumScore: number | null }> = [
  { label: 'All', minimumScore: null },
  { label: '9.0+', minimumScore: 9 },
  { label: '8.5+', minimumScore: 8.5 },
  { label: '8.0+', minimumScore: 8 },
  { label: '7.5+', minimumScore: 7.5 },
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function createRestaurantId(record: RestaurantRecord) {
  return slugify(`${record.name}-${record.city}-${record.state}-${record.address}`);
}

export function formatScore(score: number) {
  return score.toFixed(1);
}

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function compactSearchText(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

export function normalizeRestaurant(record: RestaurantRecord): Restaurant {
  const cityState = `${record.city}, ${record.state}`;
  const trimmedAddress = record.address.trim();
  const fullAddress = trimmedAddress ? `${trimmedAddress}, ${cityState}` : cityState;
  const googlePlaceUrl = record.googlePlaceUrl.trim();
  const directionsUrl = record.directionsUrl.trim();
  const reviewUrl = normalizeReviewUrl(record.reviewUrl) ?? record.reviewUrl.trim();
  const searchableSource = [
    record.name,
    record.subtitle,
    record.address,
    record.city,
    record.state,
    record.notes,
  ].join(' ');
  const normalizedSearchableText = normalizeSearchText(searchableSource);
  const compactedSearchableText = compactSearchText(searchableSource);

  return {
    ...record,
    id: createRestaurantId(record),
    cityState,
    fullAddress,
    googlePlaceUrl,
    directionsUrl,
    reviewUrl,
    searchableText: `${normalizedSearchableText} ${compactedSearchableText}`.trim(),
  };
}

export function sortRestaurants(restaurants: Restaurant[]) {
  return [...restaurants].sort((left, right) => right.score - left.score);
}

type RestaurantFeedValidationResult = {
  records: RestaurantRecord[];
  totalCount: number;
  invalidCount: number;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getRequiredString(value: unknown) {
  const normalized = getString(value);
  return normalized.length > 0 ? normalized : null;
}

function getFiniteNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getCoordinateValue(value: unknown) {
  if (value === null || value === undefined) {
    return {
      value: null,
      isValid: true,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      value: null,
      isValid: true,
    };
  }

  const parsed = getFiniteNumber(value);

  return {
    value: parsed,
    isValid: parsed !== null,
  };
}

function extractFeedEntries(data: unknown) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isPlainObject(data)) {
    return null;
  }

  if (Array.isArray(data.locations)) {
    return data.locations;
  }

  if (Array.isArray(data.restaurants)) {
    return data.restaurants;
  }

  return null;
}

function parseRestaurantRecord(value: unknown): RestaurantRecord | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const name = getRequiredString(value.name);
  const subtitle = getString(value.subtitle);
  const address = getString(value.address);
  const city = getRequiredString(value.city);
  const state = getRequiredString(value.state);
  const googlePlaceUrl = getString(value.googlePlaceUrl);
  const directionsUrl = getString(value.directionsUrl);
  const reviewUrl = getRequiredString(value.reviewUrl);
  const score = getFiniteNumber(value.score);
  const latResult = getCoordinateValue(value.lat);
  const lngResult = getCoordinateValue(value.lng);
  const lat = latResult.value;
  const lng = lngResult.value;

  if (
    !name ||
    !city ||
    !state ||
    !reviewUrl ||
    score === null ||
    !latResult.isValid ||
    !lngResult.isValid
  ) {
    return null;
  }

  const hasLat = lat !== null;
  const hasLng = lng !== null;

  if (hasLat !== hasLng) {
    return null;
  }

  if (
    score < 0 ||
    score > 10 ||
    (lat !== null && (lat < -90 || lat > 90)) ||
    (lng !== null && (lng < -180 || lng > 180))
  ) {
    return null;
  }

  return {
    name,
    score,
    subtitle,
    address,
    city,
    state,
    lat,
    lng,
    googlePlaceUrl,
    directionsUrl,
    reviewUrl,
    sourceType: getRequiredString(value.sourceType) ?? 'unknown',
    confidence: getRequiredString(value.confidence) ?? 'medium',
    notes: getString(value.notes),
  };
}

export function validateRestaurantFeed(data: unknown): RestaurantFeedValidationResult {
  const entries = extractFeedEntries(data);

  if (!entries) {
    return {
      records: [],
      totalCount: 0,
      invalidCount: 0,
    };
  }

  const records = entries
    .map(parseRestaurantRecord)
    .filter((record): record is RestaurantRecord => record !== null);

  return {
    records,
    totalCount: entries.length,
    invalidCount: entries.length - records.length,
  };
}

export function filterRestaurants(restaurants: Restaurant[], filters: RestaurantFilters) {
  const normalizedQuery = normalizeSearchText(filters.query);
  const compactQuery = compactSearchText(filters.query);

  return restaurants.filter((restaurant) => {
    const meetsScore =
      filters.minimumScore === null || restaurant.score >= filters.minimumScore;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      restaurant.searchableText.includes(normalizedQuery) ||
      (compactQuery.length > 0 && restaurant.searchableText.includes(compactQuery));

    return meetsScore && matchesQuery;
  });
}
