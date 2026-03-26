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

export function normalizeRestaurant(record: RestaurantRecord): Restaurant {
  const cityState = `${record.city}, ${record.state}`;
  const fullAddress = `${record.address}, ${cityState}`;
  const reviewUrl = normalizeReviewUrl(record.reviewUrl) ?? record.reviewUrl.trim();

  return {
    ...record,
    id: createRestaurantId(record),
    cityState,
    fullAddress,
    reviewUrl,
    searchableText: [
      record.name,
      record.subtitle,
      record.address,
      record.city,
      record.state,
      record.notes,
    ]
      .join(' ')
      .toLowerCase(),
  };
}

export function sortRestaurants(restaurants: Restaurant[]) {
  return [...restaurants].sort((left, right) => right.score - left.score);
}

export function filterRestaurants(restaurants: Restaurant[], filters: RestaurantFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    const meetsScore =
      filters.minimumScore === null || restaurant.score >= filters.minimumScore;
    const matchesQuery =
      normalizedQuery.length === 0 || restaurant.searchableText.includes(normalizedQuery);

    return meetsScore && matchesQuery;
  });
}
